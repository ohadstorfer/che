#!/usr/bin/env node
// Brings every live unit's lessons in line with what it teaches now.
//
// Words move between units (a restructure, a review), and a unit's lessons
// don't follow by themselves: a unit that gained words is left with too few
// teaching lessons (`lesson.density` in course:lessons), and the units that
// used to close a section still carry `checkpoint` lessons — ordinary teaching
// lessons drawn and graded as a test — and no check of their own.
//
//   npm run course:sync-lessons                  the plan, read from the database
//   npm run course:sync-lessons -- --sql <file>  and the migration that makes it so
//   … --snapshot <date>                          plan from content/snapshots/<date> instead (offline)
//
// What the migration does, to published units only:
//   teaching   a unit teaching n drillable words has max(2, ceil(n / 3))
//              teaching lessons (lessonCountFor, outline.mjs). A unit short of
//              that gets new ones, after its last teaching lesson: a draft
//              teaching lesson it already has is published first, then new
//              rows. A unit with more is left alone, unless it has more lessons
//              than words — a lesson would teach nothing — and then the last
//              ones are retired. Teaching lessons left in draft are retired too:
//              course:lessons hands them words no learner would ever see.
//   checkpoint every `checkpoint` lesson becomes a `lesson`, "Lesson N".
//   check      every unit ends on exactly one review, "Unit check".
//   order      ordinals 1..n: teaching (stories where they were), grammar
//              practice, practice; slang a third of the way in, culture two
//              thirds in, the chat last (as unit-extras.mjs places them); the
//              check.
//   learners   a lesson added to a unit she has finished counts as done.
// Nothing is deleted, ids stay, and running it twice changes nothing: the SQL
// works from the rows it finds, the plan only says how many lessons each unit
// wants and which ids new ones take.
// Then `npm run course:lessons -- --all` fills the slots.
import { readFileSync, writeFileSync } from 'node:fs';

import { uuid5 } from './lib/ids.mjs';
import { GRAMMAR_TITLE } from './lib/lessons.mjs';
import { FORMS_PER_LESSON, drillable, lessonCountFor } from './lib/outline.mjs';
import { q, uuidArray } from './lib/sql.mjs';
import { loadCourseRows } from './lib/vocabulary.mjs';

const args = process.argv.slice(2);
const flag = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
const sqlFile = flag('--sql');
const snapshot = flag('--snapshot');
if ((args.includes('--sql') && !sqlFile) || (args.includes('--snapshot') && !snapshot)) {
  console.error('usage: course:sync-lessons -- [--sql <migration.sql>] [--snapshot <date>]');
  process.exit(1);
}

const EXTRA_KINDS = ['speak', 'slang', 'culture'];
/** Ids past what a unit needs, in case it has fewer lessons when the migration runs than it had for the plan. */
const SPARE_IDS = 2;
/** Titles this script may renumber: the ones the pipeline wrote. */
const NUMBERED = /^(Lesson|Checkpoint)( \d+)?$/;

const rows = snapshot ? snapshotRows(snapshot) : loadCourseRows();
function snapshotRows(date) {
  const read = (name) => JSON.parse(readFileSync(new URL(`../../content/snapshots/${date}/${name}.json`, import.meta.url), 'utf8'));
  return Object.fromEntries(['sections', 'units', 'lessons', 'lemmas', 'forms'].map((t) => [t, read(t)]));
}

const sectionOrdinal = new Map(rows.sections.map((s) => [s.id, s.ordinal]));
const units = rows.units
  .filter((u) => u.status === 'published')
  .sort((a, b) => sectionOrdinal.get(a.section_id) - sectionOrdinal.get(b.section_id) || a.ordinal - b.ordinal);
const lemmaById = new Map(rows.lemmas.filter((l) => l.status !== 'retired').map((l) => [l.id, l]));
const known = new Set(rows.lessons.map((l) => l.id));

