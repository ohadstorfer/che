# Che — course roadmap past A1

Sections 1–3 (units 1–30, A1) are published. This is the plan for what comes after them: which section teaches what, in what order, and the rules every new section is held to. Each section is ten units, the last one a checkpoint (`outline.mjs` makes the last unit of a section one automatically), and each gets its own `docs/course/section-N.yaml`.

The syllabus follows Duolingo's order (`duolingo-structure.md`) where it serves Buenos Aires and leaves it where it doesn't. The two standing departures are the same ones section 1 made: **vos from day one**, and **the simple past before any compound tense** — Buenos Aires says *hoy comí*, never *hoy he comido*, so the present perfect is taught late and only to be recognised.

## The standard every section meets

A section is done when all of this holds, not before:

1. **Outline** — `section-N.yaml` passes `npm run course:validate -- --yaml` with no errors: every form tagged (voseo forms `vos`, preterite forms `pret`), bound forms taught as their chunk (`me duele`, `te toca`, docs/course-spec.md §1.5), no word from another Spanish (`regional-words.yaml`), every unit's sample sentence sayable with what it has taught.
2. **Seed** — `npm run course:seed -- supabase/migrations/<ts>_seed_section_N.sql`, dry-run, push. The seed only adds.
3. **Sentences** — every unit through the agent loop (`course:agent -- prompts | check | publish`): a writer drafts about three candidates for each sentence the unit needs, the checks reject anything off-lexicon or off-dialect, a fresh judge scores the survivors as a strict porteño editor, and only the best ship. Units are run in order, and a unit's prompts are made only once the units before it are published, so its writer has their sentences as examples.
4. **Glosses and answers** — `course:gloss` and `course:answers` over the new sentences.
5. **Validate and snapshot** — `npm run course:validate` (the live database) with no errors, `npm run course:snapshot`, commit.
6. **The sections screen** — its can-do line in `src/lib/sections.ts`, in the Spanish the section teaches.

No audio until a section's content has settled (`course:tts` is run separately).

## Section 4 · A2.1 · "What happened" · units 31–40

The past arrives, and with it telling a story. `section-4.yaml`.

| # | Unit | Teaches | Sample |
|---|---|---|---|
| 31 | Ayer laburé | preterite -ar, yo/vos/él; *ayer, anoche, pasado*; *¿qué pasó?* | *Ayer laburé mucho.* |
| 32 | Anoche salí | preterite -er/-ir; first *nosotros*; *conocer*; *recién* | *Anoche salí con mis amigos.* |
| 33 | ¿Cómo te fue? | *fui/fue* (ir and ser), *estuve*, *tuve*; *partido, recital* | *El sábado fui a la cancha con mi viejo.* |
| 34 | ¿Qué hiciste el finde? | *hice, vi, dije, vine, pude*; *primero, entonces, al final* | *El finde vi una película con Sofi.* |
| 35 | Más alto que yo | *más/menos … que, tan … como, mejor, peor*, *-ísimo*; *más grande* = older | *Mi hermana es más alta que yo.* |
| 36 | Me duele la cabeza | *me duele / me duelen* as chunks; the body; *turno, guardia, engripado* | *Me duele la cabeza.* |
| 37 | Te llamo mañana | *lo, la, los, las, les*; vos commands with a pronoun: *llamame, mandame, dame, prestame* | *Te llamo mañana.* |
| 38 | Hoy te toca a vos | chores; *me toca* as a chunk; *hacer las compras, sacar la basura* | *Hoy te toca lavar los platos.* |
| 39 | Me voy de viaje | *viajar*; *micro, pasaje, valija*; Mar del Plata, Bariloche, Mendoza | *En enero viajé a Mar del Plata.* |
| 40 | Contame todo (checkpoint) | storytelling: *contame, de repente, por suerte, igual, o sea*; *¡qué garrón!* | *Contame qué pasó.* |

What it needed from the engine: a `pret` feature tag (`rules.ts`), `tense: 'pret'` in `FormFeatures`, two grammar concepts (`verbo.preterito`, `verbo.preterito.vos`), the admin's tense picker, and a linter rule that rejects the compound past (`compoundPast` in `course-rules/check.ts`).

## Section 5 · A2.2 · "When I was a kid" · units 41–50

The imperfect, and the difference between the two pasts: what *was going on* and what *happened*.

- *Cuando era chico* — imperfect of *ser, estar, tener, ir* (*era, estaba, tenía, iba*).
- *Siempre jugábamos* — regular imperfect, habits in the past; *antes* vs *ahora*.
- *Estaba lloviendo cuando…* — imperfect sets the scene, preterite interrupts.
- At the restaurant — *la carta, pedir, ¿me traés…?*, *la propina*; *pedí, pidió*.
- Arrange to meet — *¿a qué hora nos encontramos?*, *quedar en*, *llegar tarde*.
- Traditions — *Navidad* in summer, *el asado del domingo*, *los ñoquis del 29*.
- Feelings in the past — *me enojé, me puse contento* (*ponerse*).
- The future with *ir a* consolidated, and *voy a tener que*.
- Houses and moving — *mudarse*, *me mudé*, *el barrio nuevo*.
- Checkpoint — *¿Te acordás cuando…?* (*acordarse*).

