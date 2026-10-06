#!/usr/bin/env node
// Plans the classes a unit gets besides its own lessons: three slang words, a
// culture class, a chat with Pancho about the unit. Which words and which
// class each unit plays is decided here, once, and shipped with the app
// (src/lib/unit-extras.json); the lessons themselves are rows on the road
// (kinds speak · slang · culture), put in place by the migration this writes.
// Nothing here is random: the same snapshot and content give the same plan.
//
//   Slang    none in section 1 (she knows a handful of words). From section 2,
//            one unit of every two — of the pair, the one whose topic has slang
//            of its own. A unit's three words are picked by topic first (TOPICS:
//            the unit's title, summary and grammar tags name a topic, a topic
//            names slang themes; plus words the card shares with the unit),
//            then by importance: rank 1 → 3 → unranked, level 1 → 3. How rare a
//            word may be grows with the course (BANDS): A1 gets only level-1
//            words said every day or very often. Never the rude theme, never a
//            word the course teaches itself. A word is used once.
//   Culture  about two units in five, start to end. A class goes to the unit
//            that talks about the same thing where there is one (café unit →
//            ordering at a café, the bondi → the SUBE card); the rest fill the
//            widest gaps: everyday things early, the in-depth ones (how
//            Argentines are, beliefs, protest) late, and of the next few in
//            line the one that has something to do with the unit. A unit
//            keeps the class it already plays (src/lib/unit-extras.json, as
//            the last run left it), so new classes never move old ones.
//            History and the provinces wait for section 6. The swearing
//            section is only for a unit called `puteadas`. A class is used once.
//   Speaking every unit. In section 1 the chat is a first-steps one: a handful
//            of one-word exchanges (supabase/functions/_shared/hablar-unit.ts).
//
//   npm run course:extras -- [<snapshot date>] [--sql <migration file>] [--plan <markdown file> [--why <units>]]
//
// --sql writes the migration that makes every unit's rows match the plan:
// classes that stay keep their row (and so the learner's progress, which is
// by lesson id), new ones get a deterministic id, ones no longer planned are
// retired, never deleted. It is safe to run again, and a later run (new
// units, more words) writes one that only changes what differs.
// --plan writes the plan for a person to read.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';

import { uuid5 } from './lib/ids.mjs';
import { q } from './lib/sql.mjs';

