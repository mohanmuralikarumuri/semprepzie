import React, { useRef, useEffect, useState } from 'react';
import { Terminal, AlertCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface HtmlCssJsRunnerProps {
  html: string;
  css: string;
  js: string;
  autoRun?: boolean;
}

interface ConsoleLog {
  level: 'log' | 'error' | 'warn';
  message: string;
  timestamp: Date;
}

const HtmlCssJsRunner: React.FC<HtmlCssJsRunnerProps> = ({ 
  html, 
  css, 
  js,
  autoRun = false 
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [consoleExpanded, setConsoleExpanded] = useState(true);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setLogs(prev => [...prev, {
          level: event.data.level || 'log',
          message: event.data.data,
          timestamp: new Date()
        }]);
      } else if (event.data.type === 'error') {
        setLogs(prev => [...prev, {
          level: 'error',
          message: event.data.data,
          timestamp: new Date()
        }]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (autoRun && !hasExecuted) {
      runCode();
    }
  }, [autoRun, hasExecuted]);

  const runCode = () => {
    if (!iframeRef.current) return;

    setLogs([]);
    setHasExecuted(true);

    const fullCode = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Output</title>
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          ${css}
        </style>
      </head>
      <body>
        ${html}
        <script>
          (function() {
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = function(...args) {
              const message = args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ');
              window.parent.postMessage({ 
                type: 'console', 
                level: 'log', 
                data: message 
              }, '*');
              originalLog.apply(console, args);
            };
            
            console.error = function(...args) {
              const message = args.map(arg => String(arg)).join(' ');
              window.parent.postMessage({ 
                type: 'console', 
                level: 'error', 
                data: message 
              }, '*');
              originalError.apply(console, args);
            };
            
            console.warn = function(...args) {
              const message = args.map(arg => String(arg)).join(' ');
              window.parent.postMessage({ 
                type: 'console', 
                level: 'warn', 
                data: message 
              }, '*');
              originalWarn.apply(console, args);
            };
            
            window.addEventListener('error', (e) => {
              window.parent.postMessage({ 
                type: 'error', 
                data: \`Error: \${e.message} at \${e.filename}:\${e.lineno}:\${e.colno}\`
              }, '*');
              return false;
            });
            
            window.addEventListener('unhandledrejection', (e) => {
              window.parent.postMessage({ 
                type: 'error', 
                data: \`Unhandled Promise Rejection: \${e.reason}\`
              }, '*');
            });
          })();
          
          try {
            ${js}
          } catch (error) {
            console.error('Execution Error:', error.message, error.stack);
          }
        </script>
      </body>
      </html>
    `;

    try {
      // Use srcdoc instead of contentDocument to avoid cross-origin issues
      iframeRef.current.srcdoc = fullCode;
    } catch (error: any) {
      setLogs([{
        level: 'error',
        message: `Failed to execute code: ${error.message}`,
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  return (
    <div className="html-runner flex flex-col h-full w-full">
      {/* Main Container - Output takes 80vh, Console below */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* Output Frame - 80vh with white background */}
        <div className="output-frame border-2 border-gray-300 rounded-lg overflow-hidden bg-white flex flex-col" style={{ height: '80vh', minHeight: '400px' }}>
          <div className="bg-gray-100 px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-300 flex items-center gap-2 shrink-0">
            <div className="flex gap-1">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500"></div>
            </div>
            <span className="text-xs sm:text-sm text-gray-600 ml-1 font-medium">Output Preview</span>
          </div>
          <div className="flex-1 overflow-hidden bg-white">
            <iframe
              ref={iframeRef}
              title="Code Output"
              sandbox="allow-scripts allow-modals allow-forms allow-popups"
              className="w-full h-full bg-white border-none"
            />
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

export default HtmlCssJsRunner;
