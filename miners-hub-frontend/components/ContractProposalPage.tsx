'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { Listing } from '../lib/types';
import { proposeContract } from '../lib/api/contracts';

const ContractProposalPage: React.FC = () => {
    const { currentUser, pagePayload, setPage } = useAuth();
    const { addNotification } = useNotification();
    const listing: Listing | null = pagePayload && 'listing' in pagePayload && pagePayload.listing ? pagePayload.listing as Listing : null;

    const [terms, setTerms] = useState('');
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'investor' || !listing) {
            setPage('marketplace');
        } else {
            const totalCost = (listing.pricePerUnit * listing.quantity).toLocaleString();
            setTitle(`Purchase Agreement: ${listing.quantity} ${listing.unit} of ${listing.mineral}`);
            const template = `This agreement is made for the sale of ${listing.quantity} ${listing.unit}(s) of ${listing.mineral} (${listing.grade}) at a price of ₦${listing.pricePerUnit.toLocaleString()} per ${listing.unit}, for a total of ₦${totalCost}.

1. **Payment:** Full payment to be made via Miners Hub Escrow service within 3 business days of this contract becoming active.
2. **Shipment:** Seller (${listing.minerName}) agrees to ship the goods to the buyer's specified port within 14 days of payment confirmation.
3. **Inspection:** Buyer (${currentUser.name}) has the right to an independent inspection at the port of origin at their own cost.
4. **Governing Law:** This agreement shall be governed by the laws of the Federal Republic of Nigeria.

[Add any additional terms below]
`;
            setTerms(template);
        }
    }, [currentUser, listing, setPage]);

    if (!listing || !currentUser) {
        return null; // Or a loading spinner while redirecting
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const sellerUserId = listing.minerUserId;
            if (!sellerUserId) {
                throw new Error('Seller account could not be resolved for this listing.');
            }

            await proposeContract({
                party2Id: sellerUserId,
                listingId: listing.id,
                title: title,
                terms: terms,
                value: listing.pricePerUnit * listing.quantity,
            });

            addNotification({
                userId: currentUser.id,
                type: 'success',
                title: 'Proposal Sent',
                message: `Your contract for ${listing.mineral} has been sent to ${listing.minerName}.`,
                createdAt: new Date().toISOString(),
            });
            
            // Redirect to profile contracts page
            setTimeout(() => {
                setPage('profile', { initialTab: 'contracts' });
            }, 500);

        } catch (error) {
            console.error("Failed to propose contract", error);
            alert("Failed to send proposal. Please try again.");
            setIsSubmitting(false);
        }
    };
    

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary">Propose Contract</h1>
                        <p className="text-lg text-text-secondary mt-2">Draft and send a formal agreement to the seller.</p>
                    </div>

                    <div className="bg-secondary rounded-lg p-8 border border-border">
                        <h2 className="text-xl font-bold text-text-primary mb-4">Agreement for: {listing.mineral}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-primary p-4 rounded-md mb-6">
                            <div><span className="font-semibold text-text-muted block">Seller</span>{listing.minerName}</div>
                            <div><span className="font-semibold text-text-muted block">Quantity</span>{listing.quantity} {listing.unit}s</div>
                            <div><span className="font-semibold text-text-muted block">Price/Unit</span>₦{listing.pricePerUnit.toLocaleString()}</div>
                            <div><span className="font-semibold text-text-muted block">Total</span>₦{(listing.pricePerUnit * listing.quantity).toLocaleString()}</div>
                        </div>

                        <form onSubmit={handleSubmit}>
                             <div className="mb-4">
                                <label htmlFor="title" className="block text-sm font-medium text-text-secondary mb-2">Contract Title</label>
                                <input 
                                    id="title" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required 
                                    className="w-full bg-primary p-3 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>
                            <div>
                                <label htmlFor="terms" className="block text-sm font-medium text-text-secondary mb-2">Terms and Conditions</label>
                                <textarea 
                                    id="terms" 
                                    value={terms}
                                    onChange={(e) => setTerms(e.target.value)}
                                    required 
                                    rows={15}
                                    className="w-full bg-primary p-3 border border-border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="bg-accent text-accent-content font-semibold py-2.5 px-6 rounded-md hover:bg-yellow-400 disabled:bg-border transition-colors">
                                    {isSubmitting ? 'Submitting...' : 'Send Proposal to Miner'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ContractProposalPage;
