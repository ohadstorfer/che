// The generation pipeline's pure parts (docs/course-spec.md §4, amended by
// docs/learning-engine-spec.md §13): what the generator is asked for, how its
// candidates are checked, and how the judge's scores pick the ones that ship.
// Everything here is deterministic given its inputs, so it is tested without a
// model; the scripts supply the model and the database.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { parse } from 'yaml';

import { buildContent } from './content.mjs';
import { drillable } from './outline.mjs';
import { fold } from './rules.mjs';


/** "a", "a or b", "a, b or c" — a list that reads like a sentence. */
const list = (xs, join = 'or') =>
  xs.length < 3 ? xs.join(` ${join} `) : `${xs.slice(0, -1).join(', ')} ${join} ${xs[xs.length - 1]}`;

/** The longer form a bound one lives inside: `levanto` → `me levanto`. */
const chunkFor = (outline, bound) =>
  outline.forms.find((f) => f.lemma_id === bound.lemma_id && f.id !== bound.id && f.form.endsWith(` ${bound.form}`));

/**
 * Two of a unit's forms can share a spelling — "fue" is both ir's "went" and
 * ser's "was" — and are then named "fue/ir" and "fue/ser": in the prompt's
 * target list, in the writer's answer, and on the sentence it becomes.
 */
const sameSpelling = (outline, unit, f) =>
  outline.forms.filter(
    (g) => (isPracticeUnit(unit) ? unit.review_form_ids.includes(g.id) : g.unit_id === unit.id) && fold(g.form) === fold(f.form),
  ).length > 1;
export const targetLabel = (outline, unit, f) => (sameSpelling(outline, unit, f) ? `${f.form}/${f.lemma}` : f.form);
function findTarget(outline, unit, ref) {
  const [surface, qualifier] = String(ref ?? '').split('/').map((x) => x.trim());
  const mine = (f) => (isPracticeUnit(unit) ? unit.review_form_ids.includes(f.id) : f.unit_id === unit.id);
  const hits = outline.forms.filter(
    (f) => mine(f) && fold(f.form) === fold(surface) && (!qualifier || f.lemma === qualifier || f.pos === qualifier),
  );
  return hits.length === 1 ? { form: hits[0] } : { ambiguous: hits.length > 1 };
}

/** Candidates asked for per sentence the unit needs (§13.2). */
export const OVERGENERATE = 3;
/** Per new form: one intro sentence and three drills (course-spec §4). */
export const QUOTA = { intro: 1, drill: 3 };
/** Per reviewed form in a practice unit: practice is the point, so more. */
export const PRACTICE_QUOTA = { intro: 1, drill: 6 };
/** Forms per generation request, so each answer stays short and checkable. */
export const FORMS_PER_REQUEST = 4;
/** A candidate needs at least this on every judge score to be selected. */
export const MIN_SCORE = 4;

/**
 * Appendix B of the course spec — the rioplatense style spec — verbatim, and
 * the whole regional word list after it, so the model writes `pileta` the
 * first time instead of learning it from the linter.
 */
export function styleSpec(
  specPath = new URL('../../../docs/course-spec.md', import.meta.url),
  wordsPath = new URL('../../../docs/course/regional-words.yaml', import.meta.url),
) {
  const text = readFileSync(specPath, 'utf8');
  const start = text.indexOf('## Appendix B');
  const end = text.indexOf('## Appendix C');
  if (start < 0) return '';
  const { words } = parse(readFileSync(wordsPath, 'utf8'));
  const pairs = words.map((w) => `${w.es} → ${w.ar}`).join(' · ');
  const senses = 'A T-shirt is a **remera**; **camiseta** only means a team jersey (la camiseta de la selección).';
  return `${text.slice(start, end > start ? end : undefined).trim()}\n\n**Never use (any form) → say instead:** ${pairs}\n\n**One word, two senses:** ${senses}`;
}

export const promptHash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

const formLine = (f, lemmaGloss) => `${f.form} — ${f.pos}, "${f.gloss_en ?? lemmaGloss ?? ''}"${f.is_glue ? ', function word' : ''}`;

/**
 * The generator's instructions for a batch of the unit's new forms. The literal
 * list of forms the sentences may use is the hard constraint; approved
 * sentences from this and the previous units show the voice (§13.1).
 */
