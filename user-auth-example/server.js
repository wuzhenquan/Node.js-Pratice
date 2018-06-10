const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session') // https://www.npmjs.com/package/cookie-session

const app = express()

app.listen(3000)

app.use(bodyParser.urlencoded({ extended: true })) // 解析查询字符串为对象的格式
app.use(cookieParser())
app.use(cookieSession({ secret: 'my app secret' }))

app.set('view engine', 'jade')



mongoose.connect('mongodb://127.0.0.1/my-website')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error'))
db.once('open', () => { console.log('we are connected') })

const Schema = mongoose.Schema
const User = mongoose.model('User', new Schema({
    first: String,
    last: String,
    email: { type: String, unique: true },
    password: { type: String, unique: true },
}))


app.use((req, res, next) => {
    if (req.session.loggedIn) {
        res.locals.authenticated = true
        User.findById(req.session.loggedIn, (err, doc) => {
            if (err) return next(err)
            res.locals.me = doc
            next()
        })
    } else {
        res.locals.authenticated = false
        next()
    }
})

app.get('/', (req, res) => {
    let authenticated = false;
    let me = res.locals.me || {}
    if (req.session.loggedIn) authenticated = true
    res.render('index', { authenticated, me })
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/login/:signupEmail', (req, res) => {
    res.render('login', { signupEmail: req.params.signupEmail })
})
app.get('/logout', (req, res) => {
    req.session.loggedIn = null
    res.redirect('/')
})
app.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.user.email, password: req.body.user.password }, (err, doc) => {
        if (err) return next(err)
        if (!doc) return res.send('<p>User nod found. Go back and try again</p>')
        req.session.loggedIn = doc._id.toString()
        res.redirect('/')
    })
})
app.post('/signup', (req, res, next) => {
    var user = new User(req.body.user).save((err) => {
        if (err) return next(err)
        res.redirect('/login/' + req.body.user.email)
    })
})



