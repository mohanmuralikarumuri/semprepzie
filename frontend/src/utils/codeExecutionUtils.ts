// Enhanced code execution utilities and monitoring
export class CodeExecutionMonitor {
  private static instance: CodeExecutionMonitor;
  private executionHistory: Array<{
    language: string;
    timestamp: number;
    mode: 'online' | 'offline' | 'cached';
    success: boolean;
    executionTime: number;
  }> = [];

  static getInstance(): CodeExecutionMonitor {
    if (!CodeExecutionMonitor.instance) {
      CodeExecutionMonitor.instance = new CodeExecutionMonitor();
    }
    return CodeExecutionMonitor.instance;
  }

  // Track execution attempt
  trackExecution(
    language: string, 
    mode: 'online' | 'offline' | 'cached', 
    success: boolean, 
    executionTime: number
  ): void {
    this.executionHistory.push({
      language,
      timestamp: Date.now(),
      mode,
      success,
      executionTime
    });

    // Keep only last 100 executions
    if (this.executionHistory.length > 100) {
      this.executionHistory = this.executionHistory.slice(-100);
    }
  }

  // Get execution statistics
  getExecutionStats(): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    modeBreakdown: Record<string, number>;
    languageBreakdown: Record<string, number>;
  } {
    const total = this.executionHistory.length;
    if (total === 0) {
      return {
        totalExecutions: 0,
        successRate: 0,
        averageExecutionTime: 0,
        modeBreakdown: {},
        languageBreakdown: {}
      };
    }

    const successful = this.executionHistory.filter(e => e.success).length;
    const totalTime = this.executionHistory.reduce((sum, e) => sum + e.executionTime, 0);
    
    const modeBreakdown: Record<string, number> = {};
    const languageBreakdown: Record<string, number> = {};

    this.executionHistory.forEach(execution => {
      modeBreakdown[execution.mode] = (modeBreakdown[execution.mode] || 0) + 1;
      languageBreakdown[execution.language] = (languageBreakdown[execution.language] || 0) + 1;
    });

    return {
      totalExecutions: total,
      successRate: (successful / total) * 100,
      averageExecutionTime: totalTime / total,
      modeBreakdown,
      languageBreakdown
    };
  }

  // Check if online compilers are working
  async checkCompilerAPIsHealth(): Promise<{
    judge0: boolean;
    onecompiler: boolean;
    overall: 'healthy' | 'degraded' | 'down';
  }> {
    const results = {
      judge0: false,
      onecompiler: false,
      overall: 'down' as 'healthy' | 'degraded' | 'down'
    };

    try {
      // Test Judge0 API
      const judge0Response = await fetch('https://judge0-ce.p.rapidapi.com/languages', {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': 'demo-key',
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      });
      results.judge0 = judge0Response.ok;
    } catch (error) {
      console.warn('Judge0 API health check failed:', error);
    }

    try {
      // Test OneCompiler API
      const onecompilerResponse = await fetch('https://onecompiler.com/api/languages', {
        method: 'GET'
      });
      results.onecompiler = onecompilerResponse.ok;
    } catch (error) {
      console.warn('OneCompiler API health check failed:', error);
    }

    // Determine overall health
    if (results.judge0 && results.onecompiler) {
      results.overall = 'healthy';
    } else if (results.judge0 || results.onecompiler) {
      results.overall = 'degraded';
    } else {
      results.overall = 'down';
    }

    return results;
  }

  // Get recommendations for optimal execution
  getExecutionRecommendations(language: string): {
    preferredMode: 'online' | 'offline';
    reasoning: string;
    alternatives: string[];
  } {
    const isOnline = navigator.onLine;
    
    if (language === 'python') {
      return {
        preferredMode: 'offline',
        reasoning: 'Python executes reliably offline with Pyodide',
        alternatives: isOnline ? ['Online compilation for advanced libraries'] : ['Offline execution only']
      };
    }

    if (language === 'c' || language === 'cpp') {
      if (!isOnline) {
        return {
          preferredMode: 'offline',
          reasoning: 'Network unavailable - using simulation mode',
          alternatives: ['Connect to internet for real compilation']
        };
      }

      // Check recent success rate for online compilation
      const recentOnlineExecutions = this.executionHistory
        .filter(e => e.language === language && e.mode === 'online')
        .slice(-10);

      const onlineSuccessRate = recentOnlineExecutions.length > 0 
        ? (recentOnlineExecutions.filter(e => e.success).length / recentOnlineExecutions.length) * 100
        : 0;

      if (onlineSuccessRate > 80) {
        return {
          preferredMode: 'online',
          reasoning: 'Online compilation working well',
          alternatives: ['Offline simulation if compilation fails']
        };
      } else {
        return {
          preferredMode: 'offline',
          reasoning: 'Online compilation showing issues - using simulation',
          alternatives: ['Try online compilation', 'Check network connection']
        };
      }
    }

    return {
      preferredMode: 'online',
      reasoning: 'Default online execution',
      alternatives: ['Offline simulation for basic code']
    };
  }

  // Clear execution history
  clearHistory(): void {
    this.executionHistory = [];
  }

  // Export execution data for analysis
  exportExecutionData(): string {
    return JSON.stringify({
      executionHistory: this.executionHistory,
      stats: this.getExecutionStats(),
      exportTimestamp: Date.now()
    }, null, 2);
  }
}

// Utility functions for code execution enhancement
export const executionUtils = {
  // Optimize code before execution
  optimizeCode(language: string, code: string): string {
    let optimized = code.trim();

    if (language === 'python') {
      // Add basic optimizations for Python
      if (!optimized.includes('print(') && !optimized.includes('input(')) {
        // Add a simple print statement if there's no output
        optimized += '\nprint("Code executed successfully")';
      }
    } else if (language === 'c' || language === 'cpp') {
      // Ensure main function exists
      if (!optimized.includes('int main')) {
        optimized = `#include <stdio.h>\n\nint main() {\n${optimized.split('\n').map(line => '    ' + line).join('\n')}\n    return 0;\n}`;
      }
    }

    return optimized;
  },

  // Estimate execution complexity
  estimateComplexity(code: string): 'simple' | 'medium' | 'complex' {
    const lines = code.trim().split('\n').length;
    const hasLoops = /for\s*\(|while\s*\(|for\s+\w+\s+in/.test(code);
    const hasRecursion = /def\s+\w+.*:\s*.*\w+\s*\(/.test(code);
    const hasFileIO = /open\s*\(|fopen|iostream/.test(code);

    if (hasRecursion || hasFileIO || lines > 50) return 'complex';
    if (hasLoops || lines > 20) return 'medium';
    return 'simple';
  },

  // Generate cache key for consistent caching
  generateCacheKey(language: string, code: string): string {
    const normalizedCode = code.trim().replace(/\s+/g, ' ');
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < normalizedCode.length; i++) {
      const char = normalizedCode.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `${language}:${Math.abs(hash)}`;
  }
};

export const codeExecutionMonitor = CodeExecutionMonitor.getInstance();