/**
 * theme.js se carga de forma síncrona en <head> en todas las páginas
 * (index.html, articles/index.html, article/index.html), antes del primer
 * pintado. Esta clase es la señal que usa style.css para saber si el JS
 * llegó a ejecutarse: sin ella, [data-animate] nunca se oculta.
 */
document.documentElement.classList.add('js');

/**
 * Theme Manager - Handles dark/light mode switching
 * Features:
 * - Claro por defecto; oscuro solo si el visitante lo eligió
 * - Local storage persistence
 * - Smooth transitions
 * - Highlight.js theme switching for code blocks
 */
const ThemeManager = {
  STORAGE_KEY: 'theme',
  DARK: 'dark',
  LIGHT: 'light',

  /**
   * Initialize the theme manager
   */
  init() {
    // Apply theme immediately to prevent flash
    this.applyInitialTheme();

    // Wait for DOM to be ready for button binding
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bindToggle());
    } else {
      this.bindToggle();
    }
  },

  /**
   * Apply theme immediately (before DOM ready to prevent flash)
   */
  applyInitialTheme() {
    // Claro por defecto (decisión de diseño): la preferencia del sistema no
    // cuenta, solo lo que el visitante eligió con el interruptor.
    const theme = localStorage.getItem(this.STORAGE_KEY) || this.LIGHT;

    document.documentElement.setAttribute('data-theme', theme);
    this.updateHighlightTheme(theme);
  },

  /**
   * Set the theme
   * @param {string} theme - 'dark' or 'light'
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
    this.updateIcon(theme);
    this.updateHighlightTheme(theme);
  },

  /**
   * Toggle between dark and light themes
   */
  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === this.DARK ? this.LIGHT : this.DARK;
    this.setTheme(newTheme);
  },

  /**
   * Update the toggle button icon
   * @param {string} theme - Current theme
   */
  updateIcon(theme) {
    const slot = document.getElementById('themeIcon');
    if (!slot) return;

    const name = theme === this.DARK ? 'sun-fill' : 'moon-fill';
    const label = theme === this.DARK ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

    // Los iconos son SVG inline (assets/js/icons.js), no una fuente: se
    // sustituye el contenido en vez de cambiar una clase. Si icons.js no
    // cargó, el botón se queda sin dibujo pero sigue siendo pulsable.
    if (window.Icons) {
      slot.innerHTML = window.Icons.icon(name, label);
    }
    const button = slot.closest('button');
    if (button) button.setAttribute('aria-label', label);
  },

  /**
   * Update highlight.js theme for code blocks
   * @param {string} theme - Current theme
   */
  updateHighlightTheme(theme) {
    const lightTheme = document.getElementById('hljs-light');
    const darkTheme = document.getElementById('hljs-dark');

    if (lightTheme && darkTheme) {
      if (theme === this.DARK) {
        lightTheme.disabled = true;
        darkTheme.disabled = false;
      } else {
        lightTheme.disabled = false;
        darkTheme.disabled = true;
      }
    }
  },

  /**
   * Bind click event to toggle button
   */
  bindToggle() {
    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => this.toggle());
      // Update icon to match current theme
      const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT;
      this.updateIcon(currentTheme);
    }
  },


  /**
   * Get current theme
   * @returns {string} Current theme ('dark' or 'light')
   */
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || this.LIGHT;
  }
};

// Initialize immediately
ThemeManager.init();
