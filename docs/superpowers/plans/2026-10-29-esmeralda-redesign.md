# Rediseño "Esmeralda nítida": plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usa superpowers:subagent-driven-development (recomendado) o
> superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan casillas (`- [ ]`).

**Objetivo:** El sitio pasa de "Mecha" a "Esmeralda nítida". Queda así:
- un inicio que le habla al cliente: banner, 9 proyectos con carrusel, servicios y contacto por WhatsApp;
- páginas de proyecto escritas como caso;
- una página `/experience/` nueva;
- el blog sin Bootstrap.

**Arquitectura:** El sitio sigue siendo estático, sin framework.
- **Diseño:** colores, tipografía y radios salen de `tokens.css`, y `style.css` se reescribe desde cero sobre esos tokens.
- **Proyectos:** las tarjetas, el carrusel y la página de proyecto se generan con dos módulos UMD (`carousel.js`, `project-view.js`). El navegador y `scripts/build-pages.js` usan esos mismos módulos, así que el HTML prerenderizado y el que pinta el JS son idénticos.
- **Experiencia:** `/experience/` es HTML estático escrito a mano, con `data-i18n`.

**Stack:** HTML, CSS y JS clásicos (sin bundler). Node 20 con `node --test` para los tests. Express para el servidor local. `cwebp`/`dwebp` (Homebrew, ya instalados) para las imágenes.

**Spec:** `docs/superpowers/specs/2026-10-29-esmeralda-redesign-design.md`. Léelo antes de cada tarea: la copia exacta de los textos y los casos del Anexo A viven allí.

**Maqueta de referencia:** `.superpowers/brainstorm/67915-1793307092/content/home-esmeralda-v14.html`.
- Es local y no está versionada. Sus `<style>` son la fuente de las medidas (tamaños de fuente, paddings, gaps).
- Las notas amarillas (`.note`) y las etiquetas `BORRADOR` no van al sitio.
- Donde el spec y la maqueta difieran, manda el spec.

## Restricciones globales

- **Paleta:**
  - Claro: `--bg #FFFFFF`, `--surface #F6F7F5`, `--border #E3E7E4`, `--text #0F1A14`, `--text-muted #56605A`, `--accent #0B5D3B`, `--accent-fg #FFFFFF`.
  - Oscuro: `#0F1512`, `#161E1A`, `#25302A`, `#E7ECE9`, `#9BA6A0`, `#4CB383`, `#0F1512`, en el mismo orden.
- **Contraste ≥ 4.5:1** sobre `--bg` y sobre `--surface`. El umbral no se baja nunca.
- **Un solo acento:** `--accent-2`, `--border-strong` y `--cut` desaparecen.
- **Tipografía:** Newsreader (400, 500) para títulos; IBM Plex Sans (400, 500, 600) para texto, navegación y botones; IBM Plex Mono (400, 500) para etiquetas, fechas, numeración y chips. Archivo y JetBrains Mono no se cargan en ninguna página.
- **Radios:** chips 3px · botones 4px · tarjetas, galería y ficha lateral 8px · filtros 999px · punto de estado 50%. Ningún otro valor.
- **Tema claro por defecto.** Solo es oscuro si el visitante lo eligió con el interruptor.
- **Animaciones:** `[data-animate]` solo se oculta bajo `.js` **y** dentro de `@media (prefers-reduced-motion: no-preference)`.
- **Idioma:** ES es la fuente y EN es una capa en `content/i18n/en.json`. El parpadeo de español al cargar en inglés es deliberado; no se oculta nada para evitarlo.
- **Imágenes:** marco 16:10 en tarjetas y galería. Las capturas de web van con `object-fit: cover` anclado arriba; los gráficos de tienda, con `object-fit: contain` sobre `--surface`. No entran capturas verticales.
- **WhatsApp:** `https://wa.me/51924262747?text=Hola%20Gonzalo%2C%20vi%20tu%20portafolio%20y%20quiero%20contarte%20sobre%20un%20proyecto`, etiqueta `WhatsApp · +51 924 262 747`, en pestaña nueva.
- **CV:** `https://drive.google.com/file/d/1aNYpEk3DXCDbyXXamSAKisFue7hUL8C6/view?usp=sharing`, el mismo en los dos idiomas, en la clave i18n `exp.cv.url`.
- **Commits** en español, con Conventional Commits, terminados en `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Rama:** todo el trabajo va en `feat/esmeralda`, creada desde `master`. Nunca se hace push sin que Gonzalo lo pida.
- **Antes de cada commit** corren `npm test`, y también `npm run build:pages` si la tarea tocó plantillas o datos. Las páginas regeneradas se commitean.

## Foco de revisión

1. **Fechas sin hora que retroceden un día.** `new Date('2024-03-17')` se interpreta en UTC, y en Lima se muestra "16 de marzo". Hoy pasa en el blog prerenderizado. Una fecha `AAAA-MM-DD` debe mostrarse con ese mismo día en cualquier zona horaria. *(Tarea 9)*
2. **Proyecto con una sola imagen** (AutoTest, CixCash, Note.AI): no debe tener flechas, puntos, contador ni miniaturas, y la tarjeta sigue llevando al proyecto. *(Tarea 4)*
3. **Correr `npm run build:pages` dos veces** debe dejar exactamente los mismos archivos. Ojo: un `<article>` anidado dentro de `#projectDetail` rompe la regex del build. *(Tarea 7)*
4. **Visitante en inglés con un caso a medio traducir:** debe ver los párrafos en español, nunca un hueco ni la clave. *(Tareas 2 y 7)*
5. **Visitante sin JavaScript** (o el crawler) debe ver todo esto:
   - los 9 proyectos en el `<noscript>` del inicio;
   - el caso completo en `/project/<slug>/`;
   - la línea de tiempo en `/experience/`;
   - la lista del blog;
   - todo `[data-animate]` visible.

   *(Tareas 6, 7, 8 y 9)*

---

## Mapa de archivos

| Archivo | Qué pasa |
|---|---|
| `assets/css/tokens.css` | Valores nuevos, tokens de fuente y radio |
| `assets/css/style.css` | Se reescribe entero, por secciones (Tareas 5–9) |
| `assets/js/theme.js` | Claro por defecto |
| `assets/js/carousel.js` | **Nuevo**, UMD: marcado y comportamiento del carrusel |
| `assets/js/project-view.js` | **Nuevo**, UMD: HTML de la página de proyecto |
| `assets/js/projects.js` | Tarjetas con carrusel y filtros con conteo |
| `assets/js/project.js` | Delega en `ProjectView` |
| `assets/js/home.js` | Solo animaciones y copiar correo (sin artículos) |
| `assets/js/i18n.js` | Soporte de `data-i18n-href` |
| `assets/js/components/navbar.js`, `footer.js` | Marca GL, cinco enlaces, pie nuevo |
| `assets/js/articles.js` | **Se borra**: la lista del blog es estática |
| `assets/js/utils.js` | `formatDate` sin el desfase de zona horaria |
| `index.html` | Banner, proyectos, servicios y contacto |
| `project/index.html` | Plantilla nueva |
| `experience/index.html` | **Nueva** |
| `articles/index.html`, `article/index.html` | Sin Bootstrap |
| `content/projects.json` | Modelo `images`, `case` y `client`; entra Agrosalas |
| `content/i18n/{es,en}.json` | Claves nuevas; casos en inglés |
| `content/review.json` | **Nuevo**: casos y traducciones pendientes de revisión |
| `scripts/build-pages.js` | Proyecto, blog y sitemap con el diseño nuevo |
| `scripts/i18n-review.js` | También lista `review.json` |
| `assets/img/portfolio/**` | Capturas nuevas en WebP y sus variantes de tarjeta |
| `test/*.test.js` | Ver cada tarea |
| `CLAUDE.md` | Se actualiza al final (Tarea 10) |

