/* ============================================================
   resources-script.js
   Handles: nav eye tracking, card scroll reveal, scroll-to-top.
   ============================================================ */

/* ── Nav Eye Tracking ── */

const navEyeSvg    = document.getElementById('nav-eye-svg');
const navPupil     = document.getElementById('nav-pupil');
const navHighlight = document.getElementById('nav-highlight');

function screenToSVG(svgEl, sx, sy) {
    const pt = svgEl.createSVGPoint();
    pt.x = sx; pt.y = sy;
    try { return pt.matrixTransform(svgEl.getScreenCTM().inverse()); }
    catch { return { x: 0, y: 0 }; }
}

document.addEventListener('mousemove', (e) => {
    if (!navEyeSvg) return;
    const p     = screenToSVG(navEyeSvg, e.clientX, e.clientY);
    const cx    = 60, cy = 30;
    const dx    = p.x - cx, dy = p.y - cy;
    const angle = Math.atan2(dy, dx);
    const off   = Math.max(0, Math.min(Math.sqrt(dx * dx + dy * dy) * 0.16, 8));
    const px    = cx + Math.cos(angle) * off;
    const py    = cy + Math.sin(angle) * off;
    navPupil.setAttribute('cx', px);
    navPupil.setAttribute('cy', py);
    navHighlight.setAttribute('cx', px + Math.cos(angle) * 3.5);
    navHighlight.setAttribute('cy', py + Math.sin(angle) * 3.5);
});

/* ── Typing Animation ── */

function typeText(el, text, speed) {
    el.textContent = '';
    el.classList.add('typing-active');
    let i = 0;
    const tick = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) {
            clearInterval(tick);
            setTimeout(() => el.classList.remove('typing-active'), 1400);
        }
    }, speed);
}

window.addEventListener('load', () => {
    const title = document.getElementById('page-title');
    if (title) setTimeout(() => typeText(title, title.dataset.text, 80), 200);
});

/* ── Card Scroll Reveal ── */

const cards = document.querySelectorAll('.source-card');

const cardObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card  = entry.target;
                const delay = card.dataset.delay || '0';
                card.style.animationDelay = delay + 'ms';
                card.classList.add('visible');
                cardObserver.unobserve(card);
            }
        });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
);

cards.forEach((card, i) => {
    card.dataset.delay = i * 80;
    cardObserver.observe(card);
});

/* ── Back-to-Top ── */

const scrollTopBtn = document.getElementById('scroll-top-btn');

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

scrollTopBtn.addEventListener('click', scrollToTop);
