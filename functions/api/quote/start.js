/* POST /api/quote/start — the pricing builder's gate, step one: a six-digit code to a work email.
   Needs the KV binding QUOTES and the Resend variables. Free and disposable mailboxes are refused; the domain must receive mail. */
import { json, isEmail, clip, readBody, rateLimited, sendMail } from '../_send.js';
import { sixDigits } from '../../pricing/_auth.js';

const FREE = /^(gmail|googlemail|yahoo|ymail|rocketmail|aol|hotmail|outlook|live|msn|icloud|me|mac|protonmail|proton|pm|gmx|mail|email|yandex|zoho|fastmail|hey|tutanota|tuta|duck|duckduckgo|comcast|att|verizon|sbcglobal|cox|charter|earthlink|qq|163|126|naver|web|t-online|orange|free|laposte|libero|seznam|wp|o2|hushmail|mailinator|guerrillamail|10minutemail|temp-mail|tempmail|yopmail|trashmail|sharklasers|dispostable|getnada|mohmal|throwam)\.(com|net|org|co|io|me|de|fr|it|es|nl|pl|cz|ru|cn|jp|kr|ca|uk|co\.uk|com\.au|com\.br|info|xyz)$/i;
const looksDisposable = (d) => /(temp|trash|disposable|throw|fake|spam|guerrilla|mailinator|yopmail|minute)/i.test(d);

async function receivesMail(domain) {
  try {
    const q = async (type) => { const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`, { headers: { accept: 'application/dns-json' } }); const j = await r.json(); return (j.Answer || []).length > 0; };
    return (await q('MX')) || (await q('A'));
  } catch (e) { return true; } // if the resolver is unreachable, do not block a real buyer
}

export async function onRequestPost({ request, env }) {
  if (!env.QUOTES) return json({ ok: false, error: 'The pricing builder is not switched on yet. Book a call and we will price it with you.' }, 503);
  if (rateLimited(request)) return json({ ok: false, error: 'Too many requests. Try again in a few minutes.' }, 429);
  let b; try { b = await readBody(request); } catch (e) { return json({ ok: false, error: 'Could not read the form.' }, 400); }
  if (b.company_website) return json({ ok: true });
  const email = clip(b.email, 254).trim().toLowerCase(), name = clip(b.name, 120).trim(), company = clip(b.company, 160).trim();
  if (!name || !company) return json({ ok: false, error: 'Add your name and company.' }, 400);
  if (!isEmail(email)) return json({ ok: false, error: 'Enter a work email address.' }, 400);
  const domain = email.split('@')[1];
  if (FREE.test(domain) || looksDisposable(domain)) return json({ ok: false, error: 'Use your work email; free and disposable mailboxes are not accepted.' }, 400);
  if (!(await receivesMail(domain))) return json({ ok: false, error: `${domain} does not appear to receive email. Check the address.` }, 400);
  const code = sixDigits();
  await env.QUOTES.put(`verify:${email}`, JSON.stringify({ code, attempts: 0, name, company, created: Date.now() }), { expirationTtl: 600 });
  const res = await sendMail(env, {
    to: email, replyTo: env.NOTIFY_TO,
    subject: `${code} is your 3HUE code`,
    text: `Your code is ${code}. It is valid for ten minutes.\n\nEnter it on 3hue.net to open your pricing page. If you did not ask for this, ignore this email.\n\n3HUE Executive Consulting · (954) 738-4454`,
    html: `<div style="font:16px/1.5 system-ui,sans-serif;color:#0f172a"><p>Your code:</p><p style="font:700 34px/1 monospace;letter-spacing:.2em;margin:8px 0 18px">${code}</p><p>It is valid for ten minutes. Enter it on 3hue.net to open your pricing page.</p><p style="color:#5d6e86;font-size:13px">If you did not ask for this, ignore this email.<br>3HUE Executive Consulting · (954) 738-4454</p></div>`,
  });
  if (!res.queued) { console.log('quote/start mail not sent', res.reason, email); return json({ ok: false, error: 'We could not send the code just now. Book a call and we will price it with you.' }, 503); }
  return json({ ok: true });
}
export const onRequestOptions = () => new Response(null, { status: 204, headers: { allow: 'POST' } });
