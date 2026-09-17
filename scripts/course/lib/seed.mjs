// What the seed may add (docs/superplan-admin-palabras.md §7.2). The database
// is the source of truth; the YAML only brings new units and new words. Nothing
// that exists is changed or retired, and a word the admin already has under
// another id — typically a spelling fixed there and then copied into the YAML —
// is never inserted a second time.
//
// Pure: the database comes in as rows, so tests can plan against any state.
import { diffOutlines, outlineFromRows } from './vocabulary.mjs';

const key = (...parts) => parts.join('|');

/**
 * @param built  buildRows() output: { rows, outline } from the YAML and fixture
 * @param db     the database as it is: { sections, units, lessons, tips, lemmas,
 *               forms, sentences, lesson_slots, story_lines, unit_phrases }
 *               (sentences and the last three need only their keys)
 * @returns {{ insert: rows by table, skipped: string[], diff }}
 */
export function planSeed(built, db) {
  const { rows } = built;
  const skipped = [];
  const insert = {};

  const ids = (list) => new Set(list.map((r) => String(r.id)));
  const has = {
    sections: ids(db.sections),
    units: ids(db.units),
    lessons: ids(db.lessons),
    tips: ids(db.tips),
    lemmas: ids(db.lemmas),
    forms: ids(db.forms),
    sentences: ids(db.sentences),
  };

  insert.sections = rows.sections.filter((s) => !has.sections.has(String(s.id)));

  // Units: a slug or a place in the course that is already taken can't be added.
  const slugs = new Set(db.units.map((u) => u.slug));
  const places = new Set(db.units.map((u) => key(u.section_id, u.ordinal)));
  const orders = new Set(db.units.map((u) => u.course_order));
  const unitsOk = new Set(db.units.map((u) => u.id));
  insert.units = [];
  for (const u of rows.units) {
    if (has.units.has(u.id)) continue;
    const clash = slugs.has(u.slug)
      ? `slug "${u.slug}" is taken`
      : places.has(key(u.section_id, u.ordinal))
        ? `section ${u.section_id} already has a unit ${u.ordinal}`
        : orders.has(u.course_order)
          ? `course place ${u.course_order} is taken`
          : null;
    if (clash) {
      skipped.push(`unit ${u.slug}: ${clash} — skipped, with its lessons, tips and words`);
      continue;
    }
    insert.units.push(u);
    unitsOk.add(u.id);
  }
  const lessonsOk = new Set(db.lessons.map((l) => l.id));
  insert.lessons = rows.lessons.filter((l) => !has.lessons.has(l.id) && unitsOk.has(l.unit_id));
  for (const l of insert.lessons) lessonsOk.add(l.id);
  insert.tips = rows.tips.filter((t) => !has.tips.has(t.id) && unitsOk.has(t.unit_id));

  // Lemmas: one the database has under another id (renamed in the admin) is
  // that one; its new forms hang off the database's id.
  const lemmaByKey = new Map(db.lemmas.map((l) => [key(l.lemma, l.pos), l.id]));
  const lemmaId = new Map();
  insert.lemmas = [];
  const neededLemmas = new Set(rows.forms.filter((f) => unitsOk.has(f.unit_id)).map((f) => f.lemma_id));
  for (const l of rows.lemmas) {
    if (has.lemmas.has(l.id)) {
      lemmaId.set(l.id, l.id);
      continue;
    }
    const existing = lemmaByKey.get(key(l.lemma, l.pos));
    if (existing) {
      lemmaId.set(l.id, existing);
      continue;
    }
    if (!neededLemmas.has(l.id)) continue;
    insert.lemmas.push(l);
    lemmaId.set(l.id, l.id);
  }

  // Forms: the same text under the same lemma is the same word.
  const formByKey = new Map(db.forms.map((f) => [key(f.lemma_id, f.form.toLocaleLowerCase('es')), f]));
  const formsOk = new Set(db.forms.filter((f) => f.status !== 'retired').map((f) => f.id));
  const formId = new Map(db.forms.map((f) => [f.id, f.id]));
  insert.forms = [];
  const label = (f) => rows.lemmas.find((l) => l.id === f.lemma_id)?.lemma ?? f.form;
  for (const f of rows.forms) {
    if (has.forms.has(f.id)) continue;
    const lemma = lemmaId.get(f.lemma_id);
    const twin = lemma && formByKey.get(key(lemma, f.form.toLocaleLowerCase('es')));
    if (twin) {
      skipped.push(`"${f.form}" (${label(f)}) already exists, fixed in the admin — ignored`);
      formId.set(f.id, twin.id);
      continue;
    }
    if (!unitsOk.has(f.unit_id) || !lemma) continue;
    insert.forms.push({ ...f, lemma_id: lemma });
    formsOk.add(f.id);
    formId.set(f.id, f.id);
  }

  // Authored content (the demo fixture) goes in only where everything it
  // points at exists, and never over what the database has.
  const sentencesOk = new Set(db.sentences.map((s) => s.id));
  insert.sentences = [];
  for (const s of rows.sentences) {
    if (has.sentences.has(s.id) || !unitsOk.has(s.unit_id)) continue;
    const tokens = s.tokens.map((t) => ({ ...t, form_ids: t.form_ids.map((id) => formId.get(id) ?? id) }));
    const target = formId.get(s.target_form_id);
    if (!target || tokens.some((t) => t.form_ids.some((id) => !formsOk.has(id)))) {
      skipped.push(`sentence "${s.es}": uses a word the database doesn't have — skipped`);
      continue;
    }
    insert.sentences.push({ ...s, tokens, target_form_id: target });
    sentencesOk.add(s.id);
  }
  const slotKeys = new Set(db.lesson_slots.map((s) => key(s.lesson_id, s.ordinal)));
  const lessonsWithSlots = new Set(db.lesson_slots.map((s) => s.lesson_id));
  insert.lesson_slots = rows.lesson_slots.filter(
    (s) =>
      lessonsOk.has(s.lesson_id) &&
      // A lesson the database already has slots for was assembled there; the seed leaves it whole.
      !lessonsWithSlots.has(s.lesson_id) &&
      !slotKeys.has(key(s.lesson_id, s.ordinal)) &&
      (!s.form_id || formsOk.has(formId.get(s.form_id))) &&
      (!s.sentence_id || sentencesOk.has(s.sentence_id)),
  ).map((s) => ({ ...s, form_id: s.form_id ? formId.get(s.form_id) : null }));
  const lineKeys = new Set(db.story_lines.map((l) => key(l.lesson_id, l.ordinal)));
  const lessonsWithLines = new Set(db.story_lines.map((l) => l.lesson_id));
  insert.story_lines = rows.story_lines.filter(
    (l) => lessonsOk.has(l.lesson_id) && !lessonsWithLines.has(l.lesson_id) && !lineKeys.has(key(l.lesson_id, l.ordinal)) && sentencesOk.has(l.sentence_id),
  );
  const phraseKeys = new Set(db.unit_phrases.map((p) => key(p.unit_id, p.ordinal)));
  const unitsWithPhrases = new Set(db.unit_phrases.map((p) => p.unit_id));
  insert.unit_phrases = rows.unit_phrases.filter(
    (p) => unitsOk.has(p.unit_id) && !unitsWithPhrases.has(p.unit_id) && !phraseKeys.has(key(p.unit_id, p.ordinal)) && sentencesOk.has(p.sentence_id),
  );

  const diff = diffOutlines(built.outline, outlineFromRows(db));
  return { insert, skipped, diff };
}

/** The differences worth a reviewer's eye, one line each. */
export function describeDiff(diff) {
  const show = (v) => (v == null ? '—' : typeof v === 'string' ? `"${v}"` : JSON.stringify(v));
  return diff.changed.map((c) => `${c.kind.replace(/s$/, '')} ${c.label}: ${c.field} is ${show(c.b)} in the database, ${show(c.a)} in the YAML`);
}
