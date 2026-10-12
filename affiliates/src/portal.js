/* ProfitIQS Affiliate Partner Portal — progressive enhancement only; every page reads fine without JS. */
(function () {
  'use strict';
  var toast = document.querySelector('.toast');
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  /* copy to clipboard (Clipboard API with a textarea fallback for older browsers / non-secure previews) */
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  document.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-copy]');
    if (!btn) return;
    var box = btn.closest('.copy');
    var text = box ? box.querySelector('.copy-text').textContent : '';
    var label = btn.querySelector('span');
    function done(ok) {
      if (ok) {
        btn.classList.add('done'); if (label) label.textContent = 'Copied';
        say('Copied — paste it and add your affiliate link');
        setTimeout(function () { btn.classList.remove('done'); if (label) label.textContent = 'Copy'; }, 1600);
      } else { say('Copy failed — select the text and copy it manually'); }
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else { done(fallbackCopy(text)); }
  });

  /* product directory: search + filters */
  var grid = document.getElementById('pgrid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.pcard'));
    var q = document.getElementById('q'), fi = document.getElementById('f-industry'),
        ft = document.getElementById('f-tier'), fs = document.getElementById('f-status'),
        count = document.getElementById('count'), empty = document.getElementById('empty');
    function apply() {
      var term = (q.value || '').trim().toLowerCase(), shown = 0;
      cards.forEach(function (c) {
        var ok = (!term || c.dataset.search.indexOf(term) > -1)
          && (!fi.value || c.dataset.industry === fi.value)
          && (!ft.value || (' ' + c.dataset.tiers + ' ').indexOf(' ' + ft.value + ' ') > -1)
          && (!fs.value || c.dataset.status === fs.value);
        c.hidden = !ok; if (ok) shown++;
      });
      count.textContent = shown + (shown === 1 ? ' product' : ' products');
      empty.hidden = shown !== 0;
    }
    [q, fi, ft, fs].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
    document.getElementById('reset').addEventListener('click', function () {
      q.value = ''; fi.value = ''; ft.value = ''; fs.value = ''; apply(); q.focus();
    });
  }

  /* a launch promotion built into the page hides itself once its end date has passed */
  document.querySelectorAll('[data-promo-end]').forEach(function (el) {
    var end = new Date(el.getAttribute('data-promo-end') + 'T23:59:59');
    if (!isNaN(end) && new Date() > end) el.remove();
  });

  /* highlight the current section in the niche page sub-navigation */
  var links = document.querySelectorAll('.subnav a');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && map[e.target.id]) {
          links.forEach(function (a) { a.classList.remove('on'); });
          map[e.target.id].classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) obs.observe(s); });
  }
})();
