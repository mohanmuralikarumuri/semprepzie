/**
 * Document Cache Manager
 * 
 * This utility provides an interface for managing document caching
 * and communicating with the service worker.
 */

export interface CacheStatus {
  totalDocuments: number;
  cacheSize: number;
  documents: Array<{
    url: string;
    size: number;
    cached: boolean;
  }>;
}

export class DocumentCacheManager {
  private static instance: DocumentCacheManager;
  private serviceWorkerReady: boolean = false;

  private constructor() {
    this.initializeServiceWorker();
  }

  public static getInstance(): DocumentCacheManager {
    if (!DocumentCacheManager.instance) {
      DocumentCacheManager.instance = new DocumentCacheManager();
    }
    return DocumentCacheManager.instance;
  }

  /**
   * Initialize service worker for document caching
   */
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.log('[CacheManager] Service Worker registered:', registration);

        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        this.serviceWorkerReady = true;

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          console.log('[CacheManager] Service Worker update found');
        });

        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('[CacheManager] Message from SW:', event.data);
        });

      } catch (error) {
        console.error('[CacheManager] Service Worker registration failed:', error);
      }
    } else {
      console.warn('[CacheManager] Service Worker not supported');
    }
  }

  /**
   * Check if service worker is ready
   */
  public isReady(): boolean {
    return this.serviceWorkerReady && 'serviceWorker' in navigator;
  }

  /**
   * Manually cache a document
   * @param url - Document URL to cache
   */
  public async cacheDocument(url: string): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('[CacheManager] Service Worker not ready');
      return false;
    }

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('[CacheManager] Document cached successfully:', url);
            resolve(true);
          } else {
            console.error('[CacheManager] Failed to cache document:', event.data.error);
            reject(new Error(event.data.error));
          }
        };

        navigator.serviceWorker.controller?.postMessage(
          { type: 'CACHE_DOCUMENT', url },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[CacheManager] Error caching document:', error);
      return false;
    }
  }

  /**
   * Clear all document caches
   */
  public async clearCache(): Promise<boolean> {
    if (!this.isReady()) {
      console.warn('[CacheManager] Service Worker not ready');
      return false;
    }

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            console.log('[CacheManager] Cache cleared successfully');
            resolve(true);
          } else {
            console.error('[CacheManager] Failed to clear cache:', event.data.error);
            reject(new Error(event.data.error));
          }
        };

        navigator.serviceWorker.controller?.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[CacheManager] Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get cache status information
   */
  public async getCacheStatus(): Promise<CacheStatus | null> {
    if (!this.isReady()) {
      console.warn('[CacheManager] Service Worker not ready');
      return null;
    }

    try {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve(event.data.data);
          } else {
            console.error('[CacheManager] Failed to get cache status:', event.data.error);
            reject(new Error(event.data.error));
          }
        };

        navigator.serviceWorker.controller?.postMessage(
          { type: 'GET_CACHE_STATUS' },
          [messageChannel.port2]
        );
      });
    } catch (error) {
      console.error('[CacheManager] Error getting cache status:', error);
      return null;
    }
  }

  /**
   * Check if a document is cached
   * @param url - Document URL to check
   */
  public async isDocumentCached(url: string): Promise<boolean> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('semprepzie-documents-v1');
        const cacheKey = this.generateCacheKey(url);
        const response = await cache.match(cacheKey);
        return !!response;
      }
      return false;
    } catch (error) {
      console.error('[CacheManager] Error checking cache:', error);
      return false;
    }
  }

  /**
   * Get cached document as blob URL
   * @param url - Document URL
   */
  public async getCachedDocumentBlob(url: string): Promise<string | null> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('semprepzie-documents-v1');
        const cacheKey = this.generateCacheKey(url);
        const response = await cache.match(cacheKey);
        
        if (response) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      }
      return null;
    } catch (error) {
      console.error('[CacheManager] Error getting cached blob:', error);
      return null;
    }
  }

  /**
   * Check network connectivity
   */
  public isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Format cache size for display
   * @param bytes - Size in bytes
   */
  public formatCacheSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Generate cache key from URL (same as service worker)
   * @param url - Document URL
   */
  private generateCacheKey(url: string): string {
    return `doc_${btoa(url).replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  /**
   * Preload important documents
   * @param urls - Array of document URLs to preload
   */
  public async preloadDocuments(urls: string[]): Promise<void> {
    console.log('[CacheManager] Preloading documents:', urls.length);
    
    const promises = urls.map(async (url) => {
      try {
        const isCached = await this.isDocumentCached(url);
        if (!isCached) {
          await this.cacheDocument(url);
          console.log('[CacheManager] Preloaded:', url);
        }
      } catch (error) {
        console.warn('[CacheManager] Failed to preload:', url, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('[CacheManager] Preloading completed');
  }

  /**
   * Setup offline event listeners
   */
  public setupOfflineHandlers(): void {
    window.addEventListener('online', () => {
      console.log('[CacheManager] Back online');
      // Could trigger cache updates here
    });

    window.addEventListener('offline', () => {
      console.log('[CacheManager] Gone offline');
    });
  }
}

// Export singleton instance
export const cacheManager = DocumentCacheManager.getInstance();
