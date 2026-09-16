// Where the engine scripts read their rows from: the linked project (Supabase
// CLI v2, which reaches it without a password — see the project's notes), or a
// JSON file exported earlier, for working offline.
import { readFileSync } from 'node:fs';

import { queryLinked } from '../../course/lib/db.mjs';

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { from: null, since: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--from') out.from = argv[++i];
    else if (argv[i] === '--since') out.since = argv[++i];
  }
  return out;
}

/** `name` rows: from `--from <file>.json` (an object of arrays) or the project. */
export function rows(name, sql, args) {
  if (args.from) {
    const data = JSON.parse(readFileSync(args.from, 'utf8'));
    return data[name] ?? [];
  }
  return queryLinked(sql);
}
