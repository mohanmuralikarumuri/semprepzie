import React, { useState } from 'react';
import { Play, RotateCcw, Copy, Download } from 'lucide-react';
import { codeExecutionService } from '../services/codeExecution';
import toast from 'react-hot-toast';

interface CodeRunnerProps {
  code: string;
  language: 'c' | 'cpp' | 'python';
  onReset: () => void;
  expectedOutput?: string;
}

const CodeRunner: React.FC<CodeRunnerProps> = ({
  code,
  language,
  onReset,
  expectedOutput,
}) => {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runCode = async () => {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');

    try {
      // Initialize Python environment if needed
      if (language === 'python') {
        toast.loading('Initializing Python environment...', { id: 'python-init' });
        await codeExecutionService.initializePyodide();
        toast.dismiss('python-init');
      }

      const result = await codeExecutionService.executeCode(language, code);
      
      if (result.error) {
        setError(result.error);
        toast.error('Code execution failed');
      } else {
        setOutput(result.output);
        setHasRun(true);
        toast.success('Code executed successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the code');
      toast.error('Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast.success('Output copied to clipboard');
    }
  };

  const downloadOutput = () => {
    if (output) {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `output_${language}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Output downloaded');
    }
  };

  const resetCode = () => {
    setOutput('');
    setError('');
    setHasRun(false);
    onReset();
    toast.success('Code reset to original');
  };

  const getLanguageDisplay = () => {
    switch (language) {
      case 'c':
        return 'C';
      case 'cpp':
        return 'C++';
      case 'python':
        return 'Python';
      default:
        return (language as string).toUpperCase();
    }
  };

  return (
    <div className="code-runner bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-gray-700">
              {getLanguageDisplay()} Console
            </div>
            {language === 'python' && (
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Pyodide Runtime
              </div>
            )}
            {(language === 'c' || language === 'cpp') && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Simulated Execution
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play size={16} />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
            
            <button
              onClick={resetCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="p-4">
        {isRunning && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <div className="text-gray-600">
                {language === 'python' ? 'Executing Python code...' : 'Processing code...'}
              </div>
            </div>
          </div>
        )}

        {!isRunning && !hasRun && !error && (
          <div className="text-center py-8 text-gray-500">
            <Play size={32} className="mx-auto mb-3 text-gray-400" />
            <div>Click "Run Code" to execute your program</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-red-800 font-medium">Execution Error</h4>
            </div>
            <pre className="text-red-700 text-sm whitespace-pre-wrap font-mono">
              {error}
            </pre>
          </div>
        )}

        {output && (
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-800 font-medium">Output</h4>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyOutput}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Copy output"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={downloadOutput}
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title="Download output"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <pre className="text-gray-800 text-sm whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                {output}
              </pre>
            </div>

            {expectedOutput && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-800 font-medium mb-2">Expected Output</h4>
                <pre className="text-blue-700 text-sm whitespace-pre-wrap font-mono">
                  {expectedOutput.replace(/\\n/g, '\n')}
                </pre>
                <div className="mt-2 text-xs text-blue-600">
                  Compare your output with the expected result above
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRunner;
