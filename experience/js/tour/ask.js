// "Ask the Tour Guide": docked communication console — conversation (typed or voice, spoken replies,
// in-flow email capture), Explore (jump anywhere), Transcript (everything the guide has said so far).
import * as api from './api.js';
import { setMode, drawOrbInto } from './guide.js';
import * as player from './player.js';

const $ = (id) => document.getElementById(id);
const root = $('ask'), thread = $('ask-thread'), suggest = $('ask-suggest'), cards = $('ask-cards');
const form = $('ask-form'), input = $('ask-input'), mic = $('ask-mic');
const capture = $('ask-capture'), capTitle = $('cap-title'), capSub = $('cap-sub'), capNote = $('cap-note');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stamp = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

let history = [], hooks = {}, pendingEmail = null, tour = null;

// Contextual quick actions and suggested questions, keyed by tour node (falls back to defaults).
const CARDS = {
  default: [
    { t: 'Visit the programs', s: 'Six managed GRC rooms', go: 'model', i: 'grid' },
    { t: 'How engagements run', s: 'Plan → operate → protect', go: 'engage', i: 'flow' },
  ],
  arrive: [{ t: 'Why this building exists', s: 'The threat and regulatory picture', go: 'why', i: 'shield' }, { t: 'See the model', s: 'Three layers, one program', go: 'model', i: 'grid' }],
  why: [{ t: 'See the model', s: 'Three layers, one program', go: 'model', i: 'grid' }, { t: 'The business case', s: 'CEO, CFO, CIO, board', go: 'exec', i: 'chart' }],
  model: [{ t: 'Incident response', s: 'CIRP room', go: 'cirp', i: 'shield' }, { t: 'Audit readiness', s: 'Security Compliance Services', go: 'scs', i: 'check' }],
  isp: [{ t: 'Show the workflow', s: 'Program build-out to audit-ready', go: 'engage', i: 'flow' }, { t: 'Visit Engineering', s: 'How gaps get closed', go: 'sea', i: 'gear' }],
  cirp: [{ t: 'Managed SOC', s: '24/7 detection & response', go: 'fabric', i: 'radar' }, { t: 'Risk register', s: 'Where lessons land', go: 'rmp', i: 'chart' }],
  vciso: [{ t: 'The business case', s: 'By executive lens', go: 'exec', i: 'chart' }, { t: 'How engagements run', s: 'Leadership options', go: 'engage', i: 'flow' }],
  rmp: [{ t: 'Client Vision', s: 'Where risk becomes decisions', go: 'fabric', i: 'radar' }, { t: 'Compliance services', s: 'Evidence & audit readiness', go: 'scs', i: 'check' }],
  scs: [{ t: 'Show the workflow', s: 'Assessment to remediation', go: 'engage', i: 'flow' }, { t: 'Visit Engineering', s: 'See how gaps get closed', go: 'sea', i: 'gear' }],
  vcp: [{ t: 'Compliance services', s: 'Vendor evidence, audit-ready', go: 'scs', i: 'check' }, { t: 'Client Vision', s: 'Third-party risk in one view', go: 'fabric', i: 'radar' }],
  sea: [{ t: 'The fabric', s: 'AiVRIC & Client Vision', go: 'fabric', i: 'radar' }, { t: 'How engagements run', s: 'Step 2: GRC operations', go: 'engage', i: 'flow' }],
  fabric: [{ t: 'The business case', s: 'Executive alignment', go: 'exec', i: 'chart' }, { t: 'Getting started', s: 'Where are you today?', go: 'pathway', i: 'flag' }],
  exec: [{ t: 'How engagements run', s: 'Three steps, 12-month sprints', go: 'engage', i: 'flow' }, { t: 'Getting started', s: 'Your first step', go: 'pathway', i: 'flag' }],
  engage: [{ t: 'Getting started', s: 'Pick your scenario', go: 'pathway', i: 'flag' }, { t: 'Visit Engineering', s: 'See how gaps get closed', go: 'sea', i: 'gear' }],
  pathway: [{ t: 'Email me a summary', s: 'Rooms visited + next step', act: 'email', i: 'mail' }, { t: 'The business case', s: 'By executive lens', go: 'exec', i: 'chart' }],
  close: [{ t: 'Email me a summary', s: 'Rooms visited + next step', act: 'email', i: 'mail' }, { t: 'Replay the tour', s: 'From the lobby', go: 'arrive', i: 'flow' }],
};
const ASK = {
  default: ['How does pricing work?', 'How do we get started?', 'Which frameworks do you support?'],
  arrive: ['What is 3HUE?', 'How long is the tour?', 'What does a Virtual CISO do?'],
  why: ['Why not just buy tools?', 'How fast can we be compliant?'],
  model: ['What is the GRC layer?', 'What does the SOC include?'],
  isp: ['Which frameworks do you support?', 'How long to a compliant program?'],
  cirp: ['What happens during an incident?', 'Do you run tabletop exercises?'],
  vciso: ['What if we already have a CISO?', 'What are the leadership options?'],
  rmp: ['How is risk prioritized?', 'What is the Get-Well methodology?'],
  scs: ['What should we prepare?', 'Who owns remediation?', 'How much audit prep time is saved?'],
  vcp: ['How do you assess vendors?', 'What about high-risk suppliers?'],
  sea: ['Where does the GRC system run?', 'Do you work with our MSP?'],
  fabric: ['What is AiVRIC?', 'What does the SOC include?'],
  exec: ['How do I justify this to the CFO?', 'What does the board care about?'],
  engage: ['How does pricing work?', 'What is in the operating plan?'],
  pathway: ['How do we get started?', 'What is the posture assessment?'],
  close: ['How do we get started?', 'Can you email me this?'],
};
const ICON = {
  grid: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  flow: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M12 12H6v4M12 12h6v4"/></svg>',
  gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6l-8-3z"/><path d="m9 12 2 2 4-4"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  radar: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v9l6 6"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4h11l-2 4 2 4H5"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
};

