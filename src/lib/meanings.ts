import { glossSenses, norm, senseKey, senseOf, splitSense } from './answers';
import type { Form, Sentence } from './types';

// ---------------------------------------------------------------------------
// What a word means, from where it is used.
//
// A gloss is a dictionary entry: "well, fine, good". No screen can print it
// whole — "Type it in Spanish: thanks, thank you" is a riddle — and no one
// sense of it is right everywhere: `bien hecho` is "well done", `estoy bien` is
// "I'm fine". So the meaning a screen shows is picked, not printed. Every
// sentence token carries what it means in that sentence (`course:gloss` aligns
// it with the English), and of a word's senses the one shown is the one its
// sentences use, ranked by how she has met them, in the sentence's own words
// ("are you" for `sos`). The dictionary gloss vets them: a rendering that is
// not one of its senses ("there" for the `che` of "Hi there", "you don't know"
// for the `sabés` of "No sabés") stays in its sentence (standsAlone).
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
 * The content-wide part of the tallies, per form, as the database sums it over
 * every published sentence (migration 20260929000001, form_gloss_tallies):
 * `[text, uses, carries, unit]`, in the order the sentences first give them.
 * With it the app need not hold every sentence to rank a word's meanings — only
 * the ones she has been shown, which is all `met` is counted from.
 */
export type GlossTallies = Record<string, [string, number, number, number][]>;

/**
 * A form's meanings across the sentences, most familiar to her first. Between
 * two she has met as often, `closeness` breaks the tie: "you're" before "are
 * you" for `sos`, because it reads as the dictionary does.
 */
