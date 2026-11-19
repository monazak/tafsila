/* Tafsila homepage extras on top of the React markup:
   - a design's picture opens its preview
   - the contact card gets a small WhatsApp chat
   - the footer gets plain links */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. design cards: click the picture to preview */
  function previewLink(dc) { return dc.querySelector('a[href*="designs/"]'); }
  document.addEventListener('click', function (e) {
    var pv = e.target.closest && e.target.closest('#designs .dc .pv');
    if (!pv) return;
    var a = previewLink(pv.closest('.dc'));
    if (a) { e.preventDefault(); a.click(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var pv = e.target.closest && e.target.closest('#designs .dc .pv');
    if (!pv) return;
    var a = previewLink(pv.closest('.dc'));
    if (a) { e.preventDefault(); a.click(); }
  });
  function decoratePreviews() {
    document.querySelectorAll('#designs .dc .pv').forEach(function (pv) {
      if (pv.querySelector('.pvgo')) return;
      var dc = pv.closest('.dc'), a = previewLink(dc);
      if (!a) return;
      var name = (dc.querySelector('h3') || {}).textContent || '';
      pv.setAttribute('role', 'link');
      pv.setAttribute('tabindex', '0');
      pv.setAttribute('aria-label', 'معاينة تصميم ' + name);
      var s = document.createElement('span');
      s.className = 'pvgo';
      s.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>اضغطوا للمعاينة';
      pv.appendChild(s);
    });
  }

  /* 2. contact: a short chat that plays once the card is on screen */
  var chatIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('play'); chatIO.unobserve(e.target); } });
  }, { threshold: .35 }) : null;
  function decorateContact() {
    var cta = document.querySelector('#contact .cta');
    var btn = cta && cta.querySelector(':scope > .btn');
    if (!cta || !btn || cta.querySelector('.ct-acts')) return;
    var h2 = cta.querySelector('h2');
    if (h2 && !cta.querySelector('.ct-sprig')) { var sp = document.createElement('span'); sp.className = 'ct-sprig'; sp.setAttribute('aria-hidden', 'true'); h2.parentNode.insertBefore(sp, h2); }
    var acts = document.createElement('div'); acts.className = 'ct-acts';
    btn.parentNode.insertBefore(acts, btn); acts.appendChild(btn);
    acts.insertAdjacentHTML('beforeend', '<a class="ct-alt" href="#designs">تصفّحوا التصاميم</a>');
    var wa = ((window.TF_DATA || {}).wa) || '972566900092';
    try { var d = JSON.parse((document.getElementById('data') || {}).textContent || '{}'); if (d.wa) wa = d.wa; } catch (_) {}
    var pretty = '+' + wa.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/, '$1 $2 $3 $4');
    /* a live WhatsApp conversation that plays (and replays) while the section is on screen */
    var wa2 = document.createElement('div'); wa2.className = 'ct-wa'; wa2.setAttribute('aria-hidden', 'true');
    wa2.innerHTML = '<div class="wa-h"><span class="wa-back">‹</span><i class="wa-av">ت</i><span class="wa-who"><b>تفصيلة</b><small class="wa-st">متصل الآن</small></span>' +
      '<svg viewBox="0 0 20 14"><rect x="1" y="2" width="12" height="10" rx="2.5"/><path d="M13 6l5-3v8l-5-3z"/></svg><svg viewBox="0 0 16 16"><path d="M4 1.5l2.6 3-1.5 2a8 8 0 0 0 4.4 4.4l2-1.5 3 2.6-1.4 2.2c-.3.5-1 .8-1.6.6A13 13 0 0 1 1.2 4.4c-.2-.6.1-1.3.6-1.6z"/></svg></div>' +
      '<div class="wa-b"><span class="wa-day">اليوم</span></div><div class="wa-in"><span>اكتبوا رسالة…</span><i class="wa-mic"><svg viewBox="0 0 12 16"><rect x="3.5" y="1" width="5" height="9" rx="2.5"/><path d="M1.5 7.5a4.5 4.5 0 0 0 9 0M6 12v3"/></svg></i></div>';
    cta.appendChild(wa2);
    var TK = '<svg class="wa-tk" viewBox="0 0 16 10"><path d="M1 5.5l2.6 2.6L9 2.6M6.4 8.1L11.8 2.6"/></svg>';
    var SCRIPT = [
      ['me', 'مرحبا 👋 بدنا دعوة لعرسنا الشهر الجاي', '٩:٤١'],
      ['us', 'أهلاً وسهلاً، وألف مبروك! 🤍 أي تصميم عجبكم؟', '٩:٤١'],
      ['me', 'ورد الجوري، بس باللون الأزرق الفاتح 💙', '٩:٤٢'],
      ['us', 'اختيار حلو! ابعتولنا الأسماء والتاريخ والمكان، وبتوصلكم المعاينة اليوم ✨', '٩:٤٢'],
      ['me', 'تمام، شكراً كتير 🙏', '٩:٤٣']
    ];
    var body = wa2.querySelector('.wa-b'), st = wa2.querySelector('.wa-st'), timers = [], playing = false;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function play() {
      if (playing) return; playing = true; timers.forEach(clearTimeout); timers = [];
      body.querySelectorAll('.wa-m,.wa-typing').forEach(function (n) { n.remove(); });
      var t = 400;
      SCRIPT.forEach(function (m) {
        if (m[0] === 'us') {
          later(function () { st.textContent = 'يكتب…'; var ty = document.createElement('div'); ty.className = 'wa-typing'; ty.innerHTML = '<i></i><i></i><i></i>'; body.appendChild(ty); }, t);
          t += 1600;
        }
        later(function () {
          var ty = body.querySelector('.wa-typing'); if (ty) ty.remove(); st.textContent = 'متصل الآن';
          var el = document.createElement('p'); el.className = 'wa-m ' + m[0];
          el.innerHTML = m[1] + '<time>' + m[2] + (m[0] === 'me' ? ' ' + TK : '') + '</time>';
          body.appendChild(el);
          if (m[0] === 'me') later(function () { el.classList.add('read'); }, 900);
        }, t);
        t += m[0] === 'me' ? 1500 : 1300;
      });
      later(function () { playing = false; if (wa2.__in) play(); }, t + 5000);
    }
    if (reduce || !('IntersectionObserver' in window)) { wa2.__in = true; play(); }
    else new IntersectionObserver(function (es) { es.forEach(function (e) { wa2.__in = e.isIntersecting; if (e.isIntersecting) play(); }); }, { threshold: .3 }).observe(wa2);
  }

  /* 3. footer links */
  function decorateFooter() {
    var f = document.querySelector('footer');
    if (!f || f.querySelector('.flinks')) return;
    var nav = document.createElement('nav');
    nav.className = 'flinks';
    nav.setAttribute('aria-label', 'روابط');
    nav.innerHTML = '<a href="#designs">التصاميم</a><a href="#packages">الباقات</a><a href="#how">كيف نعمل</a><a href="#contact">تواصل</a><a href="privacy.html">سياسة الخصوصية</a>';
    var cp = f.querySelector('.cp');
    f.insertBefore(nav, cp || null);
    if (cp && !cp.dataset.y) { cp.dataset.y = 1; cp.textContent = '© ' + new Date().getFullYear() + ' تفصيلة · ' + cp.textContent; }
  }


  /* 4. ambient motion in the hero and behind the prices */
  function decorateAmbient() {
    var hero = document.querySelector('.hero');
    if (hero && !hero.querySelector('.h-amb')) {
      var a = document.createElement('div'); a.className = 'h-amb'; a.setAttribute('aria-hidden', 'true'); a.innerHTML = '<i></i><i></i><i></i>';
      hero.insertBefore(a, hero.firstChild);
      if (!reduce) {
        var fx = document.createElement('div'); fx.className = 'h-fx'; fx.setAttribute('aria-hidden', 'true');
        for (var i = 0; i < 14; i++) {
          var b = document.createElement('b');
          b.style.left = (4 + Math.random() * 92).toFixed(1) + '%';
          b.style.setProperty('--s', (3 + Math.random() * 5).toFixed(1) + 'px');
          b.style.setProperty('--t', (11 + Math.random() * 10).toFixed(1) + 's');
          b.style.setProperty('--dl', (-Math.random() * 20).toFixed(1) + 's');
          b.style.setProperty('--x', ((Math.random() - .5) * 120).toFixed(0) + 'px');
          fx.appendChild(b);
        }
        hero.insertBefore(fx, a.nextSibling);
      }
    }
    var pk = document.getElementById('packages');
    if (pk && !pk.querySelector('.pk-orbs')) {
      var o = document.createElement('div'); o.className = 'pk-orbs'; o.setAttribute('aria-hidden', 'true'); o.innerHTML = '<i></i><i></i><i></i>';
      pk.insertBefore(o, pk.firstChild);
    }
    document.querySelectorAll('#packages .pc').forEach(function (pc) {
      if (pc.querySelector('.pc-ring')) return;
      ['pc-ring', 'pc-spot', 'pc-shine'].forEach(function (c) { var s = document.createElement('span'); s.className = c; s.setAttribute('aria-hidden', 'true'); pc.insertBefore(s, pc.firstChild); });
    });
  }

  /* 5. pointer tilt for price cards and gallery tiles */
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tiltSel = '#packages .pc, #designs .ctile';
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest(tiltSel);
      if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      var k = el.classList.contains('ctile') ? 5 : el.classList.contains('pk1') ? 4 : 7;
      el.style.setProperty('--ry', ((x - .5) * k).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((.5 - y) * k).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    }, { passive: true });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest && e.target.closest(tiltSel);
      if (el && !el.contains(e.relatedTarget)) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    });
  }

  /* 6. questions people ask (dark glass, after the prices) */
  var FAQ = [
    ['كيف بتوصل الدعوة لضيوفنا؟', 'بنجهزلكم رابط خاص للدعوة، بلضيوفكم على واتساب أو أي تطبيق، وبيفتح مباشرة على الجوال بدون تحميل أي شي.'],
    ['بنقدر نعدّل على الدعوة بعد ما نشوفها؟', 'أكيد. بتوصلكم معاينة قبل التسليم، وبنعدّل عليها حسب ملاحظاتكم.'],
    ['كيف بيشتغل تأكيد الحضور؟', 'الضيف بيأكد حضوره من الدعوة نفسها، والتأكيد بيوصلكم على واتساب.'],
    ['شو اللي بيحدد سعر الدعوة؟', 'الأسعار بتبدأ من 50 ₪ لدعوة بتصميم جاهز مع عدّاد تنازلي ورابط مشاركة. السعر بيزيد إذا بدكم تأكيد حضور عبر واتساب وتعديل على النصوص والألوان، أو تصميم خاص حسب طلبكم مع دومين خاص وحركات مخصصة.'],
    ['عندنا فكرة أو تصميم مختلف، بتقدروا تنفذوه؟', 'نعم، ابعتولنا فكرتكم على واتساب وبنجهزها إلكم بتصميم خاص.'],
    ['بتشتغل الدعوة على كل الأجهزة؟', 'نعم، الدعوة صفحة ويب بتفتح على أي جوال أو تابلت أو كمبيوتر.']
  ];
  var faqIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); faqIO.unobserve(e.target); } });
  }, { threshold: .15 }) : null;
  function decorateFaq() {
    var pk = document.getElementById('how');
    if (!pk || document.getElementById('faq')) return;
    var sec = document.createElement('section');
    sec.id = 'faq';
    var h = '<div class="w"><h2>أسئلة بتتكرر</h2><p class="sub">إذا ما لقيتوا جوابكم هون، احكولنا على واتساب.</p><div class="faq-l">';
    FAQ.forEach(function (q, i) { h += '<details style="--d:' + (i * .07).toFixed(2) + 's"><summary>' + q[0] + '</summary><div class="a">' + q[1] + '</div></details>'; });
    sec.innerHTML = h + '</div></div>';
    pk.parentNode.insertBefore(sec, pk.nextSibling);
    var l = sec.querySelector('.faq-l');
    if (reduce || !faqIO) l.classList.add('on'); else faqIO.observe(l);
    buildFaqLights(sec);
  }

  /* FAQ as cards pinned with clothespins on strings of wedding lights */
  function buildFaqLights(sec) {
    var wrap = document.createElement('div'); wrap.className = 'fql'; wrap.setAttribute('role', 'list');
    sec.querySelector('.faq-l').insertAdjacentElement('beforebegin', wrap);
    sec.classList.add('fql-on');
    var mq = matchMedia('(max-width: 720px)'), SAG = 70;
    function y(u) { return 10 + 4 * SAG * u * (1 - u); }
    function render() {
      var per = mq.matches ? 2 : 3, html = '';
      for (var r = 0; r < FAQ.length; r += per) {
        var row = FAQ.slice(r, r + per);
        html += '<div class="fql-row"><svg class="fql-wire" viewBox="0 0 1000 90" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 Q500 ' + (10 + 2 * SAG) + ' 1000 10" vector-effect="non-scaling-stroke"/></svg>';
        for (var b = 1; b < 18; b++) { var u = b / 18; html += '<i class="fql-bulb" aria-hidden="true" style="left:' + (u * 100).toFixed(2) + '%;top:' + y(u).toFixed(1) + 'px;--tw:' + (2 + Math.random() * 2.5).toFixed(2) + 's;--dl:-' + (Math.random() * 3).toFixed(2) + 's"></i>'; }
        row.forEach(function (q, k) {
          var u = 1 - (k + .5) / row.length, i = r + k, tilt = ((i * 37) % 7 - 3) * .9;
          html += '<div class="fql-card" role="listitem" style="left:' + (u * 100).toFixed(2) + '%;top:' + (y(u) - 4).toFixed(1) + 'px;--t:' + tilt.toFixed(1) + 'deg;--sw:' + (5 + (i % 3)) + 's">' +
            '<span class="fql-pin" aria-hidden="true"></span>' +
            '<button type="button" class="fql-in" aria-expanded="false"><span class="fql-f"><i class="fql-star" aria-hidden="true"></i><b>' + q[0] + '</b><small>اضغطوا للجواب</small></span>' +
            '<span class="fql-b"><em>تفصيلة</em>' + q[1] + '</span></button></div>';
        });
        html += '</div>';
      }
      wrap.innerHTML = html;
    }
    var rowIO = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('lit'); rowIO.unobserve(e.target); } });
    }, { threshold: .35 }) : null;
    function watch() {
      wrap.querySelectorAll('.fql-row').forEach(function (r) {
        r.querySelectorAll('.fql-bulb').forEach(function (b, i) { b.style.setProperty('--on', (i * .06).toFixed(2) + 's'); b.style.setProperty('--wv', (i * .18).toFixed(2) + 's'); });
        r.querySelectorAll('.fql-card').forEach(function (c, i) { c.style.setProperty('--in', (.5 + i * .18).toFixed(2) + 's'); });
        if (rowIO) rowIO.observe(r); else r.classList.add('lit');
      });
    }
    render(); watch();
    if (mq.addEventListener) mq.addEventListener('change', function () { render(); watch(); });
    /* nudge: the card swings when the pointer brushes past it */
    wrap.addEventListener('pointerover', function (e) {
      var c = e.target.closest('.fql-card'); if (!c || reduce || c.classList.contains('nudge')) return;
      c.classList.add('nudge'); setTimeout(function () { c.classList.remove('nudge'); }, 1400);
    });
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('.fql-in'); if (!b) return;
      var open = b.getAttribute('aria-expanded') !== 'true';
      wrap.querySelectorAll('.fql-in[aria-expanded="true"]').forEach(function (o) { if (o !== b) o.setAttribute('aria-expanded', 'false'); });
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* 7. floating order button, scroll progress, header that steps aside */
  function decorateChrome() {
    var hl = document.querySelector('.nav a.l[href="#how"]');
    if (hl && !document.querySelector('.nav a.l[href="#faq"]')) {
      var fl = hl.cloneNode(false); fl.href = '#faq'; fl.textContent = 'الأسئلة'; fl.classList.remove('act');
      fl.addEventListener('click', function (e) { var f = document.getElementById('faq'); if (f) { e.preventDefault(); f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } });
      hl.insertAdjacentElement('afterend', fl);
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { fl.classList.toggle('act', e.isIntersecting); }); }, { rootMargin: '-45% 0px -50% 0px' }).observe(document.getElementById('faq') || document.body);
    }
    if (!document.querySelector('.sprog')) {
      var sp = document.createElement('div'); sp.className = 'sprog'; sp.setAttribute('aria-hidden', 'true'); document.body.appendChild(sp);
    }
    if (!document.querySelector('.fab')) {
      var f = document.createElement('button');
      f.type = 'button'; f.className = 'fab'; f.setAttribute('aria-label', 'اطلبوا دعوتكم عبر واتساب');
      f.innerHTML = '<i aria-hidden="true"></i><span>اطلبوا دعوتكم</span>';
      f.addEventListener('click', function () { var b = document.querySelector('.cta-n'); if (b) b.click(); });
      document.body.appendChild(f);
    }
  }
  var lastY = scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    var sp = document.querySelector('.sprog'); if (sp) sp.style.setProperty('--sp', h > 0 ? (y / h).toFixed(4) : 0);
    var fab = document.querySelector('.fab');
    if (fab) {
      var ct = document.getElementById('contact'), nearContact = false;
      if (ct) { var r = ct.getBoundingClientRect(); nearContact = r.top < innerHeight * .8 && r.bottom > 0; }
      var dlg = document.querySelector('dialog[open]');
      fab.classList.toggle('on', y > innerHeight * .7 && !nearContact && !dlg);
    }
    var root = document.documentElement;
    if (y > 320 && y > lastY + 4) root.classList.add('nav-hide');
    else if (y < lastY - 4 || y < 320) root.classList.remove('nav-hide');
    lastY = y;
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);


  /* 8. packages: one card, "prices start from" the lowest package price */
  var pk1IO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); pk1IO.unobserve(e.target); } });
  }, { threshold: .2 }) : null;
  function lowestPrice() {
    var min = Infinity, list = [];
    try { var el = document.getElementById('data'); list = (JSON.parse(el.textContent).packages || []).map(function (p) { return p.p; }); } catch (_) {}
    if (!list.length) document.querySelectorAll('#packages .pk .pp').forEach(function (el) { list.push(el.textContent); });
    list.forEach(function (t) {
      var d = String(t || '').replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }).match(/\d+/);
      if (d && +d[0] > 0) min = Math.min(min, +d[0]);
    });
    return isFinite(min) ? min : 50;
  }
  function decoratePrice() {
    var pk = document.querySelector('#packages .pk');
    if (!pk) return;
    var card = document.querySelector('#packages .pk1');
    if (!card) {
      card = document.createElement('div');
      card.className = 'pk1';
      card.innerHTML =
        '<span class="pc-ring" aria-hidden="true"></span><span class="pc-spot" aria-hidden="true"></span><span class="pc-shine" aria-hidden="true"></span>' +
        '<div class="pk1-l"><span class="pk1-k">دعوة إلكترونية كاملة</span>' +
          '<span class="pk1-from">تبدأ الأسعار من</span>' +
          '<div class="pk1-p"><b class="pk1-v">50</b><i>₪</i></div>' +
          '<p class="pk1-n">والسعر النهائي بيعتمد على التصميم والإضافات اللي بتختاروها.</p><div class="pk1-occ"><span>زفاف</span><span>إشهار</span><span>تخرج</span><span>عيد ميلاد</span></div></div>' +
        '<div class="pk1-r"><h3>شو بتاخدوا في كل دعوة</h3><ul class="pk1-f pk1-inc"><li><i class="pk-ic"><svg viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg></i><span><b>رابط خاص</b><small>لضيوفكم على واتساب</small></span></li><li><i class="pk-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg></i><span><b>عدّاد تنازلي</b><small>للموعد جوّا الدعوة</small></span></li><li><i class="pk-ic"><svg viewBox="0 0 24 24"><path d="M21 11.1V12a9 9 0 1 1-5.3-8.2"/><path d="M21 4 12 13l-3-3"/></svg></i><span><b>تأكيد الحضور</b><small>بيوصلكم على واتساب</small></span></li><li><i class="pk-ic"><svg viewBox="0 0 24 24"><rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M11 18.5h2"/></svg></i><span><b>على كل الأجهزة</b><small>جوال، تابلت أو كمبيوتر</small></span></li><li><i class="pk-ic"><svg viewBox="0 0 24 24"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg></i><span><b>معاينة وتعديل</b><small>قبل التسليم</small></span></li></ul>' +
          '<span class="pk1-g">إضافات حسب طلبكم</span><ul class="pk1-ext"><li><i class="pk-ic"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4"/></svg></i>تصميم خاص</li><li><i class="pk-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg></i>دومين باسمكم</li><li><i class="pk-ic"><svg viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg></i>حركات مخصصة</li></ul>' +
        '<div class="pk1-a"><button type="button" class="btn pk1-go">اطلبوا دعوتكم</button><small>بنرد عليكم على واتساب</small></div></div>';
      card.querySelector('.pk1-go').addEventListener('click', function () { var b = document.querySelector('.cta-n'); if (b) b.click(); });
      pk.parentNode.insertBefore(card, pk.nextSibling);
      if (reduce || !pk1IO) card.classList.add('in'); else pk1IO.observe(card);
    }
    var v = card.querySelector('.pk1-v'), n = String(lowestPrice());
    if (v.textContent !== n) v.textContent = n;
  }


  /* 9. category view: one showcase card per category, colours as swatches */
  var CAT_DESC = { 'زفاف': 'أناقة لليلة العمر', 'إشهار': 'دعوة بروح وقورة', 'تخرج': 'فرحة الإنجاز', 'عيد ميلاد': 'تفاصيل صغيرة وفرحة كبيرة' };
  var CAT_NAMES = { 'زفاف': 'ليان و آدم', 'إشهار': 'ليان و آدم', 'تخرج': 'مبروك التخرج', 'عيد ميلاد': 'عيد ميلاد سعيد' };
  function lastColor(el) {
    var bg = el.getAttribute('style') || '', cs = bg.match(/rgba?\([^)]*\)|#[0-9a-f]{3,8}/gi);
    return cs && cs.length ? cs[cs.length - 1] : '#d8b56f';
  }
  function decorateShowcase() {
    var grid = document.querySelector('#designs .grid');
    if (!grid) return;
    var cards = [].slice.call(grid.querySelectorAll('.dc:not(.dc-ghost)'));
    if (!cards.length) return;
    var catEl = document.querySelector('#designs .cathead h3'), cat = catEl ? catEl.textContent.trim() : '';
    var key = cat + '|' + cards.map(function (d) { var h = d.querySelector('h3'); return h ? h.textContent : ''; }).join(',');
    grid.classList.add('showcase');
    var CK = { 'زفاف': 'wedding', 'إشهار': 'ishhar', 'تخرج': 'grad', 'عيد ميلاد': 'bday' };
    if (grid.dataset.cat !== (CK[cat] || '')) grid.dataset.cat = CK[cat] || '';
    if (grid.dataset.key !== key) { grid.dataset.key = key; grid.dataset.sel = '0'; }
    var sel = Math.min(+grid.dataset.sel || 0, cards.length - 1);
    var colors = cards.map(function (d) { var pv = d.querySelector('.pv'); return pv ? lastColor(pv) : '#d8b56f'; });
    var names = cards.map(function (d) { var h = d.querySelector('h3'); return h ? h.textContent.trim() : ''; });
    cards.forEach(function (d, i) {
      d.classList.toggle('sel', i === sel);
      var mk = d.querySelector('.mk');
      if (mk) {
        mk.style.setProperty('--tint', colors[i]);
        var rgb = (colors[i].match(/\d+/g) || [216, 181, 111]).map(Number);
        mk.classList.toggle('mk-dark', (rgb[0] * .3 + rgb[1] * .59 + rgb[2] * .11) < 110);
      }
      var b = mk && mk.querySelector('b'); if (b && CAT_NAMES[cat] && b.dataset.t !== CAT_NAMES[cat]) b.dataset.t = CAT_NAMES[cat];
      var inn = d.querySelector('.in'); if (!inn) return;
      var box = inn.querySelector('.sc-box');
      if (!box || box.dataset.key !== key) {
        if (box) box.remove();
        box = document.createElement('div'); box.className = 'sc-box'; box.dataset.key = key;
        var h = '<span class="sc-k">دعوة ' + cat + '</span><p class="sc-d">' + (CAT_DESC[cat] || '') + '</p>' +
          '<div class="sc-c"><span class="sc-l">' + (cards.length > 1 ? 'الألوان المتاحة' : 'اللون') + '</span><div class="sc-sw" role="radiogroup" aria-label="لون الدعوة">';
        colors.forEach(function (c, j) { h += '<button type="button" role="radio" class="sw" data-i="' + j + '" style="--c:' + c + '" aria-label="' + names[j] + '" title="' + names[j] + '"></button>'; });
        h += '</div><span class="sc-n"></span></div>' +
          '<ul class="sc-f"><li>بتنفتح على أي جوال</li><li>عدّاد تنازلي للموعد</li><li>رابط خاص لضيوفكم</li></ul>';
        box.innerHTML = h;
        inn.insertBefore(box, inn.firstChild);
      }
      box.querySelectorAll('.sw').forEach(function (sw, j) { sw.setAttribute('aria-checked', j === i ? 'true' : 'false'); });
      var n = box.querySelector('.sc-n'); if (n && n.textContent !== names[i]) n.textContent = names[i];
    });
  }
  document.addEventListener('click', function (e) {
    var sw = e.target.closest && e.target.closest('#designs .sc-sw .sw');
    if (!sw) return;
    e.stopPropagation();
    var grid = sw.closest('.grid'); if (!grid) return;
    grid.dataset.sel = sw.dataset.i;
    decorateShowcase();
    var on = grid.querySelector('.dc.sel .sw[data-i="' + sw.dataset.i + '"]'); if (on) on.focus({ preventScroll: true });
  }, true);


  /* 10. small invitations drawn as real invitation cards */
  var INV = {
    wgold: { t: 'بكل الحب ندعوكم لحضور حفل زفاف', n: ['ليان', 'آدم'], d: 'الخميس ١٢ أغسطس ٢٠٢٧', v: 'قاعة الياسمين', seal: 1, em: 'rings' },
    wrose: { t: 'بكل الحب ندعوكم لحضور حفل زفاف', n: ['سلمى', 'عمر'], d: 'الجمعة ٩ يوليو ٢٠٢٧', v: 'قاعة الورد', seal: 1, em: 'rings' },
    wsage: { t: 'بكل الحب ندعوكم لحضور حفل زفاف', n: ['ريم', 'كريم'], d: 'الجمعة ٢٠ أغسطس ٢٠٢٧', v: 'حديقة الزيتون', seal: 1, em: 'rings' },
    ish:   { t: 'يسعدنا دعوتكم لحفل إشهار زواج', n: ['نور', 'يزن'], d: 'الجمعة ٢ يوليو ٢٠٢٧', v: 'حديقة الورد', em: 'ring' },
    grad:  { t: 'بكل فخر ندعوكم لحفل تخرج', n: ['ريم خالد'], s: 'دفعة ٢٠٢٧', d: 'الخميس ٢٤ يونيو ٢٠٢٧', band: 1, em: 'cap' },
    bday:  { t: 'تعالوا نحتفل بعيد ميلاد', n: ['جود'], s: 'خمس سنين من الفرح', d: 'السبت ١٤ مايو ٢٠٢٧', em: 'balloon' }
  };
  function invHTML(k) {
    if (k === 'grad') return '<div class="inv inv-g" aria-hidden="true">' +
      '<div class="g-top"><i class="g-cap"></i><span>حفل تخرج</span></div>' +
      '<span class="inv-t">بكل فخر ندعوكم لمشاركتنا فرحة تخرج</span>' +
      '<span class="inv-n">ريم خالد</span><span class="g-cls">دفعة ٢٠٢٧</span>' +
      '<i class="inv-d"></i><span class="inv-dt">الخميس ٢٤ يونيو ٢٠٢٧</span><span class="inv-v">مسرح الجامعة</span>' +
      '<i class="g-ros"></i></div>';
    if (k === 'wgold' || k === 'wrose' || k === 'wsage') {
      /* the wedding card: classic and modern — an arch in foil, fine glitter, the couple, names in calligraphy */
      var w = INV[k], sp = '';
      [[14, 18, .2], [83, 12, 1.1], [90, 46, 2.1], [8, 58, .7], [20, 88, 1.6], [80, 84, 2.6], [50, 6, 1.9]].forEach(function (q) { sp += '<b class="w-sp" style="left:' + q[0] + '%;top:' + q[1] + '%;animation-delay:' + q[2] + 's"></b>'; });
      return '<div class="inv inv-w" aria-hidden="true"><i class="w-glit"></i><i class="w-fr"></i><i class="w-fr w-fr2"></i>' + sp +
        '<img class="w-cp" src="img/couple.svg" alt="" loading="lazy" decoding="async">' +
        '<span class="inv-t">' + w.t + '</span><span class="inv-n">' + w.n[0] + '</span><span class="inv-and">و</span><span class="inv-n">' + w.n[1] + '</span>' +
        '<i class="inv-d"></i><span class="inv-dt">' + w.d + '</span><span class="inv-v">' + w.v + '</span></div>';
    }
    var c = INV[k], h = '<div class="inv" aria-hidden="true">';
    if (c.band) h += '<i class="inv-band"></i>';
    h += '<i class="inv-em em-' + c.em + '"></i><span class="inv-t">' + c.t + '</span>';
    h += '<span class="inv-n">' + c.n[0] + '</span>';
    if (c.n[1]) h += '<span class="inv-and">و</span><span class="inv-n">' + c.n[1] + '</span>';
    if (c.s) h += '<span class="inv-s">' + c.s + '</span>';
    h += '<i class="inv-d"></i><span class="inv-dt">' + c.d + '</span>';
    if (c.v) h += '<span class="inv-v">' + c.v + '</span>';
    if (c.seal) h += '<i class="inv-seal"></i>';
    return h + '</div>';
  }
  function setInv(host, k) {
    if (!host || host.dataset.inv === k) return;
    var old = host.querySelector(':scope > .inv'); if (old) old.remove();
    host.className = host.className.replace(/\biv-\S+/g, '').trim();
    host.classList.add('has-inv', 'iv-' + k);
    host.dataset.inv = k;
    host.insertAdjacentHTML('beforeend', invHTML(k));
  }
  var CAT_INV = { 'زفاف': 'wgold', 'إشهار': 'ish', 'تخرج': 'grad', 'عيد ميلاد': 'bday' };
  function weddingVariant(name) { return /ورد/.test(name) ? 'wrose' : /زيت/.test(name) ? 'wsage' : 'wgold'; }
  function decorateInvites() {
    setInv(document.querySelector('.hero .f1 .mini'), 'ish');
    setInv(document.querySelector('.hero .f2 .mini'), 'grad');
    setInv(document.querySelector('.hero .f3 .mini'), 'bday');
    document.querySelectorAll('#designs .cats .ctile').forEach(function (t) {
      var b = t.querySelector('.ct b'), cat = b ? b.textContent.trim() : '', k = CAT_INV[cat];
      if (!k) return;
      if (k === 'wgold') {
        setInv(t.querySelector('.cm1'), 'wgold');
        var c3 = t.querySelector('.c3d');
        if (c3 && !c3.querySelector('.env-back')) {
          c3.classList.add('env-on');
          c3.insertAdjacentHTML('beforeend', '<span class="env-flap" aria-hidden="true"></span><span class="env-back" aria-hidden="true"></span><span class="env-front" aria-hidden="true"></span><span class="env-seal" aria-hidden="true"></span><span class="env-glow" aria-hidden="true"></span>');
        }
      }
      else t.querySelectorAll('.cm').forEach(function (c) { setInv(c, k); });
      if (k === 'grad') { var g3 = t.querySelector('.c3d'); if (g3 && !g3.querySelector('.gcap3')) g3.insertAdjacentHTML('beforeend', '<span class="gcap3" aria-hidden="true"></span>'); }
    });
    var catEl = document.querySelector('#designs .cathead h3'), cat = catEl ? catEl.textContent.trim() : '';
    document.querySelectorAll('#designs .grid .dc:not(.dc-ghost)').forEach(function (d) {
      var k = CAT_INV[cat], h = d.querySelector('h3');
      if (k === 'wgold') k = weddingVariant(h ? h.textContent : '');
      if (k) setInv(d.querySelector('.mk'), k);
    });
  }


  /* 11. order form: clear sections and required invitation details */
  function setVal(el, v) {
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function decorateOrder() {
    var rn = document.getElementById('rn'), rt = document.getElementById('rt'), rp = document.getElementById('rp');
    if (!rn || !rt || !rp) return;
    var dlg = rn.closest('dialog'); if (!dlg || dlg.querySelector('.of-box')) return;
    dlg.classList.add('of-on');
    rn.placeholder = 'اسمك الكامل'; rn.required = true;
    var lrn = dlg.querySelector('label[for="rn"]'), lrp = dlg.querySelector('label[for="rp"]'), lrt = dlg.querySelector('label[for="rt"]');
    if (lrn) { lrn.insertAdjacentHTML('beforebegin', '<div class="of-h">بياناتك</div>'); lrn.innerHTML = 'اسمك <b class="of-req">*</b>'; }
    var today = new Date(); today.setDate(today.getDate() + 1);
    var min = today.toISOString().slice(0, 10);
    var box = document.createElement('div'); box.className = 'of-box';
    box.innerHTML = '<div class="of-h">تفاصيل المناسبة</div>' +
      '<label for="of-n">أسماء أصحاب المناسبة <b class="of-req">*</b></label><input id="of-n" placeholder="مثلاً: أحمد و منال" autocomplete="off">' +
      '<div class="of-row"><div><label for="of-d">التاريخ <b class="of-req">*</b></label><input id="of-d" type="date" min="' + min + '"></div>' +
      '<div><label for="of-t">الوقت</label><input id="of-t" type="time"></div></div>' +
      '<label for="of-p">المكان <b class="of-req">*</b></label><input id="of-p" placeholder="اسم القاعة والمدينة" autocomplete="off">';
    if (lrt) { lrt.parentNode.insertBefore(box, lrt); lrt.textContent = 'ملاحظات أو تعديلات (اختياري)'; }
    rt.placeholder = 'ألوان، نصوص، أي تفاصيل حابين تضيفوها';
    var send = [].slice.call(dlg.querySelectorAll('button')).filter(function (b) { return /واتساب/.test(b.textContent); })[0];
    if (!send) return;
    function err(el, msg) {
      el.classList.add('of-bad'); el.setAttribute('aria-invalid', 'true');
      var m = el.parentNode.querySelector('.of-msg[data-for="' + el.id + '"]');
      if (!m) { m = document.createElement('div'); m.className = 'of-msg'; m.dataset.for = el.id; el.insertAdjacentElement('afterend', m); }
      m.textContent = msg;
    }
    function ok(el) { el.classList.remove('of-bad'); el.removeAttribute('aria-invalid'); var m = el.parentNode.querySelector('.of-msg[data-for="' + el.id + '"]'); if (m) m.remove(); }
    dlg.addEventListener('input', function (e) { if (e.target.classList && e.target.classList.contains('of-bad') && e.target.value.trim()) ok(e.target); });
    var bypass = false, userNotes = null;
    send.addEventListener('click', function (e) {
      if (bypass) { bypass = false; return; }
      e.preventDefault(); e.stopImmediatePropagation();
      var f = { n: dlg.querySelector('#of-n'), d: dlg.querySelector('#of-d'), t: dlg.querySelector('#of-t'), p: dlg.querySelector('#of-p') };
      var bad = [];
      if (!rn.value.trim()) { err(rn, 'اكتبوا اسمكم هون'); bad.push(rn); } else ok(rn);
      if (!f.n.value.trim()) { err(f.n, 'اكتبوا أسماء أصحاب المناسبة'); bad.push(f.n); } else ok(f.n);
      if (!f.d.value) { err(f.d, 'اختاروا تاريخ المناسبة'); bad.push(f.d); }
      else if (f.d.value < min) { err(f.d, 'التاريخ لازم يكون بالمستقبل'); bad.push(f.d); } else ok(f.d);
      if (!f.p.value.trim()) { err(f.p, 'اكتبوا مكان المناسبة'); bad.push(f.p); } else ok(f.p);
      if (bad.length) { bad[0].focus(); bad[0].scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      if (userNotes === null || rt.value.indexOf('الأسماء: ') !== 0) userNotes = rt.value.trim();
      var lines = ['الأسماء: ' + f.n.value.trim(), 'التاريخ: ' + f.d.value + (f.t.value ? ' الساعة ' + f.t.value : ''), 'المكان: ' + f.p.value.trim()];
      if (userNotes) lines.push('ملاحظات: ' + userNotes);
      setVal(rt, lines.join('\n'));
      setTimeout(function () { bypass = true; send.click(); document.dispatchEvent(new CustomEvent('tf:sent')); setTimeout(function () { setVal(rt, userNotes || ''); userNotes = null; }, 300); }, 60);
    }, true);
  }


  function decorateHeroStage() {
    var st = document.querySelector('.hero .hstage');
    if (!st || st.querySelector('.h-floor')) return;
    st.insertAdjacentHTML('afterbegin', '<span class="h-floor" aria-hidden="true"></span><span class="h-refl" aria-hidden="true"></span><span class="deco d-ro1" aria-hidden="true"></span><span class="deco d-ro2" aria-hidden="true"></span>');
    var hero = st.closest('.hero'); if (hero && !hero.querySelector('.d-ol1')) hero.insertAdjacentHTML('afterbegin', '<span class="deco d-ol1" aria-hidden="true"></span><span class="deco d-ol2" aria-hidden="true"></span>');
  }

  /* 13. hero motion: falling petals, rotating occasion word, parallax, cursor sparkles, scroll cue */
  function decorateHeroMotion() {
    var hero = document.querySelector('.hero');
    if (!hero || hero.querySelector('.h-pet')) return;
    hero.classList.add('hm-on');
    var pet = document.createElement('div'); pet.className = 'h-pet'; pet.setAttribute('aria-hidden', 'true');
    if (!reduce) for (var i = 0; i < 16; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.setProperty('--d', (12 + Math.random() * 12).toFixed(1) + 's');
      p.style.setProperty('--dl', (-Math.random() * 24).toFixed(1) + 's');
      p.style.setProperty('--s', (8 + Math.random() * 10).toFixed(0) + 'px');
      p.style.setProperty('--x', ((Math.random() - .5) * 220).toFixed(0) + 'px');
      p.style.setProperty('--r', (Math.random() * 360).toFixed(0) + 'deg');
      p.className = Math.random() < .3 ? 'lf' : '';
      pet.appendChild(p);
    }
    hero.insertBefore(pet, hero.firstChild);
    /* rotating occasion word under the heading */
    var eb = hero.querySelector('.eb2');
    if (eb && !eb.querySelector('.rw')) {
      var words = ['لعرسكم', 'لإشهاركم', 'لتخرجكم', 'لعيد ميلادكم'];
      eb.innerHTML = 'دعوات إلكترونية <span class="rw" aria-live="off"><b>' + words.join('</b><b>') + '</b></span>';
      var bs = eb.querySelectorAll('.rw b'), k = 0; bs[0].classList.add('on');
      if (!reduce) setInterval(function () { bs[k].classList.remove('on'); bs[k].classList.add('out'); var o = bs[k]; setTimeout(function () { o.classList.remove('out'); }, 700); k = (k + 1) % bs.length; bs[k].classList.add('on'); }, 2400);
    }
    /* scroll cue */
    if (!hero.querySelector('.h-cue')) hero.insertAdjacentHTML('beforeend', '<a class="h-cue" href="#designs" aria-label="انزلوا للتصاميم"><span></span><small>اكتشفوا التصاميم</small></a>');
    if (reduce) return;
    /* parallax on scroll and pointer */
    var ticking = false, mx = 0, my = 0;
    function apply() {
      ticking = false;
      var y = Math.min(scrollY, innerHeight);
      hero.style.setProperty('--sy', (y / innerHeight).toFixed(3));
      hero.style.setProperty('--mx', mx.toFixed(3)); hero.style.setProperty('--my', my.toFixed(3));
    }
    addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var last = 0;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - .5; my = (e.clientY - r.top) / r.height - .5;
        if (!ticking) { ticking = true; requestAnimationFrame(apply); }
        var now = performance.now(); if (now - last < 45) return; last = now;
        var s = document.createElement('i'); s.className = 'h-spark'; s.setAttribute('aria-hidden', 'true');
        s.style.left = (e.clientX - r.left) + 'px'; s.style.top = (e.clientY - r.top) + 'px';
        s.style.setProperty('--tx', ((Math.random() - .5) * 40).toFixed(0) + 'px');
        hero.appendChild(s); setTimeout(function () { s.remove(); }, 900);
      });
    }
  }


  /* 14. hero book: olive wreath monogram, sprig and roses */
  function decorateBook() {
    var fb = document.querySelector('.hero .fbase'), rb = document.querySelector('.hero .fcv .fb');
    if (!fb || !rb || fb.querySelector('.bk-sprig')) return;
    var ff = document.querySelector('.hero .fcv .ffimg');
    var n = fb.querySelector('.fn'), parts = n ? n.textContent.split(/\s+و\s+/) : [];
    if (ff && !ff.querySelector('.cv2')) ff.insertAdjacentHTML('beforeend',
      '<div class="cv2" aria-hidden="true"><span class="cv2-band"></span>' +
      '<div class="cv2-arch"><img class="cv2-cp" src="img/couple.svg" alt="">' +
      '<div class="cv2-names"><b class="cv2-n">' + (parts[0] || 'أحمد').trim() + '</b><i class="cv2-and">و</i><b class="cv2-n">' + (parts[1] || 'منال').trim() + '</b></div>' +
      '<span class="cv2-star"></span><small class="cv2-d">١٣ · ٠٢ · ٢٠٢٧</small><span class="cv2-rose"></span></div>' +
      '<i class="lg cv2-lg"></i></div>');
    fb.insertAdjacentHTML('afterbegin', '<span class="bk-sprig" aria-hidden="true"></span>');
    fb.insertAdjacentHTML('beforeend', '<span class="bk-rose" aria-hidden="true"></span>');
    var a = (parts[0] || 'أ').trim().charAt(0), b = (parts[1] || 'م').trim().charAt(0);
    rb.insertAdjacentHTML('afterbegin', '<span class="bk-mono" aria-hidden="true"><b>' + a + '</b><i>&amp;</i><b>' + b + '</b></span>');
    rb.insertAdjacentHTML('beforeend', '<span class="bk-rose r" aria-hidden="true"></span>');
    var st = document.querySelector('.hero .hstage');
    if (st && !st.querySelector('.h-tree')) st.insertAdjacentHTML('afterbegin', '<span class="h-tree l" aria-hidden="true"></span><span class="h-tree r" aria-hidden="true"></span>');
  }


  /* 15. petal burst when a main button is pressed */
  if (!reduce) document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn:not(.alt), .fab');
    if (!b) return;
    var w = document.createElement('span'); w.className = 'btn-burst'; w.style.left = e.clientX + 'px'; w.style.top = e.clientY + 'px';
    var h = '<b></b>';
    for (var i = 0; i < 12; i++) { var a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 40;
      h += '<i style="--tx:' + (Math.cos(a) * d).toFixed(0) + 'px;--ty:' + (Math.sin(a) * d).toFixed(0) + 'px;--r:' + (Math.random() * 360).toFixed(0) + 'deg"></i>'; }
    w.innerHTML = h; document.body.appendChild(w); setTimeout(function () { w.remove(); }, 1000);
  }, { passive: true });

  /* opened category: scale the design card so the section fits one screen */
  function fitShowcase() {
    var g = document.querySelector('#designs .grid'), sec = document.getElementById('designs');
    var dc = g && (g.querySelector('.dc.sel:not(.dc-ghost)') || g.querySelector('.dc'));
    if (!dc || !sec || !sec.querySelector('.cathead')) return;
    if (innerWidth < 900) { g.style.setProperty('--fz', 1); return; }
    var cur = parseFloat(getComputedStyle(dc).zoom) || 1;
    var top = dc.getBoundingClientRect().top - sec.getBoundingClientRect().top;
    var h = dc.getBoundingClientRect().height / cur, avail = innerHeight - top - 24;
    var z = Math.max(.7, Math.min(1, avail / h));
    if (Math.abs(z - cur) > .01) g.style.setProperty('--fz', z.toFixed(3));
  }
  var fitT; addEventListener('resize', function () { clearTimeout(fitT); fitT = setTimeout(fitShowcase, 120); });
  /* how we work: three steps hanging from a tailor's measuring tape that unrolls across the top */
  var HOW = [
    ['اختاروا التصميم', 'تصفّحوا المعرض وعاينوا كل دعوة قبل ما تختاروا.'],
    ['أرسلوا بياناتكم', 'الأسماء والتاريخ والمكان، وأي ألوان أو نصوص تحبّوها.'],
    ['نجهّزها لكم', 'تصلكم معاينة، ونعدّل عليها حسب ملاحظاتكم.'],
    ['شاركوا حكايتكم', 'رابط خاص تبعتوه لضيوفكم، وتأكيد الحضور بيوصلكم على واتساب.']
  ];
  function decorateHow() {
    var sec = document.getElementById('how'), hw = sec && sec.querySelector('.hows');
    if (!hw || sec.querySelector('.hw4')) return;
    var sub = sec.querySelector('.sh .sub'); if (sub) sub.textContent = 'أربع خطوات بسيطة، وتفاصيل الدعوة علينا.';
    var x = document.createElement('div'); x.className = 'hw4'; x.dataset.s = '0';
    var list = '<ol class="hw4-list">';
    HOW.forEach(function (s, i) { list += '<li><button type="button" class="hw4-s" data-i="' + i + '" aria-pressed="' + (i ? 'false' : 'true') + '"><span class="hw4-n">' + ['١','٢','٣','٤'][i] + '</span><span class="hw4-t"><b>' + s[0] + '</b><small>' + s[1] + '</small></span><i class="hw4-bar"></i></button></li>'; });
    list += '</ol>';
    var thumbs = ''; ['#fbeceb', '#eef1ea', '#f4ece0', '#eef0f6'].forEach(function (c, i) { thumbs += '<span class="ph-th' + (i === 0 ? ' on' : '') + '" style="background:' + c + '"><i></i><i></i><i></i></span>'; });
    var phone = '<div class="hw4-ph"><div class="ph-scr">' +
      '<div class="ph-v v0"><div class="ph-top">اختاروا تصميمكم</div><div class="ph-grid">' + thumbs + '</div><div class="ph-send">اختار هذا التصميم</div></div>' +
      '<div class="ph-v v1"><div class="ph-top">واتساب · تفصيلة</div><div class="ph-chat"><div class="ph-msg m1"><b>أحمد و منال</b><span>الخميس ١٣ فبراير ٢٠٢٧</span></div><div class="ph-msg m2"><span>قاعة الفرح · غزة</span></div><div class="ph-msg m3"><span>بدنا اللون الوردي لو سمحتوا 🌸</span></div><div class="ph-rsvp r0">وصلتنا بياناتكم ✓</div></div></div>' +
      '<div class="ph-v v2"><div class="ph-top">معاينة دعوتكم</div><div class="ph-card"><span class="ph-arch"></span><small>بكل الحب ندعوكم</small><b>أحمد و منال</b><em>١٣ · ٠٢ · ٢٠٢٧</em><span class="ph-tat"></span></div><div class="ph-note"><i>✎</i> بدنا الاسم أكبر شوي</div><div class="ph-ok">تم التعديل ✓</div></div>' +
      '<div class="ph-v v3"><div class="ph-top">شاركوها</div><div class="ph-chat"><div class="ph-b"><span class="ph-link"><span class="ph-mini"></span><b>دعوة أحمد و منال</b><small>tafsila.ps/ahmad-manal</small></span></div>' +
      '<div class="ph-rsvp r1">✓ سارة أكدت حضورها</div><div class="ph-rsvp r2">✓ خالد أكد حضوره</div><div class="ph-rsvp r3">✓ ٤٢ ضيف أكدوا</div></div></div>' +
      '<span class="ph-glare"></span></div><span class="ph-notch"></span><span class="ph-ly" style="--z:1"></span><span class="ph-ly" style="--z:2"></span><span class="ph-ly" style="--z:3"></span><span class="ph-ly" style="--z:4"></span><span class="ph-ly" style="--z:5"></span><span class="ph-ly" style="--z:6"></span><span class="ph-ly" style="--z:7"></span><span class="ph-ly" style="--z:8"></span><span class="ph-ly" style="--z:9"></span><span class="ph-ly" style="--z:10"></span><span class="ph-ly" style="--z:11"></span><span class="ph-ly" style="--z:12"></span><i class="ph-btn b1"></i><i class="ph-btn b2"></i><i class="ph-btn b3"></i><i class="ph-btn b4"></i></div>';
    x.innerHTML = list + phone;
    hw.parentNode.insertBefore(x, hw); sec.classList.add('how4');
    var cur = 0, timer, btns = x.querySelectorAll('.hw4-s');
    function go(i) {
      cur = i; x.dataset.s = i;
      btns.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      clearTimeout(timer);
      if (!reduce && !x.__pin) timer = setTimeout(function () { go((cur + 1) % HOW.length); }, 4200);
    }
    x.__go = go;
    x.addEventListener('click', function (e) {
      var b = e.target.closest('.hw4-s'); if (b) return go(+b.dataset.i);
      var th = e.target.closest('.ph-th, .rs-card'); if (th && cur === 0) { x.querySelectorAll('.ph-th, .rs-card').forEach(function (t) { t.classList.toggle('on', t === th); }); return; }
      if (e.target.closest('.hw4-ph')) go((cur + 1) % HOW.length);
    });
    var ph = x.querySelector('.hw4-ph'); ph.setAttribute('role', 'button'); ph.setAttribute('tabindex', '0'); ph.setAttribute('aria-label', 'الخطوة التالية');
    ph.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go((cur + 1) % HOW.length); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { if (!x.__pin) go(0); } else clearTimeout(timer); }); }, { threshold: .4 }).observe(x);
    else go(0);
  }
  /* olives drop from the hero trees as you scroll down to the next section */
  function decorateOliveFall() {
    var trees = document.querySelectorAll('.hero .h-tree');
    if (!trees.length || trees[0].querySelector('.olv')) return;
    var spots = [[30, 30], [48, 22], [64, 34], [40, 44], [72, 46], [56, 40], [24, 48]];
    trees.forEach(function (t, ti) {
      spots.forEach(function (s, i) {
        var o = document.createElement('i'); o.className = 'olv'; o.setAttribute('aria-hidden', 'true');
        o.style.left = s[0] + '%'; o.style.top = s[1] + '%';
        o.style.setProperty('--d', ((i * 0.11 + ti * 0.05) % 0.6).toFixed(2));
        o.style.setProperty('--r', ((i % 2 ? 1 : -1) * (180 + i * 40)) + 'deg');
        o.style.setProperty('--x', ((i % 3 - 1) * 14) + 'px');
        o.style.setProperty('--fall-h', (90 - s[1]) + 'cqh');
        t.appendChild(o);
      });
    });
    var hero = document.querySelector('.hero'), raf = 0;
    function upd() {
      raf = 0;
      var p = Math.max(0, Math.min(1, scrollY / (hero.offsetHeight * .7)));
      hero.style.setProperty('--of', reduce ? 0 : p.toFixed(4));
    }
    addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }
  /* contact: an envelope opens and the invitation card rises out of it */
  function decorateContactEnv() {
    var chat = document.querySelector('#contact .chat');
    if (!chat || chat.parentNode.classList.contains('ct-mix')) return;
    var wrap = document.createElement('div'); wrap.className = 'ct-mix'; wrap.setAttribute('aria-hidden', 'true');
    chat.parentNode.insertBefore(wrap, chat);
    wrap.innerHTML = '<span class="cm-back"></span>'; wrap.appendChild(chat);
    wrap.insertAdjacentHTML('beforeend', '<span class="cm-front"></span><span class="cm-seal">ت</span>');
    chat.querySelectorAll('.m,.typing').forEach(function (m, i) { m.style.setProperty('--md', (1.3 + i * .9).toFixed(2) + 's'); });
    document.getElementById('contact').classList.add('ct-mixed');
    if (reduce || !('IntersectionObserver' in window)) wrap.classList.add('open');
    else new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { wrap.classList.add('open'); o.disconnect(); setInterval(function () { if (document.hidden || (document.getElementById('contact') || {}).classList && document.getElementById('contact').classList.contains('is-off')) return; wrap.classList.remove('open'); void wrap.offsetWidth; setTimeout(function () { wrap.classList.add('open'); }, 500); }, 9000); } }); }, { threshold: .4 }).observe(wrap);
  }
  /* olive branches and roses along the unused side margins of every section */
  function decorateEdges() {
    var ids = ['designs', 'packages', 'how', 'faq', 'contact'];
    var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    ids.forEach(function (id) {
      var s = document.getElementById(id); if (!s || s.querySelector(':scope > .edge')) return;
      var n = 2 + Math.floor(rnd() * 2), html = '';
      for (var i = 0; i < n; i++) {
        var side = rnd() < .5 ? 'l' : 'r', kind = rnd() < .5 ? 'olive' : 'roses';
        var top = (8 + rnd() * 74).toFixed(0), sc = (.7 + rnd() * .55).toFixed(2), rot = (-40 + rnd() * 80).toFixed(0), off = (-10 + rnd() * 50).toFixed(0);
        html += '<span class="edge e-' + side + ' e-' + kind + '" aria-hidden="true" style="top:' + top + '%;--sc:' + sc + ';--rot:' + rot + 'deg;--off:' + off + 'px;--sw:' + (5 + rnd() * 4).toFixed(1) + 's;--dl:-' + (rnd() * 5).toFixed(1) + 's"></span>';
      }
      s.insertAdjacentHTML('afterbegin', html);
    });
  }
  /* cover couple: inline the drawing so the bride and groom can share a kiss, then stand */
  function inlineCouple() {
    var im = document.querySelector('.cv2 img.cv2-cp');
    if (!im || im.dataset.inl) return; im.dataset.inl = 1;
    fetch(im.src).then(function (r) { return r.text(); }).then(function (t) {
      var d = document.createElement('div'); d.className = 'cv2-cp cv2-svg'; d.innerHTML = t; d.setAttribute('aria-hidden', 'true');
      im.replaceWith(d); if (!reduce) setTimeout(function () { d.classList.add('kiss'); }, 500);
    }).catch(function () {});
  }
  /* price tag: grab it and swing it; it keeps swinging and slowly settles (pendulum) */
  function decorateTagSwing() {
    var tag = document.querySelector('#packages .pk1-l');
    if (!tag || tag.dataset.sw) return; tag.dataset.sw = 1;
    if (!tag.querySelector('.pk-tat')) tag.insertAdjacentHTML('afterbegin', '<i class="pk-tat" aria-hidden="true"></i>');
    var ang = 0, vel = 0, drag = null, raf = 0;
    function frame() {
      if (!drag) { vel += -ang * .012; vel *= .985; ang += vel; }
      tag.style.rotate = ang.toFixed(2) + 'deg';
      if (drag || Math.abs(ang) > .05 || Math.abs(vel) > .02) raf = requestAnimationFrame(frame); else { raf = 0; tag.classList.remove('swinging'); tag.style.rotate = ''; }
    }
    function kick() { tag.classList.add('swinging'); if (!raf) raf = requestAnimationFrame(frame); }
    tag.addEventListener('pointerdown', function (e) {
      var r = tag.getBoundingClientRect();
      drag = { cx: r.left + r.width / 2, cy: r.top - 60, last: ang, id: e.pointerId };
      try { tag.setPointerCapture(e.pointerId); } catch (_) {} kick();
    });
    tag.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var a = Math.atan2(e.clientX - drag.cx, e.clientY - drag.cy) * -180 / Math.PI;
      a = Math.max(-40, Math.min(40, a)); vel = a - ang; ang = a;
    });
    function up() { if (!drag) return; drag = null; vel = Math.max(-6, Math.min(6, vel)); kick(); }
    tag.addEventListener('pointerup', up); tag.addEventListener('pointercancel', up);
  }

  /* the four phone screens in "how we work", drawn like real apps: a design gallery, a WhatsApp chat,
     an invitation preview with an edit, and the shared link with RSVPs arriving as notifications */
  function decorateScreens() {
    var ph = document.querySelector('#how .hw4-ph'); if (!ph || ph.dataset.rs) return; ph.dataset.rs = 1;
    var SB = '<div class="rs-sb"><b>9:41</b><span><svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx=".8"/><rect x="5" y="5.5" width="3" height="6.5" rx=".8"/><rect x="10" y="3" width="3" height="9" rx=".8"/><rect x="15" y="0" width="3" height="12" rx=".8"/></svg>' +
      '<svg viewBox="0 0 16 12"><path d="M8 11.5l2.4-2.9a3.6 3.6 0 0 0-4.8 0zM3.6 6.6a6.6 6.6 0 0 1 8.8 0l1.5-1.8a9 9 0 0 0-11.8 0zM.2 3.2a11.6 11.6 0 0 1 15.6 0L14.3 1.4A9.6 9.6 0 0 0 1.7 1.4z"/></svg>' +
      '<i class="rs-bat"><i></i></i></span></div>';
    var HOME = '<i class="rs-home"></i>';
    function inv(cls, names) { return '<span class="rs-inv ' + cls + '"><span class="rs-arch"><i class="rs-spr"></i><small>بكل الحب ندعوكم</small><b>' + names + '</b><em>١٣ · ٠٢ · ٢٠٢٧</em><i class="rs-tat"></i></span></span>'; }
    var tick = '<svg class="rs-tk" viewBox="0 0 16 10"><path d="M1 5.5l2.6 2.6L9 2.6M6.4 8.1L11.8 2.6" /></svg>';
    var v = ph.querySelectorAll('.ph-v');
    if (v.length < 4) return;
    v[0].innerHTML = SB +
      '<div class="rs-app"><div class="rs-ah"><b class="rs-logo">تفصيلة</b><svg class="rs-srch" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg></div>' +
      '<div class="rs-ttl rs-a" style="--d:.05"><b>اختاروا تصميمكم</b><small>٤٨ تصميم لكل المناسبات</small></div>' +
      '<div class="rs-chips rs-a" style="--d:.15"><span class="on">الكل</span><span>زفاف</span><span>خطوبة</span><span>تخرج</span><span>مواليد</span></div>' +
      '<div class="rs-grid">' +
        '<button type="button" class="rs-card on rs-a" style="--d:.25">' + inv('p', 'أحمد و منال') + '<span class="rs-meta"><b>ورد الجوري</b><em>٥٠ ₪</em></span><i class="rs-chk">✓</i></button>' +
        '<button type="button" class="rs-card rs-a" style="--d:.33">' + inv('b', 'ليان و آدم') + '<span class="rs-meta"><b>سماء صافية</b><em>٥٠ ₪</em></span><i class="rs-chk">✓</i></button>' +
        '<button type="button" class="rs-card rs-a" style="--d:.41">' + inv('l', 'نور و يزن') + '<span class="rs-meta"><b>لافندر</b><em>٥٠ ₪</em></span><i class="rs-chk">✓</i></button>' +
        '<button type="button" class="rs-card rs-a" style="--d:.49">' + inv('w', 'ريم خالد') + '<span class="rs-meta"><b>تطريز أحمر</b><em>٥٠ ₪</em></span><i class="rs-chk">✓</i></button>' +
      '</div><span class="rs-cta rs-a" style="--d:.6">اختاروا هذا التصميم</span></div>' + HOME;
    var WAH = function (name, sub, av) { return '<div class="rs-wah"><span class="rs-back">‹</span><i class="rs-av">' + av + '</i><span class="rs-who"><b>' + name + '</b><small>' + sub + '</small></span>' +
      '<svg viewBox="0 0 20 14"><rect x="1" y="2" width="12" height="10" rx="2.5"/><path d="M13 6l5-3v8l-5-3z"/></svg><svg viewBox="0 0 16 16"><path d="M4 1.5l2.6 3-1.5 2a8 8 0 0 0 4.4 4.4l2-1.5 3 2.6-1.4 2.2c-.3.5-1 .8-1.6.6A13 13 0 0 1 1.2 4.4c-.2-.6.1-1.3.6-1.6z"/></svg></div>'; };
    v[1].innerHTML = SB + WAH('تفصيلة', 'متصل الآن', 'ت') +
      '<div class="rs-chat"><span class="rs-day">اليوم</span>' +
        '<p class="rs-m out rs-a" style="--d:.2">مرحبا 👋 بدنا دعوة عرس<time>٩:٤٠ ' + tick + '</time></p>' +
        '<p class="rs-m out rs-a" style="--d:.7">العريس: أحمد<br>العروس: منال<br>الخميس ١٣ فبراير ٢٠٢٧<br>قاعة الفرح · غزة<time>٩:٤٠ ' + tick + '</time></p>' +
        '<p class="rs-m out rs-a" style="--d:1.2">بنحب اللون الوردي 🌸<time>٩:٤١ ' + tick + '</time></p>' +
        '<p class="rs-m in rs-a" style="--d:2">أهلاً وألف مبروك! 🤍 وصلتنا البيانات، بنبعتلكم المعاينة اليوم<time>٩:٤١</time></p>' +
      '</div><div class="rs-inp"><span>رسالة</span><i class="rs-mic"><svg viewBox="0 0 12 16"><rect x="3.5" y="1" width="5" height="9" rx="2.5"/><path d="M1.5 7.5a4.5 4.5 0 0 0 9 0M6 12v3"/></svg></i></div>' + HOME;
    v[2].innerHTML = SB +
      '<div class="rs-pv"><div class="rs-pvh"><b>معاينة دعوتكم</b><span>نسخة ٢</span></div>' +
      '<div class="rs-big">' + inv('p big', 'أحمد و منال').replace('<small>بكل الحب ندعوكم</small>', '<small>بكل الحب ندعوكم لحضور حفل زفاف</small>').replace('</em>', '</em><em class="rs-ven">قاعة الفرح · غزة</em>') + '</div>' +
      '<span class="rs-note rs-a" style="--d:.5"><i>م</i>بدنا الاسم أكبر شوي 🙏</span>' +
      '<span class="rs-toast rs-a" style="--d:1.9">✓ تم التعديل</span>' +
      '<div class="rs-acts"><span>طلب تعديل</span><span class="ok">اعتماد الدعوة</span></div></div>' + HOME;
    v[3].innerHTML = SB + WAH('العيلة 💍', 'سارة، خالد، ماما، و٤٥ آخرين', '💍') +
      '<div class="rs-chat"><span class="rs-day">اليوم</span>' +
        '<div class="rs-m out link rs-a" style="--d:.15"><span class="rs-lp">' + inv('p', 'أحمد و منال') + '<span><b>دعوة أحمد و منال 💍</b><small>الخميس ١٣ فبراير · قاعة الفرح</small><em>tafsila.ps</em></span></span><u>tafsila.ps/ahmad-manal</u><time>٩:٥٠ ' + tick + '</time></div>' +
        '<p class="rs-m in rs-a" style="--d:.8"><b class="nm">سارة</b>مبروووك 🤍 أكيد جايين!<time>٩:٥١</time></p>' +
      '</div>' +
      '<div class="rs-ntf"><div class="rs-n rs-a" style="--d:1.3"><i>ت</i><span><b>تفصيلة <small>الآن</small></b>سارة أكدت حضورها ✓</span></div>' +
      '<div class="rs-n rs-a" style="--d:2"><i>ت</i><span><b>تفصيلة <small>الآن</small></b>خالد و٢ معه أكدوا الحضور ✓</span></div>' +
      '<div class="rs-n big rs-a" style="--d:2.7"><i>ت</i><span><b>تفصيلة <small>الآن</small></b>٤٢ ضيف أكدوا حضورهم 🎉</span></div></div>' + HOME;
    ph.classList.add('rs-on');
  }
  /* speed: pause every looping animation in a section while it is off-screen */
  function decoratePerf() {
    if (!('IntersectionObserver' in window)) return;
    var io = decoratePerf.io || (decoratePerf.io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-off', !e.isIntersecting); });
    }, { rootMargin: '120px 0px' }));
    document.querySelectorAll('.hero, #designs, #packages, #how, #faq, #contact, footer').forEach(function (el) {
      if (el.__perf) return; el.__perf = 1; io.observe(el);
    });
  }

  /* the hero, editorial: a huge thin headline crossed by "تفصيلة" in calligraphy, and a collage of our own
     invitations (wedding, engagement, graduation, birthday) laid on the page like prints, with a calendar,
     an RSVP and a handwritten note */
  function decorateHeroCollage() {
    var hero = document.querySelector('.hero'); if (!hero || hero.querySelector('.hx')) return;
    function print(k, cls, depth) {
      return '<figure class="hx-p ' + cls + '" data-d="' + depth + '"><span class="hx-card" data-k="' + k + '"></span></figure>';
    }
    var cal = '<div class="hx-cal hx-o" data-d="1.4"><b>فبراير ٢٠٢٧</b><ol>' +
      ['س','ح','ن','ث','ر','خ','ج'].map(function (d) { return '<li class="h">' + d + '</li>'; }).join('') +
      (function () { var h = ''; for (var i = 0; i < 1; i++) h += '<li></li>'; for (var n = 1; n <= 21; n++) h += '<li' + (n === 13 ? ' class="on"' : '') + '>' + String(n).replace(/\d/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'[c]; }) + (n === 13 ? '<svg class="hx-ring" viewBox="0 0 60 40"><path d="M8 22C6 10 24 4 38 6s20 10 16 18-20 12-34 9S4 22 14 13"/></svg>' : '') + '</li>'; return h; })() +
      '</ol></div>';
    var html = '<div class="hx" aria-hidden="false">' +
      '<div class="hx-txt">' +
        '<p class="hx-k">كل فرحة إلها تفصيلة</p>' +
        '<h1 class="hx-h"><span class="hx-l1">دعوات</span><span class="hx-l2">إلكترونية</span><em class="hx-sc">تفصيلة</em></h1>' +
        '<p class="hx-occ"><span>زفاف</span><span>خطوبة وإشهار</span><span>تخرج</span><span>عيد ميلاد</span><span>مواليد</span></p>' +
        '<p class="hx-s">نصمّم دعوتكم برابط واحد يوصل لكل ضيوفكم على واتساب، بتصميم يشبه مناسبتكم.</p>' +
      '</div>' +
      '<div class="hx-col" aria-hidden="true">' +
        print('grad', 'hx-g', 1.6) + print('bday', 'hx-b', 1.8) + print('ish', 'hx-i', 1.2) + print('wgold', 'hx-w', 2.2) +
        cal +
        '<div class="hx-rsvp hx-o" data-d="2.6"><i>ت</i><span><b>تفصيلة</b>سارة أكدت حضورها ✓</span></div>' +
        '<p class="hx-note hx-o" data-d="2">يوم ما بننساه 🤍</p>' +
        '<svg class="hx-spr hx-o" data-d=".8" viewBox="0 0 120 40" fill="none"><path d="M8 30C35 22 85 22 112 30" stroke="#8a6d55" stroke-width="1.2"/><g stroke="#7d9672" stroke-width="1.1"><ellipse cx="26" cy="20" rx="9" ry="3.4" transform="rotate(-28 26 20)"/><ellipse cx="48" cy="16" rx="9" ry="3.4" transform="rotate(-20 48 16)"/><ellipse cx="72" cy="16" rx="9" ry="3.4" transform="rotate(20 72 16)"/><ellipse cx="94" cy="20" rx="9" ry="3.4" transform="rotate(28 94 20)"/></g><circle cx="60" cy="23" r="3" fill="#7d9672"/></svg>' +
      '</div></div>';
    hero.insertAdjacentHTML('beforeend', html);
    hero.classList.add('hx-on');
    hero.querySelectorAll('.hx-card').forEach(function (c) { setInv(c, c.dataset.k); });
  }


  /* hero, centred: three arch frames like portraits (the middle one large), each holding one of our invitations.
     Every few seconds they turn to the next occasion — زفاف، خطوبة، تخرج، عيد ميلاد — with the name below and a live
     countdown, the way our invitations count down to the day. Olive and flowers wrap round the middle frame. */
  function decorateHeroArches() {
    var hero = document.querySelector('.hero'); if (!hero || hero.querySelector('.ha')) return;
    var OCC = [['wgold', 'زفاف'], ['ish', 'خطوبة وإشهار'], ['grad', 'تخرج'], ['bday', 'عيد ميلاد']];
    var AR = function (n) { return String(n).replace(/\d/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'[c]; }); };
    var leaf = function (x, y, r, s) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (11 * s) + '" ry="' + (4.2 * s) + '" transform="rotate(' + r + ' ' + x + ' ' + y + ')"/>'; };
    var bough = function (cls) {
      var l = ''; [[30, 150, -40, 1], [44, 128, 30, 1.1], [52, 104, -35, 1], [70, 86, 20, 1.15], [78, 62, -30, .95], [98, 48, 15, 1], [104, 26, -25, .85]].forEach(function (q) { l += leaf(q[0], q[1], q[2], q[3]); });
      return '<svg class="ha-bough ' + cls + '" viewBox="0 0 130 180" fill="none" aria-hidden="true"><path d="M20 172C40 130 60 96 112 18" stroke="#8a6d55" stroke-width="1.6" stroke-linecap="round"/><g fill="#a9bba2">' + l + '</g>' +
        '<g fill="#7d9672"><circle cx="58" cy="114" r="3.6"/><circle cx="86" cy="72" r="3.2"/></g>' +
        '<g transform="translate(26 160)"><circle r="11" fill="#f6cdd5"/><circle r="7" fill="#efb3bf"/><circle r="3.4" fill="#e08a9a"/></g>' +
        '<g transform="translate(46 172) scale(.6)"><circle r="11" fill="#dfe8f6"/><circle r="6" fill="#c3d3ec"/></g></svg>';
    };
    var frame = function (cls) { return '<figure class="ha-f ' + cls + '"><span class="ha-in"></span></figure>'; };
    hero.insertAdjacentHTML('beforeend',
      '<div class="ha">' +
        '<p class="ha-k">كل فرحة إلها تفصيلة</p>' +
        '<h1 class="ha-h">دعوة تشبه فرحتكم</h1>' +
        '<div class="ha-row">' + frame('ha-side ha-prev') +
          '<div class="ha-mid">' + bough('b1') + bough('b2') + frame('ha-main') + '</div>' +
          frame('ha-side ha-next') + '</div>' +
        '<div class="ha-rib"><i></i><span class="ha-occ">زفاف</span><i></i></div>' +
        '<div class="ha-cd" aria-label="عدّاد تنازلي"><div><b data-u="d">٤٢</b><small>يوم</small></div><div><b data-u="h">٢٠</b><small>ساعة</small></div><div><b data-u="m">٤٥</b><small>دقيقة</small></div><div><b data-u="s">١٦</b><small>ثانية</small></div></div>' +
      '</div>');
    hero.classList.add('ha-on');
    var cur = 0, fr = { prev: hero.querySelector('.ha-prev .ha-in'), main: hero.querySelector('.ha-main .ha-in'), next: hero.querySelector('.ha-next .ha-in') }, occ = hero.querySelector('.ha-occ');
    function put(host, k, instant) {
      var c = document.createElement('span'); c.className = 'ha-card'; host.appendChild(c); setInv(c, k);
      var olds = [].slice.call(host.querySelectorAll('.ha-card')).filter(function (o) { return o !== c; });
      if (instant) { olds.forEach(function (o) { o.remove(); }); c.classList.add('on'); return; }
      requestAnimationFrame(function () { requestAnimationFrame(function () { c.classList.add('on'); }); });
      setTimeout(function () { olds.forEach(function (o) { o.remove(); }); }, 1200);
    }
    function show(i, instant) {
      var n = OCC.length;
      put(fr.main, OCC[i][0], instant); put(fr.prev, OCC[(i + n - 1) % n][0], instant); put(fr.next, OCC[(i + 1) % n][0], instant);
      occ.classList.remove('on'); void occ.offsetWidth; occ.textContent = OCC[i][1]; occ.classList.add('on');
    }
    show(0, true);
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) setInterval(function () { if (hero.classList.contains('is-off') || document.hidden) return; cur = (cur + 1) % OCC.length; show(cur); }, 4200);
    var target = Date.now() + ((42 * 24 + 20) * 60 + 45) * 60000 + 16000, els = {};
    hero.querySelectorAll('.ha-cd b').forEach(function (b) { els[b.dataset.u] = b; });
    function tick() { var t = Math.max(0, target - Date.now()) / 1000; var v = { d: Math.floor(t / 86400), h: Math.floor(t / 3600) % 24, m: Math.floor(t / 60) % 60, s: Math.floor(t) % 60 };
      for (var u in v) { var txt = AR(v[u] < 10 && u !== 'd' ? '0' + v[u] : v[u]); if (els[u].textContent !== txt) els[u].textContent = txt; } }
    tick(); setInterval(tick, 1000);
  }


  /* hero prints: instead of the olive trees, four little polaroids lie beside the invitation — each a small
     animated illustration of one occasion (no real faces) with a handwritten caption, like keepsakes on a table */
  function decorateHeroPrints() {
    var st = document.querySelector('.hero'); if (!st || !st.querySelector('.hstage') || st.querySelector('.hp')) return;
    var SC = {
      wed: '<img class="hp-cp" src="img/couple.svg" alt="" decoding="async"><i class="hp-hrt">♥︎</i><i class="hp-hrt h2">♥︎</i>',
      eng: '<svg viewBox="0 0 120 100" class="hp-svg"><g class="hp-r1"><circle cx="50" cy="58" r="20" fill="none" stroke="#d8b56f" stroke-width="6"/><path d="M44 36l6-9 6 9z" fill="#e9f1ff" stroke="#b9c9e6"/></g><g class="hp-r2"><circle cx="72" cy="62" r="18" fill="none" stroke="#c9cdd6" stroke-width="5"/></g><g class="hp-sp" fill="#fff"><path d="M30 26l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M92 30l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/><path d="M86 82l1.2 3.2 3.2 1.2-3.2 1.2-1.2 3.2-1.2-3.2-3.2-1.2 3.2-1.2z"/></g></svg>',
      grad: '<svg viewBox="0 0 120 100" class="hp-svg"><g class="hp-cap"><path d="M20 40L60 24l40 16-40 16z" fill="#26324f"/><path d="M36 47v12c14 9 34 9 48 0V47L60 56z" fill="#1d2740"/><path d="M60 40Q82 44 88 50v14" fill="none" stroke="#b3202f" stroke-width="2.2"/><path d="M85 62h6l-1 9h-4z" fill="#b3202f"/></g><g class="hp-dip"><rect x="34" y="80" width="52" height="11" rx="5.5" fill="#fff" stroke="#e6d3a8"/><rect x="56" y="78" width="8" height="15" fill="#b3202f"/></g><g class="hp-sp" fill="#d8b56f"><path d="M18 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M100 18l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z"/></g></svg>',
      bday: '<svg viewBox="0 0 120 100" class="hp-svg"><g class="hp-bl"><ellipse cx="26" cy="30" rx="11" ry="13" fill="#f3b6c2"/><path d="M26 43q-3 14 3 30" fill="none" stroke="#c9a2ab"/></g><g class="hp-bl b2"><ellipse cx="96" cy="26" rx="10" ry="12" fill="#bcd0ee"/><path d="M96 38q3 14-3 32" fill="none" stroke="#a9b6ca"/></g><rect x="38" y="60" width="44" height="26" rx="4" fill="#fff" stroke="#f0c8d0"/><path d="M38 68q5.5 6 11 0t11 0 11 0 11 0" fill="none" stroke="#e08a9a" stroke-width="2"/><rect x="34" y="84" width="52" height="5" rx="2.5" fill="#f3d5dc"/><rect x="58" y="46" width="4" height="14" rx="1" fill="#bcd0ee"/><path class="hp-fl" d="M60 34c4 5 4 9 0 11-4-2-4-6 0-11z" fill="#f2b84b"/></svg>'
    };
    function pr(k, cls, cap) { return '<figure class="hp ' + cls + '"><span class="hp-ph hp-' + k + '">' + SC[k] + '</span><figcaption>' + cap + '</figcaption></figure>'; }
    var I = {
      card: '<rect x="6" y="4" width="20" height="26" rx="10 10 2 2"/><path d="M6 14c0-6 4.5-10 10-10s10 4 10 10"/><path d="M11 21h10M13 25h6"/>',
      env: '<rect x="3" y="8" width="26" height="18" rx="2"/><path d="M3 9l13 10L29 9"/><circle cx="16" cy="19" r="3" fill="currentColor" stroke="none" opacity=".35"/>',
      rings: '<circle cx="12" cy="19" r="7"/><circle cx="20" cy="19" r="7"/><path d="M10 9l2-4 2 4z"/>',
      cake: '<rect x="6" y="16" width="20" height="11" rx="2"/><path d="M6 20c2.5 2 5 2 7.5 0s5-2 7.5 0 3.5 2 5 0"/><path d="M16 9v7"/><path d="M16 4c1.6 2 1.6 3.6 0 4.6-1.6-1-1.6-2.6 0-4.6z"/>',
      ball: '<ellipse cx="16" cy="12" rx="7" ry="8.5"/><path d="M16 20.5l-1.5 2h3zM16 22.5c-2 3 2 5 0 8"/>',
      gift: '<rect x="5" y="13" width="22" height="15" rx="1.5"/><path d="M3 9h26v4H3zM16 9v19"/><path d="M16 9c-2-4-7-5-7-2s5 2 7 2zM16 9c2-4 7-5 7-2s-5 2-7 2z"/>',
      lights: '<path d="M2 8c6 8 22 8 28 0"/><path d="M8 12.6v2M16 14v2M24 12.6v2"/><path d="M6.5 15h3l.5 4a2 2 0 0 1-4 0zM14.5 16.4h3l.5 4a2 2 0 0 1-4 0zM22.5 15h3l.5 4a2 2 0 0 1-4 0z"/>',
      cap: '<path d="M2 12l14-6 14 6-14 6z"/><path d="M8 15v6c5 3 11 3 16 0v-6"/><path d="M27 13v7"/>',
      heart: '<path d="M16 27S5 20 5 12.5A5.5 5.5 0 0 1 16 10a5.5 5.5 0 0 1 11 2.5C27 20 16 27 16 27z"/>',
      baby: '<path d="M12 4h8v4h-8zM11 8h10l1 4v14a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3V12z"/><path d="M10 16h12M10 21h12"/>',
      cal: '<rect x="4" y="7" width="24" height="21" rx="2"/><path d="M4 13h24M10 4v6M22 4v6"/><circle cx="16" cy="20" r="3.5"/>',
      spark: '<path d="M16 3l2.5 8.5L27 14l-8.5 2.5L16 25l-2.5-8.5L5 14l8.5-2.5z"/>'
    };
    var ICONS = [['card', 24, 14, -8], ['heart', 34, 9, 10], ['rings', 29, 34, 6], ['lights', 27, 54, 0], ['heart', 31, 72, -10], ['cake', 27, 90, -6], ['spark', 4, 52, 0], ['heart', 12, 92, 8],
                 ['env', 76, 13, 8], ['heart', 66, 9, -8], ['ball', 71, 34, -6], ['gift', 73, 54, 6], ['heart', 70, 73, 12], ['cap', 73, 90, -8], ['baby', 96, 50, 10], ['cal', 88, 93, -4], ['spark', 60, 93, 0], ['heart', 4, 18, -6], ['heart', 96, 18, 8]];
    var ic = '<div class="hi" aria-hidden="true">' + ICONS.map(function (q, i) { return '<svg class="hi-i hi-' + q[0] + '" style="left:' + q[1] + '%;top:' + q[2] + '%;--r:' + q[3] + 'deg;animation-delay:-' + (i * .9).toFixed(1) + 's" viewBox="0 0 32 32">' + I[q[0]] + '</svg>'; }).join('') + '</div>';
    st.insertAdjacentHTML('beforeend', ic);
    /* the same little icons continue down the whole page, sparse and faint, only in the side margins */
    var site = document.createElement('div'); site.className = 'hi-site'; site.setAttribute('aria-hidden', 'true'); document.body.appendChild(site);
    var names = ['heart', 'rings', 'card', 'cake', 'heart', 'ball', 'env', 'gift', 'heart', 'cap', 'lights', 'baby', 'heart', 'cal', 'spark'];
    function lay() {
      var top = st.offsetTop + st.offsetHeight, H = document.documentElement.scrollHeight - top, step = innerWidth < 821 ? 520 : 380, html = '', n = 0;
      for (var y = 160; y < H - 120; y += step, n++) {
        var k = names[n % names.length], left = n % 2 === 0, x = left ? (2 + (n * 7) % 5) : (93 + (n * 5) % 5);
        html += '<svg class="hi-i hi-' + k + '" style="left:' + x + '%;top:' + (y + (n * 53) % 90) + 'px;--r:' + ((n * 17) % 24 - 12) + 'deg;animation-delay:-' + n + 's" viewBox="0 0 32 32">' + I[k] + '</svg>';
      }
      site.style.top = top + 'px'; site.style.height = H + 'px'; site.innerHTML = html;
    }
    lay(); var lt; new ResizeObserver(function () { clearTimeout(lt); lt = setTimeout(lay, 400); }).observe(document.body);
    st.insertAdjacentHTML('beforeend', pr('wed', 'hp-1', 'الحب بالجو') + pr('eng', 'hp-2', 'قالت نعم') + pr('grad', 'hp-3', 'فرحة التخرج') + pr('bday', 'hp-4', 'كل سنة وإنت سالم'));
  }


  /* the opened Ahmad & Manal invitation, made like a printed card: an arch window with the illustrated couple
     and a lace corner, script names joined by a heart, painted roses in the corners; the facing page is the
     evening's programme with little figures */
  function decorateBookCard() {
    var L = document.querySelector('.hero .hstage .fbase'), R = document.querySelector('.hero .hstage .fcv .fb');
    if (!L || !R || L.dataset.card) return; L.dataset.card = R.dataset.card = 1;
    function rose(x, y, r, c1, c2, rot) {
      var p = ''; for (var i = 0; i < 6; i++) p += '<ellipse cx="0" cy="' + (-r * .55) + '" rx="' + (r * .55) + '" ry="' + (r * .62) + '" transform="rotate(' + (i * 60) + ')" fill="' + c1 + '"/>';
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')">' + p + '<circle r="' + (r * .62) + '" fill="' + c2 + '"/><path d="M' + (-r * .3) + ' 0a' + (r * .3) + ' ' + (r * .3) + ' 0 1 1 ' + (r * .3) + ' ' + (r * .3) + 'a' + (r * .18) + ' ' + (r * .18) + ' 0 1 1 ' + (-r * .12) + ' ' + (-r * .28) + '" fill="none" stroke="#c76d80" stroke-width="' + (r * .08) + '"/></g>';
    }
    function lf(x, y, rot, c) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="9" ry="3.6" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="' + (c || '#9fb39a') + '"/>'; }
    var corner = function (cls) {
      return '<svg class="bc-ros ' + cls + '" viewBox="0 0 90 70" aria-hidden="true">' + lf(14, 52, -30) + lf(66, 22, 40) + lf(58, 50, 10, '#b7c6ad') + lf(30, 24, -60, '#b7c6ad') + lf(76, 40, 70) +
        '<circle cx="12" cy="36" r="3" fill="#a7b8dc"/><circle cx="18" cy="31" r="2.4" fill="#bcd0ee"/><circle cx="72" cy="58" r="2.6" fill="#a7b8dc"/>' +
        rose(44, 38, 15, '#f4c6cf', '#eaa9b6', 10) + rose(22, 50, 9, '#f8d8de', '#f0b9c4', -20) + rose(64, 30, 8, '#f8d8de', '#f0b9c4', 30) + '</svg>';
    };
    var lace = '<svg class="bc-lace" viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M4 56C4 30 30 4 56 4"/><path d="M14 50c-2-8 4-14 10-12s4 10-2 10"/><path d="M28 36c-1-8 6-12 11-9s2 9-3 8"/><path d="M40 22c1-7 8-9 11-5s-1 8-5 6"/><path d="M8 40c6-2 10 2 8 6"/><path d="M22 24c6-3 10 0 9 5"/></g><g fill="#fff"><circle cx="24" cy="44" r="2"/><circle cx="38" cy="30" r="2"/><circle cx="50" cy="16" r="2"/></g></svg>';
    L.innerHTML = '<div class="bc">' +
      '<div class="bc-win"><img src="img/couple.svg" alt="" class="bc-cp" decoding="async">' + lace + '<i class="bc-h">♥︎</i><i class="bc-h b">♥︎</i></div>' +
      '<small class="bc-fam">مع عائلتيهما</small>' +
      '<div class="bc-nm"><b>أحمد</b><i>♥︎</i><b>منال</b></div>' +
      '<small class="bc-inv">يتشرّفان بدعوتكم لمشاركتهما فرحة العمر</small>' +
      '<div class="bc-dt"><span>الخميس</span><b>١٣</b><span>فبراير ٢٠٢٧</span></div>' +
      '<small class="bc-v">قاعة الفرح · غزة</small>' +
      corner('tl') + corner('br') + '</div>';
    var fig = '<img src="img/couple.svg" alt="" class="bp-f" decoding="async">';
    var row = function (t, h, ic) { return '<li><span class="bp-ic">' + ic + '</span><b>' + t + '</b><time>' + h + '</time></li>'; };
    R.innerHTML = '<div class="bp">' +
      '<b class="bp-t">برنامج الحفل</b><i class="bp-orn"></i>' +
      '<ul>' + row('الاستقبال', '٧:٠٠ م', fig) + row('زفّة العرسان', '٨:٠٠ م', fig) + row('العشاء', '٩:٠٠ م', '<svg viewBox="0 0 32 32"><path d="M6 20h20M8 20a8 8 0 0 1 16 0M16 9v3M4 24h24"/></svg>') + row('قطع الكعكة', '١٠:٣٠ م', '<svg viewBox="0 0 32 32"><rect x="7" y="16" width="18" height="10" rx="2"/><path d="M7 19c3 2 6 2 9 0s6-2 9 0M16 9v7M16 5c1.4 1.8 1.4 3.2 0 4-1.4-.8-1.4-2.2 0-4z"/></svg>') + '</ul>' +
      '<p class="bp-n">فرحتنا بتكمل بوجودكم</p>' + corner('tr') + '</div>';
  }


  /* hero centre, two sides: one closed invitation card (arch window with the couple, script names, the date) and,
     beside it, a live countdown to the day with a little calendar marking it */
  function decorateHeroCard() {
    var st = document.querySelector('.hero .hstage'); if (!st || st.querySelector('.hc')) return;
    var AR = function (n) { return String(n).replace(/\d/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'[c]; }); };
    var curl = function (x, y, r, flip) { var f = flip ? -1 : 1; return 'M' + x + ' ' + y + 'c' + (f * r) + ' ' + (-r * .2) + ' ' + (f * r * 1.3) + ' ' + (r * .9) + ' ' + (f * r * .6) + ' ' + (r * 1.1) + 'c' + (f * -r * .5) + ' ' + (r * .15) + ' ' + (f * -r * .75) + ' ' + (-r * .4) + ' ' + (f * -r * .3) + ' ' + (-r * .6); };
    var lace = '<svg class="bc-lace" viewBox="0 0 80 200" aria-hidden="true"><defs><linearGradient id="bcG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8893b"/><stop offset=".45" stop-color="#f3dc96"/><stop offset="1" stop-color="#a9802f"/></linearGradient></defs>' +
      '<g fill="none" stroke="url(#bcG)" stroke-width="1.8" stroke-linecap="round">' +
      '<path d="M40 4C30 40 52 70 40 100S30 160 40 196"/>' +
      '<path d="' + curl(40, 30, 14, 0) + '"/><path d="' + curl(40, 30, 14, 1) + '"/>' +
      '<path d="' + curl(42, 70, 18, 0) + '"/><path d="' + curl(38, 82, 12, 1) + '"/>' +
      '<path d="' + curl(40, 118, 18, 1) + '"/><path d="' + curl(42, 130, 12, 0) + '"/>' +
      '<path d="' + curl(40, 166, 14, 0) + '"/><path d="' + curl(40, 166, 14, 1) + '"/>' +
      '<path d="M40 100c-14-6-22 2-18 10s14 4 10-4M40 100c14-6 22 2 18 10s-14 4-10-4"/></g>' +
      '<g fill="url(#bcG)"><path d="M40 92l5 8-5 8-5-8z"/><circle cx="40" cy="4" r="3"/><circle cx="40" cy="196" r="3"/></g></svg>';
    var days = '', first = 1; // 1 Feb 2027 is a Monday; week starts Saturday → offset 2
    for (var i = 0; i < 2; i++) days += '<li></li>';
    for (var d = 1; d <= 28; d++) days += '<li' + (d === 13 ? ' class="on"' : '') + '>' + AR(d) + (d === 13 ? '<i>♥︎</i>' : '') + '</li>';
    st.insertAdjacentHTML('beforeend',
      '<div class="hc">' +
        '<article class="hc-card"><div class="bc">' +
          '<div class="bc-win"><img src="img/couple.svg" alt="" class="bc-cp" decoding="async"><i class="bc-h">♥︎</i><i class="bc-h b">♥︎</i></div>' + lace +
          '<small class="bc-fam">بكل الحب، ومع عائلتيهما</small>' +
          '<div class="bc-nm"><b>أحمد</b><i>♥︎</i><b>منال</b></div>' +
          '<small class="bc-inv">يتشرّفان بدعوتكم لمشاركتهما فرحة العمر</small>' +
          '<div class="bc-dt"><span>الخميس</span><b>١٣ · ٠٢ · ٢٠٢٧</b><span>قاعة الفرح</span></div>' +
        '</div></article>' +
        '<aside class="hc-side">' +
          '<p class="hc-t">باقي على الفرح</p>' +
          '<div class="hc-cd"><div><b data-u="d"></b><small>يوم</small></div><div><b data-u="h"></b><small>ساعة</small></div><div><b data-u="m"></b><small>دقيقة</small></div><div><b data-u="s"></b><small>ثانية</small></div></div>' +
          '<div class="hc-cal"><b>فبراير ٢٠٢٧</b><ol>' + ['س','ح','ن','ث','ر','خ','ج'].map(function (x) { return '<li class="h">' + x + '</li>'; }).join('') + days + '</ol></div>' +
          '<p class="hc-n">عدّاد ورزنامة بكل دعوة، ليعرف ضيوفكم الموعد بلمسة 🤍</p>' +
        '</aside>' +
      '</div>');
    st.classList.add('hc-on');
    /* the card rises out of an open envelope sealed with wax */
    var card0 = st.querySelector('.hc-card');
    if (card0 && !card0.querySelector('.hc-in')) {
      var front = card0.querySelector('.bc'), inr = document.createElement('div'); inr.className = 'hc-in';
      var f1 = document.createElement('div'); f1.className = 'hc-face hc-front'; f1.appendChild(front);
      var ic = function (svg) { return '<span class="bp-ic"><svg viewBox="0 0 32 32">' + svg + '</svg></span>'; };
      var row = function (t, h, i) { return '<li>' + i + '<b>' + t + '</b><time>' + h + '</time></li>'; };
      var f2 = document.createElement('div'); f2.className = 'hc-face hc-back';
      var fig = '<img src="img/couple.svg" alt="" decoding="async">';
      var balloons = '<svg class="ls-bal" viewBox="0 0 40 30"><g fill="#f08aa0"><path d="M10 12C4 6 10 0 14 5c4-5 10 1 4 7l-4 4z"/><path d="M24 9c-5-5 0-10 4-6 4-4 9 1 4 6l-4 3z" fill="#f6b0bf"/><path d="M17 4c-3-3 0-6 2-4 2-2 5 1 2 4l-2 2z" fill="#e8667f"/></g><path d="M14 16l6 14M28 12l-8 18M19 6l1 24" stroke="#c9a2ab" stroke-width=".6" fill="none"/></svg>';
      var rings = '<svg class="ls-rg" viewBox="0 0 40 26" fill="none" stroke="#c9a35a" stroke-width="1.6"><circle cx="15" cy="15" r="9"/><circle cx="25" cy="15" r="9"/><path d="M13 5l2-4 2 4z" fill="#eef3fb" stroke="#b9c9e6"/></svg>';
      var ev = [['أول لقاء', 'يوليو ٢٠٢٢', balloons + fig], ['أول موعد', 'سبتمبر ٢٠٢٢', fig], ['بدأت الحكاية', 'فبراير ٢٠٢٣', fig], ['طلب الإيد', 'سبتمبر ٢٠٢٥', fig], ['الخطوبة', 'ديسمبر ٢٠٢٥', rings]];
      f2.innerHTML = '<div class="ls"><b class="ls-t">حكايتنا</b><ol>' + ev.map(function (e, i) {
          return '<li class="' + (i % 2 ? 'r' : 'l') + '"><span class="ls-ev">' + e[0] + '</span><span class="ls-fg' + (e[2] === rings ? ' rg' : '') + '">' + e[2] + '</span><span class="ls-dt">' + e[1] + '</span></li>';
        }).join('') + '</ol><p class="ls-end">والفرح ١٣ · ٠٢ · ٢٠٢٧</p></div>';
      inr.appendChild(f1); inr.appendChild(f2); card0.appendChild(inr);
      card0.insertAdjacentHTML('beforeend', '<span class="hc-hint">اضغطوا لفتح الدعوة</span>');
      card0.setAttribute('role', 'button'); card0.setAttribute('tabindex', '0'); card0.setAttribute('aria-label', 'افتح الدعوة');
      var flip = function () { card0.classList.toggle('open'); var e = card0.closest('.hc-env'); if (e) e.classList.toggle('flip', card0.classList.contains('open')); };
      card0.addEventListener('click', flip);
      card0.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    }
    if (card0 && !st.querySelector('.hc-env')) {
      var env = document.createElement('div'); env.className = 'hc-env';
      env.innerHTML = '<i class="env-bk"></i><i class="env-fl"></i>';
      card0.parentNode.insertBefore(env, card0); env.appendChild(card0);
      env.insertAdjacentHTML('beforeend', '<i class="env-pk"><b class="env-seal">ت</b></i><i class="hc-shine"></i>');
      /* a laser-cut lace gate (two dentelle panels) wraps the card, with a vellum band carrying the names */
      var INNER = 'M100 0C70 10 55 40 60 70C66 110 100 120 100 150C100 180 66 190 60 230C55 260 70 290 100 300';
      var SHAPE = 'M0 300V102A100 102 0 0 1 100 0C70 10 55 40 60 70C66 110 100 120 100 150C100 180 66 190 60 230C55 260 70 290 100 300Z';
      var ros = ''; for (var k = 0; k < 8; k++) ros += '<ellipse cx="13" cy="6.2" rx="1.9" ry="4.4" transform="rotate(' + (k * 45) + ' 13 13)"/>';
      var laceSvg = '<svg viewBox="0 0 100 300" preserveAspectRatio="none"><defs>' +
        '<pattern id="lcH" width="26" height="26" patternUnits="userSpaceOnUse"><g fill="#000">' + ros + '<circle cx="13" cy="13" r="1.8"/><path d="M0 -4C2 -1 2 2 0 4C-2 2 -2 -1 0 -4z"/><path d="M26 -4C28 -1 28 2 26 4C24 2 24 -1 26 -4z"/><path d="M0 22C2 25 2 28 0 30C-2 28 -2 25 0 22z"/><path d="M26 22C28 25 28 28 26 30C24 28 24 25 26 22z"/><circle cx="13" cy="0" r=".9"/><circle cx="0" cy="13" r=".9"/><circle cx="26" cy="13" r=".9"/><circle cx="13" cy="26" r=".9"/></g></pattern>' +
        '<mask id="lcM" maskUnits="userSpaceOnUse" x="-10" y="-10" width="130" height="320"><path d="' + SHAPE + '" fill="#fff"/>' +
        '<path d="' + INNER + '" fill="none" stroke="#fff" stroke-width="9" stroke-dasharray="0 7.5" stroke-linecap="round"/>' +
        '<rect x="0" y="0" width="100" height="300" fill="url(#lcH)"/>' +
        '<path d="' + INNER + '" fill="none" stroke="#fff" stroke-width="9"/>' +
        '<path d="' + INNER + '" fill="none" stroke="#000" stroke-width="1.8" stroke-dasharray="0 6" stroke-linecap="round" transform="translate(-2 0)"/>' +
        '<path d="M0 300V102A100 102 0 0 1 100 0" fill="none" stroke="#fff" stroke-width="7"/></mask></defs>' +
        '<rect x="-10" y="-10" width="130" height="320" fill="currentColor" mask="url(#lcM)"/></svg>';
      /* a white lace pocket holds the card; the card rises up out of it */
      var TOP = 'M0 10C20 10 40 26 60 26S100 10 120 10';
      var POCKET = TOP + 'V60H0Z';
      var pk = env.querySelector('.env-pk');
      pk.innerHTML = '<svg viewBox="0 0 120 60" preserveAspectRatio="none"><defs>' +
        '<pattern id="lpH" width="12" height="12" patternUnits="userSpaceOnUse"><g fill="#000">' +
          [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse cx="6" cy="3.1" rx=".75" ry="1.7" transform="rotate(' + a + ' 6 6)"/>'; }).join('') +
          '<circle cx="6" cy="6" r=".7"/><circle cx="0" cy="0" r=".55"/><circle cx="12" cy="0" r=".55"/><circle cx="0" cy="12" r=".55"/><circle cx="12" cy="12" r=".55"/></g></pattern>' +
        '<mask id="lpM" maskUnits="userSpaceOnUse" x="-4" y="0" width="128" height="64"><path d="' + POCKET + '" fill="#fff"/>' +
          '<path d="' + TOP + '" fill="none" stroke="#fff" stroke-width="4.4" stroke-dasharray="0 3.4" stroke-linecap="round"/>' +
          '<path d="M6 30C24 30 40 44 60 44S96 30 114 30V54H6Z" fill="url(#lpH)"/>' +
          '<path d="' + TOP + '" fill="none" stroke="#000" stroke-width=".9" stroke-dasharray="0 2.6" stroke-linecap="round" transform="translate(0 3.6)"/>' +
          '<path d="M10 22C26 22 42 36 60 36S94 22 110 22" fill="none" stroke="#000" stroke-width=".5"/></mask></defs>' +
        '<rect x="-4" y="0" width="128" height="64" fill="currentColor" mask="url(#lpM)"/></svg>';
      /* the envelope shows closed; after two seconds (or a tap) the flap opens and the card rises out */
      var opened = false, openEnv = function () { if (opened) return; opened = true; env.classList.add('open'); setTimeout(function () { env.classList.add('up'); }, 650); };
      env.addEventListener('click', function (e) { if (!opened) { e.stopPropagation(); openEnv(); } }, true);
      openEnv();
      /* the card tilts gently toward the pointer, like holding a real printed card */
      var hero = document.querySelector('.hero');
      if (hero && matchMedia('(hover: hover)').matches) {
        hero.addEventListener('pointermove', function (e) {
          var r = card0.getBoundingClientRect(), dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
          card0.style.setProperty('--ty', (-6 + dx * 22).toFixed(2) + 'deg'); card0.style.setProperty('--tx', (4 - dy * 14).toFixed(2) + 'deg');
          card0.style.setProperty('--gx', (50 + dx * 120).toFixed(1) + '%');
        });
        hero.addEventListener('pointerleave', function () { ['--tx', '--ty', '--gx'].forEach(function (v) { card0.style.removeProperty(v); }); });
      }
    }
    /* the couple are drawn inline so they can move: tap the groom and he kisses the bride */
    var cim = st.querySelector('.hc-card img.bc-cp');
    if (cim) fetch(cim.src).then(function (r) { return r.text(); }).then(function (t) {
      t = t.replace(/id="([^"]+)"/g, 'id="hc_$1"').replace(/url\(#([^)]+)\)/g, 'url(#hc_$1)').replace(/href="#([^"]+)"/g, 'href="#hc_$1"');
      var d = document.createElement('div'); d.className = 'bc-cp cv2-svg'; d.innerHTML = t; d.setAttribute('aria-hidden', 'true');
      cim.replaceWith(d);
      var gm = d.querySelector('.gm'), go = function () { d.classList.remove('kiss'); void d.offsetWidth; d.classList.add('kiss'); };
      d.querySelectorAll('.gm, .br').forEach(function (g) { g.style.cursor = 'pointer'; g.addEventListener('click', function (e) { e.stopPropagation(); go(); }); });
    }).catch(function () {});
    var hcx = st.querySelector('.hc'), side = hcx.querySelector('.hc-side'), cnt = document.createElement('div'); cnt.className = 'hc-count';
    cnt.appendChild(side.querySelector('.hc-t')); cnt.appendChild(side.querySelector('.hc-cd')); hcx.appendChild(cnt);
    var cal = side.querySelector('.hc-cal'); cal.classList.add('hc-calw'); document.querySelector('.hero').appendChild(cal); side.remove();
    var target = Date.now() + ((84 * 24 + 6) * 60 + 30) * 60000, els = {};
    st.querySelectorAll('.hc-cd b').forEach(function (b) { els[b.dataset.u] = b; });
    function tick() { var t = Math.max(0, target - Date.now()) / 1000; var v = { d: Math.floor(t / 86400), h: Math.floor(t / 3600) % 24, m: Math.floor(t / 60) % 60, s: Math.floor(t) % 60 };
      for (var u in v) { var x = AR(v[u] < 10 && u !== 'd' ? '0' + v[u] : v[u]); if (els[u].textContent !== x) els[u].textContent = x; } }
    tick(); setInterval(tick, 1000);
    var w = st.parentElement;
    if (w && !w.querySelector('.hx-mark')) w.insertAdjacentHTML('beforeend', '<h2 class="hx-mark">دعوة تشبه فرحتكم</h2>');
  }


  /* blossom branches that cross from one section into the next, tying the page together, and a vertical
     calligraphy line on the side of each section */
  function decorateBlossoms() {
    if (document.querySelector('.bl-br')) return;
    var ids = ['designs', 'packages', 'how', 'faq', 'contact'];
    if (!ids.every(function (id) { return document.getElementById(id); })) return;
    function flower(x, y, r, rot, k) {
      var p = '', i;
      for (i = 0; i < 5; i++) p += '<path d="M0 0C' + (-r * .55) + ' ' + (-r * .35) + ' ' + (-r * .5) + ' ' + (-r * 1.05) + ' 0 ' + (-r) + 'C' + (r * .5) + ' ' + (-r * 1.05) + ' ' + (r * .55) + ' ' + (-r * .35) + ' 0 0z" transform="rotate(' + (i * 72) + ')" fill="url(#blP' + k + ')"/>';
      var st = ''; for (i = 0; i < 7; i++) { var a = i * 51 * Math.PI / 180; st += '<line x1="0" y1="0" x2="' + (Math.cos(a) * r * .42).toFixed(1) + '" y2="' + (Math.sin(a) * r * .42).toFixed(1) + '"/><circle cx="' + (Math.cos(a) * r * .44).toFixed(1) + '" cy="' + (Math.sin(a) * r * .44).toFixed(1) + '" r="' + (r * .05).toFixed(1) + '"/>'; }
      return '<g class="bl-f" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')">' + p + '<circle r="' + (r * .2) + '" fill="#d9677e"/><g stroke="#b8475f" stroke-width=".7" fill="#c9506a">' + st + '</g></g>';
    }
    function bud(x, y, rot) { return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><ellipse cx="0" cy="-5" rx="3.6" ry="6" fill="#f2a9b8"/><path d="M-3 -1q3 4 6 0" fill="#9fb39a"/></g>'; }
    function leaf(x, y, rot) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="10" ry="3.8" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="#a9bba2" opacity=".85"/>'; }
    var defs = '<defs><radialGradient id="blP0" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#e98aa0"/><stop offset=".45" stop-color="#f6c3cf"/><stop offset="1" stop-color="#fff1f4"/></radialGradient>' +
      '<radialGradient id="blP1" cx=".5" cy=".9" r=".9"><stop offset="0" stop-color="#e07e96"/><stop offset=".5" stop-color="#f3b4c3"/><stop offset="1" stop-color="#fde6ec"/></radialGradient></defs>';
    var branch = '<svg viewBox="0 0 420 300" aria-hidden="true">' + defs +
      '<path d="M0 40C80 60 140 90 200 140S320 230 420 250" fill="none" stroke="#7a5a4a" stroke-width="4.5" stroke-linecap="round"/>' +
      '<path d="M150 104C170 70 196 52 236 44" fill="none" stroke="#7a5a4a" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M262 186C268 150 290 126 322 112" fill="none" stroke="#7a5a4a" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M88 64C92 92 84 112 70 128" fill="none" stroke="#7a5a4a" stroke-width="2" stroke-linecap="round"/>' +
      leaf(118, 84, 30) + leaf(214, 50, -20) + leaf(300, 214, 40) + leaf(340, 126, -30) + leaf(76, 114, 70) +
      flower(236, 44, 20, 10, 0) + flower(206, 60, 15, -30, 1) + flower(170, 120, 22, 20, 0) + flower(130, 92, 14, 40, 1) +
      flower(322, 112, 18, -15, 0) + flower(290, 132, 13, 30, 1) + flower(258, 182, 20, 0, 0) + flower(360, 236, 16, 25, 1) +
      flower(70, 128, 15, 10, 0) + flower(40, 50, 13, -20, 1) +
      bud(250, 30, 30) + bud(340, 100, 60) + bud(96, 140, -40) + bud(392, 246, 80) + bud(186, 152, 140) + '</svg>';
    var words = { designs: 'تصاميم من القلب', packages: 'كل التفاصيل علينا', how: 'خطوة بخطوة', faq: 'على بالكم', contact: 'فرحتكم بتستنّى' };
    ids.forEach(function (id, i) {
      var sec = document.getElementById(id), side = i % 2 ? 'l' : 'r';
      sec.classList.add('bl-sec');
      sec.insertAdjacentHTML('afterbegin', '<span class="bl-br bl-' + side + '" aria-hidden="true">' + branch + '</span>' +
        '<span class="bl-vt bl-vt-' + (side === 'r' ? 'l' : 'r') + '" aria-hidden="true">' + words[id] + '</span>');
    });
  }


  /* hero: switch the occasion right from the card. The card turns on its edge, comes back as the new occasion,
     and the light of the hero shifts to that occasion's colour */
  function decorateHeroOccasions() {
    var env = document.querySelector('.hero .hc-env'), card = env && env.querySelector('.hc-card');
    if (!card || document.querySelector('.hero .ho')) return;
    var win = card.querySelector('.hc-front .bc-win'), bc = card.querySelector('.hc-front .bc');
    if (!win || !bc) return;
    var coupleNode = null;
    var ART = {
      eng: '<svg class="ho-art" viewBox="0 0 120 110"><g class="ho-r1"><circle cx="50" cy="66" r="24" fill="none" stroke="#d6b062" stroke-width="7"/><path d="M42 40l8-12 8 12z" fill="#eef4ff" stroke="#b9c9e6"/></g><g class="ho-r2"><circle cx="76" cy="70" r="22" fill="none" stroke="#c7ccd6" stroke-width="6"/></g><g fill="#d6b062" class="ho-sp"><path d="M24 28l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/><path d="M98 34l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z"/><path d="M92 96l1.2 3.2 3.2 1.2-3.2 1.2-1.2 3.2-1.2-3.2-3.2-1.2 3.2-1.2z"/></g></svg>',
      grad: '<svg class="ho-art" viewBox="0 0 120 110"><g class="ho-cap"><path d="M14 46L60 28l46 18-46 18z" fill="#26324f"/><path d="M32 54v14c16 10 40 10 56 0V54L60 64z" fill="#1d2740"/><path d="M60 46Q86 50 92 56v16" fill="none" stroke="#b3202f" stroke-width="2.6"/><path d="M89 70h7l-1 11h-5z" fill="#b3202f"/></g><rect x="30" y="88" width="60" height="12" rx="6" fill="#fff" stroke="#e6d3a8"/><rect x="56" y="86" width="8" height="16" fill="#b3202f"/></svg>',
      bday: '<svg class="ho-art" viewBox="0 0 120 110"><g class="ho-bl"><ellipse cx="24" cy="32" rx="12" ry="14" fill="#f3b6c2"/><path d="M24 46q-3 16 3 34" fill="none" stroke="#c9a2ab"/></g><g class="ho-bl b2"><ellipse cx="98" cy="28" rx="11" ry="13" fill="#bcd0ee"/><path d="M98 41q3 16-3 36" fill="none" stroke="#a9b6ca"/></g><rect x="36" y="64" width="48" height="30" rx="5" fill="#fff" stroke="#f0c8d0"/><path d="M36 73q6 7 12 0t12 0 12 0 12 0" fill="none" stroke="#e08a9a" stroke-width="2.2"/><rect x="32" y="92" width="56" height="6" rx="3" fill="#f3d5dc"/><rect x="58" y="48" width="4" height="16" rx="1" fill="#bcd0ee"/><path class="ho-fl" d="M60 34c5 6 5 10 0 13-5-3-5-7 0-13z" fill="#f2b84b"/></svg>'
    };
    var OCC = {
      wed: { k: 'زفاف', fam: 'بكل الحب، ومع عائلتيهما', n: ['أحمد', 'منال'], inv: 'يتشرّفان بدعوتكم لمشاركتهما فرحة العمر', d: ['الخميس', '١٣ · ٠٢ · ٢٠٢٧', 'قاعة الفرح'] },
      eng: { k: 'خطوبة', fam: 'بفرحة كبيرة، ومع عائلتيهما', n: ['نور', 'يزن'], inv: 'يسعدنا دعوتكم لمشاركتنا حفل خطوبتنا', d: ['الجمعة', '٠٢ · ٠٧ · ٢٠٢٧', 'حديقة الورد'] },
      grad: { k: 'تخرج', fam: 'بكل فخر واعتزاز', n: ['ريم خالد'], inv: 'تدعوكم لمشاركتها فرحة التخرج · دفعة ٢٠٢٧', d: ['الخميس', '٢٤ · ٠٦ · ٢٠٢٧', 'مسرح الجامعة'] },
      bday: { k: 'عيد ميلاد', fam: 'تعالوا نحتفل سوا', n: ['جود'], inv: 'بعيد ميلادها الخامس، والكيكة بتستنّاكم', d: ['السبت', '١٤ · ٠٥ · ٢٠٢٧', 'بيت العيلة'] }
    };
    var hero = document.querySelector('.hero'), cur = 'wed';
    var tint = document.createElement('i'); tint.className = 'ho-tint'; tint.setAttribute('aria-hidden', 'true'); hero.insertBefore(tint, hero.firstChild);
    var bar = document.createElement('div'); bar.className = 'ho'; bar.setAttribute('role', 'tablist');
    bar.innerHTML = Object.keys(OCC).map(function (k) { return '<button type="button" role="tab" data-o="' + k + '"' + (k === cur ? ' aria-selected="true"' : '') + '>' + OCC[k].k + '</button>'; }).join('<i></i>');
    env.parentNode.insertBefore(bar, env.nextSibling);
    hero.dataset.occ = cur;
    function fill(k) {
      var o = OCC[k];
      if (!coupleNode) coupleNode = win.querySelector('.bc-cp');
      win.querySelectorAll('.ho-art').forEach(function (a) { a.remove(); });
      if (k === 'wed') { if (coupleNode) coupleNode.style.display = ''; }
      else { if (coupleNode) coupleNode.style.display = 'none'; win.insertAdjacentHTML('beforeend', ART[k === 'eng' ? 'eng' : k]); }
      bc.querySelector('.bc-fam').textContent = o.fam;
      bc.querySelector('.bc-nm').innerHTML = o.n.length > 1 ? '<b>' + o.n[0] + '</b><i>♥︎</i><b>' + o.n[1] + '</b>' : '<b>' + o.n[0] + '</b>';
      bc.querySelector('.bc-inv').textContent = o.inv;
      bc.querySelector('.bc-dt').innerHTML = '<span>' + o.d[0] + '</span><b>' + o.d[1] + '</b><span>' + o.d[2] + '</span>';
      card.dataset.occ = k;
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.o === cur) return;
      cur = b.dataset.o; hero.dataset.occ = cur;
      bar.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      card.classList.remove('open'); env.classList.remove('flip');
      card.classList.add('turn');
      setTimeout(function () { fill(cur); card.classList.remove('turn'); card.classList.add('turned'); setTimeout(function () { card.classList.remove('turned'); }, 600); }, 420);
    });
    /* the love story on the back belongs to the wedding; other occasions keep their front */
    card.addEventListener('click', function (e) { if (card.dataset.occ && card.dataset.occ !== 'wed') { e.stopImmediatePropagation(); } }, true);
  }


  /* section headings, written in ink: a gold opening word above, the section's number large and faint behind,
     and the calligraphy drawn in from right to left like a pen signing, once, when it comes into view */
  function decorateInkHeadings() {
    var M = { designs: ['بكل حب', '١'], packages: ['من القلب', '٢'], how: ['خطوة بخطوة', '٣'], faq: ['على بالكم', '٤'], contact: ['فرحتكم بتستنّى', '٥'] };
    Object.keys(M).forEach(function (id) {
      var h = document.querySelector('#' + id + ' h2'); if (!h || h.dataset.ink) return; h.dataset.ink = 1;
      var txt = h.textContent.trim();
      h.classList.add('ink');
      h.innerHTML = '<span class="ink-k">' + M[id][0] + '</span><span class="ink-n" aria-hidden="true">' + M[id][1] + '</span><span class="ink-t">' + txt + '<i class="ink-pen" aria-hidden="true"></i></span>'+'<svg class="ink-sw" viewBox="0 0 220 26" aria-hidden="true"><path pathLength=\"1\" d=\"M216 15C180 9 140 20 100 16S50 10 26 16\"/><path class=\"h\" d=\"M14 22C5 16 3 9 8 6.5 11 5 13.5 7 14 9.5 14.5 7 17 5 20 6.5 25 9 23 16 14 22Z\"/></svg>';
      if (!('IntersectionObserver' in window) || reduce) { h.classList.add('ink-on'); return; }
      new IntersectionObserver(function (es, o) { es.forEach(function (e) { if (e.isIntersecting) { h.classList.add('ink-on'); o.disconnect(); } }); }, { threshold: .6 }).observe(h);
    });
  }


  /* the invitation travels with you: once the hero's card leaves the screen, a small copy of it flies to the
     side and keeps you company through the page — chosen, priced, prepared — and at the end it is sent off
     into the WhatsApp chat */
  function decorateCompanion() {
    if (document.querySelector('.cmp') || innerWidth < 1180 || reduce) return;
    var heroCard = document.querySelector('.hero .hc-card'), ids = ['designs', 'packages', 'how', 'faq', 'contact'];
    if (!heroCard || !ids.every(function (i) { return document.getElementById(i); })) return;
    var LBL = { designs: 'اختاروا تصميمكم', packages: 'دعوة كاملة · ٥٠ ₪', how: 'عم نجهّزها لكم', faq: 'عندكم سؤال؟', contact: 'جاهزة للإرسال' };
    var c = document.createElement('a'); c.className = 'cmp'; c.href = '#contact'; c.setAttribute('aria-label', 'اطلبوا دعوتكم');
    c.innerHTML = '<span class="cmp-card"><span class="cmp-win"><img src="img/couple.svg" alt=""></span><b>أحمد <i>♥︎</i> منال</b><small>١٣ · ٠٢ · ٢٠٢٧</small></span><span class="cmp-l"></span>';
    document.body.appendChild(c);
    var lbl = c.querySelector('.cmp-l'), state = '', shown = false;
    function show(on) {
      if (on === shown) return; shown = on;
      if (on) {
        var r = heroCard.getBoundingClientRect(), d = c.getBoundingClientRect();
        c.classList.add('on');
        var to = c.getBoundingClientRect();
        c.animate([{ transform: 'translate(' + (r.left + r.width / 2 - (to.left + to.width / 2)) + 'px,' + (r.top + r.height / 2 - (to.top + to.height / 2)) + 'px) scale(2.6) rotate(-4deg)', opacity: .2 },
                   { transform: 'none', opacity: 1 }], { duration: 900, easing: 'cubic-bezier(.2,.75,.2,1)' });
      } else c.classList.remove('on');
    }
    function set(id) {
      if (id === state) return; state = id; c.dataset.s = id;
      lbl.classList.remove('in'); void lbl.offsetWidth; lbl.textContent = LBL[id] || ''; lbl.classList.add('in');
      c.querySelector('.cmp-card').animate([{ transform: 'rotate(-8deg) scale(.92)' }, { transform: 'rotate(4deg) scale(1.04)' }, { transform: 'none' }], { duration: 650, easing: 'ease-out' });
    }
    new IntersectionObserver(function (es) { es.forEach(function (e) { show(!e.isIntersecting); }); }, { threshold: 0 }).observe(heroCard);
    var vis = {};
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { vis[e.target.id] = e.intersectionRatio; });
      var best = ids.reduce(function (a, b) { return (vis[b] || 0) > (vis[a] || 0) ? b : a; }, ids[0]);
      if ((vis[best] || 0) > 0) set(best);
    }, { threshold: [0, .15, .3, .5, .7] });
    ids.forEach(function (i) { io.observe(document.getElementById(i)); });
    /* at the end: sent into the chat */
    var wa = document.querySelector('#contact .ct-wa'), sent = false;
    if (wa) new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > .6 && !sent && shown) {
          sent = true; var a = c.getBoundingClientRect(), b = wa.getBoundingClientRect();
          c.classList.add('sent');
          c.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (b.left + b.width * .7 - a.left - a.width / 2) + 'px,' + (b.top + b.height * .55 - a.top - a.height / 2) + 'px) scale(.35) rotate(10deg)', opacity: 0 }],
            { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)', fill: 'forwards' });
        } else if (!e.isIntersecting && sent) { sent = false; c.classList.remove('sent'); c.getAnimations().forEach(function (an) { an.cancel(); }); }
      });
    }, { threshold: [0, .6] }).observe(wa);
  }

  function scan() { decorateInkHeadings(); decorateBlossoms(); decorateHeroPrints(); decorateHeroCard(); decorateHeroOccasions(); decorateCompanion(); decoratePerf(); decorateTagSwing(); decorateEdges(); inlineCouple(); decorateContactEnv(); decorateOliveFall(); decorateHow(); decorateScreens(); fitShowcase(); decorateBook(); decorateBookCard(); decorateHeroMotion(); decorateHeroStage(); decorateOrder(); decorateInvites(); decorateShowcase(); decoratePrice(); decoratePreviews(); decorateContact(); decorateFooter(); decorateAmbient(); decorateFaq(); decorateChrome(); }
  var root = document.getElementById('root') || document.body;
  /* run the decorators at most once per frame, however many DOM changes arrive */
  var scanQueued = false;
  new MutationObserver(function () { if (scanQueued) return; scanQueued = true; requestAnimationFrame(function () { scanQueued = false; scan(); }); }).observe(root, { childList: true, subtree: true });
  scan();
  onScroll();
})();
