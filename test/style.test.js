// style.css es la hoja del sistema Esmeralda. Todo color sale de tokens.css,
// los radios siguen la escala del sistema y las animaciones respetan la puerta
// .js (ver CLAUDE.md): sin JS, nada queda oculto.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'css', 'style.css'), 'utf8');

test('style.css no escribe colores crudos: todo sale de tokens', () => {
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.deepStrictEqual(sinComentarios.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g) || [], []);
});

test('los radios solo usan la escala del sistema', () => {
  const vals = [...css.matchAll(/border-radius:\s*([^;]+);/g)].map((m) => m[1].trim());
  assert.ok(vals.length > 0);
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

test('las flechas del carrusel solo se esconden donde hay puntero que pasa por encima', () => {
  // En pantallas táctiles no hay hover: si la opacidad 0 no va dentro de
  // (hover: hover), las flechas no aparecerían nunca.
  const hover = css.match(/@media \(hover: hover\) \{([\s\S]*?)\n\}/);
  assert.ok(hover && /\.car-nav[^{]*\{[^}]*opacity: 0/.test(hover[1]), 'falta la regla de opacidad dentro de (hover: hover)');
  const fuera = css.replace(hover[0], '');
  assert.ok(!/\.car-nav[^{]*\{[^}]*opacity: 0[;\s]/.test(fuera), 'la opacidad 0 de las flechas está fuera de (hover: hover)');
});
