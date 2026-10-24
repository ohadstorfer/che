import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// The deck of mid-lesson cheers: a hundred full screens, so a run of right
// answers never gets the same pat on the back twice in a week.
//
// Each one is a mix of five parts the screen (lesson-cheer.tsx) knows how to
// draw: how the colour arrives (`scene`), what moves behind him (`deco`), how
// the words sit (`layout`), who is on it (`art`), and what it says. The mixes
// are picked by hand rather than at random, so every colour has art and words
// that sit well on it.
//
// `when` is the moment it's for: `run` the first five in a row, `back` five in
// a row after a miss, `big` ten and every five after. The deck deals from the
// right pile and keeps what she has seen on the phone, so she goes through
// (nearly) the whole pile before any comes round again.
// ---------------------------------------------------------------------------

export type CheerWhen = 'run' | 'back' | 'big';
export type Scene = 'rise' | 'drop' | 'left' | 'right' | 'doors' | 'sun' | 'iris' | 'fade' | 'blinds' | 'tilt';
export type Deco = 'none' | 'rays' | 'rain' | 'confetti' | 'burst' | 'rings' | 'sparkles' | 'stripes' | 'food' | 'balloons' | 'ticker';
export type Layout = 'hero' | 'count' | 'stamps' | 'badge' | 'polaroid' | 'bubble' | 'medal';
export type Tint = 'rosa' | 'butter' | 'sage' | 'mint' | 'lav' | 'sky' | 'peach' | 'flame' | 'night' | 'oat';

export const ART = {
  wave: require('@/assets/images/capybara/capybara-saludando-figure.webp'),
  cafe: require('@/assets/images/capybara/capybara-gaucho-cafe-figure.webp'),
  sip: require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.webp'),
  hand: require('@/assets/images/capybara/capybara-puteadas-figure.webp'),
  flag: require('@/assets/images/capybara/capybara-historia-figure.webp'),
  mate: require('@/assets/images/capybara/capybara-mate-figure.webp'),
  amargo: require('@/assets/images/capybara/capybara-mate-amargo-figure.webp'),
  asado: require('@/assets/images/capybara/capybara-asado-figure.webp'),
  gol: require('@/assets/images/capybara/capybara-futbol-gol-figure.webp'),
  kick: require('@/assets/images/capybara/capybara-futbol-pateando-figure.webp'),
  tango: require('@/assets/images/capybara/capybara-tango-figure.webp'),
  gaucho: require('@/assets/images/capybara/capybara-gaucho-figure.webp'),
  musica: require('@/assets/images/capybara/capybara-musica-figure.webp'),
  alfajor: require('@/assets/images/capybara/capybara-alfajor-figure.webp'),
  maicena: require('@/assets/images/capybara/capybara-alfajor-maicena-figure.webp'),
  choripan: require('@/assets/images/capybara/capybara-choripan-figure.webp'),
  dulce: require('@/assets/images/capybara/capybara-dulce-de-leche-figure.webp'),
  empanadas: require('@/assets/images/capybara/capybara-empanadas-figure.webp'),
  facturas: require('@/assets/images/capybara/capybara-facturas-figure.webp'),
  milanesa: require('@/assets/images/capybara/capybara-milanesa-figure.webp'),
  ponchomate: require('@/assets/images/onboarding/pancho-mate.png'),
} as const;
export type Art = keyof typeof ART;

/** Little things that fall (or float) past him on the `food` and `balloons` decos. */
export const BITS = {
  alfajor: require('@/assets/images/objects/alfajor-figure.webp'),
  empanada: require('@/assets/images/objects/empanadas-figure.webp'),
  medialuna: require('@/assets/images/objects/medialuna-figure.webp'),
  mate: require('@/assets/images/objects/mate-figure.webp'),
  pelota: require('@/assets/images/objects/futbol-figure.webp'),
  choripan: require('@/assets/images/objects/choripan-figure.webp'),
  helado: require('@/assets/images/objects/helado-figure.webp'),
  pizza: require('@/assets/images/objects/porcion-figure.webp'),
  escarapela: require('@/assets/images/objects/escarapela-figure.webp'),
  dulce: require('@/assets/images/objects/dulce-de-leche-figure.webp'),
  facturas: require('@/assets/images/objects/facturas-figure.webp'),
  copa: require('@/assets/images/objects/futbol-copa-figure.webp'),
  camiseta: require('@/assets/images/objects/futbol-camiseta-figure.webp'),
  clavel: require('@/assets/images/objects/clavel-rojo-figure.webp'),
  sombrero: require('@/assets/images/objects/tango-sombrero-figure.webp'),
  bombo: require('@/assets/images/objects/musica-bombo-figure.webp'),
  cotillon: require('@/assets/images/objects/cotillon-figure.webp'),
  caramelos: require('@/assets/images/objects/caramelos-figure.webp'),
} as const;
export type BitName = keyof typeof BITS;

