/* 3HUE Enterprise Hub — edge entry point.
 *
 * Cloudflare Access authenticates @3hue.net staff in front of hub.3hue.net. Because wrangler.toml
 * sets run_worker_first, this Worker sees every request (static assets included), re-verifies the
 * Access JWT, and only then serves the portal from the ASSETS binding with hardened headers.
 * Nothing here holds secrets: the AUD tag and team domain are public identifiers. */
import { verifyAccessJwt, AccessError } from "./access.js";

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://3hue.net",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://3hue.net",
  "connect-src 'self' https://graph.microsoft.com https://login.microsoftonline.com",
  "frame-src https://login.microsoftonline.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const BASE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

const LOOPBACK = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const isLoopback = (value) => LOOPBACK.has(String(value || "").toLowerCase());

/* Local development only. Two independent conditions must hold: the ALLOW_UNAUTHENTICATED_LOCAL
 * variable (lives in the git-ignored .dev.vars, never in wrangler.toml) AND a loopback origin.
 * wrangler dev rewrites the URL/Host to the configured custom domain, so the origin is taken from
 * cf-connecting-ip, which Cloudflare always overwrites with the true client address in production —
 * a request through the edge can never present a loopback source. */
const isLocalDevRequest = (request, env, url) =>
  env.ALLOW_UNAUTHENTICATED_LOCAL === "true" &&
  (isLoopback(url.hostname) || isLoopback(request.headers.get("cf-connecting-ip")));

const splitList = (value) =>
  String(value || "")
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);

const readCookie = (request, name) => {
  const header = request.headers.get("Cookie") || "";
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
  );

const applyHeaders = (response, { html = false } = {}) => {
  const out = new Response(response.body, response);
  Object.entries(BASE_HEADERS).forEach(([key, value]) => out.headers.set(key, value));
  const type = out.headers.get("Content-Type") || "";
  if (html || type.includes("text/html")) {
    out.headers.set("Content-Security-Policy", CSP);
    out.headers.set("Cache-Control", "private, no-store");
  } else {
    // Assets keep their ETag for cheap 304 revalidation, but are never cacheable by shared caches.
    out.headers.set("Cache-Control", "private, max-age=0, must-revalidate");
  }
  return out;
};

const problem = (status, title, detail, { action } = {}) => {
  const body = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${escapeHtml(title)} · 3HUE Enterprise Hub</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.6 "IBM Plex Sans","Helvetica Neue",sans-serif;background:#f6f7f9;color:#1f2937}
  main{max-width:520px;padding:32px;background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:16px;box-shadow:0 12px 24px rgba(15,23,42,.08)}
  .eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#2f86b3;font-weight:700;margin:0 0 8px}
  h1{font:700 24px/1.2 Sora,"IBM Plex Sans",sans-serif;color:#0f172a;margin:0 0 12px}
  p{margin:0 0 16px;color:#4b5563}
  a.btn{display:inline-block;padding:10px 18px;border-radius:999px;background:#44a8d9;color:#fff;font-weight:700;text-decoration:none}
  code{font-size:13px;background:#f0f2f6;padding:2px 6px;border-radius:6px}
</style></head>
<body><main><p class="eyebrow">3HUE Enterprise Hub</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p>${
    action ? `<a class="btn" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>` : ""
  }</main></body></html>`;
  return applyHeaders(
    new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8" } }),
    { html: true }
  );
};

const json = (data, init = {}) =>
  applyHeaders(
    new Response(JSON.stringify(data), {
      ...init,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "private, no-store",
        ...(init.headers || {}),
      },
    })
  );

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const localBypass = isLocalDevRequest(request, env, url);

    let identity = null;
    if (!localBypass) {
      if (!env.ACCESS_AUD || !env.ACCESS_TEAM_DOMAIN) {
        return problem(
          503,
          "Access is not configured",
          "Set ACCESS_TEAM_DOMAIN and ACCESS_AUD in wrangler.toml (the Access application's audience tag) and redeploy. The hub refuses to serve anything until then."
        );
      }
      const token =
        request.headers.get("Cf-Access-Jwt-Assertion") || readCookie(request, "CF_Authorization");
      if (!token) {
        return problem(
          403,
          "Sign in required",
          "This portal is for 3HUE personnel. Open it through the protected address to sign in with your @3hue.net account.",
          {
            action: { href: `https://${url.hostname}/`, label: "Go to sign-in" },
          }
        );
      }
      try {
        identity = await verifyAccessJwt(token, {
          teamDomain: env.ACCESS_TEAM_DOMAIN,
          audience: env.ACCESS_AUD,
          allowedEmailDomains: splitList(env.ALLOWED_EMAIL_DOMAINS),
          fetcher: (certsUrl) => fetch(certsUrl, { cf: { cacheTtl: 3600, cacheEverything: true } }),
        });
      } catch (error) {
        if (error instanceof AccessError) {
          return problem(
            403,
            "Access denied",
            `Your sign-in could not be accepted (${error.message}).`,
            {
              action: { href: "/cdn-cgi/access/logout", label: "Sign out and try again" },
            }
          );
        }
        return problem(
          502,
          "Could not verify sign-in",
          "The Access signing keys could not be fetched. Please retry in a moment."
        );
      }
    }

    if (url.pathname === "/api/me") {
      return json({
        authenticated: Boolean(identity),
        email: identity ? identity.email : null,
        local: localBypass,
      });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return problem(405, "Method not allowed", "The hub only serves GET requests.");
    }

    const response = await env.ASSETS.fetch(request);
    return applyHeaders(response);
  },
};
