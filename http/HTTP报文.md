# 1. HTTP报文

<!-- TOC -->

- [1. HTTP报文](#1-http%e6%8a%a5%e6%96%87)
  - [1.1. 理论内容](#11-%e7%90%86%e8%ae%ba%e5%86%85%e5%ae%b9)
  - [1.2. 结合浏览器客户端来看HTTP报文](#12-%e7%bb%93%e5%90%88%e6%b5%8f%e8%a7%88%e5%99%a8%e5%ae%a2%e6%88%b7%e7%ab%af%e6%9d%a5%e7%9c%8bhttp%e6%8a%a5%e6%96%87)
    - [1.2.1. 浏览器](#121-%e6%b5%8f%e8%a7%88%e5%99%a8)
    - [1.2.2. curl工具](#122-curl%e5%b7%a5%e5%85%b7)

<!-- /TOC -->

## 1.1. 理论内容
![1.png](https://www.imageoss.com/images/2020/01/03/1.png)

## 1.2. 结合浏览器客户端来看HTTP报文
我们以百度`https://www.baidu.com/`为例，来介绍他的HTTP报文格式。

### 1.2.1. 浏览器

打开chrome，进入`https://www.baidu.com/`，F12打开开发者工具，选择network和Doc，我们可以看到百度的入口文件，下面是他的相关HTTP报文内容（这里说的头部就是上面的首部）。

![2.png](https://www.imageoss.com/images/2020/01/03/2.png)
![3.png](https://www.imageoss.com/images/2020/01/03/3.png)

### 1.2.2. curl工具

我们可以通过curl工具来查看HTTP通信的全过程。

打开cmd或者bash
```
curl -v https://www.baidu.com
```

![4.png](https://www.imageoss.com/images/2020/01/03/4.png)
![5.png](https://www.imageoss.com/images/2020/01/03/5.png)


更多对于curl工具的用法，可以参考下面的文章：
[curl用法指南-阮一峰](http://www.ruanyifeng.com/blog/2019/09/curl-reference.html)