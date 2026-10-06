// What a unit's lesson rows become when it takes the fixed shape
// (template.mjs): which rows stay and as what, which are retired, which are
// new. Pure — template-lessons.mjs turns the answer into a migration, and the
// preview plans lessons over it without writing anything.
//
// Rows keep their ids wherever a row can be kept, because a learner's progress
// is by lesson id: the first three teaching lessons stay the teaching lessons,
// the unit's practice stays its practice, the check stays the check. Nothing
// is deleted; what the shape has no place for is retired.
import { uuid5 } from './ids.mjs';

export const GRAMMAR_TITLE = 'Grammar practice';
const TITLE = { slang: 'Slang', culture: 'Culture', speak: 'Speaking', practice: 'Practice', review: 'Unit check' };
/** Kinds the path doesn't show: they keep their rows, after the check. */
const HIDDEN = new Set(['story', 'listening']);

const byOrdinal = (a, b) => a.ordinal - b.ordinal;

/**
 * @param unit     { id, slug, review_form_ids }
 * @param lessons  every lesson row of the unit, any status
 * @param culture  whether the unit has a culture class to give
 * @returns {{ rows: {id, kind, title_en, ordinal, was: row|null}[], retired: row[] }}
 *   `rows` is the unit's published lessons in order, 1..n. `was` is the row as
 *   it is now, null for a row to insert.
 */
export function shapeUnit({ unit, lessons, culture }) {
  const mine = lessons.filter((l) => l.unit_id === unit.id).sort(byOrdinal);
  const live = mine.filter((l) => l.status === 'published');
  const taken = new Set();
  const out = [];
  const keep = (row, kind, title) => {
    taken.add(row.id);
    out.push({ id: row.id, kind, title_en: title, was: row });
  };
  const mint = (id, kind, title) => {
    // A row with this id from an earlier run of the course comes back as itself.
    const row = mine.find((l) => l.id === id) ?? null;
    taken.add(id);
    out.push({ id, kind, title_en: title, was: row });
  };
  /** The first id of its series the unit isn't using: a new one, or a row retired earlier. */
  const spare = (prefix) => {
    for (let k = 1; ; k++) {
      const id = uuid5(`lesson:${unit.slug}:${prefix}:${k}`);
      if (taken.has(id)) continue;
      const row = mine.find((l) => l.id === id);
      if (!row || row.status !== 'published') return id;
    }
  };

  const practiceUnit = (unit.review_form_ids ?? []).length > 0;
  const teachingRows = live.filter((l) => l.kind === 'lesson' || l.kind === 'checkpoint');
  const practiceRows = [
    ...live.filter((l) => l.kind === 'practice' && l.title_en !== GRAMMAR_TITLE),
    ...live.filter((l) => l.kind === 'practice' && l.title_en === GRAMMAR_TITLE),
  ];
  // A practice unit teaches nothing: its practice lessons are its lessons.
  const lessonPool = practiceUnit ? [...teachingRows, ...practiceRows.slice(0, Math.max(0, practiceRows.length - 1))] : teachingRows;
  const teach = (n) => {
    const row = lessonPool[n - 1];
    if (row) keep(row, 'lesson', `Lesson ${n}`);
    else mint(spare('extra'), 'lesson', `Lesson ${n}`);
  };
  const extra = (kind) => {
    const row = live.find((l) => l.kind === kind) ?? mine.find((l) => l.kind === kind && l.id === uuid5(`lesson:${unit.slug}:${kind}`)) ?? mine.find((l) => l.kind === kind);
    if (row) keep(row, kind, TITLE[kind]);
    else mint(uuid5(`lesson:${unit.slug}:${kind}`), kind, TITLE[kind]);
  };

  teach(1);
  teach(2);
  extra('slang');
  teach(3);
  const practice = practiceRows.find((l) => !taken.has(l.id));
  if (practice) keep(practice, 'practice', TITLE.practice);
  else mint(spare('practice'), 'practice', TITLE.practice);
  if (culture) extra('culture');
  extra('speak');
  const check = live.filter((l) => l.kind === 'review').at(-1);
  if (check) keep(check, 'review', TITLE.review);
  else mint(uuid5(`lesson:${unit.slug}:check`), 'review', TITLE.review);
  for (const l of live) if (HIDDEN.has(l.kind)) keep(l, l.kind, l.title_en);

  return {
    rows: out.map((r, i) => ({ ...r, ordinal: i + 1 })),
    retired: live.filter((l) => !taken.has(l.id)),
  };
}

/** The lesson rows of the whole course with `units` reshaped: for planning lessons over, nothing written. */
export function shapedLessons({ units, lessons, hasCulture }) {
  const reshaped = new Set(units.map((u) => u.id));
  const out = lessons.filter((l) => !reshaped.has(l.unit_id));
  for (const unit of units) {
    const { rows, retired } = shapeUnit({ unit, lessons, culture: hasCulture(unit) });
    for (const r of rows) out.push({ ...(r.was ?? {}), id: r.id, unit_id: unit.id, kind: r.kind, title_en: r.title_en, ordinal: r.ordinal, status: 'published' });
    for (const r of retired) out.push({ ...r, status: 'retired' });
    const touched = new Set([...rows.map((r) => r.id), ...retired.map((r) => r.id)]);
    for (const l of lessons) if (l.unit_id === unit.id && !touched.has(l.id)) out.push(l);
  }
  return out;
}
