// Loads the course outline — one file per section, docs/course/section-*.yaml —
// into the rows the database holds, and checks everything about it a machine
// can check. The seed script, the demo build and the linter all read the
// outline through here, so an outline that validates is one every later stage
// can use.
//
// Two numbers order a unit. `ordinal` is its place in its own section, which is
// what the path shows ("Section 2, Unit 3"). `course_order` is its place in the
// whole course, which is what "no word before it is taught" is measured on: a
// form carries the course_order of the unit that introduces it.

import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'yaml';

import { checkFormEntry, checkSentence, glossRepeats, meaningOverlaps } from '../../../src/lib/course-rules/check.ts';
import { drillable } from '../../../src/lib/course-rules/vocabulary.ts';
import { ids, lemmaKey } from './ids.mjs';
import { POS, REGISTERS, fold, parseFeatures } from './rules.mjs';

// The checks themselves take a vocabulary — this outline, or the database's
// (lib/vocabulary.mjs) — and are shared with the admin.
export { availableForms, checkSentence, meaningOverlaps, senses } from '../../../src/lib/course-rules/check.ts';
// One definition of "may this form be asked about on its own", shared with the
// app and the admin. The scripts each used to keep their own copy of it, which
// is how a rule added in one place could quietly miss the other four.
export { drillable };

const COURSE_DIR = new URL('../../../docs/course/', import.meta.url);
/** Every section file, in order: a new section is a new section-N.yaml. */
export const SECTION_PATHS = readdirSync(COURSE_DIR)
  .map((name) => name.match(/^section-(\d+)\.yaml$/))
  .filter(Boolean)
  .sort((a, b) => Number(a[1]) - Number(b[1]))
  .map((m) => new URL(m[0], COURSE_DIR));

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** A unit summary sits on one line of the path banner. */
const SUMMARY_MAX = 52;
/**
 * New forms a teaching lesson holds (learning-engine-spec §5.1). Three, because
 * a form costs three screens on the ramp (teach · meaning · gap) and a lesson
 * runs 12–16 of them (`LESSON_ITEMS` in lessons.mjs): at five the lesson is
 * twenty-odd screens and stops being one sitting.
 */
export const FORMS_PER_LESSON = 3;

/** Lessons a practice unit (one with `review:`) runs before its check. */
export const PRACTICE_UNIT_LESSONS = 4;

/** Teaching lessons for a unit introducing `forms` drillable forms, plus the
 *  review lesson that is the unit's check. */
export const lessonCountFor = (forms) => Math.max(2, Math.ceil(forms / FORMS_PER_LESSON)) + 1;

/**
 * @param paths  one section file, or the whole course in order.
 * @returns {{ outline, errors: string[], warnings: string[] }}
 *   `outline` is null when nothing could be read at all.
 */
