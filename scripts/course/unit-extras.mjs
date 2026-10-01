#!/usr/bin/env node
// Plans the three classes every unit gets besides its own lessons: a chat with
// Pancho about the unit, three slang words, and a culture class. Which words
// and which class each unit plays is decided here, once, and shipped with the
// app (src/lib/unit-extras.json); the lessons themselves are rows on the road
// (kinds speak · slang · culture), written by the migration this also prints.
//
//   Slang    three words a unit, easiest first: every level-1 word ("everyone
//            says it") before any level-2, level-3 last. Within a level, slang
//            before regional names for things, and the themes take turns, so
//            one class isn't three kinds of food. The
//            rude theme and the words the course teaches itself are left out.
//            Once the words run out, units have no slang class.
//   Culture  the first class of every section, then every second one, and so
//            on, sections in a beginner-friendly order (the rude one left out).
//            Once the classes run out, units have no culture class.
//   Speaking every unit.
//
//   npm run course:extras -- [<snapshot date>] [--sql <migration file>]
//
// With --sql it also writes the migration that puts the lessons on the road.
// That migration only touches units that have none of the three yet, so a
// later run (more words, more classes) gets a migration of its own.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

import { q } from './lib/sql.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

const argv = process.argv.slice(2);
const sqlAt = argv.indexOf('--sql');
const sqlFile = sqlAt >= 0 ? argv[sqlAt + 1] : null;
const dates = readdirSync(new URL('content/snapshots/', root)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
const date = argv.find((a, i) => !a.startsWith('--') && i !== sqlAt + 1) ?? dates.at(-1);
const snap = (name) => read(`content/snapshots/${date}/${name}.json`);

// ---------------------------------------------------------------------------
// The road, as course.ts assemble() draws it.
// ---------------------------------------------------------------------------

const sections = snap('sections').filter((s) => s.status === 'published');
const sectionOrdinal = new Map(sections.map((s) => [s.id, s.ordinal]));
const lessons = snap('lessons').filter((l) => l.status === 'published');
const withLessons = new Set(lessons.map((l) => l.unit_id));
const road = snap('units')
  .filter((u) => u.status === 'published' && sectionOrdinal.has(u.section_id) && withLessons.has(u.id))
  .sort((a, b) => sectionOrdinal.get(a.section_id) - sectionOrdinal.get(b.section_id) || a.ordinal - b.ordinal);

// ---------------------------------------------------------------------------
// Slang
// ---------------------------------------------------------------------------

const fold = (s) =>
  s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

// Everything the course teaches, by spelling and by lemma (argentine.ts knownIn).
const lemmaById = new Map(snap('lemmas').map((l) => [l.id, l.lemma]));
const taught = new Set();
for (const f of snap('forms')) {
  if (f.status !== 'published') continue;
  taught.add(fold(f.form));
  if (lemmaById.has(f.lemma_id)) taught.add(fold(lemmaById.get(f.lemma_id)));
}

const argentine = read('src/lib/argentine.json');
// The words carry a level but no frequency, and a theme's packs run
// alphabetically. So within a level, slang comes first — how people talk — and
// the regional names for things (artichoke, stapler) after it. Vesre and old
// lunfardo close each tier.
const SLANG_FIRST = ['charla', 'expresiones', 'gente', 'animo', 'verbos', 'noche', 'plata', 'futbol', 'lunfardo', 'vesre'];
const THINGS_LATER = ['comida', 'ciudad', 'casa', 'cuerpo', 'politica', 'campo'];
const TIERS = [SLANG_FIRST, THINGS_LATER];
const clean = new Set(argentine.themes.filter((t) => !t.vulgar).map((t) => t.slug));
for (const t of clean) {
  if (!TIERS.flat().includes(t)) throw new Error(`slang theme ${t} has no place in SLANG_FIRST or THINGS_LATER`);
}
const themes = TIERS.flat().filter((t) => clean.has(t));
const seen = new Set();
/** Per level, per theme: its words in pack order. */
const queues = [1, 2, 3].map(() => new Map(themes.map((t) => [t, []])));
for (const pack of argentine.packs) {
  if (pack.vulgar || !themes.includes(pack.theme)) continue;
  for (const w of pack.words) {
    if (seen.has(w.id) || taught.has(fold(w.es))) continue;
    seen.add(w.id);
    queues[w.level - 1].get(pack.theme).push(w.id);
  }
}
const slangOrder = [];
for (const byTheme of queues) {
  for (const tier of TIERS) {
    // The themes of a tier take turns, a word each.
    const lists = tier.filter((t) => clean.has(t)).map((t) => byTheme.get(t)).filter((l) => l.length);
    for (let i = 0; lists.some((l) => i < l.length); i++) {
      for (const l of lists) if (i < l.length) slangOrder.push(l[i]);
    }
  }
}
const SLANG_PER_UNIT = 3;

// ---------------------------------------------------------------------------
// Culture
// ---------------------------------------------------------------------------

/** Easy and everyday first; history and the regions once she has some Spanish. */
const CULTURE_ORDER = [
  'mate', 'asado', 'comida', 'alfajores', 'futbol', 'costumbres', 'buenos-aires', 'habla',
  'musica', 'tango', 'dichos', 'iconos', 'regiones', 'historia-nacimiento', 'historia-moderna',
];
const culture = read('src/lib/culture.json').sections;
for (const s of culture) {
  if (!CULTURE_ORDER.includes(s.slug) && s.slug !== 'puteadas') throw new Error(`culture section ${s.slug} has no place in CULTURE_ORDER`);
}
const cultureOrder = [];
const deepest = Math.max(...culture.map((s) => s.classes.length));
for (let round = 0; round < deepest; round++) {
  for (const slug of CULTURE_ORDER) {
    const cls = culture.find((s) => s.slug === slug)?.classes[round];
    if (cls) cultureOrder.push({ section: slug, class: cls.slug });
  }
}

// ---------------------------------------------------------------------------
// Out
// ---------------------------------------------------------------------------

const units = {};
road.forEach((u, i) => {
  const slang = slangOrder.slice(i * SLANG_PER_UNIT, (i + 1) * SLANG_PER_UNIT);
  units[u.slug] = {
    ...(slang.length === SLANG_PER_UNIT ? { slang } : {}),
    ...(cultureOrder[i] ? { culture: cultureOrder[i] } : {}),
  };
});
writeFileSync(new URL('src/lib/unit-extras.json', root), `${JSON.stringify({ snapshot: date, units }, null, 1)}\n`);

const slangUnits = Object.values(units).filter((u) => u.slang).length;
const cultureUnits = Object.values(units).filter((u) => u.culture).length;
console.log(`snapshot ${date}: ${road.length} units`);
console.log(`  slang    ${slangOrder.length} words → ${slangUnits} units (through unit ${slangUnits})`);
console.log(`  culture  ${cultureOrder.length} classes → ${cultureUnits} units (through unit ${cultureUnits})`);
console.log(`  speaking ${road.length} units`);
console.log('wrote src/lib/unit-extras.json');

if (sqlFile) {
  const rows = road.map((u) => `  (${q(u.slug)}, ${!!units[u.slug].slang}, ${!!units[u.slug].culture})`).join(',\n');
  writeFileSync(new URL(sqlFile, root), migration(rows));
  console.log(`wrote ${sqlFile}`);
}

function migration(rows) {
  return `-- ---------------------------------------------------------------------------
-- Three more classes in every unit (scripts/course/unit-extras.mjs wrote this):
--   speak    a chat with Pancho about the unit (hablar kind 'unit')
--   slang    three Argentine words (src/lib/unit-extras.json says which)
--   culture  a culture class (the same file says which)
-- They are lessons like any other on the road: circles on the path, walked in
-- order, and finished through finish_lesson. What they play lives in the app;
-- the rows only give them their place.
--
-- In a unit: slang a third of the way in, culture two thirds in, the chat
-- last, just before the unit check. A learner already past one of them has it
-- done for her, so nobody is sent back down the road.
-- ---------------------------------------------------------------------------

alter table public.lessons drop constraint lessons_kind_check;
alter table public.lessons add constraint lessons_kind_check
  check (kind in ('lesson', 'practice', 'story', 'listening', 'review', 'checkpoint', 'speak', 'slang', 'culture'));

create temp table unit_extras (slug text primary key, slang boolean not null, culture boolean not null);
insert into unit_extras (slug, slang, culture) values
${rows};

-- The road, numbered the way the app draws it (course.ts assemble).
create temp table extras_road as
select u.id as unit_id, row_number() over (order by s.ordinal, u.ordinal) as n
from public.units u
join public.sections s on s.id = u.section_id
where u.status = 'published'
  and s.status = 'published'
  and exists (select 1 from public.lessons l where l.unit_id = u.id and l.status = 'published');

do $$
declare
  u record;
  body uuid[];
  checks uuid[];
  seq uuid[];
  m int;
  a int;
  b int;
  v_slang uuid;
  v_culture uuid;
  v_speak uuid;
  i int;
begin
  for u in
    select un.id, ex.slang, ex.culture, r.n
    from unit_extras ex
    join public.units un on un.slug = ex.slug
    join extras_road r on r.unit_id = un.id
    where not exists (
      select 1 from public.lessons l where l.unit_id = un.id and l.kind in ('speak', 'slang', 'culture')
    )
  loop
    select coalesce(array_agg(id order by ordinal), '{}') into body
    from public.lessons where unit_id = u.id and status = 'published' and kind <> 'review';
    select coalesce(array_agg(id order by ordinal), '{}') into checks
    from public.lessons where unit_id = u.id and status = 'published' and kind = 'review';
    m := coalesce(array_length(body, 1), 0);
    a := greatest(1, round(m / 3.0)::int);
    b := greatest(a, round(2 * m / 3.0)::int);

    -- Out of the way while the unit is renumbered: drafts and retired lessons
    -- low enough to collide go past the end, the published ones go negative.
    update public.lessons l set ordinal = 31000 + p.k
    from (
      select id, row_number() over (order by ordinal) as k
      from public.lessons where unit_id = u.id and status <> 'published' and ordinal < 1000
    ) p
    where l.id = p.id;
    update public.lessons set ordinal = -ordinal where unit_id = u.id and status = 'published';

    v_slang := case when u.slang then gen_random_uuid() end;
    v_culture := case when u.culture then gen_random_uuid() end;
    v_speak := gen_random_uuid();
    insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
    select id, u.id, -1000 - k, title, kind, 'published'
    from (values (v_slang, 1, 'Slang', 'slang'), (v_culture, 2, 'Culture', 'culture'), (v_speak, 3, 'Speaking', 'speak'))
      as t(id, k, title, kind)
    where id is not null;

    seq := body[1:a]
      || case when v_slang is null then '{}'::uuid[] else array[v_slang] end
      || body[a + 1:b]
      || case when v_culture is null then '{}'::uuid[] else array[v_culture] end
      || body[b + 1:m]
      || array[v_speak]
      || checks;
    for i in 1 .. array_length(seq, 1) loop
      update public.lessons set ordinal = i where id = seq[i];
    end loop;
  end loop;
end;
$$;

-- Done already for whoever is past it: every lesson before it on the road
-- was finished. Progress further on doesn't count by itself — a learner can
-- have some past where she stands (a unit tested into, an older road), and
-- the classes between would be skipped (fixed in 20260930000003).
with road as (
  select l.id, l.kind, row_number() over (order by s.ordinal, u.ordinal, l.ordinal) as pos
  from public.lessons l
  join public.units u on u.id = l.unit_id and u.status = 'published'
  join public.sections s on s.id = u.section_id and s.status = 'published'
  where l.status = 'published'
),
learners as (select distinct user_id from public.lesson_progress),
frontier as (
  select lr.user_id, (
    select min(r.pos) from road r
    where r.kind not in ('speak', 'slang', 'culture')
      and not exists (select 1 from public.lesson_progress p where p.user_id = lr.user_id and p.lesson_id = r.id)
  ) as pos
  from learners lr
)
insert into public.lesson_progress (user_id, lesson_id, score, attempts, passed, passed_by)
select f.user_id, r.id, null::smallint, 0::smallint, true, 'placement'
from frontier f
join road r on r.kind in ('speak', 'slang', 'culture') and (f.pos is null or r.pos < f.pos)
on conflict (user_id, lesson_id) do nothing;

drop table unit_extras;
drop table extras_road;
`;
}
