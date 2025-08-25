import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
  onBack: () => void;
  className?: string;
}

export default function PDFViewer({ url, title, onBack, className = "" }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('PDFViewer received URL:', url);
  console.log('PDFViewer title:', title);

  const handleLoad = useCallback(() => {
    console.log('PDF loaded successfully');
    setIsLoading(false);
    setError(null);
  }, []);

  const handleError = useCallback(() => {
    console.error('PDF failed to load');
    setError('Failed to load PDF document');
    setIsLoading(false);
  }, []);

  if (error) {
    return (
      <div className={`fixed inset-0 bg-gray-100 z-50 ${className}`}>
        {/* Back Button - Fixed at top */}
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border"
            title="Go Back"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
        </div>

        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">PDF Loading Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-gray-100 z-50 ${className}`}>
      {/* Back Button - Fixed at top left */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-50 transition-colors border"
          title="Go Back"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </div>

      {/* PDF Content - Full Screen */}
      <div className="w-full h-full">
        {(isLoading || !url) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                {!url ? 'Preparing PDF...' : 'Loading PDF...'}
              </p>
            </div>
          </div>
        )}

        {url && (
          <iframe
            src={`${url}#view=FitH&toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-full border-0"
            title={title || "PDF Document"}
            onLoad={handleLoad}
            onError={handleError}
            style={{ 
              width: '100vw', 
              height: '100vh',
              border: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}
