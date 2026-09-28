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
// ---------------------------------------------------------------------------

export type SocialResult = { status: 'ok' } | { status: 'cancel' } | { status: 'error'; message: string };

/** The sheet exists on this device: iOS 13+, not the web or Android. */
export async function appleAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync().catch(() => false);
}

export async function signInWithApple(): Promise<SocialResult> {
  try {
    // Apple gets the hash, Supabase the raw nonce: that pairing is what proves
    // the token was minted for this sign-in and not replayed from another.
    const raw = Crypto.randomUUID();
    const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, raw);
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce: hashed,
    });
    if (!cred.identityToken) return { status: 'error', message: 'Apple did not return a sign-in token. Try again.' };
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: cred.identityToken, nonce: raw });
    if (error) return { status: 'error', message: error.message };
    // Apple shares the name only on the very first sign-in; keep it then.
    const name = [cred.fullName?.givenName, cred.fullName?.familyName].filter(Boolean).join(' ');
    if (name) void supabase.auth.updateUser({ data: { full_name: name } });
    return { status: 'ok' };
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return { status: 'cancel' };
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
async function finishFromUrl(url: string): Promise<SocialResult> {
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
  return { status: 'error', message: 'Google sign-in did not finish. Try again.' };
}
