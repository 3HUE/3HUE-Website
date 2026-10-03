/* Cloudflare Access JWT verification for the 3HUE Enterprise Hub Worker.
 *
 * Access puts a signed RS256 JWT on every authenticated request (header Cf-Access-Jwt-Assertion,
 * also the CF_Authorization cookie). We verify it against the team's published signing keys at
 * https://<team>.cloudflareaccess.com/cdn-cgi/access/certs and check issuer, audience, expiry and
 * the user's email domain. Pure WebCrypto — no dependencies — so the same code runs in Workers and
 * in Node for the unit tests (worker/test/access.test.js). */

export class AccessError extends Error {
  constructor(message) {
    super(message);
    this.name = "AccessError";
  }
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const JWKS_TTL_MS = 60 * 60 * 1000;

/** certsUrl → { fetchedAt, keys: Map<kid, CryptoKey> } (per isolate; refreshed hourly or on unknown kid) */
const jwksCache = new Map();

export const clearJwksCache = () => jwksCache.clear();

export const base64UrlDecode = (input) => {
  const normalized = String(input).replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  let binary;
  try {
    binary = atob(padded);
  } catch (error) {
    throw new AccessError("token segment is not base64url");
  }
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const decodeSegment = (segment) => {
  try {
    return JSON.parse(decoder.decode(base64UrlDecode(segment)));
  } catch (error) {
    if (error instanceof AccessError) throw error;
    throw new AccessError("token segment is not JSON");
  }
};

/** "3hue.cloudflareaccess.com" | "https://3hue.cloudflareaccess.com/" → "https://3hue.cloudflareaccess.com" */
export const normalizeTeamDomain = (value) => {
  let domain = String(value || "")
    .trim()
    .replace(/\/+$/, "");
  if (!domain) return "";
  if (!/^https?:\/\//i.test(domain)) domain = `https://${domain}`;
  return domain.toLowerCase();
};

export async function getSigningKey(
  kid,
  certsUrl,
  fetcher,
  { now = Date.now(), forceRefresh = false } = {}
) {
  let entry = jwksCache.get(certsUrl);
  if (!entry || forceRefresh || now - entry.fetchedAt > JWKS_TTL_MS) {
    const response = await fetcher(certsUrl);
    if (!response.ok) throw new Error(`Access certs endpoint returned HTTP ${response.status}`);
    const body = await response.json();
    const keys = new Map();
    for (const jwk of body.keys || []) {
      if (jwk.kty !== "RSA" || !jwk.kid || (jwk.alg && jwk.alg !== "RS256")) continue;
      const key = await crypto.subtle.importKey(
        "jwk",
        { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
      );
      keys.set(jwk.kid, key);
    }
    entry = { fetchedAt: now, keys };
    jwksCache.set(certsUrl, entry);
  }
  return entry.keys.get(kid) || null;
}

/**
 * Verify a Cloudflare Access JWT.
 * @returns {{ email: string, sub: string, exp: number, iat?: number, country: string, identityNonce: string }}
 * @throws {AccessError} for any token problem; other errors mean the certs could not be fetched.
 */
export async function verifyAccessJwt(
  token,
  {
    teamDomain,
    audience,
    allowedEmailDomains = [],
    fetcher = fetch,
    now = Math.floor(Date.now() / 1000),
    clockSkew = 60,
  }
) {
  if (typeof token !== "string" || !token || token.length > 8192)
    throw new AccessError("missing or oversized token");
  const parts = token.split(".");
  if (parts.length !== 3) throw new AccessError("token must have three segments");

  const header = decodeSegment(parts[0]);
  const payload = decodeSegment(parts[1]);
  if (header.alg !== "RS256") throw new AccessError(`unsupported algorithm ${String(header.alg)}`);
  if (typeof header.kid !== "string" || !header.kid) throw new AccessError("token has no key id");

  const issuer = normalizeTeamDomain(teamDomain);
  if (!issuer) throw new AccessError("team domain not configured");
  if (!audience) throw new AccessError("audience not configured");

  const certsUrl = `${issuer}/cdn-cgi/access/certs`;
  let key = await getSigningKey(header.kid, certsUrl, fetcher, { now: now * 1000 });
  if (!key)
    key = await getSigningKey(header.kid, certsUrl, fetcher, {
      now: now * 1000,
      forceRefresh: true,
    }); // key rotation
  if (!key) throw new AccessError("token signed by an unknown key");

  const valid = await crypto.subtle.verify(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    base64UrlDecode(parts[2]),
    encoder.encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) throw new AccessError("signature does not verify");

  if (normalizeTeamDomain(payload.iss) !== issuer) throw new AccessError("issuer mismatch");
  const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!aud.includes(audience)) throw new AccessError("audience mismatch");
  if (typeof payload.exp !== "number" || payload.exp <= now - clockSkew)
    throw new AccessError("token expired");
  if (typeof payload.nbf === "number" && payload.nbf > now + clockSkew)
    throw new AccessError("token not yet valid");
  if (typeof payload.iat === "number" && payload.iat > now + clockSkew)
    throw new AccessError("token issued in the future");

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!email) throw new AccessError("token carries no user email (service tokens are not allowed)");
  const domains = allowedEmailDomains
    .map((domain) => String(domain).trim().toLowerCase())
    .filter(Boolean);
  if (domains.length && !domains.some((domain) => email.endsWith(`@${domain}`))) {
    throw new AccessError(`${email} is outside the allowed email domains`);
  }

  return {
    email,
    sub: typeof payload.sub === "string" ? payload.sub : "",
    exp: payload.exp,
    iat: typeof payload.iat === "number" ? payload.iat : undefined,
    country: typeof payload.country === "string" ? payload.country : "",
    identityNonce: typeof payload.identity_nonce === "string" ? payload.identity_nonce : "",
  };
}
