# Onboarding and paywall from the database

Everything here changes the app with no update. The app reads it once per run
with the public key. The code is `src/lib/remote-config.ts`. The first class
has its own guide: `first-class-README.md`.

Preview in the app (staff): Account → admin → **Onboarding screens**
(`posta://admin/screens`). It shows every row, drafts included, and the error
of any broken row. A broken row is never shown to anyone.

## Paywall: `app_config` key `paywall`

```json
{
  "hero": ["Understand Argentines.", "Sound like one.", "In a few minutes a day."],
  "preselect": "year",
  "show_monthly": true,
  "close_after_seconds": 15,
  "close_offer": true,
  "offer_decline": "plans"
}
```

| key | default | |
| --- | --- | --- |
| `hero` | the three lines above | The headline; the third line is the pink sticker. |
| `preselect` | `year` | Which plan starts chosen: `year` or `month`. |
| `show_monthly` | `true` | `false` hides the monthly plan. |
| `close_after_seconds` | 15 on the hard paywall, 2.2 otherwise | When the X shows on the onboarding paywall. |
| `close_offer` | `true` | The X opens the one-time 40% offer. On the hard paywall the X shows only while that offer can still be shown. |
| `timeline_colors` | `["sage","sky","lav"]` | The trial timeline's three dots (today, reminder, charge day), as app colour names. |
| `offer_decline` | `plans` | Saying no to the offer: back to the plans, or `free_week` (the free week opens now, as it used to). |

`{}` = all defaults.

## Questions left out: `onboarding_skip`

```json
["struggle", "goal"]
```

Only `name`, `why`, `struggle` and `goal` can be skipped. A skipped `why`
counts as "trip", a skipped `goal` as 10 minutes.

## A/B tests

Any value above can be a test instead:

```json
{ "experiment": "pw-hero", "variants": [
  { "name": "a", "weight": 50, "value": { "hero": ["…", "…", "…"] } },
  { "name": "b", "weight": 50, "value": {} }
] }
```

Each phone always lands in the same variant. The variant goes on every
`funnel_events` row (`props.ab`, like `pw-hero:a`) and on the person in PostHog
(`exp_pw-hero`). Compare checkouts per variant in `funnel_events`.

For custom screens, the split lives in `app_config` key `experiments`:

```json
{ "bf": { "a": 50, "none": 50 } }
```

A screen with `"audience": { "experiment": "bf", "variant": "a" }` shows only to
"a". "none" has no screen, so it is the control.

## Custom screens: table `onboarding_screens`

| column | |
| --- | --- |
| `id` | Any name. Sent to PostHog (`onboarding_screen_shown`, `_next`, `_paywall`). |
| `slot` | `before_class`, `after_class` (after the Day 1 screens) or `before_paywall`. |
| `position` | Order inside the slot, low first. |
| `published` | Only published rows show. |
| `audience` | `{ "levels": [...], "whys": [...], "experiment": "…", "variant": "…" }`, all optional. |
| `starts_at` / `ends_at` | Optional dates. |
| `content` | The screen (below). |

### `content`

```json
{
  "bg": "butter",
  "blocks": [ … ],
  "button": { "label": "See the offer", "action": "paywall", "style": "primary" },
  "skip": { "label": "Not now" }
}
```

- `button.action`: `next` (default) or `paywall`, which goes straight to the
  paywall and skips the screens after it. `style`: `primary` (rosa) or `secondary`.
- `skip`: an optional quiet link that just moves on.

**Colours** come only from the app: `oat` (the page), `card`, `rosa`, `butter`,
`peach`, `sage`, `lav`, `sky`, `flame`. Text colours: `ink`, `rosa`, `muted`.
Text on `rosa` turns white by itself.

### Blocks

| type | fields |
| --- | --- |
| `kicker` | `text`, `color`, `align` (`center` / `left`). Small caps line. |
| `headline` | `small`, `big`, `fill` (letter colour). The outlined headline. |
| `title` | `text`, `color`, `align` |
| `text` | `text` (with `**bold**`), `color`, `align` |
| `image` | One picture of ours, plus `height` (default 200), see below. |
| `bullets` | `items` (`**bold**` works), `bg` |
| `quote` | `text`, `author`, `stars` (1–5), `bg` |
| `countdown` | `until` (ISO date with its offset, like `2026-12-01T00:00:00-03:00`; a bare date counts as UTC), `label`, `bg` |
| `sticker` | `text`, `color` (default rosa), `tilt` (degrees, default −2.5) |

**Pictures** (in `image`). Use one of these:

- `"pancho": "mate"`: a Pancho. You can use: alfajor, alfajor-maicena,
  asado, choripan, dulce-de-leche, empanadas, facturas, futbol-gol,
  futbol-pateando, gaucho-cafe, gaucho, historia, mate-amargo, mate,
  mate-sorbiendo, milanesa, musica, puteadas, saludando, tango.
- `"art": { "section": "asado", "index": 0 }`: a culture section's art (mate,
  asado, comida, alfajores, futbol, tango, musica, …).
- `"word": "chamuyar"`: an Argentine pack word's picture, by its Spanish.
- `"lemma_id": "…"`: a course word's picture.
- `"url": "https://…"`: anything else (a public URL).

## The three drafts

The 2026-11-19 designs are in as drafts (`published = false`):

- `black-friday`: before the paywall. It promises 40% off, so publish it only
  with a paywall that sells at that price.
- `learners-like-you`: before the paywall. Put a real review in the quote first.
- `note-from-us`: after the class. Check the text is true first.

To publish one:

```sql
update onboarding_screens set published = true where id = 'note-from-us';
```
