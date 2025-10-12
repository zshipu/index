#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量优化Markdown文件脚本
功能：
1. 优化文件名：移除品牌/平台名称
2. 转换 tag: 为 tags: 并确保数组格式
3. 清理标题和描述中的品牌/平台名称
"""

import re
import os
from pathlib import Path
from typing import List, Tuple, Optional


class MarkdownOptimizer:
    """Markdown文件优化器"""

    # 需要移除的品牌/平台名称模式
    BRAND_PATTERNS = [
        # 公司/品牌名
        r'Anthropic[、，\s]*',
        r'OpenAI[、，\s]*',
        r'Claude[、，\s]*',
        r'Sora\s*2?\s*',
        r'Apple[、，\s]*',
        r'苹果公司?[、，\s]*',
        r'Google[、，\s]*',
        r'谷歌[、，\s]*',
        r'Microsoft[、，\s]*',
        r'微软[、，\s]*',

        # 平台/来源（重要：人人都是产品经理）
        r'\s*[-–—]?\s*人人都是产品经理\s*',  # 移除"人人都是产品经理"
        r'\s*人人都是产品经理\s*[-–—]?\s*',  # 前后都可能出现
        r'\s*\(\d+\)\s*',  # 移除文件名中的 (1), (2) 等序号
        r'\s*[-–—]\s*CSDN博客',
        r'\s*[-–—]\s*cnBeta\.COM',
        r'\s*[-–—]\s*Dataconomy\s+CN',
        r'\s*[-–—]\s*数位无限INFINITIX',
        r'\s*[-–—]\s*AI-Stack',
        r'\s*[-–—]\s*53AI[-–—]AI知识库.*',
        r'\s*[-–—]\s*美股放大镜',
        r'《环球时报》[：:]\s*',
        r'林民旺[：:]\s*',
        r'财经观察[：:]\s*',
        r'\s*[-–—]\s*知乎',

        # 特殊字符和标点
        r'【.*?】\s*',  # 移除【】包裹的内容
        r'\s*[x×X]\s*教學',  # 移除 x教學
        r'懶人包',
        r'\s*iOSAndroid\s*教學',
        r'\s*邀請碼',
    ]

    def __init__(self, directory: str):
        self.directory = Path(directory)
        self.processed_files = []
        self.renamed_files = []
        self.errors = []

    def clean_text(self, text: str) -> str:
        """清理文本中的品牌/平台名称"""
        cleaned = text

        # 应用所有品牌模式
        for pattern in self.BRAND_PATTERNS:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)

        # 清理多余空格和标点
        cleaned = re.sub(r'\s+', ' ', cleaned)  # 多个空格变单个
        cleaned = re.sub(r'^\s*[：:、，,\-–—]\s*', '', cleaned)  # 开头的标点
        cleaned = re.sub(r'\s*[：:、，,\-–—]\s*$', '', cleaned)  # 结尾的标点
        cleaned = cleaned.strip()

        return cleaned

    def generate_filename(self, title: str) -> str:
        """根据标题生成优化的文件名"""
        # 清理标题
        clean_title = self.clean_text(title)

        # 移除 --知识铺 后缀
        clean_title = re.sub(r'\s*[-–—]+\s*知识铺\s*$', '', clean_title)

        # 截取合适长度（最多50字符）
        if len(clean_title) > 50:
            clean_title = clean_title[:50]

        # 转换为文件名安全字符
        filename = clean_title
        # 移除或替换不安全字符
        unsafe_chars = r'[<>:"/\\|?*\x00-\x1f]'
        filename = re.sub(unsafe_chars, '', filename)

        # 移除多余空格，用连字符替换
        filename = re.sub(r'\s+', '-', filename.strip())

        # 限制连字符
        filename = re.sub(r'-+', '-', filename)
        filename = filename.strip('-')

        return filename + '.md'

    def convert_frontmatter(self, content: str) -> Tuple[str, bool]:
        """转换frontmatter格式"""
        lines = content.split('\n')
        modified = False
        in_frontmatter = False
        new_lines = []

        for i, line in enumerate(lines):
            if line.strip() == '---':
                in_frontmatter = not in_frontmatter
                new_lines.append(line)
                continue

            if in_frontmatter:
                # 处理 tag: 转换为 tags:
                if line.strip().startswith('tag:'):
                    # 获取缩进
                    indent = len(line) - len(line.lstrip())
                    indent_str = ' ' * indent

                    # 提取tag值
                    tag_value = line.split(':', 1)[1].strip()

                    # 如果下一行有内容且是列表项，收集所有tag
                    tags = []
                    if tag_value and tag_value != '-':
                        tags.append(tag_value)

                    # 检查接下来的行是否是列表项
                    j = i + 1
                    while j < len(lines) and lines[j].strip().startswith('-'):
                        tag_item = lines[j].strip()[1:].strip()
                        if tag_item:
                            tags.append(tag_item)
                        j += 1

                    # 生成新的tags格式
                    if tags:
                        # 清理tags，移除空值
                        tags = [t for t in tags if t]
                        if tags:
                            new_lines.append(f'{indent_str}tags: [ {", ".join(tags)} ]')
                        else:
                            # 如果没有有效tag，生成空数组
                            new_lines.append(f'{indent_str}tags: []')
                    else:
                        new_lines.append(f'{indent_str}tags: []')

                    # 跳过已处理的列表项
                    if j > i + 1:
                        # 更新外部循环索引（通过标记）
                        for _ in range(j - i - 1):
                            if len(lines) > i + 1:
                                lines.pop(i + 1)

                    modified = True
                    continue

                # 处理 title 和 description
                elif line.strip().startswith('title:') or line.strip().startswith('description:'):
                    field_name = line.split(':', 1)[0]
                    field_value = line.split(':', 1)[1].strip() if ':' in line else ''

                    # 清理品牌名称
                    cleaned_value = self.clean_text(field_value)

                    # 确保保留 --知识铺 后缀
                    if not cleaned_value.endswith('--知识铺') and not cleaned_value.endswith('-- 知识铺'):
                        cleaned_value = cleaned_value.rstrip() + ' --知识铺'

                    # 获取缩进
                    indent = len(line) - len(line.lstrip())
                    indent_str = ' ' * indent

                    new_line = f'{indent_str}{field_name}: {cleaned_value}'

                    if new_line != line:
                        modified = True

                    new_lines.append(new_line)
                    continue

            new_lines.append(line)

        return '\n'.join(new_lines), modified

    def process_file(self, file_path: Path) -> bool:
        """处理单个文件"""
        try:
            # 读取文件
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # 转换frontmatter
            new_content, modified = self.convert_frontmatter(content)

            # 提取标题用于生成文件名
            title_match = re.search(r'^title:\s*(.+)$', new_content, re.MULTILINE)
            if title_match:
                title = title_match.group(1).strip()
                new_filename = self.generate_filename(title)

                # 检查新文件名是否与旧文件名不同
                if new_filename != file_path.name:
                    new_path = file_path.parent / new_filename

                    # 避免文件名冲突
                    counter = 1
                    while new_path.exists() and new_path != file_path:
                        name_without_ext = new_filename.rsplit('.', 1)[0]
                        new_filename = f"{name_without_ext}-{counter}.md"
                        new_path = file_path.parent / new_filename
                        counter += 1

                    # 写入新内容
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)

                    # 重命名文件
                    if new_path != file_path:
                        file_path.rename(new_path)
                        self.renamed_files.append((file_path.name, new_filename))
                        print(f"[OK] Processed & renamed: {file_path.name} -> {new_filename}")
                    else:
                        print(f"[OK] Processed: {file_path.name}")

                    self.processed_files.append(new_filename)
                    return True
                else:
                    # 文件名未改变，但内容可能改变
                    if modified:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"[OK] Updated content: {file_path.name}")
                        self.processed_files.append(file_path.name)
                        return True
                    else:
                        print(f"[SKIP] No changes needed: {file_path.name}")
                        return False
            else:
                print(f"[WARN] No title found: {file_path.name}")
                return False

        except Exception as e:
            error_msg = f"Failed to process {file_path.name}: {str(e)}"
            print(f"[ERROR] {error_msg}")
            self.errors.append(error_msg)
            return False

    def process_directory(self):
        """处理目录下所有markdown文件"""
        if not self.directory.exists():
            print(f"[ERROR] Directory not found - {self.directory}")
            return

        # 获取所有markdown文件
        md_files = sorted(self.directory.glob('*.md'))
        total_files = len(md_files)

        print(f"\n{'='*70}")
        print(f"[DIR] {self.directory}")
        print(f"[INFO] {total_files} markdown files found")
        print(f"{'='*70}\n")

        # 处理每个文件
        for md_file in md_files:
            self.process_file(md_file)

        # 打印统计信息
        print(f"\n{'='*70}")
        print(f"[DONE] Processing completed")
        print(f"{'='*70}")
        print(f"[OK] Total files: {total_files}")
        print(f"[OK] Processed: {len(self.processed_files)}")
        print(f"[OK] Renamed: {len(self.renamed_files)}")
        print(f"[FAIL] Errors: {len(self.errors)}")

        if self.renamed_files:
            print(f"\n[RENAME] File rename list:")
            for old_name, new_name in self.renamed_files:
                print(f"  - OLD: {old_name}")
                print(f"    NEW: {new_name}")

        if self.errors:
            print(f"\n[ERROR] Error list:")
            for error in self.errors:
                print(f"  - {error}")

        print(f"\n{'='*70}\n")


def main():
    """主函数"""
    # 当前目录
    current_dir = Path(__file__).parent

    print("""
========================================================================
                  Markdown Batch Optimizer v1.0
========================================================================
Features:
1. Optimize filenames - remove brand/platform names
2. Convert tag: to tags: array format
3. Clean brand/platform names from titles and descriptions
========================================================================
""")

    optimizer = MarkdownOptimizer(current_dir)
    optimizer.process_directory()


if __name__ == "__main__":
    main()
