// Edge function: POST /functions/v1/hablar-retention
// Deletes Hablar recordings older than 30 days (docs/hablar-hld.md §5).
//
// Called once a day by the che-hablar-retention pg_cron job with the vault's
// cron_secret as bearer, like send-reminder. Files go through the Storage API
// (a plain delete on storage.objects would leave them behind); the transcripts
// stay, and a turn whose clip is gone loses its audio_path.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

const BATCH = 500;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRole) return json({ error: "function is not configured" }, { status: 500 });
  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  // Fails closed: no secret, no deletes.
  const { data: secret } = await db.rpc("get_cron_secret");
  if (typeof secret !== "string" || !secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "unauthorized" }, { status: 401 });
  }

  let removed = 0;
  for (let round = 0; round < 20; round++) {
    const { data: names, error } = await db.rpc("hablar_expired_recordings", { p_limit: BATCH });
    if (error) return json({ error: error.message, removed }, { status: 500 });
    const paths = (names ?? []) as string[];
    if (!paths.length) break;
    const { error: rmErr } = await db.storage.from("hablar").remove(paths);
    if (rmErr) return json({ error: rmErr.message, removed }, { status: 500 });
    // In small groups: the filter travels in the URL.
    for (let i = 0; i < paths.length; i += 50) {
      await db.from("conversation_turns").update({ audio_path: null }).in("audio_path", paths.slice(i, i + 50));
    }
    removed += paths.length;
    if (paths.length < BATCH) break;
  }
  return json({ removed });
});
