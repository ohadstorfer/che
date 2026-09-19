import {
  MATCH_SIZE,
  SENTENCE_CHOICES,
  isPhrase,
  labelOf,
  matchable,
  meaningOf,
  norm,
  selfGlossed,
  sharesMeaning,
  shuffle,
  wordsOf,
} from './answers';
import { conceptScores, conceptsOf, weakestConcept } from './concepts';
import { addDays, localDateStr } from './dates';
import { withMeanings } from './meanings';
import {
  DEFAULT_LADDER,
  type Ladder,
  OFFSET_WINDOW,
  atLeast,
  buildableClause,
  glueSeen,
  hasLockedGlue,
  ladderFor,
  ladderOffset,
  passedScreens,
  loadSentences,
  pickReviewSentences,
  rungFor,
  sentenceCap,
  tooLongToBuild,
} from './sentences';
import { supabase } from './supabase';
import type { ExerciseMode, Form, FormState, Sentence, Tip } from './types';

export interface SessionItem {
  form: Form;
  state: FormState | null; // null → the form is brand new for this learner
  mode: ExerciseMode;
  /** es_to_en shows the Spanish and asks for the meaning; en_to_es the reverse. */
  direction: 'es_to_en' | 'en_to_es';
  /** Extra forms this exercise needs (matching pairs, the words of a sentence). */
  group?: Form[];
  /** SM-2 states for `group`, so words drilled only through a sentence can
   *  still be graded. */
  groupStates?: FormState[];
  /** Set on sentence exercises: the sentence being shown. */
  sentence?: Sentence;
  /** Set on a build too long to ask for whole: the one clause she rebuilds, by
   *  index. The rest of the sentence is shown around it, already written. */
  clause?: number;
  /** Set on the exercise a new form is met in — the intro screen it replaces. */
  introduces?: Form;
  /** Drilled and logged, but never scheduled: padding, or a word a sentence
   *  dragged along that SM-2 didn't ask for. */
  filler?: boolean;
  /** Set on `tip` items. */
  tip?: Tip;
  /** Came from an earlier unit through a lesson's review slot. */
  review?: boolean;
  /** Made one step harder mid-round, after a run of right answers (§4.1). */
  promoted?: boolean;
  /** A placement or jump test question: which unit it samples. No intro
   *  screen, no re-ask. */
  placementUnit?: string;
}

export interface SessionData {
  items: SessionItem[];
  /** The forms distractors and tiles are drawn from. */
  allForms: Form[];
  /** Every form she has met, keyed by id — the deck minus nothing. A word
   *  tapped in a sentence can be a function word or a form this round is not
   *  drilling, and neither of those is in the deck. */
  lexicon: Map<string, Form>;
  /** Every sentence in reach — the meaning exercise draws wrong answers from them. */
  sentences: Sentence[];
  /** Forms SM-2 asked for in this round (new or due). Anything else a sentence
   *  drags in is drilled and logged, but its schedule is left alone. */
  scheduledFormIds: string[];
  /** The ladder the round was built with. */
  ladder?: Ladder;
}

// A form whose interval has reached this many days has settled: it can be
// asked to type the word, and earns a third angle so reviews stay varied. The
// learner's ladder can move it (sentences.ts, Ladder.settledDays).
export const SETTLED_DAYS = DEFAULT_LADDER.settledDays;
const settled = (state: FormState | null, ladder: Ladder = DEFAULT_LADDER) =>
  (state?.interval_days ?? 0) >= ladder.settledDays;

// Hard ceiling on the screens a round plans — the matching block included.
// (Re-asks of missed words can still run past it; a mistake earning another
// look is not the round getting longer, it's the round working.)
export const MAX_SESSION_ITEMS = 18;

// Floor on the same count. A practice round on a quiet day is padded up to it
// with words she has already met, closest to falling due first, flagged
// `filler`: drilled and logged, SM-2 left alone, because practising a word
// early should never push its real due date around.
export const MIN_SESSION_ITEMS = 8;

/** Forms considered when padding a thin round — a head to shuffle, so two quiet
 *  days in a row don't serve the same padding. */