export function initAsk(h) {
  hooks = h; tour = h.tour;
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; askQuestion(q); } });
  suggest.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { askQuestion(b.textContent); } });
  cards.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.go) { close(); hooks.jump(b.dataset.go); } else if (b.dataset.act === 'email') openSummaryEmail(); });
  $('ask-close').addEventListener('click', close);
  $('ask-min').addEventListener('click', () => { root.classList.add('min'); $('ask-pill').hidden = false; });
  $('ask-pill').addEventListener('click', () => { root.classList.remove('min'); $('ask-pill').hidden = true; });
  $('cap-cancel').addEventListener('click', () => { capture.hidden = true; pendingEmail = null; });
  capture.addEventListener('submit', submitCapture);
  root.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
  $('ask-explore').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { close(); hooks.jump(b.dataset.c); } });
  $('paused-resume').addEventListener('click', close);
  drawOrbInto($('ask-orb')); drawOrbInto($('ask-pill').querySelector('canvas'));
  initMic();
}

function showTab(t) {
  root.querySelectorAll('.tabs button').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  root.querySelectorAll('.pane').forEach((p) => { p.hidden = p.dataset.pane !== t; });
  if (t === 'explore') renderExplore(); if (t === 'transcript') renderTranscript();
}

export function open(prefill) {
  const ctx = hooks.context ? hooks.context() : {};
  root.hidden = false; root.classList.remove('min'); $('ask-pill').hidden = true; document.body.classList.add('ask-open'); stopSpeech();
  $('ask-stop').querySelector('span').textContent = ctx.chapterName || 'Inside 3HUE';
  $('paused').hidden = false; $('paused-pos').textContent = ctx.position || '';
  renderContext(ctx);
  if (!thread.children.length) { const g = addAI("Hi — I'm AiVRIC. Ask me anything about this room, the programs, pricing, or your next step. You can type, or start voice and just talk.", false, { audio: 'media/voice/console-greeting.mp3' }); speak(g); }
  showTab('conv');
  if (prefill) input.value = prefill;
  setTimeout(() => input.focus(), 60);
}
export function close() { root.hidden = true; document.body.classList.remove('ask-open'); $('paused').hidden = true; stopMic(); stopSpeech(); capture.hidden = true; pendingEmail = null; if (hooks.onCloseTour) hooks.onCloseTour(); }
export function isOpen() { return !root.hidden; }

