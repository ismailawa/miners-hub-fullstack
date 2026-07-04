import apiClient from './client';

export interface MediaUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format?: string;
  width?: number;
  height?: number;
}

export type MediaUploadContext = 'profile' | 'listing' | 'event' | 'general';

export async function uploadImage(
  file: File,
  context: MediaUploadContext = 'general',
): Promise<MediaUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context', context);

  return apiClient.post<MediaUploadResult>('/api/media/upload', formData);
}