---

### Tarea 1: Tokens Esmeralda y tema claro por defecto

**Archivos:**
- Modificar: `assets/css/tokens.css`, `assets/js/theme.js`, `test/tokens.test.js`
- Crear: `test/theme.test.js`

**Interfaces:**
- Produce estos tokens de CSS:
  - color: `--bg --surface --border --text --text-muted --accent --accent-fg`;
  - fuentes: `--font-serif --font-sans --font-mono`;
  - radios: `--radius-chip` (3px), `--radius` (4px), `--radius-card` (8px), `--radius-pill` (999px);
  - se conservan `--sp-1…--sp-10`, `--dur` y `--ease`.
- Se eliminan `--accent-2`, `--border-strong`, `--cut`, `--radius-sm` y `--font-display`.

- [ ] **Paso 1: Crear la rama y commitear el spec y el plan**

```bash
git switch -c feat/esmeralda
git add docs/superpowers/specs/2026-10-29-esmeralda-redesign-design.md docs/superpowers/plans/2026-10-29-esmeralda-redesign.md
git commit -m "docs: spec y plan del rediseño Esmeralda nítida"
```

- [ ] **Paso 2: Escribir los tests que fallan**

En `test/tokens.test.js`:
- `TEXT_ON_BG` pasa a ser `['--text', '--text-muted', '--accent']`.
- Se añade un test por tema: los mismos tokens deben cumplir 4.5:1 sobre `--surface`.
- Se añade este test:

```js
test('el sistema tiene un solo acento y la escala de radios', () => {
  const t = parseTokens(css, ':root');
  for (const gone of ['--accent-2', '--border-strong', '--cut', '--font-display']) {
    assert.ok(!t.get(gone), `${gone} debería haber desaparecido`);
  }
  assert.strictEqual(t.get('--radius-chip'), '3px');
  assert.strictEqual(t.get('--radius'), '4px');
  assert.strictEqual(t.get('--radius-card'), '8px');
  assert.strictEqual(t.get('--radius-pill'), '999px');
  assert.match(t.get('--font-serif'), /Newsreader/);
  assert.match(t.get('--font-sans'), /IBM Plex Sans/);
  assert.match(t.get('--font-mono'), /IBM Plex Mono/);
});
```

`test/theme.test.js` carga `assets/js/theme.js` con `vm.runInNewContext`. El contexto simula lo mínimo:
- un `document.documentElement` con `classList.add` y `setAttribute`/`getAttribute`;
- `document.readyState = 'complete'` y `document.getElementById → null`;
- `localStorage` sobre un `Map`;
- `window.matchMedia(q) → { matches: <parámetro>, addEventListener() {} }`.

Casos:
- `test('con el sistema en oscuro y sin elección guardada, arranca en claro')`: espera `data-theme === 'light'`.
- `test('respeta el oscuro que el visitante eligió')`: con `localStorage.theme = 'dark'`, espera `'dark'`.
- `test('añade la clase js antes de pintar')`.

- [ ] **Paso 3: Correr y ver que fallan**

Comando: `node --test test/tokens.test.js test/theme.test.js`. Debe fallar en `--accent-2` y en el tema `'dark'`.

- [ ] **Paso 4: Implementar**

- **`tokens.css`:** escribe los valores de la paleta de las Restricciones globales en `:root` y en `[data-theme="dark"]`. Añade los tokens de fuente y de radio. Pon en la cabecera el comentario "Sistema Esmeralda nítida".
- **`ThemeManager.applyInitialTheme()`:** pasa a `localStorage.getItem(STORAGE_KEY) || LIGHT`.
- **Se borran** `watchSystemPreference` (y su llamada en `init`) y `resetToSystemPreference`, porque ya nada sigue al sistema.

- [ ] **Paso 5: Verificar**

Comando: `npm test`. `tokens`, `theme` y `no-token-collisions` deben pasar. `style.css` todavía usa los tokens borrados; se reescribe en la Tarea 5, y ningún test lo detecta antes.

- [ ] **Paso 6: Commit**

```bash
git add assets/css/tokens.css assets/js/theme.js test/tokens.test.js test/theme.test.js
git commit -m "feat(diseño): tokens Esmeralda nítida y tema claro por defecto"
```

---

### Tarea 2: Modelo de proyecto, Agrosalas e imágenes

**Archivos:**
- Modificar: `content/projects.json`, `content/i18n/en.json` (`projects`), `test/projects.test.js`, `test/project-pages.test.js`, `test/seo.test.js` (la variante de tarjeta), `test/i18n.test.js` (la traducción de proyectos), `index.html` (solo el `<noscript>`)
- Crear: `assets/img/portfolio/web_agrosalas_{home,catalogo,eventos}.webp` y `web_quote_anime.webp`; sobrescribir `web_nekomangacix_home.webp`; las variantes en `assets/img/portfolio/cards/` para **todas** las imágenes que use un proyecto
- Borrar: el campo `shot` y el campo `highlights` de cada proyecto

**Interfaces:** cada proyecto de `projects.json` queda así:

```jsonc
{
  "slug": "agrosalas",
  "title": "Agrosalas Perú",
  "summary": "…",                       // ≤ 140 caracteres
  "platforms": ["web"],
  "tech": ["Next.js", "React", "Tailwind CSS", "Lucide", "Vercel"],
  "images": [{ "src": "/assets/img/portfolio/web_agrosalas_home.webp", "fit": "cover" }, …],
  "case": { "context": ["…"], "problem": ["…"], "solution": ["…", "…"], "result": [] },
  "client": "Agrosalas Peru S.R.L.",    // opcional; se omite si no se conoce
  "links": [{ "label": "Web", "url": "https://www.agrosalasperu.com/" }],
  "decisions": "…"                      // opcional, como hoy
}
```

En `en.json`, `projects[slug]` queda como `{ summary, case: { context, problem, solution, result? } }`.

- [ ] **Paso 1: Exportar las imágenes**

```bash
D=.superpowers/brainstorm/67915-1793307092/content
P=assets/img/portfolio
for pair in "agro-home:web_agrosalas_home" "agro-catalogo:web_agrosalas_catalogo" "agro-eventos:web_agrosalas_eventos" "nmc-desk:web_nekomangacix_home" "qa-desk:web_quote_anime"; do
  src=${pair%%:*}; out=${pair##*:}
  cwebp -quiet -q 80 -resize 1440 900 "$D/$src.png" -o "$P/$out.webp"
  cwebp -quiet -q 78 -resize 600 375 "$D/$src.png" -o "$P/cards/$out.webp"
done
T=$(mktemp -d)
for f in web_nekomangacix_catalogo web_nekomangacix_producto app_ulearning_ios web_ulearning web_erp web_crm; do
  dwebp -quiet "$P/$f.webp" -o "$T/$f.png" && cwebp -quiet -q 78 -resize 600 0 "$T/$f.png" -o "$P/cards/$f.webp"
done
ls -l $P/*.webp $P/cards/*.webp
```

