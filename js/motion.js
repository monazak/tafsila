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
      // no clipping box (it cut the calligraphy's swashes and dots); once the words have arrived the
      // heading goes back to its original, unsplit text so every letter renders exactly as designed
      var split = SplitText.create(h, { type: 'words', wordsClass: 'mo-w' });
      gsap.from(split.words, {
        y: 26, opacity: 0, filter: 'blur(6px)', duration: 1, ease: 'power3.out', stagger: .09,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true },
        onComplete: function () { split.revert(); }
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
          gsap.fromTo(dc, { opacity: 0, y: 18, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8, ease: 'power2.out', clearProps: 'transform,opacity,filter' });
          var bits = dc.querySelectorAll('.ac > *, .chips, .dot, .sw');
          if (bits.length) gsap.from(bits, { y: 8, opacity: 0, duration: .7, ease: 'power2.out', stagger: .05, delay: .25, clearProps: 'all' });
        });
      })();
    }, true);
  }

  /* 4b. switching category or colour: nothing moves; only the titles write themselves in, letter by letter */
  function typeIn(el) {
    if (!el) return; var full = el.dataset.full && el.__typing ? el.dataset.full : el.textContent; el.dataset.full = full;
    clearInterval(el.__typing); var ch = Array.from(full), i = 0; el.textContent = '';
    el.__typing = setInterval(function () { i++; el.textContent = ch.slice(0, i).join(''); if (i >= ch.length) { clearInterval(el.__typing); el.__typing = 0; } }, 55);
  }
  document.addEventListener('click', function (e) {
    var tab = e.target.closest && e.target.closest('#designs .tabs button'), sw = e.target.closest && e.target.closest('#designs .grid button.sw');
    if (!tab && !sw) return;
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var dc = document.querySelector('#designs .grid .dc.sel');
      if (tab) typeIn(document.querySelector('#designs .cathead h3'));
      if (dc) typeIn(dc.querySelector('.in > h3'));
    }); });
  }, true);

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


  /* 7b. the contact chat window leans toward the pointer, like a phone held in the hand */
  function chatTilt() {
    var sec = document.getElementById('contact'); if (!sec) return;
    sec.addEventListener('pointermove', function (e) {
      var w = sec.querySelector('.ct-wa'); if (!w) return;
      var r = w.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      w.style.setProperty('--ry', (-12 + dx * 14).toFixed(2) + 'deg'); w.style.setProperty('--rx', (5 - dy * 10).toFixed(2) + 'deg');
    });
    sec.addEventListener('pointerleave', function () { var w = sec.querySelector('.ct-wa'); if (w) { w.style.removeProperty('--ry'); w.style.removeProperty('--rx'); } });
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


  /* 10. one olive vine that grows down the whole page as you scroll: leaves and olives sprout as the
         stem reaches them, and a small rose opens where each section begins — every section on one branch */
  function vine() {
    var main = document.querySelector('main'), hero = document.querySelector('.hero'); if (!main || !hero) return;
    var wrap = document.createElement('div'); wrap.className = 'mo-vine'; wrap.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wrap);
    var st = null, leaves = [];
    var NS = 'http://www.w3.org/2000/svg';
    function build() {
      if (st) { st.kill(); st = null; }
      var top0 = hero.offsetTop + hero.offsetHeight * .82, H = main.offsetTop + main.offsetHeight - 40, small = innerWidth < 821;
      var W = small ? 46 : 96, cx = small ? 16 : 40, amp = small ? 9 : 20, step = small ? 120 : 150;
      wrap.style.top = top0 + 'px'; wrap.style.height = (H - top0) + 'px'; wrap.style.width = W + 'px';
      var len = H - top0, pts = [];
      for (var y = 0; y <= len; y += step) pts.push([cx + Math.sin(y / 260) * amp + Math.sin(y / 97) * amp * .35, y]);
      var d = 'M' + pts[0][0].toFixed(1) + ' 0';
      for (var i = 1; i < pts.length; i++) { var a = pts[i - 1], b = pts[i]; d += ' C' + a[0].toFixed(1) + ' ' + (a[1] + step * .5).toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + (b[1] - step * .5).toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); }
      var svg = '<svg viewBox="0 0 ' + W + ' ' + len + '" width="' + W + '" height="' + len + '"><path class="mo-stem" d="' + d + '"/>';
      var secs = ['designs', 'packages', 'how', 'faq', 'contact'].map(function (id) { var e = document.getElementById(id); return e ? e.getBoundingClientRect().top + scrollY - top0 + 70 : -1; });
      leaves = [];
      for (var k = 0; k < pts.length; k++) {
        var p = pts[k], side = k % 2 ? 1 : -1, ang = side * (38 + (k * 17) % 22), sc = small ? .62 : 1;
        svg += '<g class="mo-lf" data-y="' + p[1] + '" transform="translate(' + p[0].toFixed(1) + ' ' + p[1] + ') rotate(' + ang + ') scale(' + sc + ')"><g class="mo-in"><ellipse cx="' + (side * 15) + '" cy="0" rx="15" ry="5.5"/>' +
          (k % 3 === 0 ? '<circle class="mo-ol" cx="' + (side * -5) + '" cy="5" r="3.2"/>' : '') + '</g></g>';
      }
      secs.forEach(function (y) {
        if (y < 0 || y > len) return;
        var x = cx + Math.sin(y / 260) * amp + Math.sin(y / 97) * amp * .35, sc = small ? .6 : 1;
        svg += '<g class="mo-lf mo-rose" data-y="' + y + '" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc + ')"><g class="mo-in">' +
          [0, 72, 144, 216, 288].map(function (r) { return '<ellipse cx="0" cy="-6" rx="5" ry="7" transform="rotate(' + r + ')"/>'; }).join('') + '<circle class="mo-rc" r="3.6"/></g></g>';
      });
      wrap.innerHTML = svg + '</svg>';
      var stem = wrap.querySelector('.mo-stem');
      leaves = [].slice.call(wrap.querySelectorAll('.mo-lf')).map(function (g) { return { g: g, y: +g.dataset.y }; });
      gsap.set(stem, { drawSVG: '0%' });
      st = ScrollTrigger.create({
        trigger: wrap, start: 'top 75%', end: 'bottom 70%', scrub: .6,
        onUpdate: function (s) {
          gsap.set(stem, { drawSVG: (s.progress * 100).toFixed(2) + '%' });
          var reach = s.progress * len;
          for (var i = 0; i < leaves.length; i++) leaves[i].g.classList.toggle('on', leaves[i].y < reach);
        }
      });
    }
    build();
    var rt; new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(build, 400); }).observe(main);
  }

  /* 11. a few petals and leaves drift down the whole site; scrolling lifts and tilts them with your speed */
  function petals() {
    var box = document.createElement('div'); box.className = 'mo-pet'; box.setAttribute('aria-hidden', 'true');
    var n = innerWidth < 821 ? 7 : 12, h = '';
    for (var i = 0; i < n; i++) {
      var kind = ['p', 'b', 'l', 'p', 'w'][i % 5];
      h += '<i class="' + kind + '" style="--x:' + ((i * 37 + 11) % 100) + 'vw;--d:' + (16 + (i * 7) % 12) + 's;--dl:-' + ((i * 5.3) % 20).toFixed(1) + 's;--s:' + (.7 + (i % 4) * .18).toFixed(2) + ';--sw:' + (20 + (i * 13) % 40) + 'px"></i>';
    }
    box.innerHTML = h; document.body.appendChild(box);
    var qy = gsap.quickTo(box, 'y', { duration: .9, ease: 'power3.out' }), qr = gsap.quickTo(box, 'skewY', { duration: .9, ease: 'power3.out' });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) { var v = gsap.utils.clamp(-2500, 2500, s.getVelocity()); qy(-v * .025); qr(v * .0012); } });
  }


  /* 12. the hero collage: the pieces land on the page one by one like paper on a table, drift with the
         pointer at their own depth, and fan apart softly as the page scrolls on */
  function heroCollage() {
    (function wait(n) {
      var col = document.querySelector('.hx-col'); if (!col) { if (n < 60) setTimeout(function () { wait(n + 1); }, 100); return; }
      var hero = document.querySelector('.hero'), bits = [].slice.call(col.querySelectorAll('.hx-p, .hx-o'));
      var txt = [].slice.call(document.querySelectorAll('.hx-k, .hx-l1, .hx-l2, .hx-occ, .hx-s'));
      var tl = gsap.timeline({ delay: .35 });
      tl.from(txt, { opacity: 0, y: 24, duration: .9, ease: 'power3.out', stagger: .1 })
        .from('.hx-sc', { opacity: 0, scale: .9, rotate: -14, duration: 1.1, ease: 'power3.out' }, .45)
        .from(bits, { opacity: 0, y: -60, rotate: function (i) { return (i % 2 ? 12 : -12); }, scale: 1.08, duration: 1, ease: 'power3.out', stagger: .12, clearProps: 'rotate,scale' }, .2);
      var qs = bits.map(function (b) { var d = +b.dataset.d || 1; return { d: d, x: gsap.quickTo(b, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(b, 'y', { duration: 1.2, ease: 'power3.out' }) }; });
      if (finePointer) {
        hero.addEventListener('pointermove', function (e) {
          var dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
          qs.forEach(function (q) { q.x(dx * -10 * q.d); q.y(dy * -8 * q.d); });
        });
        hero.addEventListener('pointerleave', function () { qs.forEach(function (q) { q.x(0); q.y(0); }); });
      }
      gsap.to(bits, { yPercent: function (i) { return -18 - (i % 3) * 14; }, ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } });
      gsap.to('.hx-txt', { yPercent: 12, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } });
    })(0);
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
