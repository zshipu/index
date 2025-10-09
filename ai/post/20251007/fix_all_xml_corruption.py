import re
import os
from pathlib import Path

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

def clean_xml_tags(text):
    """Remove all XML-style corruption: <text> becomes text"""
    # Remove <> tags completely
    text = re.sub(r'<([^>]+?)>', r'\1', text)
    return text

def has_xml_corruption(content):
    """Check if content has XML-style corruption"""
    # Look for patterns like <中文文本> or <https>://
    return bool(re.search(r'<[^>]{2,}>', content))

def extract_title_from_body(body):
    """Extract title from first heading in body"""
    match = re.search(r'^#\s*(.+?)$', body, re.MULTILINE)
    if match:
        title = match.group(1).strip()
        title = clean_xml_tags(title)
        title = re.sub(r'[。、，]$', '', title)
        if not title.endswith('知识铺'):
            if '--知识铺' not in title and '-- 知识铺' not in title:
                title = f"{title} -- 知识铺"
        return title
    return None

def extract_date_from_corrupted(frontmatter):
    """Extract date from corrupted frontmatter"""
    # Try pattern: <date>: <2025>-<10>-<07> <11>:<28>:<13>
    match = re.search(r'<date>:\s*<(\d{4})>-<(\d{2})>-<(\d{2})>\s*<(\d{2})>:<(\d{2})>:<(\d{2})>', frontmatter)
    if match:
        y, m, d, h, mi, s = match.groups()
        return f"{y}-{m}-{d} {h}:{mi}:{s}"

    # Try pattern: date: 2025-10-07 11:28:13
    match = re.search(r'date:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})', frontmatter)
    if match:
        return match.group(1)

    return "2025-10-07 10:00:00"

def extract_tags_from_corrupted(frontmatter):
    """Extract tags from corrupted frontmatter or use defaults"""
    # Try to find tag or tags field
    tags_match = re.search(r'<tags?>:\s*(.+?)(?:\n---|\n<\w+>:|\Z)', frontmatter, re.DOTALL)
    if tags_match:
        tags_raw = tags_match.group(1)
        # Clean XML tags
        tags_clean = re.findall(r"['\"]?<([^>]+?)>['\"]?", tags_raw)
        if tags_clean:
            return ', '.join(tags_clean[:5])

    return 'AI工具, AI技术, AI副业'

md_files = [f for f in Path(".").glob("*.md") if f.is_file()]
print(f"Checking {len(md_files)} MD files for XML corruption")

fixed = 0
skipped = 0

for md_file in md_files:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if file has XML corruption
        if not has_xml_corruption(content):
            continue

        # Extract frontmatter and body
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            skipped += 1
            print(f"[Skip] {md_file.name}: No frontmatter")
            continue

        frontmatter, body = match.groups()

        # Extract or generate metadata
        title = extract_title_from_body(body)
        if not title:
            # Try from corrupted frontmatter
            title_match = re.search(r'<title>:\s*(.+?)(?:\n|$)', frontmatter)
            if title_match:
                title = clean_xml_tags(title_match.group(1))
                if not title.endswith('知识铺'):
                    title = f"{title} -- 知识铺"
            else:
                skipped += 1
                print(f"[Skip] {md_file.name}: Could not extract title")
                continue

        date = extract_date_from_corrupted(frontmatter)
        tags = extract_tags_from_corrupted(frontmatter)

        # Clean the body content
        clean_body = clean_xml_tags(body)

        # Build new content
        new_content = f"""---
title: {title}
author: 知识铺
date: {date}
tags: [{tags}]
---
{clean_body}"""

        # Write back
        with open(md_file, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)

        fixed += 1
        print(f"[Fixed] {md_file.name}")

    except Exception as e:
        skipped += 1
        print(f"[Error] {md_file.name}: {str(e)}")

print(f"\nFixed: {fixed}")
print(f"Skipped: {skipped}")
print(f"Total checked: {len(md_files)}")
