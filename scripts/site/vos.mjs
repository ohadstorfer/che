// The 50 verbs of the /vos pages and the free vos cheat sheet, and their
// vos and tú forms (build-learn.mjs checks them against the course's forms).

export const VERBS = {
  ser: 'to be', estar: 'to be (where, how)', tener: 'to have', ir: 'to go', querer: 'to want',
  hacer: 'to do, to make', decir: 'to say, to tell', salir: 'to go out, to leave', llegar: 'to arrive',
  poder: 'can, to be able to', venir: 'to come', laburar: 'to work (casual)', ver: 'to see, to watch',
  tomar: 'to take, to drink', hablar: 'to talk, to speak', saber: 'to know', pedir: 'to ask for, to order',
  llamar: 'to call', comer: 'to eat', pagar: 'to pay', vivir: 'to live', comprar: 'to buy', dar: 'to give',
  traer: 'to bring', pasar: 'to pass, to happen, to come by', necesitar: 'to need', esperar: 'to wait, to hope',
  estudiar: 'to study', buscar: 'to look for, to pick up', mandar: 'to send', avisar: 'to let someone know',
  volver: 'to come back, to go back', ayudar: 'to help', dejar: 'to leave, to let', perder: 'to lose, to miss',
  andar: 'to go around, to ride, to work (a machine)', entender: 'to understand', empezar: 'to start',
  dormir: 'to sleep', llevar: 'to take, to carry', conocer: 'to know (a person or place), to meet',
  viajar: 'to travel', jugar: 'to play', leer: 'to read', poner: 'to put', sacar: 'to take out',
  creer: 'to believe, to think', mirar: 'to look at, to watch', contar: 'to tell, to count',
  seguir: 'to keep going, to follow',
};

const END = (inf) => inf.slice(-2);
const STEM = (inf) => inf.slice(0, -2);
const VOS_PRES = { ser: 'sos', ir: 'vas', ver: 'ves', dar: 'das' };
const VOS_IMP = { ser: 'sé', ir: 'andá', dar: 'da' };
const NO_IMP = new Set(['poder', 'saber', 'necesitar', 'estar', 'ver', 'perder', 'creer']);
const PRET = {
  ser: 'fuiste', ir: 'fuiste', estar: 'estuviste', tener: 'tuviste', querer: 'quisiste', hacer: 'hiciste',
  decir: 'dijiste', poder: 'pudiste', venir: 'viniste', ver: 'viste', saber: 'supiste', dar: 'diste',
  traer: 'trajiste', andar: 'anduviste', poner: 'pusiste', leer: 'leíste', creer: 'creíste',
};
const TU_PRES = {
  ser: 'eres', ir: 'vas', ver: 'ves', dar: 'das', estar: 'estás',
  querer: 'quieres', poder: 'puedes', tener: 'tienes', venir: 'vienes', decir: 'dices', pedir: 'pides',
  volver: 'vuelves', perder: 'pierdes', entender: 'entiendes', empezar: 'empiezas', dormir: 'duermes',
  jugar: 'juegas', contar: 'cuentas', seguir: 'sigues',
};
const STEM_CHANGE = new Set(['querer', 'poder', 'tener', 'venir', 'decir', 'pedir', 'volver', 'perder',
  'entender', 'empezar', 'dormir', 'jugar', 'contar', 'seguir']);
const TU_IMP = { tener: 'ten', venir: 'ven', hacer: 'haz', decir: 'di', poner: 'pon', salir: 'sal', ir: 've', ser: 'sé', dar: 'da' };

export function conj(inf) {
  const e = END(inf), s = STEM(inf);
  const vosPres = VOS_PRES[inf] ?? s + { ar: 'ás', er: 'és', ir: 'ís' }[e];
  const tuPres = TU_PRES[inf] ?? s + { ar: 'as', er: 'es', ir: 'es' }[e];
  const vosImp = NO_IMP.has(inf) ? null : VOS_IMP[inf] ?? s + { ar: 'á', er: 'é', ir: 'í' }[e];
  const tuImp = vosImp ? TU_IMP[inf] ?? tuPres.replace(/s$/, '') : null;
  const pret = PRET[inf] ?? s + (e === 'ar' ? 'aste' : 'iste');
  return { vosPres, tuPres, vosImp, tuImp, pret };
}

