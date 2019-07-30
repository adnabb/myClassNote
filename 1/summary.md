下面是对JavaScirpt自动化测试和持续集成内容的整理：

# JavaScript自动化测试

## 测试工具

### mocha
mocha是一种测试框架，是运行测试的一种工具，并且提供了相应的语法糖。

mocha可以测试简单的**JavaScript函数**，也可以测试**异步代码**；

可以**自动运行所有测试**或者**只运行特定测试**；

支持**before、after、beforeEach和afterEach**来编写初始化代码。

<br/>

**mocha的使用：**

（1）安装 mocha 和 相应的断言库（这里采用的chai）

	// 全局安装 mocha
	npm install mocha -g

	npm isntall chai --save-dev

（2）编写单元测试

add.js文件编写方法

	// add.js
	function add(x, y) {
	  return x + y;
	}
	
	module.exports = add;

add.test.js编写测试用例

	// add.test.js
	var add = require('./add.js');
	var expect = require('chai').expect;
	
	describe('加法函数的测试', function() {
	  it('1 加 1 应该等于 2', function() {
	    expect(add(1, 1)).to.be.equal(2);
	  });
	});

其中 `describe` 块被称为“测试套件”（test suite），表示一组相关的测试。他是一个函数，第一个参数是测试套件的名称，第二个参数是实际执行的函数； `it` 块被称为“测试用例”，表示一个单独的测试，是测试的最小单位。他也是一个函数，第一个参数是测试用例的名称，第二个是实际执行的函数；

mocha只是提供了浏览器或者nodejs环境下的一种测试的工具，他还需要配合断言库（“断言” —— 用来判断源代码的执行结果和预期结果是否一致，如果不一致就抛出一个错误）来使用，才能准确的在运行后通知用户测试用例是否通过。

（3）运行 mocha

	// mocha 默认运行test子目录的测试脚本
	mocha

	or

	// 可通知指定单个或多个文件运行测试脚本
	mocha file1 file2 file3

这里只是大致介绍了 mocha 的简单应用，更多相对的复杂的做法推荐看阮老师的文章（下面的推荐1），里面详细介绍了使用 mocha 的各种参数配置和在浏览器下怎么使用mocha

**mocha** 相关文章推荐：

1. [http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html](http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html "测试框架 Mocha 实例教程")
2. [https://www.liaoxuefeng.com/wiki/1022910821149312/1101741181366880](https://www.liaoxuefeng.com/wiki/1022910821149312/1101741181366880 "mocha")

### karma
karma可以提供在**真实的、多种类型的浏览器中测试代码**；
可以在**本地每次保存** 或者 **持续集成的服务器**上执行测试。

**karma的使用：**

（1）全局安装 karma-cli（可选）

	npm install -g karma-cli

好处：可以直接使用 
`karma start` 来代替命令 `./node_modules/karma/bin/karma start`

（2）安装 karma 和 plugins (推荐局部安装)

	// 安装 karma
	npm install karma --save-dev

	// 根据自己项目的需求进行安装相应的依赖
	npm install karma-chrome-launcher karma-mocha --save-dev

（3）创建配置文件（位于项目的根目录下）

	// 创建默认的配置文件 karma.config.js
	karma init

	// or

	// 创建自定义名称的配置文件 my.config.js
	karma init my.config.js

	// 根据命令行选择配置文件内自己需要的东西（只作为参考）
	1. Which testing framework do you want to use ? (mocha)
	2. Do you want to use Require.js ? (no)
	3. Do you want to capture any browsers automatically ? (Chrome)
	4. What is the location of your source and test files ? (https://cdn.bootcss.com/jquery/2.2.4/jquery.js, node_modules/should/should.js, test/**.js)
	5. Should any of the files included by the previous patterns be excluded ? ()
	6. Do you want Karma to watch all the files and run the tests on change ? (yes)

需要更多配置信息可以到官方配置文档页面进行查看 [http://karma-runner.github.io/4.0/config/configuration-file.html](http://karma-runner.github.io/4.0/config/configuration-file.html "Configuration File")

（4）启动 karma

	// karma 会默认搜索当前目录下的 karma.config.js 或者 karmar.config.coffee
	karma start

	// or

	karma start my.config.js

（5）命令行参数（可选）

karma 执行的时候可以带上一些参数，例如

	karma start my.config.js --log-level debug --single-run

如果想知道更多的可用的 option，可以使用命令行 karma start --help

（6）整合 grunt/gulp

主要是根据官方文档加入一些配置信息（详情见下面链接最后一部分）

> 参考文章：[http://karma-runner.github.io/4.0/intro/configuration.html](http://karma-runner.github.io/4.0/intro/configuration.html "Karma-Configuration")


**karma的工作原理：**

官方文档对于此原理有非常详细的介绍，我只是粗略的了解到他们使用的websocket技术来同步浏览器和服务器之间的结果，详情见一下链接。


> 参考文章：[http://karma-runner.github.io/4.0/intro/how-it-works.html](http://karma-runner.github.io/4.0/intro/how-it-works.html "How It Works")

## 断言库
在使用mocha进行测试的时候，我们用到了断言库chai，课程中我们也用到了其他的断言库例如should.js，assert等等，每一种断言库都是不同的风格，可以根据自己的需要进行选择。

| 断言库  | 风格  |
| ------------ | ------------ |
| assert  | TDD  |
| should  | BDD  |
| expect  | BDD  |
| chai    | TDD/BDD  |

> **几种断言库的区别** 相关文章推荐：
[https://www.jianshu.com/p/d6fc6d2a8901](https://www.jianshu.com/p/d6fc6d2a8901 "几种断言库的区别")

# 持续集成服务 Travis CI

## 持续集成
持续集成指的是只要有代码变更，就自动运行构建和测试，反馈运行结果。确保符合预期之后，再将新代码集成到主干。

好处：每次代码有小幅度变更就能看到运行结果，从而不断累积，而不是在开发周期结束后合并一块大代码。

## Travis CI
为了提高软件开发的效率，构建和测试的自动化工具层出不穷。Tracis CI是这类工具之中，市场份额最大的一个。

Travis CI 提供的是持续集成服务（Continuous Integration，简称CI）。他绑定github上的项目，只要在监听的分支推送了新的代码，他就会自动抓取；提供一个运行环境执行测试、完成构建，还能部署到服务器。


**适用条件：**

（1）拥有 GitHub 账号

（2）该账号下面有至少一个项目

（3）该项目里面有可运行的代码

（4）该项目还包含构建或者测试脚本

**使用步骤（以 node 项目为参考）：**

（1）使用 GitHub 账户登录 Travis CI

（2）添加新的仓库，选择需要持续集成项目的仓库

（3）在项目根目录手动创建 .travis.yml 配置文件

	language: node_js
	node_js:
	  - "8"


Travis默认提供的运行环境，请参考 [https://docs.travis-ci.com/user/languages](https://docs.travis-ci.com/user/languages "官方文档")

Travis的**运行流程**很简单，任何项目都会经历两个阶段

install 阶段：安装依赖
script 阶段：运行脚本

	language: node_js
	node_js:
	  - "8"
	install: npm install（这是默认值，可省略）
	script: npm test（这是默认值，可省略）

> 更多内容请参考文章： [http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html](http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html "持续集成服务 Travis CI 教程")

