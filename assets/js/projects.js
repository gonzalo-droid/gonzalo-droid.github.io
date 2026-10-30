// Pinta la grilla de proyectos del inicio desde content/projects.json.
// El carrusel de cada tarjeta sale de carousel.js, el mismo módulo que usa la
// galería de /project/<slug>/.

async function fetchProjects() {
    const response = await fetch('/content/projects.json');
    if (!response.ok) throw new Error('Error cargando proyectos');
    return response.json();
}

// Traducción con caída al español si i18n aún no cargó o falta la clave.
const tr = (key) => (window.I18n ? window.I18n.t(key) : key);
const trProject = (project, field, fallback) =>
    (window.I18n ? window.I18n.project(project.slug, field, fallback) : fallback);

const PLATFORM_LABELS = { android: 'Android', ios: 'iOS', kmm: 'KMM', web: 'Web' };
const esc = (value) => Carousel.escapeHtml(value);

// Toda la tarjeta lleva al proyecto: el ::after del enlace del título la
// cubre entera, y el carrusel queda por encima para poder deslizarlo. Sus
// diapositivas también enlazan al proyecto; sus flechas no.
function renderCard(p) {
    const href = `/project/${p.slug}/`;
    const extra = p.tech.length - 3;
    const stores = (p.links || []).map((l) => esc(l.label)).join(' · ');

    return `
        <article class="pj-card" data-category="${p.platforms.join(',')}">
            ${Carousel.html(p.images, {
                alt: p.title,
                variant: 'card',
                href,
                labels: { prev: tr('carousel.prev'), next: tr('carousel.next'), goto: tr('carousel.goto') },
            })}
            <div class="pj-body">
                <p class="pj-plat">${p.platforms.map((x) => PLATFORM_LABELS[x]).join(' · ')}</p>
                <h3><a class="pj-link" href="${href}">${esc(p.title)}</a></h3>
                <p class="pj-sum">${esc(trProject(p, 'summary', p.summary))}</p>
                <div class="chips">
                    ${p.tech.slice(0, 3).map((t) => `<span class="chip">${esc(t)}</span>`).join('')}
                    ${extra > 0 ? `<span class="chip">+${extra}</span>` : ''}
                </div>
                <div class="pj-foot">
                    <span class="pj-stores">${stores}</span>
                    <span class="pj-more">${esc(tr('projects.more'))} →</span>
                </div>
            </div>
        </article>`;
}

let activeFilter = 'all';

function applyFilter(container) {
    container.querySelectorAll('.pj-card').forEach((card) => {
        card.hidden = activeFilter !== 'all' && !card.dataset.category.split(',').includes(activeFilter);
    });
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        const on = btn.dataset.filter === activeFilter;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
    });
}

// El conteo sale de los datos, no del HTML: así no se desfasa al añadir un proyecto.
function paintCounts(projects) {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        const f = btn.dataset.filter;
        const n = f === 'all' ? projects.length : projects.filter((p) => p.platforms.includes(f)).length;
        const small = btn.querySelector('small');
        if (small) small.textContent = n;
    });
}

function initProjectFilters(container) {
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        if (btn.dataset.bound === '1') return;
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
            activeFilter = btn.dataset.filter;
            applyFilter(container);
        });
    });
}

let cachedProjects = null;

async function paint() {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    if (!cachedProjects) cachedProjects = await fetchProjects();
    container.innerHTML = cachedProjects.map(renderCard).join('');
    Carousel.wire(container);
    paintCounts(cachedProjects);
    initProjectFilters(container);
    // Al repintar por cambio de idioma se conserva el filtro elegido.
    applyFilter(container);
}

// El idioma llega después del primer pintado (i18n hace fetch), así que la
// grilla se repinta cuando está listo y en cada cambio manual.
document.addEventListener('languageready', () => paint());
document.addEventListener('languagechange', () => paint());

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    try {
        await paint();
    } catch (err) {
        container.innerHTML = `<p class="t-muted">${esc(tr('projects.error'))}</p>`;
        console.error(err);
    }
});
