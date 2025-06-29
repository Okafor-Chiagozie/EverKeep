// Environment variables you need to add to your .env:
// VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
// VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

export const cloudinaryService = {
  async uploadFile(file: File): Promise<CloudinaryUploadResponse> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary configuration missing');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    // For documents, we need to use 'raw' resource type and proper endpoint
    let resourceType: string;
    let uploadEndpoint: string;
    
    if (file.type.startsWith('image/')) {
      resourceType = 'image';
      uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    } else if (file.type.startsWith('video/')) {
      resourceType = 'video'; 
      uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
    } else if (file.type.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary treats audio as video
      uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
    } else {
      // Documents and other files
      resourceType = 'raw';
      uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    }

    try {
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload file');
    }
  },

  async uploadMultipleFiles(files: File[]): Promise<CloudinaryUploadResponse[]> {
    const uploads = files.map(file => this.uploadFile(file));
    return Promise.all(uploads);
  },

  // Generate optimized URLs
  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  }) {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    let transformations = [];
    
    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.quality) transformations.push(`q_${options.quality}`);
    if (options?.format) transformations.push(`f_${options.format}`);
    
    const transformStr = transformations.length > 0 ? `${transformations.join(',')}/` : '';
    return `${baseUrl}/${transformStr}${publicId}`;
  }
};