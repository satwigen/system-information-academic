import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Service-role Supabase client. NEVER import this from a client component.
 * Bypasses RLS — use only for admin user management (createUser, deleteUser).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase admin client: missing env vars');
  }
  return createSupabaseClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
