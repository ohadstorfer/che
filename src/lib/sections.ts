// What each section lets her say, in her own voice — the line the sections
// screen puts in a speech bubble over the section she is in, the way Duolingo
// does. Written in the Spanish the section teaches, so it doubles as a promise
// she can already half read. Keyed by the section's slug; a section without a
// line simply shows none.

export const SECTION_CAN_DO: Record<string, string> = {
  'first-words': 'Puedo saludar, decir que no entiendo, contar de dónde soy y mi edad, y preguntar cuánto sale.',
  'everyday-things': 'Puedo hablar de mi gente, de mi casa, de adónde voy y de lo que hago hoy y mañana.',
  'out-and-about': 'Puedo moverme por el barrio, tomar el bondi, comprar ropa, pagar como acá y pedir ayuda.',
  'what-happened': 'Puedo armar un plan, contar qué hice el finde, decir qué me duele y organizar un viaje.',
  'when-i-was-a-kid': 'Puedo contar cómo era mi vida de chico, hablar de fútbol, pedir en una parrilla y juntarme a comer.',
  'plans-and-favours': 'Puedo mudarme, alquilar, hacer un trámite, pedir favores y comprar en la verdulería.',
  'real-life': 'Puedo arreglarme con el celu, hacer una denuncia, hablar del laburo y de la gente, y compartir un mate.',
  'wishes-and-advice': 'Puedo desearte suerte, dar consejos, decir qué me preocupa y entender el lunfardo.',
  'if-i-were-you': 'Puedo imaginar qué haría, hablar de plata y de precios, y contar lo que me dijeron.',
  'stories-and-opinions': 'Puedo contar lo que se me rompió, reclamar, arreglarme con el banco y discutir sin pelearme.',
  'making-your-case': 'Puedo defender lo que pienso, contar hace cuánto que estoy acá y decir qué hubiera hecho.',
  'between-the-lines': 'Puedo decir qué me da bronca, dar consejos sin ofender y entender cuándo un porteño habla en serio.',
  'in-other-words': 'Puedo contar lo que me pidieron, escribir un mail de laburo, pedir un aumento y quejarme como un porteño.',
  'news-and-the-street': 'Puedo entender las noticias, hablar de un paro, del tango y de la ciudad, y decir que no sin ofender.',
  'like-a-local': 'Puedo leer entre líneas, reírme con los chistes y contar la historia de mi familia. Ya soy de acá.',
};
