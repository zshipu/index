#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
标签数据生成器
扫描tags目录，生成标签JSON数据文件用于tags页面
"""

import os
import sys
import io
import json
from pathlib import Path
from datetime import datetime

# 修复Windows控制台编码问题
if sys.platform == 'win32':
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

def scan_tags():
    """扫描tags目录，统计每个标签的文章数"""
    print("\n🏷️  扫描标签目录...")
    print("=" * 60)

    base_path = Path(__file__).parent.parent
    tags_dir = base_path / 'tags'

    if not tags_dir.exists():
        print("❌ tags目录不存在")
        return []

    tags = []

    # 遍历tags目录下的所有子目录
    for tag_dir in sorted(tags_dir.iterdir()):
        if not tag_dir.is_dir() or tag_dir.name in ['page', '.']:
            continue

        tag_name = tag_dir.name

        # 统计该标签下的文章数
        # 只计算根目录和非page子目录中的index.html
        article_count = 0

        # 1. 根目录下的index.html
        if (tag_dir / 'index.html').exists():
            article_count += 1

        # 2. 子目录中的index.html (排除page目录)
        for subdir in tag_dir.iterdir():
            if subdir.is_dir() and subdir.name != 'page':
                if (subdir / 'index.html').exists():
                    article_count += 1

        # 只记录有文章的标签
        if article_count > 0:
            tags.append({
                'name': tag_name,
                'count': article_count,
                'url': f'/tags/{tag_name}/'
            })

            print(f"  ✅ {tag_name}: {article_count} 篇")

    # 按文章数量排序
    tags.sort(key=lambda x: x['count'], reverse=True)

    print("\n" + "=" * 60)
    print(f"📊 总计: {len(tags)} 个标签")
    print("=" * 60)

    return tags

def generate_tags_json(tags):
    """生成标签JSON数据文件"""
    print("\n📝 生成标签JSON文件...")
    print("-" * 60)

    base_path = Path(__file__).parent.parent

    tags_data = {
        'generated_at': datetime.now().isoformat(),
        'total': len(tags),
        'tags': tags
    }

    with open(base_path / 'site-tags.json', 'w', encoding='utf-8') as f:
        json.dump(tags_data, f, ensure_ascii=False, indent=2)

    print("✅ site-tags.json")

    # 显示TOP 10标签
    print("\n📈 TOP 10 热门标签:")
    print("-" * 60)
    for i, tag in enumerate(tags[:10], 1):
        print(f"{i:2d}. 🏷️  {tag['name']:30s}: {tag['count']:3d} 篇")

    if len(tags) > 10:
        print(f"\n    ... 共 {len(tags)} 个标签")

def main():
    """主函数"""
    print("\n" + "=" * 60)
    print("🏷️  知识铺 - 标签数据生成器")
    print("=" * 60)

    # 扫描标签
    tags = scan_tags()

    if not tags:
        print("\n❌ 未找到任何标签")
        return

    # 生成JSON文件
    generate_tags_json(tags)

    print("\n" + "=" * 60)
    print("✅ 标签数据生成完成！")
    print("\n生成的文件:")
    print("  - site-tags.json (标签索引)")
    print("=" * 60 + "\n")

if __name__ == '__main__':
    main()
