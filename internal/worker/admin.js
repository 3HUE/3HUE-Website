/* Hub administration: roles, the editable catalog, announcements and the audit log.
 *
 * Storage is Cloudflare KV (binding HUB_KV). The repository catalog (public/catalog.js) is the seed;
 * once an admin edits anything, the effective catalog lives in KV and the seed is only used for
 * structure (tabs, groups, audiences) and as a reset target.
 *
 * Roles
 *   super  — listed in the HUB_SUPER_ADMINS variable (wrangler.toml). Cannot be granted from the UI.
 *   admin  — listed in KV (roles:admins); only supers add or remove admins.
 *   member — everyone else who passed Cloudflare Access.
 *
 * Every write records an audit entry (who, when, what, before/after). */
import { HUB_CATALOG } from "../public/catalog.js";

export const ROLES = { SUPER: "super", ADMIN: "admin", MEMBER: "member" };
export const KV_KEYS = { catalog: "catalog:doc", admins: "roles:admins", audit: "audit:log" };
export const AUDIT_LIMIT = 300;
export const AUTH_TYPES = ["microsoft", "google", "sso", "separate", "public"];
export const CLASSIFICATIONS = ["", "Public", "Internal", "Confidential", "Restricted"];

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

const lower = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
export const splitList = (value) =>
  String(value || "")
    .split(/[,\s]+/)
    .map(lower)
    .filter(Boolean);
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ""));
const now = () => new Date().toISOString();

/* ───────────────────────── KV helpers ───────────────────────── */
const kvGet = async (env, key) => {
  if (!env.HUB_KV) return null;
  try {
    return await env.HUB_KV.get(key, "json");
  } catch (error) {
    return null;
  }
};
const kvPut = async (env, key, value) => {
  if (!env.HUB_KV)
    throw new HttpError(503, "Catalog storage (HUB_KV) is not configured on this Worker.");
  await env.HUB_KV.put(key, JSON.stringify(value));
};

/* ───────────────────────── roles ───────────────────────── */
export const superAdmins = (env) => splitList(env.HUB_SUPER_ADMINS);

export async function listAdmins(env) {
  const doc = (await kvGet(env, KV_KEYS.admins)) || { admins: [] };
  return Array.isArray(doc.admins) ? doc.admins : [];
}

export async function resolveRole(env, email) {
  const e = lower(email);
  if (!e) return ROLES.MEMBER;
  if (superAdmins(env).includes(e)) return ROLES.SUPER;
  const admins = await listAdmins(env);
  return admins.some((admin) => lower(admin.email) === e) ? ROLES.ADMIN : ROLES.MEMBER;
}

const atLeast = (role, minimum) => {
  const rank = { member: 0, admin: 1, super: 2 };
  return (rank[role] || 0) >= (rank[minimum] || 0);
};
const require = (role, minimum, what) => {
  if (!atLeast(role, minimum))
    throw new HttpError(
      403,
      `${what} requires the ${minimum === ROLES.SUPER ? "Super Admin" : "Admin"} role.`
    );
};

/* ───────────────────────── audit ───────────────────────── */
export async function appendAudit(env, entry) {
  const log = (await kvGet(env, KV_KEYS.audit)) || [];
  log.unshift({ at: now(), ...entry });
  await kvPut(env, KV_KEYS.audit, log.slice(0, AUDIT_LIMIT));
}

/* ───────────────────────── catalog document ───────────────────────── */
const seedDoc = () => ({
  source: "static",
  version: 0,
  updatedAt: null,
  updatedBy: null,
  apps: HUB_CATALOG.apps || [],
  announcements: HUB_CATALOG.announcements || [],
});

/** The effective catalog: KV document when one exists, otherwise the repository seed. */
export async function getCatalog(env) {
  const doc = await kvGet(env, KV_KEYS.catalog);
  if (doc && Array.isArray(doc.apps)) return { ...doc, source: "kv" };
  return seedDoc();
}

const saveCatalog = async (env, doc, by) => {
  const next = {
    version: (doc.version || 0) + 1,
    updatedAt: now(),
    updatedBy: by,
    apps: doc.apps,
    announcements: doc.announcements,
  };
  await kvPut(env, KV_KEYS.catalog, next);
  return { ...next, source: "kv" };
};

