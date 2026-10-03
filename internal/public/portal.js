/* 3HUE Enterprise Hub — application.
 *
 * ES module. Renders the catalog (catalog.js) and the digital workforce (agents.js) into a
 * desktop-first launcher with a sidebar, command palette, slide-over panels and an agent chat,
 * plus a dedicated phone layer (bottom bar, sheets). The Document & Artifact Inventory loads from
 * SharePoint via Microsoft Graph when configured (config.js), otherwise from sample data.
 * No framework, no build step. */
import { HUB_CONFIG as CONFIG } from "./config.js";
import { HUB_CATALOG as CATALOG } from "./catalog.js";
import { HUB_BUILD } from "./build.js";
import {
  AGENTS,
  STATUS as AGENT_STATUS,
  agentById,
  avatarSvg,
  greetingFor,
  pick,
  partOfDay,
} from "./agents.js";

const SP = CONFIG.sharepoint || {};
const TABS = (CATALOG.tabs || []).filter((tab) => tab.id !== "overview");
const GROUPS = CATALOG.groups || [];
let APPS = CATALOG.apps || [];
const AUDIENCES = CATALOG.audiences || [{ id: "all", label: "Everyone" }];
let ANNOUNCEMENTS = CATALOG.announcements || [];
const CONCIERGE = agentById("huey") || AGENTS[0];
const SUPPORT_EMAIL = CONFIG.requestAccessEmail || "info@3hue.net";

const KEYS = {
  theme: "3hue-theme",
  rail: "3hue-hub-rail",
  favorites: "3hue-hub-favorites",
  recent: "3hue-hub-recent",
  audience: "3hue-hub-audience",
  inventory: "3hue-hub-inventory",
  chat: "3hue-hub-chat",
};

/* ───────────────────────── icons (static SVG, 24-grid, stroke) ───────────────────────── */
const svg = (paths, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${paths}</svg>`;
const I = {
  home: svg('<path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'),
  grid: svg(
    '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'
  ),
  layers: svg('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 17 9 5 9-5"/>'),
  server: svg(
    '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>'
  ),
  target: svg(
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
  ),
  shield: svg('<path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  users: svg(
    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.5c3 .2 5.5 2.3 5.5 5.5"/>'
  ),
  folder: svg(
    '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'
  ),
  sparkles: svg(
    '<path d="m12 3 1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>'
  ),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  sun: svg(
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
  ),
  moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  star: svg('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  more: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',
  external: svg(
    '<path d="M14 3h7v7M21 3l-9 9M19 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6"/>'
  ),
  key: svg('<circle cx="8" cy="15" r="4"/><path d="m10.9 12.1 9.1-9.1M15 7l3 3M18 4l2 2"/>'),
  link: svg(
    '<path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.5-1.5"/>'
  ),
  flag: svg('<path d="M4 22V4a1 1 0 0 1 1-1h10l1 2h4v10h-9l-1-2H5"/>'),
  send: svg('<path d="m3 11 18-8-8 18-2-7z"/>'),
  chevronLeft: svg('<path d="m15 6-6 6 6 6"/>'),
  chevronRight: svg('<path d="m9 6 6 6-6 6"/>'),
  check: svg('<path d="m5 12 4 4L19 6"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  sort: svg('<path d="m8 9 4-4 4 4M8 15l4 4 4-4"/>'),
  doc: svg(
    '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>'
  ),
  phone: svg(
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'
  ),
  alert: svg('<path d="M12 3 2 21h20z"/><path d="M12 10v5M12 18h.01"/>'),
  message: svg('<path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4.6A8 8 0 1 1 21 12z"/>'),
  logout: svg('<path d="M10 17l5-5-5-5M15 12H3M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/>'),
  download: svg('<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>'),
  refresh: svg('<path d="M20 11a8 8 0 1 0 2 5.3"/><path d="M22 3v6h-6"/>'),
  pin: svg('<path d="M12 17v5M8 3h8l-1 7 3 3H6l3-3z"/>'),
  command: svg(
    '<path d="M9 9V6a3 3 0 1 0-3 3h3zm0 0v6m0-6h6m-6 6H6a3 3 0 1 0 3 3v-3zm6-6V6a3 3 0 1 1 3 3h-3zm0 0v6m0 0h3a3 3 0 1 1-3 3v-3z"/>'
  ),
  enter: svg('<path d="M9 10 4 15l5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>'),
  calendar: svg(
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>'
  ),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  book: svg(
    '<path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 0-3 3z"/><path d="M4 4v16a3 3 0 0 1 3-3h12"/>'
  ),
  panelLeft: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'),
  edit: svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  trash: svg('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/><path d="M10 11v6M14 11v6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  sliders: svg(
    '<path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h10M18 18h2"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>'
  ),
  userPlus: svg(
    '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M19 8v6M16 11h6"/>'
  ),
};

const SECTION_ICON = {
  core: I.grid,
  business: I.layers,
  infrastructure: I.server,
  acquisition: I.target,
  security: I.shield,
  people: I.users,
  documents: I.folder,
};

const AUTH_LABEL = {
  microsoft: "Microsoft SSO",
  google: "Google sign-in",
  sso: "SSO",
  separate: "Separate login",
  public: "No login",
};

/* ───────────────────────── DOM + storage helpers ───────────────────────── */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const h = (tag, props, ...children) => {
  const el = document.createElement(tag);
  Object.entries(props || {}).forEach(([key, value]) => {
    if (value === null || value === undefined || value === false) return;
    if (key === "class") el.className = value;
    else if (key === "text") el.textContent = value;
    else if (key === "html")
      el.innerHTML = value; // static markup (icons, portraits) only — never user or model text
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
      /* storage unavailable — preferences simply won't persist */
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

const normalize = (value) => String(value || "").toLowerCase();
const initials = (name) =>
  String(name || "")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
const isHttp = (url) => /^https?:/i.test(url || "");
const mailto = (to, subject, body) =>
  `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const formatDate = (value, opts = { year: "numeric", month: "short", day: "numeric" }) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, opts);
};
const relativeTime = (ts) => {
  if (!ts) return "—";
  const minutes = Math.round((Date.now() - ts) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} h ago` : new Date(ts).toLocaleDateString();
};
const today = () => new Date().toISOString().slice(0, 10);

/* ───────────────────────── state ───────────────────────── */
const tabById = new Map(TABS.map((tab) => [tab.id, tab]));
const groupById = new Map(GROUPS.map((group) => [group.id, group]));
let appById = new Map(APPS.map((app) => [app.id, app]));

const state = {
  route: { view: "home" },
  audience: storage.get(KEYS.audience, "all"),
  favorites: new Set(storage.get(KEYS.favorites, [])),
  recent: storage.get(KEYS.recent, []),
  inventory: { status: "idle", source: null, items: [], syncedAt: null, error: null },
  docs: { query: "", category: "", classification: "", system: "", sort: "title", dir: 1 },
  sectionFilter: {},
  identity: null,
  account: null,
  role: "member",
  roleChecked: false,
  serverBuild: null,
  catalog: {
    source: "static",
    version: 0,
    updatedAt: null,
    updatedBy: null,
    storage: false,
    loaded: false,
  },
  ai: { enabled: false, checked: false },
  chat: storage.get(KEYS.chat, []),
  chatBusy: false,
};
if (!AUDIENCES.some((aud) => aud.id === state.audience)) state.audience = "all";
const liveMode = Boolean(SP.clientId);

/* ───────────────────────── routing ───────────────────────── */
const parseHash = () => {
  const raw = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (!raw || raw === "home" || raw === "overview") return { view: "home" };
  if (raw === "team") return { view: "team" };
  if (raw.startsWith("team/")) return { view: "team", agent: raw.slice(5) };
  if (raw === "ask") return { ...state.route, ask: true };
  if (raw === "documents") return { view: "documents" };
  if (raw === "admin") return { view: "admin" };
  if (tabById.has(raw)) return { view: "section", section: raw };
  return { view: "home" };
};

const routeHash = (route) => {
  if (route.view === "home") return "#home";
  if (route.view === "team") return route.agent ? `#team/${route.agent}` : "#team";
  if (route.view === "documents") return "#documents";
  if (route.view === "admin") return "#admin";
  if (route.view === "section") return `#${route.section}`;
  return "#home";
};

const navigate = (route, { replace = false } = {}) => {
  const hash = routeHash(route);
  if (window.location.hash !== hash) {
    if (replace) history.replaceState(null, "", hash);
    else history.pushState(null, "", hash);
  }
  state.route = route;
  closeDrawer();
  closeSheet();
  renderView();
  renderNav();
  const main = $("#main");
  if (main) main.focus({ preventScroll: true });
  if (window.scrollY > 0) window.scrollTo(0, 0);
};

window.addEventListener("popstate", () => {
  const route = parseHash();
  if (route.ask) {
    openAsk();
    return;
  }
  state.route = route;
  renderView();
  renderNav();
  if (route.agent) openAgent(route.agent);
});

/* ───────────────────────── filtering ───────────────────────── */
const appVisible = (app) => {
  if (state.audience === "all") return true;
  const aud = app.audience;
  if (!aud || !aud.length || aud.includes("all")) return true;
  return aud.includes(state.audience);
};
const visibleApps = () => APPS.filter(appVisible);
const audienceLabel = (id) => (AUDIENCES.find((aud) => aud.id === id) || {}).label || "";

const docVisible = (doc) => {
  if (state.audience === "all") return true;
  const aud = (doc.audience || []).map(normalize);
  if (!aud.length || aud.includes("everyone") || aud.includes("all")) return true;
  return aud.includes(normalize(audienceLabel(state.audience)));
};

const appText = (app) => {
  const group = groupById.get(app.group) || {};
  const tab = tabById.get(app.tab) || {};
  return [
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
};
const docText = (doc) =>
  [
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
const matchesAll = (text, query) =>
  query
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => text.includes(term));

/* ───────────────────────── favorites, recent, toast ───────────────────────── */
const toggleFavorite = (id) => {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  storage.set(KEYS.favorites, Array.from(state.favorites));
  renderView();
  toast(state.favorites.has(id) ? "Pinned to Home" : "Unpinned");
};

const recordLaunch = (id) => {
  state.recent = [{ id, ts: Date.now() }, ...state.recent.filter((entry) => entry.id !== id)].slice(
    0,
    10
  );
  storage.set(KEYS.recent, state.recent);
};

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

/* ───────────────────────── theme & chrome ───────────────────────── */
const applyTheme = (theme) => {
  const dark = theme === "dark";
  document.documentElement.toggleAttribute("data-theme", dark);
  if (dark) document.documentElement.setAttribute("data-theme", "dark");
  $$(".theme-switch").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(dark));
    const icon = btn.querySelector(".theme-icon");
    if (icon) icon.innerHTML = dark ? I.moon : I.sun;
    const label = btn.querySelector("span.label");
    if (label) label.textContent = dark ? "Midnight" : "Daylight";
  });
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#070b12" : "#f3f5f9");
};
const toggleTheme = () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  try {
    localStorage.setItem(KEYS.theme, next);
  } catch (error) {
    /* ignore */
  }
  applyTheme(next);
};

const setRail = (collapsed) => {
  document.body.classList.toggle("rail", collapsed);
  storage.set(KEYS.rail, collapsed);
  const btn = $("[data-rail-toggle]");
  if (btn) {
    btn.setAttribute("aria-pressed", String(collapsed));
    btn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
    btn.title = collapsed ? "Expand sidebar" : "Collapse sidebar";
  }
};

const overlay = () => $("[data-overlay]");
const syncOverlay = () => {
  const open =
    document.body.classList.contains("drawer-open") ||
    $$(".panel.is-open, .sheet.is-open").length > 0;
  overlay()?.classList.toggle("is-open", open);
  document.body.classList.toggle("no-scroll", open && window.innerWidth < 1025);
};
const openDrawer = () => {
  document.body.classList.add("drawer-open");
  syncOverlay();
};
const closeDrawer = () => {
  document.body.classList.remove("drawer-open");
  syncOverlay();
};
const openSheet = () => {
  renderSheet();
  $("[data-sheet]")?.classList.add("is-open");
  syncOverlay();
};
const closeSheet = () => {
  $("[data-sheet]")?.classList.remove("is-open");
  syncOverlay();
};
const closeEverything = () => {
  closeDrawer();
  closeSheet();
  closeAgent();
  closeAsk();
  closeEditor();
  closePalette();
  closeMenu();
};

/* ───────────────────────── navigation chrome ───────────────────────── */
const sectionCount = (id) => {
  const apps = visibleApps().filter((app) => app.tab === id).length;
  if (id === "documents") return apps + (state.inventory.items || []).filter(docVisible).length;
  return apps;
};

const navItem = (route, icon, label, { count, current = false, avatar = null } = {}) =>
  h(
    "button",
    {
      type: "button",
      class: "nav-item",
      "aria-current": current ? "page" : null,
      onClick: () => navigate(route),
    },
    avatar ? h("span", { class: "nav-avatar", html: avatar }) : h("span", { html: icon }),
    h("span", { class: "nav-label", text: label }),
    count !== undefined ? h("span", { class: "nav-count", text: String(count) }) : null
  );

const isCurrent = (route) => {
  const r = state.route;
  if (route.view !== r.view) return false;
  if (route.view === "section") return route.section === r.section;
  return true;
};

