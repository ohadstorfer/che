# Posta — Launch and loading the four tabs

Status: **built 2026-10-01.** Companion to `docs/content-on-device.md`.
Written so any model or person can pick the work up mid-way.

---

## 0. The decision

> **A cold start shows one splash, then the finished Course screen. Never a half-built one. The
> other three tabs get ready behind Course, so each one opens complete.**

The owner's answers that shaped this (2026-10-01, installed iOS PWA):

- **While loading:** hold a branded splash and reveal everything at once, not skeletons.
- **Splash look:** the capybara (the app icon) breathing softly on the oat background.
- **Longest wait:** about 3 seconds. After that the app shows anyway, and anything still missing
  fills in where it belongs.
- **Other tabs:** prefetch them after Course is ready.
- **Later launches:** paint from a saved copy and refresh quietly behind it.

## 1. What was wrong (before)

Screenshots from the PWA, in launch order: a bare spinner. Then Course with its "Course" title
and an empty body, then the title turning into an empty section pill, with a placeholder sun and
a stray ↑ button. Then a path that drew in pieces. Then every other tab with a blank streak chip
and colored circles waiting for their art.

Causes:

| Symptom | Cause |
|---|---|
| Slow every launch | On the web, `content-cache.ts` had no disk, so the PWA paged the whole course (~2,900 lessons) and the lexicon down on **every** launch |
| Course started late | Home keyed its load on `profile.id`, which costs a round trip *after* the session is read |
| Header title → pill | `AppHeader` showed the title until the course was there to name the section |
| Blank streak chip per tab | Each tab's `useStreakWeek` fetched on focus and started empty |
| Art popping in | Bundled images are fetched only when a screen first renders them; the service worker cached nothing |
| Blue empty card on Speaking | Its top card waited on four reads, made one after the other on focus |
| Stray ↑ during load | `JumpButton` rendered whenever there was a course, road or not |

## 2. How a launch runs now

```
HTML arrives ──► #boot-splash (static, in +html.tsx) is on screen at once
script loads ──► AuthProvider reads the session (in parallel with the fonts)
             ──► Course: phone's copy of course + snapshot ──► road placed ──► markBootReady()
             ──► BootGate lets go ──► splash fades (240 ms) ──► +400 ms: prefetchTabs()
             ──► real load lands behind ──► corrects the road / header if anything changed
```

### 2.1 The splash — `components/boot-splash.tsx`, `app/+html.tsx`

- **Web:** the splash is plain markup in the HTML shell (`#boot-splash`, image `splash-icon.png`
  at 180 px, a CSS `boot-breathe` keyframe: 2.2 s cycle, scale 1 → 1.04, off under reduced
  motion). It is there before the script runs. `WebBootSplash` only removes it: opacity → 0 and
  the image lifts to 1.08 over 240 ms with `cubic-bezier(0.23, 1, 0.32, 1)`, then the node is
  deleted.
- **Native:** `NativeBootSplash` draws the same image, size and place as the native splash
  (`app.json` → `expo-splash-screen`, `imageWidth` 180), so the hand-off can't be seen. Same
  breath and exit with `Animated`.
- **Cap:** `MAX_HOLD_MS = 3000` from mount. Past it the splash goes regardless.
- The splash sits at one fixed place in the root tree from the first render, so it never remounts
  (and restarts its breath or its cap) when the fonts land.

### 2.2 When it lets go — `lib/boot.ts`, `BootGate` in `app/_layout.tsx`

`markBootReady()` is one global signal; `useBootReady()` reads it. The splash holds while:

```
!fontsReady || authLoading || (signedIn && pathname is '/' or '/home' && !ready)
```

- **Course** (`(tabs)/home.tsx`) fires it the moment the road is placed on her step: in the web
  layout effect and in `place()`, or right away when there is no course to place.
- **Anywhere else** she lands (welcome, onboarding, paywall gate, a deep link) has nothing to wait
  for, so the splash goes as soon as fonts and session are known.
- `AuthProvider` and `PremiumProvider` now sit **above** the font gate, so the session is read
  while the fonts load, not after.
- `index.tsx` no longer shows a spinner while auth loads; the splash covers it.

### 2.3 Course from a saved copy — `(tabs)/home.tsx`

On a cold start (`lastShown` is null), Home reads two things from the phone at once:

- `peekCourse()`: the course rows as last stored, without the version call.
- `readSnapshot('home', userId)`: its `HomeSnapshot`.

If both exist, it draws the road from them (`data.cached = true`) while `load()` runs as before.

`HomeSnapshot` holds `done` lesson ids (not an index, so it still fits a course that changed),
`checkAttempts`, the streak row, `weekDone`, `known`, `mistakes` and `pushStatus`. The last one
matters because the road waits for the push status, and on the web that is a service-worker plus
database read.

When the real load lands on a road drawn from the copy (`shownFromCache`):

- **Same status:** nothing happens.
- **Her step moved** (a lesson finished on another device): it is *put* in place (`show(next,
  true)`) and scrolled to, never animated. The advance animation is only for a move she watched.
