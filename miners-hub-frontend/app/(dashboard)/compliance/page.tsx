'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ComplianceCase,
  ComplianceCaseSeverity,
  ComplianceCaseStatus,
  createComplianceCase,
  createLicense,
  getComplianceCases,
  getLicenses,
  License,
  LicenseStatus,
  reviewLicense,
  updateComplianceCase,
} from '../../../lib/api/compliance';

const licenseStatuses: Array<'all' | LicenseStatus> = ['all', 'submitted', 'under_review', 'approved', 'rejected', 'expired'];
const caseStatuses: ComplianceCaseStatus[] = ['open', 'inspection_scheduled', 'action_required', 'resolved', 'closed'];
const severities: Array<'all' | ComplianceCaseSeverity> = ['all', 'low', 'medium', 'high', 'critical'];

const emptyLicenseForm = {
  holderUserId: '',
  siteId: '',
  licenseNumber: '',
  licenseType: '',
  issuingAuthority: '',
  issueDate: '',
  expiryDate: '',
  documentIds: '',
};

const emptyCaseForm = {
  siteId: '',
  subjectUserId: '',
  caseType: '',
  severity: 'medium' as ComplianceCaseSeverity,
  assignedTo: '',
  findings: '',
  requiredActions: '',
  dueDate: '',
  inspectionScheduledAt: '',
  inspectorName: '',
  inspectionNotes: '',
};

