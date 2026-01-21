'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { AUTH_PLACEHOLDERS } from '../constants/auth.constants';
import type { AuthMode } from '../types/auth.types';

interface AuthFormProps {
  mode: AuthMode;
}

export function AuthForm({ mode }: AuthFormProps) {
  const {
    form,
    isLoading,
    isRedirecting,
    serverError,
    clearServerError,
    onSubmit,
  } = useAuthForm({ mode });

  const handleSubmit = form.handleSubmit(onSubmit);

  const getButtonText = () => {
    if (isRedirecting) return 'Redirecting...';
    if (isLoading)
      return mode === 'login' ? 'Signing in...' : 'Creating account...';
    return mode === 'login' ? 'Sign In' : 'Create Account';
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
                  value={field.value}
                  onChange={(e) => {
                    clearServerError();
                    field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
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
                  value={field.value}
                  onChange={(e) => {
                    clearServerError();
                    field.onChange(e.target.value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && (
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
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
          )}
          {getButtonText()}
        </Button>
      </form>
    </Form>
  );
}
