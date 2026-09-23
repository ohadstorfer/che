# Che — Monetization HLD

Status: **draft for discussion**, 2026-09-20. Nothing here is built.
Companion to `docs/course-spec.md`. This doc covers the funnel (onboarding → paywall → checkout),
the free/paid line, and the architecture to enforce it.

---

## 0. The one decision

> **Che is a paid product with a three-lesson demo. The culture content is free — outside the app.**

**Decided 2026-09-21, reversing §6.1 of the previous draft.** Che ships with **no free tier**: a
psychological onboarding flow, a skippable offer, three lessons, then a card-required wall.

The reasoning is segmentation, not greed. Someone who wants free Spanish practice already has
Duolingo and will never pay for Che; serving them costs support load and rating risk for zero
revenue. Che's buyer is a motivated, underserved adult who has already tried the free apps and found
they teach a Spanish nobody speaks in Buenos Aires. That person decides fast and pays.

Two things make this work rather than merely aggressive:

1. **Publish the culture, paywall the course** (§3.3). Lunfardo, Argentine word quizzes, word-of-the-day
   and dialect explainers live *free and public* — on social, on the site, for SEO. They are the
   distribution engine. The structured course, the audio and the in-product exercises are paid.
2. **The wall is a card-required trial, not an immediate charge** — the Speak / Rosetta / Pimsleur
   model. Same wall, far better conversion, far less refund and one-star risk.

**The bet, stated plainly:** that a landing page plus three lessons can get a card from someone who
has never heard of Che. That is cheap to test and should be tested before anything else is built.

---

## 1. Where we actually are (constraints)

From the codebase, not from ambition:

| Fact | Source | Consequence |
|---|---|---|
| **Native iOS + Android is the shipping target** (decided 2026-09-21). No `eas.json` and no store build exist yet | `app.json` already configures both platforms | Store commission is now a **cost of doing business, not a choice**. RevenueCat + IAP become required work. The web build survives as the **marketing site** for the free culture content (§3.3), not as the product. |
| **Audio recording is currently web-only** — "Recording is web-only for now (the PWA is the primary platform)" | `src/lib/audio.ts:4` | Native recording (`expo-audio`) is net-new work, and it gates both shadowing and the voice-conversation feature. |
| Per-user marginal cost ≈ zero | audio + content are build-time; only runtime spend is `explain-answer` (Sonnet, 60-word cap, globally cached by answer hash, 30/user/day) | Pricing is a value question, not a COGS question. |
| Real server-side accounts under RLS | `src/lib/auth.tsx`, `profiles` table with admin-only `role`, `guard_profile_role()`, `is_staff()` | Entitlements have an idiomatic home. Small change, not a rewrite. |
| **~48 published lessons / 10 units / ~119 forms** live | `content/snapshots/2026-09-19/` | **~3–6 weeks of runway.** This is the blocker on charging anything. See §10. |
| **Audio covers ~8% of sentences** (90 of 1168) | same; `docs/course-spec.md:448` | The thing we want to sell barely exists yet. Units 7–10 alone need ~3,500 ElevenLabs credits. |
| Solo operator + one native reviewer | `docs/course-spec.md` §8 | Every mechanic below must be maintainable by one person. No feature matrix. |
| Zero monetization code anywhere | repo-wide grep | Green field. Pick the right thing once. |

Primitives already built that the funnel can reuse: SM-2 SRS (`form_states`), streak with repair
(`streaks.recoverable_streak`), placement / jump-ahead (`apply_placement()`), the Mistakes queue,
19 exercise modes, web audio recording (`src/lib/audio.ts`), push (`push_subscriptions`,
`notification_events`), and round-level telemetry (`rounds`, `review_logs`).

---

## 2. What the market says (compressed evidence)

**The niche is real and unserved.** Wikipedia pageviews for *Rioplatense Spanish* (~129K/yr) outdraw
*Mexican Spanish* (75K) and match *Egyptian Arabic* and *Brazilian Portuguese* — both of which
sustain paid products. A three-page Buenos Aires expat thread asking for exactly this app ended
with **no app recommended**; the community fell back to Dreaming Spanish, Netflix and a slang book.
Live competition is one abandoned 2017 app and *Entiende: Spanish Dialects* (49 ratings, launched
2026, *"Stop learning Spanish that nobody actually speaks"*). The creator layer is all sub-2K
subscribers and sub-100 paying members. Nobody has consolidated it.

**They are asking for pronunciation, not vocabulary.** Verbatim, from that thread:

> "they don't have Argentinian Spanish and pronunciation"
> "The key issue in communicating is the Accent/Phonetics, to carry a conversation over the phone."
> "Duolingo… [is] more concerned with selling you lives etc. than you actually becoming conversational."

**Dialect specificity carries a price premium.** Practice Portuguese (European Portuguese only) is
€15/mo (~$180/yr). Kalim (Cairene Arabic only) is $35/mo (~$420/yr) and sells anti-gamification
explicitly. The mainstream apps cluster at **$60–120/yr — for *all* their languages** (see appendix).
The market bifurcates: cheap-and-broad, or expensive-and-narrow. There is no middle to sit in, and
Che is structurally in the second camp — one dialect, priced as a specialist.

**Category benchmarks (RevenueCat *State of Subscription Apps 2026*, Adapty 2026):**

- Education: **2.2% D35 download→paid**, **$44.99 median annual price — highest of any category**, $0.30 D14 revenue per install.
- Education is **back-loaded: 23.5% of trial starts happen Day 31+** — the highest of any category. Re-engagement, not Day-0, is where the LTV is.
- Hard paywall vs freemium: **10.7% vs 2.1% D35 conversion, 8× revenue per install — but identical 1-year retention (27% vs 28%)** and ~70% higher refunds.
- Trials of **17–32 days convert at 42.5%** vs **25.5% for ≤4 days**; 46.5% of apps use the short one.
  Independently corroborated: **Duolingo extended its free trial from 7 days to 1 month in 2026 and
  reported both more trials started *and* higher payer conversion** (Q2 FY2026 call).
- Annual renews at **83.4%**; 12-month retention **annual 30.7% vs monthly 9.5%**. Annual cancellation is near-terminal (5% reactivate).
- High price tier → **$62 Year-1 RLTV** vs $10 for low. Price is the lever; paywall *visual redesign* wins only 34.6% of A/B tests.
- Sobering: **only 4.6% of new subscription apps reach $10K MRR in two years**; median is ~$72/month one year in.

