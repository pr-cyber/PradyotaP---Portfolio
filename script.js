/* ════════════════════════════════════════════════
   PRADYOTA PHANEESH — PORTFOLIO JAVASCRIPT v5
   
   1. Navbar scroll background
   2. Scroll-reveal animations  (progressive enhancement + hard fallback)
   3. Mobile hamburger menu
   4. Active nav link highlight
   5. Clickable project cards (data-href)
   6. Image lightbox (gallery pages)
════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────
   SAFE QUERY HELPERS
   All DOM queries go through these so a missing
   element never throws and breaks the whole script.
───────────────────────────────────────────── */
function $(id)   { return document.getElementById(id); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }


/* ─────────────────────────────────────────────
   1. NAVBAR — frosted glass on scroll
───────────────────────────────────────────── */
(function initNavbar() {
  var navbar = $('navbar');
  if (!navbar) return;
  function onScroll() { navbar.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────
   2. SCROLL REVEAL  —  progressive enhancement
   CSS default: opacity:1 (always visible).
   Adding body.js-reveal-ready opts into animation.
   Hard timeout at 1.5s ensures nothing stays hidden.
───────────────────────────────────────────── */
(function initReveal() {
  document.body.classList.add('js-reveal-ready');

  var els = $$('.reveal');
  if (!els.length || !window.IntersectionObserver) {
    // No observer support → show everything immediately
    els.forEach(function(el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  els.forEach(function(el) { observer.observe(el); });

  // Hard fallback — nothing stays hidden after 1.5s
  setTimeout(function() {
    $$('.reveal:not(.visible)').forEach(function(el) { el.classList.add('visible'); });
  }, 1500);
})();


/* ─────────────────────────────────────────────
   3. MOBILE HAMBURGER MENU
───────────────────────────────────────────── */
(function initHamburger() {
  var hamburger  = $('hamburger');
  var mobileMenu = $('mobileMenu');
  if (!hamburger || !mobileMenu) return;

  var open = false;

  function openMenu() {
    open = true;
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    var bars = hamburger.querySelectorAll('span');
    if (bars[0]) bars[0].style.transform = 'translateY(7px) rotate(45deg)';
    if (bars[1]) bars[1].style.opacity   = '0';
    if (bars[2]) bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  }

  function closeMenu() {
    open = false;
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    var bars = hamburger.querySelectorAll('span');
    if (bars[0]) bars[0].style.transform = '';
    if (bars[1]) bars[1].style.opacity   = '';
    if (bars[2]) bars[2].style.transform = '';
  }

  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    open ? closeMenu() : openMenu();
  });

  // Close when a menu link is clicked
  $$('.mobile-link').forEach(function(link) {
    link.addEventListener('click', function() { closeMenu(); });
  });

  // Close on outside click
  document.addEventListener('click', function(e) {
    if (!open) return;
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMenu();
    }
  });

  // Close if resized to desktop width
  window.addEventListener('resize', function() {
    if (window.innerWidth > 980 && open) closeMenu();
  });
})();


/* ─────────────────────────────────────────────
   4. ACTIVE NAV LINK  —  highlights current section
───────────────────────────────────────────── */
(function initActiveNav() {
  var sections = $$('section[id]');
  var links    = $$('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;

  function update() {
    var currentId = '';
    sections.forEach(function(s) {
      var r = s.getBoundingClientRect();
      if (r.top <= window.innerHeight * 0.45 && r.bottom >= 0) {
        currentId = s.id;
      }
    });
    links.forEach(function(a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + currentId);
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ─────────────────────────────────────────────
   5. CLICKABLE PROJECT CARDS
   
   Each .proj-card[data-href] is fully clickable.
   Clicking the "View Project →" <a> button navigates
   via its own href (normal anchor behaviour).
   Clicking anywhere else on the card navigates via
   the card's data-href attribute.
   
   Ctrl/Cmd + click opens in a new tab.
───────────────────────────────────────────── */
(function initClickableCards() {
  $$('.clickable-card[data-href]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      // If the click target is inside an <a>, let the anchor handle it naturally
      if (e.target.closest('a[href]')) return;

      var href = card.getAttribute('data-href');
      if (!href) return;

      if (e.ctrlKey || e.metaKey) {
        window.open(href, '_blank');
      } else {
        window.location.href = href;
      }
    });

    // Middle-click → open in new tab
    card.addEventListener('mousedown', function(e) {
      if (e.button === 1) {
        e.preventDefault();
        var href = card.getAttribute('data-href');
        if (href) window.open(href, '_blank');
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   6. IMAGE LIGHTBOX
   
   Picks up all .gal-item elements on the page.
   Click → open fullscreen.  ←→ Esc to navigate.
───────────────────────────────────────────── */
(function initLightbox() {
  var lightbox  = $('lightbox');
  var lbImg     = $('lbImg');
  var lbCaption = $('lbCaption');
  var lbClose   = $('lbClose');
  var lbPrev    = $('lbPrev');
  var lbNext    = $('lbNext');

  if (!lightbox || !lbImg) return;

  var items   = $$('.gal-item');
  var current = 0;

  if (!items.length) return;

  function getImg(item) {
    return item.querySelector('img.gal-img, img.cork-img, img');
  }

  function openAt(idx) {
    var item = items[idx];
    if (!item) return;
    var img = getImg(item);
    if (!img || img.style.display === 'none') return;

    current = idx;
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    var cap = item.querySelector('.gal-caption, figcaption');
    if (lbCaption) lbCaption.textContent = cap ? cap.textContent.trim() : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(function() { lbImg.src = ''; }, 300);
  }

  function prev() { openAt((current - 1 + items.length) % items.length); }
  function next() { openAt((current + 1) % items.length); }

  items.forEach(function(item, i) {
    item.style.cursor = 'zoom-in';
    item.setAttribute('tabindex', '0');
    item.addEventListener('click', function(e) {
      e.stopPropagation(); // Don't trigger card navigation
      openAt(i);
    });
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i); }
    });
  });

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click', prev);
  if (lbNext)  lbNext.addEventListener('click', next);

  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     close();
  });
})();


/* ─── Console Easter Egg ─── */
console.log('%c✦ Pradyota Phaneesh — Engineering Portfolio', 'font-family:Georgia,serif;font-size:14px;color:#0050D8;font-style:italic;');
console.log('%c  B.S. Mechanical Engineering · UT Austin · GPA 3.93', 'font-family:monospace;font-size:11px;color:#888;');
