/* GET /api/quote/answers?id=… — the answers behind a page, so "Change my answers" can prefill the builder. No personal data. */
import { json } from '../_send.js';
export async function onRequestGet({ request, env }) {
  if (!env.QUOTES) return json({ ok: false }, 503);
  const id = (new URL(request.url).searchParams.get('id') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  if (!id) return json({ ok: false }, 400);
  const raw = await env.QUOTES.get(`quote:${id}`);
  if (!raw) return json({ ok: false, error: 'expired' }, 404);
  return json({ ok: true, answers: JSON.parse(raw).answers || {} });
}
