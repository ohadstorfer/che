import { addDays, localDateStr } from './dates';
import {
  INTRO_IN_SENTENCE_MIN_CAP,
  glueSeen,
  loadSentences,
  pickIntroSentence,
  pickReviewSentences,
  rungFor,
  sentenceCap,
} from './sentences';
import { supabase } from './supabase';
import type { Card, CardState, ExerciseMode, Sentence } from './types';

export interface SessionItem {
  card: Card;
  state: CardState | null; // null → the card is brand new for this user
  mode: ExerciseMode;
  direction: 'translit_to_spanish' | 'spanish_to_translit';
  /** Extra cards this exercise needs (matching pairs, the words of a sentence). */
  group?: Card[];
  /** SM-2 states for `group`, so words drilled only through a sentence can
   *  still be graded. */
  groupStates?: CardState[];
  /** Set on sentence exercises: the sentence being shown. */
  sentence?: Sentence;
  /** Set on the exercise a new word is met in — the intro screen it replaces. */
  introduces?: Card;
  /** Padding on a thin day: drilled, logged, but never scheduled (see
   *  MIN_SESSION_ITEMS). */
  filler?: boolean;
}

export interface SessionData {
  items: SessionItem[];
  allCards: Card[];
  /** Every active sentence — the intro exercise draws wrong meanings from them. */
  sentences: Sentence[];
  /** Cards SM-2 asked for today (new or due). Anything else a sentence drags in
   *  is drilled and logged, but its schedule is left alone. */
  scheduledCardIds: string[];
}

// How many words she meets for the first time in a day. Fixed, not a setting:
// the pace is the app's opinion, and a dial she can raise is a dial that turns
// a ten-minute habit into a forty-minute chore on the day she feels keen.
export const NEW_CARDS_PER_DAY = 5;

/** A card whose transliteration has spaces is a sentence, not a word. */
export const isPhrase = (translit: string) => translit.trim().includes(' ');

export const wordsOf = (text: string) => text.trim().split(/\s+/).filter(Boolean);

/** Cards in a matching block. */
export const MATCH_SIZE = 4;

// A card whose interval has reached this many days has settled: it can be
// asked to type the word, and earns a third angle so reviews stay varied. Not
// the same bar as the sentence generator's "mature" (21 days), which decides
// when a word's other forms may appear — that one is about grammar, this one
// about which exercises are fair.
export const SETTLED_DAYS = 7;
const settled = (state: CardState | null) => (state?.interval_days ?? 0) >= SETTLED_DAYS;

// Hard ceiling on the screens a session plans — intros and the matching block
// included. (Re-asks of missed cards can still run past it; a mistake earning
// another look is not the session getting longer, it's the session working.)
// At her pace — about six seconds a screen — that is two to three minutes.
export const MAX_SESSION_ITEMS = 18;

// Floor on the same count. Some days almost nothing falls due and the daily
// allowance of new words is already spent, which used to hand her a class of
// three screens — technically the right amount of study, but it doesn't feel
// like a class. The gap is padded with words she has already met, closest to
// falling due first, flagged `filler`: they get drilled and logged, and their
// SM-2 schedule is left alone, because practising a card early should never
// push its real due date around.
export const MIN_SESSION_ITEMS = 8;

/** Cards considered when padding a thin day — a head to shuffle, so two quiet
 *  days in a row don't serve the same padding. */
const FILLER_POOL = 12;

/** Screens a set of exercise groups will spend, at `extra` per group — 1 for
 *  new cards, whose intro screen is added by the practice queue. A new word
 *  met inside a sentence carries its intro in the group already. */
const screens = (groups: SessionItem[][], extra: number) =>
  groups.reduce(
    (n, g) => n + g.length + (g[0]?.mode === 'sentence_intro' ? 0 : extra),
    0,
  );

/** A group cut down to `n` angles — keeping the sentence intro on top of them. */
const trim = (g: SessionItem[], n: number) =>
  g[0]?.mode === 'sentence_intro' ? g.slice(0, n + 1) : g.slice(0, n);

const PRODUCTION: ExerciseMode[] = ['typing', 'word_build', 'listen_build'];

/** A group cut down to its one production angle (the first exercise if it
 *  somehow has none). */
