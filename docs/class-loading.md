# Posta — Opening a class

Status: **phases 0, 1, 2 and 3a built 2026-10-13, and the loading path's UX pass (§5b). Phone
numbers in §5; phase 2's and §5b's not taken yet. Phases 3b and 3c not started.** Companion to `docs/content-on-device.md` (what is
downloaded and kept) and `docs/launch-and-loading.md` (the cold start and the tabs).
Written so any model or person can pick the work up mid-way.

---

## 0. The decision

> **A class is built from two kinds of thing: the course (the same for everyone, changes only on a
> publish) and her records (hers, change with every answer). Everything worked out from the course
> alone is worked out once and kept. Her records are still read fresh from the server on every
> open, exactly as today.**

Not chosen, and why:

- **Keeping her records on the phone and patching them after each round.** It would also save the
  network trips, but a round's writes are fire-and-forget (`round.ts`), `finish_lesson` and
  `apply_placement` change rows on the server, and she may have a second device. A patched copy
  that drifts shows wrong reviews and wrong difficulty, silently. The profile below shows the
  expensive part is not her records anyway.
- **Having the database keep her sums** (glue seen, screens passed, how often she met each
  meaning), so a class loads only its own unit. This is the fix that makes a class cost the same
  at unit 400 as at unit 4, but it moves learning logic to the server and keeps two copies in
  agreement. Revisit when §2's device numbers say the part that grows is what hurts (see §6).

## 1. What opening a class does today

`practice.tsx` → `buildLesson` (`lesson.ts`) → `loadLearner` (`session.ts`), then `resolveSlots`.

| step | where | course or hers | kept between classes? |
|---|---|---|---|
| version stamps | `content-cache.ts` `contentVersion` | course | yes, 5 min |
| lexicon, tallies, course | `versioned(...)` | course | yes (memory + disk) |
| sentence blocks up to the class's unit | `sentences.ts` `loadSentenceRowsInReach` | course | yes (memory + disk) |
| `form_states`, paged | `session.ts:233` | hers | no — every open |
| `sentence_states`, paged | `sentences.ts` `loadSentenceStates` | hers | no — every open |
| last 5 rounds, `placed_through` | `session.ts:234-241` | hers | no — every open |
| the lesson's slots | `lesson.ts` `readLessonRows` | course (premium-gated) | no — every open |
| merge + sort rows, `toSentence` on each | `sentences.ts:115-190` | course, plus her record attached | **no** |
| `withMeanings` over the lexicon | `meanings.ts:296` | course, plus her `met` counts and `reached` | **no** |
| ladder, `glueSeen`, `resolveSlots` | `session.ts`, `lesson.ts` | hers | no (cheap) |
| the door: streak gate + first clip (≤ 900 ms) | `practice.tsx:283-323` | hers | no |

The two rows in bold are course work redone from nothing on every open.

## 2. Measured

Node 24 on the dev Mac, the app's own functions over `content/snapshots/2026-10-06` (466 units,
27,054 sentences, 4,440 forms), a learner who has done everything before the class's unit.
**Not measured: the phone, and anything on the network** (the anon key reads no rows).

CPU per class open, with the real gloss tallies:

| class in unit | sentences in reach | block JSON | parse blocks* | sort + `toSentence` | `withMeanings` | ladder + slots | total |
|---|---|---|---|---|---|---|---|
| 8 | 323 | 0.2 MB | 1 ms | 3 ms | ~1,100 ms | 30 ms | ~1.1 s |
| 100 | 5,743 | 4.9 MB | 35 ms | 34 ms | ~950 ms | 47 ms | ~1.1 s |
| 200 | 11,491 | 10.0 MB | 56 ms | 52 ms | ~950 ms | 52 ms | ~1.1 s |
| 300 | 17,474 | 15.4 MB | 94 ms | 120 ms | ~820 ms | 77 ms | ~1.1 s |
| 466 | 27,054 | 24.3 MB | 133 ms | 262 ms | ~900 ms | 134 ms | ~1.4 s |

\* once per app launch, not per class.

Two findings:

1. **`withMeanings` is most of it, and it is flat** — about a second in Node on every class, the
   first unit included. It depends on the whole lexicon and the whole course's tallies, not on how
   far she is. The CPU profile puts nearly all of it in pure string helpers called again and again
   with the same arguments: `allWords` (a chain of regex replaces), `slotsOf`, `senseBehind` /
   `standsAlone`, and `closeness` — which runs inside a sort comparator, and `meaningsOf(f)` runs
   three times per form.
