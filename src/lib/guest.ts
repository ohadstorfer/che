import type { Session } from '@supabase/supabase-js';

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Guests — an account before she has made one. Onboarding opens the paywall
// before it asks her to sign in (paywall first, account after), and a store
// purchase needs a user id to belong to: the stores carry it on the purchase
// (billing.native.ts) and verify-purchase writes `entitlements` for it. So at
// the end of the questions she gets an anonymous Supabase user — a real
// auth.users row, with every table working as for anyone else.
//
// Signing in afterwards (the Ready screen, or Account later) adds Apple,
// Google or an email to that same user (social-auth.ts, save*), so nothing
// she did or bought as a guest moves. A guest who never signs in keeps the
// account on this phone only; Restore on the paywall still finds a
// subscription in the store.
//
// Needs "Allow anonymous sign-ins" (and "Allow manual linking", for Apple and
// Google) in the Supabase dashboard. While anonymous sign-ins are off,
// startGuest fails and onboarding falls back to asking for the account
// before the paywall.
// ---------------------------------------------------------------------------

export const isGuest = (session: Session | null | undefined) => !!session?.user.is_anonymous;

let starting: Promise<boolean> | null = null;

/** A session for her: the one she has, or a new guest. False when none could be made. */
export function startGuest(): Promise<boolean> {
  starting ??= (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session) return true;
      const { data: made, error } = await supabase.auth.signInAnonymously();
      return !error && !!made.session;
    } catch {
      return false;
    }
  })().finally(() => {
    starting = null;
  });
  return starting;
}
