import { isPhrase, selfGlossed, shuffle } from './answers';
import type { Course } from './course';
import type { Level } from './onboarding';
import { loadUnitSentenceRows, toSentence } from './sentences';
import { type LearnerData, type SessionData, type SessionItem, deckUpTo, drillable, loadLearner, sentenceItem } from './session';
import type { Form, Section, Sentence, Unit } from './types';

// ---------------------------------------------------------------------------
// Placement and jump-ahead tests (learning-engine-spec §7).
//
// A test samples units: a sentence rebuilt from tiles, and a word typed or a
// sentence gap-filled. It is a test, so there are no intro screens, no tips
// and no re-asks.
//
//  - placement (onboarding): walks the course a section at a time, from the
//    level she said she has. A section is three questions from three units
//    spread across it; passing it (at most one miss) moves up a section,
//    failing it stops the walk — or, when it was the first one asked, walks
//    down until one passes. She lands on the first unit of the lowest section
//    she failed. Each section's sentences are fetched as the walk gets there,
//    so the test never downloads the course.
//  - jump (a later section or unit on the path): runs to the end of its span
//    and passes at about 85%; she lands on the target unit. A short span has
//    every unit sampled; a longer one (a whole section) a spread of them.
// ---------------------------------------------------------------------------

export type TestMode = 'placement' | 'jump';

/** Questions a jump test may hold. */
export const TEST_MAX_ITEMS = 20;
export const ITEMS_PER_UNIT = 2;
/** A jump over a single unit asks it this many questions instead. */
export const ITEMS_SINGLE_UNIT = 4;
/** The share of a jump's questions she may miss and still pass: 3 in 20. */
export const JUMP_MISS_SHARE = 0.15;
/** Misses a jump of `asked` questions forgives — never fewer than one. */
export const jumpMissesAllowed = (asked: number) => Math.max(1, Math.floor(asked * JUMP_MISS_SHARE + 1e-9));

/** Units a jump samples: a span this long or shorter has every unit asked. */
export const maxUnitsInTest = () => Math.floor(TEST_MAX_ITEMS / ITEMS_PER_UNIT);

/** `count` of `list`, evenly spread and in order; all of a shorter list. */
export function sampleUnits<T>(list: T[], count: number): T[] {
  if (list.length <= count) return list;
  return Array.from({ length: count }, (_, k) => list[Math.floor(((2 * k + 1) * list.length) / (2 * count))]);
}

/**
 * Whether a jump from the unit at `hereOrder` to `target` may be offered: a
 * short hop anywhere, or a longer one that stays inside the section she is in
 * — to a later unit of it, or to the start of the next section.
 */
export function jumpAllowed(units: Unit[], hereOrder: number, target: Unit): boolean {
  const span = units.filter((u) => u.course_order >= hereOrder && u.course_order < target.course_order);
  if (span.length === 0) return false;
  if (span.length <= maxUnitsInTest()) return true;
  return span.every((u) => u.section_id === span[0].section_id);
}

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
  // A word that is its own English — mate, cortado — is never sampled: typing
  // or building it from a prompt that already spells it tests nothing.
  const words = shuffle(
    data.forms.filter((f) => f.unit_id === unit.id && drillable(f) && !isPhrase(f.form) && !selfGlossed(f)),
  );
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
  const span = sampleUnits(units, maxUnitsInTest());
  const last = span.at(-1);
  const deck = last ? deckUpTo(data, last.course_order) : [];
  const perUnit = span.length === 1 ? ITEMS_SINGLE_UNIT : ITEMS_PER_UNIT;
  return span.flatMap((u) => unitQuestions(data, u, perUnit, deck)).slice(0, TEST_MAX_ITEMS);
}