const FILLER_POOL = 12;

const screens = (groups: SessionItem[][]) => groups.reduce((n, g) => n + g.length, 0);

const PRODUCTION: ExerciseMode[] = ['typing', 'word_build', 'listen_build'];

/** A group cut down to its one production angle (the first exercise if it
 *  somehow has none). */
const productionOnly = (g: SessionItem[]) => {
  const item = g.find((i) => PRODUCTION.includes(i.mode)) ?? g[0];
  return item ? [item] : [];
};

// ---------------------------------------------------------------------------
// What a round is built from
// ---------------------------------------------------------------------------

export interface LearnerData {
  forms: Form[];
  formById: Map<string, Form>;
  states: FormState[];
  stateByForm: Map<string, FormState>;
  sentences: Sentence[];
  /** The ladder her rounds are built with. Absent means the defaults. */
  ladder?: Ladder;
}

/** The published lexicon, her SM-2 states, every published sentence, and the
 *  ladder her recent rounds and any placement have earned her. */
export async function loadLearner(userId: string): Promise<LearnerData> {
  const [{ data: formRows }, { data: stateRows }, { data: roundRows }, { data: profile }, { data: answerRows }] = await Promise.all([
    supabase.from('form_entries').select('*').eq('status', 'published'),
    supabase.from('form_states').select('*').eq('user_id', userId),
    supabase
      .from('rounds')
      .select('score, finished_at')
      .eq('user_id', userId)
      .not('finished_at', 'is', null)
      .order('finished_at', { ascending: false })
      .limit(OFFSET_WINDOW),
    supabase.from('profiles').select('placed_through').eq('user_id', userId).maybeSingle(),
    supabase.from('form_answers').select('form_id, meaning, answer').eq('status', 'published'),
  ]);
  // The answers stored for each word's meanings (course:answers), next to the word.
  const accepts = new Map<string, { meaning: string; answer: string }[]>();
  for (const a of (answerRows ?? []) as { form_id: string; meaning: string; answer: string }[]) {
    accepts.set(a.form_id, [...(accepts.get(a.form_id) ?? []), { meaning: a.meaning, answer: a.answer }]);
  }
  const lexicon = ((formRows ?? []) as Form[]).map((f) => (accepts.has(f.id) ? { ...f, accepts: accepts.get(f.id) } : f));
  const states = (stateRows ?? []) as FormState[];
  const sentences = await loadSentences(userId, lexicon);
  // What each word means comes from its sentences and how she has met them, so
  // it is worked out here, where both are to hand, every time her data loads.
  const orderOf = new Map(lexicon.map((f) => [f.id, f.unit_order]));
  const reached = Math.max(0, ...states.map((s) => orderOf.get(s.form_id) ?? 0));
  const forms = withMeanings(lexicon, sentences, reached);
  const scores = ((roundRows ?? []) as { score: number | null }[]).flatMap((r) => (r.score == null ? [] : [r.score]));
  const ladder = ladderFor(ladderOffset(scores), {
    placedThrough: (profile as { placed_through?: number } | null)?.placed_through ?? 0,
    glue: forms.filter((f) => f.is_glue),
    passed: passedScreens(sentences),
  });
  return {
    forms,
    formById: new Map(forms.map((f) => [f.id, f])),
    states,
    stateByForm: new Map(states.map((s) => [s.form_id, s])),
    sentences,
    ladder,
  };
}

/** Whether a form is something she drills: not a function word, not a name. */
export const drillable = (f: Form) => !f.is_glue && f.pos !== 'propn';

/** Forms distractors may come from: drillable ones taught by `courseOrder`. */
export const deckUpTo = (data: LearnerData, courseOrder: number) =>
  data.forms.filter((f) => drillable(f) && f.unit_order <= courseOrder);

/** The furthest unit she has met a word from — the edge of her deck. */
export const reachedUnit = (data: LearnerData) =>
  Math.max(0, ...data.states.map((s) => data.formById.get(s.form_id)?.unit_order ?? 0));