const renderNav = () => {
  const nav = $("[data-nav]");
  if (nav) {
    nav.textContent = "";
    nav.append(
      h(
        "div",
        { class: "nav-group" },
        navItem({ view: "home" }, I.home, "Home", { current: isCurrent({ view: "home" }) })
      ),
      h(
        "div",
        { class: "nav-group" },
        h("div", { class: "eyebrow", text: "Workspace" }),
        ...TABS.filter((tab) => tab.id !== "documents").map((tab) =>
          navItem({ view: "section", section: tab.id }, SECTION_ICON[tab.id] || I.grid, tab.label, {
            count: sectionCount(tab.id),
            current: isCurrent({ view: "section", section: tab.id }),
          })
        ),
        navItem({ view: "documents" }, I.folder, "Documents & Artifacts", {
          count: sectionCount("documents"),
          current: isCurrent({ view: "documents" }),
        })
      ),
      h(
        "div",
        { class: "nav-group" },
        h("div", { class: "eyebrow", text: "Team" }),
        navItem({ view: "team" }, I.sparkles, "Digital Workforce", {
          count: AGENTS.length,
          current: isCurrent({ view: "team" }),
        }),
        h(
          "button",
          { type: "button", class: "nav-item", onClick: () => openAsk() },
          h("span", { class: "nav-avatar", html: avatarSvg(CONCIERGE, { size: 22 }) }),
          h("span", { class: "nav-label", text: `Ask ${CONCIERGE.name}` }),
          h("span", {
            class: "nav-count",
            html: state.ai.enabled
              ? '<span class="dot dot-ok dot-live" title="AI answers on"></span>'
              : "",
          })
        )
      ),
      isAdmin()
        ? h(
            "div",
            { class: "nav-group" },
            h("div", { class: "eyebrow", text: "Manage" }),
            navItem({ view: "admin" }, I.sliders, "Administration", {
              current: isCurrent({ view: "admin" }),
            })
          )
        : null
    );
  }

  const title = $("[data-topbar-title]");
  if (title) {
    const r = state.route;
    const label =
      r.view === "home"
        ? "Home"
        : r.view === "team"
          ? "Digital Workforce"
          : r.view === "documents"
            ? "Documents & Artifacts"
            : r.view === "admin"
              ? "Administration"
              : (tabById.get(r.section) || {}).label || "";
    title.textContent = "";
    title.append(
      h("span", { class: "eyebrow", text: "Enterprise Hub" }),
      h("strong", { text: label })
    );
  }

  $$("[data-bottom]").forEach((btn) => {
    const target = btn.dataset.bottom;
    const current =
      (target === "home" && state.route.view === "home") ||
      (target === "team" && state.route.view === "team") ||
      (target === "browse" && (state.route.view === "section" || state.route.view === "documents"));
    if (current) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });

  renderIdentity();
};

const renderSheet = () => {
  const body = $("[data-sheet-body]");
  if (!body) return;
  body.textContent = "";
  body.append(
    h("div", { class: "eyebrow", style: { padding: "8px 10px" }, text: "Browse" }),
    ...TABS.filter((tab) => tab.id !== "documents").map((tab) =>
      navItem({ view: "section", section: tab.id }, SECTION_ICON[tab.id] || I.grid, tab.label, {
        count: sectionCount(tab.id),
        current: isCurrent({ view: "section", section: tab.id }),
      })
    ),
    navItem({ view: "documents" }, I.folder, "Documents & Artifacts", {
      count: sectionCount("documents"),
      current: isCurrent({ view: "documents" }),
    }),
    navItem({ view: "team" }, I.sparkles, "Digital Workforce", {
      count: AGENTS.length,
      current: isCurrent({ view: "team" }),
    }),
    isAdmin()
      ? navItem({ view: "admin" }, I.sliders, "Administration", {
          current: isCurrent({ view: "admin" }),
        })
      : null
  );
};

const renderIdentity = () => {
  const slot = $("[data-identity]");
  if (!slot) return;
  slot.textContent = "";
  const who =
    state.identity ||
    (state.account ? { name: state.account.name, email: state.account.username } : null);
  if (who) {
    slot.append(
      h("span", { class: "identity-avatar", text: initials(who.name || who.email) }),
      h(
        "span",
        { class: "identity-text" },
        h("strong", { text: who.name || who.email }),
        who.name ? h("span", { text: who.email || "" }) : null,
        h("span", {
          class: `chip chip-caps role-chip ${
            state.role === "super" ? "chip-brand" : state.role === "admin" ? "chip-info" : ""
          }`,
          text: roleLabel(state.role),
          title: "Role resolved by the hub for this sign-in",
        })
      ),
      who.source === "access" || who.source === "worker"
        ? h("a", {
            class: "icon-btn",
            href: "/cdn-cgi/access/logout",
            title: "Sign out",
            "aria-label": "Sign out",
            html: I.logout,
          })
        : null
    );
  } else {
    slot.append(
      h("span", { class: "identity-avatar", text: "3H" }),
      h(
        "span",
        { class: "identity-text" },
        h("strong", { text: liveMode ? "Not signed in" : "Preview mode" }),
        h("span", { text: liveMode ? "Sign in for the live inventory" : "Sample inventory data" })
      )
    );
  }
};

/* ───────────────────────── tiles ───────────────────────── */
let openMenuRef = null;
const closeMenu = () => {
  if (!openMenuRef) return;
  openMenuRef.menu.remove();
  openMenuRef.tile.classList.remove("is-menu-open");
  openMenuRef.button.setAttribute("aria-expanded", "false");
  openMenuRef = null;
};
document.addEventListener("click", (event) => {
  if (openMenuRef && !openMenuRef.tile.contains(event.target)) closeMenu();
});

const accessMail = (app) =>
  mailto(
    app.ownerEmail || SUPPORT_EMAIL,
    `Access request: ${app.name}`,
    `Hi,\n\nPlease grant me access to ${app.name}${app.url ? ` (${app.url})` : ""}.\n\nRole / reason:\n\nThanks`
  );

const openTileMenu = (app, tile, button) => {
  if (openMenuRef && openMenuRef.tile === tile) {
    closeMenu();
    return;
  }
  closeMenu();
  const menu = h(
    "div",
    { class: "tile-menu", role: "menu" },
    h("div", { class: "menu-owner", text: `Owner · ${app.owner || "Unassigned"}` }),
    h(
      "a",
      { role: "menuitem", href: accessMail(app), onClick: closeMenu },
      h("span", { html: I.key }),
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
            toast("Copy failed");
          }
          closeMenu();
        },
      },
      h("span", { html: I.link }),
      "Copy link"
    ),
    h(
      "button",
      {
        type: "button",
        role: "menuitem",
        onClick: () => {
          closeMenu();
          openAsk(`Who owns ${app.name} and how do I get access?`);
        },
      },
      h("span", { html: I.message }),
      `Ask ${CONCIERGE.name} about it`
    ),
    h(
      "a",
      {
        role: "menuitem",
        href: mailto(
          SUPPORT_EMAIL,
          `Hub tile issue: ${app.name}`,
          `Tile: ${app.name}\nURL: ${app.url}\n\nWhat is wrong (dead link, wrong owner, should be removed):\n`
        ),
        onClick: closeMenu,
      },
      h("span", { html: I.flag }),
      "Report a problem"
    ),
    isAdmin() ? h("div", { class: "menu-sep", role: "separator" }) : null,
    isAdmin()
      ? h(
          "button",
          {
            type: "button",
            role: "menuitem",
            onClick: () => {
              closeMenu();
              openEditor(app);
            },
          },
          h("span", { html: I.edit }),
          "Edit tile"
        )
      : null,
    isAdmin()
      ? h(
          "button",
          {
            type: "button",
            role: "menuitem",
            class: "is-danger",
            onClick: () => {
              closeMenu();
              removeTile(app);
            },
          },
          h("span", { html: I.trash }),
          "Remove tile"
        )
      : null
  );
  tile.append(menu);
  tile.classList.add("is-menu-open");
  button.setAttribute("aria-expanded", "true");
  openMenuRef = { menu, tile, button };
  menu.querySelector("[role=menuitem]")?.focus();
};

const tileIcon = (app, extraClass = "") => {
  const icon = h("span", { class: `tile-icon ${extraClass}`.trim(), "aria-hidden": "true" });
  icon.style.setProperty("--tile", app.color || "#44a8d9");
  if (app.icon) icon.append(h("img", { src: app.icon, alt: "" }));
  else icon.textContent = app.monogram || initials(app.name);
  return icon;
};

const buildTile = (app, index = 0) => {
  const tile = h("article", {
    class: "tile",
    dataset: { appId: app.id },
    style: { "--i": String(Math.min(index, 14)) },
  });
  const meta = h("span", { class: "tile-meta" });
  if (app.auth)
    meta.append(
      h("span", {
        class: `chip ${app.auth === "separate" ? "" : app.auth === "public" ? "chip-info" : "chip-ok"}`,
        text: AUTH_LABEL[app.auth] || app.auth,
      })
    );
  if (app.classification)
    meta.append(
      h("span", {
        class: `chip chip-caps chip-${classTone(app.classification)}`,
        text: app.classification,
      })
    );
  if (app.owner) meta.append(h("span", { class: "chip", text: app.owner }));
  if (app.verify) meta.append(h("span", { class: "chip chip-warn", text: "Verify URL" }));

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
    tileIcon(app),
    h(
      "span",
      { class: "tile-body" },
      h("span", { class: "tile-name", text: app.name }),
      app.subtitle ? h("span", { class: "tile-subtitle", text: app.subtitle }) : null,
      app.description ? h("span", { class: "tile-desc", text: app.description }) : null,
      meta
    )
  );
  const fav = h("button", {
    type: "button",
    class: "icon-btn",
    "aria-label": state.favorites.has(app.id) ? `Unpin ${app.name}` : `Pin ${app.name} to Home`,
    "aria-pressed": String(state.favorites.has(app.id)),
    html: I.star,
    onClick: () => toggleFavorite(app.id),
  });
  const more = h("button", {
    type: "button",
    class: "icon-btn",
    "aria-label": `More options for ${app.name}`,
    "aria-haspopup": "menu",
    "aria-expanded": "false",
    html: I.more,
  });
  more.addEventListener("click", (event) => {
    event.stopPropagation();
    openTileMenu(app, tile, more);
  });
  const edit = isAdmin()
    ? h("button", {
        type: "button",
        class: "icon-btn tile-edit",
        "aria-label": `Edit ${app.name}`,
        title: "Edit tile",
        html: I.edit,
        onClick: (event) => {
          event.stopPropagation();
          openEditor(app);
        },
      })
    : null;
  tile.append(main, h("div", { class: "tile-actions" }, edit, fav, more));
  return tile;
};

const classTone = (value) => {
  const v = normalize(value);
  if (v === "public") return "ok";
  if (v === "internal") return "info";
  if (v === "confidential") return "warn";
  if (v === "restricted") return "danger";
  return "";
};

const tileSet = (apps, layout) => {
  const wrap = h("div", {
    class: layout === "list" ? "tile-list" : layout === "row" ? "row-scroll" : "tile-grid",
  });
  apps.forEach((app, index) => wrap.append(buildTile(app, index)));
  return wrap;
};

const sectionBlock = (title, { desc, aside, count } = {}, ...content) =>
  h(
    "section",
    { class: "section" },
    h(
      "div",
      { class: "section-head" },
      h("h2", { text: title }),
      desc ? h("span", { class: "section-desc", text: desc }) : null,
      aside || count !== undefined
        ? h(
            "div",
            { class: "section-aside" },
            aside || null,
            count !== undefined
              ? h("span", { text: `${count} item${count === 1 ? "" : "s"}` })
              : null
          )
        : null
    ),
    ...content
  );

const emptyState = (title, body, action) =>
  h(
    "div",
    { class: "empty" },
    h("strong", { text: title }),
    body ? h("span", { text: body }) : null,
    action || null
  );

/* ───────────────────────── views ───────────────────────── */
const renderView = () => {
  closeMenu();
  const main = $("#main");
  if (!main) return;
  main.textContent = "";
  const r = state.route;
  if (state.serverBuild && state.serverBuild !== HUB_BUILD) {
    // The Worker runs a newer build than the files this tab loaded: offer a reload.
    main.append(
      h(
        "div",
        { class: "notice", role: "status" },
        h("strong", { text: "A newer version of the hub is available" }),
        h("span", {
          text: `This tab loaded build ${HUB_BUILD}; the server is on ${state.serverBuild}.`,
        }),
        h(
          "span",
          { class: "notice-actions" },
          h("button", {
            type: "button",
            class: "btn btn-primary btn-sm",
            text: "Reload now",
            onClick: () => window.location.reload(),
          })
        )
      )
    );
  }
  if (r.view === "home") renderHome(main);
  else if (r.view === "team") renderTeam(main);
  else if (r.view === "documents") renderDocuments(main);
  else if (r.view === "admin") renderAdmin(main);
  else renderSection(main, r.section);
  const buildSlot = $("[data-build]");
  if (buildSlot)
    buildSlot.textContent = `Build ${HUB_BUILD}${
      state.serverBuild && state.serverBuild !== HUB_BUILD ? ` (server ${state.serverBuild})` : ""
    }`;
  const banner = $("[data-banner]");
  if (banner) banner.hidden = liveMode || r.view !== "documents";
};

const firstName = () => {
  const name =
    (state.identity && state.identity.name) || (state.account && state.account.name) || "";
  return name.trim().split(/\s+/)[0] || "";
};

const conciergeNote = () => {
  const inv = state.inventory;
  const overdue = (inv.items || []).filter(
    (doc) => doc.nextReview && doc.nextReview < today() && normalize(doc.status) !== "archived"
  );
  const verify = APPS.filter((app) => app.verify).length;
  if (inv.status === "ready" && overdue.length) {
    return {
      text: `${overdue.length} document${overdue.length === 1 ? " is" : "s are"} past its review date. Want the list?`,
      prompt: "What's due for review?",
    };
  }
  if (!liveMode) {
    return {
      text: `The inventory is still on sample data while Teriah builds the SharePoint list. In the meantime I can find anything in the ${visibleApps().length} tiles here.`,
      prompt: "What can you help me with?",
    };
  }
  if (verify)
    return {
      text: `${verify} tiles still need their address confirmed — I've marked them. Otherwise, all quiet.`,
      prompt: "Which tiles need verification?",
    };
  return {
    text: "All quiet in the building. Ask me where anything lives.",
    prompt: "What can you help me with?",
  };
};

