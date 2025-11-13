/**
 * 背单词神器 Pro - 核心增强模块
 * IndexedDB 数据库管理器 + SM-2算法 + 词库管理
 * Version: 3.0.0
 */

'use strict';

// ==================== IndexedDB 数据库管理器 ====================
class IndexedDBManager {
    constructor(dbName = 'WordLearnerDB', version = 3) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 词库表
                if (!db.objectStoreNames.contains('wordbooks')) {
                    const wordbookStore = db.createObjectStore('wordbooks', { keyPath: 'id', autoIncrement: true });
                    wordbookStore.createIndex('name', 'name', { unique: false });
                    wordbookStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // 单词表
                if (!db.objectStoreNames.contains('words')) {
                    const wordStore = db.createObjectStore('words', { keyPath: 'id', autoIncrement: true });
                    wordStore.createIndex('wordbookId', 'wordbookId', { unique: false });
                    wordStore.createIndex('word', 'word', { unique: false });
                    wordStore.createIndex('nextReview', 'sm2.nextReview', { unique: false });
                }

                // 学习记录表
                if (!db.objectStoreNames.contains('study_records')) {
                    const recordStore = db.createObjectStore('study_records', { keyPath: 'id', autoIncrement: true });
                    recordStore.createIndex('wordId', 'wordId', { unique: false });
                    recordStore.createIndex('timestamp', 'timestamp', { unique: false });
                    recordStore.createIndex('date', 'date', { unique: false });
                }

                // 成就表
                if (!db.objectStoreNames.contains('achievements')) {
                    const achievementStore = db.createObjectStore('achievements', { keyPath: 'id' });
                    achievementStore.createIndex('unlockedAt', 'unlockedAt', { unique: false });
                }

                // 设置表
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    async add(storeName, data) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async query(storeName, indexName, value) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async queryRange(storeName, indexName, lowerBound, upperBound) {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        const range = IDBKeyRange.bound(lowerBound, upperBound);
        return new Promise((resolve, reject) => {
            const request = index.getAll(range);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        const tx = this.db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// ==================== SM-2 间隔重复算法 ====================
class SM2Algorithm {
    /**
     * SuperMemo 2 算法实现
     * @param {Object} card - 单词卡片对象
     * @param {number} quality - 回答质量 (0-5)
     *   5 - 完美回忆
     *   4 - 正确但有点犹豫
     *   3 - 正确但很困难
     *   2 - 不正确但似曾相识
     *   1 - 不正确但有印象
     *   0 - 完全不记得
     * @returns {Object} 更新后的SM-2数据
     */
    static calculate(card, quality) {
        // 初始化 SM-2 数据
        if (!card.sm2) {
            card.sm2 = {
                easeFactor: 2.5,     // 难度因子 (1.3+)
                interval: 0,          // 复习间隔(天)
                repetitions: 0,       // 重复次数
                nextReview: Date.now()
            };
        }

        const sm2 = card.sm2;

        // 如果回答质量 >= 3，认为回忆成功
        if (quality >= 3) {
            if (sm2.repetitions === 0) {
                sm2.interval = 1; // 第一次复习间隔1天
            } else if (sm2.repetitions === 1) {
                sm2.interval = 6; // 第二次复习间隔6天
            } else {
                sm2.interval = Math.round(sm2.interval * sm2.easeFactor);
            }
            sm2.repetitions += 1;
        } else {
            // 回忆失败,重置
            sm2.repetitions = 0;
            sm2.interval = 1;
        }

        // 更新难度因子
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        sm2.easeFactor = sm2.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

        // 难度因子最小值1.3
        if (sm2.easeFactor < 1.3) {
            sm2.easeFactor = 1.3;
        }

        // 计算下次复习时间
        sm2.nextReview = Date.now() + sm2.interval * 24 * 60 * 60 * 1000;

        return sm2;
    }

    /**
     * 获取今日需要复习的单词
     */
    static getDueWords(words) {
        const now = Date.now();
        return words.filter(word => {
            if (!word.sm2) return true; // 新单词
            return word.sm2.nextReview <= now;
        });
    }

    /**
     * 获取复习统计
     */
    static getReviewStats(words) {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        return {
            new: words.filter(w => !w.sm2 || w.sm2.repetitions === 0).length,
            learning: words.filter(w => w.sm2 && w.sm2.repetitions > 0 && w.sm2.repetitions < 3).length,
            mastered: words.filter(w => w.sm2 && w.sm2.repetitions >= 3).length,
            dueToday: words.filter(w => !w.sm2 || w.sm2.nextReview <= now).length,
            dueTomorrow: words.filter(w => w.sm2 && w.sm2.nextReview > now && w.sm2.nextReview <= now + oneDay).length
        };
    }
}

// ==================== 词库管理器 ====================
class WordbookManager {
    constructor(db) {
        this.db = db;
    }

    async createWordbook(name, description = '') {
        const wordbook = {
            name,
            description,
            createdAt: Date.now(),
            wordCount: 0
        };
        return await this.db.add('wordbooks', wordbook);
    }

    async getWordbooks() {
        return await this.db.getAll('wordbooks');
    }

    async getWordbook(id) {
        return await this.db.get('wordbooks', id);
    }

    async updateWordbook(id, data) {
        const wordbook = await this.db.get('wordbooks', id);
        if (!wordbook) throw new Error('Wordbook not found');
        Object.assign(wordbook, data);
        return await this.db.put('wordbooks', wordbook);
    }

    async deleteWordbook(id) {
        // 删除词库及其所有单词
        const words = await this.db.query('words', 'wordbookId', id);
        for (const word of words) {
            await this.db.delete('words', word.id);
        }
        return await this.db.delete('wordbooks', id);
    }

    async addWord(wordbookId, wordData) {
        const word = {
            wordbookId,
            word: wordData.word,
            phonetic: wordData.phonetic || '',
            meaning: wordData.meaning,
            example: wordData.example || '',
            sm2: null,
            createdAt: Date.now()
        };
        const wordId = await this.db.add('words', word);

        // 更新词库单词数量
        const wordbook = await this.db.get('wordbooks', wordbookId);
        if (wordbook) {
            wordbook.wordCount = (wordbook.wordCount || 0) + 1;
            await this.db.put('wordbooks', wordbook);
        }

        return wordId;
    }

    async getWords(wordbookId) {
        return await this.db.query('words', 'wordbookId', wordbookId);
    }

    async updateWord(wordId, data) {
        const word = await this.db.get('words', wordId);
        if (!word) throw new Error('Word not found');
        Object.assign(word, data);
        return await this.db.put('words', word);
    }

    async deleteWord(wordId) {
        const word = await this.db.get('words', wordId);
        if (!word) return;

        await this.db.delete('words', wordId);

        // 更新词库单词数量
        const wordbook = await this.db.get('wordbooks', word.wordbookId);
        if (wordbook && wordbook.wordCount > 0) {
            wordbook.wordCount--;
            await this.db.put('wordbooks', wordbook);
        }
    }

    async importWords(wordbookId, wordsArray) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const wordData of wordsArray) {
            try {
                if (!wordData.word || !wordData.meaning) {
                    throw new Error('Missing required fields');
                }
                await this.addWord(wordbookId, wordData);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ word: wordData.word, error: error.message });
            }
        }

        return results;
    }

    async exportWords(wordbookId, format = 'csv') {
        const words = await this.getWords(wordbookId);
        const wordbook = await this.getWordbook(wordbookId);

        if (format === 'csv') {
            let csv = 'word,phonetic,meaning,example\n';
            for (const word of words) {
                csv += `"${word.word}","${word.phonetic}","${word.meaning}","${word.example}"\n`;
            }
            return {
                filename: `${wordbook.name}.csv`,
                content: csv,
                mimeType: 'text/csv'
            };
        } else if (format === 'json') {
            return {
                filename: `${wordbook.name}.json`,
                content: JSON.stringify({ wordbook, words }, null, 2),
                mimeType: 'application/json'
            };
        }
    }
}

// ==================== 学习记录管理器 ====================
class StudyRecordManager {
    constructor(db) {
        this.db = db;
    }

