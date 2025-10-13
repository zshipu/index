// ==========================================
// 工具数据 - 从资源文件提取的精选工具
// ==========================================
const toolsData = [
    // 精选推荐
    {
        name: "AI好记",
        icon: "📝",
        description: "一键把B站/小红书/抖音/小宇宙等音视频转成图文笔记和思维导图",
        url: "https://aihaoji.com/zh",
        category: "featured",
        tags: ["笔记", "转换", "思维导图"]
    },
    {
        name: "DeepSeek",
        icon: "🤖",
        description: "国产AI大模型，强大的对话和推理能力",
        url: "https://chat.deepseek.com/",
        category: "chatbot",
        tags: ["对话", "推理", "免费"]
    },
    {
        name: "Kimi",
        icon: "💬",
        description: "月之暗面开发的AI助手，擅长长文本理解",
        url: "https://kimi.moonshot.cn/",
        category: "chatbot",
        tags: ["对话", "长文本"]
    },
    {
        name: "豆包",
        icon: "🎯",
        description: "字节跳动AI助手，多功能智能对话",
        url: "https://www.doubao.com/chat/",
        category: "chatbot",
        tags: ["对话", "多功能"]
    },
    {
        name: "通义千问",
        icon: "🌟",
        description: "阿里云大模型，支持多模态交互",
        url: "https://tongyi.aliyun.com/qianwen/",
        category: "chatbot",
        tags: ["对话", "多模态"]
    },
    {
        name: "Lovart.AI",
        icon: "🎨",
        description: "世界首个设计领域Agent，可以生成图片、音频、视频",
        url: "https://www.lovart.ai/home",
        category: "image",
        tags: ["设计", "生图", "Agent"]
    },
    {
        name: "LibLib AI",
        icon: "🖼️",
        description: "国内AI生图天花板，每天有免费额度",
        url: "https://www.liblib.art/",
        category: "image",
        tags: ["生图", "免费", "高质量"]
    },
    {
        name: "即梦AI",
        icon: "✨",
        description: "生图质量较好，免费额度充足",
        url: "https://jimeng.jianying.com/",
        category: "image",
        tags: ["生图", "免费"]
    },
    {
        name: "Midjourney",
        icon: "🎭",
        description: "AI图片生成天花板，需要魔法",
        url: "https://www.midjourney.com/home",
        category: "image",
        tags: ["生图", "专业", "高质量"]
    },
    {
        name: "Sora",
        icon: "🎬",
        description: "OpenAI开发的AI视频生成天花板",
        url: "https://sora.com/library",
        category: "video",
        tags: ["视频生成", "专业"]
    },
    {
        name: "可灵AI",
        icon: "🎞️",
        description: "老照片动起来效果非常好",
        url: "https://klingai.kuaishou.com/",
        category: "video",
        tags: ["视频生成", "照片动画"]
    },
    {
        name: "海螺AI",
        icon: "🌊",
        description: "图生视频一键生成电影级动作大片",
        url: "https://hailuoai.com/video",
        category: "video",
        tags: ["视频生成", "图生视频"]
    },
    {
        name: "剪映",
        icon: "✂️",
        description: "字节跳动出品的视频编辑工具",
        url: "https://jimeng.jianying.com/",
        category: "video",
        tags: ["视频编辑", "剪辑"]
    },
    {
        name: "硅语数字人",
        icon: "👤",
        description: "自动生成数字人短视频，支持1080P、2K、4K",
        url: "http://meta.guiji.cn/",
        category: "video",
        tags: ["数字人", "短视频"]
    },
    {
        name: "魔音工坊",
        icon: "🎵",
        description: "短视频最热门的配音基本都在这",
        url: "https://www.moyin.com/",
        category: "audio",
        tags: ["配音", "文字转语音"]
    },
    {
        name: "海螺AI配音",
        icon: "🔊",
        description: "免费AI配音，支持多国语言+多种音色",
        url: "https://hailuoai.com/audio",
        category: "audio",
        tags: ["配音", "免费", "多语言"]
    },
    {
        name: "Suno",
        icon: "🎼",
        description: "AI音乐生成工具，一句话生成完整歌曲",
        url: "https://www.suno.ai/",
        category: "audio",
        tags: ["音乐生成", "AI作曲"]
    },
    {
        name: "Cursor",
        icon: "💻",
        description: "AI编程工具，革命性的代码编辑器",
        url: "https://www.cursor.com/",
        category: "coding",
        tags: ["编程", "AI辅助"]
    },
    {
        name: "GitHub Copilot",
        icon: "🐙",
        description: "GitHub官方AI编程助手",
        url: "https://github.com/features/copilot",
        category: "coding",
        tags: ["编程", "AI辅助"]
    },
    {
        name: "码上飞CodeFlying",
        icon: "🚀",
        description: "用AI开发应用，一句话生成网站",
        url: "https://www.codeflying.net/",
        category: "coding",
        tags: ["低代码", "AI开发"]
    },
    {
        name: "讯飞写作",
        icon: "✍️",
        description: "支持对话式交互，快速生成各类文本内容",
        url: "https://huixie.iflyrec.com/list",
        category: "office",
        tags: ["写作", "AI辅助"]
    },
    {
        name: "WPS AI",
        icon: "📊",
        description: "已接入DeepSeek，支持联网搜索",
        url: "https://www.wps.cn/",
        category: "office",
        tags: ["办公", "文档处理"]
    },
    {
        name: "Gamma",
        icon: "📑",
        description: "AI生成PPT天花板",
        url: "https://gamma.app/zh-cn",
        category: "office",
        tags: ["PPT", "演示文稿"]
    },
    {
        name: "秘塔AI搜索",
        icon: "🔍",
        description: "可免费使用DeepSeek R1模型，支持联网搜索",
        url: "https://metaso.cn/",
        category: "featured",
        tags: ["搜索", "免费"]
    },
    {
        name: "国家中小学智慧教育平台",
        icon: "📚",
        description: "为广大中小学校提供专业化、精品化、体系化的资源服务",
        url: "https://basic.smartedu.cn/",
        category: "learning",
        tags: ["教育", "学习资源"]
    },
    {
        name: "中国大学MOOC",
        icon: "🎓",
        description: "优质的中文MOOC学习平台",
        url: "https://www.icourse163.org/",
        category: "learning",
        tags: ["MOOC", "大学课程"]
    },
    {
        name: "可汗学院",
        icon: "🏫",
        description: "全球免费在线学习平台",
        url: "https://zh.khanacademy.org/",
        category: "learning",
        tags: ["免费", "在线教育"]
    },
    {
        name: "Canva可画",
        icon: "🎨",
        description: "批量生成海报、PPT模版",
        url: "https://www.canva.cn/",
        category: "design",
        tags: ["设计", "海报", "模版"]
    },
    {
        name: "稿定设计AI",
        icon: "🖌️",
        description: "提供多种AI设计工具，包括AI做图、AI文案等",
        url: "https://www.gaoding.com/ai",
        category: "design",
        tags: ["设计", "AI工具"]
    },
    {
        name: "Remove.bg",
        icon: "✂️",
        description: "免费背景一键消除，实时更换各种背景",
        url: "https://www.remove.bg/zh",
        category: "design",
        tags: ["抠图", "免费"]
    },
    {
        name: "Pexels",
        icon: "📷",
        description: "免费图片素材库",
        url: "https://www.pexels.com/zh-cn/",
        category: "design",
        tags: ["图片", "免费", "素材"]
    },
    {
        name: "Pixabay",
        icon: "🖼️",
        description: "免费无版权4K图片、视频、音频素材",
        url: "https://pixabay.com/zh/",
        category: "design",
        tags: ["素材", "免费", "无版权"]
    },
    {
        name: "八爪鱼采集器",
        icon: "🕷️",
        description: "批量自动化采集抖音、小红书等平台爆款内容",
        url: "https://affiliate.bazhuayu.com/2ngIsn",
        category: "social",
        tags: ["采集", "自媒体", "数据"]
    },
    {
        name: "新榜",
        icon: "📱",
        description: "新媒体必备导航网址",
        url: "https://nav.newrank.cn/",
        category: "social",
        tags: ["自媒体", "工具导航"]
    },
    {
        name: "壹伴",
        icon: "📝",
        description: "公众号管理插件、排版工具",
        url: "https://yiban.io/",
        category: "social",
        tags: ["公众号", "排版"]
    },
    {
        name: "创客贴",
        icon: "🎨",
        description: "支持AI图形编辑和平面设计工具",
        url: "https://aiart.chuangkit.com/",
        category: "design",
        tags: ["设计", "AI编辑"]
    },
    {
        name: "AI工具集",
        icon: "🧰",
        description: "1000+AI工具合集，分类齐全，每天更新",
        url: "https://ai-bot.cn/",
        category: "featured",
        tags: ["导航", "工具集"]
    },
    {
        name: "通往AGI之路",
        icon: "🛤️",
        description: "国内公认优质AI领域门户网站",
        url: "https://www.waytoagi.com/",
        category: "featured",
        tags: ["学习", "导航"]
    },
    {
        name: "Z-Library",
        icon: "📖",
        description: "世界上最大的电子图书馆",
        url: "https://zh.z-lib.blog/",
        category: "learning",
        tags: ["电子书", "图书馆"]
    },
    {
        name: "安娜的档案",
        icon: "📚",
        description: "人类历史上最大的完全开放的图书馆",
        url: "https://zh.annas-archive.org/",
        category: "learning",
        tags: ["电子书", "开源"]
    }
];

