// Public endpoint: returns the VAPID public key so the PWA can call
// pushManager.subscribe({ applicationServerKey }). Public key is not secret.

import { json, preflight } from "../_shared/cors.ts";

Deno.serve((req) => {
  const pre = preflight(req);
  if (pre) return pre;
  const publicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  if (!publicKey) return json({ error: "vapid not configured" }, { status: 500 });
  return json({ publicKey });
});
