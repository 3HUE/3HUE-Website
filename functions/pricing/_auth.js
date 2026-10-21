/* Signed cookie after a verified work email: lets the same browser open the gated rate card for 90 days. */
const enc = new TextEncoder();
async function hmac(secret, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
const secretOf = (env) => env.QUOTE_SECRET || env.RESEND_API_KEY || 'unsigned';
export async function verifiedCookie(env, email) {
  const exp = Date.now() + 90 * 86400 * 1000;
  const sig = await hmac(secretOf(env), `${email}|${exp}`);
  const b64 = btoa(email).replace(/=+$/, '');
  return `hue_v=${b64}.${exp}.${sig}; Path=/; Max-Age=${90 * 86400}; HttpOnly; Secure; SameSite=Lax`;
}
export async function isVerified(request, env) {
  const m = /(?:^|;\s*)hue_v=([^;]+)/.exec(request.headers.get('cookie') || '');
  if (!m) return false;
  const [b64, exp, sig] = m[1].split('.');
  if (!b64 || !exp || !sig || +exp < Date.now()) return false;
  let email; try { email = atob(b64); } catch (e) { return false; }
  const want = await hmac(secretOf(env), `${email}|${exp}`);
  return want.length === sig.length && want === sig;
}
export const newId = () => { const a = new Uint8Array(16); crypto.getRandomValues(a); return btoa(String.fromCharCode(...a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
export const sixDigits = () => { const a = new Uint32Array(1); crypto.getRandomValues(a); return String(100000 + (a[0] % 900000)); };
