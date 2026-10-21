/* The pricing builder: seven steps to a personal pricing page. Answers live in sessionStorage; the live summary uses the same
   engine as the server, so what the visitor sees while answering is what lands on their page. The last step verifies a work
   email with a 6-digit code (/api/quote/start, /api/quote/verify) and redirects to /pricing/for/<id>. Off 3hue.net the page
   previews the result locally instead. */
import { buildQuote, summarize, money, CATALOG } from './pricing-engine.js?v=a788ce39';
import { quoteHTML } from './quote-page.js?v=65ba7d5e';

const root = document.getElementById('builder');
const L = { calendly: root.dataset.calendly, contact: root.dataset.contact, pricing: root.dataset.pricing, free: root.dataset.free, snapshot: root.dataset.snapshot, build: location.pathname };
const LIVE = /^https:\/\/([a-z0-9-]+\.)?(3hue\.net|3hue-website\.pages\.dev)$/i.test(location.origin) || /\.3hue-website\.pages\.dev$/i.test(location.hostname) || location.hostname === 'localhost'; // localhost: wrangler pages dev or the test harness serve the functions
const KEY = '3hue-pb';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ico = {
  contract: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  board: '<path d="M3 3v18h18"/><path d="M7 14l4-4 4 3 5-6"/>',
  ai: '<path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z"/><path d="M19 17l.8 1.7L21.5 19.5l-1.7.8L19 22l-.8-1.7-1.7-.8 1.7-.8z"/>',
  alert: '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-2.5 6.5L7 17l2.5-6.5z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  cloud: '<path d="M17.5 19a4.5 4.5 0 0 0 .5-9 7 7 0 0 0-13.3 2A4 4 0 0 0 6 19z"/>',
  people: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  person: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  hands: '<path d="M11 19H6a2 2 0 0 1-2-2v-5l4-4 3 3 4-4 5 5v5a2 2 0 0 1-2 2h-3"/><path d="M11 19v-4"/>',
  question: '<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  siren: '<path d="M7 18V9a5 5 0 0 1 10 0v9"/><path d="M4 18h16v3H4zM12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4"/>',
  vendors: '<path d="M3 9h18l-1.5 11h-15z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L22 9l-7-7-2.3 2.3zM2 22l9.5-9.5"/>',
  rocket: '<path d="M5 13c-1.5 1.5-2 5-2 5s3.5-.5 5-2M15 9l-6 6M13 3c3 0 7 1 8 2-1 3-2 7-5 9l-4 1-4-4 1-4c2-3 6-4 4-4z"/>',
  report: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15l3-3 3 2 4-5"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
};
const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico[k] || ico.compass}</svg>`;

/* ---------- the steps ---------- */
const STEPS = [
  { id: 'driver', rail: 'Why now', title: 'What is driving this?', lede: 'The reason sets the pace and the lane.', type: 'single', options: [
    { v: 'customer', t: 'A customer or contract', d: 'A deal, a questionnaire or a clause needs a report or certificate.', i: 'contract' },
    { v: 'audit', t: 'An audit or certification date', d: 'SOC 2, ISO, CMMC or HIPAA with a date on the calendar.', i: 'calendar' },
    { v: 'board', t: 'The board or a regulator', d: 'Someone wants a posture they can read and defend.', i: 'board' },
    { v: 'ai', t: 'An AI rollout', d: 'AI is going into production and governance has to catch up.', i: 'ai' },
    { v: 'incident', t: 'A recent incident', d: 'Something happened, or nearly did, and the program has to change.', i: 'alert' },
    { v: 'ahead', t: 'Getting ahead of it', d: 'No deadline yet; you would rather build it before one arrives.', i: 'compass' } ] },
  { id: 'frameworks', rail: 'Frameworks', title: 'Which frameworks are in play?', lede: 'Pick everything you answer to, or might within a year.', type: 'multi', min: 1, options: [
    { v: 'soc2', t: 'SOC 2', d: 'Type I or Type II' }, { v: 'hipaa', t: 'HIPAA', d: 'Security Rule' }, { v: 'cmmc', t: 'CMMC Level 2', d: '110 practices' },
    { v: 'iso27001', t: 'ISO 27001', d: 'ISMS certification' }, { v: 'iso27701', t: 'ISO 27701', d: 'Privacy extension' }, { v: 'pci', t: 'PCI DSS', d: 'Cardholder data' },
    { v: 'euai', t: 'EU AI Act', d: 'AI obligations' }, { v: 'nist', t: 'NIST CSF 2.0', d: 'Posture baseline' }, { v: 'none', t: 'None yet', d: 'We are starting from scratch', solo: true } ] },
  { id: 'env', rail: 'Environment', title: 'Tell us about the environment.', lede: 'This sizes the plan, the allowance and the add-ons.', type: 'group', groups: [
    { id: 'clouds', q: 'Clouds in use', type: 'multi', options: [{ v: 'aws', t: 'AWS' }, { v: 'azure', t: 'Azure' }, { v: 'gcp', t: 'Google Cloud' }, { v: 'm365', t: 'Microsoft 365' }, { v: 'other', t: 'On-prem / other' }] },
    { id: 'accounts', q: 'Cloud accounts or subscriptions', type: 'single', options: [{ v: '1-3', t: '1 to 3' }, { v: '4-10', t: '4 to 10' }, { v: '10+', t: 'More than 10' }] },
    { id: 'entities', q: 'Entities or business units in scope', type: 'single', options: [{ v: '1', t: 'One' }, { v: '2-5', t: '2 to 5' }, { v: '6+', t: '6 or more' }] },
    { id: 'ai', q: 'AI systems', type: 'single', options: [{ v: 'yes', t: 'In production' }, { v: 'planning', t: 'Planned' }, { v: 'no', t: 'None yet' }] },
    { id: 'sector', q: 'Sector', type: 'single', options: [{ v: 'financial', t: 'Financial services' }, { v: 'health', t: 'Healthcare' }, { v: 'defense', t: 'Defense / DIB' }, { v: 'saas', t: 'Software / SaaS' }, { v: 'public', t: 'Public sector / transit' }, { v: 'other', t: 'Other' }] } ] },
  { id: 'operator', rail: 'Who runs it', title: 'Who will run the program?', lede: 'This is the lane. It can change later; the workspace stays the same.', type: 'single', options: [
    { v: 'self', t: 'Our team runs it', d: 'We have a security lead and the time. We want the software.', i: 'person' },
    { v: 'self_help', t: 'Our team, with help getting there', d: 'We will run it, but we want 3HUE to set the plan first.', i: 'people' },
    { v: 'managed', t: '3HUE runs it with us', d: 'A named vCISO and the programs, run in our workspace.', i: 'hands' },
    { v: 'unsure', t: 'Not decided yet', d: 'Show us where we stand first, then we choose.', i: 'question' } ] },
  { id: 'timeline', rail: 'Timeline', title: 'When do you need to be ready?', lede: 'Dates decide what starts first.', type: 'single', options: [
    { v: '90', t: 'Within 90 days', d: 'A fast start; the first scan and the plan in two weeks.', i: 'bolt' },
    { v: 'quarter', t: 'This quarter', d: 'Enough room to do it in order.', i: 'calendar' },
    { v: '6m', t: 'Within six months', d: 'A full readiness cycle.', i: 'clock' },
    { v: '12m', t: 'Within twelve months', d: 'Build it properly, certify once.', i: 'compass' },
    { v: 'none', t: 'No fixed date', d: 'We will set one from the plan.', i: 'question' } ] },
  { id: 'extras', rail: 'Scope', title: 'Anything else in scope?', lede: 'Optional. Pick what applies; skip if nothing does.', type: 'multi', min: 0, options: [
    { v: 'ir', t: 'Incident response', d: 'Plan, playbooks and a tabletop exercise.', i: 'siren' },
    { v: 'vendors', t: 'Vendor compliance', d: 'Third-party risk, by vendor tier.', i: 'vendors', count: { id: 'vendors', label: 'Vendors to cover', min: 1, max: 50, def: 5 } },
    { v: 'engineering', t: 'Engineering remediation', d: 'Hands on keyboards to close findings.', i: 'wrench' },
    { v: 'foundation', t: 'A fast-start build', d: 'Thirty days and forty engineering hours to stand it up.', i: 'rocket' },
    { v: 'board', t: 'Board-ready reporting', d: 'Risk register and quarterly pack, run for you.', i: 'report' } ] },
  { id: 'gate', rail: 'Your page', title: 'Your pricing page is ready.', lede: 'Tell us who it is for. We send a six-digit code to your work email, you enter it, and the page opens.', type: 'gate' },
];

let answers = load();
let step = Math.min(firstIncomplete(), STEPS.length - 1);
let dir = 1;
const rail = $('#pbRail'), panel = $('#pbPanel'), back = $('#pbBack'), next = $('#pbNext'), count = $('#pbCount'), bar = $('#pbBar');

function load() { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
function save() { try { sessionStorage.setItem(KEY, JSON.stringify(answers)); } catch (e) {} }
function complete(s) {
  if (s.type === 'single') return !!answers[s.id];
  if (s.type === 'multi') return (answers[s.id] || []).length >= (s.min || 0) && (s.min === 0 ? answers._seen && answers._seen[s.id] : true);
  if (s.type === 'group') return s.groups.every((g) => g.type === 'single' ? !!answers[g.id] : (answers[g.id] || []).length > 0);
  return false;
}
function firstIncomplete() { for (let i = 0; i < STEPS.length; i++) if (!complete(STEPS[i])) return i; return STEPS.length - 1; }

/* ---------- rail + progress ---------- */
function paintRail() {
  rail.innerHTML = STEPS.map((s, i) => `<li class="${i === step ? 'cur' : complete(s) ? 'done' : ''}"><button type="button" data-i="${i}" ${i > firstIncomplete() && i !== step ? 'disabled' : ''}><span class="pb-dot">${complete(s) && i !== step ? '✓' : i + 1}</span><span class="pb-lbl">${esc(s.rail)}</span></button></li>`).join('');
  rail.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => go(+b.dataset.i)));
  bar.style.width = ((step) / (STEPS.length - 1) * 100) + '%';
  count.textContent = `${step + 1} of ${STEPS.length}`;
  back.disabled = step === 0;
}

/* ---------- panels ---------- */
function optionCard(s, o, picked, name) {
  const type = s.type === 'single' ? 'radio' : 'checkbox';
  return `<label class="pb-opt${o.i ? '' : ' compact'}${picked ? ' on' : ''}"><input type="${type}" name="${esc(name)}" value="${esc(o.v)}" ${picked ? 'checked' : ''}>${o.i ? `<span class="pb-ico">${svg(o.i)}</span>` : ''}<span class="pb-opt-text"><b>${esc(o.t)}</b>${o.d ? `<span>${esc(o.d)}</span>` : ''}</span><span class="pb-check" aria-hidden="true"></span></label>`;
}
function render() {
  const s = STEPS[step];
  let html = `<div class="pb-q"><p class="label">Step ${step + 1}</p><h1>${esc(s.title)}</h1><p class="lede">${esc(s.lede)}</p></div>`;
  if (s.type === 'single' || s.type === 'multi') {
    const cur = s.type === 'single' ? [answers[s.id]] : (answers[s.id] || []);
    html += `<div class="pb-opts${s.type === 'multi' && !s.options[0].i ? ' chips' : ''}" role="${s.type === 'single' ? 'radiogroup' : 'group'}">${s.options.map((o) => optionCard(s, o, cur.includes(o.v), s.id)).join('')}</div>`;
    const c = s.options.find((o) => o.count && (answers[s.id] || []).includes(o.v));
    if (c) html += `<div class="pb-count-row"><label for="pbVendors">${esc(c.count.label)}</label><div class="pb-stepper"><button type="button" data-d="-1" aria-label="Fewer">−</button><input id="pbVendors" type="number" min="${c.count.min}" max="${c.count.max}" value="${answers[c.count.id] || c.count.def}"><button type="button" data-d="1" aria-label="More">+</button></div></div>`;
  } else if (s.type === 'group') {
    html += s.groups.map((g) => { const cur = g.type === 'single' ? [answers[g.id]] : (answers[g.id] || []); return `<div class="pb-sub"><h2>${esc(g.q)}</h2><div class="pb-opts chips" role="${g.type === 'single' ? 'radiogroup' : 'group'}">${g.options.map((o) => optionCard(g, o, cur.includes(o.v), g.id)).join('')}</div></div>`; }).join('');
  } else if (s.type === 'gate') {
    html += gateHTML();
  }
  const wrap = document.createElement('div'); wrap.className = 'pb-step' + (reduce ? '' : dir > 0 ? ' in-r' : ' in-l'); wrap.innerHTML = html;
  panel.replaceChildren(wrap);
  requestAnimationFrame(() => wrap.classList.add('is-in'));
  wire(s, wrap); wireGate(wrap);
  paintRail(); paintSummary();
  next.hidden = s.type === 'gate';
  next.textContent = s.type === 'multi' && s.min === 0 && !(answers[s.id] || []).length ? 'Skip' : step === STEPS.length - 2 ? 'See my page' : 'Continue';
  next.disabled = s.type !== 'multi' && s.type !== 'gate' && !complete(s);
  wrap.tabIndex = -1; if (s.type !== 'gate') setTimeout(() => wrap.focus({ preventScroll: true }), 60); else { const f = wrap.querySelector('input[name=name]'); if (f && !f.value) setTimeout(() => f.focus({ preventScroll: true }), 80); }
  if (window.scrollY > 120) window.scrollTo({ top: root.offsetTop - 16, behavior: reduce ? 'auto' : 'smooth' });
}
function wire(s, wrap) {
  wrap.querySelectorAll('input[type=radio], input[type=checkbox]').forEach((inp) => inp.addEventListener('change', () => {
    const name = inp.name, def = s.type === 'group' ? s.groups.find((g) => g.id === name) : s;
    if (def.type === 'single') { answers[name] = inp.value; }
    else {
      let vals = Array.from(wrap.querySelectorAll(`input[name="${name}"]:checked`)).map((i) => i.value);
      const solo = def.options.find((o) => o.solo);
      if (solo && inp.value === solo.v && inp.checked) vals = [solo.v];
      else if (solo && inp.value !== solo.v) vals = vals.filter((v) => v !== solo.v);
      answers[name] = vals; answers._seen = Object.assign(answers._seen || {}, { [name]: true });
    }
    save();
    wrap.querySelectorAll(`input[name="${name}"]`).forEach((i) => i.closest('.pb-opt').classList.toggle('on', i.checked));
    if (s.type === 'multi' && s.options.some((o) => o.count)) { render(); return; }
    paintSummary(); paintRail();
    next.disabled = s.type !== 'multi' && !complete(s);
    next.textContent = s.type === 'multi' && s.min === 0 && !(answers[s.id] || []).length ? 'Skip' : step === STEPS.length - 2 ? 'See my page' : 'Continue';
    if (s.type === 'single') setTimeout(() => go(step + 1), reduce ? 0 : 420);
    if (s.type === 'group' && complete(s)) next.focus({ preventScroll: true });
  }));
  const st = wrap.querySelector('.pb-stepper');
  if (st) {
    const inp = st.querySelector('input'); const set = (v) => { v = Math.max(+inp.min, Math.min(+inp.max, v || +inp.min)); inp.value = v; answers.vendors = v; save(); paintSummary(); };
    st.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => set(+inp.value + +b.dataset.d)));
    inp.addEventListener('input', () => set(+inp.value)); set(+inp.value);
  }
}
function go(i) {
  if (i < 0 || i >= STEPS.length) return;
  if (i > step && !complete(STEPS[step]) && !(STEPS[step].type === 'multi' && STEPS[step].min === 0)) return;
  if (STEPS[step].type === 'multi' && STEPS[step].min === 0) { answers._seen = Object.assign(answers._seen || {}, { [STEPS[step].id]: true }); save(); }
  dir = i > step ? 1 : -1; step = i; render();
}
back.addEventListener('click', () => go(step - 1));
next.addEventListener('click', () => go(step + 1));
document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('.pb-opt input') && STEPS[step].type !== 'gate') { e.preventDefault(); if (!next.disabled && !next.hidden) go(step + 1); } });

/* ---------- live summary ---------- */
function paintSummary() {
  const s = summarize(buildQuote(answers));
  $('#sumLane').textContent = answers.operator ? s.laneName : (answers.driver ? 'Lane decided at step 4' : 'Answer the first question');
  const q = buildQuote(answers); const lines = $('#sumLines');
  lines.innerHTML = q.lines.length ? q.lines.map((l) => `<li class="${l.pub ? '' : 'gated'}"><span>${esc(l.name)}</span><b class="num">${l.pub ? (l.oneTime ? money(l.oneTime) : l.monthly ? money(l.monthly) + '/mo' : 'Free') : '<i>on your page</i>'}</b></li>`).join('') : '<li class="muted">Nothing chosen yet.</li>';
  $('#sumMonthly').textContent = money(s.pubMonthly); $('#sumOnce').textContent = money(s.pubOnce);
  const g = $('#sumGated'); g.hidden = !s.gatedCount; g.querySelector('span').textContent = `${s.gatedCount} Managed by 3HUE line${s.gatedCount > 1 ? 's' : ''} priced on your page`;
}

/* ---------- the gate ---------- */
function gateHTML() {
  const q = buildQuote(answers);
  return `<form class="pb-gate" id="pbGate" novalidate>
    <div class="pb-gate-grid">
      <label>Your name<input type="text" name="name" autocomplete="name" required maxlength="120" value="${esc(answers.name || '')}"></label>
      <label>Company<input type="text" name="company" autocomplete="organization" required maxlength="160" value="${esc(answers.company || '')}"></label>
      <label class="full">Work email<input type="email" name="email" autocomplete="email" required maxlength="254" placeholder="you@company.com" value="${esc(answers.email || '')}"><small>Free mailboxes (Gmail, Outlook.com, Yahoo and the like) are not accepted; the page is built for a company.</small></label>
      <input type="text" name="company_website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    </div>
    <div class="pb-gate-actions">
      <button class="btn btn-primary" type="submit" id="pbSend">${LIVE ? 'Send my code' : 'Preview my page'}</button>
      <p class="pb-gate-note" id="pbNote">${LIVE ? 'The code arrives within a minute and is valid for ten.' : 'Verification runs on 3hue.net; this preview opens the page directly.'}</p>
    </div>
    <div class="pb-code" id="pbCode" hidden>
      <p class="label">Enter the six-digit code</p>
      <div class="pb-code-row" id="pbDigits">${[0,1,2,3,4,5].map((i) => `<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="1" aria-label="Digit ${i + 1}">`).join('')}</div>
      <p class="pb-gate-note" id="pbCodeNote">Sent to <b id="pbTo"></b>. <button type="button" class="pb-link" id="pbResend">Send again</button></p>
    </div>
    <div class="pb-ready" id="pbReady" hidden><span class="pb-ready-ring"></span><p>Verified. Opening your page…</p></div>
  </form>
  <p class="pb-gate-fine">Your answers and your address are used to prepare the page and to let 3HUE follow up on it; the page stays available for ${CATALOG.validityDays} days. ${q.gatedCount ? `${q.gatedCount} line${q.gatedCount > 1 ? 's' : ''} priced after verification.` : ''}</p>`;
}
const FREE_MAIL = /^(gmail|googlemail|yahoo|ymail|aol|hotmail|outlook|live|msn|icloud|me|mac|protonmail|proton|pm|gmx|mail|yandex|zoho|fastmail|hey|tutanota|tuta|duck|comcast|att|verizon|sbcglobal|cox|charter|earthlink)\.(com|net|org|co|io|me|de|fr|co\.uk|ca)$/i;
function wireGate(wrap) {
  const form = $('#pbGate', wrap); if (!form) return;
  const note = $('#pbNote', wrap), codeBox = $('#pbCode', wrap), digits = Array.from($('#pbDigits', wrap).querySelectorAll('input')), sendBtn = $('#pbSend', wrap);
  const say = (t, err) => { note.textContent = t; note.classList.toggle('err', !!err); };
  const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && !FREE_MAIL.test(e.split('@')[1]);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim(), company = form.company.value.trim(), email = form.email.value.trim().toLowerCase();
    if (!name) return say('Add your name.', true);
    if (!company) return say('Add your company.', true);
    if (!emailOk(email)) return say('Use your work email; free mailboxes are not accepted.', true);
    Object.assign(answers, { name, company, email }); save();
    if (!LIVE) return preview(name, company, email);
    sendBtn.disabled = true; say('Sending your code…');
    try {
      const r = await fetch('/api/quote/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, company, email, company_website: form.company_website.value }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) { say(j.error || 'Could not send the code. Try again, or book a call.', true); sendBtn.disabled = false; return; }
      say('Code sent.'); codeBox.hidden = false; $('#pbTo', wrap).textContent = email; digits[0].focus();
    } catch (err) { say('Could not reach the server. Try again in a moment.', true); sendBtn.disabled = false; }
  });
  $('#pbResend', wrap).addEventListener('click', () => { codeBox.hidden = true; sendBtn.disabled = false; form.requestSubmit(); });
  digits.forEach((d, i) => {
    d.addEventListener('input', () => { d.value = d.value.replace(/\D/g, '').slice(-1); if (d.value && i < 5) digits[i + 1].focus(); if (digits.every((x) => x.value)) verify(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !d.value && i > 0) digits[i - 1].focus(); });
    d.addEventListener('paste', (e) => { const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6); if (t.length === 6) { e.preventDefault(); t.split('').forEach((c, k) => digits[k].value = c); verify(); } });
  });
  async function verify() {
    const code = digits.map((x) => x.value).join(''); const cn = $('#pbCodeNote', wrap);
    cn.textContent = 'Checking…';
    try {
      const r = await fetch('/api/quote/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: answers.email, code, name: answers.name, company: answers.company, answers: clean(answers) }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) { cn.innerHTML = `${esc(j.error || 'That code did not match.')} <button type="button" class="pb-link" id="pbResend2">Send a new code</button>`; $('#pbResend2', wrap).addEventListener('click', () => $('#pbResend', wrap).click()); digits.forEach((x) => (x.value = '')); digits[0].focus(); return; }
      $('#pbReady', wrap).hidden = false; codeBox.hidden = true;
      try { sessionStorage.removeItem(KEY); } catch (e) {}
      setTimeout(() => { location.href = j.url; }, reduce ? 0 : 900);
    } catch (err) { cn.textContent = 'Could not reach the server. Try again in a moment.'; }
  }
}
function clean(a) { const c = {}; ['driver', 'frameworks', 'clouds', 'accounts', 'entities', 'ai', 'sector', 'operator', 'timeline', 'extras', 'vendors'].forEach((k) => { if (a[k] !== undefined) c[k] = a[k]; }); return c; }
function preview(name, company, email) {
  const q = buildQuote(answers); const now = new Date(), exp = new Date(now.getTime() + CATALOG.validityDays * 864e5);
  const html = quoteHTML(q, { id: 'preview', name, company, email, createdAt: now.toISOString(), expiresAt: exp.toISOString(), answers: clean(answers) }, L);
  const holder = document.createElement('div'); holder.innerHTML = html; const main = holder.firstElementChild;
  root.replaceWith(main); window.scrollTo({ top: 0, behavior: 'auto' });
  const note = document.createElement('p'); note.className = 'qp-preview-note'; note.textContent = 'Preview: on 3hue.net this page gets its own address after the email check.'; main.prepend(note);
}

/* ---------- prefill from an existing page (?from=<id>) ---------- */
(async () => {
  const from = new URLSearchParams(location.search).get('from');
  if (from && LIVE) { try { const r = await fetch('/api/quote/answers?id=' + encodeURIComponent(from)); const j = await r.json(); if (j.ok && j.answers) { answers = Object.assign(j.answers, { _seen: { extras: true } }); save(); step = 0; } } catch (e) {} }
  render();
})();