**Two lessons paid for by Duolingo, free to us:**

1. **Duolingo Max** — a premium AI-conversation tier — reached only **9–10% attach in two years**, was
   called "underperforming our lofty expectations," and von Ahn said on the record (Q2 FY2026,
   2026-08-05) they "may actually sunset Max" within a couple of quarters. The driver: AI video-call
   cost fell from ~$0.30 to **under $0.01 per call**, so the feature moved down into Super. There is
   no Max SKU on the US App Store today. *Do not build a second tier around AI conversation.*
2. **Energy (hearts)** — ⚠️ **correction to the obvious read.** Energy is *harsher* than hearts (25
   units, every exercise costs one whether right or wrong, ~2–3 free lessons/day, 750 gems to refill),
   and von Ahn's assessment was: *"It did exactly what we wanted it to do. It increased bookings. And
   also increased DAUs."* Duolingo's 2026 free-learner pivot was a separate strategic choice, **not a
   retreat.** So the honest lesson is: aggressive free-tier capping is *survivable* when the free
   product stays genuinely usable. Che's choice not to gate learning (§5.3) is therefore a
   **positioning bet, not a proven necessity** — we do it because this niche's loudest complaint is
   exactly this, not because it doesn't work.

Duolingo converts ~9.0% of MAU / 21.6% of DAU to paid today, at a derived ARPU of roughly **$79 per
payer per year**. It took from ~3% (2020) to 8.8% (2024) to get there.

---

## 3. Strategy

### 3.1 Product shape — the five sections

**Decided 2026-09-23. This is what the app is.**

| # | Section | What it is |
|---|---|---|
| **1** | **Main course** | The full course in rioplatense Spanish — Duolingo-shaped, beginner through competent. **The spine of the product.** |
| **2** | **Palabras** | Practice for Argentine-specific vocabulary — the words that differ, drilled. |
| **3** | **Cultura** | Vocabulary through culture: mate, asado, puteadas, alfajores, fútbol, and the rest. |
| **4** | **Expresiones** | Idioms and set phrases — how people actually string words together here. |
| **5** | **Charlas** *(maybe)* | AI conversation with an Argentine ElevenLabs voice. Optional, Phase 4, fully specced in §5.4. |

**Build order is not negotiable: the full main course comes first.** Sections 2–5 are worth nothing
without it, and each of them assumes a learner who is already progressing through the spine.

**What this decision settles:**

- **Beginners are served.** Che is a complete course, not a dialect patch for people who already speak
  Spanish. The "Spanish → Argentine conversion course" alternative — a short, finite, finishable track
  aimed only at existing Spanish speakers — was considered and **rejected**.
- **The funnel still optimises for the Spanish speaker** (§4), because the two-clip accent hook only
  lands for someone who can hear the difference. Optimising acquisition for one persona while serving
  everyone is normal; the placement test (`apply_placement()`) is what reconciles them.
- **The three demo lessons (§5.1) are drawn from the main course**, level-matched by placement.
- **Sections 2–4 are the retention engine.** They are what §5.3 pillar 6 calls the monthly content
  drop — the reason a subscriber is still paying in month four. A course alone renews badly; a course
  plus a steady stream of Cultura and Expresiones renews well.

**The consequence to accept honestly:** a full course is a long build, and it is now the critical path
for *everything* — launch, the paywall gate in §10, and every revenue number in this document. The
existing content pipeline (`course:agent`, `course:tts`, native review) is the machine for it, and
§1 is the honest starting position: ~48 lessons published of 206 drafted, audio on ~8% of sentences.

### 3.2 Decision record — why no free tier

This doc has moved three times. Recording the path so the reasoning isn't re-litigated:

| Draft | Model | Why it died |
|---|---|---|
| v1 | Whole course free, monetize features | Pronunciation scoring cancelled; no feature-shaped wall left worth the price |
| v2 | Section 1 free | Breaks on the placement test — hard-walls the best customer on day one |
| v3 | 40-lesson budget | ~2–3 of 100 installs ever reach it; forfeits the ~50% of purchases decided on Day 0 |
| v4 | 1 lesson/day forever | Defensible, but optimises for a free user who was never going to pay |
| **v5** | **3-lesson demo, then a card-required trial** | **Current** |

**The evidence for going hard:**

- **Hard paywall vs freemium: D35 install-to-paid 10.7% vs 2.1%; D60 revenue per install $3.09 vs
  $0.38 — with identical 1-year retention (27% vs 28%)** (RevenueCat 2026, 115k apps). The paywall
  type changes *who enters*, not how long they stay.
- **Installs needed for 1,520 payers (≈$10K MRR at $79): ~14,200 hard vs ~72,400 freemium.** In a
  niche this size, that gap is the entire business.
- **Half the category already has no free tier**: Speak, Pimsleur, Rosetta Stone, Lingopie,
  Jumpspeak. The dialect-specialists price hardest of all — Kalim (Cairene Arabic only) at $35/mo.
- **~50% of all purchases are decided on Day 0** (44.5% Adapty / 50.6% RevenueCat). An onboarding
  paywall with a trial is the highest-converting placement measured: **1.35% vs 0.89% in-app**.
- **Retention makes generosity moot anyway**: D1 25%, D7 8%, D30 4%. Most of a free tier's
  beneficiaries are gone before any wall fires.

**What the previous drafts were over-weighting, honestly stated:** a single complaint on one expat
forum about Duolingo selling lives. That is n=1 and was cited as though it were a finding. The
countervailing hard data — von Ahn on Energy, *"It did exactly what we wanted it to do. It increased
bookings. And also increased DAUs"* — was stronger all along.

**The risks accepted, with mitigations:**

| Risk | Mitigation |
|---|---|
| Refunds run ~70% higher on hard-gated apps | Card **trial** rather than immediate charge; plain terms; reminder before the first charge |
| Word-of-mouth needs users, and users need access | §3.3 — WOM moves to free public content, which is cheaper distribution anyway |
| Education is the most back-loaded category (23.5% of trial starts Day 31+) | Email captured pre-wall; win-back sequences; the public content keeps non-buyers in orbit |
| No brand, no reviews — asking a stranger for a card | The whole weight falls on onboarding and the 3 lessons. Test this before building anything else |

