import React, { useState, useEffect } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { LabSubject, LabCode, ProgrammingLanguage } from '@semprepzie/shared';
import CodeEditor from './CodeEditor';
import { Play, BookOpen, Code, Terminal, Settings, ArrowLeft, Copy, Check } from 'lucide-react';

interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

const LabSection: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [subjects, setSubjects] = useState<LabSubject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<LabSubject | null>(null);
  const [selectedCode, setSelectedCode] = useState<LabCode | null>(null);
  const [currentCode, setCurrentCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'subjects' | 'codes' | 'editor'>('subjects');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load subjects on component mount
  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lab/subjects', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setSubjects(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeCode = async () => {
    if (!selectedCode || !currentCode.trim()) return;

    setIsExecuting(true);
    setExecutionResult(null);
    setOutput('');

    try {
      const response = await fetch('/api/lab/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          code: currentCode,
          language: selectedCode.language,
          input: input
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setExecutionResult(result.data);
        setOutput(result.data.output || result.data.error || 'No output');
      } else {
        setOutput(`Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const selectSubject = (subject: LabSubject) => {
    setSelectedSubject(subject);
    setView('codes');
  };

  const selectCode = (code: LabCode) => {
    setSelectedCode(code);
    setCurrentCode(code.code);
    setInput('');
    setOutput('');
    setExecutionResult(null);
    setView('editor');
  };

  const goBack = () => {
    if (view === 'editor') {
      setView('codes');
      setSelectedCode(null);
    } else if (view === 'codes') {
      setView('subjects');
      setSelectedSubject(null);
    }
  };

  // Admin Panel Component
  const AdminPanel: React.FC = () => {
    const [newSubject, setNewSubject] = useState({
      name: '',
      description: '',
      language: 'python' as ProgrammingLanguage
    });
    const [newCode, setNewCode] = useState({
      title: '',
      description: '',
      code: '',
      language: 'python' as ProgrammingLanguage,
      tags: '',
      isTemplate: false
    });

    const createSubject = async () => {
      try {
        const response = await fetch('/api/lab/subjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(newSubject)
        });

        if (response.ok) {
          setNewSubject({ name: '', description: '', language: 'python' });
          loadSubjects();
        }
      } catch (error) {
        console.error('Failed to create subject:', error);
      }
    };

    const saveCode = async () => {
      if (!selectedSubject) return;

      try {
        const response = await fetch('/api/lab/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            ...newCode,
            subjectId: selectedSubject.id,
            tags: newCode.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          })
        });

        if (response.ok) {
          setNewCode({
            title: '',
            description: '',
            code: '',
            language: 'python',
            tags: '',
            isTemplate: false
          });
          loadSubjects();
        }
      } catch (error) {
        console.error('Failed to save code:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Admin Panel</h2>
            <button
              onClick={() => setShowAdminPanel(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Create Subject */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Create New Subject</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Subject Name"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                placeholder="Subject Description"
                value={newSubject.description}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
                className="w-full p-3 border rounded-lg h-24"
              />
              <select
                value={newSubject.language}
                onChange={(e) => setNewSubject({ ...newSubject, language: e.target.value as ProgrammingLanguage })}
                className="w-full p-3 border rounded-lg"
              >
                <option value="python">Python</option>
                <option value="c">C</option>
                <option value="java">Java</option>
              </select>
              <button
                onClick={createSubject}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
              >
                Create Subject
              </button>
            </div>
          </div>

          {/* Add Code to Subject */}
          {selectedSubject && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Add Code to "{selectedSubject.name}"</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Code Title"
                  value={newCode.title}
                  onChange={(e) => setNewCode({ ...newCode, title: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <textarea
                  placeholder="Code Description"
                  value={newCode.description}
                  onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                  className="w-full p-3 border rounded-lg h-20"
                />
                <textarea
                  placeholder="Code Content"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                  className="w-full p-3 border rounded-lg h-32 font-mono"
                />
                <input
                  type="text"
                  placeholder="Tags (comma-separated)"
                  value={newCode.tags}
                  onChange={(e) => setNewCode({ ...newCode, tags: e.target.value })}
                  className="w-full p-3 border rounded-lg"
                />
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTemplate"
                    checked={newCode.isTemplate}
                    onChange={(e) => setNewCode({ ...newCode, isTemplate: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isTemplate">Is Template</label>
                </div>
                <button
                  onClick={saveCode}
                  className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
                >
                  Save Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading Lab...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {view !== 'subjects' && (
              <button
                onClick={goBack}
                className="flex items-center text-blue-400 hover:text-blue-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            )}
            <div className="flex items-center space-x-2">
              <Terminal className="w-6 h-6 text-blue-400" />
              <h1 className="text-2xl font-bold">
                {view === 'subjects' && 'Programming Lab'}
                {view === 'codes' && selectedSubject?.name}
                {view === 'editor' && selectedCode?.title}
              </h1>
            </div>
          </div>
          
          {isAdmin && (
            <button
              onClick={() => setShowAdminPanel(true)}
              className="flex items-center bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg"
            >
              <Settings className="w-5 h-5 mr-2" />
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {view === 'subjects' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => selectSubject(subject)}
                  className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-600"
                >
                  <div className="flex items-center mb-4">
                    <BookOpen className="w-8 h-8 text-blue-400 mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold">{subject.name}</h3>
                      <span className="text-sm text-gray-400 uppercase font-mono">
                        {subject.language}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{subject.description}</p>
                  <div className="flex items-center text-sm text-gray-400">
                    <Code className="w-4 h-4 mr-2" />
                    {subject.codes?.length || 0} programs
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'codes' && selectedSubject && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedSubject.codes?.map((code) => (
                <div
                  key={code.id}
                  onClick={() => selectCode(code)}
                  className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">{code.title}</h3>
                    <span className="text-xs bg-blue-600 px-2 py-1 rounded uppercase font-mono">
                      {code.language}
                    </span>
                  </div>
                  {code.description && (
                    <p className="text-gray-300 mb-4">{code.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {code.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )) || (
                <div className="col-span-full text-center py-12">
                  <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No programs available yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'editor' && selectedCode && (
          <div className="flex h-screen">
            {/* Editor Panel */}
            <div className="flex-1 flex flex-col">
              {/* Editor Toolbar */}
              <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">
                      Language: <span className="text-white font-mono uppercase">{selectedCode.language}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyCode}
                      className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
                        copied 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={executeCode}
                      disabled={isExecuting}
                      className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {isExecuting ? 'Running...' : 'Run Code'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 p-4">
                <CodeEditor
                  value={currentCode}
                  onChange={setCurrentCode}
                  language={selectedCode.language}
                  theme="dark"
                  readOnly={false}
                />
              </div>
            </div>

            {/* Output Panel */}
            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
              {/* Input Section */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Input:</h3>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter input for your program..."
                  className="w-full h-20 bg-gray-900 border border-gray-600 rounded p-2 text-sm font-mono text-white resize-none"
                />
              </div>

              {/* Output Section */}
              <div className="flex-1 p-4">
                <h3 className="text-sm font-semibold mb-2 text-gray-300">Output:</h3>
                <div className="bg-gray-900 border border-gray-600 rounded p-3 h-full overflow-auto">
                  {isExecuting ? (
                    <div className="flex items-center text-yellow-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                      Executing...
                    </div>
                  ) : (
                    <pre className={`text-sm font-mono whitespace-pre-wrap ${
                      executionResult?.success === false ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {output || 'Run your code to see the output here.'}
                    </pre>
                  )}
                  
                  {executionResult && (
                    <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                      Execution time: {executionResult.executionTime}ms
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && <AdminPanel />}
    </div>
  );
};

export default LabSection;
