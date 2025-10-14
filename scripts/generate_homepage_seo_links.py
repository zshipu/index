#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
首页SEO内链生成器 - ULTRATHINK模式
生成大量静态HTML内部链接片段，提升SEO效果
"""

import json
import sys
import io
from pathlib import Path
from collections import defaultdict

# Windows编码修复
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    except:
        pass

def generate_popular_articles_section(articles, limit=50):
    """生成热门文章专区（静态HTML）"""
    html = []
    html.append('<!-- 🔥 SEO内链区域：热门精选文章 -->')
    html.append('<section class="seo-links-section">')
    html.append('    <h2 class="seo-section-title">🔥 热门精选文章</h2>')
    html.append('    <div class="seo-articles-grid">')

    for article in articles[:limit]:
        # 提取分类图标
        icon = article.get('icon', '📄')
        category = article.get('category', '')
        title = article.get('title', '').replace('"', '&quot;')
        path = article.get('path', '')
        date = article.get('date', '')

        html.append(f'        <article class="seo-article-item">')
        html.append(f'            <a href="{path}" class="seo-article-link" title="{title}">')
        html.append(f'                <span class="seo-article-icon">{icon}</span>')
        html.append(f'                <span class="seo-article-category">{category}</span>')
        html.append(f'                <h3 class="seo-article-title">{title[:80]}...</h3>')
        if date:
            html.append(f'                <time class="seo-article-date">{date}</time>')
        html.append(f'            </a>')
        html.append(f'        </article>')

    html.append('    </div>')
    html.append('</section>')
    return '\n'.join(html)

def generate_category_sections(category_data):
    """生成各分类文章列表（静态HTML）"""
    html = []

    category_config = {
        'ai': ('AI人工智能', '🤖', '最新AI工具、ChatGPT教程、AI应用实践'),
        'ai001': ('AI专区001', '🤖', 'AI资讯、行业动态、技术分享'),
        'geek': ('技术开发', '💻', '编程技术、开发工具、架构设计'),
        'geek001': ('技术001', '💻', '前后端技术、框架实践'),
        'geek002': ('技术002', '💻', 'PDF解析、智能体开发'),
        'stock': ('股票金融', '📈', '股市分析、投资策略、金融资讯'),
        'stock001': ('股票001', '📈', '涨停战法、技术分析'),
        'gpt': ('GPT大模型', '🧠', 'ChatGPT应用、Prompt工程'),
        'ecg': ('健康医疗', '💊', '心电图分析、健康科普'),
    }

    html.append('<!-- 📂 SEO内链区域：分类文章列表 -->')

    for cat_key, articles in category_data.items():
        if cat_key not in category_config:
            continue

        cat_name, icon, description = category_config[cat_key]

        html.append(f'<section class="seo-category-section">')
        html.append(f'    <div class="seo-category-header">')
        html.append(f'        <h2 class="seo-category-title">')
        html.append(f'            <span class="seo-category-icon">{icon}</span>')
        html.append(f'            {cat_name}')
        html.append(f'            <span class="seo-category-count">（{len(articles)}篇）</span>')
        html.append(f'        </h2>')
        html.append(f'        <p class="seo-category-desc">{description}</p>')
        html.append(f'        <a href="/{cat_key}/" class="seo-category-more">查看全部 →</a>')
        html.append(f'    </div>')
        html.append(f'    <ul class="seo-article-list">')

        # 显示该分类前20篇文章
        for article in articles[:20]:
            title = article.get('title', '').replace('"', '&quot;')
            path = article.get('path', '')
            date = article.get('date', '')

            html.append(f'        <li class="seo-list-item">')
            html.append(f'            <a href="{path}" title="{title}">')
            html.append(f'                <span class="seo-item-title">{title[:60]}...</span>')
            if date:
                html.append(f'                <span class="seo-item-date">{date}</span>')
            html.append(f'            </a>')
            html.append(f'        </li>')

        html.append(f'    </ul>')
        html.append(f'</section>')
        html.append('')

    return '\n'.join(html)

def generate_sitemap_links():
    """生成站点地图链接（静态HTML）"""
    html = []
    html.append('<!-- 🗺️ SEO内链区域：站点地图 -->')
    html.append('<section class="seo-sitemap-section">')
    html.append('    <h2 class="seo-section-title">🗺️ 站点导航</h2>')
    html.append('    <div class="seo-sitemap-grid">')

    # 核心页面
    html.append('    <div class="seo-sitemap-group">')
    html.append('        <h3 class="seo-sitemap-group-title">核心页面</h3>')
    html.append('        <ul class="seo-sitemap-list">')
    html.append('            <li><a href="/">🏠 首页 - 知识铺</a></li>')
    html.append('            <li><a href="/archives/">📚 全站归档 - 3700+篇文章</a></li>')
    html.append('            <li><a href="/tags/">🏷️ 标签云 - 主题标签</a></li>')
    html.append('            <li><a href="/categories/">📂 分类导航 - 内容领域</a></li>')
    html.append('            <li><a href="/about/">ℹ️ 关于我们</a></li>')
    html.append('            <li><a href="/search/">🔍 站内搜索</a></li>')
    html.append('        </ul>')
    html.append('    </div>')

    # 内容专区
    html.append('    <div class="seo-sitemap-group">')
    html.append('        <h3 class="seo-sitemap-group-title">内容专区</h3>')
    html.append('        <ul class="seo-sitemap-list">')
    html.append('            <li><a href="/ai/">🤖 AI人工智能 - 工具教程</a></li>')
    html.append('            <li><a href="/ai001/">🤖 AI专区001 - 应用实践</a></li>')
    html.append('            <li><a href="/geek/">💻 技术开发 - 编程技术</a></li>')
    html.append('            <li><a href="/geek001/">💻 技术001 - 前后端</a></li>')
    html.append('            <li><a href="/geek002/">💻 技术002 - 架构设计</a></li>')
    html.append('            <li><a href="/stock/">📈 股票金融 - 市场分析</a></li>')
    html.append('            <li><a href="/stock001/">📈 股票001 - 技术分析</a></li>')
    html.append('            <li><a href="/gpt/">🧠 GPT大模型 - AI应用</a></li>')
    html.append('            <li><a href="/go/">🐹 Go语言 - 编程学习</a></li>')
    html.append('            <li><a href="/ecg/">💊 健康医疗 - 医学科普</a></li>')
    html.append('        </ul>')
    html.append('    </div>')

    # 特色项目
    html.append('    <div class="seo-sitemap-group">')
    html.append('        <h3 class="seo-sitemap-group-title">特色项目</h3>')
    html.append('        <ul class="seo-sitemap-list">')
    html.append('            <li><a href="/ai1000website/">🚀 AI工具导航 - 1700+工具</a></li>')
    html.append('            <li><a href="/fly-by/">🎮 Fly By游戏 - 3D飞行</a></li>')
    html.append('            <li><a href="/upecg/">📊 ECG信号处理 - 开源工具</a></li>')
    html.append('        </ul>')
    html.append('    </div>')

    # SEO资源
    html.append('    <div class="seo-sitemap-group">')
    html.append('        <h3 class="seo-sitemap-group-title">SEO资源</h3>')
    html.append('        <ul class="seo-sitemap-list">')
    html.append('            <li><a href="/sitemap.xml">📄 XML Sitemap</a></li>')
    html.append('            <li><a href="/robots.txt">🤖 Robots.txt</a></li>')
    html.append('            <li><a href="/index.xml">📡 RSS订阅</a></li>')
    html.append('        </ul>')
    html.append('    </div>')

    html.append('    </div>')
    html.append('</section>')
    return '\n'.join(html)

def generate_tag_cloud():
    """生成标签云（静态HTML）"""
    html = []
    html.append('<!-- 🏷️ SEO内链区域：热门标签 -->')
    html.append('<section class="seo-tags-section">')
    html.append('    <h2 class="seo-section-title">🏷️ 热门标签</h2>')
    html.append('    <div class="seo-tag-cloud">')

    tags = [
        ('ChatGPT', '/tags/ChatGPT/', '大语言模型应用'),
        ('AI浪潮', '/tags/AI浪潮/', 'AI行业趋势'),
        ('OpenAI', '/tags/OpenAI/', 'OpenAI技术'),
        ('人工智能', '/tags/人工智能/', 'AI基础知识'),
        ('Prompt工程', '/tags/Prompt-Engineering/', 'Prompt技巧'),
        ('自然语言处理', '/tags/自然语言处理/', 'NLP技术'),
        ('大模型协作', '/tags/大模型协作/', 'AI协作'),
        ('Prompt技术', '/tags/Prompt技术/', 'Prompt应用'),
    ]

    for tag_name, tag_url, tag_desc in tags:
        html.append(f'        <a href="{tag_url}" class="seo-tag-link" title="{tag_desc}">')
        html.append(f'            🏷️ {tag_name}')
        html.append(f'        </a>')

    html.append('    </div>')
    html.append('</section>')
    return '\n'.join(html)

def generate_css():
    """生成SEO内链区域的CSS样式"""
    css = """
