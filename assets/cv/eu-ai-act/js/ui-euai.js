// The EU AI Act journey's screens, rebuilt as DOM from the capture pass in the Big Venture Incorporated
// demo workspace (Sep 26, 2026): the AI inventory metric reading in GROC Metrics, six AI Governance
// controls imported into the Control Baseline, the AI tolerance moved Open → Cautious in Settings, the
// AI Acceptable Use Policy published as v1.0, the Annex III oversight gap raised on the POA&M register,
// the TrustSignals AI governance summary saved (never published), and the Audit Trail's integrity check.
(function () {
  const { h, s } = L;
  const card = (x, y, w, hh, ...kids) => h('div', { class: 'card', style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px` }, ...kids);
  const at = (x, y, w, css = '', ...kids) => h('div', { class: 'abs', style: `left:${x}px;top:${y}px;${w ? `width:${w}px;` : ''}${css}` }, ...kids);
  const head = (eyebrow, title, lede, w = 1100) => at(0, 0, w, '', h('div', { class: 'eyebrow' }, eyebrow), h('div', { class: 'h1' }, title), lede ? h('div', { class: 'lede' }, lede) : null);
  const kpi = (x, y, w, n, k, sub) => { const nEl = h('div', { class: 'big' }, n), sEl = h('div', { class: 'sub' }, sub); const c = card(x, y, w, 112, at(22, 16, w - 40, '', nEl), at(22, 62, w - 40, '', h('div', { class: 'k' }, k)), at(22, 82, w - 40, '', sEl)); return { c, nEl, sEl }; };
  const caret = () => h('span', { style: 'display:inline-block;width:2px;height:17px;background:#0f172a;vertical-align:-3px;margin-left:1px' });
  const modalCard = (x, y, w, hh) => { const m = card(x, y, w, hh); m.style.zIndex = 8; m.style.boxShadow = '0 40px 90px -30px #0f172a88'; return m; };
  const btn = (x, y, w, label, primary) => at(x, y, w, `height:40px;border-radius:10px;${primary ? 'background:#0579aa;color:#fff' : 'border:1.5px solid var(--line);background:#fff;color:var(--ink)'};font:${primary ? 700 : 600} 14px/${primary ? 40 : 37}px var(--ui);text-align:center`, label);
  const fld = (x, y, w, txt, css = '') => at(x, y, w, `height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/42px var(--ui);padding-left:12px;color:var(--ink);white-space:nowrap;overflow:hidden;${css}`, txt);
  const lab = (x, y, t, w = 400) => at(x, y, w, '', h('span', { class: 'k', style: 'font-size:10.5px' }, t));
  const OWNER = 'Chief Technology, Data & AI Officer';
  const ST = { 'ON TARGET': ['#e5f6e5', '#0a7a0a'], 'OFF TARGET': ['#fbe7e7', '#b22b2b'], WATCH: ['#fdf3dc', '#8a6002'], 'NO READING': ['#f1f5f9', '#5d6e86'] };

  /* ------------------------------ GROC · 05 · METRICS — THE AI INVENTORY READING ------------------------------ */
  // [title, kind, value, target, status, foot, final value, final status]
  const TILES = [
    ['100% of production AI agents and models registered with an approved use case and named owner', 'KRI · LAG', 'No reading', 'Target: ≥ 100%', 'NO READING', 'No reading yet — record one or point your automation at the feed.', '64%', 'OFF TARGET'],
    ['Zero (0) confirmed cross-tenant data exposures arising from integration or AI inference', 'KRI · LAG', 'No reading', 'Target: = 0', 'NO READING', 'No reading yet', null],
    ['Annual ISMS training with ≥ 95% completion rate for the workforce', 'KRI · LAG', '96.4%', 'Target: ≥ 95%', 'ON TARGET', 'Attested 2026-09-07', null],
    ['Perform annual security reviews of 100% of critical third-party providers', 'KRI · LAG', '100%', 'Target: ≥ 100%', 'ON TARGET', 'Attested 2026-09-24', null],
    ['# of Risks ≥ Threshold', 'KRI · LAG', '1', 'Target: ≤ 0', 'OFF TARGET', 'Attested 2026-09-24', null],
    ['Maintain uptime ≥ 99.9% per SLA with customers', 'KRI · LAG', '99.95%', 'Target: ≥ 99.9%', 'ON TARGET', 'Attested 2026-09-13', null]];
  function inventory(x, y) {
    const w = UI.appWindow({ x, y, route: 'groc/metrics', active: 'groc', crumb: 'Report' }); const r = {};
    w.content.append(head('GROC · 05 · M', 'Metrics & Measures', 'Key Risk & Compliance Indicators and Key Performance Indicators — measured per ISO/IEC 27001 Clause 9.1 and reviewed at Management Review. Never a zero pretending to be data.', 1150));
    w.content.append(at(0, 132, 700, 'display:flex;gap:8px', ...['All metrics', 'ISMS', 'PIMS'].map((t, i) => h('span', { style: `height:32px;padding:0 16px;border-radius:16px;font:600 13.5px/30px var(--ui);${i ? 'border:1px solid var(--line);color:var(--ink-2)' : 'border:1.5px solid #00aeef;background:#e6f6fd;color:#0077ad'}` }, t))),
      at(900, 138, 404, 'text-align:right;font:600 14px var(--ui);color:var(--ink-2)', '37 metrics · 6 derived live · 31 attested'));
    r.tiles = TILES.map(([t, kind, v, tg, st, foot, fv, fst], i) => {
      const x0 = (i % 3) * 440, y0 = 186 + Math.floor(i / 3) * 336;
      const band = at(0, 0, 424, `height:40px;border-radius:14px 14px 0 0;font:700 11.5px/40px var(--ui);letter-spacing:.1em;text-align:right;padding-right:18px;background:${ST[st][0]};color:${ST[st][1]}`, st);
      const valEl = h('div', { style: `font:800 ${v === 'No reading' ? 30 : 46}px/1 var(--ui);letter-spacing:-.02em;font-variant-numeric:tabular-nums;color:${v === 'No reading' ? 'var(--mute)' : 'var(--ink)'}` }, v);
      const footEl = at(22, 250, 380, 'font:500 12.5px/1.4 var(--ui);color:var(--mute)', foot);
      const ownEl = at(22, 292, 260, 'font:600 12px var(--ui);color:var(--ink-2);white-space:nowrap', i < 2 ? (i ? 'Chief Architect' : OWNER) : 'VP of Information Technology (CISO)');
      const rec = at(290, 292, 120, 'text-align:right;font:600 13px var(--ui);color:#0077ad', 'Record reading');
      const c = card(x0, y0, 424, 320, band, at(16, 9, 60, 'height:22px;border-radius:11px;background:#fff;border:1px solid var(--line);font:600 10px/20px var(--ui);text-align:center;letter-spacing:.06em', 'LAG'),
        at(22, 56, 380, 'font:700 16px/1.3 var(--ui)', t), at(22, 136, 380, '', valEl), at(22, 196, 380, 'font:600 13px var(--ui);color:var(--ink-2)', tg), footEl, ownEl, rec);
      w.content.append(c); return { c, band, valEl, footEl, rec, st, v, fv, fst };
    });
    // record-a-reading modal (as captured)
    const m = modalCard(222, 70, 860, 540); r.modal = m;
    m.append(at(30, 24, 600, 'font:600 12px var(--mono);letter-spacing:.1em;color:var(--mute)', 'KRI · LAG · ISMS + PIMS'), at(760, 20, 80, 'height:34px;border-radius:9px;border:1.5px solid var(--line);font:600 13px/31px var(--ui);text-align:center', 'Close'),
      at(30, 48, 720, 'font:800 22px/1.25 var(--ui)', '100% of production AI agents and models registered with an approved use case and named owner'),
      at(30, 118, 800, 'font:500 14px/1.6 var(--ui);color:var(--ink-2)', h('b', { style: 'color:var(--ink)' }, 'Method — '), '(# of production AI models/agents in the AI Inventory with an approved use case and assigned owner / total #) × 100.', h('br'), h('b', { style: 'color:var(--ink)' }, 'Reporting — '), 'AI Inventory Register · IT Risk Committee Meeting', h('br'), h('b', { style: 'color:var(--ink)' }, 'Target: ≥ 100% · cadence every 92 days')));
    const box = at(30, 232, 800, 'height:190px;border:1px solid var(--line);border-radius:14px;background:#fbfdff'); m.append(box);
    box.append(at(20, 16, 300, 'font:700 15px var(--ui)', 'Record a reading'));
    r.val = h('span', {}, ''); r.vcaret = caret();
    box.append(at(20, 50, 180, 'height:44px;border:1.5px solid #00aeef;border-radius:9px;background:#fff;font:600 17px/42px var(--ui);padding-left:14px', r.val, r.vcaret),
      at(212, 50, 190, 'height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 15px/42px var(--mono);padding-left:14px', '09/26/2026'),
      at(414, 50, 366, 'height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 13px/42px var(--ui);padding-left:14px;color:var(--ink-2);white-space:nowrap;overflow:hidden', 'example.com/ai-inventory-register-q3-sample'));
    r.note = h('span', {}, '');
    box.append(at(20, 106, 600, 'height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/42px var(--ui);padding-left:14px;white-space:nowrap;overflow:hidden', r.note));
    r.save = at(634, 106, 146, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 14.5px/44px var(--ui);text-align:center', 'Save reading'); box.append(r.save);
    box.append(at(20, 160, 760, 'font:500 12.5px var(--ui);color:var(--mute)', 'Append-only: a correction is a newer reading. Evidence links reference your own repositories — never copies.'));
    m.append(at(30, 446, 520, 'height:44px;border:1.5px solid var(--line);border-radius:9px;font:500 14.5px/42px var(--ui);padding-left:14px', OWNER), at(562, 446, 268, 'height:44px;border-radius:9px;border:1.5px solid var(--line);font:600 14px/41px var(--ui);text-align:center', 'Set metric owner'));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ CONTROL BASELINE · IMPORT SIX AI GOVERNANCE CONTROLS ------------------------------ */
  // [code, title, function, corporate, platform, EU AI Act refs, new]
  const CTRL = [['AIG-01', 'AI system inventory and risk classification', 'Identify', 'PARTIALLY', 'PARTIALLY', 'Art. 6 · Annex III', 1],
    ['AIG-02', 'Human oversight of high-risk AI', 'Govern', 'NOT REVIEWED', 'PARTIALLY', 'Art. 14 · Art. 26', 1],
    ['AIG-03', 'AI transparency notices', 'Govern', 'LARGELY', 'LARGELY', 'Art. 50', 1],
    ['AIG-04', 'AI technical documentation and event logging', 'Detect', 'PARTIALLY', 'LARGELY', 'Art. 11 · Art. 12', 1],
    ['AIG-05', 'AI data governance', 'Protect', 'LARGELY', 'LARGELY', 'Art. 10', 1],
    ['AIG-06', 'AI literacy', 'Govern', 'FULLY', 'FULLY', 'Art. 4', 1],
    ['BCD-01', 'Backup and restoration of critical data', 'Recover', 'FULLY', 'FULLY', null, 0],
    ['GOV-01', 'Information security program charter', 'Govern', 'FULLY', 'FULLY', null, 0],
    ['GOV-02', 'Roles, responsibilities and accountability', 'Govern', 'LARGELY', 'LARGELY', null, 0],
    ['IAC-01', 'Unique identification and authentication', 'Protect', 'FULLY', 'FULLY', null, 0],
    ['IAC-02', 'Multi-factor authentication for privileged access', 'Protect', 'LARGELY', 'LARGELY', null, 0],
    ['IAC-03', 'Access reviews and recertification', 'Protect', 'PARTIALLY', 'LARGELY', null, 0]];
  const STC = { FULLY: '#17a34a', LARGELY: '#5cc16b', PARTIALLY: '#fab219', 'NOT REVIEWED': '#cbd5e1' };
  function classification(x, y) {
    const w = UI.appWindow({ x, y, route: 'controls', active: 'controls', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · CONTROL BASELINE', 'Control Baseline', 'The governed control catalog — cross-walked security and privacy frameworks. Upload any baseline in the template’s workbook shape; exports round-trip through the same format.'));
    r.k = [kpi(0, 138, 308, '12', 'CONTROLS', 'governed catalog'), kpi(332, 138, 308, '2', 'ENTITIES TRACKED', 'owner & status per entity'), kpi(664, 138, 308, '70%', 'IMPLEMENTED', 'across applicable assignments'), kpi(996, 138, 308, '0', 'REVIEWS OVERDUE', 'next review dates on track')];
    r.k.forEach((k) => w.content.append(k.c));
    const reg = card(0, 272, 1304, 580); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 18, 200, '', h('span', { class: 'k' }, 'REGISTER')));
    r.importBtn = at(1110, 10, 170, 'height:36px;border-radius:9px;background:#0579aa;color:#fff;font:700 13.5px/36px var(--ui);text-align:center', '⤒  Import baseline');
    reg.append(at(820, 10, 280, 'display:flex;gap:8px;justify-content:flex-end', ...['Export xlsx', 'Analyze baseline', 'Template'].map((t) => h('span', { style: 'height:36px;padding:0 12px;border-radius:9px;border:1px solid var(--line);font:600 12.5px/34px var(--ui);color:var(--ink-2);white-space:nowrap' }, t))), r.importBtn);
    r.fam = h('span', {}, 'Family: all');
    r.famPill = at(24, 56, 250, 'height:38px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:600 14px/35px var(--ui);padding:0 14px;color:var(--ink)', r.fam, h('span', { style: 'float:right;color:var(--mute)' }, '▾')); reg.append(r.famPill);
    ['Function: all', 'Tier: all', 'Crosswalk: none'].forEach((t, i) => reg.append(at(290 + i * 170, 56, 156, 'height:38px;border:1px solid var(--line);border-radius:9px;background:#fff;font:500 13.5px/36px var(--ui);padding:0 12px;color:var(--ink-2)', t)));
    r.count = at(1160, 66, 120, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '12 shown'); reg.append(r.count);
    r.done = at(24, 106, 1256, 'height:34px;border-radius:9px;background:#e5f6e5;font:600 13.5px/34px var(--ui);color:#0a7a0a;padding-left:14px;white-space:nowrap;overflow:hidden', 'Added 6 new controls · 12 unchanged (left untouched) · 12 entity assignments · 4 crosswalk mappings.'); reg.append(r.done);
    const cols = [[24, 'CODE'], [130, 'CONTROL'], [640, 'FUNCTION'], [770, 'IMPLEMENTATION NOTES · EU AI ACT'], [1110, 'ENTITIES']];
    const th = at(0, 150, 1304, 'height:34px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 10, 340, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))); reg.append(th);
    const body = at(0, 184, 1304, 'height:396px;overflow:hidden'); reg.append(body);
    r.rows = CTRL.map(([code, ctl, fn, a, b, ref, isNew], i) => {
      const refEl = ref ? h('span', { class: 'tag info', style: 'font:600 12px var(--mono);letter-spacing:0;height:24px' }, 'EU AI Act ' + ref) : h('span', { style: 'color:var(--mute);font:500 13px var(--ui)' }, '—');
      const nw = isNew ? h('span', { class: 'tag low', style: 'margin-left:8px;height:18px;font-size:9px' }, 'NEW') : null;
      const dots = [a, b].map((st) => h('i', { style: `display:block;width:15px;height:15px;border-radius:4px;background:${STC[st]}` }));
      const row = at(0, i * 33, 1304, `height:33px;border-bottom:1px solid var(--line);${isNew ? 'background:#fbfeff' : ''}`,
        at(24, 8, 100, 'font:600 12.5px var(--mono);color:var(--accent-text)', code), at(130, 7, 500, 'font:600 14px var(--ui);white-space:nowrap', ctl, nw),
        at(640, 8, 120, 'font:500 13px var(--ui);color:var(--ink-2)', fn), at(770, 4, 330, '', refEl), at(1110, 9, 60, 'display:flex;gap:5px', ...dots));
      body.append(row); return { row, refEl, nw, isNew };
    });
    // AIG-02 control preview (flyout, as captured)
    const fly = at(824, 0, 480, 'height:852px;z-index:7;border-radius:16px;background:#fff;box-shadow:-30px 0 60px -30px #0f172a55,0 0 0 1px #e2e8f0'); r.fly = fly;
    fly.append(at(24, 22, 300, '', h('span', { class: 'k' }, 'CONTROL PREVIEW')), at(24, 48, 430, 'font:800 24px/1.2 var(--ui);letter-spacing:-.01em', 'Human oversight of high-risk AI'),
      at(24, 110, 430, 'font:600 13px var(--ui);color:var(--ink-2)', h('span', { style: 'font:700 13px var(--mono);color:var(--accent-text);margin-right:8px' }, 'AIG-02'), 'AI Governance · Govern · ISMS'),
      at(24, 150, 430, '', h('span', { class: 'k' }, 'ENTITIES')));
    [['Corporate', 'NOT REVIEWED', 'gray'], ['Platform', 'PARTIALLY IMPLEMENTED', 'med']].forEach(([e, st, cls], i) => fly.append(at(24, 178 + i * 76, 432, 'height:64px;border:1px solid var(--line);border-radius:12px;background:#fff', at(16, 11, 200, 'font:700 15px var(--ui)', e), at(16, 36, 260, 'font:500 12px var(--ui);color:var(--mute)', OWNER), at(230, 20, 186, 'text-align:right', h('span', { class: 'tag ' + cls, style: 'height:22px;font-size:10px' }, st)))));
    fly.append(at(24, 350, 430, '', h('span', { class: 'k' }, 'POLICY STATEMENT')), at(24, 376, 432, 'font:500 14px/1.5 var(--ui);color:var(--ink-2)', 'High-risk AI systems are designed and operated so natural persons can understand, monitor, override and stop their outputs; oversight roles are named and trained.'));
    r.notes = at(24, 506, 432, 'border-radius:12px;border:1.5px solid #00aeef;background:#f0faff;padding:14px 16px', h('div', { class: 'k', style: 'font-size:10.5px' }, 'IMPLEMENTATION NOTES'), h('div', { style: 'font:600 15px/1.45 var(--ui);margin-top:6px' }, 'EU AI Act Art. 14 (human oversight), Art. 26 (deployer duties); ISO/IEC 42001 A.9.'));
    fly.append(r.notes, at(24, 636, 432, 'font:500 13.5px/1.5 var(--ui);color:var(--mute)', 'Evidence (0) · Associated POA&Ms & security exceptions (0) · Comments (0)'));
    reg.append(fly);
    // import preview modal (as captured)
    const m = modalCard(242, 40, 820, 520); r.modal = m;
    m.append(at(28, 22, 500, '', h('span', { class: 'k' }, 'IMPORT BASELINE')), at(772, 18, 30, 'font:500 22px var(--ui);color:var(--mute)', '×'),
      at(28, 46, 764, 'font:800 20px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', 'control-baseline-big-venture-incorporated-dem-ai-governance.xlsx'));
    const box = at(28, 90, 764, 'height:220px;border:1px solid var(--line);border-radius:12px;background:#fbfdff'); m.append(box);
    box.append(at(18, 16, 730, 'font:500 15px var(--ui)', h('b', {}, '18'), ' controls across ', h('b', { style: 'color:#0077ad' }, '8'), ' families · ', h('b', {}, '1'), ' privacy-relevant · privacy crosswalk sheet found'),
      at(18, 46, 730, 'font:500 13.5px var(--ui);color:var(--mute)', 'Top crosswalks: SOC 2 13 · CMMC L2 10 · ISO 27002 7 · EU GDPR 1'),
      r.newBox = at(18, 84, 728, 'border-radius:9px;background:#e6f6fd;font:600 14px/1.5 var(--ui);color:#0077ad;padding:12px 14px', '12 existing control ids match this catalog and will be left exactly as they are. ', h('b', {}, '6 new controls will be added.')),
      at(18, 164, 728, 'font:600 12.5px var(--mono);color:var(--ink-2)', 'AIG-01 · AIG-02 · AIG-03 · AIG-04 · AIG-05 · AIG-06  —  family: AI Governance'));
    m.append(at(28, 330, 764, '', h('span', { class: 'k' }, 'MAP ENTITY COLUMNS TO BUSINESS ENTITIES')),
      at(28, 358, 764, 'display:flex;gap:18px;font:600 13.5px var(--mono)', ...['Corporate', 'Platform'].map((e) => h('span', { style: 'height:38px;padding:0 14px;border:1.5px solid #00aeef;border-radius:9px;line-height:35px' }, e, h('span', { style: 'margin-left:14px;font:700 11px var(--ui);color:#0077ad' }, 'TRACKED 18·18')))));
    r.commit = at(28, 430, 160, 'height:48px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/48px var(--ui);text-align:center', 'Add 6 new'); m.append(r.commit, at(202, 430, 100, 'height:48px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/45px var(--ui);text-align:center', 'Cancel'),
      at(320, 434, 470, 'font:500 13px/1.4 var(--ui);color:var(--mute)', 'Unchanged controls are never touched — dispositions and notes never come from uploads'));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ SETTINGS · AI TOLERANCE OPEN → CAUTIOUS ------------------------------ */
  const LEVELS = ['Averse', 'Minimal', 'Cautious', 'Open', 'Hungry'];
  // [area, before, after, declared-only] — as captured after the vCISO kickoff, with the AI change made for this film
  const AREAS = [['Regulatory & framework compliance', 0, 0], ['Ransomware & destructive attack', 0, 0], ['Data protection & privacy', 1, 1], ['Identity compromise & identity fraud', 1, 1],
    ['Financial fraud & payment integrity', 0, 0], ['Third-party & supply chain', 2, 2], ['Service availability & resilience', 2, 2], ['Vulnerability & patch exposure', 2, 2],
    ['Cloud misconfiguration & attack surface', 2, 2], ['AI & emerging-technology use', 3, 2, 1], ['Insider risk', 2, 2, 1], ['Reputational', 2, 2, 1]];
  function appetite(x, y) {
    const w = UI.appWindow({ x, y, route: 'settings', active: 'settings', crumb: 'Workspace settings' }); const r = {};
    w.content.append(head('BIG VENTURE INCORPORATED · WORKSPACE SETTINGS', 'Risk appetite & tolerance', 'The organization’s declared tolerance per area. Overall appetite is calculated (the median of the declared levels), never typed in.', 1100));
    const c = card(0, 130, 1304, 722); w.content.append(c); r.card = c;
    c.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'RISK APPETITE & TOLERANCE')), at(300, 20, 600, 'font:500 13px var(--ui);color:var(--mute)', 'set by the vCISO · via workspace'));
    r.save = at(1100, 12, 180, 'height:40px;border-radius:10px;background:#0579aa;color:#fff;font:700 14.5px/40px var(--ui);text-align:center', 'Save risk profile'); c.append(r.save);
    r.toast = at(700, 22, 390, 'text-align:right;font:600 13.5px var(--ui);color:#0a7a0a', 'Risk profile saved.'); c.append(r.toast);
    r.spread = h('span', { class: 'tag med', style: 'margin-left:10px;height:22px' }, 'Wide spread — worth a board review');
    c.append(at(24, 62, 1256, 'height:46px;border:1px solid var(--line);border-radius:10px;background:#f7f9fb;font:500 15px/46px var(--ui);padding-left:16px;white-space:nowrap;overflow:hidden', '◔  Overall appetite: ', h('b', {}, 'Cautious'), h('span', { style: 'color:var(--ink-2)' }, ' — anchored by Averse tolerances in Regulatory & framework compliance, Ransomware…'), r.spread));
    r.rows = AREAS.map(([name, a, b, dec], i) => {
      const row = at(24, 120 + i * 40, 1256, `height:40px;border-bottom:1px solid var(--line);${b !== a ? 'background:#fbfeff' : ''}`);
      row.append(at(0, 11, 560, 'font:600 15px var(--ui)', name, dec ? h('span', { class: 'tag gray', style: 'margin-left:10px;height:19px;font-size:9.5px' }, 'declared only') : null));
      const segs = LEVELS.map((lv, k) => h('span', { style: `display:inline-block;width:84px;height:30px;font:600 13px/30px var(--ui);text-align:center;color:var(--ink-2);${k ? 'border-left:1px solid var(--line);' : ''}` }, lv));
      row.append(at(820, 4, 424, 'height:32px;border:1px solid var(--line);border-radius:9px;background:#fff;overflow:hidden;display:flex', ...segs));
      c.append(row); return { row, segs, a, b, name };
    });
    r.ai = r.rows[9];
    c.append(at(24, 614, 400, '', h('span', { class: 'k' }, 'BOARD NOTE (OPTIONAL)')));
    r.note = h('span', {}, ''); r.ncaret = caret();
    r.noteBox = at(24, 638, 1256, 'height:64px;border:1.5px solid var(--line);border-radius:10px;background:#fff;font:500 14.5px/1.45 var(--ui);padding:9px 14px;color:var(--ink-2);overflow:hidden',
      h('span', { style: 'color:var(--mute)' }, 'Set with the executive team at the vCISO kickoff, Sep 2026. As an energy operator we hold near-zero tolerance for anything that threatens regulatory standing… '), r.note, r.ncaret);
    c.append(r.noteBox);
    return { ...w, r };
  }

  /* ------------------------------ GOVERNANCE DOCS · AI ACCEPTABLE USE POLICY ------------------------------ */
  function policy(x, y) {
    const w = UI.appWindow({ x, y, route: 'governance', active: 'governance', crumb: 'Governance Docs' }); const r = {};
    const top = card(0, 0, 1304, 236); w.content.append(top);
    top.append(at(28, 22, 600, 'font:600 13.5px var(--ui);color:var(--mute)', '← Governance Documentation Center'),
      at(28, 50, 1240, 'font:800 31px/1.15 var(--ui);letter-spacing:-.02em', 'AI Acceptable Use Policy'));
    r.badge = h('span', { class: 'tag info', style: 'height:26px;font-size:11.5px' }, '● Draft'); r.ver = h('span', {}, 'v0.1');
    top.append(at(28, 98, 1100, 'display:flex;gap:10px;align-items:center', r.badge, h('span', { style: 'height:26px;padding:0 10px;border:1px solid var(--line);border-radius:7px;font:600 12.5px/24px var(--mono)' }, 'AUP-AI-01 · ', r.ver),
      h('span', { style: 'font:500 13.5px var(--ui);color:var(--ink-2);margin-left:6px' }, 'Policy · Internal · owner ' + OWNER + ' · approver Dana Whitfield, CEO (sample)')));
    r.steps = ['DRAFT', 'IN REVIEW', 'APPROVED', 'PUBLISHED'].map((t, i) => { const dot = h('span', { style: 'display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:#fff;vertical-align:-4px;margin-right:8px' });
      const line = i < 3 ? h('span', { style: 'display:inline-block;width:70px;height:2px;background:#e2e8f0;vertical-align:4px;margin:0 12px' }) : null;
      const lb = h('span', { style: 'font:700 12px var(--ui);letter-spacing:.08em;color:var(--mute)' }, t); return { dot, line, lab: lb, el: h('span', {}, dot, lb, line) }; });
    top.append(at(28, 142, 900, 'white-space:nowrap', ...r.steps.map((s0) => s0.el)));
    top.append(btn(28, 180, 200, '◉  View document (PDF)', true), btn(240, 180, 140, '⤓  Word (.docx)'));
    r.act = h('span', {}, 'Submit for review'); r.actBtn = at(392, 180, 190, 'height:40px;border-radius:10px;border:1.5px solid var(--line);background:#fff;font:700 14px/37px var(--ui);text-align:center', r.act); top.append(r.actBtn);
    r.note = at(600, 188, 500, 'font:600 13.5px var(--ui);color:#0077ad', ''); top.append(r.note);
    const sec = card(0, 256, 1304, 350); w.content.append(sec);
    sec.append(at(24, 18, 700, '', h('span', { class: 'k' }, 'DOCUMENT SECTIONS'), h('span', { class: 'sub', style: 'margin-left:10px' }, '4 sections · lines starting with “- ” render as bullets')));
    const pill = (t, bg, fg) => h('span', { style: `display:inline-block;height:24px;padding:0 10px;border-radius:12px;background:${bg};color:${fg};font:700 11.5px/24px var(--ui);letter-spacing:.04em;margin-right:8px` }, t);
    const SECS = [['3.1', 'Approved, restricted and prohibited uses', [pill('APPROVED · drafting, research, code assist', '#e5f6e5', '#0a7a0a'), pill('RESTRICTED · Annex III areas: hiring, credit', '#fdf3dc', '#8a6002'), pill('PROHIBITED · Art. 5 practices', '#fbe7e7', '#b22b2b')]],
      ['3.2', 'Data handling', ['No Confidential or Restricted data in public AI tools; personal data only in contracted, tenant-isolated services.']],
      ['3.3', 'Human oversight and transparency', ['Every high-risk use has a named owner who can override and stop it (Art. 14). People are told when AI is involved (Art. 50).']],
      ['3.4', 'Inventory, literacy and review', ['New AI tools are registered before first use. AI literacy training for everyone who uses AI (Art. 4). (Sample data.)']]];
    r.secs = SECS.map(([n, t, d], i) => { const e = at(24, 54 + i * 72, 1256, 'height:68px;border-top:1px solid var(--line)', at(0, 12, 60, 'font:700 14px var(--mono);color:var(--accent-text)', n), at(64, 10, 900, 'font:700 16px var(--ui)', t), at(64, 37, 1180, 'font:500 13.5px/1.45 var(--ui);color:var(--ink-2);white-space:nowrap', ...d)); sec.append(e); return e; });
    r.pill3 = r.secs[0].lastChild;
    const pv = card(0, 626, 1304, 226); w.content.append(pv); r.pv = pv;
    pv.append(at(24, 18, 600, '', h('span', { class: 'k' }, 'PUBLISHED VERSIONS — FROZEN FOREVER')));
    r.pvN = at(1100, 18, 180, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '0 published'); pv.append(r.pvN);
    r.pvEmpty = at(24, 56, 1100, 'font:500 14px/1.5 var(--ui);color:var(--mute)', 'None yet. Publishing freezes the rendered document as an immutable snapshot — the deliverable stays reproducible even as the catalog moves on.'); pv.append(r.pvEmpty);
    r.pvRow = at(24, 58, 1256, 'height:92px;border:1.5px solid #bfe3f5;border-radius:14px;background:#f5fbfe',
      at(20, 22, 48, 'height:48px;border-radius:12px;background:#0f172a;display:grid;place-items:center', s('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#8fd3f2', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2 }), s('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }))),
      at(86, 18, 700, 'font:800 20px var(--ui)', 'v1.0', h('span', { class: 'tag low', style: 'margin-left:10px;height:22px' }, 'CURRENT')),
      at(86, 50, 900, 'font:500 14px var(--ui);color:var(--ink-2)', 'AI AUP v1.0 ahead of the EU AI Act high-risk obligations (2 Dec 2027).'),
      at(1000, 34, 236, 'text-align:right;font:500 13px var(--ui);color:var(--mute)', 'Sep 26, 2026 · View · .docx'));
    pv.append(r.pvRow);
    const m = modalCard(322, 120, 660, 420); r.modal = m;
    m.append(at(28, 24, 600, 'font:800 22px var(--ui)', 'Publish this document'),
      at(28, 62, 600, 'font:500 14.5px/1.5 var(--ui);color:var(--ink-2)', 'Publishing freezes the fully rendered document as an IMMUTABLE version — the exact deliverable, reproducible forever.'),
      at(28, 150, 300, '', h('span', { class: 'k' }, 'VERSION LABEL')), at(28, 174, 604, 'height:42px;border:1.5px solid var(--line);border-radius:9px;font:600 15px/40px var(--mono);padding-left:14px', '1.0'),
      at(28, 232, 400, '', h('span', { class: 'k' }, 'REVISION COMMENT (VERSION HISTORY)')));
    r.comment = h('span', {}, ''); r.caret = caret();
    m.append(at(28, 256, 604, 'height:58px;border:1.5px solid #00aeef;border-radius:9px;font:500 15px/1.4 var(--ui);padding:9px 14px', r.comment, r.caret));
    r.pub = at(28, 340, 150, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/44px var(--ui);text-align:center', 'Publish v1.0'); m.append(r.pub, at(192, 340, 100, 'height:44px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/41px var(--ui);text-align:center', 'Cancel'));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ POA&M · NEW FINDING — THE ANNEX III OVERSIGHT GAP ------------------------------ */
  const POAMS = [['POAM.2026.001', 'Corporate', 'MFA not enforced for third-party contractor accounts', 'HIGH', 'high', 'P1', 'IN-REMEDIATION', 'Identity Team'],
    ['POAM.2026.007', 'Platform', 'Admin API reachable without IP allowlisting', 'HIGH', 'high', 'P1', 'ASSESSOR VALIDATION', 'Cloud Platform'],
    ['POAM.2026.005', 'Platform', 'Container images not scanned before deploy', 'HIGH', 'high', 'P1', 'ASSIGNED', 'DevSecOps'],
    ['POAM.2026.003', 'Platform', 'S3 buckets without default encryption in the staging account', 'HIGH', 'high', 'P1', 'IN-REMEDIATION', 'Cloud Platform'],
    ['POAM.2026.002', 'Corporate', 'Endpoint backup agent missing on finance workstations', 'MODERATE', 'med', 'P2', 'ASSIGNED', 'IT Operations'],
    ['POAM.2026.009', 'Platform', 'TLS certificate expiry monitoring gaps', 'MODERATE', 'med', 'P2', 'ASSIGNED', 'SRE']];
  const DEF = 'Human oversight not documented for the resume-screening model (EU AI Act Annex III · employment)';
  function oversight(x, y) {
    const w = UI.appWindow({ x, y, route: 'poam', active: 'poam', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · POA&M', 'Plan of Action & Milestones', 'The official record of pending remediation — one master per deficiency, each with an owner, a date and its assessment history.'));
    r.newBtn = at(1134, 20, 170, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/44px var(--ui);text-align:center', '＋  New finding'); w.content.append(r.newBtn);
    r.k = [kpi(0, 138, 308, '9', 'OPEN POA&M ITEMS', '10 total incl. closed'), kpi(332, 138, 308, '4', 'CRITICAL / HIGH (OPEN)', '0 critical · 4 high'), kpi(664, 138, 308, '0', 'P0 (OPEN)', 'immediate priority group'), kpi(996, 138, 308, '2', 'BUSINESS ENTITIES', 'with tracked findings')];
    r.k.forEach((k) => w.content.append(k.c));
    const reg = card(0, 272, 1304, 580); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'REGISTER')));
    r.famChip = at(760, 12, 520, 'text-align:right;font:600 13px var(--ui);color:var(--ink-2)', 'Open POA&M by control family:  ', h('span', { class: 'tag high', style: 'height:24px;font:700 12px var(--mono)' }, 'AIG  1 · 1 C/H')); reg.append(r.famChip);
    const cols = [[24, 'POA&M ID'], [180, 'DEFICIENCY'], [760, 'INHERENT'], [860, 'LIFECYCLE'], [1040, 'OWNER']];
    reg.append(at(0, 56, 1304, 'height:36px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 11, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    const body = at(0, 92, 1304, 'height:488px;overflow:hidden'); reg.append(body);
    const mkRow = ([id, ent, def, sev, cls, pri, life, own], ctrl) => at(0, 0, 1304, 'height:70px;border-bottom:1px solid var(--line)',
      at(24, 25, 150, 'font:600 12.5px var(--mono);color:var(--accent-text)', id), at(180, 14, 570, 'font:600 15px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', def),
      at(180, 40, 570, 'font:500 12px var(--ui);color:var(--mute)', ent + ' · ' + pri, ctrl ? h('span', { class: 'tag info', style: 'margin-left:10px;height:18px;font:700 10px var(--mono)' }, ctrl) : null),
      at(760, 23, 100, '', h('span', { class: 'tag ' + cls }, sev)), at(860, 23, 180, '', h('span', { class: 'tag ' + (/REMEDIAT|VALIDATION/.test(life) ? 'info' : 'gray') }, life)), at(1040, 25, 250, 'font:600 13.5px var(--ui);white-space:nowrap', own));
    r.newRow = mkRow(['POAM.2026.011', 'Corporate', DEF, 'HIGH', 'high', 'P1', 'ASSIGNED', 'Chief Technology, Data & AI Off…'], 'AIG-02'); r.newRow.style.background = '#f5fbfe'; body.append(r.newRow);
    r.rows = POAMS.map((p, i) => { const row = mkRow(p); row.style.top = (i * 70) + 'px'; body.append(row); return row; });
    // new-finding form (as captured)
    const m = modalCard(152, 10, 1000, 836); r.modal = m;
    m.append(at(28, 20, 400, '', h('span', { class: 'k' }, 'NEW RECORD')), at(28, 42, 700, 'font:800 24px var(--ui)', 'New POA&M finding'), at(952, 22, 30, 'font:500 22px var(--ui);color:var(--mute)', '✕'));
    m.append(at(28, 92, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'IDENTITY')));
    m.append(lab(28, 118, 'POA&M ID'), fld(28, 138, 200, 'Assigned on save', 'color:var(--mute)'), lab(244, 118, 'BUSINESS ENTITY'), fld(244, 138, 300, 'Corporate'), lab(560, 118, 'FINDING DATE'), fld(560, 138, 200, '2026-09-26', 'font-family:var(--mono)'));
    m.append(lab(28, 196, 'DEFICIENCY SUMMARY *'));
    r.def = h('span', {}, ''); r.dcaret = caret();
    r.defBox = at(28, 216, 944, 'height:70px;border:1.5px solid #00aeef;border-radius:9px;background:#fff;font:600 16px/1.4 var(--ui);padding:10px 14px', r.def, r.dcaret); m.append(r.defBox);
    m.append(at(28, 306, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'RISK & PRIORITY')));
    const seg = (x0, y0, opts, on) => at(x0, y0, 0, 'display:flex;border:1px solid var(--line);border-radius:9px;overflow:hidden;height:38px', ...opts.map((o, k) => h('span', { style: `padding:0 14px;font:600 13px/38px var(--ui);${k ? 'border-left:1px solid var(--line);' : ''}${k === on ? 'background:#0f172a;color:#fff' : 'color:var(--ink-2)'}` }, o)));
    r.risk = seg(28, 352, ['Critical', 'High', 'Moderate', 'Low', 'Very Low'], -1); r.pri = seg(470, 352, ['P0', 'P1', 'P2', 'P3', 'P4'], -1);
    m.append(lab(28, 332, 'INHERENT RISK'), r.risk, lab(470, 332, 'PRIORITY GROUP'), r.pri, lab(740, 332, 'LIFECYCLE'), fld(740, 350, 232, 'Assigned  ▾'));
    m.append(at(28, 418, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'CLASSIFICATION')), lab(28, 444, 'CATEGORY'), fld(28, 464, 290, 'AI Governance'), lab(334, 444, 'NIST CSF FUNCTION'), fld(334, 464, 190, 'GOVERN  ▾'),
      lab(540, 444, 'ASSOCIATED CONTROLS (SCF CODES)'), r.ctrlF = fld(540, 464, 432, ''));
    r.ctrlChip = h('span', { class: 'tag info', style: 'height:26px;font:700 12.5px var(--mono);margin-top:8px' }, 'AIG-02  ×'); r.ctrlF.append(r.ctrlChip);
    m.append(at(28, 530, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'REMEDIATION')), lab(28, 556, 'REMEDIATION OWNER'), r.ownF = fld(28, 576, 460, ''), lab(504, 556, 'C&A REMEDIATION TIMELINE'), r.tlF = fld(504, 576, 468, ''));
    r.own = h('span', {}, ''); r.ownF.append(r.own); r.tl = h('span', {}, ''); r.tlF.append(r.tl);
    m.append(lab(28, 640, 'IMMEDIATE REMEDIATION PLAN'), at(28, 660, 944, 'height:58px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/1.45 var(--ui);padding:8px 14px;color:var(--ink-2)', 'Name an oversight owner in HR; document the override and stop procedure; train recruiters who act on model rankings.'));
    r.add = at(28, 752, 160, 'height:48px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/48px var(--ui);text-align:center', 'Add finding');
    m.append(r.add, at(202, 752, 100, 'height:48px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/45px var(--ui);text-align:center', 'Cancel'), at(320, 766, 500, 'font:500 13px var(--ui);color:var(--mute)', '⌘S to save · Esc to close'));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ TRUSTSIGNALS · AI GOVERNANCE SUMMARY (saved, not published) ------------------------------ */
  const AI_OLD = 'AI governance disclosures distinguish approved uses, restricted uses, telemetry handling and human review.';
  function transparency(x, y) {
    const w = UI.appWindow({ x, y, route: 'trustsignals', active: 'trustsignals', crumb: 'Trust' }); const r = {};
    w.content.append(head('CLIENT VISION · TRUST', 'TrustSignals', 'Publish a living, evidence-backed Trust Center for your customers — bands and coverage, never raw findings. Publishing captures an approved snapshot; nothing else ever leaves the workspace.', 980));
    r.status = at(1010, 22, 294, 'text-align:right', h('span', { class: 'tag gray', style: 'height:30px;font-size:12px;padding:0 14px' }, '● Draft — not public')); w.content.append(r.status);
    const pf = card(0, 150, 800, 702); w.content.append(pf);
    pf.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'PORTAL PROFILE')));
    r.save = at(600, 12, 176, 'height:40px;border-radius:10px;background:#0579aa;color:#fff;font:700 14px/40px var(--ui);text-align:center', 'Save trust profile'); pf.append(r.save);
    r.toast = at(300, 22, 290, 'text-align:right;font:600 13.5px var(--ui);color:#0a7a0a', 'Trust profile saved.'); pf.append(r.toast);
    const SUM = [['SECURITY SUMMARY', 'Security posture is represented through approved policies, published artifacts and live control evidence.'], ['COMPLIANCE SUMMARY', 'Compliance coverage is published only where evidence and artifacts support it.'],
      ['PRIVACY & DATA SUMMARY', 'Privacy commitments and data-handling statements are managed as approved trust content.'], ['RESILIENCE SUMMARY', 'Availability and recovery posture derive from live estate distribution and backup control evidence.']];
    SUM.forEach(([k, v], i) => pf.append(at(24, 64 + i * 82, 752, '', at(0, 0, 500, '', h('span', { class: 'k', style: 'font-size:10.5px' }, k)), at(680, -2, 72, 'text-align:right', h('span', { class: 'tag low', style: 'height:20px;font-size:9.5px' }, 'shown')),
      at(0, 22, 752, 'height:48px;border:1px solid var(--line);border-radius:9px;background:#fbfdff;font:500 13.5px/48px var(--ui);padding:0 12px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', v))));
    pf.append(at(24, 400, 500, '', h('span', { class: 'k', style: 'font-size:10.5px;color:#0077ad' }, 'AI GOVERNANCE SUMMARY')), at(704, 398, 72, 'text-align:right', h('span', { class: 'tag low', style: 'height:20px;font-size:9.5px' }, 'shown')));
    r.old = h('span', { style: 'color:var(--mute)' }, AI_OLD); r.ai = h('span', {}, ''); r.acaret = caret();
    r.aiBox = at(24, 424, 752, 'height:176px;border:1.5px solid #00aeef;border-radius:10px;background:#fff;font:500 16.5px/1.5 var(--ui);padding:14px 16px', r.old, r.ai, r.acaret); pf.append(r.aiBox);
    pf.append(at(24, 616, 752, 'font:500 13px/1.5 var(--ui);color:var(--mute)', 'Saving updates the draft profile only. Customers see nothing until an approved snapshot is published.'));
    const rd = card(824, 150, 480, 330); w.content.append(rd);
    rd.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'PUBLISH READINESS')));
    r.checks = [['Trust profile saved', 0], ['At least one artifact listed', 1], ['Contact or request path set', 0], ['Published', 0]].map(([t, done], i) => {
      const dot = h('span', { style: `position:absolute;left:0;top:10px;width:22px;height:22px;border-radius:50%;border:2px solid ${done ? '#17a34a' : '#cbd5e1'};background:${done ? '#17a34a' : '#fff'}` });
      const st = h('span', { class: 'tag ' + (done ? 'low' : 'gray') }, done ? 'done' : 'open');
      const row = at(24, 58 + i * 64, 432, 'height:52px', dot, at(36, 12, 300, 'font:600 15px var(--ui)', t), at(332, 14, 100, 'text-align:right', st)); rd.append(row); return { dot, st }; });
    const pv = card(824, 500, 480, 352); w.content.append(pv); r.pv = pv;
    pv.append(at(0, 0, 480, 'height:92px;border-radius:14px 14px 0 0;background:linear-gradient(118deg,#ffb36b 0%,#0039e6 62%,#031db0 100%);color:#fff',
      at(22, 18, 440, 'font:600 10.5px var(--mono);letter-spacing:.14em;opacity:.9', 'TRUST CENTER PREVIEW · DRAFT'), at(22, 40, 440, 'font:700 22px var(--display);letter-spacing:-.02em', 'Big Venture Incorporated')));
    r.pvCard = at(22, 112, 436, 'height:216px;border:1px solid var(--line);border-radius:12px;background:#fff',
      at(18, 18, 44, 'height:44px;border-radius:12px;background:#e6f6fd;display:grid;place-items:center', s('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#0077ad', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s('path', { d: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z' }), s('path', { d: 'M9 12l2 2 4-4' }))),
      at(76, 20, 340, 'font:700 17px var(--ui)', 'AI governance'), at(76, 44, 340, 'font:500 12.5px var(--ui);color:var(--mute)', 'Declared use, oversight and review'));
    r.pvText = at(18, 82, 400, 'font:500 13.5px/1.5 var(--ui);color:var(--ink-2)', AI_OLD); r.pvCard.append(r.pvText); pv.append(r.pvCard);
    return { ...w, r };
  }

  /* ------------------------------ AUDIT TRAIL · VERIFY INTEGRITY ------------------------------ */
  const EV = [['14:59:03', 'trust.profile_updated', 'trust_portal'], ['14:58:33', 'poam.created', 'POAM.2026.011'], ['14:57:46', 'governance.document_published', 'AUP-AI-01 · v1.0'],
    ['14:57:23', 'governance.status_changed', 'AUP-AI-01 · approved'], ['14:57:05', 'governance.section_added', 'AUP-AI-01 · 3.4'], ['14:56:27', 'governance.document_created', 'AUP-AI-01'],
    ['14:55:22', 'risk_profile.update', 'AI & emerging-technology use'], ['14:54:27', 'isms.metric_recorded', 'ai_registry_pct'], ['14:53:03', 'control.baseline_imported', 'controls · +6 AIG']];
  function evidence(x, y) {
    const w = UI.appWindow({ x, y, route: 'audit', active: 'audit', crumb: 'Trust' }); const r = {};
    w.content.append(head('CLIENT VISION · AUDIT TRAIL', 'Audit Trail', 'Every action in Big Venture Incorporated — who did what, when, and to which record. The log is append-only and hash-chained at the database: events can never be edited or deleted, and Verify integrity proves it.', 1150));
    const c = card(0, 150, 1304, 702); w.content.append(c); r.c = c;
    c.append(at(24, 22, 200, '', h('span', { class: 'k' }, 'EVENTS')));
    r.verify = at(1000, 12, 150, 'height:40px;border-radius:10px;background:#0579aa;color:#fff;font:700 14px/40px var(--ui);text-align:center', 'Verify integrity');
    c.append(r.verify, at(1162, 12, 118, 'height:40px;border-radius:10px;border:1.5px solid var(--line);font:600 14px/37px var(--ui);text-align:center', 'Export CSV'));
    r.ok = at(130, 12, 620, 'height:40px;border-radius:20px;background:#e5f6e5;color:#0a7a0a;font:700 15px/40px var(--ui);padding:0 18px;display:inline-block;white-space:nowrap', '✓  Chain intact — ', r.okN = h('span', {}, '67'), ' events verified'); c.append(r.ok);
    c.append(at(0, 68, 1304, 'height:36px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...[[70, 'TIME'], [260, 'ACTOR'], [480, 'ACTION'], [860, 'TARGET']].map(([cx, t]) => at(cx, 11, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    r.rows = EV.map(([tm, act, tgt], i) => {
      const link = at(24, 22, 26, 'height:26px;border-radius:50%;border:2.5px solid #cbd5e1;background:#fff');
      const hash = at(1180, 23, 100, 'text-align:right;font:600 11.5px var(--mono);color:var(--mute)', (0x9f3a + i * 0x4e1b).toString(16).slice(-4) + '…');
      const row = at(0, 104 + i * 64, 1304, 'height:64px;border-bottom:1px solid var(--line)', link, at(70, 22, 180, 'font:600 13px var(--mono);color:var(--ink-2)', '2026-09-26 ' + tm),
        at(260, 22, 210, 'font:600 13.5px var(--ui)', 'vCISO · 3HUE'), at(480, 20, 370, '', h('span', { style: 'font:600 13px var(--mono);color:var(--accent-text);background:#eef7fc;padding:3px 8px;border-radius:6px' }, act)),
        at(860, 22, 320, 'font:500 13.5px var(--ui);color:var(--ink-2);white-space:nowrap', tgt), hash);
      c.append(row); return { row, link, hash };
    });
    r.chain = at(36, 104, 3, `height:${64 * (EV.length - 1) + 12}px;background:#e2e8f0;transform-origin:top;margin-top:26px`); c.insertBefore(r.chain, r.rows[0].row);
    return { ...w, r };
  }

  window.UI5 = { inventory, classification, appetite, policy, oversight, transparency, evidence, AREAS, LEVELS, EV, DEF, TILES };
})();
