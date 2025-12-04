// Interactive Hero Scattering Pattern
// Simulates X-ray/neutron scattering response to "sample orientation" (mouse position)

class InteractiveScattering {
    constructor() {
        this.hero = document.querySelector('.hero');
        this.graphic = document.querySelector('.hero__graphic');
        this.scatteringPattern = document.querySelector('.hero__graphic .scattering-pattern');
        this.sampleGlow = document.querySelector('.hero__graphic .sample-glow');
        this.particles = document.querySelectorAll('.hero__graphic .particle');

        // Center of the scattering pattern in SVG coordinates
        this.centerX = 200;
        this.centerY = 160;

        // Interaction state
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.isHovering = false;
        this.animationFrame = null;

        // Check for reduced motion preference
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!this.hero || !this.graphic || this.prefersReducedMotion) {
            return;
        }

        this.init();
    }

    init() {
        // Set up CSS custom properties on the hero element
        this.hero.style.setProperty('--mouse-x', '0');
        this.hero.style.setProperty('--mouse-y', '0');
        this.hero.style.setProperty('--mouse-distance', '1');
        this.hero.style.setProperty('--mouse-angle', '0deg');

        this.bindEvents();
        this.startAnimation();
    }

    bindEvents() {
        // Mouse move on hero section
        this.hero.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        this.hero.addEventListener('mouseenter', () => this.handleMouseEnter());
        this.hero.addEventListener('mouseleave', () => this.handleMouseLeave());

        // Touch support for mobile
        this.hero.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        this.hero.addEventListener('touchstart', () => this.handleMouseEnter(), { passive: true });
        this.hero.addEventListener('touchend', () => this.handleMouseLeave());
    }

    handleMouseMove(e) {
        const rect = this.graphic.getBoundingClientRect();

        // Calculate mouse position relative to SVG center
        const graphicCenterX = rect.left + rect.width / 2;
        const graphicCenterY = rect.top + rect.height * 0.4; // Scattering center is at 40% height

        // Normalized position (-1 to 1)
        this.targetX = (e.clientX - graphicCenterX) / (rect.width / 2);
        this.targetY = (e.clientY - graphicCenterY) / (rect.height / 2);

        // Clamp values
        this.targetX = Math.max(-1, Math.min(1, this.targetX));
        this.targetY = Math.max(-1, Math.min(1, this.targetY));
    }

    handleTouchMove(e) {
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    handleMouseEnter() {
        this.isHovering = true;
        this.hero.classList.add('hero--interactive');
    }

    handleMouseLeave() {
        this.isHovering = false;
        this.hero.classList.remove('hero--interactive');

        // Smoothly return to center
        this.targetX = 0;
        this.targetY = 0;
    }

    startAnimation() {
        const animate = () => {
            // Smooth interpolation (lerp) for fluid motion
            const lerp = 0.08;
            this.mouseX += (this.targetX - this.mouseX) * lerp;
            this.mouseY += (this.targetY - this.mouseY) * lerp;

            // Calculate distance from center (0 to 1)
            const distance = Math.sqrt(this.mouseX ** 2 + this.mouseY ** 2);
            const normalizedDistance = Math.min(distance, 1);

            // Calculate angle for directional effects
            const angle = Math.atan2(this.mouseY, this.mouseX) * (180 / Math.PI);

            // Update CSS custom properties
            this.hero.style.setProperty('--mouse-x', this.mouseX.toFixed(3));
            this.hero.style.setProperty('--mouse-y', this.mouseY.toFixed(3));
            this.hero.style.setProperty('--mouse-distance', normalizedDistance.toFixed(3));
            this.hero.style.setProperty('--mouse-angle', `${angle.toFixed(1)}deg`);

            // Intensity increases as cursor approaches center (inverse of distance)
            const intensity = 1 - normalizedDistance * 0.5;
            this.hero.style.setProperty('--beam-intensity', intensity.toFixed(3));

            this.animationFrame = requestAnimationFrame(animate);
        };

        animate();
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveScattering();
});
