# Proposed course map — 2026-10-03

This is a proposal. Nothing is changed yet.
It covers the four approved changes: honest levels (D1), basics earlier (D2), one practice unit per block (D4), new early units (C2).
The full data, with the final order of all 352 units, is in `out4/course-map.json` (session scratchpad).

## The idea in five lines

- The course still has **15 sections**. It now ends at **B2**, not C1.
- A2 gets a fourth section (**A2.4**), because many basic units move into A2.
- The old C1 sections (12–15) lose their basic units and shrink from four sections to three.
- **35 units move**, all of them **earlier**. No unit moves later. No slug changes.
- **36 practice units go**, **7 new units** come in. 381 units → 352.

## 1. Sections: before → after

Old titles are kept. Only one title is new ("Real life"). From section 7 on, each old section slides down one number.

| # | Before | Units | After | Units | What is inside now |
|---|---|---|---|---|---|
| 1 | A1.1 First words | 23 | **A1.1** First words | 24 | Old section 1 + prices (cuanto-sale) |
| 2 | A1.2 Everyday things | 23 | **A1.2** Everyday things | 23 | Old section 2, no change |
| 3 | A1.3 Out and about | 23 | **A1.3** Out and about | 26 | Old section 3 + 5 new units (hotel, bondi, taxi, help, paying) + numbers/WhatsApp |
| 4 | A2.1 What happened | 26 | **A2.1** What happened | 23 | Last 2 units of old 3 (el-cumple, ahora-y-planes) + old section 4 |
| 5 | A2.2 When I was a kid | 26 | **A2.2** When I was a kid | 22 | Stories, childhood, **football**, eating out, **parrilla**, meeting up, holidays |
| 6 | A2.3 Plans and favours | 26 | **A2.3** Plans and favours | 22 | Feelings, plans, **travel in Argentina**, moving, favours, **-ito**, **hosting (ustedes)**, errands |
| 7 | B1.1 Wishes and advice | 26 | **A2.4** Real life *(new title)* | 24 | Phone, **theft**, lending, jobs, love, **liking people**, **family news**, the doctor, thanks, **mate** |
| 8 | B1.2 If I were you | 26 | **B1.1** Wishes and advice | 23 | Old section 7, no change |
| 9 | B1.3 Stories and opinions | 26 | **B1.2** If I were you | 25 | Old section 8 + **polite asking** (usted, doña Rosa) |
| 10 | B2.1 Making your case | 26 | **B1.3** Stories and opinions | 23 | Old section 9 + **plumber/expensas** + **acabar de/soler**; football left |
| 11 | B2.2 Between the lines | 26 | **B2.1** Making your case | 23 | Gossip pair from old 9 + old section 10 |
| 12 | C1.1 In other words | 26 | **B2.2** Between the lines | 26 | Old section 11 + one street-talk block: irony, **slang**, **swearing (new)**, **teasing** |
| 13 | C1.2 The news and the street | 26 | **B2.3** In other words | 23 | Old section 12 + the **office** units |
| 14 | C1.3 Shades of meaning | 26 | **B2.4** The news and the street | 22 | What is left of old 13 + "no es que" and regrets from old 14 |
| 15 | C1.4 Like a local | 26 | **B2.5** Like a local | 23 | Rest of old 14 (sayings, laughing, tact) + rest of old 15 (feelings, roots, goodbye) |

Notes:
- Sizes are 22 to 26. Three sections have 22. I did not move more units just to reach 23.
- Why B2.1–B2.5 and no C1: sections 13 and 15 teach no new grammar, 12 mostly repeats B1–B2, and only a few units of 14 are harder. B2 is the honest ceiling.
- If five B2 steps look odd in the app, an option is to call the last two "B2+". I would not call any of them C1.

## 2. What moves

"Sentences to fix" = sentences in the unit that use a word taught later than the new place.
Example: 5/48 means 5 of 48 sentences must be dropped or swapped.
**lighter** = more than 15% break, so the unit needs new, simpler sentences. **check** = look before doing.
`*` = not on your list; I added it. You can strike these.
The numbers come from a word-by-word check of every sentence. `npm run course:reorder` must confirm them.

