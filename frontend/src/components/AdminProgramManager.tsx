import React, { useState, useEffect } from 'react';
import { 
  Code, Plus, Edit3, Trash2, Save, X, Search, 
  Globe, Server, Package 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

// Match Supabase schema exactly
interface LabProgram {
  id: string;
  subject_code: string;
  program_name: string;
  description: string | null;
  language: 'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'html' | 'css' | 'react' | 'nodejs' | 'typescript';
  code: string;
  execution_type: 'client' | 'server';
  html_code: string | null;
  css_code: string | null;
  dependencies: Record<string, string> | null;
  sample_input: string | null;
  difficulty: 'easy' | 'medium' | 'hard' | null;
  created_at?: string;
  updated_at?: string;
}

interface Subject {
  code: string;
  name: string;
  description: string | null;
}

type ProgramType = 'lab' | 'mincode';

const LANGUAGES = [
  'c', 'cpp', 'python', 'java', 
  'javascript', 'html', 'css', 'react', 
  'nodejs', 'typescript'
] as const;

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

const EXECUTION_TYPES = [
  { value: 'client', label: 'Client (Browser)', icon: Globe },
  { value: 'server', label: 'Server (Backend)', icon: Server }
] as const;

const AdminProgramManager: React.FC = () => {
  const [programType, setProgramType] = useState<ProgramType>('lab');
  const [programs, setPrograms] = useState<LabProgram[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<LabProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');

  const [formData, setFormData] = useState<Partial<LabProgram>>({
    program_name: '',
    description: '',
    subject_code: '',
    language: 'python',
    code: '',
    execution_type: 'server',
    html_code: null,
    css_code: null,
    dependencies: null,
    sample_input: '',
    difficulty: 'easy'
  });

  // Load subjects and programs on mount
  useEffect(() => {
    loadSubjects();
    loadPrograms();
  }, [programType]);

  const loadSubjects = async () => {
    try {
      const tableName = programType === 'lab' ? 'lab_subjects' : 'mincode_subjects';
      const { data, error } = await supabase
        .from(tableName)
        .select('code, name, description')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const tableName = programType === 'lab' ? 'lab_programs' : 'mincode_programs';
      
      let query = supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedSubject) {
        query = query.eq('subject_code', selectedSubject);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error loading programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async () => {
    if (!formData.program_name || !formData.subject_code || !formData.code) {
      toast.error('Please fill in required fields: Program Name, Subject, and Code');
      return;
    }

    try {
      const tableName = programType === 'lab' ? 'lab_programs' : 'mincode_programs';
      
      // Prepare data - clean nulls for web programs
      const programData: any = {
        ...formData,
        id: `${programType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Only include html_code, css_code if it's a client execution type
      if (formData.execution_type === 'server') {
        programData.html_code = null;
        programData.css_code = null;
      }

      const { error } = await supabase
        .from(tableName)
        .insert([programData]);

      if (error) throw error;

      toast.success('Program created successfully!');
      setShowCreateForm(false);
      resetForm();
      loadPrograms();
    } catch (error: any) {
      console.error('Error creating program:', error);
      toast.error(`Failed to create program: ${error.message}`);
    }
  };

  const handleUpdateProgram = async () => {
    if (!editingProgram || !formData.program_name || !formData.code) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const tableName = programType === 'lab' ? 'lab_programs' : 'mincode_programs';
      
      const updateData: any = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      // Clean nulls for server programs
      if (formData.execution_type === 'server') {
        updateData.html_code = null;
        updateData.css_code = null;
      }

      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', editingProgram.id);

      if (error) throw error;

      toast.success('Program updated successfully!');
      setEditingProgram(null);
      resetForm();
      loadPrograms();
    } catch (error: any) {
      console.error('Error updating program:', error);
      toast.error(`Failed to update program: ${error.message}`);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;

    try {
      const tableName = programType === 'lab' ? 'lab_programs' : 'mincode_programs';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Program deleted successfully!');
      loadPrograms();
    } catch (error: any) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program');
    }
  };

  const resetForm = () => {
    setFormData({
      program_name: '',
      description: '',
      subject_code: '',
      language: 'python',
      code: '',
      execution_type: 'server',
      html_code: null,
      css_code: null,
      dependencies: null,
      sample_input: '',
      difficulty: 'easy'
    });
  };

  const startEditing = (program: LabProgram) => {
    setEditingProgram(program);
    setFormData({
      program_name: program.program_name,
      description: program.description,
      subject_code: program.subject_code,
      language: program.language,
      code: program.code,
      execution_type: program.execution_type,
      html_code: program.html_code,
      css_code: program.css_code,
      dependencies: program.dependencies,
      sample_input: program.sample_input,
      difficulty: program.difficulty
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      python: 'bg-yellow-100 text-yellow-800',
      java: 'bg-red-100 text-red-800',
      c: 'bg-blue-100 text-blue-800',
      cpp: 'bg-purple-100 text-purple-800',
      javascript: 'bg-green-100 text-green-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-cyan-100 text-cyan-800',
      react: 'bg-blue-100 text-blue-800',
      nodejs: 'bg-green-100 text-green-800',
      typescript: 'bg-indigo-100 text-indigo-800'
    };
    return colors[language] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string | null) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty || ''] || 'bg-gray-100 text-gray-800';
  };

  const isWebLanguage = (lang: string) => {
    return ['html', 'css', 'javascript', 'react', 'typescript'].includes(lang);
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLanguage = !filterLanguage || program.language === filterLanguage;
    const matchesDifficulty = !filterDifficulty || program.difficulty === filterDifficulty;
    return matchesSearch && matchesLanguage && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Program Manager</h1>
                <p className="mt-1 text-sm text-gray-600">Manage lab and mincode programs</p>
              </div>
              
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Create Program</span>
              </button>
            </div>

            {/* Program Type Toggle */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setProgramType('lab')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  programType === 'lab'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Lab Programs
              </button>
              <button
                onClick={() => setProgramType('mincode')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                  programType === 'mincode'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                MinCode Programs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                loadPrograms();
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.code} value={subject.code}>{subject.name}</option>
              ))}
            </select>

            {/* Language Filter */}
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map(diff => (
                <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-gray-600">
            <span className="font-medium">{filteredPrograms.length} programs found</span>
            {(searchTerm || selectedSubject || filterLanguage || filterDifficulty) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('');
                  setFilterLanguage('');
                  setFilterDifficulty('');
                  loadPrograms();
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Programs List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading programs...</p>
            </div>
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Code className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">No programs found. Create your first program!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPrograms.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{program.program_name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLanguageColor(program.language)}`}>
                        {program.language.toUpperCase()}
                      </span>
                      {program.difficulty && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(program.difficulty)}`}>
                          {program.difficulty}
                        </span>
                      )}
                    </div>
                    
                    {program.description && (
                      <p className="text-sm sm:text-base text-gray-600 mb-3 break-words">{program.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        {program.execution_type === 'client' ? (
                          <><Globe className="w-3 h-3 sm:w-4 sm:h-4" /> Client-side</>
                        ) : (
                          <><Server className="w-3 h-3 sm:w-4 sm:h-4" /> Server-side</>
                        )}
                      </span>
                      <span>Subject: {subjects.find(s => s.code === program.subject_code)?.name || program.subject_code}</span>
                      {program.dependencies && Object.keys(program.dependencies).length > 0 && (
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                          {Object.keys(program.dependencies).length} dependencies
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(program)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Program"
                    >
                      <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(program.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Program"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateForm || editingProgram) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {editingProgram ? 'Edit Program' : 'Create New Program'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingProgram(null);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.program_name}
                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="e.g., Interactive Button Counter"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                    placeholder="Brief description of the program..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subject_code}
                    onChange={(e) => setFormData({ ...formData, subject_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject.code} value={subject.code}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => {
                      const lang = e.target.value as LabProgram['language'];
                      const executionType = isWebLanguage(lang) ? 'client' : 'server';
                      setFormData({ 
                        ...formData, 
                        language: lang,
                        execution_type: executionType
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Execution Type</label>
                  <div className="flex gap-2">
                    {EXECUTION_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, execution_type: value })}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md border-2 transition-colors text-sm ${
                          formData.execution_type === value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                        <span className="sm:hidden">{value === 'client' ? 'Client' : 'Server'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty || ''}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select Difficulty</option>
                    {DIFFICULTIES.map(diff => (
                      <option key={diff} value={diff}>
                        {diff.charAt(0).toUpperCase() + diff.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Code Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isWebLanguage(formData.language || '') ? 'JavaScript' : 'Main'} Code <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                  placeholder="Enter your code here..."
                />
              </div>

              {/* Web-specific fields */}
              {formData.execution_type === 'client' && isWebLanguage(formData.language || '') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">HTML Code</label>
                    <textarea
                      value={formData.html_code || ''}
                      onChange={(e) => setFormData({ ...formData, html_code: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                      placeholder="<div>Your HTML here...</div>"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CSS Code</label>
                    <textarea
                      value={formData.css_code || ''}
                      onChange={(e) => setFormData({ ...formData, css_code: e.target.value })}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                      placeholder=".container { padding: 20px; }"
                    />
                  </div>
                </>
              )}

              {/* Dependencies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dependencies (JSON)
                  <span className="ml-2 text-xs text-gray-500">e.g., {`{"react": "^18.0.0"}`}</span>
                </label>
                <textarea
                  value={formData.dependencies ? JSON.stringify(formData.dependencies, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const deps = e.target.value ? JSON.parse(e.target.value) : null;
                      setFormData({ ...formData, dependencies: deps });
                    } catch {
                      // Invalid JSON, keep as string in state
                    }
                  }}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs sm:text-sm"
                  placeholder='{"package-name": "version"}'
                />
              </div>

              {/* Sample Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sample Input</label>
                <textarea
                  value={formData.sample_input || ''}
                  onChange={(e) => setFormData({ ...formData, sample_input: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  placeholder="Sample input for testing..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingProgram(null);
                  resetForm();
                }}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={editingProgram ? handleUpdateProgram : handleCreateProgram}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Save className="w-4 h-4" />
                <span>{editingProgram ? 'Save Changes' : 'Create Program'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProgramManager;
