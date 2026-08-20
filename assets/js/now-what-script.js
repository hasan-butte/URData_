/* ============================================================
   now-what-script.js
   Handles: nav eye tracking, typing animation, puzzle piece
   hover/click/shift-out, SVG shape draw-in animation,
   content population from data array.
   ============================================================ */

// ── Category data ──────────────────────────────────────────
// Edit name, subsections[].title and subsections[].desc for
// real content. desc supports basic HTML (<strong>, <em>).

const CATEGORIES = [
    {
        id:   0,
        name: 'Personal Computers',
        subsections: [
            {
                title: 'Reduce OS Telemetry',
                desc: '<p>This is tied to your operating system, not your browser or internet connection. On Windows, go to Settings, then Privacy and Security, then Diagnostics and Feedback, and set your diagnostic data level to "Required" (this may slightly vary depending on your system version). Turn off "Tailored experiences" and "Improve inking and typing." On macOS, go to System Settings, then Privacy and Security, then Analytics and Improvements, and disable sharing. If you want full control over your system\'s telemetry, consider switching to a Linux distribution like Linux Mint or Zorin OS, which do not include telemetry by default.</p>',
            },
            {
                title: 'Encrypt Your Drive',
                desc: '<p>Full disk encryption protects your data if your laptop is lost, stolen, or physically accessed by someone else. On Windows, use BitLocker (available on Pro and Enterprise editions). On Linux, use LUKS encryption, which can be set up during installation. On macOS, FileVault is built in and can be enabled in System Settings. Without encryption, anyone who can access your hard drive can read everything on it, including saved passwords, documents, and browser data.</p>',
            },
            {
                title: 'Audit App Permissions at the OS Level',
                desc: '<p>Review which programs on your computer have access to your camera, microphone, location, and file system. On Windows, go to Settings, then Privacy and Security, and check each category (Camera, Microphone, Location, etc.) to see which applications have been granted access. On macOS, go to System Settings, then Privacy and Security. Revoke access for any application that doesn\'t need it. Many programs request permissions during installation that go far beyond what they actually need to function.</p>',
            },
            {
                title: 'Use a Local Account Instead of a Cloud Account',
                desc: '<p>Signing into Windows with a Microsoft account or macOS with an Apple ID ties your device activity to a cloud profile. Your app usage, settings, browsing history, and documents can be synced and stored on the company\'s servers. Using a local account instead disconnects that link. On Windows, you can switch to a local account in Settings under Accounts. This limits the amount of behavioral data that leaves your device.</p>',
            },
            {
                title: 'Disable Startup Programs That Phone Home',
                desc: '<p>Many preinstalled or auto-updating programs connect to external servers every time your computer boots, without you knowing. These connections can transmit usage data, check for updates, or sync telemetry. On Windows, open Task Manager, go to the Startup tab, and disable programs you don\'t need running at boot. On macOS, go to System Settings, then General, then Login Items. Review and remove anything unnecessary. Fewer programs running at startup means fewer silent connections being made on your behalf.</p>',
            },
            {
                title: 'Cover Your Webcam and Disable Unused Hardware',
                desc: '<p>Laptops come with built-in cameras and microphones that can be accessed by software without a visible indicator on some older systems. Place a physical cover over your webcam when you\'re not using it. You can also disable your microphone and camera at the operating system level through device settings or, on some machines, through the BIOS/UEFI firmware. If you don\'t use a particular piece of hardware, disabling it eliminates the possibility of it being accessed without your knowledge.</p>',
            },
        ],
    },
    {
        id:   1,
        name: 'Mobile Devices',
        subsections: [
            {
                title: 'Review App Permissions',
                desc: '<p>Go through which apps have access to your camera, microphone, contacts, location, and storage. Revoke anything that isn\'t essential to the app\'s function. A flashlight app doesn\'t need your contacts. On Android, go to Settings, then Privacy, then Permission Manager. On iOS, go to Settings, then Privacy and Security. Check each permission category and ask whether each app genuinely needs the access it has been granted. Do this regularly, not just once.</p>',
            },
            {
                title: 'Disable Your Advertising ID',
                desc: '<p>Both iOS and Android assign a unique advertising identifier that lets apps and advertisers track you across different apps. You can reset or disable it entirely in your phone\'s privacy settings. On Android, go to Settings, then Privacy, then Ads, and select "Delete advertising ID." On iOS, go to Settings, then Privacy and Security, then Tracking, and turn off "Allow Apps to Request to Track." This removes one of the primary tools advertisers use to build a cross-app profile of your behavior.</p>',
            },
            {
                title: 'Limit Location Services Per App',
                desc: '<p>Set location access to "only while using" or "never" for apps that don\'t need it. Many apps request persistent background location access when they only need it occasionally, or not at all. On both iOS and Android, you can review location permissions per app in your privacy settings. Pay attention to apps that request "precise" location when "approximate" would be sufficient. A weather app doesn\'t need your exact GPS coordinates to tell you the forecast.</p>',
            },
            {
                title: 'Avoid In-App Browsers',
                desc: '<p>When you click a link inside apps like Instagram, TikTok, or Facebook, the link opens inside the app\'s own built-in browser instead of your regular one. These in-app browsers can inject JavaScript tracking code into every page you visit, monitoring taps, keystrokes, and form inputs. Instead of viewing links inside the app, copy the URL and open it in your regular browser. Many apps also offer an "Open in browser" option in the menu. This is a mobile-specific behavior since in-app browsers don\'t exist on desktops.</p>',
            },
            {
                title: 'Audit Preinstalled Bloatware',
                desc: '<p>Phones come loaded with manufacturer and carrier apps that may collect data before you even finish setup. Many of these cannot be fully uninstalled, but they can usually be disabled. Go through your app list and disable or uninstall any preinstalled software you don\'t use. For apps that can\'t be removed, restrict their permissions so they have no access to your camera, microphone, contacts, or location. Bloatware from carriers is often the worst offender.</p>',
            },
            {
                title: 'Turn Off Wi-Fi and Bluetooth Scanning',
                desc: '<p>Even with Wi-Fi turned off, many phones still scan for nearby Wi-Fi networks and Bluetooth devices in the background for location purposes. This broadcasts your device\'s presence to nearby trackers, including retail foot traffic sensors and mall analytics systems that monitor how shoppers move through stores. On Android, go to Settings, then Location, then Wi-Fi and Bluetooth Scanning, and disable both. On iOS, fully disabling this requires turning off Wi-Fi and Bluetooth from Settings rather than just the Control Center toggle, which only disconnects from current connections without stopping background scanning.</p>',
            },
        ],
    },
    {
        id:   2,
        name: 'Unconventional Devices',
        subsections: [
            {
                title: 'Disable ACR on Your Smart TV',
                desc: '<p>Go into your TV\'s privacy settings and turn off Automatic Content Recognition. The setting name varies by brand: "Viewing Information Services" on Samsung, "Live Plus" on LG, "Viewing Data" on Vizio, "Samba Interactive TV" on Sony. This stops your TV from taking screenshots of your screen and sending them to the manufacturer. ACR works on any input source, so even content from a gaming console or laptop connected via HDMI is captured unless you disable it.</p>',
            },
            {
                title: 'Mute Smart Speakers When Not in Use',
                desc: '<p>Devices like Alexa and Google Home have physical mute buttons that disconnect the microphone. Use them when you\'re not actively issuing commands. Also go into the companion app and delete stored voice recordings regularly, and disable the option to save recordings for "product improvement." On Alexa, go to Settings, then Alexa Privacy, then Review Voice History. Enable automatic deletion so recordings don\'t accumulate indefinitely.</p>',
            },
            {
                title: 'Disable Cloud Map Storage on Robot Vacuums',
                desc: '<p>Robot vacuums use lidar or cameras to map your home\'s layout, including room dimensions and furniture placement, so they can clean efficiently. On many models, that map uploads to the manufacturer\'s cloud by default so it can appear in the app. Look for a local-storage or offline setting to keep the map on the device instead, and if you don\'t need room-specific scheduling, running the vacuum with Wi-Fi off keeps your floor plan off any server entirely.</p>',
            },
            {
                title: 'Check Your Car\'s Telematics and Connected Services',
                desc: '<p>Many modern vehicles collect driving speed, braking habits, GPS routes, and location history and share it with the manufacturer or insurance companies. Check your vehicle\'s infotainment settings or contact the manufacturer to find out what data is being collected and how to opt out of data sharing programs. If your car has a companion app, review its privacy settings as well. Some manufacturers allow you to disable data sharing entirely, while others require you to contact them directly.</p>',
            },
            {
                title: 'Isolate IoT Devices on a Separate Network',
                desc: '<p>If your router supports it, create a guest network and connect all smart home devices to it. This keeps your IoT devices separated from your computers and phones, so if a smart device is compromised or its data is intercepted, the attacker cannot access the rest of your network. Most modern routers support guest networks through their admin settings. This is one of the simplest and most effective steps you can take to limit the damage a compromised IoT device can cause.</p>',
            },
            {
                title: 'Review Wearable and Fitness Tracker Privacy Settings',
                desc: '<p>Disable public activity sharing on fitness apps. Turn off GPS tracking for workouts where you don\'t need it, such as indoor exercises or gym sessions. Enable privacy zones around your home and workplace so those locations are hidden from your activity maps. Revoke research consent if you previously opted in to having your health data shared with third parties. On Fitbit, review connected apps in your account settings and remove any you no longer use.</p>',
            },
        ],
    },
    {
        id:   3,
        name: 'Information & Outreach',
        subsections: [
            {
                title: 'Learn Your Rights Under Existing Privacy Laws',
                desc: '<p>Depending on where you live, you may already have legal protections you don\'t know about. California\'s CCPA/CPRA gives residents the right to see what data companies hold on them and request deletion. Illinois\' BIPA requires consent before biometric data is collected. The EU\'s GDPR gives broad data access and deletion rights. Knowing what laws apply to you is the foundation for everything else. You cannot exercise rights you don\'t know you have.</p>',
            },
            {
                title: 'Submit Data Access Requests',
                desc: '<p>Most major companies are legally required to show you what data they hold on you if you ask. You can submit requests to Google, Meta, Amazon, data brokers like Acxiom, and even companies you\'ve never directly interacted with. Seeing your own file is often the most effective way to understand the scale of what\'s being collected. Google Takeout, Meta\'s "Download Your Information" tool, and Acxiom\'s consumer portal are starting points.</p>',
            },
            {
                title: 'Request Data Deletion and Opt Out of Data Brokers',
                desc: '<p>Services like Acxiom, Spokeo, and Whitepages allow opt-out requests. California\'s Delete Act is building a centralized system for opting out of multiple data brokers at once. Make deletion requests a regular habit rather than a one-time action, because your data gets re-aggregated over time. Keep in mind that opting out of a data broker\'s marketing products may only suppress your data rather than actually delete it.</p>',
            },
            {
                title: 'Talk to People Around You About Their Digital Habits',
                desc: '<p>Many of the surveillance methods covered on this site depend on other people\'s actions. Someone uploading their contacts gives an app data on you. A family member\'s DNA test exposes your genetic information. A friend\'s public app transaction reveals your name. Privacy is collective, and the people in your life affect your exposure whether they realize it or not. Having a conversation about these issues with the people closest to you is one of the most practical things you can do.</p>',
            },
            {
                title: 'Support Privacy-Focused Legislation',
                desc: '<p>Contact your representatives about supporting comprehensive federal privacy laws. The U.S. still lacks a single federal data privacy law comparable to GDPR. State-level laws are inconsistent and leave gaps. Many states have no data privacy protections at all. Advocating for stronger legislation is one of the most impactful long-term actions an individual can take. Organizations like the EFF and EPIC provide tools for contacting legislators about specific privacy bills.</p>',
            },
            {
                title: 'Follow Credible Privacy Organizations and Journalists',
                desc: '<p>Groups like the EFF, EPIC, Privacy International, and The Markup do ongoing work exposing data collection practices and pushing for accountability. Following their work keeps you informed about new threats and new tools without having to do the research yourself. Many of these organizations publish practical guides, browser extensions, and action alerts that make it easy to act on what you learn.</p>',
            },
            {
                title: 'Be Skeptical of "Free" Products and Services',
                desc: '<p>If a product is free and the company behind it is profitable, your data is likely the revenue source. This doesn\'t mean you have to avoid all free services, but understanding the trade-off helps you make informed decisions about which ones are worth using and which ones are taking more than they give. Ask yourself what the company gains from offering the product for free. If the answer isn\'t obvious, the answer is probably your data.</p>',
            },
            {
                title: 'Teach Younger People How Surveillance Works',
                desc: '<p>Many of the most aggressive data collection platforms target younger users who are least equipped to understand the implications. Social media and gaming platforms tend to collect extensive data from minors. If you have younger siblings, children, or students in your life, helping them understand how their data is collected and used is one of the most valuable things you can pass on. Privacy literacy should start before someone creates their first social media account, not after.</p>',
            },
        ],
    },
    {
        id:   4,
        name: 'The Internet',
        subsections: [
            {
                title: 'Switch to a Privacy-Focused Browser',
                desc: '<p>Some browsers collect numerous types of user data and feed it into their advertising ecosystem. Look for a browser with built-in protections against fingerprinting, third-party tracking, and invasive cookies, and check its current privacy policy rather than trusting reputation alone, since even privacy-focused browsers have walked back data promises before. Open-source options let independent researchers verify what the browser is actually doing, which matters more for trust than any company\'s marketing. Your browser is one of the biggest points of contact between you and the tracking infrastructure of the web, so switching to one with stronger defaults is one of the highest-impact changes you can make.</p>',
            },
            {
                title: 'Install Tracker-Blocking Extensions',
                desc: '<p>uBlock Origin blocks ads and tracking scripts before they load. Privacy Badger learns to detect and block trackers as you browse. ClearURLs strips tracking parameters from links automatically. These tools prevent the vast majority of cross-site tracking that powers behavioral advertising. Installing even one of these extensions dramatically reduces the number of third parties that can observe your browsing activity.</p>',
            },
            {
                title: 'Use a VPN',
                desc: '<p>A VPN encrypts your internet traffic so your ISP cannot see which websites you visit. Choose a provider with a verified no-logs policy and independent audits. Be aware that a VPN shifts your trust from your ISP to the VPN provider, so the provider you choose matters. Free VPNs often monetize your data in the same ways an ISP would. A reputable paid VPN is one of the most effective tools for limiting ISP surveillance.</p>',
            },
            {
                title: 'Switch Your DNS Provider',
                desc: '<p>By default, your ISP handles your DNS queries, which means it can see every domain you visit. Switching to a privacy-respecting provider like Cloudflare (1.1.1.1) or Quad9 (9.9.9.9) removes that visibility. Enable DNS over HTTPS in your browser settings to encrypt those queries so they can\'t be intercepted. On Firefox, go to Settings, then Privacy and Security, and scroll to DNS over HTTPS. On Chrome-based browsers, go to Settings, then Privacy and Security, then Security, and enable "Use secure DNS."</p>',
            },
            {
                title: 'Use a Password Manager and Enable Two-Factor Authentication',
                desc: '<p>Stop reusing passwords across services. A password manager generates and stores unique passwords for every account. Enable two-factor authentication on every account that supports it, especially email, banking, and social media. When a breach exposes one password, reuse is what turns a single compromise into a cascade. Options like Bitwarden offer strong security and you get most features for free. </p>',
            },
            {
                title: 'Strip Tracking Parameters From Links Before Sharing',
                desc: '<p>When you copy a link from a social media platform or a marketing email, everything after the "?" is usually tracking data (fbclid, utm tags, etc.). Remove it before sending the link to someone else. Browser extensions like ClearURLs do this automatically. This prevents platforms from mapping your social connections through shared links. The person you\'re sharing with also benefits because the platform can\'t profile them through the tracked link.</p>',
            },
            {
                title: 'Use Alternative Search Engines',
                desc: '<p>Search engines can build a detailed profile from every query you enter, linked to your identity over time. Privacy-respecting alternatives like DuckDuckGo or Brave search exist that don\'t log your searches, store your IP address, or build a profile from your queries. Some are owned by companies whose main business is advertising, so it\'s worth checking who owns a search engine and where it\'s based before trusting it fully. Switching your default search engine takes seconds and immediately eliminates one of the most consistent sources of behavioral data feeding into your profile. Most browsers let you change the default search engine in their settings menu.</p>',
            },
            {
                title: 'Use Email Aliases and Disposable Addresses',
                desc: '<p>Services like SimpleLogin, Firefox Relay, and Proton Mail let you create unique email addresses for each service you sign up for. If one gets compromised or sold to spam lists, you disable that alias without affecting your real address. This also prevents companies from correlating your accounts across different services using a shared email. Using a different alias for each account creates a firewall between your identities across platforms.</p>',
            },
        ],
    },
];

