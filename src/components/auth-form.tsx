'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { signInAction, signUpAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const signInExec = useAction(signInAction);
  const signUpExec = useAction(signUpAction);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoading =
    signInExec.status === 'executing' ||
    signUpExec.status === 'executing' ||
    isRedirecting;

  const handleSuccess = useCallback(
    (isSignup: boolean) => {
      setIsRedirecting(true);
      toast({
        title: isSignup ? 'Account created successfully!' : 'Welcome back!',
        description: 'Redirecting to your dashboard...',
      });
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    },
    [toast, router],
  );

  const handleError = useCallback(
    (error: string) => {
      toast({
        title: mode === 'login' ? 'Login failed' : 'Signup failed',
        description: error,
        variant: 'destructive',
      });
    },
    [toast, mode],
  );

  const onSubmit = async (values: FormValues) => {
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                  {...field}
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
                  placeholder="••••••••"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
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
              {isRedirecting
                ? 'Redirecting...'
                : mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'}
            </span>
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account'
          )}
        </Button>
      </form>
    </Form>
  );
}
