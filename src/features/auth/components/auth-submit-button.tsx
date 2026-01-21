'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import type { AuthMode } from '../types/auth.types';

interface AuthSubmitButtonProps {
  mode: AuthMode;
  isLoading: boolean;
  isRedirecting: boolean;
}

const LoadingSpinner = memo(function LoadingSpinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

function getButtonText(
  mode: AuthMode,
  isLoading: boolean,
  isRedirecting: boolean,
): string {
  if (isRedirecting) return 'Redirecting...';
  if (isLoading)
    return mode === 'login' ? 'Signing in...' : 'Creating account...';
  return mode === 'login' ? 'Sign In' : 'Create Account';
}

export const AuthSubmitButton = memo(function AuthSubmitButton({
  mode,
  isLoading,
  isRedirecting,
}: AuthSubmitButtonProps) {
  const buttonText = getButtonText(mode, isLoading, isRedirecting);

  return (
    <Button type="submit" className="w-full" disabled={isLoading}>
      {isLoading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner />
          {buttonText}
        </span>
      ) : (
        buttonText
      )}
    </Button>
  );
});
