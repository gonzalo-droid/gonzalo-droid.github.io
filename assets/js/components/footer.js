// Footer Component
// Usage: Add <div id="footer-container"></div> where you want the footer

const FooterComponent = {
    // Pie igual en todas las páginas: los mismos cinco enlaces de la barra
    // (NavbarComponent.LINKS) y el cambio de idioma.
    LINKS: [
        { href: '/#proyectos', text: 'Proyectos', key: 'nav.projects' },
        { href: '/#servicios', text: 'Servicios', key: 'nav.services' },
        { href: '/experience/', text: 'Experiencia', key: 'nav.experience' },
        { href: '/articles/', text: 'Blog', key: 'nav.blog' },
        { href: '/#contacto', text: 'Contacto', key: 'nav.contact' }
    ],

    getHTML() {
        const year = new Date().getFullYear();
        const links = this.LINKS
            .map((l) => `<a href="${l.href}" data-i18n="${l.key}">${l.text}</a>`)
            .join('');

        return `
    <footer class="site-footer" id="footer">
        <div class="footer-inner">
            <span>&copy; ${year} Gonzalo López</span>
            <div class="footer-links">
                ${links}
                <span class="footer-lang" role="group" data-i18n-aria="nav.lang" aria-label="Cambiar idioma">
                    <button type="button" data-lang-option="es" aria-pressed="false">ES</button>
                    <span aria-hidden="true">·</span>
                    <button type="button" data-lang-option="en" aria-pressed="false">EN</button>
                </span>
            </div>
        </div>
    </footer>

    <a href="#" class="back-to-top" id="backToTop" data-i18n-aria="footer.top" aria-label="Volver arriba">
        ${window.Icons ? Icons.icon("arrow-up") : ""}
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
