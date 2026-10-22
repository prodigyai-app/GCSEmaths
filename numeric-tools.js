/* Numerical input only: no JavaScript evaluation or arbitrary names. */
(function (root) {
  "use strict";
  function parseNumber(input) {
    if (input == null) return NaN;
    const notation=typeof module==='object'&&module.exports?require('./math-notation.js'):root.ProdigyMathNotation;
    let text = notation.normaliseMath(input).trim();
    // Only accept commas as thousands separators, never as a second expression.
    text = text.replace(/\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g, s => s.replace(/,/g, ""));
    if (!text || text.length > 300) return NaN;
    text = text.replace(/\b(sqrt|pi)\b/gi, s => s.toLowerCase()).replace(/x\s*10\s*\^/gi, "*10^");
    let at = 0, budget = 300;
    const space = () => { while (/\s/.test(text[at] || "") && at < text.length) at++; };
    const take = token => { space(); if (text.startsWith(token, at)) { at += token.length; return true; } return false; };
    function atom() {
      if (--budget < 0) throw Error("Too long");
      space();
      if (take("(")) { const n = sum(); if (!take(")")) throw Error("Missing bracket"); return n; }
      if (take("sqrt")) { if (!take("(")) throw Error("Use sqrt(...)"); const n = sum(); if (!take(")")) throw Error("Missing bracket"); return Math.sqrt(n); }
      if (take("pi")) return Math.PI;
      const token = text.slice(at).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
      if (!token) throw Error("Number expected"); at += token[0].length; return Number(token[0]);
    }
    function power() { const n = atom(); return take("^") ? n ** unary() : n; }
    function unary() { if (--budget < 0) throw Error("Too long"); if (take("+")) return unary(); if (take("-")) return -unary(); return power(); }
    function product() { let n = unary(); for (;;) { if (take("*")) n *= unary(); else if (take("/")) n /= unary(); else { space(); if (text[at] === "(" || text.startsWith("pi", at) || text.startsWith("sqrt", at)) n *= unary(); else break; } } return n; }
    function sum() { let n = product(); for (;;) { if (take("+")) n += product(); else if (take("-")) n -= product(); else break; } return n; }
    try { const n = sum(); space(); return at === text.length && Number.isFinite(n) ? n : NaN; } catch (_) { return NaN; }
  }
  function matches(value, answer, relative = .02, absolute = 0) {
    if (![value, answer, relative, absolute].every(Number.isFinite) || relative < 0 || absolute < 0) return false;
    return Math.abs(value - answer) <= Math.abs(answer) * relative + absolute + 8 * Number.EPSILON * Math.max(Math.abs(value), Math.abs(answer));
  }
  const api = {parseNumber, matches};
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NumericTools = api;
})(typeof window !== "undefined" ? window : globalThis);
