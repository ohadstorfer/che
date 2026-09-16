# Duolingo vs Che: a diff against the code

Compared on 2026-09-16, branch `duolingo-ui`. The Duolingo side is summarised from [`duolingo-how-it-works.md`](duolingo-how-it-works.md), where every claim has a source; see that file for citations.

Each row of the tables below gets one verdict:

| Verdict | Meaning |
|---|---|
| **=** | Same idea; Che already does it |
| **≈** | Same goal, different mechanism; fine as it is |
| **Δ** | Deliberately different, with a reason |
| **gap** | Duolingo has it and Che doesn't; worth considering |
| **n/a** | Not relevant at Che's size |

---

## Summary

On **data model and content discipline**, Che is closer to Duolingo than it looks:
- **Word forms:** forms carry grammatical features, which is what Duolingo's lexeme tags are.
- **Sentences:** sentences are tokenised to forms, and each has one target form.
- **Vocabulary rule:** a sentence may only use words taught by then, which is Duolingo's "one new item per sentence".
- **Exercises:** exercises are derived mechanically from sentences.
- **Authoring:** the planned AI → linters → judge → human pipeline matches Duolingo's 2023–25 process.

The real differences are in the **learner model**:
- **No difficulty estimate.** Duolingo estimates learner ability and exercise difficulty (Birdbrain) and serves exercises it predicts will be answered right about 85–90% of the time. Che uses fixed rules instead: a sentence climbs a ladder after passes, and typing unlocks once an interval reaches 7 days.
- **Unproven scheduler.** Che schedules with SM-2 and has no way to check SM-2's predictions against what learners actually remember. Its logs can't feed HLR or FSRS as they stand.
- **Thin lessons.** Che lessons introduce about 2–3 new forms. Duolingo's introduce 5–7, and the same material comes back in easier and harder lessons.
- **Grading.** Tile builds need an exact match and typing is word-only. Nothing grows the accepted answers from what learners actually submit.

---

## 1. Content data model

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| Unit of memory | Inflected lexeme tag `soy/ser<vbser><pri><p1><sg>` | `forms` row with `features` jsonb (person, number, tense, mood, verb_form, voseo, clitic, gender), under `lemmas` (`supabase/migrations/20260913000001_course_schema.sql:133`) | **=** Same granularity. Che's is authored rather than tagged by an FST+HMM: at our size that is more reliable. |
| Forms of one lemma linked | `related_lexemes` | `forms.lemma_id` | **=** |
| Sentence indexed by forms | Lexeme tagger indexes every sentence | `sentences.tokens[].form_ids`, mirrored into `sentence_forms` by trigger (`…course_schema.sql:174`) | **=** |
| One new item per sentence | "introduce only one new word or inflection" | `target_form_id`; `checkSentence` / `vocab.available` rejects forms from later units (`scripts/course/lib/content.mjs`); `carriedBy` re-checks at runtime (`src/lib/sentences.ts:101`) | **=** Che enforces it at build time *and* at runtime. |
| Function words | Tagged like any lexeme, scheduled | `is_glue`: in view, never drilled or scheduled; unlocked for tiles after 5 passes (`sentences.ts:133`) | **Δ** Reasonable. Duolingo does schedule articles and prepositions. |
| Parses | UD parse per reference answer (SLAM) | None | **n/a** A parse would only matter for grammar-error explanations. |
| Knowledge components beyond words | `taggedKcIds`; separate grammar-concept model since 2024 | `units.grammar_focus text[]` exists but no learner state is kept for it | **gap** (low): no per-learner "weak on voseo imperatives" signal. Could be derived from `review_logs` × form features. |
| Hierarchy | course → section (CEFR) → unit (can-do + guidebook) → level → lesson → exercise | section (`cefr`) → unit (`title` = can-do, `grammar_focus`) → lesson → slot | **≈** Che has no "level" layer: a lesson is the node. |
| Tips / guidebook | Guidebook per unit: 5 key phrases + 1–3 tips | `tips` per unit, played as a `tip` slot | **≈** No key-phrases list and no guidebook to open from the path. |

