/* Tafsila homepage. Data comes from <script id="data"> (kept fresh by api.js). */
(function () {
  var D;
  try { D = JSON.parse(document.getElementById('data').textContent); } catch (e) { D = { wa: '', designs: [], packages: [] }; }
  var CATS = {
    wedding: { n: 'زفاف', t: 'أناقة لليلة العمر' },
    ishhar: { n: 'إشهار', t: 'دعوة بروح وقورة' },
    grad: { n: 'تخرج', t: 'فرحة الإنجاز' },
    bday: { n: 'عيد ميلاد', t: 'تفاصيل صغيرة وفرحة كبيرة' }
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var safeLink = function (u) { return /^(https:\/\/|\/?designs\/[a-z0-9-]+\/?$)/i.test(u || '') ? u : ''; };
  var ORN = '<svg class="o" viewBox="0 0 80 12" fill="none" stroke="currentColor" stroke-width="1"><path d="M0 6h30M50 6h30"/><path d="M40 1l5 5-5 5-5-5z" fill="currentColor"/></svg>';
  var CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 1;
    var n = parseInt(m[1], 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
  }

  /* ---------- nav ---------- */
  var nav = $('.nav');
  function onScroll() { nav.classList.toggle('solid', scrollY > 40); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('.burger').addEventListener('click', function () {
    var o = nav.classList.toggle('open'); this.setAttribute('aria-expanded', o);
  });
  nav.querySelectorAll('ul a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); }); });
  if ('IntersectionObserver' in window) {
    var links = {}; nav.querySelectorAll('ul a').forEach(function (a) { links[a.hash.slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && links[e.target.id]) { for (var k in links) links[k].classList.toggle('on', k === e.target.id); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- envelope ---------- */
  var env = $('#env');
  function toggleEnv() {
    var o = env.classList.toggle('open');
    env.setAttribute('aria-label', o ? 'أغلق الدعوة' : 'افتح الدعوة');
    $('#env-hint').textContent = o ? 'اضغط لإغلاق الدعوة' : 'اضغط لفتح الدعوة';
  }
  env.addEventListener('click', toggleEnv);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(function () { if (!env.classList.contains('open') && scrollY < 200) toggleEnv(); }, 2600);
    var pet = $('#petals');
    for (var i = 0; i < 9; i++) {
      var p = document.createElement('i'); p.className = 'petal';
      p.style.left = (5 + Math.random() * 90) + '%';
      p.style.animationDuration = (11 + Math.random() * 10) + 's';
      p.style.animationDelay = (-Math.random() * 20) + 's';
      p.style.transform = 'scale(' + (.6 + Math.random() * .7) + ')';
      pet.appendChild(p);
    }
  }

  /* ---------- gallery ---------- */
  var designs = (D.designs || []).filter(function (d) { return d && d.n; });
  var grid = $('#grid'), filters = $('#filters'), cur = 'all';
  function countFor(c) { return designs.filter(function (d) { return c === 'all' || d.c === c; }).length; }
  function renderFilters() {
    var keys = ['all'].concat(Object.keys(CATS));
    filters.innerHTML = keys.map(function (k) {
      return '<button type="button" data-c="' + k + '" aria-pressed="' + (k === cur) + '">' + (k === 'all' ? 'الكل' : CATS[k].n) + '<span>' + countFor(k) + '</span></button>';
    }).join('');
  }
  function thumb(d, i) {
    var dark = lum(d.c1) < .35;
    var ink = dark ? '#f6e7c8' : '#4a0f1c', fr = dark ? '#d9b779' : '#b8955a';
    var style = 'background:linear-gradient(160deg,' + esc(d.c1 || '#faf4ec') + ',' + esc(d.c2 || d.c1 || '#ead9c6') + ');color:' + ink + ';--fr:' + fr;
    var face = d.img ? '<img src="' + esc(d.img) + '" alt="" loading="lazy">'
      : '<div class="face"><span class="k">' + esc((CATS[d.c] || {}).n || '') + '</span><span class="t">' + esc(d.n) + '</span>' + ORN + '<i class="lg" aria-hidden="true"></i></div>';
    return '<button class="thumb" type="button" style="' + style + '" data-prev="' + i + '" aria-label="معاينة ' + esc(d.n) + '">' + face +
      (safeLink(d.l) ? '<span class="peek"><span>معاينة الدعوة</span></span>' : '') + '</button>';
  }
  function renderGrid() {
    var list = designs.map(function (d, i) { return [d, i]; }).filter(function (x) { return cur === 'all' || x[0].c === cur; });
    grid.innerHTML = list.length ? list.map(function (x) {
      var d = x[0], i = x[1], has = !!safeLink(d.l);
      return '<article class="dcard rv">' + thumb(d, i) +
        '<h3>' + esc(d.n) + '</h3><p class="tag">' + esc((CATS[d.c] || {}).t || '') + '</p>' +
        '<div class="acts">' + (has ? '<button class="btn btn-ghost btn-sm" type="button" data-prev="' + i + '">معاينة</button>' : '') +
        '<button class="btn btn-bur btn-sm" type="button" data-pick="' + i + '">اختر التصميم</button></div></article>';
    }).join('') : '<p class="empty">ما في تصاميم بهذا القسم بعد، قريباً ✦</p>';
    observe(grid.querySelectorAll('.rv'));
  }
  filters.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    cur = b.dataset.c; renderFilters(); renderGrid();
  });
  grid.addEventListener('click', function (e) {
    var p = e.target.closest('[data-prev]'), k = e.target.closest('[data-pick]');
    if (k) return openOrder({ d: +k.dataset.pick });
    if (p) { var d = designs[+p.dataset.prev]; if (safeLink(d.l)) openPreview(+p.dataset.prev); else openOrder({ d: +p.dataset.prev }); }
  });
  renderFilters(); renderGrid();

  /* ---------- packages ---------- */
  var plans = $('#plans');
  plans.innerHTML = (D.packages || []).map(function (p, i) {
    return '<article class="plan rv' + (p.hot ? ' hot' : '') + '">' + (p.hot ? '<span class="ribbon">الأكثر طلباً</span>' : '') +
      '<h3>' + esc(p.n) + '</h3><div class="price">' + esc(p.p) + '</div><ul>' +
      String(p.f || '').split('\n').filter(Boolean).map(function (f) { return '<li>' + CHECK + '<span>' + esc(f) + '</span></li>'; }).join('') +
      '</ul><button class="btn ' + (p.hot ? 'btn-bur' : 'btn-ghost') + '" type="button" data-plan="' + i + '">اختر هذه الباقة</button></article>';
  }).join('');
  plans.addEventListener('click', function (e) { var b = e.target.closest('[data-plan]'); if (b) openOrder({ p: +b.dataset.plan }); });

  /* ---------- order dialog ---------- */
  var od = $('#order'), of = $('#order-form');
  of.d.innerHTML = '<option value="">ما اخترت بعد</option>' + designs.map(function (d, i) { return '<option value="' + i + '">' + esc(d.n) + '</option>'; }).join('');
  of.p.innerHTML = '<option value="">مش متأكد</option>' + (D.packages || []).map(function (p, i) { return '<option value="' + i + '">' + esc(p.n + ' · ' + p.p) + '</option>'; }).join('');
  function openOrder(o) {
    o = o || {};
    if (o.d != null) of.d.value = o.d;
    if (o.p != null) of.p.value = o.p;
    $('#oe').textContent = '';
    if ($('#preview').open) $('#preview').close();
    od.showModal();
    setTimeout(function () { of.n.focus(); }, 50);
  }
  document.querySelectorAll('[data-order]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openOrder(); }); });
  of.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = of.n.value.trim();
    if (n.length < 2) { $('#oe').textContent = 'الرجاء كتابة اسمك'; of.n.focus(); return; }
    var d = designs[of.d.value], p = (D.packages || [])[of.p.value], notes = of.t.value.trim();
    var lines = ['مرحباً، أنا ' + n];
    if (d) lines.push('اخترت التصميم: ' + d.n);
    if (p) lines.push('الباقة: ' + p.n);
    if (notes) lines.push('التعديلات المطلوبة: ' + notes.replace(/\s*\n\s*/g, ' · '));
    window.open('https://wa.me/' + String(D.wa || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(lines.join('\n')), '_blank');
    od.close();
  });
  document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { b.closest('dialog').close(); }); });
  document.querySelectorAll('dialog').forEach(function (dl) {
    dl.addEventListener('click', function (e) { if (e.target === dl) dl.close(); });
  });

  /* ---------- phone preview ---------- */
  var pv = $('#preview'), frame = $('#pv-frame'), pvIdx = null;
  function openPreview(i) {
    pvIdx = i; var d = designs[i];
    frame.src = safeLink(d.l);
    $('#pv-title').textContent = d.n;
    pv.showModal();
  }
  pv.addEventListener('close', function () { frame.src = 'about:blank'; });
  $('#pv-pick').addEventListener('click', function () { openOrder({ d: pvIdx }); });

  /* ---------- whatsapp contact ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = 'https://wa.me/' + String(D.wa || '').replace(/\D/g, '') + '?text=' + encodeURIComponent('مرحباً تفصيلة، عندي استفسار');
  });
  $('#year').textContent = new Date().getFullYear();

  /* ---------- reveal ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 }) : null;
  function observe(els) { els.forEach(function (el) { io ? io.observe(el) : el.classList.add('in'); }); }
  observe(document.querySelectorAll('.rv'));
})();
