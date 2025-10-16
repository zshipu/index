# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## TL;DR - Quick Orientation

**What:** Chinese-language static website hub with 3700+ articles on AI, tech, stocks, education
**Deployment:** GitHub Pages @ `https://index.zshipu.com/` - Auto-deploys on push to `main` (1-2 min)
**No build step:** Pure static HTML committed directly to repo
**Tech:** Pre-generated HTML + Python scripts for indexing/SEO + Zero external dependencies

**Most common task:** Add article → `python scripts/generate_site_index.py` → test → deploy
**Critical rule:** Always regenerate indexes after content changes (or navigation pages break)
**Testing:** `python -m http.server 8000` (works on any directory)

**Key directories:**
- `ai/`, `geek/`, `stock/`, `gpt/`, `go/`, `ecg/` - Domain-specific article collections
- `scripts/*.py` - Content generation (5 scripts, Python 3.6+, stdlib only)
- `ai1000website/` - Interactive AI tools directory (1700+ tools)
- `app/` - Creative app prototypes (100+ mockups)
- `upecg/` - ECG signal processing (Python)

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
Edit `index.html` directly for:
- Recent articles section
- Domain card information
- Site statistics

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

## Critical Workflows (Start Here)

### Most Common Tasks

**1. Add New Article (Most Frequent):**
```bash
# Create article HTML in domain/post/YYYYMMDD/article-slug/index.html
mkdir -p ai/post/20251017/article-slug
# ... create index.html with UTF-8 encoding ...

# Regenerate indexes (CRITICAL - don't skip this)
python scripts/generate_site_index.py

# Test locally
python -m http.server 8000

# Deploy
git add . && git commit -m "feat: add article" && git push
```

**2. Update Homepage:**
```bash
# Edit index.html for recent articles or statistics
# Test changes
python -m http.server 8000

# Deploy (deploys automatically, no build needed)
git add index.html && git commit -m "docs: update homepage" && git push
```

**3. Batch Fix Articles:**
```bash
# Always checkpoint first
git add . && git commit -m "checkpoint: before batch"

# Run batch operation
cd ai/post/202510 && python batch_fix.py

# Regenerate indexes
cd ../../.. && python scripts/generate_site_index.py

# Deploy
git add . && git commit -m "fix: batch optimize" && git push
```

**4. Add AI Tool:**
```bash
# Edit ai1000website/app.js, add to toolsData array
# No regeneration needed (pure JS)
# Test and deploy
python -m http.server 8000
git add ai1000website/app.js && git commit -m "feat: add tool" && git push
```

### Script Execution Order

**After adding/updating articles (always run in this order):**
```bash
1. python scripts/generate_site_index.py      # Updates sitemaps + all JSON indexes
2. python scripts/generate_tags_data.py       # Updates tag data (if tags changed)
3. git add . && git commit && git push        # Deploy to production
```

**Why this order matters:**
- `generate_site_index.py` scans all articles and rebuilds 13 files (5 JSON, 8 XML)
- `generate_tags_data.py` depends on tag directory structure being current
- Both must complete before deployment to keep site consistent

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
- No staging environment - all pushes go directly to production

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

**Complete workflow (most common task):**

1. **Create article HTML** in appropriate domain/post directory:
   ```bash
   # Example: Add new AI article
   mkdir -p ai/post/20251017/new-article-slug
   # Create index.html following existing article templates
   # Ensure UTF-8 encoding and include all SEO meta tags
   ```

2. **Test locally:**
   ```bash
   python -m http.server 8000
   # Visit: http://localhost:8000/ai/post/20251017/new-article-slug/
   # Verify: encoding, links, images, navigation work correctly
   ```

3. **Regenerate all site indexes** (critical step):
   ```bash
   # This updates: sitemaps, JSON indexes, archives, categories, tags pages
   python scripts/generate_site_index.py

   # If you added/changed tags, also run:
   python scripts/generate_tags_data.py
   ```

4. **Update homepage** (optional, for featured articles):
   ```bash
   # Edit index.html to add to recent articles section
   # Update site statistics if adding significant milestone
   ```

5. **Quality checks:**
   ```bash
   # Verify no localhost URLs
   grep -r "localhost" --include="*.html" .

   # Check git status (100+ files is normal after regenerating indexes)
   git status
   ```

