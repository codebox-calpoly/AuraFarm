import 'dotenv/config';

export default {
  expo: {
    name: 'aura-farm',
    slug: 'my-app',
    version: '1.0.0',
    scheme: 'aurafarmmobile',
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