export interface CheerDesign {
  id: number;
  when: CheerWhen;
  scene: Scene;
  deco: Deco;
  layout: Layout;
  tint: Tint;
  art: Art;
  /** The headline; `{n}` is the run. */
  title: string;
  /** The smaller line under it. On `bubble` it is the English for what he says. */
  line?: string;
  /** `stamps`: the words slapped down one by one. `bubble`: what he says, in Spanish. `ticker`: the word that scrolls. */
  words?: string[];
  /** `food` / `balloons`: what falls or floats. */
  bits?: BitName[];
}

type Row = Omit<CheerDesign, 'id' | 'when'>;
const r = (scene: Scene, deco: Deco, layout: Layout, tint: Tint, art: Art, title: string, line?: string, extra?: Pick<CheerDesign, 'words' | 'bits'>): Row => ({
  scene,
  deco,
  layout,
  tint,
  art,
  title,
  line,
  ...extra,
});

// Five in a row --------------------------------------------------------------
const RUN: Row[] = [
  r('rise', 'none', 'hero', 'rosa', 'gol', '{n} in a row!', 'You’re on fire!'),
  r('fade', 'none', 'stamps', 'mint', 'wave', '{n} in a row', undefined, { words: ['Nailed', 'it!'] }),
  r('fade', 'rain', 'hero', 'lav', 'ponchomate', '{n} in a row!', 'You’re doing great.'),
  r('drop', 'confetti', 'hero', 'butter', 'tango', '{n} in a row!', 'Smooth moves.'),
  r('left', 'stripes', 'badge', 'sky', 'kick', 'On a roll!'),
  r('iris', 'rings', 'count', 'peach', 'sip', 'in a row!'),
  r('right', 'sparkles', 'bubble', 'rosa', 'hand', '{n} in a row', 'You’re a star!', { words: ['¡Sos un crack!'] }),
  r('blinds', 'none', 'stamps', 'butter', 'alfajor', '{n} in a row', undefined, { words: ['Sweet!'] }),
  r('tilt', 'food', 'hero', 'sage', 'empanadas', '{n} in a row!', 'Hot out of the oven.', { bits: ['empanada'] }),
  r('rise', 'burst', 'polaroid', 'lav', 'musica', '{n} in a row!', 'Music to my ears.'),
  r('sun', 'rays', 'hero', 'butter', 'mate', '{n} in a row!', 'Mate’s on me.'),
  r('doors', 'none', 'badge', 'mint', 'gaucho', 'Look at you go!'),
  r('fade', 'ticker', 'count', 'night', 'gol', 'in a row!', undefined, { words: ['GOOD'] }),
  r('drop', 'balloons', 'hero', 'sky', 'wave', '{n} in a row!', 'Up, up, up.', { bits: ['escarapela'] }),
  r('left', 'none', 'bubble', 'peach', 'cafe', '{n} in a row', 'Nice one!', { words: ['¡Bien ahí!'] }),
  r('iris', 'sparkles', 'stamps', 'lav', 'tango', '{n} in a row', undefined, { words: ['So', 'smooth!'] }),
  r('rise', 'stripes', 'polaroid', 'rosa', 'choripan', 'Hot streak!', '{n} in a row, straight off the grill.'),
  r('right', 'confetti', 'count', 'mint', 'kick', 'in a row!'),
  r('blinds', 'rings', 'hero', 'sky', 'sip', '{n} in a row!', 'Calm, cool, correct.'),
  r('tilt', 'none', 'badge', 'flame', 'asado', 'Sizzling!'),
  r('fade', 'food', 'bubble', 'butter', 'dulce', '{n} in a row', 'Sweet as dulce de leche.', { words: ['¡Qué dulce!'], bits: ['dulce'] }),
  r('sun', 'burst', 'stamps', 'peach', 'gol', '{n} in a row', undefined, { words: ['GOL', 'GOL', 'GOL!'] }),
  r('drop', 'rain', 'polaroid', 'sage', 'amargo', '{n} in a row!', 'Strong stuff.'),
  r('doors', 'sparkles', 'hero', 'night', 'musica', '{n} in a row!', 'You’ve got rhythm.'),
  r('left', 'balloons', 'count', 'rosa', 'wave', 'in a row!', undefined, { bits: ['caramelos'] }),
  r('rise', 'ticker', 'badge', 'butter', 'hand', 'That’s it!', undefined, { words: ['ESO'] }),
  r('iris', 'none', 'bubble', 'mint', 'gaucho', '{n} in a row', 'Awesome!', { words: ['¡Bárbaro!'] }),
  r('right', 'rays', 'polaroid', 'peach', 'facturas', 'Fresh batch!', '{n} right, warm from the oven.'),
  r('blinds', 'confetti', 'stamps', 'sky', 'kick', '{n} in a row', undefined, { words: ['Right', 'on!'] }),
  r('tilt', 'stripes', 'hero', 'lav', 'maicena', '{n} in a row!', 'Crumbly? Not you.'),
  r('fade', 'rings', 'badge', 'rosa', 'tango', 'Perfect step!'),
  r('sun', 'food', 'count', 'butter', 'alfajor', 'in a row!', undefined, { bits: ['alfajor'] }),
  r('drop', 'none', 'bubble', 'sage', 'sip', '{n} in a row', 'That’s it!', { words: ['¡Eso!'] }),
  r('doors', 'burst', 'polaroid', 'sky', 'gol', 'Picture perfect.', '{n} in a row!'),
  r('left', 'sparkles', 'stamps', 'night', 'wave', '{n} in a row', undefined, { words: ['Shine', 'on!'] }),
  r('rise', 'rain', 'badge', 'mint', 'mate', 'Steady!'),
  r('iris', 'balloons', 'hero', 'peach', 'musica', '{n} in a row!', 'Turn it up.', { bits: ['bombo'] }),
  r('right', 'ticker', 'bubble', 'lav', 'hand', '{n} in a row', 'Great!', { words: ['¡Joya!'] }),
  r('blinds', 'none', 'count', 'flame', 'choripan', 'in a row!'),
  r('tilt', 'confetti', 'polaroid', 'butter', 'tango', '{n} in a row!', 'Dance floor’s yours.'),
  r('fade', 'stripes', 'stamps', 'rosa', 'kick', '{n} in a row', undefined, { words: ['Top', 'corner!'] }),
  r('sun', 'none', 'bubble', 'sky', 'cafe', '{n} in a row', 'That’s how it’s done!', { words: ['¡Así se hace!'] }),
  r('drop', 'sparkles', 'badge', 'lav', 'dulce', 'So sweet!'),
  r('doors', 'food', 'hero', 'mint', 'milanesa', '{n} in a row!', 'Crispy and golden.', { bits: ['medialuna'] }),
  r('left', 'rings', 'polaroid', 'night', 'sip', 'Zen mode.', '{n} in a row.'),
  r('rise', 'burst', 'count', 'sage', 'gaucho', 'in a row!'),
  r('iris', 'rays', 'stamps', 'butter', 'wave', '{n} in a row', undefined, { words: ['Yes!'] }),
  r('right', 'none', 'hero', 'peach', 'empanadas', '{n} in a row!', 'Everyone wants one of you.'),
  r('blinds', 'balloons', 'bubble', 'rosa', 'tango', '{n} in a row', 'What a level!', { words: ['¡Qué nivel!'], bits: ['clavel'] }),
  r('tilt', 'rain', 'badge', 'sky', 'amargo', 'No sugar needed.'),
  r('fade', 'confetti', 'polaroid', 'mint', 'musica', 'Encore!', '{n} in a row.'),
  r('sun', 'stripes', 'count', 'lav', 'kick', 'in a row!'),
  r('drop', 'ticker', 'stamps', 'peach', 'hand', '{n} in a row', 'Keep it going!', { words: ['¡Dale!'] }),
  r('doors', 'none', 'hero', 'butter', 'facturas', '{n} in a row!', 'One for every right answer.'),
  r('left', 'food', 'bubble', 'sage', 'choripan', '{n} in a row', 'Tremendous!', { words: ['¡Tremendo!'], bits: ['choripan'] }),
  r('rise', 'sparkles', 'polaroid', 'flame', 'gol', 'Frame this one.', '{n} in a row!'),
  r('iris', 'rings', 'badge', 'night', 'tango', 'Pure class.'),
  r('right', 'burst', 'hero', 'rosa', 'maicena', '{n} in a row!', 'Sweet, sweet streak.'),
  r('blinds', 'rays', 'count', 'mint', 'mate', 'in a row!'),
  r('tilt', 'none', 'stamps', 'lav', 'gaucho', '{n} in a row', undefined, { words: ['Ride', 'on!'] }),
];

