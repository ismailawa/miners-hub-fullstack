import apiClient from "./client";

export type LicenseStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";
export type LicenseRenewalStatus =
  | "not_due"
  | "due_soon"
  | "in_progress"
  | "renewed";
export type LicenseType =
  | "reconnaissance_permit"
  | "exploration_licence"
  | "small_scale_mining_lease"
  | "mining_lease"
  | "quarry_lease"
  | "water_use_permit"
  | "possess_and_purchase_licence"
  | "mineral_buying_center_licence"
  | "mineral_export_permit";
export type ComplianceCaseSeverity = "low" | "medium" | "high" | "critical";
export type ComplianceCaseStatus =
  | "open"
  | "inspection_scheduled"
  | "action_required"
  | "resolved"
  | "closed";
export type ExportReadinessStatus =
  | "draft"
  | "under_review"
  | "blocked"
  | "ready"
  | "expired";
export type ExportCustomsStatus =
  | "not_required"
  | "not_started"
  | "preparing"
  | "submitted"
  | "cleared"
  | "held"
  | "rejected";
export type EsgObligationType =
  | "community_development_agreement"
  | "environmental_impact_assessment"
  | "rehabilitation_program"
  | "reclamation_reserve"
  | "compensation_remediation"
  | "community_benefit"
  | "other";
export type EsgObligationStatus =
  | "missing"
  | "draft"
  | "submitted"
  | "approved"
  | "action_required"
  | "overdue"
  | "fulfilled"
  | "waived";
export type AmlKybActorType =
  | "buyer"
  | "exporter"
  | "buying_center"
  | "investor"
  | "miner"
  | "logistics_provider"
  | "laboratory"
  | "high_value_actor"
  | "other";
export type AmlKybRiskTier = "low" | "medium" | "high" | "critical";
export type ScumlRegistrationStatus =
  | "not_required"
  | "not_provided"
  | "pending"
  | "registered"
  | "expired"
  | "rejected";
export type SuspiciousActivityStatus =
  | "none"
  | "monitoring"
  | "escalated"
  | "reported"
  | "closed";
export type AmlKybReviewStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "cleared"
  | "action_required"
  | "suspicious"
  | "escalated"
  | "closed";

