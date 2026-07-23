'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getChatThreads } from '../lib/api/chats';
import { onChatMessage, onChatThreadUpdate } from '../lib/api/chat-socket';
import BrandLogo from './BrandLogo';

// ── SVG Icon Components ───────────────────────────────────────────────────────
const Icons = {
    Overview: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
    ),
    Profile: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    Contracts: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
    ),
    Orders: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
    ),
    Transactions: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
    ),
    Messages: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.142-4.03 7.5-9 7.5a10.8 10.8 0 01-3.86-.7L3 20.25l1.45-3.63C3.53 15.33 3 13.72 3 12c0-4.142 4.03-7.5 9-7.5s9 3.358 9 7.5z" />
        </svg>
    ),
    Listings: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
    ),
    Tasks: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    MineSites: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75l-6 2.25v11.25l6-2.25m0-11.25l6 2.25m-6-2.25v11.25m6-9l6-2.25v11.25l-6 2.25m0-11.25v11.25" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75h.008v.008H12v-.008z" />
        </svg>
    ),
    Marketplace: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
        </svg>
    ),
    Logout: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        </svg>
    ),
    Menu: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    ),
    Bell: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    Logo: () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.584 2.376a.75.75 0 01.832 0l9 6a.75.75 0 11-.832 1.248L12 3.901 3.416 9.624a.75.75 0 01-.832-1.248l9-6z" />
            <path fillRule="evenodd" d="M20.25 10.332v9.918H21a.75.75 0 010 1.5H3a.75.75 0 010-1.5h.75v-9.918a.75.75 0 01.634-.74A49.109 49.109 0 0112 9c2.59 0 5.134.202 7.616.592a.75.75 0 01.634.74zm-7.5 2.418a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75zm3-.75a.75.75 0 01.75.75v6.75a.75.75 0 01-1.5 0v-6.75a.75.75 0 01.75-.75zM9 12.75a.75.75 0 00-1.5 0v6.75a.75.75 0 001.5 0v-6.75z" clipRule="evenodd" />
        </svg>
    ),
};

