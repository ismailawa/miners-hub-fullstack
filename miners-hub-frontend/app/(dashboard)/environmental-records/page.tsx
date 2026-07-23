'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadImage } from '../../../lib/api/media';
import { flushFieldQueue, getFieldQueue, queueFieldSubmission } from '../../../lib/offline/field-queue';
import FormModal from '../../../components/FormModal';
import MultiFileInput, { FilePreview } from '../../../components/MultiFileInput';
import {
  createEnvironmentalRecord,
  EnvironmentalRecord,
  EnvironmentalRecordStatus,
  EnvironmentalRecordType,
  EnvironmentalSeverity,
  getEnvironmentalRecords,
  updateEnvironmentalRecord,
} from '../../../lib/api/environmental-records';

const severityClass: Record<EnvironmentalSeverity, string> = {
  low: 'bg-green-500/15 text-green-300 border-green-500/30',
  medium: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  high: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  critical: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const statusClass: Record<EnvironmentalRecordStatus, string> = {
  open: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  under_review: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  action_required: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  in_remediation: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  resolved: 'bg-green-500/15 text-green-300 border-green-500/30',
  closed: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
};

const Chip = ({ value, className }: { value: string; className: string }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>{value.replace(/_/g, ' ')}</span>
);

export default function EnvironmentalRecordsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<EnvironmentalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<EnvironmentalRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | EnvironmentalRecordStatus>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | EnvironmentalSeverity>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<FilePreview[]>([]);
  const [form, setForm] = useState({
    siteId: '',
    recordType: 'inspection' as EnvironmentalRecordType,
    severity: 'medium' as EnvironmentalSeverity,
    description: '',
    latitude: '',
    longitude: '',
    evidenceUrls: [] as string[],
    communityVisible: false,
    privateNotes: '',
  });

  const isReviewer = currentUser?.role === 'admin' || currentUser?.role === 'government';
  const openCount = useMemo(() => records.filter((record) => !['resolved', 'closed'].includes(record.status)).length, [records]);
  const criticalCount = useMemo(() => records.filter((record) => record.severity === 'critical').length, [records]);

  const fetchRecords = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const filters: Record<string, string> = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (severityFilter !== 'all') filters.severity = severityFilter;
      const response = await getEnvironmentalRecords(filters);
      setRecords(response.data);
      setSelectedRecord((current) => current ? response.data.find((record) => record.id === current.id) || null : response.data[0] || null);
    } catch {
      setError('Unable to load environmental records.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, severityFilter, statusFilter]);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    void fetchRecords();
  }, [currentUser, fetchRecords, router]);

  useEffect(() => {
    const updateQueuedCount = () => {
      setQueuedCount(getFieldQueue().filter((item) => item.kind === 'environmental_record').length);
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

  useEffect(() => {
    return () => {
      evidenceFiles.forEach((filePreview) => URL.revokeObjectURL(filePreview.previewUrl));
    };
  }, [evidenceFiles]);

  const clearEvidenceFiles = () => {
    evidenceFiles.forEach((filePreview) => URL.revokeObjectURL(filePreview.previewUrl));
    setEvidenceFiles([]);
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      setError('Location capture is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setForm((prev) => ({
        ...prev,
        latitude: String(position.coords.latitude),
        longitude: String(position.coords.longitude),
      })),
      () => setError('Could not capture current location.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleEvidenceFilesAdded = async (files: File[]) => {
    if (files.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadImage(file, 'general')));
      const previews = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
      setEvidenceFiles((prev) => [...prev, ...previews]);
      setForm((prev) => ({
        ...prev,
        evidenceUrls: [...prev.evidenceUrls, ...uploaded.map((file) => file.secureUrl)],
      }));
    } catch {
      setError('Could not upload environmental evidence.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEvidenceRemoved = (index: number) => {
    const filePreview = evidenceFiles[index];
    if (filePreview) URL.revokeObjectURL(filePreview.previewUrl);
    setEvidenceFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setForm((prev) => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    const payload = {
      siteId: form.siteId,
      recordType: form.recordType,
      severity: form.severity,
      description: form.description,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      evidenceUrls: form.evidenceUrls,
      communityVisible: form.communityVisible,
      privateNotes: form.privateNotes || null,
    };
    try {
      if (!isOnline) {
        queueFieldSubmission({
          kind: 'environmental_record',
          endpoint: '/api/environmental-records',
          method: 'POST',
          payload,
        });
        setError('Environmental record saved offline and will sync when connection returns.');
        setForm({
          siteId: '',
          recordType: 'inspection',
          severity: 'medium',
          description: '',
          latitude: '',
          longitude: '',
          evidenceUrls: [],
          communityVisible: false,
          privateNotes: '',
        });
        clearEvidenceFiles();
        return;
      }
      await createEnvironmentalRecord(payload);
      setIsRecordFormOpen(false);
      setForm({
        siteId: '',
        recordType: 'inspection',
        severity: 'medium',
        description: '',
        latitude: '',
        longitude: '',
        evidenceUrls: [],
        communityVisible: false,
        privateNotes: '',
      });
      clearEvidenceFiles();
      await fetchRecords();
    } catch {
      setError('Could not save environmental record. Confirm the site ID is valid and accessible.');
    } finally {
      setIsSaving(false);
    }
  };

  const syncQueuedRecords = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await flushFieldQueue();
      setQueuedCount(getFieldQueue().filter((item) => item.kind === 'environmental_record').length);
      setError(`Synced ${result.sent} queued field submission${result.sent === 1 ? '' : 's'}.`);
      await fetchRecords();
    } catch {
      setError('Could not sync queued submissions yet.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStatus = async (record: EnvironmentalRecord, status: EnvironmentalRecordStatus) => {
    const notes = window.prompt('Add remediation or review note', '');
    if (notes === null) return;
    setIsSaving(true);
    try {
      await updateEnvironmentalRecord(record.id, {
        status,
        remediationActions: [
          ...(record.remediationActions || []),
          {
            status,
            notes,
            updatedBy: currentUser?.id,
            updatedAt: new Date().toISOString(),
          },
        ],
      });
      await fetchRecords();
    } catch {
      setError('Could not update environmental status.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Environmental Monitoring</h1>
          <p className="mt-1 text-sm text-text-secondary">Capture inspections, incidents, remediation evidence, and community-safe environmental updates.</p>
        </div>
        <button type="button" onClick={() => setIsRecordFormOpen(true)} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400">
          New Field Report
        </button>
      </div>

      {queuedCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-100 md:flex-row md:items-center md:justify-between">
          <span>{queuedCount} environmental record draft{queuedCount === 1 ? '' : 's'} waiting to sync.</span>
          <button onClick={syncQueuedRecords} disabled={isSaving || !isOnline} className="rounded-md bg-yellow-400 px-3 py-2 text-xs font-bold text-black disabled:opacity-60">Sync Now</button>
        </div>
      ) : null}

      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Open issues</p>
          <p className="mt-2 text-3xl font-bold text-text-primary">{openCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Critical severity</p>
          <p className="mt-2 text-3xl font-bold text-red-300">{criticalCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-4">
          <p className="text-xs uppercase tracking-wide text-text-muted">Evidence files</p>
          <p className="mt-2 text-3xl font-bold text-accent">{records.reduce((total, record) => total + record.evidenceUrls.length, 0)}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <FormModal
          isOpen={isRecordFormOpen}
          title="New Environmental Field Report"
          description="Capture inspection, incident, remediation, or community concern evidence."
          onClose={() => setIsRecordFormOpen(false)}
        >
          <form className="space-y-3" onSubmit={handleSubmit}>
            <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Mine site ID" value={form.siteId} onChange={(event) => setForm((prev) => ({ ...prev, siteId: event.target.value }))} required />
            <div className="grid grid-cols-2 gap-3">
              <select className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={form.recordType} onChange={(event) => setForm((prev) => ({ ...prev, recordType: event.target.value as EnvironmentalRecordType }))}>
                <option value="inspection">Inspection</option>
                <option value="incident">Incident</option>
                <option value="community_concern">Community concern</option>
                <option value="monitoring">Monitoring</option>
                <option value="remediation">Remediation</option>
              </select>
              <select className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={form.severity} onChange={(event) => setForm((prev) => ({ ...prev, severity: event.target.value as EnvironmentalSeverity }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <textarea className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Observation, incident detail, or remediation summary" rows={5} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} required />
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="grid grid-cols-2 gap-3">
                <input className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Latitude" inputMode="decimal" value={form.latitude} onChange={(event) => setForm((prev) => ({ ...prev, latitude: event.target.value }))} />
                <input className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Longitude" inputMode="decimal" value={form.longitude} onChange={(event) => setForm((prev) => ({ ...prev, longitude: event.target.value }))} />
              </div>
              <button type="button" className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent" onClick={captureLocation}>Use GPS</button>
            </div>
            <MultiFileInput
              id="environmental-evidence"
              label="Evidence photos"
              files={evidenceFiles}
              onFilesAdded={(files) => void handleEvidenceFilesAdded(files)}
              onFileRemoved={handleEvidenceRemoved}
              accept="image/png,image/jpeg"
              helperText="Drop JPG or PNG evidence photos here. Files upload to Cloudinary immediately."
              disabled={isUploading}
            />
            {form.evidenceUrls.length > 0 && <p className="text-xs text-text-muted">{form.evidenceUrls.length} evidence file(s) attached</p>}
            {isReviewer && (
              <>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input type="checkbox" checked={form.communityVisible} onChange={(event) => setForm((prev) => ({ ...prev, communityVisible: event.target.checked }))} />
                  Community-safe public update
                </label>
                <textarea className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Private regulator/admin notes" rows={3} value={form.privateNotes} onChange={(event) => setForm((prev) => ({ ...prev, privateNotes: event.target.value }))} />
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsRecordFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
              <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400 disabled:opacity-60" disabled={isSaving || isUploading}>
                Save Environmental Record
              </button>
            </div>
          </form>
        </FormModal>

        <section className="rounded-lg border border-border bg-secondary">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Site Environmental Dashboard</h2>
              <p className="text-sm text-text-muted">{isLoading ? 'Loading records...' : `${records.length} records shown`}</p>
            </div>
            <div className="flex gap-2">
              <select className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as typeof severityFilter)}>
                <option value="all">All severity</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <select className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                <option value="all">All status</option>
                <option value="open">Open</option>
                <option value="under_review">Under review</option>
                <option value="action_required">Action required</option>
                <option value="in_remediation">In remediation</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-primary text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Record</th>
                  <th className="px-4 py-3">Site</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Evidence</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record) => (
                  <tr key={record.id} className={`cursor-pointer hover:bg-primary/50 ${selectedRecord?.id === record.id ? 'bg-primary/60' : ''}`} onClick={() => setSelectedRecord(record)}>
                    <td className="px-4 py-4">
                      <p className="font-semibold capitalize text-text-primary">{record.recordType.replace(/_/g, ' ')}</p>
                      <p className="line-clamp-2 max-w-sm text-xs text-text-muted">{record.description}</p>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">{record.site?.name || record.siteId}</td>
                    <td className="px-4 py-4"><Chip value={record.severity} className={severityClass[record.severity]} /></td>
                    <td className="px-4 py-4"><Chip value={record.status} className={statusClass[record.status]} /></td>
                    <td className="px-4 py-4 text-text-secondary">{record.evidenceUrls.length}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(['under_review', 'action_required', 'in_remediation', 'resolved', 'closed'] as EnvironmentalRecordStatus[]).map((status) => (
                          <button key={status} className="rounded-md border border-border px-2 py-1 text-xs text-text-secondary hover:border-accent hover:text-accent disabled:opacity-40" disabled={isSaving || record.status === status} onClick={(event) => { event.stopPropagation(); void updateStatus(record, status); }}>
                            {status.replace(/_/g, ' ')}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-text-muted">No environmental records match the current filters.</td>
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
