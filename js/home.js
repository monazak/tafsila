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

  function scan() { decoratePreviews(); decorateContact(); decorateFooter(); }
  var root = document.getElementById('root') || document.body;
  new MutationObserver(scan).observe(root, { childList: true, subtree: true });
  scan();
})();
