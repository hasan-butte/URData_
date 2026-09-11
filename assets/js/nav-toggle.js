// Shared mobile hamburger menu toggle — used by every page's navbar.
(function () {
    const navbar = document.getElementById('navbar');
    const toggle = document.getElementById('nav-toggle');
    const links  = document.getElementById('nav-links');
    if (!navbar || !toggle || !links) return;

    function closeMenu() {
        navbar.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
        const isOpen = navbar.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
    });
})();