// ==========================================
// 状态管理
// ==========================================
let currentCategory = 'all';
let searchQuery = '';
let displayedTools = 20;
const toolsPerPage = 20;
let filteredTools = [...toolsData];

// ==========================================
// DOM元素
// ==========================================
const searchInput = document.getElementById('searchInput');
const toolsGrid = document.getElementById('toolsGrid');
const emptyState = document.getElementById('emptyState');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const themeToggle = document.getElementById('themeToggle');
const categoryTabs = document.querySelectorAll('.filter-tab');

// ==========================================
// 主题切换
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ==========================================
// 工具筛选和搜索
// ==========================================
function filterTools() {
    filteredTools = toolsData.filter(tool => {
        const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
        const matchesSearch = !searchQuery ||
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesCategory && matchesSearch;
    });

    displayedTools = toolsPerPage;
    renderTools();
}

// ==========================================
// 渲染工具卡片
// ==========================================
function renderTools() {
    const toolsToShow = filteredTools.slice(0, displayedTools);

    if (toolsToShow.length === 0) {
        toolsGrid.style.display = 'none';
        emptyState.style.display = 'block';
        loadMoreBtn.style.display = 'none';
        return;
    }

    toolsGrid.style.display = 'grid';
    emptyState.style.display = 'none';

    toolsGrid.innerHTML = toolsToShow.map(tool => `
        <div class="tool-card" onclick="window.open('${tool.url}', '_blank')">
            <div class="tool-header">
                <div class="tool-icon">${tool.icon}</div>
                <div class="tool-info">
                    <h3 class="tool-name">${tool.name}</h3>
                    <span class="tool-category">${getCategoryName(tool.category)}</span>
                </div>
            </div>
            <p class="tool-description">${tool.description}</p>
            <div class="tool-tags">
                ${tool.tags.map(tag => `<span class="tool-tag">${tag}</span>`).join('')}
            </div>
            <a href="${tool.url}" class="tool-link" target="_blank" onclick="event.stopPropagation()">
                访问网站 →
            </a>
        </div>
    `).join('');

    // 更新加载更多按钮状态
    if (displayedTools >= filteredTools.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }

    // 更新统计数字
    updateStats();
}

