/**
 * Archives页面交互脚本
 * Version: v1.0
 * 功能: 全站归档展示 + 搜索 + 多视图切换
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        dataFiles: {
            full: '/site-links-full.json',
            byCategory: '/site-links-by-category.json',
            byMonth: '/site-links-by-month.json'
        },
        searchMinLength: 2,
        articlesPerPage: 100
    };

    // 数据缓存
    let dataCache = {
        full: null,
        byCategory: null,
        byMonth: null
    };

    let currentView = 'category'; // category | time | all
    let allArticles = [];

    /**
     * 初始化
     */
    function init() {
        console.log('[Archives] 初始化归档页面...');

        // 加载数据
        loadAllData().then(() => {
            renderStats();
            renderCategoryView();
            setupEventListeners();
        }).catch(error => {
            console.error('[Archives] 数据加载失败:', error);
            showError('数据加载失败，请刷新页面重试');
        });
    }

    /**
     * 加载所有数据
     */
    async function loadAllData() {
        try {
            // 并行加载所有数据
            const [fullData, categoryData, monthData] = await Promise.all([
                fetchJSON(CONFIG.dataFiles.full),
                fetchJSON(CONFIG.dataFiles.byCategory),
                fetchJSON(CONFIG.dataFiles.byMonth)
            ]);

            dataCache.full = fullData;
            dataCache.byCategory = categoryData;
            dataCache.byMonth = monthData;

            allArticles = fullData.articles || [];

            console.log('[Archives] 数据加载完成:', {
                total: allArticles.length,
                categories: Object.keys(categoryData.data || {}).length,
                months: (monthData.months || []).length
            });

        } catch (error) {
            throw new Error('数据加载失败: ' + error.message);
        }
    }

    /**
     * 获取JSON数据
     */
    async function fetchJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${url}`);
        }
        return response.json();
    }

    /**
     * 渲染统计卡片
     */
    function renderStats() {
        const stats = calculateStats();

        document.getElementById('total-articles').textContent = stats.totalArticles.toLocaleString();
        document.getElementById('total-categories').textContent = stats.totalCategories;
        document.getElementById('total-months').textContent = stats.totalMonths;
        document.getElementById('latest-update').textContent = stats.latestUpdate;
    }

    /**
     * 计算统计数据
     */
    function calculateStats() {
        const categories = Object.keys(dataCache.byCategory.data || {}).length;
        const months = (dataCache.byMonth.months || []).length;
        const latest = allArticles[0]?.date || '未知';

        return {
            totalArticles: allArticles.length,
            totalCategories: categories,
            totalMonths: months,
            latestUpdate: latest
        };
    }

    /**
     * 渲染按分类视图
     */
    function renderCategoryView() {
        const container = document.getElementById('category-view');
        const categoryData = dataCache.byCategory.data || {};

        // 分类图标映射
        const categoryIcons = {
            ai: '🤖', ai001: '🤖', ai002: '🤖',
            geek: '💻', geek001: '💻', geek002: '💻',
            stock: '📈', stock001: '📈', stock002: '📈',
            gpt: '🧠', go: '🐹', ecg: '💊', ds: '📊'
        };

        // 分类名称映射
        const categoryNames = {
            ai: 'AI人工智能', ai001: 'AI专区001', ai002: 'AI专区002',
            geek: '技术开发', geek001: '技术001', geek002: '技术002',
            stock: '股票金融', stock001: '股票001', stock002: '股票002',
            gpt: 'GPT大模型', go: 'Go语言', ecg: '健康医疗', ds: '数据科学'
        };

        let html = '';

        Object.keys(categoryData).sort((a, b) => {
            return categoryData[b].length - categoryData[a].length;
        }).forEach(categoryKey => {
            const articles = categoryData[categoryKey];
            const icon = categoryIcons[categoryKey] || '📄';
            const name = categoryNames[categoryKey] || categoryKey;

            html += `
                <div class="category-group">
                    <div class="category-header">
                        <div class="category-icon">${icon}</div>
                        <div class="category-info">
                            <h2>${name}</h2>
                            <div class="category-count">${articles.length} 篇文章</div>
                        </div>
                    </div>
                    <div class="article-grid">
                        ${articles.slice(0, 12).map(article => `
                            <div class="article-card">
                                <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                                    <div class="article-title">${escapeHtml(article.title)}</div>
                                    <div class="article-date">${article.date || '日期未知'}</div>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                    ${articles.length > 12 ? `
                        <div style="text-align: center; margin-top: 15px;">
                            <a href="/${categoryKey}/" style="color: #6366f1; font-size: 14px;">
                                查看全部 ${articles.length} 篇文章 →
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    /**
     * 渲染按时间视图
     */
    function renderTimeView() {
        const container = document.getElementById('time-view');
        const monthData = dataCache.byMonth.data || {};
        const months = dataCache.byMonth.months || [];

        let html = '<div class="timeline-archive">';
        let currentYear = '';

        months.forEach(month => {
            const [year, monthNum] = month.split('-');
            const articles = monthData[month] || [];

            // 年份标记
            if (year !== currentYear) {
                if (currentYear) html += '</div>'; // 关闭上一个年份组
                html += `
                    <div class="year-group">
                        <div class="year-header">
                            <div class="year-marker">📅</div>
                            <h2 class="year-title">${year}</h2>
                        </div>
                `;
                currentYear = year;
            }

            // 月份分组
            const monthNames = ['', '一月', '二月', '三月', '四月', '五月', '六月',
                              '七月', '八月', '九月', '十月', '十一月', '十二月'];
            const monthName = monthNames[parseInt(monthNum)] || monthNum;

            html += `
                <div class="month-group">
                    <h3 class="month-title">${monthName} (${articles.length} 篇)</h3>
                    <ul class="article-list">
                        ${articles.map(article => `
                            <li class="article-item">
                                <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                                    <span class="article-name">${escapeHtml(article.title)}</span>
                                    <span class="article-meta">
                                        <span>${article.icon || '📄'}</span>
                                        <span>${article.date || ''}</span>
                                    </span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });

        if (currentYear) html += '</div>'; // 关闭最后一个年份组
        html += '</div>';

        container.innerHTML = html;
    }

    /**
     * 渲染全部文章视图
     */
    function renderAllView() {
        const container = document.getElementById('all-view');

        let html = '<div class="article-grid">';

        allArticles.slice(0, CONFIG.articlesPerPage).forEach(article => {
            html += `
                <div class="article-card">
                    <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                        <div class="article-title">${article.icon || '📄'} ${escapeHtml(article.title)}</div>
                        <div class="article-date">${article.date || '日期未知'} | ${article.category || ''}</div>
                    </a>
                </div>
            `;
        });

        html += '</div>';

        if (allArticles.length > CONFIG.articlesPerPage) {
            html += `
                <div style="text-align: center; margin-top: 30px; color: #6b7280;">
                    显示前 ${CONFIG.articlesPerPage} 篇，共 ${allArticles.length} 篇文章
                </div>
            `;
        }

        container.innerHTML = html;
    }

    /**
     * 切换视图
     */
    function switchView(view) {
        if (view === currentView) return;

        currentView = view;

        // 更新tab状态
        document.querySelectorAll('.archive-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.archive-section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(`${view}-view`);
        targetSection.classList.add('active');

        // 如果视图内容为空，则渲染
        if (targetSection.innerHTML.trim() === '') {
            if (view === 'time') {
                renderTimeView();
            } else if (view === 'all') {
                renderAllView();
            }
        }
    }

    /**
     * 搜索文章
     */
    function searchArticles(query) {
        if (!query || query.length < CONFIG.searchMinLength) {
            document.getElementById('search-results').style.display = 'none';
            return;
        }

        const results = allArticles.filter(article => {
            return article.title.toLowerCase().includes(query.toLowerCase());
        });

        displaySearchResults(results, query);
    }

    /**
     * 显示搜索结果
     */
    function displaySearchResults(results, query) {
        const resultsDiv = document.getElementById('search-results');

        if (results.length === 0) {
            resultsDiv.innerHTML = `未找到包含 "${escapeHtml(query)}" 的文章`;
            resultsDiv.style.display = 'block';
            return;
        }

        let html = `找到 ${results.length} 篇包含 "${escapeHtml(query)}" 的文章：<div class="article-grid" style="margin-top: 15px;">`;

        results.slice(0, 20).forEach(article => {
            html += `
                <div class="article-card">
                    <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                        <div class="article-title">${article.icon || '📄'} ${highlightQuery(article.title, query)}</div>
                        <div class="article-date">${article.date || ''} | ${article.category || ''}</div>
                    </a>
                </div>
            `;
        });

        html += '</div>';

        if (results.length > 20) {
            html += `<div style="margin-top: 15px;">仅显示前20条结果</div>`;
        }

        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
    }

    /**
     * 高亮搜索关键词
     */
    function highlightQuery(text, query) {
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escapeHtml(text).replace(regex, '<strong style="background: #fef3c7;">$1</strong>');
    }

    /**
     * 转义正则表达式特殊字符
     */
    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        const container = document.querySelector('.archive-content');
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #ef4444;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <div style="font-size: 18px;">${escapeHtml(message)}</div>
            </div>
        `;
    }

    /**
     * 设置事件监听
     */
    function setupEventListeners() {
        // Tab切换
        document.querySelectorAll('.archive-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const view = tab.getAttribute('data-view');
                switchView(view);
            });
        });

        // 搜索
        const searchInput = document.getElementById('archive-search-input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchArticles(e.target.value.trim());
            }, 300);
        });

        console.log('[Archives] 事件监听设置完成');
    }

    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
