// Table of Contents generation and navigation
(function() {
    'use strict';

    let tocElement = null;
    let activeHeading = null;
    let observer = null;

    // Initialize TOC on DOM load
    function init() {
        const article = document.querySelector('.article__content');
        if (!article) return;

        // Get all h2 and h3 headings
        const headings = article.querySelectorAll('h2, h3');
        if (headings.length === 0) return;

        // Create TOC structure
        createTOC(headings);

        // Setup intersection observer for active section highlighting
        setupObserver(headings);

        // Setup mobile toggle
        setupMobileToggle();
    }

    // Create TOC HTML structure
    function createTOC(headings) {
        // Create TOC container
        const toc = document.createElement('nav');
        toc.className = 'toc';
        toc.setAttribute('aria-label', 'Table of contents');

        // Create header
        const header = document.createElement('div');
        header.className = 'toc__header';
        header.innerHTML = '<h2 class="toc__title">Contents</h2>';
        toc.appendChild(header);

        // Create list
        const list = document.createElement('ul');
        list.className = 'toc__list';

        headings.forEach((heading, index) => {
            // Add ID to heading if it doesn't have one
            if (!heading.id) {
                heading.id = slugify(heading.textContent);
            }

            // Create list item
            const item = document.createElement('li');
            item.className = `toc__item toc__item--${heading.tagName.toLowerCase()}`;

            // Create link
            const link = document.createElement('a');
            link.className = 'toc__link';
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                scrollToHeading(heading);
                // Close mobile menu if open
                if (window.innerWidth <= 1024) {
                    closeMobileTOC();
                }
            });

            item.appendChild(link);
            list.appendChild(item);
        });

        toc.appendChild(list);

        // Insert TOC into DOM
        document.body.insertBefore(toc, document.querySelector('.article'));
        tocElement = toc;

        // Create mobile overlay
        const overlay = document.createElement('div');
        overlay.className = 'toc-overlay';
        overlay.addEventListener('click', closeMobileTOC);
        document.body.insertBefore(overlay, tocElement);
    }

    // Setup mobile toggle button
    function setupMobileToggle() {
        const toggle = document.createElement('button');
        toggle.className = 'toc__toggle';
        toggle.setAttribute('aria-label', 'Toggle table of contents');
        toggle.innerHTML = `
            <span class="toc__toggle-line"></span>
            <span class="toc__toggle-line"></span>
            <span class="toc__toggle-line"></span>
        `;
        toggle.addEventListener('click', toggleMobileTOC);
        document.body.appendChild(toggle);
    }

    // Toggle mobile TOC
    function toggleMobileTOC() {
        tocElement.classList.toggle('active');
        document.querySelector('.toc-overlay').classList.toggle('active');
    }

    // Close mobile TOC
    function closeMobileTOC() {
        tocElement.classList.remove('active');
        document.querySelector('.toc-overlay').classList.remove('active');
    }

    // Scroll to heading with smooth behavior
    function scrollToHeading(heading) {
        const navHeight = 80; // Adjust based on your nav height
        const targetPosition = heading.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;

        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });

        // Update URL without jumping
        history.pushState(null, null, `#${heading.id}`);
    }

    // Setup Intersection Observer for active section highlighting
    function setupObserver(headings) {
        const options = {
            rootMargin: '-100px 0px -66%',
            threshold: 0
        };

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveLink(entry.target.id);
                }
            });
        }, options);

        headings.forEach(heading => observer.observe(heading));
    }

    // Set active link in TOC
    function setActiveLink(id) {
        // Remove previous active
        const prevActive = tocElement.querySelector('.toc__link.active');
        if (prevActive) {
            prevActive.classList.remove('active');
        }

        // Add active to current
        const currentActive = tocElement.querySelector(`a[href="#${id}"]`);
        if (currentActive) {
            currentActive.classList.add('active');

            // Scroll TOC to show active item (if needed)
            const tocRect = tocElement.getBoundingClientRect();
            const linkRect = currentActive.getBoundingClientRect();

            if (linkRect.bottom > tocRect.bottom || linkRect.top < tocRect.top) {
                currentActive.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }

    // Create URL-friendly slug from text
    function slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