// ---------------------------------------------------------------------------
// Exercise selection
//
// Every exercise is auto-graded — nothing asks her to rate herself. A form is
// drilled from several angles, so four words still make a real round instead
// of four taps.
// ---------------------------------------------------------------------------
export function exercisesFor(
  form: Form,
  state: FormState | null,
  deck: Form[],
  ladder: Ladder = DEFAULT_LADDER,
): ExerciseMode[] {
  // A word that is its own English — mate, cortado, empanada — gets none of the
  // exercises that cross between the two sides: "Build the word in Spanish:
  // cortado" hands over the answer, and so does every choice screen. What is
  // left to test is its sound and its spelling, and its sentences carry the
  // rest, so a word with no recording yet simply waits there.
  if (selfGlossed(form)) return loanwordExercises(form, deck.length);
  return isPhrase(form.form)
    ? phraseExercises(form, state, deck, ladder)
    : wordExercises(form, state, deck.length, ladder);
}

/** All a word that means itself can be asked: hear it, then spell it. */
function loanwordExercises(form: Form, deckSize: number): ExerciseMode[] {
  if (!form.audio_path) return [];
  const modes: ExerciseMode[] = [];
  if (deckSize >= MATCH_SIZE) modes.push('listen');
  modes.push('listen_build');
  return modes;
}

function wordExercises(form: Form, state: FormState | null, deckSize: number, ladder: Ladder): ExerciseMode[] {
  const enoughForChoices = deckSize >= MATCH_SIZE;
  const mature = settled(state, ladder);

  // Recognition first, then production — easiest to hardest.
  const recognition: ExerciseMode[] = [];
  if (enoughForChoices) recognition.push('multiple_choice');
  recognition.push('true_false');
  if (form.audio_path && enoughForChoices) recognition.push('listen');

  const production: ExerciseMode[] = ['word_build'];
  // Typing is the strictest test, and only fair once the word has settled. It
  // is also the only exercise that can earn "fácil" (practice.tsx).
  if (mature) production.push('typing');

  const picked: ExerciseMode[] = [shuffle(recognition)[0], shuffle(production)[0]];

  // Settled words earn a third angle so review rounds stay varied.
  if (mature && recognition.length > 1) {
    const extra = shuffle(recognition.filter((m) => m !== picked[0]))[0];
    if (extra) picked.push(extra);
  }
  return picked.filter(Boolean);
}

// A set phrase is drilled the way a sentence is: understand it, then rebuild
// it. Multiple choice only works once there are other phrases to serve as
// plausible wrong meanings — a phrase next to three single words gives the
// answer away.
function phraseExercises(form: Form, state: FormState | null, deck: Form[], ladder: Ladder): ExerciseMode[] {
  const phrases = deck.filter((f) => isPhrase(f.form)).length;
  const mature = settled(state, ladder);

  const recognition: ExerciseMode[] = [];
  if (phrases >= SENTENCE_CHOICES) recognition.push('multiple_choice');
  if (form.audio_path && phrases >= SENTENCE_CHOICES) recognition.push('listen');

  const picked: ExerciseMode[] = [];
  if (recognition.length) picked.push(shuffle(recognition)[0]);
  picked.push('word_build');
  if (form.audio_path && state) picked.push('listen_build');
  else if (mature && recognition.length > 1) {
    const extra = shuffle(recognition.filter((m) => m !== picked[0]))[0];
    if (extra) picked.push(extra);
  }
  return picked;
}

export function pickDirection(form: Form, mode: ExerciseMode, seen: boolean): SessionItem['direction'] {
  // Listening always resolves to meaning; transcription always produces Spanish.
  if (mode === 'listen') return 'es_to_en';
  if (mode === 'listen_build' || mode === 'typing') return 'en_to_es';
  if (mode === 'word_build') {
    // Phrases she has already met get built in both directions; a first
    // meeting, and every single word, always produces Spanish. Building the
    // English side needs an English side worth building — a one-word gloss
    // would break into letters instead of words.
    if (!isPhrase(form.form) || !isPhrase(meaningOf(form)) || !seen) return 'en_to_es';
    return Math.random() < 0.4 ? 'es_to_en' : 'en_to_es';
  }
  return Math.random() < 0.5 ? 'es_to_en' : 'en_to_es';
}

