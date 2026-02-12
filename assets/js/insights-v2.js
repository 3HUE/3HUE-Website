(() => {
  const progress = document.querySelector("[data-iv2-progress]");
  const updateProgress = () => {
    if (!progress) return;
    const root = document.documentElement;
    const maxScroll = root.scrollHeight - window.innerHeight;
    const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
  };

  const copyButtons = document.querySelectorAll("[data-copy-link]");
  const copySectionLink = async (button) => {
    const targetId = button.getAttribute("data-copy-link");
    if (!targetId) return;
    const url = `${window.location.origin}${window.location.pathname}#${targetId}`;
    try {
      await navigator.clipboard.writeText(url);
      const original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(() => {
        button.textContent = original;
      }, 1200);
    } catch (_err) {
      window.location.hash = targetId;
    }
  };

  copyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      copySectionLink(button);
    });
  });

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
})();
