document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    // Note: Navbar, footer, and back-to-top are handled by components
    initScrollAnimations();
    initCopyMail();
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
            button.textContent = window.I18n ? I18n.t('contact.copied') : 'Copiado';
            setTimeout(() => { button.textContent = original; }, 2000);
        } catch {
            // Sin permiso de portapapeles: el enlace mailto de al lado sigue funcionando.
            button.textContent = window.I18n ? I18n.t('contact.copyFallback') : 'Usa el enlace';
        }
    });
}
