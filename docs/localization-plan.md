# Posta in Portuguese (pt-BR) and Russian (ru): plan

Goal: a Brazilian or a Russian speaker downloads Posta and learns Argentine Spanish **from their own language**, with the same quality as the English version. English stays the source and keeps working the same.

Version 2 (2026-10-22): refined with 4 reviews against the code (data, content quality, app/Hablar, cost).

## Real volumes (snapshot 2026-10-06, published only)

| Content | Amount | Note |
|---|---|---|
| Sentences used in lessons | 13,437 | first priority |
| Review-only sentences | 13,617 | later; review only picks translated sentences |
| Units | 466 | about 58 sentences per unit, one agent call |
| Lemmas | 2,354 | |
| Forms | 4,440 | 100% needed before launch, because one English option among pt options gives the answer away |
| Tips | 821 | the 251 retired ones are not translated |
| Culture pages | 1,067 | |
| Slang words | 245 | |
| Hablar scenes | 76 + 468 | |
| UI strings | about 850 | plus notifications, emails, widget and store |

Section 1 is 6.6% of the total, so it is a good pilot to extrapolate from.

## Golden rules

1. **Never mix languages inside one exercise or screen.** A unit or section with no complete translation is shown as "coming soon in Portuguese". It never falls back to English halfway through.
2. **Translate from the Spanish.** English goes along only as a hint for meaning.
3. **One language per agent and per run.** The code and the pipeline are built once; content runs separately.
4. **Everything is idempotent and can be stopped.** Each unit saves a hash of its input. Re-running skips what is already done, and stopping loses at most one unit.
5. **Any later edit to the Spanish or English marks the translation as stale.** It goes back into the queue automatically.

## Architecture

### Data (Supabase)

- **Separate tables, not jsonb on the base rows.** Editing a translation must not invalidate the other languages.
  - `sentence_tr(sentence_id, lang, unit_id, text, alts[], note, glosses jsonb, src_hash, status, updated_at)`, PK `(sentence_id, lang)`.
  - `lemma_tr`, `form_tr` (gloss, note), `tip_tr`, `unit_tr` (title, summary, `complete`), `section_tr`.
- **`src_hash`**: computed from `md5(es | en | tokens)` at translation time. A `tr_stale` view compares it with the current hash.
  - Only English changed: soft stale. Keep serving and queue a re-translation.
  - Spanish tokens changed: hard stale. Hide the per-word glosses, because they no longer line up.
- **Per-word glosses**: an array the same length as `tokens`, checked when written and again on the client. For Russian, each gloss is `{in, base}`: `in` is the inflected form shown in the popover, `base` is the dictionary form used by tallies and meaning checks.
- **Accepted answers:**
  - Keep the `es_alt` set built from English as a base, and add `es_alt_extra` only where pt/ru leave more open (for example вы, which can be usted or ustedes). Accepting one more answer costs little.
  - `form_answers.lang` goes into its unique index, and `answer_reports.lang` is added.
  - Per-language `form_answers` start empty and get filled from reports.
- **Versioning**:
  - `content_unit_stamps_tr(unit_id, lang, stamp)` with its own trigger;
  - `gloss_tallies_cache` keyed by `lang`;
  - `content_version()` only gains a new `tr` key. The existing keys are left alone, because old builds validate them.
- **RLS**: `sentence_tr` copies the premium lock, using `unit_id` + `free_unit_ids()`, with no per-row `exists`.
- **Old app builds**: they read only the English columns, which stay untouched, so they are safe.

### App (client)

- **Merge on the client.** On load, `en`, `en_alt`, `tokens[].gloss` and `gloss_en` are overwritten with the learner's language. The roughly 100 uses of `.en` keep working unchanged; only the language-specific heuristics move.
- **`lang/en.ts`, `lang/pt.ts` and `lang/ru.ts`**:
  - contractions, filler words, pronoun and gender cues, tile capitalisation;
  - `norm()` stops folding й→и (it keeps folding ё→е and ç/ã);
  - the `[^a-z]` regexes go (`answers.ts:235`, `:542`, `accept.ts:26`).
- **Exercises**: turn off `sentence_meaning_tiles` for Russian (free word order and inflection would mark correct builds wrong). Keep it for Portuguese.
- **Portuñol while typing** (ç, ã, nh, "não"): a near-miss hint, not an error.
- **Language:**
  - `profiles.learner_lang`;
  - the first onboarding screen is a picker, pre-selected from the phone's language;
  - before there is a guest profile, the choice is kept in AsyncStorage.

  | Phone language | Default |
  |---|---|
  | `pt-PT` | pt, labelled "Português (Brasil)" |
  | `uk` | en, with ru offered |
  | `be`, `kk`, `uz` | ru |
  | `es` | en |

- **Changing language in Account**:
  - a confirmation dialog;
  - clear the cache memo and the snapshots (`snapshot.ts` keys gain the language);
  - reschedule the local notifications (trial and free unit);
  - refresh the widget.
  - Progress, SRS and streak are kept. Old Hablar history stays in its original language.
