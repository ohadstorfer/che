# Unit economics: does the price cover AI + infra?

As of 2026-10-20. Read-only analysis, nothing in the app changed. Cost data comes from
`hablar_usage` (last 30 days, aggregated, no personal data) and the code.

**Short answer: yes, with room to spare for normal use.** A typical paying user costs
about **$1–2 a month** against **$7.01** net (yearly plan) or **$12.74** (monthly).
Only a user who maxes out every limit, every day, on the longest possible lines, *and*
also maxes the 30 explanations a day, costs more than the yearly plan brings in. Two
costs are bigger than they need to be: **`explain-answer` still runs on Sonnet 5**, and
**PostHog records 100% of sessions**.

## 1. Prices used

| Item | Rate | Source |
|---|---|---|
| Claude Haiku 5.5 (all Hablar calls) | $0.10 in / $0.50 out / $0.01 cache read / $0.125 cache write per MTok | claude-api pricing table |
| Claude Sonnet 5 (`explain-answer`) | $2 in / $10 out per MTok | same |
| ElevenLabs TTS `eleven_v4_turbo` (the model live in prod, per `hablar_usage`) | $0.04 / 1K chars (the launch discount ended 2026-10-12) | `research_notes/Spanish learning app TTS setup/elevenlabs.md` |
| ElevenLabs STT Scribe v2 + keyterms | $0.22 + $0.05 = $0.27 / audio hour | `research_notes/Spanish learner speech to text/providers.md` |
| Store fee | 15% (Apple Small Business Program; Google 15% on every subscription). 30% shown too | — |

**If ElevenLabs bills through a credit subscription rather than API list prices**, the
real rate per character may be different. Check the plan. At $0.10/1K chars, a chat costs
about $0.042 instead of $0.021.

## 2. Measured cost per chat

There is real data on the current setup (Haiku 5.5 since 2026-10-17, v4 Turbo voice), but
only from 9 chats by 4 testers, averaging 3.9 learner lines each:

