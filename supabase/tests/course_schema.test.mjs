process.on('unhandledRejection', (e) => { console.error('FAILED:', e.message, e.where ?? '', e.detail ?? '', e.hint ?? ''); process.exit(1); });
// Applies che's init migration and the course schema migration to a real
// Postgres (PGlite — Postgres compiled to WASM, no Docker needed), with
// stand-ins for the Supabase-only pieces (auth.uid(), storage), then exercises
// the triggers, the RLS policies and finish_lesson's streak rules.
//
//   npm run db:test
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const MIG = new URL('../migrations', import.meta.url).pathname;
const db = new PGlite();

const ok = (m) => console.log('  ✔', m);

// --- Supabase stand-ins -------------------------------------------------------
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
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to authenticated, service_role;
`);

// gen_random_uuid is core Postgres; PGlite just has no pgcrypto package to install.
await db.exec(readFileSync(`${MIG}/20260427000001_init.sql`, 'utf8').replace(/create extension[^;]*;/i, ''));
ok('che init migration applies');
await db.exec(readFileSync(`${MIG}/20260913000001_course_schema.sql`, 'utf8'));
ok('course schema migration applies');
await db.exec(`
  grant select, insert, update, delete on all tables in schema public to authenticated;
  grant usage, select on all sequences in schema public to authenticated;
  grant execute on all functions in schema public to authenticated;
`);

// --- seed a tiny course as the migration owner ---------------------------------
const student = '11111111-1111-4111-8111-111111111111';
const reviewer = '22222222-2222-4222-8222-222222222222';
await db.exec(`
  insert into auth.users values ('${student}'), ('${reviewer}');
  insert into profiles (user_id, display_name) values ('${student}', 'S'), ('${reviewer}', 'R');
  update profiles set role = 'reviewer' where user_id = '${reviewer}';

  insert into sections (id, ordinal, slug, title_en, cefr, status) values (1, 1, 's1', 'First words', 'A1.1', 'published');
  insert into units (id, section_id, ordinal, slug, title_en, summary_en, status)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 1, 1, 'u1', 'Hola, che', 'Say hi', 'published'),
           ('aaaaaaaa-0000-4000-8000-000000000002', 1, 2, 'u2', 'Draft unit', 'Not yet', 'draft');
  insert into lessons (id, unit_id, ordinal, title_en, status)
    values ('bbbbbbbb-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', 1, 'Lesson 1', 'published');
  insert into lemmas (id, lemma, pos, gloss_en, status)
    values ('cccccccc-0000-4000-8000-000000000001', 'ser', 'verb', 'to be', 'published');
  insert into forms (id, lemma_id, form, gloss_en, unit_id, status)
    values ('dddddddd-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001', 'sos', 'you are', 'aaaaaaaa-0000-4000-8000-000000000001', 'published'),
           ('dddddddd-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000001', 'soy', null, 'aaaaaaaa-0000-4000-8000-000000000001', 'published');
  insert into sentences (id, unit_id, es, en, tokens, target_form_id, status)
    values ('eeeeeeee-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001', '¿Vos sos Juan?', 'Are you Juan?',
      '[{"surface":"¿Vos","form_ids":[]},{"surface":"sos","form_ids":["dddddddd-0000-4000-8000-000000000001"]},{"surface":"Juan?","form_ids":[]}]',
      'dddddddd-0000-4000-8000-000000000001', 'published');
  insert into lesson_slots (lesson_id, ordinal, kind, sentence_id)
    values ('bbbbbbbb-0000-4000-8000-000000000001', 1, 'drill', 'eeeeeeee-0000-4000-8000-000000000001');
