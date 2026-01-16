import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is a dashboard route
  if (pathname.startsWith('/dashboard')) {
    // Client-side authentication (Redux + LocalStorage) is the primary source of truth.
    // Middleware here acts as a preliminary check or a placeholder for future cookie-based strict auth.
    // Since we don't have HttpOnly cookies for tokens yet, we allow the request to pass 
    // and let the DashboardLayout client component handle the redirect if not authenticated.

    // Future improvement: Sync Redux auth state to a cookie to enable strict server-side redirects here.
    // const token = request.cookies.get('token')?.value;
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
