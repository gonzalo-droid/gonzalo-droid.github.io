// Página de proyecto: /project/<slug>/
// Lee el slug igual que article.js (sessionStorage desde el 404 de GitHub
// Pages, o el propio path en local) y pinta el proyecto con ProjectView, el
// mismo renderizador que usa scripts/build-pages.js al prerenderizar.

const tr = (key) => (window.I18n ? window.I18n.t(key) : key);
const trProject = (project, field, fallback) =>
    (window.I18n ? window.I18n.project(project.slug, field, fallback) : fallback);
const esc = (value) => ProjectView.escapeHtml(value);

/**
 * Resuelve el slug, en este orden:
 *   1. sessionStorage, que deja 404.html cuando alguien entra directo a
 *      /project/<slug> en GitHub Pages (que no tiene enrutado servidor).
 *   2. El path, /project/<slug>, que es lo que sirve Express en local.
 */
function getSlug() {
    const stored = sessionStorage.getItem('projectSlug');
    if (stored) {
        sessionStorage.removeItem('projectSlug');
        return stored;
    }

    const match = window.location.pathname.match(/^\/project\/([^/]+)\/?$/);
    return match && match[1] ? decodeURIComponent(match[1]) : null;
}

async function fetchProjects() {
    const response = await fetch('/content/projects.json');
    if (!response.ok) throw new Error('Error cargando proyectos');
    return response.json();
}

function setMeta(id, attr, value) {
    const el = document.getElementById(id);
    if (el) el.setAttribute(attr, value);
}

function updateSEO(project) {
    const url = `https://gonzalo-lozg.me/project/${project.slug}/`;
    const title = `${project.title} — Proyecto de Gonzalo López`;
    const image = `https://gonzalo-lozg.me${project.images[0].src}`;
    const summary = trProject(project, 'summary', project.summary);

    document.title = title;
    setMeta('metaDescription', 'content', summary);
    setMeta('canonicalLink', 'href', url);
    setMeta('ogTitle', 'content', title);
    setMeta('ogDescription', 'content', summary);
    setMeta('ogImage', 'content', image);
    setMeta('ogUrl', 'content', url);
    setMeta('twitterTitle', 'content', title);
    setMeta('twitterDescription', 'content', summary);
    setMeta('twitterImage', 'content', image);
}

function paint(project, projects) {
    const container = document.getElementById('projectDetail');
    const i = projects.findIndex((p) => p.slug === project.slug);
    const next = projects[(i + 1) % projects.length];

    container.innerHTML = ProjectView.render({
        project,
        summary: trProject(project, 'summary', project.summary),
        caseText: trProject(project, 'case', project.case),
        t: tr,
        next: { slug: next.slug, title: next.title },
    });
    Carousel.wire(container);
    container.setAttribute('aria-busy', 'false');
}

function showError(message) {
    const container = document.getElementById('projectDetail');
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `
        <div class="p-head">
            <a class="p-back" href="/#proyectos">← ${esc(tr('project.back'))}</a>
            <h1>${esc(tr('project.notFound'))}</h1>
            <p class="p-sum">${esc(message)}</p>
        </div>`;
}

let cached = null;

document.addEventListener('languagechange', () => {
    if (!cached) return;
    updateSEO(cached.project);
    paint(cached.project, cached.projects);
});

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getSlug();

    if (!slug) {
        if (window.I18n) await window.I18n.whenReady();
        showError(tr('project.noneGiven'));
        return;
    }

    try {
        const projects = await fetchProjects();
        const project = projects.find((p) => p.slug === slug);

        if (!project) {
            if (window.I18n) await window.I18n.whenReady();
            showError(`${tr('project.notFound')}: "${slug}"`);
            return;
        }

        cached = { project, projects };
        // Sin diccionario, ProjectView pintaría las claves un instante.
        if (window.I18n) await window.I18n.whenReady();
        updateSEO(project);
        paint(project, projects);

        // Que la barra de direcciones muestre /project/<slug>/ aunque hayamos
        // llegado por el rebote del 404 de GitHub Pages.
        const path = `/project/${project.slug}/`;
        if (window.location.pathname !== path) {
            history.replaceState(null, '', path + window.location.search);
        }
    } catch (err) {
        if (window.I18n) await window.I18n.whenReady();
        showError(tr('project.loadError'));
        console.error(err);
    }
});
