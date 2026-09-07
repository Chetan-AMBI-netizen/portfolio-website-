/* =========================================================
   Loading screen
   ========================================================= */
(function () {
  const fill = document.getElementById('loader-fill');
  const pct  = document.getElementById('loader-pct');
  const screen = document.getElementById('loading-screen');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 18;
    if (p >= 100) { p = 100; clearInterval(iv); setTimeout(() => screen.classList.add('loaded'), 300); }
    fill.style.width = p + '%';
    pct.textContent  = Math.floor(p) + '%';
  }, 120);
})();

/* =========================================================
   Cursor glow
   ========================================================= */
const glow = document.getElementById('cursor-glow');
document.addEventListener('mousemove', e => {
  glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
});

/* =========================================================
   Navbar scroll state
   ========================================================= */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
  document.getElementById('back-to-top').classList.toggle('visible', window.scrollY > 400);
});

/* =========================================================
   Mobile menu
   ========================================================= */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
});

/* =========================================================
   Active nav link on scroll
   ========================================================= */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('[data-nav]');
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => {
        const isMatch = l.getAttribute('href') === '#' + e.target.id;
        l.classList.toggle('active-nav', isMatch);
      });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => observer.observe(s));

/* =========================================================
   Scroll reveal
   ========================================================= */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); revealObs.unobserve(e.target); } });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal-up').forEach(el => revealObs.observe(el));

/* =========================================================
   Terminal typewriter
   ========================================================= */
const lines = [
  { type: 'prompt',  text: '❯ whoami' },
  { type: 'output',  text: 'Chetan Ambiger' },
  { type: 'prompt',  text: '❯ cat role.txt' },
  { type: 'success', text: 'CSE Student · Founder · Frontend Dev' },
  { type: 'prompt',  text: '❯ cat stack.json' },
  { type: 'output',  text: '{ "frontend": "React / Next.js", "lang": "Python · JS · Java" }' },
  { type: 'prompt',  text: '❯ cat status.txt' },
  { type: 'success', text: '✓ open to internships & open-source' },
  { type: 'comment', text: '// building CareerForge — the student OS' },
];

const termBody = document.getElementById('terminal-body');
let lineIdx = 0, charIdx = 0;
let currentEl = null;

function typeNext() {
  if (lineIdx >= lines.length) {
    const cursor = document.createElement('span');
    cursor.className = 'terminal-cursor';
    termBody.appendChild(cursor);
    return;
  }
  const line = lines[lineIdx];
  if (charIdx === 0) {
    currentEl = document.createElement('div');
    currentEl.className = line.type === 'prompt'  ? 'prompt'
                        : line.type === 'success' ? 'success'
                        : line.type === 'comment' ? 'comment'
                        : '';
    termBody.appendChild(currentEl);
  }
  currentEl.textContent += line.text[charIdx];
  charIdx++;
  if (charIdx < line.text.length) {
    setTimeout(typeNext, 28);
  } else {
    charIdx = 0;
    lineIdx++;
    setTimeout(typeNext, lineIdx % 2 === 0 ? 380 : 180);
  }
}
setTimeout(typeNext, 1400);

/* =========================================================
   Ripple effect on buttons
   ========================================================= */
document.querySelectorAll('.ripple').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const r = document.createElement('span');
    r.className = 'ripple-effect';
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    this.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  });
});

/* =========================================================
   GitHub — fallback handlers if APIs fail
   ========================================================= */
function fallbackContribGraph() {
  const img = document.getElementById('contrib-graph-img');
  if (!img || img.dataset.tried) return;
  img.dataset.tried = '1';
  // Try alternate service
  img.src = 'https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=Chetan-AMBI-netizen&theme=github_dark';
  img.onerror = () => {
    img.closest('.github-graph-wrap').innerHTML =
      '<p class="font-mono text-xs text-text-faint p-6 text-center">Graph unavailable. <a href="https://github.com/Chetan-AMBI-netizen" target="_blank" class="text-cyan underline">View on GitHub →</a></p>';
    checkAllFailed();
  };
}

function fallbackHeatmap() {
  const img = document.getElementById('heatmap-img');
  if (!img || img.dataset.tried) return;
  img.dataset.tried = '1';
  // Try different color variant
  img.src = 'https://ghchart.rshah.org/26a641/Chetan-AMBI-netizen';
  img.onerror = () => {
    img.closest('.github-graph-wrap').innerHTML =
      '<p class="font-mono text-xs text-text-faint p-6 text-center">Heatmap unavailable. <a href="https://github.com/Chetan-AMBI-netizen" target="_blank" class="text-cyan underline">View on GitHub →</a></p>';
    checkAllFailed();
  };
}

function checkAllFailed() {
  const g1 = document.getElementById('contrib-graph-img');
  const g2 = document.getElementById('heatmap-img');
  if ((!g1 || g1.dataset.tried) && (!g2 || g2.dataset.tried)) {
    const fb = document.getElementById('github-fallback');
    if (fb) fb.style.display = 'block';
  }
}

/* =========================================================
   Back to top
   ========================================================= */
document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* =========================================================
   Contact form (placeholder — wire up your backend/Formspree)
   ========================================================= */
document.getElementById('contact-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn  = document.getElementById('submit-btn');
  const text = document.getElementById('submit-text');
  const success = document.getElementById('form-success');
  btn.disabled = true;
  text.textContent = 'Sending…';
  // Simulate send — replace with fetch() to Formspree / your API
  setTimeout(() => {
    text.textContent = 'Send message';
    btn.disabled = false;
    success.classList.remove('hidden');
    this.reset();
    setTimeout(() => success.classList.add('hidden'), 5000);
  }, 1500);
});

/* =========================================================
   Mobile nav: close menu on link click
   ========================================================= */
document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('open');
  });
});
