# 1. Cookie
<!-- TOC -->

- [Cookie](#cookie)
    - [Cookie交互机制](#cookie交互机制)
    - [Cookie的实现](#cookie的实现)
        - [其他设置](#其他设置)

<!-- /TOC -->

## 1.1. Cookie交互机制
mdn上说：“HTTP Cookie是服务器发送到用户浏览器并保存在本地的一小块数据，他会在浏览器下次向同一服务器发送请求时被携带并且发送到服务器上。”

通过这一层定义，我们可以了解到：

1. cookie保存在客户端，是可以被客户端手动清除的；
2. cookie会被保存到请求头上。

首先我们需要理解http是无状态的，做一个简单的比喻：

（1）登录某课网，跳转到主页，点击我的订单；
（2）请求A：“不好意思，我不认识你，你要获得登录权限才可以查看订单。”页面跳转到登录；
（3）登录后，再次点击我的订单；
（4）重复步骤（2-3）。

所以这个时候cookie来了，我们登录之后可以把登录验证通过的token放在cookie内（只是简单做个比方），接下来请求订单的请求就会自动带上token进行验证，如果验证通过了就可以获取到订单的内容，否则进入登录页面。

## 1.2. Cookie的实现

Cookie的实现很简单。

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

### 1.2.1. 其他设置

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

（5）Domain，在主域名的服务器上设置了cookie，其二级域名页面也可以直接获取到相应的cookie。

更多设置请参考官方文档：[cookie mdn](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Set-Cookie)

