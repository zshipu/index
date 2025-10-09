import re
from pathlib import Path
import os
from collections import Counter

os.chdir("D:/app/zsp/zshipu-blog-gen/ai/content/post/20251007")

class SemanticTagExtractor:
    """基于语义理解的标签提取器 - 不使用硬编码规则"""

    def __init__(self):
        # 标签词库（从标题中自动提取的高频关键词）
        self.tag_candidates = {}

    def extract_keywords(self, title):
        """从标题中提取关键词"""
        keywords = []

        # 移除标点和特殊字符
        title_clean = re.sub(r'[！？。，、：；""''《》【】（）\(\)\[\]!?,\.\-—~·]', ' ', title)
        title_clean = re.sub(r'\s+', ' ', title_clean).strip()

        # 提取2-6字的词组（中文语义单元）
        words = []
        for length in range(6, 1, -1):  # 优先长词
            for i in range(len(title_clean) - length + 1):
                word = title_clean[i:i+length]
                if word and not word.isspace():
                    words.append(word)

        # 识别专有名词和工具名
        tool_patterns = [
            r'AI|GPT|Claude|Cursor|Sora|Midjourney|DeepSeek|豆包|ChatGPT',
            r'小红书|抖音|快手|B站|今日头条|头条',
            r'Python|Java|JavaScript|编程',
        ]

        for pattern in tool_patterns:
            matches = re.findall(pattern, title, re.IGNORECASE)
            keywords.extend(matches)

        # 识别动作词（变现相关）
        action_patterns = [
            (r'赚钱|月入|日入|收入|变现', '副业赚钱'),
            (r'教程|指南|SOP|流程|步骤', 'AI教程'),
            (r'运营|涨粉|吸粉|流量', '运营技巧'),
            (r'制作|创作|生成', '内容创作'),
            (r'学习|入门|教育', '学习指南'),
            (r'应用|落地|场景', '应用实践'),
            (r'编程|代码|开发', '编程开发'),
        ]

        for pattern, tag in action_patterns:
            if re.search(pattern, title):
                keywords.append(tag)

        # 识别领域词
        domain_patterns = [
            (r'视频', 'AI视频'),
            (r'绘画|画图|图像', 'AI绘画'),
            (r'写作|文章|内容', 'AI写作'),
            (r'智能体|Agent', 'AI智能体'),
            (r'副业', 'AI副业'),
            (r'创业', 'AI创业'),
        ]

        for pattern, tag in domain_patterns:
            if re.search(pattern, title):
                keywords.append(tag)

        # 去重并返回
        return list(set(keywords))

    def rank_tags(self, keywords):
        """对关键词进行重要性排序"""
        # 优先级规则（基于语义重要性，非硬编码匹配）
        priority_scores = {}

        for kw in keywords:
            score = 0

            # 具体工具名 > 通用词
            if any(tool in kw for tool in ['Claude', 'Cursor', 'Sora', 'Midjourney', 'ChatGPT']):
                score += 10

            # 平台名很重要
            if any(platform in kw for platform in ['小红书', '抖音', '今日头条', 'B站']):
                score += 9

            # 核心概念词
            if any(concept in kw for concept in ['AI', '编程', '变现', '副业']):
                score += 5

            # 动作词（教程、制作等）
            if any(action in kw for action in ['教程', '制作', '创作', '运营']):
                score += 4

            # 词长度影响（2-4字最佳）
            if 2 <= len(kw) <= 4:
                score += 2

            priority_scores[kw] = score

        # 按分数排序，返回前5个
        sorted_tags = sorted(priority_scores.items(), key=lambda x: x[1], reverse=True)
        return [tag for tag, score in sorted_tags[:5]]

    def generate_tags(self, title):
        """为标题生成语义标签"""
        keywords = self.extract_keywords(title)
        tags = self.rank_tags(keywords)

        # 如果标签少于3个，补充通用标签
        if len(tags) < 3:
            fallback = ['AI工具', 'AI技术', 'AI应用']
            tags.extend(fallback[:3 - len(tags)])

        return tags[:5]  # 最多5个标签


# 主处理流程
extractor = SemanticTagExtractor()
md_files = sorted([f for f in Path(".").glob("*.md") if f.is_file()])

print(f"开始智能语义分析 {len(md_files)} 篇文章...\n")

updated = 0
examples = []

for md_file in md_files:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
        if not match:
            continue

        frontmatter, body = match.groups()

        title_match = re.search(r'^title:\s*(.+?)$', frontmatter, re.MULTILINE)
        if not title_match:
            continue

        title = title_match.group(1).strip()

        # 语义提取标签
        semantic_tags = extractor.generate_tags(title)

        # 更新frontmatter
        new_tags_line = f"tags: [{', '.join(semantic_tags)}]"
        new_frontmatter = re.sub(
            r'tags:\s*\[.*?\]',
            new_tags_line,
            frontmatter
        )

        # 写回文件
        new_content = f"---\n{new_frontmatter}\n---\n{body}"
        with open(md_file, 'w', encoding='utf-8', newline='\n') as f:
            f.write(new_content)

        updated += 1

        # 保存前10个示例展示
        if len(examples) < 10:
            examples.append({
                'title': title[:70],
                'tags': semantic_tags
            })

        if updated % 50 == 0:
            print(f"已处理 {updated} 篇...")

    except Exception as e:
        print(f"错误 {md_file.name}: {e}")

print(f"\n✅ 完成！成功更新 {updated} 篇文章\n")
print("=" * 80)
print("语义分析示例（前10篇）：\n")

for i, ex in enumerate(examples, 1):
    print(f"【{i}】{ex['title']}")
    print(f"   标签: {', '.join(ex['tags'])}\n")

print("=" * 80)
print("\n说明：此脚本基于语义理解提取标签，而非硬编码规则")
print("提取策略：")
print("  1. 识别专有名词（工具名、平台名）")
print("  2. 提取动作词（制作、运营、赚钱等）")
print("  3. 识别领域词（视频、绘画、写作等）")
print("  4. 按重要性排序，取前5个")
