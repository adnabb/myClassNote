# Promise

这两天一直在看有关Promise的内容，但是不太确定怎样才叫做真正掌握，所以先把目前自己的理解写下来，总结一下。

文章最后的一小节【练习】我也加入了 很 多 遇到的有趣的promise面试题，大家顺便可以检测一下自己的知识是否巩固。

章节直通车：
<!-- TOC -->

- [Promise](#promise)
  - [概念](#概念)
  - [用法](#用法)
    - [基础用法](#基础用法)
  - [We have a problem with promises](#we-have-a-problem-with-promises)
  - [练习](#练习)
      - [练习1：](#练习1)
      - [练习2：](#练习2)
      - [练习3：](#练习3)
      - [练习4：](#练习4)

<!-- /TOC -->

## 概念

Promise是跟随es6出来对异步回调地狱的一种很好的解决方案，之前的很多异步回调是很难检测他报错的，所以就用Promise（承诺）这个单词来向广大程序员保证：“我可以做到”，紧接着风靡前端。（以上都是鬼扯）

Promise是异步的一种解决方案，他有三种状态：pending（等待）、fulfilled（完成）、rejected（失败）。

## 用法

### 基础用法

首先根据下面的代码自己脑补一下会打印什么：

```js
new Promise(function(resolve, reject) {
  console.log(1);
  resolve('success');
  console.log(2);
  reject('error');
  console.log(3);
}).then(function(value) {
  console.log('then', value);
}).catch(function(err) {
  console.err('error:', err);
});
```

|

|

|

|

|

正确答案是

```
1
2
3
then success
```

我们根据上面的情况来具体聊聊Promise，

1. Promise必须存在一种状态（pending或fulfilled或rejected）。如果为pending状态，那么可以转换到其他的两个状态；如果为fulfilled状态，那么必须有一个值，并且值和状态不可改变；如果为rejected状态，那么必须有一个原因，并且状态和原因不可改变。

<br/>
上面的说法是人为约定俗成的（可参考Promise/A+规范），所以我们当我们看到 `resolve('success');`后面还有`reject('error');`，因为前者状态已经改变为fulfilled，所以状态不会改变，往后传入值`success`。

2. then方法接受两个参数，两个参数都需要为函数，否则会出现值穿透现象；then方法会继续返回一个新的Promise；then需要return一个值，如果没有return值，默认return的为undefined。

3. 由于catch和then返回的都是一个新的Promise，所以他可以继续往后链式调用。

```
then(function(value) {
  console.log('then', value);
})
```

这里值传了一个函数，获取到的value是resolve传的字符串success。

4. catch是语法糖，他其实相当于then(null, function failed() {})。

## We have a problem with promises

之所以这个小节是英文名，是因为之前在Twitter上有一个很火的文章 —— [《We have a problem with promises》 原文翻译](http://fexteam.gz01.bdysite.com/blog/2015/07/we-have-a-problem-with-promises/)，推荐大家深入看看，这里我就把里面的四道题拿出来，我们继续探讨一下。

判断下面四段代码的区别：

> 声明：在这些例子中，假定 doSomething() 和 doSomethingElse() 均返回 promises，并且这些 promises 代表某些在 JavaScript event loop (如 IndexedDB, network, setTimeout) 之外的某些工作结束，这也是为何它们在某些时候表现起来像是并行执行的意义。

假设doSomething并没有返回值。

1. 代码1
```
doSomething().then(function () {
  return doSomethingElse();
}).then(finalHandler);
```

这里的代码中规中矩，return了一个新的promise，所以后面的then都是基于doSomethingElse返回的promise往后继续执行的。

```
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |------------------|
                                     finalHandler(resultOfDoSomethingElse)
                                     |------------------|
```

2. 代码2
```
doSomething().then(function () {
  doSomethingElse();
}).then(finalHandler);
```

```
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |--------------------------------|
                  finalHandler(undefined)
                  |------------------|
```

第一个then没有返回值，所以默认是返回undefined；

其次doSomethingElse()是一个异步操作，所以finalHandler会在doSomething执行完之后（中间执行的一些时间可以直接忽略掉）开始。

3. 代码3
```
doSomething().then(doSomethingElse())
  .then(finalHandler);
```

```
doSomething
|-----------------|
doSomethingElse(resultOfDoSomething)
|--------------------------------|
                  finalHandler(undefined)
                  |------------------|
```

因为then传递的参数是一个自执行的函数，所以doSomething和doSomethingElse相当于同步执行，then默认传递undefined，所以等doSomething执行完后，finalHandler会继续执行。

4. 代码4

```
doSomething().then(doSomethingElse)
  .then(finalHandler);
```

因为doSomethingElse本身是一个function，then本身是接受function的，所以这个和代码1（只是在外面又包了一层function）是相同的。

```
doSomething
|-----------------|
                  doSomethingElse(undefined)
                  |------------------|
                                     finalHandler(resultOfDoSomethingElse)
                                     |------------------|
```


## 练习

#### 练习1：

```
let a = Promise.reject('a').then(() => {
    console.log('a passed')
}).catch(() => {
    console.log('a failed')
});

Promise.reject('b').catch(() => {
    console.log('b failed');
}).then(() => {
    console.log('b passed');
});
```

|

|

|

|

|

正确答案:

```
b failed
a failed
b passed
```

原因：

> 如果认为描述的还不够清楚，可以参考这篇文章 [讲解](http://www.fly63.com/article/detial/4795)

1. catch是其实就是then(null, function(){})，所以他也是一步一步串联着往后运行，并不会特殊的跳到后面；
2. 涉及到了JavaScript的执行顺序问题：

  （1）JavaScript分为宏任务和微任务（两者一般都为异步任务）；特殊的，主线程也属于宏任务。

  微任务有 Promise, I/O 等等
  宏任务有 setTimeout, setInterval 等等

  其中，宏任务和微任务是交替进行的，先是第一波宏任务和第一波微任务，然后再是第二波宏任务和微任务 ··· ···（按顺序then往下走，就可以分为第N波任务）

  ```
  let a = Promise.reject('a')

  相当于

  let a = new Promise((resolve, reject) => {
    reject('a');
  })

  所以这个属于主线程，立即执行。
  ```

  所以代码中宏任务和微任务可以按照下面分类和执行

先拆分
```js
let p1 = Promise.reject('a').then(() => {
    console.log('a passed')
});

p1.catch(() => {
    console.log('a failed')
});

let p2 = Promise.reject('b').catch(() => {
    console.log('b failed');
});

p2.then(() => {
    console.log('b passed');
});
```

然后排序
```js
// 一级微任务
let p1 = Promise.reject('a').then(() => {
    console.log('a passed')
});
let p2 = Promise.reject('b').catch(() => {
    console.log('b failed');
});

// 二级微任务
p1.catch(() => {
    console.log('a failed')
});
p2.then(() => {
    console.log('b passed');
});
```

所以按照顺序打印，由于p1抛出异常，紧跟着的是then不运行，p2抛出异常，紧跟着的是catch，打印b failed；由于没有宏任务所以直接运行二级微任务，p1找到了catch所以输出a failed；p2由于catch正常运行，返回了一个新的promise并且没有抛出异常，所以接着往下走，打印b passed。

#### 练习2：

```js
setTimeout(function () {
  console.log(1);
}, 0)
new Promise(function (resolve) {
  console.log(2);
  for (var i = 0; i < 100; i++) {
    i == 99 && resolve();
  }
  console.log(3);
}).then(function () {
  console.log(4);
})
console.log(5);
```

|

|

|

|

|

正确答案:

```
2
3
5
4
1
```

原因：

其实我们在上一题解释过宏任务和微任务，这里我就直接拆分并且排序一下

```js
// 主线程
const p1 = new Promise(function (resolve) {
  console.log(2);
  for (var i = 0; i < 100; i++) {
    i == 99 && resolve();
  }
  console.log(3);
});

console.log(5);

// 一级宏任务
setTimeout(function () {
  console.log(1);
}, 0)

// 一级微任务
p1.then(function () {
  console.log(4);
})
```

主线程 new Promise直接运行，打印2,3随后console打印5，由于主线程属于宏任务，所以接下来运行一级微任务打印4，最后运行一级宏任务，打印1。

#### 练习3：

```js
Promise.resolve(1)
.then((res)=>{
  console.log(res)
  return 2
})
.catch( (err) => 3)
.then(res=>console.log(res))
```


|

|

|

|

|

正确答案：

```
1
2
```

原因：

打印1的原因很简单，认为resolve了一个值为1，被下面的then接收到了，其次由于then返回的promise没有抛出错误，所以紧接着下面的catch没有运行，继续往下链式调用，打印了上一个then返回的值2。

#### 练习4：

```js
Promise.resolve(1)
.then( (x) => x + 1 )
.then( (x) => {throw new Error('My Error')})
.catch( () => 1)
.then( (x) => x + 1)
.then((x) => console.log(x))
.catch( (x) => console.log(error))
```


|

|

|

|

|

正确答案：

```
2
```

原因：

我们需要明确的是catch捕获错误了之后还是可以继续进行链式调用的。

这个题目的迷惑就是为什么then抛出了错误之后，没有被捕获到；原因是catch本身是可以捕获到的，可是在后面的catch没有处理错误，而是直接返回了1，所以后面就顺风顺水的走了两个then，打印了了一个2。

> 后面四个问题，如果你还是没有明白，可以参考文章: [后四个题解析](https://blog.csdn.net/weixin_33726943/article/details/88038303)

好啦，文章结束~欢迎大家指出错误！
