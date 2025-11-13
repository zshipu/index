# 背单词神器 Pro - 完全体架构设计

## 核心模块架构

### 1. 数据层 (Data Layer)
- **IndexedDBManager** - 数据库管理
  - 词库表 (wordbooks)
  - 单词表 (words)
  - 学习记录表 (study_records)
  - 成就表 (achievements)
  - 设置表 (settings)

- **SM2Algorithm** - 间隔重复算法
  - 难度因子计算
  - 下次复习时间计算
  - 复习队列管理

### 2. 业务逻辑层 (Business Logic)
- **WordbookManager** - 词库管理
- **StudyManager** - 学习管理
- **StatisticsManager** - 统计管理
- **AchievementManager** - 成就管理
- **RecommendationEngine** - 智能推荐引擎

### 3. 视图层 (View Layer)
- **CardStudyView** - 卡片学习视图
- **SpellingPracticeView** - 拼写练习视图
- **DictationView** - 听写视图
- **StatisticsView** - 统计图表视图
- **WordbookManageView** - 词库管理视图
- **AchievementView** - 成就展示视图

### 4. 服务层 (Services)
- **PWAManager** - PWA管理
- **ServiceWorkerManager** - Service Worker管理
- **SpeechService** - 语音服务
- **ExportService** - 导出服务

### 5. UI组件层 (UI Components)
- **Toast** - 通知组件
- **Modal** - 模态框组件
- **Chart** - 图表组件 (Canvas)
- **ProgressBar** - 进度条组件

## 技术栈
- 零依赖，纯原生实现
- IndexedDB for 大数据
- Canvas for 图表
- Web Speech API for 语音
- Service Worker for PWA

## 性能目标
- Lighthouse >= 98
- TTI < 1s
- FCP < 0.5s
- Memory < 20MB (1000 words)
