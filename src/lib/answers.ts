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

/**
 * A word as it should appear out of its sentence. The first word of a sentence
 * is capitalised in place, and a capital on one option or tile — when every
 * other one is lowercase — gives the answer away. Names keep their capital:
 * they're capitalised everywhere.
 */
export const outOfSentence = (t: SentenceToken, index: number) => {
  const word = tokenWord(t);
  const isName = t.form_ids.length === 0 && !t.glue;
  return index === 0 && !isName ? word.charAt(0).toLocaleLowerCase('es') + word.slice(1) : word;
};

/** Where a form sits in the sentence; -1 if it is not there. */
export const tokenIndexOf = (s: Sentence, formId: string) => s.tokens.findIndex((t) => t.form_ids.includes(formId));

// ---------------------------------------------------------------------------
// Meaning
// ---------------------------------------------------------------------------

type Glossed = Pick<Form, 'id' | 'form' | 'gloss_en'>;

/** A gloss's senses: "well, fine, good" → ["well", "fine", "good"]. Split the
 *  same way as the outline validator's overlap warning (outline.mjs). */
export const senses = (gloss: string) =>
  gloss
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Whether two different forms could both answer the same English: they share
 *  a sense ("bien" and "bueno" are both "well"), or are spelt the same. */
export const sharesMeaning = (a: Glossed, b: Glossed) =>
  a.id !== b.id &&
  (norm(a.form) === norm(b.form) || senses(a.gloss_en).some((s) => senses(b.gloss_en).includes(s)));

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

/** Every Spanish answer a sentence accepts, as words. Transcribing audio
 *  accepts only what was said. */
export const acceptedAnswers = (s: Sentence, { byEar = false }: { byEar?: boolean } = {}) =>
  (byEar ? [s.es] : [s.es, ...s.es_alt]).map(answerWords);

/** A sentence rebuilt from tiles. Tiles are whole words, so there is no typo
 *  to forgive: the words match an accepted answer or they don't. */
export function sentenceAnswerMatches(placed: string[], sentence: Sentence, opts: { byEar?: boolean } = {}) {
  const got = placed.flatMap(answerWords);
  return acceptedAnswers(sentence, opts).some((answer) => sameWords(got, answer));
}

/** Whether a rebuilt answer is the written sentence itself, rather than one of
 *  its alternatives — when it isn't, the feedback shows the written one too. */
export const isCanonical = (placed: string[], sentence: Sentence) =>
  sameWords(placed.flatMap(answerWords), answerWords(sentence.es));

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
 *  slip worth pointing out. `expected` is the accepted spelling it matched. */
export type Note = 'accent' | 'typo' | 'enye';
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
 */
export function gradeTyped(input: string, form: Form, allForms: Form[]): Graded {
  const accepted = sameAnswer(form, allForms).flatMap((f) => [f.form, ...(f.alt ?? [])]);
  const fallback = { correct: false, expected: form.form } as const;
  if (!norm(input)) return fallback;

  const exact = accepted.find((a) => normStrict(a) === normStrict(input));
  if (exact) return { correct: true, expected: exact };

  const accent = accepted.find((a) => norm(a) === norm(input));
  if (accent) return { correct: true, note: 'accent', expected: accent };

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
export function typedAnswerMatches(input: string, form: Form, allForms: Form[]) {
  return gradeTyped(input, form, allForms).correct;
}

/**
 * Which forms a wrong build actually missed. Her words are matched against the
 * accepted answer closest to what she built, as a subsequence, so a skipped
 * word or a stray decoy only blames the word it displaced — not everything
 * after it, and not a pronoun she was allowed to leave out. Glue words and
 * names have no form to blame; if nothing else was wrong, the target takes it.
 */
export function missedForms(sentence: Sentence, placed: string[], allForms: Form[]): string[] {
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
export function gapOptions(sentence: Sentence, target: Form, allForms: Form[]): Option[] {
  const index = tokenIndexOf(sentence, target.id);
  const answer = index >= 0 ? outOfSentence(sentence.tokens[index], index) : target.form;
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
  // Fall back to other shapes only when there are too few to make a question.
  const pool = sameShape.length >= 2 ? sameShape : decoys;

  const seen = new Set<string>();
  const picked: Form[] = [];
  for (const f of pool) {
    if (seen.has(norm(f.form))) continue;
    seen.add(norm(f.form));
    picked.push(f);
    if (picked.length === 3) break;
  }
  return shuffle([{ id: target.id, label: answer }, ...picked.map((f) => ({ id: f.id, label: f.form }))]);
}

/** How many spare tiles a bank carries beyond the answer. */
const DECOYS = 4;

/**
 * Word tiles for rebuilding the sentence — a set phrase broken into its words,
 * so "¿Qué tal?" is two tiles, not one — with a few of her other words mixed
 * in. A spare tile never shares a meaning with a word of the sentence: "bueno"
 * next to "Dale, chau." would be a second right answer.
 */
export function sentenceTiles(sentence: Sentence, allForms: Form[]) {
  const answer = sentence.tokens.flatMap((t, i) => wordsOf(outOfSentence(t, i)));
  const taken = new Set(answer.map(norm));
  const own = formsIn(sentence, new Map(allForms.map((f) => [f.id, f])));
  const spare = new Map<string, string>();
  for (const f of shuffle(allForms)) {
    if (f.pos === 'propn' || isPhrase(f.form) || own.some((o) => sharesMeaning(o, f))) continue;
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
    if (chosen.some((c) => c.id === f.id || c[field] === f[field] || sharesMeaning(c, f))) continue;
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
  for (const f of shuffle(forms.filter((x) => !isPhrase(x.form) && norm(x.gloss_en) !== norm(x.form)))) {
    if (out.some((o) => sharesMeaning(o, f))) continue;
    out.push(f);
    if (out.length === size) break;
  }
  return out;
}
