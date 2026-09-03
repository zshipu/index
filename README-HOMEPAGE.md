# 知识铺首页使用说明

## 🚀 快速开始

### 本地测试
```bash
# 启动本地服务器
python -m http.server 8000

# 访问首页
# http://localhost:8000
```

### 文件说明
- `index.html` - 新首页（已更新）
- `index.html.backup` - 原首页备份
- `css/homepage.css` - 首页专用样式
- `js/homepage.js` - 首页交互脚本

## 📝 内容更新

### 更新最新文章
编辑 `index.html` 第266-308行：
```html
<div class="homepage-recent-item">
    <span class="homepage-recent-category" data-category="ai">🤖 AI</span>
    <a href="/ai/post/你的文章路径/" class="homepage-recent-link">
        你的文章标题
    </a>
</div>
```

### 修改板块信息
编辑 `index.html` 第140-230行的卡片内容

### 调整样式
编辑 `css/homepage.css` 文件

## 🎨 特性
- ✅ 响应式设计
- ✅ 6个核心板块卡片
- ✅ 3个特色项目展示
- ✅ 全站搜索功能
- ✅ 动画效果
- ✅ SEO友好

## 📱 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- 移动端浏览器

## 🔗 相关文档
- 详细实施报告: `claudedocs/homepage-implementation-complete.md`
- 设计方案: `claudedocs/homepage-redesign-proposal.md`

---

**问题反馈**: 请提交Issue或联系开发团队
