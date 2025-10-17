// Frontend Code Execution Service
// All API keys are securely stored in backend
// This service only communicates with our backend endpoint

interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  provider?: string;
}

interface ExecutionRequest {
  language: 'c' | 'cpp' | 'python' | 'java';
  code: string;
  stdin?: string;
}

class CodeExecutionService {
  private static instance: CodeExecutionService;
  private executionCount: number = 0;

  static getInstance(): CodeExecutionService {
    if (!CodeExecutionService.instance) {
      CodeExecutionService.instance = new CodeExecutionService();
    }
    return CodeExecutionService.instance;
  }

  /**
   * Execute code via secure backend API
   * Backend handles provider rotation and API key management
   */
  async executeCode({ language, code, stdin = '' }: ExecutionRequest): Promise<ExecutionResult> {
    try {
      this.executionCount++;
      console.log(`[Execution #${this.executionCount}] Language: ${language}, Input length: ${stdin.length}`);

      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          code,
          stdin
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ExecutionResult = await response.json();
      
      console.log(`[Execution #${this.executionCount}] Provider used: ${result.provider}`);
      
      return result;
    } catch (error: any) {
      console.error(`[Execution #${this.executionCount}] Failed:`, error.message);
      return {
        success: false,
        output: '',
        error: error.message || 'Execution failed. Please try again.'
      };
    }
  }

  /**
   * Get execution statistics
   */
  getStats() {
    return {
      totalExecutions: this.executionCount
    };
  }

  /**
   * Reset execution count (for testing)
   */
  resetStats() {
    this.executionCount = 0;
  }
}

export const codeExecutionService = CodeExecutionService.getInstance();
export { CodeExecutionService };
