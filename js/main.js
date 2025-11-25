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

    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        // Use DOMPurify if available, otherwise fallback to textContent method
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
        }
        // Fallback for edge cases where DOMPurify might not be loaded
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Rate limiting check (prevent spam)
    canSubmit() {
        try {
            const lastSubmit = localStorage.getItem('lastFormSubmit');
            if (lastSubmit) {
                const timestamp = parseInt(lastSubmit, 10);

                // Validate timestamp is reasonable (not NaN, not negative, not future)
                if (isNaN(timestamp) || timestamp < 0 || timestamp > Date.now()) {
                    console.warn('Invalid timestamp in localStorage, removing');
                    localStorage.removeItem('lastFormSubmit');
                    return true;
                }

                const timeSinceLastSubmit = Date.now() - timestamp;
                const ONE_MINUTE = 60000;
                if (timeSinceLastSubmit < ONE_MINUTE) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Error checking rate limit:', error);
            return true; // Fail open to not block legitimate users
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Check if form is configured
        if (this.form.action.includes('YOUR_FORM_ID')) {
            this.showStatus('⚠️ Contact form is not yet configured. Please use the email link above.', 'error');
            return;
        }

        // Rate limiting
        if (!this.canSubmit()) {
            this.showStatus('⏱️ Please wait a minute before sending another message.', 'error');
            return;
        }

        // Get field values
        const nameField = this.form.querySelector('[name="name"]');
        const emailField = this.form.querySelector('[name="email"]');
        const subjectField = this.form.querySelector('[name="subject"]');
        const messageField = this.form.querySelector('[name="message"]');

        // Validate required fields
        const requiredFields = [nameField, emailField, subjectField, messageField];
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
            this.showStatus('❌ Please fill in all required fields.', 'error');
            return;
        }

        // Validate email format
        if (!this.isValidEmail(emailField.value)) {
            this.showStatus('❌ Please enter a valid email address.', 'error');
            emailField.style.borderColor = 'var(--accent)';
            return;
        }

        // Check message length
        if (messageField.value.length < 10) {
            this.showStatus('❌ Message is too short. Please provide more details.', 'error');
            messageField.style.borderColor = 'var(--accent)';
            return;
        }

        if (messageField.value.length > 5000) {
            this.showStatus('❌ Message is too long. Please keep it under 5000 characters.', 'error');
            messageField.style.borderColor = 'var(--accent)';
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
                },
                signal: AbortSignal.timeout(15000) // 15 second timeout
            });

            if (response.ok) {
                this.showStatus('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
                this.form.reset();
                // Set rate limit timestamp
                localStorage.setItem('lastFormSubmit', Date.now().toString());
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to send message');
            }
        } catch (error) {
            if (error.name === 'TimeoutError') {
                this.showStatus('⏱️ Request timed out. Please try again.', 'error');
            } else {
                this.showStatus('✗ Failed to send message. Please try again or email me directly.', 'error');
            }
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
                this.status.textContent = '';
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

// Expandable Cards Manager
class ExpandableCards {
    constructor() {
        this.expandableCards = document.querySelectorAll('[data-expandable]');
        this.init();
    }

    init() {
        this.expandableCards.forEach(card => {
            const toggle = card.querySelector('.expandable-toggle');
            const content = card.querySelector('.expandable-content');

            if (!toggle || !content) return;

            // Add click handler
            toggle.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click event
                this.toggleCard(toggle, content);
            });

            // Add keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggleCard(toggle, content);
                }
            });
        });
    }

    toggleCard(toggle, content) {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

        // Toggle states
        toggle.setAttribute('aria-expanded', !isExpanded);
        content.setAttribute('aria-hidden', isExpanded);

        // Update button text
        const textElement = toggle.querySelector('.expandable-toggle__text');
        if (textElement) {
            textElement.textContent = isExpanded ? 'View Projects (5)' : 'Hide Projects';
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
    new FormManager();
    new LazyLoader();
    new ExpandableCards();
    new ClickableCards();

    // Add loading complete class to body
    document.body.classList.add('loaded');

    // Log initialization (only in development)
    const DEBUG = false;
    if (DEBUG) {
        console.log('🎨 Portfolio initialized successfully!');
        console.log('Built with: HTML5, CSS3, Vanilla JavaScript');
        console.log('Design: Swiss Modernism + Brutalist elements');
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
