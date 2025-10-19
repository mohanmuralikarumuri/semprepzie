/**
 * Program Execution Service
 * Handles routing and execution logic for different programming languages
 */

export type ProgramLanguage = 
  | 'html' | 'css' | 'javascript' | 'typescript'
  | 'react' | 'jsx' | 'tsx'
  | 'python' | 'java' | 'c' | 'cpp' | 'csharp'
  | 'nodejs' | 'php' | 'ruby' | 'go' | 'rust';

export type ExecutionEnvironment = 
  | 'client-html'      // HTML/CSS/JS in iframe
  | 'client-react'     // React components with Babel
  | 'server-python'    // Python backend execution
  | 'server-java'      // Java backend execution
  | 'server-c'         // C/C++ backend execution
  | 'server-nodejs'    // Node.js backend execution
  | 'server-other'     // Other backend languages
  | 'unsupported';     // Not yet supported

export interface ProgramExecutionInfo {
  environment: ExecutionEnvironment;
  canExecute: boolean;
  requiresBackend: boolean;
  displayName: string;
  icon: string;
}

/**
 * Determine execution environment based on language
 */
export const getExecutionEnvironment = (language: string): ExecutionEnvironment => {
  const lang = language.toLowerCase().trim();

  // Client-side web languages
  if (lang === 'html' || lang === 'css' || lang === 'javascript' || lang === 'js' || lang === 'typescript' || lang === 'ts') {
    return 'client-html';
  }

  // React
  if (lang === 'react' || lang === 'jsx' || lang === 'tsx') {
    return 'client-react';
  }

  // Server-side languages
  if (lang === 'python' || lang === 'py') {
    return 'server-python';
  }

  if (lang === 'java') {
    return 'server-java';
  }

  if (lang === 'c' || lang === 'cpp' || lang === 'c++' || lang === 'csharp' || lang === 'cs') {
    return 'server-c';
  }

  if (lang === 'nodejs' || lang === 'node') {
    return 'server-nodejs';
  }

  if (lang === 'php' || lang === 'ruby' || lang === 'go' || lang === 'rust') {
    return 'server-other';
  }

  return 'unsupported';
};

/**
 * Get execution information for a program
 */
export const getProgramExecutionInfo = (language: string): ProgramExecutionInfo => {
  const environment = getExecutionEnvironment(language);

  const info: Record<ExecutionEnvironment, Omit<ProgramExecutionInfo, 'environment'>> = {
    'client-html': {
      canExecute: true,
      requiresBackend: false,
      displayName: 'HTML/CSS/JavaScript',
      icon: '🌐'
    },
    'client-react': {
      canExecute: true,
      requiresBackend: false,
      displayName: 'React',
      icon: '⚛️'
    },
    'server-python': {
      canExecute: false,
      requiresBackend: true,
      displayName: 'Python',
      icon: '🐍'
    },
    'server-java': {
      canExecute: false,
      requiresBackend: true,
      displayName: 'Java',
      icon: '☕'
    },
    'server-c': {
      canExecute: false,
      requiresBackend: true,
      displayName: 'C/C++',
      icon: '⚙️'
    },
    'server-nodejs': {
      canExecute: false,
      requiresBackend: true,
      displayName: 'Node.js',
      icon: '🟢'
    },
    'server-other': {
      canExecute: false,
      requiresBackend: true,
      displayName: language.toUpperCase(),
      icon: '📦'
    },
    'unsupported': {
      canExecute: false,
      requiresBackend: false,
      displayName: language,
      icon: '❓'
    }
  };

  return {
    environment,
    ...info[environment]
  };
};

/**
 * Check if a program can be executed
 */
export const canExecuteProgram = (language: string): boolean => {
  const info = getProgramExecutionInfo(language);
  return info.canExecute;
};

/**
 * Check if a language requires backend execution
 */
export const requiresBackendExecution = (language: string): boolean => {
  const info = getProgramExecutionInfo(language);
  return info.requiresBackend;
};

/**
 * Get appropriate error message for unsupported languages
 */
export const getUnsupportedMessage = (language: string): string => {
  const info = getProgramExecutionInfo(language);
  
  if (!info.requiresBackend && !info.canExecute) {
    return `${info.displayName} execution is not yet supported.`;
  }
  
  if (info.requiresBackend) {
    return `${info.displayName} programs require a backend server to execute. This feature is coming soon.`;
  }
  
  return 'This program cannot be executed at the moment.';
};

/**
 * Detect language from code content as fallback
 */
export const detectLanguageFromCode = (code: string): ExecutionEnvironment => {
  const codeContent = code.toLowerCase();

  // React detection
  if (codeContent.includes('react.') || 
      codeContent.includes('usestate') || 
      codeContent.includes('useeffect') ||
      codeContent.includes('import react')) {
    return 'client-react';
  }

  // Node.js detection
  if (codeContent.includes('require(') || 
      codeContent.includes('module.exports') ||
      codeContent.includes('process.')) {
    return 'server-nodejs';
  }

  // Python detection
  if (codeContent.includes('def ') || 
      codeContent.includes('import ') ||
      codeContent.includes('print(')) {
    return 'server-python';
  }

  // Java detection
  if (codeContent.includes('public class') || 
      codeContent.includes('public static void main')) {
    return 'server-java';
  }

  // C/C++ detection
  if (codeContent.includes('#include') || 
      codeContent.includes('int main(')) {
    return 'server-c';
  }

  // Default to HTML/JS
  return 'client-html';
};
