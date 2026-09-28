// Edge function: POST /functions/v1/delete-account
// Deletes the caller's account and everything Che holds about her — the store
// rule (App Store 5.1.1(v), Google Play's account-deletion policy) that any app
// with sign-up lets you delete the account from inside the app.
//
// Order matters: the Hablar recordings go first, through the Storage API (a
// cascade on storage.objects would leave the files behind), then her
// RevenueCat customer (when REVENUECAT_SECRET_KEY is set), then the auth user.
// Every table keyed to her cascades from auth.users. A store subscription is
// not ours to cancel: the app tells her to cancel it in the store.
//
// Staff accounts are refused: course edits reference their author without a
// cascade, and deleting a reviewer is a job for the dashboard, not a button.

import { createClient } from "jsr:@supabase/supabase-js@2";
import { json, preflight } from "../_shared/cors.ts";

type Db = ReturnType<typeof createClient>;

/** Every file under `prefix` in a bucket, one folder level at a time. */
async function listAll(db: Db, bucket: string, prefix: string): Promise<string[]> {
  const out: string[] = [];
  const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw error;
  for (const item of data ?? []) {
    const path = `${prefix}/${item.name}`;
    // Folders come back without an id.
    if (item.id) out.push(path);
    else out.push(...(await listAll(db, bucket, path)));
  }
  return out;
}

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;
  if (req.method !== "POST") return json({ error: "POST only" }, { status: 405 });

  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !serviceRole) return json({ error: "function is not configured" }, { status: 500 });

  const asUser = createClient(url, anon, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    auth: { persistSession: false },
  });
  const { data: who } = await asUser.auth.getUser();
  const userId = who?.user?.id;
  if (!userId) return json({ error: "not authenticated" }, { status: 401 });

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });

  const { data: profile } = await db.from("profiles").select("role").eq("user_id", userId).maybeSingle();
  if (profile?.role && profile.role !== "student") {
    return json({ error: "staff accounts are deleted from the dashboard" }, { status: 403 });
  }

  try {
    const files = await listAll(db, "hablar", userId);
    for (let i = 0; i < files.length; i += 100) {
      const { error } = await db.storage.from("hablar").remove(files.slice(i, i + 100));
      if (error) throw error;
    }
  } catch (e) {
    return json({ error: `recordings: ${(e as Error).message}` }, { status: 500 });
  }

  // Best effort: a RevenueCat hiccup must not leave her unable to leave.
  const rcKey = Deno.env.get("REVENUECAT_SECRET_KEY");
  if (rcKey) {
    await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${rcKey}` },
    }).catch(() => {});
  }

  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return json({ error: error.message }, { status: 500 });
  return json({ deleted: true });
});
