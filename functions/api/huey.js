/* POST /api/huey — Huey, 3HUE's site assistant. Answers from the published site only (functions/api/_kb.js, generated at build
   time) and steers every conversation toward one of three outcomes: a booked call, a free Client Vision workspace, or checkout/pricing.
   Env (Cloudflare Pages → Settings → Variables and Secrets):
   - ANTHROPIC_API_KEY  (Secret) the Anthropic API key; without it the endpoint answers 503 and the widget shows the fallback
   - HUEY_MODEL         optional model id; defaults to MODEL_DEFAULT below
   Abuse control: honeypot field, per-IP limiter (shared with the forms), origin check, bounded transcript, bounded output. */
import { json, clip, readBody } from './_send.js';
import { KB } from './_kb.js';

const MODEL_DEFAULT = 'claude-sonnet-4-5';
const CALENDLY = 'https://calendly.com/aramirez-vcio/15min';
const MAX_TURNS = 16, MAX_CHARS = 1200, MAX_TOKENS = 700;

const SYSTEM = `You are Huey, the assistant on 3hue.net, the website of 3HUE Executive Consulting (security, compliance and AI governance for regulated organizations; Client Vision is its GRC software, powered by the AiVRIC platform).

Your job: answer the visitor's question from the SITE CONTENT below, in plain, warm, direct language, and lead them to the next step where a buying decision is made:
- Book a 15-minute call (${CALENDLY}) when they want to talk, have a scoped or multi-entity situation, or ask about Managed, the Snapshot or professional services.
- Start Client Vision free (/contact?plan=free) when they want to try the product or run compliance themselves.
- See pricing (/pricing, with anchors #lanes, #plans, #snapshot) when they ask what Client Vision or the Snapshot costs; quote only prices that appear in the SITE CONTENT, exactly as written.
- Build my pricing (/pricing/build) when they ask what Managed by 3HUE, the vCISO seat, a program, the Foundation build or anything on the rate card costs: those prices are not published, so never estimate them; the builder prices their program in two minutes after a work-email check.
- Send an inquiry (/contact) when they want a written reply.

Rules:
1. Use only the SITE CONTENT. If it does not cover the question, say so in one sentence and offer the call or the contact form. Never invent prices, dates, customer names, certifications or guarantees.
2. Never name customers; the site uses sector descriptors only (a transit technology company, a large North American bank, a marine services company).
3. Client Vision is 3HUE's product. If asked about AiVRIC, say only that Client Vision is powered by the AiVRIC platform, then return to Client Vision. Never describe Client Vision as a rebrand, a white label, a branded version or a reseller offering of AiVRIC, and do not explain AiVRIC's own products or licensing.
4. Do not give legal, regulatory or audit advice beyond what the site says; for anything specific to the visitor's situation, offer the call.
5. Keep replies short: at most 120 words, plain text, no markdown headings, no bullet symbols; short paragraphs are fine. Answer the question first, then one sentence pointing to the next step.
6. Link only to URLs that appear in the SITE CONTENT (site paths starting with /) or the Calendly link. Suggest at most three actions, the most relevant first.
7. If the visitor shares personal data beyond a name or company, do not repeat it back; suggest the contact form instead.
8. If asked who you are: Huey, 3HUE's assistant; conversations are not stored by 3HUE.
9. If asked about Vanta, Drata, Secureframe or other compliance tools: answer only from the comparison in the SITE CONTENT (what each vendor states on its own pages), point to /product/client-vision#compare, never disparage a vendor, and never compare prices; say the comparison is on scope, scoring, remediation, board reporting and who runs the program.

=== SITE CONTENT ===
${KB}`;

const RESPOND_TOOL = {
  name: 'respond',
  description: 'Deliver the reply to the visitor with up to three next-step actions.',
  input_schema: {
    type: 'object',
    properties: {
      reply: { type: 'string', description: 'Plain-text answer for the visitor, at most 120 words.' },
      actions: {
        type: 'array', maxItems: 3,
        items: {
          type: 'object',
          properties: {
            label: { type: 'string', description: 'Button text, 2 to 5 words, e.g. "Book a 15-min call", "Start free", "See pricing", "Build my pricing", "See the Snapshot".' },
            href: { type: 'string', description: 'A site path from the SITE CONTENT (e.g. /pricing#lanes, /services/snapshot) or the Calendly URL.' },
          },
          required: ['label', 'href'],
        },
      },
      handoff: { type: 'boolean', description: 'true when the question needs a person (scoped pricing, legal or audit specifics, complaints).' },
    },
    required: ['reply', 'actions'],
  },
};

