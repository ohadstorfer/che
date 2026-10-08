// "Can you understand …?" reels: a real clip of a famous Argentine, played once plain,
// then slowly line by line with the words explained, then once more with subtitles.
// Times are seconds in the source clip. The clips themselves live outside the repo
// (posta-videos/sources) and are copied into public/celeb to render.
export const CELEBS = [
  {
    id: 'celeb-01-messi-bobo',
    who: 'Messi',
    source: 'celeb/messi-que-miras-bobo.mp4',
    full: [0.3, 9.4], // first play, no subtitles
    replay: [2.4, 9.4], // last play, with subtitles
    lines: [
      {from: 3.55, to: 5.75, es: ['¿Qué ', ['mirás'], ', ', ['bobo'], '?'], en: 'What are you looking at, dummy?',
        words: [{word: 'mirás', means: 'you’re looking', note: 'vos form · textbook: miras'}, {word: 'bobo', means: 'dummy', note: 'a soft insult'}]},
      {from: 5.75, to: 8.65, es: [['Andá'], ' ', ['pa’ allá'], ', bobo.'], en: 'Get out of here, dummy.',
        words: [{word: 'andá', means: 'go!', note: 'vos command · textbook: ve'}, {word: 'pa’ allá', means: 'over there', note: 'short for “para allá”'}]},
    ],
    subs: [
      [0.5, 3.55, '¿Quedaste un poco caliente por el final?', 'Still a bit heated about the ending?'],
      [3.55, 5.75, '¿Qué mirás, bobo? ¿Qué mirás, bobo?', 'What are you looking at, dummy?'],
      [5.75, 7.55, 'Andá, andá pa’ allá, bobo.', 'Go on, get out of here, dummy.'],
      [7.55, 8.65, 'Andá pa’ allá.', 'Get out of here.'],
      [8.65, 9.6, 'Tranquilo, Leo.', 'Easy, Leo.'],
    ],
  },
];