const productionOnly = (g: SessionItem[]) => {
  const item = g.find((i) => PRODUCTION.includes(i.mode)) ?? g[0];
  return item ? [item] : [];
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Exercise selection
//
// Every exercise is auto-graded — nothing asks her to rate herself. A card is
// drilled from several angles in one session, so four words still make a real
// lesson instead of four taps.
// ---------------------------------------------------------------------------
function exercisesFor(card: Card, state: CardState | null, deck: Card[]): ExerciseMode[] {
  return isPhrase(card.translit)
    ? sentenceExercises(card, state, deck)
    : wordExercises(card, state, deck.length);
}

function wordExercises(card: Card, state: CardState | null, totalCards: number): ExerciseMode[] {
  const enoughForChoices = totalCards >= MATCH_SIZE;
  const mature = settled(state);

  // Recognition first, then production — easiest to hardest.
  const recognition: ExerciseMode[] = [];
  if (enoughForChoices) recognition.push('multiple_choice');
  recognition.push('true_false');
  if (card.audio_path && enoughForChoices) recognition.push('listen');

  const production: ExerciseMode[] = ['word_build'];
  // Typing is the strictest test: single words only, and only once the card
  // has properly settled — matching what he asked for. It is also the only
  // exercise that can earn "fácil" (practice.tsx).
  if (mature) production.push('typing');

  const picked: ExerciseMode[] = [
    shuffle(recognition)[0],
    shuffle(production)[0],
  ];

  // Settled cards earn a third angle so review sessions stay varied.
  if (mature && recognition.length > 1) {
    const extra = shuffle(recognition.filter((m) => m !== picked[0]))[0];
    if (extra) picked.push(extra);
  }

  return picked.filter(Boolean);
}

// A sentence is drilled the way Duolingo drills one: understand it, then
// rebuild it. Multiple choice only works once there are other sentences to
// serve as plausible wrong meanings — a sentence next to three single words
// gives the answer away.
function sentenceExercises(card: Card, state: CardState | null, deck: Card[]): ExerciseMode[] {
  const sentences = deck.filter((c) => isPhrase(c.translit)).length;
  const mature = settled(state);

  const recognition: ExerciseMode[] = [];
  if (sentences >= SENTENCE_CHOICES) recognition.push('multiple_choice');
  if (card.audio_path && sentences >= SENTENCE_CHOICES) recognition.push('listen');

  const picked: ExerciseMode[] = [];
  if (recognition.length) picked.push(shuffle(recognition)[0]);
  // Assembling the sentence from tiles is the heart of it — always included.
  picked.push('word_build');
  // Transcribing what she hears is the hardest angle, so it waits until she
  // has met the sentence at least once.
  if (card.audio_path && state) picked.push('listen_build');
  else if (mature && recognition.length > 1) {
    const extra = shuffle(recognition.filter((m) => m !== picked[0]))[0];
    if (extra) picked.push(extra);
  }

  return picked;
}

function pickDirection(card: Card, mode: ExerciseMode, seen: boolean): SessionItem['direction'] {
  // Listening always resolves to meaning; transcription always produces Hebrew.
  if (mode === 'listen') return 'translit_to_spanish';
  if (mode === 'listen_build' || mode === 'typing') return 'spanish_to_translit';
  if (mode === 'word_build') {
    // Sentences she has already met get built in both directions; a first
    // meeting, and every single word, always produces Hebrew. Building the
    // Spanish side needs a Spanish side worth building — a one-word
    // translation would break into letters instead of words.
    if (!isPhrase(card.translit) || !isPhrase(card.spanish) || !seen) return 'spanish_to_translit';
    return Math.random() < 0.4 ? 'translit_to_spanish' : 'spanish_to_translit';
  }
  return Math.random() < 0.5 ? 'translit_to_spanish' : 'spanish_to_translit';
}

function itemsForCard(card: Card, state: CardState | null, deck: Card[]): SessionItem[] {
  return exercisesFor(card, state, deck).map((mode) => ({
    card,
    state,
    mode,
    direction: pickDirection(card, mode, state !== null),
  }));
}

// Interleave each card's exercises so the same word never appears twice in a
// row: round 1 takes every card's first exercise, round 2 the second, and so on.
function interleave(groups: SessionItem[][]): SessionItem[] {
  const out: SessionItem[] = [];
  const depth = Math.max(0, ...groups.map((g) => g.length));
  for (let round = 0; round < depth; round++) {
    for (const group of groups) {
      if (group[round]) out.push(group[round]);
    }
  }
  return out;
}

// A matching block: one screen that drills four cards at once. Inserted when
// there are enough cards, as a warm-up before the individual exercises.
// Sentences are left out — eight of them on one screen is a wall of text.
function matchingBlock(cards: Card[]): SessionItem | null {
  const words = cards.filter((c) => !isPhrase(c.translit));
  if (words.length < MATCH_SIZE) return null;
  const group = shuffle(words).slice(0, MATCH_SIZE);
  return {
    card: group[0],
    state: null,
    mode: 'matching',
    direction: 'translit_to_spanish',
    group,
  };
}

export async function getPendingCounts(userId: string) {
  const today = localDateStr();
  const nowIso = new Date().toISOString();

  const [{ data: states }, { data: cards }] = await Promise.all([
    supabase.from('card_states').select('card_id, due_at, introduced_on').eq('user_id', userId),
    supabase.from('cards').select('id').order('created_at', { ascending: true }),
  ]);

  const seen = new Set((states ?? []).map((s) => s.card_id));
  const due = (states ?? []).filter((s) => s.due_at && s.due_at <= nowIso).length;
  const introducedToday = (states ?? []).filter((s) => s.introduced_on === today).length;
  const unseen = (cards ?? []).filter((c) => !seen.has(c.id)).length;
  const newAvailable = Math.min(Math.max(NEW_CARDS_PER_DAY - introducedToday, 0), unseen);

  // `reviewable` is everything she has already met — the pool free practice
  // draws from once the scheduled work for the day is finished.
  return { due, newAvailable, total: due + newAvailable, reviewable: seen.size };
}

// Builds today's queue: new cards first (oldest uploads first, capped by the
// daily allowance), then everything due, ordered by due date. Each card
// contributes several exercises, interleaved. Where a generated sentence can
// carry the work, it does — a few screens a class, growing with her results
// (the ladder in sentences.ts): due words are reviewed inside a sentence, and
// once the cap is high enough, a new word is met inside one written for it.
export async function buildSession(userId: string): Promise<SessionData> {
  const today = localDateStr();
  const nowIso = new Date().toISOString();

  const [{ data: cards }, { data: states }, sentences, { data: yesterday }] = await Promise.all([
    supabase.from('cards').select('*').order('created_at', { ascending: true }),
    supabase.from('card_states').select('*').eq('user_id', userId),
    loadSentences(userId),
    supabase
      .from('daily_sessions')
      .select('sentence_fails')
      .eq('user_id', userId)
      .eq('session_date', localDateStr(addDays(new Date(), -1)))
      .maybeSingle(),
  ]);

  const allCards = (cards ?? []) as Card[];
  const stateByCard = new Map((states ?? []).map((s) => [s.card_id, s as CardState]));
  const known = new Set(stateByCard.keys());
  // Words a sentence may lean on: settled ones, not merely met. A sentence made
  // of words she is still shaky on is two problems at once.
  const settled = new Set(
    [...stateByCard.values()].filter((s) => s.interval_days >= SETTLED_DAYS).map((s) => s.card_id),
  );
  const cardById = new Map(allCards.map((c) => [c.id, c]));

  // Where she is on the sentence ladder today (see sentences.ts).
  const cap = sentenceCap(sentences, yesterday?.sentence_fails ?? 0);
  const seen = glueSeen(sentences);

  const introducedToday = (states ?? []).filter((s) => s.introduced_on === today).length;
  const allowance = Math.max(NEW_CARDS_PER_DAY - introducedToday, 0);
  const newCards = allCards.filter((c) => !stateByCard.has(c.id)).slice(0, allowance);

  const dueStates = ((states ?? []) as CardState[])
    .filter((s) => s.due_at && s.due_at <= nowIso)
    .sort((a, b) => (a.due_at! < b.due_at! ? -1 : 1));
  const dueCards = dueStates.flatMap((s) => {
    const card = cardById.get(s.card_id);
    return card ? [{ card, state: s }] : [];
  });

  // A sentence exercise drills every card inside the sentence — `group`, the
  // same way a matching block drills its four — keyed on the word it is for.
  const sentenceItem = (
    sentence: Sentence,
    mode: ExerciseMode,
    target: Card,
    introduces?: Card,
  ): SessionItem => {
    const group: Card[] = [];
    const groupStates: CardState[] = [];
    for (const id of new Set(sentence.card_ids)) {
      const card = cardById.get(id);
      if (!card) continue;
      group.push(card);
      const state = stateByCard.get(id);
      if (state) groupStates.push(state);
    }
    if (!group.some((c) => c.id === target.id)) group.push(target);
    return {
      card: target,
      state: stateByCard.get(target.id) ?? null,
      mode,
      direction: 'spanish_to_translit',
      sentence,
      group,
      groupStates,
      introduces,
    };
  };

  // New words: the plain intro screen while the ladder is low. Once the cap has
  // grown, a new word is met inside a sentence written for it (the sentence
  // exercise stands in for the intro screen) — and that screen counts against
  // the cap, so the rest of the class's sentences make room for it.
  let introsUsed = 0;
  let newGroups = newCards.map((card) => {
    const own = itemsForCard(card, null, allCards);
    if (cap < INTRO_IN_SENTENCE_MIN_CAP || introsUsed >= cap) return own;
    const intro = pickIntroSentence(card, sentences, known);
    if (!intro) return own;
    introsUsed += 1;
    return [sentenceItem(intro, 'sentence_intro', card, card), ...own];
  });

  // Due words are reviewed through sentences where possible, one screen each,
  // at the rung the sentence has earned. What a screen actually tests is what
  // its words skip their own exercises for: the gap tests its blanked word, the
  // tiles test every word; reading a sentence for its meaning tests nothing
  // hard enough to stand in for a review, so those words are drilled on their
  // own as well.
  const dueIds = new Set(dueCards.map((d) => d.card.id));
  const reviewSentences = pickReviewSentences(
    dueIds,
    sentences,
    settled,
    Math.max(0, cap - introsUsed),
    seen,
    cap,
  );
  const covered = new Set<string>();
  let sentenceGroups = reviewSentences.flatMap((sentence) => {
    const target = cardById.get(sentence.target_card_id);
    if (!target) return [];
    // The gap tests a word that is actually due today — the sentence's own
    // target if it is, otherwise one of the due words it was picked to cover.
    // Blanking the target regardless once quizzed a word three weeks from due
    // while the due one sat in plain sight.
    const gapCard =
      dueIds.has(target.id)
        ? target
        : (sentence.card_ids.map((id) => cardById.get(id)).find((c) => c && dueIds.has(c.id)) ?? target);
    const rung = rungFor(sentence, seen);
    let mode: ExerciseMode;
    if (rung === 'meaning') {
      mode = 'sentence_meaning';
    } else if (rung === 'gap') {
      mode = 'sentence_gap';
      covered.add(gapCard.id);
    } else {
      mode = sentence.audio_path && Math.random() < 0.5 ? 'sentence_listen' : 'sentence_build';
      for (const id of sentence.card_ids) covered.add(id);
    }
    return [[sentenceItem(sentence, mode, gapCard)]];
  });
  let dueGroups = dueCards
    .filter(({ card }) => !covered.has(card.id))
    .map(({ card, state }) => itemsForCard(card, state, allCards));

  // Fit the day under MAX_SESSION_ITEMS, gentlest valve first: every card
  // loses its third angle, then the newest new words wait for their turn, then
  // due cards drop to a single angle — the production one, since recognition
  // alone proves little — and only then do due cards slip to tomorrow. Reviews
  // win because a due card left for tomorrow is a word she is starting to
  // forget, while a new word left for tomorrow is just a word she meets
  // tomorrow. (The order used to be the other way round: after a big import it
  // would have served nothing but new words for weeks, with every review pushed
  // back.) The single-angle valve is what lets a backlog — a week away — clear
  // in days rather than weeks: an Anki review is one screen too. Sentences go
  // last of all — one screen of one can carry several reviews.
  const fillerGroups: SessionItem[][] = [];
  const total = () =>
    screens(newGroups, 1) +
    screens(sentenceGroups, 0) +
    screens(dueGroups, 0) +
    screens(fillerGroups, 0);
  if (total() > MAX_SESSION_ITEMS) {
    newGroups = newGroups.map((g) => trim(g, 2));
    dueGroups = dueGroups.map((g) => g.slice(0, 2));
  }
  while (total() > MAX_SESSION_ITEMS && newGroups.length) newGroups.pop();
  if (total() > MAX_SESSION_ITEMS) dueGroups = dueGroups.map(productionOnly);
  while (total() > MAX_SESSION_ITEMS && dueGroups.length) dueGroups.pop();
  while (total() > MAX_SESSION_ITEMS && sentenceGroups.length) sentenceGroups.pop();

  // And lift a thin day up to MIN_SESSION_ITEMS with words she has already
  // met — two angles each, nearest to falling due first. Two screens per card
  // keeps the top-up from overshooting the ceiling.
  if (total() < MIN_SESSION_ITEMS) {
    const scheduled = new Set([
      ...newCards.map((c) => c.id),
      ...dueCards.map((d) => d.card.id),
    ]);
    const pool = shuffle(
      ((states ?? []) as CardState[])
        .filter((s) => !scheduled.has(s.card_id) && cardById.has(s.card_id))
        .sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''))
        .slice(0, FILLER_POOL),
    );
    for (const state of pool) {
      if (total() >= MIN_SESSION_ITEMS) break;
      const group = itemsForCard(cardById.get(state.card_id)!, state, allCards)
        .slice(0, 2)
        .map((item) => ({ ...item, filler: true }));
      if (group.length) fillerGroups.push(group);
    }
  }

  const items: SessionItem[] = [
    ...interleave(newGroups),
    ...interleave([...sentenceGroups, ...dueGroups, ...fillerGroups]),
  ];

  // A matching warm-up in the middle keeps longer sessions from feeling samey
  // — when the ceiling has a screen to spare for it.
  const drilled = [
    ...newGroups.map((g) => g[0].card),
    ...sentenceGroups.map((g) => g[0].card),
    ...dueGroups.map((g) => g[0].card),
    ...fillerGroups.map((g) => g[0].card),
  ];
  const block = matchingBlock(drilled);
  if (block && items.length >= 6 && total() < MAX_SESSION_ITEMS) {
    items.splice(Math.floor(items.length / 2), 0, block);
  }

  return {
    items,
    allCards,
    sentences,
    scheduledCardIds: [...newCards.map((c) => c.id), ...dueCards.map((d) => d.card.id)],
  };
}