const renderHome = (main) => {
  const inv = state.inventory;
  const launchers = visibleApps().filter((app) => app.tab !== "documents").length;
  const repos = visibleApps().filter((app) => app.tab === "documents").length;
  const docs = (inv.items || []).filter(docVisible).length;
  const now = new Date();
  const note = conciergeNote();
  const name = firstName();

  const hero = h(
    "section",
    { class: "hero" },
    h(
      "div",
      { class: "hero-greeting rise" },
      h(
        "div",
        { class: "hero-date" },
        h("span", {
          class: "eyebrow eyebrow-brand",
          text: now.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          }),
        }),
        state.identity
          ? h("span", { class: "chip chip-ok" }, h("span", { class: "dot dot-ok" }), "Signed in")
          : null
      ),
      h("h1", { text: `${partOfDay(now)}${name ? `, ${name}` : ""}.` }),
      h("p", {
        class: "lead",
        text: "Every 3HUE system, document and teammate in one place. Pin what you use, press ⌘K to jump anywhere, or just ask.",
      }),
      h(
        "div",
        { class: "hero-stats" },
        stat(String(launchers), "Launchers"),
        stat(String(repos), "Repositories"),
        stat(inv.status === "ready" ? String(docs) : "—", "Documents"),
        stat(
          inv.status === "ready"
            ? inv.source === "sharepoint"
              ? "Live"
              : "Sample"
            : inv.status === "loading"
              ? "Syncing"
              : "—",
          inv.syncedAt ? `Inventory · ${relativeTime(inv.syncedAt)}` : "Inventory"
        )
      )
    ),
    h(
      "aside",
      { class: "concierge rise", style: { "animation-delay": "60ms" } },
      h(
        "div",
        { class: "concierge-head" },
        h("span", { html: avatarSvg(CONCIERGE, { size: 56 }) }),
        h("div", null, h("strong", { text: CONCIERGE.name }), h("span", { text: CONCIERGE.role }))
      ),
      h("div", { class: "concierge-note", text: note.text }),
      h(
        "div",
        { class: "concierge-actions" },
        h(
          "button",
          { type: "button", class: "btn btn-primary", onClick: () => openAsk(note.prompt) },
          h("span", { html: I.message }),
          `Ask ${CONCIERGE.name}`
        ),
        h(
          "button",
          { type: "button", class: "btn", onClick: () => openAgent(CONCIERGE.id) },
          "Meet the team"
        )
      )
    )
  );
  main.append(hero);

  const favorites = Array.from(state.favorites)
    .map((id) => appById.get(id))
    .filter(Boolean)
    .filter(appVisible);
  main.append(
    sectionBlock(
      "Pinned",
      { desc: "Your shortcuts — the star on any tile." },
      favorites.length
        ? tileSet(favorites)
        : emptyState(
            "Nothing pinned yet",
            "Hover a tile and press the star, or pin from the command palette."
          )
    )
  );

  const recent = state.recent
    .map((entry) => appById.get(entry.id))
    .filter(Boolean)
    .filter(appVisible)
    .slice(0, 8);
  if (recent.length)
    main.append(sectionBlock("Continue", { desc: "Recently launched" }, tileSet(recent, "row")));

  main.append(
    sectionBlock(
      "Digital teammates",
      {
        desc: "AI colleagues on the 3HUE roster.",
        aside: h(
          "button",
          {
            type: "button",
            class: "btn btn-ghost btn-sm",
            onClick: () => navigate({ view: "team" }),
          },
          "Meet everyone",
          h("span", { html: I.arrow })
        ),
      },
      h(
        "div",
        { class: "agent-strip" },
        ...[...AGENTS]
          .sort((a, b) => (a.status === "active" ? 0 : 1) - (b.status === "active" ? 0 : 1))
          .slice(0, 8)
          .map((agent) => agentChip(agent))
      )
    )
  );

  const featured = visibleApps().filter((app) => app.featured && !state.favorites.has(app.id));
  if (featured.length)
    main.append(
      sectionBlock(
        "Featured systems",
        { desc: "What most of 3HUE touches every week." },
        tileSet(featured)
      )
    );

  main.append(
    sectionBlock(
      "Field quick actions",
      { desc: "One tap from a phone." },
      h(
        "div",
        { class: "quick-grid" },
        quick("tel:+19547384454", I.phone, "Call the office"),
        quick("https://teams.microsoft.com/", I.message, "Open Teams"),
        quick("https://outlook.office.com/calendar/", I.calendar, "My calendar"),
        quick(
          mailto(SUPPORT_EMAIL, "Access request", "App / system:\nRole / reason:\n"),
          I.key,
          "Request access"
        ),
        quick(
          mailto(
            SUPPORT_EMAIL,
            "SECURITY INCIDENT - please triage",
            "What happened:\nWhen:\nDevice / account:\n"
          ),
          I.alert,
          "Report an incident",
          "danger"
        ),
        quick(SP.libraryUrl || SP.siteUrl, I.folder, "Internal Assets")
      )
    )
  );

  main.append(
    sectionBlock(
      "Announcements",
      undefined,
      ANNOUNCEMENTS.length
        ? h("div", { class: "announce-list" }, ...ANNOUNCEMENTS.map((item) => announce(item)))
        : emptyState("No announcements")
    )
  );

  main.append(
    sectionBlock(
      "Browse the hub",
      undefined,
      h(
        "div",
        { class: "browse-grid" },
        ...TABS.map((tab) =>
          h(
            "button",
            {
              type: "button",
              class: "browse-card",
              onClick: () =>
                navigate(
                  tab.id === "documents"
                    ? { view: "documents" }
                    : { view: "section", section: tab.id }
                ),
            },
            h("span", { class: "browse-icon", html: SECTION_ICON[tab.id] || I.grid }),
            h("strong", { text: tab.label }),
            h("span", { text: `${sectionCount(tab.id)} items · ${tab.description || ""}` })
          )
        )
      )
    )
  );
};

const stat = (value, label) =>
  h("div", { class: "stat" }, h("strong", { text: value }), h("span", { text: label }));
const quick = (href, icon, label, extra = "") =>
  h(
    "a",
    {
      class: `quick-action ${extra}`.trim(),
      href,
      target: isHttp(href) ? "_blank" : null,
      rel: isHttp(href) ? "noopener noreferrer" : null,
    },
    h("span", { html: icon }),
    label
  );

const announce = (item) => {
  const author = agentById(item.author) || CONCIERGE;
  return h(
    "article",
    { class: "announce" },
    h("span", { html: avatarSvg(author, { size: 40 }) }),
    h(
      "div",
      null,
      h(
        "div",
        { class: "announce-meta" },
        h("strong", { text: author.name }),
        h("span", { text: author.role }),
        h("span", { text: "·" }),
        h("span", { text: formatDate(item.date) })
      ),
      h("h3", { text: item.title }),
      h("p", { text: item.body }),
      item.href ? h("a", { href: item.href, text: "Read more" }) : null
    )
  );
};

const renderSection = (main, sectionId) => {
  const tab = tabById.get(sectionId);
  if (!tab) {
    navigate({ view: "home" }, { replace: true });
    return;
  }
  const groups = GROUPS.filter((group) => group.tab === sectionId);
  const apps = visibleApps().filter((app) => app.tab === sectionId);
  const active = state.sectionFilter[sectionId] || "all";
  main.append(
    h(
      "div",
      { class: "view-head" },
      h(
        "div",
        null,
        h("span", { class: "eyebrow eyebrow-brand", text: "Workspace" }),
        h("h1", { text: tab.label }),
        tab.description ? h("p", { text: tab.description }) : null
      ),
      h(
        "div",
        { class: "view-meta" },
        tab.suggested ? h("span", { class: "chip chip-info", text: "Suggested tab" }) : null,
        h("span", { class: "chip", text: `${apps.length} tiles` }),
        isAdmin()
          ? h(
              "button",
              {
                type: "button",
                class: "btn btn-primary btn-sm",
                onClick: () => openEditor(null, { tab: sectionId }),
              },
              h("span", { html: I.plus }),
              "Add tile"
            )
          : null
      )
    )
  );
  if (groups.length > 1) {
    main.append(
      h(
        "div",
        { class: "filter-bar", role: "group", "aria-label": "Filter by group" },
        h("button", {
          type: "button",
          class: "filter-chip",
          "aria-pressed": String(active === "all"),
          text: "All",
          onClick: () => setFilter(sectionId, "all"),
        }),
        ...groups
          .filter((group) => apps.some((app) => app.group === group.id))
          .map((group) =>
            h("button", {
              type: "button",
              class: "filter-chip",
              "aria-pressed": String(active === group.id),
              text: group.label,
              onClick: () => setFilter(sectionId, group.id),
            })
          )
      )
    );
  }
  let rendered = 0;
  groups.forEach((group) => {
    if (active !== "all" && active !== group.id) return;
    const inGroup = apps.filter((app) => app.group === group.id);
    if (!inGroup.length) return;
    rendered += 1;
    main.append(
      h(
        "section",
        { class: "group", id: `group-${group.id}` },
        h(
          "div",
          { class: "group-head" },
          h("h3", { text: group.label }),
          group.description ? h("span", { text: group.description }) : null,
          h("span", { class: "count", text: String(inGroup.length) })
        ),
        tileSet(inGroup, group.layout)
      )
    );
  });
  if (!rendered)
    main.append(
      emptyState(
        "Nothing to show for this role",
        `Switch "View as" back to Everyone to see every tile in ${tab.label}.`
      )
    );
};

const setFilter = (sectionId, value) => {
  state.sectionFilter[sectionId] = value;
  renderView();
};

/* ───────────────────────── team ───────────────────────── */
const agentChip = (agent) => {
  const status = AGENT_STATUS[agent.status] || AGENT_STATUS.planned;
  return h(
    "button",
    { type: "button", class: "agent-chip", onClick: () => openAgent(agent.id) },
    h("span", { html: avatarSvg(agent, { size: 44 }) }),
    h(
      "span",
      { class: "agent-chip-text" },
      h("strong", { text: agent.name }),
      h("span", { text: agent.role })
    ),
    h(
      "span",
      { class: "status" },
      h("span", {
        class: `dot ${status.tone === "ok" ? "dot-ok dot-live" : status.tone === "warn" ? "dot-warn" : ""}`,
      }),
      status.label
    )
  );
};

const renderTeam = (main) => {
  main.append(
    h(
      "div",
      { class: "view-head" },
      h(
        "div",
        null,
        h("span", { class: "eyebrow eyebrow-brand", text: "Team" }),
        h("h1", { text: "Digital Workforce" }),
        h("p", {
          text: "3HUE's AI agents are colleagues: each has a name, a face, a job description, a team and a human manager. They are introduced here the way any new hire is.",
        })
      )
    ),
    h(
      "div",
      { class: "team-intro" },
      h(
        "div",
        { class: "card" },
        h("h2", { text: "How we work with agents" }),
        h("p", {
          text: "An agent is accountable to a human owner, works inside named systems, and only claims what it can actually do today. Planned capabilities are labelled as planned.",
        }),
        h(
          "ul",
          { class: "team-rules" },
          rule("Every agent reports to a named 3HUE team and owner."),
          rule("Status is honest: On duty, In onboarding, or Planned."),
          rule(
            "Agents draft and recommend; people approve anything with legal, financial or client impact."
          ),
          rule("Each one has a voice, a portrait and a way to reach them — like any colleague.")
        )
      ),
      h(
        "div",
        {
          class: "card",
          style: {
            display: "grid",
            "align-content": "center",
            "justify-items": "center",
            gap: "12px",
            "text-align": "center",
          },
        },
        h("span", { html: avatarSvg(CONCIERGE, { size: 96, state: "idle" }) }),
        h("strong", {
          style: { "font-family": "var(--font-display)", "font-size": "17px" },
          text: `${CONCIERGE.name} is on duty`,
        }),
        h("span", {
          style: { color: "var(--ink-subtle)", "font-size": "13px" },
          text: CONCIERGE.tagline,
        }),
        h(
          "button",
          { type: "button", class: "btn btn-primary", onClick: () => openAsk() },
          h("span", { html: I.message }),
          `Ask ${CONCIERGE.name}`
        )
      )
    ),
    ...Array.from(new Set(AGENTS.map((agent) => agent.team))).map((team) => {
      const members = AGENTS.filter((agent) => agent.team === team);
      const onDuty = members.filter((agent) => agent.status === "active").length;
      return h(
        "section",
        { class: "group" },
        h(
          "div",
          { class: "group-head" },
          h("h3", { text: team }),
          h("span", { text: `${onDuty} on duty` }),
          h("span", { class: "count", text: String(members.length) })
        ),
        h("div", { class: "agent-grid" }, ...members.map((agent, index) => agentCard(agent, index)))
      );
    })
  );
};

const rule = (text) => h("li", null, h("span", { html: I.check }), text);

const agentCard = (agent, index) => {
  const status = AGENT_STATUS[agent.status] || AGENT_STATUS.planned;
  return h(
    "article",
    { class: "agent-card", style: { "--i": String(index) } },
    h(
      "div",
      { class: "agent-card-head" },
      h("span", { html: avatarSvg(agent, { size: 72 }) }),
      h(
        "div",
        null,
        h("h3", { text: agent.name }),
        h("div", { class: "role", text: agent.role }),
        h("div", { class: "team", text: agent.team })
      )
    ),
    h("p", { class: "tagline", text: `“${agent.tagline}”` }),
    h(
      "div",
      { class: "status-row" },
      h(
        "span",
        {
          class: `chip ${status.tone === "ok" ? "chip-ok" : status.tone === "warn" ? "chip-warn" : ""}`,
        },
        h("span", {
          class: `dot ${status.tone === "ok" ? "dot-ok dot-live" : status.tone === "warn" ? "dot-warn" : ""}`,
        }),
        status.label
      ),
      h("span", { class: "chip", text: agent.pronouns })
    ),
    h(
      "div",
      { class: "traits" },
      ...(agent.personality || []).map((trait) =>
        h("span", { class: "chip chip-brand", text: trait })
      )
    ),
    h(
      "div",
      { class: "card-actions" },
      h(
        "button",
        { type: "button", class: "btn btn-sm", onClick: () => openAgent(agent.id) },
        "Profile"
      ),
      agent.id === CONCIERGE.id
        ? h(
            "button",
            { type: "button", class: "btn btn-sm btn-soft", onClick: () => openAsk() },
            "Start a conversation"
          )
        : null
    )
  );
};

