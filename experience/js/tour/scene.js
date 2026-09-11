// Cinematic backdrop: two layers cross-fade; a slow camera move (position + zoom) runs across each scene.
const layers = [document.getElementById('bg-a'), document.getElementById('bg-b')];
const card = document.getElementById('title-card');
let cur = 0, lastSrc = null, cardT = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOTION = 'still';   // 'still' | 'drift'

const animOk = new Map();   // anim url -> boolean (exists)
const probe = document.createElement('video');
const EXT = probe.canPlayType('video/mp4; codecs="avc1.42E01E"') ? '.mp4' : (probe.canPlayType('video/webm; codecs="vp9"') ? '.webm' : null);
function animFor(src) { return EXT && 'media/scene/anim/' + src.split('/').pop().replace(/\.jpe?g$/i, EXT); }
async function hasAnim(url) {
  if (animOk.has(url)) return animOk.get(url);
  let ok = false; try { ok = (await fetch(url, { method: 'HEAD', cache: 'force-cache' })).ok; } catch (e) {}
  animOk.set(url, ok); return ok;
}
/** Swap the still for its baked-motion loop (media/scene/anim/*.mp4) when one exists. */
async function attachAnim(layer, src) {
  const v = layer.querySelector('video'); if (!v || reduced) return;
  const url = animFor(src);
  if (!url || !(await hasAnim(url))) { v.removeAttribute('src'); layer.classList.remove('live'); return; }
  if (!v.src.endsWith(url)) { v.src = url; v.load(); }
  v.play().then(() => layer.classList.add('live')).catch(() => layer.classList.remove('live'));
}
function load(img, src) {
  return new Promise((res) => { if (img.src.endsWith(src)) return res(); img.onload = () => res(); img.onerror = () => res(); img.src = src; });
}
function transformFor(p) {
  // p: {x,y,z} normalized focus point + zoom; object-fit:cover keeps the frame full, we translate so the focus stays centered-ish.
  const dx = (0.5 - p.x) * 100 * (p.z - 1) * 1.6, dy = (0.5 - p.y) * 100 * (p.z - 1) * 1.6;
  return `translate(calc(-50% + ${dx.toFixed(2)}%), calc(-50% + ${dy.toFixed(2)}%)) scale(${p.z})`;
}

/** Show a backdrop and start its camera move over `durMs`. Same image → just continue with a new move. */
export async function setScene(src, cam, durMs) {
  const same = src === lastSrc;
  const layer = same ? layers[cur] : layers[1 - cur];
  const img = layer.querySelector('img');
  await load(img, src);
  attachAnim(layer, src);
  // The camera holds still (whole-frame motion was uncomfortable for visitors). Any motion in the room is
  // baked into the backdrop itself (media/scene/anim/*.mp4, built by tools/build-anim.py). MOTION = 'drift'
  // re-enables a barely-there settle if ever wanted.
  const rest = { x: 0.5, y: 0.5, z: 1 };
  const from = MOTION === 'drift' && cam ? { x: cam.to.x, y: cam.to.y, z: 1.02 } : rest;
  const video = layer.querySelector('video');
  img.style.transition = 'none'; if (!same) img.style.transform = transformFor(from);
  void img.offsetWidth;
  img.style.transition = (reduced || MOTION !== 'drift') ? 'none' : `transform ${Math.max(6000, durMs || 12000)}ms ease-out`;
  img.style.transform = transformFor(MOTION === 'drift' ? { x: cam ? cam.to.x : 0.5, y: cam ? cam.to.y : 0.5, z: 1.0 } : rest);
  if (video) video.style.transform = img.style.transform;   // the loop sits exactly on the still
  if (!same) {
    layer.classList.add('on');
    layers[cur].classList.remove('on');
    const old = layers[cur]; setTimeout(() => { if (!old.classList.contains('on')) { const ov = old.querySelector('video'); if (ov) ov.pause(); } }, 1500);
    cur = 1 - cur; lastSrc = src;
  }
}

export function showTitle(eyebrow, title, ms = 2600) {
  card.querySelector('i').textContent = eyebrow || '';
  card.querySelector('b').textContent = title || '';
  card.classList.remove('show'); void card.offsetWidth; card.classList.add('show');
  clearTimeout(cardT); cardT = setTimeout(() => card.classList.remove('show'), ms);
}
export function hideTitle() { clearTimeout(cardT); card.classList.remove('show'); }
