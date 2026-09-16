// Turns authored content — sentences and lesson slots, written against the
// outline — into database rows, checking as it goes. Shared by the demo build
// now and the seed / import scripts later, so hand-written and generated
// content pass through exactly the same gate.

import { generateVariants, uncoveredTokens } from './accept.mjs';
import { ids } from './ids.mjs';
import { checkSentence, availableForms } from './outline.mjs';
import { bare, fold } from './rules.mjs';
import { buildIndex, tokenize } from './tokenize.mjs';

const SENTENCE_MODES = ['sentence_intro', 'sentence_meaning', 'sentence_gap', 'sentence_build', 'sentence_listen'];

const drillable = (f) => !f.is_glue && f.pos !== 'propn';

/** Two answers are the same answer when their words are: "¿Sos Juan?" = "sos juan". */
const answerKey = (es) => bare(es).split(/\s+/).filter(Boolean).join(' ');

/** Resolve "tenés" or "argentina/adj" to one of a unit's own forms. */
function resolveFormRef(outline, unit, ref, where, errors) {
  const [surface, pos] = String(ref).split('/');
  const hits = outline.forms.filter(
    (f) => f.unit_order === unit.course_order && fold(f.form) === fold(surface) && (!pos || f.pos === pos),
  );
  if (hits.length === 1) return hits[0];
  errors.push(
    hits.length === 0
      ? `${where}: "${ref}" is not a form unit ${unit.slug} introduces`
      : `${where}: "${ref}" is ambiguous (${hits.map((h) => h.pos).join(', ')}) — write it as "${surface}/<pos>"`,
  );
  return null;
}

/**
 * @param outline  from loadOutline()
 * @param content  { [unitSlug]: { sentences: { key: {...} }, lessons: { n: slot[] } } }
 * @returns {{ sentences, slots, errors, warnings }}
 */
