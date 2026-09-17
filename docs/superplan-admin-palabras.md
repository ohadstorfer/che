# Superplan — Palabras y oraciones en el admin

Estado: **implementado** · 2026-09-18 · rama `duolingo-ui` · ver §12 para lo que cambió al construirlo

Un dashboard donde ver todas las palabras del curso con sus oraciones, y editarlas. Lo que se edita cambia los ejercicios.

---

## 0. En una frase

La base de datos pasa a ser la única fuente de verdad del vocabulario y las oraciones. El admin tiene una pantalla de palabras (lista a la izquierda, detalle a la derecha) donde todo se edita en el lugar. Cada cambio sale en vivo al instante, queda en el historial con **Deshacer**, y lo que deja inválido se pausa con el motivo a la vista.

---

## 1. Decisiones

| Tema | Decisión | Origen |
|---|---|---|
| Fuente de verdad | **La base.** El YAML solo crea unidades y palabras nuevas. El seed deja de pisar lo que ya existe. | Entrevista |
| Publicación | **Al instante.** Todo cambio queda en `content_revisions` con un botón Deshacer. | Entrevista |
| Quién edita | **Solo el dueño.** Sin aprobación ni comentarios. | Entrevista |
| De una palabra se edita | **Todo:** escritura, significado, nota, gramática, respuestas aceptadas. | Entrevista |
| Vocabulario | **Agregar, retirar y mover de unidad.** | Entrevista |
| De una oración se edita | **Todo:** español, inglés, alternativas, glosas a mano, crear y retirar. | Entrevista |
| Pasos que necesitan un modelo (glosas, alternativas) | **Quedan pendientes.** Se resuelven con `course:gloss` y `course:answers` usando agentes, sin API. | Entrevista |
| Si una edición deja algo inválido | **Se guarda y se pausa** lo inválido, con el motivo en palabras simples. | Entrevista |
| Corregir cómo se escribe una palabra | **Se reemplaza en todas sus oraciones.** Antes de guardar, muestra la lista de las que cambian. | Entrevista |
| Progreso de los alumnos al corregir la escritura | **Se mantiene** (es la misma palabra). Si es otra palabra, se crea una nueva. | Entrevista |
| Audio de algo cuyo texto cambió | **Se borra** y queda marcado **"sin audio"**. | Entrevista |
| Pantalla | **Lista + detalle**, con vista previa de los ejercicios. | Entrevista |
| Mover de unidad: ¿a qué lección? | **Propuesta por defecto:** al mover, el admin pregunta la lección con la primera ya elegida. Un toque si da igual, y elegible cuando importa. | Sin decidir ("no sé"); revisable |
| De dónde lee el pipeline | **De la base.** `generate-unit`, `agent-unit`, `lint`, `build-lessons` y `ai-review` ven exactamente lo mismo que el admin (§7.2). | Decidido por Claude (best practice), 2026-09-18 |
| El YAML | **Solo para sumar contenido nuevo.** Una sección o unidad nueva se escribe en un archivo y un comando la carga; después se edita en el admin. Lo que ya existe no se edita en el YAML (§7.2). | Entrevista: "unidades nuevas, en un archivo" |
| Respaldo e historial | **`course:snapshot`** (JSON por tabla en git, con ids) y **`course:restore`**. Ya existen. | Decidido por Claude |

---

## 2. Cómo funciona hoy (lo que el plan tiene que respetar)

- **Los ejercicios no se guardan.** Se arman en vivo a partir de las palabras (`form_entries`) y las oraciones (`sentences`) cada vez que se cargan los datos del alumno (`src/lib/session.ts` `loadLearner`). Editar un dato ya cambia los ejercicios; lo difícil son las consecuencias.
- **El significado que se muestra es dinámico.** Sale de las glosas por token de las oraciones (`src/lib/meanings.ts`). Editar una oración puede cambiar lo que una palabra muestra en otros ejercicios.
- **Las respuestas aceptadas están en tres lugares.** Las reglas (`companions`, `answers.ts`), `form_answers` (por significado) y `sentences.es_alt`.
- **Ya existe historial.** Toda escritura del admin pasa por `staffUpdate` / `staffInsert` (`src/lib/admin.ts`), que guardan el antes y el después en `content_revisions`.
- **Conflicto 1: el seed pisa.** `scripts/course/build-seed.mjs` hace upsert de `lemmas` y `forms` desde el YAML y retira todo lo que no está en el YAML. Una palabra editada o creada en el admin se perdería con el próximo seed. → Resuelto en §7.2: el seed solo agrega.
- **Conflicto 2: el pipeline lee el YAML.** `generate-unit`, `agent-unit`, `lint`, `build-lessons` y `ai-review` cargan el vocabulario con `unitFromArgs` → `loadOutline()` (YAML). Una palabra agregada o corregida en el admin sería invisible para el generador. → Resuelto en §7.2: el pipeline lee de la base.
- **Las reglas de revisión solo corren en Node.** `checkSentence` vive en `scripts/course/lib/outline.mjs`, que importa `node:fs` y `yaml`. No se pueden usar tal cual desde el admin.

