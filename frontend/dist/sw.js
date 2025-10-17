// Enhanced Service Worker for Offline-First PWA with Code Execution
const CACHE_NAME = 'semprepzie-v1.2.0';
const STATIC_CACHE = 'semprepzie-static-v1.2.0';
const DYNAMIC_CACHE = 'semprepzie-dynamic-v1.2.0';
const PDF_CACHE = 'semprepzie-pdfs-v1.2.0';
const DATA_CACHE = 'semprepzie-data-v1.2.0';
const CODE_EXECUTION_CACHE = 'semprepzie-code-v1.2.0';

// Supabase storage URL for document caching
const SUPABASE_STORAGE_URL = 'https://lnbjkowlhordgyhzhpgi.supabase.co/storage/v1/object/public/';

// Maximum cache sizes (memory efficient)
const MAX_PDF_CACHE_SIZE = 50; // Max 50 PDFs (~250MB assuming 5MB avg)
const MAX_DYNAMIC_CACHE_SIZE = 100;
const MAX_DATA_CACHE_SIZE = 20;
const MAX_CODE_CACHE_SIZE = 200; // Cache 200 code execution results

// Code execution cache for offline capabilities
let codeExecutionCache = new Map();
let pyodideInstance = null;

// Load Pyodide in service worker for offline Python execution
async function loadPyodide() {
  if (pyodideInstance) return pyodideInstance;
  
  try {
    // Import Pyodide in service worker
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
    
    pyodideInstance = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/',
      packages: [] // Load minimal packages
    });
    
    console.log('[SW] Pyodide loaded in service worker');
    return pyodideInstance;
  } catch (error) {
    console.error('[SW] Failed to load Pyodide:', error);
    return null;
  }
}

// Static resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html', // We'll create this
  // Core CSS and JS will be added by Vite's workbox plugin
];

// API endpoints that should be cached
const CACHEABLE_DATA_PATTERNS = [
  /\/api\/subjects/,
  /\/api\/units/,
  /\/api\/documents/,
  // Supabase data endpoints
  /supabase\.co.*\/rest\/v1\/(subjects|units|documents)/,
];

// PDF and media patterns
const PDF_PATTERNS = [
  /\.pdf$/i,
  /supabase\.co.*\/storage\/v1\/object\/public\/pdfs/,
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      }),
      
      // Initialize other caches
      caches.open(DYNAMIC_CACHE),
      caches.open(PDF_CACHE),
      caches.open(DATA_CACHE),
      caches.open(CODE_EXECUTION_CACHE)
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Pre-load Pyodide for faster offline execution
      loadPyodide().catch(console.error);
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (cacheName.startsWith('semprepzie-') && 
              ![STATIC_CACHE, DYNAMIC_CACHE, PDF_CACHE, DATA_CACHE, CODE_EXECUTION_CACHE].includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete');
      return self.clients.claim();
    })
  );
});

// Message event - handle code execution requests
self.addEventListener('message', async (event) => {
  const { data } = event;
  
  if (data.type === 'EXECUTE_CODE') {
    await handleCodeExecution(event);
  } else if (data.type === 'CACHE_CODE_RESULT') {
    await cacheCodeResult(data.cacheKey, data.result);
  } else if (data.type === 'GET_CACHE_STATUS') {
    const status = await getCodeCacheStatus();
    event.ports[0]?.postMessage({ type: 'CACHE_STATUS', status });
  }
});

// Handle code execution in service worker
async function handleCodeExecution(event) {
  const { id, language, code } = event.data;
  
  try {
    // Generate cache key
    const cacheKey = generateCacheKey(language, code);
    
    // Check cache first
    const cachedResult = await getCachedCodeResult(cacheKey);
    if (cachedResult) {
      console.log('[SW] Using cached code execution result');
      event.ports[0]?.postMessage({
        type: 'CODE_EXECUTION_RESULT',
        id,
        result: cachedResult
      });
      return;
    }
    
    let result;
    
    if (language.toLowerCase() === 'python') {
      // Execute Python code offline using Pyodide
      result = await executePythonOffline(code);
    } else if (language.toLowerCase() === 'c' || language.toLowerCase() === 'cpp') {
      // For C/C++, try online compilation or fallback to simulation
      result = await executeCCodeOffline(code, language);
    } else {
      result = {
        output: '',
        error: `Language ${language} not supported in offline mode`
      };
    }
    
    // Cache the result
    await cacheCodeResult(cacheKey, result);
    
    // Send result back
    event.ports[0]?.postMessage({
      type: 'CODE_EXECUTION_RESULT',
      id,
      result
    });
    
  } catch (error) {
    console.error('[SW] Code execution error:', error);
    event.ports[0]?.postMessage({
      type: 'CODE_EXECUTION_RESULT',
      id,
      result: {
        output: '',
        error: `Execution failed: ${error.message}`
      }
    });
  }
}

