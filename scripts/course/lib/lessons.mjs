// Proposes a unit's lesson slots from its approved sentences (docs/course-spec
// §4 "Assemble", shaped by docs/learning-engine-spec.md §5): the unit's new
// forms spread over its teaching lessons, each one taught, met in a sentence
// for its meaning, then drilled harder — and a last lesson that is the unit
// check. Pure; the reviewer reorders the proposal in the dashboard.
import { FORMS_PER_LESSON, drillable } from './outline.mjs';


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
 * the full ramp (teach · meaning · gap) is 9 of the 16 screens.
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

/** The rungs a sentence climbs inside one lesson (§5.2). */
const RAMP = ['sentence_meaning', 'sentence_gap', 'sentence_build'];

/** What a slot costs the budget: one screen, unless it stands for several. */
const itemsOf = (slot) => (slot.kind === 'review' || slot.kind === 'recap' ? (slot.review_count ?? 0) : 1);

/**
 * @param unit       outline unit (with lessons: [{id, ordinal, kind}])
 * @param forms      outline forms (all units)
 * @param sentences  approved or published sentence rows of this unit
 *                   ({id, target_form_id, tokens:[{form_ids}], difficulty, audio_path})
 * @param tips       the unit's tips, in order
 * @returns {{ slots, warnings }}
 */
