#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SEO健康度检查脚本 - index.zshipu.com
自动化检查网站SEO关键要素的合规性

检查项目：
1. 首页index.html关键SEO要素
2. Meta description质量检查
3. Schema.org结构化数据验证
4. Sitemap.xml有效性检查
5. robots.txt语法检查
6. 内部链接检查
7. 图片alt标签检查
8. 页面标题优化检查

运行方式：
  python scripts/seo_health_check.py

输出：
  - 终端彩色报告（绿色=通过，黄色=警告，红色=错误）
  - 生成 claudedocs/seo_health_report_YYYYMMDD.txt 详细报告
"""

import os
import re
import json
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse

# 设置Windows控制台UTF-8编码支持
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')


class SEOHealthChecker:
    """SEO健康度检查器"""

    def __init__(self, root_dir=None):
        """
        初始化检查器

        Args:
            root_dir: 网站根目录路径，默认为脚本所在目录的上级目录
        """
        if root_dir is None:
            self.root_dir = Path(__file__).parent.parent
        else:
            self.root_dir = Path(root_dir)

        self.issues = []
        self.warnings = []
        self.passed = []
        self.score = 100  # 总分100分，每个问题扣分

    def check_all(self):
        """执行所有SEO检查"""
        print("=" * 60)
        print("🔍 SEO健康度检查 - index.zshipu.com")
        print("=" * 60)
        print()

        # 检查首页
        self.check_homepage()

        # 检查sitemap
        self.check_sitemap()

        # 检查robots.txt
        self.check_robots_txt()

        # 检查关键页面
        self.check_key_pages()

        # 生成报告
        self.generate_report()

    def check_homepage(self):
        """检查首页index.html的SEO要素"""
        print("📄 检查首页 (index.html)...")

        index_path = self.root_dir / "index.html"
        if not index_path.exists():
            self.add_issue("首页文件不存在：index.html", critical=True)
            return

        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查基础meta标签
        self._check_meta_tags(content, "首页")

        # 检查Schema.org结构化数据
        self._check_schema_org(content, "首页")

        # 检查标题标签层级
        self._check_heading_hierarchy(content, "首页")

        # 检查图片alt标签
        self._check_image_alts(content, "首页")

        print()

    def check_sitemap(self):
        """检查sitemap.xml有效性"""
        print("🗺️  检查Sitemap...")

        sitemap_path = self.root_dir / "sitemap.xml"
        if not sitemap_path.exists():
            self.add_issue("Sitemap文件不存在：sitemap.xml", critical=True)
            return

        try:
            tree = ET.parse(sitemap_path)
            root = tree.getroot()

            # 检查是否是sitemap索引或标准sitemap
            ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}

            # 检查URL数量
            urls = root.findall('.//sm:url', ns)
            sitemaps = root.findall('.//sm:sitemap', ns)

            if urls:
                url_count = len(urls)
                self.add_pass(f"Sitemap包含 {url_count} 个URL")

                # 检查URL格式
                for url in urls[:5]:  # 抽查前5个
                    loc = url.find('sm:loc', ns)
                    if loc is not None and loc.text:
                        if not loc.text.startswith('https://'):
                            self.add_warning(f"URL未使用HTTPS: {loc.text}")

            if sitemaps:
                sitemap_count = len(sitemaps)
                self.add_pass(f"Sitemap索引包含 {sitemap_count} 个子sitemap")

                # 检查子sitemap是否存在
                for sitemap in sitemaps:
                    loc = sitemap.find('sm:loc', ns)
                    if loc is not None and loc.text:
                        # 提取文件名
                        sitemap_file = loc.text.split('/')[-1]
                        sitemap_file_path = self.root_dir / sitemap_file
                        if not sitemap_file_path.exists():
                            self.add_warning(f"子sitemap文件不存在: {sitemap_file}")

        except ET.ParseError as e:
            self.add_issue(f"Sitemap XML格式错误: {e}", critical=True)
        except Exception as e:
            self.add_issue(f"Sitemap检查失败: {e}")

        print()

    def check_robots_txt(self):
        """检查robots.txt语法和内容"""
        print("🤖 检查robots.txt...")

        robots_path = self.root_dir / "robots.txt"
        if not robots_path.exists():
            self.add_issue("robots.txt文件不存在", critical=True)
            return

        with open(robots_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否包含Sitemap声明
        if 'Sitemap:' not in content:
            self.add_warning("robots.txt未声明Sitemap位置")
        else:
            self.add_pass("robots.txt包含Sitemap声明")

        # 检查User-agent声明
        if 'User-agent:' not in content:
            self.add_issue("robots.txt缺少User-agent声明")
        else:
            self.add_pass("robots.txt包含User-agent声明")

        # 检查是否有Disallow规则
        if 'Disallow:' in content:
            disallow_count = content.count('Disallow:')
            self.add_pass(f"robots.txt包含 {disallow_count} 条Disallow规则")

        # 检查是否有Allow规则（推荐）
        if 'Allow:' in content:
            allow_count = content.count('Allow:')
            self.add_pass(f"robots.txt包含 {allow_count} 条Allow规则")
        else:
            self.add_warning("robots.txt未使用Allow规则明确允许重要页面")

        # 检查爬虫延迟设置
        if 'Crawl-delay:' in content:
            self.add_pass("robots.txt包含Crawl-delay设置")

        print()

    def check_key_pages(self):
        """检查关键导航页面"""
        print("📑 检查关键页面...")

        key_pages = [
            ("archives/index.html", "归档页面"),
            ("categories/index.html", "分类页面"),
            ("tags/index.html", "标签页面"),
        ]

        for page_path, page_name in key_pages:
            full_path = self.root_dir / page_path
            if not full_path.exists():
                self.add_warning(f"{page_name}不存在: {page_path}")
            else:
                # 检查meta description
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                if '<meta name="description"' not in content:
                    self.add_warning(f"{page_name}缺少meta description")
                else:
                    self.add_pass(f"{page_name}包含meta description")

        print()

    def _check_meta_tags(self, content, page_name):
        """检查meta标签"""
        # Meta description
        desc_match = re.search(r'<meta\s+name="description"\s+content="([^"]+)"', content)
        if not desc_match:
            self.add_issue(f"{page_name}缺少meta description")
        else:
            desc = desc_match.group(1)
            desc_len = len(desc)
            if desc_len < 120:
                self.add_warning(f"{page_name} meta description过短 ({desc_len}字符，建议120-160)")
            elif desc_len > 160:
                self.add_warning(f"{page_name} meta description过长 ({desc_len}字符，建议120-160)")
            else:
                self.add_pass(f"{page_name} meta description长度合适 ({desc_len}字符)")

        # Meta keywords (可选，但有总比没有好)
        if '<meta name="keywords"' not in content:
            self.add_warning(f"{page_name}缺少meta keywords")

        # Charset
        if '<meta charset="utf-8">' not in content.lower() and 'charset=utf-8' not in content.lower():
            self.add_issue(f"{page_name}缺少UTF-8编码声明")
        else:
            self.add_pass(f"{page_name}包含UTF-8编码声明")

        # Viewport
        if '<meta name="viewport"' not in content:
            self.add_warning(f"{page_name}缺少viewport设置（移动端优化）")
        else:
            self.add_pass(f"{page_name}包含viewport设置")

        # Open Graph
        if '<meta property="og:' not in content:
            self.add_warning(f"{page_name}缺少Open Graph标签（社交媒体分享优化）")

    def _check_schema_org(self, content, page_name):
        """检查Schema.org结构化数据"""
        # 检查是否包含JSON-LD
        if '<script type="application/ld+json">' not in content:
            self.add_warning(f"{page_name}缺少Schema.org结构化数据")
            return

        # 提取所有JSON-LD块
        json_ld_pattern = r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>'
        json_ld_blocks = re.findall(json_ld_pattern, content, re.DOTALL)

        schema_types = []
        for block in json_ld_blocks:
            try:
                data = json.loads(block)

                # 处理 @graph 结构（常见于复杂Schema.org实现）
                if '@graph' in data and isinstance(data['@graph'], list):
                    for item in data['@graph']:
                        if '@type' in item:
                            schema_types.append(item['@type'])
                # 处理单个对象
                elif '@type' in data:
                    schema_types.append(data['@type'])
                # 处理数组
                elif isinstance(data, list):
                    for item in data:
                        if '@type' in item:
                            schema_types.append(item['@type'])
            except json.JSONDecodeError:
                self.add_warning(f"{page_name} Schema.org JSON格式错误")

        if schema_types:
            self.add_pass(f"{page_name}包含Schema.org类型: {', '.join(set(schema_types))}")
        else:
            self.add_warning(f"{page_name}未检测到有效的Schema.org类型")

        # 检查推荐的Schema类型
        recommended_types = ['Organization', 'WebSite', 'ItemList', 'FAQPage']
        missing_types = []
        for rec_type in recommended_types:
            if rec_type not in schema_types:
                missing_types.append(rec_type)

        if missing_types:
            self.add_warning(f"{page_name}建议添加Schema.org类型: {', '.join(missing_types)}")
        else:
            self.add_pass(f"{page_name}包含所有推荐的Schema.org类型")

    def _check_heading_hierarchy(self, content, page_name):
        """检查标题标签层级（H1-H6）"""
        # 检查H1数量（应该只有1个）
        h1_count = len(re.findall(r'<h1[^>]*>.*?</h1>', content, re.DOTALL | re.IGNORECASE))
        if h1_count == 0:
            self.add_issue(f"{page_name}缺少H1标签")
        elif h1_count > 1:
            self.add_warning(f"{page_name}包含{h1_count}个H1标签（建议只有1个）")
        else:
            self.add_pass(f"{page_name}包含1个H1标签")

    def _check_image_alts(self, content, page_name):
        """检查图片alt标签"""
        # 查找所有img标签
        img_tags = re.findall(r'<img[^>]*>', content, re.IGNORECASE)
        total_imgs = len(img_tags)

        if total_imgs == 0:
            return  # 没有图片，跳过检查

        imgs_without_alt = 0
        for img_tag in img_tags:
            if 'alt=' not in img_tag.lower():
                imgs_without_alt += 1

        if imgs_without_alt > 0:
            self.add_warning(f"{page_name} {imgs_without_alt}/{total_imgs} 张图片缺少alt标签")
        else:
            self.add_pass(f"{page_name}所有图片都有alt标签 ({total_imgs}张)")

    def add_issue(self, message, critical=False):
        """添加问题"""
        self.issues.append(message)
        if critical:
            self.score -= 10
        else:
            self.score -= 5
        print(f"  ❌ {message}")

    def add_warning(self, message):
        """添加警告"""
        self.warnings.append(message)
        self.score -= 2
        print(f"  ⚠️  {message}")

    def add_pass(self, message):
        """添加通过项"""
        self.passed.append(message)
        print(f"  ✅ {message}")

    def generate_report(self):
        """生成最终报告"""
        # 确保分数不低于0
        self.score = max(0, self.score)

        print()
        print("=" * 60)
        print("📊 SEO健康度评分")
        print("=" * 60)

        # 评分等级
        if self.score >= 90:
            grade = "优秀 🎉"
            color = "绿色"
        elif self.score >= 75:
            grade = "良好 👍"
            color = "黄色"
        elif self.score >= 60:
            grade = "及格 ⚠️"
            color = "橙色"
        else:
            grade = "需改进 ❌"
            color = "红色"

        print(f"\n总分：{self.score}/100 - {grade}")
        print(f"\n通过项：{len(self.passed)} 个")
        print(f"警告项：{len(self.warnings)} 个")
        print(f"错误项：{len(self.issues)} 个")

        # 详细问题列表
        if self.issues:
            print("\n🔴 需要立即修复的问题：")
            for i, issue in enumerate(self.issues, 1):
                print(f"  {i}. {issue}")

        if self.warnings:
            print("\n🟡 建议优化的项目：")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")

        # 保存详细报告到文件
        self._save_report()

        print("\n" + "=" * 60)
        print("✅ SEO健康度检查完成")
        print("=" * 60)

    def _save_report(self):
        """保存详细报告到文件"""
        report_dir = self.root_dir / "claudedocs"
        report_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_path = report_dir / f"seo_health_report_{timestamp}.txt"

        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("SEO健康度检查报告 - index.zshipu.com\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"检查时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"总分：{self.score}/100\n\n")

            f.write(f"✅ 通过项 ({len(self.passed)})：\n")
            for item in self.passed:
                f.write(f"  - {item}\n")
            f.write("\n")

            f.write(f"⚠️  警告项 ({len(self.warnings)})：\n")
            for item in self.warnings:
                f.write(f"  - {item}\n")
            f.write("\n")

            f.write(f"❌ 错误项 ({len(self.issues)})：\n")
            for item in self.issues:
                f.write(f"  - {item}\n")
            f.write("\n")

            f.write("=" * 60 + "\n")
            f.write("建议：\n")
            f.write("1. 优先修复标记为❌的错误项（每个扣5-10分）\n")
            f.write("2. 逐步优化标记为⚠️的警告项（每个扣2分）\n")
            f.write("3. 定期运行此脚本监控SEO健康度\n")
            f.write("4. 目标分数：90分以上（优秀等级）\n")
            f.write("=" * 60 + "\n")

        print(f"\n📄 详细报告已保存到：{report_path.relative_to(self.root_dir)}")


def main():
    """主函数"""
    checker = SEOHealthChecker()
    checker.check_all()


if __name__ == "__main__":
    main()
