/**
 * Authentication constants
 */

/** Redirect delay after successful authentication (ms) */
export const AUTH_REDIRECT_DELAY_MS = 500;

/** Dashboard route path */
export const DASHBOARD_ROUTE = '/';

/** Error message mappings for Supabase errors */
export const AUTH_ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS:
    'Invalid email or password. Please check your credentials and try again.',
  EMAIL_NOT_CONFIRMED:
    'Please verify your email address before signing in. Check your inbox for a verification link.',

  // Registration errors
  USER_ALREADY_EXISTS:
    'An account with this email already exists. Try signing in instead.',
  WEAK_PASSWORD:
    'Please choose a stronger password with at least 6 characters.',

  // Rate limiting
  RATE_LIMITED: 'Too many attempts. Please wait a moment before trying again.',

  // Network errors
  NETWORK_ERROR:
    'Unable to connect. Please check your internet connection and try again.',

  // Generic fallbacks
  LOGIN_FAILED:
    'Unable to sign in. Please check your credentials and try again.',
  SIGNUP_FAILED: 'Unable to create account. Please try again later.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again later.',
} as const;

/** Success messages */
export const AUTH_SUCCESS_MESSAGES = {
  LOGIN: {
    title: 'Welcome back!',
    description: 'Redirecting to your dashboard...',
  },
  SIGNUP: {
    title: 'Account created!',
    description: 'Redirecting to your dashboard...',
  },
} as const;

/** Form placeholders */
export const AUTH_PLACEHOLDERS = {
  EMAIL: 'you@example.com',
  PASSWORD: '••••••••',
} as const;

/** Minimum password length */
export const MIN_PASSWORD_LENGTH = 6;
