// Scroll Animations and Micro-interactions

class AnimationManager {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupParallax();
        this.setupSmoothScroll();
    }

    setupIntersectionObserver() {
        // Observe elements for fade-in animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Optionally unobserve after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe sections - styles now in CSS
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            observer.observe(section);
        });

        // Observe static cards and timeline items - styles now in CSS
        // Note: project-card elements are dynamically loaded, so they're visible by default
        const cards = document.querySelectorAll('.skill-category, .timeline__item, .card-timeline__item');
        cards.forEach(card => {
            observer.observe(card);
        });
    }

    setupParallax() {
        // Enhanced parallax effect using CSS custom properties
        // This allows CSS to handle transforms (compatible with animations)
        const hero = document.querySelector('.hero');
        if (!hero) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // Set initial scroll value
        hero.style.setProperty('--scroll-y', '0');

        let ticking = false;

        const updateScrollPosition = () => {
            const scrolled = window.pageYOffset;
            const viewportHeight = window.innerHeight;

            // Only update when in hero viewport
            if (scrolled < viewportHeight * 1.5) {
                // Normalized scroll (0 to 1 as hero scrolls out)
                const scrollProgress = Math.min(scrolled / viewportHeight, 1);
                hero.style.setProperty('--scroll-y', scrollProgress.toFixed(3));

                // Fade out hero content as it scrolls
                const fadeProgress = Math.max(0, 1 - scrollProgress * 1.2);
                hero.style.setProperty('--scroll-fade', fadeProgress.toFixed(3));
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });

        // Initial call
        updateScrollPosition();
    }

    setupSmoothScroll() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const href = anchor.getAttribute('href');

                // Ignore empty hash
                if (href === '#') return;

                e.preventDefault();

                const target = document.querySelector(href);
                if (target) {
                    const offset = 80; // Account for fixed nav
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Close mobile menu if open
                    const navMenu = document.querySelector('.nav__menu');
                    const navToggle = document.querySelector('.nav__toggle');
                    if (navMenu && navMenu.classList.contains('is-open')) {
                        navMenu.classList.remove('is-open');
                        navToggle.classList.remove('is-active');
                    }
                }
            });
        });
    }
}

// Initialize animations on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // All hover and interaction effects now in CSS for CSP compliance
    // No inline styles needed - everything handled via classes and CSS

    // Initialize animation manager
    new AnimationManager();
});

// Add active nav link highlighting based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav__link');

    let current = '';
    const scrollPosition = window.pageYOffset + 150; // Offset for better detection

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionBottom = sectionTop + sectionHeight;

        // Check if scroll position is within this section
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            current = section.getAttribute('id');
        }
    });

    // Special handling for last section (contact) when near bottom of page
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (window.pageYOffset + windowHeight >= documentHeight - 50) {
        // Near bottom of page, highlight contact
        const contactSection = document.querySelector('#contact');
        if (contactSection) {
            current = 'contact';
        }
    }

    navLinks.forEach(link => {
        link.classList.remove('is-active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('is-active');
        }
    });
    // Active nav link styles now in CSS for CSP compliance
}, { passive: true });
