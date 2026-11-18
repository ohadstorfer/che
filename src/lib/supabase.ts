import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';

import { isRead, withDeadline } from './deadline-fetch';
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

/**
 * Reads on the phones go through expo/fetch. React Native's own fetch asks for
 * every body as a blob, held as a Java byte array (BlobModule) until the JS
 * garbage collector happens to free it — and that runs on JS memory pressure,
 * not Java's. The course, the lexicon and a class are megabytes each, and on
 * Android's 256 MB Java heap they piled up (2026-11-17: a Redmi ran out a
 * minute into the first class). Writes, edge functions and storage keep the
 * fetch they always had.
 */
const readFetch = Platform.OS === 'web' ? null : (expoFetch as unknown as typeof fetch);
const target = (input: RequestInfo | URL) =>
  typeof input === 'string' ? input : String((input as { url?: string }).url ?? input);

const realClient = createClient(url, anonKey, {
  global: {
    fetch: (input, init) =>
      withDeadline(input, init, readFetch && isRead(target(input), init) ? readFetch : fetch),
  },
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
