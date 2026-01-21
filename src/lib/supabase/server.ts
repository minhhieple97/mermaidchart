import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env, getSupabasePublishableKey } from '@/env';

/**
 * Creates a Supabase client for use in server components and server actions.
 * This client handles cookie-based session management for server-side authentication.
 *
 * Supports both new API keys (sb_publishable_*) and legacy (anon) keys.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    },
  );
}