export function itemsForForm(
  form: Form,
  state: FormState | null,
  deck: Form[],
  ladder: Ladder = DEFAULT_LADDER,
): SessionItem[] {
  return exercisesFor(form, state, deck, ladder).map((mode) => ({
    form,
    state,
    mode,
    direction: pickDirection(form, mode, state !== null),
  }));
}

// Interleave each form's exercises so the same word never appears twice in a
// row: round 1 takes every form's first exercise, round 2 the second, and so on.
export function interleave(groups: SessionItem[][]): SessionItem[] {
  const out: SessionItem[] = [];
  const depth = Math.max(0, ...groups.map((g) => g.length));
  for (let round = 0; round < depth; round++) {
    for (const group of groups) {
      if (group[round]) out.push(group[round]);
    }
  }
  return out;
}

// A matching block: one screen that drills four forms at once. Phrases are left
// out — eight of them on one screen is a wall of text — and so is any word that
// could pair with another's meaning.
export function matchingBlock(forms: Form[]): SessionItem | null {
  const group = matchable(forms);
  if (group.length < MATCH_SIZE) return null;
  return { form: group[0], state: null, mode: 'matching', direction: 'es_to_en', group };
}

/** A sentence exercise drills every form inside the sentence — `group`, the
 *  same way a matching block drills its four — keyed on the word it is for. */
export function sentenceItem(
  data: LearnerData,
  sentence: Sentence,
  mode: ExerciseMode,
  target: Form,
  introduces?: Form,
): SessionItem {
  const group: Form[] = [];
  const groupStates: FormState[] = [];
  for (const id of sentence.form_ids) {
    const form = data.formById.get(id);
    if (!form) continue;
    group.push(form);
    const state = data.stateByForm.get(id);
    if (state) groupStates.push(state);
  }
  if (!group.some((f) => f.id === target.id)) group.push(target);
  // A build of a sentence too long to ask for whole becomes a build of the one
  // clause the drilled word is in, with the rest shown around it. Every route to
  // a sentence screen comes through here, so the decision is made once.
  const ladder = data.ladder ?? DEFAULT_LADDER;
  const clause =
    mode === 'sentence_build' && tooLongToBuild(sentence, ladder)
      ? (buildableClause(sentence, target.id, ladder) ?? undefined)
      : undefined;
  return {
    form: target,
    state: data.stateByForm.get(target.id) ?? null,
    mode,
    direction: 'en_to_es',
    sentence,
    clause,
    group,
    groupStates,
    introduces,
  };
}

/** The exercise a sentence gets at a rung. */
export function modeForRung(
  rung: ReturnType<typeof rungFor>,
  sentence: Sentence,
  ladder: Ladder = DEFAULT_LADDER,
): ExerciseMode {
  if (rung === 'meaning') return 'sentence_meaning';
  if (rung === 'gap') return 'sentence_gap';
  // Listening asks for the whole sentence at once, so it can't frame a build of
  // one clause: a sentence that long is rebuilt on the page, with the rest of it
  // in view.
  if (tooLongToBuild(sentence, ladder)) return 'sentence_build';
  return sentence.audio_path && Math.random() < 0.5 ? 'sentence_listen' : 'sentence_build';
}

/** For home: how many words she has met at all. */
export async function getPracticeCounts(userId: string) {
  const { data: states } = await supabase.from('form_states').select('form_id').eq('user_id', userId);
  return { known: (states ?? []).length };
}

