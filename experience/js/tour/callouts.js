// Callouts: facts, chips and cards that appear beside the scene while the guide speaks.
const el = document.getElementById('callout');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let hideT = 0;

export function show(spec) {
  clearTimeout(hideT);
  if (!spec) return;
  el.classList.remove('out'); el.innerHTML = '';
  let html = '';
  if (spec.type === 'chips') {
    html = `<div class="co chips">${spec.title ? `<h4>${esc(spec.title)}</h4>` : ''}<ul>${spec.items.map((i, k) => `<li style="animation-delay:${300 + k * 420}ms">${esc(i)}</li>`).join('')}</ul></div>`;
  } else if (spec.type === 'stats') {
    html = `<div class="co stats ${spec.items.length === 2 ? 'n2' : ''}">${spec.items.map((s, k) => `<div style="animation-delay:${300 + k * 500}ms"><b>${esc(s.n)}</b><span>${esc(s.l)}</span></div>`).join('')}</div>`;
  } else if (spec.type === 'card') {
    html = `<div class="co card">${spec.img ? `<img src="${esc(spec.img)}" alt="">` : ''}<b>${esc(spec.title)}</b><p>${esc(spec.body)}</p></div>`;
  } else if (spec.type === 'image') {
    html = `<div class="co card"><img src="${esc(spec.src)}" alt=""><p>${esc(spec.cap)}</p></div>`;
  }
  el.innerHTML = html;
}
export function clear(delay = 0) {
  clearTimeout(hideT);
  if (!el.children.length) return;
  hideT = setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.innerHTML = ''; el.classList.remove('out'); }, 420); }, delay);
}
