import { glossSenses, norm, senseKey, senses } from './answers';
import type { Form, Sentence } from './types';

// ---------------------------------------------------------------------------
// What a word means, from where it is used.
//
// A gloss is a dictionary entry: "well, fine, good". No screen can print it
// whole — "Type it in Spanish: thanks, thank you" is a riddle — and no one
// sense of it is right everywhere: `bien hecho` is "well done", `estoy bien` is
// "I'm fine". So the meaning a screen shows is not authored. Every sentence
// token carries what it means in that sentence (`course:gloss` aligns it with
// the English), and a word's meanings are whatever its sentences say, ranked
// by how she has met them. A new sentence can add a meaning ("pretty bad" for
// `mal`); nobody has to remember to write it down. The dictionary gloss only
// vets them: a rendering that shares no word with it ("there" for the `che` of
// "Hi there") stays in its sentence.
//
// Pure, so it can be tested on its own (scripts/course/test/meanings.test.mjs).
// ---------------------------------------------------------------------------

interface Tally {
  /** The meaning as the first sentence to give it wrote it. */
  text: string;
  /** Times she has been shown a sentence that uses the word this way. */
  met: number;
  /** Sentences written to teach or drill the word that use it this way. */
  carries: number;
  /** Sentences that use it this way at all. */
  uses: number;
  /** The earliest unit a sentence using it this way belongs to. */
  unit: number;
}

/**
 * A form's meanings across the sentences, most familiar to her first. Between
 * two she has met as often, `closeness` breaks the tie: "you're" before "are
 * you" for `sos`, because it reads as the dictionary does.
 */
export function meaningsFromSentences(
  sentences: Sentence[],
  closeness: (formId: string, meaning: string) => number = () => 0,
): Map<string, string[]> {
  const tallies = new Map<string, Map<string, Tally>>();
  for (const s of sentences) {
    for (const t of s.tokens) {
      const text = t.gloss?.trim();
      if (!text) continue;
      for (const id of t.glue ? [...t.form_ids, t.glue] : t.form_ids) {
        const own = tallies.get(id) ?? new Map<string, Tally>();
        tallies.set(id, own);
        const key = senseKey(text);
        const tally = own.get(key) ?? { text, met: 0, carries: 0, uses: 0, unit: Infinity };
        tally.met += s.shown?.shown_count ?? 0;
        if (s.target_form_id === id) tally.carries++;
        tally.uses++;
        tally.unit = Math.min(tally.unit, s.unit_order ?? 0);
        own.set(key, tally);
      }
    }
  }
  const ranked = new Map<string, string[]>();
  for (const [id, own] of tallies) {
    const close = (t: Tally) => closeness(id, t.text);
    ranked.set(
      id,
      [...own.values()]
        .sort(
          (a, b) =>
            b.met - a.met || close(b) - close(a) || b.carries - a.carries || b.uses - a.uses || a.unit - b.unit,
        )
        .map((t) => t.text),
    );
  }
  return ranked;
}

/** Words too common to tie a translation to a word: "it" and "that" are in
 *  half the translations of anything. */
const FILLER = new Set(['a', 'an', 'the', 'to', 'of', 'it', 'that', 'this', 'there']);

