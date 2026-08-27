document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    // Note: Navbar, footer, and back-to-top are handled by components
    initScrollAnimations();
    initCopyMail();
    loadLatestArticles();
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

// Copy email to clipboard
function initCopyMail() {
    const button = document.querySelector('.copy-mail');
    if (!button) return;

    button.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(button.dataset.mail);
            const original = button.textContent;
            button.textContent = 'Copiado';
            setTimeout(() => { button.textContent = original; }, 2000);
        } catch {
            // Sin permiso de portapapeles: el enlace mailto de al lado sigue funcionando.
            button.textContent = 'Usa el enlace';
        }
    });
}

// Load Latest Articles
async function loadLatestArticles() {
    const container = document.getElementById('latestArticles');
    if (!container) return;

    try {
        const articles = await fetchArticles();

        // Sort by date and take latest 3
        const latestArticles = articles
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        container.innerHTML = latestArticles.map(article => {
            const slug = generateSlug(article.title);

            // Ensure absolute path for image
            const imagePath = article.image.startsWith('/') ? article.image : '/' + article.image;

            return `
                <article class="article-card" data-animate>
                    <div class="article-card-image">
                        <img src="${imagePath}" alt="${article.title}" loading="lazy">
                    </div>
                    <div class="article-card-content">
                        <h3><a href="/article/${slug}">${article.title}</a></h3>
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
