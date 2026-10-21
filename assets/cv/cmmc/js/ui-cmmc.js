// The CMMC Level 2 readiness journey's screens, rebuilt as DOM from the capture pass in the Big Venture
// Incorporated demo workspace (Sep 26, 2026): the baseline import that cross-walks controls to CMMC L2
// practices, evidence linked from the CMMC evidence library, the System Security Plan published as v1.0,
// the POA&M register, a remediated item advanced to Assessor Validation, and GROC's compliance coverage.
// (Incident Response reuses UI2.incidents from the SOC 2 capture.)
(function () {
  const { h, s } = L;
  const card = (x, y, w, hh, ...kids) => h('div', { class: 'card', style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px` }, ...kids);
  const at = (x, y, w, css = '', ...kids) => h('div', { class: 'abs', style: `left:${x}px;top:${y}px;${w ? `width:${w}px;` : ''}${css}` }, ...kids);
  const head = (eyebrow, title, lede, w = 1100) => at(0, 0, w, '', h('div', { class: 'eyebrow' }, eyebrow), h('div', { class: 'h1' }, title), lede ? h('div', { class: 'lede' }, lede) : null);
  const kpi = (x, y, w, n, k, sub) => { const nEl = h('div', { class: 'big' }, n), sEl = h('div', { class: 'sub' }, sub); const c = card(x, y, w, 112, at(22, 16, w - 40, '', nEl), at(22, 62, w - 40, '', h('div', { class: 'k' }, k)), at(22, 82, w - 40, '', sEl)); return { c, nEl, sEl }; };
  const caret = () => h('span', { style: 'display:inline-block;width:2px;height:17px;background:#0f172a;vertical-align:-3px;margin-left:1px' });
  const modalCard = (x, y, w, hh) => { const m = card(x, y, w, hh); m.style.zIndex = 8; m.style.boxShadow = '0 40px 90px -30px #0f172a88'; return m; };
  const btn = (x, y, w, label, primary) => at(x, y, w, `height:40px;border-radius:10px;${primary ? 'background:#0579aa;color:#fff' : 'border:1.5px solid var(--line);background:#fff;color:var(--ink)'};font:${primary ? 700 : 600} 14px/${primary ? 40 : 37}px var(--ui);text-align:center`, label);

  /* ------------------------------ CONTROL BASELINE · IMPORT → CMMC L2 CROSSWALK ------------------------------ */
  const CTRL = [['BCD-01', 'Continuity', 'Backup and restoration of critical data', 'MP.L2-3.8.9'], ['GOV-01', 'Governance', 'Information security program charter', 'CA.L2-3.12.4'], ['GOV-02', 'Governance', 'Roles, responsibilities and accountability', null],
    ['IAC-01', 'Identity & Access', 'Unique identification and authentication', 'IA.L2-3.5.2'], ['IAC-02', 'Identity & Access', 'Multi-factor authentication for privileged access', 'IA.L2-3.5.3'], ['IAC-03', 'Identity & Access', 'Access reviews and recertification', 'AC.L2-3.1.1'],
    ['IRO-01', 'Incident Response', 'Incident response plan and exercises', 'IR.L2-3.6.1'], ['NET-01', 'Network Security', 'Boundary protection and segmentation', 'SC.L2-3.13.1'], ['NET-02', 'Network Security', 'Encrypted transmission of sensitive data', 'SC.L2-3.13.8'],
    ['PRI-01', 'Privacy', 'Lawful basis and consent management', null], ['VPM-01', 'Vulnerability Management', 'Vulnerability scanning and triage', 'RA.L2-3.11.2'], ['VPM-02', 'Vulnerability Management', 'Remediation within defined timelines', 'RA.L2-3.11.3']];
  function practice(x, y) {
    const w = UI.appWindow({ x, y, route: 'controls', active: 'controls', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · CONTROL BASELINE', 'Control Baseline', 'The governed control catalog — cross-walked security and privacy frameworks. Upload any baseline in the template’s workbook shape; exports round-trip through the same format.'));
    [['12', 'CONTROLS', 'governed catalog'], ['2', 'ENTITIES TRACKED', 'owner & status per entity'], ['70%', 'IMPLEMENTED', 'across applicable assignments'], ['0', 'REVIEWS OVERDUE', 'next review dates on track']].forEach(([n, k, sub], i) => w.content.append(kpi(i * 332, 138, 308, n, k, sub).c));
    const reg = card(0, 272, 1304, 580); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 18, 200, '', h('span', { class: 'k' }, 'REGISTER')));
    r.importBtn = at(1110, 10, 170, 'height:36px;border-radius:9px;background:#0579aa;color:#fff;font:700 13.5px/36px var(--ui);text-align:center', '⤒  Import baseline');
    reg.append(at(820, 10, 280, 'display:flex;gap:8px;justify-content:flex-end', ...['Export xlsx', 'Analyze baseline', 'Template'].map((t) => h('span', { style: 'height:36px;padding:0 12px;border-radius:9px;border:1px solid var(--line);font:600 12.5px/34px var(--ui);color:var(--ink-2);white-space:nowrap' }, t))), r.importBtn);
    r.xw = h('span', {}, 'Crosswalk: none');
    r.xwPill = at(24, 56, 250, 'height:38px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:600 14px/35px var(--ui);padding:0 14px;color:var(--ink)', r.xw, h('span', { style: 'float:right;color:var(--mute)' }, '▾')); reg.append(r.xwPill);
    ['Family: all', 'Function: all', 'Tier: all'].forEach((t, i) => reg.append(at(290 + i * 170, 56, 156, 'height:38px;border:1px solid var(--line);border-radius:9px;background:#fff;font:500 13.5px/36px var(--ui);padding:0 12px;color:var(--ink-2)', t)));
    r.reChip = at(800, 56, 230, 'height:38px;border-radius:19px;background:#fdf3dc;color:#8a6002;font:700 13px/38px var(--ui);text-align:center', '⚑  Needs re-assessment (10)'); reg.append(r.reChip);
    r.count = at(1160, 66, 120, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '12 shown'); reg.append(r.count);
    r.menu = at(24, 98, 250, 'border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 18px 40px -18px #0f172a55;padding:6px;z-index:6');
    r.opts = ['none', 'SOC 2', 'ISO 27002', '800-53r5', 'CMMC L2', 'HIPAA', 'FedRAMP'].map((o, i) => { const e = h('div', { style: `height:34px;border-radius:7px;font:${i === 4 ? 700 : 500} 14px/34px var(--ui);padding-left:12px;color:${i === 4 ? '#0077ad' : 'var(--ink-2)'}` }, o); r.menu.append(e); return e; });
    reg.append(r.menu);
    r.banner = at(24, 106, 1256, 'height:34px;border-radius:9px;background:#e6f6fd;font:600 14px/34px var(--ui);color:#0077ad;padding-left:14px', 'US CMMC 2.0 Level 2: 10 of 12 controls mapped — register filtered to the mapped set.'); reg.append(r.banner);
    const cols = [[24, 'CODE'], [140, 'FAMILY'], [360, 'CONTROL'], [930, 'CMMC L2 REFS'], [1120, 'ENTITIES']];
    const th = at(0, 150, 1304, 'height:34px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 10, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))); reg.append(th); r.refHead = th.children[3];
    r.rows = CTRL.map(([code, fam, ctl, ref], i) => {
      const refEl = h('span', { class: 'tag info', style: 'font:600 12px var(--mono);letter-spacing:0;height:24px' }, ref || '—');
      const re = h('span', { class: 'tag med', style: 'margin-left:8px;height:18px;font-size:9px' }, 'RE-ASSESS');
      const row = at(0, 184 + i * 32, 1304, 'height:32px;border-bottom:1px solid var(--line)',
        at(24, 8, 110, 'font:600 12.5px var(--mono);color:var(--accent-text)', code), at(140, 8, 210, 'font:500 13px var(--ui);color:var(--ink-2)', fam),
        at(360, 7, 560, 'font:600 14px var(--ui)', ctl, re), at(930, 4, 170, '', refEl),
        at(1120, 9, 60, 'display:flex;gap:5px', h('i', { style: 'display:block;width:15px;height:15px;border-radius:4px;background:#17a34a' }), h('i', { style: 'display:block;width:15px;height:15px;border-radius:4px;background:#17a34a' })));
      reg.append(row); return { row, refEl, re, mapped: !!ref };
    });
    // import preview modal (as captured)
    const m = modalCard(242, 40, 820, 560); r.modal = m;
    m.append(at(28, 22, 500, '', h('span', { class: 'k' }, 'IMPORT BASELINE')), at(772, 18, 30, 'font:500 22px var(--ui);color:var(--mute)', '×'),
      at(28, 46, 764, 'font:800 20px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', 'control-baseline-big-venture-incorporated-dem-cmmc.xlsx'));
    const box = at(28, 90, 764, 'height:290px;border:1px solid var(--line);border-radius:12px;background:#fbfdff'); m.append(box);
    box.append(at(18, 16, 730, 'font:500 15px var(--ui)', h('b', {}, '12'), ' controls across ', h('b', {}, '7'), ' families · ', h('b', {}, '1'), ' privacy-relevant · privacy crosswalk sheet found'));
    r.top = at(18, 46, 730, 'font:500 13.5px var(--ui);color:var(--mute)', 'Top crosswalks: SOC 2 11 · ', h('b', { style: 'color:#0077ad' }, 'CMMC L2 10'), ' · ISO 27002 5 · EU GDPR 1'); box.append(r.top);
    box.append(at(18, 80, 728, 'height:40px;border-radius:9px;background:#e6f6fd;font:600 13.5px/40px var(--ui);color:#0077ad;padding-left:14px', '2 existing control ids match this catalog and will be left exactly as they are.'));
    box.append(at(18, 132, 728, 'border-radius:9px;background:#fdf3dc;font:600 13.5px/1.5 var(--ui);color:#8a6002;padding:12px 14px', '10 tailored controls — the workbook differs from this catalog (BCD-01, GOV-01, IAC-01, IAC-02, IAC-03, IRO-01, NET-01, NET-02 +2 more). Committing updates their definition and crosswalk refs from the workbook, adds an automatic change-summary comment to each record, and flags them for re-assessment.'));
    m.append(at(28, 400, 764, '', h('span', { class: 'k' }, 'MAP ENTITY COLUMNS TO BUSINESS ENTITIES')),
      at(28, 428, 764, 'display:flex;gap:18px;font:600 13.5px var(--mono)', ...['Corporate', 'Platform'].map((e) => h('span', { style: 'height:38px;padding:0 14px;border:1.5px solid #00aeef;border-radius:9px;line-height:35px' }, e, h('span', { style: 'margin-left:14px;font:700 11px var(--ui);color:#0077ad' }, 'TRACKED 12·12')))));
    r.commit = at(28, 490, 190, 'height:48px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/48px var(--ui);text-align:center', 'Update 10 tailored'); m.append(r.commit, at(232, 490, 100, 'height:48px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/45px var(--ui);text-align:center', 'Cancel'),
      at(350, 494, 440, 'font:500 13px/1.4 var(--ui);color:var(--mute)', 'Unchanged controls are never touched — dispositions and notes never come from uploads'));
    w.content.append(m);
    r.toast = at(0, 116, 1304, 'height:0;z-index:7'); // placeholder, toast lives in the register card
    r.done = at(24, 106, 1256, 'height:34px;border-radius:9px;background:#e5f6e5;font:600 13.5px/34px var(--ui);color:#0a7a0a;padding-left:14px;white-space:nowrap;overflow:hidden', 'Added 0 new controls · updated 10 tailored (change comments added, flagged for re-assessment) · 2 unchanged (left untouched)'); reg.append(r.done);
    return { ...w, r };
  }

  /* ------------------------------ CONTROL · IAC-02 · EVIDENCE ------------------------------ */
  function evidence(x, y) {
    const w = UI.appWindow({ x, y, route: 'controls', active: 'controls', crumb: 'Govern' }); const r = {};
    const top = card(0, 0, 1304, 200); w.content.append(top);
    top.append(at(28, 20, 400, '', h('span', { class: 'k' }, 'CONTROL')), at(28, 44, 1000, 'font:800 30px var(--ui);letter-spacing:-.02em', 'Multi-factor authentication for privileged access'),
      at(28, 90, 900, 'font:600 13.5px var(--ui);color:var(--ink-2)', h('span', { style: 'font:700 13px var(--mono);color:var(--accent-text);margin-right:10px' }, 'IAC-02'), 'Identity & Access · Protect · Operational'),
      at(28, 124, 1248, 'height:56px;border-radius:10px;background:#fdf3dc;font:600 13.5px/1.45 var(--ui);color:#8a6002;padding:9px 14px', 'Flagged for re-assessment — a tailored upload changed this control’s definition on 2026-09-26. Review the entity dispositions, then clear.'));
    const xw = card(0, 220, 520, 260); w.content.append(xw);
    xw.append(at(24, 18, 460, '', h('span', { class: 'k' }, 'FRAMEWORK CROSSWALKS'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'security & assurance')));
    r.xw = [['ISO 27002', '8.5'], ['SOC 2', 'CC6.6'], ['CMMC L2', 'IA.L2-3.5.3']].map(([f, v], i) => { const e = at(24, 56 + i * 62, 472, `height:52px;border:1.5px solid ${i === 2 ? '#00aeef' : 'var(--line)'};border-radius:12px;background:${i === 2 ? '#f0faff' : '#fff'}`, at(18, 15, 200, 'font:700 15px var(--ui)', f), at(250, 12, 200, 'text-align:right', h('span', { class: 'tag info', style: 'font:600 13px var(--mono);letter-spacing:0;height:26px' }, v))); xw.append(e); return e; });
    const en = card(0, 500, 520, 352); w.content.append(en);
    en.append(at(24, 18, 460, '', h('span', { class: 'k' }, 'ENTITY APPLICABILITY, OWNER & STATUS')));
    ['Corporate', 'Platform'].forEach((e, i) => en.append(at(24, 58 + i * 80, 472, 'height:66px;border:1px solid var(--line);border-radius:12px;background:#fff', at(18, 12, 200, 'font:700 15px var(--ui)', e), at(18, 38, 200, 'font:500 12.5px var(--ui);color:var(--mute)', 'Program Office'), at(260, 20, 196, 'text-align:right', h('span', { class: 'tag low', style: 'height:24px' }, 'LARGELY IMPLEMENTED')))));
    const ev = card(544, 220, 760, 632); w.content.append(ev); r.ev = ev;
    r.evN = h('span', {}, '0');
    ev.append(at(24, 18, 500, '', h('span', { class: 'k' }, 'EVIDENCE ('), h('span', { class: 'k' }, r.evN), h('span', { class: 'k' }, ')')));
    r.empty = at(24, 52, 712, 'font:500 14px/1.5 var(--ui);color:var(--mute)', 'No evidence linked yet — evidence lives in your storage repositories; this control keeps references only.'); ev.append(r.empty);
    r.item = at(24, 50, 712, 'height:74px;border:1.5px solid #bfe3f5;border-radius:12px;background:#f5fbfe',
      at(18, 14, 120, '', h('span', { class: 'tag info', style: 'height:22px;font-size:10px' }, 'SHAREPOINT')), at(140, 13, 540, 'font:700 15.5px var(--ui)', 'MFA enforcement report — privileged accounts (sample) ', h('span', { style: 'color:#0077ad' }, '↗')),
      at(140, 42, 540, 'font:500 13px var(--ui);color:var(--mute)', 'CMMC Evidence Library (sample) · reference only, never a copy'));
    ev.append(r.item);
    const fld = (xx, yy, ww, txt, css = '') => at(xx, yy, ww, `height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/42px var(--ui);padding-left:12px;color:var(--ink);white-space:nowrap;overflow:hidden;${css}`, txt);
    r.repo = fld(24, 150, 330, 'CMMC Evidence Library (sample) (SharePoint) ▾'); ev.append(r.repo);
    r.title = h('span', {}, ''); r.tcaret = caret(); r.titleF = fld(366, 150, 370, '', 'border-color:#00aeef'); r.titleF.append(r.title, r.tcaret); ev.append(r.titleF);
    r.url = h('span', {}, ''); r.urlF = fld(24, 206, 520, '', 'color:var(--mute);font-size:13px'); r.urlF.append(r.url); ev.append(r.urlF);
    r.add = at(556, 206, 180, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 14.5px/44px var(--ui);text-align:center', 'Add evidence'); ev.append(r.add);
    ev.append(at(24, 282, 712, '', h('span', { class: 'k' }, 'ASSOCIATED POA&MS & SECURITY EXCEPTIONS'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'references into the POA&M register')),
      at(24, 312, 712, 'height:64px;border:1px solid var(--line);border-radius:12px;background:#fff', at(18, 12, 520, 'font:700 14.5px var(--ui)', 'POAM.2026.001 · MFA not enforced for third-party contractor accounts'), at(18, 38, 400, 'font:500 12.5px var(--ui);color:var(--mute)', 'Identity Team · IN-REMEDIATION · found 2026-07-16'), at(560, 20, 140, 'text-align:right', h('span', { class: 'tag high', style: 'height:22px' }, 'HIGH'))),
      at(24, 404, 712, 'font:500 13px/1.5 var(--ui);color:var(--mute)', 'Documents stay in your SharePoint, Drive or Box. Client Vision keeps the reference, the owner and the date.'));
    return { ...w, r };
  }

  /* ------------------------------ GOVERNANCE DOCS · SYSTEM SECURITY PLAN ------------------------------ */
  function plan(x, y) {
    const w = UI.appWindow({ x, y, route: 'governance', active: 'governance', crumb: 'Governance Docs' }); const r = {};
    const top = card(0, 0, 1304, 236); w.content.append(top);
    top.append(at(28, 22, 600, 'font:600 13.5px var(--ui);color:var(--mute)', '← Governance Documentation Center'),
      at(28, 50, 1240, 'font:800 31px/1.15 var(--ui);letter-spacing:-.02em', 'System Security Plan — CUI Environment'));
    r.badge = h('span', { class: 'tag info', style: 'height:26px;font-size:11.5px' }, '● Draft'); r.ver = h('span', {}, 'v0.1');
    top.append(at(28, 98, 900, 'display:flex;gap:10px;align-items:center', r.badge, h('span', { style: 'height:26px;padding:0 10px;border:1px solid var(--line);border-radius:7px;font:600 12.5px/24px var(--mono)' }, 'SSP-01 · ', r.ver),
      h('span', { style: 'font:500 13.5px var(--ui);color:var(--ink-2);margin-left:6px' }, 'Plan · Confidential · owner Information Security Office (vCISO)')));
    r.steps = ['DRAFT', 'IN REVIEW', 'APPROVED', 'PUBLISHED'].map((t, i) => { const dot = h('span', { style: 'display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:#fff;vertical-align:-4px;margin-right:8px' });
      const line = i < 3 ? h('span', { style: 'display:inline-block;width:70px;height:2px;background:#e2e8f0;vertical-align:4px;margin:0 12px' }) : null;
      const lab = h('span', { style: 'font:700 12px var(--ui);letter-spacing:.08em;color:var(--mute)' }, t); return { dot, line, lab, el: h('span', {}, dot, lab, line) }; });
    top.append(at(28, 142, 900, 'white-space:nowrap', ...r.steps.map((s0) => s0.el)));
    top.append(btn(28, 180, 200, '◉  View document (PDF)', true), btn(240, 180, 140, '⤓  Word (.docx)'));
    r.act = h('span', {}, 'Submit for review'); r.actBtn = at(392, 180, 190, 'height:40px;border-radius:10px;border:1.5px solid var(--line);background:#fff;font:700 14px/37px var(--ui);text-align:center', r.act); top.append(r.actBtn);
    r.note = at(600, 188, 500, 'font:600 13.5px var(--ui);color:#0077ad', ''); top.append(r.note);
    const sec = card(0, 256, 1304, 330); w.content.append(sec);
    sec.append(at(24, 18, 700, '', h('span', { class: 'k' }, 'DOCUMENT SECTIONS'), h('span', { class: 'sub', style: 'margin-left:10px' }, '3 sections · lines starting with “- ” render as bullets')));
    const SECS = [['3.1', 'System boundary and CUI flow', 'CUI is processed only inside the enclave. External boundary under SC.L2-3.13.1; CUI in transit encrypted under SC.L2-3.13.8; privileged and contractor access requires MFA under IA.L2-3.5.3.'],
      ['3.2', 'Practice implementation — CMMC Level 2', '10 of 12 baseline controls cross-walked to CMMC Level 2 practices; status tracked per business entity; evidence referenced from the CMMC Evidence Library, never copied.'],
      ['3.3', 'Plan of Action & Milestones', 'Open deficiencies tracked with an owner and a deadline and validated by the assessor before closure. Conditional status requires open POA&M items to close within 180 days.']];
    r.secs = SECS.map(([n, t, d], i) => { const e = at(24, 56 + i * 88, 1256, 'height:80px;border-top:1px solid var(--line)', at(0, 14, 60, 'font:700 14px var(--mono);color:var(--accent-text)', n), at(64, 12, 900, 'font:700 16px var(--ui)', t), at(64, 40, 1160, 'font:500 13.5px/1.45 var(--ui);color:var(--ink-2)', d)); sec.append(e); return e; });
    const pv = card(0, 606, 1304, 246); w.content.append(pv); r.pv = pv;
    pv.append(at(24, 18, 600, '', h('span', { class: 'k' }, 'PUBLISHED VERSIONS — FROZEN FOREVER')));
    r.pvN = at(1100, 18, 180, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '0 published'); pv.append(r.pvN);
    r.pvEmpty = at(24, 56, 1100, 'font:500 14px/1.5 var(--ui);color:var(--mute)', 'None yet. Publishing freezes the rendered document as an immutable snapshot — the deliverable an assessor received stays reproducible.'); pv.append(r.pvEmpty);
    r.pvRow = at(24, 58, 1256, 'height:92px;border:1.5px solid #bfe3f5;border-radius:14px;background:#f5fbfe',
      at(20, 22, 48, 'height:48px;border-radius:12px;background:#0f172a;display:grid;place-items:center', s('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#8fd3f2', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2 }), s('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }))),
      at(86, 18, 700, 'font:800 20px var(--ui)', 'v1.0', h('span', { class: 'tag low', style: 'margin-left:10px;height:22px' }, 'CURRENT')),
      at(86, 50, 900, 'font:500 14px var(--ui);color:var(--ink-2)', 'SSP v1.0 for the CMMC Level 2 assessment. Approved by the vCISO and leadership.'),
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

  /* ------------------------------ POA&M REGISTER ------------------------------ */
  const POAMS = [['POAM.2026.001', 'Corporate', 'MFA not enforced for third-party contractor accounts', 'HIGH', 'high', 'P1', 'IN-REMEDIATION', 'Identity Team', '2026-07-16'],
    ['POAM.2026.005', 'Platform', 'Container images not scanned before deploy', 'HIGH', 'high', 'P1', 'ASSIGNED', 'DevSecOps', '2026-08-20'],
    ['POAM.2026.003', 'Platform', 'S3 buckets without default encryption in the staging account', 'HIGH', 'high', 'P1', 'IN-REMEDIATION', 'Cloud Platform', '2026-07-26'],
    ['POAM.2026.007', 'Platform', 'Admin API reachable without IP allowlisting', 'HIGH', 'high', 'P1', 'LARGELY REMEDIATED', 'Cloud Platform', '2026-06-21'],
    ['POAM.2026.002', 'Corporate', 'Endpoint backup agent missing on finance workstations', 'MODERATE', 'med', 'P2', 'ASSIGNED', 'IT Operations', '2026-08-10'],
    ['POAM.2026.010', 'Corporate', 'Incident-response contact tree outdated for two departments', 'MODERATE', 'med', 'P3', 'PARTIALLY REMEDIATED', 'Security Office', '2026-08-02'],
    ['POAM.2026.009', 'Platform', 'TLS certificate expiry monitoring gaps', 'MODERATE', 'med', 'P2', 'ASSIGNED', 'SRE', '2026-08-28']];
  function poam(x, y) {
    const w = UI.appWindow({ x, y, route: 'poam', active: 'poam', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · POA&M', 'Plan of Action & Milestones', 'The official record of pending remediation — de-duplicated to one master per deficiency, each with an owner, a date and its assessment history.'));
    r.k = [kpi(0, 138, 308, '9', 'OPEN POA&M ITEMS', '10 total incl. closed'), kpi(332, 138, 308, '4', 'CRITICAL / HIGH (OPEN)', '0 critical · 4 high'), kpi(664, 138, 308, '7', 'OWNERS', 'every item assigned or drafting'), kpi(996, 138, 308, '2', 'BUSINESS ENTITIES', 'with tracked findings')];
    r.k.forEach((k) => w.content.append(k.c));
    const reg = card(0, 272, 1304, 580); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'REGISTER')), at(1060, 12, 220, 'text-align:right', h('span', { class: 'pill' }, 'CSV'), ' ', h('span', { class: 'pill' }, 'Excel')));
    const cols = [[24, 'POA&M ID'], [180, 'DEFICIENCY'], [700, 'INHERENT'], [810, 'LIFECYCLE'], [1000, 'OWNER'], [1160, 'FOUND']];
    reg.append(at(0, 56, 1304, 'height:36px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 11, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    r.cols = reg.lastChild.children;
    r.rows = POAMS.map(([id, ent, def, sev, cls, pri, life, own, found], i) => {
      const lifeTag = h('span', { class: 'tag ' + (/REMEDIAT/.test(life) ? 'info' : 'gray') }, life);
      const ownEl = at(1000, 26, 150, 'font:600 13.5px var(--ui)', own), foundEl = at(1160, 26, 120, 'font:600 13px var(--mono)', found);
      const row = at(0, 92 + i * 68, 1304, 'height:68px;border-bottom:1px solid var(--line)',
        at(24, 24, 150, 'font:600 12.5px var(--mono);color:var(--accent-text)', id), at(180, 14, 500, 'font:600 15px var(--ui)', def), at(180, 38, 500, 'font:500 12px var(--ui);color:var(--mute)', ent + ' · ' + pri),
        at(700, 22, 100, '', h('span', { class: 'tag ' + cls }, sev)), at(810, 22, 180, '', lifeTag), ownEl, foundEl);
      reg.append(row); return { row, lifeTag, ownEl, foundEl };
    });
    return { ...w, r };
  }

  /* ------------------------------ POA&M RECORD · ADVANCE TO ASSESSOR VALIDATION ------------------------------ */
  const LIFE = ['Draft Finding', 'Assigned', 'In-Remediation', 'Partially Remediated', 'Largely Remediated', 'Assessor Validation', 'Plan to be Remediated', 'Closed - Remediated'];
  function validation(x, y) {
    const w = UI.appWindow({ x, y, route: 'poam', active: 'poam', crumb: 'Govern' }); const r = {};
    const top = card(0, 0, 1304, 170); w.content.append(top);
    top.append(at(28, 18, 500, '', h('span', { class: 'k' }, 'PLATFORM')), at(28, 40, 1100, 'font:800 30px var(--ui);letter-spacing:-.02em', 'Admin API reachable without IP allowlisting'));
    r.life = h('span', { class: 'tag info', style: 'height:26px;font-size:11.5px' }, 'LARGELY REMEDIATED');
    top.append(at(28, 94, 900, 'display:flex;gap:10px;align-items:center', h('span', { style: 'font:700 14px var(--mono);color:var(--accent-text)' }, 'POAM.2026.007'), r.life, h('span', { class: 'tag high', style: 'height:26px' }, 'HIGH'), h('span', { class: 'tag gray', style: 'height:26px' }, 'P1')));
    top.append(at(28, 132, 1000, 'font:500 13.5px var(--ui);color:var(--mute)', 'Owner Cloud Platform · Finding date 2026-06-21 · Business entity Platform'));
    const nd = card(0, 190, 620, 662); w.content.append(nd);
    nd.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'NOTED DEFICIENCIES')), at(24, 48, 572, 'font:500 14.5px/1.5 var(--ui);color:var(--ink-2)', 'Admin API reachable without IP allowlisting. Noted during the quarterly assessment.'));
    [['POA&M class', '—'], ['Owner', 'Cloud Platform'], ['Priority', 'P1'], ['Finding date', '2026-06-21'], ['C&A timeline', '—'], ['Business entity', 'Platform']].forEach(([k, v], i) => nd.append(at(24, 116 + i * 46, 572, 'height:40px;border-bottom:1px solid var(--line);font:500 14px/40px var(--ui);display:flex;justify-content:space-between', h('span', { style: 'color:var(--mute)' }, k), h('b', {}, v))));
    nd.append(at(24, 412, 400, '', h('span', { class: 'k' }, 'ADVANCE')));
    r.sel = at(24, 438, 360, 'height:46px;border:1.5px solid var(--line);border-radius:10px;background:#fff;font:700 15px/43px var(--ui);padding-left:14px', r.selT = h('span', {}, 'Set status…'), h('span', { style: 'float:right;margin-right:14px;color:var(--mute)' }, '▾')); nd.append(r.sel);
    r.menu = at(24, 488, 360, 'border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 18px 40px -18px #0f172a55;padding:6px;z-index:6');
    r.opts = LIFE.map((o, i) => { const e = h('div', { style: `height:32px;border-radius:7px;font:${i === 5 ? 700 : 500} 13.5px/32px var(--ui);padding-left:12px;color:${i === 5 ? '#0077ad' : 'var(--ink-2)'}` }, o); r.menu.append(e); return e; }); nd.append(r.menu);
    r.toast = at(400, 450, 200, 'font:700 14px var(--ui);color:#0a7a0a', 'Lifecycle updated.'); nd.append(r.toast);
    const cm = card(644, 190, 660, 662); w.content.append(cm);
    r.cmN = h('span', {}, '0'); cm.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'COMMENTS ('), h('span', { class: 'k' }, r.cmN), h('span', { class: 'k' }, ')')));
    r.cText = h('span', {}, ''); r.ccaret = caret();
    r.box = at(24, 52, 612, 'height:120px;border:1.5px solid #00aeef;border-radius:10px;background:#fff;font:500 15px/1.5 var(--ui);padding:12px 14px', r.cText, r.ccaret); cm.append(r.box);
    r.addC = at(24, 186, 160, 'height:42px;border-radius:10px;background:#0579aa;color:#fff;font:700 14px/42px var(--ui);text-align:center', 'Add comment'); cm.append(r.addC);
    r.posted = at(24, 250, 612, 'border:1px solid var(--line);border-radius:12px;background:#fbfdff;padding:14px 16px',
      h('div', { style: 'font:700 14px var(--ui)' }, 'Nate Butler ', h('span', { style: 'font:500 12.5px var(--ui);color:var(--mute);margin-left:6px' }, '2026-09-26 13:51')),
      r.postedT = h('div', { style: 'font:500 14.5px/1.5 var(--ui);color:var(--ink-2);margin-top:6px' }, 'IP allowlisting applied to the admin API (', r.ref = h('b', { style: 'color:#0077ad;border-radius:5px;padding:0 3px' }, 'SC.L2-3.13.1'), ' boundary protection). Ready for assessor validation ahead of the CMMC Level 2 assessment.'));
    cm.append(r.posted);
    return { ...w, r };
  }

  /* ------------------------------ GROC · 04 · COMPLIANCE ------------------------------ */
  function assessment(x, y) {
    const w = UI.appWindow({ x, y, route: 'groc/compliance', active: 'groc', crumb: 'Report' }); const r = {};
    w.content.append(head('GROC · 04 · C', 'Compliance', 'Where the management system stands against external expectations: framework crosswalk coverage over the control baseline, the evidence backing it, and the exceptions the organization is knowingly carrying.'));
    w.content.append(at(0, 118, 700, 'display:flex;gap:8px', ...['ISP', 'vCISO', 'RMP', 'CIRP', 'VCP'].map((t) => h('span', { class: 'tag info', style: 'height:24px;font-size:11px' }, t))));
    r.k = [kpi(0, 156, 308, '3', 'FRAMEWORKS CROSSWALKED', '3 security · 1 privacy'), kpi(332, 156, 308, '4', 'EVIDENCE COVERAGE', 'of 12 controls · 4 linked references'), kpi(664, 156, 308, '9', 'OPEN POA&M', 'every item owned and dated'), kpi(996, 156, 308, '2', 'STANDING EXCEPTIONS', '1 expiring inside 60 days')];
    r.k.forEach((k) => w.content.append(k.c));
    const cv = card(0, 290, 800, 562); w.content.append(cv); r.cv = cv;
    cv.append(at(24, 20, 500, '', h('span', { class: 'k' }, 'SECURITY & ASSURANCE COVERAGE'), h('span', { class: 'sub', style: 'margin-left:12px' }, '3 frameworks')));
    r.bars = [['SOC 2', 11, 92], ['CMMC L2', 10, 83], ['ISO 27002', 5, 42]].map(([n, c, p], i) => { const fill = h('i', { style: `display:block;height:100%;width:${p}%;border-radius:8px;background:${i === 1 ? 'linear-gradient(90deg,#ffb36b,#0039e6)' : 'linear-gradient(90deg,#0579aa,#00aeef)'};transform-origin:left` });
      const pct = h('span', {}, p + '%');
      const row = at(24, 66 + i * 110, 752, `height:96px;border:1.5px solid ${i === 1 ? '#00aeef' : 'var(--line)'};border-radius:14px;background:${i === 1 ? '#f5fbfe' : '#fff'}`,
        at(20, 16, 400, 'font:800 20px var(--ui)', n), at(520, 14, 212, 'text-align:right;font:800 26px var(--ui);font-variant-numeric:tabular-nums', pct),
        at(20, 52, 712, 'height:16px;border-radius:8px;background:#edf1f6;overflow:hidden', fill), at(20, 74, 400, 'font:500 12.5px var(--ui);color:var(--mute)', `${c} of 12 controls`));
      cv.append(row); return { row, fill, pct, p }; });
    cv.append(at(24, 412, 752, '', h('span', { class: 'k' }, 'PRIVACY COVERAGE')), at(24, 440, 752, 'height:56px;border:1px solid var(--line);border-radius:12px;background:#fff;font:600 15px/56px var(--ui);padding-left:18px;display:flex;justify-content:space-between', h('span', {}, 'EU GDPR'), h('span', { style: 'margin-right:18px;color:var(--mute)' }, '1 of 12 · 8%')));
    const ex = card(824, 290, 480, 562); w.content.append(ex);
    ex.append(at(24, 20, 420, '', h('span', { class: 'k' }, 'EVIDENCE DISCIPLINE')), at(24, 52, 432, 'font:600 17px/1.45 var(--ui)', '4 evidence references linked across 4 controls — references into the client’s own repositories, never copies.'),
      at(24, 170, 420, '', h('span', { class: 'k' }, 'EXCEPTION POSTURE')), at(24, 202, 432, 'font:500 15px/1.5 var(--ui);color:var(--ink-2)', 'The organization is knowingly carrying 2 standing security exceptions — accepted gaps with named owners. 1 expires inside 60 days.'),
      at(24, 330, 432, 'height:1px;background:var(--line)'), at(24, 354, 420, '', h('span', { class: 'k' }, 'GOVERNANCE DOCUMENTS')));
    [['SSP-01', 'System Security Plan — CUI Environment', 'v1.0'], ['ISP-IAC-01', 'Policy & Standards — Identity & Access', 'v1.0']].forEach(([c, t, v], i) => ex.append(at(24, 386 + i * 70, 432, 'height:60px;border:1px solid var(--line);border-radius:12px;background:#fff', at(16, 10, 300, 'font:700 12px var(--mono);color:var(--accent-text)', c), at(16, 30, 330, 'font:600 13.5px var(--ui)', t), at(350, 18, 70, 'text-align:right', h('span', { class: 'tag low', style: 'height:22px' }, v)))));
    return { ...w, r };
  }

  window.UI4 = { practice, evidence, plan, poam, validation, assessment, CTRL, LIFE };
})();
