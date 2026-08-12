// Shared utilities for the article system
// Used by home.js, articles.js and article.js - keep in sync with content/articles.json usage

// Generate URL-safe slug from title
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Format date in Spanish (es-ES locale)
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
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
