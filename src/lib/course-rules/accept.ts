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

import { CLITIC_LEMMAS, OPTIONAL_LEMMAS, SUBJECT_PRONOUNS, fold } from './rules';
import { type Token, split } from './tokenize';
import type { VocabForm } from './vocabulary';

/** Alternatives past this many are noise for the reviewer. */
const MAX_VARIANTS = 24;

/** English that says whether the person is a man or a woman. */
const GENDER_CUES = /\b(he|she|him|her|his|hers|himself|herself|man|woman|boy|girl|guy|lady|mr|mrs|ms)\b/i;

type T = Token<VocabForm>;

const isName = (t: T) => t.forms.length > 0 && t.forms.every((f) => f.pos === 'propn');
const personalVerb = (t: T) => t.forms.find((f) => f.pos === 'verb' && f.features?.person)?.features ?? null;
const isClitic = (t: T) => t.forms.some((f) => f.pos === 'pron' && (CLITIC_LEMMAS.has(f.lemma) || f.features?.clitic));
const subjectPronoun = (t: T) => t.forms.find((f) => f.pos === 'pron' && SUBJECT_PRONOUNS.has(f.lemma))?.lemma ?? null;
/** "un", "una": the indefinite article. */
const isIndefinite = (t: T) => t.forms.length > 0 && t.forms.every((f) => f.pos === 'det' && f.lemma === 'un');
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
  /** Opened a sentence in the original, capitalized for that alone. */
  opens?: boolean;
  /** The other gender of the word. */
  swap?: boolean;
}
interface Slot {
  original: Pick | null;
  choices: (Pick | null)[];
  swappable?: boolean;
}

/**
 * Verbs that say how the subject is, so an adjective after them is said of the
 * subject: "estoy cansada", "me puse nerviosa", "llegué re cansado". After any
 * other verb it is something else — "estudio inglés" is a language, not a
 * nationality to put in the feminine.
 */
const LINKING = new Set([
  'ser', 'estar', 'quedar', 'quedarse', 'sentir', 'sentirse', 'poner', 'ponerse', 'andar', 'parecer',
  'volver', 'llegar', 'seguir', 'vivir', 'terminar', 'salir', 'ir', 'venir',
]);

/**
 * Verbs whose third person, after an object pronoun, has the thing for its
 * subject: "me gusta", "me parece", "se le cayó". No "él" or "ella" goes in
 * front — "Ella se le cayó el mate" is not Spanish.
 */
