'use server';

import { action, ActionError } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Sign in action - authenticates a user with email and password.
 */
export const signInAction = action
  .inputSchema(authSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true, user: data.user };
  });

/**
 * Sign up action - creates a new user account with email and password.
 * Credits are initialized via database trigger or on first access.
 */
export const signUpAction = action
  .inputSchema(authSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
      },
    });

    if (error) {
      throw new ActionError(error.message);
    }

    return { success: true, user: data.user };
  });

/**
 * Sign out action - terminates the current user session.
 */
export const signOutAction = action.action(async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
});
