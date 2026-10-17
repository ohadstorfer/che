import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from './auth';
import { billing } from './billing';
import type { Catalog } from './billing-shared';
import { clearContentCache } from './content-cache';
import { isGuest } from './guest';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Premium — who has paid, and what the free tier allows.
//
// Premium is true if either source says so: the store on this phone, or the
// server's `entitlements` row, written once a purchase has been checked with
// its store and kept in step by the stores' notifications (so a subscription
// bought on the phone also opens the web app, and the edge functions can
// check it). Staff are never gated.
//
// The free tier (docs: monetization flow 7): the first units of the course,
// a few chats with Pancho, and the paywall again at the moments she wants more.
// ---------------------------------------------------------------------------

/** Units of the course open without paying (0-based unitIndex below this). */
export const FREE_UNITS = 3;
/** Chats with Pancho a free account gets, in total. hablar-start agrees. */
export const FREE_CHATS = 3;

export type PaywallSource = 'onboarding' | 'lesson' | 'hablar' | 'home' | 'settings' | 'gate';

type Status = 'loading' | 'free' | 'premium';

interface PremiumValue {
  status: Status;
  /** Free account, not staff: the one the limits apply to. */
  limited: boolean;
  staff: boolean;
  catalog: Catalog | null;
  /** The server says: no free tier at all right now (app_config). */
  hardPaywall: boolean;
  refresh: () => Promise<void>;
  /** After a purchase: open everything at once, before the store round-trips. */
  grant: () => void;
  /** Before the store launch: testers unlock Premium from the paywall
   *  (functions/tester-premium, switched on by a server secret). */
  testerUnlock: boolean;
  /** Premium for her as a tester, on the server too. False if it didn't take. */
  unlockAsTester: () => Promise<boolean>;
  paywall: (from: PaywallSource) => void;
}

const PremiumContext = createContext<PremiumValue>({
  status: 'loading',
  limited: false,
  staff: false,
  catalog: null,
  hardPaywall: false,
  refresh: async () => {},
  grant: () => {},
  testerUnlock: false,
  unlockAsTester: async () => false,
  paywall: () => {},
});

async function serverPremium(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('active, expires_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return !!data.active && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now());
}

/** `hard_paywall` in app_config: flipped from the dashboard, no app update. */
async function serverHardPaywall(): Promise<boolean> {
  const { data } = await supabase.from('app_config').select('value').eq('key', 'hard_paywall').maybeSingle();
  return data?.value === true;
}

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { session, profile } = useAuth();
  const userId = session?.user.id ?? null;
  const staff = profile?.role === 'admin' || profile?.role === 'reviewer';
  const [status, setStatus] = useState<Status>('loading');
  // The server hides a locked unit's sentences from a free account, and the
  // phone keeps sentence blocks by content_version's stamps, which say whether
  // a unit was locked for her. Those stamps are kept a few minutes: when she
  // pays (or lapses) they are asked again now, so her next class fetches the
  // blocks it can now read instead of the ones it couldn't.
  const settled = useRef<Status>('loading');
  useEffect(() => {
    if (status === 'loading') return;
    const was = settled.current;
    settled.current = status;
    if (was !== 'loading' && was !== status) clearContentCache();
  }, [status]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [testerUnlock, setTesterUnlock] = useState(false);
  const [hardPaywall, setHardPaywall] = useState(false);
  const granted = useRef(false);
  // The guest she was on this phone (lib/guest.ts), until she has an account:
  // if she then signs in to one she already had, what the guest bought is
  // claimed for it. Linking an account to the guest keeps the same id, so
  // nothing needs claiming then.
  const guest = useRef<string | null>(null);
  const guestNow = isGuest(session);
  useEffect(() => {
    if (!userId) return;
    if (guestNow) guest.current = userId;
    else if (guest.current === userId) guest.current = null;
  }, [userId, guestNow]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [store, server] = await Promise.all([
      billing.isPremium().catch(() => false),
      serverPremium(userId).catch(() => false),
    ]);
    setStatus(store || server || granted.current ? 'premium' : 'free');
    // The store has her subscription and the server doesn't: a renewal or a
    // purchase whose word never arrived. The lessons are locked by the server,
    // so it is told now.
    if (store && !server) void billing.sync().catch(() => false);
  }, [userId]);

  useEffect(() => {
    granted.current = false;
    if (!userId) {
      setStatus('loading');
      void billing.forget();
      return;
    }
    let alive = true;
    const from = guest.current && guest.current !== userId ? guest.current : null;
    (async () => {
      await billing.identify(userId);
      if (!alive) return;
      if (from) {
        guest.current = null;
        await billing.adopt(from).catch(() => false);
      }
      await refresh();
      // Fetched now so the paywall opens with its prices already on it.
      const [c, hard, tester] = await Promise.all([
        billing.catalog().catch(() => null),
        serverHardPaywall().catch(() => false),
        supabase.functions
          .invoke<{ enabled: boolean }>('tester-premium', { body: { check: true } })
          .then(({ data }) => !!data?.enabled)
          .catch(() => false),
      ]);
      if (!alive) return;
      setCatalog(c);
      setHardPaywall(hard);
      setTesterUnlock(tester);
    })();
    const off = billing.onChange((premium) => {
      if (premium) setStatus('premium');
      else void refresh();
    });
    return () => {
      alive = false;
      off();
    };
  }, [userId, refresh]);

  const grant = useCallback(() => {
    granted.current = true;
    setStatus('premium');
  }, []);

  const unlockAsTester = useCallback(async () => {
    const { data } = await supabase.functions
      .invoke<{ premium: boolean }>('tester-premium', { body: {} })
      .catch(() => ({ data: null }));
    if (!data?.premium) return false;
    grant();
    return true;
  }, [grant]);

  const paywall = useCallback((from: PaywallSource) => router.push(`/paywall?from=${from}`), []);

  const value = useMemo(
    () => ({
      status,
      limited: status === 'free' && !staff,
      staff,
      catalog,
      hardPaywall,
      refresh,
      grant,
      testerUnlock,
      unlockAsTester,
      paywall,
    }),
    [status, staff, catalog, hardPaywall, refresh, grant, testerUnlock, unlockAsTester, paywall],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export const usePremium = () => useContext(PremiumContext);

/** How many chats with Pancho she has started, ever. */
export async function chatsUsed(userId: string): Promise<number> {
  const { count } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  return count ?? 0;
}
