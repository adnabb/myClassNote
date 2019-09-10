# nodejsEventEmitter源码解析

（以下顺序不是代码的原顺序，为方便理解顺序稍有调整）

> 源码地址参考：[https://github.com/nodejs/node/blob/5e6193f669c2b83031771dd794f81fdebac5e561/lib/events.js#L42](https://github.com/nodejs/node/blob/5e6193f669c2b83031771dd794f81fdebac5e561/lib/events.js#L42 "node/lib/events.js")

node的EventEmitter模式属于典型的发布订阅模式，即有订阅者和发布者以及一个调度中心，订阅者只需要在注册的时候将类型和调度方法注册到调度中心，当发布者发布事件后，由调度中心触发事件的发生。

以下是我对node EventEmitter的完全讲解，里面也会涉及到的很多边界情况，欢迎大家阅读和挑错~

## EventEmitter.init
创建了function EventEmitter，并且调用硬绑定this调用了他的init方法。

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}
	module.exports = EventEmitter;

init方法主要初始化了内置参数的值，分别有this._events（【空对象】），this._eventsCount（【事件个数】）和this._maxListeners（【最大观察者数量】）。

	EventEmitter.init = function () {
	
	  if (this._events === undefined ||
	    this._events === Object.getPrototypeOf(this)._events) {
	    this._events = Object.create(null);
	    this._eventsCount = 0;
	  }
	
	  this._maxListeners = this._maxListeners || undefined;
	};

特别地：这里创建空对象没有直接用 this._event = {}而是使用了Object.create(null)是为了提高性能。

### defaultMaxListeners【默认最大观察者数量】

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	// -> 默认最多添加10个观察者，否则会打印警告，这有助于发现内存泄露

	var defaultMaxListeners = 10;

	Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
	  enumerable: true,
	  get: function () {
	    return defaultMaxListeners;
	  },
	  set: function (arg) {
	    if (typeof arg !== 'number' || arg < 0 || Number.isNaN(arg)) {
	      const errors = lazyErrors();
	      throw new errors.ERR_OUT_OF_RANGE('defaultMaxListeners',
	        'a non-negative number',
	        arg);
	    }
	    defaultMaxListeners = arg;
	  }
	});

为defaultMaxListeners属性添加的set和get方法，可以对默认最大观察者进行设置。

### setMaxListeners、getMaxListeners

给EventEmitter.prototype新增方法：设置和获取最大观察者数量

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	// => 由于不是所有的观察者数量都是限制为10，这个方法允许改变默认观察者数量。

	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
	    const errors = lazyErrors();
	    throw new errors.ERR_OUT_OF_RANGE('n', 'a non-negative number', n);
	  }
	  this._maxListeners = n;
	  return this;
	};

在设置最大观察者数量时，如果参数n不是number类型、小于零或者为NaN都会甩出超出范围的错误；如果满足要求则正常设置最大观察者数量。
	
	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

如果没有调用方法设置最大数量，默认就是获取defaultMaxListeners的值（默认为10）。

### eventNames

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

Reflect.ownKeys返回一个包含所有自身属性（不包含继承属性）的数组。(类似于 Object.keys(), 但不会受enumerable影响).


## listeners和rawListeners
调度中心的订阅者信息。

listeners涉及到同一个type注册了有一个或者多个事件，如果一个type只有一个事件，那么typeof this._events[type] === 'function'；如果一个type对应多个事件，那么 Arrat.isArray(this._events[type])为true。

	function _listeners(target, type, unwrap) {
	  const events = target._events;
	
	  if (events === undefined)
	    return [];
	
	  const evlistener = events[type];
	  if (evlistener === undefined)
	    return [];

如果this._events和this._events[type]为undefined，直接返回[]，这事情没法儿继续了。

	  if (typeof evlistener === 'function')
	    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

如果this._events[type]为function，返回相应的数组（下面有例子）
	
	  return unwrap ?
	    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
	}

