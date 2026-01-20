document.addEventListener('DOMContentLoaded', function() {
    // Actualizar el año del copyright
    document.getElementById('year').textContent = new Date().getFullYear();

    // Cargar los artículos
    loadArticles();

    // Back to Top Button functionality
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

async function loadArticles() {
    try {
        const response = await fetch('/articles/articles.json');
        const articles = await response.json();

        // Ordenar artículos por fecha (más recientes primero)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        const container = document.getElementById('articlesContainer');
        container.innerHTML = ''; // Limpiar el contenedor

        articles.forEach(article => {
            // Crear slug a partir del título
            const slug = article.title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const articleCard = document.createElement('div');
            articleCard.className = 'col-12 mb-4';
            articleCard.innerHTML = `
                <div class="card article-card">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${article.image}" class="img-fluid rounded-start" alt="${article.title}">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${article.title}</h5>
                                <p class="card-text">${article.description}</p>
                                <div class="article-meta">
                                    <small class="text-muted">${new Date(article.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</small>
                                </div>
                                <div class="article-tags mt-2">
                                    ${article.tags.map(tag => `<span class="badge bg-primary me-1">${tag}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Agregar evento de clic para redirigir al artículo
            articleCard.addEventListener('click', () => {
                window.location.href = `/article/${slug}`;
            });

            container.appendChild(articleCard);
        });
    } catch (error) {
        console.error('Error al cargar los artículos:', error);
        document.getElementById('articlesContainer').innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Error al cargar los artículos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
    }
}

async function openArticleModal(article) {
    const modal = new bootstrap.Modal(document.getElementById('articleModal'));
    const modalTitle = document.getElementById('articleTitle');
    const modalContent = document.getElementById('articleContent');
    
    try {
        // Load and render the markdown content
        const response = await fetch(`articles/${article.file}`);
        const markdownContent = await response.text();
        const htmlContent = marked.parse(markdownContent);
        
        modalTitle.textContent = article.title;
        modalContent.innerHTML = htmlContent;
        
        // Highlight code blocks
        modalContent.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightBlock(block);
        });
        
        modal.show();
    } catch (error) {
        console.error('Error loading article:', error);
        modalContent.innerHTML = '<p>Error al cargar el artículo. Por favor, inténtalo de nuevo más tarde.</p>';
    }
} 