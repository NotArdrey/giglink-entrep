import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://dczhfpcfqlygpbqjctwf.supabase.co';
// Public anon/publishable key for client-side use only. Prefer env vars when available.
const supabaseAnonKey =
  process.env.REACT_APP_SUPABASE_ANON_KEY
  || process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY
  || 'sb_publishable_YFgfiGPizdbN-jtd9suIJw__NVqsltC';

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
  console.log('🔧 Supabase Client Initialization:');
  console.log('   URL:', supabaseUrl);
  console.log('   Key loaded:', !!supabaseAnonKey);
  console.log('   Env vars present:', {
    URL: !!process.env.REACT_APP_SUPABASE_URL,
    KEY: !!process.env.REACT_APP_SUPABASE_ANON_KEY,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'giglink-app',
    },
  },
});
