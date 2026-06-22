'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Listing, Contract, ContractStatus, Order, Task } from '../../lib/types';
import { MARKETPLACE_LISTINGS_DATA, CONTRACTS_DATA } from '../../lib/constants/data';
import Link from 'next/link';

const StatCard: React.FC<{ title: string; value: string | number | React.ReactNode; icon: React.ReactNode; link?: string }> = ({ title, value, icon, link }) => (
    <div className="bg-secondary p-6 rounded-lg border border-border hover:border-accent/50 transition-colors">
        <div className="flex items-center space-x-4">
            <div className="bg-border p-3 rounded-full text-accent flex-shrink-0">{icon}</div>
            <div>
                <p className="text-sm text-text-muted">{title}</p>
                <div className="text-2xl font-bold text-text-primary">{value}</div>
            </div>
        </div>
        {link && (
            <Link href={link} className="mt-4 block text-xs text-accent hover:underline font-semibold">
                View all →
            </Link>
        )}
    </div>
);

export const OverviewContent: React.FC = () => {
    const { currentUser, setPage } = useAuth();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [myContracts, setMyContracts] = useState<Contract[]>([]);
    const [myTasks, setMyTasks] = useState<Task[]>([]);

    useEffect(() => {
        if (!currentUser) return;
        try {
            const allListings: Listing[] = JSON.parse(localStorage.getItem('miners_hub_listings') || JSON.stringify(MARKETPLACE_LISTINGS_DATA));
            setMyListings(allListings.filter(l => l.minerId === currentUser.id));
            const allOrders: Order[] = JSON.parse(localStorage.getItem('miners_hub_orders') || '[]');
            setMyOrders(allOrders.filter(o => o.buyerId === currentUser.id || o.sellerId === currentUser.id));
            const allContracts: Contract[] = JSON.parse(localStorage.getItem('miners_hub_contracts') || JSON.stringify(CONTRACTS_DATA));
            setMyContracts(allContracts.filter(c => c.minerId === currentUser.id || c.investorId === currentUser.id));
            setMyTasks(currentUser.tasks || []);
        } catch (e) { /* silent */ }
    }, [currentUser]);

    if (!currentUser) return null;

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'verified': return <span className="bg-green-500/20 text-green-400 text-sm font-semibold px-2.5 py-1 rounded-full">Verified</span>;
            case 'pending': return <span className="bg-yellow-500/20 text-yellow-400 text-sm font-semibold px-2.5 py-1 rounded-full">Pending Review</span>;
            case 'rejected': return <span className="bg-red-500/20 text-red-400 text-sm font-semibold px-2.5 py-1 rounded-full">Rejected</span>;
            default: return <span className="bg-gray-500/20 text-gray-400 text-sm font-semibold px-2.5 py-1 rounded-full">New</span>;
        }
    };

    const activeContracts = myContracts.filter(c => c.status === ContractStatus.ACTIVE).length;
    const pendingTasks = myTasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;

    return (
        <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">Account Overview</h1>
            <p className="text-text-muted mb-8">Welcome back, <span className="text-accent font-semibold">{currentUser.name}</span>.</p>

            {!currentUser.onboardingComplete && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 p-4 rounded-lg mb-8 flex items-center justify-between flex-wrap gap-4" role="alert">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        <div>
                            <p className="font-bold">Action Required</p>
                            <p className="text-sm opacity-80">Complete your onboarding to unlock all features.</p>
                        </div>
                    </div>
                    <button onClick={() => setPage('onboarding')} className="bg-accent text-accent-content font-semibold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors text-sm flex-shrink-0">
                        Start Onboarding
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <StatCard title="Account Status" value={getStatusChip(currentUser.status)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <StatCard title="Total Orders" value={myOrders.length} link="/orders" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} />
                <StatCard title="Active Contracts" value={activeContracts} link="/contracts" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} />
                {currentUser.role === 'miner' && <>
                    <StatCard title="Active Listings" value={myListings.length} link="/listings" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>} />
                    <StatCard title="Pending Tasks" value={pendingTasks} link="/tasks" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
                </>}
                {currentUser.role === 'investor' && (
                    <StatCard title="Total Transactions" value={currentUser.transactions?.length || 0} link="/transactions" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} />
                )}
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/profile" className="bg-secondary p-5 rounded-lg border border-border text-left hover:border-accent transition-colors group">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">👤</span>
                        <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors">Edit Profile</h4>
                    </div>
                    <p className="text-sm text-text-muted">Update your personal & business details.</p>
                </Link>
                <Link href="/contracts" className="bg-secondary p-5 rounded-lg border border-border text-left hover:border-accent transition-colors group">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">📝</span>
                        <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors">Contracts</h4>
                    </div>
                    <p className="text-sm text-text-muted">View and manage your contracts.</p>
                </Link>
                <Link href="/marketplace" className="bg-secondary p-5 rounded-lg border border-border text-left hover:border-accent transition-colors group">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🛒</span>
                        <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors">Marketplace</h4>
                    </div>
                    <p className="text-sm text-text-muted">Browse mineral listings.</p>
                </Link>
                {currentUser.role === 'miner' && (
                    <Link href="/listings" className="bg-secondary p-5 rounded-lg border border-border text-left hover:border-accent transition-colors group">
                        <div className="flex items-center space-x-3 mb-2">
                            <span className="text-2xl">📑</span>
                            <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors">My Listings</h4>
                        </div>
                        <p className="text-sm text-text-muted">Manage your mineral listings.</p>
                    </Link>
                )}
            </div>
        </div>
    );
};

export default OverviewContent;
