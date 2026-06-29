'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Listing, Auction, Bid, VerificationStatus } from '../lib/types';
import {
  getPublishedListings,
  mapBackendListingToFrontend,
  mapBackendListingToAuction,
  BackendListing,
} from '../lib/api/listings';
import { placeBid, getAuction } from '../lib/api/auctions';
import MinerChatModal from './MinerChatModal';
import CreateListingModal from './CreateListingModal';
import Pagination from './Pagination';
import ConfirmationModal from './ConfirmationModal';

// ─── Countdown Timer ─────────────────────────────────────────────────────────

const useCountdown = (targetDate: string) => {
  const countDownDate = new Date(targetDate).getTime();
  const [countDown, setCountDown] = useState(countDownDate - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountDown = countDownDate - Date.now();
      setCountDown(newCountDown > 0 ? newCountDown : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [countDownDate]);

  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);
  const ended = countDown <= 0;
  return { days, hours, minutes, seconds, ended };
};

const CountdownTimer: React.FC<{ endDate: string; large?: boolean }> = ({ endDate, large = false }) => {
  const { days, hours, minutes, seconds, ended } = useCountdown(endDate);
  if (ended) return <div className={`font-bold ${large ? 'text-xl' : 'text-md'} text-red-400`}>Auction Ended</div>;

  const TimeValue = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className={`font-bold ${large ? 'text-3xl' : 'text-xl'}`}>{String(value).padStart(2, '0')}</span>
      <span className={`text-xs ${large ? 'text-text-muted' : ''}`}>{label}</span>
    </div>
  );

  return (
    <div className={`grid grid-cols-4 gap-2 text-center ${large ? 'text-text-primary' : 'text-accent'}`}>
      <TimeValue value={days} label="days" />
      <TimeValue value={hours} label="hrs" />
      <TimeValue value={minutes} label="min" />
      <TimeValue value={seconds} label="sec" />
    </div>
  );
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-secondary rounded-lg overflow-hidden shadow-lg flex flex-col animate-pulse">
    <div className="w-full h-48 bg-border" />
    <div className="p-6 flex flex-col gap-3">
      <div className="h-5 bg-border rounded w-2/3" />
      <div className="h-4 bg-border rounded w-1/2" />
      <div className="h-8 bg-border rounded w-1/3 mt-2" />
      <div className="h-10 bg-border rounded mt-auto" />
    </div>
  </div>
);

// ─── Listing Card ─────────────────────────────────────────────────────────────

const ListingCard: React.FC<{ listing: Listing; onSelect: (l: Listing) => void }> = ({ listing, onSelect }) => (
  <div className="bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col">
    <div className="relative overflow-hidden">
      <img
        src={listing.images[0]}
        alt={listing.mineral}
        className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=400'; }}
      />
      <div className="absolute top-2 right-2 bg-accent/90 text-accent-content text-xs font-bold px-2 py-1 rounded-md">{listing.grade}</div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-text-primary">{listing.mineral}</h3>
      <p className="text-sm text-text-muted">{listing.location}</p>
      <div className="mt-4 flex justify-between items-center">
        <p className="text-2xl font-semibold text-accent">₦{Number(listing.pricePerUnit).toLocaleString()}</p>
        <p className="text-text-secondary">{listing.quantity} tonnes</p>
      </div>
      <div className="mt-4 flex items-center space-x-2 border-t border-border pt-4">
        <img
          src={listing.minerImageUrl || 'https://ui-avatars.com/api/?name=Miner&background=random'}
          alt={listing.minerName || 'Miner'}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="text-sm font-medium text-text-primary">{listing.minerName || 'Unknown Miner'}</span>
      </div>
      <div className="mt-auto pt-6">
        <button
          onClick={() => onSelect(listing)}
          className="block w-full text-center bg-border text-text-primary py-2.5 rounded-lg hover:bg-accent hover:text-accent-content transition-colors duration-300 font-semibold"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
);

// ─── Auction Card ─────────────────────────────────────────────────────────────