// ---------------------------------------------------------------------------
// The practice round — the Practice button on the path.
//
// Everything due, reviewed through sentences where one can carry it (at the
// rung the sentence has earned), the rest on their own; then padded with words
// she has met if the day is thin. No new words: those only arrive in lessons.
// ---------------------------------------------------------------------------
export async function buildSession(userId: string): Promise<SessionData> {
  const nowIso = new Date().toISOString();
  const [data, { data: yesterday }, { data: recentLogs }] = await Promise.all([
    loadLearner(userId),
    supabase
      .from('daily_sessions')
      .select('sentence_fails')
      .eq('user_id', userId)
      .eq('session_date', localDateStr(addDays(new Date(), -1)))
      .maybeSingle(),
    supabase
      .from('review_logs')
      .select('form_id, correct, is_retry')
      .eq('user_id', userId)
      .gte('reviewed_at', addDays(new Date(), -30).toISOString()),
  ]);

  const ladder = data.ladder ?? DEFAULT_LADDER;
  const deck = deckUpTo(data, reachedUnit(data));
  const inDeck = new Set(deck.map((f) => f.id));
  const known = data.states.filter((s) => inDeck.has(s.form_id));
  // Words a sentence may lean on: settled ones, not merely met. A sentence made
  // of words she is still shaky on is two problems at once.
  const settledIds = new Set(known.filter((s) => s.interval_days >= ladder.settledDays).map((s) => s.form_id));

  const cap = sentenceCap(data.sentences, yesterday?.sentence_fails ?? 0, ladder);
  const seen = glueSeen(data.sentences);

  const due = known
    .filter((s) => s.due_at && s.due_at <= nowIso)
    .sort((a, b) => (a.due_at! < b.due_at! ? -1 : 1))
    .map((state) => ({ form: data.formById.get(state.form_id)!, state }));
  const dueIds = new Set(due.map((d) => d.form.id));

  // Due words are reviewed through sentences where possible, one screen each.
  // What a screen actually tests is what its words skip their own exercises
  // for: the gap tests its blanked word, the tiles test every word; reading a
  // sentence for its meaning tests nothing hard enough to stand in for a
  // review, so those words are drilled on their own as well.
  const covered = new Set<string>();
  let sentenceGroups = pickReviewSentences(dueIds, data.sentences, settledIds, cap, seen, cap, { ladder }).flatMap(
    (sentence) => {
      const target = data.formById.get(sentence.target_form_id);
      if (!target) return [];
      // The gap tests a word that is actually due — the sentence's own target if
      // it is, otherwise one of the due words it was picked to cover.
      const gapForm = dueIds.has(target.id)
        ? target
        : (sentence.form_ids.map((id) => data.formById.get(id)).find((f) => f && dueIds.has(f.id)) ?? target);
      const mode = modeForRung(rungFor(sentence, seen, ladder), sentence, ladder);
      if (mode === 'sentence_gap') covered.add(gapForm.id);
      if (mode === 'sentence_build' || mode === 'sentence_listen') for (const id of sentence.form_ids) covered.add(id);
      return [[sentenceItem(data, sentence, mode, gapForm)]];
    },
  );
  let dueGroups = due
    .filter(({ form }) => !covered.has(form.id))
    .map(({ form, state }) => itemsForForm(form, state, deck, ladder))
    // A word with no exercise of its own — a silent loanword — is left to its
    // sentences rather than shown as an empty group.
    .filter((g) => g.length);

  // Fit the round under MAX_SESSION_ITEMS, gentlest valve first: every word
  // loses its third angle, then drops to a single production angle, and only
  // then do due words slip to tomorrow. Sentences go last — one screen of one
  // can carry several reviews.
  const fillerGroups: SessionItem[][] = [];
  const total = () => screens(sentenceGroups) + screens(dueGroups) + screens(fillerGroups);
  if (total() > MAX_SESSION_ITEMS) dueGroups = dueGroups.map((g) => g.slice(0, 2));
  if (total() > MAX_SESSION_ITEMS) dueGroups = dueGroups.map(productionOnly);
  while (total() > MAX_SESSION_ITEMS && dueGroups.length) dueGroups.pop();
  while (total() > MAX_SESSION_ITEMS && sentenceGroups.length) sentenceGroups.pop();

  // Lift a thin round up to MIN_SESSION_ITEMS with words she has already met.
  if (total() < MIN_SESSION_ITEMS) {
    // Padding leans towards the grammar concept she is weakest on (§12).
    const weak = weakestConcept(
      conceptScores((recentLogs ?? []) as { form_id: string; correct: boolean | null; is_retry?: boolean }[], data.formById),
    );
    const inWeak = (formId: string) => {
      const form = data.formById.get(formId);
      return !!weak && !!form && conceptsOf(form).includes(weak.concept);
    };
    const candidates = known.filter((s) => !dueIds.has(s.form_id));
    const pool = [
      ...shuffle(candidates.filter((s) => inWeak(s.form_id))).slice(0, FILLER_POOL / 2),
      ...shuffle(
        candidates
          .filter((s) => !inWeak(s.form_id))
          .sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''))
          .slice(0, FILLER_POOL),
      ),
    ];
    for (const state of pool) {
      if (total() >= MIN_SESSION_ITEMS) break;
      const group = itemsForForm(data.formById.get(state.form_id)!, state, deck, ladder)
        .slice(0, 2)
        .map((item) => ({ ...item, filler: true }));
      if (group.length) fillerGroups.push(group);
    }
  }

  const items = interleave([...sentenceGroups, ...dueGroups, ...fillerGroups]);

  // A matching warm-up in the middle keeps longer rounds from feeling samey.
  const block = matchingBlock([...sentenceGroups, ...dueGroups, ...fillerGroups].map((g) => g[0].form));
  if (block && items.length >= 6 && total() < MAX_SESSION_ITEMS) {
    items.splice(Math.floor(items.length / 2), 0, block);
  }

  return {
    items,
    allForms: deck,
    lexicon: data.formById,
    sentences: data.sentences,
    scheduledFormIds: due.map((d) => d.form.id),
    ladder,
  };
}

