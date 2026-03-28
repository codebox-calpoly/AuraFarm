import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded from the root directory if not already
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your .env file (should be in the root directory):\n' +
      '  - SUPABASE_URL\n' +
      '  - SUPABASE_SERVICE_KEY\n' +
      '  - SUPABASE_ANON_KEY'
  );
}

// Admin client — for server-side operations that bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Public client — for user-facing operations (auth, storage with RLS, etc.)
// Uses anon key by default; will use service key if anon key is missing (backwards compatibility)
const publicAuthKey = supabaseAnonKey || supabaseServiceKey;
export const supabase = createClient(supabaseUrl, publicAuthKey);

// Keeping this as an alias for now to avoid breaking existing imports that use this name
export const supabaseAuth = supabase;
