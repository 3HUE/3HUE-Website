(() => {
  const body = document.body;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menuClose = document.querySelector('[data-menu-close]');
  const menuOverlay = document.querySelector('[data-menu-overlay]');
  const mobileMenu = document.querySelector('#mobile-menu');

  const setMenuState = (isOpen) => {
    body.classList.toggle('menu-open', isOpen);
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    }
    if (mobileMenu) {
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    }
  };

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      setMenuState(!body.classList.contains('menu-open'));
    });
  }

  if (menuClose) {
    menuClose.addEventListener('click', () => setMenuState(false));
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', () => setMenuState(false));
  }

  const accordionButtons = document.querySelectorAll('[data-accordion-toggle]');
  accordionButtons.forEach((button) => {
    const targetId = button.getAttribute('aria-controls');
    const panel = targetId ? document.getElementById(targetId) : null;
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!isExpanded));
      if (panel) {
        panel.hidden = isExpanded;
      }
    });
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const accordionGroups = document.querySelectorAll('[data-accordion="exclusive"]');

  accordionGroups.forEach((group) => {
    const buttons = Array.from(group.querySelectorAll('.acc-card'));

    const syncPanelHeight = (panel) => {
      if (!panel || !panel.classList.contains('is-open')) {
        return;
      }
      if (panel.style.maxHeight === 'none') {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
          panel.style.maxHeight = 'none';
        });
        return;
      }
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    };

    const closePanel = (button, panel) => {
      button.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
      if (prefersReducedMotion) {
        panel.hidden = true;
        panel.style.maxHeight = '';
        return;
      }
      panel.hidden = false;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      panel.offsetHeight;
      panel.style.maxHeight = '0px';
      const onEnd = (event) => {
        if (event.propertyName === 'max-height') {
          panel.hidden = true;
          panel.style.maxHeight = '';
          panel.removeEventListener('transitionend', onEnd);
        }
      };
      panel.addEventListener('transitionend', onEnd);
    };

    const openPanel = (button, panel) => {
      button.setAttribute('aria-expanded', 'true');
      panel.hidden = false;
      panel.classList.add('is-open');
      if (prefersReducedMotion) {
        panel.style.maxHeight = '';
        return;
      }
      panel.style.maxHeight = '0px';
      panel.offsetHeight;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      const onEnd = (event) => {
        if (event.propertyName === 'max-height' && panel.classList.contains('is-open')) {
          panel.style.maxHeight = 'none';
          panel.removeEventListener('transitionend', onEnd);
        }
      };
      panel.addEventListener('transitionend', onEnd);
    };

    buttons.forEach((button) => {
      const targetId = button.getAttribute('aria-controls');
      const panel = targetId ? document.getElementById(targetId) : null;
      if (!panel) {
        return;
      }
      const panelImages = Array.from(panel.querySelectorAll('img'));
      panelImages.forEach((img) => {
        img.addEventListener('load', () => syncPanelHeight(panel));
      });
      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        buttons.forEach((btn) => {
          const panelId = btn.getAttribute('aria-controls');
          const panelEl = panelId ? document.getElementById(panelId) : null;
          if (panelEl && btn !== button && btn.getAttribute('aria-expanded') === 'true') {
            closePanel(btn, panelEl);
          }
        });
        if (isExpanded) {
          closePanel(button, panel);
        } else {
          openPanel(button, panel);
          group.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      });
    });

    window.addEventListener('resize', () => {
      const openPanelEl = buttons
        .map((btn) => {
          const panelId = btn.getAttribute('aria-controls');
          const panelEl = panelId ? document.getElementById(panelId) : null;
          return panelEl && panelEl.classList.contains('is-open') ? panelEl : null;
        })
        .find(Boolean);
      if (openPanelEl) {
        syncPanelHeight(openPanelEl);
      }
    });
  });

  const dropdownButtons = document.querySelectorAll('[data-dropdown-toggle]');
  const closeDropdowns = () => {
    dropdownButtons.forEach((button) => {
      button.setAttribute('aria-expanded', 'false');
      const item = button.closest('.nav-item');
      if (item) {
        item.classList.remove('is-open');
      }
    });
  };

  dropdownButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const item = button.closest('.nav-item');
      const isOpen = item ? item.classList.contains('is-open') : false;
      closeDropdowns();
      if (item && !isOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const solutionMenus = document.querySelectorAll('#dropdown-solutions');
  solutionMenus.forEach((menu) => {
    const tabs = Array.from(menu.querySelectorAll('.mega-tab'));
    const preview = menu.querySelector('.mega-preview');
    const previewImage = preview ? preview.querySelector('img') : null;
    const previewTitle = preview ? preview.querySelector('.mega-preview-title') : null;
    const previewDesc = preview ? preview.querySelector('.mega-preview-desc') : null;
    let previewTimeout;
    if (!tabs.length) {
      return;
    }
    const setActive = (value) => {
      menu.setAttribute('data-mega-active', value);
      tabs.forEach((tab) => {
        const isActive = tab.getAttribute('data-mega-tab') === value;
        tab.classList.toggle('is-active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });
    };
    tabs.forEach((tab) => {
      const target = tab.getAttribute('data-mega-tab');
      if (!target) {
        return;
      }
      tab.addEventListener('mouseenter', () => setActive(target));
      tab.addEventListener('focus', () => setActive(target));
      tab.addEventListener('click', (event) => {
        event.preventDefault();
        setActive(target);
      });
    });

    const updatePreview = (link) => {
      if (!preview || !previewImage || !previewTitle || !previewDesc || !link) {
        return;
      }
      const nextTitle = link.getAttribute('data-preview-title');
      const nextText = link.getAttribute('data-preview-text');
      const nextImage = link.getAttribute('data-preview-image');
      const nextAlt = link.getAttribute('data-preview-alt') || nextTitle || 'Preview image';
      if (!nextTitle || !nextText || !nextImage) {
        return;
      }
      preview.classList.add('is-fading');
      window.clearTimeout(previewTimeout);
      previewTimeout = window.setTimeout(() => {
        previewImage.src = nextImage;
        previewImage.alt = nextAlt;
        previewTitle.textContent = nextTitle;
        previewDesc.textContent = nextText;
        preview.classList.remove('is-fading');
      }, 120);
    };

    const previewLinks = Array.from(menu.querySelectorAll('.mega-link[data-preview-title]'));
    previewLinks.forEach((link) => {
      link.addEventListener('mouseenter', () => updatePreview(link));
      link.addEventListener('focus', () => updatePreview(link));
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.nav-item')) {
      closeDropdowns();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMenuState(false);
      closeDropdowns();
    }
  });

  const normalizePath = (path) => path.replace(/\\/g, '/').toLowerCase();
  const rawPath = normalizePath(window.location.pathname);
  const currentPath = rawPath.endsWith('/') ? `${rawPath}index.html` : rawPath;
  const findActiveLink = (links) => {
    let match = null;
    links.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) {
        return;
      }
      try {
        const resolvedPath = normalizePath(new URL(href, window.location.href).pathname);
        if (currentPath === resolvedPath) {
          match = link;
        }
      } catch (error) {
        return;
      }
    });
    return match;
  };

  const allNavLinks = Array.from(document.querySelectorAll('.nav-list a, .mobile-nav a'));
  const activeLink = findActiveLink(allNavLinks);
  if (activeLink) {
    activeLink.setAttribute('aria-current', 'page');
    const navItem = activeLink.closest('.nav-item');
    if (navItem) {
      navItem.classList.add('is-active');
    }
  }

  const main = document.querySelector('main');
  const pathMarker = '/3hue-new/';
  const normalizedPath = normalizePath(window.location.pathname);
  const markerIndex = normalizedPath.indexOf(pathMarker);
  const relativePath = markerIndex !== -1 ? normalizedPath.slice(markerIndex + pathMarker.length) : normalizedPath;
  const segments = relativePath.split('/').filter(Boolean);
  const sectionFromPath = segments[0];
  const sectionNavMap = {
    services: 'dropdown-solutions',
    industries: 'dropdown-solutions',
    insights: 'dropdown-insights',
    frameworks: 'dropdown-insights',
  };

  if (!activeLink && sectionFromPath && sectionNavMap[sectionFromPath]) {
    const trigger = document.querySelector(`[aria-controls="${sectionNavMap[sectionFromPath]}"]`);
    const navItem = trigger ? trigger.closest('.nav-item') : null;
    if (navItem) {
      navItem.classList.add('is-active');
    }
  }
  const isDeepPage = segments.length > 1 && ['services', 'industries', 'frameworks', 'insights', 'trust'].includes(segments[0]) && segments[1] !== 'index.html';

  if (main && isDeepPage) {
    const prefix = '../'.repeat(Math.max(segments.length - 1, 1));
    const section = segments[0];
    const sectionLabels = {
      services: 'Services',
      industries: 'Industries',
      frameworks: 'Frameworks',
      insights: 'Insights',
      trust: 'Trust Center',
    };
    const sectionLabel = sectionLabels[section] || section;
    const currentTitle = document.querySelector('h1')?.textContent?.trim() || document.title;

    const breadcrumbNav = document.createElement('nav');
    breadcrumbNav.className = 'breadcrumbs';
    breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');
    breadcrumbNav.innerHTML = `
      <div class="container">
        <ol>
          <li><a href="${prefix}index.html">Home</a></li>
          <li><a href="${prefix}${section}/index.html">${sectionLabel}</a></li>
          <li aria-current="page">${currentTitle}</li>
        </ol>
      </div>
    `;
    main.parentNode.insertBefore(breadcrumbNav, main);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  const lightboxImages = Array.from(document.querySelectorAll('[data-lightbox-src]'));
  if (lightboxImages.length) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" type="button" aria-label="Close image preview">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
        <img alt="">
      </div>
    `;
    document.body.appendChild(overlay);

    const lightboxImage = overlay.querySelector('img');
    const closeButton = overlay.querySelector('.lightbox-close');

    const closeLightbox = () => {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    };

    const openLightbox = (source, altText) => {
      lightboxImage.src = source;
      lightboxImage.alt = altText || 'Expanded view';
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    };

    lightboxImages.forEach((img) => {
      img.addEventListener('click', () => {
        const source = img.getAttribute('data-lightbox-src') || img.getAttribute('src');
        openLightbox(source, img.getAttribute('alt'));
      });
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeLightbox();
      }
    });

    if (closeButton) {
      closeButton.addEventListener('click', closeLightbox);
    }

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }

  const postCards = Array.from(document.querySelectorAll('[data-post-card]'));
  if (postCards.length) {
    const searchInput = document.querySelector('[data-insights-search]');
    const filterButtons = Array.from(document.querySelectorAll('[data-filter-tag]'));
    const countEl = document.querySelector('[data-insights-count]');

    const applyFilters = () => {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const activeFilter = filterButtons.find((btn) => btn.classList.contains('is-active'));
      const tag = activeFilter ? activeFilter.getAttribute('data-filter-tag') : 'all';
      let visibleCount = 0;

      postCards.forEach((card) => {
        const tags = (card.getAttribute('data-tags') || '').toLowerCase();
        const text = (card.getAttribute('data-search') || '').toLowerCase();
        const matchesTag = tag === 'all' || tags.includes(tag);
        const matchesQuery = !query || text.includes(query);
        const isVisible = matchesTag && matchesQuery;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) {
          visibleCount += 1;
        }
      });

      if (countEl) {
        countEl.textContent = `${visibleCount} insight${visibleCount === 1 ? '' : 's'}`;
      }
    };

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((btn) => btn.classList.remove('is-active'));
        button.classList.add('is-active');
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilters);
    }

    applyFilters();
  }
})();
const storageKey = "3hue-theme";
const themeToggles = document.querySelectorAll(".theme-toggle");
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

const applyTheme = (theme) => {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  themeToggles.forEach((btn) => {
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
};

const storedTheme = localStorage.getItem(storageKey);
if (storedTheme) {
  applyTheme(storedTheme);
} else if (prefersDark) {
  applyTheme("dark");
}

themeToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const nextTheme = isDark ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  });
});
