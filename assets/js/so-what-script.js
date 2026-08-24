/* ============================================================
   so-what-script.js
   Handles: nav eye tracking, typing animation, SVG gear ring
   builder, SVG connection paths, gear spin via
   IntersectionObserver, data stream particle animation.
   ============================================================ */

const SVG_NS = 'http://www.w3.org/2000/svg';

// ── DOM references ─────────────────────────────────────────

const navEyeSvg    = document.getElementById('nav-eye-svg');
const navPupil     = document.getElementById('nav-pupil');
const navHighlight = document.getElementById('nav-highlight');

const introEl    = document.getElementById('page-intro');
const introTitle = document.getElementById('intro-title');

const canvasWrap = document.getElementById('node-canvas-wrap');
const svgEl      = document.getElementById('connections-svg');

const scrollTopBtn = document.getElementById('scroll-top-btn');

const NODE_IDS = [
    'node-0', 'node-1', 'node-2', 'node-3', 'node-4',
    'node-5', 'node-6', 'node-7', 'node-8', 'node-9', 'node-10', 'node-11',
];

// ── Utilities ──────────────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789!@#%&*$xyzpqr';
function randChar() { return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]; }
function garble(len) { return Array.from({ length: len }, randChar).join(''); }

// ── Nav eye tracking ───────────────────────────────────────

function screenToSVG(svg, sx, sy) {
    const pt = svg.createSVGPoint();
    pt.x = sx; pt.y = sy;
    try { return pt.matrixTransform(svg.getScreenCTM().inverse()); }
    catch { return { x: 0, y: 0 }; }
}

document.addEventListener('mousemove', (e) => {
    if (!navEyeSvg) return;
    const p     = screenToSVG(navEyeSvg, e.clientX, e.clientY);
    const cx    = 60, cy = 30;
    const dx    = p.x - cx, dy = p.y - cy;
    const angle = Math.atan2(dy, dx);
    const off   = clamp(Math.sqrt(dx * dx + dy * dy) * 0.16, 0, 8);
    const px    = cx + Math.cos(angle) * off;
    const py    = cy + Math.sin(angle) * off;
    navPupil.setAttribute('cx', px);
    navPupil.setAttribute('cy', py);
    navHighlight.setAttribute('cx', px + Math.cos(angle) * 3.5);
    navHighlight.setAttribute('cy', py + Math.sin(angle) * 3.5);
});

// ── Typing animation ───────────────────────────────────────

function typeText(el, text, speed, onDone) {
    el.textContent = '';
    el.classList.add('typing-active');
    let i = 0;
    const tick = setInterval(() => {
        el.textContent = text.slice(0, ++i);
        if (i >= text.length) {
            clearInterval(tick);
            setTimeout(() => {
                el.classList.remove('typing-active');
                if (onDone) onDone();
            }, 1400);
        }
    }, speed);
}

// ── Page load sequence ─────────────────────────────────────

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        introEl.classList.add('visible');
        setTimeout(() => typeText(introTitle, introTitle.dataset.text || 'So What?', 82), 200);
    });

    const masterGroup = document.getElementById('master-group');
    const masterNode  = document.getElementById('node-0');
    setTimeout(() => {
        masterGroup.classList.add('visible');
        masterNode.classList.add('spinning');
    }, 480);

    // Build gear rings first (they affect layout), then connections
    setTimeout(() => {
        buildGearRings();
        buildConnections();
    }, 650);
});

// ── Build SVG gear rings around each node ──────────────────
//
// Each ring is a standalone <svg> element inserted inside the
// node div. A dashed-circle stroke creates the tick pattern.
// CSS animation rotates the SVG around its own center, which
// coincides with the node center.

