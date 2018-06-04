const express = require('express')
console.log('111')
const wsio = require('websocket.io')
console.log('222')

// const app = express.createServer()
// console.log('aaa')
// const ws = wsio.attach(app)
// console.log('bbb')

// app.use(express.static('public')) // 这是啥 记得要复习一下

// ws.on('connection',(socket)=>{
//     console.log('aaaaa')
//     socket.on('message', (msg)=>{
//         console.log('bbbbb')
//         console.log(`got ${msg}`)
//         socket.send('pong')
//     })
// })

// app.listen(3000)