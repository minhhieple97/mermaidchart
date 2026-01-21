import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

/**
 * Signup page - displays the authentication form for user registration.
 * Uses a centered layout with a link to the login page.
 *
 * @validates Requirements 1.4, 1.5
 * - 1.4: WHEN a user clicks the sign-up link THEN THE Auth_System SHALL display the registration form
 * - 1.5: WHEN a user submits valid registration details THEN THE Auth_System SHALL create a new account and send a verification email
 */
export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Get started with your free account
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm mode="signup" />

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
