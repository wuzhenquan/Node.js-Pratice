const MongoClient = require('mongodb').MongoClient;
const settings = require('../settings')

function Comment(name, day, title, comment) {
    this.name = name
    this.day = day
    this.title = title
    this.comment = comment
}

module.exports = Comment

Comment.prototype.save = function (callback) {
    const name = this.name
    const day = this.day
    const title = this.title
    const comment = this.comment

    MongoClient.connect(settings.url, (err, client) => {
        const db = client.db(settings.db)
        const collection = db.collection('posts')
        const query = {
            name: name,
            "time.day": day,
            title: title
        }
        collection.update(query, { $push: { comments: comment } }, (err, post) => {
            if (err) {
                return callback(err)
            }
            callback(null, post)
        })
        client.close()
    })
}