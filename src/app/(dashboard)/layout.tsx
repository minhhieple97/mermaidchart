'use client';

/**
 * Dashboard Layout
 * Provides consistent header with logo, user menu, and logout functionality
 *
 * Requirements:
 * - 1.6: Logout functionality to terminate session
 * - 7.1: Display dashboard with navigation
 */

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAction } from 'next-safe-action/hooks';
import { LogOut, User, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/toaster';
import { signOutAction } from '@/actions/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const { execute: signOut, status } = useAction(signOutAction, {
    onSuccess: () => {
      router.push('/login');
    },
  });

  const isLoggingOut = status === 'executing';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <GitBranch className="h-5 w-5 text-primary" />
            <span>Mermaid Preview</span>
          </Link>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                disabled={isLoggingOut}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
