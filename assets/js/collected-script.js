/* ============================================================
   collected-script.js
   Handles: wire background animation, card scroll reveals,
            dropdown navigation, back-to-top button.
   ============================================================ */

/* ── Nav Eye Tracking ──────────────────────────────────────── */

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

/* ── Wire Canvas Setup ─────────────────────────────────────── */

const canvas = document.getElementById('wire-canvas');
const ctx    = canvas.getContext('2d');

// Color channels as strings for use in rgba() template literals
const WIRE_RGB = '130, 70, 240';
const NODE_RGB = '155, 95, 255';
const BLOB_RGB = '175, 125, 255';
const TEXT_RGB = '200, 165, 255';

// Data labels that appear on traveling blobs
const DATA_LABELS = [
    'age', 'location', 'email', 'name', 'device_id',
    'ip_addr', 'purchases', 'search_q', 'gender',
    'dob', 'income', 'health_data'
];

// Scramble character pool
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789!@#%xyzpqr&*$mn';

// Wire x-positions as fractions of viewport width (uneven spacing)
const WIRE_FRACS = [0.052, 0.148, 0.272, 0.418, 0.565, 0.712, 0.862, 0.948];

let wires = [];
let blobs  = [];
let W = 0, H = 0;

function randChar() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

function garble(len) {
    return Array.from({ length: len }, randChar).join('');
}

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

/* Build wire objects from current viewport dimensions */
function buildWires() {
    wires = WIRE_FRACS.map((frac, i) => {
        const x = Math.round(frac * W);

        // Place nodes at irregular vertical intervals
        const nodes = [];
        let y = rand(50, 180);
        while (y < H) {
            nodes.push(y);
            y += rand(70, 220);
        }

        return {
            x,
            nodes,
            label: DATA_LABELS[i % DATA_LABELS.length]
        };
    });
}

/* Create a single blob on a given wire */
function makeBlob(wire, startY) {
    return {
        x:          wire.x,
        y:          startY !== undefined ? startY : rand(-H * 0.8, -10),
        speed:      rand(0.45, 1.2),
        height:     rand(22, 48),
        wire,
        label:      wire.label,
        glyph:      garble(Math.floor(rand(10, 18))),
        glyphTimer: 0,
        glyphRate:  Math.floor(rand(14, 32))   // frames between scrambles
    };
}

/* Populate blobs distributed across the screen on init */
function buildInitialBlobs() {
    blobs = [];
    wires.forEach(wire => {
        const count = Math.random() < 0.38 ? 3 : 2;
        for (let i = 0; i < count; i++) {
            blobs.push(makeBlob(wire, rand(-50, H)));
        }
    });
}

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildWires();
    buildInitialBlobs();
}

