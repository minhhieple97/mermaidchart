/**
 * Authentication types
 * Re-exports schemas from centralized validations
 */

import {
  loginSchema,
  signupSchema,
  type LoginFormValues,
  type SignupFormValues,
} from '@/lib/validations';

/** Authentication mode */
export type AuthMode = 'login' | 'signup';

/** Re-export schemas for use in auth feature */
export { loginSchema, signupSchema };

/** Form values type - union of login and signup (they have same shape) */
export type AuthFormValues = LoginFormValues | SignupFormValues;

/** Auth form props */
export interface AuthFormProps {
  mode: AuthMode;
}
