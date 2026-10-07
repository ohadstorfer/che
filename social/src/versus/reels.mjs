// "X vs Y" reels: two Panchos side by side, each says his own word for the same thing.
// A new video is a new entry here; versus-vo.mjs records it and render-pancho.mjs renders it.
// `voice` is a name from VOICES in vo-lib.mjs; `sprite` a set of seven mouth drawings in
// public/pancho (<sprite>-closed/-half/-a/-e/-i/-o/-u.png, made by cut-cast.py); `height` how tall it is drawn;
// `rig` where its eye and raised hand are, in the drawing's own pixels (see Puppet.tsx).
export const VERSUS = [
  {
    id: 'versus-01-tu-vos',
    steady: true, // both stay the same size; remove to have the speaker step up
    left: {word: 'TÚ', flags: '🇪🇸 🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'VOS', flags: '🇦🇷', sprite: 'versus/ar', height: 940, voice: 'tomas',
      rig: {size: [543, 1069], eye: [357, 121, 27, 23], fur: '#C0804E'}},
    pairs: [
      {left: 'TIENES', right: 'TENÉS', english: 'You have', sayLeft: 'Tú tienes.', sayRight: 'Vos tenés.'},
      {left: 'ERES', right: 'SOS', english: 'You are', sayLeft: 'Tú eres.', sayRight: 'Vos sos.'},
      {left: 'QUIERES', right: 'QUERÉS', english: 'You want', sayLeft: 'Tú quieres.', sayRight: 'Vos querés.'},
      {left: 'PUEDES', right: 'PODÉS', english: 'You can', sayLeft: 'Tú puedes.', sayRight: 'Vos podés.'},
    ],
  },
  {
    id: 'versus-02-commands',
    steady: true,
    left: {word: 'TÚ', flags: '🇪🇸 🇲🇽', sprite: 'versus/mx', height: 980, voice: 'mexico',
      rig: {size: [632, 1116], eye: [127, 158, 30, 24], fur: '#C4855A', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'VOS', flags: '🇦🇷', sprite: 'versus/ar', height: 940, voice: 'tomas',
      rig: {size: [543, 1069], eye: [357, 121, 27, 23], fur: '#C0804E'}},
    pairs: [
      {left: 'MIRA', right: 'MIRÁ', english: 'Look!', sayLeft: 'Mira.', sayRight: 'Mirá.'},
      {left: 'DIME', right: 'DECIME', english: 'Tell me', sayLeft: 'Dime.', sayRight: 'Decime.'},
      {left: 'ESPERA', right: 'ESPERÁ', english: 'Wait!', sayLeft: 'Espera.', sayRight: 'Esperá.'},
      {left: 'CÁLLATE', right: 'CALLATE', english: 'Shut up!', sayLeft: 'Cállate.', sayRight: 'Callate.'},
    ],
  },
  {
    id: 'versus-03-spain-words',
    steady: true,
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'es-ar/r', height: 940, voice: 'tomas',
      rig: {size: [543, 1077], eye: [356, 121, 23, 20], fur: '#C57F4D'}},
    pairs: [
      {left: 'COCHE', right: 'AUTO', english: 'Car', sayLeft: 'El coche.', sayRight: 'El auto.'},
      {left: 'MÓVIL', right: 'CELULAR', english: 'Phone', sayLeft: 'El móvil.', sayRight: 'El celular.'},
      {left: 'FRESA', right: 'FRUTILLA', english: 'Strawberry', sayLeft: 'La fresa.', sayRight: 'La frutilla.'},
      {left: 'PISCINA', right: 'PILETA', english: 'Pool', sayLeft: 'La piscina.', sayRight: 'La pileta.'},
    ],
  },
  {
    id: 'versus-04-spain-slang',
    steady: true,
    left: {word: 'ESPAÑA', flags: '🇪🇸', sprite: 'es-ar/l', height: 980, voice: 'spain',
      rig: {size: [632, 1119], eye: [125, 158, 29, 24], fur: '#C57F51', hand: {cutX: 436, cutY: 398, pivot: [500, 415]}}},
    right: {word: 'ARGENTINA', flags: '🇦🇷', sprite: 'es-ar/r', height: 940, voice: 'tomas',
      rig: {size: [543, 1077], eye: [356, 121, 23, 20], fur: '#C57F4D'}},
    pairs: [
      {left: 'VALE', right: 'DALE', english: 'Okay!', sayLeft: 'Vale, vale.', sayRight: 'Dale, dale.'},
      {left: 'GUAY', right: 'COPADO', english: 'Cool', sayLeft: 'Qué guay.', sayRight: 'Qué copado.'},
      {left: 'CHAVAL', right: 'PIBE', english: 'Kid', sayLeft: 'El chaval.', sayRight: 'El pibe.'},
      {left: 'CURRO', right: 'LABURO', english: 'Job', sayLeft: 'El curro.', sayRight: 'El laburo.'},
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
];