2. **The part that grows with progress is small on the CPU**: about 0.03 s at unit 8, 0.2 s at unit
   200, 0.5 s at unit 466. So the CPU alone does not explain "later classes are much slower". What
   also grows, unmeasured: her paged rows (≈ 4 round trips in a row at 11k shown sentences), and
   sentence blocks not yet on the phone when she opens a class ahead of where she is (the home
   prefetch only warms up to her current unit — unit 200 from nothing is 25 blocks, ~10 MB).

A trial of the first fix, in a scratch copy of `meanings.ts` (three helpers memoized, nothing else
changed):

| | `withMeanings`, first call of a launch | every call after |
|---|---|---|
| today | ~900–1,700 ms | ~800–1,100 ms |
| helpers memoized | ~150–400 ms | ~190–300 ms |

## 3. The plan

Four phases. Each ships alone. Phase 0 decides how far past phase 1 to go.

### Phase 0 — Measure on the phone (small) — built, numbers pending

Without this the rest is aimed by a Mac benchmark.

- `src/lib/load-timing.ts`: a `timed(label, promiseOrFn)` helper that does nothing unless
  `__DEV__`. One `console.log` line per class open, e.g.
  `class open 2140 ms — version 40 · states 310 (2 pages) · shown 620 (12 pages) · blocks 25 (0 net, 25 disk) 480 · shape 210 · meanings 3900 · ladder 30 · slots 180 · resolve 60 · gate 150 · first clip 400`.
- Wrap: the seven loads in `loadLearner`'s `Promise.all`, the bounded sentence load, `toSentence`,
  `withMeanings`, the ladder, `readLessonRows`, `resolveSlots`, and in `practice.tsx` the streak
  gate and the first clip. `all()` (`fetch-all.ts`) reports pages; `stored()` reports
  memory / disk / network.
- `scripts/engine/bench-class-load.mjs` (`npm run engine:bench`) re-runs §2 after each phase: the
  first class of a launch and the next one, per unit. Give it another checkout's root to time that
  one instead.
- As built: `timed(name, work, note?)` / `timingStart` / `timingEnd` in `load-timing.ts`;
  `contentSources` in `content-cache.ts` counts pieces from memory / disk / network, which the
  `sentences` step prints. Paged loads print their row count (1,000 rows a page).
- **Record, on a release-like build (not Expo dev) on a real iPhone:** a class in unit ~5, ~100,
  ~200, each opened twice (first of the launch, then again), on an account that is really there
  and on one that jumps ahead. Paste the lines into §5.

### Phase 1 — Do the course's work once (small, the main win) — built

No behaviour change: same screens, same meanings, same order.

**1a. Memoize the pure string helpers in `meanings.ts`.**
`allWords(text)`, `slotsOf(sense)`, `standsAlone(meaning, gloss)`, `closeness(meaning, gloss)` are
pure functions of course strings. Keep their answers in module-level `Map`s (two-string keys joined
with `\u0000`). Bounded by the course's distinct glosses (tens of thousands of short strings);
cleared in `clearContentCache()` so staff edits don't pile up. Inside `withMeanings`, compute
`meaningsOf(f)` once per form and reuse it for `owners`, `bareOwners` and the final pick.

**1b. Reshape each sentence once.**
`toSentence` splits a row's tokens into content / glue / names from the lexicon; only `shown` is
hers. Split it: `sentenceBase(row, formById)` (cached in a `WeakMap<SentenceRow, …>` held per
lexicon array, so a new lexicon starts clean) and `toSentence` = `{ ...base, shown }`.
A fresh outer object per open is required — `recordShown` writes `sentence.shown` in place, and a
round must not see the last round's object. `tokens` and `form_ids` are shared between opens;
nothing in `src/` mutates them today (checked), and the test in §4 keeps it so.

**1c. Keep the merged, sorted row list.**
`loadSentenceRowsInReach` rebuilds a `Map` and sorts by id on every call. Remember the last result
keyed by the identity of the block arrays plus the by-id rows; a new block or a refreshed one
makes a new key.

