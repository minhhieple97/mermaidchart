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
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Form validation schema for authentication.
 * Validates email format and minimum password length.
 */
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface AuthFormProps {
  mode: 'login' | 'signup';
}

/**
 * AuthForm component - handles both login and signup forms.
 * Uses react-hook-form with zod validation and next-safe-action for server actions.
 *
 * @validates Requirements 1.2, 1.3, 1.4
 * - 1.2: WHEN a user submits valid credentials THEN THE Auth_System SHALL authenticate the user and redirect to the dashboard
 * - 1.3: WHEN a user submits invalid credentials THEN THE Auth_System SHALL display an error message and remain on the login page
 * - 1.4: WHEN a user clicks the sign-up link THEN THE Auth_System SHALL display the registration form
 */
export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const signInExec = useAction(signInAction);
  const signUpExec = useAction(signUpAction);

  const currentAction = mode === 'login' ? signInExec : signUpExec;
  const { execute, status, result } = currentAction;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoading = status === 'executing' || isRedirecting;

  // Handle successful authentication - redirect to dashboard
  useEffect(() => {
    if (result?.data?.success) {
      setIsRedirecting(true);

      if (mode === 'signup') {
        toast({
          title: 'Account created successfully!',
          description: 'Welcome! Redirecting to your dashboard...',
        });
      } else {
        toast({
          title: 'Welcome back!',
          description: 'Redirecting to your dashboard...',
        });
      }

      // Small delay for better UX
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 500);
    }
  }, [result, router, mode, toast]);

  // Handle errors with toast notifications
  useEffect(() => {
    if (result?.data?.error) {
      toast({
        title: mode === 'login' ? 'Login failed' : 'Signup failed',
        description: result.data.error,
        variant: 'destructive',
      });
    }
  }, [result, mode, toast]);

  const onSubmit = async (values: FormValues) => {
    if (mode === 'signup') {
      // For signup, execute signup then auto-login
      const signupResult = await signUpExec.executeAsync(values);

      if (signupResult?.data?.success) {
        // Auto-login after successful signup
        await signInExec.executeAsync(values);
      }
    } else {
      // For login, just execute login
      execute(values);
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
                xmlns="http://www.w3.org/2000/svg"
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
