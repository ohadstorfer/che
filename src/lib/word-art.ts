import { Image } from 'expo-image';
import { Image as RNImage, type ImageSourcePropType } from 'react-native';

import { courseWordArt, packWordArt } from '@/lib/word-art-map';

// ---------------------------------------------------------------------------
// The picture a word shows when it is taught. expo-image decodes a picture the
// first time a view asks for it, so a card could arrive a frame before its
// picture. A round knows from the start which words it will teach, so it puts
// their pictures in expo-image's memory cache as it opens (`preloadWordArt`),
// and the cards, which ask with the same cache policy, find them there.
//
// Why not hand the cards the decoded ImageRef from Image.loadAsync: on iOS a
// ref is drawn the moment the `source` prop lands, before `contentFit` has
// been read, so it showed with the default 'cover' — cropped (found
// 2026-10-25 with "chomba").
// ---------------------------------------------------------------------------

/** The cache policy every word picture is shown and preloaded with. */
export const WORD_ART_CACHE = 'memory-disk' as const;

/** Starts loading these pictures into the memory cache; returns at once. */
export function preloadWordArt(sources: (ImageSourcePropType | undefined)[]) {
  // expo-image resolves a bundled picture with this same function, so the
  // address warmed here is the one a card asks for.
  const uris = [...new Set(sources)]
    .map((source) => (source == null ? undefined : RNImage.resolveAssetSource(source)?.uri))
    .filter((uri): uri is string => !!uri);
  if (!uris.length) return;
  Image.prefetch(uris, WORD_ART_CACHE).catch(() => {
    // A card that finds nothing in the cache loads its picture itself.
  });
}

/** The picture of a course word, by lemma. */
export const courseArt = (lemmaId: string): ImageSourcePropType | undefined => courseWordArt[lemmaId];
/** The picture of an Argentine pack word, by its Spanish. */
export const packArt = (es: string): ImageSourcePropType | undefined => packWordArt[es];

export const preloadCourseArt = (lemmaIds: string[]) => preloadWordArt(lemmaIds.map(courseArt));
export const preloadPackArt = (words: string[]) => preloadWordArt(words.map(packArt));

// ---------------------------------------------------------------------------
// Which pictures this class has already shown. A sentence card puts one of its
// words' pictures where the capybara stands (exercises.tsx, `TitleArt`); when
// it has several, the one she hasn't seen yet this class wins ("plaza" over
// "estudiar" once "estudiar" was shown). A round clears it as it starts.
// ---------------------------------------------------------------------------
const shownThisClass = new Set<string>();

export const resetShownArt = () => shownThisClass.clear();
export const markArtShown = (lemmaId: string) => {
  shownThisClass.add(lemmaId);
};

/** The word whose picture a card shows: one not seen this class if any, else
 *  the first; undefined when no word has a picture. */
export function pickCardArt(lemmaIds: string[]): string | undefined {
  const pictured = [...new Set(lemmaIds)].filter((id) => courseArt(id));
  return pictured.find((id) => !shownThisClass.has(id)) ?? pictured[0];
}
