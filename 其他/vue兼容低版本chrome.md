# vue兼容低版本chrome

做项目遇到了一些不能轻易升级chrome版本的客户，他们还用着40版本的chrome，所以今天就来说说为了兼容低版本的chrome做了哪些努力。

主要是两件事情：

（1）将自己代码转为es5版本
（2）将node_modules中引用的插件，有需要的部分转为es5版本

### 转自己的

配置自己的代码我们需要用到一个新的插件`babel-polyfill`

（1）安装

由于这个需要在你的源码之前使用，我们需要将其安装为dependency而不是dev-dependency。
```js
npm install --save @babel/polyfill
```

（2）使用

vue.config.js
```js

module.exports = {
  pages: {
    index: {
      // add here ---start---
      entry: ['node_modules/babel-polyfill/dist/polyfill.js', 'src/main.js'],
      // add here ---end---
      template: 'public/index.html',
      filename: 'index.html',
      chunks: ['chunk-vendors', 'chunk-common', 'index'],
    },
  },
};
```
更多使用请看[官方文档](https://babeljs.io/docs/en/babel-polyfill#usage-in-node-browserify-webpack)

（3）配置

新增babel.config.js文件

将所需要使用的polyfill配置出来
```js
module.exports = {
  presets: [
    ['@vue/app', {
      polyfills: [
        'es6.promise',
        'es6.symbol',
        'es6.array.iterator',
        'es6.object.assign',
      ],
      useBuiltIns: 'entry',
    }],
  ],
};
```

### 转node_modules下指定插件

vue.config.js
新增配置
```js
transpileDependencies: ['replay-attacks-SM3'],
```

更多使用请看[官方文档](https://cli.vuejs.org/zh/config/#transpiledependencies)

---

更多问题可以参考其他文章：
（1）[使用 Vue 及 Vue CLI3 时遇到的问题记录](https://www.cnblogs.com/givingwu/p/10220295.html)