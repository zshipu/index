#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
专业SEO爬虫和诊断工具
Website: https://github.com/seo-tools/python-seo-auditor
"""

import requests
import time
import logging
import re
import json
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from collections import defaultdict
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import warnings
warnings.filterwarnings('ignore')

# 设置matplotlib中文字体，防止画图乱码
plt.rcParams['font.sans-serif'] = ['SimHei', 'DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

class SEOCrawler:
    """SEO爬虫和诊断工具"""
    
    def __init__(self, base_url, max_depth=3, max_pages=100, delay=1, max_workers=5):
        """
        初始化SEO爬虫
        
        Args:
            base_url (str): 基础URL
            max_depth (int): 最大爬取深度
            max_pages (int): 最大爬取页面数
            delay (float): 爬取延迟(秒)
            max_workers (int): 最大线程数
        """
        self.base_url = base_url
        self.base_domain = urlparse(base_url).netloc
        self.max_depth = max_depth
        self.max_pages = max_pages
        self.delay = delay
        self.max_workers = max_workers
        
        # 数据存储
        self.crawled_pages = {}
        self.external_links = set()
        self.broken_links = []
        self.seo_issues = defaultdict(list)
        
        # 爬取状态
        self.crawled_count = 0
        self.start_time = None
        self.is_running = False
        
        # 配置日志
        self.setup_logging()
        
    def setup_logging(self):
        """设置日志"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('seo_audit.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def is_internal_url(self, url):
        """判断是否为内部链接"""
        parsed_url = urlparse(url)
        return parsed_url.netloc == self.base_domain or not parsed_url.netloc
    
    def normalize_url(self, url, base_url):
        """标准化URL"""
        try:
            # 处理相对URL
            if not urlparse(url).scheme:
                url = urljoin(base_url, url)
            
            # 移除锚点和查询参数
            parsed = urlparse(url)
            return parsed.scheme + '://' + parsed.netloc + parsed.path
            
        except Exception as e:
            self.logger.error(f"URL标准化错误: {url} - {str(e)}")
            return None
    
    def get_page_content(self, url):
        """获取页面内容"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
            
            response = requests.get(
                url,
                headers=headers,
                timeout=10,
                allow_redirects=True
            )
            
            response.raise_for_status()
            return {
                'status_code': response.status_code,
                'content': response.text,
                'headers': response.headers,
                'final_url': response.url
            }
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"请求错误 {url}: {str(e)}")
            return {
                'status_code': getattr(e.response, 'status_code', None) or 0,
                'error': str(e)
            }
    
    def analyze_seo_elements(self, url, soup, page_data):
        """分析SEO元素"""
        seo_data = {}
        
        # 页面标题
        title_tag = soup.find('title')
        seo_data['title'] = title_tag.text.strip() if title_tag else ''
        
        # 元描述
        meta_desc = soup.find('meta', {'name': 'description'})
        seo_data['meta_description'] = meta_desc.get('content', '').strip() if meta_desc else ''
        
        # 元关键词
        meta_keywords = soup.find('meta', {'name': 'keywords'})
        seo_data['meta_keywords'] = meta_keywords.get('content', '').strip() if meta_keywords else ''
        
        # H标签分析
        h_tags = {}
        for i in range(1, 7):
            h_tags[f'h{i}'] = [tag.text.strip() for tag in soup.find_all(f'h{i}')]
        seo_data['h_tags'] = h_tags
        
        # 图片分析
        images = []
        for img in soup.find_all('img'):
            img_data = {
                'src': img.get('src', ''),
                'alt': img.get('alt', '').strip(),
                'width': img.get('width'),
                'height': img.get('height')
            }
            images.append(img_data)
        seo_data['images'] = images
        
        # 链接分析
        links = []
        for a_tag in soup.find_all('a', href=True):
            link_data = {
                'href': a_tag.get('href', ''),
                'text': a_tag.text.strip(),
                'rel': a_tag.get('rel', [])
            }
            links.append(link_data)
        seo_data['links'] = links
        
        # 页面大小
        seo_data['page_size'] = len(page_data['content']) if 'content' in page_data else 0
        
        # 响应时间
        seo_data['response_time'] = page_data.get('response_time', 0)
        
        return seo_data
    
    def check_seo_issues(self, url, seo_data):
        """检查SEO问题"""
        issues = []
        
        # 检查页面标题
        if not seo_data['title']:
            issues.append('缺少页面标题')
        elif len(seo_data['title']) > 70:
            issues.append(f'页面标题过长 ({len(seo_data["title"])}字符)')
        elif len(seo_data['title']) < 10:
            issues.append(f'页面标题过短 ({len(seo_data["title"])}字符)')
        
        # 检查元描述
        if not seo_data['meta_description']:
            issues.append('缺少元描述')
        elif len(seo_data['meta_description']) > 160:
            issues.append(f'元描述过长 ({len(seo_data["meta_description"])}字符)')
        elif len(seo_data['meta_description']) < 50:
            issues.append(f'元描述过短 ({len(seo_data["meta_description"])}字符)')
        
        # 检查H1标签
        if len(seo_data['h_tags']['h1']) == 0:
            issues.append('缺少H1标签')
        elif len(seo_data['h_tags']['h1']) > 1:
            issues.append(f'H1标签过多 ({len(seo_data["h_tags"]["h1"])}个)')
        
        # 检查图片alt文本
        missing_alt = [img for img in seo_data['images'] if not img['alt'] and img['src']]
        if missing_alt:
            issues.append(f'{len(missing_alt)}张图片缺少alt文本')
        
        # 检查页面大小
        if seo_data['page_size'] > 500000:  # 500KB
            issues.append(f'页面过大 ({seo_data["page_size"]/1024:.1f}KB)')
        
        # 检查内部链接
        internal_links = [link for link in seo_data['links'] if self.is_internal_url(link['href'])]
        if len(internal_links) < 3:
            issues.append(f'内部链接过少 ({len(internal_links)}个)')
        
        return issues
    
    def crawl_page(self, url, depth=1):
        """爬取单个页面"""
        if not self.is_running:
            return
        
        # 检查爬取限制
        if depth > self.max_depth or self.crawled_count >= self.max_pages:
            return
        
        # 标准化URL
        normalized_url = self.normalize_url(url, self.base_url)
        if not normalized_url:
            return
        
        # 检查是否已爬取
        if normalized_url in self.crawled_pages:
            return
        
        self.logger.info(f"爬取页面 {depth}/{self.max_depth}: {normalized_url}")
        
        try:
            # 获取页面内容
            start_time = time.time()
            page_data = self.get_page_content(normalized_url)
            response_time = time.time() - start_time
            
            if 'error' in page_data:
                self.broken_links.append({
                    'url': normalized_url,
                    'status_code': page_data['status_code'],
                    'error': page_data['error']
                })
                return
            
            # 更新爬取计数
            self.crawled_count += 1
            page_data['response_time'] = response_time
            
            # 解析页面
            soup = BeautifulSoup(page_data['content'], 'html.parser')
            
            # 分析SEO元素
            seo_data = self.analyze_seo_elements(normalized_url, soup, page_data)
            
            # 检查SEO问题
            seo_issues = self.check_seo_issues(normalized_url, seo_data)
            
            # 存储页面数据
            self.crawled_pages[normalized_url] = {
                'url': normalized_url,
                'status_code': page_data['status_code'],
                'title': seo_data['title'],
                'meta_description': seo_data['meta_description'],
                'response_time': response_time,
                'page_size': seo_data['page_size'],
                'h_tags': seo_data['h_tags'],
                'image_count': len(seo_data['images']),
                'link_count': len(seo_data['links']),
                'internal_links': len([link for link in seo_data['links'] if self.is_internal_url(link['href'])]),
                'external_links': len([link for link in seo_data['links'] if not self.is_internal_url(link['href'])]),
                'issues': seo_issues,
                'depth': depth
            }
            
            # 记录SEO问题
            for issue in seo_issues:
                self.seo_issues[issue].append(normalized_url)
            
            # 提取并处理链接
            if depth < self.max_depth:
                links = []
                for a_tag in soup.find_all('a', href=True):
                    link_url = a_tag.get('href')
                    full_url = self.normalize_url(link_url, normalized_url)
                    
                    if full_url:
                        if self.is_internal_url(full_url) and full_url not in self.crawled_pages:
                            links.append(full_url)
                        elif not self.is_internal_url(full_url):
                            self.external_links.add(full_url)
                
                # 控制并发爬取
                with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                    futures = [executor.submit(self.crawl_page, link, depth + 1) for link in links[:self.max_workers]]
                    for future in as_completed(futures):
                        future.result()
                
                # 爬取延迟
                time.sleep(self.delay)
                
        except Exception as e:
            self.logger.error(f"爬取错误 {normalized_url}: {str(e)}")
            self.broken_links.append({
                'url': normalized_url,
                'error': str(e)
            })
    
    def start_crawling(self):
        """开始爬取"""
        self.logger.info(f"开始爬取网站: {self.base_url}")
        self.logger.info(f"最大深度: {self.max_depth}, 最大页面数: {self.max_pages}")
        
        self.is_running = True
        self.start_time = time.time()
        
        try:
            self.crawl_page(self.base_url, depth=1)
        except KeyboardInterrupt:
            self.logger.info("爬取被用户中断")
        finally:
            self.is_running = False
            self.end_time = time.time()
        
        self.logger.info(f"爬取完成，共爬取 {self.crawled_count} 个页面")
        self.logger.info(f"发现 {len(self.broken_links)} 个 broken links")
        self.logger.info(f"发现 {len(self.external_links)} 个外部链接")
        
        return self.generate_report()
    
    def calculate_seo_score(self):
        """计算SEO得分"""
        total_score = 100
        deductions = 0
        
        # 页面标题问题 (-10分)
        title_issues = sum(1 for page in self.crawled_pages.values() if '页面标题' in ' '.join(page['issues']))
        deductions += min(title_issues * 2, 10)
        
        # 元描述问题 (-8分)
        meta_issues = sum(1 for page in self.crawled_pages.values() if '元描述' in ' '.join(page['issues']))
        deductions += min(meta_issues * 2, 8)
        
        # H1标签问题 (-5分)
        h1_issues = sum(1 for page in self.crawled_pages.values() if 'H1标签' in ' '.join(page['issues']))
        deductions += min(h1_issues * 2, 5)
        
        # 图片alt问题 (-7分)
        alt_issues = sum(1 for page in self.crawled_pages.values() if 'alt文本' in ' '.join(page['issues']))
        deductions += min(alt_issues * 2, 7)
        
        # 页面大小问题 (-5分)
        size_issues = sum(1 for page in self.crawled_pages.values() if '页面过大' in ' '.join(page['issues']))
        deductions += min(size_issues * 2, 5)
        
        # Broken links (-10分)
        broken_link_penalty = min(len(self.broken_links) * 2, 10)
        deductions += broken_link_penalty
        
        # 内部链接问题 (-5分)
        link_issues = sum(1 for page in self.crawled_pages.values() if '内部链接过少' in ' '.join(page['issues']))
        deductions += min(link_issues * 2, 5)
        
        # 响应时间问题 (-10分)
        slow_pages = sum(1 for page in self.crawled_pages.values() if page['response_time'] > 3)
        deductions += min(slow_pages * 2, 10)
        
        # 重复标题 (-10分)
        titles = [page['title'] for page in self.crawled_pages.values() if page['title']]
        title_counts = defaultdict(int)
        for title in titles:
            title_counts[title] += 1
        duplicate_titles = sum(1 for count in title_counts.values() if count > 1)
        deductions += min(duplicate_titles * 3, 10)
        
        # 重复元描述 (-10分)
        meta_descs = [page['meta_description'] for page in self.crawled_pages.values() if page['meta_description']]
        meta_counts = defaultdict(int)
        for meta in meta_descs:
            meta_counts[meta] += 1
        duplicate_meta = sum(1 for count in meta_counts.values() if count > 1)
        deductions += min(duplicate_meta * 3, 10)
        
        seo_score = max(0, total_score - deductions)
        return {
            'score': seo_score,
            'deductions': deductions,
            'breakdown': {
                'title_issues': min(title_issues * 2, 10),
                'meta_issues': min(meta_issues * 2, 8),
                'h1_issues': min(h1_issues * 2, 5),
                'alt_issues': min(alt_issues * 2, 7),
                'size_issues': min(size_issues * 2, 5),
                'broken_links': broken_link_penalty,
                'link_issues': min(link_issues * 2, 5),
                'slow_pages': min(slow_pages * 2, 10),
                'duplicate_titles': min(duplicate_titles * 3, 10),
                'duplicate_meta': min(duplicate_meta * 3, 10)
            }
        }
    
    def generate_charts(self):
        """生成分析图表"""
        # 创建图表目录
        chart_dir = 'seo_charts'
        os.makedirs(chart_dir, exist_ok=True)
        
        # 1. SEO问题分布饼图
        issues_data = self.seo_issues
        if issues_data:
            labels = list(issues_data.keys())
            sizes = [len(pages) for pages in issues_data.values()]
            
            plt.figure(figsize=(10, 8))
            colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8']
            plt.pie(sizes, labels=labels, autopct='%1.1f%%', colors=colors[:len(labels)])
            plt.title('SEO问题分布', fontsize=16, fontweight='bold')
            plt.axis('equal')
            plt.tight_layout()
            plt.savefig(f'{chart_dir}/seo_issues_distribution.png', dpi=300, bbox_inches='tight')
            plt.close()
        
        # 2. 页面性能分析图
        if self.crawled_pages:
            response_times = [page['response_time'] for page in self.crawled_pages.values()]
            page_sizes = [page['page_size']/1024 for page in self.crawled_pages.values()]  # KB
            
            fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
            
            # 响应时间分布
            ax1.hist(response_times, bins=20, color='#4ecdc4', alpha=0.7)
            ax1.set_title('页面响应时间分布', fontweight='bold')
            ax1.set_xlabel('响应时间 (秒)')
            ax1.set_ylabel('页面数量')
            ax1.axvline(3, color='red', linestyle='--', label='3秒阈值')
            ax1.legend()
            
            # 页面大小分布
            ax2.hist(page_sizes, bins=20, color='#45b7d1', alpha=0.7)
            ax2.set_title('页面大小分布', fontweight='bold')
            ax2.set_xlabel('页面大小 (KB)')
            ax2.set_ylabel('页面数量')
            ax2.axvline(500, color='red', linestyle='--', label='500KB阈值')
            ax2.legend()
            
            plt.tight_layout()
            plt.savefig(f'{chart_dir}/page_performance.png', dpi=300, bbox_inches='tight')
            plt.close()
        
        # 3. SEO得分雷达图
        seo_score = self.calculate_seo_score()
        categories = list(seo_score['breakdown'].keys())
        scores = [10 - (score/10) for score in seo_score['breakdown'].values()]  # 转换为得分
        
        fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
        
        # 添加每个类别的得分
        angles = [n / float(len(categories)) * 2 * 3.14159 for n in range(len(categories))]
        scores += scores[:1]  # 闭合图形
        angles += angles[:1]
        
        ax.plot(angles, scores, 'o-', linewidth=2, color='#ff6b6b')
        ax.fill(angles, scores, alpha=0.25, color='#ff6b6b')
        
        # 设置标签
        category_labels = {
            'title_issues': '页面标题',
            'meta_issues': '元描述',
            'h1_issues': 'H1标签',
            'alt_issues': '图片ALT',
            'size_issues': '页面大小',
            'broken_links': 'Broken Links',
            'link_issues': '内部链接',
            'slow_pages': '响应时间',
            'duplicate_titles': '重复标题',
            'duplicate_meta': '重复元描述'
        }
        
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels([category_labels.get(cat, cat.replace('_', ' ')) for cat in categories])
        ax.set_ylim(0, 10)
        ax.set_title(f'SEO得分雷达图 (总分: {seo_score["score"]}/100)', fontsize=16, fontweight='bold', pad=20)
        
        plt.tight_layout()
        plt.savefig(f'{chart_dir}/seo_radar_chart.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        return chart_dir
    
    def generate_html_report(self, report_data, chart_dir):
        """生成HTML报告"""
        html_template = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO诊断报告 - {base_url}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Microsoft YaHei', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 20px;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        
        .header h1 {{
            font-size: 2.5em;
            margin-bottom: 10px;
        }}
        
        .header .meta {{
            font-size: 1.1em;
            opacity: 0.9;
        }}
        
        .score-card {{
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
        }}
        
        .score-card .score {{
            font-size: 4em;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        
        .score-card .grade {{
            font-size: 1.5em;
            margin-bottom: 20px;
        }}
        
        .section {{
            padding: 30px;
            border-bottom: 1px solid #eee;
        }}
        
        .section h2 {{
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 1.8em;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }}
        
        .section h3 {{
            color: #34495e;
            margin: 15px 0;
            font-size: 1.4em;
        }}
        
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        
        .metric-card {{
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3498db;
        }}
        
        .metric-card .value {{
            font-size: 2.5em;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }}
        
        .metric-card .label {{
            color: #7f8c8d;
            font-size: 1em;
        }}
        
        .chart-container {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        
        .chart-container img {{
            width: 100%;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .issues-list {{
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }}
        
        .issue-item {{
            margin: 15px 0;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #e74c3c;
        }}
        
        .issue-item.high {{ border-left-color: #e74c3c; }}
        .issue-item.medium {{ border-left-color: #f39c12; }}
        .issue-item.low {{ border-left-color: #3498db; }}
        
        .issue-item h4 {{
            color: #2c3e50;
            margin-bottom: 10px;
        }}
        
        .issue-item .pages {{
            color: #7f8c8d;
            font-size: 0.9em;
            margin-top: 10px;
        }}
        
        .recommendations {{
            background: #e8f8f5;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #27ae60;
        }}
        
        .recommendation-item {{
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 6px;
        }}
        
        .priority-high {{ background: #ffebee; border-left: 4px solid #e74c3c; }}
        .priority-medium {{ background: #fff3e0; border-left: 4px solid #f57c00; }}
        .priority-low {{ background: #e8f5e9; border-left: 4px solid #4caf50; }}
        
        .footer {{
            text-align: center;
            padding: 20px;
            color: #7f8c8d;
            background: #f8f9fa;
        }}
        
        @media (max-width: 768px) {{
            .header h1 {{
                font-size: 2em;
            }}
            
            .score-card .score {{
                font-size: 3em;
            }}
            
            .chart-container {{
                grid-template-columns: 1fr;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SEO诊断报告</h1>
            <div class="meta">
                <p>网站: {base_url}</p>
                <p>生成时间: {timestamp}</p>
                <p>爬取页面数: {page_count}</p>
            </div>
        </div>
        
        <div class="score-card">
            <div class="score">{seo_score} / 100</div>
            <div class="grade">{grade}</div>
            <div>SEO综合评分</div>
        </div>
        
        <div class="section">
            <h2>关键指标概览</h2>
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="value">{page_count}</div>
                    <div class="label">爬取页面数</div>
                </div>
                <div class="metric-card">
                    <div class="value">{avg_response_time:.2f}s</div>
                    <div class="label">平均响应时间</div>
                </div>
                <div class="metric-card">
                    <div class="value">{broken_links}</div>
                    <div class="label">Broken Links</div>
                </div>
                <div class="metric-card">
                    <div class="value">{external_links}</div>
                    <div class="label">外部链接数</div>
                </div>
                <div class="metric-card">
                    <div class="value">{avg_page_size:.1f}KB</div>
                    <div class="label">平均页面大小</div>
                </div>
                <div class="metric-card">
                    <div class="value">{issues_count}</div>
                    <div class="label">发现问题数</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <h2>数据可视化分析</h2>
            <div class="chart-container">
                {charts_html}
            </div>
        </div>
        
        <div class="section">
            <h2>发现的SEO问题</h2>
            <div class="issues-list">
                {issues_html}
            </div>
        </div>
        
        <div class="section">
            <h2>优化建议</h2>
            <div class="recommendations">
                {recommendations_html}
            </div>
        </div>
        
        <div class="section">
            <h2>详细页面分析</h2>
            <div class="pages-list">
                {pages_html}
            </div>
        </div>
        
        <div class="footer">
            <p>SEO诊断报告 - 由专业SEO爬虫工具生成</p>
        </div>
    </div>
</body>
</html>
        """
        
        # 生成图表HTML
        charts_html = ""
        if os.path.exists(chart_dir):
            chart_files = [f for f in os.listdir(chart_dir) if f.endswith('.png')]
            for chart_file in chart_files:
                chart_path = f"{chart_dir}/{chart_file}"
                chart_title = chart_file.replace('_', ' ').replace('.png', '').title()
                charts_html += f'<div><img src="{chart_path}" alt="{chart_title}"><p style="text-align: center; margin-top: 10px;">{chart_title}</p></div>'
        
        # 生成问题HTML
        issues_html = ""
        for issue, pages in sorted(self.seo_issues.items(), key=lambda x: len(x[1]), reverse=True):
            # 确定问题优先级
            if any(keyword in issue for keyword in ['缺少', 'Broken', '错误']):
                priority = 'high'
                priority_text = '高优先级'
            elif any(keyword in issue for keyword in ['过长', '过短', '过多', '过少']):
                priority = 'medium'
                priority_text = '中优先级'
            else:
                priority = 'low'
                priority_text = '低优先级'
            
            issues_html += f"""
            <div class="issue-item {priority}">
                <h4>{issue} <span style="color: #7f8c8d; font-size: 0.8em;">({priority_text})</span></h4>
                <p>影响页面数: {len(pages)}</p>
                <div class="pages">
                    示例页面: {', '.join(pages[:3])}{'...' if len(pages) > 3 else ''}
                </div>
            </div>
            """
        
        # 生成优化建议HTML
        recommendations = [
            {
                'priority': 'high',
                'title': '修复关键技术问题',
                'description': '优先修复Broken Links、缺失页面标题、缺失元描述等关键问题',
                'action': '检查并修复所有404错误页面，为每个页面添加唯一的标题和描述'
            },
            {
                'priority': 'high',
                'title': '优化页面加载速度',
                'description': '针对响应时间超过3秒的页面进行性能优化',
                'action': '压缩图片、启用Gzip压缩、优化CSS和JavaScript文件'
            },
            {
                'priority': 'medium',
                'title': '完善内容结构',
                'description': '优化H标签结构，确保每个页面只有一个H1标签',
                'action': '调整标题层级，确保内容结构清晰，关键词合理分布'
            },
            {
                'priority': 'medium',
                'title': '图片SEO优化',
                'description': '为所有图片添加描述性的alt文本',
                'action': '检查并补充缺失的alt属性，确保描述准确反映图片内容'
            },
            {
                'priority': 'low',
                'title': '内部链接优化',
                'description': '增加高质量的内部链接，改善网站结构',
                'action': '在相关内容之间添加链接，使用描述性的锚文本'
            }
        ]
        
        recommendations_html = ""
        for rec in recommendations:
            recommendations_html += f"""
            <div class="recommendation-item priority-{rec['priority']}">
                <h4 style="margin-bottom: 10px;">{rec['title']}</h4>
                <p style="margin-bottom: 10px;"><strong>问题描述:</strong> {rec['description']}</p>
                <p><strong>建议行动:</strong> {rec['action']}</p>
            </div>
            """
        
        # 生成页面分析HTML
        pages_html = "<div style='max-height: 400px; overflow-y: auto;'>"
        for i, (url, page_data) in enumerate(list(self.crawled_pages.items())[:20]):  # 只显示前20个页面
            status_color = '#27ae60' if page_data['status_code'] == 200 else '#e74c3c'
            issues_text = ' ✓ 正常' if not page_data['issues'] else f' ✗ {len(page_data["issues"])}个问题'
            issues_color = '#27ae60' if not page_data['issues'] else '#e74c3c'
            
            pages_html += f"""
            <div style="padding: 15px; border-bottom: 1px solid #eee; margin: 5px 0;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <strong style="color: {status_color};">{page_data['status_code']}</strong>
                    <span style="color: {issues_color}; font-size: 0.9em;">{issues_text}</span>
                </div>
                <div style="font-weight: bold; margin-bottom: 5px;">{page_data['title'][:60]}{'...' if len(page_data['title']) > 60 else ''}</div>
                <div style="color: #7f8c8d; font-size: 0.9em; margin-bottom: 5px;">{url}</div>
                <div style="font-size: 0.8em; color: #7f8c8d;">
                    响应时间: {page_data['response_time']:.2f}s | 大小: {page_data['page_size']/1024:.1f}KB | 链接数: {page_data['link_count']}
                </div>
            </div>
            """
        pages_html += "</div>"
        
        # 计算等级
        seo_score = report_data['seo_score']['score']
        if seo_score >= 90:
            grade = "A - 优秀"
        elif seo_score >= 80:
            grade = "B - 良好"
        elif seo_score >= 70:
            grade = "C - 一般"
        elif seo_score >= 60:
            grade = "D - 较差"
        else:
            grade = "F - 很差"
        
        # 填充模板
        html_content = html_template.format(
            base_url=self.base_url,
            timestamp=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            page_count=len(self.crawled_pages),
            seo_score=seo_score,
            grade=grade,
            avg_response_time=report_data['avg_response_time'],
            broken_links=len(self.broken_links),
            external_links=len(self.external_links),
            avg_page_size=report_data['avg_page_size'],
            issues_count=len(self.seo_issues),
            charts_html=charts_html,
            issues_html=issues_html,
            recommendations_html=recommendations_html,
            pages_html=pages_html
        )
        
        # 保存HTML报告
        report_file = f"seo_audit_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return report_file
    
    def generate_report(self):
        """生成完整报告"""
        self.logger.info("正在生成SEO诊断报告...")
        
        # 计算统计数据
        total_pages = len(self.crawled_pages)
        avg_response_time = sum(page['response_time'] for page in self.crawled_pages.values()) / total_pages if total_pages > 0 else 0
        avg_page_size = sum(page['page_size'] for page in self.crawled_pages.values()) / total_pages / 1024 if total_pages > 0 else 0
        
        # 计算SEO得分
        seo_score = self.calculate_seo_score()
        
        # 生成图表
        chart_dir = self.generate_charts()
        
        # 生成HTML报告
        report_file = self.generate_html_report({
            'total_pages': total_pages,
            'avg_response_time': avg_response_time,
            'avg_page_size': avg_page_size,
            'seo_score': seo_score,
            'broken_links_count': len(self.broken_links),
            'external_links_count': len(self.external_links)
        }, chart_dir)
        
        report_data = {
            'base_url': self.base_url,
            'crawled_pages': total_pages,
            'broken_links': len(self.broken_links),
            'external_links': len(self.external_links),
            'avg_response_time': avg_response_time,
            'avg_page_size': avg_page_size,
            'seo_score': seo_score,
            'issues_found': len(self.seo_issues),
            'report_file': report_file,
            'chart_dir': chart_dir,
            'duration': self.end_time - self.start_time if hasattr(self, 'end_time') else 0
        }
        
        # 保存JSON格式报告
        json_report = f"seo_audit_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(json_report, 'w', encoding='utf-8') as f:
            json.dump(report_data, f, ensure_ascii=False, indent=2)
        
        report_data['json_report'] = json_report
        
        self.logger.info(f"报告生成完成: {report_file}")
        self.logger.info(f"数据文件生成完成: {json_report}")
        
        return report_data

