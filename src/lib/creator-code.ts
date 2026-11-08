import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeCode } from './billing-shared';
import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// A creator's code (migration 20261107000020). She types it in onboarding,
// before any account exists: it is checked (creator_code_name), kept on the
// phone, and claimed for her account as soon as there is one — and again for
// a new account on the same phone, since the first claim per account counts.
// On Android the paywall then opens the creator offer (the first month free on
// the annual plan) with it, through redeem-code, like any code.
// ---------------------------------------------------------------------------

const KEY = 'posta.creator-code';
const CLAIMED_KEY = 'posta.creator-code-claimed';

export type CreatorCode = { code: string; name: string };

/** Her name if the code is an active creator's, null if not, undefined offline. */
export async function checkCreatorCode(raw: string): Promise<string | null | undefined> {
  const code = normalizeCode(raw);
  if (code.length < 3) return null;
  const { data, error } = await supabase.rpc('creator_code_name', { p_code: code });
  if (error) return undefined;
  return typeof data === 'string' && data ? data : null;
}

export async function saveCreatorCode(c: CreatorCode | null): Promise<void> {
  try {
    if (c) await AsyncStorage.setItem(KEY, JSON.stringify(c));
    else await AsyncStorage.removeItem(KEY);
  } catch {}
}

export async function loadCreatorCode(): Promise<CreatorCode | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const c = raw ? (JSON.parse(raw) as CreatorCode) : null;
    return c?.code ? c : null;
  } catch {
    return null;
  }
}

/** Notes the saved code for this account, once per account per phone. */
export async function claimCreatorCode(userId: string): Promise<void> {
  const c = await loadCreatorCode();
  if (!c) return;
  try {
    if ((await AsyncStorage.getItem(CLAIMED_KEY)) === userId) return;
    const { error } = await supabase.rpc('claim_creator_code', { p_code: c.code, p_source: 'onboarding' });
    if (!error) await AsyncStorage.setItem(CLAIMED_KEY, userId);
  } catch {}
}
