// Intro film overlay. Resolves when the visitor enters the building.
const intro = document.getElementById('intro');
const video = document.getElementById('intro-video');
const soundBtn = document.getElementById('intro-sound');
const logo = document.getElementById('intro-logo');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Welding reveal: trace the shield, the banner and the letters with a travelling spark, then light the mark.
let logoRun = 0, logoTimers = [];
function resetLogo() {
  logoTimers.forEach(clearTimeout); logoTimers = [];
  if (!logo) return;
  logo.classList.remove('on', 'trace', 'lit');
  logo.querySelectorAll('.spark').forEach((s) => s.classList.remove('go'));
  // restart CSS animations by cloning the paths' animation state
  logo.querySelectorAll('path').forEach((p) => { p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = ''; });
}
function revealLogo() {
  if (!logo || logo.classList.contains('on')) return;
  const run = ++logoRun;
  logo.classList.add('on');
  if (reduced) { logo.classList.add('lit'); return; }
  logo.classList.add('trace');
  let total = 0;
  logo.querySelectorAll('path.line').forEach((p) => {
    const t = parseFloat(p.style.getPropertyValue('--t')) * 1000, d = parseFloat(p.style.getPropertyValue('--d')) * 1000;
    const sp = logo.querySelector('#sp-' + p.id.slice(3));
    const am = sp && sp.querySelector('animateMotion');
    logoTimers.push(setTimeout(() => { if (run !== logoRun) return; sp.classList.add('go'); try { am.beginElement(); } catch (e) {} }, t));
    logoTimers.push(setTimeout(() => { if (run !== logoRun) return; sp.classList.remove('go'); }, t + d));
    total = Math.max(total, t + d);
  });
  logoTimers.push(setTimeout(() => { if (run === logoRun) logo.classList.add('lit'); }, total + 150));
}

export function runIntro() {
  return new Promise((resolve) => {
    intro.hidden = false;
    intro.classList.remove('out');
    video.muted = true; soundBtn.textContent = 'Unmute'; soundBtn.setAttribute('aria-pressed', 'false');
    video.currentTime = 0;
    resetLogo();
    const p = video.play(); if (p && p.catch) p.catch(() => {});
    // Logo comes in as the film fades to black (or after a beat if autoplay is blocked)
    const onTime = () => { if (video.currentTime >= Math.max(0, (video.duration || 12) - 1.0)) revealLogo(); };
    const onEnded = () => revealLogo();
    const stall = setTimeout(() => { if (video.currentTime < 0.5) revealLogo(); }, 2500);
    video.addEventListener('timeupdate', onTime); video.addEventListener('ended', onEnded);

    const finish = () => {
      intro.classList.add('out');
      video.pause();
      setTimeout(() => { intro.hidden = true; }, 950);
      cleanup(); resolve();
    };
    const onSound = () => {
      video.muted = !video.muted;
      soundBtn.textContent = video.muted ? 'Unmute' : 'Mute';
      soundBtn.setAttribute('aria-pressed', String(!video.muted));
      if (!video.muted && video.ended) { video.currentTime = 0; video.play().catch(() => {}); }
    };
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') finish(); };
    const enter = document.getElementById('intro-enter'), skip = document.getElementById('intro-skip');
    enter.addEventListener('click', finish); skip.addEventListener('click', finish);
    soundBtn.addEventListener('click', onSound); document.addEventListener('keydown', onKey);
    function cleanup() {
      clearTimeout(stall); video.removeEventListener('timeupdate', onTime); video.removeEventListener('ended', onEnded);
      enter.removeEventListener('click', finish); skip.removeEventListener('click', finish);
      soundBtn.removeEventListener('click', onSound); document.removeEventListener('keydown', onKey);
    }
    enter.focus();
  });
}
