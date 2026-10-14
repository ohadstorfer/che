// Edge function: POST /functions/v1/send-reminder
// Triggered by pg_cron every 15 minutes (see migrations/20260427000002_cron.sql).
// For each learner who hasn't practised today it asks the reminder policy
// (_shared/reminder-policy.ts) whether a reminder is due now and which one:
// at most a routine one around her usual time and a save one in the evening,
// fewer the longer she stays away. Every device of hers gets the same message,
// over one of two delivery channels:
// - Expo Push (native iOS/Android via Expo)
// - Web Push (PWA, including iOS 16.4+ home-screen)

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { json } from "../_shared/cors.ts";
import { decide, localParts, type Learner, type Sent, type Slot, type TemplateStats } from "../_shared/reminder-policy.ts";

type PushSub = {
  id: string;
  user_id: string;
  expo_push_token: string | null;
  platform: "ios" | "android" | "web";
  timezone: string;
  updated_at: string;
  web_push_endpoint: string | null;
  web_push_p256dh: string | null;
  web_push_auth: string | null;
};

type LearnerRow = {
  user_id: string;
  anchor_at: string;
  current_streak: number;
  last_practice_date: string | null;
  last_completed_at: string | null;
  last_round_started_at: string | null;
  recent: Sent[];
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: Record<string, unknown>;
  channelId?: string;
  ttl: number;
};

type Pick = { sub: PushSub; body: string };
type Send = { user_id: string; local_date: string; slot: Slot; template: string; eligible: string[] };

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_SIZE = 100;
const PAGE = 1000; // PostgREST's row cap per request
const ID_CHUNK = 200; // ids per `.in()` filter, which travels in the URL

