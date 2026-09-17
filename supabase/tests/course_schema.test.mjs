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
// docs/learning-engine-spec.md — telemetry, unit check, placement, stories, answers.
const ENGINE = [
  '20260917000001_engine_telemetry.sql',
  '20260917000002_unit_check.sql',
  '20260917000003_placement.sql',
  '20260917000004_stories_guidebook.sql',
  '20260917000005_answers_and_quality.sql',
  '20260918000003_synonym_note.sql',
  '20260918000004_form_answers.sql',
  '20260918000005_admin_words.sql',
  '20260918000006_form_positions.sql',
];
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
await db.exec(readFileSync(`${MIG}/20260915000001_sentence_es_alt.sql`, 'utf8'));
await db.exec(readFileSync(`${MIG}/20260916000001_sections_and_lesson_kinds.sql`, 'utf8'));
ok('course schema migrations apply');
await db.exec(readFileSync(`${MIG}/20260505000004_notification_events.sql`, 'utf8'));
for (const f of ENGINE) await db.exec(readFileSync(`${MIG}/${f}`, 'utf8'));
ok('learning engine migrations apply');
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
  insert into units (id, section_id, ordinal, course_order, slug, title_en, summary_en, status)
    values ('aaaaaaaa-0000-4000-8000-000000000001', 1, 1, 1, 'u1', 'Hola, che', 'Say hi', 'published'),
           ('aaaaaaaa-0000-4000-8000-000000000002', 1, 2, 2, 'u2', 'Draft unit', 'Not yet', 'draft');
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
  insert into form_answers (form_id, meaning, answer, status)
    values ('dddddddd-0000-4000-8000-000000000001', 'you are', 'vos sos', 'published'),
           ('dddddddd-0000-4000-8000-000000000001', 'you are', 'sos vos', 'retired');
