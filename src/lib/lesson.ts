import {
  DEFAULT_LADDER,
  type Ladder,
  atLeast,
  buildableClause,
  glueSeen,
  hasLockedGlue,
  pickIntroSentence,
  pickReviewSentences,
  rungFor,
  tooLongToBuild,
} from './sentences';
import {
  GAP_MODES,
  type LearnerData,
  type SessionData,
  type SessionItem,
  drillable,
  gapMode,
  itemsForForm,
  loadLearner,
  matchingBlock,
  modeForRung,
  sentenceItem,
} from './session';
import { supabase } from './supabase';
import type { ExerciseMode, Form, FormState, Lesson, LessonSlot, Sentence, Tip, Unit } from './types';

// ---------------------------------------------------------------------------
// Playing a lesson.
//
// A lesson is an ordered list of authored slots. Every slot but one resolves
// the same way for every learner — that is what lets a reviewer approve a
// lesson as a thing that exists. The exception is `review`: it pulls in words
// from earlier units that are due for *this* learner, carried by sentences
// from those units, so every lesson also quietly holds back forgetting.
//
// The result is the same SessionData the practice round produces, so the
// practice screen plays both without knowing which it has.
// ---------------------------------------------------------------------------

/**
 * What a `tip` item carries as its form. A tip drills no word, but every item
 * in the queue is keyed and grouped by one, so it gets this stand-in — which
 * the practice screen never grades, logs or introduces.
 */
export const TIP_FORM: Form = {
  id: 'tip',
  lemma_id: '',
  lemma: '',
  pos: 'tip',
  form: '',
  gloss_en: '',
  gloss_note_en: null,
  features: {},
  unit_id: '',
  unit_ordinal: 0,
  unit_order: 0,
  is_glue: true,
  register: 'neutral',
  audio_path: null,
  voice_id: null,
};

export interface BuildLessonOptions {
  /**
   * The rendering a reviewer approves: review slots become placeholder cards
   * instead of pulling this learner's due words, so the lesson looks the same
   * whoever opens it.
   */
  canonical?: boolean;
}

export interface LessonData extends SessionData {
  lesson: Lesson;
  unit: Unit;
}

const SENTENCE_MODES: ExerciseMode[] = [
  'sentence_intro',
  'sentence_meaning',
  'sentence_gap',
  'sentence_build',
  'sentence_listen',
];

export async function buildLesson(
  userId: string,
  lessonId: string,
  { canonical = false }: BuildLessonOptions = {},
): Promise<LessonData> {
  const [{ data: lesson }, { data: slotRows }, data] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', lessonId).single(),
    supabase.from('lesson_slots').select('*').eq('lesson_id', lessonId).order('ordinal', { ascending: true }),
    loadLearner(userId),
  ]);
  if (!lesson) throw new Error(`lesson ${lessonId} not found`);
  const [{ data: unit }, { data: tipRows }] = await Promise.all([
    supabase.from('units').select('*').eq('id', (lesson as Lesson).unit_id).single(),
    supabase.from('tips').select('*').eq('unit_id', (lesson as Lesson).unit_id),
  ]);
  if (!unit) throw new Error(`unit for lesson ${lessonId} not found`);

  return {
    ...resolveSlots(data, unit as Unit, (slotRows ?? []) as LessonSlot[], (tipRows ?? []) as Tip[], canonical),
    lesson: lesson as Lesson,
    unit: unit as Unit,
  };
}

