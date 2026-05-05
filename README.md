# Che — Aprendé español rioplatense

Cross-platform (iOS, Android, web/PWA) Spanish-learning app.
Supabase is the **only** backend: Postgres + Auth + Edge Functions + pg_cron.
No Vercel, no VAPID, no third party except the Claude API call inside the edge function.

## Architecture

```
┌──────────────────────────────────┐
│ Expo app (iOS / Android / Web)   │
│   Supabase JS SDK (anon auth)    │
│   Expo Push token                │
└─────────────┬────────────────────┘
              │  PostgREST + RLS    │ functions.invoke()
              ▼                     ▼
       ┌────────────────────────────────┐
       │ Supabase project (qbzjasee…)   │
       │  ─ profiles, streaks,          │
       │     sessions, push_subs        │
       │  ─ Edge Function:              │
       │     generate-exercises ──► Claude (claude-opus-4-7)
       │  ─ Edge Function:              │
       │     send-reminder    ──► Expo Push Service ─► APNs / FCM
       │  ─ pg_cron every 15 min ──► send-reminder
       └────────────────────────────────┘
```

- **Auth**: anonymous Supabase Auth. Each device gets a `auth.users.id` on first launch.
- **Streak**: stored in Postgres (`streaks` table) and bumped via `bump_streak(p_today date)` SQL function — atomic, idempotent per local day, and runs under the user's RLS context. The local AsyncStorage cache stays in sync.
- **Sessions**: cached generated sets are written to `sessions` and pulled back on app start so a user gets their history on any device.
- **Push (real)**: native iOS/Android only. The app gets an Expo Push token, writes it to `push_subscriptions` (with the user's reminder time + IANA timezone). pg_cron hits the `send-reminder` edge function every 15 min, which finds all rows whose local time is within a 20-min window of "now" and weren't already pinged today, and forwards to `https://exp.host/--/api/v2/push/send`.
- **Web fallback**: a local in-tab `setTimeout` + `Notification` API. Real push to a PWA on iOS would need VAPID; intentionally not used.

## Stack

- **Expo SDK 52**, RN 0.76, RN Web 0.19, Expo Router 4
- **NativeWind** (Tailwind for RN) + **react-native-reanimated**
- **Zustand** + **AsyncStorage** for local state/cache
- **@supabase/supabase-js** v2 with `react-native-url-polyfill`
- **expo-notifications** + **expo-device** for Expo Push tokens
- Edge Functions in TS on Deno (Supabase) — `@anthropic-ai/sdk` (npm:) inside

## Project layout

```
/che
  /app                              Expo Router screens
    _layout.tsx, +html.tsx, +not-found.tsx
    index.tsx                       Home / streak
    prompt.tsx                      Prompt input
    session/[id].tsx                Exercise session
    settings.tsx
  /components                       Exercise, StreakBadge, TranslationToggle, …
  /lib
    supabase.ts                     Client (uses EXPO_PUBLIC_SUPABASE_*)
    auth.ts                         Anonymous sign-in helper
    claude.ts                       supabase.functions.invoke('generate-exercises')
    notifications.ts                Expo Push token + push_subscriptions upsert
    store.ts                        Zustand + Supabase sync (streak / sessions / profile)
    streak.ts                       Local fallback streak math
    storage.ts, answer.ts
  /supabase
    config.toml                     Anonymous auth ON; verify_jwt per function
    /migrations
      20260427000001_init.sql       tables + RLS + bump_streak()
      20260427000002_cron.sql       pg_cron schedule for send-reminder
    /functions
      /generate-exercises/index.ts  Claude proxy (verify_jwt = true)
      /send-reminder/index.ts       Cron target → Expo Push (verify_jwt = false)
      /_shared/                     cors, prompt, parse helpers
      deno.json                     import map for the edge runtime
  /public
    manifest.json, sw.js            PWA manifest + minimal SW (no push)
    icon-192.png, icon-512.png
  /scripts/make-icons.mjs           Generates placeholder PNGs
  /types
    exercise.ts                     Shared exercise schema
    db.ts                           Supabase generated types (regenerable)
  app.json, package.json, tailwind.config.js, babel.config.js, metro.config.js
```

## Setup

### 1. Install

```bash
cd che
npm install
```

### 2. Link the Supabase project

```bash
npm run db:link        # supabase link --project-ref qbzjaseetusewxnfgpes
```

(You'll be asked to log in once with `supabase login`.)

### 3. Apply database migrations

```bash
npm run db:push        # supabase db push
```

This creates `profiles`, `streaks`, `sessions`, `push_subscriptions`, the `bump_streak()` function, and schedules the pg_cron job.

### 4. Set Postgres custom settings used by pg_cron

In the Supabase **SQL Editor**, run once:

```sql
alter database postgres set app.functions_url = 'https://qbzjaseetusewxnfgpes.supabase.co/functions/v1';
alter database postgres set app.cron_secret   = 'PUT-A-LONG-RANDOM-STRING-HERE';
select pg_reload_conf();
```

Use the same value for `CRON_SECRET` in step 6.

### 5. Enable anonymous auth in the dashboard

Dashboard → **Authentication → Providers → Anonymous** → enable.
(Already requested in `supabase/config.toml`, but the dashboard toggle is the source of truth.)

### 6. Set edge function secrets

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set CRON_SECRET=PUT-A-LONG-RANDOM-STRING-HERE   # same as step 4
```

### 7. Deploy edge functions

```bash
npm run fn:deploy
# or individually:
# npm run fn:deploy:gen
# npm run fn:deploy:reminder
```

### 8. Run the app

Local env (already baked into `app.json` extra; override locally if needed):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://qbzjaseetusewxnfgpes.supabase.co \
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_kZLZNdpaZznMoXjqaMgjmQ_3SeAAmAC \
npx expo start
```

Press `i` for iOS sim, `a` for Android, `w` for web.

For real Expo Push on a physical iPhone you need a development build (Expo Go's push token works for testing, but EAS builds are required for production):

```bash
npx expo install expo-dev-client
eas build --profile development --platform ios   # then run on the device
```

### 9. Regenerate the DB types (optional, after schema changes)

```bash
npm run types:db    # writes types/db.ts
```

## How push notifications work

1. User toggles **Notificaciones diarias** in Settings.
2. The app requests OS permission, calls `Notifications.getExpoPushTokenAsync()`, and `upsert`s into `push_subscriptions` (RLS scopes the row to the authenticated user).
3. pg_cron fires `send-reminder` every 15 minutes.
4. The function selects rows where `notifications_enabled = true`, filters by:
   - the user's local "today" `≠ last_sent_date`, AND
   - their `reminder_time` is within a 20-minute look-ahead window of "now in their timezone".
5. For matches, it batches up to 100 messages and POSTs to `https://exp.host/--/api/v2/push/send`. Expo handles APNs/FCM delivery — no certs in the function, no VAPID anywhere.
6. Successful deliveries set `last_sent_date`; tokens that come back as `DeviceNotRegistered` are pruned.

## How the streak works

- The client passes its **local** `today` (YYYY-MM-DD) to `rpc('bump_streak', { p_today })`.
- The SQL function inside `security definer` reads `auth.uid()`, no-ops if `last_practice_date = today`, increments by 1 on consecutive days, resets to 1 on gaps, and bumps `longest_streak`.
- The RPC returns the new row; the store mirrors it into AsyncStorage so the home screen shows the right number even offline.

## How exercise generation works

`supabase.functions.invoke('generate-exercises', { body: { prompt } })` →
- The function authenticates the JWT (anon user is fine), enforces a 4000-char prompt cap, calls `claude-opus-4-7` with the `SYSTEM_PROMPT` in `supabase/functions/_shared/prompt.ts`.
- Strips ```json fences, slices to the outermost `{…}`, and `JSON.parse`. On parse failure, retries once asking for "JSON only".
- Validates each exercise (defaulting `type`, filling `section_title` from the section).

The system prompt enforces:
- **Spanish**: Rioplatense, voseo (`tenés`, `vos`, `querés`), porteño (`plata`, `laburo`, `mango`).
- **English** (`english_idiomatic`): casual American — never literal.
- **Hebrew** (`hebrew_idiomatic`): natural Israeli colloquial in Hebrew script (`בא לך`, `סבבה`, `יאללה`).

## Replacing the icons

`scripts/make-icons.mjs` writes solid-color placeholder PNGs. Replace `assets/icon.png`, `assets/splash.png`, `public/icon-192.png`, `public/icon-512.png` with branded artwork.

## Notes / limits

- iOS PWA push intentionally not implemented (would require VAPID).
- Android push from production EAS builds requires FCM credentials configured in EAS — set `android.googleServicesFile` and add the FCM project once you go to production.
- The local `react-native-url-polyfill/auto` import in `lib/supabase.ts` is required for Supabase to fetch correctly under React Native.