---

## 3. Qué deja algo inválido, en simple

Una oración queda **pausada** (los alumnos no la ven) cuando:

1. **Usa una palabra que el alumno todavía no aprendió.** "Tengo un perro." en la unidad 1, cuando *perro* se enseña en la 5. Pasa al escribirla así o al **mover** una palabra a una unidad posterior.
2. **Usa una palabra que no está en el curso.** "Un croissant, por favor." La app no conoce *croissant*.
3. **Usa una palabra retirada.** Se retira *mate* y "Un mate, por favor." queda con una palabra que ya no existe.
4. **Usa *tú* en vez de *vos*.** "¿Tú eres Juan?"
5. **Usa una palabra de España o México.** "Un coche" en vez de "un auto".
6. **El inglés no pide algo que está en el español.** "Chau, che." = "Bye!": nada le dice al alumno que va *che*.
7. **Ya no incluye la palabra que tiene que enseñar.** La oración de *medialuna* sin *medialuna*.
8. **Le faltan los signos de apertura.** "Sos Juan?"
9. **Tiene una palabra demasiado informal para la unidad.** *boludo* en la unidad 1.

**Una palabra nunca se pausa.** Si se queda sin oraciones, se sigue practicando sola y aparece en Pendientes como "sin oraciones".

**Cómo se despausa:** una oración pausada que se edita y pasa todas las reglas vuelve a estar en vivo sola. Como hay un solo editor, no hace falta un paso de aprobación.

---

## 4. La pantalla — `/admin/words`

Reemplaza a `/admin/lexicon`. En pantallas angostas, el detalle se abre como página propia (`/admin/words/[id]`).

```
┌─ Palabras ────────────┬─ medialuna ─────────────────────────────────┐
│ [buscar…          ]   │ Unidad 1 · Lección 2 · noun · f.sg          │
│ Unidad [todas ▾]      │                  [Mover] [Deshacer] [Retirar]│
│ ● Pendientes (3)      │ Escritura    [medialuna              ]      │
│ [+ palabra]           │ Significado  [medialuna              ]      │
│                       │ Nota         [small, sweet pastry    ]      │
│ u1  café              │ Gramática    género [f▾] número [sg▾]       │
│ u1  mate              │ Respuestas   "medialuna": —   [+ agregar]   │
│ u1  medialuna    ◀    │ Audio        sin audio                      │
│ u1  factura      ⚠    │                                             │
│ u2  hola              │ Oraciones (4)                    [+ nueva]  │
│ u2  che               │ ▸ Un café y una medialuna.       ✓ en vivo  │
│                       │ ▾ Una medialuna, por favor.  ⚠ glosas pend. │
│                       │   Español  [Una medialuna, por favor.]      │
│                       │   Inglés   [A medialuna, please.     ]      │
│                       │   Otros inglés / Otros español   [...]      │
│                       │   Glosas   Una→a · medialuna→[—] · …        │
│                       │                         [Retirar] [Guardar] │
│                       │                                             │
│                       │ Vista previa de ejercicios                  │
│                       │ [typing] [multiple choice] [armar oración]  │
└───────────────────────┴─────────────────────────────────────────────┘
```

**Lista (izquierda)**
- Buscador por escritura, significado o lema. Filtro por unidad.
- **Pendientes:** palabras con al menos una oración pausada, glosas o alternativas por revisar, sin oraciones o sin audio. El número al lado cuenta las palabras.
- ⚠ en la fila cuando hay algo pendiente. Orden: unidad, después escritura.
- **+ palabra** crea una palabra (ver §5.7).