**Monopoly caveat, so it isn't overclaimed:** there is no competing Argentine Spanish *app*, but the
substitutes are Duolingo + Netflix + a $16–41/hr tutor + YouTube — which is exactly what the expat
forum recommends to itself. Che has **pricing power, not captive demand**. Price premium; don't
assume nowhere else to go.

### 3.3 Publish the culture, paywall the course

The culture layer — lunfardo, Argentine word quizzes, word-of-the-day, "why porteños say it this
way" — is the one asset that is simultaneously **non-substitutable** (Duolingo will never teach
lunfardo) and **inherently viral** (a slang quiz is a Reels format). Locking all of it behind the
wall would paywall the top of the funnel.

**The split:**

- **Free and public** — social (Reels/TikTok/Shorts), the website, SEO landing pages, newsletter.
  Slang, quizzes, culture explainers, the two-clip accent demo. Optimised for sharing and search;
  "Argentine Spanish" currently has no authority site, so this is cheap ground to take.
- **Paid and in-app** — the structured course, all sentence audio, the in-product culture lessons and
  word exercises, dialogues, the Listening Gym, unlimited "Why?".

Same content family, two jobs. The public layer proves competence and captures email; the product
converts it. This is also what resolves the standing objection to a hard paywall: distribution stops
depending on free *users* and starts depending on free *content*.

### 3.4 Positioning

**Free tier name:** Che. **Paid tier name:** **Nativo** (alt: *Porteño*, *Che+*) — §14.

> You already know Spanish. You still can't follow a porteño on the phone.
> Che teaches the version people actually speak — voseo, the *sh*, and the speed — with native
> audio on every single line.

Counter-positioning, stated out loud on the site and the paywall:

> No hearts. No lives to buy back. No ads. You are never blocked from a lesson you've paid for.

---

## 4. Onboarding flow

The funnel is now the product's most important surface — with no free tier, essentially all
conversion happens here. Evidence: multi-page onboarding paywalls convert **+37%** over single-page
(Superwall, 40M opens); onboarding paywall with trial **1.35% vs 0.89%** in-app (Adapty 2026);
quiz → personalised plan → paywall is the pattern behind Noom (reported >10% of quiz completers
convert) and Cal AI.

```
1. Landing / hero        "A little Argentine Spanish every day"
2. Why are you here?     partner or family · moving to BA · travel · I study Spanish but not this one
3. What happens now?     the pain, named back to them — pick the one that stings
                         "they switch to English" · "I follow the teacher, not the waiter"
                         · "I studied for years and still freeze here"
4. Where are you at?     total beginner | I speak Spanish, just not Argentine
                         → the second branch runs the EXISTING placement test (apply_placement())
5. ★ THE HOOK ★          Same sentence, two clips, back to back: neutral "¿Tú quieres ir a la playa?"
                         vs porteño "¿Vos querés ir a la pla[sh]a?"
                         "This is the one you'll actually hear. This is the one we teach."
                         Pre-signup. The demo no competitor can run.
6. Plan reveal           Personalised, using their answers + placement result.
                         "Ordering in Palermo without switching to English: ~6 weeks."
7. Email capture         Before the offer, not after. This is the only asset recovered from non-buyers.
8. ★ OFFER — skippable   Card-required trial. Dismissible, no dark pattern.
                         ~50% of all purchases are decided today; ask properly.
9. Three lessons         The best three, not the first three (§5.1). Full audio.
10. ★ HARD WALL          Same offer, now with everything they just felt behind it.
```

Steps 5 and 9 carry the entire business. Step 5 is nearly free to build — two existing MP3s and a
play button. Step 7 is non-negotiable: without a free tier, an email address is the *only* thing a
non-buyer leaves behind, and lapsed free-trial users are the segment most responsive to later
marketing (Datta, Foubert & Van Heerde, *JMR* 2015).

**Design note on step 3.** The Noom/Cal AI pattern works by naming a pain the user already feels,
then showing a plan that resolves it. The pain here is not "I don't know vocabulary" — it is social:
*being switched to English*, *not following the group*, *years of study that didn't transfer*. Lead
with that, not with features.

## 5. What's free, what's paid

### 5.1 The three demo lessons

**Three lessons, chosen for impact, not curriculum order.** They are a sales asset that happens to
teach, and their only job is to make the accent difference undeniable and the culture layer
irresistible. Full native audio throughout — there is no degraded-audio tier (see §5.3).

Working principle: each of the three should land one distinct thing — **the sound** (*sh* yeísmo),
**the grammar that marks you as local** (voseo), and **the thing you cannot get anywhere else**
(a culture / lunfardo moment worth repeating to another person). Exact composition is open; see §14.

After a placement test the three are drawn from the learner's level, not from Unit 1 — the demo is
level-relative, so it stays a demo rather than becoming remedial for an advanced learner.

### 5.2 Free, but outside the app

Per §3.3: slang, Argentine word quizzes, word-of-the-day, culture explainers and the accent demo are
published free on social and the website. They are marketing and SEO, not a product tier. No login,
no account, no entitlement logic.

### 5.3 Paid — the product

1. **The course.** All sections, all lessons.
2. **All audio, including the real-speed take** — every sentence in two takes, the clean teaching one
   and the way it is actually said (elisions, swallowed *s*, porteño intonation), with 0.75×/1× and
   A/B replay. **No degraded free audio tier** — a generic-TTS free tier would teach the exact
   phonology the product exists to correct, and saves nothing, since the rioplatense clip must exist
   for paid users anyway and is served from a year-cached CDN.
3. **Dialogues, scenes and phone calls.** Multi-voice with the existing Malena/Tomás voices,
   including a narrow-band phone call — the literal complaint from the research. `story_lines` holds
   one story today; this is the least-built, highest-differentiation asset.
4. **The culture track in-product** — structured lunfardo and Argentine-usage lessons and word
   exercises, as a real strand of the course rather than trivia.
5. **Listening Gym + unlimited "Why?"** — SRS-driven listening practice; the explainer at 30/day.
6. **A monthly content drop.** The renewal reason. Annual renews at 83.4% but cancellation is
   near-terminal (5% reactivate); a subscription with no ongoing deliverable is a one-year product
   sold twelve times.

