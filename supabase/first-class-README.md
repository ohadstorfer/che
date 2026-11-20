# The first class from the database

The onboarding class can come from the database instead of the app, so it can
be changed with no app update.

## The switch

`app_config` row `first_class_source`:

- `"local"` (default): the class built into the app. The app reads only this row.
- `"db"`: a row of `first_classes`. If that row is broken, missing, or slow
  (4 s), the app plays the local class instead. A broken row is never shown.

```sql
update app_config set value = '"db"' where key = 'first_class_source';
update app_config set value = '"local"' where key = 'first_class_source';
```

## One class per level

`first_classes`: one row per version of the class.

| column | |
| --- | --- |
| `id` | Any name (`default`, `beginners`, …). Sent to PostHog as `row`. |
| `levels` | Which onboarding levels get it: `none`, `basics`, `learning`, `spanish`, `conversational`. Empty = everyone without a row of their own. |
| `published` | Only published rows are played. Drafts show in admin. |
| `content` | The class (below). |

A level with its own row gets that row; every other level gets the row with
empty `levels`. A single screen can also be limited with its own `levels`, so
one row can still differ by level (row `default` does this for the
picture/build screen).

Before you flip the switch, check it in the app: Account → First class
(onboarding). Pick a level and press Database. The screen lists any errors per
level.

## `content`

```jsonc
{
  "screens": [ ... ],            // in order
  "done_line": "Medialuna, re, asado. Three words in, many more to go.",
  "speaker_image": "https://…",  // optional: Pancho beside his lines; "none" for no picture; leave it out for Pancho with facturas
  "forms": [ ... ],              // every word used: same columns as form_entries
  "sentences": [ ... ]           // every sentence used: same columns as sentences
}
```

A sentence's words (`tokens[].form_ids`) must all be in `forms`. Rows can be
copied from the course tables, or written by hand. A new sentence needs an id
of its own (any text). `audio_path` can be null, or a path in the same audio
bucket the course uses.

Every screen has an `id` (sent to PostHog), an optional `part` (`class`,
`slang`, `culture`: which piece of the bar it fills) and optional `levels`.

### `new_word`: the New word screen, then its question

```json
{ "id": "medialuna", "type": "new_word", "form_id": "<forms.id>", "sentence_id": "<sentences.id>",
  "choice_sentence_ids": ["<right one>", "<wrong>", "<wrong>"] }
```

### `build`: build the sentence from tiles

```json
{ "id": "build", "type": "build", "sentence_id": "<sentences.id>", "spare_form_ids": ["<forms.id>", "…"] }
```

`spare_form_ids` left out = every other word of the class.

### `pick_picture`: read Pancho's line, pick the answer

```json
{ "id": "build", "type": "pick_picture", "prompt": "What is Pancho offering you?", "sentence_id": "<sentences.id>",
  "options": [
    { "label": "Medialunas", "image": "https://…/medialunas.webp", "correct": true },
    { "label": "Pizza", "lemma_id": "<a course word with art in the app>" },
    { "label": "Ice cream", "image": "https://…" },
    { "label": "Orange juice", "image": "https://…" }
  ] }
```

Exactly one option is `correct`. Give every option a picture (a URL, or the art
of a course word by `lemma_id`), or give none, which shows plain text answers.

### `slang`: the slang opener, then each word met and asked

```json
{ "id": "slang", "type": "slang",
  "words": ["re", { "id": "dale", "example": { "es": "¡Dale, vamos!", "en": "Sure, let's go!" }, "gap": "Dale" }],
  "decoys": ["celu", "cumple", "finde"] }
```

A word is an id from `argentine.json`, or an object that changes fields of one
(or a new word with `es`, `en`, `example`, `gap`). The `gap` must be inside
`example.es`.

### `culture_intro`: the peach CULTURE opener

```json
{ "id": "culture-intro", "type": "culture_intro" }
```

### `culture_card`: one culture card

```json
{ "id": "asado", "type": "culture_card", "chip": "More than a barbecue",
  "text": "An **asado** is grilled meat, sure. …",
  "image": "https://…",                       // or "art": { "section": "asado", "index": 0 }
  "bg": "butter",                             // butter, peach, sage, lav, sky, or a colour
  "section": "asado", "class": "el-ritual" }  // whose tap-a-word glosses it uses
```

## Pictures

An `image` is any public URL, for example a file in a public Supabase Storage
bucket or on S3.

## Starting point

Row `default` is a copy of the local class, made by
`scripts/first-class/seed-db.mjs`. Edit that row, or copy it into a new row
with `levels` set.
