import { createSafeActionClient } from 'next-safe-action';
import { createClient } from '@/lib/supabase/server';

/**
 * Base action client for public actions that don't require authentication.
 * Use this for actions like sign-in, sign-up, etc.
 */
export const actionClient = createSafeActionClient();

/**
 * Authenticated action client with Supabase middleware.
 * Use this for actions that require a logged-in user.
 * Provides user and supabase client in the context.
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return next({ ctx: { user, supabase } });
});
