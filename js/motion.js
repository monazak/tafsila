/* =====================================================================
   تفصيلة · motion layer
   Smooth scrolling, word-by-word headings, stitched ornaments, the
   category card growing out of its tile, the scroll-driven "how we work",
   a gently tilting 3D book, depth parallax, a soft cursor and a stitched
   "sent" confirmation. Everything here respects reduced-motion.
   ===================================================================== */
(function () {
  var GS = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/';
  var LENIS = 'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  function load(src) {
    return new Promise(function (ok, bad) {
      var s = document.querySelector('script[src="' + src + '"]');
      if (s) { if (s.__done) return ok(); s.addEventListener('load', ok); s.addEventListener('error', bad); return; }
      s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = function () { s.__done = 1; ok(); }; s.onerror = bad; document.head.appendChild(s);
    });
  }
  function whenGsap() {
    return new Promise(function (ok) {
      (function wait() { if (window.gsap && window.ScrollTrigger) ok(); else setTimeout(wait, 60); })();
      setTimeout(function () { if (!window.gsap) load(GS + 'gsap.min.js').then(function () { return load(GS + 'ScrollTrigger.min.js'); }); }, 2500);
    });
  }
  function whenReady(sel) {
    return new Promise(function (ok) { (function wait() { if (document.querySelector(sel)) ok(); else setTimeout(wait, 80); })(); });
  }

  if (reduce) { document.documentElement.classList.add('mo-reduce'); return; }

  Promise.all([whenGsap(), whenReady('#faq .fql'), whenReady('#how .hw4')]).then(function () {
    return Promise.all(['SplitText', 'DrawSVGPlugin', 'Flip'].map(function (p) { return load(GS + p + '.min.js'); }));
  }).then(function () {
    gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip);
    document.documentElement.classList.add('mo-on');
    smoothScroll();
    headings();
    categoryGrow();
    parallax();
    if (finePointer) bookTilt();
    sentToast();
    setTimeout(function () { ScrollTrigger.refresh(); }, 600);
    // the page grows as images and the designs grid settle: keep every scroll trigger measured against the real layout
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(function () { ScrollTrigger.refresh(); }, 250); }).observe(document.body);
  }).catch(function () { /* motion is an extra: the page works without it */ });

  /* 1. smooth scrolling with soft inertia (desktop; phones keep their own native scrolling) */
  var lenis = null;
  function smoothScroll() {
    if (!finePointer) return;
    load(LENIS).then(function () {
      if (!window.Lenis) return;
      lenis = new Lenis({ lerp: .14, wheelMultiplier: 1, anchors: { offset: -80 }, prevent: function (n) { return !!(n.closest && n.closest('dialog, [data-lenis-prevent], .ph-scr')); } });
      document.documentElement.classList.add('lenis');
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      // pause page scrolling while a dialog is open
      new MutationObserver(function () { var open = !!document.querySelector('dialog[open]'); open ? lenis.stop() : lenis.start(); })
        .observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
      // in-page links glide too
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
        var t = document.querySelector(a.getAttribute('href')); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -80, duration: 1.3 });
      }, true);
      window.__lenis = lenis;
    }).catch(function () { });
  }

  /* 2. section titles arrive word by word, rising out of a mask (Arabic is split by words, never letters) */
  function headings() {
    var els = gsap.utils.toArray('.sh h2, #faq .faq-side h2, #contact .cta h2, .pk1-r h3');
    els.forEach(function (h) {
      if (h.__split) return; h.__split = 1;
      var split = SplitText.create(h, { type: 'words', mask: 'words', wordsClass: 'mo-w' });
      gsap.from(split.words, {
        yPercent: 110, opacity: 0, duration: 1.05, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true }
      });
    });
  }

  /* 3. a stitched seam under every section title, sewn in as it comes into view */
  function stitches() {
    var path = 'M4 14 C 40 4, 70 24, 110 14 S 180 4, 220 14';
    gsap.utils.toArray('.sh, #faq .faq-side').forEach(function (sh, i) {
      if (sh.querySelector('.mo-seam')) return;
      var id = 'seam' + i;
      sh.insertAdjacentHTML('beforeend',
        '<svg class="mo-seam" viewBox="0 0 224 28" aria-hidden="true"><defs><mask id="' + id + '" maskUnits="userSpaceOnUse">' +
        '<path class="mo-draw" d="' + path + '" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/></mask></defs>' +
        '<path d="' + path + '" mask="url(#' + id + ')" class="mo-thread"/>' +
        '<g mask="url(#' + id + ')" class="mo-knots"><path d="M108 8l6 6-6 6-6-6z"/></g></svg>');
      var draw = sh.querySelector('.mo-draw');
      gsap.fromTo(draw, { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.6, ease: 'power2.inOut', scrollTrigger: { trigger: sh, start: 'top 85%', once: true } });
    });
  }

  /* 4. opening a category: the showcase card grows out of the tile that was tapped */
  function categoryGrow() {
    var last = null;
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('#designs .ctile'); if (!t) return;
      var r = t.getBoundingClientRect(); last = { x: r.left, y: r.top + scrollY, w: r.width, h: r.height, at: Date.now() };
      var tries = 0;
      (function wait() {
        var dc = document.querySelector('#designs .grid .dc');
        if (!dc) { if (tries++ < 40) requestAnimationFrame(wait); return; }
        requestAnimationFrame(function () {
          var n = dc.getBoundingClientRect(), z = parseFloat(dc.style.zoom) || 1;
          if (!n.width) return;
          gsap.fromTo(dc, {
            x: (last.x - n.left) / z, y: (last.y - (n.top + scrollY)) / z,
            scaleX: last.w / n.width, scaleY: last.h / n.height, transformOrigin: '0 0', opacity: .6
          }, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: .85, ease: 'expo.out', clearProps: 'transform,opacity' });
          var bits = dc.querySelectorAll('.ac > *, .chips, .dot, .sw');
          if (bits.length) gsap.from(bits, { y: 14, opacity: 0, duration: .6, ease: 'power3.out', stagger: .05, delay: .3, clearProps: 'all' });
        });
      })();
    }, true);
  }

  /* 5. "how we work": on desktop the section stays in place while scrolling walks through the four steps */
  function howPinned() {
    var mm = gsap.matchMedia();
    mm.add('(min-width: 821px) and (min-height: 640px)', function () {
      var sec = document.getElementById('how'), x = sec && sec.querySelector('.hw4'); if (!x || !x.__go) return;
      var steps = x.querySelectorAll('.hw4-s').length, cur = -1;
      x.__pin = true;
      var st = ScrollTrigger.create({
        trigger: sec, start: 'top top', end: '+=' + Math.round(innerHeight * .55 * (steps - 1)), pin: true, pinSpacing: true, anticipatePin: 1,
        onUpdate: function (s) { var i = Math.min(steps - 1, Math.floor(s.progress * steps * .999)); if (i !== cur) { cur = i; x.__go(i, true); } },
        onLeave: function () { x.__pin = false; }, onEnterBack: function () { x.__pin = true; }, onLeaveBack: function () { x.__pin = false; }
      });
      return function () { x.__pin = false; st.kill(); };
    });
  }

  /* 6. depth: olive trees and roses drift at different speeds as the hero scrolls away */
  function parallax() {
    var hero = document.querySelector('.hero'); if (!hero) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } });
    tl.to(hero, { '--py-far': '-40px', '--py-near': '-110px', '--py-book': '-30px', ease: 'none' }, 0);
  }

  /* 7. the hero book turns gently toward the pointer, like an object you could pick up */
  function bookTilt() {
    var st = document.querySelector('.hero .hstage'); if (!st) return;
    var qx = gsap.quickTo(st, '--tilt-x', { duration: .9, ease: 'power3.out' });
    var qy = gsap.quickTo(st, '--tilt-y', { duration: .9, ease: 'power3.out' });
    var hero = document.querySelector('.hero');
    hero.addEventListener('pointermove', function (e) {
      var r = st.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / (innerWidth / 2), dy = (e.clientY - (r.top + r.height / 2)) / (innerHeight / 2);
      qx(Math.max(-1, Math.min(1, dx)) * 7); qy(Math.max(-1, Math.min(1, dy)) * -5);
    });
    hero.addEventListener('pointerleave', function () { qx(0); qy(0); });
  }

  /* 8. a soft red ring that follows the pointer and opens up over things you can press */
  function cursor() {
    var c = document.createElement('div'); c.className = 'mo-cur'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
    var mx = gsap.quickTo(c, 'x', { duration: .35, ease: 'power3.out' }), my = gsap.quickTo(c, 'y', { duration: .35, ease: 'power3.out' });
    addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      c.classList.add('on'); mx(e.clientX); my(e.clientY);
      var hot = e.target.closest && e.target.closest('a, button, [role="button"], .ctile, .fql-in, .pk1-l, summary, input, textarea, select, label');
      c.classList.toggle('hot', !!hot);
    }, { passive: true });
    document.addEventListener('pointerleave', function () { c.classList.remove('on'); });
    addEventListener('pointerdown', function () { c.classList.add('down'); });
    addEventListener('pointerup', function () { c.classList.remove('down'); });
  }

  /* 9. after the order goes to WhatsApp: a check mark stitched in red, then a thank-you */
  function sentToast() {
    document.addEventListener('tf:sent', function () {
      var t = document.createElement('div'); t.className = 'mo-toast'; t.setAttribute('role', 'status');
      t.innerHTML = '<svg viewBox="0 0 52 52" aria-hidden="true"><circle class="mo-tc" cx="26" cy="26" r="23"/><path class="mo-tk" d="M15 27l7 7 15-16"/></svg>' +
        '<div><b>وصل طلبكم على واتساب</b><small>بنرد عليكم بأقرب وقت 🌿</small></div>';
      document.body.appendChild(t);
      var tl = gsap.timeline({ onComplete: function () { t.remove(); } });
      tl.fromTo(t, { y: 40, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: .6, ease: 'back.out(1.6)' })
        .fromTo(t.querySelector('.mo-tc'), { drawSVG: '0%' }, { drawSVG: '100%', duration: .7, ease: 'power2.inOut' }, '-=.2')
        .fromTo(t.querySelector('.mo-tk'), { drawSVG: '0%' }, { drawSVG: '100%', duration: .45, ease: 'power2.out' }, '-=.1')
        .to(t, { y: 30, opacity: 0, duration: .5, ease: 'power2.in', delay: 2.6 });
    });
  }
})();
