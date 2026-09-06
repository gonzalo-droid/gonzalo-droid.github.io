// Internacionalización ES/EN.
//
// El HTML se sirve en español. Si el idioma activo es inglés, este script
// sustituye el texto tras cargar content/i18n/en.json. Eso provoca un
// parpadeo breve en inglés, y es deliberado: la alternativa —ocultar el
// contenido hasta que cargue la traducción— reintroduciría el fallo que
// dejaba media página invisible cuando el JS no corría. El texto en español
// visible un instante es mejor que ninguno.

const I18n = {
    LANGS: ['es', 'en'],
    DEFAULT: 'es',
    STORAGE_KEY: 'lang',

    strings: {},

    // Idioma elegido, o el del navegador si nunca eligió, o español.
    resolve() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored && this.LANGS.includes(stored)) return stored;

        const nav = (navigator.language || '').toLowerCase();
        return nav.startsWith('en') ? 'en' : this.DEFAULT;
    },

    current() {
        return document.documentElement.lang || this.resolve();
    },

    /** Devuelve la cadena, o la clave si falta — así un hueco se ve, no se calla. */
    t(key) {
        return Object.prototype.hasOwnProperty.call(this.strings, key)
            ? this.strings[key]
            : key;
    },

    /** Traducción de un proyecto: cae al español si no hay versión inglesa. */
    project(slug, field, fallback) {
        const projects = this.strings.__projects || {};
        const entry = projects[slug];
        if (entry && entry[field] !== undefined) return entry[field];
        return fallback;
    },

    async load(lang) {
        const response = await fetch(`/content/i18n/${lang}.json`);
        if (!response.ok) throw new Error(`No se pudo cargar el idioma ${lang}`);

        const data = await response.json();
        const { projects, ...ui } = data;
        this.strings = ui;
        this.strings.__projects = projects || {};
    },

    apply(root = document) {
        root.querySelectorAll('[data-i18n]').forEach((el) => {
            el.textContent = this.t(el.dataset.i18n);
        });

        // Cadenas que llevan marcado dentro (negritas, enlaces).
        root.querySelectorAll('[data-i18n-html]').forEach((el) => {
            el.innerHTML = this.t(el.dataset.i18nHtml);
        });

        root.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            el.setAttribute('aria-label', this.t(el.dataset.i18nAria));
        });

        root.querySelectorAll('[data-i18n-title]').forEach((el) => {
            el.setAttribute('title', this.t(el.dataset.i18nTitle));
        });
    },

    /** Enlaces alternativos para buscadores. */
    syncHreflang(lang) {
        const url = new URL(window.location.href);
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((l) => l.remove());

        for (const alt of this.LANGS) {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = alt;
            url.searchParams.set('lang', alt);
            link.href = url.toString();
            document.head.appendChild(link);
        }
        url.searchParams.delete('lang');
        document.documentElement.lang = lang;
    },

    async setLang(lang) {
        if (!this.LANGS.includes(lang)) return;

        localStorage.setItem(this.STORAGE_KEY, lang);
        await this.load(lang);
        this.apply();
        this.syncHreflang(lang);
        this.updateToggle(lang);

        // Para que la grilla de proyectos y demás se repinten con el idioma nuevo.
        document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
    },

    updateToggle(lang) {
        document.querySelectorAll('[data-lang-option]').forEach((btn) => {
            const isActive = btn.dataset.langOption === lang;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', String(isActive));
        });
    },

    bindToggle() {
        document.querySelectorAll('[data-lang-option]').forEach((btn) => {
            btn.addEventListener('click', () => this.setLang(btn.dataset.langOption));
        });
        this.updateToggle(this.current());
    },

    async init() {
        // ?lang=en tiene prioridad: es lo que siguen los enlaces hreflang.
        const fromUrl = new URLSearchParams(window.location.search).get('lang');
        const lang = this.LANGS.includes(fromUrl) ? fromUrl : this.resolve();

        document.documentElement.lang = lang;
        localStorage.setItem(this.STORAGE_KEY, lang);

        try {
            await this.load(lang);
            this.apply();
            this.syncHreflang(lang);
        } catch (err) {
            // Sin traducción, la página se queda en el español del HTML.
            console.error(err);
        }

        this.bindToggle();
        document.dispatchEvent(new CustomEvent('languageready', { detail: { lang } }));
    },
};

// `const` en un script clásico crea un binding de ámbito de script, no una
// propiedad de window. Otros archivos consultan `window.I18n` para saber si
// la traducción está disponible, así que hay que exponerlo explícitamente.
window.I18n = I18n;

document.addEventListener('DOMContentLoaded', () => I18n.init());
