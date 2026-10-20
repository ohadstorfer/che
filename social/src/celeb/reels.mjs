// "Can you understand …?" reels: a real clip of a famous Argentinian, played once plain,
// then slowly line by line with the words explained (each word lit as it is said: `say` is
// [start, end, the word's number in the line]), then the key line once more at full speed (`again`).
// Times are seconds in the source clip. The clips themselves live outside the repo
// (posta-videos/sources) and are copied into public/celeb to render.
export const CELEBS = [
  {
    id: 'celeb-01-messi-bobo',
    who: 'Messi',
    source: 'celeb/messi-que-miras-bobo.mp4',
    full: [0.3, 9.4], // first play, no subtitles
    lines: [
      {from: 3.55, to: 5.75, es: ['¿Qué ', ['mirás'], ', ', ['bobo'], '?'], en: 'What are you looking at, dummy?',
        say: [[3.82, 3.9, 0], [3.94, 4.14, 1], [4.2, 4.46, 2], [4.66, 4.76, 0], [4.8, 5.02, 1], [5.1, 5.4, 2]],
        words: [{word: 'mirás', means: 'you’re looking', note: 'vos form · textbook: miras'}, {word: 'bobo', means: 'dummy', note: 'a soft insult'}]},
      {from: 5.75, to: 8.65, es: [['Andá'], ' ', ['pa’ allá'], ', bobo.'], en: 'Get out of here, dummy.',
        say: [[5.86, 6.22, 0], [6.26, 6.32, 1], [6.38, 6.54, 2], [6.62, 6.9, 3], [7.28, 7.42, 0], [7.48, 7.54, 1], [7.6, 7.84, 2]],
        words: [{word: 'andá', means: 'go!', note: 'vos command · textbook: ve'}, {word: 'pa’ allá', means: 'over there', note: 'short for “para allá”'}]},
    ],
    again: {line: 0, from: 3.7, to: 5.55}, // last play: the key line at full speed
  },
  {
    id: 'celeb-02-milei-pelotudos',
    who: 'Milei',
    source: 'celeb/manga-de-pelotudos.mp4',
    full: [3.7, 12.2],
    lines: [
      {from: 6.45, to: 9.15, es: ['A ver si entienden, ', ['manga de'], ' ', ['pelotudos'], '.'], en: 'Let’s see if you get it, you bunch of idiots.',
        say: [[6.68, 6.74, 0], [6.76, 6.84, 1], [6.9, 6.96, 2], [7.0, 7.52, 3], [7.84, 8.22, 4], [8.24, 8.36, 5], [8.4, 9.02, 6]],
        words: [{word: 'manga de', means: 'a bunch of', note: 'about people · not polite'}, {word: 'pelotudos', means: 'idiots', note: 'a strong insult'}]},
      {from: 9.15, to: 12.2, es: ['Si ', ['te entran'], ' 100, no ', ['podés'], ' gastar 300.'], en: 'If you make 100, you can’t spend 300.',
        say: [[9.3, 9.4, 0], [9.44, 9.54, 1], [9.56, 9.88, 2], [9.96, 10.22, 3], [10.6, 10.74, 4], [10.78, 11.04, 5], [11.06, 11.38, 6], [11.44, 12.16, 7]],
        words: [{word: 'te entran', means: 'you make', note: 'money that comes in'}, {word: 'podés', means: 'you can', note: 'vos form · textbook: puedes'}]},
    ],
    again: {line: 0, from: 6.58, to: 9.17},
  },
  {
    id: 'celeb-03-messi-suarez-pichi',
    who: 'Messi',
    source: 'celeb/pichi-meas-sentado.mp4', // the later part of the same chat (te levantás, el chorrete) is celeb/suarez-meas-sentado.mp4
    full: [0.4, 9.7],
    lines: [
      {from: 0.5, to: 3.45, es: ['¿', ['Posición'], ' para ', ['hacer pichí'], '?'], en: 'Your position for peeing?',
        say: [[0.72, 1.32, 0], [2.66, 2.74, 1], [2.76, 2.9, 2], [2.94, 3.2, 3]],
        words: [{word: 'posición', means: 'position', note: 'standing or sitting?'}, {word: 'hacer pichí', means: 'to pee', note: 'a soft word · Argentina, Uruguay'}]},
      {from: 5.7, to: 6.9, es: ['¿Qué, ', ['meás'], ' ', ['sentado'], '?'], en: 'What, you pee sitting down?',
        say: [[5.92, 6.08, 0], [6.12, 6.24, 1], [6.26, 6.56, 2]],
        words: [{word: 'meás', means: 'you pee', note: 'vos form of “mear”'}, {word: 'sentado', means: 'sitting down', note: 'from “sentarse”'}]},
      {from: 8.9, to: 9.6, es: [['Yo también'], '.'], en: 'Me too.',
        say: [[9, 9.06, 0], [9.1, 9.34, 1]],
        words: [{word: 'yo también', means: 'me too', note: 'short reply, no verb needed'}, {word: 'también', means: 'also, too', note: 'the opposite: “tampoco”'}]},
    ],
    again: {line: 1, from: 5.8, to: 6.75},
  },
  {
    id: 'celeb-04-messi-las-tres',
    who: 'Messi',
    source: 'celeb/triplete-2009-promesa.mp4', // the 2009 celebration; the 2015 one is celeb/triplete-las-tres.mp4
    full: [2.4, 15.4],
    lines: [
      {from: 2.5, to: 5.5, es: ['¿', ['Querían'], ' las tres? ', ['Acá'], ' están las tres.'], en: 'You wanted all three? Here are all three.',
        say: [[2.72, 3.08, 0], [3.12, 3.32, 1], [3.36, 3.7, 2], [4.08, 4.34, 3], [4.36, 4.62, 4], [4.66, 4.8, 5], [4.92, 5.36, 6]],
        words: [{word: 'querían', means: 'you all wanted', note: 'ustedes · Spain: queríais'}, {word: 'acá', means: 'here', note: 'textbook: aquí'}]},
      {from: 10.5, to: 15.3, es: ['Y el año ', ['que viene'], ' vamos a seguir y ', ['vamos a'], ' ganar todo.'], en: 'And next year we’ll keep going and win everything.',
        say: [[10.72, 10.76, 0], [10.8, 10.9, 1], [10.96, 11.22, 2], [11.28, 11.4, 3], [11.44, 11.9, 4], [12.36, 12.62, 5], [12.66, 12.68, 6], [12.74, 13.3, 7], [13.62, 13.68, 8], [13.74, 13.98, 9], [13.98, 14.0, 10], [14.02, 14.32, 11], [14.44, 14.98, 12]],
        words: [{word: 'que viene', means: 'next', note: '“el año que viene” = next year'}, {word: 'vamos a', means: 'we’re going to', note: '“ir a” + verb = future'}]},
    ],
    again: {line: 0, from: 2.62, to: 5.45},
  },
  {
    id: 'celeb-05-messi-oveja',
    who: 'Messi',
    source: 'celeb/oveja-chiste.mp4', // the riddle joined to its answer; the talk in between is cut (uncut: celeb/ni-en-pedo.mp4)
    full: [0.1, 6.5],
    lines: [
      {from: 2.1, to: 4.25, es: ['Cuyo apellido es una ', ['oveja'], ' que ', ['afirma'], '.'], en: 'Whose last name is a sheep that says yes.',
        say: [[2.32, 2.52, 0], [2.56, 2.9, 1], [2.92, 3.0, 2], [3.06, 3.16, 3], [3.2, 3.48, 4], [3.5, 3.54, 5], [3.58, 3.94, 6]],
        words: [{word: 'oveja', means: 'sheep', note: 'it says “meee”'}, {word: 'afirma', means: 'says yes', note: '“sí” = yes'}]},
      {from: 4.3, to: 6.5, es: ['¿Cómo se llama? ', ['Meee'], '-', ['ssi'], '.'], en: 'What’s his name? Me-ssi.',
        say: [[4.36, 4.56, 0], [4.6, 4.62, 1], [4.64, 4.92, 2], [5.4, 5.9, 3], [5.9, 6.22, 4]],
        words: [{word: 'meee', means: 'baa', note: 'what a sheep says'}, {word: 'sí', means: 'yes', note: 'meee + sí = Messi'}]},
    ],
    again: {line: 1, from: 4.3, to: 6.4},
  },
  {
    id: 'celeb-06-messi-chau-diego',
    who: 'Messi',
    source: 'celeb/chau-diego.mp4',
    full: [1.2, 11.0],
    lines: [
      {from: 2.2, to: 3.9, es: [['Chau'], ', ', ['Diego'], '.'], en: 'Bye, Diego.',
        say: [[2.42, 2.58, 0], [2.62, 2.96, 1], [3.5, 3.78, 0]],
        words: [{word: 'chau', means: 'bye', note: 'Argentina’s “adiós”'}, {word: 'Diego', means: 'Maradona', note: 'he is on the phone'}]},
      {from: 9.9, to: 11.0, es: ['Me ', ['tengo que'], ' ', ['ir a comer'], '.'], en: 'I have to go eat.',
        say: [[10.16, 10.22, 0], [10.3, 10.48, 1], [10.52, 10.62, 2], [10.63, 10.68, 3], [10.68, 10.71, 4], [10.72, 10.92, 5]],
        words: [{word: 'tengo que', means: 'I have to', note: '“tener que” + verb'}, {word: 'ir a comer', means: 'go eat', note: 'said fast: “i’ a comé”'}]},
    ],
    again: {line: 1, from: 10.04, to: 11.0},
  },
  {
    id: 'celeb-07-messi-vergonzoso',
    who: 'Messi',
    source: 'celeb/vergonzoso.mp4',
    full: [0.2, 9.5],
    lines: [
      {from: 6.2, to: 7.15, es: [['Se hace'], ' el ', ['vergonzoso'], '.'], en: 'He’s acting shy.',
        say: [[6.4, 6.46, 0], [6.5, 6.64, 1], [6.66, 6.7, 2], [6.74, 7.14, 3]],
        words: [{word: 'se hace', means: 'he acts', note: '“hacerse el…” = to pretend'}, {word: 'vergonzoso', means: 'shy', note: 'from “vergüenza”, shame'}]},
      {from: 8.2, to: 9.4, es: [['Tremendo'], ' ', ['hijo de puta'], '.'], en: 'What a son of a bitch.',
        say: [[8.28, 8.62, 0], [8.64, 8.82, 1], [8.84, 8.92, 2], [8.94, 9.2, 3]],
        words: [{word: 'tremendo', means: 'what a…', note: 'makes it stronger'}, {word: 'hijo de puta', means: 'son of a bitch', note: 'here: said with love'}]},
    ],
    again: {line: 1, from: 8.18, to: 9.35},
  },
  {
    id: 'celeb-08-messi-vino-sprite',
    who: 'Messi',
    source: 'celeb/vino-sprite.mp4',
    full: [11.9, 20.2],
    lines: [
      {from: 12.85, to: 15.25, es: ['Si no, la misma ', ['de siempre'], ': ', ['vino'], ' y Sprite.'], en: 'If not, the usual: wine and Sprite.',
        say: [[13.06, 13.16, 0], [13.2, 13.26, 1], [13.36, 13.44, 2], [13.48, 13.64, 3], [13.7, 13.74, 4], [13.8, 14.3, 5], [14.36, 14.54, 6], [14.58, 14.6, 7], [14.74, 15.14, 8]],
        words: [{word: 'de siempre', means: 'the usual', note: '“la misma de siempre” = same as always'}, {word: 'vino', means: 'wine', note: 'with Sprite: a classic mix'}]},
      {from: 18.9, to: 20.15, es: ['Para que ', ['pegue'], ' ', ['rápido'], '.'], en: 'So it hits fast.',
        say: [[19.02, 19.12, 0], [19.14, 19.26, 1], [19.3, 19.48, 2], [19.54, 19.98, 3]],
        words: [{word: 'pegue', means: 'it hits', note: 'from “pegar”: to hit, to kick in'}, {word: 'rápido', means: 'fast', note: 'also: quickly'}]},
    ],
    again: {line: 1, from: 18.92, to: 20.13},
  },
  {
    id: 'celeb-09-susana-vivo',
    day: 2,
    who: 'this lady',
    source: 'celeb/vivo.mp4',
    full: [0, 4.5],
    lines: [
      {from: 0, to: 2.25, es: ['Hemos ', ['traído'], ' un ', ['dinosaurio'], ' de la Patagonia.'], en: 'We’ve brought a dinosaur from Patagonia.',
        say: [[0, 0.2, 0], [0.22, 0.46, 1], [0.5, 0.58, 2], [0.62, 1.3, 3], [1.44, 1.5, 4], [1.54, 1.58, 5], [1.68, 2.18, 6]],
        words: [{word: 'traído', means: 'brought', note: 'from “traer”, to bring'}, {word: 'dinosaurio', means: 'dinosaur', note: 'bones found in Patagonia'}]},
      {from: 2.25, to: 3.7, es: ['¿', ['En serio'], '? ¿', ['Vivo'], '?'], en: 'Really? Alive?',
        say: [[2.28, 2.42, 0], [2.56, 2.84, 1], [3.36, 3.64, 2]],
        words: [{word: 'en serio', means: 'really?', note: 'literally “seriously”'}, {word: 'vivo', means: 'alive', note: 'her most famous line'}]},
    ],
    again: {line: 1, from: 2.2, to: 3.7},
  },
  {
    id: 'celeb-10-atiendo-boludos',
    day: 3,
    who: 'this inspector',
    source: 'celeb/atiendo-boludos.mp4',
    full: [0.1, 6.65],
    lines: [
      {from: 1.55, to: 3.5, es: ['…por ser inspector de una ', ['línea'], ' de ', ['colectivos'], '?'], en: '…because you’re a bus line inspector?',
        say: [[1.7, 1.8, 0], [1.84, 1.96, 1], [2.0, 2.38, 2], [2.4, 2.44, 3], [2.46, 2.58, 4], [2.62, 2.78, 5], [2.8, 2.86, 6], [2.9, 3.42, 7]],
        words: [{word: 'línea', means: 'route', note: 'a bus line'}, {word: 'colectivos', means: 'buses', note: 'Argentina’s word for bus'}]},
      {from: 4.55, to: 6.64, es: [['Atiendo'], ' ', ['boludos'], '. ¿No te das cuenta que atiendo boludos?'], en: 'I serve idiots. Don’t you see I serve idiots?',
        say: [[4.78, 5.08, 0], [5.12, 5.54, 1], [5.58, 5.66, 2], [5.68, 5.74, 3], [5.76, 5.84, 4], [5.88, 6.04, 5], [6.08, 6.1, 6], [6.12, 6.38, 7], [6.42, 6.62, 8]],
        words: [{word: 'atiendo', means: 'I serve', note: 'from “atender”: to deal with'}, {word: 'boludos', means: 'idiots', note: 'the classic Argentinian insult'}]},
    ],
    again: {line: 1, from: 4.68, to: 6.64},
  },
  {
    id: 'celeb-11-julio-aja',
    day: 4,
    who: 'Julio',
    source: 'celeb/aja-las-pelotas.mp4',
    full: [0, 9.35],
    lines: [
      {from: 6.85, to: 8.08, es: [['Ajá'], ' ', ['las pelotas'], ', boludo.'], en: '“Uh-huh” my foot, man.',
        say: [[7.06, 7.24, 0], [7.28, 7.34, 1], [7.42, 7.78, 2], [7.84, 8.06, 3]],
        words: [{word: 'ajá', means: 'uh-huh', note: 'the reporter keeps saying it'}, {word: 'las pelotas', means: 'my foot!', note: 'rude · “X las pelotas” = no way'}]},
      {from: 8.08, to: 9.3, es: [['Me cagué'], ' todo, ', ['boludo'], '.'], en: 'I was really scared, man.',
        say: [[8.1, 8.22, 0], [8.26, 8.48, 1], [8.56, 8.84, 2], [8.92, 9.2, 3]],
        words: [{word: 'me cagué', means: 'I got scared', note: 'rude · literally “I shat myself”'}, {word: 'boludo', means: 'man', note: 'here friendly, like “dude”'}]},
    ],
    again: {line: 0, from: 6.96, to: 8.08},
  },
  {
    id: 'celeb-12-bici-arbol',
    day: 5,
    who: 'this dad',
    source: 'celeb/bici-arbol.mp4',
    full: [0, 16.9], // the whole video, as asked
    lines: [
      {from: 11.6, to: 12.9, es: ['¡Qué ', ['choto'], ' que ', ['sos'], '!'], en: 'You’re so useless!',
        say: [[11.82, 11.96, 0], [12.08, 12.5, 1], [12.56, 12.66, 2], [12.74, 12.88, 3]],
        words: [{word: 'choto', means: 'useless', note: 'rude, very Argentinian'}, {word: 'sos', means: 'you are', note: 'vos form · textbook: eres'}]},
      {from: 12.9, to: 15.0, es: ['El único árbol que hay te lo ', ['venís'], ' a ', ['tragar'], '.'], en: 'The only tree here and you crash right into it.',
        say: [[12.9, 12.98, 0], [13.04, 13.38, 1], [13.44, 13.74, 2], [13.8, 13.84, 3], [13.88, 13.98, 4], [14.04, 14.12, 5], [14.14, 14.2, 6], [14.24, 14.42, 7], [14.44, 14.48, 8], [14.54, 14.86, 9]],
        words: [{word: 'venís', means: 'you come', note: 'vos form · textbook: vienes'}, {word: 'tragar', means: 'to swallow', note: 'here: to crash into'}]},
    ],
    again: {line: 1, from: 12.8, to: 14.98},
  },
  {
    id: 'celeb-13-jugo-feo',
    day: 1,
    who: 'this kid',
    source: 'celeb/jugo-feo.mp4',
    full: [0, 8.3], // the whole video, as asked
    lines: [
      {from: 0.4, to: 1.6, es: ['Este ', ['jugo'], ' está ', ['feo'], '.'], en: 'This juice tastes bad.',
        say: [[0.6, 0.7, 0], [0.72, 0.9, 1], [0.9, 1.05, 2], [1.12, 1.48, 3]],
        words: [{word: 'jugo', means: 'juice', note: 'Spain says “zumo”'}, {word: 'feo', means: 'bad', note: 'for taste: “está feo”'}]},
      {from: 2.45, to: 4.4, es: ['¿Qué ', ['hacés'], '?\nAhí ', ['hice pis'], ' yo.'], en: 'What are you doing? I peed there.',
        say: [[2.58, 2.68, 0], [2.78, 2.96, 1], [3.16, 3.3, 2], [3.4, 3.52, 3], [3.64, 3.9, 4], [3.9, 4.1, 5]],
        words: [{word: 'hacés', means: 'are you doing', note: 'vos form · textbook: haces'}, {word: 'hice pis', means: 'I peed', note: '“hacer pis” = to pee'}]},
    ],
    again: {line: 1, from: 2.48, to: 4.4},
  },
  {
    id: 'celeb-14-messi-nada-que-decir',
    who: 'Messi',
    source: 'celeb/nada-que-decir.mp4',
    full: [1.3, 7.65],
    lines: [
      {from: 1.45, to: 4.2, es: [['Prometí'], ' que hoy iba a hablar, y ', ['acá'], ' estoy.'], en: 'I promised I’d speak today, and here I am.',
        say: [[1.68, 2.1, 0], [2.14, 2.2, 1], [2.22, 2.38, 2], [2.4, 2.5, 3], [2.5, 2.54, 4], [2.54, 2.92, 5], [3.38, 3.42, 6], [3.46, 3.62, 7], [3.68, 4.06, 8]],
        words: [{word: 'prometí', means: 'I promised', note: 'from “prometer”'}, {word: 'acá', means: 'here', note: 'textbook: aquí'}]},
      {from: 5.35, to: 7.65, es: [['La verdad'], ', no tengo nada que ', ['decirles'], '.'], en: 'Honestly, I have nothing to tell you.',
        say: [[5.58, 5.68, 0], [5.7, 6.1, 1], [6.46, 6.54, 2], [6.6, 6.8, 3], [6.84, 7.06, 4], [7.12, 7.16, 5], [7.28, 7.58, 6]],
        words: [{word: 'la verdad', means: 'honestly', note: 'literally “the truth”'}, {word: 'decirles', means: 'to tell you all', note: '“les” = ustedes'}]},
    ],
    again: {line: 1, from: 5.48, to: 7.65},
  },
];

