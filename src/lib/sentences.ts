import { shuffle } from './answers';
import { supabase } from './supabase';
import type { Form, Sentence, SentenceToken } from './types';

// ---------------------------------------------------------------------------
// Sentences — the context forms get drilled through.
//
// What gets drilled is decided elsewhere (the lesson's slots in lesson.ts, SM-2
// in session.ts); this module decides which sentence can carry a drill and at
// which rung, and keeps the record of each showing. What an exercise offers
// and accepts is answers.ts.
// ---------------------------------------------------------------------------

export interface SentenceRow {
  id: string;
  unit_id: string;
  es: string;
  en: string;
  en_alt: string[] | null;
  es_alt: string[] | null;
  audio_path: string | null;
  target_form_id: string;
  difficulty: number;
  tokens: { surface: string; form_ids: string[]; gloss?: string }[];
}

/**
 * Every published sentence with her record for it. `forms` is the lexicon the
 * session already holds — it is what tells a content word from a glue word
 * from a name, which the stored tokens don't say.
 */
export async function loadSentences(userId: string, forms: Form[]): Promise<Sentence[]> {
  const [{ data: rows }, { data: states }] = await Promise.all([
    supabase.from('sentences').select('*').eq('status', 'published'),
    supabase.from('sentence_states').select('*').eq('user_id', userId),
  ]);
  const formById = new Map(forms.map((f) => [f.id, f]));
  const shownBy = new Map((states ?? []).map((s) => [s.sentence_id as string, s]));
  return ((rows ?? []) as SentenceRow[]).map((r) => toSentence(r, formById, shownBy.get(r.id)));
}

/** A stored sentence as the app uses it: tokens split into content forms
 *  (drilled), glue (in view, never graded) and names (dropped), plus her record
 *  for it. Pure, so tests can build sentences from the content build. */
export function toSentence(
  r: SentenceRow,
  formById: Map<string, Form>,
  st?: { shown_count: number; correct_count: number; last_shown_at: string | null } | null,
): Sentence {
  const tokens: SentenceToken[] = r.tokens.map((t) => {
    const content: string[] = [];
    let glue: string | undefined;
    for (const id of t.form_ids) {
      const f = formById.get(id);
      if (!f || f.pos === 'propn') continue;
      if (f.is_glue) glue = id;
      else content.push(id);
    }
    return { surface: t.surface, form_ids: content, ...(glue ? { glue } : {}), ...(t.gloss ? { gloss: t.gloss } : {}) };
  });
  return {
    id: r.id,
    unit_id: r.unit_id,
    unit_order: formById.get(r.target_form_id)?.unit_order ?? 0,
    es: r.es,
    en: r.en,
    en_alt: r.en_alt ?? [],
    es_alt: r.es_alt ?? [],
    audio_path: r.audio_path,
    target_form_id: r.target_form_id,
    difficulty: r.difficulty,
    tokens,
    form_ids: [...new Set(tokens.flatMap((t) => t.form_ids))],
    shown: st
      ? { shown_count: st.shown_count, correct_count: st.correct_count, last_shown_at: st.last_shown_at }
      : null,
  };
}

const lastShown = (s: Sentence) => s.shown?.last_shown_at ?? '';
const shownCount = (s: Sentence) => s.shown?.shown_count ?? 0;

/** Correct showings after which a sentence is hers — and stops teaching. A
 *  sentence she can rebuild from memory is testing the sentence, not the
 *  words, so from here on it is used only when nothing fresher covers them. */
export const SENTENCE_MASTERED = 3;
const mastered = (s: Sentence) => (s.shown?.correct_count ?? 0) >= SENTENCE_MASTERED;

/** Days a sentence rests after being shown. The same sentence two days in a
 *  row is how "the word" quietly becomes "the sentence". */
export const SENTENCE_REST_DAYS = 3;
const rested = (s: Sentence, now = Date.now()) =>
  !s.shown?.last_shown_at ||
  now - new Date(s.shown.last_shown_at).getTime() >= SENTENCE_REST_DAYS * 86_400_000;

