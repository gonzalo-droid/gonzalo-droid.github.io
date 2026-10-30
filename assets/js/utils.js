// Shared utilities for the article system
// Used by article.js - keep in sync with content/articles.json usage

/**
 * Genera el slug de una URL a partir del título.
 *
 * Las tildes se transliteran en vez de descartarse: antes "Introducción"
 * daba "introducci-n", que pierde la palabra clave y queda feo en un
 * resultado de búsqueda. La ñ pasa a n por la misma razón.
 *
 * Esta función está replicada en scripts/build-pages.js, que genera las
 * páginas con los mismos slugs. Si cambias una, cambia la otra:
 * test/slug.test.js falla si se separan.
 */
function generateSlug(title) {
    return title
        .normalize('NFD')               // separa la letra de su tilde
        .replace(/[\u0300-\u036f]/g, '') // descarta las tildes sueltas
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Fecha en español: "17 de marzo de 2024".
// new Date('2024-03-17') se interpreta en UTC, y en Lima (UTC-5) daba el día
// anterior. Se construye en hora local a partir de las partes. Misma lógica
// que formatDate() en scripts/build-pages.js.
function formatDate(dateStr) {
    const [y, m, d] = String(dateStr).split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Fetch and parse the articles metadata list (content/articles.json)
async function fetchArticles() {
    const response = await fetch('/content/articles.json');
    if (!response.ok) throw new Error('Error loading articles list');
    return response.json();
}
