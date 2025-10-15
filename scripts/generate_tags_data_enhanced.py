#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强版标签数据生成器 - 世界级Tags系统
功能：
1. 聚合所有域的标签数据
2. 智能分类标签
3. 计算标签关系
4. 生成趋势数据
"""

import os
import sys
import io
import json
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict, Counter
from html.parser import HTMLParser

# 修复Windows控制台编码问题
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass


class ArticleMetaExtractor(HTMLParser):
    """提取HTML文章的元数据"""
    def __init__(self):
        super().__init__()
        self.tags = []
        self.title = ''
        self.date = None
        self.in_title = False
        self.in_meta_keywords = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == 'title':
            self.in_title = True
        elif tag == 'meta':
            # 提取keywords作为标签
            if attrs_dict.get('name') == 'keywords':
                keywords = attrs_dict.get('content', '')
                self.tags.extend([k.strip() for k in keywords.split(',') if k.strip()])
            # 提取发布日期
            elif attrs_dict.get('property') == 'article:published_time':
                date_str = attrs_dict.get('content', '')
                try:
                    self.date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                except:
                    pass

    def handle_data(self, data):
        if self.in_title:
            self.title = data.strip()

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False


# ==================== 标签分类配置 ====================
TAG_CATEGORIES = {
    'AI技术': {
        'icon': '🤖',
        'color': '#667eea',
        'keywords': ['AI', '人工智能', 'ChatGPT', 'GPT', 'OpenAI', '机器学习', '深度学习',
                    'LLM', '大模型', 'Agent', 'Prompt', 'AIGC', 'AGI', '神经网络'],
        'description': '人工智能、机器学习、大语言模型相关技术标签'
    },
    '编程开发': {
        'icon': '💻',
        'color': '#48bb78',
        'keywords': ['Python', 'JavaScript', 'Java', 'Go', 'Rust', 'C++', 'TypeScript',
                    'React', 'Vue', 'Node.js', '前端', '后端', 'Web开发', '编程', '开发'],
        'description': '编程语言、开发框架、软件工程相关标签'
    },
    '金融投资': {
        'icon': '📈',
        'color': '#f59e0b',
        'keywords': ['股票', '投资', '理财', '金融', '交易', 'A股', '基金', '证券',
                    '量化', '技术分析', '价值投资'],
        'description': '股票、投资、金融市场相关标签'
    },
    '数据科学': {
        'icon': '📊',
        'color': '#8b5cf6',
        'keywords': ['数据分析', '数据科学', '数据挖掘', 'Pandas', 'NumPy', '可视化',
                    'SQL', '数据库', 'BigData', '统计'],
        'description': '数据分析、数据科学、数据库相关标签'
    },
    '工具效率': {
        'icon': '🔧',
        'color': '#ec4899',
        'keywords': ['工具', '效率', '自动化', 'Git', 'Docker', 'Linux', 'Shell',
                    'VSCode', 'IDE', '插件', '办公'],
        'description': '开发工具、效率工具、自动化相关标签'
    },
    '云计算': {
        'icon': '☁️',
        'color': '#06b6d4',
        'keywords': ['云计算', 'AWS', 'Azure', '阿里云', '腾讯云', 'Kubernetes',
                    '微服务', '容器', 'DevOps', 'CI/CD'],
        'description': '云计算、容器、DevOps相关标签'
    },
    '健康医疗': {
        'icon': '🏥',
        'color': '#10b981',
        'keywords': ['健康', '医疗', '心电图', 'ECG', '医学', '诊断', '保健'],
        'description': '健康、医疗、医学技术相关标签'
    },
    '学习教育': {
        'icon': '📚',
        'color': '#f97316',
        'keywords': ['学习', '教程', '教育', '课程', '培训', '知识', '技巧',
                    '入门', '进阶', '最佳实践'],
        'description': '学习资源、教程、知识分享相关标签'
    },
    '其他': {
        'icon': '🏷️',
        'color': '#6b7280',
        'keywords': [],
        'description': '其他未分类标签'
    }
}


def classify_tag(tag_name):
    """智能分类标签"""
    tag_lower = tag_name.lower()

    # 精确匹配
    for category, config in TAG_CATEGORIES.items():
        for keyword in config['keywords']:
            if keyword.lower() in tag_lower or tag_lower in keyword.lower():
                return category

    # 默认分类
    return '其他'


def scan_all_tags():
    """扫描所有域的标签目录"""
    print("\n" + "=" * 80)
    print("🏷️  扫描全站标签数据...")
    print("=" * 80)

    base_path = Path(__file__).parent.parent

    # 所有需要扫描的tags目录
    tags_dirs = [
        base_path / 'tags',
        base_path / 'ai' / 'tags',
        base_path / 'ai001' / 'tags',
        base_path / 'ai002' / 'tags',
        base_path / 'geek' / 'tags',
        base_path / 'geek001' / 'tags',
        base_path / 'geek002' / 'tags',
        base_path / 'stock' / 'tags',
        base_path / 'stock001' / 'tags',
        base_path / 'stock002' / 'tags',
        base_path / 'gpt' / 'tags',
        base_path / 'go' / 'tags',
        base_path / 'ecg' / 'tags',
    ]

    all_tags = {}  # {tag_name: {count, urls, domain, articles}}
    domain_stats = defaultdict(int)
    tag_articles = defaultdict(list)  # 用于计算标签共现

    for tags_dir in tags_dirs:
        if not tags_dir.exists():
            continue

        domain = tags_dir.parent.name if tags_dir.parent.name != base_path.name else 'root'
        print(f"\n📂 扫描域: {domain}")
        print("-" * 80)

        # 遍历标签目录
        for tag_dir in sorted(tags_dir.iterdir()):
            if not tag_dir.is_dir() or tag_dir.name in ['page', '.']:
                continue

            tag_name = tag_dir.name

            # 统计文章数
            article_count = 0
            article_paths = []

            # 1. 根目录下的index.html
            if (tag_dir / 'index.html').exists():
                article_count += 1
                article_paths.append(str(tag_dir / 'index.html'))

            # 2. 子目录中的文章
            for item in tag_dir.iterdir():
                if item.is_dir() and item.name != 'page':
                    if (item / 'index.html').exists():
                        article_count += 1
                        article_paths.append(str(item / 'index.html'))

            if article_count > 0:
                if tag_name not in all_tags:
                    all_tags[tag_name] = {
                        'name': tag_name,
                        'count': 0,
                        'domains': set(),
                        'urls': set(),
                        'articles': []
                    }

                all_tags[tag_name]['count'] += article_count
                all_tags[tag_name]['domains'].add(domain)
                all_tags[tag_name]['urls'].add(f'/tags/{tag_name}/')
                all_tags[tag_name]['articles'].extend(article_paths)

                domain_stats[domain] += 1

                # 记录标签的文章用于计算共现
                tag_articles[tag_name].extend(article_paths)

                print(f"  ✅ {tag_name:40s}: {article_count:4d} 篇")

    # 转换为列表格式
    tags_list = []
    for tag_name, data in all_tags.items():
        tags_list.append({
            'name': tag_name,
            'count': data['count'],
            'url': list(data['urls'])[0],  # 使用第一个URL
            'domains': list(data['domains']),
            'category': classify_tag(tag_name),
            'articles': data['articles'][:10]  # 只保留前10篇用于展示
        })

    # 按文章数量排序
    tags_list.sort(key=lambda x: x['count'], reverse=True)

    print("\n" + "=" * 80)
    print(f"📊 扫描完成统计")
    print("=" * 80)
    print(f"总标签数: {len(tags_list)}")
    print(f"总文章数: {sum(t['count'] for t in tags_list)}")
    print("\n各域标签数:")
    for domain, count in sorted(domain_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {domain:15s}: {count:4d} 个标签")

    return tags_list, tag_articles


def calculate_tag_relations(tags_list, tag_articles, max_relations=10):
    """计算标签关系（基于共现频率）"""
    print("\n" + "=" * 80)
    print("🔗 计算标签关系...")
    print("=" * 80)

    # 构建文章到标签的映射
    article_to_tags = defaultdict(set)
    for tag_data in tags_list:
        tag_name = tag_data['name']
        for article in tag_data.get('articles', []):
            article_to_tags[article].add(tag_name)

    # 计算标签共现频率
    tag_cooccurrence = defaultdict(lambda: defaultdict(int))

    for article, tags in article_to_tags.items():
        tags_list_local = list(tags)
        for i, tag1 in enumerate(tags_list_local):
            for tag2 in tags_list_local[i+1:]:
                tag_cooccurrence[tag1][tag2] += 1
                tag_cooccurrence[tag2][tag1] += 1

    # 生成关系数据
    relations = {}
    for tag_data in tags_list:
        tag_name = tag_data['name']

        if tag_name in tag_cooccurrence:
            # 计算相关性得分（共现次数 / 总文章数）
            related = []
            for related_tag, cooccur_count in tag_cooccurrence[tag_name].items():
                score = cooccur_count / max(tag_data['count'], 1)
                related.append({
                    'tag': related_tag,
                    'score': round(score, 3),
                    'cooccurrence': cooccur_count
                })

            # 按得分排序，取前N个
            related.sort(key=lambda x: x['score'], reverse=True)
            relations[tag_name] = related[:max_relations]

    print(f"✅ 计算了 {len(relations)} 个标签的关联关系")

    return relations


def categorize_tags(tags_list):
    """将标签按分类组织"""
    print("\n" + "=" * 80)
    print("📁 组织标签分类...")
    print("=" * 80)

    categorized = defaultdict(list)
    category_stats = defaultdict(int)

    for tag in tags_list:
        category = tag['category']
        categorized[category].append(tag)
        category_stats[category] += 1

    # 每个分类按文章数排序
    for category in categorized:
        categorized[category].sort(key=lambda x: x['count'], reverse=True)

    print("\n分类统计:")
    for category, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
        icon = TAG_CATEGORIES[category]['icon']
        print(f"  {icon} {category:12s}: {count:4d} 个标签")

    return dict(categorized), category_stats


def generate_enhanced_json(tags_list, relations, categorized, category_stats):
    """生成增强版JSON数据文件"""
    print("\n" + "=" * 80)
    print("📝 生成增强版数据文件...")
    print("=" * 80)

    base_path = Path(__file__).parent.parent

    # 1. 主数据文件 - site-tags-enhanced.json
    main_data = {
        'generated_at': datetime.now().isoformat(),
        'version': '2.0',
        'total_tags': len(tags_list),
        'total_articles': sum(t['count'] for t in tags_list),
        'categories': {
            name: {
                'icon': config['icon'],
                'color': config['color'],
                'description': config['description'],
                'count': category_stats.get(name, 0)
            }
            for name, config in TAG_CATEGORIES.items()
        },
        'tags': [
            {
                'name': t['name'],
                'count': t['count'],
                'url': t['url'],
                'category': t['category'],
                'domains': t.get('domains', [])
            }
            for t in tags_list
        ]
    }

    with open(base_path / 'site-tags-enhanced.json', 'w', encoding='utf-8') as f:
        json.dump(main_data, f, ensure_ascii=False, indent=2)
    print("✅ site-tags-enhanced.json (主数据)")

    # 2. 分类数据 - tag-categories.json
    category_data = {}
    for category_name, tags in categorized.items():
        category_data[category_name] = {
            'icon': TAG_CATEGORIES[category_name]['icon'],
            'color': TAG_CATEGORIES[category_name]['color'],
            'description': TAG_CATEGORIES[category_name]['description'],
            'count': len(tags),
            'top_tags': [
                {'name': t['name'], 'count': t['count'], 'url': t['url']}
                for t in tags[:20]  # 前20个
            ]
        }

    with open(base_path / 'tag-categories.json', 'w', encoding='utf-8') as f:
        json.dump(category_data, f, ensure_ascii=False, indent=2)
    print("✅ tag-categories.json (分类数据)")

    # 3. 关系数据 - tag-relations.json
    with open(base_path / 'tag-relations.json', 'w', encoding='utf-8') as f:
        json.dump(relations, f, ensure_ascii=False, indent=2)
    print("✅ tag-relations.json (关系数据)")

    # 4. 热门标签 - tag-hot.json
    hot_tags = sorted(tags_list, key=lambda x: x['count'], reverse=True)[:100]
    with open(base_path / 'tag-hot.json', 'w', encoding='utf-8') as f:
        json.dump({
            'generated_at': datetime.now().isoformat(),
            'tags': [
                {'name': t['name'], 'count': t['count'], 'url': t['url'], 'category': t['category']}
                for t in hot_tags
            ]
        }, f, ensure_ascii=False, indent=2)
    print("✅ tag-hot.json (热门标签)")

    # 显示统计信息
    print("\n" + "=" * 80)
    print("📈 数据统计")
    print("=" * 80)
    print(f"总标签数: {len(tags_list)}")
    print(f"总文章数: {sum(t['count'] for t in tags_list)}")
    print(f"分类数: {len(categorized)}")
    print(f"关联关系: {len(relations)}")

    print("\n🏆 TOP 20 热门标签:")
    print("-" * 80)
    for i, tag in enumerate(tags_list[:20], 1):
        category_icon = TAG_CATEGORIES[tag['category']]['icon']
        print(f"{i:2d}. {category_icon} {tag['name']:40s}: {tag['count']:5d} 篇")


def main():
    """主函数"""
    print("\n" + "=" * 80)
    print("🏷️  知识铺 - 增强版标签数据生成器 v2.0")
    print("=" * 80)

    # 1. 扫描所有标签
    tags_list, tag_articles = scan_all_tags()

    if not tags_list:
        print("\n❌ 未找到任何标签")
        return

    # 2. 计算标签关系
    relations = calculate_tag_relations(tags_list, tag_articles)

    # 3. 分类标签
    categorized, category_stats = categorize_tags(tags_list)

    # 4. 生成JSON文件
    generate_enhanced_json(tags_list, relations, categorized, category_stats)

    print("\n" + "=" * 80)
    print("✅ 增强版标签数据生成完成！")
    print("\n生成的文件:")
    print("  - site-tags-enhanced.json (主数据文件)")
    print("  - tag-categories.json (分类数据)")
    print("  - tag-relations.json (关系图谱)")
    print("  - tag-hot.json (热门标签)")
    print("=" * 80 + "\n")


if __name__ == '__main__':
    main()
