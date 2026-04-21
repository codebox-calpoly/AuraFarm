import type { ExpoConfig, ConfigContext } from 'expo/config';
import path from 'node:path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(__dirname, '..', '.env') });

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Aura Farm',
  slug: config.slug ?? 'my-app',
  extra: {
    ...config.extra,
    supabaseUrl:
      process.env.EXPO_PUBLIC_SUPABASE_URL ??
      process.env.SUPABASE_URL,
    supabaseAnonKey:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_KEY ??
      process.env.SUPABASE_ANON_KEY ??
      process.env.SUPABASE_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
  },
});
