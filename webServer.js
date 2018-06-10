require('http').createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' }) // 指定一个头信息
    res.end('<h1>Hello World</h1>')
}).listen(3000)