// Five in a row, after a miss --------------------------------------------------
const BACK: Row[] = [
  r('doors', 'none', 'badge', 'peach', 'wave', 'Back on track!'),
  r('rise', 'rays', 'hero', 'mint', 'sip', 'Back on track!', '{n} in a row since that one.'),
  r('fade', 'none', 'bubble', 'butter', 'hand', '{n} in a row', 'You’re back!', { words: ['¡Volviste!'] }),
  r('iris', 'rings', 'stamps', 'sky', 'kick', '{n} in a row', undefined, { words: ['Comeback!'] }),
  r('left', 'stripes', 'hero', 'lav', 'cafe', 'Shook it off!', '{n} right in a row.'),
  r('drop', 'confetti', 'polaroid', 'rosa', 'gol', 'What a comeback!', '{n} in a row.'),
  r('sun', 'none', 'bubble', 'sage', 'mate', '{n} in a row', 'That’s the attitude!', { words: ['¡Esa es la actitud!'] }),
  r('blinds', 'sparkles', 'badge', 'butter', 'tango', 'Back in step!'),
  r('tilt', 'balloons', 'hero', 'sky', 'wave', 'Bounced back!', '{n} in a row.', { bits: ['pelota'] }),
  r('right', 'burst', 'count', 'peach', 'gaucho', 'right since!'),
  r('doors', 'rain', 'stamps', 'mint', 'amargo', '{n} in a row', undefined, { words: ['Back', 'at it!'] }),
  r('rise', 'ticker', 'bubble', 'night', 'musica', '{n} in a row', 'Here we go!', { words: ['¡Vamos!'] }),
  r('iris', 'food', 'polaroid', 'butter', 'facturas', 'Back for seconds.', '{n} in a row!', { bits: ['facturas'] }),
  r('fade', 'rays', 'hero', 'rosa', 'kick', 'Nothing can stop you.', '{n} in a row since the slip.'),
  r('left', 'none', 'badge', 'lav', 'dulce', 'Sweet recovery!'),
];

