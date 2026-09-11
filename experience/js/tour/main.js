// Inside 3HUE — guided tour runner. Boot → opening → walk the node graph (scenes, lines, decisions) → close.
import { setScene, showTitle, hideTitle } from './scene.js';
import { attachAudio, startGuide, setMode, setPersona, guide } from './guide.js';
import * as player from './player.js';
import * as callouts from './callouts.js';
import * as api from './api.js';
import * as ask from './ask.js';
import { runIntro } from './intro.js';

const $ = (id) => document.getElementById(id);
const boot = $('boot'), choicesEl = $('choices'), continueBtn = $('dlg-continue'), progressEl = $('progress');
const params = new URLSearchParams(location.search);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let T = null;                    // tour manifest
const state = { node: null, lineIndex: 0, visited: [], answers: {}, run: 0, paused: false, chapter: null, waiting: false, guide: 'ava', name: '' };
const liveClips = new Map();   // personalised line text -> object URL (Worker /tts)

// ---------------------------------------------------------------- personas + personalisation
function guideInfo(id) { return (T.guides && T.guides[id || state.guide]) || T.guide; }
function setGuide(id) {
  state.guide = id; player.setGuide(id); setPersona(guideInfo(id).tone);
  document.body.dataset.guide = id;
  document.querySelectorAll('[data-guide-name]').forEach((el) => { el.textContent = guideInfo(id).name; });
}
function showSpeaker(who) { const g = guideInfo(who); $('g-name').textContent = g.name; $('g-title').textContent = g.title; setPersona(g.tone); }
/** Display text for a line: the {name} version when we know a name, else the plain form. */
function personalize(text, plain) { return state.name ? text.replace(/\{name\}/g, state.name) : (plain || text.replace(/,? \{name\}/g, '').replace(/\{name\}/g, 'you')); }
/** Personalised lines are spoken live in the guide's voice when a backend is configured; otherwise the plain clip plays. */
async function personalizedClip(line, who) {
  if (!state.name || !line.plain || !api.hasBackend()) return null;
  const text = personalize(line.text);
  const key = who + '|' + text;
  if (liveClips.has(key)) return liveClips.get(key);
  const url = await api.tts(spokenForm(text), guideInfo(who).voice);
  if (url) liveClips.set(key, url);
  return url;
}
function spokenForm(text) { return text.replace(/3HUE/gi, 'three hue').replace(/AiVRIC/gi, 'Avaric').replace(/\bvCISO\b/g, 'virtual CISO').replace(/\bSOC 2\b/g, 'sock two').replace(/\bSOC\b/g, 'sock'); }
function cleanName(raw) {
  let n = String(raw || '').trim().replace(/^(my name is|i am|i'm|it's|its|call me|this is|name's)\s+/i, '').replace(/[.!?,]+$/, '').trim();
  n = n.split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return n.length > 24 ? n.slice(0, 24) : n;
}

async function main() {
  T = await (await fetch('content/tour.json', { cache: 'no-cache' })).json();
  await api.init();
  $('g-name').textContent = T.guide.name; $('g-title').textContent = T.guide.title;
  buildProgress(); buildMap(); bindControls();
  ask.initAsk({
    tour: T, onCloseTour: resumeAfterAsk, summary: buildSummary, jump: (id) => play(id),
    guide: () => ({ id: state.guide, ...guideInfo() }), name: () => state.name,
    context: () => ({ node: state.node, chapter: state.chapter, chapterName: T.nodes[state.node] ? T.nodes[state.node].chapter : '', answers: state.answers, visited: state.visited, position: positionLabel(), guide: guideInfo().name, name: state.name }),
  });
  setGuide('ava');
  attachAudio(player.audio); startGuide();

  // Preload the first scene behind the opening
  await setScene(T.nodes[T.start].bg, T.nodes[T.start].cam, 12000);
  boot.classList.add('out');
  const skipIntro = params.get('skipintro') === '1';
  if (!skipIntro) await runIntro();      // the click here is the user gesture that unlocks audio
  guide.resume();
  const startAt = params.get('at') && T.nodes[params.get('at')] ? params.get('at') : T.start;
  play(startAt);
}

// ---------------------------------------------------------------- graph walk
async function play(id, opts = {}) {
  const node = T.nodes[id]; if (!node) return;
  const run = ++state.run;
  player.cancel(); callouts.clear(); choicesEl.innerHTML = ''; continueBtn.hidden = true; state.waiting = false;
  state.node = id; state.lineIndex = 0;
  if (!state.visited.includes(id)) state.visited.push(id);
  updateProgress();
  const chapterChanged = node.chapter !== state.chapter; state.chapter = node.chapter;
  const totalMs = node.lines.reduce((s, l) => s + Math.max(2500, l.text.split(' ').length * 330), 0) + 2000;
  await setScene(node.bg, node.cam, totalMs);
  if (run !== state.run) return;
  if (chapterChanged && !opts.quiet) { showTitle(chapterLabel(node), node.chapter); await wait(1300); if (run !== state.run) return; }
  if (node.guide && node.guide !== state.guide) setGuide(node.guide);   // hand-off scenes switch the lead guide
  // preload voices
  node.lines.forEach((l) => player.preload(l.id, l.who));

  for (let i = opts.from || 0; i < node.lines.length; i++) {
    state.lineIndex = i;
    const line = node.lines[i];
    const who = line.who || state.guide;
    showSpeaker(who);
    if (line.show) callouts.show(line.show); else callouts.clear(600);
    while (state.paused && run === state.run) await wait(120);
    if (run !== state.run) return;
    const url = await personalizedClip(line, who);
    if (run !== state.run) return;
    await player.speak(line, { who, url, text: url ? personalize(line.text) : (line.plain || personalize(line.text)) });
    if (run !== state.run) return;
    if (!line.show) callouts.clear(0);
  }
  if (node.choice) { offerChoice(node); return; }
  if (node.next) { await wait(500); if (run === state.run) play(node.next); return; }
  // end of graph without choice → show continue to close
  continueBtn.hidden = false; continueBtn.onclick = () => play('close');
}

function positionLabel() {
  const i = T.chapters.indexOf(chapterOf(state.node || T.start));
  return i >= 0 ? `Stop ${i + 1} of ${T.chapters.length}` : '';
}
function chapterOf(id) {
  if (T.chapters.includes(id)) return id; if (id.startsWith('exec-')) return 'exec'; if (id.startsWith('start-')) return 'pathway';
  const n = T.nodes[id]; const c = n && T.chapters.find((k) => T.nodes[k].chapter === n.chapter); return c || id;
}
function chapterLabel(node) {
  const i = T.chapters.indexOf(state.node);
  const idx = i >= 0 ? i : T.chapters.findIndex((c) => T.nodes[c].chapter === node.chapter);
  return idx >= 0 ? `Chapter ${String(idx + 1).padStart(2, '0')}` : 'Inside 3HUE';
}

function offerChoice(node) {
  const c = node.choice; state.waiting = true; setMode('idle'); $('g-state').textContent = 'your call'; $('g-state').dataset.state = 'paused';
  if (c.type === 'name') return offerName(node);
  const opts = c.options.filter((o) => !(o.tag && T.programs.includes(o.tag) && o.next === state.node)); // hub: hide the room we're in
  choicesEl.className = 'choices' + (opts.length > 4 ? ' compact' : '');
  choicesEl.innerHTML = `<div class="prompt">${esc(personalize(c.prompt))}</div>` + opts.map((o, i) => {
    const done = T.programs.includes(o.next) && state.visited.includes(o.next);
    const rec = recommended(node, o);
    return `<button type="button" data-i="${i}" class="${done ? 'done' : ''}"><i>${i + 1}</i><span><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>${rec ? '<em>suggested</em>' : '<span></span>'}</button>`;
  }).join('');
  choicesEl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => choose(node, opts[+b.dataset.i])));
  choicesEl.querySelector('button')?.focus({ preventScroll: true });
}
// ---- optional name / alias: type it or say it
function offerName(node) {
  const c = node.choice;
  choicesEl.className = 'choices name';
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  choicesEl.innerHTML = `<div class="prompt">${esc(c.prompt)}</div>
    <form class="name-form" autocomplete="off">
      <input type="text" name="name" maxlength="24" placeholder="Your name or an alias" aria-label="Your name or alias" ${state.name ? `value="${esc(state.name)}"` : ''}>
      ${SR ? '<button type="button" class="btn icon mic" title="Say your name" aria-label="Say your name"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>' : ''}
      <button type="submit" class="btn primary">Continue</button>
      <button type="button" class="btn ghost skip">Skip</button>
      <small class="hint">Optional — it just makes the tour feel like yours.</small>
    </form>`;
  const form = choicesEl.querySelector('form'), input = form.querySelector('input'), micBtn = form.querySelector('.mic');
  const done = (name) => { state.name = cleanName(name); if (c.remember) state.answers[c.remember] = state.name; choicesEl.innerHTML = ''; choicesEl.className = 'choices'; state.waiting = false; stopRec(); play(c.next); };
  form.addEventListener('submit', (e) => { e.preventDefault(); done(input.value); });
  form.querySelector('.skip').addEventListener('click', () => done(''));
  let rec = null;
  const stopRec = () => { if (rec) { try { rec.stop(); } catch (e) {} rec = null; } micBtn && micBtn.classList.remove('on'); setMode('idle'); };
  if (micBtn) micBtn.addEventListener('click', () => {
    if (rec) return stopRec();
    rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
    micBtn.classList.add('on'); setMode('listening'); input.placeholder = 'Listening…';
    rec.onresult = (e) => { let t = ''; for (const r of e.results) t += r[0].transcript; input.value = cleanName(t); if (e.results[e.results.length - 1].isFinal) { stopRec(); if (input.value.trim()) done(input.value); } };
    rec.onend = rec.onerror = () => { stopRec(); input.placeholder = 'Your name or an alias'; };
    try { rec.start(); } catch (e) { stopRec(); }
  });
  setTimeout(() => input.focus({ preventScroll: true }), 50);
}
function recommended(node, o) {
  const a = state.answers.audience;
  if (state.node === 'exec') return (a === 'exec' && o.tag === 'cfo') || (a === 'tech' && o.tag === 'cio') || (a === 'practitioner' && o.tag === 'cio');
  if (node.choice.options.some((x) => x.tag === 'continue')) { // program hub: suggest continuing once 3 programs seen
    const seen = T.programs.filter((p) => state.visited.includes(p)).length; return o.tag === 'continue' && seen >= 3;
  }
  return false;
}
function choose(node, o) {
  if (node.choice.remember) state.answers[node.choice.remember] = o.tag;
  if (o.next === T.start) { state.visited = []; setGuide('ava'); }
  choicesEl.innerHTML = ''; state.waiting = false;
  if (o.next.startsWith('action:')) return doAction(o.next.slice(7), o);
  play(o.next);
}
function doAction(action) {
  if (action === 'email-summary') { offerChoice(T.nodes[state.node]); pauseTour(true); ask.openSummaryEmail(); return; }
  if (action === 'ask') { offerChoice(T.nodes[state.node]); pauseTour(true); ask.open(); return; }
  if (action === 'book') {
    window.open(T.contact.web, '_blank', 'noopener');
    callouts.show({ type: 'card', title: 'Client Success', body: `${T.contact.phone} · ${T.contact.email} · ${T.contact.web.replace('https://', '')}` });
    offerChoice(T.nodes.close); return;
  }
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- controls
function bindControls() {
  $('c-pause').addEventListener('click', () => state.paused ? resumeTour() : pauseTour());
  $('c-skip').addEventListener('click', () => { if (!state.waiting) player.skip(); });
  $('c-back').addEventListener('click', () => play(state.node, { quiet: true }));
  $('c-mute').addEventListener('click', (e) => { const m = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(m)); player.setMuted(m); document.body.classList.toggle('voice-muted', m); });
  $('c-cc').addEventListener('click', (e) => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', String(on)); player.setCaptions(on); });
  $('c-map').addEventListener('click', () => openMap());
  $('map-close').addEventListener('click', closeMap);
  $('map-replay').addEventListener('click', () => { closeMap(); state.visited = []; state.answers = {}; setGuide('ava'); play(T.start); });
  $('c-ask').addEventListener('click', () => { pauseTour(true); ask.open(); });
  document.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (ask.isOpen()) { if (e.key === 'Escape') ask.close(); return; }
    if (!$('map').hidden) { if (e.key === 'Escape') closeMap(); return; }
    if (e.key === ' ') { e.preventDefault(); state.paused ? resumeTour() : pauseTour(); }
    else if (e.key === 'ArrowRight') { if (!state.waiting) player.skip(); }
    else if (e.key === 'm') $('c-mute').click();
    else if (/^[1-7]$/.test(e.key) && state.waiting) { const b = choicesEl.querySelectorAll('button')[+e.key - 1]; if (b) b.click(); }
  });
}
function pauseTour(silent) { if (!state.paused) state.askFrom = state.lineIndex; state.paused = true; player.pause(); $('c-pause').setAttribute('aria-pressed', 'true'); if (!silent) $('g-state').textContent = 'paused'; }
function resumeTour() { state.paused = false; player.resume(); $('c-pause').setAttribute('aria-pressed', 'false'); }
function resumeAfterAsk() {
  if (state.waiting) { resumeTour(); $('g-state').textContent = 'your call'; return; }
  // the console spoke over the current line — pick the tour back up from the start of that line
  state.paused = false; $('c-pause').setAttribute('aria-pressed', 'false');
  play(state.node, { quiet: true, from: state.askFrom ?? state.lineIndex });
}

