/* Tafsila hero book: drag the cover with a finger or mouse to open and close it.
   Works on top of the existing React markup (.hstage > .fold > .fbase + .fcv). */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setup(fold) {
    if (fold.__book) return; fold.__book = 1;
    var stage = fold.closest('.hstage'), cover = fold.querySelector('.fcv');
    var ctl = stage && stage.querySelector('.fold-ctl button');
    if (!stage || !cover || !ctl) return;

    /* extras: hint, sparkles, ribbon */
    var hint = document.createElement('div');
    hint.className = 'bhint';
    hint.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7l-2.3-3.6a1.6 1.6 0 0 1 2.6-1.9L9 14"/></svg><span>اسحب الغلاف لتفتح الكرت</span>';
    stage.appendChild(hint);
    var sp = document.createElement('div'); sp.className = 'bsparks'; sp.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('i');
      var a = (-160 + Math.random() * 140) * Math.PI / 180, d = 60 + Math.random() * 110;
      s.style.setProperty('--tx', (Math.cos(a) * d).toFixed(0) + 'px');
      s.style.setProperty('--ty', (Math.sin(a) * d).toFixed(0) + 'px');
      s.style.setProperty('--dl', (Math.random() * .25).toFixed(2) + 's');
      s.style.setProperty('--sz', (4 + Math.random() * 5).toFixed(1) + 'px');
      sp.appendChild(s);
    }
    stage.appendChild(sp);
    var rib = document.createElement('span'); rib.className = 'bribbon'; rib.setAttribute('aria-hidden', 'true');
    fold.querySelector('.fbase').appendChild(rib);

    function isOpen() { return fold.classList.contains('open'); }
    function syncHint() { stage.classList.toggle('is-open', isOpen()); }
    var lastOpen = isOpen();
    new MutationObserver(function () {
      var o = isOpen(); syncHint();
      if (o && !lastOpen && !reduce) { stage.classList.remove('burst'); void stage.offsetWidth; stage.classList.add('burst'); setTimeout(function () { stage.classList.remove('burst'); }, 1600); }
      lastOpen = o;
    }).observe(fold, { attributes: true, attributeFilter: ['class'] });
    syncHint();

    /* drag */
    var drag = null, suppress = false;
    function pw() { return fold.getBoundingClientRect().width / (isOpen() ? 1.9 : 1) || 250; }
    function apply(p) {
      fold.style.setProperty('--p', p.toFixed(3));
      fold.style.transform = 'rotateX(' + (5 - 3 * p) + 'deg) rotateY(' + (-16 + 16 * p) + 'deg) translateX(' + (-.5 * drag.w * p) + 'px)';
      cover.style.transform = 'rotateY(' + (178 * p) + 'deg)';
    }
    fold.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), p0: isOpen() ? 1 : 0, p: isOpen() ? 1 : 0, on: false, w: parseFloat(getComputedStyle(stage).getPropertyValue('--pw')) || fold.offsetWidth, id: e.pointerId, vx: 0, lx: e.clientX, lt: performance.now() };
    });
    fold.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.on) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) { if (Math.abs(dy) > 12) drag = null; return; }
        drag.on = true; fold.classList.add('dragging'); stage.classList.add('touched');
        try { fold.setPointerCapture(e.pointerId); } catch (_) {}
      }
      var now = performance.now();
      drag.vx = (e.clientX - drag.lx) / Math.max(1, now - drag.lt); drag.lx = e.clientX; drag.lt = now;
      drag.p = Math.max(0, Math.min(1, drag.p0 + dx / (drag.w * 1.25)));
      apply(drag.p);
      e.preventDefault();
    });
    function end() {
      if (!drag) return;
      var d = drag; drag = null;
      if (!d.on) return;
      suppress = true;
      var target = Math.abs(d.vx) > .45 ? d.vx > 0 : d.p > .5;
      fold.classList.remove('dragging');
      if (target !== isOpen()) ctl.click();
      requestAnimationFrame(function () {
        fold.style.transform = ''; cover.style.transform = ''; fold.style.removeProperty('--p');
      });
    }
    fold.addEventListener('pointerup', end);
    fold.addEventListener('pointercancel', end);
    /* taps still toggle; a finished drag must not also count as a tap */
    fold.addEventListener('click', function (e) {
      e.stopPropagation();
      if (suppress) { suppress = false; return; }
      stage.classList.add('touched');
      ctl.click();
    }, true);
  }

  function scan() { var f = document.querySelector('.hstage .fold'); if (f) setup(f); }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
