# Repository Guidelines

## Project Structure & Module Organization
- Root serves static site: `index.html`, `css/`, JSON sitemaps (`site-links-*.json`, `sitemap-*.xml`).
- Content domains: `ai/`, `geek/`, `stock/`, `gpt/`, `go/`, `ecg/`, plus variants (`ai001/`, `stock001/`…).
- Utilities: `scripts/` (Python, stdlib only) for indexes/SEO; `.github/workflows/static.yml` deploys to GitHub Pages on `main`.
- Feature sub-sites: `ai1000website/`, `app/`, `fly-by/`, `weibo/`, etc. are self-contained HTML/CSS/JS.

## Build, Test, and Development Commands
- Local preview: `python -m http.server 8000` → visit `http://localhost:8000`.
- Rebuild site indexes (run after content changes):
  - `python scripts/generate_site_index.py` (JSON + XML sitemaps + robots.txt)
  - `python scripts/generate_hot_tags.py` (popular tags JSON)
  - Optional: `python scripts/generate_tags_data_enhanced.py`, `python scripts/generate_homepage_seo_links.py`
- SEO checks (optional): `python scripts/seo_health_check.py`

## Coding Style & Naming Conventions
- HTML/CSS/JS: 2-space indent; UTF-8; keep `<title>` accurate; avoid third‑party runtime deps.
- Python (in `scripts/`): snake_case files and functions; stdlib only; add docstrings for script entry points.
- Paths/names: lowercase directories; JSON/XML use kebab-case (e.g., `site-links-by-month.json`).
- Keep public URLs stable; prefer additive changes over renames.

## Testing Guidelines
- Smoke test locally with `http.server`; verify navigation pages load: `/archives/`, `/categories/`, `/tags/`.
- Validate JSON: `python -m json.tool site-links-full.json > NUL` (Windows) to catch syntax issues.
- After running scripts, spot-check sitemaps and recent links on the homepage.

## Commit & Pull Request Guidelines
- Commit style: concise imperative subject; include scope when helpful, e.g., `[scripts] regenerate indexes`, `[ai] add post`.
- PR checklist:
  - Describe changes and affected paths.
  - Link related issues (if any).
  - For UI changes, include before/after screenshots or paths to pages.
  - Confirm you ran index scripts and previewed locally.

## Security & Configuration Tips
- No build step or secrets; Pages deploys the repo as-is. Keep scripts stdlib-only.
- Large JSON files are served directly—avoid inflating sizes unnecessarily.
- Do not introduce external trackers or remote scripts without discussion.

