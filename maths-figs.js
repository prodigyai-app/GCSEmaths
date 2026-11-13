/* maths-figs.js: small, dependency-free SVG figure helper shared by the GCSE and A-level maths sites.
   Every function returns an SVG string. Colours come from the page's CSS variables (--ink, --accent,
   --sunk, --muted), so figures follow the light and dark themes. Labels get a halo in the figure
   background colour so a line passing behind them never strikes through the text.
   Usage: MF.fig(MF.svg(w, h, body, {label}), caption, {notAccurate:true}) */
(function (root) {
  'use strict';
  const r1 = v => Math.round(v * 10) / 10;
  const esc = s => String(s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const CSS = '.mf svg{display:block;width:100%;height:auto;max-width:var(--mf-max,520px);margin:0 auto}'
    + '.mf{margin:10px 0;background:var(--sunk,#f3f5f8);border:1px solid var(--line,#ccd);border-radius:8px;padding:10px}'
    + '.mf figcaption{font-size:.85rem;color:var(--muted,#555);margin-top:6px;line-height:1.4}'
    + '.mf .mf-na{font-style:italic}'
    + '.mf-ink{stroke:var(--ink,#123);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'
    + '.mf-thin{stroke:var(--muted,#667);fill:none;stroke-width:1;opacity:.7}'
    + '.mf-acc{stroke:var(--accent,#c4531a);fill:none;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}'
    + '.mf-dash{stroke-dasharray:6 5}'
    + '.mf-fill{fill:var(--accent,#c4531a);fill-opacity:.2;stroke:none}'
    + '.mf-fill2{fill:var(--ink,#123);fill-opacity:.12;stroke:none}'
    + '.mf-dot{fill:var(--ink,#123);stroke:none}.mf-dota{fill:var(--accent,#c4531a);stroke:none}'
    + '.mf-open{fill:var(--sunk,#fff);stroke:var(--ink,#123);stroke-width:2}'
    + '.mf-t{fill:var(--ink,#123);font:15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;paint-order:stroke;stroke:var(--sunk,#fff);stroke-width:4px;stroke-linejoin:round}'
    + '.mf-t.a{fill:var(--accent,#c4531a)}.mf-t.s{font-size:12.5px}.mf-t.b{font-weight:700}.mf-t.i{font-style:italic}';
  function injectCSS() {
    if (typeof document === 'undefined' || document.getElementById('mf-style')) return;
    const st = document.createElement('style'); st.id = 'mf-style'; st.textContent = CSS; document.head.appendChild(st);
  }
  injectCSS();

  /* primitives */
  const line = (x1, y1, x2, y2, cls = 'mf-ink') => `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" class="${cls}"/>`;
  const poly = (pts, cls = 'mf-ink', closed = true) => `<${closed ? 'polygon' : 'polyline'} points="${pts.map(p => r1(p[0]) + ',' + r1(p[1])).join(' ')}" class="${cls}"/>`;
  const path = (d, cls = 'mf-ink') => `<path d="${d}" class="${cls}"/>`;
  const dot = (x, y, cls = 'mf-dot', r = 3.6) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" class="${cls}"/>`;
  /* text with a halo; o: {a:'start'|'middle'|'end', acc, small, bold, italic} */
  function text(x, y, s, o = {}) {
    const c = ['mf-t', o.acc ? 'a' : '', o.small ? 's' : '', o.bold ? 'b' : '', o.italic ? 'i' : ''].filter(Boolean).join(' ');
    return `<text x="${r1(x)}" y="${r1(y)}" text-anchor="${o.a || 'middle'}" class="${c}">${o.raw ? s : esc(s)}</text>`;
  }
  /* geometry marks */
  const unit = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay) || 1; return [(bx - ax) / L, (by - ay) / L]; };
  /* right-angle square at corner P, between rays P→A and P→B */
  function rightAngle(P, A, B, s = 12) {
    const [ux, uy] = unit(P[0], P[1], A[0], A[1]), [vx, vy] = unit(P[0], P[1], B[0], B[1]);
    const p1 = [P[0] + ux * s, P[1] + uy * s], p2 = [p1[0] + vx * s, p1[1] + vy * s], p3 = [P[0] + vx * s, P[1] + vy * s];
    return poly([p1, p2, p3], 'mf-ink', false).replace('class="mf-ink"', 'class="mf-ink" style="stroke-width:1.5"');
  }
  /* n short ticks across the midpoint of segment AB (equal lengths) */
  function ticks(A, B, n = 1, len = 9, gap = 5) {
    const [ux, uy] = unit(A[0], A[1], B[0], B[1]), nx = -uy, ny = ux, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    let g = '';
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * gap, cx = mx + ux * o, cy = my + uy * o;
      g += line(cx - nx * len / 2, cy - ny * len / 2, cx + nx * len / 2, cy + ny * len / 2);
    }
    return g;
  }
  /* n chevrons at the midpoint of AB pointing from A towards B (parallel marks) */
  function parallel(A, B, n = 1, size = 7, gap = 6) {
    const [ux, uy] = unit(A[0], A[1], B[0], B[1]), nx = -uy, ny = ux, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2;
    let g = '';
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * gap, tx = mx + ux * (o + size / 2), ty = my + uy * (o + size / 2);
      g += poly([[tx - ux * size + nx * size * .6, ty - uy * size + ny * size * .6], [tx, ty], [tx - ux * size - nx * size * .6, ty - uy * size - ny * size * .6]], 'mf-ink', false);
    }
    return g;
  }
  /* angle arc at P from ray P→A to ray P→B (the smaller angle), optional label */
  function angle(P, A, B, r = 22, label = '', o = {}) {
    const a1 = Math.atan2(A[1] - P[1], A[0] - P[0]), a2 = Math.atan2(B[1] - P[1], B[0] - P[0]);
    let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const s = [P[0] + r * Math.cos(a1), P[1] + r * Math.sin(a1)], e = [P[0] + r * Math.cos(a1 + d), P[1] + r * Math.sin(a1 + d)];
    let g = path(`M${r1(s[0])} ${r1(s[1])} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${r1(e[0])} ${r1(e[1])}`, o.acc ? 'mf-acc' : 'mf-ink');
    if (label) { const m = a1 + d / 2, lr = r + (o.lr || 14); g += text(P[0] + lr * Math.cos(m), P[1] + lr * Math.sin(m) + 5, label, { acc: o.acc, small: o.small }); }
    return g;
  }
  /* label placed beside the midpoint of AB, on the side given by side=+1/-1 */
  function sideLabel(A, B, s, side = 1, off = 14, o = {}) {
    const [ux, uy] = unit(A[0], A[1], B[0], B[1]), nx = -uy * side, ny = ux * side;
    return text((A[0] + B[0]) / 2 + nx * off, (A[1] + B[1]) / 2 + ny * off + 5, s, o);
  }
  /* coordinate axes. o: {w,h,x:[a,b],y:[c,d],xstep,ystep,xlabEvery,ylabEvery,grid,xl,yl,pad,padL,padB}
     returns {X, Y, svg, fn(f,cls), shadeBetween(f,g,a,b), point(x,y,label)} */
  function axes(o) {
    const w = o.w || 360, h = o.h || 260, pad = o.pad ?? 18, padL = o.padL ?? 34, padB = o.padB ?? 28;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = x => padL + (x - x0) / (x1 - x0) * (w - padL - pad), Y = y => h - padB - (y - y0) / (y1 - y0) * (h - pad - padB);
    const ax = Y(Math.min(Math.max(0, y0), y1)), ay = X(Math.min(Math.max(0, x0), x1));
    let g = '';
    const xs = o.xstep || 1, ys = o.ystep || 1, xe = o.xlabEvery || 1, ye = o.ylabEvery || 1;
    const near = (v, s) => Math.abs(v / s - Math.round(v / s)) < 1e-6;
    if (o.grid) {
      for (let x = Math.ceil(x0 / xs) * xs; x <= x1 + 1e-9; x += xs) g += line(X(x), Y(y0), X(x), Y(y1), 'mf-thin');
      for (let y = Math.ceil(y0 / ys) * ys; y <= y1 + 1e-9; y += ys) g += line(X(x0), Y(y), X(x1), Y(y), 'mf-thin');
    }
    g += line(X(x0), ax, X(x1) + 6, ax) + line(ay, Y(y0), ay, Y(y1) - 6);
    g += poly([[X(x1) + 6, ax], [X(x1) - 2, ax - 4], [X(x1) - 2, ax + 4]], 'mf-dot') + poly([[ay, Y(y1) - 6], [ay - 4, Y(y1) + 2], [ay + 4, Y(y1) + 2]], 'mf-dot');
    let i = 0;
    for (let x = Math.ceil(x0 / xs) * xs; x <= x1 + 1e-9; x += xs, i++) {
      if (Math.abs(x) < 1e-9 && y0 < 0) continue;
      g += line(X(x), ax - 3, X(x), ax + 3);
      if (o.xlab !== false && near(Math.round(x / xs), xe)) g += text(X(x), ax + 17, +x.toFixed(4), { small: true });
    }
    for (let y = Math.ceil(y0 / ys) * ys; y <= y1 + 1e-9; y += ys) {
      if (Math.abs(y) < 1e-9) continue;
      g += line(ay - 3, Y(y), ay + 3, Y(y));
      if (o.ylab !== false && near(Math.round(y / ys), ye)) g += text(ay - 6, Y(y) + 4, +y.toFixed(4), { a: 'end', small: true });
    }
    if (o.xl) g += o.xlBelow ? text((X(x0) + X(x1)) / 2, ax + 36, o.xl, { italic: true }) : text(X(x1), ax - 8, o.xl, { a: 'end', italic: true });
    if (o.yl) g += text(ay + 8, Y(y1) + 4, o.yl, { a: 'start', italic: true });
    const api = {
      X, Y, w, h,
      fn(f, cls = 'mf-acc', a = x0, b = x1, n = 160) {
        let d = '', on = false;
        for (let k = 0; k <= n; k++) {
          const x = a + (b - a) * k / n, y = f(x);
          if (!isFinite(y) || y < y0 - (y1 - y0) * .02 || y > y1 + (y1 - y0) * .02) { on = false; continue; }
          d += (on ? 'L' : 'M') + r1(X(x)) + ' ' + r1(Y(y)); on = true;
        }
        return path(d, cls);
      },
      shadeBetween(f, gf, a, b, cls = 'mf-fill', n = 80) {
        const top = [], bot = [];
        for (let k = 0; k <= n; k++) { const x = a + (b - a) * k / n; top.push([X(x), Y(f(x))]); bot.push([X(x), Y(gf(x))]); }
        return poly(top.concat(bot.reverse()), cls);
      },
      point(x, y, label, lo = {}) { return dot(X(x), Y(y), lo.acc ? 'mf-dota' : 'mf-dot') + (label ? text(X(x) + (lo.dx ?? 8), Y(y) + (lo.dy ?? -8), label, { a: lo.a || 'start', acc: lo.acc, small: true }) : ''); }
    };
    api.svg = g;
    return api;
  }
  /* number line. o: {w,min,max,step,labelEvery,marks:[{v,label,acc,open}],arrows:[{from,to,label}],range:{a,b,openA,openB}} */
  function numberLine(o) {
    const w = o.w || 420, h = o.h || 80, pad = 24, y = o.y || 40;
    const X = v => pad + (v - o.min) / (o.max - o.min) * (w - 2 * pad);
    let g = line(X(o.min) - 10, y, X(o.max) + 10, y);
    const st = o.step || 1, le = o.labelEvery || 1; let i = 0;
    for (let v = o.min; v <= o.max + 1e-9; v += st, i++) {
      const big = i % le === 0;
      g += line(X(v), y - (big ? 7 : 4), X(v), y + (big ? 7 : 4));
      if (big && o.labels !== false) g += text(X(v), y + 24, +v.toFixed(6), { small: true });
    }
    if (o.range) { const { a, b } = o.range; g += line(X(a), y - 16, X(b), y - 16, 'mf-acc') + `<circle cx="${r1(X(a))}" cy="${y - 16}" r="5" class="${o.range.openA ? 'mf-open' : 'mf-dot'}"/><circle cx="${r1(X(b))}" cy="${y - 16}" r="5" class="${o.range.openB ? 'mf-open' : 'mf-dot'}"/>`; }
    (o.arrows || []).forEach(a => {
      const x1 = X(a.from), x2 = X(a.to), mid = (x1 + x2) / 2, top = y - 14 - Math.min(26, Math.abs(x2 - x1) * .35);
      g += path(`M${r1(x1)} ${y - 9} Q${r1(mid)} ${r1(top - 8)} ${r1(x2)} ${y - 9}`, 'mf-acc');
      const s = Math.sign(x2 - x1) || 1;
      g += poly([[x2, y - 9], [x2 - 7 * s, y - 15], [x2 - 2 * s, y - 17]], 'mf-dota');
      if (a.label) g += text(mid, top - 6, a.label, { acc: true, small: true });
    });
    (o.marks || []).forEach(m => {
      g += m.open ? `<circle cx="${r1(X(m.v))}" cy="${y}" r="5" class="mf-open"/>` : dot(X(m.v), y, m.acc ? 'mf-dota' : 'mf-dot', 4.5);
      if (m.label) g += text(X(m.v), y - (m.below ? -40 : 14), m.label, { acc: m.acc, small: true, bold: true });
    });
    return { svg: g, X, w, h };
  }
  /* bar model. o: {w, rows:[{label, parts:[{n, text, acc}], unit}], h} ; each part is n unit boxes */
  function barModel(o) {
    const rows = o.rows, w = o.w || 420, lw = o.labelW ?? 70, bh = o.bh || 34, gap = 22;
    const maxU = Math.max(...rows.map(r => r.parts.reduce((s, p) => s + p.n, 0)));
    const u = (w - lw - 16) / maxU;
    let g = '', y = 14;
    rows.forEach(r => {
      if (r.label) g += text(lw - 8, y + bh / 2 + 5, r.label, { a: 'end' });
      let x = lw;
      r.parts.forEach(p => {
        for (let k = 0; k < p.n; k++) g += `<rect x="${r1(x + k * u)}" y="${y}" width="${r1(u)}" height="${bh}" class="${p.acc ? 'mf-fill' : 'mf-fill2'}"/>` + `<rect x="${r1(x + k * u)}" y="${y}" width="${r1(u)}" height="${bh}" class="mf-ink" style="stroke-width:1.4"/>`;
        if (p.text) g += text(x + p.n * u / 2, y + bh / 2 + 5, p.text, { acc: p.acc, small: true, bold: true });
        x += p.n * u;
      });
      if (r.brace) { const x0 = lw, x1 = x; g += path(`M${r1(x0)} ${y + bh + 6} v6 H${r1(x1)} v-6`, 'mf-ink') + text((x0 + x1) / 2, y + bh + 27, r.brace, { small: true }); y += 22; }
      y += bh + gap;
    });
    return { svg: g, w, h: y };
  }
  /* wrap a body in an <svg> with a viewBox and an accessible name */
  const svg = (w, h, body, o = {}) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(o.label || 'Diagram')}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  /* figure with optional caption and the standard exam note */
  const fig = (s, cap = '', o = {}) => `<figure class="mf"${o.max ? ` style="--mf-max:${o.max}px"` : ''}>${s}${cap || o.notAccurate ? `<figcaption>${o.notAccurate ? '<span class="mf-na">Diagram NOT accurately drawn.</span> ' : ''}${cap}</figcaption>` : ''}</figure>`;
  const MF = { line, poly, path, dot, text, rightAngle, ticks, parallel, angle, sideLabel, axes, numberLine, barModel, svg, fig, esc, CSS, injectCSS };
  if (typeof module !== 'undefined' && module.exports) module.exports = MF;
  root.MF = MF;
})(typeof window !== 'undefined' ? window : globalThis);
