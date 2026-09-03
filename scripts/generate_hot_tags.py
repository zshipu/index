#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成全站热门标签JSON文件
从各个子站点的tags目录中统计文章数量，生成热门标签列表
"""

import os
import json
from pathlib import Path
from collections import defaultdict
import re

# 需要扫描的子站点目录
SITE_DIRS = ['ai', 'ai001', 'ai002', 'geek', 'geek001', 'geek002', 'stock', 'stock001', 'stock002', 'gpt', 'go', 'ecg']

def count_articles_in_tag(tag_dir):
    """统计标签目录中的文章数量"""
    count = 0
    # 查找index.html文件，解析其中的文章列表
    index_file = tag_dir / 'index.html'
    if index_file.exists():
        try:
            with open(index_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # 统计文章链接数量（查找post/链接）
                post_links = re.findall(r'/post/[^"\']+', content)
                count = len(post_links)
        except Exception as e:
            print(f"Warning: Failed to parse {index_file}: {e}")
    return count

def collect_all_tags(base_dir):
    """收集所有子站点的标签"""
    tag_stats = defaultdict(int)  # {tag_name: article_count}
    tag_urls = {}  # {tag_name: first_url}

    for site in SITE_DIRS:
        tags_dir = base_dir / site / 'tags'
        if not tags_dir.exists():
            print(f"Skip: {tags_dir} not found")
            continue

        print(f"Scanning: {tags_dir}")

        # 遍历tags目录下的所有子目录
        for tag_dir in tags_dir.iterdir():
            if tag_dir.is_dir() and tag_dir.name not in ['.', '..']:
                tag_name = tag_dir.name
                article_count = count_articles_in_tag(tag_dir)

                if article_count > 0:
                    tag_stats[tag_name] += article_count
                    # 记录第一个找到的URL
                    if tag_name not in tag_urls:
                        tag_urls[tag_name] = f"/{site}/tags/{tag_name}/"

                    print(f"  - {tag_name}: {article_count} articles")

    return tag_stats, tag_urls

def generate_hot_tags_json(base_dir, output_file='tag-hot.json', top_n=100):
    """生成热门标签JSON文件"""
    print(f"\n{'='*60}")
    print("开始收集全站标签...")
    print(f"{'='*60}\n")

    tag_stats, tag_urls = collect_all_tags(base_dir)

    # 按文章数量排序
    sorted_tags = sorted(tag_stats.items(), key=lambda x: x[1], reverse=True)

    # 生成JSON数据
    hot_tags = {
        'generated_at': str(Path(__file__).stat().st_mtime),
        'total_tags': len(sorted_tags),
        'tags': [
            {
                'name': tag_name,
                'count': count,
                'url': tag_urls.get(tag_name, f'/tags/{tag_name}/')
            }
            for tag_name, count in sorted_tags[:top_n]
        ]
    }

    # 写入JSON文件
    output_path = base_dir / output_file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(hot_tags, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*60}")
    print(f"✅ 成功生成热门标签文件: {output_path}")
    print(f"{'='*60}")
    print(f"总标签数: {len(sorted_tags)}")
    print(f"输出标签数: {len(hot_tags['tags'])}")
    print(f"\n前10个热门标签:")
    for i, tag in enumerate(hot_tags['tags'][:10], 1):
        print(f"  {i}. {tag['name']}: {tag['count']}篇")
    print(f"{'='*60}\n")

if __name__ == '__main__':
    # 获取项目根目录
    script_dir = Path(__file__).parent
    base_dir = script_dir.parent

    # 生成热门标签JSON
    generate_hot_tags_json(base_dir, output_file='tag-hot.json', top_n=100)

    print("✅ 所有任务完成！")
