### 问题记录

1. 基于安全考虑，token存储在哪里（localStorage\cookie\）比较好，还是说没有必要考虑这么复杂，加上expire时间就够了？


http cache 缓存顺序（1.0 1.1 2.0）

localstorage（不用初始化）存储案例



多个数据存单个key读写效率很慢，多个会相对快（取决于是否需要反复读写）；

localStorage的存和取需要要try-catch包裹住（存爆）；

数据需要有等级（解决数据踢出）；



sessionStorage

IndexedDB（异步）持续化存储，可在web worker中使用

app cache（不建议使用）



如何做增量更新？



---

service worker

aliexpress

hybrid app

离线包技术（差异的更新机制）

WEEX与AMP

1. 让前端可以写native

2. 用户可以更容易调用原生组件

wasm

dart

flutter

百度mip

谷歌amp

WEEX和reactnative的性能优势来自于被删减的浏览器渲染实现

AMP的性能优势来自于受控爱的组件和尽可能少的定制能力

---

感兴趣可以了解一下：

exercise2

exercise3

homework2（webpack缓存机制已变化）

homework3