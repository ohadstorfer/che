# Course review — Section 1, 2026-09-18

Revisión de la experiencia de aprendizaje del curso antes de escribir más
unidades y de grabar los audios que faltan.

Alcance: **Sección 1, unidades 1–10**. Las secciones 2 y 3 tienen outline y
palabras, pero todavía ni una oración ni un slot.

Medida: **pantallas**, no slots. Un slot `review` vale 2 pantallas y un `recap`
más, así que contar filas engaña.

---

## Lo que está bien

- **Las oraciones.** 210 en juego, naturales, rioplatenses, cortas (4.3 palabras
  promedio), un tercio son preguntas. Sofi / Martín / Lucía / Juan se repiten y
  dan continuidad. Esto no lo tocaría.
- **El runtime.** `src/lib/lesson.ts` resuelve slots, SRS, ladder y el fallback a
  cláusula. Sólido. El problema no era el motor, era el contenido de los slots.
- **La progresión gramatical** U1→U10 (café → saludos → vos → nombre → origen →
  3ª persona → género → familia → edad → kiosco) tiene sentido.

---

## Los 5 problemas

### 1. ~~Diez lecciones vacías~~ — era falso
Las diez estaban en `status = 'retired'` y el camino solo carga lecciones
`published` (`src/lib/course.ts:40`). Nunca estuvieron en la app: eran output
viejo del planner sobre lecciones que el admin después retiró.

Lo que sí era cierto: el camino real eran **38 lecciones publicadas**, no 53.

### 2. Cero ejercicios de escucha — ARREGLADO
**0 de 464 slots** eran `sentence_listen`. Las unidades 1–6 ya tenían el audio
grabado y ninguna lección se lo pedía al alumno.

### 3. El largo de la lección iba de 6 a 22 pantallas — ARREGLADO
Mediana 14, y 14 de 37 lecciones caían en 12–16. U3/U5 tenían lecciones de 6;
U7/U8/U9 de 20–22 con 5 palabras nuevas cada una.

La causa: `FORMS_PER_LESSON = 5` en `scripts/course/lib/outline.mjs`. Una palabra
cuesta 3 pantallas (teach · meaning · gap), así que 5 palabras son 15 pantallas
antes de cualquier producción.

### 4. Todas las lecciones son la misma plantilla — PENDIENTE
U7/U8/U9 eran idénticas: `tip, teach, meaning, gap ×5, build ×3, review, match`.
La variedad de modos sigue pobre: build + meaning + gap son casi todo. No hay
`typing`, `flashcard`, `true_false`, `word_build` ni `matching` a nivel palabra
dentro de las lecciones (el `match` los usa, pero una vez por lección).

### 5. Orden roto en el camino — PENDIENTE (menor)
Nunca llegó al alumno: las lecciones con ordinal 20001/20002 estaban retiradas.
Lo que sí quedó: **U2 tiene su story en el ordinal 4**, entre la lección 3 y la
5. Es aceptable, pero el numerado salta.

---

## Cosas chicas

- **794 de 1162 oraciones están `retired`**, y 21 de ellas ya tienen audio
  grabado → plata tirada.
- **37 de 53 tips nunca se muestran.**
- U10 "Buy at the kiosco" tiene sus lecciones marcadas `checkpoint` y tituladas
  "Checkpoint 1–4" — es una unidad normal. Además es la única sin Unit check.
- Los títulos son "Lesson 1", "Lesson 2".

---

## Plan

| # | Qué | Estado |
|---|---|---|
| 1 | Lecciones vacías | **cerrado** — eran retiradas, no existía el problema |
| 2 | Escucha en U1–U6 | **hecho** |
| 3 | Normalizar el largo a 12–16 pantallas | **hecho** |
| 4 | Romper la plantilla / más variedad de modos | a decidir |
| 5 | Grabar lo que falta | a decidir |

---

## Bitácora

### 2026-09-18 — puntos 2 y 3

**Qué cambió en el código**

