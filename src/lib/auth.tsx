import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

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
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session) setProfile(await fetchProfile(data.session));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) setProfile(await fetchProfile(newSession));
      else setProfile(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        refreshProfile: async () => {
          if (session) setProfile(await fetchProfile(session));
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
