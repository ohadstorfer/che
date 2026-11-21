import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from './auth';
import { billing } from './billing';
import type { Catalog } from './billing-shared';
import { clearContentCache } from './content-cache';
import { claimCreatorCode } from './creator-code';
import { cancelFreeUnitReminder } from './free-unit-reminder';
import { isGuest } from './guest';
import { supabase } from './supabase';
import { scheduleTrialReminder, trialReminderScheduled } from './trial-reminder';

/** The last guest id on this phone ({ id, at }), until what it bought has moved over. */
const GUEST_KEY = 'posta.guest-id';
/** How long a guest who moved nothing over is still asked about. */
const GUEST_DAYS = 3;
const readGuest = (raw: string | null): { id: string; at: number } | null => {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { id?: unknown; at?: unknown };
    return typeof v.id === 'string' && typeof v.at === 'number' ? { id: v.id, at: v.at } : null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Premium — who has paid, and what the free tier allows.
//
// Premium is true if either source says so: the store on this phone, or the
// server's `entitlements` row, written once a purchase has been checked with
// its store and kept in step by the stores' notifications (so a subscription
// bought on the phone also opens the web app, and the edge functions can
// check it). Staff are never gated.
//
// Two ways to be free, picked on the server (`hard_paywall` in app_config):
//   · the free tier: the first FREE_UNITS units, FREE_CHATS chats with Pancho,
//     and the paywall again at the moments she wants more;
//   · the hard paywall: nothing free on day 0, and the paywall wherever she
//     goes. From the next day, one free week she takes once (`pass`): the first
//     PASS_UNITS unit and PASS_CHATS chat, for PASS_DAYS days or until she has
//     done both (migration 20261019000040, which the server enforces).
// ---------------------------------------------------------------------------

/** Units of the course open in the free tier (0-based unitIndex below this). */
export const FREE_UNITS = 3;
/** Chats with Pancho the free tier gets, in total. hablar-start agrees. */
export const FREE_CHATS = 3;
/** The free week, with the hard paywall. free_pass_units/chats/days() agree. */
export const PASS_UNITS = 1;
export const PASS_CHATS = 1;
export const PASS_DAYS = 7;

/** The free week, as free_pass_state() tells it. */
export interface Pass {
  /** off: none here (no hard paywall, premium, staff) · soon: from the next day ·
   *  offer: hers to take · active: open · over: used up. */
  state: 'off' | 'soon' | 'offer' | 'active' | 'over';
  availableAt: Date | null;
  endsAt: Date | null;
}

export type PaywallSource = 'onboarding' | 'lesson' | 'hablar' | 'home' | 'settings' | 'gate' | 'email' | 'winback';

type Status = 'loading' | 'free' | 'premium';

interface PremiumValue {
  status: Status;
  /** Free account, not staff: the one the limits apply to. */
  limited: boolean;
  staff: boolean;
  catalog: Catalog | null;
  /** The server says: no free tier at all right now (app_config). */
  hardPaywall: boolean;
  /** hardPaywall has been read from the server for this account. */
  configReady: boolean;
  /** The free week (hard paywall only); null until known. */
  pass: Pass | null;
  /** Units and chats open to her free: the free tier's, the free week's, or none. */
  freeUnits: number;
  freeChats: number;
  /** Takes the free week (a saved account only). The state it is in after. */
  claimPass: () => Promise<Pass | null>;
  refreshPass: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Asks the store for the plans again (the paywall's Try again). True if they came. */
  reloadCatalog: () => Promise<boolean>;
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
  configReady: false,
  pass: null,
  freeUnits: FREE_UNITS,
  freeChats: FREE_CHATS,
  claimPass: async () => null,
  refreshPass: async () => {},
  refresh: async () => {},
  reloadCatalog: async () => false,
  grant: () => {},
  testerUnlock: false,
  unlockAsTester: async () => false,
  paywall: () => {},
});

/** Rejects when the server couldn't be asked: that is not "free". */
async function serverPremium(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('entitlements')
    .select('active, expires_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return false;
  return !!data.active && (!data.expires_at || new Date(data.expires_at).getTime() > Date.now());
}

function toPass(data: unknown): Pass | null {
  const d = data as { state?: Pass['state']; available_at?: string | null; ends_at?: string | null } | null;
  if (!d?.state) return null;
  return {
    state: d.state,
    availableAt: d.available_at ? new Date(d.available_at) : null,
    endsAt: d.ends_at ? new Date(d.ends_at) : null,
  };
}

/** Her free week, or null when the server couldn't say. */
async function serverPass(): Promise<Pass | null> {
  const { data, error } = await supabase.rpc('free_pass_state');
  return error ? null : toPass(data);
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
  const [configReady, setConfigReady] = useState(false);
  const [pass, setPass] = useState<Pass | null>(null);
  const granted = useRef(false);
  // The guest she was on this phone (lib/guest.ts), until she has an account:
  // if she then signs in to one she already had, what the guest bought is
  // claimed for it. Linking an account to the guest keeps the same id, so
  // nothing needs claiming then.
  // Also kept on the phone (GUEST_KEY): Android can bring the app back from
  // the Google sign-in browser as a fresh start, and a ref alone forgot the
  // guest, so a trial bought in onboarding stayed behind on her old id and the
  // new account met the paywall (2026-11-20).
  const guest = useRef<string | null>(null);
  const guestNow = isGuest(session);
  const guestNowRef = useRef(guestNow);
  guestNowRef.current = guestNow;
  useEffect(() => {
    if (!userId) return;
    if (guestNow) {
      guest.current = userId;
      void AsyncStorage.setItem(GUEST_KEY, JSON.stringify({ id: userId, at: Date.now() })).catch(() => {});
    } else if (guest.current === userId) guest.current = null;
  }, [userId, guestNow]);

  // A creator's code typed in onboarding, noted for whichever account she is
  // now (the guest, or the one she signed in to). Once per account per phone.
  useEffect(() => {
    if (userId) void claimCreatorCode(userId);
  }, [userId]);

  /** The last check couldn't reach the store or the server. */
  const unsure = useRef(false);
  const refresh = useCallback(async () => {
    if (!userId) return;
    const [store, server] = await Promise.all([
      billing.isPremium().catch(() => null),
      serverPremium(userId).catch(() => null),
    ]);
    const premium = !!store || !!server || granted.current;
    // One of them couldn't be asked and neither said yes: she stays as she
    // was — a subscriber who opens the app offline is not made free — and is
    // asked again when the app comes back to the front.
    unsure.current = !premium && (store === null || server === null);
    if (premium) setStatus('premium');
    else if (!unsure.current) setStatus('free');
    // The store has her subscription and the server doesn't: a renewal or a
    // purchase whose word never arrived. The lessons are locked by the server,
    // so it is told now.
    if (store && !server) void billing.sync().catch(() => false);
  }, [userId]);

  useEffect(() => {
    granted.current = false;
    setConfigReady(false);
    setPass(null);
    if (!userId) {
      setStatus('loading');
      void billing.forget();
      return;
    }
    let alive = true;
    const remembered = guest.current;
    (async () => {
      const stored = remembered ? null : readGuest(await AsyncStorage.getItem(GUEST_KEY).catch(() => null));
      const kept = remembered ?? stored?.id ?? null;
      const keptOld = !!stored && Date.now() - stored.at > GUEST_DAYS * 86400000;
      // Her guest became this account (linked, same id): nothing to move, and
      // forgotten, so a later sign-in to another account never takes this
      // one's subscription with it.
      if (!guestNowRef.current && kept === userId) void AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      const from = !guestNowRef.current && kept && kept !== userId ? kept : null;
      await billing.identify(userId);
      if (!alive) return;
      if (from) {
        guest.current = null;
        // Only what this phone's store says the guest bought moves over. Once
        // it has, the guest is forgotten; nothing moved (she bought nothing,
        // or no connection this time), it is asked again on later launches,
        // but only for GUEST_DAYS, not a store query on every launch for good
        // (review, 2026-11-20). Restore still moves it after that.
        const moved = await billing.adopt(from).catch(() => false);
        if (moved || keptOld) void AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      }
      await refresh();
      // Fetched now so the paywall opens with its prices already on it.
      const [c, hard, tester, p] = await Promise.all([
        billing.catalog().catch(() => null),
        serverHardPaywall().catch(() => false),
        supabase.functions
          .invoke<{ enabled: boolean }>('tester-premium', { body: { check: true } })
          .then(({ data }) => !!data?.enabled)
          .catch(() => false),
        serverPass(),
      ]);
      if (!alive) return;
      setCatalog(c);
      setHardPaywall(hard);
      setPass(p);
      setConfigReady(true);
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

  // What a purchase sets up, also when it didn't end on the paywall: the app
  // killed under the store's sheet, a purchase whose word came from the
  // store's notification, a restore, or a guest's purchase moved over. Then
  // the "try it free" nudge would still come tomorrow to someone paying, and
  // the trial-end reminder the paywall promises would never be set.
  useEffect(() => {
    if (status !== 'premium' || !userId) return;
    void cancelFreeUnitReminder();
    void (async () => {
      if (await trialReminderScheduled()) return;
      const { data } = await supabase
        .from('entitlements')
        .select('period_type, expires_at')
        .eq('user_id', userId)
        .maybeSingle();
      const ends = data?.period_type === 'TRIAL' && data.expires_at ? new Date(data.expires_at) : null;
      if (ends && ends.getTime() > Date.now()) await scheduleTrialReminder(ends, { ask: false });
    })().catch(() => {});
  }, [status, userId]);

  const reloadCatalog = useCallback(async () => {
    const c = await billing.catalog().catch(() => null);
    if (c) setCatalog(c);
    return !!c?.main;
  }, []);

  const refreshPass = useCallback(async () => {
    if (!userId) return;
    const p = await serverPass();
    if (p) setPass(p);
  }, [userId]);

  // The free week ends on a clock, or once she has done it all: asked again
  // whenever the app comes back to the front.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      if (unsure.current) void refresh();
      if (hardPaywall) void refreshPass();
    });
    return () => sub.remove();
  }, [refresh, refreshPass, hardPaywall]);

  // Premium or not changes what the free week is: asked again when it does.
  useEffect(() => {
    if (status !== 'loading' && hardPaywall) void refreshPass();
  }, [status, hardPaywall, refreshPass]);

  const claimPass = useCallback(async () => {
    const { data, error } = await supabase.rpc('claim_free_pass');
    const p = error ? null : toPass(data);
    if (p) {
      setPass(p);
      // Her unit's sentences were locked for her a moment ago.
      clearContentCache();
    }
    return p;
  }, []);

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

  const passOpen = pass?.state === 'active';
  const freeUnits = hardPaywall ? (passOpen ? PASS_UNITS : 0) : FREE_UNITS;
  const freeChats = hardPaywall ? (passOpen ? PASS_CHATS : 0) : FREE_CHATS;

  const value = useMemo(
    () => ({
      status,
      limited: status === 'free' && !staff,
      staff,
      catalog,
      hardPaywall,
      configReady,
      pass,
      freeUnits,
      freeChats,
      claimPass,
      refreshPass,
      refresh,
      reloadCatalog,
      grant,
      testerUnlock,
      unlockAsTester,
      paywall,
    }),
    [status, staff, catalog, hardPaywall, configReady, pass, freeUnits, freeChats, claimPass, refreshPass, refresh, reloadCatalog, grant, testerUnlock, unlockAsTester, paywall],
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export const usePremium = () => useContext(PremiumContext);

/** How many chats with Pancho she has started, ever: a lesson's own chat
 *  doesn't count, as in hablar-start. */
export async function chatsUsed(userId: string): Promise<number> {
  const { count } = await supabase
    .from('conversations')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .neq('kind', 'unit');
  return count ?? 0;
}
