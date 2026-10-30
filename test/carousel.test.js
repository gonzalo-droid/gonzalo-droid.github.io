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

// ---- comportamiento (Carousel.wire) sobre un DOM mínimo simulado ----

function fakeCarousel(n, { withThumbs = false } = {}) {
  const on = () => { const listeners = {}; return { listeners, addEventListener: (t, fn) => (listeners[t] = listeners[t] || []).push(fn) }; };
  const cls = (initial = []) => { const set = new Set(initial); return { set, toggle: (c, v) => (v ? set.add(c) : set.delete(c)), contains: (c) => set.has(c) }; };
  const track = { ...on(), clientWidth: 100, scrollLeft: 0, scrollTo({ left }) { this.scrollLeft = left; } };
  const dots = Array.from({ length: n }, (_, k) => ({ classList: cls(k === 0 ? ['on'] : []) }));
  const count = { textContent: `1/${n}` };
  const mkBtn = (c) => ({ ...on(), classList: cls([c]), dataset: {} });
  const prev = mkBtn('car-prev');
  const next = mkBtn('car-next');
  const thumbs = withThumbs ? Array.from({ length: n }, (_, k) => ({ ...on(), classList: cls(k === 0 ? ['on'] : []), dataset: { k: String(k) }, setAttribute() {}, removeAttribute() {} })) : [];
  const car = {
    dataset: {},
    querySelector: (sel) => ({ '.car-track': track, '.car-count': count }[sel] || null),
    querySelectorAll: (sel) => ({ '.car-dots i': dots, '.car-thumbs button': thumbs, '.car-slide': Array(n).fill({}), '.car-nav': [prev, next] }[sel] || []),
  };
  const root = { querySelectorAll: () => [car] };
  const click = (el) => { const ev = { prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } }; el.listeners.click.forEach((fn) => fn(ev)); return ev; };
  return { root, car, track, dots, count, prev, next, thumbs, click };
}

test('la flecha avanza, actualiza el contador al instante y no abre el proyecto', () => {
  const c = fakeCarousel(3);
  Carousel.wire(c.root);
  const ev = c.click(c.next);
  assert.ok(ev.prevented && ev.stopped, 'la flecha debe frenar el clic para no seguir el enlace de la tarjeta');
  assert.strictEqual(c.track.scrollLeft, 100);
  assert.strictEqual(c.count.textContent, '2/3');
  assert.ok(c.dots[1].classList.contains('on') && !c.dots[0].classList.contains('on'));
});

test('dos clics seguidos avanzan dos imágenes aunque el scroll siga en curso', () => {
  const c = fakeCarousel(3);
  c.track.scrollTo = function () {}; // el scroll suave todavía no se movió
  Carousel.wire(c.root);
  c.click(c.next);
  c.click(c.next);
  assert.strictEqual(c.count.textContent, '3/3');
});

test('al final, la flecha siguiente vuelve a la primera', () => {
  const c = fakeCarousel(2);
  Carousel.wire(c.root);
  c.click(c.next);
  c.click(c.next);
  assert.strictEqual(c.count.textContent, '1/2');
  assert.strictEqual(c.track.scrollLeft, 0);
});

test('una miniatura lleva a su imagen y la marca', () => {
  const c = fakeCarousel(3, { withThumbs: true });
  Carousel.wire(c.root);
  c.thumbs[2].listeners.click[0]();
  assert.strictEqual(c.track.scrollLeft, 200);
  assert.ok(c.thumbs[2].classList.contains('on') && !c.thumbs[0].classList.contains('on'));
});

test('deslizar a mano tras un salto vuelve a seguir la posición real', () => {
  const c = fakeCarousel(3);
  Carousel.wire(c.root);
  c.click(c.next);
  c.track.listeners.pointerdown[0]();
  c.track.scrollLeft = 200;
  c.track.listeners.scrollend[0]();
  assert.strictEqual(c.count.textContent, '3/3');
});

test('wire es idempotente', () => {
  const c = fakeCarousel(3);
  Carousel.wire(c.root);
  Carousel.wire(c.root);
  assert.strictEqual(c.next.listeners.click.length, 1);
});
