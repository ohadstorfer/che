import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

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

const realClient = createClient(url, anonKey, {
  auth: {
    // On web supabase-js falls back to localStorage by itself (and safely
    // no-ops during static export where window doesn't exist).
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Required only in demo mode, so a release build never loads (or ships) the
// 330 KB fixture course.
export const supabase = (DEMO ? require('./demo').demoClient : realClient) as typeof realClient;
