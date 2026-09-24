// Other right answers — checked before they are stored, whether a model
// proposed them (`course:answers`) or a person typed them in the admin. The
// checks reuse the app's own grading: an answer the app already accepts is not
// stored again, and an answer that is another word of the course is never made
// right by accident.

import { answerWords, glossSenses, gradeTyped, norm, senseKey } from '../answers';
import { meaningsFromSentences, standsAlone } from '../meanings';
import type { Form, Sentence } from '../types';
import { senseClashes } from './check';
import { REGIONAL, TUTEO, fold } from './rules';

/** Past this many words an "answer" for one word is a sentence. */
export const MAX_ANSWER_WORDS = 5;

/** Every meaning a prompt could show for a form: its gloss's senses, and what its sentences say it means. */
export function candidateMeanings(form: Pick<Form, 'id' | 'gloss_en'>, sentences: Sentence[]) {
  const fromSentences = (meaningsFromSentences(sentences).get(form.id) ?? []).filter((m) => standsAlone(m, form.gloss_en));
  const out = new Map<string, string>();
  for (const m of [...glossSenses(form.gloss_en), ...fromSentences]) if (!out.has(senseKey(m))) out.set(senseKey(m), m);
  return [...out.values()];
}

const wordsOf = (text: string) =>
  text
    .split(/\s+/)
    .map((w) => fold(w.replace(/[^\p{L}]/gu, '')))
    .filter(Boolean);

/** Why a piece of Spanish can't be an answer in this course, or null. */
export function offends(text: string) {
  for (const w of wordsOf(text)) {
    if (TUTEO.has(w)) return `"${w}" is tuteo`;
    if (REGIONAL.has(w)) return `"${w}" is not rioplatense — "${REGIONAL.get(w)}"`;
  }
  return null;
}

export interface AnswerRow {
  form_id: string;
  meaning: string;
  answer: string;
}

/**
 * The answers worth storing for one form, and why the rest were not. `deck` is
 * the course's drillable forms, with their meanings and stored answers, so the
 * app's own grading can say what it already accepts.
 */
export function checkWordAnswers({
  form,
  meanings,
  proposed,
  deck,
}: {
  form: Form;
  meanings: string[];
  proposed: { meaning?: unknown; answer?: unknown }[] | null | undefined;
  deck: Form[];
}) {
  const byKey = new Map(meanings.map((m) => [senseKey(m), m]));
  const rows: AnswerRow[] = [];
  const problems: string[] = [];
  const skipped: string[] = [];
  for (const p of proposed ?? []) {
    const answer = String(p.answer ?? '').trim();
    const meaning = byKey.get(senseKey(String(p.meaning ?? '')));
    const why = !meaning
      ? `"${p.meaning}" is not one of its meanings`
      : !norm(answer)
        ? 'empty'
        : /[^\p{L}\s¿?¡!.,'-]/u.test(answer)
          ? 'not plain Spanish'
          : wordsOf(answer).length > MAX_ANSWER_WORDS
            ? 'too long'
            : (offends(answer) ?? senseClashes(answer, meaning)[0] ?? null);
    if (why || !meaning) {
      problems.push(`${form.form} "${p.meaning}" → "${answer}": ${why}`);
      continue;
    }
    // What the app already accepts first: a loanword whose meaning is the
    // Spanish word itself ("medialuna") would otherwise read as the English.
    const known = { ...form, accepts: [...(form.accepts ?? []), ...rows.map((r) => ({ meaning: r.meaning, answer: r.answer }))] };
    if (gradeTyped(answer, known, deck, meaning).correct) {
      skipped.push(`${form.form} "${meaning}" → "${answer}": already right`);
      continue;
    }
    if (norm(answer) === norm(meaning)) {
      problems.push(`${form.form} "${meaning}" → "${answer}": the English itself`);
      continue;
    }
    if (deck.some((f) => f.id !== form.id && norm(f.form) === norm(answer))) {
      problems.push(`${form.form} "${meaning}" → "${answer}": another word of the course, with another meaning`);
      continue;
    }
    rows.push({ form_id: form.id, meaning, answer });
  }
  return { rows, problems, skipped };
}

/**
 * A sentence's accepted Spanish with the proposals that pass added. An
 * alternative must be buildable from the sentence's own tiles — anything else
 * can't be built, and storing it would only mislead the reviewer.
 */
export function checkSentenceAlternatives({
  sentence,
  proposed,
}: {
  sentence: { es: string; es_alt?: string[] | null };
  proposed: unknown[] | null | undefined;
}) {
  const tiles = new Map<string, number>();
  for (const w of answerWords(sentence.es)) tiles.set(w, (tiles.get(w) ?? 0) + 1);
  const taken = new Set([sentence.es, ...(sentence.es_alt ?? [])].map((s) => answerWords(s).join(' ')));
  const added: string[] = [];
  const problems: string[] = [];
  for (const raw of proposed ?? []) {
    const alt = String(raw ?? '').trim();
    const words = answerWords(alt);
    const key = words.join(' ');
    const why = !words.length
      ? 'empty'
      : !buildableFrom(alt, tiles)
        ? 'uses words the tiles do not have'
        : (alt.includes('?') && !alt.includes('¿')) || (alt.includes('!') && !alt.includes('¡'))
          ? 'Spanish punctuation missing'
          : null;
    if (why) {
      problems.push(`${sentence.es} → "${alt}": ${why}`);
      continue;
    }
    if (taken.has(key)) continue;
    taken.add(key);
    added.push(alt);
  }
  return { es_alt: [...(sentence.es_alt ?? []), ...added], added, problems };
}

/** Whether `alt` can be put together from `tiles` (word → how many). */
export function buildableFrom(alt: string, tiles: Map<string, number>) {
  const count = new Map<string, number>();
  for (const w of answerWords(alt)) count.set(w, (count.get(w) ?? 0) + 1);
  return ![...count].some(([w, n]) => n > (tiles.get(w) ?? 0));
}
