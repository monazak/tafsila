(function () {
  var API = String(window.TAFSEELA_API || 'api').replace(/\/$/, '');
  var KEY = 'tf_cfg_v1';

  function valid(d) {
    return d && typeof d.wa === 'string' && Array.isArray(d.designs) && Array.isArray(d.packages) && d.packages.length;
  }

  try {
    var c = JSON.parse(localStorage.getItem(KEY) || 'null');
    var el = document.getElementById('data');
    if (c && valid(c.data) && el) el.textContent = JSON.stringify(c.data);
  } catch (e) {}

  function refresh() {
    if (!window.fetch) return;
    fetch(API + '/config.php', { credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && valid(j.data)) localStorage.setItem(KEY, JSON.stringify({ v: j.v, data: j.data }));
      })
      .catch(function () {});
  }
  function later() { (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(refresh); }
  if (document.readyState === 'complete') later(); else addEventListener('load', later);

  var open0 = window.open;
  window.open = function (u) {
    try {
      if (typeof u === 'string' && u.indexOf('https://wa.me/') === 0 && u.indexOf('?text=') > -1) {
        var body = JSON.stringify({ text: decodeURIComponent(u.split('?text=')[1]) });
        var url = API + '/lead.php';
        if (!(navigator.sendBeacon && navigator.sendBeacon(url, new Blob([body], { type: 'text/plain' })))) {
          fetch(url, { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(function () {});
        }
      }
    } catch (e) {}
    return open0.apply(this, arguments);
  };
})();
