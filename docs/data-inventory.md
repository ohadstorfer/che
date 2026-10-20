# Posta: data inventory

_Checked against the code on 2026-10-20 (app `src/`, edge functions `supabase/functions/`, migrations, `app.json`, `package.json`). Operator: PICAWAVE, LLC, contact@picawave.com._

Public pages built from this: `posta-site/privacy.html` (mirrored in `docs/privacy-policy.md`), `posta-site/terms.html`, `posta-site/delete-account.html`.

Keep this file in step with the code: a new SDK, table, provider or `fetch(` to a new host means a new row here, a line in the privacy policy, and a re-check of the store forms below.

## 1. What is collected

"Linked" = stored against the Supabase user id (`auth.users.id`) or sent to a provider tagged with it. "Tracking" in Apple's sense (linking with other companies' data for ads, or sharing with data brokers): **nothing is used for tracking.** No ads SDK, no IDFA / ATT, `com.google.android.gms.permission.AD_ID` is in `blockedPermissions`.

Deleted by **delete-account** (`supabase/functions/delete-account`): the files in the `hablar` and `feedback` buckets under the user id, `notification_events` rows, then `auth.users`. Every user table cascades from `auth.users` (checked: profiles, progress tables, conversations/turns, feedback_messages, push_subscriptions, entitlements, funnel_events, winback_emails, email_optouts, promo_redemptions, free_passes, notification_sends, explain_usage, answer_reports, partner_links). It does **not** touch third parties (PostHog, Sentry, Resend, Anthropic, ElevenLabs) or `store_purchases` (no user id).

