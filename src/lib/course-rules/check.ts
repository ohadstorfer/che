// The mechanical checks for words and sentences, against a vocabulary rather
// than a file: the outline validator, the linter, the generator and the admin's
// editors all run these.

import type { FormFeatures } from '../types';
import { generateVariants, uncoveredTokens } from './accept';
import { CHE_GREETINGS, CLITIC_LEMMAS, REGIONAL, REGIONAL_PHRASES, TUTEO, TUTEO_AMBIGUOUS, bare, fold, registerRank } from './rules';
import { clausesOf, wordsIn } from './shape';
import { type Token, buildIndex, split, tokenize } from './tokenize';
import { type VocabForm, type VocabUnit, type Vocabulary, drillable } from './vocabulary';

/** A phrase as the denylist compares them: "¿Qué tal?" and "qué tal" are one. */
const phraseKey = (s: string) => ` ${bare(s).split(/\s+/).filter(Boolean).join(' ')} `;

/** Set phrases from other Spanishes, matched over the whole sentence. */
export function checkPhrases(es: string) {
  const hay = phraseKey(es);
  const problems: string[] = [];
  for (const [phrase, instead] of REGIONAL_PHRASES) {
    if (hay.includes(phraseKey(phrase))) problems.push(`"${phrase}" is not how it's said here — use "${instead}"`);
  }
  return problems;
}

/**
 * `che` opens what you say. It is "hey", not the English "man": *Che, mal.*,
 * not *Mal, che.* Straight after a bare greeting is the one exception, because
 * "Hola, che." is a single gesture rather than a tag on the end of a sentence.
 * Checked per clause, so "Hola. Che, ¿todo bien?" is fine.
 */
export function chePlacement(es: string) {
  const problems: string[] = [];
  for (const clause of clausesOf(es)) {
    const words = wordsIn(clause).map((w) => fold(split(w).core));
    words.forEach((w, i) => {
      if (w !== 'che') return;
      const afterGreeting =
        (i === 1 && CHE_GREETINGS.has(words[0])) || (i === 2 && CHE_GREETINGS.has(`${words[0]} ${words[1]}`));
      if (i === 0 || afterGreeting) return;
      problems.push(
        `"${clause}" — "che" goes in front, where English puts "hey": "Che, mal.", not "Mal, che.". ` +
          `Only a bare greeting may come before it ("Hola, che."); anywhere else it reads as the English "man" tacked on the end.`,
      );
    });
  }
  return problems;
}

/** Forms a sentence in a unit may use: its own and every earlier unit's. */
export function availableForms<F extends { unit_order: number }>(vocabulary: { forms: F[] }, courseOrder: number) {
  return vocabulary.forms.filter((f) => f.unit_order <= courseOrder);
}

/**
 * The vocabulary checks one sentence has to pass. Returns human-readable
 * problems; empty means it passes. `retired` are words taken out of the
 * course, so a sentence still using one can say so.
 */
export function checkSentence(vocabulary: Vocabulary, unit: VocabUnit, es: string, retired: { form: string }[] = []) {
  const problems: string[] = [];
  const available = availableForms(vocabulary, unit.course_order);
  const tokens = tokenize(es, buildIndex(available));
  const everything = buildIndex(vocabulary.forms);
  const gone = buildIndex(retired);
  for (const t of tokens) {
    const folded = fold(t.core);
    if (TUTEO.has(folded)) problems.push(`"${t.core}" is tuteo`);
    else if (REGIONAL.has(folded)) problems.push(`"${t.core}" is not rioplatense — use "${REGIONAL.get(folded)}"`);
    else if (t.forms.length === 0) {
      const later = tokenize(t.core, everything)[0]?.forms ?? [];
      problems.push(
        later.length
          ? `"${t.core}" isn't taught until unit ${Math.min(...later.map((f) => f.unit_order))}`
          : tokenize(t.core, gone)[0]?.forms.length
            ? `"${t.core}" is a retired word`
            : `"${t.core}" isn't in the course lexicon`,
      );
    } else if (t.forms.every((f) => registerRank(f.register) > registerRank(unit.register_max))) {
      problems.push(`"${t.core}" is ${t.forms[0].register}; this unit allows up to ${unit.register_max}`);
    } else if (t.forms.every((f) => f.bound)) {
      // The tokenizer takes the longest form it can, so a bound form resolving
      // on its own means the chunk it belongs to is not there: the sentence
      // said "llamo" where it had to say "me llamo".
      const chunks = vocabulary.forms.filter((f) => isChunkFor(f, t.forms[0]));
      problems.push(
        `"${t.core}" is never said on its own — ${chunks.length ? `use ${chunks.map((c) => `"${c.form}"`).join(' or ')}` : 'it only exists inside a longer form'}`,
      );
    }
  }
  problems.push(...checkPhrases(es), ...chePlacement(es));
  return problems;
}

