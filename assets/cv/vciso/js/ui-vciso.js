// The vCISO program's screens, rebuilt as DOM from the capture pass in the Big Venture Incorporated
// demo workspace (Sep 24–25, 2026): risk appetite & tolerance in Settings, decision guidance
// (declared tolerance vs measured posture), the policy & standards studio (a family standard
// generated, approved, published and frozen), a treatment decision, GROC Metrics & Measures,
// Delivery, and the ROAR snapshot that becomes the board's report.
(function () {
  const { h, s } = L;
  const card = (x, y, w, hh, ...kids) => h('div', { class: 'card', style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px` }, ...kids);
  const at = (x, y, w, css = '', ...kids) => h('div', { class: 'abs', style: `left:${x}px;top:${y}px;${w ? `width:${w}px;` : ''}${css}` }, ...kids);
  const head = (eyebrow, title, lede, w = 960) => at(0, 0, w, '', h('div', { class: 'eyebrow' }, eyebrow), h('div', { class: 'h1' }, title), lede ? h('div', { class: 'lede' }, lede) : null);
  const kpi = (x, y, w, n, k, sub) => { const nEl = h('div', { class: 'big' }, n), sEl = h('div', { class: 'sub' }, sub); const c = card(x, y, w, 112, at(22, 16, w - 40, '', nEl), at(22, 62, w - 40, '', h('div', { class: 'k' }, k)), at(22, 82, w - 40, '', sEl)); return { c, nEl, sEl }; };
  const caret = () => h('span', { style: 'display:inline-block;width:2px;height:17px;background:#0f172a;vertical-align:-3px;margin-left:1px' });
  const modalCard = (x, y, w, hh) => { const m = card(x, y, w, hh); m.style.zIndex = 8; m.style.boxShadow = '0 40px 90px -30px #0f172a88'; return m; };
  const LEVELS = ['Averse', 'Minimal', 'Cautious', 'Open', 'Hungry'];

  /* ------------------------------ SETTINGS · RISK APPETITE & TOLERANCE ------------------------------ */
  // [area, start level, final level, declared-only]
  const AREAS = [['Regulatory & framework compliance', 2, 0], ['Ransomware & destructive attack', 2, 0], ['Data protection & privacy', 2, 1], ['Identity compromise & identity fraud', 2, 1],
    ['Financial fraud & payment integrity', 2, 0], ['Third-party & supply chain', 2, 2], ['Service availability & resilience', 2, 1], ['Vulnerability & patch exposure', 2, 2],
    ['Cloud misconfiguration & attack surface', 2, 2], ['AI & emerging-technology use', 3, 3, 1], ['Insider risk', 1, 1, 1], ['Reputational', 2, 2, 1]];
  function settings(x, y) {
    const w = UI.appWindow({ x, y, route: 'settings', active: 'settings', crumb: 'Workspace settings' }); const r = {};
    w.content.append(head('BIG VENTURE INCORPORATED · WORKSPACE SETTINGS', 'Risk appetite & tolerance', 'The organization’s declared tolerance per area — the Decisions page compares it against measured posture. Overall appetite is calculated (the median of the declared levels), never typed in.', 1100));
    const c = card(0, 150, 1304, 702); w.content.append(c); r.card = c;
    c.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'RISK APPETITE & TOLERANCE')));
    r.status = at(300, 20, 700, 'font:500 13px var(--ui);color:var(--mute)', 'not set yet'); c.append(r.status);
    r.save = at(1100, 12, 180, 'height:40px;border-radius:10px;background:#0579aa;color:#fff;font:700 14.5px/40px var(--ui);text-align:center', 'Save risk profile'); c.append(r.save);
    r.toast = at(640, 22, 450, 'text-align:right;font:600 13.5px var(--ui);color:#0a7a0a', 'Risk profile saved — the Decisions page reflects it immediately.'); c.append(r.toast);
    // overall appetite (calculated)
    r.overall = h('b', {}, 'Cautious'); r.anchor = h('span', { style: 'color:var(--ink-2)' }, '');
    r.spread = h('span', { class: 'tag med', style: 'margin-left:10px;height:22px' }, 'Wide spread — worth a board review');
    r.ovBox = at(24, 62, 1256, 'height:48px;border:1px solid var(--line);border-radius:10px;background:#f7f9fb;font:500 15px/48px var(--ui);padding-left:16px;white-space:nowrap;overflow:hidden', '◔  Overall appetite: ', r.overall, r.anchor, r.spread);
    c.append(r.ovBox);
    r.rows = AREAS.map(([name, a, b, dec], i) => {
      const y0 = 126 + i * 47;
      const row = at(24, y0, 1256, 'height:47px;border-bottom:1px solid var(--line)');
      row.append(at(0, 14, 520, 'font:600 15.5px var(--ui)', name, dec ? h('span', { class: 'tag gray', style: 'margin-left:10px;height:19px;font-size:9.5px' }, 'declared only') : null));
      const segs = LEVELS.map((lv, k) => h('span', { style: `display:inline-block;width:84px;height:34px;font:600 13px/34px var(--ui);text-align:center;color:var(--ink-2);${k ? 'border-left:1px solid var(--line);' : ''}` }, lv));
      row.append(at(820, 6, 424, 'height:36px;border:1px solid var(--line);border-radius:9px;background:#fff;overflow:hidden;display:flex', ...segs));
      c.append(row); return { row, segs, a, b, name };
    });
    return { ...w, r };
  }

  /* ------------------------------ DECISIONS · GUIDANCE (tolerance vs measured) ------------------------------ */
  // [area, declared level, measured band (0-4) or null, result]
  const GUIDE = [['Regulatory & framework compliance', 0, 4, 'Exceeds'], ['Ransomware & destructive attack', 0, 4, 'Exceeds'], ['Data protection & privacy', 1, null, 'No signal yet'],
    ['Identity compromise & identity fraud', 1, null, 'No signal yet'], ['Financial fraud & payment integrity', 0, null, 'No signal yet'], ['Third-party & supply chain', 2, null, 'No signal yet'],
    ['Service availability & resilience', 1, null, 'No signal yet'], ['Vulnerability & patch exposure', 2, 2, 'In tolerance'], ['Cloud misconfiguration & attack surface', 2, null, 'No signal yet'],
    ['AI & emerging-technology use', 3, null, 'Declared'], ['Insider risk', 1, null, 'Declared'], ['Reputational', 2, null, 'Declared']];
  const RES = { Exceeds: ['crit', '#d03b3b'], 'In tolerance': ['low', '#17a34a'], 'No signal yet': ['gray', '#94a3b8'], Declared: ['info', '#0077ad'] };
  function guidance(x, y) {
    const w = UI.appWindow({ x, y, route: 'decisions', active: 'decisions', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · GOVERN', 'Decisions', 'Approvals and treatment choices waiting on your authority. Decisions made here are written back to CloudSignals — the system of record — and only shown once the server acknowledges them.', 1100));
    r.k = [kpi(0, 140, 424, 'Minimal', 'OVERALL APPETITE', 'declared in Settings · wide spread'), kpi(440, 140, 424, '1', 'TREATMENTS TO CHOOSE', 'proposed by your analysts'), kpi(880, 140, 424, 'Full', 'YOUR AUTHORITY', 'decisions are audited on both sides')];
    r.k.forEach((k) => w.content.append(k.c));
    const g = card(0, 272, 1304, 580); w.content.append(g); r.g = g;
    g.append(at(24, 18, 800, '', h('span', { class: 'k' }, 'DECISION GUIDANCE'), h('span', { style: 'margin-left:14px;font:600 14px var(--ui)' }, 'Overall appetite: Minimal'), h('span', { class: 'sub', style: 'margin-left:6px' }, '· wide spread')),
      at(24, 44, 1256, 'font:500 13px/1.45 var(--ui);color:var(--mute)', 'Declared tolerance vs measured posture, computed from this workspace’s synced data — hover any indicator for exactly how it is measured. Approvals in an area above tolerance ask for a written justification.'));
    r.tiles = GUIDE.map(([name, dl, mb, res], i) => {
      const cx = 24 + (i % 3) * 422, cy = 96 + Math.floor(i / 3) * 118;
      const [cls, col] = RES[res];
      const chip = h('span', { class: 'tag ' + cls, style: 'height:24px' }, res);
      const scale = at(18, 72, 370, 'height:22px');
      const segs = LEVELS.map((_, k) => at(k * 75, 8, 71, `height:6px;border-radius:3px;background:#edf1f6`));
      segs.forEach((e) => scale.append(e));
      const fill = at(0, 8, 0, 'height:6px;border-radius:3px;background:linear-gradient(90deg,#fab219,#d03b3b)'); scale.append(fill);
      const dMark = at(dl * 75 + 35 - 9, 2, 18, 'height:18px;border-radius:50%;background:#fff;border:4px solid #0077ad'); scale.append(dMark);
      const mMark = mb == null ? null : at(dl * 75 + 35 - 9, 2, 18, `height:18px;border-radius:50%;background:${col};border:3px solid #fff;box-shadow:0 0 0 1.5px ${col}`);
      if (mMark) scale.append(mMark);
      const tile = at(cx, cy, 406, 'height:106px;border:1px solid var(--line);border-radius:12px;background:#fff',
        at(18, 14, 300, 'font:600 14.5px/1.25 var(--ui)', name), at(18, 50, 200, 'font:600 12px var(--ui);color:var(--mute)', 'Tolerance · ', h('b', { style: 'color:var(--ink)' }, LEVELS[dl])),
        at(260, 44, 130, 'text-align:right', chip), scale);
      g.append(tile); return { tile, chip, fill, dMark, mMark, dl, mb, res };
    });
    return { ...w, r };
  }

  /* ------------------------------ GOVERNANCE DOCS · FAMILY STANDARD ------------------------------ */
  const STD = [['IAC-01', 'Unique identification and authentication', ['CC6.1', '5.16', 'Art. 32']], ['IAC-02', 'Multi-factor authentication for privileged access', ['CC6.6', '8.5', 'Art. 32']], ['IAC-03', 'Access reviews and recertification', ['CC6.2', '5.18', '—']]];
  function policy(x, y) {
    const w = UI.appWindow({ x, y, route: 'governance', active: 'governance', crumb: 'Governance Docs' }); const r = {};
    const top = card(0, 0, 1304, 236); w.content.append(top);
    top.append(at(28, 22, 600, 'font:600 13.5px var(--ui);color:var(--mute)', '← Governance Documentation Center'),
      at(28, 50, 1240, 'font:800 31px/1.15 var(--ui);letter-spacing:-.02em', 'Information Security Policy & Standards — Identity & Access'));
    r.badge = h('span', { class: 'tag info', style: 'height:26px;font-size:11.5px' }, '● Draft'); r.ver = h('span', {}, 'v0.1');
    top.append(at(28, 98, 700, 'display:flex;gap:10px;align-items:center', r.badge, h('span', { style: 'height:26px;padding:0 10px;border:1px solid var(--line);border-radius:7px;font:600 12.5px/24px var(--mono)' }, 'ISP-IAC-01 · ', r.ver),
      h('span', { style: 'font:500 13.5px var(--ui);color:var(--ink-2);margin-left:6px' }, 'Policy & Standards (control family) · Identity & Access')));
    r.steps = ['DRAFT', 'IN REVIEW', 'APPROVED', 'PUBLISHED'].map((t, i) => { const dot = h('span', { style: 'display:inline-block;width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:#fff;vertical-align:-4px;margin-right:8px' });
      const line = i < 3 ? h('span', { style: 'display:inline-block;width:70px;height:2px;background:#e2e8f0;vertical-align:4px;margin:0 12px' }) : null;
      const lab = h('span', { style: 'font:700 12px var(--ui);letter-spacing:.08em;color:var(--mute)' }, t); return { dot, line, lab, el: h('span', {}, dot, lab, line) }; });
    top.append(at(28, 142, 900, 'white-space:nowrap', ...r.steps.map((s0) => s0.el)));
    top.append(at(28, 180, 200, 'height:40px;border-radius:10px;background:#0579aa;color:#fff;font:700 14px/40px var(--ui);text-align:center', '◉  View document (PDF)'), at(240, 180, 140, 'height:40px;border-radius:10px;border:1.5px solid var(--line);font:600 14px/37px var(--ui);text-align:center', '⤓  Word (.docx)'));
    r.act = h('span', {}, 'Submit for review'); r.actBtn = at(392, 180, 190, 'height:40px;border-radius:10px;border:1.5px solid var(--line);background:#fff;font:700 14px/37px var(--ui);text-align:center', r.act); top.append(r.actBtn);
    r.note = at(600, 188, 500, 'font:600 13.5px var(--ui);color:#0077ad', ''); top.append(r.note);
    // crosswalks
    const xw = card(0, 256, 420, 300); w.content.append(xw);
    xw.append(at(22, 18, 380, '', h('span', { class: 'k' }, 'CROSSWALKS'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'from the baseline’s own mappings')));
    r.xw = [['SOC 2 — TSC 2017', '11 mapped'], ['ISO 27002:2022', '5 mapped'], ['EU GDPR (2016)', '1 mapped']].map(([n, m], i) => { const e = at(22, 58 + i * 72, 376, 'height:60px;border:2px solid var(--line);border-radius:12px;background:#fff',
      at(16, 10, 30, 'height:22px;top:19px;border-radius:6px;border:2px solid #cbd5e1'), at(56, 18, 220, 'font:700 15.5px var(--ui)', n), at(250, 20, 110, 'text-align:right;font:500 13px var(--ui);color:var(--mute)', m)); xw.append(e); return e; });
    xw.append(at(22, 276, 380, 'font:500 12px var(--ui);color:var(--mute)', 'Every control in this document maps to each one.'));
    // standards content, generated from the catalog
    const sc = card(440, 256, 864, 300); w.content.append(sc); r.sc = sc;
    sc.append(at(22, 18, 600, '', h('span', { class: 'k' }, 'STANDARDS CONTENT'), h('span', { class: 'sub', style: 'margin-left:10px' }, 'headings follow the control IDs · generated from the catalog')));
    sc.append(at(560, 46, 290, 'display:flex;gap:6px;justify-content:flex-end', ...['SOC 2', 'ISO 27002', 'GDPR'].map((t) => h('span', { class: 'k', style: 'width:84px;text-align:center;font-size:9.5px' }, t))));
    r.std = STD.map(([id, t, refs], i) => { const refEls = refs.map((rf) => h('span', { class: 'tag info', style: 'width:84px;justify-content:center;font:600 12px var(--mono);letter-spacing:0;height:26px' }, rf));
      const row = at(22, 72 + i * 72, 820, 'height:64px;border-top:1px solid var(--line)', at(0, 12, 90, 'font:700 13px var(--mono);color:var(--accent-text)', id), at(96, 11, 440, 'font:700 15.5px var(--ui)', t),
        at(96, 36, 440, 'font:500 12.5px var(--ui);color:var(--mute)', 'a. Big Venture Incorporated shall …'), at(538, 16, 290, 'display:flex;gap:6px;justify-content:flex-end', ...refEls));
      sc.append(row); return { row, refEls }; });
    // published versions
    const pv = card(0, 576, 1304, 276); w.content.append(pv); r.pv = pv;
    pv.append(at(24, 18, 600, '', h('span', { class: 'k' }, 'PUBLISHED VERSIONS — FROZEN FOREVER')));
    r.pvN = at(1100, 18, 180, 'text-align:right;font:600 13px var(--ui);color:var(--mute)', '0 published'); pv.append(r.pvN);
    r.pvEmpty = at(24, 56, 1100, 'font:500 14px/1.5 var(--ui);color:var(--mute)', 'None yet. Publishing freezes the rendered document as an immutable snapshot — the deliverable a client received stays reproducible even as the catalog moves on.'); pv.append(r.pvEmpty);
    r.pvRow = at(24, 58, 1256, 'height:92px;border:1.5px solid #bfe3f5;border-radius:14px;background:#f5fbfe',
      at(20, 22, 48, 'height:48px;border-radius:12px;background:#0f172a;display:grid;place-items:center', s('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#8fd3f2', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2 }), s('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }))),
      at(86, 18, 700, 'font:800 20px var(--ui)', 'v1.0', h('span', { class: 'tag low', style: 'margin-left:10px;height:22px' }, 'CURRENT')),
      at(86, 50, 900, 'font:500 14px var(--ui);color:var(--ink-2)', 'Published after vCISO and client approval. Kickoff policy set, 90-day program.'),
      at(1000, 34, 236, 'text-align:right;font:500 13px var(--ui);color:var(--mute)', 'Sep 24, 2026 · View · .docx'));
    pv.append(r.pvRow);
    r.pvFoot = at(24, 170, 1256, 'font:500 13.5px var(--ui);color:var(--mute)', 'Big Venture Incorporated · 10 plain-English sections in the Enterprise ISP draft · Master ISPPS next'); pv.append(r.pvFoot);
    // publish modal (as captured)
    const m = modalCard(322, 120, 660, 420); r.modal = m;
    m.append(at(28, 24, 600, 'font:800 22px var(--ui)', 'Publish this document'),
      at(28, 62, 600, 'font:500 14.5px/1.5 var(--ui);color:var(--ink-2)', 'Publishing freezes the fully rendered document as an IMMUTABLE version — the exact deliverable, reproducible forever. The draft keeps following the catalog afterwards.'),
      at(28, 150, 300, '', h('span', { class: 'k' }, 'VERSION LABEL')), at(28, 174, 604, 'height:42px;border:1.5px solid var(--line);border-radius:9px;font:600 15px/40px var(--mono);padding-left:14px', '1.0'),
      at(28, 232, 400, '', h('span', { class: 'k' }, 'REVISION COMMENT (VERSION HISTORY)')));
    r.comment = h('span', {}, ''); r.caret = caret();
    m.append(at(28, 256, 604, 'height:58px;border:1.5px solid #00aeef;border-radius:9px;font:500 15px/1.4 var(--ui);padding:9px 14px', r.comment, r.caret));
    r.pub = at(28, 340, 150, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/44px var(--ui);text-align:center', 'Publish v1.0'); m.append(r.pub, at(192, 340, 100, 'height:44px;border-radius:10px;border:1.5px solid var(--line);font:600 15px/41px var(--ui);text-align:center', 'Cancel'));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ DECISIONS · TREATMENT (weighed against tolerance) ------------------------------ */
  const OPTS = [['Mitigate now', 'Block public access org-wide and remediate ACL grants this sprint', 'Within tolerance', 'low'], ['Mitigate after Oct 19', 'Keep the partner test bucket until its exception expires', 'Above tolerance', 'crit'],
    ['Accept', 'Carry the exposure knowingly', 'Above tolerance', 'crit'], ['Transfer', 'Cover through cyber insurance', 'Above tolerance', 'crit']];
  function decide(x, y) {
    const w = UI.appWindow({ x, y, route: 'decisions', active: 'decisions', crumb: 'Govern' }); const r = {};
    w.content.append(head('CLIENT VISION · GOVERN', 'Decisions', 'Every treatment is weighed against the tolerance leadership declared. Approvals above it ask for a written justification — recorded in both audit trails with your name.', 1100));
    const q = card(0, 140, 1304, 190); w.content.append(q);
    q.append(at(24, 18, 800, '', h('span', { class: 'k' }, 'RISK TREATMENTS AWAITING DECISION'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'from the register mirror · synced Sep 19')));
    q.append(at(24, 54, 1256, 'height:112px;border:1px solid var(--line);border-radius:12px;background:#fbfdff',
      at(22, 20, 900, 'font:700 18px var(--ui)', 'Block public access org-wide and remediate ACL grants'),
      at(22, 50, 900, 'font:500 14px var(--ui);color:var(--ink-2)', 'Org-level public-access block plus a remediation sweep of existing grants.'),
      at(22, 78, 400, 'font:600 12.5px var(--ui);color:var(--mute)', '⌂ Cloud Platform'),
      (r.btn = at(1040, 36, 190, 'height:42px;border-radius:10px;background:linear-gradient(90deg,#00aeef,#0579aa);color:#fff;font:700 14.5px/42px var(--ui);text-align:center', 'Choose treatment'))));
    const au = card(0, 350, 1304, 502); w.content.append(au); r.au = au;
    au.append(at(24, 18, 700, '', h('span', { class: 'k' }, 'DECISION RECORD'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'append-only · audited on both sides')));
    const EV = [['Treatment chosen · Mitigate after Oct 19', 'Above tolerance · justification recorded · written to CloudSignals', 'nate.butler@3hue.net · just now'],
      ['Risk profile saved', 'Overall appetite: Minimal · 12 tolerance areas', 'nate.butler@3hue.net · today'],
      ['Treatment decided · Enforce modern authentication', 'Retire legacy protocols · within tolerance', 'Program Office · Sep 19']];
    r.events = EV.map(([a, b, who], i) => { const e = at(24, 54 + i * 80, 1256, 'height:72px;border-top:1px solid var(--line)',
      at(0, 18, 36, `height:36px;border-radius:10px;background:${i === 0 ? '#fbe7e7' : '#e6f6fd'};display:grid;place-items:center;font:700 15px var(--ui);color:${i === 0 ? '#b22b2b' : '#0077ad'}`, i === 0 ? '!' : '✓'),
      at(54, 14, 800, 'font:700 15.5px var(--ui)', a), at(54, 40, 900, 'font:500 13.5px var(--ui);color:var(--mute)', b), at(920, 26, 336, 'text-align:right;font:500 13px var(--ui);color:var(--mute)', who)); au.append(e); return e; });
    // "Choose the risk treatment" modal, rebuilt from the demo's dialog (the demo's CloudSignals feed is simulated)
    const m = modalCard(222, 20, 860, 812); r.modal = m;
    m.append(at(30, 24, 700, 'font:800 22px var(--ui)', 'Choose the risk treatment'), at(810, 20, 30, 'font:500 22px var(--ui);color:var(--mute)', '×'),
      at(30, 64, 800, 'font:700 17px var(--ui)', 'Block public access org-wide and remediate ACL grants'),
      at(30, 94, 800, 'height:36px;border-left:3px solid var(--line);padding-left:14px;font:500 14px/36px var(--ui);color:var(--ink-2)', 'Org-level public-access block plus a remediation sweep of existing grants.'),
      at(30, 146, 800, 'height:52px;border-radius:10px;background:#f7f9fb;font:500 14px/52px var(--ui);padding-left:16px', '◔  Tolerance area: ', h('b', {}, 'Data protection & privacy'), ' · declared ', h('b', {}, 'Minimal'), h('span', { style: 'color:var(--mute)' }, ' — leadership, Sep 25')));
    r.opts = OPTS.map(([t, d, v, cls], i) => { const chip = h('span', { class: 'tag ' + cls, style: 'height:24px' }, v); const radio = at(18, 25, 22, 'height:22px;border-radius:50%;border:2px solid #cbd5e1;background:#fff');
      const e = at(30, 216 + i * 84, 800, 'height:74px;border:1.5px solid var(--line);border-radius:12px;background:#fff', radio, at(56, 14, 520, 'font:700 16px var(--ui)', t), at(56, 40, 560, 'font:500 13.5px var(--ui);color:var(--mute)', d), at(620, 24, 160, 'text-align:right', chip));
      m.append(e); return { e, chip, radio }; });
    r.just = at(30, 556, 800, 'height:150px;border:1.5px solid #f3b9a3;border-radius:12px;background:#fff8f5;overflow:hidden',
      at(18, 14, 760, 'font:700 13px var(--ui);letter-spacing:.06em;color:#b3541f', '⚠  ABOVE TOLERANCE — WRITTEN JUSTIFICATION REQUIRED'));
    r.jtxt = h('span', {}, ''); r.jcaret = caret();
    r.just.append(at(18, 44, 764, 'height:84px;border:1.5px solid #00aeef;border-radius:9px;background:#fff;font:500 15px/1.45 var(--ui);padding:10px 14px', r.jtxt, r.jcaret));
    m.append(r.just);
    r.rec = at(560, 730, 270, 'height:48px;border-radius:10px;background:linear-gradient(90deg,#00aeef,#0579aa);color:#fff;font:700 15px/48px var(--ui);text-align:center', 'Record decision'); m.append(r.rec);
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ GROC · METRICS & MEASURES ------------------------------ */
  // [title, kind, value, target, status, footer, recorded?]
  const TILES = [['# of Risks ≥ Threshold', 'KRI · LAG', '1', 'Target: ≤ 0', 'OFF TARGET', 'Attested 2026-09-24 by nate.butler@3hue.net', 'red'],
    ['Maintain uptime ≥ 99.9% per SLA with customers', 'KRI · LAG', '99.95%', 'Target: ≥ 99.9%', 'ON TARGET', 'Attested 2026-09-13', null],
    ['Annual security reviews of 100% of critical third-party providers', 'KRI · LAG', '100%', 'Target: ≥ 100%', 'ON TARGET', 'Attested 2026-09-24 by nate.butler@3hue.net', 'green'],
    ['Annual ISMS training with ≥ 95% completion rate', 'KRI · LAG', '96.4%', 'Target: ≥ 95%', 'ON TARGET', 'Attested 2026-09-07', null],
    ['< 1% of IT assets missing critical/high patches', 'KRI · LAG', '0.6%', 'Target: ≤ 1%', 'ON TARGET', 'Attested 2026-09-24 by nate.butler@3hue.net', 'green'],
    ['# Hours to detect an incident (average)', 'KPI · LAG', '1.2 h', 'Target: ≤ 1 h', 'WATCH', 'Live · derived from this workspace', null]];
  const ST = { 'ON TARGET': ['#e5f6e5', '#0a7a0a'], 'OFF TARGET': ['#fbe7e7', '#b22b2b'], WATCH: ['#fdf3dc', '#8a6002'], 'NO READING': ['#f1f5f9', '#5d6e86'] };
  function metrics(x, y) {
    const w = UI.appWindow({ x, y, route: 'groc/metrics', active: 'groc', crumb: 'Report' }); const r = {};
    w.content.append(head('GROC · 05 · M', 'Metrics & Measures', 'Key Risk & Compliance Indicators and Key Performance Indicators — ISO/IEC 27001:2022 Clause 6.2 objectives measured per Clause 9.1 and reviewed at Management Review. Never a zero pretending to be data.', 1150));
    w.content.append(at(0, 132, 700, 'display:flex;gap:8px', ...['All metrics', 'ISMS', 'PIMS'].map((t, i) => h('span', { style: `height:32px;padding:0 16px;border-radius:16px;font:600 13.5px/30px var(--ui);${i ? 'border:1px solid var(--line);color:var(--ink-2)' : 'border:1.5px solid #00aeef;background:#e6f6fd;color:#0077ad'}` }, t))),
      at(900, 138, 404, 'text-align:right;font:600 14px var(--ui);color:var(--ink-2)', '37 metrics · 6 derived live · 31 attested'));
    r.tiles = TILES.map(([t, kind, v, tg, st, foot, rec], i) => {
      const x0 = (i % 3) * 440, y0 = 186 + Math.floor(i / 3) * 336;
      const band = at(0, 0, 424, 'height:40px;border-radius:14px 14px 0 0;font:700 11.5px/40px var(--ui);letter-spacing:.1em;text-align:right;padding-right:18px');
      const valEl = h('div', { style: 'font:800 46px/1 var(--ui);letter-spacing:-.02em;font-variant-numeric:tabular-nums' }, v);
      const footEl = at(22, 270, 380, 'font:500 12.5px var(--ui);color:var(--mute)', foot);
      const btn = at(290, 294, 120, 'text-align:right;font:600 13px var(--ui);color:#0077ad', 'Record reading');
      const c = card(x0, y0, 424, 320, band, at(16, 9, 60, 'height:22px;border-radius:11px;background:#fff;border:1px solid var(--line);font:600 10px/20px var(--ui);text-align:center;letter-spacing:.06em', kind.split(' · ')[1]),
        at(22, 56, 380, 'font:700 16px/1.3 var(--ui)', t), at(22, 116, 380, '', valEl), at(22, 172, 380, 'font:600 13px var(--ui);color:var(--ink-2)', tg),
        at(22, 204, 380, 'font:500 12.5px/1.45 var(--ui);color:var(--mute)', kind.startsWith('KPI') ? 'Averaged live from Incident Response.' : 'Recorded measurement with provenance — append-only, audited.'), footEl, btn);
      w.content.append(c); return { c, band, valEl, footEl, btn, st, v, rec, foot };
    });
    // record-a-reading modal (as captured)
    const m = modalCard(222, 70, 860, 520); r.modal = m;
    m.append(at(30, 24, 600, 'font:600 12px var(--mono);letter-spacing:.1em;color:var(--mute)', 'KRI · LAG · ISMS'), at(760, 20, 80, 'height:34px;border-radius:9px;border:1.5px solid var(--line);font:600 13px/31px var(--ui);text-align:center', 'Close'),
      at(30, 48, 700, 'font:800 24px var(--ui)', '# of Risks ≥ Threshold'),
      at(30, 92, 800, 'font:500 14.5px/1.6 var(--ui);color:var(--ink-2)', h('b', { style: 'color:var(--ink)' }, 'Method — '), '# of risks which have eclipsed the threshold for risk treatment timeline.', h('br'), h('b', { style: 'color:var(--ink)' }, 'Reporting — '), 'RMP Dashboard · IT Risk Committee Meeting', h('br'), h('b', { style: 'color:var(--ink)' }, 'Target: ≤ 0 · cadence every 92 days')));
    const box = at(30, 196, 800, 'height:190px;border:1px solid var(--line);border-radius:14px;background:#fbfdff'); m.append(box);
    box.append(at(20, 16, 300, 'font:700 15px var(--ui)', 'Record a reading'));
    r.val = h('span', {}, ''); r.vcaret = caret();
    box.append(at(20, 50, 180, 'height:44px;border:1.5px solid #00aeef;border-radius:9px;background:#fff;font:600 17px/42px var(--ui);padding-left:14px', r.val, r.vcaret),
      at(212, 50, 190, 'height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 15px/42px var(--mono);padding-left:14px', '09/24/2026'),
      at(414, 50, 366, 'height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/42px var(--ui);padding-left:14px;color:var(--mute)', 'https://… evidence (optional)'));
    r.note = h('span', {}, '');
    box.append(at(20, 106, 600, 'height:44px;border:1.5px solid var(--line);border-radius:9px;background:#fff;font:500 14px/42px var(--ui);padding-left:14px;white-space:nowrap;overflow:hidden', r.note));
    r.save = at(634, 106, 146, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 14.5px/44px var(--ui);text-align:center', 'Save reading'); box.append(r.save);
    box.append(at(20, 160, 760, 'font:500 12.5px var(--ui);color:var(--mute)', 'Append-only: a correction is a newer reading. Evidence links reference your own repositories — never copies.'));
    m.append(at(30, 410, 520, 'height:44px;border:1.5px solid var(--line);border-radius:9px;font:500 14.5px/42px var(--ui);padding-left:14px', 'VP of Information Technology (CISO)'), at(562, 410, 268, 'height:44px;border-radius:9px;border:1.5px solid var(--line);font:600 14px/41px var(--ui);text-align:center', 'Set metric owner'),
      at(30, 472, 400, 'font:700 14px var(--ui)', 'Reading history', h('span', { style: 'font:500 13px var(--ui);color:var(--mute);margin-left:10px' }, 'No readings recorded yet.')));
    w.content.append(m);
    return { ...w, r };
  }

  /* ------------------------------ DELIVERY (Teamwork) ------------------------------ */
  // Layout provisional until the supervised look at a live Delivery screen; every value is fictional demo data.
  const MS = [['Day 30', 'Foundations', 'Oct 24', ['Risk appetite workshop', 'Policy set v1 published', 'Metrics baseline recorded']],
    ['Day 60', 'Operate', 'Nov 23', ['Treatment decisions under tolerance', 'Third-party review cycle', 'Incident tabletop exercise']],
    ['Day 90', 'Report', 'Dec 23', ['Board report Q4', 'Roadmap for 2027', 'Master ISPPS v1']]];
  function delivery(x, y) {
    const w = UI.appWindow({ x, y, route: 'operate', active: 'delivery', crumb: 'Operate' }); const r = {};
    w.content.append(head('CLIENT VISION · OPERATE', 'Delivery', 'Your 3HUE engagement, live from the delivery workspace — projects, milestones, task progress and activity, scoped to your organization only.', 1100));
    r.live = h('span', { class: 'pill', style: 'height:30px;font-size:12.5px;border-color:#bfe3f5;color:#0077ad' }, h('span', { class: 'dot' }), 'Live · Teamwork'); w.content.append(at(1150, 8, 154, 'text-align:right', r.live));
    r.k = [kpi(0, 130, 308, '3', 'MILESTONES', 'Day 30 · 60 · 90'), kpi(332, 130, 308, '4 / 9', 'TASKS COMPLETE', 'vCISO program · sample'), kpi(664, 130, 308, 'Oct 24', 'NEXT MILESTONE', 'Day 30 · Foundations'), kpi(996, 130, 308, 'On track', 'PROGRAM STATUS', 'reviewed weekly')];
    r.k.forEach((k) => w.content.append(k.c));
    const pc = card(0, 262, 1304, 590); w.content.append(pc);
    pc.append(at(24, 18, 800, '', h('span', { class: 'k' }, 'PROJECT'), h('span', { style: 'margin-left:12px;font:700 15px var(--ui)' }, 'vCISO Program — Big Venture Incorporated'), h('span', { class: 'tag gray', style: 'margin-left:10px;height:20px' }, 'sample')));
    // timeline bar
    const tl = at(24, 60, 1256, 'height:44px'); pc.append(tl);
    tl.append(at(0, 20, 1256, 'height:6px;border-radius:3px;background:#edf1f6'));
    r.tlFill = at(0, 20, 0, 'height:6px;border-radius:3px;background:linear-gradient(90deg,#ffb36b,#0039e6)'); tl.append(r.tlFill);
    r.ms = MS.map(([d, name, due, tasks], i) => {
      const x0 = 24 + i * 422;
      const node = at(i * 418 + 180, 10, 26, 'height:26px;border-radius:50%;background:#fff;border:4px solid #cbd5e1'); tl.append(node);
      const col = at(x0, 122, 402, 'height:440px;border:1px solid var(--line);border-radius:14px;background:#fbfdff');
      const ttl = at(20, 16, 360, 'font:800 24px var(--ui)', d, h('span', { style: 'font:600 15px var(--ui);color:var(--mute);margin-left:10px' }, name));
      col.append(ttl, at(20, 54, 360, 'font:500 13px var(--ui);color:var(--mute)', 'due ' + due + ' · owner: 3HUE vCISO'));
      const tks = tasks.map((tk, j) => { const box = h('span', { style: 'display:inline-block;width:20px;height:20px;border-radius:6px;border:2px solid #cbd5e1;vertical-align:-4px;margin-right:12px;text-align:center;font:800 13px/16px var(--ui);color:#fff' });
        const e = at(20, 96 + j * 64, 362, 'height:52px;border:1px solid var(--line);border-radius:10px;background:#fff;font:600 14.5px/50px var(--ui);padding-left:14px', box, tk); col.append(e); return { e, box }; });
      const bar = at(20, 300, 362, 'height:8px;border-radius:4px;background:#edf1f6'); const bf = h('i', { style: 'display:block;height:100%;width:0;border-radius:4px;background:#17a34a' }); bar.append(bf); col.append(bar);
      const pct = at(20, 318, 362, 'font:600 13px var(--ui);color:var(--mute)', '0% complete'); col.append(pct);
      col.append(at(20, 360, 362, 'font:500 12.5px/1.45 var(--ui);color:var(--mute)', i === 0 ? 'Activity · policy ISP-IAC-01 v1.0 published' : i === 1 ? 'Activity · decision recorded above tolerance' : 'Activity · ROAR snapshot scheduled'));
      pc.append(col); return { node, col, tks, bf, pct };
    });
    return { ...w, r };
  }

  /* ------------------------------ ROAR · FREEZE SNAPSHOT → THE BOARD'S REPORT ------------------------------ */
  function snapshot(x, y) {
    const w = UI.appWindow({ x, y, route: 'roar', active: 'roar', crumb: 'Report' }); const r = {};
    const secs = ['Executive summary', 'Scope & methodology', 'Risk landscape', 'Findings by provider', 'Findings index', 'Risk analysis', 'Opportunity analysis', 'Remediation roadmap', 'Trends', 'Appendix'];
    const side = card(0, 0, 250, 852); w.content.append(side);
    side.append(at(18, 18, 220, '', h('span', { class: 'k' }, 'ROAR · REPORT SECTIONS')), ...secs.map((t, i) => at(12, 48 + i * 34, 226, `height:30px;border-radius:8px;${i === 0 ? 'background:#e6f6fd;' : ''}font:${i === 0 ? 600 : 500} 13px/30px var(--ui);color:${i === 0 ? 'var(--accent-text)' : 'var(--ink-2)'};padding-left:10px`, h('span', { style: 'font:500 11px var(--mono);color:var(--mute);margin-right:10px' }, String(i + 1).padStart(2, '0')), t)));
    side.append(at(18, 410, 214, '', h('span', { class: 'k' }, 'SNAPSHOTS')), at(18, 436, 214, 'font:500 12.5px/1.45 var(--ui);color:var(--mute)', 'Freeze the report as it stands — each snapshot opens as a branded, print-ready document.'));
    r.freeze = at(18, 510, 214, 'height:40px;border-radius:10px;border:1.5px solid var(--line);background:#fff;font:700 14px/37px var(--ui);text-align:center', '❄  Freeze snapshot'); side.append(r.freeze);
    r.frozen = at(18, 562, 214, 'font:600 12.5px/1.5 var(--ui);color:#0a7a0a', 'Frozen: ROAR — Sep 25, 2026'); side.append(r.frozen);
    r.snapItem = at(18, 600, 214, 'height:56px;border:1px solid var(--line);border-radius:10px;background:#f7fbfe;padding:9px 12px', h('div', { style: 'font:700 13.5px var(--ui)' }, 'ROAR — Sep 25, 2026'), h('div', { style: 'font:500 12px var(--ui);color:var(--mute)' }, 'Sep 24, 2026 · sample')); side.append(r.snapItem);
    const X0 = 276;
    w.content.append(at(X0, 0, 1000, '', h('div', { class: 'eyebrow' }, 'ROAR — RISK & OPPORTUNITIES ASSESSMENT REPORT'), h('div', { class: 'h1' }, 'Executive summary'),
      h('div', { class: 'sub', style: 'font-size:13.5px' }, 'Big Venture Incorporated · scan of Sep 19, 2026 · 642 of 662 resources · CloudSignals')));
    const st = [['SECURITY POSTURE', '71', 'of 100 · grade B−'], ['OPEN FINDINGS', '629', '↓ 25 vs last scan'], ['CRITICAL', '0', '± 0 vs last scan'], ['SCAN COVERAGE', '97.0%', '642 of 662 resources']];
    st.forEach(([k, v, sub], i) => w.content.append(card(X0 + i * 258, 110, 242, 118, at(18, 16, 210, '', h('span', { class: 'k' }, k)), at(18, 38, 210, 'font:800 36px var(--ui);font-variant-numeric:tabular-nums', v), at(18, 86, 210, 'font:500 12.5px var(--ui);color:var(--mute)', sub))));
    const tr = card(X0, 248, 1028, 604); w.content.append(tr);
    tr.append(at(24, 18, 600, '', h('span', { class: 'k' }, 'POSTURE TRAJECTORY'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'scan-over-scan · 6 scan days')));
    const TRJ = [['Aug 15', 65, 770], ['Aug 22', 66, 736], ['Aug 29', 67, 707], ['Sep 5', 69, 679], ['Sep 12', 70, 654], ['Sep 19', 71, 629]];
    r.trj = TRJ.map(([d, sc, open], i) => { const bh = (sc - 50) * 14; const b = at(60 + i * 160, 470 - bh, 90, `height:${bh}px;border-radius:10px 10px 4px 4px;background:${i === 5 ? 'linear-gradient(180deg,#00aeef,#0579aa)' : '#cfe8f6'};transform-origin:bottom`);
      tr.append(b, at(40 + i * 160, 440 - bh, 130, 'text-align:center;font:800 22px var(--ui)', String(sc)), at(40 + i * 160, 486, 130, 'text-align:center;font:600 13px var(--ui);color:var(--mute)', d), at(40 + i * 160, 510, 130, 'text-align:center;font:500 12px var(--ui);color:var(--mute)', open + ' open')); return b; });
    // the frozen snapshot document: branded cover + page 2
    const doc = at(330, 12, 760, 'height:930px;z-index:9;transform-origin:0 0;filter:drop-shadow(0 40px 60px rgba(15,23,42,.35))'); r.doc = doc;
    const cover = at(0, 0, 640, 'height:900px;border-radius:14px;overflow:hidden;background:linear-gradient(165deg,#0a3de0 0%,#0a6ef0 55%,#00a3f0 100%);color:#fff');
    cover.append(at(0, 0, 640, 'height:900px;background:radial-gradient(420px 420px at 560px 90px,rgba(255,255,255,.12),rgba(255,255,255,0) 70%)'),
      at(40, 36, 560, 'display:flex;justify-content:space-between;font:600 11px var(--mono);letter-spacing:.2em', h('span', { style: 'opacity:.85' }, 'CONFIDENTIAL — DO NOT DISTRIBUTE'), h('span', { style: 'padding:3px 10px;border-radius:10px;background:#ffffff26' }, 'SAMPLE DATA')));
    const tile = at(280, 150, 80, 'height:80px;border-radius:18px;background:#ffffff1f;box-shadow:inset 0 0 0 1.5px #ffffff40;display:grid;place-items:center');
    const m3 = s('svg', { viewBox: '0 0 760 1028', width: 44, height: 60 }); m3.append(s('path', { d: LOGO.three, fill: '#7fe0ff', 'fill-rule': 'evenodd' })); tile.append(m3);
    cover.append(tile, at(0, 262, 640, 'text-align:center;font:700 13px var(--mono);letter-spacing:.34em;opacity:.9', 'MULTI-CLOUD SECURITY ASSESSMENT'),
      at(0, 292, 640, 'text-align:center;font:800 96px/1 var(--display);letter-spacing:-.03em', 'ROAR'), at(0, 400, 640, 'text-align:center;font:600 20px var(--ui);opacity:.92', 'Risk & Opportunities Assessment Report'),
      at(290, 446, 60, 'height:3px;border-radius:2px;background:#ffffff80'),
      at(0, 486, 640, 'text-align:center;font:700 12px var(--mono);letter-spacing:.3em;opacity:.75', 'PREPARED FOR'), at(0, 512, 640, 'text-align:center;font:800 34px var(--display);letter-spacing:-.02em', 'Big Venture Incorporated'),
      at(0, 566, 640, 'text-align:center;font:600 17px var(--ui);opacity:.9', 'September 24, 2026'), at(0, 596, 640, 'text-align:center;font:500 13px var(--ui);opacity:.75', 'Illustrative sample data · scan of Sep 19, 2026 · 662 resources across 2 accounts'),
      at(0, 636, 640, 'display:flex;justify-content:center;gap:10px', ...['AWS', 'Azure'].map((t) => h('span', { style: 'height:28px;padding:0 16px;border-radius:14px;background:#ffffff26;font:700 13px/28px var(--ui)' }, t))),
      at(60, 740, 520, 'height:1px;background:#ffffff40'), at(0, 762, 640, 'text-align:center;font:700 12px var(--mono);letter-spacing:.3em;opacity:.75', 'PREPARED BY'), at(0, 786, 640, 'text-align:center;font:800 22px var(--ui)', '3HUE Cybersecurity'),
      at(0, 826, 640, 'text-align:center;font:500 12.5px var(--mono);opacity:.7', 'Report ID: ROAR-2026-0924-77D9'));
    r.cover = cover;
    const p2 = at(60, 24, 640, 'height:900px;border-radius:14px;background:#fff;box-shadow:0 0 0 1px #e2e8f0;overflow:hidden'); r.p2 = p2;
    p2.append(at(40, 34, 560, 'font:700 11px var(--mono);letter-spacing:.2em;color:#0077ad', 'CONFIDENTIAL'), at(40, 64, 560, 'font:800 34px var(--display);letter-spacing:-.02em', '01  Executive summary'),
      at(40, 130, 260, 'height:150px;border-radius:14px;background:#f5fbfe;box-shadow:inset 0 0 0 1px #e2e8f0', at(0, 26, 260, 'text-align:center;font:800 64px/1 var(--ui)', '71'), at(0, 104, 260, 'text-align:center;font:700 11px var(--ui);letter-spacing:.14em;color:#5d6e86', 'OF 100 · GRADE B−')),
      at(320, 130, 280, 'font:600 15px/2 var(--ui);color:#3f4f66', h('div', {}, 'Open findings ', h('b', { style: 'float:right;color:#0f172a' }, '629')), h('div', {}, 'Critical ', h('b', { style: 'float:right;color:#0f172a' }, '0')), h('div', {}, 'Pass rate ', h('b', { style: 'float:right;color:#0f172a' }, '77.6%')), h('div', {}, 'Accepted risks ', h('b', { style: 'float:right;color:#0f172a' }, '1'))),
      at(40, 316, 560, 'font:800 22px var(--display)', '02  Posture trajectory'),
      ...TRJ.map(([d, sc, open], i) => at(40, 360 + i * 44, 560, `height:40px;border-bottom:1px solid #edf1f6;font:500 15px/40px var(--ui);display:flex;justify-content:space-between;${i === 5 ? 'font-weight:800;color:#0077ad' : 'color:#3f4f66'}`, h('span', {}, d), h('span', {}, 'score ' + sc), h('span', {}, open + ' open'))),
      at(40, 640, 560, 'font:800 22px var(--display)', '03  Risk landscape'),
      ...[['Supply Chain', 48], ['Network Security', 44], ['Identity & Access', 43], ['Data Protection', 39]].map(([n, v], i) => at(40, 684 + i * 44, 560, 'height:40px;font:600 14.5px/40px var(--ui);color:#3f4f66', n, at(200, 16, 300, 'height:8px;border-radius:4px;background:#edf1f6', h('i', { style: `display:block;height:100%;width:${v * 2}%;border-radius:4px;background:linear-gradient(90deg,#fab219,#ec835a)` })), at(510, 0, 50, 'text-align:right;font-weight:800;color:#0f172a', String(v)))));
    doc.append(p2, cover);
    w.content.append(doc);
    return { ...w, r };
  }

  window.UI3 = { settings, guidance, policy, decide, metrics, delivery, snapshot, LEVELS, AREAS, ST };
})();
