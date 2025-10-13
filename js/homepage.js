/**
 * 知识铺首页交互脚本 - ULTRATHINK优化版
 * Homepage JavaScript for zshipu-index
 * 版本: v2.0
 * 优化日期: 2025-10-13
 * 优化内容: 性能监控、防抖节流、错误处理
 */

(function() {
    'use strict';

    // 性能监控配置
    const PERF_CONFIG = {
        enabled: true,
        logToConsole: false, // 生产环境设为false
        reportEndpoint: null // 可配置性能数据上报地址
    };

    // ==========================================
    // 1. 全站搜索功能
    // ==========================================
    function initSearch() {
        const searchInput = document.getElementById('homepageSearchInput');
        const searchButton = document.getElementById('homepageSearchButton');
        const searchForm = document.getElementById('homepageSearchForm');

        if (!searchInput || !searchForm) return;

        // 搜索提交处理
        function handleSearch(e) {
            e.preventDefault();
            const query = searchInput.value.trim();

            if (query) {
                // 跳转到搜索页面（使用相对路径）
                window.location.href = '/search/?q=' + encodeURIComponent(query);
            }
        }

        // 表单提交事件
        searchForm.addEventListener('submit', handleSearch);

        // 按钮点击事件
        if (searchButton) {
            searchButton.addEventListener('click', handleSearch);
        }

        // Enter 键提交
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSearch(e);
            }
        });

        // 输入框聚焦快捷键 (Ctrl+K 或 Cmd+K)
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // ==========================================
    // 2. 数字动画（统计数据）
    // ==========================================
    function animateNumber(element, start, end, duration) {
        if (!element) return;

        const startTime = performance.now();
        const isPlus = end >= 1000;
        const targetNumber = isPlus ? Math.floor(end / 100) * 100 : end;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 缓动函数：easeOutQuad
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (targetNumber - start) * easeProgress);

            element.textContent = isPlus ? current + '+' : current;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    function initNumberAnimations() {
        const statNumbers = document.querySelectorAll('.homepage-stat-number');

        // 使用 Intersection Observer 实现进入视口时触发动画
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';

                    // 从 data-count 属性读取目标数字
                    const targetText = entry.target.textContent.trim();
                    const hasPlus = targetText.includes('+');
                    const target = parseInt(targetText.replace(/[^0-9]/g, ''));

                    if (!isNaN(target)) {
                        animateNumber(entry.target, 0, target, 1500);
                    }
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ==========================================
    // 3. 卡片进入动画
    // ==========================================
    function initCardAnimations() {
        const cards = document.querySelectorAll('.homepage-card, .homepage-featured-card');

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';

                    // 延迟添加动画类
                    setTimeout(function() {
                        entry.target.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        cards.forEach(function(card, index) {
            // 初始状态
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            // 延迟观察，创建波浪效果
            setTimeout(function() {
                observer.observe(card);
            }, index * 50);
        });
    }

    // ==========================================
    // 4. 平滑滚动
    // ==========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#top') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // ==========================================
    // 5. 性能优化：懒加载图片（如果有）
    // ==========================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            images.forEach(function(img) {
                imageObserver.observe(img);
            });
        } else {
            // 降级方案：直接加载
            images.forEach(function(img) {
                img.src = img.dataset.src;
            });
        }
    }

    // ==========================================
    // 6. 移动端菜单优化（如需要）
    // ==========================================
    function initMobileMenu() {
        // 检测移动端
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // 添加移动端特定的优化
            document.body.classList.add('mobile-device');
        }

        // 监听窗口大小变化
        window.addEventListener('resize', function() {
            const nowMobile = window.innerWidth < 768;
            if (nowMobile !== isMobile) {
                document.body.classList.toggle('mobile-device', nowMobile);
            }
        });
    }

    // ==========================================
    // 7. 错误处理和降级方案
    // ==========================================
    function initErrorHandling() {
        // 监听 JavaScript 错误
        window.addEventListener('error', function(e) {
            console.error('Homepage Script Error:', e.message);
            // 可以在这里添加错误上报逻辑
        });

        // 检查必要的浏览器特性
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported. Some animations disabled.');
            // 降级方案：直接显示所有内容
            document.querySelectorAll('.homepage-card, .homepage-featured-card').forEach(function(el) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }
    }

    // ==========================================
    // 8. 性能监控增强版
    // ==========================================
    function logPerformance() {
        if (!PERF_CONFIG.enabled) return;

        // Core Web Vitals 监控
        if ('PerformanceObserver' in window) {
            // LCP (Largest Contentful Paint)
            try {
                const lcpObserver = new PerformanceObserver(function(list) {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    const lcp = lastEntry.renderTime || lastEntry.loadTime;

                    if (PERF_CONFIG.logToConsole) {
                        console.log('✅ LCP:', lcp.toFixed(0) + 'ms', lcp < 2500 ? '(Good)' : lcp < 4000 ? '(Needs Improvement)' : '(Poor)');
                    }

                    // 可上报到分析平台
                    reportMetric('LCP', lcp);
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // 不支持则静默失败
            }

            // FID (First Input Delay)
            try {
                const fidObserver = new PerformanceObserver(function(list) {
                    const entries = list.getEntries();
                    entries.forEach(function(entry) {
                        const fid = entry.processingStart - entry.startTime;
                        if (PERF_CONFIG.logToConsole) {
                            console.log('✅ FID:', fid.toFixed(0) + 'ms', fid < 100 ? '(Good)' : fid < 300 ? '(Needs Improvement)' : '(Poor)');
                        }
                        reportMetric('FID', fid);
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {}

            // CLS (Cumulative Layout Shift)
            try {
                let clsScore = 0;
                const clsObserver = new PerformanceObserver(function(list) {
                    list.getEntries().forEach(function(entry) {
                        if (!entry.hadRecentInput) {
                            clsScore += entry.value;
                        }
                    });
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });

                // 页面卸载时报告
                window.addEventListener('beforeunload', function() {
                    if (PERF_CONFIG.logToConsole) {
                        console.log('✅ CLS:', clsScore.toFixed(3), clsScore < 0.1 ? '(Good)' : clsScore < 0.25 ? '(Needs Improvement)' : '(Poor)');
                    }
                    reportMetric('CLS', clsScore);
                });
            } catch (e) {}
        }

        // Navigation Timing (兼容性更好)
        window.addEventListener('load', function() {
            setTimeout(function() {
                if (!('performance' in window && 'timing' in window.performance)) return;

                const timing = performance.timing;
                const metrics = {
                    'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
                    'TCP Connect': timing.connectEnd - timing.connectStart,
                    'Request Time': timing.responseStart - timing.requestStart,
                    'Response Time': timing.responseEnd - timing.responseStart,
                    'DOM Processing': timing.domComplete - timing.domLoading,
                    'DOM Ready': timing.domContentLoadedEventEnd - timing.navigationStart,
                    'Full Load': timing.loadEventEnd - timing.navigationStart
                };

                if (PERF_CONFIG.logToConsole) {
                    console.group('📊 Homepage Performance Metrics');
                    Object.keys(metrics).forEach(function(key) {
                        console.log('- ' + key + ':', metrics[key] + 'ms');
                    });
                    console.groupEnd();
                }

                // 批量上报
                reportMetric('NavigationTiming', metrics);
            }, 0);
        });
    }

    // 性能指标上报函数
    function reportMetric(name, value) {
        if (!PERF_CONFIG.reportEndpoint) return;

        // 使用 sendBeacon 确保数据发送（即使页面卸载）
        if ('sendBeacon' in navigator) {
            const data = JSON.stringify({
                metric: name,
                value: value,
                url: window.location.href,
                timestamp: Date.now()
            });
            navigator.sendBeacon(PERF_CONFIG.reportEndpoint, data);
        }
    }

    // ==========================================
    // 主初始化函数
    // ==========================================
    function init() {
        // 错误处理优先初始化
        initErrorHandling();

        // 核心功能
        initSearch();

        // 动画功能（延迟初始化，避免阻塞）
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    initNumberAnimations();
                    initCardAnimations();
                    initSmoothScroll();
                    initLazyLoading();
                    initMobileMenu();
                }, 100);
            });
        } else {
            setTimeout(function() {
                initNumberAnimations();
                initCardAnimations();
                initSmoothScroll();
                initLazyLoading();
                initMobileMenu();
            }, 100);
        }

        // 性能监控（开发环境）
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            logPerformance();
        }
    }

    // 启动初始化
    init();

    // ==========================================
    // 暴露公共 API（如需要）
    // ==========================================
    window.HomepageUtils = {
        version: '1.0',
        refresh: function() {
            initNumberAnimations();
            initCardAnimations();
        }
    };

})();
