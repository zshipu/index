#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量修复文章标题和描述，确保包含"知识铺"品牌"""

import os
import re
from pathlib import Path

def extract_tags_from_title(title):
    """从标题提取标签"""
    tags = []
    if any(k in title for k in ['AI', '人工智能', '智能']):
        tags.append('AI技术')
    if any(k in title for k in ['编程', 'Code', '开发', '代码']):
        tags.append('编程开发')
    if 'Claude' in title:
        tags.append('Claude')
    if 'GLM' in title or '智谱' in title:
        tags.append('GLM')
    if any(k in title for k in ['工具', 'MCP', 'Agent']):
        tags.append('AI工具')
    if any(k in title for k in ['教师', '教学', '教育']):
        tags.append('教育应用')
    return tags if tags else ['技术资讯']

def fix_article(filepath):
    """修复单篇文章"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取frontmatter
        match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not match:
            return False

        fm_content = match.group(1)
        body = content[match.end():]

        # 提取title
        title_match = re.search(r'^title:\s*(.+)$', fm_content, re.MULTILINE)
        if not title_match:
            return False

        title = title_match.group(1).strip()

        # 如果标题中没有"知识铺"，添加" - 知识铺"
        if '知识铺' not in title:
            title = f"{title} - 知识铺"

        # 提取date
        date_match = re.search(r'^date:\s*(.+)$', fm_content, re.MULTILINE)
        date = date_match.group(1).strip() if date_match else '2025-10-05 00:00:00'

        # 提取author
        author_match = re.search(r'^author:\s*(.+)$', fm_content, re.MULTILINE)
        author = author_match.group(1).strip() if author_match else '知识铺'

        # 生成tags
        tags = extract_tags_from_title(title)

        # 生成description（从正文提取或根据标题生成）
        # 尝试从正文第一段提取
        body_lines = [line.strip() for line in body.split('\n') if line.strip() and not line.strip().startswith('#') and not line.strip().startswith('!')]
        first_para = ''
        for line in body_lines[:5]:
            if len(line) > 20 and not line.startswith('[') and not line.startswith('http'):
                first_para = line
                break

        if first_para and len(first_para) > 20:
            description = f"知识铺分享：{first_para[:80]}..."
        else:
            # 根据标题生成description
            clean_title = title.replace(' - 知识铺', '').replace('- 知识铺', '')
            description = f"知识铺分享：{clean_title}的详细解析和实用指南"

        # 构建新frontmatter
        new_frontmatter = f"""---
title: {title}
author: {author}
date: {date}
tags: {tags}
description: {description}
---

"""

        # 写入文件
        new_content = new_frontmatter + body
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return True

    except Exception as e:
        print(f"[ERROR] {filepath}: {str(e)}")
        return False

def main():
    current_dir = Path(__file__).parent
    md_files = list(current_dir.glob('*.md'))

    success = 0
    failed = 0

    for filepath in md_files:
        if fix_article(filepath):
            success += 1
            print(f"[OK] {filepath.name}")
        else:
            failed += 1
            print(f"[FAIL] {filepath.name}")

    print(f"\n{'='*50}")
    print(f"Success: {success}, Failed: {failed}, Total: {len(md_files)}")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
