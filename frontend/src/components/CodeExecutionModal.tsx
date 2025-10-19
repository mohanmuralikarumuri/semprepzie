import React from 'react';
import { X } from 'lucide-react';
import HtmlCssJsRunner from './HtmlCssJsRunner';
import ReactRunner from './ReactRunner';

interface CodeExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  htmlCode?: string;
  cssCode?: string;
  jsCode?: string;
  reactCode?: string;
  darkMode?: boolean;
}

const CodeExecutionModal: React.FC<CodeExecutionModalProps> = ({
  isOpen,
  onClose,
  language,
  htmlCode = '',
  cssCode = '',
  jsCode = '',
  reactCode = '',
  darkMode = false
}) => {
  if (!isOpen) return null;

  const renderExecutor = () => {
    // React execution
    if (language.toLowerCase() === 'react' || language.toLowerCase() === 'jsx') {
      return (
        <ReactRunner
          code={reactCode || jsCode}
          autoRun={true}
        />
      );
    }

    // HTML/CSS/JS execution
    if (['html', 'css', 'javascript', 'js', 'web'].includes(language.toLowerCase())) {
      return (
        <HtmlCssJsRunner
          html={htmlCode}
          css={cssCode}
          js={jsCode}
          autoRun={true}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className={`text-lg mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Execution for {language} is not supported in this view
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Please use the backend execution system
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative h-full flex items-center justify-center p-2 sm:p-4">
        <div className={`relative w-full h-full max-w-7xl max-h-full rounded-lg shadow-2xl overflow-hidden ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 border-b ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            <h2 className={`text-lg sm:text-xl font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Code Execution - {language.toUpperCase()}
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Executor Content */}
          <div className="h-[calc(100%-4rem)] overflow-hidden">
            {renderExecutor()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeExecutionModal;