/** Fresher first: unmastered before mastered, fewer showings, then the one she
 *  saw longest ago. Negative when `a` is the fresher of the two. */
const byFreshness = (a: Sentence, b: Sentence) =>
  Number(mastered(a)) - Number(mastered(b)) ||
  shownCount(a) - shownCount(b) ||
  lastShown(a).localeCompare(lastShown(b));

/** The freshest of a list; ties at random. */
const freshest = (list: Sentence[]): Sentence | null => shuffle(list).sort(byFreshness)[0] ?? null;

// A sentence can carry a word only if she knows every other word in it. The
// linter promised that when the sentence was approved, but a lesson can be
// reordered after the fact, so it is checked again here rather than trusted.
export const carriedBy = (s: Sentence, known: Set<string>, except?: string) =>
  s.form_ids.every((id) => id === except || known.has(id));

/** The sentence a new form is met in, if one was written for it. */
export function pickIntroSentence(form: Form, sentences: Sentence[], known: Set<string>) {
  return freshest(
    sentences.filter((s) => s.target_form_id === form.id && carriedBy(s, known, form.id)),
  );
}

// ---------------------------------------------------------------------------
// The ladder.
//
// Three things climb with her own results rather than by the calendar:
//   1. how many sentence screens a practice round holds (the cap);
//   2. which exercise a sentence gets — meaning, then gap, then tiles;
//   3. which sentences qualify — settled words, short ones first, and glue
//      words only once she has seen them enough.
// A lesson slot can pin its exercise instead; the ladder decides the rest.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// The ladder's settings for one learner.
//
// The constants below are the defaults. What a round is actually built with
// shifts with how her recent rounds went (the offset: learning-engine-spec
// §4.2) and with what a placement test let her skip (§7.4), so every function
// that climbs the ladder takes a `Ladder` rather than reading the constants.
// ---------------------------------------------------------------------------
export type LadderOffset = -1 | 0 | 1;

export interface Ladder {
  offset: LadderOffset;
  /** Passes of a sentence before it moves from meaning to the gap. */
  rungGapAt: number;
  /** Passes before it moves on to tiles. */
  rungBuildAt: number;
  /** Interval, in days, at which a word has settled (session.ts). */
  settledDays: number;
  /** Added to the day's sentence cap. */
  capShift: number;
  /** All-correct first tries that promote the rest of a round; null = never. */
  tailAfter: number | null;
  /** course_order of the last unit a placement test skipped; 0 = none. */
  placedThrough: number;
  /** Glue forms unlocked by that skip, whatever their pass count. */
  unlockedGlue: Set<string>;
}

export const DEFAULT_LADDER: Ladder = {
  offset: 0,
  rungGapAt: 1,
  rungBuildAt: 2,
  settledDays: 7,
  capShift: 0,
  tailAfter: 6,
  placedThrough: 0,
  unlockedGlue: new Set(),
};

/** Finished rounds the offset looks back over. */
export const OFFSET_WINDOW = 5;

/** The offset from her last finished rounds' scores: all but flawless → a step
 *  harder, struggling → a step easier. Too few rounds to say → no change. */
export function ladderOffset(recentScores: number[]): LadderOffset {
  const scores = recentScores.filter((n) => Number.isFinite(n)).slice(0, OFFSET_WINDOW);
  if (scores.length < 3) return 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (mean >= 95) return 1;
  if (mean <= 75) return -1;
  return 0;
}

export function ladderFor(
  offset: LadderOffset,
  { placedThrough = 0, glue = [] }: { placedThrough?: number; glue?: { id: string; unit_order: number }[] } = {},
): Ladder {
  const byOffset = {
    [-1]: { rungGapAt: 1, rungBuildAt: 3, settledDays: 10, capShift: -1, tailAfter: null },
    [0]: { rungGapAt: 1, rungBuildAt: 2, settledDays: 7, capShift: 0, tailAfter: 6 },
    [1]: { rungGapAt: 0, rungBuildAt: 1, settledDays: 5, capShift: 1, tailAfter: 4 },
  }[offset];
  return {
    offset,
    ...byOffset,
    placedThrough,
    unlockedGlue: new Set(placedThrough > 0 ? glue.filter((g) => g.unit_order <= placedThrough).map((g) => g.id) : []),
  };
}