| # | Data | Where it comes from (code) | Why | Linked | Third party | Retention | Deleted with the account |
|---|------|------|-----|--------|-------------|-----------|------|
| 1 | **Account id** (Supabase UUID) | `lib/guest.ts` `signInAnonymously()` at the end of onboarding; `lib/social-auth.ts` | Account, sync, purchases | Yes | Supabase | Until deleted | Yes |
| 2 | **Email address** | Apple (`requestedScopes: EMAIL`, may be a `@privaterelay.appleid.com` address) or Google OAuth, stored in `auth.users`. Guests have none. No email/password sign-in in the app (`login.tsx` has none). | Sign-in, support, win-back emails | Yes | Supabase; Apple/Google (identity providers); Resend (win-back mail) | Until deleted | Yes (Resend keeps its own send logs) |
| 3 | **Name** | Apple full name on first sign-in (`updateUser({ full_name })`); Google profile name (Supabase identity data); `profiles.display_name` = part of the email before the @ (`lib/auth.tsx`); the first name typed in onboarding (`Answers.name`) | Greeting, "Hola, X" in mails | Yes | Supabase; Resend (in the mail greeting) | Until deleted | Yes |
| 4 | **Onboarding answers**: name, reasons for learning, level, daily minutes, what got in the way, reminder yes/no | `app/onboarding.tsx` → AsyncStorage **and** `auth.updateUser({ data: { onboarding } })` (also `components/save-account.tsx`) | Plan, paywall copy, returning-user detection | Yes | Supabase | Until deleted | Yes |
| 5 | **Time zone** | `expo-localization` → `profiles.timezone`, `push_subscriptions.timezone` | Streak day, reminder time | Yes | Supabase | Until deleted | Yes |
| 6 | **Learning progress**: lessons, rounds, every answer typed/chosen, SRS states, review logs, streaks, saved words, side progress | `lib/session.ts`, `lib/round.ts`, `lib/outbox.ts`, `lib/srs.ts` etc. → tables `lesson_progress`, `rounds`, `review_logs`, `sentence_states`, `form_states`, `form_answers`, `streaks`, `daily_sessions`, `srs_commits`, `side_progress` | The course itself, scheduling reviews, improving the course (aggregate `gloss_tallies_cache`) | Yes | Supabase | Until deleted | Yes |
| 7 | **Answer reports** ("my answer was right") | `answer_reports` | Fix the answer key | Yes | Supabase | Until deleted | Yes |
| 8 | **"Why?" explanations** | `explain-answer`: the learner's wrong answer + exercise → **Anthropic** (`claude-sonnet-5`). Result cached in `explanations` keyed by exercise+answer, shared, no user id. `explain_usage` counts per user per day. | Explain mistakes | Request: yes (user JWT); cache: no | Anthropic | Cache: indefinite (not personal); usage counts until deleted | Usage yes; cache n/a |
| 9 | **Hablar voice recordings** | Mic (`expo-audio`, permission string in `app.json`) → `hablar-reply` / `hablar-transcribe` → private Storage bucket `hablar/<user id>/…`; audio sent to **ElevenLabs** speech-to-text (`scribe_v2`) | Speaking practice | Yes | Supabase (storage), ElevenLabs (STT) | **30 days** (`hablar-retention`, pg_cron `che-hablar-retention` daily 04:17) | Yes |
| 10 | **Hablar transcripts, typed turns, hints, translations, summaries/corrections** | `conversations`, `conversation_turns` (`text`, `text_en`); learner text + chat history → **Anthropic** (`claude-haiku-5-5` replies/grading/hints, `claude-opus-5-5` for unit scenes, which contain no learner data) | Pancho's replies, feedback, summary | Yes | Supabase, Anthropic | Until deleted | Yes |
| 11 | **Pancho's voice** | Pancho's text (and the corrected learner lines) → **ElevenLabs** TTS (`eleven_flash_v2_5`); MP3 stored in `hablar` bucket | Spoken replies | Yes (path under user id) | ElevenLabs, Supabase | 30 days (same bucket job) | Yes |
| 12 | **Hablar usage metering** | `hablar_usage`: provider, model, token counts, audio seconds, per conversation | Cost control | Indirectly (via conversation) | Supabase | Until the conversation is deleted | Yes (cascade) |
| 13 | **Purchases / subscription status** | `expo-iap` → `verify-purchase` (Apple JWS / Google purchase token checked with the store); `entitlements`; Apple/Google server notifications (`apple-notifications`, `google-notifications`). Each purchase carries the Posta user id as Apple `appAccountToken` / Play `obfuscatedAccountId`. No card data ever. | Unlock Premium, renewals, refunds | Yes | Apple, Google | Until deleted | `entitlements` yes. **`store_purchases` ledger (store + transaction ref + active flag, no user id) is kept** to stop refund abuse. Apple/Google keep their own records. |
| 14 | **Promo codes, free week pass, win-back offer** | `redeem-code` + `promo_redemptions` (Android); Apple offer-code redemption sheet (iOS); `free_passes`; `winback_offer()` | Discounts and the free week | Yes | Apple/Google | Until deleted | Yes |
| 15 | **Paywall funnel events** | `lib/funnel.ts` → own table `funnel_events` (event name, plan, platform) | Paywall analytics (first-party) | Yes | Supabase | Until deleted | Yes |
| 16 | **Push token + reminder settings** | `expo-notifications` → `push_subscriptions` (Expo push token, platform, reminder time, time zone, on/off). `send-reminder` sends via **Expo Push** (`exp.host`) → APNs / FCM (`google-services.json` is for FCM only, no Firebase Analytics SDK). Web Push (VAPID) exists for the browser build only. | Practice reminders, feedback replies | Yes | Expo, Apple (APNs), Google (FCM) | Until deleted / turned off | Yes |
| 17 | **Reminder logs** | `notification_events` (debug trail), `notification_sends` (what was sent when) | Reminder policy, debugging | Yes | Supabase | 14 days / 120 days (pg_cron) | Yes (events by hand, sends by cascade) |
| 18 | **Local reminders** | `trial-reminder`, `free-unit-reminder`: scheduled on the device | Remind before the trial / free week ends | No | None | On device | n/a |
| 19 | **Feedback chat** (when `feedback_settings.mode` is not `off`) | `lib/feedback.ts`: message text, an **automatic screenshot** of the current screen (`react-native-view-shot`, removable before sending), photos picked from the library (`expo-image-picker`), context (route, app version, device model, OS version) → `feedback_messages` + private bucket `feedback/<user id>/…`; `feedback-notify` pushes to staff | Support, bug fixing | Yes | Supabase, Expo Push | Until deleted | Yes |
| 20 | **PostHog analytics + session replay** | `lib/analytics.tsx` (`posthog-react-native` + `@posthog/react-native-plugin`, host `us.i.posthog.com`): screen views, touch autocapture, **session replay with `maskAllTextInputs: false`, `maskAllImages: false`** (everything on screen and everything typed is visible in recordings), `captureLog: true` (console logs), `captureNetworkTelemetry: true` (request URLs/timings), `identify(user id)`. Device model, OS, app version, PostHog's own install id, IP (PostHog derives approximate location from IP by default unless "Discard client IP data" is on in project settings). Off on web and demo builds. | Product analytics, understanding where learners get stuck, debugging | Yes (user id) | PostHog (US) | PostHog plan retention (check the project settings; free plan: events ~1 year, recordings ~30 days) | **No** (not called from delete-account; delete the person in PostHog on request) |
| 21 | **Crash and error reports** | `lib/sentry.ts` (`@sentry/react-native`, org `picawave`, project `posta`): crashes, JS errors, stack traces, breadcrumbs, device/OS/app version, `setUser({ id })`. `sendDefaultPii: false`, `tracesSampleRate: 0`, no Sentry replay. | Fix crashes | Yes (user id) | Sentry (US ingest) | Sentry plan retention (free/Developer plan: 30 days; check) | **No** |
| 22 | **Win-back emails** | `winback-email` (pg_cron hourly) via **Resend** (`api.resend.com`, from postaspanish.com): days 1, 3, 7, 30 after saving the account with Apple/Google, only while not premium; day 30 has a 40% first-year offer. `winback_emails` keeps (user, step, email, Resend id). Opt-out: `email-unsubscribe` + `email_optouts` (one-click header + postaspanish.com/unsubscribe). Apple relay addresses are skipped unless `WINBACK_APPLE_RELAY=on`. | Marketing / re-engagement | Yes | Resend | Until deleted | Our rows yes; Resend's logs no |
| 23 | **Lesson audio download** | `EXPO_PUBLIC_AUDIO_URL` = CloudFront (`d294le6kf791u9.cloudfront.net`) | Play course audio | No (IP only) | Amazon Web Services | AWS logs, if enabled | n/a |
| 24 | **App updates** | `expo-updates` checks `u.expo.dev` (platform, runtime version, IP) | Over-the-air fixes | No | Expo | Expo's | n/a |
| 25 | **Technical data on every request** | IP address, user agent, Supabase API/auth logs | Running and securing the service | Partly | Supabase, Expo, AWS | Provider log retention (short) | No |
| 26 | **On the device only** | AsyncStorage (onboarding answers copy, cached content, outbox, culture/Argentine scores), SecureStore (session), widget data in app group `group.app.posta.ios` / Android widget (streak, word of the day) | Offline use, widgets | No | None | Until the app is deleted | Cleared on sign-out / delete (`clearWidget()`) |
| 27 | **Website waitlist** (postaspanish.com, pre-launch) | `waitlist` edge function → `public.waitlist` (name, email or phone, user agent). Not linked to app accounts. | Launch announcement | No | Supabase | Until removed on request | n/a |

