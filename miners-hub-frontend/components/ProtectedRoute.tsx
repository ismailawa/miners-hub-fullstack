"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import BrandLoader from "./BrandLoader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * ProtectedRoute Component
 *
 * Protects routes that require authentication.
 * Redirects to login if user is not authenticated.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
}) => {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && requireAuth && !currentUser) {
      // Redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname || "/");
      router.push(`${redirectTo}?redirect=${returnUrl}`);
    }
  }, [currentUser, isLoading, requireAuth, redirectTo, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return <BrandLoader fullScreen label="Checking your session" />;
  }

  // If auth is required and user is not logged in, don't render children
  // (redirect will happen in useEffect)
  if (requireAuth && !currentUser) {
    return null;
  }

  return <>{children}</>;
};
