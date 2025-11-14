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

// Form validation and submission for contact form
class FormManager {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.status = document.getElementById('form-status');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Basic validation
        const requiredFields = this.form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'var(--accent)';
            } else {
                field.style.borderColor = '';
            }
        });

        if (!isValid) {
            this.showStatus('Please fill in all required fields.', 'error');
            return;
        }

        // Disable submit button
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                this.showStatus('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
                this.form.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            this.showStatus('✗ Failed to send message. Please try again or email me directly.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showStatus(message, type) {
        this.status.textContent = message;
        this.status.className = `form-status ${type}`;

        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                this.status.className = 'form-status';
            }, 5000);
        }
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
