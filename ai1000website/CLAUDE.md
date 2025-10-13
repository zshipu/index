# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static website project** that serves as a comprehensive AI tools and resources directory (知识铺 - zshipu-index). The site is deployed via **GitHub Pages** and contains curated lists of AI tools, resources, news, and educational content primarily in Chinese.

## Repository Structure

```
/
├── .github/workflows/     # GitHub Actions for static site deployment
├── ai/                    # AI tools and resources content
├── ai1000website/         # AI website resource collection (Markdown file)
├── geek/                  # Tech/developer content
├── geek001/               # Advanced tech content
├── geek002/               # Additional tech resources
├── stock/                 # Stock market related content
├── stock001/, stock002/   # Additional stock content
├── upecg/                 # ECG related content
├── weibo/                 # Weibo integration content
├── xiaoshuo/              # Novel/story content
├── ds/                    # Data science content
├── ai-bot/                # AI bot related content
├── ai-write-blog/         # AI blog writing tools
├── about/                 # About pages
├── archives/              # Archive pages
├── categories/            # Category pages
├── tags/                  # Tag pages
├── search/                # Search functionality
└── page/                  # Pagination pages
```

## Key Files

### Resource Collection
- `ai1000website/AI强大的宝藏网站.md` - Main curated list of AI tools, websites, and resources (~1700+ entries)

### GitHub Workflow
- `.github/workflows/static.yml` - Automated deployment to GitHub Pages on push to `main` branch

## Common Commands

### Deployment
The site automatically deploys when changes are pushed to the `main` branch via GitHub Actions. No manual build or deployment commands are required.

### Local Development
Since this is a static HTML site with no build process:
```bash
# Simply open any HTML file in a browser
# Or use a simple HTTP server:
python -m http.server 8000
# Then visit: http://localhost:8000
```

### Content Management
Content is primarily managed through:
- Static HTML files in various directories
- Markdown files for resource collections
- YAML/JSON configuration files in `geek002/post/` directories

## Content Organization Principles

### Directory Purpose
- **Main content directories** (`ai/`, `geek/`, `stock/`, etc.) contain generated static HTML pages
- **Numbered variants** (`geek001/`, `geek002/`, `stock001/`, etc.) represent different content versions or specialized topics
- **Special directories** (`ai-bot/`, `ai-write-blog/`) contain specific AI tool integrations

### Resource Collection Format
The main resource file (`AI强大的宝藏网站.md`) is organized into numbered sections:
1. Featured AI tools and resources
2. AI tool navigation sites
3. AI knowledge bases and news
4. Social media operations tools
5. Digital human/avatar tools
6. Resource download sites
7. AI general models
8. AI image tools
9. AI video tools
10. AI audio tools
11. AI office tools
12. Self-learning websites
13. Teacher tools
14. Games and entertainment
15. Toolbox collections

## Architecture Notes

### Static Site Generation
- This project uses **pure static HTML** - no build framework (Hugo, Jekyll, etc.)
- All pages are pre-generated HTML files
- Navigation and structure are handled through static HTML links
- No JavaScript framework dependencies

### Content Updates
When updating content:
1. Modify HTML files directly in their respective directories
2. Update the markdown resource file if adding new AI tools/resources
3. Ensure all internal links use relative paths
4. Commit and push to `main` branch for automatic deployment

### GitHub Pages Configuration
- Deployment source: Root directory (`/`)
- Branch: `main`
- No custom build process required
- Domain: Configured via `CNAME` file

## Important Constraints

### File Organization
- **Do NOT** create new top-level directories without careful consideration
- Follow the existing naming pattern for content directories
- Keep resource files in appropriate subdirectories (`post/`, `ai1000website/`)

### Static Content Management
- All HTML files are self-contained and don't rely on external build processes
- CSS files are located in `/css/` directory
- JavaScript files are in `/js/` directory
- Images and assets should be co-located with content or in shared directories

### Deployment Safety
- Changes to `.github/workflows/static.yml` affect the entire site deployment
- All pushes to `main` trigger automatic deployment to production
- Test changes locally before pushing to `main`

## Content Verification

Before committing content changes:
1. Verify all internal links use relative paths (not absolute URLs to localhost)
2. Check that Chinese characters display correctly (UTF-8 encoding)
3. Ensure HTML structure is valid (balanced tags)
4. Test navigation between pages works correctly

## Special Notes

- Primary language: **Chinese (Simplified)**
- Target audience: Chinese-speaking AI enthusiasts and professionals
- Content focus: AI tools, resources, tutorials, and news aggregation
- No backend services or databases - purely static content delivery
