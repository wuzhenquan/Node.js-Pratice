const express = require('express')
const mongodb = require('mongodb')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session') // https://www.npmjs.com/package/cookie-session

const app = express()

app.listen(3000)

app.use(bodyParser.urlencoded({ extended: true })) // 解析查询字符串为对象的格式
app.use(cookieParser())
app.use(cookieSession({ secret: 'my app secret' }))

app.set('view engine', 'jade')

app.get('/', (req, res) => {
    res.render('index', { authenticated: false })
})
app.get('/signup', (req, res) => {
    res.render('login')
})
app.get('/login', (req, res) => {
    res.render('signup')
})

