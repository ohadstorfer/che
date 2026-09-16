// Proposes a unit's lesson slots from its approved sentences (docs/course-spec
// §4 "Assemble", shaped by docs/learning-engine-spec.md §5): the unit's new
// forms spread over its teaching lessons, each one taught, met in a sentence
// for its meaning, then drilled harder — and a last lesson that is the unit
// check. Pure; the reviewer reorders the proposal in the dashboard.

const drillable = (f) => !f.is_glue && f.pos !== 'propn';

/** Words per build step: meaning first, then a gap, tiles last (§5.2 ramp). */
const words = (s) => s.tokens.length;

/**
 * @param unit       outline unit (with lessons: [{id, ordinal, kind}])
 * @param forms      outline forms (all units)
 * @param sentences  approved or published sentence rows of this unit
 *                   ({id, target_form_id, tokens:[{form_ids}], difficulty})
 * @param tips       the unit's tips, in order
 * @returns {{ slots, warnings }}
 */
export function planLessons({ unit, forms, sentences, tips }) {
  const warnings = [];
  const formById = new Map(forms.map((f) => [f.id, f]));
  const unitForms = forms.filter((f) => f.unit_id === unit.id && drillable(f));
  const teaching = unit.lessons.filter((l) => l.kind === 'lesson' || l.kind === 'checkpoint');
  const check = unit.lessons.find((l) => l.kind === 'review');
  if (!teaching.length) return { slots: [], warnings: [`${unit.slug}: no teaching lessons`] };

  // Forms in outline order, split as evenly as the lessons allow.
  const per = Math.ceil(unitForms.length / teaching.length);
  const chunks = teaching.map((_, i) => unitForms.slice(i * per, (i + 1) * per));

  const taught = new Set(forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.id));
  const contentOf = (s) => [...new Set(s.tokens.flatMap((t) => t.form_ids))].filter((id) => formById.has(id) && drillable(formById.get(id)));
  const sayable = (s) => contentOf(s).every((id) => taught.has(id));
  const used = new Map(); // sentence id -> times used
  const use = (s) => used.set(s.id, (used.get(s.id) ?? 0) + 1);
  const bySize = [...sentences].sort((a, b) => words(a) - words(b) || a.difficulty - b.difficulty);

  const slots = [];
  const push = (lesson, slot) =>
    slots.push({
      lesson_id: lesson.id,
      ordinal: slots.filter((s) => s.lesson_id === lesson.id).length + 1,
      kind: slot.kind,
      form_id: slot.form_id ?? null,
      sentence_id: slot.sentence_id ?? null,
      tip_id: slot.tip_id ?? null,
      mode: slot.mode ?? null,
      review_count: slot.review_count ?? null,
      scope: slot.scope ?? null,
    });

  teaching.forEach((lesson, li) => {
    if (tips[li]) push(lesson, { kind: 'tip', tip_id: tips[li].id });
    const builds = [];
    for (const form of chunks[li]) {
      if (taught.has(form.id)) continue;
      // A word whose only sentences lean on another new word of this lesson
      // gets that word taught just before it.
      if (!bySize.some((s) => s.target_form_id === form.id && contentOf(s).every((id) => id === form.id || taught.has(id)))) {
        const helper = bySize.find(
          (s) =>
            s.target_form_id === form.id &&
            contentOf(s).every((id) => id === form.id || taught.has(id) || chunks[li].some((f) => f.id === id)),
        );
        for (const id of helper ? contentOf(helper) : []) {
          if (id === form.id || taught.has(id)) continue;
          push(lesson, { kind: 'teach', form_id: id });
          taught.add(id);
        }
      }
      push(lesson, { kind: 'teach', form_id: form.id });
      taught.add(form.id);
      // Met for its meaning in the shortest sentence written for it.
      const intro = bySize.find((s) => s.target_form_id === form.id && sayable(s) && !used.has(s.id));
      if (intro) {
        push(lesson, { kind: 'drill', sentence_id: intro.id, mode: 'sentence_meaning' });
        use(intro);
      } else {
        warnings.push(`${unit.slug}: no sayable sentence introduces "${form.form}"`);
      }
      const next = bySize.find((s) => s.target_form_id === form.id && sayable(s) && !used.has(s.id));
      if (next) {
        push(lesson, { kind: 'drill', sentence_id: next.id, mode: 'sentence_gap' });
        use(next);
        builds.push(next);
      }
    }
    // The lesson closes on production: tiles for what it just gapped, then a
    // longer sentence of the unit that is sayable by now.
    for (const s of builds.slice(0, 2)) push(lesson, { kind: 'drill', sentence_id: s.id, mode: 'sentence_build' });
    const longer = [...bySize].reverse().find((s) => sayable(s) && !used.has(s.id));
    if (longer) {
      push(lesson, { kind: 'drill', sentence_id: longer.id, mode: 'sentence_build' });
      use(longer);
    }
    if (li > 0 && unit.course_order > 1) push(lesson, { kind: 'review', review_count: 2 });
    if (chunks.slice(0, li + 1).flat().length >= 4) push(lesson, { kind: 'match' });
  });

  if (check) {
    push(check, { kind: 'recap', review_count: Math.min(16, Math.max(6, unitForms.length)), scope: 'unit' });
    // The unit's longest sayable sentences, rebuilt from tiles.
    for (const s of [...bySize].reverse().filter(sayable).slice(0, 3)) {
      push(check, { kind: 'drill', sentence_id: s.id, mode: 'sentence_build' });
    }
  }

  for (const f of unitForms) {
    const n = sentences.filter((s) => contentOf(s).includes(f.id)).length;
    if (n < 3) warnings.push(`${unit.slug}: "${f.form}" has ${n} approved sentence(s); lessons want 3 or more`);
  }
  return { slots, warnings };
}
