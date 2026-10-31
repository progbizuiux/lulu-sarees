import { NextResponse } from "next/server";

// Server-side first check for private pages: no session cookie means redirect to login before the page loads.
// Switched off until AUTH_COOKIE_NAME is set (and mock mode is off). Then the cookie must be on
// this site's domain (e.g. set for .lulusarees.com), otherwise the server can't see it.
// RequireAuth still runs in the browser, and the backend still checks every request.
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME;
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export function middleware(request) {
  if (!AUTH_COOKIE_NAME || USE_MOCKS) return NextResponse.next();
  if (request.cookies.has(AUTH_COOKIE_NAME)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname + search);
  return NextResponse.redirect(loginUrl);
}

// Only these paths run the middleware. Add new private pages here too.
export const config = {
  matcher: [
    "/my-account",
    "/my-account-orders",
    "/my-account-orders-details",
    "/my-account-address",
    "/order-complete", // the ERP's payment status needs a login
  ],
};