## 2. Course size and pacing

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| A1 size | ~800 words for A1; ES sections 1–3 = 62 units | 3 A1 sections, 30 units, 364 lemmas / 589 forms, 150 lessons (`docs/course-spec.md` Phase 0) | **Δ** About half the lemmas, but Che's A1 grammar reaches further (imperative, estar + gerund). Fine for v1. Revisit vocabulary breadth in section 4. |
| New words per lesson | **5–7** | Default 5 lessons per unit (`scripts/course/lib/outline.mjs:35`). The authored units (`scripts/course/fixtures/demo.yaml`) have 23 `teach` slots over 10 lessons, about **2–3 per lesson** | **gap** Che lessons are thin. Either more `teach` slots per lesson or fewer lessons per unit. |
| Lesson length | Up to ~17 exercises | 6–7 authored slots; each expands to 1–2 screens (a teach slot is intro + 1 question), plus re-asks | **gap** (same cause). |
| Lesson difficulty levels | Same material in low / medium / high lessons (recognition → recall → production), interleaved | Ramp is per *sentence* (meaning → gap → build, `rungFor`, `sentences.ts:170`) plus the author's pinned modes. `lessons.kind` has `lesson`/`review`/`checkpoint`; the last lesson of a unit is `review`, and the last unit of a section is all `checkpoint` (`outline.mjs:113`) | **≈** The ladder does the ramp adaptively, which is arguably better. But `review`/`checkpoint` kinds change nothing at runtime: `resolveSlots` ignores `kind`. |
| Stories / radio / adventures | Mandatory path nodes; stories 90/10 known/new | Allowed in `lessons.kind` (`20260916000001_sections_and_lesson_kinds.sql`); not built | **gap** Planned. Stories are the cheapest high-value one: a dialogue of known forms, checked by the same linters. |
| End-of-unit mastery gate | 2026: must pass it to proceed | Path gated only by *completion* (`currentIndex`, `src/lib/course.ts`); `lesson_progress.score` is stored but never read | **gap** Cheap to add once `score` is used. |
| Placement / jump ahead | Placement test skips ~20%; "Jump here?" per unit | None; strictly linear | **gap** Matters as soon as a non-beginner installs the app. |
| Legendary | Harder replay without hints | None | **n/a** for now. |

## 3. Spaced repetition

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| Model | HLR (2016–), later a separate vocabulary model; per lexeme | SM-2 per form, Anki-flavoured, with fuzz (`src/lib/srs.ts`) | **Δ** SM-2 is a fine default with no data. HLR is *not* a better target (benchmarked worse than predicting the average); FSRS is. |
| What is graded | **Session recall rate** `session_correct/session_seen` per lexeme | One rating per form per round, committed when its last exercise is answered: 0 wrongs → 2 (3 if a typing exercise passed), 1 wrong → 1, ≥2 → 0 (`src/app/practice.tsx:384`) | **≈** Same idea as HLR's session proportion, just bucketed. Good. |
| Early review | Implicit in Δ | Early answers grow from elapsed days, never shrink, never raise ease (`srs.ts`) | **=** / better than naive SM-2. |
| Filler / unscheduled words | — | Filler and "dragged-along" forms keep their schedule when right; a wrong answer counts as a lapse (`practice.tsx:366`) | **≈** Sensible; matches Duolingo using review exercises as measurement without scheduling on them. |
| Visible strength | Bars from mean p̂; removed in 2022 because decay drove cosmetic grinding | Words tab: `nueva / creciendo / firme` from `interval_days` thresholds 4 / 21 (`src/app/(tabs)/words.tsx:50`); no decay shown | **=** Che already avoids the decaying meter. |
| Log schema | `delta, history_seen, history_correct, session_seen, session_correct` per (user, lexeme, session) | `review_logs(user_id, form_id, rating 0\|2, mode, reviewed_at)` per exercise (`…course_schema.sql:305`; written at `practice.tsx:434`); no session id | **gap** The history counts and Δ can be rebuilt by replaying the log, but without a session id you can't group a round's answers into one session. Add `session_id` (and optionally the SM-2 rating actually committed) so HLR, FSRS or SM-2 can be fitted and compared offline. |
| Evaluation | MAE / AUC of predicted recall vs actual; A/B tests | None | **gap** Once logs have sessions, a script can compute SM-2's calibration. That's the step before any scheduler change. |
| Hard morphology | Participles, gerunds, imperfect, irregulars decay faster | No per-feature prior | **gap** (later): a starting ease by `features` (gerund, imperative, irregular), which is the "−lex, shared features" lesson. |
| Leeches | — | `lapses` tracked, for the dashboard (`practice.tsx`) | **=** (dashboard not built). |

