'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import FormModal from '../../../components/FormModal';
import DashboardSearchFilters, { ActiveFilter } from '../../../components/DashboardSearchFilters';
import MultiFileInput, { FilePreview } from '../../../components/MultiFileInput';
import { uploadDocument } from '../../../lib/api/documents';
import { DocumentType } from '../../../lib/types';
import {
  createLogisticsProvider,
  createShipment,
  getLogisticsProviders,
  getLogisticsQuoteRequests,
  getShipments,
  LogisticsProvider,
  LogisticsProviderCategory,
  LogisticsQuoteRequest,
  Shipment,
  ShipmentStatus,
  updateLogisticsQuoteRequest,
  updateShipmentStatus,
} from '../../../lib/api/logistics';

const shipmentStatuses: ShipmentStatus[] = ['quote_requested', 'scheduled', 'picked_up', 'in_transit', 'at_checkpoint', 'delivered', 'disputed', 'cancelled'];

const emptyProvider = {
  userId: '',
  companyName: '',
  category: 'local_haulage' as LogisticsProviderCategory,
  serviceAreas: '',
  capabilities: '',
  fleetProfiles: '',
  integrationMetadata: '',
  status: 'pending' as const,
  contactEmail: '',
  contactPhone: '',
};

const emptyShipment = {
  orderId: '',
  providerId: '',
  mineralPassportId: '',
  quoteAmount: '',
  pickupLocation: '',
  deliveryLocation: '',
  currency: 'NGN',
  trackingReferences: '',
  internationalDetails: '',
  invoiceMetadata: '',
};