| Unit | From → to | Why | Sentences to fix |
|---|---|---|---|
| cuanto-sale | 3.12 → 1 (A1.1), after en-el-kiosco | Asking a price is day-one survival; it was unit 58. | 93/128 — **lighter** (full rewrite: section 1 has no el, en, con) |
| el-partido | 9.9 → 5 (A2.2), after practica-en-esa-epoca | Football talk is everyday small talk; plain past tense only. | 5/87 |
| la-final | 9.10 → 5 (A2.2), after el-partido | Stays with el-partido. | 6/60 |
| de-que-cuadro-sos | 13.17 → 5 (A2.2), after la-final | "¿De qué cuadro sos?" is a first-week question. | 5/46 |
| socio-del-club | 13.18 → 5 (A2.2), after de-que-cuadro-sos | Stays with de-que-cuadro-sos. | 10/71 |
| la-parrilla | 13.21 → 5 (A2.2), after una-grande-de-muzza | Every visitor eats at a parrilla in week one. | 6/57 (teach "chorizo" here) |
| la-parrillada | 13.22 → 5 (A2.2), after la-parrilla | Stays with la-parrilla. | 15/49 — **lighter** |
| recorrer-el-pais | 15.9 → 6 (A2.3), after voy-a-tener-que | Travellers plan Patagonia and Iguazú at A2. | 10/33 — **lighter** |
| acampamos-en-el-sur | 15.10 → 6 (A2.3), after recorrer-el-pais | Stays with recorrer-el-pais. | 11/77 |
| un-ratito | 14.9 → 6 (A2.3), after me-das-una-mano | -ito is everywhere; it softens the favours just taught. | 6/46 |
| hace-fresquito | 14.10 → 6 (A2.3), after un-ratito | Stays with un-ratito. | 8/76 |
| pasen-pasen | 10.9 → 6 (A2.3), after hace-fresquito | Talking to two or more people is an A2 need. | 4/86 |
| a-la-mesa | 10.10 → 6 (A2.3), after pasen-pasen | Stays with pasen-pasen. | 12/57 — **lighter** |
| me-robaron | 13.11 → 7 (A2.4), after no-tengo-senal | Phone theft is the likeliest emergency. | 5/48 |
| me-afanaron | 13.12 → 7 (A2.4), after me-robaron | Stays with me-robaron; blocking your card belongs here. | 8/66 |
| me-cae-bien * | 11.21 → 7 (A2.4), after estamos-de-novios | Liking people (caer bien) is A2. | 1/47 |
| no-lo-aguanto * | 11.22 → 7 (A2.4), after me-cae-bien | Stays with me-cae-bien. | 9/75 |
| se-caso | 15.19 → 7 (A2.4), after no-lo-aguanto | Married, pregnant, born: basic family news. | 2/42 |
| se-recibio | 15.20 → 7 (A2.4), after se-caso | Stays with se-caso: died, retired, graduated. | 7/58 |
| quien-ceba | 15.11 → 7 (A2.4), after te-debo-una | Mate is the main social ritual; it now closes A2. | 6/41 |
| te-convido-un-mate | 15.12 → 7 (A2.4), after quien-ceba | Stays with quien-ceba. | 7/66 |
| usted | 12.5 → 9 (B1.2), after preferiria | Polite asking; joins the polite "would" units. | 5/40 |
| como-no-dona-rosa | 12.6 → 9 (B1.2), after usted | Stays with usted. | 9/74 |
| el-consorcio | 13.13 → 10 (B1.3), after el-tecnico | Plumber and expensas; joins the repairs units. | 5/45 |
| se-tapo-la-pileta | 13.14 → 10 (B1.3), after el-consorcio | Stays with el-consorcio. | 12/46 — **lighter** |
| acabo-de | 12.17 → 10 (B1.3), after se-aplaude-al-asador | Acabar de and soler are simple; fit next to customs. | 2/59 |
| deje-de-fumar | 12.18 → 10 (B1.3), after acabo-de | Stays with acabo-de. | 6/64 (teach "fumar" here) — **check** |
| ese-chabon * | 14.17 → 12 (B2.2), after ni-ahi | Chabón, mina, birra are first-week slang. | 3/61 |
| estoy-al-horno * | 14.18 → 12 (B2.2), after ese-chabon | Stays with ese-chabon. | 0/55 |
| me-estas-cargando * | 15.17 → 12 (B2.2), after estoy-al-horno | Joking and teasing; joins irony and slang. | 0/35 |
| caiste * | 15.18 → 12 (B2.2), after me-estas-cargando | Stays with me-estas-cargando. | 0/42 |
| la-entrega * | 15.1 → 13 (B2.3), after te-reenvio-el-archivo | Office words go with the work emails. | 0/45 |
| sobre-la-hora * | 15.2 → 13 (B2.3), after la-entrega | Stays with la-entrega. | 4/63 |
| merezco-un-aumento * | 15.3 → 13 (B2.3), after sobre-la-hora | Stays with the office block. | 2/68 |
| se-merece-el-ascenso * | 15.4 → 13 (B2.3), after merezco-un-aumento | Stays with the office block. | 2/65 |

