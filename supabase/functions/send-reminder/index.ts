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

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) {
    return json({ error: "Supabase env missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  const { data: cronSecret } = await supabase.rpc("get_cron_secret");
  if (typeof cronSecret === "string" && cronSecret.length > 0) {
    const auth = req.headers.get("authorization") || "";
    if (auth !== `Bearer ${cronSecret}`) {
      return json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const { data: subs, error: subsErr } = await supabase
    .from("push_subscriptions")
    .select(
      "id,user_id,expo_push_token,platform,reminder_time,timezone,notifications_enabled,last_sent_at,last_text_index,web_push_endpoint,web_push_p256dh,web_push_auth",
    )
    .eq("notifications_enabled", true);

  if (subsErr) {
    return json({ error: `db error: ${subsErr.message}` }, { status: 500 });
  }

  const candidates = (subs ?? []) as PushSub[];
  if (candidates.length === 0) {
    return json({ ok: true, sent: 0, total: 0 });
  }

  const userIds = [...new Set(candidates.map((s) => s.user_id))];
  const { data: streaks } = await supabase
    .from("streaks")
    .select("user_id,current_streak,last_practice_date")
    .in("user_id", userIds);

  const streakByUser = new Map<string, Streak>(
    (streaks ?? []).map((s) => [s.user_id, s as Streak]),
  );

  const now = new Date();
  const due: PushSub[] = [];
  for (const s of candidates) {
    const todayLocal = todayInTz(s.timezone, now);
    const streak = streakByUser.get(s.user_id);
    if (streak?.last_practice_date === todayLocal) continue;
    const localNow = localTimeInTz(s.timezone, now);
    const earliest = s.reminder_time > EARLIEST_LOCAL ? s.reminder_time : EARLIEST_LOCAL;
    if (localNow < earliest) continue;
    if (s.last_sent_at) {
      const gapMs = now.getTime() - new Date(s.last_sent_at).getTime();
      if (gapMs < MIN_GAP_MINUTES * 60_000) continue;
    }
    due.push(s);
  }

  if (due.length === 0) {
    return json({ ok: true, sent: 0, total: candidates.length });
  }

  const picks: Pick[] = due.map((s) => {
    const nextIdx = (s.last_text_index + 1) % MESSAGES.length;
    return { sub: s, nextIdx, body: pickBody(nextIdx, streakByUser.get(s.user_id)) };
  });

  const expoPicks = picks.filter((p) => p.sub.expo_push_token);
  const webPicks = picks.filter((p) => p.sub.web_push_endpoint);

  const sentSubIds = new Set<string>();
  const expiredSubIds: string[] = [];

  // ----- Expo Push -----
  if (expoPicks.length > 0) {
    const messages: ExpoMessage[] = expoPicks.map((p) => ({
      to: p.sub.expo_push_token!,
      title: "Che",
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
      if (!res.ok) continue;
      const payload = (await res.json()) as {
        data?: Array<
          { status: "ok" | "error"; id?: string; details?: { error?: string } }
        >;
      };
      const tickets = payload.data ?? [];
      tickets.forEach((t, idx) => {
        const subId = batchPicks[idx].sub.id;
        if (t.status === "ok") {
          sentSubIds.add(subId);
        } else if (
          t.details?.error === "DeviceNotRegistered" ||
          t.details?.error === "InvalidCredentials"
        ) {
          expiredSubIds.push(subId);
        }
      });
    }
  }

  // ----- Web Push -----
  if (webPicks.length > 0 && VAPID_PUBLIC && VAPID_PRIVATE) {
    await Promise.all(
      webPicks.map(async (p) => {
        const payload = JSON.stringify({
          title: "Che",
          body: p.body,
          icon: "/icon-192.png",
          data: { url: "/" },
          tag: "che-reminder",
        });
        try {
          await webpush.sendNotification(
            {
              endpoint: p.sub.web_push_endpoint!,
              keys: { p256dh: p.sub.web_push_p256dh!, auth: p.sub.web_push_auth! },
            },
            payload,
            { TTL: 60 * 60 },
          );
          sentSubIds.add(p.sub.id);
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode;
          if (code === 404 || code === 410) {
            expiredSubIds.push(p.sub.id);
          }
        }
      }),
    );
  }

  if (sentSubIds.size > 0) {
    const sentAt = now.toISOString();
    await Promise.all(
      picks
        .filter((p) => sentSubIds.has(p.sub.id))
        .map((p) =>
          supabase
            .from("push_subscriptions")
            .update({ last_sent_at: sentAt, last_text_index: p.nextIdx })
            .eq("id", p.sub.id)
        ),
    );
  }

  if (expiredSubIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredSubIds);
  }

  return json({
    ok: true,
    sent: sentSubIds.size,
    pruned: expiredSubIds.length,
    candidates: candidates.length,
    due: due.length,
    expo: expoPicks.length,
    web: webPicks.length,
  });
});

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
