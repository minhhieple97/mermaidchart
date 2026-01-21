/**
 * Authentication types
 */

import { z } from 'zod';

/** Minimum password length */
const MIN_PASSWORD_LENGTH = 6;

/** Authentication mode */
export type AuthMode = 'login' | 'signup';

/** Form validation schema */
export const authFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(
      MIN_PASSWORD_LENGTH,
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
    ),
});

/** Form values type */
export type AuthFormValues = z.infer<typeof authFormSchema>;

/** Auth form props */
export interface AuthFormProps {
  mode: AuthMode;
}
