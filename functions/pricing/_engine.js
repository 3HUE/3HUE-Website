/* 3HUE pricing engine. One set of rules turns the builder's answers into a lane, a plan, add-ons, programs and totals.
   The same module runs in the browser (the live summary while answering) and in the Pages Function (the stored quote),
   so the number a visitor sees while answering is the number on their page. CATALOG is inlined at build time from data/catalog.json. */
export const CATALOG = {"version": "2026-10 list", "note": "Single source of truth for every price the site and the pricing builder show. Replace these numbers with the ratified 2026 list; nothing else needs to change.", "validityDays": 90, "plans": {"free": {"name": "Client Vision Free", "monthly": 0, "annual": 0, "monthToMonth": 0, "line": "One workspace, your records, a monthly domain snapshot, up to five collaborators."}, "assurance": {"name": "Client Vision Assurance", "monthly": 499, "annual": 5988, "monthToMonth": 599, "line": "CloudSignals, RiskOps and one governance pack; 3 cloud accounts, 2,500 resources, daily scans, 12-month history."}, "multi": {"name": "Client Vision Assurance Multi", "monthly": 699, "annual": 8388, "monthToMonth": 839, "line": "The same program with all six governance packs: SOC 2, HIPAA, ISO 27001, ISO 27701, CMMC and PCI DSS."}}, "addons": {"ai_signals": {"name": "AI Signals", "monthly": 299, "line": "AI system inventory, 100k traces and 500 eval runs a month, 90-day retention, bring your own model keys."}, "ai_signals_scale": {"name": "AI Signals Scale", "monthly": 599, "line": "AI Signals with larger allowances for production AI at scale."}, "capacity_plus": {"name": "Capacity+", "monthly": 299, "line": "Raises the plan allowance to 10 cloud accounts and 10,000 monitored resources."}}, "snapshot": {"name": "AI & Security Risk Posture Snapshot", "fee": 4950, "line": "Ten business days: AI use-case map, governance gaps scored, posture read across your frameworks, your Client Vision tenant onboarded with Signals running, and a 90-day plan.", "credit": "Credited in full to year one of Managed by 3HUE when you continue within 60 days."}, "managed": {"seat": {"name": "vCISO seat", "monthly": 2450, "from": true, "line": "A named fractional CISO, monthly cadence, quarterly board pack, run in the Client Vision plan you hold."}, "bundle": {"name": "Regulated / multi-entity vCISO bundle", "monthly": 7950, "from": true, "line": "The seat sized for several entities or a regulated, multi-framework program."}, "foundation": {"name": "Foundation build", "oneTime": 25000, "line": "A fixed 30-day term with forty engineering hours to stand the program up fast."}, "programs": {"rmp": {"name": "Risk Management Program (RMP)", "annual": 18840, "monthly": 1570, "line": "Risk method, register, treatment decisions and board reporting, run by runbook."}, "cirp": {"name": "Cyber Incident Response Program (CIRP)", "annual": 23100, "monthly": 1925, "line": "IR governance, plan, playbooks and an annual tabletop, kept current."}, "isp": {"name": "Information Security Program (ISP)", "annual": 61600, "monthly": 5133, "line": "The security program itself: policies, controls, internal audit, management review, certification cycle."}, "vcp": {"name": "Vendor Compliance Program (VCP)", "perVendorYear": 1155, "tiers": {"tier1": 5775, "tier2": 3080, "tier3": 1155}, "line": "Third-party risk by vendor tier: standard $1,155, high $3,080, critical $5,775 per vendor a year."}, "sea": {"name": "Secure Engineering & Architecture (SEA)", "hourly": 385, "line": "Remediation and architecture hours, scoped on the call."}}}, "fixed": {"ir_playbook": {"name": "Cyber-IR playbook development", "oneTime": 7700, "line": "Step-by-step playbooks for ransomware, data breach, BEC, DDoS and insider threat."}, "ttx": {"name": "Tabletop exercise", "oneTime": 3850, "line": "A facilitated incident simulation for leadership and responders."}, "risk_assessment": {"name": "Initial risk assessment", "oneTime": 19250, "tiers": {"small": 19250, "mid": 46200, "large": 92400}, "line": "Framework-aligned risk assessment; the small-scope figure is shown, larger scopes on the call."}}};