| | Per chat (measured) | Per learner line |
|---|---|---|
| Total | **$0.0119** (p50 $0.0095, max $0.024) | |
| TTS (Pancho's voice) | $0.0093 (**78%**) | ~42 chars per Pancho line |
| STT (her recordings) | $0.0020 (17%) | 3.5 s per request, **2.1 STT requests per final line** |
| Claude (reply, feedback, summary) | $0.0018 (15%) | reply ~4.6K in (cached) / 37 out; feedback ~4.4K in / 125 out |

For comparison, the 73 chats before 2026-10-17 (Sonnet 5 / Haiku 4.5) averaged $0.035. Moving
Claude to Haiku 5.5 cut Claude's cost about 12×. Voice is now almost all of the cost.

**Scaled to a full 8-line chat:**
- Typical: TTS ~340 chars $0.0136 + STT ~59 s $0.0044 + Claude ~$0.003 = **≈ $0.021**. This
  matches the earlier ~$0.025 estimate.
- Worst case: 80-char Pancho lines, every recording 20 s and heard twice, a hint and a
  translation on every line: TTS $0.030 + STT $0.024 + Claude $0.006 = **≈ $0.06**.

## 3. Cost per active user per month

`explain-answer` is about $0.006 for each explanation it writes (≈1.5K in + ≈250 out
including thinking, on Sonnet 5). Explanations already in the cache cost nothing, but so far
almost none are reused (24 written, 25 served). The limit is 30 written per user per day.

| Profile | Hablar | Explanations | AI total |
|---|---|---|---|
| Light: 2 short chats a week, 10 explanations | 8 × $0.013 = $0.10 | $0.06 | **$0.16** |
| Median: ~1 full chat a day, 40 explanations | 30 × $0.021 = $0.63 | $0.24 | **$0.87** |
| Heavy: 3 full chats every day (the cap), 5 explanations a day | 90 × $0.021 = $1.89 | $0.90 | **$2.79** |
| Worst case: 90 worst-case chats + 30 explanations a day | 90 × $0.06 = $5.40 | $5.40 | **$10.80** |

Testers so far: 2.16 chats per user on the days they chat, and 1.7 explanations per day.

**Other costs per active user per month (estimates, not measured):**
- **PostHog: ≈ $0.6–1.6 once past the free tier.** Session replay is on for 100% of native
  sessions, and touches are autocaptured. At about 2 sessions a day that is roughly 60
  recordings and 10–20K events per user per month. The free tier covers roughly the first 50–80
  active users. This applies to **free users too**, and they bring in nothing. Check the
  actual volume on the PostHog billing page.
- Supabase: $25/mo Pro base. Marginal cost is about $0.01–0.05 per user: lesson audio
  averages 65 KB a file and is cached on the device; Hablar recordings are about 80 KB each;
  around 1.8K function calls a month for a heavy user against 2M included.
- Resend (free tier / $20), Expo EAS (free / $19), Apple $99 a year: fixed, about $35–55 a
  month in total.

## 4. Revenue vs cost

Net revenue per subscriber per month, before VAT. In the EU the price includes about 20% VAT,
so net is about 1/6 lower there.

| Plan | Net at 15% | Net at 30% |
|---|---|---|
| Yearly $99 (7-day trial) | **$7.01** | $5.78 |
| Monthly $14.99 | **$12.74** | $10.49 |
| Win-back yearly $59 (first year) | **$4.18** | $3.44 |

30% applies only on Apple, in the first year of a subscription, if you are not in the
Small Business Program or are above $1M in proceeds. Google takes 15% on all subscriptions.

Margin at 15%, with ~$1/user PostHog and ~$0.05 infra added:

| Profile (total cost) | Yearly | Monthly | Win-back |
|---|---|---|---|
| Median ($1.9) | +$5.1 (73%) | +$10.8 (85%) | +$2.3 (55%) |
| Heavy ($3.85) | +$3.2 (45%) | +$8.9 (70%) | +$0.3 (8%) |
| Worst case ($12.5) | **−$5.5** | −$0.2 | **−$8.3** |

**Break-even:**
- Hablar alone can't sink the yearly plan. Even 90 worst-case chats ($5.40) cost less than
  $7.01.
- It *can* sink a win-back subscriber: $5.40 is more than $4.18.
- What goes underwater is Hablar at its worst plus Sonnet explanations at their limit.
- Fixed costs (~$50 a month) are covered at about **10 paying subscribers**.
- **Trial cost:** the 7-day trial gives full premium. A heavy trialist costs about
  $0.45 in chats + $0.20 in explanations + PostHog. At 30–40% conversion that comes to about
  $2–3 per converted yearly subscriber, around 3% of first-year net.

## 5. Biggest cost drivers

1. **ElevenLabs TTS**: about 65–78% of every chat.
2. **`explain-answer` on Sonnet 5**: small on average, but at the worst case it costs as much as
   Hablar. It is also **not logged** anywhere with tokens, so it can't be monitored.
3. **PostHog session replay at 100%** (likely #1 for a median user once past the free tier,
   and paid for free users too).
4. STT, smaller: about 2.1 Scribe requests per final line, from re-checks of doubtful
   transcripts, retries and Decilo.

## 6. Levers, best value first

1. **Move `explain-answer` to `claude-haiku-5-5`** and/or lower `DAILY_LIMIT` from 30 to about
   10. Haiku costs ≈ $0.0003 per explanation, about 20× cheaper. This removes the worst case
   almost entirely. Also log its usage, for example in an `explain_usage`-style table with
   tokens.
2. **Sample PostHog replay**, for example 10–25% of sessions, or only a user's first days.
   Turn off touch autocapture, and set a billing limit in PostHog.
3. **TTS**:
   - Keep Pancho's lines short (they are ~42 chars now; a cap holds the worst case down).
   - Cache repeated fixed lines, such as end-of-chat and summary phrases.
   - Check whether ElevenLabs volume or business rates beat $0.04/1K.
   - The fallback is a cheaper TTS. Gemini 3.8 Flash-Lite TTS is about $0.01/1K chars until
     2026-12-31 and doubles after that, but it has quality risk.
4. **Fewer chats during the free week**: 1 a day instead of 3 cuts trial cost about 3×.
   Win-back subscribers could also get 2 a day.
5. **STT**:
   - Only run the second Scribe pass when the first is actually doubtful.
   - Cheaper STT is an option (AssemblyAI $0.15/hr, Groq Whisper $0.04/hr), but it saves
     little (~$0.003 a chat).
6. **Storage hygiene**: delete Hablar recordings after 60–90 days. This doesn't matter now
   (66 MB in the bucket), but it grows about 100 MB per heavy user per month.

## 7. Daily cost alert

The absolute ceiling for one non-staff user is about **$0.36 a day**: 3 worst-case chats
$0.18 + 30 Sonnet explanations $0.18. Expected cost is about $0.03–0.05 per active payer per
day.

- **Per user:** alert when one non-staff account goes over **$0.25/day**. Above that, it is
  abuse or a bug, such as a retry loop. Staff (`unlimited`) accounts have no cap, so alert
  on them at $1/day.
- **Global:** alert at **3× expected**, with a floor. For now (≈10 active users), use
  **$5/day**. At 100 users with Hablar, expected is about $5 a day, so alert at $15. At
  1,000, alert at about $150.
- Also set hard monthly spend caps on the Anthropic and ElevenLabs consoles, as a backstop
  to the query alert.

A daily query is enough: sum `hablar_usage` × the rates above, grouped by
`conversations.user_id`. Add explain tokens to it once they are logged.

## Assumptions and caveats

- The Haiku 5.5 data is small (9 chats, 4 testers, 2026-10-17 to 19). Chats ran about half
  of the 8 lines, so full-chat numbers are scaled up per line.
- The ElevenLabs and STT rates are the published API list prices taken from the repo's
  research notes. The actual plan was not checked.
- The explanation cost is estimated from the prompt size, because its tokens are not logged.
- PostHog, Supabase overage, EAS and Resend are list-price estimates, not billing data.
- One-time costs are left out: Opus 5.5 unit scenes (written once per unit, for everyone) and
  the pre-recorded lesson and opener audio.
- Net revenue ignores refunds, VAT and FX.
