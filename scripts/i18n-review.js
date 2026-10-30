#!/usr/bin/env node
// Lista lo que escribí yo y espera tu revisión:
// - las traducciones inglesas marcadas en "_review" de content/i18n/en.json;
// - los casos de proyecto en español ("cases" de content/review.json);
// - las traducciones inglesas de esos casos ("caseTranslations").
// Borra una clave o un slug de su lista cuando lo hayas revisado.
//
//   npm run i18n:review

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const es = JSON.parse(fs.readFileSync(path.join(root, 'content/i18n/es.json'), 'utf8'));
const en = JSON.parse(fs.readFileSync(path.join(root, 'content/i18n/en.json'), 'utf8'));

const review = JSON.parse(fs.readFileSync(path.join(root, 'content/review.json'), 'utf8'));
const projects = JSON.parse(fs.readFileSync(path.join(root, 'content/projects.json'), 'utf8'));
const bySlug = new Map(projects.map((p) => [p.slug, p]));

const pending = en._review || [];
const cases = review.cases || [];
const caseTranslations = review.caseTranslations || [];

const clip = (text) => (text || '(falta)').replace(/<[^>]+>/g, '').slice(0, 150);
const firstContext = (c) => (c && c.context && c.context[0]) || '';

if (pending.length + cases.length + caseTranslations.length === 0) {
  console.log('\n  Nada pendiente: textos y traducciones están revisados.\n');
  process.exit(0);
}

if (pending.length) {
  console.log(`\n  ${pending.length} traducción(es) pendientes de tu revisión`);
  console.log('  Son borradores míos. Edita el inglés y quita la clave de "_review".\n');
  for (const key of pending) {
    console.log(`  ── ${key}`);
    console.log(`     ES  ${clip(es[key])}`);
    console.log(`     EN  ${clip(en[key])}`);
    console.log('');
  }
  console.log('  Archivo: content/i18n/en.json\n');
}

if (cases.length) {
  console.log(`\n  Casos pendientes (${cases.length}): los escribí yo a partir del resumen.`);
  console.log('  Corrige el texto en content/projects.json y quita el slug de "cases".\n');
  for (const slug of cases) {
    console.log(`  ── ${slug}`);
    console.log(`     ${clip(firstContext(bySlug.get(slug)?.case))}`);
    console.log('');
  }
}

if (caseTranslations.length) {
  console.log(`\n  Traducciones de casos (${caseTranslations.length}): el inglés está en content/i18n/en.json → projects.`);
  console.log('  Quita el slug de "caseTranslations" cuando lo revises.\n');
  for (const slug of caseTranslations) {
    console.log(`  ── ${slug}`);
    console.log(`     ES  ${clip(firstContext(bySlug.get(slug)?.case))}`);
    console.log(`     EN  ${clip(firstContext(en.projects?.[slug]?.case))}`);
    console.log('');
  }
}

console.log('  Lista de casos: content/review.json\n');
