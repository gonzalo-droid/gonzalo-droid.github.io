# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for Gonzalo López (web and mobile developer), aimed at **clients** first: the home page
shows projects, services and contact (WhatsApp). The recruiter material (career, CV, technical blog) lives on
its own pages. Static-first architecture optimized for GitHub Pages; article, project and experience pages are
prerendered.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Express server on port 8080
npx live-server .    # Alternative: static dev server
npm test             # node --test test/*.test.js — tokens, estilos, datos de proyectos, rutas, SEO e i18n
npm run build:pages  # prerenderiza artículos, proyectos, el listado del blog y sitemap.xml (se commitean)
npm run i18n:review  # lista traducciones y casos de proyecto pendientes de revisión humana
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
│       │   ├── navbar.js      # Navbar: GL monogram, five links, language, theme, mobile menu
│       │   └── footer.js      # Footer: same five links + ES · EN
│       ├── article.js         # Single article renderer
│       ├── carousel.js        # UMD: carousel markup + behaviour (cards and gallery), also used by the build
│       ├── home.js            # Home: scroll animations, copy-email button
│       ├── i18n.js            # ES/EN: loads the dictionary, swaps text, language switch, whenReady()
│       ├── icons.js           # Inline SVG icons (Bootstrap Icons paths)
│       ├── project-view.js    # UMD: the only renderer of the project page (browser and build)
│       ├── project.js         # Project page (/project/<slug>/): slug, SEO, delegates to ProjectView
│       ├── projects.js        # Renders the home project grid (cards with carousel) and filters
│       ├── theme.js           # Light by default + toggle; `.js` class for the animation gate
│       └── utils.js           # Shared helpers: generateSlug(), formatDate(), fetchArticles()
├── content/
│   ├── articles/              # Markdown article files
│   │   └── *.md
│   ├── i18n/
│   │   ├── es.json            # Spanish strings (extracted verbatim from the HTML)
│   │   └── en.json            # English strings + per-project copy + `_review` list
│   ├── articles.json          # Article metadata
│   ├── projects.json          # Project data: images, case, client, links
│   └── review.json            # Case texts / case translations awaiting Gonzalo's review
├── scripts/
│   ├── build-pages.js         # `npm run build:pages` — prerendering + sitemap; exports its helpers
│   └── i18n-review.js         # `npm run i18n:review` — lists drafts awaiting review
├── test/
│   ├── tokens.test.js         # Text tokens ≥ 4.5:1 (WCAG AA) on --bg and --surface; one accent; radius scale
│   ├── style.test.js          # style.css: no raw colours, radius scale only, .js animation gate
│   ├── no-token-collisions.test.js  # Fails if style.css redeclares a name defined in tokens.css
│   ├── theme.test.js          # Light by default, saved choice wins, `.js` class added
│   ├── projects.test.js       # projects.json: inventory, order, images + fit, case paragraphs, client
│   ├── carousel.test.js       # Carousel markup and behaviour (fake DOM)
│   ├── project-view.test.js   # Project page markup: paragraphs only, side panel, next project
│   ├── project-pages.test.js  # Routing, <noscript>, prerendered case, next links, build idempotence
│   ├── home.test.js           # Home sections/order, WhatsApp link, services links, fonts on every page
│   ├── experience.test.js     # /experience/ meta, CV key, timeline without JS, sitemap
│   ├── dates.test.js          # Dates don't shift a day in America/Lima
│   ├── seo.test.js            # Canonicals, JSON-LD, sitemap, blog order, internal links
│   ├── i18n.test.js           # Key parity, dangling/unused keys, untranslated strings
│   ├── i18n-ready.test.js     # I18n.whenReady() resolves, also when the dictionary fails
│   ├── review.test.js         # content/review.json only names existing slugs
│   └── helpers/contrast.js    # WCAG contrast math shared by tokens.test.js
├── articles/
│   └── index.html             # Blog list (static <ol>, written by build:pages)
├── article/
│   ├── index.html             # Single article template
│   └── <slug>/index.html      # Prerendered articles
├── project/
│   ├── index.html             # Project page template
│   └── <slug>/index.html      # Prerendered project pages
├── experience/
│   └── index.html             # Career, about, CV (static, hand-written)
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
- `/project/<slug>` → same mechanism as articles: `404.html` matches the path, stores the slug in
  `sessionStorage.projectSlug` and redirects to `/project/`, where `assets/js/project.js` reads it back and
  calls `history.replaceState`.
- `/experience/` → `experience/index.html`
- `/privacy-policy` → `privacy-policy/index.html`

`/article/<slug>/` and `/project/<slug>/` are **prerendered** by `npm run build:pages` into real folders, so
they answer 200 with full content and are in `sitemap.xml` (as is `/experience/`). The 404.html bounce is now
only a fallback for slugs that were never built.

