## 文章：《性能为何至关重要》

[https://developers.google.cn/web/fundamentals/performance/why-performance-matters/](https://developers.google.cn/web/fundamentals/performance/why-performance-matters/ "性能为何至关重要")

BBC 发现其网站的加载时间每增加一秒，便会多失去 10% 的用户。

由于 CSS 是一种阻塞渲染的资源，CSS 框架的开销可能导致渲染延迟严重。 您可以视情况移除不必要的开销，以加速渲染。

并非所有网站都需要做成单页面应用 (SPA)，此类应用通常广泛使用 JavaScript。 JavaScript 是我们在网页上提供的最昂贵的资源，因为此类资源必须经过下载、解析、编译和执行。 例如，采用经过优化的前端架构的新闻和博客网站可以提供与传统多页面网站一样的良好性能。 当 HTTP 缓存配置正确或者使用 Service Worker 时尤其如此。

高效的交付对于构建快速用户体验至关重要。

迁移至 HTTP/2。 HTTP/2 可解决 HTTP/1.1 的许多固有性能问题，例如并发请求限制和缺乏标头压缩。

使用资源提示尽早下载资源。 rel=preload 是此类资源提示的一种，允许在浏览器发现关键资源之前提前提取这些资源。 如果能够谨慎使用，该资源会带来显著的积极效果，有助于页面渲染，并能减少可交互时间。 rel=preconnect 是另一个资源提示，可以在打开第三方网域托管资源的新连接时掩盖延迟。

平均而言，现代网站传输大量 JavaScript 和 CSS。 在 HTTP/1 环境中，常见的做法是将样式和脚本捆绑成较大软件包。 这么做是因为大量请求会对性能带来不利影响。 使用 HTTP/2 后就不需要再这么做，因为同时发送多个请求的成本更低。 考虑使用 webpack 中的代码拆分来限制仅下载当前页面或视图需要的脚本数。 将您的 CSS 拆分为较小的模板或组件专用文件，且仅在可能使用的地方纳入这些资源。

---
案例：

1. BBC发现其网站的加载时间每增加一秒，便会多失去10%的用户；
2. DoubleClick By Google发现，如果页面加载时间超过3秒，53%的于东网站访问活动将遭到抛弃；
3. 预加载时间约为四倍（19秒）的网站相比，加载时间在5秒以内的网站会话加长70%、跳出率下降35%、广告可见率上升25%。


这篇文章主要是从几个实际的案例总结出性能对于前端页面的重要性:

1. 性能关乎用户的去留；
2. 性能关乎转化率的提升；
3. 性能关乎用户体验；
4. 性能关乎用户。


并且在“后续步骤”提到了解决性能问题的通常的注意事项，在“后续步骤”中有很多没有理解的内容，需要查询：

1. 【避免不必要的下载】构建高性能应用的一个有效的方法是审核您想用户发送了哪些资源；

（1）清点网页上的自有资产和第三方资产；
（2）评估每个资产的表现：其价值以及其技术性能；
（3）确定这些资源是否提供了足够的价值。

1.1 判断页面的CSS组件是否必要（Bootsrtap、Foundation等，CSS是一种则色渲染的资源）；

1.2 判断使用的JavaScript库是否必要（或者是否可以用更轻量级的来代替）；

1.3 是否有必要做成SPA（JavaScript是很昂贵的资源，因为此资源必须经过下载、解析、编译和执行）。

2. 高效的交付对于构建快速用户体验至关重要：

3. 
