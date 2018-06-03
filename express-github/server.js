const express = require('express')
const search = require('./search')

const app = express()

// https://expressjs.com/en/guide/using-template-engines.html
app.set('view engine', 'ejs') // 将 ejs 指定为视图引擎
app.set('views', __dirname + '/views')

// 定义路由 这样就无须手动地每次去检查 method 和 url 属性
// 初始化模板引擎，读取视图文件并将其提供给模板引擎，获取解析后的 HTML 页面并作为响应发送给客户端
app.get('/', (req, res) => { res.render('index') })
app.get('/search', (req, res, next) => {
    search(req.query.q, (err, repositories) => {
        if (err) return next(err)
        res.render('search', { results: repositories, search: req.query.q })
    })
})

app.listen(3000)