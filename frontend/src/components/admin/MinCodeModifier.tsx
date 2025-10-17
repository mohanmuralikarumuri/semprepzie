import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Minimize2, BookOpen, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';

interface MinCodeSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

interface MinCodeProgram {
  id: string;
  subject_code: string;
  program_name: string;
  code: string;
  sample_input: string;
  description: string;
  language: string;
  difficulty: string;
  created_at: string;
}

interface MinCodeModifierProps {
  isDarkTheme: boolean;
}

const MinCodeModifier: React.FC<MinCodeModifierProps> = ({ isDarkTheme }) => {
  const [subjects, setSubjects] = useState<MinCodeSubject[]>([]);
  const [programs, setPrograms] = useState<MinCodeProgram[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showNewSubjectModal, setShowNewSubjectModal] = useState(false);
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);

  // Form states for new/edit subject
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectDescription, setNewSubjectDescription] = useState('');
  const [newSubjectIcon, setNewSubjectIcon] = useState('💻');
  const [editingSubject, setEditingSubject] = useState<MinCodeSubject | null>(null);

  // Form states for new/edit program
  const [newProgramName, setNewProgramName] = useState('');
  const [newProgramCode, setNewProgramCode] = useState('');
  const [newProgramSampleInput, setNewProgramSampleInput] = useState('');
  const [newProgramDescription, setNewProgramDescription] = useState('');
  const [newProgramLanguage, setNewProgramLanguage] = useState('python');
  const [newProgramDifficulty, setNewProgramDifficulty] = useState('easy');
  const [editingProgram, setEditingProgram] = useState<MinCodeProgram | null>(null);

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
    setLoading(true);
    try {
      // Using separate mincode_subjects table
      const { data, error } = await supabase
        .from('mincode_subjects')
        .select('*')
        .order('code', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load subjects');
    }
    setLoading(false);
  };

  const loadPrograms = async (subjectCode: string) => {
    setLoading(true);
    try {
      // Using separate mincode_programs table
      const { data, error } = await supabase
        .from('mincode_programs')
        .select('*')
        .eq('subject_code', subjectCode)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load programs');
    }
    setLoading(false);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectCode.trim() || !newSubjectName.trim() || !newSubjectDescription.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const subjectId = `mincode-${newSubjectCode.toLowerCase().trim()}-${Date.now()}`;
      const { error } = await supabase
        .from('mincode_subjects')
        .insert({
          id: subjectId,
          code: newSubjectCode.toUpperCase().trim(),
          name: newSubjectName.trim(),
          description: newSubjectDescription.trim(),
          icon: newSubjectIcon,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Min code subject created successfully!');
      setShowNewSubjectModal(false);
      setNewSubjectCode('');
      setNewSubjectName('');
      setNewSubjectDescription('');
      setNewSubjectIcon('💻');
      loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subject');
    }
    setLoading(false);
  };

  const handleCreateProgram = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    if (!newProgramName.trim() || !newProgramCode.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const programId = `${selectedSubject}-mincode-${Date.now()}`;
      
      const { error } = await supabase
        .from('mincode_programs')
        .insert({
          id: programId,
          subject_code: selectedSubject,
          program_name: newProgramName.trim(),
          code: newProgramCode.trim(),
          sample_input: newProgramSampleInput.trim(),
          description: newProgramDescription.trim(),
          language: newProgramLanguage,
          difficulty: newProgramDifficulty,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Min code created successfully!');
      setShowNewProgramModal(false);
      setNewProgramName('');
      setNewProgramCode('');
      setNewProgramSampleInput('');
      setNewProgramDescription('');
      setNewProgramLanguage('python');
      setNewProgramDifficulty('easy');
      loadPrograms(selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create min code');
    }
    setLoading(false);
  };

  const handleDeleteSubject = async (subjectCode: string) => {
    if (!window.confirm('Are you sure? This will delete all programs in this subject.')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mincode_subjects')
        .delete()
        .eq('code', subjectCode);

      if (error) throw error;

      toast.success('Min code subject deleted successfully!');
      setSelectedSubject('');
      loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subject');
    }
    setLoading(false);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!window.confirm('Are you sure you want to delete this min code?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mincode_programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;

      toast.success('Min code deleted successfully!');
      loadPrograms(selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete program');
    }
    setLoading(false);
  };

  const openNewSubjectModal = () => {
    setEditingSubject(null);
    setNewSubjectCode('');
    setNewSubjectName('');
    setNewSubjectDescription('');
    setNewSubjectIcon('💻');
    setShowNewSubjectModal(true);
  };

  const openNewProgramModal = () => {
    setEditingProgram(null);
    setNewProgramName('');
    setNewProgramCode('');
    setNewProgramSampleInput('');
    setNewProgramDescription('');
    setNewProgramLanguage('python');
    setNewProgramDifficulty('easy');
    setShowNewProgramModal(true);
  };

  const handleEditSubject = (subject: MinCodeSubject) => {
    setEditingSubject(subject);
    setNewSubjectCode(subject.code);
    setNewSubjectName(subject.name);
    setNewSubjectDescription(subject.description);
    setNewSubjectIcon(subject.icon);
    setShowNewSubjectModal(true);
  };

  const handleEditProgram = (program: MinCodeProgram) => {
    setEditingProgram(program);
    setNewProgramName(program.program_name);
    setNewProgramCode(program.code);
    setNewProgramSampleInput(program.sample_input || '');
    setNewProgramDescription(program.description || '');
    setNewProgramLanguage(program.language);
    setNewProgramDifficulty(program.difficulty);
    setShowNewProgramModal(true);
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !newSubjectName.trim() || !newSubjectDescription.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mincode_subjects')
        .update({
          name: newSubjectName.trim(),
          description: newSubjectDescription.trim(),
          icon: newSubjectIcon,
          updated_at: new Date().toISOString()
        })
        .eq('code', editingSubject.code);

      if (error) throw error;

      toast.success('Min code subject updated successfully!');
      setShowNewSubjectModal(false);
      setEditingSubject(null);
      setNewSubjectCode('');
      setNewSubjectName('');
      setNewSubjectDescription('');
      setNewSubjectIcon('💻');
      loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update subject');
    }
    setLoading(false);
  };

  const handleUpdateProgram = async () => {
    if (!editingProgram || !newProgramName.trim() || !newProgramCode.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('mincode_programs')
        .update({
          program_name: newProgramName.trim(),
          code: newProgramCode.trim(),
          sample_input: newProgramSampleInput.trim(),
          description: newProgramDescription.trim(),
          language: newProgramLanguage,
          difficulty: newProgramDifficulty,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProgram.id);

      if (error) throw error;

      toast.success('Min code updated successfully!');
      setShowNewProgramModal(false);
      setEditingProgram(null);
      setNewProgramName('');
      setNewProgramCode('');
      setNewProgramSampleInput('');
      setNewProgramDescription('');
      setNewProgramLanguage('python');
      setNewProgramDifficulty('easy');
      loadPrograms(selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update min code');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
          Min Code Modifier
        </h2>
        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage minimum code examples and snippets (using same structure as Lab Programs for now)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={openNewSubjectModal}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-500 hover:bg-purple-600'} text-white transition-colors`}
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
        <button
          onClick={openNewProgramModal}
          disabled={!selectedSubject}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            !selectedSubject
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isDarkTheme
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
          } transition-colors`}
        >
          <Minimize2 className="w-4 h-4" />
          <span>New Code Example</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <Loader className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.code}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSubject === subject.code
                      ? isDarkTheme
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 text-purple-900'
                      : isDarkTheme
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setSelectedSubject(subject.code)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{subject.icon}</span>
                      <div>
                        <p className="font-medium">{subject.code}</p>
                        <p className={`text-sm ${selectedSubject === subject.code ? 'text-purple-200' : isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                          {subject.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSubject(subject);
                      }}
                      className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject.code);
                      }}
                      className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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

        {/* Code Examples Column */}
        <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              Code Examples
            </h3>
            <Minimize2 className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {!selectedSubject ? (
            <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
              Select a subject to view code examples
            </p>
          ) : loading && programs.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="space-y-2">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          program.difficulty === 'easy' ? 'bg-green-100 text-green-900' :
                          program.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-900' :
                          'bg-red-100 text-red-900'
                        }`}>
                          {program.difficulty.toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${isDarkTheme ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                          {program.language.toUpperCase()}
                        </span>
                      </div>
                      <p className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        {program.program_name}
                      </p>
                      {program.description && (
                        <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                          {program.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleEditProgram(program)}
                        className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {programs.length === 0 && (
                <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>
                  No code examples yet. Create one for this subject!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Subject Modal (Create/Edit) */}
      {showNewSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject Code {!editingSubject && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value.toUpperCase())}
                  disabled={!!editingSubject}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} ${editingSubject ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="e.g., CN, AI, FSD"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., Computer Networks"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newSubjectDescription}
                  onChange={(e) => setNewSubjectDescription(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Brief description of the subject"
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
                  placeholder="e.g., 💻 🌐 🤖"
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
                onClick={editingSubject ? handleUpdateSubject : handleCreateSubject}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingSubject ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Program Modal (Create/Edit) */}
      {showNewProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
              {editingProgram ? 'Edit Program' : 'Create New Program'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Program Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newProgramName}
                  onChange={(e) => setNewProgramName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="e.g., TCP Echo Server"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Language
                  </label>
                  <select
                    value={newProgramLanguage}
                    onChange={(e) => setNewProgramLanguage(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Difficulty
                  </label>
                  <select
                    value={newProgramDifficulty}
                    onChange={(e) => setNewProgramDifficulty(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  value={newProgramDescription}
                  onChange={(e) => setNewProgramDescription(e.target.value)}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Brief description"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Code <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newProgramCode}
                  onChange={(e) => setNewProgramCode(e.target.value)}
                  rows={10}
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Enter your code here..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                  Sample Input (optional)
                </label>
                <textarea
                  value={newProgramSampleInput}
                  onChange={(e) => setNewProgramSampleInput(e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  placeholder="Sample input for testing..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowNewProgramModal(false)}
                className={`flex-1 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
              >
                Cancel
              </button>
              <button
                onClick={editingProgram ? handleUpdateProgram : handleCreateProgram}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingProgram ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinCodeModifier;