- **i18next**:
  - ICU plurals (ru: 1/2/5/11/21);
  - `Intl` with the learner's language for dates and prices (`onboarding.ts:432`, `billing-shared.ts:119`);
  - CI fails on any key missing in pt/ru;
  - Sentry logs `i18n_missing`.
- **Analytics**: PostHog super-properties `learner_lang` + `device_locale`, Sentry tag `learner_lang`, and Hablar cost broken down by language.

### Hablar and AI functions

- **Language contract**: the app sends a `x-learner-lang` header and the edge functions use it, defaulting to `en`. An old build never gets feedback in another language. Push and email read the profile instead.
- **Prompts**: `PERSONA` stays byte-identical, so the prompt cache is still shared, and a language block goes after it. The JSON keys (`why_en`, `better_en`, `full_en`, `went_well`) stay; only the instruction says "in {lang}". Few-shot examples are written per language.
- **Slips into the learner's own language** (generalising `looksEnglish` into a per-language policy):
  - **ru**: speech-to-text forced to Spanish returns Latin-letter nonsense, so it is not "easy". The second, free-language pass must also trigger for ru, and is accepted when the text is mostly Cyrillic (including і/ї/є/қ for Ukrainians and Kazakhs). Typed translit ("privet") gets a small word list, and Pancho is told it can happen.
  - **pt**: portuñol comes out as Spanish. The feedback flags Portuguese words and false friends as a `note` to teach from, not as an error.
- **Caches**: `explanations` gets the language in its key; `conversations.learner_lang`; `text_en` → `text_tr jsonb {lang: text}`.
- TTS stays in Spanish, with no change.

### Native (requires a store build)

- `locales` in app.json (InfoPlist.strings for the mic and photo permissions; without them the App Store lists the app as English only).
- A Cyrillic font (Golos Text or Onest) in the app **and in both widgets**.
- The iOS widget reads its texts from the feed the app writes, instead of hardcoded Swift, so it follows `learner_lang` and can be updated over the air.
- A capability flag: the language picker only appears in binaries that support it (`runtimeVersion: fingerprint` cuts off OTA updates for old builds).

## Content quality pipeline

1. **Termbase first** (`docs/l10n/<lang>/termbase.yaml`), per lemma and sense:
   - canonical gloss, allowed variants, forbidden renderings (false friends), register;
   - `translate` | `keep` (mate, kiosco, alfajor) | `keep+note`.
   - **The native reviews this in full** for the top ~600 lemmas, all slang and all `keep` items. That is where native money goes furthest: all 27k sentences inherit from it.
2. **Writer** per unit:
   - inputs: Spanish + the token features (person, number, gender, mood, tense) + the English as a hint + the termbase entries + gold examples from the approved pilot;
   - writes 0–2 alternatives in the same call, with no separate `en_alt` pass.
3. **Deterministic gates**:
   - script leak (Latin letters in ru; English words in pt);
   - Spanish left in by mistake versus on purpose (a `keep` term inside a marker);
   - pt-PT denylist (autocarro, comboio, telemóvel, "estar a + inf.", rapariga);
   - address (vos→ты/você, ustedes→вы/vocês);
   - termbase adherence;
   - length ratio;
   - no usted/tú.
4. **Simulated learner**: a fresh agent sees only the pt/ru prompt and the unit's words. It writes the Spanish, and **the app's own grader** checks it. A rejection means either the prompt leaves something open (ru gender, articles, aspect) or an alternative is missing. The referee is the code, not a model.
5. **Triangulation**: if en, pt and ru for the same Spanish mean different things, the item is flagged.
6. **Judge** (a fresh agent). Pass means every score ≥4 and every yes/no answered yes.
   - Scores: fidelity, naturalness.
   - Yes/no checks:
     - `cue_complete`: the prompt asks for every word and feature the Spanish needs;
     - `not_overcued`;
     - `register_match`, `address_ok`, `variety_ok`, `terms_ok`, `no_leak`.
   - Extra checks:
     - pt: flag any cognate that pushes toward wrong Spanish (esquisito→exquisito).
     - ru: the aspect matches the Spanish tense; one ё policy; «» quotes.
7. **Red-team agent per unit**: hunts for the known failure types (calque, ты/вы swap, false friend, leak).
8. **Against laziness and drift**:
   - about 5 known-bad items planted blind in every judge batch; if it catches fewer than 90%, the batch is redone;
   - prompts frozen (`promptHash`);
   - per-batch metrics tracked against the pilot; a deviation over 2σ stops the run;
   - a per-lemma consistency report across the whole corpus.

**Register**:
- **pt**: informal written Brazilian (você, "pra"; "tá" only in dialogue).
- **ru**: prompts follow the Spanish (vos→ты). The UI uses ты, in a friendly tone (to be confirmed by a native).

**Slang**: plain word first + one casual equivalent of the same register ("cerveja (gíria: breja)", "пиво (разг.)"). Russian мат never stands in for a vulgar Spanish word; use a paraphrase + "(груб.)" instead.

**Tips**:
- Inputs: the English tip + the unit's Spanish + an interference library per language:
  - pt: about 150 false friends and portuñol traps;
  - ru: articles, aspect, gender, ser/estar.