/** How many cards a round of free practice serves up. */
export const FREE_SESSION_SIZE = 6;

// Free practice: an extra round she can take as often as she likes, on top of
// the scheduled session. It draws from cards she has already been introduced
// to, favouring the ones due soonest, and deliberately writes nothing back to
// `card_states` — re-drilling a card should never drag its real SM-2 schedule
// around, or a keen day would empty the next week. Words only, for now: the
// sentences belong to the scheduled session.
export async function buildFreeSession(
  userId: string,
  limit = FREE_SESSION_SIZE,
): Promise<SessionData> {
  const [{ data: cards }, { data: states }] = await Promise.all([
    supabase.from('cards').select('*'),
    supabase.from('card_states').select('*').eq('user_id', userId),
  ]);

  const allCards = (cards ?? []) as Card[];
  const cardById = new Map(allCards.map((c) => [c.id, c]));

  // Soonest-due first, then take a random slice of that head so consecutive
  // rounds aren't identical.
  const pool = shuffle(
    ((states ?? []) as CardState[])
      .filter((s) => cardById.has(s.card_id))
      .sort((a, b) => (a.due_at ?? '').localeCompare(b.due_at ?? ''))
      .slice(0, Math.max(limit * 2, limit)),
  ).slice(0, limit);

  // The same ceiling as the daily session. No intros here — every card in the
  // pool has been met before — so groups cost only their own screens.
  let groups = pool.map((state) => itemsForCard(cardById.get(state.card_id)!, state, allCards));
  if (screens(groups, 0) > MAX_SESSION_ITEMS) groups = groups.map((g) => g.slice(0, 2));
  while (screens(groups, 0) > MAX_SESSION_ITEMS && groups.length) groups.pop();

  const items = interleave(groups);

  const block = matchingBlock(groups.map((g) => g[0].card));
  if (block && items.length >= 6 && items.length < MAX_SESSION_ITEMS) {
    items.splice(Math.floor(items.length / 2), 0, block);
  }

  return { items, allCards, sentences: [], scheduledCardIds: [] };
}

