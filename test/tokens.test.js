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
const TEXT_ON_BG = ['--text', '--text-muted', '--accent'];

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

  test(`tema ${theme.name}: los tokens de texto cumplen AA sobre --surface`, () => {
    const t = parseTokens(css, theme.selector);
    const surface = t.get('--surface');
    assert.ok(surface, `${theme.selector} debe definir --surface`);
    for (const token of TEXT_ON_BG) {
      const ratio = contrastRatio(t.get(token), surface);
      assert.ok(ratio >= 4.5, `${token} sobre --surface da ${ratio.toFixed(2)}:1, hace falta 4.5:1`);
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
}

// Test de escala de espaciado fuera del loop — se define una sola vez en :root
test('define la escala de espaciado completa', () => {
  const t = parseTokens(css, ':root');
  for (let i = 1; i <= 10; i++) {
    assert.ok(t.get(`--sp-${i}`), `falta --sp-${i}`);
  }
});

test('el sistema tiene un solo acento y la escala de radios', () => {
  const t = parseTokens(css, ':root');
  for (const gone of ['--accent-2', '--border-strong', '--cut', '--font-display', '--radius-sm']) {
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
