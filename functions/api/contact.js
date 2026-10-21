/* POST /api/contact  — the contact form (contact.html) */
import { json, isEmail, clip, esc, readBody, rateLimited, sendMail } from './_send.js';

export async function onRequestPost({ request, env }) {
  if (rateLimited(request)) return json({ ok: false, error: 'Too many requests. Try again in a few minutes.' }, 429);
  let b; try { b = await readBody(request); } catch (e) { return json({ ok: false, error: 'Could not read the form.' }, 400); }
  if (b.company_website) return json({ ok: true, queued: false }); // honeypot: pretend success
  const name = clip(b.name, 120), email = clip(b.email, 254), company = clip(b.company, 160), message = clip(b.message, 4000), interest = clip(b.interest, 80);
  if (!isEmail(email)) return json({ ok: false, error: 'Enter a work email address.' }, 400);
  if (!message && !interest) return json({ ok: false, error: 'Tell us what you are looking at.' }, 400);
  const subject = `3hue.net inquiry: ${interest || 'general'}${company ? ' · ' + company : ''}`;
  const text = `Name: ${name}\nEmail: ${email}\nCompany: ${company}\nInterest: ${interest}\n\n${message}\n\nPage: ${clip(b.page, 300)}\nReceived: ${new Date().toISOString()}`;
  const html = `<p><b>Name:</b> ${esc(name)}<br><b>Email:</b> ${esc(email)}<br><b>Company:</b> ${esc(company)}<br><b>Interest:</b> ${esc(interest)}</p><pre style="font:14px/1.5 system-ui;white-space:pre-wrap">${esc(message)}</pre><p style="color:#5d6e86">Page: ${esc(clip(b.page, 300))}</p>`;
  const res = await sendMail(env, { subject, text, html, replyTo: email });
  if (!res.queued) console.log('contact (mail not sent)', JSON.stringify({ email, company, interest, reason: res.reason }));
  return json({ ok: true, queued: res.queued }, 202);
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: { allow: 'POST' } });
