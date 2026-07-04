'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, initiateEscrowPayment } from '../lib/api/orders';
import { Listing } from '../lib/types';

const PaymentPage: React.FC = () => {
  const { pagePayload, currentUser, setPage } = useAuth();
  const listing: Listing | null = pagePayload && 'listing' in pagePayload && pagePayload.listing ? (pagePayload.listing as Listing) : null;

  const [paymentState, setPaymentState] = useState<'form' | 'processing' | 'pending' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // If there's no listing, redirect to marketplace
    if (!listing) {
      setPage('marketplace');
    }
  }, [listing, setPage]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      alert('Please enter a shipping address.');
      return;
    }
    setPaymentState('processing');
    setErrorMessage(null);

    try {
      if (!currentUser || !listing) {
        throw new Error('User or listing not found');
      }

      // 1. Create the order
      const newOrder = await createOrder({
        listingId: listing.id,
        quantity,
        deliveryAddress: shippingAddress,
      });

      const escrow = await initiateEscrowPayment(newOrder.id);
      if (!escrow.paymentLink) {
        throw new Error('Payment link could not be created. Please try again.');
      }

      setPaymentState('pending');
      window.location.assign(escrow.paymentLink);
    } catch (error: any) {
      console.error('Payment failed', error);
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      setPaymentState('error');
    }
  };

  if (!listing) {
    return null; // or a loading spinner
  }

  const totalCost = listing.pricePerUnit * quantity;

  return (
    <main className="pt-20 pb-12 md:py-20 bg-primary">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-text-primary text-center mb-8">
            Complete Your Purchase
          </h1>

          {paymentState === 'pending' ? (
            <div className="bg-secondary rounded-lg p-8 text-center border border-accent/50">
              <svg
                className="mx-auto h-16 w-16 text-accent"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-text-primary mt-4">Redirecting to Flutterwave</h2>
              <p className="text-text-secondary mt-2">
                After checkout, payment will show as pending until Flutterwave confirms it by webhook.
              </p>
              <button
                onClick={() => setPage('profile', { initialTab: 'orders' })}
                className="mt-6 bg-accent text-accent-content font-semibold py-2 px-6 rounded-md hover:bg-yellow-400"
              >
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
                    <img
                      src={listing.images[0]}
                      alt={listing.mineral}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                    <div>
                      <p className="font-bold text-text-primary">{listing.mineral}</p>
                      <p className="text-sm text-text-secondary">{listing.grade}</p>
                      <p className="text-sm text-text-muted">From: {listing.minerName}</p>
                    </div>
                  </div>
                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Price per {listing.unit}</span>
                      <span className="font-medium text-text-primary">
                        ₦{listing.pricePerUnit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Quantity</span>
                      <span className="font-medium text-text-primary">
                        {quantity} {listing.unit}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-medium text-text-primary">
                        ₦{totalCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                      <span className="text-text-primary">Total</span>
                      <span className="text-accent">₦{totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="bg-secondary rounded-lg p-8 border border-border">
                <h2 className="text-xl font-bold text-text-primary mb-6">Escrow Checkout</h2>
                {errorMessage && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm mb-4">
                        {errorMessage}
                    </div>
                )}
                <form onSubmit={handlePayment} className="space-y-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-text-secondary">
                      Quantity ({listing.unit}s)
                    </label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      value={quantity}
                      min={1}
                      max={listing.quantity}
                      step={1}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setQuantity(Math.max(1, Math.min(listing.quantity, Number.isFinite(next) ? next : 1)));
                      }}
                      required
                      className="w-full bg-primary p-2 border border-border rounded-md mt-1"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      {listing.quantity} {listing.unit}s available.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="shippingAddress" className="block text-sm font-medium text-text-secondary">
                      Shipping Address
                    </label>
                    <textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full bg-primary p-2 border border-border rounded-md mt-1"
                    />
                  </div>
                  <div className="rounded-lg border border-border bg-primary p-4 text-sm text-text-secondary">
                    Funds are collected into Miners Hub escrow through Flutterwave. The seller receives the net payout only after delivery is confirmed and an admin releases funds.
                  </div>
                  <button
                    type="submit"
                    disabled={paymentState === 'processing'}
                    className="w-full bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors disabled:bg-border disabled:cursor-not-allowed"
                  >
                    {paymentState === 'processing' ? 'Processing...' : `Pay ₦${totalCost.toLocaleString()}`}
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
