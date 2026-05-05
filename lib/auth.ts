import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./supabase";

export type AuthUser = {
  id: string;
  email: string | null;
};

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null,
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!supabaseConfigured()) return null;
  const { data } = await supabase.auth.getUser();
  return toAuthUser(data.user);
}

export type PasswordAuthResult = {
  ok: boolean;
  user?: AuthUser;
  error?: string;
};

function validateCredentials(
  email: string,
  password: string,
): { ok: true; email: string } | { ok: false; error: string } {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: "Email inválido" };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }
  return { ok: true, email: trimmed };
}

export async function signInWithEmailPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  if (!supabaseConfigured()) {
    return { ok: false, error: "supabase-not-configured" };
  }
  const v = validateCredentials(email, password);
  if (!v.ok) return { ok: false, error: v.error };

  const { data, error } = await supabase.auth.signInWithPassword({
    email: v.email,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: toAuthUser(data.user) ?? undefined };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
): Promise<PasswordAuthResult> {
  if (!supabaseConfigured()) {
    return { ok: false, error: "supabase-not-configured" };
  }
  const v = validateCredentials(email, password);
  if (!v.ok) return { ok: false, error: v.error };

  const { data, error } = await supabase.auth.signUp({
    email: v.email,
    password,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, user: toAuthUser(data.user) ?? undefined };
}

export async function signOut(): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type AuthChangeListener = (user: AuthUser | null, session: Session | null) => void;

export function subscribeToAuthChanges(listener: AuthChangeListener): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(toAuthUser(session?.user), session ?? null);
  });
  return () => data.subscription.unsubscribe();
}