// Execute Python code using Pyodide in service worker
async function executePythonOffline(code) {
  try {
    const pyodide = await loadPyodide();
    if (!pyodide) {
      throw new Error('Pyodide not available');
    }
    
    // Enhanced output capture
    const outputCapture = `
import sys
from io import StringIO
import traceback

old_stdout = sys.stdout
old_stderr = sys.stderr
sys.stdout = captured_output = StringIO()
sys.stderr = captured_error = StringIO()

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {e}")
    traceback.print_exc()
finally:
    sys.stdout = old_stdout
    sys.stderr = old_stderr

output = captured_output.getvalue()
error = captured_error.getvalue()
{"output": output, "error": error if error.strip() else None}
`;
    
    const result = pyodide.runPython(outputCapture);
    
    return {
      output: result.output || "Program executed successfully (no output)",
      error: result.error
    };
    
  } catch (error) {
    return {
      output: '',
      error: `Python execution error: ${error.message}`
    };
  }
}

// Execute C/C++ code (fallback to simulation in offline mode)
async function executeCCodeOffline(code, language) {
  // In offline mode, provide enhanced simulation
  // This could be replaced with WASM compilation in future
  
  try {
    let output = "";
    
    // Enhanced C simulation with better pattern matching
    const printfRegex = /printf\s*\(\s*"([^"]+)"[^)]*\)/g;
    let match;
    
    while ((match = printfRegex.exec(code)) !== null) {
      let printText = match[1];
      printText = printText.replace(/\\n/g, '\n');
      printText = printText.replace(/\\t/g, '\t');
      printText = printText.replace(/\\"/g, '"');
      
      // Handle format specifiers
      if (printText.includes('%d')) {
        printText = printText.replace(/%d/g, () => Math.floor(Math.random() * 100).toString());
      }
      if (printText.includes('%s')) {
        printText = printText.replace(/%s/g, 'string_value');
      }
      
      output += printText;
    }
    
    if (!output) {
      output = `${language.toUpperCase()} program simulated successfully. Add printf statements to see output.\n[Note: Running in offline simulation mode - connect to internet for full compilation]`;
    }
    
    return { output };
    
  } catch (error) {
    return {
      output: '',
      error: `${language} simulation error: ${error.message}`
    };
  }
}

