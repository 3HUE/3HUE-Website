/* chrome.js: theme, header, email-my-results. Loads on every page, including the Client Vision pages. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  /* ---------- theme ---------- */
  const root = document.documentElement;
  try { const t = localStorage.getItem('3hue-theme'); if (t === 'dark' || t === 'light') root.dataset.theme = t; } catch (e) {}
  const themeBtn = $('#themeBtn');
  const isDark = () => root.dataset.theme === 'dark'; // light is the default for everyone; the toggle persists the choice in localStorage
  const paintTheme = () => { if (!themeBtn) return; const d = isDark(); themeBtn.setAttribute('aria-label', d ? 'Switch to light mode' : 'Switch to dark mode'); themeBtn.dataset.mode = d ? 'dark' : 'light'; };
  if (themeBtn) themeBtn.addEventListener('click', () => { const next = isDark() ? 'light' : 'dark'; root.dataset.theme = next; try { localStorage.setItem('3hue-theme', next); } catch (e) {} paintTheme(); });
  paintTheme();

  /* ---------- header: menus, mobile panel, stuck state fallback ---------- */
  const top = $('.site-top');
  const menuBtns = $$('button.nav-link[aria-controls]');
  const closeMenus = (except) => menuBtns.forEach((b) => { if (b === except) return; b.setAttribute('aria-expanded', 'false'); const m = document.getElementById(b.getAttribute('aria-controls')); if (m) m.dataset.open = 'false'; });
  menuBtns.forEach((b) => {
    const m = document.getElementById(b.getAttribute('aria-controls'));
    b.addEventListener('click', () => { const open = b.getAttribute('aria-expanded') === 'true'; closeMenus(b); b.setAttribute('aria-expanded', String(!open)); if (m) m.dataset.open = String(!open); });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.site-top')) closeMenus(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenus(); if (top) top.dataset.mobile = 'closed'; const bg = $('#burger'); if (bg) bg.setAttribute('aria-expanded', 'false'); } });
  const burger = $('#burger');
  if (burger && top) burger.addEventListener('click', () => { const open = top.dataset.mobile === 'open'; top.dataset.mobile = open ? 'closed' : 'open'; burger.setAttribute('aria-expanded', String(!open)); if (open) closeMenus(); });
  const sentinel = $('#topSentinel');
  if (sentinel && top && 'IntersectionObserver' in window && !CSS.supports('container-type: scroll-state')) {
    new IntersectionObserver(([e]) => top.classList.toggle('is-stuck', !e.isIntersecting), { threshold: [1] }).observe(sentinel);
  } else if (sentinel && top) {
    new IntersectionObserver(([e]) => top.classList.toggle('is-stuck', !e.isIntersecting), { threshold: [1] }).observe(sentinel);
  }


  /* ---------- email my results ---------- */
  $$('form.results-form').forEach((f) => {
    const note = f.querySelector('.rf-note'), base = note ? note.textContent : '';
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (f.email.value || '').trim(), hp = f.querySelector('.hp');
      if (hp && hp.value) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { if (note) { note.textContent = 'Enter a work email address and try again.'; note.className = 'rf-note err'; } f.email.focus(); return; }
      const summary = (f.dataset.summary || '').split(',').map((s) => s.trim()).filter(Boolean).map((sel) => { const el = $(sel); return el ? el.textContent.trim().replace(/\s+/g, ' ') : ''; }).filter(Boolean).join(' · ');
      let saved = {}; try { Object.keys(localStorage).forEach((k) => { if (!/theme/.test(k)) saved[k] = localStorage.getItem(k); }); } catch (err) {}
      const payload = { email, page: f.dataset.page || document.title, url: location.href.split('#')[0], summary, saved, sentAt: new Date().toISOString() };
      const btn = f.querySelector('button[type="submit"]'); if (btn) btn.disabled = true;
      if (note) { note.textContent = 'Sending…'; note.className = 'rf-note'; }
      try {
        const r = await fetch('/api/results', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        if (note) { note.textContent = `Sent to ${email}. We reply within one business day if you asked a question.`; note.className = 'rf-note ok'; }
        f.reset();
      } catch (err) {
        const live = /^https?:\/\/(www\.)?3hue\.net/.test(location.origin);
        if (note) { note.textContent = live ? 'Could not send just now. Your result is below; copy it and email aramirez@3hue.net, or call (954) 738-4454.' : 'This preview is not connected to the mail handler yet; on 3hue.net this emails your result. Your result so far:'; note.className = 'rf-note err'; }
        let copy = f.querySelector('.rf-copy'); if (!copy) { copy = document.createElement('p'); copy.className = 'rf-copy'; f.append(copy); } copy.textContent = summary || 'No answers recorded yet.';
      } finally { if (btn) btn.disabled = false; }
    });
  });
})();