function buildGearRings() {
    // Remove any previously built rings (for resize rebuilds)
    document.querySelectorAll('.node-ring-svg').forEach(el => el.remove());

    NODE_IDS.forEach(id => {
        const nodeEl = document.getElementById(id);
        if (!nodeEl) return;

        const isMaster = id === 'node-0';
        const diameter = nodeEl.offsetWidth;
        const radius   = diameter / 2;

        // How far the ring extends outside the node border
        const overhang = 22;
        const svgSize  = diameter + overhang * 2;
        const cx       = svgSize / 2;
        const cy       = svgSize / 2;

        // ── SVG element ──────────────────────────────────────
        const ringsvg = document.createElementNS(SVG_NS, 'svg');
        ringsvg.classList.add('node-ring-svg');
        ringsvg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
        ringsvg.setAttribute('xmlns',   'http://www.w3.org/2000/svg');
        // Position so that SVG center == node center
        ringsvg.style.width    = svgSize + 'px';
        ringsvg.style.height   = svgSize + 'px';
        ringsvg.style.top      = -overhang + 'px';
        ringsvg.style.left     = -overhang + 'px';
        ringsvg.style.zIndex   = '0';

        // ── Glow filter for the tick ring ────────────────────
        const defs   = document.createElementNS(SVG_NS, 'defs');
        const filtId = `gear-glow-${id}`;
        defs.innerHTML = `
            <filter id="${filtId}" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>`;
        ringsvg.appendChild(defs);

        // ── Outer dashed ring — the gear "teeth" ─────────────
        // stroke-dasharray creates evenly spaced ticks.
        // Dash length and gap are tuned so ~30–40 ticks appear.
        const outerR  = radius + overhang * 0.55;
        const circ    = 2 * Math.PI * outerR;
        // Aim for ~36 ticks: period = circ/36
        const period  = circ / 36;
        const dash    = period * 0.38;   // 38% filled
        const gap     = period - dash;

        const outerRing = document.createElementNS(SVG_NS, 'circle');
        outerRing.setAttribute('cx', cx);
        outerRing.setAttribute('cy', cy);
        outerRing.setAttribute('r',  outerR);
        outerRing.setAttribute('fill',            'none');
        outerRing.setAttribute('stroke',          isMaster
            ? 'rgba(185, 130, 255, 0.92)'
            : 'rgba(155, 80, 255, 0.85)');
        outerRing.setAttribute('stroke-width',    isMaster ? '5.5' : '4.5');
        outerRing.setAttribute('stroke-dasharray', `${dash.toFixed(2)} ${gap.toFixed(2)}`);
        outerRing.setAttribute('stroke-linecap',  'round');
        outerRing.setAttribute('filter',          `url(#${filtId})`);
        ringsvg.appendChild(outerRing);

        // ── Thin solid ring just at the node border ───────────
        // Adds a crisp "gear base" line the ticks sit on top of.
        const baseRing = document.createElementNS(SVG_NS, 'circle');
        baseRing.setAttribute('cx', cx);
        baseRing.setAttribute('cy', cy);
        baseRing.setAttribute('r',  radius);
        baseRing.setAttribute('fill',         'none');
        baseRing.setAttribute('stroke',       isMaster
            ? 'rgba(160, 100, 255, 0.55)'
            : 'rgba(122, 48, 255, 0.45)');
        baseRing.setAttribute('stroke-width', isMaster ? '2.5' : '2');
        ringsvg.appendChild(baseRing);

        // ── Second inner accent ring (circuit-board depth) ────
        const innerAccR = radius - 22;
        if (innerAccR > 0) {
            const innerAcc = document.createElementNS(SVG_NS, 'circle');
            innerAcc.setAttribute('cx', cx);
            innerAcc.setAttribute('cy', cy);
            innerAcc.setAttribute('r',  innerAccR);
            innerAcc.setAttribute('fill',         'none');
            innerAcc.setAttribute('stroke',       'rgba(100, 40, 200, 0.22)');
            innerAcc.setAttribute('stroke-width', '1');
            ringsvg.appendChild(innerAcc);
        }

        nodeEl.appendChild(ringsvg);
    });
}

// ── Connection data ────────────────────────────────────────

