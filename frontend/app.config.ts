import { ExpoConfig, ConfigContext } from 'expo/config';
import 'dotenv/config';

export default {
  expo: {
    name: 'aura-farm',
    slug: 'my-app',
    version: '1.0.0',
    scheme: 'aurafarmmobile',
    plugins: ['expo-font'],
    extra: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY ||
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.EXPO_PUBLIC_SUPABASE_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
  },
};
