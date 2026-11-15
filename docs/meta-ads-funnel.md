# Meta paid ads: setup and funnel

Facebook + Instagram ads that turn people into Posta installs, then trials,
then paid subscribers. Written 2026-11-05. Android only for now (Play is live,
iOS 1.0.0 is in review).

Nothing here spends money yet. Everything marked **YOU** needs the founder:
payment details, accepting terms, publishing a campaign.

---

## 1. What exists and what is missing (audit 2026-11-05)

Business portfolio **Posta: Learn Argentine Spanish** (`2147525229231401`).

| Piece | State | What to do |
|---|---|---|
| Ad account | ✅ `2585166565333598` **Posta Ads**, USD, country Israel (named 2026-11-05). | Nothing. |
| Payment method | ❌ none | **YOU**: Billing & payments → Add payment method. |
| Facebook Page | ✅ *Posta: Argentinian Spanish* (`1388704500998469`), linked to Instagram | Nothing. You pick it as the ad identity in Ads Manager. |
| Instagram | ✅ @postaspanish (`17841434132316484`) connected to the ad account (2026-11-05) | Nothing. |
| Meta app for ads | ✅ **Posta Ads** (App ID `3264549403741456`, 2026-11-05): use case app ads, Android platform (Play, `app.posta.android`, `com.posta.app.MainActivity`, key hash), privacy URL, linked + authorized for the ad account. **Still in development mode (unpublished).** | Publish it (App settings → Publicar) the day the SDK build ships. Client token: App settings → Advanced. |
| App events (installs, trial, subscription) | ❌ no SDK in the app, no data set in Events Manager | Code is written (§3), needs a store build. |
| Domain postaspanish.com | ❌ not added | Optional. Only needed for website campaigns; skip for app ads. |

---

## 2. The ads app (done 2026-11-05, kept for reference)

Keep it apart from *Posta Scheduler* so a problem in one never blocks the other.