const AuctionCard: React.FC<{ listing: Auction; onSelect: (l: Auction) => void }> = ({ listing, onSelect }) => (
  <div className="bg-secondary rounded-lg overflow-hidden shadow-lg transform hover:-translate-y-2 transition-transform duration-300 group flex flex-col">
    <div className="relative overflow-hidden">
      <img
        src={listing.images[0]}
        alt={listing.mineral}
        className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500"
        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?auto=format&fit=crop&w=400'; }}
      />
      <div className="absolute top-2 right-2 bg-purple-500/90 text-white text-xs font-bold px-2 py-1 rounded-md">AUCTION</div>
    </div>
    <div className="p-6 flex flex-col flex-grow">
      <h3 className="text-xl font-bold text-text-primary">{listing.mineral}</h3>
      <p className="text-sm text-text-muted">{listing.location}</p>
      <div className="mt-4">
        <p className="text-sm text-text-secondary">Current Bid</p>
        <p className="text-2xl font-semibold text-accent">₦{Number(listing.currentBid).toLocaleString()}</p>
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm text-text-secondary mb-2">Time Remaining</p>
        <CountdownTimer endDate={listing.auctionEndDate} />
      </div>
      <div className="mt-auto pt-6">
        <button
          onClick={() => onSelect(listing)}
          className="block w-full text-center bg-border text-text-primary py-2.5 rounded-lg hover:bg-accent hover:text-accent-content transition-colors duration-300 font-semibold"
        >
          {new Date(listing.auctionEndDate).getTime() < Date.now() ? 'View Results' : 'Place Bid'}
        </button>
      </div>
    </div>
  </div>
);

// ─── Listing Detail Modal ─────────────────────────────────────────────────────

