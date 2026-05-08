// Edge function: POST /functions/v1/send-reminder
// Triggered by pg_cron every 15 minutes (see migrations/20260427000002_cron.sql).
// Sends a recurring nudge every ~30 minutes from the user's reminder_time
// (no earlier than 08:00 local) until they complete today's class
// (streaks.last_practice_date == today). Two delivery channels:
// - Expo Push (native iOS/Android via Expo)
// - Web Push (PWA, including iOS 16.4+ home-screen)

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { json } from "../_shared/cors.ts";

type PushSub = {
  id: string;
  user_id: string;
  expo_push_token: string | null;
  platform: "ios" | "android" | "web";
  reminder_time: string;
  timezone: string;
  notifications_enabled: boolean;
  last_sent_at: string | null;
  last_text_index: number;
  web_push_endpoint: string | null;
  web_push_p256dh: string | null;
  web_push_auth: string | null;
};

type Streak = {
  user_id: string;
  current_streak: number;
  last_practice_date: string | null;
};

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  sound: "default";
  data: Record<string, unknown>;
  channelId?: string;
};

type Pick = { sub: PushSub; nextIdx: number; body: string };

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const MIN_GAP_MINUTES = 25;
const EARLIEST_LOCAL = "08:00";
const BATCH_SIZE = 100;

