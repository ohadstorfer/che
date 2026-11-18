import type { ImageSourcePropType } from 'react-native';

import { unitArtMap } from '@/lib/unit-art-map';

/** The waving carpincho, for a unit that has no picture of its own yet. */
const FALLBACK = require('@/assets/images/capybara/capybara-saludando-figure.webp');

/**
 * The picture a unit is known by — on its banner on the road and on the
 * "3 of 8 classes" screen. Chosen per unit for what the unit is about (the
 * kiosco, a café, Pancho tired); the map is built by
 * scripts/unit-art/build-map.mjs from scripts/unit-art/picks.json.
 */
export function unitArt(slug: string): ImageSourcePropType {
  return unitArtMap[slug] ?? FALLBACK;
}
