// Proposes a unit's lesson slots from its approved sentences (docs/course-spec
// §4 "Assemble", shaped by docs/learning-engine-spec.md §5): the unit's new
// forms spread over its teaching lessons, each one taught, met in a sentence
// for its meaning, then drilled harder — and a last lesson that is the unit
// check. How hard the work is follows the section's level (`levelOf`). Pure;
// the reviewer reorders the proposal in the dashboard.
import { FORMS_PER_LESSON, drillable } from './outline.mjs';
import { COST, LESSON_WORDS, dealWords, lightForms, overflow } from './template.mjs';

/**
 * The course's levels, easiest first. A section's `cefr` ("B1.2") says which
 * one its lessons are planned at, and each asks more than the one before:
 *
 *   A1  short sentences first, the word picked — the course as it began
 *   A2  mid-length sentences; a teaching lesson types a word or two as well
 *   B1  no short sentence where the word has a longer one, two clauses first;
 *       a meaning is only picked when a word is first met
 *   B2  the gap itself is typed: past the first meeting it is type or build
 */
const BANDS = ['A1', 'A2', 'B1', 'B2'];
export const levelOf = (cefr) => {
  const band = String(cefr ?? '').slice(0, 2);
  return band.startsWith('C') ? BANDS.length - 1 : Math.max(0, BANDS.indexOf(band));
};

/** Words a sentence wants before a level drills it, when the word has one that long. */
const MIN_WORDS = [0, 4, 5, 6];

/** What opens a second clause: one of these words, or a comma or a dash inside the line. */
const LINKS = new Set(['que', 'porque', 'pero', 'cuando', 'aunque', 'si', 'mientras']);
const twoClauses = (s) =>
  s.tokens.some(
    (t, i) =>
      (i > 0 && (LINKS.has((t.surface ?? '').toLowerCase().replace(/[^\p{L}]/gu, '')) || /^[—–-]/.test(t.surface ?? ''))) ||
      (i < s.tokens.length - 1 && /[,;:]$/.test(t.surface ?? '')),
  );


/** Words per build step: meaning first, then a gap, tiles last (§5.2 ramp). */
const words = (s) => s.tokens.length;

/**
 * How long a lesson runs, in **screens**. A `review` slot stands for k screens
 * and a `recap` for more, so the budget counts what the learner sits through,
 * not how many rows the lesson has. Every lesson lands in this window, or the
 * plan says which one didn't and why.
 */
export const LESSON_ITEMS = { min: 12, max: 16 };

/**
 * New forms one teaching lesson introduces — the same number the outline sizes
 * a unit's lessons by, so a unit seeded today plans inside the window. Three at
 * the full ramp (teach · meaning · gap, the teach two screens) is 12 of the 16.
 */
export { FORMS_PER_LESSON };

/** The title that marks a practice lesson as grammar practice. */
export const GRAMMAR_TITLE = 'Grammar practice';

/** The first unit whose practice asks her to type (course_order). */
const TYPING_FROM = 4;

/** A practice lesson's shape: fresh gaps, recycled earlier sentences, typed gaps. */
const PRACTICE_GAPS = 3;
const PRACTICE_RECYCLED = 4;
const PRACTICE_TYPED = 2;

/** Earlier units' sentences a teaching lesson of a unit with the fixed shape brings back, room allowing. */
const TEACH_RECYCLED = 2;
/** And the extra ones its single practice lesson does. */
const SHAPED_PRACTICE_RECYCLED = 2;

/** Typed gaps a teaching lesson holds from A2 on, for sentences it has shown for their meaning. */
const TEACH_TYPED = 2;

/**
 * How far back practice reaches for a sentence: this level and the one below
 * it, so B2 gets B1 and B2 lines back and never "¡Buen día!". An older word
 * that is owed a comeback rides in on a sentence from inside the window —
 * and only when no such sentence carries it does one of its own come back,
 * PRACTICE_OLD of them a unit, in its first practice lesson.
 */
const RECYCLE_BANDS = 2;
const PRACTICE_OLD = 1;

/** Screens one sentence may have in one lesson. A third is answered from memory of the second. */
export const SHOWN_MAX = 2;

/** How many equally easy sentences a pick weighs for the words they bring back. */
const PICK_AMONG = 5;

/** Longest sentence practice asks her to build from tiles, in words. */
const BUILD_WORDS_MAX = 9;

/** Screens a `review` slot fills. */
const REVIEW_COUNT = 2;

/** Screens a lesson keeps for production, whatever else it is asked to hold. */
const MIN_PRODUCTION = 1;

/**
 * Listening screens a lesson may hold, and only for sentences it has already
 * put in front of her in writing: a listen is recall, not first contact. A
 * sentence with no recording yields none — `buildLesson` would fall back to
 * tiles, but a plan that needs the fallback is a plan that lied.
 */
const LISTEN_PER_LESSON = 2;

/** The rungs a sentence climbs inside one lesson (§5.2). A typed gap is still the gap. */
const RAMP = ['sentence_meaning', 'sentence_gap', 'sentence_build'];
const TYPED = 'sentence_gap_typed';
const rungIndex = (mode) => RAMP.indexOf(mode === TYPED ? 'sentence_gap' : mode);

