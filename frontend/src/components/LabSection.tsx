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
    setSelectedProgram(program);
  };

  const handleBackToDashboard = () => {
    setSelectedProgram(null);
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
        <LabDashboard onSelectProgram={handleSelectProgram} />
      </div>
    </div>
  );
};

export default LabSection;