export const FRAMEWORKS = { soc2: 'SOC 2', hipaa: 'HIPAA', cmmc: 'CMMC Level 2', iso27001: 'ISO 27001', iso27701: 'ISO 27701', pci: 'PCI DSS', euai: 'EU AI Act', nist: 'NIST CSF 2.0' };
const PACKS = ['soc2', 'hipaa', 'iso27001', 'iso27701', 'cmmc', 'pci'];
export const LABELS = {
  driver: { customer: 'a customer or contract requirement', audit: 'an audit or certification date', board: 'the board or a regulator', ai: 'an AI rollout', incident: 'a recent incident', ahead: 'getting ahead of it' },
  operator: { self: 'your team runs it', self_help: 'your team runs it with help getting there', managed: '3HUE runs it with you', unsure: 'not decided yet' },
  timeline: { '90': 'within 90 days', quarter: 'this quarter', '6m': 'within six months', '12m': 'within twelve months', none: 'no fixed date' },
  accounts: { '1-3': '1 to 3 cloud accounts', '4-10': '4 to 10 cloud accounts', '10+': 'more than 10 cloud accounts' },
  entities: { '1': 'one entity', '2-5': '2 to 5 entities or business units', '6+': '6 or more entities' },
  ai: { yes: 'AI systems in production', planning: 'AI systems planned', no: 'no AI systems yet' },
  sector: { financial: 'financial services', health: 'healthcare', defense: 'defense industrial base', saas: 'software / SaaS', public: 'public sector or transit', other: 'another sector' },
};

export const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

