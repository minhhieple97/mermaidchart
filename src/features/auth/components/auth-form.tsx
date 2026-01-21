'use client';

import { memo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useAuthForm } from '../hooks/use-auth-form';
import { AuthErrorAlert } from './auth-error-alert';
import { AuthSubmitButton } from './auth-submit-button';
import { AUTH_PLACEHOLDERS } from '../constants/auth.constants';
import type { AuthMode } from '../types/auth.types';

interface AuthFormProps {
  mode: AuthMode;
}

export const AuthForm = memo(function AuthForm({ mode }: AuthFormProps) {
  const {
    form,
    isLoading,
    isRedirecting,
    serverError,
    clearServerError,
    onSubmit,
  } = useAuthForm({ mode });

  const handleEmailChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: (value: string) => void,
    ) => {
      clearServerError();
      onChange(e.target.value);
    },
    [clearServerError],
  );

  const handlePasswordChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      onChange: (value: string) => void,
    ) => {
      clearServerError();
      onChange(e.target.value);
    },
    [clearServerError],
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthErrorAlert message={serverError} />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={AUTH_PLACEHOLDERS.EMAIL}
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => handleEmailChange(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={AUTH_PLACEHOLDERS.PASSWORD}
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  disabled={isLoading}
                  {...field}
                  onChange={(e) => handlePasswordChange(e, field.onChange)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <AuthSubmitButton
          mode={mode}
          isLoading={isLoading}
          isRedirecting={isRedirecting}
        />
      </form>
    </Form>
  );
});
