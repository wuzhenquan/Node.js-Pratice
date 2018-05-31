const http = require('http')
const connect = require('connect') // https://github.com/senchalabs/connect
const morgan = require('morgan') // https://www.npmjs.com/package/morgan
const time = require('./requestTime.js') // 自己写的一个中间件

const app = connect()
app.use(morgan('dev'))
app.use(time({ timer: 500 }))
app.use((req, res, next) => {
    if (req.url == '/a') {
        res.writeHead(200)
        res.end('Fast')
    } else {
        next()
    }
})
app.use((req, res, next) => {
    if (req.url == '/b') {
        setTimeout(() => {
            res.writeHead(200)
            res.end('Slow')
        }, 1000)
    } else {
        res.end('index');
    }
})
http.createServer(app).listen(3000)