/** How many words a round of free practice serves up. */
export const FREE_SESSION_SIZE = 6;

// Free practice: an extra round from words she has already met, favouring the
// ones due soonest, that writes nothing back to SM-2 — re-drilling a word should
// never drag its real schedule around, or a keen day would empty the next week.
export async function buildFreeSession(
  userId: string,
  limit = FREE_SESSION_SIZE,
  /** Only forms that pass — e.g. those of one grammar concept. */
  only?: (form: Form) => boolean,
): Promise<SessionData> {
  const data = await loadLearner(userId);
  const ladder = data.ladder ?? DEFAULT_LADDER;
  const deck = deckUpTo(data, reachedUnit(data));
  const inDeck = new Set(deck.filter((f) => !only || only(f)).map((f) => f.id));

  const pool = shuffle(
    data.states
      .filter((s) => inDeck.has(s.form_id))
      .sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''))
      .slice(0, limit * 2),
  ).slice(0, limit);

  let groups = pool
    .map((state) => itemsForForm(data.formById.get(state.form_id)!, state, deck, ladder))
    .filter((g) => g.length);
  if (screens(groups) > MAX_SESSION_ITEMS) groups = groups.map((g) => g.slice(0, 2));
  while (screens(groups) > MAX_SESSION_ITEMS && groups.length) groups.pop();

  const items = interleave(groups);
  const block = matchingBlock(groups.map((g) => g[0].form));
  if (block && items.length >= 6 && items.length < MAX_SESSION_ITEMS) {
    items.splice(Math.floor(items.length / 2), 0, block);
  }
  return { items, allForms: deck, lexicon: data.formById, sentences: [], scheduledFormIds: [], ladder };
}

// Spare words for a phrase's tile bank, borrowed from the rest of the deck.
// Without them the exercise is just "use every tile you can see". Not from a
// form that shares the phrase's meaning, whose words could build a second
// right answer.
export function wordPool(correct: Form, allForms: Form[], field: 'gloss_en' | 'form'): string[] {
  const taken = new Set(wordsOf(labelOf(correct, field)).map(norm));
  const out = new Map<string, string>();
  for (const f of allForms) {
    if (f.id === correct.id || sharesMeaning(f, correct)) continue;
    for (const word of wordsOf(labelOf(f, field))) {
      const key = norm(word);
      if (!key || taken.has(key) || out.has(key)) continue;
      out.set(key, word.replace(/[.,!?¿¡;:()]+/g, ''));
    }
  }
  return [...out.values()].filter(Boolean);
}

/** How many spare tiles a phrase's bank carries beyond the answer. */
const SENTENCE_DECOYS = 4;

