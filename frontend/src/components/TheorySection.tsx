import React, { useState, useEffect } from 'react';
import { Subject, DocumentItem } from '../utils/documentUtils';
import { useSubjectsData } from '../hooks/useSubjectsData';
import DocumentViewer from './DocumentViewer';
import LatestUpdates from './LatestUpdates';

interface TheorySectionProps {
  onPDFViewingChange?: (isViewingPDF: boolean) => void;
  darkMode?: boolean;
}

const TheorySection: React.FC<TheorySectionProps> = ({ onPDFViewingChange, darkMode = false }) => {
  const { subjects: subjectsData, loading, error } = useSubjectsData();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  // Check if selected document is a PDF and notify parent
  useEffect(() => {
    const isPDF = selectedDocument?.url.toLowerCase().includes('.pdf') || false;
    if (onPDFViewingChange) {
      onPDFViewingChange(isPDF && selectedDocument !== null);
    }
  }, [selectedDocument, onPDFViewingChange]);

  const handleSubjectClick = (subject: Subject) => {
    if (selectedSubject?.id === subject.id) {
      setSelectedSubject(null);
    } else {
      setSelectedSubject(subject);
      setExpandedUnits(new Set());
    }
  };

  const handleUnitToggle = (unitId: string) => {
    const newExpanded = new Set(expandedUnits);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedUnits(newExpanded);
  };

  const handleDocumentClick = (document: DocumentItem) => {
    setSelectedDocument(document);
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setExpandedUnits(new Set());
  };

  return (
    <div className="theory-section">
      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          documentItem={selectedDocument}
          onClose={handleCloseDocument}
        />
      )}

      <div className="container">
        {loading ? (
          // Loading State
          <div className="text-center py-12">
            <div className="spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-secondary-600">Loading subjects...</p>
          </div>
        ) : error ? (
          // Error State
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Failed to load subjects</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        ) : !selectedSubject ? (
          // Subjects Grid View with Latest Updates at top
          <>
            {/* Latest Updates Section */}
            <div className="mb-12">
              <LatestUpdates 
                limit={8} 
                onDocumentClick={(update) => {
                  // Convert update to DocumentItem format and open
                  const documentItem: DocumentItem = {
                    id: update.id,
                    title: update.title,
                    url: update.url,
                    type: update.type as 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx',
                    originalUrl: update.url
                  };
                  setSelectedDocument(documentItem);
                }}
                darkMode={darkMode}
              />
            </div>

            {/* Theory Subjects Section */}
            <h2 className="section-title">Theory & Concepts</h2>
            <div className="subjects-grid">
              {subjectsData.map((subject) => (
                <div
                  key={subject.id}
                  className="subject-card"
                  onClick={() => handleSubjectClick(subject)}
                >
                  <div className="subject-glow"></div>
                  <div className="subject-content">
                    <span className="subject-icon">{subject.icon}</span>
                    <h3>{subject.name}</h3>
                    <p>{subject.units.length} units available</p>
                    <div className="document-count">
                      {subject.units.reduce((total, unit) => total + unit.documents.length, 0)} documents
                    </div>
                    <button className="view-btn">View Materials</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Subject Details View
          <>
            <div className="subject-header">
              <button className="back-btn" onClick={handleBackToSubjects}>
                ← Back to Subjects
              </button>
              <h2 className="section-title">
                {selectedSubject.icon} {selectedSubject.name}
              </h2>
            </div>

            <div className="units-container">
              {selectedSubject.units.length === 0 ? (
                <div className="no-content">
                  <div className="no-content-icon">📚</div>
                  <h3>Coming Soon</h3>
                  <p>Materials for this subject will be available soon.</p>
                </div>
              ) : (
                selectedSubject.units.map((unit) => (
                  <div key={unit.id} className="unit-card">
                    <div 
                      className="unit-header"
                      onClick={() => handleUnitToggle(unit.id)}
                    >
                      <div className="unit-header-left">
                        <span className="unit-icon">📖</span>
                        <h3>{unit.name}</h3>
                        <span className="document-count-badge">
                          {unit.documents.length} docs
                        </span>
                      </div>
                      <div className="unit-header-buttons">
                        <button className="expand-btn">
                          {expandedUnits.has(unit.id) ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {expandedUnits.has(unit.id) && (
                      <div className="unit-content">
                        {unit.documents.length === 0 ? (
                          <div className="no-documents">
                            <p>No documents available for this unit yet.</p>
                          </div>
                        ) : (
                          <div className="documents-grid">
                            {unit.documents.map((document) => (
                              <div
                                key={document.id}
                                className="document-card"
                                onClick={() => handleDocumentClick(document)}
                              >
                                <div className="document-icon">
                                  {document.type === 'pdf' && '📄'}
                                  {document.type === 'docx' && '📝'}
                                  {document.type === 'doc' && '📝'}
                                  {document.type === 'pptx' && '📊'}
                                  {document.type === 'ppt' && '📊'}
                                  {document.type === 'xlsx' && '📋'}
                                  {document.type === 'xls' && '📋'}
                                </div>
                                <div className="document-info">
                                  <h4>{document.title}</h4>
                                  <span className="document-type">
                                    {document.type.toUpperCase()}
                                  </span>
                                </div>
                                <button className="document-view-btn">
                                  View Document
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TheorySection;
