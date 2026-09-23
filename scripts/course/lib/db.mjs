// The linked Supabase project, from scripts. Supabase CLI v2 reaches the remote
// database without a password (it initialises a login role from the signed-in
// account), so no service key lives on this machine.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * The login role is a temporary one, and several scripts starting at once can
 * trip over each other's: the connection is refused before any SQL runs, so
 * trying again is safe.
 */
const LOGIN_RETRIES = 4;
const refusedLogin = (err) => /failed to connect as temp role|password authentication failed/.test(`${err.stdout ?? ''}${err.message}`);
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/** Runs `sql` against the linked project and returns the rows of its result. */
export function queryLinked(sql) {
  const dir = mkdtempSync(join(tmpdir(), 'che-course-'));
  const file = join(dir, 'q.sql');
  writeFileSync(file, sql);
  let stdout;
  for (let attempt = 0; ; attempt++) {
    try {
      stdout = execFileSync('npx', ['--yes', 'supabase@2', 'db', 'query', '--linked', '-f', file, '--output-format', 'json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
        maxBuffer: 512 * 1024 * 1024,
      });
      break;
    } catch (err) {
      if (attempt >= LOGIN_RETRIES || !refusedLogin(err)) throw err;
      sleep(2000 * (attempt + 1));
    }
  }
  const start = stdout.search(/[[{]/);
  if (start < 0) return [];
  const parsed = JSON.parse(stdout.slice(start));
  return Array.isArray(parsed) ? parsed : (parsed.rows ?? parsed.result ?? []);
}