As built: `memo` / `memo2` / `clearMeaningMemos` in `meanings.ts` (also over `senseBehind`;
`allWords` hands back a frozen list); `sentencesOf` / `shapesFor` and `lastMerge` in
`sentences.ts`; `onContentCleared` in `content-cache.ts`, which `session.ts` and `sentences.ts`
register with.

Result (`npm run engine:bench`, Node, CPU per class in ms — one run each, so ±20%):

| unit | before: first class | before: next class | after: first class | after: next class |
|---|---|---|---|---|
| 8 | 1,064 | 1,013 | 301 | 233 |
| 100 | 1,132 | 1,206 | 705 | 251 |
| 200 | 1,166 | 1,211 | 451 | 211 |
| 300 | 1,023 | 784 | 573 | 317 |
| 466 | 1,378 | 1,074 | 1,276 | 372 |

What is left of a "next class" is `withMeanings` itself (~160–270 ms): building who-owns-which-
meaning over the lexicon and picking each word's meaning, which depend on her `met` counts and
`reached`. Checked against the code before the change over the whole 2026-10-06 snapshot —
learners at units 8 / 100 / 200 / 466, two different records each, with and without tallies:
**0 differences** in 71,040 form meanings and 88,650 sentences.

### Phase 2 — Be ready before she taps (small) — built, not yet measured

As built: `warmClass` in `prefetch.ts`, run once per launch after `warmSentences`, for the unit
of the lesson she is on; a development build logs `[warm] class ready in … ms`. No slicing and no
`runAfterInteractions` yet (it already starts 400 ms after the splash and behind the block
fetch) — add them if Course stutters while it runs. The plan as written:


- In `prefetch.ts`, after `warmSentences`: build the learner for the class she is on —
  `loadLearner(userId, { throughOrder, unitIds })` for `course.path[currentIndex]` — and **throw the
  result away**. Its only purpose is to fill the caches of phase 1 and parse the blocks, all of
  which are course data, so nothing stale can come of it. The class she taps still reads her
  records fresh.
- Run it after the first frame of Course and after `prefetchTabs`' own work
  (`InteractionManager.runAfterInteractions`), so it never competes with the road painting.
- If phase 0 shows a visible stutter on Course while it runs: warm in slices — fill the `meanings`
  memos a few hundred forms at a time, yielding between slices — instead of one long call.
- Again on returning from a class is not needed: the caches are already warm.

### Phase 3 — The network that grows (only if phase 0 says so)

Pick by the numbers; each is independent.

- **3a. Her paged rows in one trip — built.** §5 put `states` at over half the wait: 2,719 rows
  are three pages, read as page 0 and then the rest, every column. Now `all()` takes
  `{ remember }`: how many pages a named query took is kept (memory, and AsyncStorage for the
  first class of the next launch) and next time they all go at once. A stale count costs an empty
  page or a second trip, never a row (`scripts/engine/test/fetch-all.test.mjs`). `form_states`
  and `sentence_states` are named, read without `user_id`, and each page is timed
  (`states p0 …`). **To decide from the next numbers:** if `states` is ~300–500 ms, done; if
  still ≥ 800 ms the weight of the rows is the cost, and the fix is to keep her rows in memory
  and fetch only those changed since (`updated_at`), with a full read once per launch — not a
  single RPC, which would send the same rows.
- **3b. A class ahead of her needs fewer blocks.** Today the reach is every unit up to the class's.
  A review or recap can only use sentences for words she has a state for, so the reach can be
  "as far as she has got or was placed" **plus the class's own unit** (`unitIds` already does
  this). Affects jump-ahead, previews and testing; changes nothing for a learner on her own unit.
  Needs a careful read of `recapItems` (section scope) and `pickIntroSentence` before doing.
- **3c. The gate and the slots start with the rest.** The streak gate is a separate effect; fold
  it into the same wave so it is never the last thing the door waits on.

## 4. How we know nothing moved

Meanings and sentence shapes decide what every screen shows, so each cache gets a parity check.

