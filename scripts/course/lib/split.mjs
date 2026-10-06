// A unit too big for the fixed shape (template.mjs) is split into parts, each
// a unit of its own. This works out what a proposed split does: whether each
// part fits, which sentences have to move to a later part (they use a word
// that part teaches), and which words are left short of sentences. Pure.
import { drillable } from './outline.mjs';
import { costOf, lightForms, overflow } from './template.mjs';

const fold = (s) => String(s).toLocaleLowerCase('es').trim();
/** A word as a split names it: "lemma", or "lemma/pos" where two share the spelling. */
const named = (f, ref) => {
  const [lemma, pos] = fold(ref).split('/');
  return fold(f.lemma) === lemma && (!pos || f.pos === pos);
};

/** Sentences a word wants of its own (lessons.mjs warns under this). */
export const SENTENCES_WANTED = 3;

/**
 * @param unit       outline unit
 * @param forms      outline forms (every unit)
 * @param sentences  the unit's published sentences ({id, es, target_form_id, tokens})
 * @param parts      [{ words: string[] }, …] in order; the first keeps the unit
 * @returns {{ errors: string[], parts: { forms, words, cost, moved, thin }[] , partOfForm: Map, partOfSentence: Map }}
 */
export function evaluateSplit({ unit, forms, sentences, parts }) {
  const errors = [];
  const own = forms.filter((f) => f.unit_id === unit.id);
  const teachable = own.filter(drillable);
  const known = new Set(forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.lemma_id));

  // Each of the unit's words goes to exactly one part.
  const partOfLemma = new Map();
  parts.forEach((part, i) => {
    for (const ref of part.words ?? []) {
      const hits = [...new Set(own.filter((f) => named(f, ref)).map((f) => f.lemma_id))];
      if (hits.length === 0) errors.push(`part ${i + 1}: "${ref}" is not a word of ${unit.slug}`);
      else if (hits.length > 1) errors.push(`part ${i + 1}: "${ref}" names ${hits.length} words — write "word/pos"`);
      else if (partOfLemma.has(hits[0])) errors.push(`part ${i + 1}: "${ref}" is already in part ${partOfLemma.get(hits[0]) + 1}`);
      else partOfLemma.set(hits[0], i);
    }
  });
  const missing = [...new Set(teachable.filter((f) => !partOfLemma.has(f.lemma_id)).map((f) => f.lemma))];
  if (missing.length) errors.push(`no part takes: ${missing.join(', ')}`);

  // A form that is never drilled (glue, a bound form) stays with the first
  // part unless its word was named: taught earlier is always safe.
  const partOfForm = new Map(own.map((f) => [f.id, partOfLemma.get(f.lemma_id) ?? 0]));
  // A sentence lives in the last part any of its words is taught in.
  const formIds = (s) => [...new Set((s.tokens ?? []).flatMap((t) => t.form_ids ?? []))];
  const partOfSentence = new Map(sentences.map((s) => [s.id, Math.max(0, ...formIds(s).filter((id) => partOfForm.has(id)).map((id) => partOfForm.get(id)))]));

  const out = [];
  const met = new Set(known);
  parts.forEach((part, i) => {
    // In the order the part lists its words, a word's forms in the unit's order.
    const order = new Map((part.words ?? []).map((ref, k) => [k, ref]));
    const mine = teachable
      .filter((f) => partOfForm.get(f.id) === i)
      .sort((a, b) => [...order.values()].findIndex((ref) => named(a, ref)) - [...order.values()].findIndex((ref) => named(b, ref)) || a.position - b.position);
    const light = lightForms(mine, met);
    const words = new Set(mine.map((f) => f.lemma_id)).size;
    const cost = costOf(mine, light);
    const why = overflow(mine, light);
    if (why) errors.push(`part ${i + 1}: ${why}`);
    if (!mine.length) errors.push(`part ${i + 1}: teaches nothing`);
    const moved = sentences.filter((s) => partOfForm.get(s.target_form_id) === i && partOfSentence.get(s.id) > i);
    const thin = mine
      .map((f) => ({ form: f, has: sentences.filter((s) => s.target_form_id === f.id && partOfSentence.get(s.id) === i).length }))
      .filter((x) => x.has < SENTENCES_WANTED);
    out.push({ forms: mine, words, cost, moved, thin });
    for (const f of mine) met.add(f.lemma_id);
  });
  return { errors, parts: out, partOfForm, partOfSentence };
}

