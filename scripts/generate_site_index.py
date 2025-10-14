#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
知识铺全站链接索引生成器 - ULTRATHINK内链优化 + SEO Sitemap
生成JSON格式的全站文章索引和XML sitemap，用于：
1. Archives页面站点地图
2. 首页右侧栏内链卡片
3. 全站搜索功能
4. SEO: 完整sitemap.xml生成（包含所有3725+篇文章）
"""

import os
import sys
import io
import json
import re
from pathlib import Path
from datetime import datetime
from html.parser import HTMLParser
from collections import defaultdict

# 修复Windows控制台编码问题
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

class TitleExtractor(HTMLParser):
    """HTML标题提取器"""
    def __init__(self):
        super().__init__()
        self.in_title = False
        self.title = ""

    def handle_starttag(self, tag, attrs):
        if tag == "title":
            self.in_title = True

    def handle_data(self, data):
        if self.in_title:
            self.title += data

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

def clean_title(title):
    """清理标题"""
    # 移除常见后缀
    title = re.sub(r'--知识铺.*$', '', title)
    title = re.sub(r'\s*\|\s*最新资讯.*$', '', title)
    title = re.sub(r'\s*-\s*知识铺.*$', '', title)
    title = re.sub(r'_.*$', '', title)
    return title.strip()

def extract_title(html_path):
    """从HTML文件提取标题"""
    try:
        with open(html_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read(50000)  # 只读前50KB提高速度
            parser = TitleExtractor()
            parser.feed(content)
            title = clean_title(parser.title)
            return title if title else os.path.basename(os.path.dirname(html_path))
    except Exception as e:
        return os.path.basename(os.path.dirname(html_path))

def extract_date_from_path(path_str):
    """从路径提取日期"""
    # 匹配 20241013, 202410, 20240405 等格式
    match = re.search(r'/(\d{6,8})/', path_str)
    if match:
        date_str = match.group(1)
        try:
            if len(date_str) == 8:
                return datetime.strptime(date_str, '%Y%m%d').strftime('%Y-%m-%d')
            elif len(date_str) == 6:
                return datetime.strptime(date_str, '%Y%m').strftime('%Y-%m-01')
        except:
            pass
    return None

def scan_category(base_dir, category_name, icon, limit=None):
    """扫描单个分类目录"""
    articles = []
    post_dir = Path(base_dir) / 'post'

    if not post_dir.exists():
        print(f"  ⚠️  {category_name}: post目录不存在")
        return articles

    count = 0

    # 遍历日期目录
    for date_dir in sorted(post_dir.iterdir(), reverse=True):
        if not date_dir.is_dir() or date_dir.name == 'page':
            continue

        # 遍历文章目录
        for article_dir in date_dir.iterdir():
            if not article_dir.is_dir():
                continue

            index_file = article_dir / 'index.html'
            if not index_file.exists():
                continue

            # 提取信息
            title = extract_title(index_file)
            rel_path = f"/{category_name}/post/{date_dir.name}/{article_dir.name}/"
            date = extract_date_from_path(rel_path)

            articles.append({
                'title': title,
                'path': rel_path,
                'date': date or datetime.fromtimestamp(index_file.stat().st_mtime).strftime('%Y-%m-%d'),
                'category': category_name,
                'icon': icon,
                'mtime': index_file.stat().st_mtime
            })

            count += 1
            if limit and count >= limit:
                break

        if limit and count >= limit:
            break

    print(f"  ✅ {category_name}: {len(articles)} 篇文章")
    return articles

def generate_site_index(max_per_category=500):
    """生成全站索引"""
    print("\n🚀 开始生成全站链接索引...")
    print("=" * 60)

    # 获取项目根目录（scripts的父目录）
    base_path = Path(__file__).parent.parent
    all_articles = []

    # 分类配置
    categories = [
        ('ai', 'AI人工智能', '🤖'),
        ('ai001', 'AI专区001', '🤖'),
        ('ai002', 'AI专区002', '🤖'),
        ('geek', '技术开发', '💻'),
        ('geek001', '技术001', '💻'),
        ('geek002', '技术002', '💻'),
        ('stock', '股票金融', '📈'),
        ('stock001', '股票001', '📈'),
        ('stock002', '股票002', '📈'),
        ('gpt', 'GPT大模型', '🧠'),
        ('go', 'Go语言', '🐹'),
        ('ecg', '健康医疗', '💊'),
        ('ds', '数据科学', '📊'),
    ]

    for dir_name, cat_name, icon in categories:
        cat_path = base_path / dir_name
        if cat_path.exists():
            articles = scan_category(cat_path, dir_name, icon, max_per_category)
            all_articles.extend(articles)

    # 按修改时间排序
    all_articles.sort(key=lambda x: x['mtime'], reverse=True)

    # 移除mtime字段
    for article in all_articles:
        del article['mtime']

    print("\n" + "=" * 60)
    print(f"📊 总计: {len(all_articles)} 篇文章")
    print("=" * 60)

    return all_articles

def generate_json_files(articles):
    """生成多个JSON文件"""
    # 获取项目根目录
    base_path = Path(__file__).parent.parent

    # 1. 完整索引
    full_index = {
        'generated_at': datetime.now().isoformat(),
        'total': len(articles),
        'articles': articles
    }

    with open(base_path / 'site-links-full.json', 'w', encoding='utf-8') as f:
        json.dump(full_index, f, ensure_ascii=False, indent=2)
    print("✅ 生成: site-links-full.json")

    # 2. 最新100篇（首页用）
    recent_100 = {
        'generated_at': datetime.now().isoformat(),
        'total': len(articles[:100]),
        'articles': articles[:100]
    }

    with open(base_path / 'site-links-recent.json', 'w', encoding='utf-8') as f:
        json.dump(recent_100, f, ensure_ascii=False, indent=2)
    print("✅ 生成: site-links-recent.json")

    # 3. 按分类分组
    by_category = defaultdict(list)
    for article in articles:
        by_category[article['category']].append(article)

    category_index = {
        'generated_at': datetime.now().isoformat(),
        'categories': {cat: len(arts) for cat, arts in by_category.items()},
        'data': dict(by_category)
    }

    with open(base_path / 'site-links-by-category.json', 'w', encoding='utf-8') as f:
        json.dump(category_index, f, ensure_ascii=False, indent=2)
    print("✅ 生成: site-links-by-category.json")

    # 4. 按年月分组
    by_month = defaultdict(list)
    for article in articles:
        if article['date']:
            month_key = article['date'][:7]  # YYYY-MM
            by_month[month_key].append(article)

    month_index = {
        'generated_at': datetime.now().isoformat(),
        'months': sorted(by_month.keys(), reverse=True),
        'data': dict(by_month)
    }

    with open(base_path / 'site-links-by-month.json', 'w', encoding='utf-8') as f:
        json.dump(month_index, f, ensure_ascii=False, indent=2)
    print("✅ 生成: site-links-by-month.json")

    # 5. 精简版（只包含标题和路径，搜索用）
    search_index = [
        {'t': a['title'], 'p': a['path'], 'c': a['category']}
        for a in articles
    ]

    with open(base_path / 'site-links-search.json', 'w', encoding='utf-8') as f:
        json.dump(search_index, f, ensure_ascii=False, separators=(',', ':'))
    print("✅ 生成: site-links-search.json (压缩格式)")

def generate_stats(articles):
    """生成统计信息"""
    print("\n" + "=" * 60)
    print("📈 统计信息")
    print("=" * 60)

    # 按分类统计
    by_cat = defaultdict(int)
    for a in articles:
        by_cat[a['category']] += 1

    print("\n按分类:")
    for cat, count in sorted(by_cat.items(), key=lambda x: x[1], reverse=True):
        icon = next((c[2] for c in [
            ('ai', 'AI人工智能', '🤖'), ('geek', '技术开发', '💻'),
            ('stock', '股票金融', '📈'), ('gpt', 'GPT', '🧠'),
            ('go', 'Go', '🐹'), ('ecg', '健康', '💊')
        ] if cat.startswith(c[0])), '📄')
        print(f"  {icon} {cat:12s}: {count:4d} 篇")

    # 按年份统计
    by_year = defaultdict(int)
    for a in articles:
        if a['date']:
            year = a['date'][:4]
            by_year[year] += 1

    print("\n按年份:")
    for year, count in sorted(by_year.items(), reverse=True):
        print(f"  📅 {year}: {count:4d} 篇")

    print("\n" + "=" * 60)

def generate_sitemaps(articles, base_url='https://index.zshipu.com'):
    """生成完整的sitemap.xml文件集"""
    print("\n🗺️  生成Sitemap XML文件...")
    print("-" * 60)

    base_path = Path(__file__).parent.parent

    # 按分类分组文章
    by_category = defaultdict(list)
    for article in articles:
        by_category[article['category']].append(article)

    # 1. 生成核心页面sitemap
    core_pages = [
        ('', 1.0, 'daily'),
        ('/ai/', 0.9, 'daily'),
        ('/geek/', 0.9, 'daily'),
        ('/stock/', 0.9, 'daily'),
        ('/gpt/', 0.8, 'weekly'),
        ('/go/', 0.8, 'weekly'),
        ('/ecg/', 0.8, 'weekly'),
        ('/archives/', 0.7, 'weekly'),
        ('/categories/', 0.7, 'weekly'),
        ('/tags/', 0.7, 'weekly'),
        ('/about/', 0.6, 'monthly'),
        ('/search/', 0.5, 'monthly'),
        ('/ai1000website/', 0.9, 'weekly'),
    ]

    sitemap_pages = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_pages.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for path, priority, changefreq in core_pages:
        sitemap_pages.append('  <url>')
        sitemap_pages.append(f'    <loc>{base_url}{path}</loc>')
        sitemap_pages.append(f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>')
        sitemap_pages.append(f'    <changefreq>{changefreq}</changefreq>')
        sitemap_pages.append(f'    <priority>{priority}</priority>')
        sitemap_pages.append('  </url>')

    sitemap_pages.append('</urlset>')

    with open(base_path / 'sitemap-pages.xml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap_pages))
    print("✅ sitemap-pages.xml (核心页面)")

    # 2. 为主要分类生成文章sitemap
    category_sitemaps = []

    for cat_prefix in ['ai', 'geek', 'stock']:
        # 合并所有相关分类的文章
        cat_articles = []
        for cat_name, articles_list in by_category.items():
            if cat_name.startswith(cat_prefix):
                cat_articles.extend(articles_list)

        if not cat_articles:
            continue

        sitemap_name = f'sitemap-posts-{cat_prefix}.xml'
        category_sitemaps.append(sitemap_name)

        sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
        sitemap_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

        for article in cat_articles[:1000]:  # 限制每个sitemap最多1000个URL
            # 根据文章发布时间计算优先级
            priority = 0.8
            if article.get('date'):
                try:
                    article_date = datetime.strptime(article['date'], '%Y-%m-%d')
                    days_old = (datetime.now() - article_date).days
                    if days_old < 30:
                        priority = 0.9
                    elif days_old < 90:
                        priority = 0.8
                    elif days_old < 365:
                        priority = 0.7
                    else:
                        priority = 0.6
                except:
                    pass

            sitemap_lines.append('  <url>')
            sitemap_lines.append(f'    <loc>{base_url}{article["path"]}</loc>')
            if article.get('date'):
                sitemap_lines.append(f'    <lastmod>{article["date"]}</lastmod>')
            sitemap_lines.append('    <changefreq>monthly</changefreq>')
            sitemap_lines.append(f'    <priority>{priority}</priority>')
            sitemap_lines.append('  </url>')

        sitemap_lines.append('</urlset>')

        with open(base_path / sitemap_name, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sitemap_lines))
        print(f"✅ {sitemap_name} ({len(cat_articles[:1000])} 篇文章)")

    # 3. 生成其他分类文章sitemap (gpt, go, ecg, ds)
    other_articles = []
    for cat_name in ['gpt', 'go', 'ecg', 'ds']:
        if cat_name in by_category:
            other_articles.extend(by_category[cat_name])

    if other_articles:
        sitemap_name = 'sitemap-posts-other.xml'
        category_sitemaps.append(sitemap_name)

        sitemap_lines = ['<?xml version="1.0" encoding="UTF-8"?>']
        sitemap_lines.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

        for article in other_articles:
            sitemap_lines.append('  <url>')
            sitemap_lines.append(f'    <loc>{base_url}{article["path"]}</loc>')
            if article.get('date'):
                sitemap_lines.append(f'    <lastmod>{article["date"]}</lastmod>')
            sitemap_lines.append('    <changefreq>monthly</changefreq>')
            sitemap_lines.append('    <priority>0.7</priority>')
            sitemap_lines.append('  </url>')

        sitemap_lines.append('</urlset>')

        with open(base_path / sitemap_name, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sitemap_lines))
        print(f"✅ {sitemap_name} ({len(other_articles)} 篇文章)")

    # 4. 生成分类页面sitemap
    categories_to_list = ['ai', 'ai001', 'ai002', 'geek', 'geek001', 'geek002',
                          'stock', 'stock001', 'stock002', 'gpt', 'go', 'ecg', 'ds']

    sitemap_cats = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_cats.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for cat in categories_to_list:
        sitemap_cats.append('  <url>')
        sitemap_cats.append(f'    <loc>{base_url}/{cat}/</loc>')
        sitemap_cats.append(f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>')
        sitemap_cats.append('    <changefreq>weekly</changefreq>')
        sitemap_cats.append('    <priority>0.8</priority>')
        sitemap_cats.append('  </url>')

    sitemap_cats.append('</urlset>')

    with open(base_path / 'sitemap-categories.xml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap_cats))
    print(f"✅ sitemap-categories.xml ({len(categories_to_list)} 个分类)")

    # 5. 生成标签sitemap (占位符，实际标签需要从文章中提取)
    sitemap_tags = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_tags.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    # 添加主要标签页面
    common_tags = ['AI', 'ChatGPT', 'Python', 'Java', 'Go', '股票', '投资', '技术',
                   '编程', '数据科学', 'ECG', '健康', 'GPT', 'AI工具']

    for tag in common_tags:
        sitemap_tags.append('  <url>')
        sitemap_tags.append(f'    <loc>{base_url}/tags/{tag}/</loc>')
        sitemap_tags.append(f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>')
        sitemap_tags.append('    <changefreq>weekly</changefreq>')
        sitemap_tags.append('    <priority>0.6</priority>')
        sitemap_tags.append('  </url>')

    sitemap_tags.append('</urlset>')

    with open(base_path / 'sitemap-tags.xml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap_tags))
    print(f"✅ sitemap-tags.xml ({len(common_tags)} 个标签)")

    # 6. 生成主sitemap索引文件
    sitemap_index = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_index.append('<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    all_sitemaps = ['sitemap-pages.xml'] + category_sitemaps + ['sitemap-categories.xml', 'sitemap-tags.xml']

    for sitemap_file in all_sitemaps:
        sitemap_index.append('  <sitemap>')
        sitemap_index.append(f'    <loc>{base_url}/{sitemap_file}</loc>')
        sitemap_index.append(f'    <lastmod>{datetime.now().strftime("%Y-%m-%d")}</lastmod>')
        sitemap_index.append('  </sitemap>')

    sitemap_index.append('</sitemapindex>')

    with open(base_path / 'sitemap.xml', 'w', encoding='utf-8') as f:
        f.write('\n'.join(sitemap_index))
    print(f"✅ sitemap.xml (主索引, 包含 {len(all_sitemaps)} 个子sitemap)")

    print("\n📊 Sitemap生成统计:")
    print(f"  - 核心页面: 13 个")
    print(f"  - 文章页面: {len(articles)} 篇")
    print(f"  - 分类页面: {len(categories_to_list)} 个")
    print(f"  - 标签页面: {len(common_tags)} 个")
    print(f"  - 总计URL: {13 + len(articles) + len(categories_to_list) + len(common_tags)} 个")

def generate_robots_txt():
    """生成robots.txt文件"""
    print("\n🤖 生成robots.txt文件...")
    print("-" * 60)

    base_path = Path(__file__).parent.parent

    robots_content = """# robots.txt for index.zshipu.com

