/* 3HUE Enterprise Hub — portal behaviour.
 *
 * Renders the catalog (catalog.js) into tabs of Okta-style tiles, keeps favorites and recent
 * launches per browser, and loads the Document & Artifact Inventory either from the SharePoint
 * list (Microsoft Graph via MSAL, when config.sharepoint.clientId is set) or from the sample
 * JSON in preview mode. No build step, no framework. */
(() => {
  "use strict";

  const CATALOG = window.HUB_CATALOG || {};
  const CONFIG = window.HUB_CONFIG || {};
  const SP = CONFIG.sharepoint || {};
  const TABS = CATALOG.tabs || [];
  const GROUPS = CATALOG.groups || [];
  const APPS = CATALOG.apps || [];
  const AUDIENCES = CATALOG.audiences || [{ id: "all", label: "Everyone" }];
  const ANNOUNCEMENTS = CATALOG.announcements || [];

  const KEYS = {
    theme: "3hue-theme",
    favorites: "3hue-hub-favorites",
    recent: "3hue-hub-recent",
    audience: "3hue-hub-audience",
    inventory: "3hue-hub-inventory",
  };

  /* ───────────────────────── tiny DOM + storage helpers ───────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);

  const h = (tag, props, ...children) => {
    const el = document.createElement(tag);
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key === "html")
        el.innerHTML = value; // static SVG markup only, never data
      else if (key === "dataset") Object.assign(el.dataset, value);
      else if (key.startsWith("on") && typeof value === "function")
        el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === "style" && typeof value === "object")
        Object.entries(value).forEach(([prop, v]) => el.style.setProperty(prop, v));
      else el.setAttribute(key, value === true ? "" : value);
    });
    children.flat().forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return el;
  };

  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        /* private mode / quota — favorites simply won't persist */
      }
    },
    session(key, value) {
      try {
        if (value === undefined) {
          const raw = sessionStorage.getItem(key);
          return raw ? JSON.parse(raw) : null;
        }
        if (value === null) sessionStorage.removeItem(key);
        else sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        return null;
      }
      return value;
    },
  };

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4"/><path d="m10.9 12.1 9.1-9.1M15 7l3 3M18 4l2 2"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.5-1.5"/></svg>',
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 22V4a1 1 0 0 1 1-1h10l1 2h4v10h-9l-1-2H5"/></svg>',
    external:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3h7v7M21 3l-9 9M19 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/></svg>',
    sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
    shield:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/></svg>',
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  };

  const AUTH_LABEL = {
    microsoft: "Microsoft SSO",
    google: "Google sign-in",
    sso: "SSO",
    separate: "Separate login",
    public: "No login",
  };

  /* ───────────────────────── theme (shares the site's storage key) ───────────────────────── */
  const initTheme = () => {
    const root = document.documentElement;
    const toggles = Array.from(document.querySelectorAll(".theme-toggle"));
    const apply = (theme) => {
      if (theme === "dark") root.setAttribute("data-theme", "dark");
      else root.removeAttribute("data-theme");
      toggles.forEach((btn) => btn.setAttribute("aria-pressed", String(theme === "dark")));
    };
    let stored = null;
    try {
      stored = localStorage.getItem(KEYS.theme);
    } catch (error) {
      stored = null;
    }
    apply(stored === "dark" ? "dark" : "light");
    toggles.forEach((btn) =>
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        try {
          localStorage.setItem(KEYS.theme, next);
        } catch (error) {
          /* ignore */
        }
        apply(next);
      })
    );
  };

  /* ───────────────────────── state ───────────────────────── */
  const tabIds = new Set(TABS.map((tab) => tab.id));
  const tabFromHash = () => {
    const raw = window.location.hash.replace(/^#/, "").toLowerCase();
    return tabIds.has(raw) ? raw : null;
  };

  const state = {
    tab: tabFromHash() || (TABS[0] ? TABS[0].id : "overview"),
    query: "",
    audience: storage.get(KEYS.audience, "all"),
    favorites: new Set(storage.get(KEYS.favorites, [])),
    recent: storage.get(KEYS.recent, []),
    inventory: { status: "idle", source: null, items: [], syncedAt: null, error: null },
    docs: { query: "", category: "", classification: "", system: "", sort: "title", dir: 1 },
    account: null,
    identity: null,
  };

  if (!AUDIENCES.some((aud) => aud.id === state.audience)) state.audience = "all";

  const appById = new Map(APPS.map((app) => [app.id, app]));
  const groupById = new Map(GROUPS.map((group) => [group.id, group]));
  const tabById = new Map(TABS.map((tab) => [tab.id, tab]));
  const audienceLabel = (id) => (AUDIENCES.find((aud) => aud.id === id) || {}).label || "";

  const liveMode = Boolean(SP.clientId);

  /* Who is signed in through Cloudflare Access? get-identity is answered by Access itself on the
   * protected hostname; /api/me by this hub's Worker. Neither exists on a plain static preview, so
   * every failure here is silent. */
  const loadIdentity = async () => {
    const attempts = [
      [
        "/cdn-cgi/access/get-identity",
        (data) => ({ name: data.name || "", email: data.email || "", source: "access" }),
      ],
      [
        "/api/me",
        (data) => (data && data.email ? { name: "", email: data.email, source: "worker" } : null),
      ],
    ];
    for (const [path, map] of attempts) {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 2500);
      try {
        const res = await fetch(path, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) continue;
        const identity = map(await res.json());
        if (identity && identity.email) {
          state.identity = identity;
          render();
          return;
        }
      } catch (error) {
        /* not behind Access (local preview), or the lookup timed out */
      } finally {
        window.clearTimeout(timer);
      }
    }
  };

  const displayName = () =>
    (state.identity && state.identity.name) || (state.account && state.account.name) || "";

  /* ───────────────────────── filtering ───────────────────────── */
  const appVisible = (app) => {
    if (state.audience === "all") return true;
    const aud = app.audience;
    if (!aud || !aud.length || aud.includes("all")) return true;
    return aud.includes(state.audience);
  };

  const visibleApps = () => APPS.filter(appVisible);

  const normalize = (value) => String(value || "").toLowerCase();

  const appMatches = (app, query) => {
    if (!query) return true;
    const group = groupById.get(app.group) || {};
    const tab = tabById.get(app.tab) || {};
    const haystack = [
      app.name,
      app.subtitle,
      app.description,
      app.owner,
      app.classification,
      group.label,
      tab.label,
      ...(app.tags || []),
    ]
      .map(normalize)
      .join(" | ");
    return query.split(/\s+/).every((term) => haystack.includes(term));
  };

  const docVisible = (doc) => {
    if (state.audience === "all") return true;
    const aud = (doc.audience || []).map(normalize);
    if (!aud.length || aud.includes("everyone") || aud.includes("all")) return true;
    return aud.includes(normalize(audienceLabel(state.audience)));
  };

  const docMatches = (doc, query) => {
    if (!query) return true;
    const haystack = [
      doc.title,
      doc.category,
      doc.system,
      doc.owner,
      doc.classification,
      doc.status,
      doc.location,
      doc.description,
      ...(doc.tags || []),
    ]
      .map(normalize)
      .join(" | ");
    return query.split(/\s+/).every((term) => haystack.includes(term));
  };

  /* ───────────────────────── favorites + recent ───────────────────────── */
  const toggleFavorite = (id) => {
    if (state.favorites.has(id)) state.favorites.delete(id);
    else state.favorites.add(id);
    storage.set(KEYS.favorites, Array.from(state.favorites));
    render();
    toast(state.favorites.has(id) ? "Pinned to Overview" : "Unpinned");
  };

  const recordLaunch = (id) => {
    state.recent = [
      { id, ts: Date.now() },
      ...state.recent.filter((entry) => entry.id !== id),
    ].slice(0, 8);
    storage.set(KEYS.recent, state.recent);
  };

  /* ───────────────────────── toast ───────────────────────── */
  let toastTimer = null;
  const toast = (message) => {
    const el = $("[data-toast]");
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
    requestAnimationFrame(() => el.classList.add("is-visible"));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.classList.remove("is-visible");
      window.setTimeout(() => {
        el.hidden = true;
      }, 220);
    }, 1800);
  };

  /* ───────────────────────── tile menu ───────────────────────── */
  let openMenu = null;
  const closeMenu = () => {
    if (!openMenu) return;
    openMenu.menu.remove();
    openMenu.tile.classList.remove("is-menu-open");
    openMenu.button.setAttribute("aria-expanded", "false");
    openMenu = null;
  };

  const mailto = (to, subject, body) =>
    `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const openTileMenu = (app, tile, button) => {
    if (openMenu && openMenu.tile === tile) {
      closeMenu();
      return;
    }
    closeMenu();
    const to = app.ownerEmail || CONFIG.requestAccessEmail || "info@3hue.net";
    const menu = h(
      "div",
      { class: "tile-menu", role: "menu" },
      h("div", { class: "tile-menu-owner", text: `Owner: ${app.owner || "Unassigned"}` }),
      h(
        "a",
        {
          role: "menuitem",
          href: mailto(
            to,
            `Access request: ${app.name}`,
            `Hi,\n\nPlease grant me access to ${app.name}${app.url ? ` (${app.url})` : ""}.\n\nRole / reason:\n\nThanks`
          ),
          onClick: closeMenu,
        },
        h("span", { html: ICONS.key }),
        "Request access"
      ),
      h(
        "button",
        {
          type: "button",
          role: "menuitem",
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(app.url);
              toast("Link copied");
            } catch (error) {
              toast("Copy failed — long-press the tile instead");
            }
            closeMenu();
          },
        },
        h("span", { html: ICONS.link }),
        "Copy link"
      ),
      h(
        "a",
        {
          role: "menuitem",
          href: mailto(
            CONFIG.requestAccessEmail || "info@3hue.net",
            `Hub tile issue: ${app.name}`,
            `Tile: ${app.name}\nURL: ${app.url}\n\nWhat is wrong (dead link, wrong owner, should be removed):\n`
          ),
          onClick: closeMenu,
        },
        h("span", { html: ICONS.flag }),
        "Report a problem"
      )
    );
    tile.append(menu);
    tile.classList.add("is-menu-open");
    button.setAttribute("aria-expanded", "true");
    openMenu = { menu, tile, button };
    const first = menu.querySelector("[role=menuitem]");
    if (first) first.focus();
  };

  document.addEventListener("click", (event) => {
    if (openMenu && !openMenu.tile.contains(event.target)) closeMenu();
  });

  /* ───────────────────────── tile ───────────────────────── */
  const initials = (name) =>
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");

  const isHttp = (url) => /^https?:/i.test(url || "");

  const buildTile = (app, { compact = false } = {}) => {
    const tile = h("article", { class: "tile", dataset: { appId: app.id } });

    const icon = h("span", { class: "tile-icon", "aria-hidden": "true" });
    icon.style.setProperty("--tile", app.color || "#44a8d9");
    if (app.icon) icon.append(h("img", { src: app.icon, alt: "" }));
    else icon.textContent = app.monogram || initials(app.name);

    const meta = h("span", { class: "tile-meta" });
    if (app.auth) {
      meta.append(
        h("span", { class: `chip chip-auth-${app.auth}`, text: AUTH_LABEL[app.auth] || app.auth })
      );
    }
    if (app.classification) {
      meta.append(
        h("span", {
          class: `chip chip-class chip-class-${normalize(app.classification)}`,
          text: app.classification,
        })
      );
    }
    if (app.owner) meta.append(h("span", { class: "chip", text: app.owner }));
    if (app.verify) meta.append(h("span", { class: "chip chip-verify", text: "Verify URL" }));

    const main = h(
      "a",
      {
        class: "tile-main",
        href: app.url || "#",
        target: isHttp(app.url) ? "_blank" : null,
        rel: isHttp(app.url) ? "noopener noreferrer" : null,
        "aria-label": `${app.name}${isHttp(app.url) ? " (opens in a new tab)" : ""}`,
        onClick: () => recordLaunch(app.id),
      },
      icon,
      h(
        "span",
        { class: "tile-body" },
        h("span", { class: "tile-name", text: app.name }),
        app.subtitle ? h("span", { class: "tile-subtitle", text: app.subtitle }) : null,
        app.description ? h("span", { class: "tile-desc", text: app.description }) : null,
        meta
      )
    );

    const favButton = h("button", {
      type: "button",
      class: "icon-btn",
      "aria-label": state.favorites.has(app.id)
        ? `Unpin ${app.name}`
        : `Pin ${app.name} to Overview`,
      "aria-pressed": String(state.favorites.has(app.id)),
      html: ICONS.star,
      onClick: () => toggleFavorite(app.id),
    });
    const moreButton = h("button", {
      type: "button",
      class: "icon-btn",
      "aria-label": `More options for ${app.name}`,
      "aria-haspopup": "menu",
      "aria-expanded": "false",
      html: ICONS.more,
    });
    moreButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openTileMenu(app, tile, moreButton);
    });

    tile.append(main, h("div", { class: "tile-actions" }, favButton, moreButton));
    if (compact) tile.classList.add("tile-compact");
    return tile;
  };

  const buildTileSet = (apps, layout) => {
    const wrap = h("div", { class: layout === "list" ? "tile-list" : "tile-grid" });
    apps.forEach((app) => wrap.append(buildTile(app, { compact: layout === "list" })));
    return wrap;
  };

  const sectionHead = (title, { description, count, link } = {}) =>
    h(
      "div",
      { class: "hub-section-head" },
      h("h2", { text: title }),
      description ? h("p", { class: "hub-section-desc", text: description }) : null,
      link || null,
      count !== undefined
        ? h("span", { class: "hub-section-count", text: `${count} item${count === 1 ? "" : "s"}` })
        : null
    );

  const emptyState = (title, body) =>
    h(
      "div",
      { class: "hub-empty" },
      h("strong", { text: title }),
      body ? h("div", { text: body }) : null
    );

  /* ───────────────────────── header pieces ───────────────────────── */
  const renderAudienceSelect = () => {
    const select = $("[data-audience]");
    if (!select) return;
    select.textContent = "";
    AUDIENCES.forEach((aud) => {
      select.append(
        h("option", {
          value: aud.id,
          selected: aud.id === state.audience,
          text: aud.id === "all" ? "View as: Everyone" : `View as: ${aud.label}`,
        })
      );
    });
  };

  const renderAccount = () => {
    const slot = $("[data-account]");
    if (!slot) return;
    slot.textContent = "";
    if (state.identity) {
      const label = state.identity.name || state.identity.email;
      slot.append(
        h(
          "a",
          {
            class: "hub-account-btn",
            href: "/cdn-cgi/access/logout",
            title: `${state.identity.email} — signed in through Cloudflare Access. Click to sign out.`,
          },
          h("span", { class: "hub-avatar", text: initials(label) }),
          h("span", { class: "hub-account-name", text: label })
        )
      );
      if (liveMode && !state.account) {
        slot.append(
          h("button", {
            type: "button",
            class: "btn btn-outline btn-sm",
            text: "Connect SharePoint",
            title: "Sign in to Microsoft Graph to load the live document inventory",
            onClick: () => loadInventory({ interactive: true, force: true }),
          })
        );
      }
      return;
    }
    if (!liveMode) {
      slot.append(
        h("span", {
          class: "chip chip-verify",
          text: "Preview mode",
          title: "SharePoint list not connected yet — see internal/README.md",
        })
      );
      return;
    }
    if (state.account) {
      slot.append(
        h(
          "button",
          {
            type: "button",
            class: "hub-account-btn",
            title: `${state.account.username} — sign out`,
            onClick: signOut,
          },
          h("span", {
            class: "hub-avatar",
            text: initials(state.account.name || state.account.username),
          }),
          h("span", {
            class: "hub-account-name",
            text: state.account.name || state.account.username,
          })
        )
      );
    } else {
      slot.append(
        h("button", {
          type: "button",
          class: "btn btn-outline btn-sm",
          text: "Sign in with Microsoft",
          onClick: () => loadInventory({ interactive: true, force: true }),
        })
      );
    }
  };

  /* ───────────────────────── tabs ───────────────────────── */
  const tabCount = (tabId) => {
    if (tabId === "overview") return null;
    const apps = visibleApps().filter((app) => app.tab === tabId).length;
    if (tabId === "documents")
      return apps + (state.inventory.items || []).filter(docVisible).length;
    return apps;
  };

  const renderTabs = () => {
    const list = $("[data-tabs]");
    if (!list) return;
    list.textContent = "";
    TABS.forEach((tab) => {
      const selected = tab.id === state.tab && !state.query;
      const count = tabCount(tab.id);
      const button = h(
        "button",
        {
          type: "button",
          role: "tab",
          id: `tab-${tab.id}`,
          class: "hub-tab",
          "aria-selected": String(selected),
          "aria-controls": "hub-panel",
          tabindex: selected ? "0" : "-1",
          dataset: { tab: tab.id },
          onClick: () => setTab(tab.id),
        },
        tab.label,
        count !== null ? h("span", { class: "hub-tab-count", text: String(count) }) : null
      );
      list.append(button);
    });
    list.addEventListener("keydown", onTabKeydown);
  };

  const onTabKeydown = (event) => {
    const tabs = Array.from(event.currentTarget.querySelectorAll("[role=tab]"));
    const index = tabs.indexOf(document.activeElement);
    if (index === -1) return;
    let next = null;
    if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
    if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === "Home") next = tabs[0];
    if (event.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
      setTab(next.dataset.tab);
    }
  };

  /* Put the tab bar (and so the top of the panel) directly under the header whenever the user has
   * scrolled past it, or when it sits far below the fold (deep links on phones). The natural
   * position is measured from the hero because the tab bar itself is sticky. */
  const revealTabs = () => {
    const nav = $(".hub-tabs");
    const hero = $(".hub-hero");
    if (!nav || !hero) return;
    const headerHeight = ($(".hub-header") || { offsetHeight: 0 }).offsetHeight;
    const target = Math.max(
      Math.round(hero.getBoundingClientRect().bottom + window.scrollY - headerHeight),
      0
    );
    const belowFold = nav.getBoundingClientRect().top > window.innerHeight * 0.55;
    if (window.scrollY > target + 1 || belowFold) window.scrollTo(0, target);
  };

  const activateTab = (tabId, { reveal = true } = {}) => {
    state.tab = tabId;
    render();
    if (reveal) revealTabs();
    const panel = $("#hub-panel");
    if (panel) panel.focus({ preventScroll: true });
  };

  /* pushState instead of location.hash: a hash navigation also asks the browser to scroll to a
   * fragment, which fights the tab logic. Back/forward and manual hash edits arrive via popstate. */
  const setTab = (tabId) => {
    if (!tabIds.has(tabId)) return;
    const search = $("[data-search]");
    if (state.query) {
      state.query = "";
      if (search) search.value = "";
    }
    if (window.location.hash.replace(/^#/, "") !== tabId) {
      history.pushState(null, "", `#${tabId}`);
    }
    activateTab(tabId);
  };

  window.addEventListener("popstate", () => {
    const next = tabFromHash();
    if (next && next !== state.tab) activateTab(next);
  });

  /* ───────────────────────── hero ───────────────────────── */
  const greetingWord = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const relativeTime = (ts) => {
    if (!ts) return "—";
    const minutes = Math.round((Date.now() - ts) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.round(minutes / 60);
    return hours < 24 ? `${hours} h ago` : new Date(ts).toLocaleDateString();
  };

  const renderHero = () => {
    const greeting = $("[data-greeting]");
    if (greeting) {
      const first = displayName().trim().split(/\s+/)[0];
      greeting.textContent = `${greetingWord()}${first ? `, ${first}` : ""}.`;
    }
    const stats = $("[data-stats]");
    if (stats) {
      const launchers = visibleApps().filter((app) => app.tab !== "documents").length;
      const repos = visibleApps().filter((app) => app.tab === "documents").length;
      const docs = (state.inventory.items || []).filter(docVisible).length;
      const inv = state.inventory;
      const sourceValue =
        inv.status === "ready"
          ? inv.source === "sharepoint"
            ? "Live"
            : "Preview"
          : inv.status === "loading"
            ? "Syncing…"
            : inv.status === "error"
              ? "Error"
              : liveMode
                ? "Sign in"
                : "Preview";
      stats.textContent = "";
      [
        [String(launchers), "Launchers"],
        [String(repos), "Repositories"],
        [inv.status === "ready" ? String(docs) : "—", "Documents"],
        [
          sourceValue,
          inv.status === "ready" && inv.syncedAt
            ? `Inventory · ${relativeTime(inv.syncedAt)}`
            : "Inventory",
        ],
      ].forEach(([value, label]) =>
        stats.append(
          h(
            "div",
            { class: "hub-stat" },
            h("span", { class: "hub-stat-value", text: value }),
            h("span", { class: "hub-stat-label", text: label })
          )
        )
      );
    }
    const announce = $("[data-announcements]");
    if (announce) {
      announce.textContent = "";
      if (!ANNOUNCEMENTS.length) {
        announce.append(h("p", { class: "hub-announce-body", text: "No announcements." }));
      } else {
        ANNOUNCEMENTS.slice(0, 2).forEach((item) => announce.append(buildAnnouncement(item)));
        if (ANNOUNCEMENTS.length > 2) {
          announce.append(
            h("a", {
              class: "hub-announce-more",
              href: "#overview",
              text: `All announcements (${ANNOUNCEMENTS.length})`,
            })
          );
        }
      }
    }
  };

  const buildAnnouncement = (item) =>
    h(
      "div",
      { class: "hub-announce-item" },
      h("span", { class: "hub-announce-date", text: formatDate(item.date) }),
      item.href
        ? h("a", { class: "hub-announce-title", href: item.href, text: item.title })
        : h("span", { class: "hub-announce-title", text: item.title }),
      h("p", { class: "hub-announce-body", text: item.body })
    );

  const formatDate = (value) => {
    if (!value) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  /* ───────────────────────── panels ───────────────────────── */
  const panelHead = (tab) =>
    h(
      "div",
      { class: "hub-panel-head" },
      h(
        "div",
        null,
        h("h2", { text: tab.label }),
        tab.description ? h("p", { text: tab.description }) : null
      ),
      tab.suggested
        ? h("span", {
            class: "hub-suggested",
            text: "Suggested tab — remove from catalog.js if not wanted",
          })
        : null
    );

  const renderOverview = (panel) => {
    const tab = tabById.get("overview") || { label: "Overview" };
    panel.append(panelHead(tab));

    const main = h("div", null);
    const favorites = Array.from(state.favorites)
      .map((id) => appById.get(id))
      .filter(Boolean)
      .filter(appVisible);
    const favSection = h(
      "section",
      { class: "hub-section" },
      sectionHead("Pinned", { description: "Your shortcuts — use the star on any tile." })
    );
    favSection.append(
      favorites.length
        ? buildTileSet(favorites)
        : emptyState("Nothing pinned yet", "Hover a tile and click the star to pin it here.")
    );
    main.append(favSection);

    const recent = state.recent
      .map((entry) => appById.get(entry.id))
      .filter(Boolean)
      .filter(appVisible)
      .slice(0, 6);
    if (recent.length) {
      main.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead("Recently launched"),
          buildTileSet(recent, "list")
        )
      );
    }

    const featured = visibleApps().filter((app) => app.featured && !state.favorites.has(app.id));
    if (featured.length) {
      main.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead("Featured systems", {
            description: "The platforms most of 3HUE touches every week.",
          }),
          buildTileSet(featured)
        )
      );
    }

    const aside = h("aside", { class: "overview-aside" });
    const browse = h("div", { class: "browse-list" });
    TABS.filter((t) => t.id !== "overview").forEach((t) => {
      browse.append(
        h(
          "button",
          { type: "button", onClick: () => setTab(t.id) },
          t.label,
          h("span", { class: "hub-tab-count", text: String(tabCount(t.id)) })
        )
      );
    });
    aside.append(h("div", { class: "hub-card" }, h("h3", { text: "Browse" }), browse));

    const annCard = h("div", { class: "hub-card" }, h("h3", { text: "Announcements" }));
    if (ANNOUNCEMENTS.length)
      ANNOUNCEMENTS.forEach((item) => annCard.append(buildAnnouncement(item)));
    else annCard.append(h("p", { class: "hub-announce-body", text: "No announcements." }));
    aside.append(annCard);

    const quick = h("div", { class: "quick-links" });
    const supportTo = CONFIG.requestAccessEmail || "info@3hue.net";
    quick.append(
      h(
        "a",
        { href: mailto(supportTo, "Access request", "App / system:\nRole / reason:\n") },
        h("span", { html: ICONS.key }),
        "Request access to a system"
      ),
      h(
        "button",
        { type: "button", onClick: () => setTab("documents") },
        h("span", { html: ICONS.doc }),
        "Find a document or template"
      ),
      h(
        "button",
        { type: "button", onClick: () => setTab("security") },
        h("span", { html: ICONS.shield }),
        "Report a security incident"
      ),
      h(
        "a",
        { href: SP.libraryUrl || SP.siteUrl || "#", target: "_blank", rel: "noopener noreferrer" },
        h("span", { html: ICONS.external }),
        "Open the Internal Assets library"
      ),
      h(
        "a",
        {
          href: "https://github.com/3HUE/3HUE-Website/tree/main/internal",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        h("span", { html: ICONS.help }),
        "How to add or edit a tile"
      ),
      state.identity && state.identity.source === "access"
        ? h(
            "a",
            { href: "/cdn-cgi/access/logout" },
            h("span", { html: ICONS.key }),
            "Sign out of the hub"
          )
        : null
    );
    aside.append(h("div", { class: "hub-card" }, h("h3", { text: "Quick actions" }), quick));

    panel.append(h("div", { class: "overview-grid" }, main, aside));
  };

  const renderAppTab = (panel, tabId) => {
    const tab = tabById.get(tabId) || { id: tabId, label: tabId };
    panel.append(panelHead(tab));
    const groups = GROUPS.filter((group) => group.tab === tabId);
    let rendered = 0;
    groups.forEach((group) => {
      const apps = visibleApps().filter((app) => app.group === group.id);
      if (!apps.length) return;
      rendered += 1;
      panel.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead(group.label, { description: group.description, count: apps.length }),
          buildTileSet(apps, group.layout)
        )
      );
    });
    const orphans = visibleApps().filter((app) => app.tab === tabId && !groupById.has(app.group));
    if (orphans.length) {
      rendered += 1;
      panel.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead("Other", { count: orphans.length }),
          buildTileSet(orphans)
        )
      );
    }
    if (!rendered) {
      panel.append(
        emptyState(
          "Nothing to show for this role",
          `Switch "View as" back to Everyone to see every tile in ${tab.label}.`
        )
      );
    }
  };

  const renderSearchResults = (panel) => {
    const query = normalize(state.query).trim();
    const apps = visibleApps().filter((app) => appMatches(app, query));
    const docs = (state.inventory.items || [])
      .filter(docVisible)
      .filter((doc) => docMatches(doc, query));
    panel.append(
      h(
        "div",
        { class: "hub-panel-head" },
        h(
          "div",
          null,
          h("h2", { text: `Results for “${state.query.trim()}”` }),
          h("p", {
            text: `${apps.length} app${apps.length === 1 ? "" : "s"} · ${docs.length} document${docs.length === 1 ? "" : "s"}`,
          })
        ),
        h("button", {
          type: "button",
          class: "btn btn-ghost btn-sm",
          text: "Clear search",
          onClick: () => {
            state.query = "";
            const s = $("[data-search]");
            if (s) s.value = "";
            render();
          },
        })
      )
    );
    if (!apps.length && !docs.length) {
      panel.append(
        emptyState("No matches", "Try a vendor name, a tag like “crm”, or a document category.")
      );
      return;
    }
    TABS.forEach((tab) => {
      const inTab = apps.filter((app) => app.tab === tab.id);
      if (!inTab.length) return;
      panel.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead(tab.label, { count: inTab.length }),
          buildTileSet(inTab)
        )
      );
    });
    if (docs.length) {
      panel.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead("Documents & artifacts", { count: docs.length }),
          buildDocTable(docs)
        )
      );
    }
  };

  /* ───────────────────────── documents ───────────────────────── */
  const uniqueValues = (items, key) =>
    Array.from(new Set(items.map((item) => item[key]).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );

  const filteredDocs = () => {
    const query = normalize(state.docs.query).trim();
    const items = (state.inventory.items || [])
      .filter(docVisible)
      .filter((doc) => docMatches(doc, query))
      .filter((doc) => !state.docs.category || doc.category === state.docs.category)
      .filter(
        (doc) => !state.docs.classification || doc.classification === state.docs.classification
      )
      .filter((doc) => !state.docs.system || doc.system === state.docs.system);
    const key = state.docs.sort;
    const dir = state.docs.dir;
    return items.sort((a, b) => {
      const av = normalize(a[key]);
      const bv = normalize(b[key]);
      if (av === bv) return normalize(a.title).localeCompare(normalize(b.title));
      if (!av) return 1;
      if (!bv) return -1;
      return av.localeCompare(bv) * dir;
    });
  };

  const DOC_COLUMNS = [
    { key: "title", label: "Document" },
    { key: "category", label: "Category" },
    { key: "system", label: "System" },
    { key: "classification", label: "Classification" },
    { key: "owner", label: "Owner" },
    { key: "status", label: "Status" },
    { key: "lastReviewed", label: "Last reviewed" },
  ];

  const buildDocTable = (items, { sortable = false } = {}) => {
    const thead = h("thead");
    const headRow = h("tr");
    DOC_COLUMNS.forEach((col) => {
      const th = h("th", { scope: "col" });
      if (sortable) {
        const active = state.docs.sort === col.key;
        th.append(
          h(
            "button",
            {
              type: "button",
              "aria-sort": active ? (state.docs.dir === 1 ? "ascending" : "descending") : null,
              onClick: () => {
                if (state.docs.sort === col.key) state.docs.dir *= -1;
                else {
                  state.docs.sort = col.key;
                  state.docs.dir = 1;
                }
                render();
              },
            },
            col.label,
            h("span", { html: ICONS.sort })
          )
        );
      } else th.textContent = col.label;
      headRow.append(th);
    });
    thead.append(headRow);

    const tbody = h("tbody");
    const today = new Date().toISOString().slice(0, 10);
    items.forEach((doc) => {
      const titleCell = h("td", { class: "doc-title", "data-label": "Document" });
      titleCell.append(
        doc.link
          ? h("a", {
              href: doc.link,
              target: isHttp(doc.link) ? "_blank" : null,
              rel: "noopener noreferrer",
              text: doc.title,
            })
          : h("span", { text: doc.title })
      );
      if (doc.description)
        titleCell.append(h("span", { class: "doc-desc", text: doc.description }));
      const locBits = [doc.location, doc.version ? `v${doc.version}` : ""]
        .filter(Boolean)
        .join(" · ");
      if (locBits) titleCell.append(h("span", { class: "doc-loc", text: locBits }));

      const classification = doc.classification
        ? h("span", {
            class: `chip chip-class chip-class-${normalize(doc.classification)}`,
            text: doc.classification,
          })
        : "—";
      const status = doc.status
        ? h("span", {
            class: `chip chip-status-${normalize(doc.status).replace(/\s+/g, "-")}`,
            text: doc.status,
          })
        : "—";
      const overdue =
        doc.nextReview && doc.nextReview < today && normalize(doc.status) !== "archived";
      tbody.append(
        h(
          "tr",
          null,
          titleCell,
          h("td", { "data-label": "Category", text: doc.category || "—" }),
          h("td", { "data-label": "System", text: doc.system || "—" }),
          h("td", { "data-label": "Classification" }, classification),
          h("td", { "data-label": "Owner", text: doc.owner || "—" }),
          h("td", { "data-label": "Status" }, status),
          h("td", {
            class: `doc-date${overdue ? " is-overdue" : ""}`,
            "data-label": "Last reviewed",
            text: doc.lastReviewed
              ? formatDate(doc.lastReviewed) + (overdue ? " · review overdue" : "")
              : "—",
            title: doc.nextReview ? `Next review ${formatDate(doc.nextReview)}` : null,
          })
        )
      );
    });

    return h("div", { class: "doc-table-wrap" }, h("table", { class: "doc-table" }, thead, tbody));
  };

  const csvEscape = (value) => {
    const text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };

  const exportCsv = (items) => {
    const columns = [
      "title",
      "category",
      "system",
      "owner",
      "classification",
      "status",
      "version",
      "location",
      "link",
      "lastReviewed",
      "nextReview",
      "audience",
      "tags",
      "description",
    ];
    const lines = [columns.join(",")].concat(
      items.map((doc) => columns.map((key) => csvEscape(doc[key])).join(","))
    );
    const blob = new Blob([`﻿${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = h("a", {
      href: url,
      download: `3hue-document-inventory-${new Date().toISOString().slice(0, 10)}.csv`,
    });
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`Exported ${items.length} record${items.length === 1 ? "" : "s"}`);
  };

  const buildDocStatus = () => {
    const inv = state.inventory;
    const status = h(
      "div",
      { class: "doc-status", role: "status", "aria-live": "polite" },
      h("span", { class: "dot", "aria-hidden": "true" })
    );
    if (inv.status === "loading") {
      status.classList.add("is-loading");
      status.append(h("span", { text: "Loading inventory from SharePoint…" }));
    } else if (inv.status === "error") {
      status.classList.add("is-error");
      status.append(
        h("span", { text: `Could not load the SharePoint list: ${inv.error || "unknown error"}` })
      );
      status.append(
        h("button", {
          type: "button",
          class: "btn btn-outline btn-sm",
          text: "Retry",
          onClick: () => loadInventory({ interactive: true, force: true }),
        })
      );
    } else if (inv.status === "signin-required") {
      status.append(
        h("span", { text: "Sign in with your 3HUE Microsoft account to load the live inventory." })
      );
      status.append(
        h("button", {
          type: "button",
          class: "btn btn-primary btn-sm",
          text: "Sign in with Microsoft",
          onClick: () => loadInventory({ interactive: true, force: true }),
        })
      );
    } else if (inv.status === "ready" && inv.source === "sharepoint") {
      status.classList.add("is-live");
      status.append(
        h("span", {
          text: `Live · ${inv.items.length} records · ${SP.listName || "SharePoint list"} · synced ${relativeTime(inv.syncedAt)}`,
        })
      );
      status.append(
        h("button", {
          type: "button",
          class: "btn btn-ghost btn-sm",
          text: "Refresh",
          onClick: () => loadInventory({ interactive: true, force: true }),
        })
      );
    } else if (inv.status === "ready") {
      status.append(
        h("span", {
          text: `Preview data · ${inv.items.length} sample records from the website repository · SharePoint list not connected`,
        })
      );
    } else {
      status.append(h("span", { text: "Inventory not loaded." }));
    }
    return status;
  };

  const renderDocuments = (panel) => {
    const tab = tabById.get("documents") || { label: "Documents & Artifacts" };
    panel.append(panelHead(tab));

    const repos = visibleApps().filter((app) => app.tab === "documents");
    const repoGroup = groupById.get("repos") || { label: "Secure Data Repositories" };
    if (repos.length) {
      panel.append(
        h(
          "section",
          { class: "hub-section" },
          sectionHead(repoGroup.label, { description: repoGroup.description, count: repos.length }),
          buildTileSet(repos)
        )
      );
    }

    const section = h("section", { class: "hub-section" });
    const libraryLink = SP.libraryUrl
      ? h(
          "a",
          {
            class: "hub-section-link",
            href: SP.libraryUrl,
            target: "_blank",
            rel: "noopener noreferrer",
          },
          "Open in SharePoint ",
          h("span", { html: ICONS.external })
        )
      : null;
    section.append(
      sectionHead("Document & Artifact Inventory", {
        description:
          "Policies, templates, collateral, case studies and architecture — managed by Teriah in the Internal Assets site.",
        link: libraryLink,
      })
    );

    const all = (state.inventory.items || []).filter(docVisible);
    const items = filteredDocs();

    const search = h("input", {
      type: "search",
      placeholder: "Filter documents…",
      value: state.docs.query,
      "aria-label": "Filter documents",
      autocomplete: "off",
    });
    search.addEventListener("input", () => {
      state.docs.query = search.value;
      rerenderDocsOnly(section);
    });

    const buildSelect = (key, label, values) => {
      const select = h(
        "select",
        { "aria-label": label },
        h("option", { value: "", text: `All ${label.toLowerCase()}` })
      );
      values.forEach((value) =>
        select.append(h("option", { value, text: value, selected: state.docs[key] === value }))
      );
      select.addEventListener("change", () => {
        state.docs[key] = select.value;
        rerenderDocsOnly(section);
      });
      return select;
    };

    const toolbar = h(
      "div",
      { class: "doc-toolbar" },
      h("label", { class: "doc-search" }, h("span", { html: ICONS.search }), search),
      buildSelect("category", "Categories", uniqueValues(all, "category")),
      buildSelect("system", "Systems", uniqueValues(all, "system")),
      buildSelect("classification", "Classifications", uniqueValues(all, "classification")),
      h(
        "div",
        { class: "doc-toolbar-actions" },
        h("button", {
          type: "button",
          class: "btn btn-outline btn-sm",
          text: "Export CSV",
          disabled: !items.length,
          onClick: () => exportCsv(filteredDocs()),
        })
      )
    );
    section.append(toolbar, buildDocStatus());

    if (state.inventory.status === "ready") {
      section.append(
        items.length
          ? buildDocTable(items, { sortable: true })
          : emptyState(
              "No documents match",
              all.length
                ? "Clear a filter or widen the role view."
                : "The connected list has no items yet."
            )
      );
    } else if (state.inventory.status === "signin-required") {
      section.append(
        emptyState(
          "Sign in to see the inventory",
          "Your SharePoint permissions decide which records you see."
        )
      );
    }
    panel.append(section);
  };

  /* Re-render only the inventory section so typing in its filter box keeps focus. */
  const rerenderDocsOnly = (section) => {
    const items = filteredDocs();
    const old = section.querySelector(".doc-table-wrap, .hub-empty");
    const next = items.length
      ? buildDocTable(items, { sortable: true })
      : emptyState("No documents match", "Clear a filter or widen the role view.");
    if (old) old.replaceWith(next);
    else section.append(next);
    const exportBtn = section.querySelector(".doc-toolbar-actions .btn");
    if (exportBtn) exportBtn.disabled = !items.length;
  };

  /* ───────────────────────── main render ───────────────────────── */
  const render = () => {
    closeMenu();
    renderTabs();
    renderHero();
    renderAccount();
    const banner = $("[data-banner]");
    if (banner) {
      banner.hidden = liveMode;
      if (!liveMode && !banner.dataset.ready) {
        banner.dataset.ready = "true";
        banner.append(
          h(
            "span",
            null,
            h("strong", { text: "Preview mode. " }),
            "Tiles are live; the document inventory shows sample records until the SharePoint list is connected (set clientId in config.js)."
          ),
          h(
            "span",
            { class: "hub-banner-actions" },
            h("a", {
              href: "https://github.com/3HUE/3HUE-Website/blob/main/internal/README.md",
              target: "_blank",
              rel: "noopener noreferrer",
              text: "Setup guide",
            })
          )
        );
      }
    }
    const panel = $("#hub-panel");
    if (!panel) return;
    panel.textContent = "";
    panel.setAttribute("aria-labelledby", `tab-${state.tab}`);
    if (state.query.trim()) renderSearchResults(panel);
    else if (state.tab === "overview") renderOverview(panel);
    else if (state.tab === "documents") renderDocuments(panel);
    else renderAppTab(panel, state.tab);
  };

  /* ───────────────────────── inventory loading ───────────────────────── */
  const setInventory = (patch) => {
    state.inventory = { ...state.inventory, ...patch };
    render();
  };

  const loadSample = async () => {
    setInventory({ status: "loading", source: "sample", error: null });
    try {
      const res = await fetch(CONFIG.sampleInventoryUrl || "data/inventory.sample.json", {
        cache: "no-cache",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInventory({
        status: "ready",
        source: "sample",
        items: data.items || [],
        syncedAt: Date.now(),
      });
    } catch (error) {
      setInventory({
        status: "error",
        source: "sample",
        items: [],
        error: `sample data unavailable (${error.message})`,
      });
    }
  };

  let msalApp = null;
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`failed to load ${src}`));
      document.head.append(script);
    });

  const getMsal = async () => {
    if (!window.msal) await loadScript("lib/msal-browser.min.js");
    if (!msalApp) {
      msalApp = new window.msal.PublicClientApplication({
        auth: {
          clientId: SP.clientId,
          authority: `https://login.microsoftonline.com/${SP.tenantId || "organizations"}`,
          redirectUri: `${window.location.origin}${window.location.pathname}`,
        },
        cache: { cacheLocation: "sessionStorage", storeAuthStateInCookie: false },
      });
      if (typeof msalApp.initialize === "function") await msalApp.initialize();
      const redirect = await msalApp.handleRedirectPromise().catch(() => null);
      if (redirect && redirect.account) msalApp.setActiveAccount(redirect.account);
    }
    return msalApp;
  };

  const getGraphToken = async (interactive) => {
    const app = await getMsal();
    const scopes = SP.scopes && SP.scopes.length ? SP.scopes : ["Sites.Read.All"];
    let account = app.getActiveAccount() || app.getAllAccounts()[0] || null;
    const loginHint = state.identity && state.identity.email ? state.identity.email : undefined;
    if (!account && loginHint) {
      try {
        account = (await app.ssoSilent({ scopes, loginHint })).account; // same Entra session as Access
      } catch (error) {
        account = null;
      }
    }
    if (!account) {
      if (!interactive) return null;
      const request = loginHint ? { scopes, loginHint } : { scopes, prompt: "select_account" };
      const result = await app.loginPopup(request);
      account = result.account;
    }
    app.setActiveAccount(account);
    state.account = { name: account.name, username: account.username };
    try {
      const result = await app.acquireTokenSilent({ scopes, account });
      return result.accessToken;
    } catch (error) {
      if (interactive) {
        const result = await app.acquireTokenPopup({ scopes, account });
        return result.accessToken;
      }
      const needsInteraction =
        window.msal.InteractionRequiredAuthError &&
        error instanceof window.msal.InteractionRequiredAuthError;
      if (needsInteraction) return null;
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const app = await getMsal();
      await app.logoutPopup({ account: app.getActiveAccount() || undefined });
    } catch (error) {
      /* popup closed — fall through and clear local state anyway */
    }
    state.account = null;
    storage.session(KEYS.inventory, null);
    setInventory({
      status: "signin-required",
      source: "sharepoint",
      items: [],
      syncedAt: null,
      error: null,
    });
  };

  const graphGet = async (url, token) => {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) {
      let detail = "";
      try {
        const body = await res.json();
        detail = body.error && body.error.message ? body.error.message : "";
      } catch (error) {
        detail = "";
      }
      const err = new Error(`Graph ${res.status}${detail ? ` — ${detail}` : ""}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  };

  const asText = (value) => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (Array.isArray(value)) return value.map(asText).filter(Boolean).join(", ");
    return (
      value.LookupValue || value.Url || value.Description || value.displayName || value.Email || ""
    );
  };

  const asList = (value) => {
    if (Array.isArray(value)) return value.map(asText).filter(Boolean);
    const text = asText(value);
    return text
      ? text
          .split(/[;,]\s*/)
          .map((part) => part.trim())
          .filter(Boolean)
      : [];
  };

  const asDate = (value) => (typeof value === "string" ? value.slice(0, 10) : "");

  const mapSharePointItem = (item) => {
    const f = item.fields || {};
    const m = SP.fieldMap || {};
    const linkField = f[m.link];
    const link =
      (linkField && typeof linkField === "object" && linkField.Url) ||
      (typeof linkField === "string" ? linkField : "") ||
      item.webUrl ||
      "";
    return {
      id: item.id,
      title: asText(f[m.title]) || asText(f.Title) || asText(f.FileLeafRef),
      category: asText(f[m.category]),
      system: asText(f[m.system]),
      owner: asText(f[m.owner]),
      classification: asText(f[m.classification]),
      status: asText(f[m.status]),
      version: asText(f[m.version]),
      link,
      location: asText(f[m.location]) || "SharePoint",
      lastReviewed: asDate(f[m.lastReviewed]),
      nextReview: asDate(f[m.nextReview]),
      audience: asList(f[m.audience]),
      tags: asList(f[m.tags]),
      description: asText(f[m.description]),
      modified: item.lastModifiedDateTime || "",
    };
  };

  const fetchSharePointItems = async (token) => {
    const base = "https://graph.microsoft.com/v1.0";
    const site = await graphGet(`${base}/sites/${SP.hostname}:${SP.sitePath}`, token);
    const listRef = SP.listId || encodeURIComponent(SP.listName || "Document & Artifact Inventory");
    const top = SP.pageSize || 200;
    const fields = Object.values(SP.fieldMap || {}).filter(Boolean);
    const itemsBase = `${base}/sites/${site.id}/lists/${listRef}/items?$top=${top}`;
    let page;
    try {
      page = await graphGet(`${itemsBase}&$expand=fields($select=${fields.join(",")})`, token);
    } catch (error) {
      if (error.status !== 400) throw error;
      page = await graphGet(`${itemsBase}&$expand=fields`, token); // a mapped column doesn't exist yet
    }
    const raw = Array.from(page.value || []);
    let next = page["@odata.nextLink"];
    while (next) {
      const more = await graphGet(next, token);
      raw.push(...(more.value || []));
      next = more["@odata.nextLink"];
    }
    return raw.map(mapSharePointItem).filter((doc) => doc.title);
  };

  const loadInventory = async ({ force = false, interactive = false } = {}) => {
    if (!liveMode) {
      await loadSample();
      return;
    }
    if (!force) {
      const cached = storage.session(KEYS.inventory);
      const ttl = (SP.cacheMinutes || 10) * 60000;
      if (cached && cached.ts && Date.now() - cached.ts < ttl && Array.isArray(cached.items)) {
        state.account = cached.account || state.account;
        setInventory({
          status: "ready",
          source: "sharepoint",
          items: cached.items,
          syncedAt: cached.ts,
          error: null,
        });
        return;
      }
    }
    setInventory({ status: "loading", source: "sharepoint", error: null });
    try {
      const token = await getGraphToken(interactive);
      if (!token) {
        setInventory({ status: "signin-required", source: "sharepoint", items: [] });
        return;
      }
      const items = await fetchSharePointItems(token);
      const ts = Date.now();
      storage.session(KEYS.inventory, { ts, items, account: state.account });
      setInventory({ status: "ready", source: "sharepoint", items, syncedAt: ts, error: null });
    } catch (error) {
      const message =
        error && error.errorCode === "user_cancelled"
          ? "sign-in was cancelled"
          : (error && error.message) || "unknown error";
      setInventory({ status: "error", source: "sharepoint", items: [], error: message });
    }
  };

  /* ───────────────────────── wiring ───────────────────────── */
  const init = () => {
    initTheme();
    renderAudienceSelect();

    const search = $("[data-search]");
    if (search) {
      let timer = null;
      search.addEventListener("input", () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          state.query = search.value;
          render();
        }, 120);
      });
      search.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && search.value) {
          search.value = "";
          state.query = "";
          render();
        }
      });
    }

    const audience = $("[data-audience]");
    if (audience) {
      audience.addEventListener("change", () => {
        state.audience = audience.value;
        storage.set(KEYS.audience, state.audience);
        render();
      });
    }

    document.addEventListener("keydown", (event) => {
      const target = event.target;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (event.key === "/" && !typing && search) {
        event.preventDefault();
        search.focus();
        search.select();
      }
      if (event.key === "Escape") closeMenu();
    });

    const year = $("[data-year]");
    if (year) year.textContent = String(new Date().getFullYear());

    render();
    if (tabFromHash() && state.tab !== "overview") revealTabs();
    loadIdentity().finally(() => loadInventory()); // identity first so Graph sign-in can be silent
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
