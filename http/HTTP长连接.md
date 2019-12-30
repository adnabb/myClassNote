> HTTP长连接

在HTTP1.0，请求就默认开启了长连接的模式，意味着我们可以在之前已经握手通过的TCP请求内继续我们的HTTP请求，从而降低了因为HTTP握手带来的时间性能损耗。

当然我们也可以在服务端关闭该条属性。

```
// 开启长连接（默认）
Connection: keep-alive;

// 关闭长连接
Connection: close;
```

我们在页面中请求了10个图片，下面查看一下他们的TCP链接情况：

（1）查看TCP的连接ID
![1.png](https://www.imageoss.com/images/2019/12/30/1.png)
（2）可以根据请求的响应头看到，默认开启了长连接模式
![33.png](https://www.imageoss.com/images/2019/12/30/33.png)
（3）根据waterfall和ConnectionID排序，我们可以很清楚的看到请求连接的顺序
![4.png](https://www.imageoss.com/images/2019/12/30/4.png)

解释一下：

最开始请求了localhost，然后进行页面渲染，页面接着请求了10张可爱的小兔子图片，我们可以看到其中有6个小兔子图片和最开始页面的请求是同一个ConnectionID，他们是依次串联着请求的（灰色为请求等待时间），所以这7个请求公用了一个TCP连接，减少了6次握手带来的性能损耗。

**另外的，chrome最多允许同一个Host创建6个TCP连接。**


## 代码实现

test.html
```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>HTTP长连接</title>
</head>

<body>
    Hi~This is HTTP Keep-Alive page.
    <div id="container"></div>
</body>
<script>
    // 默认发10个图片请求
    getRepeatedImgByNum();

    function getRepeatedImgByNum(num=10) {
        for (let index = 0; index < num; index++) {
            getImg();
        }
    }

    function getImg() {
        const div = document.getElementById('container');
        const img = new Image(300);
        img.src = `/getImg/${Math.random()}`;
        div.appendChild(img);
    }
</script>

</html>
```

server.js
```js
const http = require('http');
const fs = require('fs');

const port = 80;
const host = 'localhost';

const server = http.createServer((req, res) => {
    // 如果请求url为/则返回test页面，否则就返回图片
    if (req.url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        })
        res.end(fs.readFileSync('test.html', 'utf8'));
    } else {
        res.writeHead(200, {
            'Content-Type': 'image/jpeg',
        });
        res.end(fs.readFileSync('dongni.jpg'))
    }
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```