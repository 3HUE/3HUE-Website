import test from "node:test";
import assert from "node:assert/strict";
import {
  adminRoute,
  resolveRole,
  validateTile,
  getCatalog,
  HttpError,
  ROLES,
  KV_KEYS,
} from "../admin.js";
import { HUB_CATALOG } from "../../public/catalog.js";

const memoryKv = () => {
  const store = new Map();
  return {
    store,
    async get(key, type) {
      const raw = store.get(key);
      if (raw === undefined) return null;
      return type === "json" ? JSON.parse(raw) : raw;
    },
    async put(key, value) {
      store.set(key, value);
    },
    async delete(key) {
      store.delete(key);
    },
  };
};

const envWith = (kv) => ({
  HUB_KV: kv,
  HUB_SUPER_ADMINS: "aramirez@3hue.net",
  ALLOWED_EMAIL_DOMAINS: "3hue.net",
});
const call = (env, role, email, method, path, body) =>
  adminRoute({
    request: new Request(`https://hub.3hue.net${path}`, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }),
    url: new URL(`https://hub.3hue.net${path}`),
    env,
    identity: { email },
    role,
  });
const rejects = (promise, status, pattern) =>
  assert.rejects(
    promise,
    (e) => e instanceof HttpError && e.status === status && (!pattern || pattern.test(e.message))
  );

test("roles: super from config, admin from KV, everyone else member", async () => {
  const kv = memoryKv();
  const env = envWith(kv);
  assert.equal(await resolveRole(env, "ARamirez@3hue.net"), ROLES.SUPER);
  assert.equal(await resolveRole(env, "teriah@3hue.net"), ROLES.MEMBER);
  await kv.put(KV_KEYS.admins, JSON.stringify({ admins: [{ email: "teriah@3hue.net" }] }));
  assert.equal(await resolveRole(env, "Teriah@3HUE.net"), ROLES.ADMIN);
  assert.equal(await resolveRole(env, ""), ROLES.MEMBER);
});

test("catalog falls back to the repository seed and is served to anyone", async () => {
  const env = envWith(memoryKv());
  const res = await call(env, ROLES.MEMBER, "someone@3hue.net", "GET", "/api/catalog");
  assert.equal(res.status, 200);
  assert.equal(res.body.source, "static");
  assert.equal(res.body.version, 0);
  assert.equal(res.body.apps.length, HUB_CATALOG.apps.length);
});

test("members cannot touch admin endpoints", async () => {
  const env = envWith(memoryKv());
  await rejects(
    call(env, ROLES.MEMBER, "someone@3hue.net", "POST", "/api/admin/apps", {
      name: "X",
      url: "https://x.test",
      tab: "core",
      group: "m365",
    }),
    403,
    /Admin role/
  );
  await rejects(call(env, ROLES.MEMBER, "someone@3hue.net", "GET", "/api/admin/audit"), 403);
});

test("admins can add, edit and delete tiles; writes are audited and versioned", async () => {
  const kv = memoryKv();
  const env = envWith(kv);
  const added = await call(env, ROLES.ADMIN, "teriah@3hue.net", "POST", "/api/admin/apps", {
    name: "Loom",
    url: "https://www.loom.com/",
    tab: "core",
    group: "productivity",
    description: "Async video",
    owner: "Marketing",
    tags: "video, Async",
    auth: "separate",
  });
  assert.equal(added.status, 201);
  assert.equal(added.body.tile.id, "loom");
  assert.deepEqual(added.body.tile.tags, ["video", "async"]);
  assert.equal(added.body.version, 1);

  const cat = await call(env, ROLES.MEMBER, "x@3hue.net", "GET", "/api/catalog");
  assert.equal(cat.body.source, "kv");
  assert.equal(cat.body.apps.length, HUB_CATALOG.apps.length + 1);
  assert.equal(cat.body.updatedBy, "teriah@3hue.net");

  const edited = await call(env, ROLES.ADMIN, "teriah@3hue.net", "PUT", "/api/admin/apps/loom", {
    ifVersion: 1,
    tile: { ...added.body.tile, url: "https://loom.com/", owner: "Marketing Ops" },
  });
  assert.equal(edited.status, 200);
  assert.equal(edited.body.tile.url, "https://loom.com/");
  assert.equal(edited.body.version, 2);

  await rejects(
    call(env, ROLES.ADMIN, "teriah@3hue.net", "PUT", "/api/admin/apps/loom", {
      ifVersion: 1,
      tile: added.body.tile,
    }),
    409,
    /Reload/
  );

  const deleted = await call(
    env,
    ROLES.ADMIN,
    "teriah@3hue.net",
    "DELETE",
    "/api/admin/apps/loom?ifVersion=2"
  );
  assert.equal(deleted.body.deleted, "loom");
  await rejects(call(env, ROLES.ADMIN, "teriah@3hue.net", "DELETE", "/api/admin/apps/loom"), 404);

  const audit = await call(env, ROLES.ADMIN, "teriah@3hue.net", "GET", "/api/admin/audit");
  assert.deepEqual(
    audit.body.entries.map((e) => e.action),
    ["tile.delete", "tile.update", "tile.add"]
  );
  assert.equal(audit.body.entries[0].by, "teriah@3hue.net");
});

