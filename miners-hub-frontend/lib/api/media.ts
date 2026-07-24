import apiClient from './client';

export interface MediaUploadResult {
  secureUrl: string;
  publicId: string;
  storageIdentity?: string;
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

  const uploaded = await apiClient.post<MediaUploadResult>('/api/media/upload', formData, {
    timeout: 30000,
    retries: 0,
  });
  return {
    ...uploaded,
    storageIdentity: uploaded.storageIdentity || uploaded.publicId,
  };
}
