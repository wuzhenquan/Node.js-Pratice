// 自己写的一个中间价
module.exports = (opts) => {
    let time = opts.time || 100
    return (req, res, next) => {
        let timer = setTimeout(() => {
            console.log(
                'taking too long'
                , req.method
                , req.url
            )
        }, time);
        let end = res.end
        res.end = function (chunk, encoding) {
            res.end = end
            res.end(chunk, encoding)
            clearTimeout(timer)
        }
        next()
    }
}