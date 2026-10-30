// Barra de navegación: monograma GL, cinco enlaces, idioma, tema y menú móvil.
// Se pinta sola en DOMContentLoaded dentro de #navbar-container.

const NavbarComponent = {
    // Proyectos, Servicios y Contacto son anclas del inicio; Experiencia y
    // Blog son páginas. El pie (footer.js) usa esta misma lista.
    LINKS: [
        { href: '/#proyectos', text: 'Proyectos', key: 'nav.projects' },
        { href: '/#servicios', text: 'Servicios', key: 'nav.services' },
        { href: '/experience/', text: 'Experiencia', key: 'nav.experience' },
        { href: '/articles/', text: 'Blog', key: 'nav.blog' },
        { href: '/#contacto', text: 'Contacto', key: 'nav.contact' }
    ],

    // Las páginas se marcan por ruta; en el inicio las anclas las marca el
    // scroll-spy según la sección visible.
    isActive(href) {
        const path = window.location.pathname;
        if (href === '/experience/') return path.startsWith('/experience');
        if (href === '/articles/') return path.startsWith('/articles') || path.startsWith('/article/');
        return false;
    },

    linksHTML() {
        return this.LINKS.map((link) => {
            const activeClass = this.isActive(link.href) ? ' class="active" aria-current="page"' : '';
            return `<a href="${link.href}"${activeClass} data-i18n="${link.key}">${link.text}</a>`;
        }).join('');
    },

    getHTML() {
        const icon = (name) => (window.Icons ? Icons.icon(name) : '');
        return `
    <nav class="site-nav" id="mainNavbar">
        <div class="nav-inner">
            <a class="brand" href="/"><span class="brand-mark">GL</span> Gonzalo López</a>
            <div class="nav-links">${this.linksHTML()}</div>
            <div class="nav-actions">
                <div class="lang-switch" role="group" data-i18n-aria="nav.lang" aria-label="Cambiar idioma">
                    <button type="button" data-lang-option="es" aria-pressed="false">ES</button>
                    <button type="button" data-lang-option="en" aria-pressed="false">EN</button>
                </div>
                <button type="button" class="icon-btn theme-toggle" id="themeToggle" data-i18n-aria="nav.theme" aria-label="Cambiar tema">
                    <span id="themeIcon"></span>
                </button>
                <button type="button" class="icon-btn nav-toggle" id="navbarMobileToggle"
                        aria-expanded="false" aria-controls="navbarMobile" data-i18n-aria="nav.menu" aria-label="Menú">
                    ${icon('list')}
                </button>
            </div>
        </div>
        <div class="nav-mobile" id="navbarMobile" hidden>${this.linksHTML()}</div>
    </nav>`;
    },

    init() {
        this.initMobileNav();
    },

    // Menú móvil: los iconos son SVG (icons.js), así que se sustituye el
    // dibujo entero en vez de alternar clases de una fuente de iconos.
    initMobileNav() {
        const toggle = document.getElementById('navbarMobileToggle');
        const menu = document.getElementById('navbarMobile');
        if (!toggle || !menu) return;

        const setOpen = (open) => {
            menu.hidden = !open;
            toggle.setAttribute('aria-expanded', String(open));
            if (window.Icons) toggle.innerHTML = Icons.icon(open ? 'x' : 'list');
        };

        toggle.addEventListener('click', () => setOpen(menu.hidden));
        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setOpen(false));
        });
    },

    // Marca como activo el enlace de la sección visible. Solo aplica en la home,
    // donde los enlaces son anclas (#about, #portfolio, ...).
    initScrollSpy() {
        if (window.location.pathname !== '/') return;

        const anchors = Array.from(
            document.querySelectorAll('.nav-links a[href^="/#"], .nav-mobile a[href^="/#"]')
        );
        if (anchors.length === 0) return;

        const byId = new Map();
        for (const a of anchors) {
            const id = a.getAttribute('href').slice(2);
            if (!byId.has(id)) byId.set(id, []);
            byId.get(id).push(a);
        }

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                for (const list of byId.values()) {
                    list.forEach((a) => a.classList.remove('active'));
                }
                (byId.get(entry.target.id) || []).forEach((a) => a.classList.add('active'));
            }
        }, { rootMargin: '-45% 0px -50% 0px' });

        for (const id of byId.keys()) {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        }
    },

    // Render navbar into a container
    render(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.getHTML();
            this.init();

            // Re-bind theme toggle after navbar is rendered
            if (typeof ThemeManager !== 'undefined') {
                ThemeManager.bindToggle();
            }
            this.initScrollSpy();
        }
    }
};

// Auto-initialize if navbar container exists
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer) NavbarComponent.render('navbar-container');
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarComponent;
}