Resultado esperado: cada archivo de 1440×900 pesa menos de 400 KB, y cada variante de `cards/` pesa menos que su original. Si alguno no cumple, baja `-q` a 72.

- [ ] **Paso 2: Escribir los tests que fallan**

En `test/projects.test.js`:

```js
test('el inventario de proyectos es el esperado', () => { assert.strictEqual(projects.length, 9); });

test('el orden es el del inicio', () => {
  assert.deepStrictEqual(projects.map((p) => p.slug), ['nekomangacix', 'agrosalas', 'quote-anime',
    'autotest-licencia', 'cixcash', 'note-ai', 'u-learning', 'admin-lotes', 'solti-crm']);
});

test('cada proyecto declara sus imágenes con su encuadre', () => {
  for (const p of projects) {
    assert.ok(Array.isArray(p.images) && p.images.length > 0, `${p.slug}: falta images`);
    for (const img of p.images) {
      assert.ok(['cover', 'contain'].includes(img.fit), `${p.slug}: fit inválido en ${img.src}`);
      assert.ok(fs.existsSync(path.join(root, img.src.replace(/^\//, ''))), `no existe ${img.src}`);
    }
    assert.ok(!('image' in p) && !('gallery' in p) && !('shot' in p) && !('highlights' in p),
      `${p.slug}: quedan campos del modelo viejo`);
  }
});

test('cada proyecto trae su caso en párrafos', () => {
  for (const p of projects) {
    for (const part of ['context', 'problem', 'solution']) {
      assert.ok(Array.isArray(p.case?.[part]) && p.case[part].length > 0, `${p.slug}: falta case.${part}`);
    }
    for (const para of Object.values(p.case).flat()) {
      assert.ok(!/^\s*[-•*]/.test(para), `${p.slug}: un párrafo parece una viñeta`);
    }
  }
});

test('solo Agrosalas declara cliente por ahora', () => {
  assert.deepStrictEqual(projects.filter((p) => p.client).map((p) => p.slug), ['agrosalas']);
});
```

Otros cambios de test:
- El límite de `summary` pasa de 120 a **140**. La tarjeta corta el resumen a 2 líneas, y el de Agrosalas fijado en el spec mide 134 caracteres. Explícalo en el comentario del test.
- Los tests de `project-pages.test.js` que leían `p.image` y `p.gallery` pasan a `p.images.map((i) => i.src)`.
- En `seo.test.js`, el test de la variante de tarjeta recorre **todas** las `images` de cada proyecto.
- En `i18n.test.js`, el test de traducción de proyectos pasa a exigir `summary` y un `case` con el mismo número de párrafos en cada parte, comparado con el español.

- [ ] **Paso 3: Correr y ver que fallan**

Comando: `npm test`. Fallan por el inventario de 8 y por los campos viejos.

- [ ] **Paso 4: Reescribir `content/projects.json`**

- **Orden:** el del test de orden.
- **Agrosalas:** sus datos y su caso salen del spec §3.1. El caso se reparte así: el primer párrafo es `context`, el segundo `problem`, los cuatro restantes `solution`. `result` queda vacío.
- **Los otros 8 casos:** salen del Anexo A del spec. En todos, el párrafo 1 es `context`, el 2 es `problem` y el resto es `solution`.
- **Imágenes** (`c` = cover, `k` = contain):

| slug | images |
|---|---|
| nekomangacix | `web_nekomangacix_home` c, `web_nekomangacix_catalogo` c, `web_nekomangacix_producto` c |
| agrosalas | `web_agrosalas_home` c, `web_agrosalas_catalogo` c, `web_agrosalas_eventos` c |
| quote-anime | `web_quote_anime` c, `app_quote_anime` k |
| autotest-licencia | `app_autotest` k |
| cixcash | `app_cixcash` k |
| note-ai | `app_noteai` k |
| u-learning | `app_ulearning` k, `app_ulearning_ios` k, `web_ulearning` k |
| admin-lotes | `app_erp` k, `web_erp` k |
| solti-crm | `app_crm` k, `web_crm` k |

- **`en.json → projects`:** se añade `agrosalas` y cada proyecto lleva su `case` en inglés, con el mismo número de párrafos que en español. Se borran los `highlights`.
- **`<noscript>` de `index.html`:** se añade Agrosalas en segunda posición, con su enlace Web.

- [ ] **Paso 5: Verificar**

Comando: `npm test`. Todo debe pasar salvo los tests de páginas prerenderizadas (`seo.test.js` › "existe una página prerenderizada por proyecto" para `agrosalas`). Ese lo resuelve la Tarea 7. Anótalo en el mensaje de commit.

- [ ] **Paso 6: Commit**

```bash
git add content/ assets/img/portfolio/ test/ index.html
git commit -m "feat(proyectos): modelo de caso e imágenes 16:10; entra Agrosalas Perú"
```

---

### Tarea 3: Lista de casos y traducciones pendientes de revisión

**Archivos:**
- Crear: `content/review.json`, `test/review.test.js`
- Modificar: `scripts/i18n-review.js`, `content/i18n/en.json` (`_review`)

**Interfaces:** `content/review.json` tiene esta forma:

```json
{
  "cases": ["nekomangacix", "quote-anime", "autotest-licencia", "cixcash", "note-ai", "u-learning", "admin-lotes", "solti-crm"],
  "caseTranslations": ["nekomangacix", "agrosalas", "quote-anime", "autotest-licencia", "cixcash", "note-ai", "u-learning", "admin-lotes", "solti-crm"]
}
```

`cases` son los textos en español que escribió Claude. `caseTranslations` son las traducciones al inglés de los casos. Gonzalo borra un slug de la lista cuando lo revisa.

- [ ] **Paso 1: Test que falla**

`test/review.test.js`:
- `review.json existe y solo nombra slugs de projects.json`;
- `Agrosalas no está en cases` (su problema y su solución son palabras de Gonzalo).

- [ ] **Paso 2: Correr y ver que falla**

Comando: `node --test test/review.test.js`. Falla con ENOENT.

- [ ] **Paso 3: Implementar**

- Crea `review.json`.
- `i18n-review.js` imprime, después de `_review`, dos bloques:
  - "Casos pendientes": el slug y el primer párrafo de `context`, recortado a 150 caracteres;
  - "Traducciones de casos": el mismo párrafo en ES y en EN.
- Solo dice "Nada pendiente" cuando las tres listas están vacías.

- [ ] **Paso 4: Verificar**

Comandos: `npm test` y `npm run i18n:review`. La salida debe listar los 8 casos y las 9 traducciones.

- [ ] **Paso 5: Commit**

Mensaje: `feat(i18n): lista de casos y traducciones pendientes de revisión`.

---

### Tarea 4: Módulos de carrusel y de vista de proyecto

**Archivos:**
- Crear: `assets/js/carousel.js`, `assets/js/project-view.js`, `test/carousel.test.js`, `test/project-view.test.js`

