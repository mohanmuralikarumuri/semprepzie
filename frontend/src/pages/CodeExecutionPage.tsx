import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, Server, Code2 } from 'lucide-react';
import { supabase } from '../config/supabase';
import HtmlCssJsRunner from '../components/HtmlCssJsRunner';
import ReactRunner from '../components/ReactRunner';
import SemprepzieLoader from '../components/SemprepzieLoader';
import { 
  getProgramExecutionInfo, 
  getExecutionEnvironment,
  getUnsupportedMessage
} from '../services/programExecution.service';

interface LabProgram {
  id: string;
  program_name: string;
  description: string;
  code: string;
  html_code?: string;
  css_code?: string;
  language: string;
  execution_type?: string;
  subject_code: string;
}

interface Subject {
  code: string;
  name: string;
  description?: string;
}

const CodeExecutionPage: React.FC = () => {
  const { subjectId, programId } = useParams<{ subjectId: string; programId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode] = useState(false); // Can be replaced with theme context if needed
  
  const [program, setProgram] = useState<LabProgram | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Get navigation state to determine back route
  const navigationState = location.state as { from?: 'lab' | 'mincode' | 'dashboard'; subjectCode?: string; subjectName?: string } | null;

  useEffect(() => {
    fetchProgramData();
  }, [programId, subjectId]);

  const fetchProgramData = async () => {
    if (!programId || !subjectId) {
      setError('Invalid program or subject ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Determine which table to query based on URL path
      const isMinCode = window.location.pathname.includes('/mincode/');
      const tableName = isMinCode ? 'mincode_programs' : 'lab_programs';
      const subjectTableName = isMinCode ? 'mincode_subjects' : 'lab_subjects';

      // Fetch program data
      const { data: programData, error: programError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', programId)
        .eq('subject_code', subjectId)
        .single();

      if (programError) throw programError;
      if (!programData) throw new Error('Program not found');

      setProgram(programData);

      // Fetch subject data
      const { data: subjectData, error: subjectError } = await supabase
        .from(subjectTableName)
        .select('code, name, description')
        .eq('code', subjectId)
        .single();

      if (subjectError) throw subjectError;
      if (!subjectData) throw new Error('Subject not found');

      setSubject(subjectData);
    } catch (err: any) {
      console.error('Error fetching program:', err);
      setError(err.message || 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const renderExecutor = () => {
    if (!program) return null;

    const environment = getExecutionEnvironment(program.language);
    const executionInfo = getProgramExecutionInfo(program.language);

    // Client-side execution: React
    if (environment === 'client-react') {
      return (
        <ReactRunner
          code={program.code}
          autoRun={true}
        />
      );
    }

    // Client-side execution: HTML/CSS/JS
    if (environment === 'client-html') {
      return (
        <HtmlCssJsRunner
          html={program.html_code || ''}
          css={program.css_code || ''}
          js={program.code}
          autoRun={true}
        />
      );
    }

    // Backend execution required or unsupported
    return (
      <div className="space-y-4">
        <div className={`border-l-4 p-6 rounded-lg ${
          executionInfo.requiresBackend
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
            : 'bg-red-50 dark:bg-red-900/20 border-red-500'
        }`}>
          <div className={`flex items-center gap-2 font-semibold mb-2 ${
            executionInfo.requiresBackend
              ? 'text-yellow-800 dark:text-yellow-400'
              : 'text-red-800 dark:text-red-400'
          }`}>
            <AlertCircle className="w-5 h-5" />
            {executionInfo.displayName} Execution {executionInfo.requiresBackend ? 'Requires Backend Server' : 'Not Available'}
          </div>
          <p className={executionInfo.requiresBackend
            ? 'text-yellow-700 dark:text-yellow-300 mb-4'
            : 'text-red-700 dark:text-red-300 mb-4'
          }>
            {getUnsupportedMessage(program.language)}
          </p>
          {executionInfo.requiresBackend && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <Server className="w-4 h-4" />
              <span>Backend execution engine coming soon</span>
            </div>
          )}
        </div>

        {/* Code Preview */}
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-300 dark:border-gray-600 flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Code Preview</span>
            <span className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
              {program.language.toUpperCase()}
            </span>
          </div>
          <div className="bg-gray-900 p-4">
            <pre className="text-green-400 text-sm font-mono overflow-x-auto">
              {program.code}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <SemprepzieLoader />;
  }

  if (error) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-4`}>
        <div className="text-center">
          <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Program
          </h2>
          <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!program || !subject) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <p className={darkMode ? 'text-white' : 'text-gray-900'}>Program not found</p>
      </div>
    );
  }

  const handleBack = () => {
    if (navigationState?.from === 'dashboard') {
      // Navigate back to dashboard
      navigate('/dashboard', { replace: true });
    } else if (navigationState?.from === 'lab' && navigationState?.subjectCode) {
      // Navigate back to lab section with subject selected
      navigate('/lab', { 
        replace: true,
        state: { 
          selectedSubjectCode: navigationState.subjectCode,
          view: 'programs'
        }
      });
    } else if (navigationState?.from === 'mincode' && navigationState?.subjectCode) {
      // Navigate back to mincode section with subject selected
      navigate('/mincode', { 
        replace: true,
        state: { 
          selectedSubjectCode: navigationState.subjectCode,
          view: 'programs'
        }
      });
    } else if (navigationState?.from === 'lab') {
      navigate('/lab', { replace: true });
    } else if (navigationState?.from === 'mincode') {
      navigate('/mincode', { replace: true });
    } else {
      // Fallback to browser back
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-indigo-400/20 animate-float"
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
        
        {/* Navigation Bar - Back Button + Title */}
        <div className="rounded-2xl shadow-xl mb-4 transition-all duration-300 backdrop-blur-xl bg-gradient-to-br from-blue-50/95 via-indigo-50/95 to-purple-50/95 border border-gray-200/50 shadow-2xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 hover:scale-105 bg-white/60 hover:bg-white/80 text-gray-900 shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            
            <div className="flex-1 mx-4 text-center min-w-0 text-gray-900">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate px-2" title={program.program_name}>
                <span className="sm:hidden">{program.program_name.length > 15 ? program.program_name.substring(0, 15) + '...' : program.program_name}</span>
                <span className="hidden sm:inline">{program.program_name}</span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                {subject.name} • {program.language.toUpperCase()}
              </p>
            </div>

            <div className="w-[100px]"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Main Output Container */}
        <div className="rounded-2xl shadow-2xl overflow-hidden bg-white/40 backdrop-blur-2xl border border-white/50 shadow-xl">
          {renderExecutor()}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CodeExecutionPage;
