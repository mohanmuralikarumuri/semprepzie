import { APP_CONFIG } from '../constants';

/**
 * Validates if an email belongs to the authorized college domain
 * and if the student number is in the valid list
 */
export function validateCollegeEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Check if email ends with the college domain
  if (!email.endsWith(APP_CONFIG.ALLOWED_EMAIL_DOMAIN)) {
    return false;
  }

  // Extract student number from email
  const studentNumber = extractStudentNumber(email);
  
  // Check if student number is in the valid list
  return (APP_CONFIG.VALID_STUDENT_NUMBERS as readonly string[]).includes(studentNumber);
}

/**
 * Extracts student number from college email
 * e.g., 23701A05B8@aitsrajampet.ac.in -> 05B8
 */
export function extractStudentNumber(email: string): string {
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

/**
 * Extracts full student ID from email
 * e.g., 23701A05B8@aitsrajampet.ac.in -> 23701A05B8
 */
export function getStudentIdFromEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return email.split('@')[0].toUpperCase();
}

/**
 * Validates email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gets student information from email
 */
export function getStudentInfoFromEmail(email: string) {
  const isValid = validateCollegeEmail(email);
  const studentNumber = extractStudentNumber(email);
  const fullStudentId = getStudentIdFromEmail(email);
  
  return {
    isValid,
    studentNumber,
    fullStudentId,
    email: email.toLowerCase(),
    domain: APP_CONFIG.ALLOWED_EMAIL_DOMAIN,
  };
}
