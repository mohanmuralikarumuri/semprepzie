import React, { useState, useEffect } from 'react';
import { Code, Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProgramExercise {
  id: string;
  title: string;
  description: string;
  subject: string;
  category: string;
  language: 'python' | 'c' | 'cpp' | 'javascript';
  timeEstimate: string;
  concepts: string[];
  startingCode: string;
  solutionCode: string;
  expectedOutput: string;
  tips: string[];
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    description: string;
  }>;
}

interface NewProgram {
  title: string;
  description: string;
  subject: string;
  category: string;
  language: 'python' | 'c' | 'cpp' | 'javascript';
  timeEstimate: string;
  concepts: string;
  startingCode: string;
  solutionCode: string;
  expectedOutput: string;
  tips: string;
}

const SUBJECTS = [
  'Data Structures',
  'Algorithms',
  'Programming Basics',
  'Object Oriented Programming',
  'Database Systems',
  'Web Development'
];

const CATEGORIES = [
  'Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs',
  'Sorting', 'Searching', 'Recursion', 'Dynamic Programming',
  'Variables', 'Functions', 'Loops', 'Conditionals', 'Classes'
];

const LANGUAGES = ['python', 'c', 'cpp', 'javascript'] as const;

const AdminLabManager: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramExercise[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLanguage, setFilterLanguage] = useState('');

  const [newProgram, setNewProgram] = useState<NewProgram>({
    title: '',
    description: '',
    subject: '',
    category: '',
    language: 'python',
    timeEstimate: '',
    concepts: '',
    startingCode: '',
    solutionCode: '',
    expectedOutput: '',
    tips: ''
  });

  // Load programs from local JSON file
  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/lab-programs/programs.json');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      } else {
        toast.error('Failed to load programs');
      }
    } catch (error) {
      console.error('Error loading programs:', error);
      toast.error('Error loading programs');
    } finally {
      setLoading(false);
    }
  };

  const savePrograms = async (updatedPrograms: ProgramExercise[]) => {
    try {
      // Create updated programs data
      const programsData = {
        programs: updatedPrograms,
        metadata: {
          version: "1.1",
          lastUpdated: new Date().toISOString(),
          totalPrograms: updatedPrograms.length
        }
      };

      // Generate JSON content
      const jsonContent = JSON.stringify(programsData, null, 2);
      
      // Create and download the file
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'programs.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Programs updated! Please replace the programs.json file in /public/lab-programs/');
      setPrograms(updatedPrograms);
    } catch (error) {
      console.error('Error saving programs:', error);
      toast.error('Error saving programs');
    }
  };

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleCreateProgram = async () => {
    if (!newProgram.title || !newProgram.description || !newProgram.startingCode) {
      toast.error('Please fill in required fields');
      return;
    }

    const program: ProgramExercise = {
      id: generateId(),
      title: newProgram.title,
      description: newProgram.description,
      subject: newProgram.subject,
      category: newProgram.category,
      language: newProgram.language,
      timeEstimate: newProgram.timeEstimate,
      concepts: newProgram.concepts.split(',').map(c => c.trim()).filter(c => c),
      startingCode: newProgram.startingCode,
      solutionCode: newProgram.solutionCode,
      expectedOutput: newProgram.expectedOutput,
      tips: newProgram.tips.split('\n').filter(t => t.trim())
    };

    const updatedPrograms = [...programs, program];
    await savePrograms(updatedPrograms);
    
    // Reset form
    setNewProgram({
      title: '',
      description: '',
      subject: '',
      category: '',
      language: 'python',
      timeEstimate: '',
      concepts: '',
      startingCode: '',
      solutionCode: '',
      expectedOutput: '',
      tips: ''
    });
    setShowCreateForm(false);
    toast.success('Program created successfully!');
  };

  const handleUpdateProgram = async () => {
    if (!editingProgram) return;

    const updatedPrograms = programs.map(p => 
      p.id === editingProgram.id ? editingProgram : p
    );
    
    await savePrograms(updatedPrograms);
    setEditingProgram(null);
    toast.success('Program updated successfully!');
  };

  const handleDeleteProgram = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      const updatedPrograms = programs.filter(p => p.id !== id);
      await savePrograms(updatedPrograms);
      toast.success('Program deleted successfully!');
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = !filterSubject || program.subject === filterSubject;
    const matchesLanguage = !filterLanguage || program.language === filterLanguage;
    
    return matchesSearch && matchesSubject && matchesLanguage;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading programs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Code className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lab Programs Manager</h2>
                <p className="text-gray-600">Manage programming exercises and lab content</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Program</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">{filteredPrograms.length}</span> programs found
            </div>
          </div>
        </div>

        {/* Programs List */}
        <div className="p-6">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-12">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No programs found. Create your first program!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPrograms.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {program.language.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{program.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Subject: {program.subject}</span>
                        <span>Category: {program.category}</span>
                        <span>Time: {program.timeEstimate}</span>
                      </div>
                      {program.concepts.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {program.concepts.map((concept, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                {concept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingProgram(program)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Program"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgram(program.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Program"
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

      {/* Create Program Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create New Program</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={newProgram.title}
                    onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter program title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Estimate</label>
                  <input
                    type="text"
                    value={newProgram.timeEstimate}
                    onChange={(e) => setNewProgram({...newProgram, timeEstimate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 15 minutes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what this program teaches"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={newProgram.subject}
                    onChange={(e) => setNewProgram({...newProgram, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Subject</option>
                    {SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={newProgram.category}
                    onChange={(e) => setNewProgram({...newProgram, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={newProgram.language}
                    onChange={(e) => setNewProgram({...newProgram, language: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Concepts (comma-separated)</label>
                <input
                  type="text"
                  value={newProgram.concepts}
                  onChange={(e) => setNewProgram({...newProgram, concepts: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., arrays, loops, functions"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Code *</label>
                <textarea
                  value={newProgram.startingCode}
                  onChange={(e) => setNewProgram({...newProgram, startingCode: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter the starting code template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solution Code</label>
                <textarea
                  value={newProgram.solutionCode}
                  onChange={(e) => setNewProgram({...newProgram, solutionCode: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter the complete solution"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                <textarea
                  value={newProgram.expectedOutput}
                  onChange={(e) => setNewProgram({...newProgram, expectedOutput: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Enter the expected program output"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tips (one per line)</label>
                <textarea
                  value={newProgram.tips}
                  onChange={(e) => setNewProgram({...newProgram, tips: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter helpful tips for students"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProgram}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Create Program</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal - Similar to create but with editingProgram data */}
      {editingProgram && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit Program</h3>
                <button
                  onClick={() => setEditingProgram(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={editingProgram.title}
                    onChange={(e) => setEditingProgram({...editingProgram, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Estimate</label>
                  <input
                    type="text"
                    value={editingProgram.timeEstimate}
                    onChange={(e) => setEditingProgram({...editingProgram, timeEstimate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({...editingProgram, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select
                    value={editingProgram.subject}
                    onChange={(e) => setEditingProgram({...editingProgram, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SUBJECTS.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={editingProgram.category}
                    onChange={(e) => setEditingProgram({...editingProgram, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={editingProgram.language}
                    onChange={(e) => setEditingProgram({...editingProgram, language: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Concepts</label>
                <input
                  type="text"
                  value={editingProgram.concepts.join(', ')}
                  onChange={(e) => setEditingProgram({
                    ...editingProgram, 
                    concepts: e.target.value.split(',').map(c => c.trim()).filter(c => c)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Starting Code *</label>
                <textarea
                  value={editingProgram.startingCode}
                  onChange={(e) => setEditingProgram({...editingProgram, startingCode: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solution Code</label>
                <textarea
                  value={editingProgram.solutionCode}
                  onChange={(e) => setEditingProgram({...editingProgram, solutionCode: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Output</label>
                <textarea
                  value={editingProgram.expectedOutput}
                  onChange={(e) => setEditingProgram({...editingProgram, expectedOutput: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tips</label>
                <textarea
                  value={editingProgram.tips.join('\n')}
                  onChange={(e) => setEditingProgram({
                    ...editingProgram, 
                    tips: e.target.value.split('\n').filter(t => t.trim())
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setEditingProgram(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProgram}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLabManager;
