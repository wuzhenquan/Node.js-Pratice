const MongoClient = require('mongodb').MongoClient;
const settings = require('../settings')
const markdown = require('markdown').markdown

function Post(post) {
    this.name = post.name
    this.title = post.title
    this.post = post.post
}

module.exports = Post

// 发表博客
Post.prototype.save = function (callback) {
    const date = new Date()
    const time = {
        date: date,
        year: date.getFullYear(),
        month: `${date.getFullYear()}-${date.getMonth() + 1}`,
        day: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        minute: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}-${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`,
    }
    const post = {
        name: this.name,
        time: time,
        title: this.title,
        post: this.post
    }
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        collection.insert(post, (err, post) => {
            if (err) {
                return callback(err)
            }
            callback(null, post)
        })
        client.close()
    })
}

// 读取所有博客信息
Post.getAll = function (name, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = {}
        if (name) query.name = name
        collection.find(query).sort({ time: -1 }).toArray((err, posts) => {
            if (err) {
                return callback(err)
            }
            posts = posts.map(post => {
                post.post = markdown.toHTML(post.post)
                return post
            })
            callback(null, posts)
        })
        client.close()
    })
}

// 读取单条博客信息
Post.getOne = function (name, day, title, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = {
            name: name,
            "time.day": day,
            title: title
        }
        collection.findOne(query, null, (err, post) => {
            if (err) {
                return callback(err)
            }
            post.post = markdown.toHTML(post.post)
            callback(null, post)
        })
        client.close()
    })
}