export async function buildTest(userId: string, units: Unit[]): Promise<SessionData> {
  const last = units.at(-1);
  // Sentences as far as the last unit the test samples.
  const sampled = sampleUnits(units, maxUnitsInTest()).at(-1);
  const data = await loadLearner(userId, { throughOrder: sampled?.course_order ?? 0 });
  const items = planTest(data, units);
  return {
    items,
    allForms: last ? deckUpTo(data, last.course_order) : [],
    lexicon: data.formById,
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

const formsAnswered = (answers: TestAnswer[]) => {
  const failed = new Set(answers.filter((a) => !a.correct).flatMap((a) => a.formIds));
  const passedIds = [...new Set(answers.filter((a) => a.correct).flatMap((a) => a.formIds))].filter(
    (id) => !failed.has(id),
  );
  return { passedFormIds: passedIds, failedFormIds: [...failed] };
};

/**
 * @param units        the span tested, in course order
 * @param targetOrder  jump: the course_order of the unit she is jumping to.
 *                     unit-by-unit placement: the order just past the span
 *                     (the onboarding test is `placementOutcome`).
 */
export function testOutcome(mode: TestMode, answers: TestAnswer[], units: Unit[], targetOrder: number): TestOutcome {
  const misses = missesByUnit(answers);
  const tripped = units.find((u) => (misses.get(u.id) ?? 0) > 0) ?? null;
  const { passedFormIds: passedIds, failedFormIds } = formsAnswered(answers);
  const failed = failedFormIds;

  if (mode === 'jump') {
    const total = answers.filter((a) => !a.correct).length;
    const passed = answers.length > 0 && total <= jumpMissesAllowed(answers.length);
    return {
      passed,
      throughOrder: passed ? targetOrder : (units[0]?.course_order ?? targetOrder),
      tripped,
      passedFormIds: passedIds,
      failedFormIds: failed,
    };
  }

  const throughOrder = tripped ? tripped.course_order : targetOrder;
  return {
    passed: throughOrder > (units[0]?.course_order ?? throughOrder),
    throughOrder,
    tripped,
    passedFormIds: passedIds,
    failedFormIds: failed,
  };
}

// ---------------------------------------------------------------------------
// The placement walk
// ---------------------------------------------------------------------------

/** Questions per section, and the misses a section forgives. */
export const PLACEMENT_PER_SECTION = 3;
export const PLACEMENT_MISSES_ALLOWED = 1;
/** The most a placement ever asks. */
export const PLACEMENT_MAX_ITEMS = 24;
export const placementMaxStages = () => Math.floor(PLACEMENT_MAX_ITEMS / PLACEMENT_PER_SECTION);

/** Whether a section's answers pass it: at most one miss, and at least two
 *  right — a section that could only be asked one question proves nothing. */
export function sectionPassed(correct: boolean[]): boolean {
  const right = correct.filter(Boolean).length;
  return correct.length - right <= PLACEMENT_MISSES_ALLOWED && right >= 2;
}

/** Sections asked so far, by index in the course: whether she passed each. */
export type WalkResults = Map<number, boolean>;

/** Where the walk begins, from the level she gave in onboarding: the first
 *  section of the matching CEFR band, or a fixed guess when the sections
 *  carry none. Always inside the course. */
export function startStage(sections: { cefr?: string | null }[], level: Level | null | undefined): number {
  if (sections.length === 0) return 0;
  const band = { none: null, basics: 'A1.2', spanish: 'A2', conversational: 'B1' }[level ?? 'none'];
  const guess = { none: 0, basics: 1, spanish: 3, conversational: 7 }[level ?? 'none'];
  if (!band) return 0;
  const at = sections.findIndex((s) => (s.cefr ?? '').toUpperCase().startsWith(band));
  return Math.min(at >= 0 ? at : guess, sections.length - 1);
}

/**
 * The section to ask next, or null when the walk is over: up while she passes,
 * until one fails or the course ends; down from a failed first section until
 * one passes or the start is reached; never more than `maxStages` sections.
 */
export function nextStage(
  count: number,
  start: number,
  results: WalkResults,
  maxStages = placementMaxStages(),
): number | null {
  if (count === 0 || results.size >= maxStages) return null;
  if (results.size === 0) return Math.max(0, Math.min(start, count - 1));
  const failed = [...results].filter(([, ok]) => !ok).map(([i]) => i);
  if (failed.length > 0) {
    const lowest = Math.min(...failed);
    return lowest === 0 || results.has(lowest - 1) ? null : lowest - 1;
  }
  const next = Math.max(...results.keys()) + 1;
  return next < count ? next : null;
}

/**
 * The section she starts in, by index — 0 is the beginning. It is the lowest
 * section she failed, when the one under it passed; the one after the highest
 * she passed, when none failed. A walk down that was cut short (she stopped,
 * or the cap) proved nothing below it, so it places her at the start. Passing
 * the last section still leaves her that section to walk.
 */
export function placedStage(count: number, results: WalkResults): number {
  if (count === 0 || results.size === 0) return 0;
  const failed = [...results].filter(([, ok]) => !ok).map(([i]) => i);
  if (failed.length > 0) {
    const lowest = Math.min(...failed);
    return lowest > 0 && results.get(lowest - 1) === true ? lowest : 0;
  }
  return Math.min(Math.max(...results.keys()) + 1, count - 1);
}

/** Where a placement walk left her. `sections` holds each section's units in
 *  course order. */
export function placementOutcome(sections: Unit[][], results: WalkResults, answers: TestAnswer[]): TestOutcome {
  const placed = placedStage(sections.length, results);
  const first = sections[0]?.[0]?.course_order ?? 1;
  return {
    passed: placed > 0,
    throughOrder: sections[placed]?.[0]?.course_order ?? first,
    tripped: null,
    ...formsAnswered(answers),
  };
}

/** The questions of one section: one from each of a few units spread across
 *  it, alternating a built sentence with a typed word; topped up from the
 *  same units, then from the section's other units, when one has little. */
export function stageQuestions(data: LearnerData, units: Unit[], count = PLACEMENT_PER_SECTION): SessionItem[] {
  const picked = sampleUnits(units, count);
  const perUnit = picked.map((u) => unitQuestions(data, u, ITEMS_PER_UNIT, []));
  const out: SessionItem[] = [];
  perUnit.forEach((qs, k) => {
    if (qs.length > 0) out.push(qs[k % qs.length]);
  });
  for (const q of perUnit.flat()) {
    if (out.length >= count) break;
    if (!out.includes(q)) out.push(q);
  }
  for (const u of units) {
    if (out.length >= count) break;
    if (picked.includes(u)) continue;
    const q = unitQuestions(data, u, 1, [])[0];
    if (q) out.push(q);
  }
  return out.slice(0, count);
}

export interface PlacementSection {
  section: Section | null;
  units: Unit[];
}

export interface PlacementSession {
  /** Her data; its sentences grow as the walk reaches new sections. */
  data: LearnerData;
  sections: PlacementSection[];
  /** Index of the section the walk starts at. */
  start: number;
}

/** The course's sections that have units on the road, in order. */
export function placementSections(course: Pick<Course, 'sections' | 'units'>): PlacementSection[] {
  const out: PlacementSection[] = [];
  for (const unit of course.units) {
    const last = out.at(-1);
    if (last && last.units[0].section_id === unit.section_id) last.units.push(unit);
    else out.push({ section: course.sections.find((s) => s.id === unit.section_id) ?? null, units: [unit] });
  }
  return out;
}

/** Her data and the walk's starting point. Nothing of the course beyond what
 *  she already has is fetched here. */
export async function beginPlacement(
  userId: string,
  course: Pick<Course, 'sections' | 'units'>,
  level: Level | null | undefined,
): Promise<PlacementSession> {
  const data = await loadLearner(userId);
  const sections = placementSections(course);
  return { data, sections, start: startStage(sections.map((s) => ({ cefr: s.section?.cefr })), level) };
}

/**
 * One section's questions. The sentences of the few units it samples are
 * fetched now, a unit at a time — not their blocks, and not the course. When
 * they can't be had the section is still asked, through its words.
 */
export async function placementStage(
  session: PlacementSession,
  index: number,
): Promise<{ items: SessionItem[]; allForms: Form[]; sentences: Sentence[] }> {
  const units = session.sections[index]?.units ?? [];
  const picked = sampleUnits(units, PLACEMENT_PER_SECTION);
  const have = new Set(session.data.sentences.map((s) => s.unit_id));
  const missing = picked.filter((u) => !have.has(u.id)).map((u) => u.id);
  if (missing.length > 0) {
    const rows = await loadUnitSentenceRows(missing).catch(() => []);
    const known = new Set(session.data.sentences.map((s) => s.id));
    const fresh = rows.filter((r) => !known.has(r.id)).map((r) => toSentence(r, session.data.formById));
    if (fresh.length > 0) session.data = { ...session.data, sentences: [...session.data.sentences, ...fresh] };
  }
  const last = units.at(-1);
  return {
    items: stageQuestions(session.data, units),
    allForms: last ? deckUpTo(session.data, last.course_order) : [],
    sentences: session.data.sentences,
  };
}
