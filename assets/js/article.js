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

    // Get article slug (path-based routing via sessionStorage, set by 404.html,
    // falling back to legacy hash-based links during the transition)
    const slug = getSlug();

    if (!slug) {
        showError('No se encontró el artículo solicitado.');
        return;
    }

    // Reflect the real path in the address bar (in case we arrived via
    // the 404 redirect or a legacy hash link)
    // Con barra final: es la URL que sirve GitHub Pages sin redirigir.
    history.replaceState(null, '', `/article/${slug}/`);

    // Load the article
    loadArticle(slug);

    // Listen for hash changes (back/forward navigation on legacy links)
    window.addEventListener('hashchange', () => {
        const newSlug = getSlugFromHash();
        if (newSlug) {
            history.replaceState(null, '', `/article/${newSlug}/`);
            loadArticle(newSlug);
        }
    });

    // Back to top is handled by footer component
});

/**
 * Resolve the article slug for this page load.
 * Priority:
 *   1. sessionStorage 'articleSlug' - set by 404.html when a crawler/user
 *      hits /article/<slug> directly (GitHub Pages has no server-side routing)
 *   2. URL path segment - /article/<slug>
 *   3. URL hash - /article#<slug> (legacy, kept for inbound links)
 */
function getSlug() {
    // 1. sessionStorage, set by the 404.html redirect. Consume it so a
    // later reload of /article/ directly doesn't reuse a stale slug.
    const storedSlug = sessionStorage.getItem('articleSlug');
    if (storedSlug) {
        sessionStorage.removeItem('articleSlug');
        return storedSlug;
    }

    // 2. Path-based routing: /article/<slug>
    const pathMatch = window.location.pathname.match(/^\/article\/([^/]+)\/?$/);
    if (pathMatch && pathMatch[1]) {
        return decodeURIComponent(pathMatch[1]);
    }

    // 3. Legacy hash-based routing: /article#<slug>
    return getSlugFromHash();
}

/**
 * Get article slug from URL hash (legacy)
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
    // La página prerenderizada ya trae el artículo: no se borra mientras
    // carga, para no enseñar "Cargando…" encima de un texto que ya estaba.

    try {
        // Load articles list
        const articles = await fetchArticles();

        // Find article matching the slug
        const article = articles.find(a => {
            const articleSlug = generateSlug(a.title);
            return articleSlug === slug;
        });

        if (!article) {
            showError('Artículo no encontrado: ' + slug);
            return;
        }

        // Update page title, metadata and SEO tags
        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleDate').textContent = formatDate(article.date);
        updateSEOTags(article, slug);

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

    } catch (error) {
        console.error('Error loading article:', error);
        showError('Error al cargar el artículo. Por favor, intenta de nuevo más tarde.');
    }
}

// Production domain (see CNAME)
const SITE_ORIGIN = 'https://gonzalo-lozg.me';

/**
 * Update document title, meta description, Open Graph / Twitter Card tags,
 * canonical link and JSON-LD structured data for the loaded article.
 */
function updateSEOTags(article, slug) {
    const pageTitle = `${article.title} - Gonzalo López | Mobile Developer`;
    const articleUrl = `${SITE_ORIGIN}/article/${slug}/`;
    const imageUrl = article.image.startsWith('http')
        ? article.image
        : `${SITE_ORIGIN}/${article.image.replace(/^\//, '')}`;

    document.title = pageTitle;
    setMetaContent('metaDescription', article.description);

    setMetaContent('ogType', 'article');
    setMetaContent('ogTitle', pageTitle);
    setMetaContent('ogDescription', article.description);
    setMetaContent('ogImage', imageUrl);
    setMetaContent('ogUrl', articleUrl);

    setMetaContent('twitterTitle', pageTitle);
    setMetaContent('twitterDescription', article.description);
    setMetaContent('twitterImage', imageUrl);

    const canonicalLink = document.getElementById('canonicalLink');
    if (canonicalLink) canonicalLink.setAttribute('href', articleUrl);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        image: imageUrl,
        datePublished: article.date,
        dateModified: article.date,
        url: articleUrl,
        keywords: (article.tags || []).join(', '),
        author: {
            '@type': 'Person',
            name: 'Gonzalo López'
        },
        publisher: {
            '@type': 'Person',
            name: 'Gonzalo López'
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': articleUrl
        }
    };

    const jsonLdScript = document.getElementById('articleJsonLd');
    if (jsonLdScript) jsonLdScript.textContent = JSON.stringify(jsonLd);
}

// Set the content attribute of a <meta> tag by element id, if it exists
function setMetaContent(id, content) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('content', content);
}

/**
 * Show error message
 */
function showError(message) {
    // El mensaje puede llevar el slug, que viene de la URL: se pinta como
    // texto, nunca como HTML (si no, un enlace armado ejecutaría código aquí).
    document.getElementById('articleTitle').textContent = 'Error';
    const content = document.getElementById('articleContent');
    const text = document.createElement('p');
    text.className = 'post-error';
    text.textContent = message;
    const back = document.createElement('p');
    const link = document.createElement('a');
    link.href = '/articles/';
    link.textContent = 'Volver al blog';
    back.appendChild(link);
    content.replaceChildren(text, back);
}

