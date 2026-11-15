// "X vs Y" reels: two Panchos side by side, each says his own word for the same thing.
// A new video is a new entry here; versus-vo.mjs records it and render-pancho.mjs renders it.
// `voice` is a name from VOICES in vo-lib.mjs; `sprite` a set of seven mouth drawings in
// public/pancho (<sprite>-closed/-half/-a/-e/-i/-o/-u.png, made by cut-cast.py); `height` how tall it is drawn;
// `rig` where its eye and raised hand are, in the drawing's own pixels (see Puppet.tsx).
import {SPAIN, MEXICO, TOURIST} from './series.mjs';

// The Argentinian Pancho. pancho/ar-arm is the old versus/ar drawing with the elbow it had cut off at its right
// edge redrawn (2026-11-05); the cut copies (versus/ar, es-ar/r) were deleted 2026-11-06 so they are not used again.
// `body` is the width without the elbow: VersusReel keeps the body where it was and lets the elbow run off the edge.
const AR_ARM = {size: [632, 1069], eye: [357, 121, 27, 23], fur: '#C0804E', body: 543};
// The same Argentinian with a mate and a thermos (mate-sprites.py, 2026-11-07): same head and mouths, new arms.
// No `body` cut: the thermos hand reaches the right edge, so the drawing sits at the frame's edge like the others.
const AR_MATE = {size: [632, 1069], eye: [357, 121, 27, 23], fur: '#C0804E'};

