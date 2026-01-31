// Internationalization (i18n) Manager
// Supports English and French with browser detection and localStorage persistence

class I18nManager {
    constructor() {
        this.defaultLang = 'en';
        this.supportedLangs = ['en', 'fr'];
        this.translations = {};
        this.currentLang = this.getInitialLanguage();
        this.isInitialized = false;
        this.init();
    }

    /**
     * Determine initial language from localStorage, browser, or default
     */
    getInitialLanguage() {
        try {
            // 1. Check localStorage
            const savedLang = localStorage.getItem('language');
            if (savedLang && this.supportedLangs.includes(savedLang)) {
                return savedLang;
            }

            // Remove invalid stored language
            if (savedLang) {
                console.warn('Invalid language in localStorage, removing');
                localStorage.removeItem('language');
            }

            // 2. Check browser language
            const browserLang = navigator.language.split('-')[0];
            if (this.supportedLangs.includes(browserLang)) {
                return browserLang;
            }

            // 3. Fallback to default
            return this.defaultLang;
        } catch (error) {
            console.error('Error reading language from localStorage:', error);
            return this.defaultLang;
        }
    }

    /**
     * Initialize the i18n system
     */
    async init() {
        try {
            console.log('[i18n] Initializing with language:', this.currentLang);
            console.log('[i18n] Base path:', this.getBasePath());

            // Redirect to correct article version BEFORE loading translations
            // This prevents flash of wrong content
            if (this.shouldRedirectArticle()) {
                return; // Stop init, page will reload
            }

            await this.loadTranslations(this.currentLang);
            console.log('[i18n] Translations loaded:', Object.keys(this.translations).length, 'top-level keys');

            this.applyTranslations();
            console.log('[i18n] Translations applied to', document.querySelectorAll('[data-i18n]').length, 'elements');

            this.updateDocumentLang();
            this.setupToggle();
            this.isInitialized = true;

            // Mark elements as loaded to prevent FOUC
            document.documentElement.setAttribute('data-i18n-loaded', 'true');

            // Dispatch custom event for other scripts to hook into
            window.dispatchEvent(new CustomEvent('i18n:ready', {
                detail: { lang: this.currentLang }
            }));
            console.log('[i18n] Ready');
        } catch (error) {
            console.error('I18n initialization error:', error);
            // Mark as loaded anyway to show content
            document.documentElement.setAttribute('data-i18n-loaded', 'true');
        }
    }

    /**
     * Check if we need to redirect to the correct article language version
     * Returns true if redirecting (caller should stop execution)
     */
    shouldRedirectArticle() {
        const path = window.location.pathname;

        // Only handle article pages
        if (!path.includes('/articles/')) return false;

        const isInFrenchPath = path.includes('/articles/fr/');

        if (this.currentLang === 'fr' && !isInFrenchPath) {
            // User wants French but on English article - redirect
            const frPath = path.replace('/articles/', '/articles/fr/');
            console.log('[i18n] Redirecting to French article:', frPath);
            window.location.replace(frPath);
            return true;
        } else if (this.currentLang === 'en' && isInFrenchPath) {
            // User wants English but on French article - redirect
            const enPath = path.replace('/articles/fr/', '/articles/');
            console.log('[i18n] Redirecting to English article:', enPath);
            window.location.replace(enPath);
            return true;
        }

        return false;
    }

    /**
     * Load translations from JSON file
     */
    async loadTranslations(lang) {
        try {
            // Determine base path (handle both root and subdirectory pages)
            const basePath = this.getBasePath();
            const response = await fetch(`${basePath}i18n/${lang}.json`);

            if (!response.ok) {
                throw new Error(`Failed to load translations for ${lang}`);
            }

            this.translations = await response.json();
        } catch (error) {
            console.error('Translation load error:', error);
            // Fallback to default language if current fails
            if (lang !== this.defaultLang) {
                console.warn(`Falling back to ${this.defaultLang}`);
                await this.loadTranslations(this.defaultLang);
            }
        }
    }

    /**
     * Get base path for fetching resources (handles subdirectories like /articles/)
     */
    getBasePath() {
        const path = window.location.pathname;

        // Check if we're in articles/fr/ (2 levels deep)
        if (path.includes('/articles/fr/')) {
            return '../../';
        }
        // Check if we're in articles/ (1 level deep)
        if (path.includes('/articles/')) {
            return '../';
        }
        // Root level (index.html, projects.html, etc.)
        return './';
    }

