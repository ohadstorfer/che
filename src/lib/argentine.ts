import { MATCH_SIZE, isPhrase, matchable, shuffle } from './answers';
import data from './argentine.json';
import { all } from './fetch-all';
import type { QueueItem } from './round';
import { loadLexicon } from './session';
import { supabase } from './supabase';
import { cultureTones } from './theme';
import type { Form, Sentence, SentenceToken } from './types';

// ---------------------------------------------------------------------------
// Argentine vocabulary (the Words tab's second half): themed packs of words
// Argentines use, apart from the course. Built from Wiktionary and beyond by agents and
// shipped inside the app (docs/argentine/words.yaml → `npm run argentine:build`).
// A pack is played through the course's own exercises, but nothing is
// scheduled: a pack is replayed when she wants, and her best score is kept on
// the device (argentine-scores.ts), the way Culture keeps its finished classes.
// ---------------------------------------------------------------------------

export interface ArWord {
  id: string;
  es: string;
  pos: 'noun' | 'verb' | 'adj' | 'adv' | 'intj' | 'phrase';
  en: string;
  /** How it is used: register, nuance, origin. */
  note: string;
  /** Two or three words shown beside the translation when it alone could mislead: "Cheer of support". */
  tag?: string;
  example: { es: string; en: string };
  /** The word as it appears in the example — what the blank is cut out of. */
  gap: string;
  /** 1 everyone says it · 2 common · 3 less common, still understood. */
  level: 1 | 2 | 3;
}

export interface ArPack {
  slug: string;
  theme: string;
  /** Its step in the theme: "Essentials II", "Going deeper". */
  name: string;
  /** The theme and the step together: "Everyday talk · Essentials II". */
  title: string;
  emoji: string;
  about: string;
  /** The rude pack: marked, and kept out of every other pack's wrong answers. */
  vulgar: boolean;
  words: ArWord[];
}

export interface ArTheme {
  slug: string;
  title: string;
  emoji: string;
  about: string;
  vulgar: boolean;
}

export const arThemes = (data as { themes: ArTheme[] }).themes;
export const arPacks = (data as unknown as { packs: ArPack[] }).packs;
export const arWordCount = arPacks.reduce((n, p) => n + p.words.length, 0);

export const findPack = (slug: string) => arPacks.find((p) => p.slug === slug) ?? null;

export const findTheme = (slug: string) => arThemes.find((t) => t.slug === slug) ?? null;
export const packsOf = (theme: string) => arPacks.filter((p) => p.theme === theme);

/** A pack's colour, dealt by its theme so the packs of one theme match. */
export function packTone(theme: string) {
  const i = arThemes.findIndex((t) => t.slug === theme);
  return cultureTones[Math.max(i, 0) % cultureTones.length];
}

// ---------------------------------------------------------------------------
// Words she already knows from the course aren't taught again.
// ---------------------------------------------------------------------------

const fold = (s: string) =>
  s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

/** Every word she has met in the course, by its spelling and by its lemma. */
export async function loadCourseWords(userId: string): Promise<Set<string>> {
  // Her ids matched against the shared lexicon: sending them back in an `in`
  // list broke once she knew a few hundred words (the URL outgrew the gateway).
  const [states, lexicon] = await Promise.all([
    all<{ form_id: string }>(() => supabase.from('form_states').select('form_id').eq('user_id', userId).order('form_id')),
    loadLexicon(),
  ]);
  const met = new Set(states.map((s) => s.form_id));
  const out = new Set<string>();
  for (const f of lexicon) {
    if (!met.has(f.id)) continue;
    out.add(fold(f.form));
    out.add(fold(f.lemma));
  }
  return out;
}

export const knownIn = (known: Set<string>, w: ArWord) => known.has(fold(w.es));

// ---------------------------------------------------------------------------
// Playing a pack through the course's exercises
//
// Each word becomes a Form the exercises can read (id `ar:<slug>`), and its
// example a one-target Sentence for the gap. Nothing here touches the
// database: the round is graded on the screen and only its score is kept.
// ---------------------------------------------------------------------------

export function toForm(w: ArWord): Form {
  return {
    id: `ar:${w.id}`,
    lemma_id: `ar:${w.id}`,
    lemma: w.es,
    pos: w.pos,
    form: w.es,
    gloss_en: w.en,
    // The whole translation, not its first sense: "cool, great" is one meaning here.
    meaning_en: w.en,
    meanings_en: [w.en],
    gloss_note_en: w.note,
    features: {},
    unit_id: '',
    unit_ordinal: 0,
    unit_order: 0,
    is_glue: false,
    register: 'informal',
    audio_path: null,
    voice_id: null,
  };
}

/** The word as the blank asks for it: its surface in the example, so a verb's
 *  wrong answers are other inflected words rather than infinitives. */
export const toGapForm = (w: ArWord): Form => ({ ...toForm(w), form: uncapped(w) });

