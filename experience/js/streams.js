// Information streams: SVG paths traced over the master render, animated dash flow.
// Path coordinates are in master image pixels (see tools/hotspot-tool.html).

const svg = document.getElementById('streams');
let paths = [];

export function buildStreams(streams, W, H) {
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W); svg.setAttribute('height', H);
  svg.innerHTML = `<defs>
    <radialGradient id="atrium-glow"><stop offset="0" stop-color="#ffd63a" stop-opacity="0.35"/><stop offset="0.45" stop-color="#1fb6ff" stop-opacity="0.12"/><stop offset="1" stop-color="#1fb6ff" stop-opacity="0"/></radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>`;
  const glow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
  glow.setAttribute('class', 'atrium'); glow.setAttribute('cx', W * 0.5); glow.setAttribute('cy', H * 0.31);
  glow.setAttribute('rx', W * 0.13); glow.setAttribute('ry', H * 0.2); glow.setAttribute('fill', 'url(#atrium-glow)');
  svg.appendChild(glow);
  let n = 0;
  paths = (streams || []).map((s) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', s.d);
    p.setAttribute('class', s.color || 'blue');
    p.setAttribute('vector-effect', 'non-scaling-stroke');
    if (s.room) p.dataset.room = s.room;
    if (s.delay) p.style.animationDelay = `-${s.delay}s`;
    p.id = 'stream-' + (n++);
    svg.appendChild(p);
    // light packets travelling along the stream
    const len = p.getTotalLength(), dur = Math.max(2.5, len / 220);
    const count = s.color === 'gold' ? 3 : 2;
    for (let k = 0; k < count; k++) {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('r', s.color === 'gold' ? 5 : 4); c.setAttribute('class', 'packet ' + (s.color || 'blue'));
      if (s.room) c.dataset.room = s.room;
      const am = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
      am.setAttribute('dur', dur + 's'); am.setAttribute('repeatCount', 'indefinite'); am.setAttribute('begin', (-(k * dur / count) - (s.delay || 0)) + 's');
      const mp = document.createElementNS('http://www.w3.org/2000/svg', 'mpath'); mp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + p.id); mp.setAttribute('href', '#' + p.id);
      am.appendChild(mp); c.appendChild(am); svg.appendChild(c);
    }
    return p;
  });
  document.addEventListener('room:hover', (e) => {
    const id = e.detail;
    for (const p of paths) {
      p.classList.toggle('dim', !!id && p.dataset.room !== id && p.dataset.room !== 'all');
      p.classList.toggle('hot', !!id && p.dataset.room === id);
    }
    svg.querySelectorAll('.packet').forEach((c) => c.classList.toggle('dim', !!id && c.dataset.room !== id && c.dataset.room !== 'all'));
  });
  return paths;
}

// Reveal choreography: draw each path in from its source, gold last.
export function revealStreams() {
  const order = [...paths].sort((a, b) => (a.classList.contains('gold') ? 1 : 0) - (b.classList.contains('gold') ? 1 : 0));
  order.forEach((p, i) => {
    const len = p.getTotalLength();
    p.style.opacity = '0';
    p.style.transition = 'none';
    p.style.strokeDasharray = `${len} ${len}`;
    p.style.strokeDashoffset = `${len}`;
    p.style.animation = 'none';
    setTimeout(() => {
      p.style.transition = 'stroke-dashoffset 1400ms cubic-bezier(0.22,0.61,0.36,1), opacity 300ms';
      p.style.opacity = '';
      p.style.strokeDashoffset = '0';
      setTimeout(() => { // hand back to the flowing dash animation
        p.style.transition = 'none';
        p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.animation = '';
      }, 1500);
    }, 200 + i * 180);
  });
}
