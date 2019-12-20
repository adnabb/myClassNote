# 实现CORS跨域

## 简单请求

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

服务二，端口号为8088，这段代码的关键是设置了头部的属性**Access-Control-Allow-Origin**，并且值规定为刚才的服务`“http://localhost”`，当然这里值也可以直接写“*”（*意思是默认所有的网站都可以进行CORS跨域请求过来，但在实际情况中为了安全，不建议大家这么做）。

可能有人要问为什么这里设置的是`“http://localhost”`没有端口号80，因为浏览器请求默认不用带80端口，所以这里后端获取到的请求ip为`“http://localhost”`，你加上了“80”反而会报错。（欢迎尝试）

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

## CORS跨域限制以及预请求验证

出现CORS跨域限制以及预请求验证的场景就是相对上面章节更为复杂的非简单请求。
对于满足以下：
（1）methods：HEAD, GET, POST
（2）Content-Type：text-plain, multi/form-data, application/x-www-form-urledncoded
（3）请求头限制
条件基本可以判断为简单请求，其实非简单请求也不难使用，只是浏览器增加了option方法的预请求来判断服务器是否支持跨域请求。

让我们先看看非简单请求的报错是什么样子

![2.png](https://www.imageoss.com/images/2019/12/20/2.png)
浏览器发送了methods为options的请求，请求成功了为200并且返回了该有的参数，但是浏览器根据该请求得知并没有通过服务器的验证，所以甩出了如上报错。

根据报错内容解释，我们很容易知道是因为请求设置了名为'my-custom-header'的自定义头部，所以被CORS规定给打回来了，内容很简单，我们只需要在server2的请求内加上对该header的声明即可。

test.html
```html
<script>
    const span = document.getElementById('answer');

    fetch('http://localhost:8088', {
        method: 'GET',
        // new added
        headers: new Headers({
            'My-Custom-Header': 'data'
        }),
    }).then((res) => {

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
```

server2.js
```js
const http = require('http');

const port = 8088;
const host = 'localhost';

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': 'http://localhost',
        // new added
        'Access-Control-Allow-Headers': 'My-Custom-Header',
    })
    res.end('awesome');
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

成功后，我们会看到两条请求，一条是methods为options的预请求，另一条就是我们自己发出的GET请求。

另外说几个比较重要的请求头设置：
（1）Access-Control-Allow-Methods：设置更多可用的方法
（2）Access-Control-Max-Age：设置后，在第一条预请求通过验证后，剩余的几秒内（设置的值）不会在发送预请求。

更多详情请参考官方文章[CORS(MDN)](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)