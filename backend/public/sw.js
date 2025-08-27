/**
 * Service Worker for Document Caching
 * 
 * This service worker implements offline-first document caching for Supabase documents.
 * It provides:
 * 1. Automatic caching of documents when first accessed
 * 2. Offline support - serves cached documents when offline
 * 3. Smart cache updates - checks for newer versions when online
 * 4. Cache versioning to handle document updates
 */

const CACHE_NAME = 'semprepzie-documents-v1';
const METADATA_CACHE = 'semprepzie-metadata-v1';
const SUPABASE_STORAGE_URL = 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/pdfs/';

// List of document URLs that should be cached
const CACHEABLE_DOCUMENTS = [
  'ooadunit-1.pdf',
  'ooadunit2-1.pdf',
  'ooadunit2-1-2.pdf',
  'ooadunit2-2.pdf',
  'cnunit1.pdf',
  'cnunit2.pdf',
  'cnunit2-2.pdf',
  'english.pdf',
  'quantumunit1.pdf',
  'quantumunit2.pdf'
];

/**
 * Install event - Set up initial cache
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME),
      caches.open(METADATA_CACHE)
    ]).then(() => {
      console.log('[SW] Caches opened successfully');
      // Skip waiting to activate immediately
      return self.skipWaiting();
    })
  );
});

/**
 * Activate event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old versions of our caches
          if (cacheName.startsWith('semprepzie-documents-') && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          if (cacheName.startsWith('semprepzie-metadata-') && cacheName !== METADATA_CACHE) {
            console.log('[SW] Deleting old metadata cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

/**
 * Fetch event - Handle document requests with caching strategy
 */
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Only handle Supabase document requests
  if (url.includes(SUPABASE_STORAGE_URL)) {
    event.respondWith(handleDocumentRequest(event.request));
    return;
  }
  
  // For all other requests, try network first but catch CSP errors
  event.respondWith(
    fetch(event.request).catch(error => {
      // If fetch fails due to CSP or network error, return a basic response
      console.warn('Fetch failed, possibly due to CSP:', error);
      return new Response('', { status: 204 });
    })
  );
});

/**
 * Handle document requests with cache-first strategy for faster loading
 * @param {Request} request - The fetch request
 * @returns {Promise<Response>} - The response
 */