## Section 6 · A2.3 · "Plans and favours" · units 51–60

- The simple future, recognised more than produced (porteños say *voy a*).
- Asking favours — *¿me hacés un favor?*, *¿me pasás la sal?*, *¿podrías…?*
- *Tener que, hay que, conviene* — obligation.
- The doctor, second visit — symptoms, *receta*, *obra social*.
- Shopping for groceries — *un kilo de*, *medio kilo*, *la feria*.
- Technology — *el celu*, *se me cortó*, *mandame la ubicación*.
- Direct + indirect together — *te lo mando*, *se lo digo*.
- Work — *entrevista*, *sueldo*, *renunciar*.
- Relationships — *salir con alguien*, *pelearse*, *extrañar*.
- Checkpoint.

## Section 7 · B1.1 · "Wishes and advice" · units 61–70

`section-7.yaml`. The subjunctive, taught in the order it is needed rather than as a paradigm: *quiero que vengas* → the daily wishes (*que te vaya bien, que la pases lindo, ojalá*) → *cuando* about the future (*avisame cuando llegues*) → opinion (*no creo que venga, ¿qué te parece?*) → the negative commands that are nothing but subjunctive (*no te preocupes, no te hagas problema*) → advice (*te recomiendo que pruebes*) → reactions (*¡qué bueno que estés acá!*) → knowing and understanding (*sé, sabés, ni idea*) → a unit of lunfardo proper (*morfar, guita, fiaca, bancar*) → the checkpoint, the long porteño goodbye.

Vos in the subjunctive: the course teaches *que vengas*, the everyday form, tagged `vos`; *vengás* is emphatic and left out.

## Section 8 · B1.2

The conditional for advice and hypotheticals (*yo que vos iría*, *si tuviera plata…*), the imperfect subjunctive only where the conditional drags it in, the news and politics without the politics, work and money, and the city itself — neighbourhoods, *la General Paz*, *el conurbano*. Written in detail once section 7 is published.

## Section 10 · B2.1 · "Making your case" · units 109–121

`section-10.yaml`. The past subjunctive stops being a fixed phrase and follows the sentence: *quería que vinieras* → *aunque llueva* → *llevo dos años viviendo acá* → practice → *pasen, siéntense* (ustedes commands, hosting) → *como si nada*, *se hace el vivo* → *el que quieras*, *donde* → practice → *si hubiera sabido, te hubiera avisado* (hubiera in both halves, the porteño way) → *por un lado… por otro lado*, *en cambio*, *de hecho* → the paperwork (*sacar turno*, *DNI*, *vencido*) → practice → the checkpoint, arguing it out (*¿y vos qué opinás?*, *me convenciste*, *¡ojo!*).

## Section 11 · B2.2 · "Between the lines" · units 122–134

