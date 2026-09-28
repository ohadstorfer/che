import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from './auth';
import { billing } from './billing';
import type { Catalog } from './billing-shared';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Premium — who has paid, and what the free tier allows.
//
// Premium is true if either source says so: the store on this phone
// (RevenueCat), or the server's `entitlements` row that RevenueCat's webhook
// keeps (so a subscription bought on the phone also opens the web app, and
// the edge functions can check it). Staff are never gated.
//
// The free tier (docs: monetization flow 7): the first units of the course,
// a few chats with Pancho, and the paywall again at the moments she wants more.
// ---------------------------------------------------------------------------

/** Units of the course open without paying (0-based unitIndex below this). */
export const FREE_UNITS = 2;
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
  /** The store says: no free tier at all right now. */
  hardPaywall: boolean;
  refresh: () => Promise<void>;
  /** After a purchase: open everything at once, before the store round-trips. */
  grant: () => void;
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

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { session, profile } = useAuth();
  const userId = session?.user.id ?? null;
  const staff = profile?.role === 'admin' || profile?.role === 'reviewer';
  const [status, setStatus] = useState<Status>('loading');
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const granted = useRef(false);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const [store, server] = await Promise.all([
      billing.isPremium().catch(() => false),
      serverPremium(userId).catch(() => false),
    ]);
    setStatus(store || server || granted.current ? 'premium' : 'free');
  }, [userId]);

  useEffect(() => {
    granted.current = false;
    if (!userId) {
      setStatus('loading');
      void billing.forget();
      return;
    }
    let alive = true;
    (async () => {
      await billing.identify(userId);
      if (!alive) return;
      await refresh();
      // Fetched now so the paywall opens with its prices already on it.
      const c = await billing.catalog().catch(() => null);
      if (alive) setCatalog(c);
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

  const paywall = useCallback((from: PaywallSource) => router.push(`/paywall?from=${from}`), []);

  const value = useMemo(
    () => ({
      status,
      limited: status === 'free' && !staff,
      staff,
      catalog,
      hardPaywall: !!catalog?.main?.hardPaywall,
      refresh,
      grant,
      paywall,
    }),
    [status, staff, catalog, refresh, grant, paywall],
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
