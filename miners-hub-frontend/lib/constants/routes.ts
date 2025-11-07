/**
 * Route constants for Miners Hub
 * Centralized route definitions for maintainability
 */

// Public routes
export const ROUTES = {
  // Public routes
  HOME: "/",
  MARKETPLACE: "/marketplace",
  NEWS: "/news",

  // Authentication routes
  LOGIN: "/login",
  REGISTER: "/register",

  // Protected routes (Dashboard)
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CONTRACTS: "/contracts",
} as const;

// Type for route values
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

// Helper to check if route is public
export const isPublicRoute = (path: string): boolean => {
  return (
    path === ROUTES.HOME ||
    path === ROUTES.MARKETPLACE ||
    path === ROUTES.NEWS
  );
};

// Helper to check if route is auth route
export const isAuthRoute = (path: string): boolean => {
  return path === ROUTES.LOGIN || path === ROUTES.REGISTER;
};

// Helper to check if route is protected
export const isProtectedRoute = (path: string): boolean => {
  return (
    path === ROUTES.DASHBOARD ||
    path === ROUTES.PROFILE ||
    path === ROUTES.CONTRACTS
  );
};

