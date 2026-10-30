// Las tarjetas de la home enlazan a /project/<slug>. Antes esos enlaces
// existían sin que existieran las páginas, y cada clic daba un 404. Estos
// tests verifican que la ruta esté servida por los dos caminos que tiene el
// sitio: Express en local y el rebote de 404.html en GitHub Pages.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

const projects = JSON.parse(read('content/projects.json'));
const ProjectView = require('../assets/js/project-view.js');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');

test('existe la plantilla de la página de detalle', () => {
  assert.ok(fs.existsSync(path.join(root, 'project', 'index.html')));
});

test('la plantilla carga el renderizador y los tokens', () => {
  const html = read('project/index.html');
  assert.match(html, /assets\/js\/project\.js/);
  assert.match(html, /assets\/css\/tokens\.css/);
  // Un div y no un <article>: la regex del build corta en el cierre del
  // contenedor, y un <article> anidado la confundiría.
  assert.match(html, /<div id="projectDetail"/);
  assert.ok(!html.includes('crumbCurrent'));
});

test('la plantilla carga carousel.js, project-view.js y project.js, en ese orden', () => {
  const html = read('project/index.html');
  const at = ['carousel.js', 'project-view.js', 'project.js'].map((f) => html.indexOf(`/assets/js/${f}"`));
  for (const i of at) assert.ok(i > -1);
  assert.deepStrictEqual(at, [...at].sort((x, y) => x - y));
});

test('la página prerenderizada trae el caso completo en párrafos', () => {
  for (const p of projects) {
    const html = read(`project/${p.slug}/index.html`);
    for (const para of ProjectView.caseParagraphs(p.case)) {
      assert.ok(html.includes(`<p>${ProjectView.escapeHtml(para)}</p>`), `${p.slug}: falta el párrafo "${para.slice(0, 40)}…"`);
    }
    assert.ok(!html.includes('Qué incluye'), `${p.slug}: sigue la lista "Qué incluye"`);
    assert.match(html, new RegExp(`<title[^>]*>${p.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} — Proyecto de Gonzalo López</title>`));
  }
});

test('la página prerenderizada se marca como lista para que project.js no la repinte', () => {
  for (const p of projects) {
    assert.ok(read(`project/${p.slug}/index.html`).includes(`<div id="projectDetail" aria-busy="false" data-slug="${p.slug}">`), p.slug);
  }
  assert.ok(read('project/index.html').includes('<div id="projectDetail" aria-busy="true">'), 'la plantilla sigue sin pintar');
});

test('cada página enlaza al siguiente proyecto, y la última vuelve a la primera', () => {
  projects.forEach((p, i) => {
    const next = projects[(i + 1) % projects.length];
    assert.ok(read(`project/${p.slug}/index.html`).includes(`href="/project/${next.slug}/"`), `${p.slug} no enlaza a ${next.slug}`);
  });
  assert.ok(read('project/solti-crm/index.html').includes('href="/project/nekomangacix/"'));
});

test('la ficha muestra Cliente solo en Agrosalas', () => {
  for (const p of projects) {
    const html = read(`project/${p.slug}/index.html`);
    assert.strictEqual(html.includes('<p class="p-label">Cliente</p>'), p.slug === 'agrosalas', p.slug);
  }
  assert.ok(read('project/agrosalas/index.html').includes('Agrosalas Peru S.R.L.'));
});

test('correr el build dos veces deja los mismos archivos', { timeout: 30000 }, () => {
  const hash = () => crypto.createHash('sha256').update(read('project/agrosalas/index.html') + read('articles/index.html') + read('sitemap.xml')).digest('hex');
  execFileSync(process.execPath, ['scripts/build-pages.js'], { cwd: root, stdio: 'ignore' });
  const first = hash();
  execFileSync(process.execPath, ['scripts/build-pages.js'], { cwd: root, stdio: 'ignore' });
  assert.strictEqual(hash(), first);
});

test('Express sirve /project/:slug', () => {
  const server = read('server.js');
  assert.match(server, /app\.get\('\/project\/:slug'/);
  assert.match(server, /app\.get\('\/project'/);
});

test('404.html rebota /project/<slug> guardando el slug', () => {
  const html = read('404.html');
  assert.match(html, /\\\/project\\\/\(\[\^\/\]\+\)/, 'falta el patrón de /project/<slug>');
  assert.match(html, /sessionStorage\.setItem\('projectSlug'/);
  assert.match(html, /location\.replace\('\/project\/'\)/);
});

test('project.js lee el slug por sessionStorage y por path', () => {
  const js = read('assets/js/project.js');
  assert.match(js, /sessionStorage\.getItem\('projectSlug'\)/);
  assert.match(js, /sessionStorage\.removeItem\('projectSlug'\)/);
  assert.match(js, /\\\/project\\\/\(\[\^\/\]\+\)/);
});

test('todo slug enlazado desde la grilla resuelve a un proyecto', () => {
  // projects.js construye el href como /project/${p.slug}; el detalle busca
  // por p.slug. Si alguien cambia uno sin el otro, esto lo caza.
  const grid = read('assets/js/projects.js');
  // Con barra final: GitHub Pages redirige la versión sin barra, y un enlace
  // interno que provoca un 301 desperdicia un salto en cada clic.
  assert.match(grid, /`\/project\/\$\{p\.slug\}\/`/);

  for (const p of projects) {
    assert.ok(p.slug, `proyecto sin slug: ${p.title}`);
    assert.match(p.slug, /^[a-z0-9-]+$/, `slug no apto para URL: ${p.slug}`);
  }
});

test('cada proyecto tiene lo mínimo para que su página no salga vacía', () => {
  for (const p of projects) {
    assert.ok(p.title, 'falta title');
    assert.ok(p.summary, `falta summary en ${p.title}`);
    assert.ok(p.tech.length > 0, `falta tech en ${p.title}`);
    assert.ok(p.images.length > 0, `falta images en ${p.title}`);
  }
});

test('las imágenes de la galería existen en disco', () => {
  for (const p of projects) {
    for (const img of p.images.map((i) => i.src)) {
      assert.ok(
        fs.existsSync(path.join(root, img.replace(/^\//, ''))),
        `no existe ${img} (proyecto ${p.title})`
      );
    }
  }
});

test('el fallback <noscript> lista todos los proyectos', () => {
  // La grilla se pinta con JS; el <noscript> es lo único que ve alguien sin
  // JavaScript. Si se añade un proyecto y se olvida aquí, queda invisible.
  const html = read('index.html');
  const block = html.slice(html.indexOf('<noscript>'), html.indexOf('</noscript>'));

  for (const p of projects) {
    assert.ok(
      block.includes(p.title),
      `${p.title} falta en el fallback <noscript> de #portfolio`
    );
  }
});
