import type { Session } from '@supabase/supabase-js';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
async function fetchProfile(session: Session): Promise<Profile | null> {
  const userId = session.user.id;
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (data) return toProfile(data as ProfileRow);
  const displayName = session.user.email?.split('@')[0] ?? '';
  const { data: created } = await supabase
    .from('profiles')
    .insert({ user_id: userId, display_name: displayName })
    .select()
    .single();
  return created ? toProfile(created as ProfileRow) : null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userId: string | null = null;
    const loadProfile = (s: Session) =>
      fetchProfile(s).then((p) => setProfile((prev) => (sameProfile(prev, p) ? prev : p)));

    // The session is known as soon as it is read from storage; the app opens
    // then, and her profile follows in the background. The profile is only
    // fetched again when the user changes or edits her account — not on every
    // hourly token refresh, which used to hand Home a new profile and make it
    // reload everything.
    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setLoading(false);
      if (!newSession) {
        userId = null;
        setProfile(null);
        return;
      }
      if (newSession.user.id !== userId || event === 'USER_UPDATED') {
        userId = newSession.user.id;
        // Deferred: supabase-js must not be awaited inside its own callback.
        setTimeout(() => loadProfile(newSession), 0);
      }
    });
    // Never leave the splash up if the session read stalls.
    const fallback = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 4000);
    return () => {
      clearTimeout(fallback);
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
        const p = await fetchProfile(session);
        setProfile((prev) => (sameProfile(prev, p) ? prev : p));
      },
    }),
    [session, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
