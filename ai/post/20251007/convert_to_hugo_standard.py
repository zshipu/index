import re
import os
from pathlib import Path

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

md_files = [f for f in Path(".").glob("*.md") if f.is_file()]
print(f"Found {len(md_files)} MD files")

converted = 0
errors = []

for md_file in md_files:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            errors.append(f"{md_file}: No frontmatter found")
            continue

        frontmatter, body = match.groups()

        # Extract fields
        title_match = re.search(r'^title:\s*(.+)$', frontmatter, re.MULTILINE)
        date_match = re.search(r'^date:\s*(.+)$', frontmatter, re.MULTILINE)
        tags_match = re.search(r'^tags:\s*(\[.+?\]|\n(?:[\s-]+.+\n)+)', frontmatter, re.MULTILINE | re.DOTALL)

        if not title_match or not date_match:
            errors.append(f"{md_file}: Missing required fields")
            continue

        title = title_match.group(1).strip()
        date = date_match.group(1).strip()

        # Clean title
        title = title.strip('"\'')
        if not title.endswith('知识铺'):
            if '--知识铺' not in title and '-- 知识铺' not in title:
                title = f"{title} -- 知识铺"

        # Process tags
        if tags_match:
            tags_raw = tags_match.group(1).strip()
            if tags_raw.startswith('['):
                # Already array format, clean it
                tags_content = re.findall(r"['\"]?([^'\"]+?)['\"]?(?:,|\])", tags_raw)
                tags_clean = [t.strip() for t in tags_content if t.strip() and t.strip() not in ['[', ']']]
            else:
                # List format, convert
                tags_clean = re.findall(r'-\s*(.+)', tags_raw)
                tags_clean = [t.strip() for t in tags_clean]

            tags_str = ', '.join(tags_clean[:5])  # Max 5 tags
        else:
            tags_str = 'AI技术, AI工具'

        # Build new frontmatter
        new_frontmatter = f"""---
title: {title}
author: 知识铺
date: {date}
tags: [{tags_str}]
---"""

        # Write back
        new_content = f"{new_frontmatter}\n{body}"
        with open(md_file, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)

        converted += 1
        print(f"[OK] {md_file.name}")

    except Exception as e:
        errors.append(f"{md_file}: {str(e)}")

print(f"\nConverted: {converted}")
print(f"Errors: {len(errors)}")
if errors:
    print("\nError details:")
    for err in errors[:10]:
        print(f"  {err}")
