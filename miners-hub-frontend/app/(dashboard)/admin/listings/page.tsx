'use client';

import React, { useEffect, useState } from 'react';
import { getListings, updateListingStatus, AdminListing } from '../../../../lib/api/admin';
import { useAuth } from '../../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '../../../../lib/currency';

export default function AdminListingsPage() {
    const { currentUser } = useAuth();
    const router = useRouter();
    const [listings, setListings] = useState<AdminListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchListings = async () => {
            try {
                // Fetch listings that are submitted or under review. For now fetch all to see.
                const data = await getListings();
                setListings(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch listings');
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.role === 'admin') {
            fetchListings();
        }
    }, [currentUser, router]);

    const handleApprove = async (id: string, status: string) => {
        try {
            await updateListingStatus(id, status);
            setListings(listings.map(l => l.id === id ? { ...l, status } : l));
        } catch (err: any) {
            alert(err.message || 'Failed to update listing status');
        }
    };

    if (loading) return <div className="p-8">Loading listings...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-text-primary">Listing Approvals</h1>
            <p className="text-text-secondary">Approve or reject mineral listings submitted by miners.</p>

            <div className="bg-secondary rounded-xl border border-border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-primary/50 text-text-secondary text-sm">
                            <th className="p-4 font-semibold border-b border-border">Mineral</th>
                            <th className="p-4 font-semibold border-b border-border">Miner</th>
                            <th className="p-4 font-semibold border-b border-border">Quantity / Price</th>
                            <th className="p-4 font-semibold border-b border-border">Status</th>
                            <th className="p-4 font-semibold border-b border-border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {listings.map((listing) => (
                            <tr key={listing.id} className="border-b border-border hover:bg-primary/30 transition-colors">
                                <td className="p-4 text-sm font-medium capitalize">{listing.mineralType.replace('_', ' ')}</td>
                                <td className="p-4 text-sm text-text-secondary">
                                    {listing.miner?.companyName || listing.miner?.user?.name || 'Unknown'}
                                </td>
                                <td className="p-4 text-sm">
                                    {listing.quantity} tons @ {formatCurrency(listing.price)}/ton
                                </td>
                                <td className="p-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        listing.status === 'published' ? 'bg-green-100 text-green-800' :
                                        listing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {listing.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-sm">
                                    {(listing.status === 'submitted' || listing.status === 'under_review' || listing.status === 'draft') && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(listing.id, 'published')}
                                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleApprove(listing.id, 'archived')}
                                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {listings.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-text-muted">
                                    No listings found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
