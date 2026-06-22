import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Listing, Transaction, Order, OrderStatus } from '../lib/types';

const PaymentPage: React.FC = () => {
    const { pagePayload, currentUser, updateUser, setPage } = useAuth();
    const listing: Listing | null = pagePayload && 'listing' in pagePayload && pagePayload.listing ? pagePayload.listing as Listing : null;

    const [paymentState, setPaymentState] = useState<'form' | 'processing' | 'success' | 'error'>('form');
    const [cardDetails, setCardDetails] = useState({
        name: currentUser?.name || '',
        number: '',
        expiry: '',
        cvc: '',
    });
    const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');

    useEffect(() => {
        // If there's no listing, redirect to marketplace
        if (!listing) {
            setPage('marketplace');
        }
    }, [listing, setPage]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let formattedValue = value;
        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        }
        if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
        }
        setCardDetails(prev => ({...prev, [name]: formattedValue.slice(0, name === 'number' ? 19 : name === 'expiry' ? 5 : 100)}));
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingAddress.trim()) {
            alert('Please enter a shipping address.');
            return;
        }
        setPaymentState('processing');

        setTimeout(() => {
            if (!currentUser || !listing) {
                setPaymentState('error');
                return;
            }

            const transactionId = `txn-${Date.now()}`;
            const orderId = `ord-${Date.now()}`;
            const now = new Date().toISOString();

            const newTransaction: Transaction = {
                id: transactionId,
                orderId: orderId,
                listingId: listing.id,
                mineral: listing.mineral,
                amount: listing.pricePerUnit * listing.quantity,
                quantity: listing.quantity,
                unit: listing.unit,
                date: now,
                status: 'completed',
                buyerId: currentUser.id,
                sellerId: listing.minerId,
                createdAt: now,
            };

            const newOrder: Order = {
                id: orderId,
                transactionId: transactionId,
                listingId: listing.id,
                mineral: listing.mineral,
                quantity: listing.quantity,
                unit: listing.unit,
                totalAmount: listing.pricePerUnit * listing.quantity,
                orderDate: now,
                buyerId: currentUser.id,
                buyerName: currentUser.name,
                sellerId: listing.minerId,
                sellerName: listing.minerName,
                status: OrderStatus.PROCESSING,
                shippingAddress: shippingAddress,
                createdAt: now,
                updatedAt: now,
                statusHistory: [
                    {
                        status: OrderStatus.PROCESSING,
                        date: now,
                        location: listing.location,
                        notes: 'Order placed and payment confirmed.'
                    }
                ]
            };
            
            const updatedUser = {
                ...currentUser,
                transactions: [...(currentUser.transactions || []), newTransaction],
            };
            updateUser(updatedUser);
            
            try {
                const allOrders = JSON.parse(localStorage.getItem('miners_hub_orders') || '[]');
                allOrders.unshift(newOrder);
                localStorage.setItem('miners_hub_orders', JSON.stringify(allOrders));
            } catch (error) {
                console.error("Failed to save order", error);
            }

            setPaymentState('success');

        }, 2000); // Simulate network delay
    };

    if (!listing) {
        return null; // or a loading spinner
    }

    const totalCost = listing.pricePerUnit * listing.quantity;

    return (
        <main className="pt-20 pb-12 md:py-20 bg-primary">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary text-center mb-8">Complete Your Purchase</h1>
                    
                    {paymentState === 'success' ? (
                        <div className="bg-secondary rounded-lg p-8 text-center border border-green-500/50">
                            <svg className="mx-auto h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <h2 className="text-2xl font-bold text-text-primary mt-4">Payment Successful!</h2>
                            <p className="text-text-secondary mt-2">Your order has been placed. You can track its progress in your profile.</p>
                            <button onClick={() => setPage('profile', { initialTab: 'orders' })} className="mt-6 bg-accent text-accent-content font-semibold py-2 px-6 rounded-md hover:bg-yellow-400">
                                Track My Order
                            </button>
                        </div>
                    ) : (
                         <div className="grid md:grid-cols-2 gap-8">
                            {/* Order Summary */}
                            <div className="bg-secondary rounded-lg p-8 border border-border">
                                <h2 className="text-xl font-bold text-text-primary mb-6">Order Summary</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <img src={listing.images[0]} alt={listing.mineral} className="w-24 h-24 object-cover rounded-md" />
                                        <div>
                                            <p className="font-bold text-text-primary">{listing.mineral}</p>
                                            <p className="text-sm text-text-secondary">{listing.grade}</p>
                                            <p className="text-sm text-text-muted">From: {listing.minerName}</p>
                                        </div>
                                    </div>
                                    <div className="border-t border-border pt-4 space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-text-secondary">Price per {listing.unit}</span><span className="font-medium text-text-primary">${listing.pricePerUnit.toFixed(2)}</span></div>
                                        <div className="flex justify-between"><span className="text-text-secondary">Quantity</span><span className="font-medium text-text-primary">{listing.quantity} {listing.unit}s</span></div>
                                        <div className="flex justify-between"><span className="text-text-secondary">Subtotal</span><span className="font-medium text-text-primary">${totalCost.toFixed(2)}</span></div>
                                        <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2"><span className="text-text-primary">Total</span><span className="text-accent">${totalCost.toFixed(2)}</span></div>
                                    </div>
                                </div>
                            </div>
    
                            {/* Payment Form */}
                            <div className="bg-secondary rounded-lg p-8 border border-border">
                                <h2 className="text-xl font-bold text-text-primary mb-6">Payment & Shipping</h2>
                                <form onSubmit={handlePayment} className="space-y-4">
                                    <div>
                                        <label htmlFor="shippingAddress" className="block text-sm font-medium text-text-secondary">Shipping Address</label>
                                        <textarea id="shippingAddress" name="shippingAddress" value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} required rows={3} className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                                    </div>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Cardholder Name</label>
                                        <input type="text" id="name" name="name" value={cardDetails.name} onChange={handleInputChange} required className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                                    </div>
                                     <div>
                                        <label htmlFor="number" className="block text-sm font-medium text-text-secondary">Card Number</label>
                                        <input type="text" id="number" name="number" value={cardDetails.number} onChange={handleInputChange} required placeholder="0000 0000 0000 0000" className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="expiry" className="block text-sm font-medium text-text-secondary">Expiry Date</label>
                                            <input type="text" id="expiry" name="expiry" value={cardDetails.expiry} onChange={handleInputChange} required placeholder="MM/YY" className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                                        </div>
                                        <div>
                                            <label htmlFor="cvc" className="block text-sm font-medium text-text-secondary">CVC</label>
                                            <input type="text" id="cvc" name="cvc" value={cardDetails.cvc} onChange={handleInputChange} required maxLength={3} placeholder="123" className="w-full bg-primary p-2 border border-border rounded-md mt-1" />
                                        </div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={paymentState === 'processing'}
                                        className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors disabled:bg-border disabled:cursor-not-allowed">
                                        {paymentState === 'processing' ? 'Processing...' : `Pay $${totalCost.toFixed(2)}`}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default PaymentPage;