// ── DOM references ─────────────────────────────────────────

const navEyeSvg    = document.getElementById('nav-eye-svg');
const navPupil     = document.getElementById('nav-pupil');
const navHighlight = document.getElementById('nav-highlight');

const puzzleIntro  = document.getElementById('puzzle-intro');
const puzzleArena  = document.getElementById('puzzle-arena');
const puzzleTitle  = document.getElementById('puzzle-title');

const contentSection = document.getElementById('content-section');
const placeholder    = document.getElementById('content-placeholder');
const contentCard    = document.getElementById('content-card');
const scrollTopBtn   = document.getElementById('scroll-top-btn');

// ── State ──────────────────────────────────────────────────

let selectedId   = null;
let transitioning = false;

// Shift vectors: each piece moves away from puzzle centre when selected
const SHIFTS = [
    { x: -26, y:  0  },   // piece 0 — left
    { x: -18, y:  18 },   // piece 1 — lower-left
    { x:   0, y:  26 },   // piece 2 — down
    { x:  18, y:  18 },   // piece 3 — lower-right
    { x:  26, y:   0 },   // piece 4 — right
];

// ── Nav eye tracking ───────────────────────────────────────

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

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

// ── Page load ──────────────────────────────────────────────

window.addEventListener('load', () => {
    requestAnimationFrame(() => {
        puzzleIntro.classList.add('visible');
        setTimeout(() => typeText(puzzleTitle, puzzleTitle.dataset.text || 'Now What?', 80), 200);
    });
    setTimeout(() => puzzleArena.classList.add('visible'), 500);
    setupPieces();
});

