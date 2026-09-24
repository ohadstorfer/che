// What each section lets her say, in her own voice — the line the sections
// screen puts in a speech bubble over the section she is in, the way Duolingo
// does. Written in the Spanish the section teaches, so it doubles as a promise
// she can already half read. Keyed by the section's slug; a section without a
// line simply shows none.

export const SECTION_CAN_DO: Record<string, string> = {
  'first-words': 'Puedo saludar, decir de dónde soy y pedir un café.',
  'everyday-things': 'Puedo hablar de mi gente, de mi casa y de lo que hago todos los días.',
  'out-and-about': 'Puedo moverme por el barrio, comprar ropa y armar planes con amigos.',
  'what-happened': 'Puedo contar qué hice el finde, decir qué me duele y organizar un viaje.',
  'plans-and-favours': 'Puedo pedir favores, arreglarme con el celu y agradecer como un porteño.',
  'wishes-and-advice': 'Puedo desearte suerte, dar consejos y opinar sin quedar mal.',
  'if-i-were-you': 'Puedo dar consejos, imaginar qué haría y moverme por Buenos Aires como si fuera de acá.',
  'stories-and-opinions': 'Puedo contar lo que me pasó, discutir sin pelearme y chusmear como corresponde.',
  'making-your-case': 'Puedo defender lo que pienso, recibir gente en casa y hacer un trámite sin perderme.',
  'between-the-lines': 'Puedo buscar depto, dar consejos sin ofender y entender cuándo un porteño habla en serio.',
  'when-i-was-a-kid': 'Puedo contar cómo era mi vida de chico, pedir en un restaurante y armar planes.',
};
