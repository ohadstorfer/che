#!/usr/bin/env node
// Restores a snapshot into the database: every row upserted by its id, in
// dependency order. Nothing is deleted; rows the snapshot doesn't have stay as
// they are. Asks for --yes, since it overwrites whatever reviewers changed since.
//
//   npm run course:restore -- <date> --yes
import { existsSync, readFileSync } from 'node:fs';

import { queryLinked } from './lib/db.mjs';
import { jsonb, textArray, upsert } from './lib/sql.mjs';

const [date] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!date || !process.argv.includes('--yes')) {
  console.error('usage: npm run course:restore -- <YYYY-MM-DD> --yes   (overwrites content with the snapshot)');
  process.exit(1);
}
const ORDER = [
  // Speakers first: forms and sentences reference them.
  ['voices', 'id'],
  ['sections', 'id'], ['units', 'id'], ['lessons', 'id'], ['tips', 'id'], ['lemmas', 'id'], ['forms', 'id'],
  ['sentences', 'id'], ['lesson_slots', 'id'], ['story_lines', 'id'], ['unit_phrases', 'unit_id, ordinal'],
];
const ARRAYS = new Set(['en_alt', 'es_alt', 'grammar_focus', 'alt']);
const JSON_COLS = new Set(['tokens', 'features', 'question']);
const SKIP = new Set(['updated_at', 'created_at']);

let sql = 'update public.units set ordinal = ordinal + 1000, course_order = course_order + 1000;\nupdate public.lessons set ordinal = -ordinal where ordinal > 0;\n';
for (const [table, conflict] of ORDER) {
  // A snapshot taken before a table existed simply has no file for it; the
  // rest of the restore is still good.
  const file = new URL(`../../content/snapshots/${date}/${table}.json`, import.meta.url);
  if (!existsSync(file)) {
    console.log(`${table.padEnd(14)} — not in this snapshot`);
    continue;
  }
  const rows = JSON.parse(readFileSync(file, 'utf8'));
  if (!rows.length) continue;
  const columns = Object.keys(rows[0]).filter((c) => !SKIP.has(c));
  const cast = Object.fromEntries(columns.flatMap((c) => (ARRAYS.has(c) ? [[c, textArray]] : JSON_COLS.has(c) ? [[c, (v) => (v == null ? 'null' : jsonb(v))]] : [])));
  sql += upsert(table, rows, columns, cast, conflict);
  console.log(`${table.padEnd(14)} ${rows.length}`);
}
sql += `with parked as (select id, row_number() over (partition by unit_id order by id) as n from public.lessons where ordinal <= 0)
update public.lessons l set ordinal = 20000 + parked.n from parked where l.id = parked.id;\n`;
queryLinked(sql);
console.log(`\nrestored content/snapshots/${date}/`);
