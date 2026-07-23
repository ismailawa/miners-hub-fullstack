"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import BrandLoader from "../../components/BrandLoader";

export default function OnboardingGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, currentUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const hasRedirected = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && mounted && !currentUser && !hasRedirected.current) {
      hasRedirected.current = true;
      const returnUrl = encodeURIComponent(pathname || "/");
      router.replace(`/login?redirect=${returnUrl}`);
    }
  }, [currentUser, isLoading, mounted, pathname, router]);

  // Show loading state while checking auth
  if (isLoading || !mounted) {
    return <BrandLoader fullScreen label="Preparing onboarding" />;
  }

  // Redirect to login if accessing protected route without auth
  if (!currentUser) {
    return (
      <div className="bg-primary text-text-secondary min-h-screen flex items-center justify-center">
        <p className="text-lg font-semibold">Redirecting to login...</p>
      </div>
    );
  }

  return <>{children}</>;
}