`section-11.yaml`. Saying what you mean without saying it outright: *busco un depto que tenga balcón* (the subjunctive for what you haven't found) → *me da bronca que no avise* → *deberías, estaría bueno, habría que* → practice → *dijo que vendría* (a promise reported) → *a menos que, siempre y cuando, por si* → *se alquila, se vende, prohibido* → practice → prices in an inflationary city (*todo aumenta, ¿cuánto te cobraron?*) → *voy entendiendo, estoy por* → *me cae bien, nos llevamos bien* → practice → the checkpoint, porteño irony (*ni ahí, tal cual, es cualquiera, flasheaste*).

## Section 12 · C1.1 · "In other words" · units 135–147

`section-12.yaml`. Passing on what other people said and asked: *me pidió que le trajera algo* (a request told later takes the past subjunctive) → *me preguntó si venía*, *a ver si* → *usted*, for the older stranger and the building's owner (*disculpe, pase, quisiera*) → practice → the work email (*estimado, te adjunto, cualquier cosa, avisame*) → *resulta que, encima, total*, *me enteré* → the porteño *la* (*se la cree, me la banco, me las arreglo*) → practice → *acabo de, suelo, volví a* → *ya no, cada vez más*, how the barrio changed → *estoy podrido, no doy más* → practice → the checkpoint, the story told short (*te la hago corta, la cuestión es que, y nada, al toque*).

## Section 13 · C1.2 · "The news and the street" · units 148–160

`section-13.yaml`. Public life, told the way porteños tell it: *hoy hay paro*, *piquete*, *la calle está cortada* → the passive of the news (*fue construido, fueron detenidos*) → voting without the politics → practice → *según el diario, al parecer, supuestamente* → *me robaron el celu*, the *denuncia* → the building (*expensas, encargado, se rompió el calefón*) → practice → *¿de qué cuadro sos?* → the tango (*Gardel cada día canta mejor*) → the parrilla (*choripán, vacío, jugoso*) → practice → the checkpoint, weighing up the city (*lo bueno, lo malo, no hay nada como*).

## Section 14 · C1.3 · "Shades of meaning" · units 161–173

`section-14.yaml`. *No es que no quiera, es que no puedo* → the mixed conditional (*si hubiera ahorrado, ahora tendría*) → regret (*tendría que haber ido, me arrepiento*) → practice → the diminutive that softens (*un ratito, un cafecito, cerquita*) → *lo que pasa es que, lo de siempre* → the sayings (*más vale tarde que nunca, el que avisa no traiciona*) → practice → more lunfardo (*chabón, mina, groso, trucho, bardo*) → *me hizo reír, me hace acordar* → *cuanto más… mejor, cuanto antes* → practice → the checkpoint, the hard thing said kindly (*no te lo tomes a mal, entre nos, sin querer*).

The present perfect is still left out: the course never produces *he comido*, and `compoundPast` would reject it. *Tendría que haber* + participle is the regret porteños actually say.

## Section 15 · C1.4 · "Like a local" · units 174–186

`section-15.yaml`. The last section: the deadline (*entregar el proyecto, plazo, atrasados*) → asking for a raise (*plantear, merezco*) → the feelings porteños have words for (*me cayó la ficha, me da cosa, me quedé con las ganas*) → practice → the country beyond the city (*recorrimos la Patagonia*) → the mate round (*¿quién ceba?*) → the grandparents who came by boat → practice → teasing (*¿me estás cargando?, en joda*) → weddings and births (*se casó, nació*) → *me emocioné, orgulloso* → practice → the checkpoint: *¡lo lograste! Ya sos de acá.*

## Practice (2026-09-24)

A review of the course found it thinning out as it got harder: by sections 7–9 a unit had 4 lessons and a word met 4 sentences in the whole course, and a tense taught in one section (the imperfect, the future, the conditional) all but disappeared in the next. Three changes, for sections 4–9:

1. **More sentences per word.** `npm run course:promote -- <slug>` publishes what the judge passed but `publish` left out, re-checked against today's lexicon, until every word has 8 (`--per-word`).
2. **Practice lessons.** Every unit has two (`practice: 2` under `section:`), between its teaching lessons and its check: the unit's sentences taken to the gap and the tiles, each opening on a review of earlier units (lessons.mjs).
3. **Practice units.** Three per section, after units 3, 6 and 9 (13 units a section). A practice unit teaches no word: `review:` lists earlier forms — the three units before it plus older tenses, about a third — and the pipeline writes, judges and publishes sentences for them like any unit (`units.review_form_ids`). Four practice lessons, the first two opening on its tips, and a check over the section so far.

Every new section keeps all three.

## Grammar, recycling and typing (2026-09-24, second review)

A second review found three more gaps: the hardest grammar got the fewest lessons (*si tuviera… viajaría* had 4, the clothes unit 16), half the words of sections 5–9 were never drilled again after their unit, and practice only asked for recognition and tiles. Four changes:

1. **Grammar practice lessons.** `docs/course/grammar-practice.yaml` gives 44 grammar units one or two *Grammar practice* lessons (after teaching, before practice) that drill the unit's tense or pattern in sentences from it and from earlier units with the same tense and mood (`focus` adds more, e.g. the preterite next to the imperfect). Sections 1–3 also get a practice lesson per teaching unit. Seeded by `npm run course:grammar -- <migration.sql>` (migration 20260924000024).
2. **Pattern tips.** The first grammar lesson opens on the whole pattern as a table (Markdown pipe rows; `TipCard` renders them).
3. **Recycling.** `course:lessons` now plans the whole course in order (`lib/course-plan.mjs`): each word is owed a comeback 1, 3, 6, 12 and 24 units after it was last drilled, practice lessons spend four screens on earlier sentences carrying the most owed words, and every choice between sentences prefers them. Words never drilled after their unit fell from about half to under 15% in sections 5–8.
4. **Typing.** From unit 4, practice and grammar lessons pin typed gaps (`sentence_gap_typed`) on sentences she has met; tiles for a sentence never come right after its gap.

`npm run course:lessons -- --all` rebuilds every unit; it prints the recycling figures by section. Listening waits for audio (`course:tts`), which is recorded only for units 1–6.

## Status

| Section | Outline | Seeded | Sentences |
|---|---|---|---|
| 4 | ✓ | ✓ 20260924000001 | ✓ published, glossed (708) |
| 5 | ✓ | ✓ 20260924000002 | ✓ published, glossed (441) |
| 6 | ✓ | ✓ 20260924000003 | ✓ published, glossed (570) |
| 7 | ✓ | ✓ 20260924000004 | ✓ published, glossed (385) |
| 8 | ✓ | ✓ 20260924000005 | ✓ published, glossed (364) |
| 9 | ✓ | ✓ 20260924000010 | ✓ published, glossed (384) |
| 10 | ✓ | ✓ 20260924000025 | ✓ published, glossed (1,246) |
| 11 | ✓ | ✓ 20260924000027 | ✓ published, glossed (1,003) |
| 12 | ✓ | ✓ 20260924000029 | ✓ published, glossed (995) |
| 13 | ✓ | ✓ 20260924000029 | ✓ published, glossed (949) |
| 14 | ✓ | ✓ 20260924000029 | ✓ published, glossed (863) |
| 15 | ✓ | ✓ 20260924000029 | ✓ published, glossed (946) |
