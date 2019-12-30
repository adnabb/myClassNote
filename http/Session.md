# 1. Session

上一节说了Cookie,就不能不说一下Session。

<!-- TOC -->

- [Session](#session)
    - [上节回顾](#上节回顾)
    - [Session交互机制](#session交互机制)
    - [Session的实现方式](#session的实现方式)

<!-- /TOC -->

## 1.1. 上节回顾

1. Cookie会被放在请求头上；
2. Cookie被保存在客户端，可以被客户端手动清除和获取；
3. Cookie是明文传输的，安全性不高。

## 1.2. Session交互机制

Session的交互和Cookie的区别是原内容保存的位置换了，cookie将内容保存在了客户端，session将内容保存在了服务端。

![session交互机制](https://pic4.zhimg.com/80/v2-0113a489944100bdc9ad1091286bb6b3_hd.jpg)

Session有很多种实现方式，上图是结合Cookie实现的（下面的1、2、3和图片的1、2、3对应）。

（1）第一次发送请求；
（2）服务器响应，将SessionId的内容放入Cookie中返回给客户端；
（3）客户端再次发送请求，请求头自动带入了Cookie的内容，将SessionId发送给服务端；
（4）服务端将SessionId对应的用户信息返回给客户端（图上略了）。

好处就是真正的内容都放在了服务端，相对来说更加安全。

## 1.3. Session的实现方式

1. 将SessionId放在Cookie内；
2. 通过localstorage的方式存储；
3. 放在URL内（客户端禁止Cookie后出来的方法）。

> 参考文章：[Cookie和Session应该这样解释](https://zhuanlan.zhihu.com/p/59307179)