// ── Card setup ─────────────────────────────────────────────

function setupPieces() {
    const cards = document.querySelectorAll('.piece-card');
    cards.forEach(card => {
        const id = parseInt(card.dataset.id);
        card.addEventListener('click', () => {
            if (transitioning) return;
            selectPiece(id);
        });
    });
}

// ── Select a card ──────────────────────────────────────────

function selectPiece(id) {
    if (id === selectedId) {
        contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }

    transitioning = true;
    const cards = Array.from(document.querySelectorAll('.piece-card'));

    // Deselect previous
    if (selectedId !== null) {
        cards[selectedId].classList.remove('selected');
    }

    selectedId = id;
    cards[id].classList.add('selected');

    // Dim all others
    cards.forEach((c, i) => {
        c.classList.toggle('dimmed', i !== id);
    });

    setTimeout(() => {
        showContent(id);
        contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        transitioning = false;
    }, 300);
}

// ── Show content card ──────────────────────────────────────

function showContent(id) {
    placeholder.style.display = 'none';

    contentCard.classList.remove('visible');
    contentCard.style.display = 'block';

    populateContent(id, contentCard);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        contentCard.classList.add('visible');
    }));
}

// ── Populate card ──────────────────────────────────────────

function populateContent(id, el) {
    const cat = CATEGORIES[id];
    el.innerHTML = `
        <p class="content-category">${cat.name}</p>
        ${cat.subsections.map(sub => `
            <div class="collapsible-section">
                <button class="collapsible-header">
                    <span class="subsection-title">${sub.title}</span>
                    <span class="collapsible-arrow">▾</span>
                </button>
                <div class="collapsible-body">
                    <div class="collapsible-inner subsection">${sub.desc}</div>
                </div>
            </div>
        `).join('')}
    `;

    el.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            header.closest('.collapsible-section').classList.toggle('open');
        });
    });
}

// ── SVG shape draw-in animation ────────────────────────────

function animateShape(container) {
    const paths = container.querySelectorAll('.animate-path');
    paths.forEach((path, i) => {
        const len = path.getTotalLength ? path.getTotalLength() : 600;
        path.style.strokeDasharray  = len;
        path.style.strokeDashoffset = len;
        path.style.transition       = 'none';
        // Force reflow before starting transition
        path.getBoundingClientRect();
        path.style.transition = `stroke-dashoffset 0.75s ease ${i * 0.08}s`;
        path.style.strokeDashoffset = '0';
    });
}

// ── Scroll: back-to-top ────────────────────────────────────

window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
}, { passive: true });

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
scrollTopBtn.addEventListener('click', scrollToTop);