## 4. Exercise selection and difficulty

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| Learner/exercise model | Birdbrain: `P(correct)=σ(θ−Σd_k)` (V1), LSTM (V2); per-exercise SGD | None. Hand rules: recognition before production; typing only once `interval_days ≥ 7` (`session.ts:44`, `:121`); sentence rung by passes; glue unlock after 5 passes; sentence cap 2→8, grows 1 per 10 passes, −1 after ≥2 fails the day before (`sentences.ts:143`) | **Δ / gap** The rules are a hand-tuned stand-in and fine for one learner. The gap is that nothing *measures* whether a round lands near the target accuracy. |
| Target accuracy | Kept high on purpose (~93% sessions; metadata "target difficulty 0.89") | Not measured. `lesson_progress.score` = first-try % (`practice.tsx:318`) exists but is unused | **gap** (cheap): log / display average score; if it drifts well above 95% or below 80%, tune the ladder constants. |
| Same material, several angles | Exercise type is a difficulty component | 2–3 angles per form, interleaved so a form never repeats back to back (`session.ts:199`) | **=** |
| Adaptive swap in-lesson | All-correct → last exercises replaced by harder ones | Not done | **gap** (small): if every answer so far is right, the last drills can climb a rung (gap → build, build → listen). |
| Mistakes at end of lesson | "At the end of a lesson you'll review any mistakes" | Missed forms re-asked later in the round, max 2 per form, as multiple choice / true-false (`practice.tsx:468`) | **≈** Duolingo replays the *same* exercise; Che re-asks in the gentlest format. |
| Persistent Mistakes queue | Practice Hub → Mistakes (10 exercises) | None. Wrong words become due via SM-2 rating 0 (10 min) | **≈** SM-2 covers it; a "Mistakes" entry would only be UI over `form_states` where `lapses>0` or rating 0 recently. |
| Review inside lessons | Path order spaces material; personalized practice nodes | `review` slots pull due forms from earlier units, carried by earlier sentences (`src/lib/lesson.ts:203`, `:246`) | **=** / more personalised than the path itself. |
| Practice outside the path | Practice Hub; SRS + accuracy | Practice button: all due forms through sentences where possible, 8–18 screens, padded with filler (`session.ts:50`, `:56`, `buildSession`); free practice writes nothing to SM-2 | **=** |
| Sentence rotation | — | Rests 3 days after being shown, retires from teaching after 3 correct (`sentences.ts:78`, `:83`) | Che-specific; good. |
| Difficulty labels | Showing "hard" raised effort | None | **gap** (tiny): mark `sentence_build`/`typing` screens as "Harder". |

## 5. Grading and accepted answers

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| Accepted set | Hundreds per prompt, human-curated, weighted by learner frequency | `es_alt[]` authored + generated by rules (pronoun drop/add, optional `che`, other gender) (`scripts/course/lib/accept.mjs`); `en_alt[]` | **≈** Rule-based expansion is the right tool for tile builds. |
| Free-text sentence translation | Core format (`reverse_translate`, typed) | No: sentences are built from tiles; typing is single words only (`answers.ts:165`) | **Δ** Tiles bound the answer space, so a small `es_alt` suffices. Adding typed sentences would need a much larger accepted set, which is exactly Duolingo's STAPLE problem. |
| Matching | FSM alignment by token edit distance to nearest reference; diff shown | Tiles: exact word sequence vs any accepted answer (`answers.ts:118`); a wrong build blames only words missing from the closest answer (`missedForms`, `:181`) | **≈** The "closest answer" blame is Duolingo's diff in spirit. |
| Typos | "You have a typo" (thresholds unpublished) | Typing: case/accents/punctuation ignored (`norm`, `answers.ts:29`); 1 edit forgiven in words ≥ 5 letters, never when the typo is itself a course word (`answers.ts:158`) | **=** Same rule the research guesses. **Difference:** Che drops accents *silently*; Duolingo accepts but flags them. A "watch the accent: tenés" note would teach orthography for free. |
| Distractor safety | Not documented | `sharesMeaning` guard: no option, tile or pair that is also a right answer (`answers.ts`) | Che-specific; stronger than anything documented. |
| "My answer should be accepted" | Report button → ranked queue → curators (~10% valid) | None | **gap** Becomes valuable once there are real learners; feeds `es_alt` in the dashboard. |
| Preferred answer | Accepts, then shows the preferred translation | Shows `es` when a right build isn't `es` (`isCanonical`) | **=** |
| Speech | In-house ASR, phonetic grading | None | **n/a** for v1. |
| Explain my answer | LLM, on demand, uses learner answer + correct answer + L1 | None | **gap** (later). Cheap: on tap, send sentence, answer and closest accepted to Claude; cache per (sentence, wrong words). |
| Hints | Hover dictionary on every token | Only the word being introduced is tappable (`practice.tsx`, `SentenceLine` `mark`) | **Δ** Deliberate: every other word is known by construction. Worth revisiting for review sentences from old units. |

