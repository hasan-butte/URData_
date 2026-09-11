// ============================================================
// URData — script.js
// ============================================================

// ── DOM References ─────────────────────────────────────────

const navEyeSvg      = document.getElementById('nav-eye-svg');
const navPupil       = document.getElementById('nav-pupil');
const navHighlight   = document.getElementById('nav-highlight');

const heroSection    = document.getElementById('hero');
const heroTitle      = document.getElementById('hero-title');
const heroEyeWrap    = document.getElementById('hero-eye-wrap');
const heroEyeSvg     = document.getElementById('hero-eye-svg');
const heroPupil      = document.getElementById('hero-pupil');
const heroHighlight  = document.getElementById('hero-highlight');
const heroSub1       = document.querySelector('.hero-sub1');
const heroSub2       = document.querySelector('.hero-sub2');

const summarySection = document.getElementById('summary');
const summaryTitle   = document.getElementById('summary-title');
const summaryCard    = document.querySelector('.summary-card');

const navEyeLink     = document.getElementById('nav-eye-link');
const fullSections   = document.querySelectorAll('.full-section');

// ── State ──────────────────────────────────────────────────

let mouseX       = 0;
let mouseY       = 0;
let heroEyeLive  = false; // track mouse in hero eye only when visible
let summaryTyped = false;

// ── Utility: convert screen coords to SVG viewBox coords ───

function screenToSVG(svgEl, sx, sy) {
    const pt  = svgEl.createSVGPoint();
    pt.x = sx;
    pt.y = sy;
    try {
        return pt.matrixTransform(svgEl.getScreenCTM().inverse());
    } catch {
        return { x: 0, y: 0 };
    }
}

function clamp(val, lo, hi) {
    return Math.max(lo, Math.min(hi, val));
}

// ── Eye Tracking ───────────────────────────────────────────

function movePupil(svgEl, pupilEl, highlightEl, cx, cy, maxOffset, offsetFactor) {
    if (!svgEl || !pupilEl) return;
    const p     = screenToSVG(svgEl, mouseX, mouseY);
    const dx    = p.x - cx;
    const dy    = p.y - cy;
    const dist  = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const off   = clamp(dist * offsetFactor, 0, maxOffset);
    const px    = cx + Math.cos(angle) * off;
    const py    = cy + Math.sin(angle) * off;

    pupilEl.setAttribute('cx', px);
    pupilEl.setAttribute('cy', py);

    if (highlightEl) {
        // Gleam orbits the pupil toward the mouse — simulates light reflection
        const gleamOff = cx === 60 ? 3.5 : 7;
        const hx = px + Math.cos(angle) * gleamOff;
        const hy = py + Math.sin(angle) * gleamOff;
        highlightEl.setAttribute('cx', hx);
        highlightEl.setAttribute('cy', hy);
    }
}

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Navbar eye: always active
    movePupil(navEyeSvg, navPupil, navHighlight, 60, 30, 8, 0.16);

    // Hero eye: only when section is in view
    if (heroEyeLive) {
        movePupil(heroEyeSvg, heroPupil, heroHighlight, 120, 60, 13, 0.14);
    }
});

// ── Hero Eye Blink (on click) ──────────────────────────────

document.getElementById('hero-eye-clickzone').addEventListener('click', () => {
    heroEyeSvg.classList.remove('blink');
    // Force reflow so animation restarts if clicked again quickly
    void heroEyeSvg.offsetWidth;
    heroEyeSvg.classList.add('blink');
    heroEyeSvg.addEventListener('animationend', () => {
        heroEyeSvg.classList.remove('blink');
    }, { once: true });
});

// ── Navbar Eye → Smooth scroll to top ─────────────────────

navEyeLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Scroll links (hero subtext → summary) ─────────────────

document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// ── Typing Animation ───────────────────────────────────────

function typeText(el, text, speed, onDone) {
    el.textContent = '';
    el.classList.add('typing-active');
    let i = 0;
    const tick = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) {
            clearInterval(tick);
            // Cursor blinks for 1.6s then disappears
            setTimeout(() => {
                el.classList.remove('typing-active');
                if (onDone) onDone();
            }, 1600);
        }
    }, speed);
}

// ── Hero Load Sequence ─────────────────────────────────────

window.addEventListener('load', () => {
    // Slide in title, then begin typing
    heroTitle.classList.add('slide-in');
    setTimeout(() => {
        typeText(heroTitle, 'URData', 115, () => {
            // After typing: stagger remaining hero elements
            heroEyeWrap.classList.add('slide-in');
            setTimeout(() => heroSub1.classList.add('slide-in'),  380);
            setTimeout(() => heroSub2.classList.add('slide-in'),  640);
        });
    }, 520);
});

// ── Scroll-Based Section Dimming ───────────────────────────

function updateDimming() {
    const vh = window.innerHeight;
    fullSections.forEach(sec => {
        const r   = sec.getBoundingClientRect();
        const top = Math.max(0, r.top);
        const bot = Math.min(vh, r.bottom);
        const vis = Math.max(0, bot - top);
        // coverage: 0.0 → 1.0 (how much of viewport this section fills)
        const coverage = vis / vh;
        // Full opacity when coverage ≥ 0.5; dim proportionally below
        sec.style.opacity = clamp(coverage * 2, 0.15, 1);
    });
}

window.addEventListener('scroll', updateDimming, { passive: true });
updateDimming(); // run once on load

// ── Intersection Observer: Hero Eye Activation ─────────────

new IntersectionObserver(([entry]) => {
    heroEyeLive = entry.isIntersecting;
}, { threshold: 0.1 }).observe(heroSection);

// ── Intersection Observer: Summary Title Typing ────────────

new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !summaryTyped) {
        summaryTyped = true;
        const text = summaryTitle.dataset.text || 'Explore';
        typeText(summaryTitle, text, 68);
    }
}, { threshold: 0.25 }).observe(summarySection);

// ── Intersection Observer: Summary Card ───────────────────

new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
        summaryCard.classList.add('slide-in');
    }
}, { threshold: 0.08 }).observe(summaryCard);

