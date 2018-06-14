module.exports = function (app) {
  app.get('/', (req, res) => {
    res.render('index', { title: 'Express' })
  })
  app.get('/reg', (req, res) => {
    res.render('reg', { title: 'register' })
  })
  app.get('/login', (req, res) => {
    res.render('login', { title: 'login' })
  })
  app.post('/login', (req, res) => {
  })
  app.get('/post', (req, res) => {
    res.render('post', { title: 'posts' })
  })
  app.post('/post', (req, res) => {
  })
  app.get('/logout', (req, res) => {
  })
}
