var redis = require('redis');
var client = redis.createClient(); // 默认监听 127.0.0.1:6379

// 扔一个漂流瓶
exports.throw = function (bottle, callback) {
    bottle.time = bottle.time || Date.now();
    // 为每个漂流瓶随机生成一个 id
    var bottleId = Math.random().toString(16);
    var type = { male: 0, female: 1 };
    // 根据漂流瓶类型的不同将漂流瓶保存到不同的数据库
    // 把 type 不同的瓶子放到不同的数据库中是为了方便使用 Redis 的 RANDOMKEY 命令
    // RANDOMKEY 命令用于随机返回当前数据库的一个键，不能加任何条件
    client.SELECT(type[bottle.type], function () {
        // 以 hash 类型保存漂流瓶对象
        // HMSET 命令可以同时将多个键值对设置到哈希表中
        client.HMSET(bottleId, bottle, function (err, result) {
            if (err) {
                return callback({ code: 0, msg: '过会再试试吧！' });
            }
            // 返回结果，成功时返回 OK
            callback({ code: 1, msg: result });
            // 设置漂流瓶生存期为 1 天
            // EXPIRE 命令可以设置某个键的生成时间，这也是选择 Redis 的主要原因
            client.EXPIRE(bottleId, 86400);
        })
    })
}

// 捡一个漂流瓶
exports.pick = function (info, callback) {
    var type = { all: Math.round(Math.random()), male: 0, female: 0 };
    info.type = info.type || 'all';
    // 根据请求的瓶子类型到不同的数据库中取
    client.SELECT(type[info.type], function (err, bottle) {
        // 随机返回一个漂流瓶 id
        client.RANDOMKEY(function (err, bottleId) {
            if (!bottleId) {
                return callback({ code: 0, msg: "大海空空如也.." });
            }
            // 根据漂流瓶 id 取到漂流瓶完整信息
            // HGETALL 命令用于返回哈希表中所有的键和值
            client.HGETALL(bottleId, function (err, bottle) {
                if (err) {
                    return callback({ code: 0, msg: '漂流瓶破损了...' })
                }
                // 返回结果，成功时包含捡到的漂流瓶信息
                callback({ code: 1, msg: bottle });
                // 从 Redis 中删除该漂流瓶
                client.DEL(bottleId);
            })
        })
    })
}
