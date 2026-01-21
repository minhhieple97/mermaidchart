import { cache } from 'react';
import { createSafeActionClient } from 'next-safe-action';
import { createClient } from '@/lib/supabase/server';

/**
 * Base action client for public actions that don't require authentication.
 * Use this for actions like sign-in, sign-up, etc.
 */
export const actionClient = createSafeActionClient();

/**
 * Cached auth check using React.cache for per-request deduplication.
 * Multiple calls within the same request will only execute once.
 */
const getAuthenticatedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user, supabase };
});

/**
 * Authenticated action client with Supabase middleware.
 * Use this for actions that require a logged-in user.
 * Provides user and supabase client in the context.
 * Uses React.cache for per-request deduplication of auth checks.
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const auth = await getAuthenticatedUser();

  if (!auth) {
    throw new Error('Unauthorized');
  }

  return next({ ctx: auth });
});
