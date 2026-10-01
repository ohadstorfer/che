# Posta — Course content on the device

Status: **decided 2026-09-29, being built.** Companion to `docs/learning-engine-spec.md`.
Written so any model or person can pick the work up mid-way.

---

## 0. The decision

> **Content downloads in small pieces, only as far as the learner has got, and each piece is saved
> on the phone. A piece is downloaded again only when it changed on the server.**

Not chosen, and why:

- **Bundling the whole course in the app** — 24 MB of JSON parsed on every launch (60–100 MB of
  memory), frozen until the next app release, growing with every section, and copyable out of the
  binary by anyone. The learner in unit 1 needs ~1% of it.
- **Bundling only the first units** — helps a brand-new user's very first lesson feel instant, but
  does nothing for the monthly bill (the owner's stated priority) and freezes those units until an
  app update. Can be added later if first-lesson speed becomes the priority.
- **A CDN of static files** — cheaper egress, but a second copy of the content that a publish step
  must regenerate; staff edit sentences live in the admin app. One source of truth is worth more
  right now. Revisit only if egress ever bites.

Owner's answers that shaped this (2026-09-29): content edits will be frequent in the first weeks
after launch, rare afterwards; offline is nice-to-have, not required; the monthly bill matters most;
users mostly have iPhones and recent Androids.

## 1. What was already done (live)

- **Sentences load in blocks of 8 units** (`sentences.ts`, `loadSentenceRowsInReach`), up to the
  furthest of: the unit she has reached, where placement put her, the unit of the lesson/test/story
  being opened. Every sentence she has been shown, and any a slot or story line names by id, loads
  wherever it is. `loadLearner(userId, reach)` in `session.ts` is the one entry point.
- **Word meanings no longer need every sentence.** `form_gloss_tallies()` returns the whole
  course's share of each word's meanings (~515 KB). It reads `gloss_tallies_cache`, rebuilt by the
  pg_cron job `posta-refresh-gloss-tallies` every 5 minutes when the content fingerprint changed
  (migrations `20260929000001`, `20260929000002`). Verified: 0 meaning differences against the full
  load on live data; the call answers in 0.2 ms.
- **Fallback:** if any of that fails, the app downloads every sentence as before.

## 2. What this doc adds

### 2.1 One "what changed?" call — `content_version()` (server)

A small RPC, `authenticated` only, returning:

```json
{
  "lexicon": "<md5 over published forms, lemmas, form_answers, units: count + max(updated_at)>",
  "course":  "<md5 over published sections, units, lessons, tips>",
  "tallies": "<gloss_tallies_cache.fingerprint, or null before the first build>",
  "units":   { "<unit_id>": "<published sentence count>:<max updated_at, epoch>", ... }
}
```

~20 KB uncompressed for 381 units. Every table involved has an `updated_at` trigger, so an edit,
a publish and a retire all move the stamp. Only published rows count, so a draft edit changes
nothing for learners.

The per-unit stamps are not computed on the fly (that read the whole 57 MB sentences table, 2–4 s
per app open): a trigger on `sentences` keeps them in `content_unit_stamps`, re-counting one unit
per edit (migration `20260929000004`). The call answers in ~5 ms warm.

### 2.2 The store (app) — `src/lib/content-cache.ts`

`stored(name, version, fetch)`:

1. **Memory** — if the entry for `name` is already in memory with this `version`, use it. (No
   30-minute expiry any more for versioned entries; the version is the expiry.)
2. **Disk** — else read `<documents>/content/<name>.json`. If its `version` matches (or no version
   could be had — offline, signed out, demo), use it.
3. **Network** — else `fetch()`, keep in memory, and write to disk (fire-and-forget) when a version
   is known.

`contentVersion()` calls the RPC and remembers the answer for 5 minutes, so a long-open app picks
up a publish within ~10 minutes (5 cron + 5 memo) and an app reopened after hours re-checks on its
first load. Failure → `null` → step 2's "no version" rule, then the old 30-minute memory expiry.

Disk is `expo-file-system` (already used for audio clips in `audio.ts`) on the phones, and
IndexedDB (database `content`, store `files`) on the web — localStorage's few MB can't hold the
course and the lexicon, and without a copy the PWA paged the whole course down on every launch.
Node tests have no disk (they hand one in with `setContentDisk`). Files carry a `format` number;
bump `CONTENT_FORMAT` when a row shape changes so old files are ignored. A torn or unreadable file
is treated as missing.

`peekStored(name)` returns whatever the disk holds, current or not, without asking the server —
what a cold start paints from (`peekCourse()` in `course.ts`; see `docs/launch-and-loading.md`).
The read is shared with the versioned load that follows, so when the copy is still current both
hand back the very same rows (and Course assembles the road once).

### 2.3 What goes through the store

| name | version | what |
|---|---|---|
| `course` | `course` | raw published sections, units, lessons, tips (assembled after load) |
| `lexicon` | `lexicon` | raw `form_entries` + `form_answers` rows (merged after load) |
| `tallies` | `tallies` | the gloss tallies object |
| `sentences-<hash of unit ids>` | hash of the block's unit stamps | one 8-unit block of sentence rows |

Per-user data (form states, sentence states, rounds, progress) is **not** stored here: it changes
with every screen and must be fresh. A few screens keep a small *snapshot* of what they last
showed, to paint a cold start from while the real load runs — that is `snapshot.ts`, never the
truth (`docs/launch-and-loading.md`).

### 2.4 Staff

`clearContentCache()` (called after staff edits in `admin.ts`) forgets memory and the remembered
version; the next load re-asks the server and disk copies with an old version are skipped.

## 3. Expected effect

| | per app open, returning beginner, nothing changed |
|---|---|
| before this session | ~24 MB JSON (~6 MB on the wire) |
| after §1 | ~1–1.5 MB on the wire |
| after §2 | ~20 KB (the version call) + her own progress rows |

A content fix refreshes only the affected block, for learners who have it.

## 4. Edge cases covered

- Jumping units/sections, placement: the target unit is always in reach (§1).
- Offline: saved blocks open; progress writes still need a connection.
- Signed out / demo backend: no version → disk if present, else network with the old expiry.
- App update with a new row shape: `CONTENT_FORMAT` bump invalidates every file.
- Storage failure (full disk, OS cleared files): behaves as if nothing were saved.
- Course reshaped (unit added mid-course): block membership changes → new name → new file.

## 5. Not in scope (later, if wanted)

- Bundling the first block in the app for an instant first lesson.
- Full offline (queueing progress writes).
- Per-user data on disk beyond the launch snapshots.
