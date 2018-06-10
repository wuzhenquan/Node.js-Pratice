let qs = require('querystring')

let search = process.argv.slice(2).join(' ').trim()

if (!search.length) {
    console.log('Usage: node tweets <search term>\n')
} else {
    console.log(`searching for: ${search}`)

    require('http').request({ 
        host: 'search.twitter.com',
        // port: 80,
        path: `/search.json?${qs.stringify({ q: search })}`,
    }, (res) => {
        let body = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
            body += chunk
        })
        res.on('end', () => {
            let obj = JSON.parse(body)
            obj.results.forEach(tweet => {
                console.log(tweet.text)
                console.log(tweet.form_user)
                console.log('--')
            });
        })
    }).end()
}
