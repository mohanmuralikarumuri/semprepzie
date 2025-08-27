import { useState, useEffect, useRef } from 'react';
import { X, Download, Maximize2, Minimize2, Wifi, WifiOff, HardDrive, ExternalLink } from 'lucide-react';
import { DocumentItem, convertSupabaseUrl } from '../utils/documentUtils';
import { cacheManager } from '../utils/cacheManager';
import PDFViewer from './PDFViewer';

interface DocumentViewerProps {
  documentItem: DocumentItem;
  onClose: () => void;
}

export default function DocumentViewer({ documentItem, onClose }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCached, setIsCached] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<'checking' | 'cached' | 'not-cached' | 'caching'>('checking');
  const [viewerUrl, setViewerUrl] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>(''); // Move PDF URL state to top level
  const viewerRef = useRef<HTMLDivElement>(null);

  const isPDF = documentItem.url.toLowerCase().includes('.pdf');
  const isOfficeDoc = /\.(docx?|xlsx?|pptx?)$/i.test(documentItem.url);

  // Load PDF URL if it's a PDF document
  useEffect(() => {
    if (isPDF) {
      const loadPdfUrl = async () => {
        try {
          const convertedUrl = convertSupabaseUrl(documentItem.url);
          setPdfUrl(convertedUrl.embedUrl);
        } catch (error) {
          console.error('Error loading PDF URL:', error);
          setPdfUrl(documentItem.url);
        }
      };
      
      loadPdfUrl();
    }
  }, [documentItem.url, isPDF]);

  // For PDFs, render the PDF viewer directly without modal wrapper
  if (isPDF) {
    return (
      <PDFViewer
        url={pdfUrl || documentItem.url}
        title={documentItem.title}
        onBack={onClose}
      />
    );
  }

  // Check cache status and connectivity
  useEffect(() => {
    const checkCacheStatus = async () => {
      try {
        const cached = await cacheManager.isDocumentCached(documentItem.url);
        setIsCached(cached);
        setCacheStatus(cached ? 'cached' : 'not-cached');
      } catch (error) {
        console.error('Error checking cache status:', error);
        setCacheStatus('not-cached');
      }
    };

    checkCacheStatus();

    // Setup online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [documentItem.url]);

  // Generate viewer URL based on document type and cache status
  const getViewerUrl = async () => {
    try {
      // Check if document is cached and we're offline
      if (!isOnline && isCached) {
        const cachedBlob = await cacheManager.getCachedDocumentBlob(documentItem.url);
        if (cachedBlob) {
          // For cached documents, return the blob URL directly
          return cachedBlob;
        }
      }

      // Use online URLs with proper conversion for viewers
      const convertedUrl = convertSupabaseUrl(documentItem.url);
      
      if (isOfficeDoc) {
        return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(convertedUrl.embedUrl)}`;
      }
      
      return convertedUrl.embedUrl;
    } catch (error) {
      console.error('Error generating viewer URL:', error);
      return documentItem.url;
    }
  };

  // Cache document manually
  const handleCacheDocument = async () => {
    if (cacheStatus === 'caching') return;
    
    setCacheStatus('caching');
    try {
      await cacheManager.cacheDocument(documentItem.url);
      setIsCached(true);
      setCacheStatus('cached');
    } catch (error) {
      console.error('Error caching document:', error);
      setCacheStatus('not-cached');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const loadViewer = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const viewerUrl = await getViewerUrl();
        setViewerUrl(viewerUrl);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading viewer:', error);
        setError('Failed to load document viewer');
        setIsLoading(false);
      }
    };

    if (!isMinimized) {
      loadViewer();
    }
  }, [documentItem.url, isCached, isOnline, isMinimized]);

  const handleFullscreen = () => {
    if (!isFullscreen && viewerRef.current) {
      viewerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (window.document.fullscreenElement) {
      window.document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    try {
      let downloadUrl = documentItem.url;
      
      // Try to use cached version first
      if (isCached) {
        const cachedBlob = await cacheManager.getCachedDocumentBlob(documentItem.url);
        if (cachedBlob) {
          downloadUrl = cachedBlob;
        }
      }
      
      // If not cached or cache failed, use converted URL
      if (downloadUrl === documentItem.url) {
        const convertedUrl = convertSupabaseUrl(documentItem.url);
        downloadUrl = convertedUrl.embedUrl;
      }

      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = documentItem.title;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      // Fallback to direct URL
      const link = window.document.createElement('a');
      link.href = documentItem.url;
      link.download = documentItem.title;
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleOpenOriginal = () => {
    const convertedUrl = convertSupabaseUrl(documentItem.url);
    window.open(convertedUrl.embedUrl, '_blank', 'noopener,noreferrer');
  };

  const getConnectionStatus = () => {
    if (!isOnline) {
      return isCached ? 'Offline - Cached' : 'Offline - Not Available';
    }
    return 'Online';
  };

  const getConnectionIcon = () => {
    if (!isOnline) {
      return isCached ? <HardDrive size={16} className="text-yellow-500" /> : <WifiOff size={16} className="text-red-500" />;
    }
    return <Wifi size={16} className="text-green-500" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold truncate max-w-md">{documentItem.title}</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span>{isOfficeDoc ? 'Office Document' : 'Document'}</span>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {getConnectionIcon()}
              <span>{getConnectionStatus()}</span>
            </div>

            {/* Cache Status */}
            {cacheStatus === 'cached' && (
              <div className="flex items-center space-x-1 text-green-400">
                <HardDrive size={16} />
                <span>Cached</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Cache Control */}
          {!isCached && isOnline && cacheStatus !== 'caching' && (
            <button
              onClick={handleCacheDocument}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              title="Cache for offline access"
            >
              Cache
            </button>
          )}

          {cacheStatus === 'caching' && (
            <div className="px-3 py-1 text-xs bg-yellow-600 rounded">
              Caching...
            </div>
          )}

          {/* Minimize */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title={isMinimized ? "Restore" : "Minimize"}
          >
            <Minimize2 size={18} />
          </button>
          
          {/* External Link */}
          <button
            onClick={handleOpenOriginal}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Open in new tab"
          >
            <ExternalLink size={18} />
          </button>
          
          {/* Download */}
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Download"
          >
            <Download size={18} />
          </button>
          
          {/* Fullscreen */}
          {!isMinimized && (
            <button
              onClick={handleFullscreen}
              className="p-2 hover:bg-gray-700 rounded transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}
          
          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div ref={viewerRef} className="flex-1 relative bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
                {!isOnline && !isCached && (
                  <p className="text-red-600 text-sm mt-2">
                    You're offline and this document isn't cached
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to load document</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                {!isOnline && !isCached && (
                  <p className="text-gray-600 text-sm mb-4">
                    This document is not available offline. Please connect to the internet to view it.
                  </p>
                )}
                <div className="space-x-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    disabled={!isOnline && !isCached}
                  >
                    Download
                  </button>
                  <button
                    onClick={handleOpenOriginal}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    disabled={!isOnline}
                  >
                    Open Original
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Render Office Document */}
          {!isLoading && !error && (
            <iframe
              src={viewerUrl}
              className="w-full h-full border-0"
              title={documentItem.title}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('Unable to load this document. Please try downloading it instead.');
                setIsLoading(false);
              }}
            />
          )}
        </div>
      )}

      {/* Minimized View */}
      {isMinimized && (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <p className="text-gray-600">Document minimized</p>
            <button
              onClick={() => setIsMinimized(false)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Restore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
