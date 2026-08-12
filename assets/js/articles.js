document.addEventListener('DOMContentLoaded', function() {
    // Initialize articles page
    // Footer component handles year and back-to-top
    loadArticles();
});

// Load Articles
async function loadArticles() {
    const container = document.getElementById('articlesContainer');
    const filtersContainer = document.getElementById('articleFilters');

    try {
        const response = await fetch('/content/articles.json');
        const articles = await response.json();

        // Sort by date (newest first)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Generate unique tags for filters
        const allTags = new Set();
        articles.forEach(article => {
            article.tags.forEach(tag => allTags.add(tag));
        });

        // Create filter buttons
        generateFilters(Array.from(allTags), filtersContainer);

        // Render articles
        renderArticles(articles, container);

        // Initialize filter functionality
        initFilters(articles, container);

    } catch (error) {
        console.error('Error loading articles:', error);
        container.innerHTML = `
            <div class="no-articles">
                <i class="bi bi-exclamation-circle" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>Error al cargar los artículos. Por favor, intenta de nuevo más tarde.</p>
            </div>
        `;
    }
}

// Generate filter buttons
function generateFilters(tags, container) {
    // Keep "Todos" button, add tag buttons
    const sortedTags = tags.sort();
    sortedTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = tag.toLowerCase();
        btn.textContent = tag;
        container.appendChild(btn);
    });
}

// Render articles
function renderArticles(articles, container) {
    container.innerHTML = articles.map(article => {
        const slug = generateSlug(article.title);
        // Ensure absolute path for image
        const imagePath = article.image.startsWith('/') ? article.image : '/' + article.image;
        const formattedDate = formatDate(article.date);

        return `
            <article class="article-item" data-tags="${article.tags.map(t => t.toLowerCase()).join(',')}" onclick="window.location.href='/article#${slug}'">
                <div class="article-item-image">
                    <img src="${imagePath}" alt="${article.title}" loading="lazy">
                </div>
                <div class="article-item-content">
                    <h3>${article.title}</h3>
                    <div class="article-item-date">
                        <i class="bi bi-calendar3"></i>
                        ${formattedDate}
                    </div>
                    <p class="article-item-description">${article.description}</p>
                    <div class="article-item-tags">
                        ${article.tags.slice(0, 4).map(tag => `<span>${tag}</span>`).join('')}
                    </div>
                    <div class="article-item-arrow">
                        Leer artículo <i class="bi bi-arrow-right"></i>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

// Initialize filters
function initFilters(articles, container) {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const articleItems = container.querySelectorAll('.article-item');

            articleItems.forEach(item => {
                const tags = item.dataset.tags.split(',');

                if (filter === 'all' || tags.includes(filter)) {
                    item.style.display = '';
                    item.style.animation = 'fadeIn 0.4s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Generate slug from title
function generateSlug(title) {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Format date
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
