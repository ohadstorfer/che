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