type NavItem = {
    name: string;
    href: string;
    icon: React.FC;
    section?: string;
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { currentUser, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const loadUnreadMessages = useCallback(async () => {
        if (!currentUser) {
            setUnreadMessages(0);
            return;
        }

        try {
            const threads = await getChatThreads();
            setUnreadMessages(threads.reduce((total, thread) => total + thread.unreadCount, 0));
        } catch {
            setUnreadMessages(0);
        }
    }, [currentUser]);

    useEffect(() => {
        void loadUnreadMessages();
        const interval = window.setInterval(() => {
            void loadUnreadMessages();
        }, 30000);
        const offMessage = onChatMessage(() => {
            void loadUnreadMessages();
        });
        const offThreadUpdate = onChatThreadUpdate(() => {
            void loadUnreadMessages();
        });
        const handleUnreadChanged = () => {
            void loadUnreadMessages();
        };
        window.addEventListener('chat:unread-changed', handleUnreadChanged);

        return () => {
            window.clearInterval(interval);
            offMessage();
            offThreadUpdate();
            window.removeEventListener('chat:unread-changed', handleUnreadChanged);
        };
    }, [loadUnreadMessages]);

    const mainNavItems: NavItem[] = [
        { name: 'Overview', href: '/dashboard', icon: Icons.Overview },
        { name: 'Messages', href: '/messages', icon: Icons.Messages },
        { name: 'Profile Settings', href: '/profile', icon: Icons.Profile },
    ];

    const financeNavItems: NavItem[] = [
        { name: 'Contracts', href: '/contracts', icon: Icons.Contracts },
        { name: 'My Orders', href: '/orders', icon: Icons.Orders },
        { name: 'Logistics', href: '/logistics-management', icon: Icons.MineSites },
        { name: 'Laboratory Results', href: '/lab-results', icon: Icons.Contracts },
        { name: 'Mineral Passports', href: '/mineral-passports', icon: Icons.Tasks },
        { name: 'Revenue Analytics', href: '/revenue-analytics', icon: Icons.Transactions },
        { name: 'Transactions', href: '/transactions', icon: Icons.Transactions },
    ];

    const minerNavItems: NavItem[] = currentUser?.role === 'miner' ? [
        { name: 'Mine Sites', href: '/mine-sites', icon: Icons.MineSites },
        { name: 'Production Reports', href: '/production-reports', icon: Icons.Tasks },
        { name: 'Compliance', href: '/compliance', icon: Icons.Contracts },
        { name: 'Environmental Records', href: '/environmental-records', icon: Icons.MineSites },
        { name: 'My Listings', href: '/listings', icon: Icons.Listings },
        { name: 'Task Management', href: '/tasks', icon: Icons.Tasks },
    ] : [];

    const exploreNavItems: NavItem[] = [
        { name: 'Marketplace', href: '/marketplace', icon: Icons.Marketplace },
        { name: 'Investor Opportunities', href: '/investor-opportunities', icon: Icons.Transactions },
    ];

    const adminNavItems: NavItem[] = currentUser?.role === 'admin' ? [
        { name: 'Miner Registry', href: '/admin/miner-registry', icon: Icons.Profile },
        { name: 'Mine Sites', href: '/mine-sites', icon: Icons.MineSites },
        { name: 'Production Reports', href: '/production-reports', icon: Icons.Tasks },
        { name: 'Compliance', href: '/compliance', icon: Icons.Contracts },
        { name: 'Environmental Records', href: '/environmental-records', icon: Icons.MineSites },
        { name: 'Revenue Analytics', href: '/revenue-analytics', icon: Icons.Transactions },
        { name: 'Logistics', href: '/logistics-management', icon: Icons.MineSites },
        { name: 'User Management', href: '/admin/users', icon: Icons.Profile },
        { name: 'Listing Approvals', href: '/admin/listings', icon: Icons.Listings },
        { name: 'Orders', href: '/admin/orders', icon: Icons.Orders },
        { name: 'KYC Documents', href: '/admin/documents', icon: Icons.Contracts },
        { name: 'Events', href: '/admin/events', icon: Icons.Tasks },
    ] : [];

    const regulatorNavItems: NavItem[] = currentUser?.role === 'government' ? [
        { name: 'Mine Sites', href: '/mine-sites', icon: Icons.MineSites },
        { name: 'Production Reports', href: '/production-reports', icon: Icons.Tasks },
        { name: 'Compliance', href: '/compliance', icon: Icons.Contracts },
        { name: 'Environmental Records', href: '/environmental-records', icon: Icons.MineSites },
        { name: 'Revenue Analytics', href: '/revenue-analytics', icon: Icons.Transactions },
    ] : [];

    const navSections = [
        { label: 'Main', items: mainNavItems },
        ...(adminNavItems.length > 0 ? [{ label: 'Adminstration', items: adminNavItems }] : []),
        ...(regulatorNavItems.length > 0 ? [{ label: 'Regulator', items: regulatorNavItems }] : []),
        { label: 'Finance', items: financeNavItems },
        ...(minerNavItems.length > 0 ? [{ label: 'Operations', items: minerNavItems }] : []),
        { label: 'Explore', items: exploreNavItems },
    ];

    const pageTitles: Record<string, string> = {
        '/dashboard': 'Overview',
        '/messages': 'Messages',
        '/profile': 'Profile Settings',
        '/contracts': 'Contracts',
        '/orders': 'My Orders',
        '/transactions': 'Transaction History',
        '/mine-sites': 'Mine Sites Map',
        '/production-reports': 'Production Reports',
        '/compliance': 'Licensing & Compliance',
        '/environmental-records': 'Environmental Monitoring',
        '/revenue-analytics': 'Revenue Analytics',
        '/logistics-management': 'Logistics Management',
        '/lab-results': 'Laboratory Results',
        '/mineral-passports': 'Mineral Passports',
        '/listings': 'My Listings',
        '/tasks': 'Task Management',
        '/marketplace': 'Marketplace',
        '/investor-opportunities': 'Investor Opportunities',
        '/admin/miner-registry': 'Miner Registry',
        '/admin/users': 'User Management',
        '/admin/listings': 'Listing Approvals',
        '/admin/orders': 'Orders',
        '/admin/documents': 'KYC Documents',
        '/admin/events': 'Events',
    };
    const pageTitle = pageTitles[pathname || ''] || (pathname?.split('/').pop()?.replace(/-/g, ' ') || 'Dashboard');

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.href;
        return (
            <Link
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group text-sm ${
                    isActive
                    ? 'bg-accent/15 text-accent font-semibold'
                    : 'text-text-secondary hover:bg-primary hover:text-text-primary'
                }`}
            >
                <span className={`mr-3 flex-shrink-0 transition-colors ${isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-primary'}`}>
                    <item.icon />
                </span>
                <span className="truncate">{item.name}</span>
                {item.href === '/messages' && unreadMessages > 0 && (
                    <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-accent text-accent-content text-[11px] font-bold flex items-center justify-center">
                        {unreadMessages > 99 ? '99+' : unreadMessages}
                    </span>
                )}
                {isActive && item.href !== '/messages' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />}
            </Link>
        );
    };

    return (
        <div className="h-screen w-full flex bg-primary text-text-primary font-sans overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-secondary border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center px-5 border-b border-border flex-shrink-0">
                    <Link href="/" className="flex items-center space-x-2.5">
                        <BrandLogo size="sm" />
                    </Link>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-5 px-3 overflow-y-auto space-y-6">
                    {navSections.map(section => (
                        <div key={section.label}>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 px-3">
                                {section.label}
                            </p>
                            <div className="space-y-0.5">
                                {section.items.map(item => (
                                    <NavLink key={item.name} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Footer */}
                <div className="p-3 border-t border-border flex-shrink-0">
                    <button
                        onClick={() => logout()}
                        className="flex items-center w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
                    >
                        <span className="mr-3 flex-shrink-0 opacity-80 group-hover:opacity-100">
                            <Icons.Logout />
                        </span>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top Navbar */}
                <header className="h-16 bg-secondary border-b border-border flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-30">
                    <div className="flex items-center">
                        <button
                            className="mr-4 p-2 rounded-lg hover:bg-primary md:hidden text-text-secondary transition-colors"
                            onClick={toggleMobileMenu}
                            aria-label="Open menu"
                        >
                            <Icons.Menu />
                        </button>

                        <h2 className="text-base font-semibold capitalize hidden sm:block tracking-tight">
                            {pageTitle}
                        </h2>
                    </div>

                    <div className="flex items-center space-x-2">
                        {/* Notifications */}
                        <button className="p-2 text-text-secondary hover:text-accent hover:bg-primary rounded-lg transition-colors relative" aria-label="Notifications">
                            <Icons.Bell />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-secondary rounded-full"></span>
                        </button>

                        <div className="h-6 w-px bg-border mx-1"></div>

                        {/* User Profile */}
                        <Link href="/profile" className="flex items-center space-x-2.5 pl-1 pr-2 py-1.5 rounded-lg hover:bg-primary transition-colors">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold leading-tight">{currentUser?.name}</p>
                                <p className="text-xs text-text-muted leading-tight capitalize">{currentUser?.role || 'Guest'}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm border border-accent/30 overflow-hidden flex-shrink-0">
                                {currentUser?.profileImageUrl ? (
                                    <img src={currentUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    currentUser?.name?.charAt(0).toUpperCase() || '?'
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Inner Scrollable Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-primary">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
