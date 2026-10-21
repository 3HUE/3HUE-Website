// The SOC 2 journey's screens, rebuilt as DOM from the capture pass in the Big Venture Incorporated
// demo workspace (Sep 24, 2026): Control Baseline with the SOC 2 crosswalk, the exception decision,
// a declared incident and its append-only timeline, the hash-chained Audit Trail, TrustSignals.
(function () {
  const { h, s } = L;
  const card = (x, y, w, hh, ...kids) => h('div', { class: 'card', style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px` }, ...kids);
  const at = (x, y, w, css = '', ...kids) => h('div', { class: 'abs', style: `left:${x}px;top:${y}px;${w ? `width:${w}px;` : ''}${css}` }, ...kids);
  const head = (eyebrow, title, lede, w = 960) => at(0, 0, w, '', h('div', { class: 'eyebrow' }, eyebrow), h('div', { class: 'h1' }, title), lede ? h('div', { class: 'lede' }, lede) : null);
  const kpi = (x, y, w, n, k, sub) => { const nEl = h('div', { class: 'big' }, n), sEl = h('div', { class: 'sub' }, sub); const c = card(x, y, w, 112, at(22, 16, w - 40, '', nEl), at(22, 62, w - 40, '', h('div', { class: 'k' }, k)), at(22, 82, w - 40, '', sEl)); return { c, nEl, sEl }; };
  // header beacon: "Declare incident" that turns into the live incident pill
  const beacon = (win) => { const b = h('span', { class: 'pill', style: 'gap:8px' }, h('span', { style: 'font-size:13px' }, '⚠'), h('span', {}, 'Declare incident')); const tb = win.el.querySelector('.topbar'); tb.insertBefore(b, tb.children[1].nextSibling); return b; };

  /* ------------------------------ CONTROL BASELINE ------------------------------ */
  const CONTROLS = [['BCD-01', 'Continuity', 'Backup and restoration of critical data', 'A1.2'], ['GOV-01', 'Governance', 'Information security program charter', 'CC1.1'], ['GOV-02', 'Governance', 'Roles, responsibilities and accountability', 'CC1.4'],
    ['IAC-01', 'Identity & Access', 'Unique identification and authentication', 'CC6.1'], ['IAC-02', 'Identity & Access', 'Multi-factor authentication for privileged access', 'CC6.6'], ['IAC-03', 'Identity & Access', 'Access reviews and recertification', 'CC6.2'],
    ['IRO-01', 'Incident Response', 'Incident response plan and exercises', 'CC7.4'], ['NET-01', 'Network Security', 'Boundary protection and segmentation', 'CC6.6'], ['NET-02', 'Network Security', 'Encrypted transmission of sensitive data', 'CC6.7'],
    ['PRI-01', 'Privacy', 'Lawful basis and consent management', null], ['VPM-01', 'Vulnerability Management', 'Vulnerability scanning and triage', 'CC7.1'], ['VPM-02', 'Vulnerability Management', 'Remediation within defined timelines', 'CC7.4']];
  function controls(x, y) {
    const w = UI.appWindow({ x, y, route: 'controls', active: 'controls', crumb: 'Govern' }); const r = {};
    beacon(w);
    w.content.append(head('CLIENT VISION · CONTROL BASELINE', 'Control Baseline', 'The governed control catalog — cross-walked security and privacy frameworks, with applicability, ownership and implementation state tracked per business entity.'));
    [['12', 'CONTROLS', '0 active · 0 draft'], ['2', 'ENTITIES TRACKED', 'owner & status per entity'], ['70%', 'IMPLEMENTED', 'across applicable assignments'], ['0', 'REVIEWS OVERDUE', 'next review dates on track']].forEach(([n, k, sub], i) => w.content.append(kpi(i * 332, 138, 308, n, k, sub).c));
    const reg = card(0, 272, 1304, 580); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 18, 300, '', h('span', { class: 'k' }, 'REGISTER')));
    const xw = h('span', {}, 'Crosswalk: none');
    r.xwPill = at(24, 50, 250, 'height:38px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:600 14px/35px var(--ui);padding:0 14px;color:var(--ink)', xw, h('span', { style: 'float:right;color:var(--mute)' }, '▾'));
    r.xw = xw; reg.append(r.xwPill);
    ['Family: all', 'Function: all', 'Tier: all', 'Entities: strip'].forEach((t, i) => reg.append(at(290 + i * 170, 50, 156, 'height:38px;border:1px solid var(--line);border-radius:9px;background:#fff;font:500 13.5px/36px var(--ui);padding:0 12px;color:var(--ink-2)', t)));
    r.count = at(1160, 60, 120, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '12 shown'); reg.append(r.count);
    // dropdown menu for the crosswalk
    r.menu = at(24, 92, 250, 'border:1px solid var(--line);border-radius:10px;background:#fff;box-shadow:0 18px 40px -18px #0f172a55;padding:6px;z-index:6');
    r.opts = ['none', 'SOC 2', 'TSC POF', 'ISO 27001', 'CMMC L2', 'HIPAA', 'PCI SAQ D'].map((o, i) => { const e = h('div', { style: `height:34px;border-radius:7px;font:${i === 1 ? 700 : 500} 14px/34px var(--ui);padding-left:12px;color:${i === 1 ? '#0077ad' : 'var(--ink-2)'}` }, o); r.menu.append(e); return e; });
    reg.append(r.menu);
    r.banner = at(24, 100, 1256, 'height:34px;border-radius:9px;background:#e6f6fd;font:600 14px/34px var(--ui);color:#0077ad;padding-left:14px', 'SOC 2 — TSC 2017: 11 of 12 controls mapped — register filtered to the mapped set.'); reg.append(r.banner);
    const cols = [[24, 'CODE'], [140, 'FAMILY'], [360, 'CONTROL'], [900, 'SOC 2 REFS'], [1080, 'ENTITIES']];
    const th = at(0, 146, 1304, 'height:34px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 10, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))); reg.append(th);
    r.refHead = th.children[3];
    r.rows = CONTROLS.map(([code, fam, ctl, ref], i) => {
      const refEl = h('span', { class: 'tag info', style: 'font:600 12px var(--mono);letter-spacing:.02em;height:24px' }, ref || '—');
      const row = at(0, 180 + i * 33, 1304, 'height:33px;border-bottom:1px solid var(--line)',
        at(24, 8, 110, 'font:600 12.5px var(--mono);color:var(--accent-text)', code), at(140, 8, 210, 'font:500 13px var(--ui);color:var(--ink-2)', fam),
        at(360, 7, 520, 'font:600 14px var(--ui)', ctl, h('span', { class: 'tag gray', style: 'margin-left:8px;height:18px;font-size:9px' }, fam === 'Privacy' ? 'PRIVACY' : 'OPERATIONAL')),
        at(900, 4, 150, '', refEl), at(1080, 9, 60, 'display:flex;gap:5px', h('i', { style: 'display:block;width:15px;height:15px;border-radius:4px;background:#17a34a' }), h('i', { style: 'display:block;width:15px;height:15px;border-radius:4px;background:#17a34a' })));
      reg.append(row); return { row, refEl, mapped: !!ref };
    });
    return { ...w, r };
  }

  /* ------------------------------ REGISTERS · EXCEPTIONS ------------------------------ */
  function exceptions(x, y) {
    const w = UI.appWindow({ x, y, route: 'registers', active: 'registers', crumb: 'Govern' }); const r = {};
    beacon(w);
    w.content.append(head('CLIENT VISION · GRC REGISTERS', 'GRC registers', 'Mirrored from CloudSignals RiskOps — the system of record. Governance decisions made here are written back to RiskOps first.'));
    const tabs = ['Overview', 'Risk register 5', 'Dossiers 5', 'Treatments & exceptions 4', 'Third parties & projects 6', 'Processes & privacy 1'];
    let tx = 0; tabs.forEach((t, i) => { const on = i === 3; w.content.append(at(tx, 130, 0, `white-space:nowrap;font:${on ? 700 : 500} 14.5px var(--ui);color:${on ? 'var(--accent-text)' : 'var(--ink-2)'};padding-bottom:10px;${on ? 'border-bottom:3px solid var(--brand)' : ''}`, t)); tx += t.length * 8.2 + 34; });
    const tr = card(0, 176, 1304, 196); w.content.append(tr);
    tr.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'RISK TREATMENTS'), h('span', { class: 'sub', style: 'margin-left:12px' }, '2 records')));
    [['Block public access org-wide and remediate ACL grants', 'PROPOSED', 'gray'], ['Enforce modern authentication and retire legacy protocols', 'DECIDED', 'low']].forEach(([t, st, cls], i) =>
      tr.append(at(24, 60 + i * 62, 1256, 'height:56px;border-top:1px solid var(--line)', at(0, 18, 800, 'font:600 15px var(--ui)', t), at(1000, 16, 140, '', h('span', { class: 'tag ' + cls }, st)))));
    const ex = card(0, 392, 1304, 460); w.content.append(ex); r.ex = ex;
    ex.append(at(24, 18, 400, '', h('span', { class: 'k' }, 'SECURITY EXCEPTIONS'), h('span', { class: 'sub', style: 'margin-left:12px' }, '2 records')));
    const EX = [['Temporary public bucket for a partner integration test', 'Anonymous read on one synthetic-data bucket while partner OAuth onboarding completes.', 'MEDIUM', 'med'], ['Legacy TLS permitted for one on-prem integration', 'TLS 1.1 allowed on a single internal endpoint pending vendor upgrade.', 'LOW', 'low']];
    r.exRows = EX.map(([t, d, lv, cls], i) => { const st = h('span', { class: 'tag low' }, 'ACTIVE'); const btn = at(1110, 26, 150, 'height:38px;border-radius:9px;border:1.5px solid #bfe3f5;background:#fff;color:#0077ad;font:600 14px/35px var(--ui);text-align:center', 'Change decision');
      const row = at(24, 60 + i * 96, 1256, 'height:90px;border-top:1px solid var(--line)', at(0, 16, 800, 'font:700 16px var(--ui)', t), at(0, 44, 820, 'font:500 13.5px var(--ui);color:var(--mute)', d), at(850, 30, 100, '', h('span', { class: 'tag ' + cls }, lv)), at(960, 30, 120, '', st), btn); ex.append(row); return { row, st, btn }; });
    // decision modal (as captured)
    const m = card(262, 150, 780, 640); m.style.zIndex = 8; m.style.boxShadow = '0 40px 90px -30px #0f172a88'; r.modal = m;
    m.append(at(30, 24, 600, 'font:700 22px var(--ui)', 'Change exception decision'), at(730, 22, 30, 'font:500 22px var(--ui);color:var(--mute)', '×'),
      at(30, 66, 700, 'font:700 17px var(--ui)', 'Temporary public bucket for a partner integration test'), at(30, 94, 700, 'font:500 13.5px var(--ui);color:var(--mute)', 'Currently ACTIVE in the CloudSignals register.'),
      at(30, 126, 720, 'height:40px;border-left:3px solid var(--line);padding-left:14px;font:500 14px/40px var(--ui);color:var(--ink-2)', 'Anonymous read on one synthetic-data bucket while partner OAuth onboarding completes.'),
      at(30, 184, 720, 'height:96px;border:1px solid var(--line);border-radius:12px;background:#fbfdff',
        at(20, 16, 300, '', h('div', { class: 'k' }, 'EXPIRES'), h('div', { style: 'font:600 16px var(--ui);margin-top:6px' }, 'Oct 19, 2026')),
        at(360, 16, 340, '', h('div', { class: 'k' }, 'COMPENSATING CONTROLS'), h('div', { style: 'font:600 15px/1.35 var(--ui);margin-top:6px' }, 'Synthetic data only; access logging; weekly review.'))),
      at(30, 300, 300, '', h('span', { class: 'k' }, 'NEW DECISION')), at(30, 324, 720, 'height:42px;border:1.5px solid var(--line);border-radius:9px;font:700 15px/40px var(--ui);padding-left:14px', 'APPROVED', h('span', { style: 'float:right;margin-right:14px;color:var(--mute)' }, '▾')),
      at(30, 382, 300, '', h('span', { class: 'k' }, 'EXPIRY')), at(30, 406, 320, 'height:42px;border:1.5px solid var(--line);border-radius:9px;font:600 15px/40px var(--mono);padding-left:14px', '10/19/2026'),
      at(30, 464, 300, '', h('span', { class: 'k' }, 'DECISION COMMENT')));
    r.comment = h('span', {}, ''); r.caret = h('span', { style: 'display:inline-block;width:2px;height:18px;background:#0f172a;vertical-align:-3px;margin-left:1px' });
    m.append(at(30, 488, 720, 'height:66px;border:1.5px solid #00aeef;border-radius:9px;font:500 15px/1.4 var(--ui);padding:10px 14px', r.comment, r.caret));
    r.write = at(510, 574, 240, 'height:44px;border-radius:10px;background:linear-gradient(90deg,#00aeef,#0579aa);color:#fff;font:700 15px/44px var(--ui);text-align:center', 'Write decision to CloudSignals'); m.append(r.write);
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ INCIDENT RESPONSE ------------------------------ */
  const PHASES = ['Declared', 'Triage', 'Containment', 'Eradication', 'Recovery', 'Post-incident', 'Closed'];
  const TIMELINE = [['Incident declared (high)', null, '8:47 PM'], ['Phase: declared → triage', 'Confirmed misuse from an unrecognized IP. Session tokens revoked; incident commander engaged.', '8:48 PM'],
    ['Phase: triage → containment', 'Admin role locked, access keys rotated, MFA re-enrolled for all privileged users.', '8:49 PM'], ['Phase: containment → recovery', 'Access restored with least privilege. CloudTrail review for the window is clean.', '8:49 PM'],
    ['Phase: recovery → post-incident', 'Lessons learned: retire long-lived keys. Rotation every 90 days added to the POA&M.', '8:49 PM'], ['Incident closed', 'Root cause: long-lived access key. Controls CC7.3 to CC7.5 evidenced on this timeline.', '8:49 PM']];
  function incidents(x, y) {
    const w = UI.appWindow({ x, y, route: 'incidents', active: 'incidents', crumb: 'Respond' }); const r = {};
    r.beacon = beacon(w); r.beaconTxt = r.beacon.children[1]; r.beaconIc = r.beacon.children[0];
    w.content.append(head('CLIENT VISION · RESPOND', 'Incident Response', 'The incident register and response record. Declaring is one click from the header beacon; every action lands on an append-only timeline built for post-incident review.'));
    r.k = [kpi(0, 138, 308, '0', 'ACTIVE INCIDENTS', 'no incidents open'), kpi(332, 138, 308, '—', 'HIGHEST ACTIVE SEVERITY', 'nothing active'), kpi(664, 138, 308, '7', 'MEAN DAYS TO CLOSE', 'over 1 closed incident'), kpi(996, 138, 308, '1', 'INCIDENTS THIS YEAR', '1 all time')];
    r.k.forEach((k) => w.content.append(k.c));
    const reg = card(0, 270, 1304, 150); w.content.append(reg);
    reg.append(at(24, 16, 300, '', h('span', { class: 'k' }, 'INCIDENT REGISTER')));
    const regRow = (y0, ref, t, sev, sc, ph, pc, dec, age) => at(24, y0, 1256, 'height:44px;border-top:1px solid var(--line)', at(0, 13, 140, 'font:600 13px var(--mono);color:var(--accent-text)', ref), at(150, 12, 620, 'font:600 15px var(--ui)', t), at(790, 11, 110, '', h('span', { class: 'tag ' + sc }, sev)), at(910, 11, 130, '', h('span', { class: 'tag ' + pc }, ph)), at(1060, 13, 90, 'font:500 13.5px var(--ui)', dec), at(1160, 13, 96, 'font:500 13.5px var(--ui);color:var(--mute)', age));
    r.newRow = regRow(46, 'INC-2026-002', 'Suspicious sign-ins on a privileged cloud admin role', 'HIGH', 'high', 'DECLARED', 'info', 'Sep 24', '0d'); r.newPhase = r.newRow.children[3].firstChild;
    reg.append(r.newRow, regRow(94, 'INC-2026-901', 'Phishing campaign against finance staff', 'MEDIUM', 'med', 'CLOSED', 'low', 'Aug 9', '7d · closed'));
    r.oldRow = reg.lastChild;
    // detail panel
    const d = card(0, 440, 1304, 412); w.content.append(d); r.detail = d;
    d.append(at(24, 18, 900, 'font:700 13px var(--mono);letter-spacing:.06em;color:var(--accent-text)', 'INC-2026-002 ', h('span', { style: 'color:var(--ink-2)' }, 'SUSPICIOUS SIGN-INS ON A PRIVILEGED CLOUD ADMIN ROLE')),
      at(24, 46, 900, 'font:500 13px var(--ui);color:var(--mute)', h('span', { class: 'tag high', style: 'margin-right:10px' }, 'HIGH'), 'declared Sep 24, 8:47 PM'),
      at(24, 80, 1256, 'border-left:3px solid var(--line);padding-left:14px;font:500 14px/1.45 var(--ui);color:var(--ink-2)', 'Impossible-travel alert on an AWS Production admin role at 09:14. Access keys disabled pending review. Reported by CloudSignals.'),
      at(24, 132, 300, '', h('span', { class: 'k' }, 'RESPONSE PHASE')));
    r.chips = PHASES.map((p, i) => { const c = h('span', { class: 'tag gray', style: 'height:28px;font-size:11.5px;margin-right:8px;letter-spacing:.04em' }, p); return c; });
    d.append(at(24, 156, 1256, 'display:flex', ...r.chips));
    d.append(at(24, 204, 400, '', h('span', { class: 'k' }, 'TIMELINE · APPEND-ONLY')));
    r.tl = TIMELINE.map(([t, note, when], i) => { const e = at(24, 232 + i * 30, 1256, 'height:28px;display:flex;align-items:center;gap:12px;font:700 14px var(--ui)',
      h('span', { style: `width:22px;height:22px;border-radius:7px;background:${i === 5 ? '#e5f6e5' : '#e6f6fd'};display:grid;place-items:center;font-size:11px;color:${i === 5 ? '#0a7a0a' : '#0077ad'}` }, i === 0 ? '⚠' : i === 5 ? '✓' : '↳'), t,
      note ? h('span', { style: 'font:500 13px var(--ui);color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:760px' }, '— ' + note) : null, h('span', { style: 'margin-left:auto;font:500 12.5px var(--ui);color:var(--mute)' }, 'Sep 24, ' + when)); d.append(e); return e; });
    // declare modal
    const m = card(342, 20, 620, 420); m.style.zIndex = 8; m.style.boxShadow = '0 40px 90px -30px #0f172a88'; r.modal = m;
    m.append(at(26, 22, 500, 'font:700 20px var(--ui)', h('span', { style: 'color:#d03b3b;margin-right:8px' }, '⚠'), 'Declare an incident'), at(26, 56, 568, 'font:500 13.5px/1.45 var(--ui);color:var(--mute)', 'This opens an incident record visible to your whole workspace, starts the response timeline, and alerts the response team. It can be closed but never deleted.'),
      at(26, 110, 300, '', h('span', { class: 'k' }, 'WHAT IS HAPPENING?')));
    r.what = h('span', {}, ''); r.caret = h('span', { style: 'display:inline-block;width:2px;height:17px;background:#0f172a;vertical-align:-3px;margin-left:1px' });
    m.append(at(26, 132, 568, 'height:42px;border:1.5px solid #00aeef;border-radius:9px;font:500 15px/40px var(--ui);padding-left:12px', r.what, r.caret),
      at(26, 190, 300, '', h('span', { class: 'k' }, 'WHAT DO WE KNOW SO FAR?')),
      at(26, 212, 568, 'height:74px;border:1.5px solid var(--line);border-radius:9px;font:500 14px/1.4 var(--ui);padding:10px 12px;color:var(--ink-2)', 'Impossible-travel alert on an AWS Production admin role at 09:14. Access keys disabled pending review.'),
      at(26, 302, 200, '', h('span', { class: 'k' }, 'SEVERITY')),
      at(26, 324, 568, 'display:flex;gap:10px', ...['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sv) => h('span', { style: `height:34px;padding:0 16px;border-radius:17px;font:700 12px/34px var(--ui);letter-spacing:.06em;${sv === 'HIGH' ? 'background:#fdece4;color:#b3541f;border:1.5px solid #ec835a' : 'border:1.5px solid var(--line);color:var(--ink-2)'}` }, sv))));
    r.declare = at(404, 364, 190, 'height:42px;border-radius:10px;background:#d03b3b;color:#fff;font:700 15px/42px var(--ui);text-align:center', 'Declare incident'); m.append(r.declare);
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ AUDIT TRAIL ------------------------------ */
  const EVENTS = [['2026-09-24 20:49:27', 'cir.closed', 'INC-2026-002'], ['2026-09-24 20:49:11', 'cir.phase', 'INC-2026-002'], ['2026-09-24 20:49:08', 'cir.phase', 'INC-2026-002'], ['2026-09-24 20:49:06', 'cir.phase', 'INC-2026-002'], ['2026-09-24 20:48:39', 'cir.phase', 'INC-2026-002'], ['2026-09-24 20:47:03', 'cir.declared', 'INC-2026-002'],
    ['2026-09-24 20:27:37', 'provider.workspace_entered', '—'], ['2026-09-23 12:56:58', 'tenant.provider_assigned', 'Provider'], ['2026-09-19 10:37:52', 'admin.demo_provisioned', '—'], ['2026-09-19 10:37:51', 'sync.completed', 'cloudsignals']];
  function audit(x, y) {
    const w = UI.appWindow({ x, y, route: 'audit', active: 'audit', crumb: 'Trust' }); const r = {};
    beacon(w);
    w.content.append(head('BIG-VENTURE-INCORPORATED-DEM.ROAR.AIVRIC.COM', 'Audit Trail', 'Every action — who did what, when, and to which record. The log is append-only and hash-chained at the database: events can never be edited or deleted, and Verify integrity proves it.'));
    const ev = card(0, 140, 1304, 712); w.content.append(ev); r.ev = ev;
    ev.append(at(24, 22, 200, '', h('span', { class: 'k' }, 'EVENTS')));
    r.chip = at(760, 14, 300, 'height:36px;border-radius:18px;background:#e5f6e5;color:#0a7a0a;font:700 14px/36px var(--ui);text-align:center', '✓  Chain intact — 16 events verified'); ev.append(r.chip);
    r.verify = at(1076, 14, 168, 'height:36px;border-radius:9px;border:1.5px solid var(--line);background:#fff;font:600 14px/33px var(--ui);text-align:center', '⛓  Verify integrity'); ev.append(r.verify);
    ev.append(at(1252, 14, 30, 'font:600 14px/36px var(--ui);color:var(--mute)', '⤓'));
    const cols = [[24, 'TIME'], [260, 'ACTOR'], [560, 'ACTION'], [900, 'TARGET']];
    ev.append(at(0, 66, 1304, 'height:34px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 10, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    r.rows = EVENTS.map(([ts, act, tgt], i) => { const ok = h('span', { style: 'position:absolute;right:24px;top:12px;font:700 13px var(--ui);color:#17a34a;opacity:0' }, '✓ sealed');
      const y0 = 100 + i * 46 + (i > 0 ? 70 : 0);
      const row = at(0, y0, 1304, 'height:46px;border-bottom:1px solid var(--line)', at(24, 14, 220, 'font:500 13px var(--mono);color:var(--ink-2)', ts), at(260, 14, 280, 'font:500 13.5px var(--ui)', act.startsWith('cir') || act.startsWith('provider.w') ? 'nate.butler@3hue.net' : 'aramirez@3hue.net'),
        at(560, 11, 320, '', h('span', { class: 'tag gray', style: 'font:600 12px var(--mono);letter-spacing:0;text-transform:none;height:24px' }, act)), at(900, 14, 200, 'font:600 13px var(--mono)', tgt), ok);
      ev.append(row); return { row, ok }; });
    r.hash = at(24, 146, 1256, 'height:64px;border-radius:10px;background:#0f172a;color:#cfe8f6;font:500 13px/1.55 var(--mono);padding:10px 16px', h('div', { style: 'color:#8fd3f2' }, '{ "from": "post_incident" }'), h('div', {}, 'event #4715 · sha256 1645f574064264f203e33fd353b7bb30b8bd89ee032a0de7638b2a27910ce43b'));
    ev.append(r.hash);
    return { ...w, r };
  }

  /* ------------------------------ TRUSTSIGNALS (artifact library) ------------------------------ */
  function trust(x, y) {
    const w = UI.appWindow({ x, y, route: 'trustsignals', active: 'trustsignals', crumb: 'Trust' }); const r = {};
    beacon(w);
    w.content.append(head('CLIENT VISION · TRUST', 'TrustSignals', 'A living, evidence-backed trust center for your customers — bands and coverage, never raw findings. Documents stay in your SharePoint, Drive or URL.', 1000));
    const lib = card(0, 150, 620, 420); w.content.append(lib); r.lib = lib;
    lib.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'TRUST ARTIFACT LIBRARY')), at(560, 18, 40, 'text-align:right', r.libN = h('span', { class: 'k', style: 'font-size:13px' }, '0')));
    r.empty = at(24, 54, 560, 'font:500 14px var(--ui);color:var(--mute)', 'No artifacts yet.'); lib.append(r.empty);
    r.item = at(24, 50, 572, 'height:70px;border:1px solid var(--line);border-radius:12px;background:#f7fbfe',
      at(16, 12, 420, 'font:700 16px var(--ui)', 'SOC 2 Type II Report (FY2026)', h('span', { class: 'tag info', style: 'margin-left:10px;height:20px;font-size:10px' }, 'SOC 2'), h('span', { class: 'tag med', style: 'margin-left:6px;height:20px;font-size:10px' }, 'gated')),
      at(16, 40, 540, 'font:500 12.5px var(--mono);color:var(--mute)', 'SharePoint · expires 2027-09-30'));
    lib.append(r.item);
    const fld = (xx, yy, ww, txt, css = '') => at(xx, yy, ww, `height:42px;border:1.5px solid var(--line);border-radius:9px;font:500 14px/40px var(--ui);padding-left:12px;color:var(--ink);${css}`, txt);
    r.title = h('span', {}, ''); r.caret = h('span', { style: 'display:inline-block;width:2px;height:17px;background:#0f172a;vertical-align:-3px;margin-left:1px' });
    r.titleF = fld(24, 150, 280, '', 'border-color:#00aeef'); r.titleF.append(r.title, r.caret); lib.append(r.titleF);
    lib.append(fld(316, 150, 280, 'SOC 2 ▾'), fld(24, 206, 280, 'Gated — by request ▾'), fld(316, 206, 280, 'https://…/soc2-type-ii-fy2026.pdf', 'color:var(--mute);font-size:13px'), fld(24, 262, 280, 'SharePoint'), fld(316, 262, 160, '09/30/2027', 'font-family:var(--mono)'));
    r.add = at(488, 262, 108, 'height:42px;border-radius:10px;background:#0579aa;color:#fff;font:700 14px/42px var(--ui);text-align:center', 'Add artifact'); lib.append(r.add);
    lib.append(at(24, 330, 572, 'font:500 13px/1.45 var(--ui);color:var(--mute)', 'References only — the platform never stores the bytes. Gated artifacts appear as available-by-request.'));
    // assurance confidence
    const as = card(0, 590, 620, 262); w.content.append(as);
    as.append(at(24, 20, 500, '', h('span', { class: 'k' }, 'WHAT A PUBLISH WOULD DISCLOSE')));
    r.conf = h('span', {}, '25');
    as.append(at(24, 50, 560, 'font:800 30px var(--ui);letter-spacing:-.02em', 'Assurance confidence ', r.conf, h('span', { style: 'font-size:18px;color:var(--mute)' }, ' /100 · Early')));
    const bar = at(24, 100, 572, 'height:12px;border-radius:6px;background:#edf1f6;overflow:hidden'); r.confBar = h('i', { style: 'display:block;height:100%;width:25%;border-radius:6px;background:linear-gradient(90deg,#ffb36b,#0039e6)' }); bar.append(r.confBar); as.append(bar);
    r.pubN = h('span', {}, '0 (0 public · 0 by request)');
    [['Published artifacts', r.pubN], ['Live evidence freshness', 'last sync Sep 19'], ['Measured posture areas', '3 of 8']].forEach(([k, v], i) => as.append(at(24, 132 + i * 40, 572, 'height:34px;border-radius:8px;background:#f7f9fb;font:500 14px/34px var(--ui);padding:0 14px;display:flex;justify-content:space-between', h('span', {}, k), h('b', { style: 'color:#0a7a0a' }, v))));
    // public trust center preview
    const tc = card(644, 150, 660, 702); w.content.append(tc); r.tc = tc;
    tc.append(at(0, 0, 660, 'height:160px;border-radius:14px 14px 0 0;background:linear-gradient(118deg,#ffb36b 0%,#0039e6 62%,#031db0 100%);color:#fff',
      at(28, 24, 600, 'font:600 11px var(--mono);letter-spacing:.14em;opacity:.9', 'WHAT YOUR CUSTOMERS SEE'), at(28, 50, 600, 'font:700 28px var(--display);letter-spacing:-.02em', 'Big Venture Incorporated Trust Center'),
      at(28, 96, 600, 'font:500 14px/1.45 var(--ui);opacity:.92', 'Security, privacy, compliance and resilience posture — derived from live evidence.')));
    const band = (yy, t, sub, right) => at(28, yy, 604, 'height:82px;border:1px solid var(--line);border-radius:12px;background:#fff', at(20, 16, 44, 'height:44px;border-radius:12px;background:#e6f6fd;display:grid;place-items:center;color:#0077ad;font-size:20px', '⛨'), at(80, 16, 380, 'font:700 17px var(--ui)', t), at(80, 44, 380, 'font:500 13px var(--ui);color:var(--mute)', sub), right);
    r.soc2Band = band(188, 'Compliance', 'SOC 2 Type II report', r.req = at(430, 22, 150, 'height:38px;border-radius:19px;background:#0579aa;color:#fff;font:700 13px/38px var(--ui);text-align:center', 'Request access'));
    tc.append(r.soc2Band, band(284, 'Security', 'Measured · continuously monitored', at(470, 28, 110, 'text-align:right', h('span', { class: 'tag info' }, 'LIVE'))), band(380, 'Privacy & data', 'Approved commitments', at(470, 28, 110, 'text-align:right', h('span', { class: 'tag info' }, 'LIVE'))), band(476, 'Resilience', 'Recovery posture from live estate', at(470, 28, 110, 'text-align:right', h('span', { class: 'tag info' }, 'LIVE'))));
    tc.append(at(28, 590, 604, 'height:80px;border-radius:12px;background:#0f172a;color:#fff;font:700 20px/1.3 var(--ui);padding:16px 22px', 'Bands and coverage.', h('div', { style: 'color:#8fd3f2;font-size:16px;font-weight:600' }, 'Never raw findings.')));
    return { ...w, r };
  }

  window.UI2 = { controls, exceptions, incidents, audit, trust, PHASES, CONTROLS };
})();