/* agent profile panel */
const openAgent = (id) => {
  const agent = agentById(id);
  if (!agent) return;
  const panel = $("[data-agent-panel]");
  if (!panel) return;
  const status = AGENT_STATUS[agent.status] || AGENT_STATUS.planned;
  panel.textContent = "";
  panel.append(
    h(
      "div",
      { class: "panel-head" },
      h("span", { html: avatarSvg(agent, { size: 44 }) }),
      h(
        "div",
        { class: "who" },
        h("strong", { text: agent.name }),
        h(
          "span",
          null,
          h("span", {
            class: `dot ${status.tone === "ok" ? "dot-ok dot-live" : status.tone === "warn" ? "dot-warn" : ""}`,
          }),
          status.label
        )
      ),
      h("button", {
        type: "button",
        class: "icon-btn",
        "aria-label": "Close profile",
        html: I.x,
        onClick: closeAgent,
      })
    ),
    h(
      "div",
      { class: "panel-body" },
      h(
        "div",
        { class: "profile-hero" },
        h("span", { html: avatarSvg(agent, { size: 120, decorative: false }) }),
        h("h2", { text: agent.name }),
        h("div", { class: "role", text: agent.role }),
        h("div", { class: "pronouns", text: agent.pronouns }),
        h("p", { class: "tagline", text: `“${agent.tagline}”` })
      ),
      h("p", {
        style: { color: "var(--ink-muted)", "font-size": "14px", "line-height": "1.6" },
        text: agent.bio,
      }),
      h(
        "div",
        { class: "profile-section" },
        h("h3", { text: "At a glance" }),
        h(
          "div",
          { class: "profile-facts" },
          fact("Team", agent.team),
          fact("Reports to", agent.reportsTo),
          fact("Since", agent.since),
          fact("Status", status.label)
        )
      ),
      h(
        "div",
        { class: "profile-section" },
        h("h3", { text: "Personality" }),
        h(
          "div",
          { class: "traits", style: { display: "flex", "flex-wrap": "wrap", gap: "6px" } },
          ...(agent.personality || []).map((trait) =>
            h("span", { class: "chip chip-brand", text: trait })
          )
        )
      ),
      h(
        "div",
        { class: "profile-section" },
        h("h3", { text: "What I can do" }),
        h(
          "ul",
          { class: "cap-list" },
          ...(agent.capabilities || []).map((cap) =>
            h(
              "li",
              null,
              h("span", {
                html: cap.live ? I.check : I.pin,
                style: {
                  color: cap.live ? "var(--ok)" : "var(--ink-faint)",
                  width: "16px",
                  height: "16px",
                  flex: "0 0 auto",
                  "margin-top": "2px",
                },
              }),
              h("span", { text: cap.text }),
              h("span", {
                class: `chip ${cap.live === true ? "chip-ok" : cap.live === "ai" ? (state.ai.enabled ? "chip-ok" : "chip-warn") : ""}`,
                text:
                  cap.live === true
                    ? "Live"
                    : cap.live === "ai"
                      ? state.ai.enabled
                        ? "Live · AI"
                        : "Needs AI key"
                      : "Planned",
              })
            )
          )
        )
      ),
      h(
        "div",
        { class: "profile-section" },
        h("h3", { text: "Systems I work in" }),
        h(
          "div",
          { class: "msg-cards" },
          ...(agent.systems || [])
            .map((sysId) => appById.get(sysId))
            .filter(Boolean)
            .map((app) => appCard(app))
        )
      ),
      agent.voice && agent.voice.handoff
        ? h(
            "div",
            { class: "profile-section" },
            h("h3", { text: "In their words" }),
            h("div", { class: "profile-quote", text: `“${agent.voice.handoff}”` })
          )
        : null,
      h(
        "div",
        { class: "profile-section" },
        h("h3", { text: "How to reach me" }),
        h(
          "div",
          { class: "link-list" },
          ...(agent.reach || []).map((item) =>
            item.action === "ask"
              ? h(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      closeAgent();
                      openAsk();
                    },
                  },
                  h("span", { html: I.message }),
                  item.label
                )
              : h(
                  "a",
                  {
                    href: item.href,
                    target: isHttp(item.href) ? "_blank" : null,
                    rel: "noopener noreferrer",
                  },
                  h("span", { html: I.external }),
                  item.label
                )
          )
        )
      )
    )
  );
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  syncOverlay();
  panel.querySelector(".icon-btn")?.focus();
};
const closeAgent = () => {
  const panel = $("[data-agent-panel]");
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  syncOverlay();
};
const fact = (label, value) =>
  h("div", { class: "fact" }, h("span", { text: label }), h("strong", { text: value || "—" }));

const appCard = (app) =>
  h(
    "a",
    {
      class: "msg-card",
      href: app.url,
      target: isHttp(app.url) ? "_blank" : null,
      rel: "noopener noreferrer",
      onClick: () => recordLaunch(app.id),
    },
    tileIcon(app),
    h(
      "span",
      { class: "msg-card-text" },
      h("strong", { text: app.name }),
      h("span", {
        text: app.owner ? `${app.owner} · ${AUTH_LABEL[app.auth] || ""}` : app.description || "",
      })
    ),
    h("span", { html: I.external })
  );

const docCard = (doc) =>
  h(
    "a",
    {
      class: "msg-card",
      href: doc.link || "#",
      target: isHttp(doc.link) ? "_blank" : null,
      rel: "noopener noreferrer",
    },
    h("span", { class: "tile-icon", style: { "--tile": "#036c70" }, html: I.doc }),
    h(
      "span",
      { class: "msg-card-text" },
      h("strong", { text: doc.title }),
      h("span", { text: [doc.category, doc.classification, doc.owner].filter(Boolean).join(" · ") })
    ),
    h("span", { html: I.external })
  );

/* ───────────────────────── documents ───────────────────────── */
const DOC_COLUMNS = [
  { key: "title", label: "Document" },
  { key: "category", label: "Category" },
  { key: "system", label: "System" },
  { key: "classification", label: "Classification" },
  { key: "owner", label: "Owner" },
  { key: "status", label: "Status" },
  { key: "lastReviewed", label: "Last reviewed" },
];
const uniqueValues = (items, key) =>
  Array.from(new Set(items.map((item) => item[key]).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );

const filteredDocs = () => {
  const query = normalize(state.docs.query).trim();
  const items = (state.inventory.items || [])
    .filter(docVisible)
    .filter((doc) => matchesAll(docText(doc), query))
    .filter((doc) => !state.docs.category || doc.category === state.docs.category)
    .filter((doc) => !state.docs.classification || doc.classification === state.docs.classification)
    .filter((doc) => !state.docs.system || doc.system === state.docs.system);
  const { sort: key, dir } = state.docs;
  return items.sort((a, b) => {
    const av = normalize(a[key]);
    const bv = normalize(b[key]);
    if (av === bv) return normalize(a.title).localeCompare(normalize(b.title));
    if (!av) return 1;
    if (!bv) return -1;
    return av.localeCompare(bv) * dir;
  });
};

const buildDocTable = (items, { sortable = false } = {}) => {
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
              renderView();
            },
          },
          col.label,
          h("span", { html: I.sort })
        )
      );
    } else th.textContent = col.label;
    headRow.append(th);
  });
  const tbody = h("tbody");
  const now = today();
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
    if (doc.description) titleCell.append(h("span", { class: "doc-desc", text: doc.description }));
    const loc = [doc.location, doc.version ? `v${doc.version}` : ""].filter(Boolean).join(" · ");
    if (loc) titleCell.append(h("span", { class: "doc-loc", text: loc }));
    const overdue = doc.nextReview && doc.nextReview < now && normalize(doc.status) !== "archived";
    tbody.append(
      h(
        "tr",
        null,
        titleCell,
        h("td", { "data-label": "Category", text: doc.category || "—" }),
        h("td", { "data-label": "System", text: doc.system || "—" }),
        h(
          "td",
          { "data-label": "Classification" },
          doc.classification
            ? h("span", {
                class: `chip chip-caps chip-${classTone(doc.classification)}`,
                text: doc.classification,
              })
            : "—"
        ),
        h("td", { "data-label": "Owner", text: doc.owner || "—" }),
        h(
          "td",
          { "data-label": "Status" },
          doc.status
            ? h("span", { class: `chip ${statusTone(doc.status)}`, text: doc.status })
            : "—"
        ),
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
  return h(
    "div",
    { class: "doc-table-wrap" },
    h("table", { class: "doc-table" }, h("thead", null, headRow), tbody)
  );
};
const statusTone = (status) => {
  const s = normalize(status);
  if (s === "approved") return "chip-ok";
  if (s === "in review" || s === "draft") return "chip-warn";
  return "";
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
  const link = h("a", { href: url, download: `3hue-document-inventory-${today()}.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`Exported ${items.length} record${items.length === 1 ? "" : "s"}`);
};

const docStatusLine = () => {
  const inv = state.inventory;
  const line = h("div", { class: "doc-status", role: "status", "aria-live": "polite" });
  if (inv.status === "loading")
    line.append(
      h("span", { class: "dot dot-live", style: { background: "var(--brand)" } }),
      h("span", { text: "Loading inventory from SharePoint…" })
    );
  else if (inv.status === "error")
    line.append(
      h("span", { class: "dot", style: { background: "var(--danger)" } }),
      h("span", { text: `Could not load the SharePoint list: ${inv.error || "unknown error"}` }),
      h("button", {
        type: "button",
        class: "btn btn-sm",
        text: "Retry",
        onClick: () => loadInventory({ interactive: true, force: true }),
      })
    );
  else if (inv.status === "signin-required")
    line.append(
      h("span", { class: "dot dot-warn" }),
      h("span", { text: "Sign in with your 3HUE Microsoft account to load the live inventory." }),
      h("button", {
        type: "button",
        class: "btn btn-primary btn-sm",
        text: "Connect SharePoint",
        onClick: () => loadInventory({ interactive: true, force: true }),
      })
    );
  else if (inv.status === "ready" && inv.source === "sharepoint")
    line.append(
      h("span", { class: "dot dot-ok dot-live" }),
      h("span", {
        text: `Live · ${inv.items.length} records · ${SP.listName || "SharePoint list"} · synced ${relativeTime(inv.syncedAt)}`,
      }),
      h(
        "button",
        {
          type: "button",
          class: "btn btn-ghost btn-sm",
          onClick: () => loadInventory({ interactive: true, force: true }),
        },
        h("span", { html: I.refresh }),
        "Refresh"
      )
    );
  else if (inv.status === "ready")
    line.append(
      h("span", { class: "dot dot-warn" }),
      h("span", {
        text: `Sample data · ${inv.items.length} records from the website repository · SharePoint list not connected`,
      })
    );
  else line.append(h("span", { class: "dot" }), h("span", { text: "Inventory not loaded." }));
  return line;
};

const renderDocuments = (main) => {
  const repos = visibleApps().filter((app) => app.tab === "documents");
  const repoGroup = groupById.get("repos") || { label: "Secure Data Repositories" };
  main.append(
    h(
      "div",
      { class: "view-head" },
      h(
        "div",
        null,
        h("span", { class: "eyebrow eyebrow-brand", text: "Workspace" }),
        h("h1", { text: "Documents & Artifacts" }),
        h("p", {
          text: "Where 3HUE information lives, and the inventory of what exists — managed by Teriah in the Internal Assets site.",
        })
      ),
      h(
        "div",
        { class: "view-meta" },
        SP.libraryUrl
          ? h(
              "a",
              {
                class: "btn btn-sm",
                href: SP.libraryUrl,
                target: "_blank",
                rel: "noopener noreferrer",
              },
              "Open in SharePoint",
              h("span", { html: I.external })
            )
          : null
      )
    )
  );
  if (repos.length)
    main.append(
      sectionBlock(
        repoGroup.label,
        { desc: repoGroup.description, count: repos.length },
        tileSet(repos)
      )
    );

  const all = (state.inventory.items || []).filter(docVisible);
  const items = filteredDocs();
  const section = h(
    "section",
    { class: "section" },
    h(
      "div",
      { class: "section-head" },
      h("h2", { text: "Document & Artifact Inventory" }),
      h("span", {
        class: "section-desc",
        text: "Policies, templates, collateral, case studies and architecture.",
      })
    )
  );
  const search = h("input", {
    type: "search",
    class: "field",
    placeholder: "Filter documents…",
    value: state.docs.query,
    "aria-label": "Filter documents",
    autocomplete: "off",
  });
  search.addEventListener("input", () => {
    state.docs.query = search.value;
    rerenderDocs(section);
  });
  const select = (key, label, values) => {
    const el = h(
      "select",
      { class: "field", "aria-label": label },
      h("option", { value: "", text: `All ${label.toLowerCase()}` })
    );
    values.forEach((value) =>
      el.append(h("option", { value, text: value, selected: state.docs[key] === value }))
    );
    el.addEventListener("change", () => {
      state.docs[key] = el.value;
      rerenderDocs(section);
    });
    return el;
  };
  section.append(
    h(
      "div",
      { class: "toolbar" },
      h("label", { class: "search" }, h("span", { html: I.search }), search),
      select("category", "Categories", uniqueValues(all, "category")),
      select("system", "Systems", uniqueValues(all, "system")),
      select("classification", "Classifications", uniqueValues(all, "classification")),
      h(
        "div",
        { class: "toolbar-actions" },
        h(
          "button",
          {
            type: "button",
            class: "btn btn-sm",
            disabled: !items.length,
            onClick: () => exportCsv(filteredDocs()),
          },
          h("span", { html: I.download }),
          "Export CSV"
        )
      )
    ),
    docStatusLine()
  );
  if (state.inventory.status === "ready")
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
  else if (state.inventory.status === "signin-required")
    section.append(
      emptyState(
        "Sign in to see the inventory",
        "Your SharePoint permissions decide which records you see."
      )
    );
  else if (state.inventory.status === "loading")
    section.append(h("div", { class: "skeleton", style: { height: "220px" } }));
  main.append(section);
};

const rerenderDocs = (section) => {
  const items = filteredDocs();
  const old = section.querySelector(".doc-table-wrap, .empty");
  const next = items.length
    ? buildDocTable(items, { sortable: true })
    : emptyState("No documents match", "Clear a filter or widen the role view.");
  if (old) old.replaceWith(next);
  else section.append(next);
  const exportBtn = section.querySelector(".toolbar-actions .btn");
  if (exportBtn) exportBtn.disabled = !items.length;
};

/* ───────────────────────── Ask (concierge chat) ───────────────────────── */
const SUGGESTIONS = [
  "Where do I find the CIRP?",
  "Who owns HubSpot?",
  "Request access to Deal Builder",
  "What's due for review?",
  "What's new this week?",
];

const saveChat = () => storage.set(KEYS.chat, state.chat.slice(-30));

const openAsk = (prefill) => {
  const panel = $("[data-ask-panel]");
  if (!panel) return;
  if (!panel.dataset.ready) {
    buildAskPanel(panel);
    panel.dataset.ready = "true";
  }
  if (!state.chat.length) {
    state.chat.push({
      role: "agent",
      text: greetingFor(CONCIERGE, firstName()),
      ts: Date.now(),
      cards: [],
    });
    saveChat();
  }
  renderChat();
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  syncOverlay();
  const input = panel.querySelector("textarea");
  if (input) {
    if (prefill) input.value = prefill;
    input.focus();
  }
};
const closeAsk = () => {
  const panel = $("[data-ask-panel]");
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  syncOverlay();
};

const buildAskPanel = (panel) => {
  const input = h("textarea", {
    rows: "1",
    placeholder: `Ask ${CONCIERGE.name} anything about 3HUE's systems…`,
    "aria-label": `Message ${CONCIERGE.name}`,
  });
  const send = h("button", { type: "button", class: "send", "aria-label": "Send", html: I.send });
  const submit = () => {
    const text = input.value.trim();
    if (!text || state.chatBusy) return;
    input.value = "";
    input.style.height = "";
    ask(text);
  };
  send.addEventListener("click", submit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  });
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  });
  panel.append(
    h(
      "div",
      { class: "panel-head" },
      h("span", { "data-ask-avatar": "", html: avatarSvg(CONCIERGE, { size: 44 }) }),
      h(
        "div",
        { class: "who" },
        h("strong", { text: CONCIERGE.name }),
        h("span", { "data-ask-mode": "" })
      ),
      h("button", {
        type: "button",
        class: "icon-btn",
        "aria-label": "Clear conversation",
        title: "Clear conversation",
        html: I.refresh,
        onClick: () => {
          state.chat = [];
          saveChat();
          openAsk();
        },
      }),
      h("button", {
        type: "button",
        class: "icon-btn",
        "aria-label": "Close",
        html: I.x,
        onClick: closeAsk,
      })
    ),
    h("div", { class: "chat", "data-chat": "", role: "log", "aria-live": "polite" }),
    h(
      "div",
      { class: "suggestions", "data-suggestions": "" },
      ...SUGGESTIONS.map((text) =>
        h("button", { type: "button", class: "suggestion", text, onClick: () => ask(text) })
      )
    ),
    h("div", { class: "composer" }, input, send)
  );
};

