import Link from 'next/link';
import { AuthForm } from '@/components/auth-form';

/**
 * Login page - displays the authentication form for user sign-in.
 * Uses a centered layout with a link to the signup page.
 *
 * @validates Requirements 1.2, 1.3, 1.4
 * - 1.2: WHEN a user submits valid credentials THEN THE Auth_System SHALL authenticate the user and redirect to the dashboard
 * - 1.3: WHEN a user submits invalid credentials THEN THE Auth_System SHALL display an error message and remain on the login page
 * - 1.4: WHEN a user clicks the sign-up link THEN THE Auth_System SHALL display the registration form
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm mode="login" />

        {/* Sign up link */}
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
