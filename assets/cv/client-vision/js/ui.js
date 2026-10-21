// Client Vision screens rebuilt as DOM in the product's light theme. Figures are the
// Big Venture Incorporated demo workspace (sample data), as shown in the live product.
(function () {
  const { h, s } = L;
  const NAV = [
    ['', [['Portal', 'portal']]],
    ['REPORT', [['ROAR', 'roar'], ['GROC', 'groc']]],
    ['ESTATE', [['Assets', 'assets'], ['Landscape', 'landscape']]],
    ['GOVERN', [['Registers', 'registers', '2'], ['POA&M', 'poam', '1', 'red'], ['Control Baseline', 'controls'], ['Decisions', 'decisions', '1'], ['Third-Party Risk', 'tprm'], ['Threats', 'threats']]],
    ['RESPOND', [['Incident Response', 'incidents']]],
    ['TRUST', [['TrustSignals', 'trustsignals'], ['Audit Trail', 'audit']]],
  ];
  const mark = () => {
    const el = s('svg', { viewBox: '0 0 760 1028', class: 'mark' });
    el.append(s('path', { d: LOGO.echoLight, fill: '#9c9b9c', 'fill-rule': 'evenodd' }), s('path', { d: LOGO.echoDark, fill: '#666668', 'fill-rule': 'evenodd' }), s('path', { d: LOGO.three, fill: '#0bb8f7', 'fill-rule': 'evenodd' }));
    return el;
  };

  function appWindow({ x, y, route, active, crumb = 'Client workspace' }) {
    const navEls = {};
    const side = h('div', { class: 'side' },
      h('div', { class: 'brandrow' }, mark(), 'Client Vision'),
      h('div', { class: 'search' }, 'Search or jump…'),
      NAV.map(([head, items]) => [head ? h('div', { class: 'navh' }, head) : null,
        items.map(([label, id, ct, red]) => (navEls[id] = h('div', { class: 'nav' + (id === active ? ' on' : '') }, h('i', { class: 'ic' }), label, ct ? h('span', { class: 'ct' + (red ? ' red' : '') }, ct) : null)))]));
    const content = h('div', { class: 'content' });
    const el = h('div', { class: 'win', style: `left:${x}px;top:${y}px` },
      h('div', { class: 'chrome' }, h('div', { class: 'dots' }, h('i'), h('i'), h('i')), h('div', { class: 'url' }, 'client-vision.3hue.net/', h('b', {}, route))),
      h('div', { class: 'shell' }, side, h('div', { class: 'main' },
        h('div', { class: 'topbar' }, h('span', { class: 'crumb' }, h('b', {}, 'Big Venture Incorporated'), ' · ' + crumb), h('span', { style: 'flex:1' }), h('span', { class: 'pill' }, h('span', { class: 'dot' }), 'Demo data'), h('span', { class: 'pill' }, 'Big Venture Incorporated ▾')),
        content)));
    return { el, content, navEls, x, y, w: 1600, h: 1000 };
  }
  const card = (x, y, w, hh, ...kids) => h('div', { class: 'card', style: `left:${x}px;top:${y}px;width:${w}px;height:${hh}px` }, ...kids);
  const at = (x, y, w, css = '', ...kids) => h('div', { class: 'abs', style: `left:${x}px;top:${y}px;${w ? `width:${w}px;` : ''}${css}` }, ...kids);

  // ring gauge (circle) returns {el, arc, num}
  function ring(size, stroke, color, track = '#e6ebf2') {
    const r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const arc = s('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: color, 'stroke-width': stroke, 'stroke-linecap': 'round', 'stroke-dasharray': c, 'stroke-dashoffset': c, transform: `rotate(-90 ${size / 2} ${size / 2})` });
    const el = s('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` }, s('circle', { cx: size / 2, cy: size / 2, r, fill: 'none', stroke: track, 'stroke-width': stroke }), arc);
    return { el, arc, c };
  }

  /* ------------------------------ PORTAL ------------------------------ */
  function portal(x, y) {
    const w = appWindow({ x, y, route: 'portal', active: 'portal', crumb: 'Client workspace' });
    const r = {};
    const hero = h('div', { class: 'abs', style: 'left:0;top:0;width:1304px;height:318px;border-radius:16px;overflow:hidden;background:linear-gradient(125deg,#0a2350 0%,#0b3a7e 55%,#0a58a8 100%);color:#fff' });
    hero.append(h('div', { class: 'abs', style: 'inset:0;background-image:radial-gradient(#ffffff22 1.2px,transparent 1.4px);background-size:22px 22px;opacity:.7' }));
    hero.append(at(34, 28, 900, 'font:600 12px var(--mono);letter-spacing:.14em;color:#9fd8f5', 'BIG-VENTURE-INCORPORATED-DEM.ROAR.AIVRIC.COM'));
    hero.append(at(34, 52, 900, 'font:700 38px var(--ui);letter-spacing:-.02em', 'Welcome back'));
    hero.append(at(34, 102, 1000, 'font:500 14px var(--ui);color:#c9e6f7', 'Big Venture Incorporated · Energy · sample data · scan of Sep 19, 2026 · ', (r.res = h('b', {}, '642')), ' resources'));
    hero.append(at(34, 134, 1000, 'font:600 19px var(--ui)', '1 deficiency has aged past 90 days, and 1 treatment is waiting on a decision.'));
    const g = ring(78, 8, '#ffffff', '#ffffff30'); r.heroRing = g;
    const gradeB = at(0, 0, 78, 'height:78px;display:grid;place-items:center;font:700 20px var(--ui)', 'B−');
    const post = at(34, 180, 300, '', at(0, 0, 78, 'height:78px', g.el, gradeB),
      at(96, 4, 200, 'font:700 10.5px var(--ui);letter-spacing:.14em;color:#9fd8f5', 'POSTURE'),
      at(96, 20, 220, 'font:700 38px var(--ui)', (r.post = h('span', {}, '71')), h('span', { style: 'font-size:17px;color:#c9e6f7' }, ' / 100')),
      at(96, 66, 220, 'font:500 12px var(--ui);color:#c9e6f7', 'grade B− · ▲ 1 vs last scan'));
    r.postBox = post; hero.append(post);
    const stat = (xx, k, v, sub) => { const n = h('span', {}, v); hero.append(at(xx, 184, 260, '', at(0, 0, 260, 'font:700 10.5px var(--ui);letter-spacing:.14em;color:#9fd8f5', k), at(0, 16, 260, 'font:700 38px var(--ui);font-variant-numeric:tabular-nums', n), at(0, 62, 260, 'font:500 12px var(--ui);color:#c9e6f7', sub))); return n; };
    r.find = stat(390, 'OPEN FINDINGS', '629', '▼ 25 vs last scan');
    r.poam = stat(660, 'OPEN POA&M', '9', '1 past 90 days');
    r.base = stat(930, 'BASELINE IMPLEMENTED', '70%', '23 applicable · 2 entities');
    // severity distribution bar
    const bar = at(34, 278, 1236, 'height:10px;border-radius:5px;overflow:hidden;display:flex;background:#ffffff22');
    r.sev = [['#ec835a', 293], ['#fab219', 270], ['#0ca30c', 66]].map(([c, n]) => { const i = h('i', { style: `display:block;height:100%;background:${c};width:${(n / 629) * 100}%;transform-origin:left;` }); bar.append(i); return i; });
    hero.append(bar);
    hero.append(at(34, 294, 900, 'font:500 11.5px var(--ui);color:#c9e6f7', '0 critical · 293 high · 270 medium · 66 low'));
    w.content.append(hero); r.hero = hero;

    // queue
    w.content.append(at(0, 344, 400, '', h('span', { class: 'k' }, 'YOUR QUEUE'), h('span', { class: 'sub', style: 'margin-left:14px' }, 'Ranked by severity, then volume')));
    const Q = [['1', 'POA&M past 90 days', 'crit', 'CRITICAL', 'Open deficiencies first noted more than 90 days ago', '#d03b3b'],
      ['9', 'Open POA&M items', 'high', 'HIGH', 'of 10 tracked · 5 aging past 30 days', '#ec835a'],
      ['1', 'Treatments awaiting a decision', 'med', 'ATTENTION', 'Proposed in CloudSignals, waiting on a choice here', '#fab219'],
      ['2', 'Security exceptions in force', 'info', 'STANDING', 'Risk carried knowingly — review before each expires', '#0077ad']];
    r.queue = Q.map(([n, t, cls, tg, sub, col], i) => {
      const c = card(0, 374 + i * 104, 900, 90,
        at(0, 0, 5, `height:90px;background:${col};border-radius:14px 0 0 14px`),
        at(28, 18, 60, `font:700 34px var(--ui);color:${col}`, n),
        at(84, 20, 700, 'font:600 17px var(--ui)', t, ' ', h('span', { class: 'tag ' + cls, style: 'margin-left:8px' }, tg)),
        at(84, 50, 700, 'font:500 13px var(--ui);color:var(--mute)', sub),
        at(860, 32, 20, 'font:600 18px var(--ui);color:var(--mute)', '→'));
      w.content.append(c); return c;
    });
    // right column
    const setup = card(924, 344, 380, 250, at(22, 20, 340, '', h('span', { class: 'k' }, 'FINISH WORKSPACE SETUP'), h('span', { class: 'k', style: 'float:right' }, '2/4')),
      ...[['Connect CloudSignals', 'Simulated connector active', 1], ['Run first scan', 'Sep 19 · 642 resources', 1], ['Invite your team', '0 members', 0], ['Generate first ROAR snapshot', 'Freeze one from any ROAR page', 0]].map(([a, b, ok], i) =>
        at(22, 58 + i * 46, 340, '', h('span', { style: `display:inline-block;width:16px;height:16px;border-radius:50%;vertical-align:-3px;margin-right:10px;${ok ? 'background:#17a34a' : 'border:2px solid #cbd5e1'}` }), h('b', { style: 'font:600 13.5px var(--ui)' }, a), h('div', { style: 'font:500 11.5px var(--ui);color:var(--mute);margin-left:26px' }, b))));
    const expo = card(924, 612, 380, 228, at(22, 20, 340, '', h('span', { class: 'k' }, 'EXPOSURE BY BUSINESS ENTITY')),
      ...[['Platform', '5 open · 73% implemented', 73], ['Corporate', '4 open · 67% implemented', 67]].map(([a, b, p], i) =>
        at(22, 60 + i * 76, 336, '', h('div', { style: 'font:600 14px var(--ui)' }, a, h('span', { style: 'float:right;font:500 12px var(--ui);color:var(--mute)' }, b)),
          h('div', { style: 'margin-top:10px;height:8px;border-radius:4px;background:#edf1f6;overflow:hidden' }, h('i', { style: `display:block;height:100%;width:${p}%;background:linear-gradient(90deg,#ec835a,#fab219)` })))));
    w.content.append(setup, expo);
    return { ...w, r };
  }

  /* ------------------------------ POA&M ------------------------------ */
  const POAM = [
    ['POAM.2026.007', 'Admin API reachable without IP allowlisting', 'Platform', 'HIGH', 'high', 'In remediation', 95, 'Platform Eng'],
    ['POAM.2026.001', 'MFA not enforced for third-party contractor accounts', 'Corporate', 'HIGH', 'high', 'In remediation', 70, 'Identity Team'],
    ['POAM.2026.003', 'S3 buckets without default encryption in staging', 'Platform', 'HIGH', 'high', 'Assigned', 60, 'Cloud Ops'],
    ['POAM.2026.010', 'Incident-response contact tree outdated', 'Corporate', 'MODERATE', 'med', 'Assigned', 53, 'Security Office'],
    ['POAM.2026.002', 'Endpoint backup agent missing on finance workstations', 'Corporate', 'MODERATE', 'med', 'Assigned', 45, 'IT Services'],
    ['POAM.2026.005', 'Container images not scanned before deploy', 'Platform', 'HIGH', 'high', 'Assigned', 35, 'DevSecOps'],
  ];
  function poam(x, y) {
    const w = appWindow({ x, y, route: 'poam', active: 'poam', crumb: 'Govern' });
    const r = {};
    w.content.append(at(0, 0, 900, '', h('div', { class: 'eyebrow' }, 'CLIENT VISION · POA&M'), h('div', { class: 'h1' }, 'Plan of Action & Milestones'),
      h('div', { class: 'lede' }, 'The official record of pending remediation — scan-derived and manually-entered findings, de-duplicated to one master per deficiency with its assessment history.')));
    [['9', 'OPEN POA&M ITEMS', '10 total incl. closed'], ['4', 'CRITICAL / HIGH (OPEN)', '0 critical · 4 high'], ['1', 'PAST 90 DAYS', 'oldest 95 days open'], ['2', 'BUSINESS ENTITIES', 'with tracked findings']].forEach(([n, k, sub], i) =>
      w.content.append(card(i * 332, 150, 308, 118, at(22, 18, 260, '', h('div', { class: 'big' }, n)), at(22, 66, 270, '', h('div', { class: 'k' }, k)), at(22, 86, 270, '', h('div', { class: 'sub' }, sub)))));
    const reg = card(0, 292, 1304, 560); w.content.append(reg); r.reg = reg;
    reg.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'REGISTER')), at(1060, 14, 220, 'text-align:right', h('span', { class: 'pill' }, 'CSV'), ' ', h('span', { class: 'pill' }, 'Excel')));
    const cols = [[24, 'POA&M ID'], [180, 'DEFICIENCY'], [640, 'ENTITY'], [760, 'SEVERITY'], [890, 'LIFECYCLE'], [1040, 'AGE · 90-DAY SLA']];
    reg.append(at(0, 58, 1304, 'height:36px;background:#f7f9fb;border-top:1px solid var(--line);border-bottom:1px solid var(--line)', ...cols.map(([cx, t]) => at(cx, 11, 300, '', h('span', { class: 'k', style: 'font-size:10px' }, t)))));
    r.rows = POAM.map(([id, def, ent, sev, cls, life, age, owner], i) => {
      const bar = h('i', { style: `display:block;height:100%;width:${Math.min(age / 120, 1) * 100}%;border-radius:4px;background:${age > 90 ? 'var(--crit)' : age > 30 ? 'var(--high)' : 'var(--med)'};transform-origin:left` });
      const lifeTag = h('span', { class: 'tag ' + (life === 'In remediation' ? 'info' : 'gray') }, life);
      const row = at(0, 94 + i * 76, 1304, 'height:76px;border-bottom:1px solid var(--line)',
        at(24, 28, 150, 'font:600 12.5px var(--mono);color:var(--accent-text)', id),
        at(180, 18, 440, 'font:600 15px var(--ui)', def), at(180, 42, 440, 'font:500 12px var(--ui);color:var(--mute)', 'Owner · ' + owner),
        at(640, 28, 110, 'font:500 13.5px var(--ui);color:var(--ink-2)', ent),
        at(760, 26, 120, '', h('span', { class: 'tag ' + cls }, sev)),
        at(890, 26, 140, '', lifeTag),
        at(1040, 22, 200, 'height:8px;top:34px;border-radius:4px;background:#edf1f6', bar, at(150, -6, 2, 'height:20px;background:#0f172a55')),
        at(1250, 26, 50, `font:700 14px var(--ui);color:${age > 90 ? 'var(--crit-t)' : 'var(--ink)'};text-align:right`, age + 'd'));
      reg.append(row); return { row, bar, lifeTag, age };
    });
    return { ...w, r };
  }

  /* ------------------------------ ROAR ------------------------------ */
  function roar(x, y) {
    const w = appWindow({ x, y, route: 'roar', active: 'roar', crumb: 'Report' });
    const r = {};
    const secs = ['Executive summary', 'Scope & methodology', 'Risk landscape', 'Findings by provider', 'Findings index', 'Risk analysis', 'Opportunity analysis', 'Remediation roadmap', 'Trends', 'Appendix'];
    w.content.append(card(0, 0, 236, 470, at(18, 18, 200, '', h('span', { class: 'k' }, 'ROAR · REPORT SECTIONS')),
      ...secs.map((t, i) => at(12, 50 + i * 40, 212, `height:32px;border-radius:8px;${i === 0 ? 'background:#e6f6fd;' : ''}font:${i === 0 ? 600 : 500} 13px/32px var(--ui);color:${i === 0 ? 'var(--accent-text)' : 'var(--ink-2)'};padding-left:10px`, h('span', { style: 'font:500 11px var(--mono);color:var(--mute);margin-right:10px' }, String(i + 1).padStart(2, '0')), t))));
    const X0 = 262;
    w.content.append(at(X0, 0, 1000, '', h('div', { class: 'eyebrow' }, 'ROAR — RISK & OPPORTUNITIES ASSESSMENT REPORT'), h('div', { class: 'h1' }, 'Executive summary'),
      h('div', { class: 'sub', style: 'font-size:13.5px' }, 'Big Venture Incorporated · scan of Sep 19, 2026 · 642 of 662 resources · CloudSignals · Prowler-based engine + AI correlation')));
    // gauge
    const gc = card(X0, 108, 330, 330); w.content.append(gc);
    gc.append(at(22, 20, 280, '', h('span', { class: 'k' }, 'SECURITY POSTURE')));
    const R = 108, C = Math.PI * R;
    const arc = s('path', { d: `M ${165 - R} 190 A ${R} ${R} 0 0 1 ${165 + R} 190`, fill: 'none', stroke: 'url(#gg)', 'stroke-width': 22, 'stroke-linecap': 'round', 'stroke-dasharray': C, 'stroke-dashoffset': C });
    const gsv = s('svg', { width: 330, height: 220, viewBox: '0 0 330 220', style: 'position:absolute;left:0;top:44px' },
      s('defs', {}, s('linearGradient', { id: 'gg', x1: 0, x2: 1 }, s('stop', { offset: 0, 'stop-color': '#ec835a' }), s('stop', { offset: .55, 'stop-color': '#fab219' }), s('stop', { offset: 1, 'stop-color': '#0ca30c' }))),
      s('path', { d: `M ${165 - R} 190 A ${R} ${R} 0 0 1 ${165 + R} 190`, fill: 'none', stroke: '#edf1f6', 'stroke-width': 22, 'stroke-linecap': 'round' }), arc);
    gc.append(gsv); r.gArc = arc; r.gC = C;
    gc.append(at(0, 170, 330, 'text-align:center', (r.gNum = h('div', { style: 'font:800 64px/1 var(--ui);letter-spacing:-.03em;font-variant-numeric:tabular-nums' }, '71')), h('div', { class: 'k', style: 'margin-top:6px' }, 'OF 100 · GRADE B−')));
    gc.append(at(22, 272, 290, 'font:500 12px/1.45 var(--ui);color:var(--mute)', 'Severity-weighted pass ratio across ', h('b', { style: 'color:var(--ink)' }, (r.checks = h('span', {}, '2,835'))), ' checks — one formula, every view.'));
    // stat cards
    const st = [['OPEN FINDINGS', '629', '↓ 25 vs last scan', 'var(--good)'], ['CRITICAL', '0', '± 0 vs last scan', 'var(--mute)'], ['SCAN COVERAGE', '97.0%', '642 of 662 resources', 'var(--mute)'], ['MTTR', '6d', '↓ 0.3d · 30d', 'var(--good)']];
    r.stats = st.map(([k, v, sub, col], i) => { const c = card(X0 + 350 + (i % 2) * 176, 108 + Math.floor(i / 2) * 110, 162, 96, at(16, 14, 140, '', h('span', { class: 'k' }, k)), at(16, 34, 140, 'font:700 28px var(--ui);font-variant-numeric:tabular-nums', v), at(16, 70, 150, `font:600 11.5px var(--ui);color:${col}`, sub)); w.content.append(c); return c; });
    // trend
    const tc = card(X0 + 350, 328, 692, 110 + 0); // placeholder replaced below
    tc.style.left = X0 + 702 + 'px'; tc.style.top = '108px'; tc.style.width = '340px'; tc.style.height = '330px';
    tc.append(at(18, 18, 300, '', h('span', { class: 'k' }, 'POSTURE TREND'), h('span', { class: 'sub', style: 'float:right' }, 'last 6 scans')));
    const pts = [[0, 64], [1, 65.5], [2, 66.2], [3, 68.4], [4, 70], [5, 71]];
    const px = (i) => 34 + i * 56, py = (v) => 250 - (v - 58) * 12;
    const grid = [60, 65, 70, 75].map((v) => s('g', {}, s('line', { x1: 30, x2: 320, y1: py(v), y2: py(v), stroke: '#edf1f6' }), s('text', { x: 6, y: py(v) + 4, 'font-size': 11, fill: '#98a5b8', 'font-family': 'Inter' }, v)));
    const d = pts.map(([i, v], k) => `${k ? 'L' : 'M'}${px(i)} ${py(v)}`).join(' ');
    const line = s('path', { d, fill: 'none', stroke: '#00aeef', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': 400, 'stroke-dashoffset': 400 });
    const fill = s('path', { d: d + ` L ${px(5)} 250 L ${px(0)} 250 Z`, fill: '#00aeef18' });
    const dot = s('circle', { cx: px(5), cy: py(71), r: 7, fill: '#fff', stroke: '#00aeef', 'stroke-width': 3.5 });
    const labels = ['Aug 15', 'Aug 22', 'Aug 29', 'Sep 5', 'Sep 12', 'Sep 19'].map((t, i) => s('text', { x: px(i), y: 276, 'font-size': 10.5, fill: '#98a5b8', 'text-anchor': 'middle', 'font-family': 'Inter' }, t));
    tc.append(s('svg', { width: 340, height: 290, viewBox: '0 0 340 290', style: 'position:absolute;left:0;top:36px' }, grid, fill, line, dot, labels));
    w.content.append(tc); r.tLine = line; r.tFill = fill; r.tDot = dot;
    // top risks with L x I
    const RISKS = [['Privileged cloud credentials without rotation', 'AWS Production', 'CRITICAL', 'crit', 4, 5], ['Publicly reachable storage with sensitive data', 'Azure Production', 'HIGH', 'high', 4, 4], ['CI/CD repos without branch protection', 'AWS Production', 'HIGH', 'high', 4, 4], ['Management ports open to the internet', 'Azure Production', 'MEDIUM', 'med', 3, 3], ['Audit logging disabled in secondary regions', 'AWS Production', 'MEDIUM', 'med', 2, 4]];
    const rc = card(X0, 458, 700, 392); w.content.append(rc);
    rc.append(at(22, 18, 400, '', h('span', { class: 'k' }, 'TOP RISKS'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'likelihood × impact, banded 1–25')));
    r.risks = RISKS.map(([t, p, b, cls, l, i], k) => { const row = at(22, 54 + k * 66, 656, 'height:60px;border-top:1px solid var(--line)',
      at(0, 12, 30, 'font:700 15px var(--ui);color:var(--mute)', String(k + 1)), at(30, 10, 420, 'font:600 14px var(--ui)', t), at(30, 32, 300, 'font:500 12px var(--ui);color:var(--mute)', p),
      at(468, 18, 100, '', h('span', { class: 'tag ' + cls }, b)), at(570, 14, 90, 'text-align:right;font:800 22px var(--ui);font-variant-numeric:tabular-nums', String(l * i)), at(570, 40, 90, 'text-align:right;font:500 10.5px var(--ui);color:var(--mute)', `L${l} × I${i}`)); rc.append(row); return row; });
    // heat matrix
    const hm = card(X0 + 720, 458, 322, 392); w.content.append(hm);
    hm.append(at(20, 18, 280, '', h('span', { class: 'k' }, 'RISK MATRIX')));
    const cell = 50, ox = 44, oy = 56;
    const heat = (l, i) => { const v = l * i; return v >= 20 ? '#f6c9c9' : v >= 12 ? '#fbd9c9' : v >= 6 ? '#fdeebf' : '#dcf2dc'; };
    for (let li = 1; li <= 5; li++) for (let ii = 1; ii <= 5; ii++) hm.append(at(ox + (ii - 1) * cell, oy + (5 - li) * cell, cell - 4, `height:${cell - 4}px;border-radius:7px;background:${heat(li, ii)}`));
    hm.append(at(ox, oy + 5 * cell + 4, 250, 'font:600 10px var(--ui);letter-spacing:.12em;color:var(--mute);text-align:center', 'IMPACT →'));
    hm.append(at(4, oy + 110, 30, 'font:600 10px var(--ui);letter-spacing:.12em;color:var(--mute);transform:rotate(-90deg);transform-origin:left top;white-space:nowrap;top:' + (oy + 170) + 'px', 'LIKELIHOOD →'));
    const offs = [[0, 0], [-9, -8], [9, 8], [0, 0], [0, 0]];
    r.pucks = RISKS.map(([, , , cls, l, i], k) => { const c = cls === 'crit' ? '#d03b3b' : cls === 'high' ? '#ec835a' : '#e0a100';
      const p = at(ox + (i - 1) * cell + cell / 2 - 15 + offs[k][0], oy + (5 - l) * cell + cell / 2 - 15 + offs[k][1], 26, `height:26px;border-radius:50%;background:${c};color:#fff;font:700 12px/26px var(--ui);text-align:center;box-shadow:0 0 0 3px #fff`, String(k + 1)); hm.append(p); return p; });
    return { ...w, r };
  }

  /* ------------------------------ GROC ------------------------------ */
  function groc(x, y) {
    const w = appWindow({ x, y, route: 'groc', active: 'groc', crumb: 'Report' });
    const r = {};
    w.content.append(at(0, 0, 1000, '', h('div', { class: 'eyebrow' }, 'GROC · 00 · EXECUTIVE BRIEFING'), h('div', { class: 'h1' }, 'Governance, Risk, Operations & Compliance'),
      h('div', { class: 'lede' }, 'The ISMS-level report — how the security and privacy management system is governed, how risk is being worked, whether operations can respond, and where compliance stands.'),
      h('div', { style: 'margin-top:12px;display:flex;gap:8px' }, ...['ISP', 'vCISO', 'RMP', 'CIRP', 'VCP'].map((t) => h('span', { class: 'tag info', style: 'height:24px;font-size:11px' }, t)))));
    const Q = [['G', 'Governance', ['12 controls governed across 2 entities', '70% implemented (applicable assignments)'], '#0077ad'],
      ['R', 'Risk', ['9 open POA&M findings of 10', '5 register risks · 2 treatments mirrored'], '#ec835a'],
      ['O', 'Operations', ['0 open incidents of 1 declared', '9 immutable audit events'], '#17a34a'],
      ['C', 'Compliance', ['SOC 2: 11 of 12 controls mapped', '2 standing exceptions'], '#7b2cbf']];
    r.q = Q.map(([L1, t, lines, col], i) => { const c = card((i % 2) * 330, 176 + Math.floor(i / 2) * 200, 314, 184,
      at(22, 20, 48, `height:48px;border-radius:12px;background:${col}14;color:${col};font:800 24px/48px var(--display);text-align:center`, L1),
      at(84, 30, 220, 'font:700 19px var(--ui)', t),
      ...lines.map((ln, j) => at(22, 92 + j * 36, 280, 'font:500 13.5px/1.35 var(--ui);color:var(--ink-2)', h('span', { style: `display:inline-block;width:6px;height:6px;border-radius:50%;background:${col};margin-right:9px;vertical-align:2px` }), ln)));
      w.content.append(c); return c; });
    // compliance snapshot bars (ROAR compliance snapshot, pass rate by framework)
    const F = [['PCI DSS 4.0', 64], ['NIST CSF 2.0', 60], ['SOC 2', 59], ['CIS Azure 3.0', 56], ['NIS2', 52], ['ISO 27001:2022', 37], ['GDPR', 34], ['CIS AWS 2.0', 32]];
    const fc = card(680, 176, 624, 384); w.content.append(fc);
    fc.append(at(24, 20, 500, '', h('span', { class: 'k' }, 'COMPLIANCE SNAPSHOT'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'pass rate by framework')));
    r.fw = F.map(([n, p], i) => { const bar = h('i', { style: `display:block;height:100%;width:${p}%;border-radius:6px;background:linear-gradient(90deg,#0579aa,#00aeef);transform-origin:left` });
      const pct = h('span', {}, p + '%');
      const row = at(24, 58 + i * 39, 576, 'height:34px', at(0, 7, 150, 'font:600 13.5px var(--ui)', n), at(160, 10, 350, 'height:14px;border-radius:7px;background:#edf1f6;overflow:hidden', bar), at(520, 5, 56, 'text-align:right;font:700 15px var(--ui);font-variant-numeric:tabular-nums', pct));
      fc.append(row); return { row, bar, pct, p }; });
    const sc = card(680, 578, 624, 272); w.content.append(sc);
    sc.append(at(24, 20, 560, '', h('span', { class: 'k' }, 'ONE SET OF NUMBERS')), at(24, 50, 576, 'font:500 14.5px/1.55 var(--ui);color:var(--ink-2)', 'GROC reports the management system. ROAR reports the cyber estate. Figures shared between them are derived from the same governed stores — never re-authored — so the two reports can overlap but never disagree.'));
    r.sources = ['CloudSignals', 'Registers', 'Control Baseline', 'POA&M', 'Audit Trail'].map((t, i) => { const p = at(24 + i * 116, 190, 108, 'height:52px;border-radius:10px;border:1px solid var(--line);background:#f7f9fb;font:600 12px/52px var(--ui);text-align:center;color:var(--ink-2)', t); sc.append(p); return p; });
    return { ...w, r };
  }

  /* ------------------------------ THREATS ------------------------------ */
  function threats(x, y) {
    const w = appWindow({ x, y, route: 'threats', active: 'threats', crumb: 'Govern' });
    const r = {};
    w.content.append(at(0, 0, 760, '', h('div', { class: 'eyebrow' }, 'CLIENT VISION · THREAT LANDSCAPE'), h('div', { class: 'h1' }, 'Threat Landscape'),
      h('div', { class: 'lede', style: 'max-width:700px' }, 'External threat intelligence from public, authoritative sources — triaged for this workspace and linkable to register risks as external threat context.')));
    [['200', 'MONITORED ITEMS', 'most recent 200 shown'], ['31', 'ACTIVELY EXPLOITED', 'CISA KEV catalog entries']].forEach(([n, k, sub], i) => {
      const nEl = h('div', { class: 'big', style: i ? 'color:var(--crit-t)' : '' }, n);
      w.content.append(card(i * 372, 150, 356, 110, at(22, 16, 300, '', nEl), at(22, 62, 320, '', h('div', { class: 'k' }, k)), at(22, 80, 320, '', h('div', { class: 'sub' }, sub)))); if (i) r.kev = nEl; });
    const feed = card(0, 280, 728, 570); w.content.append(feed);
    feed.append(at(22, 20, 600, '', h('span', { class: 'k' }, 'MONITORED THREAT ITEMS'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'newest first')));
    const ITEMS = [['CISA KEV', 'Known exploited: privilege escalation in a cloud identity service', 'crit', 'EXPLOITED'],
      ['BLEEPINGCOMPUTER', 'Supply-chain attack injects malicious scripts into customer sites', 'high', 'NEW'],
      ['THE HACKER NEWS', 'Critical DNSSEC validator flaw allows RCE via a malicious zone', 'high', 'NEW'],
      ['BLEEPINGCOMPUTER', 'AI-assisted credential theft is scaling identity attacks', 'med', 'NEW'],
      ['CISA KEV', 'Known exploited: authentication bypass in a VPN appliance', 'crit', 'EXPLOITED']];
    r.items = ITEMS.map(([src, t, cls, tg], i) => { const it = at(22, 56 + i * 100, 684, 'height:88px;border:1px solid var(--line);border-radius:12px;background:#fff',
      at(18, 14, 400, 'font:700 10.5px var(--ui);letter-spacing:.12em;color:var(--mute)', src, h('span', { class: 'tag ' + cls, style: 'margin-left:10px;height:18px;font-size:9.5px' }, tg)),
      at(18, 36, 540, 'font:600 15px/1.3 var(--ui)', t), at(574, 30, 100, 'text-align:right', h('span', { class: 'pill', style: 'height:28px' }, '+ Link to risk'))); feed.append(it); return it; });
    // radar
    const rc = card(752, 150, 552, 700); w.content.append(rc);
    rc.append(at(24, 20, 500, '', h('span', { class: 'k' }, 'TOP POTENTIAL THREATS'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'blast range from your real inventory')));
    const cx = 276, cy = 350, RR = 240;
    const sv = s('svg', { width: 552, height: 640, viewBox: '0 0 552 640', style: 'position:absolute;left:0;top:40px' });
    sv.append(s('defs', {}, s('radialGradient', { id: 'sw', cx: 0, cy: 0.5, r: 1 }, s('stop', { offset: 0, 'stop-color': '#00aeef', 'stop-opacity': .0 }), s('stop', { offset: 1, 'stop-color': '#00aeef', 'stop-opacity': .28 })),
      s('linearGradient', { id: 'swl', x1: 0, y1: 0, x2: 1, y2: 0 }, s('stop', { offset: 0, 'stop-color': '#00aeef', 'stop-opacity': 0 }), s('stop', { offset: 1, 'stop-color': '#00aeef', 'stop-opacity': .35 }))));
    // severity bands: alternating tinted rings so the radar's structure reads at a glance
    [[1, '#e4f1fa'], [.75, '#eff7fc'], [.5, '#e4f1fa'], [.25, '#eff7fc']].forEach(([f, fill]) => sv.append(s('circle', { cx, cy: cy - 40, r: RR * f, fill, stroke: '#a9c4d8', 'stroke-width': 2 })));
    [0, 45, 90, 135].forEach((a) => { const rad = a * Math.PI / 180; sv.append(s('line', { x1: cx - Math.cos(rad) * RR, y1: cy - 40 - Math.sin(rad) * RR, x2: cx + Math.cos(rad) * RR, y2: cy - 40 + Math.sin(rad) * RR, stroke: '#bfd3e3', 'stroke-width': 1.5 })); });
    [[.25, 'CRITICAL'], [.5, 'HIGH'], [.75, 'MEDIUM'], [1, 'LOW']].forEach(([f, lb]) => sv.append(s('text', { x: cx + 6, y: cy - 40 - RR * f + 15, 'font-size': 9.5, 'font-weight': 700, 'letter-spacing': '.12em', fill: '#6f86a0', 'font-family': 'Inter' }, lb)));
    [['IDENTITY & ACCESS', 0, -RR - 18], ['DATA PROTECTION', RR + 4, 0], ['SUPPLY CHAIN', 0, RR + 30], ['EXPOSED SERVICES', -RR - 4, 0]].forEach(([t, dx, dy], i) =>
      sv.append(s('text', { x: cx + dx, y: cy - 40 + dy, 'font-size': 12.5, 'font-weight': 700, 'letter-spacing': '.12em', fill: '#3f4f66', 'text-anchor': i === 1 ? 'end' : i === 3 ? 'start' : 'middle', 'font-family': 'Inter', transform: i === 1 ? `rotate(90 ${cx + dx} ${cy - 40})` : i === 3 ? `rotate(-90 ${cx + dx} ${cy - 40})` : '' }, t)));
    const sweep = s('g', {}, s('path', { d: `M ${cx} ${cy - 40} L ${cx + RR} ${cy - 40} A ${RR} ${RR} 0 0 0 ${cx + RR * Math.cos(-0.7)} ${cy - 40 + RR * Math.sin(-0.7)} Z`, fill: 'url(#swl)' }), s('line', { x1: cx, y1: cy - 40, x2: cx + RR, y2: cy - 40, stroke: '#00aeef', 'stroke-width': 2.5 }));
    sv.append(sweep); r.sweep = sweep; r.rc = [cx, cy - 40];
    const P = [[-60, .35, '#d03b3b', 12], [-20, .55, '#ec835a', 10], [30, .7, '#fab219', 9], [80, .45, '#ec835a', 10], [140, .8, '#fab219', 8], [200, .3, '#d03b3b', 12], [250, .62, '#ec835a', 9], [300, .5, '#fab219', 9], [330, .85, '#0ca30c', 7], [110, .22, '#d03b3b', 11]];
    r.pucks = P.map(([a, f, c, rr]) => { const rad = a * Math.PI / 180; const px = cx + Math.cos(rad) * RR * f, py = cy - 40 + Math.sin(rad) * RR * f;
      const halo = s('circle', { cx: px, cy: py, r: rr, fill: c, opacity: 0 }); const dot = s('circle', { cx: px, cy: py, r: rr * .62, fill: c, stroke: '#fff', 'stroke-width': 2.5 });
      sv.append(halo, dot); return { a: ((a % 360) + 360) % 360, halo, dot, rr }; });
    sv.append(s('circle', { cx, cy: cy - 40, r: 34, fill: '#fff', stroke: '#a9c4d8', 'stroke-width': 2.5 }), s('text', { x: cx, y: cy - 38, 'font-size': 18, 'font-weight': 800, fill: '#0f172a', 'text-anchor': 'middle', 'font-family': 'Inter' }, '642'), s('text', { x: cx, y: cy - 22, 'font-size': 8.5, 'font-weight': 700, 'letter-spacing': '.14em', fill: '#5d6e86', 'text-anchor': 'middle', 'font-family': 'Inter' }, 'RESOURCES'));
    rc.append(sv);
    return { ...w, r };
  }

  /* ------------------------------ DECISIONS ------------------------------ */
  function decisions(x, y) {
    const w = appWindow({ x, y, route: 'decisions', active: 'decisions', crumb: 'Govern' });
    const r = {};
    w.content.append(at(0, 0, 900, '', h('div', { class: 'eyebrow' }, 'CLIENT VISION · GOVERN'), h('div', { class: 'h1' }, 'Decisions'),
      h('div', { class: 'lede' }, 'Approvals and treatment choices waiting on your authority. Decisions are written back to CloudSignals — the system of record — and audited on both sides.')));
    [['2', 'SECURITY EXCEPTIONS', 'in force · review before expiry'], ['1', 'TREATMENTS TO CHOOSE', 'proposed by your analysts'], ['Full', 'YOUR AUTHORITY', 'decisions are audited on both sides']].forEach(([n, k, sub], i) =>
      w.content.append(card(i * 440, 140, 424, 110, at(22, 16, 300, '', h('div', { class: 'big' }, n)), at(22, 62, 380, '', h('div', { class: 'k' }, k)), at(22, 80, 380, '', h('div', { class: 'sub' }, sub)))));
    const dc = card(0, 272, 1304, 196); w.content.append(dc); r.dc = dc;
    dc.append(at(24, 20, 600, '', h('span', { class: 'k' }, 'RISK TREATMENTS AWAITING DECISION'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'from the register mirror · synced Sep 19')));
    dc.append(at(24, 58, 1256, 'height:112px;border:1px solid var(--line);border-radius:12px;background:#fbfdff',
      at(22, 20, 900, 'font:700 18px var(--ui)', 'Block public access org-wide and remediate ACL grants'),
      at(22, 50, 900, 'font:500 14px var(--ui);color:var(--ink-2)', 'Org-level public-access block plus a remediation sweep of existing grants.'),
      at(22, 76, 400, 'font:600 12px var(--ui);color:var(--mute)', 'Proposed by · Cloud Platform analyst'),
      (r.btn = at(1040, 36, 190, 'height:42px;border-radius:10px;background:#0579aa;color:#fff;font:600 14.5px/42px var(--ui);text-align:center', 'Choose treatment'))));
    // treatment options popover
    const opts = ['Mitigate', 'Accept', 'Transfer', 'Avoid'];
    r.pop = card(900, 400, 360, 250); r.pop.style.zIndex = 5; w.content.append(r.pop);
    r.pop.append(at(20, 16, 300, '', h('span', { class: 'k' }, 'CHOOSE A TREATMENT')));
    r.opts = opts.map((o, i) => { const e = at(14, 46 + i * 48, 332, `height:42px;border-radius:9px;font:600 15px/42px var(--ui);padding-left:16px;${i === 0 ? '' : 'color:var(--ink-2)'}`, o, h('span', { style: 'float:right;margin-right:14px;font:500 12px/42px var(--ui);color:var(--mute)' }, ['reduce the risk', 'carry it knowingly', 'insure or contract out', 'stop the activity'][i])); r.pop.append(e); return e; });
    // audit trail
    const au = card(0, 488, 1304, 362); w.content.append(au);
    au.append(at(24, 20, 700, '', h('span', { class: 'k' }, 'AUDIT TRAIL'), h('span', { class: 'sub', style: 'margin-left:12px' }, 'append-only · every decision recorded in both systems')));
    const EV = [['Treatment chosen · Mitigate', 'Block public access org-wide and remediate ACL grants', 'Risk owner', 'just now'],
      ['Decision written back', 'CloudSignals acknowledged the treatment', 'System', 'just now'],
      ['Exception reviewed', 'Legacy SFTP host · expires in 30 days', 'CISO', '2d ago'],
      ['Workspace entered', 'Provider access · audited', 'Provider', '4d ago']];
    r.events = EV.map(([a, b, who, when], i) => { const e = at(24, 58 + i * 72, 1256, 'height:64px;border-top:1px solid var(--line)',
      at(0, 16, 32, 'height:32px;border-radius:9px;background:#e6f6fd;display:grid;place-items:center', s('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: '#0077ad', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, s('rect', { x: 5, y: 11, width: 14, height: 10, rx: 2 }), s('path', { d: 'M8 11V7a4 4 0 0 1 8 0v4' }))),
      at(48, 12, 700, 'font:700 15px var(--ui)', a), at(48, 36, 800, 'font:500 13px var(--ui);color:var(--mute)', b),
      at(1000, 22, 256, 'text-align:right;font:500 13px var(--ui);color:var(--mute)', who + ' · ' + when)); au.append(e); return e; });
    return { ...w, r };
  }

  /* ------------------------------ TRUSTSIGNALS ------------------------------ */
  function trust(x, y) {
    const w = appWindow({ x, y, route: 'trustsignals', active: 'trustsignals', crumb: 'Trust' });
    const r = {};
    w.content.append(at(0, 0, 900, '', h('div', { class: 'eyebrow' }, 'CLIENT VISION · TRUST'), h('div', { class: 'h1' }, 'TrustSignals'),
      h('div', { class: 'lede' }, 'Publish a living, evidence-backed Trust Center for your customers — bands and coverage, never raw findings. Nothing else ever leaves the workspace.')));
    r.pub = at(1130, 20, 170, 'height:44px;border-radius:10px;background:#0579aa;color:#fff;font:700 15px/44px var(--ui);text-align:center', 'Publish');
    w.content.append(r.pub);
    const rd = card(0, 150, 520, 330); w.content.append(rd);
    rd.append(at(24, 20, 400, '', h('span', { class: 'k' }, 'PUBLISH READINESS')));
    r.checks = ['Trust profile saved', 'At least one artifact listed', 'Contact or request path set', 'Published'].map((t, i) => {
      const dot = h('span', { style: 'position:absolute;left:0;top:10px;width:22px;height:22px;border-radius:50%;border:2px solid #cbd5e1;background:#fff' });
      const st = h('span', { class: 'tag gray' }, 'open');
      const row = at(24, 58 + i * 64, 472, 'height:52px', dot, at(36, 12, 300, 'font:600 15px var(--ui)', t), at(372, 14, 100, 'text-align:right', st));
      rd.append(row); return { dot, st }; });
    const ar = card(0, 500, 520, 350); w.content.append(ar);
    ar.append(at(24, 20, 460, '', h('span', { class: 'k' }, 'TRUST ARTIFACT LIBRARY')), at(24, 48, 470, 'font:500 13px/1.5 var(--ui);color:var(--mute)', 'References only — documents stay in your SharePoint, Drive or URL.'));
    r.arts = [['SOC 2 Type II report', 'Gated — by request'], ['ISO 27001 certificate', 'Public — listed with link'], ['Penetration test summary', 'Gated — by request'], ['Data processing agreement', 'Public — listed with link']].map(([t, g], i) => {
      const e = at(24, 100 + i * 60, 472, 'height:50px;border:1px solid var(--line);border-radius:10px;background:#fbfdff', at(16, 14, 280, 'font:600 14px var(--ui)', t), at(300, 15, 160, 'text-align:right;font:600 11.5px var(--ui);color:var(--accent-text)', g)); ar.append(e); return e; });
    // public trust center preview (what customers see)
    const tc = card(544, 150, 760, 700); w.content.append(tc); r.tc = tc;
    tc.append(at(0, 0, 760, 'height:170px;border-radius:14px 14px 0 0;background:linear-gradient(118deg,#ffb36b 0%,#0039e6 62%,#031db0 100%);color:#fff',
      at(30, 26, 600, 'font:600 11px var(--mono);letter-spacing:.14em;opacity:.9', 'CLIENT-VISION.3HUE.NET/TRUST/BIG-VENTURE'),
      at(30, 52, 680, 'font:700 30px var(--display);letter-spacing:-.02em', 'Big Venture Incorporated Trust Center'),
      at(30, 100, 680, 'font:500 14.5px/1.5 var(--ui);opacity:.92', 'A living view of security, privacy, compliance and resilience posture — derived from live evidence.')));
    const BANDS = [['Security', 'Measured · continuously monitored'], ['Compliance', 'SOC 2 · ISO 27001 · PCI DSS'], ['Privacy & data', 'Approved commitments'], ['Resilience', 'Recovery posture from live estate'], ['AI governance', 'Declared use and review cadence']];
    r.bands = BANDS.map(([t, sub], i) => { const b = at(30, 196 + i * 92, 700, 'height:80px;border:1px solid var(--line);border-radius:12px;background:#fff',
      at(20, 16, 44, 'height:44px;border-radius:12px;background:#e6f6fd;display:grid;place-items:center', s('svg', { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: '#0077ad', 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, s('path', { d: 'M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z' }), s('path', { d: 'M9 12l2 2 4-4' }))),
      at(80, 16, 400, 'font:700 17px var(--ui)', t), at(80, 42, 480, 'font:500 13px var(--ui);color:var(--mute)', sub),
      at(560, 26, 120, 'text-align:right', h('span', { class: 'tag info', style: 'height:26px;font-size:11px' }, 'LIVE'))); tc.append(b); return b; });
    return { ...w, r };
  }

  window.UI = { appWindow, portal, poam, roar, groc, threats, decisions, trust, mark, POAM };
})();
