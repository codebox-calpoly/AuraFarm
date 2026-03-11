import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables:\n' +
    '  - SUPABASE_URL\n' +
    '  - SUPABASE_SERVICE_KEY'
  );
}

// Service-role client — for server-side admin operations (bypass RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Anon-key client — for user-facing auth operations (signUp, signIn, verifyOtp)
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey || supabaseServiceKey);
