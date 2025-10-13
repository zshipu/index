# 🚀 知识铺 - AI工具宝藏导航

一个现代化的AI工具和资源导航网站，采用纯前端技术栈（HTML + CSS + JavaScript）构建。

## ✨ 特性

- 🎨 **现代化设计** - 采用卡片式布局，简洁美观
- 🌓 **深色/浅色主题** - 支持主题切换，保护视力
- 🔍 **实时搜索** - 快速查找所需工具，支持关键词匹配
- 🏷️ **智能分类** - 11个分类标签，精准筛选
- 📱 **响应式设计** - 完美适配手机、平板、桌面设备
- ⚡ **性能优化** - 懒加载、防抖、平滑动画
- ⌨️ **键盘快捷键** - Ctrl+K 快速搜索，ESC 清空
- 🔝 **返回顶部** - 长页面快速返回

## 🚀 快速开始

### 方法一：直接打开（推荐）

1. 克隆或下载本项目
2. 直接用浏览器打开 `index.html` 文件即可

### 方法二：本地服务器

```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js (需要先安装 http-server)
npx http-server

# 然后访问 http://localhost:8000
```

## 📁 项目结构

```
ai1000website/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.js              # JavaScript逻辑
├── README.md           # 本文档
└── AI强大的宝藏网站.md  # 原始资源数据
```

## 🎯 核心功能

### 1. 主题切换
- 支持浅色/深色主题
- 主题偏好保存在本地存储
- 点击右上角月亮/太阳图标切换

### 2. 搜索功能
- 实时搜索，无需提交
- 支持工具名称、描述、标签搜索
- 搜索防抖优化，提升性能
- 快捷键：`Ctrl + K` 聚焦搜索框

### 3. 分类筛选
- 11个精心设计的分类
- 点击分类标签快速筛选
- 支持与搜索组合使用

### 4. 工具卡片
- 清晰的卡片式布局
- 显示工具图标、名称、描述
- 标签展示工具特性
- 悬停动效，提升交互体验

## 🔧 自定义配置

### 添加新工具

编辑 `app.js` 文件中的 `toolsData` 数组：

```javascript
{
    name: "工具名称",
    icon: "🎨",  // emoji图标
    description: "工具描述",
    url: "https://example.com",
    category: "featured",  // 分类
    tags: ["标签1", "标签2"]  // 标签数组
}
```

### 修改分类

在 `app.js` 中修改 `getCategoryName` 函数和HTML中的分类标签。

### 自定义主题颜色

编辑 `styles.css` 文件中的CSS变量：

```css
:root {
    --primary: #6366f1;        /* 主色调 */
    --primary-hover: #4f46e5;  /* 悬停色 */
    --gradient: linear-gradient(...);  /* 渐变色 */
}
```

## 📊 数据来源

本项目基于 `AI强大的宝藏网站.md` 文件中精选的1000+优质AI工具和资源。包含：

- AI对话工具（DeepSeek、Kimi、豆包等）
- 图片生成工具（Midjourney、LibLib、即梦等）
- 视频生成工具（Sora、可灵AI、海螺AI等）
- 音频工具（魔音工坊、Suno等）
- 办公工具（WPS AI、Gamma等）
- 编程工具（Cursor、GitHub Copilot等）
- 学习资源（国家智慧教育平台、MOOC等）
- 设计素材（Canva、Pexels、Pixabay等）

## 🎨 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代化样式、CSS变量、Flexbox、Grid
- **Vanilla JavaScript** - 原生JS，无框架依赖

## 📱 浏览器兼容性

- ✅ Chrome (推荐)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ 现代移动浏览器

## 🚀 性能优化

- **懒加载** - 初始只加载20个工具，按需加载更多
- **防抖** - 搜索输入防抖300ms
- **CSS动画** - 使用transform和opacity优化动画性能
- **本地存储** - 主题偏好保存在localStorage

## 📝 待完成功能

- [ ] 工具收藏功能
- [ ] 最近访问记录
- [ ] 更多工具数据导入
- [ ] 用户评分系统
- [ ] 分享到社交媒体

## 🤝 贡献

欢迎提交Issue和Pull Request！

如果你有优质的AI工具推荐，可以：
1. Fork本项目
2. 在 `app.js` 的 `toolsData` 中添加工具信息
3. 提交Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

感谢原始资源文件 `AI强大的宝藏网站.md` 的作者，为我们整理了如此丰富的AI工具资源。

## 📞 联系方式

如有问题或建议，欢迎通过Issue反馈。

---

**⭐ 如果这个项目对你有帮助，请给个Star支持一下！**
