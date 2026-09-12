# Che — Course spec & implementation plan

A Duolingo-shaped course in rioplatense Spanish for English speakers. This document is the design for the course schema, the content pipeline, the runtime that plays a lesson, and the admin dashboard a native reviewer works in — plus the phased plan to build it. It is the source of truth for the work; the published page is generated from it.

Status: **in progress** — Phases 0 (machine side), 1 and 2 built · branch `duolingo-ui` · updated 2026-09-13

---

## 0. Decisions

Everything below follows from these. They were settled in conversation and are not re-litigated here.

| Area | Decision |
|---|---|
| Path node | An authored lesson. The path *is* the curriculum. |
| Learner | English speakers. UI in English (translation sweep is its own step). |
| v1 scope | One section, end to end: ~20 units, ~100 lessons, ~1000 sentences. |
| Syllabus | PCIC A1 inventory as a coverage checklist; we author the order, Argentine-first. |
| Content model | Duolingo's: author *sentences*, derive *exercises* mechanically. The derivation engine already exists. |
| Daily loop | Lessons interleave authored content with due material from earlier units, from day one. |
| SRS | Survives (SM-2 per form), feeding the interleave and a separate Practice entry. |
| Drafting | AI drafts under hard constraints → linters → adversarial AI review → native review in a dashboard. |
| Quality gate | Automated checks catch the mechanical; a native signs off on naturalness. |
| Source of truth | The database. A script snapshots the whole course to versioned JSON in the repo. |
| Dashboard | Role-gated routes inside the same Expo app. |
| Lexicon | Lemma + explicit taught forms. `tenés` is a row; `tienes` never exists. |
| Audio | Schema carries it; TTS vendor decided later by a listening test (Azure `es-AR` vs ElevenLabs). |

---

## 1. Content model

### 1.1 Curriculum

```
section  ─┬─ unit ─┬─ lesson ─── slot, slot, slot …
          │        ├─ lesson
          │        ├─ tip (grammar note)
          │        └─ forms introduced here
          └─ unit …
```

- A **section** is a CEFR-ish band the learner can name ("Section 1 · First words"). v1 has one.
- A **unit** owns a grammar focus, the forms it introduces, its sentences, and 4–6 lessons. It is the unit of authoring, review and publishing.
- A **lesson** is an ordered list of **slots**. It is what a coin on the path plays. Every lesson has a *canonical* rendering — what a learner with no backlog sees — and that is the artifact a reviewer approves.
- A **slot** says what goes in that position and how it is filled:

| Slot kind | Fills with | Deterministic? |
|---|---|---|
| `teach` | A form the unit introduces, met inside its intro sentence (or as a bare card if none) | yes |
| `drill` | One authored sentence; exercise mode pinned or chosen by the ladder | yes (mode may vary) |
| `match` | A matching block over forms taught so far in this unit | yes |
| `tip` | A short grammar note card | yes |
| `review` | *k* due forms from **earlier units**, carried by sentences from those units, chosen by SM-2 | **no — this is the interleave** |

The canonical rendering shows `review` slots as placeholders ("Review × 2"). Everything else renders exactly as shipped.

### 1.2 Lexicon

Two levels, because voseo is a property of *forms*, not words:

- **lemma** — the dictionary entry: `tener`, `mate`, `che`. Carries part of speech, English gloss, register, notes.
- **form** — one surface string of one lemma: `tengo`, `tenés`, `tiene`, `tené`. Carries grammatical features and **the unit that introduces it**. A form the course never teaches does not exist in the table — so `tienes` is not a "wrong" row, it is an impossible one.

"Taught by now" is a query: a form is available to a sentence in unit *n* iff its own unit's ordinal ≤ *n*. That single rule is what the vocabulary linter enforces and what the generator is constrained by.

Function words (`el`, `de`, `y`, `vos`) are ordinary lemmas flagged `is_glue`, so the sentence ladder's glue-unlock rule keeps working.

### 1.3 Raw content

A **sentence** is the atom of authored content. It belongs to a unit, targets one form (the thing it exists to teach or drill), and carries:

- `es` — the Spanish, as written (šeísmo is pronunciation; spelling is standard)
- `en` — the primary English translation, plus `en_alt[]` accepted alternatives
- `tokens` — the sentence split into surfaces, each pointing at the form(s) it is: `[{surface:"¿Tenés", form_ids:[…]}, {surface:"mate?", form_ids:[…]}]`
- `kind` — `word` · `phrase` · `sentence` · `dialogue`
- `difficulty` 1–4 (the ladder's rung ceiling), `status`, `source`, `audio_path`

A sentence is legal iff every token resolves to a form available in its unit. That is checkable by machine, and it is the property that makes exercise derivation safe.

### 1.4 Derived exercises

Nothing here is new: `sentences.ts` and `session.ts` already turn a sentence plus tokens into `sentence_meaning`, `sentence_gap`, `sentence_build`, `sentence_listen`, tiles, distractors and miss-detection; word modes (`flashcard`, `multiple_choice`, `listen`, `typing`, `word_build`, `matching`, `true_false`) already derive from a form and its neighbours. The lesson runtime is a **second producer** of the `SessionData` shape `practice.tsx` consumes — `buildSession` stays as the Practice-hub producer.

One small addition: a `tip` exercise mode with a plain note screen.

---

## 2. Schema

DDL sketch. Names are final; column details may shift during Phase 1. All content tables carry `status content_status`, `created_at`, `updated_at`.

```sql
create type content_status as enum
  ('draft','linted','ai_reviewed','approved','published','retired');

-- Curriculum ---------------------------------------------------------------
create table sections (
  id        smallint primary key,
  ordinal   smallint not null unique,
  slug      text not null unique,
  title_en  text not null,
  cefr      text not null                     -- 'A1.1'
);

create table units (
  id            uuid primary key default gen_random_uuid(),
  section_id    smallint not null references sections,
  ordinal       smallint not null,
  slug          text not null unique,
  title_en      text not null,
  summary_en    text not null,                -- one line, shown on the path
  grammar_focus text[] not null,              -- PCIC-style tags, e.g. '{ser.presente.vos, articulo.definido}'
  register_max  text not null default 'informal',  -- highest register a sentence here may use
  status        content_status not null default 'draft',
  unique (section_id, ordinal)
);

create table lessons (
  id        uuid primary key default gen_random_uuid(),
  unit_id   uuid not null references units on delete cascade,
  ordinal   smallint not null,
  title_en  text not null,
  kind      text not null default 'lesson' check (kind in ('lesson','review','checkpoint')),
  status    content_status not null default 'draft',
  unique (unit_id, ordinal)
);

create table tips (
  id        uuid primary key default gen_random_uuid(),
  unit_id   uuid not null references units on delete cascade,
  title_en  text not null,
  body_md   text not null,                    -- short; examples inline
  status    content_status not null default 'draft'
);

-- Lexicon ------------------------------------------------------------------
create table lemmas (
  id        uuid primary key default gen_random_uuid(),
  lemma     text not null,
  pos       text not null,                    -- verb, noun, adj, adv, pron, det, prep, conj, interj, phrase
  gloss_en  text not null,
  register  text not null default 'neutral'
            check (register in ('neutral','informal','lunfardo','vulgar')),
  is_glue   boolean not null default false,
  notes_en  text,
  status    content_status not null default 'draft',
  unique (lemma, pos)
);

create table forms (
  id        uuid primary key default gen_random_uuid(),
  lemma_id  uuid not null references lemmas on delete cascade,
  form      text not null,                    -- 'tenés'
  features  jsonb not null default '{}',      -- {person:2, number:'sg', tense:'pres', mood:'ind', voseo:true}
  gloss_en  text,                             -- overrides lemma gloss when the form needs it ('you have')
  unit_id   uuid not null references units,   -- the unit that teaches this form
  audio_path text,
  status    content_status not null default 'draft',
  unique (lemma_id, form)
);
create index forms_unit_idx on forms (unit_id);

-- Raw content --------------------------------------------------------------
create table sentences (
  id             uuid primary key default gen_random_uuid(),
  unit_id        uuid not null references units,
  es             text not null,
  en             text not null,
  en_alt         text[] not null default '{}',
  tokens         jsonb not null,              -- [{surface, form_ids[], tail?}]
  target_form_id uuid not null references forms,
  kind           text not null default 'sentence'
                 check (kind in ('word','phrase','sentence','dialogue')),
  difficulty     smallint not null default 1 check (difficulty between 1 and 4),
  source         text not null default 'ai' check (source in ('ai','human','tatoeba')),
  attribution    text,                        -- required when source = 'tatoeba'
  audio_path     text,
  status         content_status not null default 'draft',
  created_by     uuid references profiles,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
-- Maintained by trigger from `tokens`, so "sentences using form X" is a join, not a jsonb scan.
create table sentence_forms (
  sentence_id uuid references sentences on delete cascade,
  form_id     uuid references forms on delete cascade,
  is_target   boolean not null default false,
  primary key (sentence_id, form_id)
);

-- Lessons are ordered slots --------------------------------------------------
create table lesson_slots (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references lessons on delete cascade,
  ordinal      smallint not null,
  kind         text not null check (kind in ('teach','drill','match','tip','review')),
  form_id      uuid references forms,         -- teach
  sentence_id  uuid references sentences,     -- drill
  tip_id       uuid references tips,          -- tip
  mode         text,                          -- drill: pinned ExerciseMode, or null = ladder decides
  review_count smallint,                      -- review: how many due items
  unique (lesson_id, ordinal)
);

-- Review workflow ------------------------------------------------------------
create table content_reviews (                -- one row per check, per stage
  id         bigint generated always as identity primary key,
  table_name text not null, row_id uuid not null,
  stage      text not null check (stage in ('lint','ai','native')),
  verdict    text not null check (verdict in ('pass','flag','fail')),
  notes      jsonb not null default '{}',     -- lint: {rule, detail}; ai: {issue, rewrite}; native: {comment}
  reviewer   uuid references profiles,
  created_at timestamptz not null default now()
);
create table content_revisions (              -- audit trail for dashboard edits
  id         bigint generated always as identity primary key,
  table_name text not null, row_id uuid not null,
  before     jsonb, after jsonb not null,
  edited_by  uuid not null references profiles,
  created_at timestamptz not null default now()
);

-- Per-user -----------------------------------------------------------------
-- profiles: id uuid pk, role in ('student','reviewer','admin'), display_name, timezone, ui_locale
create table lesson_progress (
  user_id      uuid references profiles on delete cascade,
  lesson_id    uuid references lessons on delete cascade,
  completed_at timestamptz not null default now(),
  score        smallint,                      -- % correct on first pass
  primary key (user_id, lesson_id)
);
-- form_states      = today's card_states, keyed by form_id (SM-2 per form per user)
-- review_logs      = keyed by form_id
-- sentence_states, daily_sessions, streaks = unchanged
```

**Views and RPCs**

- **Current lesson** — the first lesson, in `(section, unit, lesson)` ordinal order, with no `lesson_progress` row. *As built:* computed client-side (`currentIndex` in `src/lib/course.ts`), since the path loads the whole curriculum anyway; no RPC.
- `finish_lesson(p_local_date, p_lesson_id?, p_score?)` — *as built:* one call for every finished round. Records `lesson_progress` (keeping the best score) when a lesson id is given; completes today's `daily_sessions` row; credits the day on the first round, or trades in a banked run on a comeback day's second round. Returns `(current_streak, previous_streak, recoverable_streak)`. Practice rounds call it without a lesson id, so they credit the day too, as on Duolingo.
- `available_forms(unit_ordinal, section_id)` — forms whose unit ordinal ≤ the given one. Used by the linter, the generator and the lesson builder.
- `form_entries` — a `security_invoker` view of forms with their lemma's gloss and their unit's ordinal folded in; the app reads forms through it.

*As built:* `supabase/migrations/20260913000001_course_schema.sql`, tested by `npm run db:test` against real Postgres (PGlite) — RLS, the role guard, the tokens→`sentence_forms` trigger and every streak path. **Not yet applied** to the live project.

**RLS**

- Curriculum, lexicon, content: `select` for authenticated where `status = 'published'`; reviewers and admins see everything and may `insert`/`update`. No `delete` from the client — retire instead. (`lesson_slots` is the exception: staff may delete, since reordering rewrites them.)
- `profiles.role`: a trigger makes every new profile a student and rejects any role change not made by the service role — a learner cannot promote themselves.
- `content_reviews`, `content_revisions`: insert by reviewers/admins; select same.
- Per-user tables: owner only, as today.

---

## 3. Runtime

### 3.1 Playing a lesson

`buildLesson(userId, lessonId): Promise<SessionData>` — the second producer of the shape `practice.tsx` already consumes.

1. Load the lesson's slots in order, the forms available to this unit, this user's `form_states` and `sentence_states`.
2. Resolve each slot to `SessionItem`s:
   - `teach` → `sentence_intro` with the form's intro sentence if one is approved, else `flashcard`; sets `introduces`.
   - `drill` → the sentence, mode = pinned or `rungFor(sentence, glueSeen)`, `card` = target form, `group` = the sentence's forms.
   - `match` → `matchingBlock(forms taught so far in this unit)`.
   - `tip` → `{ mode: 'tip', tip }`.
   - `review` → *k* forms due (`due_at ≤ now`) whose unit ordinal < this unit's, wrapped by `pickReviewSentences`; items flagged `review: true` so the finish screen can say "and 2 words you were about to forget".
3. Return `{ items, allCards: forms, sentences, scheduledCardIds }`. Grading, SM-2 updates and re-asks are untouched.

**Preview mode** (`buildLesson(..., { canonical: true })`) renders `review` slots as placeholder items. The dashboard and the reviewer use this.

### 3.2 Finishing

`practice.tsx` calls `finish_lesson` instead of inserting a `lessons` row. Streak, daily session and celebrations behave as before. The next lesson becomes the current one. The frozen-streak gate now applies to any round, lesson or practice.

### 3.3 The path

`home.tsx` stops counting `lessons` rows and instead loads `sections → units → lessons` with `lesson_progress` joined. Coins are lessons; a unit renders as a titled group of coins (its `title_en` + `summary_en` on a bar above its first coin, the way Duolingo bands the path); figures sit between units. Phase for a coin: done if progress exists, current if it is `current_lesson`, else locked. All the animation code stays.

### 3.4 Practice hub

A "Practice" entry on the path (below the current coin, or in the header) runs today's `buildFreeSession` over `form_states` — pure SRS over everything learned. This is where SM-2 earns its keep between lessons.

---

## 4. Authoring pipeline

Scripts live in `scripts/course/`, run locally, write to the DB. Every stage is re-runnable per unit.

| Stage | Script | Reads | Writes | Status after |
|---|---|---|---|---|
| Outline | `seed-outline.mjs` | `docs/course/section-1.yaml` (Appendix A, human-authored) | `sections`, `units`, `lessons` (empty), `tips`, `lemmas`, `forms` | `draft` |
| Draft | `generate-unit.mjs <unit>` | unit's grammar focus + new forms; `available_forms`; style spec (Appendix B); quotas | `sentences` | `draft` |
| Lint | `lint.mjs <unit>` | sentences | `content_reviews (stage=lint)`; fixes tokens where unambiguous | `linted` or back to `draft` with flags |
| AI review | `ai-review.mjs <unit>` | linted sentences | `content_reviews (stage=ai)` with issue + proposed rewrite | `ai_reviewed` |
| Native review | dashboard | ai_reviewed sentences, review notes | edits (`content_revisions`), `content_reviews (stage=native)` | `approved` |
| Assemble | `build-lessons.mjs <unit>` | approved sentences, forms | `lesson_slots` (a proposal the reviewer can reorder) | lessons `draft` |
| Publish | dashboard | approved unit | flips unit, its forms, sentences, lessons, tips to `published` | `published` |
| Snapshot | `export-snapshot.mjs` | everything | `content/snapshots/<date>/*.json`, committed | — |

**Generator constraints (hard, in the prompt and re-checked by the linter):**

- May use only forms in `available_forms(unit)`. The prompt receives the literal list.
- Every sentence names its `target_form_id` and must contain it.
- Quotas per unit: for each new form, 1 intro sentence (difficulty 1–2, ≤ 6 words, the form's meaning obvious from context) + 3 drill sentences across difficulty 1–3; plus 2 short dialogues (2–4 lines) using only this unit's and earlier forms.
- Output is JSON validated against a schema before anything is written.
- Model and prompts are pinned in `scripts/course/config.mjs`; every generation records the prompt hash in `content_reviews.notes` so a bad batch can be traced.

**Adversarial review** uses a different prompt and sees only the sentence, its unit's grammar focus and the style spec — not the generator's reasoning. It answers three questions per sentence: *would a porteño say this*, *is the register right for this unit*, *is the English translation what an English speaker would actually say* — and proposes a rewrite when any answer is no. It never approves; it only flags.

**Snapshot discipline:** export runs on every publish and nightly. Restoring is `import-snapshot.mjs <date>`. The repo is history; the DB is now.

---

## 5. Admin dashboard

Routes under `src/app/admin/`, gated by `profile.role in ('reviewer','admin')`. Dense, desktop-first, keyboard-friendly; it reuses the app's theme but not its learner components.

| Route | Purpose |
|---|---|
| `/admin` | Units with counts by status (draft / linted / ai_reviewed / approved / published) — the reviewer's queue |
| `/admin/units/[id]` | Unit header (grammar focus, register, forms it introduces); sentence list filterable by status and target form; **Generate**, **Lint**, **AI review**, **Build lessons**, **Publish** actions |
| `/admin/sentences/[id]` | The editor: `es` / `en` / `en_alt`; tokens with a form picker per token (unresolved tokens highlighted); lint results and the AI reviewer's note + proposed rewrite side by side; **Approve** / **Send back** / **Retire**; a live "how a learner sees it" preview per derived mode |
| `/admin/lessons/[id]` | Slot list, drag to reorder, add/remove slots, pin a mode; **canonical preview** plays the lesson in preview mode |
| `/admin/lexicon` | Lemmas and forms, searchable; which unit teaches what; add a form to a unit |
| `/admin/snapshots` | Export now; list of snapshots; restore (admin only) |

Every write goes through one helper that also inserts the `content_revisions` row. The native reviewer never needs the terminal.

---

## 6. Migrating the engine

Renames are mechanical and done once, in Phase 1:

| Today | Becomes | Notes |
|---|---|---|
| `Card` / `cards` | `Form` / `forms` | plus `lemmas` above it |
| `card.hebrew` | `form.form` / `sentence.es` | the target language |
| `card.spanish` | `form.gloss_en` / `sentence.en` | the learner's language |
| `card.translit` | *dropped* | no Spanish analogue; the UI currently headlines it — headline becomes `es` |
| `card.english` | *dropped* | was the third language; `en` is now primary |
| `card_states` / `card_id` | `form_states` / `form_id` | SM-2 untouched |
| `SentenceToken.translit`, `.glue`, `.prefix` | `.surface`, `.form_ids` | glue is a lemma flag now; Hebrew prefixes have no equivalent |
| `direction: 'translit_to_spanish'` | `'es_to_en'` / `'en_to_es'` | |
| `lessons` (log) | `lesson_progress` | the word "lesson" now means curriculum |
| `insert into lessons` at finish | `rpc('finish_lesson')` | |
| `sentences.level` | `sentences.difficulty` | same semantics, same ladder |

**Coexistence with Che's live database.** The live project has `profiles` (pk `user_id`, no role), `streaks` (`last_practice_date`), `push_subscriptions` (Expo tokens), `sessions` (old AI-generated sets), `partner_links`, `notification_events` — and the deployed app on `main`, plus the `send-reminder` cron, read `streaks.last_practice_date` today.

*As built — changed from the original plan:* the migration is **purely additive**. Nothing is renamed, copied or dropped. `profiles` gains `role` and `timezone`; `streaks` gains `recoverable_streak`; the new RPC writes the same `last_practice_date` the old `bump_streak` does. So the old app keeps working, and the reminder cron keeps reading the truth for the new one. `sessions` and `generate-exercises` stay until the old app is retired. The engine's `push.ts` (web-push keys) versus Che's Expo-token model is still a **separate track** (§8) and does not block the course.

---

## 7. Implementation plan

Phases are sequential; each has a definition of done. No dates — the pacing depends on native-reviewer availability, which is the real bottleneck.

### Phase 0 — Outline and style spec · *machine side done; native sign-off pending*

- **Do:** Finalise Appendix A (section-1 outline: 20 units, grammar, forms) and Appendix B (rioplatense style spec) with a native reader. Encode the outline as `docs/course/section-1.yaml` including the lemma/form list per unit.
- **Done when:** a native has read both appendices and signed off; the YAML validates; every PCIC A1 inventory item in scope maps to a unit.
- **Built:** `docs/course/section-1.yaml` — 20 units, 310 lemmas, 502 forms, 98 lessons, tips, and a sample sentence per unit that must be sayable with what's been taught. `npm run course:validate` checks it (tuteo, vos tags, regionalisms, register, samples); `npm run course:test` holds the rejection cases. Shared tooling in `scripts/course/lib/`. Not yet read by a native.

### Phase 1 — Schema and engine rename · *done, not applied to the live DB*

- **Do:** Migration with §2's tables, RPCs and RLS on Che's project (plus the one-off user-row copy). Apply §6's renames across `src/`. Update `lib/demo.ts` to serve the new tables with unit 1 from the outline. `types/db.ts` regenerated.
- **Done when:** `tsc` is clean; the app runs on fixtures showing a real unit 1 on the path; `npm run db:push` applies cleanly to a fresh project.
- **Built:** the additive migration (§6) with `npm run db:test`; the rename across `src/` (`Card`→`Form`, `translit` dropped, Spanish-first rendering); `add.tsx` and `card/[id].tsx` removed (authoring moves to the dashboard); Palabras rewritten as the learner's words and sentences met. `npm run course:demo` builds the outline plus hand-written units 1–2 into `src/lib/demo-course.json`, checked by the same gate generated content will pass; `src/lib/demo.ts` serves it through a stateful stand-in client. `types/db.ts` is not regenerated — that needs the migration applied.

### Phase 2 — Lesson runtime · *done on fixtures*

- **Do:** `buildLesson` with all five slot kinds and preview mode; `tip` screen; `home.tsx` reads the curriculum and bands units; `finish_lesson`; Practice entry.
- **Done when:** with hand-written slots for unit 1 lesson 1, a learner can tap the coin, play the lesson, finish, see the streak fire, and the next coin becomes current — on fixtures and against the DB.
- **Built:** `buildLesson` / `resolveSlots` in `src/lib/lesson.ts`; the tip screen; the path draws every lesson with a banner per unit and a Practice button with a due badge. Verified in the browser on fixtures: unit 2 lesson 1 plays its tip, two interleaved review screens of unit-1 words, intros, drills and a tile build; finishing records progress, fires the streak 5→6, advances the path, and drops Practice's due count. *Against the DB:* not yet — it depends on the migration being applied.
- **Found while building:** the first word of a sentence gave itself away by its capital among lowercase options and tiles (fixed); introducing a word through a sentence the next slot reads for meaning spent the same screen twice (intros now skip sentences the lesson reads for meaning); a Spanish blank needs its opening `¿` as well as its closing `?` (fixed).

### Phase 3 — Authoring scripts

- **Do:** `seed-outline`, `generate-unit`, `lint` (Appendix C, all rules), `ai-review`, `build-lessons`, `export-snapshot` / `import-snapshot`. Run unit 1 end to end.
- **Done when:** unit 1 has ~60 sentences in `ai_reviewed`, every linter has at least one test with a sentence it must reject, a snapshot round-trips, and `build-lessons` proposes 5 playable lessons.

### Phase 4 — Dashboard

- **Do:** the routes in §5, the revision-logging write helper, role gating, canonical preview.
- **Done when:** a reviewer account can take unit 1 from `ai_reviewed` to `published` without the terminal, every edit shows in `content_revisions`, and a student account sees only published content.

### Phase 5 — Native review of units 1–3

- **Do:** generate units 2–3; the native reviews all three in the dashboard; every rejection reason is fed back into the generator prompt or a new linter rule; regenerate; review again.
- **Done when:** units 1–3 are `published`, playable end to end, and the second review pass rejects under 10% of sentences — the signal that the prompt and linters have converged.

### Phase 6 — Scale to the section

- **Do:** units 4–20 through the same loop; the English UI sweep; the TTS listening test and, on a decision, the audio job (`tts.mjs` filling `audio_path` for every published form and sentence); final snapshot.
- **Done when:** section 1 is published with audio, the UI is English, and a new learner can go from the first coin to the checkpoint.

**Parallel tracks** (do not block the phases): notifications reconciliation; figures and mascot art (a 7-line edit once sources exist); mascot rename.

---

## 8. Open items

| Item | State | Owner |
|---|---|---|
| TTS vendor | Listening test: 8 diagnostic sentences (šeísmo, voseo imperatives, final-s) through Azure `es-AR` and two ElevenLabs rioplatense voices, blind | you + a native |
| English UI | Deferred to Phase 6; all strings are in `src/` and rioplatense today | — |
| Notifications | Engine expects web-push keys; Che has Expo tokens + partner reminders. Reconcile after Phase 2 | — |
| Art | Figures and mascot still mora's; `scripts/cutout-figure.py` ready for sources | you |
| Hearts, XP, leagues, placement test | Not in v1. Schema does not preclude them | — |
| Tatoeba | Not used in v1. If ever used, `source='tatoeba'` + `attribution` are already there | — |

---

## Appendix A — Section 1 outline (proposal)

Twenty units, ~12–18 new forms each, 5 lessons per unit (4 lessons + 1 review; unit 20 is a 3-lesson checkpoint). Voseo from the first sentence. PCIC A1 coverage noted per unit. **This is the artifact to argue with** — everything downstream is generated against it.

The full lexicon per unit lives in `docs/course/section-1.yaml`. Encoding it moved a few things so that every sample is sayable with what has been taught by then: `mi` into unit 3, `cerca / lejos` into unit 6, and new samples for units 4, 10 and 20.

| # | Unit | Grammar focus | Vocabulary | Sample target |
|---|---|---|---|---|
| 1 | Hola, che | `ser` 1sg/2sg-vos (`soy`, `sos`); `me llamo` / `te llamás`; `vos`, `yo` | greetings, `che`, `chau`, `dale`, `bien`, `todo bien` | *¿Todo bien, che? — Todo bien, ¿y vos?* |
| 2 | ¿De dónde sos? | `ser` 3sg; `de`; gender of nationality adjectives | countries, nationalities, `argentino/a`, `de acá` | *Soy de Buenos Aires. ¿Y vos de dónde sos?* |
| 3 | ¿Cuántos años tenés? | `tener` 1sg/2sg-vos/3sg; numbers 0–20; `mi` | age, `años`, `hermano/a` | *Tengo veinte años y mi hermana tiene diecisiete.* |
| 4 | La familia | possessives `tu/su`, `mis`; plural `-s/-es`; `tener`, `ser` pl | family, `viejos` (informal), `novio/a` | *Mis viejos son de Rosario.* |
| 5 | Mate y facturas | `gustar` (`me gusta`, `te gusta`, `le gusta`); definite articles | mate, `facturas`, `medialunas`, `milanesa`, `café con leche`, `tomar` | *¿Te gusta el mate amargo o dulce?* |
| 6 | El bondi | `estar` 1sg/2sg-vos/3sg; `hay`; `del`/`al` | `bondi`, `subte`, `parada`, `kiosco`, `cuadra`, `esquina`, `cerca / lejos` | *La parada del bondi está en la esquina.* |
| 7 | ¿Qué hacés? | regular `-ar` present (`-o, -ás, -a, -amos, -an`) | `laburar`, `estudiar`, `tomar`, `hablar`, `caminar` | *Laburo en el centro y estudio a la noche.* |
| 8 | Comés, vivís | regular `-er` / `-ir` present (`-és`, `-ís`) | `comer`, `vivir`, `leer`, `escribir`, `aprender` | *¿Vivís solo o con tu familia?* |
| 9 | La hora | `¿qué hora es?`; `a las…`; `y media / y cuarto`; numbers 20–100 | days, `mañana / tarde / noche`, `temprano`, `tarde` | *Nos vemos a las siete y media.* |
| 10 | Querés, podés, vas | `querer`, `poder`, `ir` (present, all persons taught so far); `ir a` + place | `salir`, `boliche`, `plaza`, `cine` | *¿Querés ir a la plaza o al boliche?* |
| 11 | Dale, vení | affirmative `vos` imperative (`mirá`, `vení`, `escuchá`, `hablá`, `decime`, `andá`) | `dale`, `esperá`, `pasá`, `sentate`, `fijate` | *Vení, sentate, tomamos unos mates.* |
| 12 | Ropa y colores | adjective agreement (gender + number); `ser` for description | colours, `remera`, `zapatillas`, `campera`, `lindo/a`, `re` | *Esa campera es re linda.* |
| 13 | El barrio | prepositions of place; `al lado de`, `enfrente`, `entre` | `verdulería`, `panadería`, `farmacia`, `al lado de`, `enfrente` | *Hay una panadería al lado de la farmacia.* |
| 14 | ¿Cuánto sale? | `¿cuánto sale?`, `cuesta`; numbers 100–1000; `plata`, `mangos` | shopping, `caro / barato`, `efectivo`, `tarjeta` | *¿Cuánto sale el café? — Mil quinientos mangos.* |
| 15 | La rutina | reflexives (`me levanto`, `te levantás`, `se acuesta`); `antes / después de` | routine verbs, `bañarse`, `desayunar`, `finde` | *Los sábados me levanto tarde.* |
| 16 | ¿Qué te gusta hacer? | `gustar / encantar` + infinitive; `también / tampoco` | hobbies, `fútbol`, `la cancha`, `juntarse`, `mirar una serie` | *Me encanta ir a la cancha los domingos.* |
| 17 | Clima | `hace calor / frío`; `está nublado`; `llueve`; seasons (southern) | weather, `paraguas`, `verano en enero` | *Hace un calor bárbaro hoy.* |
| 18 | Ahora | `estar` + gerund; `ahora`, `todavía`, `ya` | `estoy laburando`, `esperando`, `llegando` | *Estoy llegando, esperame.* |
| 19 | Planes | `ir a` + infinitive; `mañana`, `el finde`, `la semana que viene` | plans, `asado`, `juntada`, `quedar en` | *El finde vamos a hacer un asado.* |
| 20 | Repaso · checkpoint | no new grammar; register note on `boludo`, `quilombo`; culture: `che`, mate etiquette | `posta`, `copado`, `pibe`, `laburo` | *Posta, este barrio es re copado.* |

PCIC A1 items deliberately **out** of section 1: past tenses, `ser/estar` full contrast, object pronouns beyond `me/te`, comparatives. They open section 2.

---

## Appendix B — Rioplatense style spec

Given to the generator verbatim and enforced by the linter where it can be.

**Grammar**
- Second person singular is `vos`, always: `sos`, `tenés`, `querés`, `podés`, `vivís`, `hacés`. Imperatives: `mirá`, `vení`, `decime`, `andá`, `sentate`. `tú` and its forms do not exist in this course.
- Second person plural is `ustedes` with third-person verbs. `vosotros` does not exist.
- Simple past over compound for finished events: *hoy comí*, not *hoy he comido* (section 2, but the rule is fixed now).
- `acá / allá` over `aquí / allí`.

**Lexicon** — prefer left, never right: `auto` / coche · `colectivo, bondi` / autobús, camión · `subte` / metro · `celular` / móvil · `computadora` / ordenador · `plata` / dinero (ok but rarer) · `laburo, laburar` / curro, chamba · `pibe, piba` / chaval, chavo · `remera` / camiseta, playera · `zapatillas` / tenis, deportivas · `campera` / chaqueta · `lindo` / bonito · `chau` / adiós · `bárbaro, re` / guay, chido · `finde` / fin de semana (ok) · `boliche` / discoteca · `facturas` / bollería · `frutilla` / fresa · `palta` / aguacate · `ananá` / piña · `choclo` / elote.

**Register**
- `che`, `dale`, `re`, `bárbaro` from unit 1 — they are neutral-informal, not slang.
- `boludo/a` only in unit 20's register note, flagged `informal`, with the warning that it is affectionate among friends and an insult otherwise. Never in a drill sentence.
- No vulgar register in section 1.

**Spelling and punctuation**
- Standard spelling; šeísmo is pronunciation only.
- Opening `¿` and `¡` always. Accents always (`tenés`, `qué`, `está`).

**Content**
- Sentences a person in Buenos Aires would say this week. Concrete, present, small.
- Humour is welcome, sparing, and never at the learner's expense.
- No brand names, no politics, no football clubs (the learner picks a side themselves).

---

## Appendix C — Linters

Each rule is a pure function `(sentence, ctx) → Finding | null`, unit-tested with at least one sentence it must reject. `fail` blocks progress; `flag` is shown to the reviewer.

| Rule | Checks | Severity |
|---|---|---|
| `tokens.resolve` | every token has ≥ 1 `form_id`, each existing and `status ≠ retired` | fail |
| `tokens.integrity` | joined surfaces (minus punctuation) equal `es` normalised | fail |
| `vocab.available` | every form's unit ordinal ≤ the sentence's unit ordinal | fail |
| `target.present` | `target_form_id` appears in tokens | fail |
| `voseo.no_tuteo` | denylist of tuteo-only surfaces: `tú, ti, contigo, tienes, eres, puedes, quieres, vienes, haces, dices, sabes, ven, di, haz, sal, ten, pon, sé, vosotros, os, vuestro…` | fail |
| `lexicon.regional` | denylist from Appendix B's right-hand column | fail |
| `register.max` | no lemma with register above `units.register_max` | fail |
| `length.band` | words ≤ 4 / 7 / 10 / 14 for difficulty 1 / 2 / 3 / 4 | flag |
| `punct.spanish` | `¿`/`¡` paired; no `?` without `¿` | fail |
| `orthography` | only Spanish letters and accents; accents match the lexicon form exactly | fail |
| `dupes` | normalised `es` unique across the course; near-duplicates (edit distance ≤ 2 on ≥ 5 words) flagged | fail / flag |
| `en.sane` | `en` non-empty, contains no Spanish tokens, differs from every `en_alt` | fail |
| `dialogue.shape` | `kind = dialogue` has 2–4 lines, alternating speakers | fail |
| `quota` | per unit: each new form has ≥ 1 intro and ≥ 3 drills approved | flag (unit-level) |