**Bonus, near-free to build:** unscored **shadowing** — record yourself, hear it back beside the
native clip. Recording already exists in `src/lib/audio.ts`. Pimsleur and Glossika are built on this.
Market it as practice, never as feedback.

### 5.4 Voice calls — turn-based conversation with a porteño

**Decision: build it, but in Phase 4, after launch.** Not a launch feature, and never its own tier.

#### Why not sooner

Cost is not the blocker (§5.4.3) and neither is feasibility — going native killed the one serious
technical risk. The reason is sequence and evidence:

- **The core product isn't finished.** ~48 published lessons and audio on ~8% of sentences (§1). A
  voice feature before the course exists is a roof without walls.
- **It doesn't sell subscriptions.** Duolingo Max's headline feature was exactly this: **9–10% attach
  in two years**, described as *"underperforming our lofty expectations,"* and von Ahn said on the
  record (Q2 FY2026) they *"may actually sunset Max."* It is a **retention and ARPU** feature, not a
  conversion driver — which is also why it must live inside the single tier, not above it.
- **The promise is listening, not speaking.** Dialogues and phone-call scenes (§5.3 pillar 3) deliver
  a similar "I can handle a real conversation" feeling at **zero** marginal cost, as build-time audio
  reused forever. They come first.
- **Done badly it disproves the pitch.** If the voice drifts into tuteo or misses the *sh*, the product
  has argued against itself. Getting it right needs a voice clone plus native sign-off — the same
  bottleneck already throttling the audio backlog.

**Do now, because it's needed anyway:** native recording via `expo-audio`, and a per-user usage counter
on the `explain_usage` pattern. Both are small; both are prerequisites for shadowing too.

#### 5.4.1 Shape

**Turn-based voice messages with push-to-talk** — the user records, sends, and the AI replies with
audio. Not full-duplex streaming.

This is a margin decision disguised as a UX decision: realtime bills continuously and pays for silence,
while alternating messages bill only for speech. It is also **pedagogically better** — Duolingo moved
away from fast auto-endpointing because it cut learners off mid-pause, and Speak reports the same
(standard 300–500ms voice-activity thresholds truncate learners who hesitate). Push-to-talk removes
endpointing latency entirely.

#### 5.4.2 Stack

| Layer | Choice | Price |
|---|---|---|
| Client | Expo native, `expo-audio`, push-to-talk | — |
| Upload | Client → **private** Supabase Storage bucket; pass the path, not the bytes | — |
| Orchestration | One Supabase Edge Function, same shape as `explain-answer` | — |
| STT | Deepgram Nova-3 multilingual, batch | $0.0052/min |
| LLM | Claude Haiku 4.5 | $1 / $5 per MTok |
| TTS | **ElevenLabs Flash v2.5**, on the **API/developer plan** | **$0.05/1k chars** |

```
turn(conversationId, audioPath):
  1. fetch clip from Storage        5. VALIDATE reply against course-rules
  2. STT → user text                   (voseo + learner's known lexicon); retry on fail
  3. build prompt                   6. TTS cache lookup → hit: reuse | miss: generate + store
  4. LLM → reply text               7. persist transcript; increment usage counter
```

Edge Functions are viable: the CPU limit excludes async I/O and wall clock is 400s on paid, against a
~4s turn. **Latency ≈ 2–3.8s per turn**, which is fine for learners if the UI signals it. Pre-generate
the opening line while the call "connects" — that hides the entire first-turn wait.

**Take the API/developer plan, not the consumer credit plan** — same ElevenLabs model, $0.05/1k vs
~$0.091/1k. Free 1.8×.

**The voice is the whole ballgame.** Per ElevenLabs' own docs: *"The language is determined by the
text, while the accent and pronunciation are determined by the voice itself."* Voseo is already
controlled through text by the course pipeline. **The *sh* lives entirely in the voice, and no API
parameter will rescue it** — so this needs a **PVC clone of a real Argentine speaker** (~30 min audio)
with native sign-off. For lunfardo and place names use **alias respelling**, which works on every
model; IPA/phoneme rules are v3-only for Spanish and v3 is not Flash-speed.

#### 5.4.3 Cost and caps

**Decided cap: one call per day**, plus **10–12 turns per call** and a **~200-character ceiling per
reply**, all enforced server-side.

| | Per 5-min call | At 1/day |
|---|---|---|
| Uncached | 7.6¢ | **$2.28/mo ≈ 33% of ~$7 net** |
| Cached (30–50% hit) | ~4–5¢ | ~$1.40/mo ≈ 20% |

**Capping length matters as much as frequency.** LLM cost is superlinear in conversation length because
context grows quadratically — a 10-minute call is 15.9¢, not 15.2¢. Cap on **turns**, since turns are
what you actually bill on.

The 33% figure is a worst case that assumes every subscriber calls daily; blended usage will land far
lower. But watch two things:

- **Trial exposure.** A 7-day trial with daily calls costs ~53¢, and at ~30% trial→paid you eat it on
  70% of them. At 1,000 trials/month that's ~$530, mostly on non-converters. Limit calls during trial
  or budget it deliberately as a marketing cost.
- **TTS is 82% of the spend**, so caching is the only lever that matters (below).

#### 5.4.4 Caching

Audio costs money to generate once and nothing to replay. Cache on a hash of (reply text + voice +
model) into Storage, and pre-generate the obvious ones before launch:

