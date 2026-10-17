import type { AuthError } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// One-tap sign-in: Apple (native sheet, iOS only) and Google (Supabase OAuth
// in an auth browser session). Both need their provider switched on in the
// Supabase dashboard, and `posta://auth-callback` in its redirect allow-list.
//
// Every call resolves to what happened rather than throwing: 'ok' with a
// session in place, 'cancel' when she backed out (say nothing), or an error
// message worth showing.
//
// The save* calls are for a guest (lib/guest.ts): they add Apple or Google
// to the account she already has, so her user id — and with it
// everything she bought as a guest — stays hers. When that Apple ID or Google
// account already has a Posta account, she is signed in to that one instead
// ('switched'), and premium.tsx claims the guest's purchase for it.
// ---------------------------------------------------------------------------

export type SocialResult = { status: 'ok' } | { status: 'cancel' } | { status: 'error'; message: string };

export type SaveResult =
  | { status: 'saved' }
  /** Signed in to an account she already had. `returning`: it had been
   *  through onboarding, so it has a course of its own to go back to. */
  | { status: 'switched'; returning: boolean }
  | { status: 'cancel' }
  | { status: 'error'; message: string };

/** The sheet exists on this device: iOS 13+, not the web or Android. */
export async function appleAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync().catch(() => false);
}

/** Apple's sheet: an identity token, the raw nonce it was minted for, and her
 *  name (Apple shares it only on the very first sign-in). Throws when she
 *  cancels (ERR_REQUEST_CANCELED). */
async function askApple(): Promise<{ token: string; nonce: string; name: string }> {
  // Apple gets the hash, Supabase the raw nonce: that pairing is what proves
  // the token was minted for this sign-in and not replayed from another.
  const raw = Crypto.randomUUID();
  const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
  const cred = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    nonce: hashed,
  });
  if (!cred.identityToken) throw new Error('Apple did not return a sign-in token. Try again.');
  const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
  return { token: cred.identityToken, nonce: raw, name };
}

const cancelled = (e: unknown) => (e as { code?: string }).code === 'ERR_REQUEST_CANCELED';

export async function signInWithApple(): Promise<SocialResult> {
  try {
    const { token, nonce, name } = await askApple();
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce });
    if (error) return { status: 'error', message: error.message };
    if (name) void supabase.auth.updateUser({ data: { full_name: name } });
    return { status: 'ok' };
  } catch (e) {
    if (cancelled(e)) return { status: 'cancel' };
    return { status: 'error', message: (e as Error).message ?? 'Apple sign-in failed.' };
  }
}

export async function signInWithGoogle(): Promise<SocialResult> {
  if (Platform.OS === 'web') {
    // The page itself goes to Google and comes back signed in.
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    return error ? { status: 'error', message: error.message } : { status: 'ok' };
  }
  const redirectTo = Linking.createURL('auth-callback');
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
  if (error || !data.url) return { status: 'error', message: error?.message ?? 'Google sign-in is not available.' };
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success') return { status: 'cancel' };
  return finishFromUrl(res.url);
}

/** The callback carries either a PKCE code or the tokens themselves, in the
 *  query or the fragment, depending on how the project's auth flow is set. */
async function finishFromUrl(url: string, { linking = false } = {}): Promise<SocialResult> {
  const params = new URLSearchParams(url.split(/[?#]/).slice(1).join('&'));
  const failed = params.get('error_description') ?? params.get('error');
  if (failed) return { status: 'error', message: failed.replace(/\+/g, ' ') };
  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? { status: 'error', message: error.message } : { status: 'ok' };
  }
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    return error ? { status: 'error', message: error.message } : { status: 'ok' };
  }
  // A link that came back clean but bare: the identity is on the user, the
  // session just doesn't know yet.
  if (linking) {
    const { error } = await supabase.auth.refreshSession();
    return error ? { status: 'error', message: error.message } : { status: 'ok' };
  }
  return { status: 'error', message: 'Google sign-in did not finish. Try again.' };
}

/** Linking was refused because that identity already has an account, or
 *  because the project doesn't allow linking: sign in to it instead. */
function signInInstead(error: Pick<AuthError, 'message'> & { code?: string }): boolean {
  return (
    error.code === 'identity_already_exists' ||
    error.code === 'manual_linking_disabled' ||
    /already (been )?linked|already exists|manual linking/i.test(error.message)
  );
}

/** After signing in to an account she already had. */
async function switched(): Promise<SaveResult> {
  const { data } = await supabase.auth.getUser();
  return { status: 'switched', returning: !!data.user?.user_metadata?.onboarding };
}

export async function saveWithApple(): Promise<SaveResult> {
  try {
    const { token, nonce, name } = await askApple();
    const linked = await supabase.auth.linkIdentity({ provider: 'apple', token, nonce });
    let result: SaveResult = { status: 'saved' };
    if (linked.error) {
      if (!signInInstead(linked.error)) return { status: 'error', message: linked.error.message };
      const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token, nonce });
      if (error) return { status: 'error', message: error.message };
      result = await switched();
    }
    if (name) void supabase.auth.updateUser({ data: { full_name: name } });
    return result;
  } catch (e) {
    if (cancelled(e)) return { status: 'cancel' };
    return { status: 'error', message: (e as Error).message ?? 'Apple sign-in failed.' };
  }
}

export async function saveWithGoogle(): Promise<SaveResult> {
  const instead = async (): Promise<SaveResult> => {
    const res = await signInWithGoogle();
    if (res.status === 'ok') return switched();
    return res.status === 'cancel' ? res : { status: 'error', message: res.message };
  };

  if (Platform.OS === 'web') {
    // The page goes to Google and comes back with Google on her account.
    const { error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) return signInInstead(error) ? instead() : { status: 'error', message: error.message };
    return { status: 'saved' };
  }
  const redirectTo = Linking.createURL('auth-callback');
  const { data, error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo, skipBrowserRedirect: true } });
  if (error) return signInInstead(error) ? instead() : { status: 'error', message: error.message };
  if (!data.url) return { status: 'error', message: 'Google sign-in is not available.' };
  const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (res.type !== 'success') return { status: 'cancel' };
  const done = await finishFromUrl(res.url, { linking: true });
  if (done.status === 'ok') return { status: 'saved' };
  if (done.status === 'error' && signInInstead(done)) return instead();
  return done.status === 'cancel' ? done : { status: 'error', message: done.message };
}