**Interfaces:** ambos módulos son UMD. Asignan `window.Carousel` / `window.ProjectView` en el navegador y `module.exports` en Node. `project-view.js` obtiene `Carousel` de `window.Carousel` o, si no existe, de `require('./carousel.js')`.

```text
Carousel.cardSrc(src: string) -> string            // '/portfolio/' → '/portfolio/cards/'
Carousel.html(images: {src, fit}[], opts) -> string
  opts = { alt: string, variant: 'card' | 'gallery', href?: string,
           labels: { prev: string, next: string, goto: string } }
Carousel.wire(root: ParentNode) -> void            // idempotente: marca data-wired="1"

ProjectView.escapeHtml(value: any) -> string
ProjectView.PLATFORM_LABELS = { android: 'Android', ios: 'iOS', kmm: 'KMM', web: 'Web' }
ProjectView.caseParagraphs(c: {context?, problem?, solution?, result?}) -> string[]
ProjectView.render({ project, summary, caseText, t, next }) -> string
  // summary y caseText ya vienen en el idioma activo; t(key) -> string;
  // next = { slug, title }
```

**Marcado que fija `Carousel.html`:**
- **Raíz:** `<div class="car car-{variant}" data-carousel>`.
- **Pista:** `.car-track`.
- **Diapositivas:** `.car-slide.is-{fit}` con su `<img>`, que lleva `alt` y `loading="lazy"` en todas menos la primera, más `decoding="async"`, `width="1440"` y `height="900"`.
  - En `card`, el `src` es `cardSrc(src)` y cada diapositiva es un `<a href=… tabindex="-1" aria-hidden="true">`, para que el clic en la imagen abra el proyecto y el deslizamiento siga funcionando.
- **Si hay más de una imagen:**
  - `button.car-nav.car-prev` y `button.car-nav.car-next`, con `type="button"` y `aria-label`;
  - `.car-dots` con un `<i>` por imagen, el primero con la clase `on`;
  - `.car-count` con el texto `1/N`;
  - solo en `gallery`, `.car-thumbs` con un `button[data-k]` por imagen, `aria-label="${goto} k+1"`.

**`Carousel.wire`:**
- Las flechas hacen `track.scrollBy({ left: ±track.clientWidth })` y llaman a `event.preventDefault()` y `event.stopPropagation()`, para no abrir el proyecto.
- El evento `scroll` (con `requestAnimationFrame`) actualiza los puntos, el contador y la miniatura activa con `Math.round(scrollLeft / clientWidth)`.
- Una miniatura lleva a `k * clientWidth`.

**`ProjectView.render`** devuelve, en este orden:
1. `.p-head`: enlace `a.p-back[href="/#proyectos"]` con `t('project.back')`, `p.p-plat` con las plataformas unidas por ` · `, `h1` y `p.p-sum`.
2. `.p-grid`, que contiene:
   - `.p-main`: la galería (`Carousel.html(…, { variant: 'gallery' })`) y un `div.p-story` con un `<p>` por párrafo de `caseParagraphs(caseText)`. Si hay `project.decisions`, se añade un `<p>` más al final.
   - `aside.p-side`, con estas filas `div` en orden:
     - `Cliente`, solo si hay `client`;
     - `Plataforma`;
     - `Construido con` (todos los chips como `span.chip`);
     - `Enlaces`: `a.btn` para el primero y `a.btn.btn-ghost` para el resto, con `target="_blank" rel="noopener"`, o `p.p-private` si no hay enlaces;
     - `div.p-ask` con un `strong`, un `span` y `a.btn[href="/#contacto"]`.
3. `nav.p-next`, con `a[href="/#proyectos"]` (`project.all`) y `a[href="/project/${next.slug}/"]` (`${t('project.next')}: ${next.title} →`).

**Prohibido:** que la salida contenga `<article`, `<ul` o `<h2` (ver el Foco de revisión 3).

- [ ] **Paso 1: Escribir los tests que fallan**

`test/carousel.test.js` (requiere el módulo directamente; las aserciones son sobre el string):
- `una sola imagen no pinta controles`: no hay `car-nav`, `car-dots`, `car-count` ni `car-thumbs`.
- `tres imágenes pintan flechas con nombre, tres puntos y contador 1/3`.
- `la tarjeta usa la variante cards/ y enlaza cada diapositiva al proyecto`: hay `href="/project/x/"` 3 veces y `/portfolio/cards/` en cada `src`.
- `la galería pinta una miniatura por imagen`.
- `el encuadre llega a la diapositiva`: aparecen `is-cover` e `is-contain`.
- `escapa el alt`: un alt con `"<` sale como `&quot;&lt;`.

`test/project-view.test.js` usa un `t = (k) => k` y un proyecto armado en el test:
- `el caso sale en párrafos, en orden y sin títulos ni listas`: los textos aparecen en orden context → problem → solution → result, y la salida no contiene `<h2`, `<ul` ni `<article`.
- `la fila Cliente solo aparece si hay cliente`.
- `sin enlaces dice proyecto privado`: contiene `project.private`.
- `el primer enlace es relleno y el resto con borde`.
- `pide contacto y enlaza al siguiente proyecto`: contiene `href="/#contacto"` y `href="/project/next-slug/"`.
- `caseParagraphs omite partes vacías o ausentes`.

- [ ] **Paso 2: Correr y ver que fallan**

Comando: `node --test test/carousel.test.js test/project-view.test.js`. Falla con "Cannot find module".

- [ ] **Paso 3: Implementar los dos módulos** según las interfaces de arriba.

- [ ] **Paso 4: Verificar**

Comando: `npm test`. Todo en verde salvo la página de Agrosalas que quedó pendiente en la Tarea 2.

- [ ] **Paso 5: Commit**

Mensaje: `feat(proyectos): módulos de carrusel y de vista de proyecto compartidos con el build`.

---

### Tarea 5: Hoja de estilos base, barra de navegación y pie

**Archivos:**
- Reescribir: `assets/css/style.css`. Se borra el contenido viejo entero y quedan solo las secciones de abajo; las tareas siguientes añaden las suyas.
- Modificar: `assets/js/components/navbar.js`, `assets/js/components/footer.js`, `content/i18n/{es,en}.json`, `test/i18n.test.js`
- Crear: `test/style.test.js`

**Interfaces:**

Secciones de `style.css`, en este orden:
1. reset
2. base y tipografía (`.t-serif`, `.eyebrow`, `.lead`)
3. `.btn`, `.btn-ghost`, `.link-arrow`
4. `.chip` y `.chips`
5. `.container` (1120px) y `.section`
6. nav
7. footer
8. carrusel (`.car*`)
9. puerta de animación

**Navegación:**
- Enlaces: `/#proyectos` (`nav.projects`), `/#servicios` (`nav.services`), `/experience/` (`nav.experience`), `/articles/` (`nav.blog`) y `/#contacto` (`nav.contact`).
- Marca: `<a class="brand" href="/"><span class="brand-mark">GL</span> Gonzalo López</a>`.
- Ya no hay versión transparente: se quitan `data-transparent` e `initScrollEffect`.

**Pie (`FooterComponent`):**
- `© {año} Gonzalo López`, los mismos cinco enlaces y un grupo `ES · EN` hecho con `button[data-lang-option]`.
- Se conserva `.back-to-top`.

