// The linked Supabase project, from scripts. Supabase CLI v2 reaches the remote
// database without a password (it initialises a login role from the signed-in
// account), so no service key lives on this machine.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Runs `sql` against the linked project and returns the rows of its result. */
export function queryLinked(sql) {
  const dir = mkdtempSync(join(tmpdir(), 'che-course-'));
  const file = join(dir, 'q.sql');
  writeFileSync(file, sql);
  const stdout = execFileSync('npx', ['--yes', 'supabase@2', 'db', 'query', '--linked', '-f', file, '--output-format', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
    maxBuffer: 512 * 1024 * 1024,
  });
  const start = stdout.search(/[[{]/);
  if (start < 0) return [];
  const parsed = JSON.parse(stdout.slice(start));
  return Array.isArray(parsed) ? parsed : (parsed.rows ?? parsed.result ?? []);
}
