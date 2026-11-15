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
    if (!cta || cta.querySelector('.chat')) return;
    var pts = document.createElement('div');
    pts.className = 'cpts';
    pts.innerHTML = '<span>نرد عليكم على واتساب</span><span>معاينة قبل التسليم</span><span>رابط خاص لضيوفكم</span>';
    cta.appendChild(pts);
    var chat = document.createElement('div');
    chat.className = 'chat';
    chat.setAttribute('aria-hidden', 'true');
    chat.innerHTML =
      '<div class="chat-h"><span class="av"><i class="lg"></i></span><div><b>تفصيلة</b><small>متصل الآن</small></div></div>' +
      '<div class="chat-b">' +
        '<div class="m me">مرحباً، بدنا دعوة لعرسنا الشهر الجاي<time>٩:٤١</time></div>' +
        '<div class="m us">أهلاً وسهلاً، وألف مبروك! أي تصميم عجبكم؟<time>٩:٤٢</time></div>' +
        '<div class="m me">ذهب كلاسيك، مع الباقة المميزة<time>٩:٤٢</time></div>' +
        '<div class="typing"><i></i><i></i><i></i></div>' +
      '</div>';
    cta.appendChild(chat);
    if (reduce || !chatIO) chat.classList.add('play'); else chatIO.observe(chat);
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
    var tiltSel = '#packages .pc, #packages .pk1, #designs .ctile';
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
    ['كيف بتوصل الدعوة لضيوفنا؟', 'بنجهزلكم رابط خاص للدعوة، بتبعتوه لضيوفكم على واتساب أو أي تطبيق، وبيفتح مباشرة على الجوال بدون تحميل أي شي.'],
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
    var hd = document.createElement('div'); hd.className = 'faq-side';
    var w0 = sec.querySelector('.w'); var t = w0.querySelector('h2'), sb = w0.querySelector('.sub');
    hd.appendChild(t); hd.appendChild(sb);
    hd.insertAdjacentHTML('beforeend', '<button type="button" class="btn faq-wa">احكولنا على واتساب</button>');
    hd.querySelector('.faq-wa').addEventListener('click', function () { var b = document.querySelector('.cta-n'); if (b) b.click(); });
    w0.insertBefore(hd, w0.firstChild);
    pk.parentNode.insertBefore(sec, pk.nextSibling);
    var l = sec.querySelector('.faq-l');
    if (reduce || !faqIO) l.classList.add('on'); else faqIO.observe(l);
  }

  /* 7. floating order button, scroll progress, header that steps aside */
  function decorateChrome() {
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
          '<p class="pk1-n">والسعر النهائي بيعتمد على التصميم والميزات اللي بتختاروها.</p></div>' +
        '<div class="pk1-r"><h3>كل اللي بتحتاجوه لدعوتكم</h3><ul class="pk1-f">' +
          '<li>تصميم جاهز أو خاص حسب طلبكم</li><li>عدّاد تنازلي للموعد</li><li>رابط خاص لضيوفكم</li>' +
          '<li>تأكيد الحضور عبر واتساب</li><li>تعديل على النصوص والألوان</li><li>دومين خاص وحركات مخصصة</li></ul>' +
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
      setTimeout(function () { bypass = true; send.click(); setTimeout(function () { setVal(rt, userNotes || ''); userNotes = null; }, 300); }, 60);
    }, true);
  }


  /* 12. hero: one invitation under an illustrated cover you slide up */
  function decorateReveal() {
    var st = document.querySelector('.hero .hstage');
    if (!st || st.querySelector('.ivr')) return;
    var fb = st.querySelector('.fbase'), back = st.querySelector('.fcv .fb .fn');
    var fts = fb ? [].slice.call(fb.querySelectorAll('.ft')).map(function (e) { return e.textContent; }) : [];
    var fn = fb && fb.querySelector('.fn') ? fb.querySelector('.fn').textContent : 'أحمد و منال';
    var img = st.querySelector('.ffimg img'), src = img ? img.getAttribute('src') : 'img/invite.jpg';
    var parts = fn.split(/\s+و\s+/);
    st.classList.add('ivr-on');
    var w = document.createElement('div'); w.className = 'ivr';
    w.innerHTML =
      '<div class="ivr-card" role="group" aria-label="دعوة زفاف ' + fn + '">' +
        '<div class="ivr-page">' +
          '<span class="ivr-t">' + (fts[0] || 'بكل الحب ندعوكم لحضور حفل زفاف') + '</span>' +
          '<span class="ivr-n">' + (parts[0] || fn) + '</span>' + (parts[1] ? '<span class="ivr-and">و</span><span class="ivr-n">' + parts[1] + '</span>' : '') +
          '<i class="ivr-d"></i><span class="ivr-dt">' + (fts[1] || '') + '</span><span class="ivr-v">' + (fts[2] || '') + '</span>' +
          '<span class="ivr-q">' + (back ? back.textContent : 'فرحتنا بتكمل بوجودكم') + '</span>' +
        '</div>' +
        '<div class="ivr-cover"><img src="' + src + '" alt="" draggable="false"><span class="ivr-shine"></span>' +
          '<span class="ivr-tab"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg><b>اسحبوا الغلاف لفوق</b></span></div>' +
      '</div>' +
      '<button type="button" class="ivr-btn" aria-expanded="false">افتح الدعوة</button>';
    st.appendChild(w);
    var card = w.querySelector('.ivr-card'), cov = w.querySelector('.ivr-cover'), btn = w.querySelector('.ivr-btn'), tab = w.querySelector('.ivr-tab b');
    var open = false, drag = null, MAXF = .9;
    function setP(p, anim) {
      cov.style.transition = anim ? '' : 'none';
      cov.style.transform = 'translateY(' + (-p * MAXF * 100) + '%)';
      card.style.setProperty('--p', p.toFixed(3));
    }
    function setOpen(o) {
      open = o; card.classList.toggle('open', o); setP(o ? 1 : 0, true);
      btn.textContent = o ? 'سكّر الدعوة' : 'افتح الدعوة'; btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      tab.textContent = o ? 'اسحبوا لتحت للغلاف' : 'اسحبوا الغلاف لفوق';
    }
    btn.addEventListener('click', function () { setOpen(!open); w.classList.add('touched'); });
    cov.addEventListener('pointerdown', function (e) {
      if (e.button > 0) return;
      drag = { y: e.clientY, h: cov.offsetHeight, p0: open ? 1 : 0, p: open ? 1 : 0, on: false, t: performance.now(), id: e.pointerId };
    });
    cov.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.y;
      if (!drag.on) { if (Math.abs(dy) < 6) return; drag.on = true; w.classList.add('touched'); try { cov.setPointerCapture(e.pointerId); } catch (_) {} }
      drag.p = Math.max(0, Math.min(1, drag.p0 - dy / (drag.h * MAXF)));
      setP(drag.p, false); e.preventDefault();
    });
    function end(e) {
      if (!drag) return; var d = drag; drag = null;
      if (!d.on) { setOpen(!open); w.classList.add('touched'); return; }
      var v = (d.p - d.p0) / Math.max(1, performance.now() - d.t) * 1000;
      setOpen(Math.abs(v) > 1.2 ? v > 0 : d.p > .4);
    }
    cov.addEventListener('pointerup', end); cov.addEventListener('pointercancel', end);
    if (!reduce) setTimeout(function () { if (!w.classList.contains('touched')) w.classList.add('nudge'); }, 1800);
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
    if (ff && !ff.querySelector('.cv-seal')) ff.insertAdjacentHTML('beforeend', '<span class="cv-ribbon" aria-hidden="true"></span><span class="cv-seal" aria-hidden="true">ت</span>');
    var n = fb.querySelector('.fn'), parts = n ? n.textContent.split(/\s+و\s+/) : [];
    fb.insertAdjacentHTML('afterbegin', '<span class="bk-sprig" aria-hidden="true"></span>');
    fb.insertAdjacentHTML('beforeend', '<span class="bk-rose" aria-hidden="true"></span>');
    var a = (parts[0] || 'أ').trim().charAt(0), b = (parts[1] || 'م').trim().charAt(0);
    rb.insertAdjacentHTML('afterbegin', '<span class="bk-mono" aria-hidden="true"><b>' + a + '</b><i>&amp;</i><b>' + b + '</b></span>');
    rb.insertAdjacentHTML('beforeend', '<span class="bk-rose r" aria-hidden="true"></span>');
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

  function scan() { decorateBook(); decorateHeroMotion(); decorateHeroStage(); decorateOrder(); decorateInvites(); decorateShowcase(); decoratePrice(); decoratePreviews(); decorateContact(); decorateFooter(); decorateAmbient(); decorateFaq(); decorateChrome(); }
  var root = document.getElementById('root') || document.body;
  new MutationObserver(scan).observe(root, { childList: true, subtree: true });
  scan();
  onScroll();
})();