export function generationPrompt({ outline, unit, targets, examples, existing, style }) {
  const lemmaById = new Map(outline.lemmas.map((l) => [l.id, l]));
  const available = outline.forms.filter((f) => f.unit_order <= unit.course_order);
  const newHere = new Set(outline.forms.filter((f) => f.unit_id === unit.id).map((f) => f.id));
  // New words this unit teaches that no target will ever carry: proper nouns,
  // and glue that is not a target in its own right. A bound form is not one of
  // these — it rides inside the chunk that targets it, and asking for it to be
  // "said at least once" is asking for the very sentence the rule forbids.
  const passengers = outline.forms.filter(
    (f) => f.unit_id === unit.id && !drillable(f) && !f.bound && !targets.some((t) => t.id === f.id),
  );
  // Forms the unit teaches only inside a longer one. The vocabulary list shows
  // them, so without this the model writes "Llamo Sofi" and loses the sentence
  // in the check (docs/course-spec.md §1.5).
  const bound = outline.forms.filter((f) => f.unit_id === unit.id && f.bound);
  // The course's cast, read off the lexicon rather than listed by hand. A
  // person's name is a proper noun the outline gave a gender to; the places got
  // none on purpose (migration 20260918000008), which is what tells them apart.
  //
  // This used to be a fixed line offering "Facu, Caro" as well. It was a lie the
  // writers believed: "facu" is taught in unit 18 and "caro" in unit 26, the
  // tokenizer does not care about the capital letter, and every sentence built
  // on either name died in the check as a word from a unit far away.
  const cast = available.filter((f) => f.pos === 'propn' && f.features?.gender).map((f) => f.form);
  const system = [
    'You write practice sentences for Che, a course in Argentine (rioplatense) Spanish for English speakers.',
    'Every sentence must be something a person in Buenos Aires would actually say this week, built only from the words listed as available. A word that is not listed does not exist for you — not even a common one, not another form of a listed verb.',
    cast.length ? `The people this course knows, free to use: ${cast.join(', ')}. No other name exists.` : '',
    '',
    style,
  ].join('\n');

  const user = [
    `Unit ${unit.course_order}: ${unit.title_en} (${unit.summary_en}). Grammar focus: ${unit.grammar_focus.join(', ')}. Highest register allowed: ${unit.register_max}.`,
    '',
    ...(isPracticeUnit(unit)
      ? [
          'This is a PRACTICE unit: it teaches no new words. The learner has met every target word already; the sentences are where she uses them again, mixed with each other and with what she learned before.',
          'Mix the tenses and forms she knows in the same sentence where it is natural — only ones the word list shows, since she has met nothing else — and let about a third of the sentences lean on older material from earlier units. Stay concrete and everyday.',
          'Every target still needs its sentences; an "intro" here is simply an easy one.',
          '',
        ]
      : []),
    'Words available (introduced in this unit are marked *):',
    ...available.map((f) => `${newHere.has(f.id) ? '* ' : '  '}${formLine(f, lemmaById.get(f.lemma_id)?.gloss_en)}`),
    '',
    examples.length ? 'Approved sentences from this part of the course, for the voice (do not repeat them):' : '',
    ...examples.map((e) => `- ${e.es} = ${e.en}`),
    '',
    existing.length ? 'Sentences this unit already has (do not repeat or paraphrase them):' : '',
    ...existing.map((e) => `- ${e}`),
    '',
    'Write, for each target word below:',
    `- ${QUOTA.intro * OVERGENERATE} "intro" sentences: at most 6 words, difficulty 1–2, where the word's meaning is obvious from context;`,
    `- ${QUOTA.drill * OVERGENERATE} "drill" sentences across difficulty 1–3 (1: ≤ 4 words, 2: ≤ 7, 3: ≤ 10), varied in shape: statements, questions, answers.`,
    'Write one sentence, not a chain of them. A second sentence is allowed only when the two are a real exchange — a question and its answer, "Soy Sofi. ¿Y vos?" — never a run of greetings ("Che, ¿sos vos? ¡Hola! ¿Todo bien?" is three sentences and is rejected). Three is never allowed below difficulty 4.',
    'Length is the whole sentence, every clause counted. Reaching a word count by stringing short pieces together makes the drill harder, not longer: a learner rebuilding it from tiles gets no punctuation to tell her where one piece ends.',
    'Each sentence must contain its target word exactly as written. Give the natural English an English speaker would say, and list any other natural English translations.',
    'Spell with every accent and with opening ¿ and ¡.',
    '',
    'Target words:',
    ...targets.map((f) => `- ${targetLabel(outline, unit, f)} (${f.pos}, "${f.gloss_en ?? lemmaById.get(f.lemma_id)?.gloss_en ?? ''}")`),
    ...(targets.some((f) => sameSpelling(outline, unit, f))
      ? ['A target written "word/lemma" (fue/ir, fue/ser) is that word in that verb\'s sense: put the label in "target" exactly as listed; the sentence itself just says the word.']
      : []),
    // A unit's proper nouns are never targets — nobody drills "Montevideo" as
    // vocabulary — so without this they are taught and then never said. Unit 5
    // introduced six places and its first draft used two of them.
    ...(bound.length
      ? [
          '',
          `Never write ${list(bound.map((f) => `"${f.form}"`))} on ${bound.length === 1 ? 'its' : 'their'} own.`,
          `${bound.length === 1 ? 'It is' : 'Each is'} only ever said inside the longer form above that ends in it — ${list(bound.slice(0, 3).map((f) => `"${chunkFor(outline, f)?.form ?? f.form}"`))}${bound.length > 3 ? ', and so on' : ''}. A sentence with the bare form in it is rejected.`,
        ]
      : []),
    ...(passengers.length
      ? [
          '',
          `This unit also introduces ${passengers.length === 1 ? 'a word' : 'words'} that nothing drills: ${passengers.map((f) => f.form).join(', ')}.`,
          'Spread them across the sentences above so each one is said at least once. They ride along in sentences aimed at the target words; do not write a sentence whose point is one of them.',
        ]
      : []),
  ]
    .filter((l, i, all) => !(l === '' && all[i - 1] === ''))
    .join('\n');
  return { system, user };
}

