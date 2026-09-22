// Set <html lang> before first paint to prevent a flash of the wrong language.
// Loaded synchronously in <head>; i18n.js takes over once the page is parsed.
(function () {
    var l = localStorage.getItem('language');
    if (!l) { l = navigator.language.split('-')[0]; if (l !== 'en' && l !== 'fr') l = 'en'; }
    document.documentElement.lang = l;
    document.documentElement.dataset.lang = l;
})();
