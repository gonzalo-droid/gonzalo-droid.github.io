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

test('existe la plantilla de la página de detalle', () => {
  assert.ok(fs.existsSync(path.join(root, 'project', 'index.html')));
});

test('la plantilla carga el renderizador y los tokens', () => {
  const html = read('project/index.html');
  assert.match(html, /assets\/js\/project\.js/);
  assert.match(html, /assets\/css\/tokens\.css/);
  assert.match(html, /id="projectDetail"/);
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
  assert.match(grid, /href="\/project\/\$\{p\.slug\}"/);

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
    assert.ok(p.image, `falta image en ${p.title}`);
  }
});

test('las imágenes de la galería existen en disco', () => {
  for (const p of projects) {
    for (const img of [p.image, ...(p.gallery || [])]) {
      assert.ok(
        fs.existsSync(path.join(root, img.replace(/^\//, ''))),
        `no existe ${img} (proyecto ${p.title})`
      );
    }
  }
});
