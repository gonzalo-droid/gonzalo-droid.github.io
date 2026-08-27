// Contraste WCAG 2.1 y lectura de custom properties desde un archivo CSS.

function relativeLuminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(hexA, hexB) {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

// Extrae las custom properties del primer bloque cuyo selector coincida.
function parseTokens(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector no encontrado: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const tokens = new Map();
  for (const line of body.split(';')) {
    const m = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
    if (m) tokens.set(m[1], m[2].trim());
  }
  return tokens;
}

module.exports = { contrastRatio, parseTokens, relativeLuminance };
