import React, { useState, useEffect } from 'react';
import { Code, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface Subject {
  title: string;
  description: string;
  icon: string;
  categories: {
    [key: string]: {
      title: string;
      programs: Program[];
    };
  };
}

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

interface LabData {
  subjects: {
    [key: string]: Subject;
  };
}

interface LabDashboardProps {
  onSelectProgram: (program: Program) => void;
}

const LabDashboard: React.FC<LabDashboardProps> = ({ onSelectProgram }) => {
  const [labData, setLabData] = useState<LabData | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load lab programs data
    const loadLabData = async () => {
      try {
        const response = await fetch('/lab-programs/programs.json');
        const data = await response.json();
        setLabData(data);
      } catch (error) {
        console.error('Failed to load lab programs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLabData();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lab programs...</p>
        </div>
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load lab programs</p>
      </div>
    );
  }

  // Subject selection view
  if (!selectedSubject) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Programming Lab
          </h1>
          <p className="text-gray-600">
            Practice programming with interactive code execution
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(labData.subjects).map(([subjectKey, subject]) => (
            <div
              key={subjectKey}
              onClick={() => setSelectedSubject(subjectKey)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{subject.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {subject.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {subject.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {Object.keys(subject.categories).length} categories
                  </span>
                  <ArrowRight 
                    size={16} 
                    className="group-hover:translate-x-1 transition-transform" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentSubject = labData.subjects[selectedSubject];

  // Category selection view
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => setSelectedSubject(null)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to subjects
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentSubject.title}
            </h1>
            <p className="text-gray-600">{currentSubject.description}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(currentSubject.categories).map(([categoryKey, category]) => (
            <div
              key={categoryKey}
              onClick={() => setSelectedCategory(categoryKey)}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="text-blue-600" size={24} />
                <ArrowRight 
                  size={16} 
                  className="text-gray-400 group-hover:translate-x-1 transition-transform" 
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {category.title}
              </h3>
              
              <div className="text-sm text-gray-600">
                {category.programs.length} programs
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentCategory = currentSubject.categories[selectedCategory];

  // Programs list view
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          ← Back to categories
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {currentCategory.title}
          </h1>
          <p className="text-gray-600">
            {currentSubject.title} • {currentCategory.programs.length} programs
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {currentCategory.programs.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {program.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {program.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLanguageColor(program.language)}`}>
                    {program.language.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(program.difficulty)}`}>
                    {program.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center space-x-1">
                    <Clock size={12} />
                    <span>{program.estimatedTime}</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
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
              
              <button
                onClick={() => onSelectProgram(program)}
                className="ml-4 flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Code size={16} />
                <span>Start Coding</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabDashboard;