export function loadOutline(paths = SECTION_PATHS) {
  const errors = [];
  const warnings = [];
  const docs = [];
  for (const path of [paths].flat()) {
    try {
      docs.push(parse(readFileSync(path, 'utf8')));
    } catch (err) {
      errors.push(`could not parse ${String(path).split('/').pop()}: ${err.message}`);
    }
  }
  if (!docs.length) return { outline: null, errors, warnings };

  const sections = [];
  const units = [];
  const lemmas = new Map(); // lemmaKey -> lemma row
  const forms = [];
  const formKeys = new Set();
  const slugs = new Set();
  let courseOrder = 0;

  docs.forEach((doc, docIndex) => {
    const section = doc.section ?? {};
    for (const k of ['id', 'slug', 'title', 'cefr']) {
      if (section[k] == null) errors.push(`section ${docIndex + 1}: missing "${k}"`);
    }
    if (section.id != null && sections.some((s) => s.id === section.id)) {
      errors.push(`section ${section.id}: duplicate id`);
    }
    sections.push({
      id: section.id,
      ordinal: sections.length + 1,
      slug: section.slug,
      title_en: section.title,
      cefr: section.cefr,
      status: 'draft',
    });

    (doc.units ?? []).forEach((u, i) => {
      const where = `section ${section.id} · unit ${u.ordinal ?? `#${i + 1}`}`;
      if (u.ordinal !== i + 1) errors.push(`${where}: ordinal must be ${i + 1} (units are in order, no gaps)`);
      if (!u.slug || !SLUG.test(u.slug)) errors.push(`${where}: slug "${u.slug}" must be kebab-case`);
      if (slugs.has(u.slug)) errors.push(`${where}: duplicate slug "${u.slug}"`);
      slugs.add(u.slug);
      for (const k of ['title', 'summary']) if (!u[k]) errors.push(`${where}: missing "${k}"`);
      if (u.summary && u.summary.length > SUMMARY_MAX) {
        warnings.push(`${where}: summary is ${u.summary.length} chars; the path banner fits ${SUMMARY_MAX}`);
      }
      if (!Array.isArray(u.grammar) || u.grammar.length === 0) errors.push(`${where}: "grammar" must list at least one focus`);
      const registerMax = u.register_max ?? 'neutral';
      if (!REGISTERS.includes(registerMax)) errors.push(`${where}: register_max "${registerMax}" is not one of ${REGISTERS.join(', ')}`);
      if (!Array.isArray(u.tips) || u.tips.length === 0) errors.push(`${where}: needs at least one tip`);

      const unitId = ids.unit(u.slug);
      const checkpoint = u.ordinal === (doc.units ?? []).length;
      courseOrder += 1;
      const unit = {
        id: unitId,
        section_id: section.id,
        ordinal: u.ordinal,
        course_order: courseOrder,
        slug: u.slug,
        title_en: u.title,
        summary_en: u.summary,
        grammar_focus: u.grammar ?? [],
        register_max: registerMax,
        status: 'draft',
        sample: u.sample ?? null,
        // A practice unit (roadmap §Practice) teaches no words of its own: it
        // drills `review`, earlier forms, resolved once every unit is read.
        review_refs: Array.isArray(u.review) ? u.review.map(String) : [],
        review_form_ids: [],
        lessons: [],
        tips: (u.tips ?? []).map((t, k) => {
          if (!t.title || !t.body) errors.push(`${where}: tip ${k + 1} needs a title and a body`);
          return { id: ids.tip(u.slug, k), unit_id: unitId, title_en: t.title, body_md: String(t.body ?? '').trim(), status: 'draft' };
        }),
      };
      units.push(unit);

      (u.words ?? []).forEach((w) => {
        const wWhere = `${where} · ${w.lemma}`;
        if (!w.lemma || !w.pos) {
          errors.push(`${wWhere}: every word needs "lemma" and "pos"`);
          return;
        }
        const lemma = String(w.lemma);
        if (!POS.includes(w.pos)) errors.push(`${wWhere}: pos "${w.pos}" is not one of ${POS.join(', ')}`);
        const key = lemmaKey(lemma, w.pos);
        let row = lemmas.get(key);
        if (!row) {
          if (!w.en) errors.push(`${wWhere}: first appearance must give "en"`);
          const register = w.register ?? 'neutral';
          if (!REGISTERS.includes(register)) errors.push(`${wWhere}: register "${register}" is not one of ${REGISTERS.join(', ')}`);
          row = {
            id: ids.lemma(lemma, w.pos),
            lemma,
            pos: w.pos,
            gloss_en: w.en ?? '',
            gloss_note_en: w.note ?? null,
            register,
            is_glue: w.glue === true,
            notes_en: w.notes ?? null,
            status: 'draft',
            unit_order: courseOrder,
          };
          lemmas.set(key, row);
        } else {
          if (w.en && w.en !== row.gloss_en) warnings.push(`${wWhere}: "en" redefined (was "${row.gloss_en}") — ignored`);
          if (w.note && w.note !== row.gloss_note_en) warnings.push(`${wWhere}: "note" redefined (was "${row.gloss_note_en}") — ignored`);
          if (w.register && w.register !== row.register) errors.push(`${wWhere}: register changes from ${row.register} to ${w.register}`);
          if (w.glue != null && (w.glue === true) !== row.is_glue) errors.push(`${wWhere}: glue flag changes between units`);
        }

        const entries = w.forms ?? [{ form: lemma }];
        if (!w.forms && w.pos !== 'phrase' && w.pos !== 'propn' && lemmas.get(key).unit_order !== courseOrder) {
          errors.push(`${wWhere}: extends a lemma taught earlier but lists no new forms`);
        }
        for (const e of entries) {
          const surface = String(e.form ?? '');
          const fWhere = `${wWhere} · ${surface}`;
          if (!surface) {
            errors.push(`${wWhere}: a form entry is missing "form"`);
            continue;
          }
          const fkey = `${key}|${surface}`;
          if (formKeys.has(fkey)) errors.push(`${fWhere}: form listed twice`);
          formKeys.add(fkey);

          let features = {};
          try {
            features = parseFeatures(e.f);
          } catch (err) {
            errors.push(`${fWhere}: ${err.message}`);
          }

          for (const problem of checkFormEntry({ form: surface, pos: w.pos, features })) errors.push(`${fWhere}: ${problem}`);

          forms.push({
            id: ids.form(lemma, w.pos, surface),
            lemma_id: row.id,
            lemma,
            pos: w.pos,
            form: surface,
            features,
            gloss_en: e.en ?? null,
            gloss_note_en: e.note ?? null,
            unit_id: unitId,
            unit_order: courseOrder,
            // Its place among the words its unit teaches: the order lessons take them in.
            position: forms.filter((f) => f.unit_id === unitId).length + 1,
            is_glue: row.is_glue,
            // A form that is only ever said inside a longer one: it keeps its
            // place in sentences and in the dictionary, and is never drilled.
            bound: e.bound === true,
            register: row.register,
            audio_path: null,
            status: 'draft',
          });
        }
      });

      // The lessons follow from how much the unit teaches, unless it says.
      const drillableHere = forms.filter((f) => f.unit_id === unitId && drillable(f)).length;
      const lessonCount = u.lessons ?? lessonCountFor(drillableHere);
      // Practice lessons (lessons.mjs) go after the teaching and before the
      // unit check: the unit's words again, before the next unit leans on them.
      const practiceUnit = Array.isArray(u.review) && u.review.length > 0;
      if (practiceUnit && (u.words ?? []).length) errors.push(`${where}: a practice unit (review:) teaches no words — move them to a teaching unit`);
      if (practiceUnit && checkpoint) errors.push(`${where}: the checkpoint can't be a practice unit`);
      const practice = practiceUnit ? (u.practice ?? PRACTICE_UNIT_LESSONS) : (u.practice ?? section.practice ?? 0);
      const hasCheck = !checkpoint && (practiceUnit || lessonCount > 1);
      const teachingCount = practiceUnit ? 0 : hasCheck ? lessonCount - 1 : lessonCount;
      const kinds = [
        ...Array(teachingCount).fill(checkpoint ? 'checkpoint' : 'lesson'),
        ...Array(practice).fill('practice'),
        ...(hasCheck ? ['review'] : []),
      ];
      unit.lessons = kinds.map((kind, k) => {
        const ordinal = k + 1;
        return {
          id: ids.lesson(u.slug, ordinal),
          unit_id: unitId,
          ordinal,
          title_en:
            kind === 'review' ? 'Unit check' : kind === 'checkpoint' ? `Checkpoint ${ordinal}` : kind === 'practice' ? 'Practice' : `Lesson ${ordinal}`,
          kind,
          status: 'draft',
        };
      });
  });
  });

  const outline = {
    sections,
    units,
    lemmas: [...lemmas.values()],
    forms,
  };

  // A practice unit's review: forms taught before it, named like a target —
  // "word", or "word/lemma" where two lemmas share the spelling.
  for (const unit of units) {
    for (const ref of unit.review_refs) {
      const [surface, qualifier] = ref.split('/').map((x) => x.trim());
      const hits = forms.filter(
        (f) =>
          f.unit_order < unit.course_order &&
          drillable(f) &&
          fold(f.form) === fold(surface) &&
          (!qualifier || f.lemma === qualifier || f.pos === qualifier),
      );
      if (hits.length === 1) unit.review_form_ids.push(hits[0].id);
      else errors.push(`unit ${unit.slug} review "${ref}": ${hits.length ? `ambiguous (${hits.map((h) => h.lemma).join(', ')}) — write "${surface}/<lemma>"` : 'not a word taught before this unit'}`);
    }
    delete unit.review_refs;
  }

  // Every sample must be sayable with what the course has taught by then.
  for (const unit of units) {
    if (!unit.sample) {
      warnings.push(`unit ${unit.ordinal}: no sample sentence`);
      continue;
    }
    const problems = checkSentence(outline, unit, unit.sample.es);
    for (const p of problems) errors.push(`unit ${unit.course_order} sample "${unit.sample.es}": ${p}`);
  }

  // A gloss that spells out the Spanish word and then explains it — "mate (the
  // drink)" — hands over the answer. The explanation belongs in "note".
  for (const f of glossRepeats(outline)) {
    warnings.push(`"${f.form}" (unit ${f.unit_order}): gloss repeats the Spanish word — move the explanation to "note"`);
  }

  // Two words sharing a meaning can't be told apart from the English. The app
  // keeps them out of each other's options, but where it isn't a true synonym
  // pair (bondi/colectivo) a sharper gloss makes a better question.
  for (const { a, b, shared } of meaningOverlaps(outline)) {
    warnings.push(`"${a.form}" (unit ${a.unit_order}) and "${b.form}" (unit ${b.unit_order}) share the meaning "${shared.join(', ')}"`);
  }

  return { outline, errors, warnings };
}

