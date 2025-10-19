import React, { useState, useEffect } from 'react';
import { codeExecutionService } from '../services/codeExecution';
import NeoGlassEditorCodeMirror from './NeoGlassEditorCodeMirror';

interface PracticeEditorProps {
  darkMode?: boolean;
  onBack: () => void;
}

// Code snippets for different languages
const CODE_SNIPPETS: Record<'c' | 'cpp' | 'python' | 'java' | 'html' | 'css' | 'javascript' | 'react', string> = {
  c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  python: `# Python program
print("Hello, World!")`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  html: `<!DOCTYPE html>
<html>
<head>
    <title>Hello World</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>`,
  css: `body {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    color: #333;
}

h1 {
    color: #0066cc;
}`,
  javascript: `// JavaScript program
console.log("Hello, World!");

function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
  react: `import React from 'react';

function App() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>Welcome to React!</p>
    </div>
  );
}

export default App;`
};

const PracticeEditor: React.FC<PracticeEditorProps> = ({ darkMode = false, onBack }) => {
  const [language, setLanguage] = useState<'c' | 'cpp' | 'python' | 'java' | 'html' | 'css' | 'javascript' | 'react'>('python');
  const [code, setCode] = useState(CODE_SNIPPETS.python);
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  // Update code when language changes
  useEffect(() => {
    setCode(CODE_SNIPPETS[language]);
    setOutput(''); // Clear output when switching languages
  }, [language]);

  const handleRun = async (codeToRun: string, inputText: string) => {
    setIsExecuting(true);
    setOutput('');

    try {
      const result = await codeExecutionService.executeCode({
        language: language as 'c' | 'cpp' | 'python', // Cast for now, will fix type
        code: codeToRun,
        stdin: inputText
      });
      
      if (result.success) {
        let formattedOutput = '';
        if (inputText.trim()) {
          formattedOutput = `Input:\n${inputText}\n\n`;
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

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Editor with language selector in toolbar */}
      <NeoGlassEditorCodeMirror
        value={code}
        onChange={setCode}
        language={language as 'c' | 'cpp' | 'python'} // Cast for now
        darkMode={darkMode}
        onRun={handleRun}
        isExecuting={isExecuting}
        output={output}
        title={`Practice Mode`}
        originalCode={CODE_SNIPPETS[language]}
        onBack={onBack}
        // Practice mode props
        showLanguageSelector={true}
        onLanguageChange={setLanguage}
        availableLanguages={['c', 'cpp', 'python', 'java']}
      />
    </div>
  );
};

export default PracticeEditor;
