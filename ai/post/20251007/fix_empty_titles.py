import re
import os
from pathlib import Path

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

md_files = [f for f in Path(".").glob("*.md") if f.is_file()]
print(f"Checking {len(md_files)} MD files")

fixed = 0

for md_file in md_files:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check for empty title
        if re.search(r'^title: <\s*--', content, re.MULTILINE):
            # Extract first heading from body
            match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
            if not match:
                continue

            frontmatter, body = match.groups()

            # Find first heading
            heading_match = re.search(r'^#\s*(.+?)$', body, re.MULTILINE)
            if heading_match:
                title = heading_match.group(1).strip()

                # Remove trailing punctuation
                title = re.sub(r'[。、，]$', '', title)

                # Ensure ends with -- 知识铺
                if not title.endswith('知识铺'):
                    if '--知识铺' not in title and '-- 知识铺' not in title:
                        title = f"{title} -- 知识铺"

                # Update frontmatter
                new_frontmatter = re.sub(
                    r'^title: <\s*-- 知识铺$',
                    f'title: {title}',
                    frontmatter,
                    flags=re.MULTILINE
                )

                # Write back
                new_content = f"---\n{new_frontmatter}\n---\n{body}"
                with open(md_file, 'w', encoding='utf-8', newline='\n') as f:
                    f.write(new_content)

                fixed += 1
                print(f"[Fixed] {md_file.name}")

    except Exception as e:
        print(f"[Error] {md_file.name}: {e}")

print(f"\nFixed: {fixed} files")