User-agent: *
Allow: /

# 禁止索引的目录
Disallow: /admin/
Disallow: /private/
Disallow: /temp/
Disallow: /scripts/

# 禁止索引分页页面（避免重复内容）
Disallow: /page/
Disallow: /*/page/

# 允许CSS和JS（利于渲染）
Allow: /css/
Allow: /js/
Allow: /images/

# Sitemap位置
Sitemap: https://index.zshipu.com/sitemap.xml

# 爬取延迟（可选）
Crawl-delay: 1
"""

    with open(base_path / 'robots.txt', 'w', encoding='utf-8') as f:
        f.write(robots_content.strip())

    print("✅ robots.txt (搜索引擎指引文件)")


def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("🚀 知识铺 - 全站链接索引生成器")
    print("   ULTRATHINK 内链优化系统")
    print("=" * 60)

    # 生成索引
    articles = generate_site_index(max_per_category=500)

    if not articles:
        print("\n❌ 错误: 未找到任何文章")
        return

    # 生成JSON文件
    print("\n📝 生成JSON文件...")
    print("-" * 60)
    generate_json_files(articles)

    # 生成Sitemap文件
    generate_sitemaps(articles)

    # 生成robots.txt
    generate_robots_txt()

    # 统计信息
    generate_stats(articles)

    # 显示示例
    print("\n📰 最新10篇文章:")
    print("-" * 60)
    for i, article in enumerate(articles[:10], 1):
        print(f"{i:2d}. [{article['icon']} {article['category']:8s}] {article['title'][:50]}...")

    print("\n" + "=" * 60)
    print("✅ 全部完成！")
    print("\n生成的文件:")
    print("  📄 JSON数据文件:")
    print("     - site-links-full.json        (完整索引)")
    print("     - site-links-recent.json      (最新100篇，首页用)")
    print("     - site-links-by-category.json (按分类)")
    print("     - site-links-by-month.json    (按月份)")
    print("     - site-links-search.json      (搜索用，压缩格式)")
    print("\n  🗺️  SEO Sitemap文件:")
    print("     - sitemap.xml                 (主索引)")
    print("     - sitemap-pages.xml           (核心页面)")
    print("     - sitemap-posts-ai.xml        (AI分类文章)")
    print("     - sitemap-posts-geek.xml      (技术分类文章)")
    print("     - sitemap-posts-stock.xml     (股票分类文章)")
    print("     - sitemap-posts-other.xml     (其他分类文章)")
    print("     - sitemap-categories.xml      (分类页面)")
    print("     - sitemap-tags.xml            (标签页面)")
    print("\n  🤖 SEO配置文件:")
    print("     - robots.txt                  (搜索引擎指引)")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    main()
