import { type ImageSourcePropType, Platform } from 'react-native';

/** Images kept decoded for the rest of the run, so a tab's <img> paints from memory. */
const held: HTMLImageElement[] = [];
const seen = new Set<string>();

/** Decodes pictures ahead of their screens. Web only: the phones read them
 *  straight off the app bundle. */
export function preloadImages(sources: ImageSourcePropType[]) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  for (const source of sources) {
    // On the web a bundled image is `{ uri, width, height }`.
    const uri = source && typeof source === 'object' && 'uri' in source ? source.uri : null;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    const img = new window.Image();
    img.decoding = 'async';
    img.src = uri;
    img.decode?.().catch(() => {});
    held.push(img);
  }
}