const connections  = [];
const allParticles = [];

function docPos(el) {
    const r = el.getBoundingClientRect();
    return {
        top:    r.top    + window.scrollY,
        bottom: r.bottom + window.scrollY,
        left:   r.left   + window.scrollX,
        cx:     r.left   + window.scrollX + r.width  / 2,
        cy:     r.top    + window.scrollY + r.height / 2,
        width:  r.width,
        height: r.height,
    };
}

// ── Build SVG connecting paths (always fully visible) ──────

function buildConnections() {
    const defs = svgEl.querySelector('defs');
    while (svgEl.lastChild && svgEl.lastChild !== defs) {
        svgEl.removeChild(svgEl.lastChild);
    }
    allParticles.forEach(p => { p.dot.remove(); p.label.remove(); });
    allParticles.length = 0;
    connections.length  = 0;

    const cW = canvasWrap.offsetWidth;
    const cH = canvasWrap.offsetHeight;
    svgEl.setAttribute('width',   cW);
    svgEl.setAttribute('height',  cH);
    svgEl.setAttribute('viewBox', `0 0 ${cW} ${cH}`);

    const wrapPos = docPos(canvasWrap);

    const nodes = NODE_IDS.map(id => {
        const el = document.getElementById(id);
        if (!el) return null;
        const p = docPos(el);
        return {
            cx:     p.cx     - wrapPos.left,
            cy:     p.cy     - wrapPos.top,
            top:    p.top    - wrapPos.top,
            bottom: p.bottom - wrapPos.top,
        };
    });

    for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to   = nodes[i + 1];
        if (!from || !to) continue;

        const fx = from.cx, fy = from.bottom;
        const tx = to.cx,   ty = to.top;
        const dy = ty - fy;
        const d  = `M ${fx},${fy} C ${fx},${fy + dy * 0.5} ${tx},${ty - dy * 0.5} ${tx},${ty}`;

        // Glow layer
        const glowPath = document.createElementNS(SVG_NS, 'path');
        glowPath.setAttribute('d', d);
        glowPath.setAttribute('fill', 'none');
        glowPath.setAttribute('stroke', 'rgba(100, 40, 220, 0.32)');
        glowPath.setAttribute('stroke-width', '7');
        glowPath.setAttribute('filter', 'url(#path-glow)');
        svgEl.appendChild(glowPath);

        // Main path
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'rgba(130, 55, 255, 0.62)');
        path.setAttribute('stroke-width', '1.8');
        path.setAttribute('stroke-linecap', 'round');
        svgEl.appendChild(path);

        connections.push({ pathEl: path, totalLength: path.getTotalLength(), particles: [] });
    }

    connections.forEach(conn => spawnParticles(conn));
}

// ── IntersectionObserver: node entrance + gear spin ────────

const nodeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const nodeEl = entry.target;
        if (entry.isIntersecting) {
            const group = nodeEl.closest('.node-group');
            if (group) group.classList.add('visible');
            nodeEl.classList.add('spinning', 'active');
        } else {
            // Pause the ring rotation while off-screen — resumes exactly
            // as before once the node scrolls back into view.
            nodeEl.classList.remove('spinning');
        }
    });
}, { threshold: 0.15 });

for (let i = 0; i < NODE_IDS.length; i++) {
    const el = document.getElementById(NODE_IDS[i]);
    if (el) nodeObserver.observe(el);
}

// ── Data stream particles ──────────────────────────────────

class Particle {
    constructor(conn) {
        this.pathEl = conn.pathEl;
        this.len    = conn.totalLength;
        this.t      = Math.random();
        this.speed  = 0.00055 + Math.random() * 0.00045;
        this.glyphs = garble(8);
        this.timer  = 0;
        this.rate   = Math.floor(Math.random() * 22) + 14;

        this.dot = document.createElementNS(SVG_NS, 'circle');
        this.dot.setAttribute('r', '2.5');
        this.dot.setAttribute('fill', 'rgba(160, 96, 255, 0.92)');
        this.dot.setAttribute('filter', 'url(#dot-glow)');

        this.label = document.createElementNS(SVG_NS, 'text');
        this.label.setAttribute('font-family', '"Share Tech Mono", monospace');
        this.label.setAttribute('font-size', '7');
        this.label.setAttribute('fill', 'rgba(200, 165, 255, 0.50)');
        this.label.textContent = this.glyphs;

        svgEl.appendChild(this.dot);
        svgEl.appendChild(this.label);
    }

