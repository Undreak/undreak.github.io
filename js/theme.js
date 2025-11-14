// Theme Toggle with System Preference Support

class ThemeManager {
    constructor() {
        this.theme = this.getInitialTheme();
        this.themeToggle = document.querySelector('.theme-toggle');
        this.init();
    }

    getInitialTheme() {
        try {
            // Check localStorage first
            const savedTheme = localStorage.getItem('theme');

            // Validate saved theme is one of the allowed values
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                return savedTheme;
            }

            // If invalid theme was stored, remove it
            if (savedTheme) {
                console.warn('Invalid theme in localStorage, removing');
                localStorage.removeItem('theme');
            }

            // Respect system preference (default to light per user request)
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return prefersDark ? 'dark' : 'light';
        } catch (error) {
            console.error('Error reading theme from localStorage:', error);
            // Fallback to system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return prefersDark ? 'dark' : 'light';
        }
    }

    init() {
        // Apply initial theme
        this.applyTheme(this.theme);

        // Set up toggle button
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme')) {
                this.theme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.theme);
            }
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.theme);
        try {
            localStorage.setItem('theme', this.theme);
        } catch (error) {
            console.error('Error saving theme to localStorage:', error);
        }
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0F0F0F' : '#FAF7F5');
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = theme === 'dark' ? '#0F0F0F' : '#FAF7F5';
            document.head.appendChild(meta);
        }
    }
}

// Initialize theme manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
    });
} else {
    new ThemeManager();
}