    /**
     * Sanitize HTML content for safe insertion
     * Uses DOMPurify if available, otherwise allows only safe formatting tags
     */
    sanitizeHTML(html) {
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br'],
                ALLOWED_ATTR: []
            });
        }
        // Fallback: allow only safe formatting tags via whitelist
        const allowedTags = ['strong', 'em', 'b', 'i', 'br'];
        const tagPattern = allowedTags.join('|');
        // Match allowed tags (opening, closing, self-closing)
        const safeTagRegex = new RegExp(`<(/?)(${tagPattern})(\\s*/?)>`, 'gi');

        // First, escape all HTML
        const div = document.createElement('div');
        div.textContent = html;
        let escaped = div.innerHTML;

        // Then restore only the allowed tags
        escaped = escaped.replace(/&lt;(\/?)(strong|em|b|i|br)(\s*\/?)&gt;/gi, '<$1$2$3>');

        return escaped;
    }

    /**
     * Apply translations to all elements with data-i18n attributes
     */
    applyTranslations() {
        // Translate text content
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                // Check if translation contains HTML (for <strong> tags etc.)
                if (translation.includes('<')) {
                    // Sanitize before inserting HTML
                    el.innerHTML = this.sanitizeHTML(translation);
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) {
                el.placeholder = translation;
            }
        });

        // Translate aria-labels
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translation = this.t(key);
            if (translation) {
                el.setAttribute('aria-label', translation);
            }
        });

        // Translate title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.t(key);
            if (translation) {
                el.setAttribute('title', translation);
            }
        });

        // Update page title
        const pageTitle = this.t('meta.title');
        if (pageTitle && document.title.includes('Alexandre De Cuyper')) {
            document.title = pageTitle;
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        const descTranslation = this.t('meta.description');
        if (metaDesc && descTranslation) {
            metaDesc.setAttribute('content', descTranslation);
        }
    }

    /**
     * Get translation by dot-notation key (e.g., "nav.about")
     */
    t(key, replacements = {}) {
        const value = this.getNestedValue(this.translations, key);
        if (!value) return null;

        // Handle replacements like {minutes}
        let result = value;
        Object.keys(replacements).forEach(placeholder => {
            result = result.replace(`{${placeholder}}`, replacements[placeholder]);
        });

        return result;
    }

    /**
     * Get nested object value by dot-notation path
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Update document language attribute and meta tags
     */
    updateDocumentLang() {
        // Update html lang attribute
        document.documentElement.lang = this.currentLang;
        document.documentElement.setAttribute('data-lang', this.currentLang);

        // Update OG locale
        const ogLocale = document.querySelector('meta[property="og:locale"]');
        const locale = this.currentLang === 'fr' ? 'fr_FR' : 'en_US';
        if (ogLocale) {
            ogLocale.setAttribute('content', locale);
        }

        // Update lang toggle button text
        this.updateToggleState();
    }

    /**
     * Switch to a different language
     */
    async switchLanguage(lang) {
        console.log('[i18n] Switching to:', lang);

        if (!this.supportedLangs.includes(lang)) {
            console.warn(`Unsupported language: ${lang}`);
            return;
        }

        if (lang === this.currentLang) {
            console.log('[i18n] Already in', lang, '- no switch needed');
            return;
        }

        this.currentLang = lang;

        // Save preference
        try {
            localStorage.setItem('language', lang);
            console.log('[i18n] Saved to localStorage');
        } catch (error) {
            console.error('Error saving language to localStorage:', error);
        }

        // Load new translations and apply
        await this.loadTranslations(lang);
        console.log('[i18n] New translations loaded');

        this.applyTranslations();
        console.log('[i18n] Translations applied');

        this.updateDocumentLang();

        // Handle article page switching
        this.handleArticleSwitch();

        // Dispatch event for other scripts
        window.dispatchEvent(new CustomEvent('i18n:changed', {
            detail: { lang: this.currentLang }
        }));
        console.log('[i18n] Switch complete');
    }

    /**
     * Handle redirecting to translated article version (called on language switch)
     */
    handleArticleSwitch() {
        this.shouldRedirectArticle();
    }

    /**
     * Setup language toggle button
     */
    setupToggle() {
        const toggles = document.querySelectorAll('.lang-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const newLang = this.currentLang === 'en' ? 'fr' : 'en';
                this.switchLanguage(newLang);
            });
        });

        this.updateToggleState();
    }

    /**
     * Update toggle button display state
     */
    updateToggleState() {
        const toggles = document.querySelectorAll('.lang-toggle');
        toggles.forEach(toggle => {
            // Show the TARGET language (what user will switch TO when clicking)
            const targetLang = this.currentLang === 'en' ? 'fr' : 'en';
            const label = targetLang.toUpperCase();
            const ariaLabel = this.t('nav.switchLang') ||
                (this.currentLang === 'en' ? 'Passer en français' : 'Switch to English');

            toggle.textContent = label;
            toggle.setAttribute('aria-label', ariaLabel);
        });
    }

    /**
     * Get current language
     */
    getLang() {
        return this.currentLang;
    }

    /**
     * Check if i18n is ready
     */
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
window.i18n = new I18nManager();

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}