// Tiles for the building exercises: a phrase breaks into its words, a single
// word into its letters. Decoys are mixed in either way.
export function buildTiles(target: string, distractors: string[] = []): { answer: string[]; tiles: string[] } {
  const clean = target.trim();

  if (isPhrase(clean)) {
    const answer = wordsOf(clean);
    const decoys = shuffle(distractors).slice(0, Math.min(SENTENCE_DECOYS, Math.max(2, Math.ceil(answer.length / 2))));
    return { answer, tiles: shuffle([...answer, ...decoys]) };
  }

  const answer = clean.split('');
  const decoys = new Set<string>();
  const alphabet = 'abcdefghijlmnopqrstuvyzñ'.split('');
  const wanted = Math.min(3, Math.max(2, Math.floor(answer.length / 2)));
  // A short word can run out of unused letters — cap the attempts, not the loop.
  for (let tries = 0; decoys.size < wanted && tries < 60; tries++) {
    const c = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!answer.includes(c)) decoys.add(c);
  }
  return { answer, tiles: shuffle([...answer, ...decoys]) };
}

// ---------------------------------------------------------------------------
// The adaptive tail (learning-engine-spec §4.1).
//
// After a run of right first answers at the start of a round, what is left of
// it is made one step harder: a sentence read for meaning becomes a gap, a gap
// becomes tiles, tiles become listening; a word recognised becomes a word
// built, a word built becomes a word typed. Introductions, tips, matching,
// re-asks and anything already at the top step stay as they are.
// ---------------------------------------------------------------------------

type Promotable = SessionItem & { isIntro?: boolean; isRetry?: boolean };

/** The step above an item, or null when it has none or mustn't move. */
export function promotedMode(
  item: Promotable,
  seen: Map<string, number>,
  ladder: Ladder = DEFAULT_LADDER,
): ExerciseMode | null {
  if (item.isIntro || item.isRetry || item.introduces || item.placementUnit) return null;
  switch (item.mode) {
    case 'sentence_meaning':
      return item.sentence && item.sentence.tokens.some((t) => t.form_ids.includes(item.form.id))
        ? 'sentence_gap'
        : null;
    case 'sentence_gap':
      if (!item.sentence || hasLockedGlue(item.sentence, seen, ladder)) return null;
      // A sentence too long to rebuild is promoted only if one of its clauses
      // can stand in for it; otherwise the gap is already the right step.
      if (tooLongToBuild(item.sentence, ladder) && buildableClause(item.sentence, item.form.id, ladder) === null) {
        return null;
      }
      return 'sentence_build';
    case 'sentence_build':
      // A build of one clause has nowhere above it: the audio says the whole
      // sentence, which is the step she was spared.
      if (item.clause != null) return null;
      return item.sentence?.audio_path ? 'sentence_listen' : null;
    case 'multiple_choice':
    case 'true_false':
    case 'listen':
      // A word that means itself has no harder step: building it is reading it.
      return selfGlossed(item.form) ? null : 'word_build';
    case 'word_build':
      return !isPhrase(item.form.form) && item.state && !selfGlossed(item.form) ? 'typing' : null;
    default:
      return null;
  }
}

/** Promotes every item from `from` on that has a step above it. Returns the
 *  new queue and how many items moved. */
export function promoteTail<T extends Promotable>(
  queue: T[],
  from: number,
  seen: Map<string, number>,
  ladder: Ladder = DEFAULT_LADDER,
): { queue: T[]; promoted: number } {
  let promoted = 0;
  const next = queue.map((item, i) => {
    if (i < from) return item;
    const mode = promotedMode(item, seen, ladder);
    if (!mode) return item;
    promoted += 1;
    const direction: SessionItem['direction'] =
      mode === 'word_build' || mode === 'typing' ? 'en_to_es' : item.direction;
    // Promoting into a build inherits the same clause ceiling a planned one gets.
    const clause =
      mode === 'sentence_build' && item.sentence && tooLongToBuild(item.sentence, ladder)
        ? (buildableClause(item.sentence, item.form.id, ladder) ?? undefined)
        : undefined;
    return { ...item, mode, direction, clause, promoted: true };
  });
  return { queue: next, promoted };
}