**Detalle (derecha)**
- Encabezado: unidad, lección que la enseña, categoría gramatical, rasgos. Botones Mover, Deshacer (último cambio de esta palabra) y Retirar.
- Campos editables en el lugar. Se guarda al salir del campo o con Guardar. Si guardar cambia oraciones, primero aparece el resumen de qué cambia.
- **Respuestas aceptadas** agrupadas por significado, con agregar y retirar. Las respuestas cuyo significado ya no existe se muestran aparte, como "huérfanas", para reasignarlas o retirarlas.
- **Oraciones:** todas las que usan la palabra (no solo las que la enseñan), cada una con su estado: en vivo / pausada + motivo / glosas pendientes / alternativas pendientes / sin audio.
- **Vista previa:** los ejercicios reales que genera la palabra con los datos recién editados, reutilizando `Exercise` como ya hace `src/app/admin/sentences/[id].tsx`.

**Diseño:** usa los componentes de admin que ya existen (`Section`, `RowLink`, `SmallButton`, `StatusPill`). Sin animaciones de entrada: es una herramienta de uso intensivo. El feedback de presión lo dan los botones existentes. Seguir el skill `emil-design-eng`.

---

## 5. Qué pasa al guardar, operación por operación

Toda operación escribe con `staffUpdate` / `staffInsert`, así que queda en el historial. Las que tocan varias filas comparten un **`batch_id`** para que un solo Deshacer las revierta juntas (§6).

### 5.1 Significado y nota
- **Dónde se escribe:** si el lema tiene una sola forma (*medialuna*), en `lemmas.gloss_en` / `gloss_note_en`. Si tiene varias (*soy*, *sos*, *es*), en el override de la forma (`forms.gloss_en`), para no cambiar las otras.
- **Efecto:** cambia el diccionario del que se valida el significado dinámico (`standsAlone`) y los distractores (`sharesMeaning`). Nada se pausa.
- Si un significado desaparece, las respuestas de `form_answers` con ese significado pasan a "huérfanas" (§4).
- La palabra queda con **alternativas pendientes** (`course:answers` pregunta por los significados nuevos).

### 5.2 Gramática (género, número, persona, modo)
- Se escribe en `forms.features`.
- **Efecto inmediato en la corrección:** cargarle el género a *café* hace que se acepte "un café".
- Revisar las oraciones que la usan, porque las alternativas automáticas dependen de los rasgos (el otro género). Se regenera la parte automática de su `es_alt` (§5.9).

### 5.3 Respuestas aceptadas
- Agregar inserta en `form_answers` con `source = 'staff'` y el significado elegido. Retirar pone `status = 'retired'`.
- Validación antes de guardar (la misma que `checkWordAnswers`): sin tuteo, sin regionalismos, que no sea otra palabra del curso con otro significado y que la app no la acepte ya.

### 5.4 Corregir cómo se escribe
1. Al editar la escritura, el admin busca las oraciones que usan la palabra (`sentence_forms`) y muestra un **resumen**: cada oración antes y después, y su `es_alt`.
2. Al confirmar: se reemplaza la palabra (como token completo, respetando mayúscula inicial y signos) en `es` y en cada `es_alt`, se re-tokeniza y se revisa cada oración (§5.9), y se actualiza `forms.form`. Si el lema tiene una sola forma, también `lemmas.lemma`.
3. **Se mantiene el mismo id:** `form_states`, `review_logs` y el progreso siguen intactos.
4. Se borra el audio de la palabra y de las oraciones que cambiaron (§5.12).
5. Las glosas de los tokens reemplazados se conservan: la palabra es la misma y el inglés no cambió.

### 5.5 Mover de unidad
1. El admin pregunta **a qué lección** de la unidad nueva, con la primera preseleccionada.
2. Resumen antes de guardar:
   - oraciones que quedarían antes de que se enseñe la palabra (se pausan);
   - oraciones de la unidad nueva que la usaban y estaban pausadas por eso (se despausan si ya pasan todo).
3. Al confirmar: `forms.unit_id` = unidad nueva. Se borra su slot `teach` de la lección vieja (`staffDeleteSlot`) y se agrega uno al final de la lección elegida. Se revisan todas las oraciones que la usan.
4. Si movés una palabra a una unidad **anterior**, nada se pausa: se enseña antes.

