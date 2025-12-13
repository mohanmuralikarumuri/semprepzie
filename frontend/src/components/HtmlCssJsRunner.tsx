import React, { useRef, useEffect, useState } from 'react';
import { Terminal, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, Printer } from 'lucide-react';

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
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

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
      // Small delay to ensure iframe is ready
      setTimeout(() => runCode(), 100);
    }
  }, [autoRun, hasExecuted]);

  const runCode = () => {
    if (!iframeRef.current) return;

    setLogs([]);
    setHasExecuted(true);

    // Use template code if any section is empty
    const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>This is a sample web page.</p>
    <button id="btn">Click Me!</button>
</body>
</html>`;

    const defaultCss = `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

h1 {
    text-align: center;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    background: white;
    color: #667eea;
    border: none;
    border-radius: 5px;
}`;

    const defaultJs = `console.log('JavaScript is running!');

document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('btn');
    if (btn) {
        btn.addEventListener('click', function() {
            console.log('Button clicked!');
            alert('Hello from JavaScript!');
        });
    }
});`;

    // Use provided code or fall back to template
    const finalHtml = html && html.trim() ? html : defaultHtml;
    const finalCss = css && css.trim() ? css : defaultCss;
    const finalJs = js && js.trim() ? js : defaultJs;

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
          ${finalCss}
        </style>
      </head>
      <body>
        ${finalHtml}
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
            ${finalJs}
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

  const handlePrint = () => {
    if (!iframeRef.current) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Get the iframe content
    const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
    if (!iframeDoc) return;
    
    // Create print document with code and output
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Output Print - Semprepzie</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .code-section { margin-bottom: 30px; page-break-inside: avoid; }
            .code-section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; }
            code { font-family: 'Courier New', monospace; font-size: 12px; }
            .output-section { margin-top: 30px; border: 2px solid #ddd; padding: 20px; min-height: 400px; }
            .output-section h2 { color: #333; margin-bottom: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>Semprepzie - Code Output</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="code-section">
          <h2>HTML Code</h2>
          <pre><code>${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
        
        <div class="code-section">
          <h2>CSS Code</h2>
          <pre><code>${css.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
        
        <div class="code-section">
          <h2>JavaScript Code</h2>
          <pre><code>${js.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
        
        <div class="output-section">
          <h2>Output Preview (Desktop View)</h2>
          ${iframeDoc.documentElement.innerHTML}
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
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
            
            {/* Viewport Controls */}
            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`p-1 sm:p-1.5 rounded transition-colors ${
                  viewportMode === 'desktop' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`p-1 sm:p-1.5 rounded transition-colors ${
                  viewportMode === 'tablet' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`p-1 sm:p-1.5 rounded transition-colors ${
                  viewportMode === 'mobile' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title="Mobile View (375px)"
              >
                <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              
              {/* Divider */}
              <div className="h-5 w-px bg-gray-300 mx-1"></div>
              
              {/* Print Button */}
              <button
                onClick={handlePrint}
                className="p-1 sm:p-1.5 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
                title="Print Output (PDF)"
              >
                <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-2 sm:p-4">
            <div 
              className="bg-white shadow-lg transition-all duration-300"
              style={{ 
                width: getViewportWidth(),
                minHeight: '100%',
                maxWidth: '100%'
              }}
            >
              <iframe
                ref={iframeRef}
                title="Code Output"
                sandbox="allow-scripts allow-modals allow-forms allow-popups"
                className="w-full h-full bg-white border-none"
                style={{ minHeight: '600px' }}
              />
            </div>
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