    update() {
        this.t += this.speed;
        if (this.t >= 1) this.t = 0;
        const pos = this.pathEl.getPointAtLength(this.t * this.len);
        this.dot.setAttribute('cx', pos.x);
        this.dot.setAttribute('cy', pos.y);
        this.label.setAttribute('x', pos.x + 5);
        this.label.setAttribute('y', pos.y + 2.5);
        if (++this.timer >= this.rate) {
            this.glyphs = garble(8);
            this.label.textContent = this.glyphs;
            this.timer = 0;
        }
    }
}

function spawnParticles(conn) {
    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i++) {
        const p = new Particle(conn);
        p.t = i / count;
        conn.particles.push(p);
        allParticles.push(p);
    }
}

// Pause particle updates while the node canvas is scrolled out of view —
// this is the page's biggest ongoing cost (SVG geometry lookups on every
// particle, every frame), and freezing it off-screen is invisible since
// nothing in that area is visible to begin with. Resumes exactly where
// it left off once the canvas scrolls back into view.
let canvasVisible = true;
new IntersectionObserver((entries) => {
    entries.forEach(entry => { canvasVisible = entry.isIntersecting; });
}, { threshold: 0 }).observe(canvasWrap);

function animLoop() {
    if (canvasVisible) {
        allParticles.forEach(p => p.update());
    }
    requestAnimationFrame(animLoop);
}
requestAnimationFrame(animLoop);

// ── Scroll: scroll-to-top visibility ───────────────────────

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

// ── Resize: rebuild everything ─────────────────────────────

let resizeTimer = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        buildGearRings();
        buildConnections();
    }, 220);
});

// ── Back-to-top ────────────────────────────────────────────

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
scrollTopBtn.addEventListener('click', scrollToTop);

// ── Subheader dropdown ─────────────────────────────────────

const swToggle = document.getElementById('sw-dropdown-toggle');
const swMenu   = document.getElementById('sw-dropdown-menu');

swToggle.addEventListener('click', () => {
    const open = swMenu.classList.toggle('open');
    swToggle.setAttribute('aria-expanded', open);
});

document.addEventListener('click', (e) => {
    if (!swToggle.contains(e.target) && !swMenu.contains(e.target)) {
        swMenu.classList.remove('open');
        swToggle.setAttribute('aria-expanded', false);
    }
});

swMenu.querySelectorAll('a[data-node-id]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const nodeId = link.dataset.nodeId;
        const nodeEl = document.getElementById(nodeId);
        if (!nodeEl) return;

        swMenu.classList.remove('open');
        swToggle.setAttribute('aria-expanded', false);

        // Scroll to node
        nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Trigger card as if the node was clicked (after scroll settles)
        setTimeout(() => {
            // Close any open card first, then open this one
            if (activeNodeId && activeNodeId !== nodeId) {
                const prev = document.getElementById('card-' + activeNodeId.replace('node-', ''));
                if (prev) prev.classList.remove('active');
            }
            if (activeNodeId !== nodeId) {
                toggleCard(nodeEl);
            }
        }, 600);

        // Highlight active item
        swMenu.querySelectorAll('a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
    });
});

// ── Inline node cards ──────────────────────────────────────