- `scripts/course/lib/outline.mjs` — `FORMS_PER_LESSON` de **5 a 3**. Es la
  constante que dimensiona cuántas lecciones tiene una unidad al sembrarla.
- `scripts/course/lib/lessons.mjs` — el planner, reescrito:
  - presupuesto en pantallas, `LESSON_ITEMS = { min: 12, max: 16 }`;
  - la lección se arma en bloques (tip · ramp · relleno · producción · escucha)
    y se emite al final, así una pantalla agregada tarde cae donde corresponde;
  - **escucha**: hasta 2 `sentence_listen` por lección, solo de oraciones que la
    lección ya mostró por escrito y solo si tienen `audio_path`;
  - **relleno**: una lección corta se completa con otras oraciones de la unidad;
    si no quedan, sube de escalón una que ya mostró (meaning → gap → build);
  - **compresión**: si la unidad mete más palabras de las que entran, las
    últimas se enseñan y se ven en una oración pero se quedan sin su gap, en vez
    de estirar la lección;
  - avisa cuántas lecciones quiere la unidad en vez de encajarlas a la fuerza.
- `scripts/course/lib/pipeline.mjs` — la query de oraciones ahora trae
  `audio_path` (el planner lo necesita para decidir la escucha).
- `scripts/course/build-lessons.mjs` — reporta pantallas, no slots, y lintea
  largo (12–16) y densidad (≤ 3 palabras nuevas).
- `scripts/course/test/generate.test.mjs` — 3 tests nuevos: ninguna lección pasa
  de 16 pantallas; baja de 12 solo si avisa por qué; la escucha nunca es primer
  contacto y nunca sin grabación.

**Qué cambió en la base**

- `supabase/migrations/20260918000014_more_lessons.sql` — más lecciones donde la
  unidad estaba apretada: U1 2→3, U2 3→5, U7 2→4, U8 3→5, U9 6→9 lecciones de
  enseñanza. El Unit check viejo pasa a ser lección normal y el nuevo va al
  final, así los ids siguen siendo los que deriva el outline
  (`lesson:<slug>:<ordinal>`) y el progreso del alumno sigue apuntando a una
  lección que existe.
- `supabase/migrations/20260918000015_reuse_retired_lessons.sql` — la migración
  anterior tenía un `on conflict do nothing` que se comió 4 filas en silencio:
  el id de una lección se deriva de su ordinal, y las filas que el admin había
  retirado en los ordinales 20001/20002 ya ocupaban esos ids. U1 y U7 quedaron
  sin Unit check y U8 con un hueco. Esta migración las revive en su lugar.
- `npm run course:lessons` corrido en las 10 unidades.

**Resultado**

| | antes | después |
|---|---|---|
| lecciones en el camino | 38 | 48 |
| pantallas por lección | 6 → 22, mediana 14 | 10 → 16, mediana 13 |
| en la ventana 12–16 | 14 / 37 | **45 / 47** |
| pantallas de escucha | 0 | **30** |

Las 2 que quedan cortas son **U3 lección 1 (10 pantallas)** y **U5 lección 2
(11)**. No es el planner: esas unidades tienen 7 y 8 oraciones aprobadas en
total. Necesitan más contenido, no más lógica.

**Deuda que dejó este cambio**

- `npm run course:parity` ahora reporta ~80 diferencias de lecciones. Son las
  secciones 2 y 3: con `FORMS_PER_LESSON = 3` el YAML quiere más lecciones de
  las que tienen sembradas. Se resuelven solas cuando se corra `course:seed`
  para esas unidades — pero ojo, hay que hacer la misma conversión del Unit
  check viejo que hicieron las dos migraciones de acá arriba, porque el seed
  solo agrega y dejaría dos checks por unidad.
- U7, U8 y U9 todavía meten 4 palabras nuevas en alguna lección, así que alguna
  se queda sin su gap. Entra en 16 pantallas y el Unit check + SRS la agarran
  igual, pero es el techo de 3 que no se respeta del todo.
