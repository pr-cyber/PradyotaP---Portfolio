/* ════════════════════════════════════════════════
   PRADYOTA PHANEESH — PORTFOLIO JAVASCRIPT v4
   
   1. Navbar scroll background
   2. Scroll-reveal animations
   3. Mobile hamburger menu
   4. Active nav link highlight
   5. Clickable project cards (data-href)
   6. Image lightbox (gallery + photography)
════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. NAVBAR
───────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
function handleNavScroll() {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();


/* ─────────────────────────────────────────────
   2. SCROLL REVEAL
   Adds body.js-reveal-ready so the CSS animation
   activates. Hard fallback: if observer never fires
   within 2s (e.g. local file, slow browser), all
   elements are forced visible.
───────────────────────────────────────────── */

// Opt into the animation NOW (before observing)
document.body.classList.add('js-reveal-ready');

const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.05, rootMargin: '0px 0px -30px 0px' }
);

revealEls.forEach(function(el) { revealObserver.observe(el); });

// Hard fallback: if anything is still hidden after 2s, force show it
setTimeout(function() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(function(el) {
    el.classList.add('visible');
  });
}, 2000);


/* ─────────────────────────────────────────────
   3. MOBILE HAMBURGER
───────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

function openMenu() {
  menuOpen = true;
  mobileMenu.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  const bars = hamburger.querySelectorAll('span');
  bars[0].style.transform = 'translateY(7px) rotate(45deg)';
  bars[1].style.opacity   = '0';
  bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
}
function closeMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  const bars = hamburger.querySelectorAll('span');
  bars[0].style.transform = '';
  bars[1].style.opacity   = '';
  bars[2].style.transform = '';
}

hamburger.addEventListener('click', function() { menuOpen ? closeMenu() : openMenu(); });
document.querySelectorAll('.mobile-link').forEach(function(link) { link.addEventListener('click', closeMenu); });
document.addEventListener('click', function(e) {
  if (menuOpen && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) closeMenu();
});
window.addEventListener('resize', function() { if (window.innerWidth > 900 && menuOpen) closeMenu(); });


/* ─────────────────────────────────────────────
   4. ACTIVE NAV LINK
───────────────────────────────────────────── */
const allSections = document.querySelectorAll('section[id]');
const navLinks    = document.querySelectorAll('.nav-links a[href^="#"]');

function updateActiveLink() {
  let currentId = '';
  allSections.forEach(function(section) {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= 0) {
      currentId = section.getAttribute('id');
    }
  });
  navLinks.forEach(function(a) {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + currentId) a.classList.add('active');
  });
}
window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();


/* ─────────────────────────────────────────────
   5. CLICKABLE PROJECT CARDS
   
   Any element with class "clickable-card" and
   data-href="path/to/page.html" becomes fully
   clickable. The inner <a> button still works
   for keyboard users.
   
   Shift/Ctrl/Cmd + click opens in a new tab.
───────────────────────────────────────────── */
document.querySelectorAll('.clickable-card[data-href]').forEach(function(card) {
  card.addEventListener('click', function(e) {
    // Don't intercept actual anchor clicks (let them navigate normally)
    if (e.target.closest('a')) return;

    const href = card.getAttribute('data-href');
    if (!href) return;

    // Ctrl / Cmd / middle-click → open in new tab
    if (e.ctrlKey || e.metaKey || e.button === 1) {
      window.open(href, '_blank');
    } else {
      window.location.href = href;
    }
  });

  // Middle-click
  card.addEventListener('mousedown', function(e) {
    if (e.button === 1) {
      e.preventDefault();
      const href = card.getAttribute('data-href');
      if (href) window.open(href, '_blank');
    }
  });
});


/* ─────────────────────────────────────────────
   6. LIGHTBOX
   
   Works for:
   • Project page gallery images  (.gal-item with .gal-img)
   • Photography corkboard         (.pin-photo with .cork-img)
   
   All elements with class .gal-item are collected.
   Click any to open, arrow keys / buttons to navigate.
───────────────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');

if (lightbox && lbImg) {
  const galleryItems = Array.from(document.querySelectorAll('.gal-item'));
  let currentIndex = 0;

  function openLightbox(index) {
    const item = galleryItems[index];
    // Support both regular gallery images and cork-board polaroid images
    const img = item.querySelector('.gal-img, .cork-img');
    if (!img || img.style.display === 'none') return;

    currentIndex = index;
    lbImg.src = img.src;
    lbImg.alt = img.alt;

    const caption = item.querySelector('.gal-caption, figcaption');
    lbCaption.textContent = caption ? caption.textContent : (img.alt || '');

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showPrev() {
    // Find previous item that has a visible image
    let idx = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(idx);
  }
  function showNext() {
    let idx = (currentIndex + 1) % galleryItems.length;
    openLightbox(idx);
  }

  galleryItems.forEach(function(item, i) {
    item.addEventListener('click', function(e) {
      // Prevent card-click handler from firing when inside a clickable card
      e.stopPropagation();
      openLightbox(i);
    });
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', showPrev);
  if (lbNext)  lbNext.addEventListener('click', showNext);

  lightbox.addEventListener('click', function(e) { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape')     closeLightbox();
  });
}


/* ─── Dev Easter Egg ─── */
console.log('%c✦ Pradyota Phaneesh — Engineering Portfolio', 'font-family:Georgia,serif;font-size:14px;color:#0050D8;font-style:italic;');
console.log('%c  B.S. Mechanical Engineering · UT Austin · GPA 3.93', 'font-family:monospace;font-size:11px;color:#888;');
