import type { ImageSourcePropType } from 'react-native';

// ---------------------------------------------------------------------------
// The capybara for each Argentine theme — the same figures the Culture tab
// uses, so the two halves of the app read as one family.
// ---------------------------------------------------------------------------

const hi = require('@/assets/images/capybara/capybara-saludando-figure.webp');

const byTheme: Record<string, ImageSourcePropType> = {
  charla: hi,
  gente: require('@/assets/images/capybara/capybara-mate-figure.webp'),
  plata: require('@/assets/images/capybara/capybara-gaucho-cafe-figure.webp'),
  comida: require('@/assets/images/capybara/capybara-choripan-figure.webp'),
  ciudad: require('@/assets/images/capybara/capybara-empanadas-figure.webp'),
  casa: require('@/assets/images/capybara/capybara-mate-sorbiendo-figure.webp'),
  cuerpo: require('@/assets/images/capybara/capybara-facturas-figure.webp'),
  animo: require('@/assets/images/capybara/capybara-mate-amargo-figure.webp'),
  verbos: require('@/assets/images/capybara/capybara-futbol-pateando-figure.webp'),
  noche: require('@/assets/images/capybara/capybara-musica-figure.webp'),
  futbol: require('@/assets/images/capybara/capybara-futbol-gol-figure.webp'),
  politica: require('@/assets/images/capybara/capybara-historia-figure.webp'),
  campo: require('@/assets/images/capybara/capybara-gaucho-figure.webp'),
  lunfardo: require('@/assets/images/capybara/capybara-tango-figure.webp'),
  vesre: require('@/assets/images/capybara/capybara-dulce-de-leche-figure.webp'),
  expresiones: require('@/assets/images/capybara/capybara-alfajor-figure.webp'),
  puteadas: require('@/assets/images/capybara/capybara-puteadas-figure.webp'),
};

export const themeArt = (theme: string): ImageSourcePropType => byTheme[theme] ?? hi;

// ---------------------------------------------------------------------------
// The object for each theme — the thing itself, drawn like the Culture tab's
// objects, so a grid of themes reads as a shelf of things rather than a row of
// the same capybara. He keeps the rounds, where he's the one asking.
// ---------------------------------------------------------------------------

const objectByTheme: Record<string, ImageSourcePropType> = {
  charla: require('@/assets/images/themes/charla.webp'),
  gente: require('@/assets/images/themes/gente.webp'),
  plata: require('@/assets/images/themes/plata.webp'),
  comida: require('@/assets/images/themes/comida.webp'),
  ciudad: require('@/assets/images/themes/ciudad.webp'),
  casa: require('@/assets/images/themes/casa.webp'),
  cuerpo: require('@/assets/images/themes/cuerpo.webp'),
  animo: require('@/assets/images/themes/animo.webp'),
  verbos: require('@/assets/images/themes/verbos.webp'),
  noche: require('@/assets/images/themes/noche.webp'),
  futbol: require('@/assets/images/themes/futbol.webp'),
  politica: require('@/assets/images/themes/politica.webp'),
  campo: require('@/assets/images/themes/campo.webp'),
  lunfardo: require('@/assets/images/themes/lunfardo.webp'),
  vesre: require('@/assets/images/themes/vesre.webp'),
  expresiones: require('@/assets/images/themes/expresiones.webp'),
  puteadas: require('@/assets/images/themes/puteadas.webp'),
};

export const themeObject = (theme: string): ImageSourcePropType => objectByTheme[theme] ?? themeArt(theme);
