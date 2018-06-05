window.onload = () => {
    const socket = io.connect()
    socket.on('connect', () => {
        // 通过 join 事件发送昵称
        socket.emit('join', prompt('what is your nickname?'))
        // 显示聊天窗口
        document.querySelector('#chat').style.display = 'block'

        socket.on('announcement',(msg)=>{
            const li = document.createElement('li')
            li.className = 'announctment'
            li.innerHTML = msg
            document.querySelector('#message').appendChild(li)
        })
    })
}