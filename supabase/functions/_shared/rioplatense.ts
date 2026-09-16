// The two denylists the course linter enforces (scripts/course/lib/rules.mjs),
// for anything an edge function writes in Spanish. Keep in step with rules.mjs.

export const TUTEO = new Set([
  "tú", "ti", "contigo", "vosotros", "vosotras", "os", "vuestro", "vuestra", "vuestros", "vuestras",
  "eres", "tienes", "puedes", "quieres", "vienes", "haces", "dices", "sabes", "vives", "comes",
  "hablas", "estudias", "trabajas", "tomas", "escribes", "lees", "aprendes", "juegas", "pagas",
  "llegas", "prefieres", "duermes", "piensas", "entiendes", "caminas", "desayunas", "almuerzas",
  "acuestas", "levantas", "bañas", "traes", "haz", "ten", "pon", "siéntate", "fíjate", "dime",
  "espérame", "escúchame", "mírame", "sois", "tenéis", "queréis", "podéis", "vais", "habláis",
  "coméis", "estáis", "hacéis",
]);

export const REGIONAL = new Set([
  "coche", "coches", "autobús", "móvil", "ordenador", "curro", "currar", "chamba", "chambear",
  "chaval", "chavala", "chavo", "chava", "camiseta", "playera", "deportivas", "chaqueta", "chamarra",
  "bonito", "bonita", "guay", "chido", "discoteca", "bollería", "fresa", "fresas", "aguacate", "piña",
  "elote", "aquí", "allí", "zumo", "patatas", "patata", "gafas", "conducir",
]);

/** Spanish words a text quotes — its *italic* spans — that are tuteo or not rioplatense. */
export function offendingSpanish(text: string): string[] {
  const spans = [...text.matchAll(/\*([^*]+)\*/g)].map((m) => m[1]);
  return spans
    .flatMap((span) => span.toLocaleLowerCase("es").split(/[^\p{L}]+/u))
    .filter((w) => w && (TUTEO.has(w) || REGIONAL.has(w)));
}
