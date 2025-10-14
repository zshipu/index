# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**zshipu-index** is a comprehensive static website repository serving as a Chinese-language information hub covering AI tools, technology resources, stock market content, and educational materials. The site is hosted on **GitHub Pages** and consists of multiple independent content sections, each with its own static HTML structure.

**Key Characteristics:**
- Static HTML site generated with Hugo (but deployed as pure HTML - no build step on deployment)
- Chinese-language primary content (Simplified Chinese)
- Multi-domain content organization (AI, tech, finance, education, health)
- Automatic deployment via GitHub Actions
- Domain: `https://index.zshipu.com/`

## Repository Architecture

### Content Domain Structure

The repository is organized into domain-specific directories, each representing a complete sub-site:

**Primary Domains:**
- `ai/`, `ai001/`, `ai002/` - AI tools, resources, tutorials, and news (1200+ articles, different versions)
- `geek/`, `geek001/`, `geek002/` - Technology and developer content (different versions/topics)
- `stock/`, `stock001/`, `stock002/` - Stock market analysis and resources
- `gpt/` - ChatGPT and large language model content
- `go/` - Go language programming content
- `ecg/` - ECG health and medical science content
- `ai1000website/` - Curated AI tools directory (1700+ entries in markdown)
- `upecg/` - ECG signal processing project (Python-based)

**Specialized Projects:**
- `fly-by/` - Three.js game/experience (procedural terrain generation)
- `ai-bot/` - AI bot integration tools
- `ai-write-blog/` - AI-powered blog writing tools
- `weibo/` - Weibo social media integration
- `xiaoshuo/` - Novel/story content
- `ds/` - Data science resources
- `app/` - Creative application prototypes (100+ app ideas with interactive HTML mockups)

### Sub-Project Details

Each major sub-project has its own CLAUDE.md with detailed architecture:

#### upecg/ - ECG Signal Processing
A Python-based image processing system for extracting ECG signals from paper recordings.

**Commands:**
```bash
cd upecg
python ecg_preproc_poc.py <ecg_image_path>  # Process single ECG image
python ecg_preproc_optimized.py             # Optimized version
python test_ecg_preproc.py                  # Run tests
```

**Dependencies:**
```bash
pip install opencv-python numpy scikit-image scipy
```

See `upecg/CLAUDE.md` for detailed architecture and algorithms.

#### ai1000website/ - AI Tools Directory
A modern frontend-only website for browsing curated AI tools.

**Commands:**
```bash
cd ai1000website
# Option 1: Direct open
open index.html  # macOS
# or just double-click index.html

# Option 2: Local server
python -m http.server 8000
# Visit: http://localhost:8000
```

**Files:**
- `index.html` - Main page with search/filter UI
- `app.js` - Tool data and interactive logic (1700+ tools)
- `styles.css` - Modern responsive styling
- `AI强大的宝藏网站.md` - Source markdown with all tool data

See `ai1000website/CLAUDE.md` for detailed architecture.

#### weibo/ - Weibo UI Mockup
A static HTML mockup of Weibo (微博) interface for UI/UX reference.

**Files:**
- `index.html` - Single-file application with embedded CSS
- Three-column responsive layout optimized for Chinese typography

See `weibo/CLAUDE.md` for design patterns and styling conventions.

#### fly-by/ - Three.js Game
A WebGL-based flying experience using procedural terrain generation.

**Dependencies:**
- Three.js (GLTFLoader, three-mesh-bvh)
- SimplexNoise
- Howler.js (audio)
- detect-gpu

Just open `fly-by/index.html` in a browser to play.

#### app/ - Creative Application Prototypes
A collection of 100+ creative application concepts presented as interactive HTML prototypes.

**Project Focus:**
- Health & wellness apps (心脉守护, AR心跳日记, 心率游戏, 情绪日历)
- Education apps (LingoLearn, 儿童故事创作, 英语扫描助手)
- Personal productivity (MindVault AI记忆助手, 智能文案生成器)
- Creative tools (梦境绘本 - DreamCanvas, 创意市集 - IdeaBazaar)
- Entertainment & lifestyle (宠物探险家 - PetQuest, WanderWorld)

**Structure:**
- Each app is a self-contained HTML file with embedded CSS/JS
- Interactive prototypes demonstrating UI/UX concepts
- Primarily Chinese-language content with modern design patterns

