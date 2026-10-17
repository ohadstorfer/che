# Home screen widgets: spec

Status: iOS built and checked on the simulator, 2026-10-10. Android written but never built or run (the Mac ran out of disk space).
Mockups: https://claude.ai/artifact/QWhoWwBMTJMuErTKo5exXo

## Goal

A widget that makes the learner open Posta and practice today. It does this the
way Duolingo's does: Pancho gets more upset as the day goes on without a
finished round. It also teaches one Argentine slang word a day, so the widget
gives something before it asks for something.

## Decisions from the interview

| Question | Answer |
| --- | --- |
| Sizes | Small (2x2) and medium (4x2), on iOS and Android. No lock screen widget for now. |
| Tone | Duolingo-level drama: sad, begging, crying, collapsed. |
| Always visible | Streak count. No countdown. |
| Word of the day shows | The word and its meaning. Medium also has room for one example phrase. |
| Tapping the word | Opens a word card (audio, meaning, example) with one button on to Home, where today's practice is. |
| Day rhythm | Word first, nudge later. |

## Chosen: word first, nudge later

Until 14:00 the widget is the word of the day, under a small "Word of the day"
label. From 14:00, if today has no finished round, the word is replaced by
Pancho and one short line. (An alternative where the word stays all day and
only Pancho's mood changes is still on the canvas as option B; it was not
picked.)

Every state has its own scene behind Pancho, not a flat colour.

## States through the day

All times are the device's local time. Every state except "practiced" applies
only while `streaks.last_practice_date` is not today.

| From | State | Pancho | Scene | Line (small / medium) |
| --- | --- | --- | --- | --- |
| 08:00 | Word | waving | sunburst, morning sun | Quilombo · mess, chaos |
| 14:00 | Side-eye | side-eye | clouds over hills | So… nothing? / So… no practice today? |
| 17:00 | Sad | sad, empty mate | sun setting on the horizon | Still waiting. / Still waiting… |
| 20:00 | Begging | on his knees | moon, stars, Buenos Aires skyline | Please? / Please? Just 2 minutes. |
| 22:00 | Crying | bawling | flames rising | You’re killing me! / You’re killing me! |
| 23:00 | Last hour | collapsed, ghost leaving | night sky, a gravestone for the streak | Bye, streak. / Bye-bye, 12-day streak. |
| any time, after a round | Practiced | goal celebration | pitch stripes and confetti | Goooal! / Goooal! See you tomorrow. |

- 08:00 matches the hour push reminders already start (`REMINDER_TIME` in
  `src/lib/push.ts`). Between midnight and 08:00 the widget shows the new day's
  word.
- "Practiced" holds until midnight, then the next day's word appears.
- The streak chip is the app header's chip: oat with a grey flame until today's
  round is done, butter with a lit flame after.
- Pancho's lines are in English (since 2026-10-16), the same on iOS and
  Android; only the word of the day and its example are Spanish.
- Small-widget lines stay at 14 characters or fewer so they fit on one line.

## Streak states that override the day

These follow `streakStatus()` in `src/lib/streak.ts`. They replace the whole
day's rhythm, word included, until the status changes.

| Status | When | Chip | Pancho and scene | Line (small / medium) |
| --- | --- | --- | --- | --- |
| `frozen` | A day was missed; the old run is still recoverable | icy, snowflake, old count struck through | sad Pancho (tear, empty mate) in a block of ice, snowy night | I’m frozen! / Your streak froze. |
| `recovering` | One round done today; one more buys the run back before midnight | snowflake, old count struck through, today's count | begging, ice melting under a sun | One more! / One more saves it. |
| `none` | New user, or no run to mourn | grey flame, 0 | waving, sunburst | Shall we? / Shall we? Just 2 minutes. |

- There is no separate "lost streak" state. In the app a missed day is
  `frozen`; if the learner comes back and does not finish the second round by
  midnight, the next day is a normal `alive` day with a small count.
- `none` shows no drama: there is nothing to lose. Before 14:00 it shows the
  word of the day with a 0 chip; the line above is its afternoon state.
