#!/usr/bin/env node
// Other right answers, drafted by a model and checked before they are stored
// (lib/alternatives.mjs): answers for words typed on their own, by meaning, in
// `form_answers`; other ways to build a sentence from its tiles, in `es_alt`.
// Everything asked is logged in content_reviews, so a run only asks about words
// with a meaning not asked about before and sentences whose text changed.
//
// With Claude Code agents, like course:agent:
//   npm run course:answers -- prompts [--all]
//       writes .course-work/answers/{words,sentences}-N.prompt.md and prints the agent task
//   (an agent per prompt → the same name with .json)
//   npm run course:answers -- apply [--dry-run]
//
// With the API, in one go:
//   npm run course:answers -- api [--all] [--dry-run]
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

import { withMeanings } from '../../src/lib/meanings.ts';
import {
  FORMS_PER_REQUEST,
  SENTENCES_PER_REQUEST,
  SENTENCES_SCHEMA,
  WORDS_SCHEMA,
  candidateMeanings,
  checkSentenceAlternatives,
  checkWordAnswers,
  sentencesPrompt,
  wordsPrompt,
} from './lib/alternatives.mjs';
import { queryLinked } from './lib/db.mjs';
import { styleSpec } from './lib/generate.mjs';
import { senseKey } from '../../src/lib/answers.ts';
import { jsonb, q, textArray } from './lib/sql.mjs';

const [stage, ...args] = process.argv.slice(2);
const flags = new Set(args);
if (!['prompts', 'apply', 'api'].includes(stage)) {
  console.error('usage: course:answers -- prompts [--all] | apply [--dry-run] | api [--all] [--dry-run]');
  process.exit(1);
}

const dir = new URL('../../.course-work/answers/', import.meta.url).pathname;
const file = (name) => dir + name;
const MODEL = stage === 'api' ? 'api' : 'claude-code-agent';

/** The course as it is now: drillable forms with their stored answers, sentences, and what was asked before. */
function loadCourse() {
  const forms = queryLinked(
    `select id, lemma_id, lemma, form, pos, features, gloss_en, gloss_note_en, unit_order, is_glue, alt
     from public.form_entries where status = 'published' and not is_glue and pos <> 'propn'`,
  );
  // Before the migration there is nowhere to store answers, but drafting and a
  // dry run can still go ahead as if none were stored yet.
  const ready = queryLinked(`select to_regclass('public.form_answers') is not null as ready`)[0]?.ready;
  if (!ready && stage !== 'prompts' && !flags.has('--dry-run')) {
    console.error('public.form_answers does not exist yet — apply migration 20260918000004_form_answers.sql (npm run db:push) first');
    process.exit(1);
  }
  const answers = ready ? queryLinked(`select form_id, meaning, answer from public.form_answers where status = 'published'`) : [];
  const sentences = queryLinked(
    `select id, es, en, es_alt, tokens, target_form_id from public.sentences where status <> 'retired' order by unit_id, es`,
  );
  const asked = queryLinked(
    `select row_id, notes from public.content_reviews
     where stage = 'ai' and notes->>'kind' in ('answers', 'alternatives') order by created_at`,
  );
  const accepts = new Map();
  for (const a of answers) accepts.set(a.form_id, [...(accepts.get(a.form_id) ?? []), { meaning: a.meaning, answer: a.answer }]);
  const withAnswers = forms.map((f) => ({ ...f, accepts: accepts.get(f.id) ?? [] }));
  const deck = withMeanings(withAnswers, sentences);
  const lastAsked = new Map(asked.map((r) => [r.row_id, r.notes]));
  return { forms: deck, sentences, lastAsked };
}

function pending({ forms, sentences, lastAsked }) {
  const all = flags.has('--all');
  const words = forms
    .map((f) => ({ ...f, meanings: candidateMeanings(f, sentences) }))
    .filter((f) => {
      if (all) return true;
      const before = new Set((lastAsked.get(f.id)?.meanings ?? []).map(senseKey));
      return f.meanings.some((m) => !before.has(senseKey(m)));
    });
  const lines = sentences.filter((s) => {
    if (all) return true;
    const before = lastAsked.get(s.id);
    return !before || before.es !== s.es || before.en !== s.en;
  });
  return { words, lines };
}

const chunks = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

const asFile = ({ system, user }, schema) => `# SYSTEM\n${system}\n\n# TASK\n${user}\n\n${schema}\n`;

