#### 运行 redis-server
我将 redis 数据库 安装在了 `/Users/Spring/redis-4.0.10`
切换到该目录运行一下命令即可
`src/redis-server`
`src/redis-cli`

#### 测试
首先首次运行 redis-server 和 node app 启动漂流瓶服务器
然后运行 node init_redis 插入一些初始化数据 
最后运行 redis-cli，输入如下指令
```
KEYS *

HVALS [KEYs 返回的其中一个]
```

清空数据库
```
FLUSHALL
```