/** Drillable words per unit, counted as course:lessons counts them (outlineFromRows). */
const formsOf = new Map();
for (const f of rows.forms) {
  const lemma = lemmaById.get(f.lemma_id);
  // A word added to a live unit as a draft (course:words --draft) has no lesson yet: course:lessons leaves it out too.
  if (f.status === 'retired' || f.status === 'draft' || !lemma) continue;
  if (drillable({ is_glue: lemma.is_glue, pos: lemma.pos, bound: f.bound === true })) formsOf.set(f.unit_id, (formsOf.get(f.unit_id) ?? 0) + 1);
}

const teachingId = (u, k) => uuid5(`lesson:${u.slug}:extra:${k}`);
const reviewId = (u) => uuid5(`lesson:${u.slug}:check`);
const isTeaching = (l) => l.kind === 'lesson' || l.kind === 'checkpoint';

/** Where the extras sit among a unit's own lessons — unit-extras.mjs `sequence`. */
function sequence(body, checks, extra) {
  const m = body.length;
  const a = Math.max(1, Math.round(m / 3));
  const b = Math.max(a, Math.round((2 * m) / 3));
  return [...body.slice(0, a), ...extra.slang, ...body.slice(a, b), ...extra.culture, ...body.slice(b), ...extra.speak, ...checks];
}

// The plan: what the migration will do to the rows as they are now. The SQL
// below does the same reckoning on the rows it finds.
const plan = units.map((u) => {
  const mine = rows.lessons.filter((l) => l.unit_id === u.id).sort((a, b) => a.ordinal - b.ordinal);
  const published = mine.filter((l) => l.status === 'published');
  const practiceUnit = (u.review_form_ids ?? []).length > 0;
  const forms = formsOf.get(u.id) ?? 0;
  const teaching = published.filter(isTeaching);
  const drafts = mine.filter((l) => l.status === 'draft' && isTeaching(l));
  const have = teaching.length;
  // A practice unit teaches nothing: its lessons are not this script's to count.
  const want = practiceUnit ? null : lessonCountFor(forms) - 1;
  // More lessons than words: one would teach nothing. Never below `want`, or
  // the next run would add back what this one retired.
  const cap = practiceUnit ? null : Math.max(forms, want);

  const promoted = practiceUnit ? [] : drafts.slice(0, Math.max(0, want - have));
  const need = practiceUnit ? 0 : Math.max(0, want - have - promoted.length);
  const newIds = [];
  if (!practiceUnit) for (let k = 1; newIds.length < need + SPARE_IDS; k++) if (!known.has(teachingId(u, k))) newIds.push(teachingId(u, k));
  const minted = newIds.slice(0, need);
  const retired = practiceUnit ? [] : [...(have > cap ? teaching.slice(cap) : []), ...drafts.slice(promoted.length)];
  const kept = have > cap ? teaching.slice(0, cap) : teaching;
  const added = [...promoted.map((l) => l.id), ...minted];

  const checks = published.filter((l) => l.kind === 'review');
  const spareCheck = mine.filter((l) => l.kind === 'review' && l.status !== 'published').sort((a, b) => (b.id === reviewId(u)) - (a.id === reviewId(u)) || (b.status === 'draft') - (a.status === 'draft') || a.ordinal - b.ordinal)[0];
  const check = checks.length ? checks[checks.length - 1].id : (spareCheck?.id ?? reviewId(u));

  // The road order.
  const gone = new Set(retired.map((l) => l.id));
  const own = published.filter((l) => l.kind !== 'review' && !EXTRA_KINDS.includes(l.kind) && !gone.has(l.id));
  const first = own.filter((l) => l.kind !== 'practice').map((l) => l.id);
  const lastTeaching = Math.max(-1, ...kept.map((l) => first.indexOf(l.id)));
  first.splice(lastTeaching + 1, 0, ...added);
  const body = [
    ...first,
    ...own.filter((l) => l.kind === 'practice' && l.title_en === GRAMMAR_TITLE).map((l) => l.id),
    ...own.filter((l) => l.kind === 'practice' && l.title_en !== GRAMMAR_TITLE).map((l) => l.id),
  ];
  const extra = Object.fromEntries(EXTRA_KINDS.map((k) => [k, published.filter((l) => l.kind === k).map((l) => l.id)]));
  const seq = sequence(body, [check], extra);
  const now = published.map((l) => l.id);
  const moved = seq.length !== now.length || seq.some((id, i) => id !== now[i]) || published.some((l, i) => l.ordinal !== i + 1);

  const teachingNow = [...kept.map((l) => l.id), ...added];
  const byId = new Map(mine.map((l) => [l.id, l]));
  const retitled = practiceUnit
    ? 0
    : teachingNow.filter((id, i) => byId.has(id) && NUMBERED.test(byId.get(id).title_en) && byId.get(id).title_en !== `Lesson ${i + 1}` && byId.get(id).kind === 'lesson').length;

  return {
    unit: u,
    practiceUnit,
    forms,
    have,
    want,
    cap,
    newIds,
    promoted: promoted.length,
    minted: minted.length,
    retired: retired.filter((l) => l.status === 'published').length,
    draftsRetired: retired.filter((l) => l.status === 'draft').length,
    converted: mine.filter((l) => l.kind === 'checkpoint' && l.status === 'published').length,
    convertedOther: mine.filter((l) => l.kind === 'checkpoint' && l.status !== 'published').length,
    review: checks.length ? null : spareCheck ? `published (was ${spareCheck.status})` : 'added',
    reviewsRetired: Math.max(0, checks.length - 1),
    retitled,
    moved,
    lessons: seq.length,
  };
});

