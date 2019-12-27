# Cookie

我们常常会讨论到Cookie，那Cookie是怎么设置产生的呢？

服务端响应头部如果设置了'set-cookie'，那么在cookie生效的范围内，客户端的同域的请求会自动带上'cookie'。

代码实现：
![3.png](https://www.imageoss.com/images/2019/12/27/3.png)
![1.png](https://www.imageoss.com/images/2019/12/27/1.png)
![2.png](https://www.imageoss.com/images/2019/12/27/2.png)

server.js
```js
const http = require('http');
const fs = require('fs');

const port = 80;
const host = 'localhost';

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-type': 'text/html',
        // here is important
        // 设置了cookie的值为字符串'my-cookie'
        'set-cookie': 'my-cookie;',
    })
    res.end(fs.readFileSync('test.html'));
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

test.html
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Cookie</title>
</head>

<body>
    Hi，cookie！我的cookie值为<span id="cookie"></span>
</body>

<script>
    const cookie = document.querySelector('#cookie');
    cookie.innerText = document.cookie || '无';
</script>

</html>
```

## 其他设置

对于set-cookie服务端还可以设置多个值，以“;”英文状态下的分号隔开即可）。

（1）Max-Age设置超时的秒数

（2）Expires超时的时间（GMT格式）

（3）HttpOnly设置不能通过document.cookie在客户端获取到cookie的值（防止XSS攻击）

（4）Secure设置只能在https的请求下发送

```js
const server = http.createServer((req, res) => {
    res.writeHead(200, {
        'Content-type': 'text/html',
        // add attribute 'secure'
        'set-cookie': 'my-cookie;secure',
    })
    res.end(fs.readFileSync('test.html'));
});
```

![14dc40b1bda9a89b6.png](https://www.imageoss.com/images/2019/12/27/14dc40b1bda9a89b6.png)

我在本地http请求下设置了secure，发现请求中发现虽然请求头还是带有了代码中设置的假cookie，但是实际上在application中并没有生成cookie（注意：在请求之前先清空cookie）。

更多设置请参考官方文档：[cookie mdn](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie)
