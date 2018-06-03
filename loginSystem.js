const http = require('http')
const connect = require('connect') // https://github.com/senchalabs/connect
const morgan = require('morgan') // https://www.npmjs.com/package/morgan
const bodyParser = require('body-parser') // https://www.npmjs.com/package/body-parser
const cookieParser = require('cookie-parser') // https://www.npmjs.com/package/cookie-parser
const cookieSession = require('cookie-session') // https://www.npmjs.com/package/cookie-session

const users = { "tobi": { "password": "ferret", "name": "Tobi Holowaychuk" } }
const app = connect()
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true })) // 解析查询字符串为对象的格式
app.use(cookieParser())
app.use(cookieSession({ secret: 'my app secret' }))

// 中间件：检查用户是否登陆
app.use((req, res, next) => {
    if (req.url == '/' && req.session.logged_in) {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`Welcome back,<b>${req.session.name}</b>.<a href="/logout">Logout</a>`)
    } else {
        next()
    }
})

// 中间件：展示登陆菜单
app.use((req, res, next) => {
    if (req.url == '/' && req.method == 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(
            ['<form action="/login" method="POST">',
                '<fieldset>',
                '<legend>Please log in</legend>',
                '<p>User: <input type="text" name="user"></p>',
                '<p>Password: <input type="password" name="password"</p>',
                '<button>Submit</button>',
                '</fieldset>',
                '</form>'].join('')
        )
    } else {
        next()
    }
})

// 中间件：检查登陆表单信息是否与用户凭证匹配
app.use((req, res, next) => {
    if (req.url == '/login' && req.method == 'POST') {
        res.writeHead(200)
        if (!users[req.body.user] || req.body.password !== users[req.body.user].password) {
            res.end('Bad username/password')
        } else {
            req.session.logged_in = true
            req.session.name = users[req.body.user].name
            res.end('Authenticated!')
        }
    } else {
        next()
    }
})

// 中间件：处理登出
app.use((req, res, next) => {
    if (req.url == '/logout') {
        req.session.logged_in = false
        res.writeHead(200)
        res.end('Logged out')
    } else {
        next()
    }
})

http.createServer(app).listen(3000)