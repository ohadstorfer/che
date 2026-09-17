// Other right answers a model proposes (the pure parts of `course:answers`).
//
// The rules in src/lib/answers.ts accept what follows from the grammar: a verb
// with its pronoun, a noun with its article, the other gender, another course
// word with the same meaning. What doesn't follow from the grammar has to be
// listed — "buenas" for "hi", "¿Sos Lucía vos?" for "Are you
// Lucía?" — and a model is asked for it. Nothing it proposes is stored without
// passing the checks here, which reuse the app's own grading: an answer the
// app already accepts is not stored again, and an answer that is another word
// of the course is never made right by accident.
//
// Imports the app's TypeScript, so the script runs with scripts/test/register.mjs.

import { answerWords } from '../../../src/lib/answers.ts';

// The checks are shared with the admin, where answers are also added by hand.
export {
  candidateMeanings,
  checkSentenceAlternatives,
  checkWordAnswers,
} from '../../../src/lib/course-rules/word-answers.ts';

export const FORMS_PER_REQUEST = 40;
export const SENTENCES_PER_REQUEST = 25;

export const WORDS_SCHEMA =
  'Answer with ONLY a JSON object: {"forms":[{"id":string,"answers":[{"meaning":string (one of the meanings listed for the word, exactly),"answer":string}]}]} — one entry per word; "answers" is often empty.';
export const SENTENCES_SCHEMA =
  'Answer with ONLY a JSON object: {"sentences":[{"id":string,"alternatives":[string]}]} — one entry per sentence; "alternatives" is often empty.';

const featureText = (f = {}) =>
  [
    f.person && f.number ? `${f.person}${f.number}` : null,
    f.gender && f.number ? `${f.gender}.${f.number}` : null,
    f.mood === 'imp' ? 'imperative' : null,
    f.voseo ? 'vos' : null,
  ]
    .filter(Boolean)
    .join(', ');

export function wordsPrompt({ forms, style }) {
  const system = [
    'You write the answer key for a course in Argentine (rioplatense) Spanish, for English speakers.',
    'A learner is shown one English meaning and types the Spanish. You list the other things she could type that a teacher from Buenos Aires would mark right — and nothing a careful teacher would not.',
    '',
    style,
  ].join('\n');
  const user = [
    'For each Spanish word below, and each of its English meanings, list other answers that mean exactly that and would be marked right when a learner types them for that English on its own.',
    '',
    'Already accepted automatically — do NOT list these:',
    '- the word itself, or with a different accent, capital or a small typo;',
    '- the word with its subject pronoun or clitic in front ("yo soy", "me llamo") or with its article ("la medialuna");',
    '- the other gender of the same word;',
    '- another word of the course with the same meaning.',
    '',
    'Do list, when they exist:',
    '- a word a porteño would use just as naturally for that exact meaning ("buenas" for "hi");',
    '- a common other spelling of the same word.',
    '',
    'Never list:',
    '- anything with a different meaning, a stronger or weaker one, or a related word ("muchas gracias" is "thank you very much", not "thanks");',
    '- tú or vosotros forms, or words from Spain or Mexico (voseo and rioplatense only);',
    '- the English, or anything longer than a short phrase.',
    '',
    'Most words have no other answer: leave "answers" empty rather than stretch. Give at most 3 answers per meaning.',
    '',
    'Words:',
    ...forms.map((f) =>
      [
        '',
        `id: ${f.id}`,
        `Spanish: ${f.form} — ${f.pos}${featureText(f.features) ? ` (${featureText(f.features)})` : ''}, lemma ${f.lemma}`,
        `Dictionary gloss: ${f.gloss_en}${f.gloss_note_en ? ` — ${f.gloss_note_en}` : ''}`,
        `Meanings: ${f.meanings.map((m) => JSON.stringify(m)).join(', ')}`,
      ].join('\n'),
    ),
  ].join('\n');
  return { system, user };
}

export function sentencesPrompt({ sentences, style }) {
  const system = [
    'You write the answer key for a course in Argentine (rioplatense) Spanish, for English speakers.',
    'A learner rebuilds a Spanish sentence from word tiles, reading its English. You list the other ways of putting the tiles together that a teacher from Buenos Aires would mark right.',
    '',
    style,
  ].join('\n');
  const user = [
    'For each sentence below, list other sentences that:',
    '- use ONLY the words listed as its tiles, each no more times than it is listed — a different order, or some words left out;',
    '- a porteño would actually say;',
    '- translate the English just as well, with nothing lost that the English says.',
    '',
    'Do not repeat the sentence or anything already accepted. Write them with Spanish punctuation (¿…?, ¡…!).',
    'Most sentences have no other good order: leave "alternatives" empty rather than stretch.',
    '',
    'Sentences:',
    ...sentences.map((s) =>
      [
        '',
        `id: ${s.id}`,
        `Spanish: ${s.es}`,
        `English: ${s.en}`,
        `Tiles: ${answerWords(s.es).join(' · ')}`,
        `Already accepted: ${(s.es_alt ?? []).length ? s.es_alt.join(' | ') : '—'}`,
      ].join('\n'),
    ),
  ].join('\n');
  return { system, user };
}

