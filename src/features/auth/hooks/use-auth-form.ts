'use client';

import { useState } from 'react';
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

  const clearServerError = () => {
    setServerError(null);
  };

  const handleSuccess = (isSignup: boolean) => {
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
  };

  const handleError = (error: string) => {
    const friendlyMessage = getAuthErrorMessage(error, mode);
    setServerError(friendlyMessage);
  };

  const onSubmit = async (values: AuthFormValues) => {
    setServerError(null);

    try {
      if (mode === 'signup') {
        const signupResult = await signUpExec.executeAsync(values);

        // Handle flattened validation errors
        if (signupResult?.validationErrors?.fieldErrors) {
          const fieldErrors = signupResult.validationErrors.fieldErrors;
          const firstError =
            fieldErrors.email?.[0] || fieldErrors.password?.[0];
          if (firstError) {
            setServerError(firstError);
            return;
          }
        }

        // Handle server error (thrown via ActionError)
        if (signupResult?.serverError) {
          handleError(signupResult.serverError);
          return;
        }

        // Success - now login
        if (signupResult?.data?.success) {
          const loginResult = await signInExec.executeAsync(values);

          if (loginResult?.serverError) {
            handleError(loginResult.serverError);
            return;
          }

          if (loginResult?.data?.success) {
            handleSuccess(true);
          } else {
            // Login failed but signup succeeded - still redirect
            handleSuccess(true);
          }
        } else {
          setServerError(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      } else {
        const result = await signInExec.executeAsync(values);

        // Handle flattened validation errors
        if (result?.validationErrors?.fieldErrors) {
          const fieldErrors = result.validationErrors.fieldErrors;
          const firstError =
            fieldErrors.email?.[0] || fieldErrors.password?.[0];
          if (firstError) {
            setServerError(firstError);
            return;
          }
        }

        // Handle server error
        if (result?.serverError) {
          handleError(result.serverError);
          return;
        }

        if (result?.data?.success) {
          handleSuccess(false);
        } else {
          setServerError(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setServerError(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };

  return {
    form,
    isLoading,
    isRedirecting,
    serverError,
    clearServerError,
    onSubmit,
  };
}
