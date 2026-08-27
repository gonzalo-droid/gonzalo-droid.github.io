# Rediseño Mecha — Plan 1: Fundaciones + Home

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sustituir el CSS heredado del template por un sistema de diseño con tokens y reconstruir la home en lenguaje Mecha, dejando el sitio desplegable al final de cada tarea.

**Architecture:** Sitio estático sin build step. Se añade `assets/css/tokens.css` como única fuente de valores y se reescribe `style.css` por encima. Bootstrap sale del CDN y su grilla se reemplaza por CSS Grid/Flexbox nativo. Los componentes `navbar.js` y `footer.js` siguen generando HTML por string, como ahora. Se introduce `node --test` (integrado en Node, sin dependencias nuevas) para lo que sí es verificable de forma automática: contraste de los tokens y forma de `projects.json`.

**Tech Stack:** HTML/CSS/JS vanilla · Node 23 (`node --test`) · Express solo para desarrollo local · Bootstrap Icons vía CDN (Bootstrap CSS se elimina)

**Spec:** `docs/superpowers/specs/2026-08-27-portfolio-redesign-design.md`

## Global Constraints

- **Sin dependencias nuevas de runtime.** `package.json` solo tiene `express`. Los tests usan `node:test` y `node:assert`, integrados.
- **Sin build step obligatorio.** El sitio se sirve tal cual desde GitHub Pages. Nada de lo que se añada puede ser requisito para que la página funcione.
- **Contraste mínimo 4.5:1** (WCAG 2.1 AA texto normal) para todo token que llegue a pintar texto, en ambos temas. Verificado por test, no a ojo.
- **Radios permitidos: solo `0` y `4px`.**
- **Escala de espaciado base 4:** `4 8 12 16 24 32 48 64 96 128` → `--sp-1` … `--sp-10`.
- **Tipografía: Archivo** (titulares e interfaz) y **JetBrains Mono** (etiquetas técnicas). Prohibidas Open Sans, Raleway y Poppins.
- **Ningún elemento puede tener `opacity: 0` como estado por defecto fuera de `@media (prefers-reduced-motion: no-preference)`.**
- **Idioma del copy: español.** El bilingüe es el Plan 3; no se anticipa nada aquí.
- **Commits en español**, formato Conventional Commits, como el resto del repo.

**Valores de color exactos (copiados del spec, no recalcular):**

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0E1013` | `#F5F5F3` |
| `--surface` | `#16191E` | `#FFFFFF` |
| `--border` | `#262A32` | `#E3E2DE` |
| `--border-strong` | `#3A3E48` | `#C9C8C3` |
| `--text` | `#E8E9EC` | `#0E1013` |
| `--text-muted` | `#8A8E99` | `#5C616C` |
| `--accent` | `#FF6B35` | `#BE4517` |
| `--accent-2` | `#8570FF` | `#5A3FD6` |
| `--accent-fg` | `#0E1013` | `#FFFFFF` |

---

## Estructura de archivos

**Se crean:**

| Archivo | Responsabilidad |
|---|---|
| `assets/css/tokens.css` | Única fuente de color, tipografía, espaciado y forma. Nadie más define valores crudos. |
| `content/projects.json` | Los 7 proyectos agrupados por producto. Hoy los datos viven incrustados en `index.html`. |
| `assets/js/projects.js` | Renderiza la grilla de proyectos de la home desde `projects.json` y aplica los filtros. |
| `test/helpers/contrast.js` | Cálculo de contraste WCAG 2.1 y parser mínimo de tokens CSS. |
| `test/tokens.test.js` | Verifica que todos los tokens de texto cumplen 4.5:1 en ambos temas. |
| `test/projects.test.js` | Verifica la forma de `projects.json` y que las imágenes referenciadas existen en disco. |
| `assets/img/portfolio/shots/*.webp` | Capturas individuales recortadas de los gráficos de Play Store, para la tira del hero. |

**Se modifican:**

| Archivo | Cambio |
|---|---|
| `assets/css/style.css` | Reescritura completa por secciones. Consume solo tokens. |
| `index.html` | Fuera Bootstrap y las clases `col-*`. Nueva estructura de home. La grilla de proyectos pasa a ser un contenedor vacío que rellena `projects.js`. |
| `assets/js/components/navbar.js` | Marca, scroll-spy, y arreglo del enlace vacío. |
| `assets/js/components/footer.js` | Texto en el enlace de privacidad (hoy está vacío). |
| `assets/js/home.js` | Se borra `initStatsCounter()` (código muerto). Se extrae la grilla de proyectos a `projects.js`. |
| `package.json` | Script `test`. |
| `CLAUDE.md` | Corregir la nota falsa sobre `generateSlug` y documentar los tokens. |

**No se tocan en este plan:** `article/`, `articles/`, `content/articles.json`, `404.html`, `server.js`, `sitemap.xml`.

> **Consecuencia importante:** durante este plan, `/articles` y `/article/<slug>` siguen usando el CSS viejo. Al reescribir `style.css` hay que mantener vivas las reglas que esas páginas usan hasta el Plan 2. Cada tarea que toque `style.css` incluye una verificación de que esas dos páginas siguen renderizando.

---

## Task 1: Test harness y tokens de color

**Files:**
- Create: `test/helpers/contrast.js`
- Create: `test/tokens.test.js`
- Create: `assets/css/tokens.css`
- Modify: `package.json`

**Interfaces:**
- Produces: `parseTokens(css, selector)` → `Map<string,string>`; `contrastRatio(hexA, hexB)` → `number`. Los usa `test/tokens.test.js`.
- Produces: `assets/css/tokens.css` define `--bg --surface --border --border-strong --text --text-muted --accent --accent-2 --accent-fg --sp-1..--sp-10 --radius --radius-sm --font-display --font-mono`. Todas las tareas posteriores consumen estos nombres y ninguna vuelve a escribir un hex.

- [ ] **Step 1: Escribir el helper de contraste**

`test/helpers/contrast.js`:

```js
// Contraste WCAG 2.1 y lectura de custom properties desde un archivo CSS.

function relativeLuminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(hexA, hexB) {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// Extrae las custom properties del primer bloque cuyo selector coincida.
function parseTokens(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector no encontrado: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const tokens = new Map();
  for (const line of body.split(';')) {
    const m = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
    if (m) tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

module.exports = { contrastRatio, parseTokens, relativeLuminance };
```

- [ ] **Step 2: Escribir el test que falla**

