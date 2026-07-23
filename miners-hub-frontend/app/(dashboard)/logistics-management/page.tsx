'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  createLogisticsProvider,
  createShipment,
  getLogisticsProviders,
  getLogisticsQuoteRequests,
  getShipments,
  LogisticsProvider,
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
  serviceAreas: '',
  capabilities: '',
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
};

function splitList(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
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
  const [milestone, setMilestone] = useState({ status: 'in_transit' as ShipmentStatus, location: '', notes: '', proofUrl: '' });
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

  const submitProvider = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createLogisticsProvider({
        userId: providerForm.userId || null,
        companyName: providerForm.companyName,
        serviceAreas: splitList(providerForm.serviceAreas),
        capabilities: splitList(providerForm.capabilities),
        status: providerForm.status,
        contactEmail: providerForm.contactEmail || null,
        contactPhone: providerForm.contactPhone || null,
      });
      setProviderForm(emptyProvider);
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
        pickupLocation: shipmentForm.pickupLocation,
        deliveryLocation: shipmentForm.deliveryLocation,
      });
      setSelectedShipment(shipment);
      setShipmentForm(emptyShipment);
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
        quotedAmount: quoteAmount ? Number(quoteAmount) : quote.quotedAmount,
        quoteNotes: quoteNotes || quote.quoteNotes,
      });
      setQuoteAmount('');
      setQuoteNotes('');
      await loadLogistics();
    } catch (err: any) {
      setError(err?.message || 'Failed to update quote request');
    } finally {
      setSaving(false);
    }
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
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Logistics Management</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage logistics providers, haulage quotes, order-linked shipments, delivery milestones, and proof of handoff.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Providers</p><p className="text-xl font-bold">{summary.providers}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Quote requests</p><p className="text-xl font-bold">{summary.quotes}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Shipments</p><p className="text-xl font-bold">{summary.shipments}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Active shipments</p><p className="text-xl font-bold">{summary.activeShipments}</p></div>
      </div>

      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead><tr className="bg-primary/60 text-sm text-text-secondary"><th className="border-b border-border p-4">Tracking</th><th className="border-b border-border p-4">Route</th><th className="border-b border-border p-4">Provider</th><th className="border-b border-border p-4">Quote</th><th className="border-b border-border p-4">Status</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="p-8 text-center text-text-muted">Loading shipments...</td></tr> : shipments.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-text-muted">No shipments yet.</td></tr> : shipments.map((shipment) => (
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
              {quotes.length === 0 ? <p className="text-sm text-text-muted">No quote requests yet.</p> : quotes.slice(0, 8).map((quote) => (
                <div key={quote.id} className="rounded-lg border border-border bg-primary p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-semibold text-text-primary">{quote.origin} to {quote.destination}</p>
                      <p className="text-sm text-text-secondary">{quote.commodity} · {Number(quote.weight).toLocaleString()}kg · {quote.containerType}</p>
                      <p className="text-xs text-text-muted">{quote.contactName} · {quote.contactEmail}</p>
                    </div>
                    <div>{statusChip(quote.status)}</div>
                  </div>
                  {isAdmin && (
                    <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_auto_auto_auto]">
                      <input value={quoteAmount} onChange={(event) => setQuoteAmount(event.target.value)} placeholder="Quote amount" className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none" />
                      <input value={quoteNotes} onChange={(event) => setQuoteNotes(event.target.value)} placeholder="Quote notes" className="rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none" />
                      <button onClick={() => quoteRequest(quote, 'quoted')} disabled={saving} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">Quote</button>
                      <button onClick={() => quoteRequest(quote, 'accepted')} disabled={saving} className="rounded-md border border-green-500/40 px-3 py-2 text-xs font-bold text-green-300 hover:bg-green-500/10">Accept</button>
                      <button onClick={() => quoteRequest(quote, 'declined')} disabled={saving} className="rounded-md border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">Decline</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          {isAdmin && (
            <form onSubmit={submitProvider} className="rounded-lg border border-border bg-secondary p-4">
              <h2 className="font-bold text-text-primary">Add Provider</h2>
              <div className="mt-4 space-y-3">
                <input required value={providerForm.companyName} onChange={(event) => setProviderForm({ ...providerForm, companyName: event.target.value })} placeholder="Company name" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                <input value={providerForm.userId} onChange={(event) => setProviderForm({ ...providerForm, userId: event.target.value })} placeholder="Linked user ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                <input value={providerForm.serviceAreas} onChange={(event) => setProviderForm({ ...providerForm, serviceAreas: event.target.value })} placeholder="Service areas" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                <input value={providerForm.capabilities} onChange={(event) => setProviderForm({ ...providerForm, capabilities: event.target.value })} placeholder="Capabilities" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                <input value={providerForm.contactEmail} onChange={(event) => setProviderForm({ ...providerForm, contactEmail: event.target.value })} placeholder="Contact email" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Save Provider</button>
              </div>
            </form>
          )}

          <form onSubmit={submitShipment} className="rounded-lg border border-border bg-secondary p-4">
            <h2 className="font-bold text-text-primary">Create Shipment</h2>
            <div className="mt-4 space-y-3">
              <input required value={shipmentForm.orderId} onChange={(event) => setShipmentForm({ ...shipmentForm, orderId: event.target.value })} placeholder="Order ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
              <select value={shipmentForm.providerId} onChange={(event) => setShipmentForm({ ...shipmentForm, providerId: event.target.value })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none">
                <option value="">No provider assigned</option>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.companyName}</option>)}
              </select>
              <input value={shipmentForm.mineralPassportId} onChange={(event) => setShipmentForm({ ...shipmentForm, mineralPassportId: event.target.value })} placeholder="Mineral passport ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
              <input value={shipmentForm.quoteAmount} onChange={(event) => setShipmentForm({ ...shipmentForm, quoteAmount: event.target.value })} placeholder="Quote amount" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
              <input required value={shipmentForm.pickupLocation} onChange={(event) => setShipmentForm({ ...shipmentForm, pickupLocation: event.target.value })} placeholder="Pickup location" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
              <input required value={shipmentForm.deliveryLocation} onChange={(event) => setShipmentForm({ ...shipmentForm, deliveryLocation: event.target.value })} placeholder="Delivery location" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
              <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Create Shipment</button>
            </div>
          </form>

          {selectedShipment && (
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
                <div className="grid grid-cols-1 gap-2">
                  <select value={milestone.status} onChange={(event) => setMilestone({ ...milestone, status: event.target.value as ShipmentStatus })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none">
                    {shipmentStatuses.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                  </select>
                  <input value={milestone.location} onChange={(event) => setMilestone({ ...milestone, location: event.target.value })} placeholder="Milestone location" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                  <input value={milestone.notes} onChange={(event) => setMilestone({ ...milestone, notes: event.target.value })} placeholder="Milestone notes" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                  <input value={milestone.proofUrl} onChange={(event) => setMilestone({ ...milestone, proofUrl: event.target.value })} placeholder="Proof URL" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none" />
                  <button onClick={submitMilestone} disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Add Milestone</button>
                </div>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
