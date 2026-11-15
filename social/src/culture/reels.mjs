// Culture reels (9:16), from the culture classes (docs/culture/*.yaml). Storyboards approved 2026-11-06
// (artifact "Culture Reels"). Silent for now: music + sfx only, Pancho's voice comes later.
// Scenes: hook (Pancho + caption), fact (one idea, big), quiz (3 s countdown, then the answer), app (the class card).
// `s` is seconds on screen. `es` is the Spanish line, drawn in rosa. Render: node render-culture.mjs [id…]
export const CULTURE = [
  {id: 'culture-01-mate-gracias', scenes: [
    {k: 'hook', img: 'pancho/mate.png', text: 'I said “gracias” and they stopped passing me the mate 😭', s: 3},
    {k: 'fact', bg: 'ink', kicker: 'Rule 1', es: '“Gracias”', esAt: 'first', big: '= I’m done', text: 'Want more? Just hand it back.', s: 3.5},
    {k: 'fact', bg: 'paper', img: 'culture/mate-termo.png', kicker: 'Rule 2', big: 'Never touch the', es: 'bombilla', text: 'Only the cebador moves it. Never stir.', s: 3.5},
    {k: 'fact', bg: 'rosa', kicker: 'Rule 3', es: '“¡No es un micrófono!”', esAt: 'first', text: 'Don’t hold it while you tell a long story. Everyone’s waiting.', s: 3.5},
    {k: 'app', label: 'Culture · Mate', q: 'You hand the mate back and say “gracias”. What happens next?', opts: ['They refill it for you', 'You’re out of the ronda', 'You get the next one too'], ok: 1, s: 3.5},
  ]},
  {id: 'culture-02-asado-quiz', scenes: [
    {k: 'hook', img: 'pancho/asado.png', text: 'Only Argentines get 3/3 🥩', sub: 'Asado quiz', s: 2.5},
    {k: 'quiz', kicker: '1 / 3', q: 'The invite says', es: '“Vení a la una.”', q2: 'When do you eat?', opts: ['1 pm', '2–3 pm', 'Dinner'], ok: 1, why: 'The fire is slow. So is everything else.', s: 6},
    {k: 'quiz', kicker: '2 / 3', q: 'How much meat per person?', opts: ['250 g', 'Half a kilo', 'A kilo'], ok: 1, why: 'Nobody wants to be the host who ran out.', s: 6},
    {k: 'quiz', kicker: '3 / 3', q: 'What goes on the meat?', opts: ['Just coarse salt', 'A garlic rub', 'Overnight marinade'], ok: 0, why: 'sal gruesa. Chimichurri waits at the table.', s: 6},
    {k: 'fact', bg: 'rosa', big: 'How many did you get?', text: 'Comment your score 👇', s: 2.5},
  ]},
  {id: 'culture-03-beso', scenes: [
    {k: 'hook', img: 'pancho/saludando.png', text: 'You walk into a party of 12 strangers in Argentina…', s: 3},
    {k: 'fact', bg: 'rosa', huge: '1', big: 'kiss. Not two.', text: 'Right cheek to right cheek, lips to the air.', s: 3.5},
    {k: 'fact', bg: 'paper', huge: '×12', big: 'Every. Single. Person.', es: 'saludás uno por uno', s: 3.5},
    {k: 'fact', bg: 'ink', big: 'Two guys, old friends?', es: 'Un beso 😘', text: 'A handshake means you barely know them.', s: 3.5},
    {k: 'fact', bg: 'salvia', big: 'And when you leave?', text: 'You do the whole round again. With a', es: '“chau”', esAt: 'last', s: 3},
  ]},
  {id: 'culture-04-hora', scenes: [
    {k: 'hook', img: 'pancho/gesto-mano.png', text: 'Argentine time → real time', sub: 'A translator', s: 2.5},
    {k: 'pair', bg: 'paper', es: '“Vení a las nueve”', big: '9:30', text: 'Arriving early is the real mistake.', s: 3},
    {k: 'pair', bg: 'ink', es: '“Ya salgo”', big: 'Still in the shower 🚿', s: 3},
    {k: 'pair', bg: 'paper', es: '“Llego en cinco”', big: '15 minutes', s: 3},
    {k: 'pair', bg: 'rosa', es: '“Me voy yendo”', big: '30 more minutes', text: 'Another glass. A kiss for everyone. A chat at the door.', s: 3.5},
    {k: 'app', label: 'Culture · Costumbres', q: 'You say “bueno, me voy yendo”. How long until you’re out the door?', opts: ['Five minutes', 'Half an hour, easily', 'You’re out right away'], ok: 1, s: 3.5},
  ]},
  {id: 'culture-05-fernet', scenes: [
    {k: 'hook', img: 'culture/fernet.png', text: 'Argentina drinks ¾ of all the fernet in the world', s: 3},
    {k: 'pair', bg: 'paper', kicker: 'In Italy', big: 'A tiny glass after dinner', kicker2: 'In Argentina', es: 'fernet con coca', s: 3.5},
    {k: 'fact', bg: 'rosa', big: 'No glasses? Cut a Coke bottle in half', text: 'and pass it around, like a mate.', s: 3.5},
    {k: 'fact', bg: 'paper', es: 'Córdoba', esAt: 'first', big: 'is its home.', text: 'They’ll tell you so.', s: 3},
    {k: 'fact', bg: 'ink', big: 'Everyone has the right ratio.', text: 'Everyone else is wrong. Yours? 👇', s: 3},
    {k: 'app', label: 'Culture · Drinks', q: 'At a party with no tall glasses, what do friends mix the fernet in?', opts: ['Plastic cups', 'Half a cola bottle', 'Straight from the bottle'], ok: 1, s: 3.5},
  ]},
];
