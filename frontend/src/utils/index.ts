import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Student validation constants
const VALID_STUDENT_PATTERN = '23701a05';

// Validation functions
export function validateCollegeEmailShared(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check if email ends with the college domain
  if (!email.endsWith('@aitsrajampet.ac.in')) {
    return false;
  }

  // Extract the local part of email (before @)
  const localPart = email.split('@')[0].toLowerCase();
  
  // Check if email starts with the valid pattern
  return localPart.startsWith(VALID_STUDENT_PATTERN);
}

export function extractStudentNumberShared(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Extract the part before @ and get the last 4 characters
  const localPart = email.split('@')[0];
  if (localPart.length >= 4) {
    return localPart.slice(-4).toUpperCase();
  }
  
  return '';
}

export function getStudentIdFromEmailShared(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email.split('@')[0].toUpperCase();
}

export function isValidEmailFormatShared(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getStudentInfoFromEmailShared(email: string) {
  const isValid = validateCollegeEmailShared(email);
  const studentNumber = extractStudentNumberShared(email);
  const fullStudentId = getStudentIdFromEmailShared(email);
  
  return {
    isValid,
    studentNumber,
    fullStudentId,
    email: email.toLowerCase(),
    domain: '@aitsrajampet.ac.in',
  };
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCollegeEmail(email: string): boolean {
  return email.endsWith('@aitsrajampet.ac.in');
}

export function generateDeviceId(): string {
  return 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'absolute';
    textArea.style.left = '-999999px';
    document.body.prepend(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (error) {
      console.error('Failed to copy text: ', error);
    } finally {
      textArea.remove();
    }
    
    return Promise.resolve();
  }
}

export function downloadFile(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

export function getFileTypeFromMimeType(mimeType: string): string {
  const mimeToExtension: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
  };
  
  return mimeToExtension[mimeType] || 'unknown';
}