**Viewing prototypes:**
```bash
cd app
# Open any HTML file in browser, or:
python -m http.server 8000
# Visit: http://localhost:8000
```

### Root Homepage

The main site homepage (`index.html`) has a modern design with:

**Key Files:**
- `index.html` - Modern homepage with hero section, content cards, featured projects
- `index.html.backup` - Original homepage backup
- `css/homepage.css` - Homepage-specific styles
- `js/homepage.js` - Homepage interactive scripts

**Homepage Sections:**
- Hero section with search and site statistics
- 6 content domain cards (AI, Tech, Stock, GPT, Go, ECG)
- Featured projects showcase (AI1000 tools, Fly-by game, ECG processing)
- Recent articles aggregation from all domains

**Updating Homepage Content:**
Edit `index.html` directly:
- Lines 266-308: Recent articles list
- Lines 140-230: Domain card information
- Lines 122-136: Statistics numbers

See `README-HOMEPAGE.md` and `claudedocs/homepage-*.md` for detailed homepage documentation.

### Root-Level Navigation Pages

The root directory contains three major navigation pages that aggregate content from all domains:

**Archives Page** (`/archives/index.html`)
- Displays all articles chronologically grouped by month
- Dynamically loads from `site-links-by-month.json`
- Shows ~3700+ articles across all domains
- Generated/updated by `scripts/generate_site_index.py`

**Categories Page** (`/categories/index.html`)
- Groups articles by content category/domain
- Loads from `site-links-by-category.json`
- Shows distribution: AI (1200+), Tech, Stock, etc.
- Includes category statistics and filtering

**Tags Page** (`/tags/index.html`)
- Tag cloud and tag-based article browsing
- Uses `site-tags.json` for tag data
- Generated by `scripts/generate_tags_data.py`
- Shows article count per tag

**Important:** These pages depend on JSON files generated by Python scripts. After bulk content changes, always regenerate indexes to keep these pages accurate.

## Deployment

### GitHub Actions Workflow

Automatic deployment to GitHub Pages on push to `main`:

```yaml
# .github/workflows/static.yml
- Triggers: push to main, manual workflow_dispatch
- Deploys: Entire repository root to GitHub Pages
- No build step required (pure static files)
```

**After pushing changes:**
- Changes automatically deploy within 1-2 minutes
- Site URL: `https://index.zshipu.com/`

### Testing Changes Locally

Since all sites are static HTML:
```bash
# Root site with homepage
python -m http.server 8000
# Visit: http://localhost:8000

# Test specific sub-site
cd ai && python -m http.server 8001
cd geek002 && python -m http.server 8002
```

**Testing homepage changes:**
```bash
# After editing index.html, homepage.css, or homepage.js
python -m http.server 8000
# Visit: http://localhost:8000
# Refresh browser to see changes
```

## Content Management

### Static HTML Sites (ai/, geek/, stock/, etc.)

**Structure Pattern:**
```
domain/
├── index.html           # Landing page
├── 404.html            # Error page
├── about/              # About section
├── archives/           # Archive listings
├── categories/         # Category pages
├── tags/               # Tag listings
├── post/               # Individual articles
├── page/               # Pagination pages
├── css/                # Stylesheets
│   ├── normalize.css
│   └── style.css
└── js/                 # JavaScript
    └── totop.js        # Scroll-to-top functionality
```

**Common Features:**
- SEO meta tags (Baidu, 360, Sogou verification)
- Google Analytics integration
- Google AdSense integration
- Responsive design
- RSS/XML sitemap generation

### Adding New Content

**For root homepage:**
1. Edit `index.html` directly
2. Add new articles to recent articles section (lines 266-308)
3. Update statistics if needed (lines 122-136)
4. Maintain responsive design and test on mobile

**For existing domains (ai/, geek/, etc.):**
1. Create HTML file in appropriate `post/` directory
2. Follow existing HTML template structure
3. Update `index.xml` (sitemap)
4. Update pagination if needed (`page/`)
5. Add to category/tag pages if applicable

**For ai1000website/ tool directory:**
1. Edit `app.js` → add to `toolsData` array:
```javascript
{
    name: "Tool Name",
    icon: "🎨",
    description: "Tool description",
    url: "https://example.com",
    category: "featured",  // or: aitools, image, video, audio, office, learning
    tags: ["tag1", "tag2"]
}
```

### Content Update Principles

