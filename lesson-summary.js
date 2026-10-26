/* Shared: merge each lesson's "Key points" and "Common mistakes" cards into one
   "Lesson summary" card with two columns: Remember and Watch out.
   Works on the rendered page, so every course's lesson generator stays unchanged.
   Columns sit side by side on wide screens and stack on phones. */
(function () {
  'use strict';
  const CSS = '.lsum-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:16px 22px;align-items:start}'
    + '.lsum-cols h4{margin:0 0 10px;font-size:1rem;display:flex;align-items:center;gap:8px}'
    + '.lsum-cols h4::before{content:"";flex:none;width:10px;height:10px;border-radius:50%;background:var(--good,#5cc98a)}'
    + '.lsum-cols .lsum-bad h4::before{background:var(--bad,#f07a7a)}'
    + '.lsum-cols>section>:last-child{margin-bottom:0}';
  const head = c => { const h = c.querySelector(':scope > h3'); return h ? h.textContent.trim() : ''; };
  function col(card, cls, title) {
    const s = document.createElement('section');
    s.className = cls;
    const h = document.createElement('h4');
    h.textContent = title;
    s.appendChild(h);
    for (const n of [...card.childNodes]) if (!(n.nodeType === 1 && n.tagName === 'H3' && n.parentNode === card)) s.appendChild(n);
    return s;
  }
  function apply(root) {
    for (const key of (root || document).querySelectorAll('.lcard')) {
      if (key.dataset.lsum || !/^key points$/i.test(head(key))) continue;
      const bad = key.nextElementSibling;
      if (!bad || !bad.classList.contains('lcard') || !/^common mistakes$/i.test(head(bad))) continue;
      const cols = document.createElement('div');
      cols.className = 'lsum-cols';
      cols.append(col(key, 'lsum-good', 'Remember'), col(bad, 'lsum-bad', 'Watch out'));
      key.querySelector(':scope > h3').textContent = 'Lesson summary';
      key.appendChild(cols);
      key.classList.add('lsum');
      key.dataset.lsum = '1';
      bad.remove();
    }
  }
  if (!document.getElementById('lsum-style')) {
    const st = document.createElement('style');
    st.id = 'lsum-style'; st.textContent = CSS;
    document.head.appendChild(st);
  }
  window.LessonSummary = { apply };
  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => apply());
  window.addEventListener('load', () => apply());
  /* Some courses build lesson pages after load; merge those too. */
  let queued = false;
  const hasCard = n => n.nodeType === 1 && (n.classList.contains('lcard') || (n.firstElementChild && n.querySelector('.lcard')));
  new MutationObserver(list => {
    if (queued || !list.some(m => [...m.addedNodes].some(hasCard))) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