/** Sentence screens per round to start with, and the most it ever grows to. */
export const SENTENCE_CAP_MIN = 2;
export const SENTENCE_CAP_MAX = 8;
/** Passed sentence screens per extra screen of cap. */
export const SENTENCE_CAP_STEP = 10;
/** Failed sentence screens in one day that cost a screen of cap the next. */
export const SENTENCE_FAILS_TO_DROP = 2;
/** Below this cap a new word is met on the plain intro screen; from here on,
 *  inside a sentence written for it (which then counts against the cap). */
export const INTRO_IN_SENTENCE_MIN_CAP = 4;
/** Passed screens with a glue word in view before it may appear in tiles. */
export const GLUE_UNLOCK_PASSES = 5;
/** Passes of one sentence before it moves up a rung. */
export const RUNG_GAP_AT = 1;
export const RUNG_BUILD_AT = 2;

const passesOf = (s: Sentence) => s.shown?.correct_count ?? 0;

/** Sentence screens a round may hold today, from everything she has passed so
 *  far and how yesterday went. Never below one: a bad day shrinks the dose, it
 *  doesn't cancel it. */
export function sentenceCap(sentences: Sentence[], failedYesterday: number, ladder: Ladder = DEFAULT_LADDER): number {
  const passed = sentences.reduce((n, s) => n + passesOf(s), 0);
  // A learner placed past the start has shown she reads sentences already.
  const start = ladder.placedThrough > 0 ? INTRO_IN_SENTENCE_MIN_CAP : SENTENCE_CAP_MIN;
  let cap = Math.min(SENTENCE_CAP_MAX, start + Math.floor(passed / SENTENCE_CAP_STEP));
  if (failedYesterday >= SENTENCE_FAILS_TO_DROP) cap -= 1;
  return Math.max(1, Math.min(SENTENCE_CAP_MAX, cap + ladder.capShift));
}

/** How many passed screens each glue word has been in view for. */
export function glueSeen(sentences: Sentence[]): Map<string, number> {
  const seen = new Map<string, number>();
  for (const s of sentences) {
    const glue = new Set(s.tokens.flatMap((t) => (t.glue ? [t.glue] : [])));
    for (const g of glue) seen.set(g, (seen.get(g) ?? 0) + passesOf(s));
  }
  return seen;
}

/** Whether the sentence carries a glue word she has not seen enough yet. Such a
 *  sentence is still read and gap-filled — the glue is in plain view there —
 *  but not rebuilt from tiles, where she would have to produce it. */
export const hasLockedGlue = (s: Sentence, seen: Map<string, number>, ladder: Ladder = DEFAULT_LADDER) =>
  s.tokens.some(
    (t) => t.glue && !ladder.unlockedGlue.has(t.glue) && (seen.get(t.glue) ?? 0) < GLUE_UNLOCK_PASSES,
  );

export type Rung = 'meaning' | 'gap' | 'build';

/** The exercise a sentence has earned: meaning until passed once, the gap until
 *  passed twice, tiles after that — unless a glue word holds it at the gap. */
export function rungFor(s: Sentence, seen: Map<string, number>, ladder: Ladder = DEFAULT_LADDER): Rung {
  const passes = passesOf(s);
  // A sentence from a unit placement let her skip starts at the gap: she has
  // shown she can read that far, and has no passes to show for it.
  const skipped = ladder.placedThrough > 0 && (s.unit_order ?? Infinity) <= ladder.placedThrough;
  if (passes < ladder.rungGapAt && !skipped) return 'meaning';
  if (passes < ladder.rungBuildAt || hasLockedGlue(s, seen, ladder)) return 'gap';
  return 'build';
}

