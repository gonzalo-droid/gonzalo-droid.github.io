// Página de detalle de proyecto: /project/<slug>
// Lee el slug igual que article.js (sessionStorage desde el 404 de GitHub
// Pages, o el propio path en local) y pinta el proyecto desde projects.json.

const PLATFORM_LABELS = {
    android: 'Android',
    ios: 'iOS',
    kmm: 'KMM',
    web: 'Web',
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

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
    const url = `https://gonzalo-lozg.me/project/${project.slug}`;
    const title = `${project.title} - Gonzalo López | Mobile Developer`;
    const image = `https://gonzalo-lozg.me${project.image}`;

    document.title = title;
    document.getElementById('pageTitle').textContent = title;

    setMeta('metaDescription', 'content', project.summary);
    setMeta('canonicalLink', 'href', url);
    setMeta('ogTitle', 'content', title);
    setMeta('ogDescription', 'content', project.summary);
    setMeta('ogImage', 'content', image);
    setMeta('ogUrl', 'content', url);
    setMeta('twitterTitle', 'content', title);
    setMeta('twitterDescription', 'content', project.summary);
    setMeta('twitterImage', 'content', image);
}

// Cada bloque se omite si no hay datos, para que un proyecto incompleto no
// enseñe encabezados vacíos. `decisions` está vacío en todos hoy: es material
// que solo puede escribir Gonzalo.
function renderSection(title, body) {
    if (!body) return '';
    return `
        <section class="project-block">
            <h2 class="project-block-title">${escapeHtml(title)}</h2>
            ${body}
        </section>
    `;
}

function renderGallery(project) {
    const images = [...new Set([project.image, ...(project.gallery || [])])];
    if (images.length === 0) return '';

    return `
        <div class="project-gallery">
            ${images.map((src) => `
                <figure>
                    <img src="${escapeHtml(src)}" alt="Captura de ${escapeHtml(project.title)}" loading="lazy">
                </figure>
            `).join('')}
        </div>
    `;
}

function renderProject(project) {
    const container = document.getElementById('projectDetail');
    document.getElementById('crumbCurrent').textContent = project.title;

    const platforms = project.platforms.map((p) => PLATFORM_LABELS[p] || p).join(' · ');

    const highlights = (project.highlights || []).length
        ? `<ul class="project-list">${project.highlights.map((h) => `<li>${escapeHtml(h)}</li>`).join('')}</ul>`
        : '';

    const decisions = project.decisions
        ? `<p class="t-body">${escapeHtml(project.decisions)}</p>`
        : '';

    const links = (project.links || []).length
        ? `<div class="project-card-links">${project.links.map((l) => `
              <a href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>
           `).join('')}</div>`
        : '';

    container.innerHTML = `
        <header class="project-head">
            <p class="t-label project-platforms">${escapeHtml(platforms)}</p>
            <h1 class="t-h1">${escapeHtml(project.title)}</h1>
            <p class="project-summary">${escapeHtml(project.summary)}</p>
            ${links}
        </header>

        ${renderGallery(project)}

        ${renderSection('Qué incluye', highlights)}
        ${renderSection('Decisiones técnicas', decisions)}

        <section class="project-block">
            <h2 class="project-block-title">Stack</h2>
            <div class="project-tech project-tech-full">
                ${project.tech.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}
            </div>
        </section>

        <a class="project-back" href="/#portfolio">← Volver a proyectos</a>
    `;
    container.setAttribute('aria-busy', 'false');
}

function showError(message) {
    const container = document.getElementById('projectDetail');
    container.setAttribute('aria-busy', 'false');
    container.innerHTML = `
        <h1 class="t-h1">Proyecto no encontrado</h1>
        <p class="t-body">${escapeHtml(message)}</p>
        <a class="project-back" href="/#portfolio">← Volver a proyectos</a>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const slug = getSlug();

    if (!slug) {
        showError('No se indicó ningún proyecto.');
        return;
    }

    try {
        const projects = await fetchProjects();
        const project = projects.find((p) => p.slug === slug);

        if (!project) {
            showError(`No existe un proyecto con el identificador "${slug}".`);
            return;
        }

        updateSEO(project);
        renderProject(project);

        // Que la barra de direcciones muestre /project/<slug> aunque hayamos
        // llegado por el rebote del 404 de GitHub Pages.
        const path = `/project/${project.slug}`;
        if (window.location.pathname !== path) {
            history.replaceState(null, '', path);
        }
    } catch (err) {
        showError('No se pudo cargar la información del proyecto.');
        console.error(err);
    }
});
