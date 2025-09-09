import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RefreshCw, Info, Sun, Moon } from 'lucide-react';
import CodeEditor from './CodeEditor';
import CodeRunner from './CodeRunner';

interface Program {
  id: string;
  title: string;
  description: string;
  language: 'c' | 'cpp' | 'python';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  code: string;
  expectedOutput?: string;
  concepts: string[];
}

interface ProgramEditorProps {
  program: Program;
  onBack: () => void;
}

const ProgramEditor: React.FC<ProgramEditorProps> = ({ program, onBack }) => {
  const [currentCode, setCurrentCode] = useState(program.code);
  const [isDirty, setIsDirty] = useState(false);
  const [savedCode, setSavedCode] = useState(program.code);
  const [editorTheme, setEditorTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setCurrentCode(program.code);
    setSavedCode(program.code);
    setIsDirty(false);
  }, [program]);

  useEffect(() => {
    setIsDirty(currentCode !== savedCode);
  }, [currentCode, savedCode]);

  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
  };

  const handleSave = () => {
    setSavedCode(currentCode);
    setIsDirty(false);
    // Here you could save to localStorage or send to backend
    localStorage.setItem(`program_${program.id}`, currentCode);
  };

  const handleReset = () => {
    setCurrentCode(program.code);
    setIsDirty(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'c':
        return 'bg-blue-100 text-blue-800';
      case 'cpp':
        return 'bg-purple-100 text-purple-800';
      case 'python':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load saved code from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem(`program_${program.id}`);
    if (saved && saved !== program.code) {
      setCurrentCode(saved);
      setSavedCode(saved);
    }
  }, [program.id, program.code]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Programs</span>
              </button>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {program.title}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(program.language)}`}>
                    {program.language.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {program.estimatedTime}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isDirty && (
                <span className="text-sm text-orange-600 font-medium">
                  Unsaved changes
                </span>
              )}
              
              <button
                onClick={() => setEditorTheme(editorTheme === 'light' ? 'dark' : 'light')}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                title={`Switch to ${editorTheme === 'light' ? 'dark' : 'light'} theme`}
              >
                {editorTheme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span className="hidden sm:inline">
                  {editorTheme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                <span>Save</span>
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Code Editor */}
          <div className="space-y-4">
            {/* Program Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start space-x-3">
                <Info className="text-blue-600 mt-1" size={20} />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Problem Description
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {program.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-500 mr-2">Concepts:</span>
                    {program.concepts.map((concept) => (
                      <span
                        key={concept}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Editor */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Code Editor</h3>
              </div>
              <div className="p-4">
                <CodeEditor
                  value={currentCode}
                  onChange={handleCodeChange}
                  language={program.language}
                  theme={editorTheme}
                />
              </div>
            </div>
          </div>

          {/* Right Panel - Code Runner */}
          <div className="space-y-4">
            <CodeRunner
              code={currentCode}
              language={program.language}
              onReset={handleReset}
              expectedOutput={program.expectedOutput}
            />

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                {program.language === 'python' && (
                  <>
                    <li>• Python code runs in a real Python environment using Pyodide</li>
                    <li>• Use print() to see output in the console</li>
                    <li>• Most Python standard library functions are available</li>
                  </>
                )}
                {(program.language === 'c' || program.language === 'cpp') && (
                  <>
                    <li>• C code execution is simulated for demonstration</li>
                    <li>• Use printf() statements to see output</li>
                    <li>• Focus on logic and algorithm implementation</li>
                  </>
                )}
                <li>• Save your progress regularly</li>
                <li>• Compare your output with the expected result</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramEditor;
