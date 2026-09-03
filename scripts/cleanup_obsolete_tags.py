#!/usr/bin/env python3
"""
清理 JSON 文件中指向废弃标签目录的条目
Remove entries pointing to obsolete /tags/<tag-name>/ directories
"""

import json
import os
from datetime import datetime

# 已删除的废弃标签目录列表
OBSOLETE_TAG_DIRS = [
    "AI浪潮",
    "ChatGPT",
    "OpenAI",
    "Prompt-Engineering",
    "Prompt技巧",
    "Prompt技术",
    "表达能力",
    "大模型协作",
    "技巧框架",
    "人工智能",
    "自然语言处理"
]

def cleanup_site_tags_enhanced(file_path):
    """清理 site-tags-enhanced.json"""
    print(f"\n[*] Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data.get('tags', []))
    print(f"   Original tags: {original_count}")

    # 过滤掉废弃的标签
    cleaned_tags = []
    removed_tags = []

    for tag in data.get('tags', []):
        tag_name = tag.get('name', '')
        tag_url = tag.get('url', '')

        # 检查是否是废弃的标签目录
        is_obsolete = False
        for obsolete_name in OBSOLETE_TAG_DIRS:
            if tag_name == obsolete_name or f"/tags/{obsolete_name}/" in tag_url:
                is_obsolete = True
                removed_tags.append(tag_name)
                break

        if not is_obsolete:
            cleaned_tags.append(tag)

    # 更新数据
    data['tags'] = cleaned_tags
    data['total_tags'] = len(cleaned_tags)
    data['generated_at'] = datetime.now().isoformat()

    # 备份原文件
    backup_path = file_path + '.backup-obsolete-cleanup'
    if not os.path.exists(backup_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"   ✅ Backup created: {backup_path}")

    # 写入清理后的数据
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"   ✅ Cleaned tags: {len(cleaned_tags)}")
    print(f"   ❌ Removed: {len(removed_tags)} tags")
    if removed_tags:
        print(f"   Removed tags: {', '.join(removed_tags)}")

    return len(removed_tags)

def cleanup_site_tags(file_path):
    """清理 site-tags.json"""
    print(f"\n📄 Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data.get('tags', []))
    print(f"   Original tags: {original_count}")

    # 过滤掉废弃的标签
    cleaned_tags = []
    removed_tags = []

    for tag in data.get('tags', []):
        tag_name = tag.get('name', '')

        if tag_name not in OBSOLETE_TAG_DIRS:
            cleaned_tags.append(tag)
        else:
            removed_tags.append(tag_name)

    # 更新数据
    data['tags'] = cleaned_tags

    # 备份
    backup_path = file_path + '.backup-obsolete-cleanup'
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(file_path, backup_path)
        print(f"   ✅ Backup created: {backup_path}")

    # 写入
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"   ✅ Cleaned tags: {len(cleaned_tags)}")
    print(f"   ❌ Removed: {len(removed_tags)} tags")
    if removed_tags:
        print(f"   Removed tags: {', '.join(removed_tags)}")

    return len(removed_tags)

def cleanup_tag_hot(file_path):
    """清理 tag-hot.json"""
    print(f"\n📄 Processing: {file_path}")

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    original_count = len(data.get('tags', []))
    print(f"   Original tags: {original_count}")

    # 过滤
    cleaned_tags = []
    removed_tags = []

    for tag in data.get('tags', []):
        tag_name = tag.get('name', '')
        tag_url = tag.get('url', '')

        is_obsolete = False
        for obsolete_name in OBSOLETE_TAG_DIRS:
            if tag_name == obsolete_name or f"/tags/{obsolete_name}/" in tag_url:
                is_obsolete = True
                removed_tags.append(tag_name)
                break

        if not is_obsolete:
            cleaned_tags.append(tag)

    # 更新
    data['tags'] = cleaned_tags

    # 备份
    backup_path = file_path + '.backup-obsolete-cleanup'
    if not os.path.exists(backup_path):
        import shutil
        shutil.copy2(file_path, backup_path)
        print(f"   ✅ Backup created: {backup_path}")

    # 写入
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"   ✅ Cleaned tags: {len(cleaned_tags)}")
    print(f"   ❌ Removed: {len(removed_tags)} tags")
    if removed_tags:
        print(f"   Removed tags: {', '.join(removed_tags)}")

    return len(removed_tags)

def main():
    """主函数"""
    print("=" * 60)
    print("🧹 Cleaning Obsolete Tag Directory References from JSON Files")
    print("=" * 60)

    print(f"\n🗑️  Obsolete tag directories to remove ({len(OBSOLETE_TAG_DIRS)}):")
    for tag in OBSOLETE_TAG_DIRS:
        print(f"   - {tag}")

    total_removed = 0

    # 清理各个 JSON 文件
    files_to_clean = [
        ('site-tags-enhanced.json', cleanup_site_tags_enhanced),
        ('site-tags.json', cleanup_site_tags),
        ('tag-hot.json', cleanup_tag_hot)
    ]

    for filename, cleanup_func in files_to_clean:
        file_path = filename
        if os.path.exists(file_path):
            try:
                removed = cleanup_func(file_path)
                total_removed += removed
            except Exception as e:
                print(f"   ❌ Error processing {filename}: {e}")
        else:
            print(f"\n📄 {filename} - Not found, skipping")

    print("\n" + "=" * 60)
    print(f"✅ Cleanup Complete!")
    print(f"   Total entries removed: {total_removed}")
    print(f"   Backups created with .backup-obsolete-cleanup extension")
    print("=" * 60)

if __name__ == '__main__':
    main()
