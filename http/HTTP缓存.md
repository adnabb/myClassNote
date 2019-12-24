# HTTP缓存

HTTP缓存是性能优化的基础，也是了解HTTP请求的一个基础，下面用例子+讲解仔细说明比较常用的HTTP缓存用到的内容，其他非常见的内容了解即可。**重点是HTTP1.1下的内容（结合服务端）。**

## “石器时代”
早在HTTP1.0的时代，我们就开始考虑了缓存问题。

以下的两种都是针对客户端（浏览器）的设置。

### pragma
在IE浏览器上，我们可以通过`meta`标签设置`pragma为no-cache`来告诉浏览器不需要缓存该页面（即每次访问页面都要发送请求）。

```html
<meta http-quiv="Pragma" content="no-cache">
```

### expires

注意这里的时间需要时GMT时间，我们可以用Date.prototype.toUTCString()进行转化。

```html
<meta http-quiv="expires" content="Thu, 24 Dec 2020 16:00:00 GMT">
```

---

优先级：pragma > expires

**注意：以上只是简单的说明了一下客户端的设置，下面内容会结合到服务端的设置。**

## HTTP1.1

### Cache Control

Cache Control可以设置很多值，比如no-cache, public, private, no-store, max-age等等，我们先以最容易理解的设置最大时间来做示范。

#### max-age

首先是基础页面，test.html，里面有一个资源，是请求script.js
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>HTTP cache</title>
</head>
<body>
    This is HTTP cache page.
</body>
<script src="./script.js"></script>
</html>
```

script.js
```js
console.log(1);
```

server1.js
```js
const http = require('http');
const fs = require('fs');

const port = 80;
const host = 'localhost';

const server = http.createServer((req, res) => {
    // 当服务请求为'/'时，我们会返回test.html页面
    if (req.url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        })
        res.end(fs.readFileSync('test.html'));
    }

    // 当服务请求为'/script.js'时，我们会返回script.js的内容。
    if (req.url === '/script.js') {
        const file = fs.readFileSync('script.js');
        res.writeHead(200, {
            'Content-Type': 'text/javascript',
            'Cache-Control': 'max-age=60',
        })
        res.end(file);
    }
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

代码就绪后，我们可以`node server1`，然后访问页面`http://localhost/`。

