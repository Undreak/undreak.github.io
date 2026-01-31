// Image Lightbox functionality
(function() {
    'use strict';

    let currentIndex = 0;
    let images = [];
    let lightboxElement = null;

    /**
     * Get translated message with fallback
     */
    function t(key, fallback) {
        if (window.i18n && window.i18n.t) {
            return window.i18n.t(key) || fallback;
        }
        return fallback;
    }

    // Initialize lightbox on DOM load
    function init() {
        // Create lightbox HTML
        createLightbox();

        // Get all article images
        const articleImages = document.querySelectorAll('.article__image img');
        images = Array.from(articleImages).map(img => ({
            src: img.src,
            alt: img.alt,
            caption: img.nextElementSibling?.textContent || ''
        }));

        // Add click listeners to images
        articleImages.forEach((img, index) => {
            img.addEventListener('click', () => openLightbox(index));
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyboard);
    }

    // Create SVG element helper
    function createSVG(paths) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        paths.forEach(pathData => {
            const el = document.createElementNS('http://www.w3.org/2000/svg', pathData.tag);
            Object.keys(pathData.attrs).forEach(attr => {
                el.setAttribute(attr, pathData.attrs[attr]);
            });
            svg.appendChild(el);
        });
        return svg;
    }

    // Create lightbox HTML structure
    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';

        // Build lightbox structure using DOM methods for security
        const content = document.createElement('div');
        content.className = 'lightbox__content';
        const img = document.createElement('img');
        img.className = 'lightbox__image';
        img.src = '';
        img.alt = '';
        content.appendChild(img);
        lightbox.appendChild(content);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'lightbox__close';
        closeBtn.setAttribute('aria-label', t('lightbox.close', 'Close lightbox'));
        closeBtn.appendChild(createSVG([
            { tag: 'line', attrs: { x1: '18', y1: '6', x2: '6', y2: '18' } },
            { tag: 'line', attrs: { x1: '6', y1: '6', x2: '18', y2: '18' } }
        ]));
        lightbox.appendChild(closeBtn);

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'lightbox__nav lightbox__nav--prev';
        prevBtn.setAttribute('aria-label', t('lightbox.previous', 'Previous image'));
        prevBtn.appendChild(createSVG([
            { tag: 'polyline', attrs: { points: '15 18 9 12 15 6' } }
        ]));
        lightbox.appendChild(prevBtn);

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'lightbox__nav lightbox__nav--next';
        nextBtn.setAttribute('aria-label', t('lightbox.next', 'Next image'));
        nextBtn.appendChild(createSVG([
            { tag: 'polyline', attrs: { points: '9 18 15 12 9 6' } }
        ]));
        lightbox.appendChild(nextBtn);

        // Counter and caption
        const counter = document.createElement('div');
        counter.className = 'lightbox__counter';
        lightbox.appendChild(counter);

        const caption = document.createElement('div');
        caption.className = 'lightbox__caption';
        lightbox.appendChild(caption);

        document.body.appendChild(lightbox);
        lightboxElement = lightbox;

        // Event listeners
        lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
        lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', prevImage);
        lightbox.querySelector('.lightbox__nav--next').addEventListener('click', nextImage);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Open lightbox at specific index
    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        lightboxElement.classList.add('active');
        // Trigger reflow for transition
        lightboxElement.offsetHeight;
        lightboxElement.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }

    // Close lightbox
    function closeLightbox() {
        lightboxElement.classList.remove('visible');
        setTimeout(() => {
            lightboxElement.classList.remove('active');
            document.body.style.overflow = '';
        }, 250);
    }

    // Navigate to previous image
    function prevImage() {
        if (currentIndex > 0) {
            currentIndex--;
            updateLightbox();
        }
    }

    // Navigate to next image
    function nextImage() {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateLightbox();
        }
    }

    // Update lightbox content
    function updateLightbox() {
        const image = images[currentIndex];
        const imgElement = lightboxElement.querySelector('.lightbox__image');
        const counter = lightboxElement.querySelector('.lightbox__counter');
        const caption = lightboxElement.querySelector('.lightbox__caption');
        const prevBtn = lightboxElement.querySelector('.lightbox__nav--prev');
        const nextBtn = lightboxElement.querySelector('.lightbox__nav--next');

        imgElement.src = image.src;
        imgElement.alt = image.alt;
        counter.textContent = `${currentIndex + 1} / ${images.length}`;
        caption.textContent = image.caption;

        // Enable/disable navigation buttons
        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === images.length - 1;
    }

    // Keyboard navigation
    function handleKeyboard(e) {
        if (!lightboxElement.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
