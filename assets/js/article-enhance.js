/* Shared article enhancements: builds a clickable contents list from each article's h2 headings.
   Wide screens: sticky list in the left margin. Narrow screens: collapsible box before the first section.
   Articles that already have their own contents card (.toc with # links) get the side list only. */
(function () {
  function slug(t) { return t.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section'; }
  var hasOwnToc = !!document.querySelector('.toc a[href^="#"]');
  var heads = [].slice.call(document.querySelectorAll('h2')).filter(function (h) {
    if (h.closest('.optin-box, .ae-toc-inline, .ae-toc-margin')) return false;
    var t = h.closest('.toc');
    if (t && t.querySelector('a[href^="#"]')) return false;
    return h.textContent.trim().length > 0;
  });
  if (heads.length < 3) return;

  var items = heads.map(function (h) {
    if (!h.id) {
      var base = slug(h.textContent), id = base, n = 2;
      while (document.getElementById(id)) id = base + '-' + (n++);
      h.id = id;
    }
    return { id: h.id, text: h.textContent.trim() };
  });
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var list = '<ul>' + items.map(function (i) { return '<li><a href="#' + i.id + '">' + esc(i.text) + '</a></li>'; }).join('') + '</ul>';

  // content root = closest ancestor of the first heading that also contains the page title
  var h1 = document.querySelector('h1'), first = heads[0], root = document.body;
  if (h1) { var p = first.parentElement; while (p && !p.contains(h1)) p = p.parentElement; root = p || document.body; }
  var anchorEl = first;
  while (anchorEl.parentElement && anchorEl.parentElement !== root) anchorEl = anchorEl.parentElement;

  var inline = null;
  if (!hasOwnToc) {
    inline = document.createElement('details');
    inline.className = 'ae-toc-inline';
    inline.innerHTML = '<summary>Contents</summary><nav>' + list + '</nav>';
    anchorEl.parentElement.insertBefore(inline, anchorEl);
  }
  var aside = document.createElement('aside');
  aside.className = 'ae-toc-margin';
  aside.setAttribute('aria-label', 'Contents');
  aside.innerHTML = '<p class="ae-toc-title">Contents</p><nav>' + list + '</nav>';
  document.body.appendChild(aside);

  function layout() {
    var r = root.getBoundingClientRect(), cs = getComputedStyle(root);
    var left = r.left + parseFloat(cs.paddingLeft || 0);
    var w = Math.min(230, left - 56);
    if (w >= 170) {
      aside.style.display = 'block'; aside.style.width = w + 'px'; aside.style.left = (left - w - 32) + 'px';
      if (inline) inline.style.display = 'none';
    } else {
      aside.style.display = 'none';
      if (inline) inline.style.display = '';
    }
  }
  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);

  if ('IntersectionObserver' in window) {
    var links = {};
    [].forEach.call(aside.querySelectorAll('a'), function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          for (var k in links) links[k].classList.remove('active');
          if (links[e.target.id]) links[e.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    heads.forEach(function (h) { io.observe(h); });
  }
})();
