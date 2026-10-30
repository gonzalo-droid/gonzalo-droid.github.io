// content/review.json lista lo que Claude escribió y Gonzalo todavía no
// revisó: los casos en español (`cases`) y sus traducciones (`caseTranslations`).
// Se publican tal cual; la lista existe para que no se olviden.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const json = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

test('review.json existe y solo nombra slugs de projects.json', () => {
  const review = json('content/review.json');
  const slugs = new Set(json('content/projects.json').map((p) => p.slug));
  for (const list of ['cases', 'caseTranslations']) {
    assert.ok(Array.isArray(review[list]), `falta la lista ${list}`);
    for (const slug of review[list]) assert.ok(slugs.has(slug), `${list} nombra "${slug}", que no existe`);
  }
});

test('Agrosalas no está en cases', () => {
  // Su problema y su solución son palabras de Gonzalo, no un borrador.
  assert.ok(!json('content/review.json').cases.includes('agrosalas'));
});