/** The slot resolution itself, apart from any loading — pure given its inputs. */
export function resolveSlots(
  data: LearnerData,
  unit: Unit,
  slots: LessonSlot[],
  tips: Tip[],
  canonical: boolean,
  now = new Date(),
): SessionData {
  const nowIso = now.toISOString();
  const ladder = data.ladder ?? DEFAULT_LADDER;
  const tipById = new Map(tips.map((t) => [t.id, t]));
  const sentenceById = new Map(data.sentences.map((s) => [s.id, s]));
  const unitOf = (s: Sentence) => data.formById.get(s.target_form_id)?.unit_order ?? Infinity;
  const inReach = data.sentences.filter((s) => unitOf(s) <= unit.course_order);
  const seen = glueSeen(data.sentences);

  // Forms she can be assumed to know at each point of the lesson: everything
  // with a state, plus whatever this lesson has introduced so far.
  const introduced = new Set<string>();
  const known = () => new Set([...data.stateByForm.keys(), ...introduced]);

  // Distractors may come from anything she has met or is about to, and from
  // earlier units — never from the rest of this unit, which she hasn't seen yet.
  const deck = data.forms.filter(
    (f) =>
      drillable(f) &&
      (f.unit_order < unit.course_order ||
        data.stateByForm.has(f.id) ||
        slots.some((s) => s.kind === 'teach' && s.form_id === f.id)),
  );

  // Sentences this lesson reads for meaning anyway. Introducing a word through
  // one of them would be the same screen twice — the intro *is* a meaning
  // screen. A later gap or tile build of the sentence is different work, and
  // meeting the word in it first is exactly right.
  const readHere = new Set(
    slots.flatMap((s) =>
      s.kind === 'drill' &&
      s.sentence_id &&
      (!s.mode || MEANING_MODES.includes(s.mode) || s.mode === 'sentence_intro')
        ? [s.sentence_id]
        : [],
    ),
  );

  const items: SessionItem[] = [];
  const tipItem = (tip: Tip): SessionItem => ({
    form: TIP_FORM,
    state: null,
    mode: 'tip',
    direction: 'es_to_en',
    tip,
  });

  for (const slot of slots) {
    switch (slot.kind) {
      case 'teach': {
        const form = slot.form_id ? data.formById.get(slot.form_id) : undefined;
        if (!form) break;
        const state = data.stateByForm.get(form.id) ?? null;
        if (state || introduced.has(form.id)) {
          // Met before (a replay, or taught twice): straight to a question.
          const first = itemsForForm(form, state, deck, ladder)[0];
          if (first) items.push(first);
          break;
        }
        // A brand-new word: met inside a sentence written for it when one is
        // there to carry it, otherwise on the plain intro screen the practice
        // queue adds in front of its first question. Either way, one easy
        // question after, so meeting a word is followed by using it.
        const unitSentences = inReach.filter((s) => s.unit_id === unit.id && !readHere.has(s.id));
        const intro = pickIntroSentence(form, unitSentences, known());
        if (intro) items.push(sentenceItem(data, intro, 'sentence_intro', form, form));
        const first = itemsForForm(form, null, deck, ladder)[0];
        if (first) items.push(first);
        introduced.add(form.id);
        break;
      }

      case 'drill': {
        const sentence = slot.sentence_id ? sentenceById.get(slot.sentence_id) : undefined;
        const target = sentence ? data.formById.get(sentence.target_form_id) : undefined;
        if (!sentence || !target) break;
        let mode: ExerciseMode =
          slot.mode && SENTENCE_MODES.includes(slot.mode) ? slot.mode : modeForRung(rungFor(sentence, seen, ladder), sentence, ladder);
        // A pinned listening screen with no recording yet falls back to the
        // same build by sight rather than to a silent exercise.
        if (mode === 'sentence_listen' && !sentence.audio_path) mode = 'sentence_build';
        const introduces = mode === 'sentence_intro' && !known().has(target.id) ? target : undefined;
        if (mode === 'sentence_intro' && !introduces) mode = 'sentence_meaning';
        // A gap authored on a slot still hardens with the sentence's passes.
        if (mode === 'sentence_gap') mode = gapMode(sentence, ladder);
        items.push(sentenceItem(data, sentence, mode, target, introduces));
        if (introduces) introduced.add(target.id);
        break;
      }

      case 'match': {
        const k = known();
        const taughtHere = data.forms.filter((f) => drillable(f) && f.unit_id === unit.id && k.has(f.id));
        const block = matchingBlock(taughtHere);
        if (block) items.push(block);
        break;
      }

      case 'tip': {
        const tip = slot.tip_id ? tipById.get(slot.tip_id) : undefined;
        if (tip) items.push(tipItem(tip));
        break;
      }

      case 'review': {
        const count = slot.review_count ?? 0;
        if (count <= 0) break;
        if (canonical) {
          items.push(
            tipItem({
              id: `review-${slot.id}`,
              unit_id: unit.id,
              title_en: `Review × ${count}`,
              body_md:
                'Words from earlier units that are due for this learner appear here — ' +
                'different for everyone, so not part of what gets reviewed.',
            }),
          );
          break;
        }
        items.push(...reviewItems(data, unit, count, deck, seen, nowIso, ladder));
        break;
      }

      case 'recap': {
        const count = slot.review_count ?? 0;
        if (count <= 0) break;
        const scope = slot.scope ?? 'unit';
        if (canonical) {
          items.push(
            tipItem({
              id: `recap-${slot.id}`,
              unit_id: unit.id,
              title_en: `Recap × ${count}`,
              body_md:
                `The weakest words of this ${scope} for this learner, at least half of them to produce — ` +
                'different for everyone, so not part of what gets reviewed.',
            }),
          );
          break;
        }
        items.push(...recapItems(data, unit, scope, count, deck, seen, nowIso, ladder));
        break;
      }
    }
  }

  // What SM-2 may move: words new to her, and words that are due. Everything
  // else a sentence carries along is drilled and logged but keeps its schedule —
  // practising a word early should never push its due date around.
  const scheduled = new Set<string>();
  for (const item of items) {
    if (item.mode === 'tip' || item.filler) continue;
    for (const f of item.group ?? [item.form]) {
      const st = data.stateByForm.get(f.id);
      if (!st || (st.due_at && st.due_at <= nowIso)) scheduled.add(f.id);
    }
  }

  return { items, allForms: deck, lexicon: data.formById, sentences: inReach, scheduledFormIds: [...scheduled], ladder };
}