## 6. Content production

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| Curriculum first | Can-do goals → words → grammar → pair vocabulary with grammar | `docs/course/section-*.yaml`: unit title = can-do, `grammar`, `words` per unit, `sample`; `npm run course:validate` | **=** |
| Exercises derived, not authored | Auto-generated gap and word-order exercises from sentences | `sentences.ts`, `session.ts`, `answers.ts` derive all modes from sentence + tokens | **=** |
| LLM drafting | "Mad Lib" prompts: fixed rules + slots; ~10 candidates, human keeps ~3 | Spec'd: `generate-unit.mjs` with literal `available_forms`, quotas, JSON schema (`docs/course-spec.md` §4). **Not built**: current content is hand-written (`fixtures/demo.yaml`) | **gap** (planned, Phase 3). Duolingo's number is a good default: over-generate ~3×, keep the best. |
| Grounding | DuoRadio: feeding existing curriculum sentences into prompts is what made generation work | Spec gives the generator the allowed forms list, not example sentences | **gap** (small): include the unit's and earlier units' approved sentences as style examples. |
| LLM judges | Designer-written judges: naturalness, grammaticality, coherence, logic | Spec'd adversarial review (porteño? register? natural English?), never approves (`course-spec.md` §4) | **=** (not built). |
| Linters | "Digital tools and human checks" limit new material per sentence | `scripts/course/lib/{outline,content,rules,accept}.mjs` + tests; voseo, regionalisms, register, `en.covers`, `es_alt.legal` | **=** / more explicit than anything Duolingo published. |
| CEFR levelling of text | CEFR Checker (word-level model) | `units.register_max`, `sections.cefr` label; no frequency/level check | **gap** (low): a frequency-band check (e.g. flag lemmas outside the top N of a Spanish frequency list in A1) would catch generator drift. |
| Measuring content quality | End-of-unit mastery session as a signal "how well each unit teaches" | None | **gap** Per-sentence `sentence_states.correct_count/shown_count` already exists; aggregating failure rate per sentence over learners is the same signal. |

## 7. Engagement

| Topic | Duolingo | Che | Verdict |
|---|---|---|---|
| Streak | Freeze, repair, wager | Streak with a *recoverable* run: a missed day banks it, two rounds on the comeback day buy it back (`finish_lesson`, `src/lib/streak.ts`) | **≈** Che's "two classes" is a free, effort-based repair. |
| XP / leagues / gems | Core | None (`course-spec.md` §8: not in v1) | **Δ** Deliberate. Note Mogavi 2022: XP and leagues also drive farming. |
| Hearts / Energy | Energy since 2025; mistakes review free | None | **Δ** Good: Duolingo's own reason for dropping hearts was beginners running out mid-lesson. |
| Notifications | Bandit over templates with a recency penalty (h = 15 d); reward = lesson within 2 h | Round-robin `MESSAGES` index per subscription, streak text every 3rd, 25-minute minimum gap (`supabase/functions/send-reminder/index.ts:46`, `:50`) | **≈** Round-robin already avoids repeats. A bandit needs far more users than Che has. |
| Social | Friends, leagues | Partner reminders (`20260514000001_partner_reminders.sql`) | **≈** |

---

## Recommendations, in order

Order is by value for effort, given Che's size (few learners, no data yet).

1. **Make the logs fit-ready.**
   - Add `session_id` (one per round) to `review_logs`, and log the committed SM-2 rating as its own row type or column.
   - This costs nothing now, and it's what makes any later scheduler, calibration or difficulty work possible. (§3)
2. **Use `lesson_progress.score`.**
   - Track average first-try accuracy per lesson and per learner. Duolingo aims for ~90%+.
   - Use the number to tune `SETTLED_DAYS`, the rung thresholds and the sentence cap, instead of guessing.
   - The same number can gate the unit's last lesson ("review") as a light mastery check. (§2, §4)
3. **Thicken lessons toward 4–6 new forms each,** or cut lessons per unit, when the generator fills units 3+. (§2)
4. **Flag accents instead of silently accepting them** in typing: accept, with a note showing the accented form. (§5)
5. **Ground the generator in approved sentences and over-generate ~3×** when Phase 3 is built. (§6)
6. **Report-my-answer button → dashboard queue → `es_alt`,** once real learners exist. (§5)
7. **Adaptive tail:** after an all-correct first half, promote the last drills one rung. (§4)
8. **Placement / jump-ahead test per section** before opening the app to non-beginners. (§2)
9. **Stories** as a lesson kind: a dialogue of known forms, played with meaning and gap exercises. (§2)
10. **Later, with data:** fit FSRS on the logs from (1) and compare its calibration with SM-2's. Skip HLR. Seed a starting ease per morphological feature. (§3)

What **not** to copy:
- Decaying strength meters (removed by Duolingo for driving cosmetic grinding).
- Per-word difficulty weights without data (overfit and frustrated users in HLR A/B test II).
- Hearts.
- Free-text sentence translation without a large accepted set.
