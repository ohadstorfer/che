// The linked Supabase project, from scripts. Supabase CLI v2 reaches the remote
// database without a password (it initialises a login role from the signed-in
// account), so no service key lives on this machine.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
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

/**
 * Where only HTTPS gets out (a cloud container), the CLI can't open its
 * Postgres connection. With CHE_DB_VIA_API=1 the SQL goes to the Management
 * API's query endpoint instead, with the same SUPABASE_ACCESS_TOKEN the CLI
 * signs in with.
 */
const PROJECT_REF = 'qbzjaseetusewxnfgpes';
function queryViaApi(file) {
  const body = join(file, '..', 'body.json');
  writeFileSync(body, JSON.stringify({ query: readFileSync(file, 'utf8') }));
  const out = execFileSync(
    'curl',
    ['-sS', '--fail-with-body', '--retry', '4', '--retry-connrefused', '-X', 'POST', `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
      '-H', `Authorization: Bearer ${process.env.SUPABASE_ACCESS_TOKEN}`, '-H', 'Content-Type: application/json', '--data-binary', `@${body}`],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 512 * 1024 * 1024 },
  );
  const parsed = out.trim() ? JSON.parse(out) : [];
  return Array.isArray(parsed) ? parsed : [];
}

/** Runs `sql` against the linked project and returns the rows of its result. */
export function queryLinked(sql) {
  const dir = mkdtempSync(join(tmpdir(), 'che-course-'));
  const file = join(dir, 'q.sql');
  writeFileSync(file, sql);
  if (process.env.CHE_DB_VIA_API === '1') {
    try {
      return queryViaApi(file);
    } catch (err) {
      throw new Error(`query failed: ${err.stdout || err.message}`);
    }
  }
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
