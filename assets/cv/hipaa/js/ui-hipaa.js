// The HIPAA journey's screens, rebuilt as DOM from the capture pass in the Big Venture Incorporated demo
// workspace (Sep 26, 2026): the baseline import that cross-walks controls to HIPAA Security Rule citations,
// the risk analysis published and frozen as v1.0, the analysis's gaps raised on the POA&M register, evidence
// linked from the HIPAA compliance library, a SAMPLE ransomware incident declared and worked, GROC coverage,
// and the Audit Trail's integrity check. The scenario is Big Venture's self-funded Employee Health Plan.
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

  /* ------------------------------ CONTROL BASELINE · IMPORT → HIPAA SECURITY RULE CROSSWALK ------------------------------ */
  const CTRL = [['BCD-01', 'Continuity', 'Backup and restoration of critical data', '164.308(a)(7)(ii)(A)'], ['GOV-01', 'Governance', 'Information security program charter', '164.316(a)'], ['GOV-02', 'Governance', 'Roles, responsibilities and accountability', '164.308(a)(2)'],
    ['IAC-01', 'Identity & Access', 'Unique identification and authentication', '164.312(a)(2)(i)'], ['IAC-02', 'Identity & Access', 'Multi-factor authentication for privileged access', '164.312(d)'], ['IAC-03', 'Identity & Access', 'Access reviews and recertification', '164.308(a)(4)(ii)(C)'],
    ['IRO-01', 'Incident Response', 'Incident response plan and exercises', '164.308(a)(6)(ii)'], ['NET-01', 'Network Security', 'Boundary protection and segmentation', null], ['NET-02', 'Network Security', 'Encrypted transmission of sensitive data', '164.312(e)(2)(ii)'],
    ['PRI-01', 'Privacy', 'Lawful basis and consent management', '164.508'], ['VPM-01', 'Vulnerability Management', 'Vulnerability scanning and triage', '164.308(a)(1)(ii)(A)'], ['VPM-02', 'Vulnerability Management', 'Remediation within defined timelines', '164.308(a)(1)(ii)(B)']];
  function safeguards(x, y) {
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
    r.reChip = at(800, 56, 230, 'height:38px;border-radius:19px;background:#fdf3dc;color:#8a6002;font:700 13px/38px var(--ui);text-align:center', '⚑  Needs re-assessment (11)'); reg.append(r.reChip);
    r.count = at(1160, 66, 120, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '12 shown'); reg.append(r.count);
    r.menu = at(24, 98, 250, 'border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 18px 40px -18px #0f172a55;padding:6px;z-index:6');
    r.opts = ['none', 'SOC 2', 'ISO 27002', '800-53r5', 'CMMC L2', 'HIPAA', 'FedRAMP'].map((o, i) => { const e = h('div', { style: `height:34px;border-radius:7px;font:${i === 5 ? 700 : 500} 14px/34px var(--ui);padding-left:12px;color:${i === 5 ? '#0077ad' : 'var(--ink-2)'}` }, o); r.menu.append(e); return e; });
    reg.append(r.menu);
    r.banner = at(24, 106, 1256, 'height:34px;border-radius:9px;background:#e6f6fd;font:600 14px/34px var(--ui);color:#0077ad;padding-left:14px', 'US HIPAA Security Rule: 11 of 12 controls mapped — register filtered to the mapped set.'); reg.append(r.banner);
    const cols = [[24, 'CODE'], [140, 'FAMILY'], [360, 'CONTROL'], [900, 'HIPAA REFS (45 CFR)'], [1150, 'ENTITIES']];
    const th = at(0, 150, 1304, 'height:34px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 10, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))); reg.append(th); r.refHead = th.children[3];
    r.rows = CTRL.map(([code, fam, ctl, ref], i) => {
      const refEl = h('span', { class: 'tag info', style: 'font:600 12px var(--mono);letter-spacing:0;height:24px;text-transform:none' }, ref ? '§' + ref : '—');
      const re = h('span', { class: 'tag med', style: 'margin-left:8px;height:18px;font-size:9px' }, 'RE-ASSESS');
      const row = at(0, 184 + i * 32, 1304, 'height:32px;border-bottom:1px solid var(--line)',
        at(24, 8, 110, 'font:600 12.5px var(--mono);color:var(--accent-text)', code), at(140, 8, 210, 'font:500 13px var(--ui);color:var(--ink-2)', fam),
        at(360, 7, 530, 'font:600 14px var(--ui);white-space:nowrap', ctl, re), at(900, 4, 240, '', refEl),
        at(1150, 9, 60, 'display:flex;gap:5px', h('i', { style: 'display:block;width:15px;height:15px;border-radius:4px;background:#17a34a' }), h('i', { style: 'display:block;width:15px;height:15px;border-radius:4px;background:#17a34a' })));
      reg.append(row); return { row, refEl, re, mapped: !!ref, code };
    });
    const m = modalCard(242, 40, 820, 560); r.modal = m;
    m.append(at(28, 22, 500, '', h('span', { class: 'k' }, 'IMPORT BASELINE')), at(772, 18, 30, 'font:500 22px var(--ui);color:var(--mute)', '×'),
      at(28, 46, 764, 'font:800 20px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', 'control-baseline-big-venture-incorporated-dem-hipaa.xlsx'));
    const box = at(28, 90, 764, 'height:290px;border:1px solid var(--line);border-radius:12px;background:#fbfdff'); m.append(box);
    box.append(at(18, 16, 730, 'font:500 15px var(--ui)', h('b', {}, '12'), ' controls across ', h('b', {}, '7'), ' families · ', h('b', {}, '1'), ' privacy-relevant · privacy crosswalk sheet found'));
    r.top = at(18, 46, 730, 'font:500 13.5px var(--ui);color:var(--mute)', 'Top crosswalks: SOC 2 11 · ', h('b', { style: 'color:#0077ad' }, 'HIPAA 11'), ' · ISO 27002 5 · EU GDPR 1'); box.append(r.top);
    box.append(at(18, 80, 728, 'height:40px;border-radius:9px;background:#e6f6fd;font:600 13.5px/40px var(--ui);color:#0077ad;padding-left:14px', '1 existing control id matches this catalog and will be left exactly as it is.'));
    box.append(at(18, 132, 728, 'border-radius:9px;background:#fdf3dc;font:600 13.5px/1.5 var(--ui);color:#8a6002;padding:12px 14px', '11 tailored controls — the workbook differs from this catalog (BCD-01, GOV-01, GOV-02, IAC-01, IAC-02, IAC-03, IRO-01, NET-02 +3 more). Committing updates their definition and crosswalk refs from the workbook, adds an automatic change-summary comment to each record, and flags them for re-assessment.'));
    m.append(at(28, 400, 764, '', h('span', { class: 'k' }, 'MAP ENTITY COLUMNS TO BUSINESS ENTITIES')),
      at(28, 428, 764, 'display:flex;gap:18px;font:600 13.5px var(--mono)', ...['Corporate', 'Platform'].map((e) => h('span', { style: 'height:38px;padding:0 14px;border:1.5px solid #00aeef;border-radius:9px;line-height:35px' }, e, h('span', { style: 'margin-left:14px;font:700 11px var(--ui);color:#0077ad' }, 'TRACKED 12·12')))));
    r.commit = at(28, 490, 190, 'height:48px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/48px var(--ui);text-align:center', 'Update 11 tailored'); m.append(r.commit, at(232, 490, 100, 'height:48px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/45px var(--ui);text-align:center', 'Cancel'),
      at(350, 494, 440, 'font:500 13px/1.4 var(--ui);color:var(--mute)', 'Unchanged controls are never touched — dispositions and notes never come from uploads'));
    w.content.append(m);
    r.done = at(24, 106, 1256, 'height:34px;border-radius:9px;background:#e5f6e5;font:600 13.5px/34px var(--ui);color:#0a7a0a;padding-left:14px;white-space:nowrap;overflow:hidden', 'Added 0 new controls · updated 11 tailored (change comments added, flagged for re-assessment) · 1 unchanged (left untouched)'); reg.append(r.done);
    return { ...w, r };
  }

  /* ------------------------------ GOVERNANCE DOCS · HIPAA SECURITY RISK ANALYSIS ------------------------------ */
  function analysis(x, y) {
    const w = UI.appWindow({ x, y, route: 'governance', active: 'governance', crumb: 'Governance Docs' }); const r = {};
    const top = card(0, 0, 1304, 236); w.content.append(top);
    top.append(at(28, 22, 600, 'font:600 13.5px var(--ui);color:var(--mute)', '← Governance Documentation Center'),
      at(28, 50, 1240, 'font:800 31px/1.15 var(--ui);letter-spacing:-.02em', 'HIPAA Security Risk Analysis — 2026'));
    r.badge = h('span', { class: 'tag info', style: 'height:26px;font-size:11.5px' }, '● Draft'); r.ver = h('span', {}, 'v0.1');
    top.append(at(28, 98, 1150, 'display:flex;gap:10px;align-items:center', r.badge, h('span', { style: 'height:26px;padding:0 10px;border:1px solid var(--line);border-radius:7px;font:600 12.5px/24px var(--mono)' }, 'HSRA-2026 · ', r.ver),
      h('span', { style: 'font:500 13.5px var(--ui);color:var(--ink-2);margin-left:6px' }, 'Confidential · owner Information Security Office (vCISO) · approver Dana Whitfield, CEO (sample)')));
    r.steps = ['DRAFT', 'IN REVIEW', 'APPROVED', 'PUBLISHED'].map((t, i) => { const dot = h('span', { style: 'display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:#fff;vertical-align:-4px;margin-right:8px' });
      const line = i < 3 ? h('span', { style: 'display:inline-block;width:70px;height:2px;background:#e2e8f0;vertical-align:4px;margin:0 12px' }) : null;
      const lb = h('span', { style: 'font:700 12px var(--ui);letter-spacing:.08em;color:var(--mute)' }, t); return { dot, line, lab: lb, el: h('span', {}, dot, lb, line) }; });
    top.append(at(28, 142, 900, 'white-space:nowrap', ...r.steps.map((s0) => s0.el)));
    top.append(btn(28, 180, 200, '◉  View document (PDF)', true), btn(240, 180, 140, '⤓  Word (.docx)'));
    r.act = h('span', {}, 'Submit for review'); r.actBtn = at(392, 180, 190, 'height:40px;border-radius:10px;border:1.5px solid var(--line);background:#fff;font:700 14px/37px var(--ui);text-align:center', r.act); top.append(r.actBtn);
    r.note = at(600, 188, 500, 'font:600 13.5px var(--ui);color:#0077ad', ''); top.append(r.note);
    const sec = card(0, 256, 1304, 370); w.content.append(sec);
    sec.append(at(24, 18, 700, '', h('span', { class: 'k' }, 'DOCUMENT SECTIONS'), h('span', { class: 'sub', style: 'margin-left:10px' }, '4 sections · the Employee Health Plan’s ePHI, enterprise-wide')));
    const sev = (t, bg, fg) => h('span', { style: `display:inline-block;height:24px;padding:0 10px;border-radius:12px;background:${bg};color:${fg};font:700 11.5px/24px var(--ui);letter-spacing:.04em;margin-right:8px` }, t);
    const SECS = [['3.1', 'Scope — the Employee Health Plan', ['Self-funded group health plan: claims extracts from the TPA, enrollment files, HR shares, backups. Business associates: TPA, enrollment platform, PBM.']],
      ['3.2', 'Method', ['45 CFR 164.308(a)(1)(ii)(A), aligned with NIST SP 800-30: where ePHI lives, threats, vulnerabilities, likelihood × impact.']],
      ['3.3', 'Findings', [sev('HIGH · claims extracts unencrypted §164.312(a)(2)(iv)', '#fbe7e7', '#b22b2b'), sev('HIGH · no BAA on file §164.308(b)(1)', '#fbe7e7', '#b22b2b'), sev('MODERATE · contractor MFA', '#fdf3dc', '#8a6002'), sev('LOW · restore tests undocumented', '#e6f6fd', '#0077ad')]],
      ['3.4', 'Risk management plan', ['Every finding goes on the POA&M with an owner and a date (164.308(a)(1)(ii)(B)). Re-analysis annually. Retained six years (164.316(b)(2)). (Sample data.)']]];
    r.secs = SECS.map(([n, t, d], i) => { const e = at(24, 54 + i * 76, 1256, 'height:72px;border-top:1px solid var(--line)', at(0, 12, 60, 'font:700 14px var(--mono);color:var(--accent-text)', n), at(64, 10, 900, 'font:700 16px var(--ui)', t), at(64, 37, 1180, 'font:500 13.5px/1.45 var(--ui);color:var(--ink-2);white-space:nowrap;overflow:hidden', ...d)); sec.append(e); return e; });
    r.findings = r.secs[2].lastChild;
    const pv = card(0, 646, 1304, 206); w.content.append(pv); r.pv = pv;
    pv.append(at(24, 18, 600, '', h('span', { class: 'k' }, 'PUBLISHED VERSIONS — FROZEN FOREVER')));
    r.pvN = at(1100, 18, 180, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '0 published'); pv.append(r.pvN);
    r.pvEmpty = at(24, 56, 1100, 'font:500 14px/1.5 var(--ui);color:var(--mute)', 'None yet. Publishing freezes the rendered document as an immutable snapshot — dated, reproducible, and ready when OCR asks for it.'); pv.append(r.pvEmpty);
    r.pvRow = at(24, 58, 1256, 'height:92px;border:1.5px solid #bfe3f5;border-radius:14px;background:#f5fbfe',
      at(20, 22, 48, 'height:48px;border-radius:12px;background:#0f172a;display:grid;place-items:center', s('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#8fd3f2', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2 }), s('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }))),
      at(86, 18, 700, 'font:800 20px var(--ui)', 'v1.0', h('span', { class: 'tag low', style: 'margin-left:10px;height:22px' }, 'CURRENT')),
      at(86, 50, 900, 'font:500 14px var(--ui);color:var(--ink-2)', 'Annual HIPAA Security Rule risk analysis for the Employee Health Plan.'),
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

  /* ------------------------------ POA&M · THE ANALYSIS'S GAPS ------------------------------ */
  const POAMS = [['POAM.2026.001', 'Corporate', 'MFA not enforced for third-party contractor accounts', 'HIGH', 'high', 'P1', 'IN-REMEDIATION', 'Identity Team'],
    ['POAM.2026.005', 'Platform', 'Container images not scanned before deploy', 'HIGH', 'high', 'P1', 'ASSIGNED', 'DevSecOps'],
    ['POAM.2026.003', 'Platform', 'S3 buckets without default encryption in the staging account', 'HIGH', 'high', 'P1', 'IN-REMEDIATION', 'Cloud Platform'],
    ['POAM.2026.007', 'Platform', 'Admin API reachable without IP allowlisting', 'HIGH', 'high', 'P1', 'LARGELY REMEDIATED', 'Cloud Platform'],
    ['POAM.2026.002', 'Corporate', 'Endpoint backup agent missing on finance workstations', 'MODERATE', 'med', 'P2', 'ASSIGNED', 'IT Operations']];
  const NEW = [['POAM.2026.012', 'Corporate', 'No business associate agreement on file for the benefits-enrollment platform (§164.308(b)(1))', 'HIGH', 'high', 'P1', 'ASSIGNED', 'Benefits & Procurement', 'GOV-01'],
    ['POAM.2026.011', 'Corporate', 'Group health plan claims extracts stored unencrypted on an HR shared drive (§164.312(a)(2)(iv))', 'HIGH', 'high', 'P1', 'ASSIGNED', 'HR Systems', null]];
  const DEF = 'No business associate agreement on file for the benefits-enrollment platform (45 CFR 164.308(b)(1))';
  function management(x, y) {
    const w = UI.appWindow({ x, y, route: 'poam', active: 'poam', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · POA&M', 'Plan of Action & Milestones', 'The official record of pending remediation — one master per deficiency, each with an owner, a date and its assessment history.'));
    r.newBtn = at(1134, 20, 170, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/44px var(--ui);text-align:center', '＋  New finding'); w.content.append(r.newBtn);
    r.k = [kpi(0, 138, 308, '9', 'OPEN POA&M ITEMS', '10 total incl. closed'), kpi(332, 138, 308, '4', 'CRITICAL / HIGH (OPEN)', '0 critical · 4 high'), kpi(664, 138, 308, '0', 'P0 (OPEN)', 'immediate priority group'), kpi(996, 138, 308, '2', 'BUSINESS ENTITIES', 'with tracked findings')];
    r.k.forEach((k) => w.content.append(k.c));
    const reg = card(0, 272, 1304, 580); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'REGISTER')));
    const cols = [[24, 'POA&M ID'], [180, 'DEFICIENCY'], [760, 'INHERENT'], [860, 'LIFECYCLE'], [1040, 'OWNER']];
    reg.append(at(0, 56, 1304, 'height:36px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 11, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    const body = at(0, 92, 1304, 'height:488px;overflow:hidden'); reg.append(body);
    const mkRow = ([id, ent, def, sev, cls, pri, life, own, ctrl]) => at(0, 0, 1304, 'height:70px;border-bottom:1px solid var(--line)',
      at(24, 25, 150, 'font:600 12.5px var(--mono);color:var(--accent-text)', id), at(180, 14, 570, 'font:600 15px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', def),
      at(180, 40, 570, 'font:500 12px var(--ui);color:var(--mute)', ent + ' · ' + pri, ctrl ? h('span', { class: 'tag info', style: 'margin-left:10px;height:18px;font:700 10px var(--mono)' }, ctrl) : null, id >= 'POAM.2026.011' ? h('span', { class: 'tag gray', style: 'margin-left:8px;height:18px;font:700 10px var(--mono);text-transform:none' }, 'from HSRA-2026') : null),
      at(760, 23, 100, '', h('span', { class: 'tag ' + cls }, sev)), at(860, 23, 180, '', h('span', { class: 'tag ' + (/REMEDIAT/.test(life) ? 'info' : 'gray') }, life)), at(1040, 25, 250, 'font:600 13.5px var(--ui);white-space:nowrap', own));
    r.newRows = NEW.map((p, i) => { const row = mkRow(p); row.style.top = (i * 70) + 'px'; row.style.background = '#f5fbfe'; body.append(row); return row; });
    r.rows = POAMS.map((p, i) => { const row = mkRow(p); row.style.top = (i * 70) + 'px'; body.append(row); return row; });
    const m = modalCard(152, 10, 1000, 836); r.modal = m;
    m.append(at(28, 20, 400, '', h('span', { class: 'k' }, 'NEW RECORD')), at(28, 42, 700, 'font:800 24px var(--ui)', 'New POA&M finding'), at(952, 22, 30, 'font:500 22px var(--ui);color:var(--mute)', '✕'));
    m.append(at(28, 92, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'IDENTITY')));
    m.append(lab(28, 118, 'POA&M ID'), fld(28, 138, 200, 'Assigned on save', 'color:var(--mute)'), lab(244, 118, 'BUSINESS ENTITY'), fld(244, 138, 300, 'Corporate'), lab(560, 118, 'FINDING DATE'), fld(560, 138, 200, '2026-09-26', 'font-family:var(--mono)'));
    m.append(lab(28, 196, 'DEFICIENCY SUMMARY *'));
    r.def = h('span', {}, ''); r.dcaret = caret();
    r.defBox = at(28, 216, 944, 'height:70px;border:1.5px solid #00aeef;border-radius:9px;background:#fff;font:600 16px/1.4 var(--ui);padding:10px 14px', r.def, r.dcaret); m.append(r.defBox);
    m.append(at(28, 306, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'RISK & PRIORITY')));
    const seg = (x0, y0, opts) => at(x0, y0, 0, 'display:flex;border:1px solid var(--line);border-radius:9px;overflow:hidden;height:38px', ...opts.map((o, k) => h('span', { style: `padding:0 14px;font:600 13px/38px var(--ui);${k ? 'border-left:1px solid var(--line);' : ''}color:var(--ink-2)` }, o)));
    r.risk = seg(28, 352, ['Critical', 'High', 'Moderate', 'Low', 'Very Low']); r.pri = seg(470, 352, ['P0', 'P1', 'P2', 'P3', 'P4']);
    m.append(lab(28, 332, 'INHERENT RISK'), r.risk, lab(470, 332, 'PRIORITY GROUP'), r.pri, lab(740, 332, 'LIFECYCLE'), fld(740, 350, 232, 'Assigned  ▾'));
    m.append(at(28, 418, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'CLASSIFICATION')), lab(28, 444, 'CATEGORY'), fld(28, 464, 290, 'HIPAA Security Rule'), lab(334, 444, 'NIST CSF FUNCTION'), fld(334, 464, 190, 'GOVERN  ▾'),
      lab(540, 444, 'ASSOCIATED CONTROLS (SCF CODES)'), r.ctrlF = fld(540, 464, 432, ''));
    r.ctrlChip = h('span', { class: 'tag info', style: 'height:26px;font:700 12.5px var(--mono);margin-top:8px' }, 'GOV-01  ×'); r.ctrlF.append(r.ctrlChip);
    m.append(at(28, 530, 300, '', h('span', { class: 'k', style: 'color:#0077ad' }, 'REMEDIATION')), lab(28, 556, 'REMEDIATION OWNER'), r.ownF = fld(28, 576, 460, ''), lab(504, 556, 'C&A REMEDIATION TIMELINE'), r.tlF = fld(504, 576, 468, ''));
    r.own = h('span', {}, ''); r.ownF.append(r.own); r.tl = h('span', {}, ''); r.tlF.append(r.tl);
    m.append(lab(28, 640, 'IMMEDIATE REMEDIATION PLAN'), at(28, 660, 944, 'height:58px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/1.45 var(--ui);padding:8px 14px;color:var(--ink-2)', 'Obtain and execute a BAA; add BAA status to vendor onboarding.'));
    r.add = at(28, 752, 160, 'height:48px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/48px var(--ui);text-align:center', 'Add finding');
    m.append(r.add, at(202, 752, 100, 'height:48px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/45px var(--ui);text-align:center', 'Cancel'), at(320, 766, 500, 'font:500 13px var(--ui);color:var(--mute)', '⌘S to save · Esc to close'));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ CONTROL · BCD-01 · EVIDENCE ------------------------------ */
  const EVID = [['Backup restore test — Employee Health Plan data, Q3 (sample)', 'BCD-01'], ['MFA enforcement report — privileged and remote access (sample)', 'IAC-02'], ['TLS configuration scan — plan data transfers to the TPA (sample)', 'NET-02'], ['HIPAA Security Risk Analysis 2026 — HSRA-2026 v1.0 (sample)', 'GOV-01']];
  function evidence(x, y) {
    const w = UI.appWindow({ x, y, route: 'controls', active: 'controls', crumb: 'Govern' }); const r = {};
    const top = card(0, 0, 1304, 200); w.content.append(top);
    top.append(at(28, 20, 400, '', h('span', { class: 'k' }, 'CONTROL')), at(28, 44, 1000, 'font:800 30px var(--ui);letter-spacing:-.02em', 'Backup and restoration of critical data'),
      at(28, 90, 900, 'font:600 13.5px var(--ui);color:var(--ink-2)', h('span', { style: 'font:700 13px var(--mono);color:var(--accent-text);margin-right:10px' }, 'BCD-01'), 'Continuity · Recover · Operational'),
      at(28, 124, 1248, 'height:56px;border-radius:10px;background:#fdf3dc;font:600 13.5px/1.45 var(--ui);color:#8a6002;padding:9px 14px', 'Flagged for re-assessment — a tailored upload changed this control’s definition on 2026-09-26. Review the entity dispositions, then clear.'));
    const xw = card(0, 220, 520, 200); w.content.append(xw);
    xw.append(at(24, 18, 460, '', h('span', { class: 'k' }, 'FRAMEWORK CROSSWALKS'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'security & assurance')));
    r.xw = [['SOC 2', 'A1.2'], ['HIPAA', '§164.308(a)(7)(ii)(A)']].map(([f, v], i) => { const e = at(24, 56 + i * 64, 472, `height:52px;border:1.5px solid ${i === 1 ? '#00aeef' : 'var(--line)'};border-radius:12px;background:${i === 1 ? '#f0faff' : '#fff'}`, at(18, 15, 200, 'font:700 15px var(--ui)', f), at(200, 12, 250, 'text-align:right', h('span', { class: 'tag info', style: 'font:600 13px var(--mono);letter-spacing:0;height:26px;text-transform:none' }, v))); xw.append(e); return e; });
    const en = card(0, 440, 520, 412); w.content.append(en);
    en.append(at(24, 18, 460, '', h('span', { class: 'k' }, 'WHAT THE RULE ASKS')), at(24, 50, 472, 'font:600 17px/1.45 var(--ui)', '“Establish and implement procedures to create and maintain retrievable exact copies of electronic protected health information.”'),
      at(24, 160, 472, 'font:600 12.5px var(--mono);color:var(--accent-text)', '45 CFR 164.308(a)(7)(ii)(A) · data backup plan'),
      at(24, 210, 472, 'height:1px;background:var(--line)'), at(24, 232, 460, '', h('span', { class: 'k' }, 'ENTITY APPLICABILITY, OWNER & STATUS')));
    ['Corporate', 'Platform'].forEach((e, i) => en.append(at(24, 262 + i * 70, 472, 'height:58px;border:1px solid var(--line);border-radius:12px;background:#fff', at(18, 10, 200, 'font:700 15px var(--ui)', e), at(18, 34, 200, 'font:500 12.5px var(--ui);color:var(--mute)', 'Program Office'), at(260, 17, 196, 'text-align:right', h('span', { class: 'tag low', style: 'height:24px' }, 'FULLY IMPLEMENTED')))));
    const ev = card(544, 220, 760, 632); w.content.append(ev); r.ev = ev;
    r.evN = h('span', {}, '0');
    ev.append(at(24, 18, 500, '', h('span', { class: 'k' }, 'EVIDENCE ('), h('span', { class: 'k' }, r.evN), h('span', { class: 'k' }, ')')));
    r.empty = at(24, 52, 712, 'font:500 14px/1.5 var(--ui);color:var(--mute)', 'No evidence linked yet — evidence lives in your storage repositories; this control keeps references only.'); ev.append(r.empty);
    r.item = at(24, 50, 712, 'height:74px;border:1.5px solid #bfe3f5;border-radius:12px;background:#f5fbfe',
      at(18, 14, 120, '', h('span', { class: 'tag info', style: 'height:22px;font-size:10px' }, 'SHAREPOINT')), at(140, 13, 560, 'font:700 15.5px var(--ui);white-space:nowrap;overflow:hidden', EVID[0][0] + ' ', h('span', { style: 'color:#0077ad' }, '↗')),
      at(140, 42, 540, 'font:500 13px var(--ui);color:var(--mute)', 'HIPAA Compliance Library (sample) · reference only, never a copy'));
    ev.append(r.item);
    r.repo = fld(24, 150, 330, 'HIPAA Compliance Library (sample) (SharePoint) ▾'); ev.append(r.repo);
    r.title = h('span', {}, ''); r.tcaret = caret(); r.titleF = fld(366, 150, 370, '', 'border-color:#00aeef'); r.titleF.append(r.title, r.tcaret); ev.append(r.titleF);
    r.url = h('span', {}, ''); r.urlF = fld(24, 206, 520, '', 'color:var(--mute);font-size:13px'); r.urlF.append(r.url); ev.append(r.urlF);
    r.add = at(556, 206, 180, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 14.5px/44px var(--ui);text-align:center', 'Add evidence'); ev.append(r.add);
    ev.append(at(24, 282, 712, '', h('span', { class: 'k' }, 'ACROSS THE BASELINE'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'GROC · evidence coverage')));
    r.others = EVID.map(([t, c], i) => { const e = at(24, 314 + i * 70, 712, 'height:60px;border:1px solid var(--line);border-radius:12px;background:#fff', at(16, 19, 80, 'font:700 12.5px var(--mono);color:var(--accent-text)', c), at(100, 10, 600, 'font:600 14px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', t), at(100, 34, 500, 'font:500 12px var(--ui);color:var(--mute)', 'SharePoint · HIPAA Compliance Library (sample)')); ev.append(e); return e; });
    return { ...w, r };
  }

  /* ------------------------------ INCIDENT RESPONSE · SAMPLE RANSOMWARE → BREACH CLOCK ------------------------------ */
  const PHASES = ['Declared', 'Triage', 'Containment', 'Eradication', 'Recovery', 'Post-incident', 'Closed'];
  const TIMELINE = [['Incident declared (high)', null], ['Triage', 'breach risk assessment (§164.402): unsecured PHI — notification clock started'], ['Containment', 'HR file share isolated; credentials reset'], ['Eradication', 'server rebuilt from a clean image'], ['Recovery', 'restored from the Q3-tested backup; encryption at rest on'], ['Post-incident', 'notices tracked against the 60-day limit']];
  function breach(x, y) {
    const w = UI.appWindow({ x, y, route: 'incidents', active: 'incidents', crumb: 'Respond' }); const r = {};
    r.beaconIc = h('span', { style: 'color:#d03b3b;margin-right:8px' }, '⚠'); r.beaconTxt = h('span', {}, 'Declare incident');
    r.beacon = at(1000, -60, 300, 'height:38px;border-radius:19px;border:1.5px solid var(--line);background:#fff;font:700 13.5px/35px var(--ui);text-align:center;z-index:5', r.beaconIc, r.beaconTxt); w.content.append(r.beacon);
    w.content.append(head('CLIENT VISION · RESPOND', 'Incident Response', 'The incident register and response record. Declaring is one click from the header beacon; every action lands on an append-only timeline built for post-incident review.'));
    r.k = [kpi(0, 138, 308, '0', 'ACTIVE INCIDENTS', 'no incidents open'), kpi(332, 138, 308, '—', 'HIGHEST ACTIVE SEVERITY', 'nothing active'), kpi(664, 138, 308, '7', 'MEAN DAYS TO CLOSE', 'over 1 closed incident'), kpi(996, 138, 308, '1', 'INCIDENTS THIS YEAR', '1 all time')];
    r.k.forEach((k) => w.content.append(k.c));
    const reg = card(0, 270, 1304, 150); w.content.append(reg);
    reg.append(at(24, 16, 300, '', h('span', { class: 'k' }, 'INCIDENT REGISTER')));
    const regRow = (y0, ref, t, sev, sc, ph, pc, dec, age) => at(24, y0, 1256, 'height:44px;border-top:1px solid var(--line)', at(0, 13, 140, 'font:600 13px var(--mono);color:var(--accent-text)', ref), at(150, 12, 630, 'font:600 15px var(--ui);white-space:nowrap;overflow:hidden;text-overflow:ellipsis', t), at(790, 11, 110, '', h('span', { class: 'tag ' + sc }, sev)), at(910, 11, 130, '', h('span', { class: 'tag ' + pc }, ph)), at(1060, 13, 90, 'font:500 13.5px var(--ui)', dec), at(1160, 13, 96, 'font:500 13.5px var(--ui);color:var(--mute)', age));
    r.newRow = regRow(46, 'INC-2026-002', 'SAMPLE — Ransomware on the HR file server holding Employee Health Plan data', 'HIGH', 'high', 'DECLARED', 'info', 'Sep 26', '0d'); r.newPhase = r.newRow.children[3].firstChild;
    reg.append(r.newRow, regRow(94, 'INC-2026-901', 'Phishing campaign against finance staff', 'MEDIUM', 'med', 'CLOSED', 'low', 'Aug 16', '7d · closed'));
    r.oldRow = reg.lastChild;
    const d = card(0, 440, 1304, 412); w.content.append(d); r.detail = d;
    d.append(at(24, 18, 1100, 'font:700 13px var(--mono);letter-spacing:.06em;color:var(--accent-text)', 'INC-2026-002 ', h('span', { style: 'color:var(--ink-2)' }, 'SAMPLE — RANSOMWARE ON THE HR FILE SERVER HOLDING EMPLOYEE HEALTH PLAN DATA')),
      at(24, 46, 900, 'font:500 13px var(--ui);color:var(--mute)', h('span', { class: 'tag high', style: 'margin-right:10px' }, 'HIGH'), 'declared Sep 26, 4:44 PM · sample walkthrough, not a real incident'),
      at(24, 80, 1256, 'border-left:3px solid var(--line);padding-left:14px;font:500 14px/1.45 var(--ui);color:var(--ink-2)', 'Encryption note found on the HR file share at 07:40; the share holds monthly claims extracts (plan ePHI). Server isolated by IT Operations.'),
      at(24, 132, 300, '', h('span', { class: 'k' }, 'RESPONSE PHASE')));
    r.chips = PHASES.map((p) => h('span', { class: 'tag gray', style: 'height:28px;font-size:11.5px;margin-right:8px;letter-spacing:.04em' }, p));
    d.append(at(24, 156, 1256, 'display:flex', ...r.chips));
    d.append(at(24, 204, 400, '', h('span', { class: 'k' }, 'TIMELINE · APPEND-ONLY'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'a note is required for every action')));
    r.tl = TIMELINE.map(([t, note], i) => { const e = at(24, 232 + i * 30, 1256, 'height:28px;display:flex;align-items:center;gap:12px;font:700 14px var(--ui)',
      h('span', { style: `width:22px;height:22px;border-radius:7px;background:${i === 5 ? '#e5f6e5' : '#e6f6fd'};display:grid;place-items:center;font-size:11px;color:${i === 5 ? '#0a7a0a' : '#0077ad'}` }, i === 0 ? '⚠' : i === 5 ? '✓' : '↳'), t,
      note ? h('span', { style: 'font:500 13px var(--ui);color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:820px' }, '— ' + note) : null, h('span', { style: 'margin-left:auto;font:500 12.5px var(--ui);color:var(--mute)' }, 'Sep 26')); d.append(e); return e; });
    const m = card(342, 20, 620, 420); m.style.zIndex = 8; m.style.boxShadow = '0 40px 90px -30px #0f172a88'; r.modal = m;
    m.append(at(26, 22, 500, 'font:700 20px var(--ui)', h('span', { style: 'color:#d03b3b;margin-right:8px' }, '⚠'), 'Declare an incident'), at(26, 56, 568, 'font:500 13.5px/1.45 var(--ui);color:var(--mute)', 'This opens an incident record visible to your whole workspace, starts the response timeline, and alerts the response team. It can be closed but never deleted.'),
      at(26, 110, 300, '', h('span', { class: 'k' }, 'WHAT IS HAPPENING?')));
    r.what = h('span', {}, ''); r.caret = caret();
    m.append(at(26, 132, 568, 'height:42px;border:1.5px solid #00aeef;border-radius:9px;font:500 14.5px/40px var(--ui);padding-left:12px;white-space:nowrap;overflow:hidden', r.what, r.caret),
      at(26, 190, 300, '', h('span', { class: 'k' }, 'WHAT DO WE KNOW SO FAR?')),
      at(26, 212, 568, 'height:74px;border:1.5px solid var(--line);border-radius:9px;font:500 14px/1.4 var(--ui);padding:10px 12px;color:var(--ink-2)', 'Encryption note on the HR file share at 07:40. Share holds monthly claims extracts (plan ePHI). Server isolated.'),
      at(26, 302, 200, '', h('span', { class: 'k' }, 'SEVERITY')),
      at(26, 324, 568, 'display:flex;gap:10px', ...['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sv) => h('span', { style: `height:34px;padding:0 16px;border-radius:17px;font:700 12px/34px var(--ui);letter-spacing:.06em;${sv === 'HIGH' ? 'background:#fdece4;color:#b3541f;border:1.5px solid #ec835a' : 'border:1.5px solid var(--line);color:var(--ink-2)'}` }, sv))));
    r.declare = at(404, 364, 190, 'height:42px;border-radius:10px;background:#d03b3b;color:#fff;font:700 15px/42px var(--ui);text-align:center', 'Declare incident'); m.append(r.declare);
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ GROC · 04 · COMPLIANCE ------------------------------ */
  function report(x, y) {
    const w = UI.appWindow({ x, y, route: 'groc/compliance', active: 'groc', crumb: 'Report' }); const r = {};
    w.content.append(head('GROC · 04 · C', 'Compliance', 'Where the management system stands against external expectations: framework crosswalk coverage over the control baseline, the evidence backing it, and the exceptions the organization is knowingly carrying.'));
    w.content.append(at(0, 118, 700, 'display:flex;gap:8px', ...['ISP', 'vCISO', 'RMP', 'CIRP', 'VCP'].map((t) => h('span', { class: 'tag info', style: 'height:24px;font-size:11px' }, t))));
    r.k = [kpi(0, 156, 308, '3', 'FRAMEWORKS CROSSWALKED', '3 security · 1 privacy'), kpi(332, 156, 308, '4', 'EVIDENCE COVERAGE', 'of 12 controls · 4 linked references'), kpi(664, 156, 308, '11', 'OPEN POA&M', 'every item owned and dated'), kpi(996, 156, 308, '2', 'STANDING EXCEPTIONS', '1 expiring inside 60 days')];
    r.k.forEach((k) => w.content.append(k.c));
    const cv = card(0, 290, 800, 562); w.content.append(cv); r.cv = cv;
    cv.append(at(24, 20, 500, '', h('span', { class: 'k' }, 'SECURITY & ASSURANCE COVERAGE'), h('span', { class: 'sub', style: 'margin-left:12px' }, '3 frameworks')));
    r.bars = [['SOC 2', 11, 92], ['HIPAA', 11, 92], ['ISO 27002', 5, 42]].map(([n, c, p], i) => { const fill = h('i', { style: `display:block;height:100%;width:${p}%;border-radius:8px;background:${i === 1 ? 'linear-gradient(90deg,#ffb36b,#0039e6)' : 'linear-gradient(90deg,#0579aa,#00aeef)'};transform-origin:left` });
      const pct = h('span', {}, p + '%');
      const row = at(24, 66 + i * 110, 752, `height:96px;border:1.5px solid ${i === 1 ? '#00aeef' : 'var(--line)'};border-radius:14px;background:${i === 1 ? '#f5fbfe' : '#fff'}`,
        at(20, 16, 400, 'font:800 20px var(--ui)', n), at(520, 14, 212, 'text-align:right;font:800 26px var(--ui);font-variant-numeric:tabular-nums', pct),
        at(20, 52, 712, 'height:16px;border-radius:8px;background:#edf1f6;overflow:hidden', fill), at(20, 74, 400, 'font:500 12.5px var(--ui);color:var(--mute)', `${c} of 12 controls mapped`));
      cv.append(row); return { row, fill, pct, p }; });
    cv.append(at(24, 412, 752, '', h('span', { class: 'k' }, 'PRIVACY COVERAGE')), at(24, 440, 752, 'height:56px;border:1px solid var(--line);border-radius:12px;background:#fff;font:600 15px/56px var(--ui);padding-left:18px;display:flex;justify-content:space-between', h('span', {}, 'EU GDPR'), h('span', { style: 'margin-right:18px;color:var(--mute)' }, '1 of 12 · 8%')));
    const ex = card(824, 290, 480, 562); w.content.append(ex);
    ex.append(at(24, 20, 420, '', h('span', { class: 'k' }, 'EVIDENCE DISCIPLINE')), at(24, 52, 432, 'font:600 17px/1.45 var(--ui)', '4 evidence references linked across 4 controls — references into the client’s own repositories, never copies.'),
      at(24, 170, 420, '', h('span', { class: 'k' }, 'THE REPORT AT A GLANCE')), at(24, 202, 432, 'font:500 15px/1.6 var(--ui);color:var(--ink-2)', '12 controls governed · 70% implemented', h('br'), '11 open POA&M findings of 12', h('br'), '0 open incidents of 2 declared'),
      at(24, 330, 432, 'height:1px;background:var(--line)'), at(24, 354, 420, '', h('span', { class: 'k' }, 'GOVERNANCE DOCUMENTS')));
    [['HSRA-2026', 'HIPAA Security Risk Analysis — 2026', 'v1.0']].forEach(([c, t, v], i) => ex.append(at(24, 386 + i * 70, 432, 'height:60px;border:1px solid var(--line);border-radius:12px;background:#fff', at(16, 10, 300, 'font:700 12px var(--mono);color:var(--accent-text)', c), at(16, 30, 330, 'font:600 13.5px var(--ui)', t), at(350, 18, 70, 'text-align:right', h('span', { class: 'tag low', style: 'height:22px' }, v)))));
    return { ...w, r };
  }

  /* ------------------------------ AUDIT TRAIL · VERIFY INTEGRITY ------------------------------ */
  const EV = [['16:46:39', 'cir.closed', 'INC-2026-002'], ['16:46:12', 'cir.phase', 'INC-2026-002 · triage'], ['16:44:07', 'cir.declared', 'INC-2026-002'], ['16:43:42', 'control.evidence_added', 'BCD-01'],
    ['16:40:34', 'poam.created', 'POAM.2026.012'], ['16:40:29', 'poam.created', 'POAM.2026.011'], ['16:39:58', 'governance.document_published', 'HSRA-2026 · v1.0'], ['16:38:46', 'storage_repo.added', 'HIPAA Compliance Library'], ['16:37:57', 'control.baseline_imported', 'controls · HIPAA refs']];
  function proof(x, y) {
    const w = UI.appWindow({ x, y, route: 'audit', active: 'audit', crumb: 'Trust' }); const r = {};
    w.content.append(head('CLIENT VISION · AUDIT TRAIL', 'Audit Trail', 'Every action in Big Venture Incorporated — who did what, when, and to which record. The log is append-only and hash-chained at the database: events can never be edited or deleted, and Verify integrity proves it.', 1150));
    const c = card(0, 150, 1304, 702); w.content.append(c); r.c = c;
    c.append(at(24, 22, 200, '', h('span', { class: 'k' }, 'EVENTS')));
    r.verify = at(1000, 12, 150, 'height:40px;border-radius:10px;background:#0579aa;color:#fff;font:700 14px/40px var(--ui);text-align:center', 'Verify integrity');
    c.append(r.verify, at(1162, 12, 118, 'height:40px;border-radius:10px;border:1.5px solid var(--line);font:600 14px/37px var(--ui);text-align:center', 'Export CSV'));
    r.ok = at(130, 12, 620, 'height:40px;border-radius:20px;background:#e5f6e5;color:#0a7a0a;font:700 15px/40px var(--ui);padding:0 18px;display:inline-block;white-space:nowrap', '✓  Chain intact — ', r.okN = h('span', {}, '97'), ' events verified'); c.append(r.ok);
    c.append(at(0, 68, 1304, 'height:36px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...[[70, 'TIME'], [260, 'ACTOR'], [480, 'ACTION'], [860, 'TARGET']].map(([cx, t]) => at(cx, 11, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    r.rows = EV.map(([tm, act, tgt], i) => {
      const link = at(24, 22, 26, 'height:26px;border-radius:50%;border:2.5px solid #cbd5e1;background:#fff');
      const hash = at(1180, 23, 100, 'text-align:right;font:600 11.5px var(--mono);color:var(--mute)', (0x7c21 + i * 0x3d9b).toString(16).slice(-4) + '…');
      const row = at(0, 104 + i * 64, 1304, 'height:64px;border-bottom:1px solid var(--line)', link, at(70, 22, 180, 'font:600 13px var(--mono);color:var(--ink-2)', '2026-09-26 ' + tm),
        at(260, 22, 210, 'font:600 13.5px var(--ui)', 'vCISO · 3HUE'), at(480, 20, 370, '', h('span', { style: 'font:600 13px var(--mono);color:var(--accent-text);background:#eef7fc;padding:3px 8px;border-radius:6px' }, act)),
        at(860, 22, 320, 'font:500 13.5px var(--ui);color:var(--ink-2);white-space:nowrap', tgt), hash);
      c.append(row); return { row, link, hash };
    });
    r.chain = at(36, 104, 3, `height:${64 * (EV.length - 1) + 12}px;background:#e2e8f0;transform-origin:top;margin-top:26px`); c.insertBefore(r.chain, r.rows[0].row);
    return { ...w, r };
  }

  window.UI6 = { safeguards, analysis, management, evidence, breach, report, proof, CTRL, DEF, EVID };
})();