export function buildContent(outline, content, { source = 'human', status = 'draft' } = {}) {
  const errors = [];
  const warnings = [];
  const sentences = [];
  const slots = [];
  const unitBySlug = new Map(outline.units.map((u) => [u.slug, u]));
  const lemmaById = new Map(outline.lemmas.map((l) => [l.id, l]));

  // Everything taught before a unit, for the lesson-order check below.
  const taughtBefore = (unit) =>
    new Set(outline.forms.filter((f) => f.unit_order < unit.course_order && drillable(f)).map((f) => f.id));

  for (const [slug, block] of Object.entries(content)) {
    const unit = unitBySlug.get(slug);
    if (!unit) {
      errors.push(`unit "${slug}" is not in the outline`);
      continue;
    }
    const index = buildIndex(availableForms(outline, unit.course_order));
    const sentenceByKey = new Map();

    for (const [key, s] of Object.entries(block.sentences ?? {})) {
      const where = `${slug} · sentence ${key}`;
      for (const problem of checkSentence(outline, unit, s.es)) errors.push(`${where} "${s.es}": ${problem}`);
      const target = resolveFormRef(outline, unit, s.target, `${where} target`, errors);
      // A form without a gloss of its own means what its lemma means.
      const resolved = tokenize(s.es, index).map((t) => ({
        ...t,
        forms: t.forms.map((f) => ({ ...f, gloss_en: f.gloss_en ?? lemmaById.get(f.lemma_id)?.gloss_en })),
      }));
      const tokens = resolved.map((t) => ({ surface: t.surface, form_ids: t.forms.map((f) => f.id) }));
      if (target && !tokens.some((t) => t.form_ids.includes(target.id))) {
        errors.push(`${where}: target "${s.target}" does not appear in "${s.es}"`);
      }
      if (!s.en) errors.push(`${where}: missing "en"`);

      // The English has to ask for every word the Spanish needs, or building
      // the Spanish from it is a guess.
      for (const t of uncoveredTokens(resolved, s.en ?? '', s.loose ?? [])) {
        errors.push(
          `${where}: the English "${s.en}" has nothing for "${t.core}" — a learner building the Spanish ` +
            `can't know it belongs. Fix the English, or list it under loose: if the translation is idiomatic.`,
        );
      }

      // Accepted answers: the author's, checked like the sentence itself, then
      // the ones the rules generate.
      const authored = [];
      for (const alt of s.es_alt ?? []) {
        const problems = checkSentence(outline, unit, alt);
        for (const problem of problems) errors.push(`${where} es_alt "${alt}": ${problem}`);
        if (!problems.length) authored.push(alt);
      }
      const esAlt = [];
      const taken = new Set([answerKey(s.es)]);
      for (const alt of [...authored, ...generateVariants(resolved, s.en ?? '', outline)]) {
        const k = answerKey(alt);
        if (taken.has(k)) continue;
        taken.add(k);
        esAlt.push(alt);
      }
      const row = {
        id: ids.sentence(slug, s.es),
        unit_id: unit.id,
        es: s.es,
        en: s.en ?? '',
        en_alt: s.en_alt ?? [],
        es_alt: esAlt,
        tokens,
        target_form_id: target?.id ?? null,
        kind: s.kind ?? (tokens.length > 1 ? 'sentence' : 'word'),
        difficulty: s.difficulty ?? 1,
        source,
        attribution: null,
        audio_path: null,
        status,
      };
      sentenceByKey.set(key, row);
      sentences.push(row);
    }

    // Lessons: every slot resolved, and every drill checked against what the
    // lesson order has taught by that point — earlier units, then this unit's
    // teach slots in the order a learner meets them.
    const taught = taughtBefore(unit);
    const lessonNumbers = Object.keys(block.lessons ?? {}).map(Number).sort((a, b) => a - b);
    for (const n of lessonNumbers) {
      const lesson = unit.lessons.find((l) => l.ordinal === n);
      if (!lesson) {
        errors.push(`${slug}: lesson ${n} does not exist (unit has ${unit.lessons.length})`);
        continue;
      }
      block.lessons[n].forEach((raw, i) => {
        const where = `${slug} · lesson ${n} · slot ${i + 1}`;
        const [kind] = Object.keys(raw);
        const value = raw[kind];
        const slot = {
          id: ids.slot(lesson.id, i + 1),
          lesson_id: lesson.id,
          ordinal: i + 1,
          kind,
          form_id: null,
          sentence_id: null,
          tip_id: null,
          mode: null,
          review_count: null,
        };
        switch (kind) {
          case 'teach': {
            const form = resolveFormRef(outline, unit, value, where, errors);
            if (!form) return;
            if (!drillable(form)) warnings.push(`${where}: teaching "${form.form}", a ${form.is_glue ? 'glue word' : 'name'}`);
            slot.form_id = form.id;
            taught.add(form.id);
            break;
          }
          case 'drill': {
            const s = sentenceByKey.get(value);
            if (!s) return void errors.push(`${where}: no sentence "${value}" in ${slug}`);
            if (raw.mode && !SENTENCE_MODES.includes(raw.mode)) errors.push(`${where}: mode "${raw.mode}" is not a sentence mode`);
            const untaught = [
              ...new Set(
                s.tokens
                  .flatMap((t) => t.form_ids)
                  .map((id) => outline.forms.find((f) => f.id === id))
                  .filter((f) => f && drillable(f) && !taught.has(f.id))
                  .map((f) => f.form),
              ),
            ];
            // A token can resolve to two forms (argentina the adjective and
            // Argentina the country); it only needs one of them taught.
            const unmet = untaught.filter(
              (surface) =>
                !s.tokens.some(
                  (t) =>
                    t.form_ids.some((id) => taught.has(id)) &&
                    t.form_ids.some((id) => outline.forms.find((f) => f.id === id)?.form === surface),
                ),
            );
            if (unmet.length) errors.push(`${where}: "${s.es}" uses ${unmet.map((u) => `"${u}"`).join(', ')} before it is taught`);
            slot.sentence_id = s.id;
            slot.mode = raw.mode ?? null;
            break;
          }
          case 'match':
            break;
          case 'tip': {
            const tip = unit.tips[value];
            if (!tip) return void errors.push(`${where}: unit has no tip ${value}`);
            slot.tip_id = tip.id;
            break;
          }
          case 'review': {
            if (!(value >= 1 && value <= 6)) return void errors.push(`${where}: review count must be 1–6`);
            if (unit.ordinal === 1) warnings.push(`${where}: a review slot in unit 1 has no earlier unit to draw from`);
            slot.review_count = value;
            break;
          }
          default:
            return void errors.push(`${where}: unknown slot kind "${kind}"`);
        }
        slots.push(slot);
      });
    }

    const unitDrillable = outline.forms.filter((f) => f.unit_ordinal === unit.ordinal && drillable(f));
    const neverTaught = unitDrillable.filter((f) => !taught.has(f.id));
    if (neverTaught.length) {
      warnings.push(`${slug}: never taught in a lesson: ${neverTaught.map((f) => f.form).join(', ')}`);
    }
  }

  return { sentences, slots, errors, warnings };
}
