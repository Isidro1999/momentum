import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client for Client Components.
 * createBrowserClient uses a singleton by default — call freely without
 * creating multiple instances.
 */
export function createClient() {
  const { url, publishableKey } = requireSupabasePublicEnv();

  return createBrowserClient(url, publishableKey);
}
