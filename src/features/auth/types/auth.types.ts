/**
 * Authentication types
 */

import { z } from 'zod';
import { MIN_PASSWORD_LENGTH } from '../constants/auth.constants';

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
