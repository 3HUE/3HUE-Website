/* GET /pricing/rate-card — the full rate card, for verified work emails only (the cookie the builder sets). Everyone else goes to the builder. */
import { isVerified } from './_auth.js';
export async function onRequestGet({ request, env }) {
  if (await isVerified(request, env)) return env.ASSETS.fetch(request);
  return Response.redirect(new URL('/pricing/build?for=rate-card', request.url).toString(), 302);
}
