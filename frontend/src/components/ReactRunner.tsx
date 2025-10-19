import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Terminal, Loader, ChevronDown, ChevronUp } from 'lucide-react';

interface ReactRunnerProps {
  code: string;
  autoRun?: boolean;
}

interface ConsoleLog {
  level: 'log' | 'error' | 'warn';
  message: string;
  timestamp: Date;
}

const ReactRunner: React.FC<ReactRunnerProps> = ({ code, autoRun = false }) => {
  const [Component, setComponent] = useState<React.FC | null>(null);
  const [error, setError] = useState<string>('');
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [babelLoaded, setBabelLoaded] = useState(false);
  const [consoleExpanded, setConsoleExpanded] = useState(true);

  // Load Babel standalone
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).Babel) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@babel/standalone@7.23.5/babel.min.js';
      script.async = true;
      script.onload = () => setBabelLoaded(true);
      script.onerror = () => {
        setError('Failed to load Babel compiler');
        setBabelLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setBabelLoaded(true);
    }
  }, []);

  // Setup console capture
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args: any[]) => {
      setLogs(prev => [...prev, {
        level: 'log',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' '),
        timestamp: new Date()
      }]);
      originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      setLogs(prev => [...prev, {
        level: 'error',
        message: args.map(arg => String(arg)).join(' '),
        timestamp: new Date()
      }]);
      originalError.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      setLogs(prev => [...prev, {
        level: 'warn',
        message: args.map(arg => String(arg)).join(' '),
        timestamp: new Date()
      }]);
      originalWarn.apply(console, args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    if (autoRun && babelLoaded && !hasExecuted) {
      runCode();
    }
  }, [autoRun, babelLoaded, hasExecuted]);

  const runCode = () => {
    if (!babelLoaded) {
      setError('Babel compiler is not loaded yet. Please wait...');
      return;
    }

    setIsRunning(true);
    setError('');
    setLogs([]);
    setComponent(null);
    setHasExecuted(true);

    try {
      const Babel = (window as any).Babel;
      
      // Prepare code
      let codeToExecute = code.trim();
      
      // If code doesn't export or define a component, wrap it
      if (!codeToExecute.includes('export default') && 
          !codeToExecute.includes('function App') &&
          !codeToExecute.includes('const App')) {
        codeToExecute = `
          function App() {
            ${codeToExecute}
          }
        `;
      }

      // Transform JSX to JavaScript
      const transformed = Babel.transform(codeToExecute, {
        presets: ['react', 'env'],
        filename: 'code.jsx'
      }).code;

      // Create a safe execution context
      const createComponent = new Function(
        'React',
        'useState',
        'useEffect',
        'useRef',
        'useCallback',
        'useMemo',
        `
          ${transformed}
          
          // Return the component (handle different export patterns)
          if (typeof App !== 'undefined') {
            return App;
          } else if (typeof Component !== 'undefined') {
            return Component;
          } else {
            // Try to find any function component
            const keys = Object.keys(this).filter(key => 
              typeof this[key] === 'function' && 
              key[0] === key[0].toUpperCase()
            );
            if (keys.length > 0) {
              return this[keys[0]];
            }
          }
          
          throw new Error('No React component found. Make sure to define a component named "App" or "Component".');
        `
      );

      const NewComponent = createComponent(
        React,
        useState,
        useEffect,
        useRef,
        React.useCallback,
        React.useMemo
      );

      if (!NewComponent) {
        throw new Error('Failed to create component');
      }

      setComponent(() => NewComponent);
      setIsRunning(false);
    } catch (err: any) {
      setError(err.message || 'Failed to execute React code');
      setComponent(null);
      setIsRunning(false);
      
      setLogs(prev => [...prev, {
        level: 'error',
        message: err.stack || err.message,
        timestamp: new Date()
      }]);
    }
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Terminal className="w-4 h-4 text-green-500" />;
    }
  };

  if (!babelLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading React compiler...</span>
      </div>
    );
  }

  return (
    <div className="react-runner flex flex-col h-full w-full">
      {/* Main Container - Output takes 80vh, Console below */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Output - 80vh with white background */}
        <div className="output-frame border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col" style={{ height: '80vh', minHeight: '400px' }}>
          <div className="bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-300 flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs sm:text-sm text-gray-600 ml-1 font-medium">React Component Output</span>
          </div>
          <div className="p-3 sm:p-4 lg:p-6 bg-white overflow-auto flex-1">
            {error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded">
                <div className="flex items-center gap-2 text-red-800 font-semibold mb-2 text-sm sm:text-base">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Execution Error
                </div>
                <pre className="text-xs sm:text-sm text-red-700 whitespace-pre-wrap font-mono overflow-auto">
                  {error}
                </pre>
              </div>
            ) : Component ? (
              <ErrorBoundary>
                <Component />
              </ErrorBoundary>
            ) : (
              <div className="text-center text-gray-500 py-8 sm:py-12">
                {isRunning ? (
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="text-xs sm:text-sm">Compiling React code...</span>
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm">React component will render here...</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Console Output - Below output, scrollable */}
        <div className="console-output border-2 border-gray-300 rounded-lg overflow-hidden flex flex-col mt-4 max-h-[300px]">
          <div 
            className="bg-gray-900 px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2 shrink-0 cursor-pointer"
            onClick={() => setConsoleExpanded(!consoleExpanded)}
          >
            <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
            <span className="text-xs sm:text-sm text-green-400 font-mono">Console</span>
            {logs.length > 0 && (
              <span className="text-xs text-gray-500 ml-1">({logs.length})</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {logs.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogs([]);
                  }}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
              <button className="text-gray-400">
                {consoleExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {consoleExpanded && (
            <div 
              className="bg-gray-950 text-gray-300 p-2 sm:p-3 font-mono text-xs sm:text-sm overflow-y-auto overflow-x-hidden flex-1"
              style={{ maxHeight: 'calc(40vh - 36px)' }}
            >
              {logs.length === 0 ? (
                <div className="text-gray-500 italic text-xs sm:text-sm">Console output will appear here...</div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start gap-1.5 py-0.5 sm:py-1 text-xs sm:text-sm ${
                      log.level === 'error' ? 'text-red-400' : 
                      log.level === 'warn' ? 'text-yellow-400' : 
                      'text-green-400'
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">{getLogIcon(log.level)}</span>
                    <span className="flex-1 break-all leading-tight">{log.message}</span>
                    <span className="text-xs text-gray-600 shrink-0 hidden sm:inline">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Error Boundary to catch React component errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
            <AlertCircle className="w-5 h-5" />
            Component Error
          </div>
          <pre className="text-sm text-red-700 whitespace-pre-wrap font-mono">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ReactRunner;