/* site-core.js: hero film and stage, counters, countdowns, copy buttons. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- hero stage: light planes over a city grid ---------- */
  const stage = $('#stage');
  const film = $('#heroFilm'), soundBtn = $('#soundBtn');
  if (film) {
    if (reduce) { film.removeAttribute('autoplay'); film.pause(); film.controls = true; }
    if (soundBtn) soundBtn.addEventListener('click', () => { const full = soundBtn.dataset.film; if (full) { film.pause(); film.removeAttribute('poster'); film.src = full; film.load(); } film.muted = false; film.loop = false; film.controls = true; film.play().catch(() => {}); soundBtn.hidden = true; });
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { if (film.loop && !reduce) { if (e.isIntersecting) film.play().catch(() => {}); else film.pause(); } }).observe(film);
  }
  if (stage && stage.querySelector('canvas')) {
    const cv = stage.querySelector('canvas'), ctx = cv.getContext('2d');
    let w = 0, h = 0, dpr = 1, raf = 0, visible = true, t0 = performance.now();
    const planes = [
      { x: .12, y: .34, wdt: .62, hgt: .09, skew: .22, hue: 'cyan', a: .16, spd: .11, ph: 0 },
      { x: .38, y: .48, wdt: .54, hgt: .07, skew: .26, hue: 'royal', a: .20, spd: .08, ph: 1.7 },
      { x: .02, y: .58, wdt: .70, hgt: .10, skew: .20, hue: 'cyan', a: .10, spd: .06, ph: 3.1 },
      { x: .50, y: .22, wdt: .46, hgt: .06, skew: .30, hue: 'amber', a: .12, spd: .09, ph: 4.4 },
      { x: .25, y: .70, wdt: .60, hgt: .08, skew: .18, hue: 'royal', a: .14, spd: .07, ph: 5.6 },
    ];
    const col = (hue, a) => hue === 'cyan' ? `rgba(0,174,239,${a})` : hue === 'amber' ? `rgba(255,179,107,${a})` : `rgba(0,57,230,${a})`;
    const size = () => { dpr = Math.min(window.devicePixelRatio || 1, 2); const r = stage.getBoundingClientRect(); w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height)); cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const draw = (now) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#0b1220'); bg.addColorStop(1, '#0e1a30'); ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
      // city grid in one-point perspective, below the horizon
      const hz = h * .46, vx = w * .62;
      ctx.strokeStyle = 'rgba(255,255,255,0.055)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -14; i <= 14; i++) { const bx = vx + i * (w * .11); ctx.moveTo(vx + (bx - vx) * .06, hz); ctx.lineTo(bx, h); }
      const scroll = reduce ? 0 : (t * 9) % 100;
      for (let k = 0; k < 12; k++) { const p = (k * 100 + scroll) / 1200; const y = hz + Math.pow(p, 2.1) * (h - hz); ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      // horizon glow
      const gl = ctx.createRadialGradient(w * .78, hz, 0, w * .78, hz, w * .55); gl.addColorStop(0, 'rgba(255,179,107,0.20)'); gl.addColorStop(.35, 'rgba(0,57,230,0.14)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, w, h);
      // light planes
      ctx.globalCompositeOperation = 'screen';
      planes.forEach((p) => {
        const drift = reduce ? 0 : Math.sin(t * p.spd + p.ph) * .05, bob = reduce ? 0 : Math.cos(t * p.spd * 1.3 + p.ph) * .015;
        const x0 = (p.x + drift) * w, y0 = (p.y + bob) * h, pw = p.wdt * w, ph = p.hgt * h, sk = p.skew * pw;
        const g = ctx.createLinearGradient(x0, y0, x0 + pw, y0); g.addColorStop(0, col(p.hue, 0)); g.addColorStop(.45, col(p.hue, p.a)); g.addColorStop(1, col(p.hue, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, y0 + ph); ctx.lineTo(x0 + sk, y0); ctx.lineTo(x0 + pw + sk, y0); ctx.lineTo(x0 + pw, y0 + ph); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = col(p.hue, p.a * .9); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0 + sk, y0); ctx.lineTo(x0 + pw + sk, y0); ctx.stroke();
      });
      // the cyan thread
      ctx.globalCompositeOperation = 'source-over';
      const y1 = h * .82, y2 = h * .40;
      ctx.beginPath(); ctx.moveTo(-10, y1); ctx.bezierCurveTo(w * .25, y1, w * .35, y2, w * .55, h * .47); ctx.bezierCurveTo(w * .72, h * .53, w * .80, h * .44, w * .86, hz);
      ctx.strokeStyle = 'rgba(0,174,239,0.85)'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 10]); ctx.lineDashOffset = reduce ? 0 : -(t * 26) % 16; ctx.stroke(); ctx.setLineDash([]);
      const pulse = reduce ? .9 : .75 + Math.sin(t * 1.6) * .25;
      const dot = ctx.createRadialGradient(w * .86, hz, 0, w * .86, hz, 22 * pulse); dot.addColorStop(0, 'rgba(255,255,255,0.95)'); dot.addColorStop(.25, 'rgba(0,174,239,0.7)'); dot.addColorStop(1, 'rgba(0,174,239,0)');
      ctx.fillStyle = dot; ctx.beginPath(); ctx.arc(w * .86, hz, 22, 0, Math.PI * 2); ctx.fill();
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const start = () => { cancelAnimationFrame(raf); size(); raf = requestAnimationFrame(draw); };
    new ResizeObserver(() => start()).observe(stage);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(stage);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) start(); });
    start();
  }

  /* ---------- count-up numerals ---------- */
  const nums = $$('[data-count]');
  const fmt = (v, el) => (el.dataset.prefix || '') + Math.round(v).toLocaleString('en-US') + (el.dataset.suffix || '');
  if (nums.length) {
    nums.forEach((el) => { if (reduce) el.textContent = fmt(+el.dataset.count, el); });
    if (!reduce) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return; io.unobserve(e.target); const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1100;
        const step = (now) => { const p = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - p, 3); el.textContent = fmt(end * k, el); if (p < 1) requestAnimationFrame(step); };
        requestAnimationFrame(step);
      }), { threshold: .4 });
      nums.forEach((el) => io.observe(el));
    }
  }

  /* ---------- countdowns ---------- */
  const clocks = $$('[data-deadline]');
  if (clocks.length) {
    const tick = () => clocks.forEach((c) => {
      const left = Date.parse(c.dataset.deadline) - Date.now();
      const d = Math.max(0, Math.floor(left / 864e5)), hh = Math.max(0, Math.floor(left / 36e5) % 24), mm = Math.max(0, Math.floor(left / 6e4) % 60), ss = Math.max(0, Math.floor(left / 1e3) % 60);
      const set = (k, v) => { const el = c.querySelector(`[data-u="${k}"]`); if (el) el.textContent = String(v).padStart(2, '0'); };
      set('d', d); set('h', hh); set('m', mm); set('s', ss);
      c.setAttribute('aria-label', `${d} days, ${hh} hours, ${mm} minutes remaining`);
    });
    tick(); setInterval(tick, 1000);
  }

  /* ---------- copy buttons ---------- */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const txt = b.dataset.copy, old = b.textContent;
    try { await navigator.clipboard.writeText(txt); b.textContent = 'Copied'; } catch (e) { const r = document.createRange(); const tgt = $(b.dataset.copyTarget); if (tgt) { r.selectNodeContents(tgt); const s = getSelection(); s.removeAllRanges(); s.addRange(r); } b.textContent = 'Selected'; }
    setTimeout(() => (b.textContent = old), 1400);
  }));
})();

