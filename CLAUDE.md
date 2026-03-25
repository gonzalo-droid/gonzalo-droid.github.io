# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for a Mobile Developer with an integrated blog system. Static-first architecture with client-side article rendering using Markdown.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Express server on port 8080
npx live-server .    # Alternative: static dev server
```

Deployment is automatic via GitHub Actions on push to `master` branch.

## Architecture

**Routing (Express.js `server.js`):**
- `/` → `index.html`
- `/articles` → `src/articles.html`
- `/article/:slug` → `src/article.html` (slug extracted client-side)
- `/privacy-policy` → `src/privacy-policy.html`
- `404` → `src/404.html`

**Article System:**
- Metadata in `src/articles/articles.json`
- Content as Markdown files in `src/articles/*.md`
- Client-side rendering with marked.js + highlight.js
- Slug generation: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`

**Theme System:**
- CSS variables in `assets/css/style.css` (`:root` and `[data-theme="dark"]`)
- ThemeManager in `src/js/theme.js` handles toggle and localStorage persistence
- `theme.js` loads synchronously before DOM to prevent flash

## Key Files

| File | Purpose |
|------|---------|
| `src/js/theme.js` | Dark/light mode management |
| `src/js/index.js` | Homepage interactivity (navbar, filters, animations, stats counter) |
| `src/js/articles.js` | Articles list page loader |
| `src/js/article.js` | Single article renderer |
| `assets/css/style.css` | Main styles with CSS variables (~1500 lines) |

## Conventions

- **Language:** Spanish (es-ES locale for dates)
- **CSS classes:** kebab-case (`navbar-fixed`, `article-card`)
- **JS functions:** camelCase (`initMobileNav()`, `loadLatestArticles()`)
- **Data attributes:** `data-animate`, `data-filter`, `data-category`
- **Images:** WebP format with JPG fallback using `<picture>` element

## Important Patterns

1. **Scroll animations:** Elements with `data-animate` attribute are observed via Intersection Observer
2. **Portfolio filters:** Cards have `data-category` attribute (android, ios, kmm, web)
3. **Stats counter:** Numbers animate using requestAnimationFrame when visible
4. **Mobile menu:** Toggle with hamburger icon, closes on link click

## Gotchas

- Article fetch paths use `/src/articles/` from root
- Theme script must stay synchronous (before `</head>`) to avoid flash
- Slug logic is duplicated in `index.js`, `articles.js`, and `article.js` - keep in sync
