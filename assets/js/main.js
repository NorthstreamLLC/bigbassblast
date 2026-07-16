// Mobile navigation toggle — progressive enhancement, no dependencies.
(function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    links.classList.remove('is-open');
  }
  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    links.classList.add('is-open');
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) { closeMenu(); } else { openMenu(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });

  document.addEventListener('click', function (e) {
    if (!links.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1160) closeMenu();
  });
})();

// Nav "Guides" dropdown — click to toggle, closes on outside click / Escape.
(function () {
  var toggles = document.querySelectorAll('.nav-dropdown-toggle');
  if (!toggles.length) return;

  function closeAll() {
    document.querySelectorAll('.nav-dropdown-toggle').forEach(function (b) {
      b.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.nav-dropdown-panel').forEach(function (p) {
      p.classList.remove('is-open');
    });
  }

  toggles.forEach(function (btn) {
    var panel = btn.nextElementSibling;
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
      }
    });
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();

// Scroll reveal + animated counters + animated score bars.
// Progressive enhancement: elements are fully visible by default; classes/animation
// are only applied here, so nothing breaks if JS fails to load or run.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el) {
    var text = el.textContent.trim();
    var match = text.match(/^([^0-9]*)([0-9][0-9,.]*)(.*)$/);
    if (!match) return;
    var prefix = match[1], numStr = match[2], suffix = match[3];
    var decimals = (numStr.split('.')[1] || '').length;
    var target = parseFloat(numStr.replace(/,/g, ''));
    if (isNaN(target) || target <= 0) return;
    var duration = 900;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var current = target * eased;
      var display = decimals ? current.toFixed(decimals) : String(Math.round(current));
      if (numStr.indexOf(',') !== -1) {
        display = Number(display).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
      }
      el.textContent = prefix + display + suffix;
      if (p < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = prefix + numStr + suffix;
      }
    }
    requestAnimationFrame(frame);
  }

  function animateBar(el) {
    var target = el.style.width;
    if (!target) return;
    el.style.width = '0%';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.style.width = target;
      });
    });
  }

  if (!('IntersectionObserver' in window)) return;

  // Reveal: cards, tiles, and repeating components fade/slide up into view.
  var revealSelector = '.card, .blog-card, .casino-card, .vs-card, .faq-item, .step-card, .rewards-block, .promo-banner, .verdict-box, .rating-box, .highlight-stat';
  var revealEls = document.querySelectorAll(revealSelector);
  if (revealEls.length && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (Math.min(i % 6, 5) * 55) + 'ms';
      revealObserver.observe(el);
    });
  }

  // Counters: hero/section stat numbers count up once when they enter view.
  var counterEls = document.querySelectorAll('.stat-value, .highlight-stat .v, .rating-score');
  if (counterEls.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (reduceMotion) {
            // leave text as-is
          } else {
            animateCount(entry.target);
          }
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counterEls.forEach(function (el) { counterObserver.observe(el); });
  }

  // Score bars (review page): animate width from 0 to target on reveal.
  var barEls = document.querySelectorAll('.score-fill');
  if (barEls.length && !reduceMotion) {
    var barObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateBar(entry.target);
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    barEls.forEach(function (el) { barObserver.observe(el); });
  }
})();
