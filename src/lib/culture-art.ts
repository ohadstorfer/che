import type { ImageSourcePropType } from 'react-native';

// ---------------------------------------------------------------------------
// The capybara art for culture screens. Each subject has figures of its own;
// the rest borrow from a general set so no screen is ever bare. Pages of one
// class rotate through their subject's figures, so a class doesn't repeat one
// picture card after card.
// ---------------------------------------------------------------------------

const A = {
  mate: require('@/assets/images/capybara/capybara-mate-figure.png'),
  mateSip: require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.png'),
  mateBitter: require('@/assets/images/capybara/capybara-mate-amargo-figure.png'),
  asado: require('@/assets/images/capybara/capybara-asado-figure.png'),
  choripan: require('@/assets/images/capybara/capybara-choripan-figure.png'),
  empanadas: require('@/assets/images/capybara/capybara-empanadas-figure.png'),
  milanesa: require('@/assets/images/capybara/capybara-milanesa-figure.png'),
  alfajor: require('@/assets/images/capybara/capybara-alfajor-figure.png'),
  alfajorMaicena: require('@/assets/images/capybara/capybara-alfajor-maicena-figure.png'),
  dulce: require('@/assets/images/capybara/capybara-dulce-de-leche-figure.png'),
  facturas: require('@/assets/images/capybara/capybara-facturas-figure.png'),
  goal: require('@/assets/images/capybara/capybara-futbol-gol-figure.png'),
  kick: require('@/assets/images/capybara/capybara-futbol-pateando-figure.png'),
  tango: require('@/assets/images/capybara/capybara-tango-figure.png'),
  hi: require('@/assets/images/capybara/capybara-saludando-figure.png'),
  gaucho: require('@/assets/images/capybara/capybara-gaucho-figure.png'),
  gauchoCafe: require('@/assets/images/capybara/capybara-gaucho-cafe-figure.png'),
  angry: require('@/assets/images/capybara/capybara-puteadas-figure.png'),
  guitar: require('@/assets/images/capybara/capybara-musica-figure.png'),
  flag: require('@/assets/images/capybara/capybara-historia-figure.png'),
} satisfies Record<string, ImageSourcePropType>;

const bySection: Record<string, ImageSourcePropType[]> = {
  mate: [A.mateSip, A.mate, A.mateBitter],
  asado: [A.asado, A.choripan],
  comida: [A.empanadas, A.milanesa, A.choripan],
  alfajores: [A.alfajor, A.dulce, A.alfajorMaicena, A.facturas],
  futbol: [A.goal, A.kick],
  tango: [A.tango],
  puteadas: [A.angry],
  musica: [A.guitar],
  'historia-nacimiento': [A.flag],
  'historia-moderna': [A.flag],
};

const general = [A.hi, A.gaucho, A.gauchoCafe];

/** The figure for the nth page of a class in this subject. */
export function artFor(section: string, n = 0): ImageSourcePropType {
  const set = bySection[section] ?? general;
  return set[n % set.length];
}

/** A subject's own figure for its tile and hero; subjects without one take turns with the general set. */
export function tileArt(section: string, index: number): ImageSourcePropType {
  return bySection[section]?.[0] ?? general[index % general.length];
}
