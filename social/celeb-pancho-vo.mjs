// usage: node celeb-pancho-vo.mjs [reel id ...]     (no ids: every reel in SCRIPTS)
//   Records Pancho's lines for the celeb / Day reels in Tomás's voice to public/vo/<id>/ (one mp3 per slow line, plus the
//   intro and outro, which are shared in public/vo/pancho-shared/ unless a reel has its own), writes his mouths for each
//   into src/celeb/pancho-mouths.json under the clip's path, and every clip's length into src/celeb/pancho-vo.mjs.
//   Lines already recorded are kept.
//   His English must sound American and his Spanish Argentine: Tomás reads each line with accent tags (see `tagged`).
//   To re-record a reel, move its public/vo/<id>/ files away first (lines already recorded are kept).
//   Where the AI host had a script (Messi reels, Day 1, Day 3, Milei) Pancho says what she said; the rest are new, built
//   from each reel's two word stickers.
import fs from 'node:fs';
import {say, mouths, FPS} from './vo-lib.mjs';

process.loadEnvFile(new URL('../.env', import.meta.url));
// 2026-11-06: the American take turned the Spanish words gringo ("Sácame" for sacame, no sh), and Tomás reading English
// alone sounds British. So Tomás reads the whole line on eleven_v4 with accent tags (the user approved this on celeb-15):
// the Spanish in “…” gets an Argentine accent, everything else a strong American one. The tags are taken out of the
// letter times before the mouths are made.
const US = '[strong American accent] ', AR = '[Argentine Spanish accent] ';
export const tagged = text => US + text.replace(/“[^”]*”[,.…:;!?]*/g, q => AR + q + ' ' + US).replace(/\s+/g, ' ').trim()
  .replace(/\s*\[strong American accent\]$/, '');
function untag(file) {
  const al = JSON.parse(fs.readFileSync(file + '.json', 'utf8')), keep = [];
  let inTag = false;
  al.characters.forEach((c, i) => { if (c === '[') inTag = true; if (!inTag) keep.push(i); if (c === ']') inTag = false; });
  const out = {}; for (const k of Object.keys(al)) out[k] = keep.map(i => al[k][i]);
  fs.writeFileSync(file + '.json', JSON.stringify(out));
}

