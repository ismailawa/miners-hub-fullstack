/**
 * Documents API Service
 * 
 * Documents API service.
 */

import apiClient from './client';
import type { Document, DocumentType } from '../types';

export interface DocumentUploadMetadata {
  type?: DocumentType | string;
  uploadCategory?: string;
  ownerResource?: string;
  ownerResourceId?: string;
  purpose?: string;
  correlationId?: string;
}

export interface UploadedDocument extends Document {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  reviewStatus?: string;
  metadata?: Record<string, any> | null;
}

interface BackendDocument {
  id: string;
  userId: string;
  listingId?: string | null;
  type: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  metadata?: Record<string, any> | null;
  reviewStatus?: string;
  createdAt: string;
  updatedAt?: string;
}

function toBackendDocumentType(type?: DocumentType | string) {
  switch (type) {
    case 'identification':
      return 'kyc';
    case 'business_license':
    case 'mining_permit':
      return 'mining_licence';
    case 'contract':
      return 'contract';
    case 'kyc':
    case 'mining_licence':
    case 'listing_attachment':
    case 'other':
      return type;
    default:
      return 'other';
  }
}

function normalizeDocument(document: BackendDocument): UploadedDocument {
  return {
    ...document,
    name: document.fileName,
    url: document.fileUrl,
    size: document.fileSize,
    uploadedAt: document.createdAt,
  } as UploadedDocument;
}

/**
 * Upload document
 */
export async function uploadDocument(
  file: File,
  metadata?: DocumentUploadMetadata,
): Promise<UploadedDocument> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', toBackendDocumentType(metadata?.type));
  if (metadata?.uploadCategory) {
    formData.append('uploadCategory', metadata.uploadCategory);
  }
  if (metadata?.ownerResource) {
    formData.append('ownerResource', metadata.ownerResource);
  }
  if (metadata?.ownerResourceId) {
    formData.append('ownerResourceId', metadata.ownerResourceId);
  }
  if (metadata?.purpose) {
    formData.append('purpose', metadata.purpose);
  }
  if (metadata?.correlationId) {
    formData.append('correlationId', metadata.correlationId);
  }

  const document = await apiClient.post<BackendDocument>('/api/documents/upload', formData);
  return normalizeDocument(document);
}

/**
 * Get document by ID
 */
export async function getDocument(id: string): Promise<Document> {
  return apiClient.get<Document>(`/api/documents/${id}`);
}

/**
 * Download document file
 */
export async function downloadDocumentFile(id: string): Promise<Blob> {
  return apiClient.get<Blob>(`/api/documents/${id}/file`, {
    skipErrorHandling: true, // Handle blob response manually
  }) as Promise<Blob>;
}

/**
 * Download document (helper function)
 */
export async function downloadDocument(id: string): Promise<void> {
  const blob = await downloadDocumentFile(id);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `document-${id}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/documents/${id}`);
}
