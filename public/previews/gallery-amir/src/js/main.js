/* ==========================================================================
   گالری امیر — اسکریپت اصلی
   بدون هیچ کتابخانه خارجی.
   ========================================================================== */
(function () {
  'use strict';

  var FA = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  function toFa(n) {
    return String(n).replace(/\d/g, function (d) { return FA[+d]; });
  }
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1) ناوبری موبایل
     ------------------------------------------------------------------ */
  var burger = $('#burger');
  var mobile = $('#mobile');

  function closeMenu() {
    if (!mobile || !burger) return;
    mobile.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  if (burger && mobile) {
    burger.addEventListener('click', function () {
      var open = mobile.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $$('#mobile a, #mobile button').forEach(function (el) {
      el.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     2) هدر چسبان + نوار پیشرفت + هایلایت منو
     ------------------------------------------------------------------ */
  var hdr = $('#hdr');
  var prog = $('#prog');
  var navLinks = $$('.nav a');
  var pages = $$('.page');

  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('stuck', y > 24);

    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

    if (!pages.length) return;
    var mark = y + window.innerHeight * 0.32;
    var current = pages[0].id.replace('page-', '');
    pages.forEach(function (p) {
      if (p.offsetTop <= mark) current = p.id.replace('page-', '');
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('on', a.dataset.nav === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ------------------------------------------------------------------
     3) مسیریابی با hash — دکمه back/forward مرورگر کار می‌کند
     ------------------------------------------------------------------ */
  var VALID = ['home', 'portfolio', 'about', 'services', 'contact'];

  function render(id, skipScroll) {
    if (VALID.indexOf(id) === -1) id = 'home';
    pages.forEach(function (p) {
      p.classList.toggle('active', p.id === 'page-' + id);
    });
    navLinks.forEach(function (a) {
      a.classList.toggle('on', a.dataset.nav === id);
    });
    if (!skipScroll) {
      var el = document.getElementById('page-' + id);
      if (el) {
        var top = id === 'home' ? 0 : Math.max(el.offsetTop - 64, 0);
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    observeReveals();
  }

  function routeFromHash() {
    var id = (location.hash || '').replace(/^#/, '').split('?')[0];
    render(id || 'home', false);
  }

  window.addEventListener('hashchange', routeFromHash);

  // لینک‌های داخلی
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (VALID.indexOf(id) === -1) return;
      e.preventDefault();
      closeMenu();
      if (id === 'home') {
        history.pushState(null, '', location.pathname + location.search);
        render('home', false);
      } else {
        history.pushState(null, '', '#' + id);
        render(id, false);
      }
    });
  });

  // دکمه‌های data-goto
  $$('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.dataset.goto;
      closeMenu();
      history.pushState(null, '', '#' + id);
      render(id, false);
    });
  });

  window.addEventListener('popstate', function () { routeFromHash(); });

  /* ------------------------------------------------------------------
     4) فیلتر گالری
     ------------------------------------------------------------------ */
  var filterBtns = $$('.filters button');
  var shots = $$('.shot');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('on'); });
      btn.classList.add('on');
      var f = btn.dataset.filter || 'all';
      var shown = 0;
      shots.forEach(function (s) {
        var cats = (s.dataset.cat || '').split(' ');
        var match = f === 'all' || cats.indexOf(f) !== -1;
        s.classList.toggle('hide', !match);
        if (match) shown++;
      });
      var counter = $('#shotCount');
      if (counter) counter.textContent = toFa(shown);
    });
  });

  /* ------------------------------------------------------------------
     5) لایت‌باکس
     ------------------------------------------------------------------ */
  var lb = $('#lb');
  var lbImg = $('#lbImg');
  var lbTitle = $('#lbTitle');
  var lbCat = $('#lbCat');
  var lastFocus = null;

  function openLb(shot) {
    if (!lb) return;
    var img = shot.querySelector('img');
    if (!img) return;
    lastFocus = document.activeElement;
    lbImg.src = img.getAttribute('data-full') || img.src;
    lbImg.alt = img.alt || '';
    lbTitle.textContent = shot.dataset.title || '';
    lbCat.textContent = shot.dataset.catlabel || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    lb.focus();
  }

  function closeLb() {
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  shots.forEach(function (s) {
    s.setAttribute('tabindex', '0');
    s.setAttribute('role', 'button');
    s.addEventListener('click', function () { openLb(s); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(s); }
    });
  });

  if (lb) {
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb-x')) closeLb();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb && lb.classList.contains('open')) closeLb();
  });

  /* ------------------------------------------------------------------
     6) انیمیشن ظاهرشدن + شمارنده + نوار مهارت
     ------------------------------------------------------------------ */
  var revealObserver = null;
  var pending = [];

  function observeReveals() {
    pending = $$('.rv:not(.in)');
    if (!pending.length) return;

    if (!('IntersectionObserver' in window) || reduce) {
      pending.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            revealObserver.unobserve(en.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    }
    pending.forEach(function (el) { revealObserver.observe(el); });
  }

  function countUp(el) {
    var target = parseInt(el.dataset.num, 10) || 0;
    var suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = toFa(target) + suffix; return; }
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = toFa(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var nums = $$('[data-num]');
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      var nio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { countUp(en.target); nio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      nums.forEach(function (el) { nio.observe(el); });
    } else {
      nums.forEach(countUp);
    }
  }

  var bars = $$('.bar i');
  if (bars.length) {
    var fill = function (el) { el.style.width = (el.dataset.w || 0) + '%'; };
    if ('IntersectionObserver' in window && !reduce) {
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { fill(en.target); bio.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      bars.forEach(function (el) { bio.observe(el); });
    } else {
      bars.forEach(fill);
    }
  }

  /* ------------------------------------------------------------------
     7) فرم تماس (فقط سمت کلاینت)
     ------------------------------------------------------------------ */
  var form = $('#form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var btn = form.querySelector('button[type="submit"]');
      var html = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'در حال ارسال…';
      setTimeout(function () {
        btn.textContent = 'ارسال شد ✓';
        form.reset();
        setTimeout(function () { btn.disabled = false; btn.innerHTML = html; }, 2600);
      }, 900);
    });
  }

  /* ------------------------------------------------------------------
     8) راه‌اندازی
     ------------------------------------------------------------------ */
  onScroll();
  routeFromHash();
  observeReveals();
})();
