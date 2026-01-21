/**
 * Authentication error utilities
 */

import { AUTH_ERROR_MESSAGES } from '../constants/auth.constants';

type AuthMode = 'login' | 'signup';

/**
 * Maps Supabase error messages to user-friendly messages
 */
export function getAuthErrorMessage(error: string, mode: AuthMode): string {
  const errorLower = error.toLowerCase();

  // Authentication errors
  if (
    errorLower.includes('invalid login credentials') ||
    errorLower.includes('invalid credentials')
  ) {
    return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  if (errorLower.includes('email not confirmed')) {
    return AUTH_ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }

  // Registration errors
  if (
    errorLower.includes('user already registered') ||
    errorLower.includes('email already in use')
  ) {
    return AUTH_ERROR_MESSAGES.USER_ALREADY_EXISTS;
  }

  if (
    errorLower.includes('password should be at least') ||
    errorLower.includes('weak password')
  ) {
    return AUTH_ERROR_MESSAGES.WEAK_PASSWORD;
  }

  // Rate limiting
  if (
    errorLower.includes('too many requests') ||
    errorLower.includes('rate limit')
  ) {
    return AUTH_ERROR_MESSAGES.RATE_LIMITED;
  }

  // Network errors
  if (errorLower.includes('network') || errorLower.includes('fetch')) {
    return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Generic fallback based on mode
  return mode === 'login'
    ? AUTH_ERROR_MESSAGES.LOGIN_FAILED
    : AUTH_ERROR_MESSAGES.SIGNUP_FAILED;
}
