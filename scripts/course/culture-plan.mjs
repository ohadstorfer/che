#!/usr/bin/env node
// Deals the culture classes for the fixed unit shape (lib/template.mjs): one
// to each unit from the start of the road. When they run out it starts again
// from the first, so every unit has one (until there are classes enough for
// the whole road). It rewrites the `culture` entries of
// src/lib/unit-extras.json, which the app ships with.
//
//   npm run course:culture-plan [-- --dry-run]
//
// The order is the one the classes already had along the road (everyday life
// early, history and the provinces late: unit-extras.mjs planned that), then
// any class not yet on it. The swearing classes stay with the unit they were
// planned for.
import { readFileSync, writeFileSync } from 'node:fs';

import { loadCourseRows } from './lib/vocabulary.mjs';

const dryRun = process.argv.includes('--dry-run');
const PLAN = new URL('../../src/lib/unit-extras.json', import.meta.url);
const plan = JSON.parse(readFileSync(PLAN, 'utf8'));
const culture = JSON.parse(readFileSync(new URL('../../src/lib/culture.json', import.meta.url), 'utf8'));
/** Classes that belong to one unit and nowhere else. */
const PINNED = new Set(['puteadas']);

const road = loadCourseRows().units.filter((u) => u.status === 'published').sort((a, b) => a.course_order - b.course_order);
const key = (c) => `${c.section}/${c.class}`;
const all = culture.sections.filter((s) => !PINNED.has(s.slug)).flatMap((s) => s.classes.map((c) => ({ section: s.slug, class: c.slug })));
const known = new Set(all.map(key));
const sequence = [];
const taken = new Set();
for (const u of road) {
  const c = plan.units[u.slug]?.culture;
  if (c && known.has(key(c)) && !taken.has(key(c))) {
    taken.add(key(c));
    sequence.push(c);
  }
}
for (const c of all) if (!taken.has(key(c))) sequence.push(c);

let changed = 0;
road.forEach((u, i) => {
  const entry = (plan.units[u.slug] ??= {});
  // Past the last class, round again from the first.
  const next = sequence[i % sequence.length];
  if (entry.culture && PINNED.has(entry.culture.section)) return;
  if (!entry.culture || key(entry.culture) !== key(next)) changed += 1;
  entry.culture = next;
});
// In the road's order, as the file is read by people too.
plan.units = Object.fromEntries([...road.map((u) => [u.slug, plan.units[u.slug] ?? {}]), ...Object.entries(plan.units).filter(([slug]) => !road.some((u) => u.slug === slug))]);
plan.culture_units = road.length;

const rounds = Math.ceil(road.length / sequence.length);
console.log(`${sequence.length} classes → all ${road.length} units (${rounds} rounds) · ${changed} units change class`);
if (dryRun) console.log('--dry-run: nothing written');
else {
  writeFileSync(PLAN, `${JSON.stringify(plan, null, 1)}\n`);
  console.log('wrote src/lib/unit-extras.json');
}