`test/tokens.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { contrastRatio, parseTokens } = require('./helpers/contrast');

const css = fs.readFileSync(
  path.join(__dirname, '..', 'assets', 'css', 'tokens.css'),
  'utf8'
);

const THEMES = [
  { name: 'claro', selector: ':root' },
  { name: 'oscuro', selector: '[data-theme="dark"]' },
];

// Tokens que llegan a pintar texto sobre --bg. AA texto normal = 4.5:1.
const TEXT_ON_BG = ['--text', '--text-muted', '--accent', '--accent-2'];

for (const theme of THEMES) {
  test(`tema ${theme.name}: los tokens de texto cumplen AA sobre --bg`, () => {
    const t = parseTokens(css, theme.selector);
    const bg = t.get('--bg');
    assert.ok(bg, `${theme.selector} debe definir --bg`);

    for (const token of TEXT_ON_BG) {
      const value = t.get(token);
      assert.ok(value, `${theme.selector} debe definir ${token}`);
      const ratio = contrastRatio(value, bg);
      assert.ok(
        ratio >= 4.5,
        `${token} (${value}) sobre --bg (${bg}) da ${ratio.toFixed(2)}:1, hace falta 4.5:1`
      );
    }
  });

  test(`tema ${theme.name}: el texto del botón primario cumple AA sobre --accent`, () => {
    const t = parseTokens(css, theme.selector);
    const ratio = contrastRatio(t.get('--accent-fg'), t.get('--accent'));
    assert.ok(
      ratio >= 4.5,
      `--accent-fg sobre --accent da ${ratio.toFixed(2)}:1, hace falta 4.5:1`
    );
  });

  test(`tema ${theme.name}: define la escala de espaciado completa`, () => {
    const t = parseTokens(css, theme.selector);
    if (theme.selector !== ':root') return; // la escala se define una sola vez
    for (let i = 1; i <= 10; i++) {
      assert.ok(t.get(`--sp-${i}`), `falta --sp-${i}`);
    }
  });
}
```

- [ ] **Step 3: Añadir el script de test**

En `package.json`, sustituir la línea de `test`:

```json
"test": "node --test test/"
```

- [ ] **Step 4: Ejecutar el test para verificar que falla**

Run: `npm test`
Expected: FAIL — `ENOENT` porque `assets/css/tokens.css` todavía no existe.

- [ ] **Step 5: Escribir tokens.css**

`assets/css/tokens.css`:

```css
/* Sistema de diseño Mecha — única fuente de valores.
   Ninguna otra hoja define hex, px de tipografía ni espaciados crudos. */

:root {
  /* Color — tema claro (por defecto) */
  --bg: #F5F5F3;
  --surface: #FFFFFF;
  --border: #E3E2DE;
  --border-strong: #C9C8C3;
  --text: #0E1013;
  --text-muted: #5C616C;
  --accent: #BE4517;
  --accent-2: #5A3FD6;
  --accent-fg: #FFFFFF;

  /* Espaciado — base 4 */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --sp-7: 48px;
  --sp-8: 64px;
  --sp-9: 96px;
  --sp-10: 128px;

  /* Forma — Mecha es angular */
  --radius: 4px;
  --radius-sm: 0;
  --cut: 9px; /* esquina cortada del botón primario */

  /* Tipografía */
  --font-display: "Archivo", "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;

  /* Movimiento */
  --dur: 180ms;
  --ease: cubic-bezier(0.2, 0, 0.2, 1);
}

[data-theme="dark"] {
  --bg: #0E1013;
  --surface: #16191E;
  --border: #262A32;
  --border-strong: #3A3E48;
  --text: #E8E9EC;
  --text-muted: #8A8E99;
  --accent: #FF6B35;
  --accent-2: #8570FF;
  --accent-fg: #0E1013;
}
```

- [ ] **Step 6: Ejecutar los tests para verificar que pasan**

Run: `npm test`
Expected: PASS — 6 tests.

Si alguno falla por contraste, **no bajar el umbral**: ajustar el color hasta cumplir y anotar el nuevo valor en el spec.

- [ ] **Step 7: Commit**

```bash
git add test/ assets/css/tokens.css package.json
git commit -m "feat(design): añadir tokens Mecha con test de contraste WCAG"
```

---

## Task 2: Tipografía base y carga de fuentes

**Files:**
- Modify: `index.html:30-40` (bloque de `<link>` de fuentes y Bootstrap)
- Modify: `assets/css/style.css` (cabecera: `body`, encabezados, escala)

**Interfaces:**
- Consumes: `--font-display`, `--font-mono`, `--text`, `--bg` de Task 1.
- Produces: clases `.t-display`, `.t-h1`, `.t-h2`, `.t-h3`, `.t-body`, `.t-small`, `.t-label`. Las usan todas las tareas posteriores en lugar de fijar `font-size`.

- [ ] **Step 1: Sustituir la carga de fuentes en `index.html`**

Reemplazar el `<link>` de Google Fonts actual (Open Sans + Raleway + Poppins) por:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Añadir `tokens.css` **antes** de `style.css`:

```html
<link rel="stylesheet" href="/assets/css/tokens.css">
<link rel="stylesheet" href="/assets/css/style.css">
```

**No quitar todavía el `<link>` de Bootstrap** — eso es la Task 8, cuando el HTML ya no dependa de sus clases.

- [ ] **Step 2: Escribir la escala tipográfica en `style.css`**

Sustituir el bloque `# Base Styles` actual por:

```css
body {
  font-family: var(--font-display);
  font-size: 1rem;
  line-height: 1.65;
  color: var(--text);
  background-color: var(--bg);
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}

h1, h2, h3, h4, h5, h6 { font-family: var(--font-display); }

.t-display {
  font-size: clamp(2.75rem, 8vw, 5.5rem);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.93;
  text-transform: uppercase;
}

.t-h1 {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1;
  text-transform: uppercase;
}

.t-h2 {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  letter-spacing: -0.025em;
}

.t-h3 { font-size: 1.25rem; font-weight: 700; }
.t-body { font-size: 1rem; line-height: 1.65; color: var(--text-muted); }
.t-small { font-size: 0.875rem; color: var(--text-muted); }

.t-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--accent);
}
```

- [ ] **Step 3: Verificar en el navegador**

```bash
npm start
```

Abrir la preview y comprobar:
- El texto del sitio ya no usa Open Sans/Raleway/Poppins (inspeccionar `computed font-family` del `body` → debe decir Archivo).
- No hay errores en consola.
- `/articles` y `/article/<slug>` siguen renderizando (todavía con estilos viejos, pero sin romperse).

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat(design): escala tipográfica fluida con Archivo y JetBrains Mono"
```

---

## Task 3: Navbar y footer en Mecha

**Files:**
- Modify: `assets/js/components/navbar.js`
- Modify: `assets/js/components/footer.js:16`
- Modify: `assets/css/style.css` (secciones `.navbar-*` y `#footer`)

