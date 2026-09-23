import assert from 'node:assert/strict';
import { test } from 'node:test';

import { recapItems } from '../../../src/lib/lesson.ts';
import { typedHere } from '../../../src/lib/round.ts';
import { glueSeen } from '../../../src/lib/sentences.ts';
import {
  earnedTail,
  exercisesFor,
  gapMode,
  interleave,
  itemsForForm,
  mistakeFormIds,
  modeForRung,
  promoteTail,
  promotedMode,
  tierOf,
  typedGap,
} from '../../../src/lib/session.ts';
import { gradeGap, gradeTyped, missedForms, selfGlossed, sentenceAnswerMatches, sentenceTiles } from '../../../src/lib/answers.ts';
import { DEFAULT_LADDER, ladderFor } from '../../../src/lib/sentences.ts';
import { conceptScores, conceptsOf, weakestConcept } from '../../../src/lib/concepts.ts';
import { forms, formById, formOf, iso, learner, state, unitBySlug } from './fixture.mjs';

const PRODUCTION = ['word_build', 'typing', 'listen_build', 'sentence_build', 'sentence_listen', 'sentence_gap_typed'];

test('the tail promotes one step, and leaves intros, re-asks and the top step alone', () => {
  const data = learner();
  const cafe = formOf('café');
  const sentence = data.sentences.find((s) => s.form_ids.includes(cafe.id));
  const st = state(cafe);
  const queue = [
    { form: cafe, state: st, mode: 'multiple_choice', direction: 'es_to_en' },
    { form: cafe, state: st, mode: 'multiple_choice', direction: 'es_to_en' },
    { form: cafe, state: st, mode: 'word_build', direction: 'en_to_es' },
    { form: cafe, state: null, mode: 'word_build', direction: 'en_to_es' },
    { form: cafe, state: st, mode: 'sentence_meaning', direction: 'en_to_es', sentence },
    { form: cafe, state: st, mode: 'multiple_choice', direction: 'es_to_en', isRetry: true },
    { form: cafe, state: null, mode: 'multiple_choice', direction: 'es_to_en', isIntro: true },
    { form: cafe, state: st, mode: 'typing', direction: 'en_to_es' },
  ];
  const { queue: next, promoted } = promoteTail(queue, 1, new Map());
  assert.deepEqual(
    next.map((i) => i.mode),
    ['multiple_choice', 'word_build', 'typing', 'word_build', 'sentence_gap', 'multiple_choice', 'multiple_choice', 'typing'],
  );
  assert.equal(promoted, 3);
  assert.equal(next[1].direction, 'en_to_es');
  assert.equal(promotedMode({ ...queue[4], mode: 'sentence_build' }, new Map()), null, 'no audio, no listening step');
});

test('the tail is earned by the first N first tries all right', () => {
  const ladder = ladderFor(0);
  assert.ok(earnedTail([true, true, true, true, true, true], ladder));
  assert.ok(!earnedTail([true, true, true, true, true], ladder));
  assert.ok(!earnedTail([true, true, false, true, true, true], ladder));
  assert.ok(!earnedTail([true, true, true, true, true, true], ladderFor(-1)), 'an easier ladder has no tail');
});

test('a unit recap asks its weakest forms once each, half of them to produce', () => {
  const unit = unitBySlug('un-cafe-por-favor');
  const unitForms = forms.filter((f) => f.unit_id === unit.id && !f.is_glue && f.pos !== 'propn');
  assert.ok(unitForms.length >= 6);
  const states = unitForms.map((f, i) => state(f, { lapses: i % 3, ease_factor: 2.5 - (i % 4) / 10, due_at: i % 2 ? iso(-1) : iso(3) }));
  const data = learner(states);
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn' && f.unit_order <= unit.course_order);
  for (let run = 0; run < 20; run++) {
    const items = recapItems(data, unit, 'unit', 6, deck, glueSeen(data.sentences), new Date().toISOString());
    assert.ok(items.length > 0 && items.length <= 6);
    const ids = items.flatMap((i) => (i.mode === 'sentence_gap' || !i.sentence ? [i.form.id] : []));
    assert.equal(new Set(ids).size, ids.length, 'no form asked twice on its own');
    assert.ok(items.every((i) => i.mode !== 'sentence_meaning'), 'never below the gap');
    const production = items.filter((i) => PRODUCTION.includes(i.mode)).length;
    assert.ok(production >= Math.ceil(items.length / 2) || items.every((i) => i.mode === 'sentence_gap'), items.map((i) => i.mode).join());
    for (const item of items.filter((i) => !i.sentence)) {
      const st = states.find((s) => s.form_id === item.form.id);
      assert.equal(!!item.filler, !(st.due_at <= new Date().toISOString()), 'not-due words are filler');
    }
  }
});

