const MongoClient = require('mongodb').MongoClient;
const settings = require('../settings')

// 这里定义的 User 是一个描述数据的对象，即 MVC 架构中的模型。
// 与视图和控制器不同，模型是真正与数据打交道的工具。
function User(user) {
    this.name = user.name
    this.password = user.password
    this.email = user.email
}

module.exports = User;

// 存储用户信息（注意这里不能用箭头函数哦，仔细想想为什么）
User.prototype.save = function (callback) {
    // 要存入数据库的用户文档
    var user = {
        name: this.name,
        password: this.password,
        email: this.email
    }

    // 连接数据库
    MongoClient.connect(settings.url, function (err, client) {
        const db = client.db(settings.db);
        const collection = db.collection('users');
        collection.insertMany([user], (err, users) => {
            if (err) {
                return callback(err)
            }
            callback(null, users[0])
        })
        client.close();
    });
}

// 读取用户信息
User.get = function (name, callback) {
    // 连接数据库
    MongoClient.connect(settings.url, function (err, client) {
        const db = client.db(settings.db);
        // 读取 users 集合
        const collection = db.collection('users');
        collection.find({ name }).toArray((err, users) => {
            if (err) {
                return callback(err)
            }
            callback(null, users)
        })
        client.close();
    });
}