6. **Commit and auto-deploy:**
   ```bash
   git add .
   git commit -m "feat: add article about [topic]"
   git push origin main
   # ⚡ Automatic deployment to GitHub Pages (1-2 minutes)
   # 🌐 Live at: https://index.zshipu.com/
   ```

### Batch Content Operations

**For bulk updates, fixes, or optimizations:**

1. **Create safety checkpoint:**
   ```bash
   git add .
   git commit -m "checkpoint: before batch operation"
   ```

2. **Test on sample files first:**
   ```bash
   # Example: Test batch fix on 2-3 files first
   cd ai/post/202510
   # Modify script to process only specific files
   python batch_fix.py
   # Verify results in browser
   ```

3. **Run full batch operation:**
   ```bash
   # Once tested, run on all target files
   python batch_fix.py
   # Or: python optimize_articles.py
   ```

4. **Regenerate indexes** (critical after batch changes):
   ```bash
   cd ../../..  # Back to repository root
   python scripts/generate_site_index.py
   python scripts/generate_tags_data.py  # If tags were modified
   ```

5. **Verify results:**
   ```bash
   # Check encoding
   file -I ai/post/202510/*/*.html | grep -v utf-8

   # Test in browser
   python -m http.server 8000

   # Review changes
   git diff --stat
   ```

6. **Commit and deploy:**
   ```bash
   git add .
   git commit -m "fix: batch optimize articles in ai/post/202510"
   git push origin main
   ```

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

## Working with This Codebase - Key Principles

### Before Any Changes

```bash
# Always start with fresh git status
git status

# For risky operations, create checkpoint
git add . && git commit -m "checkpoint: before [operation]"
```

### HTML Content Guidelines

**Must preserve:**
- UTF-8 encoding: `<meta charset="utf-8">`
- SEO verification meta tags (Baidu, 360, Sogou, Google)
- Existing CSS/JS resource paths (relative, not absolute)

**Always verify:**
```bash
# Check encoding (should show "charset=utf-8")
file -I path/to/file.html

# Check for localhost URLs (should return nothing)
grep -r "localhost" --include="*.html" .

# Test in browser
python -m http.server 8000
```

### Python Scripts Guidelines

**For content generation scripts (scripts/*.py):**
- No external dependencies required (uses only Python standard library)
- Run from repository root: `python scripts/[script_name].py`
- Always regenerate after bulk content changes
- Verify generated files before committing

**For domain-specific scripts (ai/post/*/batch_*.py):**
- Always test on 2-3 files before full batch
- Run from the script's directory
- Must regenerate site indexes after completion

**For upecg/ Python code:**
```bash
cd upecg
python test_ecg_preproc.py          # Run tests first
python -m py_compile *.py           # Verify syntax
# If tests pass, commit changes
```

### Deployment Safety Rules

**Critical understanding:**
- **Every push to `main` deploys to production immediately** (1-2 minutes)
- **No staging environment exists** - test locally before pushing
- **No build step** - HTML files deploy as-is from repository
- **100+ modified files is normal** after regenerating indexes

**Pre-deployment checklist:**
```bash
# 1. Local testing passed
python -m http.server 8000  # Verify in browser

# 2. No localhost URLs
grep -r "localhost" --include="*.html" . | wc -l  # Should be 0

# 3. UTF-8 encoding correct
file -I index.html  # Check critical files

# 4. Git status reviewed
git status
git diff --stat  # Understand what will deploy

# 5. Meaningful commit message
git commit -m "feat/fix/docs: clear description"

# 6. Deploy
git push origin main
```

### Common Pitfalls to Avoid

❌ **Don't:**
- Skip regenerating indexes after adding/updating articles
- Commit without testing locally first
- Use absolute paths or localhost URLs in HTML
- Run batch scripts without checkpoint commit first
- Mix encodings (must be UTF-8 for Chinese content)
- Create new top-level directories without clear purpose
- Modify `.github/workflows/static.yml` without understanding impact

✅ **Do:**
- Test every change locally before pushing
- Run `generate_site_index.py` after content changes
- Use relative paths for all internal links
- Commit checkpoints before risky operations
- Verify UTF-8 encoding for all HTML files
- Follow existing directory structure patterns
- Review git diff before pushing to production

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

### Essential Commands