1. [developers.facebook.com/apps](https://developers.facebook.com/apps) → **Create app** →
   name **Posta Ads** → use case for app ads / "Other" → business portfolio
   *Posta: Learn Argentine Spanish*.
2. App settings → Basic → **Add platform → Android**:
   - Google Play package name: `app.posta.android`
   - Class name: `com.posta.app.MainActivity` (the Kotlin namespace, not the package name)
   - Key hash (Play app signing key, SHA-1 `CB:67:58:68:CD:72:9F:A1:47:10:91:A8:1C:93:18:90:EF:88:C1:BF`):
     `y2dYaM1yn6FHEJGoHJMYkO+Iwb8=`
     (from Play Console → App integrity → App signing; convert with
     `echo <SHA1 without colons> | xxd -r -p | base64`)
   - Turn on **Log in-app events automatically**.
3. Copy the **App ID** (Basic) and **Client token** (Advanced). They are not
   secrets in the sense of an API key (they ship inside the app), but keep them
   out of chat; put them in `app.json` (§3).
4. Business settings → Apps → *Posta Ads* → Connect assets → the ad account.
   The app now shows up in Events Manager and as a promotable app in Ads Manager.
5. When iOS is live: add an iOS platform (bundle `app.posta.ios`, App Store ID
   `6817374310`).

---

## 3. SDK: install → trial → subscription (needs a native build)

Written, not installed, not committed: [`src/lib/meta-ads.ts`](../src/lib/meta-ads.ts).
Nothing imports it yet, so the app is unchanged.

Uses [`react-native-fbsdk-next`](https://github.com/thebergamo/react-native-fbsdk-next)
and its own Expo config plugin ([Expo setup](https://www.mintlify.com/thebergamo/react-native-fbsdk-next/setup/expo)).
It is native code: **no OTA can deliver it.** With `runtimeVersion: fingerprint`,
installing it changes the fingerprint, so do it on a branch that goes straight
into the next EAS store build, and keep publishing OTAs for the current build
from a clean worktree in the meantime.

### Steps

1. `npx expo install react-native-fbsdk-next`
2. `app.json` → `plugins`:
   ```json
   ["react-native-fbsdk-next", {
     "appID": "<App ID>",
     "clientToken": "<Client token>",
     "displayName": "Posta",
     "scheme": "fb<App ID>",
     "advertiserIDCollectionEnabled": false,
     "autoLogAppEventsEnabled": true,
     "isAutoInitEnabled": false
   }]
   ```
3. Calls (4 lines in existing files):
   - `src/app/_layout.tsx` (root, once): `metaAds.start()`
   - after the account is made (where `trackStep('account')` fires):
     `metaAds.registered(method)`
   - `src/app/paywall.tsx` → `buy()`, right after `success()`:
     ```ts
     const plan = { id: p.id, price: p.price, currency: p.currency };
     if (p.trialDays) metaAds.trialStarted(plan); else metaAds.subscribed(plan);
     ```
4. EAS build → Play internal testing → open the app → Events Manager → *Posta
   Ads* → **Test events** shows `fb_mobile_activate_app`, `StartTrial`,
   `Subscribe`. Then production.

Event names are Meta standard events ([App Events reference](https://developers.facebook.com/documentation/app-events/reference),
[Android getting started](https://developers.facebook.com/docs/app-events/getting-started-app-events-android/)).
Installs and app opens are logged by the SDK itself.

### Decisions for YOU before that build

- **Advertising ID.** `app.json` blocks `com.google.android.gms.permission.AD_ID`.
  Meta still attributes ad clicks through the Google Play install referrer,
  but not view-through installs, and optimizes worse. Unblocking it means
  updating the Play **Data safety** form ("Device or other IDs", shared for
  advertising). Recommendation: unblock it and set
  `advertiserIDCollectionEnabled: true` once ads are worth more than ~$500/month.
- **Privacy policy + Data safety.** Either way, the Meta SDK shares app
  activity (installs, opens, purchases) with Meta. Add Meta as a processor in
  `docs/privacy-policy.md` / the site's privacy page, and in Play Data safety,
  before the build ships.

### Privacy text + Play Data safety (ship WITH the SDK build, not before)

Decision 2026-11-05: **AD_ID stays blocked.** Even so, today's policy says
"we don't show ads, we don't sell or share your data for advertising" — the
Meta SDK makes that false (CCPA counts sending app events to Meta for ad
measurement as "sharing"). Edit **both** `posta-site/privacy.html` and
`docs/privacy-policy.md` the day the build goes to production:

- *The short version*: replace the third bullet with
  "We don't show ads inside Posta and we don't sell your data. We advertise
  Posta on Facebook and Instagram, so the app tells Meta when it's installed,
  opened and when a trial or subscription starts, to measure those ads."
- *What we collect*, last paragraph: "We don't collect your precise location,
  your contacts or your advertising ID. We don't track you across other apps
  or websites, except that Meta receives the app events above to measure our
  ads (see below). You can turn off ad personalization in your Facebook or
  Instagram settings."
- *Who helps us run Posta*, new row:
  `| Meta (Facebook, Instagram) | Measures our ads | That the app was installed and opened, trial and subscription starts with plan and price, device information and IP address. No email, name or advertising ID |`
- *California*: change "We do not sell or share personal information for
  cross-context behavioral advertising" to "We do not sell personal
  information. We share app events with Meta to measure our ads, which may
  count as 'sharing' under California law; email contact@picawave.com to opt
  out."
- Update *Last updated*.

**Play Console → App content → Data safety** (same day): under *Data
shared*, add **App activity → App interactions** and **Financial info →
Purchase history**, shared with Meta, purpose **Advertising or marketing** and
**Analytics**, not optional. **Device or other IDs** stays undeclared for
sharing (AD_ID blocked).

**iOS:** sending these events to Meta from iPhone counts as tracking for Apple
→ needs the App Tracking Transparency prompt first. Keep `metaAds.start()`
Android-only until there is an iOS ads plan.

### Later: the real conversion (trial → paid)

The phone only knows "trial started". Whether she paid on day 8 is known on
the server (Play RTDN → our subscription row). Phase 2: send `Subscribe` from
the server through the **Conversions API for app events** when the first
renewal lands, so Meta can optimize for paying users, not just trials.

---

## 4. Campaign type: App promotion, straight to Play

**Use an Advantage+ app campaign (objective: App promotion)** that sends people
to the Play Store page, not a traffic campaign to postaspanish.com.

- Every extra page loses people; the landing is one more step before the store.
- App campaigns can optimize for in-app events (trial) and are measured by the
  SDK. Traffic campaigns only see clicks.
- Meta's API docs: Advantage+ app campaigns optimize for app installs, app
  events, or both, and need the app ID + store URL
  ([Advantage+ app campaigns](https://developers.facebook.com/docs/app-ads/advantage-app-campaigns),
  [Advantage+ campaign experience](https://developers.facebook.com/docs/marketing-api/advantage-campaigns)).

The landing still has two jobs: iOS people (until the App Store is live,
the badge is the email waitlist) and SEO. A small **iOS waitlist** test
(Leads or Traffic to `postaspanish.com`) is possible but optional; skip it until
Android numbers look good.

When iOS is live: a separate iOS app campaign (iOS reporting is aggregated and
delayed; never mix it with Android in one campaign).

---

## 5. Who to reach

People who are going to need Argentine Spanish specifically:

- travelling to Argentina (Buenos Aires, Patagonia, Mendoza)
- moving or living there (expats, digital nomads)
- dating or married to an Argentine, or with Argentine family

**Targeting:** broad. Advantage+ app campaigns find the people themselves; the
creative does the targeting ("Going to Buenos Aires?", "Your partner's mom only
speaks Spanish?"). Meta's own guidance and every practitioner source agree on
broad first, interests only as a test against it.

- **Countries:** start with US, UK, Canada, Australia, Ireland, New Zealand.
  English-speaking, high-paying, Play-heavy enough. Later test Germany /
  Netherlands / Nordics with English creative.
- **Language:** English.
- **Age:** 21+ (leave the rest to Meta).
- **One interest test ad set** after week 2, only if broad is starved:
  Argentina, Buenos Aires, Tango, Travel to South America, Spanish language.
- **Exclude** people who already installed (Meta does this for app campaigns
  once the SDK reports installs).

---

## 6. Creatives (9:16 reels only)

What to run, best first:

1. **Versus reels** (Pancho vs Pancho, `TÚ tienes` vs `VOS tenés`): our own
   characters, explain *why Argentine Spanish* in 3 seconds. Safe to run as ads.
2. **Crying-hook / "Only 1% can…" reels** with the blur bars.
3. **Word reels** (one slang word, the photo, the meaning).
4. **App highlights end card** reel (a real class inside the phone).

**Do not run the celeb reels as paid ads** (Messi, Milei, etc.). Organic is
one thing; paying to put a real person's face and clip next to an app is
an ad that implies endorsement and uses footage we don't own. Meta rejects
these and it is a legal risk. Keep them organic only.

Rules for every ad reel:

- 9:16, 1080×1920, 15–30 s, sound on but readable with sound off (captions).
- Hook in the first 2 seconds, app name or Pancho visible by second 3.
- Keep text and faces out of the bottom ~35% and top ~14% (the UI covers
  them; Ads Manager shows the safe-zone overlay when you upload).
- End with the store CTA: "Get Posta on Google Play" (never "free"; it's a
  free week, then paid).
- Load **5–8 reels into the one ad set**, let Meta spread spend. Add 2–3 new
  ones every week, pause the ones under budget for 7 days.

Posting a reel organically first and then using that post as the ad (*Use
existing post*) keeps likes and comments on one post.

---

## 7. Budget and test plan

Numbers to judge against (from `docs/unit-economics.md`): yearly $99 nets about
**$84 in year one on Play**. That is the most a paying user can cost.

| Step | Rough rate to check | What it allows |
|---|---|---|
| install → trial start | 10–20% (hard paywall) | |
| trial → paid | 30–50% | cost per trial ≤ ~$30 |
| ⇒ cost per install | | ≤ ~$3–4 |

Plan:

| Week | Setup | Budget | Judge by |
|---|---|---|---|
| 0 | SDK build live, test events seen | $0 | events arrive |
| 1–2 | 1 Advantage+ app campaign, **optimize for installs**, 6 countries, 5–8 reels | **$25/day** (~$350) | CPI, install→trial in PostHog |
| 3–4 | If ≥ 50 `StartTrial`/week: switch to **optimize for StartTrial**. If not: stay on installs, swap creatives | $25–40/day | cost per trial |
| 5+ | Scale +20% every 3–4 days while cost per trial < $30; add the interest test ad set | | cost per paying user (server) |

Rules:

- Don't touch a campaign for 3 days after a change (learning phase: Meta
  needs about 50 optimization events a week per ad set to settle).
- One campaign, one ad set at first. Splitting starves both.
- Kill rule: 2× target cost for 3 days in a row → pause, change creative.

---

## 8. Measuring it (PostHog + our tables)

Meta's numbers are Meta's; ours decide.

- **Where she came from:** the app already sends `install_source` (Android Play
  install referrer, `src/lib/analytics.tsx`). Meta ad installs arrive with
  `utm_source=apps.facebook.com` or `apps.instagram.com` (check on the first
  real one). A PostHog breakdown by `initial_utm_source` splits every later
  event (onboarding, paywall, trial) by channel.
- **Funnel:** `onboarding_steps` (welcome → account → ready) and
  `funnel_events` (`paywall_shown` → `checkout_started` → `checkout_ended`
  result=purchased) in Supabase, split by `install_source`.
- **Paid:** the subscriptions table (server truth, after the trial).
- **Weekly:** add a "Meta" column to the Posta Marketing dashboard: spend,
  installs (Meta), installs (Play console, `apps.facebook.com`), trials,
  paying, cost per paying user.

---

## 9. Checklist

- [ ] **YOU** add a payment method to ad account `2585166565333598`
- [x] connect @postaspanish to the ad account; ad account named Posta Ads
- [x] *Posta Ads* Meta app `3264549403741456` + Android platform, linked to the ad account
- [ ] publish the *Posta Ads* app (Meta dev mode → live) together with the SDK build
- [x] AD_ID decided: stays blocked
- [ ] privacy policy + Play Data safety, the day the SDK build ships (text in §3)
- [ ] install SDK + plugin + 4 calls, EAS build, check Test events (§3)
- [ ] pick 5–8 reels (no celeb clips), render with the store CTA
- [ ] **YOU** create the campaign in Ads Manager as a draft, review, publish