/** Rungs from easiest to hardest, for "at least" comparisons. */
export const RUNGS: Rung[] = ['meaning', 'gap', 'build'];
export const atLeast = (rung: Rung, floor: Rung): Rung =>
  RUNGS.indexOf(rung) >= RUNGS.indexOf(floor) ? rung : floor;

/** Lower is easier: length, plus a step for glue she doesn't own yet. */
const difficulty = (s: Sentence, seen: Map<string, number>, ladder: Ladder = DEFAULT_LADDER) =>
  s.tokens.length + (hasLockedGlue(s, seen, ladder) ? 2 : 0);

// Greedy cover under the cap. Each round picks one sentence covering at least
// one due word still uncovered, and its words leave the pool, so two sentences
// never drill the same word. What "best" means depends on where she is on the
// ladder: on the low rungs the easiest sentence wins (short, no locked glue),
// and only then the one covering more; once the cap has grown, coverage comes
// first. Ties go to the fresher sentence, and one shown in the last few days
// sits the round out (SENTENCE_REST_DAYS).
export function pickReviewSentences(
  dueIds: Set<string>,
  sentences: Sentence[],
  eligible: Set<string>,
  max: number,
  seen: Map<string, number>,
  cap: number,
  { pad = true, ladder = DEFAULT_LADDER }: { pad?: boolean; ladder?: Ladder } = {},
): Sentence[] {
  const pool = sentences.filter((s) => s.form_ids.length > 0 && carriedBy(s, eligible) && rested(s));
  const remaining = new Set(dueIds);
  const easyFirst = cap < INTRO_IN_SENTENCE_MIN_CAP;
  const out: Sentence[] = [];
  while (out.length < max) {
    let best: Sentence | null = null;
    let bestCount = 0;
    for (const s of shuffle(pool)) {
      if (out.includes(s)) continue;
      const count = s.form_ids.filter((id) => remaining.has(id)).length;
      if (count === 0) continue;
      if (!best) {
        best = s;
        bestCount = count;
        continue;
      }
      const cmp = easyFirst
        ? difficulty(s, seen, ladder) - difficulty(best, seen, ladder) || bestCount - count || byFreshness(s, best)
        : bestCount - count || difficulty(s, seen, ladder) - difficulty(best, seen, ladder) || byFreshness(s, best);
      if (cmp < 0) {
        best = s;
        bestCount = count;
      }
    }
    if (!best) break;
    out.push(best);
    for (const id of best.form_ids) remaining.delete(id);
  }
  // The cap is a dose, not a ceiling: on a day when no due word has a settled
  // sentence, a practice round still gets its few sentences — the easiest,
  // freshest ones. Their words weren't asked for today, so the round drills and
  // logs them without touching their schedule, the way it treats any filler.
  // A lesson's review slot asks for exactly its due words, so it opts out.
  if (pad && out.length < max) {
    const spare = shuffle(pool.filter((s) => !out.includes(s))).sort(
      (a, b) => difficulty(a, seen, ladder) - difficulty(b, seen, ladder) || byFreshness(a, b),
    );
    out.push(...spare.slice(0, max - out.length));
  }
  return out;
}

/** Bookkeeping for one sentence screen, fire-and-forget: `shown_count` is
 *  screens, `correct_count` screens passed — the numbers the ladder climbs on
 *  (sentenceCap, rungFor, glueSeen). Mutates `sentence.shown` too, so anything
 *  picked later in this round sees the new numbers rather than the ones loaded
 *  at the start. */
export function recordShown(userId: string, sentence: Sentence, correct: boolean) {
  const next = {
    shown_count: (sentence.shown?.shown_count ?? 0) + 1,
    correct_count: (sentence.shown?.correct_count ?? 0) + (correct ? 1 : 0),
    last_shown_at: new Date().toISOString(),
  };
  sentence.shown = next;
  supabase
    .from('sentence_states')
    .upsert({ sentence_id: sentence.id, user_id: userId, ...next }, { onConflict: 'sentence_id,user_id' })
    .then(() => {});
}