const assertVersion = (doc, ifVersion) => {
  if (ifVersion === undefined || ifVersion === null) return;
  if (Number(ifVersion) !== Number(doc.version)) {
    throw new HttpError(
      409,
      `Someone saved the catalog since you loaded it (you have version ${ifVersion}, current is ${doc.version}). Reload and try again.`
    );
  }
};

/* ───────────────────────── validation ───────────────────────── */
const slugify = (value) =>
  lower(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "tile";

const uniqueId = (base, taken) => {
  let id = base;
  let n = 2;
  while (taken.has(id)) id = `${base}-${n++}`;
  return id;
};

const str = (value, max, label, errors, { required = false } = {}) => {
  if (value === undefined || value === null) value = "";
  if (typeof value !== "string") {
    errors.push(`${label} must be text.`);
    return "";
  }
  const text = value.trim();
  if (required && !text) errors.push(`${label} is required.`);
  if (text.length > max) errors.push(`${label} must be ${max} characters or fewer.`);
  return text.slice(0, max);
};

const validUrl = (value) => {
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
};

/** Validate and normalize a tile submitted by an admin. Returns the clean tile or throws 400. */
export function validateTile(
  input,
  { catalog = HUB_CATALOG, existingIds = new Set(), currentId = null } = {}
) {
  if (!input || typeof input !== "object") throw new HttpError(400, "Tile must be a JSON object.");
  const errors = [];
  const tabs = new Set((catalog.tabs || []).map((tab) => tab.id).filter((id) => id !== "overview"));
  const groups = catalog.groups || [];
  const audiences = new Set((catalog.audiences || []).map((aud) => aud.id));

  const name = str(input.name, 80, "Name", errors, { required: true });
  const url = str(input.url, 500, "URL", errors, { required: true });
  if (url && !validUrl(url)) errors.push("URL must start with https://, http://, mailto: or tel:.");
  const tab = str(input.tab, 40, "Section", errors, { required: true });
  if (tab && !tabs.has(tab)) errors.push(`Unknown section "${tab}".`);
  const group = str(input.group, 40, "Group", errors, { required: true });
  const groupDef = groups.find((g) => g.id === group);
  if (group && !groupDef) errors.push(`Unknown group "${group}".`);
  if (groupDef && tab && groupDef.tab !== tab)
    errors.push(`Group "${groupDef.label}" belongs to a different section.`);
  const auth = str(input.auth, 20, "Login type", errors) || "separate";
  if (!AUTH_TYPES.includes(auth))
    errors.push(`Login type must be one of ${AUTH_TYPES.join(", ")}.`);
  const classification = str(input.classification, 20, "Classification", errors);
  if (!CLASSIFICATIONS.includes(classification))
    errors.push(`Classification must be one of ${CLASSIFICATIONS.filter(Boolean).join(", ")}.`);
  const ownerEmail = str(input.ownerEmail, 120, "Owner email", errors);
  if (ownerEmail && !isEmail(ownerEmail)) errors.push("Owner email is not a valid address.");
  const color = str(input.color, 7, "Color", errors) || "#44a8d9";
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) errors.push("Color must be a hex value like #44a8d9.");
  const icon = str(input.icon, 500, "Icon URL", errors);
  if (icon && !/^https:\/\//i.test(icon)) errors.push("Icon URL must start with https://.");
  const monogram = str(input.monogram, 3, "Monogram", errors);
  const tagsIn = Array.isArray(input.tags)
    ? input.tags
    : typeof input.tags === "string"
      ? input.tags.split(/[,;]/)
      : [];
  const tags = tagsIn
    .map((tag) => lower(tag).slice(0, 24))
    .filter(Boolean)
    .slice(0, 12);
  const audienceIn = Array.isArray(input.audience) ? input.audience : [];
  const audience = audienceIn.map(lower).filter((aud) => audiences.has(aud));

  if (errors.length) throw new HttpError(400, errors[0], errors);

  const tile = {
    id: currentId || uniqueId(slugify(name), existingIds),
    name,
    tab,
    group,
    url,
    description: str(input.description, 240, "Description", errors),
    monogram:
      monogram ||
      name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    color: color.toLowerCase(),
    auth,
    owner: str(input.owner, 60, "Owner", errors),
    tags,
  };
  const subtitle = str(input.subtitle, 100, "Subtitle", errors);
  if (subtitle) tile.subtitle = subtitle;
  if (ownerEmail) tile.ownerEmail = ownerEmail.toLowerCase();
  if (icon) tile.icon = icon;
  if (audience.length && !audience.includes("all")) tile.audience = audience;
  if (classification) tile.classification = classification;
  if (input.featured === true) tile.featured = true;
  if (input.verify === true) tile.verify = true;
  return tile;
}

export function validateAnnouncements(input) {
  if (!Array.isArray(input)) throw new HttpError(400, "Announcements must be a list.");
  if (input.length > 20) throw new HttpError(400, "Keep announcements to 20 or fewer.");
  return input.map((item, index) => {
    const errors = [];
    const title = str(item && item.title, 120, `Announcement ${index + 1} title`, errors, {
      required: true,
    });
    const body = str(item && item.body, 600, `Announcement ${index + 1} body`, errors, {
      required: true,
    });
    const date = str(item && item.date, 10, `Announcement ${index + 1} date`, errors, {
      required: true,
    });
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
      errors.push(`Announcement ${index + 1} date must be YYYY-MM-DD.`);
    const href = str(item && item.href, 500, `Announcement ${index + 1} link`, errors);
    if (href && !validUrl(href)) errors.push(`Announcement ${index + 1} link is not a valid URL.`);
    const author = str(item && item.author, 40, `Announcement ${index + 1} author`, errors);
    if (errors.length) throw new HttpError(400, errors[0], errors);
    const clean = { date, title, body };
    if (href) clean.href = href;
    if (author) clean.author = author;
    return clean;
  });
}

/* ───────────────────────── routes ───────────────────────── */
const readJson = async (request) => {
  const raw = await request.text();
  if (raw.length > 256 * 1024) throw new HttpError(413, "Request too large.");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    throw new HttpError(400, "Body must be JSON.");
  }
};

