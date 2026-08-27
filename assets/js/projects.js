// Renderiza la grilla de proyectos de la home desde content/projects.json.

async function fetchProjects() {
    const response = await fetch('/content/projects.json');
    if (!response.ok) throw new Error('Error cargando proyectos');
    return response.json();
}

const PLATFORM_LABELS = {
    android: 'Android',
    ios: 'iOS',
    kmm: 'KMM',
    web: 'Web',
};

function renderProjects(container, projects) {
    container.innerHTML = projects.map((p) => `
        <article class="project-card" data-category="${p.platforms.join(',')}">
            <a class="project-card-image" href="/project/${p.slug}">
                <img src="${p.image}" alt="${p.title}" loading="lazy">
                <span class="project-card-platform t-label">
                    ${p.platforms.map((x) => PLATFORM_LABELS[x]).join(' · ')}
                </span>
            </a>
            <div class="project-card-content">
                <h3 class="t-h3"><a href="/project/${p.slug}">${p.title}</a></h3>
                <p class="t-small">${p.summary}</p>
                <div class="project-tech">
                    ${p.tech.slice(0, 3).map((t) => `<span>${t}</span>`).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            buttons.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            cards.forEach((card) => {
                const match = filter === 'all' || card.dataset.category.split(',').includes(filter);
                card.hidden = !match;
            });
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('projectsGrid');
    if (!container) return;
    try {
        renderProjects(container, await fetchProjects());
        initProjectFilters();
    } catch (err) {
        container.innerHTML = '<p class="t-small">No se pudieron cargar los proyectos.</p>';
        console.error(err);
    }
});
