// The first line of each post. Word carousels use their cover line (carousels.mjs).
// Reels have two, so a repeat doesn't read the same. `active: false` waits for the user's OK.
export const DRAKE_HOOKS = {
  'drake-01-everyday': 'Your textbook never taught you these',
  'drake-02-food': 'Order this in Argentina and they won’t understand you',
  'drake-03-vos': 'Argentines don’t say tú. Here’s what they say',
  'drake-04-small-talk': 'Say “vale” in Buenos Aires and everyone knows you’re foreign',
  'drake-05-city': 'Don’t ask for the metro in Buenos Aires',
  'drake-06-home': 'Same things, totally different words',
  'drake-07-fruit-veg': 'The fruit shop quiz you’ll fail in Argentina',
  'drake-08-breakfast': 'How to order breakfast like an Argentine',
  'drake-09-food-drinks': 'A hot dog in Argentina is called a Pancho. Really',
  'drake-10-classics': 'If you say barbecue, you’re not ready for an asado',
  'drake-11-house': 'Moving to Argentina? Learn these first',
  'drake-12-clothes': 'Your Spanish class lied about these clothes',
  'drake-13-people': 'How Argentines really talk about people',
  'drake-14-describing': 'The words Argentines use to describe you',
  'drake-15-insults': 'You’ll hear these before you learn “hello”',
  'drake-16-reactions': 'React like an Argentine',
  'drake-17-phrases': 'Five phrases you’ll hear all day in Argentina',
  'drake-18-verbs': 'Please don’t say “coger” in Argentina',
  'drake-19-slang-verbs': 'Verbs you’ll never find in a textbook',
  'drake-20-night-out': 'What you need to know before going out in Buenos Aires',
  'drake-21-money': 'How much is a luca? Argentine money talk',
  'drake-22-school': 'Studying in Argentina? Learn these words',
  'drake-23-car': 'Driving in Argentina? This will save you',
  'drake-24-jobs': 'Call the waiter “camarero” and they’ll know you’re new',
  'drake-25-health': 'Words you’ll need at an Argentine pharmacy',
  'drake-26-time': 'The small words that make you sound Argentine',
  'drake-27-commands': 'How to tell someone what to do in Argentina',
  'drake-28-pronouns': 'Forget “tú” and “vosotros” in Argentina',
  'drake-29-animals': 'Yes, Posta’s mascot is a carpincho',
  'drake-30-vesre': 'Argentines say some words backwards',
};

