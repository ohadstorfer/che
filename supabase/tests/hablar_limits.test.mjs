process.on('unhandledRejection', (e) => { console.error('FAILED:', e.message, e.where ?? '', e.detail ?? '', e.hint ?? ''); process.exit(1); });
// The chat limits (migrations/20261016000001_hablar_chat_limits.sql) on a real
// Postgres (PGlite), after the Hablar migrations before it: three Speaking-tab
// chats a day, each in its own slot; unit and staff chats outside the count;
// one open unit chat per lesson; and the rows from before the limits kept.
// What the functions decide on their own (the eight lines, a unit chat had
// once, the course's safety cap) is in _shared/hablar_test.ts.
//
//   node supabase/tests/hablar_limits.test.mjs
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const MIG = new URL('../migrations', import.meta.url).pathname;
const db = new PGlite();
const ok = (m) => console.log('  ✔', m);

// --- Supabase stand-ins: auth, storage, and the cron the retention job uses ---
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
  create function auth.role() returns text language sql stable as
    $$ select coalesce(nullif(current_setting('test.role', true), ''), 'authenticated') $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, created_at timestamptz default now());
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  alter table storage.objects enable row level security;
  create schema cron;
  create table cron.job (jobid bigserial primary key, jobname text, schedule text, command text);
  create function cron.schedule(n text, s text, c text) returns bigint language sql as
    $$ insert into cron.job (jobname, schedule, command) values (n, s, c) returning jobid $$;
  create function cron.unschedule(id bigint) returns boolean language sql as
    $$ delete from cron.job where jobid = id returning true $$;
  grant usage on schema public, auth, storage to authenticated, service_role;
  -- Functions the earlier migrations reference but this test never calls.
  set check_function_bodies = off;
`);
await db.exec(readFileSync(`${MIG}/20260427000001_init.sql`, 'utf8').replace(/create extension[^;]*;/i, ''));
await db.exec(readFileSync(`${MIG}/20260913000001_course_schema.sql`, 'utf8'));
await db.exec(readFileSync(`${MIG}/20260925000001_hablar.sql`, 'utf8'));
await db.exec(readFileSync(`${MIG}/20260925000002_hablar_unlimited.sql`, 'utf8'));
await db.exec(readFileSync(`${MIG}/20260930000002_hablar_unit_chats.sql`, 'utf8'));
ok('the Hablar migrations before the limits apply');

// The lessons a unit chat points at would need a whole course; the key isn't what is tested.
await db.exec('alter table public.conversations drop constraint conversations_lesson_id_fkey;');

const ana = '11111111-1111-4111-8111-111111111111';
const beto = '22222222-2222-4222-8222-222222222222';
const staff = '33333333-3333-4333-8333-333333333333';
const lessonA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const lessonB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
await db.exec(`insert into auth.users (id) values ('${ana}'), ('${beto}'), ('${staff}');`);

// --- before: one chat a day, as the old key allowed; unit chats had again ------
await db.exec(`
  insert into public.conversations (user_id, local_date, kind, level, started_at) values
    ('${ana}', '2026-10-14', 'scenario', 'A1', '2026-10-14T10:00:00Z'),
    ('${ana}', '2026-10-15', 'free', 'A1', '2026-10-15T10:00:00Z');
  insert into public.conversations (user_id, local_date, kind, level, unlimited) values
    ('${staff}', '2026-10-15', 'free', 'B1', true),
    ('${staff}', '2026-10-15', 'free', 'B1', true);
  -- Two unit chats left open for one lesson, from when they could be had again.
  insert into public.conversations (user_id, local_date, kind, level, lesson_id, started_at) values
    ('${beto}', '2026-10-15', 'unit', 'A1', '${lessonA}', '2026-10-15T09:00:00Z'),
    ('${beto}', '2026-10-15', 'unit', 'A1', '${lessonA}', '2026-10-15T09:30:00Z');
