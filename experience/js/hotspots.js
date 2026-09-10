// Hotspot pins: numbered badges anchored to normalized master coordinates.
// Desktop with free margins beside the building → "margin" mode: labels sit in the margins with leader lines
// (the concept-infographic idiom). Otherwise → "chip" mode: label chips sit beside the badge in the scene.
import { toScreen, onLayout, getState } from './stage.js';

const pinsEl = document.getElementById('pins');
const NS = 'http://www.w3.org/2000/svg';
let pins = [], leaders, glow, mode = 'chip';

export function buildPins(rooms, onSelect) {
  pinsEl.innerHTML = '';
  leaders = document.createElementNS(NS, 'svg'); leaders.id = 'leaders'; leaders.setAttribute('aria-hidden', 'true');
  pinsEl.appendChild(leaders);
  glow = document.createElement('div'); glow.id = 'room-glow'; glow.setAttribute('aria-hidden', 'true');
  pinsEl.appendChild(glow);

  pins = rooms.filter(r => r.hotspot).map((room, i) => {
    const n = String(room.order || i + 1).padStart(2, '0');
    const badge = document.createElement('button');
    badge.className = 'pin'; badge.type = 'button'; badge.tabIndex = -1;
    badge.dataset.room = room.id; badge.dataset.tone = room.streamColor || 'blue';
    badge.setAttribute('aria-hidden', 'true');
    badge.innerHTML = `<span class="dot"><b>${n}</b></span><span class="chip">${room.name}<span class="sub">${room.tagline || ''}</span></span>`;

    const label = document.createElement('button');
    label.className = 'label'; label.type = 'button';
    label.dataset.room = room.id; label.dataset.tone = room.streamColor || 'blue';
    label.setAttribute('aria-label', `${room.name}: ${room.tagline || ''}`);
    label.innerHTML = `<i>${n}</i><span class="name">${room.name}</span><span class="tag">${room.tagline || ''}</span>`;

    const line = document.createElementNS(NS, 'path'); line.dataset.room = room.id; line.setAttribute('class', room.streamColor || 'blue');
    leaders.appendChild(line);

    for (const el of [badge, label]) {
      el.addEventListener('click', () => onSelect(room));
      el.addEventListener('pointerenter', () => hover(room));
      el.addEventListener('pointerleave', () => hover(null));
      el.addEventListener('focus', () => hover(room));
      el.addEventListener('blur', () => hover(null));
    }
    pinsEl.appendChild(badge); pinsEl.appendChild(label);
    return { room, badge, label, line, side: room.label && room.label.side ? room.label.side : (room.hotspot.x < 0.5 ? 'left' : 'right') };
  });
  place();
  return pins;
}

function hover(room) {
  const id = room ? room.id : null;
  document.dispatchEvent(new CustomEvent('room:hover', { detail: id }));
  for (const p of pins) { p.badge.classList.toggle('hot', p.room.id === id); p.label.classList.toggle('hot', p.room.id === id); p.line.classList.toggle('hot', p.room.id === id); }
  if (room && room.bounds && !getState().inRoom) {
    const b = room.bounds;
    const a = toScreen(b.x, b.y), c = toScreen(b.x + b.w, b.y + b.h);
    glow.style.left = a.x + 'px'; glow.style.top = a.y + 'px'; glow.style.width = (c.x - a.x) + 'px'; glow.style.height = (c.y - a.y) + 'px';
    glow.dataset.tone = room.streamColor || 'blue';
    glow.classList.add('show');
  } else glow.classList.remove('show');
}

function place() {
  if (!leaders) return;
  const st = getState();
  const vw = window.innerWidth, vh = window.innerHeight;
  leaders.setAttribute('viewBox', `0 0 ${vw} ${vh}`); leaders.setAttribute('width', vw); leaders.setAttribute('height', vh);
  const safe = st.safe || { x: 0, y: 0, w: 1, h: 1 };
  const safeL = toScreen(safe.x, 0).x, safeR = toScreen(safe.x + safe.w, 0).x;
  const marginL = safeL, marginR = vw - safeR;
  mode = (vw >= 1024 && Math.min(marginL, marginR) >= 220) ? 'margin' : 'chip';
  pinsEl.dataset.mode = mode;

  for (const p of pins) {
    const s = toScreen(p.room.hotspot.x, p.room.hotspot.y);
    p.badge.style.left = s.x + 'px'; p.badge.style.top = s.y + 'px';
    p.x = s.x; p.y = s.y;
    const off = s.x < 24 || s.x > vw - 24 || s.y < 40 || s.y > vh - 40;
    p.badge.style.visibility = st.inRoom || off ? 'hidden' : 'visible';
    p.badge.dataset.side = s.x < vw / 2 ? 'right' : 'left';
  }
  if (mode !== 'margin') { for (const p of pins) { p.label.style.display = 'none'; p.line.setAttribute('d', ''); } return; }

  // Column layout: sort by anchor y, then push apart so labels never overlap.
  const hudH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hud-h')) || 56;
  const top = hudH + 16, bottom = vh - 64;
  for (const side of ['left', 'right']) {
    const col = pins.filter(p => p.side === side).sort((a, b) => a.y - b.y);
    for (const p of col) { p.label.style.display = ''; p.h = p.label.offsetHeight || 52; }
    const gap = 10;
    let ys = col.map(p => p.y);
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + (col[i - 1].h + col[i].h) / 2 + gap);
    const over = ys.length ? ys[ys.length - 1] + col[ys.length - 1].h / 2 - bottom : 0;
    if (over > 0) ys = ys.map(y => y - over);
    if (ys.length && ys[0] - col[0].h / 2 < top) { const d = top - (ys[0] - col[0].h / 2); ys = ys.map(y => y + d); }

    col.forEach((p, i) => {
      const ly = ys[i];
      const edge = side === 'left' ? marginL - 22 : safeR + 22;   // label's inner edge
      p.label.style.top = ly + 'px';
      if (side === 'left') { p.label.style.right = (vw - edge) + 'px'; p.label.style.left = ''; }
      else { p.label.style.left = edge + 'px'; p.label.style.right = ''; }
      p.label.dataset.side = side;
      // leader: badge → horizontal to the building edge → vertical to the label row → short stub to the label
      const kx = side === 'left' ? marginL - 6 : safeR + 6;
      const ex = side === 'left' ? edge - 8 : edge + 8;
      const d = Math.abs(ly - p.y) < 2 ? `M ${p.x} ${p.y} H ${ex}` : `M ${p.x} ${p.y} H ${kx} V ${ly} H ${ex}`;
      p.line.setAttribute('d', d);
      p.line.style.visibility = st.inRoom ? 'hidden' : 'visible';
      p.label.style.visibility = st.inRoom ? 'hidden' : 'visible';
    });
  }
}
onLayout(place);
window.addEventListener('resize', () => setTimeout(place, 80));

export function showPins(stagger = true) {
  pins.forEach((p, i) => setTimeout(() => { p.badge.classList.add('show'); p.label.classList.add('show'); p.line.classList.add('show'); }, stagger ? 110 * i : 0));
}
export function hidePins() { pins.forEach((p) => { p.badge.classList.remove('show'); p.label.classList.remove('show'); p.line.classList.remove('show'); }); glow.classList.remove('show'); }