**Enlace activo (`NavbarComponent.isActive(href)`):**
- `/experience/` cuando la ruta empieza por `/experience`.
- `/articles/` cuando la ruta empieza por `/articles` o `/article/`.
- En el inicio, el scroll-spy existente marca las anclas.

- [ ] **Paso 1: Escribir los tests que fallan**

`test/style.test.js`:

```js
test('style.css no escribe colores crudos: todo sale de tokens', () => {
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.deepStrictEqual(sinComentarios.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g) || [], []);
});

test('los radios solo usan la escala del sistema', () => {
  const vals = [...css.matchAll(/border-radius:\s*([^;]+);/g)].map((m) => m[1].trim());
  for (const v of vals) assert.match(v, /^(0|50%|var\(--radius(-chip|-card|-pill)?\))$/, `radio fuera de escala: ${v}`);
});

test('[data-animate] solo se oculta bajo .js y sin reducción de movimiento', () => {
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\) \{\s*\.js \[data-animate\]/);
  for (const m of css.matchAll(/^[^\n{]*\[data-animate\][^\n{]*\{/gm)) {
    assert.match(m[0], /\.js \[data-animate\]/, `selector sin la puerta .js: ${m[0]}`);
  }
});

test('style.css no depende de tokens que ya no existen', () => {
  for (const gone of ['--accent-2', '--border-strong', '--cut', '--font-display', '--radius-sm', '--accent-primary', '--text-primary']) {
    assert.ok(!css.includes(`var(${gone})`), `style.css usa ${gone}`);
  }
});
```

Las sombras y los fondos traslúcidos se escriben con `color-mix(in srgb, var(--text) X%, transparent)`.

En `test/i18n.test.js`, el test de la navbar añade:
- que existan los cinco `href` exactos de arriba;
- que `footer.js` use solo claves que existen.

- [ ] **Paso 2: Correr y ver que fallan**

Comando: `node --test test/style.test.js test/i18n.test.js`.

- [ ] **Paso 3: Implementar**

- **CSS:** las medidas salen de la maqueta (`nav`, `.mono-mark`, `.btn`, `.chips`, `.car*`, `footer`), traducidas a tokens. En `.car-nav`, la opacidad 0 solo aplica con `@media (hover: hover)`, y la flecha aparece con `:hover` y `:focus-visible`. En pantallas táctiles las flechas siempre se ven.
- **Menú móvil:** `initMobileNav` hoy busca un `<i>` que ya no existe (los iconos son SVG) y lanza un error al tocarlo. Debe alternar `aria-expanded` en el botón y cambiar el icono con `Icons.icon('list')` / `Icons.icon('x')`. Añade `x` a `icons.js` con el path de Bootstrap Icons `x-lg`.
- **Claves i18n:** se añade `nav.services` en ES ("Servicios") y EN ("Services"). `nav.experience` pasa a "Experiencia" / "Experience".

- [ ] **Paso 4: Verificar en el navegador**

Con `preview_start` (`name: "portfolio"`), abre `/` y `/project/agrosalas/`. La barra y el pie deben verse con Newsreader e IBM Plex: la fuente se carga en la Tarea 6; mientras tanto basta con ver que aparece el respaldo serif o sans. Comprueba también:
- que el menú móvil abre y cierra sin errores en consola, a 375px;
- que el cambio de tema funciona.

El resto de la página se ve sin estilos hasta las tareas siguientes, y es lo esperado.

- [ ] **Paso 5: Commit**

Mensaje: `feat(diseño): hoja base Esmeralda, barra con monograma y pie nuevo`.

---

### Tarea 6: Inicio

**Archivos:**
- Modificar: `index.html`, `assets/js/projects.js`, `assets/js/home.js`, `assets/js/i18n.js`, `content/i18n/{es,en}.json`, `assets/css/style.css` (secciones hero, proyectos, servicios y contacto), `test/i18n.test.js`, `test/seo.test.js`
- Crear: `test/home.test.js`

**Interfaces:**
- **Consume:** `Carousel.html` y `Carousel.wire` (Tarea 4).
- **`index.html` carga, en este orden:** `icons.js`, `navbar.js`, `footer.js`, `utils.js`, `i18n.js`, `carousel.js`, `projects.js`, `home.js`.
- **Fuentes** (este mismo `<link>` va en todas las páginas):
  `https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap`
- **`i18n.js`:** `apply()` también resuelve `[data-i18n-href]` y lo asigna a `href`.
- **Tarjeta (`projects.js`):** `renderCard(project) -> string`. Estructura:
  - `article.pj-card[data-category]`;
  - `Carousel.html(images, { variant: 'card', href, alt: title })`;
  - `.pj-body`: `p.pj-plat`, `h3 > a.pj-link[href="/project/${slug}/"]` (con un `::after` que cubre la tarjeta, por debajo del carrusel), `p.pj-sum` cortado a 2 líneas, 3 chips más `+N`;
  - `.pj-foot`: las etiquetas de los enlaces como texto unido por ` · ` y `span.pj-more` con `t('projects.more')` y `→`.
- **Filtros:** `button.filter-btn[data-filter]` con `<small>` y el conteo, calculado desde los datos.

- [ ] **Paso 1: Escribir los tests que fallan**

`test/home.test.js` lee `index.html` como texto:
- `el inicio tiene banner, proyectos, servicios y contacto, en ese orden`: los índices de `id="hero"` < `id="proyectos"` < `id="servicios"` < `id="contacto"`.
- `sobre mí, experiencia y artículos salieron del inicio`: no hay `id="about"`, `id="experience"`, `id="articles"`, `hero-shots` ni `latestArticles`.
- `el banner no tiene imágenes ni estadísticas`: entre `id="hero"` y `</section>` no hay `<img` ni `<figure`.
- `WhatsApp abre el chat con el mensaje escrito`: contiene el `href` exacto de las Restricciones globales, `target="_blank"` y `data-i18n-href="contact.whatsapp.url"`.
- `los ejemplos de servicios enlazan a sus proyectos`: hay `href="/project/agrosalas/"`, `nekomangacix`, `quote-anime`, `autotest-licencia` y `note-ai` dentro de `#servicios`.
- `ninguna página carga Archivo, JetBrains Mono ni Bootstrap CSS`. Por ahora recorre `index.html` y `project/index.html`. Las Tareas 8 y 9 añaden sus páginas a esta lista.

En `seo.test.js`:
- el título contiene "Desarrollo web, apps e IA";
- el JSON-LD `Person.jobTitle` es `"Desarrollador web y móvil"`;
- existe un nodo `"@type": "ProfessionalService"`.

En `i18n.test.js`:
- el regex de atributos incluye `-href`;
- se añaden a `IGUALES_A_PROPOSITO`, con un comentario por cada una: `projects.filter.*` (ya están), `nav.blog`.

- [ ] **Paso 2: Correr y ver que fallan**

Comando: `node --test test/home.test.js test/seo.test.js test/i18n.test.js`.

- [ ] **Paso 3: Reescribir el `<head>` y el `<body>` de `index.html`**

