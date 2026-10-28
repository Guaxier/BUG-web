/* 蚁巢：生存法则 官网交互
   - 下载链接解析：读取本站 downloads/latest.json（服务器最新包），失败回退 downloads/latest.apk。
   - 导航滚动高亮、区块入场动效（尊重 prefers-reduced-motion）、画廊灯箱。 */
(function () {
  'use strict';

  var LATEST_API = 'downloads/latest.json';
  var FALLBACK = 'downloads/latest.apk';

  function resolveDownload() {
    var links = document.querySelectorAll('.dl-link');
    var verChip = document.getElementById('ver-chip');
    var dlVer = document.getElementById('dl-ver');
    var apkName = document.getElementById('apk-name');
    fetch(LATEST_API + '?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (meta) {
        var file = String(meta.file || '');
        if (!/\.apk$/i.test(file)) throw new Error('no apk file');
        var href = 'downloads/' + encodeURIComponent(file);
        links.forEach(function (a) { a.href = href; });
        if (verChip) verChip.textContent = 'v' + String(meta.version || '').replace(/^v/, '');
        if (dlVer) dlVer.textContent = file.replace(/\.apk$/i, '');
        if (apkName) {
          var mb = Math.round(Number(meta.size || 0) / 1048576);
          apkName.textContent = '演示包 ' + file + (mb ? ' · 约 ' + mb + ' MB' : '');
        }
      })
      .catch(function () {
        links.forEach(function (a) { a.href = FALLBACK; });
      });
  }

  function scrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.links a'));
    var ids = links.map(function (a) { return a.getAttribute('href').slice(1); });
    var sections = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { observer.observe(s); });
  }

  function reveal() {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var targets = document.querySelectorAll('.glass, .head');
    if (reduce || !('IntersectionObserver' in window)) return;
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach(function (el) { observer.observe(el); });
  }

  function lightbox() {
    var dialog = document.getElementById('lightbox');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var img = dialog.querySelector('img');
    var caption = dialog.querySelector('figcaption');
    var close = dialog.querySelector('.lb-close');
    document.querySelectorAll('.tile').forEach(function (tile) {
      tile.addEventListener('click', function () {
        var full = tile.getAttribute('data-full');
        var label = tile.querySelector('figcaption b');
        img.src = full;
        img.alt = label ? label.textContent : '';
        caption.textContent = label ? label.textContent : '';
        dialog.showModal();
      });
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.click(); }
      });
    });
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    resolveDownload();
    scrollSpy();
    reveal();
    lightbox();
  });
})();
