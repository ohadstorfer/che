// Public endpoint: returns the VAPID public key so the PWA can call
// pushManager.subscribe({ applicationServerKey }). Public key is not secret.

import { json, preflight } from "../_shared/cors.ts";

Deno.serve((req) => {
  const traceId = crypto.randomUUID().slice(0, 6);
  console.log(`[vapid-public ${traceId}] invoke`, { method: req.method });
  const pre = preflight(req);
  if (pre) return pre;
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  if (!publicKey) {
    console.error(`[vapid-public ${traceId}] VAPID_PUBLIC_KEY env missing`);
    return json({ error: "vapid not configured" }, { status: 500 });
  }
  console.log(`[vapid-public ${traceId}] ok`, { keyLength: publicKey.length });
  return json({ publicKey });
});