/** A tip's bold Spanish, and a form as it would read there: lower case, no punctuation. */
const plain = (text) => ` ${String(text ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
const boldOf = (tip) => [...String(tip.body_md ?? '').matchAll(/\*\*(.+?)\*\*/g)].map((m) => plain(m[1]));
const mentions = (bold, form) => [form.form, form.lemma].some((w) => w && bold.some((b) => b.includes(plain(w))));

/**
 * Screens a `teach` slot plays as for a word she hasn't met: the app meets the
 * word (in a sentence, or on the plain intro screen) and then asks one easy
 * question about it (src/lib/lesson.ts, `case 'teach'`). Counting it as one
 * screen let lessons plan at 16 and play at 20.
 */
const TEACH_SCREENS = 2;

/**
 * What a slot costs the budget: one screen, unless it stands for several. A
 * `teach` marked `light` — another form of a word she has met (template.mjs) —
 * is the one screen that shows it in a sentence.
 */
const itemsOf = (slot) =>
  slot.kind === 'review' || slot.kind === 'recap' ? (slot.review_count ?? 0) : slot.kind === 'teach' ? (slot.light ? 1 : TEACH_SCREENS) : 1;
const screensOf = (list) => list.reduce((n, slot) => n + itemsOf(slot), 0);

/**
 * @param unit       outline unit (with lessons: [{id, ordinal, kind}])
 * @param forms      outline forms (all units)
 * @param sentences  approved or published sentence rows of this unit
 *                   ({id, target_form_id, tokens:[{form_ids}], difficulty, audio_path})
 * @param tips       the unit's tips, in order
 * @param level      the section's level, 0 for A1 (`levelOf`)
 * @param levelOfSentence  the level of the unit an earlier sentence was written for
 * @param owed       how much one earlier form is owed a comeback (`debt` is a sentence's sum)
 * @param slang      ids of the unit's forms its slang lesson teaches (a unit with the
 *                   fixed shape, `unit.template`); the teaching lessons leave them to it
 * @returns {{ slots, warnings }}
 */
export function planLessons({
  unit,
  forms,
  sentences,
  tips,
  earlier = [],
  debt = () => 0,
  owed = () => 0,
  grammar = null,
  level = 0,
  levelOfSentence = () => level,
  slang = new Set(),
}) {
  const warnings = [];
  // The fixed shape (template.mjs): three teaching lessons whatever the unit
  // teaches, then a slang lesson, one practice, the check.
  const template = unit.template === true;
  // From B2 the gap is typed, wherever a lesson asks for one.
  const gapAs = level >= 3 ? TYPED : 'sentence_gap';
  // Typing a word is production she can only do once the letters of the
  // course are familiar: from the unit after vos on, practice types.
  const typing = unit.course_order >= TYPING_FROM;
  const formById = new Map(forms.map((f) => [f.id, f]));
  // A practice unit teaches nothing: its words are the earlier ones it reviews.
  const review = new Set(unit.review_form_ids ?? []);
  const ownForms = forms.filter((f) => f.unit_id === unit.id && drillable(f));
  const slangForms = template ? ownForms.filter((f) => slang.has(f.id)) : [];
  const unitForms = review.size ? forms.filter((f) => review.has(f.id)) : ownForms.filter((f) => !slangForms.includes(f));
  // A practice unit with the shape has teaching lessons like any other, and
  // nothing to teach in them: they practise.
  const practiceUnit = template && review.size > 0;
  const teaching = practiceUnit ? [] : unit.lessons.filter((l) => l.kind === 'lesson' || l.kind === 'checkpoint');
  const check = unit.lessons.find((l) => l.kind === 'review');
  if (!teaching.length && !review.size) return { slots: [], warnings: [`${unit.slug}: no teaching lessons`] };

  const taught = new Set(forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.id));
  // Forms taught the light way: another form of a word she already has.
  const knownLemmas = new Set(forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.lemma_id));
  const light = template ? lightForms([...unitForms, ...slangForms], knownLemmas) : new Map();
  const contentOf = (s) => [...new Set(s.tokens.flatMap((t) => t.form_ids))].filter((id) => formById.has(id) && drillable(formById.get(id)));
  const sayable = (s) => contentOf(s).every((id) => taught.has(id));
  const used = new Map(); // sentence id -> times used
  const use = (s) => used.set(s.id, (used.get(s.id) ?? 0) + 1);
  const fresh = (s) => sayable(s) && !used.has(s.id);
  const bySize = [...sentences].sort((a, b) => words(a) - words(b) || a.difficulty - b.difficulty);
  const bySizeDesc = [...bySize].reverse();
  const buildable = (s) => words(s) <= BUILD_WORDS_MAX;
  // The order sentences are tried in. A1 takes the shortest. Later levels put
  // the ones under the level's length last — still there for a word that has
  // nothing longer, so no word goes without — and from B1 the drills take a
  // two-clause sentence before a plain one. Practice, from B1, takes the
  // longest it can still ask her to build.
  const tooShort = (s) => words(s) < MIN_WORDS[level];
  const byLevel = level ? [...bySize].sort((a, b) => tooShort(a) - tooShort(b)) : bySize;
  const toDrill = level >= 2 ? [...byLevel].sort((a, b) => tooShort(a) - tooShort(b) || twoClauses(b) - twoClauses(a)) : byLevel;
  const toPractise = level >= 2 ? [...bySizeDesc].sort((a, b) => buildable(b) - buildable(a)) : byLevel;
  // Of a few equally good sentences, the one carrying the most earlier words
  // that are owed a comeback (`debt`) — the first when none owes anything.
  const owing = (list) => list.reduce((best, s) => (best === undefined || debt(s) > debt(best) ? s : best), undefined);

  const slots = [];
  const push = (lesson, slot) =>
    slots.push({
      lesson_id: lesson.id,
      ordinal: slots.filter((s) => s.lesson_id === lesson.id).length + 1,
      kind: slot.kind,
      form_id: slot.form_id ?? null,
      sentence_id: slot.sentence_id ?? null,
      tip_id: slot.tip_id ?? null,
      mode: slot.mode ?? null,
      review_count: slot.review_count ?? null,
      scope: slot.scope ?? null,
      // Not a column: how many screens a teach slot plays as (`itemsOf`).
      ...(slot.light ? { light: true } : {}),
    });

  // Forms over lessons, as even as they divide. A unit whose words don't fit at
  // FORMS_PER_LESSON still teaches all of them — a word left untaught makes its
  // sentences unsayable — but it says how many lessons it actually wants.
  const n = unitForms.length;
  const sizes = teaching.map((_, i) => Math.floor(n / teaching.length) + (i < n % teaching.length ? 1 : 0));
  const tooBig = template && !review.size ? overflow(unitForms, light) : null;
  if (tooBig) warnings.push(`${unit.slug}: ${tooBig} — the unit wants splitting in two.`);
  if (!template && sizes.length && sizes[0] > FORMS_PER_LESSON) {
    warnings.push(
      `${unit.slug}: ${n} words over ${teaching.length} teaching lessons is ${sizes[0]} a lesson, past the ceiling of ` +
        `${FORMS_PER_LESSON}. The lessons still fit ${LESSON_ITEMS.max} screens, but the words past the ceiling are ` +
        `taught and met without their gap. The unit wants ${Math.ceil(n / FORMS_PER_LESSON)} teaching lessons.`,
    );
  }
  let at = 0;
  const chunks = template && teaching.length ? dealWords(unitForms, light, teaching.length) : sizes.map((size) => unitForms.slice(at, (at += size)));

  // A tip opens the first lesson that teaches a word it shows in bold, so
  // "al lado de" is explained where it is taught and not four lessons early.
  // One that names none of the unit's words keeps its place in the list: the
  // nth tip opens the nth lesson, or the next one still free.
  const tipAt = new Map(); // teaching lesson index -> tip
  const unplaced = [];
  tips.forEach((tip, i) => {
    const bold = boldOf(tip);
    const li = chunks.findIndex((chunk, k) => !tipAt.has(k) && chunk.some((f) => mentions(bold, f)));
    if (li >= 0) tipAt.set(li, tip);
    else unplaced.push(i);
  });
  for (const i of unplaced) {
    const free = (k) => !tipAt.has(k);
    const li = [...chunks.keys()].find((k) => k >= i && free(k));
    if (i < chunks.length && li !== undefined) tipAt.set(li, tips[i]);
  }

  // Earlier sentences come back from inside the window (RECYCLE_BANDS): the
  // ones owed the most, and of a few of those the longest — past A1, where
  // the one owed the most is simply taken.
  const near = (s) => levelOfSentence(s) > level - RECYCLE_BANDS;
  const recycledHere = new Set(); // earlier sentences this unit already brought back
  const take = (pool, worth, n) => {
    const out = [];
    const left = pool.filter((s) => !recycledHere.has(s.id) && worth(s) > 0).sort((a, b) => worth(b) - worth(a));
    while (out.length < n && left.length) {
      let at = 0;
      for (let i = 1; i < Math.min(level ? PICK_AMONG : 1, left.length); i++) if (words(left[i]) > words(left[at])) at = i;
      const [s] = left.splice(at, 1);
      recycledHere.add(s.id);
      out.push(s);
    }
    return out;
  };
  // An old word no sentence in the window carries can only come back in a
  // sentence of its own: those are worth what such words are owed.
  let carried = null; // forms the window's sentences carry
  const stranded = (s) => {
    carried ??= new Set([...sentences, ...earlier.filter(near)].flatMap(contentOf));
    return contentOf(s).reduce((sum, id) => sum + (carried.has(id) ? 0 : owed(id)), 0);
  };
  const recycle = (n, old = 0) => {
    // The nearest level that has such a sentence gives it.
    const far = [];
    for (let b = level - RECYCLE_BANDS; b >= 0 && far.length < old; b--) {
      far.push(...take(earlier.filter((s) => levelOfSentence(s) === b), stranded, old - far.length));
    }
    return [...take(earlier.filter(near), debt, n - far.length), ...far];
  };

  const costOfChunk = (chunk) => chunk.reduce((sum, f) => sum + (light.get(f.id) ?? COST.full), 0);
  const planTeaching = (lesson, li) => {
    // What always closes the lesson, reserved before anything else is spent.
    // With the shape a lesson can hold as much as LESSON_COST to teach, and one
    // that full gives up its review: practice, the slang lesson and the check
    // all bring old words back, and the new ones are what this lesson is for.
    const crowded = template && costOfChunk(chunks[li]) > LESSON_ITEMS.max - 6;
    const hasReview = li > 0 && unit.course_order > 1 && !crowded;
    const hasMatch = chunks.slice(0, li + 1).flat().length >= 4;
    const tail = (hasReview ? REVIEW_COUNT : 0) + (hasMatch ? 1 : 0);

    // The lesson is planned in blocks and emitted once, so a screen added late
    // still lands where it belongs on the ramp.
    const head = []; // the tip
    const ramp = []; // teach · meaning · gap, per new word
    const pads = []; // meaning and gap added to fill the lesson out
    const make = []; // production: tiles
    const hear = []; // listening
    const metHere = []; // sentences shown in writing here, in the order shown
    const rung = new Map(); // sentence id -> highest rung it has reached here
    const shown = new Map(); // sentence id -> screens it has had here
    const planned = () => head.length + screensOf(ramp) + pads.length + make.length + hear.length + tail;
    const room = (s) => (shown.get(s.id) ?? 0) < SHOWN_MAX;
    const drill = (into, s, mode) => {
      into.push({ kind: 'drill', sentence_id: s.id, mode });
      use(s);
      shown.set(s.id, (shown.get(s.id) ?? 0) + 1);
      if (!rung.has(s.id)) metHere.push(s);
      rung.set(s.id, Math.max(rung.get(s.id) ?? 0, rungIndex(mode)));
    };
    const rungOf = (s) => rung.get(s.id) ?? 0;

    // The unit's pattern table opens its first lesson too: three lessons of
    // "lleves, tomes, busques" before being told what they are is too late.
    if (li === 0 && grammar?.tip) head.push({ kind: 'tip', tip_id: grammar.tip.id });
    const tip = tipAt.get(li);
    if (tip && tip.id !== grammar?.tip?.id) head.push({ kind: 'tip', tip_id: tip.id });

    // From A2 the lesson closes on two kinds of production — a word typed and
    // a sentence built — so it keeps a screen for each.
    const production = level ? MIN_PRODUCTION + 1 : MIN_PRODUCTION;
    const taughtHere = new Set();
    const read = []; // sentences met for their meaning, the ones with no gap first
    const gapped = [];
    for (const form of chunks[li]) {
      if (taught.has(form.id)) continue;
      // A word whose only sentences lean on another new word of this unit
      // gets that word taught just before it — pulled forward from a later
      // lesson if it has to be, or "hablo" never meets "castellano" in time.
      if (!bySize.some((s) => s.target_form_id === form.id && contentOf(s).every((id) => id === form.id || taught.has(id)))) {
        const helper = bySize.find(
          (s) =>
            s.target_form_id === form.id &&
            contentOf(s).every((id) => id === form.id || taught.has(id) || unitForms.some((f) => f.id === id)),
        );
        for (const id of helper ? contentOf(helper) : []) {
          if (id === form.id || taught.has(id)) continue;
          ramp.push({ kind: 'teach', form_id: id });
          taught.add(id);
          taughtHere.add(id);
        }
      }
      // Another form of a word she has: shown in a sentence (the app picks
      // it, src/lib/lesson.ts `case 'teach'`), then straight to the gap.
      const isLight = light.has(form.id);
      ramp.push({ kind: 'teach', form_id: form.id, ...(isLight ? { light: true } : {}) });
      taught.add(form.id);
      taughtHere.add(form.id);
      // Met for its meaning in the first sentence written for it — or, when
      // none of those can be said yet, in another word's sentence that uses
      // it. A word followed by sentences it isn't in has not been taught.
      const intro =
        byLevel.find((s) => s.target_form_id === form.id && fresh(s)) ??
        byLevel.find((s) => fresh(s) && contentOf(s).includes(form.id));
      if (intro && !isLight) drill(ramp, intro, 'sentence_meaning');
      else if (!intro) warnings.push(`${unit.slug}: no sayable sentence introduces "${form.form}"`);
      // Then the gap — and this is the screen a crowded lesson gives up first.
      // Teaching a word and meeting it are what the lesson is for; the gap is
      // practice, and practice is also what the unit check and SRS are for.
      // Giving it up keeps the lesson one sitting instead of letting the last
      // words of an oversized unit push it past twenty screens.
      const rest = chunks[li].slice(chunks[li].indexOf(form) + 1).filter((f) => !taught.has(f.id));
      // What the words still to come need at the least: a light one its gap too.
      const restScreens = rest.reduce((sum, f) => sum + (light.get(f.id) ?? COST.full), 0);
      // A light form has had no screen of the planner's yet: its gap is how
      // it is drilled, so it is kept where a full form's would be given up —
      // unless it only agrees ("alta" after "alto"), which being shown covers.
      const mayDrop = !isLight || light.get(form.id) === COST.pattern;
      const next =
        mayDrop && planned() + 1 + restScreens + production > LESSON_ITEMS.max
          ? undefined
          : (toDrill.find((s) => s.target_form_id === form.id && fresh(s)) ??
            (isLight ? toDrill.find((s) => fresh(s) && contentOf(s).includes(form.id)) : undefined));
      if (next) {
        drill(ramp, next, gapAs);
        gapped.push(next);
      }
      if (isLight) continue;
      if (intro && next) read.push(intro);
      else if (intro) read.unshift(intro);
    }

    // She hears what she has just read, where there is a recording — planned
    // before the closing screens, so a full lesson still has room to listen.
    for (const s of metHere) {
      if (hear.length >= LISTEN_PER_LESSON || planned() >= LESSON_ITEMS.max) break;
      if (!s.audio_path || !room(s)) continue;
      hear.push({ kind: 'drill', sentence_id: s.id, mode: 'sentence_listen' });
      shown.set(s.id, (shown.get(s.id) ?? 0) + 1);
    }

    // It closes on production: from A2 a word typed into a sentence she has
    // read here, then tiles for what it just gapped, then a longer sentence of
    // the unit that is sayable by now.
    const typed = level ? read.slice(0, TEACH_TYPED) : [];
    const closing = [0, 1].flatMap((i) => [[typed[i], TYPED], [gapped[i], 'sentence_build']]).filter(([s]) => s && room(s));
    // Not the sentence she has just answered, when another can go first.
    if (closing.length > 1 && closing[0][0].id === ramp.at(-1)?.sentence_id) closing.unshift(...closing.splice(1, 1));
    for (const [s, mode] of closing) if (planned() < LESSON_ITEMS.max) drill(make, s, mode);
    // A lesson too full to type anything types its last gap instead of picking it.
    if (level && !make.some((slot) => slot.mode === TYPED)) {
      const last = ramp.findLast((slot) => slot.mode === 'sentence_gap');
      if (last) last.mode = TYPED;
    }
    const longer = owing(bySizeDesc.filter(fresh).slice(0, PICK_AMONG));
    if (longer && planned() < LESSON_ITEMS.max) drill(make, longer, 'sentence_build');
    // With the shape a unit has one practice lesson where it had two or three,
    // so its teaching lessons do part of that work: where there is room, a
    // sentence or two from earlier units that carry words owed a comeback.
    if (template) {
      for (const back of recycle(Math.min(TEACH_RECYCLED, LESSON_ITEMS.max - planned()))) drill(pads, back, gapAs);
    }

    // A lesson that still runs short is topped up from the unit's other
    // sentences — the ones that carry this lesson's words before the rest —
    // easiest first and up the same ramp; from B1 the ramp starts at the gap,
    // since a meaning is only picked for a word's first meeting. When the
    // unit has none left — a thin unit, which the warnings say — a sentence it
    // has already shown is taken one rung higher instead, which is the ladder
    // doing what it is for rather than filler. Never to a third screen: a
    // lesson that would need one runs short and says so.
    const steps = level >= 2 ? [...new Set([gapAs, TYPED, 'sentence_build'])] : RAMP;
    const ofLesson = (s) => contentOf(s).some((id) => taughtHere.has(id));
    for (let k = 0; planned() < LESSON_ITEMS.min; k += 1) {
      const want = steps[k % steps.length];
      const left = (want === 'sentence_build' ? bySizeDesc : toDrill).filter(fresh);
      const pad = owing([...left.filter(ofLesson), ...left.filter((s) => !ofLesson(s))].slice(0, PICK_AMONG));
      if (pad) {
        drill(want === 'sentence_build' ? make : pads, pad, want);
        continue;
      }
      const again = metHere.filter((s) => room(s) && rungOf(s) < RAMP.length - 1).sort((a, b) => rungOf(a) - rungOf(b))[0];
      // With the shape a unit keeps all its lessons however little it teaches:
      // one with nothing of its own left brings back earlier units' sentences.
      const back = !again && template ? recycle(1)[0] : undefined;
      if (back) {
        drill(want === 'sentence_build' && buildable(back) ? make : pads, back, want === 'sentence_build' && buildable(back) ? want : gapAs);
        continue;
      }
      if (!again) {
        warnings.push(
          `${unit.slug} lesson ${lesson.ordinal}: ${planned()} screens, wants ${LESSON_ITEMS.min} — ` +
            'the unit has no sentence left to fill it with.',
        );
        break;
      }
      const up = RAMP[rungOf(again) + 1];
      drill(up === 'sentence_build' ? make : pads, again, up === 'sentence_gap' ? gapAs : up);
    }

    for (const slot of [...head, ...ramp, ...pads, ...make, ...hear]) push(lesson, slot);
    if (hasReview) push(lesson, { kind: 'review', review_count: REVIEW_COUNT });
    if (hasMatch) push(lesson, { kind: 'match' });
    if (planned() > LESSON_ITEMS.max) {
      warnings.push(`${unit.slug} lesson ${lesson.ordinal}: ${planned()} screens, over the ${LESSON_ITEMS.max} a lesson may run.`);
    }
  };

  // Practice lessons teach nothing new: they are the unit's words again, in
  // sentences she hasn't met yet, before the next unit leans on them. Each
  // opens on a review of earlier units, and holds four kinds of work, spaced
  // so no sentence is asked twice in a row — the tiles for a sentence come
  // screens after its gap, never right on top of it, where they'd be copying:
  //
  //   gaps      fresh sentences of the unit, the word picked
  //   recycled  sentences of earlier units carrying words owed a comeback
  //   typed     sentences she has met, the word typed rather than picked
  //   tiles     the gapped sentences again, built — in reverse order
  const practice = unit.lessons.filter((l) => l.kind === 'practice' && (template || l.title_en !== GRAMMAR_TITLE));
  const drills = template ? [] : unit.lessons.filter((l) => l.kind === 'practice' && l.title_en === GRAMMAR_TITLE);
  const rungs = new Map(); // sentence id -> highest rung reached in any lesson
  const climbed = () => {
    for (const s of slots) {
      if (s.sentence_id) rungs.set(s.sentence_id, Math.max(rungs.get(s.sentence_id) ?? 0, rungIndex(s.mode)));
    }
  };
  // With the shape, a unit's one practice is its grammar practice too: the
  // sentences that carry the unit's grammar go first, its own and earlier ones.
  const focus = template && grammar ? grammar.formIds : null;
  const carriesFocus = (s) => !!focus && contentOf(s).some((id) => focus.has(id));
  const planPractice = (lesson, pi, ownTip = null) => {
    climbed();
    // A practice unit has no teaching lesson to show its tips: its practice
    // lessons open on them, one each.
    const tip = ownTip ?? (review.size ? tips[pi] : null);
    const head = [];
    if (tip) head.push({ kind: 'tip', tip_id: tip.id });
    head.push({ kind: 'review', review_count: REVIEW_COUNT });
    const inLesson = new Set();
    const mark = (s, mode) => {
      use(s);
      inLesson.add(s.id);
      rungs.set(s.id, Math.max(rungs.get(s.id) ?? 0, rungIndex(mode)));
      return { kind: 'drill', sentence_id: s.id, mode };
    };

    const gaps = [];
    for (let i = 0; i < PRACTICE_GAPS; i++) {
      const open = toPractise.filter((x) => fresh(x) && !inLesson.has(x.id));
      const s = owing((focus && open.some(carriesFocus) ? open.filter(carriesFocus) : open).slice(0, PICK_AMONG));
      if (!s) break;
      gaps.push(s);
      inLesson.add(s.id);
    }
    const wantBack = PRACTICE_RECYCLED + (template ? SHAPED_PRACTICE_RECYCLED : 0) + (PRACTICE_GAPS - gaps.length);
    // Half of what comes back carries the grammar, where earlier units have it.
    const onGrammar = focus ? take(earlier.filter((x) => near(x) && carriesFocus(x)), (x) => 1 + debt(x), Math.ceil(wantBack / 2)) : [];
    const back = [...onGrammar, ...recycle(wantBack - onGrammar.length, pi === 0 ? PRACTICE_OLD : 0)];
    // Typed: what the teaching lessons showed, least practised first — one
    // more of them from B1.
    const met = toPractise
      .filter((x) => sayable(x) && used.has(x.id) && !inLesson.has(x.id))
      .sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0));
    const typed = typing ? met.slice(0, PRACTICE_TYPED + (level >= 2 ? 1 : 0)) : [];
    for (const s of typed) inLesson.add(s.id);

    const body = [];
    for (const s of gaps) body.push(mark(s, gapAs));
    back.forEach((s, i) => body.push(mark(s, i % 2 === 0 || !buildable(s) ? gapAs : 'sentence_build')));
    for (const s of typed) body.push(mark(s, TYPED));
    for (const s of [...gaps].reverse()) body.push(mark(s, 'sentence_build'));

    // Short of the window: what the unit has shown, a rung up, then typed.
    const planned = () => head.length + REVIEW_COUNT - 1 + body.length + 1;
    while (planned() < LESSON_ITEMS.min) {
      const again = toPractise
        .filter((s) => sayable(s) && used.has(s.id) && !inLesson.has(s.id) && (rungs.get(s.id) ?? 0) < RAMP.length - 1)
        .sort((a, b) => (rungs.get(a.id) ?? 0) - (rungs.get(b.id) ?? 0) || (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0))[0];
      if (!again) break;
      const up = RAMP[(rungs.get(again.id) ?? 0) + 1];
      body.push(mark(again, up === 'sentence_gap' ? gapAs : up));
    }
    while (planned() < LESSON_ITEMS.min) {
      const more = recycle(1)[0];
      if (!more) break;
      body.push(mark(more, gapAs));
    }
    while (planned() > LESSON_ITEMS.max) body.pop();
    // A practice unit's first lessons have met nothing yet to type: from A2
    // one of their gaps is typed instead, as in a teaching lesson.
    if (template && typing && level && !body.some((slot) => slot.mode === TYPED)) {
      const last = body.findLast((slot) => slot.mode === 'sentence_gap');
      if (last) last.mode = TYPED;
    }
    spaceOut(body);
    if (planned() < LESSON_ITEMS.min) {
      warnings.push(`${unit.slug} ${lesson.title_en ?? `lesson ${lesson.ordinal}`}: ${planned()} screens, wants ${LESSON_ITEMS.min} — the unit is out of sentences.`);
    }
    for (const slot of head) push(lesson, slot);
    for (const slot of body) push(lesson, slot);
    push(lesson, { kind: 'match' });
  };

  // The slang lesson (a unit with the shape) opens on its cards: Argentine
  // words from the Words tab, dealt by slang-cards.mjs and played by the app
  // with no slots at all. Where the unit also teaches slang as course words
  // (docs/course/slang-lessons.yaml), the lesson goes on to these slots: each
  // word taught like any other — card, meaning, gap, then one of them typed or
  // built — and a review of the slang she already knows, weakest first
  // (`recap` with scope 'slang', src/lib/lesson.ts).
  const planSlang = (lesson) => {
    if (!slangForms.length) return;
    const body = [];
    const shown = [];
    for (const form of slangForms) {
      if (taught.has(form.id)) continue;
      const isLight = light.has(form.id);
      body.push({ kind: 'teach', form_id: form.id, ...(isLight ? { light: true } : {}) });
      taught.add(form.id);
      const own = byLevel.filter((s) => fresh(s) && (s.target_form_id === form.id || contentOf(s).includes(form.id)));
      own.sort((a, b) => (b.target_form_id === form.id) - (a.target_form_id === form.id));
      const [intro, next] = isLight ? [null, own[0]] : own;
      if (!own.length) warnings.push(`${unit.slug}: no sayable sentence introduces "${form.form}"`);
      for (const [s, mode] of [[intro, 'sentence_meaning'], [next, gapAs]]) {
        if (!s) continue;
        body.push({ kind: 'drill', sentence_id: s.id, mode });
        use(s);
        shown.push(s);
      }
    }
    // One screen of production for each new word, the longest it can build.
    for (const form of slangForms) {
      const s = [...shown].reverse().find((x) => contentOf(x).includes(form.id) && buildable(x) && body.filter((b) => b.sentence_id === x.id).length < SHOWN_MAX);
      if (s && !body.some((b) => b.sentence_id === s.id && b.mode === 'sentence_build')) {
        body.push({ kind: 'drill', sentence_id: s.id, mode: typing && level ? TYPED : 'sentence_build' });
      }
    }
    for (const slot of body) push(lesson, slot);
    const spent = screensOf(body);
    // Never none: a lesson its new words already fill still closes on two of the old ones.
    const review = Math.max(2, Math.min(LESSON_ITEMS.max - spent, Math.max(LESSON_ITEMS.min - spent, 3)));
    push(lesson, { kind: 'recap', review_count: review, scope: 'slang' });
    if (spent + review > LESSON_ITEMS.max) warnings.push(`${unit.slug} slang lesson: ${spent + review} screens, over the ${LESSON_ITEMS.max} a lesson may run.`);
  };

  if (template) {
    // In the order she takes them: what a lesson may use is what the ones
    // before it taught.
    let li = 0;
    let pi = 0;
    for (const lesson of [...unit.lessons].sort((a, b) => a.ordinal - b.ordinal)) {
      if (lesson.kind === 'slang') planSlang(lesson);
      else if (practiceUnit ? lesson.kind === 'lesson' || lesson.kind === 'practice' : lesson.kind === 'practice') planPractice(lesson, pi++);
      else if (lesson.kind === 'lesson' && chunks[li]?.length === 0 && li > 0) {
        // Nothing left to teach: the lesson practises, on the tip it would have opened with.
        planPractice(lesson, pi++, tipAt.get(li) ?? null);
        li += 1;
      } else if (lesson.kind === 'lesson') planTeaching(lesson, li++);
    }
  } else {
    teaching.forEach((lesson, li) => planTeaching(lesson, li));
    practice.forEach((lesson, pi) => planPractice(lesson, pi));
  }

  // Grammar practice (docs/course/grammar-practice.yaml): the unit's grammar
  // on its own, in sentences from this unit and earlier ones that carry it.
  // The first opens on the whole pattern as a table. The work is the gap, the
  // same gap typed a few screens later, and other sentences built from tiles:
  //
  //   gap 1 · gap 2 · gap 3 · tiles 4 · typed 1 · gap 5 · tiles 6 · typed 2 ·
  //   gap 7 · typed 3 · tiles 8 · typed 5
  //
  // From B2 the gap is typed to begin with, and its second pass is the tiles.
  if (drills.length && grammar) {
    const focusIds = grammar.formIds;
    const carries = (s) => contentOf(s).some((id) => focusIds.has(id));
    const aimsAt = (s) => focusIds.has(s.target_form_id);
    const own = sentences.filter((s) => sayable(s) && carries(s));
    // Earlier sentences from inside the recycling window, unless only older
    // ones carry the grammar.
    const carriers = earlier.filter(carries);
    const before = carriers.some(near) ? carriers.filter(near) : carriers;
    const shown = new Map(); // sentence id -> times in grammar lessons
    // The tokens can't tell the article "la" from the pronoun: a pronoun is
    // the one right in front of a verb.
    const isVerb = (t) => (t?.form_ids ?? []).some((id) => formById.get(id)?.features?.tense);
    const hasGlue = (s) =>
      s.tokens.some((t, i) => (t.form_ids ?? []).some((id) => grammar.glueIds?.has(id)) && isVerb(s.tokens[i + 1]));
    const carried = (s) => contentOf(s).filter((id) => focusIds.has(id)).length;
    const rank = (s) =>
      (aimsAt(s) ? 4 : 0) + Math.min(2, carried(s) - 1) + (hasGlue(s) ? 2 : 0) + (grammar.newIds.has(s.target_form_id) ? 2 : 0) + Math.min(2, debt(s) / 2) -
      3 * (shown.get(s.id) ?? 0) - (s.unit_id === unit.id ? 0 : 0.5);
    const best = (list, taken, want) => {
      const ok = list.filter((s) => !taken.has(s.id) && (!want || want(s)));
      ok.sort((a, b) => rank(b) - rank(a) || words(a) - words(b));
      return ok[0];
    };
    drills.forEach((lesson, di) => {
      const taken = new Set();
      // Alternate the unit's own sentences with earlier ones, so the pattern
      // meets both the new words and the old.
      const picks = [];
      for (let i = 0; i < 8; i++) {
        const want = i % 2 === 0 ? own : before.length ? before : own;
        const s =
          best(want, taken, i === 3 || i === 5 || i === 7 ? buildable : aimsAt) ??
          best([...own, ...before], taken, i === 3 || i === 5 || i === 7 ? buildable : null) ??
          best([...own, ...before], new Set(), null);
        if (!s) break;
        taken.add(s.id);
        shown.set(s.id, (shown.get(s.id) ?? 0) + 1);
        picks.push(s);
      }
      if (picks.length < 4) {
        warnings.push(`${unit.slug} ${GRAMMAR_TITLE} ${di + 1}: only ${picks.length} sentences carry the unit's grammar.`);
      }
      const typedMode = level >= 3 || !typing ? 'sentence_build' : TYPED;
      const plan = [
        [0, gapAs], [1, gapAs], [2, gapAs], [3, 'sentence_build'],
        [0, typedMode], [4, gapAs], [5, 'sentence_build'], [1, typedMode],
        [6, gapAs], [2, typedMode], [7, 'sentence_build'], [4, typedMode],
      ];
      if (di === 0 && grammar.tip) push(lesson, { kind: 'tip', tip_id: grammar.tip.id });
      push(lesson, { kind: 'review', review_count: REVIEW_COUNT });
      const screens = new Map(); // sentence id -> screens it has had here
      for (const [i, mode] of plan) {
        const s = picks[i];
        // A thin unit picks a sentence twice over; it still gets two screens.
        if (!s || (screens.get(s.id) ?? 0) >= SHOWN_MAX) continue;
        screens.set(s.id, (screens.get(s.id) ?? 0) + 1);
        use(s);
        push(lesson, { kind: 'drill', sentence_id: s.id, mode });
      }
      push(lesson, { kind: 'match' });
    });
  } else if (drills.length) {
    warnings.push(`${unit.slug}: ${drills.length} ${GRAMMAR_TITLE} lesson(s) but no entry in grammar-practice.yaml`);
  }

  if (check) {
    // The check is a recap plus production, sized to the same window.
    const builds = bySizeDesc.filter(sayable).slice(0, 3);
    // A practice unit has no words of its own to recap: its check draws on
    // the section so far, which is what it has been practising.
    push(check, {
      kind: 'recap',
      review_count: Math.min(LESSON_ITEMS.max - builds.length, Math.max(LESSON_ITEMS.min - builds.length, unitForms.length + slangForms.length)),
      scope: review.size ? 'section' : 'unit',
    });
    for (const s of builds) push(check, { kind: 'drill', sentence_id: s.id, mode: 'sentence_build' });
  }

  for (const f of [...unitForms, ...slangForms]) {
    const count = sentences.filter((s) => contentOf(s).includes(f.id)).length;
    if (count < 3) warnings.push(`${unit.slug}: "${f.form}" has ${count} approved sentence(s); lessons want 3 or more`);
  }
  return { slots, warnings };
}

