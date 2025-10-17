import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Code, BookOpen, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../config/supabase';

interface LabSubject {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  created_at: string;
}

interface LabProgram {
  id: string;
  subject_code: string;
  program_name: string;
  language: string;
  code: string;
  sample_input: string;
  description: string;
  difficulty: string;
  created_at: string;
}

interface LabProgramsModifierProps {
  isDarkTheme: boolean;
}

const LabProgramsModifier: React.FC<LabProgramsModifierProps> = ({ isDarkTheme }) => {
  const [subjects, setSubjects] = useState<LabSubject[]>([]);
  const [programs, setPrograms] = useState<LabProgram[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<LabSubject | null>(null);
  const [editingProgram, setEditingProgram] = useState<LabProgram | null>(null);

  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectIcon, setSubjectIcon] = useState('📚');

  const [programName, setProgramName] = useState('');
  const [programCode, setProgramCode] = useState('');
  const [programSampleInput, setProgramSampleInput] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [programLanguage, setProgramLanguage] = useState('python');
  const [programDifficulty, setProgramDifficulty] = useState('easy');

  useEffect(() => { loadSubjects(); }, []);

  useEffect(() => {
    if (selectedSubject) { loadPrograms(selectedSubject); } 
    else { setPrograms([]); }
  }, [selectedSubject]);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('lab_subjects').select('*').order('code', { ascending: true });
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
      const { data, error } = await supabase.from('lab_programs').select('*').eq('subject_code', subjectCode).order('created_at', { ascending: true });
      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load programs');
    }
    setLoading(false);
  };

  const openNewSubjectModal = () => {
    setEditingSubject(null);
    setSubjectCode('');
    setSubjectName('');
    setSubjectDescription('');
    setSubjectIcon('📚');
    setShowSubjectModal(true);
  };

  const openEditSubjectModal = (subject: LabSubject) => {
    setEditingSubject(subject);
    setSubjectCode(subject.code);
    setSubjectName(subject.name);
    setSubjectDescription(subject.description);
    setSubjectIcon(subject.icon);
    setShowSubjectModal(true);
  };

  const openNewProgramModal = () => {
    setEditingProgram(null);
    setProgramName('');
    setProgramCode('');
    setProgramSampleInput('');
    setProgramDescription('');
    setProgramLanguage('python');
    setProgramDifficulty('easy');
    setShowProgramModal(true);
  };

  const openEditProgramModal = (program: LabProgram) => {
    setEditingProgram(program);
    setProgramName(program.program_name);
    setProgramCode(program.code);
    setProgramSampleInput(program.sample_input || '');
    setProgramDescription(program.description || '');
    setProgramLanguage(program.language);
    setProgramDifficulty(program.difficulty);
    setShowProgramModal(true);
  };

  const handleSaveSubject = async () => {
    if (!subjectName.trim() || !subjectDescription.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!editingSubject && !subjectCode.trim()) {
      toast.error('Subject code is required for new subjects');
      return;
    }
    setLoading(true);
    try {
      if (editingSubject) {
        const { error } = await supabase.from('lab_subjects').update({
          name: subjectName.trim(),
          description: subjectDescription.trim(),
          icon: subjectIcon,
          updated_at: new Date().toISOString()
        }).eq('code', editingSubject.code);
        if (error) throw error;
        toast.success('Subject updated successfully!');
      } else {
        const subjectId = `lab-${subjectCode.toLowerCase().trim()}-${Date.now()}`;
        const { error } = await supabase.from('lab_subjects').insert({
          id: subjectId,
          code: subjectCode.toUpperCase().trim(),
          name: subjectName.trim(),
          description: subjectDescription.trim(),
          icon: subjectIcon,
          created_at: new Date().toISOString()
        });
        if (error) throw error;
        toast.success('Subject created successfully!');
      }
      setShowSubjectModal(false);
      loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save subject');
    }
    setLoading(false);
  };

  const handleSaveProgram = async () => {
    if (!selectedSubject && !editingProgram) {
      toast.error('Please select a subject first');
      return;
    }
    if (!programName.trim() || !programCode.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (editingProgram) {
        const { error } = await supabase.from('lab_programs').update({
          program_name: programName.trim(),
          code: programCode.trim(),
          sample_input: programSampleInput.trim(),
          description: programDescription.trim(),
          language: programLanguage,
          difficulty: programDifficulty,
          updated_at: new Date().toISOString()
        }).eq('id', editingProgram.id);
        if (error) throw error;
        toast.success('Program updated successfully!');
      } else {
        const programId = `${selectedSubject}-lab-${Date.now()}`;
        const { error } = await supabase.from('lab_programs').insert({
          id: programId,
          subject_code: selectedSubject,
          program_name: programName.trim(),
          code: programCode.trim(),
          sample_input: programSampleInput.trim(),
          description: programDescription.trim(),
          language: programLanguage,
          difficulty: programDifficulty,
          created_at: new Date().toISOString()
        });
        if (error) throw error;
        toast.success('Program created successfully!');
      }
      setShowProgramModal(false);
      loadPrograms(editingProgram ? editingProgram.subject_code : selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save program');
    }
    setLoading(false);
  };

  const handleDeleteSubject = async (code: string) => {
    if (!window.confirm('Are you sure? This will delete all programs in this subject.')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('lab_subjects').delete().eq('code', code);
      if (error) throw error;
      toast.success('Subject deleted successfully!');
      setSelectedSubject('');
      loadSubjects();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete subject');
    }
    setLoading(false);
  };

  const handleDeleteProgram = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('lab_programs').delete().eq('id', id);
      if (error) throw error;
      toast.success('Program deleted successfully!');
      loadPrograms(selectedSubject);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete program');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Lab Programs Modifier</h2>
        <p className={`mt-1 text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>Create, edit, and manage laboratory programs</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button onClick={openNewSubjectModal} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}>
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
        <button onClick={openNewProgramModal} disabled={!selectedSubject} className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${!selectedSubject ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : isDarkTheme ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} transition-colors`}>
          <Code className="w-4 h-4" />
          <span>New Program</span>
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Subjects</h3>
            <BookOpen className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {loading && subjects.length === 0 ? (
            <div className="flex justify-center py-8"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : (
            <div className="space-y-2">
              {subjects.map((subject) => (
                <div key={subject.code} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedSubject === subject.code ? isDarkTheme ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900' : isDarkTheme ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`} onClick={() => setSelectedSubject(subject.code)}>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{subject.icon}</span>
                      <div>
                        <p className="font-medium">{subject.code}</p>
                        <p className={`text-sm ${selectedSubject === subject.code ? 'text-blue-200' : isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>{subject.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); openEditSubjectModal(subject); }} className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(subject.code); }} className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {subjects.length === 0 && <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>No subjects yet. Create one to get started!</p>}
            </div>
          )}
        </div>
        <div className={`rounded-lg ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-4 shadow`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Programs</h3>
            <Code className={`w-5 h-5 ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
          {!selectedSubject ? (
            <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>Select a subject to view programs</p>
          ) : loading && programs.length === 0 ? (
            <div className="flex justify-center py-8"><Loader className="w-6 h-6 animate-spin text-blue-500" /></div>
          ) : (
            <div className="space-y-2">
              {programs.map((program) => (
                <div key={program.id} className={`p-3 rounded-lg ${isDarkTheme ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${program.difficulty === 'easy' ? 'bg-green-100 text-green-900' : program.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-900' : 'bg-red-100 text-red-900'}`}>{program.difficulty.toUpperCase()}</span>
                        <span className={`text-xs px-2 py-1 rounded ${isDarkTheme ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{program.language.toUpperCase()}</span>
                      </div>
                      <p className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{program.program_name}</p>
                      {program.description && <p className={`text-sm mt-1 ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>{program.description}</p>}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button onClick={() => openEditProgramModal(program)} className="p-1 hover:bg-blue-500 hover:text-white rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProgram(program.id)} className="p-1 hover:bg-red-500 hover:text-white rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {programs.length === 0 && <p className={`text-center py-8 text-sm ${isDarkTheme ? 'text-gray-500' : 'text-gray-400'}`}>No programs yet. Create one for this subject!</p>}
            </div>
          )}
        </div>
      </div>
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-md w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{editingSubject ? 'Edit Subject' : 'Create New Subject'}</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Subject Code {!editingSubject && <span className="text-red-500">*</span>}</label>
                <input type="text" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value.toUpperCase())} disabled={!!editingSubject} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} ${editingSubject ? 'opacity-50 cursor-not-allowed' : ''}`} placeholder="e.g., DS, DBMS, OS" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Subject Name <span className="text-red-500">*</span></label>
                <input type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g., Data Structures" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Description <span className="text-red-500">*</span></label>
                <textarea value={subjectDescription} onChange={(e) => setSubjectDescription(e.target.value)} rows={3} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Brief description of the subject" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Icon (Emoji)</label>
                <input type="text" value={subjectIcon} onChange={(e) => setSubjectIcon(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g., 📚 🖥️ 🔬" />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowSubjectModal(false)} className={`flex-1 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>Cancel</button>
              <button onClick={handleSaveSubject} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50">{loading ? 'Saving...' : editingSubject ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
      {showProgramModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full p-6 ${isDarkTheme ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
            <h3 className={`text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{editingProgram ? 'Edit Program' : 'Create New Program'}</h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Program Name <span className="text-red-500">*</span></label>
                <input type="text" value={programName} onChange={(e) => setProgramName(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="e.g., Binary Search Tree Implementation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
                  <select value={programLanguage} onChange={(e) => setProgramLanguage(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                    <option value="python">Python</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Difficulty</label>
                  <select value={programDifficulty} onChange={(e) => setProgramDifficulty(e.target.value)} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea value={programDescription} onChange={(e) => setProgramDescription(e.target.value)} rows={2} className={`w-full px-3 py-2 rounded-lg border ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Brief description" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Code <span className="text-red-500">*</span></label>
                <textarea value={programCode} onChange={(e) => setProgramCode(e.target.value)} rows={10} className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Enter your code here..." />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>Sample Input (optional)</label>
                <textarea value={programSampleInput} onChange={(e) => setProgramSampleInput(e.target.value)} rows={3} className={`w-full px-3 py-2 rounded-lg border font-mono text-sm ${isDarkTheme ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} placeholder="Sample input for testing..." />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowProgramModal(false)} className={`flex-1 px-4 py-2 rounded-lg ${isDarkTheme ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>Cancel</button>
              <button onClick={handleSaveProgram} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white disabled:opacity-50">{loading ? 'Saving...' : editingProgram ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabProgramsModifier;
