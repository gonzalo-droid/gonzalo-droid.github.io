// /experience/ es la página del reclutador: trayectoria, "sobre mí" y el CV.
// Es HTML estático, así que todo se comprueba sobre el archivo servido.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const es = JSON.parse(read('content/i18n/es.json'));
const en = JSON.parse(read('content/i18n/en.json'));
const html = read('experience/index.html');

const DRIVE = 'https://drive.google.com/file/d/1aNYpEk3DXCDbyXXamSAKisFue7hUL8C6/view?usp=sharing';
const JOBS = ['falabella', 'talana', 'peruapps', 'tismart', 'freelance'];

test('existe /experience/ con canonical, og, twitter, hreflang y JSON-LD válido', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/gonzalo-lozg\.me\/experience\/">/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /hreflang="en" href="https:\/\/gonzalo-lozg\.me\/experience\/\?lang=en"/);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const page = blocks.flat().find((n) => n['@type'] === 'ProfilePage');
  assert.ok(page, 'falta el nodo ProfilePage');
  assert.strictEqual(page.mainEntity['@type'], 'Person');
});

test('el CV sale de la clave exp.cv.url y apunta al Drive', () => {
  assert.strictEqual(es['exp.cv.url'], DRIVE);
  assert.strictEqual(en['exp.cv.url'], DRIVE);
  const tag = html.match(/<a [^>]*data-i18n-href="exp\.cv\.url"[^>]*>/);
  assert.ok(tag, 'el botón del CV no usa la clave');
  assert.ok(tag[0].includes(`href="${DRIVE}"`) && tag[0].includes('target="_blank"'));
});

test('la línea de tiempo trae los cinco puestos sin JS', () => {
  for (const job of JOBS) {
    assert.ok(html.includes(es[`exp.${job}.company`]), `falta ${job}`);
    assert.ok(html.includes(`data-i18n="exp.${job}.company"`));
  }
  assert.ok(html.includes(es['about.p1']), 'falta el primer párrafo de "sobre mí"');
  assert.strictEqual((html.match(/class="tli now"/g) || []).length, 1, 'solo el puesto actual lleva el punto relleno');
});

test('el title de /experience/ conserva el enfoque Android', () => {
  const title = html.match(/<title>(.*?)<\/title>/s)[1].trim();
  assert.ok(title.length >= 30 && title.length <= 60, `title de ${title.length} caracteres`);
  assert.match(title, /Android/);
  const desc = html.match(/name="description"\s+content="([^"]*)"/)[1];
  assert.ok(desc.length <= 155, `description de ${desc.length} caracteres`);
});

test('el sitemap incluye /experience/', () => {
  assert.match(read('sitemap.xml'), /<loc>https:\/\/gonzalo-lozg\.me\/experience\/<\/loc>/);
});

test('la página carga los scripts de la barra, el pie y el idioma', () => {
  for (const f of ['theme.js', 'icons.js', 'components/navbar.js', 'components/footer.js', 'i18n.js']) {
    assert.ok(html.includes(`/assets/js/${f}"`), `falta ${f}`);
  }
});
