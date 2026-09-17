// What else counts as a right answer, and whether the English asks for what
// the Spanish holds.
//
// A sentence is built from its English, and English underdetermines Spanish:
// "Are you Juan?" is "¿Vos sos Juan?" and just as much "¿Sos Juan?"; "I'm
// Chilean" is "chileno" or "chilena". Grading only the sentence as written
// marks those wrong. So every sentence carries its accepted alternatives
// (`es_alt`): the ones an author or reviewer lists, plus the ones that follow
// mechanically from the rules below. They are stored with the sentence so the
// reviewer sees — and can prune — exactly what the app will accept.
//
// The reverse problem is content: an English prompt that leaves out a word the
// Spanish needs ("Chau, che." as "Bye!") can't be answered at all.
// `uncoveredTokens` is the check for that.

import { CLITIC_LEMMAS, OPTIONAL_LEMMAS, SUBJECT_PRONOUNS } from './rules';
import { type Token, split } from './tokenize';
import type { VocabForm } from './vocabulary';

/** Alternatives past this many are noise for the reviewer. */
const MAX_VARIANTS = 24;

/** English that says whether the person is a man or a woman. */
const GENDER_CUES = /\b(he|she|him|her|his|hers|himself|herself|man|woman|boy|girl|guy|lady|mr|mrs|ms)\b/i;

type T = Token<VocabForm>;

const personalVerb = (t: T) => t.forms.find((f) => f.pos === 'verb' && f.features?.person)?.features ?? null;
const isClitic = (t: T) => t.forms.some((f) => f.pos === 'pron' && (CLITIC_LEMMAS.has(f.lemma) || f.features?.clitic));
const subjectPronoun = (t: T) => t.forms.find((f) => f.pos === 'pron' && SUBJECT_PRONOUNS.has(f.lemma))?.lemma ?? null;
const isOptionalWord = (t: T) => t.forms.length > 0 && t.forms.every((f) => OPTIONAL_LEMMAS.has(f.lemma));

/** Index of the first token from `i` that isn't a clitic. */
const skipClitics = (tokens: T[], i: number) => {
  while (i < tokens.length && isClitic(tokens[i])) i++;
  return i;
};

/** A pronoun right before its own verb ("yo soy", "yo me llamo") can go. */
function droppablePronoun(tokens: T[], i: number) {
  const lemma = subjectPronoun(tokens[i]);
  if (!lemma) return false;
  const verb = tokens[skipClitics(tokens, i + 1)];
  const f = verb && personalVerb(verb);
  const want = SUBJECT_PRONOUNS.get(lemma)!;
  return !!f && f.person === want.person && f.number === want.number;
}

/** The sentence's first token, or one after punctuation or a conjunction. */
const clauseStart = (tokens: T[], i: number) =>
  i === 0 || !!split(tokens[i - 1].surface).tail || tokens[i - 1].forms.some((f) => f.pos === 'conj');

/** Indexes of the tokens an answer may leave out. */
export function optionalTokens(tokens: T[]) {
  const out = new Set<number>();
  tokens.forEach((t, i) => {
    if (isOptionalWord(t) || droppablePronoun(tokens, i)) out.add(i);
  });
  return out;
}

interface Pick {
  lead: string;
  word: string;
  tail: string;
  name: boolean;
  inserted?: boolean;
}
interface Slot {
  original: Pick | null;
  choices: (Pick | null)[];
}

/**
 * @param tokens      from tokenize()
 * @param en          the English prompt
 * @param vocabulary  where a variant's swapped-in words come from
 * @returns           alternative Spanish sentences, `es` itself not included
 */
