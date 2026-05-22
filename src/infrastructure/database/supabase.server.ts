import { cookies } from 'next/headers';
import { createClient as createServerSupabaseClient } from '../../utils/supabase/server';

export async function createServerSideClient() {
  const cookieStore = await cookies();
  return createServerSupabaseClient(cookieStore);
}
