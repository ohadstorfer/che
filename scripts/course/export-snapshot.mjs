#!/usr/bin/env node
// Snapshots the whole course from the database into the repo (docs/course-spec
// §4): content/snapshots/<date>/<table>.json. The database is now; the repo is
// history.
//
//   npm run course:snapshot
import { mkdirSync, writeFileSync } from 'node:fs';

import { queryLinked } from './lib/db.mjs';

export const SNAPSHOT_TABLES = [
  'sections', 'units', 'lessons', 'tips', 'lemmas', 'forms', 'sentences', 'lesson_slots', 'story_lines', 'unit_phrases',
];
const date = new Date().toISOString().slice(0, 10);
const dir = new URL(`../../content/snapshots/${date}/`, import.meta.url);
mkdirSync(dir, { recursive: true });
for (const table of SNAPSHOT_TABLES) {
  const rows = queryLinked(`select * from public.${table} order by 1`);
  writeFileSync(new URL(`${table}.json`, dir), `${JSON.stringify(rows, null, 1)}\n`);
  console.log(`${table.padEnd(14)} ${rows.length}`);
}
console.log(`\nwrote content/snapshots/${date}/`);