export interface License {
  id: string;
  holderUserId: string;
  siteId?: string | null;
  licenseNumber: string;
  licenseType: LicenseType;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  annualServiceFee?: number | null;
  serviceFeePaidUntil?: string | null;
  applicationPriorityDate?: string | null;
  permitShipmentReference?: string | null;
  issuingOffice?: string | null;
  metadata?: Record<string, any> | null;
  status: LicenseStatus;
  renewalStatus: LicenseRenewalStatus;
  documentIds: string[];
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  holder?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  } | null;
  site?: {
    id: string;
    name: string;
    state: string;
    lga?: string | null;
    operatorName?: string | null;
  } | null;
  expiry: { daysUntilExpiry: number; isExpired: boolean; isDueSoon: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface ExportReadinessChecklist {
  id: string;
  orderId?: string | null;
  mineralPassportId?: string | null;
  exporterUserId: string;
  licenseId?: string | null;
  exportPermitDocumentId?: string | null;
  assayDocumentId?: string | null;
  invoiceDocumentId?: string | null;
  customsStatus: ExportCustomsStatus;
  carrierReference?: string | null;
  readinessStatus: ExportReadinessStatus;
  blockingIssues: string[];
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  metadata?: Record<string, any> | null;
  exporter?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  } | null;
  license?: {
    id: string;
    licenseNumber: string;
    licenseType: LicenseType;
    status: LicenseStatus;
    expiryDate: string;
  } | null;
  order?: { id: string; status: string; totalAmount: number } | null;
  mineralPassport?: {
    id: string;
    passportNumber: string;
    status: string;
  } | null;
  completeness: {
    hasOrder: boolean;
    hasPassport: boolean;
    hasLicense: boolean;
    hasExportPermit: boolean;
    hasAssay: boolean;
    hasInvoice: boolean;
    hasCarrierReference: boolean;
    hasNoBlockingIssues: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EsgObligation {
  id: string;
  siteId?: string | null;
  licenseId?: string | null;
  responsibleUserId: string;
  obligationType: EsgObligationType;
  title: string;
  description?: string | null;
  status: EsgObligationStatus;
  documentIds: string[];
  evidenceUrls: string[];
  dueDate?: string | null;
  lastReviewedBy?: string | null;
  lastReviewedAt?: string | null;
  reviewNotes?: string | null;
  metadata?: Record<string, any> | null;
  responsibleUser?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  } | null;
  site?: {
    id: string;
    name: string;
    state: string;
    lga?: string | null;
    operatorName?: string | null;
  } | null;
  license?: {
    id: string;
    licenseNumber: string;
    licenseType: LicenseType;
    status: LicenseStatus;
  } | null;
  due: { daysUntilDue: number | null; isOverdue: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface AmlKybRiskProfile {
  id: string;
  userId: string;
  actorType: AmlKybActorType;
  businessName?: string | null;
  businessRegistrationNumber?: string | null;
  beneficialOwnerSummary?: string | null;
  beneficialOwnerDocumentIds: string[];
  scumlRegistrationNumber?: string | null;
  scumlRegistrationStatus: ScumlRegistrationStatus;
  scumlDocumentIds: string[];
  sourceOfFundsNotes?: string | null;
  sourceOfMineralsNotes?: string | null;
  riskTier: AmlKybRiskTier;
  riskReasons: string[];
  riskIndicators: string[];
  suspiciousActivityStatus: SuspiciousActivityStatus;
  reviewStatus: AmlKybReviewStatus;
  lastReviewedBy?: string | null;
  lastReviewedAt?: string | null;
  reviewNotes?: string | null;
  metadata?: Record<string, any> | null;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
    verificationStatus?: string;
  } | null;
  reviewer?: {
    id: string;
    name?: string | null;
    email: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCase {
  id: string;
  siteId: string;
  subjectUserId?: string | null;
  caseType: string;
  severity: ComplianceCaseSeverity;
  status: ComplianceCaseStatus;
  assignedTo?: string | null;
  findings: string;
  requiredActions?: Array<Record<string, any>> | null;
  dueDate?: string | null;
  inspectionScheduledAt?: string | null;
  inspectorName?: string | null;
  inspectionNotes?: string | null;
  closedAt?: string | null;
  site?: {
    id: string;
    name: string;
    state: string;
    lga?: string | null;
    operatorName?: string | null;
  } | null;
  subjectUser?: { id: string; name?: string | null; email: string } | null;
  assignee?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface LicensePayload {
  holderUserId?: string;
  siteId?: string | null;
  licenseNumber: string;
  licenseType: LicenseType;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  annualServiceFee?: number | null;
  serviceFeePaidUntil?: string | null;
  applicationPriorityDate?: string | null;
  permitShipmentReference?: string | null;
  issuingOffice?: string | null;
  metadata?: Record<string, any> | null;
  documentIds?: string[];
}

export interface ExportReadinessPayload {
  orderId?: string | null;
  mineralPassportId?: string | null;
  exporterUserId?: string;
  licenseId?: string | null;
  exportPermitDocumentId?: string | null;
  assayDocumentId?: string | null;
  invoiceDocumentId?: string | null;
  customsStatus?: ExportCustomsStatus;
  carrierReference?: string | null;
  blockingIssues?: string[];
  metadata?: Record<string, any> | null;
}

export interface EsgObligationPayload {
  siteId?: string | null;
  licenseId?: string | null;
  responsibleUserId?: string;
  obligationType: EsgObligationType;
  title: string;
  description?: string | null;
  status?: EsgObligationStatus;
  documentIds?: string[];
  evidenceUrls?: string[];
  dueDate?: string | null;
  metadata?: Record<string, any> | null;
}

export interface AmlKybRiskProfilePayload {
  userId?: string;
  actorType: AmlKybActorType;
  businessName?: string | null;
  businessRegistrationNumber?: string | null;
  beneficialOwnerSummary?: string | null;
  beneficialOwnerDocumentIds?: string[];
  scumlRegistrationNumber?: string | null;
  scumlRegistrationStatus?: ScumlRegistrationStatus;
  scumlDocumentIds?: string[];
  sourceOfFundsNotes?: string | null;
  sourceOfMineralsNotes?: string | null;
  riskTier?: AmlKybRiskTier;
  riskReasons?: string[];
  riskIndicators?: string[];
  suspiciousActivityStatus?: SuspiciousActivityStatus;
  reviewStatus?: AmlKybReviewStatus;
  metadata?: Record<string, any> | null;
}

export interface ComplianceCasePayload {
  siteId: string;
  subjectUserId?: string | null;
  caseType: string;
  severity?: ComplianceCaseSeverity;
  assignedTo?: string | null;
  findings: string;
  requiredActions?: Array<Record<string, any>>;
  dueDate?: string | null;
  inspectionScheduledAt?: string | null;
  inspectorName?: string | null;
  inspectionNotes?: string | null;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getLicenses(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "100" });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  return apiClient.get<Paginated<License>>(
    `/api/licenses?${params.toString()}`,
  );
}

export async function createLicense(payload: LicensePayload) {
  return apiClient.post<License>("/api/licenses", payload);
}

export async function updateLicense(
  id: string,
  payload: Partial<LicensePayload>,
) {
  return apiClient.patch<License>(`/api/licenses/${id}`, payload);
}

export async function reviewLicense(
  id: string,
  status: LicenseStatus,
  reviewNotes?: string,
) {
  return apiClient.patch<License>(`/api/licenses/${id}/status`, {
    status,
    reviewNotes,
  });
}

export async function getExportReadiness(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "100" });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  return apiClient.get<Paginated<ExportReadinessChecklist>>(
    `/api/export-readiness?${params.toString()}`,
  );
}

export async function createExportReadiness(payload: ExportReadinessPayload) {
  return apiClient.post<ExportReadinessChecklist>(
    "/api/export-readiness",
    payload,
  );
}

export async function updateExportReadiness(
  id: string,
  payload: Partial<ExportReadinessPayload>,
) {
  return apiClient.patch<ExportReadinessChecklist>(
    `/api/export-readiness/${id}`,
    payload,
  );
}

export async function reviewExportReadiness(
  id: string,
  readinessStatus: ExportReadinessStatus,
  payload: {
    customsStatus?: ExportCustomsStatus;
    blockingIssues?: string[];
    reviewNotes?: string;
  } = {},
) {
  return apiClient.patch<ExportReadinessChecklist>(
    `/api/export-readiness/${id}/status`,
    {
      readinessStatus,
      ...payload,
    },
  );
}

export async function getEsgObligations(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "100" });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  return apiClient.get<Paginated<EsgObligation>>(
    `/api/esg-obligations?${params.toString()}`,
  );
}

