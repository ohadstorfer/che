// What the pipeline scripts share: the outline for a unit, its rows in the
// database, and the writes — sentences upserted by id, review rows appended.
//
// The outline comes from the database, not the YAML: words fixed or added in
// the admin are what every script sees (docs/superplan-admin-palabras.md §7.2).
import { queryLinked } from './db.mjs';
import { SENTENCE_CAST, SENTENCE_COLUMNS, jsonb, q, upsert } from './sql.mjs';
import { loadOutlineFromDb } from './vocabulary.mjs';

export function unitFromArgs(argv = process.argv.slice(2)) {
  const slug = argv.find((a) => !a.startsWith('--'));
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const outline = loadOutlineFromDb();
  const unit = outline.units.find((u) => u.slug === slug);
  if (!unit) {
    throw new Error(`usage: <unit-slug> — one of:\n${outline.units.map((u) => `  ${u.slug}`).join('\n')}`);
  }
  return { outline, unit, flags };
}

export const sentencesOfUnits = (unitIds, statuses) =>
  queryLinked(
    `select id, unit_id, es, en, en_alt, es_alt, tokens, target_form_id, kind, difficulty, source, status, audio_path
     from public.sentences where unit_id in (${unitIds.map(q).join(', ')})
     ${statuses ? `and status in (${statuses.map(q).join(', ')})` : ''}`,
  );

export function writeSentences(rows) {
  if (!rows.length) return;
  queryLinked(upsert('sentences', rows, SENTENCE_COLUMNS, SENTENCE_CAST));
}

/**
 * Writes what selectCandidates picked: the selected as `status`, the rest as
 * `retired` with the reason, so the prompts can be tuned. Sentences the course
 * already has (`known`) are left alone.
 */
export function saveCandidates({ selected, rejected, known, model, status }) {
  const selectedIds = new Set(selected.map((s) => s.row.id));
  const takenIds = new Set(known.map((s) => s.id));
  const fresh = selected.filter((s) => !takenIds.has(s.row.id));
  const keep = fresh.map((s) => ({ ...s.row, status }));
  const drop = rejected
    .filter((r) => r.row && !selectedIds.has(r.row.id) && !takenIds.has(r.row.id))
    .filter((r, i, all) => all.findIndex((x) => x.row.id === r.row.id) === i)
    .map((r) => ({ ...r.row, status: 'retired' }));
  writeSentences([...keep, ...drop]);
  writeReviews([
    ...fresh.flatMap((s) => [
      { row_id: s.row.id, stage: 'lint', verdict: s.flags.length ? 'flag' : 'pass', notes: { flags: s.flags, prompt_hash: s.hash, model, role: s.candidate.role } },
      { row_id: s.row.id, stage: 'ai', verdict: 'pass', notes: { scores: s.score, model } },
    ]),
    ...rejected
      .filter((r) => r.row && drop.some((d) => d.id === r.row.id))
      .map((r) => ({
        row_id: r.row.id,
        stage: r.problems.length ? 'lint' : 'ai',
        verdict: 'fail',
        notes: { reason: r.reason, problems: r.problems, scores: r.score ?? null, prompt_hash: r.hash, model },
      })),
  ]);
  return { kept: keep.length, dropped: drop.length };
}

/**
 * What the dashboard's Publish does (src/lib/admin.ts publishUnit), from a
 * script: the unit, its lessons and tips, the forms and lemmas it introduces,
 * and its section. Retired rows stay retired — a lesson the outline dropped
 * must not come back onto the path.
 */
export function publishUnit(unitId) {
  const live = `status not in ('published', 'retired')`;
  queryLinked(`
    update public.units set status = 'published' where id = ${q(unitId)};
    update public.lessons set status = 'published' where unit_id = ${q(unitId)} and ${live};
    update public.tips set status = 'published' where unit_id = ${q(unitId)} and ${live};
    update public.lemmas set status = 'published'
      where id in (select lemma_id from public.forms where unit_id = ${q(unitId)} and status <> 'retired') and ${live};
    update public.forms set status = 'published' where unit_id = ${q(unitId)} and ${live};
    update public.sections set status = 'published' where id = (select section_id from public.units where id = ${q(unitId)});
  `);
}

/** content_reviews rows: {row_id, stage, verdict, notes}. */
export function writeReviews(entries) {
  if (!entries.length) return;
  const values = entries
    .map((e) => `('sentences', ${q(e.row_id)}, ${q(e.stage)}, ${q(e.verdict)}, ${jsonb(e.notes ?? {})})`)
    .join(',\n');
  queryLinked(`insert into public.content_reviews (table_name, row_id, stage, verdict, notes) values\n${values};`);
}
