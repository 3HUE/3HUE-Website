// Backend bridge. With config.apiBase set, questions and emails go to the Cloudflare Worker (worker/).
// Without it, answers come from content/faq.json (keyword retrieval) and email falls back to a mailto draft.
let cfg = { apiBase: '' }, faq = null;

export async function init() {
  try { cfg = await (await fetch('content/config.json', { cache: 'no-cache' })).json(); } catch (e) {}
  try { faq = await (await fetch('content/faq.json', { cache: 'no-cache' })).json(); } catch (e) { faq = []; }
  return cfg;
}
export function hasBackend() { return !!(cfg.apiBase && cfg.apiBase.trim()); }
export function config() { return cfg; }

const STOP = new Set('the a an and or of to in on for with is are do does can how what why which your our we you i it about me my this that at as be by from'.split(' '));
function tokens(s) { return s.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w)); }

export function localAnswer(question) {
  const q = tokens(question); if (!faq || !faq.length) return null;
  let best = null, bs = 0;
  for (const f of faq) {
    const keys = new Set([...f.k, ...tokens(f.q)]);
    let s = 0; for (const w of q) { if (keys.has(w)) s += 2; else for (const k of keys) if (k.length > 4 && (w.startsWith(k) || k.startsWith(w))) { s += 1; break; } }
    const fq = tokens(f.q); if (fq.length && fq.every((w) => q.includes(w)) && q.every((w) => fq.includes(w))) s += 6; // near-verbatim question
    if (s > bs) { bs = s; best = f; }
  }
  return bs >= 2 ? best : null;
}

export async function ask(question, history, context) {
  if (!hasBackend()) {
    const f = localAnswer(question);
    if (f) return { answer: f.a, source: 'faq', matched: f.q, audio: f.audio };
    return { audio: 'media/voice/console-nokb.mp3', answer: "I don't have that in the tour materials yet. The fastest way to get an exact answer is 3HUE's Client Success team: 855-374-7129, success@3hue.net, or info.3hue.net/start-now. Would you like me to send that to your inbox, or is there something else about the programs I can help with?", source: 'none' };
  }
  const r = await fetch(cfg.apiBase.replace(/\/$/, '') + '/ask', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question, history: (history || []).slice(-8), context }) });
  if (!r.ok) throw new Error('ask failed ' + r.status);
  return await r.json();
}

/** Same neural voice as the tour, rendered by the Worker. Returns an object URL or null. */
export async function tts(text) {
  if (!hasBackend()) return null;
  try {
    const r = await fetch(cfg.apiBase.replace(/\/$/, '') + '/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    if (!r.ok) return null;
    return URL.createObjectURL(await r.blob());
  } catch (e) { return null; }
}

export async function sendEmail(payload) {
  if (!hasBackend()) {
    // Demo fallback: open a mailto draft to 3HUE with the content, so nothing is silently lost.
    const body = `Please send me this from the Inside 3HUE tour.\n\nName: ${payload.name}\nCompany: ${payload.company || '-'}\n\n${payload.subject}\n\n${payload.text}`;
    location.href = `mailto:${encodeURIComponent(cfg.notifyEmail || 'success@3hue.net')}?subject=${encodeURIComponent('[Inside 3HUE] ' + payload.subject)}&body=${encodeURIComponent(body.slice(0, 1800))}`;
    return { ok: true, demo: true };
  }
  const r = await fetch(cfg.apiBase.replace(/\/$/, '') + '/email', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('email failed ' + r.status);
  return await r.json();
}
