// The course outline read from the database, in the shape loadOutline() gives
// for the YAML (docs/superplan-admin-palabras.md §7.2). The database is the
// source of truth: a word fixed or added in the admin is what the generator,
// the linter and the lesson builder see.
import { queryLinked } from './db.mjs';
import { ids } from './ids.mjs';

const live = (r) => r.status !== 'retired';
const byOrdinal = (a, b) => a.ordinal - b.ordinal;

/**
 * @param rows  the content tables as stored: sections, units, lessons, tips,
 *              lemmas, forms (with `position`).
 * @returns     { sections, units, lemmas, forms } like loadOutline().outline,
 *              without what was retired. Units carry their teaching and check
 *              lessons (not stories) and their tips in authored order.
 */
export function outlineFromRows(rows) {
  const sections = rows.sections
    .map(({ id, ordinal, slug, title_en, cefr, status }) => ({ id, ordinal, slug, title_en, cefr, status }))
    .sort(byOrdinal);
  const units = rows.units
    .filter(live)
    .sort((a, b) => a.course_order - b.course_order)
    .map((u) => {
      // A tip's id says where the outline listed it; one added in the admin goes last.
      const tipIndex = (t) => {
        for (let k = 0; k < 64; k++) if (ids.tip(u.slug, k) === t.id) return k;
        return 64;
      };
      return {
        id: u.id,
        section_id: u.section_id,
        ordinal: u.ordinal,
        course_order: u.course_order,
        slug: u.slug,
        title_en: u.title_en,
        summary_en: u.summary_en,
        grammar_focus: u.grammar_focus ?? [],
        register_max: u.register_max,
        status: u.status,
        sample: null,
        lessons: rows.lessons
          .filter((l) => l.unit_id === u.id && live(l) && l.kind !== 'story')
          .sort(byOrdinal)
          .map(({ id, unit_id, ordinal, title_en, kind, status }) => ({ id, unit_id, ordinal, title_en, kind, status })),
        tips: rows.tips
          .filter((t) => t.unit_id === u.id && live(t))
          .sort((a, b) => tipIndex(a) - tipIndex(b))
          .map(({ id, unit_id, title_en, body_md, status }) => ({ id, unit_id, title_en, body_md, status })),
      };
    });
  const unitById = new Map(units.map((u) => [u.id, u]));
  const lemmaById = new Map(rows.lemmas.filter(live).map((l) => [l.id, l]));

  const forms = rows.forms
    .filter((f) => live(f) && unitById.has(f.unit_id) && lemmaById.has(f.lemma_id))
    .map((f) => {
      const lemma = lemmaById.get(f.lemma_id);
      return {
        id: f.id,
        lemma_id: f.lemma_id,
        lemma: lemma.lemma,
        pos: lemma.pos,
        form: f.form,
        features: f.features ?? {},
        gloss_en: f.gloss_en ?? null,
        gloss_note_en: f.gloss_note_en ?? null,
        unit_id: f.unit_id,
        unit_order: unitById.get(f.unit_id).course_order,
        position: f.position,
        is_glue: lemma.is_glue,
        bound: f.bound === true,
        register: lemma.register,
        audio_path: f.audio_path ?? null,
        status: f.status,
      };
    })
    .sort((a, b) => a.unit_order - b.unit_order || a.position - b.position || a.form.localeCompare(b.form, 'es'));

  // A lemma belongs to the unit that first teaches one of its forms.
  const firstOrder = new Map();
  for (const f of forms) if (!firstOrder.has(f.lemma_id)) firstOrder.set(f.lemma_id, f.unit_order);
  const lemmas = [...lemmaById.values()]
    .filter((l) => firstOrder.has(l.id))
    .map((l) => ({
      id: l.id,
      lemma: l.lemma,
      pos: l.pos,
      gloss_en: l.gloss_en,
      gloss_note_en: l.gloss_note_en ?? null,
      register: l.register,
      is_glue: l.is_glue,
      notes_en: l.notes_en ?? null,
      status: l.status,
      unit_order: firstOrder.get(l.id),
    }))
    .sort((a, b) => a.unit_order - b.unit_order);

  return { sections, units, lemmas, forms };
}

/** The content tables of the linked project, in one round trip. */
export function loadCourseRows() {
  const [row] = queryLinked(`
    select json_build_object(
      'sections', (select coalesce(json_agg(x), '[]') from public.sections x),
      'units',    (select coalesce(json_agg(x), '[]') from public.units x),
      'lessons',  (select coalesce(json_agg(x), '[]') from public.lessons x),
      'tips',     (select coalesce(json_agg(x), '[]') from public.tips x),
      'lemmas',   (select coalesce(json_agg(x), '[]') from public.lemmas x),
      'forms',    (select coalesce(json_agg(x), '[]') from public.forms x)
    ) as course`);
  const course = row?.course;
  return typeof course === 'string' ? JSON.parse(course) : course;
}

export const loadOutlineFromDb = () => outlineFromRows(loadCourseRows());

// ---------------------------------------------------------------------------
// Where two outlines differ — the YAML against the database.
// ---------------------------------------------------------------------------

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const sortKeys = (o) => Object.fromEntries(Object.entries(o ?? {}).sort(([a], [b]) => a.localeCompare(b)));

const FIELDS = {
  units: ['section_id', 'ordinal', 'course_order', 'slug', 'title_en', 'summary_en', 'grammar_focus', 'register_max'],
  lessons: ['kind'],
  tips: ['title_en', 'body_md'],
  lemmas: ['lemma', 'pos', 'gloss_en', 'gloss_note_en', 'register', 'is_glue', 'notes_en'],
  forms: ['lemma_id', 'form', 'features', 'gloss_en', 'gloss_note_en', 'unit_id', 'position', 'bound'],
};

/**
 * What `a` (the YAML) has that `b` (the database) doesn't, has differently, or
 * lacks. Statuses and ordinals shifted by stories are not compared: the
 * database has its own.
 * @returns {{ added: {kind, id, label}[], changed: {kind, id, label, field, a, b}[], missing: {kind, id, label}[] }}
 */
export function diffOutlines(a, b) {
  const out = { added: [], changed: [], missing: [] };
  const lists = (o) => ({
    units: o.units,
    lessons: o.units.flatMap((u) => u.lessons),
    tips: o.units.flatMap((u) => u.tips),
    lemmas: o.lemmas,
    forms: o.forms,
  });
  const la = lists(a);
  const lb = lists(b);
  const label = (kind, r) =>
    kind === 'forms' ? r.form : kind === 'lemmas' ? `${r.lemma} (${r.pos})` : kind === 'units' ? r.slug : r.title_en ?? r.id;
  for (const kind of Object.keys(FIELDS)) {
    const inB = new Map(lb[kind].map((r) => [r.id, r]));
    const inA = new Set(la[kind].map((r) => r.id));
    for (const r of la[kind]) {
      const other = inB.get(r.id);
      if (!other) {
        out.added.push({ kind, id: r.id, label: label(kind, r) });
        continue;
      }
      for (const field of FIELDS[kind]) {
        const x = field === 'features' ? sortKeys(r[field]) : r[field];
        const y = field === 'features' ? sortKeys(other[field]) : other[field];
        if (!same(x, y)) out.changed.push({ kind, id: r.id, label: label(kind, other), field, a: r[field], b: other[field] });
      }
    }
    for (const r of lb[kind]) if (!inA.has(r.id)) out.missing.push({ kind, id: r.id, label: label(kind, r) });
  }
  return out;
}