**Interfaces:**
- Consumes: tokens de Task 1, clases `.t-label` de Task 2.
- Produces: `NavbarComponent.initScrollSpy()`, llamada desde `NavbarComponent.render()`. Marca con `.active` el enlace cuya sección esté visible.

- [ ] **Step 1: Añadir marca y arreglar el enlace vacío del footer**

En `footer.js`, el enlace de privacidad está vacío. Sustituir:

```js
<div class="privacy">
    <a href="/privacy-policy" target="_blank"></a>
</div>
```

por:

```js
<div class="privacy">
    <a href="/privacy-policy">Política de privacidad</a>
</div>
```

Se quita también el `target="_blank"`: es una página del propio sitio, no hay motivo para abrirla en otra pestaña.

- [ ] **Step 2: Añadir la marca a la navbar**

En `navbar.js`, dentro de `getHTML()`, añadir antes de `<div class="navbar-right">`:

```js
<a href="/" class="navbar-brand-link">GONZALO<span>_</span></a>
```

Hoy la navbar no tiene marca ni enlace a la home.

- [ ] **Step 3: Implementar scroll-spy**

Añadir al objeto `NavbarComponent`:

```js
// Marca como activo el enlace de la sección visible. Solo aplica en la home,
// donde los enlaces son anclas (#about, #portfolio, ...).
initScrollSpy() {
    if (window.location.pathname !== '/') return;

    const anchors = Array.from(
        document.querySelectorAll('.navbar-links a[href^="/#"], .navbar-mobile a[href^="/#"]')
    );
    if (anchors.length === 0) return;

    const byId = new Map();
    for (const a of anchors) {
        const id = a.getAttribute('href').slice(2);
        if (!byId.has(id)) byId.set(id, []);
        byId.get(id).push(a);
    }

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            for (const list of byId.values()) {
                list.forEach((a) => a.classList.remove('active'));
            }
            (byId.get(entry.target.id) || []).forEach((a) => a.classList.add('active'));
        }
    }, { rootMargin: '-45% 0px -50% 0px' });

    for (const id of byId.keys()) {
        const section = document.getElementById(id);
        if (section) observer.observe(section);
    }
},
```

Llamarla al final de `render()`, junto a `ThemeManager.bindToggle()`.

- [ ] **Step 4: Estilar navbar y footer en `style.css`**

```css
.navbar-fixed {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 997;
  display: flex;
  align-items: center;
  padding: var(--sp-3) var(--sp-5);
  background: transparent;
  border-bottom: 1px solid transparent;
  transition: background var(--dur) var(--ease), border-color var(--dur) var(--ease);
}

.navbar-fixed.scrolled {
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(10px);
  border-bottom-color: var(--border);
}

.navbar-brand-link {
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text);
  margin-right: auto;
}

.navbar-brand-link span { color: var(--accent); }

.navbar-links a {
  position: relative;
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: var(--sp-2) 0;
}

.navbar-links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width var(--dur) var(--ease);
}

.navbar-links a:hover,
.navbar-links a.active { color: var(--text); }
.navbar-links a.active::after { width: 100%; }

#footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: var(--sp-6) var(--sp-5);
  color: var(--text-muted);
}

#footer a { color: var(--text-muted); }
#footer a:hover { color: var(--accent); }

.back-to-top {
  border-radius: var(--radius);
  background: var(--accent);
  color: var(--accent-fg);
}
```

- [ ] **Step 5: Verificar en el navegador**

```bash
npm start
```

- La navbar muestra "GONZALO_" a la izquierda, con el guion bajo en naranja.
- Al hacer scroll por la home, el enlace correspondiente a la sección visible se subraya en naranja y ninguno más.
- El footer muestra "Política de privacidad" como texto visible y el enlace lleva a `/privacy-policy`.
- Cambiar de tema claro/oscuro: la navbar y el footer siguen legibles en ambos.

- [ ] **Step 6: Commit**

```bash
git add assets/js/components/ assets/css/style.css
git commit -m "feat(nav): marca, scroll-spy y arreglo del enlace vacío del footer"
```

---

## Task 4: Recortar las capturas para el hero

**Files:**
- Create: `assets/img/portfolio/shots/quote-anime.webp`
- Create: `assets/img/portfolio/shots/autotest.webp`
- Create: `assets/img/portfolio/shots/ulearning.webp`
- Create: `assets/img/portfolio/shots/cixcash.webp`

**Interfaces:**
- Produces: cuatro capturas verticales individuales, sin fondo de marketing ni títulos incrustados, que consume la tira del hero en Task 5.

**Contexto:** los originales en `assets/img/portfolio/` son gráficos de ficha de Play Store: teléfonos ya compuestos sobre un fondo de color con logo y título encima. Hay que extraer un solo teléfono de cada uno.

- [ ] **Step 1: Inspeccionar cada original y anotar las coordenadas del recorte**

```bash
sips -g pixelWidth -g pixelHeight assets/img/portfolio/app_quote_anime.webp
```

Abrir cada imagen y localizar el teléfono más legible. Anotar `x`, `y`, `ancho`, `alto` del recorte. Los cuatro originales y sus tamaños:

| Original | Tamaño |
|---|---|
| `app_quote_anime.webp` | 1024×500 |
| `app_autotest.webp` | 800×567 |
| `app_ulearning.webp` | 800×505 |
| `app_cixcash.webp` | 800×567 |

- [ ] **Step 2: Recortar**

`sips` recorta desde el centro, así que para un recorte descentrado hay que desplazar con `--cropOffset`. Por cada imagen:

```bash
mkdir -p assets/img/portfolio/shots
sips --cropOffset <dy> <dx> -c <alto> <ancho> \
  assets/img/portfolio/app_quote_anime.webp \
  --out assets/img/portfolio/shots/quote-anime.webp
```

Repetir para las otras tres con sus coordenadas.

- [ ] **Step 3: Verificar cada recorte visualmente**

Abrir los cuatro archivos generados y comprobar, uno por uno:
- Se ve un único teléfono completo, sin cortes por los bordes.
- No queda fondo de marketing (morado, coral o blanco) alrededor.
- No queda texto incrustado del gráfico original.
- La proporción es aproximadamente vertical (alto > ancho).