const MESSAGES = [
  "Hora de practicar tu español 💪",
  "5 minutos y armás tu racha 🔥",
  "Tu cerebro te lo va a agradecer 🧠",
  "¿Listo para una más? 🎯",
  "Quedamos a un ejercicio del logro de hoy ✨",
  "Dale, vos podés 🚀",
  "Un ratito de español ☕",
  "Sumá un día más a tu racha 📈",
];

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
    if (events.length === 0) return;
    const { error: evErr } = await supabase.from("notification_events").insert(events);
    if (evErr) console.error(`[send-reminder ${traceId}] failed to insert debug events`, evErr.message);
    events.length = 0;
  };

  const { data: cronSecret, error: secretErr } = await supabase.rpc("get_cron_secret");
  if (secretErr) warn("get_cron_secret error", { error: secretErr.message });
  if (typeof cronSecret === "string" && cronSecret.length > 0) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${cronSecret}`) {
      warn("unauthorized — bearer mismatch", { hasAuth: Boolean(auth) });
      await flush();
      return json({ error: "unauthorized", traceId }, { status: 401 });
    }
    log("auth ok");
  } else {
    warn("cron_secret not set — auth check skipped");
  }

  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select(
      "id,user_id,expo_push_token,platform,reminder_time,timezone,notifications_enabled,last_sent_at,last_text_index,web_push_endpoint,web_push_p256dh,web_push_auth",
    )
    .eq("notifications_enabled", true);

  if (subsErr) {
    err("db error fetching subs", { error: subsErr.message });
    return json({ error: `db error: ${subsErr.message}` }, { status: 500 });
  }

  const candidates = (subs ?? []) as PushSub[];
  log("candidates loaded", { count: candidates.length });
  if (candidates.length === 0) {
    log("no enabled subscriptions — exit");
    await flush();
    return json({ ok: true, sent: 0, total: 0, traceId });
  }

  const userIds = [...new Set(candidates.map((s) => s.user_id))];
  const { data: streaks, error: streaksErr } = await supabase
    .from("streaks")
    .select("user_id,current_streak,last_practice_date")
    .in("user_id", userIds);
  if (streaksErr) warn("streaks query error", { error: streaksErr.message });

  const streakByUser = new Map<string, Streak>(
    (streaks ?? []).map((s) => [s.user_id, s as Streak]),
  );
  log("streaks loaded", { users: userIds.length, rows: streaks?.length ?? 0 });

  const now = new Date();
  const due: PushSub[] = [];
  const skipReasons: Record<string, number> = {};
  const bumpSkip = (k: string) => { skipReasons[k] = (skipReasons[k] ?? 0) + 1; };

  for (const s of candidates) {
    const todayLocal = todayInTz(s.timezone, now);
    const streak = streakByUser.get(s.user_id);
    const localNow = localTimeInTz(s.timezone, now);
    const earliest = EARLIEST_LOCAL;
    const gapMs = s.last_sent_at ? now.getTime() - new Date(s.last_sent_at).getTime() : null;
    const channel = s.expo_push_token ? "expo" : s.web_push_endpoint ? "web" : "none";

    if (streak?.last_practice_date === todayLocal) {
      bumpSkip("done-today");
      console.log(`[send-reminder ${traceId}] skip — done today`, { sub: s.id, user: s.user_id, channel, todayLocal });
      event("skip-done-today", { userId: s.user_id, subId: s.id, detail: { channel, todayLocal } });
      continue;
    }
    if (localNow < earliest) {
      bumpSkip("before-earliest");
      console.log(`[send-reminder ${traceId}] skip — before earliest`, { sub: s.id, user: s.user_id, channel, localNow, earliest, tz: s.timezone });
      event("skip-before-earliest", { userId: s.user_id, subId: s.id, detail: { channel, localNow, earliest, tz: s.timezone } });
      continue;
    }
    if (gapMs !== null && gapMs < MIN_GAP_MINUTES * 60_000) {
      bumpSkip("throttled");
      console.log(`[send-reminder ${traceId}] skip — throttled`, { sub: s.id, user: s.user_id, channel, gapMin: Math.round(gapMs / 60_000) });
      event("skip-throttled", { userId: s.user_id, subId: s.id, detail: { channel, gapMs } });
      continue;
    }
    console.log(`[send-reminder ${traceId}] due`, {
      sub: s.id, user: s.user_id, channel, localNow, earliest, tz: s.timezone,
      lastTextIdx: s.last_text_index, streakDays: streak?.current_streak ?? 0,
    });
    event("due", {
      userId: s.user_id,
      subId: s.id,
      detail: {
        channel, localNow, earliest, tz: s.timezone,
        lastTextIdx: s.last_text_index, streakDays: streak?.current_streak ?? 0,
      },
    });
    due.push(s);
  }

  log("filter complete", { candidates: candidates.length, due: due.length, skipReasons });

  if (due.length === 0) {
    log("nobody due — exit", { ms: Date.now() - startedAt });
    await flush();
    return json({ ok: true, sent: 0, total: candidates.length, skipReasons, traceId });
  }

  const picks: Pick[] = due.map((s) => {
    const nextIdx = (s.last_text_index + 1) % MESSAGES.length;
    return { sub: s, nextIdx, body: pickBody(nextIdx, streakByUser.get(s.user_id)) };
  });

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
      data: { url: "che://" },
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
      await Promise.all(
        webPicks.map(async (p) => {
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
              { TTL: 60 * 60 },
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

  if (sentSubIds.size > 0) {
    const sentAt = now.toISOString();
    log("updating last_sent_at + last_text_index", { count: sentSubIds.size });
    const updateResults = await Promise.all(
      picks
        .filter((p) => sentSubIds.has(p.sub.id))
        .map((p) =>
          supabase
            .from("push_subscriptions")
            .update({ last_sent_at: sentAt, last_text_index: p.nextIdx })
            .eq("id", p.sub.id)
        ),
    );
    const failed = updateResults.filter((r) => r.error).length;
    if (failed > 0) warn("update errors", { failed, total: updateResults.length });
  }

  if (expiredSubIds.length > 0) {
    log("pruning expired", { count: expiredSubIds.length, ids: expiredSubIds });
    const { error: delErr } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("id", expiredSubIds);
    if (delErr) err("prune error", { error: delErr.message });
  }

  const summary = {
    ok: true,
    sent: sentSubIds.size,
    pruned: expiredSubIds.length,
    candidates: candidates.length,
    due: due.length,
    expo: expoPicks.length,
    web: webPicks.length,
    skipReasons,
    ms: Date.now() - startedAt,
  };
  log("done", summary);
  await flush();
  return json({ ...summary, traceId });
});

function tryHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function todayInTz(timezone: string, now: Date): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
  } catch {
    return now.toISOString().slice(0, 10);
  }
}

function localTimeInTz(timezone: string, now: Date): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  } catch {
    return now.toISOString().slice(11, 16);
  }
}

function pickBody(nextIdx: number, streak: Streak | undefined): string {
  if (streak?.current_streak && nextIdx % 3 === 2) {
    const d = streak.current_streak;
    return `¡No pierdas tu racha de ${d} día${d === 1 ? "" : "s"}! 🔥`;
  }
  return MESSAGES[nextIdx];
}