const NODE_DATA = {
    'node-1': { content: '<p>Every search, post, and paused scroll feeds a profile of your interests, fears, and habits, sold onward to advertisers you\'ll never meet. <strong>This is the business model of the modern internet.</strong> Shoshana Zuboff calls it <em>surveillance capitalism</em>: an economic order that extracts a "<em>behavioral surplus</em>" beyond what any service needs to function, then sells that surplus as predictions about what you\'ll do, buy, and believe. "Free services" typically entail building a profile of you that is <strong>monetized indefinitely</strong>.</p><p>Informed consent fails here: terms aren\'t meaningfully disclosed, you couldn\'t comprehend them if they were, and no real alternative exists if you decline. <strong>74% of users skip privacy policies entirely</strong>, and those who don\'t still fail to read them properly (Obar &amp; Oeldorf-Hirsch, 2020). Refusal is made impractical, so <strong>consent extracted this way isn\'t truly consent</strong>.</p>' },
    'node-2': { content: '<p>Consent theory assumes declining is a real option. For most data collection, it isn\'t. Researchers Joseph Turow, Michael Hennessy, and Nora Draper surveyed Americans and found that <strong>most don\'t share data because they\'ve weighed a fair tradeoff</strong>. They share it because they\'ve concluded resistance is futile, a state the study calls <em>digital resignation</em>: accepting an undesirable outcome as inevitable rather than freely chosen (Turow, Hennessy &amp; Draper, 2015).</p><p>Economists Joseph Farrell and Paul Klemperer describe why: <strong>switching costs and network effects lock users into a platform</strong> once their time, data, and workflow already depend on it, letting the vendor extract terms an open market couldn\'t sustain (Farrell &amp; Klemperer, 2007). The FCC\'s 2026 broadband report shows the same pattern at the infrastructure level: <strong>only 43.4% of Americans can choose between three or more fixed providers</strong> at qualifying speeds (FCC, 2026). When a platform, an operating system, or an internet connection is a precondition for participating in modern life, <strong>declining is no longer a choice</strong>.</p>' },
    'node-3': { content: '<p>Every act of data collection creates a relationship in which one party holds <strong>comprehensive knowledge</strong> of the other, with <strong>no equivalent access</strong> in return. Philosopher Michel Foucault described this asymmetry in its purest form in the <em>panopticon</em>: a prison where a single guard tower can observe every cell, but prisoners can never confirm whether they\'re being watched. <strong>The discipline comes not from observation itself, but from the impossibility of verifying its absence.</strong></p><p>Platforms occupy the same position as the tower. They see your patterns and act on inferences you never reviewed, while you cannot see the profile or confirm what\'s being inferred. <strong>The asymmetry itself is the power</strong>, before any specific decision is made on it. The real question isn\'t intent. It\'s whether this degree of asymmetry is compatible with treating a person as <strong>self-determining</strong>, rather than an <strong>object to be modeled and steered</strong>. No amount of disclosure changes that. <strong>A person who cannot see how they\'re known cannot fully author their own future.</strong></p>' },
    'node-4': { content: '<p>Autonomy requires that a person\'s choices come from their own reasoning, not forces engineered to steer them toward a predetermined outcome. Data-driven systems threaten this through what philosophers call <em>online manipulation</em>: rather than offering reasons you can weigh, they <strong>covertly target the psychological vulnerabilities</strong> your behavioral data reveals (Susser, Roessler &amp; Nissenbaum, 2019). An honest advertisement still engages your judgment. A feed that has learned exactly what keeps you scrolling bypasses it instead. <strong>You experience the result as simply what appeared, not a prediction.</strong></p><p>This is why the harm isn\'t incidental. Respect for <em>autonomy</em>, <strong>the capacity to act on reasons genuinely your own</strong>, is foundational to liberal democracy precisely because it separates a person from an object that can be steered. <strong>A choice engineered by a system that studied you to move you isn\'t autonomous just because it feels like one.</strong></p>' },
    'node-5': { content: '<p>A chatbot doesn\'t need to feel anything to make you feel understood. Sherry Turkle calls this <em>the illusion of companionship without the demands of friendship</em>: technology built to simulate care well enough that <strong>the simulation functions as care</strong>, at least until the moment you need it to respond like it actually understands you (Turkle, 2011).</p><p>Researchers studying human-AI relationships have found this isn\'t incidental. Anthropomorphic design, a name, a warm tone, a memory of your last conversation, <strong>measurably increases how much personal information people disclose</strong>, especially once the interaction starts to feel like an ongoing relationship rather than a single exchange (Register, Khan, Giubilini, Earp &amp; Savulescu, 2025). <strong>That\'s the mechanism, not a side effect</strong>: the more a system convinces you it\'s a confidant, the more you hand it. A therapist or friend earns disclosure through years of demonstrated discretion. A chatbot earns the same disclosure through design choices that cost nothing and carry no reciprocal risk. <strong>The trust is real. What\'s on the other end of it isn\'t.</strong></p>' },
    'node-6': { content: '<p>The profile built to sell you sneakers is not a different system from the one that can sell you a political lie. Targeting infrastructure is <strong>domain-agnostic</strong>: whatever determines which ad reaches you can just as easily determine which propaganda, disinformation, or fraud reaches you, since all three need the same thing, <strong>a precise behavioral model of one person</strong>. Researcher Zeynep Tufekci calls this repurposing <em>computational politics</em>: the machinery of ad-targeting, redirected at scale toward manipulating political belief rather than purchasing behavior, with no new capability required (Tufekci, 2014).</p><p>This is the shift from personal harm to societal harm. <strong>A manipulated purchase affects one person. A manipulated electorate affects everyone</strong>, including those who were never targeted directly. The platforms that built this infrastructure can point to terms of service that permit the data collection, but consent to profiling was never consent to how that profile gets used next. <strong>Building the tool and disclaiming its use don\'t erase responsibility for either.</strong></p>' },
    'node-7': { content: '<p>Surveillance is not applied evenly. Algorithms trained on arrest data don\'t predict crime accurately because they focus on places where police already looked. A landmark study applied a predictive policing algorithm to Oakland\'s drug arrest data and found it <strong>concentrated almost entirely on poor, minority neighborhoods, despite drug use being roughly even citywide</strong> (Lum &amp; Isaac, 2016). <strong>More patrols there produce more arrests there, which the system reads as confirmation, not bias.</strong></p><p>This is what civil rights law calls <em>disparate impact</em>: <strong>a pattern where a facially neutral policy\'s effects fall disproportionately on one group, regardless of intent</strong>. A number looks neutral in a way human judgment never does, but once bias gets built into the system, it stops varying from person to person and just repeats. <strong>The cost that follows is concrete: each new contact means another arrest, conviction, and updated record that closes off jobs and housing, deepening the same disadvantage the data reflected in the first place.</strong></p>' },
    'node-8': { content: '<p>Institutions repeatedly collect data in ways that contradict their own stated policies, settle lawsuits over the violations, and then continue the same practice under a different name. Legal scholar Jack Balkin argues that companies collecting personal data function less like ordinary vendors and more like <strong>fiduciaries</strong>, the category that includes doctors and lawyers, who are bound to act in a client\'s interest specifically because the client cannot fully monitor what\'s done with sensitive information once it\'s handed over (Balkin, 2016). A privacy policy, by this logic, isn\'t the whole of the obligation. It\'s the visible part of a broader trust relationship, one that doesn\'t reset just because a company rewrites its terms of service before the next login.</p><p>Each breach is therefore not just a broken promise. <strong>It\'s evidence the relationship was never actually being honored as one of trust</strong>, and an institution that has shown this gives people no rational reason to extend it good faith again.</p>' },
    'node-9': { content: '<p>The most effective way to eliminate a right isn\'t to revoke it, but to shift the baseline it\'s judged against. Sociologist Diane Vaughan calls this <em>normalization of deviance</em>: each expansion is measured against whatever level of surveillance prevails, so <strong>the baseline resets with every violation</strong> (Vaughan, 1996). Knowing you\'re observed changes your behavior without anyone telling you to. Wikipedia traffic to articles on sensitive topics like terrorism <strong>dropped 20 percent within weeks of the 2013 Snowden revelations</strong> (Penney, 2016). This self-censorship needs no repression, just the awareness that your actions are recorded.</p><p>A society that internalizes this loses access to the version of itself before the observation began. Neil Richards calls what\'s at stake <em>intellectual privacy</em>, the protection of thought and belief from outside scrutiny, and <strong>a precondition for every civil liberty</strong> (Richards, 2013). The freedom to think and dissent unwatched isn\'t a luxury. It\'s the foundation everything else depends on.</p>' },
    'node-10': { content: '<p>Data collection methods range from browsing history to biometric scans and genetic tests, the latter <strong>permanent</strong>: a password can be reset, but a faceprint or DNA sequence cannot. Combined across sources, these fragments assemble into a profile assembled without the person\'s consent. Once your identity exists in a database, it doesn\'t stay contained to whoever collected it. In 2017, a single breach at Equifax exposed the Social Security numbers of <strong>roughly 147 million Americans</strong>, a number no one can change once it\'s been stolen. Even without a breach, identity spreads by design. Researchers tracing data flows between ad exchanges found that <strong>as few as 52 tracking companies</strong>, through routine data-sharing agreements with the platform you actually used, can piece together <strong>91 percent of an average person\'s browsing history</strong> (Bashir &amp; Wilson, 2018). Contributing your identity to one company was never really a decision to share it with one company.</p>' },
    'node-11': { content: '<p>Most data collected about you outlasts the context it was created in because <strong>storage now costs so little that retention has replaced deletion as the default</strong> (Mayer-Schönberger, 2009). True deletion is rare; what usually happens is <em>suppression</em>, the record made invisible to you, not erased. This holds even as recommendation algorithms visibly adapt: an updating model still sits atop a record that was never deleted, and that record can resurface years later regardless of what the system shows you now.</p><p>People grow and contexts shift. A digital record holds decisions made in vastly different time periods with equal weight, treating human beings as static objects rather than evolving subjects. In 2014 Europe\'s highest court forced Google to stop surfacing a Spanish man\'s 16-year-old debt notice, establishing what\'s now called the <em>right to be forgotten</em> (Google Spain v. Costeja González, 2014). <strong>Without that right, the record becomes a permanent judgment, never subject to appeal.</strong></p>' },
};

