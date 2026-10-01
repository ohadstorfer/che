import { prefetchPackScores } from './argentine-scores';
import { arThemes } from './argentine';
import { themeArt, themeObject } from './argentine-art';
import { cultureSections, prefetchCultureDone } from './culture';
import { tileArt } from './culture-art';
import { scenarios } from './hablar';
import { freeChatArt, scenarioArt, tomasArt } from './hablar-art';
import { loadHablarHome } from './hablar-home';
import { preloadImages } from './preload-images';
import { loadLexicon } from './session';

// ---------------------------------------------------------------------------
// The other tabs, made ready while she is on Course.
//
// Once the launch splash has gone, Words, Culture and Speaking read what they
// open on — their data, and every picture on their first screen (their
// headers' streak is already shared, see streak-week.ts) — so each one
// opens whole instead of filling in circle by circle. It runs once per launch,
// after Course is standing, so it never competes with the screen she is
// actually looking at.
// ---------------------------------------------------------------------------

let started: string | null = null;

export function prefetchTabs(userId: string, limited: boolean) {
  if (started === userId) return;
  started = userId;

  // Speaking's rows and Culture's tiles first — they are the most picture-heavy
  // first screens — then Words' themes.
  preloadImages([
    tomasArt,
    freeChatArt,
    ...scenarios.map((s) => scenarioArt(s.id)),
    ...cultureSections.map((s, i) => tileArt(s.slug, i)),
    ...arThemes.flatMap((t) => [themeObject(t.slug), themeArt(t.slug)]),
  ]);

  void loadHablarHome(userId, limited).catch(() => {});
  void prefetchCultureDone().catch(() => {});
  void prefetchPackScores().catch(() => {});
  // The lexicon is what My words is built from; content-cache keeps it after.
  void loadLexicon().catch(() => {});
}
