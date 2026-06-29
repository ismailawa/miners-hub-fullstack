'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';
import { useGlobalSearch, SearchResult } from '../hooks/useGlobalSearch';

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }> = ({ href, children, onClick }) => (
    <a href={href} onClick={onClick} className="text-text-secondary hover:text-accent transition-colors duration-300">
        {children}
    </a>
);

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('miners-hub-theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('miners-hub-theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-accent transition-colors"
            aria-label="Toggle theme"
        >
            {isDark ? (
                // Sun icon for switching to light mode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
                // Moon icon for switching to dark mode
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
        </button>
    );
};


const UserMenu: React.FC = () => {
    const { currentUser, logout, setPage } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!currentUser) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-accent font-bold focus:outline-none focus:ring-2 focus:ring-accent overflow-hidden"
            >
                {currentUser.profileImageUrl ? (
                    <img src={currentUser.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    getInitials(currentUser.name)
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-md shadow-lg py-1 border border-border z-50">
                    <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm text-text-primary font-semibold truncate">{currentUser.name}</p>
                        <p className="text-xs text-text-muted truncate">{currentUser.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            setPage('dashboard');
                            setIsOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-border"
                    >
                        Dashboard
                    </button>
                    <button
                        onClick={() => {
                            setPage('profile');
                            setIsOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-border"
                    >
                        My Profile
                    </button>
                    <button
                        onClick={() => {
                            logout();
                            setIsOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-border"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};

const serviceLinks = [
    {
        page: 'services',
        label: 'Our Services',
        description: 'An overview of our comprehensive solutions.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    {
        page: 'logistics',
        label: 'Logistics & Transport',
        description: 'From mine to market, seamlessly and securely.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10" /></svg>
    },
    {
        page: 'warehousing',
        label: 'Warehousing & Storage',
        description: 'Secure facilities for your valuable assets.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    },
];

const resourceLinks = [
    {
        page: 'news',
        label: 'News',
        description: 'Latest industry updates and market analysis.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6M7 8h6" /></svg>
    },
    {
        page: 'forum',
        label: 'Miner Forum',
        description: 'Connect with peers and discuss industry topics.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2m6-1a1 1 0 00-1-1H5a2 2 0 00-2 2v10a2 2 0 002 2h11l5 5V7a2 2 0 00-2-2z" /></svg>
    },
    {
        page: 'data-analytics',
        label: 'Data & Analytics',
        description: 'Visualize market trends and production data.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    },
    {
        page: 'registration-guide',
        label: 'Registration Guide',
        description: 'Step-by-step guide for legal compliance.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    },
    {
        page: 'knowledge-base',
        label: 'Knowledge Base',
        description: 'Find articles and answers to common questions.',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
    },
];

const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { currentUser, logout, setPage } = useAuth();
    const [isServicesExpanded, setIsServicesExpanded] = useState(false);
    const [isResourcesExpanded, setIsResourcesExpanded] = useState(false);

    const handleNavClick = (page: string) => {
        setPage(page);
        onClose();
    };

    return (
        <div
            className={`fixed inset-0 z-50 lg:hidden transform transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm" onClick={onClose}></div>

            {/* Menu Panel */}
            <div className={`relative z-10 bg-secondary w-80 max-w-[80vw] h-full float-right p-6 flex flex-col shadow-2xl
                transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-bold text-text-primary">Menu</span>
                    <button onClick={onClose} className="p-2 -mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="relative mb-6">
                    <input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-primary text-text-primary placeholder-text-muted border border-border rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                </div>

                <nav className="flex flex-col space-y-4">
                    <button onClick={() => handleNavClick('marketplace')} className="text-lg text-left text-text-secondary hover:text-accent transition-colors">Marketplace</button>

                    <div>
                        <button onClick={() => setIsServicesExpanded(!isServicesExpanded)} className="w-full flex justify-between items-center text-lg text-left text-text-secondary hover:text-accent transition-colors">
                            <span>Services</span>
                            <svg className={`w-5 h-5 transform transition-transform ${isServicesExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        {isServicesExpanded && (
                            <div className="pl-2 mt-2 space-y-1 border-l-2 border-border">
                                {serviceLinks.map(link => (
                                    <button
                                        key={link.page}
                                        onClick={() => handleNavClick(link.page)}
                                        className="w-full text-left p-2 rounded-md hover:bg-border/50 transition-colors flex items-start space-x-4"
                                    >
                                        <div className="flex-shrink-0 mt-1 text-accent">{link.icon}</div>
                                        <div>
                                            <p className="font-medium text-text-primary">{link.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <button onClick={() => setIsResourcesExpanded(!isResourcesExpanded)} className="w-full flex justify-between items-center text-lg text-left text-text-secondary hover:text-accent transition-colors">
                            <span>Resources</span>
                            <svg className={`w-5 h-5 transform transition-transform ${isResourcesExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                        </button>
                        {isResourcesExpanded && (
                            <div className="pl-2 mt-2 space-y-1 border-l-2 border-border">
                                {resourceLinks.map(link => (
                                    <button
                                        key={link.page}
                                        onClick={() => handleNavClick(link.page)}
                                        className="w-full text-left p-2 rounded-md hover:bg-border/50 transition-colors flex items-start space-x-4"
                                    >
                                        <div className="flex-shrink-0 mt-1 text-accent">{link.icon}</div>
                                        <div>
                                            <p className="font-medium text-text-primary">{link.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-border">
                    {currentUser ? (
                        <div className="space-y-4">
                            <div className="px-1">
                                <p className="text-sm text-text-primary font-semibold truncate">{currentUser.name}</p>
                                <p className="text-xs text-text-muted truncate">{currentUser.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setPage('profile');
                                    onClose();
                                }}
                                className="w-full text-left bg-border/50 hover:bg-border text-text-primary font-semibold py-2.5 px-4 rounded-md transition-colors"
                            >
                                My Profile
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="w-full text-left bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold py-2.5 px-4 rounded-md transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setPage('login');
                                    onClose();
                                }}
                                className="w-full bg-border text-text-primary font-semibold py-2.5 rounded-md hover:bg-border/80 transition-colors"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => {
                                    setPage('register');
                                    onClose();
                                }}
                                className="w-full bg-accent text-accent-content font-semibold py-2.5 rounded-md hover:bg-yellow-400 transition-colors"
                            >
                                Register
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const Header: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    const { unreadCount } = useNotification();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isResourcesOpen, setIsResourcesOpen] = useState(false);
    const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
    const servicesTimeoutRef = useRef<number | null>(null);
    const resourcesTimeoutRef = useRef<number | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchResults = useGlobalSearch(searchQuery);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close search on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSelect = (result: SearchResult) => {
        setIsSearchFocused(false);
        setSearchQuery('');
        // Handle navigation based on result type
        // For simplicity, we'll just set the page if it aligns with existing routing logic, 
        // or assumes the routing is handled via Next.js Links mostly, but here we update 'page' state for internal routing mock.
        // In a real Next.js app, we'd use router.push(result.link).

        // Mapping links to 'pages' where applicable for the current simplified routing
        if (result.category === 'miners') {
            // In a real app: router.push(`/miners/${result.id}`);
            // Navigation handled by setPage
        } else if (result.category === 'listings') {
            setPage('marketplace');
        } else if (result.category === 'news') {
            setPage('news');
        } else if (result.category === 'events') {
            // setPage('events'); // usage
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Disable body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isMobileMenuOpen]);

    const handleServicesMouseEnter = () => {
        if (servicesTimeoutRef.current) {
            clearTimeout(servicesTimeoutRef.current);
        }
        setIsServicesOpen(true);
    };

    const handleServicesMouseLeave = () => {
        servicesTimeoutRef.current = window.setTimeout(() => {
            setIsServicesOpen(false);
        }, 200);
    };

    const handleResourcesMouseEnter = () => {
        if (resourcesTimeoutRef.current) {
            clearTimeout(resourcesTimeoutRef.current);
        }
        setIsResourcesOpen(true);
    };

    const handleResourcesMouseLeave = () => {
        resourcesTimeoutRef.current = window.setTimeout(() => {
            setIsResourcesOpen(false);
        }, 200); // Small delay to allow moving cursor to dropdown
    };

    return (
        <>
            <header className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-secondary/80 backdrop-blur-lg border-b border-border' : 'bg-transparent'}`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <button onClick={() => setPage('home')} className="flex items-center space-x-2">
                            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <span className="text-2xl font-bold text-text-primary">Miners Hub</span>
                        </button>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            <button onClick={() => setPage('marketplace')} className="text-text-secondary hover:text-accent transition-colors duration-300">Marketplace</button>

                            <div className="relative" onMouseEnter={handleServicesMouseEnter} onMouseLeave={handleServicesMouseLeave}>
                                <button className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors duration-300">
                                    <span>Services</span>
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isServicesOpen && (
                                    <div className="absolute top-full mt-2 w-96 bg-secondary rounded-lg shadow-lg border border-border z-50 p-4">
                                        <div className="space-y-2">
                                            {serviceLinks.map(link => (
                                                <button
                                                    key={link.page}
                                                    onClick={() => {
                                                        setPage(link.page);
                                                        setIsServicesOpen(false);
                                                    }}
                                                    className="w-full text-left p-3 rounded-md hover:bg-border transition-colors flex items-start space-x-4"
                                                >
                                                    <div className="flex-shrink-0 mt-1 text-accent">
                                                        {link.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-text-primary">{link.label}</p>
                                                        <p className="text-sm text-text-muted">{link.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="relative" onMouseEnter={handleResourcesMouseEnter} onMouseLeave={handleResourcesMouseLeave}>
                                <button className="flex items-center space-x-1 text-text-secondary hover:text-accent transition-colors duration-300">
                                    <span>Resources</span>
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                                {isResourcesOpen && (
                                    <div className="absolute top-full mt-2 w-96 bg-secondary rounded-lg shadow-lg border border-border z-50 p-4">
                                        <div className="space-y-2">
                                            {resourceLinks.map(link => (
                                                <button
                                                    key={link.page}
                                                    onClick={() => {
                                                        setPage(link.page);
                                                        setIsResourcesOpen(false);
                                                    }}
                                                    className="w-full text-left p-3 rounded-md hover:bg-border transition-colors flex items-start space-x-4"
                                                >
                                                    <div className="flex-shrink-0 mt-1 text-accent">
                                                        {link.icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-text-primary">{link.label}</p>
                                                        <p className="text-sm text-text-muted">{link.description}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </nav>

                        {/* Desktop Search & Auth */}
                        <div className="hidden lg:flex items-center space-x-4">
                            <div className="relative" ref={searchRef}>
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    className="bg-primary text-text-primary placeholder-text-muted border border-border rounded-full py-2 pl-10 pr-4 w-64 focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>

                                {/* Search Results Dropdown */}
                                {isSearchFocused && searchQuery.length >= 2 && (
                                    <div className="absolute top-full mt-2 w-96 bg-secondary rounded-lg shadow-xl border border-border z-50 overflow-hidden max-h-[80vh] overflow-y-auto">
                                        {searchResults.length > 0 ? (
                                            <div>
                                                {(['miners', 'listings', 'news', 'events', 'webinars'] as const).map(category => {
                                                    const categoryResults = searchResults.filter(r => r.category === category);
                                                    if (categoryResults.length === 0) return null;

                                                    return (
                                                        <div key={category} className="border-b border-border last:border-none">
                                                            <div className="bg-secondary/50 px-4 py-2 text-xs font-bold text-text-secondary uppercase tracking-wider sticky top-0">
                                                                {category}
                                                            </div>
                                                            {categoryResults.map(result => (
                                                                <button
                                                                    key={result.id}
                                                                    onClick={() => handleSearchSelect(result)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-border/50 transition-colors flex items-start space-x-3"
                                                                >
                                                                    {result.imageUrl && (
                                                                        <img src={result.imageUrl} alt="" className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-sm font-medium text-text-primary truncate">{result.title}</p>
                                                                        {result.description && (
                                                                            <p className="text-xs text-text-muted truncate">{result.description}</p>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="p-4 text-center text-text-muted">
                                                No results found for "{searchQuery}"
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <button onClick={() => setIsNotificationCenterOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-accent transition-colors" aria-label="Notifications">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
                                </button>
                                {isNotificationCenterOpen && <NotificationCenter onClose={() => setIsNotificationCenterOpen(false)} />}
                            </div>
                            <ThemeToggle />
                            {currentUser ? (
                                <UserMenu />
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setPage('login')} className="px-4 py-2 text-text-secondary hover:text-accent transition-colors">Login</button>
                                    <button onClick={() => setPage('register')} className="bg-accent text-accent-content font-semibold px-4 py-2 rounded-md hover:bg-yellow-400 transition-colors">Register</button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="lg:hidden flex items-center space-x-2">
                            <ThemeToggle />
                            <div className="relative">
                                <button onClick={() => setIsNotificationCenterOpen(prev => !prev)} className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-text-muted hover:text-accent transition-colors" aria-label="Notifications">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>}
                                </button>
                                {isNotificationCenterOpen && <NotificationCenter onClose={() => setIsNotificationCenterOpen(false)} />}
                            </div>
                            {currentUser && <UserMenu />}
                            <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open menu" className="p-2">
                                <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        </>
    );
};

export default Header;