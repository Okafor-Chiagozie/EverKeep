import { cloudinaryService } from '@/services/cloudinary';
import { api, getStoredToken } from '@/lib/api';

interface MediaEntry {
  id: string;
  title: string;
  cloudinaryUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document';
  publicId?: string;
}

export const mediaUtils = {
  async downloadMedia(entry: MediaEntry): Promise<void> {
    const filename = entry.title || 'download';

    // Prefer signed URL if we have publicId
    let remoteUrl: string | undefined;
    if (entry.publicId) {
      const resource_type = entry.type === 'document' ? 'raw' : (entry.type as any);
      remoteUrl = await cloudinaryService.getSignedDownloadUrl({
        public_id: entry.publicId,
        resource_type,
        delivery_type: 'upload',
        filename,
      });
    } else if (entry.cloudinaryUrl) {
      // Build fl_attachment fallback
      const sanitize = (name: string): string => name.replace(/[^a-zA-Z0-9._ -]/g, '_').trim() || 'download';
      const safe = sanitize(filename);
      const re = /(\/image|\/video|\/raw)\/upload\//;
      remoteUrl = re.test(entry.cloudinaryUrl) && !entry.cloudinaryUrl.includes('/fl_attachment')
        ? entry.cloudinaryUrl.replace(re, (m) => `${m}fl_attachment:${encodeURIComponent(safe)}/`)
        : entry.cloudinaryUrl;
    } else {
      throw new Error('No download URL available');
    }

    // Stream via backend proxy using Authorization header, then save as blob
    const base = (api.defaults?.baseURL as string) || '/api/v1';
    const proxyUrl = `${base}/media/download?url=${encodeURIComponent(remoteUrl)}&filename=${encodeURIComponent(filename)}`;

    const token = getStoredToken?.();
    const resp = await fetch(proxyUrl, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'omit',
    });

    if (!resp.ok) {
      // Fallback: navigate directly to remote URL
      const a = document.createElement('a');
      a.href = remoteUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(objectUrl);
  },

  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() || '' : '';
  },

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get optimized thumbnail URL for images
   */
  getThumbnailUrl(cloudinaryUrl: string, width: number = 200, height: number = 200): string {
    if (!cloudinaryUrl.includes('cloudinary.com')) {
      return cloudinaryUrl;
    }

    // Insert transformation parameters into Cloudinary URL
    const parts = cloudinaryUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},h_${height},c_fill,f_auto,q_auto/${parts[1]}`;
    }
    
    return cloudinaryUrl;
  },

  /**
   * Open document in appropriate viewer
   */
  openDocument(entry: MediaEntry): void {
    if (!entry.cloudinaryUrl) return;

    const extension = this.getFileExtension(entry.title);
    
    // For documents uploaded as 'raw', we need the proper viewing URL
    let viewUrl = entry.cloudinaryUrl;
    
    // If it's a raw Cloudinary URL, we need to handle it differently
    if (entry.cloudinaryUrl.includes('/raw/upload/')) {
      // PDFs can be viewed directly if we add the right flags
      if (extension === 'pdf') {
        // Add flags for inline viewing
        viewUrl = entry.cloudinaryUrl.replace('/raw/upload/', '/raw/upload/fl_attachment:false/');
        window.open(viewUrl, '_blank');
        return;
      }
      
      // For other documents, try Google Docs viewer
      if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(entry.cloudinaryUrl)}&embedded=true`;
        window.open(viewerUrl, '_blank');
        return;
      }
    }
    
    // Fallback: try to open directly
    window.open(viewUrl, '_blank');
  },
  canPreview(type: string): boolean {
    const previewableTypes = ['image', 'video', 'document'];
    return previewableTypes.includes(type);
  },

  /**
   * Get file type from MIME type
   */
  getFileTypeFromMime(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'document';
  },

  /**
   * Check if file is a document
   */
  isDocument(filename: string): boolean {
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'rtf', 'odt'];
    const extension = this.getFileExtension(filename);
    return documentExtensions.includes(extension);
  }
};