const renderChat = () => {
  const log = $("[data-chat]");
  if (!log) return;
  log.textContent = "";
  state.chat.forEach((msg) => {
    if (msg.role === "me")
      log.append(h("div", { class: "msg me" }, h("div", { class: "msg-bubble", text: msg.text })));
    else {
      const bubble = h("div", { class: "msg-bubble" });
      renderRichText(bubble, msg.text);
      if (msg.cards && msg.cards.length)
        bubble.append(
          h("div", { class: "msg-cards" }, ...msg.cards.map(cardFromRef).filter(Boolean))
        );
      log.append(
        h("div", { class: "msg" }, h("span", { html: avatarSvg(CONCIERGE, { size: 32 }) }), bubble)
      );
    }
  });
  if (state.chatBusy)
    log.append(
      h(
        "div",
        { class: "msg" },
        h("span", { html: avatarSvg(CONCIERGE, { size: 32, state: "thinking" }) }),
        h("div", { class: "msg-bubble typing" }, h("i"), h("i"), h("i"))
      )
    );
  const mode = $("[data-ask-mode]");
  if (mode) {
    mode.textContent = "";
    mode.append(
      h("span", { class: `dot ${state.ai.enabled ? "dot-ok dot-live" : "dot-warn"}` }),
      state.ai.enabled ? "On duty · AI answers on" : "On duty · catalog answers"
    );
  }
  const avatarSlot = $("[data-ask-avatar]");
  if (avatarSlot)
    avatarSlot.innerHTML = avatarSvg(CONCIERGE, {
      size: 44,
      state: state.chatBusy ? "thinking" : "idle",
    });
  log.scrollTop = log.scrollHeight;
  $("[data-suggestions]")?.toggleAttribute("hidden", state.chat.length > 2);
};

const cardFromRef = (ref) => {
  if (ref.type === "app") {
    const app = appById.get(ref.id);
    return app ? appCard(app) : null;
  }
  if (ref.type === "doc") return docCard(ref.doc);
  if (ref.type === "agent") {
    const agent = agentById(ref.id);
    return agent
      ? h(
          "button",
          { type: "button", class: "msg-card", onClick: () => openAgent(agent.id) },
          h("span", { html: avatarSvg(agent, { size: 30 }) }),
          h(
            "span",
            { class: "msg-card-text" },
            h("strong", { text: agent.name }),
            h("span", { text: agent.role })
          ),
          h("span", { html: I.arrow })
        )
      : null;
  }
  if (ref.type === "link")
    return h(
      "a",
      {
        class: "msg-card",
        href: ref.href,
        target: isHttp(ref.href) ? "_blank" : null,
        rel: "noopener noreferrer",
      },
      h("span", { class: "tile-icon", style: { "--tile": "#2f86b3" }, html: ref.icon || I.link }),
      h(
        "span",
        { class: "msg-card-text" },
        h("strong", { text: ref.label }),
        ref.desc ? h("span", { text: ref.desc }) : null
      ),
      h("span", { html: I.external })
    );
  return null;
};

/* Markdown-lite renderer that never uses innerHTML on model/user text: paragraphs, "- " bullets,
 * **bold**, `code` and [label](https://…) links. */
const renderRichText = (container, text) => {
  const lines = String(text || "").split(/\r?\n/);
  let list = null;
  let para = [];
  const flushPara = () => {
    if (!para.length) return;
    const p = h("p");
    renderInline(p, para.join(" "));
    container.append(p);
    para = [];
  };
  lines.forEach((line) => {
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      flushPara();
      if (!list) {
        list = h("ul");
        container.append(list);
      }
      const li = h("li");
      renderInline(li, bullet[1]);
      list.append(li);
      return;
    }
    list = null;
    if (!line.trim()) flushPara();
    else para.push(line.trim());
  });
  flushPara();
};
const renderInline = (el, text) => {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
  let last = 0;
  String(text).replace(pattern, (match, _g, offset) => {
    if (offset > last) el.append(document.createTextNode(text.slice(last, offset)));
    if (match.startsWith("**")) el.append(h("strong", { text: match.slice(2, -2) }));
    else if (match.startsWith("`")) el.append(h("code", { text: match.slice(1, -1) }));
    else {
      const m = match.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (m)
        el.append(h("a", { href: m[2], target: "_blank", rel: "noopener noreferrer", text: m[1] }));
    }
    last = offset + match.length;
    return match;
  });
  if (last < text.length) el.append(document.createTextNode(text.slice(last)));
};

const ask = async (question) => {
  state.chat.push({ role: "me", text: question, ts: Date.now() });
  state.chatBusy = true;
  saveChat();
  renderChat();
  let reply = null;
  if (state.ai.enabled) {
    try {
      reply = await askRemote(question);
    } catch (error) {
      reply = null;
    }
  }
  if (!reply) reply = answerLocally(question, { aiFailed: state.ai.enabled });
  state.chatBusy = false;
  state.chat.push({ role: "agent", text: reply.text, cards: reply.cards || [], ts: Date.now() });
  saveChat();
  renderChat();
};

const compactInventory = () =>
  (state.inventory.items || [])
    .filter(docVisible)
    .slice(0, 120)
    .map((doc) => ({
      title: doc.title,
      category: doc.category,
      system: doc.system,
      owner: doc.owner,
      classification: doc.classification,
      status: doc.status,
      link: doc.link,
      lastReviewed: doc.lastReviewed,
      nextReview: doc.nextReview,
    }));

const askRemote = async (question) => {
  const history = state.chat
    .filter((msg) => msg.role === "me" || msg.role === "agent")
    .slice(-9, -1)
    .map((msg) => ({ role: msg.role === "me" ? "user" : "assistant", content: msg.text }));
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({
      question,
      history,
      context: { inventory: compactInventory(), audience: state.audience, user: firstName() },
    }),
  });
  if (!res.ok) throw new Error(`ask ${res.status}`);
  const data = await res.json();
  if (!data || !data.answer) throw new Error("empty answer");
  const cards = mentionedApps(data.answer).map((app) => ({ type: "app", id: app.id }));
  return { text: data.answer, cards };
};

const mentionedApps = (text) => {
  const lower = normalize(text);
  return APPS.filter((app) => app.name.length > 2 && lower.includes(normalize(app.name))).slice(
    0,
    4
  );
};

/* Deterministic answers from the catalog — always available, no network. */
const answerLocally = (question, { aiFailed = false } = {}) => {
  const q = normalize(question).trim();
  const voice = CONCIERGE.voice || {};
  const seed = q.length;
  const prefix = aiFailed
    ? "My AI answers are unavailable right now, so here's what the catalog says. "
    : "";
  const findApps = (needle) => {
    const n = normalize(needle).trim();
    if (!n) return [];
    const exact = APPS.filter((app) => normalize(app.name) === n);
    if (exact.length) return exact;
    return APPS.filter((app) => matchesAll(appText(app), n)).slice(0, 5);
  };
  const findDocs = (needle) => {
    const n = normalize(needle).trim();
    if (!n) return [];
    return (state.inventory.items || [])
      .filter(docVisible)
      .filter((doc) => matchesAll(docText(doc), n))
      .slice(0, 5);
  };
  const strip = (s) =>
    s
      .replace(/[?.!]+$/g, "")
      .replace(
        /\b(the|a|an|to|for|please|me|my|our|do i|i|can|you|find|where|is|who|owns?|owner of|request|access|get|how|about)\b/g,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/.test(q)) {
    return {
      text: `${greetingFor(CONCIERGE, firstName())} I can find apps and documents, tell you who owns a system, draft an access request, or introduce you to the team.`,
      cards: [],
    };
  }
  if (/what can you (do|help)|^help\b|capabilit/.test(q)) {
    return {
      text: `Here's what I'm good for today:\n- Finding any of the ${APPS.length} tiles and ${(state.inventory.items || []).length} documents in the hub\n- Telling you who owns a system and drafting the access request\n- Pointing you to policies, the CIRP and templates\n- Introducing the rest of the digital workforce${state.ai.enabled ? "\n- Answering open questions about how 3HUE's systems fit together" : ""}\n\n${voice.handoff || ""}`,
      cards: [
        { type: "agent", id: "ava" },
        { type: "agent", id: "sage" },
      ],
    };
  }
  if (/what'?s new|announcement|news/.test(q)) {
    return {
      text: ANNOUNCEMENTS.length
        ? `Latest from the hub:\n${ANNOUNCEMENTS.slice(0, 3)
            .map((a) => `- **${a.title}** — ${a.body}`)
            .join("\n")}`
        : "Nothing new posted.",
      cards: [],
    };
  }
  if (/overdue|due (for )?review|review date|past (its|their) review/.test(q)) {
    const overdue = (state.inventory.items || [])
      .filter(docVisible)
      .filter(
        (doc) => doc.nextReview && doc.nextReview < today() && normalize(doc.status) !== "archived"
      );
    if (!overdue.length)
      return {
        text:
          state.inventory.status === "ready"
            ? "Nothing is past its review date. Nicely done."
            : "The inventory hasn't loaded yet, so I can't check review dates.",
        cards: [],
      };
    return {
      text: `${overdue.length} document${overdue.length === 1 ? " is" : "s are"} past the review date:`,
      cards: overdue.slice(0, 6).map((doc) => ({ type: "doc", doc })),
    };
  }
  const agentMatch = AGENTS.find((agent) =>
    new RegExp(`\\b${agent.name.toLowerCase()}\\b`).test(q)
  );
  if (agentMatch && /who|about|meet|what does|introduce|is\b/.test(q)) {
    const status = AGENT_STATUS[agentMatch.status] || {};
    return {
      text: `**${agentMatch.name}** (${agentMatch.pronouns}) — ${agentMatch.role}, ${agentMatch.team}. ${agentMatch.bio} Status: ${status.label || agentMatch.status}.`,
      cards: [{ type: "agent", id: agentMatch.id }],
    };
  }
  if (/verif(y|ication)|need(s)? (their )?address/.test(q)) {
    const flagged = APPS.filter((app) => app.verify);
    return {
      text: `${flagged.length} tiles are flagged “Verify URL” — their instance address was assumed and needs confirming:`,
      cards: flagged.slice(0, 8).map((app) => ({ type: "app", id: app.id })),
    };
  }
  if (/who owns|owner|responsible for|who (runs|manages|looks after)/.test(q)) {
    const apps = findApps(strip(q));
    if (apps.length) {
      const app = apps[0];
      return {
        text: `**${app.name}** is owned by **${app.owner || "no one yet"}**${app.auth ? ` · ${AUTH_LABEL[app.auth]}` : ""}. Use the card to open it, or ask me to request access.`,
        cards: [
          { type: "app", id: app.id },
          {
            type: "link",
            href: accessMail(app),
            label: `Request access to ${app.name}`,
            desc: `Mails ${app.ownerEmail || SUPPORT_EMAIL}`,
            icon: I.key,
          },
        ],
      };
    }
  }
  if (/access|permission|get into|log ?in to|sign ?in to|account for/.test(q)) {
    const apps = findApps(strip(q));
    if (apps.length) {
      const app = apps[0];
      return {
        text: `${prefix}For **${app.name}**, access requests go to **${app.owner || SUPPORT_EMAIL}**. I've drafted the note — just add your role and reason.`,
        cards: [
          {
            type: "link",
            href: accessMail(app),
            label: `Request access to ${app.name}`,
            desc: `Mails ${app.ownerEmail || SUPPORT_EMAIL}`,
            icon: I.key,
          },
          { type: "app", id: app.id },
        ],
      };
    }
    return {
      text: `${prefix}Tell me which system and I'll draft the request. Or use the general form.`,
      cards: [
        {
          type: "link",
          href: mailto(SUPPORT_EMAIL, "Access request", "App / system:\nRole / reason:\n"),
          label: "Request access",
          desc: `Mails ${SUPPORT_EMAIL}`,
          icon: I.key,
        },
      ],
    };
  }
  const needle = strip(q) || q;
  const apps = findApps(needle);
  const docs = findDocs(needle);
  if (apps.length || docs.length) {
    const cards = [
      ...apps.slice(0, 4).map((app) => ({ type: "app", id: app.id })),
      ...docs.slice(0, 4).map((doc) => ({ type: "doc", doc })),
    ];
    return {
      text: `${prefix}${pick(voice.found, seed)} ${apps.length ? `${apps.length} tile${apps.length === 1 ? "" : "s"}` : ""}${apps.length && docs.length ? " and " : ""}${docs.length ? `${docs.length} document${docs.length === 1 ? "" : "s"}` : ""} match “${question.trim()}”.`,
      cards,
    };
  }
  return {
    text: `${prefix}${pick(voice.notFound, seed)}`,
    cards: [
      {
        type: "link",
        href: mailto(
          SUPPORT_EMAIL,
          `Hub question: ${question.trim().slice(0, 80)}`,
          `Question for the hub:\n${question.trim()}\n`
        ),
        label: "Send to the IT & Platform desk",
        desc: `Mails ${SUPPORT_EMAIL}`,
        icon: I.mail,
      },
    ],
  };
};

