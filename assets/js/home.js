document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    // Note: Navbar, footer, and back-to-top are handled by components
    initScrollAnimations();
    initPortfolioFilters();
    initStatsCounter();
    loadLatestArticles();
});

// Image Lightbox functionality
function openImageLightbox(imageSrc) {
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImage = document.getElementById('lightboxImage');

    if (lightbox && lightboxImage) {
        lightboxImage.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeImageLightbox() {
    const lightbox = document.getElementById('imageLightbox');

    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeImageLightbox();
    }
});


// Scroll Animations with Intersection Observer
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
}

// Portfolio Filters
function initPortfolioFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                const category = card.dataset.category;

                if (filter === 'all' || category === filter) {
                    card.classList.remove('hidden', 'fade-out');
                    card.classList.add('fade-in');
                } else {
                    card.classList.add('fade-out');
                    setTimeout(() => {
                        card.classList.add('hidden');
                        card.classList.remove('fade-out');
                    }, 300);
                }
            });
        });
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    let hasAnimated = false;

    const animateCounter = (el) => {
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                el.textContent = target;
            }
        };

        updateCounter();
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                statNumbers.forEach(el => animateCounter(el));
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.stats-bar');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// Load Latest Articles
async function loadLatestArticles() {
    const container = document.getElementById('latestArticles');
    if (!container) return;

    try {
        const response = await fetch('/content/articles.json');
        const articles = await response.json();

        // Sort by date and take latest 3
        const latestArticles = articles
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        container.innerHTML = latestArticles.map(article => {
            const slug = article.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Ensure absolute path for image
            const imagePath = article.image.startsWith('/') ? article.image : '/' + article.image;

            return `
                <article class="article-card" data-animate>
                    <div class="article-card-image">
                        <img src="${imagePath}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="article-card-content">
                        <h3><a href="/article#${slug}">${article.title}</a></h3>
                        <div class="article-card-date">${formatDate(article.date)}</div>
                        <div class="article-card-tags">
                            ${article.tags.slice(0, 3).map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        // Re-observe new elements for animation
        initScrollAnimations();

    } catch (error) {
        console.error('Error loading articles:', error);
        container.innerHTML = '<p>No se pudieron cargar los artículos.</p>';
    }
}

// Format date helper
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
