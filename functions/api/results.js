/* POST /api/results  — "Email me my results" on the free tools */
import { json, isEmail, clip, esc, readBody, rateLimited, sendMail } from './_send.js';

export async function onRequestPost({ request, env }) {
  if (rateLimited(request)) return json({ ok: false, error: 'Too many requests. Try again in a few minutes.' }, 429);
  let b; try { b = await readBody(request); } catch (e) { return json({ ok: false, error: 'Could not read the request.' }, 400); }
  if (b.company_website) return json({ ok: true, queued: false });
  const email = clip(b.email, 254), page = clip(b.page, 160), url = clip(b.url, 400), summary = clip(b.summary, 2000);
  if (!isEmail(email)) return json({ ok: false, error: 'Enter a work email address.' }, 400);
  let saved = ''; try { saved = JSON.stringify(b.saved || {}).slice(0, 8000); } catch (e) {}
  const subject = `${page || 'Tool result'} for ${email}`;
  const text = `A visitor asked for their results.\n\nTool: ${page}\nPage: ${url}\nEmail: ${email}\n\nResult: ${summary}\n\nSaved answers (browser state): ${saved}\n\nReceived: ${new Date().toISOString()}`;
  const html = `<p><b>Tool:</b> ${esc(page)}<br><b>Page:</b> ${esc(url)}<br><b>Email:</b> ${esc(email)}</p><p><b>Result:</b> ${esc(summary)}</p><details><summary>Saved answers</summary><pre style="font:12px/1.4 ui-monospace;white-space:pre-wrap">${esc(saved)}</pre></details>`;
  const res = await sendMail(env, { subject, text, html, replyTo: email });
  if (!res.queued) console.log('results (mail not sent)', JSON.stringify({ email, page, reason: res.reason }));
  return json({ ok: true, queued: res.queued }, 202);
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: { allow: 'POST' } });
