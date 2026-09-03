# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML mockup of Weibo (微博), China's leading social media platform. The project consists of a single self-contained HTML file with embedded CSS styling.

**Purpose**: UI/UX demonstration and layout reference for a Weibo-like interface

**Technology**: Pure HTML5 + CSS3 (no JavaScript framework, no build process)

## Project Structure

- `index.html` - Single-file application containing all markup and styles
- `.claude/` - Claude Code configuration directory

## Development Workflow

### Viewing the Page
Open `index.html` directly in any modern web browser - no server required.

### Making Changes
Edit `index.html` directly. Changes are immediately visible on browser refresh.

## Architecture Notes

### Layout System
- **Three-column layout**: Left sidebar (180px) + Main content (flex) + Right sidebar (280px)
- **Fixed header**: 60px height, positioned at top with gradient background
- **Responsive breakpoints**:
  - `< 768px`: Hide left sidebar, single column
  - `< 1024px`: Hide right sidebar, two columns

### Component Organization (within single file)
1. **Header** (`.header`): Navigation bar, search, user controls
2. **Left Sidebar** (`.left-sidebar`): Navigation menu, custom groups
3. **Main Content** (`.main-content`): Post composer, content tabs, feed items
4. **Right Sidebar** (`.right-sidebar`): Hot topics/trending section

### Color Scheme
- Primary brand: `#ff8200` (orange) to `#ff4500` (red-orange gradient)
- Background: `#f6f6f6` (light gray)
- Cards: `white` with `border-radius: 5px`
- Text hierarchy: `#333` (primary), `#666` (secondary), `#999` (tertiary)

### Typography
- Font stack: `"PingFang SC", "Microsoft YaHei", sans-serif` (optimized for Chinese)
- Icon system: Unicode emoji characters (🏠 🔥 📺 etc.)

## Key Design Patterns

### Feed Items
Each post follows this structure:
- User info (avatar + name + timestamp)
- Post content (text + hashtags)
- Media grid (3-column image layout)
- Engagement actions (implied but not implemented)

### Hot Topics List
- Numbered ranking system
- "热" (hot) labels for trending items
- View counts and timestamp indicators
- Tab switching between "我的" (mine) and "热搜" (trending)

## Styling Conventions

- **Box model**: `box-sizing: border-box` globally
- **Spacing**: Consistent 15px gaps between major components
- **Hover states**: Color change to `#ff8200` for interactive elements
- **Active states**: Bold font + orange underline for selected tabs

## Limitations & Notes

- **Static mockup**: No JavaScript functionality, no data binding
- **Placeholder content**: Images represented as colored divs
- **Emoji icons**: Using Unicode characters instead of icon fonts/SVGs
- **No interactivity**: Buttons and forms are visual only
- **Chinese language**: UI text is in Simplified Chinese

## When Making Changes

1. **Maintain single-file structure**: Keep all CSS embedded in `<style>` tag
2. **Preserve responsive design**: Test changes at 768px and 1024px breakpoints
3. **Follow color system**: Use existing CSS variables/colors for consistency
4. **Keep Chinese context**: Preserve Chinese text unless explicitly asked to change
5. **Test cross-browser**: Ensure compatibility with modern browsers (Chrome, Firefox, Safari)