// Ten in a row, and every five after ------------------------------------------------
const BIG: Row[] = [
  r('sun', 'rays', 'count', 'butter', 'ponchomate', 'in a row!'),
  r('iris', 'confetti', 'medal', 'rosa', 'gol', 'Unstoppable!'),
  r('rise', 'food', 'count', 'peach', 'empanadas', 'in a row!', undefined, { bits: ['empanada', 'alfajor', 'medialuna'] }),
  r('doors', 'sparkles', 'bubble', 'night', 'tango', '{n} in a row', 'You smashed it!', { words: ['¡La rompiste!'] }),
  r('sun', 'burst', 'medal', 'butter', 'kick', 'Golazo!'),
  r('blinds', 'ticker', 'count', 'flame', 'hand', 'in a row!', undefined, { words: ['CRACK'] }),
  r('fade', 'balloons', 'hero', 'sky', 'wave', '{n} in a row!', 'Party time.', { bits: ['cotillon', 'caramelos', 'escarapela'] }),
  r('tilt', 'rays', 'stamps', 'rosa', 'gol', '{n} in a row', 'What a streak!', { words: ['¡Qué', 'racha!'] }),
  r('iris', 'rings', 'medal', 'night', 'musica', 'Legend!'),
  r('rise', 'confetti', 'polaroid', 'butter', 'tango', 'Hall of fame.', '{n} in a row!'),
  r('drop', 'food', 'bubble', 'peach', 'asado', '{n} in a row', 'You’re flying!', { words: ['¡Estás que volás!'], bits: ['choripan'] }),
  r('sun', 'sparkles', 'count', 'lav', 'sip', 'in a row!'),
  r('left', 'burst', 'medal', 'mint', 'gaucho', 'Champion!'),
  r('right', 'ticker', 'hero', 'rosa', 'kick', '{n} in a row!', 'Can anyone stop you?', { words: ['GOLAZO'] }),
  r('doors', 'balloons', 'count', 'butter', 'alfajor', 'in a row!', undefined, { bits: ['alfajor', 'dulce'] }),
  r('iris', 'confetti', 'stamps', 'night', 'wave', '{n} in a row', undefined, { words: ['Out', 'of', 'this', 'world!'] }),
  r('sun', 'food', 'medal', 'peach', 'gol', 'World champ!', undefined, { bits: ['copa', 'camiseta', 'pelota'] }),
  r('blinds', 'rays', 'bubble', 'butter', 'cafe', '{n} in a row', 'Spectacular!', { words: ['¡Espectacular!'] }),
  r('tilt', 'sparkles', 'polaroid', 'rosa', 'musica', 'Standing ovation.', '{n} in a row!'),
  r('rise', 'rings', 'count', 'sky', 'mate', 'in a row!'),
  r('fade', 'burst', 'hero', 'flame', 'choripan', '{n} in a row!', 'Hotter than the grill.'),
  r('drop', 'balloons', 'medal', 'lav', 'tango', 'Bravo!', undefined, { bits: ['clavel', 'sombrero'] }),
  r('sun', 'ticker', 'stamps', 'butter', 'hand', '{n} in a row', 'Unstoppable!', { words: ['¡Imparable!'] }),
  r('iris', 'rays', 'bubble', 'mint', 'gaucho', '{n} in a row', 'Flawless!', { words: ['¡Impecable!'] }),
  r('doors', 'confetti', 'count', 'rosa', 'wave', 'in a row!'),
];

