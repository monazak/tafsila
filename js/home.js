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
    var tiltSel = '#packages .pc, #designs .ctile';
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest(tiltSel);
      if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      var k = el.classList.contains('ctile') ? 5 : 7;
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
    ['كيف بيشتغل تأكيد الحضور؟', 'في الباقة المميزة، الضيف بيأكد حضوره من الدعوة نفسها، والتأكيد بيوصلكم على واتساب.'],
    ['شو الفرق بين الباقات؟', 'الأساسية: تصميم جاهز مع عدّاد تنازلي ورابط مشاركة. المميزة: كل ميزات الأساسية مع تأكيد الحضور عبر واتساب وتعديل على النصوص والألوان. VIP: تصميم خاص حسب طلبكم مع دومين خاص وستيكرات وحركات مخصصة.'],
    ['عندنا فكرة أو تصميم مختلف، بتقدروا تنفذوه؟', 'نعم، ابعتولنا فكرتكم على واتساب وبنجهزها إلكم. باقة VIP معمولة للتصاميم الخاصة.'],
    ['بتشتغل الدعوة على كل الأجهزة؟', 'نعم، الدعوة صفحة ويب بتفتح على أي جوال أو تابلت أو كمبيوتر.']
  ];
  var faqIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); faqIO.unobserve(e.target); } });
  }, { threshold: .15 }) : null;
  function decorateFaq() {
    var pk = document.getElementById('packages');
    if (!pk || document.getElementById('faq')) return;
    var sec = document.createElement('section');
    sec.id = 'faq';
    var h = '<div class="w"><h2>أسئلة بتتكرر</h2><p class="sub">إذا ما لقيتوا جوابكم هون، احكولنا على واتساب.</p><div class="faq-l">';
    FAQ.forEach(function (q, i) { h += '<details style="--d:' + (i * .07).toFixed(2) + 's"><summary>' + q[0] + '</summary><div class="a">' + q[1] + '</div></details>'; });
    sec.innerHTML = h + '</div></div>';
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

  function scan() { decoratePreviews(); decorateContact(); decorateFooter(); decorateAmbient(); decorateFaq(); decorateChrome(); }
  var root = document.getElementById('root') || document.body;
  new MutationObserver(scan).observe(root, { childList: true, subtree: true });
  scan();
  onScroll();
})();
