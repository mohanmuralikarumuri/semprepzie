import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, FolderPlus, FileText, BookOpen, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { documentService } from '../../services/documentService';
import { storageService, UploadProgress } from '../../services/storageService';

interface Subject {
  id: string;
  name: string;
  icon: string;
}

interface Unit {
  id: string;
  name: string;
}

interface Document {
  id: string;
  title: string;
  unit_id: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

interface DocumentModifierProps {
  isDarkTheme: boolean;
}

const DocumentModifier: React.FC<DocumentModifierProps> = ({ isDarkTheme }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // Modal states
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [showNewUnitModal, setShowNewUnitModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('📚');
  const [newUnitName, setNewUnitName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadUnits(selectedSubject);
    } else {
      setUnits([]);
      setSelectedUnit('');
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedUnit) {
      loadDocuments(selectedUnit);
    } else {
      setDocuments([]);
    }
  }, [selectedUnit]);

  const loadSubjects = async () => {
    setLoading(true);
    const result = await documentService.getSubjects();
    if (result.success && result.subjects) {
      setSubjects(result.subjects);
    } else {
      toast.error('Failed to load subjects');
    }
    setLoading(false);
  };

  const loadUnits = async (subjectId: string) => {
    setLoading(true);
    const result = await documentService.getUnits(subjectId);
    if (result.success && result.units) {
      setUnits(result.units);
    } else {
      toast.error('Failed to load units');
    }
    setLoading(false);
  };

  const loadDocuments = async (unitId: string) => {
    setLoading(true);
    const result = await documentService.getDocumentsByUnit(unitId);
    if (result.success && result.documents) {
      setDocuments(result.documents);
    } else {
      toast.error('Failed to load documents');
    }
    setLoading(false);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      toast.error('Please enter subject name');
      return;
    }

    setLoading(true);
    const result = await documentService.createSubject(newSubjectName, newSubjectIcon);
    if (result.success) {
      toast.success('Subject created successfully!');
      setShowNewSubjectModal(false);
      setNewSubjectName('');
      setNewSubjectIcon('📚');
      loadSubjects();
    } else {
      toast.error(result.error || 'Failed to create subject');
    }
    setLoading(false);
  };

  const handleCreateUnit = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    if (!newUnitName.trim()) {
      toast.error('Please enter unit name');
      return;
    }

    setLoading(true);
    const result = await documentService.createUnit(selectedSubject, newUnitName);
    if (result.success) {
      toast.success('Unit created successfully!');
      setShowNewUnitModal(false);
      setNewUnitName('');
      loadUnits(selectedSubject);
    } else {
      toast.error(result.error || 'Failed to create unit');
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      setSelectedFile(file);
      // Auto-fill title from filename
      const fileName = file.name.replace('.pdf', '');
      setDocumentTitle(fileName);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedUnit) {
      toast.error('Please select a unit');
      return;
    }
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }
    if (!documentTitle.trim()) {
      toast.error('Please enter document title');
      return;
    }

    setLoading(true);
    try {
      // Upload file to storage
      const uploadResult = await storageService.uploadDocument(
        selectedFile,
        selectedUnit,
        (progress) => setUploadProgress(progress)
      );

      if (!uploadResult.success || !uploadResult.path) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Save metadata to database
      const metadata = {
        title: documentTitle,
        unit_id: selectedUnit,
        file_path: uploadResult.path,
        file_size: selectedFile.size
      };

      const saveResult = await documentService.saveDocumentMetadata(metadata);
      
      if (saveResult.success) {
        toast.success('Document uploaded successfully!');
        setShowUploadModal(false);
        setSelectedFile(null);
        setDocumentTitle('');
        setUploadProgress(null);
        loadDocuments(selectedUnit);
      } else {
        throw new Error(saveResult.error || 'Failed to save metadata');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document');
    }
    setLoading(false);
  };

  const handleDeleteDocument = async (docId: string, filePath: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setLoading(true);
    try {
      // Delete from storage
      await storageService.deleteDocument(filePath);
      
      // Delete from database
      const result = await documentService.deleteDocument(docId);
      
      if (result.success) {
        toast.success('Document deleted successfully!');
        loadDocuments(selectedUnit);
      } else {
        toast.error(result.error || 'Failed to delete document');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document');
    }
    setLoading(false);
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!window.confirm('Are you sure you want to delete this unit? All documents will be removed.')) {
      return;
    }

    setLoading(true);
    const result = await documentService.deleteUnit(unitId);
    if (result.success) {
      toast.success('Unit deleted successfully!');
      setSelectedUnit('');
      loadUnits(selectedSubject);
    } else {
      toast.error(result.error || 'Failed to delete unit');
    }
    setLoading(false);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (!window.confirm('Are you sure you want to delete this subject? All units and documents will be removed.')) {
      return;
    }

    setLoading(true);
    const result = await documentService.deleteSubject(subjectId);
    if (result.success) {
      toast.success('Subject deleted successfully!');
      setSelectedSubject('');
      loadSubjects();
    } else {
      toast.error(result.error || 'Failed to delete subject');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Document Modifier
        </h2>
        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage subjects, units, and documents in your knowledge base
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowNewSubjectModal(true)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
        <button
          onClick={() => setShowNewUnitModal(true)}
          disabled={!selectedSubject}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            !selectedSubject
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkTheme
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
          } transition-colors`}
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Unit</span>
        </button>
        <button
          onClick={() => setShowUploadModal(true)}
          disabled={!selectedUnit}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            !selectedUnit
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkTheme
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
          } transition-colors`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Column */}
        <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Subjects
            </h3>
            <BookOpen className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {loading && subjects.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSubject === subject.id
                      ? isDarkTheme
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-900'
                      : isDarkTheme
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedSubject(subject.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{subject.icon}</span>
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subject.id);
                    }}
                    className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {subjects.length === 0 && (
                <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  No subjects yet. Create one to get started!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Units Column */}
        <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Units
            </h3>
            <FolderPlus className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {!selectedSubject ? (
            <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              Select a subject to view units
            </p>
          ) : loading && units.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedUnit === unit.id
                      ? isDarkTheme
                        ? 'bg-green-600 text-white'
                        : 'bg-green-100 text-green-900'
                      : isDarkTheme
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedUnit(unit.id)}
                >
                  <span className="font-medium">{unit.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUnit(unit.id);
                    }}
                    className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {units.length === 0 && (
                <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  No units yet. Create one for this subject!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Documents Column */}
        <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Documents
            </h3>
            <FileText className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {!selectedUnit ? (
            <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              Select a unit to view documents
            </p>
          ) : loading && documents.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                      {doc.title}
                    </p>
                    <p className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                      {(doc.file_size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.file_path)}
                    className="p-1 ml-2 hover:bg-red-500 hover:text-white rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  No documents yet. Upload one to this unit!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {/* New Subject Modal */}
      {showNewSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Create New Subject
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject Name
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Data Structures"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  value={newSubjectIcon}
                  onChange={(e) => setNewSubjectIcon(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="📚"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewSubjectModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubject}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Unit Modal */}
      {showNewUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Create New Unit
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Unit Name
                </label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Unit 1: Introduction"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewUnitModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUnit}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Upload Document
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Document Title
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Introduction to Arrays"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                />
                {selectedFile && (
                  <p className={`mt-1 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
              {uploadProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                      Uploading...
                    </span>
                    <span className={isDarkTheme ? 'text-gray-400' : 'text-gray-600'}>
                      {uploadProgress.progress}%
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                  setDocumentTitle('');
                  setUploadProgress(null);
                }}
                className={`flex-1 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={loading || !selectedFile}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentModifier;