/**
 * Candidates as content the build can check: each one a sentence of its own,
 * run through exactly the gate hand-written content passes (vocabulary taught
 * by now, voseo, regionalisms, register, the English covering the Spanish,
 * accepted-answer generation).
 */
export function checkCandidates({ outline, unit, candidates, existingEs = [] }) {
  const taken = new Set(existingEs.map((e) => fold(e)));
  const out = [];
  candidates.forEach((c, i) => {
    const key = `c${i}`;
    const where = `candidate ${i + 1} "${c.es}"`;
    const problems = [];
    if (taken.has(fold(c.es))) problems.push('duplicates a sentence the course already has');
    const found = findTarget(outline, unit, c.target);
    const target = found.form ?? null;
    if (!target) {
      problems.push(
        found.ambiguous
          ? `target "${c.target}" is two words this unit teaches — write it as the prompt lists it ("word/lemma")`
          : `target "${c.target}" is not a word this unit introduces`,
      );
    }
    const built = buildContent(
      outline,
      {
        [unit.slug]: {
          sentences: {
            [key]: {
              es: c.es,
              en: c.en,
              en_alt: c.en_alt ?? [],
              target: target ? targetLabel(outline, unit, target) : c.target,
              difficulty: c.difficulty,
              loose: c.loose ?? [],
            },
          },
        },
      },
      { source: 'ai', status: 'draft' },
    );
    problems.push(...built.errors.map((e) => e.replace(/^[^:]*: /, '')));
    // The word band and the clause ceiling are checked inside buildContent now,
    // where hand-written content meets them too, so they arrive as problems.
    const words = c.es.split(/\s+/).filter(Boolean).length;
    const flags = [];
    if (c.role === 'intro' && words > 6) flags.push('intro longer than 6 words');
    const row = built.sentences[0] ?? null;
    if (!problems.length) taken.add(fold(c.es));
    out.push({ candidate: c, where, row, target, problems, flags, ok: problems.length === 0 && !!row });
  });
  return out;
}

/** The judge's rubric (§13.3), for the prompt. */
export const RUBRIC = [
  'naturalness: would a porteño actually say this, this way? (1–5)',
  'grammaticality: is the Spanish correct rioplatense grammar, voseo included? (1–5)',
  'coherence: does the sentence make sense on its own? (1–5)',
  'logic: is the English a faithful, natural translation? (1–5)',
  'porteno: yes/no — would someone in Buenos Aires say it this week',
  'register_ok: yes/no — right register for the unit',
  'english_natural: yes/no — the English is what an English speaker would say',
  'issue: one line naming the problem, or empty',
  'rewrite: a better version if any answer above is below 4 or no, else empty',
];