### 5.6 Retirar una palabra
- `forms.status = 'retired'`, y el lema también si no le queda ninguna forma viva.
- Se borra su slot `teach`. Se pausan sus oraciones con el motivo "usa una palabra retirada".
- El progreso de los alumnos queda guardado, pero deja de programarse: `form_entries` solo publica palabras publicadas.
- **Deshacer** la devuelve, junto con su slot y sus oraciones.

### 5.7 Agregar una palabra
- Formulario: escritura, lema (nuevo o existente), categoría, rasgos, significado, nota, registro, unidad y lección (la primera preseleccionada).
- Validación: sin tuteo, sin regionalismo y que no esté ya en el curso con el mismo lema y categoría.
- Crea `lemmas` (si hace falta), `forms` con `source = 'dashboard'` y el slot `teach`.
- Queda en Pendientes como **"sin oraciones"**. Se puede escribir la primera desde "+ nueva" ahí mismo.

### 5.8 Crear y retirar oraciones
- **+ nueva** desde la página de una palabra: español, inglés y otros inglés. La palabra de la página es el target por defecto.
- Se guarda por el mismo camino que una edición (§5.9): en vivo si pasa todo, pausada si no.
- Retirar: `status = 'retired'`. Si estaba en un slot `drill`, se saca el slot.

### 5.9 Editar el español o el inglés de una oración
Se hace **en el navegador**, al guardar:
1. **Re-tokenizar** el español contra el vocabulario disponible en su unidad (`tokenize` + `buildIndex`).
2. **Revisar** con las reglas de §3 (`checkSentence`, `en.covers`, target presente, signos) → lista de problemas en palabras simples.
3. **Regenerar las alternativas automáticas** (`generateVariants`: pronombre, *che*, género). Las alternativas escritas a mano o generadas por modelo que siguen armándose con las fichas nuevas se conservan; las demás se muestran para confirmar antes de borrarlas.
4. Si cambió el inglés: se borran las glosas de todos los tokens. Si cambió el español: se conservan las de los tokens que no cambiaron y se borran las demás. Queda **glosas pendientes**.
5. Queda **alternativas pendientes** (`course:answers` detecta que cambió el texto).
6. Si cambió el español: se borra el audio (§5.12).
7. Estado: sin problemas → `published`; con problemas → pausada (§6).

### 5.10 Editar las alternativas
- **Otros inglés** (`en_alt`): texto libre, una por línea.
- **Otros español** (`es_alt`): cada una se valida como la oración (§3). Además tiene que poder armarse con las fichas; si no, se avisa que nunca se va a poder construir.

### 5.11 Corregir glosas a mano
- Cada token muestra su glosa. Al editar, se valida que el texto esté en el inglés de la oración (`inEnglish`), igual que en `course:gloss`.
- Vacío = "el inglés no tiene nada para esta palabra" (sirve para arreglar *che* → "there").
- Una glosa escrita a mano no se pisa en la próxima corrida de `course:gloss` (§6).

### 5.12 Audio
- Cuando cambia el texto de una palabra o de una oración que tenía audio: `audio_path = null` y queda **"sin audio"** en Pendientes.
- No se borra el archivo del storage (Deshacer lo recupera).

---

## 6. Cambios de datos (una migración)

| Cambio | Para qué |
|---|---|
| `sentences.problems text[] not null default '{}'` | Los motivos de pausa, en palabras simples. Pausada = `status = 'draft'` con `problems` no vacío. |
| `lemmas.source`, `forms.source` `text not null default 'outline' check (source in ('outline','dashboard'))` | El seed solo toca y retira lo que vino del YAML (§7.2). |
| `content_revisions.batch_id uuid` (nullable) + índice | Un Deshacer revierte una operación entera (escritura en N oraciones, mover, retirar). |
| `sentences.tokens[].gloss_source` (dentro del jsonb, sin migración): `'staff'` | `course:gloss` no pisa glosas corregidas a mano. |

Sin cambios de RLS: el staff ya puede actualizar `lemmas`, `forms`, `sentences` y `form_answers`, e insertar y borrar `lesson_slots`.

---

## 7. Cambios de código

