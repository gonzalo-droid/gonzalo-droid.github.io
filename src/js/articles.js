document.addEventListener('DOMContentLoaded', function() {
    // Update copyright year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Initialize
    loadArticles();
    initMobileNav();
    initBackToTop();
});

// Mobile Navigation
function initMobileNav() {
    const mobileToggle = document.getElementById('navbarMobileToggle');
    const mobileMenu = document.getElementById('navbarMobile');

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            icon.classList.toggle('bi-list');
            icon.classList.toggle('bi-x');
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.add('bi-list');
                icon.classList.remove('bi-x');
            });
        });
    }
}

// Back to Top
function initBackToTop() {
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Load Articles
async function loadArticles() {
    const container = document.getElementById('articlesContainer');
    const filtersContainer = document.getElementById('articleFilters');

    try {
        const response = await fetch('/src/articles/articles.json');
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
        const imagePath = article.image.replace('.png', '.webp');
        const formattedDate = formatDate(article.date);

        return `
            <article class="article-item" data-tags="${article.tags.map(t => t.toLowerCase()).join(',')}" onclick="window.location.href='/article/${slug}'">
                <div class="article-item-image">
                    <img src="/${imagePath}" alt="${article.title}" loading="lazy">
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