- **DO NOT** modify HTML structure without checking all related pages
- **ALWAYS** use UTF-8 encoding for Chinese content
- **VERIFY** all internal links use relative paths (not localhost URLs)
- **TEST** navigation between pages works correctly
- **MAINTAIN** consistent styling across domain sections

## Important Context

### Hugo and Static Generation

While the repository shows Hugo metadata in HTML files (`<meta name="generator" content="Hugo 0.124.1">`), the deployment process does NOT involve a build step:

- **Content was generated** with Hugo at some point in the past
- **Deployed files** are pre-generated static HTML committed to the repository
- **No build on deployment** - GitHub Actions deploys HTML files as-is
- **Manual updates** should edit HTML directly, not regenerate with Hugo
- **Theme**: Maupassant theme (modified, see footer credits)

If you need to regenerate content with Hugo:
```bash
# NOT typically needed - Hugo is not in the deployment workflow
hugo  # Would regenerate all HTML from source content
```

### Documentation Structure

Project documentation is organized in `claudedocs/`:
- Implementation reports and design proposals
- Sub-project documentation in respective directories:
  - `upecg/CLAUDE.md` + `upecg/docs/` - ECG processing architecture
  - `ai1000website/CLAUDE.md` - AI tools directory architecture
  - `weibo/CLAUDE.md` - Weibo mockup design patterns
  - `xiaoshuo/*.md` - Novel/story creation guides and PRDs
  - `weibo/PRD_*.md` - Product requirement documents for health projects

### Multi-Site Repository Pattern

This is NOT a monorepo with shared components. Each domain (`ai/`, `geek/`, etc.) is a **standalone static site** that happens to be version-controlled together. They share:
- Common deployment workflow
- Similar HTML/CSS structure patterns
- Same domain (subdirectories)

But they DO NOT share:
- CSS/JS files (each has its own `/css/` and `/js/`)
- Navigation (each site has independent nav structure)
- Build process (there is none - all pre-generated HTML)

### Git Workflow Notes

- **All pushes to `main` deploy to production immediately** (via GitHub Actions within 1-2 minutes)
- No staging environment exists
- Large number of modified files is normal (many HTML pages regenerated)
- Git status will frequently show 100+ modified files after content updates

**Best Practices:**
```bash
# ALWAYS check git status before committing
git status

# Review what will be deployed before pushing
git diff --stat

# For major changes, consider testing locally first
python -m http.server 8000  # Test at http://localhost:8000

# Create meaningful commit messages
git commit -m "feat: add new AI tools section with 10 resources"
git commit -m "fix: correct broken links in stock section"
git commit -m "docs: update homepage with latest articles"
```

### File Organization Rules

**DO:**
- Keep content in appropriate domain directory (`ai/`, `geek/`, etc.)
- Place documentation in `upecg/docs/`, `ai1000website/`, etc.
- Use existing directory structure patterns

**DON'T:**
- Create new top-level directories without clear purpose
- Mix content between domains
- Create build artifacts or temp files in root
- Commit `node_modules/` or Python virtual environments

### SEO and Metadata

All HTML pages include:
- Baidu verification: `codeva-odZno92jxn`
- 360 Search verification: `b46a7087f21ff6cf8dcee8ee59ee9a61`
- Sogou verification: `F2mmMQ4NdU`
- Google Tag Manager: `GTM-WLWJSST`
- Google AdSense: `ca-pub-2874221941555456`

These should be preserved when editing HTML templates.

## Testing and Validation

### Before Committing

**For HTML changes:**
```bash
# Check for localhost URLs (should be none)
grep -r "localhost" --include="*.html" .

# Verify UTF-8 encoding
file -I *.html

# Check for broken internal links (manual test in browser)
```

**For Python code (upecg/):**
```bash
cd upecg
python test_ecg_preproc.py  # Run tests
python -m py_compile *.py   # Check syntax
```

**For JavaScript (ai1000website/, ai-bot/, etc.):**
```bash
# Check syntax (open browser console)
# Test interactivity manually (search, filter, navigation)
```

### Common Issues

**Problem:** HTML pages show garbled Chinese text
- **Cause:** Wrong encoding
- **Fix:** Ensure `<meta charset="utf-8">` in `<head>`

**Problem:** CSS/JS not loading after deployment
- **Cause:** Absolute paths or incorrect relative paths
- **Fix:** Use relative paths like `/css/style.css` or `../css/style.css`

**Problem:** GitHub Pages not updating
- **Cause:** Workflow failed or CNAME conflict
- **Check:** `.github/workflows/static.yml` logs

