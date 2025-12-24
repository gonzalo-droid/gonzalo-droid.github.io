document.addEventListener('DOMContentLoaded', function() {
    // Configurar opciones de marked
    marked.setOptions({
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true
    });

    // Obtener el slug del artículo de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        document.getElementById('articleContent').innerHTML = `
            <div class="alert alert-danger">
                No se encontró el artículo solicitado.
            </div>
        `;
        return;
    }

    // Cargar el artículo
    loadArticle(slug);

    // Actualizar el año del copyright
    document.getElementById('year').textContent = new Date().getFullYear();
});

async function loadArticle(slug) {
    try {
        // Cargar la lista de artículos
        const response = await fetch('/articles/articles.json');
        const articles = await response.json();

        // Encontrar el artículo que coincide con el slug
        const article = articles.find(a => {
            const articleSlug = a.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            return articleSlug === slug;
        });

        if (!article) {
            throw new Error('Artículo no encontrado');
        }

        // Actualizar el título de la página y el artículo
        document.title = `${article.title} - Mobile Developer`;
        document.getElementById('articleTitle').textContent = article.title;
        document.getElementById('articleDate').textContent = new Date(article.date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Cargar el contenido del artículo
        const contentResponse = await fetch(`/articles/${article.file}`);
        const content = await contentResponse.text();

        // Convertir el contenido Markdown a HTML
        const htmlContent = marked.parse(content);

        // Insertar el contenido en la página
        const articleContent = document.getElementById('articleContent');
        articleContent.innerHTML = htmlContent;

        // Resaltar el código
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });

    } catch (error) {
        console.error('Error al cargar el artículo:', error);
        document.getElementById('articleContent').innerHTML = `
            <div class="alert alert-danger">
                Error al cargar el artículo. Por favor, intenta de nuevo más tarde.
            </div>
        `;
    }
} 