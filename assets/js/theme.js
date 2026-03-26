/**
 * Theme Manager - Handles dark/light mode switching
 * Features:
 * - System preference detection
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

    // Listen for system preference changes
    this.watchSystemPreference();
  },

  /**
   * Apply theme immediately (before DOM ready to prevent flash)
   */
  applyInitialTheme() {
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? this.DARK : this.LIGHT);

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
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === this.DARK ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
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
   * Watch for system preference changes
   */
  watchSystemPreference() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? this.DARK : this.LIGHT);
      }
    });
  },

  /**
   * Get current theme
   * @returns {string} Current theme ('dark' or 'light')
   */
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || this.LIGHT;
  },

  /**
   * Reset to system preference
   */
  resetToSystemPreference() {
    localStorage.removeItem(this.STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.setTheme(prefersDark ? this.DARK : this.LIGHT);
  }
};

// Initialize immediately
ThemeManager.init();