- **Only the header changed:** the chip simply takes the true count.

Other Course changes:

- `userId` comes from `session.user.id`, not `profile.id`, which removes a round trip in front of
  the road.
- While the course is unread, the header holds the pill's place with a ghost (`pillPending`)
  instead of showing "Course" first.
- `JumpButton` renders only when `roadReady`.

### 2.4 One streak for every header — `lib/streak-week.ts`

- One copy of `{ streak row, weekDone }` per user, in memory, plus a snapshot on the phone.
- Course's `load()` gets it through `fetchStreakWeek()`, which publishes it, so Words, Culture and
  Speaking have it before they open.
- `useStreakWeek()` in `app-header.tsx` reads the shared copy and refreshes on focus.
- The **raw row** is kept, not its status: `streakStatus()` runs at read time, so yesterday's copy
  is read as yesterday's.

### 2.5 The other tabs, made ready — `lib/prefetch.ts`

`prefetchTabs(userId, limited)` runs once per launch, 400 ms after the splash lets go (after its
fade, so parsing the lexicon can't stutter it):

| What | For |
|---|---|
| `preloadImages(...)`: Speaking's scenario art, Culture's tiles, Words' theme art | no circles waiting for art |
| `loadHablarHome()` (`lib/hablar-home.ts`) | Speaking's top card, rows, free-chat count, level |
| `prefetchCultureDone()` (`lib/culture.ts`) | Culture's progress bars and Continue card |
| `prefetchPackScores()` (`lib/argentine-scores.ts`) | Words' "n of N" and Keep going |
| `loadLexicon()` | My words (kept by content-cache after) |

Each screen starts from the last read value (`peekHablarHome`, `lastDone`, `lastScores`) and still
refreshes on focus.

Speaking's prefetch **only reads**. Closing a chat left open on an earlier day (which triggers its
summary) still happens only when she opens the tab; `forgetHablarLatest()` drops the stale chat
from the kept copy afterwards.

`preloadImages` (`lib/preload-images.ts`) is web only, since the phones read images straight off
the bundle. It keeps each decoded `HTMLImageElement` for the rest of the run, so the screen's
`<img>` paints from memory. On the web a bundled image module is `{ uri, width, height }`. The
splash preloads Course's own two pictures (avatar, unit banner capybara) as soon as it loads.

### 2.6 Snapshots — `lib/snapshot.ts`

`readSnapshot(name, userId)` and `writeSnapshot(name, userId, value)` over AsyncStorage (which is
localStorage on the web). Keys: `snapshot:<FORMAT>:<name>:<userId>`. Bump `FORMAT` when a
snapshot's shape changes. Small, per user, and never the truth: whatever reads one still loads
the real thing after.

| name | written by | read by |
|---|---|---|
| `home` | Home's `load()` | Home's cold start |
| `streak-week` | `publishStreakWeek()` | `hydrateStreakWeek()` |

### 2.7 Service worker — `public/sw.js`

- **Cache-first** (in `che-shell-v1`): same-origin `GET`s under `/_expo/static/` and `/assets/`.
  Every one of those files carries a content hash in its name, so it never changes under its URL.
- **Always network:** pages and anything off-origin (the API), so a deploy still lands on the next
  launch.
- Range requests are skipped; only `200` responses are stored.

## 3. Measured (desktop Chrome, dev build, real account)

| Launch | Course ready, splash starts fading |
|---|---|
| First ever (nothing on the phone) | ~3 s (course paged from the network) |
| Later launches (copy + snapshot) | ~0.9 s |

All four tabs opened complete on first view after the prefetch. **Not yet measured on the
installed iOS PWA.**

## 4. Edge cases

- **Slow or no network:** the splash goes at 3 s. With a saved copy, the road is already
  standing; without one, the loading sun and the pill ghost hold the places.
- **Signed out:** no wait. Welcome shows as soon as the session read says so.
- **A different user signs in:** snapshots are keyed by user id; the streak copy is ignored unless
  its `userId` matches.
- **Coming back from a lesson:** unchanged. `lastShown` is standing, so the cold-start copy is
  never read and the advance animation plays as before.
- **Static web render:** `useSyncExternalStore` stores pass a server snapshot (`null` / `false`),
  so the export renders and hydrates empty, then fills.

## 5. Known limits and later

- **Old cached files:** each deploy leaves its old hashed files in the service worker cache, since
  nothing removes them. They are small; add cleanup (for example, on `activate`, drop entries not
  referenced by the current `index.html`) if it ever matters.
- **Demo backend:** `EXPO_PUBLIC_DEMO=1` stays on a blank screen. The demo client's
  `onAuthStateChange` never calls back, so `AuthProvider` stays loading. This predates this work.
- **Speaking on a cold start:** not snapshotted, only kept in memory. It relies on the prefetch.
- **Very first launch** still waits on the network for the course. Bundling the first block of
  content (see `content-on-device.md` §5) would fix it.