// ---------------------------------------------------------------- progress + map
function buildProgress() {
  progressEl.innerHTML = T.chapters.map((c) => `<i data-c="${c}" class="${['exec', 'pathway', 'close'].includes(c) ? 'gold' : ''}" title="${esc(T.nodes[c].chapter)}"></i>`).join('');
}
function updateProgress() {
  const now = chapterOf(state.node);
  progressEl.querySelectorAll('i').forEach((i) => { i.classList.toggle('now', i.dataset.c === now); i.classList.toggle('done', state.visited.some((v) => chapterOf(v) === i.dataset.c) && i.dataset.c !== now); });
}
function buildMap() {
  $('map-list').innerHTML = T.chapters.map((c, i) => `<li><button type="button" data-c="${c}"><i>${String(i + 1).padStart(2, '0')}</i><span><b>${esc(T.nodes[c].chapter)}</b><small>${esc(T.nodes[c].lines[0].text.split('. ')[0])}.</small></span><em></em></button></li>`).join('');
  $('map-list').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { closeMap(); play(b.dataset.c); }));
}
function openMap() {
  pauseTour(true); $('map').hidden = false; $('c-map').setAttribute('aria-expanded', 'true');
  $('map-list').querySelectorAll('button').forEach((b) => { const v = state.visited.includes(b.dataset.c); b.classList.toggle('now', b.dataset.c === state.node); b.classList.toggle('done', v && b.dataset.c !== state.node); b.querySelector('em').textContent = b.dataset.c === state.node ? 'now' : v ? 'visited' : ''; });
}
function closeMap() { $('map').hidden = true; $('c-map').setAttribute('aria-expanded', 'false'); resumeAfterAsk(); }