const root = new URL('../../', import.meta.url);
const read = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : null;
};
const sqlFile = flag('--sql');
const planFile = flag('--plan');
/** How many units of the plan say why they got what they got. */
const whyFirst = Number(flag('--why') ?? 40);
const dates = readdirSync(new URL('content/snapshots/', root)).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
const date = argv.find((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--')) ?? dates.at(-1);
const snap = (name) => read(`content/snapshots/${date}/${name}.json`);

// ---------------------------------------------------------------------------
// The road, as course.ts assemble() draws it.
// ---------------------------------------------------------------------------

const EXTRA_KINDS = ['slang', 'culture', 'speak'];
const TITLE = { slang: 'Slang', culture: 'Culture', speak: 'Speaking' };
/** The first section with slang and with a chat: section 1 is A1.1. */
const FIRST_SLANG_SECTION = 2;
const FIRST_SPEAK_SECTION = 1;

const sections = snap('sections').filter((s) => s.status === 'published');
const sectionById = new Map(sections.map((s) => [s.id, s]));
const allLessons = snap('lessons');
const isExtra = (l) => EXTRA_KINDS.includes(l.kind);
// A unit is on the road for its own lessons; one left with only extras isn't.
const withLessons = new Set(allLessons.filter((l) => l.status === 'published' && !isExtra(l)).map((l) => l.unit_id));
const road = snap('units')
  .filter((u) => u.status === 'published' && sectionById.has(u.section_id) && withLessons.has(u.id))
  .map((u) => ({ ...u, section: sectionById.get(u.section_id).ordinal, cefr: sectionById.get(u.section_id).cefr }))
  .sort((a, b) => a.section - b.section || a.ordinal - b.ordinal);
road.forEach((u, i) => (u.index = i));

const fold = (s) =>
  s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
const tokens = (s) => fold(s).split(/[^a-z0-9ñ]+/).filter(Boolean);

// ---------------------------------------------------------------------------
// What a unit is about
// ---------------------------------------------------------------------------

// A topic is named by words in a unit's slug, title, summary and grammar tags
// (folded: no accents, lower case). It brings slang themes (argentine.json)
// and culture classes ("section/class", best first). The order matters for
// culture only: the topics higher up are the more exact matches and choose
// first. A "Practice:" unit is read by its title alone — its summary is a
// sample sentence, not a subject. The slug comes first, so ^ anchors on it.
const TOPICS = [
  { id: 'swearing', unit: /^puteadas\b/, themes: [], culture: ['puteadas/boludo'] },
  { id: 'Christmas', unit: /navidad|las-fiestas/, themes: ['comida'], culture: ['costumbres/navidad-en-verano'] },
  { id: 'birthdays and the calendar', unit: /cumple|birthday|months/, themes: ['noche'], culture: ['costumbres/el-calendario'] },
  { id: 'ordering at a café', unit: /\bcafe\b/, themes: ['comida'], culture: ['buenos-aires/pedir-un-cafe', 'alfajores/facturas'] },
  { id: 'bondi, subte and taxi', unit: /bondi|colectivo|subte|\btren\b|taxi|\bsube\b/, themes: ['ciudad'], culture: ['buenos-aires/la-sube', 'buenos-aires/moverse'] },
  { id: 'the kiosco', unit: /kiosco|alfajor|snack|chicle/, themes: ['comida'], culture: ['alfajores/marcas-y-kioscos', 'alfajores/que-es-un-alfajor', 'alfajores/dulce-de-leche'] },
  { id: 'greetings', unit: /saludos|greet|hello|goodbye|\bhola\b|buen dia/, themes: ['charla'], culture: ['costumbres/el-beso', 'costumbres/que-decir', 'habla/sho-y-che'] },
  { id: 'vos', unit: /as vos\b|pron\.sujeto\.vos/, themes: ['charla'], culture: ['habla/vos-sos-vos'] },
  { id: 'paying', unit: /\bpay\b|cobras|efectivo|debito|credito|tarjeta/, themes: ['plata'], culture: ['buenos-aires/pagar'] },
  { id: 'theft and street smarts', unit: /robaron|afanaron|theft|conned|scam|^ayuda\b|no dejes/, themes: ['ciudad', 'gente'], culture: ['buenos-aires/calle-con-cuidado'] },
  { id: 'the final', unit: /la-final|campeon/, themes: ['futbol'], culture: ['futbol/messi-y-qatar'] },
  { id: 'the stadium', unit: /stadium|cancha|socio/, themes: ['futbol'], culture: ['futbol/la-hinchada'] },
  { id: 'football', unit: /futbol|football|partido|cuadro|\bclub\b|arquero|the game/, themes: ['futbol'], culture: ['futbol/hablar-de-futbol', 'futbol/de-que-cuadro-sos', 'futbol/la-tabla-y-el-descenso', 'futbol/el-diez', 'futbol/mas-alla-de-buenos-aires'] },
  { id: 'the mate round', unit: /mate round|quien-ceba/, themes: ['comida'], culture: ['mate/la-ronda'] },
  { id: 'making mate', unit: /make mate|convido/, themes: ['comida'], culture: ['mate/cebar'] },
  { id: 'mate', unit: /\bmate\b|\bceb[aoe]/, themes: ['comida'], culture: ['mate/que-es-el-mate', 'mate/los-chiches', 'mate/mate-de-todos-los-dias', 'mate/la-ronda', 'mate/cebar', 'mate/mate-en-el-barrio'] },
  { id: 'invited to an asado', unit: /invited to an asado|aplaude/, themes: ['comida'], culture: ['asado/sos-invitado'] },
  { id: 'the parrilla', unit: /parrill|choripan/, themes: ['comida'], culture: ['asado/chori-y-salsas', 'asado/el-orden'] },
  { id: 'asado', unit: /\basado|asador/, themes: ['comida'], culture: ['asado/el-ritual', 'asado/el-fuego', 'asado/el-orden', 'asado/asados-del-pais'] },
  { id: 'pizza', unit: /pizz|muzza/, themes: ['comida'], culture: ['comida/pizza-portena'] },
  { id: 'pasta and the family table', unit: /lo de la abuela|family traditions|fideos/, themes: ['comida', 'gente'], culture: ['comida/herencia-italiana'] },
  { id: 'empanadas', unit: /empanada/, themes: ['comida'], culture: ['comida/empanadas'] },
  { id: 'dessert', unit: /postre|torta|dessert/, themes: ['comida'], culture: ['alfajores/postres-caseros'] },
  { id: 'facturas', unit: /factura|medialuna/, themes: ['comida'], culture: ['alfajores/facturas'] },
  { id: 'going out', unit: /go out|went out|where to go|boliche|previa/, themes: ['noche'], culture: ['costumbres/salir-de-noche', 'musica/cumbia-y-cuarteto'] },
  { id: 'eating out', unit: /restaurant|eat out|la carta|whole table|a la mesa|cenamos|sobremesa/, themes: ['comida'], culture: ['comida/horarios-y-mesa'] },
  { id: 'local customs', unit: /customs|costumbres/, themes: ['noche'], culture: ['costumbres/salir-de-noche', 'comida/horarios-y-mesa', 'costumbres/sin-filtro'] },
  { id: 'time and being late', unit: /tell the time|running late|tipo ocho|arrange to meet/, themes: ['charla'], culture: ['costumbres/la-hora-argentina'] },
  { id: 'lunfardo', unit: /lunfardo|porteno|talk like|barrio slang|chabon|al horno/, themes: ['lunfardo', 'vesre', 'expresiones'], culture: ['habla/lunfardo', 'habla/vesre-re-posta', 'habla/sho-y-che', 'dichos/expresiones-del-dia'] },
  { id: 'sayings', unit: /\bdichos?\b|sayings|with a saying/, themes: ['expresiones'], culture: ['dichos/refranes', 'dichos/filosofia-criolla', 'dichos/mas-que'] },
  { id: 'phones and texting', unit: /celu\b|phone|senal|tu-numero|^te-llam/, themes: [], culture: ['habla/manos-y-chat'] },
  { id: 'being polite', unit: /politely|stranger|thank|permiso|disculpa/, themes: ['charla'], culture: ['costumbres/que-decir'] },
  { id: 'what people are like', unit: /describe the people|what people are like|size up|buena onda|get along|can't stand|compare people/, themes: ['gente', 'cuerpo'], culture: ['costumbres/sin-filtro'] },
  { id: 'the south', unit: /patagonia|\bsur\b/, themes: ['campo'], culture: ['regiones/patagonia'] },
  { id: 'travelling the country', unit: /viaje|\btrip\b|travel|\bruta\b|vacaciones|rosario|out of town/, themes: ['campo', 'ciudad'], culture: ['regiones/el-interior', 'regiones/cuyo', 'regiones/noroeste', 'regiones/litoral', 'regiones/cordoba'] },
  { id: 'the barrios and the city', unit: /barrio|\bcity\b|ciudad|buenos aires|baires|palermo|zona norte/, themes: ['ciudad'], culture: ['buenos-aires/barrios', 'buenos-aires/vida-portena', 'buenos-aires/portenos', 'buenos-aires/iconos-de-la-ciudad'] },
  { id: 'talking about money', unit: /talk about money|cuotas|prices going up/, themes: ['plata'], culture: ['historia-moderna/pensar-en-dolares'] },
  { id: 'money', unit: /cuotas|\bplata\b|money|debts|aumenta|prices|bills|cajero|\bbank\b|ahorr|loteria|\braise\b|\bcosts?\b/, themes: ['plata'], culture: ['historia-moderna/pensar-en-dolares', 'buenos-aires/pagar'] },
  { id: 'voting and the news', unit: /elecciones|\bvot|strike|\bparo\b|headline|read the news|marcha|diario/, themes: ['politica'], culture: ['historia-moderna/golpes-peron-y-evita', 'historia-moderna/la-ultima-dictadura', 'historia-moderna/democracia-y-crisis', 'historia-moderna/de-2003-a-hoy'] },
  { id: 'family roots', unit: /abuelos|roots|came from|barco|instalaron/, themes: ['gente'], culture: ['historia-nacimiento/los-barcos', 'historia-nacimiento/granero-del-mundo'] },
  { id: 'tango', unit: /tango|gardel/, themes: ['lunfardo'], culture: ['tango/gardel', 'tango/nacido-en-el-arrabal', 'tango/la-milonga'] },
  { id: 'music', unit: /music|guitarra|bailas/, themes: ['noche'], culture: ['musica/rock-nacional', 'musica/folklore', 'musica/cumbia-y-cuarteto'] },
  { id: 'childhood', unit: /\bkid\b|chico\b|childhood|primaria|school days|figuritas/, themes: ['gente'], culture: ['iconos/mafalda', 'iconos/historietas-y-pantallas'] },
  { id: 'reading and writing', unit: /read and write|\bescrib/, themes: [], culture: ['iconos/escritores'] },
  // Everyday life (the 2026-10 sections). They come after the topics above, so
  // a unit that already had a class by topic keeps it. No slang themes: the
  // topics below still choose a unit's slang. They read a unit's
  // slug and title only: a summary that mentions a drink is not a unit about drinks.
  { id: 'strikes and marches', unit: /strike|\bparo\b|nothing's running|marcha/, themes: [], titleOnly: true, culture: ['escuela-y-laburo/paros-y-marchas'] },
  { id: 'the news on TV and radio', unit: /headline|read the news|where you heard/, themes: [], titleOnly: true, culture: ['pantallas/la-tele', 'pantallas/la-radio'] },
  { id: 'your building', unit: /edificio|building|consorcio|neighbou?rs/, themes: [], titleOnly: true, culture: ['casa/el-encargado', 'casa/dos-ambientes'] },
  { id: 'renting and moving', unit: /\brent\b|moving house|mud[eo]\b|new place|live in/, themes: [], titleOnly: true, culture: ['casa/dos-ambientes'] },
  { id: 'your place', unit: /your place|\bdepto\b/, themes: [], titleOnly: true, culture: ['casa/dos-ambientes'] },
  { id: 'the shops on the block', unit: /verduler|feria|deli\b|what it costs/, themes: [], titleOnly: true, culture: ['casa/la-cuadra'] },
  { id: 'the weather', unit: /weather|\bheat\b|\bclima\b/, themes: [], titleOnly: true, culture: ['dia-a-dia/el-clima'] },
  { id: 'the doctor', unit: /doctor|check-up|siento mal/, themes: [], titleOnly: true, culture: ['dia-a-dia/al-medico'] },
  { id: 'aches and cures', unit: /duele|dolio|hurt/, themes: [], titleOnly: true, culture: ['creencias/empacho-y-ojeo', 'dia-a-dia/al-medico'] },
  { id: 'the car', unit: /\bcar\b|\bauto\b|driving/, themes: [], titleOnly: true, culture: ['dia-a-dia/manejar'] },
  { id: 'school', unit: /school days|primaria|\bkid\b|figuritas/, themes: [], titleOnly: true, culture: ['escuela-y-laburo/la-escuela', 'juegos/figuritas', 'escuela-y-laburo/egresados'] },
  { id: 'studying', unit: /\bstudy\b|learning castellano|\bstudent\b/, themes: [], titleOnly: true, culture: ['escuela-y-laburo/la-facultad'] },
  { id: 'work', unit: /laburo|\bwork\b|\bjob|living|hiring|\braise\b|promotion|\bascenso\b/, themes: [], titleOnly: true, culture: ['escuela-y-laburo/el-laburo'] },
  { id: 'names and nicknames', unit: /someone's name|\bnombre\b|talk sweet|-ito\b/, themes: [], titleOnly: true, culture: ['familia/apodos'] },
  { id: 'love', unit: /novios|\blove\b|going out with|break-ups/, themes: [], titleOnly: true, culture: ['familia/amor'] },
  { id: 'the big days', unit: /family news|big news|big days|milestones/, themes: [], titleOnly: true, culture: ['familia/casamientos-y-quince'] },
  { id: 'family', unit: /familia|family|parents/, themes: [], titleOnly: true, culture: ['familia/domingo-en-familia', 'familia/casamientos-y-quince'] },
  { id: 'friends', unit: /friends|amigos|get along|who came/, themes: [], titleOnly: true, culture: ['familia/los-amigos'] },
  { id: 'holidays', unit: /holiday|vacaciones|weekend/, themes: [], titleOnly: true, culture: ['vacaciones/enero', 'vacaciones/la-playa', 'vacaciones/escapadas', 'vacaciones/carnaval'] },
  { id: 'free time', unit: /free time|routine|interests you/, themes: [], titleOnly: true, culture: ['deportes/el-club', 'juegos/el-truco', 'pantallas/novelas'] },
  { id: 'jokes and laughs', unit: /laugh|risa|cracked|joke|tease|prank/, themes: [], titleOnly: true, culture: ['pantallas/el-humor', 'pantallas/cine'] },
  { id: 'drinks', unit: /\bdrink|birra|\bvino\b|parrillada|eat out/, themes: [], titleOnly: true, culture: ['bebidas/el-vino', 'bebidas/la-birra', 'bebidas/fernet-y-vermut'] },
  { id: 'luck', unit: /\bluck|suerte|loteria|gut feeling/, themes: [], titleOnly: true, culture: ['juegos/la-quiniela', 'creencias/martes-trece'] },
  // Slang themes only: no culture class is about these.
  { id: 'food', unit: /food|comida|verduler|feria|deli\b|hambre|hungry|cocin|\beat\b|\bate\b|tomar\b|something to eat/, themes: ['comida'], culture: [] },
  { id: 'home and clothes', unit: /\bcasa\b|edificio|building|depto|ropa|clothes|chores|tareas|consorcio|fixed|mud[eo]\b|pileta|llaves|your place/, themes: ['casa'], culture: [] },
  { id: 'the body and health', unit: /duele|dolio|hurt|doctor|siento mal|check-up|altos|morochos/, themes: ['cuerpo'], culture: [] },
  { id: 'feelings', unit: /\bfeel|\bfelt|nervios|bronca|fed up|podrid|pudri|worr|emocion|susto|scare|laugh|risa|asco|gets to you|drives you/, themes: ['animo'], culture: [] },
  { id: 'work', unit: /laburo|\bwork\b|\bjob|living|email|deadline|promotion|\bascenso\b|contrat|entrega/, themes: ['plata'], culture: [] },
  { id: 'people', unit: /familia|family|\bperson\b|novios|love|someone else|point people out|neighbours|who's who/, themes: ['gente'], culture: [] },
  { id: 'gossip and chat', unit: /gossip|scandal|what you heard|pass on|react|opinion|agree|argument/, themes: ['charla', 'expresiones'], culture: [] },
];

const isPractice = (u) => /^practice\b/i.test(u.title_en);
for (const u of road) {
  const hay = fold([u.slug, u.title_en, isPractice(u) ? '' : u.summary_en, isPractice(u) ? '' : (u.grammar_focus ?? []).join(' ')].join(' · '));
  const name = fold([u.slug, u.title_en].join(' · '));
  u.hay = hay;
  u.topics = TOPICS.filter((t) => t.unit.test(t.titleOnly ? name : hay));
  u.themes = [...new Set(u.topics.flatMap((t) => t.themes))];
}

// The course's words: all of them (argentine.ts knownIn), each unit's own, and
// what she has met by the end of each unit.
const lemmas = new Map(snap('lemmas').map((l) => [l.id, l]));
const taught = new Set();
const ownWords = new Map(road.map((u) => [u.id, new Set()]));
for (const f of snap('forms')) {
  if (f.status !== 'published') continue;
  const lemma = lemmas.get(f.lemma_id);
  const spellings = [f.form, ...(lemma ? [lemma.lemma] : [])].map(fold);
  for (const s of spellings) taught.add(s);
  const own = ownWords.get(f.unit_id);
  if (own) for (const s of spellings) for (const t of tokens(s)) own.add(`${lemma?.is_glue ? 'glue:' : ''}${t}`);
}
const metBy = [];
{
  const met = new Set();
  for (const u of road) {
    for (const t of ownWords.get(u.id)) met.add(t.replace(/^glue:/, ''));
    metBy.push(new Set(met));
  }
}

// ---------------------------------------------------------------------------
// Slang
// ---------------------------------------------------------------------------

const SLANG_PER_UNIT = 3;
/** One unit of every this many gets a slang class. */
const SLANG_EVERY = 2;
const UNRANKED = 4;
// Crude or drug words that sit in open themes: fine for an adult who can read
// the warning in the note, so they wait for B1 instead of landing in a
// beginner's third week.
const CRUDE = /(^|-)(pedo|pedos|pedorro|cagar|cagarse|boludo|boluda|pendejo|tarado|chapar|chupar|paja|orto|culo|ortiva|forro|pelotudo|joder|telo|faso|porro|merca|garchar|coger|gato)(-|$)/;

// How rare a word may be, by where the unit is. Each band lists what it
// allows, strictest first: a unit short of words looks one step further.
const BANDS = [
  { upTo: 3, name: 'A1', steps: [(w) => w.level === 1 && w.rank <= 2 && !CRUDE.test(w.id), (w) => w.level === 1 && w.rank <= 3 && !CRUDE.test(w.id)] },
  { upTo: 7, name: 'A2', steps: [(w) => w.level === 1 && !CRUDE.test(w.id), (w) => w.level <= 2 && !CRUDE.test(w.id)] },
  { upTo: 10, name: 'B1', steps: [(w) => w.level <= 2, () => true] },
  { upTo: Infinity, name: 'B2', steps: [() => true] },
];
// Between words equally important, slang — how people talk — goes before the
// regional names for things (artichoke, stapler).
const THEME_ORDER = [
  'charla', 'expresiones', 'gente', 'animo', 'verbos', 'noche', 'plata', 'futbol', 'lunfardo', 'vesre',
  'comida', 'ciudad', 'casa', 'cuerpo', 'politica', 'campo',
];
const STOP_EN = new Set(
  'about what your with from that this they when where have like want make give take find know tell talk say ask more than someone something people things thing practice whole each other others into then them their there here just some every does doing done being were been will would could should'.split(' '),
);

const argentine = read('src/lib/argentine.json');
const slugOf = (s) => fold(s).replace(/ñ/g, 'n').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// `rank` lives in the source file; argentine.json carries it only if the build writes it.
const rankById = new Map(
  parse(readFileSync(new URL('docs/argentine/words.yaml', root), 'utf8')).words.map((w) => [slugOf(w.es), w.rank]),
);
const cleanThemes = new Set(argentine.themes.filter((t) => !t.vulgar).map((t) => t.slug));
for (const t of cleanThemes) if (!THEME_ORDER.includes(t)) throw new Error(`slang theme ${t} has no place in THEME_ORDER`);
for (const t of TOPICS.flatMap((t) => t.themes)) if (!cleanThemes.has(t)) throw new Error(`TOPICS names the slang theme ${t}, which is not a clean theme`);

/** Every word a slang class may play. */
const cards = new Map();
for (const pack of argentine.packs) {
  if (pack.vulgar || !cleanThemes.has(pack.theme)) continue;
  for (const w of pack.words) {
    if (cards.has(w.id) || taught.has(fold(w.es))) continue;
    cards.set(w.id, {
      id: w.id,
      es: w.es,
      en: w.en,
      theme: pack.theme,
      level: w.level,
      rank: w.rank ?? rankById.get(w.id) ?? UNRANKED,
      esTokens: new Set([...tokens(w.es), ...tokens(w.example.es)]),
      exampleTokens: tokens(w.example.es),
      enTokens: new Set(tokens(w.en).filter((t) => t.length >= 4 && !STOP_EN.has(t))),
      noteTokens: new Set(tokens(w.note ?? '').filter((t) => t.length >= 4 && !STOP_EN.has(t))),
    });
  }
}

/** How much a word has to do with a unit, and why; null when it has nothing
 *  to do with it. The theme makes the match: a unit about football takes
 *  football words. What else they share only says which of them come first. */
function topicScore(u, w) {
  const topic = u.topics.find((t) => t.themes.includes(w.theme));
  if (!topic) return null;
  let score = 3;
  const why = [`topic "${topic.id}" ↔ theme ${w.theme}`];
  // Words the unit teaches that the card uses (its example is then partly readable).
  const own = ownWords.get(u.id);
  const sharedEs = [...w.esTokens].filter((t) => t.length >= 4 && own.has(t));
  if (sharedEs.length) {
    score += Math.min(2, sharedEs.length);
    why.push(`shares "${sharedEs.slice(0, 2).join('", "')}" with the unit`);
  }
  // What the unit is about, in English, against the card's translation and note.
  const about = tokens(u.title_en).filter((t) => t.length >= 4 && !STOP_EN.has(t));
  if (about.some((t) => w.enTokens.has(t))) {
    score += 2;
    why.push(`means "${w.en}"`);
  } else {
    const inNote = about.find((t) => w.noteTokens.has(t));
    if (inNote) {
      score += 1;
      why.push(`its note mentions "${inNote}"`);
    }
  }
  return { score, why: why.join('; ') };
}

/** The share of a word's example she can already read at this unit. */
const readable = (u, w) => w.exampleTokens.filter((t) => metBy[u.index].has(t)).length / Math.max(1, w.exampleTokens.length);
const importance = (a, b) =>
  a.rank - b.rank || a.level - b.level || THEME_ORDER.indexOf(a.theme) - THEME_ORDER.indexOf(b.theme) || a.id.localeCompare(b.id);
// A unit with no topic of its own gets everyday talk: the words of a
// specialist theme (football, politics, the countryside, old lunfardo) wait
// for the units about them, and fill in only when nothing else is left.
const SPECIALIST = new Set(['futbol', 'politica', 'campo', 'lunfardo', 'vesre']);
const fillSteps = (band) => [...band.steps.map((ok) => (w) => ok(w) && !SPECIALIST.has(w.theme)), ...band.steps];

// Which units: from section 2, the units of a section go in pairs, and of
// each pair the one whose topic has slang of its own gets the class (the
// first, if both or neither do). Pairs start again with every section, so a
// unit added later only moves the classes of its own section.
const slangUnits = [];
for (const s of sections.filter((x) => x.ordinal >= FIRST_SLANG_SECTION)) {
  const inSection = road.filter((u) => u.section === s.ordinal);
  for (let i = 0; i + SLANG_EVERY <= inSection.length; i += SLANG_EVERY) {
    const group = inSection.slice(i, i + SLANG_EVERY);
    slangUnits.push(group.find((u) => u.themes.length && !isPractice(u)) ?? group[0]);
  }
}

const usedWords = new Set();
const slangOf = new Map(slangUnits.map((u) => [u.id, []]));
const take = (u, w, why) => {
  usedWords.add(w.id);
  slangOf.get(u.id).push({ id: w.id, es: w.es, en: w.en, why });
};
// Band by band, so the commonest words are spent early. Within a band…
for (const band of BANDS) {
  const here = slangUnits.filter((u) => BANDS.find((x) => u.section <= x.upTo) === band);
  // …first the words that belong to a unit's topic, so a football unit's
  // words are still there when the road reaches it…
  for (const u of here) {
    const matches = [...cards.values()]
      .filter((w) => !usedWords.has(w.id) && band.steps[0](w))
      .map((w) => ({ w, ...topicScore(u, w) }))
      .filter((m) => m.score)
      .sort((x, y) => y.score - x.score || importance(x.w, y.w));
    for (const m of matches.slice(0, SLANG_PER_UNIT)) take(u, m.w, m.why);
  }
  // …then, in course order, the most important words left. A class takes its
  // words from different themes when it can.
  for (const u of here) {
    const mine = slangOf.get(u.id);
    for (const allowed of fillSteps(band)) {
      while (mine.length < SLANG_PER_UNIT) {
        const left = [...cards.values()].filter((w) => !usedWords.has(w.id) && allowed(w)).sort(importance);
        if (!left.length) break;
        const tier = left.filter((w) => w.rank === left[0].rank && w.level === left[0].level);
        const themesHere = new Set(mine.map((m) => cards.get(m.id).theme));
        const fresh = tier.filter((w) => !themesHere.has(w.theme));
        const pool = fresh.length ? fresh : tier;
        // In A1 the example she can read most of wins.
        const pick = band.name === 'A1' ? [...pool].sort((x, y) => readable(u, y) - readable(u, x) || importance(x, y))[0] : pool[0];
        take(u, pick, `importance: ${pick.rank === UNRANKED ? 'unranked' : `rank ${pick.rank}`}, level ${pick.level}`);
      }
    }
    // A class is three words or it isn't one.
    if (mine.length < SLANG_PER_UNIT) {
      for (const m of mine) usedWords.delete(m.id);
      slangOf.delete(u.id);
    }
  }
}

// ---------------------------------------------------------------------------
// Culture
// ---------------------------------------------------------------------------

/** Easy and everyday first. The two history sections are one story, told in order. */
const CULTURE_ORDER = [
  ['mate'], ['asado'], ['comida'], ['alfajores'], ['futbol'], ['costumbres'], ['buenos-aires'], ['habla'],
  ['asi-somos'], ['familia'], ['casa'], ['dia-a-dia'], ['bebidas'], ['juegos'], ['vacaciones'], ['naturaleza'], ['deportes'],
  ['pantallas'], ['creencias'], ['escuela-y-laburo'],
  ['musica'], ['tango'], ['dichos'], ['iconos'], ['regiones'], ['historia-nacimiento', 'historia-moderna'],
];
/** Not before she has some Spanish to talk about them. */
const LATER_SECTIONS = new Set(['regiones', 'historia-nacimiento', 'historia-moderna']);
const FIRST_LATER_SECTION = 6;
/** Rude: only for the units named here. */
const ADULT_SECTIONS = new Set(['puteadas']);
const ADULT_UNITS = new Set(['puteadas']);

const culture = read('src/lib/culture.json').sections;
for (const s of culture) {
  if (!CULTURE_ORDER.flat().includes(s.slug) && !ADULT_SECTIONS.has(s.slug)) throw new Error(`culture section ${s.slug} has no place in CULTURE_ORDER`);
}
const classes = new Map(culture.flatMap((s) => s.classes.map((c) => [`${s.slug}/${c.slug}`, { section: s.slug, class: c.slug, title: c.title }])));
for (const key of TOPICS.flatMap((t) => t.culture)) if (!classes.has(key)) throw new Error(`TOPICS names the culture class ${key}, which does not exist`);

const usedClasses = new Set();
const cultureOf = new Map();
const mayPlay = (u, key) => {
  const { section } = classes.get(key);
  if (ADULT_SECTIONS.has(section)) return ADULT_UNITS.has(u.slug);
  return !LATER_SECTIONS.has(section) || u.section >= FIRST_LATER_SECTION;
};
/** How many units in a row would have a class if this one got one. */
const runWith = (u) => {
  let n = 1;
  for (let i = u.index - 1; i >= 0 && cultureOf.has(road[i].id); i--) n++;
  for (let i = u.index + 1; i < road.length && cultureOf.has(road[i].id); i++) n++;
  return n;
};
const MAX_RUN = 2;
const neighbourOn = (u, topic) => [road[u.index - 1], road[u.index + 1]].some((n) => n && cultureOf.get(n.id)?.topic === topic);
const give = (u, key, why, topic) => {
  usedClasses.add(key);
  cultureOf.set(u.id, { ...classes.get(key), why, topic });
};

// A unit keeps the class it already plays: a learner who did it keeps it, and
// more classes only ever fill units that had none.
{
  let before = {};
  try {
    before = read('src/lib/unit-extras.json').units ?? {};
  } catch {}
  for (const u of road) {
    const c = before[u.slug]?.culture;
    const key = c && `${c.section}/${c.class}`;
    if (key && classes.has(key) && !usedClasses.has(key) && mayPlay(u, key)) give(u, key, 'already plays it');
  }
}
// A unit named like a class is about that class.
const bySlug = new Map([...classes].map(([key, c]) => [c.class, key]));
for (const u of road) {
  const key = bySlug.get(u.slug);
  if (key && !cultureOf.has(u.id) && !usedClasses.has(key) && !ADULT_SECTIONS.has(classes.get(key).section) && mayPlay(u, key)) give(u, key, 'the unit and the class share a name');
}
// Then topic by topic, the most exact first; within a topic in course order.
// Classes don't pile up: at most two units in a row get one, and never two
// side by side for the same topic (a unit and its twin share one).
for (const topic of TOPICS) {
  for (const u of road) {
    if (cultureOf.has(u.id) || !u.topics.includes(topic) || runWith(u) > MAX_RUN || neighbourOn(u, topic)) continue;
    const key = topic.culture.find((k) => !usedClasses.has(k) && mayPlay(u, k));
    if (key) give(u, key, `topic "${topic.id}"`, topic);
  }
}
// The rest go where the road is longest without one. FILL lists them in the
// order they are placed, each with the sections it may land in (everyday
// things early, the in-depth ones late) and the words of a unit it has
// something to do with. Classes not listed (the older sections) follow in
// CULTURE_ORDER, anywhere they may play.
const EARLY = [1, 7];
const MIDDLE = [4, 12];
const LATE = [9, 15];
const FILL = [
  ['familia/apodos', EARLY, /name|nombre|who's who|point people/],
  ['naturaleza/el-carpincho', EARLY, /animal|describe|how they are|what there is/],
  ['casa/la-cuadra', EARLY, /buy|kiosco|costs|snack|shop/],
  ['familia/domingo-en-familia', EARLY, /family|familia|table|eat|hungry/],
  ['dia-a-dia/el-clima', EARLY, /cold|hot|weather|how you feel|sleepy/],
  ['casa/dos-ambientes', EARLY, /where something is|your things|around you|place|building/],
  ['casa/el-encargado', EARLY, /building|neighbou?r|barrio|around/],
  ['naturaleza/pajaros', EARLY, /around|city|barrio|corner|park|color/],
  ['familia/los-amigos', EARLY, /friend|plans|free time|what you do|like/],
  ['deportes/el-club', EARLY, /free time|routine|what you do|barrio|interest/],
  ['escuela-y-laburo/la-escuela', EARLY, /study|learn|school|kid|read and write/],
  ['vacaciones/enero', EARLY, /trip|weekend|holiday|where you went|plans|months/],
  ['vacaciones/la-playa', EARLY, /trip|weekend|holiday|where you went|heat/],
  ['dia-a-dia/manejar', EARLY, /taxi|car|directions|way around|trip/],
  ['dia-a-dia/al-medico', EARLY, /hurt|doctor|feel|emergency|help/],
  ['bebidas/la-birra', MIDDLE, /order|table|go out|bar|friends|night/],
  ['bebidas/el-vino', MIDDLE, /ate|eat|brought|table|parrill|restaurant/],
  ['juegos/figuritas', MIDDLE, /kid|child|used to|loved|collect/],
  ['juegos/el-truco', MIDDLE, /free time|friends|game|plans|lie|pretend/],
  ['familia/amor', MIDDLE, /love|going out|novi|couple|someone/],
  ['familia/casamientos-y-quince', MIDDLE, /news|birthday|party|wish|big day|family/],
  ['bebidas/fernet-y-vermut', MIDDLE, /go out|night|party|friends|traditions/],
  ['vacaciones/escapadas', MIDDLE, /trip|weekend|town|car|plans|next week/],
  ['vacaciones/carnaval', MIDDLE, /tradition|customs|holiday|party|music/],
  ['escuela-y-laburo/egresados', MIDDLE, /school|memories|remember|used to|trip/],
  ['escuela-y-laburo/la-facultad', MIDDLE, /study|learn|career|what you do|living/],
  ['escuela-y-laburo/el-laburo', MIDDLE, /job|work|laburo|boss|hiring|payday|raise/],
  ['juegos/la-quiniela', MIDDLE, /dream|guess|wonder|likely|luck|number/],
  ['creencias/martes-trece', MIDDLE, /warn|not to|luck|scare|guess|likely|careful/],
  ['deportes/pumas-y-leonas', MIDDLE, /team|game|best|compare|soccer/],
  ['deportes/el-pato', MIDDLE, /team|game|story|used to|country/],
  ['deportes/polo', MIDDLE, /best|compare|horse|country|rich/],
  ['deportes/fierros', MIDDLE, /car|drive|fast|story|team/],
  ['pantallas/la-tele', MIDDLE, /news|heard|said|gossip|scandal|react/],
  ['pantallas/novelas', MIDDLE, /story|said|love|drama|what happened/],
  ['pantallas/cine', LATE, /story|twist|laugh|what happened|cry/],
  ['creencias/gauchito-gil', LATE, /road|trip|car|wish|favor|promise/],
  ['asi-somos/el-ego', LATE, /best|compare|opinion|pretend|as if|size up/],
  ['asi-somos/la-queja', LATE, /complain|fed up|angry|annoy|doesn't work|prices/],
  ['asi-somos/todos-opinan', LATE, /opinion|agree|argument|sides|advice|case/],
  ['asi-somos/el-drama', LATE, /felt|feel|emotion|moved|cry|exaggerat|scare/],
  ['creencias/empacho-y-ojeo', LATE, /hurt|advice|doctor|calm|stress|believe/],
  ['escuela-y-laburo/paros-y-marchas', LATE, /strike|news|running|city|vote/],
  ['pantallas/el-humor', LATE, /laugh|joke|tease|prank|nonsense/],
  ['pantallas/la-radio', LATE, /heard|news|listen|said|source/],
  ['creencias/caminar-a-lujan', LATE, /promise|wish|regret|hard|keep going/],
  ['asi-somos/argentinos-afuera', LATE, /came from|roots|abroad|back|miss|goodbye|trip/],
  ['asi-somos/sobrevivir', LATE, /prices|money|payday|changed|debts|what if|regret/],
];
for (const [key] of FILL) if (!classes.has(key)) throw new Error(`FILL names the culture class ${key}, which does not exist`);
const fallback = FILL.filter(([key]) => !usedClasses.has(key));
{
  const tracks = CULTURE_ORDER.map((slugs) => slugs.flatMap((slug) => culture.find((s) => s.slug === slug)?.classes.map((c) => `${slug}/${c.slug}`) ?? []));
  const listed = new Set(FILL.map(([key]) => key));
  for (let round = 0; tracks.some((t) => round < t.length); round++) {
    for (const t of tracks) if (round < t.length && !usedClasses.has(t[round]) && !listed.has(t[round])) fallback.push([t[round], [1, Infinity], null]);
  }
}
// Each class goes to the unit furthest from any other class, among the units
// it may land in; of the units about as far, one it has to do with wins.
for (const [key, [from, to], hint] of fallback) {
  const gap = (u) => {
    let before = 0;
    while (u.index - before - 1 >= 0 && !cultureOf.has(road[u.index - before - 1].id)) before++;
    let after = 0;
    while (u.index + after + 1 < road.length && !cultureOf.has(road[u.index + after + 1].id)) after++;
    return Math.min(before, after);
  };
  const open = road
    .filter((u) => !cultureOf.has(u.id) && u.section >= from && u.section <= to && mayPlay(u, key) && runWith(u) <= MAX_RUN)
    .map((u) => ({ u, gap: gap(u) }))
    .sort((x, y) => y.gap - x.gap || x.u.index - y.u.index);
  if (!open.length) continue;
  const near = hint && open.find((o) => o.gap >= Math.max(1, open[0].gap - 1) && !isPractice(o.u) && hint.test(o.u.hay));
  give((near || open[0]).u, key, near ? 'fills a gap, has to do with the unit' : 'fills a gap');
}

// ---------------------------------------------------------------------------
// Out
// ---------------------------------------------------------------------------

const wantsSpeak = (u) => u.section >= FIRST_SPEAK_SECTION;
const units = {};
for (const u of road) {
  const slang = slangOf.get(u.id);
  const cls = cultureOf.get(u.id);
  units[u.slug] = {
    ...(slang ? { slang: slang.map((w) => w.id) } : {}),
    ...(cls ? { culture: { section: cls.section, class: cls.class } } : {}),
  };
}
writeFileSync(new URL('src/lib/unit-extras.json', root), `${JSON.stringify({ snapshot: date, units }, null, 1)}\n`);

// What the migration will do to the rows, worked out from the snapshot the
// same way the SQL does it (reconcile(), below).
const changes = reconcile();

console.log(`snapshot ${date}: ${road.length} units`);
console.log('  section  units  slang  culture  speak');
for (const s of sections.sort((a, b) => a.ordinal - b.ordinal)) {
  const us = road.filter((u) => u.section === s.ordinal);
  const n = (f) => String(us.filter(f).length).padStart(5);
  console.log(`  ${String(s.ordinal).padStart(2)} ${s.cefr.padEnd(5)} ${n(() => true)} ${n((u) => slangOf.has(u.id))}  ${n((u) => cultureOf.has(u.id))}  ${n(wantsSpeak)}`);
}
console.log(`  slang    ${usedWords.size} of ${cards.size} words → ${slangOf.size} units`);
console.log(`  culture  ${usedClasses.size} of ${classes.size} classes → ${cultureOf.size} units (${[...cultureOf.values()].filter((c) => !c.why.startsWith('fills')).length} by topic)`);
console.log(`  speaking ${road.filter(wantsSpeak).length} units`);
console.log(`  rows     ${changes.added} added · ${changes.retired} retired · ${changes.moved} moved · ${changes.kept} stay where they are`);
for (const k of EXTRA_KINDS) {
  const c = changes.byKind[k];
  console.log(`    ${k.padEnd(8)} ${c.added} added · ${c.retired} retired · ${c.moved} moved · ${c.kept} stay`);
}
console.log('wrote src/lib/unit-extras.json');

if (planFile) {
  writeFileSync(new URL(planFile, root), planText());
  console.log(`wrote ${planFile}`);
}
if (sqlFile) {
  writeFileSync(new URL(sqlFile, root), migration());
  console.log(`wrote ${sqlFile}`);
}

/** Where the extras sit among a unit's own lessons: slang a third of the way
 *  in, culture two thirds in, the chat last, just before the unit check. */
function sequence(body, checks, extra) {
  const m = body.length;
  const a = Math.max(1, Math.round(m / 3));
  const b = Math.max(a, Math.round((2 * m) / 3));
  return [
    ...body.slice(0, a),
    ...(extra.slang ? [extra.slang] : []),
    ...body.slice(a, b),
    ...(extra.culture ? [extra.culture] : []),
    ...body.slice(b),
    ...(extra.speak ? [extra.speak] : []),
    ...checks,
  ];
}

function reconcile() {
  const out = { added: 0, retired: 0, moved: 0, kept: 0, byKind: {} };
  for (const k of EXTRA_KINDS) out.byKind[k] = { added: 0, retired: 0, moved: 0, kept: 0 };
  const count = (kind, what) => {
    out[what]++;
    out.byKind[kind][what]++;
  };
  for (const u of road) {
    const mine = allLessons.filter((l) => l.unit_id === u.id).sort((x, y) => x.ordinal - y.ordinal);
    const published = mine.filter((l) => l.status === 'published');
    const body = published.filter((l) => l.kind !== 'review' && !isExtra(l)).map((l) => l.id);
    const checks = published.filter((l) => l.kind === 'review').map((l) => l.id);
    const want = { slang: slangOf.has(u.id), culture: cultureOf.has(u.id), speak: wantsSpeak(u) };
    const extra = {};
    for (const kind of EXTRA_KINDS) {
      const rows = mine.filter((l) => l.kind === kind);
      const keeper = rows.find((l) => l.status === 'published') ?? rows.find((l) => l.id === extraId(u, kind)) ?? rows[0];
      if (want[kind]) {
        extra[kind] = keeper?.id ?? extraId(u, kind);
        if (!keeper || keeper.status !== 'published') count(kind, 'added');
      }
      for (const l of rows) if (l.status === 'published' && !(want[kind] && l.id === keeper.id)) count(kind, 'retired');
    }
    sequence(body, checks, extra).forEach((id, i) => {
      const was = published.find((l) => l.id === id);
      if (was && isExtra(was)) count(was.kind, was.ordinal === i + 1 ? 'kept' : 'moved');
    });
  }
  return out;
}

/** A new row's id: the same on every run, so the migration can be made again. */
function extraId(u, kind) {
  return uuid5(`lesson:${u.slug}:${kind}`);
}

function planText() {
  const lines = [
    `# Unit extras plan (snapshot ${date})`,
    '',
    `${road.length} units · slang in ${slangOf.size} (${usedWords.size} of ${cards.size} words) · culture in ${cultureOf.size} (${usedClasses.size} of ${classes.size} classes) · a chat with Pancho in ${road.filter(wantsSpeak).length}.`,
    '',
    `Rows: ${changes.added} added, ${changes.retired} retired, ${changes.moved} moved, ${changes.kept} stay where they are.`,
    '',
    '| section | units | slang | culture | speak |',
    '|---|---|---|---|---|',
    ...sections.map((s) => {
      const us = road.filter((u) => u.section === s.ordinal);
      return `| ${s.ordinal} ${s.cefr} ${s.title_en} | ${us.length} | ${us.filter((u) => slangOf.has(u.id)).length} | ${us.filter((u) => cultureOf.has(u.id)).length} | ${us.filter(wantsSpeak).length} |`;
    }),
  ];
  for (const u of road) {
    if (u.index === 0 || road[u.index - 1].section !== u.section) {
      const s = sections.find((x) => x.ordinal === u.section);
      lines.push('', `## Section ${s.ordinal} · ${s.cefr} · ${s.title_en}`, '');
    }
    const slang = slangOf.get(u.id);
    const cls = cultureOf.get(u.id);
    lines.push(
      `${u.index + 1}. **${u.title_en}** (\`${u.slug}\`) — slang: ${slang ? slang.map((w) => `${w.es} (${w.en})`).join(' · ') : '—'} | culture: ${cls ? `${cls.section}/${cls.class} “${cls.title}”` : '—'} | speak: ${wantsSpeak(u) ? 'yes' : 'no'}`,
    );
    if (u.index < whyFirst) {
      const why = [];
      if (slang) why.push(...slang.map((w) => `${w.es}: ${w.why}`));
      else why.push(u.section < FIRST_SLANG_SECTION ? 'no slang in section 1' : 'no slang: the other unit of its pair has it');
      if (cls) why.push(`${cls.class}: ${cls.why}`);
      if (!wantsSpeak(u)) why.push('no chat in section 1');
      lines.push(`   - why: ${why.join(' · ')}`);
    }
  }
  const unusedClasses = [...classes.keys()].filter((k) => !usedClasses.has(k));
  lines.push('', '## Left over', '', `Culture classes not on the road: ${unusedClasses.join(', ') || 'none'}.`, `Slang words not on the road: ${cards.size - usedWords.size}.`, '');
  return lines.join('\n');
}

function migration() {
  const rows = road
    .map((u) => {
      const want = { slang: slangOf.has(u.id), culture: cultureOf.has(u.id), speak: wantsSpeak(u) };
      return `  (${q(u.slug)}, ${EXTRA_KINDS.map((k) => want[k]).join(', ')}, ${EXTRA_KINDS.map((k) => `${q(extraId(u, k))}::uuid`).join(', ')})`;
    })
    .join(',\n');
  return `-- ---------------------------------------------------------------------------
-- A unit's extra classes, re-planned (scripts/course/unit-extras.mjs wrote
-- this from the ${date} snapshot; src/lib/unit-extras.json says what they play):
--   slang    three Argentine words: none in section 1, then one unit of every two
--   culture  a culture class: about one unit in four, start to end
--   speak    a chat with Pancho about the unit: none in section 1, then every unit
--
-- Every unit named below ends up with exactly the classes planned for it, in
-- their place: slang a third of the way in, culture two thirds in, the chat
-- last, just before the unit check. A class that stays keeps its row, so what
-- a learner did on it stays hers. A class no longer planned is retired, never
-- deleted. A new one gets the id written here. Units not named are left alone.
-- Running this twice changes nothing the second time.
--
-- From the snapshot: ${changes.added} rows added, ${changes.retired} retired, ${changes.moved} moved, ${changes.kept} already in place.
-- ---------------------------------------------------------------------------

create temp table unit_extras (
  slug text primary key,
  slang boolean not null, culture boolean not null, speak boolean not null,
  slang_id uuid not null, culture_id uuid not null, speak_id uuid not null
);
insert into unit_extras (slug, slang, culture, speak, slang_id, culture_id, speak_id) values
${rows};

-- Classes new to the road, or moved earlier in their unit: done already for
-- whoever is past them (below).
create temp table extras_fresh (lesson_id uuid primary key);

do $$
declare
  u record;
  k record;
  body uuid[];
  checks uuid[];
  seq uuid[];
  now_ids uuid[];
  now_ordinals int[];
  placed uuid[];
  keeper record;
  was_after int;
  m int;
  a int;
  b int;
  i int;
  top int;
begin
  for u in
    select un.id, ex.*
    from unit_extras ex
    join public.units un on un.slug = ex.slug
    where un.status = 'published'
      and exists (
        select 1 from public.lessons l
        where l.unit_id = un.id and l.status = 'published' and l.kind not in ('speak', 'slang', 'culture')
      )
  loop
    select coalesce(array_agg(id order by ordinal), '{}') into body
    from public.lessons
    where unit_id = u.id and status = 'published' and kind not in ('review', 'speak', 'slang', 'culture');
    select coalesce(array_agg(id order by ordinal), '{}') into checks
    from public.lessons where unit_id = u.id and status = 'published' and kind = 'review';
    m := coalesce(array_length(body, 1), 0);
    a := greatest(1, round(m / 3.0)::int);
    b := greatest(a, round(2 * m / 3.0)::int);

    placed := array[null, null, null]::uuid[];
    for k in
      select * from (values
        (1, 'slang', 'Slang', u.slang, u.slang_id, a),
        (2, 'culture', 'Culture', u.culture, u.culture_id, b),
        (3, 'speak', 'Speaking', u.speak, u.speak_id, m)
      ) as t(n, kind, title, wanted, new_id, after)
    loop
      -- The row to keep: the one on the road; failing that, one retired earlier.
      select l.id, l.status, l.ordinal into keeper
      from public.lessons l
      where l.unit_id = u.id and l.kind = k.kind
      order by (l.status = 'published') desc, (l.id = k.new_id) desc, l.ordinal
      limit 1;

      if k.wanted then
        if keeper.id is null then
          -- Below zero until the unit is renumbered: (unit_id, ordinal) is unique.
          insert into public.lessons (id, unit_id, ordinal, title_en, kind, status)
          values (k.new_id, u.id, -1000 - k.n, k.title, k.kind, 'published');
          insert into extras_fresh values (k.new_id) on conflict do nothing;
          placed[k.n] := k.new_id;
        else
          if keeper.status <> 'published' then
            update public.lessons set status = 'published', title_en = k.title where id = keeper.id;
            insert into extras_fresh values (keeper.id) on conflict do nothing;
          else
            select count(*) into was_after
            from public.lessons
            where unit_id = u.id and status = 'published' and ordinal < keeper.ordinal
              and kind not in ('review', 'speak', 'slang', 'culture');
            if k.after < was_after then
              insert into extras_fresh values (keeper.id) on conflict do nothing;
            end if;
            update public.lessons set title_en = k.title where id = keeper.id and title_en is distinct from k.title;
          end if;
          placed[k.n] := keeper.id;
        end if;
      end if;

      update public.lessons set status = 'retired'
      where unit_id = u.id and kind = k.kind and status = 'published' and id is distinct from placed[k.n];
    end loop;

    seq := body[1:a]
      || case when placed[1] is null then '{}'::uuid[] else array[placed[1]] end
      || body[a + 1:b]
      || case when placed[2] is null then '{}'::uuid[] else array[placed[2]] end
      || body[b + 1:m]
      || case when placed[3] is null then '{}'::uuid[] else array[placed[3]] end
      || checks;

    -- Retired and draft lessons low enough to collide go past the end.
    select greatest(31000, coalesce(max(ordinal), 0)) into top
    from public.lessons where unit_id = u.id and ordinal >= 1000;
    update public.lessons l set ordinal = top + p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status <> 'published' and ordinal < 1000
    ) p
    where l.id = p.id;

    -- Already as planned: leave the unit's rows untouched.
    select coalesce(array_agg(id order by ordinal), '{}'), coalesce(array_agg(ordinal::int order by ordinal), '{}')
    into now_ids, now_ordinals
    from public.lessons where unit_id = u.id and status = 'published';
    continue when now_ids = seq and now_ordinals = (select coalesce(array_agg(g), '{}') from generate_series(1, coalesce(array_length(seq, 1), 0)) g);

    update public.lessons l set ordinal = -5000 - p.n
    from (
      select id, row_number() over (order by ordinal) as n
      from public.lessons where unit_id = u.id and status = 'published'
    ) p
    where l.id = p.id;
    for i in 1 .. array_length(seq, 1) loop
      update public.lessons set ordinal = i where id = seq[i];
    end loop;
  end loop;
end;
$$;

-- Done already for whoever is past it, so nobody is sent back down the road
-- (credit_fresh_lessons, 20261005000022).
select public.credit_fresh_lessons(array(select lesson_id from extras_fresh));

drop table unit_extras;
drop table extras_fresh;
`;
}
