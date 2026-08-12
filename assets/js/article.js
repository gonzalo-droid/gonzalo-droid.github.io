document.addEventListener('DOMContentLoaded', function() {
    // Configure marked options
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true
    });

    // Get article slug from hash
    const slug = getSlugFromHash();

    if (!slug) {
        showError('No se encontró el artículo solicitado.');
        return;
    }

    // Load the article
    loadArticle(slug);

    // Listen for hash changes (back/forward navigation)
    window.addEventListener('hashchange', () => {
        const newSlug = getSlugFromHash();
        if (newSlug) {
            loadArticle(newSlug);
        }
    });

    // Back to top is handled by footer component
});

/**
 * Get article slug from URL hash
 * URL format: /article#my-article-slug
 */
function getSlugFromHash() {
    const hash = window.location.hash;
    if (!hash || hash === '#') return null;

    // Remove the # and any leading/trailing slashes
    return hash.substring(1).replace(/^\/+|\/+$/g, '');
}

/**
 * Load and render article content
 */
async function loadArticle(slug) {
    // Show loading state
    document.getElementById('articleTitle').textContent = 'Cargando...';
    document.getElementById('articleContent').innerHTML = `
        <div style="text-align: center; padding: 60px 0;">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;

    try {
        // Load articles list
        const response = await fetch('/content/articles.json');
        if (!response.ok) throw new Error('Error loading articles list');

        const articles = await response.json();

        // Find article matching the slug
        const article = articles.find(a => {
            const articleSlug = generateSlug(a.title);
            return articleSlug === slug;
        });

        if (!article) {
            showError('Artículo no encontrado: ' + slug);
            return;
        }

        // Update page title and metadata
        document.title = `${article.title} - Mobile Developer`;
        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleDate').textContent = formatDate(article.date);

        // Load article content (markdown)
        const contentResponse = await fetch(`/content/articles/${article.file}`);
        if (!contentResponse.ok) throw new Error('Error loading article content');

        const markdown = await contentResponse.text();

        // Render markdown to HTML
        const htmlContent = marked.parse(markdown);

        // Insert content
        const articleContent = document.getElementById('articleContent');
        articleContent.innerHTML = htmlContent;

        // Apply syntax highlighting
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

        // Scroll to top
        window.scrollTo(0, 0);

    } catch (error) {
        console.error('Error loading article:', error);
        showError('Error al cargar el artículo. Por favor, intenta de nuevo más tarde.');
    }
}

/**
 * Generate URL-safe slug from title
 */
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Format date in Spanish
 */
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Show error message
 */
function showError(message) {
    document.getElementById('articleTitle').textContent = 'Error';
    document.getElementById('articleContent').innerHTML = `
        <div class="alert alert-danger" style="background: rgba(220, 53, 69, 0.1); border: 1px solid rgba(220, 53, 69, 0.3); color: #ff6b6b; padding: 20px; border-radius: 8px; text-align: center;">
            <i class="bi bi-exclamation-circle" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
            ${message}
            <br><br>
            <a href="/articles" style="color: #00d4ff;">Volver a artículos</a>
        </div>
    `;
}