如果this._events[type]为数组，就遍历数组，返回大数组套小数组（下面有例子）

	function arrayClone(arr, n) {
	  var copy = new Array(n);
	  for (var i = 0; i < n; ++i)
	    copy[i] = arr[i];
	  return copy;
	}
	
	function unwrapListeners(arr) {
	  const ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

function arrayClone和unwrapListeners的区别是前者是完全复制，后者判断了arr是否有listener属性，有的话就返回listener。
	
	EventEmitter.prototype.listeners = function listeners(type) {
	  return _listeners(this, type, true);
	};
	
	EventEmitter.prototype.rawListeners = function rawListeners(type) {
	  return _listeners(this, type, false);
	};

listeners返回的是原始的监听器而不是包装侦听器函数，在v9.4.0中新增了rawListeners，他返回的是监听器数组的拷贝，包括封装的监听器。他们在函数中的区别就是参数unwrap分别为true和false。

例如：

	// event类别监听了多个事件
	myEmitter.on('event', () => {
	  console.log('触发了一个事件A！');
	});
	myEmitter.on('event', () => {
	    console.log('触发了一个事件B！');
	});
	
	// talk类别只监听了一个事件
	myEmitter.on('talk', () => {
	    console.log('触发了一个事件CS！');
	    // myEmitter.emit('talk');
	});

	// 可以看出一下打印的区别
	console.log(myEmitter._events)
	//{ event: [ [Function], [Function] ], talk: [Function] }

以上最基础的属性都已经实现了，下面需要对观察者的增加、删除以及触发展开讲解。

## addListener、on

订阅者将事件类别（type）和处理程序（listener）注册到订阅中心。

	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	  function prependListener(type, listener) {
	    return _addListener(this, type, listener, true);
	  };

很容易看出on和addListener是一样的，只不过名称不同罢了，他们的prepend的参数都默认为false；而prependListener的prepend参数为true；前者默认是push到this._events里面，后者是unshift到this._events里面。

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function') {
	    const errors = lazyErrors();
	    throw new errors.ERR_INVALID_ARG_TYPE('listener', 'Function', listener);
	  }

传入的listener必须为function，否则会报错【参数类型不合法】
	
	  events = target._events;

	  if (events === undefined) {
	    events = target._events = Object.create(null);
	    target._eventsCount = 0;

如果事件为空，则初始化一下

	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".

注释的意思为：避免由于type为newListenr时发生递归事件，再将它添加到listener之
前，首先出发newListener事件

	    if (events.newListener !== undefined) {
	      target.emit('newListener', type,
	        listener.listener ? listener.listener : listener);
	
	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;

触发了newListener 之后重新获取this._events的值

	    }
	    existing = events[type];
	  }

变量existing现在为this._events[type]（某个具体type的事件集合）
	
	  if (existing === undefined) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] =
	        prepend ? [listener, existing] : [existing, listener];
	      // If we've already got an array, just append.
	    } else if (prepend) {
	      existing.unshift(listener);
	    } else {
	      existing.push(listener);
	    }

addEventListener默认添加某一类型的事件时，第一个事件的events[type]是function类型的，添加第二个事件是需要将function变为数组类型，其中pretend参数决定了他加入数组的方式是从头部添加还是从尾部添加。
	
	    // Check for listener leak
	    m = $getMaxListeners(target);
	    if (m > 0 && existing.length > m && !existing.warned) {
	      existing.warned = true;
	      // No error code for this since it is a Warning
	      // eslint-disable-next-line no-restricted-syntax
	      const w = new Error('Possible EventEmitter memory leak detected. ' +
	        `${existing.length} ${String(type)} listeners ` +
	        'added. Use emitter.setMaxListeners() to ' +
	        'increase limit');
	      w.name = 'MaxListenersExceededWarning';
	      w.emitter = target;
	      w.type = type;
	      w.count = existing.length;
	      process.emitWarning(w);
	    }
	  }
	
	  return target;
	}

查询listener个数是否超过上限，若查过则报错可能出现内存泄漏

