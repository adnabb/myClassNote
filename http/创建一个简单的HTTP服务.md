## 创建一个简单的HTTP服务

准备工具：nodejs

server.js
```js
const http = require('http');

const port = 8088;
const host = 'localhost';

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    res.end('Hello, World!\n');
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

启动：
```
node server
```