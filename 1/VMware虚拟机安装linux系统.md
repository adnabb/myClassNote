# VMware虚拟机安装linux系统

> 参考文章：http://c.biancheng.net/view/714.html

最近在虚拟机中安装了linux系统，这篇文章主要介绍安装的大体过程以及遇到的困惑。

## 前期准备

（1）下载VMware
vmware有两个版本，分别是 VMware Workstation Pro 和 VMware Workstation Player。Player是免费版本，只能用于非商业用途，适合个人学习；Pro是商业版本，功能最强大，付费才可以使用。于是我按照小编给的资源下载了带秘钥的pro版本。

VMware Workstation Pro 下载地址：https://pan.baidu.com/s/1XXhFFh0Fx0vzvcd1A543Yg，提取码：2o19（下载得到的压缩包中含有 VMware 安装所需的秘钥，亲测有效，可放心使用）

（2）下载linux镜像
参考文章：https://blog.51cto.com/sf1314/2096580
里面包含大部分的下载地址（部分被禁掉了），或者直接去相关网站下载即可。

## 安装VMware
在widnow上安装vmware相对来说很简单，一般只需默认系统的选项，默认下一步即可。

## VMware安装linux系统
这里主要记录几个重要步骤：

（1）启动VMware进入主界面，点击 **创建新的虚拟机**。 &darr; 下一步

![1.png](https://upload-images.jianshu.io/upload_images/5657049-cd0fae05f388eb55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

（2）进入“虚拟机设置向导”页面，选择 **典型（推荐）**。 &darr; 下一步

![2.png](https://upload-images.jianshu.io/upload_images/5657049-28d15106d3c63023.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

（3）进入“安装客户机操作系统”页面，选择 **安装程序光盘映像文件(iso)(M)** ，选择前期准备好的镜像文件。（若此时没有下载好镜像文件，可点击 **稍后安装操作系统**）。 &darr; 下一步

![3.png](https://upload-images.jianshu.io/upload_images/5657049-2fe3105da2234ee2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

（4）进入“客户机操作系统”页面，选择 **linux**，版本选择自己镜像对应的版本。 &darr; 下一步

![4.png](https://upload-images.jianshu.io/upload_images/5657049-b30a6c9c443126f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

（5）进入“命名虚拟机”页面，选择任意的名称和安装位置。 &darr; 下一步

![5.png](https://upload-images.jianshu.io/upload_images/5657049-d946e986aef09639.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

（6）进入“指定磁盘容量”页面，保持默认设置即可。 &darr; 下一步

![6.png](https://upload-images.jianshu.io/upload_images/5657049-0bc807a9b9e66818.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

（7）进入“已准备好创建虚拟机”页面，可以根据自己的需要自定义硬件。&rarr; 完成

![7.png](https://upload-images.jianshu.io/upload_images/5657049-aaf443b0633f8ed0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

若想调整硬件设置，可以关闭当前的虚拟机，去主界面编辑调整后重启系统。

## 问题
（1）由于最开始是根据教程一板一眼来做的，后来发现在虚拟机中下载的东西重启之后就全部没有了，百思不得其解，最后知道是因为教程中间推荐的镜像是LiveCD版本，他可以让你在不安装到硬盘的前提下体验操作系统，所以大家下载镜像的时候一定要根据自己的需求下载，并且需要多了解一些linux的相关知识。
> 参考文章：https://blog.csdn.net/chenghui0317/article/details/9372713