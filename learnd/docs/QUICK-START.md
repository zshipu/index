# 🚀 快速开始 - 5分钟上手指南

## 1️⃣ 第一步：了解项目 (1分钟)

### 你得到了什么？

✅ **完整的背单词应用** - 功能齐全，可直接使用  
✅ **3个增强模块** - IndexedDB + SM-2 + 统计图表 + 学习模式  
✅ **PWA支持** - 可安装，可离线  
✅ **详细文档** - 集成指南 + API文档

### 项目结构

```
learnd/
├── index.html              ← 基础版本（立即可用）
├── modules/                ← 增强功能模块
│   ├── core-enhanced.js
│   ├── statistics-charts.js
│   └── learning-modes.js
├── manifest.json           ← PWA配置
├── service-worker.js       ← Service Worker
└── 📖 各种文档
```

---

## 2️⃣ 第二步：选择使用方式 (1分钟)

### 方式 A：直接使用基础版本 ⚡ 最快

```bash
# 直接在浏览器打开
open index.html
```

**适合**: 快速体验、学习原理

---

### 方式 B：集成增强模块 🚀 推荐

#### Step 1: 复制文件

```bash
# 复制模块文件到你的项目
cp modules/*.js your-project/modules/
cp manifest.json your-project/
cp service-worker.js your-project/
```

#### Step 2: 在 HTML 中引入模块

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <link rel="manifest" href="/manifest.json">
    <title>我的背单词应用</title>
</head>
<body>
    <!-- 你的HTML结构 -->

    <!-- 引入增强模块 -->
    <script src="modules/core-enhanced.js"></script>
    <script src="modules/statistics-charts.js"></script>
    <script src="modules/learning-modes.js"></script>

    <!-- 你的应用代码 -->
    <script>
        // 初始化应用 (见第3步)
    </script>
</body>
</html>
```

#### Step 3: 初始化增强功能

```javascript
// 1. 初始化数据库
const dbManager = new IndexedDBManager();
await dbManager.init();

// 2. 创建管理器
const wordbookManager = new WordbookManager(dbManager);
const studyRecordManager = new StudyRecordManager(dbManager);

// 3. 创建词库并导入单词
const wordbookId = await wordbookManager.createWordbook('我的词库');

const words = [
    { word: "hello", phonetic: "/həˈloʊ/", meaning: "你好", example: "Hello world!" },
    { word: "world", phonetic: "/wɜːrld/", meaning: "世界", example: "The world is beautiful." }
];

await wordbookManager.importWords(wordbookId, words);

// 4. 开始学习！
const allWords = await wordbookManager.getWords(wordbookId);
console.log('✅ 准备就绪！', allWords);
```

**适合**: 需要完整功能、企业级应用

---

## 3️⃣ 第三步：使用核心功能 (3分钟)

### 功能 1: 使用 SM-2 算法学习

```javascript
// 获取今日待复习的单词
const dueWords = SM2Algorithm.getDueWords(allWords);

// 学习单词
const word = dueWords[0];
const quality = 5; // 5=完美回忆

// 更新 SM-2 数据
word.sm2 = SM2Algorithm.calculate(word, quality);
await wordbookManager.updateWord(word.id, word);

// 记录学习历史
await studyRecordManager.addRecord(word.id, quality, 30);
```

---

### 功能 2: 查看学习统计

```javascript
// 获取统计数据
const stats = await studyRecordManager.getStatistics(30);

console.log(`
    总学习: ${stats.totalWords} 个
    正确率: ${(stats.correctRate * 100).toFixed(1)}%
    连续学习: ${stats.streak} 天
`);

// 绘制学习趋势图
const canvas = document.getElementById('chartCanvas');
const dashboard = new StatisticsDashboard('chartCanvas');
const records = await studyRecordManager.getRecentRecords(30);
dashboard.showLearningTrend(records);
```

---

### 功能 3: 使用拼写练习模式

```javascript
const container = document.getElementById('modeContainer');

const spellingMode = new SpellingPracticeMode(container, {
    showHint: true,
    allowRetry: true,
    onComplete: async (result) => {
        console.log(`用时: ${result.timeSpent}秒`);
        console.log(`结果: ${result.success ? '✅ 正确' : '❌ 错误'}`);

        // 更新学习数据...
    }
});

spellingMode.start(word);
```

---

### 功能 4: 使用听写模式

```javascript
const dictationMode = new DictationMode(container, {
    autoSpeak: true,
    speakCount: 3,
    onComplete: async (result) => {
        console.log(`听写${result.success ? '成功' : '失败'}`);
        console.log(`方式: ${result.method}`); // 'voice' 或 'manual'

        // 更新学习数据...
    }
});