// Generate cache key for code execution
function generateCacheKey(language, code) {
  const normalizedCode = code.trim().replace(/\s+/g, ' ');
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalizedCode.length; i++) {
    const char = normalizedCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${language}:${hash}`;
}

// Cache code execution result
async function cacheCodeResult(cacheKey, result) {
  try {
    const cache = await caches.open(CODE_EXECUTION_CACHE);
    const response = new Response(JSON.stringify({
      result,
      timestamp: Date.now()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put(cacheKey, response);
    
    // Manage cache size
    await manageCacheSize(CODE_EXECUTION_CACHE, MAX_CODE_CACHE_SIZE);
  } catch (error) {
    console.error('[SW] Failed to cache code result:', error);
  }
}

// Get cached code execution result
async function getCachedCodeResult(cacheKey) {
  try {
    const cache = await caches.open(CODE_EXECUTION_CACHE);
    const response = await cache.match(cacheKey);
    
    if (response) {
      const data = await response.json();
      const age = Date.now() - data.timestamp;
      
      // Cache expires after 30 minutes
      if (age < 30 * 60 * 1000) {
        return data.result;
      } else {
        // Remove expired cache
        await cache.delete(cacheKey);
      }
    }
  } catch (error) {
    console.error('[SW] Failed to get cached code result:', error);
  }
  
  return null;
}

// Get code cache status
async function getCodeCacheStatus() {
  try {
    const cache = await caches.open(CODE_EXECUTION_CACHE);
    const keys = await cache.keys();
    
    return {
      totalCached: keys.length,
      maxSize: MAX_CODE_CACHE_SIZE,
      pyodideReady: !!pyodideInstance
    };
  } catch (error) {
    return {
      totalCached: 0,
      maxSize: MAX_CODE_CACHE_SIZE,
      pyodideReady: false
    };
  }
}

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleRequest(request, url)
  );
});

// Intelligent request handling
async function handleRequest(request, url) {
  try {
    // 1. PDF Files - Cache First (for offline access)
    if (isPDFRequest(url)) {
      return handlePDFRequest(request);
    }

    // 2. API Data - Network First with Cache Fallback
    if (isDataRequest(url)) {
      return handleDataRequest(request);
    }

    // 3. Static Resources - Cache First
    if (isStaticResource(url)) {
      return handleStaticRequest(request);
    }

    // 4. Everything else - Network First
    return handleDynamicRequest(request);

  } catch (error) {
    console.error('[SW] Request handling error:', error);
    return handleOfflineFallback(request);
  }
}

// PDF caching strategy
async function handlePDFRequest(request) {
  const cache = await caches.open(PDF_CACHE);
  
  // Try cache first for PDFs (better offline experience)
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('[SW] PDF served from cache:', request.url);
    return cachedResponse;
  }

  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache the PDF (implement size limit)
      await managePDFCache(cache, request, networkResponse.clone());
      console.log('[SW] PDF cached from network:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] PDF offline, no cache available:', request.url);
    return new Response('PDF not available offline', { status: 503 });
  }
}

// Data caching strategy (subjects, units, documents)
async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      await cache.put(request, networkResponse.clone());
      console.log('[SW] Data cached from network:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[SW] Data served from cache:', request.url);
      return cachedResponse;
    }
    
    // No cache available
    return new Response(
      JSON.stringify({ error: 'Data not available offline', offline: true }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Static resources strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first for static resources
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return handleOfflineFallback(request);
  }
}

// Dynamic content strategy
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // Network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      await manageDynamicCache(cache, request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try cache as fallback
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return handleOfflineFallback(request);
  }
}

// Cache size management for PDFs
async function managePDFCache(cache, request, response) {
  await cache.put(request, response);
  
  // Check cache size and cleanup if needed
  const keys = await cache.keys();
  if (keys.length > MAX_PDF_CACHE_SIZE) {
    // Remove oldest entries (FIFO)
    const oldestKey = keys[0];
    await cache.delete(oldestKey);
    console.log('[SW] PDF cache cleanup, removed:', oldestKey.url);
  }
}

// Cache size management for dynamic content
async function manageDynamicCache(cache, request, response) {
  await cache.put(request, response);
  
  const keys = await cache.keys();
  if (keys.length > MAX_DYNAMIC_CACHE_SIZE) {
    const oldestKey = keys[0];
    await cache.delete(oldestKey);
  }
}

// Offline fallback
async function handleOfflineFallback(request) {
  // Return offline page for navigation requests
  if (request.mode === 'navigate') {
    const cache = await caches.open(STATIC_CACHE);
    const offlinePage = await cache.match('/offline.html');
    return offlinePage || new Response('App not available offline', { status: 503 });
  }
  
  return new Response('Resource not available offline', { status: 503 });
}

// Helper functions
function isPDFRequest(url) {
  return PDF_PATTERNS.some(pattern => pattern.test(url.href));
}

function isDataRequest(url) {
  return CACHEABLE_DATA_PATTERNS.some(pattern => pattern.test(url.href));
}

function isStaticResource(url) {
  const pathname = url.pathname;
  return pathname === '/' || 
         pathname.endsWith('.html') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.json') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.ico');
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncData()
    );
  }
});

// Sync cached data when online
async function syncData() {
  console.log('[SW] Background sync triggered');
  
  try {
    // Refresh critical data when connection is restored
    const dataUrls = [
      '/api/subjects',
      '/api/units',
      '/api/latest-updates'
    ];
    
    const cache = await caches.open(DATA_CACHE);
    
    for (const url of dataUrls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('[SW] Background synced:', url);
        }
      } catch (error) {
        console.log('[SW] Background sync failed for:', url);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'semprepzie-notification',
      data: data.url
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});

console.log('[SW] Service Worker loaded successfully');
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
