const MongoClient = require('mongodb').MongoClient;
const settings = require('../settings')
const markdown = require('markdown').markdown

function Post(post) {
    this.name = post.name
    this.title = post.title
    this.tags = post.tags
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
        minute: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`,
    }
    const post = {
        name: this.name,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        comments: []
    }
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        collection.insert(post, (err, post) => {
            if (err) {
                return callback(err)
            }
            callback(null, post)
            client.close()
        })
    })
}

// 读取所有博客信息
Post.getTen = function (name, page, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = {}
        if (name) query.name = name
        // 使用 count 返回特定查询的文档数
        collection.count(query, (err, total) => {
            // 根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
            collection.find(query, {
                skip: (page - 1) * 10,
                limit: 10
            }).sort({ time: -1 }).toArray((err, posts) => {
                if (err) {
                    return callback(err)
                }
                posts = posts.map(post => {
                    post.post = markdown.toHTML(post.post)
                    return post
                })
                callback(null, posts, total)
            })
            client.close() // 这一句一定不要放在外边，会出问题的。
        })
    })
}

// 读取单条博客信息(HTML 格式)
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
            if (post) {
                post.post = markdown.toHTML(post.post)
                post.comments.forEach(comment => {
                    comment.content = markdown.toHTML(comment.content)
                });
            }
            callback(null, post)
            client.close()
        })
    })
}

// 读取单条博客信息(MarkDown 格式)
Post.edit = function (name, day, title, callback) {
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
            callback(null, post)
            client.close()
        })
    })
}

// 更新文章
Post.update = function (name, day, title, post, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = {
            name: name,
            "time.day": day,
            title: title
        }
        collection.update(query, { $set: { post: post } }, (err, post) => {
            if (err) {
                return callback(err)
            }
            callback(null, post)
            client.close()
        })
    })
}

// 删除文章
Post.remove = function (name, day, title, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = {
            name: name,
            "time.day": day,
            title: title
        }
        collection.remove(query, { w: 1 }, (err) => {
            if (err) {
                return callback(err)
            }
            callback(null)
            client.close()
        })
    })
}

// 返回所有文章存档信息
Post.getArchive = function (callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        collection.find({}, {
            name: 1,
            time: 1,
            title: 1
        }).sort({ time: -1 }).toArray((err, posts) => {
            if (err) {
                return callback(err)
            }
            callback(null, posts);
        })
        client.close()
    })
}

// 返回所有标签
Post.getTags = function (callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        // distinct 用来找出给定键的所有不同价值
        collection.distinct('tags', (err, tags) => {
            if (err) {
                return callback(err)
            }
            callback(null, tags)
        })
        client.close()
    })
}

// 返回含有特点标签的所有文章
Post.getTag = function (tag, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = { tags: tag }
        collection.find(query, {
            name: 1,
            time: 1,
            title: 1
        }).sort({ time: -1 }).toArray((err, posts) => {
            if (err) {
                return callback(err)
            }
            callback(null, posts);
        })
        client.close()
    })
}