- Output: the same teaching point + at most one contrast with the learner's language.
- The judge verifies every claim, in Spanish and in the learner's language.
- Section 1 is done by hand first, to measure whether translating + one contrast is enough or a full rewrite is needed.

**Culture**:
- Pages that compare with English or the US are rewritten.
- Guess-first questions that a Brazilian already knows (chimarrão, Florianópolis) are swapped.
- Sensitivities:
  - pt: football rivalry as friendly teasing only;
  - ru: Malvinas and the dictatorship stay factual, with no analogies to Crimea or Ukraine; don't assume the reader lives in Russia; prices in USD.
- The sensitive pass is repeated per language.

## Native review (per language)

- **About 400 stratified items:**
  - sentences early/mid/late;
  - glosses, tips, culture (sensitive pages oversampled), slang, Hablar feedback, UI;
  - plus 40 borderline (judge = 4), 30 rejected (to check whether the judge is too harsh) and 10 canaries (to check the reviewer is paying attention).
- **Error severity:**
  - critical = wrong meaning, a correct answer graded wrong, offensive content, a false claim;
  - major = calque, register, pt-PT, false friend, leak;
  - minor = typography.
- **Pass:**
  - 0 critical in tips and sensitive culture;
  - critical + major ≤3% overall (Wilson 95% upper bound ≤5%);
  - no stratum above 6%.
- **On failure**: tag each error with its root cause (prompt, termbase or a missing gate), fix it in the pipeline, re-run the affected items by query, and draw a fresh sample.
- **Budget**: termbase + 400 items, about USD 300–500 per language.

## Phases

| Phase | What | Done when |
|---|---|---|
| **0a. Native build** | locales/InfoPlist, Cyrillic font in the app and widgets, widget reading the feed, i18next installed, capability flag | One store build, with the app identical in English |
| **0b. Groundwork JS + server** | UI strings → `en.json`; `learner_lang` + picker; `*_tr` tables, `src_hash`, stamps/tallies per language; client merge; `lang/` modules (en, pt, ru); cache/snapshots with language; the language header in edge functions; Hablar slip policy; notifications/push/email by language; analytics | The app is **identical in English** (tests + simulator play-through); a test UI in pt and ru with no broken text or glyphs |
| **1. Pipeline + pilot** | `--lang` flag in `course:agent`, `.course-work/<lang>/`, `course:tr-status`; termbase for section 1; pilot of **section 1 complete in pt** + **3 units in ru** (stress test: Cyrillic, case, gender) | pt: native sample of section 1 approved + play-through. ru: gates pass. Cost per unit measured and extrapolated |
| **2. pt to launch** | full termbase + native review of it; sections 1–4 (about 9.6k sentences, 166 units) + their culture, slang, Hablar, notifications, emails, pt store listing + screenshots + BRL price | Gates pass + 400-item native sample approved; **launch pt** |
| **3. Rest of pt** | sections 5–15, one at a time; each unlocks when it passes gates + about 50 native items; then the 13.6k review-only sentences | Every section unlocked |
| **4. Validate ru** (can run in parallel with 2) | ru store listing + landing page/waitlist + about USD 300 in ads aimed at Russian speakers outside Russia (Israel, Georgia, Kazakhstan, Argentina, EU) | Cost per signup close to English, and most can pay outside Russia → go ahead |
| **5. ru** | same as 2–3, applying what pt taught us | Same as 2–3 |

**Why sections 1–4 at launch:** a paying user takes weeks to reach section 5, and we translate section by section in the meantime.

## Maintenance (built into the pipeline from the start)

- `course:agent publish <slug> --langs all`: after the English publish succeeds, it queues the translation step for each enabled language. The same applies to culture, tips and Hablar.
- Fixes from the review dashboard, and migrations that patch `es` or `en`, mark rows stale through `src_hash`. They are not forgotten.
- CI: `course:tr-status --fail-on-missing-unlocked` blocks a merge if an unlocked section has stale or missing rows. A lint checks for English left in the per-language JSON files.
- Admin stays in English, with a "translation stale" badge and the translations visible read-only.

## Release

- Localised subscription names and descriptions in App Store Connect and Play.
- BRL price tiers.
- Review notes that explain the app teaches Spanish, so a UI full of Spanish isn't flagged as "not localised".
- Terms and Privacy stay in English, linked from the listing.
- Test accounts: a Russian Apple ID abroad and a BR sandbox account.

## Things to test on a device

- Android with the system in Russian: the bold Gabarito falls back glyph by glyph, giving a mixed look.
- Widgets in pt/ru at small and medium sizes; Portuguese is about 25% longer, and Russian has long words like "достопримечательность". Also check the paywall, tiles and tips with large Dynamic Type.
- Changing language mid-session: cold start, an open lesson, the widget, the scheduled reminder.
- Hablar in ru (speaking Russian, translit, typing Cyrillic) and in pt (portuñol, false friends).
- Russian plurals 1/2/5/11/21 in the streak, the push and the widget.
- The mic permission prompt with the phone in pt and in ru.
