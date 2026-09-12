import { supabase } from './supabase';
import type { Card, Sentence, SentenceToken } from './types';

// ---------------------------------------------------------------------------
// Generated sentences — the context her words get reviewed through.
//
// The session decides *which* cards to drill (SM-2, in session.ts); this
// module decides which sentence, if any, can carry that drill: a new word is
// met inside a sentence written for it, and due words are reviewed inside the
// sentence that covers the most of them. Everything else here is the small
// mechanics those exercises need — options, tiles, and working out which word
// she got wrong when a sentence comes out wrong.
// ---------------------------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Case-, accent- and punctuation-insensitive key for comparing words. */
const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');

/** A token's translit without the punctuation it carries ("leejól?" → "leejól"). */
export const tokenWord = (t: SentenceToken) => t.translit.replace(/^[¿¡]+|[.,!?¿¡;:…]+$/g, '');

/** The punctuation after a token's word, to keep next to a blank ("?"). */
export const tokenTail = (t: SentenceToken) => t.translit.slice(tokenWord(t).length);

/** Where a card's word sits in the sentence; -1 if it is not there. */
export const tokenIndexOf = (s: Sentence, cardId: string) =>
  s.tokens.findIndex((t) => t.card_ids?.includes(cardId));

export async function loadSentences(userId: string): Promise<Sentence[]> {
  const [{ data: rows }, { data: states }] = await Promise.all([
    supabase.from('sentences').select('*, sentence_cards(card_id)').is('retired_at', null),
    supabase.from('sentence_states').select('*').eq('user_id', userId),
  ]);
  const shownBy = new Map((states ?? []).map((s) => [s.sentence_id as string, s]));
  return (rows ?? []).map((r) => {
    const st = shownBy.get(r.id);
    return {
      id: r.id,
      hebrew: r.hebrew,
      translit: r.translit,
      spanish: r.spanish,
      english: r.english,
      audio_path: r.audio_path,
      target_card_id: r.target_card_id,
      level: r.level,
      tokens: r.tokens as SentenceToken[],
      card_ids: ((r.sentence_cards ?? []) as { card_id: string }[]).map((sc) => sc.card_id),
      shown: st
        ? { shown_count: st.shown_count, correct_count: st.correct_count, last_shown_at: st.last_shown_at }
        : null,
    };
  });
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

// A sentence can carry a word only if she knows every other word in it. That
// is what the generator promised, but a card can be deleted after the fact, so
// it is checked again here rather than trusted.
const carriedBy = (s: Sentence, known: Set<string>, except?: string) =>
  s.card_ids.every((id) => id === except || known.has(id));

/** The sentence a new word is met in, if one was written for it. */
export function pickIntroSentence(card: Card, sentences: Sentence[], known: Set<string>) {
  return freshest(
    sentences.filter((s) => s.target_card_id === card.id && carriedBy(s, known, card.id)),
  );
}

// ---------------------------------------------------------------------------
// The ladder (2026-09-12, after her first week with sentences felt too hard).
//
// Sentences enter a class a few screens at a time, and three things climb with
// her own results rather than by the calendar:
//   1. how many sentence screens a class holds (the cap);
//   2. which exercise a sentence gets — meaning, then gap, then tiles;
//   3. which sentences qualify — settled words, short ones first, and glue
//      words only once she has seen them enough.
// ---------------------------------------------------------------------------

/** Sentence screens per class to start with, and the most it ever grows to. */
export const SENTENCE_CAP_MIN = 2;
export const SENTENCE_CAP_MAX = 8;
/** Passed sentence screens per extra screen of cap. */
export const SENTENCE_CAP_STEP = 10;
/** Failed sentence screens in one class that cost a screen of cap next day. */
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

/** Sentence screens a class may hold today, from everything she has passed so
 *  far and how yesterday went. Never below one: a bad day shrinks the dose, it
 *  doesn't cancel it. */
export function sentenceCap(sentences: Sentence[], failedYesterday: number): number {
  const passed = sentences.reduce((n, s) => n + passesOf(s), 0);
  let cap = Math.min(SENTENCE_CAP_MAX, SENTENCE_CAP_MIN + Math.floor(passed / SENTENCE_CAP_STEP));
  if (failedYesterday >= SENTENCE_FAILS_TO_DROP) cap -= 1;
  return Math.max(1, cap);
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
export const hasLockedGlue = (s: Sentence, seen: Map<string, number>) =>
  s.tokens.some((t) => t.glue && (seen.get(t.glue) ?? 0) < GLUE_UNLOCK_PASSES);

export type Rung = 'meaning' | 'gap' | 'build';

/** The exercise a sentence has earned: meaning until passed once, the gap until
 *  passed twice, tiles after that — unless a glue word holds it at the gap. */
export function rungFor(s: Sentence, seen: Map<string, number>): Rung {
  const passes = passesOf(s);
  if (passes < RUNG_GAP_AT) return 'meaning';
  if (passes < RUNG_BUILD_AT || hasLockedGlue(s, seen)) return 'gap';
  return 'build';
}

/** Lower is easier: length, plus a step for glue she doesn't own yet. */
const difficulty = (s: Sentence, seen: Map<string, number>) =>
  s.tokens.length + (hasLockedGlue(s, seen) ? 2 : 0);

// Greedy cover under the cap. Each round picks one sentence covering at least
// one due word still uncovered, and its words leave the pool, so two sentences
// never drill the same word. What "best" means depends on where she is on the
// ladder: on the low rungs the easiest sentence wins (short, no locked glue),
// and only then the one covering more; once the cap has grown, coverage comes
// first — a class of eight screens can afford to be efficient. Ties go to the
// fresher sentence, and one shown in the last few days sits the session out
// (SENTENCE_REST_DAYS).
export function pickReviewSentences(
  dueIds: Set<string>,
  sentences: Sentence[],
  eligible: Set<string>,
  max: number,
  seen: Map<string, number>,
  cap: number,
): Sentence[] {
  const pool = sentences.filter((s) => carriedBy(s, eligible) && rested(s));
  const remaining = new Set(dueIds);
  const easyFirst = cap < INTRO_IN_SENTENCE_MIN_CAP;
  const out: Sentence[] = [];
  while (out.length < max) {
    let best: Sentence | null = null;
    let bestCount = 0;
    for (const s of shuffle(pool)) {
      if (out.includes(s)) continue;
      const count = s.card_ids.filter((id) => remaining.has(id)).length;
      if (count === 0) continue;
      if (!best) {
        best = s;
        bestCount = count;
        continue;
      }
      const cmp = easyFirst
        ? difficulty(s, seen) - difficulty(best, seen) || bestCount - count || byFreshness(s, best)
        : bestCount - count || difficulty(s, seen) - difficulty(best, seen) || byFreshness(s, best);
      if (cmp < 0) {
        best = s;
        bestCount = count;
      }
    }
    if (!best) break;
    out.push(best);
    for (const id of best.card_ids) remaining.delete(id);
  }
  // The cap is a dose, not a ceiling: on a day when no due word has a settled
  // sentence (her settled words are exactly the ones not falling due), the
  // class still gets its few sentences — the easiest, freshest ones. Their
  // words weren't asked for today, so the session drills and logs them without
  // touching their schedule, the way it treats any filler.
  if (out.length < max) {
    const spare = shuffle(pool.filter((s) => !out.includes(s))).sort(
      (a, b) => difficulty(a, seen) - difficulty(b, seen) || byFreshness(a, b),
    );
    out.push(...spare.slice(0, max - out.length));
  }
  return out;
}

export type Option = { id: string; label: string };

/** Meanings to choose between: this sentence's, and two other sentences'. */
export function meaningOptions(sentence: Sentence, all: Sentence[]): Option[] {
  const others = shuffle(all.filter((s) => s.id !== sentence.id && s.spanish !== sentence.spanish));
  const distinct = new Map<string, Sentence>();
  for (const s of others) {
    if (!distinct.has(s.spanish)) distinct.set(s.spanish, s);
    if (distinct.size === 2) break;
  }
  return shuffle([sentence, ...distinct.values()]).map((s) => ({ id: s.id, label: s.spanish }));
}

/** Words to fill the gap with: the right one (as it appears in the sentence —
 *  prefix and all) and three single-word cards she knows. `target` is the card
 *  the gap tests — a due word in the sentence, not necessarily the one the
 *  sentence was written for. */
export function gapOptions(sentence: Sentence, target: Card, allCards: Card[]): Option[] {
  const index = tokenIndexOf(sentence, target.id);
  const answer = index >= 0 ? tokenWord(sentence.tokens[index]) : target.translit;
  const decoys = shuffle(
    allCards.filter(
      (c) =>
        c.id !== target.id && !c.translit.trim().includes(' ') && norm(c.translit) !== norm(answer),
    ),
  );
  const seen = new Set<string>();
  const picked: Card[] = [];
  for (const c of decoys) {
    if (seen.has(norm(c.translit))) continue;
    seen.add(norm(c.translit));
    picked.push(c);
    if (picked.length === 3) break;
  }
  return shuffle([
    { id: target.id, label: answer },
    ...picked.map((c) => ({ id: c.id, label: c.translit })),
  ]);
}

/** How many spare tiles a sentence's bank carries beyond the answer. */
const DECOYS = 4;

/** Word tiles for rebuilding the sentence, with a few of her other words mixed in. */
export function sentenceTiles(sentence: Sentence, allCards: Card[]) {
  const answer = sentence.tokens.map(tokenWord);
  const taken = new Set(answer.map(norm));
  const spare = new Map<string, string>();
  for (const c of allCards) {
    for (const w of c.translit.trim().split(/\s+/)) {
      const word = w.replace(/[.,!?¿¡;:]+$/g, '');
      const key = norm(word);
      if (key && !taken.has(key) && !spare.has(key)) spare.set(key, word);
    }
  }
  const decoys = shuffle([...spare.values()]).slice(
    0,
    Math.min(DECOYS, Math.max(2, Math.ceil(answer.length / 2))),
  );
  return { answer, tiles: shuffle([...answer, ...decoys]) };
}

// Which cards a wrong build actually missed. Her tiles are matched to the
// sentence's words as a subsequence, so a skipped word or a stray decoy only
// blames the word it displaced — not everything after it. Glue words have no
// card to blame; if nothing else was wrong, the target takes it.
export function missedCards(sentence: Sentence, placed: string[]): string[] {
  const wrong = new Set<string>();
  let j = 0;
  for (const t of sentence.tokens) {
    const key = norm(tokenWord(t));
    let found = -1;
    for (let k = j; k < placed.length; k++) {
      if (norm(placed[k]) === key) {
        found = k;
        break;
      }
    }
    if (found >= 0) j = found + 1;
    else for (const id of t.card_ids ?? []) wrong.add(id);
  }
  if (wrong.size === 0) wrong.add(sentence.target_card_id);
  return [...wrong];
}

/** Bookkeeping for one sentence screen, fire-and-forget: `shown_count` is
 *  screens, `correct_count` screens passed — the numbers the ladder climbs on
 *  (sentenceCap, rungFor, glueSeen). Mutates `sentence.shown` too, so anything
 *  picked later in this session sees the new numbers rather than the ones
 *  loaded at the start. */
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
