// Mobile article page enhancements
(function() {
    'use strict';

    // Only run on mobile and if article page
    function init() {
        if (window.innerWidth > 1024 || !document.querySelector('.article')) {
            return;
        }

        // Move theme toggle to fixed position for mobile article pages
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            // Clone the theme toggle
            const mobileThemeToggle = themeToggle.cloneNode(true);
            mobileThemeToggle.classList.add('theme-toggle--mobile-article');

            // Add it to body
            document.body.appendChild(mobileThemeToggle);

            // Re-attach event listener for theme switching
            mobileThemeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Re-check on resize (if user resizes browser)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const mobileToggle = document.querySelector('.theme-toggle--mobile-article');
            if (window.innerWidth > 1024 && mobileToggle) {
                mobileToggle.remove();
            } else if (window.innerWidth <= 1024 && !mobileToggle && document.querySelector('.article')) {
                init();
            }
        }, 250);
    });
})();
