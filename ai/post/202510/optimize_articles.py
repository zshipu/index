#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文章优化脚本
优化功能：
1. 去除文件名和标题中的 " --知识铺" 冗余后缀
2. 标准化 frontmatter 格式
3. 添加合适的标签
4. 优化文章可读性
"""

import os
import re
from datetime import datetime
from pathlib import Path

def clean_title(title):
    """清理标题，去除冗余后缀"""
    # 去除 " --知识铺" 和重复的 "-- 知识铺"
    title = re.sub(r'\s*--+\s*知识铺\s*', '', title)
    # 去除多余的 "--- " 前缀
    title = re.sub(r'^---+\s+', '', title)
    # 去除末尾空格
    title = title.strip()
    return title

def extract_tags_from_title(title):
    """从标题中提取相关标签"""
    tags = []

    # AI相关
    if any(keyword in title for keyword in ['AI', '人工智能', '智能', 'GPT', 'LLM']):
        tags.append('AI技术')

    # 编程相关
    if any(keyword in title for keyword in ['编程', 'Code', 'coding', '开发', '代码', '程序']):
        tags.append('编程开发')

    # Claude相关
    if 'Claude' in title or 'Anthropic' in title:
        tags.append('Claude')

    # GLM相关
    if 'GLM' in title or '智谱' in title:
        tags.append('GLM')

    # 工具相关
    if any(keyword in title for keyword in ['工具', '应用', 'MCP', 'Agent', '助手']):
        tags.append('AI工具')

    # 教育相关
    if any(keyword in title for keyword in ['教师', '教学', '教育', '备课', '课件']):
        tags.append('教育应用')

    # 即梦相关
    if '即梦' in title:
        tags.append('即梦AI')

    # 豆包相关
    if '豆包' in title:
        tags.append('豆包')

    # 商业相关
    if any(keyword in title for keyword in ['商业', '产品', '市场', '增长', '变现']):
        tags.append('商业分析')

    # 技术解析
    if any(keyword in title for keyword in ['解析', '测试', '评测', '对比', '实测']):
        tags.append('技术评测')

    return tags if tags else ['技术资讯']

def optimize_frontmatter(content, filename):
    """优化frontmatter"""
    # 提取现有frontmatter
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)

    if not match:
        # 如果没有frontmatter，创建一个
        title = clean_title(filename.replace('.md', ''))
        tags = extract_tags_from_title(title)

        frontmatter = f"""---
title: {title}
author: 知识铺
date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
tags: {tags}
---

"""
        return frontmatter + content

    # 解析现有frontmatter
    fm_content = match.group(1)
    body = content[match.end():]

    # 提取标题
    title_match = re.search(r'^title:\s*(.+)$', fm_content, re.MULTILINE)
    if title_match:
        title = clean_title(title_match.group(1))
    else:
        title = clean_title(filename.replace('.md', ''))

    # 提取日期
    date_match = re.search(r'^date:\s*(.+)$', fm_content, re.MULTILINE)
    if date_match:
        date = date_match.group(1).strip()
    else:
        date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # 提取作者
    author_match = re.search(r'^author:\s*(.+)$', fm_content, re.MULTILINE)
    if author_match:
        author = author_match.group(1).strip()
    else:
        author = "知识铺"

    # 生成标签
    tags = extract_tags_from_title(title)

    # 构建新的frontmatter
    new_frontmatter = f"""---
title: {title}
author: {author}
date: {date}
tags: {tags}
---

"""

    return new_frontmatter + body

def optimize_article(filepath):
    """优化单篇文章"""
    try:
        # 读取文件
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 优化内容
        filename = os.path.basename(filepath)
        optimized_content = optimize_frontmatter(content, filename)

        # 生成新文件名
        new_filename = clean_title(filename)
        if new_filename != filename:
            new_filepath = os.path.join(os.path.dirname(filepath), new_filename)

            # 如果新文件名已存在，跳过
            if os.path.exists(new_filepath) and new_filepath != filepath:
                print(f"[SKIP] 跳过 (目标文件已存在): {filename}")
                return False

            # 写入优化后的内容到新文件
            with open(new_filepath, 'w', encoding='utf-8') as f:
                f.write(optimized_content)

            # 删除旧文件（如果文件名不同）
            if new_filepath != filepath:
                os.remove(filepath)
                print(f"[OK] 优化并重命名: {filename} -> {new_filename}")
            else:
                print(f"[OK] 优化内容: {filename}")

            return True
        else:
            # 文件名不需要改变，只优化内容
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(optimized_content)
            print(f"[OK] 优化内容: {filename}")
            return True

    except Exception as e:
        print(f"[ERROR] 错误处理 {filepath}: {str(e)}")
        return False

def main():
    """主函数"""
    current_dir = Path(__file__).parent

    # 获取所有markdown文件
    md_files = list(current_dir.glob('*.md'))

    print(f"[INFO] 找到 {len(md_files)} 个markdown文件\n")

    success_count = 0
    skip_count = 0
    error_count = 0

    for filepath in md_files:
        result = optimize_article(filepath)
        if result is True:
            success_count += 1
        elif result is False:
            skip_count += 1
        else:
            error_count += 1

    print(f"\n" + "="*50)
    print(f"[STATS] 优化完成统计:")
    print(f"   [OK] 成功: {success_count}")
    print(f"   [SKIP] 跳过: {skip_count}")
    print(f"   [ERROR] 错误: {error_count}")
    print(f"   [TOTAL] 总计: {len(md_files)}")
    print("="*50)

if __name__ == '__main__':
    main()
