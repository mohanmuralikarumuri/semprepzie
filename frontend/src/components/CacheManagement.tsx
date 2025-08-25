import { useState, useEffect } from 'react';
import { HardDrive, Wifi, WifiOff, Download, Trash2, RefreshCw, Settings } from 'lucide-react';
import { cacheManager, CacheStatus } from '../utils/cacheManager';
import { subjectsData } from '../utils/documentUtils';

interface CacheManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CacheManagement({ isOpen, onClose }: CacheManagementProps) {
  const [cacheStatus, setCacheStatus] = useState<CacheStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [isPreloading, setIsPreloading] = useState(false);

  // Update connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cache status when component opens
  useEffect(() => {
    if (isOpen) {
      loadCacheStatus();
    }
  }, [isOpen]);

  const loadCacheStatus = async () => {
    setIsLoading(true);
    try {
      const status = await cacheManager.getCacheStatus();
      setCacheStatus(status);
    } catch (error) {
      console.error('Error loading cache status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear all cached documents? This will remove offline access to all documents.')) {
      return;
    }

    setIsLoading(true);
    try {
      await cacheManager.clearCache();
      await loadCacheStatus();
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear cache. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreloadAllDocuments = async () => {
    if (!isOnline) {
      alert('You need to be online to preload documents.');
      return;
    }

    setIsPreloading(true);
    setPreloadProgress(0);

    try {
      // Collect all document URLs
      const allDocuments: string[] = [];
      Object.values(subjectsData).forEach(subject => {
        Object.values(subject.units).forEach(unit => {
          unit.documents.forEach(doc => {
            allDocuments.push(doc.url);
          });
        });
      });

      // Preload documents with progress tracking
      let completed = 0;
      const total = allDocuments.length;

      for (const url of allDocuments) {
        try {
          const isCached = await cacheManager.isDocumentCached(url);
          if (!isCached) {
            await cacheManager.cacheDocument(url);
          }
          completed++;
          setPreloadProgress((completed / total) * 100);
        } catch (error) {
          console.warn('Failed to preload document:', url, error);
          completed++;
          setPreloadProgress((completed / total) * 100);
        }
      }

      await loadCacheStatus();
      alert(`Preloading completed! ${completed} documents processed.`);
    } catch (error) {
      console.error('Error preloading documents:', error);
      alert('Failed to preload documents. Please check your connection and try again.');
    } finally {
      setIsPreloading(false);
      setPreloadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Cache Management</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              {isOnline ? (
                <Wifi className="text-green-500" size={20} />
              ) : (
                <WifiOff className="text-red-500" size={20} />
              )}
              <span className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {isOnline 
                ? 'You can download and cache documents for offline access.'
                : 'You can only access previously cached documents while offline.'
              }
            </p>
          </div>

          {/* Cache Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <HardDrive size={20} />
              <span>Cache Status</span>
            </h3>

            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-600">
                <RefreshCw className="animate-spin" size={16} />
                <span>Loading cache information...</span>
              </div>
            ) : cacheStatus ? (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Documents Cached:</span>
                    <div className="text-blue-600 font-semibold">{cacheStatus.totalDocuments}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Cache Size:</span>
                    <div className="text-blue-600 font-semibold">
                      {cacheManager.formatCacheSize(cacheStatus.cacheSize)}
                    </div>
                  </div>
                </div>

                {cacheStatus.documents.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Cached Documents:</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {cacheStatus.documents.map((doc, index) => (
                        <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded flex justify-between">
                          <span className="truncate">
                            {doc.url.split('/').pop() || doc.url}
                          </span>
                          <span className="ml-2 text-gray-500">
                            {cacheManager.formatCacheSize(doc.size)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-600">
                Unable to load cache information
              </div>
            )}
          </div>

          {/* Preload Progress */}
          {isPreloading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Preloading Documents...</span>
                <span className="text-blue-600">{Math.round(preloadProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${preloadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handlePreloadAllDocuments}
                disabled={!isOnline || isPreloading}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Download size={18} />
                <span>{isPreloading ? 'Preloading...' : 'Preload All Documents'}</span>
              </button>

              <button
                onClick={loadCacheStatus}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={isLoading ? 'animate-spin' : ''} size={18} />
                <span>Refresh Status</span>
              </button>

              <button
                onClick={handleClearCache}
                disabled={isLoading}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 size={18} />
                <span>Clear All Cache</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">About Document Caching</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Cached documents are available offline</li>
              <li>• Cache updates automatically when online</li>
              <li>• Documents are cached for 24 hours before checking for updates</li>
              <li>• Preloading all documents ensures full offline access</li>
              <li>• Cache is cleared when you clear browser data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
