import { createClient } from '@supabase/supabase-js'
// Server-side Supabase client with service role (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!,
  { auth: { persistSession: false, autoRefreshToken: false } }
)