// A reminder is about now. If the phone is off for longer than this, it is
// better lost than delivered at the wrong hour.
const TTL_SECONDS = 60 * 60;

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "";
if (VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

type DebugEvent = {
  trace_id: string;
  kind: string;
  user_id?: string | null;
  sub_id?: string | null;
  detail?: Record<string, unknown> | null;
};

Deno.serve(async (req) => {
  const traceId = crypto.randomUUID().slice(0, 8);
  const events: DebugEvent[] = [];
  const event = (
    kind: string,
    opts?: { userId?: string | null; subId?: string | null; detail?: Record<string, unknown> | null },
  ) =>
    events.push({
      trace_id: traceId,
      kind,
      user_id: opts?.userId ?? null,
      sub_id: opts?.subId ?? null,
      detail: opts?.detail ?? null,
    });
  const log = (msg: string, extra?: Record<string, unknown>) => {
    console.log(`[send-reminder ${traceId}] ${msg}`, extra ?? "");
    event(msg, { detail: extra ?? null });
  };
  const warn = (msg: string, extra?: Record<string, unknown>) => {
    console.warn(`[send-reminder ${traceId}] ${msg}`, extra ?? "");
    event(`WARN: ${msg}`, { detail: extra ?? null });
  };
  const err = (msg: string, extra?: Record<string, unknown>) => {
    console.error(`[send-reminder ${traceId}] ${msg}`, extra ?? "");
    event(`ERROR: ${msg}`, { detail: extra ?? null });
  };

  const startedAt = Date.now();
  log("invoke", {
    method: req.method,
    hasAuth: req.headers.has("authorization"),
    vapidConfigured: Boolean(VAPID_PUBLIC && VAPID_PRIVATE && VAPID_SUBJECT),
  });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) {
    err("Supabase env missing");
    return json({ error: "Supabase env missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  const flush = async () => {
    for (const chunk of chunks(events, PAGE)) {
      const { error: evErr } = await supabase.from("notification_events").insert(chunk);
      if (evErr) console.error(`[send-reminder ${traceId}] failed to insert debug events`, evErr.message);
    }
    events.length = 0;
  };

  // Fails closed: no secret, no sends.
  const { data: cronSecret, error: secretErr } = await supabase.rpc("get_cron_secret");
  if (secretErr) warn("get_cron_secret error", { error: secretErr.message });
  const auth = req.headers.get("authorization") || "";
  if (typeof cronSecret !== "string" || !cronSecret || auth !== `Bearer ${cronSecret}`) {
    warn("unauthorized", { hasAuth: Boolean(auth), hasSecret: Boolean(cronSecret) });
    await flush();
    return json({ error: "unauthorized", traceId }, { status: 401 });
  }
  log("auth ok");

  // PostgREST returns at most 1,000 rows a request, so read in pages
  // (ordered by id, so no row repeats or goes missing between pages).
  const candidates: PushSub[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error: subsErr } = await supabase
      .from("push_subscriptions")
      .select(
        "id,user_id,expo_push_token,platform,timezone,updated_at,web_push_endpoint,web_push_p256dh,web_push_auth",
      )
      .eq("notifications_enabled", true)
      .order("id")
      .range(from, from + PAGE - 1);
    if (subsErr) {
      err("db error fetching subs", { error: subsErr.message });
      await flush();
      return json({ error: `db error: ${subsErr.message}` }, { status: 500 });
    }
    candidates.push(...((page ?? []) as PushSub[]));
    if ((page ?? []).length < PAGE) break;
  }
  log("candidates loaded", { count: candidates.length });
  if (candidates.length === 0) {
    log("no enabled subscriptions — exit");
    await flush();
    return json({ ok: true, sent: 0, total: 0, traceId });
  }

  const learners: LearnerRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data: page, error: learnersErr } = await supabase
      .rpc("reminder_learners")
      .order("user_id")
      .range(from, from + PAGE - 1);
    if (learnersErr) {
      err("db error fetching learners", { error: learnersErr.message });
      await flush();
      return json({ error: `db error: ${learnersErr.message}` }, { status: 500 });
    }
    learners.push(...((page ?? []) as LearnerRow[]));
    if ((page ?? []).length < PAGE) break;
  }

  // Without the stats every template scores the same, which is still a fair
  // way to pick one — so a failure here doesn't hold the reminders back.
  const stats = new Map<string, TemplateStats>();
  const { data: statRows, error: statsErr } = await supabase.rpc("reminder_template_stats");
  if (statsErr) warn("template stats error", { error: statsErr.message });
  for (const r of statRows ?? []) {
    stats.set(r.template, {
      chosen: r.chosen, chosenWon: r.chosen_won, passed: r.passed, passedWon: r.passed_won,
    });
  }
  log("learners loaded", { learners: learners.length, templatesWithStats: stats.size });

  const subsByUser = new Map<string, PushSub[]>();
  for (const s of candidates) subsByUser.set(s.user_id, [...(subsByUser.get(s.user_id) ?? []), s]);

  const now = new Date();
  const picks: Pick[] = [];
  const sends = new Map<string, Send>();
  const skipReasons: Record<string, number> = {};

  for (const row of learners) {
    const subs = subsByUser.get(row.user_id);
    if (!subs) continue;
    // The device she used last knows best where she is.
    const timezone = subs.reduce((a, b) => (b.updated_at > a.updated_at ? b : a)).timezone;
    const learner: Learner = {
      timezone,
      anchorAt: row.anchor_at,
      streak: row.current_streak,
      lastPracticeDate: row.last_practice_date,
      lastCompletedAt: row.last_completed_at,
      lastRoundStartedAt: row.last_round_started_at,
      recent: row.recent ?? [],
    };
    const decision = decide(learner, now, stats);
    if ("skip" in decision) {
      skipReasons[decision.skip] = (skipReasons[decision.skip] ?? 0) + 1;
      continue;
    }
    const { slot, template, eligible, body } = decision.send;
    console.log(`[send-reminder ${traceId}] due`, {
      user: row.user_id, devices: subs.length, tz: timezone, slot, template, streakDays: row.current_streak,
    });
    event("due", {
      userId: row.user_id,
      detail: { devices: subs.length, tz: timezone, slot, template, streakDays: row.current_streak },
    });
    sends.set(row.user_id, {
      user_id: row.user_id, local_date: localParts(timezone, now).date, slot, template, eligible,
    });
    for (const sub of subs) picks.push({ sub, body });
  }

  log("filter complete", { learners: learners.length, due: sends.size, skipReasons });

  if (picks.length === 0) {
    log("nobody due — exit", { ms: Date.now() - startedAt });
    await flush();
    return json({ ok: true, sent: 0, total: candidates.length, skipReasons, traceId });
  }

  // Recorded before anything goes out, and nothing goes out unrecorded: a
  // send the policy can't see would be repeated on every run.
  const sentAt = now.toISOString();
  for (const chunk of chunks([...sends.values()], PAGE)) {
    const { error: insErr } = await supabase
      .from("notification_sends")
      .insert(chunk.map((s) => ({ ...s, sent_at: sentAt })));
    if (insErr) {
      err("failed to record sends", { error: insErr.message });
      await flush();
      return json({ error: `db error: ${insErr.message}`, traceId }, { status: 500 });
    }
  }

  const expoPicks = picks.filter((p) => p.sub.expo_push_token);
  const webPicks = picks.filter((p) => p.sub.web_push_endpoint);
  log("split picks", { expo: expoPicks.length, web: webPicks.length });

  const sentSubIds = new Set<string>();
  const expiredSubIds: string[] = [];

  // ----- Expo Push -----
  if (expoPicks.length > 0) {
    log("expo push: starting", { count: expoPicks.length });
    const messages: ExpoMessage[] = expoPicks.map((p) => ({
      to: p.sub.expo_push_token!,
      title: "",
      body: p.body,
      sound: "default",
      channelId: "default",
      ttl: TTL_SECONDS,
      data: { url: "posta://" },
    }));
    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE);
      const batchPicks = expoPicks.slice(i, i + BATCH_SIZE);
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(batch),
      });
      log("expo push: batch response", { status: res.status, ok: res.ok, batch: batch.length });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        warn("expo push: batch HTTP failed", { status: res.status, body: text.slice(0, 200) });
        continue;
      }
      const payload = (await res.json()) as {
        data?: Array<
          { status: "ok" | "error"; id?: string; details?: { error?: string } }
        >;
      };
      const tickets = payload.data ?? [];
      tickets.forEach((t, idx) => {
        const pick = batchPicks[idx];
        const subId = pick.sub.id;
        if (t.status === "ok") {
          sentSubIds.add(subId);
          console.log(`[send-reminder ${traceId}] expo push ok`, { sub: subId, ticketId: t.id });
          event("expo-push-ok", { userId: pick.sub.user_id, subId, detail: { ticketId: t.id, body: pick.body } });
        } else {
          console.warn(`[send-reminder ${traceId}] expo push error`, { sub: subId, error: t.details?.error });
          event("expo-push-error", { userId: pick.sub.user_id, subId, detail: { error: t.details?.error } });
          if (
            t.details?.error === "DeviceNotRegistered" ||
            t.details?.error === "InvalidCredentials"
          ) {
            expiredSubIds.push(subId);
          }
        }
      });
    }
  }

  // ----- Web Push -----
  if (webPicks.length > 0) {
    if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
      err("web push: VAPID not configured — skipping web subscriptions", { count: webPicks.length });
    } else {
      log("web push: starting", { count: webPicks.length });
      // A few dozen at a time, not thousands of open connections at once.
      for (const batch of chunks(webPicks, BATCH_SIZE)) await Promise.all(
        batch.map(async (p) => {
          const payload = JSON.stringify({
            title: "",
            body: p.body,
            icon: "/icon-192.png",
            data: { url: "/" },
            tag: "che-reminder",
          });
          try {
            const result = await webpush.sendNotification(
              {
                endpoint: p.sub.web_push_endpoint!,
                keys: { p256dh: p.sub.web_push_p256dh!, auth: p.sub.web_push_auth! },
              },
              payload,
              { TTL: TTL_SECONDS },
            );
            sentSubIds.add(p.sub.id);
            const statusCode = (result as { statusCode?: number })?.statusCode;
            const endpointHost = tryHostname(p.sub.web_push_endpoint);
            console.log(`[send-reminder ${traceId}] web push ok`, { sub: p.sub.id, statusCode, endpointHost });
            event("web-push-ok", {
              userId: p.sub.user_id,
              subId: p.sub.id,
              detail: { statusCode, endpointHost, body: p.body },
            });
          } catch (e) {
            const code = (e as { statusCode?: number }).statusCode;
            const body = (e as { body?: string }).body;
            const message = (e as Error).message;
            const endpointHost = tryHostname(p.sub.web_push_endpoint);
            console.error(`[send-reminder ${traceId}] web push fail`, {
              sub: p.sub.id, statusCode: code, body: body?.slice(0, 200), message, endpointHost,
            });
            event("web-push-error", {
              userId: p.sub.user_id,
              subId: p.sub.id,
              detail: { statusCode: code, body: body?.slice(0, 500), message, endpointHost },
            });
            if (code === 404 || code === 410) {
              expiredSubIds.push(p.sub.id);
            }
          }
        }),
      );
    }
  }

  // A learner none of whose devices could be reached wasn't reminded: forget
  // the send, so the next run tries again while it is still the right time.
  const reached = new Set(picks.filter((p) => sentSubIds.has(p.sub.id)).map((p) => p.sub.user_id));
  const missed = [...sends.keys()].filter((id) => !reached.has(id));
  for (const chunk of chunks(missed, ID_CHUNK)) {
    const { error: delErr } = await supabase
      .from("notification_sends")
      .delete()
      .eq("sent_at", sentAt)
      .in("user_id", chunk);
    if (delErr) warn("failed to forget missed sends", { error: delErr.message });
  }

  if (expiredSubIds.length > 0) {
    log("pruning expired", { count: expiredSubIds.length, ids: expiredSubIds });
    for (const chunk of chunks(expiredSubIds, ID_CHUNK)) {
      const { error: delErr } = await supabase
        .from("push_subscriptions")
        .delete()
        .in("id", chunk);
      if (delErr) err("prune error", { error: delErr.message });
    }
  }

  const summary = {
    ok: true,
    sent: sentSubIds.size,
    pruned: expiredSubIds.length,
    candidates: candidates.length,
    due: sends.size,
    reached: reached.size,
    expo: expoPicks.length,
    web: webPicks.length,
    skipReasons,
    ms: Date.now() - startedAt,
  };
  log("done", summary);
  await flush();
  return json({ ...summary, traceId });
});

function chunks<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function tryHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}
