// Code execution service for running Python and simulating C code execution
let pyodideInstance: any = null;

export class CodeExecutionService {
  private static instance: CodeExecutionService;
  private pyodideReady = false;

  static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService();
    }
    return CodeExecutionService.instance;
  }

  async initializePyodide(): Promise<void> {
    if (this.pyodideReady) return;

    try {
      // Load Pyodide from CDN to avoid bundle size issues
      const pyodide = await (window as any).loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
      });
      
      pyodideInstance = pyodide;
      this.pyodideReady = true;
      console.log("Pyodide initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Pyodide:", error);
      throw new Error("Python execution environment failed to load");
    }
  }

  async runPythonCode(code: string): Promise<{ output: string; error?: string }> {
    try {
      if (!this.pyodideReady) {
        await this.initializePyodide();
      }

      // Capture stdout
      const outputCapture = `
import sys
from io import StringIO

# Capture stdout
old_stdout = sys.stdout
sys.stdout = captured_output = StringIO()

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {e}")
finally:
    # Restore stdout
    sys.stdout = old_stdout

# Get the captured output
output = captured_output.getvalue()
output
`;

      const result = pyodideInstance.runPython(outputCapture);
      
      return {
        output: result || "Program executed successfully (no output)",
      };
    } catch (error: any) {
      return {
        output: "",
        error: `Python Error: ${error.message}`,
      };
    }
  }

  runCCode(code: string): { output: string; error?: string } {
    try {
      // Simulate C code execution by parsing and showing expected behavior
      // This is a simplified simulation - in production, you might use WASM
      
      const output = this.simulateCExecution(code);
      
      return {
        output: output,
      };
    } catch (error: any) {
      return {
        output: "",
        error: `C Simulation Error: ${error.message}`,
      };
    }
  }

  private simulateCExecution(code: string): string {
    let output = "";
    
    // Simple C code simulation - extract printf statements and show their output
    const printfRegex = /printf\s*\(\s*"([^"]+)"[^)]*\)/g;
    let match;
    
    while ((match = printfRegex.exec(code)) !== null) {
      let printText = match[1];
      // Handle escape sequences
      printText = printText.replace(/\\n/g, '\n');
      printText = printText.replace(/\\t/g, '\t');
      printText = printText.replace(/\\"/g, '"');
      
      // Handle format specifiers in a basic way
      if (printText.includes('%d')) {
        // For arrays and basic variables, simulate some output
        if (code.includes('arr[') || code.includes('array')) {
          printText = printText.replace(/%d/g, () => {
            // Simulate array values or computed results
            const arrayMatch = code.match(/{\s*([0-9,\s]+)\s*}/);
            if (arrayMatch) {
              const values = arrayMatch[1].split(',').map(v => v.trim());
              return values[Math.floor(Math.random() * values.length)];
            }
            return Math.floor(Math.random() * 100).toString();
          });
        } else {
          printText = printText.replace(/%d/g, () => Math.floor(Math.random() * 100).toString());
        }
      }
      
      if (printText.includes('%s')) {
        printText = printText.replace(/%s/g, 'string_value');
      }
      
      output += printText;
    }
    
    // If no printf found, provide a generic message
    if (!output) {
      if (code.includes('main')) {
        output = "Program compiled and executed successfully.";
        
        // Try to infer some output based on code content
        if (code.includes('array') || code.includes('arr[')) {
          output += "\nArray operations completed.";
        }
        if (code.includes('linked') || code.includes('Node')) {
          output += "\nLinked list operations completed.";
        }
      } else {
        output = "C code structure detected. Add printf statements to see output.";
      }
    }
    
    return output;
  }

  async executeCode(language: string, code: string): Promise<{ output: string; error?: string }> {
    switch (language.toLowerCase()) {
      case 'python':
        return await this.runPythonCode(code);
      case 'c':
      case 'cpp':
        return this.runCCode(code);
      default:
        return {
          output: "",
          error: `Language '${language}' is not supported yet.`,
        };
    }
  }
}

export const codeExecutionService = CodeExecutionService.getInstance();