/** A translation's words, contractions opened: "you're" → you, are. */
const englishWords = (text: string) =>
  text
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'s\b/g, ' is')
    .replace(/'ll\b/g, ' will')
    .replace(/'ve\b/g, ' have')
    .replace(/'d\b/g, ' would')
    .split(/[^a-z]+/)
    .filter((w) => w && !FILLER.has(w));

/**
 * Whether a sentence's rendering of a word can stand for the word on its own.
 * A translation renders a sentence, not each word: "Hola, che" is "Hi there",
 * "¡Sos vos!" is "It's you!" — right for the sentence, but "there" is not what
 * `che` means, and a prompt asking for "it's" wants `es`, not `sos`. So a
 * meaning leaves its sentence only when it shares a word with the word's
 * dictionary gloss: "you're" and "are you" for `sos` ("you are"), "pretty bad"
 * for `mal` ("bad, badly"). The rest still show where they belong — in
 * the popover of their own sentence.
 */
export function standsAlone(meaning: string, gloss: string) {
  const dictionary = new Set(englishWords(gloss));
  return englishWords(meaning).some((w) => dictionary.has(w));
}

/** 2 when a meaning is one of the gloss's senses, in the same words in the same
 *  order ("you're" is "you are"); 1 when it shares a word; 0 otherwise. */
export function closeness(meaning: string, gloss: string) {
  const words = englishWords(meaning).join(' ');
  if (glossSenses(gloss).some((s) => englishWords(s).join(' ') === words)) return 2;
  return standsAlone(meaning, gloss) ? 1 : 0;
}

/** A row of the word popover: what it says, and whether it is only true here. */
export interface MeaningRow {
  text: string;
  /** True on the sentence's own rendering, when a dictionary row follows it. */
  here?: boolean;
}

/**
 * What the popover lists for a word, given what it means in the sentence she
 * tapped it in.
 *
 * Normally that rendering is the whole answer: `bien` in "bien hecho" is
 * "well", and printing the dictionary's "well, fine, good" under her finger
 * would be the riddle this file exists to avoid.
 *
 * But a translation renders a sentence, not each word, and some renderings are
 * not what the word means at all: `cómo` is "what's" in every sentence the
 * course has ("¿Cómo te llamás?" → "What's your name?"), `che` is "there" in
 * "Hi there". `standsAlone` already knows — it is what keeps those out of
 * `meanings_en`, which is why the drill two screens later asks for "how" off
 * the dictionary instead. A popover that shows only "what's" therefore teaches
 * one thing and tests another. So when the rendering can't stand for the word,
 * the word's own meaning comes with it, and the rendering is marked as
 * belonging to this sentence.
 *
 * A loanword glosses as itself — mate, empanada, peso. Printing the word again
 * under the word teaches nothing, so the repeat is dropped; the caller is left
 * with the note, or the plain fact that English borrowed it whole.
 */
export function popoverMeanings(form: { form: string; gloss_en: string }, inContext?: string): MeaningRow[] {
  const itself = (text: string) => norm(text) === norm(form.form);
  const dictionary = glossSenses(form.gloss_en).filter((t) => !itself(t));
  const here = inContext?.trim() && !itself(inContext) ? inContext.trim() : null;
  if (!here) return dictionary.map((text) => ({ text }));
  const rest = dictionary.filter((t) => senseKey(t) !== senseKey(here));
  // A rendering that is one of the senses word for word is the word's meaning,
  // whatever `standsAlone` makes of it: it compares content words, and `un`
  // ("a, an") rendered "a" has none on either side.
  if (rest.length < dictionary.length || standsAlone(here, form.gloss_en)) return [{ text: here }];
  return rest.length ? [{ text: here, here: true }, ...rest.map((text) => ({ text }))] : [{ text: here }];
}

/**
 * The forms with `meaning_en` and `meanings_en` filled in.
 *
 * The meaning shown is the most familiar one that no other word she could know
 * by now also answers to. "well" is the first thing `bien` means, but once
 * `bueno` ("well, OK") is in reach a prompt saying "well" has two right
 * answers — so `bien` shows its next meaning instead. Only when every meaning
 * is shared does it keep the most familiar one; grading then accepts the other
 * word as well (answers.ts, gradeTyped).
 *
 * `reached` is the furthest unit she has met a word from: every word up to
 * there, or up to the word's own unit, counts as one she could know.
 */
export function withMeanings(forms: Form[], sentences: Sentence[], reached = 0): Form[] {
  const glossById = new Map(forms.map((f) => [f.id, f.gloss_en]));
  const fromSentences = meaningsFromSentences(sentences, (id, m) => closeness(m, glossById.get(id) ?? ''));
  const meaningsOf = (f: Form) => (fromSentences.get(f.id) ?? []).filter((m) => standsAlone(m, f.gloss_en));

  // Who answers to each piece of English.
  const owners = new Map<string, Form[]>();
  for (const f of forms) {
    if (f.is_glue) continue;
    const keys = new Set([...senses(f.gloss_en), ...meaningsOf(f).map(senseKey)]);
    for (const key of keys) owners.set(key, [...(owners.get(key) ?? []), f]);
  }

  return forms.map((f) => {
    const meanings = meaningsOf(f);
    const candidates = [...meanings, ...glossSenses(f.gloss_en)];
    if (!candidates.length) return f;
    const limit = Math.max(reached, f.unit_order);
    const shared = (text: string) =>
      (owners.get(senseKey(text)) ?? []).some(
        (o) =>
          o.id !== f.id &&
          o.unit_order <= limit &&
          // The other gender of the same word is the same answer, not a rival.
          !(o.lemma_id === f.lemma_id && o.pos === f.pos && o.gloss_en === f.gloss_en),
      );
    // The word is not its own meaning. A sentence that renders `medialuna` as
    // "medialuna" would make every prompt print its own answer, so the
    // dictionary gloss ("croissant") stands in. A word that has nothing else —
    // mate, cortado — keeps it, and `selfGlossed` keeps the exercises that
    // translate it away from it instead (answers.ts).
    const itself = (text: string) => norm(text) === norm(f.form);
    const meaning =
      candidates.find((c) => !itself(c) && !shared(c)) ?? candidates.find((c) => !itself(c)) ?? candidates[0];
    return { ...f, meaning_en: meaning, meanings_en: meanings };
  });
}