All in `scripts/engine/test/class-load.test.mjs` (the demo course's tokens carry no glosses, so
the test gives each one a rendering of its word's gloss):

- The memoized helpers and `withMeanings` answer as a copy of the module that has kept nothing
  does — for two learners in a row, warm, cold, and after `clearMeaningMemos`; plus fixed pairs
  that share one argument, so an answer kept under half its key fails.
- `sentencesOf` twice gives equal sentences that share their shape but not the object or `shown`;
  writing `shown` on one leaves the next class's alone.
- Every lesson of the demo course is built over sentences whose shared parts are deep-frozen, so
  a write to a kept shape throws.
- The rows in reach are the same array on a second call and a new, equal one after
  `clearContentCache()`, which also calls whatever `onContentCleared` registered.
- Done by hand for phase 1, result above: old against new over the whole real snapshot.
- `npm run engine:test` and `npm run course:test` stay green. (`rounds.test.mjs:441` fails about
  one run in ten on its own shuffle, before and after this work.)

## 5. Device numbers

Dev build, simulator, an account with 2,719 word records and 259 shown sentences, a class with
34 blocks in reach (15,658 sentences). After phases 0–1, before 3a. `states` → `meanings` →
`resolve` run one after another and make up `build`.

| open | total | build | states | meanings | resolve | shape | blocks | other requests |
|---|---|---|---|---|---|---|---|---|
| 1st | 3,325 | 3,240 | 1,550 | 878 | 83 | 347 | 34 memory | ~300–350 each |
| 2nd | 2,476 | 2,443 | 1,379 | 522 | 487 | 24 | 34 memory | ~260–300 each |
| 3rd | 3,281 | 2,435 | 1,434 | 743 | 176 | 35 | 34 memory | ~280–300 each; first clip 485 |

After 3a (all pages at once, 1,000 rows a page), same account and class:

| open | total | build | states | per page | meanings | resolve |
|---|---|---|---|---|---|---|
| 1st after a refresh | 5,863 | 5,759 | 3,508 | 780 / 710 / 522 | 1,120 | 522 |
| 2nd | 2,065 | 2,029 | 809 | 807 / 740 / 572 | 592 | 520 |
| 3rd | 1,795 | 1,759 | 754 | 753 / 731 / 489 | 511 | 440 |

What they showed:

- **A page's wait is its rows**: empty 265 ms, 719 rows ~500, 1,000 rows ~750 — about 0.5 ms a
  row on top of the trip, and pages asked for together wait together. So one big response (an
  RPC) would be slower, not faster, and smaller pages in parallel faster: named queries now page
  by 500 (`REMEMBERED_PAGE`). Not yet measured.
- **The 1st open lost ~2 s waiting to read the page count off the phone** before any request went
  (`shown`: 2,322 for one 310 ms page). Fixed: the count is never waited on — memory or one page —
  and `prefetchTabs` reads it into memory on launch (`recallPages`).
- `meanings` + `resolve` (~950 ms, dev build) are now more than `states`.

After the 500-row pages and the storage fix:

| open | total | build | states | meanings | resolve |
|---|---|---|---|---|---|
| 1st after a refresh | 3,249 | 3,150 | 1,185 | 933 | 438 |
| 2nd | 1,670 | 1,639 | 527 | 582 | 427 |
| 3rd | 1,607 | 1,572 | 519 | 511 | 464 |

- `states` on a repeat open: ~1,400 → ~520. The 2 s storage wait is gone. On the 1st open the six
  pages came back in tiers (~540 / ~920 / ~1,180) along with every other request — cold
  connections, not rows; phase 2 would move that off the loading screen.
- **`resolve`, profiled (Node, unit 270):** a third was `glueSeen` going through every sentence in
  reach to add zero for the ones she never passed — and `round.ts` calls it after every answer
  too; most of the rest was `pickReviewSentences` shuffling the whole pool for each pick and
  recomputing each sentence's difficulty per comparison. Now `glueSeen` skips unpassed
  sentences, and the picker shuffles only sentences holding a due word and works a difficulty
  out once. Node: a plain lesson 33 → 7 ms, a lesson with review ~120 → ~85 ms. Old against new:
  glue counts equal; picks agree over 30 cases × 400 draws. Not yet measured on the phone.

**Done when:** on a real iPhone, a class on her own unit opens before Pancho appears (`SLOW_MS`,
1 s in `class-door.tsx`) on the second and later opens of a launch, at units 5, 100 and 200; and
the first open of a launch does too once phase 2 has had time to run.

## 5b. The wait as she sees it — built 2026-10-13, not yet tried on a phone

A read of the loading path from her side, and what was done about each thing.

| was | now | where |
|---|---|---|
| A class that failed to load stayed on the doorway for good (only tests said so) | Every kind of round says "Couldn't load your class", with **Try again** and **Back home** | `practice.tsx` (`loadFailed`, `tryAgain`) |
| A request that never answered: the same | The load is called off after 20 s (`LOAD_TIMEOUT_MS`) and shows the same screen; blocks that did arrive are kept, so trying again resumes | `practice.tsx` |
| A streak gate that never answered held the doorway | Answered by the clock after 4 s (`GATE_TIMEOUT_MS`), and a late answer is dropped rather than landing on the class | `practice.tsx` |
| A tap during the warm-up started a second full load beside it | The warm-up's read is **held** and the class takes it — still on its way if she was quick | `learner-ready.ts`, `session.ts` (`loadLearner` / `readLearnerAhead`) |
| The warm-up read her records and threw them away; the class read them again | One read: taken once, for the same class, within 2 minutes, and not after anything of hers was written (`learnerChanged` in `round.ts`, `recordShown`) | same |
| The warm-up's two long pieces of work ran in one go (~1 s in dev) | Sentence shapes and the meanings' answers are worked out 8 ms at a time (`inSlices`), before the read | `slices.ts`, `prefetch.ts` (`warmClass`) |
| Pancho popped in at 1 s and was gone at ~1.5 s | Once he is out he stays at least 400 ms (`WAIT_SHOWN_MS`); a class ready before 1 s still never shows him | `practice.tsx` |
| The first screen's recording was only asked for once the class was built | The warm-up builds the class once to learn its first two screens and fetches their recordings | `prefetch.ts` (`warmClass`) |

Tried on the simulator after this pass: the first class after the warm-up opened in **1,070 ms**
(`learner 0 (read ahead)`; it had been 3,249–3,436), and the retry screen worked. A tap *before*
the warm-up had found which class to read (it first reads the course and her progress) still
loaded twice — 3,041 ms. Fixed after: `learnerComing` makes that class wait for the read to be
held, `learnerAsked` stops a warm-up starting once a class has read for itself, and a class that
is waiting makes the sliced work run straight through (`hurrySlices`). Not yet re-measured.

Found on the way, not from this work: on the phones the road was pinned back onto her step at
120 / 400 / 800 ms after it was placed, whatever she did — the check that she had scrolled only
worked on the web. A drag now calls the repeats off (`dragged` in `home.tsx`).

This reverses §0's "her records are still read fresh on every open" in one bounded case: the
first class after a launch may use a read up to two minutes old. Every later class reads fresh.

Still open: what is left of `withMeanings` after the slices (the owners maps and the picks, ~500 ms
in dev) runs in one piece inside the held read; whether the road stutters there has to be seen
on a phone. The warm-up runs once per launch, not when the app comes back from the background.

## 6. When to do the database version

If, after phases 1–3, the phone still shows a late class clearly slower than an early one, what is
left is the part that truly grows: parsing every block at launch and attaching her record to every
sentence. Then: a per-learner RPC returning glue-seen counts, screens passed and `met` per
(form, meaning) — maintained by trigger on `sentence_states`, the way `content_unit_stamps` is —
and a class that loads its own unit's block plus the review sentences it picks. Write that as its
own spec.

## 7. Files

| file | phase | change |
|---|---|---|
| `src/lib/load-timing.ts` (new) | 0 | dev-only timing |
| `src/lib/session.ts`, `lesson.ts`, `sentences.ts`, `fetch-all.ts`, `content-cache.ts`, `src/app/practice.tsx` | 0 | timing calls |
| `scripts/engine/bench-class-load.mjs` (new), `package.json` | 0 | the benchmark |
| `src/lib/meanings.ts` | 1a | memoized helpers, `meaningsOf` once per form |
| `src/lib/sentences.ts` | 1b, 1c | `sentenceBase`, kept row list |
| `src/lib/content-cache.ts`, `session.ts` | 1 | `onContentCleared`: clearing forgets the new caches too |
| `scripts/engine/test/class-load.test.mjs` (new) | 1 | §4 |
| `src/lib/prefetch.ts` | 2 | warm the class she is on |
| `src/lib/fetch-all.ts`, `session.ts`, `practice.tsx` | 3 | if measured |
