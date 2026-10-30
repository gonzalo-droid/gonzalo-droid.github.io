// HTML de la página de proyecto (/project/<slug>/).
//
// Es el único renderizador de esa página: project.js lo usa en el navegador y
// scripts/build-pages.js lo requiere para prerenderizarla, así el HTML que ve
// Google y el que pinta el JS son el mismo. UMD como carousel.js.
//
// El caso se pinta como párrafos seguidos, sin títulos ni listas: contexto,
// problema, solución y resultado solo ordenan el texto.

(function (root, factory) {
    const Carousel = (root && root.Carousel) || (typeof require === 'function' ? require('./carousel.js') : null);
    const api = factory(Carousel);
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ProjectView = api;
})(typeof self !== 'undefined' ? self : this, function (Carousel) {
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const PLATFORM_LABELS = { android: 'Android', ios: 'iOS', kmm: 'KMM', web: 'Web' };

    const CASE_ORDER = ['context', 'problem', 'solution', 'result'];

    function caseParagraphs(c) {
        if (!c) return [];
        return CASE_ORDER
            .flatMap((part) => (Array.isArray(c[part]) ? c[part] : []))
            .filter((p) => typeof p === 'string' && p.trim() !== '');
    }

    const row = (label, body) =>
        `<div class="p-row"><p class="p-label">${escapeHtml(label)}</p>${body}</div>`;

    function links(project, t) {
        const list = project.links || [];
        if (list.length === 0) return `<p class="p-private">${escapeHtml(t('project.private'))}</p>`;
        return `<div class="p-links">${list.map((l, k) =>
            `<a class="btn${k === 0 ? '' : ' btn-ghost'}" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`
        ).join('')}</div>`;
    }

    /**
     * @param {{project: object, summary: string, caseText: object,
     *          t: (key: string) => string, next: {slug: string, title: string}}} args
     */
    function render({ project, summary, caseText, t, next }) {
        const platforms = project.platforms.map((p) => PLATFORM_LABELS[p] || p).join(' · ');

        const story = caseParagraphs(caseText).map((p) => `<p>${escapeHtml(p)}</p>`);
        if (project.decisions) story.push(`<p>${escapeHtml(project.decisions)}</p>`);

        const gallery = Carousel.html(project.images || [], {
            alt: project.title,
            variant: 'gallery',
            labels: { prev: t('carousel.prev'), next: t('carousel.next'), goto: t('carousel.goto') },
        });

        const side = [
            project.client ? row(t('project.client'), `<p>${escapeHtml(project.client)}</p>`) : '',
            row(t('project.platform'), `<p>${escapeHtml(platforms)}</p>`),
            row(t('project.builtWith'), `<div class="chips">${project.tech.map((x) => `<span class="chip">${escapeHtml(x)}</span>`).join('')}</div>`),
            row(t('project.links'), links(project, t)),
            `<div class="p-ask"><strong>${escapeHtml(t('project.ask.title'))}</strong>` +
                `<span>${escapeHtml(t('project.ask.text'))}</span>` +
                `<a class="btn" href="/#contacto">${escapeHtml(t('project.ask.cta'))}</a></div>`,
        ].join('');

        return `<div class="p-head">` +
                `<a class="p-back" href="/#proyectos">← ${escapeHtml(t('project.back'))}</a>` +
                `<p class="p-plat">${escapeHtml(platforms)}</p>` +
                `<h1>${escapeHtml(project.title)}</h1>` +
                `<p class="p-sum">${escapeHtml(summary)}</p>` +
            `</div>` +
            `<div class="p-grid">` +
                `<div class="p-main">${gallery}<div class="p-story">${story.join('')}</div></div>` +
                `<aside class="p-side">${side}</aside>` +
            `</div>` +
            `<nav class="p-next">` +
                `<a href="/#proyectos">${escapeHtml(t('project.all'))}</a>` +
                (next ? `<a href="/project/${escapeHtml(next.slug)}/">${escapeHtml(t('project.next'))}: ${escapeHtml(next.title)} →</a>` : '') +
            `</nav>`;
    }

    return { render, caseParagraphs, escapeHtml, PLATFORM_LABELS };
});