## Project History Context

Based on file timestamps and structure:
- **2020-2024:** Progressive content accumulation
- **Multiple content versions:** `geek001/`, `geek002/`, `stock001/`, etc. represent evolution/specialization
- **Recent focus (2024):** AI tools and resources expansion
- **Python projects:** Added later (upecg/ for ECG processing)
- **Interactive projects:** fly-by/ and ai1000website/ are modern additions

## Design Patterns Observed

### HTML Template Pattern
All domain HTML files follow similar structure:
```html
<!doctype html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- SEO verification meta tags -->
    <title>Page Title | 知识铺</title>
    <!-- Open Graph meta tags -->
    <!-- CSS includes -->
    <!-- Analytics/AdSense scripts -->
</head>
<body>
    <!-- Header with navigation -->
    <!-- Main content -->
    <!-- Footer -->
    <!-- JavaScript includes -->
</body>
</html>
```

### Navigation Pattern
Each domain has consistent nav structure:
- Home (index.html)
- Archives (archives/)
- Categories (categories/)
- Tags (tags/)
- About (about/)
- Search (search/)

### Resource Loading Pattern
- **jQuery:** `//cdn.bootcdn.net/ajax/libs/jquery/3.4.1/jquery.min.js`
- **CSS:** Local files in `/css/` directory
- **JS:** Local files in `/js/` directory + inline scripts

## Special Considerations

### Chinese Language Processing
- All content primarily in Simplified Chinese
- UTF-8 encoding mandatory
- SEO optimized for Chinese search engines (Baidu, 360, Sogou)
- Meta descriptions and keywords in Chinese

### Performance Optimization
- Static HTML = fast loading
- CDN-hosted jQuery
- Minimal JavaScript dependencies
- CSS kept simple and local

### No Backend Services
- No databases
- No server-side processing
- No authentication/authorization
- All data embedded in HTML or JS files
- Forms (if any) would need external services

## Development Workflows

### Adding New Articles

**Standard workflow for adding content:**

1. **Create article HTML** in appropriate domain/post directory:
   ```bash
   # Example: Add new AI article
   mkdir -p ai/post/20251014/new-article-slug
   # Create index.html with proper structure (follow existing templates)
   ```

2. **Verify article structure:**
   - Check UTF-8 encoding
   - Ensure all SEO meta tags present
   - Verify relative paths for links and resources
   - Test locally with `python -m http.server 8000`

3. **Regenerate site indexes:**
   ```bash
   python scripts/generate_site_index.py
   ```

4. **Update homepage if needed:**
   - Edit `index.html` to add to recent articles (lines 266-308)
   - Update statistics if significant milestone (lines 122-136)

5. **Commit and deploy:**
   ```bash
   git add .
   git commit -m "feat: add new article about [topic]"
   git push
   # Automatic deployment via GitHub Actions (1-2 minutes)
   ```

### Batch Content Operations

**For bulk updates or fixes:**

1. **Always create a git commit first** (safety checkpoint)
2. **Test on a few files** before full batch operation
3. **Run batch script** from appropriate directory
4. **Regenerate indexes** after batch changes
5. **Verify in browser** before committing

### Homepage Updates

**Updating homepage content:**

1. Edit `index.html` directly (no build step)
2. Test responsive design at multiple breakpoints
3. Update recent articles section when needed
4. Maintain consistency with domain sites
5. Test search functionality works correctly

### Adding AI Tools

**For ai1000website/ directory:**

1. Edit `app.js` → add to `toolsData` array
2. Follow existing tool object structure
3. Test search and filter functionality
4. No need to regenerate HTML (pure JavaScript data)

## When Working on This Codebase

**If editing HTML content:**
- Preserve existing meta tags and verification codes
- Maintain UTF-8 encoding
- Use relative paths for all internal links
- Test in browser before committing

**If running batch operations:**
- Always commit current state first
- Test scripts on small sample before full batch
- Regenerate site indexes after content changes
- Verify no broken links or encoding issues

**If modifying upecg/ Python code:**
- Run tests before committing
- Update documentation if algorithm changes
- Preserve grid detection and calibration logic

**If touching .github/workflows/:**
- Test locally first if possible
- Understand deployment will be automatic
- Don't break the GitHub Pages configuration

## Content Generation and SEO

### Site Index Generation

The repository includes Python scripts in `/scripts/` for generating JSON indexes and SEO files:

