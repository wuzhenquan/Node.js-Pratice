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
                res.json(user)
            }
        })
    } else {
        res.status(403)
    }
})
app.get('/api/logout', function (req, res) {
    req.session._userId = null
    res.status(401).json(null)
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
    socket.on('messages.read', function () {
        socket.emit('messages.read', messages)
    })
    socket.on('messages.create', function (message) {
        messages.push(message)
        io.sockets.emit('messages.add', message)
    })
})
