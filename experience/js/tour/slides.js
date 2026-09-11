// In-room presentation: the main wall display in each scene shows a slide that advances with Ava's
// narrative. Each surface is an HTML element mapped onto the display's four corners (content/fx.json
// `slide.q`, normalized image coordinates) with a CSS matrix3d homography, so it sits in perspective on the
// rendered screen. The backdrop itself no longer moves — the life in the room comes from the screens.
const scene = document.getElementById('scene');
const host = document.getElementById('slides');
let SPEC = {}, surf = null, cur = { node: null, src: null, quad: null, img: null, base: null };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function initSlides(spec) { SPEC = spec || {}; addEventListener('resize', layout); }

/** Called after the backdrop for `node` is showing. Creates (or drops) the surface for this scene. */
export function setSlideScene(node) {
  const key = Object.keys(SPEC).find((k) => node.bg.endsWith(k));
  const q = key && SPEC[key].slide ? SPEC[key].slide.q : null;
  cur.node = node;
  if (!q) { if (surf) { surf.classList.remove('on'); setTimeout(() => surf && surf.remove(), 900); surf = null; } cur.quad = null; return; }
  const img = scene.querySelector('.bg.on img') || scene.querySelector('.bg img');
  const same = surf && cur.src === node.bg;
  cur.src = node.bg; cur.quad = q; cur.img = img;
  if (!same) {
    if (surf) { const old = surf; old.classList.remove('on'); setTimeout(() => old.remove(), 900); }
    surf = document.createElement('div'); surf.className = 'surf'; surf.innerHTML = '<div class="slide"></div><i class="glass"></i>';
    host.appendChild(surf);
    layout();
    requestAnimationFrame(() => surf && surf.classList.add('on'));
  }
}

/** Advance the presentation to line `i` of the current node. */
export function showSlide(node, i) {
  if (!surf || !cur.quad) return;
  const line = node.lines[i]; const s = line.show || {};
  const room = node.chapter || '3HUE';
  let body = '';
  if (s.type === 'chips') {
    body = `<h1>${esc(s.title || room)}</h1><ul>${s.items.map((t, k) => `<li style="animation-delay:${350 + k * 380}ms"><i></i>${esc(t)}</li>`).join('')}</ul>`;
  } else if (s.type === 'stats') {
    body = `<h1>${esc(room)}</h1><div class="stats n${s.items.length}">${s.items.map((x, k) => `<div style="animation-delay:${350 + k * 420}ms"><b>${esc(x.n)}</b><span>${esc(x.l)}</span></div>`).join('')}</div>`;
  } else if (s.type === 'card') {
    body = `<h1>${esc(s.title)}</h1><div class="row">${s.img ? `<img src="${esc(s.img)}" alt="">` : ''}<p>${esc(s.body)}</p></div>`;
  } else if (s.type === 'photo') {
    body = `<h1>${esc(room)}</h1><div class="row"><img src="${esc(s.src)}" alt=""><p>${esc(s.cap)}</p></div>`;
  } else {
    body = `<h1>${esc(room)}</h1><p class="quote">${esc(keyPhrase(line.text))}</p>${bars()}`;
  }
  const n = node.lines.length;
  const dots = Array.from({ length: n }, (_, k) => `<i class="${k < i ? 'done' : k === i ? 'now' : ''}"></i>`).join('');
  const el = surf.querySelector('.slide');
  const next = document.createElement('div'); next.className = 'pg';
  next.innerHTML = `<header><span class="brand"><b>3HUE</b> · Client Vision</span><span class="live"><i></i>LIVE</span></header><div class="body">${body}</div><footer><span class="dots">${dots}</span><span class="num">${i + 1} / ${n}</span></footer>`;
  const prev = el.querySelector('.pg');
  if (prev) { prev.classList.add('out'); setTimeout(() => prev.remove(), 700); }
  el.appendChild(next); void next.offsetWidth; next.classList.add('in');
}

function keyPhrase(text) {
  // First sentence, trimmed to a headline-sized talking point.
  let s = (text.match(/^[^.!?—]+[.!?]?/) || [text])[0].trim().replace(/[,;:]$/, '');
  if (s.length > 110) s = s.slice(0, 107).replace(/\s+\S*$/, '') + '…';
  return s;
}
function bars() {
  const h = [38, 62, 48, 80, 56, 92, 70, 84];
  return `<div class="bars">${h.map((v, k) => `<i style="--h:${v}%;animation-delay:${400 + k * 90}ms"></i>`).join('')}</div>`;
}

// ---------------------------------------------------------------- geometry
function layout() {
  if (!surf || !cur.quad) return;
  const W = scene.clientWidth, H = scene.clientHeight; if (!W || !H) return;
  const iw = (cur.img && cur.img.naturalWidth) || 1672, ih = (cur.img && cur.img.naturalHeight) || 941;
  const sc = Math.max(W / iw, H / ih), w = iw * sc, h = ih * sc, ox = (W - w) / 2, oy = (H - h) / 2;
  const P = cur.quad.map(([x, y]) => [ox + x * w, oy + y * h]);
  // base size in CSS px: match the display's on-screen size so text renders at native resolution
  const bw = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), bh = Math.hypot(P[3][0] - P[0][0], P[3][1] - P[0][1]);
  const base = 640, bhh = Math.round(base * (bh / bw));
  surf.style.width = base + 'px'; surf.style.height = bhh + 'px';
  surf.style.fontSize = (base / 38).toFixed(2) + 'px';
  surf.style.transform = matrix3d([[0, 0], [base, 0], [base, bhh], [0, bhh]], P);
}
// Homography from the unit square → quad, expressed as a CSS matrix3d (column-major).
function adj(m) { return [m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4], m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5], m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3]]; }
function mul(a, b) { const c = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { let s = 0; for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j]; c[3 * i + j] = s; } return c; }
function basis(p) {
  const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1];
  const A = adj(m); const x = [A[0] * p[3][0] + A[1] * p[3][1] + A[2], A[3] * p[3][0] + A[4] * p[3][1] + A[5], A[6] * p[3][0] + A[7] * p[3][1] + A[8]];
  return mul(m, [x[0], 0, 0, 0, x[1], 0, 0, 0, x[2]]);
}
function matrix3d(src, dst) {
  const s = basis(src), d = basis(dst); const t = mul(d, adj(s));
  const n = t[8] || 1; const m = t.map((v) => v / n);
  const M = [m[0], m[3], 0, m[6], m[1], m[4], 0, m[7], 0, 0, 1, 0, m[2], m[5], 0, m[8]];
  return `matrix3d(${M.map((v) => v.toFixed(6)).join(',')})`;
}
