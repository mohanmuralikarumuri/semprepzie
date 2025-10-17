// Optimized Cache Configuration for Different Storage Scenarios

// Storage-aware cache limits
const getOptimalCacheLimits = () => {
  // Estimate available storage
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(estimate => {
      const availableSpace = estimate.quota - estimate.usage;
      console.log(`[SW] Available storage: ${Math.round(availableSpace / 1024 / 1024)}MB`);
      
      // Adjust cache limits based on available space
      if (availableSpace > 500 * 1024 * 1024) { // > 500MB
        return {
          MAX_PDF_CACHE_SIZE: 100, // ~500MB
          MAX_DYNAMIC_CACHE_SIZE: 200,
          MAX_DATA_CACHE_SIZE: 50
        };
      } else if (availableSpace > 100 * 1024 * 1024) { // > 100MB
        return {
          MAX_PDF_CACHE_SIZE: 20, // ~100MB
          MAX_DYNAMIC_CACHE_SIZE: 50,
          MAX_DATA_CACHE_SIZE: 20
        };
      } else { // Limited space
        return {
          MAX_PDF_CACHE_SIZE: 5, // ~25MB
          MAX_DYNAMIC_CACHE_SIZE: 20,
          MAX_DATA_CACHE_SIZE: 10
        };
      }
    });
  }
  
  // Default conservative limits
  return {
    MAX_PDF_CACHE_SIZE: 30, // ~150MB
    MAX_DYNAMIC_CACHE_SIZE: 100,
    MAX_DATA_CACHE_SIZE: 20
  };
};

// Smart PDF caching with priority
const PDF_CACHE_STRATEGY = {
  // High priority PDFs (cache longer)
  HIGH_PRIORITY: [
    'syllabus',
    'important',
    'exam',
    'unit1',
    'unit2'
  ],
  
  // Medium priority
  MEDIUM_PRIORITY: [
    'unit3',
    'unit4',
    'practice'
  ],
  
  // Low priority (cache temporarily)
  LOW_PRIORITY: [
    'supplementary',
    'additional',
    'extra'
  ]
};

// Intelligent cache management
async function smartPDFCacheManagement(cache, request, response) {
  const url = request.url.toLowerCase();
  const priority = getPDFPriority(url);
  
  // Check if we need to make room
  const keys = await cache.keys();
  const currentSize = keys.length;
  
  if (currentSize >= MAX_PDF_CACHE_SIZE) {
    // Remove low priority items first
    for (const key of keys) {
      if (getPDFPriority(key.url) === 'LOW') {
        await cache.delete(key);
        console.log('[SW] Removed low priority PDF:', key.url);
        break;
      }
    }
    
    // If still full, remove oldest medium priority
    if ((await cache.keys()).length >= MAX_PDF_CACHE_SIZE) {
      for (const key of keys) {
        if (getPDFPriority(key.url) === 'MEDIUM') {
          await cache.delete(key);
          console.log('[SW] Removed medium priority PDF:', key.url);
          break;
        }
      }
    }
  }
  
  // Cache the new PDF
  await cache.put(request, response);
  console.log(`[SW] Cached PDF with ${priority} priority:`, request.url);
}

function getPDFPriority(url) {
  const urlLower = url.toLowerCase();
  
  if (PDF_CACHE_STRATEGY.HIGH_PRIORITY.some(keyword => urlLower.includes(keyword))) {
    return 'HIGH';
  }
  
  if (PDF_CACHE_STRATEGY.MEDIUM_PRIORITY.some(keyword => urlLower.includes(keyword))) {
    return 'MEDIUM';
  }
  
  return 'LOW';
}
