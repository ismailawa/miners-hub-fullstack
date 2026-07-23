'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  createMineSite,
  deleteMineSite,
  getMineSites,
  MineSite,
  MineSiteFilters,
  MineSitePayload,
  MineSiteRiskLevel,
  MineSiteStatus,
  updateMineSite,
} from '../../../lib/api/mine-sites';
import { flushFieldQueue, getFieldQueue, queueFieldSubmission } from '../../../lib/offline/field-queue';

const statusOptions: Array<'all' | MineSiteStatus> = ['all', 'planned', 'active', 'suspended', 'closed'];
const riskOptions: Array<'all' | MineSiteRiskLevel> = ['all', 'low', 'medium', 'high', 'critical'];

const emptyForm = {
  name: '',
  operatorId: '',
  licenseId: '',
  mineralTypes: '',
  state: '',
  lga: '',
  community: '',
  latitude: '',
  longitude: '',
  siteStatus: 'planned' as MineSiteStatus,
  riskLevel: 'medium' as MineSiteRiskLevel,
  documentIds: '',
  productionReportIds: '',
  complianceCaseIds: '',
  environmentalRecordIds: '',
};

function statusChip(status: string) {
  const classes: Record<string, string> = {
    active: 'bg-green-500/15 text-green-300 border-green-500/30',
    low: 'bg-green-500/15 text-green-300 border-green-500/30',
    planned: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    suspended: 'bg-red-500/15 text-red-300 border-red-500/30',
    high: 'bg-red-500/15 text-red-300 border-red-500/30',
    critical: 'bg-red-700/30 text-red-200 border-red-500/40',
    closed: 'bg-border text-text-muted border-border',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || classes.closed}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

function toForm(site: MineSite) {
  return {
    name: site.name,
    operatorId: site.operatorId,
    licenseId: site.licenseId || '',
    mineralTypes: site.mineralTypes.join(', '),
    state: site.state,
    lga: site.lga || '',
    community: site.community || '',
    latitude: site.latitude?.toString() || '',
    longitude: site.longitude?.toString() || '',
    siteStatus: site.siteStatus,
    riskLevel: site.riskLevel,
    documentIds: site.documentIds.join(', '),
    productionReportIds: site.productionReportIds.join(', '),
    complianceCaseIds: site.complianceCaseIds.join(', '),
    environmentalRecordIds: site.environmentalRecordIds.join(', '),
  };
}

function buildPayload(form: typeof emptyForm, isAdmin: boolean): MineSitePayload {
  return {
    name: form.name,
    operatorId: isAdmin ? form.operatorId || undefined : undefined,
    licenseId: form.licenseId || null,
    mineralTypes: splitList(form.mineralTypes),
    state: form.state,
    lga: form.lga || null,
    community: form.community || null,
    latitude: form.latitude ? Number(form.latitude) : null,
    longitude: form.longitude ? Number(form.longitude) : null,
    siteStatus: form.siteStatus,
    riskLevel: form.riskLevel,
    documentIds: splitList(form.documentIds),
    productionReportIds: splitList(form.productionReportIds),
    complianceCaseIds: splitList(form.complianceCaseIds),
    environmentalRecordIds: splitList(form.environmentalRecordIds),
  };
}

export default function MineSitesPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [sites, setSites] = useState<MineSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<MineSite | null>(null);
  const [editingSite, setEditingSite] = useState<MineSite | null>(null);
  const [filters, setFilters] = useState<MineSiteFilters>({
    search: '',
    state: '',
    mineralType: '',
    siteStatus: 'all',
    riskLevel: 'all',
  });
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const canAssignOperator = currentUser?.role === 'admin' || currentUser?.role === 'government';
  const canUsePage = currentUser?.role === 'admin' || currentUser?.role === 'government' || currentUser?.role === 'miner';

  const summary = useMemo(() => ({
    total: sites.length,
    active: sites.filter((site) => site.siteStatus === 'active').length,
    critical: sites.filter((site) => site.riskLevel === 'critical').length,
    linkedLicenses: sites.filter((site) => site.links.hasLicense).length,
  }), [sites]);

  const mappedSites = useMemo(() => {
    return sites.filter((site) => site.latitude !== null && site.longitude !== null);
  }, [sites]);

  const loadSites = async (nextFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMineSites(nextFilters);
      setSites(response.data);
      if (selectedSite && !response.data.some((site) => site.id === selectedSite.id)) {
        setSelectedSite(null);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load mine sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !canUsePage) {
      router.push('/dashboard');
      return;
    }

    if (canUsePage) {
      void loadSites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, canUsePage, router]);

  useEffect(() => {
    const updateQueuedCount = () => {
      setQueuedCount(getFieldQueue().filter((item) => item.kind === 'mine_site').length);
    };
    updateQueuedCount();
    window.addEventListener('miners-hub-field-queue-change', updateQueuedCount);
    return () => window.removeEventListener('miners-hub-field-queue-change', updateQueuedCount);
  }, []);

  useEffect(() => {
    const updateOnlineState = () => setIsOnline(navigator.onLine);
    updateOnlineState();
    window.addEventListener('online', updateOnlineState);
    window.addEventListener('offline', updateOnlineState);
    return () => {
      window.removeEventListener('online', updateOnlineState);
      window.removeEventListener('offline', updateOnlineState);
    };
  }, []);

  const updateFilter = (key: keyof MineSiteFilters, value: string) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);
    if (key === 'siteStatus' || key === 'riskLevel') {
      void loadSites(nextFilters);
    }
  };

  const resetForm = () => {
    setEditingSite(null);
    setForm(emptyForm);
  };

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload(form, canAssignOperator);
      if (!isOnline && !editingSite) {
        queueFieldSubmission({
          kind: 'mine_site',
          endpoint: '/api/mine-sites',
          method: 'POST',
          payload,
        });
        resetForm();
        setError('Mine site saved offline and will sync when connection returns.');
        return;
      }
      const saved = editingSite
        ? await updateMineSite(editingSite.id, payload)
        : await createMineSite(payload);
      setSelectedSite(saved);
      resetForm();
      await loadSites();
    } catch (err: any) {
      setError(err?.message || 'Failed to save mine site');
    } finally {
      setSaving(false);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Location capture is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setForm((current) => ({
        ...current,
        latitude: String(position.coords.latitude),
        longitude: String(position.coords.longitude),
      })),
      () => setError('Could not capture current location.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const syncQueuedSites = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await flushFieldQueue();
      setQueuedCount(getFieldQueue().filter((item) => item.kind === 'mine_site').length);
      setError(`Synced ${result.sent} queued field submission${result.sent === 1 ? '' : 's'}.`);
      await loadSites();
    } catch {
      setError('Could not sync queued submissions yet.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (site: MineSite) => {
    setEditingSite(site);
    setForm(toForm(site));
  };

  const removeSite = async (site: MineSite) => {
    setSaving(true);
    setError(null);
    try {
      await deleteMineSite(site.id);
      setSelectedSite(null);
      if (editingSite?.id === site.id) resetForm();
      await loadSites();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete mine site');
    } finally {
      setSaving(false);
    }
  };

  if (currentUser && !canUsePage) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mine Sites Map</h1>
          <p className="mt-1 text-sm text-text-secondary">Track operator sites, coordinates, licenses, production links, compliance exposure, and environmental risk.</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">PostGIS evaluation</p>
          <p className="mt-1 max-w-xl">MVP stores coordinates and optional GeoJSON. Enable PostGIS before polygon editing, proximity search, and clustering become production requirements.</p>
        </div>
      </div>

      {queuedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-100 md:flex-row md:items-center md:justify-between">
          <span>{queuedCount} mine site draft{queuedCount === 1 ? '' : 's'} waiting to sync.</span>
          <button onClick={syncQueuedSites} disabled={saving || !isOnline} className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-60">Sync Now</button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Sites</p><p className="text-xl font-bold">{summary.total}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Active</p><p className="text-xl font-bold">{summary.active}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Critical risk</p><p className="text-xl font-bold">{summary.critical}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Linked licenses</p><p className="text-xl font-bold">{summary.linkedLicenses}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-secondary p-4 md:grid-cols-6">
        <input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Search site, community, operator" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent md:col-span-2" />
        <input value={filters.state} onChange={(event) => updateFilter('state', event.target.value)} placeholder="State" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <input value={filters.mineralType} onChange={(event) => updateFilter('mineralType', event.target.value)} placeholder="Mineral" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
        <select value={filters.siteStatus} onChange={(event) => updateFilter('siteStatus', event.target.value)} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
          {statusOptions.map((status) => <option key={status} value={status}>Status: {status}</option>)}
        </select>
        <select value={filters.riskLevel} onChange={(event) => updateFilter('riskLevel', event.target.value)} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
          {riskOptions.map((risk) => <option key={risk} value={risk}>Risk: {risk}</option>)}
        </select>
        <button onClick={() => loadSites(filters)} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 md:col-start-6">Apply</button>
      </div>

      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="overflow-hidden rounded-lg border border-border bg-secondary">
          <div className="relative h-[520px] bg-primary">
            <div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
            <div className="absolute left-4 top-4 rounded-md border border-border bg-secondary/95 px-3 py-2 text-xs text-text-secondary">
              Nigeria coordinate layer · {mappedSites.length} mapped
            </div>
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">Loading mine sites...</div>
            ) : mappedSites.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">No mapped sites match the current filters.</div>
            ) : mappedSites.map((site) => {
              const left = Math.min(92, Math.max(8, (((site.longitude || 0) - 2.5) / 12.5) * 100));
              const top = Math.min(90, Math.max(10, (1 - (((site.latitude || 0) - 4) / 10)) * 100));
              return (
                <button
                  key={site.id}
                  onClick={() => setSelectedSite(site)}
                  className={`absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg transition-transform hover:scale-125 ${site.riskLevel === 'critical' || site.riskLevel === 'high' ? 'bg-red-500' : site.siteStatus === 'active' ? 'bg-green-500' : 'bg-yellow-400'}`}
                  style={{ left: `${left}%`, top: `${top}%` }}
                  title={site.name}
                >
                  <span className="sr-only">{site.name}</span>
                </button>
              );
            })}
          </div>
          <div className="overflow-x-auto border-t border-border">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">Site</th>
                  <th className="border-b border-border p-4 font-semibold">Operator</th>
                  <th className="border-b border-border p-4 font-semibold">Location</th>
                  <th className="border-b border-border p-4 font-semibold">Minerals</th>
                  <th className="border-b border-border p-4 font-semibold">Status</th>
                  <th className="border-b border-border p-4 font-semibold">Risk</th>
                  <th className="border-b border-border p-4 font-semibold">Links</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id} onClick={() => setSelectedSite(site)} className="cursor-pointer border-b border-border align-top hover:bg-primary/40">
                    <td className="p-4"><p className="font-semibold text-text-primary">{site.name}</p><p className="text-xs text-text-muted">{site.latitude ?? '-'}, {site.longitude ?? '-'}</p></td>
                    <td className="p-4 text-sm text-text-secondary">{site.operator?.companyName || '-'}</td>
                    <td className="p-4 text-sm text-text-secondary">{[site.community, site.lga, site.state].filter(Boolean).join(', ')}</td>
                    <td className="p-4 text-sm text-text-secondary">{site.mineralTypes.join(', ') || '-'}</td>
                    <td className="p-4">{statusChip(site.siteStatus)}</td>
                    <td className="p-4">{statusChip(site.riskLevel)}</td>
                    <td className="p-4 text-xs text-text-muted">{site.links.documentCount} docs · {site.links.productionReportCount} reports · {site.links.complianceCaseCount} cases</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="space-y-6">
          <form onSubmit={submitForm} className="rounded-lg border border-border bg-secondary p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-bold text-text-primary">{editingSite ? 'Edit Site' : 'Add Mine Site'}</h2>
              {editingSite && <button type="button" onClick={resetForm} className="text-xs font-semibold text-text-muted hover:text-accent">Cancel</button>}
            </div>
            <div className="mt-4 space-y-3">
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Site name" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              {canAssignOperator && <input required={!editingSite} value={form.operatorId} onChange={(event) => setForm({ ...form, operatorId: event.target.value })} placeholder="Operator miner ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />}
              <input value={form.licenseId} onChange={(event) => setForm({ ...form, licenseId: event.target.value })} placeholder="License ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <input required value={form.mineralTypes} onChange={(event) => setForm({ ...form, mineralTypes: event.target.value })} placeholder="Minerals, comma-separated" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <div className="grid grid-cols-2 gap-3">
                <input required value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} placeholder="State" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <input value={form.lga} onChange={(event) => setForm({ ...form, lga: event.target.value })} placeholder="LGA" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              </div>
              <input value={form.community} onChange={(event) => setForm({ ...form, community: event.target.value })} placeholder="Community" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.0000001" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: event.target.value })} placeholder="Latitude" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <input type="number" step="0.0000001" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: event.target.value })} placeholder="Longitude" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              </div>
              <button type="button" onClick={captureLocation} className="w-full rounded-md border border-border px-3 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Use GPS Location</button>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.siteStatus} onChange={(event) => setForm({ ...form, siteStatus: event.target.value as MineSiteStatus })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
                  {statusOptions.filter((status) => status !== 'all').map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select value={form.riskLevel} onChange={(event) => setForm({ ...form, riskLevel: event.target.value as MineSiteRiskLevel })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
                  {riskOptions.filter((risk) => risk !== 'all').map((risk) => <option key={risk} value={risk}>{risk}</option>)}
                </select>
              </div>
              <textarea value={form.documentIds} onChange={(event) => setForm({ ...form, documentIds: event.target.value })} placeholder="Document IDs, comma-separated" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <textarea value={form.productionReportIds} onChange={(event) => setForm({ ...form, productionReportIds: event.target.value })} placeholder="Production report IDs" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <textarea value={form.complianceCaseIds} onChange={(event) => setForm({ ...form, complianceCaseIds: event.target.value })} placeholder="Compliance case IDs" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <textarea value={form.environmentalRecordIds} onChange={(event) => setForm({ ...form, environmentalRecordIds: event.target.value })} placeholder="Environmental record IDs" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70">{saving ? 'Saving...' : editingSite ? 'Update Site' : 'Create Site'}</button>
            </div>
          </form>

          {selectedSite && (
            <section className="rounded-lg border border-border bg-secondary p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Site detail</p>
                  <h2 className="mt-1 text-xl font-bold text-text-primary">{selectedSite.name}</h2>
                </div>
                <button onClick={() => setSelectedSite(null)} className="text-sm font-semibold text-text-muted hover:text-accent">Close</button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-text-secondary">
                <div className="flex gap-2">{statusChip(selectedSite.siteStatus)} {statusChip(selectedSite.riskLevel)}</div>
                <p>Operator: {selectedSite.operator?.companyName || '-'}</p>
                <p>Contact: {selectedSite.operator?.user?.email || '-'}</p>
                <p>Location: {[selectedSite.community, selectedSite.lga, selectedSite.state].filter(Boolean).join(', ')}</p>
                <p>Coordinates: {selectedSite.latitude ?? '-'}, {selectedSite.longitude ?? '-'}</p>
                <p>Minerals: {selectedSite.mineralTypes.join(', ') || '-'}</p>
                <p>License linked: {selectedSite.links.hasLicense ? selectedSite.licenseId : 'No'}</p>
                <p>Documents: {selectedSite.links.documentCount}</p>
                <p>Production reports: {selectedSite.links.productionReportCount}</p>
                <p>Compliance cases: {selectedSite.links.complianceCaseCount}</p>
                <p>Environmental records: {selectedSite.links.environmentalRecordCount}</p>
                <p>Updated: {formatDate(selectedSite.updatedAt)}</p>
                <p className="rounded-md border border-border bg-primary p-3 text-xs text-text-muted">{selectedSite.postgis.recommendation}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(selectedSite)} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">Edit</button>
                <button onClick={() => removeSite(selectedSite)} disabled={saving} className="rounded-md border border-red-500/40 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-70">Delete</button>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
