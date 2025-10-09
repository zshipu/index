import re
import os
from pathlib import Path

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

# Brand names to remove (common Chinese platforms and brands)
BRAND_NAMES = [
    '知乎', '今日头条', 'CSDN', '掘金', '简书', '博客园', 'InfoQ',
    'SegmentFault', 'V2EX', '开源中国', 'OSChina', 'Hacker News',
    '36氪', '虎嗅', '钛媒体', 'PingWest', '雷锋网', 'AI科技大本营',
    '机器之心', '新智元', 'HackerRank', 'LeetCode'
]

def remove_brands_from_text(text):
    """Remove brand names from text"""
    for brand in BRAND_NAMES:
        # Remove brand with surrounding punctuation
        text = re.sub(rf'\s*[-–—|]\s*{re.escape(brand)}\s*$', '', text)
        text = re.sub(rf'\s*[-–—|]\s*{re.escape(brand)}\s*[-–—|]\s*', ' - ', text)
        text = re.sub(rf'^{re.escape(brand)}\s*[-–—|]\s*', '', text)
        text = re.sub(rf'\s+{re.escape(brand)}\s+', ' ', text)
        text = re.sub(rf'\({re.escape(brand)}\)', '', text)
        text = re.sub(rf'（{re.escape(brand)}）', '', text)
    return text.strip()

def remove_brands_from_filename(filename):
    """Remove brand names from filename"""
    name = filename.stem
    for brand in BRAND_NAMES:
        # Remove brand with surrounding punctuation
        name = re.sub(rf'\s*[-–—|]\s*{re.escape(brand)}\s*$', '', name)
        name = re.sub(rf'\s*[-–—|]\s*{re.escape(brand)}\s*[-–—|]\s*', ' - ', name)
        name = re.sub(rf'^{re.escape(brand)}\s*[-–—|]\s*', '', name)
        name = re.sub(rf'\s+{re.escape(brand)}\s+', ' ', name)
        name = re.sub(rf'\({re.escape(brand)}\)', '', name)
        name = re.sub(rf'（{re.escape(brand)}）', '', name)
    return name.strip()

md_files = [f for f in Path(".").glob("*.md") if f.is_file()]
print(f"Found {len(md_files)} MD files")

renamed = 0
modified = 0
errors = []

for md_file in md_files:
    try:
        # Check if filename contains brand names
        new_filename_stem = remove_brands_from_filename(md_file)
        needs_rename = new_filename_stem != md_file.stem

        # Read file content
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract frontmatter
        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            errors.append(f"{md_file}: No frontmatter")
            continue

        frontmatter, body = match.groups()

        # Extract title
        title_match = re.search(r'^title:\s*(.+)$', frontmatter, re.MULTILINE)
        if not title_match:
            errors.append(f"{md_file}: No title found")
            continue

        title = title_match.group(1).strip()

        # Remove brands from title
        new_title = remove_brands_from_text(title)

        # Update content if title changed
        content_modified = False
        if new_title != title:
            frontmatter = frontmatter.replace(f'title: {title}', f'title: {new_title}')
            content_modified = True

        # Write back if modified
        if content_modified:
            new_content = f"---\n{frontmatter}\n---\n{body}"
            with open(md_file, 'w', encoding='utf-8', newline='\n') as f:
                f.write(new_content)
            modified += 1
            print(f"[Modified] {md_file.name}")

        # Rename file if needed
        if needs_rename and new_filename_stem:
            new_filename = f"{new_filename_stem}.md"
            if not Path(new_filename).exists():
                os.rename(md_file, new_filename)
                renamed += 1
                print(f"[Renamed] {md_file.name} -> {new_filename}")
            else:
                errors.append(f"{md_file}: New filename already exists: {new_filename}")

    except Exception as e:
        errors.append(f"{md_file}: {str(e)}")

print(f"\nModified: {modified}")
print(f"Renamed: {renamed}")
print(f"Errors: {len(errors)}")
if errors:
    print("\nError details:")
    for err in errors[:10]:
        print(f"  {err}")