export const SHARED = {
  intro: 'Did you catch that? Let’s hear it again, slowly.',
  outro: 'And if you want to really understand Argentinians, check out the Posta app. It teaches you Spanish the way Argentinians really talk.',
};
export const SCRIPTS = {
  'celeb-02-milei-pelotudos': {
    intro: 'Okay, he’s angry. But did you catch the insult? Listen again, slowly.',
    lines: ['“Manga de” means a bunch of. And “pelotudos”… idiots. It’s strong, so careful who you say it to.',
      '“Te entran” is the money that comes in. And “podés” means you can.'],
    outro: 'And if you want to really understand Argentines, check out Posta. It teaches you Spanish the way Argentines really talk.',
  },
  'celeb-03-messi-suarez-pichi': {lines: [
    '“Hacer pichí” is the soft, cute way to say pee. So he asks: what position?',
    '“Meás” is the vos form of “mear”, to pee. He asks: you pee sitting down?',
    'And “yo también” just means me too. No verb needed.']},
  'celeb-04-messi-las-tres': {lines: [
    '“Querían” is for “ustedes”, so: all of you wanted. And “acá” just means here.',
    '“El año que viene” is next year. And “vamos a” plus a verb is the future.']},
  'celeb-05-messi-oveja': {lines: [
    '“Oveja” is sheep, and a sheep says “meee”. “Afirma” means it says yes.',
    'And yes is “sí”. So “meee” plus “sí”… Messi!']},
  'celeb-07-messi-vergonzoso': {lines: [
    '“Se hace” means he’s pretending. So “se hace el vergonzoso”: he’s acting shy.',
    '“Tremendo” means what a. And “hijo de puta”… here, it’s said with love.']},
  'celeb-08-messi-vino-sprite': {lines: [
    '“De siempre” means the usual. And “vino” is wine.',
    '“Pegue” comes from “pegar”, to hit. So “para que pegue rápido” means so it hits fast.']},
  'celeb-14-messi-nada-que-decir': {lines: [
    '“Prometí” comes from “prometer”: I promised. And “acá” is how we say here.',
    '“La verdad” means honestly. And “decirles” means to tell you all.']},
  'celeb-13-jugo-feo': {lines: [
    '“Jugo” is juice. In Spain they say “zumo”. And “feo” here just means it tastes bad.',
    '“Hacés” is the vos form: are you doing. And “hacer pis” means to pee.']},
  'celeb-09-susana-vivo': {lines: [
    '“Traído” comes from “traer”, to bring. And “dinosaurio”… dinosaur. They found its bones in Patagonia.',
    '“En serio” means really. And “vivo” means alive. Yes, she asked if the dinosaur was alive.']},
  'celeb-10-atiendo-boludos': {lines: [
    'A “línea” is a bus route. And in Argentina, a bus is a “colectivo”.',
    '“Atiendo” is I serve. And “boludos”… the classic Argentinian insult.']},
  'celeb-11-julio-aja': {lines: [
    '“Ajá” means yeah, sure. And “ajá las pelotas” is a rude way to say: no way, my foot.',
    '“Me cagué” is rude for I got really scared. And “boludo” here is friendly, like dude.']},
  'celeb-12-bici-arbol': {lines: [
    '“Choto” is a rude, very Argentinian word for useless. And “sos” is the vos form of “eres”.',
    '“Venís” is the vos form of “vienes”: you come. And “tragar” is to swallow, but here it means to crash into.']},
  'celeb-15-pizza-quemando': {lines: [
    '“Dale” means come on. You’ll hear it all day. And “quemando”… burning. That tray is hot.',
    'Then he gives a vos command: “sacame”, take for me. And “pelotuda”… a strong insult.']},
  'celeb-16-yogurisimo': {lines: [
    '“Acá” means here. And “hacen” is for “ustedes”: do you make. Argentinians never say “vosotros”.',
    '“Guardabarros” are car fenders, for a Ford Falcon. And “pelotuda”… a strong insult.']},
  'celeb-17-messi-cenar': {lines: [
    '“Beso” is kiss. And “en la boca”… on the mouth. On the cheek is “en la mejilla”.']},
  'celeb-18-hijo-drogarse': {lines: [
    '“Sabe” is the usted form. With vos, it’s “sabés”. And “para qué” means what for.',
    '“Drogarse” means to take drugs. And “eh?” at the end is like: huh? right?']},
  'celeb-19-no-autorizada': {lines: [
    '“Le puedo decir” means I can tell you, with “le” for usted. And then, “nombre” is name.',
    '“Autorizada” means allowed. It ends in “a” because she’s a woman. And “nada más” means nothing more.',
    '“Se llama” means her name is. And Rosa… that’s her name.']},
  'celeb-20-sordomudo': {lines: [
    '“Chico” is boy. In Argentina we also say “pibe”. And “sordomudo” is an old word for deaf-mute.',
    '“Ahí” means there. And “escuchándome” means listening to me. The “me” sticks to the end.']},
  'celeb-21-hormiguita': {lines: [
    '“Hormiguita” is little ant. The “ita” makes it small. And “se perdió” means it got lost.',
    '“Sos” is the vos form of “eres”. And “culiao”… a very rude word for jerk.']},
};

const MOUTHS = 'src/celeb/pancho-mouths.json', LENGTHS = 'src/celeb/pancho-vo.mjs';
const all = fs.existsSync(MOUTHS) ? JSON.parse(fs.readFileSync(MOUTHS, 'utf8')) : {};
const lengths = fs.existsSync(LENGTHS) ? (await import('./' + LENGTHS)).VO : {};
let billed = 0;
async function record(path, text) {
  const file = `public/${path}`;
  fs.mkdirSync(file.replace(/\/[^/]+$/, ''), {recursive: true});
  const cost = await say('tomas', tagged(text), file, {lang: null, stability: 0.5});
  if (cost) untag(file);
  billed += cost;
  const al = JSON.parse(fs.readFileSync(file + '.json', 'utf8'));
  const seconds = al.character_end_times_seconds.at(-1);
  all[path] = mouths(file, Math.ceil(seconds * FPS) + 6);
  lengths[path] = Math.round(seconds * 100) / 100;
  console.log(path, lengths[path], 's');
}
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SCRIPTS);
for (const [name, text] of Object.entries(SHARED)) await record(`vo/pancho-shared/${name}.mp3`, text);
for (const id of ids) {
  const s = SCRIPTS[id]; if (!s) throw new Error('no script for ' + id);
  if (s.intro) await record(`vo/${id}/intro.mp3`, s.intro);
  for (const [i, t] of s.lines.entries()) await record(`vo/${id}/l${i + 1}.mp3`, t);
  if (s.outro) await record(`vo/${id}/outro.mp3`, s.outro);
}
fs.writeFileSync(MOUTHS, JSON.stringify(all));
fs.writeFileSync(LENGTHS, '// Written by celeb-pancho-vo.mjs: seconds of speech in each of Pancho\'s clips.\nexport const VO = ' + JSON.stringify(lengths, null, 1) + ';\n');
console.log('characters billed', billed);
