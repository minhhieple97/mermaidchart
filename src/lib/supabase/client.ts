import { createBrowserClient } from '@supabase/ssr';
import { env, getSupabasePublishableKey } from '@/env';

/**
 * Creates a Supabase client for use in browser/client components.
 * This client is used for client-side data fetching and authentication.
 *
 * Supports both new API keys (sb_publishable_*) and legacy (anon) keys.
 */
export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    getSupabasePublishableKey(),
  );
}
