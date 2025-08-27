/**
 * Document Viewer Utils
 * Utility functions for handling different document types and generating viewer URLs
 */

export type DocumentType = 'pdf' | 'docx' | 'doc' | 'pptx' | 'ppt' | 'xlsx' | 'xls' | 'unknown';

export interface ViewerConfig {
  type: 'pdf' | 'office';
  viewerUrl: string;
  needsBlob: boolean;
}

/**
 * Detect document type from URL or filename
 */
export function getDocumentType(url: string): DocumentType {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('.pdf')) return 'pdf';
  if (urlLower.includes('.docx')) return 'docx';
  if (urlLower.includes('.doc') && !urlLower.includes('.docx')) return 'doc';
  if (urlLower.includes('.pptx')) return 'pptx';
  if (urlLower.includes('.ppt') && !urlLower.includes('.pptx')) return 'ppt';
  if (urlLower.includes('.xlsx')) return 'xlsx';
  if (urlLower.includes('.xls') && !urlLower.includes('.xlsx')) return 'xls';
  
  return 'unknown';
}

/**
 * Get the appropriate viewer configuration for a document type
 */
export function getViewerConfig(documentType: DocumentType, blobUrl?: string): ViewerConfig | null {
  switch (documentType) {
    case 'pdf':
      // Use PDF.js viewer - we'll create a blob URL for the PDF
      return {
        type: 'pdf',
        viewerUrl: blobUrl ? `/pdfjs/web/viewer.html?file=${encodeURIComponent(blobUrl)}` : '',
        needsBlob: true
      };
    
    case 'docx':
    case 'doc':
    case 'pptx':
    case 'ppt':
    case 'xlsx':
    case 'xls':
      // Use Microsoft Office Online Viewer
      return {
        type: 'office',
        viewerUrl: blobUrl ? 
          `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(blobUrl)}` : '',
        needsBlob: false // Office viewer can work with direct URLs too
      };
    
    default:
      return null;
  }
}

/**
 * Create a blob URL from a blob (for PDF.js and local file handling)
 */
export function createBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Cleanup blob URL to prevent memory leaks
 */
export function revokeBlobUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get document icon based on type
 */
export function getDocumentIcon(documentType: DocumentType): string {
  switch (documentType) {
    case 'pdf': return '📄';
    case 'docx':
    case 'doc': return '📝';
    case 'pptx':
    case 'ppt': return '📊';
    case 'xlsx':
    case 'xls': return '📋';
    default: return '📎';
  }
}

/**
 * Check if the browser supports the required APIs
 */
export function checkBrowserSupport(): {
  indexedDB: boolean;
  fetch: boolean;
  blob: boolean;
  serviceWorker: boolean;
} {
  return {
    indexedDB: 'indexedDB' in window,
    fetch: 'fetch' in window,
    blob: 'Blob' in window,
    serviceWorker: 'serviceWorker' in navigator
  };
}

/**
 * Validate if URL is a Supabase storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  return url.includes('.supabase.co/storage/v1/object/public/');
}

/**
 * Extract filename from Supabase URL
 */
export function extractFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1] || 'document';
  } catch {
    return 'document';
  }
}
