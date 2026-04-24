import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra as Record<string, string | undefined> | undefined;

const supabaseUrl =
  extra?.supabaseUrl ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  extra?.supabaseAnonKey ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// createClient throws if URL is an empty string, so fall back to stubs.
// The client won't make real requests with these values, but the app won't crash.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing credentials — image uploads will fail.\n' +
    'Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in the root .env file and restart Expo.'
  );
}

// Session tokens are stored in @aurafarm/session via lib/auth.ts. If we also let the
// Supabase client persist + auto-refresh, GoTrue can race with refreshSession() and
// you get "Invalid Refresh Token: Already Used" after a token rotation.
export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
