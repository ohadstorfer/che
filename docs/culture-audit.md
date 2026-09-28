# Culture classes — content audit

> **Status (2026-09-27): fixed.**
> - **Findings:** every finding below was addressed in the YAML, then 4 fresh reviewers checked the rewrites and fixed 39 more exercise problems they introduced.
> - **Structure:** there are now 88 classes. Two are new: `comida/helado` and `historia-nacimiento/los-barcos`. Tango `la-milonga`, Fútbol `hablar-de-futbol` / `la-tabla-y-el-descenso`, and Alfajores `dulce-de-leche` moved earlier in their sections.
> - **Validator:** `culture:validate` now warns about vocab missing from the pages and about colliding glosses, and every file shows 0 warnings.
> - **Balance:** true/false is now 61 true / 55 false. 16% of info pages have a year (down from 41%).
> - **Still open:** new facts and new Spanish are listed at the end of `docs/culture-review.md` for a native speaker.
> - **Keep reading below as a record:** page numbers refer to the old version.


*2026-09-27 · all 16 sections, 86 classes in `docs/culture/*.yaml`*

**What this checks:** broken or ambiguous exercises, testing before teaching, flow and pacing, repetition, tone, and whether each page is actually interesting.
**What it doesn't check:** facts (already done in `docs/culture-review.md`) and Spanish grammar or naturalness.
**Judged against:** a beginner or tourist who reads English and knows little Spanish.

**How to read it:** start with **Part 1**, the 10 patterns behind most of the issues. Fixing each pattern once, at the source, clears dozens of findings. **Part 2** lists every High finding. **Part 4** has the detail, section by section and class by class, with a concrete fix for every finding.

**Severity:**
- 🔴 **High** — the learner gets it wrong through no fault of their own, or is misled.
- 🟠 **Medium** — a clearly worse experience.
- ⚪ **Low** — polish.

**Page numbers** count from 1 within each class, in the order written in the YAML.

**How a class plays in the app** (this shapes several findings):
1. Info bodies are split into tap-through cards of 1–2 sentences, and a `fun_fact` gets its own card.
2. After answering a question, the learner sees the `explain` (and, on gap pages, the `translation`).
3. At the end, the app shows the vocabulary list, then auto-builds match pairs and "pick the meaning" questions. The wrong options in those are the *other vocab glosses of the same class*.

---

## The short version

The content is **good**. The voice is warm and funny, and the best pages hand a tourist real insider knowledge:
- "gracias" means I'm out of the mate ronda, and "¡No es un micrófono!"
- The bill never comes unless you ask for it.
- "Nada, vení" really means bring something.
- The telo trap in vesre.
- The cabeceo at a milonga.
- The motochorro and your phone on the café table.
- The dólar blue and cara chica bills.

**Strongest sections:** Mate, Cómo hablamos, Costumbres, Puteadas, Las provincias, and the "Money today" class.

**Weakest material:** Buenos Aires's `barrios` and `iconos-de-la-ciudad`, Íconos (`escritores`, `inventos-y-nobeles`), Música's `rock-nacional` and `trap-y-rkt`, and the club-nickname pages in Fútbol. They read like Wikipedia: dates, names, attendance figures and founding years, then an exercise that asks you to recall them.

The problems are **not** random. Most come from 10 habits in how the content was written (Part 1). Two of them can be caught automatically by the validator.

---

## Part 1 — The 10 patterns

### 1. Vocabulary the class never uses (81 words in 41 of 86 classes)
The final word review quizzes words that no page ever showed in Spanish. The page says "cobblestones" or "World Cup" in English, but the vocab item is **adoquines** or **Mundial**. The learner meets the word for the first time in the word list, one screen before being tested on it. The worst classes:

| Class | Words the pages never use |
|---|---|
| `iconos/mafalda` | historieta, tira, chusma, nene/nena, la esquina (5 of 7) |
| `iconos/iconos-de-hoy` | ídolo, crack, hincha, socio, peli (5 of 8) |
| `iconos/escritores` | escritor, libro, novela, cuento, tortuga, leer |
| `musica/rock-nacional` | banda, tema, temazo, disco (4 of 7) |
| `tango/gardel` | cantor, ídolo, barrio |

**Fix at the source:** add a validator warning for any vocab `es` that doesn't appear in the class's pages, after stripping articles and accents (Appendix A has the current list). Then either **bold the word where the English already appears** ("the **adoquines** (cobblestones)"), which is usually a 3-word edit, or drop it. Also cut generic filler words with no cultural load (libro, leer, banda, tren, artista, final, trap, tango).

### 2. Near-identical glosses break the auto-generated quiz (25+ pairs)
"Pick the meaning" uses the other glosses of the same class as the wrong options. When two glosses mean the same thing, **there are two right answers**, and the learner is marked wrong either way. Worst cases:

| Class | Collision |
|---|---|
| `puteadas/gil-forro-chanta` | hinchapelotas = rompebolas = "pain in the neck, pest" (word for word) |
| `comida/herencia-italiana` | ñoqui ("payroll slacker") vs ñoquis ("gnocchi"), so "gnocchi" is a literally correct wrong answer |
| `buenos-aires/moverse`, `iconos/inventos-y-nobeles` | colectivo "city bus" vs bondi "bus (slang)" |
| `costumbres/sin-filtro` | ¿Cuánto pagaste? vs ¿Cuánto te salió? |
| `futbol/la-tabla-y-el-descenso` | descenso "relegation" vs irse a la B "to get relegated" |
| `tango/las-letras` | mina "woman" vs percanta "woman (old tangos)" |
| `tango/nacido-en-el-arrabal` | bandoneón vs fueye (both glossed "bandoneón") |
| `regiones/cordoba` | tonada vs cantito ("sing-song") |
| `iconos/mafalda` | historieta vs tira ("comic strip") |
| `iconos/iconos-de-hoy` | capo / crack / ídolo |
| `historia-moderna/malvinas` | veterano vs ex combatiente |
| `habla/*` | re vs recontra; guita vs mango; ni ahí vs nada que ver |

Glosses that contain the word itself also make the quiz free: "mate → mate (the drink…)", "tango → tango (…)", "boluda → the feminine of boludo", "triple → alfajor with three cookies".

**Fix at the source:** there are two options.
- *Content:* give every vocab item a gloss that is clearly different from the others in the same class, and move near-synonyms to `glossary`.
- *App:* when choosing wrong options for "pick the meaning", skip any gloss that shares a content word with the right answer. This is cheap, and it also protects future content.

### 3. The key fact lives only in the `explain`
Again and again, the most useful sentence in a class appears **only after answering a question**. Learners who get the question right often skim the explain. Some examples:
- arrive 15–30 minutes late to a dinner (`comida/horarios-y-mesa`)
- ñoqui as a political insult (`herencia-italiana`)
- "if you're sick, just say no, gracias" (`mate/la-ronda`)
- older "cara chica" $100 bills get a worse rate (`pensar-en-dolares`)
- how to pay on the colectivo (`inventos-y-nobeles`)
- men kiss too (`costumbres/el-beso`)
- **¡Ojo!**, **yeta**, **flaco**, **grieta**, **gorila**, **viveza criolla**, **mufa**, **gastada** — all vocab items that are defined only in an explain

**Rule to add to the spec:** an `explain` may *confirm or nuance* something taught on an earlier page. It never introduces a new fact the class relies on.

### 4. Questions about things never taught
These go beyond vocabulary: whole questions test content no page taught.

| Class | Page | What it asks | What's missing |
|---|---|---|---|
| `futbol/de-que-cuadro-sos` | p3 | Match 5 club nicknames | None introduced |
| `futbol/el-diez` | p9 | 1986 final opponent | Never mentioned |
| `musica/rock-nacional` | p10 | Charly García's pool jump | Never mentioned |
| `iconos/mafalda` | p2 | "Created for an ad campaign" | Never mentioned, and the answer is *true*, so most learners fail it |
| `historia-nacimiento/unitarios-federales-y-gauchos` | p6 | Martín Fierro | Not taught |
| same class | p7 | Día de la Tradición | Not taught |
| same class | p2 | "caudillo" | Not taught |
| `san-martin-y-belgrano` | p5 | San Martín's tomb | Not taught |
| `puteadas/la-puta-madre` | p3 | Rank ¡Pucha! mildest | Euphemisms come 4 pages later |
| `costumbres/el-calendario` | p8 | Día de la Madre | Not taught |
| `habla/lunfardo` | p9 | Match 1953/1962/2000 | None of those years taught |
| `el-interior` | p8 | Order 6 provinces north to south | No geography given |

### 5. Gap and choice questions with two defensible answers
Multiple-choice only works if the wrong options are *clearly* wrong. Several aren't:

| Class | Question | Also defensible | Why |
|---|---|---|---|
| `alfajores/marcas-y-kioscos` | ¿Me ___ dos alfajores? | "da" | usted form |
| `asado/el-fuego` | ¿Te ___ en algo? | "ayudamos" | also an offer of help |
| `regiones/el-interior` | se fue a vivir al ___ | "campo" | |
| `musica/trap-y-rkt` | ¡Qué ___! | "tema" | |
| `habla/vesre-re-posta` | ¡Estuvo ___ bueno! | "tan" | |
| `regiones/cordoba` | un ___ con coca | "tinto" | |
| `regiones/noroeste` | le damos de ___ a la Pachamama | "beber" | |
| `iconos/inventos-y-nobeles` | ¿Me prestás una ___? | "lapicera fuente" | |
| `iconos/mafalda` | Manolito atiende el ___ | "kiosco" | |
| `buenos-aires/moverse` | ¿Me ___ en Plaza Italia? | "baja" | |
| `asado/asados-del-pais` | pollo al ___ | "horno de barro" | |
| `alfajores/que-es-un-alfajor` | simple vs triple | either | a matter of taste marked right or wrong |

**Rule:** a gap distractor must break the *meaning*, not just the grammar. "Ayudo / cobro / pego" beats "ayudo / ayudás / ayudamos". Beginners can't reason through conjugation drills anyway.

### 6. `order` pages whose order you can argue with
The spec already bans sort clues inside order items. The bigger problem is **sequences that aren't really sequences**:
- **Chocotorta:** mix the cream or dip the cookies first? Page 6 itself says cookies first.
- **Nochebuena:** the toast and the fireworks happen at the same moment, and turrón has no clear slot.
- **Mate prep:** bombilla before or after the water is a known split among cebadores, and the steps weren't taught.
- **Superclásico Sunday:** "suffer 90 minutes" vs "celebrate a golazo".
- **Milonga night:** cortina vs "say gracias".
- **muy < re < recontra:** the class itself teaches that re = muy.
- **Leaving a party**, and **boss vs girlfriend's grandma**.

Many other order pages are either **common sense** (bake → spread → top; dinner → pregame → club) or **date recall** (rock milestones 1967–1997, trap 2012–2024, May/July 1810–1816).

**Rule:** only use `order` when there is a real, taught, single sequence and getting it right teaches something. Otherwise use a scenario `choice`.

### 7. Answers that give themselves away
- **"False" is the safe guess.** 71 of 104 true/false answers are *false*, so always guessing false scores 68%. Absolute words give it away even more: "Everyone…", "Historians agree…", "always", "without reservations", "All Argentines…". Balance it toward about 50/50, and write false statements that sound plausible.
- **The right option is the long, careful one.** In 18 choice questions the correct option is by far the longest (Appendix C). Usually it's the only hedged, explained option next to two jokes.
- **Joke options.** "Film him for Instagram", "Give up and go home", "Report them to the police", "a fight about football" leave a one-option question. One joke per question is fine; two turns the question into a free tap.
- **The previous card's title is the answer.** "Borges, no Nobel" → "Did Borges win the Nobel?"; "Napolitana: not from Naples" → "Invented in Naples?"; "The surprise fan: Syria" → "Who buys the most yerba?"

### 8. Trivia instead of insight
You asked to be told plainly, so here it is: **151 of 367 info pages (41%) include at least one year**, and many also include names no tourist will remember or use. These include founding years of pizzerías and alfajor brands, the height of the Obelisco, the number of days it took to build, concert attendance figures, the minute of a goal, the exact date of Día del Amigo's founder's letters, researcher affiliations, WHO statistics, a dog-walker law, and "since 1936/1961/1977/2003…". The same trivia then gets tested by `match` and `order` pages built only to check recall.

The winning pattern is already in the content. The best pages answer **"what will I see, hear, or have to do because of this?"**:
- streets named Reconquista and Defensa
- railways that still force detours between provinces
- Roca on the 100-peso bill
- repulgue codes on empanadas
- "cada día canta mejor" and the cigarette in Gardel's statue's hand

**Rule of thumb for every info page:** at most one number, and it has to earn its place. Replace the rest with the practical angle: when to go, what to order, what to say, what not to do.

**Match pages** should pair *things with uses* ("Obelisco → where you celebrate a World Cup"), not *things with years*.

### 9. The same fact taught and tested too many times
- **Within one class:** one fact is often tested 3–5 times.
  - Mate `la-ronda`: "hand it back" + "gracias = done", five times in 10 pages
  - Asado `el-ritual`: the aplauso twice in a row
  - Manuelita three times
  - 17 de octubre three times
  - Fainá three times
  - "El fin del mundo" four times
  - The founding of Buenos Aires three times
- **Across sections** (not all learners take every section, so some overlap is fine, but these are re-*taught* as new rather than referenced):

| Topic | Taught in |
|---|---|
| **viveza criolla** | `dichos/filosofia-criolla`, `costumbres/sin-filtro`, `futbol/el-diez` (same gloss each time) |
| **dinner at ten / host in the shower** | `comida/horarios-y-mesa`, `costumbres/la-hora-argentina`, `costumbres/salir-de-noche`, `buenos-aires/vida-portena` |
| **porteño / el interior / Capital** | `buenos-aires/portenos`, `regiones/el-interior`, `historia-nacimiento/antes-de-buenos-aires`, `tango/nacido-en-el-arrabal` |
| **lunfardo, mina, conventillos** | `tango/las-letras`, `tango/nacido-en-el-arrabal`, `habla/lunfardo`, `historia-nacimiento/desierto-e-inmigrantes` |
| **hacer una vaquita** | `asado/sos-invitado`, `comida/horarios-y-mesa` (with different glosses) |
| **"hands off the asador"**, **aplauso → sobremesa**, **lamb on a cross** | two or three Asado classes each, the lamb under two different names |
| **River's 2011 relegation** | three Fútbol classes |
| **Sabato / Nunca Más**, **Argentina, 1985**, **desaparecido** | `iconos/*` and `historia-moderna/la-ultima-dictadura` |
| **trasnochar** | vocab in two classes, never used in either |

**Fix:** choose one home for each topic. Elsewhere, reference it in one line ("remember the vaquita?").

Also, some pages *assume* another section was done ("Remember the vivo and the gil?", "Same trap as with mate", "the puteadas section"). Sections can be taken in any order, so each page has to stand on its own.

### 10. Flow: walls, mashups, whiplash, and order
- **Walls of names:**
  - `futbol/mas-alla-de-buenos-aires` p4 has 13 names and nicknames in one card
  - `lunfardo` p3 has 8 slang words
  - `el-orden` pp2–4 has 13 food nouns in three screens
  - `la-puta-madre` p4 has 6 phrases
  - `barrios` p6 has 4 barrios
  - `moverse` p4 has the whole bus procedure in about 75 words
- **Mashup classes that should be split:**
  - `comida/guisos-y-helado` (stews → ice cream, no link)
  - `historia-nacimiento/desierto-e-inmigrantes` (genocide → pizza in one tap, with "genocidio" quizzed next to "birra")
  - `buenos-aires/vida-portena` (therapy → dogs → bookshop → thieves)
  - `futbol/mas-alla-de-buenos-aires` (the women's football pages aren't "beyond Buenos Aires")
- **Tone whiplash:**
  - Oesterheld's disappeared family → a Netflix casting question
  - Semana Trágica → the jaunty "rooftop madmen"
  - "biggest pogo in the world" → Cromañón's 194 deaths
  - Each needs a transition or a reorder.
- **Useful class buried last:** `tango/la-milonga` (the most practical Tango class) and `futbol/la-tabla-y-el-descenso` (basic words like tabla and empate) come after the history classes. Move them earlier.
- **Tourist-safety gap in Puteadas:** the section is honest and funny, but it never gives a **per-word verdict** ("understand it" vs "you can say it"). A tourist with an accent needs one line per word: *boludo — only once friends use it with you; pelotudo, forro, concha — never.* The `word.tag` field is a natural place for it.
- **Sensitivity:**
  - "turco" is taught as a vocab word (`mate/mate-en-el-barrio`)
  - Patoruzú is presented uncritically
  - "drowning in debts" appears next to a suicide (Favaloro)
  - All three are small edits.

---

## Part 2 — Fix these first (all 41 High findings)

