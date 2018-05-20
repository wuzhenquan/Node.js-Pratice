const net = require('net') // net 是 TCP 模块
let count = 0, users = {}
// 用 TCP 模块创建一个服务
const server = net.createServer((conn) => {
    let nickname
    // conn 对象是 net.Stream
    conn.write(
        `
        \n > welcome to node-chat
        \n > ${count} other people are connected at this time.
        \n > please write your name and press enter:
        `
    )
    count++
    conn.setEncoding('utf8')
    // 注册客户端穿数据过来的监听事件
    conn.on('data', (data) => {
        data = data.replace('\r\n', '') // 删除回车符
        // 接收到的第一份数据应当是用户输入的昵称
        if (!nickname) {
            if (users[data]) {
                conn.write(`${nickname} already in use. try again:`)
                return;
            } else {
                nickname = data
                users[nickname] = conn
                broadcast(`> ${nickname} joined the room \n`)
            }
        } else {
            // 否则 视为聊天信息
            broadcast(`${nickname} ${data} \n`)
        }
    })
    // 注册 close 事件检查客户端是否断ß开连接
    conn.on('close', () => {
        count--
        delete users[nickname]
        broadcast(`${nickname} left the room \n`, true)
    })
    // 发给用户的信息（包括加入聊天室，聊天信息，退出聊天）
    function broadcast(msg, exceptMyself) {
        for (let i in users) {
            if (!exceptMyself || i != nickname) {
                // users[i] 是 conn
                users[i].write(msg)
            }
        }
    }
})
// 监听 将服务器绑定到 3000 端口
server.listen(3000, () => {
    console.log('server listening on:3000')
})