`);
ok('seed rows insert (incl. lesson slot check constraint)');

// sentence_forms trigger
let r = await db.query(`select form_id, is_target from sentence_forms`);
assert.deepEqual(r.rows, [{ form_id: 'dddddddd-0000-4000-8000-000000000001', is_target: true }]);
ok('sentence_forms maintained from tokens');

// view coalesces gloss
r = await db.query(`select form, gloss_en, unit_ordinal from form_entries order by form`);
assert.deepEqual(r.rows, [
  { form: 'sos', gloss_en: 'you are', unit_ordinal: 1 },
  { form: 'soy', gloss_en: 'to be', unit_ordinal: 1 },
]);
ok('form_entries folds in lemma gloss and unit ordinal');

// slot constraint rejects a malformed slot
await assert.rejects(
  db.exec(`insert into lesson_slots (lesson_id, ordinal, kind) values ('bbbbbbbb-0000-4000-8000-000000000001', 2, 'teach')`),
);
ok('teach slot without a form is rejected');

// --- as a student ------------------------------------------------------------
async function as(uid, fn) {
  await db.exec(`set role authenticated; select set_config('test.uid', '${uid}', false); select set_config('test.role', 'authenticated', false);`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('test.uid', '', false);`);
  }
}

await as(student, async () => {
  const units = await db.query(`select slug from units order by ordinal`);
  assert.deepEqual(units.rows.map((u) => u.slug), ['u1']);
  ok('student sees published units only');

  await assert.rejects(db.exec(`update profiles set role = 'admin' where user_id = '${student}'`), /admin/);
  ok('student cannot promote themselves');

  await assert.rejects(db.exec(`insert into units (section_id, ordinal, slug, title_en, summary_en) values (1, 9, 'x', 'x', 'x')`));
  ok('student cannot write content');

  const slots = await db.query(`select kind from lesson_slots`);
  assert.equal(slots.rows.length, 1);
  ok('student reads slots of a published lesson');

  // finish_lesson: first ever round
  const d = (s) => `'${s}'::date`;
  let f = await db.query(`select * from finish_lesson(${d('2026-09-10')}, 'bbbbbbbb-0000-4000-8000-000000000001', 80::smallint)`);
  assert.deepEqual(f.rows[0], { current_streak: 1, previous_streak: 0, recoverable_streak: 0 });
  // second round same day: no change
  f = await db.query(`select * from finish_lesson(${d('2026-09-10')})`);
  assert.deepEqual(f.rows[0], { current_streak: 1, previous_streak: 1, recoverable_streak: 0 });
  // next day grows
  f = await db.query(`select * from finish_lesson(${d('2026-09-11')})`);
  assert.equal(f.rows[0].current_streak, 2);
  f = await db.query(`select * from finish_lesson(${d('2026-09-12')})`);
  assert.equal(f.rows[0].current_streak, 3);
  ok('streak grows day over day, idempotent within a day');

  // miss two days → banked
  f = await db.query(`select * from finish_lesson(${d('2026-09-15')})`);
  assert.deepEqual(f.rows[0], { current_streak: 1, previous_streak: 3, recoverable_streak: 3 });
  // second round of the comeback day → recovered
  f = await db.query(`select * from finish_lesson(${d('2026-09-15')})`);
  assert.deepEqual(f.rows[0], { current_streak: 4, previous_streak: 1, recoverable_streak: 0 });
  ok('comeback day banks the run and a second round buys it back');

  const p = await db.query(`select score from lesson_progress`);
  assert.deepEqual(p.rows, [{ score: 80 }]);
  const s = await db.query(`select last_practice_date::text as d from streaks`);
  assert.equal(s.rows[0].d, '2026-09-15');
  ok('lesson_progress recorded; last_practice_date kept for the reminder cron');

  const days = await db.query(`select count(*)::int as n from daily_sessions where completed_at is not null`);
  assert.equal(days.rows[0].n, 4);
  ok('daily_sessions has one completed row per practised day');

  await db.exec(`insert into form_states (form_id, user_id, state) values ('dddddddd-0000-4000-8000-000000000001', '${student}', 'learning')`);
  ok('student writes own form_states');
});

await as(reviewer, async () => {
  const units = await db.query(`select slug from units order by ordinal`);
  assert.deepEqual(units.rows.map((u) => u.slug), ['u1', 'u2']);
  ok('reviewer sees drafts');
  await db.exec(`update units set status = 'published' where slug = 'u2'`);
  ok('reviewer can publish');
  const other = await db.query(`select count(*)::int as n from form_states`);
  assert.equal(other.rows[0].n, 0);
  ok("reviewer cannot read a learner's progress");
});

r = await db.query(`select form from available_forms(1::smallint) order by form`);
assert.deepEqual(r.rows.map((x) => x.form), ['sos', 'soy']);
ok('available_forms');

console.log('\nall migration checks passed');
