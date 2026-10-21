/* Shared helpers for the 3HUE Pages Functions.
   Env vars to set in the Cloudflare Pages project (Settings → Environment variables):
   - RESEND_API_KEY   API key from resend.com (the sending domain must be verified there)
   - NOTIFY_TO        inbox that receives contact-form and tool-result notifications, e.g. aramirez@3hue.net
   - FROM_ADDRESS     sender, e.g. "3HUE <no-reply@3hue.net>"
   Without RESEND_API_KEY the functions validate and log, and return 202 with {queued:false}, so the site never breaks. */

export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const isEmail = (s) => typeof s === 'string' && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export const clip = (s, n) => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, n) : '');

export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function readBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) return await request.json();
  const fd = await request.formData();
  return Object.fromEntries(fd.entries());
}

/* Light abuse control: 20 posts per IP per 10 minutes, kept in memory per isolate (good enough for a brochure site). */
const hits = new Map();
export function rateLimited(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  return arr.length > 20;
}

export async function sendMail(env, { subject, text, html, replyTo, to }) {
  if (!env.RESEND_API_KEY || !env.NOTIFY_TO) return { queued: false, reason: 'mail not configured' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_ADDRESS || '3HUE <no-reply@3hue.net>', to: [to || env.NOTIFY_TO], reply_to: replyTo || undefined, subject, text, html }),
  });
  if (!r.ok) return { queued: false, reason: `resend ${r.status}` };
  return { queued: true };
}
