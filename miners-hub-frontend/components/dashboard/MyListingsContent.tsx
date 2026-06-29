'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BackendListing, getMyListings, deleteListing } from '../../lib/api/listings';
import CreateListingModal from '../CreateListingModal';
import ConfirmationModal from '../ConfirmationModal';

const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
        submitted: 'bg-amber-500/20 text-amber-400',
        under_review: 'bg-blue-500/20 text-blue-400',
        published: 'bg-green-500/20 text-green-400',
        rejected: 'bg-red-500/20 text-red-400',
        draft: 'bg-border text-text-muted',
        archived: 'bg-border text-text-muted',
    };
    const label: Record<string, string> = {
        submitted: 'Awaiting Review',
        under_review: 'Under Review',
        published: 'Published',
        rejected: 'Rejected',
        draft: 'Draft',
        archived: 'Archived',
    };
    return (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] || 'bg-border text-text-muted'}`}>
            {label[status] || status}
        </span>
    );
};

const ListingManagementCard: React.FC<{
    listing: BackendListing;
    onEdit: (l: BackendListing) => void;
    onDelete: (l: BackendListing) => void;
}> = ({ listing, onEdit, onDelete }) => (
    <div className="bg-primary p-5 rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-grow w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-text-primary text-lg">{listing.mineralType}</p>
                        {statusBadge(listing.status)}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium capitalize">
                            {listing.listingType === 'buy_now' ? 'Buy Now' : 'Auction'}
                        </span>
                    </div>
                    <p className="text-sm text-text-secondary">{listing.location || '—'}</p>
                    {listing.gradePurity && <p className="text-xs text-text-muted mt-0.5">Grade: {listing.gradePurity}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-lg font-semibold text-accent">${listing.price?.toLocaleString()}/tonne</p>
                    <p className="text-sm text-text-secondary">{listing.quantity} tonnes</p>
                </div>
            </div>
        </div>
        <div className="flex sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
            <button
                onClick={() => onEdit(listing)}
                className="flex-1 sm:flex-none justify-center w-full px-3 py-1.5 text-sm rounded-lg bg-border hover:bg-border/80 flex items-center gap-1.5"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                Edit
            </button>
            <button
                onClick={() => onDelete(listing)}
                className="flex-1 sm:flex-none justify-center w-full px-3 py-1.5 text-sm rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1.5"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Delete
            </button>
        </div>
    </div>
);

const MyListingsContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [myListings, setMyListings] = useState<BackendListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [listingToEdit, setListingToEdit] = useState<BackendListing | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<BackendListing | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const data = await getMyListings();
            setMyListings(data);
        } catch (e: any) {
            setError(e?.message || 'Failed to load listings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchListings();
    }, [currentUser]);

    const handleSaveListing = (saved: BackendListing) => {
        setMyListings(prev => {
            const idx = prev.findIndex(l => l.id === saved.id);
            if (idx > -1) {
                const updated = [...prev];
                updated[idx] = saved;
                return updated;
            }
            return [saved, ...prev];
        });
        setIsCreateModalOpen(false);
        setListingToEdit(null);
    };

    const handleDeleteListing = async () => {
        if (!listingToDelete) return;
        setDeleteLoading(true);
        try {
            await deleteListing(listingToDelete.id);
            setMyListings(prev => prev.filter(l => l.id !== listingToDelete.id));
            setIsDeleteModalOpen(false);
            setListingToDelete(null);
        } catch (e: any) {
            setError(e?.message || 'Failed to delete listing.');
        } finally {
            setDeleteLoading(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">My Listings</h1>
                    <p className="text-text-muted text-sm mt-1">{myListings.length} listing{myListings.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                    onClick={() => { setListingToEdit(null); setIsCreateModalOpen(true); }}
                    className="bg-accent text-accent-content font-semibold py-2 px-4 rounded-lg hover:bg-yellow-400 transition-colors text-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Create New Listing
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-20 text-text-muted">
                    <svg className="animate-spin h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading listings...
                </div>
            ) : myListings.length > 0 ? (
                <div className="space-y-4">
                    {myListings.map(listing => (
                        <ListingManagementCard
                            key={listing.id}
                            listing={listing}
                            onEdit={(l) => { setListingToEdit(l); setIsCreateModalOpen(true); }}
                            onDelete={(l) => { setListingToDelete(l); setIsDeleteModalOpen(true); }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-text-muted border border-dashed border-border rounded-xl">
                    <p className="text-3xl mb-3">📭</p>
                    <p className="text-lg font-semibold">No listings yet</p>
                    <p className="mt-1 text-sm">Click "Create New Listing" to submit your first listing for approval.</p>
                </div>
            )}

            <CreateListingModal
                isOpen={isCreateModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setListingToEdit(null); }}
                onSave={handleSaveListing}
                listingToEdit={listingToEdit}
                currentUser={currentUser}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteListing}
                title="Delete Listing"
                message={`Are you sure you want to permanently delete the listing for "${listingToDelete?.mineralType}"? This action cannot be undone.`}
                confirmText={deleteLoading ? 'Deleting...' : 'Delete'}
            />
        </div>
    );
};

export default MyListingsContent;
