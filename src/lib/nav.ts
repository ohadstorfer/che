import { router } from 'expo-router';

type Route = Parameters<typeof router.replace>[0];

/**
 * Leaving a screen that might have been opened without anything behind it — a
 * reload on its own URL (this is a PWA, she reloads), a link from a push, or a
 * route reached with `replace`. `router.back()` alone does nothing there and
 * logs "The action 'GO_BACK' was not handled by any navigator", leaving her
 * stuck on a screen whose close button looks broken.
 */
export function goBack(fallback: Route) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}

/**
 * Crossing between signed out and signed in (welcome ↔ the app): nothing from
 * the side she left should stay under the new screen, where a swipe from the
 * edge would bring it back.
 */
export function resetTo(href: Route) {
  if (router.canDismiss()) router.dismissAll();
  router.replace(href);
}

/**
 * From a finished lesson or story back to the Course screen that's already
 * open underneath (not a second copy on top of it). The empty `section`
 * clears any section she was browsing, so Course lands on her own step —
 * where the advance to the next one plays.
 */
export const backToCourse = () => router.dismissTo({ pathname: '/home', params: { section: '' } });
