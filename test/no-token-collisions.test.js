const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

// tokens.css y style.css se cargan ambos en <head>, en ese orden, y ambos
// declaran custom properties en :root (y en [data-theme="dark"]). Si el mismo
// nombre aparece en los dos archivos, la declaración de style.css —que carga
// después— gana en silencio y pisa el valor del token, sin que ningún error
// de CSS lo señale. test/tokens.test.js no puede detectar esto porque solo
// lee tokens.css de disco: nunca observa el cascade final que ve el navegador.

function declaredCustomProperties(css) {
  const names = new Set();
  // Una declaración de custom property empieza al comienzo de línea (tras
  // solo espacios) con "--nombre:". Esto evita capturar usos como
  // "var(--nombre)", que nunca aparecen al inicio de línea en estos archivos.
  const re = /^[ \t]*(--[a-zA-Z0-9-]+)\s*:/gm;
  let match;
  while ((match = re.exec(css)) !== null) {
    names.add(match[1]);
  }
  return names;
}

test('tokens.css y style.css no declaran la misma variable CSS', () => {
  const tokensPath = path.join(__dirname, '..', 'assets', 'css', 'tokens.css');
  const stylePath = path.join(__dirname, '..', 'assets', 'css', 'style.css');

  const tokensCss = fs.readFileSync(tokensPath, 'utf8');
  const styleCss = fs.readFileSync(stylePath, 'utf8');

  const tokenNames = declaredCustomProperties(tokensCss);
  const styleNames = declaredCustomProperties(styleCss);

  const collisions = [...tokenNames].filter((name) => styleNames.has(name)).sort();

  assert.deepStrictEqual(
    collisions,
    [],
    `style.css redeclara ${collisions.length} variable(s) que ya existen en tokens.css: ` +
      `${collisions.join(', ')}. Ambos archivos cargan en :root y style.css lo hace después, ` +
      'así que su declaración gana en silencio y pisa el valor del design token en todo el ' +
      'sitio (el navegador nunca avisa de esto). Si la regla de style.css es legado y todavía ' +
      'hace falta, renómbrala (p.ej. "--nombre-legacy") en vez de reutilizar el nombre del token.'
  );
});
