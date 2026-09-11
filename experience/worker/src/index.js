// Inside 3HUE — tour backend (Cloudflare Worker).
//   POST /ask    { question, history[], context } → { answer, source:'claude' }
//   POST /email  { name, email, company, consent, subject, text, kind, tour } → { ok }
//   POST /lead   { name, email, company, note } → { ok }
// Secrets (wrangler secret put): ANTHROPIC_API_KEY, RESEND_API_KEY. Vars in wrangler.toml: FROM_EMAIL, NOTIFY_EMAIL, ALLOWED_ORIGINS, MODEL.
import KB from '../../content/kb.md';

const json = (o, status = 200, extra = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', ...extra } });

function cors(req, env) {
  const origin = req.headers.get('origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim());
  const ok = allowed.includes('*') || allowed.includes(origin);
  return { 'access-control-allow-origin': ok ? (origin || '*') : 'null', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type', 'vary': 'origin' };
}

const SYSTEM = `You are AiVRIC, the guide inside 3HUE's "Inside the ISG building" tour. Answer visitor questions about 3HUE's Information Security Group, its managed programs, engagement model, pricing approach, compliance coverage, and how to get started.
Rules: answer ONLY from the knowledge base below. If something isn't covered, say so plainly and point to Client Success (855-374-7129, success@3hue.net, info.3hue.net/start-now). Never invent prices, client names, certifications, or guarantees. Keep answers conversational and tight: 2–5 sentences, spoken-word friendly (they are read aloud), no markdown, no bullet lists, no headings. If the question is about a specific executive audience (CEO, CFO, CIO, board), use that audience's justification points. If asked who you are: you are AiVRIC, the risk intelligence fabric — a 3HUE platform — acting as the tour guide.

KNOWLEDGE BASE:
${KB}`;

async function askClaude(env, question, history, context) {
  const msgs = [];
  for (const h of (history || []).slice(-8)) if (h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string') msgs.push({ role: h.role, content: h.content.slice(0, 1500) });
  const ctx = context ? `\n\n(Visitor context — current tour scene: ${context.node || '-'}; answers so far: ${JSON.stringify(context.answers || {})})` : '';
  msgs.push({ role: 'user', content: question.slice(0, 1000) + ctx });
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: env.MODEL || 'claude-sonnet-4-5', max_tokens: 400, system: SYSTEM, messages: msgs }),
  });
  if (!r.ok) throw new Error('anthropic ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const d = await r.json();
  return (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
}

const escHtml = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function emailHtml(title, text, name) {
  const body = escHtml(text).replace(/\n/g, '<br>');
  return `<!doctype html><html><body style="margin:0;background:#0a1220;font-family:Inter,Segoe UI,Arial,sans-serif;color:#e8eef6">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px">
    <div style="font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#1fb6ff;margin-bottom:8px">Inside 3HUE</div>
    <h1 style="font-size:22px;font-weight:500;margin:0 0 18px">${escHtml(title)}</h1>
    <p style="color:#9fb0c4;margin:0 0 18px">Hi ${escHtml(name || 'there')}, here's what AiVRIC put together for you during the tour.</p>
    <div style="background:#0e1a2b;border:1px solid rgba(226,232,240,.14);border-radius:12px;padding:18px;line-height:1.6;font-size:15px">${body}</div>
    <p style="margin:24px 0 0;color:#9fb0c4;font-size:14px">Ready to talk? 3HUE Client Success · <a style="color:#1fb6ff" href="tel:8553747129">855-374-7129</a> · <a style="color:#1fb6ff" href="mailto:success@3hue.net">success@3hue.net</a> · <a style="color:#1fb6ff" href="https://info.3hue.net/start-now">info.3hue.net/start-now</a></p>
    <p style="margin:24px 0 0;color:#64748b;font-size:12px">You received this because you asked for it inside the 3HUE tour. 3HUE Executive Consulting · 3hue.net</p>
  </div></body></html>`;
}
async function resend(env, to, subject, html, text, replyTo) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${env.RESEND_API_KEY}` },
    body: JSON.stringify({ from: env.FROM_EMAIL || 'AiVRIC at 3HUE <tour@3hue.net>', to: [to], subject, html, text, reply_to: replyTo || env.NOTIFY_EMAIL }),
  });
  if (!r.ok) throw new Error('resend ' + r.status + ' ' + (await r.text()).slice(0, 200));
  return r.json();
}
const validEmail = (e) => typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e) && e.length < 200;

// very small per-IP rate limit (in-memory per isolate; good enough to stop casual abuse)
const hits = new Map();
function limited(req, max = 30) {
  const ip = req.headers.get('cf-connecting-ip') || 'x', now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 600000); arr.push(now); hits.set(ip, arr);
  return arr.length > max;
}

export default {
  async fetch(req, env) {
    const h = cors(req, env);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    if (req.method !== 'POST') return json({ ok: true, service: 'inside-3hue-tour' }, 200, h);
    if (h['access-control-allow-origin'] === 'null') return json({ error: 'origin not allowed' }, 403, h);
    if (limited(req)) return json({ error: 'slow down' }, 429, h);
    const url = new URL(req.url);
    let body; try { body = await req.json(); } catch (e) { return json({ error: 'bad json' }, 400, h); }
    try {
      if (url.pathname.endsWith('/ask')) {
        const q = String(body.question || '').trim(); if (!q) return json({ error: 'question required' }, 400, h);
        const answer = await askClaude(env, q, body.history, body.context);
        return json({ answer, source: 'claude' }, 200, h);
      }
      if (url.pathname.endsWith('/email')) {
        if (!validEmail(body.email)) return json({ error: 'valid email required' }, 400, h);
        const name = String(body.name || '').slice(0, 120), company = String(body.company || '').slice(0, 160);
        const subject = String(body.subject || 'Your Inside 3HUE tour').slice(0, 150), text = String(body.text || '').slice(0, 8000);
        await resend(env, body.email, subject, emailHtml(subject, text, name), text);
        // notify Client Success with the lead + what was sent
        const lead = `New tour lead\n\nName: ${name}\nEmail: ${body.email}\nCompany: ${company || '-'}\nFollow-up OK: ${body.consent ? 'yes' : 'no'}\nKind: ${body.kind || '-'}\n\nTour answers: ${JSON.stringify(body.tour && body.tour.answers || {})}\nVisited: ${(body.tour && body.tour.visited || []).join(', ')}\n\n--- sent to visitor ---\n${subject}\n\n${text}`;
        if (env.NOTIFY_EMAIL) await resend(env, env.NOTIFY_EMAIL, `[Inside 3HUE] ${name || body.email} — ${body.kind || 'email'}`, `<pre style="font-family:monospace;white-space:pre-wrap">${escHtml(lead)}</pre>`, lead, body.email).catch(() => {});
        return json({ ok: true }, 200, h);
      }
      if (url.pathname.endsWith('/lead')) {
        if (!validEmail(body.email)) return json({ error: 'valid email required' }, 400, h);
        const lead = `New tour lead\n\nName: ${body.name || ''}\nEmail: ${body.email}\nCompany: ${body.company || '-'}\nNote: ${body.note || '-'}`;
        if (env.NOTIFY_EMAIL) await resend(env, env.NOTIFY_EMAIL, `[Inside 3HUE] lead — ${body.email}`, `<pre>${escHtml(lead)}</pre>`, lead, body.email);
        return json({ ok: true }, 200, h);
      }
      return json({ error: 'not found' }, 404, h);
    } catch (e) {
      return json({ error: String(e.message || e) }, 502, h);
    }
  },
};
