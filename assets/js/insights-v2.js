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
      button.classList.add("is-copied");
      window.setTimeout(() => {
        button.textContent = original;
        button.classList.remove("is-copied");
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

  // Stagger a scroll-reveal fade-up across the article's component grids by
  // tagging them with the site-wide `.reveal` class (see assets/js/main.js and
  // assets/css/styles.css) before main.js's IntersectionObserver runs.
  const revealGroups = document.querySelectorAll(
    ".iv2-cap-grid, .iv2-kpi-grid, .iv2-two-col, .iv2-ref-grid, .iv2-path-grid, .iv2-signal-list, .iv2-board-list"
  );
  revealGroups.forEach((group) => {
    Array.from(group.children).forEach((child, index) => {
      child.style.transitionDelay = `${Math.min(index, 5) * 70}ms`;
      child.classList.add("reveal");
    });
  });

  // Table-of-contents scroll-spy: highlight the section currently in view.
  const tocLinks = Array.from(document.querySelectorAll(".iv2-toc a[href^='#']"));
  const sections = tocLinks
    .map((link) => document.getElementById(link.getAttribute("href").slice(1)))
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      tocLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    };

    const tocObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-112px 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => tocObserver.observe(section));
  }
})();
