# Che — Culture lessons

Short, fun lessons about Argentine life: mate, asado, fútbol, puteadas, history.
They live apart from the grammar course (`docs/course-spec.md`) on purpose: no
lexicon, no forms, no register gates. A class is a handful of pages the learner
swipes through, with easy questions along the way, and a word review at the end.

Content lives in `docs/culture/<section>.yaml`, one file per section.
Validate: `npm run culture:validate`.

## Shape

```
section ── class ── page, page, page … ── vocabulary
        └─ class …
```

- **Section**: a topic (Mate, Asado, …). Any number of classes.
- **Class**: 5–12 pages, about 3–5 minutes. Ends with its vocabulary.
- **Page**: one of the types below. Mix them freely — the only rules are
  "start with an `info` page" and "never more than 3 `info` pages in a row".
- **Vocabulary**: 4–10 words taught in the class. The app builds the final
  word exercises (match pairs, pick the meaning) from this list — do not author
  them as pages.

The learner reads English. Spanish words appear in **bold**, with the meaning
nearby the first time. Tone: a friend from Buenos Aires explaining things over
a mate — warm, a bit cheeky, never a textbook. Short: an `info` body is at most
~70 words.

## Writing rules

The learner is a beginner or a tourist. Every page answers "what will I see,
hear, say or do because of this?".

- **Teach, then test.** A question may only ask about what an earlier page
  taught. An `explain` confirms or nuances; it never carries a new fact the
  class relies on. If the best line is in an explain, move it to a page.
- **Every vocabulary word appears in the pages**, in Spanish, before the word
  review. Bold it where the English already is ("the **adoquines**
  (cobblestones)"). No generic filler words (libro, banda, tren).
- **Glosses are distinct within a class.** "Pick the meaning" uses the other
  glosses as wrong answers, so two glosses that say the same thing make two
  right answers. A gloss never contains the word it defines. Near-synonyms go
  to `glossary`.
- **One right answer.** A gap distractor breaks the *meaning*, not the grammar
  ("ayudo / cobro / pego", not "ayudo / ayudás / ayudamos"). At most one joke
  option per question. Options are about the same length; the right one is not
  the only careful, hedged one.
- **True/false is balanced**: about as many true as false. No giveaway words
  ("everyone", "always", "historians agree"), and the page before must not
  state the answer in its title.
- **`order` only for a real, taught, single sequence** that teaches something.
  Common sense or date recall is not a sequence; use a scenario `choice`.
- **At most one number per info page**, and it has to earn its place. Match
  things to what you do with them, not to years.
- **Test a fact once or twice per class**, not five times.
- **Each section stands alone**: no "remember the vivo from Puteadas?".
  A topic has one home; elsewhere, one line and move on.
- **Heavy topics get a transition.** No jump from a tragedy to a joke on the
  next tap.

`npm run culture:validate` prints ⚠ warnings for vocabulary missing from the
pages and for colliding glosses. Aim for zero.

## Page types

```yaml
# Information. `body` is light markdown (**bold**, *italic*).
- type: info
  title: "The montañita"
  body: "..."
  emoji: "⛰️"              # optional, one emoji for the page illustration
  fun_fact: "..."          # optional, one line shown in a callout

# Multiple choice. 2–4 options. `scenario` optionally sets a scene first.
- type: choice
  scenario: "Someone hands you a mate and the yerba looks messy."   # optional
  prompt: "Should you fix the montañita?"
  options: ["Yes, help out", "No — only the cebador touches it"]
  correct: 1               # index into options
  explain: "..."           # shown after answering, right or wrong

# True or false.
- type: true_false
  statement: "..."
  answer: false
  explain: "..."

# Put in order. `items` is written in the CORRECT order; the app shuffles.
- type: order
  prompt: "Prepare a mate, step by step"
  items: ["...", "...", "..."]   # 3–6 items
  # Items must not contain the clue that sorts them (years, times, scores, "first/last").
  # If the numbers are the point, use a `match` page instead. Put dates in `explain`.
  explain: "..."           # optional

# Match pairs. 3–5 pairs.
- type: match
  prompt: "Match the cut to what it is"
  pairs:
    - ["vacío", "flank"]
    - ["chinchulines", "chitterlings"]
  explain: "..."           # optional

# Fill the gap in a Spanish phrase. `___` marks the gap.
- type: gap
  prompt: "What do you say to pass on the next mate?"
  text: "___, gracias."
  options: ["No", "Sí", "Dale"]
  correct: 0
  translation: "No, thanks."   # optional
  explain: "..."
```

## Vocabulary

```yaml
vocabulary:
  - es: "bombilla"
    en: "metal straw with a filter"
    example: { es: "No muevas la bombilla.", en: "Don't move the straw." }   # optional
    note: "Never stir with it."                                             # optional
```

## File

```yaml
section:
  slug: "mate"
  title: "Mate"
  emoji: "🧉"
  summary: "The drink that runs the country"
classes:
  - slug: "que-es-el-mate"
    title: "What is mate?"
    summary: "One line"
    pages: [...]
    vocabulary: [...]
```

Slugs are kebab-case and unique within the section. Everything is DRAFT until
a native reviews it; facts must be right, and anything contested (history,
politics) is presented as contested.
