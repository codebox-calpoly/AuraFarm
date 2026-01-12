import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables:\n' +
    '  - SUPABASE_URL\n' +
    '  - SUPABASE_SERVICE_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