Not collected: precise location, contacts, health, camera, payment card data, advertising id, browsing history, search history, financial info beyond purchase status.

Internal only, not a user feature: `partner_links` (two seeded staff accounts that share reminders), `tester-premium` (must be off at launch), admin tables (`content_*`, `feedback_testers`).

### Open points to check by hand
1. **PostHog IP / GeoIP.** If "Discard client IP data" is off (the default), PostHog stores city/country from the IP. The answers below declare Coarse Location to be safe. If you switch IP capture off in PostHog, you can drop Coarse Location from both forms and the line in the privacy policy.
2. **PostHog and Sentry retention.** Read the actual settings in each project. The policy promises "at most 12 months".
3. **Account deletion does not reach PostHog / Sentry.** The policy says they expire on their schedule and can be deleted sooner on request. Adding a PostHog person delete (API) to `delete-account` would close this.
4. **Anthropic / ElevenLabs retention and training.** Anthropic's API terms say API data isn't used for training and is kept for a limited time; ElevenLabs keeps STT/TTS data per its terms unless zero-retention mode (enterprise) is on. The policy states only what we control; confirm ElevenLabs' data-use settings for this account.
5. **Supabase backups.** The policy says "a short time". Daily backups on Pro are kept 7 days.
6. **Feedback bubble** is off for everyone unless `feedback_settings.mode` is set. Declared anyway, as optional.

## 2. Apple App Privacy (App Store Connect → App Privacy)

Privacy Policy URL: `https://postaspanish.com/privacy`
"Do you or your third-party partners collect data from this app?" **Yes.**
For every type below: **Used for tracking: No.** Linked to the user: as listed.

