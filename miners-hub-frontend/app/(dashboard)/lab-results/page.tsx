'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import FormModal from '../../../components/FormModal';
import MultiFileInput, { FilePreview } from '../../../components/MultiFileInput';
import RecordPicker from '../../../components/RecordPicker';
import {
  createLaboratoryPartner,
  createLabResult,
  getLabResults,
  getLaboratoryPartners,
  LabResult,
  LabResultStatus,
  LaboratoryPartner,
  verifyLabResult,
} from '../../../lib/api/lab-results';
import { uploadDocument } from '../../../lib/api/documents';
import { DocumentType } from '../../../lib/types';

const statusStyles: Record<string, string> = {
  requested: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  submitted: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  verified: 'bg-green-500/15 text-green-300 border-green-500/30',
  rejected: 'bg-red-500/15 text-red-300 border-red-500/30',
  active: 'bg-green-500/15 text-green-300 border-green-500/30',
  pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  suspended: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const StatusChip = ({ status }: { status: string }) => (
  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[status] || 'bg-border text-text-secondary border-border'}`}>
    {status.replace(/_/g, ' ')}
  </span>
);

export default function LabResultsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [partners, setPartners] = useState<LaboratoryPartner[]>([]);
  const [results, setResults] = useState<LabResult[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | LabResultStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCertificate, setIsUploadingCertificate] = useState(false);
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  const [certificateFiles, setCertificateFiles] = useState<FilePreview[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    companyName: '',
    accreditationNumber: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    status: 'active' as const,
  });
  const [requestForm, setRequestForm] = useState({
    labId: '',
    sampleReference: '',
    mineralType: '',
    grade: '',
    assayValue: '',
    assayUnit: '',
    listingId: '',
    productionReportId: '',
    mineralPassportId: '',
    certificateUrl: '',
    resultNotes: '',
  });

  const isAdmin = currentUser?.role === 'admin';
  const activePartners = useMemo(
    () => partners.filter((partner) => partner.status === 'active'),
    [partners],
  );

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const [partnerData, resultData] = await Promise.all([
        getLaboratoryPartners(),
        getLabResults(statusFilter === 'all' ? {} : { status: statusFilter }),
      ]);
      setPartners(partnerData);
      setResults(resultData.data);
      if (!requestForm.labId && partnerData.length > 0) {
        const preferred = partnerData.find((partner) => partner.status === 'active') || partnerData[0];
        setRequestForm((prev) => ({ ...prev, labId: preferred.id }));
      }
    } catch {
      setError('Unable to load laboratory records right now.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, requestForm.labId, statusFilter]);

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }
    void fetchData();
  }, [currentUser, fetchData, router]);

  useEffect(() => {
    return () => {
      certificateFiles.forEach((filePreview) => URL.revokeObjectURL(filePreview.previewUrl));
    };
  }, [certificateFiles]);

  const clearCertificateFiles = () => {
    certificateFiles.forEach((filePreview) => URL.revokeObjectURL(filePreview.previewUrl));
    setCertificateFiles([]);
  };

  const handleCreatePartner = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await createLaboratoryPartner({
        ...partnerForm,
        accreditationNumber: partnerForm.accreditationNumber || null,
        address: partnerForm.address || null,
        contactEmail: partnerForm.contactEmail || null,
        contactPhone: partnerForm.contactPhone || null,
      });
      setPartnerForm({
        companyName: '',
        accreditationNumber: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        status: 'active',
      });
      setIsPartnerFormOpen(false);
      await fetchData();
    } catch {
      setError('Could not save laboratory partner.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateResult = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      await createLabResult({
        labId: requestForm.labId,
        sampleReference: requestForm.sampleReference,
        mineralType: requestForm.mineralType,
        grade: requestForm.grade || null,
        assayValue: requestForm.assayValue ? Number(requestForm.assayValue) : null,
        assayUnit: requestForm.assayUnit || null,
        listingId: requestForm.listingId || null,
        productionReportId: requestForm.productionReportId || null,
        mineralPassportId: requestForm.mineralPassportId || null,
        certificateUrl: requestForm.certificateUrl || null,
        resultPayload: requestForm.resultNotes ? { notes: requestForm.resultNotes } : undefined,
      });
      setRequestForm((prev) => ({
        ...prev,
        sampleReference: '',
        mineralType: '',
        grade: '',
        assayValue: '',
        assayUnit: '',
        listingId: '',
        productionReportId: '',
        mineralPassportId: '',
        certificateUrl: '',
        resultNotes: '',
      }));
      clearCertificateFiles();
      setIsResultFormOpen(false);
      await fetchData();
    } catch {
      setError('Could not save lab result request.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCertificateFilesAdded = async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setIsUploadingCertificate(true);
    setError(null);
    certificateFiles.forEach((filePreview) => URL.revokeObjectURL(filePreview.previewUrl));
    const preview: FilePreview = { file, previewUrl: URL.createObjectURL(file) };
    setCertificateFiles([preview]);
    try {
      const document = await uploadDocument(file, {
        type: DocumentType.CERTIFICATE,
        uploadCategory: 'laboratory_certificate',
        ownerResource: requestForm.productionReportId
          ? 'production_report'
          : requestForm.listingId
            ? 'listing'
            : requestForm.mineralPassportId
              ? 'mineral_passport'
              : undefined,
        ownerResourceId: requestForm.productionReportId || requestForm.listingId || requestForm.mineralPassportId || undefined,
        purpose: 'lab_certificate',
      });
      setRequestForm((prev) => ({ ...prev, certificateUrl: document.url }));
    } catch {
      URL.revokeObjectURL(preview.previewUrl);
      setCertificateFiles([]);
      setError('Could not upload lab certificate.');
    } finally {
      setIsUploadingCertificate(false);
    }
  };

  const handleCertificateRemoved = (index: number) => {
    const filePreview = certificateFiles[index];
    if (filePreview) URL.revokeObjectURL(filePreview.previewUrl);
    setCertificateFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setRequestForm((prev) => ({ ...prev, certificateUrl: '' }));
  };

  const handleVerify = async (result: LabResult, status: Extract<LabResultStatus, 'verified' | 'rejected'>) => {
    const reviewNotes = window.prompt(
      status === 'verified' ? 'Verification notes' : 'Rejection reason',
      result.reviewNotes || '',
    );
    if (reviewNotes === null) return;
    setIsSaving(true);
    try {
      await verifyLabResult(result.id, { status, reviewNotes });
      await fetchData();
    } catch {
      setError('Could not update verification status.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) return null;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Laboratory Results</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage assay requests, certificates, and verification status for listings, production reports, and passports.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <button type="button" onClick={() => setIsPartnerFormOpen(true)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:border-accent hover:text-accent">
              Add Laboratory
            </button>
          )}
          <button type="button" onClick={() => setIsResultFormOpen(true)} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400">
            Add Lab Result
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {isAdmin && (
        <FormModal
          isOpen={isPartnerFormOpen}
          title="Add Laboratory Partner"
          description="Register an accredited laboratory partner for assay certificates and verification."
          onClose={() => setIsPartnerFormOpen(false)}
        >
          <form className="space-y-3" onSubmit={handleCreatePartner}>
            <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Company name" value={partnerForm.companyName} onChange={(e) => setPartnerForm((prev) => ({ ...prev, companyName: e.target.value }))} required />
            <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Accreditation number" value={partnerForm.accreditationNumber} onChange={(e) => setPartnerForm((prev) => ({ ...prev, accreditationNumber: e.target.value }))} />
            <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Contact email" type="email" value={partnerForm.contactEmail} onChange={(e) => setPartnerForm((prev) => ({ ...prev, contactEmail: e.target.value }))} />
            <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Contact phone" value={partnerForm.contactPhone} onChange={(e) => setPartnerForm((prev) => ({ ...prev, contactPhone: e.target.value }))} />
            <textarea className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Address" rows={3} value={partnerForm.address} onChange={(e) => setPartnerForm((prev) => ({ ...prev, address: e.target.value }))} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsPartnerFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
              <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400 disabled:opacity-60" disabled={isSaving}>
                Save Laboratory
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <FormModal
        isOpen={isResultFormOpen}
        title="Request or Upload Result"
        description="Create an assay request or attach a laboratory certificate to an existing mining workflow."
        onClose={() => setIsResultFormOpen(false)}
      >
        <form className="space-y-3" onSubmit={handleCreateResult}>
          <select className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={requestForm.labId} onChange={(e) => setRequestForm((prev) => ({ ...prev, labId: e.target.value }))} required>
            <option value="">Select active lab</option>
            {activePartners.map((partner) => (
              <option key={partner.id} value={partner.id}>{partner.companyName}</option>
            ))}
          </select>
          <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Sample reference" value={requestForm.sampleReference} onChange={(e) => setRequestForm((prev) => ({ ...prev, sampleReference: e.target.value }))} required />
          <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Mineral type" value={requestForm.mineralType} onChange={(e) => setRequestForm((prev) => ({ ...prev, mineralType: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Grade" value={requestForm.grade} onChange={(e) => setRequestForm((prev) => ({ ...prev, grade: e.target.value }))} />
            <input className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Assay value" inputMode="decimal" value={requestForm.assayValue} onChange={(e) => setRequestForm((prev) => ({ ...prev, assayValue: e.target.value }))} />
          </div>
          <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Assay unit, e.g. %, g/t" value={requestForm.assayUnit} onChange={(e) => setRequestForm((prev) => ({ ...prev, assayUnit: e.target.value }))} />
          <MultiFileInput
            id="lab-certificate"
            label="Certificate file"
            files={certificateFiles}
            onFilesAdded={(files) => void handleCertificateFilesAdded(files)}
            onFileRemoved={handleCertificateRemoved}
            accept="application/pdf,image/png,image/jpeg"
            helperText="Drop a PDF, JPG, or PNG certificate here. It uploads to Cloudinary immediately."
            multiple={false}
            maxFiles={1}
            disabled={isUploadingCertificate}
          />
          {isUploadingCertificate && <p className="text-xs text-text-muted">Uploading certificate...</p>}
          <input className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Certificate URL" type="url" value={requestForm.certificateUrl} onChange={(e) => setRequestForm((prev) => ({ ...prev, certificateUrl: e.target.value }))} />
          <RecordPicker
            resource="listings"
            value={requestForm.listingId}
            label="Listing"
            placeholder="Search by mineral, seller, grade, or location"
            onChange={(id) => setRequestForm((prev) => ({ ...prev, listingId: id }))}
            onSelect={(option) => setRequestForm((prev) => ({
              ...prev,
              listingId: option.id,
              mineralType: String(option.metadata?.mineralType || prev.mineralType),
              grade: String(option.metadata?.grade || prev.grade),
            }))}
          />
          <RecordPicker
            resource="production-reports"
            value={requestForm.productionReportId}
            label="Production report"
            placeholder="Search by mineral, site, miner, or grade"
            onChange={(id) => setRequestForm((prev) => ({ ...prev, productionReportId: id }))}
            onSelect={(option) => setRequestForm((prev) => ({
              ...prev,
              productionReportId: option.id,
              mineralType: String(option.metadata?.mineralType || prev.mineralType),
              grade: String(option.metadata?.grade || prev.grade),
            }))}
          />
          <RecordPicker
            resource="mineral-passports"
            value={requestForm.mineralPassportId}
            label="Mineral passport"
            placeholder="Search by passport number, miner, listing, or shipment"
            context={{ listingId: requestForm.listingId || undefined }}
            onChange={(id) => setRequestForm((prev) => ({ ...prev, mineralPassportId: id }))}
            onSelect={(option) => setRequestForm((prev) => ({
              ...prev,
              mineralPassportId: option.id,
              listingId: String(option.metadata?.listingId || prev.listingId),
              productionReportId: String(option.metadata?.productionReportId || prev.productionReportId),
            }))}
          />
          <textarea className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" placeholder="Result notes" rows={3} value={requestForm.resultNotes} onChange={(e) => setRequestForm((prev) => ({ ...prev, resultNotes: e.target.value }))} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsResultFormOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent">Cancel</button>
            <button className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-content hover:bg-yellow-400 disabled:opacity-60" disabled={isSaving || activePartners.length === 0}>
              Save Lab Result
            </button>
          </div>
        </form>
      </FormModal>

      <div className="grid gap-6">
        <section className="rounded-lg border border-border bg-secondary">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Assay Records</h2>
              <p className="text-sm text-text-muted">{isLoading ? 'Loading records...' : `${results.length} records shown`}</p>
            </div>
            <select className="rounded-md border border-border bg-primary px-3 py-2 text-sm text-text-primary" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}>
              <option value="all">All statuses</option>
              <option value="requested">Requested</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-primary text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-3">Sample</th>
                  <th className="px-4 py-3">Lab</th>
                  <th className="px-4 py-3">Mineral</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Links</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Certificate</th>
                  {isAdmin && <th className="px-4 py-3">Review</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-primary/50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-text-primary">{result.sampleReference}</p>
                      <p className="text-xs text-text-muted">{new Date(result.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">{result.lab?.companyName || result.labId}</td>
                    <td className="px-4 py-4 text-text-secondary">{result.mineralType}</td>
                    <td className="px-4 py-4 text-text-secondary">{result.grade || '-'} {result.assayValue ? `(${result.assayValue} ${result.assayUnit || ''})` : ''}</td>
                    <td className="px-4 py-4 text-xs text-text-muted">
                      <p>Listing: {result.listingId || '-'}</p>
                      <p>Report: {result.productionReportId || '-'}</p>
                      <p>Passport: {result.mineralPassportId || '-'}</p>
                    </td>
                    <td className="px-4 py-4"><StatusChip status={result.status} /></td>
                    <td className="px-4 py-4">
                      {result.certificateUrl ? (
                        <a className="text-accent hover:text-yellow-400" href={result.certificateUrl} target="_blank" rel="noreferrer">View certificate</a>
                      ) : (
                        <span className="text-text-muted">Pending</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-500 disabled:opacity-50" disabled={isSaving || result.status === 'verified'} onClick={() => handleVerify(result, 'verified')}>
                            Verify
                          </button>
                          <button className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50" disabled={isSaving || result.status === 'rejected'} onClick={() => handleVerify(result, 'rejected')}>
                            Reject
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {!isLoading && results.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} className="px-4 py-12 text-center text-text-muted">
                      No laboratory results match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {isAdmin && partners.length > 0 && (
        <section className="rounded-lg border border-border bg-secondary p-5">
          <h2 className="text-lg font-semibold text-text-primary">Laboratory Partners</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {partners.map((partner) => (
              <div key={partner.id} className="rounded-lg border border-border bg-primary p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{partner.companyName}</p>
                    <p className="text-xs text-text-muted">{partner.accreditationNumber || 'No accreditation number'}</p>
                  </div>
                  <StatusChip status={partner.status} />
                </div>
                <p className="mt-3 text-sm text-text-secondary">{partner.address || 'Address not provided'}</p>
                <p className="mt-2 text-xs text-text-muted">{partner.contactEmail || '-'} {partner.contactPhone ? `· ${partner.contactPhone}` : ''}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
