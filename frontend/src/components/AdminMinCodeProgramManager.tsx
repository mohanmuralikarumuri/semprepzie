import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { Code, Plus, Edit3, Trash2, X, Loader, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface MinCodeSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
}

interface MinCodeProgram {
  id: string;
  subject_code: string;
  program_name: string;
  language: 'c' | 'cpp' | 'python' | 'java' | 'javascript' | 'typescript' | 'react' | 'nodejs';
  code: string;
  html_code?: string;
  css_code?: string;
  sample_input?: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  execution_type?: 'client' | 'server';
  dependencies?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

const LANGUAGES = ['c', 'cpp', 'python', 'java', 'javascript', 'typescript', 'react', 'nodejs'] as const;

const AdminMinCodeProgramManager: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  
  const [subjects, setSubjects] = useState<MinCodeSubject[]>([]);
  const [programs, setPrograms] = useState<MinCodeProgram[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProgramForm, setShowProgramForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<MinCodeProgram | null>(null);

  const [formData, setFormData] = useState<{
    program_name: string;
    language: typeof LANGUAGES[number];
    code: string;
    html_code: string;
    css_code: string;
    sample_input: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    dependencies: string;
  }>({
    program_name: '',
    language: 'javascript',
    code: '',
    html_code: '',
    css_code: '',
    sample_input: '',
    description: '',
    difficulty: 'easy',
    dependencies: '{}'
  });

  useEffect(() => {
    // Sync with system theme
    const theme = localStorage.getItem('theme') || 'light';
    setIsDarkTheme(theme === 'dark');
  }, []);

  useEffect(() => {
    loadSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      loadPrograms(selectedSubject);
    } else {
      setPrograms([]);
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mincode_subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      console.error('Error loading subjects:', error);
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (subjectCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mincode_programs')
        .select('*')
        .eq('subject_code', subjectCode)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error loading programs:', error);
      toast.error('Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      program_name: '',
      language: 'javascript',
      code: '',
      html_code: '',
      css_code: '',
      sample_input: '',
      description: '',
      difficulty: 'easy',
      dependencies: '{}'
    });
    setEditingProgram(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowProgramForm(true);
  };

  const openEditForm = (program: MinCodeProgram) => {
    setEditingProgram(program);
    setFormData({
      program_name: program.program_name,
      language: program.language,
      code: program.code,
      html_code: program.html_code || '',
      css_code: program.css_code || '',
      sample_input: program.sample_input || '',
      description: program.description || '',
      difficulty: program.difficulty || 'easy',
      dependencies: program.dependencies ? JSON.stringify(program.dependencies, null, 2) : '{}'
    });
    setShowProgramForm(true);
  };

  const handleSaveProgram = async () => {
    if (!formData.program_name.trim() || !formData.code.trim()) {
      toast.error('Please fill required fields');
      return;
    }

    if (!selectedSubject && !editingProgram) {
      toast.error('Please select a subject');
      return;
    }

    try {
      // Determine execution type based on language
      const execution_type = ['javascript', 'typescript', 'react'].includes(formData.language)
        ? 'client'
        : 'server';

      // Parse dependencies
      let dependencies = {};
      if (formData.dependencies.trim()) {
        try {
          dependencies = JSON.parse(formData.dependencies);
        } catch (e) {
          toast.error('Invalid JSON in dependencies field');
          return;
        }
      }

      const programData = {
        program_name: formData.program_name.trim(),
        language: formData.language,
        code: formData.code.trim(),
        html_code: formData.html_code.trim() || null,
        css_code: formData.css_code.trim() || null,
        sample_input: formData.sample_input.trim() || null,
        description: formData.description.trim() || null,
        difficulty: formData.difficulty,
        execution_type,
        dependencies: Object.keys(dependencies).length > 0 ? dependencies : null,
      };

      if (editingProgram) {
        // Update existing program
        const { error } = await supabase
          .from('mincode_programs')
          .update({
            ...programData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProgram.id);

        if (error) throw error;
        toast.success('Program updated successfully');
      } else {
        // Create new program
        const { error } = await supabase
          .from('mincode_programs')
          .insert({
            id: `min-prog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subject_code: selectedSubject,
            ...programData,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Program created successfully');
      }

      setShowProgramForm(false);
      resetForm();
      if (selectedSubject) {
        loadPrograms(editingProgram ? editingProgram.subject_code : selectedSubject);
      }
    } catch (error: any) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program: ' + error.message);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;

    try {
      const { error } = await supabase
        .from('mincode_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Program deleted successfully');
      if (selectedSubject) {
        loadPrograms(selectedSubject);
      }
    } catch (error: any) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete program');
    }
  };

  const isWebLanguage = (lang: string) => {
    return ['javascript', 'typescript', 'react'].includes(lang);
  };

  const needsDependencies = (lang: string) => {
    return ['react', 'nodejs', 'typescript'].includes(lang);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      python: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      java: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      c: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      react: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
      nodejs: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return colors[language] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className={`space-y-6 ${isDarkTheme ? 'dark' : ''}`}>
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          MinCode Programs Manager
        </h2>
        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          {selectedSubject 
            ? `Managing programs for ${subjects.find(s => s.code === selectedSubject)?.name || selectedSubject}`
            : 'Select a subject to manage its programs'
          }
        </p>
      </div>

      {/* Mobile Subject Selector - Only visible on mobile */}
      <div className="lg:hidden mb-6">
        <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
          <BookOpen className="w-4 h-4 inline-block mr-2" />
          Select Subject
        </label>
        <select
          value={selectedSubject || ''}
          onChange={(e) => setSelectedSubject(e.target.value || null)}
          className={`w-full px-4 py-3 rounded-lg border text-base ${
            isDarkTheme
              ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
          } focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
          <option value="">-- Choose a Subject --</option>
          {subjects.map((subject) => (
            <option key={subject.code} value={subject.code}>
              {subject.icon} {subject.name} ({subject.code})
            </option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Panel - Hidden on mobile */}
        <div className={`hidden lg:block lg:col-span-1 rounded-lg shadow-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              <BookOpen className="w-5 h-5" />
              Subjects
            </h3>
          </div>

          {loading && subjects.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader className={`w-6 h-6 animate-spin ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`} />
            </div>
          ) : subjects.length === 0 ? (
            <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              No subjects available
            </p>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <button
                  key={subject.code}
                  onClick={() => setSelectedSubject(subject.code)}
                  className={`w-full text-left p-4 rounded-lg transition-all ${
                    selectedSubject === subject.code
                      ? isDarkTheme
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-purple-500 text-white shadow-lg'
                      : isDarkTheme
                        ? 'bg-gray-700 hover:bg-gray-650 text-gray-200'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <p className="font-semibold">{subject.name}</p>
                        <p className={`text-xs ${selectedSubject === subject.code ? 'text-purple-100' : isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          {subject.code}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${selectedSubject === subject.code ? 'opacity-100' : 'opacity-0'}`} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Programs Panel - Full width on mobile, 2/3 on desktop */}
        <div className={`lg:col-span-2 rounded-lg shadow-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 sm:p-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              <Code className="w-5 h-5" />
              Programs
            </h3>
            {selectedSubject && (
              <button
                onClick={openCreateForm}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkTheme
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>New Program</span>
              </button>
            )}
          </div>

          {!selectedSubject ? (
            <div className={`text-center py-16 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Select a subject to view programs</p>
              <p className="text-sm mt-2">Choose a subject from the left panel</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center py-16">
              <Loader className={`w-8 h-8 animate-spin ${isDarkTheme ? 'text-purple-400' : 'text-purple-500'}`} />
            </div>
          ) : programs.length === 0 ? (
            <div className={`text-center py-16 ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No programs yet</p>
              <p className="text-sm mt-2">Click "New Program" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    isDarkTheme
                      ? 'bg-gray-700 border-gray-600 hover:border-gray-500'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold truncate ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {program.program_name}
                      </h4>
                      {program.description && (
                        <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                          {program.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLanguageColor(program.language)}`}>
                          {program.language.toUpperCase()}
                        </span>
                        {program.difficulty && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                            {program.difficulty}
                          </span>
                        )}
                        {program.execution_type && (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isDarkTheme ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {program.execution_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditForm(program)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkTheme
                            ? 'hover:bg-purple-600 text-gray-300 hover:text-white'
                            : 'hover:bg-purple-100 text-purple-600'
                        }`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDarkTheme
                            ? 'hover:bg-red-600 text-gray-300 hover:text-white'
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Program Form Modal */}
      {showProgramForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Sticky Header */}
            <div className={`sticky top-0 px-6 py-4 border-b ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} z-10`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                  {editingProgram ? 'Edit Program' : 'Create New Program'}
                </h3>
                <button
                  onClick={() => {
                    setShowProgramForm(false);
                    resetForm();
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkTheme ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="space-y-4">
                {/* Program Name */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Program Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.program_name}
                    onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkTheme
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="e.g., Quick Sort Implementation"
                  />
                </div>

                {/* Language and Difficulty */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      Difficulty
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDarkTheme
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Brief description of the program"
                  />
                </div>

                {/* Main Code */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Code <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    rows={12}
                    className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                      isDarkTheme
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Enter your code here..."
                  />
                </div>

                {/* HTML Code (for web languages) */}
                {isWebLanguage(formData.language) && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      HTML Code (optional)
                    </label>
                    <textarea
                      value={formData.html_code}
                      onChange={(e) => setFormData({ ...formData, html_code: e.target.value })}
                      rows={6}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                        isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="HTML code for web programs..."
                    />
                  </div>
                )}

                {/* CSS Code (for web languages) */}
                {isWebLanguage(formData.language) && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      CSS Code (optional)
                    </label>
                    <textarea
                      value={formData.css_code}
                      onChange={(e) => setFormData({ ...formData, css_code: e.target.value })}
                      rows={6}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                        isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder="CSS code for web programs..."
                    />
                  </div>
                )}

                {/* Dependencies (for react/nodejs/typescript) */}
                {needsDependencies(formData.language) && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dependencies (JSON format)
                    </label>
                    <textarea
                      value={formData.dependencies}
                      onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
                      rows={4}
                      className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                        isDarkTheme
                          ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                          : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      placeholder='{"package-name": "version"}'
                    />
                  </div>
                )}

                {/* Sample Input */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sample Input (optional)
                  </label>
                  <textarea
                    value={formData.sample_input}
                    onChange={(e) => setFormData({ ...formData, sample_input: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${
                      isDarkTheme
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500'
                    } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="Sample input for testing..."
                  />
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className={`sticky bottom-0 px-6 py-4 border-t ${isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowProgramForm(false);
                    resetForm();
                  }}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isDarkTheme
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgram}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    isDarkTheme
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  {editingProgram ? 'Update' : 'Create'} Program
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMinCodeProgramManager;