// A one-off test of the same reel with a person reacting: she talks over the stopped clip after
// the plain play and after each line. Her video is generated (photo + voice + lip-sync) on green.
CELEBS.push({...CELEBS[0], id: 'celeb-01-messi-bobo-host', live: true,
  host: {video: 'celeb/host-messi-bobo.mp4', intro: [0, 3.72], lines: [[3.72, 9.34], [9.34, 13.5]],
    outro: {video: 'celeb/host-messi-bobo-outro.mp4', from: 0, to: 7.1}}});

// The host version in the creator-captions look, with her closing line over the ending.
CELEBS.push({...CELEBS[0], id: 'celeb-01-messi-bobo-captions', look: 'captions', live: true,
  host: {video: 'celeb/host-messi-bobo.mp4', intro: [0, 3.72], lines: [[3.72, 9.34], [9.34, 13.5]],
    outro: {video: 'celeb/host-messi-bobo-outro.mp4', from: 0, to: 7.1}}});

// Milei with the host (navy t-shirt, ponytail). It plays the whole clip, opening insult included,
// which the plain version skips: the user asked for that here.
CELEBS.push({...CELEBS.find(r => r.id === 'celeb-02-milei-pelotudos'), id: 'celeb-02-milei-pelotudos-host', live: true, full: [0, 12.2],
  host: {video: 'celeb/host-milei-pelotudos.mp4', intro: [0, 5.48], lines: [[5.48, 13.72], [13.72, 16.6]],
    outro: {video: 'celeb/host-milei-pelotudos-outro.mp4', from: 0, to: 7.2}}});

