import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// 优先用 process.env（Metro 从 .env 注入），否则用 app.config 的 extra（Node 启动时 dotenv 已加载）
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.supabaseUrl;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ??
  (Constants.expoConfig?.extra as Record<string, string> | undefined)?.supabaseAnonKey;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY are defined in your .env file (in the frontend folder), or SUPABASE_URL and SUPABASE_KEY in the same .env.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);