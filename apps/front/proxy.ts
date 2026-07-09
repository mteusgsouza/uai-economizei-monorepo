import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/profile', '/orders', '/cart', '/checkout'];
const authPaths = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isLoggedIn = request.cookies.get('logged_in')?.value === '1';

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (authPaths.some((p) => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/profile/:path*',
    '/orders/:path*',
    '/cart/:path*',
    '/checkout/:path*',
  ],
};
