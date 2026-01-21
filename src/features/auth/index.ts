/**
 * Auth feature public exports
 */

// Components
export { AuthForm } from './components/auth-form';
export { AuthErrorAlert } from './components/auth-error-alert';
export { AuthSubmitButton } from './components/auth-submit-button';

// Hooks
export { useAuthForm } from './hooks/use-auth-form';

// Types
export type {
  AuthMode,
  AuthFormValues,
  AuthFormProps,
} from './types/auth.types';
export { loginSchema, signupSchema } from './types/auth.types';

// Constants
export {
  AUTH_REDIRECT_DELAY_MS,
  DASHBOARD_ROUTE,
  AUTH_ERROR_MESSAGES,
  AUTH_SUCCESS_MESSAGES,
  AUTH_PLACEHOLDERS,
  MIN_PASSWORD_LENGTH,
} from './constants/auth.constants';

// Utils
export { getAuthErrorMessage } from './utils/auth-error.utils';