const ALLOWED_PATHS = new Set((KB.match(/^URL: (\/\S*)$/gm) || []).map((l) => l.slice(5)).concat(['/', '/pricing', '/pricing/build', '/contact', '/contact?plan=free', '/contact?plan=assurance', '/contact?plan=multi', '/experience/', '/privacy',
  '/assets/docs/samples/3hue-sample-snapshot-report.pdf', '/assets/docs/samples/3hue-sample-board-pack.pdf', '/assets/docs/samples/3hue-sample-poam.pdf']));
const okHref = (h) => {
  if (typeof h !== 'string' || h.length > 200) return false;
  if (h === CALENDLY) return true;
  if (!h.startsWith('/')) return false;
  const path = h.split('#')[0];
  return ALLOWED_PATHS.has(path) || ALLOWED_PATHS.has(path.replace(/\/$/, '')) || ALLOWED_PATHS.has(path + '/');
};

/* Huey's own limiter (separate from the forms'): 30 messages per IP per 10 minutes, in memory per isolate. For a hard ceiling add a
   Cloudflare WAF rate-limiting rule on /api/huey as well (see functions/README.md). */
const hits = new Map();
function tooMany(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const now = Date.now(), win = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < win);
  arr.push(now); hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > 30;
}

const FALLBACK_ACTIONS = [{ label: 'Book a 15-min call', href: CALENDLY }, { label: 'See pricing', href: '/pricing#lanes' }, { label: 'Send an inquiry', href: '/contact' }];

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get('origin') || '';
  if (origin && !/^https:\/\/([a-z0-9-]+\.)?(3hue\.net|3hue-website\.pages\.dev)$/i.test(origin) && !/^https:\/\/[a-z0-9-]+\.3hue-website\.pages\.dev$/i.test(origin) && !/^http:\/\/localhost(:\d+)?$/.test(origin)) return json({ ok: false, error: 'Origin not allowed.' }, 403); // localhost: wrangler pages dev
  if (!env.ANTHROPIC_API_KEY) return json({ ok: false, error: 'Huey is not switched on yet.', actions: FALLBACK_ACTIONS }, 503);
  if (tooMany(request)) return json({ ok: false, error: 'Huey needs a short breather. Try again in a few minutes, or book a call.', actions: FALLBACK_ACTIONS }, 429);
  let b; try { b = await readBody(request); } catch (e) { return json({ ok: false, error: 'Could not read the message.' }, 400); }
  if (b.company_website) return json({ ok: true, reply: 'Thanks.', actions: [] });
  const raw = Array.isArray(b.messages) ? b.messages.slice(-MAX_TURNS) : [];
  const messages = [];
  for (const m of raw) {
    const role = m && m.role === 'assistant' ? 'assistant' : 'user';
    const content = clip(m && m.content, MAX_CHARS).trim();
    if (!content) continue;
    if (messages.length && messages[messages.length - 1].role === role) messages[messages.length - 1].content += '\n' + content; // the API wants alternating roles
    else messages.push({ role, content });
  }
  if (!messages.length || messages[messages.length - 1].role !== 'user') return json({ ok: false, error: 'Ask Huey something first.' }, 400);
  if (messages[0].role !== 'user') messages.shift();
  const page = clip(b.page, 200);
  if (page) messages[messages.length - 1].content += `\n\n(The visitor is on ${page}.)`;

  const body = {
    model: env.HUEY_MODEL || MODEL_DEFAULT,
    max_tokens: MAX_TOKENS,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages,
    tools: [RESPOND_TOOL],
    tool_choice: { type: 'tool', name: 'respond' },
  };
  let data;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    data = await r.json();
    if (!r.ok) { console.log('huey upstream', r.status, JSON.stringify(data).slice(0, 300)); return json({ ok: false, error: 'Huey could not answer just now.', actions: FALLBACK_ACTIONS }, 502); }
  } catch (e) {
    console.log('huey fetch failed', String(e));
    return json({ ok: false, error: 'Huey could not answer just now.', actions: FALLBACK_ACTIONS }, 502);
  }
  const call = (data.content || []).find((c) => c.type === 'tool_use' && c.name === 'respond');
  const text = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
  const input = (call && call.input) || {};
  const reply = clip(input.reply || text, 1600).trim() || 'I do not have that on the site. A fifteen-minute call is the fastest way to get an answer.';
  const actions = (Array.isArray(input.actions) ? input.actions : []).filter((a) => a && okHref(a.href) && typeof a.label === 'string').slice(0, 3).map((a) => ({ label: clip(a.label, 40), href: a.href }));
  return json({ ok: true, reply, actions: actions.length ? actions : FALLBACK_ACTIONS.slice(0, 2), handoff: !!input.handoff, usage: data.usage ? { in: data.usage.input_tokens, out: data.usage.output_tokens, cached: data.usage.cache_read_input_tokens || 0 } : undefined });
}

export const onRequestOptions = () => new Response(null, { status: 204, headers: { allow: 'POST' } });
