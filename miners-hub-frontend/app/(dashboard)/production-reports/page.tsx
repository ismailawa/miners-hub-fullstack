'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  createProductionReport,
  getProductionAnalytics,
  getProductionReports,
  ProductionAnalytics,
  ProductionReport,
  ProductionReportStatus,
  reviewProductionReport,
} from '../../../lib/api/production-reports';
import { flushFieldQueue, getFieldQueue, queueFieldSubmission } from '../../../lib/offline/field-queue';
import FormModal from '../../../components/FormModal';
import DashboardSearchFilters, { ActiveFilter } from '../../../components/DashboardSearchFilters';
import RecordPicker from '../../../components/RecordPicker';

const statusOptions: Array<'all' | ProductionReportStatus> = ['all', 'draft', 'submitted', 'under_review', 'approved', 'rejected', 'overdue'];

const emptyForm = {
  siteId: '',
  minerId: '',
  mineralType: '',
  periodStart: '',
  periodEnd: '',
  quantity: '',
  unit: 'tonne',
  grade: '',
  destination: '',
  estimatedValue: '',
  royaltyRate: '3',
  supportingDocumentIds: '',
  status: 'submitted' as ProductionReportStatus,
};

function splitList(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function statusChip(status: string) {
  const classes: Record<string, string> = {
    approved: 'bg-green-500/15 text-green-300 border-green-500/30',
    submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    under_review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    draft: 'bg-border text-text-muted border-border',
    rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
    overdue: 'bg-red-700/30 text-red-200 border-red-500/40',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || classes.draft}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

function money(value?: number | null) {
  return `NGN ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export default function ProductionReportsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<ProductionReport[]>([]);
  const [analytics, setAnalytics] = useState<ProductionAnalytics | null>(null);
  const [selectedReport, setSelectedReport] = useState<ProductionReport | null>(null);
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mineralFilter, setMineralFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  const isReviewer = currentUser?.role === 'admin' || currentUser?.role === 'government';
  const canUsePage = currentUser?.role === 'admin' || currentUser?.role === 'government' || currentUser?.role === 'miner';

  const royaltyEstimate = useMemo(() => {
    const value = Number(form.estimatedValue || 0);
    const rate = Number(form.royaltyRate || 0);
    return (value * rate) / 100;
  }, [form.estimatedValue, form.royaltyRate]);

  const deadlineSummary = useMemo(() => {
    const now = new Date();
    return {
      overdue: reports.filter((report) => report.status === 'overdue').length,
      currentMonth: reports.filter((report) => {
        const end = new Date(report.periodEnd);
        return end.getMonth() === now.getMonth() && end.getFullYear() === now.getFullYear();
      }).length,
      pending: reports.filter((report) => report.status === 'submitted' || report.status === 'under_review').length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return reports;
    return reports.filter((report) => [
      report.mineralType,
      report.grade,
      report.destination,
      report.site?.name,
      report.miner?.companyName,
      report.status,
    ].some((value) => String(value || '').toLowerCase().includes(term)));
  }, [reports, searchTerm]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (searchTerm.trim()) filters.push({ key: 'search', label: `Search: ${searchTerm.trim()}`, clear: () => setSearchTerm('') });
    if (statusFilter !== 'all') filters.push({ key: 'status', label: `Status: ${statusFilter.replace(/_/g, ' ')}`, clear: () => setStatusFilter('all') });
    if (mineralFilter.trim()) filters.push({ key: 'mineral', label: `Mineral: ${mineralFilter.trim()}`, clear: () => setMineralFilter('') });
    return filters;
  }, [mineralFilter, searchTerm, statusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setMineralFilter('');
  };

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [reportResponse, analyticsResponse] = await Promise.all([
        getProductionReports({ status: statusFilter, mineralType: mineralFilter }),
        getProductionAnalytics(),
      ]);
      setReports(reportResponse.data);
      setAnalytics(analyticsResponse);
    } catch (err: any) {
      setError(err?.message || 'Failed to load production reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !canUsePage) {
      router.push('/dashboard');
      return;
    }
    if (canUsePage) void loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, canUsePage, router]);

  useEffect(() => {
    const updateQueuedCount = () => {
      setQueuedCount(getFieldQueue().filter((item) => item.kind === 'production_report').length);
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

  const submitReport = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      siteId: form.siteId,
      minerId: isReviewer ? form.minerId || undefined : undefined,
      mineralType: form.mineralType,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      quantity: Number(form.quantity),
      unit: form.unit,
      grade: form.grade || null,
      destination: form.destination || null,
      estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
      royaltyRate: form.royaltyRate ? Number(form.royaltyRate) : 3,
      supportingDocumentIds: splitList(form.supportingDocumentIds),
      status: form.status,
    };
    try {
      if (!isOnline) {
        queueFieldSubmission({
          kind: 'production_report',
          endpoint: '/api/production-reports',
          method: 'POST',
          payload,
        });
        setForm(emptyForm);
        setError('Production report saved offline and will sync when connection returns.');
        return;
      }
      const report = await createProductionReport(payload);
      setSelectedReport(report);
      setForm(emptyForm);
      setIsReportFormOpen(false);
      await loadReports();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit production report');
    } finally {
      setSaving(false);
    }
  };

  const syncQueuedReports = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await flushFieldQueue();
      setQueuedCount(getFieldQueue().filter((item) => item.kind === 'production_report').length);
      setError(`Synced ${result.sent} queued field submission${result.sent === 1 ? '' : 's'}.`);
      await loadReports();
    } catch {
      setError('Could not sync queued submissions yet.');
    } finally {
      setSaving(false);
    }
  };

  const applyReview = async (status: ProductionReportStatus) => {
    if (!selectedReport) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await reviewProductionReport(selectedReport.id, status, reviewNotes);
      setSelectedReport(updated);
      setReviewNotes('');
      await loadReports();
    } catch (err: any) {
      setError(err?.message || 'Failed to review production report');
    } finally {
      setSaving(false);
    }
  };

  if (currentUser && !canUsePage) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Production Reports</h1>
          <p className="mt-1 text-sm text-text-secondary">Submit site production, review reported output, estimate royalty exposure, and monitor production trends.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsReportFormOpen(true)}
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
        >
          Submit Report
        </button>
      </div>

      {queuedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-100 md:flex-row md:items-center md:justify-between">
          <span>{queuedCount} production report draft{queuedCount === 1 ? '' : 's'} waiting to sync.</span>
          <button onClick={syncQueuedReports} disabled={saving || !isOnline} className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-60">Sync Now</button>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Reports</p><p className="text-xl font-bold">{analytics?.totalReports || 0}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Approved</p><p className="text-xl font-bold">{analytics?.approvedReports || 0}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Pending review</p><p className="text-xl font-bold">{analytics?.pendingReview || 0}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Estimated value</p><p className="text-lg font-bold">{money(analytics?.estimatedValue)}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Royalty due</p><p className="text-lg font-bold">{money(analytics?.royaltyDue)}</p></div>
      </div>

      <DashboardSearchFilters
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search reports, sites, miners, minerals, or destinations"
        isFilterPanelOpen={isFilterPanelOpen}
        onToggleFilters={() => setIsFilterPanelOpen((open) => !open)}
        activeFilters={activeFilters}
        onReset={resetFilters}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm text-text-secondary">
            <span className="mb-1.5 block font-semibold">Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
              {statusOptions.map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
            </select>
          </label>
          <label className="text-sm text-text-secondary">
            <span className="mb-1.5 block font-semibold">Mineral type</span>
            <input value={mineralFilter} onChange={(event) => setMineralFilter(event.target.value)} placeholder="Gold" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
          </label>
          <div className="rounded-md border border-border bg-primary px-3 py-2 text-xs text-text-secondary">
            Current period: {deadlineSummary.currentMonth} · Pending: {deadlineSummary.pending} · Overdue: {deadlineSummary.overdue}
          </div>
          <button onClick={loadReports} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 md:self-end">Apply Filters</button>
        </div>
      </DashboardSearchFilters>

      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <FormModal
        isOpen={isReportFormOpen}
        title="Submit Production Report"
        description="Capture reported output, supporting evidence, and royalty estimate."
        onClose={() => setIsReportFormOpen(false)}
      >
        <form onSubmit={submitReport} className="space-y-3">
          <RecordPicker
            resource="mine-sites"
            value={form.siteId}
            label="Mine site"
            placeholder="Search by site, operator, community, or state"
            required
            onChange={(id) => setForm((prev) => ({ ...prev, siteId: id }))}
            onSelect={(option) => setForm((prev) => ({
              ...prev,
              siteId: option.id,
              minerId: String(option.metadata?.operatorId || prev.minerId),
              mineralType: Array.isArray(option.metadata?.mineralTypes) && option.metadata.mineralTypes.length === 1
                ? String(option.metadata.mineralTypes[0])
                : prev.mineralType,
            }))}
            helperText="Selecting a site fills the operator and mineral type when the record has that context."
          />
          {isReviewer && (
            <RecordPicker
              resource="miners"
              value={form.minerId}
              label="Miner"
              placeholder="Search by company, license, location, or email"
              onChange={(id) => setForm((prev) => ({ ...prev, minerId: id }))}
              onSelect={(option) => setForm((prev) => ({ ...prev, minerId: option.id }))}
            />
          )}
          <input required value={form.mineralType} onChange={(event) => setForm({ ...form, mineralType: event.target.value })} placeholder="Mineral type" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.periodStart} onChange={(event) => setForm({ ...form, periodStart: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
            <input required type="date" value={form.periodEnd} onChange={(event) => setForm({ ...form, periodEnd: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} placeholder="Quantity" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
              <option value="tonne">tonne</option>
              <option value="kg">kg</option>
              <option value="gram">gram</option>
              <option value="bag">bag</option>
            </select>
          </div>
          <input value={form.grade} onChange={(event) => setForm({ ...form, grade: event.target.value })} placeholder="Grade / purity" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
          <input value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} placeholder="Destination" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.01" value={form.estimatedValue} onChange={(event) => setForm({ ...form, estimatedValue: event.target.value })} placeholder="Estimated value" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
            <input type="number" step="0.01" value={form.royaltyRate} onChange={(event) => setForm({ ...form, royaltyRate: event.target.value })} placeholder="Royalty %" className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
          </div>
          <div className="rounded-lg border border-border bg-primary p-3">
            <p className="text-xs text-text-muted">Royalty estimate</p>
            <p className="text-xl font-bold text-text-primary">{money(royaltyEstimate)}</p>
          </div>
          <textarea value={form.supportingDocumentIds} onChange={(event) => setForm({ ...form, supportingDocumentIds: event.target.value })} placeholder="Supporting document IDs" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProductionReportStatus })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
            <option value="submitted">Submit for review</option>
            <option value="draft">Save draft</option>
          </select>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsReportFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
            <button disabled={saving} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70">{saving ? 'Saving...' : 'Save Report'}</button>
          </div>
        </form>
      </FormModal>

      <div className="grid gap-6">
        <section className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">Report</th>
                  <th className="border-b border-border p-4 font-semibold">Site</th>
                  <th className="border-b border-border p-4 font-semibold">Period</th>
                  <th className="border-b border-border p-4 font-semibold">Quantity</th>
                  <th className="border-b border-border p-4 font-semibold">Value</th>
                  <th className="border-b border-border p-4 font-semibold">Royalty</th>
                  <th className="border-b border-border p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-text-muted">Loading production reports...</td></tr>
                ) : filteredReports.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-text-muted">No production reports match the current filters.</td></tr>
                ) : filteredReports.map((report) => (
                  <tr key={report.id} onClick={() => setSelectedReport(report)} className="cursor-pointer border-b border-border align-top hover:bg-primary/40">
                    <td className="p-4"><p className="font-semibold text-text-primary">{report.mineralType}</p><p className="text-xs text-text-muted">{report.grade || 'Grade not stated'} · {report.destination || 'No destination'}</p></td>
                    <td className="p-4 text-sm text-text-secondary">{report.site?.name || '-'}</td>
                    <td className="p-4 text-sm text-text-secondary">{formatDate(report.periodStart)} - {formatDate(report.periodEnd)}</td>
                    <td className="p-4 text-sm text-text-secondary">{Number(report.quantity).toLocaleString()} {report.unit}</td>
                    <td className="p-4 text-sm text-text-secondary">{money(report.estimatedValue)}</td>
                    <td className="p-4 text-sm text-text-secondary">{money(report.royaltyDue)}</td>
                    <td className="p-4">{statusChip(report.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-secondary p-4">
            <h2 className="font-bold text-text-primary">Production Analytics</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(analytics?.byMineral || {}).length === 0 ? (
                <p className="text-sm text-text-muted">No mineral analytics yet.</p>
              ) : Object.entries(analytics?.byMineral || {}).map(([mineral, values]) => (
                <div key={mineral} className="rounded-lg border border-border bg-primary p-3">
                  <p className="font-semibold text-text-primary">{mineral}</p>
                  <p className="mt-1 text-sm text-text-secondary">{values.quantity.toLocaleString()} total units</p>
                  <p className="text-xs text-text-muted">{money(values.value)} value · {money(values.royalty)} royalty</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <button className="absolute inset-0 cursor-default" aria-label="Close detail" onClick={() => setSelectedReport(null)} />
          <aside className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-secondary p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div><p className="text-sm font-semibold text-accent">Production detail</p><h2 className="mt-1 text-2xl font-bold">{selectedReport.mineralType}</h2></div>
              <button onClick={() => setSelectedReport(null)} className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent">Close</button>
            </div>
            <div className="mt-5 flex gap-2">{statusChip(selectedReport.status)}</div>
            <div className="mt-5 space-y-2 text-sm text-text-secondary">
              <p>Site: {selectedReport.site?.name || '-'}</p>
              <p>Miner: {selectedReport.miner?.companyName || '-'}</p>
              <p>Period: {formatDate(selectedReport.periodStart)} - {formatDate(selectedReport.periodEnd)}</p>
              <p>Quantity: {Number(selectedReport.quantity).toLocaleString()} {selectedReport.unit}</p>
              <p>Grade: {selectedReport.grade || '-'}</p>
              <p>Destination: {selectedReport.destination || '-'}</p>
              <p>Estimated value: {money(selectedReport.estimatedValue)}</p>
              <p>Royalty: {Number(selectedReport.royaltyRate).toLocaleString()}% · {money(selectedReport.royaltyDue)}</p>
              <p>Evidence documents: {selectedReport.supportingDocumentIds.length}</p>
              <p>Submitted: {formatDate(selectedReport.submittedAt)}</p>
              <p>Reviewed: {formatDate(selectedReport.reviewedAt)}</p>
              <p>Review notes: {selectedReport.reviewNotes || '-'}</p>
            </div>
            {isReviewer && (
              <div className="mt-6 rounded-lg border border-border bg-primary p-4">
                <h3 className="font-bold text-text-primary">Review Queue Action</h3>
                <textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Review notes" rows={3} className="mt-3 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => applyReview('under_review')} disabled={saving} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">Request Changes</button>
                  <button onClick={() => applyReview('approved')} disabled={saving} className="rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500">Approve</button>
                  <button onClick={() => applyReview('rejected')} disabled={saving} className="rounded-md bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500">Reject</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
