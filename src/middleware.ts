import { type NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';
import { canAccess } from '@/lib/rbac';
import type { UserRole } from '@/types/database';

const PUBLIC_PATHS = [
  '/login',
  '/forgot-password',
  '/reset',
  '/auth/callback',
];

const PUBLIC_PREFIXES = [
  '/_next',
  '/favicon',
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const { pathname, search } = request.nextUrl;

  // Always refresh the session cookie on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Public paths: if logged in and visiting /login, redirect home.
  if (isPublic(pathname)) {
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // 2. Any other path requires a session.
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Role-gated sub-trees.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as UserRole | undefined;
  if (!role) {
    return NextResponse.redirect(new URL('/login?error=profile_missing', request.url));
  }

  if (!canAccess(role, pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  // Run on everything except the static asset paths.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
