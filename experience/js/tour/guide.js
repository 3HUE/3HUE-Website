// The guide's presence (Ava): a luminous connected sphere of nodes and threads that breathes when idle,
// pulses with the voice while speaking, and tightens into a listening ring when the visitor talks.
const canvas = document.getElementById('guide');
const ctx = canvas.getContext('2d');
const mirrors = [];   // other canvases that show the same presence (console header, minimized pill)
export function drawOrbInto(c) { if (c && !mirrors.includes(c)) mirrors.push(c); }
const N = 96;
const pts = [];
for (let i = 0; i < N; i++) {
  // fibonacci sphere
  const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963;
  pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r, gold: i % 9 === 0 });
}
let mode = 'idle', level = 0, t = 0, raf = 0;
let analyser = null, data = null;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function attachAudio(audioEl) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const ac = new AC();
    const src = ac.createMediaElementSource(audioEl);
    analyser = ac.createAnalyser(); analyser.fftSize = 256; analyser.smoothingTimeConstant = 0.7;
    src.connect(analyser); analyser.connect(ac.destination);
    data = new Uint8Array(analyser.frequencyBinCount);
    document.addEventListener('pointerdown', () => { if (ac.state === 'suspended') ac.resume(); }, { once: true });
    guide.resume = () => { if (ac.state === 'suspended') ac.resume(); };
  } catch (e) { analyser = null; }
}
export function setMode(m) { mode = m; }
export const guide = { resume() {} };

function frame() {
  raf = requestAnimationFrame(frame);
  t += reduced ? 0 : 0.0085;
  // audio level
  let target = 0;
  if (mode === 'speaking' && analyser) { analyser.getByteFrequencyData(data); let s = 0; for (let i = 2; i < 40; i++) s += data[i]; target = Math.min(1, s / (38 * 140)); }
  else if (mode === 'speaking') target = 0.35 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.3);
  else if (mode === 'listening') target = 0.25 + 0.1 * Math.sin(t * 6);
  level += (target - level) * 0.25;

  const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
  ctx.clearRect(0, 0, W, H);
  const R = W * (0.30 + 0.05 * level + (mode === 'listening' ? 0.02 : 0)) * (1 + 0.012 * Math.sin(t * 2));
  // glow
  const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.55);
  g.addColorStop(0, `rgba(31,182,255,${0.20 + 0.35 * level})`); g.addColorStop(0.55, `rgba(31,182,255,${0.06 + 0.12 * level})`); g.addColorStop(1, 'rgba(31,182,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.55, 0, Math.PI * 2); ctx.fill();
  // rotate
  const ay = t * 0.9, ax = Math.sin(t * 0.5) * 0.35, ca = Math.cos(ay), sa = Math.sin(ay), cb = Math.cos(ax), sb = Math.sin(ax);
  const P = pts.map((p) => {
    let x = p.x * ca - p.z * sa, z = p.x * sa + p.z * ca, y = p.y;
    const y2 = y * cb - z * sb; z = y * sb + z * cb; y = y2;
    const wob = 1 + (mode === 'speaking' ? level * 0.12 * Math.sin(t * 20 + p.y * 6) : 0);
    return { x: cx + x * R * wob, y: cy + y * R * wob, z, gold: p.gold };
  });
  // threads (near neighbours)
  ctx.lineWidth = 1;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
    const a = P[i], b = P[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
    if (d < R * R * 0.22) {
      const depth = (a.z + b.z) / 2 + 1, al = (0.10 + 0.35 * depth / 2) * (0.6 + 0.8 * level);
      ctx.strokeStyle = (a.gold && b.gold) ? `rgba(255,214,58,${al})` : `rgba(31,182,255,${al})`;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }
  // nodes
  for (const p of P) {
    const depth = (p.z + 1) / 2, r = 1.2 + depth * 1.8 + level * 1.2;
    ctx.fillStyle = p.gold ? `rgba(255,214,58,${0.5 + 0.5 * depth})` : `rgba(210,240,255,${0.35 + 0.65 * depth})`;
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
  }
  // listening ring
  if (mode === 'listening') {
    ctx.strokeStyle = `rgba(31,182,255,${0.5 + 0.3 * Math.sin(t * 8)})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.28 + 3 * Math.sin(t * 8), 0, Math.PI * 2); ctx.stroke();
  }
  // core
  const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.42);
  core.addColorStop(0, `rgba(255,255,255,${0.55 + 0.4 * level})`); core.addColorStop(0.5, `rgba(255,214,58,${0.18 + 0.3 * level})`); core.addColorStop(1, 'rgba(255,214,58,0)');
  ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy, R * 0.42, 0, Math.PI * 2); ctx.fill();
  for (const m of mirrors) { if (!m.isConnected || m.offsetParent === null) continue; const mc = m.getContext('2d'); mc.clearRect(0, 0, m.width, m.height); mc.drawImage(canvas, 0, 0, m.width, m.height); }
}
export function startGuide() { if (!raf) frame(); }
