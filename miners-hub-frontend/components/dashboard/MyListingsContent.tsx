'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Listing } from '../../lib/types';
import { MARKETPLACE_LISTINGS_DATA } from '../../lib/constants/data';
import CreateListingModal from '../CreateListingModal';
import ConfirmationModal from '../ConfirmationModal';

const ListingManagementCard: React.FC<{ listing: Listing; onEdit: (listing: Listing) => void; onDelete: (listing: Listing) => void }> = ({ listing, onEdit, onDelete }) => (
    <div className="bg-primary p-4 rounded-lg border border-border flex flex-col sm:flex-row items-center gap-4">
        <img src={listing.images[0]} alt={listing.mineral} className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-md flex-shrink-0" />
        <div className="flex-grow w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start">
                <div>
                    <p className="font-bold text-text-primary text-lg">{listing.mineral}</p>
                    <p className="text-sm text-text-secondary">{listing.location}</p>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent mt-1 inline-block">{listing.grade}</span>
                </div>
                <p className="text-lg font-semibold text-accent">${listing.pricePerUnit}/{listing.unit}</p>
            </div>
        </div>
        <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2 w-full sm:w-auto">
            <button onClick={() => onEdit(listing)} className="flex-1 sm:flex-none justify-center w-full px-3 py-1.5 text-sm rounded-md bg-border hover:bg-border/80 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                <span>Edit</span>
            </button>
            <button onClick={() => onDelete(listing)} className="flex-1 sm:flex-none justify-center w-full px-3 py-1.5 text-sm rounded-md bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>Delete</span>
            </button>
        </div>
    </div>
);

const MyListingsContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [myListings, setMyListings] = useState<Listing[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [listingToEdit, setListingToEdit] = useState<Listing | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);

    useEffect(() => {
        if (!currentUser) return;
        try {
            const allListings: Listing[] = JSON.parse(localStorage.getItem('miners_hub_listings') || JSON.stringify(MARKETPLACE_LISTINGS_DATA));
            setMyListings(allListings.filter(l => l.minerId === currentUser.id));
        } catch (e) { /* silent */ }
    }, [currentUser]);

    const handleSaveListing = (listingToSave: Listing) => {
        try {
            const allListings: Listing[] = JSON.parse(localStorage.getItem('miners_hub_listings') || '[]');
            const existingIndex = allListings.findIndex(l => l.id === listingToSave.id);
            if (existingIndex > -1) { allListings[existingIndex] = listingToSave; } else { allListings.unshift(listingToSave); }
            localStorage.setItem('miners_hub_listings', JSON.stringify(allListings));
            setMyListings(allListings.filter(l => l.minerId === currentUser?.id));
            setIsEditModalOpen(false);
            setIsCreateModalOpen(false);
            setListingToEdit(null);
        } catch (e) { console.error('Failed to save listing', e); }
    };

    const handleDeleteListing = () => {
        if (!listingToDelete) return;
        try {
            const allListings: Listing[] = JSON.parse(localStorage.getItem('miners_hub_listings') || '[]');
            const updated = allListings.filter(l => l.id !== listingToDelete.id);
            localStorage.setItem('miners_hub_listings', JSON.stringify(updated));
            setMyListings(updated.filter(l => l.minerId === currentUser?.id));
            setIsDeleteModalOpen(false);
            setListingToDelete(null);
        } catch (e) { console.error('Failed to delete listing', e); }
    };

    if (!currentUser) return null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">My Listings</h1>
                    <p className="text-text-muted text-sm mt-1">{myListings.length} active listing{myListings.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="bg-accent text-accent-content font-semibold py-2 px-4 rounded-md hover:bg-yellow-400 transition-colors text-sm">
                    + Create New Listing
                </button>
            </div>

            {myListings.length > 0 ? (
                <div className="space-y-4">
                    {myListings.map(listing => (
                        <ListingManagementCard
                            key={listing.id}
                            listing={listing}
                            onEdit={(l) => { setListingToEdit(l); setIsEditModalOpen(true); }}
                            onDelete={(l) => { setListingToDelete(l); setIsDeleteModalOpen(true); }}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 text-text-muted border border-dashed border-border rounded-lg">
                    <p className="text-2xl mb-2">📭</p>
                    <p className="text-lg font-semibold">No listings yet</p>
                    <p className="mt-1 text-sm">Click "Create New Listing" to get started.</p>
                </div>
            )}

            <CreateListingModal
                isOpen={isCreateModalOpen || isEditModalOpen}
                onClose={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); setListingToEdit(null); }}
                onSave={handleSaveListing}
                listingToEdit={isCreateModalOpen ? null : listingToEdit}
                currentUser={currentUser}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteListing}
                title="Delete Listing"
                message={`Are you sure you want to permanently delete the listing for "${listingToDelete?.mineral}"? This action cannot be undone.`}
                confirmText="Delete"
            />
        </div>
    );
};

export default MyListingsContent;
