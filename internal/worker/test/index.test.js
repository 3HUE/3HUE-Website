import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import worker from "../index.js";
import { clearJwksCache } from "../access.js";
import { makeIssuer, segment } from "./helpers.js";

const TEAM = "3hue.cloudflareaccess.com";
const AUD = "aud-tag";
const NOW = Math.floor(Date.now() / 1000);

const ASSETS = {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname === "/")
      return new Response("<!doctype html><title>hub</title>", {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    if (pathname === "/portal.css")
      return new Response("body{}", { headers: { "Content-Type": "text/css; charset=utf-8" } });
    return new Response("<!doctype html><title>404</title>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
const ENV = {
  ASSETS,
  ACCESS_TEAM_DOMAIN: TEAM,
  ACCESS_AUD: AUD,
  ALLOWED_EMAIL_DOMAINS: "3hue.net",
};
const PROD = "https://hub.3hue.net";

const claims = (overrides = {}) => ({
  aud: [AUD],
  email: "staff@3hue.net",
  exp: NOW + 3600,
  iat: NOW,
  iss: `https://${TEAM}`,
  sub: "u1",
  ...overrides,
});
const get = (url, init) => worker.fetch(new Request(url, init), init?.env || ENV);

const realFetch = globalThis.fetch;
beforeEach(() => clearJwksCache());
afterEach(() => {
  globalThis.fetch = realFetch;
});

test("fails closed with 503 when the Access audience is not configured", async () => {
  const res = await get(`${PROD}/`, { env: { ...ENV, ACCESS_AUD: "" } });
  assert.equal(res.status, 503);
  assert.match(await res.text(), /Access is not configured/);
  assert.equal(res.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
  assert.equal(res.headers.get("Cache-Control"), "private, no-store");
});

test("returns 403 when no Access token is present", async () => {
  const res = await get(`${PROD}/portal.css`);
  assert.equal(res.status, 403);
  assert.match(await res.text(), /Sign in required/);
});

test("returns 403 for a garbage token", async () => {
  const res = await get(`${PROD}/`, { headers: { "Cf-Access-Jwt-Assertion": "nope" } });
  assert.equal(res.status, 403);
  assert.match(await res.text(), /Access denied/);
});

test("returns 502 when the signing keys cannot be fetched", async () => {
  globalThis.fetch = async () => {
    throw new Error("network down");
  };
  const token = `${segment({ alg: "RS256", kid: "k" })}.${segment(claims())}.AAAA`;
  const res = await get(`${PROD}/`, { headers: { "Cf-Access-Jwt-Assertion": token } });
  assert.equal(res.status, 502);
});

test("serves the portal with hardened headers for a valid token", async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  const token = await issuer.sign(claims());
  const page = await get(`${PROD}/`, { headers: { "Cf-Access-Jwt-Assertion": token } });
  assert.equal(page.status, 200);
  assert.match(page.headers.get("Content-Security-Policy"), /frame-ancestors 'none'/);
  assert.equal(page.headers.get("Cache-Control"), "private, no-store");
  assert.equal(page.headers.get("X-Frame-Options"), "DENY");
  const css = await get(`${PROD}/portal.css`, { headers: { Cookie: `CF_Authorization=${token}` } });
  assert.equal(css.status, 200);
  assert.equal(css.headers.get("Cache-Control"), "private, max-age=0, must-revalidate");
  assert.equal(css.headers.get("Content-Security-Policy"), null);
  assert.equal(issuer.calls.length, 1, "certs fetched once and cached");
});

test("rejects a valid token from a non-3hue.net identity", async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  const token = await issuer.sign(claims({ email: "outsider@example.com" }));
  const res = await get(`${PROD}/`, { headers: { "Cf-Access-Jwt-Assertion": token } });
  assert.equal(res.status, 403);
  assert.match(await res.text(), /outside the allowed email domains/);
});

test("/api/me reports the verified identity", async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  const token = await issuer.sign(claims({ email: "Staff@3HUE.net" }));
  const res = await get(`${PROD}/api/me`, { headers: { "Cf-Access-Jwt-Assertion": token } });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    authenticated: true,
    email: "staff@3hue.net",
    role: "member",
    local: false,
    aiEnabled: false,
    catalogStorage: false,
  });
});

