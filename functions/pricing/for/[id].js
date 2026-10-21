/* GET /pricing/for/<id> — a visitor's personal pricing page, rendered from the record the builder stored in KV. */
import { quoteHTML } from '../_quote_page.js';
import { HEAD, NAV, FOOTER } from '../_shell.js';

const LINKS = { calendly: 'https://calendly.com/aramirez-vcio/15min', contact: '/contact', free: '/contact?plan=free', pricing: '/pricing', build: '/pricing/build' };
const page = (title, body, status = 200) => new Response(`<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<title>${title} | 3HUE</title>\n<meta name="robots" content="noindex, nofollow">\n${HEAD}\n</head>\n<body>\n${NAV}\n${body}\n${FOOTER}\n</body>\n</html>`,
  { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' } });

export async function onRequestGet({ params, env }) {
  const id = String(params.id || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 32);
  const raw = env.QUOTES && id ? await env.QUOTES.get(`quote:${id}`) : null;
  if (!raw) {
    return page('Pricing page expired', `<main><section class="hero" style="padding-bottom:64px"><div class="wrap"><p class="label">Pricing page</p><h1>This page has <span class="grad">expired.</span></h1><p class="lede">Pricing pages stay available for 90 days. Build a fresh one in two minutes, or book a call and we will price it with you.</p><div class="actions center"><a class="btn btn-primary" href="${LINKS.build}">Build my pricing</a><a class="btn btn-ghost" href="${LINKS.calendly}">Book a 15-min call</a></div></div></section></main>`, 404);
  }
  const rec = JSON.parse(raw);
  const body = quoteHTML(rec.quote, { id: rec.id, name: rec.name, company: rec.company, email: rec.email, createdAt: rec.createdAt, expiresAt: rec.expiresAt, answers: rec.answers }, LINKS);
  return page(`Pricing for ${rec.company || 'your program'}`, body);
}