/* ========== SEO内链区域样式 ========== */
.seo-links-section,
.seo-category-section,
.seo-sitemap-section,
.seo-tags-section {
    margin: 40px 0;
    padding: 30px;
    background: #f9fafb;
    border-radius: 12px;
}

.seo-section-title {
    font-size: 24px;
    margin-bottom: 25px;
    color: #1f2937;
    font-weight: 600;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 12px;
}

/* 热门文章网格 */
.seo-articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

.seo-article-item {
    background: white;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.seo-article-link {
    display: block;
    padding: 15px;
    text-decoration: none;
    color: inherit;
}

.seo-article-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.seo-article-icon {
    font-size: 24px;
    margin-right: 8px;
}

.seo-article-category {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
}

.seo-article-title {
    font-size: 14px;
    color: #1f2937;
    margin: 8px 0;
    line-height: 1.5;
}

.seo-article-date {
    font-size: 12px;
    color: #9ca3af;
}

/* 分类区域 */
.seo-category-header {
    margin-bottom: 20px;
}

.seo-category-title {
    font-size: 20px;
    color: #1f2937;
    margin-bottom: 8px;
}

.seo-category-icon {
    font-size: 24px;
    margin-right: 8px;
}

.seo-category-count {
    font-size: 14px;
    color: #6b7280;
}

.seo-category-desc {
    font-size: 14px;
    color: #6b7280;
    margin: 8px 0;
}

.seo-category-more {
    display: inline-block;
    margin-top: 10px;
    color: #6366f1;
    text-decoration: none;
    font-size: 14px;
}

.seo-article-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.seo-list-item {
    border-bottom: 1px solid #e5e7eb;
    padding: 10px 0;
}

.seo-list-item:last-child {
    border-bottom: none;
}

.seo-list-item a {
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-decoration: none;
    color: #1f2937;
    transition: color 0.2s ease;
}

.seo-list-item a:hover {
    color: #6366f1;
}

.seo-item-title {
    flex: 1;
    font-size: 14px;
}

.seo-item-date {
    font-size: 12px;
    color: #9ca3af;
    margin-left: 15px;
}

/* 站点地图 */
.seo-sitemap-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 25px;
}

