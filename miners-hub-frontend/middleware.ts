import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, isPublicRoute, isAuthRoute, isProtectedRoute } from "@/lib/constants/routes";

/**
 * Route protection middleware
 * Implements route protection logic foundation
 * Will be enhanced with actual auth check in Story 1.5
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // TODO: Replace with actual auth check in Story 1.5
  // For now, this is a placeholder that will redirect to login
  // when actual auth is implemented
  const isAuthenticated = false; // Placeholder - will check AuthContext/token in Story 1.5

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

