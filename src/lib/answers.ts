import { clauseOfSurface, clausesOf } from './course-rules/shape';
import type { Form, Sentence, SentenceToken } from './types';

// ---------------------------------------------------------------------------
// What counts as a right answer, and what may be offered as a wrong one.
//
// Two rules hold across every exercise:
//   1. Anything a native speaker would accept as an answer to the prompt is
//      accepted — the sentence's other Spanish (`es_alt`), the other gender of
//      a word whose English is the same.
//   2. Nothing that would be a right answer is ever offered as a wrong one — no
//      option, tile or pairing that shares a meaning with the answer.
// And one about forgiveness: a typo is forgiven only where a typo is possible
// (typing) and only when it doesn't turn one real word into another.
//
// Pure — no data access — so it can be tested on its own
// (scripts/course/test/answers.test.mjs).
// ---------------------------------------------------------------------------

export function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Stands in for ñ while accents are folded, so it survives as its own letter. */
const ENYE = '\u0001';

/**
 * Case-, accent- and punctuation-insensitive key for comparing words. ñ is a
 * letter of its own, not an n with an accent: "año" and "ano" are different
 * words, and folding them together once accepted one for the other.
 */
export const norm = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/ñ/g, ENYE)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(new RegExp(ENYE, 'g'), 'ñ')
    .replace(/[^\p{L}\p{N}]/gu, '');

/** Like `norm`, but accents count: "tenes" ≠ "tenés". */
export const normStrict = (s: string) =>
  s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');

/** Like `norm`, with ñ folded to n as well — only to recognise a missing tilde. */
const normNoEnye = (s: string) => norm(s).replace(/ñ/g, 'n');

/** A form whose text has a space is a phrase. */
export const isPhrase = (text: string) => text.trim().includes(' ');

export const wordsOf = (text: string) => text.trim().split(/\s+/).filter(Boolean);

/** The words of an answer as they are compared: "¿Sos Juan?" → ["sos", "juan"]. */
export const answerWords = (text: string) => wordsOf(text).map(norm).filter(Boolean);

const sameWords = (a: string[], b: string[]) => a.length === b.length && a.every((w, i) => w === b[i]);

// ---------------------------------------------------------------------------
// Sentence tokens
// ---------------------------------------------------------------------------