/**
 * Words the course leaves in Spanish in its English — `kiosco`, `mate`,
 * `cortado`: the lemma's gloss is the word itself and a note explains it.
 * A judge that doesn't know marks every English line with "kiosco" unnatural,
 * and a unit's articles went unsaid because every sentence with them did.
 */
export const keptInSpanish = (outline) =>
  outline.lemmas.filter((l) => !l.is_glue && l.pos !== 'propn' && fold(l.gloss_en ?? '') === fold(l.lemma)).map((l) => l.lemma);

export function judgePrompt({ unit, style, items, kept = [] }) {
  const system = [
    'You review practice sentences for a course in Argentine (rioplatense) Spanish, as a demanding native editor.',
    'You never approve anything; you score and flag. Be strict about naturalness: textbook Spanish that nobody in Buenos Aires would say scores low even when it is correct.',
    '',
    style,
  ].join('\n');
  const user = [
    `Unit: ${unit.title_en}. Grammar focus: ${unit.grammar_focus.join(', ')}. Highest register: ${unit.register_max}.`,
    '',
    'Score each sentence on:',
    ...RUBRIC.map((r) => `- ${r}`),
    '',
    ...(kept.length
      ? [`These words stay in Spanish in the English on purpose — the course explains them in a note, and "kiosco" is not a mistake for "kiosk": ${kept.join(', ')}. Don't mark the English down for them.`, '']
      : []),
    'Sentences:',
    ...items.map((it) => `${it.id}. ${it.es} = ${it.en}`),
  ].join('\n');
  return { system, user };
}

export const passes = (s) =>
  s &&
  s.naturalness >= MIN_SCORE &&
  s.grammaticality >= MIN_SCORE &&
  s.coherence >= MIN_SCORE &&
  s.logic >= MIN_SCORE &&
  s.porteno &&
  s.register_ok &&
  s.english_natural;

const total = (s) => s.naturalness + s.grammaticality + s.coherence + s.logic;

/**
 * Picks what ships from checked, scored candidates: for each target, the best
 * intro and the best drills, spread over difficulties where it can. Returns
 * the selected and the rejected, each with the reason.
 */
export function selectCandidates(checked, scores, quota = QUOTA) {
  const selected = [];
  const rejected = [];
  const byTarget = new Map();
  checked.forEach((c, i) => {
    if (!c.ok) return rejected.push({ ...c, reason: 'failed the checks' });
    const s = scores.get(i);
    if (!passes(s)) return rejected.push({ ...c, score: s, reason: s ? 'below the judge bar' : 'not scored' });
    const k = c.target.id;
    if (!byTarget.has(k)) byTarget.set(k, []);
    byTarget.get(k).push({ ...c, score: s, index: i });
  });
  for (const list of byTarget.values()) {
    const ranked = [...list].sort((a, b) => total(b.score) - total(a.score) || a.row.tokens.length - b.row.tokens.length);
    const intro = ranked.find((c) => c.candidate.role === 'intro');
    const chosen = new Set(intro ? [intro] : []);
    // Drills: best first, preferring a difficulty not yet covered.
    const drills = ranked.filter((c) => c !== intro);
    const seenDifficulty = new Set();
    for (const c of drills) {
      if ([...chosen].filter((x) => x !== intro).length >= quota.drill) break;
      if (!seenDifficulty.has(c.candidate.difficulty)) {
        chosen.add(c);
        seenDifficulty.add(c.candidate.difficulty);
      }
    }
    for (const c of drills) {
      if ([...chosen].filter((x) => x !== intro).length >= quota.drill) break;
      chosen.add(c);
    }
    for (const c of list) (chosen.has(c) ? selected : rejected).push(chosen.has(c) ? c : { ...c, reason: 'not selected' });
  }
  // Two candidates can come out as the same sentence once folded.
  const seen = new Set();
  return {
    selected: selected.filter((c) => (seen.has(c.row.id) ? false : seen.add(c.row.id))),
    rejected,
  };
}

/** The unit's drillable new forms, in outline order, as generation targets. */
/** A unit's targets: the words it teaches — or, for a practice unit, the
 *  earlier ones it reviews (`review_form_ids`). */
export const targetsFor = (outline, unit) =>
  isPracticeUnit(unit)
    ? (unit.review_form_ids ?? []).map((id) => outline.forms.find((f) => f.id === id)).filter(Boolean)
    : outline.forms.filter((f) => f.unit_id === unit.id && drillable(f));
export const isPracticeUnit = (unit) => (unit.review_form_ids ?? []).length > 0;