// ==========================================
// 辅助函数
// ==========================================
function getCategoryName(category) {
    const categoryMap = {
        'all': '全部',
        'featured': '精选',
        'chatbot': 'AI对话',
        'image': '图片生成',
        'video': '视频工具',
        'audio': '音频工具',
        'office': '办公工具',
        'coding': '编程开发',
        'learning': '学习资源',
        'design': '设计素材',
        'social': '自媒体'
    };
    return categoryMap[category] || category;
}

function updateStats() {
    const totalToolsElement = document.getElementById('totalTools');
    if (totalToolsElement) {
        totalToolsElement.textContent = `${toolsData.length}+`;
    }
}

// ==========================================
// 事件监听
// ==========================================

// 主题切换
themeToggle.addEventListener('click', toggleTheme);

// 搜索功能
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    filterTools();
});

// 分类筛选
categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        const category = e.currentTarget.getAttribute('data-category');

        // 更新激活状态
        categoryTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // 更新当前分类并筛选
        currentCategory = category;
        filterTools();

        // 平滑滚动到工具区域
        toolsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// 加载更多
loadMoreBtn.addEventListener('click', () => {
    displayedTools += toolsPerPage;
    renderTools();
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K 聚焦搜索框
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }

    // ESC 清空搜索
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchQuery = '';
        filterTools();
    }
});

// ==========================================
// 性能优化 - 防抖
// ==========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 优化搜索输入
const optimizedSearch = debounce((value) => {
    searchQuery = value.trim();
    filterTools();
}, 300);

searchInput.addEventListener('input', (e) => {
    optimizedSearch(e.target.value);
});

// ==========================================
// 初始化
// ==========================================
function init() {
    initTheme();
    filterTools();

    // 添加加载动画
    document.body.classList.add('loaded');

    console.log(`
    🚀 知识铺 AI工具导航
    📊 已加载 ${toolsData.length} 个工具
    💡 提示: 按 Ctrl+K 快速搜索
    `);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==========================================
// 平滑滚动到顶部
// ==========================================
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加返回顶部按钮（可选）
let scrollTopBtn = null;
window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.innerHTML = '↑';
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.onclick = scrollToTop;
            document.body.appendChild(scrollTopBtn);

            // 添加样式
            const style = document.createElement('style');
            style.textContent = `
                .scroll-top-btn {
                    position: fixed;
                    bottom: 32px;
                    right: 32px;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    background: var(--primary);
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    box-shadow: var(--shadow-lg);
                    transition: var(--transition);
                    z-index: 1000;
                    animation: fadeIn 0.3s ease-out;
                }
                .scroll-top-btn:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(99, 102, 241, 0.4);
                }
            `;
            document.head.appendChild(style);
        }
    } else {
        if (scrollTopBtn) {
            scrollTopBtn.remove();
            scrollTopBtn = null;
        }
    }
});
