#!/usr/bin/env node
// Where the YAML outline and the database differ. Right after the switch to the
// database as the source of truth they must match exactly; once words are
// edited in the admin, the differences listed are those edits.
//
//   npm run course:parity
import { loadOutline } from './lib/outline.mjs';
import { describeDiff } from './lib/seed.mjs';
import { diffOutlines, loadOutlineFromDb } from './lib/vocabulary.mjs';

const { outline, errors } = loadOutline();
if (errors.length) {
  console.error(`outline:\n${errors.join('\n')}`);
  process.exit(1);
}
const db = loadOutlineFromDb();
const diff = diffOutlines(outline, db);
const lines = describeDiff(diff);
console.log(`YAML: ${outline.units.length} units, ${outline.forms.length} forms · database: ${db.units.length} units, ${db.forms.length} forms`);
for (const a of diff.added) console.log(`  only in the YAML: ${a.kind.replace(/s$/, '')} ${a.label}`);
for (const m of diff.missing) console.log(`  only in the database: ${m.kind.replace(/s$/, '')} ${m.label}`);
for (const l of lines) console.log(`  ${l}`);
const total = diff.added.length + diff.missing.length + lines.length;
console.log(total ? `\n${total} difference(s)` : '\nidentical');
process.exit(total ? 1 : 0);
