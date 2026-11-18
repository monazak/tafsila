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
    acts.insertAdjacentHTML('afterend', '<p class="ct-num">أو راسلونا مباشرة على <a href="https://wa.me/' + wa + '" target="_blank" rel="noopener" dir="ltr">' + pretty + '</a></p>');
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
    var cards = [].slice.call(grid.querySelectorAll('.dc'));
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
    wgold: { t: 'بكل الحب ندعوكم لحضور حفل زفاف', n: ['ليان', 'آدم'], d: 'الخميس ١٢ آب ٢٠٢٧', v: 'قاعة الياسمين', seal: 1, em: 'rings' },
    wrose: { t: 'بكل الحب ندعوكم لحضور حفل زفاف', n: ['سلمى', 'عمر'], d: 'الجمعة ٩ تموز ٢٠٢٧', v: 'قاعة الورد', seal: 1, em: 'rings' },
    wsage: { t: 'بكل الحب ندعوكم لحضور حفل زفاف', n: ['ريم', 'كريم'], d: 'الجمعة ٢٠ آب ٢٠٢٧', v: 'حديقة الزيتون', seal: 1, em: 'rings' },
    ish:   { t: 'يسعدنا دعوتكم لحفل إشهار زواج', n: ['نور', 'يزن'], d: 'الجمعة ٢ تموز ٢٠٢٧', v: 'حديقة الورد', em: 'ring' },
    grad:  { t: 'بكل فخر ندعوكم لحفل تخرج', n: ['ريم خالد'], s: 'دفعة ٢٠٢٧', d: 'الخميس ٢٤ حزيران ٢٠٢٧', band: 1, em: 'cap' },
    bday:  { t: 'تعالوا نحتفل بعيد ميلاد', n: ['جود'], s: 'خمس سنين من الفرح', d: 'السبت ١٤ أيار ٢٠٢٧', em: 'balloon' }
  };
  function invHTML(k) {
    if (k === 'grad') return '<div class="inv inv-g" aria-hidden="true">' +
      '<div class="g-top"><i class="g-cap"></i><span>حفل تخرج</span></div>' +
      '<span class="inv-t">بكل فخر ندعوكم لمشاركتنا فرحة تخرج</span>' +
      '<span class="inv-n">ريم خالد</span><span class="g-cls">دفعة ٢٠٢٧</span>' +
      '<i class="inv-d"></i><span class="inv-dt">الخميس ٢٤ حزيران ٢٠٢٧</span><span class="inv-v">مسرح الجامعة</span>' +
      '<i class="g-ros"></i></div>';
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
    document.querySelectorAll('#designs .grid .dc').forEach(function (d) {
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
    var dc = document.querySelector('#designs .grid .dc'), sec = document.getElementById('designs');
    if (!dc || !sec || !sec.querySelector('.cathead')) return;
    dc.style.zoom = 1;
    if (innerWidth < 900) return;
    var top = dc.getBoundingClientRect().top - sec.getBoundingClientRect().top;
    var avail = innerHeight - top - 24, h = dc.offsetHeight;
    var z = Math.max(.7, Math.min(1, avail / h));
    dc.style.zoom = z.toFixed(3);
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
      '<div class="ph-v v1"><div class="ph-top">واتساب · تفصيلة</div><div class="ph-chat"><div class="ph-msg m1"><b>أحمد و منال</b><span>الخميس ١٣ شباط ٢٠٢٧</span></div><div class="ph-msg m2"><span>قاعة الفرح · غزة</span></div><div class="ph-msg m3"><span>بدنا اللون الوردي لو سمحتوا 🌸</span></div><div class="ph-rsvp r0">وصلتنا بياناتكم ✓</div></div></div>' +
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
      var th = e.target.closest('.ph-th'); if (th && cur === 0) { x.querySelectorAll('.ph-th').forEach(function (t) { t.classList.toggle('on', t === th); }); return; }
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
  function scan() { decoratePerf(); decorateTagSwing(); decorateEdges(); inlineCouple(); decorateContactEnv(); decorateOliveFall(); decorateHow(); fitShowcase(); decorateBook(); decorateHeroMotion(); decorateHeroStage(); decorateOrder(); decorateInvites(); decorateShowcase(); decoratePrice(); decoratePreviews(); decorateContact(); decorateFooter(); decorateAmbient(); decorateFaq(); decorateChrome(); }
  var root = document.getElementById('root') || document.body;
  /* run the decorators at most once per frame, however many DOM changes arrive */
  var scanQueued = false;
  new MutationObserver(function () { if (scanQueued) return; scanQueued = true; requestAnimationFrame(function () { scanQueued = false; scan(); }); }).observe(root, { childList: true, subtree: true });
  scan();
  onScroll();
})();
