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
| v1 scope | One section, end to end: 24 units, ~120 lessons, ~1000 sentences. |
| Syllabus | PCIC A1 inventory as a coverage checklist; topic order follows Duolingo's Spanish course (`docs/course/duolingo-structure.md` — structure only, no content), Argentine-first. |
| Content model | Duolingo's: author *sentences*, derive *exercises* mechanically. The derivation engine already exists. |
| Daily loop | Lessons interleave authored content with due material from earlier units, from day one. |
| SRS | Survives (SM-2 per form), feeding the interleave and a separate Practice entry. |
| Drafting | AI drafts under hard constraints → linters → adversarial AI review → native review in a dashboard. |
| Quality gate | Automated checks catch the mechanical; a native signs off on naturalness. |
| Source of truth | The database. A script snapshots the whole course to versioned JSON in the repo. |
| Dashboard | Role-gated routes inside the same Expo app. |
| Lexicon | Lemma + explicit taught forms. `tenés` is a row; `tienes` never exists. |
| Audio | ElevenLabs, two rioplatense voices alternating half and half: Malena (female) and Tomás (male). Every clip records *who* said it, not just where it is — the app will put a figure to the voice. A single-word clip is synthesised with Spanish either side of it (`previous_text`/`next_text`, never spoken): a bare word carries no language, and the model read "mate" as the English one. **A sentence that says who is speaking is read by a voice of that gender** — "Soy Martín" is never Malena. The test is the token right after a first-person verb (`soy`, `estoy`, `me llamo`) and the `features.gender` it carries, so a name, an adjective ("Soy argentina") or a noun all cast the line; merely naming someone ("Gracias, Sofi") does not. The free lines then go to whichever voice has said least, so the forced ones are absorbed rather than skewing the split. `speakerGender`/`assignVoices` in `scripts/course/lib/tts.mjs`, tested in `scripts/course/test/voices.test.mjs`; a clip whose stored voice contradicts the rule is re-recorded by the next `course:tts` run without `--force`. |

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
- `es_alt[]` — other Spanish accepted when the sentence is built from its English (as built, 2026-09-15). English underdetermines Spanish, so a build that accepts only `es` marks right answers wrong. The content build fills it: the author's alternatives (other word orders) plus generated ones (`scripts/course/lib/accept.mjs`) — a subject pronoun dropped before its verb or added at the start of its clause (`él`/`ella` only when the English says he/she), an optional `che`, and the other gender of an adjective when only "I"/"you" are in the sentence and the English has no gender cue. Stored, so the reviewer sees and prunes exactly what the app accepts. Transcribing audio accepts only `es`.
- `loose[]` (authoring only) — words the English translates idiomatically ("¿Cómo te llamás?" → "What's your name?")
- `tokens` — the sentence split into surfaces, each pointing at the form(s) it is: `[{surface:"¿Tenés", form_ids:[…]}, {surface:"mate?", form_ids:[…]}]`. Each token also carries `gloss`: the words of `en` that translate it in this sentence (`bien` in "¡Bien hecho!" = "Well done!" → "well"; a phrase token gets the whole expression). Filled by `npm run course:gloss` (as built, 2026-09-18 — `scripts/course/lib/gloss.mjs`): a model aligns the tokens, and a gloss is stored only if it is whole words of `en`. The app reads a word's meaning off its sentences (`src/lib/meanings.ts`) instead of printing `gloss_en`, which is a dictionary entry ("well, fine, good"): the tap popover shows the token's gloss, and every screen that shows one meaning shows the one she has met, passing over a meaning another word in reach also has. A typed answer that is another word with the meaning shown is accepted with a `synonym` note. Editing `en` in the dashboard drops the glosses, so the next `course:gloss` run re-aligns the sentence.
- `kind` — `word` · `phrase` · `sentence` · `dialogue`
- `difficulty` 1–4 — an authoring band (words and clauses, Appendix C), not a runtime gate: what a learner is asked to rebuild from tiles is decided by her own ceiling (`Ladder.buildTiles`), not by this number — `status`, `source`, `audio_path`, `voice_id` (who says the clip — the two travel together, so a sentence never claims a speaker for a recording it no longer has)

