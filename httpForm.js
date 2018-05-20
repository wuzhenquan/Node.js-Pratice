let qs = require('querystring') // 将查询字符串转化成对象的模块
require('http').createServer((req, res) => {
    if (req.url == '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end([
            '<form method="POST" action="/url" >',
            '<h1>My form</h1>',
            '<fieldset>',
            '<label>Personal information</label>',
            '<p>What is your name?</p>',
            '<input type="text" name="name"/>',
            '<p><button>Submit</button></p>',
            '</fieldset>',
            '</form>'
        ].join(''))
    } else if (req.url == '/url' && req.method == 'POST') {
        let body = ''
        // 监听数据是否发过来，逐块接受数据
        req.on('data', (chunk) => {
            body += chunk
        })
        // 监听请求是否结束，结束后响应
        req.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(`<p>You name is <b>${qs.parse(body).name}</b></p>`)
        })
    }else{
        res.writeHead(404)
        res.end('404 Not Found')
    }
}).listen(3000);