const LEAD = /^[¿¡"“«(]+/u;
const TAIL = /[.,!?;:…"”»)]+$/u;

/** Punctuation before a token's word — Spanish opens questions: "¿". */
export const tokenHead = (t: SentenceToken) => t.surface.match(LEAD)?.[0] ?? '';

/** Punctuation after a token's word, to keep next to a blank: "?". */
export const tokenTail = (t: SentenceToken) => t.surface.match(TAIL)?.[0] ?? '';

/** A token's word without its punctuation: "¿Tenés" → "Tenés". */
export const tokenWord = (t: SentenceToken) =>
  t.surface.slice(tokenHead(t).length, t.surface.length - tokenTail(t).length);

/** Punctuation that ends a sentence, so the next word starts one. */
const ENDS_SENTENCE = /[.!?…]["”»)]*$/u;

/** Whether the token at `index` opens a sentence: the first one, or any after
 *  a full stop — "Che, ¿cómo te llamás? Yo soy Sofi." opens two. */
export const startsSentence = (tokens: SentenceToken[], index: number) =>
  index === 0 || ENDS_SENTENCE.test(tokens[index - 1]?.surface ?? '');

/**
 * A word as it should appear out of its sentence. A word that opens a sentence
 * is capitalised in place, and a capital on one option or tile — when every
 * other one is lowercase — gives the answer away. Names keep their capital:
 * they're capitalised everywhere.
 */
export const outOfSentence = (tokens: SentenceToken[], index: number) => {
  const t = tokens[index];
  const word = tokenWord(t);
  const isName = t.form_ids.length === 0 && !t.glue;
  return startsSentence(tokens, index) && !isName ? word.charAt(0).toLocaleLowerCase('es') + word.slice(1) : word;
};

/** Where a form sits in the sentence; -1 if it is not there. */
export const tokenIndexOf = (s: Sentence, formId: string) => s.tokens.findIndex((t) => t.form_ids.includes(formId));

// ---------------------------------------------------------------------------
// Meaning
// ---------------------------------------------------------------------------

type Glossed = Pick<Form, 'id' | 'form' | 'gloss_en'> & Partial<Pick<Form, 'meaning_en' | 'meanings_en'>>;

/** How two meanings are compared: "Well done" and "well done" are one meaning. */
export const senseKey = (s: string) => s.trim().toLowerCase();

/** A gloss's senses as written: "OK, sure, go ahead" → ["OK", "sure", "go ahead"]. */
export const glossSenses = (gloss: string) =>
  gloss
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

/** A gloss's senses as compared: "well, fine, good" → ["well", "fine", "good"].
 *  Split the same way as the outline validator's overlap warning (outline.mjs). */
export const senses = (gloss: string) => glossSenses(gloss).map(senseKey);

/**
 * The one meaning a screen shows for a form. A gloss lists every sense the word
 * has; a prompt that prints them all ("thanks, thank you") reads as a riddle, and
 * one that prints the wrong one ("fine done") teaches the wrong thing. So the
 * meaning comes from where she has met the word (meanings.ts), and only a word
 * no sentence has glossed yet falls back to its gloss's first sense.
 */
export const meaningOf = (f: Glossed) => f.meaning_en ?? glossSenses(f.gloss_en)[0] ?? f.gloss_en;

/** Every English a form answers to: its gloss's senses and its sentences'. */
export const sensesOf = (f: Glossed) => [
  ...new Set([
    ...senses(f.gloss_en),
    ...(f.meanings_en ?? []).map(senseKey),
    ...(f.meaning_en ? [senseKey(f.meaning_en)] : []),
  ]),
];

/** What a form shows on the side of an option or tile: its Spanish, or its meaning. */
export const labelOf = (f: Glossed, field: 'gloss_en' | 'form') => (field === 'form' ? f.form : meaningOf(f));

/**
 * A word whose English is the word itself — mate, cortado, empanada. No
 * exercise that goes between the two sides can test one: the prompt prints the
 * answer, whichever way round it runs. They are drilled by sound and inside
 * their sentences instead (session.ts, exercisesFor).
 */
export const selfGlossed = (f: Glossed) => norm(meaningOf(f)) === norm(f.form);

/** Whether two different forms could both answer the same English: they share
 *  a sense ("bien" and "bueno" are both "well"), or are spelt the same. */
export const sharesMeaning = (a: Glossed, b: Glossed) => {
  if (a.id === b.id) return false;
  if (norm(a.form) === norm(b.form)) return true;
  const theirs = sensesOf(b);
  return sensesOf(a).some((s) => theirs.includes(s));
};

/** Forms that answer a form's English as well as it does: itself, and any form
 *  of the same lemma glossed identically ("argentina" for "Argentinian"). */
export const sameAnswer = (form: Form, allForms: Form[]) => [
  form,
  ...allForms.filter(
    (f) => f.id !== form.id && f.lemma_id === form.lemma_id && f.pos === form.pos && f.gloss_en === form.gloss_en,
  ),
];

// ---------------------------------------------------------------------------
// Checking answers
// ---------------------------------------------------------------------------

/**
 * The sentence narrowed to one of its clauses — its tokens, its Spanish and the
 * accepted answers that survive the cut — so everything that lays out, marks and
 * blames a sentence build can work on a clause without knowing it is one.
 *
 * An `es_alt` only contributes if it breaks into the same number of clauses; one
 * that doesn't is an alternative to a differently shaped sentence, and its
 * pieces don't line up with these.
 */
export function clauseOf(sentence: Sentence, clause: number): Sentence {
  const of = clauseOfSurface(sentence.tokens.map((t) => t.surface));
  const tokens = sentence.tokens.filter((_, i) => of[i] === clause);
  const parts = clausesOf(sentence.es);
  const es_alt = sentence.es_alt.flatMap((alt) => {
    const altParts = clausesOf(alt);
    return altParts.length === parts.length && altParts[clause] ? [altParts[clause]] : [];
  });
  const ids = new Set(tokens.flatMap((t) => t.form_ids));
  return {
    ...sentence,
    es: parts[clause] ?? tokens.map((t) => t.surface).join(' '),
    es_alt,
    tokens,
    form_ids: sentence.form_ids.filter((id) => ids.has(id)),
  };
}

/** Every Spanish answer a sentence accepts, as words. Transcribing audio
 *  accepts only what was said. */
export const acceptedAnswers = (
  s: Sentence,
  { byEar = false, side = 'es' }: { byEar?: boolean; side?: 'es' | 'en' } = {},
) => (side === 'en' ? [s.en, ...s.en_alt] : byEar ? [s.es] : [s.es, ...s.es_alt]).map(answerWords);

/** A sentence rebuilt from tiles. Tiles are whole words, so there is no typo
 *  to forgive: the words match an accepted answer or they don't. */
export function sentenceAnswerMatches(
  placed: string[],
  sentence: Sentence,
  opts: { byEar?: boolean; side?: 'es' | 'en' } = {},
) {
  const got = placed.flatMap(answerWords);
  return acceptedAnswers(sentence, opts).some((answer) => sameWords(got, answer));
}

/** Whether a rebuilt answer is the written sentence itself, rather than one of
 *  its alternatives — when it isn't, the feedback shows the written one too. */
export const isCanonical = (placed: string[], sentence: Sentence, side: 'es' | 'en' = 'es') =>
  sameWords(placed.flatMap(answerWords), answerWords(side === 'en' ? sentence.en : sentence.es));

/** A word or phrase rebuilt from tiles — letters or words, exactly. */
export function builtAnswerMatches(built: string, target: string, alternatives: string[] = []) {
  const got = answerWords(built).join(' ');
  return [target, ...alternatives].some((t) => answerWords(t).join(' ') === got);
}

/** One edit (insert, delete, substitute) apart. */
function oneEdit(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return false;
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

/** Below this many letters one edit is another word, not a typo: soy/sos, es/él. */
const TYPO_MIN_LENGTH = 5;

/** What a typed answer earned: right or wrong, and whether it was right with a
 *  slip worth pointing out. `expected` is the accepted spelling it matched — or,
 *  for a synonym, the word the exercise was drilling. */
export type Note = 'accent' | 'typo' | 'enye' | 'synonym';
export interface Graded {
  correct: boolean;
  note?: Note;
  expected: string;
}

/**
 * A typed word. Case and punctuation don't count. What she is taught to spell
 * does, gently:
 *   - a missing or wrong accent is accepted, with a note ("tenés");
 *   - a missing ñ is accepted with a note in a word long enough to be a slip,
 *     and wrong in a short one, where it is another word (año / ano);
 *   - one other typo is forgiven in a word of five letters or more.
 * Never when what she typed is itself a word of the course — that is a wrong
 * word, not a slip.
 *
 * And more than the word as written is right:
 *   - the words Spanish may put with it (`companions`): "yo soy" for "I am",
 *     "una medialuna" for "croissant";
 *   - the answers stored for the meaning the prompt showed (`accepts`, from
 *     `course:answers`): "buenas" for "hi";
 *   - another word that means what the prompt showed: asked for "well",
 *     `bueno` answers it as truly as `bien` does. It is accepted, with a note
 *     naming the word being drilled.
 */
/**
 * A word typed into a sentence's blank. Accents, ñ and one typo are forgiven
 * the way they are anywhere else, and nothing else is: not the companions a
 * bare prompt allows ("yo soy" cannot fill a gap the sentence already wrote
 * "yo" before), and not the synonyms and other genders a meaning prompt
 * accepts. The four-choice and tile versions of this screen already refuse
 * both (`gapOptions` drops anything that shares the answer's meaning or would
 * make the sentence read as written); typing it should not be the one way in.
 */
export function gradeGap(input: string, form: Form, allForms: Form[]): Graded {
  return gradeWord(input, form, allForms, meaningOf(form), { only: true });
}

export function gradeTyped(input: string, form: Form, allForms: Form[], meaning = meaningOf(form)): Graded {
  const direct = gradeWord(input, form, allForms, meaning);
  if (direct.correct) return direct;
  const words = input.trim().split(/\s+/);
  for (const lead of companions(form, meaning)) {
    if (words.length <= lead.length || !lead.every((w, i) => norm(words[i]) === norm(w))) continue;
    const rest = gradeWord(words.slice(lead.length).join(' '), form, allForms, meaning);
    if (rest.correct) return rest;
  }
  return direct;
}

/** Subject pronouns by person and number, voseo — there is no `tú` to accept. */
const PRONOUNS: Record<string, string[]> = {
  '1sg': ['yo'],
  '2sg': ['vos'],
  '3sg': ['él', 'ella', 'usted'],
  '1pl': ['nosotros', 'nosotras'],
  '3pl': ['ellos', 'ellas', 'ustedes'],
};

/** The clitic a pronominal verb takes: "(yo) me llamo", "(vos) te sentás". */
const CLITICS: Record<string, string> = { '1sg': 'me', '2sg': 'te', '3sg': 'se', '1pl': 'nos', '3pl': 'se' };

const ARTICLES: Record<string, string[]> = {
  'm.sg': ['el', 'un'],
  'f.sg': ['la', 'una'],
  'm.pl': ['los', 'unos'],
  'f.pl': ['las', 'unas'],
};

/**
 * Word sequences Spanish may put before a form typed on its own, and still be
 * the same answer. English can't ask for a word without them — "I am" has its
 * pronoun, "croissant" wants an article in a sentence — so a learner who types
 * them has answered right.
 *   - A conjugated verb takes its subject pronoun, and a pronominal verb its
 *     clitic: "yo soy", "me llamo", "yo me llamo". Which third person the
 *     pronoun is follows the English: "he/she is" takes él or ella, not
 *     usted; "you (pl.) are" takes ustedes. Not an imperative: nobody says
 *     "vos sentate".
 *   - A noun takes the article that agrees with it: "la medialuna", "un café"
 *     once `café` has a gender. Not a feminine noun that starts with a or ha,
 *     which may take `el` (el agua) — its stored answers cover it.
 */
export function companions(form: Pick<Form, 'form' | 'pos' | 'lemma' | 'features'>, meaning: string): string[][] {
  const f = form.features ?? {};
  if (form.pos === 'verb' && f.person && f.number && f.mood !== 'imp' && !f.verb_form) {
    const key = `${f.person}${f.number}`;
    const english = senseKey(meaning).split(/[^a-z]+/);
    const says = (w: string) => english.includes(w);
    const pronouns = (PRONOUNS[key] ?? []).filter((p) => {
      if (f.person !== 3) return true;
      const you = says('you');
      if (p === 'usted' || p === 'ustedes') return you;
      if (p === 'él') return says('he') || (!says('she') && !you);
      if (p === 'ella') return says('she') || (!says('he') && !you);
      return says('they') || !you; // ellos, ellas
    });
    const clitic = form.lemma.endsWith('se') ? CLITICS[key] : undefined;
    return [
      ...pronouns.map((p) => [p]),
      ...(clitic ? [[clitic], ...pronouns.map((p) => [p, clitic])] : []),
    ];
  }
  if (form.pos === 'noun' && f.gender && f.number) {
    if (f.gender === 'f' && /^h?a/.test(norm(form.form))) return [];
    return (ARTICLES[`${f.gender}.${f.number}`] ?? []).map((a) => [a]);
  }
  return [];
}

/**
 * `gradeTyped` for the word alone, without the words that may come with it.
 *
 * `only` narrows it to this one spelling of this one word. A prompt asking for
 * a meaning has several right answers — another word of the same sense, the
 * other gender, an answer stored for that sense — but a blank in a sentence
 * has one: the word that makes the sentence say what it says. "Bien, chau." is
 * not "Bueno, chau.", and a feminine adjective in a masculine slot is the
 * mistake the screen exists to catch.
 */
function gradeWord(
  input: string,
  form: Form,
  allForms: Form[],
  meaning: string,
  { only = false }: { only?: boolean } = {},
): Graded {
  const answers = only ? [form] : sameAnswer(form, allForms);
  const asked = senseKey(meaning);
  const stored = only ? [] : (form.accepts ?? []).filter((a) => senseKey(a.meaning) === asked).map((a) => a.answer);
  const own = answers.flatMap((f) => [f.form, ...(f.alt ?? [])]);
  const accepted = [...own, ...stored];
  const fallback = { correct: false, expected: form.form } as const;
  if (!norm(input)) return fallback;

  // A stored answer is another way to say it, not the word being drilled: it is
  // right, and the note names the word ("de Buenos Aires" — this one was porteña).
  const otherWay = stored.find((a) => norm(a) === norm(input) && !own.some((o) => norm(o) === norm(input)));

  if (otherWay) return { correct: true, note: 'synonym', expected: form.form };

  const exact = accepted.find((a) => normStrict(a) === normStrict(input));
  if (exact) return { correct: true, expected: exact };

  const accent = accepted.find((a) => norm(a) === norm(input));
  if (accent) return { correct: true, note: 'accent', expected: accent };

  const synonym = only
    ? undefined
    : allForms.find(
        (f) =>
          !answers.some((a) => a.id === f.id) &&
          [f.form, ...(f.alt ?? [])].some((a) => norm(a) === norm(input)) &&
          sensesOf(f).includes(asked),
      );
  if (synonym) return { correct: true, note: 'synonym', expected: form.form };

  const isCourseWord = allForms.some((f) => norm(f.form) === norm(input));

  const enye = accepted.find((a) => norm(a).includes('ñ') && normNoEnye(a) === normNoEnye(input));
  if (enye) {
    if (isCourseWord || norm(enye).length < TYPO_MIN_LENGTH) return { correct: false, expected: enye };
    return { correct: true, note: 'enye', expected: enye };
  }

  if (isCourseWord) return fallback;
  const typo = accepted.find((a) => norm(a).length >= TYPO_MIN_LENGTH && oneEdit(norm(input), norm(a)));
  return typo ? { correct: true, note: 'typo', expected: typo } : fallback;
}

/** Whether a typed word is accepted at all — `gradeTyped` without the notes. */
export function typedAnswerMatches(input: string, form: Form, allForms: Form[], meaning?: string) {
  return gradeTyped(input, form, allForms, meaning).correct;
}

/**
 * Which forms a wrong build actually missed. Her words are matched against the
 * accepted answer closest to what she built, as a subsequence, so a skipped
 * word or a stray decoy only blames the word it displaced — not everything
 * after it, and not a pronoun she was allowed to leave out. Glue words and
 * names have no form to blame; if nothing else was wrong, the target takes it.
 */
export function missedForms(
  sentence: Sentence,
  placed: string[],
  allForms: Form[],
  { side = 'es', drilled }: { side?: 'es' | 'en'; drilled?: string } = {},
): string[] {
  // English tiles carry no form to blame, so the blame goes where the screen
  // was aimed: the word this round is drilling, which is not always the word
  // the sentence was written for (buildSession re-aims a sentence at a word
  // that is actually due). Blaming the authored target instead would pass the
  // word she just missed and lapse one she never saw.
  if (side === 'en') return [drilled ?? sentence.target_form_id];
  const blame = new Map<string, string[]>();
  for (const t of sentence.tokens) {
    for (const w of answerWords(tokenWord(t))) if (!blame.has(w)) blame.set(w, t.form_ids);
  }
  for (const f of allForms) {
    const k = norm(f.form);
    if (!isPhrase(f.form) && !blame.has(k)) blame.set(k, [f.id]);
  }

  const got = placed.flatMap(answerWords);
  let best: string[] | null = null;
  for (const answer of acceptedAnswers(sentence)) {
    const missing: string[] = [];
    let j = 0;
    for (const w of answer) {
      const at = got.indexOf(w, j);
      if (at >= 0) j = at + 1;
      else missing.push(w);
    }
    if (!best || missing.length < best.length) best = missing;
  }

  const wrong = new Set((best ?? []).flatMap((w) => blame.get(w) ?? []));
  if (wrong.size === 0) wrong.add(sentence.target_form_id);
  return [...wrong];
}

// ---------------------------------------------------------------------------
// Wrong answers to offer
// ---------------------------------------------------------------------------

export type Option = { id: string; label: string };

/** Options shown for a phrase — three reads better than four at that length. */
export const SENTENCE_CHOICES = 3;
/** Forms in a matching block, and options for a single word. */
export const MATCH_SIZE = 4;

/** Content forms of a sentence that the lexicon at hand knows. */
const formsIn = (s: Sentence, formById: Map<string, Form>) =>
  s.form_ids.map((id) => formById.get(id)).filter((f): f is Form => !!f);

/**
 * Whether two sentences say the same thing in other words: the same number of
 * words, each matched by one that is the same or shares its meaning — "Dale,
 * chau." and "Bueno, chau." are both "OK, bye."
 */
function sameGist(a: Sentence, b: Sentence, formById: Map<string, Form>) {
  const A = formsIn(a, formById);
  const B = formsIn(b, formById);
  if (A.length === 0 || A.length !== B.length) return false;
  const covered = (X: Form[], Y: Form[]) => X.every((x) => Y.some((y) => x.id === y.id || sharesMeaning(x, y)));
  return covered(A, B) && covered(B, A);
}

/** Meanings to choose between: this sentence's, and two other sentences' that
 *  don't also say it. */
export function meaningOptions(sentence: Sentence, all: Sentence[], allForms: Form[]): Option[] {
  const formById = new Map(allForms.map((f) => [f.id, f]));
  const ownMeanings = new Set([sentence.en, ...sentence.en_alt].map((e) => answerWords(e).join(' ')));
  const others = shuffle(
    all.filter(
      (s) =>
        s.id !== sentence.id &&
        ![s.en, ...s.en_alt].some((e) => ownMeanings.has(answerWords(e).join(' '))) &&
        !sameGist(sentence, s, formById),
    ),
  );
  const distinct = new Map<string, Sentence>();
  for (const s of others) {
    const k = answerWords(s.en).join(' ');
    if (!distinct.has(k)) distinct.set(k, s);
    if (distinct.size === 2) break;
  }
  return shuffle([sentence, ...distinct.values()]).map((s) => ({ id: s.id, label: s.en }));
}

/**
 * Words to fill the gap with: the right one, as it appears in the sentence, and
 * three forms she knows that are the same shape (a phrase against phrases, a
 * word against words), aren't a synonym of the answer, and don't make the
 * sentence another accepted answer. `target` is the form the gap tests — a due
 * word in the sentence, not necessarily the one it was written for.
 */
export function gapOptions(sentence: Sentence, target: Form, allForms: Form[], count = 4): Option[] {
  const index = tokenIndexOf(sentence, target.id);
  const answer = index >= 0 ? outOfSentence(sentence.tokens, index) : target.form;
  const size = wordsOf(answer).length;
  const accepted = acceptedAnswers(sentence);

  const fitsTooWell = (f: Form) => {
    if (index < 0) return false;
    const filled = sentence.tokens.flatMap((t, i) => answerWords(i === index ? f.form : tokenWord(t)));
    return accepted.some((a) => sameWords(filled, a));
  };
  const usable = allForms.filter(
    (f) =>
      f.id !== target.id &&
      !f.is_glue &&
      f.pos !== 'propn' &&
      norm(f.form) !== norm(answer) &&
      !sharesMeaning(f, target) &&
      !fitsTooWell(f),
  );
  // A decoy of the same part of speech is a real question; "casa" in a verb's
  // gap is a giveaway. So is the only two-word option in a phrase's gap.
  const rank = (f: Form) => Number(wordsOf(f.form).length === size) * 2 + Number(f.pos === target.pos);
  const decoys = shuffle(usable).sort((a, b) => rank(b) - rank(a));
  const sameShape = decoys.filter((f) => wordsOf(f.form).length === size);
  // Same shape first — a two-word option among one-word ones is the answer in
  // plain sight — but a bank asked for eight and given five is barely a bank,
  // so other shapes top it up rather than being refused outright.
  const pool =
    sameShape.length >= count - 1 ? sameShape : [...sameShape, ...decoys.filter((f) => !sameShape.includes(f))];

  const seen = new Set<string>();
  const picked: Form[] = [];
  for (const f of pool) {
    if (seen.has(norm(f.form))) continue;
    seen.add(norm(f.form));
    picked.push(f);
    if (picked.length === count - 1) break;
  }
  return shuffle([{ id: target.id, label: answer }, ...picked.map((f) => ({ id: f.id, label: f.form }))]);
}

/** How many spare tiles a bank carries beyond the answer. */
const DECOYS = 4;

/** Punctuation a tile never carries: the Spanish side gets clean surfaces from
 *  its tokens, and the English has to be cleaned the same way or its commas
 *  would spell out the word order. */
const TILE_PUNCT = /[.,!?¿¡;:()"“”«»]/gu;

/**
 * The English of a sentence, as tiles. Punctuation comes off, and a word that
 * opens a sentence loses its capital for the same reason it does in Spanish
 * (`outOfSentence`): one capital in a row of lowercase tiles is the answer.
 * English "I" keeps its own, and so does a name — which the sentence already
 * marks, as a token carrying no form and no glue.
 */
function englishTiles(sentence: Sentence): string[] {
  const names = new Set(
    sentence.tokens.filter((t) => t.form_ids.length === 0 && !t.glue).flatMap((t) => wordsOf(tokenWord(t))),
  );
  const raw = wordsOf(sentence.en);
  return raw.flatMap((w, i) => {
    const words = wordsOf(w.replace(TILE_PUNCT, ' '));
    const opens = i === 0 || ENDS_SENTENCE.test(raw[i - 1]);
    const [first, ...rest] = words;
    if (!first || !opens || /^I($|['’])/.test(first) || names.has(first)) return words;
    return [first.charAt(0).toLocaleLowerCase('en') + first.slice(1), ...rest];
  });
}

/**
 * Word tiles for rebuilding the sentence — a set phrase broken into its words,
 * so "¿Qué onda?" is two tiles, not one — with a few of her other words mixed
 * in. A spare tile never shares a meaning with a word of the sentence: "bueno"
 * next to "Dale, chau." would be a second right answer.
 */
export function sentenceTiles(sentence: Sentence, allForms: Form[], side: 'es' | 'en' = 'es') {
  // The English side has no tokens to break up and no forms of its own: its
  // tiles are its words, and its spares are other words of English the course
  // has glossed, which is the only pool there is.
  const answer = side === 'en' ? englishTiles(sentence) : sentence.tokens.flatMap((_, i) => wordsOf(outOfSentence(sentence.tokens, i)));
  const taken = new Set(answer.map(norm));
  const own = formsIn(sentence, new Map(allForms.map((f) => [f.id, f])));
  const spare = new Map<string, string>();
  for (const f of shuffle(allForms)) {
    if (f.pos === 'propn' || isPhrase(f.form) || own.some((o) => sharesMeaning(o, f))) continue;
    if (side === 'en') {
      for (const w of wordsOf(meaningOf(f).replace(TILE_PUNCT, ' '))) {
        const key = norm(w);
        if (key && !taken.has(key) && !spare.has(key)) spare.set(key, w.toLocaleLowerCase('en'));
      }
      continue;
    }
    const key = norm(f.form);
    if (key && !taken.has(key) && !spare.has(key)) spare.set(key, f.form);
  }
  const decoys = [...spare.values()].slice(0, Math.min(DECOYS, Math.max(2, Math.ceil(answer.length / 2))));
  return { answer, tiles: shuffle([...answer, ...decoys]) };
}

// Distractors for multiple choice, drawn from forms of the same kind: a phrase
// competes against other phrases, a word against other words — and a word
// against words of its own part of speech where there are enough. Mixing kinds
// would let her answer on shape alone. No option shares a meaning with the
// answer or with another option: two options that both mean "well" are two
// right answers, or a coin toss.
export function pickOptions(correct: Form, allForms: Form[], field: 'gloss_en' | 'form') {
  const count = isPhrase(correct.form) ? SENTENCE_CHOICES : MATCH_SIZE;
  const usable = allForms.filter((f) => f.id === correct.id || !sharesMeaning(f, correct));
  const sameShape = usable.filter((f) => isPhrase(f.form) === isPhrase(correct.form));
  const samePos = sameShape.filter((f) => f.pos === correct.pos);
  const pool = samePos.length >= count ? samePos : sameShape.length >= count ? sameShape : usable;
  const chosen: Form[] = [correct];
  for (const f of shuffle(pool)) {
    if (chosen.some((c) => c.id === f.id || norm(labelOf(c, field)) === norm(labelOf(f, field)) || sharesMeaning(c, f))) {
      continue;
    }
    chosen.push(f);
    if (chosen.length === count) break;
  }
  return shuffle(chosen);
}

/** A plausible wrong meaning for the true/false exercise — never a synonym. */
export function pickImposter(correct: Form, allForms: Form[]): Form | null {
  const sameShape = allForms.filter((f) => isPhrase(f.form) === isPhrase(correct.form));
  const pool = sameShape.length > 1 ? sameShape : allForms;
  const others = pool.filter((f) => f.id !== correct.id && !sharesMeaning(f, correct));
  return others.length ? shuffle(others)[0] : null;
}

/** Forms for a matching block: no two that could pair with each other's meaning.
 *  A loanword glossed as itself — mate, cortado — is left out too: its two tiles
 *  read the same on both sides, so the pair falls out for free and the screen
 *  tests nothing. Those words are still drilled everywhere else. */
export function matchable(forms: Form[], size = MATCH_SIZE): Form[] {
  const out: Form[] = [];
  for (const f of shuffle(forms.filter((x) => !isPhrase(x.form) && !selfGlossed(x)))) {
    if (out.some((o) => sharesMeaning(o, f))) continue;
    out.push(f);
    if (out.length === size) break;
  }
  return out;
}