- **`mate/cebar`** page 3 (order, "Prepare a mate, step by step") — "Wet the low side with a bit of warm water" and "Put in the bombilla on the wet side" were never taught. *(Teach-before-test / Exercise logic)*
- **`asado/el-fuego`** page 7 (gap, "¿Te ___ en algo?", options ayudo / ayudás / ayudamos) — "¿Te ayudamos en algo?" (can we help you?) is perfectly valid and also offers help. *(Exercise logic)*
- **`comida/herencia-italiana`** vocabulary "ñoqui" ("slacker on the public payroll") next to "ñoquis" ("gnocchi") — in "pick the meaning" for **ñoqui**, "gnocchi" appears as a distractor and is literally correct, since ñoqui is the singular of ñoquis. *(Teach-before-test (auto-quiz))*
- **`alfajores/que-es-un-alfajor`** page 7 (choice, "exactly enough coins for one alfajor … What do you ask for?" → triple) — this is a preference question, and "simple" is just as defensible (and with "exactly enough coins", arguably the only one you can afford). *(Exercise logic)*
- **`alfajores/marcas-y-kioscos`** page 9 (gap, "¿Me ___ dos alfajores?", options das / dais / da) — "¿Me **da** dos alfajores?" (usted) is correct, polite and common with an older kiosquero. *(Exercise logic)*
- **`alfajores/dulce-de-leche`** page 8 (order, "Make a chocotorta") — mixing the cream (step 1) and dipping the cookies (step 2) can happen in either order. *(Exercise logic)*
- **`futbol/de-que-cuadro-sos`** page 3 (match, "Match the club to its nickname") — none of the five nicknames (Xeneize, Millonario, Academia, Rojo, Ciclón) appears before this page. *(Teach-before-test)*
- **`futbol/el-diez`** page 9 (TF, "Argentina won the 1986 final against West Germany") — the 1986 final opponent is never mentioned, so this is a pure guess. *(Teach-before-test)*
- **`futbol/messi-y-qatar`**  — vocabulary "penal": the pages only say "penalties" in English. *(Teach-before-test)*
- **`futbol/mas-alla-de-buenos-aires`** page 4 (info, "Córdoba and La Plata") — a wall of names in one card: Belgrano, Piratas, Talleres, la T, Matadores, River 2011, Estudiantes, pinchas, pincharratas, Gimnasia, 1887, triperos, el Lobo. *(Flow)*
- **`futbol/la-tabla-y-el-descenso`**  — vocab quiz: "descenso" = "relegation" and "irse a la B" = "to get relegated" are almost the same gloss, and "promedio" = "points average used for relegation" also says relegation. *(Teach-before-test)*
- **`tango/nacido-en-el-arrabal`**  — vocab quiz: "bandoneón" = "bandoneón, the tango squeezebox" and "fueye" = "bandoneón (tango slang)". *(Teach-before-test)*
- **`tango/orquestas-y-piazzolla`**  — vocabulary "bandoneonista" and "bárbaro": neither appears anywhere in the class. *(Teach-before-test)*
- **`tango/las-letras`**  — vocabulary "letra" and "extrañar": neither appears in the class. *(Teach-before-test)*
- **`tango/las-letras`**  — vocab quiz: "mina" = "woman, girl" and "percanta" = "woman (in old tangos)". *(Teach-before-test)*
- **`musica/rock-nacional`** page 10 (TF, "Charly García once jumped from a ninth-floor hotel room") — never mentioned before, so the learner can only guess. *(Teach-before-test)*
- **`musica/trap-y-rkt`** page 9 (gap, "¡Qué ___! No paro de escucharlo.") — "¡Qué tema!" is a perfectly natural exclamation of praise, so two options fit. *(Exercise logic)*
- **`habla/lunfardo`** page 9 (match, "Match each lunfardo milestone to its year") — 1953 (Gobello, "Lunfardía"), 1962 (Academia) and 2000 (Día del Lunfardo) are never taught before the match, and the page is pure date trivia. *(Interest / Teach-before-test)*
- **`habla/vesre-re-posta`** page 9 (order, "Es lindo / muy lindo / re lindo / recontra lindo") — page 5 teaches **re** as just "very", the local way of saying **muy**, and the explain says re is "how people actually talk", not stronger. *(Exercise logic)*
- **`habla/manos-y-chat`**  — vocab quiz: "ni ahí" = "not at all, no way" and "nada que ver" = "not at all, that's got nothing to do with it" both start with "not at all", so "pick the meaning" is ambiguous. *(Teach-before-test)*
- **`puteadas/gil-forro-chanta`**  — vocab: *hinchapelotas* and *rompebolas* both have en = "pain in the neck, pest", word for word. *(Teach-before-test (auto-quiz))*
- **`puteadas/la-puta-madre`** page 3 (order, "¡Pucha!") — the learner must rank *¡Pucha!* as the mildest, but euphemisms are only taught on page 7. *(Teach-before-test)*
- **`costumbres/sin-filtro`**  — vocab: *¿Cuánto pagaste?* = "How much did you pay?" and *¿Cuánto te salió?* = "What did it cost you?" mean the same thing, so "pick the meaning" has two right answers. *(Teach-before-test (auto-quiz))*
- **`costumbres/navidad-en-verano`** page 6 (order, "Nochebuena, in order") — the last item, "Pan dulce and turrón at the table", has no defensible slot. *(Exercise logic)*
- **`costumbres/el-calendario`** page 8 (match, "Third Sunday of October" ↔ "Día de la Madre") — Mother's Day is never taught. *(Teach-before-test)*
- **`buenos-aires/portenos`** page 3 (choice, "Mañana voy a Capital…") — the question hinges on "Capital" meaning the city, but page 2 only taught *CABA*. *(Teach-before-test)*
- **`buenos-aires/moverse`** page 9 (gap, "¿Me ___ en Plaza Italia?") — *¿Me deja en…?* is never taught before this page. *(Exercise logic + Teach-before-test)*
- **`buenos-aires/moverse`**  — vocab: *colectivo* = "city bus" and *bondi* = "bus (slang)". *(Teach-before-test (auto-quiz))*
- **`regiones/el-interior`** page 9 (gap, "Mi hermana se fue a vivir al ___") — "campo" also works. *(Exercise logic)*
- **`regiones/el-interior`** page 8 (order, Jujuy → Tierra del Fuego) — the class never gives the provinces' north-south positions. *(Teach-before-test)*
- **`regiones/cordoba`**  — "tonada" = "regional accent, sing-song" vs "cantito" = "sing-song (the Córdoba accent)": in "pick the meaning", these glosses are interchangeable. *(Teach-before-test (vocab quiz))*
- **`iconos/mafalda`** page 2 (true_false, "first created for an ad campaign") — nothing before this mentions the ad. *(Teach-before-test)*
- **`iconos/mafalda`**  — "historieta" = "comic strip, comic" vs "tira" = "comic strip (short)": in "pick the meaning" these are indistinguishable. *(Teach-before-test (vocab quiz))*
- **`iconos/historietas-y-pantallas`** page 6 (true_false, "2025 Netflix series… starred Ricardo Darín") — the Netflix series and Darín were never mentioned (Darín is only introduced in a later class). *(Teach-before-test)*
- **`iconos/inventos-y-nobeles`**  — "colectivo" = "city bus" vs "bondi" = "bus (slang)": in "pick the meaning", both options are correct. *(Teach-before-test (vocab quiz))*
- **`iconos/iconos-de-hoy`**  — "capo" = "legend, brilliant person", "crack" = "star player, ace" and "ídolo" = "idol, sports hero" are near-synonyms, so "pick the meaning" becomes ambiguous. *(Teach-before-test (vocab quiz))*
- **`historia-nacimiento/san-martin-y-belgrano`** page 5 (choice, tomb in the Catedral) — nothing says where San Martín is buried, and Belgrano is equally plausible to a learner who just read about both. *(Teach-before-test)*
- **`historia-nacimiento/unitarios-federales-y-gauchos`** page 6 (choice, "Which book is it?") — Martín Fierro is never mentioned before this question. *(Teach-before-test)*
- **`historia-nacimiento/unitarios-federales-y-gauchos`** page 7 (true_false, "Día de la Tradición… José Hernández's birthday") — the date, the holiday and Hernández's birthday were never taught (Hernández appears only in the previous explain). *(Teach-before-test)*
- **`historia-nacimiento/unitarios-federales-y-gauchos`** page 2 (match) — "caudillo" appears in the match before any page teaches it. *(Teach-before-test)*
- **`historia-moderna/malvinas`**  — "veterano" = "war veteran" vs "ex combatiente" = "former combatant, veteran": both glosses contain "veteran", so "pick the meaning" is ambiguous. *(Teach-before-test (vocab quiz))*

---

## Part 3 — Scorecard

