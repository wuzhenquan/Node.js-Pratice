CLI 的一些 API

- process.argv
- process.cwd() process.chdir() 
- process.exit(1)
- process.on('SIGKILL',()=>{//信号已收到})
- fs.createReadStream()
- fs.watchFile
- fs.watch

创建 server 的方式
- require('net').createServer((conn)=>{})
- require('http').createServer((req, res) => {})
- require('connect').createServer()
