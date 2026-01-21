'use server';

import { actionClient } from '@/lib/safe-action';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

/**
 * Schema for sign-in and sign-up validation.
 * Validates email format and minimum password length.
 */
const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Sign in action - authenticates a user with email and password.
 * Uses Supabase's signInWithPassword method.
 *
 * @validates Requirements 1.2, 1.3
 * - 1.2: WHEN a user submits valid credentials THEN THE Auth_System SHALL authenticate the user
 * - 1.3: WHEN a user submits invalid credentials THEN THE Auth_System SHALL display an error message
 */
export const signInAction = actionClient
  .schema(authSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  });

/**
 * Sign up action - creates a new user account with email and password.
 * Uses Supabase's signUp method and initializes user credits.
 *
 * @validates Requirements 1.5
 * - 1.5: WHEN a user submits valid registration details THEN THE Auth_System SHALL create a new account
 */
export const signUpAction = actionClient
  .schema(authSchema)
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
      return { success: false, error: error.message };
    }

    // Initialize user credits for new user
    if (data.user) {
      await supabase.rpc('initialize_user_credits', {
        p_user_id: data.user.id,
      });
    }

    return { success: true, user: data.user };
  });

/**
 * Sign out action - terminates the current user session.
 * Uses Supabase's signOut method.
 *
 * @validates Requirements 1.6
 * - 1.6: WHEN a user clicks the logout button THEN THE Auth_System SHALL terminate the session
 */
export const signOutAction = actionClient.action(async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { success: true };
});