`);
ok('seed rows insert (incl. lesson slot check constraint)');

// A typed answer can be right as a synonym, and that note is logged.
await db.exec(`insert into review_logs (user_id, form_id, rating, mode, note)
  values ('${student}', 'dddddddd-0000-4000-8000-000000000001', 2, 'typing', 'synonym')`);
await assert.rejects(
  db.exec(`insert into review_logs (user_id, form_id, rating, mode, note)
    values ('${student}', 'dddddddd-0000-4000-8000-000000000001', 2, 'typing', 'guess')`),
);
ok('review_logs takes the synonym note and no made-up one');

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

  await assert.rejects(db.exec(`insert into units (section_id, ordinal, course_order, slug, title_en, summary_en) values (1, 9, 9, 'x', 'x', 'x')`));
  ok('student cannot write content');

  const answers = await db.query(`select answer from form_answers`);
  assert.deepEqual(answers.rows.map((a) => a.answer), ['vos sos']);
  await assert.rejects(
    db.exec(`insert into form_answers (form_id, meaning, answer) values ('dddddddd-0000-4000-8000-000000000001', 'you are', 'x')`),
  );
  ok('student reads published form answers and cannot add one');

  const slots = await db.query(`select kind from lesson_slots`);
  assert.equal(slots.rows.length, 1);
  ok('student reads slots of a published lesson');

  // finish_lesson: first ever round
  const d = (s) => `'${s}'::date`;
  let f = await db.query(`select * from finish_lesson(${d('2026-09-10')}, 'bbbbbbbb-0000-4000-8000-000000000001', 80::smallint)`);
  assert.deepEqual(f.rows[0], { current_streak: 1, previous_streak: 0, recoverable_streak: 0, passed: true, attempts: 1 });
  // second round same day: no change
  f = await db.query(`select * from finish_lesson(${d('2026-09-10')})`);
  assert.deepEqual(f.rows[0], { current_streak: 1, previous_streak: 1, recoverable_streak: 0, passed: true, attempts: null });
  // next day grows
  f = await db.query(`select * from finish_lesson(${d('2026-09-11')})`);
  assert.equal(f.rows[0].current_streak, 2);
  f = await db.query(`select * from finish_lesson(${d('2026-09-12')})`);
  assert.equal(f.rows[0].current_streak, 3);
  ok('streak grows day over day, idempotent within a day');

  // miss two days → banked
  f = await db.query(`select * from finish_lesson(${d('2026-09-15')})`);
  assert.deepEqual(f.rows[0], { current_streak: 1, previous_streak: 3, recoverable_streak: 3, passed: true, attempts: null });
  // second round of the comeback day → recovered
  f = await db.query(`select * from finish_lesson(${d('2026-09-15')})`);
  assert.deepEqual(f.rows[0], { current_streak: 4, previous_streak: 1, recoverable_streak: 0, passed: true, attempts: null });
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

  // Words and sentences edited in the admin (docs/superplan-admin-palabras.md §6).
  await db.exec(`update sentences set status = 'draft', problems = array['"croissant" isn''t in the course lexicon'] where id = 'eeeeeeee-0000-4000-8000-000000000001'`);
  const paused = await db.query(`select status, problems from sentences where id = 'eeeeeeee-0000-4000-8000-000000000001'`);
  assert.deepEqual(paused.rows[0], { status: 'draft', problems: [`"croissant" isn't in the course lexicon`] });
  await db.exec(`update sentences set status = 'published', problems = '{}' where id = 'eeeeeeee-0000-4000-8000-000000000001'`);
  ok('reviewer pauses a sentence with its reasons, and puts it back');
  const added = await db.query(`insert into lemmas (lemma, pos, gloss_en, source) values ('pileta', 'noun', 'swimming pool', 'dashboard') returning id, source`);
  await db.exec(`insert into forms (lemma_id, form, unit_id, source, position) values ('${added.rows[0].id}', 'pileta', 'aaaaaaaa-0000-4000-8000-000000000002', 'dashboard', 3)`);
  await assert.rejects(db.exec(`update forms set source = 'yaml' where form = 'pileta'`));
  const sources = await db.query(`select form, source, position from forms order by form`);
  assert.deepEqual(sources.rows, [
    { form: 'pileta', source: 'dashboard', position: 3 },
    { form: 'sos', source: 'outline', position: 0 },
    { form: 'soy', source: 'outline', position: 0 },
  ]);
  ok('reviewer adds a word from the dashboard; outline words say where they came from');
  const batch = '99999999-0000-4000-8000-000000000001';
  await db.exec(`insert into content_revisions (table_name, row_id, before, after, edited_by, batch_id) values
    ('forms', 'dddddddd-0000-4000-8000-000000000001', '{"form":"sos"}', '{"form":"sós"}', '${reviewer}', '${batch}'),
    ('sentences', 'eeeeeeee-0000-4000-8000-000000000001', '{"es":"¿Vos sos Juan?"}', '{"es":"¿Vos sós Juan?"}', '${reviewer}', '${batch}')`);
  const inBatch = await db.query(`select count(*)::int as n from content_revisions where batch_id = '${batch}'`);
  assert.equal(inBatch.rows[0].n, 2);
  ok('revisions of one operation share a batch');
});

