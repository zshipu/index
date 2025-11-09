# SEO 优化方案（v1.0）

## 目标与衡量
- 目标：提升抓取与收录、减少重复页、提高 CTR/停留、稳定核心性能指标（LCP < 2.5s，CLS < 0.1）。
- KPI：已收录 URL 数、索引覆盖率、站内搜索转化、主要入口页 CTR、错误页率、核心 Web Vitals、sitemap 提交成功与更新时间一致性。

## 现状摘要
- 优势：信息架构清晰；多站点地图已拆分；`robots.txt` 允许抓取；脚本化生成索引与数据；404 就绪。
- 问题：缺少 canonical；缺少 JSON-LD；`<title>/<description>` 存在乱码与堆砌；同时加载 GTM 与 GA；部分 JSON 体量大；文章/聚合页内链可加强。

## 优先级路线图
- P0（当周）
  1) 首页与模板添加 canonical。
  2) 首页添加 WebSite + SearchAction JSON-LD；聚合页添加 BreadcrumbList；文章页添加 Article。
  3) 统一统计：保留 GTM 或 GA 其一，并 `defer/async`。
  4) 修正首页 `<title>/<description>` 文案（去重、控长、避免乱码）。
- P1（两周内）
  5) 大 JSON 分片/延迟加载，首屏仅必要数据。
  6) 相关文章/同标签模块，增强横向内链。
  7) 图片与 CSS 体积优化（WebP、Critical CSS、懒加载）。
- P2（持续）
  8) 站内搜索报表与无结果词运营；提交/校验 sitemaps；定期 SEO 健康检查。

## 实施细节与片段
### 1) Canonical（全部页面）
```html
<link rel="canonical" href="https://index.zshipu.com/"> <!-- 首页 -->
```
- 文章页规则：使用绝对地址，保持与实际访问路径一致并统一尾随斜杠。如：
```html
<link rel="canonical" href="https://index.zshipu.com/ai/post/2025/xxx/">
```
- 聚合页（/archives/, /categories/, /tags/）同理，分页页 canonical 指向自身分页 URL。

### 2) 结构化数据（JSON-LD）
- 首页（WebSite + SearchAction）：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://index.zshipu.com/",
  "name": "知识铺",
  "inLanguage": "zh-CN",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://index.zshipu.com/search/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>
```
- 聚合页（BreadcrumbList）：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "首页", "item": "https://index.zshipu.com/"},
    {"@type": "ListItem", "position": 2, "name": "分类", "item": "https://index.zshipu.com/categories/"}
  ]
}
</script>
```
- 文章页（Article 模板）：
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{TITLE}}",
  "datePublished": "{{YYYY-MM-DD}}",
  "dateModified": "{{YYYY-MM-DD}}",
  "author": {"@type": "Person", "name": "{{AUTHOR}}"},
  "mainEntityOfPage": {"@type": "WebPage", "@id": "{{ABS_URL}}"},
  "image": ["{{ABS_IMAGE_URL}}"],
  "inLanguage": "zh-CN"
}
</script>
```

### 3) 标题与描述规范
- Title：50–60 字，品牌置后（例：`主题关键词 | 知识铺`）。
- Description：120–160 字，描述具体价值与差异点，避免关键词堆砌与乱码；与首屏文案一致。
- Keywords 可移除或精简，不作为主要信号。

### 4) 统计与数据层
- 二选一：
  - 仅保留 GTM，并在 GTM 内注入 GA4；或
  - 仅保留 GA4（gtag.js）。
- 统一以 `async`/`defer` 加载；站内搜索触发 `view_search_results` 事件（参数：query, results_count）。

### 5) 性能与内容负载
- 非关键 JS `defer`/`async`；首屏 Critical CSS 可内联，其他 CSS 延后加载。
- 图片：WebP/AVIF、设置尺寸与 `loading="lazy"`、合理 `srcset`。
- JSON：将 `site-links-full.json` 等大文件按页/域分片，聚合页按需（IntersectionObserver）延迟请求；搜索使用压缩版索引。

### 6) Sitemaps 与 robots
- 保持 `sitemap.xml` 为索引地图，子地图分域且含 `lastmod`；总 URL < 50,000/文件 < 50MB。
- `robots.txt` 保持允许抓取；如需中文搜索引擎参数规整，可添加 `Clean-param`（按需）。

### 7) 内链策略
- 文章底部增加“相关推荐”“同标签”模块（基于 `tag-hot.json` 与同类目录聚合）。
- 聚合页顶部突出核心入口：AI、技术、股票、GPT、Go、ECG，统一锚点与描述。
- 站内“热门标签”“最近更新”组件在首页可视范围内，减少跳出。

### 8) URL 与一致性
- 统一尾随斜杠策略，生成与链接必须一致；避免不同大小写与连字符混用导致重复。
- 避免不可控 302/重定向链（GH Pages 环境尽量通过稳定链接规避）。

## 工程与验证
- 生成与本地预览：
```bash
python scripts/generate_site_index.py
python scripts/generate_hot_tags.py
python -m http.server 8000  # http://localhost:8000
```
- JSON 校验：
```bash
python -m json.tool site-links-full.json > NUL
```
- 页面核对：`/`, `/archives/`, `/categories/`, `/tags/` 加载无报错；SearchAction 可用；sitemaps 可访问。

## 验收清单（抽样）
- [ ] 首页 `<link rel="canonical">` 正确；聚合/文章页 canonical 与首选 URL 一致。
- [ ] JSON-LD 通过 Rich Results 测试（WebSite、Article、Breadcrumb）。
- [ ] Title/Description 长度与文案规范；无乱码与堆砌。
- [ ] 统计仅保留一种注入路径；事件上报准确。
- [ ] 首屏 LCP < 2.5s，CLS < 0.1；关键页面不阻塞加载。
- [ ] sitemaps 提交成功且 `lastmod` 更新；Search Console 无重大覆盖错误。

## 推广与站长平台
- Search Console（Google/Bing）与百度/360/搜狗站长平台提交站点与 sitemap；关注抓取统计与覆盖报告，按月回顾与修正。

## 回滚与迭代
- 任何模板改动以小步、可回滚为准则；保留历史备份（已有 `index.html.backup*`）。
- 每次大规模内容更新后执行索引脚本与本地冒烟测试。