export function meaningsFromSentences(
  sentences: Sentence[],
  closeness: (formId: string, meaning: string) => number = () => 0,
  /** Every sentence's share, summed ahead (GlossTallies). `sentences` then only
   *  add how often she has met each meaning, so they can be just the ones
   *  loaded — as long as every sentence she has been shown is among them. */
  base?: GlossTallies,
): Map<string, string[]> {
  const tallies = new Map<string, Map<string, Tally>>();
  if (base) {
    for (const [id, list] of Object.entries(base)) {
      const own = new Map<string, Tally>();
      for (const [text, uses, carries, unit] of list) own.set(senseKey(text), { text, met: 0, carries, uses, unit });
      tallies.set(id, own);
    }
  }
  // Tallies `base` doesn't have: a sentence published after it was summed.
  const fresh = new Set<Tally>();
  for (const s of sentences) {
    for (const t of s.tokens) {
      const text = t.gloss?.trim();
      if (!text) continue;
      for (const id of t.glue ? [...t.form_ids, t.glue] : t.form_ids) {
        const own = tallies.get(id) ?? new Map<string, Tally>();
        tallies.set(id, own);
        const key = senseKey(text);
        let tally = own.get(key);
        if (!tally) {
          tally = { text, met: 0, carries: 0, uses: 0, unit: Infinity };
          fresh.add(tally);
        }
        tally.met += s.shown?.shown_count ?? 0;
        // What `base` holds is already counted there.
        if (!base || fresh.has(tally)) {
          if (s.target_form_id === id) tally.carries++;
          tally.uses++;
          tally.unit = Math.min(tally.unit, s.unit_order ?? 0);
        }
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

/** Every word of a translation, contractions opened: "you're" → you, are. */
const allWords = (text: string) =>
  text
    .toLowerCase()
    .replace(/[‘’`´]/g, "'")
    .replace(/\bcan(?:'t|not)\b/g, 'can not')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/n't\b/g, ' not')
    .replace(/'m\b/g, ' am')
    .replace(/'re\b/g, ' are')
    .replace(/'s\b/g, ' is')
    .replace(/'ll\b/g, ' will')
    .replace(/'ve\b/g, ' have')
    .replace(/'d\b/g, ' would')
    .split(/[^a-z]+/)
    .filter(Boolean);

/** What a rendering says, however it is put: "we're", "we are" and "are we"
 *  are one thing, and so are "you know" and "do you know". */
const sayingKey = (text: string) =>
  allWords(text)
    .filter((w) => w !== 'do' && w !== 'does')
    .sort()
    .join(' ') || senseKey(text);

/** A translation's words that carry meaning — the filler dropped. */
const englishWords = (text: string) => allWords(text).filter((w) => !FILLER.has(w));

/** What a sentence may put around a word's meaning without changing it: who
 *  does it ("he came"), an article ("a bike"), a question's "do" ("do you
 *  work"). Not "did": "¿Sabés que…?" is "Did you know…?", and `sabés` is not
 *  past. */
const FREE = new Set(['i', 'you', 'he', 'she', 'it', 'we', 'they', 'the', 'a', 'an', 'some', 'do', 'does']);

/** A sense's words, one slot each; "he/she went" has a slot either word fills.
 *  Its notes are not part of it: "works (he/she works)" is "works". */
const slotsOf = (sense: string) =>
  sense
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+/)
    .flatMap((piece) => (piece.includes('/') ? [piece.split('/').map(allWords)] : allWords(piece).map((w) => [[w]])))
    .filter((slot) => slot.some((alt) => alt.length));

/**
 * Whether a sentence's rendering of a word can stand for the word on its own.
 * A translation renders a sentence, not each word: "Hola, che" is "Hi there",
 * "¡Sos vos!" is "It's you!", and "No sabés" is "You don't know" — where the
 * English "don't" has nowhere to go but onto `sabés`. Right for the sentence;
 * on a card, `sabés` would mean "you don't know".
 *
 * So a rendering leaves its sentence only when it is one of the dictionary
 * gloss's senses, whole, with nothing added but what a sentence adds without
 * changing the meaning (`FREE`): "you're" and "are you" for `sos` ("you
 * are"), "do you know" for `sabés` ("you know"), "he came" for `vino` ("came
 * (he/she came)"). A word more — "you don't know", "I have to", "seventh
 * birthday" — or a word less — "are" for `sos`, "park" for `estacionar` ("to
 * park") — and it stays where it belongs, in the popover of its own sentence.
 *
 * It used to be enough to share one word with the gloss, which is how "not"
 * got onto a hundred verbs. The cost of asking for the whole sense is that a
 * sentence can no longer teach a meaning the gloss never listed ("pretty bad"
 * for `mal`): a meaning worth a card is worth writing in the gloss.
 */
export const standsAlone = (meaning: string, gloss: string) => senseBehind(meaning, gloss) != null;

/** The sense of the gloss a rendering stands for (`standsAlone`), or null. */
export function senseBehind(meaning: string, gloss: string) {
  const words = allWords(meaning);
  const onlyFree = words.every((w) => FREE.has(w));
  const found = glossSenses(gloss).find((sense) => {
    const slots = slotsOf(sense);
    if (!slots.length) return false;
    // Which of the rendering's words the sense accounts for.
    const used = words.map(() => false);
    for (const slot of slots) {
      if (!slot.some((alt) => alt.length > 0 && take(words, used, alt))) return false;
    }
    const extra = words.filter((_, i) => !used[i]);
    if (!extra.length) return true;
    if (!extra.every((w) => FREE.has(w))) return false;
    // Nothing but small words has nothing to hang another on: "I do" is not
    // `yo`, "do you" is not `vos`.
    if (onlyFree) return false;
    // And one left hanging at the end is a sentence cut short: "we had a"
    // (great time), "what a" (day), "neither do" (I).
    return used[words.length - 1] || !DANGLING.has(words[words.length - 1]);
  });
  return found ?? null;
}

/** How a question opens in English. */
const ASKS = new Set(['do', 'does', 'did', 'am', 'is', 'are', 'was', 'were', 'can', 'could', 'will', 'would', 'have', 'has', 'had', 'should']);

/** Small words that need something after them. */
const DANGLING = new Set(['the', 'a', 'an', 'some', 'do', 'does']);

/** Marks `alt`'s words as used in `words`, each once, the last one free first;
 *  false (and nothing marked) if one is missing. */
function take(words: string[], used: boolean[], alt: string[]) {
  const mine: number[] = [];
  for (const w of alt) {
    let at = words.length - 1;
    while (at >= 0 && (words[at] !== w || used[at] || mine.includes(at))) at--;
    if (at < 0) return false;
    mine.push(at);
  }
  for (const i of mine) used[i] = true;
  return true;
}

/** 2 when a meaning is one of the gloss's senses, in the same words in the same
 *  order ("you're" is "you are"); 1 when it can stand for the word some other
 *  way ("are you"); 0 otherwise. */
export function closeness(meaning: string, gloss: string) {
  const words = englishWords(meaning).join(' ');
  if (glossSenses(gloss).some((s) => englishWords(s).join(' ') === words)) return 2;
  return standsAlone(meaning, gloss) ? 1 : 0;
}

/**
 * Whether an English rendering is just the word again. "the mate", "some
 * mate" and "mate's" are still `mate` — a sentence's article or possessive
 * doesn't make a translation of it, and letting one through puts "the mate"
 * on the card that teaches the word (the drink, read as "the friend").
 */
const isItself = (text: string, form: string) => {
  const bare = (s: string) => norm(s.replace(/^\s*(the|a|an|some)\s+/i, '').replace(/['’]s\s*$/i, ''));
  const word = norm(form);
  const it = bare(text);
  return it === word || it + 's' === word || it === word + 's';
};

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
  const itself = (text: string) => isItself(text, form.form);
  const dictionary = glossSenses(form.gloss_en).filter((t) => !itself(t));
  const here = inContext?.trim() && !itself(inContext) ? inContext.trim() : null;
  if (!here) return dictionary.map((text) => ({ text }));
  const rest = dictionary.filter((t) => senseKey(t) !== senseKey(here));
  // A rendering that is one of the senses word for word is the word's meaning,
  // whatever `standsAlone` makes of it.
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
export function withMeanings(forms: Form[], sentences: Sentence[], reached = 0, base?: GlossTallies): Form[] {
  const glossById = new Map(forms.map((f) => [f.id, f.gloss_en]));
  const fromSentences = meaningsFromSentences(sentences, (id, m) => closeness(m, glossById.get(id) ?? ''), base);
  const meaningsOf = (f: Form) => (fromSentences.get(f.id) ?? []).filter((m) => standsAlone(m, f.gloss_en));

  // Who answers to each piece of English — however a sentence happened to
  // put it (`sayingKey`). `somos` and `estamos` are both "we are"; that one
  // sentence wrote "are we" for `estamos` does not make it the only word for
  // that, and a card saying so would teach a difference that isn't there.
  const owners = new Map<string, Form[]>();
  for (const f of forms) {
    if (f.is_glue) continue;
    const keys = new Set([...glossSenses(f.gloss_en), ...meaningsOf(f)].map(sayingKey));
    for (const key of keys) owners.set(key, [...(owners.get(key) ?? []), f]);
  }

  // And to each piece with its brackets off: `ustedes` ("you (plural)") and
  // `vos` ("you") both read "you" on a tile.
  const bareOwners = new Map<string, Form[]>();
  for (const f of forms) {
    // A bound form ("levanto", only ever met inside "me levanto") is never
    // asked for on its own, so it is nobody's look-alike.
    if (f.is_glue || f.bound) continue;
    const keys = new Set([...glossSenses(f.gloss_en), ...meaningsOf(f)].map((m) => senseKey(splitSense(m).main)));
    for (const key of keys) bareOwners.set(key, [...(bareOwners.get(key) ?? []), f]);
  }

  return forms.map((f) => {
    const meanings = meaningsOf(f);
    const dictionary = glossSenses(f.gloss_en);
    // A sentence's article is the sentence's, not the word's: "Y pan, por
    // favor" is "And some bread, please", but `pan` on its own is "bread". A
    // rendering that is a dictionary sense behind an article shows as that
    // sense; `meanings_en` keeps it as written, so it is still a right answer.
    //
    // Nor is a question's word order: most of what a learner reads `vendés` in
    // is a question ("¿Vendés…?" — "Do you sell…?"), but the word is "you
    // sell", and a card that says "do you sell" teaches the word as a question.
    // So a rendering that asks shows as the sense it stands for.
    const plain = (text: string) => {
      const bare = senseKey(text.replace(/^\s*(the|a|an|some)\s+/i, ''));
      const sense = dictionary.find((d) => senseKey(d) === bare);
      if (sense) return sense;
      const [first] = allWords(text);
      const asked = ASKS.has(first) ? senseBehind(text, f.gloss_en) : null;
      return asked && allWords(asked)[0] !== first ? asked : text;
    };
    const candidates = [...new Set([...meanings.map(plain), ...dictionary])];
    if (!candidates.length) return f;
    const limit = Math.max(reached, f.unit_order);
    const rival = (o: Form) =>
      o.id !== f.id &&
      o.unit_order <= limit &&
      // The other gender of the same word is the same answer, not a rival.
      !(o.lemma_id === f.lemma_id && o.pos === f.pos && o.gloss_en === f.gloss_en);
    const shared = (text: string) => (owners.get(sayingKey(text)) ?? []).some(rival);
    // The word is not its own meaning. A sentence that renders `medialuna` as
    // "medialuna" would make every prompt print its own answer, so the
    // dictionary gloss ("croissant") stands in. A word that has nothing else —
    // mate, cortado — keeps it, and `selfGlossed` keeps the exercises that
    // translate it away from it instead (answers.ts).
    const itself = (text: string) => isItself(text, f.form);
    const meaning =
      candidates.find((c) => !itself(c) && !shared(c)) ??
      candidates.find((c) => !itself(c)) ??
      glossSenses(f.gloss_en)[0] ??
      candidates[0];
    // What a screen prints of it: the brackets off, and what they said only
    // if a word she could know by now reads the same without them.
    const { main, hint } = senseOf(f, meaning);
    const clashes = hint != null && (bareOwners.get(senseKey(main)) ?? []).some(rival);
    return {
      ...f,
      meaning_en: meaning,
      meanings_en: meanings,
      meaning_shown_en: main,
      meaning_hint_en: clashes ? hint : null,
    };
  });
}
