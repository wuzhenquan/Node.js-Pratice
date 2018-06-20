const crypto = require('crypto') // Node.js 的核心模块，用来生成散列值来加密密码
const User = require('../models/user')
const Post = require('../models/post')
const multer = require('multer')
const upload = multer({ dest: './public/images' })

// 登陆了才能 next()
function checkLogin(req, res, next) {
    if (!req.session.user) {
        req.flash('error', '未登录')
        res.redirect('/login')
    }
    next()
}

// 没登陆才能 next()
function checkNotLogin(req, res, next) {
    if (req.session.user) {
        req.flash('error', '已登录')
        res.redirect('back') // 返回之前的页面
    }
    next()
}

module.exports = function (app) {
    app.get('/', (req, res) => {
        Post.getAll(null, (err, posts) => {
            if (err) {
                posts = []
            }
            res.render('index', {
                title: 'home',
                user: req.session.user || null,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    app.get('/reg', checkNotLogin)
    app.get('/reg', (req, res) => {
        res.render('reg', {
            title: 'register',
            user: req.session.user || null,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    app.post('/reg', checkNotLogin)
    app.post('/reg', (req, res) => {
        let password = req.body.password
        const password_re = req.body['password-repeat']
        if (password != password_re) {
            req.flash('error', '两次输入的密码不一致')
            return res.redirect('/reg')
        }
        // 生成密码的 md5 值
        const md5 = crypto.createHash('md5')
        password = md5.update(req.body.password).digest('hex')
        const newUser = new User({
            name: req.body.name,
            password: password,
            email: req.body.email
        })
        // 检查用户名是否存在
        User.get(newUser.name, (err, users) => {
            if (err) {
                req.flash('error', err)
                return res.redirect('/')
            }
            if (users.length) {
                req.flash('error', '用户已存在')
                return res.redirect('/reg')
            }
            // 如果不存在则新增用户
            newUser.save((err, user) => {
                if (err) {
                    req.flash('error', err)
                    return res.redirect('/reg')
                }
                req.session.user = user // 用户信息存入 session
                req.flash('success', '注册成功')
                res.redirect('/')
            })
        })
    })
    app.get('/login', checkNotLogin)
    app.get('/login', (req, res) => {
        res.render('login', {
            title: 'login',
            user: null,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    app.post('/login', checkNotLogin)
    app.post('/login', (req, res) => {
        // 生成密码的 md5 值
        const md5 = crypto.createHash('md5')
        const password = md5.update(req.body.password).digest('hex')
        // 检查用户是否存在
        User.get(req.body.name, (err, users) => {
            const user = users[0]
            if (!user || user.length === 0) {
                req.flash('error', '用户不存在')
                return res.redirect('/login')
            }
            // 检查密码是否一致
            if (password !== user.password) {
                req.flash('error', '密码错误')
                return res.redirect('/login')
            }
            // 用户名密码都匹配后，将用户信息存入 session
            req.session.user = user
            req.flash('success', '登录成功')
            res.redirect('/')
        })
    })
    app.get('/post', checkLogin)
    app.get('/post', (req, res) => {
        res.render('post', {
            title: 'posts',
            user: req.session.user || null,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    app.post('/post', checkLogin)
    app.post('/post', (req, res) => {
        const currentUser = req.session.user
        const newPost = new Post({
            name: currentUser.name,
            title: req.body.title,
            post: req.body.post,
        })
        newPost.save((err, post) => {
            if (err) {
                req.flash('error', err)
                return res.redirect('/')
            }
            req.flash('success', '发布成功')
            res.redirect('/')
        })
    })
    app.get('/logout', checkLogin)
    app.get('/logout', (req, res) => {
        req.session.user = null
        req.flash('success', '登出成功')
        res.redirect('/')
    })
    app.get('/upload', checkLogin)
    app.get('/upload', (req, res) => {
        res.render('upload', {
            title: 'file upload',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        })
    })
    app.post('/upload', checkLogin)
    app.post('/upload', upload.array('file1'), (req, res) => {
        req.flash('success', '文件上传成功')
        res.redirect('/upload')
    })
    app.get('/u/:name', (req, res) => {
        // 检查用户是否存在
        console.log(req.params,'req.params')
        User.get(req.params.name, (err, users) => {
            const user = users[0]
            if (!user || user.length === 0) {
                req.flash('error', '用户不存在')
                return res.redirect('/')
            }
            // 查询并返回该用户的所有文章
            Post.getAll(user.name, (err, posts)=>{
                if(err){
                    req.flash('error', err)
                    return res.redirect('/')
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    user: req.session.user,
                    success: req.flash('success').toString(),
                    error: req.flash('error').toString()
                })
            })
        })
    })
    app.get('/u/:name/:day/:title', (req, res) => {
        Post.getOne(req.params.name, req.params.day, req.params.title, (err, post)=>{
            if(err){
                req.flash('error', err)
                return res.redirect('/')
            }
            res.render('article', {
                title: req.params.title,
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    app.get('/edit/:name/:day/:title', checkLogin)
    app.get('/edit/:name/:day/:title', (req, res) => {
        const currentUser = req.session.user
        Post.edit(currentUser.name, req.params.day, req.params.title, (err, post)=>{
            if(err){
                req.flash('error', err)
                return res.redirect('back')
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            })
        })
    })
    app.post('/edit/:name/:day/:title', checkLogin)
    app.post('/edit/:name/:day/:title', (req, res) => {
        const currentUser = req.session.user
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, (err, post)=>{
            const url = encodeURI(`/u/${req.params.name}/${req.params.day}/${req.params.title}`)
            if(err){
                req.flash('error', err)
                return res.redirect(url)
            }
            req.flash('success', '修改成功')
            res.redirect(url)
        })
    })
}