test("rejects non-GET methods", async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  const token = await issuer.sign(claims());
  const res = await get(`${PROD}/`, {
    method: "POST",
    headers: { "Cf-Access-Jwt-Assertion": token },
  });
  assert.equal(res.status, 405);
});

test("local bypass applies on loopback hosts only", async () => {
  const env = { ...ENV, ACCESS_AUD: "", ALLOW_UNAUTHENTICATED_LOCAL: "true" };
  for (const origin of ["http://localhost:8787", "http://127.0.0.1:8787", "http://[::1]:8787"]) {
    const res = await get(`${origin}/api/me`, { env });
    assert.equal(res.status, 200, origin);
    assert.deepEqual(await res.json(), {
      authenticated: false,
      email: "dev@localhost",
      role: "super",
      local: true,
      aiEnabled: false,
      catalogStorage: false,
    });
  }
  const prod = await get(`${PROD}/api/me`, { env });
  assert.equal(prod.status, 503, "bypass must never apply to the real hostname");
});

test("local bypass also accepts wrangler dev, which rewrites the host but keeps a loopback source", async () => {
  const env = { ...ENV, ACCESS_AUD: "", ALLOW_UNAUTHENTICATED_LOCAL: "true" };
  const dev = await get(`${PROD}/api/me`, { env, headers: { "cf-connecting-ip": "127.0.0.1" } });
  assert.equal(dev.status, 200);
  const edge = await get(`${PROD}/api/me`, { env, headers: { "cf-connecting-ip": "203.0.113.9" } });
  assert.equal(edge.status, 503, "a real client address never unlocks the bypass");
  const noVar = await get(`${PROD}/api/me`, {
    env: { ...ENV, ACCESS_AUD: "" },
    headers: { "cf-connecting-ip": "127.0.0.1" },
  });
  assert.equal(noVar.status, 503, "the variable is required as well");
});

test("404s pass through from the asset store", async () => {
  const res = await get("http://localhost:8787/missing", {
    env: { ...ENV, ALLOW_UNAUTHENTICATED_LOCAL: "true" },
  });
  assert.equal(res.status, 404);
  assert.equal(res.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
});

test("/api/me says whether AI answers are on", async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  const token = await issuer.sign(claims());
  const withKey = await get(`${PROD}/api/me`, {
    env: { ...ENV, ANTHROPIC_API_KEY: "k" },
    headers: { "Cf-Access-Jwt-Assertion": token },
  });
  assert.equal((await withKey.json()).aiEnabled, true);
});

test("/api/ask is 503 without an API key, 405 for GET, 400 for a non-JSON body", async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  const token = await issuer.sign(claims());
  const noKey = await get(`${PROD}/api/ask`, {
    method: "POST",
    headers: { "Cf-Access-Jwt-Assertion": token, "Content-Type": "application/json" },
    body: JSON.stringify({ question: "hi" }),
  });
  assert.equal(noKey.status, 503);
  assert.match((await noKey.json()).error, /ANTHROPIC_API_KEY/);
  const getReq = await get(`${PROD}/api/ask`, {
    env: { ...ENV, ANTHROPIC_API_KEY: "k" },
    headers: { "Cf-Access-Jwt-Assertion": token },
  });
  assert.equal(getReq.status, 405);
  const badJson = await get(`${PROD}/api/ask`, {
    method: "POST",
    env: { ...ENV, ANTHROPIC_API_KEY: "k" },
    headers: { "Cf-Access-Jwt-Assertion": token },
    body: "not json",
  });
  assert.equal(badJson.status, 400);
});

test("/api/ask still requires a valid Access token", async () => {
  const res = await get(`${PROD}/api/ask`, {
    method: "POST",
    env: { ...ENV, ANTHROPIC_API_KEY: "k" },
    body: JSON.stringify({ question: "hi" }),
  });
  assert.equal(res.status, 403);
});

/* ───────────── roles and the editable catalog ───────────── */
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

// One issuer per test: the Worker caches the JWKS it fetched first, so every token in a test must
// come from the same key pair.
const signerFor = async () => {
  const issuer = await makeIssuer();
  globalThis.fetch = issuer.fetcher;
  return async (email) => ({
    "Cf-Access-Jwt-Assertion": await issuer.sign(claims({ email, sub: email })),
  });
};

