const http = require('http')
const connect = require('connect') // https://github.com/senchalabs/connect
const morgan = require('morgan') // https://www.npmjs.com/package/morgan

// 自己写的一个中间件
const time = (opts) => {
    let time = opts.time || 100
    return (req, res, next) => {
        let timer = setTimeout(() => {
            console.log(
                'taking too long'
                , req.method
                , req.url
            )
        }, time);
        let end = res.end
        res.end = function (chunk, encoding) {
            res.end = end
            res.end(chunk, encoding)
            clearTimeout(timer)
        }
        next()
    }
} 

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