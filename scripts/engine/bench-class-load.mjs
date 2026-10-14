// What opening a class costs on the CPU, by how far along she is
// (docs/class-loading.md). Runs the app's own functions over the newest course
// snapshot in content/snapshots, for a learner who has done everything before
// the class's unit: once as the first class of a launch, once as the next.
//
//   npm run engine:bench
//
// Node on a desktop, so the phone's times are longer; what carries over is the
// shape — which step costs, and what a second class no longer pays. The
// network is not in it.
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Another checkout's src/lib can be named, to time it against this one.
const HERE = resolve(fileURLToPath(import.meta.url), '../../..');
const ROOT = resolve(process.argv[2] ?? HERE);
const lib = (name) => import(pathToFileURL(resolve(ROOT, 'src/lib', name)).href);
const sentencesLib = await lib('sentences.ts');
const meaningsLib = await lib('meanings.ts');
const { resolveSlots, hasFixedShape } = await lib('lesson.ts');
const { toSentence, glueSeen, passedScreens, blocksThrough } = sentencesLib;
const { withMeanings } = meaningsLib;

const SNAPSHOTS = resolve(HERE, 'content/snapshots');
const SNAP = resolve(SNAPSHOTS, readdirSync(SNAPSHOTS).filter((d) => /^\d{4}-\d\d-\d\d$/.test(d)).sort().at(-1));
const read = (f) => JSON.parse(readFileSync(resolve(SNAP, `${f}.json`), 'utf8'));
const published = (rows) => rows.filter((r) => r.status === 'published');

const units = published(read('units')).sort((a, b) => a.course_order - b.course_order);
const unitById = new Map(units.map((u) => [u.id, u]));
const lemmaById = new Map(read('lemmas').map((l) => [l.id, l]));
// form_entries, as the view hands it to the app.
const entries = published(read('forms')).flatMap((f) => {
  const lemma = lemmaById.get(f.lemma_id);
  const unit = unitById.get(f.unit_id);
  if (!lemma || !unit) return [];
  return [
    {
      ...f,
      gloss_en: f.gloss_en ?? lemma.gloss_en ?? '',
      lemma: lemma.lemma,
      pos: lemma.pos,
      is_glue: lemma.is_glue,
      register: lemma.register,
      unit_ordinal: unit.ordinal,
      unit_order: unit.course_order,
      section_id: unit.section_id,
    },
  ];
});
const COLUMNS = ['id', 'unit_id', 'es', 'en', 'en_alt', 'es_alt', 'note_en', 'audio_path', 'voice_id', 'target_form_id', 'difficulty', 'tokens'];
const sentenceRows = published(read('sentences'))
  .filter((s) => unitById.has(s.unit_id))
  .map((s) => Object.fromEntries(COLUMNS.map((c) => [c, s[c] ?? null])));
const rowsByUnit = Map.groupBy(sentenceRows, (s) => s.unit_id);
const lessons = published(read('lessons'));
const slotsByLesson = Map.groupBy(read('lesson_slots'), (s) => s.lesson_id);
const tips = read('tips');

// The gloss tallies as the database sums them (form_gloss_tallies).
const entryById = new Map(entries.map((f) => [f.id, f]));
const summed = new Map();
for (const s of sentenceRows.map((r) => toSentence(r, entryById))) {
  for (const t of s.tokens) {
    const text = t.gloss?.trim();
    if (!text) continue;
    for (const id of t.glue ? [...t.form_ids, t.glue] : t.form_ids) {
      const own = summed.get(id) ?? new Map();
      summed.set(id, own);
      const tally = own.get(text.toLowerCase()) ?? [text, 0, 0, Infinity];
      own.set(text.toLowerCase(), tally);
      tally[1] += 1;
      if (s.target_form_id === id) tally[2] += 1;
      tally[3] = Math.min(tally[3], s.unit_order ?? 0);
    }
  }
}
const tallies = Object.fromEntries([...summed].map(([id, own]) => [id, [...own.values()]]));

console.log(`${SNAP.split('/').at(-1)}: ${units.length} units, ${sentenceRows.length} sentences, ${entries.length} forms`);
console.log(`src/lib of ${ROOT}\n`);