/**
 * Reorders drills in place so no sentence comes twice in a row: a screen that
 * would repeat the one before it waits for the next that doesn't. One that
 * can't be placed apart at all is dropped rather than shown back to back.
 */
function spaceOut(body) {
  const out = [];
  let waiting = [];
  for (const slot of body) {
    const next = [];
    for (const w of waiting) {
      if (out.at(-1)?.sentence_id !== w.sentence_id) out.push(w);
      else next.push(w);
    }
    waiting = next;
    if (out.at(-1)?.sentence_id === slot.sentence_id) waiting.push(slot);
    else out.push(slot);
  }
  for (const w of waiting) if (out.at(-1)?.sentence_id !== w.sentence_id) out.push(w);
  body.splice(0, body.length, ...out);
}

/**
 * The lesson linters, over a unit's planned slots the way they would look at
 * hand-written lessons: one line a problem, named by its rule. Length is
 * counted in screens, not slots — a review slot stands for several, and a new
 * word for two.
 *
 * @param sentenceById  every sentence a slot may point at
 * @param formById      the outline's forms
 * @param level, levelOfSentence  as `planLessons` takes them
 */
export function lintLessons({ unit, slots, sentenceById, formById, level = 0, levelOfSentence = () => level }) {
  const lint = [];
  for (const l of unit.lessons) {
    const own = slots.filter((s) => s.lesson_id === l.id);
    const say = (rule, what) => lint.push(`lesson ${l.ordinal}: ${rule} — ${what}`);
    if (!own.length) {
      // A slang lesson with no course word of its own is its cards (slang-cards.mjs).
      if (l.kind !== 'slang') lint.push(`lesson ${l.ordinal} (${l.title_en}): empty`);
      continue;
    }
    const teaching = l.kind === 'lesson' || l.kind === 'checkpoint';
    const teach = own.filter((s) => s.kind === 'teach');
    const drills = own.filter((s) => s.kind === 'drill' && sentenceById.has(s.sentence_id));
    const carries = (slot, formId) => sentenceById.get(slot.sentence_id).tokens.some((t) => (t.form_ids ?? []).includes(formId));
    const screens = screensOf(own);
    const newWords = new Set(teach.map((s) => formById.get(s.form_id)?.lemma_id ?? s.form_id)).size;
    if (unit.template ? newWords > LESSON_WORDS.max : l.kind === 'lesson' && teach.length > FORMS_PER_LESSON) {
      say('lesson.density', unit.template ? `${newWords} new words (the ceiling is ${LESSON_WORDS.max})` : `${teach.length} new forms (the ceiling is ${FORMS_PER_LESSON})`);
    }
    if (screens < LESSON_ITEMS.min || screens > LESSON_ITEMS.max) {
      say('lesson.length', `${screens} screens (want ${LESSON_ITEMS.min}–${LESSON_ITEMS.max})`);
    }
    // A sentence on a third screen is answered from memory of the second.
    const times = new Map();
    for (const s of drills) times.set(s.sentence_id, (times.get(s.sentence_id) ?? 0) + 1);
    for (const [id, n] of times) {
      if (n > SHOWN_MAX) say('lesson.repeat', `"${sentenceById.get(id).es ?? id}" is on ${n} screens (at most ${SHOWN_MAX})`);
    }
    // A word on a card and in no sentence after it has not been taught.
    for (const t of teach) {
      // A light teach is itself the word in a sentence (src/lib/lesson.ts).
      if (t.light) continue;
      const after = own.slice(own.indexOf(t) + 1).filter((s) => drills.includes(s));
      if (!after.some((s) => carries(s, t.form_id))) {
        say('lesson.unused', `${unit.slug} teaches "${formById.get(t.form_id)?.form ?? t.form_id}" and no sentence after it uses it`);
      }
    }
    const tips = own.filter((s) => s.kind === 'tip').map((s) => s.tip_id);
    if (new Set(tips).size < tips.length) say('lesson.tip', 'the same tip twice');
    // The level's work: a typed gap in a teaching lesson from A2, and from
    // B1 no meaning picked for a sentence that meets none of its new words.
    if (teaching && level >= 1 && drills.length && !drills.some((s) => s.mode === TYPED)) {
      say('lesson.typed', `no typed gap (every teaching lesson has one from ${BANDS[1]})`);
    }
    if (level >= 2) {
      const stale = drills.filter((s) => s.mode === 'sentence_meaning' && !teach.some((t) => carries(s, t.form_id)));
      if (stale.length) say('lesson.meaning', `${stale.length} meaning screen(s) for words already met (from ${BANDS[2]} only a first meeting)`);
    }
    const old = drills.filter((s) => levelOfSentence(sentenceById.get(s.sentence_id)) <= level - RECYCLE_BANDS);
    if (old.length > PRACTICE_OLD) {
      say('lesson.window', `${old.length} sentences from more than a level below (at most ${PRACTICE_OLD}, for a word nothing nearer carries)`);
    }
  }
  return lint;
}

export { itemsOf, screensOf };
