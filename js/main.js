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
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) {
                this.nav.style.boxShadow = 'var(--shadow-sm)';
            } else {
                this.nav.style.boxShadow = 'none';
            }
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

// Clickable Cards Handler (for cards with nested links)
class ClickableCards {
    constructor() {
        this.cards = document.querySelectorAll('.card-timeline__card--clickable[data-href]');
        this.init();
    }

    init() {
        this.cards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on a link or button
                if (e.target.closest('a') || e.target.closest('button')) {
                    return;
                }

                const href = card.dataset.href;
                if (href) {
                    window.location.href = href;
                }
            });
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
    new LazyLoader();
    new ClickableCards();

    // Add loading complete class to body
    document.body.classList.add('loaded');

    // Log initialization (only in development)

});