export async function createEsgObligation(payload: EsgObligationPayload) {
  return apiClient.post<EsgObligation>("/api/esg-obligations", payload);
}

export async function updateEsgObligation(
  id: string,
  payload: Partial<EsgObligationPayload>,
) {
  return apiClient.patch<EsgObligation>(`/api/esg-obligations/${id}`, payload);
}

export async function reviewEsgObligation(
  id: string,
  status: EsgObligationStatus,
  reviewNotes?: string,
) {
  return apiClient.patch<EsgObligation>(`/api/esg-obligations/${id}/status`, {
    status,
    reviewNotes,
  });
}

export async function getAmlKybRiskProfiles(
  filters: Record<string, string> = {},
) {
  const params = new URLSearchParams({ limit: "100" });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  return apiClient.get<Paginated<AmlKybRiskProfile>>(
    `/api/aml-kyb-profiles?${params.toString()}`,
  );
}

export async function createAmlKybRiskProfile(
  payload: AmlKybRiskProfilePayload,
) {
  return apiClient.post<AmlKybRiskProfile>("/api/aml-kyb-profiles", payload);
}

export async function updateAmlKybRiskProfile(
  id: string,
  payload: Partial<AmlKybRiskProfilePayload>,
) {
  return apiClient.patch<AmlKybRiskProfile>(
    `/api/aml-kyb-profiles/${id}`,
    payload,
  );
}

export async function reviewAmlKybRiskProfile(
  id: string,
  payload: {
    reviewStatus: AmlKybReviewStatus;
    riskTier?: AmlKybRiskTier;
    riskReasons?: string[];
    riskIndicators?: string[];
    suspiciousActivityStatus?: SuspiciousActivityStatus;
    reviewNotes?: string | null;
  },
) {
  return apiClient.patch<AmlKybRiskProfile>(
    `/api/aml-kyb-profiles/${id}/status`,
    payload,
  );
}

export async function getComplianceCases(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: "100" });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });
  return apiClient.get<Paginated<ComplianceCase>>(
    `/api/compliance-cases?${params.toString()}`,
  );
}

export async function createComplianceCase(payload: ComplianceCasePayload) {
  return apiClient.post<ComplianceCase>("/api/compliance-cases", payload);
}

export async function updateComplianceCase(
  id: string,
  payload: Partial<ComplianceCasePayload> & { status?: ComplianceCaseStatus },
) {
  return apiClient.patch<ComplianceCase>(
    `/api/compliance-cases/${id}`,
    payload,
  );
}