function renderContext(ctx) {
  const key = (ctx.node || '').replace(/^(exec|start)-.*/, (m, g) => g === 'exec' ? 'exec' : 'pathway');
  const cs = (CARDS[key] || CARDS.default).filter((c) => c.go !== ctx.node);
  cards.innerHTML = cs.map((c) => `<button type="button" ${c.go ? `data-go="${c.go}"` : `data-act="${c.act}"`}>${ICON[c.i] || ICON.grid}<span><b>${esc(c.t)}</b><small>${esc(c.s)}</small></span><i>→</i></button>`).join('');
  suggest.innerHTML = (ASK[key] || ASK.default).map((q) => `<button type="button">${esc(q)}</button>`).join('');
}
function renderExplore() {
  const ctx = hooks.context ? hooks.context() : {}; const T = tour;
  $('ask-explore').innerHTML = T.chapters.map((c, i) => { const v = (ctx.visited || []).includes(c), now = c === ctx.node;
    return `<li><button type="button" data-c="${c}" class="${now ? 'now' : v ? 'done' : ''}"><i>${String(i + 1).padStart(2, '0')}</i><span><b>${esc(T.nodes[c].chapter)}</b><small>${esc(T.nodes[c].lines[0].text.split('. ')[0])}.</small></span><em>${now ? 'now' : v ? 'visited' : ''}</em></button></li>`; }).join('');
}
function renderTranscript() {
  const ctx = hooks.context ? hooks.context() : {}; const T = tour;
  const ids = (ctx.visited || []).filter((id) => T.nodes[id]);
  $('ask-transcript').innerHTML = ids.length ? ids.map((id) => `<h5>${esc(T.nodes[id].chapter)}</h5>` + T.nodes[id].lines.map((l) => `<p class="${id === ctx.node ? 'now' : ''}">${esc(l.text)}</p>`).join('')).join('') : '<p>Nothing yet — the transcript fills in as the tour goes.</p>';
}

function addYou(text) { const d = document.createElement('div'); d.className = 'msg you'; d.innerHTML = `<div class="meta"><b>You</b>${stamp()}</div><div class="t">${esc(text)}</div>`; thread.appendChild(d); scrollThread(); }
function addAI(text, withActions = true, meta = {}) {
  const d = document.createElement('div'); d.className = 'msg ai';
  d.innerHTML = `<span class="av"></span><div class="meta"><b>AiVRIC</b>${stamp()}</div><div class="t">${esc(text)}</div>` +
    `<button class="say" type="button" title="Play this answer" aria-label="Play this answer"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg></button>` +
    (withActions ? `<div class="acts"><button class="btn" data-act="email" type="button">Email me this answer</button></div>` : '');
  d._text = text; d._audio = meta.audio || null;
  d.querySelector('.say').addEventListener('click', () => speak(d));
  d.querySelectorAll('[data-act="email"]').forEach((b) => b.addEventListener('click', () => offerEmail({ subject: meta.question ? `Your question: ${meta.question}` : 'Your answer from AiVRIC', text: `Q: ${meta.question || ''}\n\nA: ${text}`, kind: 'answer' })));
  thread.appendChild(d); scrollThread(); return d;
}
function scrollThread() { const pane = thread.parentElement; requestAnimationFrame(() => { pane.scrollTop = pane.scrollHeight; }); }

async function askQuestion(q) {
  addYou(q); stopSpeech();
  const th = document.createElement('div'); th.className = 'msg ai thinking'; th.innerHTML = `<span class="av"></span><div class="meta"><b>AiVRIC</b></div><div class="t">Thinking</div>`; thread.appendChild(th); scrollThread();
  try {
    const res = await api.ask(q, history, hooks.context ? hooks.context() : null);
    th.remove();
    history.push({ role: 'user', content: q }, { role: 'assistant', content: res.answer });
    const d = addAI(res.answer, true, { question: q, audio: res.audio || null });
    speak(d);
  } catch (e) {
    th.remove(); addAI("I couldn't reach the knowledge base just now. You can reach 3HUE's Client Success team directly at 855-374-7129 or success@3hue.net — or try again in a moment.", false, {});
  }
}

