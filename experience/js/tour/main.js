// Inside 3HUE — guided tour runner. Boot → opening → walk the node graph (scenes, lines, decisions) → close.
import { setScene, showTitle, hideTitle } from './scene.js';
import { attachAudio, startGuide, setMode, guide } from './guide.js';
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
const state = { node: null, lineIndex: 0, visited: [], answers: {}, run: 0, paused: false, chapter: null, waiting: false };

async function main() {
  T = await (await fetch('content/tour.json', { cache: 'no-cache' })).json();
  await api.init();
  $('g-name').textContent = T.guide.name; $('g-title').textContent = T.guide.title;
  buildProgress(); buildMap(); bindControls();
  ask.initAsk({
    tour: T, onCloseTour: resumeAfterAsk, summary: buildSummary, jump: (id) => play(id),
    context: () => ({ node: state.node, chapter: state.chapter, chapterName: T.nodes[state.node] ? T.nodes[state.node].chapter : '', answers: state.answers, visited: state.visited, position: positionLabel() }),
  });
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
  // preload voices
  node.lines.forEach((l) => player.preload(l.id));

  for (let i = 0; i < node.lines.length; i++) {
    state.lineIndex = i;
    const line = node.lines[i];
    if (line.show) callouts.show(line.show); else callouts.clear(600);
    while (state.paused && run === state.run) await wait(120);
    if (run !== state.run) return;
    await player.speak(line);
    if (run !== state.run) return;
    if (!line.show) callouts.clear(0);
  }
  if (node.choice) { offerChoice(node); return; }
  if (node.next) { await wait(500); if (run === state.run) play(node.next); return; }
  // end of graph without choice → show continue to close
  continueBtn.hidden = false; continueBtn.onclick = () => play('close');
}

function positionLabel() {
  const chapterOf = (id) => { if (T.chapters.includes(id)) return id; if (id.startsWith('exec-')) return 'exec'; if (id.startsWith('start-')) return 'pathway'; return id; };
  const i = T.chapters.indexOf(chapterOf(state.node || T.start));
  return i >= 0 ? `Stop ${i + 1} of ${T.chapters.length}` : '';
}
function chapterLabel(node) {
  const i = T.chapters.indexOf(state.node);
  const idx = i >= 0 ? i : T.chapters.findIndex((c) => T.nodes[c].chapter === node.chapter);
  return idx >= 0 ? `Chapter ${String(idx + 1).padStart(2, '0')}` : 'Inside 3HUE';
}

function offerChoice(node) {
  const c = node.choice; state.waiting = true; setMode('idle'); $('g-state').textContent = 'your call'; $('g-state').dataset.state = 'paused';
  const opts = c.options.filter((o) => !(o.tag && T.programs.includes(o.tag) && o.next === state.node)); // hub: hide the room we're in
  choicesEl.className = 'choices' + (opts.length > 4 ? ' compact' : '');
  choicesEl.innerHTML = `<div class="prompt">${esc(c.prompt)}</div>` + opts.map((o, i) => {
    const done = T.programs.includes(o.next) && state.visited.includes(o.next);
    const rec = recommended(node, o);
    return `<button type="button" data-i="${i}" class="${done ? 'done' : ''}"><i>${i + 1}</i><span><b>${esc(o.label)}</b>${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</span>${rec ? '<em>suggested</em>' : '<span></span>'}</button>`;
  }).join('');
  choicesEl.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => choose(node, opts[+b.dataset.i])));
  choicesEl.querySelector('button')?.focus({ preventScroll: true });
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
  choicesEl.innerHTML = ''; state.waiting = false;
  if (o.next.startsWith('action:')) return doAction(o.next.slice(7), o);
  play(o.next);
}
function doAction(action) {
  if (action === 'email-summary') { pauseTour(true); ask.openSummaryEmail(); return; }
  if (action === 'ask') { pauseTour(true); ask.open(); return; }
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
  $('map-replay').addEventListener('click', () => { closeMap(); state.visited = []; state.answers = {}; play(T.start); });
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
function pauseTour(silent) { state.paused = true; player.pause(); $('c-pause').setAttribute('aria-pressed', 'true'); if (!silent) $('g-state').textContent = 'paused'; }
function resumeTour() { state.paused = false; player.resume(); $('c-pause').setAttribute('aria-pressed', 'false'); }
function resumeAfterAsk() { resumeTour(); if (state.waiting) { $('g-state').textContent = 'your call'; } }

// ---------------------------------------------------------------- progress + map
function buildProgress() {
  progressEl.innerHTML = T.chapters.map((c) => `<i data-c="${c}" class="${['exec', 'pathway', 'close'].includes(c) ? 'gold' : ''}" title="${esc(T.nodes[c].chapter)}"></i>`).join('');
}
function updateProgress() {
  const chapterOf = (id) => { if (T.chapters.includes(id)) return id; if (id.startsWith('exec-')) return 'exec'; if (id.startsWith('start-')) return 'pathway'; return id; };
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
  lines.push('Inside 3HUE — your guided tour summary', '');
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
  return { text: lines.join('\n'), visited: state.visited.slice(), answers: { ...A } };
}

main().catch((err) => { console.error(err); boot.textContent = 'Could not load the tour. Check the console.'; boot.classList.remove('out'); });