/**
 * A review slot: `count` screens of words from earlier units that are due,
 * through sentences from those units where one can carry them, on their own
 * where not. When nothing is due, it tops up with the earlier words closest to
 * falling due — as filler, so their schedules stay put.
 */
function reviewItems(
  data: LearnerData,
  unit: Unit,
  count: number,
  deck: Form[],
  seen: Map<string, number>,
  nowIso: string,
  ladder: Ladder = DEFAULT_LADDER,
): SessionItem[] {
  const earlier: { state: FormState; form: Form }[] = [];
  for (const state of data.states) {
    const form = data.formById.get(state.form_id);
    if (form && drillable(form) && form.unit_order < unit.course_order) earlier.push({ state, form });
  }
  earlier.sort((a, b) => (a.state.due_at ?? '').localeCompare(b.state.due_at ?? ''));
  if (earlier.length === 0) return [];

  const due = earlier.filter((x) => x.state.due_at && x.state.due_at <= nowIso);
  const dueIds = new Set(due.map((x) => x.form.id));
  const knownIds = new Set(data.stateByForm.keys());
  const earlierSentences = data.sentences.filter(
    (s) => (data.formById.get(s.target_form_id)?.unit_order ?? Infinity) < unit.course_order,
  );

  const out: SessionItem[] = [];
  const covered = new Set<string>();
  for (const sentence of pickReviewSentences(dueIds, earlierSentences, knownIds, count, seen, count, { pad: false, ladder })) {
    const target =
      (dueIds.has(sentence.target_form_id) ? data.formById.get(sentence.target_form_id) : undefined) ??
      sentence.form_ids.map((id) => data.formById.get(id)).find((f) => f && dueIds.has(f.id));
    if (!target) continue;
    // Same rule as the practice round: the gap tests its word, tiles test every
    // word, and reading for meaning tests nothing hard enough to count.
    const mode = modeForRung(rungFor(sentence, seen, ladder), sentence, ladder);
    if (GAP_MODES.includes(mode)) covered.add(target.id);
    else if (!MEANING_MODES.includes(mode)) for (const id of sentence.form_ids) covered.add(id);
    out.push({ ...sentenceItem(data, sentence, mode, target), review: true });
  }

  // Due words no sentence took: one production screen each — recognition alone
  // proves little about a word she was starting to forget.
  for (const { form, state } of due) {
    if (out.length >= count) break;
    if (covered.has(form.id)) continue;
    const angles = itemsForForm(form, state, deck, ladder);
    const production = angles.find((i) => PRODUCTION.includes(i.mode)) ?? angles[0];
    if (production) out.push({ ...production, review: true });
  }

  for (const { form, state } of earlier) {
    if (out.length >= count) break;
    if (dueIds.has(form.id)) continue;
    const first = itemsForForm(form, state, deck, ladder)[0];
    if (first) out.push({ ...first, review: true, filler: true });
  }

  return out.slice(0, count);
}

const PRODUCTION: ExerciseMode[] = [
  'word_build',
  'typing',
  'listen_build',
  'sentence_build',
  'sentence_listen',
  'sentence_gap_typed',
];

/** Reading screens: they ask for a meaning, not for Spanish. */
const MEANING_MODES: ExerciseMode[] = ['sentence_meaning', 'sentence_meaning_tiles'];

/** The gaps a recap may turn into a build to make its production quota. */
const UPGRADABLE_GAPS: ExerciseMode[] = ['sentence_gap', 'sentence_gap_tiles'];