function splitList(value: string) {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function statusChip(status: string) {
  const classes: Record<string, string> = {
    approved: 'bg-green-500/15 text-green-300 border-green-500/30',
    resolved: 'bg-green-500/15 text-green-300 border-green-500/30',
    closed: 'bg-border text-text-muted border-border',
    submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    under_review: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    inspection_scheduled: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    action_required: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
    expired: 'bg-red-500/15 text-red-300 border-red-500/30',
    open: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    low: 'bg-green-500/15 text-green-300 border-green-500/30',
    medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    high: 'bg-red-500/15 text-red-300 border-red-500/30',
    critical: 'bg-red-700/30 text-red-200 border-red-500/40',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || classes.closed}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : '-';
}

export default function CompliancePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [cases, setCases] = useState<ComplianceCase[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [licenseFilter, setLicenseFilter] = useState('all');
  const [caseFilter, setCaseFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [licenseForm, setLicenseForm] = useState(emptyLicenseForm);
  const [caseForm, setCaseForm] = useState(emptyCaseForm);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReviewer = currentUser?.role === 'admin' || currentUser?.role === 'government';
  const canUsePage = currentUser?.role === 'admin' || currentUser?.role === 'government' || currentUser?.role === 'miner';

  const summary = useMemo(() => ({
    licenses: licenses.length,
    pendingReviews: licenses.filter((license) => license.status === 'submitted' || license.status === 'under_review').length,
    expiringSoon: licenses.filter((license) => license.expiry.isDueSoon || license.expiry.isExpired).length,
    openCases: cases.filter((item) => item.status !== 'closed' && item.status !== 'resolved').length,
  }), [licenses, cases]);

  const loadCompliance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [licenseResponse, caseResponse] = await Promise.all([
        getLicenses({ status: licenseFilter }),
        getComplianceCases({ status: caseFilter, severity: severityFilter }),
      ]);
      setLicenses(licenseResponse.data);
      setCases(caseResponse.data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !canUsePage) {
      router.push('/dashboard');
      return;
    }
    if (canUsePage) void loadCompliance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, canUsePage, router]);

  const submitLicense = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const license = await createLicense({
        holderUserId: isReviewer ? licenseForm.holderUserId || undefined : undefined,
        siteId: licenseForm.siteId || null,
        licenseNumber: licenseForm.licenseNumber,
        licenseType: licenseForm.licenseType,
        issuingAuthority: licenseForm.issuingAuthority,
        issueDate: licenseForm.issueDate,
        expiryDate: licenseForm.expiryDate,
        documentIds: splitList(licenseForm.documentIds),
      });
      setSelectedLicense(license);
      setLicenseForm(emptyLicenseForm);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit license');
    } finally {
      setSaving(false);
    }
  };

  const submitCase = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const complianceCase = await createComplianceCase({
        siteId: caseForm.siteId,
        subjectUserId: caseForm.subjectUserId || null,
        caseType: caseForm.caseType,
        severity: caseForm.severity,
        assignedTo: caseForm.assignedTo || null,
        findings: caseForm.findings,
        requiredActions: splitList(caseForm.requiredActions).map((title) => ({ title, status: 'open' })),
        dueDate: caseForm.dueDate || null,
        inspectionScheduledAt: caseForm.inspectionScheduledAt || null,
        inspectorName: caseForm.inspectorName || null,
        inspectionNotes: caseForm.inspectionNotes || null,
      });
      setSelectedCase(complianceCase);
      setCaseForm(emptyCaseForm);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || 'Failed to create compliance case');
    } finally {
      setSaving(false);
    }
  };

  const applyReview = async (status: LicenseStatus) => {
    if (!selectedLicense) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await reviewLicense(selectedLicense.id, status, reviewNotes);
      setSelectedLicense(updated);
      setReviewNotes('');
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || 'Failed to review license');
    } finally {
      setSaving(false);
    }
  };

  const updateCaseStatus = async (status: ComplianceCaseStatus) => {
    if (!selectedCase) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateComplianceCase(selectedCase.id, { status });
      setSelectedCase(updated);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || 'Failed to update compliance case');
    } finally {
      setSaving(false);
    }
  };

  if (currentUser && !canUsePage) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Licensing & Compliance</h1>
        <p className="mt-1 text-sm text-text-secondary">Manage license submissions, expiry risk, inspection schedules, findings, corrective actions, and approvals.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Licenses</p><p className="text-xl font-bold">{summary.licenses}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Pending review</p><p className="text-xl font-bold">{summary.pendingReviews}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Expiring/expired</p><p className="text-xl font-bold">{summary.expiringSoon}</p></div>
        <div className="rounded-lg border border-border bg-secondary p-3"><p className="text-xs text-text-muted">Open cases</p><p className="text-xl font-bold">{summary.openCases}</p></div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-secondary p-4 md:grid-cols-4">
        <select value={licenseFilter} onChange={(event) => setLicenseFilter(event.target.value)} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
          {licenseStatuses.map((status) => <option key={status} value={status}>License: {status.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={caseFilter} onChange={(event) => setCaseFilter(event.target.value)} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
          <option value="all">Case: all</option>
          {caseStatuses.map((status) => <option key={status} value={status}>Case: {status.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
          {severities.map((severity) => <option key={severity} value={severity}>Severity: {severity}</option>)}
        </select>
        <button onClick={loadCompliance} className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400">Apply</button>
      </div>

      {error && <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">License</th>
                  <th className="border-b border-border p-4 font-semibold">Holder</th>
                  <th className="border-b border-border p-4 font-semibold">Site</th>
                  <th className="border-b border-border p-4 font-semibold">Expiry</th>
                  <th className="border-b border-border p-4 font-semibold">Status</th>
                  <th className="border-b border-border p-4 font-semibold">Renewal</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-text-muted">Loading licenses...</td></tr>
                ) : licenses.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-text-muted">No licenses match the current filters.</td></tr>
                ) : licenses.map((license) => (
                  <tr key={license.id} onClick={() => setSelectedLicense(license)} className="cursor-pointer border-b border-border align-top hover:bg-primary/40">
                    <td className="p-4"><p className="font-semibold text-text-primary">{license.licenseNumber}</p><p className="text-xs text-text-muted">{license.licenseType} · {license.issuingAuthority}</p></td>
                    <td className="p-4 text-sm text-text-secondary">{license.holder?.name || license.holder?.email || '-'}</td>
                    <td className="p-4 text-sm text-text-secondary">{license.site?.name || '-'}</td>
                    <td className="p-4 text-sm text-text-secondary"><p>{formatDate(license.expiryDate)}</p><p className={license.expiry.isExpired || license.expiry.isDueSoon ? 'text-xs font-semibold text-red-300' : 'text-xs text-text-muted'}>{license.expiry.daysUntilExpiry} days</p></td>
                    <td className="p-4">{statusChip(license.status)}</td>
                    <td className="p-4">{statusChip(license.renewalStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-border bg-secondary p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-text-primary">Compliance Case Board</h2>
              <p className="text-xs text-text-muted">{cases.length} cases</p>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
              {caseStatuses.map((status) => (
                <div key={status} className="min-h-40 rounded-lg border border-border bg-primary p-3">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">{status.replace(/_/g, ' ')}</h3>
                  <div className="space-y-3">
                    {cases.filter((item) => item.status === status).map((item) => (
                      <button key={item.id} onClick={() => setSelectedCase(item)} className="w-full rounded-md border border-border bg-secondary p-3 text-left text-sm hover:border-accent">
                        <p className="font-semibold text-text-primary">{item.caseType}</p>
                        <p className="mt-1 text-xs text-text-muted">{item.site?.name || 'Unlinked site'} · Due {formatDate(item.dueDate)}</p>
                        <div className="mt-2">{statusChip(item.severity)}</div>
                      </button>
                    ))}
                    {cases.filter((item) => item.status === status).length === 0 && <p className="text-xs text-text-muted">No cases</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <form onSubmit={submitLicense} className="rounded-lg border border-border bg-secondary p-4">
            <h2 className="font-bold text-text-primary">Submit License</h2>
            <div className="mt-4 space-y-3">
              {isReviewer && <input value={licenseForm.holderUserId} onChange={(event) => setLicenseForm({ ...licenseForm, holderUserId: event.target.value })} placeholder="Holder user ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />}
              <input value={licenseForm.siteId} onChange={(event) => setLicenseForm({ ...licenseForm, siteId: event.target.value })} placeholder="Mine site ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <input required value={licenseForm.licenseNumber} onChange={(event) => setLicenseForm({ ...licenseForm, licenseNumber: event.target.value })} placeholder="License number" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <input required value={licenseForm.licenseType} onChange={(event) => setLicenseForm({ ...licenseForm, licenseType: event.target.value })} placeholder="License type" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <input required value={licenseForm.issuingAuthority} onChange={(event) => setLicenseForm({ ...licenseForm, issuingAuthority: event.target.value })} placeholder="Issuing authority" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="date" value={licenseForm.issueDate} onChange={(event) => setLicenseForm({ ...licenseForm, issueDate: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
                <input required type="date" value={licenseForm.expiryDate} onChange={(event) => setLicenseForm({ ...licenseForm, expiryDate: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <textarea value={licenseForm.documentIds} onChange={(event) => setLicenseForm({ ...licenseForm, documentIds: event.target.value })} placeholder="Supporting document IDs" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
              <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70">{saving ? 'Saving...' : 'Submit License'}</button>
            </div>
          </form>

          {isReviewer && (
            <form onSubmit={submitCase} className="rounded-lg border border-border bg-secondary p-4">
              <h2 className="font-bold text-text-primary">Open Compliance Case</h2>
              <div className="mt-4 space-y-3">
                <input required value={caseForm.siteId} onChange={(event) => setCaseForm({ ...caseForm, siteId: event.target.value })} placeholder="Mine site ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <input value={caseForm.subjectUserId} onChange={(event) => setCaseForm({ ...caseForm, subjectUserId: event.target.value })} placeholder="Subject user ID" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <input required value={caseForm.caseType} onChange={(event) => setCaseForm({ ...caseForm, caseType: event.target.value })} placeholder="Case type" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <select value={caseForm.severity} onChange={(event) => setCaseForm({ ...caseForm, severity: event.target.value as ComplianceCaseSeverity })} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent">
                  {severities.filter((severity) => severity !== 'all').map((severity) => <option key={severity} value={severity}>{severity}</option>)}
                </select>
                <textarea required value={caseForm.findings} onChange={(event) => setCaseForm({ ...caseForm, findings: event.target.value })} placeholder="Inspection findings" rows={3} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <textarea value={caseForm.requiredActions} onChange={(event) => setCaseForm({ ...caseForm, requiredActions: event.target.value })} placeholder="Required actions, comma-separated" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={caseForm.dueDate} onChange={(event) => setCaseForm({ ...caseForm, dueDate: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
                  <input type="datetime-local" value={caseForm.inspectionScheduledAt} onChange={(event) => setCaseForm({ ...caseForm, inspectionScheduledAt: event.target.value })} className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent" />
                </div>
                <input value={caseForm.inspectorName} onChange={(event) => setCaseForm({ ...caseForm, inspectorName: event.target.value })} placeholder="Inspector name" className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <textarea value={caseForm.inspectionNotes} onChange={(event) => setCaseForm({ ...caseForm, inspectionNotes: event.target.value })} placeholder="Inspection notes" rows={2} className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                <button disabled={saving} className="w-full rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70">{saving ? 'Saving...' : 'Create Case'}</button>
              </div>
            </form>
          )}
        </aside>
      </div>

      {(selectedLicense || selectedCase) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <button className="absolute inset-0 cursor-default" aria-label="Close detail" onClick={() => { setSelectedLicense(null); setSelectedCase(null); }} />
          <aside className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-secondary p-6 shadow-2xl">
            {selectedLicense && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div><p className="text-sm font-semibold text-accent">License detail</p><h2 className="mt-1 text-2xl font-bold">{selectedLicense.licenseNumber}</h2></div>
                  <button onClick={() => setSelectedLicense(null)} className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent">Close</button>
                </div>
                <div className="grid grid-cols-2 gap-3">{statusChip(selectedLicense.status)} {statusChip(selectedLicense.renewalStatus)}</div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Holder: {selectedLicense.holder?.name || selectedLicense.holder?.email || '-'}</p>
                  <p>Site: {selectedLicense.site?.name || '-'}</p>
                  <p>Type: {selectedLicense.licenseType}</p>
                  <p>Authority: {selectedLicense.issuingAuthority}</p>
                  <p>Issue date: {formatDate(selectedLicense.issueDate)}</p>
                  <p>Expiry date: {formatDate(selectedLicense.expiryDate)}</p>
                  <p>Documents: {selectedLicense.documentIds.length}</p>
                  <p>Review notes: {selectedLicense.reviewNotes || '-'}</p>
                </div>
                {isReviewer && (
                  <div className="rounded-lg border border-border bg-primary p-4">
                    <h3 className="font-bold text-text-primary">Review</h3>
                    <textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} placeholder="Review notes" rows={3} className="mt-3 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent" />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => applyReview('under_review')} disabled={saving} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">Request Changes</button>
                      <button onClick={() => applyReview('approved')} disabled={saving} className="rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500">Approve</button>
                      <button onClick={() => applyReview('rejected')} disabled={saving} className="rounded-md bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500">Reject</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedCase && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div><p className="text-sm font-semibold text-accent">Compliance case</p><h2 className="mt-1 text-2xl font-bold">{selectedCase.caseType}</h2></div>
                  <button onClick={() => setSelectedCase(null)} className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent">Close</button>
                </div>
                <div className="flex gap-2">{statusChip(selectedCase.status)} {statusChip(selectedCase.severity)}</div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Site: {selectedCase.site?.name || '-'}</p>
                  <p>Subject: {selectedCase.subjectUser?.name || selectedCase.subjectUser?.email || '-'}</p>
                  <p>Findings: {selectedCase.findings}</p>
                  <p>Due: {formatDate(selectedCase.dueDate)}</p>
                  <p>Inspection: {formatDate(selectedCase.inspectionScheduledAt)}</p>
                  <p>Inspector: {selectedCase.inspectorName || '-'}</p>
                  <p>Notes: {selectedCase.inspectionNotes || '-'}</p>
                </div>
                <div className="rounded-lg border border-border bg-primary p-4">
                  <h3 className="font-bold text-text-primary">Required Actions</h3>
                  <div className="mt-3 space-y-2">
                    {(selectedCase.requiredActions || []).length === 0 ? <p className="text-sm text-text-muted">No actions recorded.</p> : selectedCase.requiredActions?.map((action, index) => (
                      <div key={`${action.title}-${index}`} className="rounded-md border border-border bg-secondary p-3 text-sm text-text-secondary">
                        {String(action.title || action.description || 'Action')}
                      </div>
                    ))}
                  </div>
                </div>
                {isReviewer && (
                  <div className="flex flex-wrap gap-2">
                    {caseStatuses.map((status) => (
                      <button key={status} onClick={() => updateCaseStatus(status)} disabled={saving} className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent">
                        {status.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
