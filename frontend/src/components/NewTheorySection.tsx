import React, { useState, useMemo } from 'react';
import { theoryData } from '../data/theoryData';
import type { Branch, Semester, Subject, Unit } from '@semprepzie/shared';
import './NewTheorySection.css';

interface TheorySectionProps {
  onPDFViewingChange?: (isViewingPDF: boolean) => void;
  darkMode?: boolean;
}

const TheorySection: React.FC<TheorySectionProps> = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: { branch: Branch; semester: Semester; subject: Subject }[] = [];
    
    theoryData.branches.forEach(branch => {
      branch.semesters.forEach(semester => {
        semester.subjects.forEach(subject => {
          if (
            subject.name.toLowerCase().includes(query) ||
            subject.code.toLowerCase().includes(query) ||
            subject.description?.toLowerCase().includes(query)
          ) {
            results.push({ branch, semester, subject });
          }
        });
      });
    });
    
    return results;
  }, [searchQuery]);

  const handleBranchClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSearchQuery('');
  };

  const handleSemesterClick = (semester: Semester) => {
    setSelectedSemester(semester);
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  const handleSubjectClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
  };

  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit);
  };

  const handleBackToBranches = () => {
    setSelectedBranch(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  const handleBackToSemesters = () => {
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
  };

  const handleSearchResultClick = (result: { branch: Branch; semester: Semester; subject: Subject }) => {
    setSelectedBranch(result.branch);
    setSelectedSemester(result.semester);
    setSelectedSubject(result.subject);
    setSelectedUnit(null);
    setSearchQuery('');
  };

  // Render Branch Selection
  if (!selectedBranch) {
    return (
      <div className="theory-section">
        <div className="theory-container">
          <div className="theory-header">
            <h1 className="theory-title">
              <span className="gradient-text">Select Your Branch</span>
            </h1>
            <p className="theory-subtitle">
              Choose your engineering branch to access semester-wise curriculum
            </p>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search for subjects, codes, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="search-clear"
                >
                  ×
                </button>
              )}
            </div>

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="search-results">
                <h3 className="search-results-title">Found {searchResults.length} results</h3>
                <div className="search-results-list">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => handleSearchResultClick(result)}
                    >
                      <div className="search-result-header">
                        <span className="search-result-branch" style={{ color: result.branch.color }}>
                          {result.branch.icon} {result.branch.code}
                        </span>
                        <span className="search-result-semester">
                          Semester {result.semester.semesterNumber}
                        </span>
                      </div>
                      <h4 className="search-result-title">{result.subject.name}</h4>
                      <p className="search-result-code">{result.subject.code}</p>
                      {result.subject.description && (
                        <p className="search-result-description">{result.subject.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="search-no-results">
                <p>No subjects found matching "{searchQuery}"</p>
              </div>
            )}
          </div>

          {/* Branch Grid */}
          <div className="branch-grid">
            {theoryData.branches.map((branch) => (
              <div
                key={branch.id}
                className="branch-card"
                onClick={() => handleBranchClick(branch)}
                style={{ borderColor: branch.color }}
              >
                <div className="branch-icon" style={{ backgroundColor: `${branch.color}20` }}>
                  <span style={{ fontSize: '3rem' }}>{branch.icon}</span>
                </div>
                <div className="branch-content">
                  <h3 className="branch-name" style={{ color: branch.color }}>
                    {branch.name}
                  </h3>
                  <p className="branch-full-name">{branch.fullName}</p>
                  <p className="branch-description">{branch.description}</p>
                  <div className="branch-info">
                    <span className="branch-semesters">
                      📚 {branch.semesters.length} Semesters
                    </span>
                  </div>
                </div>
                <div className="branch-arrow" style={{ color: branch.color }}>
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Semester Selection
  if (selectedBranch && !selectedSemester) {
    return (
      <div className="theory-section">
        <div className="theory-container">
          <div className="breadcrumb">
            <button onClick={handleBackToBranches} className="breadcrumb-link">
              Branches
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{selectedBranch.name}</span>
          </div>

          <div className="theory-header">
            <h1 className="theory-title">
              <span style={{ color: selectedBranch.color }}>{selectedBranch.icon}</span>
              <span className="gradient-text">{selectedBranch.fullName}</span>
            </h1>
            <p className="theory-subtitle">Select a semester to view subjects</p>
          </div>

          <div className="semester-grid">
            {selectedBranch.semesters.map((semester) => (
              <div
                key={semester.id}
                className="semester-card"
                onClick={() => handleSemesterClick(semester)}
                style={{ borderColor: selectedBranch.color }}
              >
                <div className="semester-number" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                  {semester.semesterNumber}
                </div>
                <h3 className="semester-name">{semester.name}</h3>
                <p className="semester-subjects-count">
                  {semester.subjects.length} {semester.subjects.length === 1 ? 'Subject' : 'Subjects'}
                </p>
                <div className="semester-arrow" style={{ color: selectedBranch.color }}>
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Subject Selection
  if (selectedBranch && selectedSemester && !selectedSubject) {
    return (
      <div className="theory-section">
        <div className="theory-container">
          <div className="breadcrumb">
            <button onClick={handleBackToBranches} className="breadcrumb-link">
              Branches
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={handleBackToSemesters} className="breadcrumb-link">
              {selectedBranch.name}
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Semester {selectedSemester.semesterNumber}</span>
          </div>

          <div className="theory-header">
            <h1 className="theory-title">
              <span className="gradient-text">Semester {selectedSemester.semesterNumber} Subjects</span>
            </h1>
            <p className="theory-subtitle">
              {selectedBranch.fullName}
            </p>
          </div>

          {selectedSemester.subjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>No Subjects Available</h3>
              <p>Subjects for this semester will be added soon.</p>
            </div>
          ) : (
            <div className="subject-grid">
              {selectedSemester.subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="subject-card"
                  onClick={() => handleSubjectClick(subject)}
                  style={{ borderColor: selectedBranch.color }}
                >
                  <div className="subject-header">
                    <span className="subject-code" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                      {subject.code}
                    </span>
                    <span className="subject-type">{subject.type}</span>
                  </div>
                  <h3 className="subject-name">{subject.name}</h3>
                  {subject.description && (
                    <p className="subject-description">{subject.description}</p>
                  )}
                  <div className="subject-footer">
                    <span className="subject-credits">
                      🎓 {subject.credits} Credits
                    </span>
                    <span className="subject-units">
                      📖 {subject.units.length} Units
                    </span>
                  </div>
                  <div className="subject-arrow" style={{ color: selectedBranch.color }}>
                    →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render Units Selection
  if (selectedBranch && selectedSemester && selectedSubject && !selectedUnit) {
    return (
      <div className="theory-section">
        <div className="theory-container">
          <div className="breadcrumb">
            <button onClick={handleBackToBranches} className="breadcrumb-link">
              Branches
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={handleBackToSemesters} className="breadcrumb-link">
              {selectedBranch.name}
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={handleBackToSubjects} className="breadcrumb-link">
              Semester {selectedSemester.semesterNumber}
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{selectedSubject.code}</span>
          </div>

          <div className="theory-header">
            <h1 className="theory-title">
              <span className="gradient-text">{selectedSubject.name}</span>
            </h1>
            <div className="subject-meta">
              <span className="meta-item" style={{ color: selectedBranch.color }}>
                {selectedSubject.code}
              </span>
              <span className="meta-item">
                🎓 {selectedSubject.credits} Credits
              </span>
              <span className="meta-item">
                📚 {selectedSubject.type}
              </span>
            </div>
            {selectedSubject.description && (
              <p className="theory-subtitle">{selectedSubject.description}</p>
            )}
          </div>

          <div className="units-list">
            {selectedSubject.units.map((unit) => (
              <div
                key={unit.id}
                className="unit-card"
                style={{ borderLeftColor: selectedBranch.color }}
              >
                <div className="unit-header" onClick={() => handleUnitClick(unit)}>
                  <div className="unit-number" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                    Unit {unit.unitNumber}
                  </div>
                  <h3 className="unit-title">{unit.title}</h3>
                  <button className="unit-view-btn" style={{ color: selectedBranch.color }}>
                    View Details →
                  </button>
                </div>
                <div className="unit-preview">
                  <div className="unit-topics">
                    <strong>Topics:</strong>
                    <div className="topics-list">
                      {unit.topics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="topic-tag">
                          {topic}
                        </span>
                      ))}
                      {unit.topics.length > 3 && (
                        <span className="topic-tag more">
                          +{unit.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render Unit Details
  if (selectedBranch && selectedSemester && selectedSubject && selectedUnit) {
    return (
      <div className="theory-section">
        <div className="theory-container">
          <div className="breadcrumb">
            <button onClick={handleBackToBranches} className="breadcrumb-link">
              Branches
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={handleBackToSemesters} className="breadcrumb-link">
              {selectedBranch.name}
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={handleBackToSubjects} className="breadcrumb-link">
              Semester {selectedSemester.semesterNumber}
            </button>
            <span className="breadcrumb-separator">›</span>
            <button onClick={handleBackToUnits} className="breadcrumb-link">
              {selectedSubject.code}
            </button>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Unit {selectedUnit.unitNumber}</span>
          </div>

          <div className="unit-details">
            <div className="unit-details-header">
              <div className="unit-badge" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                Unit {selectedUnit.unitNumber}
              </div>
              <h1 className="unit-details-title">{selectedUnit.title}</h1>
              <p className="unit-details-subject">
                {selectedSubject.code} - {selectedSubject.name}
              </p>
            </div>

            <div className="unit-details-content">
              <section className="unit-section">
                <h2 className="section-title" style={{ borderLeftColor: selectedBranch.color }}>
                  📚 Syllabus
                </h2>
                <p className="syllabus-text">{selectedUnit.syllabus}</p>
              </section>

              <section className="unit-section">
                <h2 className="section-title" style={{ borderLeftColor: selectedBranch.color }}>
                  📝 Topics Covered
                </h2>
                <div className="topics-grid">
                  {selectedUnit.topics.map((topic, index) => (
                    <div key={index} className="topic-item" style={{ borderColor: selectedBranch.color }}>
                      <span className="topic-number" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                        {index + 1}
                      </span>
                      <span className="topic-name">{topic}</span>
                    </div>
                  ))}
                </div>
              </section>

              {selectedUnit.materials && (
                <section className="unit-section">
                  <h2 className="section-title" style={{ borderLeftColor: selectedBranch.color }}>
                    📖 Study Materials
                  </h2>
                  <div className="materials-grid">
                    {selectedUnit.materials.notes && (
                      <a href={selectedUnit.materials.notes} target="_blank" rel="noopener noreferrer" className="material-card">
                        <div className="material-icon" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                          📄
                        </div>
                        <span>Lecture Notes</span>
                      </a>
                    )}
                    {selectedUnit.materials.videos && selectedUnit.materials.videos.map((video, index) => (
                      <a key={index} href={video} target="_blank" rel="noopener noreferrer" className="material-card">
                        <div className="material-icon" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                          🎥
                        </div>
                        <span>Video {index + 1}</span>
                      </a>
                    ))}
                    {selectedUnit.materials.assignments && selectedUnit.materials.assignments.map((assignment, index) => (
                      <a key={index} href={assignment} target="_blank" rel="noopener noreferrer" className="material-card">
                        <div className="material-icon" style={{ backgroundColor: `${selectedBranch.color}20`, color: selectedBranch.color }}>
                          ✏️
                        </div>
                        <span>Assignment {index + 1}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TheorySection;