| Apple data type | Collected | Purposes to tick | Linked | Tracking |
|---|---|---|---|---|
| Contact Info → **Name** | Yes | App Functionality; Developer's Advertising or Marketing (win-back mail greeting) | Yes | No |
| Contact Info → **Email Address** | Yes | App Functionality; Developer's Advertising or Marketing (win-back emails) | Yes | No |
| Contact Info → Phone / Physical Address / Other | No | | | |
| Health & Fitness / Financial Info / Sensitive Info / Contacts / Browsing History / Search History | No | | | |
| Location → **Coarse Location** | Yes (PostHog GeoIP from IP; see open point 1) | Analytics | Yes | No |
| Location → Precise Location | No | | | |
| User Content → **Audio Data** | Yes (Hablar recordings) | App Functionality | Yes | No |
| User Content → **Photos or Videos** | Yes (feedback screenshots and attached photos) | App Functionality | Yes | No |
| User Content → **Customer Support** | Yes (feedback chat messages) | App Functionality | Yes | No |
| User Content → **Other User Content** | Yes (answers, Hablar transcripts and typed turns, onboarding answers; also visible in unmasked session replay) | App Functionality; Product Personalization; Analytics | Yes | No |
| User Content → Emails or Text Messages / Gameplay Content | No | | | |
| Identifiers → **User ID** | Yes (Supabase user id; sent to PostHog, Sentry, Apple/Google purchases) | App Functionality; Analytics | Yes | No |
| Identifiers → **Device ID** | Yes (Expo push token; PostHog install id) | App Functionality; Analytics | Yes | No |
| Purchases → **Purchase History** | Yes | App Functionality; Analytics (paywall funnel) | Yes | No |
| Usage Data → **Product Interaction** | Yes (screens, taps, session replay, lesson activity, funnel) | Analytics; App Functionality; Product Personalization | Yes | No |
| Usage Data → Advertising Data | No | | | |
| Usage Data → Other Usage Data | No (covered by Product Interaction) | | | |
| Diagnostics → **Crash Data** | Yes (Sentry) | App Functionality; Analytics | Yes | No |
| Diagnostics → **Performance Data** | Yes (PostHog network telemetry: request timings) | Analytics; App Functionality | Yes | No |
| Diagnostics → **Other Diagnostic Data** | Yes (console logs in replay, Sentry breadcrumbs, device model/OS with feedback) | Analytics; App Functionality | Yes | No |
| Other Data → Other Data Types | Optional: time zone, reminder time. Fine to leave unticked (Apple's types already cover the substance); tick with App Functionality if you want to be exhaustive. | | | |

Notes for the form:
- Payment card data is collected by Apple, not by us: don't declare it.
- No App Tracking Transparency prompt is needed: nothing is tracking.
- Keep the iOS privacy manifests (PrivacyInfo.xcprivacy) consistent: PostHog and Sentry ship their own; check the built app's aggregated manifest if App Store Connect warns.

## 3. Google Play Data safety (Play Console → App content → Data safety)

Overview questions:
- Does your app collect or share any of the required user data types? **Yes.**
- Is all of the user data collected by your app encrypted in transit? **Yes** (HTTPS/TLS everywhere).
- Do you provide a way for users to request that their data is deleted? **Yes**: in the app (avatar → Account → Delete account) and on the web: `https://postaspanish.com/delete-account`.
- Account creation: **Yes**, OAuth (Sign in with Google; Apple on iOS) plus an automatic guest account. No username/password.
- Delete account URL: `https://postaspanish.com/delete-account`.
- Shared: **No** for every type. Every provider here (Supabase, Anthropic, ElevenLabs, PostHog, Sentry, Resend, Expo, AWS) is a service provider processing on our behalf, which Google does not count as sharing.
- Ephemeral: **No** for every type (all of it is stored for some time).
- Independent security review: No. Families program / target audience: not directed at children (13+).

| Google category → type | Collected | Required / optional | Purposes |
|---|---|---|---|
| Personal info → **Name** | Yes | Optional (only with Google/Apple sign-in, or typed in onboarding) | App functionality; Account management; Developer communications; Advertising or marketing (win-back emails) |
| Personal info → **Email address** | Yes | Optional (guests have none) | Account management; App functionality; Developer communications; Advertising or marketing |
| Personal info → **User IDs** | Yes | Required | App functionality; Analytics; Account management |
| Personal info → Address / Phone / Race / Political / Sexual orientation / Other info | No | | |
| Financial info → **Purchase history** | Yes | Optional (only if you buy) | App functionality; Analytics |
| Financial info → Payment info / Credit score / Other | No (Google Play handles payment) | | |
| Location → **Approximate location** | Yes (PostHog GeoIP; see open point 1) | Required | Analytics |
| Location → Precise location | No | | |
| Messages → **Other in-app messages** | Yes (feedback chat) | Optional | App functionality; Developer communications |
| Photos and videos → **Photos** | Yes (feedback screenshots, attached photos) | Optional | App functionality |
| Audio → **Voice or sound recordings** | Yes (Hablar) | Optional | App functionality |
| App activity → **App interactions** | Yes (screens, taps, session replay, lessons) | Required | Analytics; App functionality; Personalization |
| App activity → **Other user-generated content** | Yes (answers, Hablar transcripts and typed lines, onboarding answers) | Required | App functionality; Personalization; Analytics |
| App activity → In-app search history / Installed apps / Other actions | No | | |
| App info and performance → **Crash logs** | Yes (Sentry) | Required | Analytics; App functionality |
| App info and performance → **Diagnostics** | Yes (network timings, console logs, device model/OS) | Required | Analytics; App functionality |
| Device or other IDs → **Device or other IDs** | Yes (push token, PostHog install id) | Required | App functionality; Analytics |
| Health, Contacts, Calendar, Files and docs, Web browsing | No | | |

"Required" here means the app collects it without a separate opt-in (analytics, crash reports and device ids are not switchable in the app today). If an analytics opt-out is ever added, mark those optional.
