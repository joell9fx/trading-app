/**
 * Next.js Middleware for route protection
 * Protects dashboard and admin routes with authentication and authorization
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/signin', '/signup', '/login'];
const PROTECTED_PREFIXES = ['/dashboard', '/admin', '/superadmin'];

const isDev = process.env.NODE_ENV !== 'production';

const securityHeaders = new Headers();
securityHeaders.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
securityHeaders.set('X-Frame-Options', 'DENY');
securityHeaders.set('X-Content-Type-Options', 'nosniff');
securityHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
securityHeaders.set('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');

// Next.js dev server injects inline scripts and uses eval for React Refresh.
// Relax CSP in development only to avoid blank screens while keeping prod strict.
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",

  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://*.stripe.com https://api.stripe.com${
    isDev ? ' ws://localhost:4001 http://localhost:4001' : ''
  }`,

  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com"
    : "script-src 'self' 'unsafe-inline' https://js.stripe.com",

  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "frame-src https://js.stripe.com https://hooks.stripe.com",
].join('; ');

securityHeaders.set('Content-Security-Policy', cspDirectives);

function withSecurityHeaders(response: NextResponse) {
  securityHeaders.forEach((value, key) => response.headers.set(key, value));
  return response;
}

export async function middleware(request: NextRequest) {
  const response = withSecurityHeaders(NextResponse.next());
  const { pathname } = request.nextUrl;
  const isSuperAdminRoute = pathname.startsWith('/superadmin');

  // Skip assets and API routes
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|css|js|map)$/)
  ) {
    return response;
  }

  const isAuthPage = AUTH_PAGES.some((path) => pathname === path || pathname.startsWith(path + '/'));
  const isProtected = PROTECTED_PREFIXES.some((path) => pathname === path || pathname.startsWith(path + '/'));

  // Public routes: do not force auth
  if (!isProtected && !isAuthPage) {
    return response;
  }

  // Create Supabase client for protected/auth checks
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach((cookie) => {
          request.cookies.set(cookie.name, cookie.value);
          response.cookies.set(cookie.name, cookie.value, cookie.options);
        });
      },
    },
  });

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Keep authenticated users off auth pages
  if (user && isAuthPage) {
    return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
  }

  // If route is not protected, allow
  if (!isProtected) {
    return response;
  }

  // Load profile when authenticated for role checks
  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('role, is_owner, banned, has_ai_tools_access')
        .eq('id', user.id)
        .single()
    : { data: null };

  // Single normalized role used by superadmin and admin gates (defined before any branch)
  const rawRole = profile?.role ? profile.role.toString().toLowerCase() : '';
  const normalizedRole: 'member' | 'admin' | 'owner' =
    profile?.is_owner === true || rawRole === 'owner'
      ? 'owner'
      : rawRole === 'admin'
        ? 'admin'
        : 'member';

  // Banned users are redirected away from private routes
  if (user && profile?.banned && pathname !== '/banned') {
    return withSecurityHeaders(NextResponse.redirect(new URL('/banned', request.url)));
  }

  // Super Admin protection: only owners
  if (isSuperAdminRoute) {
    if (!user || normalizedRole !== 'owner') {
      return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
    }
    return response;
  }

  // Protect admin routes: must be signed in and admin or owner
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const signInUrl = new URL('/signin', request.url);
      signInUrl.searchParams.set('redirectTo', pathname);
      return withSecurityHeaders(NextResponse.redirect(signInUrl));
    }
    const hasAdminAccess = normalizedRole === 'admin' || normalizedRole === 'owner';
    if (!hasAdminAccess) {
      return withSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
    }
    return response;
  }

  // Protect all other non-public routes
  if (!user) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirectTo', pathname);
    return withSecurityHeaders(NextResponse.redirect(signInUrl));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map)).*)',
  ],
};