### 7.1 Reglas compartidas entre el admin y los scripts
- Mover las partes puras a `src/lib/course-rules/` en TypeScript: `rules`, `tokenize`, `accept` (`generateVariants`, `uncoveredTokens`, `optionalTokens`), `checkSentence` y `availableForms`, y el chequeo de glosas (`inEnglish`, `applyGlosses`).
- `checkSentence` recibe un **vocabulario** (`{ forms, units }` con `unit_order`, `register`, etc.) en lugar del outline del YAML, así funciona igual con datos de la base.
- Los scripts de `scripts/course/` las importan con `--import ./scripts/test/register.mjs`, como ya hace `course:answers`. Actualizar esas entradas en `package.json`.
- Los tests existentes (`outline.test.mjs`, `accept.test.mjs`, `gloss.test.mjs`) siguen pasando contra los módulos movidos.

### 7.2 La base como fuente de verdad

**Punto de partida (verificado 2026-09-18):** la base y el YAML coinciden por completo: 589 formas de cada lado, mismos ids, ninguna diferencia de escritura. Pasar a la base no pierde nada.

**Por qué no sincronizar el YAML con la base en los dos sentidos.** Los ids se calculan a partir de cómo se escribe la palabra (`ids.form(lemma, pos, form)`). Al corregir la escritura en el admin, el id se mantiene a propósito, para no perder el progreso. Un YAML regenerado con la escritura nueva calcularía otro id, y el próximo seed crearía una palabra duplicada. Dos fuentes que se sincronizan son la forma más común de perder confiabilidad. Una sola fuente más un respaldo no tiene ese problema.

**El pipeline lee de la base.**
- `scripts/course/lib/pipeline.mjs` → `unitFromArgs` arma el outline desde la base (`sections`, `units`, `lessons`, `form_entries`) con **la misma forma** que hoy devuelve `loadOutline()`. Ningún script cambia más allá de esa función: `generate-unit`, `agent-unit`, `lint`, `build-lessons` y `ai-review` pasan a ver lo mismo que el admin.
- Test: para cada unidad, el outline armado desde la base es igual al del YAML (hoy coinciden). El test se retira el día en que se edite la primera palabra en el admin, porque a partir de ahí es esperable que difieran.
- Los chequeos de `course:validate` (tuteo en el vocabulario, glosas que se pisan, registro) corren sobre el vocabulario de la base; con el YAML solo se valida un archivo nuevo antes de cargarlo.

**El YAML solo suma.**
- Los archivos de las secciones 1–3 llevan un aviso arriba: *"Ya cargado en la base. No editar lo que existe: se edita en /admin/words. Sí se pueden sumar unidades nuevas."*
- `build-seed.mjs` pasa a ser una importación que **solo agrega**:
  - Todo con `on conflict (id) do nothing`: `sections`, `units`, `lessons`, `tips`, `lemmas`, `forms`, slots.
  - Una palabra "nueva" cuyo texto ya existe en la base con el mismo lema y categoría (típicamente, alguien copió al YAML una escritura corregida en el admin) **no se inserta**. Se informa: *"medialuna ya existe (corregida en el admin); se ignora"*. Así nunca se duplica.
  - El retiro de "lo que el YAML ya no tiene" desaparece: retirar se hace en el admin.
  - Al final imprime un resumen: qué agregó y qué entradas del YAML difieren de la base (con la lista). **Avisa, no frena:** frenar bloquearía sumar una unidad nueva cada vez que se editó algo en el admin, que va a ser siempre.
- Una sección nueva va en un archivo nuevo (`section-4.yaml`), y `course:seed` la carga. Desde ese momento se edita en el admin.
- Como el seed ya no pisa ni retira, `lemmas.source` / `forms.source` (§6) dejan de ser necesarios para protegerse del seed. Se quedan igual, porque dicen de dónde vino cada palabra y el admin puede mostrarlo.

**Respaldo e historial.** `npm run course:snapshot` (ya existe) escribe el curso entero, con ids, en `content/snapshots/<fecha>/`; `npm run course:restore -- <fecha> --yes` lo vuelve a cargar. Correr el snapshot antes de cada commit que acompañe cambios de contenido, y antes de operaciones grandes (fase 4).

### 7.3 Operaciones del admin — `src/lib/admin-words.ts`
Funciones puras de "plan" (qué va a cambiar, para el resumen y para testear) separadas de las que escriben:

