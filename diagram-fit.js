/* Readable teaching diagrams and tables on every screen size.
   Presentation only: no lesson content, question IDs, answers or handlers change.
   - Labels that run past a diagram's drawing area are brought back into view.
   - A diagram whose labels would appear below MIN px is enlarged (within the column
     where there is room, otherwise in a sideways-scrolling frame up to MAX_GROW).
   - Any diagram whose labels are still small gets an Enlarge button that opens a
     full-screen view at a comfortable reading size.
   - Tables wider than the lesson column scroll inside their own frame instead of
     pushing the whole page sideways. */
(() => {
  'use strict';
  const MIN = 11;          // smallest on-screen label size, px
  const READ = 14;         // label size in the full-screen view, px
  const MAX_GROW = 1.6;    // never widen a diagram in the page beyond this multiple of the column
  const SKIP = 'header,nav,button,.btn,.unit,.u-ico,.prac,.lesson-tabs,[data-subject-icon],.dg-ignore,.dg-viewer';

  const current = () => document.querySelector('[id^="lab-"]:not([hidden])') || document.body;
  const visible = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };

  /* Size of the smallest label that carries meaning. Fine print far smaller than
     the typical label (markings printed on apparatus, for example) is ignored so
     that it does not force a huge enlargement. */
  function smallestLabel(svg) {
    const sizes = [];
    for (const t of svg.querySelectorAll('text')) {
      if (!t.textContent.trim() || t.closest('clipPath,defs,symbol,marker,pattern')) continue;
      const f = parseFloat(getComputedStyle(t).fontSize);
      if (f > 0) sizes.push(f);
    }
    if (!sizes.length) return Infinity;
    sizes.sort((a, b) => a - b);
    const median = sizes[Math.floor(sizes.length / 2)];
    return sizes.find(f => f >= median * 0.6) || median;
  }

  /* Labels that run past the drawing area are clipped by the browser. Enlarge the
     viewBox just enough to show them (never shrinking it, and never more than a
     quarter of its size per side). Deliberate crops (clip paths, masks) are kept. */
  const CROPPED = 'clipPath,mask,defs,symbol,marker,pattern,[clip-path],[mask]';
  function unclip(svg) {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width || !vb.height) return;
    if (!svg.dataset.dgVb) svg.dataset.dgVb = [vb.x, vb.y, vb.width, vb.height].join(' ');
    const [ox, oy, ow, oh] = svg.dataset.dgVb.split(' ').map(Number);
    const texts = [...svg.querySelectorAll('text')].filter(t => t.textContent.trim() && !t.closest(CROPPED));
    if (!texts.length || texts.length > 400) return;
    const sr = svg.getBoundingClientRect();
    const scale = Math.min(sr.width / vb.width, sr.height / vb.height); if (!scale) return;
    const offX = (sr.width - vb.width * scale) / 2, offY = (sr.height - vb.height * scale) / 2;
    let x0 = ox, y0 = oy, x1 = ox + ow, y1 = oy + oh;
    for (const t of texts) {
      const r = t.getBoundingClientRect(); if (!r.width) continue;
      const ux0 = vb.x + (r.left - sr.left - offX) / scale, ux1 = vb.x + (r.right - sr.left - offX) / scale;
      const uy0 = vb.y + (r.top - sr.top - offY) / scale, uy1 = vb.y + (r.bottom - sr.top - offY) / scale;
      x0 = Math.min(x0, ux0 - 3); x1 = Math.max(x1, ux1 + 3); y0 = Math.min(y0, uy0 - 2); y1 = Math.max(y1, uy1 + 2);
    }
    x0 = Math.max(x0, ox - ow * .25); x1 = Math.min(x1, ox + ow * 1.25); y0 = Math.max(y0, oy - oh * .25); y1 = Math.min(y1, oy + oh * 1.25);
    if (Math.abs(x0 - vb.x) < .5 && Math.abs(y0 - vb.y) < .5 && Math.abs(x1 - x0 - vb.width) < .5 && Math.abs(y1 - y0 - vb.height) < .5) return;
    if (x0 < ox - .5 || y0 < oy - .5 || x1 > ox + ow + .5 || y1 > oy + oh + .5)
      svg.setAttribute('viewBox', [x0, y0, x1 - x0, y1 - y0].map(v => +v.toFixed(1)).join(' '));
  }

  function reset(svg) {
    if (!svg.dataset.dgFit) return;
    svg.style.width = svg.dataset.dgW || ''; svg.style.maxWidth = svg.dataset.dgMax || '';
    svg.style.minWidth = ''; svg.style.height = svg.dataset.dgH || '';
    delete svg.dataset.dgFit;
  }

  function fit(svg) {
    if (svg.closest(SKIP) || !visible(svg)) return;
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width || !vb.height) return;
    const host = svg.parentElement; if (!host) return;
    const avail = (svg.closest('.dg-scroll') || host).parentElement.getBoundingClientRect().width || host.getBoundingClientRect().width;
    if (avail < 120) return;
    const key = Math.round(avail) + ':' + svg.childElementCount + ':' + svg.querySelectorAll('text').length;
    if (svg.dataset.dgKey === key) return;
    reset(svg);
    try { unclip(svg); } catch (_) {}
    svg.dataset.dgKey = key;
    const r = svg.getBoundingClientRect();
    if (r.width < 60 || r.height < 40) return tools(svg, false, false);
    const fs = smallestLabel(svg);
    if (!isFinite(fs)) return tools(svg, false, false);
    const vb2 = svg.viewBox.baseVal;
    const scale = Math.min(r.width / vb2.width, r.height / vb2.height);
    const shown = fs * scale;
    if (shown >= MIN - 0.25) return tools(svg, false, false);
    const want = Math.min(r.width * MIN / shown, avail * MAX_GROW);
    let scrolled = false;
    if (want > r.width + 1) {
      svg.dataset.dgW = svg.style.width; svg.dataset.dgMax = svg.style.maxWidth; svg.dataset.dgH = svg.style.height;
      svg.dataset.dgFit = '1';
      svg.style.height = 'auto';
      if (want <= avail) {
        // Room to grow within the column: lift any fixed maximum width.
        svg.style.width = '100%'; svg.style.maxWidth = Math.round(want) + 'px';
        unwrap(svg);
      } else {
        wrap(svg); scrolled = true;
        svg.style.width = Math.round(want) + 'px'; svg.style.maxWidth = 'none'; svg.style.minWidth = Math.round(want) + 'px';
      }
    }
    const nowShown = fs * Math.min(svg.getBoundingClientRect().width / vb2.width, svg.getBoundingClientRect().height / vb2.height);
    tools(svg, scrolled, nowShown < MIN - 0.5);
  }

  function wrap(svg) {
    if (svg.parentElement.classList.contains('dg-scroll')) return;
    const box = document.createElement('div'); box.className = 'dg-scroll'; box.tabIndex = 0;
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', (svg.getAttribute('aria-label') || 'Diagram') + ' (scroll sideways to see all of it)');
    svg.before(box); box.append(svg);
  }

  function unwrap(svg) {
    const box = svg.parentElement;
    if (!box.classList.contains('dg-scroll')) return;
    box.before(svg); box.remove();
  }

  /* One line under the diagram: a scroll hint and/or an Enlarge button. */
  function tools(svg, scrolled, small) {
    const anchor = svg.closest('.dg-scroll') || svg;
    let bar = anchor.nextElementSibling && anchor.nextElementSibling.classList.contains('dg-tools') ? anchor.nextElementSibling : null;
    if (!scrolled && !small) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement('div'); bar.className = 'dg-tools'; anchor.after(bar); }
    bar.innerHTML = (scrolled ? '<span class="dg-hint">↔ Scroll sideways to see the whole diagram</span>' : '<span></span>') +
      '<button type="button" class="dg-enlarge" aria-haspopup="dialog">Enlarge diagram</button>';
    bar.querySelector('.dg-enlarge').onclick = () => openViewer(svg);
  }

  /* Full-screen view. The copy is placed next to the original so it keeps the same
     styles; ids are renamed so references (clip paths, gradients) still resolve. */
  function openViewer(svg) {
    const vb = svg.viewBox.baseVal, fs = smallestLabel(svg);
    const copy = svg.cloneNode(true);
    const ids = new Map();
    copy.querySelectorAll('[id]').forEach(el => { const n = el.id + '-dgv'; ids.set(el.id, n); el.id = n; });
    if (copy.id) copy.removeAttribute('id');
    if (ids.size) copy.querySelectorAll('*').forEach(el => {
      for (const a of [...el.attributes]) {
        if (!/url\(#|^#/.test(a.value)) continue;
        a.value = a.value.replace(/url\(#([^)]+)\)/g, (m, id) => ids.has(id) ? `url(#${ids.get(id)})` : m).replace(/^#(.+)$/, (m, id) => ids.has(id) ? '#' + ids.get(id) : m);
      }
    });
    copy.removeAttribute('style'); copy.removeAttribute('width'); copy.removeAttribute('height');
    const w = Math.max(Math.min(innerWidth, 1100) - 32, isFinite(fs) ? vb.width * READ / fs : 0);
    copy.style.width = Math.round(w) + 'px'; copy.style.maxWidth = 'none'; copy.style.height = 'auto'; copy.style.display = 'block';
    const dlg = document.createElement('dialog'); dlg.className = 'dg-viewer';
    dlg.setAttribute('aria-label', svg.getAttribute('aria-label') || 'Diagram');
    dlg.innerHTML = '<div class="dg-viewer-bar"><span>' + (svg.getAttribute('aria-label') || 'Diagram').replace(/[<&]/g, c => c === '<' ? '&lt;' : '&amp;') + '</span><button type="button" class="btn dg-close">Close</button></div><div class="dg-viewer-body" tabindex="0"></div>';
    dlg.querySelector('.dg-viewer-body').append(copy);
    if (innerHeight > innerWidth && w > innerWidth) { const tip = document.createElement('p'); tip.className = 'dg-hint dg-tip'; tip.textContent = 'Tip: turn your phone sideways for a larger view.'; dlg.querySelector('.dg-viewer-bar').after(tip); }
    (svg.closest('.dg-scroll') || svg).after(dlg);
    const close = () => { dlg.close(); dlg.remove(); };
    dlg.querySelector('.dg-close').onclick = close;
    dlg.addEventListener('click', e => { if (e.target === dlg) close(); });
    dlg.addEventListener('cancel', e => { e.preventDefault(); close(); });
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('.dg-close').focus();
  }

  function tables(root) {
    for (const t of root.querySelectorAll('table')) {
      if (t.closest('.tbl-scroll,.dg-ignore') || !visible(t)) continue;
      const host = t.parentElement, w = host.getBoundingClientRect().width;
      if (t.getBoundingClientRect().width <= w + 1) continue;
      if (getComputedStyle(host).overflowX !== 'visible') continue;
      const box = document.createElement('div'); box.className = 'tbl-scroll'; box.tabIndex = 0;
      box.setAttribute('role', 'group'); box.setAttribute('aria-label', 'Table (scroll sideways to see all of it)');
      t.before(box); box.append(t);
    }
  }

  let queued = 0;
  function run() {
    queued = 0;
    const root = current();
    for (const svg of root.querySelectorAll('svg')) { try { fit(svg); } catch (_) { /* never block the lesson */ } }
    try { tables(root); } catch (_) {}
  }
  const soon = (ms = 80) => { if (!queued) queued = setTimeout(run, ms); };

  addEventListener('hashchange', () => soon(120));
  addEventListener('resize', () => { for (const s of document.querySelectorAll('svg[data-dg-key]')) delete s.dataset.dgKey; soon(150); });
  document.addEventListener('click', () => soon(120), true);
  document.addEventListener('toggle', () => soon(60), true);
  new MutationObserver(list => {
    for (const m of list) {
      const t = m.target;
      if (t.nodeType === 1 && (t.closest('svg,.dg-tools,.dg-viewer') || t.tagName === 'svg')) continue;
      soon(150); return;
    }
  }).observe(document.body, { childList: true, subtree: true });
  // Worked examples reveal their lines on a timer; check now and again for newly shown diagrams.
  setInterval(() => { if (!document.hidden) run(); }, 1500);
  if (document.readyState === 'complete') soon(0); else addEventListener('load', () => soon(0));
})();
