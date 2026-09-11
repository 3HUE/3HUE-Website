// Living scenes: the wall displays behave like live presentations (refresh sweeps, scan shimmer, breathing
// brightness, status blips), the atrium fabric pulses, signal packets travel the streams on the master plate,
// and dust motes drift through the light. Everything is drawn additively on a canvas that rides the same
// camera transform as the backdrop, from region specs in content/fx.json (normalized image coordinates).
let SPEC = {};
const layers = new Map();   // layerEl -> { canvas, ctx, img, spec, seed, motes }
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let raf = 0, t0 = performance.now();

export async function initFx() {
  try { SPEC = await (await fetch('content/fx.json', { cache: 'no-cache' })).json(); } catch (e) { SPEC = {}; }
  if (!reduced && !raf) raf = requestAnimationFrame(frame);
  return SPEC;
}

/** Bind (or rebind) a backdrop layer: the canvas is created once and reused; spec follows the image src. */
export function bindLayer(layerEl, img, src) {
  let L = layers.get(layerEl);
  if (!L) {
    const canvas = document.createElement('canvas'); canvas.className = 'fx'; layerEl.appendChild(canvas);
    L = { canvas, ctx: canvas.getContext('2d'), img, spec: null, seed: Math.random() * 1000, motes: [] };
    layers.set(layerEl, L);
  }
  const key = Object.keys(SPEC).find((k) => src.endsWith(k));
  L.spec = key ? SPEC[key] : null;
  L.src = src;
  if (!L.motes.length) for (let i = 0; i < 26; i++) L.motes.push({ x: Math.random(), y: Math.random(), r: 0.6 + Math.random() * 1.6, s: 0.008 + Math.random() * 0.016, ph: Math.random() * 6.28, dx: (Math.random() - 0.5) * 0.01 });
  return L.canvas;
}

function cover(L) {
  const W = L.canvas.width, H = L.canvas.height, iw = L.img.naturalWidth || 16, ih = L.img.naturalHeight || 9;
  const s = Math.max(W / iw, H / ih); const w = iw * s, h = ih * s;
  return { ox: (W - w) / 2, oy: (H - h) / 2, w, h };
}
const ease = (x) => x * x * (3 - 2 * x);
const TONE = { blue: [31, 182, 255], gold: [255, 214, 58], green: [46, 229, 157] };

