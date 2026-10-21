/* The personal pricing page, as HTML. Used by the Pages Function that serves /pricing/for/<id> and by the builder's
   preview off 3hue.net. Pure function: (quote, meta, links) → the <main> markup; the site shell wraps it. */
import { CATALOG, LABELS, FRAMEWORKS, money } from './pricing-engine.js?v=a788ce39';

const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return ''; } };

export function answerChips(a = {}) {
  const chips = [];
  if (a.driver && LABELS.driver[a.driver]) chips.push(['Driver', LABELS.driver[a.driver]]);
  const fw = (a.frameworks || []).filter((f) => FRAMEWORKS[f]).map((f) => FRAMEWORKS[f]);
  chips.push(['Frameworks', fw.length ? fw.join(', ') : 'none yet']);
  if (a.clouds && a.clouds.length) chips.push(['Clouds', a.clouds.map((c) => ({ aws: 'AWS', azure: 'Azure', gcp: 'GCP', m365: 'Microsoft 365', other: 'on-prem / other' }[c] || c)).join(', ')]);
  if (a.accounts && LABELS.accounts[a.accounts]) chips.push(['Scale', LABELS.accounts[a.accounts]]);
  if (a.entities && LABELS.entities[a.entities]) chips.push(['Entities', LABELS.entities[a.entities]]);
  if (a.ai && LABELS.ai[a.ai]) chips.push(['AI', LABELS.ai[a.ai]]);
  if (a.sector && LABELS.sector[a.sector]) chips.push(['Sector', LABELS.sector[a.sector]]);
  if (a.operator && LABELS.operator[a.operator]) chips.push(['Who runs it', LABELS.operator[a.operator]]);
  if (a.timeline && LABELS.timeline[a.timeline]) chips.push(['Timeline', LABELS.timeline[a.timeline]]);
  return chips;
}

export function quoteHTML(q, meta, links) {
  const groups = [];
  q.lines.forEach((l) => { let g = groups.find((x) => x.name === l.group); if (!g) { g = { name: l.group, lines: [] }; groups.push(g); } g.lines.push(l); });
  const amount = (l) => l.scoped ? `<span class="qp-amt scoped">${money(CATALOG.managed.programs.sea.hourly)}<small>/hour, scoped</small></span>`
    : l.oneTime ? `<span class="qp-amt num">${money(l.oneTime)}<small>one time</small></span>`
    : l.monthly === 0 && l.sku === 'plan_free' ? `<span class="qp-amt num">$0<small>forever</small></span>`
    : `<span class="qp-amt num">${money(l.monthly)}<small>/month</small></span>`;
  const row = (l) => `<div class="qp-line${l.optional ? ' optional' : ''}">
      <div class="qp-line-text"><b>${esc(l.name)}${l.optional ? ' <em>optional</em>' : ''}</b><span>${esc(l.detail)}</span>${l.note ? `<i class="qp-note">${esc(l.note)}</i>` : ''}<small class="qp-cad">${esc(l.cadence)}${l.annual && !l.oneTime && !l.scoped ? ` · ${money(l.annual)} a year` : ''}</small></div>
      ${amount(l)}
    </div>`;
  const company = meta.company ? esc(meta.company) : 'Your program';
  const chips = answerChips(meta.answers || {});
  const btns = q.lane === 'managed'
    ? `<a class="btn btn-primary" href="${esc(links.calendly)}">Book the vCISO strategy call</a><a class="btn btn-ghost" href="${esc(links.contact)}?quote=${esc(meta.id)}">Ask for the operating plan</a>`
    : q.lane === 'snapshot'
    ? `<a class="btn btn-primary" href="${esc(links.calendly)}">Book the Snapshot</a><a class="btn btn-ghost" href="${esc(links.free)}&quote=${esc(meta.id)}">Start Client Vision free</a>`
    : `<a class="btn btn-primary" href="${esc(links.free)}&quote=${esc(meta.id)}">${q.plan === 'free' ? 'Start free' : 'Order ' + esc(CATALOG.plans[q.plan].name)}</a><a class="btn btn-ghost" href="${esc(links.calendly)}">Book a 15-min call</a>`;
  return `
<main class="qp">
<section class="hero qp-hero" aria-labelledby="qpTitle">
  <div class="wrap">
    <p class="label">Your pricing &middot; prepared ${esc(fmtDate(meta.createdAt))} &middot; valid until ${esc(fmtDate(meta.expiresAt))}</p>
    <h1 id="qpTitle">${company}, <span class="grad">priced.</span></h1>
    <p class="lede">${esc(q.headline)} ${q.frameworks.length ? 'Built for ' + esc(q.frameworks.join(', ')) + '.' : ''} Every number is a ${esc(CATALOG.version)} price; the figures are the same ones every client sees.</p>
    <div class="qp-totals">
      <div class="qp-total"><span class="k">Per month</span><b class="num">${money(q.totals.monthly)}</b><small>billed annually</small></div>
      <div class="qp-total"><span class="k">Per year</span><b class="num">${money(q.totals.annual)}</b><small>${q.totals.annual ? 'plans and programs' : 'nothing recurring yet'}</small></div>
      <div class="qp-total"><span class="k">One-time</span><b class="num">${money(q.totals.oneTime)}</b><small>${q.credit ? money(q.credit) + ' credited to year one' : 'to start'}</small></div>
    </div>
    <div class="actions center qp-actions">${btns}</div>
  </div>
</section>

<section class="band" id="lines" aria-labelledby="linesTitle">
  <div class="wrap qp-grid">
    <div>
      <div class="section-head"><p class="label">${esc(q.laneName)}</p><h2 id="linesTitle">What is in it, line by line.</h2></div>
      ${groups.map((g) => `<div class="qp-group"><h3>${esc(g.name)}</h3>${g.lines.map(row).join('')}</div>`).join('')}
      <p class="qp-fine">Optional lines are not in the totals. Managed programs run inside the Client Vision plan; nothing is billed twice.</p>
    </div>
    <aside class="qp-side">
      <div class="qp-card">
        <p class="label">Based on your answers</p>
        <dl class="qp-chips">${chips.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        <a class="qp-change" href="${esc(links.build)}?from=${esc(meta.id)}">Change my answers &rarr;</a>
      </div>
      <div class="qp-card">
        <p class="label">Assumptions</p>
        <ul class="qp-list">${q.assumptions.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>
    </aside>
  </div>
</section>

<section class="band mist" id="next" aria-labelledby="nextTitle">
  <div class="wrap">
    <div class="section-head"><p class="label">What happens next</p><h2 id="nextTitle">Three steps, no surprises.</h2></div>
    <div class="steps">${q.next.map((s, i) => `<div class="step"><span class="n">STEP ${i + 1}</span><p>${esc(s)}</p></div>`).join('')}</div>
    <div class="actions qp-actions" style="margin-top:28px">${btns}<button class="btn btn-ghost" type="button" onclick="window.print()">Print or save as PDF</button></div>
    <p class="qp-fine" style="margin-top:18px">This page was prepared for ${esc(meta.email || 'you')} and stays available at this address for ${CATALOG.validityDays} days. It is not an invoice; every engagement runs under an order form or statement of work.</p>
  </div>
</section>
</main>`;
}
