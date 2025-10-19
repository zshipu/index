/**
 * 知识铺首页交互脚本 v3.0 - ULTRATHINK
 * Homepage JavaScript - Modern Interactions
 * Author: AI设计大师
 * Date: 2025-10-18
 */

(function() {
  'use strict';

  // ==========================================
  // 全局配置
  // ==========================================
  const CONFIG = {
    DEBUG: window.location.hostname === 'localhost',
    API_BASE: '/api',
    ARTICLES_PER_PAGE: 12,
    ANIMATION_DURATION: 300,
  };

  // ==========================================
  // 工具函数
  // ==========================================
  const utils = {
    // 防抖
    debounce(func, wait) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    },

    // 节流
    throttle(func, wait) {
      let timeout;
      let previous = 0;
      return function(...args) {
        const now = Date.now();
        const remaining = wait - (now - previous);
        if (remaining <= 0) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          previous = now;
          func.apply(this, args);
        } else if (!timeout) {
          timeout = setTimeout(() => {
            previous = Date.now();
            timeout = null;
            func.apply(this, args);
          }, remaining);
        }
      };
    },

    // 平滑滚动到元素
    scrollToElement(element, offset = 0) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    },

    // 检查元素是否在视口
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },

    // 生成唯一ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 日志
    log(...args) {
      if (CONFIG.DEBUG) {
        console.log('[Homepage v3]', ...args);
      }
    }
  };

  // ==========================================
  // 主题切换模块
  // ==========================================
  const ThemeModule = {
    init() {
      this.themeToggle = document.getElementById('themeToggle');
      this.currentTheme = localStorage.getItem('theme') || 'light';

      // 应用主题
      this.applyTheme(this.currentTheme);

      // 绑定切换事件
      if (this.themeToggle) {
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
      }

      utils.log('ThemeModule initialized');
    },

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      this.currentTheme = theme;
    },

    toggleTheme() {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.applyTheme(newTheme);
      utils.log('Theme switched to:', newTheme);
    }
  };

  // ==========================================
  // 移动端菜单模块
  // ==========================================
  const MobileMenuModule = {
    init() {
      this.menuToggle = document.getElementById('menuToggle');
      this.leftSidebar = document.getElementById('leftSidebar');
      this.overlay = this.createOverlay();

      if (this.menuToggle && this.leftSidebar) {
        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.overlay.addEventListener('click', () => this.closeMenu());
      }

      utils.log('MobileMenuModule initialized');
    },

    createOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'mobile-menu-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99;
        display: none;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(overlay);
      return overlay;
    },

    toggleMenu() {
      if (this.leftSidebar.classList.contains('open')) {
        this.closeMenu();
      } else {
        this.openMenu();
      }
    },

    openMenu() {
      this.leftSidebar.classList.add('open');
      this.overlay.style.display = 'block';
      setTimeout(() => {
        this.overlay.style.opacity = '1';
      }, 10);
      document.body.style.overflow = 'hidden';
    },

    closeMenu() {
      this.leftSidebar.classList.remove('open');
      this.overlay.style.opacity = '0';
      setTimeout(() => {
        this.overlay.style.display = 'none';
      }, 300);
      document.body.style.overflow = '';
    }
  };

  // ==========================================
  // 搜索模块
  // ==========================================
  const SearchModule = {
    init() {
      this.searchInput = document.getElementById('searchInput');
      this.searchForm = document.getElementById('searchForm');
      this.heroSearchForm = document.querySelector('.hero-search-form');

      // 绑定搜索快捷键 (Ctrl/Cmd + K)
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          if (this.searchInput) {
            this.searchInput.focus();
          }
        }
      });

      // 绑定表单提交
      if (this.searchForm) {
        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));
      }
      if (this.heroSearchForm) {
        this.heroSearchForm.addEventListener('submit', (e) => this.handleSearch(e));
      }

      utils.log('SearchModule initialized');
    },

    handleSearch(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const query = formData.get('q');

      if (query && query.trim()) {
        window.location.href = `/search/?q=${encodeURIComponent(query.trim())}`;
      }
    }
  };

  // ==========================================
  // 返回顶部模块
  // ==========================================
  const BackToTopModule = {
    init() {
      this.button = document.getElementById('backToTop');
      this.scrollThreshold = 300;

      if (!this.button) return;

      // 监听滚动
      window.addEventListener('scroll', utils.throttle(() => {
        this.updateVisibility();
      }, 100));

      // 点击返回顶部
      this.button.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });

      utils.log('BackToTopModule initialized');
    },

    updateVisibility() {
      if (window.pageYOffset > this.scrollThreshold) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }
  };

  // ==========================================
  // 数字动画模块
  // ==========================================
  const NumberAnimationModule = {
    init() {
      this.numbers = document.querySelectorAll('[data-count]');
      this.animatedElements = new Set();

      if (!this.numbers.length) return;

      // 使用 Intersection Observer
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
            this.animateNumber(entry.target);
            this.animatedElements.add(entry.target);
          }
        });
      }, { threshold: 0.5 });

      this.numbers.forEach(el => observer.observe(el));

      utils.log('NumberAnimationModule initialized');
    },

    animateNumber(element) {
      const target = parseInt(element.getAttribute('data-count'));
      const duration = 1500;
      const start = 0;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 缓动函数：easeOutCubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeProgress);

        // 格式化数字（添加逗号）
        element.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.textContent = target.toLocaleString();
        }
      };

      requestAnimationFrame(animate);
    }
  };

  // ==========================================
  // 分类Tab模块
  // ==========================================
  const CategoryTabsModule = {
    init() {
      this.tabs = document.querySelectorAll('.category-tab');
      this.tabsContainer = document.getElementById('categoryTabs');

      if (!this.tabs.length) return;

      // 绑定Tab点击事件
      this.tabs.forEach(tab => {
        tab.addEventListener('click', () => this.handleTabClick(tab));
      });

      // 监听滚动，实现sticky高亮
      window.addEventListener('scroll', utils.throttle(() => {
        this.updateActiveTab();
      }, 100));

      utils.log('CategoryTabsModule initialized');
    },

    handleTabClick(tab) {
      const category = tab.getAttribute('data-category');

      // 更新active状态
      this.tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // 过滤文章
      if (window.ArticlesModuleInstance) {
        window.ArticlesModuleInstance.filterByCategory(category);
      }

      utils.log('Tab clicked:', category);
    },

    updateActiveTab() {
      // 根据滚动位置自动高亮对应Tab
      // 此功能可根据实际内容区块实现
    }
  };

  // ==========================================
  // 热门标签云模块
  // ==========================================
  const TagCloudModule = {
    init() {
      this.container = document.getElementById('tagCloud');
      if (!this.container) return;

      this.loadTags();
      utils.log('TagCloudModule initialized');
    },

    async loadTags() {
      try {
        const response = await fetch('/tag-hot.json');
        const data = await response.json();

        if (data && data.tags) {
          this.renderTags(data.tags.slice(0, 20)); // 显示前20个
        }
      } catch (error) {
        utils.log('Failed to load tags:', error);
        this.container.innerHTML = '<span class="loading-text">加载失败</span>';
      }
    },

    renderTags(tags) {
      const html = tags.map(tag =>
        `<a href="${tag.url}" title="${tag.count}篇文章" target="_blank" rel="noopener noreferrer">${tag.name}</a>`
      ).join('');

      this.container.innerHTML = html;
    }
  };

  // ==========================================
  // 文章加载模块
  // ==========================================
  const ArticlesModule = {
    init() {
      this.grid = document.getElementById('articlesGrid');
      this.loadMoreBtn = document.getElementById('loadMoreBtn');
      this.currentPage = 1;
      this.articlesPerPage = 12;
      this.allArticles = [];
      this.filteredArticles = [];
      this.currentCategory = 'all';
      this.loading = false;

      if (!this.grid) return;

      // 暴露实例到全局
      window.ArticlesModuleInstance = this;

      // 加载首页文章
      this.loadArticles();

      // 隐藏"加载更多"按钮，使用无限滚动
      if (this.loadMoreBtn) {
        this.loadMoreBtn.style.display = 'none';
      }

      // 绑定无限滚动
      this.initInfiniteScroll();

      utils.log('ArticlesModule initialized');
    },

    initInfiniteScroll() {
      // 使用节流优化性能
      const handleScroll = utils.throttle(() => {
        // 检查是否滚动到底部附近 (距离底部300px)
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= docHeight - 300) {
          // 如果还有更多内容且未在加载中
          if (!this.loading && this.hasMoreArticles()) {
            this.loadMore();
          }
        }
      }, 200);

      window.addEventListener('scroll', handleScroll);
    },

    hasMoreArticles() {
      const totalLoaded = this.currentPage * this.articlesPerPage;
      return totalLoaded < this.filteredArticles.length;
    },

    async loadArticles() {
      if (this.loading) return;
      this.loading = true;

      try {
        // 从site-links-recent.json加载数据
        const response = await fetch('/site-links-recent.json');
        const data = await response.json();
        this.allArticles = data.articles || [];
        this.filteredArticles = this.allArticles; // 初始显示全部

        if (this.filteredArticles && this.filteredArticles.length) {
          this.renderArticles(this.filteredArticles.slice(0, this.articlesPerPage));
          this.updateLoadMoreButton();
        } else {
          this.showEmptyState();
        }
      } catch (error) {
        utils.log('Failed to load articles:', error);
        this.showErrorState();
      } finally {
        this.loading = false;
      }
    },

    filterByCategory(category) {
      this.currentCategory = category;
      this.currentPage = 1; // 重置页码

      if (category === 'all') {
        this.filteredArticles = this.allArticles;
      } else {
        // 根据 category tab 的 data-category 映射到文章的实际分类
        const categoryMap = {
          'ai': ['ai', 'ai001', 'ai002'],
          'tech': ['geek', 'geek001', 'geek002'],
          'stock': ['stock', 'stock001', 'stock002'],
          'creative': ['app'],
          'learn': ['gpt', 'go', 'ecg']
        };

        const categories = categoryMap[category] || [category];
        this.filteredArticles = this.allArticles.filter(article =>
          categories.includes(article.category)
        );
      }

      // 重新渲染
      if (this.filteredArticles.length > 0) {
        this.renderArticles(this.filteredArticles.slice(0, this.articlesPerPage));
        this.updateLoadMoreButton();
      } else {
        this.showEmptyState();
      }

      utils.log('Filtered by category:', category, 'Count:', this.filteredArticles.length);
    },

    renderArticles(articles) {
      // 移除骨架屏
      this.grid.innerHTML = '';

      const html = articles.map(article => this.createArticleCard(article)).join('');
      this.grid.innerHTML = html;

      // 触发进入动画
      this.animateCards();
    },

    createArticleCard(article) {
      // 兼容 path 和 url 两种字段名
      const articleUrl = article.url || article.path || '#';

      // 提取分类
      const category = this.extractCategory(articleUrl);
      const categoryConfig = this.getCategoryConfig(category);

      // 提取日期
      const date = this.extractDate(articleUrl);

      return `
        <div class="article-card" data-category="${category}">
          <div class="article-card-cover" style="background: ${categoryConfig.color};">
            <span class="article-card-category-icon">${categoryConfig.icon}</span>
          </div>
          <div class="article-card-content">
            <div class="article-card-meta">
              <span class="article-category" style="color: ${categoryConfig.color};">
                ${categoryConfig.icon} ${categoryConfig.name}
              </span>
              <span class="article-date">${date}</span>
            </div>
            <h3 class="article-card-title">
              <a href="${articleUrl}" target="_blank" rel="noopener noreferrer">${article.title}</a>
            </h3>
            <p class="article-card-excerpt">
              ${this.generateExcerpt(article.title)}
            </p>
          </div>
        </div>
      `;
    },

    extractCategory(url) {
      if (url.includes('/ai/')) return 'ai';
      if (url.includes('/geek/')) return 'tech';
      if (url.includes('/stock/')) return 'stock';
      if (url.includes('/gpt/')) return 'gpt';
      if (url.includes('/go/')) return 'go';
      return 'other';
    },

    getCategoryConfig(category) {
      const configs = {
        ai: { name: 'AI', icon: '🤖', color: '#3B82F6' },
        tech: { name: '技术', icon: '💻', color: '#10B981' },
        stock: { name: '股票', icon: '📈', color: '#EF4444' },
        gpt: { name: 'GPT', icon: '🧠', color: '#8B5CF6' },
        go: { name: 'Go', icon: '🐹', color: '#06B6D4' },
        other: { name: '其他', icon: '📚', color: '#6B7280' }
      };
      return configs[category] || configs.other;
    },

    extractDate(url) {
      const match = url.match(/\/(\d{8})\//);
      if (match) {
        const dateStr = match[1];
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}-${month}-${day}`;
      }
      return '2025-10-18';
    },

    generateExcerpt(title) {
      // 简单截取标题作为摘要
      return title.length > 60 ? title.substring(0, 60) + '...' : title;
    },

    animateCards() {
      const cards = this.grid.querySelectorAll('.article-card');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        setTimeout(() => {
          card.style.transition = 'all 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 50);
      });
    },

    loadMore() {
      if (this.loading) return;
      this.loading = true;

      const startIndex = this.currentPage * this.articlesPerPage;
      const endIndex = startIndex + this.articlesPerPage;
      const moreArticles = this.filteredArticles.slice(startIndex, endIndex);

      if (moreArticles.length > 0) {
        // 追加渲染
        const html = moreArticles.map(article => this.createArticleCard(article)).join('');
        this.grid.insertAdjacentHTML('beforeend', html);
        this.currentPage++;

        // 动画
        setTimeout(() => {
          this.animateCards();
          this.loading = false;
        }, 100);

        utils.log('Loaded more articles, page:', this.currentPage);
      } else {
        this.loading = false;
      }
    },

    updateLoadMoreButton() {
      const totalLoaded = this.currentPage * this.articlesPerPage;
      const hasMore = totalLoaded < this.filteredArticles.length;

      if (this.loadMoreBtn) {
        this.loadMoreBtn.style.display = hasMore ? 'flex' : 'none';

        // 更新按钮文本
        const remaining = this.filteredArticles.length - totalLoaded;
        const btnText = this.loadMoreBtn.querySelector('.btn-text');
        if (btnText && hasMore) {
          btnText.textContent = `加载更多 (还剩 ${remaining} 篇)`;
        }
      }
    },

    showEmptyState() {
      this.grid.innerHTML = `
        <div class="empty-state">
          <p>暂无文章</p>
        </div>
      `;
    },

    showErrorState() {
      this.grid.innerHTML = `
        <div class="error-state">
          <p>加载失败，请稍后重试</p>
        </div>
      `;
    }
  };

  // 添加文章卡片样式（动态插入）
  const articleCardStyles = `
    <style>
      .article-card {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .article-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
        border-color: var(--primary-brand);
      }

      .article-card-cover {
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .article-card-category-icon {
        font-size: 64px;
        opacity: 0.3;
      }

      .article-card-content {
        padding: var(--space-5);
      }

      .article-card-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: var(--space-3);
        font-size: 13px;
      }

      .article-category {
        font-weight: 600;
      }

      .article-date {
        color: var(--color-text-tertiary);
      }

      .article-card-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: var(--space-3);
        line-height: 1.4;
      }

      .article-card-title a {
        color: var(--color-text-primary);
        transition: color 0.2s ease;
      }

      .article-card:hover .article-card-title a {
        color: var(--primary-brand);
      }

      .article-card-excerpt {
        font-size: 14px;
        color: var(--color-text-secondary);
        line-height: 1.6;
        margin-bottom: var(--space-4);
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .article-card-footer {
        display: flex;
        gap: var(--space-4);
        padding-top: var(--space-3);
        border-top: 1px dashed var(--color-border);
      }

      .article-stat {
        font-size: 13px;
        color: var(--color-text-tertiary);
      }

      .empty-state,
      .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--space-16);
        color: var(--color-text-tertiary);
      }
    </style>
  `;

  // 注入样式
  document.head.insertAdjacentHTML('beforeend', articleCardStyles);

  // ==========================================
  // 侧边栏统计模块
  // ==========================================
  const SidebarStatsModule = {
    init() {
      this.loadStats();
      utils.log('SidebarStatsModule initialized');
    },

    async loadStats() {
      try {
        const response = await fetch('/site-links-by-category.json');
        const data = await response.json();
        const categories = data.categories || {};

        // 计算合并分类的统计
        const stats = {
          ai: (categories.ai || 0) + (categories.ai001 || 0) + (categories.ai002 || 0),
          geek: (categories.geek || 0) + (categories.geek001 || 0) + (categories.geek002 || 0),
          stock: (categories.stock || 0) + (categories.stock001 || 0) + (categories.stock002 || 0),
          gpt: categories.gpt || 0,
          go: categories.go || 0,
          ecg: categories.ecg || 0
        };

        this.updateSidebar(stats);
      } catch (error) {
        utils.log('Failed to load sidebar stats:', error);
      }
    },

    updateSidebar(stats) {
      // 更新左侧导航的文章数量
      const navItems = {
        'ai': stats.ai,
        'tech': stats.geek,
        'stock': stats.stock,
        'gpt': stats.gpt,
        'go': stats.go,
        'health': stats.ecg
      };

      Object.keys(navItems).forEach(category => {
        const navItem = document.querySelector(`.nav-item[data-category="${category}"]`);
        if (navItem && navItems[category] > 0) {
          // 移除已存在的 badge（如果有）
          const existingBadge = navItem.querySelector('.nav-count');
          if (existingBadge) {
            existingBadge.remove();
          }

          // 如果已有 nav-badge（1200+），也移除
          const oldBadge = navItem.querySelector('.nav-badge');
          if (oldBadge) {
            oldBadge.remove();
          }

          // 添加新的计数
          const badge = document.createElement('span');
          badge.className = 'nav-count';
          badge.textContent = navItems[category];
          navItem.appendChild(badge);
        }
      });
    }
  };

  // ==========================================
  // 热点话题模块
  // ==========================================
  const HotTopicsModule = {
    container: null,
    topics: [],
    maxTopics: 8,

    init() {
      this.container = document.getElementById('hotTopicsList');
      if (!this.container) {
        utils.log('Hot topics container not found');
        return;
      }

      this.loadTopics();
      utils.log('HotTopicsModule initialized');
    },

    async loadTopics() {
      try {
        const response = await fetch('/site-links-recent.json');
        if (!response.ok) throw new Error('Failed to fetch recent articles');

        const data = await response.json();
        this.topics = (data.articles || []).slice(0, this.maxTopics);

        if (this.topics.length > 0) {
          this.renderTopics();
        } else {
          this.showEmptyState();
        }
      } catch (error) {
        utils.log('Failed to load hot topics:', error);
        this.showErrorState();
      }
    },

    renderTopics() {
      const html = this.topics.map((topic, index) =>
        this.createTopicItem(topic, index + 1)
      ).join('');

      this.container.innerHTML = html;
    },

    createTopicItem(topic, rank) {
      const url = topic.url || topic.path || '#';
      const title = this.truncateTitle(topic.title, 30);
      const badge = this.getBadge(rank, topic);
      const rankClass = rank <= 3 ? `rank-${rank}` : '';

      return `
        <a href="${url}" class="hot-topic-item" target="_blank" rel="noopener noreferrer">
          <span class="topic-rank ${rankClass}">${rank}</span>
          <span class="topic-text">${title}</span>
          ${badge}
        </a>
      `;
    },

    truncateTitle(title, maxLength) {
      if (title.length <= maxLength) return title;
      return title.substring(0, maxLength) + '...';
    },

    getBadge(rank, topic) {
      // Top ranked gets hot badge
      if (rank === 1) {
        return '<span class="topic-badge hot">🔥</span>';
      }

      // Top 3 get new badge
      if (rank <= 3) {
        return '<span class="topic-badge new">新</span>';
      }

      // Check if article is from AI category for AI badge
      const url = topic.url || topic.path || '';
      if (url.includes('/ai/') || url.includes('/ai001/') || url.includes('/ai002/')) {
        return '<span class="topic-badge ai">AI</span>';
      }

      return '';
    },

    showEmptyState() {
      this.container.innerHTML = `
        <div class="empty-state">
          <p>暂无热点话题</p>
        </div>
      `;
    },

    showErrorState() {
      this.container.innerHTML = `
        <div class="error-state">
          <p>加载失败，请刷新重试</p>
        </div>
      `;
    }
  };

  // ==========================================
  // 性能监控模块
  // ==========================================
  const PerformanceModule = {
    init() {
      if (!CONFIG.DEBUG) return;

      // 监控页面加载性能
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.logPerformance();
        }, 0);
      });

      utils.log('PerformanceModule initialized');
    },

    logPerformance() {
      if (!window.performance || !window.performance.timing) return;

      const timing = performance.timing;
      const metrics = {
        'DNS查询': timing.domainLookupEnd - timing.domainLookupStart,
        'TCP连接': timing.connectEnd - timing.connectStart,
        '请求时间': timing.responseStart - timing.requestStart,
        '响应时间': timing.responseEnd - timing.responseStart,
        'DOM处理': timing.domComplete - timing.domLoading,
        'DOM Ready': timing.domContentLoadedEventEnd - timing.navigationStart,
        '完全加载': timing.loadEventEnd - timing.navigationStart
      };

      console.group('📊 页面性能指标');
      Object.keys(metrics).forEach(key => {
        console.log(`${key}: ${metrics[key]}ms`);
      });
      console.groupEnd();
    }
  };

  // ==========================================
  // 主初始化函数
  // ==========================================
  function init() {
    utils.log('Homepage v3.0 initializing...');

    // 按顺序初始化各模块
    ThemeModule.init();
    MobileMenuModule.init();
    SearchModule.init();
    BackToTopModule.init();
    NumberAnimationModule.init();
    CategoryTabsModule.init();
    TagCloudModule.init();
    ArticlesModule.init();
    SidebarStatsModule.init(); // Load article counts for navigation
    HotTopicsModule.init(); // Load hot topics from recent articles
    PerformanceModule.init();

    utils.log('Homepage v3.0 initialized successfully!');
  }

  // DOM加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 暴露全局API（用于调试）
  if (CONFIG.DEBUG) {
    window.HomepageV3 = {
      utils,
      modules: {
        ThemeModule,
        SearchModule,
        ArticlesModule,
        TagCloudModule
      }
    };
  }

})();
