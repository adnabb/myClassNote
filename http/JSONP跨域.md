# JSONP跨域

众所周知，jsonp跨域的实质就是加入了一个新的script标签，那我们下面开始实现一下这个简单的请求。

![4.png](https://www.imageoss.com/images/2019/12/20/4.png)

**特别的，jsonp请求需要在允许jsonp请求的接口返回一个callback方法（也可以是其他的命名，需要约定好），否则无法实现。**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>JSONP跨域</title>
</head>
<body>
    Hi，JSONP跨域了吗？<span id="answer"></span>
</body>
<!-- 这里定义了需要返回的callback -->
<script>
    const span = document.getElementById('answer');
    const callback = function(data) {
        if (data.result) {
            span.innerText = true;
        } else {
            span.innerText = false;
        }
    }
</script>
<!-- jsonp本质 -->
<!-- <script src="http://localhost:8088"></script> -->
<script>
    const script = document.createElement('script');
    script.src = 'http://localhost:8088';
    document.head.appendChild(script);
</script>
</html>
```

server.js（启动html.js的服务）

```js
const http = require('http');
const fs = require('fs');

const port = 80;
const host = 'localhost';

const htmlFile = fs.readFileSync('test.html', 'utf8');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/html');
    res.end(htmlFile);
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

server2.js（需要跨域请求的服务）

```js
const http = require('http');
const fs = require('fs');

const port = 8088;
const host = 'localhost';

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/html',
    })
    res.end(fs.readFileSync('jsonp.js'));
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

重中之重！！！！！！！！！！！！
**server2读取的jsonp.js文件**
```js
callback({result: true});
```
