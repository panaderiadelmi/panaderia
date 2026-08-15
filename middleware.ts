import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PATHS   = ['/admin'];
const CLIENTE_PATHS = ['/mi-cuenta'];
const AUTH_PATHS    = ['/login', '/registro'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('__session');
  const isLoggedIn = !!sessionCookie?.value;

  const isAdmin   = ADMIN_PATHS.some(p => pathname.startsWith(p));
  const isCliente = CLIENTE_PATHS.some(p => pathname.startsWith(p));
  const isAuth    = AUTH_PATHS.some(p => pathname.startsWith(p));

  // Rutas protegidas sin sesión → al login
  if ((isAdmin || isCliente) && !isLoggedIn) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Ya logueado intenta ir a login/registro → a home
  if (isAuth && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // La verificación de rol 'administrador' para /admin ocurre en el
  // layout del servidor (app/(admin)/admin/layout.tsx), que puede leer
  // el custom claim del token con Firebase Admin SDK.

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/mi-cuenta/:path*', '/login', '/registro'],
};