/* ───────────────────────── command palette ───────────────────────── */
let paletteIndex = 0;
let paletteItems = [];

const buildIndex = () => {
  const items = [];
  visibleApps().forEach((app) =>
    items.push({
      kind: "app",
      label: app.name,
      sub: `${(tabById.get(app.tab) || {}).label || ""} · ${app.owner || ""}`,
      text: appText(app),
      app,
      run: () => {
        recordLaunch(app.id);
        window.open(app.url, isHttp(app.url) ? "_blank" : "_self", "noopener");
      },
    })
  );
  (state.inventory.items || []).filter(docVisible).forEach((doc) =>
    items.push({
      kind: "doc",
      label: doc.title,
      sub: [doc.category, doc.classification].filter(Boolean).join(" · "),
      text: docText(doc),
      doc,
      run: () => {
        if (doc.link) window.open(doc.link, "_blank", "noopener");
      },
    })
  );
  AGENTS.forEach((agent) =>
    items.push({
      kind: "agent",
      label: agent.name,
      sub: agent.role,
      text: normalize(
        `${agent.name} ${agent.role} ${agent.team} ${(agent.personality || []).join(" ")}`
      ),
      agent,
      run: () => openAgent(agent.id),
    })
  );
  TABS.forEach((tab) =>
    items.push({
      kind: "section",
      label: tab.label,
      sub: tab.description || "",
      text: normalize(`${tab.label} ${tab.description || ""}`),
      icon: SECTION_ICON[tab.id] || I.grid,
      run: () =>
        navigate(
          tab.id === "documents" ? { view: "documents" } : { view: "section", section: tab.id }
        ),
    })
  );
  items.push({
    kind: "action",
    label: "Home",
    sub: "Pinned, recent, teammates",
    text: "home overview start",
    icon: I.home,
    run: () => navigate({ view: "home" }),
  });
  items.push({
    kind: "action",
    label: "Digital Workforce",
    sub: "Meet the agents",
    text: "team agents workforce roster",
    icon: I.sparkles,
    run: () => navigate({ view: "team" }),
  });
  items.push({
    kind: "action",
    label: `Ask ${CONCIERGE.name}`,
    sub: "Open the concierge chat",
    text: "ask chat huey concierge help question",
    icon: I.message,
    run: () => openAsk(),
  });
  items.push({
    kind: "action",
    label: "Toggle Daylight / Midnight",
    sub: "Switch the theme",
    text: "theme dark light mode midnight daylight",
    icon: I.moon,
    run: toggleTheme,
  });
  items.push({
    kind: "action",
    label: "Export inventory CSV",
    sub: "Current documents filter",
    text: "export csv download inventory",
    icon: I.download,
    run: () => exportCsv(filteredDocs()),
  });
  items.push({
    kind: "action",
    label: "Request access",
    sub: `Mail ${SUPPORT_EMAIL}`,
    text: "request access permission",
    icon: I.key,
    run: () => {
      window.location.href = mailto(
        SUPPORT_EMAIL,
        "Access request",
        "App / system:\nRole / reason:\n"
      );
    },
  });
  if (SP.libraryUrl)
    items.push({
      kind: "action",
      label: "Open Internal Assets library",
      sub: "SharePoint",
      text: "sharepoint library internal assets documents",
      icon: I.folder,
      run: () => window.open(SP.libraryUrl, "_blank", "noopener"),
    });
  if (isAdmin()) {
    items.push({
      kind: "action",
      label: "Administration",
      sub: "Catalog, announcements, admins, audit log",
      text: "admin administration manage edit catalog roles audit settings",
      icon: I.sliders,
      run: () => navigate({ view: "admin" }),
    });
    items.push({
      kind: "action",
      label: "Add a tile",
      sub: "New app, system or link",
      text: "add new tile app link create",
      icon: I.plus,
      run: () => {
        const r = state.route;
        openEditor(null, { tab: r.view === "section" ? r.section : undefined });
      },
    });
  }
  if (state.identity)
    items.push({
      kind: "action",
      label: "Sign out",
      sub: state.identity.email,
      text: "sign out logout",
      icon: I.logout,
      run: () => {
        window.location.href = "/cdn-cgi/access/logout";
      },
    });
  return items;
};

const score = (item, query) => {
  const label = normalize(item.label);
  if (!query)
    return item.kind === "app" ? 1 : item.kind === "action" || item.kind === "section" ? 2 : 0;
  if (label === query) return 100;
  if (label.startsWith(query)) return 80;
  if (label.split(/\s+/).some((word) => word.startsWith(query))) return 60;
  if (label.includes(query)) return 40;
  if (matchesAll(item.text, query)) return 20;
  return 0;
};

const KIND_LABEL = {
  app: "Apps",
  doc: "Documents",
  agent: "Teammates",
  section: "Sections",
  action: "Actions",
};
const KIND_ORDER = ["app", "doc", "agent", "section", "action"];

const renderPalette = () => {
  const results = $("[data-palette-results]");
  const input = $("[data-palette-input]");
  if (!results || !input) return;
  const query = normalize(input.value).trim();
  const scored = buildIndex()
    .map((item) => ({ item, s: score(item, query) }))
    .filter(({ s }) => s > 0)
    .sort(
      (a, b) =>
        b.s - a.s ||
        KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind) ||
        a.item.label.length - b.item.label.length
    );
  const perKind = {};
  paletteItems = [];
  scored.forEach(({ item }) => {
    perKind[item.kind] = perKind[item.kind] || [];
    if (perKind[item.kind].length < (query ? 6 : item.kind === "app" ? 6 : 5))
      perKind[item.kind].push(item);
  });
  results.textContent = "";
  KIND_ORDER.forEach((kind) => {
    const list = perKind[kind];
    if (!list || !list.length) return;
    const group = h(
      "div",
      { class: "palette-group" },
      h("div", { class: "eyebrow", text: KIND_LABEL[kind] })
    );
    list.forEach((item) => {
      const index = paletteItems.length;
      paletteItems.push(item);
      const row = h(
        "button",
        {
          type: "button",
          class: `palette-item${index === paletteIndex ? " is-active" : ""}`,
          role: "option",
          "aria-selected": String(index === paletteIndex),
          onClick: () => runPaletteItem(item),
          onMousemove: () => {
            if (paletteIndex !== index) {
              paletteIndex = index;
              highlightPalette();
            }
          },
        },
        item.app
          ? tileIcon(item.app)
          : item.agent
            ? h("span", { html: avatarSvg(item.agent, { size: 30 }) })
            : h("span", { class: "p-icon", html: item.icon || I.doc }),
        h(
          "span",
          { class: "p-text" },
          h("strong", { text: item.label }),
          item.sub ? h("span", { text: item.sub }) : null
        ),
        h("span", {
          class: "p-kind",
          text:
            kind === "app"
              ? "Open ↗"
              : kind === "doc"
                ? "Open ↗"
                : kind === "agent"
                  ? "Profile"
                  : kind === "section"
                    ? "Go"
                    : "Run",
        })
      );
      group.append(row);
    });
    results.append(group);
  });
  if (!paletteItems.length)
    results.append(
      emptyState(
        "No matches",
        `Try a vendor name, a tag like “crm”, or ask ${CONCIERGE.name}.`,
        h("button", {
          type: "button",
          class: "btn btn-sm btn-soft",
          onClick: () => {
            const q = input.value;
            closePalette();
            openAsk(q);
          },
          text: `Ask ${CONCIERGE.name}`,
        })
      )
    );
  if (paletteIndex >= paletteItems.length) paletteIndex = 0;
  highlightPalette();
};
const highlightPalette = () => {
  $$("[data-palette-results] .palette-item").forEach((el, index) => {
    el.classList.toggle("is-active", index === paletteIndex);
    el.setAttribute("aria-selected", String(index === paletteIndex));
    if (index === paletteIndex) el.scrollIntoView({ block: "nearest" });
  });
};
const runPaletteItem = (item) => {
  closePalette();
  item.run();
};
const openPalette = (prefill = "") => {
  const palette = $("[data-palette]");
  const input = $("[data-palette-input]");
  if (!palette || !input) return;
  palette.classList.add("is-open");
  palette.setAttribute("aria-hidden", "false");
  input.value = prefill;
  paletteIndex = 0;
  renderPalette();
  input.focus();
  input.select();
};
const closePalette = () => {
  const palette = $("[data-palette]");
  if (!palette) return;
  palette.classList.remove("is-open");
  palette.setAttribute("aria-hidden", "true");
};

/* ───────────────────────── identity & inventory (SharePoint via Graph) ───────────────────────── */
/* ───────────────────────── catalog + administration ─────────────────────────
 * The effective catalog comes from the Worker (/api/catalog): the repository seed until an admin
 * edits something, then the KV document. Admins edit tiles and announcements in place; only Super
 * Admins (HUB_SUPER_ADMINS in wrangler.toml) appoint other admins. */
const isAdmin = () => state.role === "admin" || state.role === "super";
const isSuper = () => state.role === "super";
const roleLabel = (role) =>
  role === "super" ? "Super Admin" : role === "admin" ? "Admin" : "Member";

const api = async (path, { method = "GET", body } = {}) => {
  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (error) {
    data = null;
  }
  if (!res.ok) {
    const err = new Error((data && data.error) || `The hub returned ${res.status}.`);
    err.status = res.status;
    err.details = data && data.details;
    throw err;
  }
  return data;
};

const applyCatalog = (doc) => {
  APPS = Array.isArray(doc.apps) ? doc.apps : [];
  ANNOUNCEMENTS = Array.isArray(doc.announcements) ? doc.announcements : [];
  appById = new Map(APPS.map((app) => [app.id, app]));
  state.catalog = {
    ...state.catalog,
    source: doc.source || "kv",
    version: Number(doc.version) || 0,
    updatedAt: doc.updatedAt || null,
    updatedBy: doc.updatedBy || null,
    loaded: true,
  };
};

const loadCatalog = async () => {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 4000);
  try {
    const res = await fetch("/api/catalog", {
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) return false;
    applyCatalog(await res.json());
    return true;
  } catch (error) {
    return false; // static preview without the Worker keeps the repository catalog
  } finally {
    window.clearTimeout(timer);
  }
};

const refreshAll = () => {
  renderNav();
  renderView();
};

/* ───── tile editor ───── */
const AUTH_OPTIONS = [
  ["microsoft", "Microsoft SSO"],
  ["google", "Google sign-in"],
  ["sso", "SSO"],
  ["separate", "Separate login"],
  ["public", "No login"],
];
const CLASS_OPTIONS = ["", "Public", "Internal", "Confidential", "Restricted"];

let editorRef = null;

const formField = (label, control, hint) =>
  h(
    "label",
    { class: "form-field" },
    h("span", { class: "form-label", text: label }),
    control,
    hint ? h("span", { class: "form-hint", text: hint }) : null
  );

const selectField = (options, value, onChange, props = {}) => {
  const select = h(
    "select",
    { class: "field", ...props, onChange: (event) => onChange(event.target.value) },
    ...options.map(([val, label]) => h("option", { value: val, text: label }))
  );
  select.value = value;
  return select;
};

const textField = (key, props = {}) => {
  const { draft } = editorRef;
  const el = h("input", {
    class: "field",
    type: "text",
    ...props,
    onInput: (event) => {
      draft[key] = event.target.value;
      refreshPreview();
    },
  });
  el.value = draft[key] || "";
  return el;
};

const previewTile = (draft) => {
  const app = {
    ...draft,
    name: draft.name || "Tile name",
    tags: [],
    monogram:
      draft.monogram ||
      (draft.name || "T")
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
  };
  const tile = buildTile(app, 0);
  tile.querySelector(".tile-actions")?.remove();
  return h("div", { class: "editor-preview", "aria-hidden": "true" }, tile);
};

const refreshPreview = () => {
  const slot = $("[data-editor-preview]");
  if (slot && editorRef) {
    slot.textContent = "";
    slot.append(previewTile(editorRef.draft));
  }
};

const showEditorError = (error) => {
  const slot = $("[data-editor-error]");
  if (!slot) return;
  slot.textContent = "";
  if (!error) {
    slot.hidden = true;
    return;
  }
  slot.hidden = false;
  const lines =
    Array.isArray(error.details) && error.details.length ? error.details : [error.message];
  slot.append(...lines.map((line) => h("div", { text: line })));
};

const setEditorBusy = (busy) => {
  $$("[data-editor-panel] .form-actions .btn").forEach((btn) => {
    btn.disabled = busy;
  });
};

const openEditor = (app = null, { tab } = {}) => {
  if (!isAdmin()) return;
  const panel = $("[data-editor-panel]");
  if (!panel) return;
  closeAgent();
  closeAsk();
  closeMenu();
  const firstTab = (TABS[0] || {}).id || "core";
  const draft = app
    ? {
        ...app,
        tags: (app.tags || []).join(", "),
        audience: (app.audience || []).filter((aud) => aud !== "all"),
        featured: Boolean(app.featured),
        verify: Boolean(app.verify),
      }
    : {
        name: "",
        subtitle: "",
        description: "",
        url: "https://",
        tab: tab && tabById.has(tab) ? tab : firstTab,
        group: "",
        monogram: "",
        color: "#44a8d9",
        icon: "",
        auth: "sso",
        classification: "",
        owner: "",
        ownerEmail: "",
        tags: "",
        audience: [],
        featured: false,
        verify: false,
      };
  if (!draft.group || (groupById.get(draft.group) || {}).tab !== draft.tab)
    draft.group = (GROUPS.find((group) => group.tab === draft.tab) || {}).id || "";
  editorRef = { app, draft };
  renderEditor(panel);
  panel.classList.add("is-open");
  panel.setAttribute("aria-hidden", "false");
  syncOverlay();
  panel.querySelector("input")?.focus();
};

