import { cookies } from 'next/headers';
import { createClient as createServerSupabaseClient } from '../../utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function createServerSideClient() {
  const cookieStore = await cookies();
  return createServerSupabaseClient(cookieStore);
}

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey);
}