**Si un recorte no da la calidad suficiente** (queda pixelado o el teléfono está cortado), no forzarlo: anotarlo y usar ese proyecto en la tira del hero con la tarjeta genérica en lugar del marco de teléfono. El spec ya contempla esta salida en su tabla de riesgos.

- [ ] **Step 4: Commit**

```bash
git add assets/img/portfolio/shots/
git commit -m "chore(img): recortar capturas individuales para la tira del hero"
```

---

## Task 5: Datos de proyectos y grilla

**Files:**
- Create: `content/projects.json`
- Create: `test/projects.test.js`
- Create: `assets/js/projects.js`
- Modify: `index.html` (sección `#portfolio`)
- Modify: `assets/css/style.css`

**Interfaces:**
- Consumes: `generateSlug()` de `assets/js/utils.js` (ya existe y ya se carga en `index.html`).
- Produces: `renderProjects(container, projects)` e `initProjectFilters()` en `assets/js/projects.js`. El Plan 2 los reutiliza para las páginas de detalle.
- Produces: el esquema de `content/projects.json`, que el Plan 2 lee para generar `/project/<slug>`.

- [ ] **Step 1: Escribir el test que falla**

`test/projects.test.js`:

```js
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const projects = JSON.parse(
  fs.readFileSync(path.join(root, 'content', 'projects.json'), 'utf8')
);

const PLATFORMS = ['android', 'ios', 'kmm', 'web'];

test('hay exactamente 7 proyectos agrupados por producto', () => {
  assert.strictEqual(projects.length, 7);
});

test('cada proyecto tiene los campos obligatorios', () => {
  for (const p of projects) {
    assert.ok(p.slug, `falta slug en ${p.title}`);
    assert.ok(p.title, 'falta title');
    assert.ok(p.summary, `falta summary en ${p.title}`);
    assert.ok(Array.isArray(p.platforms) && p.platforms.length > 0, `falta platforms en ${p.title}`);
    assert.ok(Array.isArray(p.tech) && p.tech.length > 0, `falta tech en ${p.title}`);
    assert.ok(p.image, `falta image en ${p.title}`);
  }
});

test('el resumen de la tarjeta cabe en una línea', () => {
  for (const p of projects) {
    assert.ok(
      p.summary.length <= 120,
      `el summary de ${p.title} tiene ${p.summary.length} caracteres, máximo 120`
    );
  }
});

test('los slugs son únicos', () => {
  const slugs = projects.map((p) => p.slug);
  assert.strictEqual(new Set(slugs).size, slugs.length);
});

test('las plataformas son valores conocidos', () => {
  for (const p of projects) {
    for (const platform of p.platforms) {
      assert.ok(PLATFORMS.includes(platform), `plataforma desconocida "${platform}" en ${p.title}`);
    }
  }
});

test('las imágenes referenciadas existen en disco', () => {
  for (const p of projects) {
    const referenced = [p.image, ...(p.gallery || [])];
    if (p.shot) referenced.push(p.shot); // shot es opcional: solo los del hero
    for (const img of referenced) {
      const file = path.join(root, img.replace(/^\//, ''));
      assert.ok(fs.existsSync(file), `no existe la imagen ${img} (proyecto ${p.title})`);
    }
  }
});

test('el bloque de decisiones técnicas es opcional', () => {
  for (const p of projects) {
    if ('decisions' in p) {
      assert.strictEqual(typeof p.decisions, 'string');
    }
  }
});
```

- [ ] **Step 2: Ejecutar el test para verificar que falla**

Run: `npm test`
Expected: FAIL — `ENOENT`, `content/projects.json` no existe.

- [ ] **Step 3: Escribir `content/projects.json`**

Los datos salen de las 11 tarjetas actuales de `index.html`, agrupadas en 7 productos según la tabla del spec. `summary` es una línea; todo lo demás que hoy está en la tarjeta (`project-features`) pasa a `highlights`, que solo se muestra en la página de detalle del Plan 2.

`decisions` se omite deliberadamente: es el bloque que solo puede escribir Gonzalo, y la página lo oculta si falta.

```json
[
  {
    "slug": "quote-anime",
    "title": "Quote Anime",
    "summary": "Frases de anime con widget, notificaciones diarias y modo offline.",
    "platforms": ["android", "ios"],
    "tech": ["Kotlin", "Compose", "Swift", "Room", "Firebase", "Glance Widget", "WorkManager"],
    "image": "/assets/img/portfolio/app_quote_anime.webp",
    "shot": "/assets/img/portfolio/shots/quote-anime.webp",
    "highlights": [
      "Catálogo de frases organizado por categorías de anime",
      "Favoritos accesibles sin conexión",
      "Widget de frase aleatoria en la pantalla de inicio",
      "Notificaciones diarias a la hora que elija el usuario",
      "Compartir frases como imagen con diseño propio"
    ],
    "links": [
      { "label": "Play Store", "url": "https://play.google.com/store/apps/details?id=com.gondroid.quoteanime" },
      { "label": "App Store", "url": "https://apps.apple.com/pe/app/quoteanime-frases-de-anime/id6762100338?l=en-GB" },
      { "label": "Web", "url": "https://www.animequote.app/" }
    ]
  },
  {
    "slug": "autotest-licencia",
    "title": "AutoTest Licencia",
    "summary": "Simulacros y balotarios para el examen de licencia de conducir.",
    "platforms": ["android"],
    "tech": ["Kotlin", "Compose", "Clean Architecture", "MVVM", "Room", "Firebase"],
    "image": "/assets/img/portfolio/app_autotest.webp",
    "shot": "/assets/img/portfolio/shots/autotest.webp",
    "highlights": [
      "Simulacros de evaluación realistas",
      "Descarga y compartición de balotarios en PDF por categoría",
      "Acceso a las distintas categorías del examen",
      "Estadísticas de progreso"
    ],
    "links": [
      { "label": "Play Store", "url": "https://play.google.com/store/apps/details?id=com.gondroid.mtcquiz" }
    ]
  }
]
```

Los cinco restantes, completos. Los `summary` son reescrituras de una línea de las
descripciones actuales; `tech` fusiona las de todas las versiones de cada producto
agrupado, sin repetidos:

```json
  {
    "slug": "cixcash",
    "title": "CixCash App",
    "summary": "Conversión de criptomonedas y divisas en Kotlin Multiplatform, con registro de transacciones.",
    "platforms": ["kmm"],
    "tech": ["KMM", "Kotlin", "Compose", "Koin", "Ktor"],
    "image": "/assets/img/portfolio/app_cixcash.webp",
    "shot": "/assets/img/portfolio/shots/cixcash.webp",
    "highlights": [],
    "links": [
      { "label": "Ver código", "url": "https://github.com/gonzalo-droid/cixCashApp" }
    ]
  },
  {
    "slug": "note-ai",
    "title": "Note.AI",
    "summary": "Notas de voz con transcripción automática usando OpenAI Whisper.",
    "platforms": ["android"],
    "tech": ["Kotlin", "Compose", "Room", "Firebase", "MVVM"],
    "image": "/assets/img/portfolio/app_noteai.webp",
    "highlights": [],
    "links": [
      { "label": "Ver código", "url": "https://github.com/gonzalo-droid/NoteAI" }
    ]
  },
  {
    "slug": "u-learning",
    "title": "U-Learning",
    "summary": "Plataforma educativa para cursos online, en Android, iOS y navegador.",
    "platforms": ["android", "ios", "web"],
    "tech": ["Kotlin", "Swift", "MVI", "StateFlow", "Hilt", "UIKit", "Angular", "Laravel", "AWS"],
    "image": "/assets/img/portfolio/app_ulearning.webp",
    "shot": "/assets/img/portfolio/shots/ulearning.webp",
    "gallery": [
      "/assets/img/portfolio/app_ulearning.webp",
      "/assets/img/portfolio/app_ulearning_ios.webp",
      "/assets/img/portfolio/web_ulearning.webp"
    ],
    "highlights": [
      "App Android con MVI, StateFlow/SharedFlow y testing con Mockito",
      "App iOS en Swift y UIKit, distribuida por TestFlight",
      "Plataforma web y administrativa sobre AWS EC2 con despliegue continuo"
    ],
    "links": []
  },
  {
    "slug": "admin-lotes",
    "title": "Admin Lotes",
    "summary": "Gestión de proyectos inmobiliarios multiempresa, con app de campo para asesores.",
    "platforms": ["android", "web"],
    "tech": ["Kotlin", "MVP", "Retrofit", "Dagger 2", "Firebase", "Laravel", "Vue", "MySQL"],
    "image": "/assets/img/portfolio/app_erp.webp",
    "gallery": [
      "/assets/img/portfolio/app_erp.webp",
      "/assets/img/portfolio/web_erp.webp"
    ],
    "highlights": [
      "Seguimiento de lotes para asesores de venta en campo",
      "Contratos, facturación electrónica y ventas en la plataforma web",
      "Arquitectura por capas con SOLID e inyección de dependencias"
    ],
    "links": []
  },
  {
    "slug": "solti-crm",
    "title": "Solti-CRM",
    "summary": "CRM comercial con seguimiento de clientes en pre-venta y post-venta.",
    "platforms": ["android", "web"],
    "tech": ["Java", "MVC", "Volley", "Firebase", "Laravel", "JavaScript", "MySQL"],
    "image": "/assets/img/portfolio/app_crm.webp",
    "gallery": [
      "/assets/img/portfolio/app_crm.webp",
      "/assets/img/portfolio/web_crm.webp"
    ],
    "highlights": [
      "Registro de clientes, llamadas, correos y ubicación con servicios de Google",
      "Seguimiento comercial en pre-venta y post-venta desde la web"
    ],
    "links": []
  }
```

`note-ai`, `admin-lotes` y `solti-crm` no llevan `shot`: la Task 4 solo recorta capturas
para los cuatro proyectos de la tira del hero. El campo es opcional.

- [ ] **Step 4: Ejecutar los tests para verificar que pasan**

Run: `npm test`
Expected: PASS — los 7 tests de proyectos más los 6 de tokens.

Si falla "las imágenes referenciadas existen en disco", revisar que los `shot` apunten a archivos generados en Task 4. Si algún recorte se descartó allí, quitar su campo `shot` (es opcional).

- [ ] **Step 5: Escribir `assets/js/projects.js`**