/** Why a word can't be in the lexicon, if it can't: tuteo, a regionalism, an untagged vos form. */
export function checkFormEntry(form: { form: string; pos: string; features: FormFeatures }) {
  const problems: string[] = [];
  const folded = fold(form.form);
  const features = form.features ?? {};
  if (TUTEO.has(folded)) problems.push(`"${form.form}" is a tuteo form — use the vos form`);
  if (TUTEO_AMBIGUOUS.has(folded) && features.mood === 'imp' && features.person === 2 && !features.voseo) {
    problems.push('second-person imperative without "vos" — the vos imperative stresses the last vowel');
  }
  if (features.person === 2 && features.number === 'sg' && form.pos === 'verb' && !features.voseo) {
    problems.push('second-person singular verb form must be tagged "vos"');
  }
  if (REGIONAL.has(folded)) problems.push(`"${form.form}" is not rioplatense — use "${REGIONAL.get(folded)}"`);
  // A multi-word entry can be a whole foreign phrase ("echo de menos").
  problems.push(...checkPhrases(form.form));
  return problems;
}

/** Whether `chunk` is a multi-word form of the same lemma that ends in `bound`. */
const isChunkFor = (chunk: VocabForm, bound: VocabForm) =>
  chunk.id !== bound.id &&
  chunk.lemma_id === bound.lemma_id &&
  fold(chunk.form).split(' ').length > 1 &&
  fold(chunk.form).endsWith(` ${fold(bound.form)}`);

/**
 * Forms that behave as if they were bound but are not marked so: every time
 * the course says the word, the same little word comes first.
 *
 * This is how `llamo` was found. It had a card of its own reading "llamo /
 * name is", which is not a question anyone can answer: all nineteen sentences
 * that say `llamo` say `me llamo`, so the half the card left out is the half
 * that carries the meaning (docs/course-spec.md §1.5).
 *
 * The test is deliberately blunt — a word is suspect only when it has never
 * once stood on its own — so a real word that merely *likes* a neighbour
 * ("muy bien") is not swept up with it.
 *
 * @param minSeen  how many times the course must say the word before its
 *                 company means anything. Two sentences prove nothing.
 */
export function boundCandidates(
  vocabulary: Vocabulary,
  sentences: { es: string }[],
  { minSeen = 3 }: { minSeen?: number } = {},
) {
  const index = buildIndex(vocabulary.forms);
  const before = new Map<string, string[]>();
  for (const s of sentences) {
    const tokens = tokenize(s.es, index);
    tokens.forEach((t, i) => {
      const previous = i > 0 ? fold(tokens[i - 1].core) : '';
      for (const f of t.forms) {
        if (!before.has(f.id)) before.set(f.id, []);
        before.get(f.id)!.push(previous);
      }
    });
  }

  const out: { form: VocabForm; seen: number; after: string }[] = [];
  for (const form of vocabulary.forms) {
    // Only a verb takes a clitic. `la`, `los` and `las` are articles too, and a
    // noun the course only ever says with its article — "la cuenta", "los
    // domingos" — is a noun, not half of a chunk.
    if (form.bound || !drillable(form) || form.pos !== 'verb') continue;
    const company = before.get(form.id) ?? [];
    if (company.length < minSeen) continue;
    const [first] = company;
    if (!CLITIC_LEMMAS.has(first)) continue;
    if (!company.every((w) => w === first)) continue;
    out.push({ form, seen: company.length, after: first });
  }
  return out;
}

/**
 * A gloss's senses: "well, fine, good" → ["well", "fine", "good"]. The app
 * splits them the same way (src/lib/answers.ts) to decide which words may be
 * offered as wrong answers for each other.
 */
export const senses = (gloss: string | null | undefined) =>
  String(gloss ?? '')
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

const glossOf = (vocabulary: Vocabulary) => {
  const lemmaById = new Map((vocabulary.lemmas ?? []).map((l) => [l.id, l]));
  return (f: VocabForm) => f.gloss_en ?? lemmaById.get(f.lemma_id)?.gloss_en ?? '';
};

