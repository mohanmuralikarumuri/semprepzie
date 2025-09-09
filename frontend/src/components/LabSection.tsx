import React, { useState } from 'react';
import LabDashboard from './LabDashboard';
import ProgramEditor from './ProgramEditor';

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

const LabSection: React.FC = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleSelectProgram = (program: Program) => {
    console.log('Program selected:', program); // Debug log
    setSelectedProgram(program);
  };

  const handleBackToDashboard = () => {
    console.log('Going back to lab dashboard'); // Debug log
    setSelectedProgram(null);
  };

  console.log('LabSection render - selectedProgram:', selectedProgram); // Debug log

  // Test: Create a sample program for immediate testing
  const testProgram: Program = {
    id: 'test-program',
    title: 'Test Program',
    description: 'A simple test program',
    language: 'python',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    code: 'print("Hello, World!")\nprint("Lab section is working!")',
    expectedOutput: 'Hello, World!\nLab section is working!',
    concepts: ['testing', 'basic']
  };

  // Add a test button to directly open the editor
  const showTestEditor = () => {
    console.log('Test button clicked - opening editor directly');
    setSelectedProgram(testProgram);
  };

  if (selectedProgram) {
    return (
      <ProgramEditor
        program={selectedProgram}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">Debug Test</h3>
          <button
            onClick={showTestEditor}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Test Editor Direct Open
          </button>
        </div>
        <LabDashboard onSelectProgram={handleSelectProgram} />
      </div>
    </div>
  );
};

export default LabSection;
