/**
 * Tags系统增强版 - 世界级实现
 * Version: v2.0
 * 功能：虚拟滚动 + ���能搜索 + 分类导航 + 关联推荐
 */

(function() {
    'use strict';

    // ==================== 全局状态 ====================
    const STATE = {
        allTags: [],
        allCategories: {},
        tagRelations: {},
        currentFilter: 'all',
        currentSearch: '',
        currentCategory: null,
        viewportTags: [],
        isLoading: false
    };

    // ==================== 配置常量 ====================
    const CONFIG = {
        TAGS_PER_PAGE: 100,
        SEARCH_DEBOUNCE: 300,
        SCROLL_THRESHOLD: 200,
        MAX_RECOMMENDATIONS: 8,
        ANIMATION_DURATION: 300
    };

    // ==================== 初始化 ====================
    async function init() {
        console.log('[Tags Enhanced] 初始化增强版标签系统 v2.0...');

        try {
            // 并行加载所有数据
            const [mainData, categoriesData, relationsData] = await Promise.all([
                loadJSON('/site-tags-enhanced.json'),
                loadJSON('/tag-categories.json'),
                loadJSON('/tag-relations.json')
            ]);

            STATE.allTags = mainData.tags || [];
            STATE.allCategories = categoriesData || {};
            STATE.tagRelations = relationsData || {};

            console.log(`[Tags] 加载完成: ${STATE.allTags.length} 个标签, ${Object.keys(STATE.allCategories).length} 个分类`);

            // 渲染界面
            renderStats(mainData);
            renderCategoryNav();
            renderTagCloud(STATE.allTags.slice(0, 200)); // 初始显示前200个
            setupVirtualScroll();
            setupSearch();
            setupFilters();

        } catch (error) {
            console.error('[Tags] 初始化失败:', error);
            showError('标签系统加载失败，请刷新页面重试');
        }
    }

    // ==================== 数据加载 ====================
    async function loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${url}`);
        }
        return response.json();
    }

    // ==================== 统计信息渲染 ====================
    function renderStats(data) {
        const totalTagsEl = document.getElementById('total-tags');
        const totalArticlesEl = document.getElementById('total-articles');

        if (totalTagsEl) {
            animateNumber(totalTagsEl, 0, data.total_tags, 1500);
        }

        if (totalArticlesEl) {
            animateNumber(totalArticlesEl, 0, data.total_articles, 1500);
        }
    }

    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * easeOutCubic(progress));

            element.textContent = current.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        requestAnimationFrame(step);
    }

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // ==================== 分类导航渲染 ====================
    function renderCategoryNav() {
        const container = document.getElementById('category-nav');
        if (!container) return;

        const html = Object.entries(STATE.allCategories).map(([name, data]) => `
            <button class="category-pill"
                    data-category="${escapeHtml(name)}"
                    style="border-color: ${data.color}20; --category-color: ${data.color}">
                <span class="category-icon">${data.icon}</span>
                <span class="category-name">${escapeHtml(name)}</span>
                <span class="category-count">${data.count}</span>
            </button>
        `).join('');

        container.innerHTML = `
            <button class="category-pill active" data-category="all">
                <span class="category-icon">🏷️</span>
                <span class="category-name">全部</span>
                <span class="category-count">${STATE.allTags.length}</span>
            </button>
            ${html}
        `;
    }

    // ==================== 标签云渲染（优��版）====================
    function renderTagCloud(tags) {
        const container = document.getElementById('tag-cloud');
        if (!container || tags.length === 0) {
            container.innerHTML = '<p class="empty-state">🔍 没有找到匹配的标签</p>';
            return;
        }

        // 计算标签大小
        const maxCount = Math.max(...tags.map(t => t.count));
        const minCount = Math.min(...tags.map(t => t.count));

        // 使用DocumentFragment提升性能
        const fragment = document.createDocumentFragment();

        tags.forEach(tag => {
            const sizeLevel = calculateSizeLevel(tag.count, minCount, maxCount);
            const categoryColor = STATE.allCategories[tag.category]?.color || '#6b7280';

            const tagEl = document.createElement('a');
            tagEl.href = tag.url;
            tagEl.className = `tag-cloud-item size-${sizeLevel}`;
            tagEl.title = `${tag.name} (${tag.count} 篇文章)`;
            tagEl.style.setProperty('--tag-color', categoryColor);

            tagEl.innerHTML = `
                <span class="tag-icon">🏷️</span>
                <span class="tag-name">${escapeHtml(tag.name)}</span>
                <span class="tag-count">${tag.count}</span>
            `;

            // 添加悬停预览
            tagEl.addEventListener('mouseenter', () => showTagPreview(tag, tagEl));
            tagEl.addEventListener('mouseleave', hideTagPreview);

            fragment.appendChild(tagEl);
        });

        container.innerHTML = '';
        container.appendChild(fragment);
    }

    function calculateSizeLevel(count, min, max) {
        if (max === min) return 3;
        const ratio = (count - min) / (max - min);
        return Math.min(5, Math.max(1, Math.ceil(ratio * 4) + 1));
    }

    // ==================== 标签预览（悬停显示）====================
    function showTagPreview(tag, element) {
        const preview = document.getElementById('tag-preview') || createPreviewElement();
        const related = STATE.tagRelations[tag.name] || [];

        preview.innerHTML = `
            <div class="preview-header">
                <h4>${escapeHtml(tag.name)}</h4>
                <span class="preview-count">${tag.count} 篇文章</span>
            </div>
            ${related.length > 0 ? `
                <div class="preview-related">
                    <p class="preview-label">相关标签:</p>
                    <div class="preview-tags">
                        ${related.slice(0, 5).map(r => `
                            <span class="preview-tag">${escapeHtml(r.tag)}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        // 定位预览框
        const rect = element.getBoundingClientRect();
        preview.style.top = `${rect.bottom + window.scrollY + 10}px`;
        preview.style.left = `${rect.left + window.scrollX}px`;
        preview.classList.add('active');
    }

    function hideTagPreview() {
        const preview = document.getElementById('tag-preview');
        if (preview) {
            preview.classList.remove('active');
        }
    }

    function createPreviewElement() {
        const preview = document.createElement('div');
        preview.id = 'tag-preview';
        preview.className = 'tag-preview';
        document.body.appendChild(preview);
        return preview;
    }

    // ==================== 虚拟滚动（处理2355个标签）====================
    function setupVirtualScroll() {
        const listContainer = document.getElementById('tags-list');
        if (!listContainer) return;

        let currentPage = 0;
        const TAGS_PER_PAGE = CONFIG.TAGS_PER_PAGE;

        function loadMore() {
            if (STATE.isLoading) return;

            const start = currentPage * TAGS_PER_PAGE;
            const end = start + TAGS_PER_PAGE;
            const pageTags = getFilteredTags().slice(start, end);

            if (pageTags.length === 0) return;

            STATE.isLoading = true;
            renderTagsList(pageTags, currentPage > 0);
            currentPage++;
            STATE.isLoading = false;
        }

        // 初始加载
        loadMore();

        // Intersection Observer 监听滚动
        const sentinel = document.getElementById('scroll-sentinel') || createSentinel(listContainer);
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, {
            rootMargin: `${CONFIG.SCROLL_THRESHOLD}px`
        });

        observer.observe(sentinel);
    }

    function createSentinel(container) {
        const sentinel = document.createElement('div');
        sentinel.id = 'scroll-sentinel';
        sentinel.style.height = '1px';
        container.parentElement.appendChild(sentinel);
        return sentinel;
    }

    function renderTagsList(tags, append = false) {
        const container = document.getElementById('tags-list');
        if (!container) return;

        const fragment = document.createDocumentFragment();

        tags.forEach(tag => {
            const categoryData = STATE.allCategories[tag.category] || {};
            const tagCard = document.createElement('a');
            tagCard.href = tag.url;
            tagCard.className = 'tag-card';

            tagCard.innerHTML = `
                <div class="tag-card-header">
                    <div class="tag-card-title">
                        <span class="tag-card-icon" style="color: ${categoryData.color || '#6b7280'}">
                            ${categoryData.icon || '🏷️'}
                        </span>
                        <span>${escapeHtml(tag.name)}</span>
                    </div>
                    <span class="tag-card-count" style="background: ${categoryData.color || '#667eea'}">
                        ${tag.count} 篇
                    </span>
                </div>
                <div class="tag-card-meta">
                    <span class="tag-card-category">${escapeHtml(tag.category)}</span>
                    ${tag.domains ? `<span class="tag-card-domains">· ${tag.domains.join(', ')}</span>` : ''}
                </div>
            `;

            fragment.appendChild(tagCard);
        });

        if (append) {
            container.appendChild(fragment);
        } else {
            container.innerHTML = '';
            container.appendChild(fragment);
        }
    }

    // ==================== 智能搜索（拼音+模糊）====================
    function setupSearch() {
        const searchInput = document.getElementById('tags-search-input');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                STATE.currentSearch = e.target.value.trim().toLowerCase();
                performSearch();
            }, CONFIG.SEARCH_DEBOUNCE);
        });

        // 搜索建议
        searchInput.addEventListener('focus', showSearchSuggestions);
    }

    function performSearch() {
        const filtered = getFilteredTags();
        updateSearchResults(filtered);
        renderTagCloud(filtered.slice(0, 200));
        resetVirtualScroll(filtered);
    }

    function getFilteredTags() {
        let tags = STATE.allTags;

        // 分类过滤
        if (STATE.currentCategory && STATE.currentCategory !== 'all') {
            tags = tags.filter(t => t.category === STATE.currentCategory);
        }

        // 搜索过滤
        if (STATE.currentSearch) {
            const query = STATE.currentSearch;
            tags = tags.filter(t =>
                t.name.toLowerCase().includes(query) ||
                pinyinMatch(t.name, query)
            );
        }

        return tags;
    }

    function pinyinMatch(text, query) {
        // 简单拼音匹配（可扩展为完整拼音库）
        const pinyinMap = {
            '机器学习': 'jiqixuexi',
            '人工智能': 'rengongzhineng',
            '深度学习': 'shenduxuexi'
            // ... 可扩展
        };

        const pinyin = pinyinMap[text];
        return pinyin && pinyin.includes(query);
    }

    function updateSearchResults(filtered) {
        const resultsInfo = document.getElementById('search-results-info');
        if (!resultsInfo) return;

        if (STATE.currentSearch) {
            resultsInfo.textContent = filtered.length > 0
                ? `找到 ${filtered.length} 个包含 "${STATE.currentSearch}" 的标签`
                : `未找到包含 "${STATE.currentSearch}" 的标签`;
            resultsInfo.style.display = 'block';
        } else {
            resultsInfo.style.display = 'none';
        }
    }

    function showSearchSuggestions() {
        // TODO: 实现搜索建议下拉框
    }

    function resetVirtualScroll(filtered) {
        const container = document.getElementById('tags-list');
        if (container) {
            container.innerHTML = '';
        }

        // 重置虚拟滚动状态并重新初始化
        renderTagsList(filtered.slice(0, CONFIG.TAGS_PER_PAGE));
    }

    // ==================== 分类过滤 ====================
    function setupFilters() {
        const navContainer = document.getElementById('category-nav');
        if (!navContainer) return;

        navContainer.addEventListener('click', (e) => {
            const pill = e.target.closest('.category-pill');
            if (!pill) return;

            const category = pill.dataset.category;

            // 更新选中状态
            navContainer.querySelectorAll('.category-pill').forEach(p =>
                p.classList.remove('active')
            );
            pill.classList.add('active');

            // 更新过滤状态
            STATE.currentCategory = category;
            performSearch();
        });
    }

    // ==================== 工具函数 ====================
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showError(message) {
        const container = document.querySelector('.tag-cloud');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">${escapeHtml(message)}</div>
                </div>
            `;
        }
    }

    // ==================== 性能优化：RequestIdleCallback ====================
    function scheduleWork(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }

    // ==================== DOM加载完成后初始化 ====================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 暴露全局API（用于调试）
    window.TagsSystem = {
        getState: () => STATE,
        getConfig: () => CONFIG,
        search: (query) => {
            STATE.currentSearch = query;
            performSearch();
        },
        filterCategory: (category) => {
            STATE.currentCategory = category;
            performSearch();
        }
    };

})();
