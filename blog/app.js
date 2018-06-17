const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser') // Using express-sessions with express 4, cookieParser is no longer required.
const logger = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const routes = require('./routes/index')
const settings = require('./settings')
const flash = require('connect-flash') // 源码才 32 行

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db, // cookie name
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, // 30 days
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        db: settings.db,
        host: settings.host,
        port: settings.port,
        url: settings.url,
    })
}))
app.use(flash())
routes(app)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