| Section | Classes | High | Medium | Low |
|---|---:|---:|---:|---:|
| [Mate](#mate) | 6 | 1 | 10 | 15 |
| [Asado](#asado) | 6 | 1 | 11 | 11 |
| [La mesa argentina](#comida) | 5 | 1 | 7 | 16 |
| [Alfajores y dulces](#alfajores) | 5 | 3 | 5 | 15 |
| [Fútbol](#futbol) | 7 | 5 | 18 | 11 |
| [Tango](#tango) | 5 | 4 | 9 | 9 |
| [Música](#musica) | 5 | 2 | 14 | 8 |
| [Cómo hablamos](#habla) | 5 | 3 | 10 | 5 |
| [Dichos y refranes](#dichos) | 4 | 0 | 4 | 7 |
| [Puteadas](#puteadas) | 4 | 2 | 9 | 4 |
| [Costumbres](#costumbres) | 6 | 3 | 15 | 8 |
| [Buenos Aires](#buenos-aires) | 5 | 3 | 14 | 6 |
| [Las provincias](#regiones) | 6 | 3 | 14 | 12 |
| [Íconos e inventos](#iconos) | 5 | 5 | 15 | 10 |
| [Historia: el nacimiento de un país](#historia-nacimiento) | 7 | 4 | 10 | 11 |
| [Historia: el siglo XX y hoy](#historia-moderna) | 5 | 1 | 14 | 9 |
| **Total** | **86** | **41** | **179** | **157** |

The counts show how many specific issues each section has. They are not a quality ranking: long, dense sections (history, icons, fútbol) naturally collect more Medium findings.

---

## Part 4 — Section by section

Sections are listed in the order the app shows them. Each class lists its issues, with a **Fix** for each, and sometimes a **Keep** line for what already works. Where a finding says the learner "first meets" a word "in the final quiz", read it as "first meets it in the word list, right before the quiz".

<a id="mate"></a>

### Mate (`docs/culture/mate.yaml`)
**Section verdict:** The strongest section of the four. The ronda etiquette ("gracias" means I'm out, "no es un micrófono", the first mate is for the fool) is exactly what a tourist needs and is told with charm. The weak spots are a history-heavy opening class, one order exercise that tests steps nobody taught, and vocab lists padded with words the class never uses in Spanish.

#### que-es-el-mate — What is mate?
- **[Medium] Exercise logic** — page 6 (match, "Match the word to where it comes from"): "Misiones → Province where most yerba grows" and "30 de noviembre → Día Nacional del Mate" are not "where a word comes from", so the prompt doesn't fit half the pairs. The date also only appeared in a fun_fact, so this is a test of trivia recall. **Fix:** Rename the prompt to "Match the word to what it is" and swap the date pair for something useful, e.g. "tomar → to drink (mate)" or "yerba → the leaves".
- **[Medium] Teach-before-test** — vocabulary "calabaza": the word never appears in this class. The cup is called "small cup" and "gourd" only. The learner first meets it in the word list, and it is taught properly in the next class (los-chiches, page 1). **Fix:** Move "calabaza" to los-chiches' vocab (it's currently in its glossary), or name it in page 1 ("a small gourd, a **calabaza**").
- **[Low] Teach-before-test** — page 7 (choice, "¿Tomás mate?"): **tomar** and **dale** are both vocab words, but they appear only in this page's explain. **Fix:** Add one line to page 1: "You don't *drink* (beber) mate, you **tomás** mate."
- **[Low] Teach-before-test** — auto vocab quiz: the "mate" gloss is "mate (the drink, and the cup)". It contains the word itself, so "pick the meaning" for **mate** is free. "tomar mate → to drink mate" is almost as free. **Fix:** Use "the drink, and the gourd you drink it from" as the gloss.
- **[Low] Interest** — pages 3–4 (info, Guaraní / Jesuits): two history cards in a row, with "1600s", "Jesuit tea", Quechua *mati* and Andresito's birthday. That's a lot of history for a class opener. **Fix:** Merge them into one card: "The Guaraní drank it first, the Jesuits farmed it". Drop the Quechua etymology and the Nov 30 fun fact.
- **Keep:** Page 1's "Not a drink. A ritual." is a great hook.

#### los-chiches — The gear
- **[Medium] Exercise logic** — page 7 (gap, "Your friend is about to pour water from the stove. What do you ask for?"): the scene doesn't make sense. If your friend is already pouring, why ask them to pass the kettle? The explain joke ("No, you don't use it to drink") falls flat. **Fix:** "You're the cebador and the water's ready on the stove. Ask your friend to pass it."
- **[Low] Teach-before-test** — page 3 (true_false, stirring): the explain says "tell the **cebador**", but the word isn't taught until the next class. **Fix:** Say "tell whoever's serving".
- **[Low] Teach-before-test** — page 8 (true_false, "wash … with soap and use it right away"): the statement is double-barrelled, and "never use soap" (the useful part) appears only in the explain. **Fix:** Put "no soap, ever" on page 1, and test only one claim.
- **[Low] Interest** — page 4 (info): "500 g or 1 kg packs" is filler. **Fix:** Cut it. Use the space for the brand-loyalty line or a tip like "grab a con palo pack for your first time".

#### cebar — How to cebar
- **[High] Teach-before-test / Exercise logic** — page 3 (order, "Prepare a mate, step by step"): "Wet the low side with a bit of warm water" and "Put in the bombilla on the wet side" were never taught. Page 2 only covers fill, flip, tilt, pour. Also, bombilla-before-water vs water-before-bombilla is a well-known split among cebadores, so the order is arguable. The page also tests "not boiling" before the page that teaches it. **Fix:** Add the wet-then-bombilla step to page 2 as "one common way", and move the order exercise after page 4. Or cut it to the 4 steps actually taught.
- **[Medium] Teach-before-test** — vocabulary "hervir" and "agua caliente": neither appears in Spanish anywhere in the class. **Fix:** Use them in page 4 ("**agua caliente**, never **hirviendo**"), or drop them.
- **[Medium] Teach-before-test** — auto vocab quiz: "hervir → to boil" and "quemar la yerba → to burn the yerba (with boiling water)" both hinge on "boil". A learner who never saw *hervir* can defensibly pick either. **Fix:** Shorten the second gloss to "to burn the yerba".
- **Keep:** Page 6 plus "el primero es para el zonzo" (page 7). That's real insider knowledge.

#### la-ronda — The rules of the ronda
- **[Medium] Exercise logic / Teach-before-test** — page 10 (true_false, "Wiping the bombilla … is normal and polite" → false): the explain opens with "It's not a rule anyone enforces", so the statement is half-true. The "if you're sick, just say no, gracias" advice is genuinely useful but appears only here. **Fix:** Make it an info card ("Don't wipe the bombilla. If you're sick, just skip the ronda with **no, gracias**"), then ask a choice question ("You have a cold. What do you do?").
- **[Medium] Flow (repetition)** — "hand it back to the cebador" is taught on page 1 and tested on pages 2 and 9. "Gracias = I'm done" is tested on pages 5 and 8. That's two facts tested five times in a 10-page class. **Fix:** Drop page 8 (or make it the wiping/sick scenario), and turn page 9 into something new (e.g. who drinks first).
- **[Low] Teach-before-test** — page 3 (choice, "Should you fix it?"): nothing in this class taught "only the cebador touches it" before the question. It's guessable, but not taught. **Fix:** Add one sentence to page 1: "Only the cebador touches the yerba and the bombilla."
- **[Low] Teach-before-test** — page 9 (order): "bombilla facing you" is new info slipped into an order item. **Fix:** Mention it in page 1, or drop it from the item.
- **[Low] Teach-before-test** — vocabulary "pasar el mate": the class never uses the phrase in Spanish. **Fix:** Use "pasale el mate al cebador" in page 1, or drop it.
- **Keep:** Pages 4 and 6 ("Gracias means I'm out", "¡No es un micrófono!") are the best cards in all four files.

#### mate-de-todos-los-dias — Mate every day
- **[Medium] Flow (repetition)** — page 6 (info, "Where? Everywhere."): "Uruguayans drink even more per person … 8 to 10 kilos … against 6" is repeated almost word for word on page 1 of the next class. Here it's also an abrupt tangent in a card about where people drink mate. **Fix:** Delete it here and keep it in mate-en-el-barrio.
- **[Low] Interest** — page 4 (info, tereré): "UNESCO listed it as cultural heritage in 2020" is trivia. **Fix:** Replace it with something the learner can use: "If someone offers you tereré on a 40° day in Corrientes, say yes."
- **[Low] Exercise logic** — page 9 (gap, "¿Venís a ___ a casa?"): "cebador" and "tereré" are nouns and can't fill a verb slot, so the only verb wins. **Fix:** Use verb distractors: "cebar", "tomar", "matear". "tomar" also fits, though, so better choose "cebar / comer / matear" and adjust the translation.
- **[Low] Flow** — page 7 (true_false, tereré): this re-tests page 4 right after the page 5 match already did. **Fix:** Cut it, or swap it for a "mate cocido" check.
- **Keep:** Page 8, the road trip "Cebame uno" (co-pilot is the cebador), is a lovely applied scenario.

#### mate-en-el-barrio — Mate next door
- **[Medium] Exercise logic** — page 6 (match, "Match the mate to where it's from"): "yerba uruguaya → Uruguay" names the answer, and "yerba con palo → Argentina (with stems)" just translates the term. Only chimarrão vs tereré actually tests anything. "Con palo = Argentina" was also never taught; los-chiches presented it as one option at the supermarket. **Fix:** Match the local names to their countries: chimarrão / cuia / tereré / "termo bajo el brazo". Remove the parenthetical hints.
- **[Medium] Tone / Sensitivity** — page 7 plus vocabulary "turco": teaching a tourist to call Syrian-Lebanese Argentines **turco** as a vocab item, even with a caveat, invites them to use it. The sentence is also a tangent in the Syria card. **Fix:** Drop "turco" from the vocabulary. If kept, keep it in the glossary with a clear "you'll hear it, don't use it".
- **[Low] Exercise logic / Interest** — page 8 (choice, "Which country buys the most Argentine yerba?"): the previous page's title, "The surprise fan: Syria", already gave the answer, so this is pure recall. **Fix:** Move the question *before* page 7 as a guess ("Guess who buys most of Argentina's yerba?"), then reveal. That turns a recall test into a fun surprise.
- **[Low] Teach-before-test** — vocabulary "fuerte" (never used in Spanish) and "polvo" (appears only in page 4's explain). **Fix:** Put "más **fuerte**" and "**polvo**" in page 2's body.
- **[Low] Interest** — page 5: "Since 2003 a state law…" is filler. **Fix:** Cut it.

---

<a id="asado"></a>

### Asado (`docs/culture/asado.yaml`)
**Section verdict:** Great subject and mostly good instincts: the sobremesa, "nada, vení" really meaning bring something, embers not flames, the plough-disc wok. But the section repeats itself a lot. The hands-off-the-asador rule, the aplauso-then-sobremesa ending and the lamb on a cross each show up in two or three classes. Two gap exercises have a second valid answer.

#### el-ritual — More than a barbecue
- **[Medium] Flow (repetition)** — pages 5 and 6 (choice, then gap, both "¡Un aplauso para el asador!"): the same phrase is tested twice back to back, and the aplauso was never taught before the first question (page 4 doesn't mention it). **Fix:** Put the aplauso in page 4's body and keep only the gap.
- **[Medium] Flow (repetition)** — page 7 (choice, "Most of the afternoon"): this re-tests page 3 (true_false, "head home half an hour later"). The class has only three info cards, and two facts are tested five times. **Fix:** Replace page 7 with something new, e.g. a card plus a question on what time the food actually arrives, or "¿hacemos un asado?" as an invitation to hang out.
- **[Low] Interest** — vocabulary "domingo" and "aplauso": filler words that are near-cognates or unrelated to the culture point. **Fix:** Swap in something useful like "¿hacemos un asado?" or "picada".
- **Keep:** Page 1's reframe ("they're really asking: wanna hang out all day?") and page 2's sobremesa.

#### el-fuego — Playing with fire
- **[High] Exercise logic** — page 7 (gap, "¿Te ___ en algo?", options ayudo / ayudás / ayudamos): "¿Te ayudamos en algo?" (can we help you?) is perfectly valid and also offers help. This is also a conjugation drill that a beginner can't reason about. **Fix:** Use distractors that break the meaning, not the grammar, e.g. "ayudo / cobro / pego". Or make it a choice of whole phrases.
- **[Medium] Flow (repetition)** — page 6 (choice, "Nothing — the fire belongs to the asador"): the same "hands off" rule is the "golden rule" of sos-invitado (pages 4–5, "never grab the tongs"). **Fix:** Keep the rule in one place, preferably sos-invitado. Here, test the fire itself (e.g. "the asador shovels embers under the grill: why not just add logs under the meat?").
- **[Medium] Flow (repetition)** — page 1 (info): "asado a la cruz" (whole lamb on an iron cross) is taught again in asados-del-pais as "cordero al asador", under a different name and with its own vocab entry. **Fix:** Cut it from page 1 ("…more on that in *Asados from the rest of the country*"), or say explicitly that both names mean the same thing.
- **[Low] Exercise logic** — page 6: the correct option is the only one with an em-dash explanation ("Nothing — the fire belongs to the asador"), so it's the longest and most "reasoned". **Fix:** Shorten it to "Leave it alone".
- **Keep:** Page 2's "Embers, not flames" and page 1's balcony-parrilla fun fact ("Priorities.").

#### el-orden — What comes off the grill, and when
- **[Medium] Flow** — pages 2–4: page 2 introduces five offal words in one card, page 3 tests all five immediately, and page 4 adds four more cuts. That's about 13 food nouns in three screens, which is hard to hold. **Fix:** Cut riñones and matambre. Split achuras into "the sausages" and "the brave stuff".
- **[Medium] Flow (repetition)** — page 5 (order): it ends "Aplauso para el asador → Sobremesa", and sos-invitado page 7 ends with the exact same two items. **Fix:** End this order at the cuts. Let sos-invitado own the aplauso and sobremesa.
- **[Low] Teach-before-test** — page 3 (match, "mollejas → sweetbreads"): most English-speaking tourists don't know what sweetbreads are, so the gloss teaches nothing. **Fix:** Use "sweetbreads (thymus gland)" in page 2, and say "crispy outside, creamy inside".
- **[Low] Flow** — chinchulines are covered on pages 2, 3 and 6. **Fix:** Make page 6 about mollejas or morcilla instead.
- **Keep:** Page 7 on doneness (jugoso / a punto / cocido, and the raised eyebrow for very rare). It's genuinely useful at any parrilla.

#### chori-y-salsas — Choripán, provoleta and the sauces
- **[Medium] Interest / Exercise logic** — page 6 (true_false, "Historians agree that chimichurri was named after an Irishman called Jimmy McCurry"): this tests an origin myth, and the "Historians agree…" opener gives away "false". The same template is used in alfajores/dulce-de-leche page 3. "McCurry" also never appeared in the body. **Fix:** Test something useful instead: "Chimichurri or salsa criolla: which one has tomato?", or how to order at a choripán stand ("un chori con chimi").
- **[Low] Exercise logic** — page 2 (gap, "Un choripán es un chorizo en ___"): the answer is literally inside the word "choripán", and page 1 just said "chorizo + pan". **Fix:** Turn it into an ordering gap at a street stand: "Un ___ con chimichurri, por favor" (chori / provoleta / asado).
- **[Low] Interest** — page 3 (info): "credited to Natalio Alba … Córdoba, around 1940" is founder-and-date trivia. **Fix:** Replace it with what matters: it's the classic starter at any parrilla, order one for the table, and eat it before it turns to rubber.
- **Keep:** Page 7, the stadium chori scenario.

#### sos-invitado — You're invited — now what?
- **[Medium] Flow (repetition)** — fun_fact on page 1: "hacer una vaquita" is taught here as new, and taught again as new in comida/horarios-y-mesa (both in its body and its vocab), with a different gloss ("chip in money" vs "pool money"). **Fix:** Teach it in one class only and use the same gloss everywhere.
- **[Low] Interest** — page 8 (match, vino / bebida / postre / hielo): an easy-recall match at the end of the class, and vino→wine is a cognate. **Fix:** Cut it. The class already has seven pages.
- **[Low] Interest** — page 6 (true_false, offering to wash up is nice → true): this is common sense, and the "others clean up" norm appears only in the explain. **Fix:** Make it more pointed: "Who usually washes up at an asado?" (not the asador).
- **[Low] Teach-before-test** — vocabulary "bárbaro": it appears only in a page 5 option and its explain. **Fix:** Fine as is, or add "¡huele bárbaro!" to page 4's body as the line to say to the asador.
- **Keep:** Page 2, "nada, vení" as a polite formula. That's real cultural decoding.

#### asados-del-pais — Asados from the rest of the country
- **[Medium] Exercise logic** — page 8 (gap, "Hoy hacemos pollo al ___", options disco / cuero / horno de barro): "pollo al horno de barro" (chicken from the clay oven) is a real, common campo dish, so it's a second valid option. **Fix:** Replace it with an impossible option, e.g. "pollo al cuero / al disco / a la cruz", and adjust the explain.
- **[Medium] Teach-before-test** — auto vocab quiz: "disco de arado → plough disc used as a cooking pan" and "al disco → cooked in the disc" are near-synonyms, so "pick the meaning" is ambiguous whenever both show up. The same goes for "al asador → roasted on an iron cross". **Fix:** Keep only "al disco" in vocab and move "disco de arado" to the glossary.
- **[Medium] Flow** — page 1: "asador" is redefined as the iron cross, even though three classes drilled it as "grill master", and el-fuego already called this dish "asado a la cruz". **Fix:** Say it outright: "Also called **asado a la cruz** (you met it in *Playing with fire*). Yes, the cross is also called an asador. Argentines like that word."
- **[Low] Flow (repetition)** — the lamb is tested three times (page 2 choice, page 3 true_false, page 9 order). Page 3 ("twenty minutes") is trivially false, and page 9's order is common sense. **Fix:** Cut page 3. Replace page 9 with an order that spans the dishes ("which takes longest": pollo al disco < cordero < con cuero). That makes the time contrast the point and uses a match rather than hidden clues.
- **[Low] Interest** — page 1 and page 4 each end on festival trivia (Puerto Madryn in January, Viale). **Fix:** Keep one festival line at most, framed as a travel tip ("if you're in Entre Ríos in February…").
- **Keep:** Page 5 ("Vaquillona con cuero, se sirve a las 13 hs" → the night before) is a smart inference question. Page 6 on the disco is charming.

---

<a id="comida"></a>

### La mesa argentina (`docs/culture/comida.yaml`)
**Section verdict:** Very useful for a tourist. The bill never comes unless you ask, cubierto is not a tip, dinner is at ten, repulgue codes, de parado at Güerrín and ñoquis del 29 are all great. The main problems are founding-year trivia, a stew-plus-ice-cream mashup class, useful info tucked into explains, and one vocab pair that breaks the auto-quiz.

#### horarios-y-mesa — Dinner at ten
- **[Medium] Teach-before-test / Exercise logic** — page 2 (true_false, "'a las diez' … they mean 10 in the morning"): trivially false right after page 1, while the genuinely useful fact (arrive 15–30 minutes late to a dinner at someone's home) appears only in the explain. **Fix:** Put lateness on page 1 or its fun_fact, and ask "Invited for 10 p.m. at a friend's place. You arrive at 10:00 sharp: is that normal?" or a choice between arrival times.
- **[Medium] Teach-before-test** — page 8 (choice, "¿Pedimos para compartir?"): "para compartir" is a vocab item that's never taught before this. The "splitting the bill by what each person ate" option is a fair reading of "compartir" for a beginner. **Fix:** Add one sentence to page 4 or 6 about ordering "para compartir".
- **[Low] Exercise logic** — page 3 (match, "Match each meal to when Argentines have it"): "Desayuno → Café con leche y tostadas" is food, not time, and "coffee" appears in two right-hand items. **Fix:** Use times for all four ("Desayuno → early, tiny").
- **[Low] Flow (repetition)** — "merienda" is vocab here and in mate/mate-de-todos-los-dias, "sobremesa" is re-taught (asado/el-ritual), and so is "vaquita" (see sos-invitado). **Fix:** Cross-reference instead of re-teaching ("remember the sobremesa?").
- **Keep:** Page 4 ("Nobody brings the bill", the air-writing gesture) and page 7 (cubierto ≠ tip). Both are gold for tourists.

#### empanadas — Empanadas
- **[Low] Interest** — page 1 fun_fact (April 8, Día de la Empanada) and page 4 fun_fact (Famaillá festival): date and festival trivia. **Fix:** Replace one of them with a practical tip, e.g. "Order a mix and ask for them **al horno**, or ask what the place is known for."
- **[Low] Flow** — page 1 body lists five fillings plus docena and media docena in one card, which is dense. **Fix:** Move the fillings list to a short follow-up line, or just rely on the glossary.
- **[Low] Teach-before-test** — page 8 (choice, "Why a corner first?"): never taught, though it's guessable. **Fix:** Add "bite a corner first, they're full of hot juice" to page 5.
- **Keep:** Pages 2–3 on the repulgue as a code and "¿Cuál es cuál?". It's surprising and useful. The whole class paces well.

#### pizza-portena — Pizza porteña
- **[Medium] Flow (repetition)** — page 9 (choice, "What is fainá made of?"): pure recall of page 4 (whose big-word card literally says "chickpea flatbread"). It comes right after pages 5 and 8 also tested fainá, so the class ends on its weakest page. **Fix:** Cut it, or replace it with a fugazzeta rellena scenario.
- **[Low] Interest** — page 2 ("Banchero, opened in La Boca in 1932 by a Genoese family") and page 6 ("Güerrín, also from 1932"): founding years. **Fix:** Drop the years, and keep the names, which are useful to a tourist.
- **[Low] Teach-before-test** — vocabulary "mostrador": it appears only in page 7's explain. **Fix:** Use "at the **mostrador** (counter)" in page 6's body.
- **[Low] Teach-before-test** — vocabulary "a caballo": the gloss mentions "egg on a milanesa", which isn't taught until the next class. **Fix:** Use "fainá on top of pizza" here only.
- **[Low] Exercise logic** — page 7 (choice): "Give up and go home" and "delivered to the theater" are joke options, so the question is trivial. **Fix:** Make the distractors plausible, e.g. "Wait 40 minutes for a table" or "Get it to go".
- **Keep:** Pages 4–6. Fainá a caballo and eating de parado at the counter is exactly the insider angle a visitor wants.

#### herencia-italiana — Nonna's kitchen
- **[High] Teach-before-test (auto-quiz)** — vocabulary "ñoqui" ("slacker on the public payroll") next to "ñoquis" ("gnocchi"): in "pick the meaning" for **ñoqui**, "gnocchi" appears as a distractor and is literally correct, since ñoqui is the singular of ñoquis. **Fix:** Drop one of them from vocab (move "ñoqui" to the glossary), or rewrite the "ñoquis" gloss as "potato gnocchi (eaten on the 29th)" and keep the insult out of vocab.
- **[Medium] Teach-before-test** — page 7 (true_false, "calling a public employee a 'ñoqui' is a compliment"): the insult meaning, the best twist in the class, is never taught before the question and appears only in the explain. **Fix:** Add it to page 5 ("…and that's why a **ñoqui** is someone who only shows up on the 29th, to get paid"), then ask the question.
- **[Low] Teach-before-test** — page 9 (gap, "milanesa de ___", soja): milanesa de soja was never mentioned. It's answerable by elimination but not taught. **Fix:** Add "chicken, **soja** (soy) for vegetarians" to page 1.
- **[Low] Exercise logic** — page 3 (true_false, "invented in Naples"): the previous card's title, "Napolitana: not from Naples", gives the answer away. **Fix:** Retitle the page to "The napolitana".
- **[Low] Interest** — page 1 fun_fact ("May 3 is the unofficial Día de la Milanesa. Nobody is quite sure who started it."): filler. **Fix:** Cut it, or replace it with "a milanesa a caballo is the same *a caballo* as the pizza+fainá".
- **Keep:** Pages 5–6, ñoquis del 29 with money under the plate. A charming ritual a tourist can actually join.

#### guisos-y-helado — Stews, corn and helado
- **[Medium] Flow** — the whole class: locro and tamales jump to ice-cream delivery with no link, so the title reads like two classes stapled together. **Fix:** Split helado into its own class (it has enough material), or move it to "Alfajores y dulces", where sweets live.
- **[Medium] Teach-before-test** — vocabulary "choclo": the word never appears in the class. Corn is only ever "corn" in English. **Fix:** Use "**choclo** (corn)" in page 2, or drop it.
- **[Medium] Flow** — page 2 (info): carbonada, dried peaches, pumpkin, humita en chala, chala, tamales and guiso, all in one card. That's a wall of dish names nobody will retain. **Fix:** Keep carbonada in the pumpkin (it's visual and fun) and humita en chala. Cut tamales, or move it to the glossary.
- **[Low] Teach-before-test (auto-quiz)** — "guiso → stew" and "locro → thick corn and meat stew": locro *is* a guiso, so "stew" is defensible for locro and vice versa. **Fix:** Rewrite the locro gloss as "patriotic corn stew (25 de mayo)".
- **[Low] Exercise logic** — page 7 (true_false, "only buy helado in summer"): trivially false after page 5's "all year round" title. **Fix:** Replace it with a sizing scenario ("4 people after dinner: un cuarto or un kilo?").
- **[Low] Exercise logic** — page 8 (gap, "Quería un ___ de helado", kilo / docena / porción): "un docena" and "un porción" are grammatically impossible, so gender gives it away. **Fix:** Use masculine distractors: "kilo / cuarto / litro", with the scenario pinning the size.
- **[Low] Interest** — page 5 fun_fact ("7 kilos of helado per person per year"): a number nobody will remember. **Fix:** Swap it for a tip, e.g. "most heladerías deliver until 1 a.m."
- **Keep:** Page 9 ("¿Qué gustos?" with the "If you like the shop" distractor) is a clever trap, and page 6 on ordering helado by the kilo to your door is a great insider fact.

---

<a id="alfajores"></a>

### Alfajores y dulces (`docs/culture/alfajores.yaml`)
**Section verdict:** Charming voice, and facturas (the anarchist bakers) and postres caseros land well. But marcas-y-kioscos is mostly brand trivia (founding years, a seven-brand roll call, a brand-reputation match). Two exercises have a second valid answer, and one choice is really a matter of taste. The order exercises here are mostly too obvious to test anything.

#### que-es-un-alfajor — What is an alfajor?
- **[High] Exercise logic** — page 7 (choice, "exactly enough coins for one alfajor … What do you ask for?" → triple): this is a preference question, and "simple" is just as defensible (and with "exactly enough coins", arguably the only one you can afford). The joke option "sin tapas" makes it a coin flip between two valid answers. **Fix:** Make it factual: "The kiosquero asks '¿Simple o triple?'. What's the difference?"
- **[Medium] Flow (repetition)** — maicena and coconut are tested three times: page 5 (match), page 8 (gap, "coconut on the sides"), and page 9 (order, "Roll the edges in grated coconut"). **Fix:** Cut page 9. Replace page 8 with something new, e.g. membrillo or fruta.
- **[Medium] Teach-before-test** — vocabulary "relleno": it never appears in the class in Spanish. **Fix:** Use it in page 1 ("glued together with a **relleno**, usually dulce de leche"), or drop it.
- **[Low] Interest** — page 9 (order, "Build an alfajor de maicena"): bake, spread, top, roll is common sense and tests nothing ("Four steps." admits it). **Fix:** Cut it.
- **[Low] Interest** — page 2 (info plus fun_fact): etymology is covered twice (al-hasú in the body, al-fasur vs al-hasú in the fun_fact). **Fix:** Keep the "born in Muslim Spain" twist and drop the root debate.
- **[Low] Teach-before-test (auto-quiz)** — the "tapa", "triple" and "alfajor" glosses all contain "alfajor" or "cookies", and "triple → alfajor with three cookies" is a giveaway. **Fix:** Rewrite the triple gloss as "the big one (3 layers)", and the tapa gloss as "lid; each cookie layer".
- **Keep:** Page 1 ("If an Argentine offers you half their alfajor, that's basically friendship").

#### marcas-y-kioscos — Brands, kioscos and the eternal debate
- **[High] Exercise logic** — page 9 (gap, "¿Me ___ dos alfajores?", options das / dais / da): "¿Me **da** dos alfajores?" (usted) is correct, polite and common with an older kiosquero. The explain only rules out "dais". **Fix:** Replace "da" with a non-fitting verb ("das / dais / tenés"), or accept both and explain vos vs usted.
- **[Medium] Interest** — page 3 (info, "The heavyweights"): seven brands in one card, plus "born in Mar del Plata in 1947". Page 7 (match, brand → reputation, e.g. "Cachafaz → named after a tango dancer") then tests that roll call, which is pure brand-trivia recall. **Fix:** Keep three brands with a use case each: Havanna = the gift, Jorgito/Guaymallén = the everyday kiosco buy, Fantoche = the triple. Replace the match with a scenario choice ("Gift for your host vs. snack on the bus").
- **[Low] Interest** — page 4 (true_false, "Havanna is from Mar del Plata"): a founding-location fact, and page 5 then gives it away again ("you pass through Mar del Plata"). **Fix:** Cut page 4. Page 5 carries the useful point.
- **[Low] Interest** — page 8 (info, World Cup of alfajores, 2022, El Rodeo from Catamarca): a trivia card with no question and nothing actionable. The fun_fact joke is good. **Fix:** Cut it down to one line with the joke, or drop it.
- **[Low] Teach-before-test** — vocabulary "regalo" appears only in page 5's explain, and "alfajor blanco" was taught only as "Guaymallén blanco". **Fix:** Use "**regalo**" in page 5's scenario, and "an **alfajor blanco**" in page 6's body.
- **Keep:** Page 1 (the kiosco, the ventanita fun fact) and page 2 (1 a.m. craving). That's the useful, everyday angle.

#### dulce-de-leche — Dulce de leche and friends
- **[High] Exercise logic** — page 8 (order, "Make a chocotorta"): mixing the cream (step 1) and dipping the cookies (step 2) can happen in either order. Page 6 even describes it cookies-first ("Chocolinas cookies dipped in milk, layered with dulce de leche mixed with cream cheese"). **Fix:** Drop the order exercise. If you keep it, make step 1 unambiguous ("Buy Chocolinas and cream cheese") and merge the mix and dip steps.
- **[Medium] Exercise logic / Flow** — page 3 (true_false, "Historians agree dulce de leche was invented in Argentina in 1829"): "Historians agree" gives away "false", and it's the same template as asado/chori-y-salsas page 6. **Fix:** Use a legend-framed choice: "In the legend, who forgot the pot?" Or better, test the Uruguay rivalry: "Which neighbor also claims it?"
- **[Low] Flow** — page 2 (info, the legend): "Rosas and his enemy Lavalle" means nothing to a tourist. **Fix:** Add three words: "Rosas, the strongman governor, and his rival Lavalle".
- **[Low] Interest** — page 9 (gap, "Con dulce de ___, obvio"): the class has said "dulce de leche" dozens of times, so this is free. **Fix:** Blank "obvio" instead (options: obvio / nunca / capaz). That teaches the vocab word.
- **[Low] Tone** — page 1's "An Argentine will correct you, gently, for twenty minutes" reuses the empanadas page 6 joke ("politely explain why you're wrong for twenty minutes"), and the vocab gloss is "milk caramel spread" right after "Don't call it caramel." **Fix:** Vary the joke, and change the gloss to "slow-cooked milk-and-sugar spread".
- **[Low] Flow (class order)** — dulce de leche is used as a given in que-es-un-alfajor (and only glossed there) before this class explains it. **Fix:** Consider moving this class first in the section.
- **Keep:** Pages 4–5 (clásico vs repostero, the oozing filling). It's practical and surprising.

#### facturas — Facturas: anarchy at the bakery
- **[Low] Interest** — page 9 (order, "The perfect afternoon"): stop, buy, arrive, mate, fight over the last one is common sense, and "Arrive" vs "Someone starts cebando" is arguable (the mate is often already going). **Fix:** Cut it. The class is already 10 pages.
- **[Low] Flow** — page 6 (info, "vigilante (police)"): postres-caseros later has a *different* cop story for "postre vigilante". Two unrelated vigilante origins could confuse. **Fix:** Add a one-line nod in postres-caseros ("not the pastry, a different cop story").
- **[Low] Teach-before-test** — page 10 (choice, "dale, comela vos"): the phrase isn't taught, though it's answerable because the distractors are jokes. **Fix:** Fine as a light closer. Optionally make one distractor plausible ("They're asking you to split it").
- **Keep:** Page 5 plus the page 6 match (anarchist bakers mocking police, Church and army through pastry names). It's the best story in the section. Page 2 ("Wine is for the asado") and page 7 ("una docena surtida") are genuinely useful.

#### postres-caseros — ¿Qué hay de postre?
- **[Medium] Teach-before-test** — page 9 (choice, abuela's flan): the vocab phrase "un poquito nomás" appears only in the explain. **Fix:** Put it in the scenario or on an earlier info card ("the magic words: **un poquito nomás**").
- **[Low] Interest** — page 5 (gap, "Arroz con leche, me quiero ___"): recalling a children's song lyric is useless to a tourist. "me quiero quedar" is also grammatical. **Fix:** Cut it, or replace it with an ordering gap: "Un flan ___, por favor" (mixto / casero / quemado).
- **[Low] Exercise logic** — page 7 (true_false, "Budín de pan is made with fresh bread"): trivially false after page 6's "yesterday's bread". **Fix:** Cut it, or ask "What's a postre vigilante?" instead.
- **Keep:** Pages 2–3 (flan mixto at a bodegón). It's exactly what to order and how.

---

<a id="futbol"></a>

### Fútbol (`docs/culture/futbol.yaml`)
**Section verdict:** The strongest material is situational: the taxi question, the rival shirt, the barra, the previa, the gastada, "¿sos leproso o canalla?". Those make a tourist feel like an insider. The weak material is a pile of club nicknames, scores and scorer names: across seven classes the learner meets about 20 nicknames and gets quizzed on who scored in which final. Vocab lists often include words the pages never used in Spanish (cancha, Mundial, penal), and one class ends with two glosses that are nearly the same.

#### de-que-cuadro-sos — ¿De qué cuadro sos?
- **[High] Teach-before-test** — page 3 (match, "Match the club to its nickname"): none of the five nicknames (Xeneize, Millonario, Academia, Rojo, Ciclón) appears before this page. The learner can only guess, and the explain covers just two of them. **Fix:** move the match after an info page that introduces the nicknames, or cut it to the two that are taught (Xeneize, Millonario) and match colors or barrios instead.
- **[Medium] Interest** — page 3 (match): even when taught, five nicknames is trivia a tourist won't use. What they need is colors and places: blue-and-gold = Boca/La Boca, red-and-white sash = River/Núñez, light blue = Racing, red = Independiente. That also sets up the page 8 shirt scenario. **Fix:** make it "match the club to its colors / stadium".
- **[Medium] Teach-before-test** — vocabulary "cancha": the word never appears in this class. **Fix:** use it in the Superclásico page ("Boca's **cancha** is La Bombonera") or drop it from the vocab.
- **[Medium] Teach-before-test** — vocab quiz: "clásico" = "derby, match between rivals" and "Superclásico" = "Boca vs River". In "pick the meaning" for Superclásico, "derby, match between rivals" is also defensible. **Fix:** gloss clásico as "any derby (rival-vs-rival match)" and Superclásico as "THE derby: Boca vs River".
- **[Low] Interest** — page 4 fun_fact ("2018 … second leg … Madrid") and page 5 ("blew the 1966 Libertadores final against Peñarol"): score and year trivia inside otherwise fun pages. **Fix:** keep the Madrid story (it's funny) but drop the years. Cut "1966 … Peñarol" down to "after blowing a big final".
- **Keep:** the taxi-driver scenario (page 9) and the rival-shirt scenario (page 8) are exactly what a tourist needs.

#### la-hinchada — La hinchada
- **[Medium] Teach-before-test** — page 8 (match, "popular → standing terrace"): **popular** is defined only in the explain of page 3. **Fix:** add "the **popular** (standing terraces)" to the page 2 body.
- **[Low] Exercise logic** — page 5 (gap, "¡___ Boca!"): the translation shown after answering is "Long live Boca!", which is literally **Viva**, so a learner who picked the "Viva el" distractor is marked wrong and then sees a translation that seems to agree with them. **Fix:** make the translation "Come on, Boca! (lit. 'endurance, Boca!')", and swap "Viva el" for a clearly wrong option.
- **[Low] Exercise logic** — page 7 (choice, barra): "Film him for Instagram" and "Explain that you paid for your seat" are joke options, so the question is trivial. **Fix:** add a tempting wrong option, e.g. "Move to another section quietly" (plausible, but it reads as a snub).
- **[Medium] Interest** — the class never gives the tourist angle: how you actually get into a match (most tickets go to **socios**, so tourists buy through official tour packages), where to stand, what to wear. **Fix:** replace or shorten the barra page with a "So you want to go to a match" page and a choice scenario about buying tickets.
- **[Low] Flow** — page 9 (TF, "River went down in 2011"): the 2011 River relegation also shows up in mas-alla (Belgrano) and la-tabla (descenso page). That's three mentions in one section. **Fix:** keep it in la-tabla only and use a generic example here.

#### el-diez — 1978, 1986 and the Diez
- **[High] Teach-before-test** — page 9 (TF, "Argentina won the 1986 final against West Germany"): the 1986 final opponent is never mentioned, so this is a pure guess. Burruchaga appears only in the explain, and messi-y-qatar page 8 then quizzes him. **Fix:** put "beat West Germany 3–2 in the final" in the page 4 body, or swap the TF for something taught.
- **[Medium] Teach-before-test** — page 6 (order, "Lineker scores for England"): Lineker's goal is never mentioned before the quiz, so the learner can't know whether it came before the Hand of God. **Fix:** add "England pulled one back late" to page 5, or drop that item and use a 3-item order.
- **[Medium] Teach-before-test** — page 7 (choice): **viveza criolla** (a vocab item) is defined only in the explain. Also, the correct option is the only long, nuanced one, which gives it away. **Fix:** introduce viveza in the page 5 body and make the options equally nuanced (e.g. add "Pure revenge for Malvinas, nothing more").
- **[Medium] Teach-before-test** — vocabulary "Mundial": the pages always say "World Cup" in English and never use **Mundial**. **Fix:** use it in page 1 ("three **Mundiales**: …").
- **[Medium] Interest** — page 2 (info, 1978): "3–1 after extra time", "two goals from Mario Kempes", "6–0 over Peru" are stats a tourist won't keep. The real point (a cup won under a dictatorship, a sensitive topic) is good. **Fix:** cut the scores and Kempes and keep the shadow and the tip to tread carefully.
- **[Low] Exercise logic** — page 3 (TF, "Everyone … without mixed feelings"): the absolute "Everyone" gives the answer away. **Fix:** make it "Most Argentines see the 1978 win as purely a happy memory".
- **Keep:** the Hand of God asado scenario (page 7) and "¡Barrilete cósmico!". They are great conversation material.

#### messi-y-qatar — Messi and Qatar
- **[Medium] Interest** — page 8 (match, "Match the hero to the moment"): Kempes, Burruchaga, Götze and Montiel are "names nobody will remember". Burruchaga was only in an explain in the previous class. **Fix:** cut the page, or match the phrase to the moment ("la Mano de Dios", "Muchachos", "la Scaloneta", "Barrilete cósmico").
- **[Medium] Interest** — page 2 (info, 2014): "minute 113", "Mario Götze", "Copa América 2015 and 2016". The emotional point (Messi staring at the trophy, briefly quitting) is buried under stats. **Fix:** tell it as a story in two sentences and drop the minute and years.
- **[High] Teach-before-test** — vocabulary "penal": the pages only say "penalties" in English. **Fix:** write "**penales**" in the page 4 body.
- **[Medium] Teach-before-test** — page 9 (gap) and vocab "mufa": **mufa** appears only as a distractor and in the explain, then gets quizzed as vocab. **Fix:** add a page 7 explain line or a short info about mufa (the friend who "can't watch because he's mufa"). That's funny and very Argentine.
- **[Low] Exercise logic** — page 7 (choice): the correct option includes its own definition ("It's a cábala — a lucky ritual") next to two joke options. **Fix:** use Spanish-only options ("Es cábala" / "Es mufa" / "Es la previa") so the learner has to think.
- **[Low] Teach-before-test** — vocabulary "final" ("final (match)"): the gloss gives the answer away and adds nothing. **Fix:** drop it or replace it with "Muchachos" / "la Scaloneta".
- **Keep:** the Muchachos page (page 6) and the cábala socks scenario.

#### hablar-de-futbol — Talk like a hincha
- **[Medium] Exercise logic** — page 9 (order, "A perfect Superclásico Sunday"): "Suffer for ninety minutes" and "Celebrate a golazo" can go in either order, because the golazo happens during the 90 minutes. **Fix:** use a single in-match item ("Suffer and celebrate a golazo") or change the order item to "Final whistle".
- **[Medium] Teach-before-test** — page 10 (choice, gastada): **gastada** appears for the first time inside the correct option, the other options are jokes ("Report them to the police"), and the word is then a vocab item. **Fix:** introduce gastada in the page 7 previa body ("…and on Monday, the **gastada**"), and give the choice a plausible distractor.
- **[Low] Flow** — page 5 (info, "El DT and the arquero"): **arquero** was already taught and put in the vocab in messi-y-qatar. **Fix:** drop it here and keep hachero, a fun new word.
- **Keep:** potrero/picado/caño/golazo/previa is the most useful class in the section. The Nacho caño scenario is great.

#### mas-alla-de-buenos-aires — Beyond Buenos Aires
- **[High] Flow** — page 4 (info, "Córdoba and La Plata"): a wall of names in one card: Belgrano, Piratas, Talleres, la T, Matadores, River 2011, Estudiantes, pinchas, pincharratas, Gimnasia, 1887, triperos, el Lobo. The card splitter will turn it into 3–4 cards of pure nicknames. **Fix:** give each city one rivalry and one nickname per club, and drop "la T", "Matadores", "el Lobo" and the founding year.
- **[Medium] Interest** — page 5 (match, club to fan nickname): a second nickname-recall match in the same section (see de-que-cuadro-sos p3). **Fix:** keep only the Rosario pair, which the page 6 scenario makes useful, and cut the match or turn it into "which city are you in?".
- **[Medium] Teach-before-test** — page 3 (TF, "Messi and Di María … same club"): Di María's club and hometown are never taught. Messi's Newell's link is only in a different class. **Fix:** add to page 2: "Messi grew up a Newell's kid; Di María is pure Central."
- **[Medium] Flow** — pages 7–9 (women's football): the class jumps from Rosario rivalries to a 1971 match in Mexico. It isn't "beyond Buenos Aires" at all, so the title only works because the summary patches it. **Fix:** move the pioneers pages to el-diez or messi-y-qatar (the Selección classes), or rename the class.
- **[Low] Interest** — page 7 (info, pioneers): "21 August 1971", "4–1", "2019", Macarena Sánchez. That's dense, and page 8 then tests the score. **Fix:** keep Elba Selva's four goals and the Día de la Futbolista, drop 2019 and the extra names, and make page 8 test "who scored all four?" or the date meaning.
- **Keep:** the leprosos/canallas origin story and "¿Sos leproso o canalla?" are the best pages in the section.

#### la-tabla-y-el-descenso — The table, the drop and the VAR
- **[High] Teach-before-test** — vocab quiz: "descenso" = "relegation" and "irse a la B" = "to get relegated" are almost the same gloss, and "promedio" = "points average used for relegation" also says relegation. "Pick the meaning" for descenso has two defensible answers. **Fix:** gloss irse a la B as "to go down to the second division (lit. 'go to the B')" and promedio as "3-season points average".
- **[Medium] Flow** — pages 8–9 (gap "nos vamos a la ___" then TF "Irse a la B means promoted"): the same fact is tested twice in a row. **Fix:** replace the TF with one about the ascenso or the VAR, which is taught but never tested.
- **[Low] Interest** — page 2 (info): "San Lorenzo in 1981, Racing in 1983, River in 2011, Independiente in 2013" is a list of years. **Fix:** "Even four of the big five have gone down. Boca never has, and never lets anyone forget it."
- **[Low] Flow** — class order: basic words (tabla, empate, fecha) come in the last class, after two history classes. **Fix:** move this class right after hablar-de-futbol, or earlier.
- **Keep:** the promedios page and scenario are a genuinely interesting Argentine quirk, well explained.

---

<a id="tango"></a>

### Tango (`docs/culture/tango.yaml`)
**Section verdict:** Good storytelling (men dancing with men, the pucho on Gardel's statue, Pugliese's carnation) and one excellent, practical class (la-milonga). But the Gardel class ends in a five-item trivia match, the orquestas class quizzes nicknames, and almost every class has vocab items the pages never used (cantor, ídolo, barrio, bandoneonista, bárbaro, letra, extrañar, milonguero). The most useful class for a tourist, la-milonga, comes last.

#### nacido-en-el-arrabal — Born on the edge of town
- **[High] Teach-before-test** — vocab quiz: "bandoneón" = "bandoneón, the tango squeezebox" and "fueye" = "bandoneón (tango slang)". In "pick the meaning" for either word, both glosses fit, and the bandoneón gloss repeats the word it defines. **Fix:** gloss bandoneón as "German squeezebox, the sound of tango" and fueye as "slang nickname, from 'bellows'".
- **[Medium] Teach-before-test** — page 3 (choice, "Tango rioplatense") and vocab "rioplatense" and "porteño": **rioplatense** is first defined in the explain, and **porteño** ("tango isn't only porteño") is never defined. Both are vocab items. **Fix:** in page 2 write "tango isn't only **porteño** (from Buenos Aires). It's **rioplatense**: from both sides of the Río de la Plata."
- **[Low] Flow** — page 9 (choice, "Where does the bandoneón come from?"): it re-asks the page 6 title fact, and its explain repeats the Heinrich Band detail. **Fix:** ask something more interesting, e.g. "Why is the bandoneón so hard to play?" (the open/close note trick from page 7).
- **[Low] Teach-before-test** — vocab "tango" ("tango (the music and the dance)"): the gloss gives the answer away and is filler. **Fix:** drop it. "tanguero" is enough.
- **Keep:** "Men danced with men" (page 4) is exactly the kind of surprising fact that lands.

#### gardel — Gardel
- **[Medium] Teach-before-test** — vocabulary "cantor", "ídolo", "barrio": none of these appears in Spanish in the class ("singer", "neighborhood"). **Fix:** use them in the bodies ("the **cantor**", "Abasto, his **barrio**", "the country's first pop **ídolo**") or drop them.
- **[Medium] Interest** — page 9 (match, "Match the Gardel fact"): Toulouse, Tacuarembó, Medellín, Abasto, 11 de diciembre is five trivia recalls in a row. Toulouse and Tacuarembó are the same kind of answer, so it's also fiddly. **Fix:** cut it to 3 pairs and focus on what a tourist can do: Abasto → museum, Chacarita → the pucho in the statue's hand, 11 de diciembre → tango day with free milongas.
- **[Medium] Teach-before-test** — page 7 (gap, "andá a cantarle a ___"): the idiom is never taught before the gap, and the distractors Piazzolla and Pugliese haven't been introduced yet (next class). So it's trivial by elimination and teaches nothing. **Fix:** introduce the phrase in page 5 ("…and when someone won't stop whining: **andá a cantarle a Gardel**") and make this a choice about when to use it.
- **[Low] Interest** — page 8 (info, "Día Nacional del Tango"): "since 1977" and Julio De Caro are filler. **Fix:** keep "December 11, Gardel's birthday", add a practical line (the city runs free events and milongas that week), and drop De Caro.
- **[Low] Exercise logic** — page 3 (TF, "Everyone … agrees"): the absolute wording gives the answer away. **Fix:** "Most researchers say Gardel was born in Uruguay" (false) makes the learner actually recall.
- **Keep:** the pucho on the statue and "cada día canta mejor".

#### orquestas-y-piazzolla — Big bands and a rebel
- **[High] Teach-before-test** — vocabulary "bandoneonista" and "bárbaro": neither appears anywhere in the class. **Fix:** use **bandoneonista** in the Troilo or Piazzolla line, and drop bárbaro or work it into a scenario ("¡Bárbaro!" after a good tanda).
- **[Medium] Teach-before-test** — page 8 (choice) and vocab "grieta": **grieta** appears only in the explain. The choice itself is trivial, since the other options are "a fight about politics" and "a fight about football". **Fix:** introduce grieta in the page 7 body and turn the choice into "which side is the grandpa on: 'eso no es tango' or 'música contemporánea'?"
- **[Medium] Interest** — page 3 (match, bandleader to nickname): three nicknames and one style descriptor. Pugliese is the only "style" pair, so he's solved by elimination, and the learner can't infer "Pichuco". **Fix:** match each bandleader to what it sounds like or when the DJ plays it (punchy/danceable, smooth, dark/dramatic). That is useful at a milonga.
- **[Low] Interest** — page 9 (order, Piazzolla's path): biography recall. It's solvable by logic, but low value. **Fix:** fine to keep as the closer. Alternatively, swap for a choice "You hear Libertango in a café: is that tango nuevo or golden age?"
- **Keep:** the red carnation on the empty piano (page 4).

#### las-letras — What tango sings about
- **[High] Teach-before-test** — vocabulary "letra" and "extrañar": neither appears in the class. The class is about lyrics and longing, so both are easy to work in. **Fix:** "tango **letras** have favorite subjects…" and "Mi Buenos Aires querido is pure **extrañar**: missing home."
- **[High] Teach-before-test** — vocab quiz: "mina" = "woman, girl" and "percanta" = "woman (in old tangos)". In "pick the meaning" for mina, both fit. **Fix:** gloss percanta as "old tango word for a woman (dated)" and mina as "woman (everyday slang)". Or drop percanta from vocab (it's dated) and keep it in the glossary.
- **[Low] Flow** — page 1 (info): Discépolo is quoted with no introduction, then formally introduced on page 7. **Fix:** say "tango poet Discépolo" in page 1, or quote someone else.
- **[Low] Flow** — cross-section: lunfardo, mina, percanta and conventillos are taught again in habla/lunfardo, and mina is a vocab item in both. **Fix:** see habla/lunfardo.
- **Keep:** "veinte años no es nada" (page 6) and cambalache (pages 7–9) are useful and fun.

#### la-milonga — At the milonga
- **[Medium] Teach-before-test** — vocabulary "milonguero": never used in the class. **Fix:** add "the regulars, the **milongueros**, sit closest to the floor" to page 2 or page 7.
- **[Medium] Teach-before-test** — vocabulary "códigos": it appears only in the last explain. **Fix:** use it in the ronda page ("the **códigos** of the floor").
- **[Medium] Exercise logic** — page 8 (order, "A night at the milonga"): "The cortina plays" and "Say gracias and go back to your tables" are arguable in order, since you thank your partner as the tanda ends or when the cortina starts. **Fix:** merge them into one item ("The cortina plays: say gracias, back to your table") or end on "Wait for the next cabeceo".
- **[Low] Flow** — page 5 (info, "Same trap as with mate"): this depends on the learner having done the mate section. **Fix:** add half a sentence explaining the mate rule, so the page stands alone.
- **[Low] Flow** — section order: the most practical class for a tourist is last, after three history and lyrics classes. **Fix:** consider moving la-milonga to second place.
- **Keep:** the whole class. The cabeceo scenario, "gracias = I'm done" and "tango for export" are the best-landing pages in Tango.

---

<a id="musica"></a>

### Música (`docs/culture/musica.yaml`)
**Section verdict:** The live-music class (en-vivo) and the practical bits (gracias totales, peña, campo, pogo rule, bailanta) are excellent. rock-nacional and trap-y-rkt read like Wikipedia timelines: dense dates and attendance numbers, then an order exercise that is pure date recall. Vocab is the weak spot. rock-nacional quizzes four words the class never used (banda, tema, temazo, disco), and cumbia-y-cuarteto three more.

#### rock-nacional — Rock nacional
- **[Medium] Teach-before-test** — vocabulary "banda", "tema", "temazo", "disco": none of these appears in Spanish in the class, so four of seven vocab items are new at the final quiz. **Fix:** write them into the bodies ("his **banda** Almendra", "the **tema** 'La balsa'", "best-selling **disco**") and move temazo to trap-y-rkt, where the gap uses it.
- **[High] Teach-before-test** — page 10 (TF, "Charly García once jumped from a ninth-floor hotel room"): never mentioned before, so the learner can only guess. **Fix:** put the story into page 3 ("Charly is also famous for jumping from a 9th floor into a pool, and surviving"), then test it, or make it a fun_fact.
- **[Medium] Interest** — page 9 (order, rock moments): answerable only by remembering 1967/1975/1980/1982/1997 from dense pages. This is the "if the numbers are the point" case. **Fix:** cut it, or make it a 3-item order with obvious narrative logic (born in a bathroom → dictatorship → gracias totales).
- **[Medium] Flow** — pages 3–5 (three info pages in a row): "Muchacha (ojos de papel)" (1970), Nito Mestre, Luna Park 1975, 30,000, Serú Girán 1978, La Rural Dec 1980, 60,000, Obras Sanitarias. It's a wall of names and numbers. **Fix:** keep Spinetta and Charly, "singing in code" and the Malvinas paradox, drop the attendance figures, album titles and venues, and add a question between pages 3 and 4.
- **[Low] Exercise logic** — page 2 (TF, "not a genre about patriotism"): it restates the fun_fact card the learner saw a second earlier. **Fix:** test something else, or move the fun_fact later.
- **Keep:** the May 1982 radio scenario (page 6) and "gracias totales" (pages 7–8).

#### folklore — Folklore, peñas and pañuelos
- **[Medium] Interest** — page 4 (info, Atahualpa Yupanqui): birth name, 1908, Quechua etymology and a stage name. Nothing is tested and there is no hook for a tourist. **Fix:** cut it, or tie it to Cosquín ("the main stage is named after him") in one line on page 9.
- **[Medium] Interest** — page 9 (info, Cosquín): "since 1961", "Plaza Próspero Molina" is trivia. What a tourist wants is "late January, Córdoba hills, go". **Fix:** drop the plaza and year and add when and how to go. The "¡Aquí Cosquín!" shout is a good hook, so keep it.
- **[Low] Interest** — page 2 (info, La Negra): "October 1978 … La Plata", "February 1982 … Teatro Ópera" is a date-dense bio. **Fix:** "Arrested on stage during the dictatorship, exiled, came back in triumph", and keep "Gracias a la vida".
- **[Low] Teach-before-test** — vocab quiz: the "zamba" gloss "slow folk dance with handkerchiefs" competes with "pañuelo" = "handkerchief" in "pick the meaning". **Fix:** gloss zamba as "slow, flirty folk dance for couples".
- **[Low] Flow** — vocab "bombo" ("big drum") is also a vocab item in futbol/la-hinchada ("bass drum"), and this class actually taught **bombo legüero**. **Fix:** use "bombo legüero" here.
- **Keep:** the peña page and the pañuelo scenario.

#### cumbia-y-cuarteto — Cumbia and cuarteto
- **[Medium] Teach-before-test** — vocabulary "cumbiero", "bailar", "pegar": none of these appears in the class. **Fix:** use them in the bodies ("even your serious uncle starts to **bailar**", "**No me arrepiento…** **pegó** everywhere"), or drop them.
- **[Medium] Flow** — pages 4–6 (three info pages in a row: villera, cuarteto, el Potro) are full of dates and names (2000, 1943, Leonor Marzano, December 2025, June 24, 2000, age 27). **Fix:** put the Córdoba wedding choice (page 8) right after the cuarteto page and trim the dates.
- **[Medium] Interest** — page 7 (match, artist to story): five names, and "Rodrigo → 'el Potro', died at 27" gives itself away. Leonor Marzano is trivia. **Fix:** cut it to 3 pairs, or switch to "match the genre to where you'd dance it" (bailanta/cumbia, baile/cuarteto, peña/folklore). That builds on page 9.
- **[Low] Teach-before-test** — vocab "cumbia" ("cumbia (dance music)"): the gloss gives the answer away. **Fix:** "Colombian-born dance music, the sound of every Argentine wedding".
- **Keep:** Gilda as a santa popular, the Córdoba wedding scenario and the bailanta/peña/cancha gap.

#### trap-y-rkt — Trap, RKT and Bizarrap
- **[High] Exercise logic** — page 9 (gap, "¡Qué ___! No paro de escucharlo."): "¡Qué tema!" is a perfectly natural exclamation of praise, so two options fit. Also, **temazo** and **-azo** were never taught in this class. **Fix:** replace "tema" with a wrong-meaning option (e.g. "trapo"), and introduce temazo in a body.
- **[Medium] Interest** — page 8 (order, 2012/2019/2020/2023/2024): pure date recall of things taught once, in passing. **Fix:** cut it. The match on page 7 already covers these artists.
- **[Medium] Interest** — pages 5 and 7 (info "The new stars" + match): "first Argentine to headline the Bernabéu" and "first Argentine woman to headline River" are record-trivia, and "woman" gives María Becerra away. **Fix:** tell the learner what to *listen to* ("a Biza session to start with", "the song you'll hear at every party") instead of records.
- **[Medium] Teach-before-test** — page 10 (TF, "la rompió") and vocab "romperla": taught only in the explain. **Fix:** put **la rompió** in the page 5 body ("María **la rompió** at River, twice").
- **[Medium] Teach-before-test** — vocabulary "batalla" and "artista": never appear in Spanish (the pages say "rap battles"). "trap" = "trap (music)" is filler. **Fix:** write "**batallas** de freestyle" on page 1, and drop artista and trap.
- **[Low] Exercise logic** — page 4 (choice, "¿Viste la nueva sesión de Biza?"): "TV series" and "gym" are joke distractors, so the question is trivial. **Fix:** acceptable as a light check. Otherwise add "If you saw Bizarrap in person".
- **Keep:** El Quinto Escalón (page 1) is a great origin story.

#### en-vivo — Live: pogo, bengalas and misas
- **[Medium] Teach-before-test** — page 4 (gap, "¡Otro, ___!"): the encore chant "¡otro, otro!" is never taught. Page 3 teaches "olé, olé" instead, and the page 10 order says the crowd chants "olé, olé" for more. **Fix:** add "and when they leave: **¡otro, otro!**" to page 3, and make the page 10 item say "¡otro, otro!".
- **[Medium] Teach-before-test** — vocabulary "entrada": it appears only untranslated inside the page 2 scenario ("Tengo dos entradas para campo"). **Fix:** add **entradas** (tickets) to the page 1 body.
- **[Low] Teach-before-test** — vocab quiz: "pogo" = "mosh-style jumping at a show" and "pogear" = "to jump in the pogo" are close. Only "to" separates them. **Fix:** gloss pogear as "to mosh".
- **[Low] Flow** — pages 7–8 (misas + Cromañón): the jump from a festive fun_fact ("biggest pogo in the world") to 194 deaths is abrupt. **Fix:** put a question between them, or add a transition line ("The flares had a dark side").
- **Keep:** the whole class. recital/campo/telonero, the pogo rule and the Cromañón page (handled with the right weight) are among the best in the file set.

---

<a id="habla"></a>

### Cómo hablamos (`docs/culture/habla.yaml`)
**Section verdict:** This is the most useful section for a tourist, and mostly excellent: vos, che, the telo trap, re/posta and the gestures all pay off right away. The problems are one date-trivia match in lunfardo, an order exercise with an arguable answer (muy vs re), a few vocab glosses that collide in "pick the meaning", and a lunfardo class that re-teaches what the tango section already covered.

#### vos-sos-vos — Vos, not tú
- **[Medium] Teach-before-test** — page 5 (TF, "Argentine schools have always taught kids to use vos"): schools are never mentioned before the quiz, and the absolute "always" gives the answer away. The 1982 fact lives only in the explain. **Fix:** add one line to page 4 ("schools kept teaching tú for decades") or cut the TF.
- **[Low] Teach-before-test** — page 3 (match) explain: the key rule "vos forms never change the vowel inside (no *tienes*)" appears only in an explain. **Fix:** move it into the page 2 body. It's the most useful sentence in the class.
- **Keep:** the kiosco and grandma scenarios (pages 7 and 9) are perfect: practical and nuanced.

#### sho-y-che — Sho, che and the melody
- **[Medium] Teach-before-test** — vocabulary "lluvia": never appears in the class. **Fix:** add it to the sho examples ("**lluvia** is 'shuvia'") or drop it.
- **[Medium] Teach-before-test** — vocabulary "¿viste?" = "you know?, right? (filler)": the class only shows it as "¿viste lo que pasó?" (did you see), never as a filler. **Fix:** add a line to the che page ("and **¿viste?** at the end of any sentence = you know?").
- **[Medium] Exercise logic** — page 4 (gap, "Nos vemos en la ___ Corrientes"): it isn't really a gap question, since "plaza" also fits the sentence. The actual question (which word has the sh sound) doesn't depend on the gap at all. **Fix:** turn it into a choice: "Which word would a porteño say with 'sh'?" with calle / casa / plaza.
- **[Medium] Interest** — page 7 (choice, origin of che): it quizzes an etymology that page 6 says nobody agrees on. The distractors (chap, chévere, ciao) are silly, and **chau** (a vocab item) is taught only in the explain. **Fix:** drop the choice and teach chau ← ciao in a body line. Or ask "What's the most porteño way to call a waiter's attention?"
- **[Low] Interest** — page 8 (info, "Spanish with an Italian tune"): researcher names and affiliations (Gurlekian, CONICET, Colantoni, Toronto) are filler. **Fix:** "Researchers found it's closer to Neapolitan Italian than to Spanish from Spain", with no names.
- **[Low] Exercise logic** — page 3 (TF, "All Argentines…"): the absolute wording gives it away. **Fix:** "Only porteños say 'sho'. The rest of Argentina says 'yo'" (false: Montevideo and much of the country do too), or cut it.
- **Keep:** "Sho me shamo", the zh vs sh generational shift, and the "¡Che, Martín!" scenario.

#### lunfardo — Lunfardo
- **[High] Interest / Teach-before-test** — page 9 (match, "Match each lunfardo milestone to its year"): 1953 (Gobello, "Lunfardía"), 1962 (Academia) and 2000 (Día del Lunfardo) are never taught before the match, and the page is pure date trivia. The "first tango-canción" item is the only one that was taught. **Fix:** cut the page. If the academy is worth a mention, make it a fun_fact ("Yes, slang has its own academy").
- **[Medium] Flow** — pages 1–3 (three info pages in a row). Page 3 crams 8 words (guita, mango, pibe, mina, bondi, laburo, morfar, fiaca) into one card. **Fix:** split the starter pack across two pages with the match in between, or cut it to 5 words and use laburo later.
- **[Medium] Flow** — cross-section repetition with tango/las-letras (lunfardo = street slang, tango spread it, **mina**, **percanta**) and tango/nacido-en-el-arrabal (**conventillos**). **mina** is a vocab item in both classes. **Fix:** in one place, say "you met lunfardo in Tango". Keep mina as vocab only here (it's the everyday word) and drop it from tango/las-letras.
- **[Medium] Teach-before-test** — vocab quiz: "guita" = "money" and "mango" = "a peso, a buck" are both money. In "pick the meaning" for guita, "a peso, a buck" is defensible. "chamuyo" = "smooth talk, baloney" vs "chamuyar" = "to sweet-talk, to flirt" is the same problem, milder. **Fix:** gloss mango as "a single peso (as in 'no tengo un mango' = I'm broke)". Consider replacing chamuyar with laburo (taught, but not in vocab).
- **Keep:** the bondi etymology (page 5) and the "sin un mango, ¿morfamos en casa?" scenario, a good trap with "mango for dinner".

#### vesre-re-posta — Vesre, re and posta
- **[High] Exercise logic** — page 9 (order, "Es lindo / muy lindo / re lindo / recontra lindo"): page 5 teaches **re** as just "very", the local way of saying **muy**, and the explain says re is "how people actually talk", not stronger. So muy vs re has no defensible order. **Fix:** drop "Es muy lindo" and order lindo → re lindo → recontra lindo, or add a clearly stronger item ("¡Es lo más lindo del mundo!").
- **[Medium] Exercise logic** — page 6 (gap, "¡Estuvo ___ bueno!"): "¡Estuvo tan bueno!" is a natural exclamation ("It was so good!"), and the explain half-admits it. **Fix:** replace "tan" with a clearly wrong option (e.g. "posta").
- **[Medium] Teach-before-test** — vocab quiz: "re" = "very, really" and "recontra" = "super, extremely" are interchangeable in "pick the meaning". **Fix:** gloss recontra as "extremely (re, turned up further)", or drop one of the two from the vocab.
- **[Low] Teach-before-test** — page 2 (match): **telo** and **garpar** appear for the first time in the match. They're solvable with the flip rule, which is fine, but the class relies on that. **Fix:** optional. Name them in page 1 ("**telo**, and you'll see why that matters").
- **Keep:** the telo trap (pages 3–4) is the funniest and most useful page in the section.

#### manos-y-chat — Hands and texts
- **[High] Teach-before-test** — vocab quiz: "ni ahí" = "not at all, no way" and "nada que ver" = "not at all, that's got nothing to do with it" both start with "not at all", so "pick the meaning" is ambiguous. **Fix:** gloss ni ahí as "no way!" and nada que ver as "that's not it at all / totally unrelated".
- **[Low] Flow** — title "Hands and texts": pages 8–10 (ni ahí, nada que ver) are neither gestures nor texting. **Fix:** frame page 8 as "two phrases you'll text all the time", or retitle the class.
- **Keep:** the montoncito scenario ("The food here is delicious" is a great distractor) and the "bue" scenario.

---

<a id="dichos"></a>

### Dichos y refranes (`docs/culture/dichos.yaml`)
**Section verdict:** Solid and fun. The scenarios ("Messi shirts for almost nothing", "fridge door held shut with a belt") are exactly right. The weak spot is `refranes`: those are pan-Hispanic proverbs with no Argentine hook, crammed 3 per info card. The vocab lists are made of long whole phrases, so the auto-quiz stays readable, but it is heavy for a beginner.

#### expresiones-del-dia — Everyday expressions
- **[Low] Teach-before-test** — page 4 (choice, "¡Me tomás el pelo!"): the distractor uses *tomar el pelo*, which is only taught on page 5. It's harmless as a wrong option, but the learner sees an unknown phrase. **Fix:** swap it for "¡Qué garrón!"-style filler already seen, or move the "Pulling your hair" info before this question.
- **[Low] Interest** — page 9 (true_false, "they're probably cooking"): this is a joke check with zero difficulty right after a match that already tested *estar al horno*. **Fix:** replace it with a scenario that uses *mala onda* (taught, in vocab, never exercised).
- **Keep:** the ficha / pay-phone origin card and the *al horno con papas* escalation. Memorable and useful.

#### mas-que — Más perdido que turco en la neblina
- **[Medium] Exercise logic** — page 3 (choice, "Más aburrido que un bombón"): this distractor is a garbled version of the taught *más aburrido que chupar un clavo*. It teaches a phrase that doesn't exist and looks like a trap for anyone half-remembering page 2. (The real *aburrido* phrase would also fit a 4-hour wait, which is probably why it was mangled.) **Fix:** use a different real taught phrase as the distractor, e.g. "Más trucho que billete de tres pesos", or a scenario where boredom clearly isn't the point.
- **[Low] Flow** — pages 7–8 (match then choice, "perro con dos colas"): the choice re-tests the phrase that was matched one screen earlier. The same goes for page 8's true_false on *trucho*, already tested by the gap. **Fix:** make the final choice about *se cree la última Coca-Cola* or *más largo que esperanza de pobre* in a new situation. Drop the "Trucho means fake" true/false, which is just recall.
- **[Low] Tone** — page 1 (fun_fact, "'Turco' was the loose name…"): it explains the label but never says it's an ethnic generalization. **Fix:** add half a line: "old-fashioned, and a bit of a stereotype".

#### refranes — Grandma's refranes
- **[Medium] Interest** — pages 4 and 6 (info "Birds and horses", "Said and done"): these are 6 generic Spain-wide proverbs, 3 per card, and most have exact English twins, so there's nothing Argentine. Page 1 promises "Argentines tweak them with their own vos verbs", but no example is ever shown. **Fix:** cut to 4–5 refranes. Show one real Argentine twist or the "say the first half and let them finish" habit, which currently hides in page 9's explain and is the most interesting fact in the class.
- **[Low] Exercise logic** — page 5 (order, "Más vale / pájaro en mano / que cien / volando"): the capitalised "Más vale" marks the first chunk. It's also pure copying of a sentence seen one card earlier. **Fix:** lowercase all chunks, or replace it with a "finish the refrán" choice, which matches how people actually use them.
- **[Low] Teach-before-test** — page 3 (choice): two of the three options ("Al que madruga…", "Más vale pájaro…") are only taught on page 4. **Fix:** move the choice after page 4, or use distractors already taught.

#### filosofia-criolla — Argentine philosophy in six sentences
- **[Medium] Flow** — page 4 (info, "Remember the vivo and the gil?"): this relies on `puteadas/gil-forro-chanta`, a different section the learner may not have done. **Fix:** drop "Remember" and define both words inline (it's already half-done).
- **[Medium] Flow (cross-section repetition)** — page 4 (*viveza criolla*) is taught again, with the identical vocab gloss "Argentine cunning, cutting corners", in `costumbres/sin-filtro` (2 info pages + match). **Fix:** keep the full treatment in one place (here fits better) and have the other class reference it briefly or drop it.
- **[Low] Flow** — pages 8–9 (match "The fridge door is held shut with a belt" then choice "tape and a plastic bag"): *atado con alambre* is tested twice in a row with the same kind of scenario. **Fix:** make the last choice about *el que no llora, no mama* or *Dios es argentino*.
- **Keep:** the whole class. The match scenarios are great, and the *siempre que llovió, paró* gap is warm and useful.

---

<a id="puteadas"></a>

### Puteadas (`docs/culture/puteadas.yaml`)
**Section verdict:** The most engaging section: honest, funny, and `leer-el-contexto` is a genuinely useful "reading the room" class. The big gap is that it never gives a clear per-word verdict for a tourist ("you can say this" vs "understand it, never say it"). Several vocab sets also have near-identical glosses that break the auto-quiz.

#### boludo — Boludo, the word that does everything
- **[Medium] Flow (tourist safety)** — whole class: the reader learns boludo can be friendly or hostile, but never gets the bottom line for a foreigner with an accent. Should they say it to a waiter or a stranger? Never, and even with new friends it can land wrong. The only hint is buried in page 4's explain ("Don't say it back until you know him well"). *Pelotudo* has no "never say this" either. **Fix:** add a short card or fun_fact: "Tourist rule: understand boludo, use it only once friends use it with you; pelotudo, never."
- **[Medium] Exercise logic** — page 4 (choice, "He's being overly casual: odd, but probably not an insult"): the correct option is by far the longest and most hedged, and the others are jokes ("quit now", "the formal way"). **Fix:** use three short options of similar length, e.g. "An insult" / "Just casual talk" / "A formal expression".
- **[Medium] Teach-before-test (auto-quiz)** — vocab: *boludo* = "dude… / idiot (in anger)" and *pelotudo* = "idiot (stronger…)" both contain "idiot". *puteada* = "swear word, insult" and *putear* = "to swear (at someone)" are also near-twins. *boluda* = "the feminine of boludo" gives itself away. **Fix:** drop *boluda* from vocab (put it in the glossary), gloss *pelotudo* as "jerk, real idiot (never friendly)", and drop *puteada* or *putear*.
- **[Low] Interest** — page 1 (fun_fact, "Many visitors say they hear more swearing…"): this is filler. **Fix:** use the "boludo as a comma" line here instead, or the fact that *boluda* between women friends is super common.

#### gil-forro-chanta — Gil, forro, chanta: the cast of characters
- **[High] Teach-before-test (auto-quiz)** — vocab: *hinchapelotas* and *rompebolas* both have en = "pain in the neck, pest", word for word. The match pairs and "pick the meaning" end up with two identical answers. **Fix:** keep one in vocab and move the other to the glossary, or gloss them differently ("pest, nag" / "ball-breaker, pain").
- **[Medium] Flow (tourist safety)** — pages 1–6: there's no verdict on which words a visitor can use. *Gil* and *chanta* are fairly safe for joking. *Forro* is character assassination. *Pajero* literally means wanker. Only *pajero* gets "keep it among friends". **Fix:** add a one-line safe/risky tag per word (e.g. use the `word.tag` field), or a closing card: "Safe to joke: gil, chanta. Careful: forro, pajero."
- **[Low] Exercise logic** — page 9 (choice, "Boludez" as a person option): a joke distractor that isn't a person. **Fix:** use "Chanta" instead, which is a real near-miss (he promised and didn't deliver).
- **Keep:** page 5 (the taxi scenario, "you're the gil"). It's a perfect lesson for tourists.

#### la-puta-madre — La puta madre: pure frustration
- **[High] Teach-before-test** — page 3 (order, "¡Pucha!"): the learner must rank *¡Pucha!* as the mildest, but euphemisms are only taught on page 7. The "(at someone)" annotation also acts as a sort clue for the last item. **Fix:** move the order after the "family-friendly versions" card, and drop the parenthetical or give every item one (e.g. "(alone)" vs "(at someone)").
- **[Medium] Flow** — page 4 (info "Dismissals"): too many phrases in one card: *andá a cagar*, two meanings, *me chupa un huevo*, *me importa un carajo*, *tres carajos*, *y la mitad del otro*. **Fix:** split it: *andá a cagar* (with its two meanings) on one card, *me chupa un huevo* + deluxe version on another. Put *carajo* in the glossary only.
- **[Medium] Teach-before-test (auto-quiz)** — vocab: *la pucha* = "darn it! (polite stand-in for 'la puta')" will show up as a distractor when asked about *la puta madre*, and it literally contains "la puta". *me chupa un huevo* ("I don't give a damn (crude)") vs *me importa un pito* ("I couldn't care less (tamer)") differ only by the tag. *la puta madre* ("damn it!") vs *miércoles* ("shoot!") vs *la pucha* ("darn it!") are three synonyms. **Fix:** reduce the frustration set to 2 vocab items, and move the rest to the glossary.
- **[Medium] Flow** — glossary inconsistencies across classes confuse the "same words, different tone" message. In `leer-el-contexto`'s glossary, *¡Dale, boludo!* = "come on, dude!", but the class teaches it in traffic as "Come on, idiot!". *andá a cagar* = "go to hell (very rude)", while this class teaches it as "get lost / no way! among friends". **Fix:** align the glosses with what the pages teach.

#### leer-el-contexto — Reading the room
- **[Medium] Exercise logic** — page 7 (choice, "¡Miércoles, qué lástima!"): at a bar with friends, *miércoles* is tame but not wrong. "Which reaction fits in?" makes two options defensible. **Fix:** ask "Which reaction sounds most like your friends?", or replace the option with something clearly off (e.g. "¡Qué pelotudo el arquero, la concha de tu madre!" aimed at a friend).
- **[Medium] Exercise logic** — page 8 (order, "coworkers at an after-office / new boss / girlfriend's grandma"): boss vs grandma for "keep it clean" is arguable, and people will reasonably disagree. **Fix:** use 3 items with clear gaps (friends at the cancha → coworkers at an after-office → a job interview).
- **[Low] Exercise logic** — page 9 (match, "at the stadium" ↔ "¡Cobrá, referí!"): the pair gives itself away (referee → stadium). The prompt also says "place", but "surprising news from a friend" isn't a place and *la pucha* isn't a puteada. **Fix:** reword the prompt to "Match the situation to what you'd hear".
- **[Low] Tone** — page 2 (true_false, "Singing along to every stadium chant is fine"): a slightly preachy, obvious false. **Fix:** fold the warning into page 1 and use a scenario instead ("The whole stand starts a chant you don't understand. What do you do?").
- **Keep:** the "abuela test" card and the ravioles choice. These are the clearest "when to keep your mouth shut" moments in the section.

---

<a id="costumbres"></a>

### Costumbres (`docs/culture/costumbres.yaml`)
**Section verdict:** The most useful section for a tourist. The kiss, Argentine time, the previa, the check and the gauchada are all things they'll actually hit in the first week. It gets weaker where it turns into a history quiz (`el-calendario`'s dates, the Mafud book), and the vocab lists repeatedly include words the class never mentions.

#### el-beso — Hello, with a kiss
- **[Medium] Teach-before-test** — page 2 (true_false, "Two Argentine men… never a kiss"): page 1 only implies men kiss ("the new guy at work"). The key facts (men kiss friends, brothers, fathers; kiss plus a pat on the back) live only in the explain. **Fix:** add one line to page 1 ("Yes, men too") and keep the T/F as a check, or turn the explain's content into its own card.
- **[Medium] Teach-before-test** — vocab: *el cachete* and *chau* never appear on any page. The learner first meets them in the final quiz. **Fix:** mention *en el cachete* on page 1 ("cheek to cheek, **cachete** a **cachete**") and *chau* on page 3 ("and again when you leave: **chau**"), or drop them.
- **[Medium] Teach-before-test (auto-quiz)** — vocab: *¿Qué hacés?* = "Hi, what's up?" and *¿Cómo andás?* = "How's it going?" are interchangeable in "pick the meaning". **Fix:** gloss *¿Qué hacés?* as "hi (lit. 'what are you doing?')" to anchor it to the literal meaning taught on page 6.
- **[Low] Exercise logic** — page 8 (match, "Saludar a todos"): not a greeting, so it doesn't fit "Match the greeting to what it really means". **Fix:** reword the prompt to "Match the phrase…".
- **Keep:** pages 3–4 (greet all fifteen people) and "¿Qué hacés?" isn't a question. Very practical.

#### la-hora-argentina — Argentine time
- **[Medium] Teach-before-test** — page 6 (gap, "tomar / beber / comer"): *beber* is grammatical and means "drink", so it's only "wrong" because of the explain ("Argentines toman, they don't beben"). No page taught that. **Fix:** say it on page 5 ("to drink is **tomar** here, not *beber*"), or replace *beber* with a non-drink distractor.
- **[Medium] Teach-before-test (auto-quiz)** — vocab: *ya salgo* ("I'm leaving now…"), *me voy yendo* ("I'm getting going") and *irse a la francesa* ("to leave without saying goodbye") are three "leaving" glosses. The first two are near-synonyms for a beginner. **Fix:** gloss *ya salgo* as "on my way (really: not yet)" and *me voy yendo* as "time for me to go (the start of a long goodbye)".
- **[Low] Exercise logic** — page 9 (order, "Accept another drink / Kiss everyone… / Keep chatting at the door"): the middle steps are arbitrary. It's rote recall of one sentence, and "Walk out the door" is obviously last. **Fix:** use a choice instead: "You said 'me voy yendo' 10 minutes ago and someone pours you another glass. Is that normal?"
- **Keep:** "Ya salgo" decoding and the choice about 21:40. Funny and true to life.

#### salir-de-noche — Going out
- **[Medium] Teach-before-test** — vocab: *trasnochar* never appears in the class (it's also in `buenos-aires/vida-portena` vocab, where it's also never taught). **Fix:** add "staying up till six — **trasnochar** — is normal" to page 1, or drop it.
- **[Medium] Teach-before-test** — page 8 (match, "salir a bailar"): first appearance of the phrase is inside the match. The same goes for "pista" and "medialunas" in page 5's order items (medialunas are only explained in its explain). **Fix:** use *salir a bailar* on page 1 ("nobody **sale a bailar** before 2"), and swap "pista" for "dance floor".
- **[Medium] Flow** — pages 1, 3, 4 (info "The night starts late", choice "Tomi in his pajamas", true_false "Boliches… 9 or 10 p.m."): three screens all testing "it starts late". **Fix:** drop the T/F, or change it to something else (e.g. entry, dress code, the *previa* being the best part).
- **[Low] Exercise logic** — page 5 (order, "Coffee and medialunas… on the way home"): "on the way home" is a sort clue, and the whole sequence is self-evident (dinner → pregame → club). **Fix:** fine as a confidence boost, but remove "on the way home".
- **[Medium] Teach-before-test (auto-quiz)** — vocab: *salir* ("to go out (at night)") vs *salir a bailar* ("to go out dancing") are near-duplicates. **Fix:** drop *salir*.
- **Keep:** page 3 ("Tomi in his pajamas, eating dinner"). A great scenario.

#### sin-filtro — No filter
- **[High] Teach-before-test (auto-quiz)** — vocab: *¿Cuánto pagaste?* = "How much did you pay?" and *¿Cuánto te salió?* = "What did it cost you?" mean the same thing, so "pick the meaning" has two right answers. **Fix:** keep one, and put the other in the glossary.
- **[Medium] Teach-before-test** — page 4 (true_false explain, "**Flaco** (skinny) is also a common way to call a guy…"): *flaco* is taught only in an explain, then quizzed as vocab. **Fix:** add it to the page 2 body ("…and **flaco** is how you call out to a stranger").
- **[Medium] Interest / Flow** — pages 5–7 (three info cards in a row: "Viveza criolla", "The two sides", "The flip side"): an abstract sociology debate right in the middle of a practical class. "In 1965 the sociologist **Julio Mafud** wrote a whole book" is trivia nobody will remember. The topic is also taught in `dichos/filosofia-criolla`. **Fix:** cut viveza here to one line that points to the gauchada ("the opposite of viveza"), drop Mafud, and let the gauchada card carry the section.
- **[Low] Interest** — pages 1–2 (money talk): there's no "what do I do" angle for the tourist. **Fix:** add a quick choice: "Someone asks how much your rent is. Weird?" (not weird; answering is fine).
- **Keep:** the gauchada card and "¿Me hacés una gauchada?". Warm and immediately usable.

#### navidad-en-verano — Christmas in summer
- **[High] Exercise logic** — page 6 (order, "Nochebuena, in order"): the last item, "Pan dulce and turrón at the table", has no defensible slot. Page 2 never said dessert comes after presents, and turrón plausibly comes before midnight. "Brindis → fireworks" is simultaneous per page 4. **Fix:** cut it to 3 clearly sequenced items (dinner → brindis at midnight → presents), or replace it with a choice: "It's 00:05 on the 25th. What's happening?".
- **[Medium] Teach-before-test** — vocab: *los fuegos artificiales* and *las fiestas* never appear in Spanish on any page (only the English "fireworks"). *sidra* first appears inside the page 3 match (page 2 says "cider"). **Fix:** bold **sidra** on page 2, use **fuegos artificiales** on page 4, and mention **las fiestas** on page 7, or drop them from vocab.
- **[Low] Interest** — page 8 (gap, "¡Feliz ___!"): the prompt says "midnight on 24 December", so this is trivial. **Fix:** ask for Año Nuevo on the 31st instead, or gap *brindis*.
- **[Low] Interest** — page 7 fun_fact (Reyes Magos, shoes and grass): a nice fact, but it arrives on a card about the office paper rain, which is a fading trivia item. **Fix:** lead the card with "January = everyone at the beach, the city empties" (useful for tourists) and trim the paper rain.
- **Keep:** page 9's choice (hot turkey vs vitel toné at 34 °C). It captures the whole class.

#### el-calendario — The calendar
- **[High] Teach-before-test** — page 8 (match, "Third Sunday of October" ↔ "Día de la Madre"): Mother's Day is never taught. It appears first in the match and is only explained afterward. **Fix:** add it to an info card (the "October, not May" surprise is a good fact), or drop the pair.
- **[Medium] Interest** — pages 1–4 (Día del Amigo "20 July 1969… Enrique Febbraro… a thousand letters to a hundred countries"; "Sarmiento… remains came back… September 1888"; Carnaval "removed in 1976… back in 2011… up to three feriados puente"): these are dates, names and laws. Page 2's true/false then tests the origin trivia again. The tourist angle is missing: on 20 July restaurants are full and you should text friends "¡Feliz Día del Amigo!", and long weekends mean full buses and hotels. **Fix:** keep one origin line per holiday and replace the rest with what happens that day and what to say. Swap the T/F for "It's 20 July and your Argentine coworker texts you. What does she say?".
- **[Medium] Exercise logic** — page 9 (gap, "Que los cumplas ___, que los cumplas feliz…"): the answer is printed in the same line. **Fix:** gap the ear-pull instead ("el tirón de ___"), or show only the first line.
- **[Medium] Teach-before-test** — page 7 (choice explain, "Early birthday wishes are **yeta**"): *yeta* is taught only in the explain and then appears as vocab. **Fix:** put **yeta** on page 6 ("it's **yeta**, bad luck").
- **[Low] Teach-before-test** — vocab *el finde largo*: the page teaches "fines de semana largos", and "finde" is never shown. **Fix:** say "**finde largo**" on page 4.
- **[Low] Interest** — page 8 (match, dates ↔ celebrations): this is a date-recall exercise. **Fix:** match the celebration to what people do (ear pull, texting friends, picnics in the park).
- **Keep:** the "never wish happy birthday early" card and choice. A surprising rule that a visitor could easily break.

---

<a id="buenos-aires"></a>

### Buenos Aires (`docs/culture/buenos-aires.yaml`)
**Section verdict:** Useful in the practical classes (`moverse`, the café check, the motochorro, "el interior") and a guidebook in the rest. `barrios` and `iconos-de-la-ciudad` are dates, heights and names, with matches that test recall of years. Vocab lists repeatedly include words the pages only give in English.

#### portenos — Porteños and everyone else
- **[High] Teach-before-test** — page 3 (choice, "Mañana voy a Capital…"): the question hinges on "Capital" meaning the city, but page 2 only taught *CABA*. "Capital" first appears in the explain. The distractors "national capital building" and "La Plata, the provincial capital" are real traps for someone never told. Also, "To a bank" is defensible, since *trámites* often happen at a bank. **Fix:** add "people in the suburbs just call it **Capital**" to page 2, and replace "To a bank" with a clearly wrong place.
- **[Medium] Teach-before-test (auto-quiz)** — vocab: *porteño* ("from the city of Buenos Aires") vs *Capital* ("the city of Buenos Aires (said from the suburbs)"), and *la provincia* ("the Province of Buenos Aires") vs *el conurbano* ("the suburbs around Buenos Aires") are pairs of near-identical glosses. **Fix:** gloss *porteño* as "a person from Buenos Aires city", and *la provincia* as "the province around the city (capital: La Plata)".
- **[Low] Interest** — page 2 (fun_fact, "…elect its own mayor… after the 1994 constitutional reform"): civic trivia. **Fix:** replace it with something a visitor feels, e.g. "Cross General Paz and your city bus fare changes."
- **[Low] Exercise logic** — page 5 (true_false, "…is a compliment"): obvious after page 4 said "It's a dig". **Fix:** drop it or turn it into a "who would say this?" choice.
- **Keep:** page 8 (the Mendoza "el interior" eyebrow). Exactly the kind of social landmine a tourist wants to avoid.

#### barrios — A city of barrios
- **[Medium] Interest** — pages 1, 3, 6, 7 (info): years and names are packed in: "In 1959… Benito Quinquela Martín… Juan de Dios Filiberto", "started in 1970 with just 30 stalls", "opened in 1822… Rufina Cambaceres… 1902", "Marino Santa María… Pasaje Lanín", "Taiwanese immigrants in the 1980s". Page 2's T/F ("Caminito got its name from a tango") and page 7's choice ("check the official map of the 48 barrios") test trivia and official boundaries nobody needs. **Fix:** give each barrio a "go here for / when / watch out" angle: San Telmo on Sunday, stay on Caminito in La Boca, Recoleta's cats and Evita. Replace page 7 with the fun bit hidden in its explain: **once** = eleven, from the *Once de Septiembre* station.
- **[Medium] Flow** — page 6 (info, "Once, Villa Crespo, Barracas, Barrio Chino"): four barrios, two proper names and a street in one card. It's a wall. **Fix:** split it, or cut Barracas.
- **[Medium] Teach-before-test** — vocab: *adoquines* and *la esquina* never appear in Spanish (page 3 says "cobblestones" in English, page 3 "on the corner" in English). *pasaje* appears only as the proper name "Pasaje Lanín", with no meaning given. **Fix:** bold them where the English appears ("**adoquines** (cobblestones)", "tango dancers on the **esquina**"), or drop them.
- **[Low] Interest** — vocab *chapa*, *bóveda*: low value for a tourist. **Fix:** consider *feria*, *mirar nomás*, *esquina* plus one or two travel words.

#### moverse — Bondi, subte, tacho
- **[High] Exercise logic + Teach-before-test** — page 9 (gap, "¿Me ___ en Plaza Italia?"): *¿Me deja en…?* is never taught before this page. "baja" is arguably defensible to a learner ("¿Me bajo…?"-like, "will you let me off"). **Fix:** teach "**¿Me deja en…?**" on page 4, and replace "baja" with a clearly wrong verb.
- **[High] Teach-before-test (auto-quiz)** — vocab: *colectivo* = "city bus" and *bondi* = "bus (slang)". When asked about *bondi*, "city bus" is also correct. **Fix:** gloss *bondi* as "the bus (slang for colectivo)" and keep *colectivo* only in the glossary, or drop one from vocab.
- **[Medium] Interest / Flow** — pages 1–3: the class opens with a date ("24 September 1928", "Rivadavia and Lacarra") and an etymology, then a T/F that re-tests the etymology ("originally meant tram"). The practical content only comes on page 4. **Fix:** open with "Wave, tell, tap", keep the 1928 story as a fun_fact, and drop the bondi T/F.
- **[Medium] Flow** — page 4 (info "Wave, tell, tap"): parada, chofer, SUBE, contactless since 2025, timbre, back door, and la cola all in ~75 words. **Fix:** split it into "Getting on" and "Getting off / the cola".
- **[Low] Interest** — page 7 (info, "1 December 1913… a rule since 1966"): dates. **Fix:** keep "oldest in Latin America", drop the exact dates, and add something useful (e.g. the subte closes around 11 p.m.).
- **Keep:** page 6 (the sacred *cola*, "¡Hay cola, eh!"). This is the best tourist-survival question in the section.

#### iconos-de-la-ciudad — Obelisco, Colón and a pink house
- **[Medium] Exercise logic / Interest** — page 3 (true_false, "Guinness lists Brasília's Eixo Monumental as the widest avenue"): a trick question. Guinness *does* list the Eixo Monumental, so the statement is false only on a fine-print technicality, and it's pure trivia. **Fix:** drop it, and replace it with the fun_fact angle: "You try to cross 9 de Julio on one green light. What happens?".
- **[Medium] Interest** — page 8 (match, "built in 31 days in 1936", "opened in 1908 with Aida", "since 1858"): date recall. It's also trivially solvable by keywords ("Café Tortoni" ↔ "oldest café"). **Fix:** match each landmark to what you do there: celebrate a World Cup at the Obelisco, the cheap *paraíso* seats at the Colón, sit for two hours at the Tortoni.
- **[Medium] Interest** — page 1 (info, "1936… 31 days… 67.5 m… 1939 the city council actually voted…"): the stat pile buries the nice story (they almost tore it down; now it's where everyone celebrates). **Fix:** keep the story and cut the numbers.
- **[Medium] Teach-before-test** — vocab: *la humedad* appears only in page 4's choice explain, *la cuenta* only in page 7's choice explain, and *la Rosada* never appears. **Fix:** move *la cuenta* ("¿Me traés la cuenta?") into the Tortoni card, mention humidity in the Casa Rosada card, and drop *la Rosada* or use it once.
- **[Low] Exercise logic** — page 7 (choice, "In Buenos Aires you ask for the check; bringing it unasked is almost rude"): the right answer is the long, explanatory one, and page 6 said it directly. **Fix:** shorten the options to similar lengths.
- **Keep:** the Casa Rosada / cow's-blood card and choice. A myth vs. messy reality, told well.

#### vida-portena — Life in the ciudad de la furia
- **[Medium] Teach-before-test** — vocab: *trasnochar* is never mentioned in this class (and is a duplicate of `costumbres/salir-de-noche`'s vocab). **Fix:** drop it.
- **[Medium] Teach-before-test** — page 8 (gap, "___ con el celu"): *¡Ojo!* is introduced only in page 7's explain ("¡Ojo con el celu!"). The same goes for *hacer terapia* (page 2 explain) and *estar atento* (page 7 explain), both in vocab. **Fix:** put **¡Ojo!** and **celu** in the motochorro card body, and **hacer terapia** in the psicólogo card.
- **[Medium] Flow (repetition)** — page 5 (choice, "temprano, tipo nueve y media"): dinner at 9:30–10 isn't taught in this class, and it's already taught in `costumbres/la-hora-argentina` and `costumbres/salir-de-noche`. The explain's "catch them in the shower" reuses the costumbres joke. **Fix:** cut it, or replace it with something from this class (Corrientes pizza at midnight).
- **[Medium] Flow** — whole class: a grab bag (therapy → dog walkers → a bookshop → dinner time → thieves) with abrupt jumps and no through-line. **Fix:** frame it as "5 things you'll notice in your first week", or split it into "quirks" and "street smarts".
- **[Low] Interest** — page 1 ("a 2016 WHO report counted about **222 per 100,000**") and page 3 ("cap it at **8 dogs**… more than 3 is supposed to be registered"): stats and laws. **Fix:** "more psychologists per person than almost anywhere" is enough. For dogs, the useful bit is "they get the sidewalk: step aside".
- **Keep:** the motochorro card and the phone-on-the-table choice. This is the most important safety content in the four files.

---

<a id="regiones"></a>

### Las provincias (`docs/culture/regiones.yaml`)
**Section verdict:** This is the strongest section of the four. It's written for travelers, most pages give you something you'll actually see or hear on a trip (coca on the bus, siesta hours, fernet, the sapucai, viaje de egresados), and the scenarios are good. The weak spots are number dumps (km², percentages, founding years), two north-to-south `order` exercises that ask for geography the class never taught, and many vocab words that never appear in Spanish in the pages.

#### el-interior — Buenos Aires is not Argentina
- **[High] Exercise logic** — page 9 (gap, "Mi hermana se fue a vivir al ___"): "campo" also works. The prompt only says she "moved away from Buenos Aires", and moving to the countryside fits that. The explain even admits al campo means the countryside. **Fix:** Replace "campo" with an option that can't work (e.g. "centro"), or make the prompt say she moved to Córdoba city.
- **[High] Teach-before-test** — page 8 (order, Jujuy → Tierra del Fuego): the class never gives the provinces' north-south positions. Page 6 lists regions, not an order, and Neuquén has never been mentioned. With six items, a beginner is just guessing. **Fix:** Cut it to 4 items the pages can support (Jujuy "on the Bolivian border", Córdoba "centre", Tierra del Fuego "bottom of the map", plus one more), or add a small map info page before it.
- **[Medium] Teach-before-test** — vocab "Capital" ("the city of Buenos Aires (colloquial)"): this use of "Capital" never appears in the pages. "extrañar" first shows up inside an answer option on page 5 and is only explained in the explain. **Fix:** Add "people in the provinces just say **Capital**" to page 4. Keep extrañar, but mention it in page 4's body.
- **[Medium] Teach-before-test (vocab quiz)** — the glosses overlap: "provincia" = "province" vs "el interior" = "the provinces (…)", and "porteño" = "someone from the city of Buenos Aires" vs "Capital" = "the city of Buenos Aires". In "pick the meaning", two options will look right. **Fix:** Make them distinct, e.g. el interior = "everywhere outside BA (porteño view)", Capital = "downtown BA, as the provinces call it".
- **[Low] Interest** — page 2 (info, "23 plus one"): "smallest province is Tucumán; youngest is Tierra del Fuego, 1990" is trivia nobody needs. The CABA vs. La Plata confusion is the useful part. **Fix:** Cut the smallest/youngest sentence.
- **[Low] Exercise logic** — page 7 (match, demonyms): none of these demonyms were taught, but they can all be matched by spelling (Salta→salteño), so it tests nothing. **Fix:** Fine as a light page. Or add one irregular demonym people actually hear (e.g. Entre Ríos → entrerriano) and teach it.
- **Keep:** Page 4 (el interior plus "they have opinions") and page 5 (the salteña scenario) teach real social know-how.

#### noroeste — The Noroeste: Andes, coca and Pachamama
- **[Medium] Teach-before-test** — page 7 (true_false, caña con ruda): page 6 names **caña con ruda** but never says what it is. The explanation ("cane liquor steeped with rue… one, three or seven sips") only appears in the explain. Chicha is also unexplained. **Fix:** Add "(cane liquor steeped with rue)" to page 6.
- **[Medium] Exercise logic** — page 10 (gap, "le damos de ___ a la Pachamama"): "beber" is defensible, because page 6 says she's fed chicha and wine too, and "darle de beber" is a real phrase. **Fix:** Replace "beber" with an option that can't work (e.g. "dormir").
- **[Medium] Teach-before-test** — vocab "la altura": the Spanish word never appears in the pages (only English "altitude"). "quebrada" only appears inside a proper name, never glossed as "gorge". **Fix:** Put **la altura** in bold on page 4 ("fights **la altura**") and gloss Quebrada on page 1.
- **[Low] Flow** — page 8 fun_fact ("Dicen que the red poncho…"): a Spanish fragment stuck into an English sentence, with no gloss. **Fix:** Write "They say the red poncho…".
- **[Low] Flow** — page 6: caña con ruda has Guaraní roots and is drunk nationwide, so it sits oddly in the Andes class. **Fix:** Keep it, but frame it as "meanwhile, everywhere else…" (that's already half there). Fine as is if space is tight.
- **Keep:** Pages 4–5 (coquear plus the bus scenario) are exactly what a traveler needs.

#### cuyo — Cuyo: wine, water and the siesta
- **[Medium] Teach-before-test** — vocab "cerro" and "un tinto": neither appears anywhere in this class ("cerro" is only in the noroeste class). "horario cortado" only appears in page 8's explain. **Fix:** Use "tinto" on page 2 ("order **un tinto**"), mention **horario cortado** on page 7, and drop "cerro" or mention the Cerro de la Gloria.
- **[Low] Interest** — page 4 (info, Vendimia): "official since 1936" and "queens sent by each of Mendoza's departments" are filler. What a traveler needs is "if you're here in early March, go; book early". **Fix:** Cut the year and add the practical line.
- **[Low] Exercise logic** — page 10 (true_false, "acequias… decorative fountains") and page 3 (Malbec French): both are trivially easy and just restate what page 1 or 2 said. **Fix:** Merge them into one question with a real hook, e.g. "What should you watch out for walking in Mendoza at night?"
- **Keep:** The acequias page ("falling into one is a rite of passage") and the siesta scenario on page 8.

#### cordoba — Córdoba: fernet, cuarteto and the tonada
- **[High] Teach-before-test (vocab quiz)** — "tonada" = "regional accent, sing-song" vs "cantito" = "sing-song (the Córdoba accent)": in "pick the meaning", these glosses are interchangeable. **Fix:** Keep only one of the two in vocabulary and move the other to glossary.
- **[Medium] Teach-before-test (vocab quiz)** — "fernando" = "fernet (slang)" vs "fernet con coca" = "fernet and cola": both glosses contain "fernet", so they're easy to confuse and the gloss hands over the word. **Fix:** Gloss fernet con coca as "the party drink: bitter liqueur + cola", or drop "fernando" to glossary.
- **[Medium] Exercise logic** — page 10 (gap, "hacemos un ___ con coca"): "tinto" also works, since wine with Coke is a common drink in Argentina. **Fix:** Replace "tinto" with something that can't work ("té", "locro").
- **[Medium] Exercise logic / Interest** — page 9 (match): "La Mona Jiménez → king of cuarteto" and "Rodrigo → cuarteto star" are two plausible matches for the same kind of clue, and the pair only tests who-is-who name recall. **Fix:** Drop Rodrigo from the match, or change his clue to "died young in 2000, still a legend".
- **[Low] Interest** — page 6 (info, Cuarteto): 1943, Cuarteto Leo, Rodrigo's age at death and a UNESCO date make it a name/date dump. It's missing where a tourist would hear cuarteto (a baile on Saturday night). **Fix:** Cut Cuarteto Leo and the 1943 date, and add "go to a Mona show; it's a rite".
- **[Low] Exercise logic** — page 8 (choice, culiao): the right answer is the only hedged, longer option. Page 3 (tf, La Docta) just repeats page 2. **Fix:** Balance the option lengths, and drop or replace the La Docta true/false.
- **Keep:** The culiado page and scenario, and the fernet scenario.

#### litoral — The Litoral: rivers, falls and chamamé
- **[Medium] Exercise logic** — page 8 (match): "Santa Fe → the liso" vs "Rosario → the Monumento a la Bandera". Rosario *is* in Santa Fe, and page 7 teaches the liso inside the Rosario paragraph, so both fit. "Misiones → red soil and yerba plantations": yerba plantations were never taught, and page 1 attributes red soil to the whole Noreste. **Fix:** Drop the Santa Fe/liso pair (or make it "Rosario → the liso" and drop the monument), and mention Misiones' yerba on page 1.
- **[Medium] Teach-before-test / Flow** — page 10 (true_false, Che Guevara nickname): the nickname's origin is only taught in the explain. Page 4 has just said "che" means "my" in Guaraní, which contradicts "the most Argentine word" in the explain and leaves a beginner confused about "che". Ending the class on this also feels random. **Fix:** Explain on page 4 that Argentine "che" (hey!) is a different, everyday word, or cut the Guaraní "che". Rewrite the true/false as "Cubans nicknamed him Che because he kept saying it", and teach that on page 7.
- **[Low] Interest** — page 7 (info, Rosario): four names and two birth years (Messi 1987, Che 1928, Fito Páez), with the liso tacked on at the end. **Fix:** Drop the birth years and turn it into "what to do in Rosario": walk the costanera, see the Monumento, order a liso.
- **[Low] Teach-before-test** — vocab "río": the Spanish word never appears ("Paraná and Uruguay rivers"). "rosarino" was taught in el-interior, not here. **Fix:** Write "the **río** Paraná" on page 1.
- **Keep:** The sapucai scenario on page 6, and the Eleanor Roosevelt "Poor Niagara!" line.

#### patagonia — Patagonia: ice, wind and Welsh tea
- **[Medium] Exercise logic** — page 9 (order, Bariloche → Península Valdés → El Calafate → Ushuaia): Bariloche vs Valdés are nearly the same latitude, and nothing in the pages tells them apart. The provinces-to-places key is only in the explain. **Fix:** Drop Valdés, or give each place its province in the info pages (page 1 already lists the provinces north to south).
- **[Medium] Exercise logic** — page 3 (true_false, "still famous for being one of the few glaciers not affected by warming"): this is half-true. It arguably *is* still famous for that, even though it's no longer accurate. **Fix:** "The Perito Moreno glacier is still stable today."
- **[Medium] Teach-before-test** — vocab "ballena" and "viento": neither Spanish word appears in the pages. **Fix:** Bold them on pages 7 and 1.
- **[Low] Flow** — "el fin del mundo" is covered on page 7, in the match on page 10, in the gap on page 11 and in the vocab. That's four times. **Fix:** Swap the gap for a Welsh-tea or cordero line.
- **[Low] Interest** — page 4 (info, té galés): "28 July 1865, the ship Mimosa" is trivia. **Fix:** Cut it to "in 1865"; the tea is the hook.
- **Keep:** Viaje de egresados (pages 5–6) is a genuinely great cultural insight.

---

<a id="iconos"></a>

### Íconos e inventos (`docs/culture/iconos.yaml`)
**Section verdict:** This section is uneven. Mafalda, the Eternauta and the money-free "bondi" and "birome" bits land. The "Five Nobels" page, the writers class and the creator/achievement matches are textbook name dumps that test recall nobody needs. The biggest systemic problem: most vocabulary lists are generic words (libro, leer, historieta, hincha, crack) that never appear in the pages, so the learner meets them for the first time in the final quiz.

#### mafalda — Mafalda and her gang
- **[High] Teach-before-test** — page 2 (true_false, "first created for an ad campaign"): nothing before this mentions the ad. The answer is "true", which most learners will get wrong. **Fix:** Put the Mansfield story in page 1's body (it's a nice hook), then test it.
- **[Medium] Teach-before-test** — vocabulary: "historieta", "tira", "chusma", "nene / nena" and "la esquina" never appear in the pages. That's 5 of 7 words. **Fix:** Bold them in the bodies ("her first **tira**", "Susanita, the **chusma**", "the **esquina** of Chile and Defensa"), or replace them with words the class does use.
- **[High] Teach-before-test (vocab quiz)** — "historieta" = "comic strip, comic" vs "tira" = "comic strip (short)": in "pick the meaning" these are indistinguishable. **Fix:** Keep one.
- **[Medium] Exercise logic** — page 7 (gap, "Manolito atiende el ___ de su papá"): "kiosco" is also a family shop and fits. The explain admits it. **Fix:** Replace "kiosco" with something that can't work (e.g. "subte").
- **[Low] Interest** — page 1 and fun fact: the exact dates (29 Sep 1964, Quino's death date) are fine trivia but crowd the page. **Fix:** Keep the "one day after Mafalda's birthday" fun fact and drop the dates from the body.
- **[Low] Exercise logic** — page 8 (true_false, "only famous in Argentina"): trivially false. **Fix:** Ask something with a local payoff, e.g. where the statue is.
- **Keep:** The gang page ("Every Argentine knows a Susanita") and the San Telmo statue page.

#### historietas-y-pantallas — Comics, cartoons and snow
- **[High] Teach-before-test** — page 6 (true_false, "2025 Netflix series… starred Ricardo Darín"): the Netflix series and Darín were never mentioned (Darín is only introduced in a later class). **Fix:** Add one line to page 4 ("In 2025 Netflix turned it into a hit series starring Ricardo Darín").
- **[Medium] Flow / Tone** — pages 5 → 6 → 7: the class goes from Oesterheld's daughters and grandchildren disappearing, to a Netflix casting trivia question, to a 1917 cartoon about Yrigoyen setting Buenos Aires on fire. The whiplash undercuts page 5. **Fix:** Put the Netflix question right after page 4, and move El Apóstol before the Eternauta pages, so the class ends on memory and "nadie se salva solo".
- **[Medium] Interest** — page 8 (match, creator → creation): pure name recall (Dante Quinterno, Quirino Cristiani), and the similar names Quino, Quinterno and Quirino make it a coin flip. **Fix:** Match the creation to its hook instead (Clemente → papelitos, Eternauta → deadly snow, Patoruzú → rich cacique, El Apóstol → first animated film).
- **[Medium] Teach-before-test** — vocab "dibujitos", "nevada", "serie" and "desaparecido": none of them appear in Spanish in the pages. **Fix:** Bold **desaparecido** on page 5, **nevada** on page 4 and **serie** in the Netflix line. Drop "dibujitos" or use it on page 7.
- **[Low] Tone / Cultural** — page 1 (Patoruzú): an indigenous-chief caricature is presented uncritically ("strong, noble"), and it's the weakest hook in the class ("everyone over 40 knows his name"). **Fix:** Cut it, or add one line noting the character is now seen as a stereotype.
- **[Low] Exercise logic** — page 3 (choice, Clemente): it restates page 2 immediately, and the other options are filler. The explain carries the real insight (the dictatorship context). **Fix:** Move the dictatorship line into page 2, and make the question about what you'll see in stadiums today.
- **Keep:** Pages 4–5 ("It's a comic, and it's also memory") and the nadie se salva solo gap.

#### escritores — The writers
- **[Medium] Interest / Flow** — pages 3–5 (three info pages in a row: Rayuela, Sabato, Alfonsina/Walsh), after page 1 is also info. Four of the first five pages are reading, and it feels like a book report. Sabato's page (Curie lab, El túnel plot) doesn't answer why a tourist should care. **Fix:** Cut Sabato down to the Nunca Más line (or drop him; the dictatorship class already covers it). Give Borges a place to visit (Biblioteca Nacional, Café Tortoni, the Borges street signs). Add a question between Rayuela and Alfonsina.
- **[Medium] Flow** — Manuelita is tested three times: the match (page 6), the choice (page 7) and the true/false (page 9). **Fix:** Replace the page 9 true/false with a question about Alfonsina (untested) or Borges.
- **[Medium] Teach-before-test** — vocabulary: "libro", "novela", "cuento", "escritor", "leer" and "tortuga" never appear in Spanish in the pages. They're also generic words with no cultural load. **Fix:** Bold **cuento** on page 1 ("short stories, **cuentos**"), **tortuga** on page 5, and drop libro and leer.
- **[Low] Exercise logic** — page 2 (true_false, "Borges won the Nobel"): the page title just said "Borges, no Nobel". **Fix:** Ask something the page implies but doesn't title, e.g. about his blindness at the library.
- **Keep:** The Manuelita birthday scenario (page 7), a real moment a visitor will live through.

#### inventos-y-nobeles — Inventions and Nobels
- **[High] Teach-before-test (vocab quiz)** — "colectivo" = "city bus" vs "bondi" = "bus (slang)": in "pick the meaning", both options are correct. **Fix:** Keep only one in vocabulary (bondi), and put colectivo in the glossary.
- **[Medium] Exercise logic** — page 2 (gap, "¿Me prestás una ___?"): "lapicera fuente" is a pen too (a fountain pen), and the explain itself says "lapicera" means pen. **Fix:** Replace it with something that can't be lent as a pen (e.g. "servilleta").
- **[Medium] Interest** — page 7 (info, "Five Nobels"): five names, five years, five fields in 60 words. It's a Wikipedia list, and page 8 then tests "Pérez Esquivel → Nobel Peace Prize, 1980" and Milstein. **Fix:** Cut it to one line ("five Nobels, two in science, and one never patented his discovery"), keep the salsa golf legend (the actual hook), and drop Milstein and Pérez Esquivel from the match.
- **[Medium] Teach-before-test** — vocab "huella digital", "invento" and "premio" never appear in Spanish in the pages. **Fix:** Bold them in pages 3, 1 and 7, or drop them.
- **[Low] Teach-before-test** — page 9 explain: "pay with your SUBE card, raise your hand to stop it" is the most useful tourist info in the class, and it's hidden in an explain. **Fix:** Move it into page 4 (the colectivo page).
- **[Low] Tone** — page 5 (Favaloro): "drowning in the foundation's debts, he took his own life". The metaphor sits awkwardly next to a suicide. **Fix:** "Buried in the foundation's debts" → or just "Facing the foundation's debts, he took his own life in 2000."
- **[Low] Flow** — page 3 (fingerprints) is ~75 words and names four people. **Fix:** Drop the inspector's name.
- **Keep:** The birome etymology (Bi-ró + Me-yne) and the colectivo origin story.

#### iconos-de-hoy — Modern icons
- **[Medium] Teach-before-test** — vocabulary: "ídolo", "crack", "hincha", "socio" and "peli" never appear in the pages. "chanta" only appears in page 9's explain. **Fix:** Use them in the bodies ("a paying **socio** of San Lorenzo", "a **crack**", "his **peli**"), or cut them.
- **[High] Teach-before-test (vocab quiz)** — "capo" = "legend, brilliant person", "crack" = "star player, ace" and "ídolo" = "idol, sports hero" are near-synonyms, so "pick the meaning" becomes ambiguous. **Fix:** Keep two at most, with clearly different glosses.
- **[Medium] Exercise logic / Teach-before-test** — page 5 (choice, Vilas ranking): the ranking dispute is never taught (page 4 only mentions Grand Slams and the streak). The right option is also the only one containing "Vilas" and "ranking", both words from the scenario, so it's trivial for the wrong reason. **Fix:** Teach the "ranked No. 2 behind Connors, Argentines still feel robbed" story on page 4, and make the options all about Vilas.
- **[Medium] Exercise logic / Teach-before-test** — page 2 (true_false, "Every Argentine loved Pope Francis without reservations"): "every" and "without reservations" give away "false". The genuinely useful content (divisive, never visited as Pope, "you'll hear both sides") exists only in the explain. **Fix:** Move that into page 1, and ask "Francis visited Argentina as Pope" (false).
- **[Medium] Teach-before-test** — page 9 (gap, capo): "capo" is new at this point, and "boludo" depends on "the puteadas section", which the learner may not have done. **Fix:** Introduce **capo** in the Manu page ("Argentines call him a **capo**").
- **[Low] Interest** — pages 3–4: "Lucha Aymar world player eight times", "46 matches in a row", "Hall of Fame 2022" are stats nobody keeps. **Fix:** Keep one number per icon and add why Argentines care (e.g. the 2004 win over the USA).
- **[Low] Flow** — page 8 (match, icon → field): every pair gives itself away (Leonas → hockey). **Fix:** Fine as a breather, but it could be dropped.

---

<a id="historia-nacimiento"></a>

### Historia: el nacimiento de un país (`docs/culture/historia-nacimiento.yaml`)
**Section verdict:** Better than most history content. Several pages connect to the present (Quechua words in your tostado, streets named Reconquista and Defensa, railways that still force detours, Roca on the bill), and contested topics (Rosas, the Campaña del Desierto) are handled well. But too many exercises are date/sequence recall: three `order` pages, a year-matching page and date `match`es. Two classes test gaucho and hero facts (Martín Fierro, Día de la Tradición, San Martín's tomb) that were never taught.

#### antes-de-buenos-aires — Before Buenos Aires
- **[Medium] Interest** — pages 1–2 (info plus match of five peoples to regions): immediate recall of ethnonyms and map regions nobody will remember, with no link to what you'd see today. **Fix:** Keep the peoples, but change the match to something visible now (Mapuche flag in the south, Guaraní words in the northeast, Diaguita ruins at Quilmes), or cut the match to three pairs.
- **[Low] Flow** — the double founding is taught on pages 5–6, then tested by the order on page 7 *and* the true/false on page 8. **Fix:** Drop one of them.
- **[Low] Flow (cross-section)** — "Porteño literally means 'from the port'" (page 6 fun_fact), the "Soy porteño" gap (page 9) and the porteño vocab all repeat regiones/el-interior. **Fix:** Drop the gap and fun fact here, or replace them with "Buen Ayre → Buenos Aires" (the class's own hook).
- **Keep:** Page 3 ("Words that stayed": choclo, palta, cancha, mate) plus the choclo scenario. It's great.

#### virreinato-e-invasiones — A viceroyalty and two British invasions
- **[Medium] Teach-before-test** — vocab "techo" and "invasiones inglesas": neither appears in Spanish in the pages ("flat rooftops", "British invasions"). **Fix:** Bold them on pages 4–5.
- **[Low] Exercise logic** — page 8 (order): "The British return and lose **again**" has its own sort clue, and the Garay item repeats the previous class. **Fix:** Fine as a light review; or drop the order, since the class is already heavy on sequence.
- **[Low] Teach-before-test (vocab quiz)** — "virreinato" = "viceroyalty" vs "virrey" = "viceroy": for a beginner these look alike in "pick the meaning". **Fix:** Gloss virreinato as "the colony (viceroyalty) run from BA".
- **Keep:** The Cabildo page with its shrinking arches, and the Reconquista/Defensa street-name scenario. That's history you walk on.

#### mayo-y-julio — May and July: the big dates
- **[Medium] Flow** — the same three events (cabildo abierto, Primera Junta, Tucumán) are tested by the true/false (page 5), the match (page 6) *and* the order (page 9). Three date-drills in a nine-page class. **Fix:** Drop the page 9 order, and replace the page 6 match with a "what you'll see" question (escarapelas, locro, the Cabildo on the 25th).
- **[Low] Interest** — page 6 (match): "22 de mayo de 1810" vs "25 de mayo de 1810" is date trivia; only the 25th matters to anyone living there. **Fix:** Drop the 22 May pair.
- **[Low] Teach-before-test** — page 3 (choice): locro and pastelitos, both vocab items, are only introduced inside the scenario. **Fix:** Mention them on page 2 or 7 ("the patriotic menu: **locro** and **pastelitos**").
- **Keep:** Page 7 ("Walk the calendar"), which explains every 25 de Mayo and 9 de Julio street in the country.

#### san-martin-y-belgrano — San Martín, Belgrano and the flag
- **[High] Teach-before-test** — page 5 (choice, tomb in the Catedral): nothing says where San Martín is buried, and Belgrano is equally plausible to a learner who just read about both. The Granaderos and the remains' return are only in the explain. **Fix:** Add "his tomb is in the Catedral on Plaza de Mayo, guarded by the **Granaderos**" to page 4. That's also a great tourist hook.
- **[Medium] Teach-before-test / Exercise logic** — page 3 (true_false, "Belgrano died a rich and famous man, and that's why his day is a holiday"): how he died and Flag Day were never taught, and the statement mixes two claims. **Fix:** Teach "he died poor on 20 June, now Flag Day" on page 1, then ask a single-claim statement.
- **[Medium] Teach-before-test** — page 7 (gap, "Padre de la ___"): "Patria" hasn't appeared before. Vocab "prócer", "celeste" and "cordillera" never appear in the pages. **Fix:** Use **celeste** on page 2, **cordillera** on page 4, and **prócer** / **Padre de la Patria** on page 4.
- **[Low] Flow (cross-section)** — Belgrano's flag in Rosario and the Monumento a la Bandera repeat regiones/litoral page 7. **Fix:** Fine, but drop it from the litoral class.
- **Keep:** Page 2 ("Why light blue and white?"), which presents the contested origin well and has the escarapela tip.

#### unitarios-federales-y-gauchos — Unitarios, federales and gauchos
- **[High] Teach-before-test** — page 6 (choice, "Which book is it?"): Martín Fierro is never mentioned before this question. Facundo is never taught either, so the learner is guessing (Rayuela and Don Quijote are the only options they can rule out). **Fix:** Add a short info page (or a line in page 5): "The gaucho's epic is **Martín Fierro** (1872), which every kid reads at school."
- **[High] Teach-before-test** — page 7 (true_false, "Día de la Tradición… José Hernández's birthday"): the date, the holiday and Hernández's birthday were never taught (Hernández appears only in the previous explain). It's also pure trivia. **Fix:** Teach it with the Martín Fierro line, or replace it with a question about what you'll see on 10 November (gaucho parades, San Antonio de Areco).
- **[High] Teach-before-test** — page 2 (match): "caudillo" appears in the match before any page teaches it. **Fix:** Add **caudillos** (regional strongmen) to page 1.
- **[Low] Flow** — pages 3–5: three info pages in a row (Rosas, hero or tyrant, gaucho). **Fix:** Put a quick question after the Rosas pair.
- **Keep:** Page 4 ("Hero or tyrant?") is a model of presenting contested history ("Don't bring it up at an asado unless you have time").

#### desierto-e-inmigrantes — The frontier and the boats
- **[Medium] Flow** — the class is 6 info pages out of 10, in two runs of three (pages 1–3 and 5–7), and it crams in the Constitution, a contested genocide, mass immigration, conventillos, lunfardo and tango. The tone jumps from "thousands were killed… families split up" to pizza and ñoquis within one tap. **Fix:** Split it into two classes, "The Campaña del Desierto" (pages 1–4) and "The boats: immigrants, lunfardo, tango" (pages 5–9), each with its own questions.
- **[Medium] Tone** — vocab "genocidio" sits in the same match/"pick the meaning" game as "birra" and "fiaca". **Fix:** Move genocidio to glossary, or into the split-off Campaña class with sober companion words.
- **[Low] Flow** — pages 8–9: the choice tests fiaca and laburo, then the match immediately tests laburo, morfar, birra and fiaca, and then the vocab quiz tests them again. **Fix:** Replace the match with a lunfardo gap or a conventillo/Caminito question.
- **[Low] Interest** — page 5: "ñoquis on the 29th" is a tease with no explanation. **Fix:** Add half a sentence ("end of the month, when money's short, with a bill under the plate").
- **Keep:** Page 3 ("Still debated", Roca on the 100-peso bill, painted statues). It's contested history done right.

#### granero-del-mundo — The granary of the world
- **[Medium] Interest / Teach-before-test** — page 9 (match, event → year, five pairs): this is a pure date drill, and "A military coup overthrows Yrigoyen, 1930" is never taught in any page. It's the section's closing event and appears only as a match item. **Fix:** Add one info line on the 1930 coup (it's the bridge to historia-moderna), and swap the year match for a "then vs. now" question.
- **[Medium] Flow / Tone** — pages 6 → 7: the Semana Trágica (hundreds dead, attack on the Jewish quarter) is followed immediately by the jaunty "rooftop madmen". The tragedy is never followed up or tested, so it reads like an aside. **Fix:** Put the locos de la azotea before page 6, and follow the Semana Trágica with a sober question (or connect it to Once today).
- **[Medium] Teach-before-test** — vocab "tren" and "huelga": neither appears in Spanish in the pages. **Fix:** Bold them on pages 1 and 6.
- **[Low] Exercise logic** — page 8 (gap, "Los locos de la ___"): "radio" is a plausible nickname for radio pioneers. **Fix:** Replace it with "cocina".
- **Keep:** Page 2 (railways fan out to the port, which is why inter-province trips detour today). It's the best "why this still matters" page in the section.

---

<a id="historia-moderna"></a>

### Historia: el siglo XX y hoy (`docs/culture/historia-moderna.yaml`)
**Section verdict:** This is the best-written history. The tone on the dictatorship and Malvinas is sober and right, contested points (the 30,000 figure, Peronism, the '90s, the Malvinas vote) are presented as contested, and "Money today" is excellent, practical content for a tourist. The weak spots are year-match drills in almost every class, one name dump (the five presidents), and vocab glosses that collide in the auto quiz.

#### golpes-peron-y-evita — Coups, Perón and Evita
- **[Medium] Interest** — pages 1–2: a list of six coup years, then a true/false asking "six times?". This is number recall. The genuinely meaningful fact ("since 1983, uninterrupted democracy, its longest ever") is only in the explain. **Fix:** Put the 1983 line on page 1, and ask about it instead of the count.
- **[Medium] Teach-before-test** — page 8 (match, year → event): "1955 → A coup overthrows Perón" is only taught on page 9, *after* the match. The page is also a date drill. **Fix:** Move the match after page 9, or better, swap it for a question on what the aguinaldo or 17 October means today.
- **[Medium] Teach-before-test** — page 10 (choice, "es un gorila"): gorila is never taught before the question (it's guessable only because it's the one political option). **Fix:** Add "Peronists call their opponents **gorilas**" to page 9. The scenario then becomes practice.
- **[Medium] Flow** — 17 October / Día de la Lealtad is covered on page 4, the choice on page 5, the match on page 8 and the gap on page 11. Tested three times. **Fix:** Replace the page 11 gap with a "la grieta" gap.
- **[Medium] Teach-before-test (vocab quiz)** — "peronista" = "Peronist" vs "descamisado" = "'shirtless one', a Peronist worker": both glosses say Peronist. **Fix:** Gloss descamisado as "'shirtless one' (proud label of poor workers)".
- **[Low] Flow** — page 6 mentions "Perón and his wife" before Evita is introduced on page 7. **Fix:** Swap pages 6 and 7.
- **Keep:** Page 9 ("Why it still splits families" plus la grieta), which is balanced and directly useful.

#### la-ultima-dictadura — The last dictatorship
- **[Medium] Teach-before-test / Interest** — page 10 (match, event → year): "Malvinas war 1982" and "Democracy returns 1983" are not taught in this class (Malvinas comes next). It's also the class's second match and a date drill. **Fix:** Drop it. The class already has strong questions, and the Malvinas class covers 1982–83.
- **[Medium] Exercise logic** — page 11 (gap, "Memoria, Verdad y ___"): the prompt spells out "Día Nacional de la Memoria por la Verdad y la Justicia", so the answer is in the question. **Fix:** Shorten the prompt to "24 March is the Day of Memory. Its motto is:".
- **[Low] Teach-before-test** — page 6 explain: the Thursday-afternoon ronda and the headscarves painted around the Pirámide are the most visitable facts in the class, and they're only in the explain. The ESMA as a visitable memory site is only in a match item. **Fix:** Put both in pages 5 and 2 ("you can visit the ESMA today").
- **[Low] Flow (cross-section)** — Sabato leading Nunca Más repeats iconos/escritores. The *Argentina, 1985* nomination repeats iconos/iconos-de-hoy (which has a whole true/false on it). "desaparecido" is vocab in both this class and iconos/historietas. **Fix:** Keep them here, and trim the iconos versions.
- **Keep:** Pages 4 ("How many?") and 7 (Abuelas). They're sober, precise, and present the contested figure as contested.

#### malvinas — Malvinas
- **[High] Teach-before-test (vocab quiz)** — "veterano" = "war veteran" vs "ex combatiente" = "former combatant, veteran": both glosses contain "veteran", so "pick the meaning" is ambiguous. **Fix:** Keep one in vocabulary, or gloss ex combatiente as "former combatant (preferred term among Malvinas vets)".
- **[Medium] Interest** — page 4 (true_false, "about two and a half months") and page 7 (match, 2 abril / 2 mayo / 14 junio): number and date recall. Only 2 April matters to a visitor (the holiday). **Fix:** Replace the true/false with something about the conscripts or the Belgrano (e.g. "Most soldiers were career professionals": false). Cut the match to the 2 April holiday.
- **[Medium] Teach-before-test** — vocab "soberanía" never appears in the pages. **Fix:** Add it to page 8 ("the claim to **soberanía** is in the Constitution").
- **[Low] Teach-before-test** — page 11 (true_false, "Defeat… helped bring down the dictatorship"): the pages never say this. The explain teaches it. **Fix:** Add one line to page 8: "the defeat sank the junta; elections came in 1983."
- **[Low] Exercise logic** — page 2 (choice, Falklands vs Malvinas) repeats page 1's "always say Malvinas" one tap later. The page 10 gap ("son/están/eran") repeats page 8's title. **Fix:** Drop one of them; the taxi scenario on page 9 already covers the etiquette better.
- **Keep:** Page 9 (the taxi driver scenario). It's tactful, real and very useful for English speakers.

#### democracia-y-crisis — Democracy, hyperinflation and 2001
- **[Medium] Interest** — page 8 (info, "Que se vayan todos"): five presidents named (Puerta, Rodríguez Saá, Camaño…). The only thing anyone keeps is "five presidents in twelve days". **Fix:** Cut the names, and add what it left behind (why people distrust banks, and the dollar habit that leads into the next class).
- **[Medium] Interest / Flow** — pages 9–10: two match pages back to back, the first a five-pair date drill. **Fix:** Drop the date match. The word match (corralito, cacerolazo, saqueo) is the useful one.
- **[Medium] Teach-before-test** — vocab "devaluación" never appears in this class. **Fix:** Mention it on page 8 ("the peso's **devaluación** wiped out savings").
- **[Low] Exercise logic** — page 6 (true_false, "one peso was legally worth one US dollar"): this restates page 4's title. **Fix:** Ask about the cost ("Unemployment fell in the '90s": false).
- **[Low] Tone** — page 11 explain: a subjunctive grammar lecture ("uses the subjunctive: it's a demand"), which is off-spec for culture lessons. **Fix:** "It's a demand, 'let them all go'."
- **Keep:** Page 3 (1989 payday scenario, with a reflex some still have). It links history to present-day behavior.

#### pensar-en-dolares — Money today: thinking in dollars
- **[Medium] Teach-before-test** — page 7 explain: cara chica vs cara grande (older $100 bills get a worse rate) is the single most useful tip for a tourist carrying dollars, and it's hidden in an explain. **Fix:** Put it in page 6's body.
- **[Medium] Teach-before-test** — vocab "plata" (money) never appears in the pages, and it's arguably the most useful word in the class. **Fix:** Use it on page 1 ("pesos, **plata** for spending, fast").
- **[Low] Interest** — the class never answers a visitor's real question: how should *I* pay (card vs cash, which rate)? **Fix:** Add one practical info page, or a scenario at a restaurant.
- **[Low] Flow** — page 5 (arbolito scenario) comes before page 6 teaches the word. That works as discovery, but the explain and page 6 then repeat each other. **Fix:** Trim page 6's first sentence.
- **Keep:** The whole class. The dólar blue, arbolitos and "¿A cuánto está el dólar?" are what a tourist will hear in the first hour.

---

## Appendix A — Vocab words that never appear in the class's pages

This list comes from a script. It matches each vocab `es` against the page text, ignoring accents, leading articles and slight inflection. It may miss a word that only appears in an `explain` (those count as "appearing" here, but see Part 1, pattern 3) and may include a few false positives from irregular forms. A good candidate for a `culture:validate` warning.

- `alfajores/que-es-un-alfajor`: relleno (filling)
- `alfajores/marcas-y-kioscos`: alfajor blanco (alfajor with a white sugar glaze)
- `buenos-aires/barrios`: mirar nomás (to just be looking (in a shop)); adoquines (cobblestones); la esquina (the corner)
- `buenos-aires/moverse`: tocar el timbre (to press the bell (to get off))
- `buenos-aires/iconos-de-la-ciudad`: bar notable (historic protected café)
- `buenos-aires/vida-portena`: estar atento (to be alert, pay attention); trasnochar (to stay up late)
- `costumbres/el-beso`: el cachete (cheek); chau (bye)
- `costumbres/salir-de-noche`: trasnochar (to stay up very late)
- `costumbres/navidad-en-verano`: los fuegos artificiales (fireworks); las fiestas (the holidays (Christmas and New Year))
- `costumbres/el-calendario`: el finde largo (long weekend)
- `dichos/mas-que`: creerse la última Coca-Cola del desierto (to think you're God's gift)
- `futbol/de-que-cuadro-sos`: cancha (stadium, pitch)
- `futbol/el-diez`: Mundial (World Cup)
- `habla/sho-y-che`: lluvia (rain)
- `historia-moderna/la-ultima-dictadura`: nieto restituido (stolen grandchild who recovered their identity)
- `historia-moderna/malvinas`: soberanía (sovereignty)
- `historia-moderna/democracia-y-crisis`: devaluación (devaluation)
- `historia-moderna/pensar-en-dolares`: plata (money); ¿A cuánto está el dólar? (What's the dollar at?)
- `historia-nacimiento/virreinato-e-invasiones`: invasiones inglesas (the British invasions (1806–1807)); techo (roof)
- `historia-nacimiento/san-martin-y-belgrano`: celeste (light blue); cordillera (mountain range (the Andes)); prócer (founding hero of the nation)
- `historia-nacimiento/granero-del-mundo`: tren (train); voto secreto (secret ballot); huelga (strike)
- `iconos/mafalda`: historieta (comic strip, comic); tira (comic strip (short)); chusma (gossip (a person)); nene / nena (little boy / little girl); la esquina (the street corner)
- `iconos/historietas-y-pantallas`: dibujitos (cartoons); nevada (snowfall); desaparecido (person disappeared by the dictatorship)
- `iconos/escritores`: escritor / escritora (writer); libro (book); cuento (short story); tortuga (turtle)
- `iconos/inventos-y-nobeles`: huella digital (fingerprint); premio (prize, award)
- `iconos/iconos-de-hoy`: ídolo (idol, sports hero); crack (star player, ace); hincha (fan (of a team)); socio (paying club member); peli (movie (short for película))
- `mate/que-es-el-mate`: tomar mate (to drink mate); calabaza (gourd)
- `mate/los-chiches`: curar el mate (to cure a new gourd)
- `mate/cebar`: quemar la yerba (to burn the yerba (with boiling water)); agua caliente (hot water); hervir (to boil)
- `mate/la-ronda`: pasar el mate (to pass the mate)
- `mate/mate-en-el-barrio`: fuerte (strong); cruzar el charco (to cross the River Plate (to Uruguay or back))
- `musica/rock-nacional`: banda (band); tema (song, track); temazo (a great song, a banger); disco (album, record)
- `musica/cumbia-y-cuarteto`: cumbiero (cumbia lover, or cumbia-style); pegar (to become a hit)
- `musica/trap-y-rkt`: batalla (rap battle); romperla (to kill it, to be amazing)
- `regiones/noroeste`: la altura (altitude)
- `regiones/cuyo`: dormir la siesta (to take a nap after lunch); cerro (mountain, hill); un tinto (a red wine)
- `regiones/patagonia`: ballena (whale); viento (wind)
- `tango/gardel`: ídolo (idol, hero); barrio (neighborhood)
- `tango/orquestas-y-piazzolla`: bandoneonista (bandoneón player); bárbaro (great, awesome)
- `tango/las-letras`: letra (lyrics); extrañar (to miss (someone or something))
- `tango/la-milonga`: milonguero (regular at the milongas)

## Appendix B — Vocab items repeated across classes

Repetition is fine as review. But each repeat should use the **same gloss**, and it should be *referenced* ("you met this in…"), not re-taught as new. Watch the ones with different glosses (vaquita, trasnochar, bombo).

- **clásico** — alfajores/dulce-de-leche, futbol/de-que-cuadro-sos
- **docena** — alfajores/facturas, comida/empanadas
- **postre** — alfajores/postres-caseros, asado/sos-invitado
- **¡qué rico!** — asado/el-orden, mate/la-ronda
- **hacer una vaquita** — asado/sos-invitado, comida/horarios-y-mesa
- **bárbaro** — asado/sos-invitado, tango/orquestas-y-piazzolla
- **cordero** — asado/asados-del-pais, regiones/patagonia
- **campo** — asado/asados-del-pais, musica/en-vivo
- **porteño** — buenos-aires/portenos, historia-nacimiento/antes-de-buenos-aires, regiones/el-interior, tango/nacido-en-el-arrabal
- **capital** — buenos-aires/portenos, regiones/el-interior
- **el interior** — buenos-aires/portenos, futbol/mas-alla-de-buenos-aires, regiones/el-interior
- **barrio** — buenos-aires/portenos, tango/gardel
- **la esquina** — buenos-aires/barrios, iconos/mafalda
- **colectivo** — buenos-aires/moverse, iconos/inventos-y-nobeles
- **bondi** — buenos-aires/moverse, habla/lunfardo, iconos/inventos-y-nobeles
- **subte** — buenos-aires/moverse, iconos/iconos-de-hoy
- **mozo** — buenos-aires/iconos-de-la-ciudad, comida/horarios-y-mesa
- **la cuenta** — buenos-aires/iconos-de-la-ciudad, comida/horarios-y-mesa
- **¡ojo!** — buenos-aires/vida-portena, habla/manos-y-chat
- **trasnochar** — buenos-aires/vida-portena, costumbres/salir-de-noche
- **merienda** — comida/horarios-y-mesa, mate/mate-de-todos-los-dias
- **locro** — comida/guisos-y-helado, historia-nacimiento/mayo-y-julio
- **choclo** — comida/guisos-y-helado, historia-nacimiento/antes-de-buenos-aires
- **chau** — costumbres/el-beso, habla/sho-y-che
- **viveza criolla** — costumbres/sin-filtro, dichos/filosofia-criolla, futbol/el-diez
- **cancha** — futbol/de-que-cuadro-sos, historia-nacimiento/antes-de-buenos-aires
- **hincha** — futbol/la-hinchada, iconos/iconos-de-hoy
- **cantito** — futbol/la-hinchada, regiones/cordoba
- **bombo** — futbol/la-hinchada, musica/folklore
- **rosarino** — futbol/mas-alla-de-buenos-aires, regiones/litoral
- **mina** — habla/lunfardo, tango/las-letras
- **desaparecido** — historia-moderna/la-ultima-dictadura, iconos/historietas-y-pantallas
- **ídolo** — iconos/iconos-de-hoy, tango/gardel
- **chanta** — iconos/iconos-de-hoy, puteadas/gil-forro-chanta
- **pañuelo** — musica/folklore, regiones/noroeste
- **cuarteto** — musica/cumbia-y-cuarteto, regiones/cordoba
- **extrañar** — regiones/el-interior, tango/las-letras

## Appendix C — Choice questions where the correct option is by far the longest

The correct option is at least 1.6× longer than the next-longest option. Balance the option lengths, or shorten the correct one.

- `asado/el-orden` — "What are you about to eat?"
- `buenos-aires/portenos` — "What happened?"
- `buenos-aires/barrios` — "What do you find?"
- `buenos-aires/iconos-de-la-ciudad` — "What's going on?"
- `buenos-aires/vida-portena` — "Why?"
- `futbol/la-tabla-y-el-descenso` — "Why?"
- `habla/sho-y-che` — "Which of these is a real theory about where "che" comes from?"
- `historia-nacimiento/virreinato-e-invasiones` — "What do those street names remember?"
- `iconos/mafalda` — "What's the classic Argentine joke to make?"
- `mate/que-es-el-mate` — "What are they asking?"
- `mate/los-chiches` — "What's the difference?"
- `mate/la-ronda` — "Should you fix it?"
- `mate/mate-de-todos-los-dias` — "What do you do?"
- `puteadas/boludo` — "What's going on?"
- `regiones/cuyo` — "What's the most likely explanation?"
- `regiones/litoral` — "What's happening?"
- `regiones/patagonia` — "What's the photo almost certainly from?"
- `tango/orquestas-y-piazzolla` — "What are they reenacting?"