function splitList(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function parseJsonObject(value: string) {
  if (!value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function parseFleetProfiles(value: string) {
  return value.split('\n').map((line) => {
    const [plateNumber, vehicleType, capacityTons, driverName, driverPhone] = line.split('|').map((item) => item?.trim());
    if (!plateNumber && !vehicleType) return null;
    return {
      plateNumber,
      vehicleType,
      capacityTons: capacityTons ? Number(capacityTons) : undefined,
      driverName,
      driverPhone,
      availability: 'available',
    };
  }).filter(Boolean) as Array<Record<string, any>>;
}

function statusChip(status: string) {
  const classes: Record<string, string> = {
    active: 'bg-green-500/15 text-green-300 border-green-500/30',
    delivered: 'bg-green-500/15 text-green-300 border-green-500/30',
    accepted: 'bg-green-500/15 text-green-300 border-green-500/30',
    quoted: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    scheduled: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    in_transit: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    requested: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    quote_requested: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    picked_up: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    at_checkpoint: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    suspended: 'bg-red-500/15 text-red-300 border-red-500/30',
    declined: 'bg-red-500/15 text-red-300 border-red-500/30',
    disputed: 'bg-red-500/15 text-red-300 border-red-500/30',
    cancelled: 'bg-border text-text-muted border-border',
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || classes.cancelled}`}>{status.replace(/_/g, ' ')}</span>;
}

function money(value?: number | null) {
  return `NGN ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '-';
}

export default function LogisticsManagementPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [providers, setProviders] = useState<LogisticsProvider[]>([]);
  const [quotes, setQuotes] = useState<LogisticsQuoteRequest[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [providerForm, setProviderForm] = useState(emptyProvider);
  const [shipmentForm, setShipmentForm] = useState(emptyShipment);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [quoteProviderId, setQuoteProviderId] = useState('');
  const [quoteEta, setQuoteEta] = useState('');
  const [quoteCurrency, setQuoteCurrency] = useState('NGN');
  const [milestone, setMilestone] = useState({ status: 'in_transit' as ShipmentStatus, location: '', notes: '', proofUrl: '' });
  const [proofFiles, setProofFiles] = useState<FilePreview[]>([]);
  const [isProviderFormOpen, setIsProviderFormOpen] = useState(false);
  const [isShipmentFormOpen, setIsShipmentFormOpen] = useState(false);
  const [isMilestoneFormOpen, setIsMilestoneFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [shipmentStatusFilter, setShipmentStatusFilter] = useState<'all' | ShipmentStatus>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canUsePage = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'admin';

  const summary = useMemo(() => ({
    providers: providers.length,
    quotes: quotes.length,
    shipments: shipments.length,
    activeShipments: shipments.filter((shipment) => !['delivered', 'cancelled'].includes(shipment.status)).length,
  }), [providers, quotes, shipments]);

  const filteredShipments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const matchesStatus = shipmentStatusFilter === 'all' || shipment.status === shipmentStatusFilter;
      const matchesSearch = !term || [
        shipment.trackingId,
        shipment.orderId,
        shipment.pickupLocation,
        shipment.deliveryLocation,
        shipment.provider?.companyName,
        shipment.mineralPassportId,
        shipment.status,
      ].some((value) => String(value || '').toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, shipmentStatusFilter, shipments]);

  const filteredQuotes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return quotes;
    return quotes.filter((quote) => [
      quote.origin,
      quote.destination,
      quote.commodity,
      quote.containerType,
      quote.contactName,
      quote.contactEmail,
      quote.status,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [quotes, searchTerm]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchTerm.trim()) filters.push({ key: 'search', label: `Search: ${searchTerm.trim()}`, clear: () => setSearchTerm('') });
    if (shipmentStatusFilter !== 'all') filters.push({ key: 'status', label: `Shipment: ${shipmentStatusFilter.replace(/_/g, ' ')}`, clear: () => setShipmentStatusFilter('all') });
    return filters;
  }, [searchTerm, shipmentStatusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setShipmentStatusFilter('all');
  };

  const loadLogistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [providerData, quoteData, shipmentData] = await Promise.all([
        getLogisticsProviders(),
        getLogisticsQuoteRequests(),
        getShipments(),
      ]);
      setProviders(providerData);
      setQuotes(quoteData.data);
      setShipments(shipmentData.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load logistics records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser === null) {
      router.push('/login');
      return;
    }
    if (canUsePage) void loadLogistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, canUsePage, router]);

  useEffect(() => {
    return () => {
      proofFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [proofFiles]);

  const submitProvider = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createLogisticsProvider({
        userId: providerForm.userId || null,
        companyName: providerForm.companyName,
        category: providerForm.category,
        serviceAreas: splitList(providerForm.serviceAreas),
        capabilities: splitList(providerForm.capabilities),
        status: providerForm.status,
        contactEmail: providerForm.contactEmail || null,
        contactPhone: providerForm.contactPhone || null,
        fleetProfiles: parseFleetProfiles(providerForm.fleetProfiles),
        integrationMetadata: parseJsonObject(providerForm.integrationMetadata),
      });
      setProviderForm(emptyProvider);
      setIsProviderFormOpen(false);
      await loadLogistics();
    } catch (err: any) {
      setError(err?.message || 'Failed to save provider');
    } finally {
      setSaving(false);
    }
  };

  const submitShipment = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const shipment = await createShipment({
        orderId: shipmentForm.orderId,
        providerId: shipmentForm.providerId || null,
        mineralPassportId: shipmentForm.mineralPassportId || null,
        quoteAmount: shipmentForm.quoteAmount ? Number(shipmentForm.quoteAmount) : null,
        currency: shipmentForm.currency || 'NGN',
        pickupLocation: shipmentForm.pickupLocation,
        deliveryLocation: shipmentForm.deliveryLocation,
        trackingReferences: parseJsonObject(shipmentForm.trackingReferences),
        internationalDetails: parseJsonObject(shipmentForm.internationalDetails),
        invoiceMetadata: parseJsonObject(shipmentForm.invoiceMetadata),
      });
      setSelectedShipment(shipment);
      setShipmentForm(emptyShipment);
      setIsShipmentFormOpen(false);
      await loadLogistics();
    } catch (err: any) {
      setError(err?.message || 'Failed to create shipment');
    } finally {
      setSaving(false);
    }
  };

  const quoteRequest = async (quote: LogisticsQuoteRequest, status: 'quoted' | 'accepted' | 'declined') => {
    setSaving(true);
    setError(null);
    try {
      await updateLogisticsQuoteRequest(quote.id, {
        status,
        providerId: quoteProviderId || quote.providerId || null,
        quotedAmount: quoteAmount ? Number(quoteAmount) : quote.quotedAmount,
        quoteNotes: quoteNotes || quote.quoteNotes,
        eta: quoteEta || quote.eta,
        currency: quoteCurrency || quote.currency,
      });
      setQuoteAmount('');
      setQuoteNotes('');
      setQuoteProviderId('');
      setQuoteEta('');
      setQuoteCurrency('NGN');
      await loadLogistics();
    } catch (err: any) {
      setError(err?.message || 'Failed to update quote request');
    } finally {
      setSaving(false);
    }
  };

  const handleProofFilesAdded = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setSaving(true);
    setError(null);
    proofFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    const preview = { file, previewUrl: URL.createObjectURL(file) };
    setProofFiles([preview]);
    try {
      const document = await uploadDocument(file, {
        type: DocumentType.OTHER,
        uploadCategory: 'logistics_proof',
      });
      setMilestone((current) => ({ ...current, proofUrl: document.url }));
    } catch (err: any) {
      URL.revokeObjectURL(preview.previewUrl);
      setProofFiles([]);
      setError(err?.message || 'Failed to upload proof document');
    } finally {
      setSaving(false);
    }
  };

  const removeProofFile = (index: number) => {
    const file = proofFiles[index];
    if (file) URL.revokeObjectURL(file.previewUrl);
    setProofFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setMilestone((current) => ({ ...current, proofUrl: '' }));
  };

  const submitMilestone = async () => {
    if (!selectedShipment) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateShipmentStatus(selectedShipment.id, {
        status: milestone.status,
        location: milestone.location,
        notes: milestone.notes,
        handoffEvidence: milestone.proofUrl ? { proofUrl: milestone.proofUrl } : undefined,
      });
      setSelectedShipment(updated);
      setMilestone({ status: 'in_transit', location: '', notes: '', proofUrl: '' });
      setIsMilestoneFormOpen(false);
      await loadLogistics();
    } catch (err: any) {
      setError(err?.message || 'Failed to update shipment milestone');
    } finally {
      setSaving(false);
    }
  };

  if (!canUsePage) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Logistics Management</h1>
          <p className="mt-1 text-sm text-text-secondary">Manage logistics providers, haulage quotes, order-linked shipments, delivery milestones, and proof of handoff.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button type="button" onClick={() => setIsProviderFormOpen(true)} className="rounded-md border border-border px-4 py-2 text-sm font-bold text-text-primary hover:border-accent hover:text-accent">Add Provider</button>
          )}
          <button type="button" onClick={() => setIsShipmentFormOpen(true)} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Create Shipment</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Providers</p><p className="text-xl font-bold">{summary.providers}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Quote requests</p><p className="text-xl font-bold">{summary.quotes}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Shipments</p><p className="text-xl font-bold">{summary.shipments}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Active shipments</p><p className="text-xl font-bold">{summary.activeShipments}</p></div>
      </div>

      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <DashboardSearchFilters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search tracking IDs, routes, providers, orders, or quote requests"
        isFilterPanelOpen={isFilterPanelOpen}
        onToggleFilters={() => setIsFilterPanelOpen((open) => !open)}
        activeFilters={activeFilters}
        onReset={resetFilters}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm text-text-secondary">
            <span className="mb-1.5 block font-semibold">Shipment status</span>
            <select value={shipmentStatusFilter} onChange={(event) => setShipmentStatusFilter(event.target.value as typeof shipmentStatusFilter)} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
              <option value="all">All statuses</option>
              {shipmentStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
        </div>
      </DashboardSearchFilters>

      {isAdmin && (
        <FormModal
          isOpen={isProviderFormOpen}
          title="Add Provider"
          description="Register a logistics provider with service areas and transport capabilities."
          onClose={() => setIsProviderFormOpen(false)}
        >
          <form onSubmit={submitProvider} className="space-y-3">
            <input required value={providerForm.companyName} onChange={(event) => setProviderForm({ ...providerForm, companyName: event.target.value })} placeholder="Company name" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <select value={providerForm.category} onChange={(event) => setProviderForm({ ...providerForm, category: event.target.value as LogisticsProviderCategory })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none">
              <option value="local_haulage">Local haulage</option>
              <option value="international_carrier">International carrier</option>
              <option value="warehousing">Warehousing</option>
              <option value="customs_clearing">Customs / clearing</option>
              <option value="last_mile">Last mile</option>
            </select>
            <input value={providerForm.userId} onChange={(event) => setProviderForm({ ...providerForm, userId: event.target.value })} placeholder="Linked user ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <input value={providerForm.serviceAreas} onChange={(event) => setProviderForm({ ...providerForm, serviceAreas: event.target.value })} placeholder="Service areas" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <input value={providerForm.capabilities} onChange={(event) => setProviderForm({ ...providerForm, capabilities: event.target.value })} placeholder="Capabilities" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <textarea value={providerForm.fleetProfiles} onChange={(event) => setProviderForm({ ...providerForm, fleetProfiles: event.target.value })} placeholder="Fleet profiles, one per line: plate | vehicle type | capacity tons | driver | phone" rows={3} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <textarea value={providerForm.integrationMetadata} onChange={(event) => setProviderForm({ ...providerForm, integrationMetadata: event.target.value })} placeholder='Integration metadata JSON, e.g. {"provider":"maersk","trackingApi":true,"invoiceApi":false}' rows={3} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <input value={providerForm.contactEmail} onChange={(event) => setProviderForm({ ...providerForm, contactEmail: event.target.value })} placeholder="Contact email" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsProviderFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
              <button disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Save Provider</button>
            </div>
          </form>
        </FormModal>
      )}

      <FormModal
        isOpen={isShipmentFormOpen}
        title="Create Shipment"
        description="Create an order-linked shipment and optionally assign a logistics provider."
        onClose={() => setIsShipmentFormOpen(false)}
      >
        <form onSubmit={submitShipment} className="space-y-3">
          <input required value={shipmentForm.orderId} onChange={(event) => setShipmentForm({ ...shipmentForm, orderId: event.target.value })} placeholder="Order ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <select value={shipmentForm.providerId} onChange={(event) => setShipmentForm({ ...shipmentForm, providerId: event.target.value })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none">
            <option value="">No provider assigned</option>
            {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.companyName}</option>)}
          </select>
          <input value={shipmentForm.mineralPassportId} onChange={(event) => setShipmentForm({ ...shipmentForm, mineralPassportId: event.target.value })} placeholder="Mineral passport ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <input value={shipmentForm.quoteAmount} onChange={(event) => setShipmentForm({ ...shipmentForm, quoteAmount: event.target.value })} placeholder="Quote amount" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <input value={shipmentForm.currency} onChange={(event) => setShipmentForm({ ...shipmentForm, currency: event.target.value })} placeholder="Currency" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <input required value={shipmentForm.pickupLocation} onChange={(event) => setShipmentForm({ ...shipmentForm, pickupLocation: event.target.value })} placeholder="Pickup location" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <input required value={shipmentForm.deliveryLocation} onChange={(event) => setShipmentForm({ ...shipmentForm, deliveryLocation: event.target.value })} placeholder="Delivery location" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <textarea value={shipmentForm.trackingReferences} onChange={(event) => setShipmentForm({ ...shipmentForm, trackingReferences: event.target.value })} placeholder='Tracking references JSON, e.g. {"carrier":"maersk","containerNumber":"MSKU...","externalTrackingUrl":"https://..."}' rows={3} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <textarea value={shipmentForm.internationalDetails} onChange={(event) => setShipmentForm({ ...shipmentForm, internationalDetails: event.target.value })} placeholder='International details JSON, e.g. {"portOfLoading":"Apapa","portOfDischarge":"Rotterdam","incoterms":"FOB"}' rows={3} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <textarea value={shipmentForm.invoiceMetadata} onChange={(event) => setShipmentForm({ ...shipmentForm, invoiceMetadata: event.target.value })} placeholder='Invoice metadata JSON, or leave blank until invoice upload/API sync' rows={3} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsShipmentFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
            <button disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Create Shipment</button>
          </div>
        </form>
      </FormModal>

      {selectedShipment && (
        <FormModal
          isOpen={isMilestoneFormOpen}
          title="Add Milestone"
          description={`Update shipment ${selectedShipment.trackingId} with the latest route or handoff event.`}
          onClose={() => setIsMilestoneFormOpen(false)}
        >
          <div className="grid grid-cols-1 gap-3">
            <select value={milestone.status} onChange={(event) => setMilestone({ ...milestone, status: event.target.value as ShipmentStatus })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none">
              {shipmentStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
            </select>
            <input value={milestone.location} onChange={(event) => setMilestone({ ...milestone, location: event.target.value })} placeholder="Milestone location" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <input value={milestone.notes} onChange={(event) => setMilestone({ ...milestone, notes: event.target.value })} placeholder="Milestone notes" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
            <MultiFileInput
              id="logistics-proof"
              label="Pickup, checkpoint, or delivery proof"
              files={proofFiles}
              onFilesAdded={(files) => void handleProofFilesAdded(files)}
              onFileRemoved={removeProofFile}
              accept="image/png,image/jpeg,application/pdf"
              helperText="Drop a JPG, PNG, or PDF proof document. It uploads to Cloudinary immediately."
              multiple={false}
              maxFiles={1}
              disabled={saving}
            />
            {milestone.proofUrl && <p className="text-xs text-text-muted">Proof attached and ready to save with this milestone.</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsMilestoneFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
              <button type="button" onClick={submitMilestone} disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Add Milestone</button>
            </div>
          </div>
        </FormModal>
      )}

      <div className={`grid grid-cols-1 gap-6 ${selectedShipment ? 'xl:grid-cols-[1.2fr_0.8fr]' : ''}`}>
        <section className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead><tr className="bg-primary/60 text-sm text-text-secondary"><th className="border-b border-border p-4">Tracking</th><th className="border-b border-border p-4">Route</th><th className="border-b border-border p-4">Provider</th><th className="border-b border-border p-4">Quote</th><th className="border-b border-border p-4">Status</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="p-8 text-center text-text-muted">Loading shipments...</td></tr> : filteredShipments.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-text-muted">No shipments match the current search.</td></tr> : filteredShipments.map((shipment) => (
                  <tr key={shipment.id} onClick={() => setSelectedShipment(shipment)} className="cursor-pointer border-b border-border hover:bg-primary/40">
                    <td className="p-4 font-semibold text-text-primary">{shipment.trackingId}</td>
                    <td className="p-4 text-sm text-text-secondary">{shipment.pickupLocation} to {shipment.deliveryLocation}</td>
                    <td className="p-4 text-sm text-text-secondary">{shipment.provider?.companyName || '-'}</td>
                    <td className="p-4 text-sm text-text-secondary">{money(shipment.quoteAmount)}</td>
                    <td className="p-4">{statusChip(shipment.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-secondary p-4">
            <h2 className="font-bold text-text-primary">Quote Requests</h2>
            <div className="mt-4 space-y-3">
              {filteredQuotes.length === 0 ? <p className="text-sm text-text-muted">No quote requests match the current search.</p> : filteredQuotes.slice(0, 8).map((quote) => (
                <div key={quote.id} className="rounded-lg border border-border bg-primary p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{quote.origin} to {quote.destination}</p>
                      <p className="text-sm text-text-secondary">{quote.commodity} · {Number(quote.weight).toLocaleString()}kg · {quote.containerType}</p>
                      <p className="text-xs text-text-muted">{quote.contactName} · {quote.contactEmail}</p>
                    </div>
                    <div>{statusChip(quote.status)}</div>
                  </div>
                  {(isAdmin || (quote.requesterUserId === currentUser?.id && quote.status === 'quoted')) && (
                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-[1fr_1fr_1fr_0.7fr_auto_auto_auto]">
                      {isAdmin && (
                        <select value={quoteProviderId} onChange={(event) => setQuoteProviderId(event.target.value)} className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none">
                          <option value="">Assign provider</option>
                          {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.companyName}</option>)}
                        </select>
                      )}
                      <input value={quoteAmount} onChange={(event) => setQuoteAmount(event.target.value)} placeholder="Quote amount" className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none" />
                      <input value={quoteNotes} onChange={(event) => setQuoteNotes(event.target.value)} placeholder="Quote notes" className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none" />
                      <input value={quoteEta} onChange={(event) => setQuoteEta(event.target.value)} placeholder="ETA" className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none" />
                      <input value={quoteCurrency} onChange={(event) => setQuoteCurrency(event.target.value)} placeholder="Currency" className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none" />
                      {isAdmin && <button onClick={() => quoteRequest(quote, 'quoted')} disabled={saving} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">Quote</button>}
                      <button onClick={() => quoteRequest(quote, 'accepted')} disabled={saving || quote.status !== 'quoted'} className="rounded-md border border-green-500/40 px-3 py-2 text-xs font-bold text-green-300 hover:bg-green-500/10 disabled:opacity-50">Accept</button>
                      <button onClick={() => quoteRequest(quote, 'declined')} disabled={saving || quote.status === 'accepted'} className="rounded-md border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-50">Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedShipment && (
          <aside className="space-y-6">
            <section className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-accent">Shipment detail</p><h2 className="mt-1 text-xl font-bold">{selectedShipment.trackingId}</h2></div>
                <button onClick={() => setSelectedShipment(null)} className="text-sm font-semibold text-text-muted hover:text-accent">Close</button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <div>{statusChip(selectedShipment.status)}</div>
                <p>Order: {selectedShipment.orderId}</p>
                <p>Passport: {selectedShipment.mineralPassportId || '-'}</p>
                <p>Evidence: {selectedShipment.handoffEvidence?.proofUrl || '-'}</p>
                <div className="rounded-lg border border-border bg-primary p-3">
                  <p className="font-semibold text-text-primary">Milestones</p>
                  <div className="mt-3 space-y-3">
                    {selectedShipment.milestones.map((item, index) => (
                      <div key={`${item.status}-${item.occurredAt}-${index}`} className="border-l-2 border-accent/50 pl-3">
                        <p className="font-semibold capitalize text-text-primary">{item.status.replace(/_/g, ' ')}</p>
                        <p className="text-xs text-text-muted">{formatDate(item.occurredAt)} · {item.location || '-'}</p>
                        {item.notes && <p className="text-xs text-text-secondary">{item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => setIsMilestoneFormOpen(true)} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Add Milestone</button>
              </div>
            </section>
          </aside>
        )}
      </div>
    </div>
  );
}
