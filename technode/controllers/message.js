var db = require('../models')

exports.create = function (messageObj, callback) {
    var message = new db.Message(messageObj)
    message.save(callback)
}

exports.read = function (room, callback) {
    db.Message.find({_roomId: room.id}, null, {
        sort: {
            'createAt': -1
        },
        limit: 20
    }, callback)
}