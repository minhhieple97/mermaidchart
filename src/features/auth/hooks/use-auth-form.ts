'use client';

/**
 * Custom hook for authentication form logic
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { signInAction, signUpAction } from '@/actions/auth';
import { useToast } from '@/hooks/use-toast';
import {
  AUTH_REDIRECT_DELAY_MS,
  DASHBOARD_ROUTE,
  AUTH_SUCCESS_MESSAGES,
  AUTH_ERROR_MESSAGES,
} from '../constants/auth.constants';
import { getAuthErrorMessage } from '../utils/auth-error.utils';
import { authFormSchema } from '../types/auth.types';
import type { AuthMode, AuthFormValues } from '../types/auth.types';

interface UseAuthFormOptions {
  mode: AuthMode;
}

export function useAuthForm({ mode }: UseAuthFormOptions) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const signInExec = useAction(signInAction);
  const signUpExec = useAction(signUpAction);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoading =
    signInExec.status === 'executing' ||
    signUpExec.status === 'executing' ||
    isRedirecting;

  const clearServerError = useCallback(() => {
    setServerError(null);
  }, []);

  const handleSuccess = useCallback(
    (isSignup: boolean) => {
      setServerError(null);
      setIsRedirecting(true);

      const messages = isSignup
        ? AUTH_SUCCESS_MESSAGES.SIGNUP
        : AUTH_SUCCESS_MESSAGES.LOGIN;

      toast({
        title: messages.title,
        description: messages.description,
      });

      setTimeout(() => {
        router.push(DASHBOARD_ROUTE);
        router.refresh();
      }, AUTH_REDIRECT_DELAY_MS);
    },
    [toast, router],
  );

  const handleError = useCallback(
    (error: string) => {
      const friendlyMessage = getAuthErrorMessage(error, mode);
      setServerError(friendlyMessage);
    },
    [mode],
  );

  const onSubmit = useCallback(
    async (values: AuthFormValues) => {
      setServerError(null);

      try {
        if (mode === 'signup') {
          const signupResult = await signUpExec.executeAsync(values);

          if (signupResult?.data?.error) {
            handleError(signupResult.data.error);
            return;
          }

          if (signupResult?.data?.success) {
            const loginResult = await signInExec.executeAsync(values);
            if (loginResult?.data?.success) {
              handleSuccess(true);
            } else if (loginResult?.data?.error) {
              handleError(loginResult.data.error);
            }
          }
        } else {
          const result = await signInExec.executeAsync(values);
          if (result?.data?.success) {
            handleSuccess(false);
          } else if (result?.data?.error) {
            handleError(result.data.error);
          }
        }
      } catch {
        setServerError(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
      }
    },
    [mode, signUpExec, signInExec, handleSuccess, handleError],
  );

  return {
    form,
    isLoading,
    isRedirecting,
    serverError,
    clearServerError,
    onSubmit,
  };
}
