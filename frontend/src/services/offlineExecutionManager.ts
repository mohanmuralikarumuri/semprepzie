// Offline Execution Manager for handling code execution in service worker
export class OfflineExecutionManager {
  private static instance: OfflineExecutionManager;
  private executionQueue: Array<{
    id: string;
    language: string;
    code: string;
    timestamp: number;
    resolve: (result: any) => void;
    reject: (error: any) => void;
  }> = [];

  static getInstance(): OfflineExecutionManager {
    if (!OfflineExecutionManager.instance) {
      OfflineExecutionManager.instance = new OfflineExecutionManager();
    }
    return OfflineExecutionManager.instance;
  }

  constructor() {
    this.setupServiceWorkerCommunication();
    this.setupNetworkListener();
  }

  // Setup communication with service worker
  private setupServiceWorkerCommunication(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CODE_EXECUTION_RESULT') {
          this.handleExecutionResult(event.data);
        }
      });
    }
  }

  // Listen for network changes
  private setupNetworkListener(): void {
    window.addEventListener('online', () => {
      console.log('Network online - processing queued executions');
      this.processQueuedExecutions();
    });

    window.addEventListener('offline', () => {
      console.log('Network offline - executions will be queued');
    });
  }

  // Queue execution for when network is available
  public async queueExecution(language: string, code: string): Promise<{ output: string; error?: string }> {
    return new Promise((resolve, reject) => {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.executionQueue.push({
        id: executionId,
        language,
        code,
        timestamp: Date.now(),
        resolve,
        reject
      });

      // Try to execute immediately if online
      if (navigator.onLine) {
        this.processQueuedExecutions();
      }

      // Set timeout for offline executions
      setTimeout(() => {
        const index = this.executionQueue.findIndex(item => item.id === executionId);
        if (index !== -1) {
          this.executionQueue.splice(index, 1);
          reject(new Error('Execution timeout - unable to compile code offline'));
        }
      }, 30000); // 30 second timeout
    });
  }

  // Process queued executions
  private async processQueuedExecutions(): Promise<void> {
    if (!navigator.onLine || this.executionQueue.length === 0) {
      return;
    }

    const currentQueue = [...this.executionQueue];
    this.executionQueue = [];

    for (const execution of currentQueue) {
      try {
        // Send to service worker for execution
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'EXECUTE_CODE',
            id: execution.id,
            language: execution.language,
            code: execution.code
          });
        } else {
          // Fallback: execute directly (this shouldn't happen in normal flow)
          execution.reject(new Error('Service worker not available'));
        }
      } catch (error) {
        execution.reject(error);
      }
    }
  }

  // Handle execution results from service worker
  private handleExecutionResult(data: any): void {
    const { id, result, error } = data;
    
    const execution = this.executionQueue.find(item => item.id === id);
    if (execution) {
      // Remove from queue
      const index = this.executionQueue.findIndex(item => item.id === id);
      this.executionQueue.splice(index, 1);

      if (error) {
        execution.reject(new Error(error));
      } else {
        execution.resolve(result);
      }
    }
  }

  // Check if execution can be done offline
  public canExecuteOffline(language: string): boolean {
    // Python can run offline with Pyodide
    // C/C++ requires online compilation or WASM (future enhancement)
    return language.toLowerCase() === 'python';
  }

  // Get queue status
  public getQueueStatus(): { pending: number; canExecuteOffline: boolean } {
    return {
      pending: this.executionQueue.length,
      canExecuteOffline: navigator.onLine || this.executionQueue.some(item => this.canExecuteOffline(item.language))
    };
  }

  // Clear old queued executions
  public clearOldExecutions(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    this.executionQueue = this.executionQueue.filter(item => {
      const isOld = now - item.timestamp > maxAge;
      if (isOld) {
        item.reject(new Error('Execution expired'));
      }
      return !isOld;
    });
  }
}

export const offlineExecutionManager = OfflineExecutionManager.getInstance();