/**
 * A recap slot — the body of a unit check (learning-engine-spec §3.2): `count`
 * screens over the weakest forms of the unit (or of its whole section) that she
 * has met. Weakest is most lapses, then lowest ease, then shortest interval.
 * Each form is asked once; a sentence carries forms where one can, at no lower
 * rung than the gap — a check doesn't ask for meaning only — and at least half
 * the screens make her produce Spanish. Due forms are scheduled as ever; the
 * rest are filler, which a miss still lapses.
 */
export function recapItems(
  data: LearnerData,
  unit: Unit,
  scope: 'unit' | 'section',
  count: number,
  deck: Form[],
  seen: Map<string, number>,
  nowIso: string,
  ladder: Ladder = DEFAULT_LADDER,
): SessionItem[] {
  const inScope = (f: Form) =>
    scope === 'unit'
      ? f.unit_id === unit.id
      : (f.section_id == null || f.section_id === unit.section_id) && f.unit_order <= unit.course_order;

  const weak: { form: Form; state: FormState }[] = [];
  for (const state of data.states) {
    const form = data.formById.get(state.form_id);
    if (form && drillable(form) && inScope(form)) weak.push({ form, state });
  }
  weak.sort(
    (a, b) =>
      b.state.lapses - a.state.lapses ||
      a.state.ease_factor - b.state.ease_factor ||
      a.state.interval_days - b.state.interval_days,
  );
  const chosen = weak.slice(0, count);
  if (chosen.length === 0) return [];
  const chosenIds = new Set(chosen.map((x) => x.form.id));
  const isDue = (st: FormState) => !!st.due_at && st.due_at <= nowIso;

  const knownIds = new Set(data.stateByForm.keys());
  // Sentences written for the scope itself — not a later unit's sentence that
  // happens to use only these words.
  const unitOrderOf = new Map(data.forms.map((f) => [f.unit_id, f.unit_order]));
  const scopeSentences = data.sentences.filter((s) => {
    const target = data.formById.get(s.target_form_id);
    if (!target || !inScope(target)) return false;
    return scope === 'unit' ? s.unit_id === unit.id : (unitOrderOf.get(s.unit_id) ?? Infinity) <= unit.course_order;
  });

  const out: SessionItem[] = [];
  const used = new Set<string>();
  const carriers = pickReviewSentences(chosenIds, scopeSentences, knownIds, Math.ceil(count / 2), seen, count, {
    pad: false,
    ladder,
  });
  for (const sentence of carriers) {
    const target =
      (chosenIds.has(sentence.target_form_id) && !used.has(sentence.target_form_id)
        ? data.formById.get(sentence.target_form_id)
        : undefined) ??
      sentence.form_ids.map((id) => data.formById.get(id)).find((f) => f && chosenIds.has(f.id) && !used.has(f.id));
    if (!target) continue;
    const mode = modeForRung(atLeast(rungFor(sentence, seen, ladder), 'gap'), sentence, ladder);
    const tests = GAP_MODES.includes(mode) ? [target.id] : sentence.form_ids.filter((id) => chosenIds.has(id));
    if (tests.some((id) => used.has(id))) continue;
    for (const id of tests) used.add(id);
    out.push({ ...sentenceItem(data, sentence, mode, target), review: true });
    if (out.length >= count) break;
  }

  for (const { form, state } of chosen) {
    if (out.length >= count) break;
    if (used.has(form.id)) continue;
    const angles = itemsForForm(form, state, deck, ladder);
    const item = angles.find((i) => PRODUCTION.includes(i.mode)) ?? angles[0];
    if (!item) continue;
    used.add(form.id);
    out.push({ ...item, review: true, ...(isDue(state) ? {} : { filler: true }) });
  }

  // At least half of it production: gaps without locked glue become builds.
  const wanted = Math.ceil(out.length / 2);
  let production = out.filter((i) => PRODUCTION.includes(i.mode)).length;
  for (const item of out) {
    if (production >= wanted) break;
    // A typed gap is already a production screen — it is counted above, and
    // rewriting it into a build would spend the quota twice.
    if (UPGRADABLE_GAPS.includes(item.mode) && item.sentence && !hasLockedGlue(item.sentence, seen, ladder)) {
      const clause = tooLongToBuild(item.sentence, ladder)
        ? buildableClause(item.sentence, item.form.id, ladder)
        : null;
      // Nothing small enough to build: this one stays a gap and the next item
      // makes up the production quota.
      if (tooLongToBuild(item.sentence, ladder) && clause === null) continue;
      item.mode = 'sentence_build';
      if (clause !== null) item.clause = clause;
      production += 1;
    }
  }
  return out;
}
