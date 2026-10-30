// Una fecha "AAAA-MM-DD" sin hora se interpreta en UTC con new Date(iso), y en
// Lima (UTC-5) se mostraba el día anterior: el artículo del 17 de marzo salía
// como "16 de marzo". Los tests corren en un proceso hijo con TZ=America/Lima
// para reproducirlo en cualquier máquina.
const { test } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const inLima = (code) => execFileSync(process.execPath, ['-e', code], {
  env: { ...process.env, TZ: 'America/Lima' }, cwd: root,
}).toString().trim();

test('build-pages muestra la fecha del día que dice, también en Lima', () => {
  const out = inLima(`
    const { formatDate, formatShortDate } = require('./scripts/build-pages.js');
    console.log(formatDate('2024-03-17') + '|' + formatShortDate('2026-03-26'));
  `);
  assert.strictEqual(out, '17 de marzo de 2024|26 MAR 2026');
});

test('utils.js muestra la fecha del día que dice, también en Lima', () => {
  const out = inLima(`
    const fs = require('node:fs');
    const src = fs.readFileSync('assets/js/utils.js', 'utf8');
    const formatDate = new Function(src + '; return formatDate;')();
    console.log(formatDate('2024-03-17'));
  `);
  assert.strictEqual(out, '17 de marzo de 2024');
});

test('formatShortDate cubre los doce meses en español', () => {
  const out = inLima(`
    const { formatShortDate } = require('./scripts/build-pages.js');
    console.log(Array.from({ length: 12 }, (_, i) => formatShortDate('2025-' + String(i + 1).padStart(2, '0') + '-01')).join(','));
  `);
  assert.strictEqual(out, ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'].map((m) => `01 ${m} 2025`).join(','));
});

test('cargar build-pages.js no regenera nada', () => {
  // Si require() ejecutara main, los tests reescribirían las páginas.
  const out = inLima(`require('./scripts/build-pages.js'); console.log('ok');`);
  assert.strictEqual(out, 'ok');
});