/** Whether a round has earned its tail: the first `ladder.tailAfter` graded
 *  first attempts all right. */
export const earnedTail = (firstTries: boolean[], ladder: Ladder = DEFAULT_LADDER) =>
  ladder.tailAfter != null && firstTries.length === ladder.tailAfter && firstTries.every(Boolean);

// ---------------------------------------------------------------------------
// Mistakes (learning-engine-spec §11.3): the words she has missed lately and
// not yet got right since — up to ten, most recent miss first, each asked once
// in a production angle, through a sentence where one carries it.
// ---------------------------------------------------------------------------

export const MISTAKES_DAYS = 14;
export const MISTAKES_SIZE = 10;

export interface CommitRow {
  form_id: string;
  rating: number;
  created_at: string;
}

/** Forms whose latest commit in the window was a miss (rating ≤ 1), most
 *  recent first. */
export function mistakeFormIds(commits: CommitRow[], now = new Date()): string[] {
  const since = now.getTime() - MISTAKES_DAYS * 86_400_000;
  const latest = new Map<string, CommitRow>();
  for (const c of commits) {
    if (new Date(c.created_at).getTime() < since) continue;
    const had = latest.get(c.form_id);
    if (!had || had.created_at < c.created_at) latest.set(c.form_id, c);
  }
  return [...latest.values()]
    .filter((c) => c.rating <= 1)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((c) => c.form_id);
}

export async function getMistakeCount(userId: string) {
  const { data } = await supabase
    .from('srs_commits')
    .select('form_id, rating, created_at')
    .eq('user_id', userId)
    .gte('created_at', new Date(Date.now() - MISTAKES_DAYS * 86_400_000).toISOString());
  return mistakeFormIds((data ?? []) as CommitRow[]).length;
}

export async function buildMistakesSession(userId: string): Promise<SessionData> {
  const nowIso = new Date().toISOString();
  const [data, { data: commits }] = await Promise.all([
    loadLearner(userId),
    supabase
      .from('srs_commits')
      .select('form_id, rating, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - MISTAKES_DAYS * 86_400_000).toISOString()),
  ]);
  const ladder = data.ladder ?? DEFAULT_LADDER;
  const deck = deckUpTo(data, reachedUnit(data));
  const ids = mistakeFormIds((commits ?? []) as CommitRow[])
    .filter((id) => data.stateByForm.has(id) && data.formById.has(id))
    .slice(0, MISTAKES_SIZE);
  const wanted = new Set(ids);
  const seen = glueSeen(data.sentences);
  const known = new Set(data.stateByForm.keys());
  const isDue = (id: string) => {
    const due = data.stateByForm.get(id)?.due_at;
    return !!due && due <= nowIso;
  };

  const items: SessionItem[] = [];
  const covered = new Set<string>();
  for (const sentence of pickReviewSentences(wanted, data.sentences, known, Math.ceil(ids.length / 2), seen, ids.length, {
    pad: false,
    ladder,
  })) {
    const target = sentence.form_ids.map((id) => data.formById.get(id)).find((f) => f && wanted.has(f.id) && !covered.has(f.id));
    if (!target) continue;
    const mode = modeForRung(atLeast(rungFor(sentence, seen, ladder), 'gap'), sentence, ladder);
    if (mode === 'sentence_gap') covered.add(target.id);
    else for (const id of sentence.form_ids) if (wanted.has(id)) covered.add(id);
    items.push(sentenceItem(data, sentence, mode, target));
  }
  for (const id of ids) {
    if (covered.has(id)) continue;
    const form = data.formById.get(id)!;
    const state = data.stateByForm.get(id)!;
    const angles = itemsForForm(form, state, deck, ladder);
    const item = angles.find((i) => PRODUCTION.includes(i.mode)) ?? angles[0];
    if (item) items.push(isDue(id) ? item : { ...item, filler: true });
  }
  return {
    items,
    allForms: deck,
    lexicon: data.formById,
    sentences: data.sentences,
    scheduledFormIds: ids.filter(isDue),
    ladder,
  };
}
