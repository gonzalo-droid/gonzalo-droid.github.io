// theme.js corre en <head> antes del primer pintado. Se ejecuta aquí en un
// contexto mínimo que imita lo que toca del navegador.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'js', 'theme.js'), 'utf8');

function run({ systemDark = false, saved = null } = {}) {
  const attrs = new Map();
  const classes = new Set();
  const store = new Map(saved ? [['theme', saved]] : []);
  const ctx = {
    document: {
      readyState: 'complete',
      documentElement: {
        classList: { add: (c) => classes.add(c) },
        setAttribute: (k, v) => attrs.set(k, v),
        getAttribute: (k) => attrs.get(k) ?? null,
      },
      getElementById: () => null,
      addEventListener() {},
    },
    localStorage: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
    },
  };
  ctx.window = {
    matchMedia: () => ({ matches: systemDark, addEventListener() {} }),
  };
  vm.runInNewContext(src, ctx);
  return { theme: attrs.get('data-theme'), classes };
}

test('con el sistema en oscuro y sin elección guardada, arranca en claro', () => {
  assert.strictEqual(run({ systemDark: true }).theme, 'light');
});

test('respeta el oscuro que el visitante eligió', () => {
  assert.strictEqual(run({ saved: 'dark' }).theme, 'dark');
});

test('añade la clase js antes de pintar', () => {
  assert.ok(run().classes.has('js'));
});