function frame(now) {
  raf = requestAnimationFrame(frame);
  const t = (now - t0) / 1000;
  for (const [layerEl, L] of layers) {
    const on = layerEl.classList.contains('on');
    const cw = layerEl.clientWidth, ch = layerEl.clientHeight;
    if (!on || !cw || !ch || document.hidden) { if (L.canvas.width) { L.canvas.width = 0; } continue; }
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    if (L.canvas.width !== Math.round(cw * dpr) || L.canvas.height !== Math.round(ch * dpr)) { L.canvas.width = Math.round(cw * dpr); L.canvas.height = Math.round(ch * dpr); }
    const ctx = L.ctx, W = L.canvas.width, H = L.canvas.height;
    ctx.clearRect(0, 0, W, H);
    const c = cover(L);
    const X = (nx) => c.ox + nx * c.w, Y = (ny) => c.oy + ny * c.h;
    ctx.globalCompositeOperation = 'screen';
    const spec = L.spec || {};

    // ---- displays: live presentation feel
    (spec.screens || []).forEach((sc, i) => {
      const [rx, ry, rw, rh] = sc.r; const x = X(rx), y = Y(ry), w = rw * c.w, h = rh * c.h;
      const ph = L.seed + i * 1.7;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      // breathing brightness
      const br = 0.018 + 0.018 * Math.sin(t * 0.9 + ph);
      ctx.fillStyle = `rgba(190,225,255,${br.toFixed(3)})`; ctx.fillRect(x, y, w, h);
      // refresh sweep every ~8s: a soft diagonal band crossing the display
      const period = 7.5 + (i % 3); const u = ((t + ph * 0.37) % period) / period;
      if (u < 0.32) {
        const p = u / 0.32, sx = x - w * 0.4 + (w * 1.8) * p;
        const g = ctx.createLinearGradient(sx, y, sx + w * 0.35, y + h);
        g.addColorStop(0, 'rgba(160,220,255,0)'); g.addColorStop(0.5, `rgba(160,220,255,${(0.16 * Math.sin(p * Math.PI)).toFixed(3)})`); g.addColorStop(1, 'rgba(160,220,255,0)');
        ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      }
      // scan shimmer: a faint band drifting down
      const sv = ((t * 0.22 + ph * 0.13) % 1);
      const sg = ctx.createLinearGradient(0, y + sv * h - h * 0.06, 0, y + sv * h + h * 0.06);
      sg.addColorStop(0, 'rgba(120,200,255,0)'); sg.addColorStop(0.5, 'rgba(120,200,255,0.05)'); sg.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
      // status blips near the top-right corner (a "live" heartbeat) — only on larger displays
      if (w > W * 0.12) {
        for (let k = 0; k < 2; k++) {
          const bl = 0.5 + 0.5 * Math.sin(t * (2.2 + k * 0.9) + ph + k * 2);
          const col = k === 0 ? TONE.green : TONE.blue;
          ctx.fillStyle = `rgba(${col},${(0.55 * bl).toFixed(2)})`;
          ctx.beginPath(); ctx.arc(x + w - w * 0.03 - k * w * 0.025, y + h * 0.05, Math.max(1.2, w * 0.004), 0, 6.28); ctx.fill();
        }
        // a slow progress line along the bottom edge
        const pr = ((t * 0.05 + ph * 0.1) % 1);
        ctx.fillStyle = 'rgba(31,182,255,0.28)'; ctx.fillRect(x + w * 0.04, y + h * 0.965, w * 0.92 * pr, Math.max(1, h * 0.006));
      }
      ctx.restore();
    });

    // ---- glows: pulsing light sources (the fabric globe, hallway orbs)
    for (const g of (spec.glows || [])) {
      const [cx, cy] = g.c; const r = g.r * c.w; const col = TONE[g.tone] || TONE.blue;
      const a = 0.16 + 0.10 * Math.sin(t * 1.3 + L.seed);
      const rg = ctx.createRadialGradient(X(cx), Y(cy), r * 0.1, X(cx), Y(cy), r * 1.6);
      rg.addColorStop(0, `rgba(${col},${a.toFixed(3)})`); rg.addColorStop(0.5, `rgba(${col},${(a * 0.35).toFixed(3)})`); rg.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(X(cx), Y(cy), r * 1.6, 0, 6.28); ctx.fill();
    }

    // ---- streams: signal packets along quadratic paths (master plate)
    (spec.streams || []).forEach((st, i) => {
      const [p0, p1, p2] = st.p; const col = TONE[st.tone] || TONE.blue; const n = st.tone === 'gold' ? 3 : 2;
      for (let k = 0; k < n; k++) {
        const u = ((t * 0.16 + k / n + i * 0.11) % 1);
        const x = (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], y = (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1];
        const px = X(x), py = Y(y), rr = Math.max(2, c.w * 0.003);
        const rg = ctx.createRadialGradient(px, py, 0, px, py, rr * 5);
        rg.addColorStop(0, `rgba(255,255,255,0.9)`); rg.addColorStop(0.25, `rgba(${col},0.55)`); rg.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(px, py, rr * 5, 0, 6.28); ctx.fill();
      }
    });

    // ---- dust motes drifting through the light
    for (const m of L.motes) {
      m.y -= m.s * 0.016; m.x += m.dx * 0.016 + Math.sin(t * 0.5 + m.ph) * 0.0002;
      if (m.y < -0.02) { m.y = 1.02; m.x = Math.random(); }
      const a = 0.10 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.7 + m.ph));
      ctx.fillStyle = `rgba(225,240,255,${a.toFixed(3)})`; ctx.beginPath(); ctx.arc(m.x * W, m.y * H, m.r * dpr, 0, 6.28); ctx.fill();
    }
  }
}
