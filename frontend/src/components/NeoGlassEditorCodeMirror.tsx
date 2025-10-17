import React, { useState, useEffect } from 'react';
import { Play, Copy, Save, RotateCcw, Check, ArrowLeft, Sun, Moon, Type } from 'lucide-react';
import jsPDF from 'jspdf';
import CodeEditor from './CodeEditor';

interface NeoGlassEditorCodeMirrorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'c' | 'cpp' | 'python' | 'java';
  darkMode?: boolean;
  onRun: (code: string, input: string) => Promise<void>;
  isExecuting?: boolean;
  output?: string;
  onBack?: () => void;
  title?: string;
  originalCode?: string; // Template/starting code
  // Practice mode props
  showLanguageSelector?: boolean;
  onLanguageChange?: (language: 'c' | 'cpp' | 'python' | 'java') => void;
  availableLanguages?: ('c' | 'cpp' | 'python' | 'java')[];
}

const NeoGlassEditorCodeMirror: React.FC<NeoGlassEditorCodeMirrorProps> = ({
  value,
  onChange,
  language,
  darkMode = false,
  onRun,
  isExecuting = false,
  output = '',
  onBack,
  title = 'Code Editor',
  originalCode = '', // Default to empty if not provided
  showLanguageSelector = false,
  onLanguageChange,
  availableLanguages = ['c', 'cpp', 'python', 'java']
}) => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [fontSize, setFontSize] = useState(14);

  // Load saved code from localStorage on component mount
  useEffect(() => {
    const savedCode = localStorage.getItem(`saved_code_${language}_${title}`);
    const savedInput = localStorage.getItem(`saved_input_${language}_${title}`);
    
    if (savedCode && savedCode.trim()) {
      onChange(savedCode);
    }
    
    if (savedInput && savedInput.trim()) {
      setInput(savedInput);
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSave = () => {
    // Ask user what they want to do
    const userChoice = window.confirm(
      'Choose your save option:\n\n' +
      'Click "OK" to SAVE to browser (localStorage)\n' +
      'Click "Cancel" to DOWNLOAD PDF'
    );

    if (userChoice) {
      // User chose to save to localStorage only
      try {
        localStorage.setItem(`saved_code_${language}_${title}`, value);
        localStorage.setItem(`saved_input_${language}_${title}`, input);
        
        // Show success feedback
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (error) {
        console.error('Failed to save:', error);
        alert('Failed to save to browser. Please try again.');
      }
      return;
    }

    // User chose to download PDF
    try {
      // Also save to localStorage when downloading PDF
      localStorage.setItem(`saved_code_${language}_${title}`, value);
      localStorage.setItem(`saved_input_${language}_${title}`, input);

      // Create new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let yPosition = margin;

      // Add Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Add Language Badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Language: ${getLanguageLabel()}`, margin, yPosition);
      yPosition += 10;

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add Program Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Program:', margin, yPosition);
      yPosition += 8;

      // Add program code with monospace-like formatting
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      const codeLines = value.split('\n');
      codeLines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        // Replace tabs with spaces for better PDF rendering
        const formattedLine = line.replace(/\t/g, '    ');
        doc.text(formattedLine || ' ', margin, yPosition);
        yPosition += 5;
      });
      yPosition += 10;

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add Input Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Input:', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      if (input.trim()) {
        const inputLines = input.split('\n');
        inputLines.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line || ' ', margin, yPosition);
          yPosition += 5;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('(No input provided)', margin, yPosition);
        yPosition += 5;
      }
      yPosition += 10;

      // Add horizontal line
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Add Output Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Output:', margin, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('courier', 'normal');
      if (output.trim()) {
        const outputLines = output.split('\n');
        outputLines.forEach((line) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line || ' ', margin, yPosition);
          yPosition += 5;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('(No output yet - Run the program to see output)', margin, yPosition);
      }

      // Generate filename
      const languageExt = language === 'c' ? 'c' : language === 'cpp' ? 'cpp' : 'py';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${title.replace(/\s+/g, '_')}_${languageExt}_${timestamp}.pdf`;

      // Save the PDF
      doc.save(filename);

      // Show success feedback
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleClear = () => {
    // Reset to original template code
    onChange(originalCode);
    setInput('');
  };

  const handleRun = async () => {
    await onRun(value, input);
  };

  const getLanguageLabel = () => {
    switch (language) {
      case 'c': return 'C';
      case 'cpp': return 'C++';
      case 'python': return 'Python';
    }
  };

  const isOutputError = output.startsWith('Error') || output.startsWith('Execution Error');

  return (
    <div className={`min-h-screen relative ${localDarkMode ? 'bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${localDarkMode ? 'bg-blue-500/10' : 'bg-indigo-400/20'} animate-float`}
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-2 max-w-7xl">
        
        {/* Navigation Bar - Back Button + Title + Theme Toggle */}
        <div className={`rounded-2xl shadow-xl mb-4 transition-all duration-300 backdrop-blur-xl ${
          localDarkMode 
            ? 'bg-gradient-to-br from-gray-950/95 via-indigo-950/95 to-gray-900/95 border border-white/10' 
            : 'bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-purple-50/95 border border-gray-200/50 shadow-2xl'
        }`}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            {onBack && (
              <button
                onClick={onBack}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 ${
                  localDarkMode
                    ? 'bg-white/10 hover:bg-white/20 text-white'
                    : 'bg-white/60 hover:bg-white/80 text-gray-900 shadow-md'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline text-sm font-medium">Back</span>
              </button>
            )}
            
            <div className={`flex-1 mx-4 text-center ${localDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate">
                {title}
              </h1>
            </div>

            <button
              onClick={() => setLocalDarkMode(!localDarkMode)}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                localDarkMode
                  ? 'bg-white/10 hover:bg-white/20 text-yellow-300'
                  : 'bg-white/60 hover:bg-white/80 text-gray-700 shadow-md'
              }`}
              title="Toggle Theme"
            >
              {localDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Editor Container - Glassmorphism with Toolbar on Top */}
        <div className={`rounded-2xl shadow-2xl overflow-hidden ${
          localDarkMode
            ? 'bg-white/5 backdrop-blur-2xl border border-white/10'
            : 'bg-white/40 backdrop-blur-2xl border border-white/50 shadow-xl'
        }`}>
          
          {/* Toolbar - Language Badge/Dropdown + Action Buttons */}
          <div className={`flex items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-b ${
            localDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200/50 bg-white/30'
          }`}>
            {/* Language Badge or Dropdown (Practice Mode) */}
            {showLanguageSelector && onLanguageChange ? (
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as 'c' | 'cpp' | 'python' | 'java')}
                className={`px-3 py-1.5 rounded-lg font-mono font-semibold text-xs sm:text-sm shrink-0 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  localDarkMode
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400/30'
                    : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-300'
                }`}
              >
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang} className={localDarkMode ? 'bg-gray-800' : 'bg-white'}>
                    {lang === 'c' ? 'C' : lang === 'cpp' ? 'C++' : lang === 'python' ? 'Python' : 'Java'}
                  </option>
                ))}
              </select>
            ) : (
              <span className={`px-3 py-1.5 rounded-lg font-mono font-semibold text-xs sm:text-sm shrink-0 ${
                localDarkMode
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-400/30'
                  : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-300'
              }`}>
                {getLanguageLabel()}
              </span>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
              {/* Run Button - Animated */}
              <button
                onClick={handleRun}
                disabled={isExecuting}
                className={`flex items-center gap-1.5 px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 shrink-0 ${
                  isExecuting
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/50'
                } text-white`}
                title="Run Code"
              >
                <Play className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isExecuting ? 'animate-spin' : ''}`} fill="currentColor" />
                <span className="hidden sm:inline">{isExecuting ? 'Running...' : 'Run'}</span>
              </button>

              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105 shrink-0 ${
                  copied
                    ? 'bg-green-500 text-white shadow-lg'
                    : localDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/60 hover:bg-white/90 text-gray-700 shadow-md'
                }`}
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
              </button>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105 shrink-0 ${
                  saved
                    ? 'bg-blue-500 text-white shadow-lg'
                    : localDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/60 hover:bg-white/90 text-gray-700 shadow-md'
                }`}
                title="Save Code"
              >
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Clear Button */}
              <button
                onClick={handleClear}
                className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 hover:scale-105 shrink-0 ${
                  localDarkMode
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                    : 'bg-red-100 hover:bg-red-200 text-red-600 shadow-md'
                }`}
                title="Clear All"
              >
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Divider */}
              <div className={`h-6 w-px shrink-0 ${localDarkMode ? 'bg-white/20' : 'bg-gray-300'}`} />

              {/* Font Size Selector */}
              <div className="relative shrink-0">
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 appearance-none cursor-pointer pr-6 sm:pr-8 ${
                    localDarkMode
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 [&>option]:bg-gray-900 [&>option]:text-white'
                      : 'bg-white/60 hover:bg-white/90 text-gray-700 border border-gray-300 shadow-md [&>option]:bg-white [&>option]:text-gray-900'
                  }`}
                  title="Font Size"
                >
                  <option value="10">10px</option>
                  <option value="12">12px</option>
                  <option value="14">14px</option>
                  <option value="16">16px</option>
                  <option value="18">18px</option>
                  <option value="20">20px</option>
                  <option value="22">22px</option>
                  <option value="24">24px</option>
                </select>
                <Type className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-3.5 sm:h-3.5 pointer-events-none ${
                  localDarkMode ? 'text-white/60' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>
          
          {/* Code Editor with Glow Border on Focus */}
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-focus-within:opacity-20 blur-xl transition-opacity duration-500 pointer-events-none`} />
            <div style={{ height: '70vh', minHeight: '400px' }} className="relative overflow-hidden rounded-xl">
              <CodeEditor
                value={value}
                onChange={onChange}
                language={language}
                theme={localDarkMode ? 'dark' : 'light'}
                readOnly={false}
                fontSize={fontSize}
              />
            </div>
          </div>

          {/* Input/Output Section */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-6 border-t ${
            localDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200/50 bg-white/30'
          }`}>
            {/* Input Section */}
            <div className="relative group">
              <label className={`block text-sm font-semibold mb-2 ${
                localDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Input (stdin)
              </label>
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity duration-500 rounded-xl pointer-events-none`} />
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here..."
                className={`w-full h-40 sm:h-48 p-4 rounded-xl font-mono text-sm resize-none transition-all duration-300 focus:ring-2 focus:outline-none relative ${
                  localDarkMode
                    ? 'bg-black/30 text-white placeholder-gray-500 border border-white/10 focus:border-blue-400/50 focus:ring-blue-400/30'
                    : 'bg-white/50 text-gray-900 placeholder-gray-400 border border-gray-200 focus:border-blue-400 focus:ring-blue-400/30 shadow-inner'
                }`}
                spellCheck={false}
              />
            </div>

            {/* Output Section */}
            <div className="relative group">
              <label className={`block text-sm font-semibold mb-2 ${
                localDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Output
              </label>
              <div className={`absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 ${output ? 'opacity-10' : ''} blur-xl transition-opacity duration-500 rounded-xl pointer-events-none`} />
              <div className={`w-full h-40 sm:h-48 p-4 rounded-xl font-mono text-sm overflow-auto relative ${
                localDarkMode
                  ? 'bg-black/30 border border-white/10'
                  : 'bg-white/50 border border-gray-200 shadow-inner'
              }`}>
                {output ? (
                  <pre className={`whitespace-pre-wrap ${
                    isOutputError
                      ? 'text-red-400'
                      : localDarkMode
                        ? 'text-green-400'
                        : 'text-green-600'
                  }`}>
                    {output}
                  </pre>
                ) : (
                  <span className={localDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                    {isExecuting ? 'Executing...' : 'Output will appear here after running your code'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Banner */}
        {output && !isExecuting && (
          <div className={`mt-6 p-4 rounded-xl backdrop-blur-lg flex items-center gap-3 animate-fadeIn ${
            isOutputError
              ? localDarkMode
                ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                : 'bg-red-50 border border-red-200 text-red-600'
              : localDarkMode
                ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                : 'bg-green-50 border border-green-200 text-green-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isOutputError ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
            <span className="font-medium">
              {isOutputError ? '⚠️ Execution failed' : '✓ Code executed successfully'}
            </span>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NeoGlassEditorCodeMirror;
