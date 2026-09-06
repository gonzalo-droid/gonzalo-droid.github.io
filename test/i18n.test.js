// El sitio es bilingüe ES/EN. Estos tests protegen los tres fallos que la
// traducción manual comete siempre: una clave que existe en un idioma y no en
// el otro, un data-i18n que apunta a una clave inexistente, y una cadena que
// se queda en español porque nadie la tradujo.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));

const es = json('content/i18n/es.json');
const en = json('content/i18n/en.json');
const projects = json('content/projects.json');

// `projects` y `_review` son metadatos de en.json, no cadenas de interfaz.
const uiKeys = (dict) => Object.keys(dict).filter((k) => k !== 'projects' && k !== '_review');

const PAGES = ['index.html', 'project/index.html'];

test('los dos diccionarios tienen exactamente las mismas claves', () => {
  const a = uiKeys(es).sort();
  const b = uiKeys(en).sort();

  const soloEs = a.filter((k) => !b.includes(k));
  const soloEn = b.filter((k) => !a.includes(k));

  assert.deepStrictEqual(soloEs, [], `claves solo en es.json: ${soloEs.join(', ')}`);
  assert.deepStrictEqual(soloEn, [], `claves solo en en.json: ${soloEn.join(', ')}`);
});

test('ninguna cadena está vacía', () => {
  for (const [lang, dict] of [['es', es], ['en', en]]) {
    for (const key of uiKeys(dict)) {
      assert.ok(
        typeof dict[key] === 'string' && dict[key].trim().length > 0,
        `${lang}.json: "${key}" está vacía`
      );
    }
  }
});

test('todo data-i18n del HTML apunta a una clave que existe', () => {
  const known = new Set(uiKeys(es));

  for (const page of PAGES) {
    const html = read(page);
    const used = [...html.matchAll(/data-i18n(?:-html|-aria|-title)?="([^"]+)"/g)].map((m) => m[1]);

    assert.ok(used.length > 0, `${page} no tiene ningún data-i18n`);

    for (const key of used) {
      assert.ok(known.has(key), `${page} usa la clave "${key}", que no está en es.json`);
    }
  }
});

test('los enlaces de la navbar están cableados a claves', () => {
  const navbar = read('assets/js/components/navbar.js');
  const known = new Set(uiKeys(es));

  for (const key of [...navbar.matchAll(/key:\s*'([^']+)'/g)].map((m) => m[1])) {
    assert.ok(known.has(key), `navbar.js usa la clave "${key}", que no está en es.json`);
  }
  assert.match(navbar, /data-lang-option="es"/);
  assert.match(navbar, /data-lang-option="en"/);
});

test('cada proyecto tiene traducción inglesa de resumen y highlights', () => {
  const translated = en.projects || {};

  for (const p of projects) {
    const entry = translated[p.slug];
    assert.ok(entry, `falta la traducción inglesa del proyecto "${p.slug}"`);
    assert.ok(entry.summary, `falta summary en inglés de "${p.slug}"`);
    assert.strictEqual(
      (entry.highlights || []).length,
      p.highlights.length,
      `"${p.slug}" tiene ${p.highlights.length} highlights en español y ` +
        `${(entry.highlights || []).length} en inglés`
    );
  }
});

test('ninguna traducción inglesa quedó copiada del español', () => {
  // Un descuido habitual: copiar el bloque español al archivo inglés y no
  // traducirlo. Se exceptúan las cadenas que son idénticas por diseño.
  const IGUALES_A_PROPOSITO = new Set([
    'hero.role',            // "Android Developer": el cargo no se traduce
    'hero.stack',           // lista de tecnologías
    'nav.blog',             // "Blog"
    'projects.filter.android',
    'projects.filter.ios',
    'projects.filter.kmm',
    'projects.filter.web',
    'project.stack',        // "Stack"
    'footer.rights',        // nombre propio
    // Cuatro puestos son literalmente "Android Developer" en ambos idiomas.
    // Se listan uno a uno en vez de exceptuar el patrón `.role`: si mañana
    // aparece un cargo que sí necesita traducción, el test debe cazarlo.
    'exp.falabella.role',
    'exp.talana.role',
    'exp.peruapps.role',
    'exp.tismart.role',
    // Nombres propios de empresa en países hispanohablantes: no se traducen.
    // "PeruAPPS - Perú"/"TiSmart - Perú" sí cambian porque el país va en
    // inglés, y "Proyectos Independientes" es un descriptor, no un nombre.
    'exp.falabella.company',
    'exp.talana.company',
  ]);

  for (const key of uiKeys(es)) {
    if (IGUALES_A_PROPOSITO.has(key)) continue;
    // Los periodos son fechas: coinciden cuando la abreviatura del mes es la
    // misma en los dos idiomas ("Jul 2022 - Sep 2022"). Se comprueban aparte.
    if (key.endsWith('.period')) continue;
    assert.notStrictEqual(
      en[key],
      es[key],
      `"${key}" es idéntica en ambos idiomas: ¿se olvidó traducir?`
    );
  }
});

test('los periodos en inglés no arrastran meses ni palabras en español', () => {
  // Coincidir es legítimo (Jul, Sep, Oct se abrevian igual); arrastrar "Ago"
  // o "Presente" al inglés no lo es.
  const SOLO_ES = /\b(Ene|Abr|Ago|Dic|Presente|Actualidad)\b/;

  for (const key of uiKeys(es).filter((k) => k.endsWith('.period'))) {
    assert.ok(
      !SOLO_ES.test(en[key]),
      `${key} en inglés contiene español: "${en[key]}"`
    );
  }
});

test('_review solo nombra claves que existen', () => {
  for (const key of en._review || []) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(en, key),
      `_review nombra "${key}", que no existe en en.json`
    );
  }
});
