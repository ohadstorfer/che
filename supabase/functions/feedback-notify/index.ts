// Edge function: POST /functions/v1/feedback-notify
// Body: {"id": "<feedback_messages.id>"}
//
// Called by the app right after it writes a feedback message
// (src/lib/feedback.ts). A tester's message goes to every admin's devices;
// a staff reply goes to the tester's. Only the message's own author can ask,
// only while it is fresh, and only once: the first ask claims notified_at
// (migration 20261015000020), so nobody can replay a message into pushes.
//
// A reply is a message she asked for, not a reminder: it goes to every device
// on push_subscriptions, whether or not reminders are switched on there.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { json, preflight } from "../_shared/cors.ts";

type PushSub = {
  id: string;
  user_id: string;
  expo_push_token: string | null;
  web_push_endpoint: string | null;
  web_push_p256dh: string | null;
  web_push_auth: string | null;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const FRESH_MS = 10 * 60 * 1000;
const PREVIEW = 160;

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "";
const webReady = Boolean(VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT);
if (webReady) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

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
  const callerId = who?.user?.id;
  if (!callerId) return json({ error: "not authenticated" }, { status: 401 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return json({ error: "id is required" }, { status: 400 });

  const db = createClient(url, serviceRole, { auth: { persistSession: false } });
  const { data: msg } = await db
    .from("feedback_messages")
    .select("id, user_id, author_id, from_staff, body, images, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!msg || msg.author_id !== callerId) return json({ error: "not your message" }, { status: 403 });
  if (Date.now() - new Date(msg.created_at).getTime() > FRESH_MS) return json({ sent: 0, stale: true });
  const { data: claimed, error: claimError } = await db
    .from("feedback_messages")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id)
    .is("notified_at", null)
    .select("id");
  if (claimError) return json({ error: "could not claim the message" }, { status: 500 });
  if (!claimed?.length) return json({ sent: 0, already: true });

  const text = (msg.body as string).trim();
  const preview = text ? (text.length > PREVIEW ? `${text.slice(0, PREVIEW - 1)}…` : text) : "📷 Sent a screenshot";

  let recipients: string[];
  let title: string;
  let data: Record<string, unknown>;
  if (msg.from_staff) {
    recipients = [msg.user_id];
    title = "The Posta team replied";
    data = { feedback: "reply" };
  } else {
    const { data: admins } = await db.from("profiles").select("user_id").eq("role", "admin");
    recipients = (admins ?? []).map((a) => a.user_id as string).filter((u) => u !== callerId);
    const [{ data: profile }, { data: user }] = await Promise.all([
      db.from("profiles").select("display_name").eq("user_id", msg.user_id).maybeSingle(),
      db.auth.admin.getUserById(msg.user_id),
    ]);
    const name = profile?.display_name || user?.user?.email || "A guest tester";
    title = `Feedback · ${name}`;
    data = { feedback: "inbox", user: msg.user_id };
  }
  if (recipients.length === 0) return json({ sent: 0 });

  const { data: subs } = await db
    .from("push_subscriptions")
    .select("id, user_id, expo_push_token, web_push_endpoint, web_push_p256dh, web_push_auth")
    .in("user_id", recipients);
  const all = (subs ?? []) as PushSub[];
  let sent = 0;
  const expired: string[] = [];

  const expo = all.filter((s) => s.expo_push_token);
  if (expo.length) {
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(
        expo.map((s) => ({ to: s.expo_push_token, title, body: preview, sound: "default", channelId: "default", data })),
      ),
    });
    if (res.ok) {
      const out = (await res.json().catch(() => null)) as
        | { data?: { status: string; details?: { error?: string } }[] }
        | null;
      out?.data?.forEach((t, i) => {
        if (t.status === "ok") sent++;
        else if (t.details?.error === "DeviceNotRegistered") expired.push(expo[i].id);
      });
    } else {
      console.warn("[feedback-notify] expo push failed", res.status, await res.text().catch(() => ""));
    }
  }

  const web = all.filter((s) => s.web_push_endpoint);
  if (web.length && webReady) {
    // public/sw.js opens data.url when the notification is tapped.
    const href = msg.from_staff ? "/home" : `/admin/feedback/${msg.user_id}`;
    const payload = JSON.stringify({ title, body: preview, icon: "/icon-192.png", data: { ...data, url: href } });
    await Promise.all(
      web.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.web_push_endpoint!, keys: { p256dh: s.web_push_p256dh!, auth: s.web_push_auth! } },
            payload,
            { TTL: 24 * 60 * 60 },
          );
          sent++;
        } catch (e) {
          const status = (e as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) expired.push(s.id);
          else console.warn("[feedback-notify] web push failed", status);
        }
      }),
    );
  }

  if (expired.length) await db.from("push_subscriptions").delete().in("id", expired);
  return json({ sent });
});
