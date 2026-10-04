// The two denylists the course linter enforces (scripts/course/lib/rules.mjs),
// for anything an edge function writes in Spanish. Keep in step with rules.mjs,
// with two differences, because this is free speech and not a word list:
// tú forms the course never meets but a chat does (llamas, necesitas…) are
// added, and words that are also good Argentine in another sense are left out
// (camiseta de Boca, una piña, un curro, coche cama).

export const TUTEO = new Set([
  "tú", "ti", "contigo", "vosotros", "vosotras", "os", "vuestro", "vuestra", "vuestros", "vuestras",
  "eres", "tienes", "puedes", "quieres", "vienes", "haces", "dices", "sabes", "vives", "comes",
  "hablas", "estudias", "trabajas", "tomas", "escribes", "lees", "aprendes", "juegas", "pagas",
  "llegas", "prefieres", "duermes", "piensas", "entiendes", "caminas", "desayunas", "almuerzas",
  "acuestas", "levantas", "bañas", "traes", "llamas", "necesitas", "conoces", "crees", "vuelves",
  "sientes", "recuerdas", "pides", "sigues", "buscas", "viajas", "cocinas", "haz", "ten", "pon", "siéntate", "fíjate", "dime",
  "espérame", "escúchame", "mírame", "dilo", "dila", "dile", "diles", "dímelo", "díselo", "hazlo", "hazme", "ponlo", "ponte", "tenlo", "pruébalo", "escúchalo", "míralo", "repítelo", "dámelo", "pásamelo", "tráemelo", "cuéntame", "usted", "dígame", "dígale", "siéntese", "disculpe", "discúlpeme", "perdone", "perdóneme", "oiga", "fíjese", "quédese", "tráigame", "cuénteme", "hágame", "póngase", "pásemelo", "acérquese", "sois", "tenéis", "queréis", "podéis", "vais", "habláis",
  "coméis", "estáis", "hacéis",
]);

export const REGIONAL = new Set([
  "autobús", "móvil", "ordenador", "currar", "chamba", "chambear",
  "chaval", "chavala", "chavo", "chava", "playera", "deportivas", "chaqueta", "chamarra",
  "bonito", "bonita", "guay", "chido", "discoteca", "bollería", "fresa", "fresas", "aguacate",
  "elote", "aquí", "allí", "zumo", "patatas", "patata", "gafas", "conducir",
]);

const words = (text: string) => text.normalize("NFC").toLocaleLowerCase("es").split(/[^\p{L}]+/u);

/**
 * Spanish words a text quotes — its *italic* spans — that are tuteo or not
 * rioplatense. Words of `own` (what the learner wrote) are let through, so an
 * explanation can quote her mistake: "In Argentina it is *tenés*, not *tienes*."
 */
export function offendingSpanish(text: string, own = ""): string[] {
  const hers = new Set(words(own));
  const spans = [...text.matchAll(/\*([^*]+)\*/g)].map((m) => m[1]);
  return spans
    .flatMap(words)
    .filter((w) => w && !hers.has(w) && (TUTEO.has(w) || REGIONAL.has(w)));
}

/**
 * Every word of a text that is tuteo or not rioplatense — not just the quoted
 * ones. For whole sentences Pancho says out loud (hablar-reply's guard).
 *
 * Words are compared whole and exactly (lower-cased), so the character's name
 * written with its accent, "Tomás", never matches the verb form "tomas".
 */
export function offendingWords(text: string): string[] {
  return words(text).filter((w) => w && (TUTEO.has(w) || REGIONAL.has(w)));
}
