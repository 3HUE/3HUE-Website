// Line playback: voice audio + word-synced caption. Resolves when the line ends, is skipped, or is cancelled.
import { setMode } from './guide.js';

const audio = document.getElementById('voice');
const captionEl = document.getElementById('caption');
const stateEl = document.getElementById('g-state');
let current = null;   // { resolve, raf, words }
export const settings = { muted: false, captions: true };

function setState(s) { stateEl.textContent = s; stateEl.dataset.state = s; }

async function timings(id) {
  try { const r = await fetch(`media/voice/${id}.json`, { cache: 'force-cache' }); if (!r.ok) return null; return (await r.json()).words; } catch (e) { return null; }
}
function layoutWords(text, words) {
  // Map the spoken word list onto the text tokens (edge-tts splits on spaces; punctuation stays attached).
  const tokens = text.split(/\s+/);
  captionEl.innerHTML = tokens.map((w, i) => `<span class="w" data-i="${i}">${w}</span>`).join(' ');
  const spans = [...captionEl.querySelectorAll('.w')];
  let starts = [];
  if (words && words.length) {
    // align by sequence: n tokens vs m words; use proportional index when counts differ
    starts = tokens.map((_, i) => { const j = Math.min(words.length - 1, Math.round(i * (words.length - 1) / Math.max(1, tokens.length - 1))); return words[j][0]; });
  }
  return { spans, starts };
}

export function preload(id) { const a = new Audio(); a.preload = 'auto'; a.src = `media/voice/${id}.mp3`; fetch(`media/voice/${id}.json`, { cache: 'force-cache' }).catch(() => {}); }

/** Speak one line. Returns a promise that resolves {skipped:boolean}. */
export function speak(line) {
  cancel();
  return new Promise(async (resolve) => {
    const words = await timings(line.id);
    const { spans, starts } = layoutWords(line.text, words);
    const me = { resolve, raf: 0, done: false };
    current = me;
    const finish = (skipped) => {
      if (me.done) return; me.done = true;
      cancelAnimationFrame(me.raf); audio.onended = null; audio.onerror = null;
      spans.forEach((s) => { s.classList.add('on'); s.classList.remove('now'); });
      setMode('idle'); setState('ready');
      if (current === me) current = null;
      resolve({ skipped });
    };
    me.finish = finish;
    audio.src = `media/voice/${line.id}.mp3`;
    audio.muted = settings.muted;
    setMode('speaking'); setState('speaking');
    let fallbackTimer = 0;
    const tick = () => {
      if (me.done) return;
      const tcur = audio.currentTime;
      let last = -1;
      for (let i = 0; i < spans.length; i++) {
        const on = starts.length ? tcur >= starts[i] - 0.05 : true;
        spans[i].classList.toggle('on', on); if (on) last = i;
      }
      spans.forEach((s, i) => s.classList.toggle('now', i === last && !audio.paused));
      me.raf = requestAnimationFrame(tick);
    };
    audio.onended = () => setTimeout(() => finish(false), 350);
    audio.onerror = () => { // no audio: reveal words on a reading clock
      const ms = Math.max(2500, line.text.split(' ').length * 320);
      spans.forEach((s, i) => setTimeout(() => s.classList.add('on'), i * (ms / spans.length)));
      fallbackTimer = setTimeout(() => finish(false), ms);
    };
    const p = audio.play();
    if (p && p.catch) p.catch(() => audio.onerror && audio.onerror());
    tick();
  });
}
/** Speak an already-rendered clip (console answers) through the same element/voice pipeline. */
export function playClip(url) {
  cancel();
  return new Promise((resolve) => {
    const me = { done: false };
    current = me;
    const finish = (skipped) => { if (me.done) return; me.done = true; audio.onended = null; audio.onerror = null; setMode('idle'); if (current === me) current = null; resolve({ skipped }); };
    me.finish = finish;
    audio.src = url; audio.muted = settings.muted; setMode('speaking');
    audio.onended = () => finish(false); audio.onerror = () => finish(true);
    const pr = audio.play(); if (pr && pr.catch) pr.catch(() => finish(true));
  });
}
export function cancel() { if (current) { audio.pause(); current.finish(true); } }
export function skip() { if (current) { audio.pause(); current.finish(true); } }
export function pause() { audio.pause(); setState('paused'); setMode('idle'); }
export function resume() { if (current && !current.done) { audio.play().catch(() => {}); setState('speaking'); setMode('speaking'); } }
export function isPlaying() { return !!current && !audio.paused; }
export function setMuted(m) { settings.muted = m; audio.muted = m; }
export function setCaptions(on) { settings.captions = on; document.body.classList.toggle('no-cc', !on); }
export { audio };
