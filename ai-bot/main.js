// 工具数据
const toolsData = {
    aiWriting: [
        {
            id: 1,
            name: "智谱清言",
            icon: "path/to/icon.png",
            description: "免费全能的AI助手，支持AI绘画、视频生成",
            url: "https://example.com"
        },
        // 更多工具...
    ],
    // 更多分类...
};

// 工具卡片生成函数
function createToolCard(tool) {
    return `
        <div class="tool-card">
            <img src="${tool.icon}" alt="${tool.name}" class="tool-icon">
            <h3>${tool.name}</h3>
            <p>${tool.description}</p>
            <a href="${tool.url}" target="_blank" class="tool-link">访问</a>
        </div>
    `;
}

// 渲染工具列表
function renderTools() {
    const sections = document.querySelectorAll('.tools-section');
    
    sections.forEach(section => {
        const category = section.id;
        const toolsGrid = section.querySelector('.tools-grid');
        
        if (toolsData[category]) {
            toolsGrid.innerHTML = toolsData[category]
                .map(tool => createToolCard(tool))
                .join('');
        }
    });
}

// 搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const allTools = Object.values(toolsData).flat();
        
        const filteredTools = allTools.filter(tool => 
            tool.name.toLowerCase().includes(searchTerm) ||
            tool.description.toLowerCase().includes(searchTerm)
        );
        
        // 显示搜索结果
        const resultsContainer = document.querySelector('.search-results');
        resultsContainer.innerHTML = filteredTools
            .map(tool => createToolCard(tool))
            .join('');
    }
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    renderTools();
    initSearch();
    
    // 实现懒加载
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}); 