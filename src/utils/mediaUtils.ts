interface MediaEntry {
  id: string;
  title: string;
  cloudinaryUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document';
}

export const mediaUtils = {
  /**
   * Download media file from Cloudinary URL
   */
  async downloadMedia(entry: MediaEntry): Promise<void> {
    if (!entry.cloudinaryUrl) {
      throw new Error('No download URL available');
    }

    try {
      // For documents uploaded as 'raw', we need to construct the correct download URL
      let downloadUrl = entry.cloudinaryUrl;
      
      // If it's a document and contains '/raw/upload/', add fl_attachment flag for proper download
      if (entry.type === 'document' && entry.cloudinaryUrl.includes('/raw/upload/')) {
        // Insert fl_attachment parameter to force download with correct headers
        downloadUrl = entry.cloudinaryUrl.replace('/raw/upload/', '/raw/upload/fl_attachment/');
      }

      // Create a temporary link element
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = entry.title;
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
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