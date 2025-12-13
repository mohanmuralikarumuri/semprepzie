import React, { useState } from 'react';
import { theoryData } from '../data/theoryData';
import { Branch, Semester, Subject } from '@semprepzie/shared';
import { Search, ChevronLeft, Book, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import './TheorySection.css';

interface TheorySectionProps {
  onPDFViewingChange?: (isViewingPDF: boolean) => void;
  darkMode?: boolean;
}

const TheorySection: React.FC<TheorySectionProps> = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter branches based on search
  const filteredBranches = theoryData.branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter subjects across all branches and semesters based on search
  const searchSubjects = (query: string) => {
    if (!query.trim()) return [];
    
    const results: { branch: Branch; semester: Semester; subject: Subject }[] = [];
    
    theoryData.branches.forEach(branch => {
      branch.semesters.forEach(semester => {
        semester.subjects.forEach(subject => {
          if (
            subject.name.toLowerCase().includes(query.toLowerCase()) ||
            subject.code.toLowerCase().includes(query.toLowerCase()) ||
            subject.description?.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push({ branch, semester, subject });
          }
        });
      });
    });
    
    return results;
  };

  const searchResults = searchQuery.trim() ? searchSubjects(searchQuery) : [];

  const handleBranchSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSearchQuery('');
  };

  const handleSemesterSelect = (semester: Semester) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
    setExpandedUnits(new Set());
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

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
    } else if (selectedSemester) {
      setSelectedSemester(null);
    } else if (selectedBranch) {
      setSelectedBranch(null);
    }
  };

  const handleSearchResultClick = (result: { branch: Branch; semester: Semester; subject: Subject }) => {
    setSelectedBranch(result.branch);
    setSelectedSemester(result.semester);
    setSelectedSubject(result.subject);
    setSearchQuery('');
  };

  return (
    <div className="theory-section-new">
      <div className="theory-container">
        {/* Header with Search */}
        <div className="theory-header">
          {(selectedBranch || selectedSemester || selectedSubject) && (
            <button className="back-button" onClick={handleBack}>
              <ChevronLeft size={20} />
              Back
            </button>
          )}
          
          <div className="theory-title-section">
            <h2 className="theory-main-title">
              {selectedSubject ? selectedSubject.name :
               selectedSemester ? `${selectedBranch?.name} - ${selectedSemester.name}` :
               selectedBranch ? selectedBranch.fullName :
               'Theory Section'}
            </h2>
            {selectedSubject && (
              <p className="theory-subtitle">{selectedSubject.code} | {selectedSubject.credits} Credits</p>
            )}
          </div>

          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search subjects, branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="clear-search"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map((result, index) => (
                <div 
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <div className="search-result-icon" style={{ background: result.branch.color }}>
                    {result.branch.icon}
                  </div>
                  <div className="search-result-info">
                    <div className="search-result-subject">{result.subject.name}</div>
                    <div className="search-result-meta">
                      {result.branch.code} | {result.semester.name} | {result.subject.code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="theory-content">
          {!selectedBranch ? (
            // Branch Selection
            <div className="branches-grid">
              {filteredBranches.map(branch => (
                <div
                  key={branch.id}
                  className="branch-card"
                  onClick={() => handleBranchSelect(branch)}
                  style={{ borderTopColor: branch.color }}
                >
                  <div className="branch-icon" style={{ background: branch.color }}>
                    <span>{branch.icon}</span>
                  </div>
                  <h3 className="branch-name">{branch.name}</h3>
                  <p className="branch-full-name">{branch.fullName}</p>
                  <p className="branch-description">{branch.description}</p>
                  <div className="branch-meta">
                    <span className="branch-code">{branch.code}</span>
                    <span className="branch-semesters">{branch.semesters.length} Semesters</span>
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedSemester ? (
            // Semester Selection
            <div className="semesters-grid">
              {selectedBranch.semesters.map(semester => (
                <div
                  key={semester.id}
                  className="semester-card"
                  onClick={() => handleSemesterSelect(semester)}
                >
                  <div className="semester-number" style={{ background: selectedBranch.color }}>
                    {semester.semesterNumber}
                  </div>
                  <h3 className="semester-name">{semester.name}</h3>
                  <p className="semester-subjects-count">
                    {semester.subjects.length} Subject{semester.subjects.length !== 1 ? 's' : ''}
                  </p>
                  <div className="semester-arrow" style={{ color: selectedBranch.color }}>
                    →
                  </div>
                </div>
              ))}
            </div>
          ) : !selectedSubject ? (
            // Subject Selection
            <div className="subjects-grid">
              {selectedSemester.subjects.length > 0 ? (
                selectedSemester.subjects.map(subject => (
                  <div
                    key={subject.id}
                    className="subject-card"
                    onClick={() => handleSubjectSelect(subject)}
                  >
                    <div className="subject-header">
                      <Book size={24} style={{ color: selectedBranch.color }} />
                      <span className="subject-type">{subject.type.toUpperCase()}</span>
                    </div>
                    <h3 className="subject-name">{subject.name}</h3>
                    <p className="subject-code">{subject.code}</p>
                    {subject.description && (
                      <p className="subject-description">{subject.description}</p>
                    )}
                    <div className="subject-footer">
                      <span className="subject-credits">{subject.credits} Credits</span>
                      <span className="subject-units">{subject.units.length} Units</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-subjects">
                  <p>No subjects available for this semester yet.</p>
                  <p className="no-subjects-hint">Content will be added soon!</p>
                </div>
              )}
            </div>
          ) : (
            // Unit Details View
            <div className="units-container">
              <div className="subject-info-banner" style={{ borderLeftColor: selectedBranch.color }}>
                <div className="subject-info-content">
                  <h3>{selectedSubject.name}</h3>
                  <p>{selectedSubject.description}</p>
                  <div className="subject-info-meta">
                    <span><strong>Code:</strong> {selectedSubject.code}</span>
                    <span><strong>Credits:</strong> {selectedSubject.credits}</span>
                    <span><strong>Type:</strong> {selectedSubject.type.toUpperCase()}</span>
                    <span><strong>Units:</strong> {selectedSubject.units.length}</span>
                  </div>
                </div>
              </div>

              <div className="units-list">
                {selectedSubject.units.map(unit => (
                  <div key={unit.id} className="unit-card">
                    <div 
                      className="unit-header"
                      onClick={() => handleUnitToggle(unit.id)}
                    >
                      <div className="unit-title-section">
                        <div className="unit-number" style={{ background: selectedBranch.color }}>
                          Unit {unit.unitNumber}
                        </div>
                        <h4 className="unit-title">{unit.title}</h4>
                      </div>
                      <button className="unit-toggle">
                        {expandedUnits.has(unit.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>

                    {expandedUnits.has(unit.id) && (
                      <div className="unit-content">
                        <div className="unit-section">
                          <h5><FileText size={16} /> Topics Covered</h5>
                          <ul className="unit-topics">
                            {unit.topics.map((topic, idx) => (
                              <li key={idx}>{topic}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="unit-section">
                          <h5><Book size={16} /> Syllabus</h5>
                          <p className="unit-syllabus">{unit.syllabus}</p>
                        </div>

                        {unit.materials && (
                          <div className="unit-section">
                            <h5>📚 Learning Materials</h5>
                            <div className="unit-materials">
                              {unit.materials.notes && (
                                <a href={unit.materials.notes} target="_blank" rel="noopener noreferrer" className="material-link">
                                  📄 Notes
                                </a>
                              )}
                              {unit.materials.videos && unit.materials.videos.map((video, idx) => (
                                <a key={idx} href={video} target="_blank" rel="noopener noreferrer" className="material-link">
                                  🎥 Video {idx + 1}
                                </a>
                              ))}
                              {unit.materials.assignments && unit.materials.assignments.map((assignment, idx) => (
                                <a key={idx} href={assignment} target="_blank" rel="noopener noreferrer" className="material-link">
                                  ✍️ Assignment {idx + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheorySection;