/** answers → quote */
export function buildQuote(a = {}) {
  const C = CATALOG;
  const fw = (a.frameworks || []).filter((f) => FRAMEWORKS[f]);
  const packs = fw.filter((f) => PACKS.includes(f));
  const extras = a.extras || [];
  const regulated = ['financial', 'health', 'defense'].includes(a.sector);
  const lane = a.operator === 'managed' ? 'managed' : a.operator === 'unsure' ? 'snapshot' : 'self';
  const lines = [], assumptions = [], next = [];

  // 1. the Client Vision plan every lane runs in
  let plan = packs.length >= 2 ? 'multi' : packs.length === 1 ? 'assurance' : (lane === 'managed' ? 'assurance' : 'free');
  if (plan === 'free' && fw.length && lane !== 'snapshot') plan = 'assurance'; // EU AI Act or NIST only: still a program to run
  const P = C.plans[plan];
  lines.push({ sku: 'plan_' + plan, group: 'Client Vision', name: P.name, detail: P.line, cadence: plan === 'free' ? 'free' : 'per month, billed annually', monthly: P.monthly, annual: P.annual, oneTime: 0, pub: true });
  if (plan !== 'free') assumptions.push(`${P.name} billed annually (${money(P.annual)} a year); month to month is ${money(P.monthToMonth)}.`);
  if (plan === 'assurance' && packs.length === 1) assumptions.push(`Governance pack: ${FRAMEWORKS[packs[0]]}.`);
  if (plan === 'multi') assumptions.push(`Governance packs in use: ${packs.map((p) => FRAMEWORKS[p]).join(', ')}; all six are included.`);

  // 2. add-ons
  if (a.ai === 'yes') { const x = C.addons.ai_signals; lines.push({ sku: 'ai_signals', group: 'Add-ons', name: x.name, detail: x.line, cadence: 'per month', monthly: x.monthly, annual: x.monthly * 12, oneTime: 0, pub: true }); }
  if (a.accounts === '4-10' || a.accounts === '10+') { const x = C.addons.capacity_plus; lines.push({ sku: 'capacity_plus', group: 'Add-ons', name: x.name, detail: x.line, cadence: 'per month', monthly: x.monthly, annual: x.monthly * 12, oneTime: 0, pub: true }); }
  if (a.accounts === '10+') assumptions.push('More than 10 cloud accounts or 10,000 resources: the allowance above Capacity+ is scoped on the call.');
  if (a.ai === 'planning') assumptions.push('AI Signals ($299 a month) can be switched on when the first AI system reaches production.');

  // 3. the Snapshot: the first ten days for anyone not yet decided, anyone who wants help getting there, and every AI-driven program
  const wantsSnapshot = lane === 'snapshot' || a.operator === 'self_help' || a.driver === 'ai' || (lane === 'managed' && a.timeline !== '90');
  if (wantsSnapshot) { const s = C.snapshot; lines.push({ sku: 'snapshot', group: 'Start', name: s.name, detail: s.line, cadence: 'one time', monthly: 0, annual: 0, oneTime: s.fee, pub: true, note: lane === 'managed' ? s.credit : undefined }); }

  // 4. Managed by 3HUE: the seat (or the bundle) and the programs the answers call for
  if (lane === 'managed') {
    const bundle = a.entities === '6+' || (a.entities === '2-5' && (fw.length >= 2 || regulated));
    const seat = bundle ? C.managed.bundle : C.managed.seat;
    lines.push({ sku: bundle ? 'bundle' : 'seat', group: 'The seat', name: seat.name, detail: seat.line, cadence: 'per month' + (seat.from ? ', from' : ''), monthly: seat.monthly, annual: seat.monthly * 12, oneTime: 0, pub: false });
    const prog = (key) => { const p = C.managed.programs[key]; lines.push({ sku: key, group: 'Managed programs', name: p.name, detail: p.line, cadence: 'per month, billed annually', monthly: p.monthly, annual: p.annual, oneTime: 0, pub: false }); };
    if (fw.includes('iso27001') || fw.includes('iso27701') || a.driver === 'board' || a.driver === 'customer' || a.driver === 'audit') prog('isp');
    if (a.driver === 'board' || a.driver === 'ahead' || extras.includes('board') || regulated) prog('rmp');
    if (a.driver === 'incident' || extras.includes('ir') || regulated) prog('cirp');
    if (extras.includes('vendors') && (a.vendors || 0) > 0) {
      const v = C.managed.programs.vcp, n = Math.min(50, Math.max(1, +a.vendors || 1));
      lines.push({ sku: 'vcp', group: 'Managed programs', name: v.name, detail: v.line, cadence: `${n} vendor${n > 1 ? 's' : ''} at standard tier, per year`, monthly: Math.round(v.perVendorYear * n / 12), annual: v.perVendorYear * n, oneTime: 0, pub: false, qty: n });
      assumptions.push('Vendors priced at the standard tier; high and critical tiers are set when the vendor list is reviewed.');
    }
    if (extras.includes('engineering')) { const s = C.managed.programs.sea; lines.push({ sku: 'sea', group: 'Managed programs', name: s.name, detail: s.line, cadence: `${money(s.hourly)} an hour, scoped`, monthly: 0, annual: 0, oneTime: 0, pub: false, scoped: true }); }
    if (extras.includes('foundation') || a.timeline === '90') { const f = C.managed.foundation; lines.push({ sku: 'foundation', group: 'Start', name: f.name, detail: f.line, cadence: 'one time', monthly: 0, annual: 0, oneTime: f.oneTime, pub: false }); }
    assumptions.push('Managed programs run inside the Client Vision plan above; nothing is billed twice.');
    if (seat.from) assumptions.push('The seat is a starting price; the operating plan sets the cadence and the final figure.');
    next.push('Book the vCISO strategy call with this page attached; the operating plan and runbooks are drafted from your answers.', 'The first ten days run the Snapshot in your own tenant; its fee is credited to year one.', 'Programs start by runbook once the plan is signed.');
  } else {
    if (extras.includes('ir')) { const p = C.fixed.ir_playbook, t = C.fixed.ttx; lines.push({ sku: 'ir_playbook', group: 'Fixed-fee services', name: p.name, detail: p.line, cadence: 'one time', monthly: 0, annual: 0, oneTime: p.oneTime, pub: false }); lines.push({ sku: 'ttx', group: 'Fixed-fee services', name: t.name, detail: t.line, cadence: 'one time', monthly: 0, annual: 0, oneTime: t.oneTime, pub: false }); }
    if (extras.includes('vendors') && (a.vendors || 0) > 0) { const v = C.managed.programs.vcp, n = Math.min(50, Math.max(1, +a.vendors || 1)); lines.push({ sku: 'vcp', group: 'Optional managed program', name: v.name, detail: v.line, cadence: `${n} vendor${n > 1 ? 's' : ''} at standard tier, per year`, monthly: Math.round(v.perVendorYear * n / 12), annual: v.perVendorYear * n, oneTime: 0, pub: false, qty: n, optional: true }); }
    if (extras.includes('engineering')) { const s = C.managed.programs.sea; lines.push({ sku: 'sea', group: 'Optional', name: s.name, detail: s.line, cadence: `${money(s.hourly)} an hour, scoped`, monthly: 0, annual: 0, oneTime: 0, pub: false, scoped: true, optional: true }); }
    if (extras.includes('foundation')) { const f = C.managed.foundation; lines.push({ sku: 'foundation', group: 'Start', name: f.name, detail: f.line, cadence: 'one time', monthly: 0, annual: 0, oneTime: f.oneTime, pub: false }); }
    if (lane === 'snapshot') next.push('Book the Snapshot; ten business days later you have the read, the plan and your own tenant.', 'Pick the lane from the plan: keep running it in Client Vision, or hand it to 3HUE.');
    else next.push('Start free and connect the first cloud account; the first scan takes minutes.', plan === 'free' ? 'Turn on Assurance when you are ready to run a program.' : `Order ${P.name}; the plan is live within one business day.`, wantsSnapshot ? 'Book the Snapshot to set the 90-day plan with 3HUE.' : 'Book a 15-minute call if you want a second pair of eyes on scope.');
  }
  if (a.timeline === '90') assumptions.push('A 90-day target: the first scan, the gap register and the plan land in the first two weeks.');
  assumptions.push(`Prices are ${C.version} prices and hold for ${C.validityDays} days from the date on this page.`);

  const totals = lines.reduce((t, l) => ({ monthly: t.monthly + (l.optional ? 0 : l.monthly), annual: t.annual + (l.optional ? 0 : l.annual), oneTime: t.oneTime + (l.optional ? 0 : l.oneTime) }), { monthly: 0, annual: 0, oneTime: 0 });
  const credit = lane === 'managed' && wantsSnapshot ? C.snapshot.fee : 0;
  const laneName = lane === 'managed' ? 'Managed by 3HUE' : lane === 'snapshot' ? 'Snapshot first' : 'Run it yourself';
  const headline = lane === 'managed' ? 'The CISO seat, filled, with the programs your answers call for.' : lane === 'snapshot' ? 'Start with the Snapshot. Decide the lane with the plan in hand.' : `Run it yourself on ${P.name}.`;
  return { lane, laneName, headline, plan, lines, totals, credit, assumptions, next, frameworks: fw.map((f) => FRAMEWORKS[f]), gatedCount: lines.filter((l) => !l.pub).length };
}

/** a short summary for the live panel and the notification email */
export function summarize(q) {
  const pubMonthly = q.lines.filter((l) => l.pub && !l.optional).reduce((s, l) => s + l.monthly, 0);
  const pubOnce = q.lines.filter((l) => l.pub && !l.optional).reduce((s, l) => s + l.oneTime, 0);
  return { laneName: q.laneName, planName: CATALOG.plans[q.plan].name, items: q.lines.map((l) => l.name), pubMonthly, pubOnce, monthly: q.totals.monthly, annual: q.totals.annual, oneTime: q.totals.oneTime, gatedCount: q.gatedCount };
}
