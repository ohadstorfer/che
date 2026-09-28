import type { ImageSourcePropType } from 'react-native';

import type { Band, ConversationRow, Scenario } from '@/lib/hablar';
import { BANDS, nearestBand, scenarios } from '@/lib/hablar';

// ---------------------------------------------------------------------------
// Pictures and picks for the Hablar tab: a capybara for Pancho, one per
// scenario (the same figures Culture and Words use), and which scenario
// Pancho suggests next.
// ---------------------------------------------------------------------------

export const tomasArt: ImageSourcePropType = require('@/assets/images/capybara/capybara-saludando-figure.webp');
export const freeChatArt: ImageSourcePropType = require('@/assets/images/capybara/capybara-mate-figure.webp');

const byScenario: Record<string, ImageSourcePropType> = {
  cafe: require('@/assets/images/capybara/capybara-gaucho-cafe-figure.webp'),
  kiosco: require('@/assets/images/capybara/capybara-alfajor-figure.webp'),
  conocer: tomasArt,
  verduleria: require('@/assets/images/capybara/capybara-empanadas-figure.webp'),
  perdido: require('@/assets/images/capybara/capybara-historia-figure.webp'),
  colectivo: require('@/assets/images/capybara/capybara-futbol-pateando-figure.webp'),
  finde: require('@/assets/images/capybara/capybara-musica-figure.webp'),
  parrilla: require('@/assets/images/capybara/capybara-asado-figure.webp'),
  // Neighbor and Local scenes borrow the closest figure until they get their own.
  depto: require('@/assets/images/capybara/capybara-mate-amargo-figure.webp'),
  devolucion: require('@/assets/images/capybara/capybara-alfajor-maicena-figure.webp'),
  peluqueria: require('@/assets/images/capybara/capybara-tango-figure.webp'),
  cena: require('@/assets/images/capybara/capybara-milanesa-figure.webp'),
  entrevista: require('@/assets/images/capybara/capybara-gaucho-figure.webp'),
  reclamo: require('@/assets/images/capybara/capybara-puteadas-figure.webp'),
  alquiler: require('@/assets/images/capybara/capybara-dulce-de-leche-figure.webp'),
  sobremesa: require('@/assets/images/capybara/capybara-choripan-figure.webp'),
};

export const scenarioArt = (id: string): ImageSourcePropType => byScenario[id] ?? tomasArt;

/** How far a scenario sits from a level: 0 when it's written at that level. */
export const levelDistance = (s: Scenario, band: Band) =>
  Math.abs(BANDS.indexOf(nearestBand(s, band)) - BANDS.indexOf(band));

/**
 * The scenario Pancho suggests at `band`: one she has never played, those
 * written at her level first; once she has played them all, the one she
 * played longest ago (at her level first on a tie). Every scenario comes
 * round. `past` is newest first, so when today's chat is in it this is
 * tomorrow's pick.
 */
export function pickScenario(past: ConversationRow[], band: Band): Scenario | null {
  const lastSeen = new Map<string, number>();
  past.forEach((c, i) => {
    if (c.kind === 'scenario' && c.topic_id && !lastSeen.has(c.topic_id)) lastSeen.set(c.topic_id, i);
  });
  const fit = (s: Scenario) => levelDistance(s, band);
  const fresh = scenarios.filter((s) => !lastSeen.has(s.id));
  if (fresh.length) return [...fresh].sort((a, b) => fit(a) - fit(b))[0];
  return [...scenarios].sort((a, b) => lastSeen.get(b.id)! - lastSeen.get(a.id)! || fit(a) - fit(b))[0] ?? null;
}
