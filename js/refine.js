/* تفصيلة · refinement pass (see css/refine.css for the why) */
(function () {
  function ready(sel, fn) {
    (function wait() { var el = document.querySelector(sel); if (el) fn(el); else setTimeout(wait, 120); })();
  }

  /* 1. hero: a plain statement of the offer + two ways in */
  function heroLede() {
    var side = document.querySelector('.hero.hs2 .hs-side');
    var mark = side && side.querySelector('.hx-mark');
    if (!mark || side.querySelector('.hs-lede')) return;
    // the visible slogan is the page's real title (the <h1> is hidden by the layout)
    mark.setAttribute('role', 'heading'); mark.setAttribute('aria-level', '1');
    var lede = document.createElement('p');
    lede.className = 'hs-lede';
    lede.innerHTML = 'دعوات إلكترونية للزفاف والإشهار والتخرج وأعياد الميلاد. بنجهّزها بأسمائكم وتفاصيلكم، وبتوصلكم رابط تبعتوه لضيوفكم على واتساب. <b>الأسعار من 50 ₪.</b>';
    var acts = document.createElement('div');
    acts.className = 'hs-acts';
    acts.innerHTML = '<button type="button" class="btn btn-go">اطلبوا دعوتكم</button><a class="btn btn-see" href="#designs">تصفّحوا التصاميم</a>';
    mark.insertAdjacentElement('afterend', lede);
    lede.insertAdjacentElement('afterend', acts);
    acts.querySelector('.btn-go').addEventListener('click', function () {
      // reuse the site's own order flow (the original hero button, now hidden)
      var orig = document.querySelector('.hero .hbtns .btn.alt') || document.querySelector('header.nav .cta-n');
      if (orig) orig.click();
    });
  }

  /* 2. only the first section title writes itself in; the rest are already written */
  function stillHeadings() {
    document.querySelectorAll('h2.ink').forEach(function (h) {
      if (!h.closest('#designs')) h.classList.add('ink-still');
    });
  }

  /* 3. footer: a line that says what Tafsila does instead of a slogan any business could use */
  function footerLine() {
    var cp = document.querySelector('footer .cp');
    if (!cp || cp.dataset.refined) return;
    var y = (cp.textContent.match(/\d{4}/) || [new Date().getFullYear()])[0];
    cp.textContent = '© ' + y + ' تفصيلة. دعوات إلكترونية للزفاف والإشهار والتخرج وأعياد الميلاد.';
    cp.dataset.refined = '1';
  }

  function run() { heroLede(); stillHeadings(); footerLine(); }
  ready('.hero.hs2 .hs-side .hx-mark', function () {
    run();
    // the React layer can re-render parts of the page; re-apply if anything goes missing
    var t; var mo = new MutationObserver(function () { clearTimeout(t); t = setTimeout(run, 150); });
    mo.observe(document.getElementById('root'), { childList: true, subtree: true });
  });
})();