/** Pairs of drillable forms, from different lemmas, whose glosses share a sense. */
export function meaningOverlaps(vocabulary: Vocabulary) {
  const gloss = glossOf(vocabulary);
  const forms = vocabulary.forms.filter(drillable).map((f) => ({ form: f, senses: senses(gloss(f)) }));
  const out: { a: VocabForm; b: VocabForm; shared: string[] }[] = [];
  for (let i = 0; i < forms.length; i++) {
    for (let j = i + 1; j < forms.length; j++) {
      if (forms[i].form.lemma_id === forms[j].form.lemma_id) continue;
      const shared = forms[i].senses.filter((s) => forms[j].senses.includes(s));
      if (shared.length) out.push({ a: forms[i].form, b: forms[j].form, shared });
    }
  }
  return out;
}

/**
 * Glosses that spell out the Spanish word and then explain it — "mate (the
 * drink)" — hand over the answer on a tile. A gloss that is the word itself
 * ("mate" → "mate") is fine: a loanword has no other English.
 */
export function glossRepeats(vocabulary: Vocabulary) {
  const gloss = glossOf(vocabulary);
  return vocabulary.forms.filter((f) => {
    if (!drillable(f)) return false;
    const word = fold(f.form);
    const g = gloss(f);
    if (!word || fold(g) === word) return false;
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return senses(g).some((s) => fold(s) !== word && new RegExp(`\\b${escaped}\\b`).test(fold(s)));
  });
}

// ---------------------------------------------------------------------------
// A whole sentence, the way the admin saves one (docs/superplan-admin-palabras
// §3): everything that would keep it from a learner, in plain words.
// ---------------------------------------------------------------------------

export interface SentenceReview {
  /** Stored shape: each token with the forms it resolves to. */
  tokens: { surface: string; form_ids: string[] }[];
  resolved: Token<VocabForm>[];
  /** Empty when the sentence can be live. */
  problems: string[];
  /** The alternatives that follow from the rules (pronoun, che, gender). */
  variants: string[];
}

/** Two answers are the same answer when their words are: "¿Sos Juan?" = "sos juan". */
export const answerKey = (es: string) => bare(es).split(/\s+/).filter(Boolean).join(' ');

/** "Sos Juan?" — a question or exclamation without its opening mark. */
export function missingOpeningMarks(es: string) {
  const count = (c: string) => es.split(c).length - 1;
  const problems: string[] = [];
  if (count('?') > count('¿')) problems.push('a question needs its opening "¿"');
  if (count('!') > count('¡')) problems.push('an exclamation needs its opening "¡"');
  return problems;
}

export function reviewSentence({
  vocabulary,
  unit,
  es,
  en,
  targetFormId,
  retired = [],
}: {
  vocabulary: Vocabulary;
  unit: VocabUnit;
  es: string;
  en: string;
  targetFormId: string | null;
  retired?: ({ form: string } | VocabForm)[];
}): SentenceReview {
  const gloss = glossOf(vocabulary);
  const available = availableForms(vocabulary, unit.course_order);
  // A word not taught yet, or retired, still links to its form: the sentence
  // is paused for it, and has to be found again when the word moves or comes back.
  const later = buildIndex(vocabulary.forms);
  const gone = buildIndex(retired.filter((f): f is VocabForm => 'id' in f));
  const lookUp = (core: string, index: typeof later) => tokenize(core, index)[0]?.forms ?? [];
  const resolved = tokenize(es, buildIndex(available)).map((t) => {
    const forms = t.forms.length ? t.forms : lookUp(t.core, later).length ? lookUp(t.core, later) : lookUp(t.core, gone);
    return { ...t, forms: forms.map((f) => ({ ...f, gloss_en: gloss(f) })) };
  });
  const problems = [...checkSentence(vocabulary, unit, es, retired), ...missingOpeningMarks(es)];
  if (!en.trim()) problems.push('the English is empty');
  else {
    for (const t of uncoveredTokens(resolved, en)) {
      problems.push(`the English has nothing for "${t.core}", so a learner can't know it belongs`);
    }
  }
  if (!targetFormId) problems.push('it has no word to teach');
  else if (!resolved.some((t) => t.forms.some((f) => f.id === targetFormId))) {
    const target = vocabulary.forms.find((f) => f.id === targetFormId);
    problems.push(target ? `it no longer uses "${target.form}", the word it teaches` : 'the word it teaches is not in the course');
  }
  return {
    tokens: resolved.map((t) => ({ surface: t.surface, form_ids: t.forms.map((f) => f.id) })),
    resolved,
    problems,
    variants: generateVariants(resolved, en, vocabulary),
  };
}
