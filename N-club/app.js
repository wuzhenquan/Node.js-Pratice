var app = require('koa')();
var logger = require('koa-logger');
var bodyparser = require('koa-bodyparser'); // 请求解析体中间件
var staticCache = require('koa-static-cache');// 静态文件缓存中间件
var errorhandler = require('koa-errorhandler');
var session = require('koa-generic-session');// 通用的 session 中间件，可结合 MongoDB，Redis 等使用
var MongoStore = require('koa-generic-session-mongo');// 结合 koa-generic-session，将 session 存储到 MongoDB 中间件
var flash = require('koa-flash');
var gzip = require('koa-gzip');
var scheme = require('koa-scheme');
var router = require('koa-frouter');
var routerCache = require('koa-router-cache');
var render = require('co-ejs');
var config = require('config-lite');

// 不放到 default.js 是为了避免循环依赖
var merge = require('merge-descriptors');// 
var core = require('./lib/core'); // 核心文件 将它与模板中自定义的 locals 合并作为 co-ejs 渲染时的本地变量
var renderConf = require(config.renderConf);
merge(renderConf.locals || {}, core, false);

app.keys = [renderConf.locals.$app.name];
// 中间件的加载顺序十分重要
app.use(errorhandler());// 需要放到最上面，才能捕获下游抛出的错误
app.use(bodyparser());
app.use(staticCache(config.staticCacheConf));
app.use(logger());
app.use(session({
    store: new MongoStore(config.mongodb)
}));
app.use(flash()); // flash 中间件需要放到 session 中间件之后
app.use(scheme(config.schemeConf)); // scheme 需要放到 routerCache 
app.use(routerCache(app, config.routerCacheConf)); // routerCache 需要放到 router 前面
app.use(gzip()); // gzip 要放到 routerCache 之后
app.use(render(app, renderConf));
app.use(router(app, config.routerConf));

if (module.parent) {
    module.exports = app.callback();
} else {
    app.listen(config.port, function () {
        console.log('Server listening on: ', config.port);
    });
}