export function generateVariants(tokens: T[], en: string, vocabulary: { forms: VocabForm[] }): string[] {
  const optional = optionalTokens(tokens);
  const persons = tokens.map(personalVerb).filter((f): f is NonNullable<typeof f> => !!f);
  // Nothing says whether "I" or "you" is a man or a woman when the only people
  // in the sentence are the speaker and the listener, and the English is quiet.
  const genderOpen = persons.length > 0 && persons.every((f) => f.person !== 3) && !GENDER_CUES.test(en);

  // Which pronoun a third-person verb stands for, when the English names one.
  const words = englishWords(en);
  const third = words.includes('she') === words.includes('he') ? null : words.includes('she') ? 'ella' : 'él';
  const pronounFor = (f: { person?: number }) => (f.person === 1 ? 'yo' : f.person === 2 ? 'vos' : third);

  // Slots alternate: a place a pronoun could be put, then a token. Each is a
  // list of choices; null leaves it empty.
  const slots: Slot[] = [];
  tokens.forEach((t, i) => {
    const { lead, core, tail } = split(t.surface);
    const piece: Pick = { lead, word: core, tail, name: t.forms.length > 0 && t.forms.every((f) => f.pos === 'propn') };

    // The subject pronoun a verb left out, where Spanish puts one: at the start
    // of its clause, ahead of any clitic — "Soy Sofi" → "Yo soy Sofi", and
    // "Yes, she's Uruguayan" → "Sí, ella es uruguaya".
    const insert: Slot = { original: null, choices: [null] };
    const v = skipClitics(tokens, i);
    const f = tokens[v] && personalVerb(tokens[v]);
    const lemma = f && f.number === 'sg' && clauseStart(tokens, i) ? pronounFor(f) : null;
    if (lemma) {
      const hasOne =
        (i > 0 && subjectPronoun(tokens[i - 1])) || (v + 1 < tokens.length && subjectPronoun(tokens[v + 1]));
      const form = vocabulary.forms.find((x) => x.pos === 'pron' && x.lemma === lemma);
      if (!hasOne && form) insert.choices.push({ lead: '', word: form.form, tail: '', name: false, inserted: true });
    }
    slots.push(insert);

    const token: Slot = { original: piece, choices: [piece] };
    if (optional.has(i)) token.choices.push(null);
    const adj = t.forms.find((x) => x.pos === 'adj' && x.features?.gender);
    if (adj && genderOpen) {
      const other = vocabulary.forms.find(
        (x) =>
          x.lemma_id === adj.lemma_id &&
          x.pos === 'adj' &&
          x.features?.gender &&
          x.features.gender !== adj.features.gender &&
          x.features.number === adj.features.number,
      );
      if (other) token.choices.push({ ...piece, word: other.form });
    }
    slots.push(token);
  });

  const seen = new Set([key(slots.map((s) => s.original).filter((p): p is Pick => !!p))]);
  const out: string[] = [];
  const walk = (k: number, picks: { original: Pick | null; choice: Pick | null }[]) => {
    if (out.length >= MAX_VARIANTS) return;
    if (k === slots.length) {
      const pieces = render(picks);
      const id = key(pieces);
      if (pieces.length && !seen.has(id)) {
        seen.add(id);
        out.push(text(pieces));
      }
      return;
    }
    for (const choice of slots[k].choices) walk(k + 1, [...picks, { original: slots[k].original, choice }]);
  };
  walk(0, []);
  return out;
}

const key = (pieces: Pick[]) => pieces.map((p) => p.word.toLocaleLowerCase('es')).join(' ');

/**
 * Lay the picks out as a sentence. A dropped word hands its opening
 * punctuation forward ("¿Vos sos" → "¿Sos") and its closing punctuation back
 * ("Chau, che." → "Chau."); an inserted one takes the opening punctuation of
 * the word it lands before ("¿Sos" → "¿Vos sos").
 */
function render(picks: { original: Pick | null; choice: Pick | null }[]) {
  const out: Pick[] = [];
  let carry = '';
  for (const { original, choice } of picks) {
    if (choice) {
      const piece = { ...choice, lead: carry + choice.lead };
      carry = '';
      const last = out[out.length - 1];
      if (last?.inserted && !last.lead && piece.lead) {
        out[out.length - 1] = { ...last, lead: piece.lead };
        piece.lead = '';
      }
      out.push(piece);
    } else if (original) {
      carry += original.lead;
      if (original.tail && out.length) out[out.length - 1] = { ...out[out.length - 1], tail: original.tail };
    }
  }
  return out;
}

const text = (pieces: Pick[]) =>
  pieces
    .map((p, i) => {
      const word = p.name ? p.word : i === 0 ? upper(p.word) : lower(p.word);
      return `${p.lead}${word}${p.tail}`;
    })
    .join(' ');

const upper = (w: string) => w.charAt(0).toLocaleUpperCase('es') + w.slice(1);
const lower = (w: string) => w.charAt(0).toLocaleLowerCase('es') + w.slice(1);

// ---------------------------------------------------------------------------
// Coverage: does the English ask for every word the Spanish needs?
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(['a', 'an', 'the', 'to', 'of', 'get', 'be', 'do', 'for', 'on', 'in', 'with']);

/** English words, contractions opened: "I'm" → "i am", "what's" → "what is". */
export function englishWords(en: string) {
  return en
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'s\b/g, ' is')
    .replace(/'ve\b/g, ' have')
    .replace(/'ll\b/g, ' will')
    .replace(/'d\b/g, ' would')
    .split(/[^a-z]+/)
    .filter(Boolean);
}

/** Whether a form's gloss shows up in the English: any word of it, stems allowed. */
function glossed(form: VocabForm, words: string[]) {
  const keys = englishWords(form.gloss_en ?? '').filter((w) => !STOPWORDS.has(w));
  return keys.some((k) => words.some((w) => w === k || (k.length >= 3 && w.startsWith(k))));
}

/**
 * Tokens the English gives a learner no way to produce: a word in the Spanish
 * that isn't optional, isn't glue or a name, and whose meaning is nowhere in
 * the English. `loose` lists surfaces the author has confirmed are translated
 * idiomatically ("¿Cómo te llamás?" → "What's your name?").
 */
export function uncoveredTokens(tokens: T[], en: string, loose: string[] = []) {
  const words = englishWords(en);
  const optional = optionalTokens(tokens);
  const excused = new Set(loose.map((l) => String(l).toLocaleLowerCase('es')));
  return tokens.filter((t, i) => {
    if (optional.has(i) || t.forms.length === 0) return false;
    const content = t.forms.filter((f) => !f.is_glue && f.pos !== 'propn');
    if (content.length < t.forms.length) return false; // a name or glue reading is enough
    if (excused.has(t.core.toLocaleLowerCase('es'))) return false;
    return !content.some((f) => glossed(f, words));
  });
}
