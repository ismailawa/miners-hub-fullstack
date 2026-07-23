'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getListings, updateListingStatus, AdminListing } from '../../../../lib/api/admin';
import { useAuth } from '../../../../contexts/AuthContext';
import { formatCurrency } from '../../../../lib/currency';

type ViewMode = 'list' | 'grid';
type StatusFilter = 'all' | 'draft' | 'submitted' | 'under_review' | 'published' | 'sold' | 'expired' | 'archived';
type TypeFilter = 'all' | 'buy_now' | 'auction';

const STATUSES: StatusFilter[] = ['all', 'draft', 'submitted', 'under_review', 'published', 'sold', 'expired', 'archived'];
const TYPES: TypeFilter[] = ['all', 'buy_now', 'auction'];
const PAGE_SIZE_OPTIONS = [10, 20, 50];

const statusClasses: Record<string, string> = {
  published: 'bg-green-500/15 text-green-300 border-green-500/30',
  archived: 'bg-red-500/15 text-red-300 border-red-500/30',
  submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  under_review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  draft: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  sold: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  expired: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
};

const formatLabel = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const StatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status] || 'border-border bg-primary text-text-secondary'}`}>
    {formatLabel(status)}
  </span>
);

const TypeBadge: React.FC<{ type?: string }> = ({ type }) => (
  <span className="inline-flex rounded-full border border-border bg-primary px-2.5 py-1 text-xs font-semibold text-text-secondary">
    {type === 'auction' ? 'Auction' : 'Buy Now'}
  </span>
);

const canReview = (status: string) => ['draft', 'submitted', 'under_review'].includes(status);
const ListingSummary: React.FC<{
  listing: AdminListing;
  onView: (listing: AdminListing) => void;
  onStatus: (listing: AdminListing, status: string) => void;
}> = ({ listing, onView, onStatus }) => (
  <div className="rounded-lg border border-border bg-secondary p-4">
    <div className="flex gap-4">
      <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-md bg-primary">
        {listing.images?.[0] ? (
          <img src={listing.images[0]} alt={listing.mineralType} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-text-muted">No image</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-text-primary">{listing.mineralType}</h3>
            <p className="text-sm text-text-secondary">{listing.miner?.companyName || listing.miner?.user?.name || 'Unknown miner'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TypeBadge type={listing.listingType} />
            <StatusBadge status={listing.status} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div><span className="text-text-muted">Quantity</span><div className="font-semibold text-text-primary">{Number(listing.quantity).toLocaleString()} tonnes</div></div>
          <div><span className="text-text-muted">Price</span><div className="font-semibold text-text-primary">{formatCurrency(Number(listing.price))}/tonne</div></div>
          <div><span className="text-text-muted">Grade</span><div className="font-semibold text-text-primary">{listing.gradePurity || '-'}</div></div>
          <div><span className="text-text-muted">Location</span><div className="truncate font-semibold text-text-primary">{listing.location || '-'}</div></div>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button onClick={() => onView(listing)} className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent">View Details</button>
          {canReview(listing.status) && (
            <>
              <button onClick={() => onStatus(listing, 'published')} className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500">Approve</button>
              <button onClick={() => onStatus(listing, 'archived')} className="rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-500">Reject</button>
            </>
          )}
          {listing.status === 'published' && (
            <button onClick={() => onStatus(listing, 'under_review')} className="rounded-md bg-yellow-600 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-500">Unpublish</button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const ListingDetailModal: React.FC<{
  listing: AdminListing | null;
  onClose: () => void;
  onStatus: (listing: AdminListing, status: string) => void;
}> = ({ listing, onClose, onStatus }) => {
  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-border bg-secondary shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-secondary px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">{listing.mineralType}</h2>
            <p className="text-sm text-text-muted">Listing review details</p>
          </div>
          <button onClick={onClose} className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Close</button>
        </div>

        <div className="space-y-6 p-6">
          {listing.images?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {listing.images.map((image, index) => (
                <img key={image} src={image} alt={`${listing.mineralType} ${index + 1}`} className="h-44 w-full rounded-md object-cover" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-border bg-primary p-8 text-center text-sm text-text-muted">No listing images uploaded.</div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Status</span><div className="mt-2"><StatusBadge status={listing.status} /></div></div>
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Type</span><div className="mt-2"><TypeBadge type={listing.listingType} /></div></div>
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Submitted</span><div className="mt-2 font-semibold text-text-primary">{new Date(listing.createdAt).toLocaleString()}</div></div>
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Quantity</span><div className="mt-2 font-semibold text-text-primary">{Number(listing.quantity).toLocaleString()} tonnes</div></div>
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Price</span><div className="mt-2 font-semibold text-text-primary">{formatCurrency(Number(listing.price))}/tonne</div></div>
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Grade / purity</span><div className="mt-2 font-semibold text-text-primary">{listing.gradePurity || '-'}</div></div>
            <div className="rounded-md border border-border bg-primary p-4 md:col-span-2"><span className="text-sm text-text-muted">Location</span><div className="mt-2 font-semibold text-text-primary">{listing.location || '-'}</div></div>
            <div className="rounded-md border border-border bg-primary p-4"><span className="text-sm text-text-muted">Moisture</span><div className="mt-2 font-semibold text-text-primary">{listing.moisturePercentage ?? '-'}%</div></div>
          </div>

          <div className="rounded-md border border-border bg-primary p-4">
            <h3 className="font-semibold text-text-primary">Miner</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
              <div><span className="text-text-muted">Company</span><div className="font-semibold text-text-primary">{listing.miner?.companyName || '-'}</div></div>
              <div><span className="text-text-muted">Contact</span><div className="font-semibold text-text-primary">{listing.miner?.user?.name || '-'}</div></div>
              <div><span className="text-text-muted">Email</span><div className="font-semibold text-text-primary">{listing.miner?.user?.email || '-'}</div></div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button onClick={onClose} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
            {canReview(listing.status) && (
              <>
                <button onClick={() => onStatus(listing, 'archived')} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500">Reject Listing</button>
                <button onClick={() => onStatus(listing, 'published')} className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500">Approve Listing</button>
              </>
            )}
            {listing.status === 'published' && (
              <button onClick={() => onStatus(listing, 'under_review')} className="rounded-md bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500">Unpublish Listing</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AdminListingsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const offset = (page - 1) * pageSize;

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getListings({
        status: statusFilter,
        listingType: typeFilter,
        limit: pageSize,
        rawOffset: offset,
      });
      setListings(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    if (currentUser?.role === 'admin') void fetchListings();
  }, [currentUser, router, statusFilter, typeFilter, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, pageSize]);

  const counts = useMemo(() => {
    const pending = listings.filter((listing) => canReview(listing.status)).length;
    const published = listings.filter((listing) => listing.status === 'published').length;
    const archived = listings.filter((listing) => listing.status === 'archived').length;
    return { pending, published, archived };
  }, [listings]);

  const handleStatusUpdate = async (listing: AdminListing, status: string) => {
    setUpdatingId(listing.id);
    try {
      const updated = await updateListingStatus(listing.id, status);
      setListings((current) => current.map((item) => item.id === listing.id ? { ...item, ...updated, status } : item));
      setSelectedListing((current) => current?.id === listing.id ? { ...current, ...updated, status } : current);
    } catch (err: any) {
      alert(err.message || 'Failed to update listing status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Listing Approvals</h1>
          <p className="text-text-secondary">Review submitted mineral listings before publishing them to the marketplace.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-md border border-border bg-secondary px-4 py-2"><div className="font-bold text-text-primary">{counts.pending}</div><div className="text-xs text-text-muted">Needs review</div></div>
          <div className="rounded-md border border-border bg-secondary px-4 py-2"><div className="font-bold text-text-primary">{counts.published}</div><div className="text-xs text-text-muted">Published</div></div>
          <div className="rounded-md border border-border bg-secondary px-4 py-2"><div className="font-bold text-text-primary">{counts.archived}</div><div className="text-xs text-text-muted">Rejected</div></div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="text-sm text-text-secondary">
            <span className="mb-1 block font-semibold">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="w-full rounded-md border border-border bg-primary px-3 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent">
              {STATUSES.map((status) => <option key={status} value={status}>{status === 'all' ? 'All statuses' : formatLabel(status)}</option>)}
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            <span className="mb-1 block font-semibold">Type</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)} className="w-full rounded-md border border-border bg-primary px-3 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent">
              {TYPES.map((type) => <option key={type} value={type}>{type === 'all' ? 'All types' : type === 'auction' ? 'Auction' : 'Buy Now'}</option>)}
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            <span className="mb-1 block font-semibold">Page size</span>
            <select value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))} className="w-full rounded-md border border-border bg-primary px-3 py-2.5 text-text-primary outline-none focus:ring-2 focus:ring-accent">
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} per page</option>)}
            </select>
          </label>
          <div className="text-sm text-text-secondary">
            <span className="mb-1 block font-semibold">View</span>
            <div className="grid grid-cols-2 rounded-md border border-border bg-primary p-1">
              <button onClick={() => setViewMode('list')} className={`rounded px-3 py-2 text-sm font-semibold ${viewMode === 'list' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-secondary'}`}>List</button>
              <button onClick={() => setViewMode('grid')} className={`rounded px-3 py-2 text-sm font-semibold ${viewMode === 'grid' ? 'bg-accent text-accent-content' : 'text-text-secondary hover:bg-secondary'}`}>Grid</button>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

      {loading ? (
        <div className="rounded-lg border border-border bg-secondary p-8 text-center text-text-muted">Loading listings...</div>
      ) : listings.length === 0 ? (
        <div className="rounded-lg border border-border bg-secondary p-10 text-center text-text-muted">No listings match the current filters.</div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className={updatingId === listing.id ? 'pointer-events-none opacity-60' : ''}>
              <ListingSummary listing={listing} onView={setSelectedListing} onStatus={(item, status) => void handleStatusUpdate(item, status)} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className={`rounded-lg border border-border bg-secondary p-4 ${updatingId === listing.id ? 'pointer-events-none opacity-60' : ''}`}>
              <div className="mb-4 h-40 overflow-hidden rounded-md bg-primary">
                {listing.images?.[0] ? <img src={listing.images[0]} alt={listing.mineralType} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-text-muted">No image</div>}
              </div>
              <div className="flex flex-wrap gap-2"><TypeBadge type={listing.listingType} /><StatusBadge status={listing.status} /></div>
              <h3 className="mt-3 text-lg font-bold text-text-primary">{listing.mineralType}</h3>
              <p className="text-sm text-text-secondary">{listing.miner?.companyName || listing.miner?.user?.name || 'Unknown miner'}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-muted">Quantity</span><span className="font-semibold text-text-primary">{Number(listing.quantity).toLocaleString()} tonnes</span></div>
                <div className="flex justify-between"><span className="text-text-muted">Price</span><span className="font-semibold text-text-primary">{formatCurrency(Number(listing.price))}</span></div>
              </div>
              <div className="mt-5 flex gap-2">
              <button onClick={() => setSelectedListing(listing)} className="flex-1 rounded-md border border-border px-3 py-2 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent">Details</button>
              {canReview(listing.status) && <button onClick={() => void handleStatusUpdate(listing, 'published')} className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-500">Approve</button>}
              {listing.status === 'published' && <button onClick={() => void handleStatusUpdate(listing, 'under_review')} className="rounded-md bg-yellow-600 px-3 py-2 text-xs font-semibold text-white hover:bg-yellow-500">Unpublish</button>}
            </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary p-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <div>Showing {total === 0 ? 0 : offset + 1}-{Math.min(offset + pageSize, total)} of {total}</div>
        <div className="flex items-center justify-end gap-2">
          <button disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-md border border-border px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 hover:border-accent hover:text-accent">Previous</button>
          <span className="px-2 font-semibold text-text-primary">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-md border border-border px-3 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-50 hover:border-accent hover:text-accent">Next</button>
        </div>
      </div>

      <ListingDetailModal
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onStatus={(listing, status) => void handleStatusUpdate(listing, status)}
      />
    </div>
  );
}