let activeNodeId = null;

function toggleCard(nodeEl) {
    const nodeId  = nodeEl.id;
    const cardNum = nodeId.replace('node-', '');
    const cardEl  = document.getElementById('card-' + cardNum);
    if (!cardEl) return;

    // Clicking the active node closes its card
    if (activeNodeId === nodeId) {
        cardEl.classList.remove('active');
        activeNodeId = null;
        return;
    }

    // Close previously open card
    if (activeNodeId) {
        const prevCard = document.getElementById('card-' + activeNodeId.replace('node-', ''));
        if (prevCard) prevCard.classList.remove('active');
    }

    // Fill card content
    const indexEl = nodeEl.querySelector('.node-index');
    const titleEl = nodeEl.querySelector('.node-title');
    const data    = NODE_DATA[nodeId] || {};

    cardEl.querySelector('.card-node-index').textContent = indexEl ? indexEl.textContent : '';
    cardEl.querySelector('.card-title').textContent      = titleEl ? titleEl.textContent : '';
    cardEl.querySelector('.card-body').innerHTML         = data.content || '<p>Content coming soon.</p>';

    // Trigger entrance animation
    requestAnimationFrame(() => requestAnimationFrame(() => {
        cardEl.classList.add('active');
    }));

    activeNodeId = nodeId;
}

// Wire up child nodes 1–9 only (master node has no card)
for (let i = 1; i < NODE_IDS.length; i++) {
    const el = document.getElementById(NODE_IDS[i]);
    if (el) el.addEventListener('click', () => toggleCard(el));
}
