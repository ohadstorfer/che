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

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { ids, lemmaKey } from './ids.mjs';
import {
  POS,
  REGIONAL,
  REGISTERS,
  TUTEO,
  TUTEO_AMBIGUOUS,
  fold,
  parseFeatures,
  registerRank,
} from './rules.mjs';
import { buildIndex, tokenize } from './tokenize.mjs';

export const SECTION_PATHS = [1, 2, 3].map(
  (n) => new URL(`../../../docs/course/section-${n}.yaml`, import.meta.url),
);

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
/** A unit summary sits on one line of the path banner. */
const SUMMARY_MAX = 52;
/** New forms a teaching lesson holds (learning-engine-spec §5.1). */
export const FORMS_PER_LESSON = 5;

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
            register,
            is_glue: w.glue === true,
            notes_en: w.notes ?? null,
            status: 'draft',
            unit_order: courseOrder,
          };
          lemmas.set(key, row);
        } else {
          if (w.en && w.en !== row.gloss_en) warnings.push(`${wWhere}: "en" redefined (was "${row.gloss_en}") — ignored`);
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

          const folded = fold(surface);
          if (TUTEO.has(folded)) errors.push(`${fWhere}: "${surface}" is a tuteo form — use the vos form`);
          if (TUTEO_AMBIGUOUS.has(folded) && features.mood === 'imp' && features.person === 2 && !features.voseo) {
            errors.push(`${fWhere}: second-person imperative without "vos" — the vos imperative stresses the last vowel`);
          }
          if (features.person === 2 && features.number === 'sg' && w.pos === 'verb' && !features.voseo) {
            errors.push(`${fWhere}: second-person singular verb form must be tagged "vos"`);
          }
          if (REGIONAL.has(folded)) errors.push(`${fWhere}: "${surface}" is not rioplatense — use "${REGIONAL.get(folded)}"`);

          forms.push({
            id: ids.form(lemma, w.pos, surface),
            lemma_id: row.id,
            lemma,
            pos: w.pos,
            form: surface,
            features,
            gloss_en: e.en ?? null,
            unit_id: unitId,
            unit_order: courseOrder,
            is_glue: row.is_glue,
            register: row.register,
            audio_path: null,
            status: 'draft',
          });
        }
      });

      // The lessons follow from how much the unit teaches, unless it says.
      const drillableHere = forms.filter((f) => f.unit_id === unitId && !f.is_glue && f.pos !== 'propn').length;
      const lessonCount = u.lessons ?? lessonCountFor(drillableHere);
      unit.lessons = Array.from({ length: lessonCount }, (_, k) => {
        const ordinal = k + 1;
        const kind = checkpoint ? 'checkpoint' : ordinal === lessonCount && lessonCount > 1 ? 'review' : 'lesson';
        return {
          id: ids.lesson(u.slug, ordinal),
          unit_id: unitId,
          ordinal,
          title_en: kind === 'review' ? 'Unit check' : kind === 'checkpoint' ? `Checkpoint ${ordinal}` : `Lesson ${ordinal}`,
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

  // Every sample must be sayable with what the course has taught by then.
  for (const unit of units) {
    if (!unit.sample) {
      warnings.push(`unit ${unit.ordinal}: no sample sentence`);
      continue;
    }
    const problems = checkSentence(outline, unit, unit.sample.es);
    for (const p of problems) errors.push(`unit ${unit.course_order} sample "${unit.sample.es}": ${p}`);
  }

  // Two words sharing a meaning can't be told apart from the English. The app
  // keeps them out of each other's options, but where it isn't a true synonym
  // pair (bondi/colectivo) a sharper gloss makes a better question.
  for (const { a, b, shared } of meaningOverlaps(outline)) {
    warnings.push(`"${a.form}" (unit ${a.unit_order}) and "${b.form}" (unit ${b.unit_order}) share the meaning "${shared.join(', ')}"`);
  }

  return { outline, errors, warnings };
}

/**
 * A gloss's senses: "well, fine, good" → ["well", "fine", "good"]. The app
 * splits them the same way (src/lib/answers.ts) to decide which words may be
 * offered as wrong answers for each other.
 */
export const senses = (gloss) =>
  String(gloss ?? '')
    .split(/[,;]/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

/** Pairs of drillable forms, from different lemmas, whose glosses share a sense. */
export function meaningOverlaps(outline) {
  const lemmaById = new Map(outline.lemmas.map((l) => [l.id, l]));
  const forms = outline.forms
    .filter((f) => !f.is_glue && f.pos !== 'propn')
    .map((f) => ({ form: f, senses: senses(f.gloss_en ?? lemmaById.get(f.lemma_id)?.gloss_en) }));
  const out = [];
  for (let i = 0; i < forms.length; i++) {
    for (let j = i + 1; j < forms.length; j++) {
      if (forms[i].form.lemma_id === forms[j].form.lemma_id) continue;
      const shared = forms[i].senses.filter((s) => forms[j].senses.includes(s));
      if (shared.length) out.push({ a: forms[i].form, b: forms[j].form, shared });
    }
  }
  return out;
}

/** Forms a sentence in a unit may use: its own and every earlier unit's. */
export function availableForms(outline, courseOrder) {
  return outline.forms.filter((f) => f.unit_order <= courseOrder);
}

/**
 * The mechanical checks one sentence has to pass against the outline. Returns
 * human-readable problems; empty means it passes. (The full linter in Phase 3
 * builds on this.)
 */
export function checkSentence(outline, unit, es) {
  const problems = [];
  const available = availableForms(outline, unit.course_order);
  const tokens = tokenize(es, buildIndex(available));
  const everything = buildIndex(outline.forms);
  for (const t of tokens) {
    const folded = fold(t.core);
    if (TUTEO.has(folded)) problems.push(`"${t.core}" is tuteo`);
    else if (REGIONAL.has(folded)) problems.push(`"${t.core}" is not rioplatense — use "${REGIONAL.get(folded)}"`);
    else if (t.forms.length === 0) {
      const later = tokenize(t.core, everything)[0]?.forms ?? [];
      problems.push(
        later.length
          ? `"${t.core}" isn't taught until unit ${Math.min(...later.map((f) => f.unit_order))}`
          : `"${t.core}" isn't in the course lexicon`,
      );
    } else if (t.forms.every((f) => registerRank(f.register) > registerRank(unit.register_max))) {
      problems.push(`"${t.core}" is ${t.forms[0].register}; this unit allows up to ${unit.register_max}`);
    }
  }
  return problems;
}