**Key Scripts:**
- `generate_site_index.py` - Generates complete site indexes, sitemaps, and robots.txt
- `generate_homepage_seo_links.py` - Generates SEO-optimized internal links for homepage
- `generate_tags_data.py` - Extracts and generates tag cloud data

**Script Dependencies:**
```bash
# All scripts require Python 3.6+ with standard library only
# No external dependencies needed - uses built-in modules:
# - json, os, re, datetime, html.parser, pathlib
```

**Regenerating Site Indexes:**
```bash
# Generate all JSON indexes and sitemaps (run after adding/updating articles)
python scripts/generate_site_index.py

# Generate homepage SEO links
python scripts/generate_homepage_seo_links.py

# Generate tags data
python scripts/generate_tags_data.py
```

**Generated Files:**
- `site-links-full.json` - Complete article index (~3700+ articles)
- `site-links-recent.json` - Most recent 100 articles (homepage sidebar)
- `site-links-by-category.json` - Articles grouped by category
- `site-links-by-month.json` - Articles grouped by month
- `site-links-search.json` - Compressed search index
- `sitemap.xml` + sub-sitemaps - SEO sitemap files (7 files total)
- `robots.txt` - Search engine crawling instructions
- `seo-fragments/*.html` - Pre-generated HTML fragments for SEO

**When to Regenerate:**
- After adding new articles to any domain
- After updating article titles or metadata
- Before major deployments
- When homepage statistics need updating

### Content Optimization Scripts

Several domains contain Python scripts in their `post/` directories for batch content processing:

**Common Operations:**
- `batch_optimize.py` - Batch article optimization (found in ai001/)
- `batch_fix.py` - Fix common issues in articles (found in ai/)
- `optimize_articles.py` - SEO and content optimization (found in ai/)
- `semantic_tag_extractor.py` - Extract semantic tags from content (found in ai/)
- Various fix scripts for HTML, titles, and metadata

**Usage Pattern:**
```bash
# Example: Optimize articles in ai domain
cd ai/post/202510
python batch_fix.py

# Run from specific date directory
cd ai001/post/20251011
python batch_optimize.py
```

**Important Notes:**
- These scripts modify HTML files in place
- Always commit changes before running batch operations
- Scripts are typically located in date subdirectories (e.g., `ai/post/202510/`)
- Test on a few files before batch processing entire directories

### SEO Fragment System

Pre-generated HTML fragments in `seo-fragments/`:
- `homepage-seo-links.html` - Internal linking structure for homepage
- `category-sections.html` - Category navigation sections
- `popular-articles.html` - Popular articles listing
- `tag-cloud.html` - Tag cloud for all tags
- `sitemap-links.html` - Sitemap navigation links

These fragments can be included in pages to improve SEO without dynamic generation.

## Quick Reference

### Common Commands
```bash
# Local development
python -m http.server 8000

# Regenerate site indexes after content changes
python scripts/generate_site_index.py

# Run ECG processing
cd upecg && python ecg_preproc_poc.py <image_path>

# Run ECG tests
cd upecg && python test_ecg_preproc.py

# Check for localhost URLs (should be none)
grep -r "localhost" --include="*.html" .

# Verify UTF-8 encoding
file -I *.html
```

### Important File Paths
- **Homepage**: `index.html`, `css/homepage.css`, `js/homepage.js`
- **AI Tools Data**: `ai1000website/app.js`
- **App Prototypes**: `app/*.html` (25+ creative app mockups)
- **Deployment**: `.github/workflows/static.yml`
- **Domain Config**: `CNAME` (contains: index.zshipu.com)
- **Scripts**: `scripts/*.py` (content generation and SEO)
- **JSON Indexes**: `site-links-*.json` (5 files)
- **Sitemaps**: `sitemap*.xml` (8 files)
- **SEO Fragments**: `seo-fragments/*.html` (5 files)
- **Sub-project Docs**: `*/CLAUDE.md` in respective directories

### Site URLs Structure
- Main site: `https://index.zshipu.com/`
- AI section: `https://index.zshipu.com/ai/`
- Tech section: `https://index.zshipu.com/geek/`
- Stock section: `https://index.zshipu.com/stock/`
- AI tools: `https://index.zshipu.com/ai1000website/`
- ECG section: `https://index.zshipu.com/ecg/`
- GPT section: `https://index.zshipu.com/gpt/`
- Go section: `https://index.zshipu.com/go/`