`);
await assert.rejects(
  db.exec(`insert into public.conversations (user_id, local_date, kind, level) values ('${ana}', '2026-10-15', 'free', 'A1');`),
  /conversations_one_per_day/,
);
ok('before the limits, a second chat in a day is refused');

await db.exec(readFileSync(`${MIG}/20261016000001_hablar_chat_limits.sql`, 'utf8'));
ok('the chat limits migration applies over existing rows');

const one = async (sql) => (await db.query(sql)).rows[0];
const all = async (sql) => (await db.query(sql)).rows;

assert.deepEqual(
  (await all(`select local_date::text, day_slot from conversations where user_id = '${ana}' order by local_date`)).map((r) => [r.local_date, r.day_slot]),
  [['2026-10-14', 1], ['2026-10-15', 1]],
);
assert.equal((await one(`select count(*)::int n from conversations where user_id = '${staff}' and day_slot is null`)).n, 2);
ok('an old chat is the first of its day; staff chats take no slot');

const openUnits = await all(`select started_at from conversations where user_id = '${beto}' and kind = 'unit' and ended_at is null`);
assert.equal(openUnits.length, 1);
assert.equal(new Date(openUnits[0].started_at).toISOString(), '2026-10-15T09:30:00.000Z');
assert.equal((await one(`select end_reason from conversations where user_id = '${beto}' and started_at = '2026-10-15T09:00:00Z'`)).end_reason, 'time');
ok('of two unit chats left open for a lesson, the latest stays open, the other is closed');

// --- the Speaking tab: three a day ---------------------------------------------
const startTab = (user, date, kind = 'scenario') =>
  db.query(
    `insert into public.conversations (user_id, local_date, kind, level) values ($1, $2, $3, 'A1') returning day_slot`,
    [user, date, kind],
  );
assert.equal((await startTab(ana, '2026-10-15')).rows[0].day_slot, 2);
assert.equal((await startTab(ana, '2026-10-15', 'free')).rows[0].day_slot, 3);
await assert.rejects(startTab(ana, '2026-10-15'), (e) => e.code === '23514' && /conversations_day_slot_check/.test(e.message));
ok('the day takes three chats: the old one, then slots 2 and 3; a fourth is refused (23514)');

assert.equal((await startTab(ana, '2026-10-16')).rows[0].day_slot, 1);
assert.equal((await startTab(beto, '2026-10-15')).rows[0].day_slot, 1);
ok('a new day, and another learner, start at slot 1');

// A slot the client sends is not believed.
const forged = await db.query(
  `insert into public.conversations (user_id, local_date, kind, level, day_slot) values ('${beto}', '2026-10-15', 'free', 'A1', 1) returning day_slot`,
);
assert.equal(forged.rows[0].day_slot, 2);
ok('the slot is always the next free one, whatever the insert says');

// Two starts at once: the slots differ, and only three land.
await db.exec(`insert into auth.users (id) values ('44444444-4444-4444-8444-444444444444');`);
const racer = '44444444-4444-4444-8444-444444444444';
const raced = await Promise.allSettled([1, 2, 3, 4, 5].map(() => startTab(racer, '2026-10-15')));
const slots = raced.filter((r) => r.status === 'fulfilled').map((r) => r.value.rows[0].day_slot).sort();
assert.deepEqual(slots, [1, 2, 3]);
assert.equal(raced.filter((r) => r.status === 'rejected').length, 2);
ok('five starts at once: slots 1, 2 and 3, and two refused');

// --- outside the count ----------------------------------------------------------
for (let i = 0; i < 5; i++) {
  await db.query(
    `insert into public.conversations (user_id, local_date, kind, level, unlimited) values ($1, '2026-10-15', 'free', 'B1', true)`,
    [staff],
  );
}
assert.equal((await one(`select count(*)::int n from conversations where user_id = '${staff}' and local_date = '2026-10-15'`)).n, 7);
ok('staff chats have no daily limit');

const startUnit = (user, lesson, date = '2026-10-15') =>
  db.query(
    `insert into public.conversations (user_id, local_date, kind, level, lesson_id) values ($1, $2, 'unit', 'A1', $3) returning id, day_slot`,
    [user, date, lesson],
  );
const u1 = (await startUnit(ana, lessonA)).rows[0];
assert.equal(u1.day_slot, null);
await assert.rejects(startUnit(ana, lessonA), (e) => e.code === '23505' && /conversations_one_open_unit_chat/.test(e.message));
assert.ok((await startUnit(ana, lessonB)).rows[0].id);
ok('a unit chat takes no slot (ana is at three today), and only one is open per lesson');

await db.exec(`update public.conversations set ended_at = now(), end_reason = 'user' where id = '${u1.id}'`);
assert.ok((await startUnit(ana, lessonA)).rows[0].id);
ok('once it has ended, the database lets another start (whether it may is hablar-start\'s call)');

// A staff unit chat is never held to the one-open rule.
await startUnit(staff, lessonA);
await db.query(`update public.conversations set unlimited = true where user_id = '${staff}' and kind = 'unit'`);
await db.query(
  `insert into public.conversations (user_id, local_date, kind, level, lesson_id, unlimited) values ('${staff}', '2026-10-15', 'unit', 'A1', '${lessonA}', true)`,
);
ok('staff may have several unit chats open for one lesson');

await assert.rejects(
  db.exec(`update public.conversations set day_slot = null where user_id = '${beto}' and kind = 'scenario'`),
  /conversations_day_slot_needed/,
);
ok('a counted chat always keeps its slot');

console.log('\nhablar limits: all good');
