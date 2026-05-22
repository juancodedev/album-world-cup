import { createClient as createBrowserSupabaseClient } from '../../utils/supabase/client';

let client: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function createClient() {
  if (!client) {
    client = createBrowserSupabaseClient();
  }
  return client;
}