test('mistakes are the forms whose latest commit in two weeks was a miss', () => {
  const rows = [
    { form_id: 'a', rating: 0, created_at: iso(-1) },
    { form_id: 'b', rating: 1, created_at: iso(-3) },
    { form_id: 'b', rating: 2, created_at: iso(-2) },
    { form_id: 'c', rating: 1, created_at: iso(-5) },
    { form_id: 'd', rating: 0, created_at: iso(-20) },
  ];
  assert.deepEqual(mistakeFormIds(rows), ['a', 'c']);
});

test('concepts come from features; weak ones need enough tries', () => {
  const soy = formOf('soy');
  assert.ok(conceptsOf(soy).includes('ser'));
  assert.deepEqual(conceptsOf({ lemma: 'mirar', pos: 'verb', features: { mood: 'imp', voseo: true } }), ['verbo.imperativo.vos']);
  const logs = Array.from({ length: 10 }, (_, i) => ({ form_id: soy.id, correct: i < 6 }));
  const scores = conceptScores(logs, formById);
  assert.equal(weakestConcept(scores)?.concept, scores[0].concept);
  assert.ok(scores[0].accuracy < 0.8);
  assert.equal(conceptScores(logs.slice(0, 5), formById).length, 0);
});

test('a word that is its own English is never asked to be translated', () => {
  const cortado = formOf('cortado');
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  const st = state(cortado);
  // "Build the word in Spanish: cortado" prints its own answer, and so does
  // every choice screen. With no recording there is nothing left to ask.
  for (let i = 0; i < 40; i++) assert.deepEqual(exercisesFor(cortado, st, deck), []);
  assert.deepEqual(
    exercisesFor({ ...cortado, audio_path: 'a.mp3' }, st, deck),
    ['listen', 'listen_build'],
    'given a recording, it is heard and spelt',
  );
  // And the tail never promotes one into a translation either.
  assert.equal(promotedMode({ form: cortado, state: st, mode: 'true_false' }, new Map()), null);
  assert.equal(promotedMode({ form: cortado, state: st, mode: 'word_build' }, new Map()), null);
  // A word with a translation of its own is untouched.
  assert.equal(promotedMode({ form: formOf('café'), state: st, mode: 'true_false' }, new Map()), 'word_build');
});

const RECOGNITION = ['multiple_choice', 'true_false', 'listen'];

test('a group is ordered easiest to hardest, and ends on the exercise that produces', () => {
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  const cafe = formOf('café');
  const settled = state(cafe, { interval_days: 30 });
  for (let run = 0; run < 40; run++) {
    const fresh = exercisesFor(cafe, null, deck);
    assert.ok(RECOGNITION.includes(fresh[0]), fresh.join());
    assert.ok(PRODUCTION.includes(fresh.at(-1)), fresh.join());

    // A settled word earns a third angle. It goes in the middle: the last
    // exercise is still the one that makes her produce.
    const mature = exercisesFor(cafe, settled, deck);
    assert.equal(mature.length, 3, mature.join());
    assert.ok(mature.slice(0, 2).every((m) => RECOGNITION.includes(m)), mature.join());
    assert.ok(PRODUCTION.includes(mature[2]), mature.join());
    assert.equal(new Set(mature).size, 3, 'three different exercises');
  }
});

