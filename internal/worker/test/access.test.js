import test, { beforeEach } from "node:test";
import assert from "node:assert/strict";
import { verifyAccessJwt, AccessError, clearJwksCache, normalizeTeamDomain } from "../access.js";

const TEAM = "3hue.cloudflareaccess.com";
const AUD = "aud-tag-for-tests";
const NOW = 1_790_000_000; // fixed "now" in seconds
import { makeIssuer, b64url, segment } from "./helpers.js";

const claims = (overrides = {}) => ({
  aud: [AUD],
  email: "Ana.Ramirez@3hue.net",
  exp: NOW + 3600,
  iat: NOW - 10,
  nbf: NOW - 10,
  iss: `https://${TEAM}`,
  type: "app",
  sub: "user-123",
  country: "US",
  identity_nonce: "n0nce",
  ...overrides,
});

const options = (issuer, extra = {}) => ({
  teamDomain: TEAM,
  audience: AUD,
  allowedEmailDomains: ["3hue.net"],
  fetcher: issuer.fetcher,
  now: NOW,
  ...extra,
});

const rejects = (promise, pattern) =>
  assert.rejects(promise, (error) => error instanceof AccessError && pattern.test(error.message));

beforeEach(() => clearJwksCache());

test("accepts a valid Access token and normalizes the email", async () => {
  const issuer = await makeIssuer();
  const token = await issuer.sign(claims());
  const identity = await verifyAccessJwt(token, options(issuer));
  assert.equal(identity.email, "ana.ramirez@3hue.net");
  assert.equal(identity.sub, "user-123");
  assert.equal(identity.exp, NOW + 3600);
  assert.equal(issuer.calls.length, 1);
});

test("caches the signing keys across verifications", async () => {
  const issuer = await makeIssuer();
  await verifyAccessJwt(await issuer.sign(claims()), options(issuer));
  await verifyAccessJwt(await issuer.sign(claims({ sub: "user-456" })), options(issuer));
  assert.equal(issuer.calls.length, 1);
});

test("accepts the team domain with or without the https scheme", async () => {
  const issuer = await makeIssuer();
  const token = await issuer.sign(claims());
  await verifyAccessJwt(token, options(issuer, { teamDomain: `https://${TEAM}/` }));
  assert.equal(normalizeTeamDomain(`https://${TEAM}/`), `https://${TEAM}`);
});

test("rejects a token for another application (audience mismatch)", async () => {
  const issuer = await makeIssuer();
  await rejects(
    verifyAccessJwt(await issuer.sign(claims({ aud: ["some-other-app"] })), options(issuer)),
    /audience/
  );
});

test("rejects an expired token", async () => {
  const issuer = await makeIssuer();
  await rejects(
    verifyAccessJwt(await issuer.sign(claims({ exp: NOW - 120 })), options(issuer)),
    /expired/
  );
});

test("rejects a token issued by a different team", async () => {
  const issuer = await makeIssuer();
  await rejects(
    verifyAccessJwt(
      await issuer.sign(claims({ iss: "https://evil.cloudflareaccess.com" })),
      options(issuer)
    ),
    /issuer/
  );
});

test("rejects identities outside @3hue.net even when Access let them through", async () => {
  const issuer = await makeIssuer();
  await rejects(
    verifyAccessJwt(await issuer.sign(claims({ email: "guest@gmail.com" })), options(issuer)),
    /outside the allowed/
  );
  await rejects(
    verifyAccessJwt(await issuer.sign(claims({ email: "x@3hue.net.evil.com" })), options(issuer)),
    /outside the allowed/
  );
});

test("rejects service tokens (no user email)", async () => {
  const issuer = await makeIssuer();
  await rejects(
    verifyAccessJwt(
      await issuer.sign(claims({ email: undefined, common_name: "svc" })),
      options(issuer)
    ),
    /no user email/
  );
});

test("rejects a tampered payload", async () => {
  const issuer = await makeIssuer();
  const token = await issuer.sign(claims());
  const [head, , sig] = token.split(".");
  const forged = `${head}.${segment(claims({ email: "attacker@3hue.net" }))}.${sig}`;
  await rejects(verifyAccessJwt(forged, options(issuer)), /signature/);
});

test("rejects unsigned or HMAC tokens", async () => {
  const issuer = await makeIssuer();
  const none = `${segment({ alg: "none", kid: issuer.kid })}.${segment(claims())}.`;
  await rejects(verifyAccessJwt(none, options(issuer)), /algorithm/);
  const hs = `${segment({ alg: "HS256", kid: issuer.kid })}.${segment(claims())}.${b64url(new Uint8Array(32))}`;
  await rejects(verifyAccessJwt(hs, options(issuer)), /algorithm/);
});

test("refetches the keys once for an unknown key id, then rejects", async () => {
  const issuer = await makeIssuer();
  await verifyAccessJwt(await issuer.sign(claims()), options(issuer)); // warms the cache
  const token = await issuer.sign(claims(), { kid: "rotated-key" });
  await rejects(verifyAccessJwt(token, options(issuer)), /unknown key/);
  assert.equal(issuer.calls.length, 2);
});

test("rejects malformed tokens without calling the certs endpoint", async () => {
  const issuer = await makeIssuer();
  await rejects(verifyAccessJwt("not.a.jwt.at.all", options(issuer)), /three segments/);
  await rejects(verifyAccessJwt("", options(issuer)), /missing/);
  await rejects(verifyAccessJwt("a.b.c", options(issuer)), /base64url|JSON/);
  assert.equal(issuer.calls.length, 0);
});
