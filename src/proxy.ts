import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient } from '@supabase/ssr';
import { env, getSupabasePublishableKey } from '@/env';

/**
 * Auth proxy for protected routes.
 * Redirects unauthenticated users to login page.
 * Requirement 1.1: WHEN a user visits the application without authentication
 * THEN THE Auth_System SHALL redirect them to the login page
 */
export async function proxy(request: NextRequest) {
  // Update the session first (refreshes token if expired)
  const response = await updateSession(request);

  // Check if the user is authenticated for protected routes
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isPublicRoute) {
    return response;
  }

  // For protected routes, check authentication
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // We don't need to set cookies here as updateSession handles it
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static file extensions (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
