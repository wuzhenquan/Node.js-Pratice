const express = require('express')
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const bodyParser = require('body-parser')

server.listen(3000)

app.use(bodyParser.urlencoded({ extended: true })) // 解析查询字符串为对象的格式
app.use(express.static('public'))

io.sockets.on('connection', (socket) => {
    // 监听 join 事件
    socket.on('join', (name) => {
        socket.nickname = name;
        // 注意 socket.broadcast.emit 和 socket.emit 的区别
        socket.broadcast.emit('announcement', name + 'joined the chat.')
    })

    // 接受客户端发来的消息
    socket.on('text', function (msg) {
        socket.broadcast.emit('text', socket.nickname, msg) // 发送消息到客户端
    })
})
