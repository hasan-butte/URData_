// Shared scroll-to-top button — used by every page.
// Hides itself once the footer scrolls into view so it never sits on top of footer text/links.
(function () {
    const btn = document.getElementById('scroll-top-btn');
    const footer = document.getElementById('footer');
    if (!btn) return;

    let pastThreshold = false;
    let footerVisible = false;

    function updateVisibility() {
        btn.classList.toggle('visible', pastThreshold && !footerVisible);
    }

    window.addEventListener('scroll', () => {
        pastThreshold = window.scrollY > 500;
        updateVisibility();
    }, { passive: true });

    if (footer) {
        new IntersectionObserver(([entry]) => {
            footerVisible = entry.isIntersecting;
            updateVisibility();
        }).observe(footer);
    }

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();