export const CHEERS: CheerDesign[] = [
  ...RUN.map((c) => ({ ...c, when: 'run' as const })),
  ...BACK.map((c) => ({ ...c, when: 'back' as const })),
  ...BIG.map((c) => ({ ...c, when: 'big' as const })),
].map((c, id) => ({ ...c, id }));

// The deal ------------------------------------------------------------------------

const KEY = 'cheers.seen.v1';
/** Ids shown, oldest first. */
let seen: number[] = [];
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  AsyncStorage.getItem(KEY)
    .then((raw) => {
      const ids = raw ? (JSON.parse(raw) as number[]) : [];
      // Anything shown before the read landed goes after what was stored.
      seen = [...ids.filter((id) => !seen.includes(id)), ...seen];
    })
    .catch(() => {});
}
load();

/** The next screen for this moment: one she hasn't seen lately, at random. */
export function dealCheer(when: CheerWhen): CheerDesign {
  const pile = CHEERS.filter((c) => c.when === when);
  // Hold back all but the three she saw longest ago, so the pile is gone
  // through before anything repeats and the order is never the same twice.
  const recent = new Set(seen.filter((id) => CHEERS[id]?.when === when).slice(-(pile.length - 3)));
  const fresh = pile.filter((c) => !recent.has(c.id));
  const pick = fresh[Math.floor(Math.random() * fresh.length)] ?? pile[0];
  seen = [...seen.filter((id) => id !== pick.id), pick.id].slice(-CHEERS.length);
  AsyncStorage.setItem(KEY, JSON.stringify(seen)).catch(() => {});
  return pick;
}
