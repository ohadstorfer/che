import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { secureSessionStorage } from './secure-session';

/**
 * The app talks to the real project. `EXPO_PUBLIC_DEMO=1` swaps in the fixture
 * backend instead (lib/demo.ts) — a learner mid-course with no network, no
 * account and nothing written anywhere, for working on the UI:
 *
 *   EXPO_PUBLIC_DEMO=1 npm run web
 */
const DEMO = process.env.EXPO_PUBLIC_DEMO === '1';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder';

/** How long a request may go without any answer. A connection that stalls
 *  without closing would otherwise hang the request — and whatever waits on
 *  it, retries included — until the phone gives up on its own. Once the
 *  server has answered, a slow download is left to finish: slow is not dead. */
const NO_ANSWER_MS = 20_000;
/** A safety net for an answer that started and then stopped coming. */
const ANSWERED_MS = 3 * 60_000;

function withDeadline(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const target = typeof input === 'string' ? input : String((input as { url?: string }).url ?? input);
  // Uploads and edge functions (a chat's summary is written by Claude) can
  // rightly take longer; they keep their own pace.
  if (target.includes('/functions/v1/') || target.includes('/storage/v1/')) return fetch(input, init);
  const own = new AbortController();
  const outer = init?.signal;
  if (outer?.aborted) own.abort();
  else outer?.addEventListener('abort', () => own.abort(), { once: true });
  const silent = setTimeout(() => own.abort(), NO_ANSWER_MS);
  return fetch(input, { ...init, signal: own.signal }).then(
    (res) => {
      clearTimeout(silent);
      setTimeout(() => own.abort(), ANSWERED_MS);
      return res;
    },
    (e) => {
      clearTimeout(silent);
      throw e;
    },
  );
}

const realClient = createClient(url, anonKey, {
  global: { fetch: withDeadline },
  auth: {
    // On a phone the session lives in the Keychain / Keystore (lib/secure-session).
    // On web supabase-js falls back to localStorage by itself (and safely
    // no-ops during static export where window doesn't exist).
    ...(Platform.OS !== 'web' ? { storage: secureSessionStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Google answers with a one-time code, not the tokens themselves. On
    // Android the posta:// callback is an intent any app could also claim;
    // the code is useless to it without the verifier kept on this phone.
    // (Apple and email sign in without a redirect, so this changes nothing there.)
    ...(Platform.OS !== 'web' ? { flowType: 'pkce' as const } : {}),
  },
});

// Required only in demo mode, so a release build never loads (or ships) the
// 330 KB fixture course.
export const supabase = (DEMO ? require('./demo').demoClient : realClient) as typeof realClient;