```js
// Renderiza la grilla de proyectos de la home desde content/projects.json.

async function fetchProjects() {
    const response = await fetch('/content/projects.json');
    if (!response.ok) throw new Error('Error cargando proyectos');
    return response.json();
}

const PLATFORM_LABELS = {
    android: 'Android',
    ios: 'iOS',
    kmm: 'KMM',
    web: 'Web',
};

function renderProjects(container, projects) {
    container.innerHTML = projects.map((p) => `
        <article class="project-card" data-category="${p.platforms.join(',')}">
            <a class="project-card-image" href="/project/${p.slug}">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
                <span class="project-card-platform t-label">
                    ${p.platforms.map((x) => PLATFORM_LABELS[x]).join(' · ')}
                </span>
            </a>
            <div class="project-card-content">
                <h3 class="t-h3"><a href="/project/${p.slug}">${p.title}</a></h3>
                <p class="t-small">${p.summary}</p>
                <div class="project-tech">
                    ${p.tech.slice(0, 3).map((t) => `<span>${t}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            cards.forEach((card) => {
                const match = filter === 'all' || card.dataset.category.split(',').includes(filter);
                card.hidden = !match;
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    try {
        renderProjects(container, await fetchProjects());
        initProjectFilters();
    } catch (err) {
        container.innerHTML = '<p class="t-small">No se pudieron cargar los proyectos.</p>';
        console.error(err);
    }
});
```

Nota: los filtros usan `hidden` en lugar de `style.display`, para que el estado sea legible desde el DOM y no dependa de CSS inline.

- [ ] **Step 6: Sustituir la sección `#portfolio` en `index.html`**

Borrar las 11 tarjetas escritas a mano y dejar:

```html
<section id="portfolio" class="section">
    <div class="container">
        <div class="section-title">
            <h2 class="t-h1">Proyectos</h2>
        </div>

        <div class="portfolio-filters">
            <button class="filter-btn active" data-filter="all">Todos</button>
            <button class="filter-btn" data-filter="android">Android</button>
            <button class="filter-btn" data-filter="ios">iOS</button>
            <button class="filter-btn" data-filter="kmm">KMM</button>
            <button class="filter-btn" data-filter="web">Web</button>
        </div>

        <div class="projects-grid" id="projectsGrid"></div>
    </div>
</section>
```

Añadir el script antes de `home.js`:

```html
<script src="/assets/js/projects.js"></script>
```

- [ ] **Step 7: Estilar la grilla y la tarjeta**

```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sp-4);
}

.project-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease);
}

.project-card:hover { border-color: var(--accent); }

.project-card-image {
  display: block;
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.project-card-image img { width: 100%; height: 100%; object-fit: cover; }

.project-card-platform {
  position: absolute;
  top: var(--sp-2);
  left: var(--sp-2);
  background: color-mix(in srgb, var(--bg) 78%, transparent);
  padding: var(--sp-1) var(--sp-2);
  color: var(--text);
}

.project-card-content { padding: var(--sp-4); }
.project-card-content h3 { margin: 0 0 var(--sp-1); }
.project-card-content h3 a { color: var(--text); }

.project-tech { display: flex; flex-wrap: wrap; gap: var(--sp-1); margin-top: var(--sp-3); }

.project-tech span {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: var(--sp-1) var(--sp-2);
}

.portfolio-filters { display: flex; flex-wrap: wrap; gap: var(--sp-2); margin-bottom: var(--sp-5); }

.filter-btn {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border);
  padding: var(--sp-2) var(--sp-3);
  cursor: pointer;
  transition: all var(--dur) var(--ease);
}

.filter-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accent-fg);
  font-weight: 600;
}
```

- [ ] **Step 8: Verificar en el navegador**

```bash
npm start
```

- Se ven **7 tarjetas**, no 11.
- Cada tarjeta muestra imagen, badge de plataforma, título, una línea y exactamente 3 chips.
- Los filtros ocultan y muestran correctamente; "Todos" las devuelve todas.
- Los enlaces a `/project/<slug>` todavía dan 404 — es esperado, las páginas llegan en el Plan 2.
- Sin errores en consola.

- [ ] **Step 9: Commit**

```bash
git add content/projects.json test/projects.test.js assets/js/projects.js index.html assets/css/style.css
git commit -m "feat(proyectos): agrupar por producto y renderizar desde projects.json"
```

---

## Task 6: Hero showcase

**Files:**
- Modify: `index.html` (sección `#hero`)
- Modify: `assets/css/style.css`

**Interfaces:**
- Consumes: las capturas de Task 4 y los tokens de Task 1.

- [ ] **Step 1: Sustituir el markup del hero**

```html
<section id="hero" class="hero">
    <div class="container hero-inner">
        <p class="hero-badge"><span class="dot"></span>Disponible para remoto</p>

        <h1 class="t-display">Gonzalo<br>López</h1>

        <p class="hero-role"><strong>Android Developer</strong> · Kotlin · Compose · KMM</p>
        <p class="hero-pitch t-body">
            5 años construyendo apps en producción. Hoy en banca, para millones de usuarios.
        </p>

        <div class="hero-cta">
            <a class="btn-primary" href="#portfolio">Ver proyectos</a>
            <a class="btn-secondary" href="https://drive.google.com/file/d/1aNYpEk3DXCDbyXXamSAKisFue7hUL8C6/view?usp=sharing" target="_blank" rel="noopener">CV</a>
        </div>

        <div class="hero-shots" aria-hidden="true">
            <figure class="phone"><img src="/assets/img/portfolio/shots/autotest.webp" alt="" loading="lazy"></figure>
            <figure class="phone phone-lg"><img src="/assets/img/portfolio/shots/quote-anime.webp" alt="" loading="lazy"></figure>
            <figure class="phone phone-lg"><img src="/assets/img/portfolio/shots/ulearning.webp" alt="" loading="lazy"></figure>
            <figure class="phone"><img src="/assets/img/portfolio/shots/cixcash.webp" alt="" loading="lazy"></figure>
        </div>
    </div>
</section>
```

El botón del CV apunta **de momento** al Drive actual. Se sustituye por `/cv-es.pdf` en el Plan 3, cuando exista el archivo. La tira lleva `aria-hidden="true"` porque es decorativa: los proyectos ya están enumerados y enlazados más abajo.

- [ ] **Step 2: Estilar el hero**

```css
.hero {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  padding: var(--sp-9) 0 var(--sp-7);
  background: var(--bg);
  overflow: hidden;
}

/* Grilla técnica */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(color-mix(in srgb, var(--text) 4%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--text) 4%, transparent) 1px, transparent 1px);
  background-size: 26px 26px;
}

/* Corte a 45º */
.hero::after {
  content: "";
  position: absolute;
  right: -140px;
  top: -160px;
  width: 460px;
  height: 460px;
  background: var(--accent-2);
  opacity: 0.14;
  transform: rotate(45deg);
}

.hero-inner { position: relative; z-index: 2; }

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.13em;
  text-transform: uppercase;
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  padding: var(--sp-1) var(--sp-3);
  margin-bottom: var(--sp-4);
}

.hero-badge .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.hero h1 { margin: 0 0 var(--sp-3); color: var(--text); }
.hero-role { color: var(--text); margin: 0 0 var(--sp-2); }
.hero-pitch { max-width: 46ch; margin: 0 0 var(--sp-5); }

.hero-cta { display: flex; flex-wrap: wrap; gap: var(--sp-2); }

.btn-primary {
  background: var(--accent);
  color: var(--accent-fg);
  font-weight: 700;
  padding: var(--sp-3) var(--sp-5);
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%);
}

.btn-secondary {
  color: var(--text);
  border: 1px solid var(--border-strong);
  font-weight: 600;
  padding: var(--sp-3) var(--sp-5);
}

.btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

.hero-shots {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: var(--sp-3);
  margin-top: var(--sp-7);
}

.phone {
  margin: 0;
  width: 104px;
  padding: 3px;
  background: var(--surface);
  border: 2px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 18px 40px rgb(0 0 0 / 45%);
}

.phone-lg { width: 128px; }
.phone img { display: block; width: 100%; border-radius: 9px; }

@media (max-width: 640px) {
  .hero-shots { gap: var(--sp-2); }
  .phone { width: 68px; }
  .phone-lg { width: 82px; }
}
```

El `border-radius: 12px` de `.phone` es una excepción justificada a la regla de radios: representa un objeto físico (un teléfono), no un elemento de interfaz. Documentarlo con un comentario en el CSS.

- [ ] **Step 3: Verificar en el navegador**

```bash
npm start
```

- El hero ocupa la primera pantalla completa; el badge, el nombre, el rol, el pitch y los dos CTAs se ven **sin hacer scroll** a 1440×900 y a 390×844.
- La tira de teléfonos se ve por debajo, con el segundo y el tercero más grandes.
- No hay scroll horizontal en móvil.
- Alternar tema: la grilla y el corte morado siguen visibles y sutiles en claro.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat(hero): showcase con badge de disponibilidad y tira de capturas"
```

---

## Task 7: Resto de secciones de la home

**Files:**
- Modify: `index.html` (secciones `#about`, `#experience`, `#articles`, `#contact`)
- Modify: `assets/css/style.css`
- Modify: `assets/js/home.js`

**Interfaces:**
- Consumes: `loadLatestArticles()` de `home.js`, que ya existe y ya funciona.

- [ ] **Step 1: Reordenar las secciones en `index.html`**

El orden pasa a ser: `#hero` → `#portfolio` → `#about` → `#experience` → `#articles` → `#contact`.

Hoy `#about` va antes que `#portfolio`. Mover el bloque completo de `#about` para que quede después de `#portfolio`.

Quitar `class="section-bg"` de `#experience`, `#portfolio` y `#articles`: hoy las tres la llevan seguidas, así que la alternancia de fondos no separa nada. La separación pasa a ser el borde superior de cada sección.

- [ ] **Step 2: Sustituir la sección de contacto**

Hoy son cuatro enlaces sociales, dos de ellos Instagram, y no hay email.

```html
<section id="contact" class="section">
    <div class="container">
        <div class="contact-card">
            <div>
                <h2 class="t-h2">¿Hablamos?</h2>
                <p class="contact-mail">
                    <a href="mailto:gonzalo.lozg@gmail.com">gonzalo.lozg@gmail.com</a>
                    <button type="button" class="copy-mail" data-mail="gonzalo.lozg@gmail.com">Copiar</button>
                </p>
            </div>
            <a class="btn-primary" href="https://drive.google.com/file/d/1aNYpEk3DXCDbyXXamSAKisFue7hUL8C6/view?usp=sharing" target="_blank" rel="noopener">Descargar CV</a>
        </div>

        <ul class="contact-social">
            <li><a href="https://www.linkedin.com/in/gonzalo-lozg/" target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href="https://github.com/gonzalo-droid" target="_blank" rel="noopener">GitHub</a></li>
            <li><a href="https://www.instagram.com/gonzalo.lozg/" target="_blank" rel="noopener">Instagram</a></li>
            <li><a href="https://www.tiktok.com/@gonzalodroid" target="_blank" rel="noopener">TikTok</a></li>
            <li><a href="https://www.youtube.com/@GonzaloDroid2050" target="_blank" rel="noopener">YouTube</a></li>
        </ul>
    </div>
</section>
```

- [ ] **Step 3: Implementar el botón de copiar en `home.js`**

Añadir:

```js
function initCopyMail() {
    const button = document.querySelector('.copy-mail');
    if (!button) return;

    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(button.dataset.mail);
            const original = button.textContent;
            button.textContent = 'Copiado';
            setTimeout(() => { button.textContent = original; }, 2000);
        } catch {
            // Sin permiso de portapapeles: el enlace mailto de al lado sigue funcionando.
            button.textContent = 'Usa el enlace';
        }
    });
}
```

Llamarla desde el `DOMContentLoaded` existente.

- [ ] **Step 4: Borrar el código muerto**

En `home.js`, eliminar por completo `initStatsCounter()` (línea 89) y su llamada. Anima `.stat-number[data-count]`, markup que no existe en ninguna página del sitio.

Eliminar también de `home.js` la lógica de filtros de portfolio, que se movió a `projects.js` en Task 5.

- [ ] **Step 5: Estilar experiencia, contacto y secciones**

```css
.section { padding: var(--sp-9) 0; border-top: 1px solid var(--border); }
.section-title { margin-bottom: var(--sp-6); }
.container { width: min(1120px, 100% - var(--sp-6)); margin-inline: auto; }

/* Timeline */
.timeline { border-left: 1px solid var(--border); margin-left: var(--sp-2); }

.timeline-item { position: relative; padding: 0 0 var(--sp-6) var(--sp-5); }

.timeline-item::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 6px;
  width: 9px;
  height: 9px;
  background: var(--accent);
  transform: rotate(45deg);
}

.timeline-period, .timeline-year {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.timeline-tech { display: flex; flex-wrap: wrap; gap: var(--sp-1); margin-top: var(--sp-2); }

.timeline-tech span {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
  border: 1px solid var(--border);
  padding: var(--sp-1) var(--sp-2);
}

/* Contacto */
.contact-card {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4);
  align-items: center;
  justify-content: space-between;
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  padding: var(--sp-5) var(--sp-6);
}

.contact-mail { display: flex; align-items: center; gap: var(--sp-3); margin: var(--sp-2) 0 0; }
.contact-mail a { font-family: var(--font-mono); color: var(--text); }

.copy-mail {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border);
  padding: var(--sp-1) var(--sp-2);
  cursor: pointer;
}

.copy-mail:hover { border-color: var(--accent); color: var(--accent); }

.contact-social {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-4);
  list-style: none;
  padding: 0;
  margin: var(--sp-4) 0 0;
}

.contact-social a {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.contact-social a:hover { color: var(--accent); }
```

- [ ] **Step 6: Verificar en el navegador**

```bash
npm start
```

- El orden de secciones es hero → proyectos → sobre mí → experiencia → blog → contacto.
- No hay dos secciones seguidas con el mismo fondo gris; la separación es el borde superior.
- El botón "Copiar" deja el email en el portapapeles y muestra "Copiado" durante 2 segundos.
- La sección de blog sigue cargando los 3 últimos artículos (`loadLatestArticles()` no se tocó).
- Consola sin errores, y sin referencias a `initStatsCounter`.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/css/style.css assets/js/home.js
git commit -m "feat(home): reordenar secciones, contacto con email copiable y borrar código muerto"
```

---

## Task 8: Quitar Bootstrap y cerrar el bug de las animaciones

**Files:**
- Modify: `index.html` (cabecera y clases `col-*`, `d-flex`, `row`)
- Modify: `assets/css/style.css` (bloque `[data-animate]`)

**Interfaces:**
- Consumes: todo lo anterior. Es la tarea que deja la home sin dependencia de Bootstrap.

- [ ] **Step 1: Localizar todas las clases de Bootstrap en `index.html`**

```bash
grep -o 'class="[^"]*"' index.html | grep -oE '\b(col-[a-z0-9-]+|row|d-flex|justify-content[a-z-]*|align-items-[a-z]+|g-[0-9]|p-[0-9]|pt-[0-9]|mt-[0-9]|text-center|img-fluid)\b' | sort -u
```

Anotar la lista. Cada una necesita sustitución por CSS propio o eliminación.

- [ ] **Step 2: Sustituir las estructuras de grilla**

La única grilla real que queda tras las tareas anteriores es la de `#about` (foto + texto). Sustituir:

```html
<div class="row">
    <div class="col-lg-3"> ... foto ... </div>
    <div class="col-lg-9 pt-4 pt-lg-0 content"> ... texto ... </div>
</div>
```

por:

```html
<div class="about-grid">
    <div class="about-photo"> ... foto ... </div>
    <div class="about-content"> ... texto ... </div>
</div>
```

con:

```css
.about-grid {
  display: grid;
  grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  gap: var(--sp-6);
  align-items: start;
}

.about-photo img {
  width: 100%;
  height: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

@media (max-width: 720px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-photo { max-width: 200px; }
}
```

- [ ] **Step 3: Eliminar el `<link>` de Bootstrap CSS**

Borrar de `index.html`:

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
```

**Conservar** el `<link>` de `bootstrap-icons`: los iconos se siguen usando.

Añadir un reset mínimo al principio de `style.css`, ya que Bootstrap lo aportaba:

```css
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
img, picture, svg { max-width: 100%; }
button { font: inherit; }
ul { list-style: none; }
a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--text); }
```

- [ ] **Step 4: Arreglar el bug de las animaciones**

Sustituir el bloque `[data-animate]` actual, que aplica `opacity: 0` de forma incondicional:

```css
/* El estado por defecto es VISIBLE. La animación solo existe si el usuario
   no ha pedido reducir movimiento — así un fallo de JS nunca deja la
   página en blanco. */
