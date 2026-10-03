(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobilmeny */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Stäng menyn' : 'Öppna menyn');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!header.classList.contains('nav-open'));
    });
    document.querySelectorAll('.mobile-nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* Parallax i hero (endast scroll, ingen muspekare) */
  var hero = document.querySelector('.hero');
  var blobs = document.querySelector('[data-parallax=blobs]');
  var photo = document.querySelector('.hero-photo-img');
  var photoBox = document.querySelector('.hero-photo');
  var ticking = false;
  function updateParallax() {
    ticking = false;
    if (!hero) return;
    var y = window.pageYOffset || 0;
    if (y > hero.offsetHeight + 200) return;
    if (blobs) blobs.style.transform = 'translate3d(0,' + Math.round(y * 0.22) + 'px,0)';
    if (photo && photoBox) {
      var max = photoBox.offsetHeight * 0.07;
      var shift = Math.min(y * 0.08, max);
      photo.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    }
  }
  if (!reduce && hero) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(updateParallax); }
    }, { passive: true });
    updateParallax();
  }

  /* Fade-in vid scroll för egna element */
  var fx = document.querySelectorAll('.fx');
  if ('IntersectionObserver' in window && fx.length) {
    root.classList.add('js-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fx.forEach(function (el) { io.observe(el); });
  }

  /* Öppet nu-markör (Stockholmstid, utifrån salongens verifierade öppettider) */
  try {
    var H = { 1: [10, 18], 2: [10, 18], 3: [10, 18], 4: [10, 19], 5: [10, 17] };
    var names = ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'];
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Europe/Stockholm', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var d = map[o.weekday];
    var m = (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10);
    var t = H[d];
    var text, open = false;
    if (t && m >= t[0] * 60 && m < t[1] * 60) {
      open = true;
      text = 'Öppet nu · stänger kl ' + t[1] + ':00';
    } else if (t && m < t[0] * 60) {
      text = 'Stängt just nu · öppnar idag kl ' + t[0] + ':00';
    } else {
      for (var i = 1; i <= 7; i++) {
        var nd = (d + i) % 7;
        if (H[nd]) {
          text = 'Stängt just nu · öppnar ' + (i === 1 ? 'imorgon' : names[nd]) + ' kl ' + H[nd][0] + ':00';
          break;
        }
      }
    }
    var box = document.getElementById('openStatus');
    if (box && text) {
      box.querySelector('.open-status-text').textContent = text;
      box.classList.toggle('is-open', open);
      box.hidden = false;
    }
  } catch (e) { /* ignorera */ }

  /* Årtal i sidfot */
  var yr = document.querySelector('.year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
