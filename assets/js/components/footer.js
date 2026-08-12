// Footer Component
// Usage: Add <div id="footer-container"></div> where you want the footer

const FooterComponent = {
    // Generate footer HTML
    getHTML() {
        const year = new Date().getFullYear();

        return `
    <footer id="footer">
        <div class="container footer-content">
            <div class="copyright">
                &copy; ${year} <strong><span>Gonzalo López - Mobile Developer</span></strong>
            </div>
            <div class="privacy">
                <a href="/privacy-policy" target="_blank"></a>
            </div>
        </div>
    </footer>

    <a href="#" class="back-to-top" id="backToTop" aria-label="Back to top">
        <i class="bi bi-arrow-up"></i>
    </a>`;
    },

    // Initialize back to top functionality
    init() {
        const backToTop = document.getElementById('backToTop');
        if (!backToTop) return;

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
    },

    // Render footer into container
    render(containerId = 'footer-container') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.getHTML();
            this.init();
        }
    }
};

// Auto-initialize if footer container exists
document.addEventListener('DOMContentLoaded', () => {
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        FooterComponent.render();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FooterComponent;
}