const sum = (f) => plan.reduce((n, p) => n + f(p), 0);
const count = (f) => plan.filter(f).length;
const touched = plan.filter((p) => p.promoted || p.minted || p.retired || p.draftsRetired || p.converted || p.convertedOther || p.review || p.reviewsRetired || p.retitled || p.moved);
const offRoadCheckpoints = rows.lessons.filter((l) => l.kind === 'checkpoint' && !units.some((u) => u.id === l.unit_id)).length;

console.log(`${snapshot ? `snapshot ${snapshot}` : 'database'}: ${units.length} published units (${count((p) => p.practiceUnit)} practice units), ${FORMS_PER_LESSON} words a lesson`);
console.log('  unit                             forms  teaching have → want   notes');
for (const p of touched) {
  const notes = [
    p.minted && `+${p.minted} new`,
    p.promoted && `${p.promoted} draft published`,
    p.retired && `${p.retired} retired (more lessons than words)`,
    p.draftsRetired && `${p.draftsRetired} draft retired`,
    p.converted && `${p.converted} checkpoint → lesson`,
    p.convertedOther && `${p.convertedOther} unpublished checkpoint → lesson`,
    p.review && `unit check ${p.review}`,
    p.reviewsRetired && `${p.reviewsRetired} extra unit check retired`,
    p.retitled && `${p.retitled} renumbered`,
    p.moved && !p.minted && !p.promoted && !p.retired && !p.review && 'reordered',
  ].filter(Boolean);
  const after = p.practiceUnit ? '' : `${String(p.have).padStart(2)} → ${String(Math.min(Math.max(p.have, p.want), Math.max(p.cap, p.want))).padStart(2)}`;
  console.log(`  ${p.unit.slug.padEnd(32)} ${String(p.practiceUnit ? '—' : p.forms).padStart(5)}  ${after.padEnd(21)} ${notes.join(' · ')}`);
}
console.log('');
console.log(`  short of teaching lessons   ${count((p) => p.minted || p.promoted)} units: ${sum((p) => p.minted)} lessons added, ${sum((p) => p.promoted)} drafts published`);
console.log(`  more than they need         ${count((p) => !p.practiceUnit && p.have > p.want)} units, left alone; ${sum((p) => p.retired)} lessons retired in ${count((p) => p.retired)} (more lessons than words)`);
console.log(`  draft teaching lessons      ${sum((p) => p.draftsRetired)} retired`);
console.log(`  checkpoint → lesson         ${sum((p) => p.converted)} published in ${count((p) => p.converted)} units, ${sum((p) => p.convertedOther) + offRoadCheckpoints} unpublished or in retired units`);
console.log(`  unit checks                 ${count((p) => p.review === 'added')} added, ${count((p) => p.review && p.review !== 'added')} published from a row the unit had, ${sum((p) => p.reviewsRetired)} retired`);
console.log(`  titles renumbered           ${sum((p) => p.retitled)} lessons (besides the converted and the new)`);
console.log(`  units renumbered            ${count((p) => p.moved)}`);

