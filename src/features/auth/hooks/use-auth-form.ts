'use client';

/**
 * Custom hook for authentication form logic
 */

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
    console.log('Form submitted with values:', values);
    setServerError(null);

    try {
      if (mode === 'signup') {
        console.log('Executing signup...');
        const signupResult = await signUpExec.executeAsync(values);
        console.log('Signup result:', signupResult);

        // Handle validation errors from next-safe-action
        if (signupResult?.validationErrors) {
          const errors = signupResult.validationErrors;
          const firstError = Object.values(errors).flat()[0];
          if (firstError) {
            setServerError(String(firstError));
            return;
          }
        }

        // Handle server errors
        if (signupResult?.serverError) {
          setServerError(String(signupResult.serverError));
          return;
        }

        if (signupResult?.data?.error) {
          handleError(signupResult.data.error);
          return;
        }

        if (signupResult?.data?.success) {
          console.log('Signup successful, logging in...');
          const loginResult = await signInExec.executeAsync(values);
          console.log('Login result:', loginResult);

          if (loginResult?.data?.success) {
            handleSuccess(true);
          } else if (loginResult?.data?.error) {
            handleError(loginResult.data.error);
          } else {
            // Login failed silently - still show success for signup
            handleSuccess(true);
          }
        } else {
          // No success and no error - something unexpected happened
          console.log('Unexpected signup result');
          setServerError(AUTH_ERROR_MESSAGES.UNKNOWN_ERROR);
        }
      } else {
        console.log('Executing login...');
        const result = await signInExec.executeAsync(values);
        console.log('Login result:', result);

        // Handle validation errors
        if (result?.validationErrors) {
          const errors = result.validationErrors;
          const firstError = Object.values(errors).flat()[0];
          if (firstError) {
            setServerError(String(firstError));
            return;
          }
        }

        // Handle server errors
        if (result?.serverError) {
          setServerError(String(result.serverError));
          return;
        }

        if (result?.data?.success) {
          handleSuccess(false);
        } else if (result?.data?.error) {
          handleError(result.data.error);
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