**`<head>`:**
- `<title>Gonzalo López — Desarrollo web, apps e IA para negocios</title>`.
- `description`: una frase orientada al cliente de ≤ 155 caracteres, que dice que hace webs, apps Android e iOS e IA para negocios y cómo escribirle. El test la mide.
- `og:*` y `twitter:*` con ese mismo texto. La imagen pasa a `https://gonzalo-lozg.me/assets/img/portfolio/web_agrosalas_home.webp`.
- JSON-LD:
  - `Person`, con `jobTitle` cambiado y el resto como está;
  - `WebSite`, con `name` "Gonzalo López — Desarrollo web, apps e IA";
  - `ProfessionalService` con `name`, `url`, `founder: {"@id": "…#person"}` y `makesOffer`: tres `Offer` con `itemOffered: {"@type": "Service", "name": "Desarrollo web" | "Apps móviles" | "IA en tus flujos"}`.

**`<body>`:** toda la copia en español sale exacta del spec §2.2, y cada texto lleva su clave.

| Bloque | Claves |
|---|---|
| Banner `section#hero.hero` | `hero.badge`, `hero.title` (h1), `hero.pitch` (`data-i18n-html`, con `<strong>Gonzalo López</strong>`), `hero.cta.contact` → `#contacto`, `hero.cta.projects` → `#proyectos` |
| `section#proyectos` | `projects.eyebrow` ("01 — Proyectos"), `projects.title`, `projects.lead`, los filtros, `#projectsGrid` y el `<noscript>` con los 9 |
| `section#servicios` | `services.eyebrow` ("02 — Servicios"), `services.title`, `services.lead`; por tarjeta (`web`, `apps`, `ai`): `.title`, `.desc`, `.i1`–`.i3`, más `services.examples` / `services.example` y anclas a los proyectos con su título |
| `section#contacto.contact` | `contact.eyebrow` ("03 — Contacto"), `contact.title`, `contact.lead`, `a.wa` (`contact.whatsapp` como texto, `contact.whatsapp.url` como href), `.mail` (`mailto:` + `button.copy-mail` con `contact.copy`), LinkedIn y GitHub |

Los iconos de servicios y de WhatsApp son SVG inline: cópialos de la maqueta, con `aria-hidden="true"`.

**Claves y textos:**
- El inglés de las claves nuevas lo escribe el implementador.
- Las claves `hero.*`, `services.*` y `contact.lead` se añaden a `en._review`.
- `contact.whatsapp.url` en EN lleva `?text=` con "Hi Gonzalo, I saw your portfolio and I'd like to tell you about a project", codificado con `encodeURIComponent`.

- [ ] **Paso 4: `projects.js` y `home.js`**

**`projects.js`:**
- Pinta las tarjetas con `renderCard`.
- Llama a `Carousel.wire(container)` después de cada pintado (`languageready` / `languagechange`).
- Al filtrar, actualiza `hidden` y conserva el filtro activo al repintar.

**`home.js`:**
- Se quedan `initScrollAnimations` e `initCopyMail`. Este último usa `I18n.t('contact.copied')` y `I18n.t('contact.copyFallback')` en vez de los literales.
- Se borra `loadLatestArticles`.

`data-animate` va en las tres tarjetas de servicios y en nada más.

- [ ] **Paso 5: CSS de las cuatro secciones**

Las medidas salen de `.hero`, `.pj-grid`, `.pj-card`, `.filters`, `.svc` y `.contact`/`.reach`/`.mail` de la maqueta.
- **Rejilla:** 3 columnas, que bajan a 2 a ≤ 980px y a 1 a ≤ 640px. La misma regla vale para los servicios.
- **Tarjeta:** el carrusel queda por encima del `::after` del enlace (`position: relative; z-index: 1`) y el resto de la tarjeta por debajo.

- [ ] **Paso 6: Verificar**

1. `npm test` en verde, salvo lo que queda pendiente para las Tareas 7 y 9.
2. En el navegador, con `/` a 1280px y a 375px, en claro y en oscuro, comprueba:
   - el banner centrado y sin hueco;
   - 9 tarjetas;
   - las flechas pasan la imagen sin abrir el proyecto, y el clic en la imagen o el título abre `/project/<slug>/`;
   - los filtros con su conteo;
   - "Copiar" cambia a "Copiado";
   - WhatsApp abre `wa.me`;
   - `?lang=en` traduce todo, incluido el `href` de WhatsApp;
   - consola sin errores.
3. Desactiva JavaScript: el `<noscript>` lista los 9 proyectos y los servicios se ven.

Toma una captura del inicio a 1280px para el resumen final.

- [ ] **Paso 7: Commit**

Mensaje: `feat(inicio): banner para clientes, proyectos con carrusel, servicios y contacto por WhatsApp`.

---

### Tarea 7: Página de proyecto

**Archivos:**
- Modificar: `project/index.html`, `assets/js/project.js`, `scripts/build-pages.js` (`buildProjects`), `assets/css/style.css` (sección "detalle"), `content/i18n/{es,en}.json`, `test/project-pages.test.js`, `test/seo.test.js`
- Regenerar: `project/*/index.html`, `sitemap.xml`

**Interfaces:**
- **Consume:** `ProjectView.render` y `Carousel.wire`.
- **Plantilla:**
  - sin `#crumbCurrent`;
  - `<main class="p-page"><div class="p-wrap"><div id="projectDetail" aria-busy="true">…</div></div></main>`. Ahora es un `div`, no un `article`.
  - carga `carousel.js` y `project-view.js` antes de `project.js`.
- **Build:** la regex de `buildProjects` pasa a `/(<div id="projectDetail"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>\s*<\/main>)/`.
- **Título:** `${project.title} — Proyecto de Gonzalo López`, igual en el build y en `project.js`.
- **`t()` del build:** lee de `content/i18n/es.json`.
- **Siguiente proyecto:** se toma en el orden de `projects.json`, y después del último vuelve al primero.

- [ ] **Paso 1: Escribir los tests que fallan**

En `project-pages.test.js`:
- `la página prerenderizada trae el caso completo en párrafos`: para cada proyecto, cada párrafo de `caseParagraphs(p.case)`, escapado, aparece en `project/<slug>/index.html`, y la página no contiene "Qué incluye".
- `cada página enlaza al siguiente proyecto, y la última vuelve a la primera`: `solti-crm` enlaza a `/project/nekomangacix/`.
- `la ficha muestra Cliente solo en Agrosalas`.
- `correr el build dos veces deja los mismos archivos`: ejecuta `node scripts/build-pages.js` dos veces con `execFileSync`, toma un hash de `project/agrosalas/index.html` después de cada corrida y compara. El test se marca `{ timeout: 30000 }`.
- La plantilla carga `carousel.js`, `project-view.js` y `project.js`, en ese orden.

En `seo.test.js`, el canonical de cada proyecto termina en `/`. Ese test ya existe y debe seguir pasando.

- [ ] **Paso 2: Correr y ver que fallan**

Comando: `node --test test/project-pages.test.js`.

- [ ] **Paso 3: Implementar**

**`build-pages.js` › `buildProjects`:**
- Genera el contenido con `ProjectView.render` y el `t` del español.
- El JSON-LD `CreativeWork` pasa a `image: images.map(src absoluto)`.
- Añade `"author"` y, si hay `client`, `"sourceOrganization": { "@type": "Organization", "name": client }`.
- `og:image` es la primera imagen.

