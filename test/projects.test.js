const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const projects = JSON.parse(
  fs.readFileSync(path.join(root, 'content', 'projects.json'), 'utf8')
);

const PLATFORMS = ['android', 'ios', 'kmm', 'web'];

// El número es el inventario actual, no un tope: sube a propósito cuando se
// añade un proyecto. Está fijado para que una pérdida accidental de entradas
// —al reagrupar o al editar el JSON a mano— falle en vez de pasar inadvertida.
test('el inventario de proyectos es el esperado', () => {
  assert.strictEqual(projects.length, 8);
});

// Los 11 bloques originales se agruparon por producto: U-Learning, Admin Lotes
// y Solti-CRM absorbieron sus variantes por plataforma en vez de repetirse.
test('no hay productos repetidos por plataforma', () => {
  const titles = projects.map((p) => p.title.toLowerCase());
  assert.strictEqual(new Set(titles).size, titles.length, 'hay títulos duplicados');

  for (const t of titles) {
    assert.ok(
      !/\b(android|ios|web|kmm)\b/.test(t),
      `el título "${t}" nombra una plataforma: debería agruparse en un solo producto`
    );
  }
});

test('cada proyecto tiene los campos obligatorios', () => {
  for (const p of projects) {
    assert.ok(p.slug, `falta slug en ${p.title}`);
    assert.ok(p.title, 'falta title');
    assert.ok(p.summary, `falta summary en ${p.title}`);
    assert.ok(Array.isArray(p.platforms) && p.platforms.length > 0, `falta platforms en ${p.title}`);
    assert.ok(Array.isArray(p.tech) && p.tech.length > 0, `falta tech en ${p.title}`);
    assert.ok(p.image, `falta image en ${p.title}`);
  }
});

test('el resumen de la tarjeta cabe en una línea', () => {
  for (const p of projects) {
    assert.ok(
      p.summary.length <= 120,
      `el summary de ${p.title} tiene ${p.summary.length} caracteres, máximo 120`
    );
  }
});

test('los slugs son únicos', () => {
  const slugs = projects.map((p) => p.slug);
  assert.strictEqual(new Set(slugs).size, slugs.length);
});

test('las plataformas son valores conocidos', () => {
  for (const p of projects) {
    for (const platform of p.platforms) {
      assert.ok(PLATFORMS.includes(platform), `plataforma desconocida "${platform}" en ${p.title}`);
    }
  }
});

test('las imágenes referenciadas existen en disco', () => {
  for (const p of projects) {
    const referenced = [p.image, ...(p.gallery || [])];
    if (p.shot) referenced.push(p.shot); // shot es opcional: solo los del hero
    for (const img of referenced) {
      const file = path.join(root, img.replace(/^\//, ''));
      assert.ok(fs.existsSync(file), `no existe la imagen ${img} (proyecto ${p.title})`);
    }
  }
});

test('el bloque de decisiones técnicas es opcional', () => {
  for (const p of projects) {
    if ('decisions' in p) {
      assert.strictEqual(typeof p.decisions, 'string');
    }
  }
});
