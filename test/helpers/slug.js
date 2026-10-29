// Carga la implementación REAL de generateSlug desde assets/js/utils.js, en
// vez de reescribirla aquí. Una tercera copia en los tests es lo que hizo que
// cambiar los slugs rompiera cuatro casos a la vez: los tests seguían
// calculando los nombres viejos.
//
// test/slug.test.js comprueba aparte que utils.js y scripts/build-pages.js
// coincidan entre sí.

const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(
  path.join(__dirname, '..', '..', 'assets', 'js', 'utils.js'),
  'utf8'
);

const match = src.match(/function generateSlug\(title\)\s*\{[\s\S]*?\n\}/);
if (!match) throw new Error('No encuentro generateSlug en assets/js/utils.js');

// eslint-disable-next-line no-new-func
const generateSlug = new Function(`${match[0]}; return generateSlug;`)();

module.exports = { generateSlug };
