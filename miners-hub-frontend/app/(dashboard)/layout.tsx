'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { canAccessDashboardPath } from '../../lib/permissions';

export default function DashboardGroup({ children }: { children: React.ReactNode }) {
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
            const returnUrl = encodeURIComponent(pathname || '/');
            router.replace(`/login?redirect=${returnUrl}`);
        }
    }, [currentUser, isLoading, mounted, pathname, router]);

    useEffect(() => {
        if (
            !isLoading &&
            mounted &&
            currentUser &&
            !canAccessDashboardPath(currentUser, pathname) &&
            pathname !== '/dashboard'
        ) {
            router.replace('/dashboard');
        }
    }, [currentUser, isLoading, mounted, pathname, router]);

    // Show loading state while checking auth
    if (isLoading || !mounted) {
        return (
            <div className="bg-primary text-text-secondary min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold animate-pulse">Loading Application...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if accessing protected route without auth
    if (!currentUser) {
        return (
            <div className="bg-primary text-text-secondary min-h-screen flex items-center justify-center">
                <p className="text-lg font-semibold">Redirecting to login...</p>
            </div>
        );
    }

    if (!canAccessDashboardPath(currentUser, pathname) && pathname !== '/dashboard') {
        return (
            <div className="bg-primary text-text-secondary min-h-screen flex items-center justify-center">
                <p className="text-lg font-semibold">Redirecting to your dashboard...</p>
            </div>
        );
    }

    return (
        <DashboardLayout>
            {children}
        </DashboardLayout>
    );
}
