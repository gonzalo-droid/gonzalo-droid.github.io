# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for a Mobile Developer with an integrated blog system. Static-first architecture optimized for GitHub Pages with client-side article rendering using Markdown.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Express server on port 8080
npx live-server .    # Alternative: static dev server
```

Deployment is automatic via GitHub Actions on push to `master` branch.

## Project Structure

```
/
├── assets/
│   ├── css/
│   │   └── style.css          # Main styles with CSS variables
│   ├── img/
│   │   ├── articles/          # Article images
│   │   └── portfolio/         # Project screenshots
│   └── js/
│       ├── components/
│       │   └── navbar.js      # Reusable navbar component
│       ├── article.js         # Single article renderer
│       ├── articles.js        # Articles list page
│       ├── home.js            # Homepage interactivity
│       └── theme.js           # Dark/light mode management
├── content/
│   ├── articles/              # Markdown article files
│   │   └── *.md
│   └── articles.json          # Article metadata
├── articles/
│   └── index.html             # Articles list page
├── article/
│   └── index.html             # Single article page
├── privacy-policy/
│   └── index.html             # Privacy policy
├── 404.html                   # GitHub Pages 404 redirect
├── index.html                 # Homepage
└── server.js                  # Local dev server
```

## Routing

**GitHub Pages (production):**
- `/` → `index.html`
- `/articles` → `articles/index.html`
- `/article/<slug>` → GitHub Pages has no server-side routing, so this request 404s first. `404.html` inspects `location.pathname`; if it matches `/article/<slug>`, it stores the slug in `sessionStorage.articleSlug` and redirects (`location.replace('/article/')`) to the real article page. `assets/js/article.js` reads the slug from `sessionStorage` (consuming it), falls back to the legacy `#slug` hash for old inbound links, and then calls `history.replaceState` so the address bar shows `/article/<slug>`. Any other unknown path shows the plain 404 UI and redirects to `/` after 3 seconds.
- `/privacy-policy` → `privacy-policy/index.html`

This is the standard GitHub-Pages-without-a-build-step SPA routing workaround. The underlying HTTP response for a fresh crawl of `/article/<slug>` is still a 404 before the client-side redirect kicks in — a fully correct fix would need per-article prerendering/SSG.

**Express.js (local development):**
- Same routes but with dynamic `:slug` parameter support (`GET /article/:slug` serves `article/index.html` directly, and `article.js` reads the slug from the path).

## Article System

- Metadata in `content/articles.json`
- Content as Markdown files in `content/articles/*.md`
- Client-side rendering with marked.js + highlight.js
- Slug generation: `title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')`

## Theme System

- CSS variables in `assets/css/style.css` (`:root` and `[data-theme="dark"]`)
- ThemeManager in `assets/js/theme.js` handles toggle and localStorage persistence
- `theme.js` loads synchronously before DOM to prevent flash
- Navbar component calls `ThemeManager.bindToggle()` after rendering

## Key Files

| File | Purpose |
|------|---------|
| `assets/js/theme.js` | Dark/light mode management |
| `assets/js/home.js` | Homepage interactivity (filters, animations, stats) |
| `assets/js/articles.js` | Articles list page loader |
| `assets/js/article.js` | Single article renderer |
| `assets/js/components/navbar.js` | Reusable navbar with mobile menu |
| `assets/css/style.css` | Main styles with CSS variables |

## Conventions

- **Language:** Spanish (es-ES locale for dates)
- **CSS classes:** kebab-case (`navbar-fixed`, `article-card`)
- **JS functions:** camelCase (`initScrollAnimations()`, `loadLatestArticles()`)
- **Data attributes:** `data-animate`, `data-filter`, `data-category`
- **Images:** WebP format with JPG fallback using `<picture>` element

## Important Patterns

1. **Scroll animations:** Elements with `data-animate` attribute are observed via Intersection Observer
2. **Portfolio filters:** Cards have `data-category` attribute (android, ios, kmm, web)
3. **Stats counter:** Numbers animate using requestAnimationFrame when visible
4. **Mobile menu:** Toggle handled by navbar.js component
5. **GitHub Pages routing:** 404.html catches `/article/slug` and redirects with sessionStorage

## Gotchas

- Article fetch paths use `/content/articles/` from root
- Theme script must stay synchronous (in `<head>`) to avoid flash
- Slug logic is duplicated in `home.js`, `articles.js`, and `article.js` - keep in sync
- Navbar component must call `ThemeManager.bindToggle()` after rendering