    async addRecord(wordId, quality, timeSpent) {
        const record = {
            wordId,
            quality,
            timeSpent,
            timestamp: Date.now(),
            date: new Date().toDateString()
        };
        return await this.db.add('study_records', record);
    }

    async getRecordsByWord(wordId) {
        return await this.db.query('study_records', 'wordId', wordId);
    }

    async getRecordsByDate(date) {
        return await this.db.query('study_records', 'date', date);
    }

    async getRecentRecords(days = 30) {
        const endDate = Date.now();
        const startDate = endDate - days * 24 * 60 * 60 * 1000;
        return await this.db.queryRange('study_records', 'timestamp', startDate, endDate);
    }

    async getStatistics(days = 30) {
        const records = await this.getRecentRecords(days);

        // 按日期分组
        const byDate = {};
        for (const record of records) {
            const date = record.date;
            if (!byDate[date]) {
                byDate[date] = {
                    total: 0,
                    correct: 0,
                    timeSpent: 0
                };
            }
            byDate[date].total++;
            if (record.quality >= 3) byDate[date].correct++;
            byDate[date].timeSpent += record.timeSpent || 0;
        }

        // 计算统计数据
        const stats = {
            totalWords: records.length,
            correctRate: records.length > 0 ? records.filter(r => r.quality >= 3).length / records.length : 0,
            averageTime: records.length > 0 ? records.reduce((sum, r) => sum + (r.timeSpent || 0), 0) / records.length : 0,
            byDate,
            streak: this.calculateStreak(byDate)
        };

        return stats;
    }

    calculateStreak(byDate) {
        const dates = Object.keys(byDate).sort().reverse();
        let streak = 0;
        const today = new Date().toDateString();

        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString();

            if (date === expectedDate || (i === 0 && date === today)) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }
}

// ==================== 成就管理器 ====================
class AchievementManager {
    constructor(db) {
        this.db = db;
        this.achievements = this.defineAchievements();
    }

