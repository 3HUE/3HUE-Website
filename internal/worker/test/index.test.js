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
    local: false,
    aiEnabled: false,
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
      email: null,
      local: true,
      aiEnabled: false,
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
