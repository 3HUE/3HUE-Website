/* Huey: 3HUE's site assistant. A floating launcher on every page opens a small chat panel that talks to /api/huey
   (a Cloudflare Pages Function in front of the Anthropic API) and offers the next step: book a call, start free, see pricing.
   The transcript lives in sessionStorage for this tab only; nothing is stored by 3HUE. Off 3hue.net (previews, prototypes)
   the panel shows the quick links instead of calling the API. */
(() => {
  const root = document.getElementById('hueyRoot');
  if (!root || document.querySelector('.huey-launch')) return;
  const L = { calendly: root.dataset.calendly || 'https://calendly.com/aramirez-vcio/15min', contact: root.dataset.contact || '/contact', pricing: root.dataset.pricing || '/pricing', free: root.dataset.free || '/contact?plan=free', snapshot: root.dataset.snapshot || '/services/snapshot', build: root.dataset.build || '/pricing/build' };
  const LIVE = /^https:\/\/([a-z0-9-]+\.)?(3hue\.net|3hue-website\.pages\.dev)$/i.test(location.origin) || /\.3hue-website\.pages\.dev$/i.test(location.hostname) || location.hostname === 'localhost'; // localhost: wrangler pages dev or the test harness serve the functions
  const KEY = '3hue-huey', MAX = 1200;
  const QUICK = [{ label: 'Book a 15-min call', href: L.calendly }, { label: 'Build my pricing', href: L.build }, { label: 'Start free', href: L.free }];
  const PROMPTS = ['Which lane fits me?', 'What does the Snapshot include?', 'How is Client Vision priced?', 'What does Managed by 3HUE cost?', 'I need SOC 2 by next quarter'];
  const WELCOME = 'Hi, I’m Huey, 3HUE’s assistant. Ask me what 3HUE does, what the Snapshot includes, how Client Vision is priced, or which lane fits you.';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const save = (t) => { try { sessionStorage.setItem(KEY, JSON.stringify(t.slice(-24))); } catch (e) {} };
  let transcript = load(); // [{role, content, actions?}]
  let busy = false;

  /* ---------- DOM ---------- */
  const launch = document.createElement('button');
  launch.className = 'huey-launch'; launch.type = 'button'; launch.setAttribute('aria-expanded', 'false'); launch.setAttribute('aria-controls', 'hueyPanel');
  launch.innerHTML = '<span class="huey-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/></svg></span><span class="huey-txt">Ask Huey</span>';
  const panel = document.createElement('section');
  panel.className = 'huey'; panel.id = 'hueyPanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Huey, 3HUE’s assistant'); panel.hidden = true;
  panel.innerHTML = `
    <div class="huey-head">
      <span class="huey-avatar" aria-hidden="true">H</span>
      <div class="huey-title"><b>Huey</b><span>3HUE’s assistant · answers from 3hue.net · not stored</span></div>
      <button class="huey-reset" type="button" title="Start over">Start over</button>
      <button class="huey-close" type="button" aria-label="Close">×</button>
    </div>
    <div class="huey-log" aria-live="polite" aria-relevant="additions"></div>
    <form class="huey-form" novalidate>
      <label class="sr-only" for="hueyInput">Your question</label>
      <textarea id="hueyInput" rows="1" maxlength="${MAX}" placeholder="Ask Huey anything…" autocomplete="off"></textarea>
      <input type="text" name="company_website" class="huey-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <button class="huey-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
    </form>
    <p class="huey-fine">Huey answers from what is published on 3hue.net and can be wrong; for anything specific to your situation, <a href="${esc(L.calendly)}">book a call</a>. Please don’t enter sensitive data.</p>`;
  document.body.append(launch, panel);
  const log = panel.querySelector('.huey-log'), form = panel.querySelector('.huey-form'), input = panel.querySelector('#hueyInput'), sendBtn = panel.querySelector('.huey-send');

  const bubble = (m) => {
    const el = document.createElement('div'); el.className = 'huey-msg ' + (m.role === 'user' ? 'me' : 'bot');
    const p = document.createElement('div'); p.className = 'huey-bubble'; p.innerHTML = esc(m.content).replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>'); el.append(p);
    if (m.actions && m.actions.length) {
      const row = document.createElement('div'); row.className = 'huey-actions';
      m.actions.forEach((a) => { const b = document.createElement('a'); b.className = 'huey-act'; b.href = a.href; b.textContent = a.label; if (/^https?:\/\//.test(a.href) && !a.href.startsWith(location.origin)) { b.target = '_blank'; b.rel = 'noopener'; } row.append(b); });
      el.append(row);
    }
    return el;
  };
  const prompts = () => {
    const row = document.createElement('div'); row.className = 'huey-prompts';
    PROMPTS.forEach((t) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'huey-chip'; b.textContent = t; b.addEventListener('click', () => send(t)); row.append(b); });
    return row;
  };
  const render = () => {
    log.textContent = '';
    log.append(bubble({ role: 'assistant', content: WELCOME }));
    if (!transcript.length) log.append(prompts());
    transcript.forEach((m) => log.append(bubble(m)));
    log.scrollTop = log.scrollHeight;
  };
  const typing = () => { const el = document.createElement('div'); el.className = 'huey-msg bot typing'; el.innerHTML = '<div class="huey-bubble"><i></i><i></i><i></i></div>'; log.append(el); log.scrollTop = log.scrollHeight; return el; };

  /* ---------- open / close ---------- */
  const open = () => { panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); launch.classList.add('is-open'); render(); setTimeout(() => input.focus(), reduce ? 0 : 120); try { sessionStorage.setItem(KEY + '-open', '1'); } catch (e) {} };
  const close = () => { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); launch.classList.remove('is-open'); launch.focus(); try { sessionStorage.removeItem(KEY + '-open'); } catch (e) {} };
  launch.addEventListener('click', () => (panel.hidden ? open() : close()));
  panel.querySelector('.huey-close').addEventListener('click', close);
  panel.querySelector('.huey-reset').addEventListener('click', () => { transcript = []; save(transcript); render(); input.focus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.querySelectorAll('[data-huey-open]').forEach((el) => el.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  if (location.hash === '#huey' || new URLSearchParams(location.search).get('huey') === '1') open();
  else { try { if (sessionStorage.getItem(KEY + '-open') === '1' && transcript.length) open(); } catch (e) {} }

  /* ---------- send ---------- */
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); const t = input.value.trim(); if (t) send(t); });

  async function send(text) {
    if (busy) return;
    text = text.slice(0, MAX);
    transcript.push({ role: 'user', content: text }); save(transcript);
    input.value = ''; input.style.height = 'auto';
    const chips = log.querySelector('.huey-prompts'); if (chips) chips.remove();
    log.append(bubble({ role: 'user', content: text })); log.scrollTop = log.scrollHeight;
    busy = true; sendBtn.disabled = true;
    const t = typing();
    let reply;
    if (!LIVE) {
      reply = { content: 'Huey answers live on 3hue.net. In this preview, here are the quick links.', actions: QUICK };
    } else {
      try {
        const r = await fetch('/api/huey', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: transcript.slice(-16).map(({ role, content }) => ({ role, content })), page: location.pathname, company_website: form.company_website.value }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok && j.ok) reply = { content: j.reply, actions: j.actions || [] };
        else reply = { content: j.error || 'Huey could not answer just now. The quick links below still work.', actions: j.actions || QUICK };
      } catch (err) {
        reply = { content: 'Huey could not reach the server. The quick links below still work.', actions: QUICK };
      }
    }
    t.remove();
    const m = { role: 'assistant', content: reply.content, actions: reply.actions };
    transcript.push(m); save(transcript);
    log.append(bubble(m)); log.scrollTop = log.scrollHeight;
    busy = false; sendBtn.disabled = false; input.focus();
  }
})();
