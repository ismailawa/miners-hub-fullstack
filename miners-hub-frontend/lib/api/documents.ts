/**
 * Documents API Service
 * 
 * Placeholder service for document upload/download endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { Document, DocumentType } from '../types';

/**
 * Upload document
 * TODO: Implement when document endpoints are available
 */
export async function uploadDocument(
  file: File,
  metadata?: { type?: DocumentType; description?: string },
): Promise<Document> {
  const formData = new FormData();
  formData.append('file', file);
  if (metadata?.type) formData.append('type', metadata.type);
  if (metadata?.description)
    formData.append('description', metadata.description);

  return apiClient.post<Document>('/api/documents', formData, {
    headers: {}, // Let browser set Content-Type for FormData
  });
}

/**
 * Get document by ID
 * TODO: Implement when document endpoints are available
 */
export async function getDocument(id: string): Promise<Document> {
  return apiClient.get<Document>(`/api/documents/${id}`);
}

/**
 * Download document file
 * TODO: Implement when document endpoints are available
 */
export async function downloadDocumentFile(id: string): Promise<Blob> {
  return apiClient.get<Blob>(`/api/documents/${id}/file`, {
    skipErrorHandling: true, // Handle blob response manually
  }) as Promise<Blob>;
}

/**
 * Download document (helper function)
 * TODO: Implement when document endpoints are available
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
 * TODO: Implement when document endpoints are available
 */
export async function deleteDocument(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/documents/${id}`);
}

