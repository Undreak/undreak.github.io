// Main JavaScript - Navigation and General Interactions

class NavigationManager {
    constructor() {
        this.nav = document.querySelector('.nav');
        this.navToggle = document.querySelector('.nav__toggle');
        this.navMenu = document.querySelector('.nav__menu');
        this.navLinks = document.querySelectorAll('.nav__link');
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupScrollBehavior();
        this.setupKeyboardNav();
    }

    setupMobileMenu() {
        if (!this.navToggle || !this.navMenu) return;

        // Toggle mobile menu
        this.navToggle.addEventListener('click', () => {
            const isOpen = this.navMenu.classList.toggle('is-open');
            this.navToggle.classList.toggle('is-active');
            this.navToggle.setAttribute('aria-expanded', isOpen);

            // Prevent body scroll when menu is open
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.nav.contains(e.target) && this.navMenu.classList.contains('is-open')) {
                this.closeMenu();
            }
        });

        // Close menu when pressing Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.navMenu.classList.contains('is-open')) {
                this.closeMenu();
            }
        });

        // Close menu when clicking nav links
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                this.closeMenu();
            });
        });
    }

    closeMenu() {
        this.navMenu.classList.remove('is-open');
        this.navToggle.classList.remove('is-active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    setupScrollBehavior() {
        let lastScroll = 0;
        const scrollThreshold = 100;

        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            // Add shadow to nav on scroll
            if (currentScroll > 50) {
                this.nav.style.boxShadow = 'var(--shadow-sm)';
            } else {
                this.nav.style.boxShadow = 'none';
            }

            // Hide/show nav on scroll (optional - disabled by default)
            /*
            if (currentScroll > lastScroll && currentScroll > scrollThreshold) {
                // Scrolling down
                this.nav.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                this.nav.style.transform = 'translateY(0)';
            }
            */

            lastScroll = currentScroll;
        }, { passive: true });
    }

    setupKeyboardNav() {
        // Trap focus in mobile menu when open
        const focusableElements = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

        this.navMenu.addEventListener('keydown', (e) => {
            if (!this.navMenu.classList.contains('is-open')) return;

            const focusable = Array.from(this.navMenu.querySelectorAll(focusableElements));
            const firstFocusable = focusable[0];
            const lastFocusable = focusable[focusable.length - 1];

            // Trap focus
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        });
    }
}

// Form validation for contact (if needed in future)
class FormManager {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.init();
    }

    init() {
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e, form));
        });
    }

    handleSubmit(e, form) {
        e.preventDefault();

        // Basic validation
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                this.showError(field, 'This field is required');
            } else {
                this.clearError(field);
            }
        });

        if (isValid) {
            // Handle form submission
            console.log('Form is valid, submitting...');
            // Add your form submission logic here
        }
    }

    showError(field, message) {
        const errorElement = document.createElement('span');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        errorElement.style.color = 'var(--accent)';
        errorElement.style.fontSize = 'var(--text-sm)';
        errorElement.style.marginTop = 'var(--space-1)';

        field.parentElement.appendChild(errorElement);
        field.style.borderColor = 'var(--accent)';
    }

    clearError(field) {
        const errorElement = field.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.remove();
        }
        field.style.borderColor = '';
    }
}

// Performance: Lazy load images when they enter viewport
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            this.images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback for browsers without IntersectionObserver
            this.images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
    new FormManager();
    new LazyLoader();

    // Add loading complete class to body
    document.body.classList.add('loaded');

    // Log initialization
    console.log('🎨 Portfolio initialized successfully!');
    console.log('Built with: HTML5, CSS3, Vanilla JavaScript');
    console.log('Design: Swiss Modernism + Brutalist elements');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden
        console.log('Page hidden');
    } else {
        // Page is visible
        console.log('Page visible');
    }
});

// Service Worker registration (optional - for PWA features)
if ('serviceWorker' in navigator) {
    // Uncomment to enable service worker
    /*
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
    */
}
