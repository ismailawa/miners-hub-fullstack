import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MARKETPLACE_LISTINGS_DATA, MINERS_DATA, EXPORT_DATA } from '../lib/constants/data';
import { ExportData } from '../lib/types';
import { BackendThread, getChatThreads } from '../lib/api/chats';
import MinerChatModal from './MinerChatModal';
import { formatCurrency } from '../lib/currency';

// A generic Stat Card component for dashboards
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-secondary p-6 rounded-lg border border-border">
        <div className="flex items-center">
            <div className={`p-3 rounded-full bg-${color}-500/10 text-${color}-400 mr-4`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-text-muted">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    </div>
);

// A generic Action Card component
const ActionCard: React.FC<{ title: string; description: string; onClick: () => void; icon: React.ReactNode; }> = ({ title, description, onClick, icon }) => (
    <button onClick={onClick} className="bg-secondary p-6 rounded-lg border border-border text-left hover:border-accent transition-colors duration-200 w-full h-full">
        <div className="flex items-start">
            <div className="text-accent mr-4 mt-1">{icon}</div>
            <div>
                <h4 className="font-bold text-text-primary">{title}</h4>
                <p className="text-sm text-text-muted mt-1">{description}</p>
            </div>
        </div>
    </button>
);

const MessagesPanel: React.FC = () => {
    const [threads, setThreads] = useState<BackendThread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeThread, setActiveThread] = useState<BackendThread | null>(null);

    const loadThreads = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const nextThreads = await getChatThreads();
            setThreads(nextThreads.filter((thread) => thread.participant.id));
        } catch {
            setError('Unable to load messages.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadThreads();
    }, [loadThreads]);

    const formatThreadTime = (createdAt?: string) => {
        if (!createdAt) return '';
        return new Intl.DateTimeFormat('en', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(createdAt));
    };

    return (
        <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-text-primary">Messages</h2>
                <button
                    type="button"
                    onClick={() => void loadThreads()}
                    className="text-sm font-semibold text-accent hover:text-yellow-400 transition-colors"
                >
                    Refresh
                </button>
            </div>

            <div className="bg-secondary border border-border rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-text-secondary">Loading messages...</div>
                ) : error ? (
                    <div className="p-6 text-red-400">{error}</div>
                ) : threads.length === 0 ? (
                    <div className="p-6 text-text-secondary">No investor messages yet.</div>
                ) : (
                    <div className="divide-y divide-border">
                        {threads.map((thread) => (
                            <button
                                key={thread.threadId}
                                type="button"
                                onClick={() => setActiveThread(thread)}
                                className="w-full p-4 text-left hover:bg-primary/70 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-accent font-bold shrink-0">
                                        {thread.participant.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold text-text-primary truncate">{thread.participant.name}</p>
                                            <span className="text-xs text-text-muted shrink-0">{formatThreadTime(thread.latestMessage?.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary truncate mt-1">
                                            {thread.latestMessage?.text || 'No messages yet.'}
                                        </p>
                                    </div>
                                    {thread.unreadCount > 0 && (
                                        <span className="min-w-6 h-6 px-2 rounded-full bg-accent text-accent-content text-xs font-bold flex items-center justify-center">
                                            {thread.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <MinerChatModal
                isOpen={!!activeThread}
                onClose={() => {
                    setActiveThread(null);
                    void loadThreads();
                }}
                miner={activeThread ? {
                    id: activeThread.participant.id,
                    userId: activeThread.participant.id,
                    name: activeThread.participant.name,
                    imageUrl: activeThread.participant.profileImageUrl || '',
                } : null}
            />
        </section>
    );
};


const MinerDashboard: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    // In a real app, this data would be fetched. Here we'll simulate it.
    const myListingsCount = MARKETPLACE_LISTINGS_DATA.filter(l => l.minerId === currentUser?.id).length;

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, {currentUser?.name}!</h1>
            <p className="text-text-secondary mb-8">Here's a snapshot of your mining operations on the platform.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Active Listings" value={myListingsCount.toString()} color="yellow" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                <StatCard title="Pending Contracts" value="1" color="blue" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <StatCard title="Total Revenue" value={formatCurrency(125400)} color="green" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard title="Create New Listing" description="List a new mineral asset on the marketplace." onClick={() => setPage('profile', { initialTab: 'listings' })} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <ActionCard title="Manage Contracts" description="View and manage all your pending and active contracts." onClick={() => setPage('profile', { initialTab: 'contracts' })} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} />
            </div>

            <MessagesPanel />
        </div>
    );
};

const InvestorDashboard: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome, {currentUser?.name}!</h1>
            <p className="text-text-secondary mb-8">Your central hub for mineral investment opportunities.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Active Investments" value="4" color="green" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                <StatCard title="Pending Contracts" value="1" color="blue" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                <StatCard title="Watchlisted Minerals" value="8" color="yellow" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>} />
            </div>

            <h2 className="text-2xl font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ActionCard title="Browse Marketplace" description="Discover new investment opportunities and mineral assets." onClick={() => setPage('marketplace')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
                <ActionCard title="Manage My Profile" description="Update your investment preferences and track your portfolio." onClick={() => setPage('profile')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
            </div>
        </div>
    );
};

const GovernmentDashboard: React.FC = () => {
    const { currentUser, setPage } = useAuth();

    const ExportChart: React.FC<{ data: ExportData[] }> = ({ data }) => {
        const maxVolume = Math.max(...data.map(d => d.volume));
        return (
            <div className="space-y-3">
                {data.slice(0, 5).map(d => (
                    <div key={d.country} className="flex items-center">
                        <span className="w-24 text-sm text-text-secondary truncate">{d.country}</span>
                        <div className="flex-1 bg-primary rounded-full h-4">
                            <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${(d.volume / maxVolume) * 100}%` }}></div>
                        </div>
                        <span className="w-20 text-right text-sm font-semibold">{d.volume.toLocaleString()}k T</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">National Mining Dashboard</h1>
            <p className="text-text-secondary mb-8">An overview of mining activities within {currentUser?.jurisdiction}.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Registered Miners" value={MINERS_DATA.length.toString()} color="blue" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <StatCard title="Total Active Listings" value={MARKETPLACE_LISTINGS_DATA.length.toString()} color="yellow" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                <StatCard title="Export Volume (YTD)" value="8,900k T" color="green" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 11h10" /></svg>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-secondary p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Top Export Destinations (YTD)</h3>
                    <ExportChart data={EXPORT_DATA} />
                </div>
                 <div className="bg-secondary p-6 rounded-lg border border-border">
                    <h3 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h3>
                     <div className="space-y-4">
                        <ActionCard title="View Market Analytics" description="Access detailed production and pricing data." onClick={() => setPage('data-analytics')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
                        <ActionCard title="Compliance Reports" description="Review miner compliance and documentation." onClick={() => alert('Compliance report module coming soon.')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
                    </div>
                </div>
            </div>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const { currentUser } = useAuth();

    const renderDashboard = () => {
        switch(currentUser?.role) {
            case 'miner':
                return <MinerDashboard />;
            case 'investor':
                return <InvestorDashboard />;
            case 'government':
                return <GovernmentDashboard />;
            default:
                // Fallback for users with no role (e.g., during onboarding)
                return <div>Loading your dashboard...</div>;
        }
    };

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary min-h-screen">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                   {renderDashboard()}
                </div>
            </div>
        </main>
    );
};

export default DashboardPage;
