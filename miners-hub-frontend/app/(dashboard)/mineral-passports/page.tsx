'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import FormModal from '../../../components/FormModal';
import DashboardSearchFilters, { ActiveFilter } from '../../../components/DashboardSearchFilters';
import {
  createMineralPassport,
  getMineralPassports,
  MineralPassport,
  MineralPassportStatus,
  updateMineralPassportStatus,
} from '../../../lib/api/mineral-passports';

const statusClasses: Record<MineralPassportStatus, string> = {
  active: 'bg-green-500/15 text-green-300 border-green-500/30',
  revoked: 'bg-red-500/15 text-red-300 border-red-500/30',
  disputed: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  expired: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const StatusChip = ({ status }: { status: MineralPassportStatus }) => (
  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusClasses[status]}`}>
    {status}
  </span>
);

export default function MineralPassportsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [passports, setPassports] = useState<MineralPassport[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | MineralPassportStatus>('all');
  const [selectedPassport, setSelectedPassport] = useState<MineralPassport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPassportFormOpen, setIsPassportFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    minerId: '',
    siteId: '',
    licenseId: '',
    productionReportId: '',
    labResultId: '',
    listingId: '',
    orderId: '',
    shipmentId: '',
    contractId: '',
    escrowTransactionId: '',
    notes: '',
  });

  const canIssue = currentUser?.role === 'admin' || currentUser?.role === 'government';

  const filteredPassports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return passports;
    return passports.filter((passport) => [
      passport.passportNumber,
      passport.id,
      passport.miner?.companyName,
      passport.snapshot?.miner?.companyName,
      passport.minerId,
      passport.labResult?.sampleReference,
      passport.labResultId,
      passport.listing?.mineralType,
      passport.listingId,
      passport.shipment?.trackingId,
      passport.shipmentId,
      passport.status,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [passports, searchTerm]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchTerm.trim()) filters.push({ key: 'search', label: `Search: ${searchTerm.trim()}`, clear: () => setSearchTerm('') });
    if (statusFilter !== 'all') filters.push({ key: 'status', label: `Status: ${statusFilter}`, clear: () => setStatusFilter('all') });
    return filters;
  }, [searchTerm, statusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const fetchPassports = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getMineralPassports(statusFilter === 'all' ? {} : { status: statusFilter });
      setPassports(response.data);
      setSelectedPassport((current) => current ? response.data.find((passport) => passport.id === current.id) || null : response.data[0] || null);
    } catch {
      setError('Unable to load mineral passports.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, statusFilter]);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    void fetchPassports();
  }, [currentUser, fetchPassports, router]);

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await createMineralPassport({
        minerId: form.minerId || undefined,
        siteId: form.siteId || null,
        licenseId: form.licenseId || null,
        productionReportId: form.productionReportId || null,
        labResultId: form.labResultId || null,
        listingId: form.listingId || null,
        orderId: form.orderId || null,
        shipmentId: form.shipmentId || null,
        contractId: form.contractId || null,
        escrowTransactionId: form.escrowTransactionId || null,
        snapshot: form.notes ? { issuerNotes: form.notes } : undefined,
      });
      setForm({
        minerId: '',
        siteId: '',
        licenseId: '',
        productionReportId: '',
        labResultId: '',
        listingId: '',
        orderId: '',
        shipmentId: '',
        contractId: '',
        escrowTransactionId: '',
        notes: '',
      });
      setIsPassportFormOpen(false);
      await fetchPassports();
    } catch {
      setError('Could not issue mineral passport. Check that at least one linked source resolves to a miner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (passport: MineralPassport, status: MineralPassportStatus) => {
    const reason = window.prompt(`Reason for marking passport ${status}`, '');
    if (reason === null) return;
    setIsSaving(true);
    try {
      await updateMineralPassportStatus(passport.id, { status, reason });
      await fetchPassports();
    } catch {
      setError('Could not update passport status.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mineral Passports</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Issue and verify traceability certificates from mine site through lab, listing, order, logistics, contract, and escrow data.
          </p>
        </div>
        {canIssue && (
          <button type="button" onClick={() => setIsPassportFormOpen(true)} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400">
            Issue Passport
          </button>
        )}
      </div>

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

      <DashboardSearchFilters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search passport numbers, miners, lab references, listings, or shipments"
        isFilterPanelOpen={isFilterPanelOpen}
        onToggleFilters={() => setIsFilterPanelOpen((open) => !open)}
        activeFilters={activeFilters}
        onReset={resetFilters}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm text-text-secondary">
            <span className="mb-1.5 block font-semibold">Passport status</span>
            <select className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="disputed">Disputed</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
          </label>
        </div>
      </DashboardSearchFilters>

      {canIssue && (
        <FormModal
          isOpen={isPassportFormOpen}
          title="Issue Passport"
          description="Link source records to generate a traceable mineral passport."
          onClose={() => setIsPassportFormOpen(false)}
        >
          <form className="space-y-3" onSubmit={handleCreate}>
            {[
              ['minerId', 'Miner ID'],
              ['siteId', 'Mine site ID'],
              ['licenseId', 'License ID'],
              ['productionReportId', 'Production report ID'],
              ['labResultId', 'Lab result ID'],
              ['listingId', 'Listing ID'],
              ['orderId', 'Order ID'],
              ['shipmentId', 'Shipment ID'],
              ['contractId', 'Contract ID'],
              ['escrowTransactionId', 'Escrow transaction ID'],
            ].map(([key, label]) => (
              <input
                key={key}
                className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
                placeholder={label}
                value={form[key as keyof typeof form]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
              />
            ))}
            <textarea
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary"
              placeholder="Issuer notes"
              rows={3}
              value={form.notes}
              onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPassportFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
              <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400 disabled:opacity-60" disabled={isSaving}>
                Issue Passport
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className={`grid gap-6 ${selectedPassport ? 'xl:grid-cols-[380px_1fr]' : ''}`}>
        {selectedPassport && (
          <div className="space-y-6">
            <section className="rounded-lg border border-border bg-secondary p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">{selectedPassport.passportNumber}</h2>
                  <p className="text-xs text-text-muted">Issued {selectedPassport.issuedAt ? new Date(selectedPassport.issuedAt).toLocaleString() : '-'}</p>
                </div>
                <StatusChip status={selectedPassport.status} />
              </div>
              <div className="mt-4 rounded-lg border border-border bg-primary p-4">
                <p className="text-xs uppercase tracking-wide text-text-muted">Public verification</p>
                <p className="mt-2 break-all text-sm text-text-primary">{selectedPassport.qrCodeUrl}</p>
                {selectedPassport.qrCodeUrl && (
                  <a className="mt-3 inline-flex rounded-md border border-accent px-3 py-2 text-sm font-semibold text-accent hover:bg-accent hover:text-accent-content" href={selectedPassport.qrCodeUrl} target="_blank" rel="noreferrer">
                    Open Certificate
                  </a>
                )}
              </div>
              {canIssue && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['active', 'disputed', 'revoked', 'expired'] as MineralPassportStatus[]).map((status) => (
                    <button key={status} className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-text-secondary hover:border-accent hover:text-accent disabled:opacity-50" disabled={isSaving || selectedPassport.status === status} onClick={() => handleStatusChange(selectedPassport, status)}>
                      Mark {status}
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        <section className="rounded-lg border border-border bg-secondary">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Traceability Register</h2>
              <p className="text-sm text-text-muted">{isLoading ? 'Loading passports...' : `${filteredPassports.length} passports shown`}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-primary text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Passport</th>
                  <th className="px-4 py-3">Miner</th>
                  <th className="px-4 py-3">Lab</th>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Shipment</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPassports.map((passport) => (
                  <tr key={passport.id} className={`cursor-pointer hover:bg-primary/50 ${selectedPassport?.id === passport.id ? 'bg-primary/60' : ''}`} onClick={() => setSelectedPassport(passport)}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-text-primary">{passport.passportNumber}</p>
                      <p className="text-xs text-text-muted">{passport.id}</p>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">{passport.miner?.companyName || passport.snapshot?.miner?.companyName || passport.minerId}</td>
                    <td className="px-4 py-4 text-text-secondary">{passport.labResult?.sampleReference || passport.labResultId || '-'}</td>
                    <td className="px-4 py-4 text-text-secondary">{passport.listing?.mineralType || passport.listingId || '-'}</td>
                    <td className="px-4 py-4 text-text-secondary">{passport.shipment?.trackingId || passport.shipmentId || '-'}</td>
                    <td className="px-4 py-4"><StatusChip status={passport.status} /></td>
                  </tr>
                ))}
                {!isLoading && filteredPassports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                      No mineral passports match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
