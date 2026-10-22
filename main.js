/* 蚁巢：生存法则 官网交互
   - 下载链接解析：读取 BUG-web 最新发行版的 apk 资产；失败回退 releases/latest。
   - 导航滚动高亮、区块入场动效（尊重 prefers-reduced-motion）、画廊灯箱。 */
(function () {
  'use strict';

  var REPO_API = 'https://api.github.com/repos/Guaxier/BUG-web/releases/latest';
  var FALLBACK = 'https://github.com/Guaxier/BUG-web/releases/latest';

  function resolveDownload() {
    var links = document.querySelectorAll('.dl-link');
    var verChip = document.getElementById('ver-chip');
    var dlVer = document.getElementById('dl-ver');
    var apkName = document.getElementById('apk-name');
    fetch(REPO_API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (rel) {
        var asset = (rel.assets || []).filter(function (a) { return /\.apk$/i.test(a.name); })[0];
        if (!asset) throw new Error('no apk asset');
        links.forEach(function (a) { a.href = asset.browser_download_url; });
        if (verChip) verChip.textContent = 'v' + String(rel.tag_name || '').replace(/^v/, '');
        if (dlVer) dlVer.textContent = asset.name.replace(/\.apk$/i, '');
        if (apkName) {
          var mb = Math.round(asset.size / 1048576);
          apkName.textContent = '演示包 ' + asset.name + (mb ? ' · 约 ' + mb + ' MB' : '');
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
