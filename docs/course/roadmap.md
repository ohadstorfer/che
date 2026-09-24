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

## Status

| Section | Outline | Seeded | Sentences |
|---|---|---|---|
| 4 | ✓ | ✓ 20260924000001 | ✓ published, glossed (708) |
| 5 | ✓ | ✓ 20260924000002 | ✓ published, glossed (441) |
| 6 | ✓ | ✓ 20260924000003 | ✓ published, glossed (570) |
| 7 | ✓ | ✓ 20260924000004 | ✓ published, glossed (385) |
| 8 | ✓ | ✓ 20260924000005 | ✓ published, glossed (364) |
| 9 | ✓ | ✓ 20260924000010 | ✓ published, glossed (384) |
