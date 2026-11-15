/* Tafsila invitation engine.
   Each design page sets window.INVITE (the content) and optional <template> decor:
   #t-top, #t-bottom, #t-seal, #t-div. To make a customer's invitation: copy the
   design folder, edit the INVITE block at the top, set demo:false. */
(function () {
  var C = window.INVITE || {};
  var TZ = C.timeZone || 'Asia/Hebron';
  var LOC = C.locale || 'ar-PS-u-nu-latn';
  var SHOP_WA = '972566900092';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function tpl(id) { var t = document.getElementById(id); return t ? t.innerHTML : ''; }
  function fmt(d, o) { try { return new Intl.DateTimeFormat(LOC, Object.assign({ timeZone: TZ }, o)).format(d); } catch (e) { return d.toLocaleString(); } }
  function wa(num, text) { return 'https://wa.me/' + String(num).replace(/\D/g, '') + '?text=' + encodeURIComponent(text); }
  var I = {
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
    add: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M12 13v5M9.5 15.5h5"/></svg>',
    share: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.2-1.2-.2-.2-.4-.3z"/></svg>',
    dot: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z"/></svg>'
  };

  var when = new Date(C.date);
  var names = (C.names || []).map(esc);
  var single = names.length < 2;
  var title = single ? names[0] : names.join(' و');
  var dateLong = fmt(when, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  var timeStr = fmt(when, { hour: 'numeric', minute: '2-digit', hour12: true });
  var div = '<div class="divider">' + (tpl('t-div') || I.dot) + '</div>';

  var html =
    '<div id="cover" role="dialog" aria-label="غلاف الدعوة">' +
      '<div><button class="env" type="button" aria-label="افتح الدعوة">' +
        '<span class="env-body"></span><span class="env-letter"></span><span class="env-front"></span><span class="env-flap"></span>' +
        '<span class="seal">' + (tpl('t-seal') || esc(C.initials || '')) + '</span>' +
      '</button>' +
      '<div class="cover-txt"><div class="to">' + esc(C.coverLine || 'دعوة خاصة لكم') + '</div>' +
      '<span class="tap">اضغط لفتح الدعوة</span></div></div>' +
    '</div>' +
    '<main class="inv">' +
      '<section class="sec hero"><div class="decor-top">' + tpl('t-top') + '</div>' +
        (C.verse ? '<p class="verse rv">' + esc(C.verse) + '</p>' : '') +
        '<p class="intro rv">' + esc(C.intro || '') + '</p>' +
        (C.age ? '<div class="badge rv">' + esc(C.age) + '<small>' + esc(C.ageLabel || 'سنوات') + '</small></div>' : '') +
        '<h1 class="names rv">' + (single ? names[0] : names[0] + '<span class="and">' + esc(C.joiner || 'و') + '</span>' + names[1]) + '</h1>' +
        (C.sub ? '<p class="sub rv">' + esc(C.sub) + '</p>' : '') +
        div +
        '<p class="when rv"><b>' + esc(C.dateLabel || 'موعدنا') + '</b>' + dateLong + '</p>' +
      '</section>' +
      '<section class="sec rv"><h2 class="h2">' + esc(C.countTitle || 'العدّ التنازلي') + '</h2><div id="count" class="count" aria-live="polite"></div></section>' +
      '<section class="sec"><div class="cards">' +
        '<div class="card rv"><div class="ic">' + I.cal + '</div><div class="k">التاريخ</div><div class="v">' + dateLong + '</div></div>' +
        '<div class="card rv"><div class="ic">' + I.clock + '</div><div class="k">الساعة</div><div class="v">' + timeStr + '</div>' + (C.timeNote ? '<div class="v2">' + esc(C.timeNote) + '</div>' : '') + '</div>' +
        '<div class="card rv"><div class="ic">' + I.pin + '</div><div class="k">المكان</div><div class="v">' + esc(C.venue || '') + '</div><div class="v2">' + esc(C.address || '') + '</div>' +
          '<div class="row">' + (C.map ? '<a class="btn" target="_blank" rel="noopener" href="' + esc(C.map) + '">' + I.map + 'الموقع على الخريطة</a>' : '') +
          '<button class="btn ghost" type="button" id="ics">' + I.add + 'أضف للتقويم</button></div></div>' +
      '</div></section>' +
      (C.rsvp === false ? '' :
      '<section class="sec rv"><h2 class="h2">تأكيد الحضور</h2>' +
        '<form class="form" id="rsvp" novalidate>' +
          '<div><label for="rn">الاسم</label><input id="rn" name="n" autocomplete="name" placeholder="اكتب اسمك" required></div>' +
          '<div class="seg" role="radiogroup" aria-label="الحضور"><label><input type="radio" name="a" value="1" checked><span>سأحضر</span></label><label><input type="radio" name="a" value="0"><span>أعتذر</span></label></div>' +
          '<div id="gw"><label for="rg">عدد الأشخاص</label><select id="rg" name="g">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<option>' + n + '</option>'; }).join('') + '</select></div>' +
          '<p class="err" id="re"></p>' +
          '<button class="btn" type="submit">' + I.wa + 'أرسل التأكيد عبر واتساب</button>' +
        '</form>' + (C.rsvpNote ? '<p class="note">' + esc(C.rsvpNote) + '</p>' : '') +
      '</section>') +
      '<section class="sec rv"><p class="closing">' + esc(C.closing || '') + '</p>' + (C.hosts ? '<p class="hosts">' + esc(C.hosts) + '</p>' : '') +
        '<div class="row" style="margin-top:20px"><button class="btn ghost" type="button" id="share">' + I.share + 'شارك الدعوة</button></div>' +
        '<a class="made" href="' + esc(C.home || '/') + '">صُمّمت بحب في <b>تفصيلة</b></a></section>' +
      '<div class="decor-bottom">' + tpl('t-bottom') + '</div>' +
    '</main>' +
    (C.demo ? '<div class="demo" role="region" aria-label="معاينة"><p><b>«' + esc(C.design) + '»</b>معاينة — كل النصوص بتتعدّل حسب طلبك</p>' +
      '<a class="btn" target="_blank" rel="noopener" href="' + wa(SHOP_WA, 'مرحبا تفصيلة، بدي أطلب تصميم «' + C.design + '»') + '">' + I.wa + 'اطلب التصميم</a>' +
      '<a class="home" href="' + esc(C.home || '/') + '">رجوع</a></div>' : '') +
    '<div class="toast" id="toast" role="status"></div>';

  document.body.insertAdjacentHTML('afterbegin', html);
  if (C.demo) document.body.classList.add('has-demo');

  /* cover */
  var cover = document.getElementById('cover');
  document.body.classList.add('locked');
  function openCover() {
    if (cover.classList.contains('open')) return;
    cover.classList.add('open');
    document.body.classList.remove('locked');
    setTimeout(reveal, 700);
  }
  cover.querySelector('.env').addEventListener('click', openCover);
  if (/[?&]open\b/.test(location.search)) { cover.classList.add('open'); cover.style.transition = 'none'; document.body.classList.remove('locked'); }

  /* reveal on scroll */
  function reveal() {
    var els = document.querySelectorAll('.rv');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
    els.forEach(function (e) { io.observe(e); });
  }
  if (cover.classList.contains('open')) reveal();

  /* countdown */
  var box = document.getElementById('count');
  function tick() {
    var ms = when - Date.now();
    if (isNaN(ms)) { box.innerHTML = ''; return; }
    if (ms <= 0) { box.outerHTML = '<p class="count-done">' + esc(C.doneText || 'حان الموعد، أهلاً وسهلاً بكم') + '</p>'; return true; }
    var s = Math.floor(ms / 1000), u = [[Math.floor(s / 86400), 'يوم'], [Math.floor(s / 3600) % 24, 'ساعة'], [Math.floor(s / 60) % 60, 'دقيقة'], [s % 60, 'ثانية']];
    box.innerHTML = u.map(function (x) { return '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('');
  }
  if (!tick()) var iv = setInterval(function () { if (tick()) clearInterval(iv); }, 1000);

  /* toast */
  var toastEl = document.getElementById('toast'), tt;
  function toast(h, ms) { toastEl.innerHTML = h; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3500); }

  /* calendar (.ics) */
  document.getElementById('ics').addEventListener('click', function () {
    function z(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var end = new Date(when.getTime() + (C.hours || 4) * 3600e3);
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tafsila//Invite//AR', 'BEGIN:VEVENT', 'UID:' + z(when) + '@tafsila', 'DTSTAMP:' + z(new Date()),
      'DTSTART:' + z(when), 'DTEND:' + z(end), 'SUMMARY:' + (C.calTitle || document.title), 'LOCATION:' + [C.venue, C.address].filter(Boolean).join(' - '),
      'DESCRIPTION:' + location.href, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'invitation.ics'; document.body.appendChild(a); a.click(); a.remove();
  });

  /* rsvp */
  var form = document.getElementById('rsvp');
  if (form) {
    var gw = document.getElementById('gw');
    form.addEventListener('change', function () { gw.style.display = form.a.value === '1' ? '' : 'none'; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = form.n.value.trim();
      if (n.length < 2) { document.getElementById('re').textContent = 'اكتب اسمك لو سمحت'; form.n.focus(); return; }
      document.getElementById('re').textContent = '';
      var yes = form.a.value === '1';
      var msg = yes
        ? 'مرحبا، أنا ' + n + '\nبأكّد حضوري' + (form.g.value > 1 ? ' (' + form.g.value + ' أشخاص)' : '') + ' لـ' + (C.calTitle || title) + ' بتاريخ ' + dateLong + ' 🤍'
        : 'مرحبا، أنا ' + n + '\nللأسف ما رح أقدر أحضر ' + (C.calTitle || title) + '، ألف مبروك ومن فرح لفرح 🤍';
      if (C.demo) { toast('<b>هذه نسخة تجريبية</b><br>بالدعوة الحقيقية، بتوصل الرسالة لصاحب المناسبة على واتساب هيك:<pre>' + esc(msg) + '</pre>', 6000); return; }
      window.open(wa(C.rsvpTo, msg), '_blank');
    });
  }

  /* share */
  document.getElementById('share').addEventListener('click', function () {
    var data = { title: document.title, url: location.href.replace(/[?&]open\b/, '') };
    if (navigator.share) { navigator.share(data).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(data.url).then(function () { toast('تم نسخ رابط الدعوة ✓'); }, function () { toast(esc(data.url)); });
    else toast(esc(data.url));
  });
})();
