// User Authentication Types
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  role: UserRole;
}

export type UserRole = 'student' | 'admin' | 'instructor';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  displayName?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  error?: string;
  requiresVerification?: boolean;
  isNewDevice?: boolean;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  url: string;
  googleDriveId?: string;
  fileSize?: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  category: DocumentCategory;
  tags: string[];
  isPublic: boolean;
  viewCount: number;
}

export type DocumentType = 'pdf' | 'doc' | 'docx' | 'ppt' | 'pptx' | 'xls' | 'xlsx' | 'txt';

export type DocumentCategory = 
  | 'lecture-notes' 
  | 'assignments' 
  | 'syllabus' 
  | 'reference-material' 
  | 'exam-papers' 
  | 'other';

export interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactFormValidation {
  name: boolean;
  email: boolean;
  message: boolean;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  error?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading State Types
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Device Management Types
export interface DeviceInfo {
  id: string;
  name: string;
  lastActive: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface DeviceSession {
  deviceId: string;
  email: string;
  isActive: boolean;
  loginTime: string;
  lastActivity: string;
}

// Lab System Types
export interface LabSubject {
  id: string;
  name: string;
  description: string;
  language: ProgrammingLanguage;
  codes: LabCode[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
}

export interface LabCode {
  id: string;
  title: string;
  description?: string;
  code: string;
  language: ProgrammingLanguage;
  subjectId: string;
  isTemplate: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

export type ProgrammingLanguage = 'c' | 'java' | 'python';

export interface CodeExecutionRequest {
  code: string;
  language: ProgrammingLanguage;
  input?: string;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
  memoryUsed?: string;
}

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: ProgrammingLanguage;
  readOnly?: boolean;
  theme?: 'dark' | 'light';
}

export interface LabSubjectFormData {
  name: string;
  description: string;
  language: ProgrammingLanguage;
}

export interface LabCodeFormData {
  title: string;
  description?: string;
  code: string;
  language: ProgrammingLanguage;
  tags: string[];
  isTemplate: boolean;
}