// ---- spoken replies: the tour guide's own voice wherever possible ----
// 1) pre-rendered clip (FAQ / greeting)  2) Worker /tts in the same neural voice  3) browser voice (last resort)
let utter = null, sayBtn = null, speakRun = 0;
async function speak(msgEl) {
  const text = msgEl._text, btn = msgEl.querySelector('.say');
  if (document.body.classList.contains('voice-muted')) return;
  stopSpeech(); const run = ++speakRun; sayBtn = btn;
  let url = msgEl._audio;
  if (!url) { btn.classList.add('wait'); url = await api.tts(spokenForm(text)); btn.classList.remove('wait'); if (run !== speakRun) return; if (url) msgEl._audio = url; }
  if (url) {
    btn.classList.add('on');
    await player.playClip(url);
    if (run === speakRun) btn.classList.remove('on');
    return;
  }
  if (!('speechSynthesis' in window)) return;
  utter = new SpeechSynthesisUtterance(spokenForm(text));
  const voices = speechSynthesis.getVoices();
  const pick = voices.find((v) => /en-US/i.test(v.lang) && /Ava|Samantha|Aria|Jenny|Zira|Google US English/i.test(v.name)) || voices.find((v) => /en/i.test(v.lang));
  if (pick) utter.voice = pick; utter.rate = 1.02;
  utter.onstart = () => { setMode('speaking'); btn.classList.add('on'); };
  utter.onend = utter.onerror = () => { setMode('idle'); btn.classList.remove('on'); };
  speechSynthesis.speak(utter);
}
function spokenForm(text) { return text.replace(/3HUE/gi, 'three hue').replace(/AiVRIC/gi, 'Avaric').replace(/\bvCISO\b/g, 'virtual CISO').replace(/\bSOC 2\b/g, 'sock two').replace(/\bSOC\b/g, 'sock'); }
function stopSpeech() { speakRun++; player.cancel(); if ('speechSynthesis' in window) speechSynthesis.cancel(); if (sayBtn) sayBtn.classList.remove('on'); setMode('idle'); }

// ---- voice input ----
let rec = null, listening = false;
function initMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { mic.hidden = true; return; }
  rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
  rec.onresult = (e) => { let s = ''; for (const r of e.results) s += r[0].transcript; input.value = s; if (e.results[e.results.length - 1].isFinal) { stopMic(); if (s.trim()) { input.value = ''; askQuestion(s.trim()); } } };
  rec.onend = () => { if (listening) stopMic(); };
  rec.onerror = () => stopMic();
  mic.addEventListener('click', () => listening ? stopMic() : startMic());
}
function startMic() { try { stopSpeech(); rec.start(); listening = true; mic.setAttribute('aria-pressed', 'true'); mic.querySelector('span').textContent = 'Listening… tap to stop'; setMode('listening'); input.placeholder = 'Listening…'; } catch (e) {} }
function stopMic() { if (!rec) return; try { rec.stop(); } catch (e) {} listening = false; mic.setAttribute('aria-pressed', 'false'); mic.querySelector('span').textContent = 'Start voice'; setMode('idle'); input.placeholder = 'Ask about this room or your next step…'; }

// ---- email capture ----
export function offerEmail(payload) {
  pendingEmail = payload; capNote.textContent = ''; capNote.className = 'note';
  capTitle.textContent = payload.kind === 'summary' ? 'Send my tour summary' : 'Send this answer to your inbox';
  capSub.textContent = 'Quick contact details — then we pick the tour back up.';
  capture.hidden = false; showTab('conv'); capture.scrollIntoView({ behavior: 'smooth', block: 'end' }); capture.querySelector('[name=name]').focus();
}
async function submitCapture(e) {
  e.preventDefault(); if (!pendingEmail) return;
  const fd = new FormData(capture);
  const payload = { name: fd.get('name'), email: fd.get('email'), company: fd.get('company') || '', consent: !!fd.get('consent'), subject: pendingEmail.subject, text: pendingEmail.text, kind: pendingEmail.kind, tour: hooks.summary ? hooks.summary() : null };
  const btn = $('cap-send'); btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await api.sendEmail(payload);
    capNote.textContent = r.demo ? 'Demo mode: an email draft was opened for you (no backend configured yet).' : `Sent to ${payload.email}. Check your inbox in a minute.`; capNote.className = 'note';
    setTimeout(() => { capture.hidden = true; pendingEmail = null; }, r.demo ? 1500 : 2200);
  } catch (err) { capNote.textContent = "That didn't go through. You can email success@3hue.net directly, or try again."; capNote.className = 'note err'; }
  finally { btn.disabled = false; btn.textContent = 'Send it'; }
}
export function openSummaryEmail() {
  if (root.hidden) open();
  const s = hooks.summary ? hooks.summary() : { text: '' };
  addAI("Here's the summary I'll send — the rooms you visited and the next step we discussed. Just add where to send it.", false, {});
  offerEmail({ subject: 'Your Inside 3HUE tour summary', text: s.text, kind: 'summary' });
}