test('interleave keeps easy before hard, blends the seam, and breaks up runs of one mode', () => {
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  const words = deck.filter((f) => !f.form.includes(' ')).slice(0, 10);

  // The old deal: every group's first exercise, then every group's second.
  const blocks = (groups) => {
    const out = [];
    const depth = Math.max(0, ...groups.map((g) => g.length));
    for (let round = 0; round < depth; round++) for (const g of groups) if (g[round]) out.push(g[round]);
    return out;
  };
  const runs = (modes) => {
    let adjacent = 0;
    let run = 1;
    let longest = 1;
    for (let i = 1; i < modes.length; i++) {
      if (modes[i] !== modes[i - 1]) run = 1;
      else {
        adjacent += 1;
        longest = Math.max(longest, (run += 1));
      }
    }
    return { adjacent, longest };
  };

  let dealt = 0;
  let blocked = 0;
  for (let run = 0; run < 60; run++) {
    const groups = words
      .map((f) => itemsForForm(f, state(f, { interval_days: 30 }), deck))
      .filter((g) => g.length);
    const items = interleave(groups.map((g) => [...g]));
    const modes = items.map((i) => i.mode);
    assert.equal(items.length, groups.reduce((n, g) => n + g.length, 0), 'nothing is lost');

    // The ramp survives: recognition sits earlier in the round than production,
    // the round opens on an easy screen and closes on one that produces.
    const mean = (pool) => {
      const at = modes.flatMap((m, i) => (pool.includes(m) ? [i] : []));
      return at.reduce((a, b) => a + b, 0) / at.length;
    };
    assert.ok(mean(RECOGNITION) < mean(PRODUCTION), modes.join());
    assert.ok(RECOGNITION.includes(modes[0]), `opens easy: ${modes.join()}`);
    assert.ok(PRODUCTION.includes(modes.at(-1)), `closes hard: ${modes.join()}`);

    // Each word still meets its own exercises easiest first, wherever they land.
    for (const group of groups) {
      const at = group.map((it) => items.indexOf(it));
      assert.deepEqual(at, [...at].sort((a, b) => a - b), 'a word is never asked to produce before it recognises');
    }

    // The seam is blended, not a wall: the two halves overlap.
    assert.ok(
      modes.findIndex((m) => PRODUCTION.includes(m)) < modes.findLastIndex((m) => RECOGNITION.includes(m)),
      `the passes overlap: ${modes.join()}`,
    );

    // No word twice in a row — the one rule dealing in rounds gave us for free.
    for (let i = 1; i < items.length; i++) assert.notEqual(items[i].form.id, items[i - 1].form.id, modes.join());

    // Runs of one exercise are broken up wherever a neighbour differs. They can
    // survive at the end, where every screen is production and only word_build
    // and typing exist to alternate between.
    const here = runs(modes);
    assert.ok(here.longest <= 5, `no long run of one mode: ${modes.join()}`);
    dealt += here.adjacent;
    blocked += runs(blocks(groups.map((g) => [...g])).map((i) => i.mode)).adjacent;
  }
  assert.ok(dealt * 3 < blocked, `clumping: ${dealt} adjacencies against ${blocked} dealt in blocks`);
});

test('a sentence held at the gap hardens instead of asking the same screen forever', () => {
  const data = learner();
  const sentence = data.sentences[0];
  const at = (passes) => gapMode({ ...sentence, shown: { shown_count: passes, correct_count: passes, last_shown_at: null } });
  assert.equal(at(0), 'sentence_gap');
  assert.equal(at(DEFAULT_LADDER.rungBuildAt), 'sentence_gap', 'a sentence on its way up still sees four choices');
  assert.equal(at(DEFAULT_LADDER.gapTilesAt), 'sentence_gap_tiles');
  assert.equal(at(DEFAULT_LADDER.gapTypedAt), 'sentence_gap_typed');
  assert.equal(at(DEFAULT_LADDER.gapTypedAt + 5), 'sentence_gap_typed', 'and stays there');
  // An easier ladder holds her on the choices for longer.
  const easy = ladderFor(-1);
  assert.equal(gapMode({ ...sentence, shown: { correct_count: 4 } }, easy), 'sentence_gap');
});

test('the meaning rung sometimes asks her to build the English instead of picking it', () => {
  const data = learner();
  const sentence = data.sentences.find((s) => s.en.split(/\s+/).length >= 3);
  const seen = new Set();
  for (let run = 0; run < 80; run++) seen.add(modeForRung('meaning', sentence));
  assert.deepEqual([...seen].sort(), ['sentence_meaning', 'sentence_meaning_tiles']);

  // A two-word English has nothing worth assembling.
  const short = { ...sentence, en: 'Hi there' };
  for (let run = 0; run < 40; run++) assert.equal(modeForRung('meaning', short), 'sentence_meaning');
});

