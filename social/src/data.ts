export type Line = {l: string; r?: string};
export type Video = {
  id: string;
  title: string;
  layout: 'equals' | 'stack';
  lines: Line[];
  // what to film/find for the background (see backgrounds/README.md)
  bgIdea: string;
  tint: string;
};

export const VIDEOS: Video[] = [
  {id: '01-texting', title: 'Argentine Texting Essentials 🇦🇷', layout: 'equals', bgIdea: 'Messi celebrating / walking with the Cup',
    tint: '#0b2a4a', lines: [
    {l: 'XQ', r: 'Porque'}, {l: 'TMB', r: 'También'}, {l: 'XFA', r: 'Por favor'}, {l: 'NTP', r: 'No te preocupes'},
    {l: 'TQM', r: 'Te quiero mucho'}, {l: 'AHRE', r: 'Just kidding'}, {l: 'BLDO', r: 'Boludo'}, {l: 'HDP', r: 'Hijo de puta'}]},
  {id: '02-cool', title: '6 Ways to Say "Cool" in Argentina', layout: 'equals', bgIdea: 'Buenos Aires street / colorful La Boca',
    tint: '#3a1450', lines: [
    {l: 'Copado', r: 'Cool'}, {l: 'Groso', r: 'Awesome'}, {l: 'Bárbaro', r: 'Great'}, {l: 'De diez', r: 'Perfect (a 10)'},
    {l: 'Re bueno', r: 'Really good'}, {l: 'Está joya', r: "It's gold"}]},
  {id: '03-puteadas', title: 'Argentine Swear Words 🤬 Mild → Heavy', layout: 'stack', bgIdea: 'Milei shouting / angry fan in the stands',
    tint: '#4a0f0f', lines: [
    {l: 'Boludo', r: 'Dude (friendly!)'}, {l: 'Pelotudo', r: 'Idiot'}, {l: 'La puta madre', r: 'Damn it!'},
    {l: 'Hijo de puta', r: 'Son of a b*tch'}, {l: 'Andá a cagar', r: 'Get lost'}]},
  {id: '04-voseo', title: 'Vos, not Tú 🇦🇷', layout: 'equals', bgIdea: 'Friends laughing at a bar / mate circle',
    tint: '#0f3a3a', lines: [
    {l: 'Tú eres', r: 'Vos sos'}, {l: 'Tú tienes', r: 'Vos tenés'}, {l: 'Tú quieres', r: 'Vos querés'},
    {l: 'Tú puedes', r: 'Vos podés'}, {l: 'Ven aquí', r: 'Vení acá'}, {l: 'Dime', r: 'Decime'}]},
  {id: '05-asado', title: 'Ordering at an Asado 🔥', layout: 'equals', bgIdea: 'Sizzling parrilla close-up, meat on the grill',
    tint: '#4a1e0a', lines: [
    {l: 'Choripán', r: 'Sausage sandwich'}, {l: 'Chinchulines', r: 'Small intestines'}, {l: 'Morcilla', r: 'Blood sausage'},
    {l: 'Vacío', r: 'Flank steak'}, {l: 'Bien cocido', r: 'Well done'}, {l: 'Jugoso', r: 'Medium rare'}]},
  {id: '06-futbol', title: 'What Argentines Yell at Football ⚽', layout: 'stack', bgIdea: 'Messi goal / crowd singing',
    tint: '#0b2a4a', lines: [
    {l: '¡Golazo!', r: 'What a goal!'}, {l: 'La rompió', r: 'He crushed it'}, {l: 'Crack', r: 'Superstar'},
    {l: '¡Dale, campeón!', r: 'Come on, champ!'}, {l: 'Muchachos', r: 'Lads (the anthem!)'}]},
  {id: '07-mate', title: 'Mate Vocabulary 🧉', layout: 'equals', bgIdea: 'Slow-motion pouring hot water into a mate gourd',
    tint: '#1c3a1c', lines: [
    {l: 'Cebar', r: 'To prepare & serve mate'}, {l: 'Yerba', r: 'The herb'}, {l: 'Bombilla', r: 'Metal straw'},
    {l: 'Termo', r: 'Thermos'}, {l: 'Lavado', r: 'Washed out (no flavor)'}, {l: 'Amargo', r: 'Unsweetened'}]},
  {id: '08-money', title: 'Argentine Money Slang 💸', layout: 'equals', bgIdea: 'Wad of pesos / Buenos Aires cueva',
    tint: '#1e3320', lines: [
    {l: 'Guita', r: 'Money'}, {l: 'Plata', r: 'Money'}, {l: 'Mango', r: 'One peso'},
    {l: 'Una luca', r: '1,000 pesos'}, {l: 'Estoy pelado', r: "I'm broke"}, {l: 'Está carísimo', r: "It's so expensive"}]},
  {id: '09-say-this', title: 'Say THIS, not THAT in Argentina', layout: 'equals', bgIdea: 'Aerial Buenos Aires / Obelisco at night',
    tint: '#2a1450', lines: [
    {l: 'Coche ❌', r: 'Auto ✅'}, {l: 'Autobús ❌', r: 'Colectivo ✅'}, {l: 'Móvil ❌', r: 'Celular ✅'},
    {l: 'Camarero ❌', r: 'Mozo ✅'}, {l: 'Coger ❌', r: 'Agarrar ✅'}, {l: 'Jersey ❌', r: 'Buzo ✅'}]},
  {id: '10-che', title: 'Hello & Goodbye in Argentina 👋', layout: 'stack', bgIdea: 'Two friends kissing cheek greeting / airport hug',
    tint: '#0f3a4a', lines: [
    {l: '¡Che!', r: 'Hey! / Dude!'}, {l: '¿Qué hacés?', r: "What's up?"}, {l: '¿Todo bien?', r: 'All good?'},
    {l: 'Nos vemos', r: 'See you'}, {l: 'Chau, chau', r: 'Bye!'}]},
];
