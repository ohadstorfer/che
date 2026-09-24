#!/usr/bin/env node
// `supabase db push` for one migration, where only HTTPS gets out: runs the
// file through queryLinked (CHE_DB_VIA_API=1) in one transaction and records
// it in supabase_migrations.schema_migrations, as push would. Refuses a
// migration that is already recorded.
//
//   CHE_DB_VIA_API=1 npm run course:apply -- supabase/migrations/<ts>_<name>.sql
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

import { queryLinked } from './lib/db.mjs';
import { q } from './lib/sql.mjs';

const file = process.argv[2];
const m = file && /^(\d{14})_(.+)\.sql$/.exec(basename(file));
if (!m) {
  console.error('usage: npm run course:apply -- supabase/migrations/<timestamp>_<name>.sql');
  process.exit(1);
}
const [, version, name] = m;
const [done] = queryLinked(`select count(*)::int as n from supabase_migrations.schema_migrations where version = ${q(version)}`);
if (done.n) {
  console.error(`${version} is already applied`);
  process.exit(1);
}
const sql = readFileSync(file, 'utf8');
queryLinked(`begin;\n${sql}\n;insert into supabase_migrations.schema_migrations (version, name, statements) values (${q(version)}, ${q(name)}, array[${q(sql)}]);\ncommit;`);
console.log(`applied ${version}_${name}`);
