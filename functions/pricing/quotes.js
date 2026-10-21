/* GET /pricing/quotes?key=… — the private list of live pricing pages (newest first). The key is QUOTES_ADMIN_KEY in the Pages environment. */
import { HEAD, NAV, FOOTER } from './_shell.js';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => '$' + Math.round(n || 0).toLocaleString('en-US');
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!env.QUOTES_ADMIN_KEY || key.length < 12 || key !== env.QUOTES_ADMIN_KEY) return new Response('Not found', { status: 404 });
  if (!env.QUOTES) return new Response('QUOTES binding missing', { status: 503 });
  const rows = []; let cursor;
  do { const l = await env.QUOTES.list({ prefix: 'quote:', cursor }); rows.push(...l.keys); cursor = l.list_complete ? undefined : l.cursor; } while (cursor && rows.length < 2000);
  rows.sort((a, b) => String((b.metadata || {}).createdAt || '').localeCompare(String((a.metadata || {}).createdAt || '')));
  const tr = rows.map((k) => { const m = k.metadata || {}, id = k.name.slice(6), exp = k.expiration ? new Date(k.expiration * 1000).toISOString().slice(0, 10) : ''; return `<tr><td>${esc((m.createdAt || '').slice(0, 10))}</td><td><b>${esc(m.company)}</b><br><small>${esc(m.name)} · <a href="mailto:${esc(m.email)}">${esc(m.email)}</a></small></td><td>${esc(m.lane)}</td><td class="num">${money(m.monthly)}/mo</td><td class="num">${money(m.annual)}/yr</td><td class="num">${money(m.oneTime)}</td><td>${exp}</td><td><a href="/pricing/for/${esc(id)}">open</a></td></tr>`; }).join('');
  const body = `<main><section class="band" style="padding-top:32px"><div class="wrap"><p class="label">Private · pricing pages</p><h1 style="font-size:2rem;margin:8px 0 18px">${rows.length} live page${rows.length === 1 ? '' : 's'}</h1>
  <div class="matrix"><table><thead><tr><th>Created</th><th>Company</th><th>Lane</th><th>Monthly</th><th>Annual</th><th>One-time</th><th>Expires</th><th></th></tr></thead><tbody>${tr || '<tr><td colspan="8">No pages yet.</td></tr>'}</tbody></table></div>
  <p class="qp-fine" style="margin-top:14px">Pages expire 90 days after creation and disappear from this list automatically.</p></div></section></main>`;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pricing pages | 3HUE</title><meta name="robots" content="noindex, nofollow">${HEAD}</head><body>${NAV}${body}${FOOTER}</body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex' } });
}