test("tile validation rejects bad input and normalizes good input", () => {
  const ok = validateTile({
    name: "Figma Slides",
    url: "https://figma.com/slides",
    tab: "core",
    group: "productivity",
    color: "#A259FF",
    monogram: "fs",
    audience: ["sales", "nope"],
    featured: true,
  });
  assert.equal(ok.id, "figma-slides");
  assert.equal(ok.color, "#a259ff");
  assert.deepEqual(ok.audience, ["sales"]);
  assert.equal(ok.featured, true);
  assert.throws(
    () => validateTile({ name: "", url: "https://x.test", tab: "core", group: "m365" }),
    (e) => e.status === 400 && /Name is required/.test(e.message)
  );
  assert.throws(
    () => validateTile({ name: "X", url: "javascript:alert(1)", tab: "core", group: "m365" }),
    /URL must start with/
  );
  assert.throws(
    () => validateTile({ name: "X", url: "https://x.test", tab: "core", group: "platforms" }),
    /different section/
  );
  assert.throws(
    () => validateTile({ name: "X", url: "https://x.test", tab: "nope", group: "m365" }),
    /Unknown section/
  );
  assert.throws(
    () =>
      validateTile({
        name: "X",
        url: "https://x.test",
        tab: "core",
        group: "m365",
        icon: "http://insecure.test/i.png",
      }),
    /Icon URL/
  );
  assert.throws(
    () =>
      validateTile({
        name: "X",
        url: "https://x.test",
        tab: "core",
        group: "m365",
        ownerEmail: "not-an-email",
      }),
    /Owner email/
  );
  const dup = validateTile(
    { name: "Outlook", url: "https://x.test", tab: "core", group: "m365" },
    { existingIds: new Set(["outlook"]) }
  );
  assert.equal(dup.id, "outlook-2");
});

test("only super admins manage admins; supers are config-only", async () => {
  const kv = memoryKv();
  const env = envWith(kv);
  await rejects(
    call(env, ROLES.ADMIN, "teriah@3hue.net", "POST", "/api/admin/roles", {
      email: "someone@3hue.net",
    }),
    403,
    /Super Admin/
  );
  const added = await call(env, ROLES.SUPER, "aramirez@3hue.net", "POST", "/api/admin/roles", {
    email: "Teriah@3hue.net",
  });
  assert.equal(added.status, 201);
  assert.equal(added.body.admins[0].email, "teriah@3hue.net");
  assert.equal(added.body.admins[0].addedBy, "aramirez@3hue.net");
  await rejects(
    call(env, ROLES.SUPER, "aramirez@3hue.net", "POST", "/api/admin/roles", {
      email: "teriah@3hue.net",
    }),
    409
  );
  await rejects(
    call(env, ROLES.SUPER, "aramirez@3hue.net", "POST", "/api/admin/roles", {
      email: "outsider@gmail.com",
    }),
    400,
    /@3hue.net/
  );
  await rejects(
    call(env, ROLES.SUPER, "aramirez@3hue.net", "POST", "/api/admin/roles", {
      email: "aramirez@3hue.net",
    }),
    400,
    /already a Super Admin/
  );
  await rejects(
    call(env, ROLES.SUPER, "aramirez@3hue.net", "DELETE", "/api/admin/roles/aramirez%403hue.net"),
    400,
    /cannot be removed/
  );
  const roles = await call(env, ROLES.ADMIN, "teriah@3hue.net", "GET", "/api/admin/roles");
  assert.deepEqual(roles.body.superAdmins, ["aramirez@3hue.net"]);
  const removed = await call(
    env,
    ROLES.SUPER,
    "aramirez@3hue.net",
    "DELETE",
    "/api/admin/roles/teriah%403hue.net"
  );
  assert.deepEqual(removed.body.admins, []);
  assert.equal(await resolveRole(env, "teriah@3hue.net"), ROLES.MEMBER);
});

test("announcements are validated; reset is super-only and returns to the seed", async () => {
  const kv = memoryKv();
  const env = envWith(kv);
  const saved = await call(env, ROLES.ADMIN, "teriah@3hue.net", "PUT", "/api/admin/announcements", {
    announcements: [{ date: "2026-10-04", title: "Hello", body: "World", author: "huey" }],
  });
  assert.equal(saved.body.announcements.length, 1);
  await rejects(
    call(env, ROLES.ADMIN, "teriah@3hue.net", "PUT", "/api/admin/announcements", {
      announcements: [{ date: "yesterday", title: "x", body: "y" }],
    }),
    400,
    /YYYY-MM-DD/
  );
  await rejects(call(env, ROLES.ADMIN, "teriah@3hue.net", "POST", "/api/admin/reset"), 403);
  const reset = await call(env, ROLES.SUPER, "aramirez@3hue.net", "POST", "/api/admin/reset");
  assert.equal(reset.body.source, "static");
  assert.equal((await getCatalog(env)).version, 0);
});

test("without a KV binding, reads fall back to the seed and writes fail clearly", async () => {
  const env = { HUB_SUPER_ADMINS: "aramirez@3hue.net" };
  assert.equal((await getCatalog(env)).source, "static");
  await rejects(
    call(env, ROLES.SUPER, "aramirez@3hue.net", "POST", "/api/admin/apps", {
      name: "X",
      url: "https://x.test",
      tab: "core",
      group: "m365",
    }),
    503,
    /HUB_KV/
  );
});
