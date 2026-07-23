'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminMinerRegistryDetail,
  AdminMinerRegistryItem,
  getMinerRegistry,
  getMinerRegistryDetail,
  MinerRegistryFilters,
} from '../../../../lib/api/admin';
import { useAuth } from '../../../../contexts/AuthContext';

const roleOptions = ['all', 'miner', 'investor', 'laboratory', 'logistics'];
const statusOptions = ['all', 'pending', 'verified', 'active', 'rejected', 'suspended'];
const documentStatusOptions = ['all', 'pending', 'approved', 'rejected'];

function statusChip(status: string) {
  const classes: Record<string, string> = {
    verified: 'bg-green-500/15 text-green-300 border-green-500/30',
    active: 'bg-green-500/15 text-green-300 border-green-500/30',
    approved: 'bg-green-500/15 text-green-300 border-green-500/30',
    pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
    suspended: 'bg-red-500/15 text-red-300 border-red-500/30',
    missing: 'bg-border text-text-muted border-border',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || classes.missing}`}>
      {status}
    </span>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-primary px-3 py-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-lg font-bold text-text-primary">{value}</p>
    </div>
  );
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

export default function MinerRegistryPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [miners, setMiners] = useState<AdminMinerRegistryItem[]>([]);
  const [filters, setFilters] = useState<MinerRegistryFilters>({
    role: 'all',
    status: 'all',
    documentStatus: 'all',
    location: '',
    mineralType: '',
  });
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedMiner, setSelectedMiner] = useState<AdminMinerRegistryDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRegistry = async (nextFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMinerRegistry(nextFilters);
      setMiners(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load miner registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    if (currentUser?.role === 'admin') {
      void loadRegistry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, router]);

  const summary = useMemo(() => ({
    total: miners.length,
    verified: miners.filter((miner) => ['verified', 'active'].includes(miner.status || miner.user?.verificationStatus || '')).length,
    pendingDocs: miners.reduce((sum, miner) => sum + miner.documentSummary.pending, 0),
    publishedListings: miners.reduce((sum, miner) => sum + miner.listingSummary.published, 0),
  }), [miners]);

  const updateFilter = (key: keyof MinerRegistryFilters, value: string) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    if (key === 'role' || key === 'status' || key === 'documentStatus') {
      void loadRegistry(nextFilters);
    }
  };

  const applyTextFilters = () => {
    void loadRegistry(filters);
  };

  const openMinerDetail = async (id: string) => {
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await getMinerRegistryDetail(id);
      setSelectedMiner(detail);
    } catch (err: any) {
      setError(err?.message || 'Failed to load miner details');
    } finally {
      setDetailLoading(false);
    }
  };

  if (currentUser && currentUser.role !== 'admin') return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Stakeholder Registry</h1>
        <p className="mt-1 text-sm text-text-secondary">Review miners, investors, laboratories, and logistics providers from one operational registry.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatBlock label="Registry records" value={summary.total} />
        <StatBlock label="Active or verified" value={summary.verified} />
        <StatBlock label="Pending documents" value={summary.pendingDocs} />
        <StatBlock label="Published listings" value={summary.publishedListings} />
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-secondary p-4 md:grid-cols-6">
        <select
          value={filters.role}
          onChange={(event) => updateFilter('role', event.target.value)}
          className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>Role: {role}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
          className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>Verification: {status}</option>
          ))}
        </select>
        <select
          value={filters.documentStatus}
          onChange={(event) => updateFilter('documentStatus', event.target.value)}
          className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none focus:ring-2 focus:ring-accent"
        >
          {documentStatusOptions.map((status) => (
            <option key={status} value={status}>Documents: {status}</option>
          ))}
        </select>
        <input
          value={filters.location}
          onChange={(event) => updateFilter('location', event.target.value)}
          placeholder="Location"
          className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
        />
        <input
          value={filters.mineralType}
          onChange={(event) => updateFilter('mineralType', event.target.value)}
          placeholder="Mineral or capability"
          className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
        />
        <button
          onClick={applyTextFilters}
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content transition-colors hover:bg-yellow-400"
        >
          Apply
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border bg-secondary">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead>
            <tr className="bg-primary/50 text-sm text-text-secondary">
              <th className="border-b border-border p-4 font-semibold">Stakeholder</th>
              <th className="border-b border-border p-4 font-semibold">Role</th>
              <th className="border-b border-border p-4 font-semibold">Location</th>
              <th className="border-b border-border p-4 font-semibold">Status</th>
              <th className="border-b border-border p-4 font-semibold">License</th>
              <th className="border-b border-border p-4 font-semibold">Documents</th>
              <th className="border-b border-border p-4 font-semibold">Listings</th>
              <th className="border-b border-border p-4 font-semibold">Focus</th>
              <th className="border-b border-border p-4 font-semibold">Latest Document</th>
              <th className="border-b border-border p-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-text-muted">Loading registry...</td>
              </tr>
            ) : miners.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-8 text-center text-text-muted">No registry records match the current filters.</td>
              </tr>
            ) : miners.map((miner) => (
              <tr key={miner.id} className="border-b border-border align-top transition-colors hover:bg-primary/30">
                <td className="p-4">
                  <p className="font-semibold text-text-primary">{miner.companyName}</p>
                  <p className="text-xs text-text-secondary">{miner.contact?.name || miner.user?.name || 'Unnamed contact'} · {miner.contact?.email || miner.user?.email || '-'}</p>
                  {miner.companyRegNumber && <p className="mt-1 text-xs text-text-muted">RC: {miner.companyRegNumber}</p>}
                </td>
                <td className="p-4">
                  <span className="inline-flex rounded-full border border-border bg-primary px-2.5 py-1 text-xs font-semibold capitalize text-text-secondary">
                    {miner.registryLabel || miner.registryType || 'Miner'}
                  </span>
                </td>
                <td className="p-4 text-sm text-text-secondary">{miner.location || '-'}</td>
                <td className="p-4">
                  {statusChip(miner.status || miner.user?.verificationStatus || 'pending')}
                  <p className="mt-2 text-xs text-text-muted">
                    {miner.user ? (miner.user.onboardingComplete ? 'Onboarding complete' : 'Onboarding pending') : 'Partner registry'}
                  </p>
                </td>
                <td className="p-4">
                  {statusChip(miner.licenseStatus)}
                  {miner.miningLicence && <p className="mt-2 max-w-[180px] truncate text-xs text-text-muted">{miner.miningLicence}</p>}
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  <p>{miner.documentSummary.total} total</p>
                  <p className="text-xs text-text-muted">
                    {miner.documentSummary.pending} pending · {miner.documentSummary.approved} approved · {miner.documentSummary.rejected} rejected
                  </p>
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  <p>{miner.listingSummary.total} total</p>
                  <p className="text-xs text-text-muted">
                    {miner.listingSummary.published} published · {miner.listingSummary.submitted} submitted
                  </p>
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  {(miner.primaryFocus?.length || miner.listingSummary.minerals.length) > 0
                    ? (miner.primaryFocus?.length ? miner.primaryFocus : miner.listingSummary.minerals).slice(0, 3).join(', ')
                    : '-'}
                </td>
                <td className="p-4 text-sm text-text-secondary">
                  {formatDate(miner.latestDocumentAt)}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => openMinerDetail(miner.id)}
                    className="rounded-md border border-border px-3 py-2 text-xs font-bold text-text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={detailLoading || !miner.detailAvailable}
                  >
                    {miner.detailAvailable ? 'View' : 'Registry only'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedMiner && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <button
            type="button"
            aria-label="Close miner detail"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelectedMiner(null)}
          />
          <aside className="relative h-full w-full max-w-3xl overflow-y-auto border-l border-border bg-secondary p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-sm font-semibold text-accent">Registry detail</p>
                <h2 className="mt-1 text-2xl font-bold text-text-primary">{selectedMiner.companyName}</h2>
                <p className="mt-1 text-sm text-text-secondary">{selectedMiner.user?.name || 'Unnamed contact'} · {selectedMiner.user?.email}</p>
              </div>
              <button
                onClick={() => setSelectedMiner(null)}
                className="rounded-md border border-border px-3 py-2 text-sm font-bold text-text-primary hover:border-accent hover:text-accent"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatBlock label="Documents" value={selectedMiner.documentSummary.total} />
              <StatBlock label="Listings" value={selectedMiner.listingSummary.total} />
              <StatBlock label="Pending docs" value={selectedMiner.documentSummary.pending} />
              <StatBlock label="Published" value={selectedMiner.listingSummary.published} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-lg border border-border bg-primary p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">Verification</h3>
                <div className="mt-4 space-y-3 text-sm text-text-secondary">
                  <div className="flex items-center justify-between gap-3">
                    <span>KYC status</span>
                    {statusChip(selectedMiner.verification.status)}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>License</span>
                    {statusChip(selectedMiner.verification.licenseStatus)}
                  </div>
                  <p>Onboarding: {selectedMiner.verification.onboardingComplete ? 'Complete' : 'Pending'}</p>
                  <p>Submitted: {formatDate(selectedMiner.verification.kycSubmittedAt)}</p>
                  <p>Verified: {formatDate(selectedMiner.verification.kycVerifiedAt)}</p>
                  <p>Rejected: {formatDate(selectedMiner.verification.kycRejectedAt)}</p>
                  <p className="break-all">MetaMap ID: {selectedMiner.verification.metamapVerificationId || '-'}</p>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-primary p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">Profile</h3>
                <div className="mt-4 space-y-2 text-sm text-text-secondary">
                  <p>Location: {selectedMiner.location || '-'}</p>
                  <p>Business address: {selectedMiner.businessAddress || '-'}</p>
                  <p>CAC number: {selectedMiner.companyRegNumber || '-'}</p>
                  <p>Cooperative: {selectedMiner.cooperativeName || '-'}</p>
                  <p>Cooperative reg: {selectedMiner.cooperativeRegNumber || '-'}</p>
                  <p>Partner type: {selectedMiner.partnerType || '-'}</p>
                  <p>Partner organization: {selectedMiner.partnerOrganization || '-'}</p>
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-lg border border-border bg-primary p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">Documents</h3>
              <div className="mt-4 space-y-3">
                {selectedMiner.documents.length === 0 ? (
                  <p className="text-sm text-text-muted">No documents uploaded.</p>
                ) : selectedMiner.documents.slice(0, 6).map((document) => (
                  <div key={document.id} className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-text-primary">{document.fileName}</p>
                      <p className="text-xs capitalize text-text-muted">{document.type.replace(/_/g, ' ')} · {formatDate(document.createdAt)}</p>
                      {document.reviewNotes && <p className="mt-1 text-xs text-text-secondary">{document.reviewNotes}</p>}
                    </div>
                    {statusChip(document.reviewStatus)}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-border bg-primary p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">Marketplace Activity</h3>
              <div className="mt-4 space-y-3">
                {selectedMiner.listings.length === 0 ? (
                  <p className="text-sm text-text-muted">No listings created.</p>
                ) : selectedMiner.listings.slice(0, 6).map((listing) => (
                  <div key={listing.id} className="flex items-start justify-between gap-4 border-b border-border/70 pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-text-primary">{listing.mineralType}</p>
                      <p className="text-xs text-text-muted">{listing.quantity} tons · NGN {Number(listing.price).toLocaleString()} · {formatDate(listing.createdAt)}</p>
                    </div>
                    {statusChip(listing.status)}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 rounded-lg border border-border bg-primary p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-muted">Timeline</h3>
              <div className="mt-4 space-y-4">
                {selectedMiner.timeline.length === 0 ? (
                  <p className="text-sm text-text-muted">No registry timeline yet.</p>
                ) : selectedMiner.timeline.map((event) => (
                  <div key={event.id} className="border-l-2 border-accent/50 pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold capitalize text-text-primary">{event.title}</p>
                      {statusChip(event.status)}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{formatDate(event.occurredAt)}</p>
                    {event.description && <p className="mt-1 text-sm text-text-secondary">{event.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
