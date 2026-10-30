// Carousel.html pinta el marcado del carrusel como texto, igual en el
// navegador y en scripts/build-pages.js. Aquí se comprueba sobre el string.
const { test } = require('node:test');
const assert = require('node:assert');
const Carousel = require('../assets/js/carousel.js');

const labels = { prev: 'Anterior', next: 'Siguiente', goto: 'Ver imagen' };
const img = (n, fit = 'cover') => ({ src: `/assets/img/portfolio/${n}.webp`, fit });
const count = (s, needle) => s.split(needle).length - 1;
// Solo la pista de diapositivas, sin las miniaturas de la galería.
const track = (html) => html.slice(html.indexOf('car-track'), html.indexOf('car-thumbs') > -1 ? html.indexOf('car-thumbs') : undefined);

test('una sola imagen no pinta controles', () => {
  for (const variant of ['card', 'gallery']) {
    const html = Carousel.html([img('a')], { alt: 'X', variant, href: '/project/x/', labels });
    for (const cls of ['car-nav', 'car-dots', 'car-count', 'car-thumbs']) {
      assert.ok(!html.includes(cls), `${variant}: no debería pintar ${cls}`);
    }
  }
});

test('tres imágenes pintan flechas con nombre, tres puntos y contador 1/3', () => {
  const html = Carousel.html([img('a'), img('b'), img('c')], { alt: 'X', variant: 'card', href: '/project/x/', labels });
  assert.match(html, /<button type="button" class="car-nav car-prev" aria-label="Anterior">/);
  assert.match(html, /<button type="button" class="car-nav car-next" aria-label="Siguiente">/);
  const dots = html.slice(html.indexOf('car-dots'));
  assert.strictEqual(count(dots.slice(0, dots.indexOf('</div>')), '<i'), 3);
  assert.match(html, /<i class="on">/);
  assert.match(html, /class="car-count"[^>]*>1\/3</);
});

test('la tarjeta usa la variante cards/ y enlaza cada diapositiva al proyecto', () => {
  const html = Carousel.html([img('a'), img('b'), img('c')], { alt: 'X', variant: 'card', href: '/project/x/', labels });
  assert.strictEqual(count(html, 'href="/project/x/"'), 3);
  assert.strictEqual(count(html, 'tabindex="-1"'), 3);
  const srcs = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1]);
  assert.strictEqual(srcs.length, 3);
  for (const s of srcs) assert.match(s, /\/portfolio\/cards\//);
});

test('la galería pinta una miniatura por imagen', () => {
  const html = Carousel.html([img('a'), img('b'), img('c')], { alt: 'X', variant: 'gallery', labels });
  assert.match(html, /car-thumbs/);
  assert.strictEqual(count(html, 'data-k="'), 3);
  assert.match(html, /aria-label="Ver imagen 3"/);
  assert.ok(!track(html).includes('/portfolio/cards/'), 'las diapositivas de la galería usan la imagen grande');
  const thumbs = html.slice(html.indexOf('car-thumbs'));
  assert.strictEqual(count(thumbs, '/portfolio/cards/'), 3, 'las miniaturas usan la variante pequeña');
  assert.ok(!html.includes('<a '), 'la galería no enlaza sus diapositivas');
});

test('el encuadre llega a la diapositiva', () => {
  const html = Carousel.html([img('a', 'cover'), img('b', 'contain')], { alt: 'X', variant: 'gallery', labels });
  assert.match(html, /car-slide is-cover/);
  assert.match(html, /car-slide is-contain/);
});

test('solo la primera imagen carga sin lazy', () => {
  const html = Carousel.html([img('a'), img('b')], { alt: 'X', variant: 'gallery', labels });
  const tags = track(html).match(/<img [^>]+>/g);
  assert.strictEqual(tags.length, 2);
  assert.ok(!tags[0].includes('loading="lazy"'));
  assert.ok(tags[1].includes('loading="lazy"'));
  for (const t of tags) assert.match(t, /width="1440" height="900" decoding="async"/);
});

test('escapa el alt', () => {
  const html = Carousel.html([img('a')], { alt: 'a"<b', variant: 'gallery', labels });
  assert.match(html, /alt="a&quot;&lt;b"/);
});

test('cardSrc apunta a la variante de tarjeta', () => {
  assert.strictEqual(Carousel.cardSrc('/assets/img/portfolio/a.webp'), '/assets/img/portfolio/cards/a.webp');
});