/** Options shown for a sentence — three reads better than four at that length. */
export const SENTENCE_CHOICES = 3;

// Distractors for multiple choice, drawn from cards of the same kind: a
// sentence competes against other sentences, a word against other words.
// Mixing the two would let her answer on shape alone.
export function pickOptions(correct: Card, allCards: Card[], field: 'spanish' | 'translit') {
  const count = isPhrase(correct.translit) ? SENTENCE_CHOICES : MATCH_SIZE;
  const sameKind = allCards.filter(
    (c) => isPhrase(c.translit) === isPhrase(correct.translit),
  );
  const pool = sameKind.length >= count ? sameKind : allCards;
  const others = shuffle(pool.filter((c) => c.id !== correct.id && c[field] !== correct[field]));
  return shuffle([correct, ...others.slice(0, count - 1)]);
}

/** A plausible wrong meaning for the true/false exercise. */
export function pickImposter(correct: Card, allCards: Card[]): Card | null {
  const sameKind = allCards.filter(
    (c) => isPhrase(c.translit) === isPhrase(correct.translit),
  );
  const pool = sameKind.length > 1 ? sameKind : allCards;
  const others = pool.filter((c) => c.id !== correct.id && c.spanish !== correct.spanish);
  return others.length ? shuffle(others)[0] : null;
}

