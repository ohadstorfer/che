process.on('unhandledRejection', (e) => { console.error('FAILED:', e.message, e.where ?? '', e.detail ?? '', e.hint ?? ''); process.exit(1); });
// The feedback chat's schema (migrations/20261014000002_feedback.sql) on a
// real Postgres (PGlite), with stand-ins for auth and storage: who may write
// into which thread, who is kept as a tester when the switch changes, and the
// unread counts on both sides.
//
//   npm run feedback:test
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const MIG = new URL('../migrations', import.meta.url).pathname;
const db = new PGlite();
const ok = (m) => console.log('  ✔', m);

await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, is_anonymous boolean default false);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
  create function auth.role() returns text language sql stable as
    $$ select coalesce(nullif(current_setting('test.role', true), ''), 'authenticated') $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated, service_role;
`);
await db.exec(readFileSync(`${MIG}/20260427000001_init.sql`, 'utf8').replace(/create extension[^;]*;/i, ''));
await db.exec(readFileSync(`${MIG}/20260913000001_course_schema.sql`, 'utf8'));
await db.exec(readFileSync(`${MIG}/20261014000002_feedback.sql`, 'utf8'));
ok('feedback migration applies');
await db.exec(`
  grant select, insert, update, delete on all tables in schema public to anon, authenticated;
  grant select, insert on storage.objects to authenticated;
  grant execute on all functions in schema public to anon, authenticated;
`);

const ana = '11111111-1111-4111-8111-111111111111';
const beto = '22222222-2222-4222-8222-222222222222';
const late = '33333333-3333-4333-8333-333333333333';
const admin = '44444444-4444-4444-8444-444444444444';
await db.exec(`
  insert into auth.users (id, email, is_anonymous) values
    ('${ana}', 'ana@example.com', false), ('${beto}', null, true),
    ('${late}', 'late@example.com', false), ('${admin}', 'admin@example.com', false);
  insert into profiles (user_id, display_name) values ('${ana}', 'Ana'), ('${admin}', 'Admin');
  update profiles set role = 'admin' where user_id = '${admin}';
`);

async function as(uid, fn) {
  await db.exec(
    uid
      ? `set role authenticated; select set_config('test.uid', '${uid}', false);`
      : `set role anon; select set_config('test.uid', '', false);`,
  );
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('test.uid', '', false);`);
  }
}
const one = async (sql) => (await db.query(sql)).rows[0];
const access = (uid) => as(uid, () => one(`select feedback_access() as a`)).then((r) => r.a);
const say = (uid, thread, body, extra = '') =>
  as(uid, () => db.exec(`insert into feedback_messages (user_id, body${extra ? ', from_staff' : ''}) values ('${thread}', '${body}'${extra})`));

// --- everyone ------------------------------------------------------------------
assert.deepEqual(await access(null), { open: true, unread: 0 });
ok('before there is an account, the bubble is open while the switch says everyone');

await say(ana, ana, 'The audio did not play');
await say(beto, beto, 'Love it');
assert.equal((await one(`select count(*)::int as n from feedback_testers where source = 'auto'`)).n, 2);
ok('writing while open to everyone makes her a tester');

await assert.rejects(say(ana, beto, 'hi'), /row-level security/);
await assert.rejects(say(ana, ana, 'I am staff', ', true'), /row-level security/);
await assert.rejects(say(ana, ana, '   '), /check constraint/);
ok('a tester writes only into her own thread, never as staff, never empty');

assert.equal((await as(beto, () => one(`select count(*)::int as n from feedback_messages`))).n, 1);
ok('she reads only her own thread');

// --- the team answers ------------------------------------------------------------
const inbox = await as(admin, () => db.query(`select * from feedback_inbox()`));
assert.equal(inbox.rows.length, 2);
assert.equal(inbox.rows.find((r) => r.user_id === ana).unread, 1);
assert.equal(inbox.rows.find((r) => r.user_id === beto).anonymous, true);
await assert.rejects(as(ana, () => db.query(`select * from feedback_inbox()`)), /staff only/);
ok('the inbox lists every thread for staff, and nobody else');

await say(admin, ana, 'Fixed, thanks!', ', true');
assert.deepEqual(await access(ana), { open: true, unread: 1 });
const after = await as(admin, () => db.query(`select * from feedback_inbox()`));
assert.equal(after.rows.find((r) => r.user_id === ana).unread, 0);
ok('a reply is unread for her, and replying reads the thread for staff');

await as(ana, () => db.exec(`select feedback_mark_read()`));
assert.deepEqual(await access(ana), { open: true, unread: 0 });
ok('opening the sheet reads it');

// --- testers only ----------------------------------------------------------------
await as(ana, () => db.exec(`update feedback_settings set mode = 'off'`));
assert.equal((await one(`select mode from feedback_settings`)).mode, 'everyone');
await as(admin, () => db.exec(`update feedback_settings set mode = 'testers'`));
assert.equal((await access(ana)).open, true);
assert.equal((await access(late)).open, false);
assert.equal((await access(null)).open, false);
await assert.rejects(say(late, late, 'hello?'), /row-level security/);
ok('after launch, the testing round keeps the bubble and new users do not see it');

await say(ana, ana, 'Still here');
assert.equal((await one(`select count(*)::int as n from feedback_testers`)).n, 2);
await as(admin, () => db.exec(`insert into feedback_testers (user_id, source) values ('${late}', 'admin')`));
assert.equal((await access(late)).open, true);
const people = await as(admin, () => db.query(`select * from feedback_people('late@')`));
assert.equal(people.rows[0].tester, 'admin');
await assert.rejects(as(ana, () => db.exec(`insert into feedback_testers (user_id, source) values ('${ana}', 'admin')`)), /row-level security|duplicate/);
ok('staff add testers by hand; testers cannot add themselves');

// --- screenshots -----------------------------------------------------------------
await as(ana, () => db.exec(`insert into storage.objects (bucket_id, name) values ('feedback', '${ana}/shot.jpg')`));
await assert.rejects(as(ana, () => db.exec(`insert into storage.objects (bucket_id, name) values ('feedback', '${beto}/shot.jpg')`)), /row-level security/);
assert.equal((await as(beto, () => one(`select count(*)::int as n from storage.objects where bucket_id = 'feedback'`))).n, 0);
assert.equal((await as(admin, () => one(`select count(*)::int as n from storage.objects where bucket_id = 'feedback'`))).n, 1);
ok('screenshots go under her own id, and only she and staff can read them');

console.log('feedback schema: all good');
