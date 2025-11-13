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

        // Observe sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        // Observe cards and timeline items
        const cards = document.querySelectorAll('.project-card, .skill-category, .timeline__item');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(card);
        });

        // Add visible class styles
        const style = document.createElement('style');
        style.textContent = `
            .is-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupParallax() {
        // Subtle parallax effect on hero graphic
        const heroGraphic = document.querySelector('.hero__graphic');
        if (!heroGraphic) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;

            if (scrolled < window.innerHeight) {
                heroGraphic.style.transform = `translateY(${rate}px)`;
            }
        }, { passive: true });
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

// Add subtle hover effects to cards
document.addEventListener('DOMContentLoaded', () => {
    // Skill badges glow effect
    const skillBadges = document.querySelectorAll('.skill-badge');
    skillBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // Button press effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98)';
        });
        btn.addEventListener('mouseup', function() {
            this.style.transform = '';
        });
    });

    // Initialize animation manager
    new AnimationManager();
});

// Add active nav link highlighting based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav__link');

    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        if (pageYOffset >= sectionTop - 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('is-active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('is-active');
        }
    });

    // Add style for active link
    const style = document.createElement('style');
    style.textContent = `
        .nav__link.is-active {
            color: var(--accent);
        }
        .nav__link.is-active::after {
            width: 100%;
        }
    `;
    if (!document.querySelector('#active-nav-style')) {
        style.id = 'active-nav-style';
        document.head.appendChild(style);
    }
}, { passive: true });