/* Main draw loop */
function drawFrame() {
    ctx.clearRect(0, 0, W, H);

    /* ── Draw wires and nodes ── */
    wires.forEach(wire => {
        // Vertical wire line
        ctx.beginPath();
        ctx.moveTo(wire.x, 0);
        ctx.lineTo(wire.x, H);
        ctx.strokeStyle = `rgba(${WIRE_RGB}, 0.20)`;
        ctx.lineWidth   = 1;
        ctx.shadowColor = `rgba(${WIRE_RGB}, 0.28)`;
        ctx.shadowBlur  = 4;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // Node rings
        wire.nodes.forEach(ny => {
            ctx.beginPath();
            ctx.arc(wire.x, ny, 2.8, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${NODE_RGB}, 0.48)`;
            ctx.lineWidth   = 1;
            ctx.shadowColor = `rgba(${NODE_RGB}, 0.35)`;
            ctx.shadowBlur  = 3;
            ctx.stroke();
            ctx.shadowBlur  = 0;
        });
    });

    /* ── Draw and update blobs ── */
    blobs.forEach((blob, idx) => {
        // Scramble glyph text on interval
        blob.glyphTimer++;
        if (blob.glyphTimer >= blob.glyphRate) {
            blob.glyph      = garble(blob.glyph.length);
            blob.glyphTimer = 0;
        }

        // Move blob downward
        blob.y += blob.speed;

        // Fade in from top, fade out toward bottom
        const fadeIn  = Math.min(1, (blob.y + 50) / 90);
        const fadeOut = Math.min(1, (H - blob.y) / 90);
        const opacity = Math.max(0, Math.min(fadeIn, fadeOut));

        // Reset blob when it exits the bottom
        if (blob.y > H + 60) {
            blobs[idx] = makeBlob(blob.wire);
            return;
        }

        if (opacity <= 0) return;

        const blobAlpha = opacity * 0.72;

        // Glowing segment along the wire
        const grad = ctx.createLinearGradient(
            blob.x, blob.y - blob.height / 2,
            blob.x, blob.y + blob.height / 2
        );
        grad.addColorStop(0,   `rgba(${BLOB_RGB}, 0)`);
        grad.addColorStop(0.25, `rgba(${BLOB_RGB}, ${(blobAlpha).toFixed(2)})`);
        grad.addColorStop(0.75, `rgba(${BLOB_RGB}, ${(blobAlpha).toFixed(2)})`);
        grad.addColorStop(1,   `rgba(${BLOB_RGB}, 0)`);

        ctx.beginPath();
        ctx.moveTo(blob.x, blob.y - blob.height / 2);
        ctx.lineTo(blob.x, blob.y + blob.height / 2);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 2.5;
        ctx.shadowColor = `rgba(${BLOB_RGB}, ${(opacity * 0.45).toFixed(2)})`;
        ctx.shadowBlur  = 7;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // Scrambled label text beside the blob
        const textAlpha = opacity * 0.55;
        ctx.font        = '9px "Share Tech Mono", monospace';
        ctx.fillStyle   = `rgba(${TEXT_RGB}, ${textAlpha.toFixed(2)})`;
        ctx.textAlign   = 'left';

        // Place text to the right; flip left if too close to edge
        const textX = blob.x + 7 < W - 160 ? blob.x + 7 : blob.x - 7;
        ctx.textAlign = blob.x + 7 < W - 160 ? 'left' : 'right';
        ctx.fillText(`${blob.label} = ${blob.glyph}`, textX, blob.y + 3);
    });
}

/* Animation loop */
function animate() {
    requestAnimationFrame(animate);
    drawFrame();
}

window.addEventListener('resize', resize);
resize();
animate();

/* ── Card Scroll Reveal (Intersection Observer) ─────────────── */

const cards = document.querySelectorAll('.method-card');

const cardObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Stagger cards that appear near each other
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

// Assign stagger delays so simultaneous entries feel sequential
cards.forEach((card, i) => {
    card.dataset.delay = (i % 3) * 90;   // max 180ms stagger within a batch
    cardObserver.observe(card);
});

/* ── Collapsible Cards ──────────────────────────────────────── */
// The whole card is the click target, not just the header line, so the
// padding around the title is clickable too. Clicks inside the revealed
// body are ignored so links and text selection there work normally.

document.querySelectorAll('.method-card').forEach(card => {
    card.addEventListener('click', (e) => {
        if (e.target.closest('.card-body')) return;

        const header = card.querySelector('.card-header-line');
        const isOpen = card.classList.toggle('open');
        header.setAttribute('aria-expanded', String(isOpen));
    });
});

/* ── Dropdown Navigation ─────────────────────────────────────── */

const dropdownToggle = document.getElementById('dropdown-toggle');
const dropdownMenu   = document.getElementById('dropdown-menu');

dropdownToggle.addEventListener('click', () => {
    const isOpen = dropdownMenu.classList.contains('open');
    dropdownMenu.classList.toggle('open', !isOpen);
    dropdownToggle.setAttribute('aria-expanded', String(!isOpen));
});

// Close dropdown on outside click
document.addEventListener('click', (e) => {
    if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');
    }
});

// Smooth scroll to card when a dropdown item is clicked, then open it
dropdownMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;

        dropdownMenu.classList.remove('open');
        dropdownToggle.setAttribute('aria-expanded', 'false');

        // Both the top nav and the sub-header are fixed and stack on top
        // of each other, so both heights have to be cleared, not just one.
        const navH    = document.getElementById('navbar').offsetHeight;
        const headerH = document.getElementById('collected-header').offsetHeight;
        const top     = target.getBoundingClientRect().top + window.scrollY - navH - headerH - 24;
        window.scrollTo({ top, behavior: 'smooth' });

        // Flash the hover glow for the whole trip: while it scrolls into
        // view still collapsed, through the moment it opens, and briefly
        // after. Uses its own class so it never fights real :hover.
        target.classList.add('jump-glow');

        // Open the card once the scroll has settled, so its expansion
        // doesn't shift the target position while still animating into view.
        setTimeout(() => {
            const header = target.querySelector('.card-header-line');
            if (!target.classList.contains('open')) {
                target.classList.add('open');
                header.setAttribute('aria-expanded', 'true');
            }

            setTimeout(() => {
                target.classList.remove('jump-glow');
            }, 900);
        }, 1200);
    });
});

/* ── Back-to-Top Button ──────────────────────────────────────── */

const scrollTopBtn     = document.getElementById('scroll-top-btn');
const SHOW_AFTER_PX    = 500;

window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > SHOW_AFTER_PX;
    scrollTopBtn.classList.toggle('visible', scrolled);
}, { passive: true });

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

scrollTopBtn.addEventListener('click', scrollToTop);
