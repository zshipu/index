import re
import os
from pathlib import Path

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

def clean_xml_corruption(text):
    """Remove XML-style corruption from text"""
    # Remove XML-style tags: <text> becomes text
    text = re.sub(r'<([^>]+?)>', r'\1', text)
    return text

def extract_clean_title(corrupted_frontmatter, body):
    """Extract title from corrupted frontmatter or body"""
    # Try to find title in frontmatter
    title_match = re.search(r'<title>:\s*(.+?)(?:\s*--<知识铺>)?', corrupted_frontmatter)
    if title_match:
        title = clean_xml_corruption(title_match.group(1))
        return f"{title} -- 知识铺"

    # Try to find from first heading in body
    heading_match = re.search(r'^#\s*(.+?)$', body, re.MULTILINE)
    if heading_match:
        title = clean_xml_corruption(heading_match.group(1))
        return f"{title} -- 知识铺"

    return None

def extract_date(corrupted_frontmatter):
    """Extract date from corrupted frontmatter"""
    date_match = re.search(r'<date>:\s*<(\d{4})>-<(\d{2})>-<(\d{2})>\s*<(\d{2})>:<(\d{2})>:<(\d{2})>', corrupted_frontmatter)
    if date_match:
        y, m, d, h, mi, s = date_match.groups()
        return f"{y}-{m}-{d} {h}:{mi}:{s}"
    return "2025-10-07 10:00:00"

def extract_tags(corrupted_frontmatter):
    """Extract tags from corrupted frontmatter"""
    tags_match = re.search(r'<tags>:\s*\[(.+?)\]', corrupted_frontmatter)
    if tags_match:
        tags_raw = tags_match.group(1)
        # Remove corruption
        tags_clean = re.findall(r"['\"]?<([^>]+?)>['\"]?", tags_raw)
        if not tags_clean:
            tags_clean = ['AI工具', 'AI技术']
        return ', '.join(tags_clean[:5])
    return 'AI工具, AI技术'

skip_files = list(Path(".").glob("*.skip"))
print(f"Found {len(skip_files)} .skip files")

recovered = 0
failed = []

for skip_file in skip_files:
    try:
        with open(skip_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if it's XML-corrupted
        if '<category>:' not in content and '<date>:' not in content:
            failed.append(f"{skip_file.name}: Not XML-corrupted, different issue")
            continue

        # Extract corrupted frontmatter and body
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            failed.append(f"{skip_file.name}: No frontmatter found")
            continue

        corrupted_frontmatter, corrupted_body = match.groups()

        # Extract metadata
        title = extract_clean_title(corrupted_frontmatter, corrupted_body)
        if not title:
            failed.append(f"{skip_file.name}: Could not extract title")
            continue

        date = extract_date(corrupted_frontmatter)
        tags = extract_tags(corrupted_frontmatter)

        # Clean the body
        clean_body = clean_xml_corruption(corrupted_body)

        # Build new content
        new_content = f"""---
title: {title}
author: 知识铺
date: {date}
tags: [{tags}]
---
{clean_body}"""

        # Save to new .md file (remove .skip extension)
        new_filename = skip_file.stem  # This removes .skip
        new_filepath = Path(new_filename)

        with open(new_filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)

        recovered += 1
        print(f"[OK] {skip_file.name} -> {new_filename}")

    except Exception as e:
        failed.append(f"{skip_file.name}: {str(e)}")

print(f"\nRecovered: {recovered}")
print(f"Failed: {len(failed)}")
if failed:
    print("\nFailed files:")
    for f in failed[:10]:
        print(f"  {f}")