/** Checks the proposals against the course as it is now and writes what passes. */
function apply(sent, proposals) {
  const course = loadCourse();
  const formById = new Map(course.forms.map((f) => [f.id, f]));
  const sentenceById = new Map(course.sentences.map((s) => [s.id, s]));
  const inserts = [];
  const updates = [];
  const reviews = [];
  const report = { answers: [], alternatives: [], problems: [], skipped: [] };

  for (const w of sent.words) {
    const proposed = proposals.words.get(w.id);
    const form = formById.get(w.id);
    if (!proposed || !form) continue;
    // Checked answer by answer against what is stored so far, so two proposals
    // that say the same thing are stored once.
    const { rows, problems, skipped } = checkWordAnswers({ form, meanings: w.meanings, proposed, deck: course.forms });
    inserts.push(...rows);
    report.answers.push(...rows.map((r) => `${form.form} "${r.meaning}" → ${r.answer}`));
    report.problems.push(...problems);
    report.skipped.push(...skipped);
    reviews.push({ row_id: w.id, table: 'forms', notes: { kind: 'answers', meanings: w.meanings, added: rows, problems, model: MODEL } });
  }

  for (const s of sent.lines) {
    const proposed = proposals.sentences.get(s.id);
    const now = sentenceById.get(s.id);
    if (!proposed) continue;
    if (!now || now.es !== s.es || now.en !== s.en) {
      report.skipped.push(`${s.es}: changed since it was sent`);
      continue;
    }
    const { es_alt, added, problems } = checkSentenceAlternatives({ sentence: now, proposed });
    if (added.length) updates.push(`update public.sentences set es_alt = ${textArray(es_alt)} where id = ${q(s.id)};`);
    report.alternatives.push(...added.map((a) => `${s.es} → ${a}`));
    report.problems.push(...problems);
    reviews.push({ row_id: s.id, table: 'sentences', notes: { kind: 'alternatives', es: s.es, en: s.en, added, problems, model: MODEL } });
  }

  const list = (title, items) => items.length && console.log(`\n${title}:\n${items.map((x) => `  ${x}`).join('\n')}`);
  console.log(`${report.answers.length} word answer(s), ${report.alternatives.length} sentence alternative(s)`);
  list('Word answers', report.answers);
  list('Sentence alternatives', report.alternatives);
  list('Not stored', report.problems);
  list('Already accepted or skipped', report.skipped);
  if (flags.has('--dry-run')) {
    console.log('\n--dry-run: nothing written');
    return;
  }
  const sql = [
    ...(inserts.length
      ? [
          `insert into public.form_answers (form_id, meaning, answer, source) values\n${inserts
            .map((r) => `  (${q(r.form_id)}, ${q(r.meaning)}, ${q(r.answer)}, 'generated')`)
            .join(',\n')}\non conflict do nothing;`,
        ]
      : []),
    ...updates,
    ...(reviews.length
      ? [
          `insert into public.content_reviews (table_name, row_id, stage, verdict, notes) values\n${reviews
            .map((r) => `  (${q(r.table)}, ${q(r.row_id)}, 'ai', 'pass', ${jsonb(r.notes)})`)
            .join(',\n')};`,
        ]
      : []),
  ];
  if (sql.length) queryLinked(sql.join('\n'));
  console.log('\nwritten');
}

const style = styleSpec();

if (stage === 'prompts') {
  const { words, lines } = pending(loadCourse());
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(file('sent.json'), JSON.stringify({ words: words.map(({ id, meanings }) => ({ id, meanings })), lines }));
  const wordBatches = chunks(words, FORMS_PER_REQUEST);
  const lineBatches = chunks(lines, SENTENCES_PER_REQUEST);
  wordBatches.forEach((b, n) => writeFileSync(file(`words-${n}.prompt.md`), asFile(wordsPrompt({ forms: b, style }), WORDS_SCHEMA)));
  lineBatches.forEach((b, n) =>
    writeFileSync(file(`sentences-${n}.prompt.md`), asFile(sentencesPrompt({ sentences: b, style }), SENTENCES_SCHEMA)),
  );
  console.log(`${words.length} word(s) in ${wordBatches.length} batch(es), ${lines.length} sentence(s) in ${lineBatches.length} batch(es)\n`);
  if (wordBatches.length + lineBatches.length) {
    console.log('Agent task, one per prompt file:');
    console.log(`  Read ${file('<name>.prompt.md')} in full: "# SYSTEM" is your role and style guide, "# TASK" the job. Write the JSON to ${file('<name>.json')} and check it parses.`);
    console.log('\nThen: npm run course:answers -- apply --dry-run');
  }
} else if (stage === 'apply') {
  if (!existsSync(file('sent.json'))) {
    console.error('nothing to apply — run `course:answers -- prompts` first');
    process.exit(1);
  }
  const sent = JSON.parse(readFileSync(file('sent.json'), 'utf8'));
  const proposals = { words: new Map(), sentences: new Map() };
  for (const name of readdirSync(dir).filter((n) => /^(words|sentences)-\d+\.json$/.test(n))) {
    const out = JSON.parse(readFileSync(file(name), 'utf8'));
    for (const f of out.forms ?? []) proposals.words.set(f.id, f.answers ?? []);
    for (const s of out.sentences ?? []) proposals.sentences.set(s.id, s.alternatives ?? []);
  }
  apply(sent, proposals);
} else {
  const { proposeSentenceAlternatives, proposeWordAnswers } = await import('./lib/llm.mjs');
  const { words, lines } = pending(loadCourse());
  const proposals = { words: new Map(), sentences: new Map() };
  for (const b of chunks(words, FORMS_PER_REQUEST)) {
    const { forms } = await proposeWordAnswers(wordsPrompt({ forms: b, style }));
    for (const f of forms) proposals.words.set(f.id, f.answers);
  }
  for (const b of chunks(lines, SENTENCES_PER_REQUEST)) {
    const { sentences } = await proposeSentenceAlternatives(sentencesPrompt({ sentences: b, style }));
    for (const s of sentences) proposals.sentences.set(s.id, s.alternatives);
  }
  apply({ words: words.map(({ id, meanings }) => ({ id, meanings })), lines }, proposals);
}
