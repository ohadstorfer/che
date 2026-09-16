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
 * @returns {{ sentences, slots, stories: { lessons, lines, ordinals }, phrases, errors, warnings }}
 */
export function buildContent(outline, content, { source = 'human', status = 'draft' } = {}) {
  const errors = [];
  const warnings = [];
  const sentences = [];
  const slots = [];
  const storyLessons = [];
  const storyLines = [];
  const phrases = [];
  /** Lessons that move down a place to make room for a story before them. */
  const ordinals = new Map();
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

    const addSentence = (key, s, where, { kind, autoTarget = false } = {}) => {
      for (const problem of checkSentence(outline, unit, s.es)) errors.push(`${where} "${s.es}": ${problem}`);
      // A story line needn't name its target: the newest drillable word in it is.
      const target =
        s.target || !autoTarget
          ? resolveFormRef(outline, unit, s.target, `${where} target`, errors)
          : tokenize(s.es, index)
              .flatMap((t) => t.forms)
              .filter(drillable)
              .sort((a, b) => b.unit_order - a.unit_order)[0];
      if (autoTarget && !target) errors.push(`${where}: "${s.es}" has no word to drill`);
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
        kind: kind ?? s.kind ?? (tokens.length > 1 ? 'sentence' : 'word'),
        difficulty: s.difficulty ?? 1,
        source,
        attribution: null,
        audio_path: null,
        status,
      };
      if (sentences.some((x) => x.id === row.id)) {
        errors.push(`${where}: "${s.es}" is written twice in ${slug} — reuse the sentence by its key`);
        return null;
      }
      sentenceByKey.set(key, row);
      sentences.push(row);
      return row;
    };

    for (const [key, s] of Object.entries(block.sentences ?? {})) {
      addSentence(key, s, `${slug} · sentence ${key}`);
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
          scope: null,
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
          case 'recap': {
            if (!(value >= 1 && value <= 16)) return void errors.push(`${where}: recap count must be 1–16`);
            const scope = raw.scope ?? 'unit';
            if (!['unit', 'section'].includes(scope)) return void errors.push(`${where}: recap scope must be unit or section`);
            slot.review_count = value;
            slot.scope = scope;
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

    lintLessons(unit, block, slots, sentences, outline, warnings, errors);

    // Stories: a lesson of lines, placed just before the unit's review lesson.
    const review = unit.lessons.find((l) => l.kind === 'review');
    let storyOrdinal = review ? review.ordinal : unit.lessons.length + 1;
    for (const [key, story] of Object.entries(block.stories ?? {})) {
      const where = `${slug} · story ${key}`;
      const lesson = {
        id: ids.story(slug, key),
        unit_id: unit.id,
        ordinal: storyOrdinal,
        title_en: story.title ?? 'Story',
        kind: 'story',
        status,
      };
      storyOrdinal += 1;
      storyLessons.push(lesson);
      const lines = story.lines ?? [];
      lines.forEach((line, i) => {
        const lWhere = `${where} · line ${i + 1}`;
        const sentence = line.sentence
          ? sentenceByKey.get(line.sentence)
          : addSentence(`${key}:${i + 1}`, line, lWhere, { kind: 'dialogue', autoTarget: true });
        if (!sentence) {
          if (line.sentence) errors.push(`${lWhere}: no sentence "${line.sentence}" in ${slug}`);
          return;
        }
        if (!line.speaker) errors.push(`${lWhere}: needs a speaker`);
        let question = line.question ?? null;
        if (question?.type === 'gap') {
          // Any word taught by now can be the gap, as long as it is in the line.
          const form = outline.forms.find(
            (f) =>
              fold(f.form) === fold(String(question.form)) &&
              f.unit_order <= unit.course_order &&
              sentence.tokens.some((t) => t.form_ids.includes(f.id)),
          );
          if (!form) errors.push(`${lWhere}: gap word "${question.form}" is not a taught word of "${sentence.es}"`);
          question = form ? { type: 'gap', form: form.id } : null;
        } else if (question?.type === 'choice') {
          const ok =
            question.prompt_en && Array.isArray(question.options_en) && question.options_en.length >= 2 &&
            Number.isInteger(question.correct) && question.options_en[question.correct] != null;
          if (!ok) errors.push(`${lWhere}: a choice question needs prompt_en, options_en and a valid correct index`);
        } else if (question && !['meaning', 'build'].includes(question.type)) {
          errors.push(`${lWhere}: unknown question type "${question.type}"`);
        }
        storyLines.push({
          id: ids.slot(lesson.id, i + 1),
          lesson_id: lesson.id,
          ordinal: i + 1,
          speaker: line.speaker ?? 'narrator',
          sentence_id: sentence.id,
          question,
        });
      });
      lintStory(outline, unit, where, lines, storyLines.filter((l) => l.lesson_id === lesson.id), sentences, taught, warnings, errors);
    }
    if (review && storyOrdinal !== review.ordinal) {
      for (const l of unit.lessons) if (l.ordinal >= review.ordinal) ordinals.set(l.id, l.ordinal + (storyOrdinal - review.ordinal));
    }

    // Key phrases for the unit's guidebook.
    (block.key_phrases ?? []).forEach((key, i) => {
      const sentence = sentenceByKey.get(key);
      if (!sentence) return void errors.push(`${slug} · key phrase ${i + 1}: no sentence "${key}"`);
      if (i >= 5) return void errors.push(`${slug}: at most 5 key phrases`);
      phrases.push({ unit_id: unit.id, ordinal: i + 1, sentence_id: sentence.id });
    });
    if (block.lessons && (block.key_phrases ?? []).length < 3) {
      warnings.push(`${slug}: unit.phrases — a unit with lessons should have 3–5 key phrases`);
    }

    const unitDrillable = outline.forms.filter((f) => f.unit_ordinal === unit.ordinal && drillable(f));
    const neverTaught = unitDrillable.filter((f) => !taught.has(f.id));
    if (neverTaught.length) {
      warnings.push(`${slug}: never taught in a lesson: ${neverTaught.map((f) => f.form).join(', ')}`);
    }
  }

  return {
    sentences,
    slots,
    stories: { lessons: storyLessons, lines: storyLines, ordinals },
    phrases,
    errors,
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Lesson linters (learning-engine-spec §5.2). Density and shape are flags for
// the reviewer; a unit without a real check is an error.
// ---------------------------------------------------------------------------
function lintLessons(unit, block, allSlots, sentences, outline, warnings, errors) {
  if (!block.lessons) return;
  const sentenceById = new Map(sentences.map((x) => [x.id, x]));
  const has = (slot, formId) => sentenceById.get(slot.sentence_id)?.tokens.some((t) => t.form_ids.includes(formId));
  const BUILD = ['sentence_build', 'sentence_listen'];
  const uses = new Map();

  for (const lesson of unit.lessons) {
    const own = allSlots.filter((x) => x.lesson_id === lesson.id);
    const where = `${unit.slug} · lesson ${lesson.ordinal}`;
    for (const slot of own) {
      if (slot.kind === 'teach') uses.set(slot.form_id, (uses.get(slot.form_id) ?? 0) + 1);
      if (slot.kind === 'drill') {
        for (const t of sentenceById.get(slot.sentence_id)?.tokens ?? []) {
          for (const id of t.form_ids) uses.set(id, (uses.get(id) ?? 0) + 1);
        }
      }
    }
    if (lesson.kind === 'lesson' && own.length) {
      const teach = own.filter((x) => x.kind === 'teach');
      const min = lesson.ordinal === 1 ? 3 : 4;
      if (teach.length < min || teach.length > 6) {
        warnings.push(`${where}: lesson.density — ${teach.length} new forms (want ${min}–6)`);
      }
      if (!own.some((x) => x.kind === 'drill' && BUILD.includes(x.mode))) {
        warnings.push(`${where}: lesson.production — no sentence build`);
      }
      // A word's first drill after it is taught shouldn't jump straight to tiles.
      for (const t of teach) {
        const first = own.slice(own.indexOf(t) + 1).find((x) => x.kind === 'drill' && has(x, t.form_id));
        if (first && BUILD.includes(first.mode)) {
          const form = outline.forms.find((f) => f.id === t.form_id)?.form;
          warnings.push(`${where}: lesson.ramp — "${form}" goes straight to tiles`);
        }
      }
    }
    if (lesson.kind === 'review' && own.length) {
      const recap = own.find((x) => x.kind === 'recap');
      if (!recap || recap.review_count < 6) errors.push(`${where}: unit.check — the review lesson needs a recap of 6 or more`);
    }
  }
  for (const f of outline.forms.filter((x) => x.unit_id === unit.id && drillable(x))) {
    if ((uses.get(f.id) ?? 0) > 0 && (uses.get(f.id) ?? 0) < 3) {
      warnings.push(`${unit.slug}: unit.coverage — "${f.form}" is drilled ${uses.get(f.id)} time(s) (want 3)`);
    }
  }
}

/** A story's shape (learning-engine-spec §8.2). */
function lintStory(outline, unit, where, rawLines, lines, sentences, taught, warnings, errors) {
  if (lines.length < 8 || lines.length > 16) errors.push(`${where}: story.shape — ${lines.length} lines (want 8–16)`);
  const speakers = new Set(lines.map((l) => l.speaker).filter((s) => s !== 'narrator'));
  if (speakers.size < 2 || speakers.size > 3) errors.push(`${where}: story.shape — ${speakers.size} speakers (want 2–3)`);
  const asked = lines.map((l) => !!l.question);
  if (asked.filter(Boolean).length < 4) warnings.push(`${where}: story.shape — fewer than 4 questions`);
  if (asked.some((q, i) => q && asked[i - 1])) warnings.push(`${where}: story.shape — two questions back to back`);
  if (!rawLines.some((l) => l.question?.type === 'choice')) warnings.push(`${where}: story.shape — no comprehension question`);

  const byId = new Map(sentences.map((s) => [s.id, s]));
  const formById = new Map(outline.forms.map((f) => [f.id, f]));
  let content = 0;
  let fresh = 0;
  for (const l of lines) {
    for (const t of byId.get(l.sentence_id)?.tokens ?? []) {
      const f = t.form_ids.map((id) => formById.get(id)).find((x) => x && drillable(x));
      if (!f) continue;
      content += 1;
      // Known: anything from earlier units, or taught in this unit's lessons.
      if (!taught.has(f.id)) fresh += 1;
    }
  }
  if (content && fresh / content > 0.1) {
    warnings.push(`${where}: story.known — ${Math.round((100 * fresh) / content)}% of its words aren't taught yet (want ≤ 10%)`);
  }
}
