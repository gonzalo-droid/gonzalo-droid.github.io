# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for a Mobile Developer with an integrated blog system. Static-first architecture optimized for GitHub Pages with client-side article rendering using Markdown.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Express server on port 8080
npx live-server .    # Alternative: static dev server
npm test             # node --test test/*.test.js — token contrast + projects.json validation
```

Deployment is automatic via GitHub Actions on push to `master` branch.

## Project Structure

```
/
├── assets/
│   ├── css/
│   │   ├── tokens.css         # Design tokens: color, spacing, typography, shape (both themes)
│   │   └── style.css          # Styles; migrated blocks consume tokens.css instead of raw values
│   ├── img/
│   │   └── portfolio/         # Project screenshots (article images live here too, not in a separate folder)
│   └── js/
│       ├── components/
│       │   ├── navbar.js      # Reusable navbar component
│       │   └── footer.js      # Reusable footer component
│       ├── article.js         # Single article renderer
│       ├── articles.js        # Articles list page
│       ├── home.js            # Homepage interactivity
│       ├── projects.js        # Renders the home project grid from content/projects.json
│       ├── theme.js           # Dark/light mode management + `.js` class for the animation gate
│       └── utils.js           # Shared helpers: generateSlug(), formatDate(), fetchArticles()
├── content/
│   ├── articles/              # Markdown article files
│   │   └── *.md
│   ├── articles.json          # Article metadata
│   └── projects.json          # Project data rendered by projects.js
├── test/
│   ├── tokens.test.js         # Fails the build if a text token drops below 4.5:1 (WCAG AA)
│   ├── projects.test.js       # Validates content/projects.json (required fields, unique slugs, images exist)
│   └── helpers/contrast.js    # WCAG contrast math shared by tokens.test.js
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
- Slug generation: `generateSlug()` in `assets/js/utils.js`, consumed by `home.js`, `articles.js` and `article.js`

## Project System

- Data in `content/projects.json` — 7 products (grouped by product, not by platform), each with slug, title,
  summary, platforms, tech, image, highlights and links
- `assets/js/projects.js` fetches it and renders the home project grid, including the platform filter
  (`.filter-btn[data-filter]` / `article.project-card[data-category]`)
- Cards link to `/project/<slug>`. That route does not exist yet and currently 404s — deliberate, built in a
  later plan. Do not "fix" this by removing or hiding the links.

## Design System

- **Tokens** live in `assets/css/tokens.css` — color, spacing (base-4 scale, `--sp-1` … `--sp-10`), typography
  and shape, defined once for light (`:root`) and once for dark (`[data-theme="dark"]`). Blocks of `style.css`
  that have been migrated to the design system consume these tokens instead of writing raw hex or raw
  typography px directly.
  - `index.html` no longer loads Bootstrap CSS (Bootstrap Icons are still used). `articles/index.html` and
    `article/index.html` still load Bootstrap and have not been migrated to tokens yet — that is a later plan.
    Older, not-yet-migrated selectors in `style.css` (article cards, resume/testimonials/portfolio-filter
    leftovers, the skills `.tag`/`.tech` block) still use the old CSS variables and arbitrary pixel values;
    treat those as pending migration, not as the intended design language.
- **Contrast is enforced by a test, not by convention.** `npm test` runs `test/tokens.test.js`, which fails the
  build if any text token (`--text`, `--text-muted`, `--accent`, `--accent-2` over `--bg`, and `--accent-fg`
  over `--accent`) drops below 4.5:1 (WCAG AA) in either theme. Do not lower the threshold to make a color
  choice pass — change the color.
- **Typography:** Archivo (display/UI) and JetBrains Mono (technical labels), loaded in `index.html`. Open
  Sans, Raleway and Poppins are gone from the redesigned home; `articles/index.html` and `article/index.html`
  still load the old three-family stack until they are migrated.
- **Radius rule:** components built with the tokens use only `0` (`--radius-sm`) and `4px` (`--radius`), with
  exactly two documented exceptions, each with an explanatory comment in `style.css`: `.phone` / `.phone img`
  (depicts a physical device, so it keeps a rounder radius) and `.hero-badge .dot` (a circular status
  indicator, `border-radius: 50%`). Any other radius value you find belongs to a not-yet-migrated block.
- **Animation rule — the default state must be visible; hiding is gated on `.js`.** `theme.js` adds a `js`
  class to `<html>` synchronously in `<head>`, before first paint. `style.css` only hides `[data-animate]`
  elements under `.js` *and* inside `@media (prefers-reduced-motion: no-preference)`. Never wrap a new
  animation in only the reduced-motion query — without the `.js` gate, content stays hidden when JavaScript
  fails to load or run, which is the exact bug this pattern fixes. Every new `[data-animate]` element must
  render visible with no JS and no motion preference.
- ThemeManager in `assets/js/theme.js` handles the dark/light toggle and localStorage persistence, and loads
  synchronously in `<head>` (on all of `index.html`, `articles/index.html` and `article/index.html`) to
  prevent a flash — this is also where the `.js` class above gets added.
- Navbar component calls `ThemeManager.bindToggle()` after rendering.

## Key Files

| File | Purpose |
|------|---------|
| `assets/js/theme.js` | Dark/light mode management, `.js` class for the animation gate |
| `assets/js/home.js` | Homepage interactivity (scroll animations, copy-email button) |
| `assets/js/projects.js` | Renders and filters the home project grid from `content/projects.json` |
| `assets/js/articles.js` | Articles list page loader |
| `assets/js/article.js` | Single article renderer |
| `assets/js/utils.js` | Shared helpers: `generateSlug()`, `formatDate()`, `fetchArticles()` |
| `assets/js/components/navbar.js` | Reusable navbar with mobile menu |
| `assets/css/tokens.css` | Design tokens: color, spacing, typography, shape (both themes) |
| `assets/css/style.css` | Main styles; migrated blocks consume `tokens.css` |

## Conventions

- **Language:** Spanish (es-ES locale for dates)
- **CSS classes:** kebab-case (`navbar-fixed`, `article-card`)
- **JS functions:** camelCase (`initScrollAnimations()`, `loadLatestArticles()`)
- **Data attributes:** `data-animate`, `data-filter`, `data-category`
- **Images:** WebP format with JPG fallback using `<picture>` element

## Important Patterns

1. **Scroll animations:** Elements with `data-animate` attribute are observed via Intersection Observer; see
   the Design System animation rule above for how visibility is gated
2. **Project filters:** Cards have `data-category` attribute (android, ios, kmm, web), filtered client-side by
   `initProjectFilters()` in `assets/js/projects.js`
3. **Mobile menu:** Toggle handled by navbar.js component
4. **GitHub Pages routing:** 404.html catches `/article/slug` and redirects with sessionStorage

## Gotchas

- Article fetch paths use `/content/articles/` from root
- Article images are stored under `assets/img/portfolio/`, not a separate `assets/img/articles/` folder
- Theme script must stay synchronous (in `<head>`) to avoid flash
- Navbar component must call `ThemeManager.bindToggle()` after rendering
- `/project/<slug>` links from the home project grid 404 on purpose — the route is built in a later plan
