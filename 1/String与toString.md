String 和 toString 方法都返回一个表示 String 对象的值，那他们之间有什么区别？

## String 和 toString 的区别

### 区别一：定义的位置不同

String() 是 JavaScript 的全局函数；

	window.hasOwnProperty('String')
	// true

toString() 是 Object 原型的一个方法。

	String('1')
	// "1"

	var a = '1';
	a.toString();
	// "1"

当原始数据类型（boolean，Number、String）在调用方法时，JS 将会创建对象，以便调用方法属性，而在使用完毕后将会销毁该对象。

a 是一个字符串，相当于String的一个实例对象，String对象有toString的方法，所以a继承了String的原型方法：

	typeof a === 'string'
	// true
	a.hasOwnProperty('toString')
	// false
	a.__proto__ === String.prototype
	// true
	String.prototype.hasOwnProperty('toString')
	// true
	a.__proto__.hasOwnProperty('toString')
	// true

而我们又可以知道String是Function的实例对象，Function是自身的实例对象，Function的原型对象的__proto__最终指向 Object，所以 String 的toString方法是继承的 Object，然后重新改造的。

	String.__proto__ === Function.prototype
	// true
	Function.__proto__ === Function.prototype
	// true
	Function.prototype.__proto__ === Object.prototype
	// true
	

### 区别二：Sting()可以完成对 null 和 undefined 的转换

String() 可以将 `null, undefined` 转化为字符串；而 toString()不可以。

	String(null)
	// "null"
	String(undefined)
	// "undefined"

	null.toString()
	// Uncaught TypeError: Cannot read property 'toString' of null
	undefined.toString()
	// Uncaught TypeError: Cannot read property 'toString' of undefined

进一步理解：

JavaScript 有六种基本数据类型 `Number String Boolean null undefined Symbol` 和 `Object`。其中 Object 又包括 `object array function`。

> Symbol( 在 ECMAScript 6 中新添加的类型)。一种实例是唯一且不可改变的数据类型。

由于 null & undefined 作为一种单独的数据类型，所以他们没有继承 Object.prototype，因此不存在 	toString()的方法，报错 `Uncaught TypeError: Cannot read property 'toString' of undefined`；而 String 作为一个全局的方法，是都可以获取的。

	null.__proto__
	// Uncaught TypeError: Cannot read property '__proto__' of null
	typeof null
	// object

> 尽管typeof null === 'object' 为true，但是我们可以看到 null 并不存在 __proto__属性，自然不会继承 Object 的原型方法。

### 区别三：不同进制之间的转换

String()只支持转为普通字符串，不支持转为相应进制的字符串；

而Number.toString(radix)可以将一个Number对象转换对应进制的字符串；其中radix可选，表示数字几基数。

	// 将十进制转化为二进制
	var num = 2;
	num.toString(num, 2);
	// "10"

> 我们也可以根据 `Number.prototype.hasOwnProperty('toString') 为 true`来判断 Number 有重写 Object 的 toString 方法。

特别的：

（1）1.toString()报错的问题

	1.toString()
	// Uncaught SyntaxError: Invalid or unexpected token
	(1).toString()
	// "1"
	1..toString()
	// "1"

这是因为 JavaScript引擎在解释代码时，对于1.toString()认为第一个.是浮点符号；第二个为属性访问的语法，所以 `1..toString()`正常；而 `(1).toString()` 排除了小数点的影响所以也为正常；

（2）纯小数的小数点后面有连续6个或6个以上的0时，小数将用e表示法输出；

	var num = 0.000006; //小数点后面有5个“0”
	console.log(num.toString());
	//"0.000006"

	num = 0.0000006 ;//小数点后面有6个“0”
	console.log(num.toString());
	//"6e-7"

（3）浮点数整数部分的位数大于21时，输出时采用e表示法：

	var num = 1234567890123456789012;
	console.log(num.toString());
	//"1.2345678901234568e+21"

