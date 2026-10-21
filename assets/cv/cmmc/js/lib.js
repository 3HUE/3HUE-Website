// Deterministic animation helpers. Every visual is a pure function of time t (seconds):
// no CSS transitions, no rAF state, so a frame rendered in isolation is identical to the
// same frame in a real-time preview.
(function () {
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, p) => a + (b - a) * p;
  const E = {
    linear: (p) => p,
    in: (p) => p * p * p,
    out: (p) => 1 - Math.pow(1 - p, 3),
    inOut: (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    expoOut: (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
    expoIn: (p) => (p <= 0 ? 0 : Math.pow(2, 10 * p - 10)),
    expoInOut: (p) => p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2,
    quintOut: (p) => 1 - Math.pow(1 - p, 5),
    quintInOut: (p) => (p < 0.5 ? 16 * p ** 5 : 1 - Math.pow(-2 * p + 2, 5) / 2),
    backOut: (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
    softBack: (p) => { const c1 = 0.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  };
  // progress of t through [a, b], eased
  const prog = (t, a, b, ease = E.linear) => ease(clamp((t - a) / (b - a)));
  // keyframes: [[t, value], ...], optional per-segment ease as third item of the *destination* key
  function kf(t, keys, ease = E.inOut) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      const [t1, v1, e1] = keys[i];
      if (t <= t1) {
        const [t0, v0] = keys[i - 1];
        const p = (e1 || ease)(clamp((t - t0) / (t1 - t0)));
        if (Array.isArray(v0)) return v0.map((x, j) => lerp(x, v1[j], p));
        return lerp(v0, v1, p);
      }
    }
    return keys[keys.length - 1][1];
  }
  // in/out envelope: 0 before a, ramps to 1 by a+ri, holds, ramps to 0 over [b-ro, b]
  const env = (t, a, b, ri = 0.3, ro = 0.3, ei = E.out, eo = E.in) =>
    t < a || t > b ? 0 : Math.min(ri ? ei(clamp((t - a) / ri)) : 1, ro ? 1 - eo(clamp((t - (b - ro)) / ro)) : 1);

  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') el.className = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k === 'html') el.innerHTML = v;
      else el.setAttribute(k, v);
    }
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  };
  const NS = 'http://www.w3.org/2000/svg';
  const s = (tag, attrs = {}, ...kids) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
    return el;
  };
  const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  // style setter that only writes on change (keeps the per-frame cost down)
  const set = (el, prop, val) => { if (el.__c?.[prop] !== val) { (el.__c ||= {})[prop] = val; el.style[prop] = val; } };
  const txt = (el, val) => { val = String(val); if (el.__t !== val) { el.__t = val; el.textContent = val; } };
  // seeded pseudo-random, stable across renders
  const rng = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

  window.L = { clamp, lerp, E, prog, kf, env, h, s, fmt, set, txt, rng };
})();
