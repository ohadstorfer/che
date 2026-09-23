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
export function planLessons({ unit, forms, sentences, tips }) {
  const warnings = [];
  const formById = new Map(forms.map((f) => [f.id, f]));
  const unitForms = forms.filter((f) => f.unit_id === unit.id && drillable(f));
  const teaching = unit.lessons.filter((l) => l.kind === 'lesson' || l.kind === 'checkpoint');
  const check = unit.lessons.find((l) => l.kind === 'review');
  if (!teaching.length) return { slots: [], warnings: [`${unit.slug}: no teaching lessons`] };

  const taught = new Set(forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.id));
  const contentOf = (s) => [...new Set(s.tokens.flatMap((t) => t.form_ids))].filter((id) => formById.has(id) && drillable(formById.get(id)));
  const sayable = (s) => contentOf(s).every((id) => taught.has(id));
  const used = new Map(); // sentence id -> times used
  const use = (s) => used.set(s.id, (used.get(s.id) ?? 0) + 1);
  const fresh = (s) => sayable(s) && !used.has(s.id);
  const bySize = [...sentences].sort((a, b) => words(a) - words(b) || a.difficulty - b.difficulty);
  const bySizeDesc = [...bySize].reverse();

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
  if (sizes[0] > FORMS_PER_LESSON) {
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
    const longer = bySizeDesc.find(fresh);
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
      const pad = want === 'sentence_build' ? bySizeDesc.find(fresh) : bySize.find(fresh);
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

  if (check) {
    // The check is a recap plus production, sized to the same window.
    const builds = bySizeDesc.filter(sayable).slice(0, 3);
    push(check, {
      kind: 'recap',
      review_count: Math.min(LESSON_ITEMS.max - builds.length, Math.max(LESSON_ITEMS.min - builds.length, unitForms.length)),
      scope: 'unit',
    });
    for (const s of builds) push(check, { kind: 'drill', sentence_id: s.id, mode: 'sentence_build' });
  }

  for (const f of unitForms) {
    const count = sentences.filter((s) => contentOf(s).includes(f.id)).length;
    if (count < 3) warnings.push(`${unit.slug}: "${f.form}" has ${count} approved sentence(s); lessons want 3 or more`);
  }
  return { slots, warnings };
}

export { itemsOf };
