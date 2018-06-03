const request = require('superagent') // https://www.npmjs.com/package/superagent

module.exports = (query, callback)=>{
    request.get('https://api.github.com/search/repositories')
    .query({q:query})
    .end((err, res)=>{
        if(res.body && Array.isArray(res.body.items)){
            return callback(null, res.body.items)
        }else{
            callback(new Error('Bad twitter response'))
        }
    })
}