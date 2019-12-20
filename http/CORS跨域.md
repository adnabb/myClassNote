# 实现CORS跨域

![cors.png](https://www.imageoss.com/images/2019/12/20/cors.png)

实现CORS跨域的方法大同小异，这里后端采用较为容易入手的nodejs来处理，下面上代码。

使用工具：win7、nodejs

前端采用了fetch来进行请求，如果请求成功，页面会回复 “Hi，CORS跨域了吗？”为 true。

[![html1.png](https://www.imageoss.com/images/2019/12/20/html1.png)](https://www.imageoss.com/image/s7skL)

test.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>CORS跨域</title>
</head>
<body>
    Hi，CORS跨域了吗？<span id="answer"></span>
</body>
<script>
    const span = document.getElementById('answer');

    fetch('http://localhost:8088').then((res) => {

        if (res.status === 200 && res.statusText === 'OK') {
            span.innerText = true;
        } else {
            span.innerText = false;
        }
    }).catch((err) => {
        span.innerText = false;
        console.error(err);
    });
</script>
</html>
```

---

由于需要跨域，所以这里起了两个不同的node服务

服务一，端口号为80，同步读取了刚才的html文件并返回到页面。当html一渲染成功就会请求第二个端口为8088的服务。

server.js
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

服务二，端口号为8088，这段代码的关键是设置了头部的属性**Access-Control-Allow-Origin**，并且值规定为刚才的服务“http://localhost”，当然这里值也可以直接写“*”（*意思是默认所有的网站都可以进行CORS跨域请求过来，但在实际情况中为了安全，不建议大家这么做）。

可能有人要问为什么这里设置的是“http://localhost”没有端口号80，因为浏览器请求默认不用带80端口，所以这里后端获取到的请求ip为“http://localhost”，你加上了“80”反而会报错。（欢迎尝试）

server2.js
```js
const http = require('http');

const port = 8088;
const host = 'localhost';

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': 'http://localhost:8028,http://localhost',
    })
    res.end('awesome');
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

![ongly1.png](https://www.imageoss.com/images/2019/12/20/ongly1.png)
注意哦，这里的**Access-Control-Allow-Origin只支持一个值**，如果设置多个值可以根据请求的**req.headers中的某一个属性进行判断，然后动态加载。**

最后附赠启动代码命令：
```
node server
node server2
```