// Day 1 with the host (Martina's voice, her.jpg): she talks after the plain play and after each slow line.
CELEBS.push({...CELEBS.find(r => r.id === 'celeb-13-jugo-feo'), id: 'celeb-13-jugo-feo-host',
  host: {video: 'celeb/host-jugo-talk.mp4', intro: [0, 6], lines: [[6, 13.36], [13.36, 22.4]],
    outro: {video: 'celeb/host-jugo-outro.mp4', from: 0, to: 7.19}}});

// Day series, added 2026-10-18 from pasted links (cropped to the video area; clips in posta-videos/sources/memes/).
CELEBS.push(
  {"id":"celeb-15-pizza-quemando","day":6,"who":"this man","source":"celeb/pizza-quemando.mp4","full":[0,9.5],"lines":[{"from":4.3,"to":5.55,"es":[["Dale"]," que me cago ",["quemando"],"."],"en":"Come on, this is burning me!","say":[[4.42,4.58,0],[4.64,4.7,1],[4.74,4.84,2],[4.86,5.02,3],[5.08,5.46,4]],"words":[{"word":"dale","means":"come on","note":"also “okay” or “deal”"},{"word":"quemando","means":"burning","note":"the tray is hot"}]},{"from":6.6,"to":9.5,"es":["¡Y ",["sacame"]," foto!\n¡Qué ",["pelotuda"]," que sos!"],"en":"Then take my picture! What an idiot you are!","say":[[6.7,6.8,0],[6.86,7.26,1],[7.38,8.02,2],[8.26,8.34,3],[8.46,9.1,4],[9.2,9.26,5],[9.34,9.46,6]],"words":[{"word":"sacame","means":"take for me","note":"vos command · textbook: sácame"},{"word":"pelotuda","means":"idiot (fem.)","note":"a strong insult"}]}],"again":{"line":1,"from":6.6,"to":9.5}},
  {"id":"celeb-16-yogurisimo","day":7,"who":"this girl","source":"celeb/yogurisimo.mp4","full":[0,6.23],"lines":[{"from":2.3,"to":4.1,"es":["¿",["Acá"]," ",["hacen"]," Yogurísimo?"],"en":"Do you make Yogurísimo here?","say":[[2.4,2.64,0],[2.66,2.86,1],[3,4,2]],"words":[{"word":"acá","means":"here","note":"textbook: aquí"},{"word":"hacen","means":"do you make","note":"to “ustedes” · no vosotros"}]},{"from":4.1,"to":6.23,"es":["No, hacemos ",["guardabarros"]," de Falcon, ",["pelotuda"],"."],"en":"No, we make Falcon fenders, you idiot.","say":[[4.2,4.3,0],[4.48,4.8,1],[4.82,5.32,2],[5.34,5.42,3],[5.44,5.76,4],[5.84,6.2,5]],"words":[{"word":"guardabarros","means":"car fenders","note":"Falcon: a classic Ford"},{"word":"pelotuda","means":"idiot (fem.)","note":"a strong insult"}]}],"again":{"line":1,"from":4.1,"to":6.23}},
  {"id":"celeb-17-messi-cenar","day":8,"who":"this guy","source":"celeb/messi-cenar.mp4","full":[0,7.1],"lines":[{"from":1.8,"to":2.85,"es":["¿Te puedo dar un ",["beso"]," ",["en la boca"],"?"],"en":"Can I give you a kiss on the mouth?","say":[[1.95,1.99,0],[2.04,2.1,1],[2.1,2.14,2],[2.16,2.2,3],[2.22,2.38,4],[2.39,2.41,5],[2.42,2.48,6],[2.5,2.7,7]],"words":[{"word":"beso","means":"kiss","note":"a small one: “besito”"},{"word":"en la boca","means":"on the mouth","note":"cheek: “en la mejilla”"}]}],"again":{"line":0,"from":1.7,"to":3}},
  {"id":"celeb-18-hijo-drogarse","day":9,"who":"this mom","source":"celeb/hijo-drogarse.mp4","full":[0,9.7],"lines":[{"from":4.5,"to":6.5,"es":["¿Pero ",["sabe"]," ",["para qué"],"?"],"en":"But do you know what for?","say":[[4.64,5.86,0],[5.9,6.08,1],[6.14,6.28,2],[6.34,6.42,3]],"words":[{"word":"sabe","means":"do you know","note":"usted form · vos: sabés"},{"word":"para qué","means":"what for","note":"purpose · “por qué” = why"}]},{"from":6.4,"to":8.3,"es":["Simplemente para ",["drogarse"],", ",["¿eh?"]],"en":"Simply to get high, huh?","say":[[6.52,6.98,0],[7,7.14,1],[7.16,7.64,2],[7.64,8,3]],"words":[{"word":"drogarse","means":"to take drugs","note":"reflexive: “se”"},{"word":"¿eh?","means":"huh? right?","note":"a tag at the end"}]}],"again":{"line":1,"from":6.4,"to":8.3}},
  {"id":"celeb-19-no-autorizada","day":10,"who":"this woman","source":"celeb/no-autorizada.mp4","full":[0,7.1],"lines":[{"from":1.4,"to":2.8,"es":["No, no ",["le puedo decir"]," mi ",["nombre"]],"en":"No, I can’t tell you my name","say":[[1.5,1.6,0],[1.66,1.74,1],[1.76,1.86,2],[1.94,2.1,3],[2.14,2.38,4],[2.44,2.52,5],[2.56,2.76,6]],"words":[{"word":"le puedo decir","means":"I can tell you","note":"“le” = to you (usted)"},{"word":"nombre","means":"name","note":"last name: “apellido”"}]},{"from":2.75,"to":5,"es":["Porque no estoy ",["autorizada"]," a decir ",["nada más"],"."],"en":"Because I’m not allowed to say anything more.","say":[[2.8,2.94,0],[3.04,3.1,1],[3.14,3.3,2],[3.34,3.9,3],[3.96,4.02,4],[4.04,4.38,5],[4.54,4.74,6],[4.82,5.02,7]],"words":[{"word":"autorizada","means":"allowed (fem.)","note":"ends in -a: she is a woman"},{"word":"nada más","means":"nothing more","note":"also “that’s all”"}]},{"from":4.7,"to":5.9,"es":["Se llama ",["Rosa"],"."],"en":"Her name is Rosa.","say":[[4.76,4.84,0],[4.84,5.12,1],[5.2,5.42,2]],"words":[{"word":"se llama","means":"is called","note":"literally “calls itself”"},{"word":"Rosa","means":"a name","note":"also the colour pink"}]}],"again":{"line":2,"from":4.7,"to":6}},
  {"id":"celeb-20-sordomudo","day":11,"who":"this lady","source":"celeb/sordomudo.mp4","full":[0,10.2],"lines":[{"from":0.1,"to":1.95,"es":["El ",["chico"]," que escribió es ",["sordomudo"],"."],"en":"The boy who wrote is deaf-mute.","say":[[0.22,0.32,0],[0.34,0.54,1],[0.58,0.66,2],[0.68,1,3],[1.04,1.12,4],[1.16,1.8,5]],"words":[{"word":"chico","means":"boy","note":"Argentina: also “pibe”"},{"word":"sordomudo","means":"deaf-mute","note":"old word · today: “sordo”"}]},{"from":8.6,"to":10.1,"es":["¿Está ",["ahí"]," ",["escuchándome"],"?"],"en":"Are you there listening to me?","say":[[8.74,9.04,0],[9.06,9.18,1],[9.22,9.96,2]],"words":[{"word":"ahí","means":"there","note":"here: “are you there?”"},{"word":"escuchándome","means":"listening to me","note":"“me” sticks to the end"}]}],"again":{"line":1,"from":8.6,"to":10.1}},
  {"id":"celeb-21-hormiguita","day":12,"who":"this teacher","source":"celeb/hormiguita.mp4","full":[12.9,18.2],"lines":[{"from":12.9,"to":16.6,"es":["La ",["hormiguita"]," ",["se perdió"],"."],"en":"The little ant got lost.","say":[[13.04,13.14,0],[13.16,14.18,1],[14.34,14.44,2],[14.66,15.42,3],[15.66,15.76,2],[15.96,16.54,3]],"words":[{"word":"hormiguita","means":"little ant","note":"diminutive: -ita"},{"word":"se perdió","means":"got lost","note":"perder → se perdió"}]},{"from":16.6,"to":17.6,"es":[["Sos"]," un ",["culiao"],"."],"en":"You’re a jerk.","say":[[16.68,16.84,0],[16.94,17.02,1],[17.06,17.42,2]],"words":[{"word":"sos","means":"you are","note":"vos form · textbook: eres"},{"word":"culiao","means":"jerk","note":"very rude · from “culiado”"}]}],"again":{"line":1,"from":16.55,"to":17.7}},
);

// Day 3 with the host: one clip per piece (a generic intro shared by all Day reels, a hold per line); her closing line is the one made for Day 1.
CELEBS.push({...CELEBS.find(r => r.id === 'celeb-10-atiendo-boludos'), id: 'celeb-10-atiendo-boludos-host',
  host: {videos: {intro: 'celeb/host-intro-generic.mp4', lines: ['celeb/host-atiendo-l1.mp4', 'celeb/host-atiendo-l2.mp4']},
    intro: [0, 3.24], lines: [[0, 5], [0, 5.44]],
    outro: {video: 'celeb/host-jugo-outro.mp4', from: 0, to: 7.19}}});
