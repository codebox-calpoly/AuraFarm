import { ExpoConfig, ConfigContext } from 'expo/config';
import path from 'node:path';
import { config } from 'dotenv';

// Load .env from the repo root only
const rootEnv = path.resolve(__dirname, '..', '.env');
config({ path: rootEnv });

export default {
  expo: {
    name: 'aura-farm',
    slug: 'my-app',
    version: '1.0.0',
    userInterfaceStyle: 'automatic',
    scheme: 'aurafarmmobile',
    plugins: ['expo-font', 'expo-updates'],
    updates: {
      url: 'https://u.expo.dev/3c36a5fa-98d4-45f9-bb18-fe6266fa0978',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    ios: {
      bundleIdentifier: 'com.codebox.aurafarm',
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    extra: {
      supabaseUrl:
        process.env.EXPO_PUBLIC_SUPABASE_URL ??
        process.env.SUPABASE_URL,
      supabaseAnonKey:
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.EXPO_PUBLIC_SUPABASE_KEY ??
        process.env.SUPABASE_ANON_KEY ??
        process.env.SUPABASE_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: '3c36a5fa-98d4-45f9-bb18-fe6266fa0978',
      },
    },
  },
};
