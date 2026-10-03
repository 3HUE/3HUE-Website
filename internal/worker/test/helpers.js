/* Shared test helper: a fake Cloudflare Access issuer (RSA key pair + certs document + signer). */
const encoder = new TextEncoder();
export const b64url = (bytes) => Buffer.from(bytes).toString("base64url");
export const segment = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

export async function makeIssuer(kid = "key-1") {
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  const jwk = await crypto.subtle.exportKey("jwk", publicKey);
  const certs = { keys: [{ kid, kty: "RSA", alg: "RS256", use: "sig", n: jwk.n, e: jwk.e }] };
  const calls = [];
  const fetcher = async (url) => {
    calls.push(String(url));
    return new Response(JSON.stringify(certs), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const sign = async (payload, { alg = "RS256", kid: kidOverride = kid } = {}) => {
    const head = segment({ alg, kid: kidOverride, typ: "JWT" });
    const body = segment(payload);
    const signature = await crypto.subtle.sign(
      { name: "RSASSA-PKCS1-v1_5" },
      privateKey,
      encoder.encode(`${head}.${body}`)
    );
    return `${head}.${body}.${b64url(new Uint8Array(signature))}`;
  };
  return { fetcher, sign, calls, kid, certs };
}
