"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import FormModal from "../../../components/FormModal";
import RecordPicker from "../../../components/RecordPicker";
import {
  ComplianceCase,
  ComplianceCaseSeverity,
  ComplianceCaseStatus,
  createAmlKybRiskProfile,
  createComplianceCase,
  createEsgObligation,
  createExportReadiness,
  createLicense,
  AmlKybActorType,
  AmlKybReviewStatus,
  AmlKybRiskProfile,
  AmlKybRiskTier,
  EsgObligation,
  EsgObligationStatus,
  EsgObligationType,
  ExportCustomsStatus,
  ExportReadinessChecklist,
  ExportReadinessStatus,
  getAmlKybRiskProfiles,
  getComplianceCases,
  getEsgObligations,
  getExportReadiness,
  getLicenses,
  License,
  LicenseStatus,
  LicenseType,
  reviewAmlKybRiskProfile,
  reviewExportReadiness,
  reviewEsgObligation,
  reviewLicense,
  updateComplianceCase,
} from "../../../lib/api/compliance";

const licenseStatuses: Array<"all" | LicenseStatus> = [
  "all",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "expired",
];
const licenseTypes: LicenseType[] = [
  "reconnaissance_permit",
  "exploration_licence",
  "small_scale_mining_lease",
  "mining_lease",
  "quarry_lease",
  "water_use_permit",
  "possess_and_purchase_licence",
  "mineral_buying_center_licence",
  "mineral_export_permit",
];
const caseStatuses: ComplianceCaseStatus[] = [
  "open",
  "inspection_scheduled",
  "action_required",
  "resolved",
  "closed",
];
const exportReadinessStatuses: Array<"all" | ExportReadinessStatus> = [
  "all",
  "draft",
  "under_review",
  "blocked",
  "ready",
  "expired",
];
const esgObligationTypes: EsgObligationType[] = [
  "community_development_agreement",
  "environmental_impact_assessment",
  "rehabilitation_program",
  "reclamation_reserve",
  "compensation_remediation",
  "community_benefit",
  "other",
];
const esgObligationStatuses: Array<"all" | EsgObligationStatus> = [
  "all",
  "missing",
  "draft",
  "submitted",
  "approved",
  "action_required",
  "overdue",
  "fulfilled",
  "waived",
];
const amlActorTypes: AmlKybActorType[] = [
  "buyer",
  "exporter",
  "buying_center",
  "investor",
  "miner",
  "logistics_provider",
  "laboratory",
  "high_value_actor",
  "other",
];
const amlRiskTiers: Array<"all" | AmlKybRiskTier> = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];
const amlReviewStatuses: Array<"all" | AmlKybReviewStatus> = [
  "all",
  "draft",
  "submitted",
  "under_review",
  "cleared",
  "action_required",
  "suspicious",
  "escalated",
  "closed",
];
const customsStatuses: ExportCustomsStatus[] = [
  "not_required",
  "not_started",
  "preparing",
  "submitted",
  "cleared",
  "held",
  "rejected",
];
const severities: Array<"all" | ComplianceCaseSeverity> = [
  "all",
  "low",
  "medium",
  "high",
  "critical",
];

const emptyLicenseForm = {
  holderUserId: "",
  siteId: "",
  licenseNumber: "",
  licenseType: "mining_lease" as LicenseType,
  issuingAuthority: "",
  issueDate: "",
  expiryDate: "",
  annualServiceFee: "",
  serviceFeePaidUntil: "",
  applicationPriorityDate: "",
  permitShipmentReference: "",
  issuingOffice: "",
  documentIds: "",
};

const emptyCaseForm = {
  siteId: "",
  subjectUserId: "",
  caseType: "",
  severity: "medium" as ComplianceCaseSeverity,
  assignedTo: "",
  findings: "",
  requiredActions: "",
  dueDate: "",
  inspectionScheduledAt: "",
  inspectorName: "",
  inspectionNotes: "",
};

const emptyExportForm = {
  exporterUserId: "",
  orderId: "",
  mineralPassportId: "",
  licenseId: "",
  exportPermitDocumentId: "",
  assayDocumentId: "",
  invoiceDocumentId: "",
  customsStatus: "not_started" as ExportCustomsStatus,
  carrierReference: "",
  blockingIssues: "",
};

const emptyEsgForm = {
  responsibleUserId: "",
  siteId: "",
  licenseId: "",
  obligationType: "community_development_agreement" as EsgObligationType,
  title: "",
  description: "",
  status: "submitted" as EsgObligationStatus,
  documentIds: "",
  evidenceUrls: "",
  dueDate: "",
};

const emptyAmlForm = {
  userId: "",
  actorType: "buyer" as AmlKybActorType,
  businessName: "",
  businessRegistrationNumber: "",
  beneficialOwnerSummary: "",
  beneficialOwnerDocumentIds: "",
  scumlRegistrationNumber: "",
  scumlDocumentIds: "",
  sourceOfFundsNotes: "",
  sourceOfMineralsNotes: "",
};

function splitList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function statusChip(status: string) {
  const classes: Record<string, string> = {
    approved: "bg-green-500/15 text-green-300 border-green-500/30",
    resolved: "bg-green-500/15 text-green-300 border-green-500/30",
    closed: "bg-border text-text-muted border-border",
    submitted: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    under_review: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    inspection_scheduled: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    action_required: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    rejected: "bg-red-500/15 text-red-300 border-red-500/30",
    suspicious: "bg-red-500/15 text-red-300 border-red-500/30",
    escalated: "bg-red-700/30 text-red-200 border-red-500/40",
    reported: "bg-red-700/30 text-red-200 border-red-500/40",
    expired: "bg-red-500/15 text-red-300 border-red-500/30",
    blocked: "bg-red-500/15 text-red-300 border-red-500/30",
    ready: "bg-green-500/15 text-green-300 border-green-500/30",
    registered: "bg-green-500/15 text-green-300 border-green-500/30",
    draft: "bg-border text-text-muted border-border",
    preparing: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    cleared: "bg-green-500/15 text-green-300 border-green-500/30",
    held: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    not_started: "bg-border text-text-muted border-border",
    not_required: "bg-border text-text-muted border-border",
    missing: "bg-red-500/15 text-red-300 border-red-500/30",
    fulfilled: "bg-green-500/15 text-green-300 border-green-500/30",
    waived: "bg-border text-text-muted border-border",
    open: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    low: "bg-green-500/15 text-green-300 border-green-500/30",
    medium: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    high: "bg-red-500/15 text-red-300 border-red-500/30",
    critical: "bg-red-700/30 text-red-200 border-red-500/40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${classes[status] || classes.closed}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "-";
}

type ComplianceWorkspace =
  | "licenses"
  | "cases"
  | "export"
  | "esg"
  | "aml";

const workspaceTabs: Array<{
  id: ComplianceWorkspace;
  label: string;
  eyebrow: string;
  description: string;
}> = [
  {
    id: "licenses",
    label: "Licenses",
    eyebrow: "Titles & permits",
    description: "Review mineral titles, issuing authorities, service fees, expiry risk, and renewal state.",
  },
  {
    id: "cases",
    label: "Cases",
    eyebrow: "Inspections",
    description: "Track inspection findings, required actions, due dates, and case closure.",
  },
  {
    id: "export",
    label: "Export",
    eyebrow: "Readiness",
    description: "Verify passport, title, assay, invoice, customs, carrier, and blocking issue evidence.",
  },
  {
    id: "esg",
    label: "ESG",
    eyebrow: "Obligations",
    description: "Monitor CDA, EIA, rehabilitation, reclamation, compensation, and community commitments.",
  },
  {
    id: "aml",
    label: "AML/KYB",
    eyebrow: "Risk controls",
    description: "Review beneficial ownership, SCUML evidence, source checks, and suspicious activity status.",
  },
];

function MetricTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number | string;
  tone?: "neutral" | "good" | "warning" | "danger" | "info";
}) {
  const tones = {
    neutral: "text-text-primary",
    good: "text-green-300",
    warning: "text-yellow-300",
    danger: "text-red-300",
    info: "text-blue-300",
  };
  return (
    <div className="rounded-md border border-border bg-secondary px-4 py-3">
      <p className="text-xs font-semibold uppercase text-text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-border px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-base font-bold text-text-primary">{title}</h2>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
      {typeof count === "number" ? (
        <span className="w-fit rounded-md border border-border bg-primary px-2.5 py-1 text-xs font-semibold text-text-muted">
          {count} records
        </span>
      ) : null}
    </div>
  );
}

