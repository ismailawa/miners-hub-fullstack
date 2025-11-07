/**
 * Documents API Service
 * Handles all document-related API calls
 */

import { get, post, del } from "./client";
import type { Document } from "@/lib/types";

// Re-export for convenience
export type { Document } from "@/lib/types";

/**
 * Upload document
 */
export async function uploadDocument(
  file: File,
  metadata?: Record<string, any>
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  if (metadata) {
    formData.append("metadata", JSON.stringify(metadata));
  }

  // Use apiRequest directly for file uploads (FormData)
  const { apiRequest } = await import("./client");
  const { getAccessToken } = await import("./token");
  
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const token = getAccessToken();

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Don't set Content-Type, let browser set it with boundary for FormData

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

/**
 * Download document
 */
export async function downloadDocument(id: string): Promise<Blob> {
  const { apiRequest } = await import("./client");
  const { getAccessToken } = await import("./token");
  
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const token = getAccessToken();

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Download failed");
  }

  return response.blob();
}

/**
 * Delete document
 */
export async function deleteDocument(id: string): Promise<void> {
  return del<void>(`/documents/${id}`);
}