第一次访问
![1.png](https://www.imageoss.com/images/2019/12/24/1.png)
第二次访问（设置时间60秒内的第二次请求）
![2.png](https://www.imageoss.com/images/2019/12/24/2.png)
第三次访问（设置时间60秒外的第三次请求）
![3.png](https://www.imageoss.com/images/2019/12/24/3.png)

所以服务端设置了max-age，客户端会保存他的值60秒，在接下来的60秒内，如果再次请求这个资源，客户端直接返回本地缓存（200 OK from memory cache），超过了60秒，则会重新向服务端发送请求。

---

**那如果服务端没有设置，只是客户端设置了，这个设置会生效吗？拭目以待。**

test.html的小动作
```html
<!-- 注释 -->
<!-- <script src="./script.js"></script> -->
<!-- 新增 -->
<script>
    fetch('/script.js', {
        headers: {
            'Cache-Control': 'max-age=60',
        },
    }).then((res) => {
        console.log(res);
        return res.text();
    }).then((data) => {
        console.log(data);
    });
</script>
```

server1.js的小动作
```js
if (req.url === '/script.js') {
    const file = fs.readFileSync('script.js');
    res.writeHead(200, {
        'Content-Type': 'text/javascript',
        // 注释
        // 'Cache-Control': 'max-age=60',
    })
    res.end(file);
}
```

不停刷新请求一直发送，并不会出现缓存现象，所以这个设置必须服务端设置，才会真的生效。浏览器会根据后端返回的响应头来进行缓存操作。

我后来还测试前端设置`max-age和no-store`，后端只设置`max-age`，最终效果是也只有后端返回的响应头才会生效。

![5.png](https://www.imageoss.com/images/2019/12/24/5.png)

---

#### 其他的值

上面详细地说明了max-age的用法，其他的使用也是在server1.js的Content-Control中加入新的内容，例如：

server1.js
```js
if (req.url === '/script.js') {
    const file = fs.readFileSync('script.js');
    res.writeHead(200, {
        'Content-Type': 'text/javascript',
        // 在这里加入需要的内容即可，多个内容用逗号（英文输入下的逗号）隔开
        'Cache-Control': 'max-age=60, no-cache,',
    })
    res.end(file);
}
```

下面主要说一下常用的几种属性的含义【作为服务器相应的属性含义】：

（1）public：相应可以被任何对象缓存（例如发送请求的客户端、nginx代理服务器等）

（2）private：相应只能对发送请求的对象缓存（例如发送请求的浏览器）

（3）no-cache：使用缓存前会去服务器进行验证，如果验证通过则返回304

（4）no-store：不缓存任何内容

（5）max-age：设置缓存的时间（若设置为0也是不缓存）

（6）must-revalidate：必须进行服务端的验证

（7）no-transform

### LastModified & etag

接下来我们详细说一下LastModified和etag，他们的使用前提就是需要向服务器发送请求，所以我们可以和no-cache（使用缓存前会去服务器进行验证）进行连用。

我们当然也可以设置为max-age，只是设置max-age必须是在他过期才可以生效（过期即可以向服务器发送请求，否则直接读取缓存的内容）。

思路：

首先是LastModified：

（1）客户端第一次请求资源；

（2）服务端得到请求后可以获取到所需资源的修改GMT时间，并且将其作为请求头属性发送给客户端（浏览器）；

（3）客户端（浏览器）拿到请求头后会把内容保存起来，并且作为发送方的请求头属性if-modified-since，在第二次（后续）重复请求中，发送给服务端；

（4）服务端拿到if-modified-since后，根据文件的修改时间进行判断：
    若相同，返回304，直接读取缓存；
    若不相同，继续进行请求，请求成功后返回200，并且将最新的修改时间作为请求头属性发送给客户端。

实现：

第一次请求
![1b23ed3144f0cb542.png](https://www.imageoss.com/images/2019/12/24/1b23ed3144f0cb542.png)

第二次请求
![2c39c23144727a1ac.png](https://www.imageoss.com/images/2019/12/24/2c39c23144727a1ac.png)

server2.js
```js
const http = require('http');
const fs = require('fs');

const port = 80;
const host = 'localhost';

const server = http.createServer((req, res) => {
    if (req.url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        })
        res.end(fs.readFileSync('test.html'));
    }

    // 主要的区别在这个if里面（和上面的具体例子的区别）
    if (req.url === '/script.js') {
        const file = fs.readFileSync('script.js');
        let fileLastMofifiedDate = null;

        fs.stat('script.js', (err, data) => {
            if (err) throw err;

            // 获取了script.js文件的修改时间（GMT）
            fileLastMofifiedDate = data.ctime;

            // 根据if-modified-since返回不同的请求
            if (req.headers['if-modified-since'] === `${fileLastMofifiedDate}`) {
                // 若文件没有被修改，返回304
                res.writeHead(304, {
                    'Content-Type': 'text/javascript',
                    'Cache-Control': 'no-cache',
                    'Last-Modified': fileLastMofifiedDate,
                })
                res.end('code 304');
            } else {
                // 若文件被修改过，返回200
                res.writeHead(200, {
                    'Content-Type': 'text/javascript',
                    'Cache-Control': 'no-cache',
                    'Last-Modified': fileLastMofifiedDate,
                })
                res.end(file);
            }
        });
    }
});

server.listen(port, host, () => {
    console.log(`server is running on http://${host}:${port}`);
});
```

在后端设置Last-Modified之后，下次客户端的请求会自动带上If-Modified-Since，其实还有另一个请求头If-Unmodified-Since。

这两个属性相同点：都是在客户端进行设置的；都是约定俗称的（即纸上定的，也可以理解为后端可以按照自己意愿随意进行内容判断和返回，但是为了方便，大家会根据约定俗成的意思进行相关代码的书写）。

不同点：**定义**（纸上）上的不同点。

if-modified-since:上次被修改的时间，判断和上次被修改的时间是否一致，若一致返回304；否则返回200.

if-unmodified-since:从某个时间结点起，文件没有被修改。如果满足要求文件没有被修改，则返回200，否则返回412（客户端请求信息的先决条件错误）。

---

下面继续说一下etag，既然已经使用了last-modified来判断文件是否被修改，为什么还要另一个来继续判断这个问题呢？

因为可能存在文件并没有被修改，但是保存了多次，保存后修改时间改变了，实际上内容并没有变，所以出现了etag。

etag比last-modified的优先级高，所以两者都出现的情况下会优先判断etag。

etag判断思路：

（1）客户端第一次发送请求；

（2）服务端获取请求后根据资源的内容生成唯一哈希值，将哈希值作为请求头属性etag发送给客户端；

（3）客户端收到请求头后进行保存，并且在后续的重复请求中作为请求头If-None-Match发送给服务端；

（4）服务端根据请求头If-None-Match进行判断，
    若相同，返回304，直接读取缓存；
    若不相同，继续进行请求，请求成功后返回200，并且将最新内容生成的哈希值作为请求头属性发送给客户端。


实现：

第一次请求
![1763e21b22fab02e3.png](https://www.imageoss.com/images/2019/12/24/1763e21b22fab02e3.png)

第二次请求
![2cb03874eabbf7204.png](https://www.imageoss.com/images/2019/12/24/2cb03874eabbf7204.png)

修改script.js文件的内容
![3aa9dcdb21aafab27.png](https://www.imageoss.com/images/2019/12/24/3aa9dcdb21aafab27.png)

第三次请求
![4.png](https://www.imageoss.com/images/2019/12/24/4.png)

第四次请求
![5805b391834876903.png](https://www.imageoss.com/images/2019/12/24/5805b391834876903.png)

**优先级补充：max-age > etag > last-modified**

### vary

### date & age