const ListingDetailModal: React.FC<{
  listing: Listing | null;
  onClose: () => void;
  onStartChat: (miner: { id: string; name: string; imageUrl: string }) => void;
}> = ({ listing, onClose, onStartChat }) => {
  const [mainImage, setMainImage] = useState(listing?.images[0]);
  const { currentUser, setPage } = useAuth();

  useEffect(() => { setMainImage(listing?.images[0]); }, [listing]);
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!listing) return null;

  const handlePurchaseClick = () => {
    if (currentUser) { setPage('payment', { listing }); onClose(); }
    else { setPage('login'); onClose(); }
  };

  const handleProposeContract = () => {
    if (currentUser) { setPage('contract-proposal', { listing }); onClose(); }
    else { setPage('login'); onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img
                src={mainImage}
                alt={listing.mineral}
                className="w-full h-80 object-cover rounded-lg mb-4 border border-border"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&w=800'; }}
              />
              <div className="flex space-x-2">
                {listing.images.map((img) => (
                  <button key={img} onClick={() => setMainImage(img)} className={`w-20 h-20 rounded-md border-2 overflow-hidden ${mainImage === img ? 'border-accent' : 'border-border'}`}>
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-text-primary mb-2">{listing.mineral}</h2>
              <div className="flex items-center space-x-4 mb-4">
                <span className="bg-accent/20 text-accent text-sm font-semibold px-3 py-1 rounded-full">{listing.grade}</span>
                <span className="text-text-muted">{listing.location}</span>
              </div>
              <div className="my-6">
                <p className="text-4xl font-bold text-accent">
                  ₦{Number(listing.pricePerUnit).toLocaleString()}
                  <span className="text-lg text-text-secondary font-normal"> per tonne</span>
                </p>
                <p className="text-text-secondary mt-1">{listing.quantity} tonnes available</p>
              </div>
              <h3 className="font-semibold text-text-primary mb-2">Description</h3>
              <p className="text-text-secondary mb-6">{listing.description}</p>
              <div className="bg-primary p-4 rounded-lg border border-border">
                <h4 className="font-semibold text-text-primary mb-3">Seller Information</h4>
                <div className="flex items-center space-x-4">
                  <img
                    src={listing.minerImageUrl || 'https://ui-avatars.com/api/?name=Miner'}
                    alt={listing.minerName || 'Miner'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-text-primary">{listing.minerName || 'Unknown Miner'}</p>
                    <p className="text-sm text-green-400">Verified Seller</p>
                  </div>
                </div>
              </div>
              {(!currentUser || currentUser.role === 'investor') ? (
                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onStartChat({ id: listing.minerId, name: listing.minerName || 'Miner', imageUrl: listing.minerImageUrl || '' })}
                    className="flex-1 bg-border text-text-primary font-semibold py-3 rounded-md hover:bg-border/80 transition-colors"
                  >
                    Chat with Seller
                  </button>
                  <button onClick={handlePurchaseClick} className="flex-1 bg-border text-text-primary font-semibold py-3 rounded-md hover:bg-border/80 transition-colors">
                    {currentUser ? 'Buy Now' : 'Login to Buy'}
                  </button>
                  <button onClick={handleProposeContract} className="flex-1 bg-accent text-accent-content font-semibold py-3 rounded-md hover:bg-yellow-400 transition-colors">
                    Propose Contract
                  </button>
                </div>
              ) : (
                <div className="mt-6 p-4 bg-primary rounded-lg border border-border text-center">
                  <p className="text-text-secondary text-sm">
                    {currentUser.id === listing.minerId ? 'This is your listing.' : 'You must be an investor to perform actions on this listing.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-scale-up { animation: scaleUp 0.3s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

// ─── Auction Detail Modal ─────────────────────────────────────────────────────

const AuctionDetailModal: React.FC<{
  listing: Auction | null;
  onClose: () => void;
  onBid: (auctionId: string, amount: number) => Promise<void>;
  bidLoading: boolean;
}> = ({ listing, onClose, onBid, bidLoading }) => {
  const { currentUser, setPage } = useAuth();
  const [bidAmount, setBidAmount] = useState(0);
  const [error, setError] = useState('');
  const [isBidConfirmationOpen, setIsBidConfirmationOpen] = useState(false);

  useEffect(() => {
    if (listing) {
      setBidAmount(listing.currentBid > 0 ? listing.currentBid + 500 : listing.startingBid);
      setError('');
    }
  }, [listing]);

  if (!listing) return null;
  const { ended } = useCountdown(listing.auctionEndDate);

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!currentUser) { setPage('login'); onClose(); return; }
    if (currentUser.id === listing.minerId) { setError('You cannot bid on your own auction.'); return; }
    if (bidAmount <= listing.currentBid) { setError(`Bid must be higher than the current ₦${listing.currentBid.toLocaleString()}.`); return; }
    setIsBidConfirmationOpen(true);
  };

  const handleConfirmBid = async () => {
    setIsBidConfirmationOpen(false);
    await onBid(listing.id, bidAmount);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-secondary rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-8 relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <img
                  src={listing.images[0]}
                  alt={listing.mineral}
                  className="w-full h-80 object-cover rounded-lg mb-4 border border-border"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?auto=format&fit=crop&w=800'; }}
                />
                <h3 className="font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-text-secondary text-sm">{listing.description}</p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{listing.mineral}</h2>
                <p className="text-text-secondary mb-4">{listing.quantity} tonnes — {listing.grade}</p>
                <div className="bg-primary p-4 rounded-lg border border-border">
                  <p className="text-sm text-center text-text-secondary mb-2">Time Remaining</p>
                  <CountdownTimer endDate={listing.auctionEndDate} large />
                </div>
                <div className="my-6">
                  <p className="text-text-secondary">Current Bid</p>
                  <p className="text-4xl font-bold text-accent">₦{Number(listing.currentBid).toLocaleString()}</p>
                  {listing.highestBidderName && <p className="text-sm text-text-muted">by {listing.highestBidderName}</p>}
                </div>
                {ended ? (
                  <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-lg text-center">
                    <h3 className="font-bold text-green-400">Auction Ended</h3>
                    <p className="text-text-secondary">Won by <span className="font-semibold text-text-primary">{listing.highestBidderName}</span></p>
                    <p className="text-text-secondary">Final bid: <span className="font-semibold text-text-primary">₦{Number(listing.currentBid).toLocaleString()}</span></p>
                  </div>
                ) : (
                  <form onSubmit={handleBidSubmit}>
                    <label className="block text-sm font-medium text-text-secondary">Your Bid (₦)</label>
                    <div className="flex items-center mt-1">
                      <span className="bg-border text-text-primary p-3 rounded-l-md">₦</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(Number(e.target.value))}
                        min={listing.currentBid + 1}
                        required
                        className="w-full bg-primary p-2 border-y border-r border-border focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <button type="submit" disabled={bidLoading} className="bg-accent text-accent-content font-semibold py-2.5 px-6 rounded-r-md hover:bg-yellow-400 disabled:opacity-60">
                        {bidLoading ? '...' : 'Place Bid'}
                      </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                  </form>
                )}
                <div className="mt-6">
                  <h3 className="font-semibold text-text-primary mb-2">Bid History ({listing.bidHistory.length})</h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto bg-primary p-3 rounded-md border border-border">
                    {listing.bidHistory.length > 0 ? listing.bidHistory.map((bid) => (
                      <div key={bid.id} className="flex justify-between items-center text-sm p-2 bg-secondary rounded">
                        <span>{bid.bidderName}</span>
                        <span className="font-semibold text-text-primary">₦{bid.amount.toLocaleString()}</span>
                      </div>
                    )) : <p className="text-sm text-text-muted text-center p-4">No bids yet. Be the first!</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isBidConfirmationOpen}
        onClose={() => setIsBidConfirmationOpen(false)}
        onConfirm={handleConfirmBid}
        title="Confirm Your Bid"
        message={`Place a bid of ₦${bidAmount.toLocaleString()} for "${listing.mineral}"? This action cannot be undone.`}
        confirmText="Place Bid"
        confirmButtonClass="bg-green-600 hover:bg-green-500 text-white"
      />
    </>
  );
};

// ─── Marketplace Page ─────────────────────────────────────────────────────────

const MarketplacePage: React.FC = () => {
  const { currentUser, setPage } = useAuth();

  const [buyNowListings, setBuyNowListings] = useState<Listing[]>([]);
  const [auctionListings, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bidLoading, setBidLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string; imageUrl: string } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'buy-now' | 'auction'>('buy-now');

  const [searchTerm, setSearchTerm] = useState('');
  const [mineralTypeFilter, setMineralTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const listingsPerPage = 12;

  // ── Fetch listings from backend ──────────────────────────────────────────────
  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const offset = (currentPage - 1) * listingsPerPage;
      const filters: Record<string, string | number> = { limit: listingsPerPage, offset };
      if (mineralTypeFilter !== 'all') filters.mineralType = mineralTypeFilter;
      if (locationFilter !== 'all') filters.location = locationFilter;
      if (activeTab === 'auction') filters.listingType = 'auction';
      else filters.listingType = 'buy_now';

      const response = await getPublishedListings(filters as any);
      const { data, meta } = response;

      if (activeTab === 'buy-now') {
        setBuyNowListings(data.map(mapBackendListingToFrontend));
      } else {
        setAuctions(data.map(mapBackendListingToAuction));
      }
      setTotalItems(meta.total);
    } catch (err) {
      setApiError('Failed to load listings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, mineralTypeFilter, locationFilter]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  // ── Client-side search filter ───────────────────────────────────────────────
  const allListings = activeTab === 'buy-now' ? buyNowListings : auctionListings;
  const filteredListings = useMemo(() => {
    if (!searchTerm) return allListings;
    const term = searchTerm.toLowerCase();
    return allListings.filter(
      (l) => l.mineral.toLowerCase().includes(term) || l.description.toLowerCase().includes(term)
    );
  }, [allListings, searchTerm]);

  const uniqueMineralTypes = useMemo(() => ['all', ...Array.from(new Set(allListings.map((l) => l.mineral)))], [allListings]);
  const uniqueLocations = useMemo(() => ['all', ...Array.from(new Set(allListings.map((l) => l.location)))], [allListings]);

  // ── Bidding ─────────────────────────────────────────────────────────────────
  const handlePlaceBid = async (auctionId: string, amount: number) => {
    if (!currentUser) return;
    setBidLoading(true);
    try {
      await placeBid(auctionId, amount);
      // Refetch to get updated bid info
      await fetchListings();
      // Update the selected auction with fresh data
      setSelectedAuction((prev) => prev ? { ...prev, currentBid: amount, highestBidderName: currentUser.name, bidHistory: [{ id: Date.now().toString(), auctionId, bidderId: currentUser.id, amount, date: new Date().toISOString(), createdAt: new Date().toISOString(), bidderName: currentUser.name }, ...prev.bidHistory] } : null);
    } catch {
      alert('Failed to place bid. Please try again.');
    } finally {
      setBidLoading(false);
    }
  };

  // ── Save new listing ────────────────────────────────────────────────────────
  const handleSaveListing = async (newListing: BackendListing) => {
    setIsCreateModalOpen(false);
    const mappedListing = mapBackendListingToFrontend(newListing);
    setBuyNowListings((current) => [mappedListing, ...current.filter((listing) => listing.id !== mappedListing.id)]);
    await fetchListings(); // Refresh from backend
  };

  // ── Chat ────────────────────────────────────────────────────────────────────
  const handleStartChat = (minerInfo: { id: string; name: string; imageUrl: string }) => {
    if (!currentUser) { setPage('login'); return; }
    setSelectedListing(null);
    setSelectedAuction(null);
    setChatTarget(minerInfo);
  };

  return (
    <main className="pt-20 pb-12 md:py-20 bg-primary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl font-extrabold text-text-primary">Marketplace</h1>
          <p className="text-lg text-text-secondary mt-4 max-w-2xl mx-auto">
            Discover and trade valuable mineral assets from verified miners across Nigeria.
          </p>
        </div>

        {/* Tab + Create Listing */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex space-x-1 bg-secondary p-1 rounded-lg border border-border">
            <button
              onClick={() => { setActiveTab('buy-now'); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'buy-now' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-border'}`}
            >Buy Now</button>
            <button
              onClick={() => { setActiveTab('auction'); setCurrentPage(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'auction' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-border'}`}
            >Auctions</button>
          </div>
          <button
            onClick={() => {
              if (!currentUser) { setPage('login'); }
              else if (currentUser.role === 'miner' && currentUser.status === VerificationStatus.VERIFIED) { setIsCreateModalOpen(true); }
              else { alert('Only verified miners can create listings.'); }
            }}
            className="bg-accent text-accent-content font-semibold py-2 px-5 rounded-md hover:bg-yellow-400 transition-colors"
          >+ Create Listing</button>
        </div>

        {/* Filters */}
        <div className="bg-secondary p-4 rounded-lg border border-border mb-12 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by mineral..."
              className="w-full bg-primary text-text-primary placeholder-text-muted border border-border rounded-md py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          <select
            value={mineralTypeFilter}
            onChange={(e) => { setMineralTypeFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {uniqueMineralTypes.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Mineral Types' : t}</option>)}
          </select>
          <select
            value={locationFilter}
            onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
            className="w-full bg-primary text-text-primary border border-border rounded-md py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {uniqueLocations.map((l) => <option key={l} value={l}>{l === 'all' ? 'All Locations' : l}</option>)}
          </select>
        </div>

        {/* Error */}
        {apiError && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-center mb-8">
            {apiError}
            <button onClick={fetchListings} className="ml-4 underline">Retry</button>
          </div>
        )}

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredListings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activeTab === 'buy-now'
                ? (filteredListings as Listing[]).map((l) => <ListingCard key={l.id} listing={l} onSelect={setSelectedListing} />)
                : (filteredListings as Auction[]).map((l) => <AuctionCard key={l.id} listing={l} onSelect={setSelectedAuction} />)
              }
            </div>
            <Pagination itemsPerPage={listingsPerPage} totalItems={totalItems} paginate={(p) => setCurrentPage(p)} currentPage={currentPage} />
          </>
        ) : (
          <div className="text-center text-text-secondary py-20">
            <h2 className="text-2xl font-bold mb-2">No Listings Found</h2>
            <p>Be the first to create a listing or adjust your filters.</p>
          </div>
        )}
      </div>

      <ListingDetailModal listing={selectedListing} onClose={() => setSelectedListing(null)} onStartChat={handleStartChat} />
      <AuctionDetailModal listing={selectedAuction} onClose={() => setSelectedAuction(null)} onBid={handlePlaceBid} bidLoading={bidLoading} />
      <CreateListingModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSave={handleSaveListing} currentUser={currentUser} />
      <MinerChatModal isOpen={!!chatTarget} onClose={() => setChatTarget(null)} miner={chatTarget} />
    </main>
  );
};

export default MarketplacePage;