**Local Development & Testing:**
```bash
# Test entire site (run from repository root)
python -m http.server 8000
# Visit: http://localhost:8000

# Test specific sub-site
cd ai && python -m http.server 8001
cd geek002 && python -m http.server 8002
cd ai1000website && python -m http.server 8003
```

**Content Management (Python 3.6+ required, no external dependencies):**
```bash
# After adding/updating articles - regenerate all indexes and sitemaps
python scripts/generate_site_index.py

# After modifying tags - regenerate tag data
python scripts/generate_tags_data.py

# Generate SEO links for homepage
python scripts/generate_homepage_seo_links.py

# Clean up obsolete tags
python scripts/cleanup_obsolete_tags.py
```

**Quality Checks:**
```bash
# Check for localhost URLs (should be none before deployment)
grep -r "localhost" --include="*.html" .

# Verify UTF-8 encoding
file -I *.html

# Check git status (often shows 100+ files after content updates - this is normal)
git status
```

**Sub-Project Commands:**
```bash
# ECG processing
cd upecg
python ecg_preproc_poc.py <image_path>     # Process ECG image
python test_ecg_preproc.py                 # Run tests

# Batch optimize articles in specific domain
cd ai/post/202510
python batch_fix.py                        # Fix common issues
python optimize_articles.py                # SEO optimization
```

### Important File Paths

**Core Site Files:**
- **Homepage**: `index.html`, `css/homepage.css`, `js/homepage.js`
- **Deployment Config**: `.github/workflows/static.yml`
- **Domain Config**: `CNAME` (contains: index.zshipu.com)

**Content Management:**
- **Scripts**: `scripts/*.py` (5 Python scripts for content generation and SEO)
  - `generate_site_index.py` (571 lines) - Main index/sitemap generator
  - `generate_tags_data.py` (127 lines) - Tag data extraction
  - `generate_homepage_seo_links.py` (505 lines) - SEO link generation
  - `generate_tags_data_enhanced.py` (461 lines) - Enhanced tag processing
  - `cleanup_obsolete_tags.py` (207 lines) - Tag cleanup

**Generated JSON Data Files:**
- **Article Indexes**: `site-links-*.json` (5 files, ~3700+ articles)
  - `site-links-full.json` - Complete article index (1MB)
  - `site-links-recent.json` - Recent 100 articles for homepage
  - `site-links-by-category.json` - Grouped by category (1.1MB)
  - `site-links-by-month.json` - Grouped by month (1.1MB)
  - `site-links-search.json` - Compressed search index (658KB)
- **Tag Data**: `site-tags*.json`, `tag-*.json` (5 files)
  - `site-tags.json` - Basic tag list
  - `site-tags-enhanced.json` - Full tag metadata (1.2MB)
  - `tag-hot.json` - Popular tags
  - `tag-categories.json` - Tag categorization
  - `tag-relations.json` - Tag relationship graph

**SEO Files:**
- **Sitemaps**: `sitemap*.xml` (8 files)
  - `sitemap.xml` - Main sitemap index
  - `sitemap-posts-ai.xml` - AI articles (252KB)
  - `sitemap-posts-geek.xml` - Tech articles (240KB)
  - `sitemap-posts-stock.xml` - Stock articles (259KB)
  - `sitemap-posts-other.xml` - Other content (73KB)
  - `sitemap-categories.xml`, `sitemap-pages.xml`, `sitemap-tags.xml`
- **SEO Fragments**: `seo-fragments/*.html` (5 HTML fragment files)
- **Search Engine Files**: `robots.txt`, `baidu_verify_code-*.html`

**Sub-Projects:**
- **AI Tools**: `ai1000website/app.js` (1700+ tools in JavaScript)
- **App Prototypes**: `app/*.html` (100+ creative app mockups)
- **ECG Processing**: `upecg/*.py` (Python image processing)
- **Documentation**: `*/CLAUDE.md` in sub-project directories

### Site URLs Structure
- Main site: `https://index.zshipu.com/`
- AI section: `https://index.zshipu.com/ai/`
- Tech section: `https://index.zshipu.com/geek/`
- Stock section: `https://index.zshipu.com/stock/`
- AI tools: `https://index.zshipu.com/ai1000website/`
- ECG section: `https://index.zshipu.com/ecg/`
- GPT section: `https://index.zshipu.com/gpt/`
- Go section: `https://index.zshipu.com/go/`
