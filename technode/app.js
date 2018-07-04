const express = require('express')
const app = express()
const path = require('path')

const port = process.env.PORT || 3000

// 与通常的 Express 项目一样， 我们将静态文件放在 static 目录下。
// 在 static 目录下还会放 index.html 文件作为整个应用的启动页面。
// 除了静态文件的请求外，其他所有的 HTTP 请求都会输出 index.html 文件，
// 服务端不关心路由，所有的路由都交给在浏览器端的 JS 去处理
app.use(express.static(path.join(__dirname, '/static')))
app.use((req, res) => {
    res.sendFile(path.join(__dirname, './static/html'))
})

// 在服务端增加 Socket 服务
const server = app.listen(port, () => {
    console.log(`technode is on port ${port}`)
})
const io = require('socket.io').listen(server)
io.sockets.on('connection', (socket) => {
    socket.emit('connected')
})
