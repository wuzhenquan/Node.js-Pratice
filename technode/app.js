var express = require('express')
var app = express()
var path = require('path')
var port = process.env.PORT || 3000
var bodyParser = require('body-parser')
var cookieParse = require('cookie-parser')
var session = require('express-session')
var Controllers = require('./controllers')
var logger = require('morgan')
var signedCookieParser = cookieParse('technode')
var MongoStore = require('connect-mongo')(session)
var sessionStore = new MongoStore({
    url: 'mongodb://localhost/technode'
})
var async = require('async')
var ObjectId = require('mongoose').Types.ObjectId


app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParse())
app.use(session({
    secret: 'technode',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, // 30 days
    store: sessionStore
}))
// 与通常的 Express 项目一样， 我们将静态文件放在 static 目录下。
// 在 static 目录下还会放 index.html 文件作为整个应用的启动页面。
// 除了静态文件的请求外，其他所有的 HTTP 请求都会输出 index.html 文件，
// 服务端不关心路由，所有的路由都交给在浏览器端的 JS 去处理
app.use(express.static(path.join(__dirname, '/static')))
app.get('/api/validate', function (req, res) {
    var _userId = req.session.userId;
    if (_userId) {
        Controllers.User.findUserById(_userId, function (err, user) {
            if (err) {
                res.status(401).json({ msg: err }) // 新的 api 是这样的，res.status(500).json({ error: 'message' }); https://expressjs.com/en/api.html 看看要不要改
            } else {
                res.json(user)
            }
        })
    } else {
        res.status(401).json(null)
    }
})
app.post('/api/login', function (req, res) {
    var email = req.body.email
    if (email) {
        Controllers.User.findByEmailOrCreate(email, function (err, user) {
            if (err) {
                res.status(500).json({ msg: err })
            } else {
                req.session._userId = user._id
                Controllers.User.online(user._id, function (err, user) {
                    if (err) {
                        res.json(500, { msg: err })
                    } else {
                        res.json(user)
                    }
                })
            }
        })
    } else {
        res.status(403)
    }
})
app.get('/api/logout', function (req, res) {
    var _userId = req.session._userId
    Controllers.User.offline(_userId, function (err, user) {
        if (err) {
            res.json(500, { msg: err })
        } else {
            res.json(200)
            delete req.session._userId
        }
    })
})
app.use((req, res) => {
    res.sendFile(path.join(__dirname, './static/index.html'))
})
const server = app.listen(port, () => {
    console.log(`technode is on port ${port}`)
})

// 在服务端增加 Socket 服务
var io = require('socket.io').listen(server)

io.set('authorization', function (handshakeData, accept) {
    signedCookieParser(handshakeData, {}, function (err) {
        if (err) {
            accept(err, false)
        } else {
            sessionStore.get(handshakeData.signedCookies['connect.sid'], function (err, session) {
                if (err) {
                    accept(err.message, false)
                } else {
                    handshakeData.session = session
                    if (session._userId) {
                        accept(null, true)
                    } else {
                        accept('No login')
                    }
                }
            })
        }
    })
})
var messages = []
io.sockets.on('connection', function (socket) {
    var _userId = socket.request.session._userId
    Controllers.User.online(_userId, function (err, user) {
        if (err) {
            socket.emit('err', { mesg: err })
        } else {
            if(user._roomId){
                socket.join(user._roomId)
                socket.in(user._roomId).broadcast.emit('joinRoom', user)
                socket.in(user._roomId).broadcast.emit('messages.add', {
                    content: user.name + '进入了聊天室',
                    creator: { name: 'SYSTEM' },
                    createAt: new Date(),
                    _id: ObjectId()
                })
            }
        }
    })
    socket.on('messages.create', function (message) {
        Controllers.Message.create(message, function (err, message) {
            if (err) {
                socket.emit('err', {
                    msa: err
                })
            } else {
                socket.in(message._roomId).broadcast.emit('messages.add', message)
                socket.emit('messages.add', message)
            }
        })
    })

    socket.on('getRoom', function (room) {
        async.parallel([
            function (done) {
                Controllers.User.getOnlineUsers(done)
            },
            function (done) {
                Controllers.Message.read(room, done)
            }
        ],
            function (err, results) {
                if (err) {
                    socket.emit('err', {
                        msg: err
                    })
                } else {
                    socket.emit('roomData', {
                        users: results[0],
                        messages: results[1],
                        _id: room._roomId
                    })
                }
            });
    })
    socket.on('createRoom', function (room) {
        Controllers.Room.create(room, function (err, room) {
            if (err) {
                socket.emit('err', {
                    msg: err
                })
            } else {
                io.sockets.emit('roomAdded', room)
            }
        })
    })
    socket.on('getAllRooms', function (data) {
        if (data && data._roomId) {
            Controllers.Room.getById(data._roomId, function (err, room) {
                if (err) {
                    socket.emit('err', {
                        msg: err
                    })
                } else {
                    socket.emit('roomData.' + data._roomId, room)
                }
            })
        } else {
            Controllers.Room.read(function (err, rooms) {
                if (err) {
                    socket.name('err', {
                        msg: err
                    })
                } else {
                    socket.emit('roomsData', rooms)
                }
            })
        }
    })
    socket.on('disconnect', function () {
        Controllers.User.offline(_userId, function (err, user) {
            if (err) {
                socket.emit('err', { msg: err })
            } else {
                if (user._roomId) {
                    socket.in(user._roomId).broadcast.emit('leaveRoom', user)
                    socket.in(user._roomId).broadcast.emit('messages.add', {
                        content: user.name + '离开了聊天室',
                        creator: { name: 'SYSTEM' },
                        createAt: new Date(),
                        _id: ObjectId()
                    })
                }
                Controllers.User.leaveRoom({
                    user: user
                }, function () { })
            }
        })
    })
    socket.on('joinRoom', function (join) {
        Controllers.User.joinRoom(join, function (err) {
            if (err) {
                socket.emit('err', {
                    msg: err
                })
            } else {
                socket.join(join.room._id) // 将当前的 socket 加入到一个键值为 join.room._id 的房间中
                socket.emit('joinRoom.' + join.user._id, join) // 通知客户端加入成功
                socket.in(join.room._id).broadcast.emit('messages.add', {
                    content: join.user.name + '进入了聊天室',
                    creator: { name: 'SYSTEM' },
                    createAt: new Date(),
                    _id: ObjectId()
                })
                socket.in(join.room._id).broadcast.emit('joinRoom', join)
            }
        })
    })
    socket.on('leaveRoom', function (leave) {
        Controllers.User.leaveRoom(leave, function (err) {
            if (err) {
                socket.emit('err', {
                    msg: err
                })
            } else {
                socket.in(leave.room._id).broadcast.emit('messages.add', {
                    content: leave.user.name + '离开了聊天室',
                    creator: { name: 'SYSTEM' },
                    createAt: new Date(),
                    _id: ObjectId()
                })
                socket.leave(leave.room._id)
                io.sockets.emit('leaveRoom', leave)
            }
        })
    })
})