**`project.js`:**
- Se queda con `getSlug`, `fetchProjects`, `updateSEO` (con el título nuevo y una URL con barra final), la caché del slug y el repintado en `languagechange`.
- Pinta con:

```js
ProjectView.render({
  project,
  summary: trProject(project, 'summary', project.summary),
  caseText: trProject(project, 'case', project.case),
  t: tr,
  next,
})
```

  seguido de `Carousel.wire(container)`.
- Se borran `renderSection`, `renderGallery` y `renderProject`.
- Los mensajes de error usan `project.notFound`, `project.noneGiven` y `project.loadError`.

**Claves nuevas** (ES / EN):

| Clave | ES | EN |
|---|---|---|
| `project.back` | Proyectos | Projects |
| `project.client` | Cliente | Client |
| `project.platform` | Plataforma | Platform |
| `project.builtWith` | Construido con | Built with |
| `project.links` | Enlaces | Links |
| `project.private` | Proyecto privado, sin enlace público. | Private project, no public link. |
| `project.ask.title` | ¿Necesitas algo parecido? | Need something similar? |
| `project.ask.text` | Cuéntame tu idea y te propongo cómo hacerla. | Tell me your idea and I'll propose how to build it. |
| `project.ask.cta` | Cuéntame tu proyecto | Tell me about your project |
| `project.all` | Todos los proyectos | All projects |
| `project.next` | Siguiente | Next |
| `carousel.prev` | Imagen anterior | Previous image |
| `carousel.next` | Imagen siguiente | Next image |
| `carousel.goto` | Ver imagen | Show image |

**CSS:** sale de `.detail .wrap`, `.dgrid`, `.dside`, `.gal`, `.thumbs`, `.story` y `.nextp` de la maqueta.
- Contenedor de 1060px. Columnas `minmax(0,680px) 300px` con 48px de separación; a ≤ 980px queda una sola columna y la ficha pasa a `position: static`.
- Texto de la historia a 17px con interlineado 1.75.
- Flechas de la galería siempre visibles.

- [ ] **Paso 4: Regenerar y verificar**

1. `npm run build:pages`, y después `npm test`. Todo en verde salvo el blog (Tarea 9).
2. En el navegador revisa `/project/agrosalas/`, `/project/autotest-licencia/` (una sola imagen, sin controles) y `/project/u-learning/` (encuadre `contain`):
   - a 1280px, sin hueco a la derecha y con la ficha fija al hacer scroll;
   - a 375px, la ficha al final;
   - las miniaturas cambian la imagen;
   - con `?lang=en`, el caso en inglés.
3. Sin JavaScript: `/project/agrosalas/` muestra el caso entero y la ficha.

- [ ] **Paso 5: Commit**

Incluye `project/` y `sitemap.xml`. Mensaje: `feat(proyectos): página de caso con galería 16:10 y ficha lateral`.

---

### Tarea 8: Página de Experiencia

**Archivos:**
- Crear: `experience/index.html`, `test/experience.test.js`
- Modificar: `scripts/build-pages.js` (`buildSitemap`), `assets/css/style.css` (sección "experiencia"), `content/i18n/{es,en}.json`, `test/i18n.test.js` (`PAGES`), `test/seo.test.js` (lista de páginas indexables)
- Regenerar: `sitemap.xml`

**Interfaces:**
- La página es estática y no lleva JS propio. Carga `theme.js`, `icons.js`, `navbar.js`, `footer.js` e `i18n.js`.
- Claves nuevas: `exp.eyebrow` (TRAYECTORIA / CAREER), `exp.title`, `exp.lead`, `exp.cv`, `exp.cv.url`.
- Se reutilizan `about.p1`, `about.p2` y todas las `exp.<empresa>.*`, sin cambiar sus textos.

- [ ] **Paso 1: Escribir los tests que fallan**

`test/experience.test.js`:
- `existe /experience/ con canonical, og, twitter, hreflang y JSON-LD válido`: canonical `https://gonzalo-lozg.me/experience/` y JSON-LD `ProfilePage` con `mainEntity` → `Person`.
- `el CV sale de la clave exp.cv.url y apunta al Drive`.
- `la línea de tiempo trae los cinco puestos sin JS`: aparecen los textos españoles de las 5 `exp.*.company` y de `about.p1`.
- `el title de /experience/ conserva el enfoque Android`: el `<title>` mide entre 30 y 60 caracteres y contiene "Android".
- `el sitemap incluye /experience/`.

Además, `experience/index.html` se añade a `PAGES` en `i18n.test.js`, a la lista de páginas indexables de `seo.test.js` y a la lista del test de fuentes de `home.test.js`.

- [ ] **Paso 2: Correr y ver que fallan**

Comando: `node --test test/experience.test.js`.

- [ ] **Paso 3: Implementar**

- **Contenido:** la cabecera del spec §2.4 (eyebrow, h1, lead y botón del CV con `data-i18n-href="exp.cv.url"`, `target="_blank"`), después `about.p1` / `about.p2`, y después la línea de tiempo. La línea de tiempo se mueve desde el `index.html` de `master`, con el marcado de `.tl` / `.tli` de la maqueta. El puesto actual (Falabella) lleva `.now`.
- **Etiquetas `<head>`:**
  - `<title>`: `Experiencia — Gonzalo López, Android Developer`;
  - `description`: orientada a reclutadores, de ≤ 155 caracteres;
  - hreflang con `?lang=`.
- **Sitemap:** `buildSitemap` añade `${SITE}/experience/` con prioridad `0.7`.
- **CSS:** sale de `.exp-head` y `.tl*` de la maqueta.

- [ ] **Paso 4: Verificar**

1. `npm run build:pages`, y después `npm test`.
2. En el navegador revisa `/experience/` (Express sirve la carpeta):
   - "Experiencia" aparece activo en el menú;
   - el botón del CV abre Drive;
   - ES y EN funcionan;
   - a 375px se ve bien.

- [ ] **Paso 5: Commit**

Mensaje: `feat(experiencia): página /experience/ con trayectoria, sobre mí y CV`.

---

### Tarea 9: Blog sin Bootstrap

**Archivos:**
- Modificar: `articles/index.html`, `article/index.html`, `assets/js/article.js`, `assets/js/utils.js`, `scripts/build-pages.js` (`formatDate`, `buildArticlesIndex`), `assets/css/style.css` (sección "blog"), `content/i18n/{es,en}.json`, `test/seo.test.js`, `test/i18n.test.js`
- Borrar: `assets/js/articles.js` (y su entrada en la lista de fuentes del test "ningún enlace interno…")
- Crear: `test/dates.test.js`
- Regenerar: `article/*/index.html`, `articles/index.html`

**Interfaces:**
- **`formatShortDate(iso: 'AAAA-MM-DD') -> 'DD MMM AAAA'`** en `build-pages.js`. El mes va en mayúsculas en español: ENE FEB MAR ABR MAY JUN JUL AGO SEP OCT NOV DIC.
- **`formatDate(iso)`**, tanto en `utils.js` como en `build-pages.js`, construye la fecha con `new Date(y, m - 1, d)` a partir de `iso.split('-')`. Nunca usa `new Date(iso)`.
- **Lista del blog:**
  - el contenedor es `<ol class="posts" id="articlesContainer">`;
  - cada entrada es `<li class="post"><time datetime="…">DD MMM AAAA</time><div><h2><a href="/article/<slug>/">…</a></h2><p>…</p><div class="chips">…</div></div></li>`, del artículo más reciente al más antiguo;
  - la regex del build pasa a `/(<ol class="posts" id="articlesContainer">)[\s\S]*?(<\/ol>)/`.