A sentence is legal iff every token resolves to a form available in its unit. That is checkable by machine, and it is the property that makes exercise derivation safe.

### 1.4 Derived exercises

Nothing here is new: `sentences.ts` and `session.ts` already turn a sentence plus tokens into `sentence_meaning`, `sentence_gap`, `sentence_build`, `sentence_listen`, tiles, distractors and miss-detection; word modes (`flashcard`, `multiple_choice`, `listen`, `typing`, `word_build`, `matching`, `true_false`) already derive from a form and its neighbours. The lesson runtime is a **second producer** of the `SessionData` shape `practice.tsx` consumes — `buildSession` stays as the Practice-hub producer.

One small addition: a `tip` exercise mode with a plain note screen.

**Answer rules (as built, 2026-09-15 — `src/lib/answers.ts`, tested in `scripts/course/test/answers.test.mjs`).** Three invariants across every exercise:

1. *Anything that answers the prompt is accepted.* Sentence builds match any of `es` + `es_alt`, word for word. A word typed or built from its English also accepts forms of the same lemma glossed identically (argentino/argentina for "Argentinian").
2. *Nothing that would be a right answer is offered as a wrong one.* Two forms "share a meaning" when their glosses share a comma-separated sense (bien "well, fine, good" / bueno "well, OK"). No gap option, tile, multiple-choice option, true/false imposter or matching pair shares a meaning with the answer or with each other; no gap option turns the sentence into an `es_alt`; no meaning option is a sentence saying the same thing in synonyms ("Dale, chau." / "Bueno, chau.").
3. *No prompt prints its own answer* (as built, 2026-09-17). A word whose English is the word itself — mate, cortado, empanada — cannot be translated in either direction, so it gets none of the exercises that cross between the two sides: no word build, typing, multiple choice, true/false, matching tile or placement question. It is heard and spelt where there is a recording (`listen`, `listen_build`), and otherwise drilled inside its sentences, where word order and the rest of the sentence are what is tested. A word that only *looks* self-glossed because a sentence rendered it as itself ("medialuna" for `medialuna`) shows its dictionary gloss instead ("croissant") and keeps every exercise. `selfGlossed` in `answers.ts`; `exercisesFor` in `session.ts`.

More than one right answer for a typed word (as built, 2026-09-18). *Rules* (`companions` in `answers.ts`): a conjugated verb may come with the subject pronoun that agrees with it, and a pronominal verb with its clitic ("yo soy", "yo me llamo"; third person as the English names it: "he/she is" takes él or ella, not usted; never an imperative); a noun with a recorded gender with the article that agrees ("una medialuna"; not a feminine noun starting with a/ha, which may take el). *Stored* (`form_answers`, migration `20260918000004`): what doesn't follow from the grammar ("buenas" for hola, "hi"), keyed by the meaning the prompt shows, drafted by `npm run course:answers`, checked against the tuteo and regional denylists, never another course word with another meaning, never something the app already accepts; retired from `/admin/answers`. The same run proposes other tile orders for sentences and adds the ones buildable from the sentence's own tiles to `es_alt`. Each ask is logged in `content_reviews` (`notes.kind` = `answers` / `alternatives`), so a later run only asks about new meanings and changed sentences.

Forgiveness: tiles can't be mistyped, so builds are exact. Typing forgives one edit only in words of ≥ 5 letters, and never when the typed text is itself a course word (soy/sos, es/él). A wrong build blames only the words missing from the closest accepted answer. Set phrases split into word tiles, and a phrase's gap is answered among phrases. When a build is right but not `es`, the feedback shows `es` too.

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
  ordinal       smallint not null,           -- place in its section: "Section 2, Unit 3"
  course_order  smallint not null unique,    -- place in the whole course; what "taught by now" is measured on
  slug          text not null unique,
  title_en      text not null,
  summary_en    text not null,                -- one line, shown on the path
  grammar_focus text[] not null,              -- PCIC-style tags, e.g. '{ser.presente.vos, articulo.definido}'
  register_max  text not null default 'informal',  -- highest register a sentence here may use
  status        content_status not null default 'draft',
  unique (section_id, ordinal)
);