Things to know about these moves:
- **cuanto-sale** is the costly one. Section 1 has no "el", "en" or "con", and numbers stop at 20. The new sentences must be short: "¿Cuánto sale?", "Son tres mil", "¿Efectivo o tarjeta?". Cheaper fallback: put it in section 2 after que-quieren-tomar (about half the sentences survive), but then prices wait until unit 40.
- **a-la-mesa** has "no se olviden" (a "no" command to a group) before "no" commands to one person are taught (now B1.1). It works as fixed phrases, but look at it.
- **deje-de-fumar** teaches "dejé de" and "volví a". llevo-dos-anos (old 10.5) teaches the same later. After the move, llevo-dos-anos should treat them as review.
- **Mate** lands at the end of A2, not in the middle. Closer to the start, too many sentences break.
- **Plumber/expensas** lands in B1.3, not A2. In A2 half the sentences break (they need "arreglar" and "no anda").
- Two small words cause many of the breaks: "uy" and "queda" (¿dónde queda?). If they are taught early, about 15 fixes go away.
- Some units only change section because the borders moved (for example el-cumple opens A2.1 now). Their order is the same. The list is in the JSON under `boundary_shifts`.

Phrases that move without their unit (fold-ins):
- **encantado (1.9)** gets the survival phrases: ¿Cómo se dice…?, ¿Qué significa…?, ¿Me repetís?, No entendí, Más despacio, Hablo un poco de castellano. This replaces the planned new "survival phrases" unit.
- **sos-turista (1.6)** gets disculpá and permiso. It already teaches perdón.

## 3. Practice units that go

Rule: sections 1–3 keep their 9 practice units (they already have one per block).
In old sections 4–15, each back-to-back pair loses its **first** unit and keeps the **second**.
Reason: in all 36 pairs the second unit uses more of the block's words (it also covers the second unit of each lesson pair).
36 go, 45 stay.

| Old section | Go (retired) | Stay |
|---|---|---|
| 4 | practica-que-hiciste, practica-el-finde, practica-el-viaje | practica-como-estuvo, practica-quien-vino, practica-las-vacaciones |
| 5 | practica-de-chico, practica-la-juntada, practica-me-mude | practica-en-esa-epoca, practica-la-sobremesa, practica-antes-y-ahora |
| 6 | practica-los-mandados, practica-el-laburo, practica-capaz | practica-la-feria, practica-te-lo-presto, practica-a-lo-mejor |
| 7 | practica-ojala, practica-te-recomiendo, practica-que-bueno | practica-cuando-vuelvas, practica-te-aconsejo, practica-es-un-afano |
| 8 | practica-yo-que-vos, practica-la-guita, practica-quien-dijo | practica-si-ganara, practica-a-medias, practica-me-dijo |
| 9 | practica-se-me-olvido, practica-depende, practica-que-susto | practica-nunca-habia, practica-tenes-razon, practica-un-aplauso |
| 10 | practica-llevo-un-rato, practica-como-si, practica-el-tramite | practica-aunque-sea, practica-a-la-mesa, practica-migraciones |
| 11 | practica-me-da-igual, practica-se-alquila, practica-me-cae-bien | practica-alguien-que-sepa, practica-se-aceptan-tarjetas, practica-no-lo-aguanto |
| 12 | practica-me-pidio, practica-resulta-que, practica-no-doy-mas | practica-como-no, practica-me-la-jugue, practica-me-pudri |
| 13 | practica-hay-paro, practica-me-robaron, practica-la-parrilla | practica-el-cuarto-oscuro, practica-me-afanaron, practica-la-parrillada |
| 14 | practica-no-es-que, practica-lo-que-pasa, practica-cuanto-mas | practica-me-hubiera-gustado, practica-cada-loco-con-su-tema, practica-me-mori-de-risa |
| 15 | practica-la-entrega, practica-quien-ceba, practica-me-emocione | practica-me-hace-ruido, practica-se-instalaron, practica-se-emociono |

Notes:
- The practice units that stay do not move. Some now review units that sit much earlier (for example practica-la-parrillada in B2.4 reviews football and the parrilla from A2.2). They are still sayable. They work as late review.
- Small clean-ups in units that stay: practica-cuando-vuelvas shows the same phrase as unit 7.2 ("Necesito que me ayudes"). Four have a wrong "new word" tag: practica-antes-y-ahora (casa), practica-te-aconsejo (llena), practica-se-aceptan-tarjetas (trabajo), practica-como-no (me siento).
- Some blocks are now long before their practice unit (9–10 lessons in A1.3, A2.3, A2.4). That is fine for now.

## 4. New units (to be written later)

