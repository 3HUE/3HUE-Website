/* chrome.js: theme, header, email-my-results. Loads on every page, including the Client Vision pages. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  /* ---------- theme ---------- */
  const root = document.documentElement;
  try { const t = localStorage.getItem('3hue-theme'); if (t === 'dark' || t === 'light') root.dataset.theme = t; } catch (e) {}
  const themeBtn = $('#themeBtn');
  const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
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
  document.addEventListener('click', (e) => { if (!e.target.closest('.top nav')) closeMenus(); });
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
