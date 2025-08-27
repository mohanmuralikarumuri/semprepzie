// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SIGNUP: '/api/auth/signup',
    VERIFY_TOKEN: '/api/auth/verify-token',
    REFRESH_TOKEN: '/api/auth/refresh',
    RESET_PASSWORD: '/api/auth/reset-password',
    PROFILE: '/api/auth/profile',
  },
  
  // Documents
  DOCUMENTS: {
    LIST: '/api/documents',
    UPLOAD: '/api/documents/upload',
    VIEW: '/api/documents/view',
    DELETE: '/api/documents',
    METADATA: '/api/documents/metadata',
  },
  
  // Contact
  CONTACT: {
    SUBMIT: '/api/contact',
  },
  
  // Device Management
  DEVICES: {
    REGISTER: '/api/devices/register',
    LIST: '/api/devices',
    REVOKE: '/api/devices/revoke',
    CHECK_COUNT: '/api/devices/count',
  },
  
  // Health Check
  HEALTH: '/api/health',
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: 'Semprepzie',
  VERSION: '2.0.0',
  DESCRIPTION: 'Educational Document Management System',
  
  // Email Domain Restriction
  ALLOWED_EMAIL_DOMAIN: '@aitsrajampet.ac.in',
  
  // Valid student numbers for authentication
  VALID_STUDENT_NUMBERS: [
    '0501', '0567', '0568', '0569', '0570', '0571', '0572', '0573', '0574', '0575',
    '0576', '0577', '0578', '0579', '0580', '0581', '0582', '0583', '0584', '0585',
    '0586', '0587', '0588', '0589', '0590', '0591', '0592', '0593', '0594', '0595',
    '0596', '0597', '0598', '0599', '05A0', '05A1', '05A2', '05A3', '05A4', '05A5',
    '05A6', '05A7', '05A8', '05A9', '05B0', '05B1', '05B2', '05B3', '05B4', '05B5',
    '05B6', '05B7', '05C3', '05B8', '05B9', '05C0', '05C1', '05C2', '05C4', '05C5',
    '05C6', '05C7', '05C8', '05C9', '05D0', '05D1', '0510', '0511', '0512', '0513'
  ],
  
  // File Upload Limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
    CONTACT_FORM_MAX: 5,
  },
  
  // Session Configuration
  SESSION: {
    DURATION: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour
  },
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  PASSWORD: {
    MIN_LENGTH: 6,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: false,
    REQUIRE_LOWERCASE: false,
    REQUIRE_NUMBER: false,
    REQUIRE_SPECIAL: false,
  },
  
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s'-]+$/,
  },
  
  MESSAGE: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 1000,
  },
  
  DOCUMENT_TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Authentication Errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_NOT_VERIFIED: 'Please verify your email address',
    ACCOUNT_DISABLED: 'Your account has been disabled',
    TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please try again later',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password',
    EMAIL_EXISTS: 'An account with this email already exists',
    USER_NOT_FOUND: 'No account found with this email address',
    INVALID_TOKEN: 'Invalid or expired token',
    UNAUTHORIZED: 'You are not authorized to access this resource',
  },
  
  // Validation Errors
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_DOMAIN: 'Email must be from @aitsrajampet.ac.in domain',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long',
    NAME_TOO_SHORT: 'Name must be at least 2 characters long',
    MESSAGE_TOO_SHORT: 'Message must be at least 10 characters long',
    MESSAGE_TOO_LONG: 'Message cannot exceed 1000 characters',
    INVALID_FILE_TYPE: 'File type not supported',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit',
  },
  
  // Network Errors
  NETWORK: {
    CONNECTION_ERROR: 'Unable to connect to the server. Please check your internet connection',
    SERVER_ERROR: 'Server error occurred. Please try again later',
    TIMEOUT: 'Request timed out. Please try again',
    NOT_FOUND: 'The requested resource was not found',
  },
  
  // Document Errors
  DOCUMENTS: {
    UPLOAD_FAILED: 'Failed to upload document',
    NOT_FOUND: 'Document not found',
    ACCESS_DENIED: 'You do not have permission to access this document',
    PROCESSING_ERROR: 'Error processing document',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: 'Successfully logged in',
    LOGOUT_SUCCESS: 'Successfully logged out',
    SIGNUP_SUCCESS: 'Account created successfully. Please verify your email',
    PASSWORD_RESET_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
  },
  
  CONTACT: {
    MESSAGE_SENT: 'Your message has been sent successfully',
  },
  
  DOCUMENTS: {
    UPLOAD_SUCCESS: 'Document uploaded successfully',
    DELETE_SUCCESS: 'Document deleted successfully',
  },
} as const;

// Document Viewer Configuration
export const DOCUMENT_VIEWER = {
  // PDF.js Configuration
  PDFJS: {
    WORKER_SRC: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
    DEFAULT_SCALE: 1.2,
    MAX_SCALE: 3.0,
    MIN_SCALE: 0.5,
  },
  
  // Microsoft Office Online Viewer URLs
  OFFICE_VIEWER: {
    BASE_URL: 'https://view.officeapps.live.com/op/embed.aspx',
    SUPPORTED_TYPES: ['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  },
  
  // Google Drive Viewer
  GOOGLE_DRIVE: {
    VIEWER_URL: 'https://drive.google.com/file/d/{FILE_ID}/preview',
    DOWNLOAD_URL: 'https://drive.google.com/uc?id={FILE_ID}&export=download',
  },
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Animation Durations (in milliseconds)
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 400,
  },
  
  // Breakpoints (Tailwind CSS)
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
  
  // Z-Index Layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080,
  },
} as const;