const closeEditor = () => {
  const panel = $("[data-editor-panel]");
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  editorRef = null;
  syncOverlay();
  // Drop the form (and its preview tile) once the slide-out has finished.
  window.setTimeout(() => {
    if (!panel.classList.contains("is-open")) panel.textContent = "";
  }, 400);
};

const renderEditor = (panel) => {
  const { app, draft } = editorRef;
  panel.textContent = "";

  const groupSelect = () => {
    const options = GROUPS.filter((group) => group.tab === draft.tab).map((group) => [
      group.id,
      group.label,
    ]);
    if (!options.some(([id]) => id === draft.group)) draft.group = (options[0] || [""])[0];
    return selectField(options, draft.group, (value) => {
      draft.group = value;
    });
  };
  let groupEl = groupSelect();
  const groupWrap = formField("Group", groupEl);

  const tabEl = selectField(
    TABS.map((t) => [t.id, t.label]),
    draft.tab,
    (value) => {
      draft.tab = value;
      const next = groupSelect();
      groupEl.replaceWith(next);
      groupEl = next;
    }
  );

  const colorText = textField("color", {
    maxlength: 7,
    placeholder: "#44a8d9",
    spellcheck: "false",
  });
  const colorPick = h("input", {
    type: "color",
    "aria-label": "Icon tint",
    onInput: (event) => {
      draft.color = event.target.value;
      colorText.value = draft.color;
      refreshPreview();
    },
  });
  colorPick.value = /^#[0-9a-f]{6}$/i.test(draft.color || "") ? draft.color : "#44a8d9";
  colorText.addEventListener("input", () => {
    if (/^#[0-9a-f]{6}$/i.test(colorText.value)) colorPick.value = colorText.value;
  });

  const description = h("textarea", {
    class: "field",
    maxlength: 240,
    rows: 3,
    placeholder: "One or two lines shown on the tile.",
    onInput: (event) => {
      draft.description = event.target.value;
      refreshPreview();
    },
  });
  description.value = draft.description || "";

  const audienceChips = h(
    "div",
    { class: "check-list" },
    ...AUDIENCES.filter((aud) => aud.id !== "all").map((aud) => {
      const box = h("input", {
        type: "checkbox",
        value: aud.id,
        onChange: (event) => {
          const set = new Set(draft.audience);
          if (event.target.checked) set.add(aud.id);
          else set.delete(aud.id);
          draft.audience = Array.from(set);
        },
      });
      box.checked = draft.audience.includes(aud.id);
      return h("label", { class: "check-chip" }, box, aud.label);
    })
  );
  const toggle = (key, label, hint) => {
    const box = h("input", {
      type: "checkbox",
      onChange: (event) => {
        draft[key] = event.target.checked;
        refreshPreview();
      },
    });
    box.checked = Boolean(draft[key]);
    return h(
      "label",
      { class: "check-chip" },
      box,
      label,
      hint ? h("span", { class: "sub", text: hint }) : null
    );
  };

  const save = h(
    "button",
    { type: "button", class: "btn btn-primary", onClick: () => saveEditor() },
    h("span", { html: I.check }),
    app ? "Save changes" : "Add tile"
  );
  const cancel = h("button", {
    type: "button",
    class: "btn btn-ghost",
    text: "Cancel",
    onClick: closeEditor,
  });
  const remove = app
    ? h(
        "button",
        { type: "button", class: "btn btn-danger", onClick: () => removeTile(app) },
        h("span", { html: I.trash }),
        "Remove"
      )
    : null;

  const form = h(
    "form",
    {
      class: "form-grid",
      onSubmit: (event) => {
        event.preventDefault();
        saveEditor();
      },
    },
    formField(
      "Name",
      textField("name", { maxlength: 80, required: true, placeholder: "e.g. Deal Builder" })
    ),
    formField(
      "Subtitle",
      textField("subtitle", { maxlength: 100, placeholder: "Optional second line" })
    ),
    formField("Description", description),
    formField(
      "Link",
      textField("url", {
        type: "url",
        maxlength: 500,
        required: true,
        inputmode: "url",
        spellcheck: "false",
      }),
      "https://, mailto: or tel:"
    ),
    h("div", { class: "form-row" }, formField("Section", tabEl), groupWrap),
    h(
      "div",
      { class: "form-row" },
      formField(
        "Monogram",
        textField("monogram", { maxlength: 3, placeholder: "Auto" }),
        "1–3 characters on the icon"
      ),
      formField("Icon tint", h("div", { class: "color-field" }, colorPick, colorText))
    ),
    formField(
      "Icon image",
      textField("icon", {
        type: "url",
        maxlength: 500,
        placeholder: "https://… (optional)",
        spellcheck: "false",
      }),
      "Replaces the monogram. Host must be allowed by the CSP."
    ),
    h(
      "div",
      { class: "form-row" },
      formField(
        "Login type",
        selectField(AUTH_OPTIONS, draft.auth || "sso", (value) => {
          draft.auth = value;
          refreshPreview();
        })
      ),
      formField(
        "Classification",
        selectField(
          CLASS_OPTIONS.map((c) => [c, c || "—"]),
          draft.classification || "",
          (value) => {
            draft.classification = value;
            refreshPreview();
          }
        )
      )
    ),
    h(
      "div",
      { class: "form-row" },
      formField("Owner", textField("owner", { maxlength: 60, placeholder: "Team or person" })),
      formField(
        "Owner email",
        textField("ownerEmail", {
          type: "email",
          maxlength: 120,
          placeholder: "Access requests go here",
        })
      )
    ),
    formField("Search tags", textField("tags", { placeholder: "comma, separated, words" })),
    formField("Visible to", audienceChips, "Leave empty for everyone."),
    h(
      "div",
      { class: "check-list" },
      toggle("featured", "Featured on Home"),
      toggle("verify", "Needs URL verification")
    ),
    h("div", { class: "form-error", "data-editor-error": "", hidden: true }),
    h(
      "div",
      { class: "form-actions" },
      save,
      cancel,
      remove ? h("span", { class: "spacer" }) : null,
      remove
    )
  );

  panel.append(
    h(
      "div",
      { class: "panel-head" },
      h("span", { class: "panel-glyph", html: app ? I.edit : I.plus }),
      h(
        "div",
        { class: "who" },
        h("strong", { text: app ? `Edit ${app.name}` : "New tile" }),
        h("span", null, app ? `id ${app.id}` : (tabById.get(draft.tab) || {}).label || "")
      ),
      h("button", {
        type: "button",
        class: "icon-btn",
        "aria-label": "Close editor",
        html: I.x,
        onClick: closeEditor,
      })
    ),
    h(
      "div",
      { class: "panel-body" },
      h("div", { "data-editor-preview": "" }, previewTile(draft)),
      form
    )
  );
};

const saveEditor = async () => {
  if (!editorRef) return;
  const { app, draft } = editorRef;
  const tile = {
    ...draft,
    tags: String(draft.tags || "")
      .split(/[,;]/)
      .map((tag) => tag.trim())
      .filter(Boolean),
    featured: Boolean(draft.featured),
    verify: Boolean(draft.verify),
  };
  delete tile.id;
  showEditorError(null);
  setEditorBusy(true);
  try {
    const result = app
      ? await api(`/api/admin/apps/${encodeURIComponent(app.id)}`, {
          method: "PUT",
          body: { ifVersion: state.catalog.version, tile },
        })
      : await api("/api/admin/apps", {
          method: "POST",
          body: { ifVersion: state.catalog.version, tile },
        });
    await loadCatalog();
    closeEditor();
    refreshAll();
    toast(app ? `${result.tile.name} updated` : `${result.tile.name} added`);
  } catch (error) {
    if (error.status === 409) {
      await loadCatalog();
      refreshAll();
    }
    showEditorError(error);
  } finally {
    setEditorBusy(false);
  }
};

const removeTile = async (app) => {
  if (!isAdmin()) return;
  const ok = window.confirm(`Remove “${app.name}” from the hub for everyone?`);
  if (!ok) return;
  try {
    await api(
      `/api/admin/apps/${encodeURIComponent(app.id)}?ifVersion=${encodeURIComponent(state.catalog.version)}`,
      { method: "DELETE" }
    );
    await loadCatalog();
    closeEditor();
    refreshAll();
    toast(`${app.name} removed`);
  } catch (error) {
    if (error.status === 409) {
      await loadCatalog();
      refreshAll();
    }
    toast(error.message);
  }
};

/* ───── administration view ───── */
const exportCatalog = () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: state.catalog.source,
    version: state.catalog.version,
    apps: APPS,
    announcements: ANNOUNCEMENTS,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = h("a", { href: url, download: `hub-catalog-v${state.catalog.version}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const adminCard = (title, lead, { actions = null, span = false } = {}, ...content) =>
  h(
    "section",
    { class: `card admin-card${span ? " span-2" : ""}` },
    h(
      "div",
      { class: "admin-card-head" },
      h("h2", { text: title }),
      actions ? h("div", { class: "admin-actions" }, ...[].concat(actions)) : null,
      lead ? h("p", { text: lead }) : null
    ),
    ...content
  );

const kvRow = (...children) => h("div", { class: "kv-row" }, ...children);

const renderAdmin = (main) => {
  main.append(
    h(
      "div",
      { class: "view-head" },
      h(
        "div",
        null,
        h("span", { class: "eyebrow eyebrow-brand", text: "Manage" }),
        h("h1", { text: "Administration" }),
        h("p", {
          text: "Edit tiles and announcements in place. Changes go live for everyone immediately; the repository catalog stays as the seed and the reset target.",
        })
      ),
      h(
        "div",
        { class: "view-meta" },
        h("span", {
          class: `chip chip-caps ${state.role === "super" ? "chip-brand" : "chip-info"}`,
          text: roleLabel(state.role),
        })
      )
    )
  );
  if (!isAdmin()) {
    const email = (state.identity && state.identity.email) || "an unknown address";
    main.append(
      emptyState(
        "Admin role required",
        `The hub resolved this sign-in as ${email} with the ${roleLabel(state.role)} role. Admins are appointed by a Super Admin in this screen; Super Admins are listed in the Worker configuration (HUB_SUPER_ADMINS) and must match the sign-in email exactly.`,
        h(
          "a",
          {
            class: "btn btn-soft btn-sm",
            href: mailto(
              SUPPORT_EMAIL,
              "Enterprise Hub admin access",
              "Please add me as a hub admin."
            ),
          },
          "Request admin access"
        )
      )
    );
    return;
  }
  const grid = h("div", { class: "admin-grid" });
  main.append(grid);
  if (!state.catalog.storage)
    grid.append(
      h(
        "div",
        { class: "notice span-2" },
        h("strong", { text: "Storage not configured" }),
        h("span", {
          text: "The HUB_KV binding is missing on this Worker, so saves will fail. Bind the KV namespace in wrangler.toml and redeploy.",
        })
      )
    );
  grid.append(catalogCard(), announcementsCard(), rolesCard(), auditCard());
};

const catalogCard = () => {
  const c = state.catalog;
  const live = c.source === "kv";
  const reset = isSuper()
    ? h(
        "button",
        {
          type: "button",
          class: "btn btn-danger btn-sm",
          disabled: !live,
          onClick: async () => {
            if (
              !window.confirm(
                "Discard every edit made in the hub and go back to the repository catalog? This cannot be undone."
              )
            )
              return;
            try {
              const doc = await api("/api/admin/reset", { method: "POST", body: {} });
              applyCatalog(doc);
              refreshAll();
              toast("Catalog reset to the repository seed");
            } catch (error) {
              toast(error.message);
            }
          },
        },
        h("span", { html: I.refresh }),
        "Reset to repository"
      )
    : null;
  return adminCard(
    "Catalog",
    live
      ? `Live edits, version ${c.version}. Export to carry them back into catalog.js.`
      : "Serving the repository catalog. The first edit creates the live version.",
    {
      actions: [
        h(
          "button",
          {
            type: "button",
            class: "btn btn-ghost btn-sm",
            onClick: () => loadCatalog().then(refreshAll),
          },
          h("span", { html: I.refresh }),
          "Reload"
        ),
        h(
          "button",
          { type: "button", class: "btn btn-soft btn-sm", onClick: exportCatalog },
          h("span", { html: I.download }),
          "Export JSON"
        ),
        reset,
      ],
    },
    h(
      "div",
      { class: "kv-list" },
      kvRow(
        h("span", { class: `dot ${live ? "dot-ok dot-live" : ""}` }),
        h(
          "span",
          { class: "grow" },
          h("strong", { text: live ? "Live catalog" : "Repository seed" })
        ),
        h("span", { class: "sub", text: live ? `v${c.version}` : "v0" })
      ),
      kvRow(
        h("span", { class: "grow", text: "Tiles" }),
        h("strong", { text: String(APPS.length) })
      ),
      kvRow(
        h("span", { class: "grow", text: "Announcements" }),
        h("strong", { text: String(ANNOUNCEMENTS.length) })
      ),
      live
        ? kvRow(
            h("span", { class: "grow", text: "Last change" }),
            h("span", {
              class: "sub",
              text: `${c.updatedBy || "unknown"} · ${c.updatedAt ? relativeTime(Date.parse(c.updatedAt)) : ""}`,
            })
          )
        : null
    ),
    h("p", {
      class: "form-hint",
      text: "Tiles are edited from their ⋯ menu on any section, or with “Add tile” at the top of a section.",
    })
  );
};

const saveAnnouncements = async (list, message) => {
  try {
    await api("/api/admin/announcements", {
      method: "PUT",
      body: { ifVersion: state.catalog.version, announcements: list },
    });
    await loadCatalog();
    refreshAll();
    toast(message);
  } catch (error) {
    if (error.status === 409) {
      await loadCatalog();
      refreshAll();
    }
    toast(error.message);
  }
};

let announcementDraft = null; // { index: number | -1, item }

const announcementForm = () => {
  const draft = announcementDraft;
  const item = draft.item;
  const bind = (key, el) => {
    el.value = item[key] || "";
    el.addEventListener("input", () => {
      item[key] = el.value;
    });
    return el;
  };
  const authorSelect = selectField(
    AGENTS.map((agent) => [agent.id, `${agent.name} · ${agent.role}`]),
    item.author || CONCIERGE.id,
    (value) => {
      item.author = value;
    }
  );
  return h(
    "form",
    {
      class: "inline-form",
      onSubmit: (event) => {
        event.preventDefault();
        const next = ANNOUNCEMENTS.slice();
        const clean = { ...item, author: item.author || CONCIERGE.id };
        if (!clean.href) delete clean.href;
        if (draft.index === -1) next.unshift(clean);
        else next[draft.index] = clean;
        announcementDraft = null;
        saveAnnouncements(
          next,
          draft.index === -1 ? "Announcement posted" : "Announcement updated"
        );
      },
    },
    h(
      "div",
      { class: "form-row" },
      formField("Date", bind("date", h("input", { class: "field", type: "date", required: true }))),
      formField("Posted by", authorSelect)
    ),
    formField(
      "Title",
      bind("title", h("input", { class: "field", type: "text", maxlength: 120, required: true }))
    ),
    formField(
      "Body",
      bind("body", h("textarea", { class: "field", rows: 3, maxlength: 600, required: true }))
    ),
    formField(
      "Link",
      bind(
        "href",
        h("input", {
          class: "field",
          type: "url",
          maxlength: 500,
          placeholder: "https://… (optional)",
        })
      )
    ),
    h(
      "div",
      { class: "form-actions" },
      h("button", {
        type: "submit",
        class: "btn btn-primary btn-sm",
        text: draft.index === -1 ? "Post" : "Save",
      }),
      h("button", {
        type: "button",
        class: "btn btn-ghost btn-sm",
        text: "Cancel",
        onClick: () => {
          announcementDraft = null;
          renderView();
        },
      })
    )
  );
};

const announcementsCard = () => {
  const rows = ANNOUNCEMENTS.map((item, index) => {
    const author = agentById(item.author) || CONCIERGE;
    return kvRow(
      h("span", { html: avatarSvg(author, { size: 28, decorative: true }) }),
      h(
        "span",
        { class: "grow" },
        h("strong", { text: item.title }),
        h("span", { class: "sub", text: ` · ${formatDate(item.date)}` })
      ),
      h("button", {
        type: "button",
        class: "icon-btn",
        "aria-label": `Edit ${item.title}`,
        html: I.edit,
        onClick: () => {
          announcementDraft = { index, item: { ...item } };
          renderView();
        },
      }),
      h("button", {
        type: "button",
        class: "icon-btn",
        "aria-label": `Remove ${item.title}`,
        html: I.trash,
        onClick: () => {
          if (!window.confirm(`Remove the announcement “${item.title}”?`)) return;
          saveAnnouncements(
            ANNOUNCEMENTS.filter((_, i) => i !== index),
            "Announcement removed"
          );
        },
      })
    );
  });
  return adminCard(
    "Announcements",
    "Shown on Home, newest first. Posted in the voice of a teammate.",
    {
      actions: h(
        "button",
        {
          type: "button",
          class: "btn btn-primary btn-sm",
          disabled: announcementDraft !== null,
          onClick: () => {
            announcementDraft = {
              index: -1,
              item: { date: today(), title: "", body: "", author: CONCIERGE.id, href: "" },
            };
            renderView();
          },
        },
        h("span", { html: I.plus }),
        "New"
      ),
    },
    announcementDraft ? announcementForm() : null,
    rows.length
      ? h("div", { class: "kv-list" }, ...rows)
      : h("p", { class: "form-hint", text: "No announcements yet." })
  );
};

const rolesCard = () => {
  const body = h("div", { class: "kv-list" }, h("p", { class: "form-hint", text: "Loading…" }));
  const fill = (data) => {
    body.textContent = "";
    (data.superAdmins || []).forEach((email) =>
      body.append(
        kvRow(
          h("span", { class: "identity-avatar", text: initials(email) }),
          h("span", { class: "grow" }, h("strong", { text: email })),
          h("span", { class: "chip chip-brand chip-caps", text: "Super Admin" })
        )
      )
    );
    (data.admins || []).forEach((admin) =>
      body.append(
        kvRow(
          h("span", { class: "identity-avatar", text: initials(admin.email) }),
          h(
            "span",
            { class: "grow" },
            h("strong", { text: admin.email }),
            admin.addedBy ? h("span", { class: "sub", text: ` · added by ${admin.addedBy}` }) : null
          ),
          h("span", { class: "chip chip-info chip-caps", text: "Admin" }),
          isSuper()
            ? h("button", {
                type: "button",
                class: "icon-btn",
                "aria-label": `Remove ${admin.email} as admin`,
                html: I.trash,
                onClick: async () => {
                  if (!window.confirm(`Remove ${admin.email} as an admin?`)) return;
                  try {
                    const next = await api(`/api/admin/roles/${encodeURIComponent(admin.email)}`, {
                      method: "DELETE",
                    });
                    fill({ ...data, admins: next.admins });
                    toast(`${admin.email} is no longer an admin`);
                  } catch (error) {
                    toast(error.message);
                  }
                },
              })
            : null
        )
      )
    );
    if (!(data.admins || []).length)
      body.append(h("p", { class: "form-hint", text: "No additional admins yet." }));
    if (isSuper()) {
      const email = h("input", {
        class: "field",
        type: "email",
        placeholder: "colleague@3hue.net",
        required: true,
        autocomplete: "off",
        "aria-label": "Email of the new admin",
      });
      body.append(
        h(
          "form",
          {
            class: "add-admin",
            onSubmit: async (event) => {
              event.preventDefault();
              try {
                const next = await api("/api/admin/roles", {
                  method: "POST",
                  body: { email: email.value.trim() },
                });
                fill({ ...data, admins: next.admins });
                toast(`${email.value.trim().toLowerCase()} can now edit the hub`);
              } catch (error) {
                toast(error.message);
              }
            },
          },
          email,
          h(
            "button",
            { type: "submit", class: "btn btn-primary" },
            h("span", { html: I.userPlus }),
            "Add admin"
          )
        )
      );
    }
  };
  api("/api/admin/roles")
    .then(fill)
    .catch((error) => {
      body.textContent = "";
      body.append(h("div", { class: "form-error", text: error.message }));
    });
  return adminCard(
    "Who can edit",
    isSuper()
      ? "Admins edit tiles and announcements. Only Super Admins add or remove admins."
      : "Admins edit tiles and announcements. Only a Super Admin can add or remove admins.",
    {},
    body
  );
};

const ACTION_LABEL = {
  "tile.add": "Added tile",
  "tile.update": "Edited tile",
  "tile.delete": "Removed tile",
  "announcements.update": "Updated announcements",
  "catalog.reset": "Reset catalog",
  "admin.add": "Added admin",
  "admin.remove": "Removed admin",
};

const auditCard = () => {
  const body = h("div", null, h("p", { class: "form-hint", text: "Loading…" }));
  api("/api/admin/audit")
    .then((data) => {
      const entries = (data.entries || data || []).slice(0, 50);
      body.textContent = "";
      if (!entries.length) {
        body.append(h("p", { class: "form-hint", text: "No changes recorded yet." }));
        return;
      }
      body.append(
        h(
          "div",
          { class: "doc-table-wrap" },
          h(
            "table",
            { class: "audit-table" },
            h(
              "thead",
              null,
              h(
                "tr",
                null,
                h("th", { text: "When" }),
                h("th", { text: "Who" }),
                h("th", { text: "Change" }),
                h("th", { text: "Target" })
              )
            ),
            h(
              "tbody",
              null,
              ...entries.map((entry) =>
                h(
                  "tr",
                  null,
                  h("td", {
                    class: "audit-when",
                    text: entry.at ? relativeTime(Date.parse(entry.at)) : "",
                  }),
                  h("td", { text: entry.by || "" }),
                  h("td", { text: ACTION_LABEL[entry.action] || entry.action || "" }),
                  h("td", null, h("code", { text: entry.target || "" }))
                )
              )
            )
          )
        )
      );
    })
    .catch((error) => {
      body.textContent = "";
      body.append(h("div", { class: "form-error", text: error.message }));
    });
  return adminCard(
    "Recent changes",
    "Every edit is recorded with who made it.",
    { span: true },
    body
  );
};

const loadIdentity = async () => {
  const attempts = [
    [
      "/api/me",
      (data) => ({
        email: data && data.email ? data.email : "",
        name: "",
        source: "worker",
        ai: Boolean(data && data.aiEnabled),
        role: (data && data.role) || "member",
        storage: Boolean(data && data.catalogStorage),
        build: (data && data.build) || null,
      }),
    ],
    [
      "/cdn-cgi/access/get-identity",
      (data) => ({ name: data.name || "", email: data.email || "", source: "access" }),
    ],
  ];
  const fetchJson = async (path, timeoutMs) => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(path, {
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      return res.ok ? await res.json() : null;
    } finally {
      window.clearTimeout(timer);
    }
  };
  for (const [path, map] of attempts) {
    try {
      // The role comes from /api/me, so give a cold Worker time and retry once rather than
      // silently falling back to "member". The Access identity probe may hang locally; keep it short.
      let data = null;
      if (path === "/api/me") {
        data = await fetchJson(path, 10000).catch(() => null);
        if (!data) data = await fetchJson(path, 10000);
      } else {
        data = await fetchJson(path, 2500);
      }
      if (!data) continue;
      const mapped = map(data);
      if (path === "/api/me") {
        state.ai = { enabled: Boolean(mapped.ai), checked: true };
        state.role = mapped.role;
        state.catalog = { ...state.catalog, storage: mapped.storage };
        state.serverBuild = mapped.build;
        if (mapped.email)
          state.identity = {
            ...(state.identity || {}),
            email: mapped.email,
            source: state.identity?.source || "worker",
          };
      } else if (mapped.email) {
        state.identity = {
          ...(state.identity || {}),
          name: mapped.name || (state.identity && state.identity.name) || "",
          email: mapped.email,
          source: "access",
        };
      }
    } catch (error) {
      /* not behind the Worker / Access (local preview) */
    }
  }
  state.roleChecked = true;
  renderNav();
  renderView();
};

const setInventory = (patch) => {
  state.inventory = { ...state.inventory, ...patch };
  renderNav();
  renderView();
  if ($("[data-ask-panel]")?.classList.contains("is-open")) renderChat();
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
      account = (await app.ssoSilent({ scopes, loginHint })).account;
    } catch (error) {
      account = null;
    }
  }
  if (!account) {
    if (!interactive) return null;
    const result = await app.loginPopup(
      loginHint ? { scopes, loginHint } : { scopes, prompt: "select_account" }
    );
    account = result.account;
  }
  app.setActiveAccount(account);
  state.account = { name: account.name, username: account.username };
  try {
    return (await app.acquireTokenSilent({ scopes, account })).accessToken;
  } catch (error) {
    if (interactive) return (await app.acquireTokenPopup({ scopes, account })).accessToken;
    if (
      window.msal.InteractionRequiredAuthError &&
      error instanceof window.msal.InteractionRequiredAuthError
    )
      return null;
    throw error;
  }
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
    page = await graphGet(`${itemsBase}&$expand=fields`, token);
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
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem(KEYS.theme);
  } catch (error) {
    storedTheme = null;
  }
  applyTheme(storedTheme === "dark" ? "dark" : "light");
  if (storage.get(KEYS.rail, false) && window.innerWidth >= 1025)
    document.body.classList.add("rail");
  setRail(document.body.classList.contains("rail"));

  $$("[data-ask-trigger-avatar]").forEach((slot) => {
    slot.innerHTML = avatarSvg(CONCIERGE, { size: 30 });
  });
  $$(".theme-switch").forEach((btn) => btn.addEventListener("click", toggleTheme));
  $("[data-rail-toggle]")?.addEventListener("click", () =>
    setRail(!document.body.classList.contains("rail"))
  );
  $("[data-menu]")?.addEventListener("click", openDrawer);
  $("[data-drawer-close]")?.addEventListener("click", closeDrawer);
  $("[data-cmd]")?.addEventListener("click", () => openPalette());
  $$("[data-ask]").forEach((btn) => btn.addEventListener("click", () => openAsk()));
  overlay()?.addEventListener("click", closeEverything);
  $("[data-palette-backdrop]")?.addEventListener("click", closePalette);
  $$("[data-bottom]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const target = btn.dataset.bottom;
      if (target === "home") navigate({ view: "home" });
      else if (target === "team") navigate({ view: "team" });
      else if (target === "browse") openSheet();
      else if (target === "search") openPalette();
      else if (target === "ask") openAsk();
    })
  );

  const audience = $("[data-audience]");
  if (audience) {
    AUDIENCES.forEach((aud) =>
      audience.append(
        h("option", {
          value: aud.id,
          selected: aud.id === state.audience,
          text: aud.id === "all" ? "View as: Everyone" : `View as: ${aud.label}`,
        })
      )
    );
    audience.addEventListener("change", () => {
      state.audience = audience.value;
      storage.set(KEYS.audience, state.audience);
      renderNav();
      renderView();
    });
  }

  const paletteInput = $("[data-palette-input]");
  if (paletteInput) {
    paletteInput.addEventListener("input", () => {
      paletteIndex = 0;
      renderPalette();
    });
    paletteInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        paletteIndex = Math.min(paletteIndex + 1, Math.max(paletteItems.length - 1, 0));
        highlightPalette();
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        paletteIndex = Math.max(paletteIndex - 1, 0);
        highlightPalette();
      } else if (event.key === "Enter") {
        event.preventDefault();
        const item = paletteItems[paletteIndex];
        if (item) runPaletteItem(item);
      }
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
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if ($("[data-palette]")?.classList.contains("is-open")) closePalette();
      else openPalette();
      return;
    }
    if (event.key === "/" && !typing) {
      event.preventDefault();
      openPalette();
      return;
    }
    if (event.key === "Escape") {
      if ($("[data-palette]")?.classList.contains("is-open")) closePalette();
      else closeEverything();
    }
  });

  $("[data-year]") && ($("[data-year]").textContent = String(new Date().getFullYear()));

  const initial = parseHash();
  state.route = initial.ask ? { view: "home" } : initial;
  renderNav();
  renderView();
  if (initial.agent) openAgent(initial.agent);
  if (initial.ask) openAsk();
  Promise.allSettled([loadIdentity(), loadCatalog()]).then(() => {
    refreshAll();
    loadInventory();
  });
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
