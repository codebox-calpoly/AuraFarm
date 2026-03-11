import path from 'node:path';
import { config } from 'dotenv';

// Load root .env (one level up from frontend/) so one file serves backend + frontend
config({ path: path.resolve(__dirname, '..', '.env') });

export default {
  expo: {
    name: 'aura-farm',
    slug: 'my-app',
    version: '1.0.0',
    scheme: 'aurafarmmobile',
    plugins: ['expo-font'],
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_KEY,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
    },
  },
};