- **Plantilla del artículo:**
  - se conservan `<h1 id="articleTitle">`, `<span id="articleDate">` y `<div class="article-body" id="articleContent">…</div>` seguido directamente de `</article>`, porque el build depende de esa forma;
  - se quitan Bootstrap CSS, el `<style>` en línea y el `spinner-border`;
  - el enlace de vuelta usa `a.p-back[href="/articles/"]` con `article.back` ("Blog").

- [ ] **Paso 1: Escribir los tests que fallan**

`test/dates.test.js` corre con la zona horaria forzada:

```js
// Se ejecuta en un proceso hijo con TZ=America/Lima para reproducir el desfase.
const out = execFileSync(process.execPath, ['-e', `
  const { formatDate, formatShortDate } = require('./scripts/build-pages.js');
  console.log(formatDate('2024-03-17') + '|' + formatShortDate('2026-03-26'));
`], { env: { ...process.env, TZ: 'America/Lima' }, cwd: root }).toString().trim();
assert.strictEqual(out, '17 de marzo de 2024|26 MAR 2026');
```

Hay un segundo test igual que carga `formatDate` de `assets/js/utils.js` con `new Function`, como hace `helpers/slug.js`.

Para que el test pueda hacer `require`, `build-pages.js` exporta `{ formatDate, formatShortDate, generateSlug }` y solo ejecuta `main` cuando `require.main === module`.

En `seo.test.js`:
- `el listado del blog va del más reciente al más antiguo`: el orden de los `<h2>` dentro de `#articlesContainer` coincide con `articles.json` ordenado por `date` descendente.
- `/articles/ y /article/ no cargan Bootstrap`: se añaden las dos páginas a la lista del test de fuentes de `home.test.js`.

En `i18n.test.js`, `PAGES` añade `articles/index.html` y `article/index.html`.

- [ ] **Paso 2: Correr y ver que fallan**

Comando: `node --test test/dates.test.js test/seo.test.js`.

- [ ] **Paso 3: Implementar**

- **Cabecera de `/articles/`:** `blog.eyebrow` (BLOG), `blog.title` ("Notas de desarrollo" / "Development notes") y `blog.lead`, con la copia del spec §2.5. `blog.eyebrow` se añade a `IGUALES_A_PROPOSITO`, con un comentario.
- **Título del listado:** `Blog de desarrollo Android y web — Gonzalo López`.
- **`article.js`:** el estado de carga es un `<p class="t-muted">` con `Cargando…`, sin clases de Bootstrap.
- **CSS:** sale de `.blog .wrap` y `.post` de la maqueta: 860px de ancho y fecha en mono en una columna de 110px.
  - El artículo usa una columna de 680px con el mismo texto que `.p-story`.
  - Los títulos h2 y h3 del markdown van en Newsreader.
  - `pre` y `code` van sobre `--surface`, con radio `var(--radius-card)` y IBM Plex Mono.

- [ ] **Paso 4: Regenerar y verificar**

1. `npm run build:pages`, y después `npm test`. Todo en verde, con 0 tests fallando.
2. En el navegador revisa `/articles/` y un artículo con bloques de código, en claro y en oscuro (highlight.js cambia de tema) y a 375px:
   - las fechas coinciden con `articles.json`;
   - "Blog" aparece activo en el menú.

- [ ] **Paso 5: Commit**

Mensaje: `feat(blog): listado y artículo con el sistema Esmeralda, sin Bootstrap; corrige fechas desfasadas`.

---

### Tarea 10: Limpieza, documentación y verificación final

**Archivos:**
- Modificar: `content/i18n/{es,en}.json`, `test/i18n.test.js`, `CLAUDE.md`
- Borrar: los archivos que nada referencie. Candidatos: `assets/img/portfolio/shots/*` si ya ningún HTML ni JSON los nombra; `assets/img/portfolio/cards/web_nekomangacix_home.webp` no se borra, porque sigue en uso.

- [ ] **Paso 1: Test que falla**

En `i18n.test.js`:

```js
test('toda clave de es.json se usa en alguna página o script', () => {
  const fuentes = [...PAGES, 'assets/js/components/navbar.js', 'assets/js/components/footer.js',
    'assets/js/projects.js', 'assets/js/project.js', 'assets/js/project-view.js', 'assets/js/carousel.js',
    'assets/js/home.js', 'assets/js/article.js', 'scripts/build-pages.js'].map(read).join('\n');
  const sinUso = uiKeys(es).filter((k) => !fuentes.includes(`'${k}'`) && !fuentes.includes(`"${k}"`));
  assert.deepStrictEqual(sinUso, [], `claves sin uso: ${sinUso.join(', ')}`);
});
```

Si `ProjectView` arma claves dinámicamente, como `services.${id}.title`, escríbelas literales: el test necesita encontrarlas tal cual.

- [ ] **Paso 2: Correr, borrar las claves sin uso y volver a correr**

Comando: `node --test test/i18n.test.js`. Se borran de los dos diccionarios y de `_review` las claves que salgan sin uso, como `hero.role`, `hero.stack`, `about.title` o `articles.*`. También salen de `IGUALES_A_PROPOSITO` las entradas que ya no existen.

- [ ] **Paso 3: Actualizar `CLAUDE.md`**

- **Estructura:** `experience/`, `carousel.js`, `project-view.js`, `review.json`; se quita `articles.js`.
- **Rutas:** `/experience/`; las páginas de proyecto, de artículo y de experiencia están prerenderizadas y en el sitemap. Se borra el párrafo viejo que decía que no lo estaban.
- **Diseño:** paleta Esmeralda; fuentes Newsreader, IBM Plex Sans e IBM Plex Mono; la nueva escala de radios reemplaza la regla "solo 0 y 4px"; tema claro por defecto; `test/style.test.js` prohíbe los colores crudos.
- **Sistema de proyectos:** el modelo `images` / `case` / `client`, el `fit`, y la regla de que ProjectView es el único renderizador.
- **i18n:** `data-i18n-href` y `content/review.json`.

- [ ] **Paso 4: Verificación final**

1. `npm run build:pages` dos veces, y después `git status`: la segunda corrida no debe cambiar nada. Luego `npm test`, que debe pasar entero.
2. En el navegador, a 1280px y 375px, en claro y en oscuro, en ES y en EN, recorre `/`, `/project/agrosalas/`, `/project/note-ai/`, `/experience/`, `/articles/` y un artículo. Comprueba:
   - consola sin errores;
   - ninguna imagen deformada ni pixelada;
   - ningún hueco a media pantalla;
   - ninguna referencia visible a anime fuera de los propios proyectos.
3. Toma capturas del inicio y de `/project/agrosalas/` para Gonzalo.

- [ ] **Paso 5: Commit**

Mensaje: `chore: limpia claves e imágenes sin uso y documenta el sistema Esmeralda`.

Después se usa superpowers:finishing-a-development-branch. No se hace push sin que Gonzalo lo pida.