## emit

	EventEmitter.prototype.emit = function emit(type, ...args) {
	 
	  let doError = (type === 'error');
	
	  const events = this._events;
	  if (events !== undefined)
	    doError = (doError && events.error === undefined);
	  else if (!doError)
	    return false;

doError标志，用来判断事件的类型是否为error
	
	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    let er;
	    if (args.length > 0)
	      er = args[0];
	    if (er instanceof Error) {
	      try {
	        const {
	          kExpandStackSymbol
	        } = require('internal/util');
	        const capture = {};
	        Error.captureStackTrace(capture, EventEmitter.prototype.emit);
	        Object.defineProperty(er, kExpandStackSymbol, {
	          value: enhanceStackTrace.bind(null, er, capture),
	          configurable: true
	        });
	      } catch {}
	
	      // Note: The comments on the `throw` lines are intentional, they show
	      // up in Node's output if this results in an unhandled exception.
	      throw er; // Unhandled 'error' event
	    }
	    // At least give some kind of context to the user
	    const errors = lazyErrors();
	    const err = new errors.ERR_UNHANDLED_ERROR(er);
	    err.context = er;
	    throw err; // Unhandled 'error' event
	  }

如果doError为true，则抛出相应的error错误
	
	  const handler = events[type];
	
	  if (handler === undefined)
	    return false;
	
	  if (typeof handler === 'function') {
	    Reflect.apply(handler, this, args);
	  } else {
	    const len = handler.length;
	    const listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      Reflect.apply(listeners[i], this, args);
	  }
	
	  return true;
	};
如果不是错误事件，则会继续往后走，如果emit传入的events[type]是函数，则直接执行；否则会直接拷贝后依次执行。

## remove

	EventEmitter.prototype.removeListener =
	  function removeListener(type, listener) {
	    var list, events, position, i, originalListener;
	
	    if (typeof listener !== 'function') {
	      const errors = lazyErrors();
	      throw new errors.ERR_INVALID_ARG_TYPE('listener', 'Function', listener);
	    }
	
	    events = this._events;
	    if (events === undefined)
	      return this;
	
	    list = events[type];
	    if (list === undefined)
	      return this;

如果listener不为function就抛出错误；this._events和this,events[type]为undefined直接return this
	
	    if (list === listener || list.listener === listener) {
	      if (--this._eventsCount === 0)
	        this._events = Object.create(null);
	      else {
	        delete events[type];
	        if (events.removeListener)
	          this.emit('removeListener', type, list.listener || listener);
	      }

如果this._events[type]就是listener，当事件总数减少一个为0，this._events为赋值为空对象，否则删除当前的events[type]，当events.removeListener存在时触发removeListener事件。

	    } else if (typeof list !== 'function') {
	      position = -1;
	
	      for (i = list.length - 1; i >= 0; i--) {
	        if (list[i] === listener || list[i].listener === listener) {
	          originalListener = list[i].listener;
	          position = i;
	          break;
	        }
	      }

如果是删除数组里的某一个listener，先找到该listener的原始地址并赋值originalListener，position。
	
	      if (position < 0)
	        return this;
	
	      if (position === 0)
	        list.shift();
	      else {
	        if (spliceOne === undefined)
	          spliceOne = require('internal/util').spliceOne;
	        spliceOne(list, position);
	      }


判断获取的position地址，如果小于0则当前listener不存在返回this；如果position在头部，则直接shift出去；如果在内部则获取另外一个方法spliceOne（下面会具体讲到）删除当前listener。
	
	      if (list.length === 1)
	        events[type] = list[0];
	
	      if (events.removeListener !== undefined)
	        this.emit('removeListener', type, originalListener || listener);
	    }
	
	    return this;
	  };

删除了listener之后，判断list的长度，如果为1，则this._events[type]为具体的函数，如果events.removeListener仍存在，则继续出发removeListener，删除当前的listner；最后返回this。


	function spliceOne(list, index) {
	  for (; index + 1 < list.length; index++)
	    list[index] = list[index + 1];
	  list.pop();
	}
	
	modules.export = {
	  spliceOne,
	};

里面的方法spliceOne，是node团队重写的splice方法，因为原生的splice方法功能强大但他们只需要简单的删除即可，这个函数性能相对于原生的splice函数有了很大的提升。

	
	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

off和removeListener是一样的方法，不同的命名。

以上~

> 参考文章：[https://www.jianshu.com/p/3dc51474c96c](https://www.jianshu.com/p/3dc51474c96c "Node.js EventEmitter类源码浅析")、[https://github.com/yjhjstz/deep-into-node/blob/master/chapter7/chapter7-1.md](https://github.com/yjhjstz/deep-into-node/blob/master/chapter7/chapter7-1.md "github文章")