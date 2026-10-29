// `generateSlug` existe dos veces: en assets/js/utils.js, que genera los
// enlaces en el navegador, y en scripts/build-pages.js, que genera los
// archivos. Si se separan, los enlaces de la home apuntan a páginas que no
// existen — exactamente el 404 que este trabajo vino a arreglar.
//
// Duplicarla es deliberado: utils.js es un script clásico que carga el
// navegador y build-pages.js es CommonJS en Node, y no hay paso de build que
// pueda compartir el módulo sin añadir infraestructura. El seguro es este test.

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

/** Extrae y evalúa la implementación de cada archivo, sin importarlos. */
function loadFrom(file, pattern) {
  const src = read(file);
  const m = src.match(pattern);
  assert.ok(m, `no encuentro generateSlug en ${file}`);
  // eslint-disable-next-line no-new-func
  return new Function(`${m[0]}; return generateSlug;`)();
}

const { generateSlug: slugDelNavegador } = require('./helpers/slug');
const slugDelBuild = loadFrom(
  'scripts/build-pages.js',
  /const generateSlug = \(title\) =>[\s\S]*?\(\^-\|-\$\)\/g, ''\);/
);

const CASOS = [
  ['Introducción a Jetpack Compose', 'introduccion-a-jetpack-compose'],
  ['Integración de IA en Apps Android', 'integracion-de-ia-en-apps-android'],
  ['Coroutines en Android: Programación asíncrona moderna',
   'coroutines-en-android-programacion-asincrona-moderna'],
  ['Inyección de Dependencias en Android con Hilt',
   'inyeccion-de-dependencias-en-android-con-hilt'],
  ['Diseño de Ñandú', 'diseno-de-nandu'],
  ['  Espacios  sobrantes  ', 'espacios-sobrantes'],
  ['¿Qué es MVVM?', 'que-es-mvvm'],
];

test('las dos implementaciones de generateSlug coinciden', () => {
  const titulos = [
    ...JSON.parse(read('content/articles.json')).map((a) => a.title),
    ...CASOS.map(([t]) => t),
  ];

  for (const t of titulos) {
    assert.strictEqual(
      slugDelBuild(t),
      slugDelNavegador(t),
      `"${t}": utils.js da "${slugDelNavegador(t)}" y build-pages.js "${slugDelBuild(t)}"`
    );
  }
});

test('las tildes se transliteran en vez de descartarse', () => {
  for (const [titulo, esperado] of CASOS) {
    assert.strictEqual(slugDelNavegador(titulo), esperado, `fallo en "${titulo}"`);
  }
});

test('ningún slug publicado contiene una tilde perdida', () => {
  // El síntoma del fallo anterior: "introducci-n" con la vocal convertida en
  // guion, que pierde la palabra clave en el resultado de búsqueda.
  for (const a of JSON.parse(read('content/articles.json'))) {
    const slug = slugDelNavegador(a.title);
    assert.ok(/^[a-z0-9-]+$/.test(slug), `slug no apto para URL: ${slug}`);
    assert.ok(
      !/-[a-z]-/.test(slug) || !/ción|sión|ático/i.test(a.title),
      `"${a.title}" → "${slug}": parece que una tilde se convirtió en guion`
    );
  }
});

test('el archivo generado de cada artículo publicado existe con su slug', () => {
  for (const a of JSON.parse(read('content/articles.json'))) {
    const p = `article/${slugDelBuild(a.title)}/index.html`;
    assert.ok(fs.existsSync(path.join(root, p)), `falta ${p}`);
  }
});

test('no quedan páginas huérfanas de artículos despublicados o renombrados', () => {
  // Al cambiar los slugs, las carpetas viejas servirían contenido duplicado
  // bajo otra URL, que es justo lo que Google penaliza.
  const publicados = new Set(
    JSON.parse(read('content/articles.json')).map((a) => slugDelBuild(a.title))
  );
  const enDisco = fs
    .readdirSync(path.join(root, 'article'), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const dir of enDisco) {
    assert.ok(publicados.has(dir), `article/${dir}/ no corresponde a ningún artículo publicado`);
  }
});