if (sqlFile) {
  writeFileSync(sqlFile, migration());
  console.log(`wrote ${sqlFile}`);
}

function migration() {
  const values = plan
    .map((p) => `  (${q(p.unit.slug)}, ${p.want ?? 'null'}, ${p.cap ?? 'null'}, ${uuidArray(p.newIds)}, ${q(reviewId(p.unit))}::uuid)`)
    .join(',\n');
  return `-- ---------------------------------------------------------------------------
-- Every live unit's lessons, in line with what it teaches now
-- (scripts/course/sync-lessons.mjs wrote this from ${snapshot ? `the ${snapshot} snapshot` : 'the database'}):
--   teaching   a unit teaching n words has max(2, ceil(n / ${FORMS_PER_LESSON})) teaching lessons.
--              One short of that gets new ones after its last teaching lesson
--              (a draft it already has first). One with more is left alone,
--              unless it has more lessons than words: the last are retired.
--              Teaching lessons left in draft are retired.
--   checkpoint every \`checkpoint\` lesson becomes a \`lesson\`, "Lesson N": they
--              were teaching lessons drawn and graded as a test.
--   check      every unit ends on exactly one review, "Unit check".
--   order      ordinals 1..n: teaching, grammar practice, practice, with slang a
--              third of the way in, culture two thirds in, the chat last; the check.
--   learners   a lesson added to a unit she has finished counts as done.
--
-- Nothing is deleted and no id changes. The SQL works from the rows it finds;
-- the table below only says how many teaching lessons each unit wants (want),
-- how many it may keep (cap: as many as it has words) and which ids new rows
-- take. Units not named are left alone. Running it twice changes nothing.
--
-- From the plan: ${sum((p) => p.minted)} teaching lessons added in ${count((p) => p.minted || p.promoted)} units (${sum((p) => p.promoted)} more published from draft),
-- ${sum((p) => p.retired)} retired, ${sum((p) => p.draftsRetired)} drafts retired, ${sum((p) => p.converted)} checkpoint lessons converted, ${count((p) => p.review)} unit checks added.
-- Then: npm run course:lessons -- --all
-- ---------------------------------------------------------------------------

create temp table sync_plan (slug text primary key, want int, cap int, new_ids uuid[] not null, review_id uuid not null);
insert into sync_plan (slug, want, cap, new_ids, review_id) values
${values};

-- Lessons new to the road: done already for whoever finished their unit (below).
create temp table sync_fresh (lesson_id uuid primary key);
create temp table sync_converted (lesson_id uuid primary key);

-- Checkpoint lessons are teaching lessons, wherever they are. The published
-- ones are numbered with their unit's other lessons, below.
with converted as (
  update public.lessons
  set kind = 'lesson', title_en = regexp_replace(title_en, '^Checkpoint ', 'Lesson ')
  where kind = 'checkpoint'
  returning id
)
insert into sync_converted select id from converted;

do $$
declare
  u record;
  r record;
  keeper record;
  teach uuid[];
  added uuid[];
  nid uuid;
  have int;
  chk uuid;
  first uuid[];
  body uuid[];
  seq uuid[];
  now_ids uuid[];
  now_ordinals int[];
  last_teaching int;
  m int;
  a int;
  b int;
  i int;
  top int;
begin
  for u in
    select un.id, sp.*
    from sync_plan sp
    join public.units un on un.slug = sp.slug
    join public.sections s on s.id = un.section_id
    where un.status = 'published'
    order by s.ordinal, un.ordinal
  loop
    added := '{}';
    if u.want is not null then
      select coalesce(array_agg(id order by ordinal), '{}') into teach
      from public.lessons where unit_id = u.id and status = 'published' and kind = 'lesson';
      have := coalesce(array_length(teach, 1), 0);

      if have < u.want then
        -- A draft teaching lesson the unit already has, before a new row.
        for r in
          select id from public.lessons
          where unit_id = u.id and status = 'draft' and kind = 'lesson'
          order by ordinal limit u.want - have
        loop
          update public.lessons set status = 'published' where id = r.id;
          added := added || r.id;
        end loop;
        foreach nid in array u.new_ids loop
          exit when have + coalesce(array_length(added, 1), 0) >= u.want;
          continue when exists (select 1 from public.lessons where id = nid);
          -- Below zero until the unit is renumbered: (unit_id, ordinal) is unique.
          insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
          values (nid, u.id, -1000 - coalesce(array_length(added, 1), 0), 'Lesson', 'lesson', 'published');
          added := added || nid;
        end loop;
        if have + coalesce(array_length(added, 1), 0) < u.want then
          raise exception 'sync-lessons: unit % wants % teaching lessons and the plan has too few ids for it. Run course:sync-lessons again.', u.slug, u.want;
        end if;
        insert into sync_fresh select unnest(added) on conflict do nothing;
      elsif have > u.cap then
        -- More lessons than words: the last would teach nothing.
        update public.lessons set status = 'retired' where id = any (teach[u.cap + 1:have]);
        teach := teach[1:u.cap];
      end if;

      -- A teaching lesson left in draft would be handed words nobody sees.
      update public.lessons set status = 'retired' where unit_id = u.id and status = 'draft' and kind = 'lesson';

      teach := teach || added;
      for i in 1 .. coalesce(array_length(teach, 1), 0) loop
        update public.lessons set title_en = 'Lesson ' || i
        where id = teach[i] and title_en ~ '^(Lesson|Checkpoint)( [0-9]+)?$' and title_en <> 'Lesson ' || i;
      end loop;
    end if;

    -- The unit check: exactly one, the last on the road.
    select id into chk from public.lessons
    where unit_id = u.id and status = 'published' and kind = 'review'
    order by ordinal desc limit 1;
    if chk is null then
      select l.id into keeper from public.lessons l
      where l.unit_id = u.id and l.kind = 'review'
      order by (l.id = u.review_id) desc, (l.status = 'draft') desc, l.ordinal
      limit 1;
      if keeper.id is null then
        insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
        values (u.review_id, u.id, -900, 'Unit check', 'review', 'published');
        chk := u.review_id;
      else
        update public.lessons set status = 'published' where id = keeper.id;
        chk := keeper.id;
      end if;
      insert into sync_fresh values (chk) on conflict do nothing;
    else
      update public.lessons set status = 'retired'
      where unit_id = u.id and status = 'published' and kind = 'review' and id <> chk;
    end if;
    update public.lessons set title_en = 'Unit check' where id = chk and title_en is distinct from 'Unit check';

    -- The road order. What the unit teaches first, stories where they were and
    -- the new lessons after the last teaching one; grammar practice; practice.
    select coalesce(array_agg(id order by ordinal), '{}') into first
    from public.lessons
    where unit_id = u.id and status = 'published' and id <> all (added)
      and kind not in ('practice', 'review', 'speak', 'slang', 'culture');
    select coalesce(max(t.n), 0) into last_teaching
    from unnest(first) with ordinality as t(id, n)
    join public.lessons l on l.id = t.id and l.kind = 'lesson';
    first := first[1:last_teaching] || added || first[last_teaching + 1:coalesce(array_length(first, 1), 0)];
    select first || coalesce(array_agg(id order by (title_en = ${q(GRAMMAR_TITLE)}) desc, ordinal), '{}') into body
    from public.lessons where unit_id = u.id and status = 'published' and kind = 'practice';

    -- The extras, where unit-extras.mjs places them.
    m := coalesce(array_length(body, 1), 0);
    a := greatest(1, round(m / 3.0)::int);
    b := greatest(a, round(2 * m / 3.0)::int);
    seq := body[1:a]
      || (select coalesce(array_agg(id order by ordinal), '{}') from public.lessons where unit_id = u.id and status = 'published' and kind = 'slang')
      || body[a + 1:b]
      || (select coalesce(array_agg(id order by ordinal), '{}') from public.lessons where unit_id = u.id and status = 'published' and kind = 'culture')
      || body[b + 1:m]
      || (select coalesce(array_agg(id order by ordinal), '{}') from public.lessons where unit_id = u.id and status = 'published' and kind = 'speak')
      || chk;

    -- Retired and draft lessons low enough to collide go past the end.
    select greatest(31000, coalesce(max(ordinal), 0)) into top
    from public.lessons where unit_id = u.id and ordinal >= 1000;
    update public.lessons l set ordinal = top + p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status <> 'published' and ordinal < 1000
    ) p
    where l.id = p.id;

    -- Already in order: leave the unit's rows untouched.
    select coalesce(array_agg(id order by ordinal), '{}'), coalesce(array_agg(ordinal::int order by ordinal), '{}')
    into now_ids, now_ordinals
    from public.lessons where unit_id = u.id and status = 'published';
    continue when now_ids = seq and now_ordinals = (select coalesce(array_agg(g), '{}') from generate_series(1, coalesce(array_length(seq, 1), 0)) g);

    -- Out of the way first: (unit_id, ordinal) is unique at every step.
    update public.lessons l set ordinal = -5000 - p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status = 'published'
    ) p
    where l.id = p.id;
    for i in 1 .. array_length(seq, 1) loop
      update public.lessons set ordinal = i where id = seq[i];
    end loop;
  end loop;
end;
$$;

-- A checkpoint lesson finished below the pass score was held as not passed.
-- As a lesson, finishing it is all there is to it.
update public.lesson_progress set passed = true
where not passed and lesson_id in (select lesson_id from sync_converted);

-- A learner already past a unit keeps her place: its new lessons count as
-- done (as grammar-seed.mjs does it). Past it means she passed the check it
-- already had, or she has gone on to a later unit and left nothing of this one
-- undone — progress further down the road alone is not enough, a learner can
-- have some in a unit that was moved later (20260930000003).
insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
select x.user_id, n.id, null::smallint, 0::smallint, true, 'placement'
from sync_fresh f
join public.lessons n on n.id = f.lesson_id and n.status = 'published'
join public.units nu on nu.id = n.unit_id
join public.sections ns on ns.id = nu.section_id
cross join (select distinct user_id from public.lesson_progress) x
where exists (
    select 1
    from public.lesson_progress p
    join public.lessons pl on pl.id = p.lesson_id
    where p.user_id = x.user_id and p.passed
      and pl.unit_id = n.unit_id and pl.kind = 'review' and pl.status = 'published'
      and pl.id not in (select lesson_id from sync_fresh)
  )
  or (
    exists (
      select 1
      from public.lesson_progress p
      join public.lessons pl on pl.id = p.lesson_id and pl.status = 'published'
      join public.units pu on pu.id = pl.unit_id and pu.status = 'published'
      join public.sections ps on ps.id = pu.section_id
      where p.user_id = x.user_id and p.passed
        and pl.kind not in ('speak', 'slang', 'culture', 'story')
        and (ps.ordinal, pu.ordinal) > (ns.ordinal, nu.ordinal)
    )
    and not exists (
      select 1
      from public.lessons o
      where o.unit_id = n.unit_id and o.status = 'published'
        and o.kind not in ('speak', 'slang', 'culture', 'story')
        and o.id not in (select lesson_id from sync_fresh)
        and not exists (
          select 1 from public.lesson_progress p
          where p.user_id = x.user_id and p.lesson_id = o.id and p.passed
        )
    )
  )
on conflict (user_id, lesson_id) do nothing;

drop table sync_plan;
drop table sync_fresh;
drop table sync_converted;
`;
}
