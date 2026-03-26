// Navbar Component
// Usage: Include this script and call renderNavbar() or it auto-renders on DOMContentLoaded

const NavbarComponent = {
    // Check if current page matches the link
    isActive(href) {
        const path = window.location.pathname;
        // Normalize path (remove trailing slash for comparison)
        const normalizedPath = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

        if (href === '/' && path === '/') return true;
        if (href === '/articles' && (normalizedPath === '/articles' || path.startsWith('/articles'))) return true;
        if (href.startsWith('/#') && path === '/') return false; // Don't mark anchors as active on home
        return false;
    },

    // Generate navbar HTML
    getHTML(options = {}) {
        const { fixed = true, transparent = false } = options;
        const navClass = fixed ? 'navbar-fixed' : 'navbar-fixed scrolled';
        const transparentClass = transparent ? '' : 'scrolled';

        const links = [
            { href: '/#about', text: 'Yo' },
            { href: '/#experience', text: 'Trabajo' },
            { href: '/#portfolio', text: 'Proyectos' },
            { href: '/articles', text: 'Blog' },
            { href: '/#contact', text: 'Hola' }
        ];

        const navLinks = links.map(link => {
            const activeClass = this.isActive(link.href) ? ' class="active"' : '';
            return `<a href="${link.href}"${activeClass}>${link.text}</a>`;
        }).join('\n                    ');

        const mobileLinks = links.map(link => {
            const activeClass = this.isActive(link.href) ? ' class="active"' : '';
            return `<a href="${link.href}"${activeClass}>${link.text}</a>`;
        }).join('\n            ');

        return `
    <nav class="navbar-fixed ${transparentClass}" id="mainNavbar">
        <div class="navbar-container">
            <div class="navbar-right">
                <div class="navbar-links">
                    ${navLinks}
                </div>
                <div class="navbar-actions">
                    <button class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode">
                        <i class="bi bi-moon-fill" id="themeIcon"></i>
                    </button>
                    <button class="navbar-mobile-toggle" id="navbarMobileToggle" aria-label="Menu">
                        <i class="bi bi-list"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="navbar-mobile" id="navbarMobile">
            ${mobileLinks}
        </div>
    </nav>`;
    },

    // Initialize navbar functionality
    init() {
        this.initMobileNav();
        this.initScrollEffect();
    },

    // Mobile navigation toggle
    initMobileNav() {
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
    },

    // Scroll effect - transparent to solid
    initScrollEffect() {
        const navbar = document.getElementById('mainNavbar');
        const hero = document.getElementById('hero');

        if (!navbar) return;

        // If no hero section, keep navbar solid
        if (!hero) {
            navbar.classList.add('scrolled');
            return;
        }

        const updateNavbar = () => {
            const heroHeight = hero.offsetHeight;
            if (window.scrollY > heroHeight - 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };

        window.addEventListener('scroll', updateNavbar);
        updateNavbar();
    },

    // Render navbar into a container
    render(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = this.getHTML(options);
            this.init();

            // Re-bind theme toggle after navbar is rendered
            if (typeof ThemeManager !== 'undefined') {
                ThemeManager.bindToggle();
            }
        }
    }
};

// Auto-initialize if navbar container exists
document.addEventListener('DOMContentLoaded', () => {
    const navContainer = document.getElementById('navbar-container');
    if (navContainer) {
        NavbarComponent.render('navbar-container', {
            transparent: navContainer.dataset.transparent === 'true'
        });
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavbarComponent;
}
