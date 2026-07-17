document.addEventListener('DOMContentLoaded', () => {

  /* =========================================================
     1. Loading screen
  ========================================================= */
  const loadingScreen = document.getElementById('loading-screen');
  const loaderFill = document.getElementById('loader-fill');
  const loaderPct = document.getElementById('loader-pct');

  (function runLoader() {
    let progress = 0;
    const duration = 1100; // ms
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      progress = Math.min(100, Math.round((elapsed / duration) * 100));
      loaderFill.style.width = progress + '%';
      loaderPct.textContent = progress + '%';
      if (progress < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          loadingScreen.classList.add('loaded');
          startTerminalBoot();
          revealOnLoad();
        }, 150);
      }
    }
    requestAnimationFrame(tick);
  })();

  /* =========================================================
     2. Terminal typing effect (signature hero element)
  ========================================================= */
  const terminalBody = document.getElementById('terminal-body');

  const bootLines = [
    { text: '$ whoami', cls: 'prompt', pause: 250 },
    { text: 'Chetan Ambiger — Frontend Developer / founder', cls: '', pause: 350 },
    { text: '$ status --check', cls: 'prompt', pause: 250 },
    { text: '✓ models: serving', cls: 'success', pause: 120 },
    { text: '✓ infra: stable', cls: 'success', pause: 120 },
    { text: '✓ availability: open for  industrial Opportunites', cls: 'success', pause: 350 },
    { text: '$ cat focus.txt', cls: 'prompt', pause: 250 },
    { text: '// building reliable AI systems, end to end', cls: 'comment', pause: 0 },
  ];

  let terminalStarted = false;

  function startTerminalBoot() {
    if (terminalStarted || !terminalBody) return;
    terminalStarted = true;
    typeLine(0);
  }

  function typeLine(lineIndex) {
    if (lineIndex >= bootLines.length) {
      const cursor = document.createElement('span');
      cursor.className = 'terminal-cursor';
      terminalBody.appendChild(cursor);
      return;
    }
    const line = bootLines[lineIndex];
    const lineEl = document.createElement('div');
    if (line.cls) lineEl.className = line.cls;
    terminalBody.appendChild(lineEl);

    let charIndex = 0;
    const speed = line.cls === 'prompt' ? 38 : 14;

    function typeChar() {
      if (charIndex < line.text.length) {
        lineEl.textContent += line.text.charAt(charIndex);
        charIndex++;
        setTimeout(typeChar, speed);
      } else {
        setTimeout(() => typeLine(lineIndex + 1), line.pause);
      }
    }
    typeChar();
  }

  /* =========================================================
     3. Scroll reveal (IntersectionObserver)
  ========================================================= */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  function revealOnLoad() {
    // Reveal anything already in the hero viewport immediately after loader clears
    const heroReveals = document.querySelectorAll('#home .reveal-up');
    heroReveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('in-view');
      }
    });
  }

  /* =========================================================
     4. Navbar: scroll state + active link highlight
  ========================================================= */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('[data-nav]');
  const sections = Array.from(document.querySelectorAll('section[id]'));

  function onScroll() {
    // navbar background
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // active section detection
    let currentId = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + 140;
    sections.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = section.id;
      }
    });
    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('active-nav', isActive);
    });

    // back to top visibility
    if (window.scrollY > 600) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* =========================================================
     5. Mobile menu
  ========================================================= */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    mobileMenu.classList.toggle('hidden-menu');
  });

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      menuToggle.classList.remove('open');
      mobileMenu.classList.remove('open');
      mobileMenu.classList.add('hidden-menu');
    });
  });

  /* =========================================================
     6. Smooth scroll for in-page anchors
  ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const offset = 72;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  });

  /* =========================================================
     7. Animated counters
  ========================================================= */
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach((c) => counterObserver.observe(c));

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10) || 0;
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(step);
  }

  /* =========================================================
     8. Cursor glow (desktop only)
  ========================================================= */
  const cursorGlow = document.getElementById('cursor-glow');
  if (window.matchMedia('(hover: hover) and (min-width: 1024px)').matches) {
    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      requestAnimationFrame(animateGlow);
    }
    animateGlow();
  }

  /* =========================================================
     9. Ripple button effect
  ========================================================= */
  document.querySelectorAll('.ripple').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple-effect';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* =========================================================
     10. Back to top button
  ========================================================= */
  const backToTop = document.getElementById('back-to-top');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =========================================================
     11. Contact form (frontend only, no backend)
  ========================================================= */
  const contactForm = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const formSuccess = document.getElementById('form-success');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitText.textContent = 'Sending...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    setTimeout(() => {
      submitText.textContent = 'Send message';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      formSuccess.classList.remove('hidden');
      contactForm.reset();
      setTimeout(() => formSuccess.classList.add('hidden'), 4000);
    }, 900);
  });

});