// ---------------------------------------------------------------- summary for email
function buildSummary() {
  const seen = state.visited.map((id) => T.nodes[id]).filter(Boolean);
  const lines = [];
  lines.push(state.name ? `Inside 3HUE — ${state.name}'s guided tour summary` : 'Inside 3HUE — your guided tour summary', `Guide: ${guideInfo().name}`, '');
  const A = state.answers;
  if (A.audience) lines.push(`Perspective: ${({ exec: 'executive', tech: 'technology leader', practitioner: 'security / compliance practitioner', all: 'full tour' })[A.audience] || A.audience}`);
  if (A.lens) lines.push(`Business case lens: ${A.lens.toUpperCase()}`);
  if (A.state) lines.push(`Where you are today: ${({ none: 'no formal program in place', partial: 'program exists, needs strategic review', urgent: 'urgent audit deadline or compliance gap' })[A.state]}`);
  lines.push('', 'Rooms you visited:');
  for (const n of seen) { lines.push(`• ${n.chapter} — ${n.lines[0].text}`); }
  const prog = T.programs.filter((p) => state.visited.includes(p));
  if (prog.length) lines.push('', 'Programs covered: ' + prog.map((p) => T.nodes[p].chapter).join(', '));
  lines.push('', 'Recommended next step:');
  const st = A.state === 'none' ? 'Holistic Risk & Control Posture Assessment (risk report, NIST CSF 2.0 scorecard, remediation plan, POA&M).' : A.state === 'urgent' ? 'Controls Gap Assessment aligned to your framework (SOC 2, HIPAA, CMMC, PCI) with remediation plans and engineering resources.' : A.state === 'partial' ? 'Strategic review of existing plans, policies and controls, then a stakeholder recommendations session.' : 'A discovery meeting with 3HUE Client Success.';
  lines.push(`• ${st}`, '', `3HUE Client Success · ${T.contact.phone} · ${T.contact.email} · ${T.contact.web}`);
  return { text: lines.join('\n'), visited: state.visited.slice(), answers: { ...A }, name: state.name, guide: guideInfo().name };
}

main().catch((err) => { console.error(err); boot.innerHTML = 'Could not load the tour.<br><small style="letter-spacing:0;text-transform:none;opacity:.7">' + String(err && err.message || err).replace(/[<>]/g, '') + ' — try a hard refresh (Ctrl+F5).</small>'; boot.classList.remove('out'); });
