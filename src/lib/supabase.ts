import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import { demoClient } from './demo';

/**
 * The UI runs against fixtures while the schema for Che's course is still being
 * designed — see lib/demo.ts. Flip this to false once the tables this UI asks
 * for exist in the project, and the real client below takes over unchanged.
 */
const DEMO = true;

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

export const supabase = (DEMO ? demoClient : realClient) as typeof realClient;
