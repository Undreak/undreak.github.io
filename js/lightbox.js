// Image Lightbox functionality
(function() {
    'use strict';

    let currentIndex = 0;
    let images = [];
    let lightboxElement = null;

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

    // Create lightbox HTML structure
    function createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox__content">
                <img class="lightbox__image" src="" alt="">
            </div>
            <button class="lightbox__close" aria-label="Close lightbox">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <button class="lightbox__nav lightbox__nav--prev" aria-label="Previous image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            </button>
            <button class="lightbox__nav lightbox__nav--next" aria-label="Next image">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            </button>
            <div class="lightbox__counter"></div>
            <div class="lightbox__caption"></div>
        `;

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