.seo-sitemap-group-title {
    font-size: 16px;
    color: #1f2937;
    margin-bottom: 12px;
    font-weight: 600;
}

.seo-sitemap-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.seo-sitemap-list li {
    margin-bottom: 8px;
}

.seo-sitemap-list a {
    text-decoration: none;
    color: #4b5563;
    font-size: 14px;
    transition: color 0.2s ease;
}

.seo-sitemap-list a:hover {
    color: #6366f1;
}

/* 标签云 */
.seo-tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.seo-tag-link {
    display: inline-block;
    padding: 8px 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 20px;
    text-decoration: none;
    color: #4b5563;
    font-size: 14px;
    transition: all 0.2s ease;
}

.seo-tag-link:hover {
    border-color: #6366f1;
    color: #6366f1;
    background: #eef2ff;
}

/* 响应式 */
@media (max-width: 768px) {
    .seo-articles-grid {
        grid-template-columns: 1fr;
    }

    .seo-sitemap-grid {
        grid-template-columns: 1fr;
    }
}
"""
    return css

def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("🚀 首页SEO内链生成器 - ULTRATHINK模式")
    print("=" * 60)

    base_path = Path(__file__).parent.parent

    # 读取数据
    print("\n📖 读取JSON数据...")
    with open(base_path / 'site-links-recent.json', 'r', encoding='utf-8') as f:
        recent_data = json.load(f)

    with open(base_path / 'site-links-by-category.json', 'r', encoding='utf-8') as f:
        category_data = json.load(f)

    articles = recent_data['articles']
    categories = category_data['data']

    print(f"✅ 加载 {len(articles)} 篇文章")
    print(f"✅ 加载 {len(categories)} 个分类")

    # 生成HTML片段
    print("\n📝 生成HTML片段...")

    output_dir = base_path / 'seo-fragments'
    output_dir.mkdir(exist_ok=True)

    # 1. 热门文章
    popular_html = generate_popular_articles_section(articles, 50)
    with open(output_dir / 'popular-articles.html', 'w', encoding='utf-8') as f:
        f.write(popular_html)
    print("✅ popular-articles.html (50篇热门文章)")

    # 2. 分类文章列表
    category_html = generate_category_sections(categories)
    with open(output_dir / 'category-sections.html', 'w', encoding='utf-8') as f:
        f.write(category_html)
    print("✅ category-sections.html (各分类文章列表)")

    # 3. 站点地图
    sitemap_html = generate_sitemap_links()
    with open(output_dir / 'sitemap-links.html', 'w', encoding='utf-8') as f:
        f.write(sitemap_html)
    print("✅ sitemap-links.html (站点导航)")

    # 4. 标签云
    tags_html = generate_tag_cloud()
    with open(output_dir / 'tag-cloud.html', 'w', encoding='utf-8') as f:
        f.write(tags_html)
    print("✅ tag-cloud.html (热门标签)")

    # 5. CSS样式
    css = generate_css()
    with open(base_path / 'css' / 'seo-links.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("✅ css/seo-links.css (样式文件)")

    # 6. 生成完整片段（用于直接插入）
    full_html = []
    full_html.append(popular_html)
    full_html.append('\n\n')
    full_html.append(category_html)
    full_html.append('\n\n')
    full_html.append(sitemap_html)
    full_html.append('\n\n')
    full_html.append(tags_html)

    with open(output_dir / 'homepage-seo-links.html', 'w', encoding='utf-8') as f:
        f.write('\n'.join(full_html))
    print("✅ homepage-seo-links.html (完整片段)")

    # 统计内部链接数
    total_links = len(articles[:50]) + sum(min(len(arts), 20) for arts in categories.values()) + 20 + 8

    print("\n" + "=" * 60)
    print("📊 SEO内链统计:")
    print(f"  - 热门文章链接: 50个")
    print(f"  - 分类文章链接: ~{sum(min(len(arts), 20) for arts in categories.values())}个")
    print(f"  - 站点导航链接: 20个")
    print(f"  - 标签链接: 8个")
    print(f"  - 总计内部链接: {total_links}+ 个")
    print("\n💡 使用说明:")
    print("  1. 将 seo-fragments/homepage-seo-links.html 内容")
    print("     插入到 index.html 的主内容区域底部")
    print("  2. 在 <head> 中添加: <link rel='stylesheet' href='/css/seo-links.css'>")
    print("  3. 这些都是静态HTML，无需JavaScript！")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    main()
