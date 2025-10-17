/**
 * Centralized API URL configuration for all environments
 */

// Get the base API URL based on environment
export const getApiUrl = (): string => {
  // Check if we're in production mode
  if (import.meta.env.PROD) {
    // In production, API is served from the same domain
    return window.location.origin + '/api';
  }
  
  // In development, use environment variable or localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:3001';
};

// Export as default for convenience
export const API_URL = getApiUrl();

// Log the API URL in console for debugging (only in dev)
if (import.meta.env.DEV) {
  console.log('[API Config] Using API URL:', API_URL);
}
