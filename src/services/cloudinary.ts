import { api } from '@/lib/api';

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  resource_type?: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  format?: string;
}

export const cloudinaryService = {
  async uploadFile(file: File): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Send to backend which streams to Cloudinary; do not store locally
    const { data } = await api.post('/media/upload', formData);

    // Backend returns: { publicId, url, bytes, format }
    const payload = data?.data || {};
    return {
      public_id: payload.publicId,
      secure_url: payload.url,
      format: payload.format,
      bytes: payload.bytes,
    };
  },

  async uploadMultipleFiles(files: File[]): Promise<CloudinaryUploadResponse[]> {
    const uploads = files.map((f) => this.uploadFile(f));
    return Promise.all(uploads);
  },

  async deleteFile(publicId: string): Promise<void> {
    await api.delete(`/media/${publicId}`);
  },

  // Generate optimized URLs (kept for image rendering helpers)
  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }) {
    // Prefer using Cloudinary delivery transformations directly via publicId
    const parts = publicId.split('/');
    const cloudPath = parts.slice(0, -1).join('/');
    const asset = parts[parts.length - 1];

    const transforms: string[] = [];
    if (options?.width) transforms.push(`w_${options.width}`);
    if (options?.height) transforms.push(`h_${options.height}`);
    if (options?.quality) transforms.push(`q_${options.quality}`);
    if (options?.format) transforms.push(`f_${options.format}`);

    const transformStr = transforms.length ? `${transforms.join(',')}/` : '';
    return `https://res.cloudinary.com/${cloudPath}/image/upload/${transformStr}${asset}`;
  },

  async getSignedDownloadUrl(params: {
    public_id: string;
    resource_type?: 'image' | 'video' | 'raw';
    delivery_type?: 'upload' | 'private' | 'authenticated';
    filename?: string;
    format?: string; // required for private/authenticated
  }): Promise<string> {
    const { data } = await api.get('/media/download/signed', {
      params: {
        public_id: params.public_id,
        resource_type: params.resource_type || 'image',
        delivery_type: params.delivery_type || 'upload',
        filename: params.filename,
        format: params.format,
      },
    });
    return data?.data?.url as string;
  },
};