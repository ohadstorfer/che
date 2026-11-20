import { finishLostCallback } from '@/lib/social-auth';

/** Google sign-in comes back to `posta://auth-callback?code=…`. The browser
 *  session (lib/social-auth.ts) reads that URL itself, but on Android the same
 *  link also reaches the router, which has no such screen and showed
 *  "Unmatched Route" over the onboarding. So the router never goes there:
 *  - app still running: stay on the current screen; the waiting sign-in
 *    finishes the code exchange.
 *  - app was killed while Google was open (cold start): nothing is waiting
 *    for the code, so exchange it here and start from the root, which sends
 *    her on to Home or back into her onboarding. */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    if (!/^[a-z.+-]+:\/\/\/?auth-callback\b|^\/?auth-callback\b/i.test(path)) return path;
    if (initial) {
      void finishLostCallback(path);
      return '/';
    }
    return null;
  } catch {
    return '/';
  }
}
