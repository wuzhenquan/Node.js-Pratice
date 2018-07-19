var db = require('../models')

exports.create = function (messageObj, callback) {
    var message = new db.Message()
    message.content = messageObj.content
    message.creator = messageObj.creator
    message.save(callback)
}

exports.read = function (callback) {
    db.Message.find({}, null, {
        sort: {
            'createAt': -1
        },
        limit: 20
    }, callback)
}