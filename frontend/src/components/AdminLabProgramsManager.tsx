import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, BookOpen, Code, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

interface LabSubject {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
}

interface LabProgram {
  id: string;
  subject_code: string;
  program_name: string;
  language: 'c' | 'cpp' | 'python' | 'java';
  code: string;
  sample_input: string;
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const AdminLabProgramsManager: React.FC = () => {
  useAuth();
  const [subjects, setSubjects] = useState<LabSubject[]>([]);
  const [programs, setPrograms] = useState<LabProgram[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showProgramForm, setShowProgramForm] = useState(false);

  // Subject form fields
  const [subjectForm, setSubjectForm] = useState({
    id: '',
    name: '',
    code: '',
    description: '',
    icon: '📚'
  });

  // Program form fields
  const [programForm, setProgramForm] = useState<Partial<LabProgram>>({
    id: '',
    subject_code: '',
    program_name: '',
    language: 'c' as const,
    code: '',
    sample_input: '',
    description: '',
    difficulty: 'medium' as const
  });

  // Using Supabase client directly for persistence
  // const apiUrl = getApiUrl();

  // Load subjects on mount
  useEffect(() => {
    loadSubjects();
  }, []);

  // Load programs when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      loadPrograms(selectedSubject);
    }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lab_subjects')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      setError('Failed to load subjects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async (subjectCode: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lab_programs')
        .select('*')
        .eq('subject_code', subjectCode)
        .order('program_name', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (err) {
      setError('Failed to load programs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      const { error } = await supabase
        .from('lab_subjects')
        .insert([subjectForm])
        .select()
        .single();

      if (error) {
        setError(error.message || 'Failed to create subject');
        return;
      }

      await loadSubjects();
      setShowSubjectForm(false);
      resetSubjectForm();
      setError(null);
    } catch (err) {
      setError('Failed to create subject');
      console.error(err);
    }
  };

  const handleDeleteSubject = async (code: string) => {
    if (!confirm(`Are you sure you want to delete this subject? All associated programs will be deleted as well.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lab_subjects')
        .delete()
        .eq('code', code);

      if (error) {
        setError(error.message || 'Failed to delete subject');
        return;
      }

      await loadSubjects();
      if (selectedSubject === code) {
        setSelectedSubject(null);
        setPrograms([]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete subject');
      console.error(err);
    }
  };

  const handleCreateProgram = async () => {
    try {
      const payload = {
        ...(programForm as any),
        subject_code: selectedSubject
      };

      const { error } = await supabase
        .from('lab_programs')
        .insert([payload])
        .select()
        .single();

      if (error) {
        setError(error.message || 'Failed to create program');
        return;
      }

      if (selectedSubject) {
        await loadPrograms(selectedSubject);
      }
      setShowProgramForm(false);
      resetProgramForm();
      setError(null);
    } catch (err) {
      setError('Failed to create program');
      console.error(err);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('lab_programs')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message || 'Failed to delete program');
        return;
      }

      if (selectedSubject) {
        await loadPrograms(selectedSubject);
      }
      setError(null);
    } catch (err) {
      setError('Failed to delete program');
      console.error(err);
    }
  };

  const resetSubjectForm = () => {
    setSubjectForm({
      id: '',
      name: '',
      code: '',
      description: '',
      icon: '📚'
    });
  };

  const resetProgramForm = () => {
    setProgramForm({
      id: '',
      subject_code: '',
      program_name: '',
      language: 'c',
      code: '',
      sample_input: '',
      description: '',
      difficulty: 'medium'
    });
  };

  const commonIconOptions = ['📚', '🌐', '🤖', '💻', '🔬', '⚙️', '🎯', '🚀', '💡', '🔥'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Lab Programs Management</h2>
        <p className="text-gray-600">Manage lab subjects and programs</p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Lab Subjects
              </h3>
              <button
                onClick={() => {
                  resetSubjectForm();
                  setShowSubjectForm(true);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Subject Form */}
            {showSubjectForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3">New Subject</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="ID (e.g., lab-subject-ml)"
                    value={subjectForm.id}
                    onChange={(e) => setSubjectForm({ ...subjectForm, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Name (e.g., Machine Learning)"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Code (e.g., ml)"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Description"
                    value={subjectForm.description}
                    onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                    <div className="grid grid-cols-5 gap-2">
                      {commonIconOptions.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setSubjectForm({ ...subjectForm, icon })}
                          className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                            subjectForm.icon === icon
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateSubject}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowSubjectForm(false);
                        resetSubjectForm();
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Subjects List */}
            <div className="space-y-2">
              {loading && subjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Loading...</p>
              ) : subjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No subjects yet</p>
              ) : (
                subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSubject === subject.code
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedSubject(subject.code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-2xl">{subject.icon}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{subject.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{subject.code.toUpperCase()}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubject(subject.code);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Programs Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Code className="w-5 h-5 text-purple-600" />
                {selectedSubject 
                  ? `Programs: ${subjects.find(s => s.code === selectedSubject)?.name}`
                  : 'Select a subject'}
              </h3>
              {selectedSubject && (
                <button
                  onClick={() => {
                    resetProgramForm();
                    setShowProgramForm(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Program
                </button>
              )}
            </div>

            {!selectedSubject ? (
              <div className="text-center py-12 text-gray-500">
                <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a subject to view and manage programs</p>
              </div>
            ) : (
              <>
                {/* Program Form */}
                {showProgramForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold mb-3">New Program</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="ID (e.g., cn-prog-01)"
                        value={programForm.id}
                        onChange={(e) => setProgramForm({ ...programForm, id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Program Name"
                        value={programForm.program_name}
                        onChange={(e) => setProgramForm({ ...programForm, program_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={programForm.language}
                          onChange={(e) => setProgramForm({ ...programForm, language: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="c">C</option>
                          <option value="cpp">C++</option>
                          <option value="python">Python</option>
                          <option value="java">Java</option>
                        </select>
                        <select
                          value={programForm.difficulty}
                          onChange={(e) => setProgramForm({ ...programForm, difficulty: e.target.value as any })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="easy">Easy</option>
                          <option value="medium">Medium</option>
                          <option value="hard">Hard</option>
                        </select>
                      </div>
                      <textarea
                        placeholder="Description"
                        value={programForm.description}
                        onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={2}
                      />
                      <textarea
                        placeholder="Code"
                        value={programForm.code}
                        onChange={(e) => setProgramForm({ ...programForm, code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        rows={10}
                      />
                      <textarea
                        placeholder="Sample Input (optional)"
                        value={programForm.sample_input}
                        onChange={(e) => setProgramForm({ ...programForm, sample_input: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                        rows={3}
                      />
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleCreateProgram}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                          Save Program
                        </button>
                        <button
                          onClick={() => {
                            setShowProgramForm(false);
                            resetProgramForm();
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Programs List */}
                <div className="space-y-3">
                  {loading ? (
                    <p className="text-gray-500 text-center py-4">Loading programs...</p>
                  ) : programs.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No programs yet. Click "Add Program" to create one.</p>
                  ) : (
                    programs.map((program) => (
                      <div
                        key={program.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{program.program_name}</h4>
                              <span className="px-2 py-0.5 text-xs font-mono bg-blue-100 text-blue-800 rounded">
                                {program.language.toUpperCase()}
                              </span>
                              {program.difficulty && (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  program.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                  program.difficulty === 'hard' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {program.difficulty}
                                </span>
                              )}
                            </div>
                            {program.description && (
                              <p className="text-sm text-gray-600 mb-2">{program.description}</p>
                            )}
                            <p className="text-xs text-gray-500 font-mono">ID: {program.id}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteProgram(program.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLabProgramsManager;