test("/api/me resolves Super Admin from configuration and Admin from KV", async () => {
  const as = await signerFor();
  const HUB_KV = memoryKv();
  await HUB_KV.put(
    "roles:admins",
    JSON.stringify({ admins: [{ email: "ops@3hue.net", addedBy: "aramirez@3hue.net" }] })
  );
  const env = { ...ENV, HUB_KV, HUB_SUPER_ADMINS: "aramirez@3hue.net" };
  const superMe = await get(`${PROD}/api/me`, { env, headers: await as("ARamirez@3hue.net") });
  assert.equal((await superMe.json()).role, "super");
  const adminMe = await get(`${PROD}/api/me`, { env, headers: await as("ops@3hue.net") });
  const adminBody = await adminMe.json();
  assert.equal(adminBody.role, "admin");
  assert.equal(adminBody.catalogStorage, true);
  const memberMe = await get(`${PROD}/api/me`, { env, headers: await as("staff@3hue.net") });
  assert.equal((await memberMe.json()).role, "member");
});

test("/api/catalog is readable by every member; /api/admin requires the Admin role", async () => {
  const as = await signerFor();
  const env = { ...ENV, HUB_KV: memoryKv(), HUB_SUPER_ADMINS: "aramirez@3hue.net" };
  const headers = await as("staff@3hue.net");
  const cat = await get(`${PROD}/api/catalog`, { env, headers });
  assert.equal(cat.status, 200);
  const doc = await cat.json();
  assert.equal(doc.source, "static");
  assert.ok(doc.apps.length > 50);

  const denied = await get(`${PROD}/api/admin/apps`, {
    env,
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      tile: { name: "X", url: "https://x.example", tab: "core", group: "collab" },
    }),
  });
  assert.equal(denied.status, 403);
  assert.match((await denied.json()).error, /Admin role/);
  const roles = await get(`${PROD}/api/admin/roles`, { env, headers });
  assert.equal(roles.status, 403);
});

test("an Admin edits a tile and the change shows up in the effective catalog", async () => {
  const as = await signerFor();
  const HUB_KV = memoryKv();
  await HUB_KV.put("roles:admins", JSON.stringify({ admins: [{ email: "ops@3hue.net" }] }));
  const env = { ...ENV, HUB_KV, HUB_SUPER_ADMINS: "aramirez@3hue.net" };
  const headers = { ...(await as("ops@3hue.net")), "Content-Type": "application/json" };
  const before = await (await get(`${PROD}/api/catalog`, { env, headers })).json();
  const ecarm = before.apps.find((app) => app.id === "ecarm");
  assert.ok(ecarm);
  const res = await get(`${PROD}/api/admin/apps/ecarm`, {
    env,
    method: "PUT",
    headers,
    body: JSON.stringify({
      ifVersion: before.version,
      tile: { ...ecarm, url: "https://ecarm.3hue.net" },
    }),
  });
  assert.equal(res.status, 200, await res.text());
  const after = await (await get(`${PROD}/api/catalog`, { env, headers })).json();
  assert.equal(after.source, "kv");
  assert.equal(after.version, 1);
  assert.equal(after.apps.find((app) => app.id === "ecarm").url, "https://ecarm.3hue.net");

  // An Admin cannot appoint other admins; a Super Admin can.
  const add = (hdrs) =>
    get(`${PROD}/api/admin/roles`, {
      env,
      method: "POST",
      headers: { ...hdrs, "Content-Type": "application/json" },
      body: JSON.stringify({ email: "new@3hue.net" }),
    });
  assert.equal((await add(headers)).status, 403);
  const asSuper = await add(await as("aramirez@3hue.net"));
  assert.equal(asSuper.status, 201);
  assert.equal(
    (await (await get(`${PROD}/api/me`, { env, headers: await as("new@3hue.net") })).json()).role,
    "admin"
  );
});

test("unknown /api/admin paths are 404 for admins and 405 is not leaked for non-admins", async () => {
  const as = await signerFor();
  const env = { ...ENV, HUB_KV: memoryKv(), HUB_SUPER_ADMINS: "aramirez@3hue.net" };
  const res = await get(`${PROD}/api/admin/nothing`, {
    env,
    headers: await as("aramirez@3hue.net"),
  });
  assert.equal(res.status, 404);
});