const bare = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}]/gu, '');

// Spare words for a sentence's tile bank, borrowed from the rest of the deck.
// Without them the exercise is just "use every tile you can see".
export function wordPool(correct: Card, allCards: Card[], field: 'spanish' | 'translit'): string[] {
  const taken = new Set(wordsOf(correct[field]).map(bare));
  const out = new Map<string, string>();
  for (const c of allCards) {
    if (c.id === correct.id) continue;
    for (const word of wordsOf(c[field])) {
      const key = bare(word);
      if (!key || taken.has(key) || out.has(key)) continue;
      out.set(key, word.replace(/[.,!?¿¡;:]+$/g, ''));
    }
  }
  return [...out.values()].filter(Boolean);
}

/** How many spare tiles a sentence's bank carries beyond the answer. */
const SENTENCE_DECOYS = 4;

// Tiles for the building exercises: a sentence breaks into its words, a single
// word into its letters. Decoys are mixed in either way.
export function buildTiles(
  target: string,
  distractors: string[] = [],
): { answer: string[]; tiles: string[] } {
  const clean = target.trim();

  if (isPhrase(clean)) {
    const answer = wordsOf(clean);
    const decoys = shuffle(distractors).slice(
      0,
      Math.min(SENTENCE_DECOYS, Math.max(2, Math.ceil(answer.length / 2))),
    );
    return { answer, tiles: shuffle([...answer, ...decoys]) };
  }

  const answer = clean.split('');
  const decoys = new Set<string>();
  const alphabet = 'abdefghiklmnoprstuvyz'.split('');
  const wanted = Math.min(3, Math.max(2, Math.floor(answer.length / 2)));
  // A short word can run out of unused letters — cap the attempts, not the loop.
  for (let tries = 0; decoys.size < wanted && tries < 60; tries++) {
    const c = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (!answer.includes(c)) decoys.add(c);
  }

  return { answer, tiles: shuffle([...answer, ...decoys]) };
}

// Forgiving comparison for typed answers: case-, accent- and punctuation-
// insensitive, and one typo (edit distance 1) is still accepted.
export function typedAnswerMatches(input: string, expected: string): boolean {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]/g, '');
  const a = norm(input);
  const b = norm(expected);
  if (!a) return false;
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  // edit distance ≤ 1
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}