@media (prefers-reduced-motion: no-preference) {
  [data-animate] {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);
  }

  [data-animate].animate-visible {
    opacity: 1;
    transform: none;
  }

  .timeline-item[data-animate] { transform: translateX(-24px); }
  .timeline-item[data-animate].animate-visible { transform: none; }
}
```

Borrar además las reglas `.stat-item[data-animate]`: son el CSS del contador muerto que se eliminó en Task 7.

- [ ] **Step 4b: Borrar las clases heredadas del template**

`style.css` conserva reglas nombradas por red social que se usaban como semántica de
estilo, no de contenido: `.instagram` estaba en el botón de descarga del CV y
`.google-plus` en el enlace de GitHub. El markup que las usaba desapareció en las Tasks 6
y 7, así que las reglas quedan huérfanas.

```bash
grep -n "\.instagram\|\.google-plus\|\.tiktok\|\.youtube\|\.linkedin" assets/css/style.css index.html
```

Borrar de `style.css` toda regla que ya no tenga markup que la use. Verificar con el mismo
`grep` que no queda ninguna referencia en `index.html` antes de borrarla del CSS.

- [ ] **Step 5: Verificar el bug arreglado**

Con la preview abierta, desactivar JavaScript en el navegador y recargar la home.

Expected: **toda la página se ve**, con contenido en todas las secciones. Antes de este cambio, todo lo que está por debajo del hero quedaba invisible.

Volver a activar JavaScript y comprobar que las animaciones de entrada siguen funcionando al hacer scroll.

- [ ] **Step 6: Verificar que no queda Bootstrap**

```bash
grep -n "bootstrap@5\|col-lg\|col-md\|d-flex\|justify-content" index.html
```

Expected: solo aparece la línea de `bootstrap-icons`. Ninguna clase de grilla.

Comprobar en la pestaña de red que ya no se descarga `bootstrap.min.css`.

- [ ] **Step 7: Verificar que `/articles` y `/article/<slug>` siguen vivas**

Esas dos páginas todavía cargan Bootstrap y el CSS viejo; el Plan 2 las migra. Abrir ambas y confirmar que renderizan sin errores de consola.

- [ ] **Step 8: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "fix(a11y): quitar Bootstrap y hacer que las animaciones no oculten contenido"
```

