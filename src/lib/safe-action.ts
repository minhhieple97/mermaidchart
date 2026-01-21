import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action';
import { createClient } from '@/lib/supabase/server';

/**
 * Custom error class for action errors
 * Use this to throw user-friendly error messages from server actions
 */
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ActionError';
  }
}

/**
 * Base action client for public actions that don't require authentication.
 * Use this for actions like sign-in, sign-up, public data fetching, etc.
 */
export const action = createSafeActionClient({
  throwValidationErrors: false,
  defaultValidationErrorsShape: 'flattened',
  handleServerError: (error) => {
    // Return user-friendly message for ActionError
    if (error instanceof ActionError) {
      return error.message;
    }
    // Log unexpected errors server-side
    console.error('Server action error:', error);
    // Return generic message for unexpected errors
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

/**
 * Get authenticated user from session
 */
async function getUserInSession() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Authenticated action client with Supabase middleware.
 * Use this for actions that require a logged-in user.
 * Provides user and supabase client in the context.
 */
export const authAction = action.use(async ({ next }) => {
  const user = await getUserInSession();

  if (!user) {
    throw new ActionError('Authentication required. Please sign in.');
  }

  const supabase = await createClient();

  return next({ ctx: { user, supabase } });
});

// Legacy exports for backward compatibility
export const actionClient = action;
export const authActionClient = authAction;