const time = (fn) => {
  const from = performance.now();
  const out = fn();
  return [out, performance.now() - from];
};
const ms = (n) => `${n.toFixed(0).padStart(5)}`;

console.log('     |           |          |  parse | first class of a launch (ms)      | the next class (ms)');
console.log('unit | sentences |  on disk | blocks | shape  meanings  rest   total     | shape  meanings  rest   total');
for (const order of [8, 40, 100, 200, 300, units.at(-1).course_order]) {
  const unit = units.findLast((u) => u.course_order <= order);
  const blocks = blocksThrough(units, unit.course_order);
  // Each block as its file on the phone.
  const files = blocks.map((ids) => JSON.stringify({ format: 1, version: 'v', data: ids.flatMap((id) => rowsByUnit.get(id) ?? []) }));
  const bytes = files.reduce((n, f) => n + Buffer.byteLength(f), 0);
  const [parsed, parse] = time(() => files.map((f) => JSON.parse(f).data));

  // A launch starts with nothing kept: a lexicon of its own, no answers.
  const lexicon = entries.map((f) => ({ ...f }));
  const formById = new Map(lexicon.map((f) => [f.id, f]));
  meaningsLib.clearMeaningMemos?.();

  const states = lexicon
    .filter((f) => f.unit_order < unit.course_order)
    .map((f, i) => ({
      form_id: f.id,
      user_id: 'u',
      state: 'review',
      ease_factor: 2.5,
      interval_days: 3,
      repetitions: 2,
      lapses: i % 7 === 0 ? 1 : 0,
      due_at: new Date(Date.now() + (i % 5 === 0 ? -1 : 2) * 86_400_000).toISOString(),
    }));
  const reached = Math.max(0, ...states.map((s) => formById.get(s.form_id)?.unit_order ?? 0));
  const unitLessons = lessons.filter((l) => l.unit_id === unit.id).sort((a, b) => a.ordinal - b.ordinal);
  const lesson = unitLessons.find((l) => l.kind === 'lesson') ?? unitLessons[0];
  const slots = (slotsByLesson.get(lesson.id) ?? []).sort((a, b) => a.ordinal - b.ordinal);
  const unitTips = tips.filter((t) => t.unit_id === unit.id);

  let rows = null;
  const open = () => {
    const [sentences, shape] = time(() => {
      // The merge and the sort are kept after the first (loadSentenceRowsInReach).
      if (!rows || !sentencesLib.sentencesOf) {
        const byId = new Map();
        for (const block of parsed) for (const r of block) byId.set(r.id, r);
        rows = [...byId.values()].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
      }
      const shown = rows
        .filter((r) => (unitById.get(r.unit_id)?.course_order ?? 0) < unit.course_order)
        .map((r) => ({ sentence_id: r.id, shown_count: 2, correct_count: 2, last_shown_at: '2026-10-01T00:00:00Z' }));
      if (sentencesLib.sentencesOf) return sentencesLib.sentencesOf(rows, lexicon, shown);
      const shownBy = new Map(shown.map((s) => [s.sentence_id, s]));
      return rows.map((r) => toSentence(r, formById, shownBy.get(r.id)));
    });
    const [forms, meanings] = time(() => withMeanings(lexicon, sentences, reached, tallies));
    const [session, rest] = time(() => {
      passedScreens(sentences);
      glueSeen(sentences);
      const data = {
        forms,
        formById: new Map(forms.map((f) => [f.id, f])),
        states,
        stateByForm: new Map(states.map((s) => [s.form_id, s])),
        sentences,
      };
      return resolveSlots(data, unit, slots, unitTips, false, new Date(), hasFixedShape(unitLessons.map((l) => l.kind)));
    });
    return { shape, meanings, rest, total: shape + meanings + rest, sentences: sentences.length, screens: session.items.length };
  };
  const first = open();
  const next = open();
  const cells = (o) => `${ms(o.shape)}  ${ms(o.meanings)}   ${ms(o.rest)}   ${ms(o.total)}`;
  console.log(
    `${String(unit.course_order).padStart(4)} | ${String(first.sentences).padStart(9)} | ${(bytes / 1e6).toFixed(1).padStart(5)} MB | ${ms(parse)}  | ${cells(first)}     | ${cells(next)}`,
  );
}