| Working slug | Title | Where | Key words |
|---|---|---|---|
| tengo-una-reserva | Check in at a hotel or hostel | 3 (A1.3), after a-que-hora-abre | tengo una reserva, a nombre de, habitación, hostel, check-in, check-out, desayuno incluido, toalla, pasaporte, wifi |
| tomar-el-bondi | Take the bondi and the subte | 3 (A1.3), after segui-derecho | SUBE, cargar la SUBE, saldo, ¿este va a…?, me bajo, la próxima, combinación, boleto, ¿me avisás? |
| en-taxi | Take a taxi, remis or app car | 3 (A1.3), after tomar-el-bondi | remis, Uber, pedir un auto, ¿me llevás a…?, ¿cuánto sale hasta…?, dejame acá, en la esquina está bien |
| ayuda | Get help in an emergency | 3 (A1.3), after en-taxi | ¡ayuda!, emergencia, ambulancia, llamá a la policía, me perdí, estoy perdido, necesito un médico, me robaron |
| debito-o-credito | Pay the way locals do | 3 (A1.3), after me-cobras | débito, crédito, transferencia, alias, QR, cuotas, Mercado Pago, cambiar dólares, ¿a cuánto está?, lucas |
| pasame-tu-numero | Swap numbers and WhatsApp | 3 (A1.3), after me-interesa | teléfono, WhatsApp, ¿me pasás tu número?, agendame, te escribo, mandame un mensaje, Instagram, te sigo |
| puteadas | Understand the swearing | 12 (B2.2), after estoy-al-horno | pelotudo, boludez, qué cagada, la puta madre, mierda, carajo, forro, no rompas, hinchapelotas |

- The eighth idea (survival phrases) is not a unit. It is folded into encantado (1.9).
- These units take some words from later units (words may move earlier): SUBE (el-celu), saldo and transferencia (el-cajero), alias and QR (pasame-el-alias), cuotas and dólares (en-cuotas), débito and crédito (a-medias), pasaporte (el-tramite), wifi (no-tengo-senal), boleto (no-me-alcanza). Those later units get a little thinner. el-cajero and pasame-el-alias lose the most.
- "Understand the swearing" sits in B2.2 so that irony, slang, swearing and teasing make one block. It is "recognise first".

## 5. Overloaded A1 units — yes or no

- Split ropa-y-colores (42 words): **no, not now.** No move touches it.
- Split ahora-y-planes (35): **no, not now.** It only changes label (it now opens A2.1). Not worse.
- Split la-hora (34): **no, not now.** But note: prices now come *before* numbers 21–100. cuanto-sale must use 0–20, the hundreds and "mil". When la-hora is split one day, send 21–100 to section 1.
- Split queres-podes-vas (34): **no, not now.** The bondi and taxi units need "va" and "voy" from it, so they come after it.

Where this proposal makes size worse:
- cuanto-sale brings 32 word forms into A1.1, right after the 27 number words of cuantos-anos-tenes.
- encantado grows from 14 to about 20 word forms.
- A1.3 grows from 23 to 26 units and already holds three of the four heavy units.

## 6. What I did not change, and why

- **no-se / que-significa stay in B1.1.** Their sentences use the subjunctive and the past. Only the phrases go to A1.
- **usted does not go to A1.** It uses "disculpá que te moleste" and "¿tendrás…?". Only the words disculpá and permiso go to A1; the unit goes to B1.2.
- **me-cobras stays.** 41% of its sentences use clothes words taught just before it. The new paying unit follows it.
- **The guessing future (donde-estara, quien-sera) stays in A2.** Reviewers want it later. A move later is risky: units in between use estará, será, capaz. Needs a check first.
- **si-tuviera / si-ganara stay.** Same reason (a later move).
- **Other simple units stay in B2:** hay-paro, deberias, lo-que-pasa-es-que, me-hizo-reir, el-tango, voy-entendiendo, me-gustaria. All are cheap to move. I kept the list short. Good for a second round.
- **Repeats are not merged** (reported speech six times, opinions four times, advice three times). That is rewriting, not ordering.
- **Niche blocks are not cut** (voting booth, passive headlines, immigrant family, 12 proverbs, second driving unit). Content decision.
- **No new grammar units** (por/para, mío/tuyo, nuestro, hace = ago, dámelo) and no extra topic units (night out, renting, food allergies). Not on the approved list.
- **No checkpoints** and no extra practice in sections 1–3.
- **No slug changes.** "usted" and "practica-se-me-olvido" keep their odd slugs (the second one is retired anyway).

## 7. Final count

| | |
|---|---|
| Units before | 381 (300 lessons + 81 practice) |
| Practice units retired | 36 |
| New units | 7 (+ 2 fold-ins into existing A1 units) |
| Units after | **352** (307 lessons + 45 practice) |
| Units that move | **35**, all earlier (25 from your list, 10 extra marked `*`) |
| Moves needing lighter sentences | **5**: cuanto-sale, la-parrillada, recorrer-el-pais, a-la-mesa, se-tapo-la-pileta |
| Moves to check first | 1: deje-de-fumar |
| Other moves | 29, each with 0 to 11 sentences to drop or swap (about 140 sentences in total) |
| Sections | 15, sizes 22–26, labels A1.1 → B2.5 |
