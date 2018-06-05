const express = require('express')
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
server.listen(3000)
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true })) // 解析查询字符串为对象的格式
app.use(express.static('public'))
io.sockets.on('connection', (socket) => {
    console.log('Someone connected')
    // 监听 join 事件
    socket.on('join', (name) => {
        socket.nickname = name;
        socket.broadcast.emit('announcement', name + 'joined the chat.')
    })
})
