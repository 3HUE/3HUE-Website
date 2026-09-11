// "Ask AiVRIC": chat with voice input, knowledge-base answers, spoken replies, and in-flow email capture.
import * as api from './api.js';
import { setMode } from './guide.js';

const root = document.getElementById('ask');
const thread = document.getElementById('ask-thread');
const suggest = document.getElementById('ask-suggest');
const form = document.getElementById('ask-form');
const input = document.getElementById('ask-input');
const mic = document.getElementById('ask-mic');
const capture = document.getElementById('ask-capture');
const capTitle = document.getElementById('cap-title'), capSub = document.getElementById('cap-sub'), capNote = document.getElementById('cap-note');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let history = [], onClose = null, contextFn = null, summaryFn = null, pendingEmail = null;
const SUGGEST = ['How does pricing work?', 'What does a Virtual CISO do?', 'Which compliance frameworks do you support?', 'How do we get started?', 'What happens during an incident?'];

export function initAsk({ onCloseTour, context, summary }) {
  onClose = onCloseTour; contextFn = context; summaryFn = summary;
  suggest.innerHTML = SUGGEST.map((s) => `<button type="button">${esc(s)}</button>`).join('');
  suggest.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { input.value = b.textContent; form.requestSubmit(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value.trim(); if (q) { input.value = ''; askQuestion(q); } });
  document.getElementById('ask-close').addEventListener('click', close);
  document.getElementById('ask-resume').addEventListener('click', close);
  document.getElementById('cap-cancel').addEventListener('click', () => { capture.hidden = true; pendingEmail = null; });
  capture.addEventListener('submit', submitCapture);
  initMic();
}

export function open(prefill) {
  root.hidden = false; stopSpeech();
  if (!thread.children.length) addAI(`Hi — I'm AiVRIC. Ask me anything about 3HUE's programs, how engagements run, pricing, compliance, or how to get started. You can type, or tap the microphone and just talk.`, false);
  if (prefill) { input.value = prefill; }
  setTimeout(() => input.focus(), 50);
}
export function close() { root.hidden = true; stopMic(); stopSpeech(); capture.hidden = true; pendingEmail = null; if (onClose) onClose(); }
export function isOpen() { return !root.hidden; }

function addYou(text) { const d = document.createElement('div'); d.className = 'msg you'; d.textContent = text; thread.appendChild(d); thread.scrollTop = thread.scrollHeight; }
function addAI(text, withActions = true, meta = {}) {
  const d = document.createElement('div'); d.className = 'msg ai';
  d.innerHTML = `<span class="who">AiVRIC</span><span class="t">${esc(text)}</span>` + (withActions ? `<div class="acts"><button class="btn" data-act="email" type="button">Email me this answer</button><button class="btn" data-act="resume" type="button">Continue the tour</button></div>` : '');
  d.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.act === 'email') offerEmail({ subject: meta.question ? `Your question: ${meta.question}` : 'Your answer from AiVRIC', text: `Q: ${meta.question || ''}\n\nA: ${text}`, kind: 'answer' });
    else close();
  }));
  thread.appendChild(d); thread.scrollTop = thread.scrollHeight; return d;
}

async function askQuestion(q) {
  addYou(q); stopSpeech();
  const th = document.createElement('div'); th.className = 'msg ai thinking'; th.textContent = 'Thinking'; thread.appendChild(th); thread.scrollTop = thread.scrollHeight;
  try {
    const res = await api.ask(q, history, contextFn ? contextFn() : null);
    th.remove();
    history.push({ role: 'user', content: q }, { role: 'assistant', content: res.answer });
    addAI(res.answer, true, { question: q });
    speakText(res.answer);
  } catch (e) {
    th.remove(); addAI("I couldn't reach the knowledge base just now. You can reach 3HUE's Client Success team directly at 855-374-7129 or success@3hue.net — or try again in a moment.", false);
  }
}

// ---- spoken replies (browser voice; the tour's own lines are pre-rendered) ----
let utter = null;
function speakText(text) {
  if (!('speechSynthesis' in window) || document.body.classList.contains('voice-muted')) return;
  stopSpeech();
  utter = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  const pick = voices.find((v) => /en-US/i.test(v.lang) && /Ava|Samantha|Aria|Jenny|Zira|Google US English/i.test(v.name)) || voices.find((v) => /en/i.test(v.lang));
  if (pick) utter.voice = pick; utter.rate = 1.02; utter.pitch = 1.0;
  utter.onstart = () => setMode('speaking'); utter.onend = () => setMode('idle'); utter.onerror = () => setMode('idle');
  speechSynthesis.speak(utter);
}
function stopSpeech() { if ('speechSynthesis' in window) speechSynthesis.cancel(); setMode('idle'); }

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
function startMic() { try { stopSpeech(); rec.start(); listening = true; mic.setAttribute('aria-pressed', 'true'); setMode('listening'); input.placeholder = 'Listening…'; } catch (e) {} }
function stopMic() { if (!rec) return; try { rec.stop(); } catch (e) {} listening = false; mic.setAttribute('aria-pressed', 'false'); setMode('idle'); input.placeholder = 'Ask about programs, pricing, compliance, how to start…'; }

// ---- email capture ----
export function offerEmail(payload) {
  pendingEmail = payload; capNote.textContent = ''; capNote.className = 'note';
  capTitle.textContent = payload.kind === 'summary' ? 'Send my tour summary' : 'Send this answer to your inbox';
  capSub.textContent = 'Quick contact details — then we pick the tour back up.';
  capture.hidden = false; capture.scrollIntoView({ behavior: 'smooth', block: 'end' }); capture.querySelector('[name=name]').focus();
}
async function submitCapture(e) {
  e.preventDefault(); if (!pendingEmail) return;
  const fd = new FormData(capture);
  const payload = { name: fd.get('name'), email: fd.get('email'), company: fd.get('company') || '', consent: !!fd.get('consent'), subject: pendingEmail.subject, text: pendingEmail.text, kind: pendingEmail.kind, tour: summaryFn ? summaryFn() : null };
  const btn = document.getElementById('cap-send'); btn.disabled = true; btn.textContent = 'Sending…';
  try {
    const r = await api.sendEmail(payload);
    capNote.textContent = r.demo ? 'Demo mode: an email draft was opened for you (no backend configured yet).' : `Sent to ${payload.email}. Check your inbox in a minute.`;
    capNote.className = 'note';
    setTimeout(() => { capture.hidden = true; pendingEmail = null; }, r.demo ? 1500 : 2200);
  } catch (err) {
    capNote.textContent = "That didn't go through. You can email success@3hue.net directly, or try again."; capNote.className = 'note err';
  } finally { btn.disabled = false; btn.textContent = 'Send it'; }
}
export function openSummaryEmail() {
  open();
  const s = summaryFn ? summaryFn() : { text: '' };
  addAI("Here's the summary I'll send — the rooms you visited and the next step we discussed. Just add where to send it.", false);
  offerEmail({ subject: 'Your Inside 3HUE tour summary', text: s.text, kind: 'summary' });
}