test('the English of a sentence builds back into the sentence, with no capital to give it away', () => {
  const data = learner();
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  for (const sentence of data.sentences) {
    const { answer, tiles } = sentenceTiles(sentence, deck, 'en');
    assert.ok(sentenceAnswerMatches(answer, sentence, { side: 'en' }), sentence.en);
    assert.ok(tiles.length > answer.length, 'the bank carries spares');
    assert.ok(answer.every((w) => !/[.,!?;:]/.test(w)), `no punctuation on a tile: ${answer.join(' ')}`);
    // Only English "I" and a name keep a capital — everything else would be
    // the first tile in plain sight.
    const names = new Set(
      sentence.tokens.filter((t) => t.form_ids.length === 0 && !t.glue).flatMap((t) => t.surface.split(/\s+/)),
    );
    if (/^[A-Z]/.test(answer[0])) {
      assert.ok(/^I($|')/.test(answer[0]) || names.has(answer[0]), `unexplained capital: ${answer.join(' ')}`);
    }
  }
});

test('a word with a recording can be spelt from its sound, and typed into a sentence it has passed', () => {
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  const cafe = formOf('café');
  const heard = { ...cafe, audio_path: 'cafe.mp3' };

  const silent = new Set();
  const withAudio = new Set();
  for (let run = 0; run < 120; run++) {
    for (const m of exercisesFor(cafe, state(cafe), deck)) silent.add(m);
    for (const m of exercisesFor(heard, state(heard), deck)) withAudio.add(m);
  }
  assert.ok(!silent.has('listen_build'), 'nothing to hear, nothing to spell');
  assert.ok(withAudio.has('listen_build'), 'a recording is a second way to produce the word');
  assert.ok(withAudio.has('word_build'), 'and it does not replace building from the English');

  // The typed gap: the word blanked out of a sentence she has already passed.
  const base = learner();
  const passed = base.sentences.map((s) => ({ ...s, shown: { shown_count: 3, correct_count: 3, last_shown_at: null } }));
  const data = { ...base, sentences: passed, formById: base.formById, stateByForm: new Map() };
  const seen = glueSeen(passed);
  let swapped = 0;
  for (let run = 0; run < 200; run++) {
    const group = itemsForForm(cafe, state(cafe), deck);
    const out = typedGap(group, cafe, data, new Set(), seen, DEFAULT_LADDER);
    const gap = out.find((i) => i.mode === 'sentence_gap_typed');
    if (!gap) {
      assert.deepEqual(out.map((i) => i.mode), group.map((i) => i.mode), 'left alone or swapped, never reordered');
      continue;
    }
    swapped += 1;
    assert.ok(gap.sentence, 'a typed gap carries its sentence');
    assert.ok(gap.sentence.form_ids.includes(cafe.id), 'and the sentence holds the word');
    assert.equal(out.length, group.length, 'it replaces the production screen, it does not add one');
    assert.ok(PRODUCTION.includes(out.at(-1).mode), 'and stays last, where the hard screen goes');
  }
  assert.ok(swapped > 40 && swapped < 160, `sometimes, not always: ${swapped}/200`);

  // A sentence already on the round's table is not shown twice.
  const table = new Set(passed.filter((s) => s.form_ids.includes(cafe.id)).map((s) => s.id));
  for (let run = 0; run < 40; run++) {
    const out = typedGap(itemsForForm(cafe, state(cafe), deck), cafe, data, table, seen, DEFAULT_LADDER);
    assert.ok(!out.some((i) => i.mode === 'sentence_gap_typed'), 'no sentence twice in one round');
  }

  // A sentence she has never passed is not one to type into.
  const fresh = { ...base, sentences: base.sentences.map((s) => ({ ...s, shown: null })), stateByForm: new Map() };
  for (let run = 0; run < 40; run++) {
    const out = typedGap(itemsForForm(cafe, state(cafe), deck), cafe, fresh, new Set(), glueSeen(fresh.sentences), DEFAULT_LADDER);
    assert.ok(!out.some((i) => i.mode === 'sentence_gap_typed'), 'not before she has read it once');
  }
});

test('a blank accepts the word that fits the sentence, and nothing else', () => {
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  const bueno = formOf('bueno');
  const cafe = formOf('café');

  // What a meaning prompt forgives, a blank does not: "Bien, chau." is not the
  // sentence, and a feminine adjective in a masculine slot is the mistake.
  assert.equal(gradeTyped('bien', bueno, deck).correct, true, 'a meaning prompt still takes a synonym');
  assert.equal(gradeGap('bien', bueno, deck).correct, false, 'a blank does not');
  for (const [masc, fem] of [['chileno', 'chilena'], ['porteño', 'porteña'], ['uruguayo', 'uruguaya']]) {
    const form = formOf(masc);
    if (!form) continue;
    assert.equal(gradeTyped(fem, form, deck).correct, true, `${fem} answers a prompt for ${masc}`);
    assert.equal(gradeGap(fem, form, deck).correct, false, `${fem} does not fill ${masc}'s blank`);
  }

  // The forgiveness that has nothing to do with meaning survives.
  assert.equal(gradeGap('bueno', bueno, deck).correct, true);
  assert.deepEqual(
    { correct: gradeGap('cafe', cafe, deck).correct, note: gradeGap('cafe', cafe, deck).note },
    { correct: true, note: 'accent' },
  );
});

test('a failed English build blames the word the round is drilling', () => {
  const data = learner();
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  // buildSession re-aims a sentence at a word that is actually due, so the
  // word on screen is often not the one the sentence was written for.
  const sentence = data.sentences.find((s) => s.form_ids.some((id) => id !== s.target_form_id));
  const drilled = sentence.form_ids.find((id) => id !== sentence.target_form_id);
  assert.deepEqual(missedForms(sentence, ['nonsense'], deck, { side: 'en', drilled }), [drilled]);
  assert.deepEqual(missedForms(sentence, ['nonsense'], deck, { side: 'en' }), [sentence.target_form_id]);
});

test('a typed gap is only offered where the sentence is really carrying it', () => {
  const deck = forms.filter((f) => !f.is_glue && f.pos !== 'propn');
  const base = learner();
  const words = deck.filter((f) => !f.form.includes(' ')).slice(0, 40);
  const draw = (data, ladder, table = new Set()) =>
    words.flatMap((f) =>
      Array.from({ length: 20 }, () => typedGap(itemsForForm(f, state(f), deck), f, data, table, glueSeen(data.sentences), ladder)),
    );

  // Never into a sentence she has not passed — including on the fast ladder,
  // where `rungFor` never returns 'meaning' and cannot be used as the gate.
  const unseen = { ...base, sentences: base.sentences.map((s) => ({ ...s, shown: null })), stateByForm: new Map() };
  for (const ladder of [DEFAULT_LADDER, ladderFor(1), ladderFor(-1)]) {
    assert.ok(
      !draw(unseen, ladder).some((g) => g.some((i) => i.mode === 'sentence_gap_typed')),
      `nothing typed into an unread sentence on ladder ${ladder.offset}`,
    );
  }

  const passed = base.sentences.map((s) => ({ ...s, shown: { shown_count: 3, correct_count: 3, last_shown_at: null } }));
  const data = { ...base, sentences: passed, stateByForm: new Map() };
  const gaps = draw(data, DEFAULT_LADDER).flatMap((g) => {
    const at = g.findIndex((i) => i.mode === 'sentence_gap_typed');
    return at < 0 ? [] : [{ at, item: g[at] }];
  });
  assert.ok(gaps.length > 0, 'it still fires once the sentence has been read');
  for (const { at, item } of gaps) {
    assert.ok(at > 0, 'never the first screen of a word: she recognises it before she types it');
    const left = item.sentence.tokens.reduce(
      (n, t) => n + (t.form_ids.includes(item.form.id) ? 0 : t.surface.split(/\s+/).length),
      0,
    );
    assert.ok(left >= 3, `the sentence has to be carrying something: "${item.sentence.es}" leaves ${left}`);
    assert.ok(!selfGlossed(item.form), 'a word that is its own English would be spelt out by the line underneath');
  }
});

test('a round runs recognise -> assemble -> produce, with the kinds mixed inside each', () => {
  const deck = forms
    .filter((f) => !f.is_glue && f.pos !== 'propn')
        // Roughly the course's own coverage (51 of 119 published forms), spread
    // rather than bunched at the front of the deck.
    .map((f, i) => (i % 7 < 3 ? { ...f, audio_path: `${f.id}.mp3` } : f));
  const words = deck.filter((f) => !f.form.includes(' ')).slice(0, 10);

  for (let run = 0; run < 60; run++) {
    const groups = words
      .map((f) => itemsForForm(f, state(f, { interval_days: 30 }), deck))
      .filter((g) => g.length);
    const items = interleave(groups.map((g) => [...g]));
    const modes = items.map((i) => i.mode);
    const tiers = modes.map(tierOf);

    // The ramp: each tier sits later in the round than the one below it.
    const mean = (t) => {
      const at = tiers.flatMap((x, i) => (x === t ? [i] : []));
      return at.length ? at.reduce((a, b) => a + b, 0) / at.length : null;
    };
    const [easy, medium] = [mean(0), mean(1)];
    assert.ok(easy !== null && easy < medium, `recognise before assemble: ${modes.join()}`);
    assert.equal(tiers[0], 0, `a round opens on something she can tap: ${modes.join()}`);
    // A tier is a floor, not a slot: a word's own hardest screen goes last for
    // that word, so an assemble screen can land late among the produce ones.
    // What must hold is that nothing is asked to be produced early.
    if (tiers.includes(2)) {
      assert.ok(
        tiers.indexOf(2) > modes.length / 3,
        `nothing produced in the first third: ${modes.join()}`,
      );
    }

    // The tiers run into each other rather than arriving as blocks: the
    // tapping is not all finished before the first harder screen shows up.
    assert.ok(
      tiers.lastIndexOf(0) > tiers.findIndex((t) => t > 0),
      `the tiers overlap rather than arriving as blocks: ${modes.join()}`,
    );

    // Inside a tier, the kinds are mixed — which is the whole point. Two of a
    // kind in a row survives where a tier genuinely has nothing else left to
    // offer; three does not.
    let run3 = 0;
    for (let i = 1; i < modes.length; i++) run3 = modes[i] === modes[i - 1] ? run3 + 1 : 0;
    assert.ok(run3 < 3, `no long run of one kind: ${modes.join()}`);

    // A word is never asked twice in a row, and never produces before it has
    // recognised, wherever the blend put its screens.
    for (let i = 1; i < items.length; i++) assert.notEqual(items[i].form.id, items[i - 1].form.id, modes.join());
    for (const group of groups) {
      const at = group.map((it) => items.indexOf(it));
      assert.deepEqual(at, [...at].sort((a, b) => a - b), 'a word keeps its own easiest-first order');
    }
  }
});

test('the hardest screens no longer pile up at the end of a round', () => {
  const deck = forms
    .filter((f) => !f.is_glue && f.pos !== 'propn')
        // Roughly the course's own coverage (51 of 119 published forms), spread
    // rather than bunched at the front of the deck.
    .map((f, i) => (i % 7 < 3 ? { ...f, audio_path: `${f.id}.mp3` } : f));
  const words = deck.filter((f) => !f.form.includes(' ')).slice(0, 10);
  let tail = 0;
  const runs = 200;
  for (let run = 0; run < runs; run++) {
    const groups = words.map((f) => itemsForForm(f, state(f, { interval_days: 30 }), deck)).filter((g) => g.length);
    const tiers = interleave(groups.map((g) => [...g])).map((i) => tierOf(i.mode));
    let t = 0;
    for (let i = tiers.length - 1; i >= 0 && tiers[i] === 2; i--) t += 1;
    tail += t;
  }
  // Lumping "builds it from tiles" together with "types it from nothing" put
  // five of the hardest screens back to back at the end of a round, which is
  // where she is most tired. Three tiers keep that tail short.
  assert.ok(tail / runs < 2, `mean run of produce screens at the end: ${(tail / runs).toFixed(2)}`);
});

test('"fácil" is earned by spelling the word out, on its own or into a sentence', () => {
  const data = learner();
  const cafe = formOf('café');
  const sentence = data.sentences.find((s) => s.form_ids.includes(cafe.id) && s.form_ids.length > 1);
  const other = data.formById.get(sentence.form_ids.find((id) => id !== cafe.id));

  assert.ok(typedHere({ form: cafe, mode: 'typing' }, cafe), 'typed on its own');
  assert.ok(typedHere({ form: cafe, mode: 'sentence_gap_typed', sentence }, cafe), 'typed into a blank');

  // The blank credits every word of its sentence, but she only typed one of
  // them — the rest she read, which does not stretch an interval the same way.
  assert.ok(!typedHere({ form: cafe, mode: 'sentence_gap_typed', sentence }, other), 'not the words around it');

  // Everything she assembled rather than spelt stays at "bien".
  for (const mode of ['word_build', 'listen_build', 'sentence_gap', 'sentence_gap_tiles', 'multiple_choice']) {
    assert.ok(!typedHere({ form: cafe, mode }, cafe), mode);
  }
});