const DATIVE_VERBS = new Set([
  'gustar', 'encantar', 'parecer', 'doler', 'importar', 'molestar', 'interesar', 'faltar', 'quedar', 'tocar',
  'preocupar', 'convenir', 'alcanzar', 'sobrar', 'costar', 'pasar', 'caer', 'olvidar', 'romper', 'perder', 'ir',
]);
const SENTENCE_END = /[.?!…]["»”)]*$/;
const DATIVE_CLITICS = new Set(['me', 'te', 'le', 'nos', 'les']);

/** Where there is no stored form for the other gender: cansado → cansada. */
function otherGender(word: string, gender: string) {
  const m = gender === 'm' ? word.match(/^(.*)o(s?)$/) : word.match(/^(.*)a(s?)$/);
  return m ? `${m[1]}${gender === 'm' ? 'a' : 'o'}${m[2]}` : null;
}

/**
 * @param tokens      from tokenize()
 * @param en          the English prompt
 * @param vocabulary  where a variant's swapped-in words come from
 * @returns           alternative Spanish sentences, `es` itself not included
 */
export function generateVariants(tokens: T[], en: string, vocabulary: { forms: VocabForm[] }): string[] {
  const optional = optionalTokens(tokens);
  // A name said to someone — at the start or after a comma, and closed by
  // punctuation ("Sofi, ¿…", "Mucho gusto, Lucía.") — says who the listener is;
  // "soy uruguayo, de Montevideo" names a place, and stays open.
  const named = tokens.some(
    (t, i) =>
      isName(t) &&
      (i === 0 || split(tokens[i - 1].surface).tail.includes(',')) &&
      (!!split(t.surface).tail || i === tokens.length - 1),
  );
  const words = englishWords(en);
  // Nothing in the English says whether "I", "you" or "we" is a man or a woman.
  const genderOpen = !GENDER_CUES.test(en) && !named;
  // An offer or an order the English makes with no "a": "Tea and cake?
  // Coffee and cake, thanks" is "¿Té y torta? Café y torta, gracias" as much as
  // "¿Un té y torta? Un café y torta". Only where the article opens the question
  // or its answer — elsewhere the bare noun is wrong ("Estoy sin un peso",
  // "Un saludo a tu vieja", "Es un caos").
  const bareNouns = !['a', 'an', 'one', 'some', 'another'].some((w) => words.includes(w));
  // "¿Un café o un té?": the second goes with the first.
  const offered = (i: number): boolean =>
    split(tokens[i].surface).lead.includes('¿') ||
    (i > 0 && /\?["»”)]*$/.test(split(tokens[i - 1].surface).tail)) ||
    (i > 2 && fold(tokens[i - 1].core) === 'o' && isIndefinite(tokens[i - 3]) && offered(i - 3));

  // Which pronoun a third-person verb stands for, when the English names one.
  const third = words.includes('she') === words.includes('he') ? null : words.includes('she') ? 'ella' : 'él';
  // "yo" only where the English has "I": "Sé sincera" is "Be honest" and
  // "Pedí unos días" "Ask for a few days", commands spelled like a first-person
  // verb. Nor "vos" before a command ("Frená" is not "Vos frená").
  const pronounFor = (f: { person?: number; mood?: string }) =>
    f.person === 1 ? (words.includes('i') ? 'yo' : null) : f.person === 2 ? (f.mood === 'imp' ? null : 'vos') : third;
  // One pronoun of a kind per sentence, and none where it is already said:
  // "Prometiste que ibas a cocinar vos" takes no second "vos".
  const said = new Set(tokens.map(subjectPronoun).filter(Boolean));
  const inserted = new Set<string>();

  /**
   * Whether the adjective at `i` is said of the speaker or the listener: right
   * after a linking verb (adverbs between are fine) whose person is first or
   * second — or, for a form that can be "I" or "he" (estaba, iría, era), when
   * the English has "I" and nothing in its clause is a third person.
   */
  const aboutSpeaker = (i: number, verbs = LINKING) => {
    // Back over adverbs, and over an adjective before this one: "estamos
    // cansados y apurados".
    const skippable = (t: T) =>
      t.forms.length > 0 &&
      (t.forms.every((x) => x.pos === 'adv') ||
        ['y', 'e', 'o', 'ni'].includes(fold(t.core)) ||
        t.forms.some((x) => (x.pos === 'adj' || x.pos === 'noun') && x.features?.gender));
    let b = i - 1;
    while (b >= 0 && skippable(tokens[b]) && !/[.?!;:]/.test(split(tokens[b].surface).tail)) b--;
    if (b < 0 || split(tokens[b].surface).tail) return false;
    const verb = tokens[b].forms.find((x) => x.pos === 'verb' && verbs.has(x.lemma));
    if (!verb) return false;
    if (verb.features?.person) return verb.features.person !== 3;
    if (!words.includes('i')) return false;
    const someone = (t: T) => t.forms.some((x) => x.pos === 'noun' || x.pos === 'propn') || !!subjectPronoun(t);
    let c = b;
    for (; c > 0 && !clauseStart(tokens, c); c--) if (someone(tokens[c - 1])) return false;
    // "un depto que sea luminoso": the "que" clause is about the depto.
    return !(c >= 2 && fold(tokens[c - 1].core) === 'que' && someone(tokens[c - 2]));
  };

  // Slots alternate: a place a pronoun could be put, then a token. Each is a
  // list of choices; null leaves it empty.
  const slots: Slot[] = [];
  tokens.forEach((t, i) => {
    const { lead, core, tail } = split(t.surface);
    const piece: Pick = { lead, word: core, tail, name: t.forms.length > 0 && t.forms.every((f) => f.pos === 'propn'), opens: i === 0 || SENTENCE_END.test(split(tokens[i - 1].surface).tail) || lead.includes('—') };

    // The subject pronoun a verb left out, where Spanish puts one: at the start
    // of its clause, ahead of any clitic — "Soy Sofi" → "Yo soy Sofi", and
    // "Yes, she's Uruguayan" → "Sí, ella es uruguaya".
    const insert: Slot = { original: null, choices: [null] };
    const v = skipClitics(tokens, i);
    const f = tokens[v] && personalVerb(tokens[v]);
    // Not before a word that can be something else too ("Como siempre": as always).
    const onlyVerb = !!tokens[v] && tokens[v].forms.every((x) => x.pos === 'verb');
    // The object pronouns before the verb, standing alone or inside a stored
    // chunk ("se le cayó", "me parece").
    const inner = tokens[v] ? fold(tokens[v].core).split(' ') : [];
    const clitics = [...tokens.slice(i, v).map((x) => fold(x.core)), ...inner.slice(0, -1).filter((w) => CLITIC_LEMMAS.has(w))];
    const thingIsSubject =
      (clitics.includes('se') && clitics.length > 1) ||
      (f?.person === 3 &&
        clitics.some((c) => DATIVE_CLITICS.has(c)) &&
        (inner.length > 1 || tokens[v].forms.some((x) => DATIVE_VERBS.has(x.lemma.replace(/se$/, '')))));
    // "¿Es uruguayo tu profesor?" already has its subject, after the verb.
    const namedAfter = () => {
      for (let k = v + 1; k < tokens.length && !clauseStart(tokens, k); k++)
        if (tokens[k].forms.some((x) => x.pos === 'noun') && tokens[k - 1].forms.some((x) => x.pos === 'det')) return true;
      return false;
    };
    const lemma =
      f && f.number === 'sg' && onlyVerb && !thingIsSubject && clauseStart(tokens, i) && !(f.person === 3 && namedAfter())
        ? pronounFor(f)
        : null;
    if (lemma && !said.has(lemma) && !inserted.has(lemma)) {
      const hasOne =
        (i > 0 && subjectPronoun(tokens[i - 1])) || (v + 1 < tokens.length && subjectPronoun(tokens[v + 1]));
      const form = vocabulary.forms.find((x) => x.pos === 'pron' && x.lemma === lemma);
      if (!hasOne && form) {
        insert.choices.push({ lead: '', word: form.form, tail: '', name: false, inserted: true });
        inserted.add(lemma);
      }
    }
    slots.push(insert);

    const token: Slot = { original: piece, choices: [piece] };
    if (optional.has(i)) token.choices.push(null);
    else if (bareNouns && isIndefinite(t) && offered(i) && tokens[i + 1]?.forms.some((x) => x.pos === 'noun')) token.choices.push(null);

    // The other gender, where nothing says which: an adjective said of the
    // speaker or listener ("soy chileno", "estás muy cansada", "Encantada."),
    // a noun or "el que" after "ser" ("soy médica", "soy el que paga"), and
    // "nosotras" for "we". One next to a noun agrees with the noun ("la
    // heladera rota"), and a quantifier with what it counts ("cuántos años").
    if (genderOpen) {
      const adj = t.forms.find((x) => x.pos === 'adj' && x.features?.gender);
      const noun = t.forms.find((x) => (x.pos === 'noun' || x.lemma === 'el que') && x.features?.gender);
      const we = t.forms.find((x) => x.pos === 'pron' && x.lemma === 'nosotros' && x.features?.gender);
      const standalone =
        i === 0 && !!tail && (words.includes('i') || words.includes('you') || words.includes('we'));
      const swap =
        adj && (aboutSpeaker(i) || standalone)
          ? adj
          : noun && t.forms.every((x) => x.pos !== 'verb') && aboutSpeaker(i, new Set(['ser']))
            ? noun
            : we && words.includes('we')
              ? we
              : null;
      if (swap) {
        const other =
          vocabulary.forms.find(
            (x) =>
              x.lemma_id === swap.lemma_id &&
              x.pos === swap.pos &&
              x.features?.gender &&
              x.features.gender !== swap.features.gender &&
              x.features.number === swap.features.number,
          )?.form ?? (swap.pos === 'adj' ? otherGender(fold(core), swap.features.gender!) : null);
        if (other && fold(other) !== fold(core)) {
          const word = core[0] === core[0].toLocaleUpperCase('es') ? upper(other) : other;
          token.choices.push({ ...piece, word, swap: true });
          token.swappable = true;
        }
      }
    }
    slots.push(token);
  });

  const seen = new Set([key(slots.map((s) => s.original).filter((p): p is Pick => !!p))]);
  const out: string[] = [];
  const walk = (k: number, picks: { original: Pick | null; choice: Pick | null; swappable?: boolean }[]) => {
    if (out.length >= MAX_VARIANTS) return;
    if (k === slots.length) {
      // Everyone the sentence leaves open is one person: all one gender or all
      // the other, never "estamos cansados y apuradas".
      const kept = picks.filter((p) => p.swappable && p.choice);
      const swapped = kept.filter((p) => p.choice!.swap).length;
      if (swapped && swapped < kept.length) return;
      const pieces = render(picks);
      const id = key(pieces);
      if (pieces.length && !seen.has(id)) {
        seen.add(id);
        out.push(text(pieces));
      }
      return;
    }
    for (const choice of slots[k].choices)
      walk(k + 1, [...picks, { original: slots[k].original, choice, swappable: slots[k].swappable }]);
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

/**
 * Words keep their case, except where a sentence starts — the first word, or
 * one after ". ? !" or a dash ("¿Enojado? No, …") — and for a word that opened
 * a sentence only by position, or was put in: "Sos" is "sos" in "¿Vos sos…?".
 */
const text = (pieces: Pick[]) =>
  pieces
    .map((p, i) => {
      const starts = i === 0 || SENTENCE_END.test(pieces[i - 1].tail) || p.lead.includes('—');
      const word = p.name ? p.word : starts ? upper(p.word) : p.inserted || p.opens ? lower(p.word) : p.word;
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
