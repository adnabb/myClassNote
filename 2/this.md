# this

对于那些没有花时间学习 `this` 绑定机制如何工作的 JavaScript 开发者来说，`this` 绑定一直是困惑的根源。对于 `this` 这么重要的机制来说，猜测、试错、或者盲目地从 Stack Overflow 的回答中复制粘贴，都不是有效或正确利用它的方法，通过这篇文章大家可以更好地认识、理解this。


目录：

<!-- TOC -->

- [this](#this)
  - [有关this的困惑](#有关this的困惑)
  - [分析](#分析)
    - [数据存储结构](#数据存储结构)
    - [代码分析](#代码分析)
  - [this的四种常用绑定规则](#this的四种常用绑定规则)
    - [默认绑定](#默认绑定)
    - [隐含绑定](#隐含绑定)
    - [明确绑定](#明确绑定)
    - [new绑定](#new绑定)
  - [es6箭头函数](#es6箭头函数)
  - [练习](#练习)

<!-- /TOC -->

## 有关this的困惑

针对以下两种写法，打印的this.a为什么会不同？？

```js
var obj = {
  foo: function () { 
    console.log(this.a) 
  },
  a: 1
};

var foo = obj.foo;
var a = 2;

// 方式一
obj.foo() // 1

// 方式二
foo() // 2
```

这里的this.count和foo.count有什么区别？？

```js
	function foo(num) {
		console.log( "foo: " + num );

		this.count++;
	}
	
	foo.count = 0;
	
	var i;
	
	for (i=0; i<10; i++) {
		if (i > 5) {
			foo( i );
		}
	}
	// foo: 6
	// foo: 7
	// foo: 8
	// foo: 9
	
	console.log( foo.count ); // 0 
```

如果你对上面的内容产生了很大的疑问，那么恭喜你，这篇文章非常适合你进一步阅读。

我们先给出一个正确的结论，在后续讲解中我们会直接用到：
`this` 实际上是在函数被调用时建立的一个绑定，它指向 *什么* 是完全由函数被调用的调用点来决定的。

这个解释可能对大家来说非常的含糊，我们接着往后分析：

## 分析

### 数据存储结构

首先我们需要了解数据的存储结构：

以 `var obj = {a: 5}`为例，

**代码含义**：将一个对象赋值给obj；

**实际操作**：JavaScript引擎会在内存里面生成一个{a: 5}的对象，然后将这个对象的内存地址赋值给obj；实际上obj是一个内存的地址（reference）。

**读取操作**：当我们想要读取`obj.a`的值，引擎先从`obj`拿到地址，然后在从地址找到原始对象，返回他的a属性。原始的对象以字典结构保存，每一个属性名都对应一个属性描述对象。

![](https://ftp.bmp.ovh/imgs/2019/09/f236cd9d4e0dfd08.png)

### 代码分析

![](https://ftp.bmp.ovh/imgs/2019/09/2c21afee7fecd137.png)

---

知识点：

调用点：函数在代码中被调用的位置（**不是被声明的位置**）。

怎么判断this：根据调用点我们可以清楚的了解当前的this究竟指向什么。

【怎么判断调用点？】
```js
function baz() {
	// 调用栈是: `baz`
	// 我们的调用点是 global scope（全局作用域）

	console.log( "baz" );
	bar(); // <-- `bar` 的调用点
}

function bar() {
	// 调用栈是: `baz` -> `bar`
	// 我们的调用点位于 `baz`

	console.log( "bar" );
	foo(); // <-- `foo` 的 call-site
}

function foo() {
	// 调用栈是: `baz` -> `bar` -> `foo`
	// 我们的调用点位于 `bar`

	console.log( "foo" );
}

baz(); // <-- `baz` 的调用点
```

## this的四种常用绑定规则

### 默认绑定

```js
function foo() {
	console.log( this.a );
}

var a = 2;

foo(); // 2
```

### 隐含绑定

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2,
	foo: foo
};

obj.foo(); // 2
```

只有对象属性引用链的最后一层是影响调用点的：

```js
function foo() {
	console.log( this.a );
}

var obj2 = {
	a: 42,
	foo: foo
};

var obj1 = {
	a: 2,
	obj2: obj2
};

obj1.obj2.foo(); // 42
```

### 明确绑定

```js
function foo() {
	console.log( this.a );
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
foo.apply(obj); // 2
```

### new绑定

```js
var a = 10;
function test() {
	a = 5;
	alert(a);
	alert(this.a);
	var a;
	alert(this.a);
	alert(a);
}

test()

new test()
```

new在创建的时候究竟经历了一些什么？

1. 一个全新的对象会凭空创建（就是被构建）；
2. 这个新构建的对象会被接入原形链（[[Prototype]]-linked）；
3. 这个新构建的对象被设置为函数调用的 this 绑定；
4. 除非函数返回一个它自己的其他 对象，否则这个被 new 调用的函数将 自动 返回这个新构建的对象。

---

这个四个规则是依次更强的，也就是说new > 明确绑定 > 隐形绑定 > 默认绑定。

## es6箭头函数

```js
function foo() {
	setTimeout(() => {
		// 这里的 `this` 是词法上从 `foo()` 采用
		console.log( this.a );
	},100);
}

var obj = {
	a: 2
};

foo.call( obj ); // 2
```

箭头函数的本质是使用广为人知的词法作用域来禁止了传统的 this 机制，箭头函数不会创建自己的this，它只会从自己作用域的上一层继承this。

这里的箭头函数继承了上一层的this（obj，这里用了明确绑定），所以最终的this指向了obj.a为2。

## 练习

练习一：

```js
var length = 10;
function fn() {
		console.log(this.length);
}

var obj = {
	length: 5,
	method: function(fn) {
		fn();
		arguments[0]();
	}
};

obj.method(fn, 1); 
```

练习二：

```js
var x = 10;
var foo = {
	x: 20,
	bar: function () {
		var x = 30;
		return this.x;
	}
};

console.log(
	foo.bar(),
	(foo.bar)(),
	(foo.bar = foo.bar)(),
	(foo.bar, foo.bar)()
);
```

练习三：
```js
var age = 20;
　var person = {
　　"age" : 10,
　　"getAgeFunc" : function(){
　　　　return function(){
　　　　　　return this.age;
　　　　};
　　}
};
console.log(person.getAgeFunc()());
```

感谢观看~