| Plan (puro, testeable) | Escribe |
|---|---|
| `planSpelling(form, newText, vocabulary, sentences)` | `applySpelling(plan)` |
| `planMove(form, unit, lesson, vocabulary, sentences)` | `applyMove(plan)` |
| `planRetire(form, sentences, slots)` | `applyRetire(plan)` |
| `planSentence(sentence, edits, vocabulary)` → tokens, problemas, `es_alt`, glosas | `saveSentence(plan)` |
| `checkNewForm(fields, vocabulary)` | `addForm(fields)` |
| `checkAnswer(form, meaning, answer, deck)` | `addAnswer` / `retireAnswer` |
| `pendingFor(form, sentences, reviews)` | — |
| — | `undoBatch(batchId)` |

`staffUpdate` / `staffInsert` / `staffDeleteSlot` reciben un `batchId` opcional.

### 7.4 Pantalla
- `src/app/admin/words/index.tsx`: lista + detalle en pantalla ancha.
- `src/app/admin/words/[id].tsx`: detalle solo, para pantalla angosta y links directos.
- Componentes: `WordList`, `WordDetail`, `SentenceEditor`, `ChangeSummary` (el resumen antes de confirmar) y `ExercisePreview` (extraído de `sentences/[id].tsx`).
- `NAV` en `src/components/admin.tsx`: "Lexicon" → "Words". `/admin/lexicon` redirige.

### 7.5 Scripts de modelo (pendientes)
- `course:gloss`: sin cambios de alcance (toma oraciones sin glosas). No pisa tokens con `gloss_source = 'staff'`.
- `course:answers`: sin cambios; ya detecta significados nuevos y oraciones cambiadas.

---

## 8. Pendientes

| Pendiente | Cuándo aparece | Cómo se resuelve |
|---|---|---|
| Oración pausada | Una edición la dejó inválida (§3) | Editarla en el admin |
| Glosas pendientes | Una oración con tokens sin glosa | `npm run course:gloss -- prompts` → agentes → `apply` |
| Alternativas pendientes | Una palabra con un significado nunca revisado, o una oración cuyo texto cambió desde la última revisión | `npm run course:answers -- prompts` → agentes → `apply` |
| Sin oraciones | Palabra sin ninguna oración en vivo | Escribir una desde "+ nueva" |
| Sin audio | `audio_path` vacío | Cuando exista TTS (open item de course-spec §8) |
| Respuestas huérfanas | Respuestas cuyo significado ya no tiene la palabra | Reasignar o retirar en el admin |

---

## 9. Fases

Cada fase termina con `tsc` limpio, `course:test`, `engine:test` y `db:test` en verde, y una prueba en el admin con datos reales.

### Fase 1 — Base
- Migración §6.
- Reglas compartidas §7.1, con los tests existentes pasando.
- Seed que no pisa y pipeline que lee de la base (§7.2).
- `batch_id` y `undoBatch`.

**Lista cuando:** correr el seed de nuevo no cambia ni retira nada existente; un YAML con una unidad nueva de prueba la agrega y nada más; el outline armado desde la base es igual al del YAML en las 30 unidades; `course:lint -- <unidad>` da lo mismo que antes; un test revierte un batch de 3 filas.

### Fase 2 — Palabras
- Pantalla lista + detalle, filtros y Pendientes (sin oraciones todavía).
- Editar significado, nota, gramática y respuestas aceptadas (§5.1–5.3).
- Vista previa de ejercicios.

**Lista cuando:** se corrige *medialuna* ("croissant" → "medialuna" + nota) desde el admin y la vista previa y la app muestran lo nuevo; cargarle género a *café* hace que "un café" se acepte.

### Fase 3 — Oraciones
- Editor de oraciones dentro del detalle (§5.8–5.11): español, inglés, alternativas, glosas a mano, crear y retirar.
- Pausar y despausar con motivos (§3).
- Borrar audio (§5.12).

**Lista cuando:** cada uno de los 9 casos de §3 tiene un test que pausa, y otro que despausa al corregirlo; cambiar "A coffee and a croissant." por "A coffee and a medialuna." deja las glosas pendientes y `course:gloss` las resuelve.

