import React from 'react';
import { useLatestUpdates, LatestUpdate } from '../hooks/useLatestUpdates';
import { Clock, FileText, ExternalLink, RefreshCw } from 'lucide-react';

interface LatestUpdatesProps {
  limit?: number;
  onDocumentClick?: (update: LatestUpdate) => void;
}

const LatestUpdates: React.FC<LatestUpdatesProps> = ({ 
  limit = 8, 
  onDocumentClick 
}) => {
  const { updates, loading, error, refetch } = useLatestUpdates(limit);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleDocumentClick = (update: LatestUpdate) => {
    if (onDocumentClick) {
      onDocumentClick(update);
    } else {
      // Default behavior: open in new tab
      window.open(update.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'ppt':
      case 'pptx':
        return '📊';
      case 'xls':
      case 'xlsx':
        return '📈';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="latest-updates-section">
        <div className="container">
          <h2 className="section-title">
            <Clock className="w-6 h-6 inline-block mr-2" />
            Latest Updates
          </h2>
          <div className="text-center py-8">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading latest updates...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="latest-updates-section">
        <div className="container">
          <h2 className="section-title">
            <Clock className="w-6 h-6 inline-block mr-2" />
            Latest Updates
          </h2>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-semibold">Failed to load updates</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button 
              onClick={refetch}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (updates.length === 0) {
    return (
      <div className="latest-updates-section">
        <div className="container">
          <h2 className="section-title">
            <Clock className="w-6 h-6 inline-block mr-2" />
            Latest Updates
          </h2>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-secondary-400" />
            <p className="text-secondary-600">No updates available yet</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="latest-updates-section bg-white py-16">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title flex items-center">
            <Clock className="w-6 h-6 mr-2 text-primary-600" />
            Latest Updates
          </h2>
          <button 
            onClick={refetch}
            className="text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-2"
            title="Refresh updates"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {updates.map((update) => (
            <div
              key={update.id}
              className="update-card bg-secondary-50 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border border-secondary-200 hover:border-primary-300"
              onClick={() => handleDocumentClick(update)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl" title={update.subject_name}>
                    {update.subject_icon}
                  </span>
                  <span className="text-lg" title={update.type.toUpperCase()}>
                    {getFileIcon(update.type)}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors" />
              </div>

              <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
                {update.title}
              </h3>

              <div className="text-sm text-secondary-600 mb-3">
                <p className="font-medium">{update.subject_name}</p>
                <p className="text-secondary-500">{update.unit_name}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-secondary-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(update.uploaded_at)}
                </span>
                <span className="uppercase font-medium">
                  {update.type}
                </span>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-primary-50 opacity-0 group-hover:opacity-20 transition-opacity rounded-lg pointer-events-none"></div>
            </div>
          ))}
        </div>

        {updates.length === limit && (
          <div className="text-center mt-8">
            <p className="text-secondary-500 text-sm">
              Showing latest {limit} updates
            </p>
          </div>
        )}
      </div>

      {/* Add some basic styling */}
      <style>{`
        .latest-updates-section .update-card {
          position: relative;
          overflow: hidden;
        }
        
        .latest-updates-section .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LatestUpdates;