create table lessons (              -- kind: lesson | practice | story | listening | review | checkpoint
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

-- The speakers the course is recorded in. A clip points at one of these, so the
-- app can put the right figure beside a line rather than guess from a filename.
create table voices (
  id          text primary key,              -- 'malena', 'tomas'
  name        text not null,
  gender      text not null check (gender in ('female','male')),
  accent      text not null default 'rioplatense',
  provider    text not null default 'elevenlabs',
  provider_id text not null,                 -- the vendor's voice id
  model       text not null default 'eleven_multilingual_v2',
  status      content_status not null default 'published'
);

create table forms (
  id        uuid primary key default gen_random_uuid(),
  lemma_id  uuid not null references lemmas on delete cascade,
  form      text not null,                    -- 'tenés'
  features  jsonb not null default '{}',      -- {person:2, number:'sg', tense:'pres', mood:'ind', voseo:true}
  gloss_en  text,                             -- overrides lemma gloss when the form needs it ('you have')
  unit_id   uuid not null references units,   -- the unit that teaches this form
  audio_path text,
  voice_id  text references voices,          -- who says it
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
  voice_id       text references voices,     -- who says it
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

**How much a build may ask for** (as built, 2026-09-18 — `sentences.ts`). Reading a sentence and rebuilding it from tiles are different jobs: the tiles carry no punctuation, so nothing marks where one clause ends, and every extra tile multiplies the orders she has to rule out. So the build has a ceiling of its own, and it is **not** the sentence's `difficulty`, which is an authoring band.

- `Ladder.buildTiles` — tiles she may be asked to order at once. It starts at 4 and grows by one per ten passed sentence screens up to 14 (the top of the word band, so nothing is permanently out of reach), and the ladder's offset moves it a tile either way with everything else.
- `BUILD_CLAUSE_MAX = 2` — clauses she is ever asked to order from tiles, at any rung. Two short ones are an exchange she can hear; three, with nothing between them, is a shuffle.
- Over either ceiling, `buildableClause` picks the clause holding the word being drilled, and the build asks for **that clause only**, with the rest of the sentence written out around it (`SessionItem.clause`, `clauseOf` in `answers.ts`, `ClauseContext` in `exercises.tsx`). It wears no "Harder" badge: it is the step taken *instead* of the full build.
- A sentence over the ceiling with no clause small enough to stand in — one long clause — stays at `sentence_gap`, where the words are in view and only one has to be produced. It is not promoted out of it, and `sentence_listen` is skipped: the audio says the whole sentence, which is the part she was spared.

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
| Outline | `seed-outline.mjs` | `docs/course/section-*.yaml` (Appendix A, human-authored) | `sections`, `units`, `lessons` (empty), `tips`, `lemmas`, `forms` | `draft` |
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
| `/admin/words` | Every word with its sentences, edited in place: spelling, meaning, grammar, accepted answers, move, retire, add; sentences with pause reasons and hand glosses; an exercise preview. *As built (2026-09-18):* see `docs/superplan-admin-palabras.md`. `/admin/lexicon` redirects here |
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

- **Do:** Finalise Appendix A (section-1 outline: 24 units, grammar, forms) and Appendix B (rioplatense style spec) with a native reader. Encode the outline as `docs/course/section-1.yaml` including the lemma/form list per unit.
- **Done when:** a native has read both appendices and signed off; the YAML validates; every PCIC A1 inventory item in scope maps to a unit.
- **Built:** `docs/course/section-1.yaml`, `section-2.yaml`, `section-3.yaml` — 30 units across three sections, 364 lemmas, 589 forms, 150 lessons, tips, and a sample sentence per unit that must be sayable with what's been taught. *Since 2026-09-18 the database is the source of truth* (`docs/superplan-admin-palabras.md` §7.2): the YAML only adds new units (`course:seed` inserts, never overwrites or retires), the pipeline reads the vocabulary from the database, and `npm run course:parity` lists where the two differ. `npm run course:validate -- --yaml` checks the files (tuteo, vos tags, regionalisms, register, samples); `npm run course:test` holds the rejection cases. Shared tooling in `scripts/course/lib/`. Not yet read by a native.

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

- **Do:** units 4–24 through the same loop; the English UI sweep; the audio job — `npm run course:tts -- <unit-slug>` fills `audio_path` and `voice_id` for every published form and sentence; final snapshot.
- **Done when:** section 1 is published with audio, the UI is English, and a new learner can go from the first coin to the checkpoint.
- **State (2026-09-18):** section 1 — units 1–10 — is published and glossed. Audio covers units 1–6; units 7–10 are recorded-pending (~344 clips), stopped before they ran at the author's word.

  Four things the loop taught, all now in the scripts rather than in someone's memory:
  - A word can be introduced by a unit and never said in it. Proper nouns are never generation targets, so unit 5 taught six places and its first draft used two. The generation prompt now names a unit's non-target new words and asks for them; `course:agent -- publish` reports any that are still never said — counting the unit's whole published set, not just the run's, so a pass that fills one gap does not report every other word as missing.
  - A word can be introduced where nothing can use it. `qué` sat in unit 4, which has no verb for it to question, so every sentence it could carry was a bare "¿Qué?" asking for a repeat — curt in Buenos Aires, where "¿Cómo?" does that job. It moved to unit 15, the unit named for the question it could not ask (migrations `20260918000009`, `20260918000010`). The same thing happened to `cuántas` in unit 9, whose only plural noun is the masculine `años`: it moved to unit 10 and its four feminine plurals (`20260918000011`, `20260918000012`). A lemma may now straddle two units — the unit belongs to the form, not the lemma.
  - The generator's list of free names was a lie. It offered "Facu, Caro", but `facu` is taught in unit 18 and `caro` in unit 26, and the tokenizer does not care about the capital letter, so every sentence built on either name died in the check as a word from a far-off unit — about a fifth of some batches. The cast is now read off the lexicon: a person is a proper noun the outline gave a gender to, which is exactly what distinguishes Sofi from Rosario. With that fixed, one unit-9 batch went from 11 of 48 passing to 48 of 48.
  - A gloss can be the problem. Every sentence the writer built on `kiosco` was rejected, all for the English: "kiosk" makes an English speaker picture a newsstand. It joined `cortado`, `mate` and `medialuna` as a word the course keeps and explains in a note (`20260918000013`).

  **A targeted second pass**: when one word comes out short, re-run `prompts`, replace the batches you do not want with `{"sentences":[]}`, and write only the one batch that matters. The unit's existing sentences are already in `existing`, so nothing duplicates.

**Parallel tracks** (do not block the phases): notifications reconciliation; figures and mascot art (a 7-line edit once sources exist); mascot rename.

---

## 8. Open items

| Item | State | Owner |
|---|---|---|
| TTS vendor | **Decided: ElevenLabs**, Malena + Tomás (`voices`, migration `20260918000007`). Account on Basic; units 1–6 recorded, 143 clips, 604 credits for units 4–6 | you |
| Units 7–10 audio | **Not recorded.** 344 clips, roughly 3,500 credits at the rate units 4–6 ran at — which is itself the correction to the old "~2,400 characters for all of section 1" estimate, low by more than an order of magnitude. `npm run course:tts -- <slug>` for `argentino-argentina`, `la-familia`, `cuantos-anos-tenes`, `en-el-kiosco` when you want them | you |
| One silent line in unit 3 | "Che, ¿sos vos? ¿Todo bien?" was edited (it used to chain three greetings and failed `clause.count`), so its recording no longer said it and went with the text. `npm run course:tts -- vos-y-sos` records the one clip; until then unit 3 is 7 of 8 | you |
| `Argentina` never said | Unit 5 teaches it and no sentence uses it. Not a generation failure: in Buenos Aires you name the city or the barrio, not the country, so the judge rejects "Soy de Argentina" as textbook. Either keep it as a word to recognise or drop it from the unit | you |
| Voice sign-off | Once recording is possible: unit 1 through both voices, listened to by a native for šeísmo, voseo imperatives and final-s before the rest of the section is recorded | you + a native |
| English UI | Deferred to Phase 6; all strings are in `src/` and rioplatense today | — |
| Notifications | Engine expects web-push keys; Che has Expo tokens + partner reminders. Reconcile after Phase 2 | — |
| Art | Figures and mascot still mora's; `scripts/cutout-figure.py` ready for sources | you |
| Hearts, XP, leagues, placement test | Not in v1. Schema does not preclude them | — |
| Tatoeba | Not used in v1. If ever used, `source='tatoeba'` + `attribution` are already there | — |

---

## Appendix A — The A1 outline (proposal)

Three sections of ten units, 5 lessons per unit, ~12–25 new forms each. Voseo from the first sentence. **This is the artifact to argue with** — everything downstream is generated against it. The full lexicon per unit lives in `docs/course/section-1.yaml`, `section-2.yaml` and `section-3.yaml`.

*Changed 2026-09-15:* compared against Duolingo's course structure, four topics it teaches in A1 were missing and were added where Duolingo places them, as far as the grammar order allows — ordering, emotions, school and work, home.

*Re-sliced 2026-09-16,* after reading Duolingo's own section 1 unit by unit (`docs/research/duolingo-spanish-section-1.md`). What changed and why:

- **Three sections instead of one.** Their A1 is three sections of ten units; ours was one run of 24. A unit now carries two numbers — its place in its section, which the path shows, and its place in the course, which every "taught by now" check uses.
- **One grammar point per unit early on.** Duolingo's first units teach one thing each and introduce a verb one person at a time. Our old unit 1 taught seven things at once; it is now four units (greetings and `soy`; `vos` and `sos`; `me llamo` / `te llamás`; `ser de`). `es` and `él/ella` get their own unit, and so does the gender of nationality adjectives.
- **A transaction first.** Their unit 1 is ordering at a café with a fixed phrase and no verb forms at all. Ours is now `Un café, por favor` — food and drink words, `y` / `o`, `un` / `una` as glue. Greetings move to unit 2.
- **Units are named for what the learner can do,** in English, with the Argentine phrase as the subtitle: "Order at a café" / *Un café, por favor*.
- **Room for the lesson mix.** `lessons.kind` now also allows `practice`, `story` and `listening`, for the units to hold once those exist. Today every lesson is still `lesson` or `review`.

| Section | Units |
|---|---|
| 1 · A1.1 | Order at a café · Greet people · Talk to someone as vos · Ask someone's name · Say where you're from · Talk about someone else · Say what people are · Introduce your family · Say your age · Buy at the kiosco |
| 2 · A1.2 | Talk about more than one person · Say where something is · Say what there is around you · Say how you feel · Talk about what you do · Say what you like · Ask for what you want · Study and work · Eat, live, read and write · Show someone your place |
| 3 · A1.3 | Tell the time · Find your way around the barrio · Say what you want to do · Tell a friend what to do · Describe clothes and colours · Ask what it costs · Talk about your routine · Talk about your free time · Talk about the weather · Say what's happening and what's next |

The table below is the grammar and vocabulary of the 24 units this was sliced from; the section files are now the source of truth for which unit teaches what.

| # | Unit | Grammar focus | Vocabulary | Sample target |
|---|---|---|---|---|
| 1 | Hola, che | `ser` 1sg/2sg-vos (`soy`, `sos`); `me llamo` / `te llamás`; `vos`, `yo` | greetings, `che`, `chau`, `dale`, `bien`, `todo bien` | *¿Todo bien, che? — Todo bien, ¿y vos?* |
| 2 | ¿De dónde sos? | `ser` 3sg; `de`; gender of nationality adjectives | countries, nationalities, `argentino/a`, `de acá` | *Soy de Buenos Aires. ¿Y vos de dónde sos?* |
| 3 | ¿Cuántos años tenés? | `tener` 1sg/2sg-vos/3sg; numbers 0–20; `mi` | age, `años`, `hermano/a` | *Tengo veinte años y mi hermana tiene diecisiete.* |
| 4 | La familia | possessives `tu/su`, `mis`; plural `-s/-es`; `tener`, `ser` pl | family, `viejos` (informal), `novio/a` | *Mis viejos son de Rosario.* |
| 5 | Mate y facturas | `gustar` (`me gusta`, `te gusta`, `le gusta`); definite articles | mate, `facturas`, `medialunas`, `milanesa`, `café con leche`, `tomar` | *¿Te gusta el mate amargo o dulce?* |
| 6 | ¿Me traés un café? | `querer` 1sg/2sg-vos for ordering; `¿me traés…?`; `para`, `sin` | `mozo/a`, `la cuenta`, `cortado`, `empanada`, `tostado`, `jugo`, `por favor` | *Hola, ¿me traés un cortado y dos medialunas, por favor?* |
| 7 | El bondi | `estar` 1sg/2sg-vos/3sg; `hay`; `del`/`al` | `bondi`, `subte`, `parada`, `kiosco`, `cuadra`, `esquina`, `cerca / lejos` | *La parada del bondi está en la esquina.* |
| 8 | ¿Cómo estás? | `estar` + state adjectives (gender); `estar` 1pl/3pl; `porque`; `medio` as softener | `cansado/a`, `contento/a`, `nervioso/a`, `enojado/a`, `ocupado/a`, `triste`, `feliz`, `tranqui`, `más o menos` | *¿Cómo estás? Medio cansada, pero bien.* |
| 9 | ¿Qué hacés? | regular `-ar` present (`-o, -ás, -a, -amos, -an`) | `laburar`, `estudiar`, `tomar`, `hablar`, `caminar` | *Laburo en el centro y estudio a la noche.* |
| 10 | Facu y laburo | `tener que` + infinitive; `ser` + profession without article | `facu`, `clase`, `examen`, `materia`, `profesor/a`, `compañero/a`, `jefe/a`, `oficina`, `laburo` | *Tengo que estudiar para un examen.* |
| 11 | Comés, vivís | regular `-er` / `-ir` present (`-és`, `-ís`) | `comer`, `vivir`, `leer`, `escribir`, `aprender` | *¿Vivís solo o con tu familia?* |
| 12 | Mi casa | `hay` / `tener` for rooms; `alquilar` | `depto`, `pieza`, `ambientes`, `cocina`, `baño`, `living`, `balcón`, `heladera`, `sillón` | *Alquilo un depto con dos piezas y un balcón.* |
| 13 | La hora | `¿qué hora es?`; `a las…`; `y media / y cuarto`; numbers 20–100 | days, `mañana / tarde / noche`, `temprano`, `tarde` | *Nos vemos a las siete y media.* |
| 14 | Querés, podés, vas | `querer`, `poder`, `ir` (present, all persons taught so far); `ir a` + place | `salir`, `boliche`, `plaza`, `cine` | *¿Querés ir a la plaza o al boliche?* |
| 15 | Dale, vení | affirmative `vos` imperative (`mirá`, `vení`, `escuchá`, `hablá`, `decime`, `andá`) | `dale`, `esperá`, `pasá`, `sentate`, `fijate` | *Vení, sentate, tomamos unos mates.* |
| 16 | Ropa y colores | adjective agreement (gender + number); `ser` for description | colours, `remera`, `zapatillas`, `campera`, `lindo/a`, `re` | *Esa campera es re linda.* |
| 17 | El barrio | prepositions of place; `al lado de`, `enfrente`, `entre` | `verdulería`, `panadería`, `farmacia`, `al lado de`, `enfrente` | *Hay una panadería al lado de la farmacia.* |
| 18 | ¿Cuánto sale? | `¿cuánto sale?`, `cuesta`; numbers 100–1000; `plata`, `mangos` | shopping, `caro / barato`, `efectivo`, `tarjeta` | *¿Cuánto sale el café? — Mil quinientos mangos.* |
| 19 | La rutina | reflexives (`me levanto`, `te levantás`, `se acuesta`); `antes / después de` | routine verbs, `bañarse`, `desayunar`, `finde` | *Los sábados me levanto tarde.* |
| 20 | ¿Qué te gusta hacer? | `gustar / encantar` + infinitive; `también / tampoco` | hobbies, `fútbol`, `la cancha`, `juntarse`, `mirar una serie` | *Me encanta ir a la cancha los domingos.* |
| 21 | Clima | `hace calor / frío`; `está nublado`; `llueve`; seasons (southern) | weather, `paraguas`, `verano en enero` | *Hace un calor bárbaro hoy.* |
| 22 | Ahora | `estar` + gerund; `ahora`, `todavía`, `ya` | `estoy laburando`, `esperando`, `llegando` | *Estoy llegando, esperame.* |
| 23 | Planes | `ir a` + infinitive; `mañana`, `el finde`, `la semana que viene` | plans, `asado`, `juntada`, `quedar en` | *El finde vamos a hacer un asado.* |
| 24 | Repaso · checkpoint | no new grammar; register note on `boludo`, `quilombo`; culture: `che`, mate etiquette | `posta`, `copado`, `pibe`, `laburo` | *Posta, este barrio es re copado.* |

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
- `boludo/a` only in the checkpoint unit's register note, flagged `informal`, with the warning that it is affectionate among friends and an insult otherwise. Never in a drill sentence.
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

`course:lint` runs them over a unit's **drafts**, so a rule written after a sentence was approved would never reach it. The shape rules therefore also run as a whole-course sweep in `npm run course:validate`, over every sentence the database holds that isn't retired — which is how the three-clause chain already published in unit 3 surfaced.

| Rule | Checks | Severity |
|---|---|---|
| `tokens.resolve` | every token has ≥ 1 `form_id`, each existing and `status ≠ retired` | fail |
| `tokens.integrity` | joined surfaces (minus punctuation) equal `es` normalised | fail |
| `vocab.available` | every form's unit ordinal ≤ the sentence's unit ordinal | fail |
| `target.present` | `target_form_id` appears in tokens | fail |
| `voseo.no_tuteo` | denylist of tuteo-only surfaces: `tú, ti, contigo, tienes, eres, puedes, quieres, vienes, haces, dices, sabes, ven, di, haz, sal, ten, pon, sé, vosotros, os, vuestro…` | fail |
| `lexicon.regional` | denylist from Appendix B's right-hand column | fail |
| `register.max` | no lemma with register above `units.register_max` | fail |
| `length.band` | words ≤ 4 / 7 / 10 / 14 for difficulty 1 / 2 / 3 / 4 — *built*, in `checkShape` | flag |
| `clause.count` | sentences-in-one ≤ 2 / 2 / 2 / 3 for difficulty 1 / 2 / 3 / 4. A word count alone rewards chaining: "Che, ¿sos vos? ¡Hola! ¿Todo bien?" is six words and passes the band, and is three greetings a beginner has to order with the punctuation stripped off. An exchange — a question and its answer — is two and stays legal. *Built*, in `checkShape` | fail |
| `punct.spanish` | `¿`/`¡` paired; no `?` without `¿` | fail |
| `orthography` | only Spanish letters and accents; accents match the lexicon form exactly | fail |
| `dupes` | normalised `es` unique across the course; near-duplicates (edit distance ≤ 2 on ≥ 5 words) flagged | fail / flag |
| `en.sane` | `en` non-empty, contains no Spanish tokens, differs from every `en_alt` | fail |
| `en.covers` | every token that isn't optional, glue or a name has a gloss word (stems, contractions opened) in `en`, unless listed in `loose` — *built* | fail |
| `es_alt.legal` | every authored `es_alt` passes the same vocabulary / voseo / regional / register checks as `es` — *built* | fail |
| `gloss.overlap` | two drillable forms of different lemmas share a gloss sense — *built*, in `course:validate` | flag |
| `dialogue.shape` | `kind = dialogue` has 2–4 lines, alternating speakers | fail |
| `quota` | per unit: each new form has ≥ 1 intro and ≥ 3 drills approved | flag (unit-level) |
