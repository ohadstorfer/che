// SQL literals and upserts for the scripts that write content: the seed
// migration, snapshots, and the generation pipeline. Values are escaped here and
// nowhere else.

export const q = (v) => {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return `'${String(v).replace(/'/g, "''")}'`;
};
export const jsonb = (v) => `${q(JSON.stringify(v))}::jsonb`;
export const textArray = (a) => (a?.length ? `array[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`);

/** One multi-row upsert. `cast` maps a column to its SQL literal writer. */
export function upsert(table, rows, columns, cast = {}, conflict = 'id') {
  if (rows.length === 0) return '';
  const values = rows
    .map((r) => `  (${columns.map((c) => (cast[c] ? cast[c](r[c]) : q(r[c]))).join(', ')})`)
    .join(',\n');
  const updates = columns
    .filter((c) => !conflict.split(',').map((x) => x.trim()).includes(c))
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\non conflict (${conflict}) do update set ${updates};\n`;
}

export const SENTENCE_COLUMNS = [
  'id', 'unit_id', 'es', 'en', 'en_alt', 'es_alt', 'tokens', 'target_form_id', 'kind', 'difficulty',
  'source', 'attribution', 'audio_path', 'status',
];
export const SENTENCE_CAST = { en_alt: textArray, es_alt: textArray, tokens: jsonb };

/** One multi-row insert that leaves every row already there as it is. */
export function insertNew(table, rows, columns, cast = {}) {
  if (rows.length === 0) return '';
  const values = rows
    .map((r) => `  (${columns.map((c) => (cast[c] ? cast[c](r[c]) : q(r[c]))).join(', ')})`)
    .join(',\n');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\non conflict do nothing;\n`;
}