---

## Task 9: Actualizar la documentación del repo

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Corregir la nota falsa sobre `generateSlug`**

En la sección "Gotchas", eliminar:

```
- Slug logic is duplicated in `home.js`, `articles.js`, and `article.js` - keep in sync
```

`generateSlug()` vive únicamente en `assets/js/utils.js:5` y las tres páginas la consumen desde ahí. La nota describe un problema que no existe.

- [ ] **Step 2: Documentar el sistema de diseño**

Sustituir la sección "Theme System" por:

```markdown
## Design System

- **Tokens** en `assets/css/tokens.css` — color, espaciado (base 4), tipografía y forma.
  Es la única fuente de valores: `style.css` no define hex ni px de tipografía.
- **Contraste verificado por test.** `npm test` falla si algún token de texto baja de
  4.5:1 (WCAG AA) en cualquiera de los dos temas. No bajar el umbral para pasar el test.
- **Tipografía:** Archivo (titulares e interfaz) y JetBrains Mono (etiquetas técnicas).
- **Radios:** solo `0` y `4px`. La excepción documentada es `.phone`, que representa un
  objeto físico.
- **Movimiento:** todo lo que anima vive dentro de
  `@media (prefers-reduced-motion: no-preference)`. Ningún elemento puede tener
  `opacity: 0` como estado por defecto.
- ThemeManager en `assets/js/theme.js` gestiona el toggle y la persistencia.
  `theme.js` se carga síncrono en `<head>` para evitar el flash.
```

- [ ] **Step 3: Actualizar la estructura de archivos y los comandos**

Añadir al árbol: `assets/css/tokens.css`, `assets/js/projects.js`, `content/projects.json`, `test/`.

Añadir a los comandos:

```bash
npm test             # Tests de tokens y de datos de proyectos
```

- [ ] **Step 4: Verificar**

Run: `npm test`
Expected: PASS — todos los tests siguen pasando.

Releer `CLAUDE.md` entero y comprobar que no queda ninguna otra afirmación desmentida por este plan (Bootstrap, tres familias tipográficas, `padding: 60px 0`).

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: actualizar CLAUDE.md con el sistema de diseño y corregir nota falsa"
```

---

## Verificación final del plan

Antes de dar el Plan 1 por cerrado:

- [ ] `npm test` pasa entero.
- [ ] La home renderiza correctamente en claro y en oscuro.
- [ ] La home renderiza a 390×844 sin scroll horizontal.
- [ ] Con JavaScript desactivado, todo el contenido de la home es visible.
- [ ] `/articles`, `/article/<slug>` y `/privacy-policy` siguen funcionando.
- [ ] La pestaña de red no descarga `bootstrap.min.css`.
- [ ] Consola sin errores en las cuatro páginas.

## Fuera del alcance de este plan

- `/project/<slug>`: los enlaces de las tarjetas apuntan ahí y darán 404 hasta el Plan 2. Es deliberado.
- Rediseño de `/articles` y `/article/<slug>`: Plan 2.
- Curación del blog y `build:pages`: Plan 2.
- Bilingüe ES/EN y CVs por idioma: Plan 3. Hasta entonces el botón de CV apunta al Drive actual.
