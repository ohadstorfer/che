import { isPhrase, shuffle } from './answers';
import { type LearnerData, type SessionData, type SessionItem, deckUpTo, drillable, loadLearner, sentenceItem } from './session';
import type { Form, Sentence, Unit } from './types';

// ---------------------------------------------------------------------------
// Placement and jump-ahead tests (learning-engine-spec §7).
//
// A test walks units in course order and samples each one: a sentence rebuilt
// from tiles, and a word typed or a sentence gap-filled. It is a test, so there
// are no intro screens, no tips and no re-asks.
//
//  - placement (onboarding): stops once two units in a row each had a miss,
//    or one unit had two; she lands on the first unit she missed anything in.
//  - jump (a later section or unit on the path): runs to the end of its span
//    and passes with at most one miss overall; she lands on the target unit.
// ---------------------------------------------------------------------------

export type TestMode = 'placement' | 'jump';

/** Questions a test may hold, and so the most units a jump may span. */
export const TEST_MAX_ITEMS = 30;
export const ITEMS_PER_UNIT = 2;
/** A jump over a single unit asks it this many questions instead. */
export const ITEMS_SINGLE_UNIT = 4;
/** A jump passes with at most this many misses. */
export const JUMP_MISSES_ALLOWED = 1;

export const maxUnitsInTest = () => Math.floor(TEST_MAX_ITEMS / ITEMS_PER_UNIT);

/** Short, content-bearing sentences of a unit, shortest first. */
function unitSentences(data: LearnerData, unit: Unit): Sentence[] {
  return shuffle(data.sentences.filter((s) => s.unit_id === unit.id && s.form_ids.length > 0)).sort(
    (a, b) => a.tokens.length - b.tokens.length,
  );
}

const targetOf = (data: LearnerData, s: Sentence) => data.formById.get(s.target_form_id);

/** The questions sampling one unit. */
export function unitQuestions(data: LearnerData, unit: Unit, count: number, deck: Form[]): SessionItem[] {
  const tag = (item: SessionItem): SessionItem => ({ ...item, placementUnit: unit.id, filler: true });
  const sentences = unitSentences(data, unit);
  const words = shuffle(data.forms.filter((f) => f.unit_id === unit.id && drillable(f) && !isPhrase(f.form)));
  const verb = words.find((f) => f.pos === 'verb') ?? words[0];
  const out: SessionItem[] = [];
  const usedSentences = new Set<string>();

  const builds = count >= ITEMS_SINGLE_UNIT ? 2 : 1;
  for (const s of sentences) {
    if (out.length >= builds) break;
    const target = targetOf(data, s);
    if (!target) continue;
    usedSentences.add(s.id);
    out.push(tag(sentenceItem(data, s, 'sentence_build', target)));
  }

  const typing = (form: Form): SessionItem =>
    tag({ form, state: data.stateByForm.get(form.id) ?? null, mode: 'typing', direction: 'en_to_es' });
  const gap = () => {
    const s = sentences.find((x) => !usedSentences.has(x.id) && targetOf(data, x));
    if (!s) return null;
    usedSentences.add(s.id);
    return tag(sentenceItem(data, s, 'sentence_gap', targetOf(data, s)!));
  };

  if (count >= ITEMS_SINGLE_UNIT) {
    if (verb) out.push(typing(verb));
    const g = gap();
    if (g) out.push(g);
  } else if (verb) {
    out.push(typing(verb));
  } else {
    const g = gap();
    if (g) out.push(g);
  }

  // A unit with little written for it yet is sampled through its words.
  for (const form of words) {
    if (out.length >= count) break;
    if (out.some((i) => i.form.id === form.id)) continue;
    out.push(
      tag({ form, state: data.stateByForm.get(form.id) ?? null, mode: 'word_build', direction: 'en_to_es' }),
    );
  }
  return out.slice(0, count);
}

/** The whole test over `units` (already in course order). Units with nothing
 *  to ask are left out. */
export function planTest(data: LearnerData, units: Unit[]): SessionItem[] {
  const span = units.slice(0, maxUnitsInTest());
  const last = span.at(-1);
  const deck = last ? deckUpTo(data, last.course_order) : [];
  const perUnit = span.length === 1 ? ITEMS_SINGLE_UNIT : ITEMS_PER_UNIT;
  return span.flatMap((u) => unitQuestions(data, u, perUnit, deck)).slice(0, TEST_MAX_ITEMS);
}

export async function buildTest(userId: string, units: Unit[]): Promise<SessionData> {
  const data = await loadLearner(userId);
  const items = planTest(data, units);
  const last = units.at(-1);
  return {
    items,
    allForms: last ? deckUpTo(data, last.course_order) : [],
    sentences: data.sentences,
    scheduledFormIds: [],
  };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export interface TestAnswer {
  unitId: string;
  correct: boolean;
  /** The content forms the question drilled. */
  formIds: string[];
}

const missesByUnit = (answers: TestAnswer[]) => {
  const out = new Map<string, number>();
  for (const a of answers) out.set(a.unitId, (out.get(a.unitId) ?? 0) + (a.correct ? 0 : 1));
  return out;
};

/** Placement only: whether to stop asking. */
export function shouldStop(answers: TestAnswer[]): boolean {
  const misses = missesByUnit(answers);
  if ([...misses.values()].some((n) => n >= 2)) return true;
  const order = [...new Set(answers.map((a) => a.unitId))];
  const [prev, last] = order.slice(-2);
  return !!prev && !!last && (misses.get(prev) ?? 0) >= 1 && (misses.get(last) ?? 0) >= 1;
}

export interface TestOutcome {
  /** Whether she moves at all. */
  passed: boolean;
  /** course_order of the unit she lands on; lessons before it are skipped. */
  throughOrder: number;
  /** The first unit she missed something in. */
  tripped: Unit | null;
  passedFormIds: string[];
  failedFormIds: string[];
}

/**
 * @param units        the span tested, in course order
 * @param targetOrder  jump: the course_order of the unit she is jumping to.
 *                     placement: the order just past the span.
 */
export function testOutcome(mode: TestMode, answers: TestAnswer[], units: Unit[], targetOrder: number): TestOutcome {
  const misses = missesByUnit(answers);
  const tripped = units.find((u) => (misses.get(u.id) ?? 0) > 0) ?? null;
  const failed = new Set(answers.filter((a) => !a.correct).flatMap((a) => a.formIds));
  const passedIds = [...new Set(answers.filter((a) => a.correct).flatMap((a) => a.formIds))].filter(
    (id) => !failed.has(id),
  );

  if (mode === 'jump') {
    const total = answers.filter((a) => !a.correct).length;
    const passed = answers.length > 0 && total <= JUMP_MISSES_ALLOWED;
    return {
      passed,
      throughOrder: passed ? targetOrder : (units[0]?.course_order ?? targetOrder),
      tripped,
      passedFormIds: passedIds,
      failedFormIds: [...failed],
    };
  }

  const throughOrder = tripped ? tripped.course_order : targetOrder;
  return {
    passed: throughOrder > (units[0]?.course_order ?? throughOrder),
    throughOrder,
    tripped,
    passedFormIds: passedIds,
    failedFormIds: [...failed],
  };
}
