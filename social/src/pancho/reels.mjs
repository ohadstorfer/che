// The scripts. One reel = a hook, a few "textbook → Argentina" pairs, an outro.
// Add a reel here, run `node pancho-vo.mjs`, then `node render.mjs <id>`.
export const REELS = [
  {
    id: 'pancho-01-libro',
    title: 'ARGENTINE SPANISH',
    hook: '¿Español de libro? Mirá cómo se dice acá.',
    pairs: [
      {textbook: '¿Cómo estás?', argentine: '¿Cómo andás?', english: 'How are you?', pose: 'gaucho'},
      {textbook: '¿Tú eres de aquí?', argentine: '¿Vos sos de acá?', english: 'Are you from here?', pose: 'mate'},
      {textbook: '¡Qué lío!', argentine: '¡Qué quilombo!', english: 'What a mess!', pose: 'futbol-gol'},
    ],
    outro: 'Dale. Nos vemos en Posta.',
  },
];
