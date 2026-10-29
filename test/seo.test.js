// Medido sobre producción antes de este trabajo: 11 de las 15 URLs del sitemap
// devolvían 404, /articles/ le enseñaba 12 palabras al crawler y la home no
// tenía canonical, twitter:card ni datos estructurados.
//
// Estos tests fijan ese estado para que no vuelva. Comprueban el HTML que se
// sirve, no lo que el JavaScript construye después: lo segundo el crawler no
// lo garantiza.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const exists = (p) => fs.existsSync(path.join(root, p));

const articles = JSON.parse(read('content/articles.json'));
const projects = JSON.parse(read('content/projects.json'));

const { generateSlug: slugify } = require('./helpers/slug');

/** Texto que ve un crawler: sin scripts, estilos ni etiquetas. */
function visibleWords(html) {
  const body = html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/g, ' ');
  return body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
}

test('existe una página prerenderizada por artículo', () => {
  for (const a of articles) {
    const p = `article/${slugify(a.title)}/index.html`;
    assert.ok(exists(p), `falta ${p} — ¿se corrió npm run build:pages?`);
  }
});

test('existe una página prerenderizada por proyecto', () => {
  for (const p of projects) {
    assert.ok(exists(`project/${p.slug}/index.html`), `falta project/${p.slug}/index.html`);
  }
});

test('cada página prerenderizada trae contenido real, no "Cargando…"', () => {
  // El umbral es deliberadamente bajo: detecta la plantilla vacía, no juzga
  // la calidad del texto.
  for (const a of articles) {
    const html = read(`article/${slugify(a.title)}/index.html`);
    assert.ok(!/Cargando\.\.\./.test(html), `${a.title} sigue mostrando el spinner`);
    assert.ok(
      visibleWords(html) > 40,
      `${a.title} solo tiene ${visibleWords(html)} palabras visibles`
    );
  }
  for (const p of projects) {
    const html = read(`project/${p.slug}/index.html`);
    assert.ok(visibleWords(html) > 40, `${p.title} solo tiene ${visibleWords(html)} palabras`);
  }
});

test('el listado del blog lista los artículos en el HTML', () => {
  const html = read('articles/index.html');
  for (const a of articles) {
    assert.ok(html.includes(a.title), `"${a.title}" no aparece en /articles/`);
  }
});

test('toda página indexable declara canonical, og y twitter', () => {
  const pages = [
    'index.html',
    'articles/index.html',
    ...articles.map((a) => `article/${slugify(a.title)}/index.html`),
    ...projects.map((p) => `project/${p.slug}/index.html`),
  ];

  for (const page of pages) {
    const html = read(page);
    assert.match(html, /rel="canonical"/, `${page}: falta canonical`);
    assert.match(html, /property="og:title"/, `${page}: falta og:title`);
    assert.match(html, /name="twitter:card"/, `${page}: falta twitter:card`);
    assert.match(html, /application\/ld\+json/, `${page}: faltan datos estructurados`);
    assert.match(html, /rel="alternate"[^>]*hreflang/, `${page}: falta hreflang`);
  }
});

test('los datos estructurados son JSON válido', () => {
  const pages = ['index.html', 'articles/index.html',
    `article/${slugify(articles[0].title)}/index.html`,
    `project/${projects[0].slug}/index.html`];

  for (const page of pages) {
    for (const m of read(page).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      assert.doesNotThrow(() => JSON.parse(m[1]), `${page}: JSON-LD inválido`);
    }
  }
});

test('title y description de la home caben en el resultado de búsqueda', () => {
  const html = read('index.html');
  const title = html.match(/<title>(.*?)<\/title>/s)[1].trim();
  const desc = html.match(/name="description"\s+content="([^"]*)"/)[1];

  assert.ok(title.length <= 60, `title de ${title.length} car.: Google lo corta en ~60`);
  assert.ok(title.length >= 30, `title de ${title.length} car.: desaprovecha espacio`);
  assert.ok(desc.length <= 160, `description de ${desc.length} car.: se corta en ~155`);
  assert.match(title, /Gonzalo López/, 'el title debería llevar su nombre');
});

test('el sitemap solo declara URLs que existen en el repo', () => {
  // Este es el fallo que motivó todo: 11 de 15 entradas devolvían 404.
  const xml = read('sitemap.xml');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  assert.ok(locs.length > 0, 'el sitemap está vacío');

  for (const loc of locs) {
    const p = loc.replace('https://gonzalo-lozg.me', '').replace(/\/$/, '');
    if (p === '') continue;
    const candidates = [p, `${p}/index.html`, p.replace(/^\//, '')];
    assert.ok(
      candidates.some((c) => exists(c.replace(/^\//, ''))),
      `el sitemap declara ${loc}, que no existe en el repo`
    );
  }
});

test('el sitemap incluye todos los artículos y proyectos', () => {
  const xml = read('sitemap.xml');
  for (const a of articles) {
    assert.ok(xml.includes(`/article/${slugify(a.title)}`), `falta ${a.title} en el sitemap`);
  }
  for (const p of projects) {
    assert.ok(xml.includes(`/project/${p.slug}`), `falta ${p.title} en el sitemap`);
  }
});

test('ninguna página carga Bootstrap Icons', () => {
  // Costaba 88 KB de CSS más 112 KB de fuente para dibujar ocho glifos, con
  // font-display: block, así que los iconos no aparecían hasta descargarla.
  const pages = ['index.html', 'articles/index.html', 'article/index.html', 'project/index.html'];
  for (const page of pages) {
    assert.ok(!/bootstrap-icons/.test(read(page)), `${page} sigue cargando Bootstrap Icons`);
    assert.ok(!/class="bi bi-/.test(read(page)), `${page} sigue usando clases bi-*`);
  }
});

test('cada proyecto tiene su variante de tarjeta a 600px', () => {
  for (const p of projects) {
    const card = p.image.replace('/portfolio/', '/portfolio/cards/').replace(/^\//, '');
    assert.ok(exists(card), `falta la variante de tarjeta ${card}`);

    const full = fs.statSync(path.join(root, p.image.replace(/^\//, ''))).size;
    const small = fs.statSync(path.join(root, card)).size;
    assert.ok(small <= full, `la variante de ${p.title} pesa más que la original`);
  }
});

test('las URLs canónicas llevan barra final, que es lo que sirve GitHub Pages', () => {
  // GitHub Pages sirve article/<slug>/index.html y redirige 301 la versión sin
  // barra. Un canonical sin barra apunta a una redirección que vuelve a la
  // propia página: señal confusa para el indexador, y un salto extra por clic.
  const pages = [
    ...articles.map((a) => `article/${slugify(a.title)}/index.html`),
    ...projects.map((p) => `project/${p.slug}/index.html`),
  ];

  for (const page of pages) {
    const canonical = read(page).match(/rel="canonical"[^>]*href="([^"]*)"/)[1];
    assert.ok(
      canonical.endsWith('/'),
      `${page}: canonical sin barra final → ${canonical}`
    );
  }

  const xml = read('sitemap.xml');
  for (const loc of [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])) {
    assert.ok(loc.endsWith('/'), `el sitemap declara ${loc}, que redirige`);
  }
});

test('ningún enlace interno apunta a una URL que redirige', () => {
  const sources = ['assets/js/projects.js', 'assets/js/articles.js', 'assets/js/home.js'];
  for (const src of sources) {
    const bad = [...read(src).matchAll(/href="\/(article|project)\/[^"]*[^/"]"/g)];
    assert.deepStrictEqual(
      bad.map((m) => m[0]), [],
      `${src} enlaza sin barra final: provoca un 301 en cada clic`
    );
  }
});
