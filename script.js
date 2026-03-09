/* ════════════════════════════════════════════════
   PRADYOTA PHANEESH — PORTFOLIO JAVASCRIPT v3
   
   Handles:
   1. Navbar scroll background
   2. Scroll-reveal animations
   3. Mobile hamburger menu
   4. Active nav link highlight
   5. Image lightbox (for project pages)
════════════════════════════════════════════════ */


/* ─────────────────────────────────────────────
   1. NAVBAR: add background when scrolled
───────────────────────────────────────────── */
const navbar = document.getElementById('navbar');

function handleNavScroll() {
  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll(); // run once on load


/* ─────────────────────────────────────────────
   2. SCROLL REVEAL
   Elements with class "reveal" fade in when
   they enter the visible screen area.
───────────────────────────────────────────── */
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
  { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
);

revealEls.forEach(function(el) { revealObserver.observe(el); });


/* ─────────────────────────────────────────────
   3. MOBILE HAMBURGER MENU
───────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileLinks = document.querySelectorAll('.mobile-link');

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
mobileLinks.forEach(function(link) { link.addEventListener('click', closeMenu); });

document.addEventListener('click', function(e) {
  if (menuOpen && !hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    closeMenu();
  }
});

window.addEventListener('resize', function() {
  if (window.innerWidth > 900 && menuOpen) closeMenu();
});


/* ─────────────────────────────────────────────
   4. ACTIVE NAV LINK
   Highlights the nav link for the section
   currently visible on screen.
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
   5. LIGHTBOX
   Opens when a gallery image (.gal-item) is clicked.
   Supports previous/next navigation between images.
───────────────────────────────────────────── */
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');

// Only run lightbox code if these elements exist
if (lightbox && lbImg) {

  // Collect all gallery images on the page
  const galleryItems = Array.from(document.querySelectorAll('.gal-item'));
  let currentIndex = 0;

  function openLightbox(index) {
    const item = galleryItems[index];
    const img  = item.querySelector('.gal-img');
    if (!img) return;

    currentIndex = index;
    lbImg.src = img.src;
    lbImg.alt = img.alt;

    // Get caption from the <figcaption> or alt text
    const caption = item.querySelector('.gal-caption');
    lbCaption.textContent = caption ? caption.textContent : img.alt;

    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden'; // prevent page scrolling
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentIndex);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    openLightbox(currentIndex);
  }

  // Click on a gallery item → open lightbox
  galleryItems.forEach(function(item, i) {
    item.addEventListener('click', function() { openLightbox(i); });
    item.setAttribute('tabindex', '0'); // keyboard accessible
    item.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i); }
    });
  });

  // Close, prev, next buttons
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', showPrev);
  if (lbNext)  lbNext.addEventListener('click', showNext);

  // Click outside image to close
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'Escape')     closeLightbox();
  });
}


/* ─────────────────────────────────────────────
   DEV EASTER EGG — Open browser console (F12)
───────────────────────────────────────────── */
console.log(
  '%c✦ Pradyota Phaneesh — Engineering Portfolio',
  'font-family: Georgia, serif; font-size:14px; color:#0050D8; font-style:italic;'
);
console.log(
  '%c  B.S. Mechanical Engineering · UT Austin · GPA 3.93',
  'font-family: monospace; font-size:11px; color:#888;'
);
