/* ════════════════════════════════════════════════
   PRADYOTA PHANEESH — PORTFOLIO JAVASCRIPT v8

   1. Navbar scroll background
   2. Scroll reveal (progressive enhancement)
   3. Mobile hamburger menu
   4. Active nav link
   5. About section image carousel
   6. Project group accordion
   7. Clickable project cards (middle-click → new tab)
   8. Image lightbox (project pages)
════════════════════════════════════════════════ */

function $(id)   { return document.getElementById(id); }
function $$(sel) { return Array.from(document.querySelectorAll(sel)); }


/* ─────────────────────────────────────────────
   1. NAVBAR
───────────────────────────────────────────── */
(function initNavbar() {
  var nav = $('navbar');
  if (!nav) return;
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ─────────────────────────────────────────────
   2. SCROLL REVEAL
   body.js-reveal-ready opts in. 1.5s hard fallback.
───────────────────────────────────────────── */
(function initReveal() {
  document.body.classList.add('js-reveal-ready');
  var els = $$('.reveal');
  if (!els.length || !window.IntersectionObserver) {
    els.forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  els.forEach(function(el) { obs.observe(el); });
  setTimeout(function() {
    $$('.reveal:not(.visible)').forEach(function(el) { el.classList.add('visible'); });
  }, 1500);
})();


/* ─────────────────────────────────────────────
   2b. EXPERIENCE TIMELINE ANIMATION
   Each .exp-item animates in independently via
   its own IntersectionObserver (not .reveal).
───────────────────────────────────────────── */
(function initExpTimeline() {
  var items = $$('.exp-item');
  if (!items.length || !window.IntersectionObserver) {
    items.forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  items.forEach(function(el) { obs.observe(el); });
  // Fallback
  setTimeout(function() {
    $$('.exp-item:not(.visible)').forEach(function(el) { el.classList.add('visible'); });
  }, 2500);
})();


/* ─────────────────────────────────────────────
   3. MOBILE HAMBURGER
───────────────────────────────────────────── */
(function initHamburger() {
  var btn  = $('hamburger');
  var menu = $('mobileMenu');
  if (!btn || !menu) return;
  var open = false;
  function openMenu() {
    open = true; menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
    var b = btn.querySelectorAll('span');
    if (b[0]) b[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    if (b[1]) b[1].style.opacity   = '0';
    if (b[2]) b[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  }
  function closeMenu() {
    open = false; menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
    var b = btn.querySelectorAll('span');
    if (b[0]) b[0].style.transform = '';
    if (b[1]) b[1].style.opacity   = '';
    if (b[2]) b[2].style.transform = '';
  }
  btn.addEventListener('click', function(e) { e.stopPropagation(); open ? closeMenu() : openMenu(); });
  $$('.mobile-link').forEach(function(l) { l.addEventListener('click', closeMenu); });
  document.addEventListener('click', function(e) {
    if (!open) return;
    if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
  });
  window.addEventListener('resize', function() { if (window.innerWidth > 960 && open) closeMenu(); });
})();


/* ─────────────────────────────────────────────
   4. ACTIVE NAV LINK
───────────────────────────────────────────── */
(function initActiveNav() {
  var sections = $$('section[id]');
  var links    = $$('.nav-links a[href^="#"]');
  if (!sections.length || !links.length) return;
  function update() {
    var current = '';
    sections.forEach(function(s) {
      var r = s.getBoundingClientRect();
      if (r.top <= window.innerHeight * 0.45 && r.bottom >= 0) current = s.id;
    });
    links.forEach(function(a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* ─────────────────────────────────────────────
   5. ABOUT CAROUSEL
   
   - Loads all 7 slides; hides any with broken/missing images
   - Only shows dots for slides that actually loaded
   - Auto-advances every 4 seconds (crossfade)
   - Click a dot to jump to that slide (resets timer)
   - Shows placeholder if zero images load
───────────────────────────────────────────── */
(function initCarousel() {
  var carousel  = $('aboutCarousel');
  var dotsWrap  = $('carouselDots');
  var ph        = $('carouselPh');
  if (!carousel) return;

  var allSlides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  var loaded    = [];   // slides that successfully loaded an image
  var current   = 0;
  var timer     = null;
  var INTERVAL  = 4000;

  /* Track how many images we're still waiting on */
  var pending = allSlides.length;

  function onAllSettled() {
    if (loaded.length === 0) {
      // No images loaded — show placeholder
      if (ph) ph.style.display = 'flex';
      return;
    }
    // Show first loaded slide
    loaded[0].classList.add('active');
    buildDots();
    startTimer();
  }

  function buildDots() {
    if (!dotsWrap || loaded.length <= 1) return;
    dotsWrap.innerHTML = '';
    loaded.forEach(function(_, i) {
      var dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Photo ' + (i + 1));
      dot.addEventListener('click', function() { goTo(i); startTimer(); });
      dotsWrap.appendChild(dot);
    });
  }

  function getDots() { return dotsWrap ? Array.from(dotsWrap.querySelectorAll('.carousel-dot')) : []; }

  function goTo(idx) {
    var dots = getDots();
    loaded[current].classList.remove('active');
    if (dots[current]) dots[current].classList.remove('active');
    current = (idx + loaded.length) % loaded.length;
    loaded[current].classList.add('active');
    if (dots[current]) dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }

  function startTimer() {
    clearInterval(timer);
    if (loaded.length > 1) timer = setInterval(next, INTERVAL);
  }

  /* Load each image */
  allSlides.forEach(function(img) {
    function settle() {
      pending--;
      if (pending === 0) onAllSettled();
    }

    function onLoad() {
      loaded.push(img);
      settle();
    }

    function onError() {
      img.style.display = 'none'; // hide broken slot
      settle();
    }

    if (img.complete && img.naturalWidth > 0) {
      loaded.push(img);
      pending--;
      if (pending === 0) onAllSettled();
    } else {
      img.addEventListener('load',  onLoad);
      img.addEventListener('error', onError);
    }
  });

  // Safety fallback: if nothing resolves in 3s, run anyway
  setTimeout(function() {
    if (loaded.length > 0 && !loaded[0].classList.contains('active')) {
      onAllSettled();
    } else if (loaded.length === 0 && ph) {
      ph.style.display = 'flex';
    }
  }, 3000);
})();


/* ─────────────────────────────────────────────
   6. PROJECT GROUP ACCORDION
───────────────────────────────────────────── */
(function initAccordion() {
  $$('.proj-group').forEach(function(group) {
    var toggle = group.querySelector('.group-toggle');
    var body   = group.querySelector('.group-body');
    if (!toggle || !body) return;

    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    body.style.maxHeight = isOpen ? 'none' : '0px';

    toggle.addEventListener('click', function() {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        body.style.maxHeight = body.scrollHeight + 'px';
        requestAnimationFrame(function() {
          requestAnimationFrame(function() { body.style.maxHeight = '0px'; });
        });
        toggle.setAttribute('aria-expanded', 'false');
      } else {
        body.style.maxHeight = body.scrollHeight + 'px';
        body.addEventListener('transitionend', function h() {
          if (body.style.maxHeight !== '0px') body.style.maxHeight = 'none';
          body.removeEventListener('transitionend', h);
        });
        toggle.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   7. PROJECT CARDS (middle-click → new tab)
───────────────────────────────────────────── */
(function initCards() {
  $$('.proj-card').forEach(function(card) {
    card.addEventListener('mousedown', function(e) {
      if (e.button === 1) {
        e.preventDefault();
        var href = card.getAttribute('href');
        if (href) window.open(href, '_blank');
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   8. IMAGE LIGHTBOX (project detail pages)
───────────────────────────────────────────── */
(function initLightbox() {
  var lb      = $('lightbox');
  var lbImg   = $('lbImg');
  var lbCap   = $('lbCaption');
  var lbClose = $('lbClose');
  var lbPrev  = $('lbPrev');
  var lbNext  = $('lbNext');
  if (!lb || !lbImg) return;

  var items   = $$('.gal-item');
  var current = 0;
  if (!items.length) return;

  function openAt(idx) {
    var item = items[idx];
    if (!item) return;
    var img = item.querySelector('.gal-img, img');
    if (!img || img.style.display === 'none') return;
    current = idx;
    lbImg.src = img.src; lbImg.alt = img.alt || '';
    if (lbCap) {
      var cap = item.querySelector('.gal-caption, figcaption');
      lbCap.textContent = cap ? cap.textContent.trim() : '';
    }
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lb.classList.remove('open'); document.body.style.overflow = '';
    setTimeout(function() { lbImg.src = ''; }, 300);
  }
  function prev() { openAt((current - 1 + items.length) % items.length); }
  function next() { openAt((current + 1) % items.length); }

  items.forEach(function(item, i) {
    item.style.cursor = 'zoom-in'; item.setAttribute('tabindex', '0');
    item.addEventListener('click', function(e) { e.stopPropagation(); openAt(i); });
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i); }
    });
  });

  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click',  prev);
  if (lbNext)  lbNext.addEventListener('click',  next);
  lb.addEventListener('click', function(e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function(e) {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape')     close();
  });
})();


/* ─── Console Easter Egg ─── */
console.log('%c✦ Pradyota Phaneesh — Engineering Portfolio', 'font-family:Georgia,serif;font-size:13px;color:#0A84FF;font-style:italic;');
console.log('%c  B.S. Mechanical Engineering · UT Austin · GPA 3.93', 'font-family:monospace;font-size:11px;color:#636366;');