dictationMode.start(word);
```

---

## 4️⃣ 常见任务速查

### 创建和管理词库

```javascript
// 创建词库
const id = await wordbookManager.createWordbook('四级词汇');

// 获取所有词库
const wordbooks = await wordbookManager.getWordbooks();

// 删除词库
await wordbookManager.deleteWordbook(id);

// 导入单词
await wordbookManager.importWords(id, wordsArray);

// 导出词库
const exportData = await wordbookManager.exportWords(id, 'csv');
ExportService.downloadFile(
    exportData.filename,
    exportData.content,
    exportData.mimeType
);
```

---

### 导出学习报告

```javascript
const wordbook = await wordbookManager.getWordbook(id);
const words = await wordbookManager.getWords(id);
const stats = await studyRecordManager.getStatistics(30);

const report = await ExportService.exportStudyReport(
    wordbook,
    words,
    stats
);

ExportService.downloadFile(
    report.filename,
    report.content,
    report.mimeType
);
```

---

### 注册 PWA

```javascript
// 注册 Service Worker
await PWAManager.register();

// 提示用户安装
const installed = await PWAManager.promptInstall();
if (installed) {
    console.log('✅ PWA安装成功！');
}
```

---

## 5️⃣ 故障排除

### 问题 1: IndexedDB 不可用

```javascript
if (!window.indexedDB) {
    alert('您的浏览器不支持 IndexedDB，请升级浏览器');
}
```

### 问题 2: 语音识别不支持

```javascript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    console.warn('语音识别不支持，听写模式将不可用');
    // 隐藏听写模式按钮
}
```

### 问题 3: Service Worker 注册失败

```javascript
if ('serviceWorker' in navigator) {
    try {
        await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
        console.error('Service Worker 注册失败:', error);
    }
} else {
    console.warn('Service Worker 不支持');
}
```

---

## 📚 进一步学习

### 详细文档

| 文档 | 用途 |
|------|------|
| `INTEGRATION-GUIDE.md` | ⭐ 完整集成指南 |
| `PROJECT-SUMMARY.md` | 项目总结和功能清单 |
| `PROJECT-STRUCTURE.md` | 文件结构说明 |
| `FEATURES-PRO.md` | 详细功能列表 |
| `OPTIMIZATION.md` | 性能优化说明 |

### API 文档

所有模块都包含完整的 JSDoc 注释：

```javascript
/**
 * IndexedDB 数据库管理器
 * @class IndexedDBManager
 * @param {string} dbName - 数据库名称
 * @param {number} version - 数据库版本
 */
```

查看源码获取详细的 API 说明。

---

## 💡 最佳实践

### 1. 错误处理

```javascript
try {
    const result = await wordbookManager.createWordbook('新词库');
    console.log('成功创建:', result);
} catch (error) {
    console.error('创建失败:', error);
    // 显示错误提示给用户
}
```

### 2. 批量操作使用事务

```javascript
// 批量导入单词时，自动使用单个事务
const result = await wordbookManager.importWords(id, largeWordsArray);
console.log(`成功: ${result.success}, 失败: ${result.failed}`);
```

### 3. 及时清理资源

```javascript
// 图表使用完后清理
chart.clear();

// 模式切换时清理旧模式
if (currentMode) {
    currentMode.destroy();
}
```

---

## 🎯 完整示例

查看 `INTEGRATION-GUIDE.md` 中的完整示例代码，包括：

- ✅ 完整的应用初始化
- ✅ 多种学习模式的集成
- ✅ 统计图表的使用
- ✅ 词库管理界面
- ✅ 成就系统集成

---

## 🆘 需要帮助？

### 查找信息

1. 🔍 搜索文档中的关键词
2. 📖 查看源码中的注释
3. 💡 参考 `INTEGRATION-GUIDE.md` 中的示例

### 报告问题

- GitHub Issues: [提交问题]
- 邮件: sblig3@gmail.com

---

## 🎉 开始你的旅程！

现在你已经准备好了：

1. ✅ 了解了项目结构
2. ✅ 知道如何集成模块
3. ✅ 掌握了核心功能
4. ✅ 学会了常见任务

**立即开始使用吧！** 🚀

---

**预计时间**: 5-10分钟即可上手基础功能  
**完整集成**: 30-60分钟可完成所有功能集成

**Good Luck!** 🍀
