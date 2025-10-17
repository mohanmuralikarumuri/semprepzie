import React, { useState, useEffect } from 'react';
import { Code, Terminal, ArrowLeft, Zap } from 'lucide-react';
import { codeExecutionService } from '../services/codeExecution';
import NeoGlassEditorCodeMirror from './NeoGlassEditorCodeMirror';
import PracticeEditor from './PracticeEditor';
import { supabase } from '../config/supabase';

// Define types
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

interface LabSectionProps {
  darkMode?: boolean;
  onEditorStateChange?: (isInEditor: boolean) => void;
}

const LabSection: React.FC<LabSectionProps> = ({ darkMode = false, onEditorStateChange }) => {
  const [labSubjects, setLabSubjects] = useState<LabSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<LabSubject | null>(null);
  const [programs, setPrograms] = useState<LabProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<LabProgram | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [view, setView] = useState<'subjects' | 'programs' | 'editor' | 'practice'>('subjects');

  // Load lab subjects from database on mount
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        setLoadingSubjects(true);
        
        // Query Supabase directly
        const { data, error } = await supabase
          .from('lab_subjects')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Supabase error:', error);
          throw new Error('Failed to fetch subjects');
        }

        if (data) {
          setLabSubjects(data);
        }
      } catch (error) {
        console.error('Failed to load subjects:', error);
      } finally {
        setLoadingSubjects(false);
      }
    };

    loadSubjects();
  }, []);

  // Notify parent when editor view changes
  useEffect(() => {
    if (onEditorStateChange) {
      onEditorStateChange(view === 'editor' || view === 'practice');
    }
  }, [view, onEditorStateChange]);

  // Load programs when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      loadPrograms(selectedSubject.code);
    }
  }, [selectedSubject]);

  // Auto-load sample input when program is selected
  useEffect(() => {
    if (selectedProgram && selectedProgram.sample_input) {
      setInput(selectedProgram.sample_input);
    }
  }, [selectedProgram]);

  const loadPrograms = async (subjectCode: string) => {
    try {
      setLoading(true);
      
      // Query Supabase directly
      const { data, error } = await supabase
        .from('lab_programs')
        .select('*')
        .eq('subject_code', subjectCode)
        .order('program_name', { ascending: true });
      
      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Failed to fetch programs');
      }

      if (data) {
        setPrograms(data);
      }
    } catch (error) {
      console.error('Failed to load programs:', error);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const executeCode = async () => {
    if (!selectedProgram || !currentCode.trim()) return;

    setIsExecuting(true);
    setOutput('');

    try {
      const result = await codeExecutionService.executeCode({
        language: selectedProgram.language,
        code: currentCode,
        stdin: input
      });
      
      if (result.success) {
        let formattedOutput = '';
        if (input.trim()) {
          formattedOutput = `Input:\n${input}\n\n`;
        }
        formattedOutput += `Output:\n${result.output || 'Program executed successfully (no output)'}`;
        setOutput(formattedOutput);
      } else {
        setOutput(`Error: ${result.error || 'Execution failed'}`);
      }
    } catch (error) {
      setOutput(`Execution Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const selectSubject = (subject: LabSubject) => {
    setSelectedSubject(subject);
    setView('programs');
  };

  const selectProgram = (program: LabProgram) => {
    setSelectedProgram(program);
    setCurrentCode(program.code);
    setInput(program.sample_input || ''); // Auto-load sample input
    setOutput('');
    setView('editor');
  };

  const openPracticeMode = () => {
    setView('practice');
  };

  const goBack = () => {
    if (view === 'editor') {
      setView('programs');
      setSelectedProgram(null);
    } else if (view === 'programs') {
      setView('subjects');
      setSelectedSubject(null);
      setPrograms([]);
    } else if (view === 'practice') {
      setView('subjects');
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy': return darkMode ? 'text-green-400' : 'text-green-600';
      case 'medium': return darkMode ? 'text-yellow-400' : 'text-yellow-600';
      case 'hard': return darkMode ? 'text-red-400' : 'text-red-600';
      default: return darkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      {view !== 'editor' && view !== 'practice' && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
          <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                {view !== 'subjects' && (
                  <button
                    onClick={goBack}
                    className={`flex items-center ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors flex-shrink-0`}
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    <span className="text-sm sm:text-base">Back</span>
                  </button>
                )}
                <div className="flex items-center space-x-2 min-w-0">
                  <Terminal className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h1 className="text-lg sm:text-2xl font-bold truncate">
                    {view === 'subjects' && 'Programming Lab'}
                    {view === 'programs' && selectedSubject?.name}
                  </h1>
                </div>
              </div>
              
              {/* Practice Button - Show on subjects view */}
              {view === 'subjects' && (
                <button
                  onClick={openPracticeMode}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    darkMode 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  <span className="hidden sm:inline">Practice</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {/* Subjects View */}
        {view === 'subjects' && (
          <div className="p-3 sm:p-6">
            {loadingSubjects ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className={`inline-block animate-spin rounded-full h-12 w-12 border-b-2 ${darkMode ? 'border-blue-400' : 'border-blue-600'}`}></div>
                  <p className={`mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading subjects...</p>
                </div>
              </div>
            ) : labSubjects.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Terminal className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No lab subjects available</p>
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Contact admin to add subjects</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {labSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    onClick={() => selectSubject(subject)}
                    className={`rounded-lg p-4 sm:p-6 cursor-pointer transition-all transform hover:scale-105 border ${
                      darkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' 
                        : 'bg-white hover:bg-gray-50 border-gray-200 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="text-4xl sm:text-5xl mr-3 sm:mr-4">{subject.icon}</span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-semibold">{subject.name}</h3>
                        <span className={`text-xs sm:text-sm uppercase font-mono ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {subject.code.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subject.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Programs View */}
        {view === 'programs' && (
          <div className="p-3 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : programs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => selectProgram(program)}
                    className={`rounded-lg p-4 sm:p-6 cursor-pointer transition-colors border ${
                      darkMode 
                        ? 'bg-gray-800 hover:bg-gray-700 border-gray-600' 
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 gap-2">
                      <h3 className="text-base sm:text-lg font-semibold flex-1 min-w-0">{program.program_name}</h3>
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded uppercase font-mono text-white flex-shrink-0">
                        {program.language}
                      </span>
                    </div>
                    {program.description && (
                      <p className={`mb-3 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{program.description}</p>
                    )}
                    {program.difficulty && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold uppercase ${getDifficultyColor(program.difficulty)}`}>
                          {program.difficulty}
                        </span>
                        {program.sample_input && (
                          <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            • Sample input included
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Code className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No programs available for this subject yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Editor View */}
        {view === 'editor' && selectedProgram && (
          <NeoGlassEditorCodeMirror
            value={currentCode}
            onChange={setCurrentCode}
            language={selectedProgram.language}
            darkMode={darkMode}
            onRun={async (code, inputText) => {
              setCurrentCode(code);
              setInput(inputText);
              await executeCode();
            }}
            isExecuting={isExecuting}
            output={output}
            onBack={goBack}
            title={selectedProgram.program_name}
            originalCode={selectedProgram.code}
          />
        )}

        {/* Practice Mode */}
        {view === 'practice' && (
          <PracticeEditor
            darkMode={darkMode}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
};

export default LabSection;