- A second round in `recovering` leads to the normal "practiced" state with
  the restored count.

## Word of the day

- Source: published lemmas whose `register` is `lunfardo` or `informal`
  (quilombo, laburo, guita, fiaca, bondi, chamuyo, morfar, birra, pibe, posta).
  Meaning is `gloss_en`.
- The same word for everyone on a given date: order the list once, index by
  day number. No server call is needed at display time.
- The medium widget needs one example sentence per word. Take it from the
  sentences content where one exists; a word without an example shows only
  word and meaning.
- Long words: shrink the type to fit one line, never wrap.

## Taps

| Tapped state | Opens |
| --- | --- |
| Word (before 14:00) | Word card, then "Practice now" opens Home |
| Any nudge, frozen, recovering or new-user state | Home, where today's round is one tap away |
| Practiced | The app's home |

## How it is built (iOS)

- The widget is a WidgetKit extension in Swift, in `targets/widget/`. The
  `@bacons/apple-targets` config plugin adds it to the Xcode project on every
  `expo prebuild`, so nothing lives in the generated `ios/` folder. It needs
  iOS 17; on iOS 16 the widget is simply not offered.
- `Day.swift` decides what to show from the clock and the streak row, with the
  same rules as `streakStatus()`. `PostaWidget.swift` draws it. The widget
  publishes a timeline with an entry at every turn of the next two days, so it
  moves through the day, and into a frozen run, without the app being opened.
- The app's only job is to hand over the streak row. `publishStreakWeek()`
  calls `syncWidget()` (`src/lib/widget.ios.ts`), which writes it to the app
  group `group.app.posta.ios` and reloads the widget, so finishing a round
  shows "practiced" at once. Signing out clears it.
- The word list is bundled inside the widget (`targets/widget/assets/words.json`,
  built by `npm run widget:words` from `src/lib/argentine.json`): everyday
  single words from the non-rude packs, in a fixed shuffled order, one per
  calendar day. Re-run the script when the Argentine packs change.
- Scenes are PNGs in `assets/images/widget/`; the poses are in
  `assets/images/capybara/`. Gabarito and Figtree are bundled in the widget.
- Taps are deep links: the word opens `posta://word-of-day?id=…`
  (`src/app/word-of-day.tsx`, the Argentine packs' own word card with a
  "Practice now" button that goes to Home); every other state opens
  `posta://home`.
- A round finished on another device does not show until the app next opens
  on this one.
- Shipping needs the App Group capability on the app's identifier and a new
  identifier for the widget (`app.posta.ios.PostaWidget`). EAS Build and
  Xcode's automatic signing both create these.

## How it is built (Android)

- The widget is drawn from JS with `react-native-android-widget`
  (`src/widget-android/render.tsx`): two widgets, `PostaSmall` (2x2) and
  `PostaMedium` (4x2), declared in `app.json`. The day's rules are in
  `src/lib/widget-day.ts`, a copy of `Day.swift`: change one, change the other.
- `syncWidget()` (`src/lib/widget.android.ts`) saves the streak row in
  AsyncStorage and redraws any widget on the home screen.
- Android redraws the widget every 30 minutes through a background task
  (`src/lib/widget-task.android.ts`, registered from the new entry file
  `index.ts`). So a change of state can show up to half an hour late, where
  iOS switches on the hour.
- Words come from `src/lib/widget-words.json`, written by the same
  `npm run widget:words`, so both platforms show the same word each day.

## Not designed yet

- Whether the word of the day also shows on the later widgets (side-eye
  through last hour, and frozen, recovering, new). Both versions are on the
  mockups canvas for comparison.
- A signed-out user.
- Whether `frozen` and `recovering` escalate through the day or stay as one state each.
- Art: the scenes are simple flat shapes, and the frozen Pancho is the sad pose under a drawn ice block. The sad, begging, crying and collapsed Pancho poses were generated for
  the mockups and are not in `assets/images/capybara/` yet.