const summarizeTile = (tile) =>
  tile
    ? {
        id: tile.id,
        name: tile.name,
        url: tile.url,
        owner: tile.owner,
        tab: tile.tab,
        group: tile.group,
      }
    : null;

/**
 * Handle /api/catalog and /api/admin/*. Returns { status, body } or null when the path is not ours.
 * `identity` is the verified Access identity ({ email }); `role` its resolved role.
 */
export async function adminRoute({ request, url, env, identity, role }) {
  const path = url.pathname;
  const method = request.method;
  const by = lower(identity && identity.email) || "unknown";

  if (path === "/api/catalog" && method === "GET") {
    return { status: 200, body: await getCatalog(env) };
  }
  if (!path.startsWith("/api/admin/")) return null;

  // Everything under /api/admin requires at least the Admin role.
  require(role, ROLES.ADMIN, "Administration");

  if (path === "/api/admin/apps" && method === "POST") {
    const input = await readJson(request);
    const doc = await getCatalog(env);
    assertVersion(doc, input.ifVersion);
    const tile = validateTile(input.tile || input, {
      existingIds: new Set(doc.apps.map((app) => app.id)),
    });
    const saved = await saveCatalog(env, { ...doc, apps: [...doc.apps, tile] }, by);
    await appendAudit(env, { by, action: "tile.add", target: tile.id, after: summarizeTile(tile) });
    return { status: 201, body: { tile, version: saved.version } };
  }

  const appMatch = path.match(/^\/api\/admin\/apps\/([a-z0-9-]+)$/);
  if (appMatch && (method === "PUT" || method === "DELETE")) {
    const id = appMatch[1];
    const doc = await getCatalog(env);
    const index = doc.apps.findIndex((app) => app.id === id);
    if (index === -1) throw new HttpError(404, `No tile with id "${id}".`);
    const before = doc.apps[index];
    if (method === "DELETE") {
      const ifVersion = url.searchParams.get("ifVersion");
      assertVersion(doc, ifVersion === null ? undefined : ifVersion);
      const apps = doc.apps.filter((app) => app.id !== id);
      const saved = await saveCatalog(env, { ...doc, apps }, by);
      await appendAudit(env, {
        by,
        action: "tile.delete",
        target: id,
        before: summarizeTile(before),
      });
      return { status: 200, body: { deleted: id, version: saved.version } };
    }
    const input = await readJson(request);
    assertVersion(doc, input.ifVersion);
    const tile = validateTile(input.tile || input, { currentId: id });
    const apps = doc.apps.slice();
    apps[index] = tile;
    const saved = await saveCatalog(env, { ...doc, apps }, by);
    await appendAudit(env, {
      by,
      action: "tile.update",
      target: id,
      before: summarizeTile(before),
      after: summarizeTile(tile),
    });
    return { status: 200, body: { tile, version: saved.version } };
  }

  if (path === "/api/admin/announcements" && method === "PUT") {
    const input = await readJson(request);
    const doc = await getCatalog(env);
    assertVersion(doc, input.ifVersion);
    const announcements = validateAnnouncements(input.announcements);
    const saved = await saveCatalog(env, { ...doc, announcements }, by);
    await appendAudit(env, {
      by,
      action: "announcements.update",
      target: "announcements",
      after: { count: announcements.length },
    });
    return { status: 200, body: { announcements, version: saved.version } };
  }

  if (path === "/api/admin/reset" && method === "POST") {
    require(role, ROLES.SUPER, "Resetting the catalog");
    if (env.HUB_KV) await env.HUB_KV.delete(KV_KEYS.catalog);
    await appendAudit(env, { by, action: "catalog.reset", target: "catalog" });
    return { status: 200, body: await getCatalog(env) };
  }

  if (path === "/api/admin/roles" && method === "GET") {
    return { status: 200, body: { superAdmins: superAdmins(env), admins: await listAdmins(env) } };
  }
  if (path === "/api/admin/roles" && method === "POST") {
    require(role, ROLES.SUPER, "Adding an admin");
    const input = await readJson(request);
    const email = lower(input.email);
    if (!isEmail(email)) throw new HttpError(400, "Enter a valid email address.");
    const domains = splitList(env.ALLOWED_EMAIL_DOMAINS);
    if (domains.length && !domains.some((d) => email.endsWith(`@${d}`)))
      throw new HttpError(400, `Admins must have an @${domains.join(" or @")} address.`);
    if (superAdmins(env).includes(email))
      throw new HttpError(400, `${email} is already a Super Admin.`);
    const admins = await listAdmins(env);
    if (admins.some((admin) => lower(admin.email) === email))
      throw new HttpError(409, `${email} is already an admin.`);
    const next = [...admins, { email, addedBy: by, addedAt: now() }];
    await kvPut(env, KV_KEYS.admins, { admins: next });
    await appendAudit(env, { by, action: "admin.add", target: email });
    return { status: 201, body: { admins: next } };
  }
  const roleMatch = path.match(/^\/api\/admin\/roles\/(.+)$/);
  if (roleMatch && method === "DELETE") {
    require(role, ROLES.SUPER, "Removing an admin");
    const email = lower(decodeURIComponent(roleMatch[1]));
    if (superAdmins(env).includes(email))
      throw new HttpError(
        400,
        "Super Admins are set in the Worker configuration and cannot be removed here."
      );
    const admins = await listAdmins(env);
    if (!admins.some((admin) => lower(admin.email) === email))
      throw new HttpError(404, `${email} is not an admin.`);
    const next = admins.filter((admin) => lower(admin.email) !== email);
    await kvPut(env, KV_KEYS.admins, { admins: next });
    await appendAudit(env, { by, action: "admin.remove", target: email });
    return { status: 200, body: { admins: next } };
  }

  if (path === "/api/admin/audit" && method === "GET") {
    const log = (await kvGet(env, KV_KEYS.audit)) || [];
    return { status: 200, body: { entries: log.slice(0, 200) } };
  }

  throw new HttpError(404, "Unknown admin endpoint.");
}
