import re
import os
from pathlib import Path

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

md_files = [f for f in Path(".").glob("*.md") if f.is_file()]
print(f"Checking {len(md_files)} MD files for HTML tag issues")

fixed = 0

for md_file in md_files:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        modified = False

        # Fix broken span tags: span style="..." -> <span style="...">
        if re.search(r'(?<!<)span\s+style=', content):
            content = re.sub(r'(?<!<)(span\s+style="[^"]*")', r'<\1>', content)
            content = re.sub(r'/span(?!>)', r'</span>', content)
            modified = True

        # Fix broken div tags: div align="..." -> <div align="...">
        if re.search(r'(?<!<)div\s+align=', content):
            content = re.sub(r'(?<!<)(div\s+align="[^"]*")', r'<\1>', content)
            content = re.sub(r'/div(?!>)', r'</div>', content)
            modified = True

        # Fix broken img tags: img src="..." -> <img src="...">
        if re.search(r'(?<!<)img\s+src=', content):
            content = re.sub(r'(?<!<)(img\s+src="[^"]*"[^>]*)', r'<\1>', content)
            modified = True

        if modified:
            with open(md_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            fixed += 1
            print(f"[Fixed] {md_file.name}")

    except Exception as e:
        print(f"[Error] {md_file.name}: {e}")

print(f"\nFixed: {fixed} files")
