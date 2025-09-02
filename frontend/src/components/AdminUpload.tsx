import React, { useState, useRef } from 'react';
import { Upload, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { storageService, UploadProgress } from '../services/storageService';
import { documentService, DocumentMetadata } from '../services/documentService';

interface Subject {
  id: string;
  name: string;
  icon: string;
}

interface Unit {
  id: string;
  name: string;
}

const AdminUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewUnitInput, setShowNewUnitInput] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [creatingUnit, setCreatingUnit] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load subjects on component mount
  React.useEffect(() => {
    loadSubjects();
  }, []);

  // Load units when subject changes
  React.useEffect(() => {
    if (selectedSubject) {
      loadUnits(selectedSubject);
    } else {
      setUnits([]);
      setSelectedUnit('');
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    const result = await documentService.getSubjects();
    if (result.success && result.subjects) {
      setSubjects(result.subjects);
    } else {
      toast.error('Failed to load subjects');
    }
  };

  const loadUnits = async (subjectId: string) => {
    const result = await documentService.getUnits(subjectId);
    if (result.success && result.units) {
      setUnits(result.units);
    } else {
      toast.error('Failed to load units');
    }
  };

  const createNewUnit = async () => {
    if (!selectedSubject || !newUnitName.trim()) {
      toast.error('Please select a subject and enter unit name');
      return;
    }

    setCreatingUnit(true);
    try {
      const result = await documentService.createUnit(selectedSubject, newUnitName);
      if (result.success && result.unit) {
        // Add the new unit to the current units list
        setUnits(prev => [...prev, result.unit!]);
        // Select the newly created unit
        setSelectedUnit(result.unit.id);
        // Reset the new unit form
        setNewUnitName('');
        setShowNewUnitInput(false);
        toast.success(`Unit "${result.unit.name}" created successfully!`);
      } else {
        toast.error(result.error || 'Failed to create unit');
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      toast.error('Failed to create unit');
    } finally {
      setCreatingUnit(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setTitle(file.name.replace('.pdf', ''));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedSubject('');
    setSelectedUnit('');
    setTitle('');
    setUploadProgress(null);
    setShowNewUnitInput(false);
    setNewUnitName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    // Validate basic requirements
    if (!selectedFile || !selectedSubject || !title.trim()) {
      toast.error('Please fill all required fields and select a file');
      return;
    }

    // Check if we need to create a new unit first
    if (showNewUnitInput) {
      toast.error('Please create the new unit first or select an existing unit');
      return;
    }

    // Check if unit is selected
    if (!selectedUnit) {
      toast.error('Please select a unit or create a new one');
      return;
    }

    setLoading(true);

    try {
      // Upload file directly to bucket root (no folder structure)
      const uploadResult = await storageService.uploadFile(
        selectedFile,
        '', // Empty path - upload to root
        setUploadProgress
      );

      if (!uploadResult.success) {
        toast.error(uploadResult.error || 'Upload failed');
        return;
      }

      // Create document metadata
      const metadata: DocumentMetadata = {
        title: title.trim(),
        subjectId: selectedSubject,
        unitId: selectedUnit,
        type: 'pdf',
        url: uploadResult.url!,
        originalUrl: uploadResult.url!
      };

      // Save to database
      const documentResult = await documentService.createDocument(metadata);

      if (!documentResult.success) {
        toast.error(documentResult.error || 'Failed to save document');
        return;
      }

      toast.success('Document uploaded successfully!');
      resetForm();

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📄 Upload Document
        </h2>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <Check className="w-12 h-12 text-green-600 mx-auto" />
              <div>
                <p className="text-lg font-semibold text-green-700">File Selected</p>
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="text-red-600 hover:text-red-700 underline text-sm"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Drag & drop PDF file here
                </p>
                <p className="text-sm text-gray-500">or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">
                  Max file size: 50MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700">
                {uploadProgress.message}
              </span>
              <span className="text-sm text-blue-600">
                {uploadProgress.progress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Metadata Form */}
        {selectedFile && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.icon} {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => {
                  if (e.target.value === 'create-new') {
                    setShowNewUnitInput(true);
                    setSelectedUnit('');
                  } else {
                    setSelectedUnit(e.target.value);
                    setShowNewUnitInput(false);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedSubject}
              >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
                {selectedSubject && (
                  <option value="create-new" className="text-blue-600 font-medium">
                    + Create New Unit
                  </option>
                )}
              </select>

              {/* New Unit Creation Form */}
              {showNewUnitInput && (
                <div className="mt-3 p-4 border border-blue-200 rounded-md bg-blue-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Unit Name *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newUnitName}
                      onChange={(e) => setNewUnitName(e.target.value)}
                      placeholder="Enter unit name (e.g., Unit 1: Introduction)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          createNewUnit();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={createNewUnit}
                      disabled={!newUnitName.trim() || creatingUnit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {creatingUnit ? 'Creating...' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewUnitInput(false);
                        setNewUnitName('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will create a new unit in the {subjects.find(s => s.id === selectedSubject)?.name} subject
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter document title"
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleUpload}
                disabled={loading || !selectedSubject || (!selectedUnit && !showNewUnitInput) || !title.trim() || showNewUnitInput}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
              
              <button
                onClick={resetForm}
                type="button"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUpload;
