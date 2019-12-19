这几天把有关HTTP的内容都刷了一遍，现在来记录下自己的学习成果。

# HTTP三次握手详解

使用的抓包工具：wireShark

当说到HTTP的时候我们基本上都知道他有和TCP的三次握手，那究竟三次握手相互传输了怎样的信息呢，我用抓包工具跟大家详细的叨一叨。

首先放上HTTP三次握手的经典图片（图片1）：
![HTTP三次握手](https://s2.ax1x.com/2019/12/19/QqKD58.png)

然后是抓包工具的抓包图片（图片2）：
![QqKHxJ.png](https://s2.ax1x.com/2019/12/19/QqKHxJ.png)

我们很容易根据Info那一列的客户端端口->服务端端口的来回通信判断是否为同一个TCP连接。

（1）第一次握手

客户端向服务端发送【SYN】为头的数据包，seq的值为0；

（2）第二次握手

服务端向客户端发送【SYN,ACK】为头的数据包，ack的值为1，seq的值为0；

（3）第三次握手

客户端向服务端发送【ACK】为头的数据包，ack的值为1，seq为1。

结合页面请求的分析：

![QqlxI0.png](https://s2.ax1x.com/2019/12/19/QqlxI0.png)

![Qqlvaq.png](https://s2.ax1x.com/2019/12/19/Qqlvaq.png)