// --- learning engine ------------------------------------------------------------
{
  const u1 = 'aaaaaaaa-0000-4000-8000-000000000001';
  const check = 'bbbbbbbb-0000-4000-8000-000000000002';
  const round = (n) => `ffffffff-0000-4000-8000-00000000000${n}`;
  await db.exec(`
    insert into lessons (id, unit_id, ordinal, title_en, kind, status) values ('${check}', '${u1}', 2, 'Review', 'review', 'published');
    insert into lesson_slots (lesson_id, ordinal, kind, review_count, scope) values ('${check}', 1, 'recap', 8, 'unit');
  `);
  await assert.rejects(db.exec(`insert into lesson_slots (lesson_id, ordinal, kind, review_count) values ('${check}', 2, 'recap', 8)`));
  ok('a recap slot needs a scope');

  await as(student, async () => {
    await db.exec(`insert into rounds (id, user_id, kind, lesson_id, local_date, planned_items) values ('${round(1)}', '${student}', 'unit_check', '${check}', '2026-09-16', 10)`);
    await assert.rejects(db.exec(`insert into rounds (id, user_id, kind, local_date) values ('${round(9)}', '${reviewer}', 'practice', '2026-09-16')`));
    ok("rounds: a learner writes her own and no one else's");

    let f = await db.query(`select passed, attempts from finish_lesson('2026-09-16', '${check}', 60::smallint, '${round(1)}', 10::smallint, 4::smallint, 3::smallint)`);
    assert.deepEqual(f.rows[0], { passed: false, attempts: 1 });
    const stamped = await db.query(`select score, answered, first_try_wrong, retries, finished_at is not null as done from rounds where id = '${round(1)}'`);
    assert.deepEqual(stamped.rows[0], { score: 60, answered: 10, first_try_wrong: 4, retries: 3, done: true });
    ok('finish_lesson stamps the round; a unit check below 80 is not passed');

    f = await db.query(`select passed, attempts from finish_lesson('2026-09-16', '${check}', 70::smallint)`);
    assert.deepEqual(f.rows[0], { passed: false, attempts: 2 });
    f = await db.query(`select passed, attempts from finish_lesson('2026-09-16', '${check}', 50::smallint)`);
    assert.deepEqual(f.rows[0], { passed: true, attempts: 3 });
    let lp = await db.query(`select passed_by, score from lesson_progress where lesson_id = '${check}'`);
    assert.deepEqual(lp.rows[0], { passed_by: 'attempts', score: 70 });
    f = await db.query(`select passed from finish_lesson('2026-09-16', '${check}', 10::smallint)`);
    assert.equal(f.rows[0].passed, true);
    ok('the third attempt passes whatever the score, and a pass never un-passes');

    await db.exec(`
      insert into srs_commits (user_id, form_id, round_id, seen, wrong, rating, scheduled)
      values ('${student}', 'dddddddd-0000-4000-8000-000000000001', '${round(1)}', 2, 0, 2, true)`);
    ok('srs_commits: a learner logs her own decisions');

    await db.exec(`
      insert into answer_reports (user_id, sentence_id, mode, answer, answer_key)
      values ('${student}', 'eeeeeeee-0000-4000-8000-000000000001', 'sentence_build', 'Sos Juan?', 'sos juan')`);
    await assert.rejects(db.exec(`
      insert into answer_reports (user_id, sentence_id, mode, answer, answer_key)
      values ('${student}', 'eeeeeeee-0000-4000-8000-000000000001', 'sentence_build', 'sos Juan', 'sos juan')`));
    await assert.rejects(db.exec(`
      insert into answer_reports (user_id, sentence_id, mode, answer, answer_key, status)
      values ('${student}', 'eeeeeeee-0000-4000-8000-000000000001', 'sentence_build', 'x', 'x', 'accepted')`));
    ok('answer_reports: one report per answer, and a learner cannot resolve her own');

    const stats = await db.query(`select * from staff_round_stats()`);
    assert.equal(stats.rows.length, 0);
    ok('staff reports return nothing to a learner');
  });

  await as(reviewer, async () => {
    const stats = await db.query(`select kind, finished from staff_round_stats('2000-01-01')`);
    assert.deepEqual(stats.rows, [{ kind: 'unit_check', finished: 1 }]);
    const reports = await db.query(`select answer_key, reports::int from staff_open_reports()`);
    assert.deepEqual(reports.rows, [{ answer_key: 'sos juan', reports: 1 }]);
    const rates = await db.query(`select learners::int, by_attempts::int from staff_unit_check_rates()`);
    assert.deepEqual(rates.rows, [{ learners: 1, by_attempts: 1 }]);
    ok('staff see aggregate rounds, open reports and unit-check rates');
  });

  // Placement: a fresh learner skips unit 1.
  const placed = '66666666-6666-4666-8666-666666666666';
  await db.exec(`
    insert into auth.users values ('${placed}');
    insert into profiles (user_id, display_name) values ('${placed}', 'P');
    update units set status = 'published', course_order = 2 where id = 'aaaaaaaa-0000-4000-8000-000000000002';
  `);
  await as(placed, async () => {
    await db.exec(`insert into form_states (form_id, user_id, state, interval_days) values ('dddddddd-0000-4000-8000-000000000002', '${placed}', 'review', 30)`);
    const r = await db.query(`select * from apply_placement(null, 2::smallint, array['dddddddd-0000-4000-8000-000000000001']::uuid[], '{}')`);
    assert.deepEqual(r.rows[0], { lessons_skipped: 2, forms_scheduled: 1 });
    const states = await db.query(`select form_id, state, interval_days, coalesce(due_at > now() + interval '2 days', false) as later from form_states order by form_id`);
    assert.deepEqual(states.rows, [
      { form_id: 'dddddddd-0000-4000-8000-000000000001', state: 'review', interval_days: 7, later: true },
      { form_id: 'dddddddd-0000-4000-8000-000000000002', state: 'review', interval_days: 30, later: false },
    ]);
    const lp = await db.query(`select count(*)::int as n from lesson_progress where passed_by = 'placement' and passed`);
    assert.equal(lp.rows[0].n, 2);
    const prof = await db.query(`select placed_through from profiles where user_id = '${placed}'`);
    assert.equal(prof.rows[0].placed_through, 1);
    ok('apply_placement: skipped lessons passed, new states spread out, existing states untouched');
  });
  console.log('\nall learning engine checks passed');
}

