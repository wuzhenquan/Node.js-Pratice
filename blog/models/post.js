const MongoClient = require('mongodb').MongoClient;
const settings = require('../settings')
const markdown = require('markdown').markdown

function Post(post) {
    this.name = post.name
    this.head = post.head
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
        head: this.head,
        time: time,
        title: this.title,
        tags: this.tags,
        post: this.post,
        comments: [],
        reprint_info: {},
        pv: 0
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

// 获取一篇文章
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
                // 每访问一次，pv 值增加 1
                collection.update({
                    name: name,
                    "time.day": day,
                    title: title
                }, { $inc: { pv: 1 } }, (err) => {
                    if (err) {
                        return callback(err)
                    }
                })
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

        // 要删除一篇转载来的文章时， 还要将被转载的原文章所在的文档的 reprint_to 删除遗留的转载信息
        // 查询要删除的文档
        collection.findOne({
            name: name,
            "time.day": day,
            title: title
        }, (err, post)=>{
            if (err) {
                return callback(err)
            }
            // 如果有 print_from(文章转载的)，先保存下来 reprint_from
            let reprint_from = ''
            if(post.reprint_info.reprint_from){
                reprint_from = post.reprint_info.reprint_from
            }
            if(reprint_from != ''){
                // 更新原文章所在文档的 reprint_to
                collection.update({
                    name: reprint_from.name,
                    "time.day": reprint_from.day,
                    title: reprint_from.title
                },{
                    $pull: {
                        'reprint_info.reprint_to': {
                            name: name,
                            day: day,
                            title: title
                        }
                    }
                })
            }

            client.close()
        })

        // 删除文章
        collection.remove({
            name: name,
            "time.day": day,
            title: title
        }, { w: 1 }, (err) => {
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

// 返回通过标题关键字查询的所有文章信息
Post.search = function (keyword, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = { title: new RegExp(keyword, "i") } // 正则匹配
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

// 转载一篇文章
Post.reprint = function (reprint_from, reprint_to, callback) {
    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        // 找到被转载的文章的原文档
        collection.findOne({
            name: reprint_from.name,
            "time.day": reprint_from.day,
            title: reprint_from.title,
        }, (err, post) => {
            if (err) {
                client.close()
                return callback(err)
            }
            const date = new Date();
            const time = {
                date: date,
                year: date.getFullYear(),
                month: `${date.getFullYear()}-${date.getMonth() + 1}`,
                day: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
                minute: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`,
            }

            delete post._id // 注意要删掉原来的 _id

            post.name = reprint_to.name
            post.head = reprint_to.head
            post.time = time
            post.title = (post.title.search(/[转载]/) > -1) ? post.title : `[转载]${post.title}`
            post.comments = []
            post.reprint_info = { reprint_from }
            post.pv = 0

            // 更新被转载的原文档的 reprint_info 内的 reprint_to 
            collection.update(
                {
                    name: reprint_from.name,
                    "time.day": reprint_from.day,
                    title: reprint_from.title,
                }, {
                    $push: {
                        "reprint_info.reprint_to": {
                            name: post.name,
                            day: time.day,
                            title: post.title
                        }
                    }
                }, (err) => {
                    if (err) {
                        client.close()
                        return callback(err)
                    }
                }
            )

            // 将转载生成的副本修改后存入数据库， 并返回存储后的文档
            collection.insert(post, {
                safe: true,
            }, (err, post)=>{
                client.close()
                if(err){
                    return callback(err)
                }
                callback(null, post.ops[0])
            })
        })
    })
}