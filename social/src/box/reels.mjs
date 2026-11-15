// "How X swears vs how Argentina swears", in a boxing ring (puteadas, 2026-11-06): two gloved Panchos face each other,
// one round per insult, mild → strong, and Argentina wins by K.O. Insults go from one to the other, never at a
// situation ("¡se me cortó la luz!" is out). Every line is recorded once by box-vo.mjs (left in his country's voice,
// right in Tomás's, shouted) and reused by every reel that says it.
// The Spanish here is the only check it gets: forms used only when certain; slurs (homophobic, ableist, classist) left out.

// Argentina, by strength. "re mil" and "pedazo de" stretch the strong ones (the user's idea, 2026-11-06).
const AR = [
  ['¡Pelotudo!', '¡Boludo!', '¡Re boludo!', '¡Gil!', '¡Salame!', '¡Tarado!', '¡Nabo!', '¡Cagón!', '¡Rompebolas!', '¡Chupamedias!', '¡Forro!', '¡Gil de goma!'],
  ['¡Sorete!', '¡Pajero!', '¡Pedazo de pelotudo!', '¡Pelotudo a cuerda!', '¡Andá a cagar!', '¡Andate a la mierda!', '¡Flor de forro!', '¡Garca!', '¡Cerrá el orto!', '¡Pedazo de sorete!', '¡Andá a cagar a los yuyos!'],
  ['¡La concha de tu madre!', '¡Hijo de re mil putas!', '¡La puta que te parió!', '¡Andate a la concha de tu madre!', '¡La reputísima madre que te parió!', '¡Hijo de mil putas!', '¡La concha de tu hermana!', '¡Hijo de puta!'],
];

const COUNTRIES = {
  es: {name: 'SPAIN', flag: '🇪🇸', sprite: 'box/es', voice: 'spain', hook: 'How Spain swears', bank: [
    ['¡Gilipollas!', '¡Imbécil!', '¡Tonto del culo!', '¡Capullo!', '¡Pringado!', '¡Payaso!', '¡Idiota!', '¡Cagueta!', '¡Pesado!', '¡Mamón!'],
    ['¡Cabrón!', '¡Soplapollas!', '¡Pedazo de gilipollas!', '¡Vete a la mierda!', '¡Que te den!', '¡Mamonazo!', '¡Cállate ya, capullo!', '¡Tonto de remate!'],
    ['¡Me cago en tu madre!', '¡Hijo de puta!', '¡Me cago en tus muertos!', '¡Vete a tomar por culo!', '¡Me cago en tu puta madre!', '¡Hijo de la gran puta!', '¡Que te follen!'],
  ]},
  mx: {name: 'MEXICO', flag: '🇲🇽', sprite: 'box/mx', voice: 'mexico', hook: 'How Mexico swears', bank: [
    ['¡Pendejo!', '¡Menso!', '¡Baboso!', '¡Payaso!', '¡Zoquete!', '¡Lambiscón!', '¡Gallina!', '¡Idiota!', '¡Mamón!'],
    ['¡Cabrón!', '¡Pinche pendejo!', '¡Culero!', '¡Ojete!', '¡Vete a la verga!', '¡Vete al carajo!', '¡Cállate el hocico!', '¡Pendejo de mierda!'],
    ['¡Chinga tu madre!', '¡Hijo de tu puta madre!', '¡Hijo de la chingada!', '¡Vete a la chingada!', '¡Pinche hijo de puta!', '¡Chinga tu madre, cabrón!'],
  ]},
  cl: {name: 'CHILE', flag: '🇨🇱', sprite: 'box/cl', voice: 'chile', hook: 'How Chile swears', bank: [
    ['¡Weón!', '¡Aweonao!', '¡Pavo!', '¡Sapo!', '¡Cahuinero!', '¡Patero!', '¡Tonto!', '¡Patudo!'],
    ['¡Weón culiao!', '¡Saco de weas!', '¡Andate a la chucha!', '¡Cállate, weón!', '¡Culiao!', '¡Weón de mierda!', '¡Tonto culiao!'],
    ['¡Conchetumare!', '¡Hijo de la perra!', '¡Andate a la conchetumare!', '¡Conchetumare, weón!', '¡Hijo de puta!'],
  ]},
};

export const PER_COUNTRY = 30;
const STEP = [[1, 5], [3, 7], [2, 3]]; // how far each round's pick moves from one reel to the next (left, right), so reels differ

function series(code) {
  const c = COUNTRIES[code], seen = new Set(), out = [];
  const shift = {es: 0, mx: 4, cl: 8}[code]; // each country starts the Argentinian lines at a different place
  for (let k = 0; out.length < PER_COUNTRY && k < 400; k++) {
    const rounds = [0, 1, 2].map(t => {
      const left = c.bank[t][(k * STEP[t][0] + t) % c.bank[t].length];
      let j = (k * STEP[t][1] + 2 * t + 1 + shift) % AR[t].length;
      while (AR[t][j] === left) j = (j + 1) % AR[t].length; // never the same word on both sides
      return {say: left, ar: AR[t][j]};
    });
    const key = rounds.map(r => r.say + r.ar).join('|');
    if (seen.has(key)) continue; seen.add(key);
    out.push({id: `box-${code}-${String(out.length + 1).padStart(2, '0')}`,
      left: {name: c.name, flag: c.flag, sprite: c.sprite, voice: c.voice},
      right: {name: 'ARGENTINA', flag: '🇦🇷', sprite: 'box/ar', voice: 'tomas'},
      hook: [c.hook, 'vs how Argentina swears 🥊'], rounds});
  }
  return out;
}

export const BOX = [
  // the first one (2026-11-06): its Argentinian lines are the app's own recordings in public/vo/box-01-spain
  {
    id: 'box-01-spain',
    left: {name: 'SPAIN', flag: '🇪🇸', sprite: 'box/es', voice: 'spain'},
    right: {name: 'ARGENTINA', flag: '🇦🇷', sprite: 'box/ar'},
    hook: ['How Spain swears', 'vs how Argentina swears 🥊'],
    rounds: [
      {say: '¡Gilipollas!', ar: '¡Pelotudo!', db: 'argentine/1315d7527ba5199f009c.mp3'},
      {say: '¡Vete a la mierda!', ar: '¡Andá a cagar!', db: 'argentine/9bd9f59c55ab50559541.mp3'},
      {say: '¡Me cago en tu madre!', ar: '¡La concha de tu madre!', db: 'argentine/2d34e116a68736df2bff.mp3'},
    ],
  },
  ...series('es'), ...series('mx'), ...series('cl'),
];
