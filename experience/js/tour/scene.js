// Cinematic backdrop: two layers cross-fade; a slow camera move (position + zoom) runs across each scene.
import { bindLayer } from './fx.js';
const layers = [document.getElementById('bg-a'), document.getElementById('bg-b')];
const card = document.getElementById('title-card');
let cur = 0, lastSrc = null, cardT = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  const from = cam ? cam.from : { x: 0.5, y: 0.5, z: 1 }, to = cam ? cam.to : { x: 0.5, y: 0.5, z: 1.06 };
  const fx = bindLayer(layer, img, src);   // living-scene overlay rides the same camera move
  const els = [img, fx];
  for (const el of els) { el.style.transition = 'none'; if (!same) el.style.transform = transformFor(from); }
  void img.offsetWidth;
  for (const el of els) { el.style.transition = reduced ? 'none' : `transform ${Math.max(4000, durMs || 12000)}ms linear`; el.style.transform = transformFor(to); }
  if (!same) {
    layer.classList.add('on');
    layers[cur].classList.remove('on');
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
