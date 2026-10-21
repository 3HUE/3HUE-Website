/* POST /api/quote/verify — step two of the gate: check the code, price the answers, store the page for 90 days, notify both sides. */
import { json, clip, readBody, rateLimited, sendMail } from '../_send.js';
import { verifiedCookie, newId } from '../../pricing/_auth.js';
import { buildQuote, money, CATALOG } from '../../pricing/_engine.js';

const SITE = 'https://3hue.net';
const KEYS = { driver: ['customer', 'audit', 'board', 'ai', 'incident', 'ahead'], accounts: ['1-3', '4-10', '10+'], entities: ['1', '2-5', '6+'], ai: ['yes', 'planning', 'no'],
  sector: ['financial', 'health', 'defense', 'saas', 'public', 'other'], operator: ['self', 'self_help', 'managed', 'unsure'], timeline: ['90', 'quarter', '6m', '12m', 'none'] };
const LISTS = { frameworks: ['soc2', 'hipaa', 'cmmc', 'iso27001', 'iso27701', 'pci', 'euai', 'nist', 'none'], clouds: ['aws', 'azure', 'gcp', 'm365', 'other'], extras: ['ir', 'vendors', 'engineering', 'foundation', 'board'] };
function sanitize(a) {
  const out = {}; if (!a || typeof a !== 'object') return out;
  for (const k in KEYS) if (KEYS[k].includes(a[k])) out[k] = a[k];
  for (const k in LISTS) if (Array.isArray(a[k])) out[k] = a[k].filter((v) => LISTS[k].includes(v)).slice(0, 10);
  if (Number.isFinite(+a.vendors)) out.vendors = Math.max(1, Math.min(50, Math.round(+a.vendors)));
  return out;
}

export async function onRequestPost({ request, env }) {
  if (!env.QUOTES) return json({ ok: false, error: 'The pricing builder is not switched on yet.' }, 503);
  if (rateLimited(request)) return json({ ok: false, error: 'Too many attempts. Try again in a few minutes.' }, 429);
  let b; try { b = await readBody(request); } catch (e) { return json({ ok: false, error: 'Could not read the form.' }, 400); }
  const email = clip(b.email, 254).trim().toLowerCase(), code = clip(b.code, 6).replace(/\D/g, '');
  if (!email || code.length !== 6) return json({ ok: false, error: 'Enter the six-digit code.' }, 400);
  const raw = await env.QUOTES.get(`verify:${email}`);
  if (!raw) return json({ ok: false, error: 'That code has expired. Send a new one.' }, 400);
  const rec = JSON.parse(raw);
  if (rec.attempts >= 5) { await env.QUOTES.delete(`verify:${email}`); return json({ ok: false, error: 'Too many wrong codes. Send a new one.' }, 400); }
  if (rec.code !== code) { rec.attempts += 1; await env.QUOTES.put(`verify:${email}`, JSON.stringify(rec), { expirationTtl: 600 }); return json({ ok: false, error: 'That code did not match.' }, 400); }
  await env.QUOTES.delete(`verify:${email}`);

  const answers = sanitize(b.answers);
  const name = clip(b.name, 120).trim() || rec.name, company = clip(b.company, 160).trim() || rec.company;
  const quote = buildQuote(answers);
  const id = newId(), createdAt = new Date().toISOString(), expiresAt = new Date(Date.now() + CATALOG.validityDays * 86400 * 1000).toISOString();
  const record = { id, createdAt, expiresAt, name, company, email, answers, quote, page: clip(b.page, 200) };
  await env.QUOTES.put(`quote:${id}`, JSON.stringify(record), { expirationTtl: CATALOG.validityDays * 86400, metadata: { company, name, email, lane: quote.laneName, monthly: quote.totals.monthly, annual: quote.totals.annual, oneTime: quote.totals.oneTime, createdAt } });
  const url = `${SITE}/pricing/for/${id}`;

  const lines = quote.lines.map((l) => `- ${l.name}: ${l.scoped ? 'scoped' : l.oneTime ? money(l.oneTime) + ' one time' : l.monthly ? money(l.monthly) + '/mo' : 'free'}${l.optional ? ' (optional)' : ''}`).join('\n');
  const summary = `${quote.laneName}\n${quote.headline}\n\n${lines}\n\nPer month: ${money(quote.totals.monthly)} (billed annually)\nPer year: ${money(quote.totals.annual)}\nOne-time: ${money(quote.totals.oneTime)}${quote.credit ? ` (${money(quote.credit)} credited to year one)` : ''}`;
  const visitor = sendMail(env, {
    to: email, replyTo: env.NOTIFY_TO,
    subject: `Your 3HUE pricing page: ${company}`,
    text: `${name},\n\nYour pricing page is ready and stays available for ${CATALOG.validityDays} days:\n${url}\n\n${summary}\n\nBook a 15-minute call: https://calendly.com/aramirez-vcio/15min\nReply to this email with any question.\n\n3HUE Executive Consulting · (954) 738-4454`,
    html: `<div style="font:16px/1.5 system-ui,sans-serif;color:#0f172a"><p>${esc(name)},</p><p>Your pricing page is ready and stays available for ${CATALOG.validityDays} days:</p><p><a href="${url}" style="display:inline-block;padding:12px 20px;background:#0579aa;color:#fff;border-radius:10px;text-decoration:none;font-weight:600">Open your pricing page</a></p><pre style="font:14px/1.5 ui-monospace,monospace;white-space:pre-wrap;background:#f3f8fc;padding:14px;border-radius:10px">${esc(summary)}</pre><p><a href="https://calendly.com/aramirez-vcio/15min">Book a 15-minute call</a> or reply to this email with any question.</p><p style="color:#5d6e86;font-size:13px">3HUE Executive Consulting · (954) 738-4454</p></div>`,
  });
  const sales = sendMail(env, {
    replyTo: email,
    subject: `New pricing page: ${company} · ${quote.laneName} · ${money(quote.totals.monthly)}/mo`,
    text: `${name} <${email}> at ${company}\n${url}\n\n${summary}\n\nAnswers: ${JSON.stringify(answers)}\nFrom page: ${record.page}\nCreated: ${createdAt} · expires ${expiresAt}`,
    html: `<div style="font:15px/1.5 system-ui,sans-serif;color:#0f172a"><p><b>${esc(name)}</b> &lt;${esc(email)}&gt; at <b>${esc(company)}</b></p><p><a href="${url}">${url}</a></p><pre style="font:13.5px/1.5 ui-monospace,monospace;white-space:pre-wrap;background:#f3f8fc;padding:14px;border-radius:10px">${esc(summary)}</pre><p style="color:#5d6e86;font-size:13px">Answers: ${esc(JSON.stringify(answers))}<br>From page: ${esc(record.page)}<br>Created ${createdAt} · expires ${expiresAt}</p></div>`,
  });
  const [v, s] = await Promise.all([visitor, sales]);
  if (!v.queued || !s.queued) console.log('quote/verify mail', JSON.stringify({ id, visitor: v, sales: s }));
  const cookie = await verifiedCookie(env, email);
  return new Response(JSON.stringify({ ok: true, id, url }), { status: 200, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'set-cookie': cookie } });
}
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const onRequestOptions = () => new Response(null, { status: 204, headers: { allow: 'POST' } });
