/**
 * Code Execution Service
 * Handles execution of different programming languages
 */

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  logs?: string[];
  htmlOutput?: string;
}

export interface CodeExecutionRequest {
  code: string;
  language: 'html' | 'css' | 'javascript' | 'react' | 'nodejs';
  htmlCode?: string;
  cssCode?: string;
  dependencies?: Record<string, string>;
}

class CodeExecutionService {
  /**
   * Execute HTML/CSS/JavaScript code
   */
  executeHtmlCssJs(html: string, css: string, js: string): ExecutionResult {
    try {
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code Output</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            // Console capture
            (function() {
              const logs = [];
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;
              
              console.log = function(...args) {
                const message = args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                logs.push({ type: 'log', message });
                window.parent.postMessage({ type: 'console', level: 'log', data: message }, '*');
                originalLog.apply(console, args);
              };
              
              console.error = function(...args) {
                const message = args.map(arg => String(arg)).join(' ');
                logs.push({ type: 'error', message });
                window.parent.postMessage({ type: 'console', level: 'error', data: message }, '*');
                originalError.apply(console, args);
              };
              
              console.warn = function(...args) {
                const message = args.map(arg => String(arg)).join(' ');
                logs.push({ type: 'warn', message });
                window.parent.postMessage({ type: 'console', level: 'warn', data: message }, '*');
                originalWarn.apply(console, args);
              };
              
              // Error capture
              window.addEventListener('error', (e) => {
                const errorMsg = \`Error: \${e.message} at line \${e.lineno}:\${e.colno}\`;
                window.parent.postMessage({ type: 'error', data: errorMsg }, '*');
              });
              
              // Unhandled promise rejection
              window.addEventListener('unhandledrejection', (e) => {
                window.parent.postMessage({ type: 'error', data: \`Unhandled Promise: \${e.reason}\` }, '*');
              });
            })();
            
            // User code
            try {
              ${js}
            } catch (error) {
              console.error('Execution Error:', error.message);
            }
          </script>
        </body>
        </html>
      `;

      return {
        success: true,
        htmlOutput: fullHtml,
        logs: []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Prepare React code for execution
   */
  prepareReactCode(code: string): string {
    // Wrap code if it's just JSX
    if (!code.includes('function') && !code.includes('const') && !code.includes('class')) {
      return `
        function App() {
          return (
            ${code}
          );
        }
      `;
    }
    return code;
  }

  /**
   * Execute React code using Babel
   * Note: This requires @babel/standalone to be loaded
   */
  executeReact(code: string): ExecutionResult {
    try {
      // This will be executed in the component using Babel
      return {
        success: true,
        output: code,
        logs: []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute Node.js code (backend required)
   */
  async executeNodeJs(code: string): Promise<ExecutionResult> {
    try {
      const response = await fetch('/api/execute/nodejs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to execute Node.js code: ${error.message}`
      };
    }
  }

  /**
   * Validate code for security issues
   */
  validateCode(code: string): { valid: boolean; reason?: string } {
    // Check for dangerous patterns
    const dangerousPatterns = [
      /localStorage/i,
      /sessionStorage/i,
      /indexedDB/i,
      /fetch\s*\(/,
      /XMLHttpRequest/,
      /eval\s*\(/,
      /Function\s*\(/,
      /<iframe/i,
      /<script.*src=/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(code)) {
        return {
          valid: false,
          reason: `Code contains potentially unsafe pattern: ${pattern.toString()}`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Clean and sanitize code
   */
  sanitizeCode(code: string): string {
    // Remove any script tags with external sources
    return code
      .replace(/<script[^>]*src=[^>]*>/gi, '')
      .replace(/<iframe[^>]*>/gi, '')
      .trim();
  }
}

export const codeExecutionService = new CodeExecutionService();
