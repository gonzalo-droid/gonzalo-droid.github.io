// ProjectView.render pinta la página de proyecto. La usan project.js en el
// navegador y build-pages.js al prerenderizar: el HTML sale idéntico.
const { test } = require('node:test');
const assert = require('node:assert');
const ProjectView = require('../assets/js/project-view.js');

const t = (k) => k;
const base = {
  slug: 'demo',
  title: 'Demo',
  summary: 'Resumen',
  platforms: ['android', 'web'],
  tech: ['Kotlin', 'Compose', 'Room', 'Firebase'],
  images: [{ src: '/assets/img/portfolio/a.webp', fit: 'cover' }],
  case: { context: ['C1'], problem: ['P1'], solution: ['S1', 'S2'], result: ['R1'] },
  links: [],
};
const render = (over = {}) => {
  const project = { ...base, ...over };
  return ProjectView.render({ project, summary: project.summary, caseText: project.case, t, next: { slug: 'next-slug', title: 'Next' } });
};

test('el caso sale en párrafos, en orden y sin títulos ni listas', () => {
  const html = render();
  const order = ['<p>C1</p>', '<p>P1</p>', '<p>S1</p>', '<p>S2</p>', '<p>R1</p>'].map((s) => html.indexOf(s));
  for (const i of order) assert.ok(i > -1, 'falta un párrafo');
  assert.deepStrictEqual(order, [...order].sort((a, b) => a - b));
  for (const bad of ['<h2', '<ul', '<article']) assert.ok(!html.includes(bad), `la salida contiene ${bad}`);
});

test('la fila Cliente solo aparece si hay cliente', () => {
  assert.ok(!render().includes('project.client'));
  const html = render({ client: 'ACME S.A.' });
  assert.ok(html.includes('project.client'));
  assert.ok(html.includes('ACME S.A.'));
});

test('sin enlaces dice proyecto privado', () => {
  assert.match(render(), /class="p-private">project\.private</);
});

test('el primer enlace es relleno y el resto con borde', () => {
  const html = render({ links: [{ label: 'Play Store', url: 'https://a' }, { label: 'Web', url: 'https://b' }] });
  assert.match(html, /<a class="btn" href="https:\/\/a" target="_blank" rel="noopener">Play Store<\/a>/);
  assert.match(html, /<a class="btn btn-ghost" href="https:\/\/b" target="_blank" rel="noopener">Web<\/a>/);
  assert.ok(!html.includes('project.private'));
});

test('pide contacto y enlaza al siguiente proyecto', () => {
  const html = render();
  assert.match(html, /href="\/#contacto"/);
  assert.match(html, /href="\/project\/next-slug\/"/);
  assert.ok(html.includes('project.next: Next →'));
  assert.match(html, /<a class="p-back" href="\/#proyectos">/);
});

test('muestra todos los chips y las plataformas con su nombre', () => {
  const html = render();
  for (const tech of base.tech) assert.ok(html.includes(`<span class="chip">${tech}</span>`));
  assert.ok(html.includes('Android · Web'));
});

test('las decisiones técnicas cierran la historia si existen', () => {
  const html = render({ decisions: 'Elegí Room' });
  assert.ok(html.indexOf('<p>Elegí Room</p>') > html.indexOf('<p>R1</p>'));
});

test('escapa el texto del proyecto', () => {
  const html = render({ title: '<b>x</b>' });
  assert.ok(!html.includes('<b>x</b>'));
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;'));
});

test('caseParagraphs omite partes vacías o ausentes', () => {
  assert.deepStrictEqual(ProjectView.caseParagraphs({ context: ['a'], problem: [], solution: ['b', ''] }), ['a', 'b']);
  assert.deepStrictEqual(ProjectView.caseParagraphs(undefined), []);
});