### Fase 4 — Operaciones grandes
- Corregir escritura con resumen (§5.4).
- Mover de unidad con elección de lección (§5.5).
- Retirar y agregar palabras (§5.6–5.7).

**Lista cuando:** cada operación muestra su resumen, aplica todo en un batch y se deshace con un toque; tests de `planSpelling`, `planMove` y `planRetire` con oraciones reales.

---

## 10. Riesgos y preguntas abiertas

- **Alguien edita en el YAML algo que ya existe.** No pasa nada: el seed lo lista como diferencia y no lo aplica, y el aviso arriba del archivo dice dónde editar (§7.2).
- **Mover de unidad (sin decidir).** La propuesta es preguntar la lección con la primera preseleccionada. Revisar después de usarlo un par de veces.
- **Un alumno en medio de una ronda cuando se guarda un cambio.** La ronda sigue con los datos viejos y el cambio se ve en la próxima carga. No se hace nada especial.
- **Una palabra cambia de significado mostrado sin que la toquen.** Editar la glosa de una oración puede cambiar lo que otra palabra muestra en sus ejercicios (el significado es dinámico). La vista previa ayuda a notarlo.
- **Un reemplazo de escritura que sobra.** Reemplazar *mate* como token completo no toca *tomate*. Aun así, el resumen de §5.4 se muestra siempre antes de confirmar.

## 11. Fuera de alcance

- Flujo de aprobación, comentarios o varios editores.
- Regenerar glosas o alternativas con la API desde el admin.
- Generar audio (TTS).
- Editar unidades, lecciones y tips desde esta pantalla (ya existen `units/[id]` y `lessons/[id]`).

---

## 12. Cómo quedó construido (2026-09-18)

**Fase 1 — Base.** Migraciones `20260918000005_admin_words.sql` (§6) y `20260918000006_form_positions.sql`, aplicadas. Reglas compartidas en `src/lib/course-rules/` (`rules`, `tokenize`, `accept`, `check`, `gloss`, `word-answers`, `vocabulary`); los `.mjs` de `scripts/course/lib/` las reexportan y los scripts corren con `--import ./scripts/test/register.mjs`. `unitFromArgs` lee de la base (`scripts/course/lib/vocabulary.mjs`). `build-seed.mjs` solo suma (`scripts/course/lib/seed.mjs`, `--dry-run`). `staffUpdate`/`staffInsert`/`staffDeleteSlot` aceptan `batchId`; `planUndo`/`undoBatch` en `src/lib/admin.ts`.
Verificado: `course:parity` → idénticos (30 unidades, 589 formas); las 50 oraciones de la base dan el mismo lint leyendo del YAML o de la base; `course:seed -- --dry-run` → nada que agregar.

**Fases 2–4.** `src/lib/admin-words.ts` (planes puros + `applyWrites` en un lote), `src/components/admin-words.tsx`, `src/app/admin/words/index.tsx` y `[id].tsx`. Tests: `scripts/course/test/admin-words.test.mjs` (los 9 casos de §3 pausan y despausan; medialuna, café, escritura, mover, retirar, agregar, pendientes), `source-of-truth.test.mjs`, `undo.test.mjs`.

**Diferencias con el plan**
- **`forms.position`** (nuevo): el orden en que la unidad enseña sus palabras vivía solo en el YAML, y las lecciones se arman en ese orden.
- **`course:validate`** revisa el vocabulario de la base; `course:validate -- --yaml` revisa los archivos. **`course:parity`** (nuevo) lista las diferencias YAML ↔ base.
- **Glosas pendientes:** se marcan por token (`gloss_pending`) en vez de deducirse de "tokens sin glosa", porque *che* legítimamente no tiene. `course:gloss` las toma y las limpia; respeta `gloss_source = 'staff'`.
- **Una palabra no enseñada todavía o retirada sigue vinculada** a su oración pausada (en `tokens`), para que al moverla de vuelta o deshacer el retiro la oración se encuentre y se despause.
- **Significado:** se escribe en el lema cuando ninguna otra forma lo lee de ahí (*medialunas* tiene "croissants" propio), no solo cuando el lema tiene una forma.
- **"Sin audio"** se muestra en la palabra pero no cuenta para Pendientes: hoy nada tiene audio, y marcaría las 589.
- Mover de unidad: las lecciones de repaso no se ofrecen como destino.