**Express.js (local development):**
- Same routes but with dynamic `:slug` parameter support: `GET /article/:slug` serves `article/index.html`
  and `GET /project/:slug` serves `project/index.html`; the page scripts read the slug from the path.

## Article System

- Metadata in `content/articles.json`; content as Markdown in `content/articles/*.md` (Spanish only)
- Articles are prerendered by `build-pages.js`; `article.js` re-renders with marked.js + highlight.js
- The blog list `/articles/` is static HTML written by the build (newest first). There is no list JS.
- Slug generation: `generateSlug()` in `assets/js/utils.js` and its copy in `build-pages.js` (`slug.test.js`)
- Dates: `formatDate(iso)` builds the date from its parts (`new Date(y, m - 1, d)`), never `new Date(iso)`,
  which is UTC midnight and showed the previous day in Lima. `dates.test.js` runs with `TZ=America/Lima`.
- Every markdown starts with `# Title`; CSS hides that first h1 because the header already shows it.

## Project System

- Data in `content/projects.json` — 9 products in home order, each with slug, title, summary (≤ 140),
  platforms, tech, links and:
  - `images: [{ src, fit }]` — `fit` is `cover` (web screenshots, anchored top) or `contain` (store graphics,
    whole, on `--surface`). CSS can't infer it, so it is explicit. Every image needs its 600px variant in
    `assets/img/portfolio/cards/`. Vertical phone screenshots never go in (the frame is 16:10).
  - `case: { context, problem, solution, result? }` — arrays of paragraphs. The parts only order the text; the
    page shows plain consecutive paragraphs, no headings, no bullet lists.
  - `client` — optional; the side panel shows the "Cliente" row only when present.
  - `decisions` — optional, appended as a last paragraph when present.
- **`ProjectView` (`project-view.js`) is the only renderer of the project page.** `project.js` and
  `build-pages.js` both call `ProjectView.render`, so the prerendered HTML and the JS-painted one are the same.
  Its output must not contain `<article>`, `<ul>` or `<h2>`; `#projectDetail` is a `div` and the build's regex
  cuts at `</div></div></main>`. The prerendered page marks it `aria-busy="false" data-slug="<slug>"`; in
  Spanish `project.js` then only wires the carousel instead of repainting (a repaint made the gallery blink).
- `carousel.js` (`Carousel.html` / `Carousel.wire`) builds the card carousel and the gallery. With one image
  there are no controls. Card slides are links to the project; the arrows stop the click.
- `projects.js` renders the home grid (`renderCard`) and the platform filter with counts from the data
  (`.filter-btn[data-filter]` / `article.pj-card[data-category]`). The whole card links to `/project/<slug>/`.
- English: `en.json → projects[slug] = { summary, case }`, falling back to Spanish.
- The grid is painted by JS, so the `<noscript>` block inside `#proyectos` is the only thing a visitor without
  JavaScript sees. **It lists every project by hand — add a project there too, or it is invisible.**
  `test/project-pages.test.js` fails if a project in `projects.json` is missing from it.

## Design System ("Esmeralda nítida")

- **Tokens** live in `assets/css/tokens.css` — color, spacing (`--sp-1` … `--sp-10`), fonts and radii, defined
  for light (`:root`) and dark (`[data-theme="dark"]`). Palette: white / `#F6F7F5` surface, ink `#0F1A14`, a
  single green accent `#0B5D3B` (dark: `#4CB383`). There is one accent; `--accent-2` is gone.
- **`style.css` writes no raw colours.** `test/style.test.js` fails on any hex or `rgba(`; translucent fills and
  shadows use `color-mix(in srgb, var(--token) N%, transparent)`. No page loads Bootstrap CSS.
- **Contrast is enforced by a test, not by convention.** `test/tokens.test.js` fails if `--text`,
  `--text-muted` or `--accent` drops below 4.5:1 over `--bg` or `--surface`, or `--accent-fg` over `--accent`,
  in either theme. Do not lower the threshold — change the color.
- **Typography:** Newsreader (titles), IBM Plex Sans (text, nav, buttons), IBM Plex Mono (labels, dates,
  chips). Same Google Fonts `<link>` on every page (`home.test.js` checks it). Archivo/JetBrains Mono are gone.
- **Radius scale:** chips `--radius-chip` 3px · buttons `--radius` 4px · cards, gallery, side panel
  `--radius-card` 8px · filters `--radius-pill` · status dots `50%`. `style.test.js` rejects anything else.
- **Light by default.** `theme.js` ignores the system preference; dark only if the visitor chose it.
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

## Internationalisation

- `data-i18n-href` swaps an `href` (WhatsApp message, CV link). Pages that paint translated text from JS wait
  for `I18n.whenReady()` first, so raw keys never flash.
- `content/review.json` lists project cases (`cases`) and case translations (`caseTranslations`) that Claude
  drafted and Gonzalo hasn't reviewed; `npm run i18n:review` prints them with `_review`.