export default function CompliancePage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [cases, setCases] = useState<ComplianceCase[]>([]);
  const [exportChecklists, setExportChecklists] = useState<
    ExportReadinessChecklist[]
  >([]);
  const [esgObligations, setEsgObligations] = useState<EsgObligation[]>([]);
  const [amlProfiles, setAmlProfiles] = useState<AmlKybRiskProfile[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [selectedCase, setSelectedCase] = useState<ComplianceCase | null>(null);
  const [selectedExportChecklist, setSelectedExportChecklist] =
    useState<ExportReadinessChecklist | null>(null);
  const [selectedEsgObligation, setSelectedEsgObligation] =
    useState<EsgObligation | null>(null);
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [caseFilter, setCaseFilter] = useState("all");
  const [exportFilter, setExportFilter] = useState("all");
  const [esgFilter, setEsgFilter] = useState("all");
  const [amlRiskFilter, setAmlRiskFilter] = useState("all");
  const [amlReviewFilter, setAmlReviewFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeWorkspace, setActiveWorkspace] =
    useState<ComplianceWorkspace>("licenses");
  const [licenseForm, setLicenseForm] = useState(emptyLicenseForm);
  const [caseForm, setCaseForm] = useState(emptyCaseForm);
  const [exportForm, setExportForm] = useState(emptyExportForm);
  const [esgForm, setEsgForm] = useState(emptyEsgForm);
  const [amlForm, setAmlForm] = useState(emptyAmlForm);
  const [isLicenseFormOpen, setIsLicenseFormOpen] = useState(false);
  const [isCaseFormOpen, setIsCaseFormOpen] = useState(false);
  const [isExportFormOpen, setIsExportFormOpen] = useState(false);
  const [isEsgFormOpen, setIsEsgFormOpen] = useState(false);
  const [isAmlFormOpen, setIsAmlFormOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [exportReviewNotes, setExportReviewNotes] = useState("");
  const [esgReviewNotes, setEsgReviewNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReviewer =
    currentUser?.role === "admin" || currentUser?.role === "government";
  const canUsePage =
    currentUser?.role === "admin" ||
    currentUser?.role === "government" ||
    currentUser?.role === "miner";

  const summary = useMemo(
    () => ({
      licenses: licenses.length,
      pendingReviews: licenses.filter(
        (license) =>
          license.status === "submitted" || license.status === "under_review",
      ).length,
      expiringSoon: licenses.filter(
        (license) => license.expiry.isDueSoon || license.expiry.isExpired,
      ).length,
      openCases: cases.filter(
        (item) => item.status !== "closed" && item.status !== "resolved",
      ).length,
      exportReady: exportChecklists.filter(
        (item) => item.readinessStatus === "ready",
      ).length,
      exportBlocked: exportChecklists.filter(
        (item) => item.readinessStatus === "blocked",
      ).length,
      esgOpen: esgObligations.filter(
        (item) => !["approved", "fulfilled", "waived"].includes(item.status),
      ).length,
      esgOverdue: esgObligations.filter((item) => item.due.isOverdue).length,
      amlHighRisk: amlProfiles.filter((item) =>
        ["high", "critical"].includes(item.riskTier),
      ).length,
    }),
    [licenses, cases, exportChecklists, esgObligations, amlProfiles],
  );

  const activeWorkspaceInfo = workspaceTabs.find(
    (tab) => tab.id === activeWorkspace,
  ) || workspaceTabs[0];

  const workspaceStats = useMemo(() => {
    switch (activeWorkspace) {
      case "licenses":
        return [
          { label: "Total titles", value: summary.licenses, tone: "neutral" as const },
          { label: "Pending review", value: summary.pendingReviews, tone: "warning" as const },
          { label: "Expiring or expired", value: summary.expiringSoon, tone: "danger" as const },
        ];
      case "cases":
        return [
          { label: "Open cases", value: summary.openCases, tone: "info" as const },
          {
            label: "Critical severity",
            value: cases.filter((item) => item.severity === "critical").length,
            tone: "danger" as const,
          },
          {
            label: "Action required",
            value: cases.filter((item) => item.status === "action_required").length,
            tone: "warning" as const,
          },
        ];
      case "export":
        return [
          { label: "Checklists", value: exportChecklists.length, tone: "neutral" as const },
          { label: "Ready", value: summary.exportReady, tone: "good" as const },
          { label: "Blocked", value: summary.exportBlocked, tone: "danger" as const },
        ];
      case "esg":
        return [
          { label: "Obligations", value: esgObligations.length, tone: "neutral" as const },
          { label: "Open", value: summary.esgOpen, tone: "warning" as const },
          { label: "Overdue", value: summary.esgOverdue, tone: "danger" as const },
        ];
      case "aml":
        return [
          { label: "Profiles", value: amlProfiles.length, tone: "neutral" as const },
          { label: "High risk", value: summary.amlHighRisk, tone: "danger" as const },
          {
            label: "Action required",
            value: amlProfiles.filter((item) => item.reviewStatus === "action_required").length,
            tone: "warning" as const,
          },
        ];
      default:
        return [];
    }
  }, [
    activeWorkspace,
    amlProfiles,
    cases,
    esgObligations.length,
    exportChecklists.length,
    summary,
  ]);

  const loadCompliance = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        licenseResponse,
        caseResponse,
        exportResponse,
        esgResponse,
        amlResponse,
      ] = await Promise.all([
        getLicenses({ status: licenseFilter }),
        getComplianceCases({ status: caseFilter, severity: severityFilter }),
        getExportReadiness({ readinessStatus: exportFilter }),
        getEsgObligations({ status: esgFilter }),
        getAmlKybRiskProfiles({
          riskTier: amlRiskFilter,
          reviewStatus: amlReviewFilter,
        }),
      ]);
      setLicenses(licenseResponse.data);
      setCases(caseResponse.data);
      setExportChecklists(exportResponse.data);
      setEsgObligations(esgResponse.data);
      setAmlProfiles(amlResponse.data);
    } catch (err: any) {
      setError(err?.message || "Failed to load compliance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && !canUsePage) {
      router.push("/dashboard");
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
        holderUserId: isReviewer
          ? licenseForm.holderUserId || undefined
          : undefined,
        siteId: licenseForm.siteId || null,
        licenseNumber: licenseForm.licenseNumber,
        licenseType: licenseForm.licenseType,
        issuingAuthority: licenseForm.issuingAuthority,
        issueDate: licenseForm.issueDate,
        expiryDate: licenseForm.expiryDate,
        annualServiceFee: licenseForm.annualServiceFee
          ? Number(licenseForm.annualServiceFee)
          : null,
        serviceFeePaidUntil: licenseForm.serviceFeePaidUntil || null,
        applicationPriorityDate: licenseForm.applicationPriorityDate || null,
        permitShipmentReference: licenseForm.permitShipmentReference || null,
        issuingOffice: licenseForm.issuingOffice || null,
        documentIds: splitList(licenseForm.documentIds),
      });
      setSelectedLicense(license);
      setLicenseForm(emptyLicenseForm);
      setIsLicenseFormOpen(false);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to submit license");
    } finally {
      setSaving(false);
    }
  };

  const submitExportReadiness = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const checklist = await createExportReadiness({
        exporterUserId: isReviewer
          ? exportForm.exporterUserId || undefined
          : undefined,
        orderId: exportForm.orderId || null,
        mineralPassportId: exportForm.mineralPassportId || null,
        licenseId: exportForm.licenseId || null,
        exportPermitDocumentId: exportForm.exportPermitDocumentId || null,
        assayDocumentId: exportForm.assayDocumentId || null,
        invoiceDocumentId: exportForm.invoiceDocumentId || null,
        customsStatus: exportForm.customsStatus,
        carrierReference: exportForm.carrierReference || null,
        blockingIssues: splitList(exportForm.blockingIssues),
      });
      setSelectedExportChecklist(checklist);
      setExportForm(emptyExportForm);
      setIsExportFormOpen(false);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to create export readiness checklist");
    } finally {
      setSaving(false);
    }
  };

  const submitEsgObligation = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const obligation = await createEsgObligation({
        responsibleUserId: isReviewer
          ? esgForm.responsibleUserId || undefined
          : undefined,
        siteId: esgForm.siteId || null,
        licenseId: esgForm.licenseId || null,
        obligationType: esgForm.obligationType,
        title: esgForm.title,
        description: esgForm.description || null,
        status: esgForm.status,
        documentIds: splitList(esgForm.documentIds),
        evidenceUrls: splitList(esgForm.evidenceUrls),
        dueDate: esgForm.dueDate || null,
      });
      setSelectedEsgObligation(obligation);
      setEsgForm(emptyEsgForm);
      setIsEsgFormOpen(false);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to create ESG obligation");
    } finally {
      setSaving(false);
    }
  };

  const submitAmlProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createAmlKybRiskProfile({
        userId: isReviewer ? amlForm.userId || undefined : undefined,
        actorType: amlForm.actorType,
        businessName: amlForm.businessName || null,
        businessRegistrationNumber: amlForm.businessRegistrationNumber || null,
        beneficialOwnerSummary: amlForm.beneficialOwnerSummary || null,
        beneficialOwnerDocumentIds: splitList(
          amlForm.beneficialOwnerDocumentIds,
        ),
        scumlRegistrationNumber: amlForm.scumlRegistrationNumber || null,
        scumlDocumentIds: splitList(amlForm.scumlDocumentIds),
        sourceOfFundsNotes: amlForm.sourceOfFundsNotes || null,
        sourceOfMineralsNotes: amlForm.sourceOfMineralsNotes || null,
      });
      setAmlForm(emptyAmlForm);
      setIsAmlFormOpen(false);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to create AML/KYB profile");
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
        requiredActions: splitList(caseForm.requiredActions).map((title) => ({
          title,
          status: "open",
        })),
        dueDate: caseForm.dueDate || null,
        inspectionScheduledAt: caseForm.inspectionScheduledAt || null,
        inspectorName: caseForm.inspectorName || null,
        inspectionNotes: caseForm.inspectionNotes || null,
      });
      setSelectedCase(complianceCase);
      setCaseForm(emptyCaseForm);
      setIsCaseFormOpen(false);
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to create compliance case");
    } finally {
      setSaving(false);
    }
  };

  const applyReview = async (status: LicenseStatus) => {
    if (!selectedLicense) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await reviewLicense(
        selectedLicense.id,
        status,
        reviewNotes,
      );
      setSelectedLicense(updated);
      setReviewNotes("");
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to review license");
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
      setError(err?.message || "Failed to update compliance case");
    } finally {
      setSaving(false);
    }
  };

  const applyExportReview = async (readinessStatus: ExportReadinessStatus) => {
    if (!selectedExportChecklist) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await reviewExportReadiness(
        selectedExportChecklist.id,
        readinessStatus,
        {
          reviewNotes: exportReviewNotes,
          blockingIssues: selectedExportChecklist.blockingIssues,
        },
      );
      setSelectedExportChecklist(updated);
      setExportReviewNotes("");
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to review export readiness");
    } finally {
      setSaving(false);
    }
  };

  const applyEsgReview = async (status: EsgObligationStatus) => {
    if (!selectedEsgObligation) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await reviewEsgObligation(
        selectedEsgObligation.id,
        status,
        esgReviewNotes,
      );
      setSelectedEsgObligation(updated);
      setEsgReviewNotes("");
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to review ESG obligation");
    } finally {
      setSaving(false);
    }
  };

  const applyAmlReview = async (
    profile: AmlKybRiskProfile,
    reviewStatus: AmlKybReviewStatus,
  ) => {
    setSaving(true);
    setError(null);
    try {
      await reviewAmlKybRiskProfile(profile.id, {
        reviewStatus,
        riskTier: profile.riskTier,
      });
      await loadCompliance();
    } catch (err: any) {
      setError(err?.message || "Failed to review AML/KYB profile");
    } finally {
      setSaving(false);
    }
  };

  if (currentUser && !canUsePage) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Licensing & Compliance
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">
            Review mineral titles, export readiness, ESG obligations, compliance
            cases, and AML/KYB risk from one role-aware workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 xl:justify-end">
          {activeWorkspace === "licenses" && (
            <button
              type="button"
              onClick={() => setIsLicenseFormOpen(true)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
            >
              Submit License
            </button>
          )}
          {activeWorkspace === "cases" && isReviewer && (
            <button
              type="button"
              onClick={() => setIsCaseFormOpen(true)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
            >
              Open Case
            </button>
          )}
          {activeWorkspace === "export" && (
            <button
              type="button"
              onClick={() => setIsExportFormOpen(true)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
            >
              Create Checklist
            </button>
          )}
          {activeWorkspace === "esg" && (
            <button
              type="button"
              onClick={() => setIsEsgFormOpen(true)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
            >
              Add Obligation
            </button>
          )}
          {activeWorkspace === "aml" && (
            <button
              type="button"
              onClick={() => setIsAmlFormOpen(true)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
            >
              Add AML/KYB Profile
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-secondary p-2">
        <div className="flex min-w-max gap-2">
          {workspaceTabs.map((tab) => {
            const active = activeWorkspace === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveWorkspace(tab.id)}
                className={`min-w-36 rounded-md px-4 py-3 text-left transition ${
                  active
                    ? "bg-accent text-accent-content"
                    : "bg-primary text-text-secondary hover:text-text-primary"
                }`}
              >
                <span className="block text-xs font-semibold uppercase opacity-80">
                  {tab.eyebrow}
                </span>
                <span className="mt-1 block text-sm font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <p className="text-xs font-semibold uppercase text-accent">
              {activeWorkspaceInfo.eyebrow}
            </p>
            <h2 className="mt-1 text-xl font-bold text-text-primary">
              {activeWorkspaceInfo.label}
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-text-secondary">
              {activeWorkspaceInfo.description}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {workspaceStats.map((stat) => (
              <MetricTile
                key={stat.label}
                label={stat.label}
                value={stat.value}
                tone={stat.tone}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-secondary p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {activeWorkspace === "licenses" && (
            <select
              value={licenseFilter}
              onChange={(event) => setLicenseFilter(event.target.value)}
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {licenseStatuses.map((status) => (
                <option key={status} value={status}>
                  Status: {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          )}
          {activeWorkspace === "cases" && (
            <>
              <select
                value={caseFilter}
                onChange={(event) => setCaseFilter(event.target.value)}
                className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="all">Status: all</option>
                {caseStatuses.map((status) => (
                  <option key={status} value={status}>
                    Status: {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select
                value={severityFilter}
                onChange={(event) => setSeverityFilter(event.target.value)}
                className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              >
                {severities.map((severity) => (
                  <option key={severity} value={severity}>
                    Severity: {severity}
                  </option>
                ))}
              </select>
            </>
          )}
          {activeWorkspace === "export" && (
            <select
              value={exportFilter}
              onChange={(event) => setExportFilter(event.target.value)}
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {exportReadinessStatuses.map((status) => (
                <option key={status} value={status}>
                  Readiness: {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          )}
          {activeWorkspace === "esg" && (
            <select
              value={esgFilter}
              onChange={(event) => setEsgFilter(event.target.value)}
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {esgObligationStatuses.map((status) => (
                <option key={status} value={status}>
                  Status: {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          )}
          {activeWorkspace === "aml" && (
            <>
              <select
                value={amlRiskFilter}
                onChange={(event) => setAmlRiskFilter(event.target.value)}
                className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              >
                {amlRiskTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    Risk: {tier.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <select
                value={amlReviewFilter}
                onChange={(event) => setAmlReviewFilter(event.target.value)}
                className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              >
                {amlReviewStatuses.map((status) => (
                  <option key={status} value={status}>
                    Review: {status.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </>
          )}
          <button
            onClick={loadCompliance}
            className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <FormModal
        isOpen={isLicenseFormOpen}
        title="Submit License"
        description="Add a license record with issuing authority, validity dates, and supporting document references."
        onClose={() => setIsLicenseFormOpen(false)}
      >
        <form onSubmit={submitLicense} className="space-y-3">
          {isReviewer && (
            <RecordPicker
              resource="users"
              value={licenseForm.holderUserId}
              label="License holder"
              placeholder="Search by name, email, phone, or role"
              onChange={(id) => setLicenseForm((prev) => ({ ...prev, holderUserId: id }))}
            />
          )}
          <RecordPicker
            resource="mine-sites"
            value={licenseForm.siteId}
            label="Mine site"
            placeholder="Search by site, operator, community, or state"
            onChange={(id) => setLicenseForm((prev) => ({ ...prev, siteId: id }))}
            onSelect={(option) => setLicenseForm((prev) => ({
              ...prev,
              siteId: option.id,
              holderUserId: String(option.metadata?.operatorUserId || prev.holderUserId),
            }))}
          />
          <input
            required
            value={licenseForm.licenseNumber}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                licenseNumber: event.target.value,
              })
            }
            placeholder="License number"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <select
            required
            value={licenseForm.licenseType}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                licenseType: event.target.value as LicenseType,
              })
            }
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {licenseTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <input
            required
            value={licenseForm.issuingAuthority}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                issuingAuthority: event.target.value,
              })
            }
            placeholder="Issuing authority"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <input
            value={licenseForm.issuingOffice}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                issuingOffice: event.target.value,
              })
            }
            placeholder="Issuing office / zonal office"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="date"
              value={licenseForm.issueDate}
              onChange={(event) =>
                setLicenseForm({
                  ...licenseForm,
                  issueDate: event.target.value,
                })
              }
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              required
              type="date"
              value={licenseForm.expiryDate}
              onChange={(event) =>
                setLicenseForm({
                  ...licenseForm,
                  expiryDate: event.target.value,
                })
              }
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              inputMode="decimal"
              value={licenseForm.annualServiceFee}
              onChange={(event) =>
                setLicenseForm({
                  ...licenseForm,
                  annualServiceFee: event.target.value,
                })
              }
              placeholder="Annual service fee"
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <input
              type="date"
              value={licenseForm.serviceFeePaidUntil}
              onChange={(event) =>
                setLicenseForm({
                  ...licenseForm,
                  serviceFeePaidUntil: event.target.value,
                })
              }
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <input
            type="datetime-local"
            value={licenseForm.applicationPriorityDate}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                applicationPriorityDate: event.target.value,
              })
            }
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            value={licenseForm.permitShipmentReference}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                permitShipmentReference: event.target.value,
              })
            }
            placeholder="Shipment reference for export permit"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={licenseForm.documentIds}
            onChange={(event) =>
              setLicenseForm({
                ...licenseForm,
                documentIds: event.target.value,
              })
            }
            placeholder="Supporting document IDs"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLicenseFormOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Submit License"}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        isOpen={isExportFormOpen}
        title="Export Readiness Checklist"
        description="Link the core evidence required to review mineral export readiness."
        onClose={() => setIsExportFormOpen(false)}
      >
        <form onSubmit={submitExportReadiness} className="space-y-3">
          {isReviewer && (
            <RecordPicker
              resource="users"
              value={exportForm.exporterUserId}
              label="Exporter"
              placeholder="Search by name, email, phone, or role"
              onChange={(id) => setExportForm((prev) => ({ ...prev, exporterUserId: id }))}
            />
          )}
          <RecordPicker
            resource="orders"
            value={exportForm.orderId}
            label="Order"
            placeholder="Search by buyer, seller, mineral, or order"
            onChange={(id) => setExportForm((prev) => ({ ...prev, orderId: id }))}
          />
          <RecordPicker
            resource="mineral-passports"
            value={exportForm.mineralPassportId}
            label="Mineral passport"
            placeholder="Search by passport number, miner, listing, or shipment"
            context={{ orderId: exportForm.orderId || undefined }}
            onChange={(id) => setExportForm((prev) => ({ ...prev, mineralPassportId: id }))}
            onSelect={(option) => setExportForm((prev) => ({
              ...prev,
              mineralPassportId: option.id,
              orderId: String(option.metadata?.orderId || prev.orderId),
              licenseId: String(option.metadata?.licenseId || prev.licenseId),
            }))}
          />
          <RecordPicker
            resource="licenses"
            value={exportForm.licenseId}
            label="License"
            placeholder="Search by license number, holder, or site"
            onChange={(id) => setExportForm((prev) => ({ ...prev, licenseId: id }))}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input
              value={exportForm.exportPermitDocumentId}
              onChange={(event) =>
                setExportForm({
                  ...exportForm,
                  exportPermitDocumentId: event.target.value,
                })
              }
              placeholder="Export permit document ID"
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <input
              value={exportForm.assayDocumentId}
              onChange={(event) =>
                setExportForm({
                  ...exportForm,
                  assayDocumentId: event.target.value,
                })
              }
              placeholder="Assay document ID"
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <input
              value={exportForm.invoiceDocumentId}
              onChange={(event) =>
                setExportForm({
                  ...exportForm,
                  invoiceDocumentId: event.target.value,
                })
              }
              placeholder="Invoice document ID"
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={exportForm.customsStatus}
            onChange={(event) =>
              setExportForm({
                ...exportForm,
                customsStatus: event.target.value as ExportCustomsStatus,
              })
            }
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {customsStatuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <input
            value={exportForm.carrierReference}
            onChange={(event) =>
              setExportForm({
                ...exportForm,
                carrierReference: event.target.value,
              })
            }
            placeholder="Carrier / container / BL reference"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={exportForm.blockingIssues}
            onChange={(event) =>
              setExportForm({
                ...exportForm,
                blockingIssues: event.target.value,
              })
            }
            placeholder="Blocking issues, comma-separated"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsExportFormOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Create Checklist"}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        isOpen={isEsgFormOpen}
        title="ESG Obligation"
        description="Track CDA, EIA, rehabilitation, reclamation, compensation, and community commitments."
        onClose={() => setIsEsgFormOpen(false)}
      >
        <form onSubmit={submitEsgObligation} className="space-y-3">
          {isReviewer && (
            <RecordPicker
              resource="users"
              value={esgForm.responsibleUserId}
              label="Responsible user"
              placeholder="Search by name, email, phone, or role"
              onChange={(id) => setEsgForm((prev) => ({ ...prev, responsibleUserId: id }))}
            />
          )}
          <RecordPicker
            resource="mine-sites"
            value={esgForm.siteId}
            label="Mine site"
            placeholder="Search by site, operator, community, or state"
            onChange={(id) => setEsgForm((prev) => ({ ...prev, siteId: id }))}
            onSelect={(option) => setEsgForm((prev) => ({
              ...prev,
              siteId: option.id,
              licenseId: String(option.metadata?.licenseId || prev.licenseId),
            }))}
          />
          <RecordPicker
            resource="licenses"
            value={esgForm.licenseId}
            label="License"
            placeholder="Search by license number, holder, or site"
            context={{ siteId: esgForm.siteId || undefined }}
            onChange={(id) => setEsgForm((prev) => ({ ...prev, licenseId: id }))}
          />
          <select
            value={esgForm.obligationType}
            onChange={(event) =>
              setEsgForm({
                ...esgForm,
                obligationType: event.target.value as EsgObligationType,
              })
            }
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {esgObligationTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <input
            required
            value={esgForm.title}
            onChange={(event) =>
              setEsgForm({ ...esgForm, title: event.target.value })
            }
            placeholder="Obligation title"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={esgForm.description}
            onChange={(event) =>
              setEsgForm({ ...esgForm, description: event.target.value })
            }
            placeholder="Description"
            rows={3}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={esgForm.status}
              onChange={(event) =>
                setEsgForm({
                  ...esgForm,
                  status: event.target.value as EsgObligationStatus,
                })
              }
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {esgObligationStatuses
                .filter((status) => status !== "all")
                .map((status) => (
                  <option key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </option>
                ))}
            </select>
            <input
              type="date"
              value={esgForm.dueDate}
              onChange={(event) =>
                setEsgForm({ ...esgForm, dueDate: event.target.value })
              }
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <textarea
            value={esgForm.documentIds}
            onChange={(event) =>
              setEsgForm({ ...esgForm, documentIds: event.target.value })
            }
            placeholder="Document IDs, comma-separated"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={esgForm.evidenceUrls}
            onChange={(event) =>
              setEsgForm({ ...esgForm, evidenceUrls: event.target.value })
            }
            placeholder="Evidence URLs, comma-separated"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEsgFormOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Obligation"}
            </button>
          </div>
        </form>
      </FormModal>

      <FormModal
        isOpen={isAmlFormOpen}
        title="AML/KYB Profile"
        description="Capture beneficial ownership, SCUML evidence, sources, and risk notes for high-value actors."
        onClose={() => setIsAmlFormOpen(false)}
      >
        <form onSubmit={submitAmlProfile} className="space-y-3">
          {isReviewer && (
            <RecordPicker
              resource="users"
              value={amlForm.userId}
              label="Subject user"
              placeholder="Search by name, email, phone, or role"
              onChange={(id) => setAmlForm((prev) => ({ ...prev, userId: id }))}
            />
          )}
          <select
            value={amlForm.actorType}
            onChange={(event) =>
              setAmlForm({
                ...amlForm,
                actorType: event.target.value as AmlKybActorType,
              })
            }
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
          >
            {amlActorTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={amlForm.businessName}
              onChange={(event) =>
                setAmlForm({ ...amlForm, businessName: event.target.value })
              }
              placeholder="Business name"
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <input
              value={amlForm.businessRegistrationNumber}
              onChange={(event) =>
                setAmlForm({
                  ...amlForm,
                  businessRegistrationNumber: event.target.value,
                })
              }
              placeholder="Business registration number"
              className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
          </div>
          <textarea
            value={amlForm.beneficialOwnerSummary}
            onChange={(event) =>
              setAmlForm({
                ...amlForm,
                beneficialOwnerSummary: event.target.value,
              })
            }
            placeholder="Beneficial ownership summary"
            rows={3}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={amlForm.beneficialOwnerDocumentIds}
            onChange={(event) =>
              setAmlForm({
                ...amlForm,
                beneficialOwnerDocumentIds: event.target.value,
              })
            }
            placeholder="Beneficial owner document IDs, comma-separated"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <input
            value={amlForm.scumlRegistrationNumber}
            onChange={(event) =>
              setAmlForm({
                ...amlForm,
                scumlRegistrationNumber: event.target.value,
              })
            }
            placeholder="SCUML / AML registration number"
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={amlForm.scumlDocumentIds}
            onChange={(event) =>
              setAmlForm({ ...amlForm, scumlDocumentIds: event.target.value })
            }
            placeholder="SCUML evidence document IDs, comma-separated"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={amlForm.sourceOfFundsNotes}
            onChange={(event) =>
              setAmlForm({
                ...amlForm,
                sourceOfFundsNotes: event.target.value,
              })
            }
            placeholder="Source-of-funds notes"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <textarea
            value={amlForm.sourceOfMineralsNotes}
            onChange={(event) =>
              setAmlForm({
                ...amlForm,
                sourceOfMineralsNotes: event.target.value,
              })
            }
            placeholder="Source-of-minerals notes"
            rows={2}
            className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAmlFormOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
            <button
              disabled={saving}
              className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </FormModal>

      {isReviewer && (
        <FormModal
          isOpen={isCaseFormOpen}
          title="Open Compliance Case"
          description="Create a compliance case with inspection findings, corrective actions, and review dates."
          onClose={() => setIsCaseFormOpen(false)}
        >
          <form onSubmit={submitCase} className="space-y-3">
            <RecordPicker
              resource="mine-sites"
              required
              value={caseForm.siteId}
              label="Mine site"
              placeholder="Search by site, operator, community, or state"
              onChange={(id) => setCaseForm((prev) => ({ ...prev, siteId: id }))}
            />
            <RecordPicker
              resource="users"
              value={caseForm.subjectUserId}
              label="Subject user"
              placeholder="Search by name, email, phone, or role"
              onChange={(id) => setCaseForm((prev) => ({ ...prev, subjectUserId: id }))}
            />
            <input
              required
              value={caseForm.caseType}
              onChange={(event) =>
                setCaseForm({ ...caseForm, caseType: event.target.value })
              }
              placeholder="Case type"
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <select
              value={caseForm.severity}
              onChange={(event) =>
                setCaseForm({
                  ...caseForm,
                  severity: event.target.value as ComplianceCaseSeverity,
                })
              }
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {severities
                .filter((severity) => severity !== "all")
                .map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
            </select>
            <textarea
              required
              value={caseForm.findings}
              onChange={(event) =>
                setCaseForm({ ...caseForm, findings: event.target.value })
              }
              placeholder="Inspection findings"
              rows={3}
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <textarea
              value={caseForm.requiredActions}
              onChange={(event) =>
                setCaseForm({
                  ...caseForm,
                  requiredActions: event.target.value,
                })
              }
              placeholder="Required actions, comma-separated"
              rows={2}
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={caseForm.dueDate}
                onChange={(event) =>
                  setCaseForm({ ...caseForm, dueDate: event.target.value })
                }
                className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
              <input
                type="datetime-local"
                value={caseForm.inspectionScheduledAt}
                onChange={(event) =>
                  setCaseForm({
                    ...caseForm,
                    inspectionScheduledAt: event.target.value,
                  })
                }
                className="rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <input
              value={caseForm.inspectorName}
              onChange={(event) =>
                setCaseForm({ ...caseForm, inspectorName: event.target.value })
              }
              placeholder="Inspector name"
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <textarea
              value={caseForm.inspectionNotes}
              onChange={(event) =>
                setCaseForm({
                  ...caseForm,
                  inspectionNotes: event.target.value,
                })
              }
              placeholder="Inspection notes"
              rows={2}
              className="w-full rounded-md border border-border bg-primary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCaseFormOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-text-secondary hover:border-accent hover:text-accent"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-content hover:bg-yellow-400 disabled:opacity-70"
              >
                {saving ? "Saving..." : "Create Case"}
              </button>
            </div>
          </form>
        </FormModal>
      )}

      <div className="space-y-6">
        {activeWorkspace === "licenses" && (
          <section>
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <SectionHeader
              title="License Review Queue"
              description="Mineral titles, issuing authorities, expiry risk, and renewal status."
              count={licenses.length}
            />
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">
                    License
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Holder
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Site
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Expiry
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Status
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Renewal
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Loading licenses...
                    </td>
                  </tr>
                ) : licenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      No licenses match the current filters.
                    </td>
                  </tr>
                ) : (
                  licenses.map((license) => (
                    <tr
                      key={license.id}
                      onClick={() => setSelectedLicense(license)}
                      className={`cursor-pointer border-b border-border align-top hover:bg-primary/40 ${
                        selectedLicense?.id === license.id ? "bg-primary/70 ring-1 ring-inset ring-accent/40" : ""
                      }`}
                    >
                      <td className="p-4">
                        <p className="font-semibold text-text-primary">
                          {license.licenseNumber}
                        </p>
                        <p className="text-xs text-text-muted">
                          {license.licenseType} · {license.issuingAuthority}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {license.holder?.name || license.holder?.email || "-"}
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {license.site?.name || "-"}
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        <p>{formatDate(license.expiryDate)}</p>
                        <p
                          className={
                            license.expiry.isExpired || license.expiry.isDueSoon
                              ? "text-xs font-semibold text-red-300"
                              : "text-xs text-text-muted"
                          }
                        >
                          {license.expiry.daysUntilExpiry} days
                        </p>
                      </td>
                      <td className="p-4">{statusChip(license.status)}</td>
                      <td className="p-4">
                        {statusChip(license.renewalStatus)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}

        {activeWorkspace === "cases" && (
          <section>
          <div className="rounded-lg border border-border bg-secondary p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-text-primary">
                Compliance Case Board
              </h2>
              <p className="text-xs text-text-muted">{cases.length} cases</p>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
              {caseStatuses.map((status) => (
                <div
                  key={status}
                  className="min-h-40 rounded-lg border border-border bg-primary p-3"
                >
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-text-muted">
                    {status.replace(/_/g, " ")}
                  </h3>
                  <div className="space-y-3">
                    {cases
                      .filter((item) => item.status === status)
                      .map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedCase(item)}
                          className={`w-full rounded-md border bg-secondary p-3 text-left text-sm hover:border-accent ${
                            selectedCase?.id === item.id ? "border-accent" : "border-border"
                          }`}
                        >
                          <p className="font-semibold text-text-primary">
                            {item.caseType}
                          </p>
                          <p className="mt-1 text-xs text-text-muted">
                            {item.site?.name || "Unlinked site"} · Due{" "}
                            {formatDate(item.dueDate)}
                          </p>
                          <div className="mt-2">
                            {statusChip(item.severity)}
                          </div>
                        </button>
                      ))}
                    {cases.filter((item) => item.status === status).length ===
                      0 && <p className="text-xs text-text-muted">No cases</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </section>
        )}

        {activeWorkspace === "export" && (
          <section>
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <SectionHeader
              title="Export Readiness"
              description="Shipment evidence, customs status, passport links, and release blockers."
              count={exportChecklists.length}
            />
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">
                    Exporter
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Order / Passport
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    License
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Customs
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Readiness
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Loading export readiness...
                    </td>
                  </tr>
                ) : exportChecklists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      No export readiness records match the current filters.
                    </td>
                  </tr>
                ) : (
                  exportChecklists.map((checklist) => (
                    <tr
                      key={checklist.id}
                      onClick={() => setSelectedExportChecklist(checklist)}
                      className={`cursor-pointer border-b border-border align-top hover:bg-primary/40 ${
                        selectedExportChecklist?.id === checklist.id ? "bg-primary/70 ring-1 ring-inset ring-accent/40" : ""
                      }`}
                    >
                      <td className="p-4 text-sm text-text-secondary">
                        {checklist.exporter?.name ||
                          checklist.exporter?.email ||
                          checklist.exporterUserId}
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        <p>{checklist.orderId || "-"}</p>
                        <p className="text-xs text-text-muted">
                          {checklist.mineralPassport?.passportNumber ||
                            checklist.mineralPassportId ||
                            "No passport"}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {checklist.license?.licenseNumber ||
                          checklist.licenseId ||
                          "-"}
                      </td>
                      <td className="p-4">
                        {statusChip(checklist.customsStatus)}
                      </td>
                      <td className="p-4">
                        {statusChip(checklist.readinessStatus)}
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {checklist.blockingIssues.length}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}

        {activeWorkspace === "esg" && (
          <section>
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <SectionHeader
              title="ESG & Community Obligations"
              description="CDA, EIA, rehabilitation, reclamation, compensation, and community benefit commitments."
              count={esgObligations.length}
            />
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">
                    Obligation
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Site / License
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Responsible
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Due
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Status
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Evidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Loading ESG obligations...
                    </td>
                  </tr>
                ) : esgObligations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      No ESG obligations match the current filters.
                    </td>
                  </tr>
                ) : (
                  esgObligations.map((obligation) => (
                    <tr
                      key={obligation.id}
                      onClick={() => setSelectedEsgObligation(obligation)}
                      className={`cursor-pointer border-b border-border align-top hover:bg-primary/40 ${
                        selectedEsgObligation?.id === obligation.id ? "bg-primary/70 ring-1 ring-inset ring-accent/40" : ""
                      }`}
                    >
                      <td className="p-4">
                        <p className="font-semibold text-text-primary">
                          {obligation.title}
                        </p>
                        <p className="text-xs text-text-muted">
                          {obligation.obligationType.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        <p>
                          {obligation.site?.name || obligation.siteId || "-"}
                        </p>
                        <p className="text-xs text-text-muted">
                          {obligation.license?.licenseNumber ||
                            obligation.licenseId ||
                            "No license"}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {obligation.responsibleUser?.name ||
                          obligation.responsibleUser?.email ||
                          obligation.responsibleUserId}
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        <p>{formatDate(obligation.dueDate)}</p>
                        {obligation.due.isOverdue && (
                          <p className="text-xs font-semibold text-red-300">
                            overdue
                          </p>
                        )}
                      </td>
                      <td className="p-4">{statusChip(obligation.status)}</td>
                      <td className="p-4 text-sm text-text-secondary">
                        {obligation.documentIds.length +
                          obligation.evidenceUrls.length}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}

        {activeWorkspace === "aml" && (
          <section>
          <div className="overflow-x-auto rounded-lg border border-border bg-secondary">
            <SectionHeader
              title="AML/KYB Risk Profiles"
              description="Beneficial ownership, SCUML evidence, source checks, and suspicious activity review."
              count={amlProfiles.length}
            />
            <table className="w-full min-w-[920px] border-collapse text-left">
              <thead>
                <tr className="bg-primary/60 text-sm text-text-secondary">
                  <th className="border-b border-border p-4 font-semibold">
                    Actor
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Business
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Risk
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Review
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Signals
                  </th>
                  <th className="border-b border-border p-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      Loading AML/KYB profiles...
                    </td>
                  </tr>
                ) : amlProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-muted">
                      No AML/KYB profiles match the current filters.
                    </td>
                  </tr>
                ) : (
                  amlProfiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-b border-border align-top hover:bg-primary/40"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-text-primary">
                          {profile.user?.name ||
                            profile.user?.email ||
                            profile.userId}
                        </p>
                        <p className="text-xs capitalize text-text-muted">
                          {profile.actorType.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        <p>{profile.businessName || "-"}</p>
                        <p className="text-xs text-text-muted">
                          {profile.businessRegistrationNumber ||
                            profile.scumlRegistrationNumber ||
                            "No registration reference"}
                        </p>
                      </td>
                      <td className="p-4">{statusChip(profile.riskTier)}</td>
                      <td className="p-4">
                        {statusChip(profile.reviewStatus)}
                        <p className="mt-1 text-xs text-text-muted">
                          {profile.suspiciousActivityStatus.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">
                        {profile.riskIndicators.length}
                      </td>
                      <td className="p-4">
                        {isReviewer ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                applyAmlReview(profile, "under_review")
                              }
                              className="rounded-md border border-border px-2.5 py-1.5 text-xs font-semibold hover:border-accent hover:text-accent"
                            >
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => applyAmlReview(profile, "cleared")}
                              className="rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                applyAmlReview(profile, "action_required")
                              }
                              className="rounded-md bg-orange-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                            >
                              Action
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </section>
        )}
      </div>

      {(selectedLicense ||
        selectedCase ||
        selectedExportChecklist ||
        selectedEsgObligation) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
          <button
            className="absolute inset-0 cursor-default"
            aria-label="Close detail"
            onClick={() => {
              setSelectedLicense(null);
              setSelectedCase(null);
              setSelectedExportChecklist(null);
              setSelectedEsgObligation(null);
            }}
          />
          <aside className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-border bg-secondary p-6 shadow-2xl">
            {selectedLicense && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      License detail
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedLicense.licenseNumber}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedLicense(null)}
                    className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                  >
                    Close
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {statusChip(selectedLicense.status)}{" "}
                  {statusChip(selectedLicense.renewalStatus)}
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>
                    Holder:{" "}
                    {selectedLicense.holder?.name ||
                      selectedLicense.holder?.email ||
                      "-"}
                  </p>
                  <p>Site: {selectedLicense.site?.name || "-"}</p>
                  <p>Type: {selectedLicense.licenseType}</p>
                  <p>Authority: {selectedLicense.issuingAuthority}</p>
                  <p>Issue date: {formatDate(selectedLicense.issueDate)}</p>
                  <p>Expiry date: {formatDate(selectedLicense.expiryDate)}</p>
                  <p>Documents: {selectedLicense.documentIds.length}</p>
                  <p>Review notes: {selectedLicense.reviewNotes || "-"}</p>
                </div>
                {isReviewer && (
                  <div className="rounded-lg border border-border bg-primary p-4">
                    <h3 className="font-bold text-text-primary">Review</h3>
                    <textarea
                      value={reviewNotes}
                      onChange={(event) => setReviewNotes(event.target.value)}
                      placeholder="Review notes"
                      rows={3}
                      className="mt-3 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => applyReview("under_review")}
                        disabled={saving}
                        className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => applyReview("approved")}
                        disabled={saving}
                        className="rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => applyReview("rejected")}
                        disabled={saving}
                        className="rounded-md bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedCase && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      Compliance case
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedCase.caseType}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                  >
                    Close
                  </button>
                </div>
                <div className="flex gap-2">
                  {statusChip(selectedCase.status)}{" "}
                  {statusChip(selectedCase.severity)}
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>Site: {selectedCase.site?.name || "-"}</p>
                  <p>
                    Subject:{" "}
                    {selectedCase.subjectUser?.name ||
                      selectedCase.subjectUser?.email ||
                      "-"}
                  </p>
                  <p>Findings: {selectedCase.findings}</p>
                  <p>Due: {formatDate(selectedCase.dueDate)}</p>
                  <p>
                    Inspection: {formatDate(selectedCase.inspectionScheduledAt)}
                  </p>
                  <p>Inspector: {selectedCase.inspectorName || "-"}</p>
                  <p>Notes: {selectedCase.inspectionNotes || "-"}</p>
                </div>
                <div className="rounded-lg border border-border bg-primary p-4">
                  <h3 className="font-bold text-text-primary">
                    Required Actions
                  </h3>
                  <div className="mt-3 space-y-2">
                    {(selectedCase.requiredActions || []).length === 0 ? (
                      <p className="text-sm text-text-muted">
                        No actions recorded.
                      </p>
                    ) : (
                      selectedCase.requiredActions?.map((action, index) => (
                        <div
                          key={`${action.title}-${index}`}
                          className="rounded-md border border-border bg-secondary p-3 text-sm text-text-secondary"
                        >
                          {String(
                            action.title || action.description || "Action",
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {isReviewer && (
                  <div className="flex flex-wrap gap-2">
                    {caseStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateCaseStatus(status)}
                        disabled={saving}
                        className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent"
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedExportChecklist && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      Export readiness
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedExportChecklist.orderId ||
                        selectedExportChecklist.id}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedExportChecklist(null)}
                    className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusChip(selectedExportChecklist.readinessStatus)}{" "}
                  {statusChip(selectedExportChecklist.customsStatus)}
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>
                    Exporter:{" "}
                    {selectedExportChecklist.exporter?.name ||
                      selectedExportChecklist.exporter?.email ||
                      selectedExportChecklist.exporterUserId}
                  </p>
                  <p>Order: {selectedExportChecklist.orderId || "-"}</p>
                  <p>
                    Passport:{" "}
                    {selectedExportChecklist.mineralPassport?.passportNumber ||
                      selectedExportChecklist.mineralPassportId ||
                      "-"}
                  </p>
                  <p>
                    License:{" "}
                    {selectedExportChecklist.license?.licenseNumber ||
                      selectedExportChecklist.licenseId ||
                      "-"}
                  </p>
                  <p>
                    Export permit document:{" "}
                    {selectedExportChecklist.exportPermitDocumentId || "-"}
                  </p>
                  <p>
                    Assay document:{" "}
                    {selectedExportChecklist.assayDocumentId || "-"}
                  </p>
                  <p>
                    Invoice document:{" "}
                    {selectedExportChecklist.invoiceDocumentId || "-"}
                  </p>
                  <p>
                    Carrier reference:{" "}
                    {selectedExportChecklist.carrierReference || "-"}
                  </p>
                  <p>
                    Review notes: {selectedExportChecklist.reviewNotes || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-primary p-4">
                  <h3 className="font-bold text-text-primary">Completeness</h3>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-text-secondary">
                    {Object.entries(selectedExportChecklist.completeness).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="rounded-md border border-border bg-secondary p-2"
                        >
                          <span
                            className={
                              value ? "text-green-300" : "text-red-300"
                            }
                          >
                            {value ? "Ready" : "Missing"}
                          </span>{" "}
                          {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </div>
                      ),
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-primary p-4">
                  <h3 className="font-bold text-text-primary">
                    Blocking Issues
                  </h3>
                  <div className="mt-3 space-y-2">
                    {selectedExportChecklist.blockingIssues.length === 0 ? (
                      <p className="text-sm text-text-muted">
                        No blocking issues recorded.
                      </p>
                    ) : (
                      selectedExportChecklist.blockingIssues.map((issue) => (
                        <div
                          key={issue}
                          className="rounded-md border border-border bg-secondary p-3 text-sm text-text-secondary"
                        >
                          {issue}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {isReviewer && (
                  <div className="rounded-lg border border-border bg-primary p-4">
                    <h3 className="font-bold text-text-primary">Review</h3>
                    <textarea
                      value={exportReviewNotes}
                      onChange={(event) =>
                        setExportReviewNotes(event.target.value)
                      }
                      placeholder="Review notes"
                      rows={3}
                      className="mt-3 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => applyExportReview("under_review")}
                        disabled={saving}
                        className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent"
                      >
                        Under Review
                      </button>
                      <button
                        onClick={() => applyExportReview("blocked")}
                        disabled={saving}
                        className="rounded-md bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                      >
                        Block
                      </button>
                      <button
                        onClick={() => applyExportReview("ready")}
                        disabled={saving}
                        className="rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500"
                      >
                        Mark Ready
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedEsgObligation && (
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      ESG obligation
                    </p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedEsgObligation.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedEsgObligation(null)}
                    className="rounded-md border border-border px-3 py-2 text-sm font-bold hover:border-accent hover:text-accent"
                  >
                    Close
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {statusChip(selectedEsgObligation.status)}{" "}
                  {selectedEsgObligation.due.isOverdue && statusChip("overdue")}
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <p>
                    Type:{" "}
                    {selectedEsgObligation.obligationType.replace(/_/g, " ")}
                  </p>
                  <p>
                    Responsible:{" "}
                    {selectedEsgObligation.responsibleUser?.name ||
                      selectedEsgObligation.responsibleUser?.email ||
                      selectedEsgObligation.responsibleUserId}
                  </p>
                  <p>
                    Site:{" "}
                    {selectedEsgObligation.site?.name ||
                      selectedEsgObligation.siteId ||
                      "-"}
                  </p>
                  <p>
                    License:{" "}
                    {selectedEsgObligation.license?.licenseNumber ||
                      selectedEsgObligation.licenseId ||
                      "-"}
                  </p>
                  <p>Due: {formatDate(selectedEsgObligation.dueDate)}</p>
                  <p>Description: {selectedEsgObligation.description || "-"}</p>
                  <p>
                    Review notes: {selectedEsgObligation.reviewNotes || "-"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-primary p-4">
                  <h3 className="font-bold text-text-primary">Evidence</h3>
                  <div className="mt-3 space-y-2 text-sm text-text-secondary">
                    <p>
                      Document IDs:{" "}
                      {selectedEsgObligation.documentIds.length
                        ? selectedEsgObligation.documentIds.join(", ")
                        : "-"}
                    </p>
                    <div className="space-y-1">
                      {selectedEsgObligation.evidenceUrls.length === 0 ? (
                        <p className="text-text-muted">No evidence URLs.</p>
                      ) : (
                        selectedEsgObligation.evidenceUrls.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-accent hover:underline"
                          >
                            {url}
                          </a>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {isReviewer && (
                  <div className="rounded-lg border border-border bg-primary p-4">
                    <h3 className="font-bold text-text-primary">Review</h3>
                    <textarea
                      value={esgReviewNotes}
                      onChange={(event) =>
                        setEsgReviewNotes(event.target.value)
                      }
                      placeholder="Review notes"
                      rows={3}
                      className="mt-3 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => applyEsgReview("action_required")}
                        disabled={saving}
                        className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent"
                      >
                        Action Required
                      </button>
                      <button
                        onClick={() => applyEsgReview("approved")}
                        disabled={saving}
                        className="rounded-md bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-500"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => applyEsgReview("fulfilled")}
                        disabled={saving}
                        className="rounded-md bg-accent px-3 py-2 text-xs font-bold text-accent-content hover:bg-yellow-400"
                      >
                        Fulfilled
                      </button>
                      <button
                        onClick={() => applyEsgReview("waived")}
                        disabled={saving}
                        className="rounded-md border border-border px-3 py-2 text-xs font-bold hover:border-accent hover:text-accent"
                      >
                        Waive
                      </button>
                    </div>
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
