import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Student validation constants
const VALID_STUDENT_NUMBERS = [
  '0501', '0567', '0568', '0569', '0570', '0571', '0572', '0573', '0574', '0575',
  '0576', '0577', '0578', '0579', '0580', '0581', '0582', '0583', '0584', '0585',
  '0586', '0587', '0588', '0589', '0590', '0591', '0592', '0593', '0594', '0595',
  '0596', '0597', '0598', '0599', '05A0', '05A1', '05A2', '05A3', '05A4', '05A5',
  '05A6', '05A7', '05A8', '05A9', '05B0', '05B1', '05B2', '05B3', '05B4', '05B5',
  '05B6', '05B7', '05C3', '05B8', '05B9', '05C0', '05C1', '05C2', '05C4', '05C5',
  '05C6', '05C7', '05C8', '05C9', '05D0', '05D1', '0510', '0511', '0512', '0513'
];

// Validation functions
export function validateCollegeEmailShared(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check if email ends with the college domain
  if (!email.endsWith('@aitsrajampet.ac.in')) {
    return false;
  }

  // Extract student number from email
  const studentNumber = extractStudentNumberShared(email);
  
  // Check if student number is in the valid list
  return VALID_STUDENT_NUMBERS.includes(studentNumber);
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
