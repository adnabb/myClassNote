今天看到了一道前端题目问到JavaScript和ECMAScript的区别，然后我就看到了两种答案：第一种答案非常简洁，感觉没什么毛病：
（1）ECMAScript是JavaScript的规范；JavaScript是对ECMAScript的实现；

感觉很有道理，紧接着又看到了另一种声音：
（2）JavaScript包含三个部分：ECMAScript、DOM和BOM。

一下子就有点懵，然后就冷静的看了一个故事。

1996年11月（我出生的年代），JavaScript的创造者Netscape公司，决定将他们的产品JavaScript交给国际标准化组织ECMA，希望他们能够将这种语言变成国际的标准。次年ECMA就发布了262号标准文件（ECMA-262）的第一版，规定了浏览器脚本语言的标准，并将这种语言称为ECMAScript。这个标准一开始就是针对JavaScript语言而制定的，但是没有将其称为JavaScript，主要有一下两个原因：（1）Java是Sun公司注册的商标，并且根据授权协议，只有Netscape公司可以合法的使用JavaScript这个名字，并且也被其注册为商标；（2）想体现这门语言的制定者是ECMA，这样有利于保证这门语言的开放性和中立性。

所以ECMAScript的确是对于JavaScript的标准、规范，JavaScript需要按照ECMAScript的规范进行实现，非要把他们理解为包含关系也没有错，JavaScript是一个整体，它包含对他规范的定义。

然后紧接着我就开始看JavaScript的另外两部分DOM和BOM。我对他们最开始的理解是BOM是对浏览器的操作，DOM是对页面的操作，可是网络上给的有关他们的讲解却总是把DOM包含在了BOM内部（如下）。

![BOM](https://img-blog.csdnimg.cn/20190602220225349.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L0tpbGl0b3U=,size_16,color_FFFFFF,t_70)

![包含关系2](https://img-blog.csdn.net/20161206225231482?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdTAxMzMwNTc4Mw==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

我的疑问就更深了，既然BOM包含了DOM那为什么不说JavaScript包含两个部分呢？

于是我自问自答。

后来就查阅了一下mdn文档，发现了一个很有趣的事情，官方并没有提出过BOM这样的一个概念（可以参见这个[问题](https://stackoverflow.com/questions/56370293/looking-for-official-docs-for-all-javascript-bom-dom-built-in-objects)），但是有一个Web API的说法，[Web API](https://developer.mozilla.org/zh-CN/docs/Web/Reference/API)是包含了DOM的。Web提供了一些列的api完成任务，我们可以通过JavaScript来调用这些api实现我们想要的效果。

于是整个人就很纠结，最后总算明白了为什么会有官方和非官方的很多幺蛾子事件，原来我们说的BOM啥的这些可以归咎于历史问题，DOM，BOM这些概念是在Web API标准出来之前就早就有了，官方的一些标准其实是滞后了，很多都是浏览器先实现了，标准才跟上的，再加上我个人可能有点咬文嚼字，所以很多文档都看的稀里糊涂的，总算真相大白了。

所以很多概念要看懂就行了，分清楚到底哪些是提前讲的，哪些又是被后来定义为所谓标准，分清楚，扯明白。

关于上面的第二个概念，看看就得了，了解到底有哪些东西就行了，不用太过于认真。