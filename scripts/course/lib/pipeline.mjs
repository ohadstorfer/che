// What the pipeline scripts share: the outline for a unit, its rows in the
// database, and the writes — sentences upserted by id, review rows appended.
import { queryLinked } from './db.mjs';
import { loadOutline } from './outline.mjs';
import { SENTENCE_CAST, SENTENCE_COLUMNS, jsonb, q, upsert } from './sql.mjs';

export function unitFromArgs(argv = process.argv.slice(2)) {
  const slug = argv.find((a) => !a.startsWith('--'));
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const { outline, errors } = loadOutline();
  if (errors.length) throw new Error(`outline:\n${errors.join('\n')}`);
  const unit = outline.units.find((u) => u.slug === slug);
  if (!unit) {
    throw new Error(`usage: <unit-slug> — one of:\n${outline.units.map((u) => `  ${u.slug}`).join('\n')}`);
  }
  return { outline, unit, flags };
}

export const sentencesOfUnits = (unitIds, statuses) =>
  queryLinked(
    `select id, unit_id, es, en, en_alt, es_alt, tokens, target_form_id, kind, difficulty, source, status
     from public.sentences where unit_id in (${unitIds.map(q).join(', ')})
     ${statuses ? `and status in (${statuses.map(q).join(', ')})` : ''}`,
  );

export function writeSentences(rows) {
  if (!rows.length) return;
  queryLinked(upsert('sentences', rows, SENTENCE_COLUMNS, SENTENCE_CAST));
}

/** content_reviews rows: {row_id, stage, verdict, notes}. */
export function writeReviews(entries) {
  if (!entries.length) return;
  const values = entries
    .map((e) => `('sentences', ${q(e.row_id)}, ${q(e.stage)}, ${q(e.verdict)}, ${jsonb(e.notes ?? {})})`)
    .join(',\n');
  queryLinked(`insert into public.content_reviews (table_name, row_id, stage, verdict, notes) values\n${values};`);
}
