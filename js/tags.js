/**
 * Tags页面交互脚本
 * Version: v1.0
 * 功能: 标签云展示 + 标签列表 + 搜索
 */

(function() {
    'use strict';

    let allTags = [];

    /**
     * 初始化
     */
    function init() {
        console.log('[Tags] 初始化标签页面...');

        loadTagsData().then(data => {
            allTags = data.tags || [];
            renderStats(data);
            renderTagCloud(allTags);
            renderTagsList(allTags);
            setupSearch();
        }).catch(error => {
            console.error('[Tags] 数据加载失败:', error);
            showError('数据加载失败，请刷新页面重试');
        });
    }

    /**
     * 加载标签数据
     */
    async function loadTagsData() {
        const response = await fetch('/site-tags.json');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    }

    /**
     * 渲染统计信息
     */
    function renderStats(data) {
        document.getElementById('total-tags').textContent = data.total || 0;

        const totalArticles = allTags.reduce((sum, tag) => sum + tag.count, 0);
        document.getElementById('total-articles').textContent = totalArticles;
    }

    /**
     * 渲染标签云
     */
    function renderTagCloud(tags) {
        const container = document.getElementById('tag-cloud');

        if (!tags || tags.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9ca3af;">暂无标签</p>';
            return;
        }

        // 计算标签大小级别 (1-5)
        const maxCount = Math.max(...tags.map(t => t.count));
        const minCount = Math.min(...tags.map(t => t.count));

        const html = tags.map(tag => {
            // 计算size级别
            let sizeLevel = 3; // 默认中等
            if (maxCount > minCount) {
                const ratio = (tag.count - minCount) / (maxCount - minCount);
                sizeLevel = Math.ceil(ratio * 4) + 1; // 1-5级
            }

            return `
                <a href="${escapeHtml(tag.url)}"
                   class="tag-cloud-item size-${sizeLevel}"
                   title="${escapeHtml(tag.name)} (${tag.count} 篇文章)">
                    <span class="tag-icon">🏷️</span>
                    <span class="tag-name">${escapeHtml(tag.name)}</span>
                    <span class="tag-count">${tag.count}</span>
                </a>
            `;
        }).join('');

        container.innerHTML = html;
    }

    /**
     * 渲染标签列表
     */
    function renderTagsList(tags) {
        const container = document.getElementById('tags-list');

        if (!tags || tags.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #9ca3af;">暂无标签</p>';
            return;
        }

        const html = tags.map(tag => `
            <a href="${escapeHtml(tag.url)}" class="tag-card">
                <div class="tag-card-header">
                    <div class="tag-card-title">
                        <span class="tag-card-icon">🏷️</span>
                        <span>${escapeHtml(tag.name)}</span>
                    </div>
                    <span class="tag-card-count">${tag.count} 篇</span>
                </div>
                <div class="tag-card-description">
                    点击查看��标签下的所有文章
                </div>
            </a>
        `).join('');

        container.innerHTML = html;
    }

    /**
     * 设置搜索功能
     */
    function setupSearch() {
        const searchInput = document.getElementById('tags-search-input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim().toLowerCase();
                filterTags(query);
            }, 300);
        });
    }

    /**
     * 过滤标签
     */
    function filterTags(query) {
        const resultsInfo = document.getElementById('search-results-info');

        if (!query) {
            // 显示全部
            renderTagCloud(allTags);
            renderTagsList(allTags);
            resultsInfo.style.display = 'none';
            return;
        }

        // 过滤标签
        const filtered = allTags.filter(tag =>
            tag.name.toLowerCase().includes(query)
        );

        renderTagCloud(filtered);
        renderTagsList(filtered);

        // 显示结果信息
        resultsInfo.textContent = filtered.length > 0
            ? `找到 ${filtered.length} 个包含 "${query}" 的标签`
            : `未找到包含 "${query}" 的标签`;
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
        const container = document.querySelector('.tag-cloud');
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #ef4444;">
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
