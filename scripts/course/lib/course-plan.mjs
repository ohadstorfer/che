// Plans every unit's lessons in course order, so each unit knows what the
// ones before it drilled. That is what lets a lesson bring back an old word
// on purpose: a word taught in unit 40 and never drilled again is forgotten
// by unit 60, whatever the SRS review manages to squeeze in.
//
// A word is owed a comeback on a widening schedule — one unit after it was
// last drilled, then three, six, twelve, twenty-four — and a sentence is worth
// as much as the words it carries that are owed one (`debt`). The planner
// prefers such sentences wherever it has a choice, and every practice lesson
// spends a few screens on earlier units' sentences picked for exactly this.
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

import { queryLinked } from './db.mjs';
import { uuid5 } from './ids.mjs';
import { planLessons } from './lessons.mjs';
import { drillable } from './outline.mjs';
import { loadOutlineFromDb } from './vocabulary.mjs';

/** Units between a word's comebacks: the nth comeback waits GAPS[n]. */
const GAPS = [1, 3, 6, 12, 24];

const GRAMMAR_PATH = new URL('../../../docs/course/grammar-practice.yaml', import.meta.url);

export const loadGrammarPlan = () => parse(readFileSync(GRAMMAR_PATH, 'utf8'));

/** Ids for what grammar-practice.yaml adds to a unit. */
export const grammarIds = {
  tip: (slug) => uuid5(`tip:${slug}:pattern`),
  lesson: (slug, k) => uuid5(`lesson:${slug}:grammar:${k}`),
  practice: (slug, k) => uuid5(`lesson:${slug}:practice:${k}`),
};

/** Every published sentence of the course, by unit id. */
export function loadPublishedSentences() {
  const rows = queryLinked(`
    select id, unit_id, es, tokens, target_form_id, difficulty, audio_path
    from public.sentences where status = 'published'`);
  const byUnit = new Map();
  for (const s of rows) {
    const t = typeof s.tokens === 'string' ? JSON.parse(s.tokens) : s.tokens;
    const row = { ...s, tokens: t };
    byUnit.set(s.unit_id, [...(byUnit.get(s.unit_id) ?? []), row]);
  }
  return byUnit;
}

/** A form's tense and mood, the grain grammar practice matches on. */
const signature = (f) => [f.features?.tense ?? '', f.features?.mood ?? '', f.features?.verb_form ?? ''].join('|');
/** Too common to pull a sentence into grammar practice on their own. */
const COMMON = new Set(['||', 'pres|ind|', 'pres||', '||inf']);

const matches = (features, filter) => Object.entries(filter).every(([k, v]) => features?.[k] === v);

/**
 * @returns {Map<unitId, {slots, warnings}>} and exposure stats, for every
 *          published unit, planned in course order.
 */
export function planCourse({ outline = loadOutlineFromDb(), sentencesByUnit = loadPublishedSentences(), plan = loadGrammarPlan() } = {}) {
  const formById = new Map(outline.forms.map((f) => [f.id, f]));
  const content = (s) =>
    [...new Set(s.tokens.flatMap((t) => t.form_ids ?? []))].filter((id) => formById.has(id) && drillable(formById.get(id)));
  const entryBySlug = new Map((plan.units ?? []).map((e) => [e.unit, e]));

  // form id -> { last: course_order last drilled, n: later units it came back in }
  const exposure = new Map();
  const units = outline.units.filter((u) => u.status === 'published');
  const result = new Map();
  const earlier = []; // sentences of units already planned

  for (const unit of units) {
    const u = unit.course_order;
    const debtOf = (id) => {
      const f = formById.get(id);
      if (!f || f.unit_order >= u) return 0;
      const e = exposure.get(id) ?? { last: f.unit_order, n: 0 };
      const gap = GAPS[Math.min(e.n, GAPS.length - 1)];
      const since = u - e.last;
      return since < gap ? 0 : 1 + Math.min(2, (since - gap) / gap);
    };
    const debtCache = new Map();
    const debt = (s) => {
      if (!debtCache.has(s.id)) debtCache.set(s.id, content(s).reduce((sum, id) => sum + debtOf(id), 0));
      return debtCache.get(s.id);
    };

    const entry = entryBySlug.get(unit.slug);
    let grammar = null;
    if (entry) {
      // An earlier form belongs to this unit's grammar when it is the same
      // tense and mood as a form the unit teaches: another person of the same
      // verb, or — for any tense but the plain present, which is everywhere —
      // any verb in it. Or when the entry's `focus` names it.
      const newForms = outline.forms.filter((f) => f.unit_id === unit.id && drillable(f));
      const sigs = new Set(newForms.map(signature));
      const lemmaSigs = new Set(newForms.map((f) => `${f.lemma_id}|${signature(f)}`));
      const focus = outline.forms.filter(
        (f) =>
          f.unit_order <= u &&
          drillable(f) &&
          (f.unit_id === unit.id ||
            lemmaSigs.has(`${f.lemma_id}|${signature(f)}`) ||
            (sigs.has(signature(f)) && !COMMON.has(signature(f))) ||
            (entry.focus ?? []).some((flt) => matches(f.features, flt))),
      );
      grammar = {
        formIds: new Set(focus.map((f) => f.id)),
        // Its glue (lo, la, le…) is never blanked, but a sentence carrying it
        // is the one that shows the pattern.
        glueIds: new Set(outline.forms.filter((f) => f.unit_id === unit.id && !drillable(f)).map((f) => f.id)),
        newIds: new Set(newForms.filter((f) => Object.keys(f.features ?? {}).length).map((f) => f.id)),
        tip: unit.tips.find((t) => t.id === grammarIds.tip(unit.slug)) ?? null,
      };
    }
    // The pattern tip belongs to grammar practice, not to a teaching lesson.
    const tips = unit.tips.filter((t) => t.id !== grammarIds.tip(unit.slug));

    const sentences = sentencesByUnit.get(unit.id) ?? [];
    const planned = planLessons({ unit, forms: outline.forms, sentences, tips, earlier, debt, grammar });
    result.set(unit.id, planned);

    const sentenceById = new Map([...sentences, ...earlier].map((s) => [s.id, s]));
    const drilled = new Set();
    for (const slot of planned.slots) {
      const s = slot.sentence_id && sentenceById.get(slot.sentence_id);
      if (s) for (const id of content(s)) drilled.add(id);
    }
    for (const id of drilled) {
      const f = formById.get(id);
      const e = exposure.get(id) ?? { last: f.unit_order, n: 0 };
      if (u > f.unit_order) exposure.set(id, { last: u, n: e.n + 1 });
      else exposure.set(id, { last: u, n: e.n });
    }
    earlier.push(...sentences);
  }

  return { result, exposure, units, formById };
}

/** For the report: how many later units each form came back in, by section. */
export function exposureReport({ exposure, units, formById }) {
  const sectionOf = new Map(units.map((u) => [u.course_order, u.section_id]));
  const by = new Map();
  for (const f of formById.values()) {
    if (!drillable(f) || !sectionOf.has(f.unit_order)) continue;
    const sec = sectionOf.get(f.unit_order);
    const e = exposure.get(f.id);
    const list = by.get(sec) ?? [];
    list.push(e?.n ?? 0);
    by.set(sec, list);
  }
  return [...by.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([section, ns]) => {
      const sorted = [...ns].sort((a, b) => a - b);
      return {
        section,
        forms: ns.length,
        median: sorted[Math.floor(sorted.length / 2)],
        neverAgain: Math.round((100 * ns.filter((n) => n === 0).length) / ns.length),
      };
    });
}

