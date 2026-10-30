// El inicio le habla a un cliente: banner, proyectos, servicios y contacto.
// Sobre mí, la trayectoria y los artículos viven en sus propias páginas.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const html = read('index.html');

const section = (id) => {
  const start = html.indexOf(`id="${id}"`);
  assert.ok(start > -1, `falta la sección ${id}`);
  return html.slice(start, html.indexOf('</section>', start));
};

const WA = 'https://wa.me/51924262747?text=Hola%20Gonzalo%2C%20vi%20tu%20portafolio%20y%20quiero%20contarte%20sobre%20un%20proyecto';

test('el inicio tiene banner, proyectos, servicios y contacto, en ese orden', () => {
  const at = ['hero', 'proyectos', 'servicios', 'contacto'].map((id) => html.indexOf(`id="${id}"`));
  for (const i of at) assert.ok(i > -1);
  assert.deepStrictEqual(at, [...at].sort((a, b) => a - b));
});

test('sobre mí, experiencia y artículos salieron del inicio', () => {
  for (const gone of ['id="about"', 'id="experience"', 'id="articles"', 'hero-shots', 'latestArticles']) {
    assert.ok(!html.includes(gone), `el inicio todavía contiene ${gone}`);
  }
});

test('el banner no tiene imágenes ni estadísticas', () => {
  const hero = section('hero');
  assert.ok(!/<img|<figure/.test(hero), 'el banner tiene imágenes');
  assert.match(hero, /href="#contacto"/);
  assert.match(hero, /href="#proyectos"/);
});

test('WhatsApp abre el chat con el mensaje escrito', () => {
  const contact = section('contacto');
  const tag = contact.match(/<a [^>]*class="[^"]*\bwa\b[^"]*"[^>]*>/);
  assert.ok(tag, 'falta el botón de WhatsApp');
  assert.ok(tag[0].includes(`href="${WA}"`), 'el href de WhatsApp no es el del spec');
  assert.ok(tag[0].includes('target="_blank"'));
  assert.ok(tag[0].includes('data-i18n-href="contact.whatsapp.url"'));
  assert.match(contact, /mailto:gonzalo\.lozg@gmail\.com/);
  assert.match(contact, /class="copy-mail"/);
});

test('los ejemplos de servicios enlazan a sus proyectos', () => {
  const services = section('servicios');
  for (const slug of ['agrosalas', 'nekomangacix', 'quote-anime', 'autotest-licencia', 'note-ai']) {
    assert.ok(services.includes(`href="/project/${slug}/"`), `servicios no enlaza a ${slug}`);
  }
});

test('solo las tarjetas de servicios se animan', () => {
  const animated = [...html.matchAll(/<[^>]*data-animate[^>]*>/g)];
  assert.strictEqual(animated.length, 3);
  for (const m of animated) assert.ok(html.indexOf(m[0]) > html.indexOf('id="servicios"') && html.indexOf(m[0]) < html.indexOf('id="contacto"'));
});

test('el inicio carga carousel.js antes que projects.js', () => {
  const order = ['icons.js', 'navbar.js', 'footer.js', 'utils.js', 'i18n.js', 'carousel.js', 'projects.js', 'home.js']
    .map((f) => html.indexOf(`/assets/js/${f.includes('bar') || f.includes('footer') ? 'components/' : ''}${f}"`));
  for (const i of order) assert.ok(i > -1, 'falta un script');
  assert.deepStrictEqual(order, [...order].sort((a, b) => a - b));
});

// Las páginas rediseñadas usan Newsreader e IBM Plex. Archivo y JetBrains Mono
// eran de Mecha, y Bootstrap CSS chocaba con el sistema de tokens.
const PAGES_SIN_PILA_VIEJA = ['index.html', 'project/index.html'];

test('ninguna página carga Archivo, JetBrains Mono ni Bootstrap CSS', () => {
  for (const page of PAGES_SIN_PILA_VIEJA) {
    const src = read(page);
    for (const bad of [/family=Archivo/, /JetBrains\+Mono/, /bootstrap(\.min)?\.css/]) {
      assert.ok(!bad.test(src), `${page} carga ${bad}`);
    }
    assert.ok(src.includes('family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap'),
      `${page} no carga las fuentes del sistema`);
  }
});