    defineAchievements() {
        return [
            { id: 'first_word', name: '初学者', description: '学习第一个单词', icon: '🌱', condition: (stats) => stats.totalWords >= 1 },
            { id: 'ten_words', name: '入门者', description: '学习10个单词', icon: '📚', condition: (stats) => stats.totalWords >= 10 },
            { id: 'hundred_words', name: '勤奋者', description: '学习100个单词', icon: '💪', condition: (stats) => stats.totalWords >= 100 },
            { id: 'thousand_words', name: '词汇大师', description: '学习1000个单词', icon: '👑', condition: (stats) => stats.totalWords >= 1000 },
            { id: 'streak_7', name: '坚持者', description: '连续学习7天', icon: '🔥', condition: (stats) => stats.streak >= 7 },
            { id: 'streak_30', name: '毅力者', description: '连续学习30天', icon: '🏆', condition: (stats) => stats.streak >= 30 },
            { id: 'perfect_day', name: '完美一天', description: '一天内正确率100%', icon: '⭐', condition: (stats) => stats.todayCorrectRate === 1 && stats.todayTotal >= 10 },
            { id: 'speed_master', name: '速度大师', description: '平均每个单词用时<10秒', icon: '⚡', condition: (stats) => stats.averageTime < 10 && stats.totalWords >= 50 }
        ];
    }

    async checkAchievements(stats) {
        const unlocked = [];

        for (const achievement of this.achievements) {
            // 检查是否已解锁
            const existing = await this.db.get('achievements', achievement.id);
            if (existing) continue;

            // 检查解锁条件
            if (achievement.condition(stats)) {
                await this.db.add('achievements', {
                    id: achievement.id,
                    unlockedAt: Date.now()
                });
                unlocked.push(achievement);
            }
        }

        return unlocked;
    }

    async getUnlockedAchievements() {
        const unlocked = await this.db.getAll('achievements');
        return unlocked.map(u => {
            const achievement = this.achievements.find(a => a.id === u.id);
            return { ...achievement, unlockedAt: u.unlockedAt };
        });
    }

    async getProgress() {
        const unlocked = await this.getUnlockedAchievements();
        return {
            total: this.achievements.length,
            unlocked: unlocked.length,
            percentage: (unlocked.length / this.achievements.length) * 100
        };
    }
}

// ==================== 导出服务 ====================
class ExportService {
    static async exportStudyReport(wordbook, words, stats) {
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学习报告 - ${wordbook.name}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { color: #667eea; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 10px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #667eea; color: white; }
        .footer { margin-top: 40px; text-align: center; color: #888; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>📊 学习报告</h1>
    <h2>${wordbook.name}</h2>
    <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>

    <div class="stats">
        <div class="stat-card">
            <div class="stat-number">${words.length}</div>
            <div class="stat-label">总单词数</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${(stats.correctRate * 100).toFixed(1)}%</div>
            <div class="stat-label">正确率</div>
        </div>
        <div class="stat-card">
            <div class="stat-number">${stats.streak}</div>
            <div class="stat-label">连续学习天数</div>
        </div>
    </div>

    <h3>单词列表</h3>
    <table>
        <thead>
            <tr>
                <th>单词</th>
                <th>音标</th>
                <th>释义</th>
                <th>复习次数</th>
                <th>掌握度</th>
            </tr>
        </thead>
        <tbody>
            ${words.map(word => `
                <tr>
                    <td><strong>${word.word}</strong></td>
                    <td>${word.phonetic}</td>
                    <td>${word.meaning}</td>
                    <td>${word.sm2?.repetitions || 0}</td>
                    <td>${this.getMasteryLevel(word)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>由 背单词神器 Pro 生成 | Made with ❤️</p>
    </div>
</body>
</html>
        `;

        return {
            filename: `学习报告-${wordbook.name}-${new Date().toLocaleDateString('zh-CN')}.html`,
            content: html,
            mimeType: 'text/html'
        };
    }

    static getMasteryLevel(word) {
        if (!word.sm2 || word.sm2.repetitions === 0) return '新词';
        if (word.sm2.repetitions < 3) return '学习中';
        if (word.sm2.repetitions < 6) return '熟悉';
        return '已掌握';
    }

    static downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// ==================== PWA 管理器 ====================
class PWAManager {
    static async register() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker 注册成功:', registration);
                return registration;
            } catch (error) {
                console.error('Service Worker 注册失败:', error);
            }
        }
    }

    static async checkForUpdates() {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                await registration.update();
            }
        }
    }

    static async promptInstall() {
        // 监听 beforeinstallprompt 事件
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // 显示安装按钮
            return deferredPrompt;
        });

        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            return outcome === 'accepted';
        }

        return false;
    }
}

// ==================== 导出模块 ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IndexedDBManager,
        SM2Algorithm,
        WordbookManager,
        StudyRecordManager,
        AchievementManager,
        ExportService,
        PWAManager
    };
}
