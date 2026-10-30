// Carrusel de imágenes de los proyectos, sin librerías: scroll-snap para
// deslizar con el dedo y un poco de JS para flechas, puntos y miniaturas.
//
// Es UMD: el navegador lo usa como window.Carousel y scripts/build-pages.js
// lo requiere para prerenderizar las páginas de proyecto con el mismo HTML.

(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.Carousel = api;
})(typeof self !== 'undefined' ? self : this, function () {
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // La tarjeta usa la variante de 600px; la grande queda para la galería.
    const cardSrc = (src) => String(src).replace('/portfolio/', '/portfolio/cards/');

    /**
     * @param {{src: string, fit: 'cover'|'contain'}[]} images
     * @param {{alt: string, variant: 'card'|'gallery', href?: string,
     *          labels: {prev: string, next: string, goto: string}}} opts
     */
    function html(images, opts) {
        const { alt = '', variant = 'card', href = '', labels = {} } = opts || {};
        const isCard = variant === 'card';
        const many = images.length > 1;

        const slides = images.map((img, k) => {
            const src = isCard ? cardSrc(img.src) : img.src;
            const lazy = k === 0 ? '' : ' loading="lazy"';
            const tag = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${lazy} width="1440" height="900" decoding="async">`;
            const cls = `car-slide is-${img.fit === 'contain' ? 'contain' : 'cover'}`;
            // En la tarjeta cada diapositiva es un enlace: el clic en la imagen
            // abre el proyecto y el deslizamiento sigue funcionando. Queda fuera
            // del orden de tabulación porque el título ya enlaza al mismo sitio.
            return isCard && href
                ? `<a class="${cls}" href="${escapeHtml(href)}" tabindex="-1" aria-hidden="true">${tag}</a>`
                : `<div class="${cls}">${tag}</div>`;
        }).join('');

        let controls = '';
        let thumbs = '';
        if (many) {
            controls =
                `<button type="button" class="car-nav car-prev" aria-label="${escapeHtml(labels.prev)}">‹</button>` +
                `<button type="button" class="car-nav car-next" aria-label="${escapeHtml(labels.next)}">›</button>` +
                `<div class="car-dots" aria-hidden="true">${images.map((_, k) => (k === 0 ? '<i class="on"></i>' : '<i></i>')).join('')}</div>` +
                `<span class="car-count" aria-hidden="true">1/${images.length}</span>`;
            if (!isCard) {
                thumbs = `<div class="car-thumbs">${images.map((img, k) =>
                    `<button type="button" data-k="${k}"${k === 0 ? ' class="on" aria-current="true"' : ''} aria-label="${escapeHtml(labels.goto)} ${k + 1}">` +
                    `<img src="${escapeHtml(cardSrc(img.src))}" alt="" loading="lazy" width="600" height="375" decoding="async"></button>`
                ).join('')}</div>`;
            }
        }

        return `<div class="car car-${isCard ? 'card' : 'gallery'}" data-carousel>` +
            `<div class="car-frame"><div class="car-track">${slides}</div>${controls}</div>${thumbs}</div>`;
    }

    // Engancha el comportamiento a todos los carruseles dentro de root.
    // Idempotente: se puede llamar después de cada repintado.
    function wire(root) {
        if (!root || !root.querySelectorAll) return;
        root.querySelectorAll('[data-carousel]').forEach((car) => {
            if (car.dataset.wired === '1') return;
            car.dataset.wired = '1';

            const track = car.querySelector('.car-track');
            const dots = car.querySelectorAll('.car-dots i');
            const count = car.querySelector('.car-count');
            const thumbs = car.querySelectorAll('.car-thumbs button');
            const total = car.querySelectorAll('.car-slide').length;
            if (!track || total < 2) return;

            const current = () => Math.round(track.scrollLeft / (track.clientWidth || 1));
            const go = (k) => track.scrollTo({ left: k * track.clientWidth });

            let pending = false;
            track.addEventListener('scroll', () => {
                if (pending) return;
                pending = true;
                requestAnimationFrame(() => {
                    pending = false;
                    const i = Math.max(0, Math.min(total - 1, current()));
                    dots.forEach((d, k) => d.classList.toggle('on', k === i));
                    if (count) count.textContent = `${i + 1}/${total}`;
                    thumbs.forEach((b, k) => {
                        b.classList.toggle('on', k === i);
                        if (k === i) b.setAttribute('aria-current', 'true');
                        else b.removeAttribute('aria-current');
                    });
                });
            }, { passive: true });

            car.querySelectorAll('.car-nav').forEach((btn) => {
                btn.addEventListener('click', (event) => {
                    // La flecha vive dentro de una tarjeta enlazada: no debe abrir el proyecto.
                    event.preventDefault();
                    event.stopPropagation();
                    const dir = btn.classList.contains('car-prev') ? -1 : 1;
                    const i = current();
                    // Al llegar a un extremo da la vuelta, para que la flecha nunca quede muerta.
                    go((i + dir + total) % total);
                });
            });

            thumbs.forEach((btn) => {
                btn.addEventListener('click', () => go(Number(btn.dataset.k)));
            });
        });
    }

    return { html, wire, cardSrc, escapeHtml };
});
