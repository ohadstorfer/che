import type { ImageSourcePropType } from 'react-native';

// ---------------------------------------------------------------------------
// The art for culture screens. Culture shows the thing itself — a mate, a
// parrilla, a bandoneón — so the capybara doesn't carry every screen of the
// app. He stays as the one who asks the questions (`speakerArt`). Pages of one
// class rotate through their subject's objects, so a class doesn't repeat one
// picture card after card.
// ---------------------------------------------------------------------------

const O = {
  mate: require('@/assets/images/objects/mate-figure.webp'),
  mateTermo: require('@/assets/images/objects/mate-termo-figure.webp'),
  mateYerba: require('@/assets/images/objects/mate-yerba-figure.webp'),
  asado: require('@/assets/images/objects/asado-figure.webp'),
  choripan: require('@/assets/images/objects/choripan-figure.webp'),
  provoleta: require('@/assets/images/objects/provoleta-figure.webp'),
  empanadas: require('@/assets/images/objects/empanadas-figure.webp'),
  milanesa: require('@/assets/images/objects/milanesa-figure.webp'),
  pizza: require('@/assets/images/objects/pizza-figure.webp'),
  alfajor: require('@/assets/images/objects/alfajor-figure.webp'),
  dulce: require('@/assets/images/objects/dulce-de-leche-figure.webp'),
  alfajorMaicena: require('@/assets/images/objects/alfajor-maicena-figure.webp'),
  facturas: require('@/assets/images/objects/facturas-figure.webp'),
  ball: require('@/assets/images/objects/futbol-figure.webp'),
  jersey: require('@/assets/images/objects/futbol-camiseta-figure.webp'),
  cup: require('@/assets/images/objects/futbol-copa-figure.webp'),
  bandoneon: require('@/assets/images/objects/tango-figure.webp'),
  fedora: require('@/assets/images/objects/tango-sombrero-figure.webp'),
  guitar: require('@/assets/images/objects/musica-figure.webp'),
  bombo: require('@/assets/images/objects/musica-bombo-figure.webp'),
  redCard: require('@/assets/images/objects/puteadas-figure.webp'),
  scroll: require('@/assets/images/objects/historia-nacimiento-figure.webp'),
  flag: require('@/assets/images/objects/historia-moderna-figure.webp'),
  obelisco: require('@/assets/images/objects/buenos-aires-figure.webp'),
  colectivo: require('@/assets/images/objects/buenos-aires-colectivo-figure.webp'),
  cafe: require('@/assets/images/objects/costumbres-figure.webp'),
  book: require('@/assets/images/objects/dichos-figure.webp'),
  phone: require('@/assets/images/objects/habla-figure.webp'),
  birome: require('@/assets/images/objects/iconos-figure.webp'),
  andes: require('@/assets/images/objects/regiones-figure.webp'),
} satisfies Record<string, ImageSourcePropType>;

const bySection: Record<string, ImageSourcePropType[]> = {
  mate: [O.mate, O.mateTermo, O.mateYerba],
  asado: [O.asado, O.choripan, O.provoleta],
  comida: [O.empanadas, O.milanesa, O.pizza],
  alfajores: [O.alfajor, O.dulce, O.alfajorMaicena, O.facturas],
  futbol: [O.ball, O.jersey, O.cup],
  tango: [O.bandoneon, O.fedora],
  musica: [O.guitar, O.bombo],
  puteadas: [O.redCard],
  'historia-nacimiento': [O.scroll],
  'historia-moderna': [O.flag],
  'buenos-aires': [O.obelisco, O.colectivo, O.cafe],
  costumbres: [O.cafe, O.mate],
  dichos: [O.book],
  habla: [O.phone],
  iconos: [O.birome],
  regiones: [O.andes],
};

const general = [O.mate, O.empanadas, O.cafe];

/** The object for the nth page of a class in this subject. */
export function artFor(section: string, n = 0): ImageSourcePropType {
  const set = bySection[section] ?? general;
  return set[n % set.length];
}

/** Pictures cropped for the small tile: the parrilla without its tall plume of
 *  smoke, which shrank the grill to fit. */
const tileOnly: Record<string, ImageSourcePropType> = {
  asado: require('@/assets/images/objects/asado-tile.webp'),
};

/** A subject's own object for its tile and hero; unknown subjects take turns with the general set. */
export function tileArt(section: string, index: number): ImageSourcePropType {
  return tileOnly[section] ?? bySection[section]?.[0] ?? general[index % general.length];
}

// The capybara who asks the quiz questions — a person talks, a mate doesn't.
const speakers: Record<string, ImageSourcePropType> = {
  mate: require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.webp'),
  asado: require('@/assets/images/capybara/capybara-asado-figure.webp'),
  comida: require('@/assets/images/capybara/capybara-empanadas-figure.webp'),
  alfajores: require('@/assets/images/capybara/capybara-alfajor-figure.webp'),
  futbol: require('@/assets/images/capybara/capybara-futbol-gol-figure.webp'),
  tango: require('@/assets/images/capybara/capybara-tango-figure.webp'),
  puteadas: require('@/assets/images/capybara/capybara-puteadas-figure.webp'),
  musica: require('@/assets/images/capybara/capybara-musica-figure.webp'),
  'historia-nacimiento': require('@/assets/images/capybara/capybara-historia-figure.webp'),
  'historia-moderna': require('@/assets/images/capybara/capybara-historia-figure.webp'),
};
const speaker = require('@/assets/images/capybara/capybara-saludando-figure.webp');

/** The capybara beside a quiz question in this subject. */
export function speakerArt(section: string): ImageSourcePropType {
  return speakers[section] ?? speaker;
}
