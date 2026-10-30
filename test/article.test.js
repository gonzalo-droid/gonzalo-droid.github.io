// article.js pinta la página de un artículo. El slug llega de la URL (o de
// sessionStorage vía 404.html), así que lo controla quien arma el enlace.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'article.js'), 'utf8');

function load() {
  const els = {};
  const el = (id) => (els[id] = els[id] || {
    id, textContent: '', _html: '', children: [],
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    appendChild(c) { this.children.push(c); this._html += c.outerText || ''; return c; },
    replaceChildren(...c) { this.children = c; this._html = ''; },
  });
  const document = {
    getElementById: el,
    addEventListener() {},
    createElement: (tag) => ({ tag, textContent: '', children: [], href: '', className: '',
      appendChild(c) { this.children.push(c); return c; },
      setAttribute(k, v) { this[k] = v; } }),
    querySelectorAll: () => [],
  };
  const ctx = { document, window: { addEventListener() {}, location: { pathname: '/article/x/', hash: '' }, scrollTo() {} },
    sessionStorage: { getItem: () => null, removeItem() {} }, history: { replaceState() {} }, console };
  vm.runInNewContext(src, ctx);
  return { ctx, els };
}

test('el mensaje de error no interpreta HTML que venga del slug', () => {
  const { ctx, els } = load();
  ctx.showError('Artículo no encontrado: <img src=x onerror=alert(1)>');
  const html = els.articleContent.innerHTML;
  assert.ok(!/<img/i.test(html), `el slug llegó como HTML: ${html}`);
  const texts = JSON.stringify(els.articleContent.children.map((c) => [c.textContent, ...c.children.map((x) => x.textContent)]));
  assert.ok(texts.includes('<img src=x onerror=alert(1)>'), 'el mensaje debe mostrarse como texto');
});

test('cargar el artículo no devuelve al lector arriba de la página', () => {
  // La página prerenderizada ya se puede leer mientras marked termina; un
  // scrollTo(0, 0) al final lo arrastraría de vuelta al principio.
  assert.ok(!/window\.scrollTo\(\s*0\s*,\s*0\s*\)/.test(src));
});
