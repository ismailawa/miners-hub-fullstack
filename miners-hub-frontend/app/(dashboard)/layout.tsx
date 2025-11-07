"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES, isProtectedRoute as checkIsProtectedRoute } from "@/lib/constants/routes";
import { useAuth } from "@/lib/contexts/AuthContext";

/**
 * Protected Dashboard Layout
 * Implements route protection using AuthContext
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (isLoading) return;

    // Redirect to login if not authenticated and on protected route
    if (!isAuthenticated && checkIsProtectedRoute(pathname)) {
      // Use relative path for SSR safety
      const loginUrl = `${ROUTES.LOGIN}?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold">Dashboard</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Link
                href={ROUTES.DASHBOARD}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 min-h-[44px] flex items-center px-2 sm:px-0"
              >
                Dashboard
              </Link>
              <Link
                href={ROUTES.PROFILE}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 min-h-[44px] flex items-center px-2 sm:px-0"
              >
                Profile
              </Link>
              <Link
                href={ROUTES.CONTRACTS}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 min-h-[44px] flex items-center px-2 sm:px-0"
              >
                Contracts
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-4 sm:py-8">{children}</main>
    </div>
  );
}

