#!/usr/bin/env node
// Deals the slang cards of every unit's slang lesson: Argentine words from the
// Words tab (docs/argentine/words.yaml), shown as cards with a short quiz, the
// way a slang class always played. It rewrites the `slang` entries of
// src/lib/unit-extras.json, which the app ships with.
//
//   npm run course:slang-cards [-- --dry-run]
//
// A lesson gets as many cards as lib/template.mjs says (`slangWordsFor`): two
// in the first sections, then one. Which ones:
//   1. the words the unit's slang lesson teaches as course words
//      (docs/course/slang-lessons.yaml) that have a card: after the cards the
//      lesson goes on to drill those in sentences (`slang_course`);
//   2. then the most useful word not used yet — said every day before very
//      common before common, easy before hard — and, of the few most useful,
//      one whose theme fits the unit. How hard a word may be grows with the
//      course, and a beginner gets no verbs, no insults and no politics,
//      countryside or back-slang. Never a rude word, never an old-fashioned
//      one, never a word the course has already taught by that unit — one it
//      teaches later is welcome: "che" on a card in the first unit, in a
//      lesson of its own a few units on. A word is used once.
import { readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { loadSlangPlan } from './lib/course-plan.mjs';
import { slangWordsFor } from './lib/template.mjs';
import { loadCourseRows } from './lib/vocabulary.mjs';

const dryRun = process.argv.includes('--dry-run');
const root = new URL('../../', import.meta.url);
const PLAN = new URL('src/lib/unit-extras.json', root);
const plan = JSON.parse(readFileSync(PLAN, 'utf8'));
const cards = JSON.parse(readFileSync(new URL('src/lib/argentine.json', root), 'utf8'));
const source = parse(readFileSync(new URL('docs/argentine/words.yaml', root), 'utf8')).words;

const fold = (s) => String(s).toLocaleLowerCase('es').normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const idOf = new Map(cards.packs.flatMap((p) => p.words.map((w) => [fold(w.es), w.id])));

const rows = loadCourseRows();
const sectionOrdinal = new Map(rows.sections.map((s) => [s.id, s.ordinal]));
const road = rows.units.filter((u) => u.status === 'published').sort((a, b) => a.course_order - b.course_order);
const lemmaById = new Map(rows.lemmas.map((l) => [l.id, l]));
const orderOf = new Map(rows.units.map((u) => [u.id, u.course_order]));
/** Spelling -> the first unit (course_order) that teaches it. */
const taughtAt = new Map();
for (const f of rows.forms) {
  if (f.status !== 'published' || !orderOf.has(f.unit_id)) continue;
  const at = orderOf.get(f.unit_id);
  for (const w of [f.form, lemmaById.get(f.lemma_id)?.lemma]) {
    if (w && (taughtAt.get(fold(w)) ?? Infinity) > at) taughtAt.set(fold(w), at);
  }
}
const coursePlan = loadSlangPlan();

/** How hard a card may be, by section: beginners get the easy ones only. */
const levelMax = (section) => (section <= 3 ? 1 : section <= 7 ? 2 : 3);
/** Themes a beginner's cards leave for later, unless the unit is about them. */
const LATER_THEMES = new Set(['politica', 'campo', 'vesre', 'lunfardo', 'futbol']);
const INSULT = /\b(idiot|fool|stupid|jerk|brat|bastard|dumb|moron|loser|liar|thief|drunk)\b/i;
/** May this word be a card of a unit in this section, with these themes? */
const fits = (w, section, themes) => {
  if (w.level > levelMax(section)) return false;
  if (section <= 3 && LATER_THEMES.has(w.theme) && !themes.has(w.theme)) return false;
  if (section <= 2 && INSULT.test(w.en)) return false;
  if (section <= 1 && w.pos === 'verb') return false;
  return true;
};
/** A word's place in line: said every day first, unranked last; then easy before hard. */
const importance = (w) => (w.rank ?? 4) * 10 + w.level;
/** Of the next few in line, one whose theme fits the unit goes first. */
const LOOKAHEAD = 10;
const THEMES = [
  ['comida', /cafe|comida|food|eat|pizza|helado|mate|factura|asado|parrill|fideos|feria|verduler|kiosco|snack|drink|tomar|hambre|merienda|desayun/],
  ['plata', /cuesta|sale|pay|pago|cobr|plata|money|precio|oferta|debito|credito|cuotas|bank|banco|sueldo|bills/],
  ['ciudad', /bondi|subte|taxi|tren|barrio|city|ciudad|plaza|direction|derecho|vuelta|calle|auto|car\b|ruta|viaje|trip/],
  ['casa', /casa|depto|edificio|building|cama|sillon|ropa|clothes|campera|buzo|colores|llaves|chores|tareas/],
  ['gente', /familia|family|tios|viejos|novi|amig|people|quien|altos|casados|enfermera|laburas|vecin/],
  ['futbol', /futbol|cancha|cuadro|partido|final\b|seleccion/],
  ['noche', /salir|boliche|fiesta|cumple|finde|previa|joda|bailar/],
  ['cuerpo', /duele|dolio|doctor|medico|hurt|cansad|enferm/],
  ['animo', /como-estas|nervios|feel|felt|bronca|contento|triste|susto|miedo/],
  ['plata', /laburo|work|job|facu|oficina|jefe/],
  ['charla', /hola|saludo|greet|buen-dia|entiendo|despacio|perdon|gracias|chat|decir|contar/],
];
const themesOf = (u) => {
  const hay = fold(`${u.slug} ${u.title_en} ${u.summary_en ?? ''}`);
  return new Set(THEMES.filter(([, re]) => re.test(hay)).map(([theme]) => theme));
};

const pool = source
  .filter((w) => idOf.has(fold(w.es)) && !w.vulgar && w.theme !== 'puteadas' && !/old/i.test(w.tag ?? ''))
  .map((w) => ({ ...w, id: idOf.get(fold(w.es)) }))
  .sort((a, b) => importance(a) - importance(b));
const used = new Set();
let withCards = 0;
let total = 0;
let drilled = 0;
for (const u of road) {
  const section = sectionOrdinal.get(u.section_id);
  const want = slangWordsFor(section);
  const own = coursePlan.get(u.slug) ?? new Set();
  const picked = pool.filter((w) => !used.has(w.id) && own.has(fold(w.es).normalize('NFC')) || (!used.has(w.id) && [...own].some((l) => fold(l) === fold(w.es)))).slice(0, want);
  for (const w of picked) used.add(w.id);
  const themes = themesOf(u);
  while (picked.length < want) {
    const fresh = (w) => !used.has(w.id) && (taughtAt.get(fold(w.es)) ?? Infinity) > u.course_order;
    let line = pool.filter((w) => fresh(w) && fits(w, section, themes));
    // Out of easy words this early: the next level up, rather than a lesson with no card.
    if (!line.length) line = pool.filter((w) => fresh(w) && fits({ ...w, level: w.level - 1 }, section, themes));
    if (!line.length) break;
    const next = line.slice(0, LOOKAHEAD).find((w) => themes.has(w.theme)) ?? line[0];
    used.add(next.id);
    picked.push(next);
  }
  const entry = (plan.units[u.slug] ??= {});
  if (picked.length) entry.slang = picked.map((w) => w.id);
  else delete entry.slang;
  if (own.size) entry.slang_course = true;
  else delete entry.slang_course;
  withCards += picked.length ? 1 : 0;
  total += picked.length;
  drilled += own.size ? 1 : 0;
}

console.log(`${total} cards in ${withCards} of ${road.length} units · ${drilled} lessons go on to drill course words · ${pool.length - used.size} cards left in the Words tab only`);
const first = road.slice(0, 30).map((u) => `${u.slug}: ${(plan.units[u.slug].slang ?? []).join(', ') || '—'}`);
console.log(first.join('\n'));
if (dryRun) console.log('--dry-run: nothing written');
else {
  writeFileSync(PLAN, `${JSON.stringify(plan, null, 1)}\n`);
  console.log('wrote src/lib/unit-extras.json');
}
