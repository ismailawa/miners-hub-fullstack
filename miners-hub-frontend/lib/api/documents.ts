/**
 * Documents API Service
 * 
 * Documents API service.
 */

import apiClient from './client';
import type { Document, DocumentType } from '../types';

/**
 * Upload document
 */
export async function uploadDocument(
  file: File,
  metadata?: { type?: DocumentType; uploadCategory?: string },
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', metadata?.type || 'kyc');
  if (metadata?.uploadCategory) {
    formData.append('uploadCategory', metadata.uploadCategory);
  }

  return apiClient.post<Document>('/api/documents/upload', formData);
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
