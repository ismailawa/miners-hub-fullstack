'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function OnboardingGroup({ children }: { children: React.ReactNode }) {
    const { isLoading, currentUser } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
        const returnUrl = encodeURIComponent(pathname || '/');
        router.push(`/login?redirect=${returnUrl}`);
        return (
            <div className="bg-primary text-text-secondary min-h-screen flex items-center justify-center">
                <p className="text-lg font-semibold">Redirecting to login...</p>
            </div>
        );
    }

    return <>{children}</>;
}