greetings (*"¡Hola! ¿Cómo andás?"*) · encouragement (*"¡Muy bien!"*, *"Dale, seguí"*) · the **~200 most
common corrections** (*"Casi. Acá se dice tenés, no tienes."*) · clarification (*"No te entendí, ¿podés
repetir?"*) · closings · and every **scripted scene line** — in an "order a coffee" scene the waiter's
turns barely vary between users.

Not cacheable: the AI's personal reply to what the learner just said.

**The lever that makes caching work is editorial, not technical.** Give the model a fixed list of
approved phrases for the repetitive moments and instruct it to choose from them rather than inventing
fresh wording. If it rephrases every time, nothing ever matches and the cache is worthless. Write the
common lines once, record them once, reuse them forever. Cached lines also play **instantly**, so the
conversation feels faster exactly where it repeats most.

#### 5.4.5 Rejected

- **ElevenLabs Agents** — $0.080/min on wall-clock, so you pay for the user thinking. **41¢ vs 7.6¢**
  per call, and it hands voice selection to their agent config.
- **Fish Audio** — ~$0.046/min on Pro vs ~$0.048/min for Flash: **not cheaper**. Worse in practice —
  $75/mo from subscriber #1 and a 10× cliff to $749/mo at roughly 62 subscribers. Worth an ear test on
  voice quality, not a cost decision. (And nothing off their public voice library: those are largely
  unlicensed celebrity clones, which is commercial and store-listing risk, not a shortcut.)
- **Streaming TTS in v1** — buys ~1–2s of perceived latency for a week of work. Buffered MP3 is a day.
- **Self-hosted open-weight TTS** — Duolingo reached **under 1¢/call** this way, but no open-weight
  model ships a Rioplatense voice (Kokoro, XTTS-v2, Piper, F5-TTS, Chatterbox all give neutral or
  Peninsular), and a warm GPU at ~$591/mo only beats Flash above ~9,750 calls/month. **Not available to
  a solo operator; 2–5¢ is the realistic floor and it's fine.**

#### 5.4.6 Risks

| Risk | Note |
|---|---|
| **Voice authenticity** | If the cloned voice doesn't produce the *sh* naturally, no code fixes it. Native sign-off gates the feature. |
| **LLM drifts into tuteo or unknown vocabulary** | Validate every reply against `course-rules` and the learner's lexicon before it reaches TTS. You have the lexicon; nobody else does. |
| Record + play on one screen (iOS) | The `playback` ↔ `play-and-record` audio-session flip is fragile; a failed flip silently means either a mute AI or a refused mic. |
| Unbounded storage | User audio is speech, not course content — private bucket, TTL, delete raw audio after N days, keep transcripts. |
| Turn lost to backgrounding / vendor timeout | The failure modes that rot this kind of feature. Retry on resume; never leave the UI spinning. |

### 5.5 Explicit non-goals

- ❌ **Hearts / energy / mistake taxes.** Not on principle — a rate limit is a legitimate lever, and
  Duolingo's own numbers say Energy raised bookings *and* DAU. It's dropped because there is no free
  tier left to meter, and because taxing wrong answers is in direct conflict with the "Why?"
  explainer, the one feature built to make errors valuable.
- ❌ **A degraded free audio tier** (§5.3).
- ❌ **Ad removal** — there are no ads. ❌ **Offline** as a selling point — table stakes.
- ❌ **Gems, cosmetics, leaderboards.** ❌ **A second AI tier** — Duolingo Max reached 9–10% attach
  and is being sunset on the record.
- ❌ **Per-user AI-generated content.** Breaks the build-time model, adds per-user TTS cost, and ships
  Spanish no native reviewer saw. Quality control is the moat.

## 6. Pricing

| Plan | Launch | Notes |
|---|---|---|
| **Annual** | **$99/yr** (~$8.25/mo) — default-selected | Revised **up** from $79 |
| **Monthly** | **$14.99/mo** | Visible, not pushed |
| **Founding lifetime** | **$249, hard-capped at 100** | Phase 1 only; funds the audio backlog |

**Net of store commission.** On native, $99/yr nets **~$84** under Apple's Small Business Program
(15%, available under $1M proceeds) or Google Play Billing (10% service + 5% billing). At Apple's
standard 30% it would be $69 — a problem worth having, since it means >$1M/yr. Budget on **~$84 net**,
not $99, everywhere downstream.

**Why up.** The $79 figure assumed a generous free tier competing against the product. With no free
tier, Che is no longer priced against free, and the evidence points premium: high-price tiers return
**$62 Year-1 RLTV vs $10 for low**; the mainstream cluster is $60–120/yr but every one of those buys
*all* their languages; the dialect specialists charge far more (Practice Portuguese ~$180/yr, Kalim
~$420/yr). **$99 sits at parity with Duolingo Super individual ($95.99) and at roughly half the
dialect-specialist rate — defensible from both directions.**

Raise further as the course grows and **grandfather everyone**; price is the strongest lever measured
(AllTrails' $29.99→$35.99 produced **+8.3% ARPU**), and announcing "this rises as we ship, you keep
yours" converts hesitation into urgency honestly.

**Argentina: credibility play, never a revenue market.** The AR App Store bills in **USD, not ARS**
(discounted USD tiers, not PPP). Impuesto PAIS expired 2024-12-23, but USD digital services still
carry **21% IVA + a 30% percepción** (recoverable the next January) + ~2% IIBB in some provinces —
net ≈ **1.5× sticker**, which erases the nominal discount. You cannot price your way to affordability
on that storefront. If Argentina ever needs a paid path, use **web checkout in ARS**, not the store.
Otherwise give free or near-free access as a content and word-of-mouth play.

### 6.1 Superseded

An earlier §6.1 argued *against* a hard paywall — that it is a paid-acquisition instrument, that
Education's Day-31+ back-loading punishes early walls, and that a pre-launch product has no brand to
trade on. **That argument was overturned on 2026-09-21; the reasoning and the accepted risks now live
in §3.2.** The three concerns survive as mitigations, not as objections: distribution moves to free
public content (§3.3), the email list absorbs the late converters (T2, §7), and the onboarding flow
carries the trust burden (§4).

**Trial: card-required, and it is the real conversion instrument.** Poyar/ChartMogul (200 self-serve
products, Feb 2026): freemium converts 3–5% typical / 8–12% best-case, **reverse trials are
statistically indistinguishable from freemium**, and only **card-on-file trials** step-change it to
**25–35% / 50–60%**. So: offer a **7-day card-required trial** at every paywall from T0 onward.

Seven days, not thirty — the Management Science RCT (N=337,724) found the 7-day arm beat the 30-day on
subscription (+5.59%), retention (+6.4%) **and** revenue (+7.9%), because long trials end in dormancy.
Note this **overrides** the naive read of the RevenueCat trial-length curve (17–32 days → 42.5%): that
curve's denominator is *trial starters who already attached a card on day 0*, converting largely by
auto-charge. Selection, not causation. Reconciling them: **long enough to learn the product, short
enough that the ask lands while they're still using it.** **Test 14 vs 30 days early**: trials of 17–32 days convert at 42.5% vs
25.5% for ≤4 days, and Duolingo moved 7 days → 1 month in 2026 and got *more* trials **and** better
conversion. Trial structure wins 59.6% of A/B tests — it is the first thing to test, ahead of price
and far ahead of paywall design (34.6%).

**Founding lifetime is a real liability now** — with pillar 5, a lifetime buyer receives new content
forever. It survives in the plan only because the cash buys the ElevenLabs backlog that makes the
product sellable at all. **Hard cap 100, one price, everything included, honored forever.** See the
Jumpspeak cautionary note in §12 for what the sloppy version of this does to a brand.

**Argentina: credibility play, never a revenue market.** Three corrected facts:

- The Argentine App Store **bills in USD, not ARS** — Apple gives discounted *USD* tiers, not ARS PPP.
  Duolingo Super runs $31.99–47.99 there (~50–60% off US).
- Impuesto PAIS **expired 2024-12-23**, but USD digital services still carry **21% IVA + a 30%
  percepción on Ganancias** (recoverable the next January) + ~2% IIBB in some provinces. Net ≈ **1.5×
  sticker** — Duolingo's $38.99 AR annual lands near **$58 all-in**, erasing most of the discount.
- **You cannot price your way to affordability on the AR storefront; the tax wedge eats it.** The real
  LatAm floor is non-store rails — Busuu sells in Brazil via **Vivo carrier billing at ~US$2.40/mo**.

Give Argentina free or near-free access for content, credibility and word of mouth. If it ever needs
to be paid, use **web checkout in ARS**, not the storefront.

---

## 7. What triggers payment

With no free tier the trigger list collapses to three, which is the point — one decision, asked
twice, then followed up by email.

| # | Trigger | Moment | Notes |
|---|---|---|---|
| **T0** | **Onboarding offer (step 8)** | After the plan reveal and email capture, before the lessons | Skippable. ~50% of purchases are decided Day 0; the highest-converting placement measured |
| **T1** | **End of lesson 3 — the wall** | Peak felt value, still in-session, zero dormancy | The primary conversion event. Everything upstream exists to make this land |
| **T2** | **Email win-back, Day 1 / 3 / 7 / 30** | For everyone who skipped or bounced | Education is the most back-loaded category — **23.5% of trial starts happen Day 31+**. Without this they are simply lost |

**T2 is not an afterthought.** With a hard paywall, the email list *is* the free tier. A multi-touch
win-back sequence reopens 10–15% of lapsed contacts (ecommerce benchmarks; no app-specific figure
exists), and free-trial-acquired users over-perform on exactly this channel.

**Never** re-show T1 mid-lesson, and never make the skip on T0 hard to find. A hard wall is honest;
a hidden skip button is not, and the refund and rating cost of looking predatory is the one thing
that genuinely can't be recovered pre-launch.

## 8. The paywall screen

Native now, so this is an **in-app purchase sheet**, not a web checkout. One screen, shown at T0 and
T1 (§7). Contents, in order:

1. One line restating the promise — *"Understand actual porteños, at actual speed."*
2. **Annual selected by default** with the monthly equivalent shown ("$99/year — $8.25/mo"); monthly
   beside it. Annual renews at 83.4% and retains 30.7% at 12 months vs 9.5% monthly.
3. **Five bullets only** — the pillars in §5.3. If it needs a comparison table, the offer is too diffuse.
4. **A play button.** The two-clip accent A/B plus one dialogue at real speed. Nobody else in this
   category can put the product itself on the paywall — use it.
5. Plain terms: *"Free for 7 days, then $99/year. Cancel anytime."* Apple and Google both require
   price, period and renewal terms to be legible on the screen that initiates purchase.
6. **Restore Purchases** — mandatory for App Store review, and a rejection cause when missing.
7. Privacy Policy and Terms links — also a review requirement.

**Native makes the trial nearly frictionless, and this is the single biggest gain from the decision.**
A card-required trial on the web means typing card details for a product you met fifteen minutes ago.
On iOS it is one Face ID tap against a card Apple already has. The card-trial conversion figures
(25–35% vs 3–5% freemium) come from mobile precisely because of this. **The hard paywall model (§3.2)
is materially easier to pull off on native than it would have been on web.**

Test order, by measured A/B win-rate: **trial structure (59.6%) → plan duration (58.7%) → price
(45.5%) → copy and visuals (34.6%, last).**

## 9. Architecture

### 9.1 Entitlements

Mirror the existing `role` pattern exactly — it is already the right shape.

```sql
-- profiles gains:
tier text not null default 'free' check (tier in ('free','nativo'))
tier_expires_at timestamptz

-- new, service-role write only:
subscriptions (user_id, provider, provider_sub_id, status, plan,
               current_period_end, cancel_at, created_at, updated_at)
billing_events (id, provider_event_id unique, type, payload jsonb, processed_at)
```

- `guard_profile_tier()` trigger — clients can never write `tier`, exactly as `guard_profile_role()`
  does today.
- `public.has_nativo()` — SQL function mirroring `is_staff()`, used in RLS predicates.
- `public.within_free_budget()` — the budget check, and pleasantly trivial because the data already
  exists: `select count(*) < 40 from lesson_progress where user_id = auth.uid()`. Counting
  **completed** lessons (not unlocked ones) makes the budget a measure of value actually received,
  makes it level-independent, and makes it unexploitable by re-placing or jumping around.
- Access predicate: `has_nativo() or within_free_budget()`. Review of already-completed lessons is
  always allowed, for everyone, regardless of budget.
- Stripe webhook → new Edge Function `billing-webhook` → idempotent upsert into `billing_events`
  (unique on `provider_event_id`) then `subscriptions` then `profiles.tier`.
- Client reads `tier` from the existing `AuthProvider` profile load. No new fetch.

### 9.2 Gating audio — the one real architectural question

`src/lib/audio.ts:86` serves from a **public** Supabase bucket with a one-year cache. A URL, once
known, works for anyone.

Recommendation: **don't fix that yet.** Gate by *not handing free users the `audio_path`* — filter
it in the sentence-fetch RPC behind `has_nativo()`, and keep teaching-slot audio exposed to
everyone. Signed URLs and a private bucket are a Phase 4 item, worth doing when revenue justifies
it. At this scale the threat is not piracy, it's shipping nothing.

Server-side enforcement (do not trust the client) on: `audio_path` exposure, explainer daily limit
(already server-side in `explain-answer`, just needs a tier-aware `DAILY_LIMIT`), and story access.

### 9.3 Payment rails

| Rail | Net on $99/yr | Status |
|---|---|---|
| **Apple IAP, Small Business Program 15%** | **~$84** | **Primary.** Under $1M proceeds in the prior calendar year — apply, it is not automatic |
| **Google Play Billing** (10% service + 5% billing) | **~$84** | **Primary.** Play's June 2026 terms: 10% on *all* auto-renewing subscriptions, +5% only if you use Play Billing |
| Google Play, routing to external checkout | ~$89 | 10% service fee only, under the expanded billing-choice terms |
| Web checkout (Stripe), sold outside the app | ~$93 | See the decision below |
| Apple standard 30% | ~$69 | Only past $1M/yr proceeds |

**Use RevenueCat.** Free to **$2,500 monthly tracked revenue**, then 1%. Hand-rolling App Store Server
Notifications V2 and Play RTDN is a weekend of SDK work followed by a permanent tail of edge cases —
grace periods, billing retry, refunds, family sharing, mid-period upgrades, restore on a new device.
It also provides the entitlement webhook §9.1 needs, so `subscriptions`/`billing_events` get populated
from RevenueCat rather than Stripe.

**Open decision — sell on the web as well?** You may legally sell a subscription on your own site and
have users sign in on native; you simply cannot *link out* to it from inside the app (except on the US
iOS storefront today). That is ~$93 net vs ~$84 — an 11% difference. **The counter-evidence is strong:**
the one published A/B (RevenueCat/Dipsea, n=1 app) found web checkout converts **~18% vs ~28% for IAP**,
which more than erases the saving. Recommendation: **IAP only at launch.** Revisit once the free content
site (§3.3) is bringing real traffic — those visitors land on the web *first*, which is the one traffic
shape where web checkout doesn't cost conversion.

**On US iOS link-outs:** Guideline 3.1.1(a) currently permits them at **0% commission**, but the Ninth
Circuit reversed the blanket remedy in Dec 2025, SCOTUS granted cert in June 2026, and Apple has
proposed 15%/10% (not approved). **Build any link-out behind a flag with a configurable fee
assumption** — 0% is temporary.

## 10. Sequencing

Agreed constraint: **launch once there's a very long basic course.** The content wall makes that
constraint work *for* the plan rather than against it — the free side is fixed, the paid side grows
with every pipeline run, and the gate is now about having something to sell rather than about
surviving a refund wave.

> **Ship paid when: Section 1 is complete and polished with 100% audio (the free product), AND at
> least one further section is published with audio, AND native voice sign-off is done
> (`course-spec.md` Phase 5).**

| Phase | Work | Gate |
|---|---|---|
| **0 — Now** | Onboarding §4 incl. the two-clip hook. Email capture. Funnel instrumentation (§11). **`eas.json` + a TestFlight build early** — store setup is slow and serialises everything after it. No billing. | — |
| **1 — Presale** | Founding lifetime $249, capped 100, Stripe Payment Link, manual `tier` grant. Funds the ElevenLabs backlog. | Hook screen converting to signup |
| **2 — Content — THE MAIN JOB** | **Build out the full main course (§3.1 section 1).** Publish the 118 drafted lessons, extend beyond them, and get audio coverage from ~8% to complete on everything published. Record units 7–10 (~3,500 credits) and onward. First dialogues and one phone-call scene. Sections 2–4 (Palabras, Cultura, Expresiones) start only once the spine is real. | — |
| **3 — Billing** | Entitlements (§9.1), **RevenueCat + IAP products in App Store Connect and Play Console**, paywall screen (§8), T0/T1 triggers, real-speed audio takes. **Native recording via `expo-audio`.** Privacy labels, Terms, Privacy Policy, Restore Purchases. Budget for **at least one App Store rejection round**. | Content gate above |
| **4 — Tuning** | T2 win-back, Listening Gym, shadowing, monthly drop cadence, trial + price tests. **Voice calls (§5.4)** — after the course and audio are real, never before. | Paid live, ≥100 payers |

Phase 2 is now the long pole and it is **content production, not engineering** — which is the right
problem to have, and the one the existing pipeline was built for.

---

## 11. Instrumentation (build in Phase 0, before there's anything to measure)

Events: `onboarding_step`, `hook_played`, `hook_completed`, `first_lesson_completed`, `signup`,
`trial_started`, `trial_expired`, `paywall_shown{trigger}`, `paywall_dismissed{trigger}`,
`checkout_started`, `checkout_completed`, `subscription_cancelled{reason}`.

Metrics that decide things:

- **D35 download→paid** — target ≥2.2% (Education median). Below 1%, the offer is wrong.
- **Trial→paid** — target ≥25%.
- **Paywall view rate by trigger** — which of the seven actually earns its place; kill the others.
- **Content runway per active user** (lessons remaining) — the leading churn indicator for this
  product specifically, given §1.
- **Involuntary churn** — 20–40% of all subscription loss industry-wide, and the cheapest thing to
  fix. Turn on Stripe Smart Retries from day one.

---

## 12. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Content runway < subscription length** | **High** — a paid learner who exhausts the course in six weeks is a refund and a one-star review | The Phase 3 gate, plus pillar 5: the monthly drop is what keeps year one from running dry. Non-negotiable. |
| **Audio production cost and pace** | **High — now the central bet.** With scoring cancelled, audio *is* the product; if credits or native-review time throttle it, there is no differentiated paid tier left | Phase 1 presale funds it. Price one full dialogue end-to-end (§14.4) before promising pillar 3. |
| Monthly content drop is over-promised | Medium–High | A missed drop is a churn event. Commit to the cadence you can hold solo — quarterly honestly beats monthly aspirationally. |
| Solo operator bandwidth | High | One tier, five pillars, seven triggers. Every §5.3 non-goal is bandwidth defended. |
| Niche too small to reach $10K MRR | Medium | 96% of new subscription apps never do. At $79/yr, $10K MRR ≈ **1,520 payers**. Demand proxies support the audience existing; nothing proves it's reachable. |
| **Name collision — *Che: Argentinian Dictionary* exists on the App Store** (updated Jul 2026) | **High, and now urgent** | Going native removes the "web-first buys time" escape. App Store names must be unique and ASO collision is real. **Resolve before first submission.** |
| App Store review rejection on a hard-paywalled app | Medium | Hard paywalls are permitted and common (Speak, Rosetta, Pimsleur). Rejections are usually mechanical: missing Restore Purchases, unclear renewal terms, no Privacy Policy link, privacy labels not matching behaviour. Budget one round. |
| Store commission compresses every downstream number | Medium | Budget **~$84 net, not $99** (§6). |
| *Entiende* or a creator bundles the niche first | Medium | Own the SERP — "Argentine Spanish" has no authority site — and partner with the 1–2K-sub creators |
| Expat thesis weaker than assumed — inbound visitors to Argentina **−19.7% in 2025** | Medium | Lead with the partner/heritage/"I study Spanish but not this one" personas, not the nomad boom |
| Over-showing paywalls recreates the thing users are fleeing | Medium | One per session, never mid-round, never gating a lesson |
| Founding-lifetime pricing erodes trust if handled loosely | Low–Medium | Cautionary case: Jumpspeak sells "lifetime" at six different prices across channels, excludes unlimited AI from it, and carries a **BBB rating of F** (67 complaints/3yrs) and 28% one-star on Trustpilot. If we sell lifetime: **one price, one time, everything included, honored forever.** |

---

## 13. Summary

1. **No free tier.** Onboarding → skippable offer → three lessons → card-required wall. The buyer is
   a motivated adult who already tried the free apps; the free-practice seeker was never going to pay.
2. **Publish the culture, paywall the course.** Slang, quizzes and the accent demo are free and public
   — they are the distribution engine and the SEO moat. The course, the audio and the in-product
   culture track are paid.
3. **The wall is a card-required trial, not a charge** — 25–35% typical conversion vs 3–5% freemium,
   with far less refund and rating risk than billing a stranger outright.
4. **Onboarding is now the product's most important surface.** Name the social pain, run the two-clip
   accent hook pre-signup, reveal a personalised plan, **capture email before the offer**.
5. **Three demo lessons chosen for impact, not curriculum order** — the sound, the grammar, and the
   thing they can't get anywhere else.
6. **$99/yr, $14.99/mo**, up from $79 now that nothing free competes with it. Founding lifetime $249
   capped at 100 to fund audio.
7. **The email list is the free tier.** Education is the most back-loaded category measured; without
   win-back, every non-buyer is lost permanently.
8. **Stripe on the PWA at ~95% net.** Native and RevenueCat stay optional and later.
9. **The long pole is content production, not code.**

## 14. Open questions

1. ~~Beginner course or Spanish→Argentine conversion course?~~ **Settled 2026-09-23: full course, five
   sections, main course first. See §3.1.**
2. **What exactly are the three demo lessons?** The single highest-leverage open question. Composition,
   order, and how much culture content sits inside them versus the language lessons.
3. **Three lessons or three exercises?** These differ by roughly 5×in felt value. Needs settling.
4. **Trial length** — 7 days is the starting recommendation (Management Science RCT, N=337,724: the
   7-day arm beat 30-day on subscription, retention *and* revenue, because long trials end in
   dormancy). Test 7 vs 14.
5. **Tier name** — Nativo, Porteño, or Che+?
6. **How much culture content is free and public vs in-product?** The public layer must be good enough
   to travel on social without cannibalising the paid track.
7. **Founding lifetime at $249/100 seats** — real cash now for audio, versus a permanent obligation to
   ship monthly content to non-payers.
8. **Dialogue and phone-call production cost.** Price one end-to-end before promising it — this is the
   mistake that already cost the pronunciation feature.
9. **Monthly drop cadence** — monthly sustainable solo, or is quarterly the honest promise?
10. **The name collision** — *Che: Argentinian Dictionary* exists on the App Store. Resolve before any
   store listing.

---

## Appendix — competitor pricing (US, Apple storefront / official sites, verified 2026-09-20)

| App | Monthly | Annual | Lifetime | Free tier |
|---|---|---|---|---|
| Duolingo Super | $9.99–12.99 | **$95.99** (Family $119.99/6 seats) | — | Large; Energy-capped to ~2–3 lessons/day |
| Babbel | $17.99 (1 lang) | $89.99 1-lang · $107.99 all | $599 list, often ~$299 | First lesson of each course |
| Busuu | $9.99 · Plus $23.49 | $70 · Plus $139.99 | — | ~5 lessons + placement, ads |
| Memrise | $24.99 | $61.99 | $329.99 (offer $131.99) | Courses + native clips |
| Speak | $17.99 · Plus $39.99 | $83.99 · Plus $164.99 | — | **None** (7-day trial) |
| Pimsleur | $19.99–20.99 | $131.99–164.99 | ~$475 list, $299–399 promo | **None** |
| Rosetta Stone | $19.99 | $159 (all 25 languages) | $399 list, street $149–219 | **None** (3-day trial) |
| LingQ | $14.99 · Plus $29.99 | $119.99 | — | 20 saved words, 5 imports |
| Lingopie | $11.99–13.99 | $59.99–83.99 | $199–229 | **None** |
| Jumpspeak | — | $79 | $179.88 → $59 promo | **None** — ⚠️ see §12 |
| Preply (marketplace) | $16–17/hr Spanish | — | — | 33%→18% tutor commission |
| italki (marketplace) | $10–25/hr LatAm natives | — | — | italki Plus $5.99/mo |

Two paywall designs worth studying:

- **Busuu splits its wall in an instructive place**: *human community corrections* sit in the **cheap**
  tier ($70/yr), and **AI conversation + pronunciation feedback** are the upsell (Plus, $139.99/yr).
  That is the inverse of the intuitive split, and it prices the scarce human thing as the base good.
- **LingQ has the most legible free cap in the category** — 20 saved words, 5 imports. You hit it on
  day one and it explains itself in one sentence. Che's audio cap (§5.1, teaching audio only) should
  aim for exactly that quality: instantly understood, hit early, obviously not punitive.

Prices move constantly and most of these vendors discount aggressively off sticker; re-verify before
any pricing decision. Babbel, Busuu, Memrise, LingQ, Lingopie, Jumpspeak, Pimsleur and Rosetta
publish **no** subscriber or conversion figures — Duolingo's SEC filings are the only hard numbers in
the category.