def main():
    """主函数"""
    print("=" * 60)
    print("专业SEO爬虫和诊断工具")
    print("=" * 60)
    
    # 目标网站
    target_url = "https://index.zshipu.com/"
    
    print(f"\n正在分析网站: {target_url}")
    print("请稍候，正在进行深度SEO分析...\n")
    
    # 创建爬虫实例
    crawler = SEOCrawler(
        base_url=target_url,
        max_depth=3,
        max_pages=100,
        delay=1,
        max_workers=3
    )
    
    try:
        # 开始爬取和分析
        report_data = crawler.start_crawling()
        
        # 显示结果摘要
        print("\n" + "=" * 60)
        print("SEO诊断结果摘要")
        print("=" * 60)
        print(f"网站: {target_url}")
        print(f"爬取页面数: {report_data['crawled_pages']}")
        print(f"SEO得分: {report_data['seo_score']['score']}/100")
        print(f"发现问题: {report_data['issues_found']}个")
        print(f"Broken Links: {report_data['broken_links']}个")
        print(f"外部链接: {report_data['external_links']}个")
        print(f"平均响应时间: {report_data['avg_response_time']:.2f}秒")
        print(f"分析耗时: {report_data['duration']:.1f}秒")
        print("=" * 60)
        
        print(f"\n详细报告已保存至: {report_data['report_file']}")
        print(f"数据文件已保存至: {report_data['json_report']}")
        print(f"图表文件已保存至: {report_data['chart_dir']}")
        
        print("\n报告包含以下内容:")
        print("• SEO综合得分和评级")
        print("• 关键性能指标分析")
        print("• 数据可视化图表")
        print("• 详细问题清单")
        print("• 针对性优化建议")
        print("• 页面详细分析")
        
    except KeyboardInterrupt:
        print("\n分析被用户中断")
    except Exception as e:
        print(f"\n分析过程中出现错误: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()