export const REELS = [
  {id: 'celeb-03-messi-suarez-pichi-blur-host', who: 'Messi', title: 'Can you understand Messi?', hooks: ['A very strange question for Messi. Can you understand it?', 'Only 1% of Spanish learners catch what Messi says here']},
  {id: 'celeb-04-messi-las-tres-blur-host', who: 'Messi', title: 'Can you understand Messi?', hooks: ['Can you understand Messi with no subtitles?', 'What did Messi tell the crowd? Listen first']},
  {id: 'celeb-05-messi-oveja-blur-host', who: 'Messi', title: 'Can you understand this Messi joke?', hooks: ['This Messi joke only works in Spanish… did you get it?', 'A sheep that says yes. Do you understand this joke?']},
  {id: 'celeb-07-messi-vergonzoso-blur-host', who: 'Messi', title: 'Can you understand what they said about Messi?', hooks: ['What did they call Messi here? Listen carefully', 'Only 1% of Spanish learners understand this… can you?']},
  {id: 'celeb-08-messi-vino-sprite-blur-host', who: 'Messi', title: 'What does Messi drink?', hooks: ['Messi’s favorite drink is… wine and what?', 'Can you understand what Messi drinks?']},
  {id: 'celeb-14-messi-nada-que-decir-blur-host', who: 'Messi', title: 'Can you understand Messi?', hooks: ['Messi promised to speak. Then he said this', 'Can you understand Messi with no subtitles?']},
  {id: 'celeb-10-atiendo-boludos-host', who: 'an inspector', title: 'Can you understand this Argentine?', hooks: ['Only 1% of Spanish learners understand this inspector', 'The most Argentine answer you’ll ever hear']},
  {id: 'celeb-12-bici-arbol', who: 'a dad', title: 'Can you understand this Argentine dad?', hooks: ['One tree in the whole field. Listen to what this dad says', 'Day 5 of understanding Argentinians']},
  {id: 'celeb-01-messi-bobo-blur-host', who: 'Messi', title: 'Can you understand Messi?', hooks: ['The most famous Messi line. Can you understand it?', 'Only 1% of Spanish learners catch this Messi line']},
  {id: 'celeb-02-milei-pelotudos-blur-host', who: 'Milei', title: 'Can you understand Milei?', hooks: ['Can you understand Milei with no subtitles?', 'Only 1% of Spanish learners understand this… can you?']},
  {id: 'celeb-13-jugo-feo-host-blur', who: 'a kid', title: 'Can you understand this Argentine kid?', hooks: ['Only 1% of Spanish learners understand this kid', 'Kids in Argentina speak fast. Can you keep up?']},
  // Never approved as finished reels: these stay out until the user says so.
  {id: 'celeb-06-messi-chau-diego', who: 'Messi', active: false, title: 'Can you understand Messi?', hooks: ['Can you understand Messi with no subtitles?', 'Listen first, then read']},
  {id: 'celeb-09-susana-vivo', who: 'a lady', active: false, title: 'Can you understand this Argentine?', hooks: ['Argentina’s most famous question', 'Day 2 of understanding Argentinians']},
  {id: 'celeb-11-julio-aja', who: 'Julio', active: false, title: 'Can you understand this Argentine?', hooks: ['Can you understand Julio?', 'Day 4 of understanding Argentinians']},
  {id: 'celeb-15-pizza-quemando', who: 'a man', active: false, title: 'Can you understand this Argentine?', hooks: ['Can you understand what he’s yelling?', 'Day 6 of understanding Argentinians']},
  {id: 'celeb-16-yogurisimo', who: 'a girl', active: false, title: 'Can you understand this Argentine?', hooks: ['The worst place to ask for a yogurt', 'Day 7 of understanding Argentinians']},
  {id: 'celeb-17-messi-cenar', who: 'a guy', active: false, title: 'Can you understand this Argentine?', hooks: ['Can you understand what he asked?', 'Day 8 of understanding Argentinians']},
  {id: 'celeb-18-hijo-drogarse', who: 'a mom', active: false, title: 'Can you understand this Argentine?', hooks: ['Can you understand this mom?', 'Day 9 of understanding Argentinians']},
  {id: 'celeb-19-no-autorizada', who: 'a woman', active: false, title: 'Can you understand this Argentine?', hooks: ['She can’t tell you her name…', 'Day 10 of understanding Argentinians']},
  {id: 'celeb-20-sordomudo', who: 'a lady', active: false, title: 'Can you understand this Argentine?', hooks: ['Can you understand this call?', 'Day 11 of understanding Argentinians']},
  {id: 'celeb-21-hormiguita', who: 'a teacher', active: false, title: 'Can you understand this Argentine?', hooks: ['Can you understand this teacher?', 'Day 12 of understanding Argentinians']},
];

// 2026-11-07: the user approved every Pancho version in posta-videos/celeb except celeb-03 (pichi), which keeps its host version.
// Same hooks as the host versions, minus the "Day N" lines (the Pancho reels open with "Only 1%"). Order = the order they go out.
const PANCHO = ['02', '10', '05', '13', '08', '16', '14', '12', '04', '09', '07', '15', '17', '11', '18', '19', '20', '21'];
const ONLY = 'Only 1% of Spanish learners understand this… can you?';
for (const n of PANCHO) {
  const base = REELS.find(r => r.id.startsWith(`celeb-${n}-`));
  const slug = base.id.replace(/-(blur-host|host-blur|host|blur)$/, '');
  REELS.push({...base, id: `${slug}-pancho`, active: true, hooks: base.hooks.map(h => (/^Day \d+/.test(h) ? ONLY : h))});
}
// Their host versions step aside.
for (const r of REELS) if (/^celeb-0[47]-.*-blur-host$/.test(r.id)) r.active = false;