async function handleDocumentRequest(request) {
  const url = request.url;
  const cacheKey = generateCacheKey(url);
  
  try {
    // CACHE-FIRST STRATEGY: Always check cache first for speed
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(cacheKey);
    
    // If we have cached version, serve it immediately (online or offline)
    if (cachedResponse) {
      console.log('[SW] Serving from cache (fast load):', url);
      
      // Optionally update cache in background if online (stale-while-revalidate)
      if (navigator.onLine) {
        // Background update without blocking the response
        updateCacheInBackground(request, url, cacheKey, cache);
      }
      
      return cachedResponse;
    }
    
    // If not in cache and we're online, fetch and cache
    if (navigator.onLine) {
      try {
        console.log('[SW] Not in cache, fetching fresh document:', url);
        
        // Fetch fresh document
        const response = await fetch(request, {
          mode: 'cors',
          cache: 'no-cache'
        });
        
        if (response.ok) {
          // Clone response for caching
          const responseToCache = response.clone();
          
          // Cache the document
          await cache.put(cacheKey, responseToCache);
          
          // Update metadata
          await updateDocumentMetadata(url);
          
          console.log('[SW] Document fetched and cached:', url);
          return response;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (networkError) {
        console.log('[SW] Network failed, no cache available:', networkError);
        
        // If no cache and network fails, return error
        return new Response('Document unavailable', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    }
    
    // If we're offline and no cache, return error
    return new Response('Document not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
    
  } catch (error) {
    console.error('[SW] Error handling document request:', error);
    return new Response('Error loading document', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  }
}

/**
 * Update cache in background without blocking the main response
 * @param {Request} request - Original request
 * @param {string} url - Document URL
 * @param {string} cacheKey - Cache key
 * @param {Cache} cache - Cache instance
 */
async function updateCacheInBackground(request, url, cacheKey, cache) {
  try {
    // Check if we should update (only if cache is old)
    const shouldUpdate = await shouldUpdateDocument(url);
    
    if (shouldUpdate) {
      console.log('[SW] Background cache update started:', url);
      
      const response = await fetch(request, {
        mode: 'cors',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        // Update cache with fresh content
        await cache.put(cacheKey, response.clone());
        await updateDocumentMetadata(url);
        console.log('[SW] Background cache update completed:', url);
      }
    }
  } catch (error) {
    console.log('[SW] Background cache update failed:', error);
    // Don't throw - this is background operation
  }
}

/**
 * Check if document should be updated based on cache age and ETag
 * @param {string} url - Document URL
 * @returns {Promise<boolean>} - Whether to update
 */
async function shouldUpdateDocument(url) {
  try {
    const metadata = await getDocumentMetadata(url);
    
    // If no metadata, we should update
    if (!metadata) {
      return true;
    }
    
    // Check cache age (update if older than 24 hours for faster loading)
    const cacheAge = Date.now() - metadata.cachedAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours - longer cache for speed
    
    if (cacheAge > maxAge) {
      // Check if document has been modified using HEAD request
      try {
        const headResponse = await fetch(url, { method: 'HEAD' });
        const lastModified = headResponse.headers.get('last-modified');
        const etag = headResponse.headers.get('etag');
        
        // If we have new modification indicators, update
        if (lastModified && lastModified !== metadata.lastModified) {
          return true;
        }
        
        if (etag && etag !== metadata.etag) {
          return true;
        }
      } catch (headError) {
        console.log('[SW] HEAD request failed, will update cache:', headError);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('[SW] Error checking document update:', error);
    return true; // Default to updating on error
  }
}

/**
 * Get document metadata from cache
 * @param {string} url - Document URL
 * @returns {Promise<Object|null>} - Metadata object or null
 */
async function getDocumentMetadata(url) {
  try {
    const metadataCache = await caches.open(METADATA_CACHE);
    const cacheKey = `${generateCacheKey(url)}_metadata`;
    const response = await metadataCache.match(cacheKey);
    
    if (response) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('[SW] Error getting metadata:', error);
    return null;
  }
}

/**
 * Update document metadata in cache
 * @param {string} url - Document URL
 */
async function updateDocumentMetadata(url) {
  try {
    const metadataCache = await caches.open(METADATA_CACHE);
    const cacheKey = `${generateCacheKey(url)}_metadata`;
    
    // Try to get current document headers
    let lastModified = null;
    let etag = null;
    
    try {
      const headResponse = await fetch(url, { method: 'HEAD' });
      lastModified = headResponse.headers.get('last-modified');
      etag = headResponse.headers.get('etag');
    } catch (headError) {
      console.log('[SW] Could not get document headers:', headError);
    }
    
    const metadata = {
      url,
      cachedAt: Date.now(),
      lastModified,
      etag
    };
    
    const response = new Response(JSON.stringify(metadata), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    await metadataCache.put(cacheKey, response);
    console.log('[SW] Metadata updated for:', url);
  } catch (error) {
    console.error('[SW] Error updating metadata:', error);
  }
}

/**
 * Generate a cache key from URL
 * @param {string} url - Document URL
 * @returns {string} - Cache key
 */
function generateCacheKey(url) {
  // Create a simple cache key from the URL
  return `doc_${btoa(url).replace(/[^a-zA-Z0-9]/g, '_')}`;
}

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DOCUMENT') {
    // Manually cache a document
    const { url } = event.data;
    cacheDocument(url).then(() => {
      event.ports[0]?.postMessage({ success: true });
    }).catch((error) => {
      event.ports[0]?.postMessage({ success: false, error: error.message });
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Clear all document caches
    clearDocumentCache().then(() => {
      event.ports[0]?.postMessage({ success: true });
    }).catch((error) => {
      event.ports[0]?.postMessage({ success: false, error: error.message });
    });
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    // Get cache status
    getCacheStatus().then((status) => {
      event.ports[0]?.postMessage({ success: true, data: status });
    }).catch((error) => {
      event.ports[0]?.postMessage({ success: false, error: error.message });
    });
  }
});

/**
 * Manually cache a document
 * @param {string} url - Document URL to cache
 */
async function cacheDocument(url) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(generateCacheKey(url), response);
      await updateDocumentMetadata(url);
      console.log('[SW] Document manually cached:', url);
    } else {
      throw new Error(`Failed to fetch document: ${response.status}`);
    }
  } catch (error) {
    console.error('[SW] Error manually caching document:', error);
    throw error;
  }
}

/**
 * Clear all document caches
 */
async function clearDocumentCache() {
  try {
    await Promise.all([
      caches.delete(CACHE_NAME),
      caches.delete(METADATA_CACHE)
    ]);
    
    // Recreate empty caches
    await Promise.all([
      caches.open(CACHE_NAME),
      caches.open(METADATA_CACHE)
    ]);
    
    console.log('[SW] Document cache cleared');
  } catch (error) {
    console.error('[SW] Error clearing cache:', error);
    throw error;
  }
}

/**
 * Get cache status information
 */
async function getCacheStatus() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    const status = {
      totalDocuments: keys.length,
      cacheSize: 0,
      documents: []
    };
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const url = request.url;
        const size = parseInt(response.headers.get('content-length') || '0');
        status.cacheSize += size;
        status.documents.push({
          url,
          size,
          cached: true
        });
      }
    }
    
    return status;
  } catch (error) {
    console.error('[SW] Error getting cache status:', error);
    throw error;
  }
}