/** The gap as it reads out of its sentence: "Atenti" opens its example, but
 *  as one option among lowercase ones its capital would mark it as the odd one
 *  out. A word that is always capitalised keeps it. */
function uncapped(w: ArWord) {
  const first = w.gap.charAt(0);
  const always = w.es.charAt(0) !== w.es.charAt(0).toLocaleLowerCase('es');
  return always ? w.gap : first.toLocaleLowerCase('es') + w.gap.slice(1);
}

const bare = (s: string) => fold(s).replace(/[^\p{L}\p{N}]+/gu, '');

/** The example as a sentence whose one graded token is the word. */
export function toSentence(w: ArWord): Sentence {
  const id = `ar:${w.id}`;
  const parts = w.example.es.split(/\s+/).filter(Boolean);
  const want = w.gap.split(/\s+/).map(bare);
  const at = parts.findIndex((_, i) => want.every((g, j) => bare(parts[i + j] ?? '') === g));
  const tokens: SentenceToken[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i === at) {
      tokens.push({ surface: parts.slice(i, i + want.length).join(' '), form_ids: [id] });
      i += want.length - 1;
    } else {
      tokens.push({ surface: parts[i], form_ids: [] });
    }
  }
  return {
    id,
    unit_id: '',
    es: w.example.es,
    en: w.example.en,
    en_alt: [],
    es_alt: [],
    audio_path: null,
    voice_id: null,
    target_form_id: id,
    difficulty: 0,
    tokens,
    form_ids: [id],
    shown: null,
  };
}

/** A pack's item: an intro card for a word, or an exercise. */
export type PackItem = { kind: 'intro'; word: ArWord } | { kind: 'exercise'; item: QueueItem };

/** How many words are taught before they are matched up. */
const BATCH = MATCH_SIZE;

const exercise = (item: Omit<QueueItem, 'state'>): PackItem => ({ kind: 'exercise', item: { ...item, state: null } });

/**
 * A play of a pack. The first time through, words are taught four at a time —
 * an intro card each, then a matching screen (or a quick meaning check for a
 * phrase, which matching leaves out) — and then every word comes back as a
 * fill-the-blank in its example. A replay skips the cards: a mix of meaning,
 * Spanish and blanks, with the matching screens between.
 */
export function buildPackRound(words: ArWord[], firstTime: boolean): PackItem[] {
  const out: PackItem[] = [];
  const gap = (w: ArWord) =>
    exercise({ form: toGapForm(w), mode: 'sentence_gap', direction: 'en_to_es', sentence: toSentence(w) });
  const choice = (w: ArWord, direction: QueueItem['direction']) =>
    exercise({ form: toForm(w), mode: 'multiple_choice', direction });
  const match = (group: ArWord[]): PackItem[] => {
    const forms = matchable(group.map(toForm));
    const matched = new Set(forms.map((f) => f.id));
    const rest = group.filter((w) => !matched.has(`ar:${w.id}`)).map((w) => choice(w, 'es_to_en'));
    return forms.length >= 3
      ? [exercise({ form: forms[0], mode: 'matching', direction: 'es_to_en', group: forms }), ...rest]
      : group.map((w) => choice(w, 'es_to_en'));
  };

  if (firstTime) {
    for (let i = 0; i < words.length; i += BATCH) {
      const batch = words.slice(i, i + BATCH);
      for (const w of batch) out.push({ kind: 'intro', word: w });
      out.push(...match(batch));
    }
    out.push(...shuffle(words).map(gap));
    return out;
  }

  const mixed = shuffle(words);
  const singles = mixed.map((w, i) =>
    i % 3 === 0 ? gap(w) : choice(w, i % 3 === 1 || isPhrase(w.es) ? 'es_to_en' : 'en_to_es'),
  );
  const pairs = shuffle(words.filter((w) => !isPhrase(w.es))).slice(0, BATCH);
  const block = pairs.length >= 3 ? match(pairs).slice(0, 1) : [];
  singles.splice(Math.floor(singles.length / 2), 0, ...block);
  return singles;
}

/** How many words the wrong answers are chosen among, at the least. */
const DECOY_POOL = 24;

/**
 * The words a pack's wrong answers are drawn from: its own and its theme's, so
 * a food word is told apart from other food; topped up with clean words from
 * other themes only when the theme is small. A clean pack never offers a rude
 * word as a decoy.
 */
export function decoyWords(pack: ArPack): ArWord[] {
  const theme = arPacks.filter((p) => p.theme === pack.theme && p.slug !== pack.slug).flatMap((p) => p.words);
  const pool = [...pack.words, ...theme];
  if (pool.length >= DECOY_POOL) return pool;
  const clean = shuffle(arPacks.filter((p) => !p.vulgar && p.theme !== pack.theme).flatMap((p) => p.words));
  return [...pool, ...clean.slice(0, DECOY_POOL - pool.length)];
}