/**
 * The course's rows as they would be after `splits`, for planning over without
 * writing anything: the new units in place, the road renumbered, forms, tips
 * and sentences moved to their parts. The migration (split-units.mjs --sql)
 * does the same to the database.
 *
 * @param rows            { sections, units, lessons, tips, lemmas, forms } as stored
 * @param outline         outlineFromRows(rows)
 * @param sentencesByUnit Map unit id -> published sentence rows
 * @param splits          { [unit slug]: parts }
 * @param unitId          (slug) => id for a new unit
 * @returns {{ rows, sentencesByUnit, errors }}
 */
export function applySplits({ rows, outline, sentencesByUnit, splits, unitId }) {
  const errors = [];
  const formUnit = new Map();
  const formPosition = new Map();
  const tipUnit = new Map();
  const sentenceUnit = new Map();
  const added = new Map(); // unit id -> new unit rows after it
  const newTips = [];
  for (const [slug, parts] of Object.entries(splits)) {
    const unit = outline.units.find((u) => u.slug === slug && u.status === 'published');
    if (!unit) {
      errors.push(`${slug}: no such published unit`);
      continue;
    }
    const sentences = sentencesByUnit.get(unit.id) ?? [];
    const result = evaluateSplit({ unit, forms: outline.forms, sentences, parts });
    for (const e of result.errors) errors.push(`${slug}: ${e}`);
    const units = parts.map((part, i) =>
      i === 0
        ? { id: unit.id }
        : { id: unitId(part.slug), section_id: unit.section_id, slug: part.slug, title_en: part.title, summary_en: part.summary, grammar_focus: unit.grammar_focus, register_max: unit.register_max, review_form_ids: [], status: 'published' },
    );
    added.set(unit.id, units.slice(1));
    result.parts.forEach((p, i) => p.forms.forEach((f, k) => (formUnit.set(f.id, units[i].id), formPosition.set(f.id, k + 1))));
    for (const s of sentences) if (result.partOfSentence.get(s.id) > 0) sentenceUnit.set(s.id, units[result.partOfSentence.get(s.id)].id);
    parts.forEach((part, i) => {
      for (const title of part.tips ?? []) {
        for (const tip of unit.tips.filter((t) => t.title_en === title)) tipUnit.set(tip.id, units[i].id);
      }
      (part.new_tips ?? []).forEach((t, k) => newTips.push({ id: `${units[i].id}:tip:${k}`, unit_id: units[i].id, title_en: t.title, body_md: t.body, status: 'published' }));
    });
  }

  const road = [];
  for (const u of [...rows.units].sort((a, b) => a.course_order - b.course_order)) {
    road.push({ ...u });
    for (const n of added.get(u.id) ?? []) road.push({ ...n });
  }
  const ordinalIn = new Map();
  let order = 0;
  for (const u of road) {
    if (u.status === 'retired') continue;
    u.course_order = ++order;
    ordinalIn.set(u.section_id, (ordinalIn.get(u.section_id) ?? 0) + 1);
    u.ordinal = ordinalIn.get(u.section_id);
  }
  const moved = new Map();
  for (const [unitIdOf, list] of sentencesByUnit) {
    for (const s of list) {
      const to = sentenceUnit.get(s.id) ?? unitIdOf;
      moved.set(to, [...(moved.get(to) ?? []), sentenceUnit.has(s.id) ? { ...s, unit_id: to } : s]);
    }
  }
  return {
    rows: {
      ...rows,
      units: road,
      forms: rows.forms.map((f) => (formUnit.has(f.id) ? { ...f, unit_id: formUnit.get(f.id), position: formPosition.get(f.id) } : f)),
      tips: [...rows.tips.map((t) => (tipUnit.has(t.id) ? { ...t, unit_id: tipUnit.get(t.id) } : t)), ...newTips],
    },
    sentencesByUnit: moved,
    errors,
  };
}
