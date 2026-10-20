import type { Session } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { resumeOutbox, wakeOutbox } from './outbox';
import { secureSessionStorage } from './secure-session';
import { supabase } from './supabase';
import type { Profile, Role } from './types';

interface AuthValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthValue>({
  session: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

interface ProfileRow {
  user_id: string;
  display_name: string | null;
  role: Role | null;
  timezone: string | null;
}

// The native splash stays up until we know whether she is signed in, so a
// cold start goes splash → her screen, not splash → blank spinner → redirect.
SplashScreen.preventAutoHideAsync().catch(() => {});

const sameProfile = (a: Profile | null, b: Profile | null) =>
  a === b ||
  (!!a && !!b && a.id === b.id && a.role === b.role && a.display_name === b.display_name && a.timezone === b.timezone);

const toProfile = (row: ProfileRow): Profile => ({
  id: row.user_id,
  role: row.role ?? 'student',
  display_name: row.display_name ?? '',
  timezone: row.timezone ?? 'America/Argentina/Buenos_Aires',
});

// Che's profiles are keyed by `user_id`, and an account can exist before its
// profile does (the old app only wrote one when a name was saved). A missing
// row is created here rather than leaving the app without a profile — the
// database makes every new row a student, whatever the client sends.
//
// Rejects when the profile couldn't be read: no connection is not "no row",
// and must not leave her without a profile for the rest of the run.
async function fetchProfile(session: Session): Promise<Profile> {
  const userId = session.user.id;
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (data) return toProfile(data as ProfileRow);
  const displayName = session.user.email?.split('@')[0] ?? '';
  const { data: created, error: createError } = await supabase
    .from('profiles')
    .insert({ user_id: userId, display_name: displayName })
    .select()
    .single();
  if (createError || !created) throw createError ?? new Error('profile not created');
  return toProfile(created as ProfileRow);
}

/** The waits before a profile that couldn't be read is asked for again. */
const PROFILE_WAITS = [2000, 5000, 10_000, 30_000];

/**
 * The session the phone still holds, when supabase-js reports none. An
 * expired session it couldn't refresh for want of a network comes back as
 * "signed out" — but it is kept on the phone, and refreshed by supabase-js
 * itself once the network is back. One it refused for good is gone from the
 * phone by the time this reads, so that still signs her out.
 */
async function keptSession(): Promise<Session | null> {
  try {
    const key = (supabase.auth as unknown as { storageKey?: string }).storageKey;
    if (!key) return null;
    const text =
      Platform.OS === 'web'
        ? typeof localStorage === 'undefined'
          ? null
          : localStorage.getItem(key)
        : await secureSessionStorage.getItem(key);
    const kept = text ? (JSON.parse(text) as Partial<Session>) : null;
    return kept?.refresh_token && kept.user?.id ? (kept as Session) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId: string | null = null;
    /** Her profile has been read for `userId`. */
    let haveProfile = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let tries = 0;
    let latest: Session | null = null;

    // A read that fails is tried again — sooner when the app comes back to the
    // front or her session is refreshed (the network is back) — until it
    // lands or she is someone else.
    const loadProfile = (s: Session) => {
      clearTimeout(retry);
      const mine = s.user.id;
      fetchProfile(s).then(
        (p) => {
          if (userId !== mine) return;
          haveProfile = true;
          tries = 0;
          setProfile((prev) => (sameProfile(prev, p) ? prev : p));
        },
        () => {
          if (userId !== mine) return;
          const wait = PROFILE_WAITS[Math.min(tries++, PROFILE_WAITS.length - 1)];
          retry = setTimeout(() => latest && userId === mine && loadProfile(latest), wait);
        },
      );
    };

    const adopt = (event: string, newSession: Session | null) => {
      latest = newSession;
      setSession(newSession);
      setLoading(false);
      if (!newSession) {
        userId = null;
        haveProfile = false;
        clearTimeout(retry);
        setProfile(null);
        return;
      }
      // Her writes from a closed app go up now that someone can send them.
      resumeOutbox();
      if (newSession.user.id !== userId || event === 'USER_UPDATED') {
        userId = newSession.user.id;
        haveProfile = false;
        tries = 0;
        // Deferred: supabase-js must not be awaited inside its own callback.
        setTimeout(() => loadProfile(newSession), 0);
      } else if (!haveProfile && event === 'TOKEN_REFRESHED') {
        // A refresh got through, so the network is back: no need to wait.
        setTimeout(() => latest && loadProfile(latest), 0);
      }
    };

    // The session is known as soon as it is read from storage; the app opens
    // then, and her profile follows in the background. The profile is only
    // fetched again when the user changes or edits her account — not on every
    // hourly token refresh, which used to hand Home a new profile and make it
    // reload everything.
    let events = 0;
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      const seq = ++events;
      if (event === 'INITIAL_SESSION' && !newSession) {
        // Perhaps signed out — or opened offline with a session that expired
        // while she was away. She stays signed in on the one she has.
        void keptSession().then((kept) => {
          if (seq === events) adopt(event, kept);
        });
        return;
      }
      adopt(event, newSession);
    });

    const front = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      wakeOutbox();
      if (latest && userId && !haveProfile) loadProfile(latest);
    });
    // Never leave the splash up if the session read stalls.
    const fallback = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 4000);
    return () => {
      clearTimeout(fallback);
      clearTimeout(retry);
      front.remove();
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync().catch(() => {});
  }, [loading]);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      loading,
      refreshProfile: async () => {
        if (!session) return;
        const p = await fetchProfile(session).catch(() => null);
        if (p) setProfile((prev) => (sameProfile(prev, p) ? prev : p));
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
