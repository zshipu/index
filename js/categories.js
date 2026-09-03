/**
 * Categories页面交互脚本
 * Version: v1.0
 * 功能: 分类展示 + 统计 + 搜索
 */

(function() {
    'use strict';

    let allCategories = [];

    /**
     * 分类配置
     */
    const CATEGORY_CONFIG = {
        'ai': { name: 'AI人工智能', icon: '🤖', description: 'AI工具、ChatGPT、机器学习等前沿技术' },
        'ai001': { name: 'AI专区001', icon: '🤖', description: 'AI应用和实践案例分享' },
        'ai002': { name: 'AI专区002', icon: '🤖', description: 'AI资讯和行业动态' },
        'geek': { name: '技术开发', icon: '💻', description: '编程技术、开发工具、最佳实践' },
        'geek001': { name: '技术001', icon: '💻', description: '前端后端全栈技术' },
        'geek002': { name: '技术002', icon: '💻', description: '架构设计和系统优化' },
        'stock': { name: '股票金融', icon: '📈', description: '股市分析、投资策略、金融资讯' },
        'stock001': { name: '股票001', icon: '📈', description: '技术分析和交易策略' },
        'stock002': { name: '股票002', icon: '📈', description: '基本面分析和价值投资' },
        'gpt': { name: 'GPT大模型', icon: '🧠', description: 'GPT应用、Prompt工程、大模型技术' },
        'go': { name: 'Go语言', icon: '🐹', description: 'Go语言编程、并发、微服务' },
        'ecg': { name: '健康医疗', icon: '💊', description: 'ECG心电图、健康科普、医疗技术' },
        'ds': { name: '数据科学', icon: '📊', description: '数据分析、机器学习、统计建模' }
    };

    /**
     * 初始化
     */
    function init() {
        console.log('[Categories] 初始化分类页面...');

        loadCategoriesData().then(data => {
            allCategories = processCategoriesData(data);
            renderStats();
            renderCategories(allCategories);
            setupSearch();
        }).catch(error => {
            console.error('[Categories] 数据加载失败:', error);
            showError('数据加载失败，请刷新页面重试');
        });
    }

    /**
     * 加载分类数据
     */
    async function loadCategoriesData() {
        const response = await fetch('/site-links-by-category.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    }

    /**
     * 处理分类数据
     */
    function processCategoriesData(data) {
        const categories = [];

        Object.keys(data.data || {}).forEach(categoryKey => {
            const config = CATEGORY_CONFIG[categoryKey] || {
                name: categoryKey,
                icon: '📁',
                description: '分类文章集合'
            };

            const articles = data.data[categoryKey];

            categories.push({
                key: categoryKey,
                name: config.name,
                icon: config.icon,
                description: config.description,
                articleCount: articles.length,
                url: `/${categoryKey}/`,
                latestDate: articles[0]?.date || '未知'
            });
        });

        // 按文章数量排序
        categories.sort((a, b) => b.articleCount - a.articleCount);

        return categories;
    }

    /**
     * 渲染统计信息
     */
    function renderStats() {
        const totalCategories = allCategories.length;
        const totalArticles = allCategories.reduce((sum, cat) => sum + cat.articleCount, 0);

        document.getElementById('total-categories').textContent = totalCategories;
        document.getElementById('total-articles').textContent = totalArticles.toLocaleString();
    }

    /**
     * 渲染分类卡片
     */
    function renderCategories(categories) {
        const container = document.getElementById('categories-grid');

        if (!categories || categories.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9ca3af;">暂无分类</p>';
            return;
        }

        const html = categories.map(category => `
            <a href="${escapeHtml(category.url)}" class="category-card">
                <span class="category-icon">${category.icon}</span>
                <h2 class="category-name">${escapeHtml(category.name)}</h2>
                <p class="category-description">${escapeHtml(category.description)}</p>
                <div class="category-stats">
                    <div class="category-stat">
                        <span class="category-stat-icon">📄</span>
                        <span class="category-stat-value">${category.articleCount}</span>
                        <span>篇文章</span>
                    </div>
                    <div class="category-stat">
                        <span class="category-stat-icon">📅</span>
                        <span>最新: ${category.latestDate}</span>
                    </div>
                </div>
            </a>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * 设置搜索功能
     */
    function setupSearch() {
        const searchInput = document.getElementById('categories-search-input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim().toLowerCase();
                filterCategories(query);
            }, 300);
        });
    }

    /**
     * 过滤分类
     */
    function filterCategories(query) {
        const resultsInfo = document.getElementById('search-results-info');

        if (!query) {
            // 显示全部
            renderCategories(allCategories);
            resultsInfo.style.display = 'none';
            return;
        }

        // 过滤分类
        const filtered = allCategories.filter(category =>
            category.name.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query)
        );

        renderCategories(filtered);

        // 显示结果信息
        resultsInfo.textContent = filtered.length > 0
            ? `找到 ${filtered.length} 个包含 "${query}" 的分类`
            : `未找到包含 "${query}" 的分类`;
        resultsInfo.style.display = 'block';
    }

    /**
     * HTML转义
     */
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 显示错误
     */
    function showError(message) {
        const container = document.getElementById('categories-grid');
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #ef4444; grid-column: 1 / -1;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <div style="font-size: 18px;">${escapeHtml(message)}</div>
            </div>
        `;
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
