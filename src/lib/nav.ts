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