export const VERSUS = [
  {
    id: 'versus-01-tu-vos',
    steady: true, live: true, // both stay the same size; remove to have the speaker step up
    left: {word: 'TÚ', flags: '🇪🇸 🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'VOS', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'TIENES', right: 'TENÉS', english: 'You have', sayLeft: 'Tú tienes.', sayRight: 'Vos tenés.'},
      {left: 'ERES', right: 'SOS', english: 'You are', sayLeft: 'Tú eres.', sayRight: 'Vos sos.'},
      {left: 'QUIERES', right: 'QUERÉS', english: 'You want', sayLeft: 'Tú quieres.', sayRight: 'Vos querés.'},
      {left: 'PUEDES', right: 'PODÉS', english: 'You can', sayLeft: 'Tú puedes.', sayRight: 'Vos podés.'},
    ],
  },
  {
    id: 'versus-02-commands',
    steady: true, live: true,
    left: {word: 'TÚ', flags: '🇪🇸 🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'VOS', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'MIRA', right: 'MIRÁ', english: 'Look!', sayLeft: 'Mira.', sayRight: 'Mirá.'},
      {left: 'DIME', right: 'DECIME', english: 'Tell me', sayLeft: 'Dime.', sayRight: 'Decime.'},
      {left: 'ESPERA', right: 'ESPERÁ', english: 'Wait!', sayLeft: 'Espera.', sayRight: 'Esperá.'},
      {left: 'CÁLLATE', right: 'CALLATE', english: 'Shut up!', sayLeft: 'Cállate.', sayRight: 'Callate.'},
    ],
  },
  {
    id: 'versus-03-spain-words',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio.jpg',
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'COCHE', right: 'AUTO', english: 'Car', sayLeft: 'El coche.', sayRight: 'El auto.'},
      {left: 'MÓVIL', right: 'CELULAR', english: 'Phone', sayLeft: 'El móvil.', sayRight: 'El celular.'},
      {left: 'FRESA', right: 'FRUTILLA', english: 'Strawberry', sayLeft: 'La fresa.', sayRight: 'La frutilla.'},
      {left: 'PISCINA', right: 'PILETA', english: 'Pool', sayLeft: 'La piscina.', sayRight: 'La pileta.'},
    ],
  },
  {
    id: 'versus-04-spain-slang',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio.jpg',
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'VALE', right: 'DALE', english: 'Okay!', sayLeft: 'Vale, vale.', sayRight: 'Dale, dale.'},
      {left: 'GUAY', right: 'COPADO', english: 'Cool', sayLeft: 'Qué guay.', sayRight: 'Qué copado.'},
      {left: 'CHAVAL', right: 'PIBE', english: 'Kid', sayLeft: 'El chaval.', sayRight: 'El pibe.'},
      {left: 'CURRO', right: 'LABURO', english: 'Job', sayLeft: 'El curro.', sayRight: 'El laburo.'},
    ],
  },
  {
    id: 'versus-05-spain-food',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio.jpg',
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'PATATA', right: 'PAPA', english: 'Potato', sayLeft: 'La patata.', sayRight: 'La papa.'},
      {left: 'ZUMO', right: 'JUGO', english: 'Juice', sayLeft: 'El zumo.', sayRight: 'El jugo.'},
      {left: 'AGUACATE', right: 'PALTA', english: 'Avocado', sayLeft: 'El aguacate.', sayRight: 'La palta.'},
      {left: 'MELOCOTÓN', right: 'DURAZNO', english: 'Peach', sayLeft: 'El melocotón.', sayRight: 'El durazno.'},
    ],
  },
  {
    id: 'versus-06-spain-daily',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio.jpg',
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'GAFAS', right: 'ANTEOJOS', english: 'Glasses', sayLeft: 'Las gafas.', sayRight: 'Los anteojos.'},
      {left: 'GRIFO', right: 'CANILLA', english: 'Faucet', sayLeft: 'El grifo.', sayRight: 'La canilla.'},
      {left: 'ACERA', right: 'VEREDA', english: 'Sidewalk', sayLeft: 'La acera.', sayRight: 'La vereda.'},
      {left: 'CAMISETA', right: 'REMERA', english: 'T-shirt', sayLeft: 'La camiseta.', sayRight: 'La remera.'},
    ],
  },
  {
    id: 'versus-07-spain-slang-2',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio.jpg',
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'TÍO', right: 'BOLUDO', english: 'Dude', sayLeft: 'Oye, tío.', sayRight: 'Che, boludo.'},
      {left: 'PASTA', right: 'GUITA', english: 'Money', sayLeft: 'La pasta.', sayRight: 'La guita.'},
      {left: 'LÍO', right: 'QUILOMBO', english: 'Mess', sayLeft: 'Qué lío.', sayRight: 'Qué quilombo.'},
      {left: 'ME MOLA', right: 'ME COPA', english: 'I like it', sayLeft: 'Me mola.', sayRight: 'Me copa.'},
    ],
  },
  {
    id: 'versus-08-mexico-food',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio-mx.jpg',
    left: {word: 'MÉXICO', flags: '🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'ELOTE', right: 'CHOCLO', english: 'Corn', sayLeft: 'El elote.', sayRight: 'El choclo.'},
      {left: 'FRIJOL', right: 'POROTO', english: 'Beans', sayLeft: 'El frijol.', sayRight: 'El poroto.'},
      {left: 'POPOTE', right: 'SORBETE', english: 'Straw', sayLeft: 'El popote.', sayRight: 'El sorbete.'},
      {left: 'REFRESCO', right: 'GASEOSA', english: 'Soda', sayLeft: 'El refresco.', sayRight: 'La gaseosa.'},
    ],
  },
  {
    id: 'versus-09-mexico-daily',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio-mx.jpg', // title + flags sit just above the heads; the meaning goes above them
    left: {word: 'MÉXICO', flags: '🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'CAMIÓN', right: 'COLECTIVO', english: 'Bus', sayLeft: 'El camión.', sayRight: 'El colectivo.'},
      {left: 'ALBERCA', right: 'PILETA', english: 'Pool', sayLeft: 'La alberca.', sayRight: 'La pileta.'},
      {left: 'PLAYERA', right: 'REMERA', english: 'T-shirt', sayLeft: 'La playera.', sayRight: 'La remera.'},
      {left: 'CHAMARRA', right: 'CAMPERA', english: 'Jacket', sayLeft: 'La chamarra.', sayRight: 'La campera.'},
    ],
  },
  {
    id: 'versus-10-mexico-slang',
    steady: true, live: true, titleTop: 526, floor: 250, linkEnd: true, endTitle: 'Want to sound like a *real Argentinian?*', bg: 'versus/bg-estadio-mx.jpg',
    left: {word: 'MÉXICO', flags: '🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: 'GÜEY', right: 'BOLUDO', english: 'Dude', sayLeft: 'Oye, güey.', sayRight: 'Che, boludo.'},
      {left: 'LANA', right: 'GUITA', english: 'Money', sayLeft: 'La lana.', sayRight: 'La guita.'},
      {left: 'CHAMBA', right: 'LABURO', english: 'Job', sayLeft: 'La chamba.', sayRight: 'El laburo.'},
      {left: '¿NETA?', right: '¿POSTA?', english: 'Really?', sayLeft: '¿Neta?', sayRight: '¿Posta?'},
    ],
  },
  // The hybrid test: an AI clip of the two (made with Veo in Gemini) in place of the puppets; see VeoReel.tsx.
  // It reuses the recorded lines of `voices`. `cues` are the seconds of the clip at which each one starts talking.
  {
    id: 'veo-01-tu-vos', voices: 'versus-01-tu-vos',
    veo: {dir: 'mx-ar-01', fps: 24, loopSeconds: 6.9, cues: [{l: 0.2, r: 1.75}, {l: 3.6, r: 4.9}]},
    left: {word: 'TÚ', flags: '🇪🇸 🇲🇽'}, right: {word: 'VOS', flags: '🇦🇷'},
    pairs: [
      {left: 'TIENES', right: 'TENÉS', english: 'You have', sayLeft: 'Tú tienes.', sayRight: 'Vos tenés.'},
      {left: 'ERES', right: 'SOS', english: 'You are', sayLeft: 'Tú eres.', sayRight: 'Vos sos.'},
      {left: 'QUIERES', right: 'QUERÉS', english: 'You want', sayLeft: 'Tú quieres.', sayRight: 'Vos querés.'},
      {left: 'PUEDES', right: 'PODÉS', english: 'You can', sayLeft: 'Tú puedes.', sayRight: 'Vos podés.'},
    ],
  },
  {
    // The tourist (Pancho waving with no shirt, with the Argentinian's head: tourist-sprites.py) against the Argentinian, at the Obelisco.
    id: 'versus-11-tourist',
    steady: true, live: true, titleTop: 746, bg: 'versus/bg-obelisco.jpg', linkEnd: true, endTitle: 'Stop sounding like a tourist.\nLearn real *Argentinian Spanish!*', endTitleSize: 64,
    left: {word: 'TOURIST\nSPANISH', flags: '🤓', sprite: 'tourist/l', height: 900, voice: 'gringo',
      rig: {size: [768, 1152], eye: [252, 148, 30, 26], fur: '#C0804E', hand: {cutX: 540, cutY: 415, pivot: [620, 420]}}},
    right: {word: 'ARGENTINIAN\nSPANISH', flags: '🇦🇷', sprite: 'ar-mateC/ar', height: 940, voice: 'tomas',
      rig: AR_MATE},
    pairs: [
      {left: '¿QUÉ TAL?', right: '¿QUÉ ONDA?', english: 'What’s up?', sayLeft: '¿Qué tal?', sayRight: '¿Qué onda?'},
      {left: 'DINERO', right: 'PLATA', english: 'Money', sayLeft: 'El dinero.', sayRight: 'La plata.'},
      {left: 'AUTOBÚS', right: 'BONDI', english: 'Bus', sayLeft: 'El autobús.', sayRight: 'El bondi.'},
      {left: 'MUY BIEN', right: 'JOYA', english: 'Great', sayLeft: 'Muy bien.', sayRight: 'Joya.'},
    ],
  },
];

// The bulk series (series.mjs): every four pairs become one reel with the cast, background and
// ending of the reel it copies. Numbered on from the reels already made, up to 30 per series.
for (const [list, from, tag, first] of [[SPAIN, 'versus-03-spain-words', 'es', 6], [MEXICO, 'versus-08-mexico-food', 'mx', 4], [TOURIST, 'versus-11-tourist', 'tour', 2]]) {
  const {id, pairs, ...look} = VERSUS.find(r => r.id === from);
  for (let k = 0; k * 4 < list.length; k++)
    VERSUS.push({...look, id: `versus-${tag}-${String(first + k).padStart(2, '0')}`, pairs: list.slice(k * 4, k * 4 + 4)});
}