- `test/i18n.test.js` also fails on a key in `es.json` that no page or script uses.

- The site is bilingual **ES/EN**. All copy lives in `content/i18n/es.json` and `content/i18n/en.json`.
  The Spanish file was extracted verbatim from the HTML, so it is the source of truth for wording.
- Markup opts in with `data-i18n="key"` (textContent), `data-i18n-html` (strings containing markup, such as
  the About paragraphs), `data-i18n-aria` and `data-i18n-title`. **Wrap only the text, never a span that also
  contains an icon** — replacing the whole element deletes the icon. See the filter buttons and the article
  back link for the pattern.
- `en.json` also holds `projects[<slug>]` with the English `summary` and `case`; anything missing falls
  back to the Spanish in `projects.json`.
- **`en.json._review` lists translations that are drafts awaiting Gonzalo's review** — his bio, the
  experience descriptions, and the banner and services copy, which are his professional voice. Run `npm run i18n:review` to see them side by
  side; remove a key from that list once reviewed.
- The language switch lives in the navbar and the footer (`[data-lang-option]`), persists to `localStorage.lang` alongside
  the theme, and honours `?lang=` so the `hreflang` links work.
- **The English text appears after a brief flash of Spanish, and that is deliberate.** The HTML ships in
  Spanish and `i18n.js` swaps it once the dictionary loads. Hiding content until the translation arrives would
  reintroduce the exact bug the `.js` animation gate fixes. Do not "solve" the flash by hiding anything.
- `i18n.js` assigns `window.I18n` explicitly: a top-level `const` in a classic script is script-scoped and
  does **not** become a property of `window`, and other files check `window.I18n` before translating.
- `test/i18n.test.js` fails on key drift between the two files, on a `data-i18n` pointing at a key that does
  not exist, and on an English string identical to the Spanish one. Legitimate coincidences (job titles, month
  abbreviations) are listed individually rather than exempting a pattern, so a genuinely untranslated string
  still fails.

## Key Files

| File | Purpose |
|------|---------|
| `assets/js/theme.js` | Dark/light mode management, `.js` class for the animation gate |
| `assets/js/home.js` | Homepage interactivity (scroll animations, copy-email button) |
| `assets/js/projects.js` | Renders and filters the home project grid from `content/projects.json` |
| `assets/js/carousel.js` | Carousel markup and behaviour (UMD, shared with the build) |
| `assets/js/project-view.js` | Project page renderer (UMD, shared with the build) |
| `assets/js/article.js` | Single article renderer |
| `assets/js/utils.js` | Shared helpers: `generateSlug()`, `formatDate()`, `fetchArticles()` |
| `assets/js/project.js` | Renders the project detail page at `/project/<slug>` |
| `assets/js/i18n.js` | ES/EN dictionary loading, text swapping, language switch, hreflang |
| `assets/js/components/navbar.js` | Reusable navbar with mobile menu, theme toggle and language switch |
| `assets/css/tokens.css` | Design tokens: color, spacing, typography, shape (both themes) |
| `assets/css/style.css` | Main styles; migrated blocks consume `tokens.css` |

## Conventions

- **Language:** Spanish is the source; English is a translation layer (see Internationalisation). Dates use
  the es-ES locale. Commit messages are in Spanish, Conventional Commits format.
- **CSS classes:** kebab-case (`navbar-fixed`, `article-card`)
- **JS functions:** camelCase (`initScrollAnimations()`, `loadLatestArticles()`)
- **Data attributes:** `data-animate`, `data-filter`, `data-category`
- **Images:** WebP only, 1440×900 for galleries and a 600px variant in `cards/` (no JPG fallbacks)

## Important Patterns

1. **Scroll animations:** Elements with `data-animate` (only the three service cards today) are observed via
   Intersection Observer; see the animation rule above for how visibility is gated
2. **Project filters:** Cards have `data-category` (android, ios, kmm, web), filtered client-side in
   `assets/js/projects.js`; the active filter survives a language change
3. **Mobile menu:** navbar.js toggles `hidden` + `aria-expanded` and swaps the `list`/`x` SVG icons
4. **Prerendering:** run `npm run build:pages` after touching templates or content, and commit the output.
   Running it twice — also on another day — must leave no diff (`project-pages.test.js` checks it).
   Sitemap `lastmod` follows content: `content/lastmod.json` keeps a hash and date per page and the date only
   moves when that page's HTML changes; articles use their own date from `articles.json`.

## Gotchas

- Article fetch paths use `/content/articles/` from root
- Article images are stored under `assets/img/portfolio/`, not a separate `assets/img/articles/` folder
- Theme script must stay synchronous (in `<head>`) to avoid flash
- Navbar component must call `ThemeManager.bindToggle()` after rendering
- The `<noscript>` inside `#proyectos` lists every project by hand: add new projects there too.
- `#navbar-container` is `display: contents`; otherwise the sticky navbar would be trapped in its wrapper.
