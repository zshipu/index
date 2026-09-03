# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个单页面背单词应用程序,使用纯HTML + CSS + JavaScript构建,无需构建工具或依赖。主要特性包括:

- **核心功能**: 卡片式单词学习界面,支持翻转查看释义
- **交互方式**:
  - 点击卡片翻转查看释义
  - 拖拽卡片左右滑动表示认识/不认识
  - 三个按钮操作: 跳过(⏭️)、不认识(❓)、认识(✅)
  - 键盘快捷键: ←(不认识) →(认识) 空格(翻转卡片)
- **数据管理**: 支持导入CSV格式单词列表,可下载模板
- **视觉效果**: 丰富的动画特效系统,包括卡片翻转、滑动、粒子爆炸、涟漪、闪光等
- **语音功能**: 使用Web Speech API进行单词发音

## 架构设计

### 数据结构

单词对象格式:
```javascript
{
  word: "单词",
  phonetic: "/音标/",
  meaning: "中文释义",
  example: "例句"
}
```

### 核心状态管理

- `words[]`: 单词数组
- `currentIndex`: 当前卡片索引
- `knownCount`: 已掌握单词数
- `unknownCount`: 待学习单词数
- `cards[]`: DOM卡片元素数组

### 关键功能模块

1. **卡片系统** (line 766-862)
   - `createCard()`: 创建单个卡片DOM,绑定翻转和拖拽事件
   - `initCards()`: 初始化所有卡片,设置层叠效果
   - 卡片使用`transform: translateY() scale()`实现3D层叠视觉效果

2. **动画特效系统**
   - `createParticleBurst()`: 粒子爆炸 (line 722)
   - `createRipple()`: 涟漪扩散 (line 746)
   - `createFlash()`: 全屏闪光 (line 757)
   - `showCelebration()`: 中心图标庆祝 (line 896)
   - CSS动画: `swipeLeft/Right`, `bounceIn`, `shimmer`, `pulse`等

3. **文件导入** (line 644-690)
   - 支持CSV格式,必须包含表头: `word,phonetic,meaning,example`
   - 使用FileReader API读取,正则表达式解析CSV行
   - 自动跳过空行和格式错误的行

4. **交互处理**
   - 点击翻转: 切换`.flipped`类触发CSS 3D旋转 (line 790-803)
   - 拖拽手势: mousedown/touchstart监听,超过100px阈值触发操作 (line 809-854)
   - 卡片移除: 添加动画类,500ms后更新DOM和状态 (line 905-942)

5. **语音播放** (line 708-719)
   - 使用`speechSynthesis` API
   - 设置语言为`en-US`,播放速度0.8倍

## 开发指南

### 修改单词数据

直接编辑`words`数组 (line 569-580),或通过CSV文件导入

### 调整动画参数

- 卡片层叠偏移: `translateY(${index * 10}px)` (line 770)
- 卡片缩放系数: `scale(${1 - index * 0.05})` (line 770)
- 拖拽触发阈值: `Math.abs(currentX) > 100` (line 838)
- 动画时长: 大部分在CSS中定义,如`.card-inner`的`transition: 0.6s` (line 189)

### 特效触发位置

所有特效函数接受`(x, y, color)`参数,可在任意交互点调用:
- `handleKnow()`: 认识操作,蓝色特效 (line 945)
- `handleUnknown()`: 不认识操作,粉色特效 (line 954)
- `handleSkip()`: 跳过操作,涟漪特效 (line 963)

### CSS样式系统

- 使用CSS变量实现粒子动画: `--tx`, `--ty` (line 736-737)
- 渐变色主题: `#667eea`(紫色) `#764ba2`(深紫) `#4facfe`(蓝) `#fa709a`(粉)
- 背景模糊效果: `backdrop-filter: blur(10px)`用于半透明容器

## 文件结构

```
/mnt/e/app/learnd/
├── index.html              # 原始版本
├── index-optimized.html    # 优化版本 (推荐使用)
├── CLAUDE.md              # 代码架构文档
├── OPTIMIZATION.md        # 优化详细文档
└── .git/                  # Git版本控制
```

## 版本说明

### index.html (原始版本)
- 单文件实现,适合学习和快速原型
- 存在性能问题和内存泄漏

### index-optimized.html (优化版本) ⭐推荐
- 企业级性能优化
- 完整可访问性支持
- 数据持久化
- 深色模式支持
- 详见 OPTIMIZATION.md

## 运行方式

直接在浏览器中打开`index.html`,无需构建步骤或服务器。

## 扩展建议

- 添加本地存储(localStorage)保存学习进度
- 实现单词复习算法(如艾宾浩斯遗忘曲线)
- 支持多个单词集合/分类管理
- 添加深色模式支持
- 集成在线词典API获取详细释义