r = await db.query(`select form from available_forms(1::smallint) order by form`);
assert.deepEqual(r.rows.map((x) => x.form), ['sos', 'soy']);
ok('available_forms');

console.log('\nall migration checks passed');

// --- the seed ------------------------------------------------------------------
// A fresh database: schema + the generated section-1 seed, applied twice.
{
  const seedDb = new PGlite();
  await seedDb.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select 'authenticated' $$;
    create schema storage;
    create table storage.buckets (id text primary key, name text, public boolean);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  `);
  await seedDb.exec(readFileSync(`${MIG}/20260427000001_init.sql`, 'utf8').replace(/create extension[^;]*;/i, ''));
  await seedDb.exec(readFileSync(`${MIG}/20260913000001_course_schema.sql`, 'utf8'));
  await seedDb.exec(readFileSync(`${MIG}/20260913000002_seed_section_1.sql`, 'utf8'));
  ok('first seed applies');
  // Production got the first seed before es_alt existed; the re-seed lands on top.
  await seedDb.exec(readFileSync(`${MIG}/20260915000001_sentence_es_alt.sql`, 'utf8'));
  await seedDb.exec(readFileSync(`${MIG}/20260915000002_seed_section_1_accepted_answers.sql`, 'utf8'));
  ok('es_alt column + re-seed apply over the first seed');
  // Four units inserted mid-section: every later unit moves to a taken ordinal.
  await seedDb.exec(readFileSync(`${MIG}/20260915000003_seed_section_1_24_units.sql`, 'utf8'));
  const order = (await seedDb.query(`select ordinal, slug from units order by ordinal`)).rows;
  assert.equal(order.length, 24);
  assert.deepEqual(order.slice(5, 8).map((u) => u.slug), ['me-traes-un-cafe', 'el-bondi', 'como-estas']);
  assert.equal(order[23].slug, 'repaso');
  ok('24-unit re-seed reorders units over the 20-unit seed');

  // The re-slice: one section of 24 units becomes three of ten, and the units
  // it dropped are retired rather than deleted.
  await seedDb.exec(readFileSync(`${MIG}/20260916000001_sections_and_lesson_kinds.sql`, 'utf8'));
  const seed = readFileSync(`${MIG}/20260916000002_seed_three_sections.sql`, 'utf8');
  await seedDb.exec(seed);
  const live = (await seedDb.query(`
    select s.ordinal as section, u.ordinal, u.course_order, u.slug
    from units u join sections s on s.id = u.section_id
    where u.status <> 'retired' order by u.course_order`)).rows;
  assert.equal(live.length, 30);
  assert.deepEqual(live[0], { section: 1, ordinal: 1, course_order: 1, slug: 'un-cafe-por-favor' });
  assert.deepEqual(live[10], { section: 2, ordinal: 1, course_order: 11, slug: 'la-gente' });
  assert.deepEqual(live[29], { section: 3, ordinal: 10, course_order: 30, slug: 'ahora-y-planes' });
  const retired = (await seedDb.query(`select slug from units where status = 'retired' order by slug`)).rows;
  assert.deepEqual(retired.map((u) => u.slug), ['ahora', 'el-bondi', 'planes', 'repaso']);
  const orphanForms = await seedDb.query(`
    select count(*)::int as n from forms f join units u on u.id = f.unit_id
    where u.status = 'retired' and f.status <> 'retired'`);
  assert.equal(orphanForms.rows[0].n, 0);
  ok('re-slice: 30 live units across 3 sections, 4 old units retired with their words');

  const counts = async () =>
    (await seedDb.query(`
      select
        (select count(*)::int from units) as units,
        (select count(*)::int from lessons) as lessons,
        (select count(*)::int from forms) as forms,
        (select count(*)::int from sentences) as sentences,
        (select count(*)::int from sentence_forms) as sentence_forms,
        (select count(*)::int from lesson_slots) as slots`)).rows[0];
  const first = await counts();
  await seedDb.exec(seed);
  assert.deepEqual(await counts(), first);
  assert.ok(first.sentence_forms > first.sentences, 'trigger filled sentence_forms');
  ok(`seed is idempotent (${first.units} units, ${first.forms} forms, ${first.sentences} sentences, ${first.slots} slots)`);

  // Every slot points at content that exists, of the kind the slot needs.
  const orphans = await seedDb.query(`
    select count(*)::int as n from lesson_slots s
    left join forms f on f.id = s.form_id
    left join sentences x on x.id = s.sentence_id
    left join tips t on t.id = s.tip_id
    where (s.kind = 'teach' and f.id is null) or (s.kind = 'drill' and x.id is null) or (s.kind = 'tip' and t.id is null)`);
  assert.equal(orphans.rows[0].n, 0);
  ok('every slot resolves');

  const alt = await seedDb.query(`select es_alt from sentences where es = 'Soy Sofi.'`);
  assert.deepEqual(alt.rows[0].es_alt, ['Yo soy Sofi.']);
  const stale = await seedDb.query(`
    select count(*)::int as n from sentences where es = '¿Vos sos Juan?' and status <> 'retired'`);
  assert.equal(stale.rows[0].n, 0, 'a sentence whose words moved to a later unit is retired');
  const liveSentences = await seedDb.query(`select count(*)::int as n from sentences where status <> 'retired'`);
  assert.equal(liveSentences.rows[0].n, 24);
  ok('accepted answers seeded; sentences the re-slice broke are retired');

  // The learning engine: its schema, then units 1–2 re-cut into lessons of
  // 4–6 new words, a unit check each, and a story before unit 2's check.
  await seedDb.exec(readFileSync(`${MIG}/20260505000004_notification_events.sql`, 'utf8'));
  for (const f of ENGINE) await seedDb.exec(readFileSync(`${MIG}/${f}`, 'utf8'));
  const engineSeed = readFileSync(`${MIG}/20260917000006_seed_engine_content.sql`, 'utf8');
  await seedDb.exec(engineSeed);
  const recut = await counts();
  await seedDb.exec(engineSeed);
  assert.deepEqual(await counts(), recut);
  const shape = (await seedDb.query(`
    select u.slug, l.ordinal, l.kind, l.status
    from lessons l join units u on u.id = l.unit_id
    where u.slug in ('un-cafe-por-favor', 'hola-che') and l.status <> 'retired'
    order by u.course_order, l.ordinal`)).rows;
  assert.deepEqual(
    shape.map((r) => `${r.slug}:${r.ordinal}:${r.kind}`),
    [
      'un-cafe-por-favor:1:lesson', 'un-cafe-por-favor:2:lesson', 'un-cafe-por-favor:3:review',
      'hola-che:1:lesson', 'hola-che:2:lesson', 'hola-che:3:lesson', 'hola-che:4:story', 'hola-che:5:review',
    ],
  );
  const story = (await seedDb.query(`select count(*)::int as n, count(question)::int as q from story_lines`)).rows[0];
  assert.deepEqual(story, { n: 10, q: 4 });
  const phrases = (await seedDb.query(`select count(*)::int as n from unit_phrases`)).rows[0];
  assert.equal(phrases.n, 8);
  const recaps = (await seedDb.query(`select count(*)::int as n from lesson_slots where kind = 'recap'`)).rows[0];
  assert.equal(recaps.n, 2);
  ok('engine seed: units 1–2 re-cut with unit checks, a story and key phrases; idempotent');

  await seedDb.exec(`
    grant select, insert, update on all tables in schema public to authenticated;
    grant execute on all functions in schema public to authenticated;
    insert into auth.users values ('33333333-3333-4333-8333-333333333333');
    set role authenticated; select set_config('test.uid', '33333333-3333-4333-8333-333333333333', false);
  `);
  const seen = (await seedDb.query(`
    select
      (select count(*)::int from units) as units,
      (select count(*)::int from lessons) as lessons,
      (select count(*)::int from form_entries) as forms,
      (select count(*)::int from lesson_slots) as slots,
      (select count(*)::int from story_lines) as story_lines`)).rows[0];
  assert.deepEqual(seen, { units: 2, lessons: 8, forms: 30, slots: 78, story_lines: 10 });
  ok('a student sees units 1–2 only: 8 lessons, 30 forms, 78 slots, one story');
  await seedDb.exec(`reset role;`);
  console.log('\nall seed checks passed');
}

// --- notifications: what the app writes to push_subscriptions ----------------
// Che's real subscription table (init + recurring reminders + web push + the
// unique endpoint + partner links), exercised with exactly the upserts
// src/lib/push.ts and native-push.native.ts send.
{
  const pushDb = new PGlite();
  await pushDb.exec(`
    create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
    create schema auth; create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    create function auth.role() returns text language sql stable as $$ select 'authenticated' $$;
  `);
  await pushDb.exec(readFileSync(`${MIG}/20260427000001_init.sql`, 'utf8').replace(/create extension[^;]*;/i, ''));
  for (const f of [
    '20260504000001_recurring_reminders.sql',
    '20260505000002_web_push.sql',
    '20260505000003_web_endpoint_unique_constraint.sql',
    '20260514000001_partner_reminders.sql',
  ]) {
    await pushDb.exec(readFileSync(`${MIG}/${f}`, 'utf8'));
  }
  const me = '44444444-4444-4444-8444-444444444444';
  const partner = '55555555-5555-4555-8555-555555555555';
  await pushDb.exec(`
    insert into auth.users values ('${me}'), ('${partner}');
    insert into partner_links values ('${me}', '${partner}', now()), ('${partner}', '${me}', now());
    grant select, insert, update, delete on all tables in schema public to authenticated;
    grant execute on all functions in schema public to authenticated;
  `);
  ok("Che's push migrations apply");

  const asUser = async (uid, sql) => {
    await pushDb.exec(`set role authenticated; select set_config('test.uid', '${uid}', false);`);
    try {
      return await pushDb.query(sql);
    } finally {
      await pushDb.exec(`reset role;`);
    }
  };

  // Web: the upsert push.ts sends (PostgREST onConflict=web_push_endpoint).
  const webUpsert = (uid, enabled = true) => `
    insert into push_subscriptions
      (user_id, platform, expo_push_token, web_push_endpoint, web_push_p256dh, web_push_auth, reminder_time, timezone, notifications_enabled)
    values ('${uid}', 'web', null, 'https://push.example/abc', 'p256', 'auth', '08:00', 'America/Argentina/Buenos_Aires', ${enabled})
    on conflict (web_push_endpoint) do update set
      user_id = excluded.user_id, platform = excluded.platform, expo_push_token = excluded.expo_push_token,
      web_push_p256dh = excluded.web_push_p256dh, web_push_auth = excluded.web_push_auth,
      reminder_time = excluded.reminder_time, timezone = excluded.timezone, notifications_enabled = excluded.notifications_enabled`;
  await asUser(partner, webUpsert(partner, false));
  await asUser(partner, webUpsert(partner, false)); // re-enabling the same device is an update, not a duplicate
  let r = await pushDb.query(`select count(*)::int as n from push_subscriptions where web_push_endpoint is not null`);
  assert.equal(r.rows[0].n, 1);
  ok('web subscription upsert passes the one-channel check and re-subscribing updates in place');

  // Native: the upsert native-push.native.ts sends (onConflict=expo_push_token).
  await asUser(me, `
    insert into push_subscriptions (user_id, platform, expo_push_token, reminder_time, timezone, notifications_enabled)
    values ('${me}', 'ios', 'ExponentPushToken[xyz]', '08:00', 'America/Argentina/Buenos_Aires', true)
    on conflict (expo_push_token) do update set notifications_enabled = excluded.notifications_enabled`);
  ok('native subscription upsert passes');

  // The status read push.ts makes, as the owner.
  r = await asUser(partner, `select notifications_enabled from push_subscriptions where web_push_endpoint = 'https://push.example/abc'`);
  assert.equal(r.rows[0].notifications_enabled, false);

  // Partner flow: I switch on my partner's reminders.
  r = await asUser(me, `select partner_id from partner_links where user_id = '${me}'`);
  assert.equal(r.rows[0].partner_id, partner);
  r = await asUser(me, `select sync_partner_reminder('08:00', true) as touched`);
  assert.equal(r.rows[0].touched, 1);
  r = await pushDb.query(`select notifications_enabled from push_subscriptions where user_id = '${partner}'`);
  assert.equal(r.rows[0].notifications_enabled, true);
  ok("partner lookup and sync_partner_reminder switch on the partner's device");

  // And nobody else's.
  r = await asUser(me, `select count(*)::int as n from push_subscriptions where user_id not in ('${me}', '${partner}')`);
  assert.equal(r.rows[0].n, 0);
  console.log('\nall notification checks passed');
}
