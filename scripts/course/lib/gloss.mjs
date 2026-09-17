// What each word of a sentence means in that sentence (the pure parts of
// `course:gloss`). A form's gloss is a dictionary entry — "well, fine, good" —
// and no single sense of it is right everywhere: `bien hecho` is "well done",
// `estoy bien` is "I'm fine". So every token of a sentence is aligned with the
// words of the sentence's own English, and the app reads a word's meaning off
// the sentences it is used in (src/lib/meanings.ts).
//
// A model does the aligning; this file asks for it and checks the answer. The
// check is what makes the answer safe to store without reading all of it: a
// gloss must be words that are actually in the English, so the worst a wrong
// alignment can do is point at the wrong words of a right translation.

/** Sentences per request, so each answer stays short and checkable. */
export const SENTENCES_PER_REQUEST = 25;

export const GLOSS_SCHEMA =
  'Answer with ONLY a JSON object: {"sentences":[{"id":string,"tokens":[{"i":int (the token number),"en":string (the English words that translate it)}]}]} — one entry per sentence, tokens with no English left out.';

export function glossPrompt({ sentences, formById }) {
  const system = [
    'You align Spanish sentences from a course in Argentine (rioplatense) Spanish with their English translations, word by word, for learners who tap a word to see what it means.',
    'You are precise: you name the words of the translation a Spanish word stands for in this sentence — never a dictionary definition, never a sense it does not have here.',
  ].join('\n');
  const user = [
    'For every numbered token of every sentence, give the words of the English translation that translate that token in this sentence.',
    '',
    'Rules:',
    '- Copy the words from the English translation exactly, as one unbroken piece of it. Do not paraphrase, do not add words that are not in it.',
    '- Write them as they would appear mid-sentence: lowercase, unless English always capitalises them ("I", names, nationalities).',
    '- Leave out the punctuation around them.',
    '- The meaning in THIS sentence: `bien` in "¡Bien hecho!" = "Well done!" is "well"; in "Estoy bien" = "I\'m fine" it is "fine".',
    '- A token that is a whole expression gets the whole English expression: `todo bien` in "Todo bien" = "All good" is "all good"; `por favor` is "please".',
    '- When English folds two Spanish words into one ("Soy" = "I\'m", "Dámelo" = "Give it to me"), give each token the English words it accounts for; two tokens may share a word.',
    '- A verb whose subject Spanish leaves out takes the English subject with it: `soy` in "Soy de acá" = "I\'m from here" is "I\'m".',
    '- Leave a token out when the English has nothing for it: `che` usually, an article English drops, a pronoun the English doesn\'t repeat.',
    '',
    'Sentences:',
    ...sentences.map((s) =>
      [
        '',
        `id: ${s.id}`,
        `Spanish: ${s.es}`,
        `English: ${s.en}`,
        'Tokens:',
        ...s.tokens.map((t, i) => {
          const forms = t.form_ids.map((id) => formById.get(id)).filter(Boolean);
          const about = forms.map((f) => `${f.lemma} (${f.pos}${f.is_glue ? ', function word' : ''})`).join(' / ');
          return `  ${i}. ${t.surface}${about ? ` — ${about}` : ''}`;
        }),
      ].join('\n'),
    ),
  ].join('\n');
  return { system, user };
}

// The checks — whether a gloss is in the English, applying an answer, whether a
// sentence is done — are shared with the admin (src/lib/course-rules/gloss.ts).
export { applyGlosses, inEnglish, isGlossed } from '../../../src/lib/course-rules/gloss.ts';
