#!/usr/bin/env node
// Aligns every sentence's tokens with its English, so the app can show what a
// word means where it is used rather than a dictionary list (lib/gloss.mjs,
// src/lib/meanings.ts). Run it after new sentences are published; it picks up
// the ones that have no glosses yet.
//
// With Claude Code agents, like course:agent:
//   npm run course:gloss -- prompts [--all]
//       writes .course-work/gloss/batch-N.prompt.md and prints the agent task
//   (an agent per batch → batch-N.json)
//   npm run course:gloss -- apply [--dry-run]
//       checks every gloss against its English and writes the tokens
//
// With the API, in one go:
//   npm run course:gloss -- api [--all] [--dry-run]
//
// `--all` re-aligns sentences that already have glosses.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

import { queryLinked } from './lib/db.mjs';
import { GLOSS_SCHEMA, SENTENCES_PER_REQUEST, applyGlosses, glossPrompt, isGlossed } from './lib/gloss.mjs';
import { jsonb, q } from './lib/sql.mjs';

const [stage, ...args] = process.argv.slice(2);
const flags = new Set(args);
if (!['prompts', 'apply', 'api'].includes(stage)) {
  console.error('usage: course:gloss -- prompts [--all] | apply [--dry-run] | api [--all] [--dry-run]');
  process.exit(1);
}

const dir = new URL('../../.course-work/gloss/', import.meta.url).pathname;
const file = (name) => dir + name;

const loadSentences = () =>
  queryLinked(`select id, es, en, tokens from public.sentences where status <> 'retired' order by unit_id, es`);

function loadForms() {
  const rows = queryLinked('select id, form, lemma, pos, is_glue from public.form_entries');
  return new Map(rows.map((f) => [f.id, f]));
}

const batchesOf = (sentences) => {
  const out = [];
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_REQUEST) out.push(sentences.slice(i, i + SENTENCES_PER_REQUEST));
  return out;
};

const pending = (sentences) => (flags.has('--all') ? sentences : sentences.filter((s) => !isGlossed(s)));

/** The tokens' shape without glosses: what must not have changed since the prompt. */
const shape = (s) => JSON.stringify([s.es, s.en, s.tokens.map((t) => [t.surface, t.form_ids])]);

/**
 * Checks each answer against its sentence as it is now, and writes the tokens
 * of the ones that pass. A sentence edited since it was sent is skipped: its
 * glosses were for different words.
 */
function apply(sent, answers) {
  const live = new Map(loadSentences().map((s) => [s.id, s]));
  const writes = [];
  const report = { glossed: 0, tokens: 0, skipped: [], problems: [] };
  for (const s of sent) {
    const answer = answers.get(s.id);
    if (!answer) continue;
    const now = live.get(s.id);
    if (!now || shape(now) !== shape(s)) {
      report.skipped.push(`${s.es} — changed since it was sent`);
      continue;
    }
    const { tokens, problems } = applyGlosses(now, answer);
    report.problems.push(...problems.map((p) => `${s.es}: ${p}`));
    report.glossed++;
    report.tokens += tokens.filter((t) => t.gloss).length;
    writes.push(`update public.sentences set tokens = ${jsonb(tokens)} where id = ${q(s.id)};`);
  }

  console.log(`${report.glossed} sentence(s), ${report.tokens} token(s) glossed`);
  if (report.skipped.length) console.log(`\nSkipped:\n${report.skipped.map((x) => `  ${x}`).join('\n')}`);
  if (report.problems.length) {
    console.log(`\nDropped (not in the English):\n${report.problems.map((x) => `  ${x}`).join('\n')}`);
  }
  if (flags.has('--dry-run')) {
    console.log('\n--dry-run: nothing written');
    return;
  }
  if (writes.length) queryLinked(writes.join('\n'));
  console.log('\nwritten');
}

if (stage === 'prompts') {
  const sentences = pending(loadSentences());
  const formById = loadForms();
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  writeFileSync(file('sentences.json'), JSON.stringify(sentences));
  const batches = batchesOf(sentences);
  batches.forEach((batch, n) => {
    const { system, user } = glossPrompt({ sentences: batch, formById });
    writeFileSync(file(`batch-${n}.prompt.md`), `# SYSTEM\n${system}\n\n# TASK\n${user}\n\n${GLOSS_SCHEMA}\n`);
  });
  console.log(`${sentences.length} sentence(s) to gloss, ${batches.length} batch(es)\n`);
  if (batches.length) {
    console.log('Agent task, one per batch N:');
    console.log(`  Read ${file('batch-N.prompt.md')} in full: "# SYSTEM" is your role, "# TASK" the job. Write the JSON to ${file('batch-N.json')} and check it parses.`);
    console.log('\nThen: npm run course:gloss -- apply --dry-run');
  }
} else if (stage === 'apply') {
  if (!existsSync(file('sentences.json'))) {
    console.error('nothing to apply — run `course:gloss -- prompts` first');
    process.exit(1);
  }
  const sent = JSON.parse(readFileSync(file('sentences.json'), 'utf8'));
  const answers = new Map();
  for (const name of readdirSync(dir).filter((n) => /^batch-\d+\.json$/.test(n))) {
    for (const s of JSON.parse(readFileSync(file(name), 'utf8')).sentences ?? []) answers.set(s.id, s);
  }
  const missing = sent.filter((s) => !answers.has(s.id)).length;
  if (missing) console.log(`${missing} sentence(s) have no answer yet\n`);
  apply(sent, answers);
} else {
  const { glossSentences } = await import('./lib/llm.mjs');
  const sentences = pending(loadSentences());
  const formById = loadForms();
  const answers = new Map();
  for (const [n, batch] of batchesOf(sentences).entries()) {
    const { sentences: out, usage } = await glossSentences(glossPrompt({ sentences: batch, formById }));
    for (const s of out) answers.set(s.id, s);
    console.log(`batch ${n}: ${out.length} sentence(s), ${usage.input_tokens} in / ${usage.output_tokens} out`);
  }
  apply(sentences, answers);
}