/* ---------- check tools (scored checklists) ---------- */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  $$('[data-checktool]').forEach((t) => {
    const key = 'cv-' + t.dataset.checktool, inputs = $$('input[type="checkbox"]', t), total = inputs.length;
    const score = $('[data-score]', t), bar = $('[data-bar]', t), msg = $('[data-msg]', t), lane = $('[data-lane]', t), out = $('[data-outof]', t);
    let bands = []; try { bands = JSON.parse(t.dataset.bands || '[]'); } catch (e) {}
    try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); inputs.forEach((i, n) => { i.checked = !!saved[n]; }); } catch (e) {}
    if (out) out.textContent = total;
    const paint = () => {
      const n = inputs.filter((i) => i.checked).length;
      if (score) score.textContent = n;
      if (bar) bar.style.width = (total ? n / total * 100 : 0) + '%';
      const b = bands.find((x) => n <= x.max) || bands[bands.length - 1];
      if (b) { if (msg) msg.textContent = b.msg; if (lane) lane.textContent = b.lane; }
      try { localStorage.setItem(key, JSON.stringify(inputs.map((i) => i.checked))); } catch (e) {}
    };
    inputs.forEach((i) => i.addEventListener('change', paint)); paint();
  });
})();
/* Contact form: posts to /api/contact (Cloudflare Pages Function); degrades to a clear note when no handler is reachable. */
(() => {
  const f = document.querySelector('form[data-contact-form]'); if (!f) return;
  const note = f.querySelector('.cf-note'), base = note ? note.textContent : '', btn = f.querySelector('button[type="submit"]');
  // arriving from a plan button (?plan=free|assurance|multi) until online checkout is live: pre-select the plan and say what happens next
  try {
    const plan = new URLSearchParams(location.search).get('plan') || new URLSearchParams(location.hash.replace(/^#/, '')).get('plan');
    const map = { free: ['Client Vision Free', 'Please set up a free Client Vision workspace for us.'], assurance: ['Client Vision Assurance', 'We would like Client Vision Assurance, billed annually. Governance pack: '], multi: ['Client Vision Assurance Multi', 'We would like Client Vision Assurance Multi, billed annually.'] };
    if (plan && map[plan]) {
      f.interest.value = map[plan][0]; if (!f.message.value) f.message.value = map[plan][1];
      const h = document.getElementById('formTitle'); if (h) { h.classList.remove('sr-only'); h.textContent = plan === 'free' ? 'Start your free workspace' : 'Order ' + map[plan][0]; h.style.marginBottom = '4px'; }
      if (note) { note.textContent = 'Online checkout is on its way. Until then we provision your workspace within one business day of this request and send the invoice with it.'; }
      f.scrollIntoView({ block: 'start' });
    }
  } catch (e) {}
  const say = (t, cls) => { if (note) { note.textContent = t; note.className = 'cf-note' + (cls ? ' ' + cls : ''); } };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (f.company_website && f.company_website.value) { say('Thanks, we have it.', 'ok'); return; }
    const email = (f.email.value || '').trim(), name = (f.name.value || '').trim();
    if (!name) { say('Add your name so we know who to reply to.', 'err'); f.name.focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('Enter a work email address and try again.', 'err'); f.email.focus(); return; }
    const payload = { name, email, company: (f.company.value || '').trim(), interest: f.interest.value, message: (f.message.value || '').trim(), page: location.href, sentAt: new Date().toISOString() };
    say('Sending…'); if (btn) btn.disabled = true;
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.ok === false) throw new Error(j.error || 'send failed');
      f.classList.add('sent'); say(`Thanks, ${name.split(' ')[0]}. We reply to ${email} within one business day.`, 'ok'); f.reset();
    } catch (err) {
      const offline = !/^https?:\/\/(www\.)?3hue\.net/.test(location.origin);
      say(offline ? 'This preview is not connected to the mail handler yet; on 3hue.net this sends your inquiry. Until then, book a call or phone (954) 738-4454.' : 'Could not send just now. Email aramirez@3hue.net or call (954) 738-4454 and we will take it from there.', 'err');
    } finally { if (btn) btn.disabled = false; }
  });
})();