export function planLessons({ unit, forms, sentences, tips, earlier = [], debt = () => 0, grammar = null }) {
  const warnings = [];
  // Typing a word is production she can only do once the letters of the
  // course are familiar: from the unit after vos on, practice types.
  const typing = unit.course_order >= TYPING_FROM;
  const formById = new Map(forms.map((f) => [f.id, f]));
  // A practice unit teaches nothing: its words are the earlier ones it reviews.
  const review = new Set(unit.review_form_ids ?? []);
  const unitForms = review.size ? forms.filter((f) => review.has(f.id)) : forms.filter((f) => f.unit_id === unit.id && drillable(f));
  const teaching = unit.lessons.filter((l) => l.kind === 'lesson' || l.kind === 'checkpoint');
  const check = unit.lessons.find((l) => l.kind === 'review');
  if (!teaching.length && !review.size) return { slots: [], warnings: [`${unit.slug}: no teaching lessons`] };

  const taught = new Set(forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.id));
  const contentOf = (s) => [...new Set(s.tokens.flatMap((t) => t.form_ids))].filter((id) => formById.has(id) && drillable(formById.get(id)));
  const sayable = (s) => contentOf(s).every((id) => taught.has(id));
  const used = new Map(); // sentence id -> times used
  const use = (s) => used.set(s.id, (used.get(s.id) ?? 0) + 1);
  const fresh = (s) => sayable(s) && !used.has(s.id);
  const bySize = [...sentences].sort((a, b) => words(a) - words(b) || a.difficulty - b.difficulty);
  const bySizeDesc = [...bySize].reverse();
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
    });

  // Forms over lessons, as even as they divide. A unit whose words don't fit at
  // FORMS_PER_LESSON still teaches all of them — a word left untaught makes its
  // sentences unsayable — but it says how many lessons it actually wants.
  const n = unitForms.length;
  const sizes = teaching.map((_, i) => Math.floor(n / teaching.length) + (i < n % teaching.length ? 1 : 0));
  if (sizes.length && sizes[0] > FORMS_PER_LESSON) {
    warnings.push(
      `${unit.slug}: ${n} words over ${teaching.length} teaching lessons is ${sizes[0]} a lesson, past the ceiling of ` +
        `${FORMS_PER_LESSON}. The lessons still fit ${LESSON_ITEMS.max} screens, but the words past the ceiling are ` +
        `taught and met without their gap. The unit wants ${Math.ceil(n / FORMS_PER_LESSON)} teaching lessons.`,
    );
  }
  let at = 0;
  const chunks = sizes.map((size) => unitForms.slice(at, (at += size)));

  teaching.forEach((lesson, li) => {
    // What always closes the lesson, reserved before anything else is spent.
    const hasReview = li > 0 && unit.course_order > 1;
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
    const planned = () => head.length + ramp.length + pads.length + make.length + hear.length + tail;
    const drill = (into, s, mode) => {
      into.push({ kind: 'drill', sentence_id: s.id, mode });
      use(s);
      if (!rung.has(s.id)) metHere.push(s);
      rung.set(s.id, Math.max(rung.get(s.id) ?? 0, RAMP.indexOf(mode)));
    };
    const rungOf = (s) => rung.get(s.id) ?? 0;

    if (tips[li]) head.push({ kind: 'tip', tip_id: tips[li].id });

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
        }
      }
      ramp.push({ kind: 'teach', form_id: form.id });
      taught.add(form.id);
      // Met for its meaning in the shortest sentence written for it.
      const intro = bySize.find((s) => s.target_form_id === form.id && fresh(s));
      if (intro) drill(ramp, intro, 'sentence_meaning');
      else warnings.push(`${unit.slug}: no sayable sentence introduces "${form.form}"`);
      // Then the gap — and this is the screen a crowded lesson gives up first.
      // Teaching a word and meeting it are what the lesson is for; the gap is
      // practice, and practice is also what the unit check and SRS are for.
      // Giving it up keeps the lesson one sitting instead of letting the last
      // words of an oversized unit push it past twenty screens.
      const rest = chunks[li].slice(chunks[li].indexOf(form) + 1).filter((f) => !taught.has(f.id)).length;
      if (planned() + 1 + 2 * rest + MIN_PRODUCTION > LESSON_ITEMS.max) continue;
      const next = bySize.find((s) => s.target_form_id === form.id && fresh(s));
      if (next) {
        drill(ramp, next, 'sentence_gap');
        gapped.push(next);
      }
    }

    // It closes on production: tiles for what it just gapped, then a longer
    // sentence of the unit that is sayable by now.
    for (const s of gapped.slice(0, 2)) if (planned() < LESSON_ITEMS.max) drill(make, s, 'sentence_build');
    const longer = owing(bySizeDesc.filter(fresh).slice(0, PICK_AMONG));
    if (longer && planned() < LESSON_ITEMS.max) drill(make, longer, 'sentence_build');

    // Then she hears what she has just read, where there is a recording.
    for (const s of metHere) {
      if (hear.length >= LISTEN_PER_LESSON || planned() >= LESSON_ITEMS.max) break;
      if (s.audio_path) hear.push({ kind: 'drill', sentence_id: s.id, mode: 'sentence_listen' });
    }

    // A lesson that still runs short is topped up from the unit's other
    // sentences, easiest first and up the same ramp. When the unit has none
    // left — a thin unit, which the warnings say — a sentence it has already
    // shown is taken one rung higher instead, which is the ladder doing what
    // it is for rather than filler.
    for (let k = 0; planned() < LESSON_ITEMS.min; k += 1) {
      const want = RAMP[k % RAMP.length];
      const pad = owing((want === 'sentence_build' ? bySizeDesc : bySize).filter(fresh).slice(0, PICK_AMONG));
      if (pad) {
        drill(want === 'sentence_build' ? make : pads, pad, want);
        continue;
      }
      const again = metHere.filter((s) => rungOf(s) < RAMP.length - 1).sort((a, b) => rungOf(a) - rungOf(b))[0];
      if (!again) {
        warnings.push(
          `${unit.slug} lesson ${lesson.ordinal}: ${planned()} screens, wants ${LESSON_ITEMS.min} — ` +
            'the unit has no sentence left to fill it with.',
        );
        break;
      }
      const up = RAMP[rungOf(again) + 1];
      drill(up === 'sentence_build' ? make : pads, again, up);
    }

    for (const slot of [...head, ...ramp, ...pads, ...make, ...hear]) push(lesson, slot);
    if (hasReview) push(lesson, { kind: 'review', review_count: REVIEW_COUNT });
    if (hasMatch) push(lesson, { kind: 'match' });
    if (planned() > LESSON_ITEMS.max) {
      warnings.push(`${unit.slug} lesson ${lesson.ordinal}: ${planned()} screens, over the ${LESSON_ITEMS.max} a lesson may run.`);
    }
  });

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
  const practice = unit.lessons.filter((l) => l.kind === 'practice' && l.title_en !== GRAMMAR_TITLE);
  const drills = unit.lessons.filter((l) => l.kind === 'practice' && l.title_en === GRAMMAR_TITLE);
  const rungs = new Map(); // sentence id -> highest rung reached in any lesson
  for (const s of slots) {
    if (s.sentence_id) rungs.set(s.sentence_id, Math.max(rungs.get(s.sentence_id) ?? 0, RAMP.indexOf(s.mode)));
  }
  const recycledHere = new Set(); // earlier sentences this unit already brought back
  const recycle = (n) => {
    const out = [];
    const pool = earlier.filter((s) => !recycledHere.has(s.id) && debt(s) > 0);
    while (out.length < n && pool.length) {
      let at = 0;
      for (let i = 1; i < pool.length; i++) if (debt(pool[i]) > debt(pool[at])) at = i;
      const [s] = pool.splice(at, 1);
      recycledHere.add(s.id);
      out.push(s);
    }
    return out;
  };
  const buildable = (s) => words(s) <= BUILD_WORDS_MAX;

  practice.forEach((lesson, pi) => {
    // A practice unit has no teaching lesson to show its tips: its practice
    // lessons open on them, one each.
    const tip = review.size ? tips[pi] : null;
    const head = [];
    if (tip) head.push({ kind: 'tip', tip_id: tip.id });
    head.push({ kind: 'review', review_count: REVIEW_COUNT });
    const inLesson = new Set();
    const mark = (s, mode) => {
      use(s);
      inLesson.add(s.id);
      rungs.set(s.id, Math.max(rungs.get(s.id) ?? 0, RAMP.indexOf(mode === 'sentence_gap_typed' ? 'sentence_gap' : mode)));
      return { kind: 'drill', sentence_id: s.id, mode };
    };

    const gaps = [];
    for (let i = 0; i < PRACTICE_GAPS; i++) {
      const s = owing(bySize.filter((x) => fresh(x) && !inLesson.has(x.id)).slice(0, PICK_AMONG));
      if (!s) break;
      gaps.push(s);
      inLesson.add(s.id);
    }
    const back = recycle(PRACTICE_RECYCLED + (PRACTICE_GAPS - gaps.length));
    // Typed: what the teaching lessons showed, least practised first.
    const met = bySize
      .filter((x) => sayable(x) && used.has(x.id) && !inLesson.has(x.id))
      .sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0));
    const typed = typing ? met.slice(0, PRACTICE_TYPED) : [];
    for (const s of typed) inLesson.add(s.id);

    const body = [];
    for (const s of gaps) body.push(mark(s, 'sentence_gap'));
    back.forEach((s, i) => body.push(mark(s, i % 2 === 0 || !buildable(s) ? 'sentence_gap' : 'sentence_build')));
    for (const s of typed) body.push(mark(s, 'sentence_gap_typed'));
    for (const s of [...gaps].reverse()) body.push(mark(s, 'sentence_build'));

    // Short of the window: what the unit has shown, a rung up, then typed.
    const planned = () => head.length + REVIEW_COUNT - 1 + body.length + 1;
    while (planned() < LESSON_ITEMS.min) {
      const again = bySize
        .filter((s) => sayable(s) && used.has(s.id) && !inLesson.has(s.id) && (rungs.get(s.id) ?? 0) < RAMP.length - 1)
        .sort((a, b) => (rungs.get(a.id) ?? 0) - (rungs.get(b.id) ?? 0) || (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0))[0];
      if (!again) break;
      body.push(mark(again, RAMP[(rungs.get(again.id) ?? 0) + 1]));
    }
    while (planned() < LESSON_ITEMS.min) {
      const more = recycle(1)[0];
      if (!more) break;
      body.push(mark(more, 'sentence_gap'));
    }
    while (planned() > LESSON_ITEMS.max) body.pop();
    spaceOut(body);
    if (planned() < LESSON_ITEMS.min) {
      warnings.push(`${unit.slug} ${lesson.title_en ?? `lesson ${lesson.ordinal}`}: ${planned()} screens, wants ${LESSON_ITEMS.min} — the unit is out of sentences.`);
    }
    for (const slot of head) push(lesson, slot);
    for (const slot of body) push(lesson, slot);
    push(lesson, { kind: 'match' });
  });

  // Grammar practice (docs/course/grammar-practice.yaml): the unit's grammar
  // on its own, in sentences from this unit and earlier ones that carry it.
  // The first opens on the whole pattern as a table. The work is the gap, the
  // same gap typed a few screens later, and other sentences built from tiles:
  //
  //   gap 1 · gap 2 · gap 3 · tiles 4 · typed 1 · gap 5 · tiles 6 · typed 2 ·
  //   gap 7 · typed 3 · tiles 8 · typed 5
  if (drills.length && grammar) {
    const focusIds = grammar.formIds;
    const carries = (s) => contentOf(s).some((id) => focusIds.has(id));
    const aimsAt = (s) => focusIds.has(s.target_form_id);
    const own = sentences.filter((s) => sayable(s) && carries(s));
    const before = earlier.filter(carries);
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
      const typedMode = typing ? 'sentence_gap_typed' : 'sentence_build';
      const plan = [
        [0, 'sentence_gap'], [1, 'sentence_gap'], [2, 'sentence_gap'], [3, 'sentence_build'],
        [0, typedMode], [4, 'sentence_gap'], [5, 'sentence_build'], [1, typedMode],
        [6, 'sentence_gap'], [2, typedMode], [7, 'sentence_build'], [4, typedMode],
      ];
      if (di === 0 && grammar.tip) push(lesson, { kind: 'tip', tip_id: grammar.tip.id });
      push(lesson, { kind: 'review', review_count: REVIEW_COUNT });
      for (const [i, mode] of plan) {
        const s = picks[i];
        if (!s) continue;
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
      review_count: Math.min(LESSON_ITEMS.max - builds.length, Math.max(LESSON_ITEMS.min - builds.length, unitForms.length)),
      scope: review.size ? 'section' : 'unit',
    });
    for (const s of builds) push(check, { kind: 'drill', sentence_id: s.id, mode: 'sentence_build' });
  }

  for (const f of unitForms) {
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

export { itemsOf };
