/**
 * 首页右侧栏内链动态加载脚本
 * Homepage Sidebar Internal Links Script
 * 版本: v1.0
 * 创建日期: 2025-10-14
 */

(function() {
    'use strict';

    // 配置
    const CONFIG = {
        recentCount: 15,
        categoryCount: 5,
        monthlyCount: 10,
        randomCount: 10,
        dataPath: {
            recent: '/site-links-recent.json',
            byCategory: '/site-links-by-category.json',
            byMonth: '/site-links-by-month.json'
        }
    };

    let dataCache = {};

    // ==========================================
    // 数据加载
    // ==========================================

    /**
     * 加载JSON数据
     * @param {string} type - 数据类型
     * @returns {Promise<Object>}
     */
    async function loadData(type) {
        if (dataCache[type]) {
            return dataCache[type];
        }

        try {
            const response = await fetch(CONFIG.dataPath[type]);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            dataCache[type] = data;
            return data;
        } catch (error) {
            console.error('加载内链数据失败:', type, error);
            return null;
        }
    }

    // ==========================================
    // 渲染函数
    // ==========================================

    /**
     * 渲染最新文章列表
     */
    async function renderRecentArticles() {
        const container = document.getElementById('recent-articles');
        if (!container) return;

        // 显示加载状态
        showLoading(container);

        try {
            const data = await loadData('recent');
            if (!data || !data.articles) {
                showError(container, '加载失败');
                return;
            }

            const html = data.articles.slice(0, CONFIG.recentCount).map(article => `
                <li>
                    <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                        <span class="article-icon">${article.icon || '📄'}</span>
                        <span class="article-title">${escapeHtml(article.title)}</span>
                        <span class="article-date">${article.date || ''}</span>
                    </a>
                </li>
            `).join('');

            container.innerHTML = html;
        } catch (error) {
            showError(container, '加载失败');
        }
    }

    /**
     * 渲染分类文章（带Tab切换）
     */
    async function renderCategoryArticles() {
        const container = document.getElementById('category-articles');
        const tabsContainer = document.querySelector('.category-tabs');

        if (!container || !tabsContainer) return;

        showLoading(container);

        try {
            const data = await loadData('byCategory');
            if (!data || !data.data) {
                showError(container, '加载失败');
                return;
            }

            // 获取分类列表（只显示有文章的分类）
            const categories = Object.keys(data.data).filter(cat =>
                data.data[cat] && data.data[cat].length > 0
            );

            if (categories.length === 0) {
                showEmpty(container, '暂无分类文章');
                return;
            }

            // 创建Tab标签
            const categoryMap = {
                'ai': 'AI', 'ai001': 'AI+', 'ai002': 'AI++',
                'geek': '技术', 'geek001': '技术+', 'geek002': '技术++',
                'stock': '股票', 'stock001': '股票+', 'stock002': '股票++',
                'gpt': 'GPT', 'go': 'Go', 'ecg': '健康', 'ds': '数据'
            };

            // 选择前6个主要分类
            const mainCategories = ['ai', 'geek', 'stock', 'gpt', 'go', 'ecg']
                .filter(cat => categories.includes(cat));

            if (mainCategories.length === 0) {
                // 如果没有主要分类，使用前6个有数据的分类
                mainCategories.push(...categories.slice(0, 6));
            }

            // 渲染Tab
            tabsContainer.innerHTML = mainCategories.map((cat, index) => `
                <div class="tab ${index === 0 ? 'active' : ''}" data-category="${cat}">
                    ${categoryMap[cat] || cat}
                </div>
            `).join('');

            // 绑定Tab点击事件
            tabsContainer.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', function() {
                    // 移除所有active
                    tabsContainer.querySelectorAll('.tab').forEach(t =>
                        t.classList.remove('active')
                    );
                    // 添加当前active
                    this.classList.add('active');
                    // 更新文章列表
                    updateCategoryArticles(this.dataset.category, data.data);
                });
            });

            // 显示第一个分类的文章
            updateCategoryArticles(mainCategories[0], data.data);

        } catch (error) {
            showError(container, '加载失败');
        }
    }

    /**
     * 更新分类文章列表
     * @param {string} category - 分类名称
     * @param {Object} allData - 所有分类数据
     */
    function updateCategoryArticles(category, allData) {
        const container = document.getElementById('category-articles');
        if (!container) return;

        const articles = allData[category] || [];

        if (articles.length === 0) {
            showEmpty(container, '该分类暂无文章');
            return;
        }

        const html = articles.slice(0, CONFIG.categoryCount).map(article => `
            <li>
                <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                    <span class="article-icon">${article.icon || '📄'}</span>
                    <span class="article-title">${escapeHtml(article.title)}</span>
                </a>
            </li>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * 渲染月度归档（折叠面板）
     */
    async function renderMonthlyArchive() {
        const container = document.getElementById('archive-months');
        if (!container) return;

        showLoading(container);

        try {
            const data = await loadData('byMonth');
            if (!data || !data.months || !data.data) {
                showError(container, '加载失败');
                return;
            }

            const html = data.months.slice(0, 12).map((month, index) => {
                const articles = data.data[month] || [];
                const count = articles.length;
                const isOpen = index === 0; // 默认打开第一个

                return `
                    <div class="accordion-item ${isOpen ? 'active' : ''}">
                        <div class="accordion-header" onclick="window.toggleAccordion(this)">
                            <span>${month} (${count}篇)</span>
                            <span class="accordion-icon">▶</span>
                        </div>
                        <div class="accordion-content" style="display: ${isOpen ? 'block' : 'none'}">
                            <ul class="widget-list internal-links-list">
                                ${articles.slice(0, CONFIG.monthlyCount).map(article => `
                                    <li>
                                        <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                                            <span class="article-icon">${article.icon || '📄'}</span>
                                            <span class="article-title">${escapeHtml(article.title)}</span>
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                            ${count > CONFIG.monthlyCount ? `
                                <a href="/archives/?month=${month}" class="view-all-link">
                                    查看${month}全部${count}篇 →
                                </a>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
        } catch (error) {
            showError(container, '加载失败');
        }
    }

    /**
     * 渲染随机文章
     */
    async function renderRandomArticles() {
        const container = document.getElementById('random-articles');
        if (!container) return;

        try {
            const data = await loadData('recent');
            if (!data || !data.articles) {
                showError(container, '加载失败');
                return;
            }

            const allArticles = data.articles;
            const randomArticles = getRandomItems(allArticles, CONFIG.randomCount);

            const html = randomArticles.map(article => `
                <li>
                    <a href="${escapeHtml(article.path)}" title="${escapeHtml(article.title)}">
                        <span class="article-icon">${article.icon || '📄'}</span>
                        <span class="article-title">${escapeHtml(article.title)}</span>
                    </a>
                </li>
            `).join('');

            container.innerHTML = html;
        } catch (error) {
            showError(container, '加载失败');
        }
    }

    // ==========================================
    // 工具函数
    // ==========================================

    /**
     * 随机抽取数组元素
     * @param {Array} array - 原数组
     * @param {number} count - 抽取数量
     * @returns {Array}
     */
    function getRandomItems(array, count) {
        const result = [];
        const used = new Set();
        const maxCount = Math.min(count, array.length);

        while (result.length < maxCount) {
            const index = Math.floor(Math.random() * array.length);
            if (!used.has(index)) {
                used.add(index);
                result.push(array[index]);
            }
        }

        return result;
    }

    /**
     * HTML转义
     * @param {string} text - 原文本
     * @returns {string}
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 显示加载状态
     * @param {HTMLElement} container - 容器元素
     */
    function showLoading(container) {
        container.innerHTML = `
            <div class="loading-skeleton">
                <div class="skeleton-line" style="width: 90%"></div>
                <div class="skeleton-line" style="width: 70%"></div>
            </div>
            <div class="loading-skeleton">
                <div class="skeleton-line" style="width: 85%"></div>
                <div class="skeleton-line" style="width: 75%"></div>
            </div>
            <div class="loading-skeleton">
                <div class="skeleton-line" style="width: 80%"></div>
                <div class="skeleton-line" style="width: 65%"></div>
            </div>
        `;
    }

    /**
     * 显示错误信息
     * @param {HTMLElement} container - 容器元素
     * @param {string} message - 错误信息
     */
    function showError(container, message) {
        container.innerHTML = `
            <div class="widget-error">
                ⚠️ ${message}
            </div>
        `;
    }

    /**
     * 显示空状态
     * @param {HTMLElement} container - 容器元素
     * @param {string} message - 提示信息
     */
    function showEmpty(container, message) {
        container.innerHTML = `
            <div class="widget-empty">
                ${message}
            </div>
        `;
    }

    // ==========================================
    // 全局函数
    // ==========================================

    /**
     * 切换折叠面板
     * @param {HTMLElement} header - 面板头部元素
     */
    window.toggleAccordion = function(header) {
        const item = header.parentElement;
        const content = item.querySelector('.accordion-content');
        const icon = header.querySelector('.accordion-icon');
        const isOpen = item.classList.contains('active');

        if (isOpen) {
            item.classList.remove('active');
            content.style.display = 'none';
        } else {
            item.classList.add('active');
            content.style.display = 'block';
        }
    };

    /**
     * 刷新随机文章
     */
    window.refreshRandom = function() {
        renderRandomArticles();
    };

    // ==========================================
    // 初始化
    // ==========================================

    function init() {
        // DOM加载完成后执行
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', loadAllWidgets);
        } else {
            loadAllWidgets();
        }
    }

    /**
     * 加载所有Widget
     */
    function loadAllWidgets() {
        // 延迟加载，避免阻塞主要内容
        setTimeout(function() {
            renderRecentArticles();
            renderCategoryArticles();
            renderMonthlyArchive();
            renderRandomArticles();
        }, 100);
    }

    // 启动初始化
    init();

})();
