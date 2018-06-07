window.onload = () => {
    const socket = io.connect()
    socket.on('connect', () => {
        socket.emit('join', prompt('what is your nickname?')) // 通过 join 事件发送昵称
        document.querySelector('#chat').style.display = 'block' // 显示聊天窗口
        socket.on('announcement', (msg) => {
            const li = document.createElement('li')
            li.className = 'announctment'
            li.innerHTML = msg
            document.querySelector('#messages').appendChild(li)
        })
    })

    // 将接收到的信息加载在页面上
    function addMessage(from, text) {
        var li = document.createElement('li')
        li.className = 'message'
        li.innerHTML = `<b>${from}</b>: ${text}`
        document.querySelector('#messages').appendChild(li)
        return li
    }

    const input = document.querySelector('#input')
    document.querySelector('#button').onclick = function () {
        const li = addMessage('me', input.value)
        socket.emit('text', input.value, (date) => {
            li.className = 'confirmed'
            li.title = date
        }) // 发送消息

        // 重置输入框
        input.value = ''
        input.focus()

        return false
    }

    socket.on('text', addMessage) // 接受服务端发送过来的消息
}