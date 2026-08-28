#!/usr/bin/env node
// Lista las traducciones inglesas que siguen siendo borrador mío y esperan
// tu revisión. Se marcan en la clave "_review" de content/i18n/en.json:
// borra una clave de esa lista cuando la hayas revisado.
//
//   npm run i18n:review

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const es = JSON.parse(fs.readFileSync(path.join(root, 'content/i18n/es.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'content/i18n/en.json'), 'utf8'));

const pending = en._review || [];

if (pending.length === 0) {
  console.log('\n  Nada pendiente: todas las traducciones están revisadas.\n');
  process.exit(0);
}

console.log(`\n  ${pending.length} traducción(es) pendientes de tu revisión`);
console.log('  Son borradores míos. Edita el inglés y quita la clave de "_review".\n');

for (const key of pending) {
  console.log(`  ── ${key}`);
  console.log(`     ES  ${(es[key] || '(falta)').replace(/<[^>]+>/g, '').slice(0, 150)}`);
  console.log(`     EN  ${(en[key] || '(falta)').replace(/<[^>]+>/g, '').slice(0, 150)}`);
  console.log('');
}

console.log(`  Archivo: content/i18n/en.json\n`);
